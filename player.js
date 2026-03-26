import { map } from "./map.js";

export let pacman = {
    x: 1, y: 1,
    vX: 1, vY: 1,
    dirX: 0, dirY: 0,
    nextDirX: 0, nextDirY: 0,
    speed: 0.12, 
    mouth: 0,
    mouthDir: 1,
    isSuper: false,
    currentAngle: 0
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
    pacman.currentAngle = 0;
    pacman.isSuper = false;
}

export function updatePlayer(score) {
    // Animación boca
    if (pacman.dirX !== 0 || pacman.dirY !== 0) {
        pacman.mouth += 0.15 * pacman.mouthDir;
        if (pacman.mouth > 0.25 || pacman.mouth < 0) pacman.mouthDir *= -1;
    }

    // Lógica de Rejilla
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        if (map[pacman.y + pacman.nextDirY][pacman.x + pacman.nextDirX] !== 1) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
            if (pacman.dirX === 1) pacman.currentAngle = 0;
            if (pacman.dirX === -1) pacman.currentAngle = Math.PI;
            if (pacman.dirY === 1) pacman.currentAngle = Math.PI / 2;
            if (pacman.dirY === -1) pacman.currentAngle = -Math.PI / 2;
        }

        if (map[pacman.y + pacman.dirY][pacman.x + pacman.dirX] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        } else {
            pacman.dirX = 0; pacman.dirY = 0;
        }
    }

    // Movimiento fluido (Interpolación)
    if (pacman.vX !== pacman.x) {
        let diff = pacman.x - pacman.vX;
        pacman.vX += Math.sign(diff) * Math.min(pacman.speed, Math.abs(diff));
    }
    if (pacman.vY !== pacman.y) {
        let diff = pacman.y - pacman.vY;
        pacman.vY += Math.sign(diff) * Math.min(pacman.speed, Math.abs(diff));
    }

    // Comer puntos
    let ty = Math.round(pacman.y);
    let tx = Math.round(pacman.x);
    if (map[ty][tx] === 2 || map[ty][tx] === 3) {
        if (map[ty][tx] === 3) {
            pacman.isSuper = true;
            setTimeout(() => pacman.isSuper = false, 8000);
        }
        score.value += (map[ty][tx] === 3) ? 50 : 10;
        map[ty][tx] = 0;
    }
}

export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
    let tx = offsetX + pacman.vX * tileSize + tileSize / 2;
    let ty = offsetY + pacman.vY * tileSize + tileSize / 2;
    let r = tileSize * 0.45;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(pacman.currentAngle);
    ctx.fillStyle = pacman.isSuper ? "cyan" : "yellow";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, pacman.mouth * Math.PI, (2 - pacman.mouth) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
}