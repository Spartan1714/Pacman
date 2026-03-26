import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    
    // Forzamos el spawn en 1,1 (donde siempre hay camino) pero con un pequeño delay visual
    for (let i = 0; i < Math.min(2 + level, 4); i++) {
        ghosts.push({
            x: 1, y: 1, vX: 1, vY: 1,
            color: colors[i],
            speed: 0.06,
            dirX: 0, dirY: 0
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        // Tolerancia mayor (0.2) para que nunca se traben en las esquinas
        if (Math.abs(g.x - g.vX) < 0.2 && Math.abs(g.y - g.vY) < 0.2) {
            g.vX = g.x; g.vY = g.y;
            let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => {
                let ny = Math.round(g.y + d.dy), nx = Math.round(g.x + d.dx);
                return map[ny] && map[ny][nx] !== 1;
            });
            if (dirs.length > 1) dirs = dirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
            let m = dirs[Math.floor(Math.random() * dirs.length)];
            if(m) { g.dirX = m.dx; g.dirY = m.dy; g.x += g.dirX; g.y += g.dy; }
        }
        if (g.vX < g.x) g.vX += g.speed; if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed; if (g.vY > g.y) g.vY -= g.speed;

        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.5) {
            lives.value--; resetPlayer(); spawnGhostsForLevel(level); return;
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let x = offsetX + g.vX * tileSize, y = offsetY + g.vY * tileSize, s = tileSize;
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2.5, s * 0.4, Math.PI, 0); // Cabeza
        // Las 3 puntas rectas de la imagen_0
        ctx.lineTo(x + s * 0.9, y + s * 0.9);
        ctx.lineTo(x + s * 0.75, y + s * 0.75); // Punta 1
        ctx.lineTo(x + s * 0.6, y + s * 0.9);
        ctx.lineTo(x + s * 0.5, y + s * 0.75); // Punta 2
        ctx.lineTo(x + s * 0.4, y + s * 0.9);
        ctx.lineTo(x + s * 0.25, y + s * 0.75); // Punta 3
        ctx.lineTo(x + s * 0.1, y + s * 0.9);
        ctx.lineTo(x + s * 0.1, y + s/2.5);
        ctx.fill();
        // Ojos profesionales mirando arriba
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.ellipse(x+s*.35, y+s*.4, s*.1, s*.13, 0, 0, 7); ctx.ellipse(x+s*.65, y+s*.4, s*.1, s*.13, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "blue";
        ctx.beginPath(); ctx.arc(x+s*.35, y+s*.32, s*.05, 0, 7); ctx.arc(x+s*.65, y+s*.32, s*.05, 0, 7); ctx.fill();
    }
}