import { map, TILE_SIZE, initMap, spawnCherry } from "./map.js";
import { updatePlayer, drawPlayer, setDirection, resetPlayer } from "./player.js";
import { updateGhosts, drawGhosts, spawnGhosts, activatePower } from "./ghosts.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };
let lives = { value: 3 };
let level = 1;
let lastTime = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function newLevel() {
    level++;
    initMap();
    spawnGhosts();
    spawnCherry();
    resetPlayer();
}

initMap();
spawnGhosts();
spawnCherry();

function gameLoop(t) {
    let dt = (t - lastTime) / 1000;
    lastTime = t;

    updatePlayer(score, activatePower, dt);
    updateGhosts(lives, score, dt);

    // pasar nivel
    if (!map.some(row => row.includes(2))) {
        newLevel();
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let ox = (canvas.width - map[0].length * TILE_SIZE) / 2;
    let oy = (canvas.height - map.length * TILE_SIZE) / 2;

    map.forEach((row, y) => {
        row.forEach((t, x) => {
            if (t === 1) {
                ctx.strokeStyle = "cyan";
                ctx.strokeRect(ox + x * TILE_SIZE, oy + y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
            if (t === 2) {
                ctx.fillStyle = "white";
                ctx.fillRect(ox + x * TILE_SIZE + 12, oy + y * TILE_SIZE + 12, 5, 5);
            }
            if (t === 3) {
                ctx.fillStyle = "red";
                ctx.fillRect(ox + x * TILE_SIZE + 8, oy + y * TILE_SIZE + 8, 10, 10);
            }
        });
    });

    drawGhosts(ctx, ox, oy, TILE_SIZE);
    drawPlayer(ctx, TILE_SIZE, ox, oy);

    requestAnimationFrame(gameLoop);
}

document.onkeydown = (e) => {
    if (e.key === "ArrowUp") setDirection(0, -1);
    if (e.key === "ArrowDown") setDirection(0, 1);
    if (e.key === "ArrowLeft") setDirection(-1, 0);
    if (e.key === "ArrowRight") setDirection(1, 0);
};

requestAnimationFrame(gameLoop);