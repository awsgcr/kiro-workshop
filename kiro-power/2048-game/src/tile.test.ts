import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { createGrid, countTiles, resetTileIdCounter, Grid, setTileAt } from './grid';
import { createTile, spawnRandomTile, moveTiles, Direction } from './tile';

beforeEach(() => {
  resetTileIdCounter();
});

describe('Tile Spawning', () => {
  /**
   * Feature: 2048-game, Property 2: Spawned tile values
   * Test that spawned tiles only have value 2 or 4
   * **Validates: Requirements 1.3**
   */
  it('Property 2: Spawned tiles have value 2 or 4 only', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        const grid = createGrid(4);
        const newGrid = spawnRandomTile(grid);
        
        // Find the spawned tile
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const tile = newGrid.cells[row][col];
            if (tile !== null) {
              expect([2, 4]).toContain(tile.value);
            }
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('spawnRandomTile adds exactly one tile to empty grid', () => {
    const grid = createGrid(4);
    const newGrid = spawnRandomTile(grid);
    expect(countTiles(newGrid)).toBe(1);
  });

  it('spawnRandomTile does nothing on full grid', () => {
    let grid = createGrid(4);
    // Fill the grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        grid = setTileAt(grid, { row, col }, createTile(2, { row, col }));
      }
    }
    const newGrid = spawnRandomTile(grid);
    expect(countTiles(newGrid)).toBe(16);
  });
});

// Helper to create a grid with specific values
function gridFromValues(values: (number | null)[][]): Grid {
  resetTileIdCounter();
  let grid = createGrid(4);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const val = values[row][col];
      if (val !== null) {
        grid = setTileAt(grid, { row, col }, createTile(val, { row, col }));
      }
    }
  }
  return grid;
}

// Helper to extract values from grid
function valuesToArray(grid: Grid): (number | null)[][] {
  const result: (number | null)[][] = [];
  for (let row = 0; row < grid.size; row++) {
    result[row] = [];
    for (let col = 0; col < grid.size; col++) {
      const tile = grid.cells[row][col];
      result[row][col] = tile ? tile.value : null;
    }
  }
  return result;
}

