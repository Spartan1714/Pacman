import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let tileSize = 20; // Valor inicial por defecto
let offsetX = 0;
let offsetY = 0;
let score = { value: 0 }, lives = { value: 3 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Si el mapa no carga, evitamos división por cero
    if (map && map.length > 0 && map[0].length > 0) {
        tileSize = Math.floor(Math.min(canvas.width / map[0].length, canvas.height / map.length));
        offsetX = (canvas.width - map[0].length * tileSize) / 2;
        offsetY = (canvas.height - map.length * tileSize) / 2;
    }
}

window.addEventListener('resize', resize);
resize();

function drawMap() {
    // Fondo negro total
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!map || map.length === 0) return;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let rx = offsetX + (x * tileSize);
            let ry = offsetY + (y * tileSize);

            if (map[y][x] === 1) {
                // Muros con azul neón fuerte
                ctx.strokeStyle = "#0000FF";
                ctx.lineWidth = 2;
                ctx.strokeRect(rx + 2, ry + 2, tileSize - 4, tileSize - 4);
            } else if (map[y][x] === 2) {
                // Puntos blancos
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(rx + tileSize / 2, ry + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function gameLoop() {
    // Limpiamos siempre al inicio del frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives);
        
        drawMap();
        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);

        // UI
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`PUNTOS: ${score.value} | VIDAS: ${lives.value}`, 20, 40);

        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "red";
        ctx.font = "50px Impact";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    }
}

// Iniciar
spawnGhostsForLevel();
gameLoop();

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};