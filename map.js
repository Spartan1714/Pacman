export const TILE_SIZE = 30;
export let map = [
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

export function spawnCherry(level) {
    // Limpiar cerezas previas (el 3 vuelve a ser camino o punto)
    map.forEach((row, y) => row.forEach((c, x) => { if(c === 3) map[y][x] = 2; }));

    // Forzamos en nivel 1, probabilidad en el resto
    if (level === 1 || Math.random() > 0.5) {
        let emptyCells = [];
        map.forEach((row, y) => row.forEach((c, x) => { if(c !== 1) emptyCells.push({x, y}); }));
        let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        map[pos.y][pos.x] = 3;
    }
}