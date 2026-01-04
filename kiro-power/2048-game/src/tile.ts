// Tile operations module - handles tile creation, movement, and merging

import { Grid, Cell, Tile, getEmptyCells, setTileAt, getNextTileId, cloneGrid } from './grid';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface MoveResult {
  grid: Grid;
  moved: boolean;
  scoreGained: number;
  mergedTiles: Tile[];
}

export function createTile(value: number, position: Cell): Tile {
  return {
    id: getNextTileId(),
    value,
    position: { ...position },
  };
}

export function spawnRandomTile(grid: Grid): Grid {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) {
    return grid;
  }
  
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const tile = createTile(value, randomCell);
  
  return setTileAt(grid, randomCell, tile);
}

export function canMerge(tile1: Tile | null, tile2: Tile | null): boolean {
  if (!tile1 || !tile2) return false;
  return tile1.value === tile2.value;
}

export function mergeTiles(tile1: Tile, tile2: Tile): Tile {
  const newValue = tile1.value + tile2.value;
  return {
    id: getNextTileId(),
    value: newValue,
    position: { ...tile2.position },
    mergedFrom: [tile1, tile2],
  };
}

interface LineResult {
  tiles: (Tile | null)[];
  score: number;
  merged: boolean;
}

function processLine(line: (Tile | null)[]): LineResult {
  // 1. Filter out nulls (collapse)
  const tiles = line.filter((t): t is Tile => t !== null);
  
  // 2. Merge adjacent matching tiles
  const result: (Tile | null)[] = [];
  let score = 0;
  let merged = false;
  let i = 0;
  
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i].value === tiles[i + 1].value) {
      const newValue = tiles[i].value * 2;
      result.push({
        id: getNextTileId(),
        value: newValue,
        position: tiles[i].position,
        mergedFrom: [tiles[i], tiles[i + 1]],
      });
      score += newValue;
      merged = true;
      i += 2;
    } else {
      result.push(tiles[i]);
      i++;
    }
  }
  
  // 3. Pad with nulls
  while (result.length < line.length) {
    result.push(null);
  }
  
  return { tiles: result, score, merged };
}

function getLine(grid: Grid, direction: Direction, index: number): (Tile | null)[] {
  const line: (Tile | null)[] = [];
  const size = grid.size;
  
  switch (direction) {
    case 'left':
      for (let col = 0; col < size; col++) {
        line.push(grid.cells[index][col]);
      }
      break;
    case 'right':
      for (let col = size - 1; col >= 0; col--) {
        line.push(grid.cells[index][col]);
      }
      break;
    case 'up':
      for (let row = 0; row < size; row++) {
        line.push(grid.cells[row][index]);
      }
      break;
    case 'down':
      for (let row = size - 1; row >= 0; row--) {
        line.push(grid.cells[row][index]);
      }
      break;
  }
  
  return line;
}

function setLine(grid: Grid, direction: Direction, index: number, line: (Tile | null)[]): void {
  const size = grid.size;
  
  switch (direction) {
    case 'left':
      for (let col = 0; col < size; col++) {
        const tile = line[col];
        if (tile) {
          tile.position = { row: index, col };
        }
        grid.cells[index][col] = tile;
      }
      break;
    case 'right':
      for (let col = size - 1; col >= 0; col--) {
        const tile = line[size - 1 - col];
        if (tile) {
          tile.position = { row: index, col };
        }
        grid.cells[index][col] = tile;
      }
      break;
    case 'up':
      for (let row = 0; row < size; row++) {
        const tile = line[row];
        if (tile) {
          tile.position = { row, col: index };
        }
        grid.cells[row][index] = tile;
      }
      break;
    case 'down':
      for (let row = size - 1; row >= 0; row--) {
        const tile = line[size - 1 - row];
        if (tile) {
          tile.position = { row, col: index };
        }
        grid.cells[row][index] = tile;
      }
      break;
  }
}

function gridsEqual(grid1: Grid, grid2: Grid): boolean {
  for (let row = 0; row < grid1.size; row++) {
    for (let col = 0; col < grid1.size; col++) {
      const t1 = grid1.cells[row][col];
      const t2 = grid2.cells[row][col];
      if (t1 === null && t2 === null) continue;
      if (t1 === null || t2 === null) return false;
      if (t1.value !== t2.value) return false;
    }
  }
  return true;
}

export function moveTiles(grid: Grid, direction: Direction): MoveResult {
  const originalGrid = cloneGrid(grid);
  const newGrid = cloneGrid(grid);
  let totalScore = 0;
  const mergedTiles: Tile[] = [];
  
  const lineCount = newGrid.size;
  
  for (let i = 0; i < lineCount; i++) {
    const line = getLine(newGrid, direction, i);
    const result = processLine(line);
    setLine(newGrid, direction, i, result.tiles);
    totalScore += result.score;
    
    // Collect merged tiles
    for (const tile of result.tiles) {
      if (tile?.mergedFrom) {
        mergedTiles.push(tile);
      }
    }
  }
  
  const moved = !gridsEqual(originalGrid, newGrid);
  
  return {
    grid: newGrid,
    moved,
    scoreGained: totalScore,
    mergedTiles,
  };
}
