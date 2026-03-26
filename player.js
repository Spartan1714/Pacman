import { map } from "./map.js";

export let pacman = {
    x: 1, y: 1,      // Posición en la rejilla (entrenos)
    vX: 1, vY: 1,    // Posición VISUAL (decimales para fluidez)
    dirX: 0, dirY: 0,
    nextDirX: 0, nextDirY: 0,
    speed: 0.15,     // <--- ESTO define la fluidez (0.1 a 0.2 es lo ideal)
    mouth: 0,
    mouthDir: 1
};

export function setDirection(dx, dy) {
    // Guardamos lo que el usuario QUIERE hacer
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
    // 1. Animación de boca (siempre corre)
    pacman.mouth += 0.1 * pacman.mouthDir;
    if (pacman.mouth > 0.3 || pacman.mouth < 0) pacman.mouthDir *= -1;

    // 2. ¿Llegamos al centro de una casilla? 
    // Usamos un pequeño margen (0.1) para saber si estamos "cerca" del centro
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        // ¿Podemos girar hacia donde el usuario quiere (nextDir)?
        if (map[pacman.y + pacman.nextDirY] && map[pacman.y + pacman.nextDirY][pacman.x + pacman.nextDirX] !== 1) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }

        // ¿Podemos seguir avanzando en la dirección actual?
        if (map[pacman.y + pacman.dirY] && map[pacman.y + pacman.dirY][pacman.x + pacman.dirX] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        } else {
            // Chocamos con pared, nos detenemos en seco
            pacman.dirX = 0; pacman.dirY = 0;
        }
    }

    // 3. EL MOVIMIENTO FLUIDO (Interpolación)
    // Esto acerca la posición visual (vX) a la lógica (x) suavemente cada frame
    if (pacman.vX < pacman.x) pacman.vX += pacman.speed;
    if (pacman.vX > pacman.x) pacman.vX -= pacman.speed;
    if (pacman.vY < pacman.y) pacman.vY += pacman.speed;
    if (pacman.vY > pacman.y) pacman.vY -= pacman.speed;

    // Comer puntos
    let mx = Math.round(pacman.vX);
    let my = Math.round(pacman.vY);
    if (map[my] && map[my][mx] === 2) {
        score.value += 10;
        map[my][mx] = 0;
    }
}

export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
    // USAMOS vX y vY PARA DIBUJAR (Fundamental para la fluidez)
    let px = offsetX + pacman.vX * tileSize + tileSize/2;
    let py = offsetY + pacman.vY * tileSize + tileSize/2;
    
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(px, py);
    // Boca que se abre y cierra usando pacman.mouth
    ctx.arc(px, py, tileSize/2.2, pacman.mouth * Math.PI, (2 - pacman.mouth) * Math.PI);
    ctx.fill();
}