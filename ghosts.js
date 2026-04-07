import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

// --- ESTADO GLOBAL ---
export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

// --- EXPORTS DE CONTROL (Requeridos por game.js) ---
export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

// --- FÍSICA Y COMPORTAMIENTO ---
export function spawnGhosts(level = 1) {
    const speed = 2.1 + (level * 0.15);
    // Definición de entidades con sus propiedades visuales y de IA originales
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "#FF0000", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "#FFB8FF", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "#00FFFF", mode: "random", dead: false, speed: speed }
    ];
}

export function updateGhosts(lives, score, dt) {
    if (!dt || ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let currentSpeed = powerMode ? g.speed * 0.6 : g.speed;

        // 1. SISTEMA DE RIEL (Corrección de deriva decimal)
        // Forzamos al fantasma al centro del pasillo en el eje en el que no se desplaza
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        // 2. DETECCIÓN DE INTERSECCIÓN (Lógica de Decisión Predictiva)
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);
        
        // Calculamos si el fantasma está lo suficientemente cerca del centro para girar
        if (Math.abs(g.x - gx) < 0.1 && Math.abs(g.y - gy) < 0.1) {
            
            // Verificamos si hay un muro inmediatamente adelante
            let wallAhead = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            if (wallAhead || esCruce(gx, gy)) {
                // Ajuste de precisión antes del giro
                g.x = gx;
                g.y = gy;
                ejecutarIA(g);
            }
        }

        // 3. INTEGRACIÓN DE MOVIMIENTO
        g.x += g.dirX * currentSpeed * dt;
        g.y += g.dirY * currentSpeed * dt;

        // 4. SISTEMA DE COLISIONES (Capa de lógica de juego)
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.75) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else {
                lives.value--;
                resetPlayer(); 
            }
        }
    });
}

// --- SUB-SISTEMAS AUXILIARES ---

function esCruce(x, y) {
    let pasillos = 0;
    if (map[y][x + 1] !== 1) pasillos++;
    if (map[y][x - 1] !== 1) pasillos++;
    if (map[y + 1][x] !== 1) pasillos++;
    if (map[y - 1][x] !== 1) pasillos++;
    return pasillos > 2;
}

function ejecutarIA(g) {
    let opciones = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ].filter(opt => {
        let tx = Math.round(g.x + opt.dx);
        let ty = Math.round(g.y + opt.dy);
        // Regla: No muros y no dirección opuesta (evita vibración)
        return map[ty]?.[tx] !== 1 && (opt.dx !== -g.dirX || opt.dy !== -g.dirY);
    });

    if (opciones.length === 0) {
        g.dirX *= -1; g.dirY *= -1;
        return;
    }

    if (g.mode === "berserker" && !powerMode) {
        // Algoritmo de persecución: Ordenar por distancia euclidiana a Pacman
        opciones.sort((a, b) => 
            Math.hypot((g.x + a.dx) - pacman.x, (g.y + a.dy) - pacman.y) - 
            Math.hypot((g.x + b.dx) - pacman.x, (g.y + b.dy) - pacman.y)
        );
        g.dirX = opciones[0].dx;
        g.dirY = opciones[0].dy;
    } else {
        // Comportamiento de patrulla aleatoria
        let seleccion = opciones[Math.floor(Math.random() * opciones.length)];
        g.dirX = seleccion.dx;
        g.dirY = seleccion.dy;
    }
}

// --- CAPA DE RENDERIZADO (Restauración de activos visuales) ---
export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let px = ox + g.x * TILE_SIZE;
        let py = oy + g.y * TILE_SIZE;
        let s = TILE_SIZE;

        ctx.save();
        
        // Estilo de Producción: Sombras y Neón
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        // Cuerpo (Forma clásica)
        ctx.beginPath();
        ctx.arc(px + s/2, py + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(px + s*0.85, py + s*0.9);
        ctx.lineTo(px + s*0.15, py + s*0.9);
        ctx.fill();

        // Ojos (Detalle visual original)
        ctx.shadowBlur = 0; 
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(px + s*0.35, py + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(px + s*0.65, py + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    });
}