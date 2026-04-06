import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function spawnGhosts(level = 1) {
    const speed = 2.5 + (level * 0.2);
    // Posiciones iniciales en números enteros exactos
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "red", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "pink", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "cyan", mode: "random", dead: false, speed: speed }
    ];
}

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;

        // --- EFECTO RIEL: Alineación de eje opuesto ---
        // Si el fantasma se mueve en X, su Y debe ser un entero perfecto para no rozar paredes
        if (g.dirX !== 0) {
            g.y = Math.round(g.y);
        }
        // Si se mueve en Y, su X debe ser un entero perfecto
        if (g.dirY !== 0) {
            g.x = Math.round(g.x);
        }

        // 1. Calcular siguiente posición
        let nextX = g.x + g.dirX * actualSpeed * dt;
        let nextY = g.y + g.dirY * actualSpeed * dt;

        // 2. Detección de colisión frontal (con margen de seguridad de 0.4)
        let checkX = nextX + g.dirX * 0.4;
        let checkY = nextY + g.dirY * 0.4;

        if (map[Math.round(checkY)]?.[Math.round(checkX)] !== 1) {
            // Camino despejado: Seguir avanzando
            g.x = nextX;
            g.y = nextY;
        } else {
            // Choque frontal: Pegar al centro de la baldosa y buscar giro
            g.x = Math.round(g.x);
            g.y = Math.round(g.y);
            decidirNuevaDireccion(g);
        }

        // 3. IA de Intersección: Posibilidad de girar en cruces libres
        // Solo evaluamos giro si estamos muy cerca del centro de una baldosa
        if (Math.abs(g.x - Math.round(g.x)) < 0.1 && Math.abs(g.y - Math.round(g.y)) < 0.1) {
            // Un 5% de probabilidad de intentar un giro en cada frame que pase por el centro
            if (Math.random() < 0.05) { 
                decidirNuevaDireccion(g);
            }
        }

        // 4. Colisión con Pac-Man
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

// Función centralizada para la toma de decisiones
function decidirNuevaDireccion(g) {
    let options = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(opt => {
        let tx = Math.round(g.x) + opt.dx;
        let ty = Math.round(g.y) + opt.dy;
        // No puede ser muro Y preferiblemente que no sea la dirección opuesta actual
        return map[ty]?.[tx] !== 1 && (opt.dx !== -g.dirX || opt.dy !== -g.dirY);
    });

    // Si es un callejón sin salida, la única opción es volver atrás
    if (options.length === 0) {
        g.dirX *= -1;
        g.dirY *= -1;
    } else {
        let choice;
        if (g.mode === "berserker" && !powerMode) {
            // El rojo elige la opción que reduzca la distancia a Pac-Man
            choice = options.sort((a, b) => 
                Math.hypot((g.x + a.dx) - pacman.x, (g.y + a.dy) - pacman.y) - 
                Math.hypot((g.x + b.dx) - pacman.x, (g.y + b.dy) - pacman.y)
            )[0];
        } else {
            // Los demás eligen una dirección válida al azar
            choice = options[Math.floor(Math.random() * options.length)];
        }
        
        // Al girar, forzamos la posición al centro para un movimiento limpio
        g.x = Math.round(g.x);
        g.y = Math.round(g.y);
        g.dirX = choice.dx;
        g.dirY = choice.dy;
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE;
        let y = oy + g.y * TILE_SIZE;
        let s = TILE_SIZE;

        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();
        ctx.restore();
    });
}