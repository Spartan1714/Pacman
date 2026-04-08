import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScore, currentUser } from "./firebase.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// estado del juego
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;

let gameOver = false;
let levelChanging = false;
let scoreSaved = false;

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

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    // lógica
    if (!gameOver) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    // 🔥 GAME OVER + GUARDADO
    if (lives.value <= 0 && !gameOver) {
        gameOver = true;

        bgMusic.pause();
        bgMusic.currentTime = 0;

        playSfx(sfx.gameover);

        // guardar score UNA sola vez
        if (!scoreSaved) {
            scoreSaved = true;

            try {
                const user = getCurrentUser();

                let username = "Guest";

                if (user && user.email) {
                    username = user.email.split("@")[0];
                }

                saveScore(username, score.value);
                window.lastPlayer = username;

                console.log("Guardado:", username, score.value);

            } catch (e) {
                console.error("Error Firebase:", e);
            }
        }
    }

    // 🔥 RENDER GAME OVER
    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff0033";
        ctx.font = "28px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px 'Press Start 2P'";
        ctx.fillText(`PLAYER: ${window.lastPlayer || "UNKNOWN"}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`SCORE: ${score.value}`, canvas.width / 2, canvas.height / 2 + 70);

        return;
    }

    // 🔥 CAMBIO DE NIVEL
    if (!map.flat().includes(2) && !levelChanging) {
        levelChanging = true;

        bgMusic.pause();
        playSfx(sfx.levelup);

        setTimeout(() => {
            level++;

            generarMapaRandom();

            resetPlayer();
            spawnGhosts(level);
            spawnCherry(level);

            bgMusic.play().catch(() => {});

            levelChanging = false;
        }, 800);
    }

    // render normal
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.floor((canvas.width - 20 * TILE_SIZE) / 2);
    const HUD_HEIGHT = 60;
    const offsetY = Math.floor((canvas.height - 10 * TILE_SIZE) / 2) + HUD_HEIGHT / 2;

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

    // HUD
    const hudY = 30;

    ctx.fillStyle = "#00ffff";
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText(`SCORE: ${score.value}`, 20, hudY);

    ctx.fillStyle = "#ffff00";
    ctx.fillText(`LVL: ${level}`, canvas.width - 150, hudY);

    for (let i = 0; i < lives.value; i++) {
        ctx.font = "20px Arial";
        ctx.fillText("❤️", 20 + i * 30, hudY + 25);
    }

    requestAnimationFrame(gameLoop);
}

// controles
document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);

    if (bgMusic.paused && !gameOver) {
        bgMusic.play().catch(() => {});
    }
};

// inicio
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);