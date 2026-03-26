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
    // Si powerMode es true, el radio es más grande (size * 0.7)
    let radius = powerMode ? size * 0.7 : size * 0.45;

    ctx.save();
    
    // EFECTO DE RESPLANDOR (Solo si tiene el poder)
    if (powerMode) {
        ctx.fillStyle = "yellow";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    } else {
        ctx.fillStyle = "yellow";
        ctx.shadowBlur = 0;
    }

    // 1. Calculamos la rotación de la BOCA (pero no de todo el cuerpo)
    let mouth = (Math.sin(Date.now() * 0.02) + 1) * 0.2;
    
    // Dirección de la boca (Ángulos base)
    let baseRotation = 0; // Por defecto a la derecha (0 radianes)
    if (pacman.dirX === -1) baseRotation = Math.PI;      // Izquierda
    else if (pacman.dirY === 1) baseRotation = Math.PI/2; // Abajo
    else if (pacman.dirY === -1) baseRotation = -Math.PI/2; // Arriba

    // Dibujamos el arco del cuerpo dejando el hueco de la boca
    ctx.beginPath();
    ctx.arc(x, y, radius, baseRotation + mouth, baseRotation + (Math.PI * 2) - mouth);
    ctx.lineTo(x, y);
    ctx.fill();

    // 2. --- EL OJO INTELIGENTE (No rota con el cuerpo) ---
    // Dibujamos un ojo retro (cuadrado) o clásico (círculo)
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0; // El ojo no brilla

    // Calculamos el desfase del ojo para que siempre esté arriba y al frente
    // Por defecto, arriba a la derecha de la boca
    let eyeOffsetX = radius * 0.25;
    let eyeOffsetY = -radius * 0.45;

    // Si Pac-Man va a la IZQUIERDA, el ojo debe moverse a la IZQUIERDA (-X)
    if (pacman.dirX === -1) {
        eyeOffsetX = -radius * 0.25;
        // El Offset Y se mantiene negativo (ARRIBA)
    }
    // Si va hacia ABAJO, el ojo se mueve según la rotación de la boca,
    // pero para este estilo retro, mantenerlo arriba y al frente funciona mejor.
    
    ctx.beginPath();
    // Ojo Clásico (Círculo)
    ctx.arc(x + eyeOffsetX, y + eyeOffsetY, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}