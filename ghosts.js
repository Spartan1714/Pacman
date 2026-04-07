import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

// Requeridos para que game.js no explote
export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

// 1. INICIALIZACIÓN LIMPIA
export function spawnGhosts(level = 1) {
    const speed = 2.0 + (level * 0.2);
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "#FF0000", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "#FFB8FF", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "#00FFFF", mode: "random", dead: false, speed: speed }
    ];
}

// 2. BUCLE PRINCIPAL
export function updateGhosts(lives, score, dt) {
    if (!dt || ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let v = powerMode ? g.speed * 0.5 : g.speed;

        // --- MOVIMIENTO CON SNAP-TO-GRID ---
        // Esto obliga al fantasma a estar EXACTAMENTE en el medio del pasillo
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        let nextX = g.x + g.dirX * v * dt;
        let nextY = g.y + g.dirY * v * dt;

        // 3. DETECCIÓN DE INTERSECCIÓN O MURO
        // Solo tomamos decisiones cuando el fantasma cruza el "centro" de una baldosa
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);
        
        if (Math.hypot(g.x - gx, g.y - gy) < 0.1) {
            // ¿El camino que sigo está bloqueado?
            let wallAhead = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            if (wallAhead || esCruce(gx, gy)) {
                g.x = gx; // Snap al centro antes de girar
                g.y = gy;
                cambiarDireccion(g);
            }
        }

        g.x += g.dirX * v * dt;
        g.y += g.dirY * v * dt;

        // 4. COLISIÓN CON PACMAN
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

// 5. LÓGICA DE NAVEGACIÓN (IA)
function esCruce(x, y) {
    let pasillos = 0;
    if (map[y]?.[x + 1] !== 1) pasillos++;
    if (map[y]?.[x - 1] !== 1) pasillos++;
    if (map[y + 1]?.[x] !== 1) pasillos++;
    if (map[y - 1]?.[x] !== 1) pasillos++;
    return pasillos > 2;
}

function cambiarDireccion(g) {
    let gx = Math.round(g.x);
    let gy = Math.round(g.y);

    let opciones = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ].filter(o => {
        // No puede ser un muro y NO puede ser la dirección contraria (para no vibrar)
        let esMuro = map[gy + o.dy]?.[gx + o.dx] === 1;
        let esOpuesta = (o.dx === -g.dirX && o.dy === -g.dirY);
        return !esMuro && !esOpuesta;
    });

    if (opciones.length === 0) {
        // Callejón sin salida: única vez que se permite dar la vuelta
        g.dirX *= -1; g.dirY *= -1;
    } else {
        if (g.mode === "berserker" && !powerMode) {
            // Persecución: elegir la opción que reduzca la distancia a Pac-Man
            opciones.sort((a, b) => 
                Math.hypot((gx + a.dx) - pacman.x, (gy + a.dy) - pacman.y) - 
                Math.hypot((gx + b.dx) - pacman.x, (gy + b.dy) - pacman.y)
            );
            g.dirX = opciones[0].dx;
            g.dirY = opciones[0].dy;
        } else {
            // Azar
            let sel = opciones[Math.floor(Math.random() * opciones.length)];
            g.dirX = sel.dx;
            g.dirY = sel.dy;
        }
    }
}

// 6. DIBUJO PROFESIONAL
export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;

        ctx.save();
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