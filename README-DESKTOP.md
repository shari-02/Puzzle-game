# Puzzle Master - Desktop Application

A professional puzzle game desktop application built with Electron, featuring multiple game modes, achievements, progress tracking, and a modern user interface.

## 🚀 Features

### Game Modes
- **Sliding Puzzle** - Classic 15-puzzle with customizable difficulty
- **Jigsaw Puzzle** - Image-based puzzle with multiple piece counts
- **Memory Match** - Card matching game with various themes
- **Word Search** - Find hidden words in a grid

### Desktop Features
- **Native Desktop App** - Runs as a standalone application
- **Professional Menu Bar** - Full application menu with shortcuts
- **Keyboard Shortcuts** - Comprehensive keyboard navigation
- **File Operations** - Native file dialogs for data export/import
- **Cross-Platform** - Windows, macOS, and Linux support
- **Auto-Updates** - Built-in update mechanism
- **System Integration** - Proper window management and notifications

### Game Features
- **Achievement System** - 20+ unlockable achievements
- **Progress Tracking** - XP system with leveling
- **Statistics Dashboard** - Comprehensive game analytics
- **Multiple Themes** - 6 beautiful color themes
- **Sound Effects** - 8 different audio feedback types
- **Tutorial System** - Interactive learning guides
- **Data Management** - Export/import game progress

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Quick Start

#### Windows
1. Double-click `install.bat`
2. Wait for installation to complete
3. Run `npm start` to launch the app

#### macOS/Linux
1. Open terminal in the project folder
2. Run `chmod +x install.sh && ./install.sh`
3. Run `npm start` to launch the app

### Manual Installation
```bash
# Install dependencies
npm install

# Run the application
npm start

# Build for your platform
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

## 🎮 How to Play

### Getting Started
1. **Launch the app** - Run `npm start` or double-click the executable
2. **Choose a game mode** - Click on any puzzle type
3. **Select difficulty** - Pick your preferred challenge level
4. **Start playing** - Use mouse or keyboard controls

### Keyboard Shortcuts

#### Global Shortcuts
- `Ctrl/Cmd + N` - New Game
- `Ctrl/Cmd + T` - Tutorial
- `Ctrl/Cmd + D` - Dashboard
- `Ctrl/Cmd + ,` - Settings
- `Ctrl/Cmd + E` - Export Data
- `Ctrl/Cmd + I` - Import Data
- `Ctrl/Cmd + R` - Shuffle
- `F11` - Toggle Fullscreen

#### In-Game Shortcuts
- `Escape` - Back to Menu
- `R` - Shuffle
- `H` - Hint
- `Space` - Pause/Resume
- `Ctrl/Cmd + 1-4` - Quick Game Mode Selection

### Game Modes

#### Sliding Puzzle
- **Goal**: Arrange tiles in numerical order
- **Controls**: Click adjacent empty tile to move
- **Difficulty**: 3x3 (Easy), 4x4 (Medium), 5x5 (Hard)

#### Jigsaw Puzzle
- **Goal**: Complete the image by fitting pieces
- **Controls**: Drag and drop pieces
- **Difficulty**: 12, 24, 48, 96 pieces

#### Memory Match
- **Goal**: Find all matching pairs
- **Controls**: Click cards to flip
- **Difficulty**: 12, 16, 20, 24 cards

#### Word Search
- **Goal**: Find all hidden words
- **Controls**: Click and drag to select words
- **Difficulty**: 8x8, 10x10, 12x12, 15x15 grids

## 🏆 Achievements

Unlock achievements by completing various challenges:
- **First Steps** - Complete your first puzzle
- **Speed Demon** - Complete a puzzle in under 2 minutes
- **Perfectionist** - Complete a puzzle without hints
- **Marathon Runner** - Play for 1 hour straight
- **Puzzle Master** - Complete 100 puzzles
- **And many more...**

## 📊 Progress System

- **XP Points** - Earn experience for completing puzzles
- **Levels** - Level up to unlock new features
- **Streaks** - Maintain daily playing streaks
- **Statistics** - Track your performance over time

## 🎨 Customization

### Themes
- **Classic** - Traditional blue and white
- **Dark** - Modern dark mode
- **Ocean** - Calming blue tones
- **Forest** - Natural green palette
- **Sunset** - Warm orange and pink
- **Midnight** - Deep purple and black

### Settings
- **Sound Effects** - Toggle audio feedback
- **Animation Speed** - Adjust visual effects
- **Hint System** - Enable/disable hints
- **Auto-Save** - Automatic progress saving

## 🔧 Development

### Project Structure
```
puzzle-master/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── index.html           # Game UI
├── styles.css           # Styling
├── game.js              # Game logic
├── package.json         # Dependencies and scripts
├── install.bat          # Windows installer
├── install.sh           # Unix installer
└── README-DESKTOP.md    # This file
```

### Building
```bash
# Development build
npm run pack

# Production builds
npm run build-win    # Windows installer
npm run build-mac    # macOS app
npm run build-linux  # Linux AppImage

# All platforms
npm run dist
```

### Debugging
```bash
# Run with DevTools
NODE_ENV=development npm start

# Or set environment variable
set NODE_ENV=development && npm start
```

## 🐛 Troubleshooting

### Common Issues

#### App won't start
- Ensure Node.js is installed (`node --version`)
- Run `npm install` to install dependencies
- Check console for error messages

#### Build fails
- Update Node.js to latest LTS version
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and run `npm install`

#### Performance issues
- Close other applications
- Update graphics drivers
- Try different theme (some are more resource-intensive)

### Getting Help
- Check the console for error messages
- Try running in development mode for detailed logs
- Report issues on the project repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Electron** - Desktop app framework
- **Font Awesome** - Icons
- **Web Audio API** - Sound effects
- **CSS Grid & Flexbox** - Layout system

---

**Enjoy playing Puzzle Master!** 🧩✨

For the web version, visit: `http://localhost:8000`
For desktop support, run: `npm start`
