import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    if (ghosts.length === 0) return false;
    return ghosts.every(g => g.dead);
}

export function spawnGhosts(level = 1) {
    const speed = 2.2 + (level * 0.2);
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "#FF0000", mode: "berserker", dead: false, speed: speed }, // Blinky
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "#FFB8FF", mode: "random", dead: false, speed: speed },    // Pinky
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "#00FFFF", mode: "random", dead: false, speed: speed }   // Inky
    ];
}

export function updateGhosts(lives, score, dt) {
    if (!dt || ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;

        // 1. EFECTO RIEL: Alineación automática de ejes
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        // 2. LÓGICA DE INTERSECCIÓN (Decisión inteligente)
        // Si el fantasma está casi centrado en una baldosa, decide su próximo movimiento
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);
        let distToCenter = Math.hypot(g.x - gx, g.y - gy);

        if (distToCenter < 0.1) {
            // Revisar si el camino de enfrente es un muro
            let wallAhead = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            // Si hay muro o estamos en un cruce, buscamos nueva ruta
            if (wallAhead || esCruce(gx, gy)) {
                g.x = gx; 
                g.y = gy;
                cambiarDireccionIA(g);
            }
        }

        // 3. APLICAR MOVIMIENTO
        g.x += g.dirX * actualSpeed * dt;
        g.y += g.dirY * actualSpeed * dt;

        // 4. COLISIÓN CON PAC-MAN
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.7) {
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

function esCruce(x, y) {
    let pasillos = 0;
    if (map[y][x+1] !== 1) pasillos++;
    if (map[y][x-1] !== 1) pasillos++;
    if (map[y+1][x] !== 1) pasillos++;
    if (map[y-1][x] !== 1) pasillos++;
    return pasillos > 2;
}

function cambiarDireccionIA(g) {
    let opciones = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(opt => {
        if (map[Math.round(g.y + opt.dy)]?.[Math.round(g.x + opt.dx)] === 1) return false;
        if (opt.dx === -g.dirX && opt.dy === -g.dirY) return false; // No volver atrás
        return true;
    });

    if (opciones.length === 0) {
        g.dirX *= -1; g.dirY *= -1;
        return;
    }

    if (g.mode === "berserker" && !powerMode) {
        // IA Persecución: Elegir la opción más cercana a Pac-Man
        opciones.sort((a, b) => {
            let distA = Math.hypot((g.x + a.dx) - pacman.x, (g.y + a.dy) - pacman.y);
            let distB = Math.hypot((g.x + b.dx) - pacman.x, (g.y + b.dy) - pacman.y);
            return distA - distB;
        });
        g.dirX = opciones[0].dx;
        g.dirY = opciones[0].dy;
    } else {
        // IA Patrulla: Azar
        let choice = opciones[Math.floor(Math.random() * opciones.length)];
        g.dirX = choice.dx;
        g.dirY = choice.dy;
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;

        ctx.save();
        // ESTÉTICA RECUPERADA: Color neón y forma de fantasma
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        // Cuerpo
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    });
}