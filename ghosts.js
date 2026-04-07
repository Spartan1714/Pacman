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

// 1. SPAWN ALEATORIO Y SEGURO (2 a 4 fantasmas)
export function spawnGhosts(level = 1) {
    const cantidad = Math.floor(Math.random() * 3) + 2; 
    // Velocidad reducida un poco para que sea controlable al inicio
    const vBase = 0.04 + (level * 0.01); 
    ghosts = [];

    // PUNTOS DE SPAWN: Lejos del centro (Pac-Man suele estar en 9, 15)
    // Esquinas del mapa según tu map.js
    const puntosSeguros = [
        {x: 1, y: 1},   // Arriba Izquierda
        {x: 18, y: 1},  // Arriba Derecha
        {x: 1, y: 17},  // Abajo Izquierda
        {x: 18, y: 17}  // Abajo Derecha
    ];

    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: puntosSeguros[i].x,
            y: puntosSeguros[i].y,
            dirX: 0,
            dirY: 0,
            color: COLORS[i],
            speed: vBase,
            dead: false,
            // El primero es Berserker, los otros aleatorios
            inteligencia: i === 0 ? "pro" : "random"
        });
        // Forzar una dirección inicial para que no se queden quietos
        actualizarRuta(ghosts[i]);
    }
}

// 2. MOTOR DE MOVIMIENTO FLUIDO
export function updateGhosts(lives, score, dt) {
    if (ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let v = powerMode ? g.speed * 0.5 : g.speed;
        
        // Movimiento continuo
        g.x += g.dirX * v;
        g.y += g.dirY * v;

        // --- SISTEMA DE REJILLA ---
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);

        // Si el fantasma llega al centro de una baldosa
        if (Math.abs(g.x - gx) < v && Math.abs(g.y - gy) < v) {
            g.x = gx;
            g.y = gy;

            // ¿Hay muro enfrente o es un cruce?
            let muro = map[Math.round(g.y + g.dirY)]?.[Math.round(g.x + g.dirX)] === 1;
            
            if (muro || esCruce(gx, gy)) {
                actualizarRuta(g);
            }
        }

        // --- COLISIÓN CRÍTICA (Evita el GameOver instantáneo) ---
        // Solo chequeamos colisión si Pac-Man tiene vidas y el fantasma no está muerto
        let distancia = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        
        if (distancia < 0.8) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else {
                // Solo restamos vida si lives.value es mayor a 0
                if (lives.value > 0) {
                    lives.value--;
                    resetPlayer(); 
                    // Resetear fantasmas a sus esquinas para dar respiro al jugador
                    spawnGhosts(); 
                }
            }
        }
    });
}

function esCruce(x, y) {
    let pasillos = 0;
    if (map[y]?.[x+1] !== 1) pasillos++;
    if (map[y]?.[x-1] !== 1) pasillos++;
    if (map[y+1]?.[x] !== 1) pasillos++;
    if (map[y-1]?.[x] !== 1) pasillos++;
    return pasillos > 2;
}

function actualizarRuta(g) {
    let x = Math.round(g.x);
    let y = Math.round(g.y);

    let opciones = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(d => {
        let muro = map[y + d.dy]?.[x + d.dx] === 1;
        let opuesta = (d.dx === -g.dirX && d.dy === -g.dirY);
        return !muro && !opuesta;
    });

    if (opciones.length === 0) {
        g.dirX *= -1; g.dirY *= -1;
    } else {
        if (g.inteligencia === "pro" && !powerMode) {
            // Persecución inteligente
            opciones.sort((a, b) => 
                Math.hypot((x+a.dx)-pacman.x, (y+a.dy)-pacman.y) - 
                Math.hypot((x+b.dx)-pacman.x, (y+b.dy)-pacman.y)
            );
            g.dirX = opciones[0].dx;
            g.dirY = opciones[0].dy;
        } else {
            // Movimiento random
            let sel = opciones[Math.floor(Math.random() * opciones.length)];
            g.dirX = sel.dx;
            g.dirY = sel.dy;
        }
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let dx = ox + g.x * TILE_SIZE;
        let dy = oy + g.y * TILE_SIZE;
        
        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.beginPath();
        ctx.arc(dx + TILE_SIZE/2, dy + TILE_SIZE/2, TILE_SIZE/2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}