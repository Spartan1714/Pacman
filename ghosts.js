import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    const num = Math.min(2 + level, colors.length);
    
    for (let i = 0; i < num; i++) {
        // Spawn en 9,9 (Asegúrate que en map.js la fila 9 col 9 sea un 0 o 2)
        ghosts.push({
            x: 9, y: 9, vX: 9, vY: 9,
            color: colors[i],
            speed: 0.06 + (level * 0.01),
            dirX: 0, dirY: 0
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        // Lógica de movimiento: Solo decide cuando llega al centro de la celda
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;

            let possibleDirs = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(d => {
                let ny = Math.round(g.y + d.dy);
                let nx = Math.round(g.x + d.dx);
                return map[ny] && map[ny][nx] !== 1;
            });

            if (possibleDirs.length > 0) {
                // No volver atrás inmediatamente
                if (possibleDirs.length > 1) {
                    possibleDirs = possibleDirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
                }
                let m = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                g.dirX = m.dx; g.dirY = m.dy;
                g.x += g.dirX; g.y += g.dy;
            }
        }

        // Movimiento visual (Interpolación)
        if (g.vX < g.x) g.vX = Math.min(g.vX + g.speed, g.x);
        if (g.vX > g.x) g.vX = Math.max(g.vX - g.speed, g.x);
        if (g.vY < g.y) g.vY = Math.min(g.vY + g.speed, g.y);
        if (g.vY > g.y) g.vY = Math.max(g.vY - g.speed, g.y);

        // Colisión con Pacman
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            lives.value--;
            resetPlayer();
            spawnGhostsForLevel(level);
            return;
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let x = offsetX + g.vX * tileSize;
        let y = offsetY + g.vY * tileSize;
        let sz = tileSize;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        // Cabeza redonda
        ctx.arc(x + sz/2, y + sz/2, sz * 0.4, Math.PI, 0);
        // Cuerpo y 3 Puntas rectangulares limpias
        ctx.lineTo(x + sz * 0.9, y + sz * 0.9);
        ctx.lineTo(x + sz * 0.75, y + sz * 0.75);
        ctx.lineTo(x + sz * 0.6, y + sz * 0.9);
        ctx.lineTo(x + sz * 0.5, y + sz * 0.75);
        ctx.lineTo(x + sz * 0.4, y + sz * 0.9);
        ctx.lineTo(x + sz * 0.25, y + sz * 0.75);
        ctx.lineTo(x + sz * 0.1, y + sz * 0.9);
        ctx.lineTo(x + sz * 0.1, y + sz/2);
        ctx.fill();

        // Ojos Blancos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.ellipse(x + sz*0.35, y + sz*0.4, sz*0.1, sz*0.15, 0, 0, Math.PI*2);
        ctx.ellipse(x + sz*0.65, y + sz*0.4, sz*0.1, sz*0.15, 0, 0, Math.PI*2);
        ctx.fill();

        // Pupilas Azules (Mirando arriba)
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(x + sz*0.35, y + sz*0.3, sz*0.05, 0, Math.PI*2);
        ctx.arc(x + sz*0.65, y + sz*0.3, sz*0.05, 0, Math.PI*2);
        ctx.fill();
    }
}