import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

export let pacman = { x: 1, y: 1, vX: 1, vY: 1, dirX: 0, dirY: 0, nextDX: 0, nextDY: 0 };
const PLAYER_SPEED = 4.0; // AJUSTA ESTO: 2.0 es muy lento, 5.0 es rápido.

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
    // Si no hay dt (primer frame), no hacemos nada
    if (!dt) return;

    // Solo permitimos cambiar de dirección si estamos cerca del centro de un tile
    if (Math.abs(pacman.x - Math.round(pacman.x)) < 0.1 && Math.abs(pacman.y - Math.round(pacman.y)) < 0.1) {
        
        // Intentar girar hacia la nueva dirección solicitada
        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }

        // Si hay un muro enfrente, detenerse
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0;
            pacman.dirY = 0;
            // Ajustar al centro exacto para no quedar "entre tiles"
            pacman.x = Math.round(pacman.x);
            pacman.y = Math.round(pacman.y);
        }
    }

    // MOVER según el tiempo transcurrido (esto garantiza velocidad constante)
    pacman.x += pacman.dirX * PLAYER_SPEED * dt;
    pacman.y += pacman.dirY * PLAYER_SPEED * dt;

    // Interpolación visual para el dibujo
    pacman.vX += (pacman.x - pacman.vX) * 0.4;
    pacman.vY += (pacman.y - pacman.vY) * 0.4;

    let mx = Math.round(pacman.x), my = Math.round(pacman.y);
    if (map[my]?.[mx] === 2) { map[my][mx] = 0; score.value += 10; }
    else if (map[my]?.[mx] === 3) { map[my][mx] = 0; if (onPowerUp) onPowerUp(); }
}

export function drawPlayer(ctx, size, ox, oy) {
    let px = ox + pacman.vX * size + size / 2;
    let py = oy + pacman.vY * size + size / 2;
    let radius = powerMode ? size * 0.70 : size * 0.45;

    ctx.save();
    ctx.translate(px, py);
    
    // Rotación del cuerpo
    let rotation = 0;
    if (pacman.dirX < 0) rotation = Math.PI;
    else if (pacman.dirY > 0) rotation = Math.PI/2;
    else if (pacman.dirY < 0) rotation = -Math.PI/2;
    
    ctx.save();
    ctx.rotate(rotation);
    ctx.fillStyle = "yellow";
    if (powerMode) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; }
    let mouth = (Math.sin(Date.now() * 0.02) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    // El Ojo Ovalado (Siempre arriba)
    ctx.fillStyle = "black";
    let eyeX = (pacman.dirX < 0) ? -radius * 0.25 : radius * 0.25;
    ctx.save();
    ctx.translate(eyeX, -radius * 0.45);
    ctx.scale(0.8, 1.4);
    ctx.beginPath(); ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.restore();
}