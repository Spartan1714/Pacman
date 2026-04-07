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
    const cantidad = Math.floor(Math.random() * 3) + 2;
    const vBase = 1.8 + (level * 0.2); 

    ghosts = [];
    spawnTimer = 90;

    // 🔥 CORREGIDO (mapa de 10 filas)
    const esquinas = [
        {x: 1, y: 1},
        {x: 18, y: 1},
        {x: 1, y: 8},
        {x: 18, y: 8}
    ];

    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: esquinas[i].x,
            y: esquinas[i].y,
            dirX: 0,
            dirY: 0,
            color: COLORS[i % COLORS.length],
            speed: vBase,
            dead: false,
            personalidad: i === 0 ? "pro" : (i === 1 ? "random" : "ambicioso")
        });
        decidirDireccion(ghosts[i]);
    }
}

export function updateGhosts(lives, score, dt) {
    if (!dt || ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    if (spawnTimer > 0) spawnTimer--;

    ghosts.forEach(g => {
        if (g.dead) return;

        let speed = powerMode ? g.speed * 0.5 : g.speed;

        // 🔥 MOVIMIENTO CONTINUO REAL
        g.x += g.dirX * speed * dt;
        g.y += g.dirY * speed * dt;

        let gx = Math.round(g.x);
        let gy = Math.round(g.y);

        // 🔥 SNAP PRECISO (SIN VIBRACIÓN)
        if (Math.abs(g.x - gx) < 0.05 && Math.abs(g.y - gy) < 0.05) {

            g.x = gx;
            g.y = gy;

            let muro = map[gy + g.dirY]?.[gx + g.dirX] === 1;

            if (muro || esCruce(gx, gy)) {
                decidirDireccion(g);
            }
        }

        // 🔥 COLISIÓN CONSISTENTE (GRID)
        if (
            Math.round(g.x) === Math.round(pacman.x) &&
            Math.round(g.y) === Math.round(pacman.y)
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

function esCruce(x, y) {
    let p = 0;
    if (map[y]?.[x+1] !== 1) p++;
    if (map[y]?.[x-1] !== 1) p++;
    if (map[y+1]?.[x] !== 1) p++;
    if (map[y-1]?.[x] !== 1) p++;
    return p > 2;
}

function decidirDireccion(g) {
    let gx = Math.round(g.x);
    let gy = Math.round(g.y);

    let opciones = [
        {dx: 1, dy: 0},
        {dx: -1, dy: 0},
        {dx: 0, dy: 1},
        {dx: 0, dy: -1}
    ].filter(o => {
        let muro = map[gy + o.dy]?.[gx + o.dx] === 1;
        let atras = (o.dx === -g.dirX && o.dy === -g.dirY);
        return !muro && !atras;
    });

    if (opciones.length === 0) {
        g.dirX *= -1;
        g.dirY *= -1;
        return;
    }

    if (g.personalidad === "pro" && !powerMode) {
        opciones.sort((a,b) =>
            Math.hypot(gx+a.dx - pacman.x, gy+a.dy - pacman.y) -
            Math.hypot(gx+b.dx - pacman.x, gy+b.dy - pacman.y)
        );
    } else if (g.personalidad === "ambicioso" && !powerMode) {
        opciones.sort((a,b) =>
            Math.hypot(gx+a.dx - (pacman.x+1), gy+a.dy - (pacman.y+1)) -
            Math.hypot(gx+b.dx - (pacman.x+1), gy+b.dy - (pacman.y+1))
        );
    } else {
        opciones.sort(() => Math.random() - 0.5);
    }

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
        ctx.globalAlpha = (spawnTimer > 0 && Math.floor(Date.now()/100)%2) ? 0.3 : 1;
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    });
}