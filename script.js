// Global System Clock Engine Selectors
const liveClock = document.getElementById('live-clock');

// App Selectors: Terminal Window Modules
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.querySelector('.terminal-body');
const mainTerminal = document.getElementById('main-terminal');
const closeTerminalBtn = document.getElementById('close-terminal-btn');
const minTerminalBtn = document.getElementById('min-terminal-btn');
const maxTerminalBtn = document.getElementById('max-terminal-btn');
const terminalShortcut = document.getElementById('terminal-shortcut');
const tabTerminal = document.getElementById('tab-terminal');

// App Selectors: Satellite Maps Window Modules
const videoWindow = document.getElementById('video-window');
const closeVideoBtn = document.getElementById('close-video-btn');
const minVideoBtn = document.getElementById('min-video-btn');
const maxVideoBtn = document.getElementById('max-video-btn');
const videoShortcut = document.getElementById('video-shortcut');
const tabVideo = document.getElementById('tab-video');

// App Selectors: Alien Blaster Window Modules
const gameWindow = document.getElementById('game-window');
const closeGameBtn = document.getElementById('close-game-btn');
const minGameBtn = document.getElementById('min-game-btn');
const maxGameBtn = document.getElementById('max-game-btn');
const gameShortcut = document.getElementById('game-shortcut');
const tabGame = document.getElementById('tab-game');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// App Selectors: Guess Game Cryptor Window Modules
const guessWindow = document.getElementById('guess-window');
const closeGuessBtn = document.getElementById('close-guess-btn');
const minGuessBtn = document.getElementById('min-guess-btn');
const maxGuessBtn = document.getElementById('max-guess-btn');
const guessShortcut = document.getElementById('guess-shortcut');
const tabGuess = document.getElementById('tab-guess');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const guessAttempts = document.getElementById('guess-attempts');
const guessHint = document.getElementById('guess-hint');
const guessResetBtn = document.getElementById('guess-reset-btn');

// --- 1. RUN LIVE SYSTEM CLOCK ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    liveClock.innerText = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// --- 2. MULTI-WINDOW APPLICATION CONTROLLERS (MAC STYLE) ---
function registerWindowControls(shortcut, win, tab, closeBtn, minBtn, maxBtn, focusCallback) {
    // Close Window
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.style.display = 'none';
        tab.style.display = 'none';
    });
    
    // Minimize Window
    minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.style.display = 'none';
        tab.classList.remove('active');
    });

    // Maximize/Restore Toggle Window
    maxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (win.style.width === '100vw') {
            win.style.width = win.dataset.oldWidth || '';
            win.style.height = win.dataset.oldHeight || '';
            win.style.top = '50%';
            win.style.left = '50%';
            win.style.transform = win.dataset.oldTransform || 'translate(-50%, -50%)';
        } else {
            win.dataset.oldWidth = win.style.width;
            win.dataset.oldHeight = win.style.height;
            win.dataset.oldTransform = win.style.transform;
            win.style.width = '100vw';
            win.style.height = 'calc(100vh - 42px)';
            win.style.top = '0';
            win.style.left = '0';
            win.style.transform = 'none';
        }
    });

    // Taskbar and Shortcut toggles
    shortcut.addEventListener('dblclick', () => {
        win.style.display = 'flex';
        tab.style.display = 'block';
        bringToFront(win);
        if (focusCallback) focusCallback();
    });

    tab.addEventListener('click', () => {
        if (win.style.display === 'none' || !tab.classList.contains('active')) {
            win.style.display = 'flex';
            bringToFront(win);
            if (focusCallback) focusCallback();
        } else {
            win.style.display = 'none';
            tab.classList.remove('active');
        }
    });

    win.addEventListener('mousedown', () => bringToFront(win));
}

function bringToFront(windowEl) {
    document.querySelectorAll('.window').forEach(win => win.style.zIndex = "10");
    document.querySelectorAll('.taskbar-tab').forEach(t => t.classList.remove('active'));
    
    windowEl.style.zIndex = "20";
    if (windowEl === mainTerminal) tabTerminal.classList.add('active');
    if (windowEl === videoWindow) tabVideo.classList.add('active');
    if (windowEl === gameWindow) tabGame.classList.add('active');
    if (windowEl === guessWindow) tabGuess.classList.add('active');
}

