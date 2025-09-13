// Live Weather App JavaScript

// WeatherAPI.com API key - Replace YOUR_NEW_API_KEY with your actual key
const API_KEY = "967d038d4b974fff929161657253108";
const API_BASE_URL = "https://api.weatherapi.com/v1";

// CORS proxy to bypass browser restrictions (alternative)
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
let USE_CORS_PROXY = false; // Can be toggled via button

// Weather background animation mapping for WeatherAPI.com condition codes
function getWeatherBackgroundClass(conditionCode, conditionText, isDay) {
  const lowerCondition = conditionText.toLowerCase();

  // Rain conditions
  if (
    lowerCondition.includes("rain") ||
    lowerCondition.includes("drizzle") ||
    lowerCondition.includes("shower")
  ) {
    return "weather-rain";
  }

  // Snow conditions
  if (lowerCondition.includes("snow") || lowerCondition.includes("blizzard")) {
    return "weather-snow";
  }

  // Thunder conditions
  if (lowerCondition.includes("thunder") || lowerCondition.includes("storm")) {
    return "weather-thunder";
  }

  // Clear/Sunny conditions - different for day vs night
  if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) {
    return isDay ? "weather-sunny" : "weather-clear-night";
  }

  // Cloudy conditions
  if (
    lowerCondition.includes("cloud") ||
    lowerCondition.includes("overcast") ||
    lowerCondition.includes("partly")
  ) {
    return "weather-cloudy";
  }

  // Mist/Fog conditions
  if (lowerCondition.includes("mist") || lowerCondition.includes("fog")) {
    return "weather-mist";
  }

  // Default based on condition codes
  if (
    [1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(
      conditionCode
    )
  ) {
    return "weather-rain";
  }
  if (
    [1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)
  ) {
    return "weather-snow";
  }
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) {
    return "weather-thunder";
  }
  if ([1000].includes(conditionCode)) {
    return isDay ? "weather-sunny" : "weather-clear-night";
  }
  if ([1003, 1006, 1009].includes(conditionCode)) {
    return "weather-cloudy";
  }
  if ([1030, 1135, 1147].includes(conditionCode)) {
    return "weather-mist";
  }

  return isDay ? "weather-sunny" : "weather-clear-night"; // Default fallback
}

// Weather icon mapping for WeatherAPI.com condition codes
function getWeatherIconClass(conditionCode, isDay) {
  const iconMap = {
    1000: isDay ? "fas fa-sun" : "fas fa-moon", // Clear
    1003: isDay ? "fas fa-cloud-sun" : "fas fa-cloud-moon", // Partly cloudy
    1006: "fas fa-cloud", // Cloudy
    1009: "fas fa-cloud", // Overcast
    1030: "fas fa-smog", // Mist
    1063: isDay ? "fas fa-cloud-sun-rain" : "fas fa-cloud-rain", // Patchy rain possible
    1066: isDay ? "fas fa-cloud-snow" : "fas fa-snowflake", // Patchy snow possible
    1069: "fas fa-cloud-rain", // Patchy sleet possible
    1072: "fas fa-cloud-rain", // Patchy freezing drizzle possible
    1087: "fas fa-bolt", // Thundery outbreaks possible
    1114: "fas fa-wind", // Blowing snow
    1117: "fas fa-wind", // Blizzard
    1135: "fas fa-smog", // Fog
    1147: "fas fa-smog", // Freezing fog
    1150: "fas fa-cloud-drizzle", // Patchy light drizzle
    1153: "fas fa-cloud-drizzle", // Light drizzle
    1168: "fas fa-cloud-drizzle", // Freezing drizzle
    1171: "fas fa-cloud-showers-heavy", // Heavy freezing drizzle
    1180: "fas fa-cloud-rain", // Patchy light rain
    1183: "fas fa-cloud-rain", // Light rain
    1186: "fas fa-cloud-rain", // Moderate rain at times
    1189: "fas fa-cloud-rain", // Moderate rain
    1192: "fas fa-cloud-showers-heavy", // Heavy rain at times
    1195: "fas fa-cloud-showers-heavy", // Heavy rain
    1198: "fas fa-cloud-rain", // Light freezing rain
    1201: "fas fa-cloud-showers-heavy", // Moderate or heavy freezing rain
    1204: "fas fa-cloud-rain", // Light sleet
    1207: "fas fa-cloud-rain", // Moderate or heavy sleet
    1210: "fas fa-snowflake", // Patchy light snow
    1213: "fas fa-snowflake", // Light snow
    1216: "fas fa-snowflake", // Patchy moderate snow
    1219: "fas fa-snowflake", // Moderate snow
    1222: "fas fa-snowflake", // Patchy heavy snow
    1225: "fas fa-snowflake", // Heavy snow
    1237: "fas fa-cloud-hail", // Ice pellets
    1240: "fas fa-cloud-rain", // Light rain shower
    1243: "fas fa-cloud-showers-heavy", // Moderate or heavy rain shower
    1246: "fas fa-cloud-showers-heavy", // Torrential rain shower
    1249: "fas fa-cloud-rain", // Light sleet showers
    1252: "fas fa-cloud-showers-heavy", // Moderate or heavy sleet showers
    1255: "fas fa-snowflake", // Light snow showers
    1258: "fas fa-snowflake", // Moderate or heavy snow showers
    1261: "fas fa-cloud-hail", // Light showers of ice pellets
    1264: "fas fa-cloud-hail", // Moderate or heavy showers of ice pellets
    1273: "fas fa-bolt", // Patchy light rain with thunder
    1276: "fas fa-bolt", // Moderate or heavy rain with thunder
    1279: "fas fa-bolt", // Patchy light snow with thunder
    1282: "fas fa-bolt", // Moderate or heavy snow with thunder
  };

  return iconMap[conditionCode] || (isDay ? "fas fa-sun" : "fas fa-moon");
}

