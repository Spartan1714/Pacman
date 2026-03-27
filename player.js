import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

// Mantenemos tu configuración de velocidad y fluidez original intacta
export let pacman = { 
    x: 1, y: 1, 
    vX: 1, vY: 1, 
    dirX: 0, dirY: 0, 
    nextDX: 0, nextDY: 0,
    speed: 4.5 // Tu velocidad original
};

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

    // Tu lógica de giro y fluidez original intacta
    const threshold = 0.15;
    let centerX = Math.round(pacman.x);
    let centerY = Math.round(pacman.y);

    if (Math.abs(pacman.x - centerX) < threshold && Math.abs(pacman.y - centerY) < threshold) {
        if (map[centerY + pacman.nextDY]?.[centerX + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
            if(pacman.dirX !== 0) pacman.y = centerY;
            if(pacman.dirY !== 0) pacman.x = centerX;
        }
        if (map[centerY + pacman.dirY]?.[centerX + pacman.dirX] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.x = centerX; pacman.y = centerY;
        }
    }

    pacman.x += pacman.dirX * pacman.speed * dt;
    pacman.y += pacman.dirY * pacman.speed * dt;

    pacman.vX = pacman.x;
    pacman.vY = pacman.y;

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
    let radius = powerMode ? size * 0.60 : size * 0.45;

    ctx.save();
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }

    let mouth = (Math.sin(Date.now() * 0.015) + 1) * 0.2;
    let angle = 0;
    if (pacman.dirX === -1) angle = Math.PI; // Izquierda
    else if (pacman.dirY === 1) angle = Math.PI/2; // Abajo
    else if (pacman.dirY === -1) angle = -Math.PI/2; // Arriba

    // Dibujar cuerpo y boca
    ctx.beginPath();
    ctx.arc(x, y, radius, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.lineTo(x, y);
    ctx.fill();

    // --- CORRECCIÓN DEL OJO QUE SIGUE LA DIRECCIÓN ---
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    
    // Calculamos el desplazamiento del ojo basado en la dirección actual
    // Si pacman está quieto (dirX y dirY son 0), el ojo se queda en una posición neutra (por ejemplo, arriba y a la derecha).
    
    let baseOffset = radius * 0.45; // Qué tan lejos está el ojo del centro
    let eyeX = x;
    let eyeY = y;
    let eyeRotation = angle; // El ojo rota con la boca

    if (pacman.dirX === 0 && pacman.dirY === 0) {
        // Posición neutral arriba a la derecha si está quieto
        eyeX += baseOffset * 0.6;
        eyeY -= baseOffset;
    } else {
        // Calculamos la posición visual del ojo que sigue a la boca (rota con el ángulo)
        // Usamos trigonometría para que el ojo se mueva en el círculo correctamente
        
        let visualAngle = angle - Math.PI / 2.8; // Desplazamiento visual para que no esté sobre la boca
        if(pacman.dirX === -1) visualAngle = angle + Math.PI / 1.5; // Ajuste específico para izquierda

        eyeX += Math.cos(visualAngle) * baseOffset * 1.0;
        eyeY += Math.sin(visualAngle) * baseOffset * 1.0;
    }
    
    // Restauramos el roundRect (el rectángulo redondeado negro arcade)
    ctx.beginPath();
    // Lo colocamos y rotamos para que mire en la dirección correcta
    ctx.translate(eyeX, eyeY); // Movemos el origen al ojo
    ctx.rotate(angle); // Rotamos el ojo con la dirección del cuerpo

    // El rectángulo del ojo, dibujado en relación con su propio origen rotado
    // (x, y, ancho, alto, radio de esquina)
    // El ojo es un bloque vertical, por eso el alto (0.35) es mayor que el ancho (0.15)
    ctx.roundRect(- (radius*0.07), - (radius*0.17), radius*0.15, radius*0.35, 5); 
    ctx.fill();
    
    ctx.restore();
}