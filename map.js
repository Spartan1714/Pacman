export const TILE_SIZE = 20;
export let map = [];

export function generarMapaAleatorio(cols = 20, rows = 10) {
    // 1. Llenar todo de muros (1)
    map = Array.from({ length: rows }, () => Array(cols).fill(1));

    // 2. Función para excavar caminos
    function excavar(x, y) {
        map[y][x] = 2; // Poner camino con punto

        // Direcciones aleatorias (saltando de 2 en 2 para dejar muros entre pasillos)
        const dirs = [
            [0, 2], [0, -2], [2, 0], [-2, 0]
        ].sort(() => Math.random() - 0.5);

        for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (ny > 0 && ny < rows - 1 && nx > 0 && nx < cols - 1 && map[ny][nx] === 1) {
                map[y + dy / 2][x + dx / 2] = 2; // Excavar el muro intermedio
                excavar(nx, ny);
            }
        }
    }

    // 3. Empezar excavación desde la posición de Pac-Man (1,1)
    excavar(1, 1);

    // 4. Asegurar que el centro (donde salen fantasmas) esté abierto
    for(let i=3; i<=5; i++) {
        for(let j=8; j<=11; j++) {
            map[i][j] = 0; // Zona limpia sin puntos
        }
    }
    
    // 5. Poner bordes obligatorios
    for(let i=0; i<rows; i++) { map[i][0] = map[i][cols-1] = 1; }
    for(let j=0; j<cols; j++) { map[0][j] = map[rows-1][j] = 1; }
}

// Generar el primer mapa al cargar
generarMapaAleatorio();