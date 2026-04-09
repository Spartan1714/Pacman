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

// inicializar mapa
map = JSON.parse(JSON.stringify(baseMap));

export function spawnCherry(level) {
    // 1. Limpiar cerezas anteriores en el array del mapa
    map.forEach((row, y) =>
        row.forEach((c, x) => {
            if (c === 3) map[y][x] = 2;
        })
    );

    let emptyCells = [];
    map.forEach((row, y) =>
        row.forEach((c, x) => {
            if (c === 2) emptyCells.push({ x, y });
        })
    );

    if (emptyCells.length > 0) {
        let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        map[pos.y][pos.x] = 3; // Mantenemos el 3 en el mapa
        
        // 🔥 ESTA ES LA LÍNEA QUE TE FALTA:
        window.currentCherry = { x: pos.x, y: pos.y };
        console.log("Cereza enviada a window:", window.currentCherry);
    }
}

export function resetMap() {
    map.length = 0;
    baseMap.forEach(row => map.push([...row]));
}

// 🔥 GENERADOR SIMPLE Y SEGURO
export function generarMapaRandom() {
    const width = 20;
    const height = 10;

    // iniciar todo como muros
    let nuevoMapa = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 1)
    );

    function shuffle(arr) {
        return arr.sort(() => Math.random() - 0.5);
    }

    function carve(x, y) {
        const dirs = shuffle([
            [1,0], [-1,0], [0,1], [0,-1]
        ]);

        for (let [dx, dy] of dirs) {
            let nx = x + dx * 2;
            let ny = y + dy * 2;

            if (
                ny > 0 && ny < height - 1 &&
                nx > 0 && nx < width - 1 &&
                nuevoMapa[ny][nx] === 1
            ) {
                nuevoMapa[y + dy][x + dx] = 2; // camino
                nuevoMapa[ny][nx] = 2;
                carve(nx, ny);
            }
        }
    }

    // punto inicial
    nuevoMapa[1][1] = 2;
    carve(1, 1);

    // 🔥 abrir más caminos (evita laberinto demasiado cerrado)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (nuevoMapa[y][x] === 1 && Math.random() < 0.15) {
                nuevoMapa[y][x] = 2;
            }
        }
    }

    // asegurar spawn limpio
    nuevoMapa[1][1] = 2;
    nuevoMapa[1][2] = 2;
    nuevoMapa[2][1] = 2;

    // aplicar sin romper referencia
    map.length = 0;
    nuevoMapa.forEach(row => map.push([...row]));
}