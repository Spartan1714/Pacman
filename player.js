import { map, TILE_SIZE } from "./map.js";
import { powerMode } from "./ghosts.js"; // Importamos para saber cuándo crecer

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
    if (Math.abs(pacman.x - pacman.vX) < 0.1 && Math.abs(pacman.y - pacman.vY) < 0.1) {
        pacman.vX = pacman.x;
        pacman.vY = pacman.y;

        if (map[Math.round(pacman.y + pacman.nextDY)]?.[Math.round(pacman.x + pacman.nextDX)] !== 1) {
            pacman.dirX = pacman.nextDX;
            pacman.dirY = pacman.nextDY;
        }
        if (map[Math.round(pacman.y + pacman.dirY)]?.[Math.round(pacman.x + pacman.dirX)] === 1) {
            pacman.dirX = 0;
            pacman.dirY = 0;
        }
        pacman.x += pacman.dirX;
        pacman.y += pacman.dirY;
    }

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
    // Posición central de Pac-Man
    let x = ox + pacman.vX * size + size / 2;
    let y = oy + pacman.vY * size + size / 2;
    
    // Radio dinámico (Grande con cereza)
    let radius = powerMode ? size * 0.75 : size * 0.45;

    ctx.save();

    // 1. ÁNGULO DE LA BOCA (Animación)
    // El ángulo se abre y cierra entre 0.1 y 0.4 radianes
    let mouthOpen = (Math.sin(Date.now() * 0.02) + 1) * 0.2; 
    
    // 2. ORIENTACIÓN (Hacia dónde mira)
    let rotation = 0;
    if (pacman.dirX === 1) rotation = 0;             // Derecha
    else if (pacman.dirX === -1) rotation = Math.PI;    // Izquierda
    else if (pacman.dirY === 1) rotation = Math.PI / 2; // Abajo
    else if (pacman.dirY === -1) rotation = -Math.PI / 2; // Arriba

    // Trasladamos al centro de Pac-Man y rotamos TODO el dibujo
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // 3. DIBUJAR CUERPO (Con efecto Neón si tiene poder)
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }

    ctx.beginPath();
    // Dibujamos el arco desde el ángulo de la boca superior hasta el inferior
    ctx.arc(0, 0, radius, mouthOpen, Math.PI * 2 - mouthOpen);
    ctx.lineTo(0, 0); // Cerramos hacia el centro para crear la "V" de la boca
    ctx.fill();

    // 4. EL OJO (Estilo Clásico)
    // Lo dibujamos relativo al centro rotado. 
    // Siempre estará "arriba" (Y negativa) y un poco al "frente" (X positiva)
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0; // El ojo no brilla
    
    ctx.beginPath();
    // Posición: frente (radius*0.2) y arriba (radius*-0.5)
    // Lo hacemos un poco ovalado para más estilo
    ctx.ellipse(radius * 0.2, -radius * 0.5, radius * 0.12, radius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}