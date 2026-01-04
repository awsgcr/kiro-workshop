// Grid module - manages the 4x4 grid state and tile positions

export interface Cell {
  row: number;
  col: number;
}

export interface Tile {
  id: number;
  value: number;
  position: Cell;
  mergedFrom?: [Tile, Tile];
}

export interface Grid {
  size: number;
  cells: (Tile | null)[][];
}

let nextTileId = 1;

export function getNextTileId(): number {
  return nextTileId++;
}

export function resetTileIdCounter(): void {
  nextTileId = 1;
}

export function createGrid(size: number): Grid {
  const cells: (Tile | null)[][] = [];
  for (let row = 0; row < size; row++) {
    cells[row] = [];
    for (let col = 0; col < size; col++) {
      cells[row][col] = null;
    }
  }
  return { size, cells };
}

export function getEmptyCells(grid: Grid): Cell[] {
  const empty: Cell[] = [];
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      if (grid.cells[row][col] === null) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

export function getTileAt(grid: Grid, cell: Cell): Tile | null {
  if (cell.row < 0 || cell.row >= grid.size || cell.col < 0 || cell.col >= grid.size) {
    return null;
  }
  return grid.cells[cell.row][cell.col];
}

export function setTileAt(grid: Grid, cell: Cell, tile: Tile | null): Grid {
  const newCells = grid.cells.map(row => [...row]);
  newCells[cell.row][cell.col] = tile;
  return { ...grid, cells: newCells };
}

export function cloneGrid(grid: Grid): Grid {
  const newCells = grid.cells.map(row => 
    row.map(tile => tile ? { ...tile, position: { ...tile.position } } : null)
  );
  return { size: grid.size, cells: newCells };
}

export function countTiles(grid: Grid): number {
  let count = 0;
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      if (grid.cells[row][col] !== null) {
        count++;
      }
    }
  }
  return count;
}
