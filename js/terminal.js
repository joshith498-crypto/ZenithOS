// ZenithOS - Terminal Emulator
// Built with love (and a lot of coffee)
//
// NOTE: The command history was tricky to implement because I had to handle
// the up/down arrow keys without breaking the normal input behavior.
// Also, the terminal input field doesn't play well with preventDefault,
// so I had to be careful with event handling.
//
// I spent way too long debugging why the terminal wasn't working - turned out
// I had a typo in the event listener ('keypress' instead of 'keydown').
//
// FIX: Changed isDevMode to use window.isDevMode to avoid reference errors

// TODO: Add tab completion for filenames
// TODO: Fix history navigation when input is empty

function setupTerminalConsole() {
    const input = document.getElementById('terminal-input');
    const body = document.querySelector('.terminal-body');
    if (!input) return;

    let termPath = ['Desktop']; // terminal has its own cwd, independent of Finder
    let commandHistory = [];
    let historyIndex = -1;
    let showHiddenFiles = false; // Flag for showing hidden files

    const printLine = (text, className = 'glowing-text') => {
        const line = document.createElement('p');
        line.className = className;
        line.style.fontSize = '12px';
        line.textContent = text;
        body.insertBefore(line, input.parentElement);
        body.scrollTop = body.scrollHeight;
        
        // Track commands for dev mode stats
        if (typeof window.incrementDevStat === 'function') {
            window.incrementDevStat('commandsExecuted');
        }
    };

    // NASA facts for easter eggs
    const nasaFacts = [
        "Did you know? The Voyager 1 spacecraft is over 15 billion miles from Earth and still sending data!",
        "Fun fact: A day on Venus is longer than a year on Venus (243 Earth days vs 225 Earth days).",
        "The International Space Station orbits Earth every 90 minutes - astronauts see 16 sunrises/sunsets daily!",
        "NASA's Deep Space Network can communicate with spacecraft over 10 billion miles away.",
        "The Apollo 11 guidance computer had only 64KB of memory - less than a digital watch today!",
        "Saturn's rings are made of billions of ice and rock particles, some as small as dust, others as large as mountains.",
        "The Hubble Space Telescope has made over 1.5 million observations since its launch in 1990.",
        "Mars has the largest volcano in the solar system - Olympus Mons, about 13.6 miles high.",
        "The Sun makes up 99.86% of the solar system's mass - Jupiter takes up most of the rest!",
        "A neutron star the size of a sugar cube would weigh about 1 billion tons on Earth."
    ];

    // My personal quotes for the 'quote' command
    const myQuotes = [
        "Code like a poet, debug like a detective. - Joshith",
        "The best code is the code that works. The second best is the code that's pretty.",
        "If at first you don't succeed, try Ctrl+Z and pretend it never happened.",
        "I don't always test my code, but when I do, I do it in production.",
        "404: Coffee not found. System halted.",
        "There are only 10 types of people: those who understand binary and those who don't.",
        "A computer once beat me at chess, but it was no match for me at kickboxing.",
        "I would love to change the world, but they won't give me the source code."
    ];

    // Add command to history
    const addToHistory = (cmd) => {
        if (cmd && cmd.trim() !== '') {
            commandHistory.push(cmd);
            historyIndex = commandHistory.length;
            // Keep only last 50 commands
            if (commandHistory.length > 50) {
                commandHistory.shift();
            }
        }
    };

    // Helper function to check dev mode safely
    function checkDevMode() {
        return typeof window.isDevMode === 'function' && window.isDevMode();
    }

    // Get current directory contents as string
    function getCurrentDirContents() {
        if (typeof VFS === 'undefined') return '';
        const items = showHiddenFiles ? VFS.listAll(termPath) : VFS.list(termPath);
        return items.length ? items.map(i => i.type === 'folder' ? `${i.name}/` : i.name).join('  ') : '(empty)';
    }

    // Handle up/down arrow for command history
    input.addEventListener('keydown', (e) => {
        // Handle history navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length === 0) return;
            if (historyIndex === commandHistory.length) {
                historyIndex = commandHistory.length - 1;
            } else if (historyIndex > 0) {
                historyIndex--;
            }
            input.value = commandHistory[historyIndex] || '';
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex] || '';
            } else {
                historyIndex = commandHistory.length;
                input.value = '';
            }
        } else if (e.key !== 'Enter') {
            return;
        }

        const raw = input.value.trim();
        input.value = '';
        if (raw === '') return;
        
        addToHistory(raw);
        printLine(`zenith:~ core$ ${raw}`);

        const [cmd, ...args] = raw.split(/\s+/);

        switch (cmd) {
            case 'help':
                printLine('Available commands:');
                printLine('  help, ls, pwd, cd, mkdir, touch, rm, mv, cp, cat, clear, date, whoami');
                printLine('  zenith, echo, reboot, shutdown, neofetch, top, easteregg, fortune');
                printLine('  quote, encrypt, decrypt, search, stat, history');
                if (checkDevMode()) {
                    printLine('  Dev Mode: lsall, hidden, secret, benchmark');
                }
                break;
            case 'pwd':
                printLine('/' + termPath.join('/'));
                break;
            case 'ls': {
                if (typeof VFS === 'undefined') break;
                printLine(getCurrentDirContents());
                break;
            }
            case 'lsall': {
                // Dev mode command to show all files including hidden
                if (typeof VFS === 'undefined' || !checkDevMode()) {
                    printLine('lsall: command not found');
                    break;
                }
                const items = VFS.listAll(termPath);
                printLine(items.length ? items.map(i => i.type === 'folder' ? `${i.name}/` : i.name).join('  ') : '(empty)');
                break;
            }
            case 'cd': {
                if (typeof VFS === 'undefined') break;
                if (!args[0] || args[0] === '~') { termPath = ['Desktop']; break; }
                if (args[0] === '..') { if (termPath.length > 1) termPath.pop(); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'folder') termPath.push(args[0]);
                else printLine(`cd: no such directory: ${args[0]}`);
                break;
            }
            case 'mkdir':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('mkdir: missing operand'); break; }
                const success = VFS.makeFolder(termPath, args[0]);
                printLine(success ? '' : `mkdir: cannot create '${args[0]}'`);
                if (success && typeof window.incrementDevStat === 'function') {
                    window.incrementDevStat('filesCreated');
                }
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'touch':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('touch: missing operand'); break; }
                if (!VFS.exists(termPath, args[0])) {
                    VFS.makeFile(termPath, args[0], '');
                    if (typeof window.incrementDevStat === 'function') {
                        window.incrementDevStat('filesCreated');
                    }
                }
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'rm':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('rm: missing operand'); break; }
                const success = VFS.remove(termPath, args[0]);
                printLine(success ? '' : `rm: cannot remove '${args[0]}': No such file`);
                if (success && typeof window.incrementDevStat === 'function') {
                    window.incrementDevStat('filesDeleted');
                }
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'mv': {
                if (typeof VFS === 'undefined') break;
                if (args.length < 2) { printLine('mv: missing operand'); break; }
                const ok = VFS.move(termPath, args[0], [args[1]]) || VFS.rename(termPath, args[0], args[1]);
                if (!ok) printLine(`mv: cannot move '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            }
            case 'cp': {
                if (typeof VFS === 'undefined') break;
                if (args.length < 2) { printLine('cp: missing operand'); break; }
                const node = VFS.resolve([...termPath, args[0]]);
                if (node && node.type === 'file') VFS.makeFile(termPath, args[1], node.content);
                else printLine(`cp: cannot copy '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            }
            case 'cat': {
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('cat: missing operand'); break; }
                // Use readFile which auto-decrypts
                const content = VFS.readFile(termPath, args[0]);
                if (content !== null) {
                    printLine(content || '(empty file)');
                } else {
                    printLine(`cat: ${args[0]}: No such file`);
                }
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
            case 'zenith':
                printLine('   _____            _ _   _ ');
                printLine('  |__  /___ _ __ (_) |_| |__');
                printLine('    / // _ \\ \'_ \\| | __| \'_ \\');
                printLine('   / /|  __/ | | | | |_| | | |');
                printLine('  /____\\___|_| |_|_|\\__|_| |_|');
                printLine('------------------------------');
                printLine('OS: Zenith Shell v1.0.0 Stable');
                printLine('Kernel: Webkit-Orbital-v2');
                printLine('Uplink: Stable (100%)');
                break;
            case 'echo':
                printLine(args.join(' ') || 'Usage: echo [text]');
                break;
            case 'neofetch':
                printLine('');
                printLine('       _,met$$$$$gg.          ');
                printLine('    ,g$$$$$$$$$$$$$$$P.       ');
                printLine('  ,g$$P""       """Y$$.".     ');
                printLine(' ,$$P"  ,ggs.     `$$b:\"    ');
                printLine(' ,$$P   ,$P""   ,    $$$     ');
                printLine(' ,$$P   ,$P    ,    $$$     ');
                printLine(' ,$$P   ,$P    ,    $$$     ');
                printLine(' `$$b   "$boodP"    $$$     ');
                printLine('  `Y$b.,            ,d$P    ');
                printLine('    `"Y$$b._   _,d$P"      ');
                printLine('      `""Y$$$$P"""         ');
                printLine('');
                printLine('User: ' + SystemState.userAccount);
                printLine('OS: ZenithOS v1.0.0 (NASA Mission Control Edition)');
                printLine('Kernel: Webkit-Orbital-v2');
                printLine('Uptime: ' + (typeof getUptime === 'function' ? getUptime() : 'Unknown'));
                printLine('Shell: Zenith Shell (sh)');
                printLine('Terminal: NASA OMNI Interface');
                printLine('CPU: Quantum Core i7-13700K (16) @ 5.4GHz');
                printLine('GPU: NVIDIA RTX 4090 Ti');
                printLine('Memory: 16GiB / 64GiB');
                printLine('');
                break;
            case 'top':
                printLine('PID  COMMAND         CPU%  MEM%');
                printLine('1    zenith-core     5.2   12.4');
                printLine('2    vfs-daemon      2.1   8.7');
                printLine('3    window-manager   15.3  22.1');
                printLine('4    terminal-sh      8.4   5.6');
                printLine('5    starfield-rend   22.8  15.3');
                printLine('6    mission-ctrl    3.2   4.8');
                printLine('');
                printLine('Total: 6 processes, System load: 0.45');
                break;
            case 'easteregg':
                printLine('');
                printLine('  *     *     *');
                printLine('   *   * *   *');
                printLine('    * *   * *');
                printLine('     *     *');
                printLine('      * * *');
                printLine('       * *');
                printLine('        *');
                printLine('');
                printLine(nasaFacts[Math.floor(Math.random() * nasaFacts.length)]);
                printLine('');
                break;
            case 'fortune':
                printLine('');
                printLine('Fortune Cookie (Space Edition):');
                printLine(nasaFacts[Math.floor(Math.random() * nasaFacts.length)]);
                printLine('');
                break;
            case 'quote':
                printLine('');
                printLine('Wisdom from Joshith:');
                printLine(myQuotes[Math.floor(Math.random() * myQuotes.length)]);
                printLine('');
                break;
            case 'encrypt': {
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('encrypt: missing operand'); break; }
                const success = VFS.encryptFile(termPath, args[0]);
                printLine(success ? `Encrypted: ${args[0]}` : `encrypt: cannot encrypt '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            }
            case 'decrypt': {
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('decrypt: missing operand'); break; }
                const success = VFS.decryptFile(termPath, args[0]);
                printLine(success ? `Decrypted: ${args[0]}` : `decrypt: cannot decrypt '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            }
            case 'search': {
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('search: missing operand'); break; }
                const results = VFS.search(args[0], termPath);
                if (results.length === 0) {
                    printLine('No matches found.');
                } else {
                    printLine(`Found ${results.length} match(es):`);
                    results.forEach(r => {
                        printLine(`  ${r.path.join('/')}${r.type === 'folder' ? '/' : ''}`);
                    });
                }
                break;
            }
            case 'stat': {
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('stat: missing operand'); break; }
                const info = VFS.stat(termPath, args[0]);
                if (info) {
                    printLine(`File: ${info.name}`);
                    printLine(`Type: ${info.type}`);
                    printLine(`Size: ${info.size} bytes`);
                    printLine(`Created: ${new Date(info.created).toLocaleString()}`);
                    printLine(`Modified: ${new Date(info.modified).toLocaleString()}`);
                    printLine(`Hidden: ${info.hidden}`);
                    printLine(`Encrypted: ${info.encrypted}`);
                } else {
                    printLine(`stat: cannot stat '${args[0]}': No such file`);
                }
                break;
            }
            case 'history':
                printLine('Command History:');
                commandHistory.slice(-10).forEach((cmd, i) => {
                    printLine(`  ${commandHistory.length - 10 + i + 1}: ${cmd}`);
                });
                break;
            case 'hidden':
                // Toggle showing hidden files
                showHiddenFiles = !showHiddenFiles;
                printLine(showHiddenFiles ? 'Hidden files: SHOWING' : 'Hidden files: HIDDEN');
                break;
            case 'secret':
                // Secret command to reveal hidden system files
                if (checkDevMode()) {
                    printLine('');
                    printLine('Secret System Files:');
                    printLine('  /System/security_layer.key - Contains encrypted credentials');
                    printLine('  /System/core_telemetry.sys - Real-time system data');
                    printLine('  /System/boot.log - System startup log');
                    printLine('');
                    printLine('Try: cat /System/security_layer.key');
                    printLine('');
                } else {
                    printLine('secret: Access denied. Activate developer mode first.');
                }
                break;
            case 'benchmark': {
                if (!checkDevMode()) {
                    printLine('benchmark: Access denied. Dev mode only.');
                    break;
                }
                printLine('Running system benchmark...');
                
                // My custom benchmark - tests various operations
                const start = Date.now();
                
                // Test 1: Math operations
                let x = 0;
                for (let i = 0; i < 100000; i++) {
                    x += Math.sqrt(i) * Math.random();
                }
                const mathTime = Date.now() - start;
                
                // Test 2: String operations
                let str = '';
                for (let i = 0; i < 10000; i++) {
                    str += 'a';
                }
                const stringTime = Date.now() - start - mathTime;
                
                // Test 3: Array operations
                const arr = [];
                for (let i = 0; i < 10000; i++) {
                    arr.push(i);
                }
                arr.sort((a, b) => b - a);
                const arrayTime = Date.now() - start - mathTime - stringTime;
                
                printLine('');
                printLine('Benchmark Results:');
                printLine(`  Math Operations: ${mathTime}ms`);
                printLine(`  String Operations: ${stringTime}ms`);
                printLine(`  Array Operations: ${arrayTime}ms`);
                printLine(`  Total: ${Date.now() - start}ms`);
                printLine('');
                printLine('Performance: ' + (Date.now() - start < 50 ? '⚡ Blazing Fast!' : Date.now() - start < 100 ? '🚀 Fast' : '🐢 Slow'));
                break;
            }
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
                printLine(`sh: command not found: ${cmd}. Type 'help' for available commands.`);
        }
    });
}
