import { map } from "./map.js";
import { pacman } from "./player.js";

// --- ESTADO GLOBAL DE FANTASMAS ---
export let ghosts = [];
const GHOST_COLORS = {
    "red": ["#ff4d4d", "#b30000"], // [Luz, Sombra]
    "pink": ["#ffb3d9", "#ff1a8c"],
    "cyan": ["#99ffff", "#00cccc"],
    "orange": ["#ffb366", "#e67300"],
    "vulnerable": ["#4d4dff", "#000099"] // Azul cuando están asustados
};

let isPaused = false;
let soundsLoaded = false;
const sounds = {};

// Carga asíncrona de sonidos (mejor para performance)
function loadSounds() {
    sounds.death = new Audio('assets/sounds/death.mp3');
    sounds.eatGhost = new Audio('assets/sounds/eat_ghost.mp3');
    soundsLoaded = true;
}

export function spawnGhostsForLevel() {
    if (!soundsLoaded) loadSounds();
    ghosts = [];

    // Definición base de fantasmas (Coordenadas lógicas)
    let baseGhosts = [
        { x: 13, y: 11, color: "red", type: "berserker" },
        { x: 14, y: 11, color: "pink", type: "random" },
        { x: 13, y: 13, color: "cyan", type: "random" },
        { x: 14, y: 13, color: "orange", type: "random" }
    ];

    // Decidir cuántos (mínimo 1 Berserker, máx 4 total)
    let count = 1 + Math.floor(Math.random() * 4); 
    
    for (let i = 0; i < count; i++) {
        let bg = baseGhosts[i];
        ghosts.push({
            // Coordenadas lógicas grilla
            gridX: bg.x, gridY: bg.y,
            targetX: bg.x, targetY: bg.y,
            // Coordenadas visuales interpoladas
            visualX: bg.x, visualY: bg.y,
            
            dirX: 0, dirY: 1,
            colorKey: bg.color,
            type: bg.type,
            speed: 0.15, // Un poco más lentos que Pacman
            animTime: 0 // Para animación de picos inferiores
        });
    }
}

// --- LÓGICA DE MOVIMIENTO FLUIDO FANTASMAS ---
export function updateGhosts(livesRef) {
    if (isPaused) return;

    for (let g of ghosts) {
        // Animación interna
        g.animTime += 0.1;

        // 1. Llegó al target lógico, decidir siguiente movimiento
        let distToTarget = Math.hypot(g.targetX - g.visualX, g.targetY - g.visualY);
        
        if (distToTarget < g.speed) {
            g.gridX = g.targetX; g.gridY = g.targetY;
            g.visualX = g.gridX; g.visualY = g.gridY;

            // Decidir IA
            let moves = getPossibleMoves(g);
            if (moves.length > 0) {
                let chosenMove;
                
                // Si es Berserker y Pacman no es super, perseguir
                if (g.type === "berserker" && !pacman.isSuper) {
                    chosenMove = getBestMoveToTarget(moves, pacman.gridX, pacman.gridY);
                } else if (pacman.isSuper) {
                    // Huir si pacman es super (elegir el movimiento que MAS aleje)
                    chosenMove = getBestMoveToTarget(moves, pacman.gridX, pacman.gridY, true);
                } else {
                    // Movimiento aleatorio pero sin dar la vuelta 180º si hay opciones
                    chosenMove = chooseRandomMove(moves, g);
                }
                
                g.dirX = chosenMove.dx; g.dirY = chosenMove.dy;
                g.targetX = g.gridX + g.dirX;
                g.targetY = g.gridY + g.dirY;
            }
        }

        // 2. Mover posición visual fluida
        g.visualX += g.dirX * g.speed;
        g.visualY += g.dirY * g.speed;

        // --- COLISIONES (ahora basadas en distancia visual corta) ---
        if (Math.hypot(g.visualX - pacman.visualX, g.visualY - pacman.visualY) < 0.6) {
            if (pacman.isSuper) {
                if(soundsLoaded) sounds.eatGhost.play();
                // Resetear fantasma a la casa
                g.gridX = 13; g.gridY = 11;
                g.targetX = 13; g.targetY = 11;
                g.visualX = 13; g.visualY = 11;
            } else {
                handleDeath(livesRef);
            }
        }
    }
}

// --- FUNCIONES AUXILIARES IA ---
function getPossibleMoves(g) {
    let dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
    return dirs.filter(d => {
        let nextX = g.gridX + d.dx;
        let nextY = g.gridY + d.dy;
        return map[nextY] && map[nextY][nextX] !== 1; // No es muro
    });
}

