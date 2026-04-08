import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScore, currentUser, logout } from "./firebase.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;

let gameOver = false;
let scoreSaved = false;

// logout botón seguro
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        logout();
        window.location = "login.html";
    };
}

function gameLoop(timestamp) {

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!gameOver) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    // GAME OVER
    if (lives.value <= 0 && !gameOver) {
        gameOver = true;

        bgMusic.pause();
        playSfx(sfx.gameover);

        if (!scoreSaved) {
            scoreSaved = true;

            let username = "Guest";

            if (currentUser && currentUser.email) {
                username = currentUser.email.split("@")[0];
            }

            saveScore(username, score.value);
            window.lastPlayer = username;
        }
    }

    // render game over
    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "28px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.font = "12px 'Press Start 2P'";
        ctx.fillText(`PLAYER: ${window.lastPlayer || "UNKNOWN"}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`SCORE: ${score.value}`, canvas.width / 2, canvas.height / 2 + 70);

        return;
    }

    // render normal
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = 50;
    const offsetY = 80;

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE;
            let ry = offsetY + y * TILE_SIZE;

            if (tile === 1) {
                ctx.strokeStyle = "#00ffff";
                ctx.strokeRect(rx, ry, TILE_SIZE, TILE_SIZE);
            }
        });
    });

    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    requestAnimationFrame(gameLoop);
}

spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);