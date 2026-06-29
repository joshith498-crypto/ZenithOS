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

// --- SECURE WINDOW INTERACTION ARCHITECTURE (MOVE/CLOSE/MIN) ---
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
                    win.style.width = '620px';
                    win.style.height = '390px';
                    win.style.top = '15%';
                    win.style.left = '25%';
                } else {
                    win.style.width = '100vw';
                    win.style.height = 'calc(100vh - 26px)';
                    win.style.top = '26px';
                    win.style.left = '0';
                }
            });
        }

        win.addEventListener('mousedown', () => {
            windows.forEach(w => w.style.zIndex = '1000');
            win.style.zIndex = '2000';
        });

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            if(e.target.classList.contains('dot')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = win.offsetLeft;
            initialTop = win.offsetTop;
            document.styleSheets[0].insertRule('* { user-select: none !important; }', 0);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            win.style.left = `${initialLeft + deltaX}px`;
            win.style.top = `${initialTop + deltaY}px`;
        });

        document.addEventListener('mouseup', () => {
            if(isDragging) {
                isDragging = false;
                if(document.styleSheets[0].cssRules[0].cssText.includes('user-select')) {
                    document.styleSheets[0].deleteRule(0);
                }
            }
        });
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
        if(trigger && win) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                win.style.display = 'flex';
                win.style.zIndex = '2000';
            });
        }
    });

    const sidebarItems = document.querySelectorAll('.finder-sidebar .sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            renderDirectory(item.getAttribute('data-dir'));
        });
    });
    renderDirectory('desktop');
}

function renderDirectory(dir) {
    const viewport = document.getElementById('finder-file-viewport');
    const pathLabel = document.getElementById('finder-title-path');
    const headLabel = document.getElementById('finder-current-heading');
    
    if(!viewport) return;
    pathLabel.textContent = `Finder — root/${dir}/`;
    headLabel.textContent = `${dir.toUpperCase()} Directory Matrix`;

    const fileMap = {
        desktop: ['🛰️ satellite_comm.log', '📟 terminal_core.sh', '🎮 asteroid_dodge.app'],
        documents: ['📑 cosmic_mission_plan.txt', '💾 matrix_backup.dat'],
        downloads: ['📦 node_modules.tar.gz', '📦 css_theme_patch.pkg'],
        system: ['⚙️ core_telemetry.sys', '🛡️ security_layer.key'],
        trash: ['🗑️ broken_config.bak', '🗑️ old_workspace_dump.zip']
    };

    viewport.innerHTML = '';
    (fileMap[dir] || []).forEach(file => {
        viewport.insertAdjacentHTML('beforeend', `<div class="file-item">${file}</div>`);
    });
}

// --- ENVIRONMENT WALLPAPER INTERFACE MANAGEMENT ---
function setupWallpaperEngine() {
    const bg = document.getElementById('desktop-bg');
    const buttons = document.querySelectorAll('.wp-btn');
    const tabs = document.querySelectorAll('.settings-sidebar .settings-nav-item');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            bg.className = 'desktop-workspace'; 
            const variant = btn.getAttribute('data-color');
            bg.classList.add(`bg-${variant}`);
            showGlobalAlert(`Wallpaper updated to: [${variant.toUpperCase()}]`);
        });
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetedTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.settings-tab-panel').forEach(p => p.style.display = 'none');
            document.getElementById(targetedTab).style.display = 'block';
        });
    });
}

// --- ARCADE SIMULATION CONTROLLER SYSTEMS ---
function setupArcadeModules() {
    const asteroid = document.getElementById('asteroid-element');
    const countDisplay = document.getElementById('crystal-count');
    const arcadeTabs = document.querySelectorAll('.arcade-sidebar .arcade-nav-item');

    if(asteroid) {
        asteroid.addEventListener('click', () => {
            SystemState.energyCrystals++;
            if(countDisplay) countDisplay.textContent = SystemState.energyCrystals;
        });
    }

    arcadeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            arcadeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const selectedGame = tab.getAttribute('data-game');
            document.querySelectorAll('.arcade-panel').forEach(p => p.style.display = 'none');
            document.getElementById(selectedGame).style.display = 'block';
        });
    });
}

// --- SIMULATED TERMINAL INTERFACE INTERACTIVE SHELL ---
function setupTerminalConsole() {
    const input = document.getElementById('terminal-input');
    const body = document.querySelector('.terminal-body');

    if(!input) return;

    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            input.value = '';

            let responseText = '';
            if(command === 'help') {
                responseText = 'Available protocols: clear, telemetry, crystals, unlock-all, matrix-reboot';
            } else if(command === 'clear') {
                body.querySelectorAll('p').forEach(p => p.remove());
                return;
            } else if(command === 'telemetry') {
                responseText = `Node Account: ${SystemState.userAccount} | Security Link: Active.`;
            } else if(command === 'crystals') {
                responseText = `Harvested Energy Balance: [${SystemState.energyCrystals}] Cells.`;
            } else if(command === 'unlock-all') {
                document.querySelectorAll('.mac-window').forEach(w => w.style.display = 'flex');
                responseText = 'ALERT: Omnipresent diagnostic layout deployed.';
            } else if(command === 'matrix-reboot') {
                responseText = 'WARNING: System rebooting...';
                setTimeout(() => location.reload(), 1500);
            } else if(command !== '') {
                responseText = `sh: command not found: ${command}. Type 'help'.`;
            }

            if(responseText) {
                const line = document.createElement('p');
                line.className = 'glowing-text';
                line.style.fontSize = '12px';
                line.textContent = `> ${responseText}`;
                body.insertBefore(line, input.parentElement);
                body.scrollTop = body.scrollHeight;
            }
        }
    });
}

// --- POPUP BANNER UTILITY INTERFACES ---
function showGlobalAlert(message) {
    const popup = document.getElementById('system-popup');
    const text = document.getElementById('popup-text');
    const closeBtn = document.getElementById('close-popup');

    if(!popup || !text) return;

    text.textContent = message;
    popup.style.display = 'block';

    if(closeBtn) {
        closeBtn.onclick = () => popup.style.display = 'none';
    }
    setTimeout(() => { popup.style.display = 'none'; }, 5000);
}

window.saveDevlog = function() {
    const logVal = document.getElementById('devlogInput').value;
    const status = document.getElementById('devlogStatus');
    if(logVal.trim() !== "") {
        status.textContent = "Log shipped successfully.";
        status.style.color = "#00ff66";
        document.getElementById('devlogInput').value = "";
        showGlobalAlert("Operational log matrix synchronized.");
    } else {
        status.textContent = "Error: Block cannot be shipped empty.";
        status.style.color = "#ff3366";
    }
};