function getBestMoveToTarget(moves, tx, ty, flee = false) {
    moves.sort((a, b) => {
        let distA = Math.hypot((g.gridX + a.dx) - tx, (g.gridY + a.dy) - ty);
        let distB = Math.hypot((g.gridX + b.dx) - tx, (g.gridY + b.dy) - ty);
        return flee ? distB - distA : distA - distB; // flee=true invierte orden
    });
    return moves[0];
}

function chooseRandomMove(moves, g) {
    // Evitar dar la vuelta 180 si hay otras opciones
    if (moves.length > 1) {
        moves = moves.filter(m => m.dx !== -g.dirX || m.dy !== -g.dirY);
    }
    return moves[Math.floor(Math.random() * moves.length)];
}

function handleDeath(livesRef) {
    isPaused = true;
    if(soundsLoaded) sounds.death.play();
    livesRef.value--;
    // Congelar juego visualmente media segundo
    setTimeout(() => {
        import('./player.js').then(m => m.resetPlayer()); // Reset Pacman positions
        ghosts.forEach(gh => {
             gh.gridX = 13; gh.gridY = 11; gh.targetX = 13; gh.targetY = 11; gh.visualX = 13; gh.visualY = 11;
        });
        isPaused = false;
    }, 800);
}

// --- NUEVA ESTÉTICA DE FANTASMAS (Gradientes, Ojos Dinámicos, Picos) ---
export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let x = offsetX + g.visualX * tileSize + tileSize / 2;
        let y = offsetY + g.visualY * tileSize + tileSize / 2;
        let r = tileSize * 0.45;

        ctx.save();
        ctx.translate(x, y);

        // 1. Determinar Colores (Normal o Vulnerable)
        let colorSet = pacman.isSuper ? GHOST_COLORS["vulnerable"] : GHOST_COLORS[g.colorKey];
        
        // Parpadeo cuando va a terminar el powerup (últimos 3 seg)
        if (pacman.isSuper && Date.now() % 400 < 200) {
             // Opcional: añadir parpadeo blanco aquí
        }

        // 2. Dibujar Cuerpo con Gradiente Radial
        let gradient = ctx.createRadialGradient(0, -r/4, 0, 0, -r/4, r);
        gradient.addColorStop(0, colorSet[0]); // Color Luz
        gradient.addColorStop(1, colorSet[1]); // Color Sombra
        ctx.fillStyle = gradient;

        ctx.beginPath();
        // Cabeza semicircular
        ctx.arc(0, -r/4, r, Math.PI, 0); 
        // Laterales hacia abajo
        ctx.lineTo(r, r);
        
        // Picos inferiores animados (usando g.animTime y Math.sin)
        let numPikes = 3;
        let pikeW = (r * 2) / numPikes;
        let pikeH = r / 4;
        for (let i = 0; i < numPikes; i++) {
            let pikeAnim = Math.sin(g.animTime + (i * Math.PI / 2)) * 3;
            ctx.lineTo(r - (i * pikeW) - (pikeW/2), r + pikeH + pikeAnim);
            ctx.lineTo(r - ((i+1) * pikeW), r);
        }
        ctx.closePath();
        ctx.fill();

        // 3. Dibujar Ojos (Mirando en la dirección del movimiento)
        drawEyes(ctx, r, g.dirX, g.dirY, pacman.isSuper);

        ctx.restore();
    }
}

function drawEyes(ctx, r, dx, dy, isVulnerable) {
    ctx.fillStyle = "white";
    let eyeR = r / 3;
    let pupilR = r / 6;
    let eyeOffset = r / 2;

    if (isVulnerable) {
        // Ojos asustados (puntos pequeños tristes)
        ctx.fillStyle = "#ffb366"; // Color pupila asustada
        ctx.beginPath();
        ctx.arc(-eyeOffset/2, 0, pupilR, 0, Math.PI*2);
        ctx.arc(eyeOffset/2, 0, pupilR, 0, Math.PI*2);
        ctx.fill();
    } else {
        // Ojos Normales Blancos
        ctx.beginPath();
        ctx.arc(-eyeOffset, -r/4, eyeR, 0, Math.PI*2);
        ctx.arc(eyeOffset, -r/4, eyeR, 0, Math.PI*2);
        ctx.fill();

        // Pupilas Negras (desplazadas según dx, dy)
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(-eyeOffset + (dx*pupilR), -r/4 + (dy*pupilR), pupilR, 0, Math.PI*2);
        ctx.arc(eyeOffset + (dx*pupilR), -r/4 + (dy*pupilR), pupilR, 0, Math.PI*2);
        ctx.fill();
    }
}