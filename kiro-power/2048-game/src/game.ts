// Game Controller module - orchestrates game flow and state management

import { Grid, createGrid, getEmptyCells, resetTileIdCounter } from './grid';
import { Direction, moveTiles, spawnRandomTile } from './tile';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  grid: Grid;
  score: number;
  status: GameStatus;
  hasWon: boolean;
}

export function initGame(): GameState {
  resetTileIdCounter();
  let grid = createGrid(4);
  grid = spawnRandomTile(grid);
  grid = spawnRandomTile(grid);
  
  return {
    grid,
    score: 0,
    status: 'playing',
    hasWon: false,
  };
}

export function checkWinCondition(grid: Grid): boolean {
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      const tile = grid.cells[row][col];
      if (tile && tile.value >= 2048) {
        return true;
      }
    }
  }
  return false;
}

export function canMove(grid: Grid): boolean {
  // Check for empty cells
  if (getEmptyCells(grid).length > 0) {
    return true;
  }
  
  // Check for possible merges
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      const tile = grid.cells[row][col];
      if (!tile) continue;
      
      // Check right neighbor
      if (col < grid.size - 1) {
        const right = grid.cells[row][col + 1];
        if (right && right.value === tile.value) {
          return true;
        }
      }
      
      // Check bottom neighbor
      if (row < grid.size - 1) {
        const bottom = grid.cells[row + 1][col];
        if (bottom && bottom.value === tile.value) {
          return true;
        }
      }
    }
  }
  
  return false;
}

export function checkGameOver(grid: Grid): boolean {
  return !canMove(grid);
}

export function makeMove(state: GameState, direction: Direction): GameState {
  if (state.status === 'lost') {
    return state;
  }
  
  const moveResult = moveTiles(state.grid, direction);
  
  if (!moveResult.moved) {
    return state;
  }
  
  // Spawn new tile after valid move
  let newGrid = spawnRandomTile(moveResult.grid);
  const newScore = state.score + moveResult.scoreGained;
  
  // Check win condition
  let newStatus: GameStatus = state.status;
  let hasWon = state.hasWon;
  
  if (!hasWon && checkWinCondition(newGrid)) {
    hasWon = true;
    newStatus = 'won';
  }
  
  // Check game over (only if not already won or if continuing after win)
  if (checkGameOver(newGrid)) {
    newStatus = 'lost';
  }
  
  return {
    grid: newGrid,
    score: newScore,
    status: newStatus,
    hasWon,
  };
}
