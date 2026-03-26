import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel() {
    ghosts = []; // Vaciamos para que no se acumulen
    const colors = ["red", "pink", "cyan", "orange"];
    // Spawn en zona central despejada (ajusta según tu mapa si 9,9 es muro)
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 9, y: 9, vX: 9, vY: 9,
            color: colors[i],
            speed: 0.08,
            dirX: 0, dirY: 0
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => {
                return map[g.y + d.dy] && map[g.y + d.dy][g.x + d.dx] !== 1;
            });
            let move = dirs[Math.floor(Math.random() * dirs.length)];
            g.dirX = move.dx; g.dirY = move.dy;
            g.x += g.dirX; g.y += g.dy;
        }

        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // COLISIÓN MEJORADA: Solo mueres si la distancia visual es muy corta
        let dist = Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY);
        if (dist < 0.5) { // Reducido de 0.7 a 0.5 para que sea más justo
            lives.value--;
            resetPlayer();
            ghosts.forEach(gh => { gh.x = 9; gh.y = 9; gh.vX = 9; gh.vY = 9; });
            break; 
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let gx = offsetX + g.vX * tileSize + tileSize/2;
        let gy = offsetY + g.vY * tileSize + tileSize/2;
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(gx, gy, tileSize/2.2, 0, Math.PI * 2);
        ctx.fill();
        // Ojos para distinguir dirección
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - 4, gy - 2, 3, 0, 7);
        ctx.arc(gx + 4, gy - 2, 3, 0, 7);
        ctx.fill();
    }
}