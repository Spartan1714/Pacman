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
    const speed = 2.0 + (level * 0.2);
    // IMPORTANTE: Posiciones iniciales exactas y direcciones distintas a 0
    ghosts = [
        { x: 18, y: 1, vX: 18, vY: 1, dirX: -1, dirY: 0, color: "red", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, vX: 1, vY: 8, dirX: 1, dirY: 0, color: "pink", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, vX: 18, vY: 8, dirX: -1, dirY: 0, color: "cyan", mode: "random", dead: false, speed: speed }
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

        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;

        // Guardamos la posición antes de mover
        let prevX = g.x;
        let prevY = g.y;

        // Movemos
        g.x += g.dirX * actualSpeed * dt;
        g.y += g.dirY * actualSpeed * dt;

        // DETECCIÓN DE CRUCE DE CELDA:
        // Si al movernos hemos cruzado la frontera de un número entero, 
        // significa que estamos parados justo sobre una baldosa.
        if (Math.floor(prevX) !== Math.floor(g.x) || Math.floor(prevY) !== Math.floor(g.y) || (g.dirX === 0 && g.dirY === 0)) {
            
            // Forzamos posición exacta en la rejilla para evitar errores acumulados
            let gridX = Math.round(g.x);
            let gridY = Math.round(g.y);

            // Buscamos opciones de movimiento
            let options = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(opt => {
                // No puede ser un muro
                if (map[gridY + opt.dy]?.[gridX + opt.dx] === 1) return false;
                // No puede darse la vuelta 180 grados si hay más opciones
                if (opt.dx === -g.dirX && opt.dy === -g.dirY) return false;
                return true;
            });

            // Si llegamos a un rincón sin salida (solo puede volver atrás)
            if (options.length === 0) {
                options = [{dx: -g.dirX, dy: -g.dirY}];
            }

            let choice;
            if (g.mode === "berserker" && !powerMode) {
                // Ordenar por distancia Euclidiana a Pac-Man
                choice = options.sort((a, b) => 
                    Math.hypot((gridX + a.dx) - pacman.x, (gridY + a.dy) - pacman.y) - 
                    Math.hypot((gridX + b.dx) - pacman.x, (gridY + b.dy) - pacman.y)
                )[0];
            } else {
                choice = options[Math.floor(Math.random() * options.length)];
            }

            if (choice) {
                g.dirX = choice.dx;
                g.dirY = choice.dy;
                // Alineamos perfectamente al fantasma en la baldosa al decidir
                g.x = gridX;
                g.y = gridY;
            }
        }

        // Actualizar posición visual
        g.vX = g.x;
        g.vY = g.y;

        // Colisión: Distancia menor a 0.7 baldosas
        let dist = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        if (dist < 0.7) {
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
        
        // Cuerpo estilizado
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