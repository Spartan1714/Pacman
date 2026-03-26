export let map = [];
const COLS = 15;
const ROWS = 15;

export function generateMaze() {
    let newMap = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    function carve(x, y) {
        newMap[y][x] = 0;
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (ny > 0 && ny < ROWS - 1 && nx > 0 && nx < COLS - 1 && newMap[ny][nx] === 1) {
                newMap[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);
            }
        }
    }
    carve(1, 1);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (newMap[y][x] === 0) newMap[y][x] = 2;
        }
    }
    newMap[1][1] = 0; 
    newMap[ROWS - 2][COLS - 2] = 3; 
    map.length = 0;
    newMap.forEach(row => map.push(row));
}
generateMaze();