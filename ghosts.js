import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    const num = Math.min(2 + level, colors.length);
    
    // BUSCADOR DE POSICIÓN LIBRE: Encuentra el primer '0' o '2' en el mapa
    let spawnPos = { x: 1, y: 1 };
    outer: for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] !== 1) {
                spawnPos = { x, y };
                break outer;
            }
        }
    }

    for (let i = 0; i < num; i++) {
        ghosts.push({
            x: spawnPos.x, y: spawnPos.y, 
            vX: spawnPos.x, vY: spawnPos.y,
            color: colors[i],
            speed: 0.07 + (level * 0.01),
            dirX: 0, dirY: 0
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        // Solo decide dirección cuando está centrado en la celda
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;

            let possibleDirs = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(d => {
                let ny = Math.round(g.y + d.dy);
                let nx = Math.round(g.x + d.dx);
                return map[ny] && (map[ny][nx] === 0 || map[ny][nx] === 2);
            });

            if (possibleDirs.length > 0) {
                // Evita que el fantasma se dé la vuelta 180 grados si hay otra opción
                if (possibleDirs.length > 1) {
                    possibleDirs = possibleDirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
                }
                let m = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                g.dirX = m.dx; g.dirY = m.dy;
                g.x += g.dirX; g.y += g.dy;
            }
        }

        // Movimiento visual (Deslizamiento)
        if (g.vX < g.x) g.vX = Math.min(g.vX + g.speed, g.x);
        if (g.vX > g.x) g.vX = Math.max(g.vX - g.speed, g.x);
        if (g.vY < g.y) g.vY = Math.min(g.vY + g.speed, g.y);
        if (g.vY > g.y) g.vY = Math.max(g.vY - g.speed, g.y);

        // Colisión con Pacman
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.5) {
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
        let s = tileSize;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        // Cabeza
        ctx.arc(x + s/2, y + s/2.5, s * 0.4, Math.PI, 0);
        // Cuerpo y las 3 puntas rectas (Diseño limpio)
        ctx.lineTo(x + s * 0.9, y + s * 0.9);
        ctx.lineTo(x + s * 0.75, y + s * 0.75); // Punta 1
        ctx.lineTo(x + s * 0.6, y + s * 0.9);
        ctx.lineTo(x + s * 0.5, y + s * 0.75); // Punta 2
        ctx.lineTo(x + s * 0.4, y + s * 0.9);
        ctx.lineTo(x + s * 0.25, y + s * 0.75); // Punta 3
        ctx.lineTo(x + s * 0.1, y + s * 0.9);
        ctx.lineTo(x + s * 0.1, y + s/2.5);
        ctx.fill();

        // OJOS PROFESIONALES (Blancos con pupila azul mirando arriba)
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.ellipse(x + s*0.35, y + s*0.4, s*0.1, s*0.13, 0, 0, Math.PI*2);
        ctx.ellipse(x + s*0.65, y + s*0.4, s*0.1, s*0.13, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.32, s*0.05, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.32, s*0.05, 0, Math.PI*2);
        ctx.fill();
    }
}