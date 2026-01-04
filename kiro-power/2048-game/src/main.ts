// Main application entry point

import { initGame, makeMove, GameState } from './game';
import { Direction } from './tile';
import { initGrid, renderGrid, renderScore, showMessage, hideMessage } from './ui';
import { setupKeyboardInput, setupTouchInput } from './input';

// DOM elements
const gridEl = document.getElementById('grid') as HTMLElement;
const scoreEl = document.getElementById('score') as HTMLElement;
const newGameBtn = document.getElementById('new-game') as HTMLButtonElement;
const messageEl = document.getElementById('message') as HTMLElement;
const messageTextEl = document.getElementById('message-text') as HTMLElement;
const messageBtnEl = document.getElementById('message-btn') as HTMLButtonElement;

// Game state
let gameState: GameState;
let lastTileCount = 0;
let continueAfterWin = false;

function getNewTileIds(state: GameState): Set<number> {
  const ids = new Set<number>();
  let count = 0;
  
  for (let row = 0; row < state.grid.size; row++) {
    for (let col = 0; col < state.grid.size; col++) {
      const tile = state.grid.cells[row][col];
      if (tile) count++;
    }
  }
  
  // If tile count increased, the newest tile is the one with highest id
  if (count > lastTileCount) {
    let maxId = 0;
    for (let row = 0; row < state.grid.size; row++) {
      for (let col = 0; col < state.grid.size; col++) {
        const tile = state.grid.cells[row][col];
        if (tile && tile.id > maxId) {
          maxId = tile.id;
        }
      }
    }
    ids.add(maxId);
  }
  
  lastTileCount = count;
  return ids;
}

function getMergedTileIds(state: GameState): Set<number> {
  const ids = new Set<number>();
  
  for (let row = 0; row < state.grid.size; row++) {
    for (let col = 0; col < state.grid.size; col++) {
      const tile = state.grid.cells[row][col];
      if (tile?.mergedFrom) {
        ids.add(tile.id);
      }
    }
  }
  
  return ids;
}

function render(): void {
  const newTileIds = getNewTileIds(gameState);
  const mergedTileIds = getMergedTileIds(gameState);
  
  renderGrid(gameState.grid, gridEl, newTileIds, mergedTileIds);
  renderScore(gameState.score, scoreEl);
  
  if (gameState.status === 'won' && !continueAfterWin) {
    showMessage(messageEl, messageTextEl, messageBtnEl, 'win');
  } else if (gameState.status === 'lost') {
    showMessage(messageEl, messageTextEl, messageBtnEl, 'lose');
  }
}

function handleMove(direction: Direction): void {
  if (gameState.status === 'lost') return;
  if (gameState.status === 'won' && !continueAfterWin) return;
  
  const newState = makeMove(gameState, direction);
  
  if (newState !== gameState) {
    gameState = newState;
    render();
  }
}

function startNewGame(): void {
  gameState = initGame();
  lastTileCount = 2;
  continueAfterWin = false;
  hideMessage(messageEl);
  render();
}

function handleMessageButton(): void {
  if (gameState.status === 'won') {
    // Continue playing after win
    continueAfterWin = true;
    hideMessage(messageEl);
  } else {
    // Start new game after loss
    startNewGame();
  }
}

// Initialize
function init(): void {
  initGrid(gridEl);
  startNewGame();
  
  // Set up input handlers
  setupKeyboardInput(handleMove);
  setupTouchInput(gridEl, handleMove);
  
  // Set up button handlers
  newGameBtn.addEventListener('click', startNewGame);
  messageBtnEl.addEventListener('click', handleMessageButton);
  
  // Re-render on window resize to update tile positions for responsive layout
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      render();
    }, 100);
  });
}

init();
