import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScore, saveScoreRealtime, currentUser } from "./firebase.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// estado del juego
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;
let paused = false;

let gameOver = false;
let levelChanging = false;
let scoreSaved = false; // 🔥 control firebase

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
    if (!gameOver && !paused) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    // 🔥 GAME OVER + FIREBASE
if (lives.value <= 0 && !gameOver) {
    gameOver = true;
    bgMusic.pause();
    playSfx(sfx.gameover);

    if (!scoreSaved) {
        scoreSaved = true;

        // Extraemos el nombre del usuario logueado o ponemos "Guest"
        let username = "Guest";
        if (currentUser && currentUser.email) {
            username = currentUser.email.split("@")[0]; // Usa la parte antes del @
        }

        // --- AQUÍ ES EL MOMENTO ---
        // Llamamos a la función de Realtime Database
        saveScoreRealtime(username, score.value)
            .then(() => console.log("Puntaje sincronizado en Realtime"))
            .catch(err => console.error("Error al sincronizar:", err));

        window.lastPlayer = username;
    }
}

    // 🔴 RENDER GAME OVER
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

    // 🔵 CAMBIO DE NIVEL
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

    // render normal (NO TOCADO)
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
    // Si el juego está pausado o en Game Over, ignoramos las flechas
    if (paused || gameOver) return;

    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);

    if (bgMusic.paused && !gameOver) {
        bgMusic.play().catch(() => {});
    }
};

// Referencias a los elementos del nuevo index.html
const pauseBtn = document.getElementById("pauseBtn");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menuScreen");
const resumeBtn = document.getElementById("resumeBtn");
const leaderBtn = document.getElementById("leaderBtn");
const exitToLoginBtn = document.getElementById("exitToLoginBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

// 1. Botón PAUSE (Solo congela/descongela sin abrir el menú)
pauseBtn.onclick = () => {
    paused = !paused; // Alterna el estado
    pauseBtn.innerText = paused ? "RESUME" : "PAUSE";
    
    if (paused) {
        bgMusic.pause();
    } else {
        if (!gameOver) bgMusic.play().catch(() => {});
    }
};

// 2. Botón MENU (Pausa automáticamente y abre el panel de opciones)
menuBtn.onclick = () => {
    paused = true;
    menu.style.display = "block";
    bgMusic.pause();
};

// 3. Botón CONTINUE (Dentro del menú)
resumeBtn.onclick = () => {
    paused = false;
    menu.style.display = "none";
    pauseBtn.innerText = "PAUSE"; // Aseguramos que el botón de pausa diga PAUSE al volver
    bgMusic.play().catch(() => {});
};

// 4. Salir con Confirmación
exitToLoginBtn.onclick = () => {
    confirmModal.style.display = "block";
};

confirmYes.onclick = () => {
    // Aquí puedes llamar a logout() de firebase si lo deseas, 
    // o simplemente redirigir como tenías antes:
    window.location = "login.html";
};

confirmNo.onclick = () => {
    confirmModal.style.display = "none";
};

// 5. Ver Leaderboard
leaderBtn.onclick = () => {
    window.location = "leaderboard.html";
};

// --- INICIO DEL JUEGO ---
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);