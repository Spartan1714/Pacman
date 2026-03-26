import { map } from "./map.js";
// Cambia esto en ghosts.js (Línea 2)
import { pacman, resetPlayer } from "./player.js?v=2";
export let ghosts = [];

export function spawnGhostsForLevel() {
    ghosts = [];
    const colors = ["red", "pink", "cyan", "orange"];
    // Spawn en zona segura (fila 1, col 10)
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 10, y: 1,         // Posición lógica
            vX: 10, vY: 1,       // Posición visual (deslizamiento)
            dx: 0, dy: 0,        // Dirección actual
            color: colors[i],
            speed: 0.1,          // Un poco más lentos que Pacman (0.15)
            wobble: Math.random() * 10 // Para animar las patas
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        g.wobble += 0.2; // Animación de patas

        // 1. Lógica de Rejilla (IA y snap)
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; // Snap visual
            g.vY = g.y;

            // IA Básica: elegir dirección al azar evitando volver atrás
            let dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
            let valid = dirs.filter(d => {
                let ny = Math.round(g.y + d.y);
                let nx = Math.round(g.x + d.x);
                if(ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return false;
                return map[ny][nx] !== 1;
            });

            if (valid.length > 0) {
                if (valid.length > 1) {
                    // Evitar dar media vuelta si hay más opciones
                    valid = valid.filter(d => d.x !== -g.dx || d.y !== -g.dy);
                }
                let chosen = valid[Math.floor(Math.random() * valid.length)];
                g.dx = chosen.x; g.dy = chosen.y;
                g.x += g.dx; g.y += g.dy;
            }
        }

        // 2. Deslizamiento Visual (ELIMINA EL LAG)
        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // 3. Colisión (Muerte por proximidad visual, más justa)
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            lives.value--;
            resetPlayer();
            // Resetear fantasmas
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
        
        // Cabeza clásica redonda
        ctx.beginPath();
        ctx.arc(tx + r, ty + r, r * 0.9, Math.PI, 0); 
        
        // Patas onduladas animadas
        let feet = 3;
        let feetWidth = (tileSize * 0.9) / feet;
        for (let i = 0; i < feet; i++) {
            let x = tx + tileSize * 0.9 - (i * feetWidth);
            let y = ty + tileSize + Math.sin(g.wobble + i) * 3;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(tx + tileSize * 0.1, ty + r);
        ctx.fill();

        // Ojos básicos
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(tx + r - 4, ty + r - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + r + 4, ty + r - 2, 3, 0, Math.PI * 2); ctx.fill();
    }
}