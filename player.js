import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js";

export let pacman = { 
    x: 1, y: 1, vX: 1, vY: 1, 
    dirX: 0, dirY: 0, nextDX: 0, nextDY: 0,
    lastMove: 0 // Guardaremos la hora exacta del último paso
};

// --- PARÁMETRO DE VELOCIDAD (Milisegundos) ---
// 150ms es una velocidad clásica. 
// Si lo quieres MÁS LENTO, sube a 200. Si lo quieres MÁS RÁPIDO, baja a 100.
const PACMAN_MS = 150; 

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
    let ahora = Date.now();

    // ¿Ha pasado suficiente tiempo desde el último movimiento?
    if (ahora - pacman.lastMove >= PACMAN_MS) {
        pacman.lastMove = ahora;

        let cx = Math.round(pacman.x);
        let cy = Math.round(pacman.y);

        // Intentar girar
        if (map[cy + pacman.nextDY]?.[cx + pacman.nextDX] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }

        // Avanzar o chocar
        if (map[cy + pacman.dirY]?.[cx + pacman.dirX] !== 1) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;
        } else {
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.x = cx; pacman.y = cy;
        }

        // Comer
        let mx = Math.round(pacman.x), my = Math.round(pacman.y);
        if (map[my]?.[mx] === 2) { map[my][mx] = 0; score.value += 10; }
        else if (map[my]?.[mx] === 3) { map[my][mx] = 0; if (onPowerUp) onPowerUp(); }
    }

    // Suavizado visual (independiente del freno para que no se vea trabado)
    pacman.vX += (pacman.x - pacman.vX) * 0.15;
    pacman.vY += (pacman.y - pacman.vY) * 0.15;
}

export function drawPlayer(ctx, size, ox, oy) {
    let px = ox + pacman.vX * size + size / 2;
    let py = oy + pacman.vY * size + size / 2;
    let radius = powerMode ? size * 0.75 : size * 0.45;

    ctx.save();
    ctx.translate(px, py);

    // Cuerpo
    ctx.save();
    let rotation = 0;
    if (pacman.dirX === -1) rotation = Math.PI;
    else if (pacman.dirY === 1) rotation = Math.PI/2;
    else if (pacman.dirY === -1) rotation = -Math.PI/2;
    ctx.rotate(rotation);
    ctx.fillStyle = "yellow";
    if (powerMode) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; }
    let mouth = (Math.sin(Date.now() * 0.01) + 1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    // Ojo Ovalado Fijo
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    let eyeX = (pacman.dirX === -1) ? -radius * 0.3 : radius * 0.3;
    ctx.save();
    ctx.translate(eyeX, -radius * 0.45);
    ctx.scale(0.8, 1.4);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
}