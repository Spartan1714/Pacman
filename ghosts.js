import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0; // Limpieza total
    
    // Colores exactos de la imagen: Rojo, Rosa, Cian, Naranja, Magenta, Verde
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852", "#FF00FF", "#00FF00"];
    
    // Cantidad dinámica: Nivel 1 = 3 fantasmas, Nivel 2 = 4, etc. Máximo 6.
    const numGhosts = Math.min(2 + level, colors.length);

    for (let i = 0; i < numGhosts; i++) {
        // Spawn en 9, 7 (asegúrate que sea un pasillo, ej: 9,7)
        ghosts.push({
            x: 9, y: 7,      // Posición lógica
            vX: 9, vY: 7,    // Posición visual (suave)
            color: colors[i],
            speed: 0.1,      // Velocidad de movimiento
            dirX: 0, dirY: 0
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        
        // LÓGICA DE MOVIMIENTO INFALIBLE (Pre-detección)
        // Decidimos dirección solo si estamos EXACTAMENTE en el centro de la celda
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; // Snap visual al centro
            g.vY = g.y;

            // IA Básica: Buscar direcciones posibles
            let possibleDirs = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(d => {
                // REDONDEO CRÍTICO: Asegura que leemos la celda correcta del mapa
                let ny = Math.round(g.y + d.dy);
                let nx = Math.round(g.x + d.dx);
                return map[ny] && map[ny][nx] !== 1; // Si no es pared, es válida
            });

            if (possibleDirs.length > 0) {
                // No dar la vuelta 180° si hay más opciones (naturalidad)
                if (possibleDirs.length > 1) {
                    possibleDirs = possibleDirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
                }
                
                // Elegir dirección al azar entre las válidas
                let move = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                
                if (move) {
                    g.dirX = move.dx;
                    g.dirY = move.dy;
                    g.x += g.dirX;
                    g.y += g.dy;
                }
            }
        }

        // DESLIZAMIENTO VISUAL (Suavizado suave)
        if (g.vX < g.x) g.vX = Math.min(g.vX + g.speed, g.x);
        if (g.vX > g.x) g.vX = Math.max(g.vX - g.speed, g.x);
        if (g.vY < g.y) g.vY = Math.min(g.vY + g.speed, g.y);
        if (g.vY > g.y) g.vY = Math.max(g.vY - g.speed, g.y);

        // COLISIÓN JUSTA (Muerte por proximidad visual)
        if (lives.value > 0 && Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) { 
            lives.value--;
            resetPlayer();
            // Resetear fantasmas al morir
            spawnGhostsForLevel(level); 
            return; // Salimos de la función inmediatamente
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let gx = offsetX + g.vX * tileSize;
        let gy = offsetY + g.vY * tileSize;
        let r = tileSize / 2;

        ctx.fillStyle = g.color;
        
        // --- DIBUJO ICÓNICO Y LIMPIO (Forma de Campana con 3 Puntas) ---
        ctx.beginPath();
        
        // Cabeza redonda (Arco superior)
        // Dibujamos un arco perfecto de 180°
        ctx.arc(gx + r, gy + r, r * 0.9, Math.PI, 0); 
        
        // Costado derecho (Línea recta)
        // Bajamos recto desde la cabeza
        ctx.lineTo(gx + (tileSize * 0.9), gy + tileSize); 
        
        // --- BASE GEOMÉTRICA (LAS 3 PUNTAS LIMPIAS) ---
        // Construimos las puntas rectas usando lineTo, exactas a la imagen
        // Punto 1 (derecha)
        ctx.lineTo(gx + (tileSize * 0.70), gy + tileSize - 6);
        ctx.lineTo(gx + (tileSize * 0.55), gy + tileSize);
        
        // Punto 2 (centro)
        ctx.lineTo(gx + (tileSize * 0.40), gy + tileSize - 6);
        ctx.lineTo(gx + (tileSize * 0.25), gy + tileSize);
        
        // Punto 3 (izquierda)
        ctx.lineTo(gx + (tileSize * 0.15), gy + tileSize - 6);
        
        // Costado izquierdo (Línea recta)
        // Subimos recto hasta la cabeza
        ctx.lineTo(gx + (tileSize * 0.15), gy + r); 
        
        ctx.fill();

        // --- OJOS (PUPILAS FIJAS ARRIBA) ---
        ctx.fillStyle = "white";
        
        // Globos oculares elípticos fijos
        ctx.beginPath(); 
        // Globo izquierdo (desplazado un poco hacia arriba y a la izquierda)
        ctx.ellipse(gx + r - tileSize/7.5, gy + r - tileSize/10, tileSize/11, tileSize/8, 0, 0, Math.PI * 2); 
        // Globo derecho (desplazado un poco hacia arriba y a la derecha)
        ctx.ellipse(gx + r + tileSize/7.5, gy + r - tileSize/10, tileSize/11, tileSize/8, 0, 0, Math.PI * 2); 
        ctx.fill();
        
        // Pupilas (azules fijos arriba)
        ctx.fillStyle = "blue";
        let pupilR = tileSize/16;
        let lookUp = tileSize/10; // Desplazamiento hacia arriba
        
        // Pupila izquierda
        ctx.beginPath(); 
        ctx.arc(gx + r - tileSize/7.5, gy + r - tileSize/10 - lookUp/2.5, pupilR, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupila derecha
        ctx.beginPath();
        ctx.arc(gx + r + tileSize/7.5, gy + r - tileSize/10 - lookUp/2.5, pupilR, 0, Math.PI * 2);
        ctx.fill();
    }
}