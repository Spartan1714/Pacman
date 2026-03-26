import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel() {
    ghosts = [];
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 13, y: 11, vX: 13, vY: 11,
            color: colors[i],
            speed: 0.1,
            dirX: 0, dirY: 0,
            anim: 0
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        g.anim += 0.2;
        // IA y Movimiento Suave
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => map[g.y+d.dy][g.x+d.dx] !== 1);
            let move = dirs[Math.floor(Math.random() * dirs.length)];
            g.dirX = move.dx; g.dirY = move.dy;
            g.x += g.dirX; g.y += g.dy;
        }
        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // Colisión
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            lives.value--;
            resetPlayer();
            ghosts.forEach(gh => { gh.x=13; gh.y=11; gh.vX=13; gh.vY=11; });
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let gx = offsetX + g.vX * tileSize;
        let gy = offsetY + g.vY * tileSize;
        let r = tileSize / 2;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(gx + r, gy + r, r * 0.9, Math.PI, 0); // Cabeza
        ctx.lineTo(gx + tileSize * 0.9, gy + tileSize);
        // Pies animados
        for (let i = 0; i < 3; i++) {
            let x = gx + tileSize * 0.9 - (i * tileSize / 3);
            let y = gy + tileSize + Math.sin(g.anim + i) * 3;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(gx + tileSize * 0.1, gy + tileSize);
        ctx.fill();
    }
}
spawnGhostsForLevel();