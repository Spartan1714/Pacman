import { map } from "./map.js";
import { pacman } from "./player.js";

// Estados del juego y sonidos
let isPaused = false;
const sounds = {
    death: new Audio('assets/sounds/death.mp3'),
    eatGhost: new Audio('assets/sounds/eat_ghost.mp3'),
    powerUp: new Audio('assets/sounds/powerup.mp3')
};

export let ghosts = [
    { x: 5, y: 5, dx: 1, dy: 0, color: "red", type: "berserker", isFrightened: false },
    { x: 6, y: 5, dx: -1, dy: 0, color: "pink", type: "random", isFrightened: false },
    { x: 5, y: 6, dx: 0, dy: 1, color: "cyan", type: "random", isFrightened: false },
    { x: 6, y: 6, dx: 0, dy: -1, color: "orange", type: "random", isFrightened: false }
];

let lastGhostMove = 0;
const GHOST_DELAY = 180;

function possibleDirections(g) {
    let dirs = [];
    if (map[g.y] && map[g.y][g.x + 1] !== 1) dirs.push({ dx: 1, dy: 0 });
    if (map[g.y] && map[g.y][g.x - 1] !== 1) dirs.push({ dx: -1, dy: 0 });
    if (map[g.y + 1] && map[g.y + 1][g.x] !== 1) dirs.push({ dx: 0, dy: 1 });
    if (map[g.y - 1] && map[g.y - 1][g.x] !== 1) dirs.push({ dx: 0, dy: -1 });
    return dirs;
}

// IA Berserker: Busca la dirección que reduzca la distancia a Pacman
function getBerserkerMove(g) {
    let dirs = possibleDirections(g);
    let bestDir = dirs[0];
    let minDistance = Infinity;

    dirs.forEach(d => {
        let nextX = g.x + d.dx;
        let nextY = g.y + d.dy;
        // Distancia Manhattan
        let dist = Math.abs(nextX - pacman.x) + Math.abs(nextY - pacman.y);
        if (dist < minDistance) {
            minDistance = dist;
            bestDir = d;
        }
    });
    return bestDir;
}

export function updateGhosts(livesRef) {
    if (isPaused) return; // Detiene todo si Pacman está muriendo

    let now = Date.now();
    if (now - lastGhostMove < GHOST_DELAY) return;

    for (let g of ghosts) {
        // Decisión de movimiento
        if (g.type === "berserker" && !g.isFrightened) {
            let move = getBerserkerMove(g);
            if (move) {
                g.dx = move.dx;
                g.dy = move.dy;
            }
        } else {
            // Movimiento aleatorio para los demás o si están asustados
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

        // --- COLISIONES ---
        if (g.x === pacman.x && g.y === pacman.y) {
            if (pacman.isSuper) { 
                // Pacman grande come fantasma
                sounds.eatGhost.play();
                g.x = 5; g.y = 5; // Regresa a casa
            } else {
                // MUERTE (Arreglo del delay)
                handleDeath(livesRef);
                break; 
            }
        }
    }
    lastGhostMove = now;
}

function handleDeath(livesRef) {
    isPaused = true; // Congela el juego inmediatamente
    sounds.death.play();
    
    livesRef.value--;

    // Delay visual de medio segundo para que el usuario vea que murió
    setTimeout(() => {
        pacman.x = 1;
        pacman.y = 1;
        ghosts.forEach(gh => { gh.x = 5; gh.y = 5; });
        isPaused = false; // Reanuda el juego
    }, 600);
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let x = offsetX + g.x * tileSize;
        let y = offsetY + g.y * tileSize;

        // Cambiar color si están asustados (Power-up)
        ctx.fillStyle = (pacman.isSuper) ? "blue" : g.color;

        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2, Math.PI, 0);
        ctx.lineTo(x + tileSize, y + tileSize);
        ctx.lineTo(x + tileSize * 0.75, y + tileSize * 0.8);
        ctx.lineTo(x + tileSize * 0.5, y + tileSize);
        ctx.lineTo(x + tileSize * 0.25, y + tileSize * 0.8);
        ctx.lineTo(x, y + tileSize);
        ctx.closePath();
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + tileSize * 0.35, y + tileSize * 0.45, tileSize * 0.1, 0, Math.PI * 2);
        ctx.arc(x + tileSize * 0.65, y + tileSize * 0.45, tileSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
}