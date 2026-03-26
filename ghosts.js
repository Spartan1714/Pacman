import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0; 
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852", "#FF00FF", "#00FF00"];
    const numGhosts = Math.min(2 + level, colors.length);

    for (let i = 0; i < numGhosts; i++) {
        // Asegúrate de que 9, 7 es un pasillo libre
        ghosts.push({
            x: 9, y: 7, 
            vX: 9, vY: 7,
            color: colors[i],
            speed: 0.1, 
            dirX: 0, dirY: 0,
            wobble: Math.random() * 10 
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        // Animación sutil de las ondas inferiores
        g.wobble += 0.2;

        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;

            let possibleDirs = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(d => {
                let ny = Math.round(g.y + d.dy);
                let nx = Math.round(g.x + d.dx);
                return map[ny] && map[ny][nx] !== 1;
            });

            if (possibleDirs.length > 0) {
                if (possibleDirs.length > 1) {
                    possibleDirs = possibleDirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
                }
                let move = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                g.dirX = move.dx; g.dirY = move.dy;
                g.x += g.dirX; g.y += g.dy;
            }
        }

        // Movimiento visual suave
        if (g.vX < g.x) g.vX = Math.min(g.vX + g.speed, g.x);
        if (g.vX > g.x) g.vX = Math.max(g.vX - g.speed, g.x);
        if (g.vY < g.y) g.vY = Math.min(g.vY + g.speed, g.y);
        if (g.vY > g.y) g.vY = Math.max(g.vY - g.speed, g.y);

        // Colisión
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
        let x = offsetX + g.vX * tileSize + tileSize/2;
        let y = offsetY + g.vY * tileSize + tileSize/2;
        let r = tileSize * 0.45; // Radio del cuerpo

        ctx.fillStyle = g.color;
        
        // --- DIBUJO GEOMÉTRICO EXACTO (image_0.png) ---
        ctx.beginPath();
        // Cabeza Perfecta (Arco superior)
        ctx.arc(x, y, r, Math.PI, 0); 

        // Lado derecho recto
        ctx.lineTo(x + r, y + r);

        // --- ONDAS INFERIORES SIMÉTRICAS ---
        // Construimos las ondas usando curvas de Bézier para que sean suaves como en image_0.png
        let waves = 3;
        let waveWidth = (r * 2) / waves;
        let waveHeight = r * 0.2; // Altura de la onda
        
        for (let iWave = 0; iWave < waves; iWave++) {
            let nextWaveStart = x + r - (iWave + 1) * waveWidth;
            let controlY = y + r + waveHeight;
            // Un pequeño ajuste sutil animado (opcional, pero ayuda)
            controlY += Math.sin(g.wobble + iWave) * 1.5;
            
            // Curva de Bézier cuadrática para cada onda (vástago y valle)
            ctx.quadraticCurveTo(x + r - (iWave * waveWidth) - waveWidth/2, controlY, nextWaveStart, y + r);
        }

        // Lado izquierdo recto (cierra en la cabeza)
        ctx.lineTo(x - r, y);
        ctx.fill();

        // --- OJOS MINIMALISTAS (image_0.png) ---
        // Globos oculares elípticos fijos
        let eyeR_W = r * 0.25;
        let eyeR_H = r * 0.35;
        let eyeOffsetX = r * 0.35;
        let eyeOffsetY = r * 0.1;

        ctx.fillStyle = "white";
        // Ojo Izquierdo
        ctx.beginPath();
        ctx.ellipse(x - eyeOffsetX, y - eyeOffsetY, eyeR_W, eyeR_H, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ojo Derecho
        ctx.beginPath();
        ctx.ellipse(x + eyeOffsetX, y - eyeOffsetY, eyeR_W, eyeR_H, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilas (azules fijas arriba)
        ctx.fillStyle = "#0000FF";
        let pupilR = eyeR_W * 0.6;
        let pupilLookUp = r * 0.15; // Desplazamiento hacia arriba
        
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y - eyeOffsetY - pupilLookUp, pupilR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX, y - eyeOffsetY - pupilLookUp, pupilR, 0, Math.PI * 2);
        ctx.fill();
    }
}