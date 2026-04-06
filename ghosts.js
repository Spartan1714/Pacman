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
    // IMPORTANTE: Empezar en el centro exacto de la baldosa
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "red", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "pink", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "cyan", mode: "random", dead: false, speed: speed }
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

        // 1. EFECTO RIEL (IGUAL QUE EL PLAYER)
        // Si se mueve horizontal, forzamos Y a ser entero. Si se mueve vertical, forzamos X.
        if (Math.abs(g.dirX) > 0) g.y = Math.round(g.y);
        if (Math.abs(g.dirY) > 0) g.x = Math.round(g.x);

        // 2. PREDECIR MOVIMIENTO
        let nextX = g.x + g.dirX * actualSpeed * dt;
        let nextY = g.y + g.dirY * actualSpeed * dt;

        // 3. DETECTAR INTERSECCIÓN O MURO
        // ¿Estamos pasando por el centro de una baldosa?
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);
        
        // Distancia al centro
        let distToCenter = Math.hypot(g.x - gx, g.y - gy);

        // Si estamos muy cerca del centro, evaluamos si podemos girar o si hay muro
        if (distToCenter < 0.1) {
            // Revisar si el camino de enfrente está bloqueado
            let wallAhead = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            // Si hay muro ENFRENTE o si es una INTERSECCIÓN, buscamos nueva ruta
            if (wallAhead || esInterseccion(gx, gy)) {
                g.x = gx; // Snap al centro para que el giro sea perfecto
                g.y = gy;
                decidirRuta(g, gx, gy);
            }
        }

        // Aplicar movimiento final
        g.x += g.dirX * actualSpeed * dt;
        g.y += g.dirY * actualSpeed * dt;

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

// Función para saber si estamos en un cruce (más de 2 caminos disponibles)
function esInterseccion(x, y) {
    let paths = 0;
    if (map[y][x+1] !== 1) paths++;
    if (map[y][x-1] !== 1) paths++;
    if (map[y+1][x] !== 1) paths++;
    if (map[y-1][x] !== 1) paths++;
    return paths > 2;
}

function decidirRuta(g, x, y) {
    let options = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(opt => {
        // No puede ser muro
        if (map[y + opt.dy]?.[x + opt.dx] === 1) return false;
        // No puede ser la dirección opuesta (para que no vibren)
        if (opt.dx === -g.dirX && opt.dy === -g.dirY) return false;
        return true;
    });

    if (options.length === 0) {
        // Si es callejón sin salida, media vuelta
        g.dirX *= -1;
        g.dirY *= -1;
        return;
    }

    let choice;
    if (g.mode === "berserker" && !powerMode) {
        // LÓGICA BERSERKER: Elegir la opción que reduzca la distancia a Pac-Man
        options.sort((a, b) => {
            let distA = Math.hypot((x + a.dx) - pacman.x, (y + a.dy) - pacman.y);
            let distB = Math.hypot((x + b.dx) - pacman.x, (y + b.dy) - pacman.y);
            return distA - distB;
        });
        choice = options[0];
    } else {
        // RANDOM: Para los demás fantasmas
        choice = options[Math.floor(Math.random() * options.length)];
    }

    g.dirX = choice.dx;
    g.dirY = choice.dy;
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let drawX = ox + g.x * TILE_SIZE;
        let drawY = oy + g.y * TILE_SIZE;
        let s = TILE_SIZE;

        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.beginPath();
        ctx.arc(drawX + s/2, drawY + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(drawX + s*0.8, drawY + s*0.9);
        ctx.lineTo(drawX + s*0.2, drawY + s*0.9);
        ctx.fill();
        ctx.restore();
    });
}