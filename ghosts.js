import { map } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 5; // segundos
}

export function spawnGhosts() {
    ghosts = [
        { x: 18, y: 1, dx: -1, dy: 0, speed: 4, dead: false },
        { x: 1, y: 8, dx: 1, dy: 0, speed: 4, dead: false }
    ];
}

export function updateGhosts(lives, score, dt) {
    if (powerMode) {
        powerTimer -= dt;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let cx = Math.floor(g.x + 0.5);
        let cy = Math.floor(g.y + 0.5);

        let moves = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ].filter(m => map[cy + m.dy]?.[cx + m.dx] !== 1);

        if (moves.length > 0) {
            let best = moves.sort((a, b) => {
                let da = Math.hypot((cx + a.dx) - pacman.x, (cy + a.dy) - pacman.y);
                let db = Math.hypot((cx + b.dx) - pacman.x, (cy + b.dy) - pacman.y);
                return da - db;
            })[0];

            g.dx = best.dx;
            g.dy = best.dy;
        }

        g.x += g.dx * g.speed * dt;
        g.y += g.dy * g.speed * dt;

        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.5) {
            if (powerMode) {
                g.dead = true;
                score.value += 200;
            } else {
                lives.value--;
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy, size) {
    ghosts.forEach(g => {
        if (g.dead) return;

        ctx.fillStyle = powerMode ? "blue" : "red";
        ctx.beginPath();
        ctx.arc(ox + g.x * size + size / 2, oy + g.y * size + size / 2, size / 2.5, 0, Math.PI * 2);
        ctx.fill();
    });
}