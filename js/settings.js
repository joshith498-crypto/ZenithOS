// ZenithOS - System Settings & Customization
// Added custom wallpaper upload feature
// Added custom theme support
//
// NOTE: I spent way too long picking these color themes. My favorite is "Purple Haze"
// because it matches my favorite hoodie.

// My custom color themes
const CUSTOM_THEMES = {
    'default': {
        name: 'Cyber Violet (Default)',
        accent: '#b794f4',
        accentAmber: '#f687b3',
        bgPanel: 'rgba(14, 16, 26, 0.96)',
        border: 'rgba(255, 255, 255, 0.12)',
        text: '#e2e8f0'
    },
    'purple-haze': {
        name: 'Purple Haze',
        accent: '#a855f7',
        accentAmber: '#ec4899',
        bgPanel: 'rgba(16, 10, 28, 0.96)',
        border: 'rgba(219, 39, 119, 0.2)',
        text: '#f1f5f9'
    },
    'ocean-blue': {
        name: 'Ocean Blue',
        accent: '#06b6d4',
        accentAmber: '#3b82f6',
        bgPanel: 'rgba(2, 13, 40, 0.96)',
        border: 'rgba(59, 130, 246, 0.2)',
        text: '#f8fafc'
    },
    'forest-green': {
        name: 'Forest Green',
        accent: '#22c55e',
        accentAmber: '#16a34a',
        bgPanel: 'rgba(5, 20, 10, 0.96)',
        border: 'rgba(22, 163, 74, 0.2)',
        text: '#fefce8'
    },
    'volcano': {
        name: 'Volcano Red',
        accent: '#ef4444',
        accentAmber: '#f97316',
        bgPanel: 'rgba(28, 5, 5, 0.96)',
        border: 'rgba(249, 115, 22, 0.2)',
        text: '#fef2f2'
    },
    'midnight': {
        name: 'Midnight Black',
        accent: '#6366f1',
        accentAmber: '#8b5cf6',
        bgPanel: 'rgba(0, 0, 0, 0.96)',
        border: 'rgba(100, 100, 100, 0.3)',
        text: '#ffffff'
    }
};

function setupSettingsPanel() {
    const brightnessSlider = document.getElementById('set-brightness');
    const blurSlider = document.getElementById('set-blur');
    const volumeSlider = document.getElementById('set-volume');
    const usernameInput = document.getElementById('set-username');
    const resetBtn = document.getElementById('set-reset-os');
    const reduceMotion = document.getElementById('set-reduce-motion');
    const tabs = document.querySelectorAll('.settings-nav-item');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetedTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.settings-tab-panel').forEach(p => p.style.display = 'none');
            const targetPanel = document.getElementById(targetedTab);
            if (targetPanel) targetPanel.style.display = 'block';
        });
    });

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
            logSystemEvent(`Username changed to: ${val}`);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('This will erase all files, settings, and high scores. Continue?')) {
                localStorage.clear();
                logSystemEvent('System reset by user', 'warning');
                location.reload();
            }
        });
    }

    // Accent color swatches
    document.querySelectorAll('.accent-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.accent;
            document.documentElement.style.setProperty('--qos-accent', color);
            localStorage.setItem('qos_accent', color);
        });
    });
    const savedAccent = localStorage.getItem('qos_accent');
    if (savedAccent) document.documentElement.style.setProperty('--qos-accent', savedAccent);

    // Developer mode toggle (hidden by default)
    if (typeof window.isDevMode === 'function' && window.isDevMode()) {
        const devModeToggle = document.createElement('div');
        devModeToggle.style.marginTop = '16px';
        devModeToggle.style.padding = '8px';
        devModeToggle.style.background = 'rgba(183, 148, 244, 0.1)';
        devModeToggle.style.border = '1px solid #b794f4';
        devModeToggle.style.borderRadius = '6px';
        devModeToggle.style.fontSize = '12px';
        devModeToggle.textContent = '⚡ Developer Mode: ACTIVE';
        
        const wallpaperTab = document.getElementById('tab-wallpaper');
        if (wallpaperTab) {
            wallpaperTab.appendChild(devModeToggle);
        }
    }
}

function applyGlassBlur(px) {
    document.querySelectorAll('.mac-window, .mac-menu-bar, .mac-dock, .finder-context-menu, .control-center').forEach(el => {
        el.style.backdropFilter = `blur(${px}px)`;
    });
}

