// --- map.js ---
export const TILE_SIZE = 30;
export let map = [];

// 1. DEFINICIÓN DE NIVELES (Estilo Arcade Real)
// 1 = Muro, 2 = Punto, 0 = Vacío

const nivel1 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,1,1,2,1,1,2,2,2,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const nivel2 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
    [1,1,2,1,2,1,1,2,1,1,1,1,2,1,1,1,2,1,2,1],
    [1,1,2,2,2,1,1,2,2,2,2,1,2,2,1,1,2,2,2,1],
    [1,2,2,1,2,2,2,2,1,1,2,2,2,1,2,2,2,1,2,1],
    [1,1,2,1,2,1,1,2,1,1,1,1,2,1,1,1,2,1,2,1],
    [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const nivel3 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const mundos = [nivel1, nivel2, nivel3];

// Inicialización
map = JSON.parse(JSON.stringify(nivel1));

// 2. LÓGICA DE CEREZAS (Mantenida y funcional)
export function spawnCherry(level) {
    // Limpiar cerezas viejas
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
    nivel1.forEach(row => map.push([...row]));
}

// 3. CAMBIO DE NIVEL (Selección aleatoria de colección)
export function generarMapaRandom() {
    let nuevoNivel;
    do {
        nuevoNivel = mundos[Math.floor(Math.random() * mundos.length)];
    } while (mundos.length > 1 && JSON.stringify(nuevoNivel) === JSON.stringify(map));

    map.length = 0;
    nuevoNivel.forEach(row => map.push([...row]));
}