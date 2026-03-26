import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

export let pacman = { 
    x: 1, y: 1, vX: 1, vY: 1, 
    dirX: 0, dirY: 0, nextDX: 0, nextDY: 0 
};

// --- VELOCIDAD REAL (Celdas por segundo) ---
// 4.5 significa que cruzará 4.5 cuadros del mapa en 1 segundo, 
// sin importar si el monitor es de 60Hz o 300Hz.
const VELOCIDAD_BASE = 4.5; 

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
    if (!dt) return; // Seguridad para el primer frame

    // 1. Intentar girar o detenerse (Lógica de colisión mejorada)
    // Calculamos si estamos cerca del "corazón" de la celda
    let centerX = Math.round(pacman.x);
    let centerY = Math.round(pacman.y);
    let distanciaAlCentro = Math.hypot(pacman.x - centerX, pacman.y - centerY);

    if (distanciaAlCentro < 0.2) {
        // ¿Quiere girar?
        if (map[centerY + pacman.nextDY]?.[centerX + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        // ¿Hay muro enfrente?
        if (map[centerY + pacman.dirY]?.[centerX + pacman.dirX] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.x = centerX; pacman.y = centerY;
        }
    }

    // 2. MOVIMIENTO ADAPTATIVO
    // Multiplicamos por dt (segundos transcurridos desde el último frame)
    pacman.x += pacman.dirX * VELOCIDAD_BASE * dt;
    pacman.y += pacman.dirY * VELOCIDAD_BASE * dt;

    // 3. SUAVIZADO VISUAL (vX persigue a x)
    // Usamos una tasa de aprendizaje basada en dt para que sea igual en todo monitor
    let lerpFactor = 1 - Math.pow(0.001, dt); 
    pacman.vX += (pacman.x - pacman.vX) * lerpFactor;
    pacman.vY += (pacman.y - pacman.vY) * lerpFactor;

    // Comer
    let mx = Math.round(pacman.x), my = Math.round(pacman.y);
    if (map[my]?.[mx] === 2) { map[my][mx] = 0; score.value += 10; }
    else if (map[my]?.[mx] === 3) { map[my][mx] = 0; if (onPowerUp) onPowerUp(); }
}

export function drawPlayer(ctx, size, ox, oy) {
    let px = ox + pacman.vX * size + size / 2;
    let py = oy + pacman.vY * size + size / 2;
    let radius = powerMode ? size * 0.75 : size * 0.45;

    ctx.save();
    ctx.translate(px, py);

    // Cuerpo (Boca)
    ctx.save();
    let rotation = (pacman.dirX === -1) ? Math.PI : 
                   (pacman.dirY === 1) ? Math.PI/2 : 
                   (pacman.dirY === -1) ? -Math.PI/2 : 0;
    ctx.rotate(rotation);
    ctx.fillStyle = "yellow";
    if (powerMode) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; }
    let mouth = (Math.sin(Date.now() * 0.01) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    // Ojo Ovalado Profesional (Fijo arriba)
    ctx.fillStyle = "black";
    let eyeX = (pacman.dirX === -1) ? -radius * 0.3 : radius * 0.3;
    ctx.save();
    ctx.translate(eyeX, -radius * 0.45);
    ctx.scale(0.8, 1.4);
    ctx.beginPath(); ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.restore();
}