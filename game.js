import { map, TILE_SIZE, spawnCherry } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { sounds } from "./audio.js";
import { updateGhosts, drawGhosts, spawnGhosts, allGhostsDead } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let level = 1;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function checkWinCondition() {
    let dotsLeft = false;
    map.forEach(row => { if (row.includes(2)) dotsLeft = true; });

    if (!dotsLeft || allGhostsDead()) {
        level++;
        map.forEach((row, y) => row.forEach((tile, x) => {
            if (tile === 0 || tile === 2) map[y][x] = 2;
        }));
        resetPlayer();
        spawnGhosts(level);
        spawnCherry(level);
    }
}

function drawCherry(ctx, x, y) {
    let s = TILE_SIZE;
    ctx.fillStyle = "red";
    ctx.beginPath(); ctx.arc(x + s * 0.4, y + s * 0.7, s * 0.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + s * 0.7, y + s * 0.6, s * 0.2, 0, 7); ctx.fill();
    ctx.strokeStyle = "green"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + s * 0.5, y + s * 0.2);
    ctx.quadraticCurveTo(x + s * 0.5, y + s * 0.5, x + s * 0.4, y + s * 0.7); ctx.stroke();
}

// UN SOLO gameLoop con TODA la lógica y el diseño NEÓN
function gameLoop() {
    if (lives.value <= 0) {
        ctx.fillStyle = "white"; 
        ctx.font = "bold 40px 'Courier New'"; 
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        return;
    }

    // 1. LÓGICA
    updatePlayer(score);
    updateGhosts(lives, score);
    checkWinCondition();

    // 2. FONDO
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.floor((canvas.width - 20 * TILE_SIZE) / 2);
    const offsetY = Math.floor((canvas.height - 10 * TILE_SIZE) / 2);

    // 3. DIBUJAR MAPA (Diseño Neón Retro)
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE, ry = offsetY + y * TILE_SIZE;
            
            if (tile === 1) {
                // --- MUROS ESTILO TRON / NEÓN ---
                ctx.save();
                ctx.strokeStyle = "#00ffff"; // Cian Neón
                ctx.lineWidth = 2;
                ctx.shadowBlur = 15;         // Brillo neón
                ctx.shadowColor = "#00ffff";
                
                // Rectángulo exterior brillante
                ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                
                // Detalle interior sin brillo para profundidad
                ctx.shadowBlur = 0;
                ctx.lineWidth = 1;
                ctx.strokeRect(rx + 8, ry + 8, TILE_SIZE - 16, TILE_SIZE - 16);
                ctx.restore();

            } else if (tile === 2) {
                // --- PUNTOS NEÓN ---
                ctx.save();
                ctx.fillStyle = "#ff00ff"; // Fucsia neón
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#ff00ff";
                ctx.beginPath();
                ctx.arc(rx + TILE_SIZE / 2, ry + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

            } else if (tile === 3) {
                drawCherry(ctx, rx, ry);
            }
        });
    });

    // 4. DIBUJAR ENTIDADES
    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    // 5. INTERFAZ
    ctx.fillStyle = "white"; 
    ctx.font = "bold 18px 'Courier New'"; 
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}  LEVEL: ${level}`, offsetX, offsetY - 15);

    requestAnimationFrame(gameLoop);
}

document.onkeydown = (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

// INICIAR
spawnCherry(level);
spawnGhosts(level);
gameLoop();