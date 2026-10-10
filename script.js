const FALLBACK = { lat: 37.66, lon: -121.87 };
/*sf */

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

async function load(lat, lon) {
  const url = "https://api.open-meteo.com/v1/forecast"
    + `?latitude=${lat}&longitude=${lon}`
    + "&current=temperature_2m,weather_code,is_day"
    + "&temperature_unit=fahrenheit";
  try {
    const res = await fetch(url);
    const { current } = await res.json();
    render(current);
    try { localStorage.setItem("wx", JSON.stringify(current)); } catch {}
  } catch {
    document.getElementById("weather").textContent = "Weather unavailable";
  }
}

try {
  const cached = localStorage.getItem("wx");
  if (cached) render(JSON.parse(cached));
} catch {}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    p => load(p.coords.latitude, p.coords.longitude),
    () => load(FALLBACK.lat, FALLBACK.lon),
    { timeout: 5000 }
  );
} else {
  load(FALLBACK.lat, FALLBACK.lon);
}