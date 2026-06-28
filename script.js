document.addEventListener("DOMContentLoaded", () => {

    const initialBg = document.getElementById('desktop-bg');
    if (initialBg) initialBg.classList.add('bg-space');

    let activelyDraggedElementId = null;
    let isDraggingFromDock = false;

    /* --- VIRTUAL DIRECTORY OS FILE SYSTEM REGISTRY --- */
    const virtualFileSystem = {
        desktop: [
            { name: "📁 Finder.app Link", desc: "Core application pointer map to system paths." },
            { name: "📁 Terminal.app Link", desc: "Command Line Pipeline to local runtime environment." },
            { name: "📁 Arcade.app Link", desc: "Interactive game subroutines terminal container." },
            { name: "📁 Settings.app Link", desc: "Global layout and perimeter defense configurations." }
        ],
        documents: [
            { name: "📄 satellite_uplink.cfg", desc: "TARGET_IP=128.0.0.1\nPORT=9100\nENCRYPTION=AES_256_GCM\nSTATUS=TUNNEL_ESTABLISHED" },
            { name: "📄 classified_blueprint.dat", desc: "DEEP_SPACE_OBJECT_ID: #498-CRYPTO\nOrbit: Mars Geo-Synchronous Grid\nPayload: Atmospheric Spectrometer" },
            { name: "📄 warp_drive_core.log", desc: "Antimatter containment field operating at 98.4% cohesion accuracy." }
        ],
        downloads: [
            { name: "📦 CSP_v3.0_Mod.zip", desc: "Assetto Corsa Custom Shaders Patch file container package." },
            { name: "🎵 Space_Ambience_Retro.mp3", desc: "Looped ambient workspace theme audio file metadata stream." }
        ],
        system: [
            { name: "⚙️ kernel_omni.sys", desc: "NASA Core Engine Subsystem Kernel running on architecture pipelines." },
            { name: "⚙️ hardware_allocator.dll", desc: "Memory assignment parameters for local workstation matrix hardware mapping." }
        ],
        trash: [
            { name: "🗑️ broken_telemetry_node.bak", desc: "Corrupted coordinate log. Discarded June 2026." }
        ]
    };

    /* --- SYSTEM NOTIFICATION BANNER ENGINE --- */
    function triggerOSPopup(title, message, icon = "🛰️") {
        const popup = document.getElementById('system-popup');
        const pText = document.getElementById('popup-text');
        if (!popup || !pText) return;

        const pTitle = popup.querySelector('.notif-title');
        const pIcon = popup.querySelector('.notif-icon');

        pText.innerText = message;
        if (pTitle) pTitle.innerText = title;
        if (pIcon) pIcon.innerText = icon;

        popup.style.display = 'block';

        if (window.popupTimeout) clearTimeout(window.popupTimeout);
        window.popupTimeout = setTimeout(() => { popup.style.display = 'none'; }, 5000);
    }

    const closePopupBtn = document.getElementById('close-popup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            const popup = document.getElementById('system-popup');
            if (popup) popup.style.display = 'none';
        });
    }

    /* --- DYNAMIC FINDER RENDER ENGINE --- */
    function renderFinderDirectory(dirKey) {
        const viewPort = document.getElementById('finder-file-viewport');
        const pathTitle = document.getElementById('finder-title-path');
        const viewHeading = document.getElementById('finder-current-heading');
        if (!viewPort) return;

        // Sync visual sidebar state
        document.querySelectorAll('.finder-sidebar .sidebar-item').forEach(item => {
            if (item.getAttribute('data-dir') === dirKey) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update breadcrumb texts
        if (pathTitle) pathTitle.innerText = `Finder — root/${dirKey}/`;
        if (viewHeading) viewHeading.innerText = `${dirKey.toUpperCase()} Directory Matrix`;

        // Empty current view
        viewPort.innerHTML = "";

        const files = virtualFileSystem[dirKey] || [];
        if (files.length === 0) {
            viewPort.innerHTML = `<p style="color: rgba(255,255,255,0.3); font-size: 13px; grid-column: 1/-1; margin: 12px 4px;">Directory is completely empty.</p>`;
            return;
        }

        // Generate files
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerText = file.name;
            fileItem.addEventListener('click', () => {
                triggerOSPopup(file.name, file.desc, "🔍");
            });
            viewPort.appendChild(fileItem);
        });
    }

    // Bind sidebar clicks
    document.querySelectorAll('.finder-sidebar .sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const targetDir = item.getAttribute('data-dir');
            renderFinderDirectory(targetDir);
        });
    });

    // HOOKING TRASH TO OPEN INSIDE FINDER
    const dockTrashBtn = document.getElementById('dock-trash');
    if (dockTrashBtn) {
        dockTrashBtn.addEventListener('click', () => {
            const finderWin = document.getElementById('window-finder');
            if (finderWin) {
                finderWin.style.display = 'flex';
                bringWindowToFront(finderWin);
                renderFinderDirectory('trash');
                triggerOSPopup("Finder Routing", "Redirected filesystem pipeline directly to Trash Can directory.", "🗑️");
            }
        });
    }

    // Load Default Finder View
    renderFinderDirectory('desktop');

    /* --- REALTIME CLOCK TIMELINE --- */
    function updateMacClock() {
        const clock = document.getElementById('live-clock');
        if (!clock) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        clock.innerText = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }
    setInterval(updateMacClock, 1000);
    updateMacClock();

    /* --- HARDWARE COMPATIBILITY DIAGNOSTICS --- */
    function detectClientHardware() {
        const hardwareRow = document.getElementById('spec-hardware');
        const osRow = document.getElementById('spec-os');
        const browserRow = document.getElementById('spec-browser');
        
        if (hardwareRow) hardwareRow.innerText = "HP Workstation Core Hub";

        const userAgent = navigator.userAgent;
        let detectedOS = "Windows Environment Framework";
        let detectedBrowser = "Secure Web Engine";

        if (userAgent.indexOf("Win") !== -1) detectedOS = "Windows Core Workspace";
        if (userAgent.indexOf("Mac") !== -1) detectedOS = "macOS Matrix Core";
        if (userAgent.indexOf("X11") !== -1 || userAgent.indexOf("Linux") !== -1) detectedOS = "Linux Matrix Framework";

        if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edg") === -1) detectedBrowser = "Chromium Engine Workspace";
        else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) detectedBrowser = "WebKit Safari Core";
        else if (userAgent.indexOf("Firefox") !== -1) detectedBrowser = "Gecko Firefox Core";
        else if (userAgent.indexOf("Edg") !== -1) detectedBrowser = "Microsoft Edge Pipeline";

        if (osRow) osRow.innerText = detectedOS;
        if (browserRow) browserRow.innerText = detectedBrowser;
    }
    detectClientHardware();

    /* --- SAFE INTERACTIVE DRAG AND DROP HANDLERS --- */
    function configureDragMechanics() {
        document.querySelectorAll('.desktop-shortcut').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                activelyDraggedElementId = item.id;
                isDraggingFromDock = false;
                e.dataTransfer.setData('text/plain', item.id);
                item.style.opacity = "0.4";
            });
            item.addEventListener('dragend', () => { item.style.opacity = "1"; });
        });

        document.querySelectorAll('.dock-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                activelyDraggedElementId = item.id;
                isDraggingFromDock = true;
                e.dataTransfer.setData('text/plain', item.id);
                item.style.opacity = "0.5";
            });
            item.addEventListener('dragend', () => { item.style.opacity = "1"; });
        });
    }
    configureDragMechanics();

    const trashBinZone = document.getElementById('dock-trash');
    if (trashBinZone) {
        trashBinZone.addEventListener('dragover', (e) => { e.preventDefault(); trashBinZone.classList.add('drag-over-trash'); });
        trashBinZone.addEventListener('dragleave', () => { trashBinZone.classList.remove('drag-over-trash'); });
        trashBinZone.addEventListener('drop', (e) => {
            e.preventDefault();
            trashBinZone.classList.remove('drag-over-trash');
            if (!activelyDraggedElementId) return;

            const elementToKill = document.getElementById(activelyDraggedElementId);
            if (elementToKill) {
                const itemName = elementToKill.querySelector('span')?.innerText || elementToKill.getAttribute('data-name') || "Item File Node";
                
                // Add item to virtual file system database dynamically!
                virtualFileSystem.trash.push({ name: `🗑️ discarded_${itemName.toLowerCase()}.bak`, desc: "Purged resource instance pointer element." });
                
                // Refresh finder UI if open
                renderFinderDirectory('trash');

                if (isDraggingFromDock) {
                    triggerOSPopup("Trash Can", `Link removed from Dock module.`, "🗑️");
                    elementToKill.remove();
                } else {
                    triggerOSPopup("Trash Can", "Moved item to clean storage grid container inside Finder.", "🗑️");
                    elementToKill.style.display = "none";
                }
            }
            activelyDraggedElementId = null;
        });
    }

    /* --- SYSTEM OPTIONS POPUP CONTEXT MATRIX --- */
    const workspace = document.getElementById('desktop-bg');
    const ctxMenu = document.getElementById('desktop-menu');

    if (workspace && ctxMenu) {
        workspace.addEventListener('contextmenu', (e) => {
            if (e.target.className.includes('desktop-workspace')) {
                e.preventDefault();
                ctxMenu.style.left = e.clientX + "px";
                ctxMenu.style.top = e.clientY + "px";
                ctxMenu.style.display = "flex";
            }
        });
        document.addEventListener('click', () => { ctxMenu.style.display = "none"; });
    }

    document.querySelectorAll('.context-item').forEach(menuItem => {
        menuItem.addEventListener('click', () => {
            const action = menuItem.getAttribute('data-action');
            if (action === 'clean-desktop') return;

            let targetId = "";
            if (action === 'add-finder') targetId = 'shortcut-finder';
            if (action === 'add-terminal') targetId = 'shortcut-terminal';
            if (action === 'add-games') targetId = 'shortcut-games';
            if (action === 'add-settings') targetId = 'shortcut-settings';

            const shortcut = document.getElementById(targetId);
            if (shortcut) {
                shortcut.style.display = "flex";
                triggerOSPopup("Launchpad Core", "Restored component file node framework.", "✨");
            }
        });
    });

    /* --- SECURE SYSTEM SETTINGS PANEL MODULATION --- */
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.settings-nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.settings-tab-panel').forEach(panel => panel.style.display = 'none');
            item.classList.add('active');
            const target = document.getElementById(item.getAttribute('data-tab'));
            if (target) target.style.display = 'block';
        });
    });

    document.querySelectorAll('.wp-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bg = document.getElementById('desktop-bg');
            if (!bg) return;
            bg.classList.remove('bg-space', 'bg-nebula', 'bg-terminal');
            bg.classList.add(`bg-${btn.getAttribute('data-color')}`);
        });
    });

    /* --- HIGHLY PREVENTATIVE SYSTEM ARCADE HOOKS --- */
    document.querySelectorAll('.arcade-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.arcade-nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.arcade-panel').forEach(panel => panel.style.display = 'none');
            item.classList.add('active');
            const targetGame = item.getAttribute('data-game');
            const targetPanel = document.getElementById(targetGame);
            if (targetPanel) targetPanel.style.display = 'block';
            
            if (targetGame === 'game-dodge') startDodgeGame();
            else stopDodgeGame();
        });
    });

    let crystalsCollected = 0;
    const asteroidBtn = document.getElementById('asteroid-element');
    if (asteroidBtn) {
        asteroidBtn.addEventListener('click', () => {
            crystalsCollected++;
            const countDisplay = document.getElementById('crystal-count');
            if (countDisplay) countDisplay.innerText = crystalsCollected;
        });
    }

    let dodgeInterval = null;
    function startDodgeGame() {
        stopDodgeGame();
        let oTop = -30;
        dodgeInterval = setInterval(() => {
            oTop += 5;
            const obstacle = document.getElementById('dodge-obstacle');
            if (obstacle) obstacle.style.top = oTop + "px";
            if (oTop > 140) oTop = -30;
        }, 50);
    }
    function stopDodgeGame() { 
        if (dodgeInterval) clearInterval(dodgeInterval); 
    }

    /* --- DRAGGABLE WINDOW SYSTEM REGISTER MANAGER --- */
    function wireMacWindow(triggerId, windowId) {
        const trigger = document.getElementById(triggerId);
        const win = document.getElementById(windowId);
        if (!trigger || !win) return;

        trigger.addEventListener('click', () => {
            win.style.display = 'flex';
            bringWindowToFront(win);
        });

        const closeBtn = win.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                win.style.display = 'none';
                if (windowId === 'window-games') stopDodgeGame();
            });
        }
        
        const header = win.querySelector('.window-header');
        if (header) makeWindowDraggable(header, win);
    }

    function bringWindowToFront(target) {
        document.querySelectorAll('.mac-window').forEach(w => w.style.zIndex = "100");
        target.style.zIndex = "200";
    }

    function makeWindowDraggable(header, targetWin) {
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
        header.onmousedown = (e) => {
            if (e.target.className.includes('dot')) return;
            e.preventDefault(); 
            mouseX = e.clientX; 
            mouseY = e.clientY;
            document.onmouseup = () => { 
                document.onmouseup = null; 
                document.onmousemove = null; 
            };
            document.onmousemove = (ev) => {
                ev.preventDefault();
                posX = mouseX - ev.clientX; 
                posY = mouseY - ev.clientY;
                mouseX = ev.clientX; 
                mouseY = ev.clientY;
                targetWin.style.top = (targetWin.offsetTop - posY) + "px";
                targetWin.style.left = (targetWin.offsetLeft - posX) + "px";
            };
        };
    }

    wireMacWindow('shortcut-finder', 'window-finder'); 
    wireMacWindow('dock-finder', 'window-finder');
    wireMacWindow('shortcut-terminal', 'window-terminal'); 
    wireMacWindow('dock-terminal', 'window-terminal');
    wireMacWindow('shortcut-games', 'window-games'); 
    wireMacWindow('dock-games', 'window-games');
    wireMacWindow('shortcut-settings', 'window-settings'); 
    wireMacWindow('dock-settings', 'window-settings');

    /* --- RADAR LOOP TIMELINE --- */
    let radarProgress = 0;
    setInterval(() => {
        radarProgress += 0.5; 
        if (radarProgress > 100) radarProgress = 0;
        const dot = document.getElementById('satellite-dot');
        if (dot) {
            dot.style.left = `${radarProgress}%`;
            dot.style.top = `${50 + Math.sin(radarProgress * 0.2) * 20}%`;
        }
    }, 100);
});
