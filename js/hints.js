/**
 * GridRush - Adaptive Hints System
 * Provides strategic hints after player completes 3 moves
 */

class HintSystem {
  constructor(game) {
    this.game = game;
    this.enabled = true;
    this.minMovesBeforeHints = 9; // 3 full turns (9 shots)
    this.lastHint = null;
  }

  /**
   * Check if hints should be shown
   */
  shouldShowHint() {
    return this.enabled && this.game.moveCount >= this.minMovesBeforeHints;
  }

  /**
   * Generate hint for current game state
   */
  generateHint(diceRoll = null) {
    if (!this.shouldShowHint()) {
      return null;
    }

    const player = this.game.currentPlayer;
    const opponent = player === 1 ? 2 : 1;

    // Analyze game state
    const analysis = this.analyzeGameState(player, opponent);

    // Generate hint based on analysis
    let hint = null;

    // Priority 1: Can win the game
    if (analysis.canWinGame) {
      hint = this.generateGameWinHint(analysis);
    }
    // Priority 2: Opponent can win - defend
    else if (analysis.opponentCanWinGame) {
      hint = this.generateDefenseHint(analysis);
    }
    // Priority 3: Can win a sub-grid
    else if (analysis.canWinSubGrid.length > 0) {
      hint = this.generateSubGridWinHint(analysis, diceRoll);
    }
    // Priority 4: Opponent threatening sub-grid
    else if (analysis.opponentThreats.length > 0) {
      hint = this.generateBlockHint(analysis);
    }
    // Priority 5: Strategic positioning
    else {
      hint = this.generateStrategyHint(analysis, diceRoll);
    }

    this.lastHint = hint;
    return hint;
  }

  /**
   * Analyze current game state
   */
  analyzeGameState(player, opponent) {
    const analysis = {
      playerScore: this.game.score[`player${player}`],
      opponentScore: this.game.score[`player${opponent}`],
      canWinGame: false,
      opponentCanWinGame: false,
      canWinSubGrid: [],
      opponentThreats: [],
      controlAdvantage: 0
    };

    // Check if player can win game
    analysis.canWinGame = this.canWinGame(player);
    analysis.opponentCanWinGame = this.canWinGame(opponent);

    // Find sub-grids player can win
    for (let g = 0; g < 9; g++) {
      if (this.game.subGridWinners[g] === null) {
        if (this.canWinSubGridIn(g, player, 1)) {
          analysis.canWinSubGrid.push({ grid: g, moves: 1 });
        } else if (this.canWinSubGridIn(g, player, 2)) {
          analysis.canWinSubGrid.push({ grid: g, moves: 2 });
        }
      }
    }

    // Find opponent threats
    for (let g = 0; g < 9; g++) {
      if (this.game.subGridWinners[g] === null) {
        if (this.canWinSubGridIn(g, opponent, 1)) {
          analysis.opponentThreats.push({ grid: g, moves: 1, urgent: true });
        } else if (this.canWinSubGridIn(g, opponent, 2)) {
          analysis.opponentThreats.push({ grid: g, moves: 2, urgent: false });
        }
      }
    }

    // Calculate control advantage (difference in sub-grids won)
    analysis.controlAdvantage = analysis.playerScore - analysis.opponentScore;

    return analysis;
  }

  /**
   * Check if player can win the game
   */
  canWinGame(player) {
    const winners = [...this.game.subGridWinners];

    // Check if player can complete a line
    for (let g = 0; g < 9; g++) {
      if (winners[g] === null) {
        winners[g] = player;
        if (this.checkGameWinWithWinners(winners, player)) {
          return true;
        }
        winners[g] = null;
      }
    }

    return false;
  }

