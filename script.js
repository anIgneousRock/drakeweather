const FALLBACK = { lat: 37.66, lon: -121.87 };
/*sf*/

const CLASSES = ["clear-day", "clear-night", "cloudy", "fog", "rain", "snow", "storm"];

function describe(code, isDay) {
  if (code === 0) return ["Clear",         isDay ? "clear-day" : "clear-night"];
  if (code <= 2)  return ["Partly cloudy", isDay ? "clear-day" : "clear-night"];
  if (code === 3) return ["Cloudy",        "cloudy"];
  if (code <= 48) return ["Fog",           "fog"];
  if (code <= 57) return ["Drizzle",       "rain"];
  if (code <= 67) return ["Rain",          "rain"];
  if (code <= 77) return ["Snow",          "snow"];
  if (code <= 82) return ["Showers",       "rain"];
  if (code <= 86) return ["Snow showers",  "snow"];
  return                 ["Thunderstorm",  "storm"];
}

function render(current) {
  const [label, cls] = describe(current.weather_code, current.is_day === 1);
  document.body.classList.remove(...CLASSES);
  document.body.classList.add(cls);
  document.getElementById("weather").textContent = label;
  document.getElementById("degreesFahrenheit").textContent = Math.round(current.temperature_2m);
}

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

function refresh() {
  const l = readJSON("loc") || FALLBACK;
  load(l.lat, l.lon);
}

function init() {
  const cached = readJSON("wx");
  if (cached) render(cached);

  const start = readJSON("loc") || FALLBACK;
  load(start.lat, start.lon);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      p => {
        const next = { lat: p.coords.latitude, lon: p.coords.longitude };
        saveJSON("loc", next);
        if (Math.abs(next.lat - start.lat) > 0.05 || Math.abs(next.lon - start.lon) > 0.05) {
          load(next.lat, next.lon);
        }
      },
      () => {},
      { timeout: 5000, maximumAge: 3600000 }
    );
  }

  setInterval(refresh, 10 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
}

// Wait for <body> to exist, so it works with or without defer
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
