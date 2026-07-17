// ZenithOS - Finder UI Logic
// Completely rewritten to work like a real OS file manager
//
// NOTE: I spent way too long debugging why the context menu wasn't showing.
// Turns out I forgot to add the menu elements to the HTML! Classic me.
//
// Now fixed with proper:
// - Right-click context menus
// - Double-click to open files/folders
// - Drag and drop (future feature)
// - Proper file operations (delete, rename, move)
// - Trash functionality

let FinderState = {
    currentPath: ['Desktop'],
    selectedItems: new Set(),
    isDragging: false,
    dragItem: null
};

function setupFinder() {
    // Get DOM elements
    const viewport = document.getElementById('finder-file-viewport');
    const pathLabel = document.getElementById('finder-title-path');
    const breadcrumbs = document.getElementById('finder-breadcrumbs');
    const search = document.getElementById('finder-search');
    const newFolderBtn = document.getElementById('finder-new-folder');
    const newFileBtn = document.getElementById('finder-new-file');
    
    // Create context menus if they don't exist
    createContextMenus();
    
    // Sync with global state
    FinderState.currentPath = SystemState.currentPath;

    // Search functionality
    if (search) {
        search.addEventListener('input', () => renderFinder());
    }

    // New folder button
    if (newFolderBtn) {
        newFolderBtn.addEventListener('click', () => {
            const name = promptUnique('Folder name:', FinderState.currentPath, 'New Folder');
            if (name && VFS.makeFolder(FinderState.currentPath, name)) {
                renderFinder();
                logSystemEvent(`Created folder: ${name}`);
            }
        });
    }

    // New file button
    if (newFileBtn) {
        newFileBtn.addEventListener('click', () => {
            const name = promptUnique('File name:', FinderState.currentPath, 'new_file.txt');
            if (name && VFS.makeFile(FinderState.currentPath, name, '')) {
                renderFinder();
                logSystemEvent(`Created file: ${name}`);
            }
        });
    }

    // Double-click to open files/folders
    if (viewport) {
        viewport.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.file-item');
            if (item) {
                openFinderItem(item.dataset.name);
            }
        });

        // Right-click for context menu
        viewport.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.file-item');
            hideContextMenus();
            
            if (item) {
                // Right-clicked on an item
                e.preventDefault();
                const itemMenu = document.getElementById('finder-item-menu');
                if (itemMenu) {
                    FinderState.selectedItems.clear();
                    FinderState.selectedItems.add(item.dataset.name);
                    positionMenu(itemMenu, e.clientX, e.clientY);
                }
            } else {
                // Right-clicked on empty space
                e.preventDefault();
                const blankMenu = document.getElementById('finder-blank-menu');
                if (blankMenu) {
                    positionMenu(blankMenu, e.clientX, e.clientY);
                }
            }
        });

        // Click to select items
        viewport.addEventListener('click', (e) => {
            const item = e.target.closest('.file-item');
            if (item) {
                // Toggle selection
                if (FinderState.selectedItems.has(item.dataset.name)) {
                    FinderState.selectedItems.delete(item.dataset.name);
                    item.classList.remove('selected');
                } else {
                    FinderState.selectedItems.add(item.dataset.name);
                    item.classList.add('selected');
                }
            } else {
                // Clicked on empty space - clear selection
                FinderState.selectedItems.clear();
                document.querySelectorAll('.file-item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
            }
            hideContextMenus();
        });
    }

    // Hide menus when clicking elsewhere
    document.addEventListener('click', hideContextMenus);

    // Setup menu actions
    setupMenuActions();

    // Initial render
    renderFinder();
}

