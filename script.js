(() => {

  const API_KEY = "7e7b90789275f8f6e8dd95cfa2e2a5ec";

  const els = {
    themeToggle: document.getElementById("themeToggle"),
    currentLocation: document.getElementById("currentLocation"),
    refreshLocation: document.getElementById("refreshLocation"),
    useLocationBtn: document.getElementById("useLocationBtn"),
    cityInput: document.getElementById("cityInput"),
    searchBtn: document.getElementById("searchBtn"),
    cityResult: document.getElementById("cityResult"),
    gpsResult: document.getElementById("gpsResult"),
    secureNote: document.getElementById("secureNote"),
  };

 
  const saved = localStorage.getItem("theme") || "light";
  if (saved === "dark") document.body.classList.add("dark");
  setThemeButtonText();

  els.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    setThemeButtonText();
  });

  function setThemeButtonText() {
    els.themeToggle.textContent = document.body.classList.contains("dark")
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
  }


  els.searchBtn.addEventListener("click", () => {
    const city = els.cityInput.value.trim();
    if (!city) {
      els.cityResult.innerHTML = "Please enter a city.";
      return;
    }
    fetchCityWeather(city);
  });

  els.cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") els.searchBtn.click();
  });

  async function fetchCityWeather(city) {
    try {
      const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
      const data = await fetchJSON(url);
      els.cityResult.innerHTML = renderWeather(data, `Weather for "${city}"`);
     
    } catch (err) {
      els.cityResult.innerHTML = `❌ Could not load city weather (${err.message}).`;
    }
  }


  els.useLocationBtn.addEventListener("click", getGPSWeather);
  els.refreshLocation.addEventListener("click", getGPSWeather);

  function getGPSWeather() {
    if (!("geolocation" in navigator)) {
      els.gpsResult.innerHTML = "⚠️ Geolocation not supported in this browser.";
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const url =
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const data = await fetchJSON(url);
        els.currentLocation.textContent = `${data.name}, ${data.sys?.country || ""}`;
        els.gpsResult.innerHTML = renderWeather(data, "Weather at My Location");
      } catch (err) {
        els.gpsResult.innerHTML = `❌ Could not load location weather (${err.message}).`;
      }
    }, (err) => {
      let msg = "Unable to get location.";
      if (err.code === 1) msg = "Permission denied. Allow location access.";
      if (err.code === 2) msg = "Position unavailable.";
      if (err.code === 3) msg = "Location request timed out.";
      els.gpsResult.innerHTML = `⚠️ ${msg}`;
    });
  }

  // 6) Helpers
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function renderWeather(data, title = "") {
    const name = data.name ? `${data.name}, ${data.sys?.country || ""}`.trim() : "Unknown";
    const desc = data.weather?.[0]?.description || "n/a";
    const temp = data.main?.temp != null ? `${Math.round(data.main.temp)}°C` : "n/a";
    const wind = data.wind?.speed != null ? `${data.wind.speed} m/s` : "n/a";
    return `
      ${title ? `<h3>${title}</h3>` : ""}
      <p><strong>${name}</strong></p>
      <p>🌡️ ${temp} • ☁️ ${desc} • 💨 ${wind}</p>
    `;
  }

  // 7) Secure origin hint
  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    els.secureNote.textContent =
      "Tip: Geolocation needs https or http://localhost. Start a local server: python3 -m http.server 8000";
  }
})();
