// ZenithOS - Window Management System
// Now with macOS-style minimize/maximize animations (genie effect)
//
// NOTE: The minimize animation was tricky. I had to use CSS transforms
// and opacity to create the genie effect. The key was using
// scaleY(0) and transform-origin: bottom.
//
// I spent 2 hours getting the minimize animation to look right.
// The hardest part was making it shrink into the dock icon.
//
// NEW: Added dock bounce effect when opening windows
// NEW: Added window restore from dock (click dock icon to restore minimized window)

// Track minimized windows
const minimizedWindows = new Map();

function setupWindowControls() {
    const windows = document.querySelectorAll('.mac-window');

    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        const closeBtn = win.querySelector('.close-btn');
        const minBtn = win.querySelector('.min-btn');
        const maxBtn = win.querySelector('.max-btn');
        const windowId = win.id;

        // Close button
        if (closeBtn) closeBtn.addEventListener('click', () => {
            win.classList.add('closing');
            setTimeout(() => { 
                win.style.display = 'none'; 
                win.classList.remove('closing'); 
                unregisterWindow(windowId);
            }, 160);
        });
        
        // Minimize button - NOW WITH GENIE EFFECT!
        if (minBtn) minBtn.addEventListener('click', () => {
            minimizeWindow(win);
        });

        // Maximize button
        if (maxBtn) {
            maxBtn.addEventListener('click', () => {
                if (win.dataset.maximized === 'true') {
                    // Restore
                    win.style.width = win.dataset.prevW || '620px';
                    win.style.height = win.dataset.prevH || '390px';
                    win.style.top = win.dataset.prevT || '15%';
                    win.style.left = win.dataset.prevL || '25%';
                    win.dataset.maximized = 'false';
                } else {
                    // Maximize
                    win.dataset.prevW = win.style.width;
                    win.dataset.prevH = win.style.height;
                    win.dataset.prevT = win.style.top;
                    win.dataset.prevL = win.style.left;
                    win.style.width = '100vw';
                    win.style.height = 'calc(100vh - 42px)';
                    win.style.top = '42px';
                    win.style.left = '0';
                    win.dataset.maximized = 'true';
                }
            });
        }

        // Window dragging
        win.addEventListener('mousedown', () => {
            windows.forEach(w => w.style.zIndex = '1000');
            win.style.zIndex = '2000';
            registerWindow(windowId);
        });

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('dot')) return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = win.offsetLeft;
                initialTop = win.offsetTop;
                document.body.classList.add('no-select');
            });
        }

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
    
    // Setup dock icon click handlers for restoring minimized windows
    setupDockRestoreHandlers();
}

// Setup dock icons to restore minimized windows
function setupDockRestoreHandlers() {
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
        item.addEventListener('click', () => {
            const windowId = `window-${item.id.replace('dock-', '')}`;
            const win = document.getElementById(windowId);
            
            // If window is minimized, restore it
            if (win && minimizedWindows.has(windowId)) {
                restoreWindow(windowId);
                // Bounce the dock icon
                bounceDockIcon(item);
            }
        });
    });
}

// Bounce dock icon effect (like macOS)
function bounceDockIcon(icon) {
    icon.style.transform = 'scale(0.9)';
    setTimeout(() => {
        icon.style.transform = 'scale(1.1)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 100);
    }, 50);
}

// Minimize window with genie effect
function minimizeWindow(win) {
    const windowId = win.id;
    const dockIcon = document.getElementById(`dock-${windowId.replace('window-', '')}`);
    
    if (!dockIcon) {
        // If no dock icon, just hide
        win.style.display = 'none';
        return;
    }
    
    // Store original position and size
    minimizedWindows.set(windowId, {
        display: win.style.display,
        width: win.style.width,
        height: win.style.height,
        top: win.style.top,
        left: win.style.left,
        zIndex: win.style.zIndex
    });
    
    // Get dock icon position
    const dockRect = dockIcon.getBoundingClientRect();
    const winRect = win.getBoundingClientRect();
    
    // Calculate where to animate to (center of dock icon)
    const targetX = dockRect.left + dockRect.width / 2;
    const targetY = dockRect.top + dockRect.height / 2;
    
    // Apply genie effect
    win.classList.add('minimizing');
    win.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    win.style.transformOrigin = 'bottom center';
    win.style.transform = `translate(${targetX - winRect.left - winRect.width / 2}px, ${targetY - winRect.top - winRect.height / 2}px) scale(0.01)`;
    win.style.opacity = '0';
    
    // After animation, hide the window
    setTimeout(() => {
        win.style.display = 'none';
        win.style.transform = '';
        win.style.opacity = '';
        win.style.transition = '';
        win.classList.remove('minimizing');
        unregisterWindow(windowId);
        
        // Add glow effect to dock icon
        dockIcon.style.transform = 'scale(1.1)';
        dockIcon.style.filter = 'drop-shadow(0 0 4px #b794f4)';
        setTimeout(() => {
            dockIcon.style.transform = '';
            dockIcon.style.filter = '';
        }, 200);
    }, 300);
}

