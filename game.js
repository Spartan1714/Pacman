import { map, TILE_SIZE } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 };

// Centrar tu mapa en pantalla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const offsetX = (canvas.width - map[0].length * TILE_SIZE) / 2;
const offsetY = (canvas.height - map.length * TILE_SIZE) / 2;

function gameLoop() {
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives, score);

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        map.forEach((row, y) => row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE, ry = offsetY + y * TILE_SIZE;
            if (tile === 1) {
                ctx.strokeStyle = "#2b2bff"; ctx.lineWidth = 2;
                ctx.strokeRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (tile === 2) {
                ctx.fillStyle = "#ffb8ae"; ctx.beginPath();
                ctx.arc(rx + TILE_SIZE / 2, ry + TILE_SIZE / 2, 2, 0, 7); ctx.fill();
            }
        }));

        drawGhosts(ctx, offsetX, offsetY);
        drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

        ctx.fillStyle = "white"; ctx.font = "20px Arial";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}`, offsetX, offsetY - 10);
        requestAnimationFrame(gameLoop);
    }
}

spawnGhosts();
gameLoop();

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};