registerWindowControls(terminalShortcut, mainTerminal, tabTerminal, closeTerminalBtn, minTerminalBtn, maxTerminalBtn, () => terminalInput.focus());
registerWindowControls(videoShortcut, videoWindow, tabVideo, closeVideoBtn, minVideoBtn, maxVideoBtn);
registerWindowControls(gameShortcut, gameWindow, tabGame, closeGameBtn, minGameBtn, maxGameBtn, () => startGameLoop());
registerWindowControls(guessShortcut, guessWindow, tabGuess, closeGuessBtn, minGuessBtn, maxGuessBtn);

// --- 3. CORE TERMINAL INTERACTION LOGIC ---
terminalInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const rawInput = terminalInput.value.trim();
        const commandArgs = rawInput.toLowerCase().split(' ');
        const command = commandArgs[0];
        
        const userLine = document.createElement('p');
        userLine.className = 'glowing-text';
        userLine.innerText = `NASA_USER_>$ ${rawInput}`;
        terminalBody.insertBefore(userLine, terminalInput.parentElement);

        const responseLine = document.createElement('p');
        responseLine.className = 'glowing-text';

        if (command === 'help') {
            responseLine.innerText = 
                '> AVAILABLE COMMANDS:\n' +
                '> [status] - Check core satellite systems\n' +
                '> [rover]  - Fetch Mars Rover tracking details\n' +
                '> [clear]  - Wipe terminal log data';
        } else if (command === 'status') {
            responseLine.innerText = '> ALL SYSTEMS NOMINAL. SATELLITE UPLINK: CONNECTED.';
        } else if (command === 'rover') {
            responseLine.innerText = '> LOCATION: GALE CRATER, MARS\n> BATTERY: 94%\n> MISSION STATUS: NOMINAL';
        } else if (command === 'clear') {
            const allParagraphs = terminalBody.querySelectorAll('p');
            allParagraphs.forEach(p => p.remove());
            terminalInput.value = '';
            return;
        } else if (command === '') {
            responseLine.innerText = '';
        } else {
            responseLine.innerText = `> ERROR: COMMAND "${command}" NOT RECOGNIZED. TYPE "HELP".`;
        }

        terminalBody.insertBefore(responseLine, terminalInput.parentElement);
        terminalInput.value = '';
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
});

// --- 4. ENGINE 1: UPGRADED ALIEN BLASTER (LIVES & VECTOR GRAPHICS) ---
let gameInterval;
let shipX = canvas.width / 2 - 15;
let lasers = [];
let aliens = [];
let keys = {};
let gameScore = 0;
let playerLives = 3;
let isGameOver = false;
let screenFlash = 0;

document.addEventListener('keydown', (e) => { if (gameWindow.style.display === 'flex') keys[e.key] = true; });
document.addEventListener('keyup', (e) => { 
    if (gameWindow.style.display === 'flex') keys[e.key] = false;
    if (e.key === ' ' && gameWindow.style.display === 'flex' && !isGameOver) {
        lasers.push({x: shipX + 15, y: canvas.height - 25});
    }
});

function spawnAlien() {
    if (gameWindow.style.display === 'flex' && aliens.length < 6 && !isGameOver) {
        aliens.push({
            x: Math.random() * (canvas.width - 30), 
            y: -20, 
            speed: 1.5 + Math.random() * 2,
            animFrame: 0
        });
    }
}
setInterval(spawnAlien, 1200);

function startGameLoop() {
    clearInterval(gameInterval);
    shipX = canvas.width / 2 - 15;
    lasers = []; aliens = []; gameScore = 0;
    playerLives = 3; isGameOver = false; screenFlash = 0;
    gameInterval = setInterval(updateGame, 1000 / 30);
}

