import { map } from "./map.js";

export let ghosts = [];
let ghostSpeed = 3;

export function spawnGhosts() {
    const colores = ["red", "pink", "cyan", "orange"];
    ghosts = colores.map((col, i) => ({
        x: 9 + i,
        y: 7,
        color: col,
        dirX: 0,
        dirY: 0
    }));
}

export function updateGhosts(lives, pacmanPos, dt) {
    if (!dt) return;

    ghosts.forEach(g => {
        let cx = Math.round(g.x);
        let cy = Math.round(g.y);

        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            const moves = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
            ].filter(m => map[cy + m.dy]?.[cx + m.dx] !== 1);

            let choice = moves[Math.floor(Math.random() * moves.length)];
            if (choice) {
                g.dirX = choice.dx;
                g.dirY = choice.dy;
            }
        }

        g.x += g.dirX * ghostSpeed * dt;
        g.y += g.dirY * ghostSpeed * dt;

        // Colisión con Pac-Man
        if (Math.hypot(g.x - pacmanPos.x, g.y - pacmanPos.y) < 0.7) {
            lives.value--;
            pacmanPos.x = 1;
            pacmanPos.y = 1;
        }
    });
}

export function drawGhosts(ctx, size, ox, oy) {
    ghosts.forEach(g => {
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(ox + g.x * size + size / 2, oy + g.y * size + size / 2, size / 2.2, 0, Math.PI * 2);
        ctx.fill();
    });
}