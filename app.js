// ===============================
// SkyFetch Weather Dashboard - Part 4
// OOP + Forecast + localStorage
// ===============================

// Constructor
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.currentUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.recentSearches = JSON.parse(localStorage.getItem("recentCities")) || [];
}

// -------------------------------
// API CALLS
// -------------------------------
WeatherApp.prototype.getCurrentWeather = function(city) {
    const url = `${this.currentUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    return axios.get(url).then(res => res.data);
};

WeatherApp.prototype.getForecast = function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    return axios.get(url).then(res => res.data);
};

WeatherApp.prototype.getWeatherData = function(city) {
    return Promise.all([
        this.getCurrentWeather(city),
        this.getForecast(city)
    ]);
};

// -------------------------------
// DISPLAY CURRENT WEATHER
// -------------------------------
WeatherApp.prototype.displayCurrentWeather = function(data) {
    const container = document.getElementById("weather-display");

    const cityName = data.name;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;

    container.innerHTML = `
        <h2>${cityName}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
        <p>${temp}°C</p>
        <p>${desc}</p>
    `;
};

// -------------------------------
// DISPLAY FORECAST
// -------------------------------
WeatherApp.prototype.displayForecast = function(data) {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    const daily = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    daily.forEach(day => {
        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <h4>${new Date(day.dt_txt).toDateString()}</h4>
            <p>${Math.round(day.main.temp)}°C</p>
            <p>${day.weather[0].description}</p>
        `;

        forecastContainer.appendChild(card);
    });
};

// -------------------------------
// SAVE SEARCHES
// -------------------------------
WeatherApp.prototype.saveSearch = function(city) {

    // Remove duplicate
    this.recentSearches = this.recentSearches.filter(c => c !== city);

    // Add to start
    this.recentSearches.unshift(city);

    // Limit to 5
    this.recentSearches = this.recentSearches.slice(0, 5);

    localStorage.setItem("recentCities", JSON.stringify(this.recentSearches));
    localStorage.setItem("lastCity", city);

    this.displayRecentSearches();
};

// -------------------------------
// DISPLAY RECENT SEARCH BUTTONS
// -------------------------------
WeatherApp.prototype.displayRecentSearches = function() {
    const container = document.getElementById("recent-searches");
    container.innerHTML = "";

    this.recentSearches.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;

        btn.addEventListener("click", () => {
            this.searchCity(city);
        });

        container.appendChild(btn);
    });
};

// -------------------------------
// SEARCH CITY (MAIN)
// -------------------------------
WeatherApp.prototype.searchCity = function(city) {
    this.getWeatherData(city)
        .then(([current, forecast]) => {
            this.displayCurrentWeather(current);
            this.displayForecast(forecast);
            this.saveSearch(city);
        })
        .catch(err => console.error(err));
};

// ===============================
// INIT APP
// ===============================
const app = new WeatherApp("f7e0a11013cb09f1b7b545091944e80d");

// Search button
document.getElementById("search-btn").addEventListener("click", () => {
    const city = document.getElementById("city-input").value;
    app.searchCity(city);
});

// -------------------------------
// AUTO LOAD LAST CITY ON REFRESH
// -------------------------------
window.addEventListener("load", () => {

    app.displayRecentSearches();

    const lastCity = localStorage.getItem("lastCity");

    if (lastCity) {
        app.searchCity(lastCity);
    } else {
        app.searchCity("London");
    }
});
