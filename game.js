import { map, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
// Agregamos 'auth' a la importación de firebase
import { saveScoreRealtime, currentUser, dbRealtime, auth } from "./firebase.js"; 
// Importamos la función necesaria de Firebase Auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
import { checkUsername } from "./username.js"
const canvas = document.getElementById("gameCanvas"); // Primero declaras el canvas

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
let levelChanging = false;
let scoreSaved = false;
let playerName = "Guest";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Intentamos obtener el nombre que guardamos en la página setup.html
        const userRef = ref(dbRealtime, `users/${user.uid}/username`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            playerName = snapshot.val();
        } else {
            // Si por algún error no tiene nombre, lo mandamos a que se registre
            window.location.href = "setup.html";
            return;
        }
        
        window.lastPlayer = playerName;

        // Arrancamos el juego directamente
        if (lastTime === 0) {
            resize();
            spawnGhosts(level);
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

// 4. CONTROL DE TECLADO (ESCAPE Y MOVIMIENTO)
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
exitToLoginBtn.onclick = () => confirmModal.classList.remove("hidden");
confirmNo.onclick = () => confirmModal.classList.add("hidden");
confirmYes.onclick = () => window.location = "login.html";

if (leaderBtn) leaderBtn.onclick = () => window.location = "leaderboard.html";
if (restartBtn) restartBtn.onclick = () => location.reload();
if (exitBtn) exitBtn.onclick = () => window.location = "login.html";
if (btnLeaderboardGameOver) {
    btnLeaderboardGameOver.onclick = () => {
        window.location.href = "leaderboard.html";
    };
}


// 6. RENDERIZADO Y ESCALADO
function resize() {
    if (!canvas) return;

    const padding = 20; 
    const availableW = window.innerWidth - padding;
    const availableH = window.innerHeight - padding;
    const cols = map[0].length;
    const rows = map.length;
    const hudSpace = 120; // Espacio superior para el Score y Vidas

    const tileW = availableW / cols;
    const tileH = (availableH - hudSpace) / rows;

    dynamicTileSize = Math.floor(Math.min(tileW, tileH));

    canvas.width = cols * dynamicTileSize;
    canvas.height = (rows * dynamicTileSize) + hudSpace;
    ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resize);

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!gameOver && !paused) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    // FONDO
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = 0; 
    const offsetY = 110;

   // --- HUD (SCORE, USERNAME Y NIVEL) ---
    const fontSizeHUD = Math.max(12, Math.floor(dynamicTileSize * 0.6));
    ctx.font = `${fontSizeHUD}px 'Press Start 2P'`;
    ctx.textBaseline = "top";

    // 1. Score a la izquierda
    ctx.fillStyle = "#00ffff";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE:${score.value}`, 20, 30);

    // 2. Nivel a la derecha
    ctx.fillStyle = "#ffff00";
    ctx.textAlign = "right";
    ctx.fillText(`LVL:${level}`, canvas.width - 20, 30);

    // 3. Username en el centro (ESTO ES LO NUEVO)
    ctx.fillStyle = "#ffffff"; // Blanco para que resalte del resto
    ctx.textAlign = "center";
    //playerName es la variable que definimos al inicio con el checkUsername()
    ctx.fillText(window.lastPlayer || "PLAYER", canvas.width / 2, 30);

    // --- VIDAS (CORAZONES ÚNICOS) ---
    const heartSize = Math.floor(dynamicTileSize * 0.8);
    ctx.font = `${heartSize}px Arial`;
    ctx.textAlign = "left";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "red";
    for (let i = 0; i < lives.value; i++) {
        ctx.fillText("❤️", 20 + i * (heartSize + 8),65);
    }
    ctx.shadowBlur = 0;

    // --- DIBUJO DEL MAPA ---
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
async function init() {
    // 1. Esperamos a que Firebase detecte al usuario
    // (Asegúrate de que currentUser ya esté cargado o usa una promesa)
    
    // 2. Revisamos el Username
    playerName = await checkUsername();
    window.lastPlayer = playerName; // Para que el Game Over lo use

    // 3. Arrancamos el juego
    resize();
    spawnGhosts(level);
    spawnCherry(level);
    requestAnimationFrame(gameLoop);
}

// INICIO
resize();
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);
init(); // Llamamos a la función de inicio