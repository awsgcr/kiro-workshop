// Input Handler module - captures and processes user input

import { Direction } from './tile';

export type InputCallback = (direction: Direction) => void;

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

export function setupKeyboardInput(callback: InputCallback): () => void {
  const handler = (e: KeyboardEvent) => {
    const direction = KEY_MAP[e.key];
    if (direction) {
      e.preventDefault();
      callback(direction);
    }
  };
  
  document.addEventListener('keydown', handler);
  
  // Return cleanup function
  return () => document.removeEventListener('keydown', handler);
}

export function setupTouchInput(element: HTMLElement, callback: InputCallback): () => void {
  let startX = 0;
  let startY = 0;
  const SWIPE_THRESHOLD = 50;
  
  const touchStartHandler = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };
  
  const touchEndHandler = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (Math.max(absDeltaX, absDeltaY) < SWIPE_THRESHOLD) {
      return;
    }
    
    let direction: Direction;
    
    if (absDeltaX > absDeltaY) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    callback(direction);
  };
  
  element.addEventListener('touchstart', touchStartHandler);
  element.addEventListener('touchend', touchEndHandler);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', touchStartHandler);
    element.removeEventListener('touchend', touchEndHandler);
  };
}