// Restore minimized window
function restoreWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    
    const savedState = minimizedWindows.get(windowId);
    if (!savedState) {
        // Window wasn't minimized, just show it
        win.style.display = 'flex';
        registerWindow(windowId);
        return;
    }
    
    // Restore original state
    win.style.display = savedState.display || 'flex';
    win.style.width = savedState.width || '620px';
    win.style.height = savedState.height || '390px';
    win.style.top = savedState.top || '15%';
    win.style.left = savedState.left || '25%';
    win.style.zIndex = savedState.zIndex || '2000';
    win.style.opacity = '1';
    win.style.transform = '';
    win.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Remove from minimized map
    minimizedWindows.delete(windowId);
    
    // Show with opening animation
    win.classList.add('opening');
    setTimeout(() => {
        win.classList.remove('opening');
        win.style.transition = '';
    }, 220);
    
    registerWindow(windowId);
    
    // Bounce the dock icon
    const dockIcon = document.getElementById(`dock-${windowId.replace('window-', '')}`);
    if (dockIcon) {
        bounceDockIcon(dockIcon);
    }
}

// Open window
function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    
    // If window is minimized, restore it
    if (minimizedWindows.has(id)) {
        restoreWindow(id);
        return;
    }
    
    // Otherwise, show normally
    win.style.display = 'flex';
    win.style.zIndex = '2000';
    win.classList.add('opening');
    setTimeout(() => win.classList.remove('opening'), 220);
    registerWindow(id);
    
    // Bounce the dock icon
    const dockIcon = document.getElementById(`dock-${id.replace('window-', '')}`);
    if (dockIcon) {
        bounceDockIcon(dockIcon);
    }
}

// Setup app launchers
function setupAppLaunchers() {
    const launchConfig = [
        { triggerId: 'shortcut-finder', targetWindowId: 'window-finder' },
        { triggerId: 'shortcut-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'shortcut-games', targetWindowId: 'window-games' },
        { triggerId: 'shortcut-settings', targetWindowId: 'window-settings' },
        { triggerId: 'shortcut-mc', targetWindowId: 'window-mission-control' },
        { triggerId: 'shortcut-notes', targetWindowId: 'window-notes' },
        { triggerId: 'shortcut-calc', targetWindowId: 'window-calculator' },
        { triggerId: 'dock-finder', targetWindowId: 'window-finder' },
        { triggerId: 'dock-terminal', targetWindowId: 'window-terminal' },
        { triggerId: 'dock-games', targetWindowId: 'window-games' },
        { triggerId: 'dock-settings', targetWindowId: 'window-settings' },
        { triggerId: 'dock-mc', targetWindowId: 'window-mission-control' },
        { triggerId: 'dock-notes', targetWindowId: 'window-notes' },
        { triggerId: 'dock-calc', targetWindowId: 'window-calculator' }
    ];

    launchConfig.forEach(cfg => {
        const el = document.getElementById(cfg.triggerId);
        if (el) {
            el.addEventListener('dblclick', () => openWindow(cfg.targetWindowId));
            // Single click for dock items - now restores minimized windows
            if (cfg.triggerId.startsWith('dock-')) {
                el.addEventListener('click', () => {
                    const windowId = cfg.targetWindowId;
                    if (minimizedWindows.has(windowId)) {
                        restoreWindow(windowId);
                    } else {
                        openWindow(windowId);
                    }
                });
            }
        }
    });
}

// Make functions globally available
window.openWindow = openWindow;
window.minimizeWindow = minimizeWindow;
window.restoreWindow = restoreWindow;
window.minimizedWindows = minimizedWindows;
