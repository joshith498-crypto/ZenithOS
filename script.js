// --- CENTRALIZED STATE MANAGEMENT FRAMEWORK ---
const SystemState = {
    userAccount: localStorage.getItem('nasa_user') || 'Guest_User',
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
    const storedPass = localStorage.getItem('nasa_pass');
    const hasAccount = !!storedPass;

    const lockHTML = `
        <div id="system-lock-screen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: radial-gradient(circle, #0f172a 0%, #020617 100%); z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; color: #fff;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 40px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); width: 340px; text-align: center; backdrop-filter: blur(20px);">
                <div style="font-size: 50px; margin-bottom: 16px; animation: pulse 2s infinite;">🛰️</div>
                <h2 id="lock-title" style="margin: 0 0 8px 0; font-size: 20px; font-weight: 500; color: #00ff66;">${hasAccount ? 'Access Terminal' : 'Create Sandbox Account'}</h2>
                <p id="lock-subtitle" style="margin: 0 0 24px 0; font-size: 13px; color: #64748b;">${hasAccount ? 'Enter your custom credentials' : 'Type any user/password to test creation!'}</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                    <input type="text" id="lock-user" placeholder="Create Username" value="${hasAccount ? SystemState.userAccount : ''}" ${hasAccount ? 'disabled' : ''} style="width: 100%; background: #020617; border: 1px solid rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; color: #00ff66; font-family: monospace; font-size: 14px; box-sizing: border-box; text-align: center; outline: none;">
                    <input type="password" id="lock-pass" placeholder="Create Password" style="width: 100%; background: #020617; border: 1px solid rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; color: #00ff66; font-family: monospace; font-size: 14px; box-sizing: border-box; text-align: center; outline: none;">
                    <button id="lock-submit-btn" style="width: 100%; background: #00ff66; color: #000; font-weight: bold; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: background 0.2s;">${hasAccount ? 'LOG IN' : 'INITIALIZE REGISTRATION'}</button>
                </div>
                ${hasAccount ? '<p id="reset-profile" style="margin: 16px 0 0 0; font-size: 11px; color: #ef4444; cursor: pointer; text-decoration: underline;">Reset Account / Create New</p>' : ''}
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lockHTML);

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
        localStorage.setItem('nasa_user', userField);
        localStorage.setItem('nasa_pass', passField);
        SystemState.userAccount = userField;
        showGlobalAlert("Account Created! Interface unlocked.");
        document.getElementById('system-lock-screen').remove();
        SystemState.isLocked = false;
        loadHardwareTelemetry();
    } else {
        if (passField === storedPass) {
            document.getElementById('system-lock-screen').remove();
            SystemState.isLocked = false;
            loadHardwareTelemetry();
            showGlobalAlert(`Welcome back, [${SystemState.userAccount}]`);
        } else {
            const container = document.getElementById('lock-pass').parentElement.parentElement;
            container.style.animation = 'none';
            setTimeout(() => container.style.animation = 'shake 0.4s ease', 10);
            showGlobalAlert("Invalid Password for this local profile.");
        }
    }
}

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
                if(document.styleSheets[0].cssRules
