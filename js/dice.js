/**
 * GridRush - Dice Mechanics
 * Handles dice rolling and shot type determination
 */

class DiceController {
  constructor() {
    this.lastRoll = null;
  }

  /**
   * Roll the dice (1-6)
   */
  roll() {
    this.lastRoll = Math.floor(Math.random() * 6) + 1;
    return this.lastRoll;
  }

  /**
   * Get shot type based on dice roll
   * 1-2: TEE SHOT (stay in current grid)
   * 3-4: APPROACH (move to adjacent grid)
   * 5-6: FINISH (jump to any grid)
   */
  getShotType(roll = this.lastRoll) {
    if (roll >= 1 && roll <= 2) {
      return 'TEE_SHOT';
    } else if (roll >= 3 && roll <= 4) {
      return 'APPROACH';
    } else if (roll >= 5 && roll <= 6) {
      return 'FINISH';
    }
    return null;
  }

  /**
   * Get shot type display name
   */
  getShotTypeName(roll = this.lastRoll) {
    const type = this.getShotType(roll);
    const names = {
      'TEE_SHOT': 'TEE SHOT',
      'APPROACH': 'APPROACH',
      'FINISH': 'FINISH'
    };
    return names[type] || '';
  }

  /**
   * Get shot type description
   */
  getShotTypeDescription(roll = this.lastRoll) {
    const type = this.getShotType(roll);
    const descriptions = {
      'TEE_SHOT': 'Stay in current grid',
      'APPROACH': 'Move to adjacent grid',
      'FINISH': 'Jump to any grid'
    };
    return descriptions[type] || '';
  }

  /**
   * Get shot type with emoji
   */
  getShotTypeEmoji(roll = this.lastRoll) {
    const type = this.getShotType(roll);
    const emojis = {
      'TEE_SHOT': '⛳',
      'APPROACH': '🏁',
      'FINISH': '🏆'
    };
    return emojis[type] || '';
  }

  /**
   * Format dice result for display
   */
  formatResult(roll = this.lastRoll) {
    const name = this.getShotTypeName(roll);
    return `${name} (${roll})`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiceController;
}
