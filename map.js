export let map = [];

export function generateRandomMaze(width = 19, height = 19) {
    // 1. Llenar todo de paredes (1)
    let newMap = Array.from({ length: height }, () => Array(width).fill(1));

    function walk(x, y) {
        newMap[y][x] = 0; // Camino
        let dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        
        for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1 && newMap[ny][nx] === 1) {
                newMap[y + dy / 2][x + dx / 2] = 0; // Romper pared intermedia
                walk(nx, ny);
            }
        }
    }

    walk(1, 1); // Empezar desde la esquina superior
    
    // Asegurar que Pacman tenga espacio al inicio
    newMap[1][1] = 0; newMap[1][2] = 0; newMap[2][1] = 0;
    
    // Llenar con puntos (2) y poner un Power-Up (3) en una esquina
    newMap.forEach((row, y) => row.forEach((tile, x) => {
        if (tile === 0) newMap[y][x] = 2;
    }));
    
    // Colocar el ítem Berserker (3) lejos del inicio
    newMap[height - 2][width - 2] = 3; 

    map.length = 0;
    newMap.forEach(row => map.push(row));
}

// Inicializar el primer mapa
generateRandomMaze();