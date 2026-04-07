import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, allGhostsDead, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// estado del juego
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

// 🍒 dibujo de cereza
function drawCherry(ctx, x, y) {
    let s = TILE_SIZE;
    let cx = x + s / 2;
    let cy = y + s / 2;

    ctx.save();
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(cx - s * 0.15, cy + s * 0.15, s * 0.2, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.15, cy - s * 0.10, s * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.05, cy - s * 0.3);
    ctx.quadraticCurveTo(cx - s * 0.1, cy - s * 0.1, cx - s * 0.15, cy + s * 0.15);
    ctx.moveTo(cx + s * 0.05, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.15, cy - s * 0.10);
    ctx.stroke();
    ctx.restore();
}

function gameLoop(timestamp) {
if (lives.value <= 0) {

    if (!gameOverPlayed) {
        bgMusic.pause();          // 🔥 detener música
        bgMusic.currentTime = 0;  // opcional: reiniciar

        playSfx(sfx.gameover);    // 🔥 sonido game over

        gameOverPlayed = true;
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    return;
}
    }

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    // lógica
    updatePlayer(score, () => activatePower(), dt);
    updateGhosts(lives, score, dt);

    // 🔥 CAMBIO DE NIVEL (MAPA NUEVO)
if (!map.flat().includes(2)) {
    console.log("NIVEL COMPLETADO");

    level++;

    generarMapaRandom();

    resetPlayer(); 
    spawnGhosts(level); 
    spawnCherry(level);
}

    // render
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.floor((canvas.width - 20 * TILE_SIZE) / 2);
    const offsetY = Math.floor((canvas.height - 10 * TILE_SIZE) / 2);

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE;
            let ry = offsetY + y * TILE_SIZE;

            if (tile === 1) {
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } 
            else if (tile === 2) {
                ctx.fillStyle = "#ff00ff";
                ctx.fillRect(rx + TILE_SIZE/2 - 1, ry + TILE_SIZE/2 - 1, 2, 2);
            } 
            else if (tile === 3) {
                drawCherry(ctx, rx, ry);
            }
        });
    });

    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    ctx.fillStyle = "white";
    ctx.font = "16px Courier New";
    ctx.fillText(`PTS: ${score.value}  VIDAS: ${lives.value}  LVL: ${level}`, offsetX, offsetY - 10);

    requestAnimationFrame(gameLoop);
}

// controles
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
    if (bgMusic.paused) { bgMusic.play().catch(() => {});
}
};

// inicio
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);