import { map, TILE_SIZE } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let lastTime = 0;
let gameOver = false; // Estado para detener el juego

function gameLoop(timestamp) {
    if (gameOver) return; // Si moriste, dejamos de actualizar y dibujar

    // Calculamos el tiempo transcurrido (Delta Time)
    const dt = (timestamp - lastTime) / 1000; 
    lastTime = timestamp;

    // Limitar el dt para evitar saltos si el navegador se minimiza
    const delta = Math.min(dt, 0.1);

    // 1. Limpiar pantalla
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Centrar el mapa
    const offsetX = (canvas.width - 20 * TILE_SIZE) / 2;
    const offsetY = (canvas.height - 10 * TILE_SIZE) / 2;

    // 3. ACTUALIZAR LÓGICA
    updatePlayer(score, delta);
    updateGhosts(lives, score, delta);

    // --- REVISAR SI HAS MUERTO ---
    if (lives.value <= 0) {
        showGameOver();
        gameOver = true;
        return;
    }

    // --- REVISAR SI HAS GANADO EL NIVEL ---
    let hayPuntos = false;
    for (let row of map) {
        if (row.includes(2)) { hayPuntos = true; break; }
    }
    if (!hayPuntos) {
        resetLevel(); // Si no hay puntos, reiniciamos el nivel
    }

    // 4. Dibujar Mapa
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === 1) {
                ctx.strokeStyle = "#2222ff";
                ctx.strokeRect(offsetX + x * TILE_SIZE + 2, offsetY + y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (tile === 2) {
                ctx.fillStyle = "#ffb8ae";
                ctx.fillRect(offsetX + x * TILE_SIZE + TILE_SIZE/2 - 1, offsetY + y * TILE_SIZE + TILE_SIZE/2 - 1, 3, 3);
            }
        });
    });

    // 5. Dibujar Personajes
    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    // 6. Dibujar HUD (Interfaz de usuario)
    ctx.fillStyle = "white";
    ctx.font = "20px Monospace";
    ctx.fillText(`PUNTOS: ${score.value}`, offsetX, offsetY - 15);
    ctx.fillStyle = "red";
    ctx.fillText(`VIDAS: ${lives.value}`, offsetX + (15 * TILE_SIZE), offsetY - 15);

    requestAnimationFrame(gameLoop);
}

// Función para mostrar el cartel de Game Over
function showGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "red";
    ctx.font = "bold 50px Monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    
    ctx.fillStyle = "white";
    ctx.font = "20px Monospace";
    ctx.fillText("Pulsa F5 para reiniciar", canvas.width / 2, canvas.height / 2 + 50);
}

// Función para resetear el nivel cuando comes todo
function resetLevel() {
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (map[y][x] === 0) map[y][x] = 2; // Rellenar los caminos con puntos
        });
    });
    // Podrías añadir un alert o subir la dificultad aquí
}

// Configuración inicial
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.onkeydown = (e) => {
    if (gameOver) return; // Bloquear controles si perdiste
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

requestAnimationFrame(gameLoop);