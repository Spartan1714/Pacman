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
    // 1. Coordenadas centrales de Pac-Man
    let x = ox + pacman.vX * size + size / 2;
    let y = oy + pacman.vY * size + size / 2;
    
    // Radio dinámico (Grande con cereza, Normal sin ella)
    let radius = powerMode ? size * 0.70 : size * 0.45;

    ctx.save();

    // 2. TRASLADAR AL CENTRO (Base para todo el dibujo)
    ctx.translate(x, y);

    // 3. ROTACIÓN DEL CUERPO (Hacia dónde mira)
    let rotation = 0;
    if (pacman.dirX === 1) rotation = 0;             // Derecha
    else if (pacman.dirX === -1) rotation = Math.PI;    // Izquierda
    else if (pacman.dirY === 1) rotation = Math.PI / 2; // Abajo
    else if (pacman.dirY === -1) rotation = -Math.PI / 2; // Arriba
    ctx.rotate(rotation);

    // 4. DIBUJAR CUERPO (Círculo Amarillo con Boca en "V")
    ctx.fillStyle = "yellow";
    if (powerMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
    }

    // Animación de boca (Corte limpio)
    let mouthAngle = (Math.sin(Date.now() * 0.02) + 1) * 0.22; // Velocidad y apertura

    ctx.beginPath();
    // Dibujamos el arco dejando el hueco de la boca
    ctx.arc(0, 0, radius, mouthAngle, Math.PI * 2 - mouthAngle);
    // Línea hacia el centro para crear la "V" perfecta de la mandíbula
    ctx.lineTo(0, 0); 
    ctx.fill();

    // 5. EL OJO (Óvalo Expresivo - Estilo Clásico)
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0; // El ojo no brilla

    // Para crear un óvalo sin usar 'ellipse', usamos 'scale' temporalmente
    ctx.save();
    // Posición del ojo: Frente (radius*0.25) y Arriba (radius*-0.5)
    ctx.translate(radius * 0.25, -radius * 0.5);
    // Escalamos el contexto: Ancho normal (1), Alto alargado (1.5)
    ctx.scale(1, 1.5); 
    
    ctx.beginPath();
    // Dibujamos un círculo que, al estar escalado, se convierte en un ÓVALO VERTICAL
    ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore(); // Volvemos a la escala normal

    ctx.restore(); // Volvemos a las coordenadas globales
}