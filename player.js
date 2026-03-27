import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

// Añadimos velocidad real y posición fraccionaria
export let pacman = { 
    x: 1, y: 1, 
    vX: 1, vY: 1, 
    dirX: 0, dirY: 0, 
    nextDX: 0, nextDY: 0,
    speed: 4.5 // Velocidad en celdas por segundo
};

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

export function updatePlayer(score, onPowerUp, dt) {
    if (!dt) return;

    // 1. Intentar girar solo cuando estamos cerca del centro de una celda
    const threshold = 0.15;
    let centerX = Math.round(pacman.x);
    let centerY = Math.round(pacman.y);

    if (Math.abs(pacman.x - centerX) < threshold && Math.abs(pacman.y - centerY) < threshold) {
        // ¿Podemos girar a la dirección deseada?
        if (map[centerY + pacman.nextDY]?.[centerX + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
            // Alineación perfecta al girar para evitar atascos
            if(pacman.dirX !== 0) pacman.y = centerY;
            if(pacman.dirY !== 0) pacman.x = centerX;
        }
        // ¿Chocamos con un muro en la dirección actual?
        if (map[centerY + pacman.dirY]?.[centerX + pacman.dirX] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.x = centerX; pacman.y = centerY;
        }
    }

    // 2. Movimiento continuo basado en dt
    pacman.x += pacman.dirX * pacman.speed * dt;
    pacman.y += pacman.dirY * pacman.speed * dt;

    // 3. La visual (vX, vY) ahora sigue a la lógica de forma inmediata para máxima fluidez
    pacman.vX = pacman.x;
    pacman.vY = pacman.y;

    // 4. Comer
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
    let radius = powerMode ? size * 0.60 : size * 0.45; // Ajustado un poco para no ser gigante

    ctx.save();
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }

    let mouth = (Math.sin(Date.now() * 0.015) + 1) * 0.2;
    let angle = 0;
    if (pacman.dirX === -1) angle = Math.PI;
    else if (pacman.dirY === 1) angle = Math.PI/2;
    else if (pacman.dirY === -1) angle = -Math.PI/2;

    ctx.beginPath();
    ctx.arc(x, y, radius, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.lineTo(x, y);
    ctx.fill();

    // Ojo
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    let eyeOffset = radius * 0.4;
    let eyeX = x;
    let eyeY = y;

    if (pacman.dirX === 0 && pacman.dirY === 0) eyeX += eyeOffset; // Mirar al frente si está quieto
    else {
        eyeX += (pacman.dirX !== 0) ? pacman.dirX * eyeOffset : eyeOffset * 0.5;
        eyeY += (pacman.dirY !== 0) ? pacman.dirY * eyeOffset : -eyeOffset * 0.5;
    }

    ctx.beginPath();
    ctx.arc(eyeX, eyeY, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}