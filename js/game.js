/**
 * GridRush - Core Game Logic
 * Ultimate Tic-Tac-Toe with Racing Theme
 */

class GridRushGame {
  constructor() {
    this.reset();
  }

  reset() {
    // Board: 9 sub-grids, each with 9 cells
    // 0 = empty, 1 = player 1, 2 = player 2
    this.board = Array(9).fill(null).map(() => Array(9).fill(0));

    // Track which player won each sub-grid (null = not won)
    this.subGridWinners = Array(9).fill(null);

    // Game state
    this.currentPlayer = 1;
    this.activeSubGrid = null; // null means can choose any
    this.currentShot = 1; // 1, 2, or 3
    this.lastDiceRoll = null;
    this.moveCount = 0;

    // Timer: 300 seconds = 5 minutes
    this.timeRemaining = 300;
    this.timerActive = false;

    // Game status
    this.gameStatus = 'not_started'; // 'not_started', 'active', 'won', 'tie', 'timeout'
    this.winner = null;

    // Score tracking (sub-grids won)
    this.score = { player1: 0, player2: 0 };

    // Game mode
    this.vsAI = true;
    this.aiPlayer = 2;
  }

  /**
   * Start the game
   */
  startGame(vsAI = true) {
    this.reset();
    this.vsAI = vsAI;
    this.gameStatus = 'active';
    this.timerActive = true;
  }

  /**
   * Check if a position is valid (3x3 grid index)
   */
  isValidPosition(pos) {
    return pos >= 0 && pos <= 8;
  }

  /**
   * Check if a cell is available in a sub-grid
   */
  isCellAvailable(subGrid, cell) {
    if (!this.isValidPosition(subGrid) || !this.isValidPosition(cell)) {
      return false;
    }

    // Can't play in a won sub-grid
    if (this.subGridWinners[subGrid] !== null) {
      return false;
    }

    // Check if cell is empty
    return this.board[subGrid][cell] === 0;
  }

  /**
   * Get valid sub-grids based on dice roll
   * Returns array of valid sub-grid indices
   */
  getValidSubGrids(diceRoll) {
    const validGrids = [];

    if (diceRoll >= 1 && diceRoll <= 2) {
      // TEE SHOT: Stay in current sub-grid
      if (this.activeSubGrid !== null) {
        validGrids.push(this.activeSubGrid);
      }
    } else if (diceRoll >= 3 && diceRoll <= 4) {
      // APPROACH: Move to adjacent sub-grid
      if (this.activeSubGrid !== null) {
        const adjacent = this.getAdjacentSubGrids(this.activeSubGrid);
        validGrids.push(...adjacent);
      }
    } else if (diceRoll >= 5 && diceRoll <= 6) {
      // FINISH: Jump to any sub-grid
      for (let i = 0; i < 9; i++) {
        if (this.subGridWinners[i] === null) {
          validGrids.push(i);
        }
      }
    }

    // If no valid grids (all won), allow any unwon grid
    if (validGrids.length === 0) {
      for (let i = 0; i < 9; i++) {
        if (this.subGridWinners[i] === null) {
          validGrids.push(i);
        }
      }
    }

    return validGrids;
  }

  /**
   * Get adjacent sub-grids (share an edge, not diagonal)
   * Grid layout:
   * 0 1 2
   * 3 4 5
   * 6 7 8
   */
  getAdjacentSubGrids(gridIndex) {
    const adjacency = {
      0: [1, 3],
      1: [0, 2, 4],
      2: [1, 5],
      3: [0, 4, 6],
      4: [1, 3, 5, 7],
      5: [2, 4, 8],
      6: [3, 7],
      7: [4, 6, 8],
      8: [5, 7]
    };

    // Filter out won grids
    return adjacency[gridIndex].filter(grid => this.subGridWinners[grid] === null);
  }

  /**
   * Check if a move is valid
   */
  isValidMove(subGrid, cell, diceRoll) {
    // Check if game is active
    if (this.gameStatus !== 'active') {
      return false;
    }

    // Check if cell is available
    if (!this.isCellAvailable(subGrid, cell)) {
      return false;
    }

    // Check if sub-grid is valid based on dice roll
    const validGrids = this.getValidSubGrids(diceRoll);
    if (!validGrids.includes(subGrid)) {
      return false;
    }

    return true;
  }

