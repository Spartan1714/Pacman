import { map, TILE_SIZE, generarMapaAleatorio } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let lastTime = 0;

generarMapaAleatorio();
spawnGhosts();

function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ox = (canvas.width - map[0].length * TILE_SIZE) / 2;
    const oy = (canvas.height - map.length * TILE_SIZE) / 2;

    updatePlayer(score, dt);
    updateGhosts(lives, pacman, dt);

    // Dibujar Mapa
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === 1) {
                ctx.fillStyle = "blue";
                ctx.fillRect(ox + x * TILE_SIZE, oy + y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
            } else if (tile === 2) {
                ctx.fillStyle = "white";
                ctx.fillRect(ox + x * TILE_SIZE + TILE_SIZE / 2 - 2, oy + y * TILE_SIZE + TILE_SIZE / 2 - 2, 4, 4);
            }
        });
    });

    drawPlayer(ctx, TILE_SIZE, ox, oy);
    drawGhosts(ctx, TILE_SIZE, ox, oy);

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Puntos: ${score.value}  Vidas: ${lives.value}`, 20, 30);

    if (lives.value > 0) requestAnimationFrame(gameLoop);
    else alert("GAME OVER");
}

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
requestAnimationFrame(gameLoop);