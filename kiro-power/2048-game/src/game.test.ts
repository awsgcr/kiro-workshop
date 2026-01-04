import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { initGame, makeMove, checkWinCondition, checkGameOver, canMove, GameState } from './game';
import { countTiles, createGrid, setTileAt, resetTileIdCounter, Grid } from './grid';
import { createTile } from './tile';

beforeEach(() => {
  resetTileIdCounter();
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

describe('Game Initialization', () => {
  /**
   * Feature: 2048-game, Property 1: Initial game state
   * Test new game has exactly 2 tiles and score of 0
   * **Validates: Requirements 1.2, 7.1, 7.2, 7.3**
   */
  it('Property 1: Initial game has exactly 2 tiles and score of 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        resetTileIdCounter();
        const game = initGame();
        
        expect(countTiles(game.grid)).toBe(2);
        expect(game.score).toBe(0);
        expect(game.status).toBe('playing');
        expect(game.hasWon).toBe(false);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Valid Moves', () => {
  /**
   * Feature: 2048-game, Property 4: Valid move spawns one tile
   * Test valid moves spawn exactly one tile
   * **Validates: Requirements 2.3**
   */
  it('Property 4: Valid move spawns exactly one tile', () => {
    // Create a grid where movement is guaranteed
    const grid = gridFromValues([
      [null, null, null, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const state: GameState = {
      grid,
      score: 0,
      status: 'playing',
      hasWon: false,
    };
    
    const newState = makeMove(state, 'left');
    
    // Original had 1 tile, after move should have 2 (1 original moved + 1 spawned)
    expect(countTiles(newState.grid)).toBe(2);
  });

  /**
   * Feature: 2048-game, Property 7: Score increases by merged value
   * Test score updates correctly on merge
   * **Validates: Requirements 3.2**
   */
  it('Property 7: Score increases by merged tile value', () => {
    const valueArb = fc.constantFrom(2, 4, 8, 16, 32, 64);
    
    fc.assert(
      fc.property(valueArb, (value) => {
        resetTileIdCounter();
        const grid = gridFromValues([
          [value, value, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ]);
        
        const state: GameState = {
          grid,
          score: 0,
          status: 'playing',
          hasWon: false,
        };
        
        const newState = makeMove(state, 'left');
        expect(newState.score).toBe(value * 2);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Invalid move does not change state', () => {
    const grid = gridFromValues([
      [2, 4, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    const state: GameState = {
      grid,
      score: 10,
      status: 'playing',
      hasWon: false,
    };
    
    const newState = makeMove(state, 'left');
    
    // State should be unchanged
    expect(newState.score).toBe(10);
    expect(countTiles(newState.grid)).toBe(2);
  });
});

describe('Win/Game Over Detection', () => {
  /**
   * Feature: 2048-game, Property 10: Win detection
   * Test win triggers at 2048
   * **Validates: Requirements 5.1**
   */
  it('Property 10: Win detected when 2048 tile exists', () => {
    const grid = gridFromValues([
      [2048, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    expect(checkWinCondition(grid)).toBe(true);
  });

  it('Property 10: Win detected for values >= 2048', () => {
    const grid = gridFromValues([
      [4096, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    expect(checkWinCondition(grid)).toBe(true);
  });

  it('No win when max tile < 2048', () => {
    const grid = gridFromValues([
      [1024, 512, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    expect(checkWinCondition(grid)).toBe(false);
  });

  /**
   * Feature: 2048-game, Property 11: Game over detection
   * Test game over when no moves possible
   * **Validates: Requirements 6.1**
   */
  it('Property 11: Game over when full grid with no adjacent matches', () => {
    // Create a grid with no possible moves
    const grid = gridFromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    
    expect(checkGameOver(grid)).toBe(true);
    expect(canMove(grid)).toBe(false);
  });

  it('Not game over when empty cells exist', () => {
    const grid = gridFromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, null],
    ]);
    
    expect(checkGameOver(grid)).toBe(false);
    expect(canMove(grid)).toBe(true);
  });

  it('Not game over when adjacent matches exist', () => {
    const grid = gridFromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4], // Two 4s adjacent
    ]);
    
    expect(checkGameOver(grid)).toBe(false);
    expect(canMove(grid)).toBe(true);
  });
});
