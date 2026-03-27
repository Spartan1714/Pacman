import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

console.log("✅ ghosts.js cargado correctamente con activarPowerMode");

export let ghosts = []; 
export let powerMode = false;
let powerTimer = 0;
let ghostSpeedMultiplier = 2.8; 

const COLORES = ["red", "pink", "cyan", "orange", "purple"];

export function spawnGhosts() {
    const cantidad = Math.floor(Math.random() * 5) + 1;
    ghosts = []; 
    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: 9, y: 4, 
            color: COLORES[i % COLORES.length],
            dirX: 0, dirY: 0, 
            lastDx: 0, lastDy: 0,
            dead: false,
            respawnTimer: 0
        });
    }
}

// ESTA ES LA FUNCIÓN DEL ERROR - ASEGÚRATE QUE SE LLAME EXACTAMENTE ASÍ
export function activarPowerMode() {
    powerMode = true;
    powerTimer = 400; 
    console.log("🔥 Power Mode Activado!");
}

export function aumentarDificultad() {
    ghostSpeedMultiplier += 0.4;
}

export function updateGhosts(lives, score, dt) {
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
        let speed = powerMode ? ghostSpeedMultiplier * 0.6 : ghostSpeedMultiplier;

        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                return map[cy + m.dy]?.[cx + m.dx] !== 1;
            });
            let filteredMoves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            let finalChoices = filteredMoves.length > 0 ? filteredMoves : moves;

            let choice;
            if (powerMode) {
                choice = finalChoices.sort((a,b) => 
                    Math.hypot((cx+b.dx)-pacman.x, (cy+b.dy)-pacman.y) - 
                    Math.hypot((cx+a.dx)-pacman.x, (cy+a.dy)-pacman.y)
                )[0];
            } else {
                let sigueRecto = finalChoices.find(m => m.dx === g.lastDx && m.dy === g.lastDy);
                choice = (sigueRecto && Math.random() < 0.8) ? sigueRecto : finalChoices[Math.floor(Math.random() * finalChoices.length)];
            }
            if (choice) {
                g.dirX = choice.dx; g.dirY = choice.dy;
                g.lastDx = choice.dx; g.lastDy = choice.dy;
            }
        }

        g.x += g.dirX * speed * dt;
        g.y += g.dirY * speed * dt;

        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.7) {
            if (powerMode) {
                g.dead = true;
                g.respawnTimer = 240; 
                score.value += 200;
            } else {
                lives.value -= 1; 
                pacman.x = 1; pacman.y = 1;
                pacman.dirX = 0; pacman.dirY = 0;
                ghosts.forEach(ghost => { ghost.x = 9; ghost.y = 4; });
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let gx = ox + g.x * TILE_SIZE + TILE_SIZE / 2;
        let gy = oy + g.y * TILE_SIZE + TILE_SIZE / 2;
        let r = TILE_SIZE * 0.4; 
        ctx.fillStyle = powerMode ? "blue" : g.color;
        ctx.beginPath();
        ctx.arc(gx, gy, r, Math.PI, 0);
        ctx.lineTo(gx + r, gy + r);
        ctx.lineTo(gx - r, gy + r);
        ctx.fill();
    });
}