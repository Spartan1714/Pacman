import { map } from "./map.js";

export let pacman = {
    x: 1, y: 1,           // Posición en la rejilla (grid)
    vX: 1, vY: 1,         // Posición visual (para el dibujo suave)
    dirX: 0, dirY: 0,
    nextDirX: 0, nextDirY: 0,
    speed: 0.15,          // Velocidad de deslizamiento
    radius: 0.45,
    isSuper: false,
    mouth: 0,
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
    pacman.isSuper = false;
}

export function updatePlayer(score) {
    // 1. Animación de la boca
    pacman.mouth += 0.1 * pacman.mouthDir;
    if (pacman.mouth > 0.2 || pacman.mouth < 0) pacman.mouthDir *= -1;

    // 2. Lógica de movimiento suave hacia el objetivo
    // Si estamos cerca del centro de una celda, intentamos cambiar de dirección
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        
        // Intentar girar a la dirección deseada por el usuario
        if (map[pacman.y + pacman.nextDirY][pacman.x + pacman.nextDirX] !== 1) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }

        // Si hay pared enfrente en la dirección actual, detenerse
        if (map[pacman.y + pacman.dirY][pacman.x + pacman.dirX] === 1) {
            pacman.dirX = 0;
            pacman.dirY = 0;
            pacman.vX = pacman.x;
            pacman.vY = pacman.y;
        } else {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        }
    }

    // Deslizar la posición visual hacia la posición de la rejilla
    if (pacman.vX < pacman.x) pacman.vX += pacman.speed;
    if (pacman.vX > pacman.x) pacman.vX -= pacman.speed;
    if (pacman.vY < pacman.y) pacman.vY += pacman.speed;
    if (pacman.vY > pacman.y) pacman.vY -= pacman.speed;

    // 3. Comer puntos o frutas
    let currentTile = map[Math.round(pacman.vY)][Math.round(pacman.vX)];
    if (currentTile === 2 || currentTile === 3) {
        score.value += (currentTile === 3) ? 50 : 10;
        if (currentTile === 3) {
            pacman.isSuper = true;
            setTimeout(() => pacman.isSuper = false, 8000);
        }
        map[Math.round(pacman.vY)][Math.round(pacman.vX)] = 0;
    }
}

export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
    let tx = offsetX + pacman.vX * tileSize + tileSize / 2;
    let ty = offsetY + pacman.vY * tileSize + tileSize / 2;
    let r = (tileSize / 2) * (pacman.isSuper ? 1.2 : 0.9);

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    
    // Calcular ángulo según dirección
    let angle = 0;
    if (pacman.dirX === 1) angle = 0;
    if (pacman.dirX === -1) angle = Math.PI;
    if (pacman.dirY === 1) angle = Math.PI/2;
    if (pacman.dirY === -1) angle = -Math.PI/2;

    ctx.arc(tx, ty, r, angle + pacman.mouth * Math.PI, angle + (2 - pacman.mouth) * Math.PI);
    ctx.fill();
}