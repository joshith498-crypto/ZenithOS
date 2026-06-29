// Clock
function updateClock() {
    const now = new Date();
    document.getElementById('live-clock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// Window Management
function openWindow(id) {
    document.getElementById(id).style.display = 'block';
}

function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
}

// Weather App Logic
async function fetchWeather() {
    const display = document.getElementById('weather-display');
    display.textContent = "Syncing... (NASA Beacon Active)";
    try {
        // Using Open-Meteo for Hyderabad
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current_weather=true');
        const data = await res.json();
        display.textContent = `Hyderabad: ${data.current_weather.temperature}°C`;
    } catch(e) {
        display.textContent = "Error: Uplink Failed";
    }
}
