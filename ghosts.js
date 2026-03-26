import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0; 
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852", "#FF00FF", "#00FF00"];
    const numGhosts = Math.min(2 + level, colors.length);

    for (let i = 0; i < numGhosts; i++) {
        ghosts.push({
            x: 9, y: 7,      // Asegúrate que esta celda sea pasillo en tu map.js
            vX: 9, vY: 7,
            color: colors[i],
            speed: 0.08 + (level * 0.01), 
            dirX: 0, dirY: 0
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        
        // --- FÍSICA ANTIBLOQUEO (MAGNETISMO) ---
        // Si la distancia al centro es menor a su velocidad, lo "ajustamos" al centro
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x;
            g.vY = g.y;

            // Buscamos caminos redondeando la posición para no leer decimales
            let possibleDirs = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(d => {
                let ny = Math.round(g.y + d.dy);
                let nx = Math.round(g.x + d.dx);
                return map[ny] && map[ny][nx] !== 1; // Solo pasillos
            });

            if (possibleDirs.length > 0) {
                // Inteligencia: No volver atrás si hay más opciones
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

        // --- MOVIMIENTO VISUAL (Suavizado) ---
        if (g.vX < g.x) g.vX = Math.min(g.vX + g.speed, g.x);
        if (g.vX > g.x) g.vX = Math.max(g.vX - g.speed, g.x);
        if (g.vY < g.y) g.vY = Math.min(g.vY + g.speed, g.y);
        if (g.vY > g.y) g.vY = Math.max(g.vY - g.speed, g.y);

        // --- COLISIÓN ---
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
        
        // --- DISEÑO EXACTO A TU IMAGEN (3 PUNTAS LIMPIAS) ---
        ctx.beginPath();
        // Cabeza redonda
        ctx.arc(gx + r, gy + r, r * 0.85, Math.PI, 0); 
        // Lado derecho
        ctx.lineTo(gx + (tileSize * 0.85), gy + tileSize);
        
        // Las 3 Puntas del borde inferior (Geométricas)
        let bottom = gy + tileSize;
        let step = (tileSize * 0.7) / 3;
        
        ctx.lineTo(gx + (tileSize * 0.7), bottom - 5);
        ctx.lineTo(gx + (tileSize * 0.55), bottom);
        ctx.lineTo(gx + (tileSize * 0.4), bottom - 5);
        ctx.lineTo(gx + (tileSize * 0.25), bottom);
        ctx.lineTo(gx + (tileSize * 0.15), bottom - 5);
        
        // Lado izquierdo
        ctx.lineTo(gx + (tileSize * 0.15), gy + r);
        ctx.fill();

        // --- OJOS (Pupilas fijas arriba como en la foto) ---
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx + r - 4, gy + r - 4, 3.8, 0, 7); // Globo izquierdo
        ctx.arc(gx + r + 4, gy + r - 4, 3.8, 0, 7); // Globo derecho
        ctx.fill();
        
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(gx + r - 4, gy + r - 6, 2, 0, 7); // Pupila izquierda