import { map, TILE_SIZE } from "./map.js";

export const pacman = { x: 1, y: 1, dirX: 0, dirY: 0, nextDX: 0, nextDY: 0 };

export function setDirection(dx, dy) {
    pacman.nextDX = dx;
    pacman.nextDY = dy;
}

export function updatePlayer(score, dt) {
    if (!dt) return;
    const SPEED = 4.5;
    let cx = Math.round(pacman.x);
    let cy = Math.round(pacman.y);

    if (Math.abs(pacman.x - cx) < 0.1 && Math.abs(pacman.y - cy) < 0.1) {
        if (map[cy + pacman.nextDY]?.[cx + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX; pacman.dirY = pacman.nextDY;
        }
        if (map[cy + pacman.dirY]?.[cx + pacman.dirX] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.x = cx; pacman.y = cy;
        }
    }

    pacman.x += pacman.dirX * SPEED * dt;
    pacman.y += pacman.dirY * SPEED * dt;

    let mx = Math.round(pacman.x), my = Math.round(pacman.y);
    if (map[my]?.[mx] === 2) { map[my][mx] = 0; score.value += 10; }
    if (map[my]?.[mx] === 4) { 
        map[my][mx] = 0; score.value += 100;
        window.dispatchEvent(new CustomEvent("powerup")); // Aviso de cereza
    }
}

export function drawPlayer(ctx, size, ox, oy) {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ox + pacman.x * size + size/2, oy + pacman.y * size + size/2, size/2.5, 0, Math.PI*2);
    ctx.fill();
}