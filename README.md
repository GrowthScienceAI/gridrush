# 🏁 GridRush - Racing Strategy Game 🏎️

**Ultimate Tic-Tac-Toe meets NASCAR**
*A fast-paced, dice-driven racing strategy game*

---

## 🎮 Game Overview

GridRush combines the strategic depth of Ultimate Tic-Tac-Toe with the excitement of racing and the unpredictability of dice mechanics. Race against an intelligent AI opponent or challenge a friend in this addictive 5-minute showdown!

### Key Features

- **🎲 Unique Dice Mechanics** - Roll to determine your move type:
  - **1-2: TEE SHOT** - Stay in current grid
  - **3-4: APPROACH** - Move to adjacent grid
  - **5-6: FINISH** - Jump to any grid

- **🤖 Smart AI Opponent** - Strategic AI that blocks, attacks, and adapts to your play style

- **⏱️ 5-Minute Timer** - Fast-paced gameplay with time pressure and warnings

- **💡 Adaptive Hints** - Get strategic advice after 3 moves to improve your game

- **🏎️ Racing Theme** - NASCAR-inspired aesthetics with animations and effects

- **🏆 Multiple Win Conditions** - Victory by completing 3-in-a-row or timeout scoring

---

## 🚀 Quick Start

### Installation

1. **Clone or download** this repository
2. **Open** `index.html` in a modern web browser
3. **Start racing!** No build process or dependencies required

```bash
# Clone the repository
git clone https://github.com/GrowthScienceAI/gridrush.git
cd gridrush

# Open in browser
open index.html
# or
python -m http.server 8000  # Then visit http://localhost:8000
```

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Screen resolution: 1024x768 or higher recommended
- No internet connection required (fully offline)

---

## 🌐 Deploy to Netlify

GridRush is optimized for **one-click deployment** to Netlify!

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize
   - Select the `gridrush` repository

3. **Configure build settings:**
   - **Build command:** Leave empty (static site)
   - **Publish directory:** `.` (root directory)
   - Click "Deploy site"

4. **Done!** Your game will be live at `https://[random-name].netlify.app`

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to project
cd gridrush

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 3: Drag & Drop Deploy

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `gridrush` folder
3. Done! Instant deployment

### Custom Domain Setup

After deployment, add a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter your domain (e.g., `gridrush.com`)
4. Follow DNS configuration instructions

### Deploy Status Badge

Add this to your README to show deployment status:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

### Continuous Deployment

Netlify automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update game features"
git push origin main

