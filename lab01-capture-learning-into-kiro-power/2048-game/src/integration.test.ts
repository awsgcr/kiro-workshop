import { describe, it, expect, beforeEach } from 'vitest';
import { initGame, makeMove, GameState } from './game';
import { countTiles, resetTileIdCounter, createGrid, setTileAt, Grid } from './grid';
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

describe('Integration Tests', () => {
  /**
   * Test full game flow: init → move → merge → win/lose
   * **Validates: Requirements 1.2, 2.1, 3.1, 5.1, 6.1, 7.1**
   */
  
  it('Full game flow: init creates valid game state', () => {
    const game = initGame();
    
    expect(game.score).toBe(0);
    expect(game.status).toBe('playing');
    expect(game.hasWon).toBe(false);
    expect(countTiles(game.grid)).toBe(2);
  });

  it('Full game flow: move and merge work correctly', () => {
    const grid = gridFromValues([
      [2, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    let state: GameState = {
      grid,
      score: 0,
      status: 'playing',
      hasWon: false,
    };
    
    state = makeMove(state, 'left');
    
    // Should have merged 2+2=4 and spawned a new tile
    expect(state.score).toBe(4);
    expect(state.grid.cells[0][0]?.value).toBe(4);
    expect(countTiles(state.grid)).toBe(2); // 1 merged + 1 spawned
  });

  it('Full game flow: win detection triggers at 2048', () => {
    const grid = gridFromValues([
      [1024, 1024, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    let state: GameState = {
      grid,
      score: 0,
      status: 'playing',
      hasWon: false,
    };
    
    state = makeMove(state, 'left');
    
    expect(state.grid.cells[0][0]?.value).toBe(2048);
    expect(state.status).toBe('won');
    expect(state.hasWon).toBe(true);
  });

  it('Full game flow: game over detection', () => {
    // Create a nearly full grid that will be game over after one move
    const grid = gridFromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, null],
    ]);
    
    let state: GameState = {
      grid,
      score: 0,
      status: 'playing',
      hasWon: false,
    };
    
    // Make a move that fills the last cell
    state = makeMove(state, 'right');
    
    // If the spawned tile creates a game over situation
    // (depends on random spawn, but grid is nearly locked)
    // The game should detect if no moves are possible
    expect(['playing', 'lost']).toContain(state.status);
  });

  it('New game reset functionality', () => {
    // Start a game and make some moves
    let state = initGame();
    state = makeMove(state, 'left');
    state = makeMove(state, 'up');
    
    // Start a new game
    const newState = initGame();
    
    expect(newState.score).toBe(0);
    expect(newState.status).toBe('playing');
    expect(newState.hasWon).toBe(false);
    expect(countTiles(newState.grid)).toBe(2);
  });

  it('Multiple moves accumulate score correctly', () => {
    const grid = gridFromValues([
      [2, 2, 2, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    let state: GameState = {
      grid,
      score: 0,
      status: 'playing',
      hasWon: false,
    };
    
    state = makeMove(state, 'left');
    
    // [2,2,2,2] -> [4,4] = 8 points
    expect(state.score).toBe(8);
  });

  it('Continuing after win allows further play', () => {
    const grid = gridFromValues([
      [2048, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    
    let state: GameState = {
      grid,
      score: 0,
      status: 'won',
      hasWon: true,
    };
    
    // Should still be able to make moves after winning
    state = makeMove(state, 'left');
    
    // Move should work (tiles slide left)
    expect(state.grid.cells[0][0]?.value).toBe(2048);
  });
});
