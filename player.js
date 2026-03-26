import { map } from "./map.js";

export let pacman = {
    x: 1, y: 1,
    vX: 1, vY: 1,
    dirX: 0, dirY: 0,
    nextDirX: 0, nextDirY: 0,
    speed: 0.15, 
    mouth: 0,
    mouthDir: 1,
    angle: 0
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
    // Animación de boca: siempre corre para dar sensación de vida
    pacman.mouth += 0.2 * pacman.mouthDir;
    if (pacman.mouth > 0.4 || pacman.mouth < 0.1) pacman.mouthDir *= -1;

    // Lógica de movimiento por rejilla
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        // Intentar girar (Validación de seguridad con '&&')
        if (map[pacman.y + pacman.nextDirY] && map[pacman.y + pacman.nextDirY][pacman.x + pacman.nextDirX] !== 1) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }

        // Moverse si no hay pared
        if (map[pacman.y + pacman.dirY] && map[pacman.y + pacman.dirY][pacman.x + pacman.dirX] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        }
    }

    // Suavizado visual (Interpolación)
    if (pacman.vX < pacman.x) { pacman.vX += pacman.speed; pacman.angle = 0; }
    else if (pacman.vX > pacman.x) { pacman.vX -= pacman.speed; pacman.angle = Math.PI; }
    else if (pacman.vY < pacman.y) { pacman.vY += pacman.speed; pacman.angle = Math.PI/2; }
    else if (pacman.vY > pacman.y) { pacman.vY -= pacman.speed; pacman.angle = -Math.PI/2; }

    // Comer puntos
    let mx = Math.round(pacman.x);
    let my = Math.round(pacman.y);
    if (map[my] && (map[my][mx] === 2 || map[my][mx] === 3)) {
        score.value += 10;
        map[my][mx] = 0;
    }
}

export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
    let px = offsetX + pacman.vX * tileSize + tileSize/2;
    let py = offsetY + pacman.vY * tileSize + tileSize/2;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(pacman.angle);
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0,0);
    // Arco dinámico según pacman.mouth
    ctx.arc(0, 0, tileSize/2.2, pacman.mouth, Math.PI * 2 - pacman.mouth);
    ctx.lineTo(0,0);
    ctx.fill();
    ctx.restore();
}