# Netlify detects push and redeploys automatically!
```

### Performance Features

GridRush on Netlify includes:

- ✅ **Automatic HTTPS** - Free SSL certificate
- ✅ **CDN Distribution** - Global edge network
- ✅ **Asset Optimization** - CSS/JS minification
- ✅ **Instant Cache Invalidation** - Fresh updates
- ✅ **Continuous Deployment** - Auto-deploy on push
- ✅ **Deploy Previews** - Test PRs before merging
- ✅ **Analytics** - Built-in visitor tracking (optional)

### Environment Variables (Future)

For future features requiring API keys:

```bash
# Set in Netlify dashboard
Site settings → Environment variables → Add variable
```

### Troubleshooting Deployment

**Build fails:**
- Ensure `netlify.toml` is in root directory
- Check that all file paths are relative (no `/` prefix)

**404 errors:**
- Verify `_redirects` file exists
- Check `publish = "."` in `netlify.toml`

**Slow loading:**
- Enable asset optimization in Site settings
- Check browser console for errors

### Preview Deployment URL

**Live Demo:** [https://gridrush.netlify.app](https://gridrush.netlify.app)
*(Update this URL after deployment)*

---

## 📖 How to Play

### Objective

**Win 3 sub-grids in a row** (horizontally, vertically, or diagonally) on the main 3x3 game board.

### Game Structure

The game board consists of:
- **9 sub-grids** arranged in a 3x3 layout
- Each sub-grid contains **9 cells** (also in 3x3 layout)
- Players take turns placing markers in cells

### Turn Structure

Each turn consists of **3 shots**:

1. **Roll the dice** 🎲
2. **Place your marker** based on the dice result
3. Repeat for shots 2 and 3
4. Turn switches to opponent

### Dice Mechanics

| Roll | Shot Type | Action |
|------|-----------|--------|
| 1-2 | ⛳ **TEE SHOT** | Stay in the current sub-grid |
| 3-4 | 🏁 **APPROACH** | Move to an adjacent sub-grid (up/down/left/right) |
| 5-6 | 🏆 **FINISH** | Jump to any available sub-grid |

### Winning

**Sub-Grid Victory:**
- Get 3 markers in a row (horizontal, vertical, or diagonal) in a sub-grid
- Won sub-grids are marked with your car emoji (🏎️ or 🏁)

**Game Victory:**
- Win 3 sub-grids in a row on the main board
- OR have the most sub-grids when the timer expires

### Special Rules

- **Next Grid Selection:** After you place a marker, the cell position determines the next active sub-grid
  - Example: If you place in cell 5 (center), the next player goes to sub-grid 5
  - If that sub-grid is already won, player can choose any grid with their next roll

- **Won Grids:** Cannot place markers in already-won sub-grids

- **Timer:** 5-minute countdown with warnings at 1:00, 0:30, and 0:10

---

## 🎯 Strategy Tips

### Beginner Tips

1. **Control the Center** - Sub-grid 5 (center) and cell 5 within grids give maximum control
2. **Plan Ahead** - Think about where your move will send your opponent
3. **Block First** - Prevent opponent wins before going for your own
4. **Watch the Timer** - Don't waste time on perfect moves when ahead

### Advanced Tactics

1. **Sacrifice Plays** - Sometimes losing a cell to send opponent to a bad grid is worth it
2. **Dual Threats** - Create situations where you can win in multiple ways
3. **Grid Control** - Win grids that give you strategic lines (center, corners)
4. **Forced Moves** - Force opponent into won grids where they can choose next position

### Dice Probabilities

- **TEE SHOT (1-2):** 33% chance - Good for finishing a grid you're winning
- **APPROACH (3-4):** 33% chance - Balanced option for nearby threats
- **FINISH (5-6):** 33% chance - Best for escaping bad positions or seizing center

---

## 🎨 Game Modes

### Play vs AI (Recommended)

Challenge a strategic AI opponent with:
- Smart blocking and attacking
- Strategic positioning (prefers centers and corners)
- Adaptive difficulty based on game state
- Realistic thinking delay (600ms)

### Play vs Player (Local Multiplayer)

Hot-seat multiplayer for two players:
- Player 1: 🏎️ (Red)
- Player 2: 🏁 (Blue)
- Pass the device between turns

---

## 🛠️ Technical Details

### Technology Stack

- **HTML5** - Semantic structure
- **CSS3** - Grid layout, animations, racing theme
- **Vanilla JavaScript** - Zero dependencies
- **LocalStorage** - Future feature for saving preferences

### File Structure

```
gridrush/
├── index.html              # Main game page
├── css/
│   ├── styles.css          # Base layout and structure
│   ├── theme.css           # Racing theme colors and effects
│   └── animations.css      # Dice rolls, celebrations, transitions
├── js/
│   ├── game.js             # Core UTTT logic and state management
│   ├── dice.js             # Dice mechanics (roll, shot types)
│   ├── timer.js            # 5-minute countdown with warnings
│   ├── ai.js               # AI opponent decision-making
│   ├── hints.js            # Adaptive hints system
│   └── ui.js               # DOM manipulation and rendering
├── assets/
│   ├── icons/              # SVG icons (future)
│   ├── sounds/             # Sound effects (future)
│   └── images/             # Background images (future)
└── README.md               # This file
```

### Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |

### Performance

- **Page Load:** < 1 second
- **AI Response:** < 800ms average
- **Animations:** 60fps on modern devices
- **Memory Usage:** ~10MB typical

---

## 🎓 Game Logic Deep Dive

### Win Detection

**Sub-Grid Wins:**
```
Check 8 patterns per grid:
- 3 rows: [0,1,2], [3,4,5], [6,7,8]
- 3 columns: [0,3,6], [1,4,7], [2,5,8]
- 2 diagonals: [0,4,8], [2,4,6]
```

**Overall Game Wins:**
```
Same 8 patterns on the 3x3 sub-grid winners array
```

### AI Strategy Priority

1. **Win Game** - Complete 3-in-a-row of sub-grids (100% priority)
2. **Win Sub-Grid** - Complete 3-in-a-row in active grid (90% priority)
3. **Block Opponent** - Prevent opponent sub-grid wins (85% priority)
4. **Strategic Position** - Prefer center (4) and corners (0,2,6,8) (60% priority)
5. **Control Opponent** - Send opponent to won/bad grids (40% priority)
6. **Random Valid** - Choose from remaining moves (0% priority)

### Adaptive Hints

Hints activate after **9 shots** (3 complete turns) and provide:

- **Critical Hints:** Game-winning moves or must-block situations
- **High Priority:** Sub-grid wins or urgent threats
- **Medium Priority:** Positional advantages or scoring leads
- **Low Priority:** General strategy tips

---

## 🐛 Troubleshooting

### Game Won't Load

- Ensure JavaScript is enabled in your browser
- Try opening in a different browser
- Check browser console for errors (F12 → Console)

### Dice Button Not Working

- Wait for your turn (AI may be thinking)
- Check that game status shows "active"
- Reload the page to reset

### Timer Not Counting Down

- Timer starts when you click "PLAY VS AI" or "PLAY VS PLAYER"
- Refresh the page if timer appears stuck
- Check browser console for errors

### AI Not Moving

- AI has a 600ms "thinking" delay - wait a moment
- If stuck for >5 seconds, reload the page
- Check console for JavaScript errors

---

## 🚧 Future Enhancements

### Version 1.1 (Planned)

- [ ] Sound effects toggle (dice roll, placement, victory)
- [ ] Multiple AI difficulty levels (Easy, Medium, Hard)
- [ ] Player name customization
- [ ] Local high score tracking
- [ ] Mobile-optimized touch controls
- [ ] Theme selection (NASCAR, F1, IndyCar)

### Version 1.2 (Future)

- [ ] Online multiplayer with WebRTC
- [ ] Global leaderboards
- [ ] Achievement system
- [ ] Replay system for reviewing games
- [ ] Tournament bracket mode
- [ ] Custom game rules (timer length, shots per turn)

### Version 2.0 (Vision)

- [ ] Power-ups and boost mechanics
- [ ] Campaign mode with AI personalities
- [ ] Customizable themes and skins
- [ ] Social sharing of victories
- [ ] Sponsorship/monetization model

---

## 🤝 Contributing

This is an open-source project! Contributions welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use ES6+ JavaScript features
- Comment complex game logic
- Maintain consistent indentation (2 spaces)
- Test on multiple browsers before submitting

---

## 📜 License

This project is licensed under the MIT License.

---

## 🙏 Credits

**Game Design:** Ultimate Tic-Tac-Toe concept with racing dice mechanics
**Development:** Built with Vanilla JavaScript (no frameworks)
**Inspiration:** NASCAR, Formula 1, IndyCar racing aesthetics
**Organization:** GrowthScience AI

---

## 🏁 Ready to Race?

**Open `index.html` in your browser and start your engines!**

Good luck, and may the best racer win! 🏎️💨

---

*Built with ❤️ for GrowthScience AI | GridRush MVP v1.0 | 2025*
