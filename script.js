// Clock
setInterval(() => document.getElementById('live-clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 1000);

// Window Management
function openWindow(id) { document.getElementById(id).style.display = 'flex'; }
function closeWindow(id) { document.getElementById(id).style.display = 'none'; }

// Weather App
async function fetchWeather() {
    const display = document.getElementById('weather-display');
    display.textContent = "UPLINKING...";
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current_weather=true');
        const data = await res.json();
        display.textContent = `Hyderabad: ${data.current_weather.temperature}°C`;
    } catch(e) { display.textContent = "ERROR: UPLINK FAILED"; }
}
