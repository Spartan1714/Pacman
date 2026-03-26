import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel() {
    // 1. Vaciamos el array por completo para evitar duplicados
    ghosts.length = 0; 
    
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    
    // 2. Spawn en el centro (ajusta estas coordenadas si tu mapa tiene muros ahí)
    // Usualmente el "nido" de fantasmas está cerca del centro del mapa
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 9 + (i % 2), y: 9, // Los posicionamos cerca del centro
            vX: 9 + (i % 2), vY: 9,
            color: colors[i],
            speed: 0.1, // Un poco más lento que Pacman (que tiene 0.125)
            dirX: 0, dirY: 0,
            wobble: Math.random() * 10
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        g.wobble += 0.15; // Animación de las "patas"

        // LÓGICA DE MOVIMIENTO (Idéntica a la de Pacman para que sean fluidos)
        if (Math.abs(g.x - g.vX) <= g.speed && Math.abs(g.y - g.vY) <= g.speed) {
            g.vX = g.x;
            g.vY = g.y;

            // IA: Buscar direcciones posibles
            let possibleDirs = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(d => {
                let ny = g.y + d.dy;
                let nx = g.x + d.dx;
                return map[ny] && map[ny][nx] !== 1;
            });

            if (possibleDirs.length > 0) {
                // Evitar dar la vuelta 180° si hay otras opciones (hace que se vean más naturales)
                if (possibleDirs.length > 1) {
                    possibleDirs = possibleDirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
                }
                
                let move = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                g.dirX = move.dx;
                g.dirY = move.dy;
                g.x += g.dirX;
                g.y += g.dy;
            }
        }

        // DESLIZAMIENTO VISUAL
        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // COLISIÓN (Aquí es donde se moría de la nada)
        // Usamos la posición VISUAL (vX) y un radio muy pequeño (0.4)
        let distance = Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY);
        
        if (distance < 0.5) { 
            lives.value--;
            resetPlayer();
            // Importante: Resetear posiciones de fantasmas al morir
            spawnGhostsForLevel(); 
            return; // Salimos de la función inmediatamente
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let gx = offsetX + g.vX * tileSize + tileSize/2;
        let gy = offsetY + g.vY * tileSize + tileSize/2;
        let r = tileSize / 2.2;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        // Cabeza redonda
        ctx.arc(gx, gy, r, Math.PI, 0);
        // Cuerpo y patas onduladas
        ctx.lineTo(gx + r, gy + r);
        let steps = 3;
        for (let i = 0; i <= steps; i++) {
            let px = gx + r - (i * (r * 2 / steps));
            let py = gy + r + Math.sin(g.wobble + i) * 3;
            ctx.lineTo(px, py);
        }
        ctx.lineTo(gx - r, gy);
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - 4, gy - 2, 3, 0, 7);
        ctx.arc(gx + 4, gy - 2, 3, 0, 7);
        ctx.fill();
    }
}