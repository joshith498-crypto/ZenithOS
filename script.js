// =====================================================================
// QUANTUM OS — CORE SCRIPT
// Sections: State, Boot, Window Manager, Virtual File System,
//           Finder, Terminal Shell, Wallpaper Engine, Arcade, Alerts
// =====================================================================

const SystemState = {
    userAccount: 'Astronaut Voyager',
    energyCrystals: parseInt(localStorage.getItem('qos_crystals')) || 0,
    currentPath: ['Desktop']  // array of path segments from root
};

document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
    initializeClock();
    setupWindowControls();
    VFS.init();
    setupAppLaunchers();
    setupFinder();
    setupWallpaperEngine();
    setupArcadeModules();
    setupSnakeGame();
    setupMinesweeper();
    setupMemoryGame();
    setupTerminalConsole();
    setupMissionControl();
    setupControlCenter();
    setupSettingsPanel();
    setupNotesApp();
    setupCalculator();
    setupSpotlight();
    loadHardwareTelemetry();
});

// --- BOOT SEQUENCE ---
function runBootSequence() {
    const screen = document.getElementById('boot-screen');
    const fill = document.getElementById('boot-bar-fill');
    const log = document.getElementById('boot-log');
    if (!screen) return;

    const lines = [
        'INITIALIZING QUANTUM KERNEL...',
        'MOUNTING VIRTUAL FILE SYSTEM...',
        'CALIBRATING TELEMETRY ARRAY...',
        'LINKING DEEP SPACE NETWORK...',
        'LOADING DOCK INTERFACE...',
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
                    showGlobalAlert(`Welcome back, ${SystemState.userAccount}. All systems nominal.`);
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

// --- GLOBAL TELEMETRY CLOCK SYSTEM ---
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

// --- HARDWARE TELEMETRY ANALYZER ---
function loadHardwareTelemetry() {
    const hardwareLabel = document.getElementById('spec-hardware');
    const osLabel = document.getElementById('spec-os');
    const browserLabel = document.getElementById('spec-browser');

    if (hardwareLabel) hardwareLabel.textContent = "ThinkPad Framework Architecture (i3 Matrix)";
    if (osLabel) osLabel.textContent = "NASA Core Linux Shell Embedded v6.0";
    if (browserLabel) browserLabel.textContent = navigator.userAgent.split(" ").slice(-1)[0] || "Webkit Kernel Engine";
}

// --- SECURE WINDOW INTERACTION ARCHITECTURE (MOVE/CLOSE/MIN/MAX) ---
function setupWindowControls() {
    const windows = document.querySelectorAll('.mac-window');

    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        const closeBtn = win.querySelector('.close-btn');
        const minBtn = win.querySelector('.min-btn');
        const maxBtn = win.querySelector('.max-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => {
            win.classList.add('closing');
            setTimeout(() => { win.style.display = 'none'; win.classList.remove('closing'); }, 160);
        });
        if (minBtn) minBtn.addEventListener('click', () => {
            win.classList.add('minimizing');
            setTimeout(() => { win.style.display = 'none'; win.classList.remove('minimizing'); }, 220);
        });

        if (maxBtn) {
            maxBtn.addEventListener('click', () => {
                if (win.dataset.maximized === 'true') {
                    win.style.width = win.dataset.prevW || '620px';
                    win.style.height = win.dataset.prevH || '390px';
                    win.style.top = win.dataset.prevT || '15%';
                    win.style.left = win.dataset.prevL || '25%';
                    win.dataset.maximized = 'false';
                } else {
                    win.dataset.prevW = win.style.width;
                    win.dataset.prevH = win.style.height;
                    win.dataset.prevT = win.style.top;
                    win.dataset.prevL = win.style.left;
                    win.style.width = '100vw';
                    win.style.height = 'calc(100vh - 26px)';
                    win.style.top = '26px';
                    win.style.left = '0';
                    win.dataset.maximized = 'true';
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
            if (e.target.classList.contains('dot')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = win.offsetLeft;
            initialTop = win.offsetTop;
            document.body.classList.add('no-select');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            win.style.left = `${initialLeft + deltaX}px`;
            win.style.top = `${initialTop + deltaY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.classList.remove('no-select');
            }
        });
    });
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    win.style.zIndex = '2000';
    win.classList.add('opening');
    setTimeout(() => win.classList.remove('opening'), 220);
}

// --- APP ROUTERS AND LAUNCH INTERFACES ---
function setupAppLaunchers() {
    const launchConfig = [
        { triggerId: 'shortcut-finder', targetWindowId: 'window-finder' },
        { triggerId: 'shortcut-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'shortcut-games', targetWindowId: 'window-games' },
        { triggerId: 'shortcut-projects', targetWindowId: 'window-projects' },
        { triggerId: 'shortcut-settings', targetWindowId: 'window-settings' },
        { triggerId: 'shortcut-mc', targetWindowId: 'window-mission-control' },
        { triggerId: 'shortcut-notes', targetWindowId: 'window-notes' },
        { triggerId: 'shortcut-calc', targetWindowId: 'window-calculator' },
        { triggerId: 'dock-finder', targetWindowId: 'window-finder' },
        { triggerId: 'dock-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'dock-games', targetWindowId: 'window-games' },
        { triggerId: 'dock-projects', targetWindowId: 'window-projects' },
        { triggerId: 'dock-settings', targetWindowId: 'window-settings' },
        { triggerId: 'dock-mc', targetWindowId: 'window-mission-control' },
        { triggerId: 'dock-notes', targetWindowId: 'window-notes' },
        { triggerId: 'dock-calc', targetWindowId: 'window-calculator' }
    ];

    launchConfig.forEach(cfg => {
        const trigger = document.getElementById(cfg.triggerId);
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openWindow(cfg.targetWindowId);
            });
        }
    });

    const sidebarItems = document.querySelectorAll('.finder-sidebar .sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            SystemState.currentPath = [item.getAttribute('data-dir')];
            renderFinder();
        });
    });
}

// =====================================================================
// VIRTUAL FILE SYSTEM — persisted entirely in localStorage
// Tree shape: { type:'folder', name, children:{name:node} } | { type:'file', name, content }
// =====================================================================
const VFS = {
    STORAGE_KEY: 'qos_vfs_v2',
    root: null,

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try { this.root = JSON.parse(saved); return; } catch (e) { /* fall through to defaults */ }
        }
        this.root = this.defaultTree();
        this.save();
    },

    defaultTree() {
        const folder = (name, children = {}) => ({ type: 'folder', name, children });
        const file = (name, content = '') => ({ type: 'file', name, content });
        return folder('root', {
            Desktop: folder('Desktop', {
                'satellite_comm.log': file('satellite_comm.log', 'Uplink stable. No anomalies detected.'),
                'terminal_core.sh': file('terminal_core.sh', '#!/bin/sh\necho "core link established"'),
            }),
            Documents: folder('Documents', {
                'cosmic_mission_plan.txt': file('cosmic_mission_plan.txt', 'Phase 1: Launch.\nPhase 2: Orbit.\nPhase 3: Return.'),
                'matrix_backup.dat': file('matrix_backup.dat', 'BACKUP_OK'),
            }),
            Downloads: folder('Downloads', {
                'css_theme_patch.pkg': file('css_theme_patch.pkg', 'theme patch payload'),
            }),
            System: folder('System', {
                'core_telemetry.sys': file('core_telemetry.sys', 'telemetry stream active'),
                'security_layer.key': file('security_layer.key', '***REDACTED***'),
            }),
            Trash: folder('Trash', {}),
        });
    },

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.root));
    },

    // path is an array of segment names, e.g. ['Desktop','Subfolder']
    resolve(path) {
        let node = this.root;
        for (const seg of path) {
            if (!node || node.type !== 'folder' || !node.children[seg]) return null;
            node = node.children[seg];
        }
        return node;
    },

    list(path) {
        const node = this.resolve(path);
        if (!node || node.type !== 'folder') return [];
        return Object.values(node.children).sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    },

    makeFolder(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || parent.children[name]) return false;
        parent.children[name] = { type: 'folder', name, children: {} };
        this.save();
        return true;
    },

    makeFile(path, name, content = '') {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || parent.children[name]) return false;
        parent.children[name] = { type: 'file', name, content };
        this.save();
        return true;
    },

    remove(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name]) return false;
        delete parent.children[name];
        this.save();
        return true;
    },

    rename(path, oldName, newName) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[oldName] || parent.children[newName]) return false;
        const node = parent.children[oldName];
        node.name = newName;
        delete parent.children[oldName];
        parent.children[newName] = node;
        this.save();
        return true;
    },

    move(fromPath, name, toPath) {
        const src = this.resolve(fromPath);
        const dest = this.resolve(toPath);
        if (!src || !dest || dest.type !== 'folder' || !src.children[name] || dest.children[name]) return false;
        dest.children[name] = src.children[name];
        delete src.children[name];
        this.save();
        return true;
    },

    writeFile(path, name, content) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name] || parent.children[name].type !== 'file') return false;
        parent.children[name].content = content;
        this.save();
        return true;
    },

    exists(path, name) {
        const parent = this.resolve(path);
        return !!(parent && parent.type === 'folder' && parent.children[name]);
    }
};

// =====================================================================
// FINDER — file management UI wired to VFS
// =====================================================================
function setupFinder() {
    const search = document.getElementById('finder-search');
    const newFolderBtn = document.getElementById('finder-new-folder');
    const newFileBtn = document.getElementById('finder-new-file');
    const viewport = document.getElementById('finder-file-viewport');
    const itemMenu = document.getElementById('finder-item-menu');
    const blankMenu = document.getElementById('finder-blank-menu');

    let menuTargetName = null;

    if (search) search.addEventListener('input', () => renderFinder());
    if (newFolderBtn) newFolderBtn.addEventListener('click', () => {
        const name = promptUnique('Folder name:', SystemState.currentPath, 'New Folder');
        if (name && VFS.makeFolder(SystemState.currentPath, name)) renderFinder();
    });
    if (newFileBtn) newFileBtn.addEventListener('click', () => {
        const name = promptUnique('File name:', SystemState.currentPath, 'new_file.txt');
        if (name && VFS.makeFile(SystemState.currentPath, name, '')) renderFinder();
    });

    if (viewport) {
        viewport.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.file-item');
            hideContextMenus();
            if (item) {
                e.preventDefault();
                menuTargetName = item.dataset.name;
                positionMenu(itemMenu, e.clientX, e.clientY);
            } else {
                e.preventDefault();
                positionMenu(blankMenu, e.clientX, e.clientY);
            }
        });

        viewport.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.file-item');
            if (item) openFinderItem(item.dataset.name);
        });
    }

    document.addEventListener('click', hideContextMenus);

    if (itemMenu) itemMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action || !menuTargetName) return;
        const name = menuTargetName;
        if (action === 'open') openFinderItem(name);
        if (action === 'rename') {
            const node = VFS.resolve([...SystemState.currentPath]).children[name];
            const newName = prompt('Rename to:', node.name);
            if (newName && newName !== name && VFS.rename(SystemState.currentPath, name, newName)) renderFinder();
        }
        if (action === 'move') {
            const dest = prompt('Move to folder (Desktop, Documents, Downloads, System, Trash):');
            if (dest && VFS.move(SystemState.currentPath, name, [dest])) renderFinder();
        }
        if (action === 'delete') {
            if (VFS.move(SystemState.currentPath, name, ['Trash']) || VFS.remove(SystemState.currentPath, name)) renderFinder();
        }
        hideContextMenus();
    });

    if (blankMenu) blankMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'new-folder') {
            const name = promptUnique('Folder name:', SystemState.currentPath, 'New Folder');
            if (name && VFS.makeFolder(SystemState.currentPath, name)) renderFinder();
        }
        if (action === 'new-file') {
            const name = promptUnique('File name:', SystemState.currentPath, 'new_file.txt');
            if (name && VFS.makeFile(SystemState.currentPath, name, '')) renderFinder();
        }
        hideContextMenus();
    });

    renderFinder();
}

function promptUnique(label, path, fallback) {
    let n = prompt(label, fallback);
    if (!n) return null;
    n = n.trim();
    if (!n) return null;
    let candidate = n;
    let i = 2;
    while (VFS.exists(path, candidate)) {
        candidate = `${n} (${i})`;
        i++;
    }
    return candidate;
}

function positionMenu(menu, x, y) {
    if (!menu) return;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
}

function hideContextMenus() {
    document.querySelectorAll('.finder-context-menu').forEach(m => m.style.display = 'none');
}

function openFinderItem(name) {
    const dir = VFS.resolve(SystemState.currentPath);
    const node = dir && dir.children[name];
    if (!node) return;
    if (node.type === 'folder') {
        SystemState.currentPath.push(name);
        renderFinder();
    } else {
        const updated = prompt(`Viewing ${name}:`, node.content);
        if (updated !== null) {
            VFS.writeFile(SystemState.currentPath, name, updated);
        }
    }
}

function navigateBreadcrumb(index) {
    SystemState.currentPath = SystemState.currentPath.slice(0, index + 1);
    renderFinder();
}

function renderFinder() {
    const viewport = document.getElementById('finder-file-viewport');
    const pathLabel = document.getElementById('finder-title-path');
    const breadcrumbs = document.getElementById('finder-breadcrumbs');
    const search = document.getElementById('finder-search');
    if (!viewport) return;

    const pathStr = '/' + SystemState.currentPath.join('/');
    if (pathLabel) pathLabel.textContent = `Finder — ${pathStr}`;

    if (breadcrumbs) {
        breadcrumbs.innerHTML = '';
        SystemState.currentPath.forEach((seg, idx) => {
            const crumb = document.createElement('span');
            crumb.className = 'breadcrumb-item';
            crumb.textContent = seg;
            crumb.addEventListener('click', () => navigateBreadcrumb(idx));
            breadcrumbs.appendChild(crumb);
            if (idx < SystemState.currentPath.length - 1) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-sep';
                sep.textContent = '›';
                breadcrumbs.appendChild(sep);
            }
        });
    }

    let items = VFS.list(SystemState.currentPath);
    const query = search ? search.value.trim().toLowerCase() : '';
    if (query) items = items.filter(i => i.name.toLowerCase().includes(query));

    viewport.innerHTML = '';
    if (items.length === 0) {
        viewport.insertAdjacentHTML('beforeend', `<div class="finder-empty">— empty —</div>`);
        return;
    }
    items.forEach(item => {
        const icon = item.type === 'folder' ? '📁' : guessFileIcon(item.name);
        const el = document.createElement('div');
        el.className = 'file-item';
        el.dataset.name = item.name;
        el.innerHTML = `<span class="file-icon">${icon}</span><span class="file-label">${item.name}</span>`;
        viewport.appendChild(el);
    });
}

function guessFileIcon(name) {
    if (name.endsWith('.sh')) return '📟';
    if (name.endsWith('.log') || name.endsWith('.sys')) return '🛰️';
    if (name.endsWith('.key')) return '🔑';
    if (name.endsWith('.dat') || name.endsWith('.bak')) return '💾';
    if (name.endsWith('.pkg') || name.endsWith('.gz')) return '📦';
    return '📄';
}

// =====================================================================
// TERMINAL — real shell wired to the VFS
// =====================================================================
function setupTerminalConsole() {
    const input = document.getElementById('terminal-input');
    const body = document.querySelector('.terminal-body');
    if (!input) return;

    let termPath = ['Desktop']; // terminal has its own cwd, independent of Finder

    const printLine = (text) => {
        const line = document.createElement('p');
        line.className = 'glowing-text';
        line.style.fontSize = '12px';
        line.textContent = text;
        body.insertBefore(line, input.parentElement);
        body.scrollTop = body.scrollHeight;
    };

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const raw = input.value.trim();
        input.value = '';
        if (raw === '') return;
        printLine(`nasa-os:~ core$ ${raw}`);

        const [cmd, ...args] = raw.split(/\s+/);

        switch (cmd) {
            case 'help':
                printLine('Commands: help, ls, pwd, cd, mkdir, touch, rm, mv, cp, cat, clear, date, whoami, reboot, shutdown');
                break;
            case 'pwd':
                printLine('/' + termPath.join('/'));
                break;
            case 'ls': {
                const items = VFS.list(termPath);
                printLine(items.length ? items.map(i => i.type === 'folder' ? `${i.name}/` : i.name).join('  ') : '(empty)');
                break;
            }
            case 'cd': {
                if (!args[0] || args[0] === '~') { termPath = ['Desktop']; break; }
                if (args[0] === '..') { if (termPath.length > 1) termPath.pop(); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'folder') termPath.push(args[0]);
                else printLine(`cd: no such directory: ${args[0]}`);
                break;
            }
            case 'mkdir':
                if (!args[0]) { printLine('mkdir: missing operand'); break; }
                printLine(VFS.makeFolder(termPath, args[0]) ? '' : `mkdir: cannot create '${args[0]}'`);
                renderFinder();
                break;
            case 'touch':
                if (!args[0]) { printLine('touch: missing operand'); break; }
                if (!VFS.exists(termPath, args[0])) VFS.makeFile(termPath, args[0], '');
                renderFinder();
                break;
            case 'rm':
                if (!args[0]) { printLine('rm: missing operand'); break; }
                printLine(VFS.remove(termPath, args[0]) ? '' : `rm: cannot remove '${args[0]}': No such file`);
                renderFinder();
                break;
            case 'mv': {
                if (args.length < 2) { printLine('mv: missing operand'); break; }
                const ok = VFS.move(termPath, args[0], [args[1]]) || VFS.rename(termPath, args[0], args[1]);
                if (!ok) printLine(`mv: cannot move '${args[0]}'`);
                renderFinder();
                break;
            }
            case 'cp': {
                if (args.length < 2) { printLine('cp: missing operand'); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'file') VFS.makeFile(termPath, args[1], node.content);
                else printLine(`cp: cannot copy '${args[0]}'`);
                renderFinder();
                break;
            }
            case 'cat': {
                if (!args[0]) { printLine('cat: missing operand'); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'file') printLine(node.content || '(empty file)');
                else printLine(`cat: ${args[0]}: No such file`);
                break;
            }
            case 'clear':
                body.querySelectorAll('p').forEach(p => p.remove());
                break;
            case 'date':
                printLine(new Date().toString());
                break;
            case 'whoami':
                printLine(SystemState.userAccount);
                break;
            case 'reboot':
                printLine('WARNING: System rebooting...');
                setTimeout(() => location.reload(), 1200);
                break;
            case 'shutdown':
                printLine('System halted. Refresh to restart.');
                document.body.style.transition = 'opacity 1s ease';
                setTimeout(() => document.body.style.opacity = '0', 200);
                break;
            default:
                printLine(`sh: command not found: ${cmd}. Type 'help'.`);
        }
    });
}

// --- ENVIRONMENT WALLPAPER INTERFACE MANAGEMENT ---
function setupWallpaperEngine() {
    const bg = document.getElementById('desktop-bg');
    const buttons = document.querySelectorAll('.wp-btn');
    const tabs = document.querySelectorAll('.settings-sidebar .settings-nav-item');

    const saved = localStorage.getItem('qos_wallpaper');
    if (saved && bg) {
        bg.className = 'desktop-workspace';
        bg.classList.add(`bg-${saved}`);
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            bg.className = 'desktop-workspace';
            const variant = btn.getAttribute('data-color');
            bg.classList.add(`bg-${variant}`);
            localStorage.setItem('qos_wallpaper', variant);
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

    if (countDisplay) countDisplay.textContent = SystemState.energyCrystals;

    if (asteroid) {
        asteroid.addEventListener('click', () => {
            SystemState.energyCrystals++;
            localStorage.setItem('qos_crystals', SystemState.energyCrystals);
            if (countDisplay) countDisplay.textContent = SystemState.energyCrystals;
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

// --- POPUP BANNER UTILITY INTERFACES ---
const NotificationLog = [];

function showGlobalAlert(message) {
    const popup = document.getElementById('system-popup');
    const text = document.getElementById('popup-text');
    const closeBtn = document.getElementById('close-popup');

    NotificationLog.unshift({ message, time: new Date() });
    if (NotificationLog.length > 8) NotificationLog.pop();
    renderMissionControlNotifs();

    if (!popup || !text) return;

    text.textContent = message;
    popup.style.display = 'block';
    popup.classList.add('notif-in');
    setTimeout(() => popup.classList.remove('notif-in'), 300);

    if (closeBtn) {
        closeBtn.onclick = () => popup.style.display = 'none';
    }
    clearTimeout(window._alertTimer);
    window._alertTimer = setTimeout(() => { popup.style.display = 'none'; }, 5000);
}

window.saveDevlog = function () {
    const logVal = document.getElementById('devlogInput').value;
    const status = document.getElementById('devlogStatus');
    if (logVal.trim() !== "") {
        status.textContent = "Log shipped successfully.";
        status.style.color = "#00ff66";
        document.getElementById('devlogInput').value = "";
        showGlobalAlert("Operational log matrix synchronized.");
    } else {
        status.textContent = "Error: Block cannot be shipped empty.";
        status.style.color = "#ff3366";
    }
};

// =====================================================================
// MISSION CONTROL — animated telemetry dashboard
// =====================================================================
const BOOT_TIME = Date.now();
let cpuHistory = Array.from({ length: 40 }, () => 20 + Math.random() * 20);
let ramHistory = Array.from({ length: 40 }, () => 35 + Math.random() * 15);

function setupMissionControl() {
    setInterval(tickMissionControl, 1000);
    tickMissionControl();
}

function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function tickMissionControl() {
    const win = document.getElementById('window-mission-control');
    if (!win || win.style.display === 'none') return;

    const clockEl = document.getElementById('mc-clock');
    const uptimeEl = document.getElementById('mc-uptime');
    const crystalsEl = document.getElementById('mc-crystals');
    const activeEl = document.getElementById('mc-active-windows');

    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString();
    if (uptimeEl) uptimeEl.textContent = formatDuration(Date.now() - BOOT_TIME);
    if (crystalsEl) crystalsEl.textContent = SystemState.energyCrystals;

    const openWindows = Array.from(document.querySelectorAll('.mac-window')).filter(w => w.style.display !== 'none');
    if (activeEl) activeEl.textContent = openWindows.length;

    const listEl = document.getElementById('mc-window-list');
    if (listEl) {
        listEl.innerHTML = openWindows.length
            ? openWindows.map(w => `<div class="mc-list-row">🟢 ${w.querySelector('.window-title') ? w.querySelector('.window-title').textContent : w.id}</div>`).join('')
            : `<div class="mc-list-row mc-dim">No active modules</div>`;
    }

    // Drift the simulated CPU/RAM series and redraw
    cpuHistory.push(clamp(cpuHistory[cpuHistory.length - 1] + (Math.random() - 0.5) * 18, 8, 96));
    if (cpuHistory.length > 40) cpuHistory.shift();
    ramHistory.push(clamp(ramHistory[ramHistory.length - 1] + (Math.random() - 0.5) * 10, 20, 90));
    if (ramHistory.length > 40) ramHistory.shift();

    drawTelemetryGraph('mc-cpu-canvas', cpuHistory, '#00ff66');
    drawTelemetryGraph('mc-ram-canvas', ramHistory, '#ffb347');

    renderMissionControlNotifs();
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function drawTelemetryGraph(canvasId, series, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let gy = 0; gy <= h; gy += h / 4) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
    }

    // fill + line
    const stepX = w / (series.length - 1);
    ctx.beginPath();
    series.forEach((v, idx) => {
        const x = idx * stepX;
        const y = h - (v / 100) * h;
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = color.replace(')', ',0.08)').replace('rgb', 'rgba');
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, hexToRgba(color, 0.25));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.fill();

    // current value label
    const last = Math.round(series[series.length - 1]);
    ctx.fillStyle = color;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(`${last}%`, w - 32, 14);
}

function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function renderMissionControlNotifs() {
    const notifEl = document.getElementById('mc-notif-list');
    if (!notifEl) return;
    notifEl.innerHTML = NotificationLog.length
        ? NotificationLog.map(n => `<div class="mc-list-row">🔔 ${n.message} <span class="mc-dim">— ${n.time.toLocaleTimeString()}</span></div>`).join('')
        : `<div class="mc-list-row mc-dim">No recent activity</div>`;
}

// =====================================================================
// COMET SNAKE — real game logic, canvas rendered, persisted high score
// =====================================================================
function setupSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cell = 16;
    const cols = canvas.width / cell;
    const rows = canvas.height / cell;

    let snake, dir, nextDir, food, score, alive, loopHandle;
    const scoreEl = document.getElementById('snake-score');
    const bestEl = document.getElementById('snake-best');
    const restartBtn = document.getElementById('snake-restart');

    const getBest = () => parseInt(localStorage.getItem('qos_snake_best')) || 0;
    if (bestEl) bestEl.textContent = getBest();

    function randomFood() {
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
        } while (snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    function reset() {
        snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score = 0;
        alive = true;
        food = randomFood();
        if (scoreEl) scoreEl.textContent = score;
        draw();
    }

    function tick() {
        if (!alive) return;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)) {
            alive = false;
            const best = getBest();
            if (score > best) {
                localStorage.setItem('qos_snake_best', score);
                if (bestEl) bestEl.textContent = score;
                showGlobalAlert(`New Comet Snake high score: ${score}!`);
            }
            draw();
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            if (scoreEl) scoreEl.textContent = score;
            food = randomFood();
        } else {
            snake.pop();
        }
        draw();
    }

    function draw() {
        ctx.fillStyle = '#040508';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffb347';
        ctx.shadowColor = '#ffb347';
        ctx.shadowBlur = 6;
        ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
        ctx.shadowBlur = 0;

        snake.forEach((s, idx) => {
            ctx.fillStyle = idx === 0 ? '#00ff66' : 'rgba(0,255,102,0.6)';
            ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
        });

        if (!alive) {
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff5f56';
            ctx.font = '16px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SIGNAL LOST', canvas.width / 2, canvas.height / 2 - 6);
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Click Restart to relaunch', canvas.width / 2, canvas.height / 2 + 14);
            ctx.textAlign = 'left';
        }
    }

    document.addEventListener('keydown', (e) => {
        const panel = document.getElementById('game-snake');
        if (!panel || panel.style.display === 'none') return;
        if (e.key === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 };
    });

    if (restartBtn) restartBtn.addEventListener('click', reset);

    reset();
    clearInterval(loopHandle);
    loopHandle = setInterval(tick, 130);
}

// =====================================================================
// CONTROL CENTER — macOS-style dropdown from the menu bar
// =====================================================================
function setupControlCenter() {
    const toggle = document.getElementById('cc-toggle');
    const panel = document.getElementById('control-center');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (panel.style.display === 'block' && !panel.contains(e.target) && e.target !== toggle) {
            panel.style.display = 'none';
        }
    });

    // toggle tiles (wifi / relay sync / DND) — purely cosmetic but persisted
    document.querySelectorAll('.cc-toggle-tile').forEach(tile => {
        const stored = localStorage.getItem(`qos_cc_${tile.id}`);
        if (stored !== null) tile.dataset.on = stored;
        applyTileState(tile);
        tile.addEventListener('click', () => {
            tile.dataset.on = tile.dataset.on === 'true' ? 'false' : 'true';
            localStorage.setItem(`qos_cc_${tile.id}`, tile.dataset.on);
            applyTileState(tile);
            if (tile.id === 'cc-dnd') {
                showGlobalAlert(tile.dataset.on === 'true' ? 'Do Not Disturb enabled.' : 'Do Not Disturb disabled.');
            }
        });
    });

    const ccBrightness = document.getElementById('cc-brightness');
    const ccBrightnessVal = document.getElementById('cc-brightness-val');
    const ccVolume = document.getElementById('cc-volume');
    const ccVolumeVal = document.getElementById('cc-volume-val');

    const savedBrightness = localStorage.getItem('qos_brightness') || '100';
    const savedVolume = localStorage.getItem('qos_volume') || '70';

    if (ccBrightness) {
        ccBrightness.value = savedBrightness;
        ccBrightnessVal.textContent = `${savedBrightness}%`;
        ccBrightness.addEventListener('input', () => {
            setBrightness(ccBrightness.value);
            const settingsSlider = document.getElementById('set-brightness');
            if (settingsSlider) settingsSlider.value = ccBrightness.value;
        });
    }
    if (ccVolume) {
        ccVolume.value = savedVolume;
        ccVolumeVal.textContent = `${savedVolume}%`;
        ccVolume.addEventListener('input', () => {
            setVolume(ccVolume.value);
            const settingsSlider = document.getElementById('set-volume');
            if (settingsSlider) settingsSlider.value = ccVolume.value;
        });
    }

    setBrightness(savedBrightness);
}

function applyTileState(tile) {
    tile.classList.toggle('cc-tile-on', tile.dataset.on === 'true');
}

function setBrightness(value) {
    document.body.style.filter = `brightness(${value}%)`;
    localStorage.setItem('qos_brightness', value);
    const ccVal = document.getElementById('cc-brightness-val');
    if (ccVal) ccVal.textContent = `${value}%`;
}

function setVolume(value) {
    localStorage.setItem('qos_volume', value);
    const ccVal = document.getElementById('cc-volume-val');
    if (ccVal) ccVal.textContent = `${value}%`;
}

// =====================================================================
// SETTINGS PANEL — Display / Wallpaper / Sound / General / Diagnostics
// =====================================================================
function setupSettingsPanel() {
    const brightnessSlider = document.getElementById('set-brightness');
    const blurSlider = document.getElementById('set-blur');
    const volumeSlider = document.getElementById('set-volume');
    const usernameInput = document.getElementById('set-username');
    const resetBtn = document.getElementById('set-reset-os');
    const reduceMotion = document.getElementById('set-reduce-motion');

    if (brightnessSlider) {
        brightnessSlider.value = localStorage.getItem('qos_brightness') || '100';
        brightnessSlider.addEventListener('input', () => {
            setBrightness(brightnessSlider.value);
            const cc = document.getElementById('cc-brightness');
            if (cc) cc.value = brightnessSlider.value;
        });
    }

    if (blurSlider) {
        const savedBlur = localStorage.getItem('qos_blur') || '30';
        blurSlider.value = savedBlur;
        applyGlassBlur(savedBlur);
        blurSlider.addEventListener('input', () => {
            applyGlassBlur(blurSlider.value);
            localStorage.setItem('qos_blur', blurSlider.value);
        });
    }

    if (volumeSlider) {
        volumeSlider.value = localStorage.getItem('qos_volume') || '70';
        volumeSlider.addEventListener('input', () => {
            setVolume(volumeSlider.value);
            const cc = document.getElementById('cc-volume');
            if (cc) cc.value = volumeSlider.value;
        });
    }

    if (reduceMotion) {
        const saved = localStorage.getItem('qos_reduce_motion') === 'true';
        reduceMotion.checked = saved;
        document.body.classList.toggle('qos-reduce-motion', saved);
        reduceMotion.addEventListener('change', () => {
            document.body.classList.toggle('qos-reduce-motion', reduceMotion.checked);
            localStorage.setItem('qos_reduce_motion', reduceMotion.checked);
        });
    }

    if (usernameInput) {
        usernameInput.value = localStorage.getItem('qos_username') || SystemState.userAccount;
        usernameInput.addEventListener('change', () => {
            const val = usernameInput.value.trim() || 'Astronaut Voyager';
            SystemState.userAccount = val;
            localStorage.setItem('qos_username', val);
            showGlobalAlert(`Account name updated to ${val}.`);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('This will erase all files, settings, and high scores. Continue?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    document.querySelectorAll('.accent-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.accent;
            document.documentElement.style.setProperty('--qos-accent', color);
            localStorage.setItem('qos_accent', color);
        });
    });
    const savedAccent = localStorage.getItem('qos_accent');
    if (savedAccent) document.documentElement.style.setProperty('--qos-accent', savedAccent);
}

function applyGlassBlur(px) {
    document.querySelectorAll('.mac-window, .mac-menu-bar, .mac-dock, .finder-context-menu, .control-center').forEach(el => {
        el.style.backdropFilter = `blur(${px}px)`;
    });
}

// =====================================================================
// AUTH — local account creation + login gate (no real backend; this is
// a client-side simulated credential store for the OS demo experience)
// =====================================================================
const AUTH_KEY = 'qos_account_v1';

function getAccount() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
}

function setupAuth() {
    const loginScreen = document.getElementById('login-screen');
    const signupCard = document.getElementById('signup-card');
    const signinCard = document.getElementById('signin-card');
    if (!loginScreen) { runBootSequence(); return; } // safety fallback, never hard-lock the user out

    const account = getAccount();

    if (account) {
        signupCard.style.display = 'none';
        signinCard.style.display = 'flex';
        document.getElementById('signin-avatar').textContent = account.avatar || '🧑‍🚀';
        document.getElementById('signin-name').textContent = `Welcome back, ${account.displayName}`;
        document.getElementById('signin-username').value = account.username;
    } else {
        signupCard.style.display = 'flex';
        signinCard.style.display = 'none';
    }

    // --- avatar picker (signup) ---
    let selectedAvatar = '🧑‍🚀';
    document.querySelectorAll('#signup-avatar-picker .avatar-option').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#signup-avatar-picker .avatar-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAvatar = btn.dataset.avatar;
        };
    });

    // --- create account ---
    const signupSubmit = document.getElementById('signup-submit');
    const signupError = document.getElementById('signup-error');
    const trySignup = () => {
        const name = document.getElementById('signup-name').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const pass = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (!name || !username || !pass) {
            signupError.textContent = 'Please fill in every field.';
            return;
        }
        if (pass.length < 4) {
            signupError.textContent = 'Password must be at least 4 characters.';
            return;
        }
        if (pass !== confirm) {
            signupError.textContent = 'Passwords do not match.';
            return;
        }

        const newAccount = { displayName: name, username, password: pass, avatar: selectedAvatar };
        localStorage.setItem(AUTH_KEY, JSON.stringify(newAccount));
        SystemState.userAccount = name;
        completeLogin(loginScreen);
    };
    if (signupSubmit) signupSubmit.onclick = trySignup;
    ['signup-name', 'signup-username', 'signup-password', 'signup-confirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onkeydown = (e) => { if (e.key === 'Enter') trySignup(); };
    });

    // --- log in ---
    const signinSubmit = document.getElementById('signin-submit');
    const signinError = document.getElementById('signin-error');
    const trySignin = () => {
        const stored = getAccount();
        if (!stored) { setupAuth(); return; } // account vanished somehow, fall back to signup safely

        const username = document.getElementById('signin-username').value.trim();
        const pass = document.getElementById('signin-password').value;

        if (username !== stored.username || pass !== stored.password) {
            signinError.textContent = 'Incorrect username or password.';
            return;
        }

        SystemState.userAccount = stored.displayName;
        completeLogin(loginScreen);
    };
    if (signinSubmit) signinSubmit.onclick = trySignin;
    const signinPassword = document.getElementById('signin-password');
    if (signinPassword) signinPassword.onkeydown = (e) => { if (e.key === 'Enter') trySignin(); };

    // --- reset account (escape hatch so nobody ever gets permanently locked out) ---
    const resetLink = document.getElementById('signin-reset');
    if (resetLink) resetLink.onclick = () => {
        if (confirm('This clears your saved account (files and settings stay intact). Continue?')) {
            localStorage.removeItem(AUTH_KEY);
            setupAuth();
        }
    };
}

function completeLogin(loginScreen) {
    loginScreen.style.opacity = '0';
    setTimeout(() => {
        loginScreen.style.display = 'none';
        const boot = document.getElementById('boot-screen');
        if (boot) boot.style.display = 'flex';
        boot.style.opacity = '1';
        runBootSequence();
    }, 400);
}

// --- Log Out from Control Center ---
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('cc-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const panel = document.getElementById('control-center');
            if (panel) panel.style.display = 'none';
            location.reload();
        });
    }
});

// =====================================================================
// NOTES — multiple notes, rich text, autosave, localStorage
// =====================================================================
const NOTES_KEY = 'qos_notes_v1';
let notesState = { notes: [], activeId: null };

function loadNotes() {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
        try { return JSON.parse(raw); } catch (e) { /* fall through */ }
    }
    return [{ id: 'note_' + Date.now(), title: 'Welcome', body: '<p>This is your first note. Click + New Note to add more.</p>', updated: Date.now() }];
}

function saveNotes() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notesState.notes));
}

function setupNotesApp() {
    notesState.notes = loadNotes();
    notesState.activeId = notesState.notes[0] ? notesState.notes[0].id : null;

    const newBtn = document.getElementById('notes-new');
    const titleInput = document.getElementById('notes-title-input');
    const bodyEditable = document.getElementById('notes-body-editable');
    const indicator = document.getElementById('notes-autosave-indicator');

    if (newBtn) newBtn.onclick = () => {
        const note = { id: 'note_' + Date.now(), title: 'Untitled Note', body: '', updated: Date.now() };
        notesState.notes.unshift(note);
        notesState.activeId = note.id;
        saveNotes();
        renderNotesList();
        renderActiveNote();
    };

    document.querySelectorAll('.notes-fmt-btn').forEach(btn => {
        btn.onclick = () => {
            document.execCommand(btn.dataset.cmd, false, null);
            bodyEditable.focus();
        };
    });

    let saveTimer = null;
    const flagSaving = () => {
        if (indicator) indicator.textContent = 'Saving...';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const note = notesState.notes.find(n => n.id === notesState.activeId);
            if (note) {
                note.title = titleInput.value.trim() || 'Untitled Note';
                note.body = bodyEditable.innerHTML;
                note.updated = Date.now();
                saveNotes();
                renderNotesList();
            }
            if (indicator) indicator.textContent = 'Saved';
        }, 400);
    };

    if (titleInput) titleInput.oninput = flagSaving;
    if (bodyEditable) bodyEditable.oninput = flagSaving;

    renderNotesList();
    renderActiveNote();
}

function renderNotesList() {
    const list = document.getElementById('notes-list');
    if (!list) return;
    list.innerHTML = '';
    notesState.notes
        .slice()
        .sort((a, b) => b.updated - a.updated)
        .forEach(note => {
            const row = document.createElement('div');
            row.className = 'notes-list-item' + (note.id === notesState.activeId ? ' active' : '');
            const preview = (note.body || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 40);
            row.innerHTML = `<div class="notes-list-title">${escapeHtml(note.title || 'Untitled Note')}</div><div class="notes-list-preview">${escapeHtml(preview) || 'No content'}</div>`;
            row.onclick = () => { notesState.activeId = note.id; renderNotesList(); renderActiveNote(); };
            list.appendChild(row);
        });
}

function renderActiveNote() {
    const titleInput = document.getElementById('notes-title-input');
    const bodyEditable = document.getElementById('notes-body-editable');
    if (!titleInput || !bodyEditable) return;
    const note = notesState.notes.find(n => n.id === notesState.activeId);
    if (!note) {
        titleInput.value = '';
        bodyEditable.innerHTML = '';
        return;
    }
    titleInput.value = note.title;
    bodyEditable.innerHTML = note.body;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// =====================================================================
// CALCULATOR — basic arithmetic + keyboard input
// =====================================================================
function setupCalculator() {
    const display = document.getElementById('calc-display');
    if (!display) return;
    let expression = '';

    const safeEval = (expr) => {
        if (!/^[0-9+\-*/(). ]*$/.test(expr)) return 'Error';
        try {
            // eslint-disable-next-line no-new-func
            const result = Function(`"use strict"; return (${expr})`)();
            if (typeof result !== 'number' || !isFinite(result)) return 'Error';
            return String(Math.round(result * 1e10) / 1e10);
        } catch (e) {
            return 'Error';
        }
    };

    const updateDisplay = () => { display.textContent = expression || '0'; };

    const pressKey = (key) => {
        if (key === 'C') { expression = ''; updateDisplay(); return; }
        if (key === '=') {
            expression = safeEval(expression);
            updateDisplay();
            return;
        }
        expression += key;
        updateDisplay();
    };

    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.onclick = () => pressKey(btn.dataset.key);
    });

    document.addEventListener('keydown', (e) => {
        const win = document.getElementById('window-calculator');
        if (!win || win.style.display === 'none') return;
        if (/^[0-9+\-*/().]$/.test(e.key)) { pressKey(e.key); }
        else if (e.key === 'Enter') { pressKey('='); }
        else if (e.key === 'Backspace') { expression = expression.slice(0, -1); updateDisplay(); }
        else if (e.key === 'Escape') { pressKey('C'); }
    });

    updateDisplay();
}

// =====================================================================
// SPOTLIGHT — Ctrl+Space search across apps, files, settings
// =====================================================================
function setupSpotlight() {
    const overlay = document.getElementById('spotlight-overlay');
    const input = document.getElementById('spotlight-input');
    const results = document.getElementById('spotlight-results');
    if (!overlay || !input || !results) return;

    const apps = [
        { label: 'Finder', icon: '📁', action: () => openWindow('window-finder') },
        { label: 'Terminal', icon: '📟', action: () => openWindow('window-terminal') },
        { label: 'Arcade', icon: '🎮', action: () => openWindow('window-games') },
        { label: 'Missions', icon: '🚀', action: () => openWindow('window-projects') },
        { label: 'Settings', icon: '⚙️', action: () => openWindow('window-settings') },
        { label: 'Mission Control', icon: '📡', action: () => openWindow('window-mission-control') },
        { label: 'Notes', icon: '🗒️', action: () => openWindow('window-notes') },
        { label: 'Calculator', icon: '🧮', action: () => openWindow('window-calculator') },
        { label: 'Display Settings', icon: '🖥️', action: () => { openWindow('window-settings'); clickSettingsTab('tab-display'); } },
        { label: 'Wallpaper Settings', icon: '🌌', action: () => { openWindow('window-settings'); clickSettingsTab('tab-wallpaper'); } },
        { label: 'Sound Settings', icon: '🔊', action: () => { openWindow('window-settings'); clickSettingsTab('tab-sound'); } },
    ];

    function clickSettingsTab(tabId) {
        const tab = document.querySelector(`.settings-nav-item[data-tab="${tabId}"]`);
        if (tab) tab.click();
    }

    function openOverlay() {
        overlay.style.display = 'flex';
        input.value = '';
        renderResults('');
        setTimeout(() => input.focus(), 10);
    }

    function closeOverlay() {
        overlay.style.display = 'none';
    }

    function renderResults(query) {
        results.innerHTML = '';
        const q = query.trim().toLowerCase();

        const appMatches = apps.filter(a => !q || a.label.toLowerCase().includes(q));

        let fileMatches = [];
        if (q) {
            fileMatches = searchVFS(VFS.root, [], q).slice(0, 6);
        }

        if (appMatches.length === 0 && fileMatches.length === 0) {
            results.innerHTML = `<div class="spotlight-empty">No results</div>`;
            return;
        }

        appMatches.forEach(a => {
            const row = document.createElement('div');
            row.className = 'spotlight-result';
            row.innerHTML = `<span class="spotlight-result-icon">${a.icon}</span><span>${a.label}</span><span class="spotlight-result-tag">App</span>`;
            row.onclick = () => { a.action(); closeOverlay(); };
            results.appendChild(row);
        });

        fileMatches.forEach(f => {
            const row = document.createElement('div');
            row.className = 'spotlight-result';
            row.innerHTML = `<span class="spotlight-result-icon">${f.node.type === 'folder' ? '📁' : '📄'}</span><span>${f.node.name}</span><span class="spotlight-result-tag">/${f.path.join('/')}</span>`;
            row.onclick = () => {
                SystemState.currentPath = f.path.slice(0, -1).length ? f.path.slice(0, -1) : ['Desktop'];
                openWindow('window-finder');
                renderFinder();
                closeOverlay();
            };
            results.appendChild(row);
        });
    }

    function searchVFS(node, path, query, depth = 0) {
        let matches = [];
        if (!node || node.type !== 'folder' || depth > 6) return matches;
        Object.values(node.children).forEach(child => {
            const childPath = [...path, child.name];
            if (child.name.toLowerCase().includes(query)) matches.push({ node: child, path: childPath });
            if (child.type === 'folder') matches = matches.concat(searchVFS(child, childPath, query, depth + 1));
        });
        return matches;
    }

    input.oninput = () => renderResults(input.value);
    input.onkeydown = (e) => { if (e.key === 'Escape') closeOverlay(); };
    overlay.onclick = (e) => { if (e.target === overlay) closeOverlay(); };

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            if (overlay.style.display === 'flex') closeOverlay(); else openOverlay();
        }
    });
}

// =====================================================================
// MINESWEEPER — "Minefield" — real logic, flood fill, persisted best time
// =====================================================================
function setupMinesweeper() {
    const grid = document.getElementById('mines-grid');
    if (!grid) return;
    const size = 9;
    const mineCount = 10;
    let cells, revealedCount, flagged, gameOver, startTime, timerHandle;

    const statusEl = document.getElementById('mines-status');
    const bestEl = document.getElementById('mines-best');
    const restartBtn = document.getElementById('mines-restart');

    const bestKey = 'qos_mines_best';
    const renderBest = () => {
        const best = localStorage.getItem(bestKey);
        if (bestEl) bestEl.textContent = best ? `${best}s` : '—';
    };
    renderBest();

    function buildBoard() {
        cells = Array.from({ length: size * size }, () => ({ mine: false, adjacent: 0, revealed: false, flagged: false }));
        let placed = 0;
        while (placed < mineCount) {
            const idx = Math.floor(Math.random() * cells.length);
            if (!cells[idx].mine) { cells[idx].mine = true; placed++; }
        }
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].mine) continue;
            cells[i].adjacent = neighbors(i).filter(n => cells[n].mine).length;
        }
        revealedCount = 0;
        flagged = 0;
        gameOver = false;
        startTime = Date.now();
        clearInterval(timerHandle);
        timerHandle = setInterval(() => {
            if (statusEl && !gameOver) statusEl.textContent = `${Math.floor((Date.now() - startTime) / 1000)}s`;
        }, 1000);
    }

    function neighbors(idx) {
        const r = Math.floor(idx / size), c = idx % size;
        const out = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size) out.push(nr * size + nc);
            }
        }
        return out;
    }

    function reveal(idx) {
        if (gameOver || cells[idx].revealed || cells[idx].flagged) return;
        cells[idx].revealed = true;
        revealedCount++;
        if (cells[idx].mine) {
            gameOver = true;
            clearInterval(timerHandle);
            cells.forEach(c => { if (c.mine) c.revealed = true; });
            if (statusEl) statusEl.textContent = '💥 Hull breach';
            render();
            return;
        }
        if (cells[idx].adjacent === 0) {
            neighbors(idx).forEach(n => { if (!cells[n].revealed) reveal(n); });
        }
        if (revealedCount === cells.length - mineCount) {
            gameOver = true;
            clearInterval(timerHandle);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const best = parseInt(localStorage.getItem(bestKey));
            if (!best || elapsed < best) {
                localStorage.setItem(bestKey, elapsed);
                showGlobalAlert(`New Minefield record: ${elapsed}s!`);
            }
            renderBest();
            if (statusEl) statusEl.textContent = `✅ Cleared in ${elapsed}s`;
        }
        render();
    }

    function toggleFlag(idx) {
        if (gameOver || cells[idx].revealed) return;
        cells[idx].flagged = !cells[idx].flagged;
        render();
    }

    function render() {
        grid.innerHTML = '';
        cells.forEach((c, idx) => {
            const cell = document.createElement('div');
            cell.className = 'mine-cell' + (c.revealed ? ' revealed' : '');
            if (c.revealed && c.mine) cell.classList.add('mine-hit');
            if (c.revealed) {
                if (c.mine) cell.textContent = '💣';
                else if (c.adjacent > 0) { cell.textContent = c.adjacent; cell.dataset.n = c.adjacent; }
            } else if (c.flagged) {
                cell.textContent = '🚩';
            }
            cell.onclick = () => reveal(idx);
            cell.oncontextmenu = (e) => { e.preventDefault(); toggleFlag(idx); };
            grid.appendChild(cell);
        });
    }

    if (restartBtn) restartBtn.onclick = () => { buildBoard(); if (statusEl) statusEl.textContent = 'Ready'; render(); };

    buildBoard();
    render();
}

// =====================================================================
// MEMORY GAME — "Signal Match" — pair matching, persisted best move count
// =====================================================================
function setupMemoryGame() {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;
    const symbols = ['🛰️', '🚀', '🪐', '☄️', '👽', '🌌', '🔭', '⭐'];
    const movesEl = document.getElementById('memory-moves');
    const bestEl = document.getElementById('memory-best');
    const restartBtn = document.getElementById('memory-restart');
    const bestKey = 'qos_memory_best';

    let deck, flipped, matchedCount, moves, lock;

    const renderBest = () => {
        const best = localStorage.getItem(bestKey);
        if (bestEl) bestEl.textContent = best || '—';
    };
    renderBest();

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function buildDeck() {
        deck = shuffle([...symbols, ...symbols]).map(sym => ({ sym, matched: false }));
        flipped = [];
        matchedCount = 0;
        moves = 0;
        lock = false;
        if (movesEl) movesEl.textContent = moves;
    }

    function render() {
        grid.innerHTML = '';
        deck.forEach((card, idx) => {
            const el = document.createElement('div');
            el.className = 'memory-card' + (card.matched ? ' matched' : '') + (flipped.includes(idx) ? ' flipped' : '');
            el.textContent = (card.matched || flipped.includes(idx)) ? card.sym : '✦';
            el.onclick = () => handleFlip(idx);
            grid.appendChild(el);
        });
    }

    function handleFlip(idx) {
        if (lock || flipped.includes(idx) || deck[idx].matched) return;
        flipped.push(idx);
        render();
        if (flipped.length === 2) {
            moves++;
            if (movesEl) movesEl.textContent = moves;
            lock = true;
            const [a, b] = flipped;
            if (deck[a].sym === deck[b].sym) {
                deck[a].matched = true;
                deck[b].matched = true;
                matchedCount++;
                flipped = [];
                lock = false;
                render();
                if (matchedCount === symbols.length) {
                    const best = parseInt(localStorage.getItem(bestKey));
                    if (!best || moves < best) {
                        localStorage.setItem(bestKey, moves);
                        showGlobalAlert(`New Signal Match record: ${moves} moves!`);
                    }
                    renderBest();
                }
            } else {
                setTimeout(() => { flipped = []; lock = false; render(); }, 700);
            }
        }
    }

    if (restartBtn) restartBtn.onclick = () => { buildDeck(); render(); };

    buildDeck();
    render();
}
