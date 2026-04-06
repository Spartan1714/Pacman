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
    // Posiciones iniciales exactas en el centro de la baldosa
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
    if (!dt || dt > 0.1) return; // Ignorar saltos grandes de tiempo

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;

        // 1. ALINEACIÓN DE EJE (Evita que se detengan por rozar paredes laterales)
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        // 2. MOVIMIENTO
        let nextX = g.x + g.dirX * actualSpeed * dt;
        let nextY = g.y + g.dirY * actualSpeed * dt;

        // 3. DETECCIÓN DE INTERSECCIÓN (¿Cruzamos el centro de una baldosa?)
        if (Math.floor(g.x) !== Math.floor(nextX) || Math.floor(g.y) !== Math.floor(nextY)) {
            let gridX = Math.round(nextX);
            let gridY = Math.round(nextY);

            // Buscar todas las direcciones posibles excepto volver atrás
            let options = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(opt => {
                let tx = gridX + opt.dx;
                let ty = gridY + opt.dy;
                // No es muro y no es dirección opuesta
                return map[ty]?.[tx] !== 1 && (opt.dx !== -g.dirX || opt.dy !== -g.dirY);
            });

            // Si es un callejón sin salida, permitir volver atrás
            if (options.length === 0) {
                options = [{dx: -g.dirX, dy: -g.dirY}];
            }

            let choice;
            if (g.mode === "berserker" && !powerMode) {
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
                g.x = gridX; // Snap a la rejilla
                g.y = gridY;
            }
        } else {
            // Si no hay cambio de celda, simplemente avanzamos
            g.x = nextX;
            g.y = nextY;
        }

        // Actualizar visuales
        g.vX = g.x;
        g.vY = g.y;

        // Colisión con Pac-Man
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.6) {
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
        
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.85, y + s*0.9);
        ctx.lineTo(x + s*0.65, y + s*0.75);
        ctx.lineTo(x + s*0.5, y + s*0.9);
        ctx.lineTo(x + s*0.35, y + s*0.75);
        ctx.lineTo(x + s*0.15, y + s*0.9);
        ctx.fill();
        
        ctx.fillStyle = "white"; ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.4, s*0.1, 0, 7);
        ctx.arc(x + s*0.65, y + s*0.4, s*0.1, 0, 7);
        ctx.fill();
        ctx.restore();
    });
}