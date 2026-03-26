import { map } from "./map.js";

// --- ESTADO DE PACMAN (Ahora con targets para fluidez) ---
export let pacman = {
    // Coordenadas lógicas (en la cuadrícula del mapa)
    gridX: 1, 
    gridY: 1,
    // Coordenadas lógicas de destino
    targetX: 1,
    targetY: 1,
    // Coordenadas visuales (interpoladas para el dibujo)
    visualX: 1,
    visualY: 1,
    
    // Dirección actual e intentada
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0,
    
    speed: 0.2, // Cuánta celda avanza por frame (0.1 a 0.3 es buen rango)
    radius: 0.4, // Relativo al tileSize (0.5 es el máximo)
    mouthOpen: 0,
    isSuper: false,
    angle: 0 // Para rotar a Pacman según la dirección
};

let scoreRef; // Referencia al score de game.js

export function setDirection(dx, dy) {
    // Guardamos la intención del usuario
    pacman.nextDirX = dx;
    pacman.nextDirY = dy;
}

export function resetPlayer() {
    pacman.gridX = 1; pacman.gridY = 1;
    pacman.targetX = 1; pacman.targetY = 1;
    pacman.visualX = 1; pacman.visualY = 1;
    pacman.dirX = 0; pacman.dirY = 0;
    pacman.nextDirX = 0; pacman.nextDirY = 0;
    pacman.isSuper = false;
}

// --- LÓGICA DE MOVIMIENTO FLUIDO ---
export function updatePlayer(currentScore) {
    scoreRef = currentScore;

    // 1. Si Pacman ha llegado casi a su destino lógico, decidir el siguiente target
    let distToTarget = Math.hypot(pacman.targetX - pacman.visualX, pacman.targetY - pacman.visualY);
    
    if (distToTarget < pacman.speed) {
        // Asegurar que estamos clavados en la grilla antes de decidir
        pacman.gridX = pacman.targetX;
        pacman.gridY = pacman.targetY;
        pacman.visualX = pacman.gridX;
        pacman.visualY = pacman.gridY;

        // Intentar cambiar a la dirección que el usuario quiere (nextDir)
        if (canMove(pacman.nextDirX, pacman.nextDirY)) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }

        // Establecer el nuevo target en la dirección actual
        if (canMove(pacman.dirX, pacman.dirY)) {
            pacman.targetX = pacman.gridX + pacman.dirX;
            pacman.targetY = pacman.gridY + pacman.dirY;
            
            // Actualizar ángulo de rotación
            if (pacman.dirX === 1) pacman.angle = 0;
            if (pacman.dirX === -1) pacman.angle = Math.PI;
            if (pacman.dirY === -1) pacman.angle = -Math.PI / 2;
            if (pacman.dirY === 1) pacman.angle = Math.PI / 2;
        } else {
            // Se chocó, detenerse
            pacman.dirX = 0; pacman.dirY = 0;
        }
        
        // --- Comer puntos/frutas (solo cuando llega a la celda) ---
        checkEating();
    }

    // 2. Mover la posición visual hacia el target de forma fluida
    if (pacman.dirX !== 0 || pacman.dirY !== 0) {
        pacman.visualX += pacman.dirX * pacman.speed;
        pacman.visualY += pacman.dirY * pacman.speed;
        
        // Animación de la boca
        pacman.mouthOpen += 0.2;
        if (pacman.mouthOpen > 1) pacman.mouthOpen = 0;
    }
}

function canMove(dx, dy) {
    let nextX = pacman.gridX + dx;
    let nextY = pacman.gridY + dy;
    return map[nextY] && map[nextY][nextX] !== 1;
}

function checkEating() {
    let tile = map[pacman.gridY][pacman.gridX];
    if (tile === 2) { // Punto normal
        scoreRef.value += 10;
        map[pacman.gridY][pacman.gridX] = 0;
    } else if (tile === 3) { // Fruta Poder
        scoreRef.value += 50;
        map[pacman.gridY][pacman.gridX] = 0;
        activatePowerUp();
    }
}

function activatePowerUp() {
    pacman.isSuper = true;
    // Asegurar que la estética cambie (escalado visual en el dibujo)
    setTimeout(() => pacman.isSuper = false, 10000);
}

// --- NUEVA ESTÉTICA DE PACMAN (Gradientes y Rotación) ---
export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
    let x = offsetX + pacman.visualX * tileSize + tileSize / 2;
    let y = offsetY + pacman.visualY * tileSize + tileSize / 2;
    let r = tileSize * pacman.radius;
    
    // Si tiene powerup, hacerlo un poco más grande
    if (pacman.isSuper) r *= 1.2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pacman.angle); // Rotar según la dirección

    // Gradiente para efecto 3D
    let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    gradient.addColorStop(0, "#fff35c"); // Amarillo claro centro
    gradient.addColorStop(1, "#fcc200"); // Amarillo oscuro borde
    ctx.fillStyle = gradient;

    // Calcular apertura de boca (arco senoidal para suavidad)
    let mouthAngle = 0.2 * Math.PI * Math.sin(pacman.mouthOpen * Math.PI);

    // Dibujar cuerpo con boca
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Arco desde el ángulo de la boca abierta superior hasta el inferior
    ctx.arc(0, 0, r, mouthAngle, 2 * Math.PI - mouthAngle);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    // Ojo (opcional, le da más estética)
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(r/3, -r/2, r/6, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
}