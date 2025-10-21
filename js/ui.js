/**
 * GridRush - UI Controller
 * Handles all DOM manipulation and rendering
 */

class UIController {
  constructor(game, dice, timer, ai, hints) {
    this.game = game;
    this.dice = dice;
    this.timer = timer;
    this.ai = ai;
    this.hints = hints;

    this.elements = {};
    this.currentScreen = 'start';
    this.isAIThinking = false;
  }

  /**
   * Initialize UI and attach event listeners
   */
  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.showScreen('start');
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    // Screens
    this.elements.startScreen = document.getElementById('start-screen');
    this.elements.gameScreen = document.getElementById('game-screen');
    this.elements.endScreen = document.getElementById('end-screen');

    // Game board
    this.elements.boardContainer = document.getElementById('board-container');

    // Controls
    this.elements.diceButton = document.getElementById('dice-button');
    this.elements.diceResult = document.getElementById('dice-result');

    // Status displays
    this.elements.currentPlayerDisplay = document.getElementById('current-player');
    this.elements.shotCounter = document.getElementById('shot-counter');
    this.elements.timerDisplay = document.getElementById('timer-display');
    this.elements.scoreDisplay = document.getElementById('score-display');
    this.elements.statusMessage = document.getElementById('status-message');
    this.elements.hintDisplay = document.getElementById('hint-display');

    // Buttons
    this.elements.playAIButton = document.getElementById('play-ai-btn');
    this.elements.playPlayerButton = document.getElementById('play-player-btn');
    this.elements.howToPlayButton = document.getElementById('how-to-play-btn');
    this.elements.rematchButton = document.getElementById('rematch-btn');
    this.elements.menuButton = document.getElementById('menu-btn');

    // End screen elements
    this.elements.endTitle = document.getElementById('end-title');
    this.elements.endMessage = document.getElementById('end-message');
    this.elements.endStats = document.getElementById('end-stats');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Start screen buttons
    if (this.elements.playAIButton) {
      this.elements.playAIButton.addEventListener('click', () => this.startGame(true));
    }
    if (this.elements.playPlayerButton) {
      this.elements.playPlayerButton.addEventListener('click', () => this.startGame(false));
    }
    if (this.elements.howToPlayButton) {
      this.elements.howToPlayButton.addEventListener('click', () => this.showHowToPlay());
    }

    // Game controls
    if (this.elements.diceButton) {
      this.elements.diceButton.addEventListener('click', () => this.handleDiceRoll());
    }

