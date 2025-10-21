/**
 * GridRush - AI Opponent
 * Strategic decision-making for computer player
 */

class GridRushAI {
  constructor(game) {
    this.game = game;
    this.playerNumber = 2; // AI is player 2 by default
    this.opponentNumber = 1;
    this.thinkingDelay = 600; // ms - feels more human
  }

  /**
   * Make AI move (async to allow for thinking delay)
   */
  async makeMove() {
    // Simulate thinking
    await this.delay(this.thinkingDelay);

    const availableMoves = this.game.getAvailableMoves();
    if (availableMoves.length === 0) {
      return null;
    }

    // Choose best move using strategy
    const move = this.chooseBestMove(availableMoves);

    if (move) {
      return move;
    }

    // Fallback to random
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  /**
   * Choose the best move from available options
   */
  chooseBestMove(moves) {
    // Priority 1: Win a sub-grid
    let winMove = this.findWinningMove(moves);
    if (winMove) return winMove;

    // Priority 2: Block opponent from winning a sub-grid
    let blockMove = this.findBlockingMove(moves);
    if (blockMove) return blockMove;

    // Priority 3: Win the overall game
    let gameWinMove = this.findGameWinningMove(moves);
    if (gameWinMove) return gameWinMove;

    // Priority 4: Strategic positioning
    let strategicMove = this.findStrategicMove(moves);
    if (strategicMove) return strategicMove;

    // Priority 5: Control opponent's next position
    let controlMove = this.findControlMove(moves);
    if (controlMove) return controlMove;

    // Fallback: random from best positions
    return this.findBestPositionMove(moves);
  }

  /**
   * Find move that wins a sub-grid
   */
  findWinningMove(moves) {
    for (const move of moves) {
      if (this.wouldWinSubGrid(move, this.playerNumber)) {
        return move;
      }
    }
    return null;
  }

  /**
   * Find move that blocks opponent from winning
   */
  findBlockingMove(moves) {
    for (const move of moves) {
      if (this.wouldWinSubGrid(move, this.opponentNumber)) {
        return move;
      }
    }
    return null;
  }

  /**
   * Find move that wins the overall game
   */
  findGameWinningMove(moves) {
    for (const move of moves) {
      // Simulate the move
      const tempWinners = [...this.game.subGridWinners];

      // Check if this move would win the sub-grid
      if (this.wouldWinSubGrid(move, this.playerNumber)) {
        tempWinners[move.subGrid] = this.playerNumber;

        // Check if winning this sub-grid wins the game
        if (this.checkGameWinWithWinners(tempWinners, this.playerNumber)) {
          return move;
        }
      }
    }
    return null;
  }

  /**
   * Check if move would win a sub-grid for given player
   */
  wouldWinSubGrid(move, player) {
    // Create temporary board with the move
    const tempBoard = this.game.board[move.subGrid].map(c => c);
    tempBoard[move.cell] = player;

    // Check for win
    return this.checkSubGridWinOnBoard(tempBoard, player);
  }

  /**
   * Check if board configuration wins sub-grid
   */
  checkSubGridWinOnBoard(board, player) {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (board[row * 3] === player &&
          board[row * 3 + 1] === player &&
          board[row * 3 + 2] === player) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (board[col] === player &&
          board[col + 3] === player &&
          board[col + 6] === player) {
        return true;
      }
    }

    // Check diagonals
    if (board[0] === player && board[4] === player && board[8] === player) {
      return true;
    }
    if (board[2] === player && board[4] === player && board[6] === player) {
      return true;
    }

    return false;
  }

  /**
   * Check if winners array would win the game
   */
  checkGameWinWithWinners(winners, player) {
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
   * Find strategic positioning move
   */
  findStrategicMove(moves) {
    // Prefer moves that create multiple threats
    const scoredMoves = moves.map(move => ({
      move,
      score: this.evaluateMoveStrength(move)
    }));

    scoredMoves.sort((a, b) => b.score - a.score);

    if (scoredMoves.length > 0 && scoredMoves[0].score > 0) {
      return scoredMoves[0].move;
    }

    return null;
  }

  /**
   * Evaluate move strength (0-100)
   */
  evaluateMoveStrength(move) {
    let score = 0;

    // Prefer center cells
    if (move.cell === 4) score += 30;

    // Prefer corner cells
    if ([0, 2, 6, 8].includes(move.cell)) score += 20;

    // Prefer center sub-grid
    if (move.subGrid === 4) score += 15;

    // Prefer corner sub-grids
    if ([0, 2, 6, 8].includes(move.subGrid)) score += 10;

    // Check if move creates double threat (two ways to win)
    score += this.countThreatsCreated(move, this.playerNumber) * 25;

    return score;
  }

  /**
   * Count how many winning patterns this move contributes to
   */
  countThreatsCreated(move, player) {
    const tempBoard = this.game.board[move.subGrid].map(c => c);
    tempBoard[move.cell] = player;

    let threats = 0;

    // Count rows with 2 player marks and 1 empty
    for (let row = 0; row < 3; row++) {
      const cells = [row * 3, row * 3 + 1, row * 3 + 2];
      const playerCount = cells.filter(c => tempBoard[c] === player).length;
      const emptyCount = cells.filter(c => tempBoard[c] === 0).length;
      if (playerCount === 2 && emptyCount === 1) threats++;
    }

    // Count columns
    for (let col = 0; col < 3; col++) {
      const cells = [col, col + 3, col + 6];
      const playerCount = cells.filter(c => tempBoard[c] === player).length;
      const emptyCount = cells.filter(c => tempBoard[c] === 0).length;
      if (playerCount === 2 && emptyCount === 1) threats++;
    }

    // Count diagonals
    const diag1 = [0, 4, 8];
    const diag2 = [2, 4, 6];
    for (const diag of [diag1, diag2]) {
      const playerCount = diag.filter(c => tempBoard[c] === player).length;
      const emptyCount = diag.filter(c => tempBoard[c] === 0).length;
      if (playerCount === 2 && emptyCount === 1) threats++;
    }

    return threats;
  }

  /**
   * Find move that controls opponent's next position
   */
  findControlMove(moves) {
    // Prefer moves that send opponent to already won or unfavorable grids
    const goodMoves = moves.filter(move => {
      const nextGrid = move.cell;
      // Send to won grid (opponent can't play there)
      if (this.game.subGridWinners[nextGrid] !== null) {
        return true;
      }
      // Send to grid where we're ahead
      const ourCells = this.game.board[nextGrid].filter(c => c === this.playerNumber).length;
      const theirCells = this.game.board[nextGrid].filter(c => c === this.opponentNumber).length;
      return ourCells > theirCells;
    });

    if (goodMoves.length > 0) {
      return goodMoves[Math.floor(Math.random() * goodMoves.length)];
    }

    return null;
  }

  /**
   * Find best position move (prefer center and corners)
   */
  findBestPositionMove(moves) {
    // Prefer center cells
    const centerMoves = moves.filter(m => m.cell === 4);
    if (centerMoves.length > 0) {
      return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    }

    // Prefer corner cells
    const cornerMoves = moves.filter(m => [0, 2, 6, 8].includes(m.cell));
    if (cornerMoves.length > 0) {
      return cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
    }

    // Random from remaining
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set thinking delay
   */
  setThinkingDelay(ms) {
    this.thinkingDelay = ms;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GridRushAI;
}