// Vector Render Method for High Tech Star Fighter Design
function drawSciFiShip(x, y) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ff66';
    ctx.fillStyle = '#00ff66';
    
    ctx.beginPath();
    ctx.moveTo(x + 15, y);       // Nose cone spike
    ctx.lineTo(x + 22, y + 10);  // Right cockpit panel
    ctx.lineTo(x + 30, y + 18);  // Right swept wing tip
    ctx.lineTo(x + 22, y + 18);  // Right thruster engine node
    ctx.lineTo(x + 18, y + 24);  // Central hyperdrive stabilizer
    ctx.lineTo(x + 12, y + 24);  
    ctx.lineTo(x + 8, y + 18);   // Left thruster node
    ctx.lineTo(x, y + 18);       // Left swept wing tip
    ctx.lineTo(x + 8, y + 10);   // Left cockpit panel
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow array loops
}

// Vector Render Method for Custom Space Monster/Alien
function drawAlienInvader(x, y) {
    ctx.fillStyle = '#ff3366';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff3366';
    
    // Core alien shell graphic matrix mapping
    ctx.fillRect(x + 6, y, 12, 4);
    ctx.fillRect(x + 4, y + 4, 16, 4);
    ctx.fillRect(x, y + 8, 24, 4);
    ctx.fillRect(x, y + 12, 6, 4);
    ctx.fillRect(x + 9, y + 12, 6, 4);
    ctx.fillRect(x + 18, y + 12, 6, 4);
    ctx.fillRect(x, y + 16, 4, 4);
    ctx.fillRect(x + 20, y + 16, 4, 4);

    ctx.fillStyle = '#000000'; // Alien laser target eyes
    ctx.fillRect(x + 6, y + 4, 2, 2);
    ctx.fillRect(x + 16, y + 4, 2, 2);
    ctx.shadowBlur = 0;
}

function updateGame() {
    if (isGameOver) {
        // Render retro arcade style Game Over interface modal block
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff3366';
        ctx.font = 'bold 24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText("CRITICAL IMPACT: GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.fillStyle = '#00ff66';
        ctx.font = '12px "Courier New"';
        ctx.fillText("DOUBLE-CLICK SHORTCUT TO REBOOT SYSTEM", canvas.width / 2, canvas.height / 2 + 20);
        ctx.textAlign = 'left'; // Reset alignment pointer mapping rules
        return;
    }

    // Handle user positional tracking movement loops
    if (keys['ArrowLeft'] && shipX > 0) shipX -= 6;
    if (keys['ArrowRight'] && shipX < canvas.width - 30) shipX += 6;

    // Advance projectiles physics matrices
    lasers.forEach((l, li) => {
        l.y -= 9;
        if (l.y < 0) lasers.splice(li, 1);
    });

    // Advance enemy entity states
    aliens.forEach((a, ai) => {
        a.y += a.speed;
        
        // Dynamic impact vector checking against player base coordinates
        if (a.y > canvas.height - 35 && a.x > shipX - 18 && a.x < shipX + 24) {
            aliens.splice(ai, 1);
            playerLives--;
            screenFlash = 4; // Trigger execution flash loop flag
            if (playerLives <= 0) isGameOver = true;
        } else if (a.y > canvas.height) {
            aliens.splice(ai, 1);
        }

        // Projectile targeting overlap array intersections checking loop
        lasers.forEach((l, li) => {
            if (l.x > a.x && l.x < a.x + 24 && l.y > a.y && l.y < a.y + 20) {
                aliens.splice(ai, 1);
                lasers.splice(li, 1);
                gameScore += 10;
            }
        });
    });

    // Canvas graphic generation draw passes
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Screen hit shake damage effect canvas wrapper logic overlay
    if (screenFlash > 0) {
        ctx.fillStyle = 'rgba(255, 0, 85, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        screenFlash--;
    }

    // Render operations passes elements
    drawSciFiShip(shipX, canvas.height - 28);
    lasers.forEach(l => {
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(l.x - 1, l.y, 3, 8);
    });
    aliens.forEach(a => drawAlienInvader(a.x, a.y));

    // UI Dashboards tracking render pass
    ctx.fillStyle = '#00ff66';
    ctx.font = '12px "Courier New"';
    ctx.fillText(`SCORE: ${gameScore}`, 10, 20);
    
    // Draw life tracker nodes on header panel
    ctx.fillText("MODULES:", canvas.width - 140, 20);
    for(let i=0; i < playerLives; i++) {
        drawSciFiShip(canvas.width - 75 + (i * 22), 8);
    }
}

