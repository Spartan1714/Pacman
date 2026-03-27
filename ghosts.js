import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

// Cambiamos a let para que spawnGhosts pueda recrear la lista
export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;
let ghostSpeedMultiplier = 2.8; // Para aumentar dificultad

const COLORES = ["red", "pink", "cyan", "orange", "purple"];

// --- 1. FUNCIÓN PARA GENERAR FANTASMAS ALEATORIOS (1-5) ---
export function spawnGhosts() {
    const cantidad = Math.floor(Math.random() * 5) + 1;
    ghosts = [];
    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: 9, y: 4, // Salen del centro del laberinto
            color: COLORES[i],
            dirX: 0, dirY: 0, 
            lastDx: 0, lastDy: 0,
            dead: false,
            respawnTimer: 0
        });
    }
}

// --- 2. FUNCIÓN PARA EL POWER-UP (La que pedía game.js) ---
export function activarPowerMode() {
    powerMode = true;
    powerTimer = 400; // Duración del efecto
}

export function aumentarDificultad() {
    ghostSpeedMultiplier += 0.4; // Aumenta en cada nivel
}

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    // Manejo del temporizador del Power Mode
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        // Lógica de reaparición si fue comido
        if (g.dead) {
            g.respawnTimer--;
            if (g.respawnTimer <= 0) {
                g.dead = false;
                g.x = 9; g.y = 4; // Vuelve a casa
            }
            return;
        }

        let cx = Math.round(g.x);
        let cy = Math.round(g.y);
        
        // Si el fantasma es azul, va más lento
        let speed = powerMode ? ghostSpeedMultiplier * 0.6 : ghostSpeedMultiplier;

        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                return map[cy + m.dy]?.[cx + m.dx] !== 1;
            });

            let filteredMoves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            let finalChoices = filteredMoves.length > 0 ? filteredMoves : moves;

            let choice;
            if (powerMode) {
                // MODO MIEDO: Eligen la dirección que más los ALEJE de Pac-Man
                choice = finalChoices.sort((a,b) => 
                    Math.hypot((cx+b.dx)-pacman.x, (cy+b.dy)-pacman.y) - 
                    Math.hypot((cx+a.dx)-pacman.x, (cy+a.dy)-pacman.y)
                )[0];
            } else if (g.color === "red") {
                // Inteligencia Berserker (Persigue)
                choice = finalChoices.sort((a,b) => 
                    Math.hypot((cx+a.dx)-pacman.x, (cy+a.dy)-pacman.y) - 
                    Math.hypot((cx+b.dx)-pacman.x, (cy+b.dy)-pacman.y)
                )[0];
            } else {
                // Otros: Siguen recto el 80% o azar
                let sigueRecto = finalChoices.find(m => m.dx === g.lastDx && m.dy === g.lastDy);
                choice = (sigueRecto && Math.random() < 0.8) ? sigueRecto : finalChoices[Math.floor(Math.random() * finalChoices.length)];
            }

            if (choice) {
                g.dirX = choice.dx; g.dirY = choice.dy;
                g.lastDx = choice.dx; g.lastDy = choice.dy;
            }
        }

        g.x += g.dirX * speed * dt;
        g.y += g.dirY * speed * dt;

        // --- COLISIÓN ---
        let distancia = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        if (distancia < 0.7) {
            if (powerMode) {
                // ¡COMER FANTASMA!
                g.dead = true;
                g.respawnTimer = 240; // 4 segundos fuera
                score.value += 200;
            } else {
                // MORIR
                lives.value -= 1; 
                pacman.x = 1; pacman.y = 1;
                pacman.dirX = 0; pacman.dirY = 0;
                pacman.nextDX = 0; pacman.nextDY = 0;
                // Resetear posiciones de fantasmas vivos
                ghosts.forEach(ghost => { ghost.x = 9; ghost.y = 4; });
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return; // No dibujar si está comido

        let gx = ox + g.x * TILE_SIZE + TILE_SIZE / 2;
        let gy = oy + g.y * TILE_SIZE + TILE_SIZE / 2;
        let r = TILE_SIZE * 0.4; 

        ctx.save();
        // Si powerMode está activo, todos son azules
        ctx.fillStyle = powerMode ? "blue" : g.color;
        
        ctx.beginPath();
        ctx.arc(gx, gy, r, Math.PI, 0);
        
        let picos = 3;
        let anchoPico = (r * 2) / picos;
        let yBase = gy + r;
        
        ctx.lineTo(gx + r, yBase); 
        for (let i = 0; i < picos; i++) {
            ctx.lineTo(gx + r - (i * anchoPico) - anchoPico/2, yBase - r/3);
            ctx.lineTo(gx + r - (i * anchoPico) - anchoPico, yBase);
        }
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - r/2.5, gy - r/3, r/3, 0, Math.PI * 2);
        ctx.arc(gx + r/2.5, gy - r/3, r/3, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas (Si son azules, pupilas tristes/blancas)
        ctx.fillStyle = powerMode ? "white" : "blue";
        let ex = g.dirX * (r/6); 
        let ey = g.dirY * (r/6);
        ctx.beginPath();
        ctx.arc(gx - r/2.5 + ex, gy - r/3 + ey, r/6, 0, Math.PI * 2);
        ctx.arc(gx + r/2.5 + ex, gy - r/3 + ey, r/6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}