  /**
   * Check if player can win sub-grid in N moves
   */
  canWinSubGridIn(gridIndex, player, maxMoves) {
    const grid = this.game.board[gridIndex];

    // For 1 move: check if there's a winning move
    if (maxMoves === 1) {
      for (let cell = 0; cell < 9; cell++) {
        if (grid[cell] === 0) {
          const tempGrid = [...grid];
          tempGrid[cell] = player;
          if (this.checkSubGridWinOnBoard(tempGrid, player)) {
            return true;
          }
        }
      }
    }

    // For 2 moves: check if there are 2 in a row with 2 empty
    if (maxMoves === 2) {
      const patterns = this.getWinningPatterns();
      for (const pattern of patterns) {
        const playerCount = pattern.filter(i => grid[i] === player).length;
        const emptyCount = pattern.filter(i => grid[i] === 0).length;
        const opponentCount = pattern.filter(i => grid[i] !== 0 && grid[i] !== player).length;

        if (playerCount === 1 && emptyCount === 2 && opponentCount === 0) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all winning patterns (rows, cols, diagonals)
   */
  getWinningPatterns() {
    return [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
  }

  /**
   * Check win on board
   */
  checkSubGridWinOnBoard(board, player) {
    for (const pattern of this.getWinningPatterns()) {
      if (pattern.every(i => board[i] === player)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check game win with winners array
   */
  checkGameWinWithWinners(winners, player) {
    for (const pattern of this.getWinningPatterns()) {
      if (pattern.every(i => winners[i] === player)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generate game-winning hint
   */
  generateGameWinHint(analysis) {
    return {
      type: 'game_win',
      priority: 'critical',
      message: '🏆 ONE MOVE FROM VICTORY! Complete the winning line!',
      advice: 'Focus on winning the sub-grid that completes your 3-in-a-row!',
      probability: 100
    };
  }

  /**
   * Generate defense hint
   */
  generateDefenseHint(analysis) {
    return {
      type: 'defense',
      priority: 'critical',
      message: '🚨 OPPONENT THREATENING VICTORY! Block their winning move!',
      advice: 'Prevent opponent from completing their 3-in-a-row of sub-grids!',
      probability: 90
    };
  }

  /**
   * Generate sub-grid win hint
   */
  generateSubGridWinHint(analysis, diceRoll) {
    const threat = analysis.canWinSubGrid[0];
    const gridName = this.getGridName(threat.grid);

    if (threat.moves === 1) {
      return {
        type: 'sub_grid_win',
        priority: 'high',
        message: `🏁 One move away from claiming ${gridName}!`,
        advice: `Complete the 3-in-a-row in Grid ${threat.grid + 1}`,
        probability: this.calculateProbability(diceRoll, threat.grid)
      };
    } else {
      return {
        type: 'sub_grid_setup',
        priority: 'medium',
        message: `⛳ ${gridName} is within reach!`,
        advice: `Two moves to victory in Grid ${threat.grid + 1}`,
        probability: this.calculateProbability(diceRoll, threat.grid)
      };
    }
  }

  /**
   * Generate blocking hint
   */
  generateBlockHint(analysis) {
    const threat = analysis.opponentThreats[0];
    const gridName = this.getGridName(threat.grid);

    if (threat.urgent) {
      return {
        type: 'block',
        priority: 'high',
        message: `🛡️ Block opponent in ${gridName}!`,
        advice: `Opponent is one move from claiming Grid ${threat.grid + 1}`,
        probability: 75
      };
    } else {
      return {
        type: 'block_setup',
        priority: 'medium',
        message: `⚠️ Opponent threatening ${gridName}`,
        advice: `Watch Grid ${threat.grid + 1} - opponent building threat`,
        probability: 50
      };
    }
  }

  /**
   * Generate strategy hint
   */
  generateStrategyHint(analysis, diceRoll) {
    const hints = [];

    // Center control
    if (this.game.subGridWinners[4] === null) {
      hints.push({
        type: 'strategy',
        priority: 'low',
        message: '🎯 Center grid gives maximum control',
        advice: 'Grid 5 (center) offers the most strategic options',
        probability: 33
      });
    }

    // Score advantage/disadvantage
    if (analysis.controlAdvantage > 0) {
      hints.push({
        type: 'strategy',
        priority: 'low',
        message: `🏎️ You're leading ${analysis.playerScore}-${analysis.opponentScore}!`,
        advice: 'Maintain control and force opponent into bad positions',
        probability: 60
      });
    } else if (analysis.controlAdvantage < 0) {
      hints.push({
        type: 'strategy',
        priority: 'medium',
        message: `⚡ Behind ${analysis.opponentScore}-${analysis.playerScore} - push hard!`,
        advice: 'Take risks and create multiple threats',
        probability: 40
      });
    }

    // Dice-based advice
    if (diceRoll >= 5) {
      hints.push({
        type: 'strategy',
        priority: 'low',
        message: '🏁 FINISH roll - jump to best position!',
        advice: 'Use this freedom to take center or corner grids',
        probability: 100
      });
    }

    return hints[Math.floor(Math.random() * hints.length)] || {
      type: 'strategy',
      priority: 'low',
      message: '🏎️ Focus on corner positions for dual threats',
      advice: 'Corner cells create multiple winning patterns',
      probability: 50
    };
  }

  /**
   * Get grid name (position description)
   */
  getGridName(gridIndex) {
    const names = [
      'Top-Left', 'Top-Center', 'Top-Right',
      'Middle-Left', 'Center', 'Middle-Right',
      'Bottom-Left', 'Bottom-Center', 'Bottom-Right'
    ];
    return names[gridIndex];
  }

  /**
   * Calculate probability of reaching grid with dice roll
   */
  calculateProbability(diceRoll, targetGrid) {
    if (!diceRoll || this.game.activeSubGrid === null) {
      return 50;
    }

    const validGrids = this.game.getValidSubGrids(diceRoll);

    if (validGrids.includes(targetGrid)) {
      return 100;
    } else if (diceRoll >= 5) {
      // FINISH - can reach any grid
      return 100;
    } else if (diceRoll >= 3) {
      // APPROACH - check if target is adjacent
      const adjacent = this.game.getAdjacentSubGrids(this.game.activeSubGrid);
      return adjacent.includes(targetGrid) ? 67 : 33;
    } else {
      // TEE SHOT - can only stay
      return targetGrid === this.game.activeSubGrid ? 100 : 33;
    }
  }

  /**
   * Format hint for display
   */
  formatHint(hint) {
    if (!hint) return '';

    let formatted = `${hint.message}\n${hint.advice}`;

    if (hint.probability !== undefined) {
      formatted += `\nChance: ${hint.probability}%`;
    }

    return formatted;
  }

  /**
   * Enable/disable hints
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Set minimum moves before hints
   */
  setMinMoves(moves) {
    this.minMovesBeforeHints = moves;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HintSystem;
}
