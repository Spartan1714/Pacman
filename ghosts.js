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
    // Aumentamos ligeramente la velocidad por nivel
    const speed = 2.5 + (level * 0.2);
    
    ghosts = [
        // CLAVE: Les damos una dirección inicial (dirX: -1 o 1) para que el motor los mueva desde el segundo 1
        { x: 18, y: 1, vX: 18, vY: 1, dirX: -1, dirY: 0, color: "red", mode: "berserker", dead: false, lastDx: -1, lastDy: 0, speed: speed },
        { x: 1, y: 8, vX: 1, vY: 8, dirX: 1, dirY: 0, color: "pink", mode: "random", dead: false, lastDx: 1, lastDy: 0, speed: speed },
        { x: 18, y: 8, vX: 18, vY: 8, dirX: -1, dirY: 0, color: "cyan", mode: "random", dead: false, lastDx: -1, lastDy: 0, speed: speed }
    ];
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

export function updateGhosts(lives, score, dt) {
    if (!dt) return; // Evita saltos si el dt es nulo

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        // 1. LÓGICA DE DECISIÓN (Cuando están en el centro de una baldosa)
        let centerX = Math.round(g.x);
        let centerY = Math.round(g.y);

        if (Math.abs(g.x - centerX) < 0.1 && Math.abs(g.y - centerY) < 0.1) {
            // Buscamos caminos posibles (que no sean muros)
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => 
                map[centerY + m.dy]?.[centerX + m.dx] !== 1
            );

            // Evitamos que el fantasma se dé la vuelta 180° si tiene otras opciones
            if (moves.length > 1) {
                moves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            }

            let choice;
            if (g.mode === "berserker" && !powerMode) {
                // El rojo persigue a Pac-Man buscando la distancia más corta
                choice = moves.sort((a, b) => 
                    Math.hypot((centerX + a.dx) - pacman.x, (centerY + a.dy) - pacman.y) - 
                    Math.hypot((centerX + b.dx) - pacman.x, (centerY + b.dy) - pacman.y)
                )[0];
            } else {
                // Los demás eligen dirección al azar
                choice = moves[Math.floor(Math.random() * moves.length)];
            }
            
            if (choice) {
                g.dirX = choice.dx; 
                g.dirY = choice.dy;
                g.lastDx = choice.dx; 
                g.lastDy = choice.dy;
                g.x = centerX; g.y = centerY; // Ajuste de posición a la rejilla
            }
        }
        
        // 2. MOVIMIENTO REAL
        // Si hay powerMode, van a la mitad de velocidad
        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;
        
        g.x += (g.dirX || 0) * actualSpeed * dt;
        g.y += (g.dirY || 0) * actualSpeed * dt;
        
        // vX y vY se actualizan para que drawGhosts los dibuje en la posición correcta
        g.vX = g.x; 
        g.vY = g.y;

        // 3. COLISIÓN (La revisamos aquí también)
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.7) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else {
                lives.value--;
                resetPlayer(); // Asegúrate de que player.js exporte esta función
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
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.85, y + s*0.9);
        ctx.lineTo(x + s*0.65, y + s*0.75);
        ctx.lineTo(x + s*0.5, y + s*0.9);
        ctx.lineTo(x + s*0.35, y + s*0.75);
        ctx.lineTo(x + s*0.15, y + s*0.9);
        ctx.fill();
        ctx.fillStyle = "white"; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(x + s*0.35, y + s*0.4, s*0.1, 0, 7); 
        ctx.arc(x + s*0.65, y + s*0.4, s*0.1, 0, 7); ctx.fill();
        ctx.restore();
    });
}