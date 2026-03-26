import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// VARIABLES GLOBALES - Forzamos el inicio correcto
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

function drawMap() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    map.forEach((row, y) => row.forEach((tile, x) => {
        let rx = offsetX + x * tileSize, ry = offsetY + y * tileSize;
        if (tile === 1) { 
            ctx.strokeStyle = "#2b2bff"; ctx.lineWidth = 2;
            ctx.strokeRect(rx+2, ry+2, tileSize-4, tileSize-4); 
        } else if (tile === 2) { 
            ctx.fillStyle = "#ffb8ae"; ctx.beginPath(); 
            ctx.arc(rx+tileSize/2, ry+tileSize/2, 2, 0, 7); ctx.fill(); 
        }
    }));
}

function gameLoop() {
    // Verificación de seguridad para no entrar en Game Over por error
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives, currentLevel);
        
        // Ganar nivel
        if (!map.some(r => r.includes(2))) {
            currentLevel++;
            map.forEach((r,y)=>r.forEach((t,x)=>{if(t===0)map[y][x]=2;}));
            resetPlayer();
            spawnGhostsForLevel(currentLevel);
        }

        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);

        ctx.fillStyle = "white"; ctx.font = "bold 20px Arial";
        ctx.fillText(`PUNTOS: ${score.value}   VIDAS: ${lives.value}   NIVEL: ${currentLevel}`, offsetX, offsetY - 15);
        
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = "red"; ctx.font = "bold 60px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
        ctx.font = "20px Arial"; ctx.fillStyle = "white";
        ctx.fillText("Recarga la página (F5) para volver a intentar", canvas.width/2, canvas.height/2 + 60);
    }
}

document.onkeydown = (e) => {
    if (e.key.includes("Arrow")) e.preventDefault();
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

// Arrancamos todo
spawnGhostsForLevel(currentLevel);
gameLoop();