export let map = [];

// Usamos 15x15 para mantener la proporción compacta de la imagen
const COLS = 15;
const ROWS = 15;

export function generateMaze() {
    // 1. Crear rejilla llena de paredes
    let newMap = Array.from({ length: ROWS }, () => Array(COLS).fill(1));

    // Tu algoritmo original de excavación (Recursive Backtracking)
    function carve(x, y) {
        newMap[y][x] = 0; // Camino libre

        // Direcciones aleatorias (2 casillas de salto)
        const dirs = [
            [0, 2], [0, -2], [2, 0], [-2, 0]
        ].sort(() => Math.random() - 0.5);

        for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            
            // Validar límites y que sea pared
            if (ny > 0 && ny < ROWS - 1 && nx > 0 && nx < COLS - 1 && newMap[ny][nx] === 1) {
                newMap[y + dy / 2][x + dx / 2] = 0; // Romper pared intermedia
                carve(nx, ny);
            }
        }
    }

    // Empezar a excavar desde la esquina superior (Pacman start)
    carve(1, 1);
    
    // 2. Post-procesado: Rellenar con puntos (2) y Berserker (3)
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (newMap[y][x] === 0) {
                newMap[y][x] = 2; // Colocar bolita normal
            }
        }
    }
    
    // Asegurar que Pacman nace en zona limpia
    newMap[1][1] = 0; 
    
    // Colocar Power-Up (3) lejos, ej: esquina inferior derecha
    newMap[ROWS - 2][COLS - 2] = 3; 

    // Reemplazar el mapa global
    map.length = 0;
    newMap.forEach(row => map.push(row));
}

// Generar el primer laberinto
generateMaze();