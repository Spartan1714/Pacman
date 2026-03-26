import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let tileSize, offsetX, offsetY;
let score = { value: 0 }, lives = { value: 3 }, level = 1;

// Configurar Canvas y Tamaño
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tileSize = Math.floor(Math.min(canvas.width / map[0].length, canvas.height / map.length));
    offsetX = (canvas.width - map[0].length * tileSize) / 2;
    offsetY = (canvas.height - map.length * tileSize) / 2;
}
window.onresize = resize;
resize(); // Inicializar una vez

// Función para contar puntos (para cambio de nivel)
function countDots() {
    let dots = 0;
    map.forEach(row => row.forEach(tile => { if (tile === 2) dots++; }));
    return dots;
}

// Dibujo del mapa (con bordes neón azules)
function drawMap() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;

            if (map[y][x] === 1) { // Muros Neón
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.strokeRect(rx + 2, ry + 2, tileSize - 4, tileSize - 4);
            } else if (map[y][x] === 2) { // Puntos (CORREGIDO TAMAÑO)
                ctx.fillStyle = "white";
                ctx.beginPath();
                // Aumentado a un cuarto del tileSize para visibilidad
                ctx.arc(rx + tileSize / 2, ry + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Inicializar primer nivel
spawnGhostsForLevel(level);

// Bucle Unificado a 60 FPS ( requestAnimationFrame )
function gameLoop() {
    if (lives.value > 0) {
        // 1. ACTUALIZACIÓN DE LÓGICA
        updatePlayer(score);
        updateGhosts(lives);

        // 2. DIBUJO
        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);

        // UI (Puntos y Vidas)
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score.value}  Lives: ${lives.value}  Level: ${level}`, offsetX, offsetY - 10);

        // 3. CAMBIO DE NIVEL (Siguiente Nivel si dots === 0)
        if (countDots() === 0) {
            level++;
            // Aquí llamarías a una función para regenerar tu laberinto si la tienes.
            // Por ahora solo reseteamos puntos y fantasmas en el mismo mapa.
            // map.forEach((row, y) => row.forEach((tile, x) => { if(originalMap[y][x] === 2) map[y][x] = 2; }));
            spawnGhostsForLevel(level);
        }

        requestAnimationFrame(gameLoop);
    } else {
        // Game Over
        ctx.fillStyle = "white"; ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
    }
}

// Teclado
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

// Arrancar el bucle
gameLoop();