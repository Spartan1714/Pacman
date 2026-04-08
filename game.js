/* --- game.js --- */
import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScoreRealtime, currentUser, dbRealtime } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// 1. REFERENCIAS AL DOM
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menuScreen = document.getElementById("menuScreen");
const pauseBtn = document.getElementById("pauseBtn");
const menuBtn = document.getElementById("menuBtn");
const resumeBtn = document.getElementById("resumeBtn");
const leaderBtn = document.getElementById("leaderBtn");
const exitToLoginBtn = document.getElementById("exitToLoginBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

// 2. ESTADO DEL JUEGO
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;
let paused = false;
let dynamicTileSize = 32; // Tamaño base, se ajusta en resize
let gameOver = false;
let levelChanging = false;
let scoreSaved = false;

// 3. FUNCIONES DE CONTROL (Sección lógica)
function abrirMenuPrincipal() {
    paused = true;
    bgMusic.pause();
    if (menuScreen) menuScreen.classList.remove("hidden");
    // Eliminamos el cambio de texto del botón lateral
}

function cerrarMenuPrincipal() {
    paused = false;
    if (menuScreen) menuScreen.classList.add("hidden");
    if (!gameOver) bgMusic.play().catch(() => {});
}

function resize() {
    if (!canvas) return;
    // Mantenemos la resolución del canvas fija según el CSS para evitar estiramientos
    canvas.width = 600;
    canvas.height = 800;

    // CALCULAMOS EL TAMAÑO DE TILE AUTOMÁTICO PARA QUE EL MAPA QUEPA
    const cols = map[0].length;
    const rows = map.length;
    
    // Dejamos espacio para el HUD arriba (ej. 100px)
    const availableHeight = canvas.height - 120;
    
    const tileW = Math.floor(canvas.width / cols);
    const tileH = Math.floor(availableHeight / rows);
    
    dynamicTileSize = Math.min(tileW, tileH);

    ctx.imageSmoothingEnabled = false;
}

window.onresize = resize;

// 🍒 dibujo de cereza
function drawCherry(ctx, x, y, s) {
    let cx = x + s / 2;
    let cy = y + s / 2;

    ctx.save();
    ctx.fillStyle = "#ff0000";
    ctx.shadowBlur = s * 0.2;
    ctx.shadowColor = "red";
    ctx.beginPath();
    ctx.arc(cx - s * 0.18, cy + s * 0.15, s * 0.22, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.18, cy - s * 0.05, s * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = Math.max(1.5, s * 0.06);
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.05, cy - s * 0.35);
    ctx.quadraticCurveTo(cx - s * 0.1, cy - s * 0.1, cx - s * 0.18, cy + s * 0.15);
    ctx.moveTo(cx + s * 0.05, cy - s * 0.35);
    ctx.lineTo(cx + s * 0.18, cy - s * 0.05);
    ctx.stroke();
    ctx.restore();
}

function gameLoop(timestamp) {
    // ... (manten la lógica de updatePlayer y ghosts)

    // --- RENDERIZADO ---
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ajustamos el offset para que el HUD no tape el juego
    const offsetX = Math.floor((canvas.width - (map[0].length * dynamicTileSize)) / 2);
    const offsetY = 120; // Bajamos el mapa para dejar espacio al SCORE y CORAZONES

    // Dibujo del Mapa, Player y Ghosts (manten tu lógica de dynamicTileSize)
    // ... 

    // --- HUD ARCADE (RECUPERADO) ---
    ctx.textAlign = "left";
    ctx.fillStyle = "#00ffff";
    ctx.font = "18px 'Press Start 2P'";
    ctx.fillText(`SCORE: ${score.value}`, 30, 50);

    ctx.textAlign = "right";
    ctx.fillStyle = "#ffff00";
    ctx.fillText(`LVL: ${level}`, canvas.width - 30, 50);

    // DIBUJO DE CORAZONES ❤️ (Aspecto brillante)
    ctx.textAlign = "left";
    for (let i = 0; i < lives.value; i++) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0080";
        ctx.font = "26px Arial"; 
        ctx.fillText("❤️", 30 + i * 40, 90);
        ctx.shadowBlur = 0; // Reset para el resto de dibujos
    }

    requestAnimationFrame(gameLoop);
}

// LÓGICA DE ESCAPE Y PAUSA
document.onkeydown = (e) => {
    if (e.key === "Escape" && !gameOver) {
        paused ? cerrarMenuPrincipal() : abrirMenuPrincipal();
        return;
    }
    // ... (manten tus flechas de movimiento)
};

// BOTONES LATERALES
pauseBtn.onclick = () => {
    if (!paused) abrirMenuPrincipal();
    else cerrarMenuPrincipal();
};

menuBtn.onclick = () => abrirMenuPrincipal();

// controles
document.onkeydown = (e) => {
    // 1. Tecla ESC (Manejo de Pausa)
    if (e.key === "Escape" && !gameOver) {
        if (!paused) {
            abrirMenuPrincipal();
        } else {
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
};

// Eventos Interfaz
// Los botones laterales solo ABREN el menú
pauseBtn.onclick = () => abrirMenuPrincipal();
menuBtn.onclick = () => abrirMenuPrincipal();

// El botón CONTINUE dentro del menú es el que CIERRA
resumeBtn.onclick = () => cerrarMenuPrincipal();

exitToLoginBtn.onclick = () => confirmModal.classList.remove("hidden");
confirmYes.onclick = () => window.location = "login.html";
confirmNo.onclick = () => confirmModal.classList.add("hidden");

if (leaderBtn) leaderBtn.onclick = () => window.location = "leaderboard.html";
if (restartBtn) restartBtn.onclick = () => location.reload();
if (exitBtn) exitBtn.onclick = () => window.location = "login.html";

// Inicio
resize();
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);