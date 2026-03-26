import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

// Ahora acepta el nivel para decidir cuántos fantasmas salen
export function spawnGhostsForLevel(level = 1) {
    // LIMPIEZA TOTAL: Fundamental para evitar que se acumulen
    ghosts.length = 0; 
    
    // Colores clásicos: Rojo, Rosa, Cian, Naranja, Magenta, Verde
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852", "#FF00FF", "#00FF00"];
    
    // Cantidad dinámica: Nivel 1 = 3 fantasmas, Nivel 2 = 4, etc. Máximo 6.
    const numGhosts = Math.min(2 + level, colors.length);

    // Spawn en el centro (asegúrate que sea un pasillo, ej: 9,9)
    for (let i = 0; i < numGhosts; i++) {
        ghosts.push({
            x: 9 + (i % 2), y: 9, // Posición lógica
            vX: 9 + (i % 2), vY: 9, // Posición visual
            color: colors[i],
            speed: 0.08 + (level * 0.005), // Aumentan velocidad por nivel
            dirX: 0, dirY: 0,
            wobble: Math.random() * Math.PI // Para animar las patas
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        g.wobble += 0.2; // Velocidad de animación de patas

        // LÓGICA DE MOVIMIENTO ROBUSTA (Corregida para que NO se traben)
        // Usamos Math.round para asegurar que detectamos la celda correcta sin decimales rebeldes
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; // Snap visual
            g.vY = g.y;

            // IA: Buscar direcciones posibles
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
                // Inteligencia básica: No dar la vuelta 180° si hay más opciones
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

        // DESLIZAMIENTO VISUAL (Interpolación suave)
        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // COLISIÓN JUSTA (Muerte por proximidad visual)
        // Usamos la posición VISUAL (vX) y un radio muy pequeño (0.5)
        let distance = Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY);
        
        if (distance < 0.5) { 
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
        
        // --- DIBUJO PROFESIONAL DEL CUERPO (Forma de Campana) ---
        ctx.beginPath();
        // Cabeza redonda (Arco superior)
        ctx.arc(gx + r, gy + r, r * 0.9, Math.PI, 0); 
        
        // Cuerpo inferior con "picos" animados
        ctx.lineTo(gx + (tileSize * 0.9), gy + tileSize);
        
        // Patas (onduladas)
        let feet = 3;
        let feetWidth = (tileSize * 0.8) / feet;
        for (let i = 0; i < feet; i++) {
            let x = gx + (tileSize * 0.9) - (i * feetWidth);
            let y = gy + tileSize + (Math.sin(g.wobble + i) * 3); // Ondulación
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(gx + (tileSize * 0.1), gy + r);
        ctx.fill();

        // --- DIBUJO DE OJOS DINÁMICOS (Miran a donde caminan) ---
        ctx.fillStyle = "white";
        // Desplazamiento de los ojos según la dirección
        let lookX = g.dirX * 3;
        let lookY = g.dirY * 3;
        
        // Globos oculares
        ctx.beginPath(); 
        ctx.arc(gx + r - 5 + lookX, gy + r - 2 + lookY, 4, 0, 7); 
        ctx.arc(gx + r + 5 + lookX, gy + r - 2 + lookY, 4, 0, 7); 
        ctx.fill();
        
        // Pupilas (azules)
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(gx + r - 5 + lookX * 1.5, gy + r - 2 + lookY * 1.5, 2, 0, 7);
        ctx.arc(gx + r + 5 + lookX * 1.5, gy + r - 2 + lookY * 1.5, 2, 0, 7);
        ctx.fill();
    }
}