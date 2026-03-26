import { map, generateMaze } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, berserker } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 }, level = 1, tileSize, offsetX, offsetY;

const GRID = 19; // Tamaño impar para tu generador

function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    tileSize = Math.floor(Math.min(canvas.width / GRID, canvas.height / GRID) * 0.9);
    offsetX = (canvas.width - GRID * tileSize) / 2;
    offsetY = (canvas.height - GRID * tileSize) / 2;
}
window.onresize = resize; resize();

function gameLoop() {
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives, level, score);

        // Lógica Berserker
        let px = Math.round(pacman.vX), py = Math.round(pacman.vY);
        if (map[py]?.[px] === 3) {
            map[py][px] = 0;
            berserker.active = true; berserker.timer = 500;
        }

        // Ganar nivel -> Nuevo Laberinto Random
        if (!map.some(row => row.includes(2))) {
            level++;
            generateMaze(GRID, GRID);
            resetPlayer();
            spawnGhosts(level);
        }

        ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width,canvas.height);
        map.forEach((row, y) => row.forEach((tile, x) => {
            let rx = offsetX + x * tileSize, ry = offsetY + y * tileSize;
            if (tile === 1) { ctx.strokeStyle = "#2b2bff"; ctx.strokeRect(rx+2, ry+2, tileSize-4, tileSize-4); }
            else if (tile === 2) { ctx.fillStyle = "#ffb8ae"; ctx.beginPath(); ctx.arc(rx+tileSize/2, ry+tileSize/2, 2, 0, 7); ctx.fill(); }
            else if (tile === 3) { ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(rx+tileSize/2, ry+tileSize/2, tileSize/4, 0, 7); ctx.fill(); }
        }));

        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        ctx.fillStyle = "white"; ctx.font = "20px Arial";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}  LEVEL: ${level}`, offsetX, offsetY - 10);
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "red"; ctx.font = "50px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
    }
}

// Iniciar con tu lógica
generateMaze(GRID, GRID);
spawnGhosts(level);
gameLoop();

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0,-1);
    if (e.key === "ArrowDown") setDirection(0,1);
    if (e.key === "ArrowLeft") setDirection(-1,0);
    if (e.key === "ArrowRight") setDirection(1,0);
};