function setBrightness(value) {
    document.body.style.filter = `brightness(${value}%)`;
    localStorage.setItem('qos_brightness', value);
    const ccVal = document.getElementById('cc-brightness-val');
    if (ccVal) ccVal.textContent = `${value}%`;
    logSystemEvent(`Brightness set to ${value}%`);
}

function setVolume(value) {
    localStorage.setItem('qos_volume', value);
    const ccVal = document.getElementById('cc-volume-val');
    if (ccVal) ccVal.textContent = `${value}%`;
    logSystemEvent(`Volume set to ${value}%`);
}

function setupWallpaperEngine() {
    const bg = document.getElementById('desktop-bg');
    const buttons = document.querySelectorAll('.wp-btn');
    if (!bg) return;

    const saved = localStorage.getItem('qos_wallpaper');
    if (saved) {
        // Check if it's a custom wallpaper
        if (saved.startsWith('data:')) {
            bg.style.backgroundImage = `url(${saved})`;
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
            bg.style.backgroundRepeat = 'no-repeat';
        } else {
            bg.className = 'desktop-workspace bg-' + saved;
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            bg.className = 'desktop-workspace';
            const variant = btn.getAttribute('data-color');
            bg.classList.add(`bg-${variant}`);
            localStorage.setItem('qos_wallpaper', variant);
            showGlobalAlert(`Wallpaper updated to: [${variant.toUpperCase()}]`);
            logSystemEvent(`Wallpaper changed to: ${variant}`);
        });
    });

    // Add custom wallpaper upload feature
    const wallpaperTab = document.getElementById('tab-wallpaper');
    if (wallpaperTab && typeof window.isDevMode === 'function' && window.isDevMode()) {
        const uploadContainer = document.createElement('div');
        uploadContainer.style.marginTop = '16px';
        uploadContainer.style.padding = '12px';
        uploadContainer.style.background = 'rgba(0, 0, 0, 0.3)';
        uploadContainer.style.borderRadius = '8px';
        uploadContainer.style.border = '1px dashed rgba(255, 255, 255, 0.2)';
        
        const uploadTitle = document.createElement('div');
        uploadTitle.style.fontSize = '13px';
        uploadTitle.style.marginBottom = '8px';
        uploadTitle.style.color = '#b794f4';
        uploadTitle.textContent = 'Upload Custom Wallpaper (Dev Mode)';
        
        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'image/*';
        uploadInput.style.display = 'none';
        uploadInput.id = 'custom-wallpaper-upload';
        
        const uploadButton = document.createElement('button');
        uploadButton.textContent = '📁 Choose Image';
        uploadButton.style.padding = '6px 12px';
        uploadButton.style.background = 'rgba(183, 148, 244, 0.2)';
        uploadButton.style.border = '1px solid #b794f4';
        uploadButton.style.borderRadius = '4px';
        uploadButton.style.color = '#b794f4';
        uploadButton.style.cursor = 'pointer';
        uploadButton.style.fontSize = '12px';
        uploadButton.onclick = () => uploadInput.click();
        
        const uploadStatus = document.createElement('div');
        uploadStatus.style.marginTop = '8px';
        uploadStatus.style.fontSize = '11px';
        uploadStatus.style.color = 'rgba(255, 255, 255, 0.6)';
        uploadStatus.textContent = 'Max size: 2MB';
        
        uploadContainer.appendChild(uploadTitle);
        uploadContainer.appendChild(uploadButton);
        uploadContainer.appendChild(uploadInput);
        uploadContainer.appendChild(uploadStatus);
        
        wallpaperTab.appendChild(uploadContainer);
        
        // Handle file upload
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                uploadStatus.textContent = 'Error: File too large (max 2MB)';
                uploadStatus.style.color = '#ff5f56';
                return;
            }
            
            // Check if image
            if (!file.type.startsWith('image/')) {
                uploadStatus.textContent = 'Error: Please select an image file';
                uploadStatus.style.color = '#ff5f56';
                return;
            }
            
            uploadStatus.textContent = 'Loading...';
            uploadStatus.style.color = '#f687b3';
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                
                // Apply the new wallpaper
                bg.style.backgroundImage = `url(${imageData})`;
                bg.style.backgroundSize = 'cover';
                bg.style.backgroundPosition = 'center';
                bg.style.backgroundRepeat = 'no-repeat';
                bg.className = 'desktop-workspace';
                
                // Save to localStorage
                localStorage.setItem('qos_wallpaper', imageData);
                
                uploadStatus.textContent = 'Wallpaper set! Refresh to see changes.';
                uploadStatus.style.color = '#4ade80';
                showGlobalAlert('Custom wallpaper applied!');
                logSystemEvent('Custom wallpaper uploaded');
                
                // Reset input so same file can be selected again
                uploadInput.value = '';
            };
            reader.onerror = () => {
                uploadStatus.textContent = 'Error: Failed to read file';
                uploadStatus.style.color = '#ff5f56';
            };
            
            reader.readAsDataURL(file);
        });
    }
}

