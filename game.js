import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel } from "./ghost.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let tileSize;
let offsetX = 0;
let offsetY = 0;

// --- CONFIGURACIÓN ESTÉTICA DEL FONDO ---
const BG_COLOR = "#050505"; // Casi negro
const WALL_COLOR_H = 220; // Hue Azul (HSL)

function resizeGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    tileSize = Math.floor(
        Math.min(
            canvas.width / map[0].length,
            canvas.height / map.length
        )
    );

    let mapWidth = map[0].length * tileSize;
    let mapHeight = map.length * tileSize;

    offsetX = Math.floor((canvas.width - mapWidth) / 2);
    offsetY = Math.floor((canvas.height - mapHeight) / 2);
}

resizeGame();
window.addEventListener("resize", resizeGame);

let score = { value: 0 };
let gameOver = false;
let level = 1;
let lives = { value: 3 };

// --- NUEVA ESTÉTICA DEL MAPA (Muros Neón, Puntos Brillantes) ---
function drawMap() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fondo sólido

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let tile = map[y][x];
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;

            if (tile === 1) { // MUROS: Efecto Neón Azul
                ctx.strokeStyle = `hsl(${WALL_COLOR_H}, 100%, 50%)`;
                ctx.lineWidth = 2;
                // Dibujar solo bordes o líneas internas para estética neón, no rectángulos rellenos
                ctx.strokeRect(rx + 2, ry + 2, tileSize - 4, tileSize - 4); 
                
                // Opcional: Brillo (Glow) - Consume recursos, usar con cuidado en AWS si el cliente es lento
                ctx.shadowColor = `hsl(${WALL_COLOR_H}, 100%, 70%)`;
                ctx.shadowBlur = tileSize / 2;
                ctx.strokeRect(rx + tileSize/4, ry + tileSize/4, tileSize/2, tileSize/2);
                ctx.shadowBlur = 0; // Reset blur
            }

            if (tile === 2) { // PUNTOS: Pequeños cuadrados brillantes (estilo retro arcade)
                ctx.fillStyle = "#ffb366"; // Color trigo/crema
                let pSize = tileSize / 6;
                ctx.fillRect(rx + tileSize/2 - pSize/2, ry + tileSize/2 - pSize/2, pSize, pSize);
            }

            if (tile === 3) { // FRUTA PODER: Círculo palpitante
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                // Usar Math.sin para que palpite visualmente
                let pulse = Math.sin(Date.now() / 150) * 2;
                ctx.arc(rx + tileSize / 2, ry + tileSize / 2, (tileSize / 3) + pulse, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.max(14, tileSize/1.5)}px 'Courier New', monospace`; // Fuente retro
    ctx.fillText("SCORE: " + score.value, offsetX, offsetY - 10);
    ctx.fillText("LVL: " + level, offsetX + (map[0].length * tileSize) - (tileSize*3), offsetY - 10);
    
    // Dibujar vidas como pequeños Pacmans
    ctx.fillStyle = "#fcc200";
    for(let i=0; i<lives.value; i++) {
        ctx.beginPath();
        ctx.arc(offsetX + (i * tileSize) + tileSize/2, offsetY + (map.length * tileSize) + tileSize/2, tileSize/3, 0.2*Math.PI, 1.8*Math.PI);
        ctx.lineTo(offsetX + (i * tileSize) + tileSize/2, offsetY + (map.length * tileSize) + tileSize/2);
        ctx.fill();
    }
}

function generateMaze() {
    // ... Tu lógica de generateMaze se mantiene EXACTAMENTE IGUAL ...
    // Asegúrate de mantener la probabilidad de poner frutas (tile 3)
}

function pelletsRemaining() {
    let count = 0;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 2 || map[y][x] === 3) count++;
        }
    }
    return count;
}

function nextLevel() {
    level++;
    generateMaze();
    resetPlayer(); // Usar la nueva función de reset fluido
    spawnGhostsForLevel(); 
}

// --- ACTUALIZACIÓN FLUIDA (Bucle de Física y Lógica) ---
function update() {
    if (gameOver) return;

    // Ya no dependemos de moveDelay ni lastMoveTime.
    // updatePlayer y updateGhosts se ejecutan CADA frame y manejan su propia fluidez.
    updatePlayer(score);
    updateGhosts(lives);

    if (pelletsRemaining() === 0) {
        nextLevel();
    }

    if (lives.value <= 0) {
        gameOver = true;
        document.getElementById("finalScore").textContent = score.value;
        document.getElementById("gameOverScreen").classList.remove("hidden");
    }
}

// --- DIBUJO FLUIDO (Bucle de Render) ---
function draw() {
    // clearRect ya no es necesario si dibujamos el fondo sólido en drawMap
    // ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawMap();
    drawGhosts(ctx, tileSize, offsetX, offsetY);
    drawPlayer(ctx, tileSize, offsetX, offsetY);
    drawScore();
}

// --- GAME LOOP A 60FPS (requestAnimationFrame) ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
    
    // Evitar scroll con flechas
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.key) > -1) {
        e.preventDefault();
    }
});

// Inicialización
generateMaze();
spawnGhostsForLevel();
gameLoop();

document.getElementById("restartBtn").addEventListener("click", () => location.reload());
document.getElementById("exitBtn").addEventListener("click", () => window.location.href = "login.html");