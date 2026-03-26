import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// VARIABLES GLOBALES (Aseguramos que lives inicie en 3)
let score = { value: 0 };
let lives = { value: 3 }; 
let currentLevel = 1;
let tileSize, offsetX, offsetY;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tileSize = Math.floor(Math.min(canvas.width / map[0].length, canvas.height / map.length));
    offsetX = (canvas.width - map[0].length * tileSize) / 2;
    offsetY = (canvas.height - map.length * tileSize) / 2;
}

window.onresize = resize;
resize();

function checkWin() {
    return !map.some(row => row.includes(2));
}

function resetLevel() {
    // Rellenar puntos
    map.forEach((row, y) => row.forEach((t, x) => { if(t === 0) map[y][x] = 2; }));
    resetPlayer();
    spawnGhostsForLevel(currentLevel);
}

function drawMap() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    map.forEach((row, y) => row.forEach((tile, x) => {
        let rx = offsetX + x * tileSize, ry = offsetY + y * tileSize;
        if (tile === 1) { 
            ctx.strokeStyle = "#2b2bff"; 
            ctx.lineWidth = 2;
            ctx.strokeRect(rx + 2, ry + 2, tileSize - 4, tileSize - 4); 
        }
        else if (tile === 2) { 
            ctx.fillStyle = "white"; 
            ctx.beginPath(); 
            ctx.arc(rx + tileSize / 2, ry + tileSize / 2, tileSize / 10, 0, 7); 
            ctx.fill(); 
        }
    }));
}

function gameLoop() {
    // Validamos que lives.value exista y sea mayor a 0
    if (lives && lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives, currentLevel);

        if (checkWin()) {
            currentLevel++;
            resetLevel();
        }

        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);

        // UI
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`SCORE: ${score.value}   LIVES: ${lives.value}   LVL: ${currentLevel}`, offsetX, offsetY - 15);

        requestAnimationFrame(gameLoop);
    } else {
        // Pantalla de Game Over
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red";
        ctx.font = "bold 60px Impact";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Presiona F5 para reintentar", canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Controles
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

// INICIO SEGURO
resetPlayer();
spawnGhostsForLevel(currentLevel);
gameLoop();