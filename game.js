import { map, TILE_SIZE, generarMapaAleatorio } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, aumentarDificultad, activarPowerMode } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let nivel = 1;
let lastTime = 0;
let gameOver = false;
let cerezaActiva = false;

// Inicialización inicial
generarMapaAleatorio();
spawnGhosts();

function gameLoop(timestamp) {
    if (gameOver) return;

    const dt = (timestamp - lastTime) / 1000; 
    lastTime = timestamp;
    const delta = Math.min(dt, 0.1);

    // 1. Limpiar pantalla
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Centrado dinámico del mapa
    const offsetX = (canvas.width - 20 * TILE_SIZE) / 2;
    const offsetY = (canvas.height - 10 * TILE_SIZE) / 2;

    // 2. ACTUALIZAR LÓGICA
    updatePlayer(score, delta);
    updateGhosts(lives, score, delta);

    // --- LÓGICA DE CEREZA (Power-Up) ---
    // Aparece si el score es múltiplo de 500 y no hay una activa
    if (!cerezaActiva && score.value > 0 && score.value % 500 === 0) {
        let cx = 9, cy = 4; // Posición central
        if (map[cy][cx] === 0 || map[cy][cx] === 2) {
            map[cy][cx] = 4; // 4 = Cereza Power-Up
            cerezaActiva = true;
        }
    }

    // --- REVISAR SI HAS MUERTO ---
    if (lives.value <= 0) {
        showGameOver();
        gameOver = true;
        return;
    }

    // --- REVISAR SI HAS GANADO (NUEVO NIVEL) ---
    let hayPuntos = false;
    for (let row of map) {
        if (row.includes(2)) { hayPuntos = true; break; }
    }
    if (!hayPuntos) {
        pasarDeNivel();
    }

    // 3. DIBUJAR MAPA
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            let rx = offsetX + x * TILE_SIZE;
            let ry = offsetY + y * TILE_SIZE;
            
            if (tile === 1) { // Muros
                ctx.strokeStyle = "#2222ff";
                ctx.lineWidth = 2;
                ctx.strokeRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (tile === 2) { // Puntos
                ctx.fillStyle = "#ffb8ae";
                ctx.fillRect(rx + TILE_SIZE/2 - 1, ry + TILE_SIZE/2 - 1, 3, 3);
            } else if (tile === 4) { // Cereza
                dibujarCereza(ctx, rx + TILE_SIZE/2, ry + TILE_SIZE/2);
            }
        });
    });

    // 4. DIBUJAR PERSONAJES
    drawGhosts(ctx, offsetX, offsetY);
    drawPlayer(ctx, TILE_SIZE, offsetX, offsetY);

    // 5. HUD (Interfaz)
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score.value}`, offsetX, offsetY - 15);
    
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.fillText(`NIVEL: ${nivel}`, canvas.width / 2, offsetY - 15);
    
    ctx.fillStyle = "red";
    ctx.textAlign = "right";
    ctx.fillText(`LIVES: ${"❤️".repeat(lives.value)}`, offsetX + (20 * TILE_SIZE), offsetY - 15);

    requestAnimationFrame(gameLoop);
}

function pasarDeNivel() {
    nivel++;
    cerezaActiva = false;
    
    // El núcleo de tu .zip: Regenerar el laberinto
    generarMapaAleatorio(); 
    
    // Nueva cantidad random de fantasmas (1 a 5)
    spawnGhosts(); 
    
    // Subir dificultad (velocidad)
    aumentarDificultad();
    
    // Reset posiciones
    pacman.x = 1; pacman.y = 1;
    pacman.dirX = 0; pacman.dirY = 0;
    pacman.nextDX = 0; pacman.nextDY = 0;
}

function dibujarCereza(ctx, x, y) {
    // Frutas
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x - 3, y + 2, 5, 0, Math.PI * 2);
    ctx.arc(x + 3, y + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    // Tallo
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 2);
    ctx.quadraticCurveTo(x, y - 8, x + 3, y - 2);
    ctx.stroke();
}

function showGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "red";
    ctx.font = "bold 60px Monospace";
    ctx.textAlign = "center";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "red";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    
    ctx.fillStyle = "white";
    ctx.font = "20px Monospace";
    ctx.shadowBlur = 0;
    ctx.fillText("PULSA F5 PARA REINTENTAR", canvas.width / 2, canvas.height / 2 + 60);
}

// Configuración inicial y controles
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

document.onkeydown = (e) => {
    if (gameOver) return;
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

requestAnimationFrame(gameLoop);