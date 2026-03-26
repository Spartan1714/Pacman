import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852", "#FF00FF", "#00FF00"];
    const num = Math.min(2 + level, colors.length);
    
    for (let i = 0; i < num; i++) {
        // IMPORTANTE: Asegúrate que 9,9 sea pasillo en tu map.js
        // Si no, usa x:1, y:3 que suele estar libre.
        ghosts.push({ 
            x: 9, y: 9, 
            vX: 9, vY: 9, 
            color: colors[i], 
            speed: 0.07 + (level * 0.01), 
            dirX: 0, dirY: 0 
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        // IA y movimiento (Igual que el anterior, optimizado)
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => {
                let ny = Math.round(g.y + d.dy), nx = Math.round(g.x + d.dx);
                return map[ny] && map[ny][nx] !== 1;
            });
            if (dirs.length > 1) dirs = dirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
            let m = dirs[Math.floor(Math.random() * dirs.length)];
            if(m) { g.dirX = m.dx; g.dirY = m.dy; g.x += g.dirX; g.y += g.dy; }
        }
        
        if (g.vX < g.x) g.vX = Math.min(g.vX + g.speed, g.x);
        if (g.vX > g.x) g.vX = Math.max(g.vX - g.speed, g.x);
        if (g.vY < g.y) g.vY = Math.min(g.vY + g.speed, g.y);
        if (g.vY > g.y) g.vY = Math.max(g.vY - g.speed, g.y);

        // Colisión (Solo si vidas > 0)
        if (lives.value > 0 && Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            lives.value--; 
            resetPlayer(); 
            spawnGhostsForLevel(level); 
            return;
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let gx = offsetX + g.vX * tileSize, gy = offsetY + g.vY * tileSize, r = tileSize / 2;
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(gx + r, gy + r, r * 0.85, Math.PI, 0);
        ctx.lineTo(gx + (tileSize * 0.85), gy + tileSize);
        ctx.lineTo(gx + (tileSize * 0.7), gy + tileSize - 5);
        ctx.lineTo(gx + (tileSize * 0.55), gy + tileSize);
        ctx.lineTo(gx + (tileSize * 0.4), gy + tileSize - 5);
        ctx.lineTo(gx + (tileSize * 0.25), gy + tileSize);
        ctx.lineTo(gx + (tileSize * 0.15), gy + tileSize - 5);
        ctx.lineTo(gx + (tileSize * 0.15), gy + r);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(gx + r - 4, gy + r - 4, 3.5, 0, 7); ctx.arc(gx + r + 4, gy + r - 4, 3.5, 0, 7); ctx.fill();
        ctx.fillStyle = "blue";
        ctx.beginPath(); ctx.arc(gx + r - 4, gy + r - 5.5, 1.8, 0, 7); ctx.arc(gx + r + 4, gy + r - 5.5, 1.8, 0, 7); ctx.fill();
    }
}