import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js"; // Importamos para saber cuándo crecer

export let pacman = { x: 1, y: 1, vX: 1, vY: 1, dirX: 0, dirY: 0, nextDX: 0, nextDY: 0 };

export function setDirection(dx, dy) {
    pacman.nextDX = dx;
    pacman.nextDY = dy;
}

export function resetPlayer() {
    pacman.x = 1; pacman.y = 1;
    pacman.vX = 1; pacman.vY = 1;
    pacman.dirX = 0; pacman.dirY = 0;
    pacman.nextDX = 0; pacman.nextDY = 0;
}

export function updatePlayer(score, onPowerUp) {
    if (Math.abs(pacman.x - pacman.vX) < 0.25 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0.8;
            pacman.dirY = 0.8;
        }
        pacman.x += pacman.dirX;
        pacman.y += pacman.dirY;
    }

    pacman.vX += (pacman.x - pacman.vX) * 0.15;
    pacman.vY += (pacman.y - pacman.vY) * 0.15;

    let mx = Math.round(pacman.x);
    let my = Math.round(pacman.y);

    if (map[my]?.[mx] === 2) {
        map[my][mx] = 0;
        score.value += 10;
    } else if (map[my]?.[mx] === 3) {
        map[my][mx] = 0;
        if (onPowerUp) onPowerUp(); 
    }
}
export function drawPlayer(ctx, size, ox, oy) {
    let x = ox + pacman.vX * size + size / 2;
    let y = oy + pacman.vY * size + size / 2;
    let radius = powerMode ? size * 0.75 : size * 0.45;

    ctx.save();

    // 1. CUERPO (Círculo Amarillo)
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }

    // Animación de boca
    let mouth = (Math.sin(Date.now() * 0.02) + 1) * 0.2;
    
    // Rotación de la BOCA (Solo la boca)
    let angle = 0;
    if (pacman.dirX === -1) angle = Math.PI;
    else if (pacman.dirY === 1) angle = Math.PI/2;
    else if (pacman.dirY === -1) angle = -Math.PI/2;

    ctx.beginPath();
    ctx.arc(x, y, radius, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.lineTo(x, y);
    ctx.fill();

    // 2. EL OJO (Dibujo Manual - No se voltea nunca)
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;

    // Calculamos dónde debe ir el ojo según la dirección
    // Queremos que siempre esté ARRIBA de la boca
    let eyeX = x;
    let eyeY = y - (radius * 0.45); // Siempre arriba del centro

    if (pacman.dirX === -1) {
        eyeX = x - (radius * 0.3); // A la izquierda si mira a la izquierda
    } else {
        eyeX = x + (radius * 0.3); // A la derecha en los demás casos
    }

    // Dibujamos un ÓVALO / RECTÁNGULO VERTICAL (Estilo Arcade)
    // Usamos fillRect para asegurar que sea un bloque y no un punto
    let eyeW = radius * 0.15; // Ancho del ojo
    let eyeH = radius * 0.35; // Alto del ojo (¡Aquí está el estilo!)

    // Dibujamos el ojo centrado en eyeX, eyeY
    ctx.beginPath();
    ctx.roundRect(eyeX - eyeW/2, eyeY - eyeH/2, eyeW, eyeH, 5); 
    ctx.fill();

    ctx.restore();
}