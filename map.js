export const TILE_SIZE = 30;
export let map = [];

const baseMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,1,1,2,1,1,2,2,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,2,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Inicialización inicial
map = JSON.parse(JSON.stringify(baseMap));

export function spawnCherry(level) {
    // Limpiar 3 antiguos
    map.forEach((row, y) => row.forEach((c, x) => { if (c === 3) map[y][x] = 2; }));

    let emptyCells = [];
    map.forEach((row, y) => row.forEach((c, x) => { if (c === 2) emptyCells.push({ x, y }); }));

    if (emptyCells.length > 0) {
        let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        map[pos.y][pos.x] = 3;
        window.currentCherry = { x: pos.x, y: pos.y };
    }
}

export function resetMap() {
    map.length = 0;
    baseMap.forEach(row => map.push([...row]));
}

export function generarMapaRandom() {
    const width = 20;
    const height = 10;

    // 1. Iniciar todo como MURO absoluto
    let nuevoMapa = Array.from({ length: height }, () => 
        Array.from({ length: width }, () => 1)
    );

    function shuffle(arr) {
        return arr.sort(() => Math.random() - 0.5);
    }

    function carve(x, y) {
        const dirs = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);

        for (let [dx, dy] of dirs) {
            let nx = x + dx * 2;
            let ny = y + dy * 2;

            // Mantenerse dentro del marco (bordes de seguridad)
            if (ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1) {
                if (nuevoMapa[ny][nx] === 1) {
                    nuevoMapa[y + dy][x + dx] = 2; // Camino con punto
                    nuevoMapa[ny][nx] = 2;         // Camino con punto
                    carve(nx, ny);
                }
            }
        }
    }

    // 2. Generar laberinto principal
    carve(1, 1);

    // 3. SEGUNDO PASO: Romper muros aislados para evitar puntos encerrados
    // Esto garantiza que el laberinto sea más abierto y conectado
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (nuevoMapa[y][x] === 1) {
                // Si un muro tiene camino a la izquierda y derecha, o arriba y abajo
                // hay una probabilidad de romperlo para conectar secciones
                const hasPathH = nuevoMapa[y][x-1] === 2 && nuevoMapa[y][x+1] === 2;
                const hasPathV = nuevoMapa[y-1][x] === 2 && nuevoMapa[y+1][x] === 2;
                
                if ((hasPathH || hasPathV) && Math.random() < 0.3) {
                    nuevoMapa[y][x] = 2;
                }
            }
        }
    }

    // 4. LIMPIEZA DE SEGURIDAD: Asegurar que los bordes sean SIEMPRE muros
    // Esto evita que Pacman se salga o que aparezcan puntos en el borde
    for (let i = 0; i < width; i++) {
        nuevoMapa[0][i] = 1;          // Techo
        nuevoMapa[height - 1][i] = 1; // Suelo
    }
    for (let i = 0; i < height; i++) {
        nuevoMapa[i][0] = 1;         // Pared izquierda
        nuevoMapa[i][width - 1] = 1; // Pared derecha
    }

    // 5. Garantizar zona de inicio libre
    nuevoMapa[1][1] = 2;
    nuevoMapa[1][2] = 2;
    nuevoMapa[2][1] = 2;

    // 6. Actualizar la referencia global 'map'
    map.length = 0;
    nuevoMapa.forEach(row => map.push([...row]));
}