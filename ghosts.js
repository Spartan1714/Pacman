import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js?v=2";

export let ghosts = [];

export function spawnGhostsForLevel() {
    ghosts = [];
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    // Forzamos la creación de 4 fantasmas en posiciones ligeramente distintas
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 9 + i, y: 9, // Se alinean en el centro del mapa
            vX: 9 + i, vY: 9,
            color: colors[i],
            speed: 0.08,
            dirX: 0, dirY: 0,
            anim: Math.random() * 10 
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        g.anim += 0.2;
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            
            // Buscar todas las direcciones que no sean pared
            let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => {
                let ny = g.y + d.dy;
                let nx = g.x + d.dx;
                return map[ny] && map[ny][nx] !== 1;
            });

            if (dirs.length > 0) {
                // Inteligencia básica: no volver atrás si hay otras opciones
                if (dirs.length > 1) {
                    dirs = dirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
                }
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

        // Colisión (muerte)
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.7) {
            lives.value--;
            resetPlayer();
            // Resetear fantasmas
            ghosts.forEach((gh, idx) => { gh.x = 9+idx; gh.y = 9; gh.vX = 9+idx; gh.vY = 9; });
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
        // Patas onduladas
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