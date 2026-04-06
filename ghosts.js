import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function spawnGhosts(level = 1) {
    const speed = 2.0 + (level * 0.2); // Velocidad base
    ghosts = [
        // Es vital que nazcan con una dirección (dirX) para que el motor arranque
        { x: 18, y: 1, vX: 18, vY: 1, dirX: -1, dirY: 0, color: "red", mode: "berserker", dead: false, lastDx: -1, lastDy: 0, speed: speed },
        { x: 1, y: 8, vX: 1, vY: 8, dirX: 1, dirY: 0, color: "pink", mode: "random", dead: false, lastDx: 1, lastDy: 0, speed: speed },
        { x: 18, y: 8, vX: 18, vY: 8, dirX: -1, dirY: 0, color: "cyan", mode: "random", dead: false, lastDx: -1, lastDy: 0, speed: speed }
    ];
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        // 1. CÁLCULO DE MOVIMIENTO
        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;
        
        // Guardamos posición anterior para la lógica de "cruzar el centro"
        let oldX = g.x;
        let oldY = g.y;

        // Movemos al fantasma
        g.x += g.dirX * actualSpeed * dt;
        g.y += g.dirY * actualSpeed * dt;

        // 2. LÓGICA DE INTERSECCIÓN (Solo decide cuando cruza el centro de una baldosa)
        let centerX = Math.round(g.x);
        let centerY = Math.round(g.y);

        // Si el fantasma ha cruzado o está muy cerca del centro de la baldosa
        if (Math.abs(g.x - centerX) < 0.1 && Math.abs(g.y - centerY) < 0.1) {
            
            // Obtener direcciones posibles (que no sean muros)
            let moves = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(m => {
                let targetX = centerX + m.dx;
                let targetY = centerY + m.dy;
                return map[targetY] && map[targetY][targetX] !== 1;
            });

            // Evitar que den la vuelta 180° si hay más opciones (callejones)
            if (moves.length > 1) {
                moves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            }

            let choice;
            if (g.mode === "berserker" && !powerMode) {
                // El Rojo persigue: elige el movimiento que lo acerque más a Pac-Man
                choice = moves.sort((a, b) => 
                    Math.hypot((centerX + a.dx) - pacman.x, (centerY + a.dy) - pacman.y) - 
                    Math.hypot((centerX + b.dx) - pacman.x, (centerY + b.dy) - pacman.y)
                )[0];
            } else {
                // Los demás eligen al azar
                choice = moves[Math.floor(Math.random() * moves.length)];
            }

            if (choice) {
                // Si va a girar o seguir, alineamos al centro exacto para evitar que se "desvíe"
                if (choice.dx !== g.dirX || choice.dy !== g.dirY) {
                    g.x = centerX;
                    g.y = centerY;
                }
                g.dirX = choice.dx;
                g.dirY = choice.dy;
                g.lastDx = choice.dx;
                g.lastDy = choice.dy;
            } else {
                // Si no hay salida (no debería pasar), se detiene y busca de nuevo
                g.dirX = 0; g.dirY = 0;
            }
        }

        // 3. ACTUALIZACIÓN VISUAL
        g.vX = g.x;
        g.vY = g.y;

        // 4. COLISIÓN CON PAC-MAN
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.7) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else {
                lives.value--;
                resetPlayer(); 
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.vX * TILE_SIZE, y = oy + g.vY * TILE_SIZE, s = TILE_SIZE;
        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
        
        // Cuerpo
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.85, y + s*0.9);
        ctx.lineTo(x + s*0.65, y + s*0.75);
        ctx.lineTo(x + s*0.5, y + s*0.9);
        ctx.lineTo(x + s*0.35, y + s*0.75);
        ctx.lineTo(x + s*0.15, y + s*0.9);
        ctx.fill();
        
        // Ojos
        ctx.fillStyle = "white"; ctx.shadowBlur = 0;
        ctx.beginPath(); 
        ctx.arc(x + s*0.35, y + s*0.4, s*0.1, 0, 7); 
        ctx.arc(x + s*0.65, y + s*0.4, s*0.1, 0, 7); 
        ctx.fill();
        ctx.restore();
    });
}