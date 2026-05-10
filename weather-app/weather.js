/* ============================================
   ATMOSPHERE WEATHER APP - ADVANCED JS
   ============================================ */

const API_KEY = '1e2bec4abb80b8f25eba7c9e5a5d556f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// State
let currentUnit = 'C';
let currentWeatherData = null;
let slideInterval;
let progressInterval;
let slideDuration = 5000;
let isPlaying = true;

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const locationForm = document.getElementById('locationForm');
const searchError = document.getElementById('search-error');
const weatherDashboard = document.getElementById('weather-dashboard');
const emptyState = document.getElementById('empty-state');
const unitToggle = document.getElementById('unit-toggle');
const themeToggle = document.getElementById('theme-toggle');
const geoBtn = document.getElementById('geo-btn');

// Initialize
function init() {
    setupEventListeners();
    setupSlideshow();
    setupTheme();
    setDefaultDate();

    // Hide loading screen after initial load
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1000);
}

function setDefaultDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
}

// Event Listeners
function setupEventListeners() {
    locationForm.addEventListener('submit', handleSubmit);
    unitToggle.addEventListener('click', toggleUnit);
    themeToggle.addEventListener('click', toggleTheme);
    geoBtn.addEventListener('click', getGeoLocation);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            stopSlideshow();
        }
        if (e.key === ' ') {
            e.preventDefault();
            toggleSlideshow();
        }
    });
}

// Theme Management
function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Unit Toggle
function toggleUnit() {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    document.querySelector('.unit-c').classList.toggle('active');
    document.querySelector('.unit-f').classList.toggle('active');

    if (currentWeatherData) {
        displayWeather(currentWeatherData);
    }
}

function convertTemp(celsius) {
    if (currentUnit === 'F') {
        return Math.round((celsius * 9 / 5) + 32);
    }
    return Math.round(celsius);
}

function getUnit() {
    return currentUnit === 'C' ? '°C' : '°F';
}

// Geolocation
function getGeoLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    geoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                const data = await response.json();
                document.getElementById('location').value = data.name;
                geoBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            } catch (error) {
                showError('Could not get location name');
                geoBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            }
        },
        (error) => {
            showError('Unable to retrieve your location');
            geoBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
        }
    );
}

// API Functions
async function getWeather(city) {
    try {
        // Get current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            }
            throw new Error('Failed to fetch weather data');
        }

        const currentData = await currentResponse.json();

        // Get forecast data
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();

        return { current: currentData, forecast: forecastData };
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
}

// Form Handler
async function handleSubmit(event) {
    event.preventDefault();

    const cityInput = document.getElementById('location');
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading(true);
    hideError();

    try {
        const data = await getWeather(city);
        currentWeatherData = data;
        displayWeather(data);
        displayForecast(data.forecast);
        showDashboard();
    } catch (error) {
        showError(error.message);
        hideDashboard();
    } finally {
        showLoading(false);
    }
}

