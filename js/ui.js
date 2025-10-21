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
    this.pendingGameMode = null; // Store which game mode was selected
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
    this.elements.positionDisplay = document.getElementById('position-display');
    this.elements.positionValue = document.getElementById('position-value');
    this.elements.statusMessage = document.getElementById('status-message');
    this.elements.hintDisplay = document.getElementById('hint-display');

    // Buttons
    this.elements.playAIButton = document.getElementById('play-ai-btn');
    this.elements.playPlayerButton = document.getElementById('play-player-btn');
    this.elements.rematchButton = document.getElementById('rematch-btn');
    this.elements.menuButton = document.getElementById('menu-btn');

    // End screen elements
    this.elements.endTitle = document.getElementById('end-title');
    this.elements.endMessage = document.getElementById('end-message');
    this.elements.endStats = document.getElementById('end-stats');

    // Instructions modal elements
    this.elements.instructionsModal = document.getElementById('instructions-modal');
    this.elements.closeInstructionsButton = document.getElementById('close-instructions-btn');
    this.elements.startPlayingButton = document.getElementById('start-playing-btn');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Start screen buttons - show instructions first
    if (this.elements.playAIButton) {
      this.elements.playAIButton.addEventListener('click', () => {
        this.pendingGameMode = true; // AI mode
        this.showHowToPlay();
      });
    }
    if (this.elements.playPlayerButton) {
      this.elements.playPlayerButton.addEventListener('click', () => {
        this.pendingGameMode = false; // Player mode
        this.showHowToPlay();
      });
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

    // Instructions modal buttons
    if (this.elements.closeInstructionsButton) {
      this.elements.closeInstructionsButton.addEventListener('click', () => {
        this.hideInstructions();
        // Start the game with the pending mode if one was selected
        if (this.pendingGameMode !== null) {
          this.startGame(this.pendingGameMode);
          this.pendingGameMode = null;
        }
      });
    }
    if (this.elements.startPlayingButton) {
      this.elements.startPlayingButton.addEventListener('click', () => {
        this.hideInstructions();
        // Start the game with the pending mode if one was selected
        if (this.pendingGameMode !== null) {
          this.startGame(this.pendingGameMode);
          this.pendingGameMode = null;
        }
      });
    }

    // Close modal when clicking outside
    if (this.elements.instructionsModal) {
      this.elements.instructionsModal.addEventListener('click', (e) => {
        if (e.target === this.elements.instructionsModal) {
          this.hideInstructions();
          // Start the game with the pending mode if one was selected
          if (this.pendingGameMode !== null) {
            this.startGame(this.pendingGameMode);
            this.pendingGameMode = null;
          }
        }
      });
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

    // Show green flag - race is on!
    this.showRacingFlag('green', 3000);

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
    this.updatePositionDisplay();
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
   * Update position display (racing positions)
   */
  updatePositionDisplay() {
    if (this.elements.positionValue) {
      const p1Score = this.game.score.player1;
      const p2Score = this.game.score.player2;

      let positionText = '';

      if (p1Score > p2Score) {
        positionText = '🏎️ 1ST | 🏁 2ND';
      } else if (p2Score > p1Score) {
        positionText = '🏁 1ST | 🏎️ 2ND';
      } else {
        positionText = '🏎️ TIED | 🏁 TIED';
      }

      // Add flip animation if position changed
      if (this.elements.positionValue.textContent !== positionText) {
        this.elements.positionValue.classList.add('updated');
        setTimeout(() => {
          this.elements.positionValue.classList.remove('updated');
        }, 600);
      }

      this.elements.positionValue.textContent = positionText;
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

    // Show checkered flag - race is over!
    this.showRacingFlag('checkered', 3000);

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
   * Show how to play modal
   */
  showHowToPlay() {
    if (this.elements.instructionsModal) {
      this.elements.instructionsModal.style.display = 'flex';
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide instructions modal
   */
  hideInstructions() {
    if (this.elements.instructionsModal) {
      this.elements.instructionsModal.style.display = 'none';
      // Restore body scroll
      document.body.style.overflow = '';
    }
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
   * Animate cell placement with car driving in
   */
  animateCellPlacement(subGrid, cell) {
    const cellElement = document.querySelector(
      `.cell[data-subgrid="${subGrid}"][data-cell="${cell}"]`
    );

    if (cellElement) {
      // Calculate starting position for car animation
      const startPos = this.calculateCarStartPosition(subGrid, cell);
      cellElement.style.setProperty('--start-x', startPos.x);
      cellElement.style.setProperty('--start-y', startPos.y);

      // Add car arrival animation
      cellElement.classList.add('car-arriving');

      // Also add the placed class for backwards compatibility
      setTimeout(() => {
        cellElement.classList.add('placed');
      }, 300);

      // Clean up animation classes
      setTimeout(() => {
        cellElement.classList.remove('car-arriving', 'placed');
      }, 800);
    }
  }

  /**
   * Calculate where the car should start from (off-board position)
   */
  calculateCarStartPosition(subGrid, cell) {
    // Determine general direction based on sub-grid position
    const gridRow = Math.floor(subGrid / 3);
    const gridCol = subGrid % 3;

    // Calculate offset based on which edge is closest
    let x = '0px';
    let y = '0px';

    // Start from different edges based on grid position
    if (gridRow === 0) {
      y = '-200px'; // Come from top
    } else if (gridRow === 2) {
      y = '200px'; // Come from bottom
    }

    if (gridCol === 0) {
      x = '-200px'; // Come from left
    } else if (gridCol === 2) {
      x = '200px'; // Come from right
    }

    // Center grids come from diagonal
    if (gridRow === 1 && gridCol === 1) {
      x = '-150px';
      y = '-150px';
    }

    return { x, y };
  }

  /**
   * Show racing flag indicator
   */
  showRacingFlag(flagType, duration = 2000) {
    const racingFlagsContainer = document.getElementById('racing-flags');
    if (!racingFlagsContainer) return;

    const flagEmojis = {
      checkered: '🏁',
      green: '🟢',
      yellow: '🟡',
      red: '🚩'
    };

    const flag = document.createElement('span');
    flag.className = `flag-indicator ${flagType}`;
    flag.textContent = flagEmojis[flagType] || '🏁';

    racingFlagsContainer.innerHTML = '';
    racingFlagsContainer.appendChild(flag);

    if (duration > 0) {
      setTimeout(() => {
        if (flag.parentElement === racingFlagsContainer) {
          racingFlagsContainer.innerHTML = '';
        }
      }, duration);
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
