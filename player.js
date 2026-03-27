import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

// vX y vY vuelven a ser la posición visual que persigue a la lógica
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
    // Si la visual ha alcanzado a la lógica, buscamos el siguiente movimiento
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        // Intentar girar
        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        // Chocar con muro
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
        }
        
        // Mover lógica una celda
        pacman.x += pacman.dirX;
        pacman.y += pacman.dirY;
    }

    // --- VELOCIDAD CONTROLADA ---
    // Cambiamos el 0.3 original por 0.2 para que vaya más lento y suave
    pacman.vX += (pacman.x - pacman.vX) * 0.2;
    pacman.vY += (pacman.y - pacman.vY) * 0.2;

    let mx = Math.round(pacman.x);
    let my = Math.round(pacman.y);

    if (map[my]?.[mx] === 2) {
        map[my][mx] = 0;
        score.value += 10;
    } else if (map[my]?.[mx] === 3) {
        map[my][mx] = 0;
        score.value += 100;
        if (onPowerUp) onPowerUp(); // Activar poder
    }
}

// RESTAURADO TU DISEÑO ORIGINAL DEL OJO ARCADE
export function drawPlayer(ctx, size, ox, oy) {
    let x = ox + pacman.vX * size + size / 2;
    let y = oy + pacman.vY * size + size / 2;
    let radius = powerMode ? size * 0.60 : size * 0.45;

    ctx.save();
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }

    let mouth = (Math.sin(Date.now() * 0.015) + 1) * 0.2;
    let angle = 0;
    if (pacman.dirX === -1) angle = Math.PI;
    else if (pacman.dirY === 1) angle = Math.PI/2;
    else if (pacman.dirY === -1) angle = -Math.PI/2;

    ctx.beginPath();
    ctx.arc(x, y, radius, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.lineTo(x, y);
    ctx.fill();

    // --- TU OJO ARCADE ORIGINAL RESTAURADO ---
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    
    // Posición fija del ojo respecto al cuerpo, como querías
    let eyeX = x + (radius * 0.3);
    let eyeY = y - (radius * 0.45);
    
    ctx.beginPath();
    // Rectángulo redondeado negro original
    ctx.roundRect(eyeX - (radius*0.07), eyeY - (radius*0.17), radius*0.15, radius*0.35, 5); 
    ctx.fill();
    ctx.restore();
}