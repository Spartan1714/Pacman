import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [
    { x: 18, y: 8, color: "red", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0 },
    { x: 1, y: 8, color: "pink", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0 }
];

// Los fantasmas siempre un poco más lentos que el jugador (4.0 vs 5.5)
const GHOST_SPEED = 3.8; 

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    ghosts.forEach(g => {
        let cx = Math.round(g.x);
        let cy = Math.round(g.y);

        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => 
                map[cy + m.dy]?.[cx + m.dx] !== 1 && (m.dx !== -g.lastDx || m.dy !== -g.lastDy)
            );

            // Persecución simple
            let choice = moves.sort((a,b) => 
                Math.hypot((cx+a.dx)-pacman.x, (cy+a.dy)-pacman.y) - 
                Math.hypot((cx+b.dx)-pacman.x, (cy+b.dy)-pacman.y)
            )[0];

            if (choice) {
                g.dirX = choice.dx; g.dirY = choice.dy;
                g.lastDx = choice.dx; g.lastDy = choice.dy;
            }
        }

        g.x += g.dirX * GHOST_SPEED * dt;
        g.y += g.dirY * GHOST_SPEED * dt;

        // Colisión muerte
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.6) {
            lives.value--;
            pacman.x = 1; pacman.y = 1;
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        let gx = ox + g.x * TILE_SIZE + TILE_SIZE / 2;
        let gy = oy + g.y * TILE_SIZE + TILE_SIZE / 2;
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(gx, gy, TILE_SIZE * 0.4, Math.PI, 0);
        ctx.lineTo(gx + TILE_SIZE * 0.4, gy + TILE_SIZE * 0.4);
        ctx.lineTo(gx - TILE_SIZE * 0.4, gy + TILE_SIZE * 0.4);
        ctx.fill();
    });
}