// DOM Elements
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weatherContent");
const errorMessage = document.getElementById("errorMessage");

// Add enter key support for search
cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchWeather();
  }
});

// Search weather function
async function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }

  if (API_KEY === "YOUR_API_KEY") {
    showError(
      "Please set up your WeatherAPI.com API key first. See instructions below."
    );
    return;
  }

  try {
    showLoading();
    const weatherData = await fetchWeatherData(city);
    const forecastData = await fetchForecastData(city);
    displayWeather(weatherData, forecastData);
  } catch (error) {
    console.error("Error fetching weather:", error);

    if (error.message.includes("CORS_ERROR")) {
      showError(
        "🛡️ API Access Blocked! Your API key is valid, but browser security is blocking the request. Click the shield button (🛡️) to enable proxy access, then try again."
      );
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      showError(
        "🌐 Connection Issue: Click the shield button (🛡️) to enable proxy access, or check your internet connection."
      );
    } else if (
      error.message.includes("401") ||
      error.message.includes("Invalid API key")
    ) {
      showError(
        "🔑 API Access Issue: This is likely a browser security issue, not an invalid key. Click the shield button (🛡️) to enable proxy access and try again."
      );
    } else if (error.message.includes("404")) {
      showError(
        "Location not found. Please check the city name and try again."
      );
    } else if (error.message.includes("429")) {
      showError("Too many requests. Please wait a moment before trying again.");
    } else {
      showError(
        `Unable to fetch weather data: ${error.message || "Unknown error"}`
      );
    }
  }
}

// Get current location weather
async function getCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by this browser");
    return;
  }

  if (API_KEY === "YOUR_API_KEY") {
    showError(
      "Please set up your WeatherAPI.com API key first. See instructions below."
    );
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const weatherData = await fetchWeatherDataByCoords(latitude, longitude);
        const forecastData = await fetchForecastDataByCoords(
          latitude,
          longitude
        );
        displayWeather(weatherData, forecastData);
        cityInput.value = weatherData.location.name;
      } catch (error) {
        console.error("Error fetching weather by location:", error);
        showError("Unable to fetch weather data for your location");
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      showError(
        "Unable to access your location. Please search for a city manually."
      );
    }
  );
}

// Fetch weather data by city name
async function fetchWeatherData(city) {
  const apiUrl = `${API_BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(
    city
  )}&aqi=yes`;
  const url = USE_CORS_PROXY
    ? `${CORS_PROXY}${encodeURIComponent(apiUrl)}`
    : apiUrl;
  console.log("Fetching weather data from:", url);

  try {
    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Weather API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Weather data received:", data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);

    // If direct request fails and not using proxy yet, suggest proxy
    if (
      !USE_CORS_PROXY &&
      (error.name === "TypeError" ||
        error.message.includes("fetch") ||
        error.message.includes("Invalid API key"))
    ) {
      throw new Error(
        "CORS_ERROR: Direct API access blocked. Click the shield button (🛡️) to enable proxy."
      );
    }

    throw error;
  }
}

