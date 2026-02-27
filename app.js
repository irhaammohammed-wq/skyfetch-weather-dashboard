// ===============================
// SkyFetch Weather Dashboard - Part 3
// OOP Version with 5-Day Forecast
// ===============================

// Constructor Function
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.currentUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";
}

// -------------------------------
// Get Current Weather
// -------------------------------
WeatherApp.prototype.getCurrentWeather = function(city) {
    const url = `${this.currentUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    return axios.get(url).then(res => res.data);
};

// -------------------------------
// Get 5-Day Forecast
// -------------------------------
WeatherApp.prototype.getForecast = function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    return axios.get(url).then(res => res.data);
};

// -------------------------------
// Fetch Both APIs Together
// -------------------------------
WeatherApp.prototype.getWeatherData = function(city) {
    return Promise.all([
        this.getCurrentWeather(city),
        this.getForecast(city)
    ]);
};

// -------------------------------
// Display Current Weather
// -------------------------------
WeatherApp.prototype.displayCurrentWeather = function(data) {
    const container = document.getElementById("weather-display");

    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    container.innerHTML = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <img src="${iconUrl}" alt="${description}">
            <div>${temperature}°C</div>
            <p>${description}</p>
        </div>
    `;
};

// -------------------------------
// Display 5-Day Forecast
// -------------------------------
WeatherApp.prototype.displayForecast = function(data) {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    // Pick one forecast per day (12:00 PM)
    const dailyData = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyData.forEach(day => {
        const date = new Date(day.dt_txt).toDateString();
        const temp = Math.round(day.main.temp);
        const desc = day.weather[0].description;
        const icon = day.weather[0].icon;

        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <h4>${date}</h4>
            <img src="${iconUrl}">
            <p>${temp}°C</p>
            <p>${desc}</p>
        `;

        forecastContainer.appendChild(card);
    });
};

// -------------------------------
// Main Search Function
// -------------------------------
WeatherApp.prototype.searchCity = function(city) {
    this.getWeatherData(city)
        .then(([current, forecast]) => {
            this.displayCurrentWeather(current);
            this.displayForecast(forecast);
        })
        .catch(err => {
            console.error(err);
            document.getElementById("weather-display").innerHTML =
                "<p>Could not fetch weather data.</p>";
        });
};

// ===============================
// Initialize App
// ===============================
const app = new WeatherApp("f7e0a11013cb09f1b7b545091944e80d
");

// Search Button Click
document.getElementById("search-btn").addEventListener("click", function () {
    const city = document.getElementById("city-input").value;
    app.searchCity(city);
});

// Default City on Load
app.searchCity("London");
