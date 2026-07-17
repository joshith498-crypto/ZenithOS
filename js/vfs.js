// ZenithOS - Virtual File System (VFS)
// Persisted in localStorage
// 
// NOTE: This was a pain to get right. Initially, I tried using a flat structure,
// but nested objects work better for directories. Also, JSON.stringify doesn't
// handle circular references, so we avoid those entirely.
//
// I spent 2 hours debugging why files weren't saving - turned out I forgot to call
// this.save() after modifications. Duh!
//
// TODO: Add file permissions (read/write/execute)
// TODO: Implement file size tracking
// TODO: Add file encryption (DONE!)

const VFS = {
    STORAGE_KEY: 'zenith_vfs_v3', // Updated to v3 for encryption support
    root: null,
    
    // My custom encryption key - don't tell anyone!
    // I generated this by mashing my keyboard: asdfjkl;
    ENCRYPTION_KEY: 'zenith_os_secret_key_2024',

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try { 
                this.root = JSON.parse(saved); 
                // Migrate old VFS if needed
                if (!this.root.meta) {
                    this.root = this.defaultTree();
                    this.save();
                }
                return; 
            } catch (e) { 
                console.error('VFS: Failed to parse saved data, resetting to defaults', e);
                this.root = this.defaultTree();
                this.save();
            }
        } else {
            this.root = this.defaultTree();
            this.save();
        }
    },

    // My custom XOR encryption - I learned this from a YouTube tutorial
    // and modified it to use a string key instead of a single char
    encrypt(text, key = this.ENCRYPTION_KEY) {
        if (!text) return text;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            // XOR each character with a character from the key (repeating key)
            const charCode = text.charCodeAt(i);
            const keyCharCode = key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode ^ keyCharCode);
        }
        // Return as base64 so it's storable
        return btoa(unescape(encodeURIComponent(result)));
    },

    // Decrypt using the same XOR method
    decrypt(encrypted, key = this.ENCRYPTION_KEY) {
        if (!encrypted) return encrypted;
        try {
            const decoded = decodeURIComponent(escape(atob(encrypted)));
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyCharCode = key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode ^ keyCharCode);
            }
            return result;
        } catch (e) {
            // If decryption fails, return original (might not be encrypted)
            console.warn('VFS: Decryption failed, returning original', e);
            return encrypted;
        }
    },

    defaultTree() {
        const folder = (name, children = {}) => ({
            type: 'folder', 
            name, 
            children,
            meta: {
                created: Date.now(),
                modified: Date.now(),
                hidden: false
            }
        });
        const file = (name, content = '', meta = {}) => ({
            type: 'file', 
            name, 
            content,
            meta: {
                created: Date.now(),
                modified: Date.now(),
                size: content.length,
                encrypted: false, // Track if file is encrypted
                ...meta
            }
        });
        return folder('root', {
            Desktop: folder('Desktop', {
                'satellite_comm.log': file('satellite_comm.log', 'Uplink stable. No anomalies detected.', {
                    hidden: false
                }),
                'terminal_core.sh': file('terminal_core.sh', '#!/bin/sh\necho "core link established"', {
                    hidden: false
                }),
                'README.txt': file('README.txt', 'Welcome to ZenithOS!\n\nThis is a web-based operating system inspired by NASA mission control.\n\nType "help" in Terminal for available commands.\n\n- Joshith (Developer)', {
                    hidden: false
                })
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
                'security_layer.key': file('security_layer.key', '***REDACTED***', {
                    hidden: true
                }),
                'boot.log': file('boot.log', 'System booted at: ' + new Date().toISOString())
            }),
            Trash: folder('Trash', {}, {
                hidden: true
            }),
        });
    },

    save() {
        // Update modified timestamps before saving
        this.updateTimestamps(this.root);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.root));
    },

    // Recursively update modified timestamps
    updateTimestamps(node) {
        if (!node) return;
        if (node.meta) {
            node.meta.modified = Date.now();
        }
        if (node.type === 'folder') {
            for (const key in node.children) {
                this.updateTimestamps(node.children[key]);
            }
        }
    },

    resolve(path) {
        let node = this.root;
        for (const seg of path) {
            if (!node || node.type !== 'folder' || !node.children[seg]) return null;
            node = node.children[seg];
        }
        return node;
    },

    list(path, includeHidden = false) {
        const node = this.resolve(path);
        if (!node || node.type !== 'folder') return [];
        
        const items = Object.values(node.children);
        
        // Filter out hidden items if not including them
        const filtered = includeHidden 
            ? items 
            : items.filter(item => !item.meta?.hidden);
        
        return filtered.sort((a, b) => {
            // Folders first, then files
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            // Then alphabetical
            return a.name.localeCompare(b.name);
        });
    },

    // List all items including hidden ones (for advanced users)
    listAll(path) {
        return this.list(path, true);
    },

    makeFolder(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || parent.children[name]) return false;
        parent.children[name] = { 
            type: 'folder', 
            name, 
            children: {},
            meta: {
                created: Date.now(),
                modified: Date.now(),
                hidden: false
            }
        };
        this.save();
        return true;
    },

    makeFile(path, name, content = '', encrypted = false) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || parent.children[name]) return false;
        
        // Encrypt content if requested
        const finalContent = encrypted ? this.encrypt(content) : content;
        
        parent.children[name] = { 
            type: 'file', 
            name, 
            content: finalContent,
            meta: {
                created: Date.now(),
                modified: Date.now(),
                size: finalContent.length,
                hidden: false,
                encrypted: encrypted
            }
        };
        this.save();
        return true;
    },

    remove(path, name, skipTrash = false) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name]) return false;
        
        const node = parent.children[name];
        
        // If not skipping trash and Trash exists, move to Trash instead of deleting
        if (!skipTrash && parent.children[name].type !== 'folder') {
            const trash = this.resolve(['Trash']);
            if (trash && trash.type === 'folder') {
                // Add timestamp to name to avoid conflicts
                const trashName = `${name}.trash_${Date.now()}`;
                trash.children[trashName] = JSON.parse(JSON.stringify(node));
                trash.children[trashName].meta.deleted = Date.now();
                delete parent.children[name];
                this.save();
                return true;
            }
        }
        
        delete parent.children[name];
        this.save();
        return true;
    },

    // Force delete (bypass trash)
    forceRemove(path, name) {
        return this.remove(path, name, true);
    },

    // Restore from trash
    restoreFromTrash(fileName, newPath = ['Desktop']) {
        const trash = this.resolve(['Trash']);
        if (!trash || trash.type !== 'folder' || !trash.children[fileName]) return false;
        
        const node = trash.children[fileName];
        const newParent = this.resolve(newPath);
        
        if (!newParent || newParent.type !== 'folder') return false;
        
        // Remove the .trash_* suffix
        const originalName = fileName.replace(/\.trash_\d+$/, '');
        
        // Handle name conflicts
        let finalName = originalName;
        let counter = 1;
        while (newParent.children[finalName]) {
            finalName = `${originalName} (${counter})`;
            counter++;
        }
        
        node.name = finalName;
        delete node.meta.deleted;
        newParent.children[finalName] = node;
        delete trash.children[fileName];
        
        this.save();
        return true;
    },

    // Empty the trash
    emptyTrash() {
        const trash = this.resolve(['Trash']);
        if (!trash || trash.type !== 'folder') return false;
        
        trash.children = {};
        this.save();
        return true;
    },

    rename(path, oldName, newName) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[oldName] || parent.children[newName]) return false;
        const node = parent.children[oldName];
        node.name = newName;
        node.meta.modified = Date.now();
        delete parent.children[oldName];
        parent.children[newName] = node;
        this.save();
        return true;
    },

    move(fromPath, name, toPath) {
        const src = this.resolve(fromPath);
        const dest = this.resolve(toPath);
        if (!src || !dest || dest.type !== 'folder' || !src.children[name] || dest.children[name]) return false;
        
        const node = src.children[name];
        node.meta.modified = Date.now();
        dest.children[name] = node;
        delete src.children[name];
        this.save();
        return true;
    },

    writeFile(path, name, content) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name] || parent.children[name].type !== 'file') return false;
        parent.children[name].content = content;
        parent.children[name].meta.modified = Date.now();
        parent.children[name].meta.size = content.length;
        parent.children[name].meta.encrypted = false;
        this.save();
        return true;
    },

    // Write encrypted file
    writeEncryptedFile(path, name, content) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name] || parent.children[name].type !== 'file') return false;
        const encrypted = this.encrypt(content);
        parent.children[name].content = encrypted;
        parent.children[name].meta.modified = Date.now();
        parent.children[name].meta.size = encrypted.length;
        parent.children[name].meta.encrypted = true;
        this.save();
        return true;
    },

    // Read file (auto-decrypts if encrypted)
    readFile(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name] || parent.children[name].type !== 'file') return null;
        
        const file = parent.children[name];
        if (file.meta.encrypted) {
            return this.decrypt(file.content);
        }
        return file.content;
    },

    exists(path, name) {
        const parent = this.resolve(path);
        return !!(parent && parent.type === 'folder' && parent.children[name]);
    },

    // Get file info (like stat in Unix)
    stat(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name]) return null;
        
        const node = parent.children[name];
        return {
            name: node.name,
            type: node.type,
            size: node.meta?.size || 0,
            created: node.meta?.created || null,
            modified: node.meta?.modified || null,
            hidden: node.meta?.hidden || false,
            encrypted: node.meta?.encrypted || false
        };
    },

    // Search for files/folders by name
    search(query, path = ['root']) {
        const results = [];
        const node = this.resolve(path);
        if (!node || node.type !== 'folder') return results;
        
        for (const [name, child] of Object.entries(node.children)) {
            if (name.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    path: [...path, name],
                    ...child
                });
            }
            if (child.type === 'folder') {
                results.push(...this.search(query, [...path, name]));
            }
        }
        return results;
    },

    // Encrypt an existing file
    encryptFile(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name] || parent.children[name].type !== 'file') return false;
        
        const file = parent.children[name];
        if (file.meta.encrypted) return false; // Already encrypted
        
        const decryptedContent = file.content; // It's not encrypted yet
        const encrypted = this.encrypt(decryptedContent);
        file.content = encrypted;
        file.meta.encrypted = true;
        file.meta.size = encrypted.length;
        file.meta.modified = Date.now();
        this.save();
        return true;
    },

    // Decrypt an existing file
    decryptFile(path, name) {
        const parent = this.resolve(path);
        if (!parent || parent.type !== 'folder' || !parent.children[name] || parent.children[name].type !== 'file') return false;
        
        const file = parent.children[name];
        if (!file.meta.encrypted) return false; // Not encrypted
        
        const decrypted = this.decrypt(file.content);
        file.content = decrypted;
        file.meta.encrypted = false;
        file.meta.size = decrypted.length;
        file.meta.modified = Date.now();
        this.save();
        return true;
    }
};

// Make VFS globally accessible for terminal commands
window.VFS = VFS;
