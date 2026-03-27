import { map, TILE_SIZE } from "./map.js";

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;
let ghostSpeed = 2.8;

const COLORES = ["red", "pink", "cyan", "orange", "purple"];

// --- EXPORTACIONES ---
export function activarPowerMode() {
    powerMode = true;
    powerTimer = 400;
    console.log("MODO PODER ACTIVADO");
}

export function aumentarDificultad() {
    ghostSpeed += 0.4;
}

export function spawnGhosts() {
    const cantidad = Math.floor(Math.random() * 5) + 1;
    ghosts = [];
    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: 9, y: 4, 
            color: COLORES[i % COLORES.length],
            dirX: 0, dirY: 0, lastDx: 0, lastDy: 0,
            dead: false, respawnTimer: 0
        });
    }
}

export function updateGhosts(lives, score, dt, pacmanPos) {
    if (!dt) return;
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) {
            g.respawnTimer--;
            if (g.respawnTimer <= 0) { g.dead = false; g.x = 9; g.y = 4; }
            return;
        }

        let cx = Math.round(g.x);
        let cy = Math.round(g.y);
        let currentSpeed = powerMode ? ghostSpeed * 0.6 : ghostSpeed;

        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                return map[cy + m.dy]?.[cx + m.dx] !== 1;
            });
            let filtered = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            let final = filtered.length > 0 ? filtered : moves;
            let choice = final[Math.floor(Math.random() * final.length)];
            
            if (choice) {
                g.dirX = choice.dx; g.dirY = choice.dy;
                g.lastDx = choice.dx; g.lastDy = choice.dy;
            }
        }
        g.x += g.dirX * currentSpeed * dt;
        g.y += g.dirY * currentSpeed * dt;

        // Colisión usando la posición que le pasamos desde game.js
        if (Math.hypot(g.x - pacmanPos.x, g.y - pacmanPos.y) < 0.7) {
            if (powerMode) {
                g.dead = true; g.respawnTimer = 200; score.value += 200;
            } else {
                lives.value--;
                pacmanPos.x = 1; pacmanPos.y = 1;
                ghosts.forEach(gh => { gh.x = 9; gh.y = 4; });
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        ctx.fillStyle = powerMode ? "blue" : g.color;
        ctx.beginPath();
        ctx.arc(ox + g.x * TILE_SIZE + TILE_SIZE/2, oy + g.y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2.5, 0, Math.PI*2);
        ctx.fill();
    });
}