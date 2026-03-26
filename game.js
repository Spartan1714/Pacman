import { map, TILE_SIZE, generateMaze } from "./map.js";
import { drawGhosts, updateGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { updatePlayer, drawPlayer, pacman } from "./player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function gameLoop() {
    if (lives.value <= 0) {
        ctx.fillStyle = "red"; ctx.font = "bold 50px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
        return;
    }

    updatePlayer(score);
    updateGhosts(lives, score);

    // Colisión con punto Berserker
    if (map[Math.round(pacman.y)]?.[Math.round(pacman.x)] === 3) {
        map[Math.round(pacman.y)][Math.round(pacman.x)] = 0;
        activatePower();
    }

    // Dibujar fondo y centrar mapa
    ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width,canvas.height);
    const ox = (canvas.width - 20 * TILE_SIZE) / 2;
    const oy = (canvas.height - 11 * TILE_SIZE) / 2;

    map.forEach((row, y) => row.forEach((tile, x) => {
        let rx = ox + x * TILE_SIZE, ry = oy + y * TILE_SIZE;
        if (tile === 1) {
            ctx.strokeStyle = "blue"; ctx.lineWidth = 2;
            ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        } else if (tile === 2) {
            ctx.fillStyle = "#ffb8ae"; ctx.beginPath();
            ctx.arc(rx + TILE_SIZE/2, ry + TILE_SIZE/2, 2, 0, 7); ctx.fill();
        } else if (tile === 3) {
            ctx.fillStyle = "white"; ctx.beginPath();
            ctx.arc(rx + TILE_SIZE/2, ry + TILE_SIZE/2, 7, 0, 7); ctx.fill();
        }
    }));

    drawGhosts(ctx, ox, oy);
    drawPlayer(ctx, TILE_SIZE, ox, oy);
    
    ctx.fillStyle = "white"; ctx.font = "bold 20px Arial";
    ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}`, ox, oy - 15);

    requestAnimationFrame(gameLoop);
}

generateMaze();
spawnGhosts();
gameLoop();