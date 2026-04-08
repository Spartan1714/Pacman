/* --- game.js --- */
import { map, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScoreRealtime, currentUser, dbRealtime } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// 1. REFERENCIAS AL DOM
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menuScreen = document.getElementById("menuScreen");
const resumeBtn = document.getElementById("resumeBtn");
const leaderBtn = document.getElementById("leaderBtn");
const exitToLoginBtn = document.getElementById("exitToLoginBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const restartBtn = document.getElementById("btnRestart");
const exitBtn = document.getElementById("btnExit");

// 2. ESTADO DEL JUEGO
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;
let paused = false;
let dynamicTileSize = 32;
let gameOver = false;
let levelChanging = false;
let scoreSaved = false;

// 3. FUNCIONES DE MENÚ
function abrirMenuPrincipal() {
    paused = true;
    bgMusic.pause();
    menuScreen.classList.remove("hidden");
}

function cerrarMenuPrincipal() {
    paused = false;
    menuScreen.classList.add("hidden");
    confirmModal.classList.add("hidden");
    if (!gameOver) bgMusic.play().catch(() => {});
}

// 4. CONTROL DE TECLADO (ESCAPE)
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !gameOver) {
        if (!paused) {
            abrirMenuPrincipal();
        } else if (confirmModal.classList.contains("hidden")) {
            cerrarMenuPrincipal();
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

// 5. EVENTOS DE INTERFAZ
resumeBtn.onclick = () => cerrarMenuPrincipal();

exitToLoginBtn.onclick = () => {
    confirmModal.classList.remove("hidden");
};

confirmNo.onclick = () => {
    confirmModal.classList.add("hidden");
};

confirmYes.onclick = () => {
    window.location = "login.html";
};

if (leaderBtn) leaderBtn.onclick = () => window.location = "leaderboard.html";
if (restartBtn) restartBtn.onclick = () => location.reload();
if (exitBtn) exitBtn.onclick = () => window.location = "login.html";

// 6. RENDERIZADO Y LÓGICA
function resize() {
    if (!canvas) return;

    // 1. Buscamos el tamaño de la ventana (ventana del navegador)
    const padding = 40; // Margen para que no toque los bordes
    const availableW = window.innerWidth - padding;
    const availableH = window.innerHeight - padding;

    // 2. Definimos cuántas columnas y filas tiene tu mapa
    const cols = map[0].length;
    const rows = map.length;

    // 3. Calculamos cuánto espacio necesita el HUD (Score, Vidas)
    const hudSpace = 120; 
    const gameAreaH = availableH - hudSpace;

    // 4. Calculamos el tamaño del Tile para que quepa a lo ancho y a lo alto
    const tileW = availableW / cols;
    const tileH = gameAreaH / rows;

    // Usamos el más pequeño de los dos para mantener la proporción cuadrada
    dynamicTileSize = Math.floor(Math.min(tileW, tileH));

    // 5. Ajustamos el tamaño REAL del canvas al mapa calculado
    canvas.width = cols * dynamicTileSize;
    canvas.height = (rows * dynamicTileSize) + hudSpace;

    // Desactivamos el suavizado para mantener el estilo pixel-art
    ctx.imageSmoothingEnabled = false;
}

// Aseguramos que se llame al cambiar el tamaño de la ventana
window.addEventListener('resize', resize);

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!gameOver && !paused) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    // Dibujo
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

const offsetX = Math.floor((canvas.width - (map[0].length * dynamicTileSize)) / 2);
const offsetY = 110;
for (let i = 0; i < lives.value; i++) {
    ctx.font = `${Math.floor(dynamicTileSize * 0.8)}px Arial`; 
    ctx.fillText("❤️", 25 + i * (dynamicTileSize + 5), 90);
}

    // Mapa
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

    // HUD
    ctx.fillStyle = "#00ffff";
    ctx.font = "16px 'Press Start 2P'";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score.value}`, 25, 50);
    ctx.textAlign = "right";
    ctx.fillText(`LVL: ${level}`, canvas.width - 25, 50);

    // Vidas con corazón brillante
    for (let i = 0; i < lives.value; i++) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "red";
        ctx.font = "24px Arial";
        ctx.textAlign = "left";
        ctx.fillText("❤️", 25 + i * 40, 90);
        ctx.shadowBlur = 0;
    }

    if (lives.value <= 0 && !gameOver) {
        gameOver = true;
        document.getElementById("gameOverUI").classList.remove("hidden");
    }

    requestAnimationFrame(gameLoop);
}

resize();
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);