import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let tileSize, offsetX, offsetY;
let score = { value: 0 }, lives = { value: 3 };

// --- Variable de Nivel Actual ---
let currentLevel = 1; 

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (map && map.length > 0) {
        tileSize = Math.floor(Math.min(canvas.width / map[0].length, canvas.height / map.length));
        offsetX = (canvas.width - map[0].length * tileSize) / 2;
        offsetY = (canvas.height - map.length * tileSize) / 2;
    }
}
window.onresize = resize;
resize();

// Función auxiliar para contar puntos (para saber si ganaste)
function countDots() {
    let dots = 0;
    map.forEach(row => row.forEach(tile => { if (tile === 2) dots++; }));
    return dots;
}

// Función para resetear los puntos del mapa al subir de nivel
function resetDots() {
    // Aquí deberías recargar tu mapa original. Por simplicidad, asumimos que todos los 0 se vuelven 2.
    // map.forEach((row, y) => row.forEach((tile, x) => { if (tile === 0) map[y][x] = 2; }));
    // Lo ideal es tener un `originalMap` y hacer map = JSON.parse(JSON.stringify(originalMap));
}

function drawMap() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;

            if (map[y][x] === 1) { // Muros Neón Azules
                ctx.strokeStyle = "#2b2bff";
                ctx.lineWidth = 2;
                ctx.strokeRect(rx + 2, ry + 2, tileSize - 4, tileSize - 4);
            } else if (map[y][x] === 2) { // Puntos Blancos
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(rx + tileSize / 2, ry + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}


// Tu gameLoop perfecto
function gameLoop() {
    if (lives.value > 0) {
        // 1. ACTUALIZACIÓN DE LÓGICA (Corriendo a 60fps)
        updatePlayer(score);
        updateGhosts(lives, currentLevel); // <--- PASAMOS EL NIVEL AQUÍ

        // 2. DIBUJO
        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);

        // UI (Score, Vidas y Nivel)
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}  LEVEL: ${currentLevel}`, offsetX, offsetY - 10);

        // 3. Chequeo de Victoria (Cambio de Nivel)
        if (countDots() === 0) {
            currentLevel++;
            // resetDots(); // Reactiva los puntos si tienes la lógica
            spawnGhostsForLevel(currentLevel); // <--- CREAMOS MÁS FANTASMAS
        }

        requestAnimationFrame(gameLoop);
    } else {
        // Game Over
        ctx.fillStyle = "red"; ctx.font = "50px Impact";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
        // Opcional: Recargar página tras 3 segundos
        // setTimeout(() => location.reload(), 3000);
    }
}

// Teclado
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

// --- INICIO ÚNICO DEL JUEGO ---
spawnGhostsForLevel(currentLevel); // <--- JUEGO EMPIEZA EN NIVEL 1
gameLoop();