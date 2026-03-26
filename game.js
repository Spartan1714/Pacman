import { map, TILE_SIZE } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let lastTime = 0;

function gameLoop(timestamp) {
    // Calculamos el tiempo transcurrido (Delta Time)
    const dt = (timestamp - lastTime) / 1000; 
    lastTime = timestamp;

    // Limitar el dt para evitar saltos si el navegador se minimiza
    const delta = Math.min(dt, 0.1);

    // 1. Limpiar
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Centrar el mapa
    const offsetX = (canvas.width - 20 * TILE_SIZE) / 2;
    const offsetY = (canvas.height - 10 * TILE_SIZE) / 2;

    // 3. Actualizar Lógica (Pasando el delta tiempo)
    updatePlayer(score, delta);
    updateGhosts(lives, score, delta);

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

    requestAnimationFrame(gameLoop);
}

// Configuración inicial
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

requestAnimationFrame(gameLoop);