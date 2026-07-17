// ZenithOS - Core System & State
// Main initialization file
// 
// NOTE: This file orchestrates all the modules. The order of initialization matters!
// I learned this the hard way when VFS wasn't loaded before Terminal tried to use it.

const SystemState = {
    userAccount: 'Astronaut Voyager',
    energyCrystals: parseInt(localStorage.getItem('qos_crystals')) || 0,
    currentPath: ['Desktop'],
    bootTime: Date.now(), // Track when the system booted
    activeWindows: new Set() // Track open windows
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
    
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    }, duration);
}

// Track active windows
function registerWindow(windowId) {
    SystemState.activeWindows.add(windowId);
    updateMissionControl();
}

function unregisterWindow(windowId) {
    SystemState.activeWindows.delete(windowId);
    updateMissionControl();
}

function updateMissionControl() {
    if (typeof updateActiveWindows === 'function') {
        updateActiveWindows();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Core Init
    if (typeof setupAuth === 'function') setupAuth();
    initializeClock();
    setupWindowControls();
    
    // Module Init
    if (typeof VFS !== 'undefined') VFS.init();
    setupAppLaunchers();
    
    // Feature Init
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
    
    // Initialize starfield after everything else
    createStarfield();
    
    // Set up global error handler for debugging
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('ZenithOS Error:', message, 'in', source, 'at line', lineno);
        showGlobalAlert(`System Error: ${message}`);
        return true; // Prevent default browser error handling
    };
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
        
        field.appendChild(star);
    }
}

// Make createStarfield available globally
window.createStarfield = createStarfield;
