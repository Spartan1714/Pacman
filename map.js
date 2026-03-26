import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function spawnGhosts() {
    ghosts = [
        { x: 18, y: 1, vX: 18, vY: 1, color: "red", mode: "berserker", dead: false },
        { x: 1, y: 8, vX: 1, vY: 8, color: "pink", mode: "random", dead: false },
        { x: 18, y: 8, vX: 18, vY: 8, color: "cyan", mode: "random", dead: false }
    ];
}

export function updateGhosts(lives, score) {
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return; // Si está muerto, no hace nada

        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => 
                map[Math.round(g.y + m.dy)]?.[Math.round(g.x + m.dx)] !== 1
            );

            let choice;
            if (g.mode === "berserker" && !powerMode) {
                choice = moves.sort((a, b) => 
                    Math.hypot(g.x + a.dx - pacman.x, g.y + a.dy - pacman.y) - 
                    Math.hypot(g.x + b.dx - pacman.x, g.y + b.dy - pacman.y)
                )[0];
            } else {
                choice = moves[Math.floor(Math.random() * moves.length)];
            }
            if (choice) { g.x += choice.dx; g.y += choice.dy; }
        }
        
        g.vX += (g.x - g.vX) * 0.08;
        g.vY += (g.y - g.vY) * 0.08;

        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            if (powerMode) {
                g.dead = true; // ELIMINADO DEFINITIVAMENTE DEL NIVEL
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
        if (g.dead) return; // No dibujar si está muerto
        let x = ox + g.vX * TILE_SIZE, y = oy + g.vY * TILE_SIZE, s = TILE_SIZE;
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        // ... (resto del dibujo de puntas y ojos que ya teníamos)
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2.5, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.85, y + s*0.9);
        ctx.lineTo(x + s*0.5, y + s*0.7);
        ctx.lineTo(x + s*0.15, y + s*0.9);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(x + s*0.35, y + s*0.35, s*0.12, 0, 7); ctx.arc(x + s*0.65, y + s*0.35, s*0.12, 0, 7); ctx.fill();
    });
}

export function activatePower() { powerMode = true; powerTimer = 300; }