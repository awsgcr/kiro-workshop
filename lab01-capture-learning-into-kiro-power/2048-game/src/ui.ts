// UI Renderer module - handles DOM manipulation and visual updates

import { Grid } from './grid';

// Default values for desktop
const CELL_SIZE_DESKTOP = 100;
const CELL_GAP_DESKTOP = 10;
const GRID_PADDING_DESKTOP = 10;

// Values for mobile (max-width: 500px)
const CELL_SIZE_MOBILE = 70;
const CELL_GAP_MOBILE = 8;
const GRID_PADDING_MOBILE = 8;

const MOBILE_BREAKPOINT = 500;

function getGridDimensions(): { cellSize: number; cellGap: number; gridPadding: number } {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  return {
    cellSize: isMobile ? CELL_SIZE_MOBILE : CELL_SIZE_DESKTOP,
    cellGap: isMobile ? CELL_GAP_MOBILE : CELL_GAP_DESKTOP,
    gridPadding: isMobile ? GRID_PADDING_MOBILE : GRID_PADDING_DESKTOP,
  };
}

export function initGrid(container: HTMLElement): void {
  container.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    container.appendChild(cell);
  }
}

function getTilePosition(row: number, col: number): { x: number; y: number } {
  const { cellSize, cellGap, gridPadding } = getGridDimensions();
  return {
    x: gridPadding + col * (cellSize + cellGap),
    y: gridPadding + row * (cellSize + cellGap),
  };
}

function getTileClass(value: number): string {
  if (value <= 2048) {
    return `tile tile-${value}`;
  }
  return 'tile tile-super';
}

export function renderGrid(grid: Grid, container: HTMLElement, newTileIds: Set<number> = new Set(), mergedTileIds: Set<number> = new Set()): void {
  // Remove existing tiles
  const existingTiles = container.querySelectorAll('.tile');
  existingTiles.forEach(tile => tile.remove());
  
  // Add tiles
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      const tile = grid.cells[row][col];
      if (tile) {
        const tileEl = document.createElement('div');
        tileEl.className = getTileClass(tile.value);
        tileEl.textContent = String(tile.value);
        
        const pos = getTilePosition(row, col);
        tileEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        
        if (newTileIds.has(tile.id)) {
          tileEl.classList.add('tile-new');
        }
        if (mergedTileIds.has(tile.id)) {
          tileEl.classList.add('tile-merged');
        }
        
        container.appendChild(tileEl);
      }
    }
  }
}

export function renderScore(score: number, element: HTMLElement): void {
  element.textContent = String(score);
}

export function showMessage(messageEl: HTMLElement, textEl: HTMLElement, btnEl: HTMLElement, type: 'win' | 'lose'): void {
  messageEl.classList.remove('hidden');
  
  if (type === 'win') {
    textEl.textContent = 'You Win!';
    btnEl.textContent = 'Keep Playing';
  } else {
    textEl.textContent = 'Game Over!';
    btnEl.textContent = 'Try Again';
  }
}

export function hideMessage(messageEl: HTMLElement): void {
  messageEl.classList.add('hidden');
}
