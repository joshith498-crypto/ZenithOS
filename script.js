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

// --- GLOBAL TELEMETRY CLOCK SYSTEM ---
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

// --- HARDWARE TELEMETRY ANALYZER ---
function loadHardwareTelemetry() {
    const hardwareLabel = document.getElementById('spec-hardware');
    const osLabel = document.getElementById('spec-os');
    const browserLabel = document.getElementById('spec-browser');
    if(hardwareLabel) hardwareLabel.textContent = "ThinkPad Framework Architecture (i3 Matrix)";
    if(osLabel) osLabel.textContent = "NASA Core Linux Shell Embedded v6.0";
    if(browserLabel) browserLabel.textContent = navigator.userAgent.split(" ").slice(-1)[0] || "Webkit Kernel Engine";
}

// --- SECURE WINDOW INTERACTION ARCHITECTURE ---
function setupWindowControls() {
    const windows = document.querySelectorAll('.mac-window');
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        const closeBtn = win.querySelector('.close-btn');
        const minBtn = win.querySelector('.min-btn');
        const maxBtn = win.querySelector('.max-btn');
        if(closeBtn) closeBtn.addEventListener('click', () => win.style.display = 'none');
        if(minBtn) minBtn.addEventListener('click', () => win.style.display = 'none');
        if(maxBtn) {
            maxBtn.addEventListener('click', () => {
                if(win.style.width === '100vw') {
                    win.style.width = '620px'; win.style.height = '390px';
                } else { win.style.width = '100vw'; win.style.height = 'calc(100vh - 26px)'; }
            });
        }
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        header.addEventListener('mousedown', (e) => {
            if(e.target.classList.contains('dot')) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            initialLeft = win.offsetLeft; initialTop = win.offsetTop;
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            win.style.left = `${initialLeft + (e.clientX - startX)}px`;
            win.style.top = `${initialTop + (e.clientY - startY)}px`;
        });
        document.addEventListener('mouseup', () => isDragging = false);
    });
}

// --- APP ROUTERS AND LAUNCH INTERFACES ---
function setupAppLaunchers() {
    const launchConfig = [
        { triggerId: 'shortcut-finder', targetWindowId: 'window-finder' },
        { triggerId: 'shortcut-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'shortcut-games', targetWindowId: 'window-games' },
        { triggerId: 'shortcut-projects', targetWindowId: 'window-projects' },
        { triggerId: 'shortcut-settings', targetWindowId: 'window-settings' },
        { triggerId: 'dock-finder', targetWindowId: 'window-finder' },
        { triggerId: 'dock-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'dock-games', targetWindowId: 'window-games' },
        { triggerId: 'dock-projects', targetWindowId: 'window-projects' },
        { triggerId: 'dock-settings', targetWindowId: 'window-settings' }
    ];
    launchConfig.forEach(cfg => {
        const trigger = document.getElementById(cfg.triggerId);
        const win = document.getElementById(cfg.targetWindowId);
        if(trigger && win) trigger.addEventListener('click', (e) => { e.preventDefault(); win.style.display = 'flex'; });
    });
}

// --- NEW FEATURES: WEATHER & FINDER MANAGEMENT ---
window.fetchWeather = async function() {
    const display = document.getElementById('weather-display');
    display.textContent = "UPLINKING...";
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current_weather=true');
        const data = await res.json();
        display.textContent = `External Temp: ${data.current_weather.temperature}°C`;
    } catch(e) { display.textContent = "ERR: LINK DISCONNECTED"; }
};

window.createFinderFile = function() {
    const name = prompt("Enter new file name:");
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
};

// --- ENVIRONMENT WALLPAPER ENGINE ---
function setupWallpaperEngine() {
    const bg = document.getElementById('desktop-bg');
    document.querySelectorAll('.wp-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            bg.className = 'desktop-workspace'; 
            bg.classList.add(`bg-${btn.getAttribute('data-color')}`);
        });
    });
}

// --- ARCADE MODULES ---
function setupArcadeModules() {
    const asteroid = document.getElementById('asteroid-element');
    if(asteroid) asteroid.addEventListener('click', () => {
        SystemState.energyCrystals++;
        document.getElementById('crystal-count').textContent = SystemState.energyCrystals;
    });
}

// --- TERMINAL CONSOLE ---
function setupTerminalConsole() {
    const input = document.getElementById('terminal-input');
    const body = document.querySelector('.terminal-body');
    if(!input) return;
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            input.value = '';
            if(cmd === 'clear') body.querySelectorAll('p:not(.glowing-text)').forEach(p => p.remove());
            else if(cmd === 'crystals') alert(`Energy: ${SystemState.energyCrystals}`);
        }
    });
}

// --- POPUP UTILITY ---
function showGlobalAlert(message) {
    const popup = document.getElementById('system-popup');
    if(popup) {
        document.getElementById('popup-text').textContent = message;
        popup.style.display = 'block';
        setTimeout(() => { popup.style.display = 'none'; }, 5000);
    }
        }
