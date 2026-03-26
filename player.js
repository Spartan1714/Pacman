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
    let radius = powerMode ? size * 0.75 : size * 0.45;

    ctx.save();
    ctx.translate(x, y);

    // 1. ANIMACIÓN DE BOCA
    let mouthOpen = (Math.sin(Date.now() * 0.02) + 1) * 0.2; 
    
    // 2. ROTACIÓN DEL CUERPO (Boca)
    let rotation = 0;
    if (pacman.dirX === 1) rotation = 0;
    else if (pacman.dirX === -1) rotation = Math.PI;
    else if (pacman.dirY === 1) rotation = Math.PI / 2;
    else if (pacman.dirY === -1) rotation = -Math.PI / 2;

    // Dibujamos el cuerpo amarillo rotado
    ctx.save();
    ctx.rotate(rotation);
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouthOpen, Math.PI * 2 - mouthOpen);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore(); // Restauramos para que el ojo NO rote con la boca

    // 3. EL OJO (Posicionamiento Manual para que no se voltee)
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    
    let eyeX = 0;
    let eyeY = -radius * 0.45; // Siempre ARRIBA (Y negativa)

    // Ajustamos X del ojo según hacia dónde mira
    if (pacman.dirX === -1) {
        eyeX = -radius * 0.2; // Un poco a la izquierda si va a la izquierda
    } else if (pacman.dirX === 1 || pacman.dirX === 0) {
        eyeX = radius * 0.2;  // Un poco a la derecha si va a la derecha o está quieto
    }
    
    // Si va hacia arriba o abajo, centramos el ojo un poco para que se vea tridimensional
    if (pacman.dirY !== 0 && pacman.dirX === 0) {
        eyeX = radius * 0.1; 
    }

    ctx.beginPath();
    // Dibujamos un ojo ovalado
    ctx.ellipse(eyeX, eyeY, radius * 0.12, radius * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}