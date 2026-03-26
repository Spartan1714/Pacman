import { map, generateMaze } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, berserker } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// VARIABLES DE ESTADO GLOBALES
let score = { value: 0 };
let lives = { value: 3 }; 
let level = 1;
let tileSize, offsetX, offsetY;

// TAMAÑO FIJO Y COMPACTO (15x15) para respetar proporción clásica
const GRID_SIZE = 15; 

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Calculamos tileSize para que el laberinto quepa entero y se vea grande
    // Usamos GRID_SIZE+2 para dejar un margen estético
    const possibleTileW = Math.floor(canvas.width / (GRID_SIZE + 2));
    const possibleTileH = Math.floor(canvas.height / (GRID_SIZE + 2));
    
    // El tileSize definitivo es el mínimo de ambos para mantener simetría
    tileSize = Math.min(possibleTileW, possibleTileH);

    // Centramos el laberinto perfecto en pantalla
    offsetX = Math.floor((canvas.width - GRID_SIZE * tileSize) / 2);
    offsetY = Math.floor((canvas.height - GRID_SIZE * tileSize) / 2);
}

window.onresize = resize;
resize();

function gameLoop() {
    // Verificación de vidas para Game Over
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives, level, score);

        // Lógica de Power-Up Berserker (Comer punto 3)
        let mx = Math.round(pacman.vX);
        let my = Math.round(pacman.vY);
        if (map[my]?.[mx] === 3) {
            map[my][mx] = 0; // Quitar punto
            berserker.active = true;
            berserker.timer = 500; // Duración (~8 segundos)
        }

        // Ganar nivel -> Generar Nuevo Laberinto Random
        if (!map.some(row => row.includes(2))) {
            level++;
            // Regenerar laberinto con las mismas dimensiones pero nuevo diseño
            generateMaze(GRID_SIZE, GRID_SIZE); 
            resize(); // Recalcular tamaño por si acaso
            resetPlayer();
            spawnGhosts(level);
        }

        // --- DIBUJAR JUEGO ---
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar laberinto (Tu lógica + Diseño Fiel de la imagen)
        map.forEach((row, y) => row.forEach((tile, x) => {
            let rx = offsetX + x * tileSize;
            let ry = offsetY + y * tileSize;

            if (tile === 1) { 
                // MUROS: Contornos azules rectangulares idénticos a image_0.png
                ctx.strokeStyle = "#2b2bff"; 
                ctx.lineWidth = 3;
                // Dejamos un pequeño margen interno (4px) para el contorno
                ctx.strokeRect(rx + 4, ry + 4, tileSize - 8, tileSize - 8); 
            }
            else if (tile === 2) { 
                // PUNTOS: Pequeños y discretos (idénticos a image_0.png)
                ctx.fillStyle = "#ffb8ae"; 
                ctx.beginPath(); 
                ctx.arc(rx + tileSize/2, ry + tileSize/2, 2, 0, 7); ctx.fill(); 
            }
            else if (tile === 3) { 
                // BERSERKER POINT: Punto grande y blanco (idéntico a image_0.png)
                ctx.fillStyle = "white"; 
                ctx.beginPath(); 
                ctx.arc(rx + tileSize/2, ry + tileSize/2, tileSize/3.5, 0, 7); ctx.fill(); 
            }
        }));

        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        // UI Proporcional y Compacta
        ctx.fillStyle = "white"; ctx.font = "bold 24px Arial"; ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}`, offsetX, offsetY - 20);
        
        requestAnimationFrame(gameLoop);
    } else {
        // Pantalla de Game Over
        ctx.fillStyle = "rgba(0,0,0,0.8)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red"; ctx.font = "bold 60px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    }
}

// --- INICIO ÚNICO DEL JUEGO ---
// IMPORTANTE: Pacman nace en {1,1} (esquina superior izquierda)
generateMaze(GRID_SIZE, GRID_SIZE);
spawnGhosts(level);
gameLoop();

// Controles (Tu lógica original)
document.onkeydown = (e) => {
    // Evitar scroll con flechas
    if (e.key.includes("Arrow")) e.preventDefault();
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};