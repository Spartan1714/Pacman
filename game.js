import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghost.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let tileSize, offsetX, offsetY;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tileSize = Math.floor(Math.min(canvas.width / map[0].length, canvas.height / map.length));
    offsetX = (canvas.width - map[0].length * tileSize) / 2;
    offsetY = (canvas.height - map.length * tileSize) / 2;
}
window.onresize = resize; resize();

let score = { value: 0 }, lives = { value: 3 }, level = 1, gameOver = false;

function drawMap() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    for(let y=0; y<map.length; y++) {
        for(let x=0; x<map[y].length; x++) {
            let tile = map[y][x];
            if(tile === 1) { // Muro estético
                ctx.strokeStyle = "blue"; ctx.lineWidth = 2;
                ctx.strokeRect(offsetX + x*tileSize + 2, offsetY + y*tileSize + 2, tileSize-4, tileSize-4);
            } else if(tile === 2) { // Puntos
                ctx.fillStyle = "white";
                ctx.beginPath(); ctx.arc(offsetX + x*tileSize + tileSize/2, offsetY + y*tileSize + tileSize/2, 2, 0, 6.28); ctx.fill();
            } else if(tile === 3) { // Fruta
                ctx.fillStyle = "red";
                ctx.beginPath(); ctx.arc(offsetX + x*tileSize + tileSize/2, offsetY + y*tileSize + tileSize/2, tileSize/3, 0, 6.28); ctx.fill();
            }
        }
    }
}

function update() {
    if (gameOver) return;
    updatePlayer(score);
    updateGhosts(lives);

    // Revisar si se terminó el nivel
    let dots = 0;
    map.forEach(row => row.forEach(t => { if(t===2 || t===3) dots++; }));
    if (dots === 0) {
        level++;
        spawnGhostsForLevel();
        // Aquí deberías llamar a tu función generateMaze() si la tienes
    }

    if (lives.value <= 0) gameOver = true;
}

function loop() {
    update();
    drawMap();
    drawGhosts(ctx, tileSize, offsetX, offsetY);
    drawPlayer(ctx, tileSize, offsetX, offsetY);
    
    // UI
    ctx.fillStyle = "white"; ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score.value}  Lives: ${lives.value}  Level: ${level}`, 20, 30);
    
    requestAnimationFrame(loop);
}

document.onkeydown = (e) => {
    if(e.key === "ArrowUp") setDirection(0,-1);
    if(e.key === "ArrowDown") setDirection(0,1);
    if(e.key === "ArrowLeft") setDirection(-1,0);
    if(e.key === "ArrowRight") setDirection(1,0);
};

loop();