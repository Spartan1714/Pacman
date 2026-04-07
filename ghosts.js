import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;
let spawnTimer = 90;

const COLORS = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

export function spawnGhosts(level = 1) {
    const cantidad = 3;
    const speed = 2.5; // tiles por segundo (constante real)

    ghosts = [];
    spawnTimer = 60;

    const esquinas = [
        {x: 1, y: 1},
        {x: 18, y: 1},
        {x: 1, y: 8},
        {x: 18, y: 8}
    ];

    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            gridX: esquinas[i].x,
            gridY: esquinas[i].y,

            x: esquinas[i].x,
            y: esquinas[i].y,

            dirX: 0,
            dirY: 0,

            progress: 0, // progreso entre tiles (0 → 1)

            speed: speed,
            color: COLORS[i % COLORS.length],
            dead: false
        });

        elegirDireccion(ghosts[i]);
    }
}

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    if (spawnTimer > 0) spawnTimer--;

    ghosts.forEach(g => {
        if (g.dead) return;

        let speed = powerMode ? g.speed * 0.6 : g.speed;

        // avanzar progreso
        g.progress += speed * dt;

        // cuando llega al siguiente tile
        if (g.progress >= 1) {
            g.progress = 0;

            g.gridX += g.dirX;
            g.gridY += g.dirY;

            elegirDireccion(g);
        }

        // interpolación visual (fluidez real)
        g.x = g.gridX + g.dirX * g.progress;
        g.y = g.gridY + g.dirY * g.progress;

        // colisión real (grid)
        if (
            g.gridX === Math.round(pacman.x) &&
            g.gridY === Math.round(pacman.y)
        ) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else if (spawnTimer <= 0) {
                lives.value--;
                resetPlayer();
                spawnGhosts();
            }
        }
    });
}

function elegirDireccion(g) {
    let opciones = [
        {dx: 1, dy: 0},
        {dx: -1, dy: 0},
        {dx: 0, dy: 1},
        {dx: 0, dy: -1}
    ].filter(o => {
        let muro = map[g.gridY + o.dy]?.[g.gridX + o.dx] === 1;
        let atras = (o.dx === -g.dirX && o.dy === -g.dirY);
        return !muro && !atras;
    });

    if (opciones.length === 0) {
        g.dirX *= -1;
        g.dirY *= -1;
        return;
    }

    // IA simple pero estable
    opciones.sort((a,b) =>
        Math.hypot(g.gridX+a.dx - pacman.x, g.gridY+a.dy - pacman.y) -
        Math.hypot(g.gridX+b.dx - pacman.x, g.gridY+b.dy - pacman.y)
    );

    g.dirX = opciones[0].dx;
    g.dirY = opciones[0].dy;
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;

        let x = ox + g.x * TILE_SIZE;
        let y = oy + g.y * TILE_SIZE;
        let s = TILE_SIZE;

        ctx.save();

        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        // Cabeza
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);

        // Base tipo fantasma
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.6, y + s*0.75);
        ctx.lineTo(x + s*0.4, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.75);
        ctx.closePath();

        ctx.fill();

        // Ojos
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    });
}