  /**
   * Make a move
   */
  makeMove(subGrid, cell) {
    if (!this.isValidMove(subGrid, cell, this.lastDiceRoll)) {
      return false;
    }

    // Place the marker
    this.board[subGrid][cell] = this.currentPlayer;
    this.moveCount++;

    // Check if this move won the sub-grid
    if (this.checkSubGridWin(subGrid)) {
      this.subGridWinners[subGrid] = this.currentPlayer;
      this.updateScore();

      // Check if this won the game
      if (this.checkGameWin()) {
        this.gameStatus = 'won';
        this.winner = this.currentPlayer;
        this.timerActive = false;
        return true;
      }
    }

    // Check for tie (all sub-grids won or full)
    if (this.checkGameTie()) {
      this.gameStatus = 'tie';
      this.timerActive = false;
      return true;
    }

    // Update active sub-grid for next player's turn
    // The cell index becomes the next active sub-grid
    // But if that sub-grid is won, player can choose any grid
    this.activeSubGrid = this.subGridWinners[cell] === null ? cell : null;

    // Increment shot counter
    this.currentShot++;

    // If completed 3 shots, switch player
    if (this.currentShot > 3) {
      this.currentShot = 1;
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      this.lastDiceRoll = null; // Reset dice for new turn
    }

    return true;
  }

  /**
   * Check if a player won a sub-grid
   */
  checkSubGridWin(subGrid) {
    const grid = this.board[subGrid];
    const player = this.currentPlayer;

    // Check rows
    for (let row = 0; row < 3; row++) {
      if (grid[row * 3] === player &&
          grid[row * 3 + 1] === player &&
          grid[row * 3 + 2] === player) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (grid[col] === player &&
          grid[col + 3] === player &&
          grid[col + 6] === player) {
        return true;
      }
    }

    // Check diagonals
    if (grid[0] === player && grid[4] === player && grid[8] === player) {
      return true;
    }
    if (grid[2] === player && grid[4] === player && grid[6] === player) {
      return true;
    }

    return false;
  }

  /**
   * Check if a player won the overall game
   */
  checkGameWin() {
    const winners = this.subGridWinners;
    const player = this.currentPlayer;

    // Check rows
    for (let row = 0; row < 3; row++) {
      if (winners[row * 3] === player &&
          winners[row * 3 + 1] === player &&
          winners[row * 3 + 2] === player) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (winners[col] === player &&
          winners[col + 3] === player &&
          winners[col + 6] === player) {
        return true;
      }
    }

    // Check diagonals
    if (winners[0] === player && winners[4] === player && winners[8] === player) {
      return true;
    }
    if (winners[2] === player && winners[4] === player && winners[6] === player) {
      return true;
    }

    return false;
  }

  /**
   * Check if the game is a tie (all sub-grids decided)
   */
  checkGameTie() {
    return this.subGridWinners.every(winner => winner !== null);
  }

  /**
   * Update score based on sub-grids won
   */
  updateScore() {
    this.score.player1 = this.subGridWinners.filter(w => w === 1).length;
    this.score.player2 = this.subGridWinners.filter(w => w === 2).length;
  }

  /**
   * Handle timeout - determine winner by score
   */
  handleTimeout() {
    this.gameStatus = 'timeout';
    this.timerActive = false;

    // Winner is whoever has more sub-grids
    if (this.score.player1 > this.score.player2) {
      this.winner = 1;
    } else if (this.score.player2 > this.score.player1) {
      this.winner = 2;
    } else {
      // If tied on sub-grids, count total cells
      let p1Cells = 0, p2Cells = 0;
      for (let g = 0; g < 9; g++) {
        for (let c = 0; c < 9; c++) {
          if (this.board[g][c] === 1) p1Cells++;
          if (this.board[g][c] === 2) p2Cells++;
        }
      }

      if (p1Cells > p2Cells) {
        this.winner = 1;
      } else if (p2Cells > p1Cells) {
        this.winner = 2;
      } else {
        this.winner = null; // True tie
      }
    }
  }

  /**
   * Get available cells in a sub-grid
   */
  getAvailableCells(subGrid) {
    const cells = [];
    if (this.subGridWinners[subGrid] !== null) {
      return cells;
    }

    for (let i = 0; i < 9; i++) {
      if (this.board[subGrid][i] === 0) {
        cells.push(i);
      }
    }
    return cells;
  }

  /**
   * Get all available moves for current dice roll
   */
  getAvailableMoves() {
    const moves = [];
    const validGrids = this.getValidSubGrids(this.lastDiceRoll);

    for (const grid of validGrids) {
      const cells = this.getAvailableCells(grid);
      for (const cell of cells) {
        moves.push({ subGrid: grid, cell: cell });
      }
    }

    return moves;
  }

  /**
   * Get game state summary
   */
  getState() {
    return {
      board: this.board,
      subGridWinners: this.subGridWinners,
      currentPlayer: this.currentPlayer,
      activeSubGrid: this.activeSubGrid,
      currentShot: this.currentShot,
      lastDiceRoll: this.lastDiceRoll,
      moveCount: this.moveCount,
      timeRemaining: this.timeRemaining,
      gameStatus: this.gameStatus,
      winner: this.winner,
      score: this.score
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GridRushGame;
}
