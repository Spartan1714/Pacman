import { map, TILE_SIZE, spawnCherry } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, allGhostsDead, activatePower } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- ESTADO DEL JUEGO ---
let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let audioStarted = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

// --- DESBLOQUEO DE AUDIO (Para navegadores) ---
async function startAudio() {
    if (audioStarted) return;
    const { audioCtx } = await import("./audio.js");
    if (audioCtx && audioCtx.state === 'suspended') {
        await audioCtx.resume();
        audioStarted = true;
        console.log("Audio Arcade activado");
    }
}

// --- LÓGICA DE VICTORIA / SIGUIENTE NIVEL ---
function checkWinCondition() {
    let dotsLeft = false;
    map.forEach(row => { if (row.includes(2)) dotsLeft = true; });

    if (!dotsLeft || allGhostsDead()) {
        level++;
        // Rellenar el mapa con puntos para el nuevo nivel
        map.forEach((row, y) => row.forEach((tile, x) => {
            if (tile === 0 || tile === 2) map[y][x] = 2;
        }));
        resetPlayer();
        spawnGhosts(level);
        spawnCherry(level);
    }
}

// --- DIBUJO DE CEREZA ---
function drawCherry(ctx, x, y) {
    let s = TILE_SIZE;
    ctx.fillStyle = "red";
    ctx.beginPath(); ctx.arc(x + s * 0.4, y + s * 0.7, s * 0.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + s * 0.7, y + s * 0.6, s * 0.2, 0, 7); ctx.fill();
    ctx.strokeStyle = "green"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + s * 0.5, y + s * 0.2);
    ctx.quadraticCurveTo(x + s * 0.5, y + s * 0.5, x + s * 0.4, y + s * 0.7); ctx.stroke();
}

// --- BUCLE PRINCIPAL ---
function gameLoop() {
    if (lives.value <= 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; 
        ctx.font = "bold 40px 'Courier New'"; 
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px 'Courier New'";
        ctx.fillText("F5 PARA REINTENTAR", canvas.width / 2, canvas.height / 2 + 40);
        return;
    }

    // 1. Actualizar Lógica (Pasamos activatePower para la cereza)
    updatePlayer(score, () => activatePower());
    updateGhosts(lives, score);
    checkWinCondition();

    // 2. Limpiar Pantalla
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.floor((canvas.width - 20 * TILE_SIZE) / 2);
    const offsetY = Math.floor((canvas.height - 10 * TILE_SIZE) / 2);

    // 3. Dibujar Mapa Neón (Optimizado para Velocidad)
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE;
            let ry = offsetY + y * TILE_SIZE;

            if (tile === 1) { 
                ctx.save();
                ctx.strokeStyle = "#00ffff";
                ctx.lineWidth = 2;
                ctx.shadowBlur = 8; // Brillo balanceado para que no vaya lento
                ctx.shadowColor = "#00ffff";
                ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                ctx.restore();
            } else if (tile === 2) { 
                ctx.fillStyle = "#ff00ff";
                ctx.beginPath();
                ctx.arc(rx + TILE_SIZE / 2, ry + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 3) {
                drawCherry(ctx, rx, ry);
            }
        });
    });

    // 4. Dibujar Entidades
    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    // 5. Interfaz (UI)
    ctx.fillStyle = "white";
    ctx.font = "bold 18px 'Courier New'";
    ctx.textAlign = "left";
    ctx.fillText(`PUNTOS: ${score.value}  VIDAS: ${lives.value}  NIVEL: ${level}`, offsetX, offsetY - 15);

    requestAnimationFrame(gameLoop);
}

// --- CONTROLES Y ACTIVACIÓN DE AUDIO ---
document.onkeydown = (e) => {
    startAudio(); // Intenta activar audio al presionar cualquier tecla
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

window.onclick = () => startAudio(); // También activa audio al hacer clic

// --- INICIO DEL JUEGO ---
spawnGhosts(level);
spawnCherry(level);
gameLoop();