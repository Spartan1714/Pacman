export const TILE_SIZE = 30;

export let map = [];

export function generateMap(width = 20, height = 10) {
    let newMap = [];

    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            if (y === 0 || x === 0 || y === height - 1 || x === width - 1) {
                row.push(1);
            } else {
                row.push(Math.random() < 0.2 ? 1 : 2);
            }
        }
        newMap.push(row);
    }

    return newMap;
}

export function initMap() {
    map = generateMap();
}

export function spawnCherry() {
    let empty = [];

    map.forEach((row, y) => {
        row.forEach((c, x) => {
            if (c === 2) empty.push({ x, y });
        });
    });

    if (empty.length === 0) return;

    let pos = empty[Math.floor(Math.random() * empty.length)];
    map[pos.y][pos.x] = 3;
}