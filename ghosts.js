import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js?v=2";

export let ghosts = [];

export function spawnGhostsForLevel(level) {
    ghosts = [];
    // Asegurarnos de que el punto de spawn (fila 1, col 10) sea un 0 o 2 en tu map.js
    const colors = ["red", "pink", "cyan", "orange"];
    const num = level + 1; // Un fantasma más por nivel

    for (let i = 0; i < Math.min(num, colors.length); i++) {
        ghosts.push({
            x: 10, y: 1,         // Posición lógica (segura en tu mapa central superior)
            vX: 10, vY: 1,       // Posición visual (deslizamiento)
            dx: 0, dy: 0,        // Dirección actual
            color: colors[i],
            speed: 0.1          // Un poco más lentos que Pacman (0.15)
        });
    }
}

// Función auxiliar para obtener direcciones válidas
function getPossibleDirs(g) {
    let dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
    let valid = dirs.filter(d => {
        let ny = Math.round(g.y + d.y);
        let nx = Math.round(g.x + d.x);
        // Verificar bordes del mapa
        if(ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return false;
        return map[ny][nx] !== 1;
    });
    return valid;
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        // 1. Lógica de Rejilla (IA y snap)
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; // Snap visual
            g.vY = g.y;

            let possible = getPossibleDirs(g);

            if (possible.length > 0) {
                // Inteligencia básica: si hay intersección, elige al azar. Si no, sigue de frente.
                if (possible.length > 2 || (possible.length === 2 && (g.dx !== possible[0].x || g.dy !== possible[0].y))) {
                    // Evitar dar media vuelta si hay más opciones
                    possible = possible.filter(d => d.x !== -g.dx || d.y !== -g.dy);
                    let chosen = possible[Math.floor(Math.random() * possible.length)];
                    g.dx = chosen.x; g.dy = chosen.y;
                } else {
                    // Solo hay un camino o el actual está libre
                    let move = possible[0];
                    g.dx = move.x; g.dy = move.y;
                }
                g.x += g.dx;
                g.y += g.dy;
            }
        }

        // 2. Deslizamiento Visual (ELIMINA EL LAG)
        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // 3. Colisión (Muerte por proximidad visual)
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            lives.value--;
            resetPlayer();
            // Resetear fantasmas a la posición inicial
            ghosts.forEach(gh => { gh.x = 10; gh.y = 1; gh.vX = 10; gh.vY = 1; });
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let tx = offsetX + g.vX * tileSize;
        let ty = offsetY + g.vY * tileSize;
        let r = tileSize / 2;

        ctx.fillStyle = g.color;
        // Cabeza clásica
        ctx.beginPath();
        ctx.arc(tx + r, ty + r, r * 0.9, Math.PI, 0); // Mitad superior redonda
        ctx.lineTo(tx + tileSize * 0.9, ty + tileSize);
        // Patas (picos básicos)
        ctx.lineTo(tx + tileSize * 0.66, ty + tileSize * 0.9);
        ctx.lineTo(tx + tileSize * 0.33, ty + tileSize);
        ctx.lineTo(tx + tileSize * 0.1, ty + tileSize * 0.9);
        ctx.lineTo(tx, ty + r);
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(tx + r - 4, ty + r - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + r + 4, ty + r - 2, 3, 0, Math.PI * 2); ctx.fill();
    }
}