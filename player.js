import { map } from "./map.js";

export let pacman = {
    x: 1, y: 1,           // Posición en la rejilla (grid)
    vX: 1, vY: 1,         // Posición visual (la que se desliza, ELIMINA EL LAG)
    dirX: 0, dirY: 0,
    nextDirX: 0, nextDirY: 0,
    speed: 0.15,          // Velocidad de deslizamiento por frame (ajustado para 60fps)
    radius: 0.45,
    mouth: 0,             // Variable para animar la boca
    mouthDir: 1
};

export function setDirection(dx, dy) {
    pacman.nextDirX = dx;
    pacman.nextDirY = dy;
}

export function resetPlayer() {
    pacman.x = 1; pacman.y = 1;
    pacman.vX = 1; pacman.vY = 1;
    pacman.dirX = 0; pacman.dirY = 0;
    pacman.nextDirX = 0; pacman.nextDirY = 0;
}

export function updatePlayer(score) {
    // 1. Animación de la boca (oscila entre 0 y 0.2 PI radianes)
    pacman.mouth += 0.05 * pacman.mouthDir;
    if (pacman.mouth > 0.2 || pacman.mouth < 0) pacman.mouthDir *= -1;

    // 2. Lógica de Rejilla (Snap to Grid)
    // Si la posición visual alcanzó a la lógica, buscamos el siguiente paso.
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        
        // Intentar girar a la dirección deseada (nextDir)
        if (map[pacman.y + pacman.nextDirY][pacman.x + pacman.nextDirX] !== 1) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }

        // Mover si la dirección actual está despejada
        if (map[pacman.y + pacman.dirY][pacman.x + pacman.dirX] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        } else {
            // Se chocó, detenerse
            pacman.dirX = 0;
            pacman.dirY = 0;
            // Alinear posición visual exactamente
            pacman.vX = pacman.x;
            pacman.vY = pacman.y;
        }
    }

    // 3. Deslizamiento Suave (ELIMINA EL LAG VISUAL)
    if (pacman.vX < pacman.x) pacman.vX += pacman.speed;
    if (pacman.vX > pacman.x) pacman.vX -= pacman.speed;
    if (pacman.vY < pacman.y) pacman.vY += pacman.speed;
    if (pacman.vY > pacman.y) pacman.vY -= pacman.speed;

    // 4. Comer puntos
    let currentTile = map[Math.round(pacman.vY)][Math.round(pacman.vX)];
    if (currentTile === 2) { // Asumiendo que 2 son los puntos
        score.value += 10;
        map[Math.round(pacman.vY)][Math.round(pacman.vX)] = 0;
    }
}

export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
    let tx = offsetX + pacman.vX * tileSize + tileSize / 2;
    let ty = offsetY + pacman.vY * tileSize + tileSize / 2;
    let r = tileSize * pacman.radius;

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(tx, ty); // Centro del círculo

    // Rotar la boca según la dirección
    let angleOffset = 0;
    if (pacman.dirX === 1) angleOffset = 0;
    if (pacman.dirX === -1) angleOffset = Math.PI;
    if (pacman.dirY === 1) angleOffset = Math.PI / 2;
    if (pacman.dirY === -1) angleOffset = -Math.PI / 2;

    // Arco que empieza en (boca) y termina en (2PI - boca)
    ctx.arc(tx, ty, r, angleOffset + pacman.mouth * Math.PI, angleOffset + (2 - pacman.mouth) * Math.PI);
    ctx.fill();
}