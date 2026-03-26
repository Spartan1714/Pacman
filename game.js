import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let tileSize, offsetX, offsetY;
let score = { value: 0 }, lives = { value: 3 }, level = 1;

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
            let t = map[y][x];
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;
            if(t === 1) { ctx.strokeStyle = "blue"; ctx.strokeRect(rx+2, ry+2, tileSize-4, tileSize-4); }
            else if(t === 2) { ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(rx+tileSize/2, ry+tileSize/2, 2, 0, 7); ctx.fill(); }
            else if(t === 3) { ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(rx+tileSize/2, ry+tileSize/2, tileSize/3, 0, 7); ctx.fill(); }
        }
    }
}

function loop() {
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives);
        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        ctx.fillStyle = "white"; ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score.value} | Lives: ${lives.value} | Level: ${level}`, 20, 30);

        let dots = 0;
        map.forEach(row => row.forEach(t => { if(t===2 || t===3) dots++; }));
        if (dots === 0) { level++; spawnGhostsForLevel(); resetPlayer(); /* Aquí iría generateMaze() */ }
    } else {
        ctx.fillStyle = "red"; ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 100, canvas.height/2);
    }
    requestAnimationFrame(loop);
}

document.onkeydown = (e) => {
    if(e.key === "ArrowUp") setDirection(0,-1);
    if(e.key === "ArrowDown") setDirection(0,1);
    if(e.key === "ArrowLeft") setDirection(-1,0);
    if(e.key === "ArrowRight") setDirection(1,0);
};

spawnGhostsForLevel();
loop();