// Create context menus if they don't exist
function createContextMenus() {
    // Check if menus already exist
    if (document.getElementById('finder-item-menu')) return;
    
    // Create item context menu (right-click on file/folder)
    const itemMenu = document.createElement('div');
    itemMenu.id = 'finder-item-menu';
    itemMenu.className = 'finder-context-menu';
    itemMenu.style.display = 'none';
    itemMenu.style.position = 'absolute';
    itemMenu.style.background = 'rgba(20, 24, 38, 0.95)';
    itemMenu.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    itemMenu.style.borderRadius = '8px';
    itemMenu.style.padding = '8px';
    itemMenu.style.zIndex = '10000';
    itemMenu.style.minWidth = '180px';
    itemMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    
    itemMenu.innerHTML = `
        <div class="finder-menu-item" data-action="open">
            <span>📂 Open</span>
        </div>
        <div class="finder-menu-item" data-action="rename">
            <span>✏️ Rename</span>
        </div>
        <div class="finder-menu-item" data-action="copy">
            <span>📋 Copy</span>
        </div>
        <div class="finder-menu-item" data-action="cut">
            <span>✂️ Cut</span>
        </div>
        <div class="finder-menu-item" data-action="paste">
            <span>🖌️ Paste</span>
        </div>
        <hr style="margin: 4px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
        <div class="finder-menu-item" data-action="delete" style="color: #ff5f56;">
            <span>🗑️ Move to Trash</span>
        </div>
    `;
    
    // Create blank context menu (right-click on empty space)
    const blankMenu = document.createElement('div');
    blankMenu.id = 'finder-blank-menu';
    blankMenu.className = 'finder-context-menu';
    blankMenu.style.display = 'none';
    blankMenu.style.position = 'absolute';
    blankMenu.style.background = 'rgba(20, 24, 38, 0.95)';
    blankMenu.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    blankMenu.style.borderRadius = '8px';
    blankMenu.style.padding = '8px';
    blankMenu.style.zIndex = '10000';
    blankMenu.style.minWidth = '180px';
    blankMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    
    blankMenu.innerHTML = `
        <div class="finder-menu-item" data-action="new-folder">
            <span>📁 New Folder</span>
        </div>
        <div class="finder-menu-item" data-action="new-file">
            <span>📄 New File</span>
        </div>
        <div class="finder-menu-item" data-action="paste">
            <span>🖌️ Paste</span>
        </div>
        <hr style="margin: 4px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
        <div class="finder-menu-item" data-action="refresh">
            <span>🔄 Refresh</span>
        </div>
    `;
    
    // Add menus to the Finder window
    const finderWindow = document.getElementById('window-finder');
    if (finderWindow) {
        finderWindow.appendChild(itemMenu);
        finderWindow.appendChild(blankMenu);
    }
}

// Setup menu action handlers
function setupMenuActions() {
    // Item menu actions
    const itemMenu = document.getElementById('finder-item-menu');
    if (itemMenu) {
        itemMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.finder-menu-item')?.dataset.action;
            if (!action) return;
            
            const selected = Array.from(FinderState.selectedItems);
            if (selected.length === 0) return;
            
            const name = selected[0]; // For now, just handle single selection
            const node = VFS.resolve([...FinderState.currentPath])?.children[name];
            
            switch (action) {
                case 'open':
                    openFinderItem(name);
                    break;
                case 'rename':
                    const newName = prompt('Rename to:', name);
                    if (newName && newName !== name && VFS.rename(FinderState.currentPath, name, newName)) {
                        renderFinder();
                        logSystemEvent(`Renamed: ${name} -> ${newName}`);
                    }
                    break;
                case 'copy':
                    // Copy to clipboard (store in memory)
                    FinderState.clipboard = { action: 'copy', path: [...FinderState.currentPath], name };
                    showGlobalAlert(`Copied: ${name}`);
                    break;
                case 'cut':
                    // Cut to clipboard (store in memory)
                    FinderState.clipboard = { action: 'cut', path: [...FinderState.currentPath], name };
                    showGlobalAlert(`Cut: ${name}`);
                    break;
                case 'paste':
                    pasteFromClipboard();
                    break;
                case 'delete':
                    if (confirm(`Move "${name}" to Trash?`)) {
                        if (VFS.move(FinderState.currentPath, name, ['Trash'])) {
                            renderFinder();
                            logSystemEvent(`Moved to Trash: ${name}`);
                            showGlobalAlert(`Moved "${name}" to Trash`);
                        } else {
                            showGlobalAlert(`Failed to move "${name}" to Trash`);
                        }
                    }
                    break;
            }
            hideContextMenus();
        });
    }

    // Blank menu actions
    const blankMenu = document.getElementById('finder-blank-menu');
    if (blankMenu) {
        blankMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.finder-menu-item')?.dataset.action;
            if (!action) return;
            
            switch (action) {
                case 'new-folder':
                    const folderName = promptUnique('Folder name:', FinderState.currentPath, 'New Folder');
                    if (folderName && VFS.makeFolder(FinderState.currentPath, folderName)) {
                        renderFinder();
                        logSystemEvent(`Created folder: ${folderName}`);
                    }
                    break;
                case 'new-file':
                    const fileName = promptUnique('File name:', FinderState.currentPath, 'new_file.txt');
                    if (fileName && VFS.makeFile(FinderState.currentPath, fileName, '')) {
                        renderFinder();
                        logSystemEvent(`Created file: ${fileName}`);
                    }
                    break;
                case 'paste':
                    pasteFromClipboard();
                    break;
                case 'refresh':
                    renderFinder();
                    showGlobalAlert('Refreshed');
                    break;
            }
            hideContextMenus();
        });
    }
}

