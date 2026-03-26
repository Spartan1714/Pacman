import { map, generateRandomMaze } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel, isBerserker } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 }, currentLevel = 1, tileSize, offsetX, offsetY;

function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    tileSize = Math.floor(Math.min(canvas.width / 20, canvas.height / 20));
    offsetX = (canvas.width - map[0].length * tileSize) / 2;
    offsetY = (canvas.height - map.length * tileSize) / 2;
}
window.onresize = resize; resize();

function gameLoop() {
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives, currentLevel, score);

        // Lógica Berserker: Comer punto grande (3)
        let mx = Math.round(pacman.vX), my = Math.round(pacman.vY);
        if (map[my]?.[mx] === 3) {
            map[my][mx] = 0;
            isBerserker.active = true;
            isBerserker.timer = 500; // ~8 segundos
        }

        // Ganar Nivel -> Generar Nuevo Laberinto Random
        if (!map.some(row => row.includes(2))) {
            currentLevel++;
            generateRandomMaze(19, 19);
            resize(); // Recalcular tamaño
            resetPlayer();
            spawnGhostsForLevel(currentLevel);
        }

        ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width,canvas.height);
        map.forEach((row, y) => row.forEach((tile, x) => {
            let rx = offsetX + x * tileSize, ry = offsetY + y * tileSize;
            if (tile === 1) { ctx.strokeStyle = "#2b2bff"; ctx.strokeRect(rx+2, ry+2, tileSize-4, tileSize-4); }
            else if (tile === 2) { ctx.fillStyle = "#ffb8ae"; ctx.beginPath(); ctx.arc(rx+tileSize/2, ry+tileSize/2, 2, 0, 7); ctx.fill(); }
            else if (tile === 3) { ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(rx+tileSize/2, ry+tileSize/2, 6, 0, 7); ctx.fill(); }
        }));

        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        ctx.fillStyle = "white"; ctx.font = "20px Arial";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}  LEVEL: ${currentLevel}`, offsetX, offsetY - 10);
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "red"; ctx.font = "50px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
    }
}

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0,-1); if (e.key === "ArrowDown") setDirection(0,1);
    if (e.key === "ArrowLeft") setDirection(-1,0); if (e.key === "ArrowRight") setDirection(1,0);
};

spawnGhostsForLevel(currentLevel);
gameLoop();