import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

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
    // Mantenemos tu lógica de umbral 0.1 para que no haya tirones
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
        }
        pacman.x += pacman.dirX;
        pacman.y += pacman.dirY;
    }

    // Tu interpolación original de 0.3 para suavidad total
    pacman.vX += (pacman.x - pacman.vX) * 0.3;
    pacman.vY += (pacman.y - pacman.vY) * 0.3;

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
    let radius = powerMode ? size * 0.70 : size * 0.45;

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

    // --- DISEÑO DEL OJO CORREGIDO (FIJO Y ARCADE) ---
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    
    // Posición fija arriba del centro para que no "baile"
    let eyeX = x + (radius * 0.2); 
    let eyeY = y - (radius * 0.45);

    ctx.beginPath();
    // Tu diseño de rectángulo redondeado original
    ctx.roundRect(eyeX - (radius*0.07), eyeY - (radius*0.17), radius*0.15, radius*0.35, 5); 
    ctx.fill();
    ctx.restore();
}