import { map, generateRandomMaze } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer, pacman } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhostsForLevel, isBerserker } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 }, currentLevel = 1, tileSize, offsetX, offsetY;

// Configuración de proporciones
const COLS = 21; // Número impar para el algoritmo de laberinto
const ROWS = 21; 

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Calculamos el tamaño del tile para que quepa TODO el laberinto + un margen del 10%
    const maxTileW = (canvas.width * 0.9) / COLS;
    const maxTileH = (canvas.height * 0.8) / ROWS;
    tileSize = Math.floor(Math.min(maxTileW, maxTileH));

    // Centramos el laberinto en pantalla
    offsetX = (canvas.width - COLS * tileSize) / 2;
    offsetY = (canvas.height - ROWS * tileSize) / 2;
}

window.onresize = resize;
resize();

function gameLoop() {
    if (lives.value > 0) {
        updatePlayer(score);
        updateGhosts(lives, currentLevel, score);

        // Berserker logic
        let mx = Math.round(pacman.vX), my = Math.round(pacman.vY);
        if (map[my]?.[mx] === 3) {
            map[my][mx] = 0;
            isBerserker.active = true;
            isBerserker.timer = 500;
        }

        // Cambio de nivel con laberinto nuevo
        if (!map.some(row => row.includes(2))) {
            currentLevel++;
            generateRandomMaze(COLS, ROWS); // Generamos con las proporciones fijas
            resetPlayer();
            spawnGhostsForLevel(currentLevel);
        }

        // Dibujado limpio
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        map.forEach((row, y) => row.forEach((tile, x) => {
            let rx = offsetX + x * tileSize, ry = offsetY + y * tileSize;
            if (tile === 1) { 
                ctx.strokeStyle = "#2b2bff"; ctx.lineWidth = 2;
                ctx.strokeRect(rx + 1, ry + 1, tileSize - 2, tileSize - 2); 
            }
            else if (tile === 2) { 
                ctx.fillStyle = "#ffb8ae"; ctx.beginPath(); 
                ctx.arc(rx + tileSize/2, ry + tileSize/2, tileSize/8, 0, 7); ctx.fill(); 
            }
            else if (tile === 3) { 
                ctx.fillStyle = "white"; ctx.beginPath(); 
                ctx.arc(rx + tileSize/2, ry + tileSize/2, tileSize/3, 0, 7); ctx.fill(); 
            }
        }));

        drawGhosts(ctx, tileSize, offsetX, offsetY);
        drawPlayer(ctx, tileSize, offsetX, offsetY);
        
        // UI Proporcional
        ctx.fillStyle = "white"; ctx.font = `${Math.max(16, tileSize/1.5)}px Arial`;
        ctx.textAlign = "left";
        ctx.fillText(`SCORE: ${score.value}  LIVES: ${lives.value}  LVL: ${currentLevel}`, offsetX, offsetY - 15);
        
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "red"; ctx.font = "bold 50px Arial"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
    }
}

// Inicialización
generateRandomMaze(COLS, ROWS);
spawnGhostsForLevel(currentLevel);
gameLoop();

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0,-1);
    if (e.key === "ArrowDown") setDirection(0,1);
    if (e.key === "ArrowLeft") setDirection(-1,0);
    if (e.key === "ArrowRight") setDirection(1,0);
};