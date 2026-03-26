import { db, auth } from "./firebase-config.js"; // Ajusta según tu archivo
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { map, TILE_SIZE, generateLevel } from "./map.js";
import { drawGhosts, updateGhosts, spawnGhosts, activatePower } from "./ghosts.js";
import { updatePlayer, drawPlayer, pacman } from "./player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = { value: 0 }, lives = { value: 3 };

async function saveScore() {
    if (auth.currentUser) {
        await setDoc(doc(db, "highscores", auth.currentUser.uid), {
            score: score.value,
            user: auth.currentUser.displayName || auth.currentUser.email,
            date: new Date()
        }, { merge: true });
    }
}

function gameLoop() {
    if (lives.value <= 0) {
        saveScore();
        alert("GAME OVER");
        return;
    }

    updatePlayer(score);
    updateGhosts(lives, score);

    // Comer item Berserker
    if (map[Math.round(pacman.y)][Math.round(pacman.x)] === 3) {
        map[Math.round(pacman.y)][Math.round(pacman.x)] = 0;
        activatePower();
    }

    // Dibujar
    ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width,canvas.height);
    const ox = (canvas.width - 20 * TILE_SIZE) / 2;
    const oy = (canvas.height - 11 * TILE_SIZE) / 2;

    map.forEach((row, y) => row.forEach((tile, x) => {
        if (tile === 1) {
            ctx.strokeStyle = "blue"; ctx.lineWidth = 2;
            ctx.strokeRect(ox + x*TILE_SIZE + 4, oy + y*TILE_SIZE + 4, TILE_SIZE-8, TILE_SIZE-8);
        } else if (tile === 2) {
            ctx.fillStyle = "#ffb8ae"; ctx.beginPath();
            ctx.arc(ox + x*TILE_SIZE + TILE_SIZE/2, oy + y*TILE_SIZE + TILE_SIZE/2, 2, 0, 7); ctx.fill();
        } else if (tile === 3) {
            ctx.fillStyle = "white"; ctx.beginPath();
            ctx.arc(ox + x*TILE_SIZE + TILE_SIZE/2, oy + y*TILE_SIZE + TILE_SIZE/2, 6, 0, 7); ctx.fill();
        }
    }));

    drawGhosts(ctx, ox, oy);
    drawPlayer(ctx, TILE_SIZE, ox, oy);
    
    ctx.fillStyle = "white"; ctx.font = "20px Arial";
    ctx.fillText(`PUNTOS: ${score.value}`, 20, 30);

    requestAnimationFrame(gameLoop);
}

generateLevel();
spawnGhosts();
gameLoop();