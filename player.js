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
export function updatePlayer(score, dt) {
    if (!dt) return;

    const SPEED = 4.5; // Puedes ajustar la velocidad aquí

    // 1. Lógica de intersección: Solo girar cuando estemos cerca del centro de un tile
    let centerX = Math.round(pacman.x);
    let centerY = Math.round(pacman.y);
    
    // Margen de error para permitir el giro (0.1)
    if (Math.abs(pacman.x - centerX) < 0.1 && Math.abs(pacman.y - centerY) < 0.1) {
        
        // ¿Podemos girar a la dirección que el usuario pulsó (nextD)?
        if (map[centerY + pacman.nextDY]?.[centerX + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }

        // ¿La dirección actual nos lleva a un muro? Si es así, frenamos.
        if (map[centerY + pacman.dirY]?.[centerX + pacman.dirX] === 1) {
            pacman.dirX = 0; 
            pacman.dirY = 0;
            // Ajustamos exactamente al centro para que no quede "metido" en el muro
            pacman.x = centerX; 
            pacman.y = centerY;
        }
    }

    // 2. Mover posición lógica
    pacman.x += pacman.dirX * SPEED * dt;
    pacman.y += pacman.dirY * SPEED * dt;

    // 3. Comer puntos y cerezas
    let mx = Math.round(pacman.x);
    let my = Math.round(pacman.y);

    if (map[my]?.[mx] === 2) { 
        // Come punto normal
        map[my][mx] = 0; 
        score.value += 10; 
    } else if (map[my]?.[mx] === 4) { 
        // Come cereza (Power-Up)
        map[my][mx] = 0; 
        score.value += 100; 
        // Nota: No importamos nada de ghosts aquí para evitar el error.
        // El archivo game.js detectará que map[4][9] ya no es 4 y activará el poder.
    }
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