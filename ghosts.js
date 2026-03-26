import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];
export let isBerserker = { active: false, timer: 0 };

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    let freeCells = [];
    map.forEach((row, y) => row.forEach((v, x) => { if(v !== 1 && (x > 5 || y > 5)) freeCells.push({x,y}); }));

    for (let i = 0; i < Math.min(2 + level, 5); i++) {
        let pos = freeCells[Math.floor(Math.random() * freeCells.length)];
        ghosts.push({
            x: pos.x, y: pos.y, vX: pos.x, vY: pos.y,
            color: colors[i % colors.length],
            speed: 0.06 + (level * 0.005),
            dirX: 0, dirY: 0, dead: false
        });
    }
}

export function updateGhosts(lives, level, score) {
    if (isBerserker.active) {
        isBerserker.timer--;
        if (isBerserker.timer <= 0) isBerserker.active = false;
    }

    for (let g of ghosts) {
        if (g.dead) continue;

        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => 
                map[Math.round(g.y + d.dy)]?.[Math.round(g.x + d.dx)] !== 1
            );
            if (dirs.length > 1) dirs = dirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
            let m = dirs[Math.floor(Math.random() * dirs.length)];
            if(m) { g.dirX = m.dx; g.dirY = m.dy; g.x += g.dirX; g.y += g.dy; }
        }

        g.vX += (g.x - g.vX) * 0.1; g.vY += (g.y - g.vY) * 0.1;

        // Colisión
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            if (isBerserker.active) {
                g.dead = true; score.value += 200;
                setTimeout(() => { g.dead = false; g.x = 9; g.y = 9; }, 3000);
            } else {
                lives.value--; resetPlayer(); spawnGhostsForLevel(level); return;
            }
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        if (g.dead) continue;
        let x = offsetX + g.vX * tileSize, y = offsetY + g.vY * tileSize, s = tileSize;
        
        // Color Berserker (Azul parpadeante al final)
        ctx.fillStyle = isBerserker.active ? (isBerserker.timer < 100 && isBerserker.timer % 20 < 10 ? "white" : "#0000FF") : g.color;
        
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2.5, s * 0.4, Math.PI, 0);
        ctx.lineTo(x + s * 0.9, y + s * 0.9);
        ctx.lineTo(x + s * 0.75, y + s * 0.75); // Punta 1
        ctx.lineTo(x + s * 0.6, y + s * 0.9);
        ctx.lineTo(x + s * 0.5, y + s * 0.75); // Punta 2
        ctx.lineTo(x + s * 0.4, y + s * 0.9);
        ctx.lineTo(x + s * 0.25, y + s * 0.75); // Punta 3
        ctx.lineTo(x + s * 0.1, y + s * 0.9);
        ctx.lineTo(x + s * 0.1, y + s/2.5);
        ctx.fill();

        // Ojos
        ctx.fillStyle = isBerserker.active ? "white" : "white";
        ctx.beginPath(); ctx.arc(x+s*.35, y+s*.4, s*.1, 0, 7); ctx.arc(x+s*.65, y+s*.4, s*.1, 0, 7); ctx.fill();
        ctx.fillStyle = isBerserker.active ? "red" : "blue"; // Pupilas rojas en modo miedo
        ctx.beginPath(); ctx.arc(x+s*.35, y+s*.4, s*.04, 0, 7); ctx.arc(x+s*.65, y+s*.4, s*.04, 0, 7); ctx.fill();
    }
}