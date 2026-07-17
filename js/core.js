// ZenithOS - Core System & State
// Main initialization file
// 
// NOTE: This file orchestrates all the modules. The order of initialization matters!
// I learned this the hard way when VFS wasn't loaded before Terminal tried to use it.
//
// FIX: Using setTimeout to ensure DOM is fully parsed before initialization

const SystemState = {
    userAccount: 'Astronaut Voyager',
    energyCrystals: parseInt(localStorage.getItem('qos_crystals')) || 0,
    currentPath: ['Desktop'],
    bootTime: Date.now(),
    activeWindows: new Set(),
    logs: []
};

// Global uptime function for neofetch command
function getUptime() {
    const seconds = Math.floor((Date.now() - SystemState.bootTime) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

// Global alert system
function showGlobalAlert(message, duration = 3000) {
    const popup = document.getElementById('system-popup');
    const popupText = document.getElementById('popup-text');
    if (!popup || !popupText) return;
    
    popupText.textContent = message;
    popup.style.display = 'block';
    popup.style.opacity = '1';
    
    SystemState.logs.unshift({ timestamp: Date.now(), message: message, type: 'alert' });
    if (SystemState.logs.length > 50) SystemState.logs.pop();
    
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.style.display = 'none', 300);
    }, duration);
}

// System logging function
function logSystemEvent(message, type = 'info') {
    SystemState.logs.unshift({ timestamp: Date.now(), message: message, type: type });
    if (SystemState.logs.length > 50) SystemState.logs.pop();
    
    try {
        localStorage.setItem('zenith_system_logs', JSON.stringify(SystemState.logs));
    } catch (e) {
        console.warn('Failed to save logs:', e);
    }
    
    if (typeof renderSystemLogs === 'function') renderSystemLogs();
}

// Load saved logs on startup
function loadSystemLogs() {
    try {
        const savedLogs = localStorage.getItem('zenith_system_logs');
        if (savedLogs) SystemState.logs = JSON.parse(savedLogs);
    } catch (e) {
        console.warn('Failed to load logs:', e);
        SystemState.logs = [];
    }
}

// Track active windows
function registerWindow(windowId) {
    SystemState.activeWindows.add(windowId);
    updateMissionControl();
    logSystemEvent(`Window opened: ${windowId}`);
}

function unregisterWindow(windowId) {
    SystemState.activeWindows.delete(windowId);
    updateMissionControl();
    logSystemEvent(`Window closed: ${windowId}`);
}

function updateMissionControl() {
    if (typeof updateActiveWindows === 'function') updateActiveWindows();
}

// Initialize everything
function initializeSystem() {
    loadSystemLogs();
    
    // Step 1: Auth
    if (typeof setupAuth === 'function') setupAuth();
    
    // Step 2: Clock
    initializeClock();
    
    // Step 3: Window manager
    if (typeof setupWindowControls === 'function') setupWindowControls();
    if (typeof setupAppLaunchers === 'function') setupAppLaunchers();
    
    // Step 4: VFS
    if (typeof VFS !== 'undefined') VFS.init();
    
    // Step 5: All features (with small delay to ensure DOM is ready)
    setTimeout(() => {
        if (typeof setupFinder === 'function') setupFinder();
        if (typeof setupWallpaperEngine === 'function') setupWallpaperEngine();
        if (typeof setupArcadeModules === 'function') setupArcadeModules();
        if (typeof setupSnakeGame === 'function') setupSnakeGame();
        if (typeof setupMinesweeper === 'function') setupMinesweeper();
        if (typeof setupMemoryGame === 'function') setupMemoryGame();
        if (typeof setupTerminalConsole === 'function') setupTerminalConsole();
        if (typeof setupMissionControl === 'function') setupMissionControl();
        if (typeof setupControlCenter === 'function') setupControlCenter();
        if (typeof setupSettingsPanel === 'function') setupSettingsPanel();
        if (typeof setupNotesApp === 'function') setupNotesApp();
        if (typeof setupCalculator === 'function') setupCalculator();
        if (typeof setupSpotlight === 'function') setupSpotlight();
        
        loadHardwareTelemetry();
        createStarfield();
        logSystemEvent('All modules initialized', 'startup');
    }, 50);
}

// Initialize when DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeSystem, 0);
} else {
    document.addEventListener('DOMContentLoaded', initializeSystem);
}

function initializeClock() {
    const clockElement = document.getElementById('live-clock');
    const updateTime = () => {
        const d = new Date();
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        if (clockElement) clockElement.textContent = `${h}:${m} ${ampm}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function loadHardwareTelemetry() {
    const hardwareLabel = document.getElementById('spec-hardware');
    const osLabel = document.getElementById('spec-os');
    const browserLabel = document.getElementById('spec-browser');

    if (hardwareLabel) hardwareLabel.textContent = "ThinkPad Framework Architecture (i3 Matrix)";
    if (osLabel) osLabel.textContent = "NASA Core Linux Shell Embedded v6.0";
    if (browserLabel) browserLabel.textContent = navigator.userAgent.split(" ").slice(-1)[0] || "Webkit Kernel Engine";
}

function runBootSequence() {
    const screen = document.getElementById('boot-screen');
    const fill = document.getElementById('boot-bar-fill');
    const log = document.getElementById('boot-log');
    if (!screen) return;

    const lines = [
        'INITIALIZING ZENITH KERNEL...',
        'MOUNTING VIRTUAL FILE SYSTEM...',
        'CALIBRATING TELEMETRY ARRAY...',
        'LINKING DEEP SPACE NETWORK...',
        'LOADING DOCK INTERFACE...',
        'STARTING WINDOW MANAGER...',
        'INITIALIZING STARFIELD RENDERER...',
        'LOADING SYSTEM LOGS...',
        'ALL SYSTEMS NOMINAL.'
    ];

    let i = 0;
    const total = lines.length;
    const step = () => {
        if (i >= total) {
            setTimeout(() => {
                screen.style.opacity = '0';
                setTimeout(() => {
                    screen.style.display = 'none';
                    if (typeof showGlobalAlert === 'function') {
                        showGlobalAlert(`Welcome back, ${SystemState.userAccount}. All systems nominal.`);
                    }
                    logSystemEvent('System booted successfully', 'startup');
                }, 500);
            }, 250);
            return;
        }
        const p = document.createElement('div');
        p.textContent = `> ${lines[i]}`;
        if (log) log.appendChild(p);
        if (fill) fill.style.width = `${Math.round(((i + 1) / total) * 100)}%`;
        i++;
        setTimeout(step, 280);
    };
    step();
}

// Starfield background
function createStarfield() {
    const field = document.getElementById("starfield");
    if (!field) return;

    field.innerHTML = '';

    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        star.style.animationDelay = (Math.random() * 5) + "s";
        const size = Math.random() * 2 + 1;
        star.style.width = size + "px";
        star.style.height = size + "px";
        star.style.opacity = Math.random() * 0.7 + 0.3;
        if (Math.random() > 0.7) star.style.animationDuration = "1s";
        if (Math.random() > 0.9) {
            const colors = ['#b794f4', '#f687b3', '#00ff66', '#ffb347'];
            star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            star.style.borderRadius = '50%';
        }
        field.appendChild(star);
    }
}

// Make functions globally available
window.createStarfield = createStarfield;
window.logSystemEvent = logSystemEvent;
window.showGlobalAlert = showGlobalAlert;
window.getUptime = getUptime;
window.SystemState = SystemState;
