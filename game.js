/* --- game.js --- */
import { map, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScoreRealtime, currentUser, dbRealtime, auth } from "./firebase.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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
const btnLeaderboardGameOver = document.getElementById("btnLeaderboardGameOver");

// 2. ESTADO DEL JUEGO
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;
let paused = false;
let dynamicTileSize = 32;
let gameOver = false;
let playerName = "Guest";
window.currentCherry = null; // Variable global para la cereza

export function spawnCherry(level) {
    // ... tu lógica de buscar espacio ...
    window.currentCherry = { x: chosenX, y: chosenY }; // Forzamos que sea global
}

// --- INICIO DEL JUEGO (Firebase) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = ref(dbRealtime, `users/${user.uid}/username`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            playerName = snapshot.val();
        } else {
            window.location.href = "setup.html";
            return;
        }
        
        window.lastPlayer = playerName;

        // Solo arrancamos si no ha iniciado ya
        if (lastTime === 0) {
            resize();
            spawnGhosts(level);
            // spawnCherry viene de map.js y debe asignar algo a window.currentCherry
            spawnCherry(level); 
            requestAnimationFrame(gameLoop);
        }
    } else {
        window.location.href = "login.html";
    }
});

// 3. FUNCIONES DE MENÚ
function abrirMenuPrincipal() {
    paused = true;
    bgMusic.pause();
    menuScreen.classList.remove("hidden");
    menuScreen.style.display = "flex";
}

function cerrarMenuPrincipal() {
    paused = false;
    menuScreen.classList.add("hidden");
    menuScreen.style.display = "none";
    confirmModal.classList.add("hidden");
    confirmModal.style.display = "none";
    if (!gameOver) bgMusic.play().catch(() => {});
}

// 4. CONTROL DE TECLADO
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !gameOver) {
        if (!paused) abrirMenuPrincipal();
        else if (confirmModal.classList.contains("hidden")) cerrarMenuPrincipal();
        return;
    }
    if (paused || gameOver) return;
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
});

// 5. EVENTOS DE BOTONES
resumeBtn.onclick = () => cerrarMenuPrincipal();
exitToLoginBtn.onclick = () => confirmModal.classList.remove("hidden");
confirmNo.onclick = () => confirmModal.classList.add("hidden");
confirmYes.onclick = () => window.location.href = "login.html";
if (leaderBtn) leaderBtn.onclick = () => window.location.href = "leaderboard.html";
if (restartBtn) restartBtn.onclick = () => location.reload();
if (exitBtn) exitBtn.onclick = () => window.location.href = "login.html";
if (btnLeaderboardGameOver) btnLeaderboardGameOver.onclick = () => window.location.href = "leaderboard.html";

// 6. RENDERIZADO
function resize() {
    if (!canvas) return;
    const padding = 20; 
    const availableW = window.innerWidth - padding;
    const availableH = window.innerHeight - padding;
    const cols = map[0].length;
    const rows = map.length;
    const hudSpace = 180; 

    const tileW = availableW / cols;
    const tileH = (availableH - hudSpace) / rows;
    dynamicTileSize = Math.floor(Math.min(tileW, tileH));

    canvas.width = cols * dynamicTileSize;
    canvas.height = (rows * dynamicTileSize) + hudSpace;
}
window.addEventListener('resize', resize);

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!gameOver && !paused) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);

        // --- LÓGICA PARA COMER CEREZA ---
        if (window.currentCherry && window.player) {
            // Comprobamos si Pacman (redondeando su posición) está en la misma celda
            const px = Math.round(window.player.x);
            const py = Math.round(window.player.y);
            
            if (px === window.currentCherry.x && py === window.currentCherry.y) {
                score.value += 100;
                window.currentCherry = null; // ¡Comida!
                playSfx(sfx.eatFruit); 
                // Programar que salga otra en 15 segundos
                setTimeout(() => { if(!gameOver) spawnCherry(level); }, 15000);
            }
        }
    }

    // FONDO
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = 0; 
    const offsetY = 180;
    let dotsRemaining = 0; // <--- Variable para detectar victoria

    // --- HUD (SCORE, USERNAME Y NIVEL) ---
    const fontSizeHUD = Math.max(12, Math.floor(dynamicTileSize * 0.6));
    ctx.font = `${fontSizeHUD}px 'Press Start 2P'`;
    ctx.textBaseline = "top";

    ctx.fillStyle = "#00ffff";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE:${score.value}`, 20, 30);

    ctx.fillStyle = "#ffff00";
    ctx.textAlign = "right";
    ctx.fillText(`LVL:${level}`, canvas.width - 20, 30);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(window.lastPlayer || "PLAYER", canvas.width / 2, 30);

    // --- VIDAS ---
    const heartSize = 25;
    ctx.font = `${heartSize}px Arial`;
    ctx.textAlign = "left";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "red";
    for (let i = 0; i < lives.value; i++) {
        ctx.fillText("❤️", 25 + i * (heartSize + 10), 75); 
    }
    ctx.shadowBlur = 0;

    // --- DIBUJO DEL MAPA Y CONTEO DE PUNTOS ---
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
                dotsRemaining++; // <--- Contamos los puntos que faltan
            }
        });
    });

    // --- LÓGICA DE SIGUIENTE NIVEL ---
    if (dotsRemaining === 0 && !gameOver && !levelChanging) {
        levelChanging = true;
        level++;
        // Pausa breve antes del siguiente mapa
        setTimeout(() => {
            generarMapaRandom(); 
            resetPlayer();
            spawnGhosts(level);
            spawnCherry(level);
            levelChanging = false;
        }, 1500);
    }

    // --- DIBUJO DE LA CEREZA ---
    if (window.currentCherry) {
        const rx = offsetX + window.currentCherry.x * dynamicTileSize;
        const ry = offsetY + window.currentCherry.y * dynamicTileSize;
        
        ctx.font = `${Math.floor(dynamicTileSize * 0.8)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🍒", rx + dynamicTileSize / 2, ry + dynamicTileSize / 2);
    }

    // --- FANTASMAS Y JUGADOR ---
    drawGhosts(ctx, offsetX, offsetY, dynamicTileSize);
    drawPlayer(ctx, dynamicTileSize, offsetX, offsetY);

    // LOGICA DE GAME OVER
    if (lives.value <= 0 && !gameOver) {
        gameOver = true;
        bgMusic.pause();
        const ui = document.getElementById("gameOverUI");
        if (window.lastPlayer && score.value > 0) {
            saveScoreRealtime(window.lastPlayer, score.value);
        }
        if (ui) {
            ui.classList.remove("hidden");
            ui.style.display = "flex";
        }
    }

    requestAnimationFrame(gameLoop);
}