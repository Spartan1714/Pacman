import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

// --- ESTADO DEL MÓDULO ---
export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

// Colores para los fantasmas aleatorios
const GHOST_COLORS = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852", "#FF00FF", "#00FF00"];

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

// --- GENERADOR DE NIVEL DINÁMICO ---
export function spawnGhosts(level = 1) {
    // Decidimos cuántos fantasmas habrá en este nivel (mínimo 2, máximo 4)
    const numGhosts = Math.floor(Math.random() * 3) + 2; 
    const speed = 2.0 + (level * 0.15);
    
    ghosts = [];
    
    // Posiciones seguras de inicio (puedes ajustar estas coordenadas según tu mapa)
    const spawnPoints = [
        { x: 18, y: 1 }, { x: 1, y: 8 }, { x: 18, y: 8 }, { x: 1, y: 1 }
    ];

    for (let i = 0; i < numGhosts; i++) {
        const point = spawnPoints[i % spawnPoints.length];
        ghosts.push({
            x: point.x,
            y: point.y,
            dirX: i % 2 === 0 ? 1 : -1,
            dirY: 0,
            color: GHOST_COLORS[i % GHOST_COLORS.length],
            speed: speed,
            dead: false,
            // IA: El primero siempre es Berserker (rojo), los demás aleatorios
            mode: i === 0 ? "berserker" : "random"
        });
    }
}

// --- MOTOR DE FÍSICA Y MOVIMIENTO ---
export function updateGhosts(lives, score, dt) {
    if (!dt || ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let v = powerMode ? g.speed * 0.5 : g.speed;

        // 1. ALINEACIÓN (SNAP)
        // Forzamos al fantasma a estar en el centro del pasillo opuesto a su movimiento
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        // 2. DETECCIÓN DE INTERSECCIÓN (Punto de decisión)
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);

        // Solo evaluamos giros cuando el fantasma está centrado en una baldosa
        if (Math.abs(g.x - gx) < 0.1 && Math.abs(g.y - gy) < 0.1) {
            
            // ¿El camino actual está bloqueado?
            let isBlocked = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            if (isBlocked || esCruce(gx, gy)) {
                g.x = gx; // Snap al centro exacto antes de decidir
                g.y = gy;
                cambiarDireccionIA(g);
            }
        }

        // 3. APLICAR MOVIMIENTO
        g.x += g.dirX * v * dt;
        g.y += g.dirY * v * dt;

        // 4. COLISIÓN CON PACMAN
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.7) {
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

function esCruce(x, y) {
    let pasillos = 0;
    if (map[y]?.[x+1] !== 1) pasillos++;
    if (map[y]?.[x-1] !== 1) pasillos++;
    if (map[y+1]?.[x] !== 1) pasillos++;
    if (map[y-1]?.[x] !== 1) pasillos++;
    return pasillos > 2;
}

function cambiarDireccionIA(g) {
    const gx = Math.round(g.x);
    const gy = Math.round(g.y);

    // Buscamos direcciones válidas (que no sean muros y no sean la vuelta atrás)
    let opciones = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ].filter(o => {
        let isWall = map[gy + o.dy]?.[gx + o.dx] === 1;
        let isOpposite = (o.dx === -g.dirX && o.dy === -g.dirY);
        return !isWall && !isOpposite;
    });

    if (opciones.length === 0) {
        // Callejón sin salida: única opción es dar la vuelta
        g.dirX *= -1; g.dirY *= -1;
    } else {
        if (g.mode === "berserker" && !powerMode) {
            // IA de Persecución (Blinky): Elige el camino que lo acerque más a Pacman
            opciones.sort((a, b) => 
                Math.hypot((gx + a.dx) - pacman.x, (gy + a.dy) - pacman.y) - 
                Math.hypot((gx + b.dx) - pacman.x, (gy + b.dy) - pacman.y)
            );
            g.dirX = opciones[0].dx;
            g.dirY = opciones[0].dy;
        } else {
            // IA Aleatoria
            let sel = opciones[Math.floor(Math.random() * opciones.length)];
            g.dirX = sel.dx;
            g.dirY = sel.dy;
        }
    }
}

// --- DIBUJO ---
export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;

        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        // Forma de fantasma profesional
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    });
}