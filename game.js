import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let tileSize, offsetX, offsetY;
let score = { value: 0 }, lives = { value: 3 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tileSize = Math.floor(Math.min(canvas.width / map[0].length, canvas.height / map.length));
    offsetX = (canvas.width - map[0].length * tileSize) / 2;
    offsetY = (canvas.height - map.length * tileSize) / 2;
}
window.onresize = resize; resize();

function drawMap() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    for(let y=0; y<map.length; y++) {
        for(let x=0; x<map[y].length; x++) {
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;
            if(map[y][x] === 1) {
                ctx.strokeStyle = "#2222FF"; ctx.lineWidth = 2;
                ctx.strokeRect(rx+3, ry+3, tileSize-6, tileSize-6);
            } else if(map[y][x] === 2) {
                ctx.fillStyle = "#FFB8AE";
                ctx.beginPath(); ctx.arc(rx+tileSize/2, ry+tileSize/2, 2, 0, 7); ctx.fill();
            }
        }
    }
}

function gameLoop() {
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives);
        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        ctx.fillStyle = "white"; ctx.font = "bold 18px Arial";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}`, offsetX, offsetY - 10);
        requestAnimationFrame(gameLoop);
    } else {
        alert("GAME OVER! Score: " + score.value);
        location.reload();
    }
}

document.onkeydown = (e) => {
    if(e.key === "ArrowUp") setDirection(0,-1);
    if(e.key === "ArrowDown") setDirection(0,1);
    if(e.key === "ArrowLeft") setDirection(-1,0);
    if(e.key === "ArrowRight") setDirection(1,0);
};

gameLoop();