import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

// Ahora acepta el nivel para decidir cuántos fantasmas salen
export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0; 
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852", "#FF00FF", "#00FF00"];
    
    // Mínimo 2, máximo 6 fantasmas dependiendo del nivel
    const numGhosts = Math.min(2 + level, colors.length);

    for (let i = 0; i < numGhosts; i++) {
        ghosts.push({
            x: 9, y: 9, // Centro del mapa (asegúrate que sea un pasillo)
            vX: 9, vY: 9,
            color: colors[i],
            speed: 0.08 + (level * 0.01), // Aumentan velocidad por nivel
            dirX: 0, dirY: 0,
            wobble: Math.random() * Math.PI
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        g.wobble += 0.2;

        // LÓGICA DE MOVIMIENTO (Corregida para que NO se traben)
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x;
            g.vY = g.y;

            let possibleDirs = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(d => {
                let ny = Math.round(g.y + d.dy);
                let nx = Math.round(g.x + d.dx);
                return map[ny] && map[ny][nx] !== 1;
            });

            if (possibleDirs.length > 1) {
                // No dar la vuelta 180 si hay más opciones
                possibleDirs = possibleDirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
            }
            
            let move = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
            if (move) {
                g.dirX = move.dx; g.dirY = move.dy;
                g.x += g.dirX; g.y += g.dy;
            }
        }

        // DESLIZAMIENTO
        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // COLISIÓN JUSTA
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
        let gx = offsetX + g.vX * tileSize;
        let gy = offsetY + g.vY * tileSize;
        let r = tileSize / 2;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        // Cabeza (Arco superior)
        ctx.arc(gx + r, gy + r, r * 0.8, Math.PI, 0);
        // Cuerpo inferior con "picos" animados
        for (let i = 0; i <= 3; i++) {
            let x = gx + (tileSize * 0.8) - (i * (tileSize * 0.6) / 3);
            let y = gy + tileSize + (Math.sin(g.wobble + i) * 4);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(gx + (r * 0.2), gy + r);
        ctx.fill();

        // OJOS PRO (Miran hacia donde caminan)
        ctx.fillStyle = "white";
        let eyeSize = r * 0.3;
        let lookX = g.dirX * 3;
        let lookY = g.dirY * 3;
        
        ctx.beginPath(); 
        ctx.arc(gx + r - 5 + lookX, gy + r - 2 + lookY, eyeSize, 0, 7); 
        ctx.arc(gx + r + 5 + lookX, gy + r - 2 + lookY, eyeSize, 0, 7); 
        ctx.fill();
        
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(gx + r - 5 + lookX * 1.5, gy + r - 2 + lookY * 1.5, eyeSize/2, 0, 7);
        ctx.arc(gx + r + 5 + lookX * 1.5, gy + r - 2 + lookY * 1.5, eyeSize/2, 0, 7);
        ctx.fill();
    }
}