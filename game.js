import { map, TILE_SIZE, spawnCherry, generarMapaRandom } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { bgMusic, sfx, playSfx } from "./audio.js";
import { saveScoreRealtime, currentUser } from "./firebase.js";
import { saveScoreRealtime, currentUser, dbRealtime } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// 1. REFERENCIAS AL DOM (Mantenlas todas aquí arriba)
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
const restartBtn = document.getElementById("restartBtn"); // Ahora no dará error
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

// 3. FUNCIONES DE CONTROL (Sección lógica)
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
function drawCherry(ctx, x, y, s) {
    // 's' es el dynamicTileSize que recibe desde el loop
    let cx = x + s / 2;
    let cy = y + s / 2;

    ctx.save();

    // --- Dibujo de las dos cerezas (Cuerpo Rojo) ---
    ctx.fillStyle = "#ff0000";
    ctx.shadowBlur = s * 0.2; // Brillo proporcional
    ctx.shadowColor = "red";

    ctx.beginPath();
    // Cereza izquierda
    ctx.arc(cx - s * 0.18, cy + s * 0.15, s * 0.22, 0, Math.PI * 2);
    // Cereza derecha
    ctx.arc(cx + s * 0.18, cy - s * 0.05, s * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // --- Dibujo de los tallos (Verdes) ---
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = Math.max(1.5, s * 0.06); // Grosor del tallo adaptable
    ctx.lineCap = "round";

    ctx.beginPath();
    // Tallo de la cereza superior
    ctx.moveTo(cx + s * 0.05, cy - s * 0.35);
    ctx.quadraticCurveTo(cx - s * 0.1, cy - s * 0.1, cx - s * 0.18, cy + s * 0.15);
    
    // Tallo de la cereza inferior
    ctx.moveTo(cx + s * 0.05, cy - s * 0.35);
    ctx.lineTo(cx + s * 0.18, cy - s * 0.05);
    
    ctx.stroke();

    // --- Detalle de brillo (Opcional, para que se vea más Pro) ---
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(cx - s * 0.25, cy + s * 0.05, s * 0.05, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.10, cy - s * 0.15, s * 0.05, 0, Math.PI * 2);
    ctx.fill();

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
        document.getElementById("gameOverUI").style.display = "flex";
if (!scoreSaved) {
    scoreSaved = true;

    // Buscamos el nickname en la tabla 'users' usando el UID
    const userRef = ref(dbRealtime, `users/${currentUser.uid}`);
    get(userRef).then((snapshot) => {
        let finalName = "Guest";
        
        if (snapshot.exists()) {
            finalName = snapshot.val().username; // <--- AQUÍ está tu Nickname
        } else if (currentUser.email) {
            finalName = currentUser.email.split("@")[0];
        }

        saveScoreRealtime(finalName, score.value);
        window.lastPlayer = finalName;
    });
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

    // --- RENDER NORMAL (MODIFICADO PARA ADAPTARSE) ---
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Usamos dynamicTileSize para centrar el mapa perfectamente
    const offsetX = Math.floor((canvas.width - (map[0].length * dynamicTileSize)) / 2);
    const HUD_HEIGHT = 80; 
    const offsetY = Math.floor((canvas.height - (map.length * dynamicTileSize)) / 2) + HUD_HEIGHT / 2;

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            // 2. Multiplicamos por dynamicTileSize en lugar de TILE_SIZE
            let rx = offsetX + x * dynamicTileSize;
            let ry = offsetY + y * dynamicTileSize;

            if (tile === 1) {
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 2;
                // Dibujamos la pared ajustada al nuevo tamaño
                ctx.strokeRect(rx + 2, ry + 2, dynamicTileSize - 4, dynamicTileSize - 4);
            } 
            else if (tile === 2) {
                ctx.fillStyle = "#ff00ff";
                // Centramos el punto en el nuevo tamaño de celda
                ctx.fillRect(rx + dynamicTileSize/2 - 2, ry + dynamicTileSize/2 - 2, 4, 4);
            } 
            else if (tile === 3) {
                // Pasamos dynamicTileSize a la cereza
                drawCherry(ctx, rx, ry, dynamicTileSize);
            }
        });
    });

    // 3. Pasamos el tamaño dinámico a los personajes para que escalen
    drawGhosts(ctx, offsetX, offsetY, dynamicTileSize);
    drawPlayer(ctx, dynamicTileSize, offsetX, offsetY);

    // HUD adaptable
    const hudY = 40;
    ctx.fillStyle = "#00ffff";
    ctx.font = "16px 'Press Start 2P'";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score.value}`, 30, hudY);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffff00";
    ctx.fillText(`LVL: ${level}`, canvas.width - 30, hudY);

    ctx.textAlign = "left";
    for (let i = 0; i < lives.value; i++) {
        ctx.font = "24px Arial";
        ctx.fillText("❤️", 30 + i * 35, hudY + 35);
    }

    requestAnimationFrame(gameLoop);
}

// controles
document.onkeydown = (e) => {
    // 1. Tecla ESC (Funciona aunque esté pausado, pero no si es Game Over)
    if (e.key === "Escape" && !gameOver) {
        if (!paused) {
            abrirMenuPrincipal();
        } else {
            cerrarMenuPrincipal();
        }
        return; // Salimos para no procesar movimientos
    }

    // 2. Si el juego está pausado o en Game Over, ignoramos el resto (flechas)
    if (paused || gameOver) return;

    // 3. Movimiento
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);

    // Música
    if (bgMusic.paused && !gameOver) {
        bgMusic.play().catch(() => {});
    }
};


// --- CONFIGURACIÓN DE EVENTOS DE INTERFAZ ---

// 1. Botón PAUSE (El de la barra lateral)
pauseBtn.onclick = () => {
    // Si no está pausado, abrimos el menú. Si ya está pausado, lo cerramos.
    if (!paused) {
        abrirMenuPrincipal();
    } else {
        cerrarMenuPrincipal();
    }
};

// 2. Botón MENU (El de la barra lateral - hace lo mismo que Pause)
menuBtn.onclick = () => {
    abrirMenuPrincipal();
};

// 3. Botón CONTINUE (El que está DENTRO del menú central)
resumeBtn.onclick = () => {
    cerrarMenuPrincipal();
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

// 6. Botones de Game Over (Restart / Exit)
if (restartBtn) {
    restartBtn.onclick = () => location.reload();
}

if (exitBtn) {
    exitBtn.onclick = () => window.location = "login.html";
}

// --- INICIO DEL JUEGO ---
spawnGhosts(level);
spawnCherry(level);
requestAnimationFrame(gameLoop);
// --- AL FINAL DE game.js ---



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
}
window.onload = () => {
    resize();
    requestAnimationFrame(gameLoop);
};

