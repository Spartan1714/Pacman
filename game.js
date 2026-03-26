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
    ctx.fillRect(0,0,canvas.width, canvas.height);
    for(let y=0; y<map.length; y++) {
        for(let x=0; x<map[y].length; x++) {
            if(map[y][x] === 1) {
                ctx.strokeStyle = "blue";
                ctx.strokeRect(offsetX + x*tileSize + 2, offsetY + y*tileSize + 2, tileSize-4, tileSize-4);
            } else if(map[y][x] === 2) {
                ctx.fillStyle = "white";
                ctx.beginPath(); ctx.arc(offsetX+x*tileSize+tileSize/2, offsetY+y*tileSize+tileSize/2, 2, 0, 7); ctx.fill();
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
        
        ctx.fillStyle = "white"; ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score.value}  Lives: ${lives.value}`, 20, 30);
        requestAnimationFrame(gameLoop);
    } else {
        alert("GAME OVER");
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