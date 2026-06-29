// --- CENTRALIZED STATE MANAGEMENT FRAMEWORK ---
const SystemState = {
    userAccount: localStorage.getItem('nasa_user') || 'Astronaut',
    isLocked: true,
    energyCrystals: 0,
    currentPath: 'root/desktop/'
};

// --- INITIALIZE BOOT SEQUENCE ---
document.addEventListener('DOMContentLoaded', () => {
    injectLockScreen();
    initializeClock();
    setupWindowControls();
    setupAppLaunchers();
    setupWallpaperEngine();
    setupArcadeModules();
    setupTerminalConsole();
});

// --- 1. CORE LOCK SCREEN & ACCOUNT MANAGEMENT ENGINE ---
function injectLockScreen() {
    // Check if account already exists in local storage
    const storedPass = localStorage.getItem('nasa_pass');
    const hasAccount = !!storedPass;

    const lockHTML = `
        <div id="system-lock-screen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: radial-gradient(circle, #0f172a 0%, #020617 100%); z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; color: #fff;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 40px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); width: 340px; text-align: center; backdrop-filter: blur(20px);">
                <div style="font-size: 50px; margin-bottom: 16px; animation: pulse 2s infinite;">🛰️</div>
                <h2 id="lock-title" style="margin: 0 0 8px 0; font-size: 20px; font-weight: 500; color: #00ff66;">${hasAccount ? 'Access Terminal Locked' : 'Create Space Interface Account'}</h2>
                <p id="lock-subtitle" style="margin: 0 0 24px 0; font-size: 13px; color: #64748b;">${hasAccount ? 'Enter clearance credentials' : 'Register core workstation user profile'}</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                    <input type="text" id="lock-user" placeholder="Account User ID" value="${hasAccount ? SystemState.userAccount : ''}" ${hasAccount ? 'disabled' : ''} style="width: 100%; background: #020617; border: 1px solid rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; color: #00ff66; font-family: monospace; font-size: 14px; box-sizing: border-box; text-align: center; outline: none;">
                    <input type="password" id="lock-pass" placeholder="Clearance Password" style="width: 100%; background: #020617; border: 1px solid rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; color: #00ff66; font-family: monospace; font-size: 14px; box-sizing: border-box; text-align: center; outline: none;">
                    <button id="lock-submit-btn" style="width: 100%; background: #00ff66; color: #000; font-weight: bold; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: background 0.2s;">${hasAccount ? 'UNLOX MATRIX' : 'PROVISION NOW'}</button>
                </div>
                ${hasAccount ? '<p id="reset-profile" style="margin: 16px 0 0 0; font-size: 11px; color: #ef4444; cursor: pointer; text-decoration: underline;">Clear Current Account Profile</p>' : ''}
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lockHTML);

    // Event Triggers
    const submitBtn = document.getElementById('lock-submit-btn');
    const passInput = document.getElementById('lock-pass');
    
    submitBtn.addEventListener('click', processSecurityClearance);
    passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') processSecurityClearance(); });

    if (hasAccount) {
        document.getElementById('reset-profile').addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    }
}

function processSecurityClearance() {
    const userField = document.getElementById('lock-user').value.trim();
    const passField = document.getElementById('lock-pass').value.trim();
    const storedPass = localStorage.getItem('nasa_pass');

    if (!userField || !passField) {
        showGlobalAlert("Fields cannot be left vacant.");
        return;
    }

    if (!storedPass) {
        // Account Creation Routine
        localStorage.setItem('nasa_user', userField);
        localStorage.setItem('nasa_pass', passField);
        SystemState.userAccount = userField;
        showGlobalAlert("Account Profile Generated! Welcome to Core Command.");
        document.getElementById('system-lock-screen').remove();
        SystemState.isLocked = false;
        loadHardwareTelemetry();
    } else {
        // Validation Routine
        if (passField === storedPass) {
            document.getElementById('system-lock-screen').remove();
            SystemState.isLocked = false;
            loadHardwareTelemetry();
            showGlobalAlert(`Session unlocked. Welcome back, Node [${SystemState.userAccount}]`);
        } else {
            const container = document.getElementById('lock-pass').parentElement.parentElement;
            container.style.animation = 'none';
            setTimeout(() => container.style.animation = 'shake 0.4s ease', 10);
            showGlobalAlert("SECURITY THREAT: Invalid Clearance Key.");
        }
    }
}

// --- 2. GLOBAL TELEMETRY CLOCK SYSTEM ---
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

// --- 3. HARDWARE TELEMETRY ANALYZER ---
function loadHardwareTelemetry() {
    // Updates diagnostic tab layout with verified parameters
    const hardwareLabel = document.getElementById('spec-hardware');
    const osLabel = document.getElementById('spec-os');
    const browserLabel = document.getElementById('spec-browser');

    if(hardwareLabel) hardwareLabel.textContent = "ThinkPad Framework Architecture (i3 Matrix)";
    if(osLabel) osLabel.textContent = "NASA Core Linux Shell Embedded v6.0";
    if(browserLabel) browserLabel.textContent = navigator.userAgent.split(" ").slice(-1)[0] || "Webkit Kernel Engine";
}

// --- 4. SECURE WINDOW INTERACTION ARCHITECTURE (MOVE/CLOSE/MIN) ---
function setupWindowControls() {
    const windows = document.querySelectorAll('.mac-window');
    
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        const closeBtn = win.querySelector('.close-btn');
        const minBtn = win.querySelector('.min-btn');
        const maxBtn = win.querySelector('.max-btn');

        // Close Action Matrix
        if(closeBtn) closeBtn.addEventListener('click', () => win.style.display = 'none');
        if(minBtn) minBtn.addEventListener('click', () => win.style.display = 'none');
        
        // Maximize Action Matrix
        if(maxBtn) maxBtn.addEventListener('click', () => {
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

        // Window Layer Management Focus
        win.addEventListener('mousedown', () => {
            windows.forEach(w => w.style.zIndex = '1000');
            win.style.zIndex = '2000';
        });

        // Native Window Dragging Implementation
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

// --- 5. APP ROUTERS AND LAUNCH INTERFACES ---
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
            trigger.style.cursor = 'pointer';
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                win.style.display = 'flex';
                win.style.zIndex = '2000';
            });
        }
    });

    // Finder Viewport Directory Rendering System
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

// --- 6. ENVIRONMENT WALLPAPER INTERFACE MANAGEMENT ---
function setupWallpaperEngine() {
    const bg = document.getElementById('desktop-bg');
    const buttons = document.querySelectorAll('.wp-btn');
    const tabs = document.querySelectorAll('.settings-sidebar .settings-nav-item');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            bg.className = 'desktop-workspace'; 
            const variant = btn.getAttribute('data-color');
            bg.classList.add(`bg-${variant}`);
            showGlobalAlert(`Wallpaper updated to structural variant: [${variant.toUpperCase()}]`);
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

// --- 7. ARCADE SIMULATION CONTROLLER SYSTEMS ---
function setupArcadeModules() {
    const asteroid = document.getElementById('asteroid-element');
    const countDisplay = document.getElementById('crystal-count');
    const arcadeTabs = document.querySelectorAll('.arcade-sidebar .arcade-nav-item');

    // Clicker logic loop
    if(asteroid) {
        asteroid.addEventListener('click', () => {
            SystemState.energyCrystals++;
            if(countDisplay) countDisplay.textContent = SystemState.energyCrystals;
        });
    }

    // Tab Navigation Logic Loop
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

// --- 8. SIMULATED TERMINAL INTERFACE INTERACTIVE SHELL ---
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
                responseText = `Node Account: ${SystemState.userAccount} | Security Link: 100% Uplink Active.`;
            } else if(command === 'crystals') {
                responseText = `Harvested Energy Balance: [${SystemState.energyCrystals}] Cells.`;
            } else if(command === 'unlock-all') {
                document.querySelectorAll('.mac-window').forEach(w => w.style.display = 'flex');
                responseText = 'ALERT: Omnipresent diagnostic layout deployed.';
            } else if(command === 'matrix-reboot') {
                responseText = 'WARNING: System execution looping initialized...';
                setTimeout(() => location.reload(), 1500);
            } else if(command !== '') {
                responseText = `sh: command not executed: ${command}. Type 'help'.`;
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

// --- 9. POPUP BANNER UTILITY INTERFACES ---
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

    // Auto dismiss after 5000ms
    setTimeout(() => { popup.style.display = 'none'; }, 5000);
}

// Mission Log Subsystem Hook Integration
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

// Injection CSS Shake Protocol Ruleset dynamically
const cssStyle = document.createElement('style');
cssStyle.innerHTML = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-10px); }
    40%, 80% { transform: translateX(10px); }
}
@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
}
`;
document.head.appendChild(cssStyle);
