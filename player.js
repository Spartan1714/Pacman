import { map, TILE_SIZE } from "./map.js";

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
    // MOVIMIENTO FLUIDO: Solo gira en el centro de la celda
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        // ¿Puede girar a donde el usuario quiere?
        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        
        // ¿Choca con pared en su direccion actual?
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0;
            pacman.dirY = 0;
        }
        
        pacman.x += pacman.dirX;
        pacman.y += pacman.dirY;
    }

    // Suavizado visual (Interpolación) - ESTO ES LO QUE DA FLUIDEZ
    pacman.vX += (pacman.x - pacman.vX) * 0.12;
    pacman.vY += (pacman.y - pacman.vY) * 0.12;

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
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    let mouth = (Math.sin(Date.now() * 0.01) + 1) * 0.2;
    ctx.arc(x, y, size * 0.4, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(x, y);
    ctx.fill();
}