import { map } from "./map.js";

export let pacman = {
    x: 1, y: 1,           // Celda lógica
    vX: 1, vY: 1,         // Posición visual (la que se dibuja)
    dirX: 0, dirY: 0,
    nextDirX: 0, nextDirY: 0,
    speed: 0.15,          // Velocidad de deslizamiento (ajústala si va muy rápido)
    mouth: 0,
    mouthDir: 1,
    isSuper: false
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
    // Animación de la boca (cambia el 0.1 para velocidad de masticado)
    pacman.mouth += 0.15 * pacman.mouthDir;
    if (pacman.mouth > 0.25 || pacman.mouth < 0) pacman.mouthDir *= -1;

    // Lógica de "Snap to Grid" (ajuste a la rejilla)
    // Si la posición visual alcanzó a la posición lógica, buscamos el siguiente paso
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        // Intentar girar a donde el usuario quiere
        if (map[pacman.y + pacman.nextDirY][pacman.x + pacman.nextDirX] !== 1) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }

        // Mover si no hay muro
        if (map[pacman.y + pacman.dirY][pacman.x + pacman.dirX] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        }
    }

    // Deslizamiento fluido
    if (pacman.vX < pacman.x) pacman.vX += pacman.speed;
    if (pacman.vX > pacman.x) pacman.vX -= pacman.speed;
    if (pacman.vY < pacman.y) pacman.vY += pacman.speed;
    if (pacman.vY > pacman.y) pacman.vY -= pacman.speed;

    // Comer
    let gx = Math.round(pacman.vX);
    let gy = Math.round(pacman.vY);
    if (map[gy][gx] === 2 || map[gy][gx] === 3) {
        if (map[gy][gx] === 3) {
            pacman.isSuper = true;
            setTimeout(() => pacman.isSuper = false, 8000);
        }
        score.value += (map[gy][gx] === 3) ? 50 : 10;
        map[gy][gx] = 0;
    }
}

export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
    let tx = offsetX + pacman.vX * tileSize + tileSize / 2;
    let ty = offsetY + pacman.vY * tileSize + tileSize / 2;
    let r = tileSize * 0.45;

    ctx.save();
    ctx.translate(tx, ty);
    
    // Rotar según dirección
    if (pacman.dirX === 1) ctx.rotate(0);
    else if (pacman.dirX === -1) ctx.rotate(Math.PI);
    else if (pacman.dirY === 1) ctx.rotate(Math.PI / 2);
    else if (pacman.dirY === -1) ctx.rotate(-Math.PI / 2);

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Dibujo de la boca abierta
    ctx.arc(0, 0, r, pacman.mouth * Math.PI, (2 - pacman.mouth) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
}