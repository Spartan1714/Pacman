import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;
let spawnTimer = 120; // Escudo de 2 segundos (60 fps * 2)

const COLORS = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

export function spawnGhosts(level = 1) {
    // ALEATORIEDAD: 2 a 4 fantasmas
    const cantidad = Math.floor(Math.random() * 3) + 2; 
    const vBase = 0.05 + (level * 0.01);
    ghosts = [];
    spawnTimer = 120; // Reiniciar escudo al spawnear

    // Posiciones en las esquinas extremas del mapa
    const esquinas = [
        {x: 1, y: 1}, {x: 18, y: 1}, 
        {x: 1, y: 17}, {x: 18, y: 17}
    ];

    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: esquinas[i].x,
            y: esquinas[i].y,
            dirX: 0,
            dirY: 0,
            color: COLORS[i],
            speed: vBase,
            dead: false,
            tipo: i === 0 ? "pro" : "random"
        });
        actualizarRuta(ghosts[i]);
    }
}

export function updateGhosts(lives, score, dt) {
    if (ghosts.length === 0) return;

    // Manejo de Power Mode
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    // Manejo del Escudo Inicial (No pueden matarte mientras spawnTimer > 0)
    if (spawnTimer > 0) spawnTimer--;

    ghosts.forEach(g => {
        if (g.dead) return;

        let v = powerMode ? g.speed * 0.5 : g.speed;
        
        // Movimiento físico
        g.x += g.dirX * v;
        g.y += g.dirY * v;

        // --- SISTEMA DE ALINEACIÓN ---
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);

        if (Math.abs(g.x - gx) < v && Math.abs(g.y - gy) < v) {
            g.x = gx;
            g.y = gy;
            
            // Decidir giro si hay muro o cruce
            let muro = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            if (muro || esCruce(gx, gy)) {
                actualizarRuta(g);
            }
        }

        // --- DETECCIÓN DE COLISIÓN ---
        let dist = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        
        if (dist < 0.8) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else if (spawnTimer <= 0) { // SOLO MATA SI EL ESCUDO TERMINÓ
                if (lives && lives.value > 0) {
                    lives.value--;
                    resetPlayer();
                    spawnGhosts(); // Los manda lejos otra vez
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

    let opts = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(d => {
        let esMuro = map[y + d.dy]?.[x + d.dx] === 1;
        let esAtras = (d.dx === -g.dirX && d.dy === -g.dirY);
        return !esMuro && !esAtras;
    });

    if (opts.length === 0) {
        g.dirX *= -1; g.dirY *= -1;
    } else {
        if (g.tipo === "pro" && !powerMode) {
            opts.sort((a,b) => 
                Math.hypot((x+a.dx)-pacman.x, (y+a.dy)-pacman.y) - 
                Math.hypot((x+b.dx)-pacman.x, (y+b.dy)-pacman.y)
            );
            g.dirX = opts[0].dx; g.dirY = opts[0].dy;
        } else {
            let s = opts[Math.floor(Math.random() * opts.length)];
            g.dirX = s.dx; g.dirY = s.dy;
        }
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let dx = ox + g.x * TILE_SIZE;
        let dy = oy + g.y * TILE_SIZE;
        
        ctx.save();
        // Si hay escudo, los fantasmas parpadean para avisar que no matan
        ctx.globalAlpha = (spawnTimer > 0 && Math.floor(Date.now()/100) % 2) ? 0.3 : 1;
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        
        ctx.beginPath();
        ctx.arc(dx + TILE_SIZE/2, dy + TILE_SIZE/2, TILE_SIZE/2.2, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    });
}