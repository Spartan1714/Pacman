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

        // 1. INTENTO DE MOVIMIENTO (Igual que Pac-Man)
        let nextX = g.x + g.dirX * actualSpeed * dt;
        let nextY = g.y + g.dirY * actualSpeed * dt;

        // 2. COLISIÓN CON MUROS (Margen de 0.4 para no entrar en la pared)
        let checkX = nextX + g.dirX * 0.4;
        let checkY = nextY + g.dirY * 0.4;

        if (map[Math.round(checkY)]?.[Math.round(checkX)] !== 1) {
            // Si el camino está libre, se mueve fluido
            g.x = nextX;
            g.y = nextY;
        } else {
            // Si choca, se detiene y busca dirección inmediatamente (como la IA)
            g.x = Math.round(g.x);
            g.y = Math.round(g.y);
            cambiarDireccion(g);
        }

        // 3. DECISIÓN EN INTERSECCIONES (Para que no solo vayan en línea recta)
        // Si están cerca del centro de una baldosa, tienen chance de girar
        if (Math.abs(g.x - Math.round(g.x)) < 0.1 && Math.abs(g.y - Math.round(g.y)) < 0.1) {
            // Solo evaluamos giro si no han girado ya en esta baldosa
            if (Math.random() < 0.05) { // Probabilidad pequeña para no ser erráticos
                cambiarDireccion(g);
            }
        }

        // 4. COLISIÓN CON EL JUGADOR
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

// Función auxiliar para decidir hacia dónde ir
function cambiarDireccion(g) {
    let options = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(opt => {
        // No muros y no volver atrás (opcional para evitar vibración)
        return map[Math.round(g.y + opt.dy)]?.[Math.round(g.x + opt.dx)] !== 1;
    });

    if (options.length > 0) {
        let choice;
        if (g.mode === "berserker" && !powerMode) {
            // Persigue a Pac-Man
            choice = options.sort((a, b) => 
                Math.hypot((g.x + a.dx) - pacman.x, (g.y + a.dy) - pacman.y) - 
                Math.hypot((g.x + b.dx) - pacman.x, (g.y + b.dy) - pacman.y)
            )[0];
        } else {
            // Azar
            choice = options[Math.floor(Math.random() * options.length)];
        }
        g.dirX = choice.dx;
        g.dirY = choice.dy;
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;
        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();
        ctx.restore();
    });
}