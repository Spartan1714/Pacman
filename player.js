import { map, TILE_SIZE } from "./map.js";

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
    // 1. Lógica de giro perfecta
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        // Intentar girar
        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        
        // Colisión frontal
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0; pacman.dirY = 0;
        }
        
        pacman.x += pacman.dirX;
        pacman.y += pacman.dirY;
    }

    // 2. Interpolación ALTA (0.3) para que no haya retraso visual
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
    let radius = size * 0.45;

    ctx.save();
    ctx.fillStyle = "yellow";
    
    // Un brillo muy ligero que no alenta (shadowBlur bajo)
    ctx.shadowBlur = 8;
    ctx.shadowColor = "yellow";

    // Calculamos el ángulo de la boca basándonos en la dirección y el tiempo
    let mouthAngle = (Math.sin(Date.now() * 0.02) + 1) * 0.2; // Velocidad de masticado
    
    // Rotamos el contexto según la dirección para que la boca mire a donde va
    let rotation = 0;
    if (pacman.dirX === 1) rotation = 0;
    else if (pacman.dirX === -1) rotation = Math.PI;
    else if (pacman.dirY === 1) rotation = Math.PI / 2;
    else if (pacman.dirY === -1) rotation = -Math.PI / 2;

    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Dibujamos el arco de Pac-Man (el cuerpo)
    ctx.beginPath();
    // Empezamos el arco dejando el hueco de la boca
    ctx.arc(0, 0, radius, mouthAngle, Math.PI * 2 - mouthAngle);
    
    // Línea hacia el centro para cerrar la "cuña" de la boca
    ctx.lineTo(0, 0);
    ctx.fill();
    
    ctx.restore();
}