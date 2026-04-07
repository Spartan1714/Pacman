import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

const COLORS = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

// 1. Generación Aleatoria (2 a 4)
export function spawnGhosts(level = 1) {
    const cantidad = Math.floor(Math.random() * 3) + 2; 
    const velocidadBase = 0.05 + (level * 0.01); // Velocidad por celda
    ghosts = [];

    // Esquinas seguras del mapa
    const puntos = [{x:1, y:1}, {x:18, y:1}, {x:1, y:17}, {x:18, y:17}];

    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: puntos[i].x,
            y: puntos[i].y,
            dirX: 0,
            dirY: 0,
            color: COLORS[i],
            speed: velocidadBase,
            dead: false,
            tipo: i === 0 ? "perseguidor" : "al azar"
        });
        // Forzamos una dirección inicial válida
        decidirNuevaDireccion(ghosts[i]);
    }
}

// 2. El Motor de Movimiento (Lógica de Pixeles vs Celdas)
export function updateGhosts(lives, score, dt) {
    if (ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        // Mover el fantasma según su dirección
        let v = powerMode ? g.speed * 0.6 : g.speed;
        
        g.x += g.dirX * v;
        g.y += g.dirY * v;

        // --- EL TRUCO DEL IMÁN ---
        // Si el fantasma está muy cerca del centro de una celda (ej: 5.02 o 4.98)
        // lo "ajustamos" al centro exacto (5.0) y decidimos nueva dirección.
        let centerX = Math.round(g.x);
        let centerY = Math.round(g.y);

        if (Math.abs(g.x - centerX) < v && Math.abs(g.y - centerY) < v) {
            g.x = centerX;
            g.y = centerY;

            // ¿Hay un muro adelante o estamos en un cruce?
            let muroEnFrente = map[Math.round(g.y + g.dirY)]?.[Math.round(g.x + g.dirX)] === 1;
            
            if (muroEnFrente || esInterseccion(g.x, g.y)) {
                decidirNuevaDireccion(g);
            }
        }

        // Colisión con Pacman
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.8) {
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

function esInterseccion(x, y) {
    let opciones = 0;
    if (map[Math.round(y)]?.[Math.round(x + 1)] !== 1) opciones++;
    if (map[Math.round(y)]?.[Math.round(x - 1)] !== 1) opciones++;
    if (map[Math.round(y + 1)]?.[Math.round(x)] !== 1) opciones++;
    if (map[Math.round(y - 1)]?.[Math.round(x)] !== 1) opciones++;
    return opciones > 2;
}

function decidirNuevaDireccion(g) {
    let x = Math.round(g.x);
    let y = Math.round(g.y);

    let posibles = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(dir => {
        // No puede ser muro ni la dirección opuesta (para que no vibre)
        let esMuro = map[y + dir.dy]?.[x + dir.dx] === 1;
        let esOpuesta = (dir.dx === -g.dirX && dir.dy === -g.dirY);
        return !esMuro && !esOpuesta;
    });

    if (posibles.length === 0) {
        // Callejón sin salida
        g.dirX *= -1; g.dirY *= -1;
    } else {
        if (g.tipo === "perseguidor" && !powerMode) {
            // IA: Elige la dirección que lo acerca más a Pacman
            posibles.sort((a, b) => 
                Math.hypot((x + a.dx) - pacman.x, (y + a.dy) - pacman.y) - 
                Math.hypot((x + b.dx) - pacman.x, (y + b.dy) - pacman.y)
            );
            g.dirX = posibles[0].dx;
            g.dirY = posibles[0].dy;
        } else {
            // IA: Al azar
            let choice = posibles[Math.floor(Math.random() * posibles.length)];
            g.dirX = choice.dx;
            g.dirY = choice.dy;
        }
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let drawX = ox + g.x * TILE_SIZE;
        let drawY = oy + g.y * TILE_SIZE;
        
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.beginPath();
        ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, TILE_SIZE/2.2, 0, Math.PI * 2);
        ctx.fill();
    });
}