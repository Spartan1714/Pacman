import { map } from "./map.js";
import { pacman } from "./player.js";

let isPaused = false;
const GHOST_COLORS = ["pink", "cyan", "orange"];
const GHOST_DELAY = 180;
let lastGhostMove = 0;

// Exportamos el array pero permitimos que su contenido cambie
export let ghosts = [];

const sounds = {
    death: new Audio('assets/sounds/death.mp3'),
    eatGhost: new Audio('assets/sounds/eat_ghost.mp3')
};

/**
 * Función que genera los fantasmas de forma aleatoria.
 * Se debe llamar cada vez que el jugador pasa de nivel.
 */
export function spawnGhostsForLevel() {
    ghosts.length = 0; // Limpiar el array actual sin perder la referencia

    // 1. Siempre el Berserker (Rojo)
    ghosts.push({ 
        x: 5, y: 5, dx: 1, dy: 0, 
        color: "red", type: "berserker", isFrightened: false 
    });

    // 2. Determinar cuántos extras (de 0 a 3 para un máximo de 4)
    const extraCount = Math.floor(Math.random() * 4); 

    for (let i = 0; i < extraCount; i++) {
        ghosts.push({
            x: 6, 
            y: 5, 
            dx: Math.random() > 0.5 ? 1 : -1, 
            dy: 0,
            color: GHOST_COLORS[i % GHOST_COLORS.length],
            type: "random",
            isFrightened: false
        });
    }
}

// Inicialización inicial para el Nivel 1
spawnGhostsForLevel();

// --- Lógica de Movimiento Berserker ---
function getBerserkerMove(g) {
    let dirs = possibleDirections(g);
    let bestDir = dirs[0];
    let minDistance = Infinity;

    dirs.forEach(d => {
        let nextX = g.x + d.dx;
        let nextY = g.y + d.dy;
        let dist = Math.abs(nextX - pacman.x) + Math.abs(nextY - pacman.y);
        if (dist < minDistance) {
            minDistance = dist;
            bestDir = d;
        }
    });
    return bestDir;
}

function possibleDirections(g) {
    let dirs = [];
    if (map[g.y] && map[g.y][g.x + 1] !== 1) dirs.push({ dx: 1, dy: 0 });
    if (map[g.y] && map[g.y][g.x - 1] !== 1) dirs.push({ dx: -1, dy: 0 });
    if (map[g.y + 1] && map[g.y + 1][g.x] !== 1) dirs.push({ dx: 0, dy: 1 });
    if (map[g.y - 1] && map[g.y - 1][g.x] !== 1) dirs.push({ dx: 0, dy: -1 });
    return dirs;
}

export function updateGhosts(livesRef) {
    if (isPaused) return;
    let now = Date.now();
    if (now - lastGhostMove < GHOST_DELAY) return;

    for (let g of ghosts) {
        if (g.type === "berserker" && !pacman.isSuper) {
            let move = getBerserkerMove(g);
            if (move) { g.dx = move.dx; g.dy = move.dy; }
        } else {
            let nextX = g.x + g.dx;
            let nextY = g.y + g.dy;
            if (!map[nextY] || map[nextY][nextX] === 1) {
                let dirs = possibleDirections(g);
                if (dirs.length > 0) {
                    let d = dirs[Math.floor(Math.random() * dirs.length)];
                    g.dx = d.dx; g.dy = d.dy;
                }
            }
        }

        g.x += g.dx;
        g.y += g.dy;

        // Colisión
        if (g.x === pacman.x && g.y === pacman.y) {
            if (pacman.isSuper) {
                sounds.eatGhost.play();
                g.x = 5; g.y = 5;
            } else {
                handleDeath(livesRef);
                break;
            }
        }
    }
    lastGhostMove = now;
}

function handleDeath(livesRef) {
    isPaused = true;
    sounds.death.play();
    livesRef.value--;
    setTimeout(() => {
        pacman.x = 1;
        pacman.y = 1;
        ghosts.forEach(gh => { gh.x = 5; gh.y = 5; });
        isPaused = false;
    }, 600);
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let x = offsetX + g.x * tileSize;
        let y = offsetY + g.y * tileSize;
        ctx.fillStyle = (pacman.isSuper) ? "blue" : g.color;
        
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2, Math.PI, 0);
        ctx.lineTo(x + tileSize, y + tileSize);
        ctx.lineTo(x, y + tileSize);
        ctx.fill();
        
        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x+tileSize*0.3, y+tileSize*0.4, tileSize*0.1, 0, Math.PI*2);
        ctx.arc(x+tileSize*0.7, y+tileSize*0.4, tileSize*0.1, 0, Math.PI*2);
        ctx.fill();
    }
}