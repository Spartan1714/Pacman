import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScoreRealtime, currentUser } from "./firebase.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// estado del juego
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;
let paused = false;
let dynamicTileSize = 32;

let gameOver = false;
let levelChanging = false;
let scoreSaved = false; // 🔥 control firebase

function resize() {
    // 1. Le decimos al canvas que su resolución interna sea igual a la de la ventana
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.85;

    // 2. CALCULAMOS EL TAMAÑO DE TILE AUTOMÁTICO
    // Dividimos el ancho del canvas entre el número de columnas de tu mapa (ej. 20)
    const cols = map[0].length;
    const rows = map.length;
    
    // Elegimos el tamaño más pequeño para que el mapa quepa perfecto (ancho o alto)
    const tileW = Math.floor(canvas.width / cols);
    const tileH = Math.floor((canvas.height - 100) / rows); // -100 para el HUD
    
    dynamicTileSize = Math.min(tileW, tileH);

    ctx.imageSmoothingEnabled = false;
}

ctx.imageSmoothingEnabled = false;
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

    if (!gameOver && !paused) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    // --- RENDER ---
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Centrado dinámico
    const offsetX = Math.floor((canvas.width - (map[0].length * dynamicTileSize)) / 2);
    const HUD_HEIGHT = 80; 
    const offsetY = Math.floor((canvas.height - (map.length * dynamicTileSize)) / 2) + HUD_HEIGHT / 2;

    // Dibujo del Mapa
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * dynamicTileSize;
            let ry = offsetY + y * dynamicTileSize;

            if (tile === 1) {
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = Math.max(1, dynamicTileSize * 0.08); 
                ctx.strokeRect(rx + 2, ry + 2, dynamicTileSize - 4, dynamicTileSize - 4);
            } 
            else if (tile === 2) {
                ctx.fillStyle = "#ff00ff";
                ctx.fillRect(rx + dynamicTileSize/2 - 2, ry + dynamicTileSize/2 - 2, 4, 4);
            } 
            else if (tile === 3) {
                // AQUÍ: Pasamos el tamaño dinámico a la cereza
                drawCherry(ctx, rx, ry, dynamicTileSize);
            }
        });
    });

    // AQUÍ ESTÁ EL TRUCO: Pasamos dynamicTileSize a los otros archivos
    drawGhosts(ctx, offsetX, offsetY, dynamicTileSize);
    drawPlayer(ctx, dynamicTileSize, offsetX, offsetY);

    // HUD (Score y Vidas)
    renderHUD();

    if (!gameOver) requestAnimationFrame(gameLoop);
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
    // Quitamos la clase que lo esconde
    menuScreen.classList.remove("hidden"); 
    bgMusic.pause();
};

// 3. Botón CONTINUE (Dentro del menú)
resumeBtn.onclick = () => {
    paused = false;
    // Volvemos a poner la clase que lo esconde
    menuScreen.classList.add("hidden"); 
    pauseBtn.innerText = "PAUSE"; 
    bgMusic.play().catch(() => {});
};

// 4. Salir con Confirmación
exitToLoginBtn.onclick = () => {
    confirmModal.classList.remove("hidden");
};

confirmYes.onclick = () => {
    window.location = "login.html";
};

confirmNo.onclick = () => {
    confirmModal.classList.add("hidden");
};

// 5. Ver Leaderboard
if (leaderBtn) {
    leaderBtn.onclick = () => {
        window.location = "leaderboard.html";
    };
}

// --- INICIO DEL JUEGO ---
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);
// --- AL FINAL DE game.js ---

// Usamos una pequeña validación para que no tire error si el botón es nulo
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

if (restartBtn) {
    restartBtn.onclick = () => {
        console.log("Reiniciando juego...");
        location.reload(); 
    };
} else {
    console.error("No se encontró el botón con ID 'restartBtn' en el HTML.");
}

if (exitBtn) {
    exitBtn.onclick = () => {
        window.location = "login.html";
    };
}

