import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [
    { x: 18, y: 8, vX: 18, vY: 8, lastDx: 0, lastDy: 0, color: "red", mode: "berserker", timer: 0 },
    { x: 1, y: 8, vX: 1, vY: 8, lastDx: 0, lastDy: 0, color: "pink", mode: "random", timer: 0 },
    { x: 18, y: 1, vX: 18, vY: 1, lastDx: 0, lastDy: 0, color: "cyan", mode: "random", timer: 0 }
];

export let powerMode = false;
let powerTimer = 0;

// --- CONTROL DE VELOCIDAD DE FANTASMAS ---
// Sube este número para que los fantasmas vayan MÁS LENTO (ej: 18)
// El 14 los hace un poco más lentos que a Pac-Man (que estaba en 12)
const GHOST_SPEED_DIVIDER = 14; 

export function spawnGhosts(level) {
    // Reiniciar posiciones si es necesario al subir de nivel
}

export function activatePower() {
    powerMode = true;
    powerTimer = 600; // Duración del poder
}

export function allGhostsDead() {
    return ghosts.every(g => g.dead);
}

export function updateGhosts(lives, score) {
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        g.timer++;

        // SOLO se mueven cada X cuadros (Freno de mano)
        if (g.timer >= GHOST_SPEED_DIVIDER) {
            g.timer = 0;

            let cx = Math.round(g.x);
            let cy = Math.round(g.y);

            // Buscar caminos posibles
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => 
                map[cy + m.dy]?.[cx + m.dx] !== 1
            );

            // No volver atrás
            if (moves.length > 1) {
                moves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            }

            let choice;
            if (g.mode === "berserker" && !powerMode) {
                // Inteligencia: buscar el camino que reduzca la distancia a Pac-Man
                choice = moves.sort((a, b) => 
                    Math.hypot((cx + a.dx) - pacman.x, (cy + a.dy) - pacman.y) - 
                    Math.hypot((cx + b.dx) - pacman.x, (cy + b.dy) - pacman.y)
                )[0];
            } else {
                // Aleatorio para los demás o si están asustados
                choice = moves[Math.floor(Math.random() * moves.length)];
            }
            
            if (choice) {
                g.x += choice.dx; 
                g.y += choice.dy;
                g.lastDx = choice.dx; 
                g.lastDy = choice.dy;
            }
        }

        // Suavizado visual (Interpolación)
        g.vX += (g.x - g.vX) * 0.12;
        g.vY += (g.y - g.vY) * 0.12;

        // COLISIÓN CON PACMAN
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.6) {
            if (powerMode) {
                g.dead = true;
                score.value += 200;
                setTimeout(() => { g.dead = false; g.x = 9; g.y = 4; }, 5000);
            } else {
                lives.value--;
                pacman.x = 1; pacman.y = 1; // Reset manual rápido
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let gx = ox + g.vX * TILE_SIZE + TILE_SIZE / 2;
        let gy = oy + g.vY * TILE_SIZE + TILE_SIZE / 2;

        ctx.fillStyle = powerMode ? "blue" : g.color;
        
        // Cuerpo del fantasma
        ctx.beginPath();
        ctx.arc(gx, gy, TILE_SIZE * 0.4, Math.PI, 0);
        ctx.lineTo(gx + TILE_SIZE * 0.4, gy + TILE_SIZE * 0.4);
        ctx.lineTo(gx - TILE_SIZE * 0.4, gy + TILE_SIZE * 0.4);
        ctx.fill();

        // Ojos de los fantasmas
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - 5, gy - 5, 3, 0, 7);
        ctx.arc(gx + 5, gy - 5, 3, 0, 7);
        ctx.fill();
    });
}