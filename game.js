/* --- game.js Actualizado --- */
import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScoreRealtime, currentUser, dbRealtime } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menuScreen = document.getElementById("menuScreen");
const resumeBtn = document.getElementById("resumeBtn");
const leaderBtn = document.getElementById("leaderBtn");
const exitToLoginBtn = document.getElementById("exitToLoginBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;
let paused = false;
let dynamicTileSize = 32;
let gameOver = false;
let levelChanging = false;
let scoreSaved = false;

function abrirMenuPrincipal() {
    paused = true;
    bgMusic.pause();
    if (menuScreen) menuScreen.classList.remove("hidden");
}

function cerrarMenuPrincipal() {
    paused = false;
    if (menuScreen) menuScreen.classList.add("hidden");
    if (!gameOver) bgMusic.play().catch(() => {});
}

// Configuración del canvas (Preparando el escalado)
function resize() {
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 800;

    const cols = map[0].length;
    const rows = map.length;
    const availableHeight = canvas.height - 120;
    
    const tileW = Math.floor(canvas.width / cols);
    const tileH = Math.floor(availableHeight / rows);
    
    dynamicTileSize = Math.min(tileW, tileH);
    ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resize);
resize();

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!gameOver && !paused) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    // Renderizado de fondo
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.floor((canvas.width - (map[0].length * dynamicTileSize)) / 2);
    const offsetY = 110; 

    // Dibujar Mapa
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * dynamicTileSize;
            let ry = offsetY + y * dynamicTileSize;
            if (tile === 1) {
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(rx + 2, ry + 2, dynamicTileSize - 4, dynamicTileSize - 4);
            } else if (tile === 2) {
                ctx.fillStyle = "#ff00ff";
                ctx.fillRect(rx + dynamicTileSize/2 - 2, ry + dynamicTileSize/2 - 2, 4, 4);
            }
        });
    });

    drawGhosts(ctx, offsetX, offsetY, dynamicTileSize);
    drawPlayer(ctx, dynamicTileSize, offsetX, offsetY);

    // HUD - SCORE Y VIDAS
    ctx.fillStyle = "#00ffff";
    ctx.font = "16px 'Press Start 2P'";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score.value}`, 25, 50);
    
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffff00";
    ctx.fillText(`LVL: ${level}`, canvas.width - 25, 50);

    // CORAZONES ❤️ con brillo
    for (let i = 0; i < lives.value; i++) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = "red";
        ctx.font = "24px Arial"; 
        ctx.textAlign = "left";
        ctx.fillText("❤️", 25 + i * 40, 90);
        ctx.shadowBlur = 0;
    }

    if (!gameOver) requestAnimationFrame(gameLoop);
}

// CONTROL DE ESCAPE (Manejador único)
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (!gameOver) {
            paused ? cerrarMenuPrincipal() : abrirMenuPrincipal();
        }
        return;
    }

    if (paused || gameOver) return;

    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);

    if (bgMusic.paused && !gameOver) bgMusic.play().catch(() => {});
});

// Eventos del Menú (Botones internos)
if (resumeBtn) resumeBtn.onclick = () => cerrarMenuPrincipal();
if (exitToLoginBtn) exitToLoginBtn.onclick = () => window.location = "login.html";
if (leaderBtn) leaderBtn.onclick = () => window.location = "leaderboard.html";
if (restartBtn) restartBtn.onclick = () => location.reload();

// Inicio
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);