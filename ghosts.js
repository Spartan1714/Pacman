import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;
let spawnTimer = 90; // 1.5 segundos de gracia

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
    // VELOCIDAD AJUSTADA: 2 unidades de rejilla por segundo (más lento y fluido)
    const vBase = 1.8 + (level * 0.2); 
    ghosts = [];
    spawnTimer = 90;

    const esquinas = [{x: 1, y: 1}, {x: 18, y: 1}, {x: 1, y: 17}, {x: 18, y: 17}];

    for (let i = 0; i < cantidad; i++) {
        ghosts.push({
            x: esquinas[i].x,
            y: esquinas[i].y,
            dirX: 0,
            dirY: 0,
            color: COLORS[i % COLORS.length],
            speed: vBase,
            dead: false,
            // Cada fantasma tiene una "personalidad" distinta para evitar patrones iguales
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

        let v = powerMode ? g.speed * 0.5 : g.speed;
        
        // 1. MOVIMIENTO BASADO EN TIEMPO (FLUIDEZ TOTAL)
        g.x += g.dirX * v * dt;
        g.y += g.dirY * v * dt;

        // 2. SNAP Y DECISIÓN (SISTEMA DE RIEL)
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);

        // Si el fantasma se acerca al centro de una baldosa
        if (Math.abs(g.x - gx) < 0.1 && Math.abs(g.y - gy) < 0.1) {
            // Verificamos si el camino actual está bloqueado o si hay un cruce
            let muroEnFrente = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            if (muroEnFrente || esCruce(gx, gy)) {
                g.x = gx; // Snap al centro
                g.y = gy;
                decidirDireccion(g);
            }
        }

        // 3. COLISIÓN (AJUSTADA)
        let dist = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        if (dist < 0.7) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else if (spawnTimer <= 0) {
                if (lives && lives.value > 0) {
                    lives.value--;
                    resetPlayer();
                    spawnGhosts(); 
                }
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
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(o => {
        let esMuro = map[gy + o.dy]?.[gx + o.dx] === 1;
        let esAtras = (o.dx === -g.dirX && o.dy === -g.dirY);
        return !esMuro && !esAtras;
    });

    if (opciones.length === 0) {
        g.dirX *= -1; g.dirY *= -1;
    } else {
        // IA DIFERENCIADA PARA ROMPER EL PATRÓN
        if (g.personalidad === "pro" && !powerMode) {
            // Persigue a Pac-Man
            opciones.sort((a,b) => Math.hypot(gx+a.dx-pacman.x, gy+a.dy-pacman.y) - Math.hypot(gx+b.dx-pacman.x, gy+b.dy-pacman.y));
        } else if (g.personalidad === "ambicioso" && !powerMode) {
            // Intenta rodear a Pac-Man (apunta un poco más adelante)
            opciones.sort((a,b) => Math.hypot(gx+a.dx-(pacman.x+2), gy+a.dy-(pacman.y+2)) - Math.hypot(gx+b.dx-(pacman.x+2), gy+b.dy-(pacman.y+2)));
        } else {
            // Random total (Pinky style)
            for (let i = opciones.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
            }
        }
        g.dirX = opciones[0].dx;
        g.dirY = opciones[0].dy;
    }
}

// --- DISEÑO ORIGINAL (NEÓN Y FORMA) ---
export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;

        ctx.save();
        ctx.globalAlpha = (spawnTimer > 0 && Math.floor(Date.now()/100) % 2) ? 0.3 : 1;
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        // Cabeza y cuerpo
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();

        // Ojos blancos
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    });
}