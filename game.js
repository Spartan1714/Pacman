import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel, ghosts } from "./ghosts.js";
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

let score = { value: 0 }, lives = { value: 3 }, level = 1;

function loop() {
    if (lives.value > 0) {
        // ACTUALIZACIÓN
        updatePlayer(score);
        updateGhosts(lives);

        // DIBUJO
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width, canvas.height);
        
        // Dibujar Mapa
        for(let y=0; y<map.length; y++) {
            for(let x=0; x<map[y].length; x++) {
                if(map[y][x] === 1) {
                    ctx.fillStyle = "#1919a6";
                    ctx.fillRect(offsetX + x*tileSize + 1, offsetY + y*tileSize + 1, tileSize - 2, tileSize - 2);
                } else if(map[y][x] === 2) {
                    ctx.fillStyle = "white";
                    ctx.beginPath(); ctx.arc(offsetX+x*tileSize+tileSize/2, offsetY+y*tileSize+tileSize/2, 2, 0, 7); ctx.fill();
                } else if(map[y][x] === 3) {
                    ctx.fillStyle = "red";
                    ctx.beginPath(); ctx.arc(offsetX+x*tileSize+tileSize/2, offsetY+y*tileSize+tileSize/2, tileSize/3, 0, 7); ctx.fill();
                }
            }
        }

        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        // Marcador
        ctx.fillStyle = "white"; ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score.value}  Lives: ${lives.value}`, 20, 30);
    } else {
        ctx.fillStyle = "red"; ctx.font = "50px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 150, canvas.height/2);
    }
    requestAnimationFrame(loop);
}

document.onkeydown = (e) => {
    if(e.key === "ArrowUp") setDirection(0,-1);
    if(e.key === "ArrowDown") setDirection(0,1);
    if(e.key === "ArrowLeft") setDirection(-1,0);
    if(e.key === "ArrowRight") setDirection(1,0);
};

loop();