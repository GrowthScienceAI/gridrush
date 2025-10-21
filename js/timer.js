/**
 * GridRush - Timer System
 * 5-minute countdown with warnings
 */

class GameTimer {
  constructor(onTick, onTimeout) {
    this.duration = 300; // 5 minutes in seconds
    this.timeRemaining = this.duration;
    this.isActive = false;
    this.intervalId = null;
    this.onTick = onTick || (() => {});
    this.onTimeout = onTimeout || (() => {});
    this.warnings = {
      60: false,  // 1 minute
      30: false,  // 30 seconds
      10: false   // 10 seconds
    };
  }

  /**
   * Start the timer
   */
  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Pause the timer
   */
  pause() {
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reset the timer
   */
  reset() {
    this.pause();
    this.timeRemaining = this.duration;
    this.warnings = {
      60: false,
      30: false,
      10: false
    };
  }

  /**
   * Tick - called every second
   */
  tick() {
    if (!this.isActive) return;

    this.timeRemaining--;

    // Check for warnings
    this.checkWarnings();

    // Call tick callback
    this.onTick(this.timeRemaining);

    // Check for timeout
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.pause();
      this.onTimeout();
    }
  }

  /**
   * Check if warnings should be triggered
   */
  checkWarnings() {
    for (const [threshold, triggered] of Object.entries(this.warnings)) {
      const time = parseInt(threshold);
      if (!triggered && this.timeRemaining === time) {
        this.warnings[time] = true;
        this.triggerWarning(time);
      }
    }
  }

  /**
   * Trigger a warning
   */
  triggerWarning(threshold) {
    // Can be overridden or listened to
    if (threshold === 60) {
      console.log('⚠️ 1 MINUTE REMAINING!');
    } else if (threshold === 30) {
      console.log('⚠️ 30 SECONDS - FINAL LAP!');
    } else if (threshold === 10) {
      console.log('⚠️ 10 SECONDS!');
    }
  }

  /**
   * Format time as MM:SS
   */
  formatTime(seconds = this.timeRemaining) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get time color based on remaining time
   */
  getTimeColor(seconds = this.timeRemaining) {
    if (seconds > 180) return 'green';   // > 3 minutes
    if (seconds > 60) return 'yellow';   // > 1 minute
    if (seconds > 10) return 'red';      // > 10 seconds
    return 'flash-red';                   // <= 10 seconds
  }

  /**
   * Get warning message for current time
   */
  getWarningMessage() {
    if (this.timeRemaining === 60) {
      return '1 MINUTE REMAINING!';
    } else if (this.timeRemaining === 30) {
      return '30 SECONDS - FINAL LAP!';
    } else if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
      return `${this.timeRemaining} SECONDS!`;
    }
    return null;
  }

  /**
   * Set custom duration
   */
  setDuration(seconds) {
    this.duration = seconds;
    this.timeRemaining = seconds;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      timeRemaining: this.timeRemaining,
      isActive: this.isActive,
      formatted: this.formatTime(),
      color: this.getTimeColor(),
      warning: this.getWarningMessage()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameTimer;
}
