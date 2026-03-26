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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#1919fb";
    ctx.strokeStyle = "#1919fb";
    ctx.lineWidth = 2;

    for(let y = 0; y < map.length; y++) {
        for(let x = 0; x < map[y].length; x++) {
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;
            if(map[y][x] === 1) {
                ctx.strokeRect(rx + 4, ry + 4, tileSize - 8, tileSize - 8);
            } else if(map[y][x] === 2) {
                ctx.shadowBlur = 0; // Sin brillo para los puntos
                ctx.fillStyle = "#ffb8ae";
                ctx.beginPath();
                ctx.arc(rx + tileSize/2, ry + tileSize/2, 2, 0, 7);
                ctx.fill();
                ctx.shadowBlur = 8; // Devolver brillo para el siguiente muro
            }
        }
    }
    ctx.shadowBlur = 0;
}

function gameLoop() {
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives);
        
        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        ctx.fillStyle = "yellow";
        ctx.font = "bold 20px 'Courier New'";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}`, offsetX, offsetY - 10);
        
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 100, canvas.height/2);
        setTimeout(() => location.reload(), 3000);
    }
}

document.onkeydown = (e) => {
    if(e.key === "ArrowUp") setDirection(0, -1);
    if(e.key === "ArrowDown") setDirection(0, 1);
    if(e.key === "ArrowLeft") setDirection(-1, 0);
    if(e.key === "ArrowRight") setDirection(1, 0);
};

spawnGhostsForLevel();
gameLoop();