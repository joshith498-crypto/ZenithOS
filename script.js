// Clock
setInterval(() => document.getElementById('live-clock').textContent = new Date().toLocaleTimeString(), 1000);

// Window Toggling
function openWindow(id) { document.getElementById(id).style.display = 'flex'; }
function closeWindow(id) { document.getElementById(id).style.display = 'none'; }

// File Management for Finder
function createFile() {
    const name = prompt("Enter file name:");
    if(name) {
        const list = document.getElementById('file-list');
        const file = document.createElement('div');
        file.textContent = "📄 " + name;
        file.onclick = () => {
            const newName = prompt("Rename to:", name);
            if(newName) file.textContent = "📄 " + newName;
        };
        list.appendChild(file);
    }
}

// Weather Logic
async function fetchWeather() {
    const display = document.getElementById('weather-display');
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current_weather=true');
        const data = await res.json();
        display.textContent = `Temp: ${data.current_weather.temperature}°C`;
    } catch(e) { display.textContent = "Error"; }
}
