import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
// LÍNEA CORREGIDA: Solo una importación de firebase
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
let dynamicTileSize = 32;
let gameOver = false;
let levelChanging = false;
let scoreSaved = false;

// 3. FUNCIONES DE CONTROL
function abrirMenuPrincipal() {
    paused = true;
    bgMusic.pause();
    if (menuScreen) menuScreen.classList.remove("hidden");
    if (pauseBtn) pauseBtn.innerText = "RESUME";
}

function cerrarMenuPrincipal() {
    paused = false;
    if (menuScreen) menuScreen.classList.add("hidden");
    if (pauseBtn) pauseBtn.innerText = "PAUSE";
    if (!gameOver) bgMusic.play().catch(() => {});
}

function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.85;
    const cols = map[0].length;
    const rows = map.length;
    const tileW = Math.floor(canvas.width / cols);
    const tileH = Math.floor((canvas.height - 100) / rows);
    dynamicTileSize = Math.min(tileW, tileH);
    ctx.imageSmoothingEnabled = false;
}

window.onresize = resize;

function drawCherry(ctx, x, y, s) {
    let cx = x + s / 2;
    let cy = y + s / 2;
    ctx.save();
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(cx - s * 0.18, cy + s * 0.15, s * 0.22, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.18, cy - s * 0.05, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
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
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!gameOver && !paused) {
        updatePlayer(score, () => activatePower(), dt);
        updateGhosts(lives, score, dt);
    }

    if (lives.value <= 0 && !gameOver) {
        gameOver = true;
        bgMusic.pause();
        playSfx(sfx.gameover);
        document.getElementById("gameOverUI").style.display = "flex";
        
        if (!scoreSaved && currentUser) {
            scoreSaved = true;
            const userRef = ref(dbRealtime, `users/${currentUser.uid}`);
            get(userRef).then((snapshot) => {
                let finalName = snapshot.exists() ? snapshot.val().username : (currentUser.email ? currentUser.email.split("@")[0] : "Guest");
                saveScoreRealtime(finalName, score.value);
                window.lastPlayer = finalName;
            });
        }
    }

    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff0033";
        ctx.font = "28px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px 'Press Start 2P'";
        ctx.fillText(`PLAYER: ${window.lastPlayer || "..."}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`SCORE: ${score.value}`, canvas.width / 2, canvas.height / 2 + 70);
        return;
    }

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

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.floor((canvas.width - (map[0].length * dynamicTileSize)) / 2);
    const HUD_HEIGHT = 80; 
    const offsetY = Math.floor((canvas.height - (map.length * dynamicTileSize)) / 2) + HUD_HEIGHT / 2;

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
            } else if (tile === 3) {
                drawCherry(ctx, rx, ry, dynamicTileSize);
            }
        });
    });

    drawGhosts(ctx, offsetX, offsetY, dynamicTileSize);
    drawPlayer(ctx, dynamicTileSize, offsetX, offsetY);

    // HUD
    ctx.fillStyle = "#00ffff";
    ctx.font = "16px 'Press Start 2P'";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score.value}`, 30, 40);
    ctx.textAlign = "right";
    ctx.fillText(`LVL: ${level}`, canvas.width - 30, 40);

    requestAnimationFrame(gameLoop);
}

// Controles
document.onkeydown = (e) => {
    if (e.key === "Escape" && !gameOver) {
        paused ? cerrarMenuPrincipal() : abrirMenuPrincipal();
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
pauseBtn.onclick = () => paused ? cerrarMenuPrincipal() : abrirMenuPrincipal();
menuBtn.onclick = () => abrirMenuPrincipal();
resumeBtn.onclick = () => cerrarMenuPrincipal();
exitToLoginBtn.onclick = () => confirmModal.classList.remove("hidden");
confirmYes.onclick = () => window.location = "login.html";
confirmNo.onclick = () => confirmModal.classList.add("hidden");

if (restartBtn) restartBtn.onclick = () => location.reload();
if (exitBtn) exitBtn.onclick = () => window.location = "login.html";

// Inicio
resize();
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);