    // End screen buttons
    if (this.elements.rematchButton) {
      this.elements.rematchButton.addEventListener('click', () => this.startGame(this.game.vsAI));
    }
    if (this.elements.menuButton) {
      this.elements.menuButton.addEventListener('click', () => this.showScreen('start'));
    }
  }

  /**
   * Start a new game
   */
  startGame(vsAI = true) {
    this.game.startGame(vsAI);
    this.timer.reset();
    this.showScreen('game');
    this.renderBoard();
    this.updateAllDisplays();

    // Start timer
    this.timer.start();

    // Enable dice button
    this.enableDiceButton();
    this.setStatusMessage('Roll the dice to start!');
  }

  /**
   * Show different screens
   */
  showScreen(screen) {
    this.currentScreen = screen;

    // Hide all screens
    if (this.elements.startScreen) this.elements.startScreen.style.display = 'none';
    if (this.elements.gameScreen) this.elements.gameScreen.style.display = 'none';
    if (this.elements.endScreen) this.elements.endScreen.style.display = 'none';

    // Show requested screen
    if (screen === 'start' && this.elements.startScreen) {
      this.elements.startScreen.style.display = 'flex';
    } else if (screen === 'game' && this.elements.gameScreen) {
      this.elements.gameScreen.style.display = 'flex';
    } else if (screen === 'end' && this.elements.endScreen) {
      this.elements.endScreen.style.display = 'flex';
    }
  }

  /**
   * Render the game board
   */
  renderBoard() {
    if (!this.elements.boardContainer) return;

    this.elements.boardContainer.innerHTML = '';

    // Create 3x3 grid of sub-grids
    for (let subGrid = 0; subGrid < 9; subGrid++) {
      const subGridElement = this.createSubGrid(subGrid);
      this.elements.boardContainer.appendChild(subGridElement);
    }
  }

  /**
   * Create a sub-grid element
   */
  createSubGrid(subGridIndex) {
    const subGridDiv = document.createElement('div');
    subGridDiv.className = 'sub-grid';
    subGridDiv.dataset.subgrid = subGridIndex;

    // Check if this sub-grid is won
    const winner = this.game.subGridWinners[subGridIndex];
    if (winner !== null) {
      subGridDiv.classList.add('won');
      subGridDiv.classList.add(`won-by-p${winner}`);
    }

    // Check if this is the active sub-grid
    const validGrids = this.game.lastDiceRoll
      ? this.game.getValidSubGrids(this.game.lastDiceRoll)
      : [];

    if (validGrids.includes(subGridIndex)) {
      subGridDiv.classList.add('active');
    }

    // Create 9 cells
    for (let cell = 0; cell < 9; cell++) {
      const cellElement = this.createCell(subGridIndex, cell);
      subGridDiv.appendChild(cellElement);
    }

    // Add winner overlay if won
    if (winner !== null) {
      const overlay = document.createElement('div');
      overlay.className = 'winner-overlay';
      overlay.textContent = winner === 1 ? '🏎️' : '🏁';
      subGridDiv.appendChild(overlay);
    }

    return subGridDiv;
  }

  /**
   * Create a cell element
   */
  createCell(subGridIndex, cellIndex) {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell';
    cellDiv.dataset.subgrid = subGridIndex;
    cellDiv.dataset.cell = cellIndex;

    const cellValue = this.game.board[subGridIndex][cellIndex];

    if (cellValue === 1) {
      cellDiv.classList.add('player-1');
      cellDiv.textContent = '🏎️';
    } else if (cellValue === 2) {
      cellDiv.classList.add('player-2');
      cellDiv.textContent = '🏁';
    } else {
      // Empty cell - make it clickable if valid
      cellDiv.classList.add('empty');

      if (this.game.lastDiceRoll && this.game.isValidMove(subGridIndex, cellIndex, this.game.lastDiceRoll)) {
        cellDiv.classList.add('available');
        cellDiv.addEventListener('click', () => this.handleCellClick(subGridIndex, cellIndex));
      }
    }

    return cellDiv;
  }

  /**
   * Handle dice roll
   */
  handleDiceRoll() {
    if (this.game.gameStatus !== 'active') return;
    if (this.isAIThinking) return;

    // Roll the dice
    const roll = this.dice.roll();
    this.game.lastDiceRoll = roll;

    // Show dice animation
    this.animateDiceRoll(roll);

    // Update displays
    this.updateDiceDisplay(roll);
    this.renderBoard();

    // Generate and show hint
    this.showHint(roll);

    // Disable dice button until move is made
    this.disableDiceButton();

    // Update status
    const shotType = this.dice.getShotTypeName(roll);
    const description = this.dice.getShotTypeDescription(roll);
    this.setStatusMessage(`${shotType} - ${description}`);
  }

  /**
   * Handle cell click
   */
  async handleCellClick(subGridIndex, cellIndex) {
    if (this.game.gameStatus !== 'active') return;
    if (this.isAIThinking) return;
    if (!this.game.lastDiceRoll) return;

    // Make the move
    const success = this.game.makeMove(subGridIndex, cellIndex);

    if (success) {
      // Animate cell placement
      this.animateCellPlacement(subGridIndex, cellIndex);

      // Re-render board
      this.renderBoard();
      this.updateAllDisplays();

      // Check game status
      if (this.game.gameStatus === 'won') {
        this.handleGameEnd();
        return;
      } else if (this.game.gameStatus === 'tie') {
        this.handleGameEnd();
        return;
      }

      // If still in same player's turn, enable dice button
      if (this.game.currentShot <= 3 && this.game.currentPlayer === 1) {
        this.enableDiceButton();
        this.setStatusMessage(`Shot ${this.game.currentShot}/3 - Roll again!`);
      }
      // If turn switched and playing vs AI
      else if (this.game.vsAI && this.game.currentPlayer === this.ai.playerNumber) {
        await this.handleAITurn();
      }
      // If turn switched to player 1 or player 2 in local multiplayer
      else {
        this.enableDiceButton();
        this.setStatusMessage(`Player ${this.game.currentPlayer}'s turn - Roll the dice!`);
      }
    }
  }

  /**
   * Handle AI turn
   */
  async handleAITurn() {
    this.isAIThinking = true;
    this.setStatusMessage('AI is racing...');
    this.disableDiceButton();

    // AI completes all 3 shots
    for (let shot = 0; shot < 3; shot++) {
      if (this.game.gameStatus !== 'active') break;

      // AI rolls dice
      const roll = this.dice.roll();
      this.game.lastDiceRoll = roll;

      this.updateDiceDisplay(roll);
      this.setStatusMessage(`AI: ${this.dice.getShotTypeName(roll)} (${roll})`);

      await this.delay(400);

      // AI makes move
      const move = await this.ai.makeMove();

      if (move) {
        this.game.makeMove(move.subGrid, move.cell);
        this.renderBoard();
        this.updateAllDisplays();

        this.animateCellPlacement(move.subGrid, move.cell);

        await this.delay(400);

        // Check game status
        if (this.game.gameStatus === 'won' || this.game.gameStatus === 'tie') {
          this.handleGameEnd();
          this.isAIThinking = false;
          return;
        }
      }
    }

    this.isAIThinking = false;

    // Back to player's turn
    this.enableDiceButton();
    this.setStatusMessage('Your turn - Roll the dice!');
  }

  /**
   * Update all displays
   */
  updateAllDisplays() {
    this.updateScoreDisplay();
    this.updatePlayerDisplay();
    this.updateShotCounter();
    this.updateTimerDisplay();
  }

  /**
   * Update score display
   */
  updateScoreDisplay() {
    if (this.elements.scoreDisplay) {
      this.elements.scoreDisplay.textContent = `P1: ${this.game.score.player1} | P2: ${this.game.score.player2}`;
    }
  }

  /**
   * Update current player display
   */
  updatePlayerDisplay() {
    if (this.elements.currentPlayerDisplay) {
      const playerName = this.game.currentPlayer === 1 ? 'Player 1' : (this.game.vsAI ? 'AI' : 'Player 2');
      this.elements.currentPlayerDisplay.textContent = playerName;
      this.elements.currentPlayerDisplay.className = `player-${this.game.currentPlayer}`;
    }
  }

  /**
   * Update shot counter
   */
  updateShotCounter() {
    if (this.elements.shotCounter) {
      this.elements.shotCounter.textContent = `Shot ${this.game.currentShot}/3`;
    }
  }

  /**
   * Update timer display
   */
  updateTimerDisplay() {
    if (this.elements.timerDisplay) {
      const timeState = this.timer.getState();
      this.elements.timerDisplay.textContent = timeState.formatted;
      this.elements.timerDisplay.className = `timer ${timeState.color}`;

      // Show warning if present
      if (timeState.warning && this.elements.statusMessage) {
        this.setStatusMessage(`⚠️ ${timeState.warning}`);
      }
    }
  }

  /**
   * Update dice display
   */
  updateDiceDisplay(roll) {
    if (this.elements.diceResult) {
      const shotType = this.dice.getShotTypeName(roll);
      this.elements.diceResult.textContent = `${shotType} (${roll})`;
      this.elements.diceResult.className = 'dice-result visible';
    }
  }

  /**
   * Show hint
   */
  showHint(roll) {
    if (!this.hints.shouldShowHint()) {
      if (this.elements.hintDisplay) {
        this.elements.hintDisplay.style.display = 'none';
      }
      return;
    }

    const hint = this.hints.generateHint(roll);

    if (hint && this.elements.hintDisplay) {
      this.elements.hintDisplay.innerHTML = `
        <div class="hint-icon">${this.getHintIcon(hint.priority)}</div>
        <div class="hint-content">
          <div class="hint-message">${hint.message}</div>
          <div class="hint-advice">${hint.advice}</div>
        </div>
      `;
      this.elements.hintDisplay.className = `hint-display ${hint.priority}`;
      this.elements.hintDisplay.style.display = 'flex';
    }
  }

  /**
   * Get hint icon based on priority
   */
  getHintIcon(priority) {
    const icons = {
      critical: '🚨',
      high: '⚡',
      medium: '💡',
      low: '📊'
    };
    return icons[priority] || '💡';
  }

  /**
   * Set status message
   */
  setStatusMessage(message) {
    if (this.elements.statusMessage) {
      this.elements.statusMessage.textContent = message;
    }
  }

  /**
   * Enable/disable dice button
   */
  enableDiceButton() {
    if (this.elements.diceButton) {
      this.elements.diceButton.disabled = false;
      this.elements.diceButton.classList.remove('disabled');
    }
  }

  disableDiceButton() {
    if (this.elements.diceButton) {
      this.elements.diceButton.disabled = true;
      this.elements.diceButton.classList.add('disabled');
    }
  }

  /**
   * Handle game end
   */
  handleGameEnd() {
    this.timer.pause();
    this.disableDiceButton();

    setTimeout(() => {
      this.showEndScreen();
    }, 1500);
  }

  /**
   * Show end screen with results
   */
  showEndScreen() {
    const state = this.game.getState();

    // Set title
    let title = '';
    if (state.gameStatus === 'won') {
      const winnerName = state.winner === 1 ? 'Player 1' : (this.game.vsAI ? 'AI' : 'Player 2');
      title = `🏆 ${winnerName} WINS! 🏆`;
    } else if (state.gameStatus === 'tie') {
      title = '🤝 DRAW! 🤝';
    } else if (state.gameStatus === 'timeout') {
      if (state.winner) {
        const winnerName = state.winner === 1 ? 'Player 1' : (this.game.vsAI ? 'AI' : 'Player 2');
        title = `⏱️ ${winnerName} WINS ON TIME! ⏱️`;
      } else {
        title = '⏱️ TIME\'S UP - DRAW! ⏱️';
      }
    }

    if (this.elements.endTitle) {
      this.elements.endTitle.textContent = title;
    }

    // Set stats
    const stats = `
      <div class="stat-row">
        <span>Final Score:</span>
        <span>${state.score.player1} - ${state.score.player2}</span>
      </div>
      <div class="stat-row">
        <span>Time:</span>
        <span>${this.timer.formatTime()}</span>
      </div>
      <div class="stat-row">
        <span>Total Moves:</span>
        <span>${state.moveCount}</span>
      </div>
    `;

    if (this.elements.endStats) {
      this.elements.endStats.innerHTML = stats;
    }

    this.showScreen('end');
  }

  /**
   * Show how to play
   */
  showHowToPlay() {
    alert(`
🏁 GRIDRUSH - HOW TO PLAY 🏁

OBJECTIVE:
Win 3 sub-grids in a row to win the game!

DICE MOVES:
🎲 1-2: TEE SHOT - Stay in current grid
🎲 3-4: APPROACH - Move to adjacent grid
🎲 5-6: FINISH - Jump to any grid

GAMEPLAY:
• Each turn has 3 shots
• Roll dice before each shot
• Place your marker based on the roll
• First to get 3 sub-grids in a row wins!

⏱️ TIME LIMIT: 5 minutes
If time runs out, most sub-grids won wins!

Good luck! 🏎️
    `);
  }

  /**
   * Animate dice roll
   */
  animateDiceRoll(finalValue) {
    if (!this.elements.diceResult) return;

    this.elements.diceResult.classList.add('rolling');

    setTimeout(() => {
      this.elements.diceResult.classList.remove('rolling');
    }, 500);
  }

  /**
   * Animate cell placement
   */
  animateCellPlacement(subGrid, cell) {
    const cellElement = document.querySelector(
      `.cell[data-subgrid="${subGrid}"][data-cell="${cell}"]`
    );

    if (cellElement) {
      cellElement.classList.add('placed');
      setTimeout(() => {
        cellElement.classList.remove('placed');
      }, 600);
    }
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
}
