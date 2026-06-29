// Clock
setInterval(() => document.getElementById('live-clock').textContent = new Date().toLocaleTimeString(), 1000);

// Weather API
async function fetchWeather() {
    const display = document.getElementById('weather-display');
    display.textContent = "UPLINKING...";
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current_weather=true');
        const data = await res.json();
        display.textContent = `${data.current_weather.temperature}°C`;
    } catch(e) { display.textContent = "UPLINK FAILED"; }
}

// Memory Game
let score = 0;
function initGame() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    for(let i=0; i<4; i++) {
        const btn = document.createElement('button');
        btn.textContent = "ENCRYPTED";
        btn.onclick = () => {
            score += 50;
            document.getElementById('score').textContent = score;
            btn.style.background = "#00ff00";
        };
        grid.appendChild(btn);
    }
}
initGame();