// Paste from clipboard
function pasteFromClipboard() {
    if (!FinderState.clipboard) {
        showGlobalAlert('Nothing to paste');
        return;
    }
    
    const { action, path, name } = FinderState.clipboard;
    const node = VFS.resolve(path)?.children[name];
    if (!node) {
        showGlobalAlert('Clipboard content not found');
        return;
    }
    
    if (action === 'copy') {
        // Copy the item to current directory
        if (node.type === 'folder') {
            // Deep copy folder
            if (VFS.makeFolder(FinderState.currentPath, name)) {
                // TODO: Copy folder contents
                renderFinder();
                logSystemEvent(`Pasted folder: ${name}`);
                showGlobalAlert(`Pasted: ${name}`);
            }
        } else {
            // Copy file
            if (VFS.makeFile(FinderState.currentPath, name, node.content)) {
                renderFinder();
                logSystemEvent(`Pasted file: ${name}`);
                showGlobalAlert(`Pasted: ${name}`);
            }
        }
    } else if (action === 'cut') {
        // Move the item to current directory
        if (VFS.move(path, name, [...FinderState.currentPath])) {
            renderFinder();
            logSystemEvent(`Moved: ${name} to ${FinderState.currentPath.join('/')}`);
            showGlobalAlert(`Moved: ${name}`);
        } else {
            showGlobalAlert(`Failed to move: ${name}`);
        }
    }
    
    // Clear clipboard after paste
    FinderState.clipboard = null;
}

// Hide all context menus
function hideContextMenus() {
    document.querySelectorAll('.finder-context-menu').forEach(m => {
        m.style.display = 'none';
    });
}

// Position menu at coordinates
function positionMenu(menu, x, y) {
    if (!menu) return;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
}

// Open a file or folder
function openFinderItem(name) {
    const dir = VFS.resolve(FinderState.currentPath);
    const node = dir && dir.children[name];
    if (!node) return;
    
    if (node.type === 'folder') {
        // Open folder
        FinderState.currentPath.push(name);
        SystemState.currentPath = [...FinderState.currentPath];
        renderFinder();
        logSystemEvent(`Opened folder: ${name}`);
    } else {
        // Open file - use readFile to handle encrypted files
        const content = VFS.readFile(FinderState.currentPath, name);
        const updated = prompt(`Viewing ${name}:`, content || '');
        if (updated !== null) {
            VFS.writeFile(FinderState.currentPath, name, updated);
            logSystemEvent(`Edited file: ${name}`);
        }
    }
}

// Navigate via breadcrumbs
function navigateBreadcrumb(index) {
    FinderState.currentPath = FinderState.currentPath.slice(0, index + 1);
    SystemState.currentPath = [...FinderState.currentPath];
    renderFinder();
}

