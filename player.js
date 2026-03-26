import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

export let pacman = { 
    x: 1, y: 1, 
    vX: 1, vY: 1, 
    dirX: 0, dirY: 0, 
    nextDX: 0, nextDY: 0,
    moveTimer: 0 // Acumulador para controlar la velocidad
};

// --- CONFIGURACIÓN DE VELOCIDAD ---
// 0.2 es lento (Arcade), 0.1 es rápido, 0.05 es super rápido.
const MOVE_DELAY = 0.18; 

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

    // Acumulamos el tiempo transcurrido
    pacman.moveTimer += dt;

    // Solo nos movemos si el acumulador superó el retraso (MOVE_DELAY)
    if (pacman.moveTimer >= MOVE_DELAY) {
        pacman.moveTimer = 0; // Reiniciamos el reloj para el siguiente paso

        // Intentar girar
        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }

        // Verificar colisión frontal antes de avanzar
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        } else {
            pacman.dirX = 0;
            pacman.dirY = 0;
        }

        // Comer puntos o cereza
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

    // INTERPOLACIÓN VISUAL SUAVE (El "vX" sigue al "x" real poco a poco)
    // Bajamos este valor a 0.1 para que el deslizamiento sea lento y no brusco
    pacman.vX += (pacman.x - pacman.vX) * 0.12;
    pacman.vY += (pacman.y - pacman.vY) * 0.12;
}

export function drawPlayer(ctx, size, ox, oy) {
    let px = ox + pacman.vX * size + size / 2;
    let py = oy + pacman.vY * size + size / 2;
    let radius = powerMode ? size * 0.70 : size * 0.45;

    ctx.save();
    ctx.translate(px, py);

    // 1. ROTACIÓN CUERPO
    let rotation = 0;
    if (pacman.dirX === -1) rotation = Math.PI;
    else if (pacman.dirY === 1) rotation = Math.PI/2;
    else if (pacman.dirY === -1) rotation = -Math.PI/2;

    ctx.save();
    ctx.rotate(rotation);
    ctx.fillStyle = "yellow";
    if (powerMode) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; }
    
    // Animación boca
    let mouth = (Math.sin(Date.now() * 0.012) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    // 2. EL OJO OVALADO (Fijo arriba)
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    let eyeX = (pacman.dirX === -1) ? -radius * 0.25 : radius * 0.25;
    
    ctx.save();
    ctx.translate(eyeX, -radius * 0.45);
    ctx.scale(0.8, 1.4); // Óvalo vertical
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
}