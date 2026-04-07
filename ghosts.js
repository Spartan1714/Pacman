import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function spawnGhosts(level = 1) {
    const speed = 2.0 + (level * 0.2);
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "red", dead: false, speed: speed },
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "pink", dead: false, speed: speed },
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "cyan", dead: false, speed: speed }
    ];
}

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;

        // 1. ALINEACIÓN (Como rieles de tren)
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        // 2. MOVER
        let nextX = g.x + g.dirX * actualSpeed * dt;
        let nextY = g.y + g.dirY * actualSpeed * dt;

        // 3. CHEQUEAR MURO (Simple: ¿la baldosa a la que voy es 1?)
        // Miramos un poquito hacia adelante (0.4) para no entrar en el muro
        let checkX = Math.round(nextX + g.dirX * 0.4);
        let checkY = Math.round(nextY + g.dirY * 0.4);

        if (map[checkY]?.[checkX] !== 1) {
            // Si está libre, avanzamos
            g.x = nextX;
            g.y = nextY;
        } else {
            // Si hay muro, nos pegamos al centro y buscamos dirección
            g.x = Math.round(g.x);
            g.y = Math.round(g.y);

            let opciones = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(o => map[g.y + o.dy]?.[g.x + o.dx] !== 1);

            if (opciones.length > 0) {
                let nueva = opciones[Math.floor(Math.random() * opciones.length)];
                g.dirX = nueva.dx;
                g.dirY = nueva.dy;
            }
        }

        // 4. COLISIÓN CON PACMAN
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.6) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else {
                lives.value--;
                resetPlayer();
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE;
        let y = oy + g.y * TILE_SIZE;
        ctx.fillStyle = powerMode ? "blue" : g.color;
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
    });
}