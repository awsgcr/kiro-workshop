# Implementation Plan: 2048 Game

## Overview

Implement a browser-based 2048 game using TypeScript with vanilla HTML/CSS. The implementation follows a bottom-up approach: core data structures first, then game logic, then UI, and finally wiring everything together.

## Tasks

- [x] 1. Set up project structure and configuration
  - Create project directory structure
  - Initialize package.json with TypeScript and testing dependencies
  - Configure TypeScript (tsconfig.json)
  - Set up Vite for development and bundling
  - Configure fast-check for property-based testing
  - _Requirements: N/A (infrastructure)_

- [x] 2. Implement Grid module
  - [x] 2.1 Create Grid and Cell types and core operations
    - Define Cell, Tile, and Grid interfaces
    - Implement createGrid, getEmptyCells, getTileAt, setTileAt, cloneGrid
    - _Requirements: 1.1_

  - [x] 2.2 Write property test for grid operations
    - **Property 1: Initial game state (grid portion)**
    - Test that createGrid produces correct dimensions
    - **Validates: Requirements 1.2**

- [x] 3. Implement Tile operations module
  - [x] 3.1 Create tile spawning logic
    - Implement createTile function
    - Implement spawnRandomTile with 90/10 probability for 2/4
    - _Requirements: 1.2, 1.3_

  - [x] 3.2 Write property test for tile spawning
    - **Property 2: Spawned tile values**
    - Test that spawned tiles only have value 2 or 4
    - **Validates: Requirements 1.3**

  - [x] 3.3 Implement tile movement and merging
    - Implement processLine function (collapse, merge, pad)
    - Implement moveTiles for all four directions
    - Implement canMerge and mergeTiles functions
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.4 Write property tests for movement
    - **Property 3: Movement collapses to edge**
    - **Property 5: Invalid move preserves state**
    - Test tiles collapse with no gaps in movement direction
    - **Validates: Requirements 2.1, 2.2, 2.4**

  - [x] 3.5 Write property tests for merging
    - **Property 6: Merge doubles value**
    - **Property 8: Single merge per tile per move**
    - **Property 9: Merge direction priority**
    - Test merge produces doubled value, once per move, in correct order
    - **Validates: Requirements 3.1, 3.3, 3.4**

- [x] 4. Implement Game Controller module
  - [x] 4.1 Create game state management
    - Define GameState and GameStatus types
    - Implement initGame function
    - Implement makeMove function integrating movement and spawning
    - _Requirements: 1.2, 2.3, 4.1_

  - [x] 4.2 Write property test for game initialization
    - **Property 1: Initial game state**
    - Test new game has exactly 2 tiles and score of 0
    - **Validates: Requirements 1.2, 7.1, 7.2, 7.3**

  - [x] 4.3 Write property test for valid moves
    - **Property 4: Valid move spawns one tile**
    - **Property 7: Score increases by merged value**
    - Test valid moves spawn exactly one tile and score updates correctly
    - **Validates: Requirements 2.3, 3.2**

  - [x] 4.4 Implement win and game over detection
    - Implement checkWinCondition (tile >= 2048)
    - Implement checkGameOver (full grid, no adjacent matches)
    - Implement canMove helper
    - _Requirements: 5.1, 6.1_

  - [x] 4.5 Write property tests for win/game over
    - **Property 10: Win detection**
    - **Property 11: Game over detection**
    - Test win triggers at 2048, game over when no moves possible
    - **Validates: Requirements 5.1, 6.1**

- [x] 5. Checkpoint - Core logic complete
  - Ensure all core logic tests pass
  - Ask the user if questions arise

- [x] 6. Implement UI layer
  - [x] 6.1 Create HTML structure
    - Create index.html with game container, score display, new game button
    - Set up basic semantic structure
    - _Requirements: 4.3, 7.1_

  - [x] 6.2 Implement CSS styling
    - Style grid container and cells
    - Implement tile colors based on value
    - Add responsive layout
    - Create smooth transition animations for moves and merges
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 6.3 Implement UI Renderer
    - Implement renderGrid function
    - Implement renderScore function
    - Implement showMessage for win/lose states
    - Implement tile animations (move, merge, spawn)
    - _Requirements: 4.3, 5.1, 6.2_

- [x] 7. Implement Input Handler
  - [x] 7.1 Set up keyboard input
    - Implement setupKeyboardInput for arrow keys
    - Map arrow keys to directions
    - _Requirements: 2.1_

  - [x] 7.2 Set up touch input (optional)
    - Implement swipe detection for mobile
    - Map swipe directions to game directions
    - _Requirements: 2.1_

- [x] 8. Wire everything together
  - [x] 8.1 Create main application entry point
    - Initialize game state
    - Connect input handlers to game controller
    - Connect game state changes to UI renderer
    - Implement new game button handler
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 8.2 Write integration tests
    - Test full game flow: init → move → merge → win/lose
    - Test new game reset functionality
    - _Requirements: 1.2, 2.1, 3.1, 5.1, 6.1, 7.1_

- [x] 9. Final checkpoint
  - Ensure all tests pass
  - Verify game is playable in browser
  - Ask the user if questions arise

## Notes

- All tasks including property tests are required
- Core game logic (tasks 2-4) is fully testable without UI
- Property tests use fast-check library with minimum 100 iterations
- UI uses CSS transitions for smooth animations
