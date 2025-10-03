// Puzzle Master Game - Professional Puzzle Game
class PuzzleMaster {
    constructor() {
        this.currentMode = null;
        this.currentDifficulty = null;
        this.gameState = {
            score: 0,
            moves: 0,
            startTime: null,
            isPlaying: false,
            isPaused: false
        };
        this.settings = {
            soundEnabled: true,
            showHints: true,
            theme: 'light',
            animationSpeed: 'normal'
        };
        this.stats = {
            gamesPlayed: 0,
            bestTime: null,
            totalScore: 0,
            wins: 0,
            recentGames: [],
            currentStreak: 0,
            longestStreak: 0,
            averageTime: null,
            modeStats: {
                sliding: { games: 0, bestTime: null, averageTime: null, totalScore: 0 },
                jigsaw: { games: 0, bestTime: null, averageTime: null, totalScore: 0 },
                memory: { games: 0, bestTime: null, averageTime: null, totalScore: 0 },
                word: { games: 0, bestTime: null, averageTime: null, totalScore: 0 }
            },
            achievements: {
                'first-game': { unlocked: false, progress: 0, max: 1 },
                'speed-demon': { unlocked: false, progress: 0, max: 1 },
                'perfectionist': { unlocked: false, progress: 0, max: 10 },
                'streak-master': { unlocked: false, progress: 0, max: 5 },
                'puzzle-master': { unlocked: false, progress: 0, max: 4 },
                'high-scorer': { unlocked: false, progress: 0, max: 10000 }
            },
            progress: {
                sliding: { level: 1, xp: 0, maxXp: 100 },
                jigsaw: { level: 1, xp: 0, maxXp: 100 },
                memory: { level: 1, xp: 0, maxXp: 100 },
                word: { level: 1, xp: 0, maxXp: 100 }
            }
        };
        this.soundEffects = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadStats();
        this.setupEventListeners();
        this.setupSoundEffects();
        this.setupElectronIntegration();
        this.applyTheme();
        this.showMainMenu();
    }

    setupElectronIntegration() {
        // Check if running in Electron
        if (window.electronAPI) {
            this.isElectron = true;
            this.setupElectronMenuListeners();
            this.setupElectronFileOperations();
        } else {
            this.isElectron = false;
        }
    }

    setupElectronMenuListeners() {
        // Menu event listeners
        window.electronAPI.onMenuNewGame(() => {
            this.showMainMenu();
        });

        window.electronAPI.onMenuShuffle(() => {
            if (this.gameState.isPlaying) {
                this.shuffle();
            }
        });

        window.electronAPI.onMenuExportData(() => {
            this.exportGameData();
        });

        window.electronAPI.onMenuImportData(() => {
            this.importGameData();
        });

        window.electronAPI.onMenuGameMode((event, mode) => {
            const difficulty = this.getDifficulty(mode);
            this.startGame(mode, difficulty);
        });

        window.electronAPI.onMenuTutorial(() => {
            this.showTutorial();
        });

        window.electronAPI.onMenuDashboard(() => {
            this.showDashboard();
        });

        window.electronAPI.onMenuSettings(() => {
            this.showSettings();
        });

        window.electronAPI.onMenuKeyboardShortcuts(() => {
            this.showKeyboardShortcuts();
        });
    }

    setupElectronFileOperations() {
        // Override file operations for Electron
        this.originalExportData = this.exportGameData;
        this.originalImportData = this.importGameData;

        this.exportGameData = this.exportGameDataElectron;
        this.importGameData = this.importGameDataElectron;
    }

