// ZenithOS - Mission Control & Telemetry
// This module monitors system health and provides real-time telemetry data
//
// NOTE: The CPU and RAM graphs are simulated since we can't actually
// measure browser resource usage (yet). Maybe in a future update!
//
// I spent way too long trying to make the graphs look smooth. The trick
// was using shadowBlur on the line stroke. Who knew?

const BOOT_TIME = Date.now();
let cpuHistory = Array.from({ length: 40 }, () => 20 + Math.random() * 20);
let ramHistory = Array.from({ length: 40 }, () => 35 + Math.random() * 15);

// Developer mode stats
let devModeStats = {
    commandsExecuted: 0,
    filesCreated: 0,
    filesDeleted: 0,
    windowsOpened: 0
};

function incrementDevStat(stat) {
    if (devModeStats[stat] !== undefined) {
        devModeStats[stat]++;
    }
}

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
            ? openWindows.map(w => `<div class="mc-list-row">📂 ${w.querySelector('.window-title') ? w.querySelector('.window-title').textContent : w.id}</div>`).join('')
            : `<div class="mc-list-row mc-dim">No active modules</div>`;
    }

    cpuHistory.push(clamp(cpuHistory[cpuHistory.length - 1] + (Math.random() - 0.5) * 18, 8, 96));
    if (cpuHistory.length > 40) cpuHistory.shift();
    ramHistory.push(clamp(ramHistory[ramHistory.length - 1] + (Math.random() - 0.5) * 10, 20, 90));
    if (ramHistory.length > 40) ramHistory.shift();

    drawTelemetryGraph('mc-cpu-canvas', cpuHistory, '#00ff66');
    drawTelemetryGraph('mc-ram-canvas', ramHistory, '#ffb347');

    renderMissionControlNotifs();
    renderSystemLogs();
    
    // Update developer stats if in dev mode
    if (typeof isDevMode === 'function' && isDevMode()) {
        updateDevConsole();
    }
}

function drawTelemetryGraph(canvasId, series, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let gy = 0; gy <= h; gy += h / 4) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
    }

    // Line
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

    // Fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, hexToRgba(color, 0.25));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.fill();

    // Value label
    const last = Math.round(series[series.length - 1]);
    ctx.fillStyle = color;
    ctx.font = '11px monospace';
    ctx.fillText(`${last}%`, w - 32, 14);
}

function renderMissionControlNotifs() {
    const notifEl = document.getElementById('mc-notif-list');
    if (!notifEl) return;
    notifEl.innerHTML = NotificationLog.length
        ? NotificationLog.map(n => `<div class="mc-list-row">📝 ${n.message} <span class="mc-dim">— ${n.time.toLocaleTimeString()}</span></div>`).join('')
        : `<div class="mc-list-row mc-dim">No recent activity</div>`;
}

// Render system logs
function renderSystemLogs() {
    const logsEl = document.getElementById('mc-system-logs');
    if (!logsEl) return;
    
    if (!SystemState.logs || SystemState.logs.length === 0) {
        logsEl.innerHTML = '<div class="mc-list-row mc-dim">No system logs yet</div>';
        return;
    }
    
    // Only show last 20 logs
    const recentLogs = SystemState.logs.slice(0, 20);
    logsEl.innerHTML = recentLogs.map(log => {
        const date = new Date(log.timestamp);
        const timeStr = date.toLocaleTimeString();
        const typeColor = log.type === 'error' ? '#ff5f56' : 
                         log.type === 'startup' ? '#4ade80' : 
                         log.type === 'alert' ? '#f687b3' : '#94a3b8';
        return `<div class="mc-list-row" style="border-left: 3px solid ${typeColor};">
            <span style="color: ${typeColor}; font-weight: bold;">[${log.type.toUpperCase()}]</span>
            <span style="margin-left: 8px;">${log.message}</span>
            <span class="mc-dim" style="margin-left: 8px;">— ${timeStr}</span>
        </div>`;
    }).join('');
}

// Developer Console Functions
function updateDevConsole() {
    const devConsole = document.getElementById('mc-dev-console');
    if (!devConsole) return;
    
    devConsole.innerHTML = `
        <div style="margin-bottom: 12px; font-size: 13px;">
            <strong style="color: #b794f4;">Developer Statistics</strong>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><span style="color: #94a3b8;">Commands Executed:</span> <span style="color: #4ade80;">${devModeStats.commandsExecuted}</span></div>
            <div><span style="color: #94a3b8;">Files Created:</span> <span style="color: #4ade80;">${devModeStats.filesCreated}</span></div>
            <div><span style="color: #94a3b8;">Files Deleted:</span> <span style="color: #4ade80;">${devModeStats.filesDeleted}</span></div>
            <div><span style="color: #94a3b8;">Windows Opened:</span> <span style="color: #4ade80;">${devModeStats.windowsOpened}</span></div>
        </div>
        <div style="margin-top: 12px; font-size: 11px; color: #64748b;">
            Developer Mode: ACTIVE | Type 'secret' in Terminal
        </div>
    `;
}

// Add developer console to Mission Control window
function addDevConsoleToMissionControl() {
    const mcWindow = document.getElementById('window-mission-control');
    if (!mcWindow) return;
    
    // Check if already in dev mode
    if (typeof isDevMode !== 'function' || !isDevMode()) return;
    
    const windowBody = mcWindow.querySelector('.window-body');
    if (!windowBody) return;
    
    // Check if dev console already exists
    if (document.getElementById('mc-dev-console')) return;
    
    const devConsole = document.createElement('div');
    devConsole.id = 'mc-dev-console';
    devConsole.style.marginTop = '16px';
    devConsole.style.padding = '12px';
    devConsole.style.background = 'rgba(183, 148, 244, 0.05)';
    devConsole.style.border = '1px solid rgba(183, 148, 244, 0.3)';
    devConsole.style.borderRadius = '8px';
    
    windowBody.appendChild(devConsole);
    updateDevConsole();
}

// Add system logs section to Mission Control
function addSystemLogsToMissionControl() {
    const mcWindow = document.getElementById('window-mission-control');
    if (!mcWindow) return;
    
    const windowBody = mcWindow.querySelector('.window-body');
    if (!windowBody) return;
    
    // Check if logs section already exists
    if (document.getElementById('mc-system-logs')) return;
    
    const logsSection = document.createElement('div');
    logsSection.id = 'mc-system-logs';
    logsSection.style.marginTop = '16px';
    logsSection.style.padding = '12px';
    logsSection.style.background = 'rgba(0, 0, 0, 0.2)';
    logsSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    logsSection.style.borderRadius = '8px';
    logsSection.style.maxHeight = '200px';
    logsSection.style.overflowY = 'auto';
    
    const logsTitle = document.createElement('div');
    logsTitle.style.marginBottom = '8px';
    logsTitle.style.fontSize = '13px';
    logsTitle.style.color = '#b794f4';
    logsTitle.textContent = '📜 System Activity Logs';
    
    logsSection.appendChild(logsTitle);
    windowBody.appendChild(logsSection);
    
    renderSystemLogs();
}

// Make functions globally available
window.incrementDevStat = incrementDevStat;
window.addDevConsoleToMissionControl = addDevConsoleToMissionControl;
window.renderSystemLogs = renderSystemLogs;

// Call these after Mission Control window is opened
setTimeout(() => {
    addDevConsoleToMissionControl();
    addSystemLogsToMissionControl();
}, 1000);
