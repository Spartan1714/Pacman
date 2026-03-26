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
    if (map && map.length > 0) {
        tileSize = Math.floor(Math.min(canvas.width / map[0].length, canvas.height / map.length));
        offsetX = (canvas.width - map[0].length * tileSize) / 2;
        offsetY = (canvas.height - map.length * tileSize) / 2;
    }
}
window.onresize = resize;
resize();

function drawMap() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;

            if (map[y][x] === 1) { // Muros Neón Azules
                ctx.strokeStyle = "#2b2bff";
                ctx.lineWidth = 2;
                ctx.strokeRect(rx + 2, ry + 2, tileSize - 4, tileSize - 4);
            } else if (map[y][x] === 2) { // Puntos Blancos Visibles
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(rx + tileSize / 2, ry + tileSize / 2, tileSize / 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Bucle Unificado a 60 FPS ( requestAnimationFrame )
function gameLoop() {
    if (lives.value > 0) {
        // 1. ACTUALIZACIÓN DE LÓGICA (Corriendo a 60fps)
        updatePlayer(score);
        updateGhosts(lives);

        // 2. DIBUJO
        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);

        // UI (Score y Vidas)
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}`, offsetX, offsetY - 10);

        requestAnimationFrame(gameLoop);
    } else {
        // Game Over
        ctx.fillStyle = "red"; ctx.font = "50px Impact";
        ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
    }
}

// Teclado
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

// Iniciar primer nivel
spawnGhostsForLevel();
gameLoop();