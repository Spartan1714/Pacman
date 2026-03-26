import { map, generateMaze } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, berserker } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 }, level = 1, tileSize, offsetX, offsetY;
const GRID = 15;

function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    tileSize = Math.floor(Math.min(canvas.width / (GRID + 2), canvas.height / (GRID + 2)));
    offsetX = (canvas.width - GRID * tileSize) / 2;
    offsetY = (canvas.height - GRID * tileSize) / 2;
}
window.onresize = resize; resize();

function gameLoop() {
    if (lives.value > 0) {
        updatePlayer(score); updateGhosts(lives, level, score);
        let px = Math.round(pacman.vX), py = Math.round(pacman.vY);
        if (map[py]?.[px] === 3) { map[py][px] = 0; berserker.active = true; berserker.timer = 500; }
        if (!map.some(row => row.includes(2))) { level++; generateMaze(); resetPlayer(); spawnGhosts(level); }

        ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width,canvas.height);
        map.forEach((row, y) => row.forEach((tile, x) => {
            let rx = offsetX + x * tileSize, ry = offsetY + y * tileSize;
            if (tile === 1) { 
                ctx.strokeStyle = "#2b2bff"; ctx.lineWidth = 3;
                ctx.strokeRect(rx + 4, ry + 4, tileSize - 8, tileSize - 8); 
            } else if (tile === 2) { 
                ctx.fillStyle = "#ffb8ae"; ctx.beginPath(); ctx.arc(rx + tileSize/2, ry + tileSize/2, 2, 0, 7); ctx.fill(); 
            } else if (tile === 3) { 
                ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(rx + tileSize/2, ry + tileSize/2, tileSize/3.5, 0, 7); ctx.fill(); 
            }
        }));
        drawGhosts(ctx, tileSize, offsetX, offsetY); drawPlayer(ctx, tileSize, offsetX, offsetY);
        ctx.fillStyle = "white"; ctx.font = "bold 24px Arial"; ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}`, offsetX, offsetY - 20);
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "red"; ctx.font = "bold 60px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
    }
}
generateMaze(); spawnGhosts(level); gameLoop();
document.onkeydown = (e) => {
    if (e.key.includes("Arrow")) e.preventDefault();
    if (e.key === "ArrowUp") setDirection(0,-1); if (e.key === "ArrowDown") setDirection(0,1);
    if (e.key === "ArrowLeft") setDirection(-1,0); if (e.key === "ArrowRight") setDirection(1,0);
};