    setupEventListeners() {
        // Menu mode selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.playSound('click');
                const mode = card.dataset.mode;
                const difficulty = this.getDifficulty(mode);
                this.startGame(mode, difficulty);
            });
            
            card.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });

        // Control buttons
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.playSound('click');
            this.showMainMenu();
        });
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            this.playSound('click');
            this.shuffle();
        });
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.playSound('click');
            this.showHint();
        });
        document.getElementById('playAgain').addEventListener('click', () => {
            this.playSound('click');
            this.playAgain();
        });
        document.getElementById('newPuzzle').addEventListener('click', () => {
            this.playSound('click');
            this.newPuzzle();
        });
        document.getElementById('backToMenuFromVictory').addEventListener('click', () => {
            this.playSound('click');
            this.showMainMenu();
        });

        // Modal controls
        document.getElementById('showTutorial').addEventListener('click', () => this.showTutorial());
        document.getElementById('showDashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('showSettings').addEventListener('click', () => this.showSettings());
        document.getElementById('closeTutorial').addEventListener('click', () => this.hideModal('tutorialModal'));
        document.getElementById('closeDashboard').addEventListener('click', () => this.hideDashboard());
        document.getElementById('closeSettings').addEventListener('click', () => this.hideModal('settingsModal'));

        // Dashboard tab navigation
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchDashboardTab(e.target.dataset.tab));
        });

        // Dashboard overlay click to close
        document.getElementById('dashboardOverlay').addEventListener('click', () => this.hideDashboard());

        // Tutorial tab navigation
        document.querySelectorAll('.tutorial-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTutorialTab(e.target.dataset.tutorial));
        });
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());

        // Settings
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('animationSpeed').addEventListener('change', (e) => this.changeAnimationSpeed(e.target.value));
        document.getElementById('soundEnabled').addEventListener('change', (e) => this.toggleSoundSetting(e.target.checked));
        document.getElementById('showHints').addEventListener('change', (e) => this.toggleHints(e.target.checked));

        // Data management
        document.getElementById('exportData').addEventListener('click', () => this.exportGameData());
        document.getElementById('importData').addEventListener('click', () => this.importGameData());
        document.getElementById('resetData').addEventListener('click', () => this.resetGameData());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupSoundEffects() {
        // Create audio context for sound effects
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundEffects = {
                move: this.createMoveSound.bind(this),
                success: this.createSuccessSound.bind(this),
                victory: this.createVictorySound.bind(this),
                error: this.createErrorSound.bind(this),
                levelUp: this.createLevelUpSound.bind(this),
                achievement: this.createAchievementSound.bind(this),
                click: this.createClickSound.bind(this),
                hover: this.createHoverSound.bind(this)
            };
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(type) {
        if (!this.settings.soundEnabled || !this.audioContext || !this.soundEffects[type]) return;
        this.soundEffects[type]();
    }

    createMoveSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(550, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    createSuccessSound() {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a pleasant chord
        oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.3);
        oscillator2.stop(this.audioContext.currentTime + 0.3);
    }

    createVictorySound() {
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C5, D5, E5, F5, G5
        notes.forEach((frequency, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }, index * 100);
        });
    }

    createErrorSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(180, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    createLevelUpSound() {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const oscillator3 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        oscillator3.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a major chord
        oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5
        oscillator3.frequency.setValueAtTime(783.99, this.audioContext.currentTime); // G5
        
        gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator3.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.5);
        oscillator2.stop(this.audioContext.currentTime + 0.5);
        oscillator3.stop(this.audioContext.currentTime + 0.5);
    }

    createAchievementSound() {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a triumphant sound
        oscillator1.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5
        oscillator2.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        
        gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.4);
        oscillator2.stop(this.audioContext.currentTime + 0.4);
    }

    createClickSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    createHoverSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.03);
        
        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.03);
    }

    getDifficulty(mode) {
        const selectId = mode + 'Difficulty';
        const select = document.getElementById(selectId);
        return select ? parseInt(select.value) : 4;
    }

    startGame(mode, difficulty) {
        this.currentMode = mode;
        this.currentDifficulty = difficulty;
        this.gameState = {
            score: 0,
            moves: 0,
            startTime: Date.now(),
            isPlaying: true,
            isPaused: false
        };

        this.updateGameInfo();
        this.hideMainMenu();
        this.showGameArea();
        
        // Ensure game board exists before initializing
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) {
            console.error('Game board not found, cannot start game');
            this.showNotification('Error: Game board not found', 'error');
            this.showMainMenu();
            return;
        }
        
        this.initializeGame();
        this.startTimer();
    }

    initializeGame() {
        this.showLoadingState('Initializing game...');
        
        // Use requestAnimationFrame for smooth initialization
        requestAnimationFrame(() => {
            try {
                const gameBoard = document.getElementById('gameBoard');
                if (!gameBoard) {
                    console.error('Game board not found');
                    this.hideLoadingState();
                    return;
                }
                
                gameBoard.innerHTML = '';
                gameBoard.className = 'game-board';

                switch (this.currentMode) {
                    case 'sliding':
                        this.initializeSlidingPuzzle();
                        break;
                    case 'jigsaw':
                        this.initializeJigsawPuzzle();
                        break;
                    case 'memory':
                        this.initializeMemoryGame();
                        break;
                    case 'word':
                        this.initializeWordSearch();
                        break;
                    default:
                        console.error('Unknown game mode:', this.currentMode);
                        this.hideLoadingState();
                        return;
                }

                this.updateProgress();
                
                // Add a small delay to ensure everything is properly initialized
                setTimeout(() => {
                    this.hideLoadingState();
                }, 200);
                
            } catch (error) {
                console.error('Error initializing game:', error);
                this.hideLoadingState();
            }
        });
    }

    showLoadingState(message = 'Loading...') {
        // Remove any existing loading overlay first
        this.hideLoadingState();
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner-large"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoadingState() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
            }, 300);
        }
        
        // Fallback: Force hide any loading states after 3 seconds
        setTimeout(() => {
            const fallbackOverlay = document.getElementById('loadingOverlay');
            if (fallbackOverlay) {
                fallbackOverlay.remove();
            }
        }, 3000);
    }

    initializeSlidingPuzzle() {
        const size = this.currentDifficulty;
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.style.setProperty('--size', size);
        gameBoard.classList.add('sliding-puzzle');

        const totalTiles = size * size;
        const tiles = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
        tiles.push(0); // Empty tile

        // Shuffle tiles
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        // Create tiles
        tiles.forEach((value, index) => {
            const tile = document.createElement('div');
            tile.className = value === 0 ? 'puzzle-tile empty' : 'puzzle-tile';
            tile.textContent = value === 0 ? '' : value;
            tile.dataset.value = value;
            tile.dataset.index = index;
            tile.addEventListener('click', () => this.handleSlidingTileClick(tile));
            gameBoard.appendChild(tile);
        });

        this.slidingState = {
            tiles: tiles,
            emptyIndex: tiles.indexOf(0),
            size: size
        };
    }

    handleSlidingTileClick(tile) {
        if (!this.gameState.isPlaying) return;

        const tileIndex = parseInt(tile.dataset.index);
        const emptyIndex = this.slidingState.emptyIndex;
        const size = this.slidingState.size;

        // Check if tile is adjacent to empty space
        const row = Math.floor(tileIndex / size);
        const col = tileIndex % size;
        const emptyRow = Math.floor(emptyIndex / size);
        const emptyCol = emptyIndex % size;

        const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                          (Math.abs(col - emptyCol) === 1 && row === emptyRow);

        if (isAdjacent) {
            this.moveSlidingTile(tileIndex, emptyIndex);
            this.gameState.moves++;
            this.updateScore();
            this.playSound('move');
            this.updateProgress();
            this.checkSlidingWin();
        } else {
            this.playSound('error');
        }
    }

    moveSlidingTile(fromIndex, toIndex) {
        const tiles = this.slidingState.tiles;
        [tiles[fromIndex], tiles[toIndex]] = [tiles[toIndex], tiles[fromIndex]];
        this.slidingState.emptyIndex = fromIndex;

        // Update DOM with animation
        const gameBoard = document.getElementById('gameBoard');
        const tileElements = gameBoard.querySelectorAll('.puzzle-tile');
        
        // Add moving class for animation
        const movingTile = tileElements[fromIndex];
        movingTile.classList.add('moving');
        
        setTimeout(() => {
            tileElements.forEach((tile, index) => {
                tile.dataset.index = index;
                tile.textContent = tiles[index] === 0 ? '' : tiles[index];
                tile.className = tiles[index] === 0 ? 'puzzle-tile empty' : 'puzzle-tile tile-move';
                
                // Add highlight animation for moved tile
                if (index === toIndex) {
                    tile.classList.add('tile-highlight');
                    setTimeout(() => tile.classList.remove('tile-highlight'), 500);
                }
            });
            movingTile.classList.remove('moving');
        }, 150);
    }

    checkSlidingWin() {
        const tiles = this.slidingState.tiles;
        const isWin = tiles.every((value, index) => {
            if (index === tiles.length - 1) return value === 0; // Last tile should be empty
            return value === index + 1;
        });

        if (isWin) {
            this.handleWin();
        }
    }

    initializeJigsawPuzzle() {
        const pieces = this.currentDifficulty;
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.classList.add('jigsaw-puzzle');
        gameBoard.style.width = '400px';
        gameBoard.style.height = '300px';

        // Create jigsaw pieces
        for (let i = 0; i < pieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'jigsaw-piece';
            piece.style.width = `${400 / Math.ceil(Math.sqrt(pieces))}px`;
            piece.style.height = `${300 / Math.ceil(Math.sqrt(pieces))}px`;
            piece.style.left = `${Math.random() * 200 + 50}px`;
            piece.style.top = `${Math.random() * 200 + 50}px`;
            piece.textContent = i + 1;
            piece.dataset.piece = i + 1;
            
            // Make pieces draggable
            this.makeDraggable(piece);
            gameBoard.appendChild(piece);
        }

        this.jigsawState = {
            pieces: pieces,
            placedPieces: 0
        };
    }

    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = element.offsetLeft;
            initialY = element.offsetTop;
            element.style.zIndex = '1000';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = `${initialX + deltaX}px`;
            element.style.top = `${initialY + deltaY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = '1';
                this.checkJigsawPlacement(element);
            }
        });
    }

    checkJigsawPlacement(piece) {
        // Simple placement check - in a real jigsaw, this would be more complex
        const rect = piece.getBoundingClientRect();
        const gameBoard = document.getElementById('gameBoard');
        const boardRect = gameBoard.getBoundingClientRect();
        
        const isInBoard = rect.left >= boardRect.left && 
                         rect.right <= boardRect.right && 
                         rect.top >= boardRect.top && 
                         rect.bottom <= boardRect.bottom;
        
        if (isInBoard && !piece.classList.contains('placed')) {
            piece.classList.add('placed');
            this.jigsawState.placedPieces++;
            this.gameState.moves++;
            this.updateScore();
            this.playSound('success');
            this.updateProgress();
            this.checkJigsawWin();
        }
    }

    checkJigsawWin() {
        if (this.jigsawState.placedPieces === this.jigsawState.pieces) {
            this.handleWin();
        }
    }

    initializeMemoryGame() {
        const pairs = this.currentDifficulty;
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.classList.add('memory-grid');
        gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(pairs * 2))}, 1fr)`;

        // Create pairs of cards
        const cards = [];
        const symbols = ['🎯', '🎨', '🎪', '🎭', '🎸', '🎹', '🎺', '🎻', '🎲', '🎳', '🏆', '🏅', '🏈', '🏉', '🏊', '🏋', '🏌', '🏍'];
        
        for (let i = 0; i < pairs; i++) {
            const symbol = symbols[i % symbols.length];
            cards.push(symbol, symbol);
        }

        // Shuffle cards
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        // Create card elements
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            card.addEventListener('click', () => this.handleMemoryCardClick(card));
            gameBoard.appendChild(card);
        });

        this.memoryState = {
            cards: cards,
            flippedCards: [],
            matchedPairs: 0,
            isProcessing: false
        };
    }

    handleMemoryCardClick(card) {
        if (!this.gameState.isPlaying || this.memoryState.isProcessing) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.symbol;
        this.memoryState.flippedCards.push(card);

        if (this.memoryState.flippedCards.length === 2) {
            this.memoryState.isProcessing = true;
            this.gameState.moves++;
            this.updateScore();
            this.playSound('move');
            
            setTimeout(() => {
                this.checkMemoryMatch();
                this.memoryState.isProcessing = false;
            }, 1000);
        }
    }

    checkMemoryMatch() {
        const [card1, card2] = this.memoryState.flippedCards;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            // Match found
            card1.classList.add('matched', 'card-flip');
            card2.classList.add('matched', 'card-flip');
            this.memoryState.matchedPairs++;
            this.playSound('success');
            this.updateProgress();
            this.checkMemoryWin();
            
            // Add success animation
            setTimeout(() => {
                card1.classList.add('success-flash');
                card2.classList.add('success-flash');
                setTimeout(() => {
                    card1.classList.remove('success-flash');
                    card2.classList.remove('success-flash');
                }, 600);
            }, 300);
        } else {
            // No match
            card1.classList.add('mismatched', 'error-shake');
            card2.classList.add('mismatched', 'error-shake');
            this.playSound('error');
            
            setTimeout(() => {
                card1.classList.remove('flipped', 'mismatched', 'error-shake');
                card2.classList.remove('flipped', 'mismatched', 'error-shake');
                card1.textContent = '';
                card2.textContent = '';
            }, 1000);
        }
        
        this.memoryState.flippedCards = [];
    }

    checkMemoryWin() {
        if (this.memoryState.matchedPairs === this.memoryState.cards.length / 2) {
            this.handleWin();
        }
    }

    initializeWordSearch() {
        const size = this.currentDifficulty;
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.classList.add('word-search-grid');
        gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        // Create word list
        const words = ['PUZZLE', 'GAME', 'FUN', 'BRAIN', 'LOGIC', 'SKILL', 'CHALLENGE', 'MASTER'];
        const selectedWords = words.slice(0, Math.min(4, Math.floor(size / 2)));

        // Create grid
        const grid = Array(size).fill().map(() => Array(size).fill(''));
        
        // Place words horizontally
        selectedWords.forEach((word, index) => {
            const row = index * 2;
            if (row < size) {
                for (let col = 0; col < word.length && col < size; col++) {
                    grid[row][col] = word[col];
                }
            }
        });

        // Fill remaining cells with random letters
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (!grid[row][col]) {
                    grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }

        // Create grid elements
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'word-search-cell';
                cell.textContent = grid[row][col];
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleWordSearchClick(cell));
                gameBoard.appendChild(cell);
            }
        }

        this.wordSearchState = {
            grid: grid,
            words: selectedWords,
            foundWords: 0,
            selectedCells: [],
            currentWord: ''
        };
    }

    handleWordSearchClick(cell) {
        if (!this.gameState.isPlaying) return;

        if (cell.classList.contains('found')) return;

        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            this.wordSearchState.selectedCells = this.wordSearchState.selectedCells.filter(c => c !== cell);
        } else {
            cell.classList.add('selected');
            this.wordSearchState.selectedCells.push(cell);
            this.wordSearchState.currentWord += cell.textContent;
        }

        if (this.wordSearchState.selectedCells.length >= 3) {
            this.checkWordSearchMatch();
        }
    }

    checkWordSearchMatch() {
        const currentWord = this.wordSearchState.currentWord;
        const foundWord = this.wordSearchState.words.find(word => 
            word === currentWord || word === currentWord.split('').reverse().join('')
        );

        if (foundWord) {
            this.wordSearchState.selectedCells.forEach(cell => {
                cell.classList.add('found');
                cell.classList.remove('selected');
            });
            this.wordSearchState.foundWords++;
            this.gameState.moves++;
            this.updateScore();
            this.playSound('success');
            this.updateProgress();
            this.checkWordSearchWin();
        } else {
            setTimeout(() => {
                this.wordSearchState.selectedCells.forEach(cell => {
                    cell.classList.remove('selected');
                });
                this.wordSearchState.selectedCells = [];
                this.wordSearchState.currentWord = '';
            }, 1000);
        }
    }

    checkWordSearchWin() {
        if (this.wordSearchState.foundWords === this.wordSearchState.words.length) {
            this.handleWin();
        }
    }

    shuffle() {
        if (!this.gameState.isPlaying) return;

        switch (this.currentMode) {
            case 'sliding':
                this.shuffleSlidingPuzzle();
                break;
            case 'jigsaw':
                this.shuffleJigsawPuzzle();
                break;
            case 'memory':
                this.shuffleMemoryGame();
                break;
            case 'word':
                this.shuffleWordSearch();
                break;
        }
        
        this.gameState.moves++;
        this.updateScore();
        this.playSound('move');
    }

    shuffleSlidingPuzzle() {
        const tiles = this.slidingState.tiles;
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        this.slidingState.emptyIndex = tiles.indexOf(0);
        
        const gameBoard = document.getElementById('gameBoard');
        const tileElements = gameBoard.querySelectorAll('.puzzle-tile');
        
        tileElements.forEach((tile, index) => {
            tile.dataset.index = index;
            tile.textContent = tiles[index] === 0 ? '' : tiles[index];
            tile.className = tiles[index] === 0 ? 'puzzle-tile empty' : 'puzzle-tile';
        });
    }

    shuffleJigsawPuzzle() {
        const gameBoard = document.getElementById('gameBoard');
        const pieces = gameBoard.querySelectorAll('.jigsaw-piece');
        
        pieces.forEach(piece => {
            piece.style.left = `${Math.random() * 200 + 50}px`;
            piece.style.top = `${Math.random() * 200 + 50}px`;
            piece.classList.remove('placed');
        });
        
        this.jigsawState.placedPieces = 0;
    }

    shuffleMemoryGame() {
        const gameBoard = document.getElementById('gameBoard');
        const cards = Array.from(gameBoard.querySelectorAll('.memory-card'));
        
        cards.forEach(card => {
            card.classList.remove('flipped', 'matched', 'mismatched');
            card.textContent = '';
        });
        
        // Shuffle card positions
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = cards[i].dataset.symbol;
            cards[i].dataset.symbol = cards[j].dataset.symbol;
            cards[j].dataset.symbol = temp;
        }
        
        this.memoryState.matchedPairs = 0;
        this.memoryState.flippedCards = [];
    }

    shuffleWordSearch() {
        const gameBoard = document.getElementById('gameBoard');
        const cells = gameBoard.querySelectorAll('.word-search-cell');
        
        cells.forEach(cell => {
            cell.classList.remove('selected', 'found');
        });
        
        this.wordSearchState.foundWords = 0;
        this.wordSearchState.selectedCells = [];
        this.wordSearchState.currentWord = '';
    }

    showHint() {
        if (!this.settings.showHints || !this.gameState.isPlaying) return;

        // Simple hint system - could be enhanced
        this.playSound('move');
        alert('Hint: Try to think systematically and plan your moves!');
    }

    handleWin() {
        this.gameState.isPlaying = false;
        this.stopTimer();
        this.playSound('victory');
        this.updateStats();
        this.showVictoryScreen();
    }

    showVictoryScreen() {
        const victoryScreen = document.getElementById('victoryScreen');
        const victoryTime = document.getElementById('victoryTime');
        const victoryScore = document.getElementById('victoryScore');
        const victoryMoves = document.getElementById('victoryMoves');
        const victoryMessage = document.getElementById('victoryMessage');

        const timeElapsed = Date.now() - this.gameState.startTime;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);

        victoryTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        victoryScore.textContent = this.gameState.score;
        victoryMoves.textContent = this.gameState.moves;
        victoryMessage.textContent = `Congratulations! You completed the ${this.currentMode} puzzle!`;

        victoryScreen.classList.remove('hidden');
    }

    updateScore() {
        // Scoring system based on mode and difficulty
        let baseScore = 10;
        let difficultyMultiplier = this.currentDifficulty / 4;
        let timeBonus = Math.max(0, 100 - Math.floor((Date.now() - this.gameState.startTime) / 1000));
        
        this.gameState.score += Math.floor(baseScore * difficultyMultiplier + timeBonus);
        document.getElementById('score').textContent = this.gameState.score;
    }

    updateProgress() {
        let progress = 0;
        
        switch (this.currentMode) {
            case 'sliding':
                progress = this.calculateSlidingProgress();
                break;
            case 'jigsaw':
                progress = (this.jigsawState.placedPieces / this.jigsawState.pieces) * 100;
                break;
            case 'memory':
                progress = (this.memoryState.matchedPairs / (this.memoryState.cards.length / 2)) * 100;
                break;
            case 'word':
                progress = (this.wordSearchState.foundWords / this.wordSearchState.words.length) * 100;
                break;
        }

        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}% Complete`;
    }

    calculateSlidingProgress() {
        const tiles = this.slidingState.tiles;
        let correctTiles = 0;
        
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] === i + 1) correctTiles++;
        }
        
        return (correctTiles / (tiles.length - 1)) * 100;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameState.isPlaying && !this.gameState.isPaused) {
                const elapsed = Date.now() - this.gameState.startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                document.getElementById('timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateGameInfo() {
        document.getElementById('currentMode').textContent = this.getModeDisplayName();
        document.getElementById('currentDifficulty').textContent = this.getDifficultyDisplay();
    }

    getModeDisplayName() {
        const names = {
            'sliding': 'Sliding Puzzle',
            'jigsaw': 'Jigsaw Puzzle',
            'memory': 'Memory Match',
            'word': 'Word Search'
        };
        return names[this.currentMode] || 'Puzzle';
    }

    getDifficultyDisplay() {
        switch (this.currentMode) {
            case 'sliding':
                return `${this.currentDifficulty}x${this.currentDifficulty}`;
            case 'jigsaw':
                return `${this.currentDifficulty} pieces`;
            case 'memory':
                return `${this.currentDifficulty} pairs`;
            case 'word':
                return `${this.currentDifficulty}x${this.currentDifficulty}`;
            default:
                return this.currentDifficulty;
        }
    }

    showMainMenu() {
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('gameArea').classList.add('hidden');
        document.getElementById('victoryScreen').classList.add('hidden');
        this.stopTimer();
        this.gameState.isPlaying = false;
    }

    hideMainMenu() {
        document.getElementById('mainMenu').classList.add('hidden');
    }

    showGameArea() {
        document.getElementById('gameArea').classList.remove('hidden');
    }

    playAgain() {
        document.getElementById('victoryScreen').classList.add('hidden');
        this.startGame(this.currentMode, this.currentDifficulty);
    }

    newPuzzle() {
        document.getElementById('victoryScreen').classList.add('hidden');
        this.showMainMenu();
    }

    showTutorial() {
        this.playSound('click');
        document.getElementById('tutorialModal').classList.remove('hidden');
    }

    switchTutorialTab(tutorialName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tutorial-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tutorial-tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tutorial="${tutorialName}"]`).classList.add('active');
        document.getElementById(`${tutorialName}Tutorial`).classList.add('active');
    }

    showDashboard() {
        this.updateDashboardDisplay();
        const sidebar = document.getElementById('dashboardSidebar');
        const overlay = document.getElementById('dashboardOverlay');
        sidebar.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }

    hideDashboard() {
        const sidebar = document.getElementById('dashboardSidebar');
        const overlay = document.getElementById('dashboardOverlay');
        sidebar.classList.add('hidden');
        overlay.classList.add('hidden');
    }

    switchDashboardTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.dashboard-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.dashboard-tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Update specific tab content
        switch(tabName) {
            case 'overview':
                this.updateOverviewTab();
                break;
            case 'statistics':
                this.updateStatisticsTab();
                break;
            case 'achievements':
                this.updateAchievementsTab();
                break;
            case 'progress':
                this.updateProgressTab();
                break;
            case 'leaderboard':
                this.updateLeaderboardTab();
                break;
        }
    }

    showSettings() {
        this.updateSettingsDisplay();
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    updateDashboardDisplay() {
        this.updateOverviewTab();
        this.updateStatisticsTab();
        this.updateAchievementsTab();
        this.updateProgressTab();
        this.updateLeaderboardTab();
    }

    updateOverviewTab() {
        document.getElementById('overviewGamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('overviewBestTime').textContent = this.stats.bestTime || '--:--';
        document.getElementById('overviewTotalScore').textContent = this.stats.totalScore;
        document.getElementById('overviewWinRate').textContent = 
            this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.wins / this.stats.gamesPlayed) * 100) + '%' : '0%';
        
        document.getElementById('currentStreak').textContent = this.stats.currentStreak;
        document.getElementById('longestStreak').textContent = this.stats.longestStreak;
        document.getElementById('averageTime').textContent = this.stats.averageTime || '--:--';
        
        // Find favorite mode
        const modeStats = this.stats.modeStats;
        const favoriteMode = Object.keys(modeStats).reduce((a, b) => 
            modeStats[a].games > modeStats[b].games ? a : b
        );
        document.getElementById('favoriteMode').textContent = 
            modeStats[favoriteMode].games > 0 ? 
            this.getModeDisplayName(favoriteMode) : 'None';
    }

    updateStatisticsTab() {
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('bestTime').textContent = this.stats.bestTime || '--:--';
        document.getElementById('totalScore').textContent = this.stats.totalScore;
        document.getElementById('winRate').textContent = 
            this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.wins / this.stats.gamesPlayed) * 100) + '%' : '0%';

        // Update mode statistics
        Object.keys(this.stats.modeStats).forEach(mode => {
            const modeStat = this.stats.modeStats[mode];
            document.getElementById(`${mode}Games`).textContent = modeStat.games;
            document.getElementById(`${mode}Best`).textContent = modeStat.bestTime || '--:--';
            document.getElementById(`${mode}Avg`).textContent = modeStat.averageTime || '--:--';
        });

        // Update recent games
        this.updateRecentGames();
    }

    updateAchievementsTab() {
        Object.keys(this.stats.achievements).forEach(achievementId => {
            const achievement = this.stats.achievements[achievementId];
            const card = document.querySelector(`[data-achievement="${achievementId}"]`);
            
            if (achievement.unlocked) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
            } else {
                card.classList.remove('unlocked');
                card.classList.add('locked');
            }

            const progressFill = card.querySelector('.progress-fill-small');
            const progressText = card.querySelector('.progress-text');
            const progressPercent = (achievement.progress / achievement.max) * 100;
            
            progressFill.style.width = `${progressPercent}%`;
            progressText.textContent = `${achievement.progress}/${achievement.max}`;
        });
    }

    updateProgressTab() {
        // Update overall progress ring
        const totalProgress = this.calculateOverallProgress();
        const progressRing = document.querySelector('.progress-ring-fill');
        const circumference = 2 * Math.PI * 52; // radius = 52
        const offset = circumference - (totalProgress / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
        document.getElementById('overallProgress').textContent = `${Math.round(totalProgress)}%`;

        // Update mode progress
        Object.keys(this.stats.progress).forEach(mode => {
            const progress = this.stats.progress[mode];
            const progressPercent = (progress.xp / progress.maxXp) * 100;
            
            document.getElementById(`${mode}Level`).textContent = progress.level;
            document.getElementById(`${mode}ProgressFill`).style.width = `${progressPercent}%`;
            document.getElementById(`${mode}ProgressText`).textContent = `${progress.xp}/${progress.maxXp} XP`;
        });
    }

    updateLeaderboardTab() {
        // For now, show only the current player
        // In a real implementation, this would fetch from a server
        const entries = document.getElementById('leaderboardEntries');
        entries.innerHTML = `
            <div class="leaderboard-entry">
                <span class="rank">1</span>
                <span class="player">You</span>
                <span class="score">${this.stats.totalScore}</span>
                <span class="time">${this.stats.bestTime || '--:--'}</span>
            </div>
        `;
    }

    updateRecentGames() {
        const recentGamesContainer = document.getElementById('recentGames');
        recentGamesContainer.innerHTML = '';
        
        this.stats.recentGames.slice(0, 10).forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.className = 'recent-game';
            gameElement.innerHTML = `
                <span>${this.getModeDisplayName(game.mode)}</span>
                <span>${game.score} pts</span>
                <span>${game.time}</span>
                <span>${game.date}</span>
            `;
            recentGamesContainer.appendChild(gameElement);
        });
    }

    calculateOverallProgress() {
        const totalModes = Object.keys(this.stats.progress).length;
        let totalProgress = 0;
        
        Object.values(this.stats.progress).forEach(progress => {
            totalProgress += (progress.xp / progress.maxXp) * 100;
        });
        
        return totalProgress / totalModes;
    }

    updateSettingsDisplay() {
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('animationSpeed').value = this.settings.animationSpeed;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('showHints').checked = this.settings.showHints;
    }

    updateStats() {
        this.stats.gamesPlayed++;
        this.stats.totalScore += this.gameState.score;
        
        const timeElapsed = Date.now() - this.gameState.startTime;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update win/loss
        if (this.gameState.score > 0) {
            this.stats.wins++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.longestStreak) {
                this.stats.longestStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.currentStreak = 0;
        }

        // Update best time
        if (!this.stats.bestTime || timeElapsed < this.parseTime(this.stats.bestTime)) {
            this.stats.bestTime = timeString;
        }

        // Update average time
        if (!this.stats.averageTime) {
            this.stats.averageTime = timeString;
        } else {
            const avgTime = this.parseTime(this.stats.averageTime);
            const newAvgTime = (avgTime * (this.stats.gamesPlayed - 1) + timeElapsed) / this.stats.gamesPlayed;
            this.stats.averageTime = this.formatTime(newAvgTime);
        }

        // Update mode statistics
        const modeStat = this.stats.modeStats[this.currentMode];
        modeStat.games++;
        modeStat.totalScore += this.gameState.score;
        
        if (!modeStat.bestTime || timeElapsed < this.parseTime(modeStat.bestTime)) {
            modeStat.bestTime = timeString;
        }

        if (!modeStat.averageTime) {
            modeStat.averageTime = timeString;
        } else {
            const avgTime = this.parseTime(modeStat.averageTime);
            const newAvgTime = (avgTime * (modeStat.games - 1) + timeElapsed) / modeStat.games;
            modeStat.averageTime = this.formatTime(newAvgTime);
        }

        // Update progress and XP
        this.updateProgress(this.currentMode, this.gameState.score);

        // Update achievements
        this.updateAchievements();

        // Add to recent games
        this.stats.recentGames.unshift({
            mode: this.currentMode,
            score: this.gameState.score,
            time: timeString,
            date: new Date().toLocaleDateString()
        });

        if (this.stats.recentGames.length > 10) {
            this.stats.recentGames = this.stats.recentGames.slice(0, 10);
        }

        this.saveStats();
    }

    updateProgress(mode, score) {
        const progress = this.stats.progress[mode];
        const xpGained = Math.floor(score / 10); // 1 XP per 10 points
        const oldLevel = progress.level;
        progress.xp += xpGained;

        // Level up if enough XP
        while (progress.xp >= progress.maxXp) {
            progress.xp -= progress.maxXp;
            progress.level++;
            progress.maxXp = Math.floor(progress.maxXp * 1.2); // Increase XP needed for next level
        }

        // Show level up notification
        if (progress.level > oldLevel) {
            this.showLevelUpNotification(mode, progress.level);
            this.playSound('levelUp');
        }
    }

    showLevelUpNotification(mode, newLevel) {
        const modeNames = {
            sliding: 'Sliding Puzzle',
            jigsaw: 'Jigsaw Puzzle',
            memory: 'Memory Match',
            word: 'Word Search'
        };

        const toast = document.createElement('div');
        toast.className = 'level-up-toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-star"></i>
            </div>
            <h3>Level Up!</h3>
            <p>${modeNames[mode]} - Level ${newLevel}</p>
        `;

        document.body.appendChild(toast);

        // Remove toast after animation
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    updateAchievements() {
        const achievements = this.stats.achievements;
        const newlyUnlocked = [];

        // First Steps
        if (this.stats.gamesPlayed >= 1 && !achievements['first-game'].unlocked) {
            achievements['first-game'].progress = 1;
            achievements['first-game'].unlocked = true;
            newlyUnlocked.push('first-game');
        }

        // Speed Demon (under 30 seconds)
        const timeElapsed = Date.now() - this.gameState.startTime;
        if (timeElapsed < 30000 && !achievements['speed-demon'].unlocked) {
            achievements['speed-demon'].progress = 1;
            achievements['speed-demon'].unlocked = true;
            newlyUnlocked.push('speed-demon');
        }

        // Perfectionist (10 games without hints - simplified)
        if (this.stats.gamesPlayed >= 10) {
            achievements['perfectionist'].progress = Math.min(10, this.stats.gamesPlayed);
            if (achievements['perfectionist'].progress >= 10 && !achievements['perfectionist'].unlocked) {
                achievements['perfectionist'].unlocked = true;
                newlyUnlocked.push('perfectionist');
            }
        }

        // Streak Master
        achievements['streak-master'].progress = Math.min(5, this.stats.currentStreak);
        if (achievements['streak-master'].progress >= 5 && !achievements['streak-master'].unlocked) {
            achievements['streak-master'].unlocked = true;
            newlyUnlocked.push('streak-master');
        }

        // Puzzle Master (complete all modes)
        const completedModes = Object.values(this.stats.modeStats).filter(mode => mode.games > 0).length;
        achievements['puzzle-master'].progress = completedModes;
        if (achievements['puzzle-master'].progress >= 4 && !achievements['puzzle-master'].unlocked) {
            achievements['puzzle-master'].unlocked = true;
            newlyUnlocked.push('puzzle-master');
        }

        // High Scorer
        achievements['high-scorer'].progress = Math.min(10000, this.stats.totalScore);
        if (achievements['high-scorer'].progress >= 10000 && !achievements['high-scorer'].unlocked) {
            achievements['high-scorer'].unlocked = true;
            newlyUnlocked.push('high-scorer');
        }

        // Show achievement unlock notifications
        if (newlyUnlocked.length > 0) {
            this.showAchievementNotification(newlyUnlocked);
            this.playSound('achievement');
        }
    }

    showAchievementNotification(achievementIds) {
        achievementIds.forEach((achievementId, index) => {
            setTimeout(() => {
                this.createAchievementToast(achievementId);
            }, index * 500);
        });
    }

    createAchievementToast(achievementId) {
        const achievementNames = {
            'first-game': 'First Steps',
            'speed-demon': 'Speed Demon',
            'perfectionist': 'Perfectionist',
            'streak-master': 'Streak Master',
            'puzzle-master': 'Puzzle Master',
            'high-scorer': 'High Scorer'
        };

        const toast = document.createElement('div');
        toast.className = 'achievement-toast bounce-in';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="toast-content">
                <h4>Achievement Unlocked!</h4>
                <p>${achievementNames[achievementId]}</p>
            </div>
        `;

        document.body.appendChild(toast);

        // Remove toast after animation
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    parseTime(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60000 + seconds * 1000;
    }

    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        const icon = document.querySelector('#soundToggle i');
        icon.className = this.settings.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        this.saveSettings();
    }

    toggleSoundSetting(enabled) {
        this.settings.soundEnabled = enabled;
        const icon = document.querySelector('#soundToggle i');
        icon.className = enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        this.saveSettings();
    }

    toggleHints(enabled) {
        this.settings.showHints = enabled;
        this.saveSettings();
    }

    changeTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme();
        this.saveSettings();
    }

    changeAnimationSpeed(speed) {
        this.settings.animationSpeed = speed;
        this.saveSettings();
    }

    applyTheme() {
        document.body.className = `theme-${this.settings.theme}`;
    }

    handleKeyboard(e) {
        // Global shortcuts (work everywhere)
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                case 'N':
                    e.preventDefault();
                    this.showMainMenu();
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    this.showTutorial();
                    break;
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.showDashboard();
                    break;
                case ',':
                    e.preventDefault();
                    this.showSettings();
                    break;
                case 'e':
                case 'E':
                    e.preventDefault();
                    this.exportGameData();
                    break;
                case 'i':
                case 'I':
                    e.preventDefault();
                    this.importGameData();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    if (this.gameState.isPlaying) {
                        this.shuffle();
                    }
                    break;
            }
        }

        // Game-specific shortcuts
        if (!this.gameState.isPlaying) return;

        switch (e.key) {
            case 'Escape':
                this.showMainMenu();
                break;
            case 'r':
            case 'R':
                if (!e.ctrlKey && !e.metaKey) {
                    this.shuffle();
                }
                break;
            case 'h':
            case 'H':
                this.showHint();
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
        }
        
        // Force close loading state if stuck (Ctrl+Shift+L)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            this.hideLoadingState();
            this.showNotification('Loading state cleared', 'info');
        }
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + N', action: 'New Game' },
            { key: 'Ctrl/Cmd + T', action: 'Tutorial' },
            { key: 'Ctrl/Cmd + D', action: 'Dashboard' },
            { key: 'Ctrl/Cmd + ,', action: 'Settings' },
            { key: 'Ctrl/Cmd + E', action: 'Export Data' },
            { key: 'Ctrl/Cmd + I', action: 'Import Data' },
            { key: 'Ctrl/Cmd + R', action: 'Shuffle' },
            { key: 'Escape', action: 'Back to Menu' },
            { key: 'R', action: 'Shuffle (in game)' },
            { key: 'H', action: 'Hint (in game)' },
            { key: 'Space', action: 'Pause/Resume (in game)' },
            { key: 'F11', action: 'Toggle Fullscreen' },
            { key: 'Ctrl/Cmd + 1-4', action: 'Quick Game Mode Selection' }
        ];

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-grid">
                        ${shortcuts.map(shortcut => `
                            <div class="shortcut-item">
                                <kbd>${shortcut.key}</kbd>
                                <span>${shortcut.action}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    togglePause() {
        if (!this.gameState.isPlaying) return;
        
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.showNotification('Game Paused', 'info');
        } else {
            this.showNotification('Game Resumed', 'success');
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('puzzleMasterSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('puzzleMasterSettings', JSON.stringify(this.settings));
    }

    loadStats() {
        const saved = localStorage.getItem('puzzleMasterStats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    }

    saveStats() {
        localStorage.setItem('puzzleMasterStats', JSON.stringify(this.stats));
    }

    exportGameData() {
        this.playSound('click');
        
        const gameData = {
            stats: this.stats,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        if (this.isElectron) {
            this.exportGameDataElectron(gameData);
        } else {
            this.exportGameDataWeb(gameData);
        }
    }

    exportGameDataWeb(gameData) {
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `puzzle-master-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Game data exported successfully!', 'success');
    }

    async exportGameDataElectron(gameData) {
        try {
            const result = await window.electronAPI.exportData(gameData);
            if (result.success) {
                this.showNotification(`Game data exported to: ${result.path}`, 'success');
            } else if (result.canceled) {
                this.showNotification('Export cancelled', 'info');
            } else {
                this.showNotification(`Export failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Export failed: ${error.message}`, 'error');
        }
    }

    importGameData() {
        this.playSound('click');
        
        if (this.isElectron) {
            this.importGameDataElectron();
        } else {
            this.importGameDataWeb();
        }
    }

    importGameDataWeb() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.id = 'importFileInput';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const gameData = JSON.parse(e.target.result);
                    
                    if (this.validateGameData(gameData)) {
                        this.stats = { ...this.stats, ...gameData.stats };
                        this.settings = { ...this.settings, ...gameData.settings };
                        this.saveStats();
                        this.saveSettings();
                        this.showNotification('Game data imported successfully!', 'success');
                    } else {
                        this.showNotification('Invalid game data file!', 'error');
                    }
                } catch (error) {
                    this.showNotification('Error reading file!', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    async importGameDataElectron() {
        try {
            const result = await window.electronAPI.importData();
            if (result.success) {
                if (this.validateGameData(result.data)) {
                    this.stats = { ...this.stats, ...result.data.stats };
                    this.settings = { ...this.settings, ...result.data.settings };
                    this.saveStats();
                    this.saveSettings();
                    this.showNotification('Game data imported successfully!', 'success');
                } else {
                    this.showNotification('Invalid game data file!', 'error');
                }
            } else if (result.canceled) {
                this.showNotification('Import cancelled', 'info');
            } else {
                this.showNotification(`Import failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Import failed: ${error.message}`, 'error');
        }
    }

    resetGameData() {
        this.playSound('click');
        
        if (confirm('Are you sure you want to reset all game data? This action cannot be undone!')) {
            localStorage.removeItem('puzzleMasterStats');
            localStorage.removeItem('puzzleMasterSettings');
            
            // Reset to default values
            this.stats = {
                gamesPlayed: 0,
                bestTime: null,
                totalScore: 0,
                wins: 0,
                recentGames: [],
                currentStreak: 0,
                longestStreak: 0,
                averageTime: null,
                modeStats: {
                    sliding: { games: 0, bestTime: null, averageTime: null, totalScore: 0 },
                    jigsaw: { games: 0, bestTime: null, averageTime: null, totalScore: 0 },
                    memory: { games: 0, bestTime: null, averageTime: null, totalScore: 0 },
                    word: { games: 0, bestTime: null, averageTime: null, totalScore: 0 }
                },
                achievements: {
                    'first-game': { unlocked: false, progress: 0, max: 1 },
                    'speed-demon': { unlocked: false, progress: 0, max: 1 },
                    'perfectionist': { unlocked: false, progress: 0, max: 10 },
                    'streak-master': { unlocked: false, progress: 0, max: 5 },
                    'puzzle-master': { unlocked: false, progress: 0, max: 4 },
                    'high-scorer': { unlocked: false, progress: 0, max: 10000 }
                },
                progress: {
                    sliding: { level: 1, xp: 0, maxXp: 100 },
                    jigsaw: { level: 1, xp: 0, maxXp: 100 },
                    memory: { level: 1, xp: 0, maxXp: 100 },
                    word: { level: 1, xp: 0, maxXp: 100 }
                }
            };
            
            this.settings = {
                soundEnabled: true,
                showHints: true,
                theme: 'light',
                animationSpeed: 'normal'
            };
            
            this.showNotification('All game data has been reset!', 'success');
        }
    }

    validateGameData(data) {
        return data && 
               data.stats && 
               data.settings && 
               typeof data.stats.gamesPlayed === 'number' &&
               typeof data.settings.soundEnabled === 'boolean';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} bounce-in`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleMaster();
});