// Render the Finder view
function renderFinder() {
    const viewport = document.getElementById('finder-file-viewport');
    const pathLabel = document.getElementById('finder-title-path');
    const breadcrumbs = document.getElementById('finder-breadcrumbs');
    const search = document.getElementById('finder-search');
    if (!viewport) return;

    // Update current path in global state
    SystemState.currentPath = [...FinderState.currentPath];

    const pathStr = '/' + FinderState.currentPath.join('/');
    if (pathLabel) pathLabel.textContent = `Finder — ${pathStr}`;

    // Render breadcrumbs
    if (breadcrumbs) {
        breadcrumbs.innerHTML = '';
        FinderState.currentPath.forEach((seg, idx) => {
            const crumb = document.createElement('span');
            crumb.className = 'breadcrumb-item';
            crumb.textContent = seg;
            crumb.style.cursor = 'pointer';
            crumb.style.color = '#b794f4';
            crumb.style.marginRight = '4px';
            crumb.addEventListener('click', () => navigateBreadcrumb(idx));
            breadcrumbs.appendChild(crumb);
            if (idx < FinderState.currentPath.length - 1) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-sep';
                sep.textContent = '›';
                sep.style.color = 'rgba(255,255,255,0.4)';
                breadcrumbs.appendChild(sep);
            }
        });
    }

    // Get items from VFS
    let items = VFS.list(FinderState.currentPath);
    const query = search ? search.value.trim().toLowerCase() : '';
    if (query) {
        items = items.filter(i => i.name.toLowerCase().includes(query));
    }

    // Clear viewport
    viewport.innerHTML = '';
    
    if (items.length === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'finder-empty';
        emptyEl.textContent = '— empty —';
        emptyEl.style.textAlign = 'center';
        emptyEl.style.padding = '40px';
        emptyEl.style.color = 'rgba(255,255,255,0.4)';
        viewport.appendChild(emptyEl);
        return;
    }

    // Render each item
    items.forEach(item => {
        const icon = item.type === 'folder' ? '📁' : guessFileIcon(item.name);
        const el = document.createElement('div');
        el.className = 'file-item';
        el.dataset.name = item.name;
        el.dataset.type = item.type;
        
        // Style the item
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'center';
        el.style.width = '80px';
        el.style.margin = '8px';
        el.style.padding = '8px';
        el.style.borderRadius = '8px';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s ease';
        el.style.userSelect = 'none';
        
        // Hover effect
        el.onmouseenter = () => {
            el.style.background = 'rgba(255,255,255,0.05)';
            el.style.transform = 'translateY(-2px)';
        };
        el.onmouseleave = () => {
            el.style.background = '';
            el.style.transform = '';
        };
        
        // Selected state
        if (FinderState.selectedItems.has(item.name)) {
            el.classList.add('selected');
            el.style.background = 'rgba(183, 148, 244, 0.1)';
            el.style.border = '1px solid #b794f4';
        }
        
        // Encrypted file indicator
        if (item.type === 'file' && item.meta?.encrypted) {
            el.innerHTML = `
                <span class="file-icon" style="font-size: 32px; margin-bottom: 4px;">${icon} 🔒</span>
                <span class="file-label" style="font-size: 11px; text-align: center; word-break: break-all;">${item.name}</span>
            `;
        } else {
            el.innerHTML = `
                <span class="file-icon" style="font-size: 32px; margin-bottom: 4px;">${icon}</span>
                <span class="file-label" style="font-size: 11px; text-align: center; word-break: break-all;">${item.name}</span>
            `;
        }
        
        viewport.appendChild(el);
    });
}

// Guess file icon based on extension
function guessFileIcon(name) {
    if (name.endsWith('.sh')) return '💻';
    if (name.endsWith('.log') || name.endsWith('.sys')) return '📜';
    if (name.endsWith('.key')) return '🔑';
    if (name.endsWith('.dat') || name.endsWith('.bak')) return '💾';
    if (name.endsWith('.pkg') || name.endsWith('.gz')) return '📦';
    if (name.endsWith('.txt')) return '📄';
    if (name.endsWith('.js')) return '⚡';
    if (name.endsWith('.css')) return '🎨';
    if (name.endsWith('.html')) return '🌐';
    return '📝';
}

// Generate unique name for new files/folders
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

// Make FinderState globally accessible
window.FinderState = FinderState;