// --- 5. ENGINE 2: GUESS THE NUMBER FREQUENCY DECRYPTOR ---
let secretCode; let attemptsLeft;
function initGuessGame() {
    secretCode = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = 7;
    guessAttempts.innerText = `CELL POWER REMAINING: ${attemptsLeft}`;
    guessHint.innerText = ''; guessInput.value = ''; guessInput.disabled = false;
    guessBtn.style.display = 'inline-block'; guessResetBtn.style.display = 'none';
}
guessBtn.addEventListener('click', () => {
    const playerGuess = parseInt(guessInput.value);
    if (isNaN(playerGuess) || playerGuess < 1 || playerGuess > 100) {
        guessHint.innerText = '> INVALID FREQUENCY DATA BOUNDS.'; return;
    }
    attemptsLeft--;
    if (playerGuess === secretCode) {
        guessHint.innerText = `> SUCCESS!! SIGNAL ACQUIRED ON FREQUENCY [${secretCode}].`;
        guessHint.style.color = '#00ff66'; endGuessGame();
    } else if (attemptsLeft <= 0) {
        guessHint.innerText = `> DECRYPTION TIMEOUT. SIGNAL LOST. FREQ WAS [${secretCode}].`;
        guessHint.style.color = '#ff3366'; endGuessGame();
    } else {
        guessHint.style.color = '#ffcc00';
        guessHint.innerText = playerGuess > secretCode ? '> TARGET FREQUENCY IS LOWER.' : '> TARGET FREQUENCY IS HIGHER.';
        guessAttempts.innerText = `CELL POWER REMAINING: ${attemptsLeft}`;
    }
});
function endGuessGame() { guessInput.disabled = true; guessBtn.style.display = 'none'; guessResetBtn.style.display = 'inline-block'; }
guessResetBtn.addEventListener('click', initGuessGame);
initGuessGame();

// --- 6. UNIVERSAL WINDOW DRAG & RESIZE INFRASTRUCTURE (MAC STYLING COMPATIBLE) ---
function setupWindowInfrastructure(headerId, windowId, width, height) {
    const dragItem = document.getElementById(headerId);
    const container = document.getElementById(windowId);
    const resizeHandle = container.querySelector('.resize-handle');

    let xOffset = -(width / 2); let yOffset = -(height / 2);
    container.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
    container.style.width = `${width}px`; container.style.height = `${height}px`;

    let isDragging = false; let isResizing = false;
    let currentX = xOffset; let currentY = yOffset;
    let initialX = 0; let initialY = 0;
    let startWidth = 0; let startHeight = 0;

    // Mouse Down For Window Dragging Engine
    dragItem.addEventListener("mousedown", (e) => {
        if(e.target.classList.contains('mac-dot')) return;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
        bringToFront(container);
    });

    // Mouse Down For Corner Resizing Engine Handles
    if (resizeHandle) {
        resizeHandle.addEventListener("mousedown", (e) => {
            e.preventDefault(); e.stopPropagation();
            startWidth = parseInt(document.defaultView.getComputedStyle(container).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(container).height, 10);
            initialX = e.clientX;
            initialY = e.clientY;
            isResizing = true;
            bringToFront(container);
        });
    }

    document.addEventListener("mouseup", () => {
        if (isDragging) { initialX = currentX; initialY = currentY; isDragging = false; }
        if (isResizing) { isResizing = false; }
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging && container.style.width !== '100vw') {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX; yOffset = currentY;
            container.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
        if (isResizing) {
            e.preventDefault();
            const newWidth = startWidth + (e.clientX - initialX);
            const newHeight = startHeight + (e.clientY - initialY);
            container.style.width = `${newWidth}px`;
            container.style.height = `${newHeight}px`;
        }
    });
}

// Map parameters layout to configuration loaders initialization pass
setupWindowInfrastructure("terminal-header", "main-terminal", 650, 450);
setupWindowInfrastructure("video-header", "video-window", 550, 380);
setupWindowInfrastructure("game-header", "game-window", 510, 410);
setupWindowInfrastructure("guess-header", "guess-window", 400, 260);