import { map } from "./map.js";

export let pacman = {
    x: 1,
    y: 1,
    dirX: 0,
    dirY: 0,
    nextDX: 0,
    nextDY: 0,
    speed: 5
};

export function setDirection(dx, dy) {
    pacman.nextDX = dx;
    pacman.nextDY = dy;
}

export function resetPlayer() {
    pacman.x = 1;
    pacman.y = 1;
    pacman.dirX = 0;
    pacman.dirY = 0;
}

export function updatePlayer(score, onPower, dt) {
    let cx = Math.floor(pacman.x + 0.5);
    let cy = Math.floor(pacman.y + 0.5);

    // cambiar dirección si es posible
    if (map[cy + pacman.nextDY]?.[cx + pacman.nextDX] !== 1) {
        pacman.dirX = pacman.nextDX;
        pacman.dirY = pacman.nextDY;
    }

    // bloquear si hay pared
    if (map[cy + pacman.dirY]?.[cx + pacman.dirX] === 1) {
        pacman.dirX = 0;
        pacman.dirY = 0;
    }

    // movimiento REAL (no interpolación)
    pacman.x += pacman.dirX * pacman.speed * dt;
    pacman.y += pacman.dirY * pacman.speed * dt;

    let mx = Math.floor(pacman.x + 0.5);
    let my = Math.floor(pacman.y + 0.5);

    if (map[my]?.[mx] === 2) {
        map[my][mx] = 0;
        score.value += 10;
    }

    if (map[my]?.[mx] === 3) {
        map[my][mx] = 0;
        onPower();
    }
}

export function drawPlayer(ctx, size, ox, oy) {
    let x = ox + pacman.x * size;
    let y = oy + pacman.y * size;

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2.2, 0, Math.PI * 2);
    ctx.fill();
}