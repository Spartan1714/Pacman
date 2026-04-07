import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

// --- Estado y Configuración ---
export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

// Requerido por game.js para verificar victoria
export function allGhostsDead() {
    if (ghosts.length === 0) return false;
    return ghosts.every(g => g.dead);
}

export function spawnGhosts(level = 1) {
    const speed = 2.2 + (level * 0.15);
    // Restauración de Entidades Originales
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "#FF0000", mode: "berserker", dead: false, speed: speed }, // Blinky
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "#FFB8FF", mode: "random", dead: false, speed: speed },    // Pinky
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "#00FFFF", mode: "random", dead: false, speed: speed }   // Inky
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

        let speedFactor = powerMode ? g.speed * 0.6 : g.speed;

        // --- Sistema de "Rieles" (Grid Snapping) ---
        // Evita que el fantasma se detenga por colisiones laterales decimales
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        let nextX = g.x + g.dirX * speedFactor * dt;
        let nextY = g.y + g.dirY * speedFactor * dt;

        // --- Lógica de Navegación ---
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);
        
        // Verificamos si estamos en el centro de la baldosa para decidir giro
        if (Math.abs(g.x - gx) < 0.1 && Math.abs(g.y - gy) < 0.1) {
            let wallAhead = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            if (wallAhead || isIntersection(gx, gy)) {
                g.x = gx;
                g.y = gy;
                decideDirection(g);
            }
        }

        g.x += g.dirX * speedFactor * dt;
        g.y += g.dirY * speedFactor * dt;

        // --- Colisión con Player ---
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

function isIntersection(x, y) {
    let ways = 0;
    if (map[y][x+1] !== 1) ways++;
    if (map[y][x-1] !== 1) ways++;
    if (map[y+1][x] !== 1) ways++;
    if (map[y-1][x] !== 1) ways++;
    return ways > 2;
}

function decideDirection(g) {
    let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
        let tx = Math.round(g.x + m.dx);
        let ty = Math.round(g.y + m.dy);
        return map[ty]?.[tx] !== 1 && (m.dx !== -g.dirX || m.dy !== -g.dirY);
    });

    if (moves.length === 0) {
        g.dirX *= -1; g.dirY *= -1;
        return;
    }

    if (g.mode === "berserker" && !powerMode) {
        // IA de Persecución Euclidiana
        moves.sort((a,b) => Math.hypot(g.x+a.dx-pacman.x, g.y+a.dy-pacman.y) - Math.hypot(g.x+b.dx-pacman.x, g.y+b.dy-pacman.y));
        g.dirX = moves[0].dx;
        g.dirY = moves[0].dy;
    } else {
        let pick = moves[Math.floor(Math.random() * moves.length)];
        g.dirX = pick.dx;
        g.dirY = pick.dy;
    }
}

// --- Renderizado con Fidelidad Visual ---
export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;
        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        // Cuerpo
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(x + s*0.85, y + s*0.9);
        ctx.lineTo(x + s*0.15, y + s*0.9);
        ctx.fill();

        // Ojos
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    });
}