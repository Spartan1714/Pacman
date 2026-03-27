import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

export let pacman = { 
    x: 1, y: 1, vX: 1, vY: 1, 
    dirX: 0, dirY: 0, nextDX: 0, nextDY: 0,
    speed: 4.5 
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
    const threshold = 0.15;
    let centerX = Math.round(pacman.x);
    let centerY = Math.round(pacman.y);

    if (Math.abs(pacman.x - centerX) < threshold && Math.abs(pacman.y - centerY) < threshold) {
        if (map[centerY + pacman.nextDY]?.[centerX + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
            if(pacman.dirX !== 0) pacman.y = centerY;
            if(pacman.dirY !== 0) pacman.x = centerX;
        }
        if (map[centerY + pacman.dirY]?.[centerX + pacman.dirX] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.x = centerX; pacman.y = centerY;
        }
    }

    pacman.x += pacman.dirX * pacman.speed * dt;
    pacman.y += pacman.dirY * pacman.speed * dt;
    pacman.vX = pacman.x;
    pacman.vY = pacman.y;

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
    let radius = powerMode ? size * 0.60 : size * 0.45;

    ctx.save();
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15; ctx.shadowColor = "yellow";
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

    // --- OJO ARCADE QUE SIGUE LA DIRECCIÓN ---
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    
    // Posicionamiento del bloque del ojo según dirección
    if (pacman.dirX === 0 && pacman.dirY === 0) {
        eyeOffsetX = radius * 0.35; eyeOffsetY = -radius * 0.45;
    } else {
        eyeOffsetX = (pacman.dirX * radius * 0.4) + (pacman.dirY !== 0 ? radius * 0.35 : 0);
        eyeOffsetY = (pacman.dirY * radius * 0.4) - (pacman.dirX !== 0 ? radius * 0.45 : 0);
    }

    ctx.beginPath();
    // Dibujamos el ojo como el bloque redondeado de tu diseño
    ctx.roundRect(x + eyeOffsetX - (radius*0.1), y + eyeOffsetY - (radius*0.2), radius*0.2, radius*0.4, 5);
    ctx.fill();
    ctx.restore();
}