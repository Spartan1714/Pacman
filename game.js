import { map, TILE_SIZE, generarMapaAleatorio } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activarPowerMode } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 }, nivel = 1, lastTime = 0, gameOver = false;

generarMapaAleatorio();
spawnGhosts();

// Escuchar cuando Pacman come la cereza
window.addEventListener("powerup", () => { activarPowerMode(); });

function gameLoop(timestamp) {
    if (gameOver) return;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ox = (canvas.width - 20 * TILE_SIZE) / 2;
    const oy = (canvas.height - 10 * TILE_SIZE) / 2;

    updatePlayer(score, dt);
    updateGhosts(lives, score, dt, pacman);

    // Dibujar Mapa
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === 1) { ctx.fillStyle = "blue"; ctx.fillRect(ox + x * TILE_SIZE, oy + y * TILE_SIZE, TILE_SIZE, TILE_SIZE); }
            else if (tile === 2) { ctx.fillStyle = "white"; ctx.fillRect(ox + x * TILE_SIZE + 8, oy + y * TILE_SIZE + 8, 4, 4); }
            else if (tile === 4) { ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(ox+x*TILE_SIZE+10, oy+y*TILE_SIZE+10, 6, 0, Math.PI*2); ctx.fill(); }
        });
    });

    drawGhosts(ctx, ox, oy);
    drawPlayer(ctx, TILE_SIZE, ox, oy);

    if (lives.value <= 0) { alert("GAME OVER"); gameOver = true; }
    if (!map.some(row => row.includes(2))) { nivel++; generarMapaAleatorio(); spawnGhosts(); pacman.x = 1; pacman.y = 1; }

    requestAnimationFrame(gameLoop);
}

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

canvas.width = window.innerWidth; canvas.height = window.innerHeight;
requestAnimationFrame(gameLoop);