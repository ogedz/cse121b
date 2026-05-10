const apiKey = '1e2bec4abb80b8f25eba7c9e5a5d556f';
const geoApiKey = '1203eb5d00b2466bb89befc93b06922f';

// Function to get weather for a random city
async function getWeatherByRandomCity() {
    try {
        const randomCity = await getRandomCity();
        const weatherData = await getWeather(randomCity.name);
        displayWeather(weatherData, 'random-city-weather');
    } catch (error) {
        console.error('Error fetching random city weather data:', error);
    }
}

// Function to get weather by city name
async function getWeather(cityName) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Function to get random city
async function getRandomCity() {
    const apiUrl = `https://app.ipgeolocation.io/getip?apiKey=${geoApiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return { name: data.city };
    } catch (error) {
        console.error('Error fetching random city data:', error);
        throw error;
    }
}

// Display weather information
function displayWeather(weatherData, containerId) {
    if (!weatherData) {
        alert('Weather data not available. Please try again.');
        return;
    }
    const weatherContainer = document.getElementById(containerId);
    weatherContainer.innerHTML = `
        <h2>Weather Forecast</h2>
        <p><strong>Location:</strong> ${weatherData.name}</p>
        <p><strong>Temperature:</strong> ${weatherData.main.temp}°C</p>
        <p><strong>Description:</strong> ${weatherData.weather[0].description}</p>
    `;
}

// Automatically display weather for user location and a random city when the page loads
window.addEventListener('load', async () => {
    await getUserLocationWeather();
    await getWeatherByRandomCity();
});

// Function to get user's location weather
async function getUserLocationWeather() {
    try {
        const userLocation = await getUserLocation();
        const weatherData = await getWeather(userLocation.city);
        displayWeather(weatherData, 'user-location-weather');
    } catch (error) {
        console.error('Error fetching user location weather:', error);
    }
}

// Function to get user's location
async function getUserLocation() {
    const apiUrl = `https://app.ipgeolocation.io/getip?apiKey=${geoApiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return { city: data.city };
    } catch (error) {
        console.error('Error fetching user location:', error);
        throw error;
    }
}

// Function to handle form submission and display weather information based on user input
async function handleSubmit(event) {
    event.preventDefault();

    const cityInput = document.getElementById('location');
    const city = cityInput.value.trim();
    const dateInput = document.getElementById('date');
    const date = dateInput.value;

    if (city === '') {
        alert('Please enter a city name.');
        return;
    }

    try {
        const weatherData = await getWeather(city);
        displayWeather(weatherData, 'user-selected-weather');
    } catch (error) {
        console.error('Error fetching user-selected city weather data:', error);
    }
}

// Event listener for form submission
const form = document.getElementById('locationForm');
form.addEventListener('submit', handleSubmit);

// JavaScript forslideshow
let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    const slides = document.getElementsByClassName("slide");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    slides[slideIndex-1].style.display = "block";  
    setTimeout(showSlides, 5000); 
}