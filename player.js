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
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0;
            pacman.dirY = 0;
        }
        pacman.x += pacman.dirX;
        pacman.y += pacman.dirY;
    }

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
    
    // --- EFECTO DE TAMAÑO ---
    // Si powerMode es true, el radio es 1.5 veces más grande (0.7), si no, normal (0.45)
    let radius = powerMode ? size * 0.7 : size * 0.45;

    ctx.save();
    ctx.translate(x, y);
    
    // Rotación según dirección
    let rotation = 0;
    if (pacman.dirX === 1) rotation = 0;
    else if (pacman.dirX === -1) rotation = Math.PI;
    else if (pacman.dirY === 1) rotation = Math.PI / 2;
    else if (pacman.dirY === -1) rotation = -Math.PI / 2;
    ctx.rotate(rotation);

    // CUERPO
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }
    
    let mouth = (Math.sin(Date.now() * 0.02) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();

    // --- EL OJO ---
    ctx.fillStyle = "black";
    ctx.beginPath();
    // Posicionamos el ojo arriba de la boca
    ctx.arc(radius * 0.2, -radius * 0.5, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}