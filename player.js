import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

export let pacman = { 
    x: 1, y: 1, 
    vX: 1, vY: 1, 
    dirX: 0, dirY: 0, 
    nextDX: 0, nextDY: 0,
    frameCounter: 0 // Usaremos esto para contar cuadros del monitor
};

// --- EL CONTROL REAL DE VELOCIDAD ---
// Sube este número para ir MÁS LENTO (ejemplo: 15 o 20)
// Baja este número para ir MÁS RÁPIDO (ejemplo: 5 o 8)
const SPEED_DIVIDER = 12; 

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
    pacman.frameCounter++;

    // SOLO nos movemos cuando el contador llega al divisor
    if (pacman.frameCounter >= SPEED_DIVIDER) {
        pacman.frameCounter = 0; // Reset del contador

        // Intentar girar
        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }

        // Moverse o chocar
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        } else {
            pacman.dirX = 0;
            pacman.dirY = 0;
        }

        // Comer
        let mx = Math.round(pacman.x), my = Math.round(pacman.y);
        if (map[my]?.[mx] === 2) { map[my][mx] = 0; score.value += 10; }
        else if (map[my]?.[mx] === 3) { map[my][mx] = 0; if (onPowerUp) onPowerUp(); }
    }

    // Suavizado visual: Esto hace que Pac-Man se deslice entre los cuadros
    // Si lo sientes "saltón", sube el 0.1 a 0.2
    pacman.vX += (pacman.x - pacman.vX) * 0.15;
    pacman.vY += (pacman.y - pacman.vY) * 0.15;
}

export function drawPlayer(ctx, size, ox, oy) {
    let px = ox + pacman.vX * size + size / 2;
    let py = oy + pacman.vY * size + size / 2;
    let radius = powerMode ? size * 0.70 : size * 0.45;

    ctx.save();
    ctx.translate(px, py);

    // Rotación del cuerpo (Solo si se está moviendo)
    let rotation = 0;
    if (pacman.dirX === -1) rotation = Math.PI;
    else if (pacman.dirY === 1) rotation = Math.PI/2;
    else if (pacman.dirY === -1) rotation = -Math.PI/2;

    ctx.save();
    ctx.rotate(rotation);
    ctx.fillStyle = "yellow";
    if (powerMode) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; }
    
    // Animación de boca (usa el tiempo real para que sea suave)
    let mouth = (Math.sin(Date.now() * 0.01) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    // EL OJO (A prueba de errores: ovalado y fijo arriba)
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    // Si mira a la izquierda, ojo a la izquierda del centro. Si no, a la derecha.
    let eyeX = (pacman.dirX === -1) ? -radius * 0.25 : radius * 0.25;
    
    ctx.save();
    ctx.translate(eyeX, -radius * 0.45); // Y negativa es ARRIBA siempre
    ctx.scale(0.8, 1.4); // Forzamos el óvalo
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
}