describe('Tile Movement', () => {
  /**
   * Feature: 2048-game, Property 3: Movement collapses to edge
   * Test tiles collapse with no gaps in movement direction
   * **Validates: Requirements 2.1, 2.2**
   */
  it('Property 3: Movement collapses tiles to edge with no gaps', () => {
    // Generator for random grid states
    const gridArb = fc.array(
      fc.array(
        fc.oneof(fc.constant(null), fc.constantFrom(2, 4, 8, 16, 32)),
        { minLength: 4, maxLength: 4 }
      ),
      { minLength: 4, maxLength: 4 }
    );
    
    const directionArb = fc.constantFrom<Direction>('up', 'down', 'left', 'right');
    
    fc.assert(
      fc.property(gridArb, directionArb, (values, direction) => {
        const grid = gridFromValues(values as (number | null)[][]);
        const result = moveTiles(grid, direction);
        
        // Check no gaps in movement direction
        for (let i = 0; i < 4; i++) {
          let foundNull = false;
          
          if (direction === 'left') {
            for (let col = 0; col < 4; col++) {
              const tile = result.grid.cells[i][col];
              if (tile === null) foundNull = true;
              else if (foundNull) return false; // Gap found
            }
          } else if (direction === 'right') {
            for (let col = 3; col >= 0; col--) {
              const tile = result.grid.cells[i][col];
              if (tile === null) foundNull = true;
              else if (foundNull) return false;
            }
          } else if (direction === 'up') {
            for (let row = 0; row < 4; row++) {
              const tile = result.grid.cells[row][i];
              if (tile === null) foundNull = true;
              else if (foundNull) return false;
            }
          } else if (direction === 'down') {
            for (let row = 3; row >= 0; row--) {
              const tile = result.grid.cells[row][i];
              if (tile === null) foundNull = true;
              else if (foundNull) return false;
            }
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: 2048-game, Property 5: Invalid move preserves state
   * Test that invalid moves don't change the grid
   * **Validates: Requirements 2.4**
   */
  it('Property 5: Invalid move preserves state', () => {
    // Test specific case: tiles already at edge
    const grid = gridFromValues([
      [2, 4, null, null],
      [8, 16, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'left');
    expect(result.moved).toBe(false);
    expect(valuesToArray(result.grid)).toEqual(valuesToArray(grid));
  });

  it('moveTiles left collapses correctly', () => {
    const grid = gridFromValues([
      [null, 2, null, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'left');
    expect(result.moved).toBe(true);
    expect(result.grid.cells[0][0]?.value).toBe(4);
    expect(result.grid.cells[0][1]).toBeNull();
    expect(result.scoreGained).toBe(4);
  });

  it('moveTiles right collapses correctly', () => {
    const grid = gridFromValues([
      [2, null, 2, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'right');
    expect(result.moved).toBe(true);
    expect(result.grid.cells[0][3]?.value).toBe(4);
  });

  it('moveTiles up collapses correctly', () => {
    const grid = gridFromValues([
      [2, null, null, null],
      [null, null, null, null],
      [2, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'up');
    expect(result.moved).toBe(true);
    expect(result.grid.cells[0][0]?.value).toBe(4);
  });

  it('moveTiles down collapses correctly', () => {
    const grid = gridFromValues([
      [2, null, null, null],
      [null, null, null, null],
      [2, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'down');
    expect(result.moved).toBe(true);
    expect(result.grid.cells[3][0]?.value).toBe(4);
  });
});

describe('Tile Merging', () => {
  /**
   * Feature: 2048-game, Property 6: Merge doubles value
   * Test merge produces doubled value
   * **Validates: Requirements 3.1**
   */
  it('Property 6: Merge produces tile with doubled value', () => {
    const valueArb = fc.constantFrom(2, 4, 8, 16, 32, 64, 128, 256, 512, 1024);
    
    fc.assert(
      fc.property(valueArb, (value) => {
        const grid = gridFromValues([
          [value, value, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ]);
        
        const result = moveTiles(grid, 'left');
        expect(result.grid.cells[0][0]?.value).toBe(value * 2);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: 2048-game, Property 8: Single merge per tile per move
   * Test that tiles merge at most once per move
   * **Validates: Requirements 3.3**
   */
  it('Property 8: Tiles merge at most once per move ([2,2,2,2] -> [4,4])', () => {
    const grid = gridFromValues([
      [2, 2, 2, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'left');
    expect(result.grid.cells[0][0]?.value).toBe(4);
    expect(result.grid.cells[0][1]?.value).toBe(4);
    expect(result.grid.cells[0][2]).toBeNull();
    expect(result.grid.cells[0][3]).toBeNull();
    expect(result.scoreGained).toBe(8); // 4 + 4
  });

  /**
   * Feature: 2048-game, Property 9: Merge direction priority
   * Test that tiles closest to movement direction merge first
   * **Validates: Requirements 3.4**
   */
  it('Property 9: Merge direction priority ([2,2,4] left -> [4,4])', () => {
    const grid = gridFromValues([
      [2, 2, 4, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'left');
    expect(result.grid.cells[0][0]?.value).toBe(4);
    expect(result.grid.cells[0][1]?.value).toBe(4);
    expect(result.grid.cells[0][2]).toBeNull();
  });

  it('Property 9: Merge direction priority right ([4,2,2] right -> [4,4])', () => {
    const grid = gridFromValues([
      [null, 4, 2, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const result = moveTiles(grid, 'right');
    expect(result.grid.cells[0][3]?.value).toBe(4);
    expect(result.grid.cells[0][2]?.value).toBe(4);
  });
});
