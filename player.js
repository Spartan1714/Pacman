import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

// Estado inicial de Pac-Man
export let pacman = { 
    x: 1, y: 1,     // Posición lógica (decimal)
    vX: 1, vY: 1,   // Posición visual (suave)
    dirX: 0, dirY: 0, 
    nextDX: 0, nextDY: 0 
};

// --- EL PARÁMETRO DE VELOCIDAD ---
// Cambia este 0.08: 
// 0.05 = Muy lento | 0.12 = Normal | 0.20 = Rápido
const SPEED = 0.08; 

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
    // 1. Detección de centros para poder girar
    // Solo permitimos girar si Pac-Man está alineado con la cuadrícula
    let centerX = Math.round(pacman.x);
    let centerY = Math.round(pacman.y);

    if (Math.abs(pacman.x - centerX) < 0.15 && Math.abs(pacman.y - centerY) < 0.15) {
        // Intentar cambiar a la dirección que el usuario quiere (nextDX/DY)
        if (map[centerY + pacman.nextDY]?.[centerX + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }

        // Si hay un muro adelante en la dirección actual, nos detenemos y centramos
        if (map[centerY + pacman.dirY]?.[centerX + pacman.dirX] === 1) {
            pacman.dirX = 0;
            pacman.dirY = 0;
            pacman.x = centerX;
            pacman.y = centerY;
        }
    }

    // 2. APLICAR MOVIMIENTO (Aquí es donde se frena)
    pacman.x += pacman.dirX * SPEED;
    pacman.y += pacman.dirY * SPEED;

    // 3. SUAVIZADO VISUAL
    // La posición visual (vX) persigue a la lógica (x) suavemente
    pacman.vX += (pacman.x - pacman.vX) * 0.2;
    pacman.vY += (pacman.y - pacman.vY) * 0.2;

    // 4. COMER PUNTOS Y CEREZAS
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
    // Posición en píxeles basada en la visual
    let px = ox + pacman.vX * size + size / 2;
    let py = oy + pacman.vY * size + size / 2;
    
    // Crecer si tiene poder
    let radius = powerMode ? size * 0.70 : size * 0.45;

    ctx.save();
    ctx.translate(px, py);

    // --- DIBUJAR CUERPO (Boca rotando) ---
    ctx.save();
    let rotation = 0;
    if (pacman.dirX === -1) rotation = Math.PI;
    else if (pacman.dirY === 1) rotation = Math.PI/2;
    else if (pacman.dirY === -1) rotation = -Math.PI/2;
    ctx.rotate(rotation);

    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }

    let mouth = (Math.sin(Date.now() * 0.015) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore(); // Restauramos para que el ojo NO se voltee

    // --- DIBUJAR OJO (Óvalo vertical fijo arriba) ---
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    
    // Si Pac-Man va a la izquierda, el ojo se mueve a la izquierda del centro
    let eyeX = (pacman.dirX === -1) ? -radius * 0.25 : radius * 0.25;
    
    ctx.save();
    ctx.translate(eyeX, -radius * 0.45); // Siempre arriba del centro (Y negativa)
    ctx.scale(0.8, 1.4); // Transformamos el círculo en un óvalo alto
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
}