// Fetch forecast data by city name
async function fetchForecastData(city) {
  const apiUrl = `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
    city
  )}&days=5`;
  const url = USE_CORS_PROXY
    ? `${CORS_PROXY}${encodeURIComponent(apiUrl)}`
    : apiUrl;
  console.log("Fetching forecast data from:", url);

  try {
    const response = await fetch(url);
    console.log("Forecast response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Forecast API Error Response:", errorText);
      throw new Error(`Forecast API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Forecast data received:", data);
    return data;
  } catch (error) {
    console.error("Forecast fetch error:", error);
    throw error;
  }
}

// Fetch weather data by coordinates
async function fetchWeatherDataByCoords(lat, lon) {
  const response = await fetch(
    `${API_BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=yes`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return await response.json();
}

// Fetch forecast data by coordinates
async function fetchForecastDataByCoords(lat, lon) {
  const response = await fetch(
    `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5`
  );

  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`);
  }

  return await response.json();
}

// Display weather data
function displayWeather(weatherData, forecastData) {
  // Current weather
  document.getElementById("temperature").textContent = `${Math.round(
    weatherData.current.temp_c
  )}°C`;
  document.getElementById("description").textContent =
    weatherData.current.condition.text;
  document.getElementById(
    "location"
  ).textContent = `${weatherData.location.name}, ${weatherData.location.country}`;

  // Weather icon - use WeatherAPI condition for mapping
  const conditionCode = weatherData.current.condition.code;
  const isDay = weatherData.current.is_day;
  const iconClass = getWeatherIconClass(conditionCode, isDay);
  document.getElementById(
    "weatherIcon"
  ).innerHTML = `<i class="${iconClass}"></i>`;

  // Apply weather-based background animation
  const conditionText = weatherData.current.condition.text;
  const weatherBackgroundClass = getWeatherBackgroundClass(
    conditionCode,
    conditionText,
    isDay
  );

  // Remove any existing weather background classes
  document.body.classList.remove(
    "weather-rain",
    "weather-drizzle",
    "weather-shower",
    "weather-snow",
    "weather-sunny",
    "weather-clear",
    "weather-clear-night",
    "weather-cloudy",
    "weather-overcast",
    "weather-partly-cloudy",
    "weather-thunder",
    "weather-storm",
    "weather-mist",
    "weather-fog"
  );

  // Remove existing rain container and cleanup intervals
  const existingRain = document.querySelector(".rain-container");
  if (existingRain) {
    // Clear any running intervals for cloud regeneration
    if (existingRain.regenerateInterval) {
      clearInterval(existingRain.regenerateInterval);
    }
    existingRain.remove();
  }

  // Add the new weather background class
  document.body.classList.add(weatherBackgroundClass);

  console.log(
    `Weather condition: ${conditionText}, Applied background class: ${weatherBackgroundClass}`
  );

  // Create rain animation for rainy weather
  if (weatherBackgroundClass === "weather-rain") {
    console.log("🌧️ RAIN ANIMATION ACTIVATED! Creating rain droplets...");
    createRainAnimation();
  }

  // Weather details
  document.getElementById(
    "visibility"
  ).textContent = `${weatherData.current.vis_km} km`;
  document.getElementById(
    "humidity"
  ).textContent = `${weatherData.current.humidity}%`;
  document.getElementById("windSpeed").textContent = `${Math.round(
    weatherData.current.wind_kph
  )} km/h`;
  document.getElementById("feelsLike").textContent = `${Math.round(
    weatherData.current.feelslike_c
  )}°C`;
  document.getElementById(
    "pressure"
  ).textContent = `${weatherData.current.pressure_mb} hPa`;
  document.getElementById(
    "cloudiness"
  ).textContent = `${weatherData.current.cloud}%`;

  // Store forecast data for modal
  currentForecastData = forecastData;

  // 5-day forecast
  displayForecast(forecastData);

  showWeather();
}

// Display forecast data with modal functionality
function displayForecast(forecastData) {
  const forecastGrid = document.getElementById("forecastGrid");
  forecastGrid.innerHTML = "";

  // WeatherAPI.com provides daily forecasts directly
  forecastData.forecast.forecastday.forEach((dayForecast, index) => {
    const date = new Date(dayForecast.date);
    const dayName = date.toLocaleDateString("en", { weekday: "short" });
    const conditionCode = dayForecast.day.condition.code;
    const iconClass = getWeatherIconClass(conditionCode, true); // Use day icon for forecast

    const forecastItem = document.createElement("div");
    forecastItem.className = "forecast-item clickable-forecast";
    forecastItem.setAttribute("data-day-index", index);
    forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="forecast-temps">
                <span><strong>${Math.round(
                  dayForecast.day.maxtemp_c
                )}°</strong></span>
                <span>${Math.round(dayForecast.day.mintemp_c)}°</span>
            </div>
            <div class="forecast-click-hint">
                <i class="fas fa-info-circle"></i>
                <span>Click for details</span>
            </div>
        `;

    // Add click handler for modal
    forecastItem.addEventListener("click", () => {
      openWeatherModal(index);
    });

    // Add hover effect
    forecastItem.addEventListener("mouseenter", () => {
      forecastItem.style.transform = "translateY(-3px)";
    });

    forecastItem.addEventListener("mouseleave", () => {
      forecastItem.style.transform = "translateY(0)";
    });

    forecastGrid.appendChild(forecastItem);
  });
}

// Show loading state
function showLoading() {
  weatherCard.classList.add("show");
  loading.style.display = "block";
  weatherContent.style.display = "none";
  errorMessage.style.display = "none";
}

// Show weather content
function showWeather() {
  loading.style.display = "none";
  weatherContent.style.display = "block";
  errorMessage.style.display = "none";
}

// Show error message
function showError(message) {
  weatherCard.classList.add("show");
  loading.style.display = "none";
  weatherContent.style.display = "none";
  errorMessage.style.display = "block";
  document.getElementById("errorText").textContent = message;
}

// Theme Toggle Functionality
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById("themeIcon");

  if (body.classList.contains("dark-theme")) {
    // Switch to light theme
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    themeIcon.className = "fas fa-sun";
    localStorage.setItem("theme", "light");
  } else {
    // Switch to dark theme
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    themeIcon.className = "fas fa-moon";
    localStorage.setItem("theme", "dark");
  }
}

// Load saved theme or set default
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  const body = document.body;
  const themeIcon = document.getElementById("themeIcon");

  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeIcon.className = "fas fa-moon";
  } else if (savedTheme === "light") {
    body.classList.add("light-theme");
    themeIcon.className = "fas fa-sun";
  } else {
    // Default to light theme
    body.classList.add("light-theme");
    themeIcon.className = "fas fa-sun";
    localStorage.setItem("theme", "light");
  }
}

// Toggle CORS proxy on/off
function toggleCORSProxy() {
  USE_CORS_PROXY = !USE_CORS_PROXY;
  const button = document.getElementById("corsToggle");
  const icon = button.querySelector("i");

  if (USE_CORS_PROXY) {
    button.style.backgroundColor = "rgba(76, 175, 80, 0.3)"; // Green tint
    icon.className = "fas fa-shield-alt";
    button.title = "CORS Proxy: ON (Click to disable)";
    showError(
      `🛡️ CORS Proxy ENABLED. This routes requests through a proxy server to bypass browser restrictions. Try searching now!`
    );
  } else {
    button.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; // Default
    icon.className = "fas fa-shield-alt";
    button.title = "CORS Proxy: OFF (Click to enable if having issues)";
    showError(
      `🚫 CORS Proxy DISABLED. Using direct API calls. If you get "unable to fetch data" errors, click this button again.`
    );
  }
}

// Test API key validity
async function testAPIKey() {
  try {
    console.log("Testing API key...");
    const testUrl = `${API_BASE_URL}/current.json?key=${API_KEY}&q=London&aqi=no`;
    const finalUrl = USE_CORS_PROXY
      ? `${CORS_PROXY}${encodeURIComponent(testUrl)}`
      : testUrl;
    console.log("Testing with URL:", finalUrl);
    const response = await fetch(finalUrl);

    if (response.status === 401 || response.status === 403) {
      const errorText = await response.text();
      console.error("API Authentication Error:", errorText);
      showError(
        `❌ Authentication Failed (${response.status}): Your API key may be invalid or inactive. Check console for details.`
      );
      return false;
    } else if (response.status === 429) {
      showError(
        "⚠️ API quota exceeded. You've reached your monthly limit. Please check your WeatherAPI.com account."
      );
      return false;
    } else if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      showError(`🚨 API Error (${response.status}): ${errorText}`);
      return false;
    }

    console.log("API key is valid");
    return true;
  } catch (error) {
    console.error("API key test error:", error);
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      showError(
        "🚫 CORS Issue! This is NOT an invalid API key. Click the shield button (🛡️) to enable proxy and try again."
      );
    } else {
      showError(`Connection error: ${error.message}`);
    }
    return false;
  }
}

// Initialize with current location weather and load theme
window.addEventListener("load", async () => {
  loadTheme();

  // Test API key first
  const isApiValid = await testAPIKey();

  if (isApiValid) {
    // Try to get current location weather instead of London
    setTimeout(() => getCurrentLocation(), 500);
  } else {
    // Show the API info section if there's an issue
    document.querySelector(".api-info").style.display = "block";
    document.querySelector(".api-info h3").innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> Connection Issue Detected';
    document.querySelector(".api-info p").innerHTML = `
          <strong>Quick Fix:</strong> Click the shield button (🛡️) above to enable CORS proxy, then try again.<br><br>
          <strong>Other solutions:</strong><br>
          • Check your internet connection<br>
          • Verify your API key is valid<br><br>
          <strong>Test your API key:</strong> <a href="https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=London" target="_blank">Click here</a>
        `;
  }
});

// Optimized rain animation for better performance
function createRainAnimation() {
  const rainContainer = document.createElement("div");
  rainContainer.className = "rain-container";
  document.body.appendChild(rainContainer);

  // Reduced number of clouds and drops for better performance
  const numClouds = 2; // Reduced from 3
  const clouds = [];

  for (let cloudIndex = 0; cloudIndex < numClouds; cloudIndex++) {
    const cloud = document.createElement("div");
    cloud.className = "rain-cloud";

    // Position clouds
    cloud.style.left = `${30 + cloudIndex * 40}%`;
    cloud.style.top = `${8 + cloudIndex * 6}%`;

    // Simplified cloud animation
    const duration = 60 + cloudIndex * 20; // Faster: 60s, 80s
    cloud.style.animationDuration = `${duration}s`;
    cloud.style.animationDelay = `${cloudIndex * 15}s`;

    // Reduced cloud puffs
    const puffSizes = [
      { width: 80, height: 80, x: -30, y: 20 },
      { width: 100, height: 100, x: 0, y: -20 },
    ];

    puffSizes.forEach((puff) => {
      const puffElement = document.createElement("div");
      puffElement.className = "cloud-puff";
      puffElement.style.width = `${puff.width}px`;
      puffElement.style.height = `${puff.height}px`;
      puffElement.style.transform = `translate(${puff.x}px, ${puff.y}px)`;
      cloud.appendChild(puffElement);
    });

    // Significantly reduced raindrops
    const dropsPerCloud = 25; // Reduced from 60
    for (let i = 0; i < dropsPerCloud; i++) {
      const drop = document.createElement("div");
      drop.className = "raindrop";

      // Simplified size distribution
      drop.classList.add(Math.random() < 0.5 ? "small" : "medium");

      drop.style.left = `${Math.random() * 100}%`;
      drop.style.top = `${cloud.clientHeight || 120}px`;
      drop.style.animationDuration = `${1.8 + Math.random() * 1}s`; // 1.8-2.8s
      drop.style.animationDelay = `${Math.random() * 3}s`;

      cloud.appendChild(drop);
    }

    clouds.push(cloud);
    rainContainer.appendChild(cloud);
  }

  // Removed the heavy regeneration interval for better performance
  rainContainer.regenerateInterval = null;
}

// Weather Detail Modal Functions
let currentForecastData = null;

function openWeatherModal(dayIndex) {
  if (
    !currentForecastData ||
    !currentForecastData.forecast.forecastday[dayIndex]
  ) {
    console.error("No forecast data available for day index:", dayIndex);
    return;
  }

  const dayData = currentForecastData.forecast.forecastday[dayIndex];
  const modal = document.getElementById("weatherModal");

  // Populate modal with data
  populateModalData(dayData, dayIndex);

  // Show modal with animation
  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("active");
  }, 10); // Small delay for animation

  // Prevent body scroll
  document.body.style.overflow = "hidden";
}

function closeWeatherModal() {
  const modal = document.getElementById("weatherModal");

  // Hide with animation
  modal.classList.remove("active");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scroll
  }, 400); // Wait for animation to complete
}

function populateModalData(dayData, dayIndex) {
  const date = new Date(dayData.date);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Format date
  const formattedDate = date.toLocaleDateString("en-US", options);
  document.getElementById("modalDate").textContent = formattedDate;

  // Weather icon
  const iconClass = getWeatherIconClass(dayData.day.condition.code, 1);
  document.getElementById(
    "modalIcon"
  ).innerHTML = `<i class="${iconClass}"></i>`;

  // Main temperature info
  document.getElementById("modalTemp").textContent = `${Math.round(
    dayData.day.avgtemp_c
  )}°C`;
  document.getElementById("modalCondition").textContent =
    dayData.day.condition.text;
  document.getElementById("modalTempMax").textContent = `${Math.round(
    dayData.day.maxtemp_c
  )}°`;
  document.getElementById("modalTempMin").textContent = `${Math.round(
    dayData.day.mintemp_c
  )}°`;

  // Temperature section
  document.getElementById("modalMaxTemp").textContent = `${Math.round(
    dayData.day.maxtemp_c
  )}°C`;
  document.getElementById("modalMinTemp").textContent = `${Math.round(
    dayData.day.mintemp_c
  )}°C`;
  document.getElementById("modalAvgTemp").textContent = `${Math.round(
    dayData.day.avgtemp_c
  )}°C`;

  // Precipitation section
  document.getElementById(
    "modalRainChance"
  ).textContent = `${dayData.day.daily_chance_of_rain}%`;
  document.getElementById(
    "modalPrecipitation"
  ).textContent = `${dayData.day.totalprecip_mm} mm`;
  document.getElementById("modalSnow").textContent = `${
    dayData.day.totalsnow_cm || 0
  } cm`;

  // Wind & Air section
  document.getElementById("modalWindSpeed").textContent = `${Math.round(
    dayData.day.maxwind_kph
  )} km/h`;
  document.getElementById("modalWindDir").textContent = getWindDirection(
    dayData.day.maxwind_degree || 0
  );
  document.getElementById(
    "modalHumidity"
  ).textContent = `${dayData.day.avghumidity}%`;

  // Sun & Moon section (these might not be available in all API responses)
  document.getElementById("modalSunrise").textContent = dayData.astro
    ? dayData.astro.sunrise || "--:--"
    : "--:--";
  document.getElementById("modalSunset").textContent = dayData.astro
    ? dayData.astro.sunset || "--:--"
    : "--:--";
  document.getElementById("modalMoonrise").textContent = dayData.astro
    ? dayData.astro.moonrise || "--:--"
    : "--:--";
  document.getElementById("modalMoonset").textContent = dayData.astro
    ? dayData.astro.moonset || "--:--"
    : "--:--";
  document.getElementById("modalMoonPhase").textContent = dayData.astro
    ? dayData.astro.moon_phase || "--"
    : "--";

  // Visibility & Comfort section
  document.getElementById("modalVisibility").textContent = `${
    dayData.day.avgvis_km || "--"
  } km`;
  document.getElementById("modalUV").textContent = dayData.day.uv || "--";

  // Air Quality (might not be available for all days)
  const airQualityText = getAirQualityText(
    dayData.day.air_quality?.["us-epa-index"] || null
  );
  document.getElementById("modalAirQuality").textContent = airQualityText;
}

function getWindDirection(degree) {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degree / 22.5) % 16;
  return `${directions[index]} (${degree}°)`;
}

function getAirQualityText(index) {
  if (!index) return "Not Available";
  const qualityLevels = {
    1: "Good",
    2: "Moderate",
    3: "Unhealthy for Sensitive Groups",
    4: "Unhealthy",
    5: "Very Unhealthy",
    6: "Hazardous",
  };
  return qualityLevels[index] || "Unknown";
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  const modal = document.getElementById("weatherModal");
  if (event.target === modal) {
    closeWeatherModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modal = document.getElementById("weatherModal");
    if (modal.classList.contains("active")) {
      closeWeatherModal();
    }
  }
});