// Display Functions
function displayWeather(data) {
    const current = data.current;

    // Location info
    document.getElementById('city-name').textContent = current.name + (current.sys.country ? `, ${current.sys.country}` : '');
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Weather badge
    const weatherMain = current.weather[0].main;
    document.getElementById('weather-badge').textContent = weatherMain;

    // Main icon
    const mainIcon = document.getElementById('main-icon');
    mainIcon.className = getWeatherIconClass(current.weather[0].description, current.weather[0].icon);

    // Temperature
    document.getElementById('temperature').textContent = convertTemp(current.main.temp);
    document.querySelector('.temp-unit').textContent = '°' + currentUnit;

    // Description
    document.getElementById('weather-desc').textContent = current.weather[0].description;

    // Temp range
    document.getElementById('temp-min').textContent = convertTemp(current.main.temp_min);
    document.getElementById('temp-max').textContent = convertTemp(current.main.temp_max);

    // Details
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
    document.getElementById('wind-dir').textContent = getWindDirection(current.wind.deg);
    document.getElementById('pressure').textContent = `${current.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    document.getElementById('clouds').textContent = `${current.clouds.all}%`;

    // Astro
    const sunrise = new Date(current.sys.sunrise * 1000);
    const sunset = new Date(current.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = formatTime(sunrise);
    document.getElementById('sunset').textContent = formatTime(sunset);
}

function displayForecast(forecastData) {
    const hourlyContainer = document.getElementById('hourly-forecast');
    const dailyContainer = document.getElementById('daily-forecast');

    // Process hourly data (next 24 hours)
    const hourlyItems = forecastData.list.slice(0, 8);
    hourlyContainer.innerHTML = hourlyItems.map(item => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;

        return `
            <div class="hourly-item">
                <div class="hourly-time">${displayHour} ${ampm}</div>
                <div class="hourly-icon">
                    <i class="${getWeatherIconClass(item.weather[0].description, item.weather[0].icon)}"></i>
                </div>
                <div class="hourly-temp">${convertTemp(item.main.temp)}°</div>
            </div>
        `;
    }).join('');

    // Process daily data (aggregate by day)
    const dailyMap = new Map();
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split('T')[0];

        if (!dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, {
                date: date,
                temps: [],
                weather: item.weather[0],
                icon: item.weather[0].icon
            });
        }
        dailyMap.get(dayKey).temps.push(item.main.temp);
    });

    const dailyItems = Array.from(dailyMap.values()).slice(0, 5);
    dailyContainer.innerHTML = dailyItems.map(day => {
        const minTemp = Math.min(...day.temps);
        const maxTemp = Math.max(...day.temps);
        const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return `
            <div class="daily-item">
                <div class="daily-day">${dayName}</div>
                <div class="daily-date">${dateStr}</div>
                <div class="daily-icon">
                    <i class="${getWeatherIconClass(day.weather.description, day.icon)}"></i>
                </div>
                <div class="daily-desc">${day.weather.description}</div>
                <div class="daily-temps">
                    <span class="daily-high">${convertTemp(maxTemp)}°</span>
                    <span class="daily-low">${convertTemp(minTemp)}°</span>
                </div>
            </div>
        `;
    }).join('');
}

// Helper Functions
function getWeatherIconClass(description, iconCode) {
    const desc = description.toLowerCase();

    // Use icon code for more accurate day/night detection
    const isNight = iconCode && iconCode.endsWith('n');

    if (desc.includes('thunder') || desc.includes('storm')) return 'fas fa-bolt';
    if (desc.includes('drizzle')) return 'fas fa-cloud-rain';
    if (desc.includes('rain')) return isNight ? 'fas fa-cloud-moon-rain' : 'fas fa-cloud-sun-rain';
    if (desc.includes('snow') || desc.includes('sleet')) return 'fas fa-snowflake';
    if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze')) return 'fas fa-smog';
    if (desc.includes('clear')) return isNight ? 'fas fa-moon' : 'fas fa-sun';
    if (desc.includes('few clouds')) return isNight ? 'fas fa-cloud-moon' : 'fas fa-cloud-sun';
    if (desc.includes('scattered clouds')) return 'fas fa-cloud';
    if (desc.includes('cloud')) return 'fas fa-cloud';

    return 'fas fa-cloud';
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// UI State Management
function showDashboard() {
    emptyState.classList.add('hidden');
    weatherDashboard.classList.remove('hidden');
}

function hideDashboard() {
    weatherDashboard.classList.add('hidden');
    emptyState.classList.remove('hidden');
}

function showLoading(show) {
    if (show) {
        loadingScreen.classList.remove('hidden');
    } else {
        loadingScreen.classList.add('hidden');
    }
}

function showError(message) {
    searchError.querySelector('span').textContent = message;
    searchError.classList.remove('hidden');
    setTimeout(() => {
        searchError.classList.add('hidden');
    }, 5000);
}

function hideError() {
    searchError.classList.add('hidden');
}

// ============================================
// SLIDESHOW
// ============================================
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const progressBar = document.getElementById('progress-bar');

function setupSlideshow() {
    startSlideshow();
}

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    slideIndex = index;
    resetProgress();
}

function changeSlide(direction) {
    let newIndex = slideIndex + direction;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    showSlide(newIndex);
    if (isPlaying) {
        stopSlideshow();
        startSlideshow();
    }
}

function goToSlide(index) {
    showSlide(index);
    if (isPlaying) {
        stopSlideshow();
        startSlideshow();
    }
}

function startSlideshow() {
    isPlaying = true;
    stopSlideshow();

    slideInterval = setInterval(() => {
        changeSlide(1);
    }, slideDuration);

    startProgress();
}

function stopSlideshow() {
    isPlaying = false;
    clearInterval(slideInterval);
    clearInterval(progressInterval);
    progressBar.style.width = '0%';
}

function toggleSlideshow() {
    if (isPlaying) {
        stopSlideshow();
    } else {
        startSlideshow();
    }
}

function startProgress() {
    let progress = 0;
    const increment = 100 / (slideDuration / 50);

    progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 0;
        }
        progressBar.style.width = progress + '%';
    }, 50);
}

function resetProgress() {
    progressBar.style.width = '0%';
    if (isPlaying) {
        clearInterval(progressInterval);
        startProgress();
    }
}

// Touch support for slideshow
let touchStartX = 0;
let touchEndX = 0;

const slideshowContainer = document.querySelector('.slideshow-container');

slideshowContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

slideshowContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            changeSlide(1);
        } else {
            changeSlide(-1);
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);