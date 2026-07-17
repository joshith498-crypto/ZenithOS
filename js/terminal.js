// ZenithOS - Terminal Emulator
// Built with love (and a lot of coffee)
//
// NOTE: The command history was tricky to implement because I had to handle
// the up/down arrow keys without breaking the normal input behavior.
// Also, the terminal input field doesn't play well with preventDefault,
// so I had to be careful with event handling.

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
        "Mars has the largest volcano in the solar system - Olympus Mons, about 13.6 miles high."
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
                if (isDevMode()) {
                    printLine('  Dev Mode: lsall, hidden, secret');
                }
                break;
            case 'pwd':
                printLine('/' + termPath.join('/'));
                break;
            case 'ls': {
                if (typeof VFS === 'undefined') break;
                const items = showHiddenFiles ? VFS.listAll(termPath) : VFS.list(termPath);
                printLine(items.length ? items.map(i => i.type === 'folder' ? `${i.name}/` : i.name).join('  ') : '(empty)');
                break;
            }
            case 'lsall': {
                // Dev mode command to show all files including hidden
                if (typeof VFS === 'undefined' || !isDevMode()) {
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
                printLine(VFS.makeFolder(termPath, args[0]) ? '' : `mkdir: cannot create '${args[0]}'`);
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'touch':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('touch: missing operand'); break; }
                if (!VFS.exists(termPath, args[0])) VFS.makeFile(termPath, args[0], '');
                if (typeof renderFinder === 'function') renderFinder();
                break;
            case 'rm':
                if (typeof VFS === 'undefined') break;
                if (!args[0]) { printLine('rm: missing operand'); break; }
                printLine(VFS.remove(termPath, args[0]) ? '' : `rm: cannot remove '${args[0]}': No such file`);
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
            case 'hidden':
                // Toggle showing hidden files
                showHiddenFiles = !showHiddenFiles;
                printLine(showHiddenFiles ? 'Hidden files: SHOWING' : 'Hidden files: HIDDEN');
                break;
            case 'secret':
                // Secret command to reveal hidden system files
                if (isDevMode()) {
                    printLine('');
                    printLine('Secret System Files:');
                    printLine('  /System/security_layer.key - Contains encrypted credentials');
                    printLine('  /System/core_telemetry.sys - Real-time system data');
                    printLine('');
                    printLine('Try: cat /System/security_layer.key');
                    printLine('');
                } else {
                    printLine('secret: Access denied. Activate developer mode first.');
                }
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
                printLine(`sh: command not found: ${cmd}. Type 'help' for available commands.`);
        }
    });
}
