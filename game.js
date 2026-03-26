import { map, TILE_SIZE } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts, activatePower } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function gameLoop() {
    // 1. LIMPIAR PANTALLA
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. ACTUALIZAR (Aquí es donde ocurre el movimiento)
    updatePlayer(score, () => activatePower());
    updateGhosts(lives, score);

    // 3. DIBUJAR MAPA
    const offsetX = Math.floor((canvas.width - 20 * TILE_SIZE) / 2);
    const offsetY = Math.floor((canvas.height - 10 * TILE_SIZE) / 2);

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE;
            let ry = offsetY + y * TILE_SIZE;
            if (tile === 1) {
                ctx.strokeStyle = "blue";
                ctx.strokeRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (tile === 2) {
                ctx.fillStyle = "white";
                ctx.fillRect(rx + TILE_SIZE/2, ry + TILE_SIZE/2, 2, 2);
            }
        });
    });

    // 4. DIBUJAR PERSONAJES
    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    // 5. REPETIR
    requestAnimationFrame(gameLoop);
}

// Controles
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

gameLoop();