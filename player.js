import { map } from "./map.js";

export let pacman = { 
    x: 1, y: 1, dirX: 0, dirY: 0, nextDX: 0, nextDY: 0,
    angle: 0 // Para la rotación suave
};

// AJUSTE DE VELOCIDAD: 5.0 es velocidad estándar de Pac-Man.
const SPEED = 5.0; 

export function setDirection(dx, dy) {
    pacman.nextDX = dx;
    pacman.nextDY = dy;
}

export function updatePlayer(score, dt) {
    if (!dt) return;

    // Lógica de intersección: Solo girar cuando estemos cerca del centro de un tile
    let centerX = Math.round(pacman.x);
    let centerY = Math.round(pacman.y);
    
    if (Math.abs(pacman.x - centerX) < 0.1 && Math.abs(pacman.y - centerY) < 0.1) {
        // ¿Podemos girar a la dirección deseada?
        if (map[centerY + pacman.nextDY]?.[centerX + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        // ¿Chocamos con un muro?
        if (map[centerY + pacman.dirY]?.[centerX + pacman.dirX] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.x = centerX; pacman.y = centerY;
        }
    }

    // Mover posición lógica
    pacman.x += pacman.dirX * SPEED * dt;
    pacman.y += pacman.dirY * SPEED * dt;

    // Comer puntos
    let mx = Math.round(pacman.x), my = Math.round(pacman.y);
    if (map[my]?.[mx] === 2) { map[my][mx] = 0; score.value += 10; }
}

export function drawPlayer(ctx, size, ox, oy) {
    let px = ox + pacman.x * size + size / 2;
    let py = oy + pacman.y * size + size / 2;
    let r = size * 0.45;

    ctx.save();
    ctx.translate(px, py);

    // Rotar cuerpo según dirección
    let angle = (pacman.dirX === -1) ? Math.PI : (pacman.dirY === 1) ? Math.PI/2 : (pacman.dirY === -1) ? -Math.PI/2 : 0;
    
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = "yellow";
    let mouth = (Math.sin(Date.now() * 0.015) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    // OJO OVALADO PROFESIONAL (Fijo, no rota con el cuerpo)
    ctx.fillStyle = "black";
    let eyeX = (pacman.dirX === -1) ? -r * 0.35 : r * 0.35;
    ctx.save();
    ctx.translate(eyeX, -r * 0.5);
    ctx.scale(0.7, 1.3); // Forma de óvalo alto
    ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.restore();
}