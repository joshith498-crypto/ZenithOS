// --- CENTRALIZED STATE MANAGEMENT FRAMEWORK ---
const SystemState = {
    userAccount: 'Astronaut Voyager',
    energyCrystals: 0,
    currentPath: 'root/desktop/'
};

// --- INITIALIZE BOOT SEQUENCE ---
document.addEventListener('DOMContentLoaded', () => {
    initializeClock();
    setupWindowControls();
    setupAppLaunchers();
    setupWallpaperEngine();
    setupArcadeModules();
    setupTerminalConsole();
    showGlobalAlert("Welcome to NASA Quantum OS. All systems nominal.");
    loadHardwareTelemetry();
});

// --- ORIGINAL FUNCTIONS PRESERVED ---
function initializeClock() {
    const clockElement = document.getElementById('live-clock');
    const updateTime = () => {
        const d = new Date();
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        if(clockElement) clockElement.textContent = `${h}:${m} ${ampm}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function loadHardwareTelemetry() {
    const hardwareLabel = document.getElementById('spec-hardware');
    const osLabel = document.getElementById('spec-os');
    const browserLabel = document.getElementById('spec-browser');
    if(hardwareLabel) hardwareLabel.textContent = "ThinkPad Framework Architecture (i3 Matrix)";
    if(osLabel) osLabel.textContent = "NASA Core Linux Shell Embedded v6.0";
    if(browserLabel) browserLabel.textContent = navigator.userAgent.split(" ").slice(-1)[0] || "Webkit Kernel Engine";
}

function setupWindowControls() {
    const windows = document.querySelectorAll('.mac-window');
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        const closeBtn = win.querySelector('.close-btn');
        if(closeBtn) closeBtn.addEventListener('click', () => win.style.display = 'none');
        
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        header.addEventListener('mousedown', (e) => {
            if(e.target.classList.contains('dot')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = win.offsetLeft;
            initialTop = win.offsetTop;
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            win.style.left = `${initialLeft + (e.clientX - startX)}px`;
            win.style.top = `${initialTop + (e.clientY - startY)}px`;
        });
        document.addEventListener('mouseup', () => isDragging = false);
    });
}

// --- NEW FEATURE: WEATHER APP ---
async function fetchWeather() {
    const display = document.getElementById('weather-display');
    display.textContent = "UPLINKING...";
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current_weather=true');
        const data = await res.json();
        display.textContent = `Hyderabad: ${data.current_weather.temperature}°C`;
    } catch(e) { display.textContent = "UPLINK ERROR"; }
}

// --- NEW FEATURE: FINDER FILE SYSTEM ---
function createFinderFile() {
    const name = prompt("Enter file name:");
    if(name) {
        const viewport = document.getElementById('finder-file-viewport');
        const file = document.createElement('div');
        file.className = 'file-item';
        file.textContent = "📄 " + name;
        file.onclick = () => {
            const newName = prompt("Rename to:", name);
            if(newName) file.textContent = "📄 " + newName;
        };
        viewport.appendChild(file);
    }
}

// --- PRESERVING YOUR ORIGINAL LOGIC FOR APP LAUNCHERS/TERMINAL/ETC ---
function setupAppLaunchers() {
    const launchConfig = [
        { triggerId: 'shortcut-finder', targetWindowId: 'window-finder' },
        { triggerId: 'shortcut-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'shortcut-games', targetWindowId: 'window-games' },
        { triggerId: 'shortcut-projects', targetWindowId: 'window-projects' },
        { triggerId: 'shortcut-settings', targetWindowId: 'window-settings' }
    ];
    launchConfig.forEach(cfg => {
        const trigger = document.getElementById(cfg.triggerId);
        const win = document.getElementById(cfg.targetWindowId);
        if(trigger && win) {
            trigger.addEventListener('click', () => win.style.display = 'flex');
        }
    });
}

function showGlobalAlert(message) {
    const popup = document.getElementById('system-popup');
    const text = document.getElementById('popup-text');
    if(popup && text) {
        text.textContent = message;
        popup.style.display = 'block';
        setTimeout(() => { popup.style.display = 'none'; }, 5000);
    }
}

// Ensure new functions are global
window.fetchWeather = fetchWeather;
window.createFinderFile = createFinderFile;

// [KEEP YOUR ORIGINAL setupWallpaperEngine, setupArcadeModules, setupTerminalConsole HERE]
    
