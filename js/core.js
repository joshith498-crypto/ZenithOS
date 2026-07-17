// ZenithOS - Core System & State
// Main initialization file
// 
// NOTE: This file orchestrates all the modules. The order of initialization matters!
// I learned this the hard way when VFS wasn't loaded before Terminal tried to use it.
//
// Also, I spent like an hour debugging why the clock wasn't updating - turned out
// I forgot to call setInterval. Classic me.
//
// FIX: Added setTimeout to ensure DOM is fully loaded before initializing modules

const SystemState = {
    userAccount: 'Astronaut Voyager',
    energyCrystals: parseInt(localStorage.getItem('qos_crystals')) || 0,
    currentPath: ['Desktop'],
    bootTime: Date.now(), // Track when the system booted
    activeWindows: new Set(), // Track open windows
    logs: [] // System activity logs
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
    
    // Add to system logs
    SystemState.logs.unshift({
        timestamp: Date.now(),
        message: message,
        type: 'alert'
    });
    if (SystemState.logs.length > 50) SystemState.logs.pop();
    
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    }, duration);
}

// System logging function
function logSystemEvent(message, type = 'info') {
    SystemState.logs.unshift({
        timestamp: Date.now(),
        message: message,
        type: type
    });
    if (SystemState.logs.length > 50) SystemState.logs.pop();
    
    // Save logs to localStorage
    try {
        localStorage.setItem('zenith_system_logs', JSON.stringify(SystemState.logs));
    } catch (e) {
        console.warn('Failed to save logs:', e);
    }
    
    // Update Mission Control logs if visible
    if (typeof renderSystemLogs === 'function') {
        renderSystemLogs();
    }
}

// Load saved logs on startup
function loadSystemLogs() {
    try {
        const savedLogs = localStorage.getItem('zenith_system_logs');
        if (savedLogs) {
            SystemState.logs = JSON.parse(savedLogs);
        }
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
    if (typeof updateActiveWindows === 'function') {
        updateActiveWindows();
    }
}

// Initialize the system with a delay to ensure DOM is ready
function initializeSystem() {
    // Load system logs
    loadSystemLogs();
    
    // Core Init
    if (typeof setupAuth === 'function') setupAuth();
    initializeClock();
    
    // Wait a bit for auth to complete, then init window manager
    setTimeout(() => {
        if (typeof setupWindowControls === 'function') setupWindowControls();
        if (typeof setupAppLaunchers === 'function') setupAppLaunchers();
        
        // Module Init
        if (typeof VFS !== 'undefined') VFS.init();
        
        // Feature Init - with delay to ensure VFS is ready
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
            
            // Log successful initialization
            logSystemEvent('All modules initialized successfully', 'startup');
        }, 100);
    }, 100);
}

// Use DOMContentLoaded with a small delay to ensure everything is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all scripts are loaded
    setTimeout(initializeSystem, 50);
});

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

    // Clear existing stars (in case of reload)
    field.innerHTML = '';

    // Create 100 stars with random positions and animations
    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "star";
        
        // Random position
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        
        // Random animation delay (0-5 seconds)
        star.style.animationDelay = (Math.random() * 5) + "s";
        
        // Random size (1-3px)
        const size = Math.random() * 2 + 1;
        star.style.width = size + "px";
        star.style.height = size + "px";
        
        // Random opacity (0.3-1)
        star.style.opacity = Math.random() * 0.7 + 0.3;
        
        // Some stars twinkle faster
        if (Math.random() > 0.7) {
            star.style.animationDuration = "1s";
        }
        
        // Some stars are colored (my personal touch)
        if (Math.random() > 0.9) {
            const colors = ['#b794f4', '#f687b3', '#00ff66', '#ffb347'];
            star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            star.style.borderRadius = '50%';
        }
        
        field.appendChild(star);
    }
}

// Make createStarfield available globally
window.createStarfield = createStarfield;

// Make logSystemEvent globally accessible
window.logSystemEvent = logSystemEvent;
