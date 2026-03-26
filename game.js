import { map, TILE_SIZE, spawnCherry } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, allGhostsDead, activatePower } from "./ghosts.js";

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

function gameLoop() {
    if (lives.value <= 0) {
        ctx.fillStyle = "white"; ctx.font = "40px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        return;
    }

    // Pasamos activatePower como función para evitar errores de importación circular
    updatePlayer(score, () => activatePower()); 
    updateGhosts(lives, score);
    checkWinCondition();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.floor((canvas.width - 20 * TILE_SIZE) / 2);
    const offsetY = Math.floor((canvas.height - 10 * TILE_SIZE) / 2);

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE, ry = offsetY + y * TILE_SIZE;
            if (tile === 1) {
                ctx.save();
                ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 2;
                ctx.shadowBlur = 15; ctx.shadowColor = "#00ffff";
                ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                ctx.restore();
            } else if (tile === 2) {
                ctx.fillStyle = "#ff00ff"; ctx.beginPath();
                ctx.arc(rx + TILE_SIZE/2, ry + TILE_SIZE/2, 2.5, 0, 7); ctx.fill();
            } else if (tile === 3) {
                // Dibujo simple de cereza para evitar errores
                ctx.fillStyle = "red"; ctx.beginPath(); 
                ctx.arc(rx+TILE_SIZE*0.4, ry+TILE_SIZE*0.7, 4, 0, 7); ctx.fill();
                ctx.arc(rx+TILE_SIZE*0.7, ry+TILE_SIZE*0.6, 4, 0, 7); ctx.fill();
            }
        });
    });

    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    ctx.fillStyle = "white"; ctx.font = "bold 18px Courier New";
    ctx.fillText(`PUNTOS: ${score.value}  VIDAS: ${lives.value}  NIVEL: ${level}`, offsetX, offsetY - 15);

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