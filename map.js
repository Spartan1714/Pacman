export const TILE_SIZE = 30; 
export let map = [];

export function generateMaze() {
    const rows = 11;
    const cols = 20;
    // Crear el borde (tu diseño original)
    let newMap = Array.from({ length: rows }, (_, y) => 
        Array.from({ length: cols }, (_, x) => 
            (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) ? 1 : 2
        )
    );

    // Generar obstáculos internos aleatorios (muros azules)
    for (let i = 0; i < 30; i++) {
        let rx = Math.floor(Math.random() * (cols - 2)) + 1;
        let ry = Math.floor(Math.random() * (rows - 2)) + 1;
        // No tapar las esquinas de spawn ni al jugador
        if (!((rx < 3 && ry < 3) || (rx > 16 && ry > 7))) {
            newMap[ry][rx] = 1;
        }
    }
    
    // El punto Berserker (3) siempre en una esquina
    newMap[9][18] = 3; 

    map.length = 0;
    newMap.forEach(row => map.push(row));
}