// Setup custom themes
function setupThemeSelector() {
    const themeTab = document.getElementById('tab-general');
    if (!themeTab) return;
    
    const themesContainer = document.createElement('div');
    themesContainer.style.marginTop = '16px';
    themesContainer.style.padding = '12px';
    themesContainer.style.background = 'rgba(0, 0, 0, 0.2)';
    themesContainer.style.borderRadius = '8px';
    
    const themesTitle = document.createElement('div');
    themesTitle.style.fontSize = '13px';
    themesTitle.style.marginBottom = '8px';
    themesTitle.style.color = '#b794f4';
    themesTitle.textContent = '🎨 Color Themes';
    
    themesContainer.appendChild(themesTitle);
    
    // Create theme buttons
    for (const [key, theme] of Object.entries(CUSTOM_THEMES)) {
        const themeBtn = document.createElement('button');
        themeBtn.textContent = theme.name;
        themeBtn.style.display = 'block';
        themeBtn.style.width = '100%';
        themeBtn.style.padding = '8px 12px';
        themeBtn.style.marginBottom = '6px';
        themeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        themeBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        themeBtn.style.borderRadius = '6px';
        themeBtn.style.color = theme.accent;
        themeBtn.style.cursor = 'pointer';
        themeBtn.style.fontSize = '12px';
        themeBtn.style.textAlign = 'left';
        themeBtn.style.transition = 'all 0.2s ease';
        
        themeBtn.onmouseover = () => {
            themeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        };
        themeBtn.onmouseout = () => {
            themeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        };
        
        themeBtn.onclick = () => {
            // Apply theme
            document.documentElement.style.setProperty('--qos-accent', theme.accent);
            document.documentElement.style.setProperty('--qos-accent-amber', theme.accentAmber);
            document.documentElement.style.setProperty('--qos-bg-panel', theme.bgPanel);
            document.documentElement.style.setProperty('--qos-border', theme.border);
            document.documentElement.style.setProperty('--qos-text', theme.text);
            
            // Save theme preference
            localStorage.setItem('zenith_theme', key);
            
            showGlobalAlert(`Theme changed to: ${theme.name}`);
            logSystemEvent(`Theme changed to: ${key}`);
            
            // Update all windows with new theme
            document.querySelectorAll('.mac-window, .mac-menu-bar, .mac-dock').forEach(el => {
                el.style.background = theme.bgPanel;
                el.style.borderColor = theme.border;
            });
        };
        
        themesContainer.appendChild(themeBtn);
    }
    
    themeTab.appendChild(themesContainer);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('zenith_theme');
    if (savedTheme && CUSTOM_THEMES[savedTheme]) {
        const theme = CUSTOM_THEMES[savedTheme];
        document.documentElement.style.setProperty('--qos-accent', theme.accent);
        document.documentElement.style.setProperty('--qos-accent-amber', theme.accentAmber);
        document.documentElement.style.setProperty('--qos-bg-panel', theme.bgPanel);
        document.documentElement.style.setProperty('--qos-border', theme.border);
        document.documentElement.style.setProperty('--qos-text', theme.text);
    }
}

// Make incrementDevStat available globally for terminal
window.incrementDevStat = function(stat) {
    if (typeof devModeStats !== 'undefined') {
        if (devModeStats[stat] !== undefined) {
            devModeStats[stat]++;
        }
    }
};

// Initialize theme selector when settings load
setTimeout(setupThemeSelector, 500);
