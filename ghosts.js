import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js?v=2";

export let ghosts = [];

export function spawnGhostsForLevel() {
    ghosts = [];
    const colors = ["red", "pink", "cyan", "orange"];
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 9, y: 9, vX: 9, vY: 9, // Asegúrate de que 9,9 sea un espacio vacío en tu map.js
            color: colors[i],
            speed: 0.08,
            dirX: 0, dirY: 0,
            anim: 0
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        g.anim += 0.2;
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            
            // VALIDACIÓN DE SEGURIDAD PARA EL MAPA
            let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => {
                let ny = g.y + d.dy;
                let nx = g.x + d.dx;
                return map[ny] && map[ny][nx] !== undefined && map[ny][nx] !== 1;
            });

            if (dirs.length > 0) {
                let move = dirs[Math.floor(Math.random() * dirs.length)];
                g.dirX = move.dx; g.dirY = move.dy;
                g.x += g.dirX; g.y += g.dy;
            }
        }
        // Movimiento visual
        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // Colisión real por distancia
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            lives.value--;
            resetPlayer();
            ghosts.forEach(gh => { gh.x=9; gh.y=9; gh.vX=9; gh.vY=9; });
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
        // Ojos básicos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx-4, gy-2, 3, 0, 7); ctx.arc(gx+4, gy-2, 3, 0, 7);
        ctx.fill();
    }
}
spawnGhostsForLevel();