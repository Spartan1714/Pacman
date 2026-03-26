import { map, TILE_SIZE, spawnCherry } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, allGhostsDead } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let level = 1;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function checkWinCondition() {
    let dotsLeft = false;
    map.forEach(row => { if (row.includes(2)) dotsLeft = true; });

    if (!dotsLeft || allGhostsDead()) {
        level++;
        map.forEach((row, y) => row.forEach((tile, x) => {
            if (tile === 0 || tile === 2) map[y][x] = 2;
        }));
        resetPlayer();
        spawnGhosts(level);
        spawnCherry(level);
    }
}

function drawCherry(ctx, x, y) {
    let s = TILE_SIZE;
    ctx.fillStyle = "red";
    ctx.beginPath(); ctx.arc(x + s * 0.4, y + s * 0.7, s * 0.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + s * 0.7, y + s * 0.6, s * 0.2, 0, 7); ctx.fill();
    ctx.strokeStyle = "green"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + s * 0.5, y + s * 0.2);
    ctx.quadraticCurveTo(x + s * 0.5, y + s * 0.5, x + s * 0.4, y + s * 0.7); ctx.stroke();
}

function gameLoop() {
    if (lives.value <= 0) {
        ctx.fillStyle = "white"; ctx.font = "40px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        return;
    }

    updatePlayer(score);
    updateGhosts(lives, score);
    checkWinCondition();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - 20 * TILE_SIZE) / 2;
    const offsetY = (canvas.height - 10 * TILE_SIZE) / 2;

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE, ry = offsetY + y * TILE_SIZE;
            if (tile === 1) {
                ctx.strokeStyle = "blue"; ctx.lineWidth = 2;
                ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else if (tile === 2) {
                ctx.fillStyle = "#ffb8ae"; ctx.beginPath();
                ctx.arc(rx + TILE_SIZE/2, ry + TILE_SIZE/2, 2, 0, 7); ctx.fill();
            } else if (tile === 3) drawCherry(ctx, rx, ry);
        });
    });

    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    ctx.fillStyle = "white"; ctx.font = "20px Arial"; ctx.textAlign = "left";
    ctx.fillText(`Puntos: ${score.value}  Vidas: ${lives.value}  Nivel: ${level}`, offsetX, offsetY - 10);

    requestAnimationFrame(gameLoop);
}

document.onkeydown = (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

spawnCherry(level);
spawnGhosts(level);
gameLoop();