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

// Inicialización
map = JSON.parse(JSON.stringify(baseMap));

export function spawnCherry(level) {
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

    let nuevoMapa = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 1)
    );

    function shuffle(arr) {
        return arr.sort(() => Math.random() - 0.5);
    }

    // DFS base (estructura principal)
    function carve(x, y) {
        const dirs = shuffle([[1,0],[-1,0],[0,1],[0,-1]]);

        for (let [dx, dy] of dirs) {
            let nx = x + dx * 2;
            let ny = y + dy * 2;

            if (ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1) {
                if (nuevoMapa[ny][nx] === 1) {
                    nuevoMapa[y + dy][x + dx] = 2;
                    nuevoMapa[ny][nx] = 2;
                    carve(nx, ny);
                }
            }
        }
    }

    carve(1, 1);

    // 🔥 MÁS loops (clave para complejidad)
    for (let i = 0; i < 20; i++) {
        let rx = Math.floor(Math.random() * (width - 2)) + 1;
        let ry = Math.floor(Math.random() * (height - 2)) + 1;

        if (nuevoMapa[ry][rx] === 1) {
            let vecinos = [
                nuevoMapa[ry][rx + 1],
                nuevoMapa[ry][rx - 1],
                nuevoMapa[ry + 1]?.[rx],
                nuevoMapa[ry - 1]?.[rx]
            ];

            let caminos = vecinos.filter(v => v === 2).length;

            if (caminos >= 2 && caminos <= 3) {
                nuevoMapa[ry][rx] = 2;
            }
        }
    }

    // 🔥 ZONAS ABIERTAS (rompe monotonía)
    for (let i = 0; i < 3; i++) {
        let rx = Math.floor(Math.random() * (width - 4)) + 2;
        let ry = Math.floor(Math.random() * (height - 4)) + 2;

        nuevoMapa[ry][rx] = 2;
        nuevoMapa[ry][rx + 1] = 2;
        nuevoMapa[ry + 1][rx] = 2;
        nuevoMapa[ry + 1][rx + 1] = 2;
    }

    // Bordes
    for (let i = 0; i < width; i++) {
        nuevoMapa[0][i] = 1;
        nuevoMapa[height - 1][i] = 1;
    }
    for (let i = 0; i < height; i++) {
        nuevoMapa[i][0] = 1;
        nuevoMapa[i][width - 1] = 1;
    }

    // Spawn seguro
    nuevoMapa[1][1] = 2;
    nuevoMapa[1][2] = 2;
    nuevoMapa[2][1] = 2;

    // Flood Fill
    function floodFill(x, y, visitado) {
        let stack = [{ x, y }];
        visitado[y][x] = true;

        while (stack.length) {
            let { x, y } = stack.pop();

            let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            for (let [dx, dy] of dirs) {
                let nx = x + dx;
                let ny = y + dy;

                if (
                    nx >= 0 && nx < width &&
                    ny >= 0 && ny < height &&
                    !visitado[ny][nx] &&
                    nuevoMapa[ny][nx] === 2
                ) {
                    visitado[ny][nx] = true;
                    stack.push({ x: nx, y: ny });
                }
            }
        }
    }

    let visitado = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => false)
    );

    floodFill(1, 1, visitado);

    // Eliminar inaccesibles
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (nuevoMapa[y][x] === 2 && !visitado[y][x]) {
                nuevoMapa[y][x] = 1;
            }
        }
    }

    // 🔥 Reducir dead-ends (no eliminarlos todos)
    function suavizarDeadEnds(mapa) {
        for (let y = 1; y < mapa.length - 1; y++) {
            for (let x = 1; x < mapa[0].length - 1; x++) {

                if (mapa[y][x] !== 2) continue;

                let vecinos = [
                    mapa[y][x+1],
                    mapa[y][x-1],
                    mapa[y+1][x],
                    mapa[y-1][x]
                ];

                let caminos = vecinos.filter(v => v === 2).length;

                // solo eliminar los completamente aislados
                if (caminos === 0) {
                    mapa[y][x] = 1;
                }
            }
        }
    }

    suavizarDeadEnds(nuevoMapa);

    // Actualizar global
    map.length = 0;
    nuevoMapa.forEach(row => map.push([...row]));
}