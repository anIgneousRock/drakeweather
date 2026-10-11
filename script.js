function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

["clear-day", "clear-night", "cloudy", "storm"].forEach(n => {
  new Image().src = `images/${n}.jpg`;
});

async function load(lat, lon) {
  const url = "https://api.open-meteo.com/v1/forecast"
    + `?latitude=${lat}&longitude=${lon}`
    + "&current=temperature_2m,weather_code,is_day"
    + "&temperature_unit=fahrenheit";
  try {
    const res = await fetch(url);
    const { current } = await res.json();
    render(current);
    saveJSON("wx", current);
  } catch {
    if (!readJSON("wx")) {
      document.getElementById("weather").textContent = "Weather unavailable";
    }
  }
}

const cached = readJSON("wx");
if (cached) render(cached);

const loc = readJSON("loc") || FALLBACK;
load(loc.lat, loc.lon);

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    p => {
      const next = { lat: p.coords.latitude, lon: p.coords.longitude };
      saveJSON("loc", next);
      if (Math.abs(next.lat - loc.lat) > 0.05 || Math.abs(next.lon - loc.lon) > 0.05) {
        load(next.lat, next.lon);
      }
    },
    () => {},
    { timeout: 5000, maximumAge: 3600000 }
  );
}
