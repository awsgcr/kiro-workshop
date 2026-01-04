import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createGrid, getEmptyCells, getTileAt, setTileAt, cloneGrid, countTiles } from './grid';

describe('Grid Module', () => {
  /**
   * Feature: 2048-game, Property 1: Initial game state (grid portion)
   * Test that createGrid produces correct dimensions
   * **Validates: Requirements 1.2**
   */
  it('Property 1: createGrid produces correct dimensions', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (size) => {
        const grid = createGrid(size);
        
        // Grid has correct size
        expect(grid.size).toBe(size);
        expect(grid.cells.length).toBe(size);
        
        // All rows have correct length
        for (const row of grid.cells) {
          expect(row.length).toBe(size);
        }
        
        // All cells are initially null
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            expect(grid.cells[r][c]).toBeNull();
          }
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('getEmptyCells returns all cells for empty grid', () => {
    const grid = createGrid(4);
    const emptyCells = getEmptyCells(grid);
    expect(emptyCells.length).toBe(16);
  });

  it('getTileAt returns null for empty cells', () => {
    const grid = createGrid(4);
    expect(getTileAt(grid, { row: 0, col: 0 })).toBeNull();
    expect(getTileAt(grid, { row: 3, col: 3 })).toBeNull();
  });

  it('getTileAt returns null for out of bounds', () => {
    const grid = createGrid(4);
    expect(getTileAt(grid, { row: -1, col: 0 })).toBeNull();
    expect(getTileAt(grid, { row: 4, col: 0 })).toBeNull();
  });

  it('setTileAt places tile correctly', () => {
    const grid = createGrid(4);
    const tile = { id: 1, value: 2, position: { row: 1, col: 2 } };
    const newGrid = setTileAt(grid, { row: 1, col: 2 }, tile);
    
    expect(getTileAt(newGrid, { row: 1, col: 2 })).toEqual(tile);
    expect(getTileAt(grid, { row: 1, col: 2 })).toBeNull(); // Original unchanged
  });

  it('cloneGrid creates independent copy', () => {
    const grid = createGrid(4);
    const tile = { id: 1, value: 2, position: { row: 0, col: 0 } };
    const gridWithTile = setTileAt(grid, { row: 0, col: 0 }, tile);
    const cloned = cloneGrid(gridWithTile);
    
    expect(cloned.cells[0][0]?.value).toBe(2);
    expect(cloned).not.toBe(gridWithTile);
    expect(cloned.cells).not.toBe(gridWithTile.cells);
  });

  it('countTiles returns correct count', () => {
    let grid = createGrid(4);
    expect(countTiles(grid)).toBe(0);
    
    grid = setTileAt(grid, { row: 0, col: 0 }, { id: 1, value: 2, position: { row: 0, col: 0 } });
    expect(countTiles(grid)).toBe(1);
    
    grid = setTileAt(grid, { row: 1, col: 1 }, { id: 2, value: 4, position: { row: 1, col: 1 } });
    expect(countTiles(grid)).toBe(2);
  });
});
