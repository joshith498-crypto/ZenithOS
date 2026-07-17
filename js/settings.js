// ZenithOS - System Settings & Customization
// Added custom wallpaper upload feature

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
}

function setVolume(value) {
    localStorage.setItem('qos_volume', value);
    const ccVal = document.getElementById('cc-volume-val');
    if (ccVal) ccVal.textContent = `${value}%`;
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

// Make incrementDevStat available globally for terminal
window.incrementDevStat = function(stat) {
    if (typeof devModeStats !== 'undefined') {
        if (devModeStats[stat] !== undefined) {
            devModeStats[stat]++;
        }
    }
};
