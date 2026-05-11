/* ============================================
   ATMOSPHERE WEATHER APP - FIXED JS
   PROPER TAB SWITCHING + MAP INITIALIZATION
   ============================================ */

const API_KEY = '1e2bec4abb80b8f25eba7c9e5a5d556f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const TILE_URL = 'https://tile.openweathermap.org/map';

// State
let currentUnit = 'C';
let currentWeatherData = null;
let slideInterval;
let progressInterval;
let slideDuration = 5000;
let isPlaying = true;

// Map State
let radarMap = null;
let weatherMap = null;
let currentRadarLayer = null;
let currentMapLayer = null;
let currentBaseLayer = null;
let weatherStationsLayer = null;
let citiesLayer = null;
let radarInitialized = false;
let mapsInitialized = false;

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
    setupNavigation();

    // Ensure only forecast is visible initially
    showSection('forecast');

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

// ============================================
// NAVIGATION (Tab System) - FIXED
// ============================================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;

            // Update nav active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            showSection(targetSection);

            // Initialize maps when navigating to radar/maps
            if (targetSection === 'radar' && !radarInitialized) {
                setTimeout(initRadarMap, 150);
            }
            if (targetSection === 'maps' && !mapsInitialized) {
                setTimeout(initWeatherMap, 150);
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function showSection(sectionId) {
    // Hide ALL sections first
    const allSections = document.querySelectorAll('.page-section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show only the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// ============================================
// RADAR MAP
// ============================================
function initRadarMap() {
    if (radarInitialized) return;

    const mapContainer = document.getElementById('radar-map');
    if (!mapContainer) return;

    // Initialize Leaflet map
    radarMap = L.map('radar-map', {
        center: [20, 0],
        zoom: 3,
        zoomControl: false,
        attributionControl: true
    });

    // Add base layer (dark themed)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(radarMap);

    // Add default weather layer (precipitation)
    addRadarLayer('precipitation');

    // Update timestamp
    updateRadarTimestamp();

    // Setup radar controls
    setupRadarControls();

    // Setup layer toggles
    setupRadarLayerToggles();

    radarInitialized = true;

    // Force map refresh after container becomes visible
    setTimeout(() => {
        radarMap.invalidateSize();
    }, 300);
}

function addRadarLayer(layerType) {
    if (!radarMap) return;

    // Remove existing layer
    if (currentRadarLayer) {
        radarMap.removeLayer(currentRadarLayer);
    }

    const layerMap = {
        'precipitation': 'precipitation_new',
        'clouds': 'clouds_new',
        'rain': 'precipitation_new',
        'snow': 'snow_new',
        'temp': 'temp_new',
        'wind': 'wind_new',
        'pressure': 'pressure_new'
    };

    const owmLayer = layerMap[layerType] || 'precipitation_new';

    currentRadarLayer = L.tileLayer(`${TILE_URL}/${owmLayer}/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>',
        opacity: 0.7,
        maxZoom: 19
    }).addTo(radarMap);

    updateRadarLegend(layerType);
}

function updateRadarLegend(layerType) {
    const legendContent = document.getElementById('radar-legend-content');
    if (!legendContent) return;

    const legends = {
        'precipitation': { gradient: '#4a90d9, #00ff00, #ffff00, #ff0000, #ff00ff', label: 'Light → Heavy Precipitation' },
        'clouds': { gradient: '#ffffff, #cccccc, #999999, #666666, #333333', label: 'Clear → Overcast' },
        'rain': { gradient: '#4a90d9, #00ff00, #ffff00, #ff0000, #ff00ff', label: 'Light → Heavy Rain' },
        'snow': { gradient: '#e0f3f8, #abd9e9, #74add1, #4575b4, #313695', label: 'Light → Heavy Snow' },
        'temp': { gradient: '#313695, #4575b4, #74add1, #fee090, #f46d43, #d73027', label: 'Cold → Hot (°C)' },
        'wind': { gradient: '#e0f3f8, #abd9e9, #74add1, #4575b4, #313695', label: 'Calm → Stormy' },
        'pressure': { gradient: '#d73027, #f46d43, #fee090, #e0f3f8, #74add1, #4575b4', label: 'Low → High Pressure' }
    };

    const legend = legends[layerType] || legends['precipitation'];
    legendContent.innerHTML = `
        <div class="legend-item">
            <span class="legend-color" style="background: linear-gradient(to right, ${legend.gradient})"></span>
            <span class="legend-label">${legend.label}</span>
        </div>
    `;
}

function updateRadarTimestamp() {
    const timestamp = document.getElementById('radar-timestamp');
    if (!timestamp) return;
    const now = new Date();
    timestamp.textContent = `Last updated: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

function setupRadarControls() {
    // Zoom controls
    const zoomIn = document.getElementById('radar-zoom-in');
    const zoomOut = document.getElementById('radar-zoom-out');
    const reset = document.getElementById('radar-reset');

    if (zoomIn) zoomIn.addEventListener('click', () => radarMap && radarMap.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => radarMap && radarMap.zoomOut());
    if (reset) reset.addEventListener('click', () => radarMap && radarMap.setView([20, 0], 3));

    // Search
    const searchBtn = document.getElementById('radar-search-btn');
    const searchInput = document.getElementById('radar-location-input');

    if (searchBtn) searchBtn.addEventListener('click', searchRadarLocation);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchRadarLocation();
    });

    // Geolocation
    const geoBtn = document.getElementById('radar-geo-btn');
    if (geoBtn) {
        geoBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    if (radarMap) {
                        radarMap.setView([pos.coords.latitude, pos.coords.longitude], 8);
                    }
                });
            }
        });
    }
}

function setupRadarLayerToggles() {
    const layerBtns = document.querySelectorAll('.layer-btn');
    layerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            layerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            addRadarLayer(btn.dataset.layer);
        });
    });
}

async function searchRadarLocation() {
    const input = document.getElementById('radar-location-input');
    if (!input) return;
    const city = input.value.trim();
    if (!city) return;

    try {
        const response = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (data.coord && radarMap) {
            radarMap.setView([data.coord.lat, data.coord.lon], 8);
        }
    } catch (error) {
        console.error('Location search failed:', error);
    }
}

// ============================================
// WEATHER MAPS
// ============================================
function initWeatherMap() {
    if (mapsInitialized) return;

    const mapContainer = document.getElementById('weather-map');
    if (!mapContainer) return;

    // Initialize Leaflet map
    weatherMap = L.map('weather-map', {
        center: [20, 0],
        zoom: 3,
        zoomControl: false,
        attributionControl: true
    });

    // Add default base layer
    addBaseLayer('osm');

    // Add default weather overlay
    addMapWeatherLayer('temp');

    // Setup map controls
    setupMapControls();

    // Setup tabs
    setupMapTabs();

    mapsInitialized = true;

    // Force map refresh after container becomes visible
    setTimeout(() => {
        weatherMap.invalidateSize();
    }, 300);
}

function addBaseLayer(type) {
    if (!weatherMap) return;

    if (currentBaseLayer) {
        weatherMap.removeLayer(currentBaseLayer);
    }

    const layers = {
        'osm': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }),
        'dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }),
        'terrain': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
            maxZoom: 17
        }),
        'satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 18
        })
    };

    currentBaseLayer = layers[type] || layers['osm'];
    currentBaseLayer.addTo(weatherMap);

    // Re-add weather layer on top
    if (currentMapLayer) {
        currentMapLayer.bringToFront();
    }
}

function addMapWeatherLayer(type) {
    if (!weatherMap) return;

    if (currentMapLayer) {
        weatherMap.removeLayer(currentMapLayer);
    }

    const layerMap = {
        'conditions': 'temp_new',
        'precipitation': 'precipitation_new',
        'wind': 'wind_new',
        'satellite': 'clouds_new'
    };

    const owmLayer = layerMap[type] || 'temp_new';
    const opacitySlider = document.getElementById('overlay-opacity');
    const opacity = opacitySlider ? opacitySlider.value / 100 : 0.6;

    currentMapLayer = L.tileLayer(`${TILE_URL}/${owmLayer}/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>',
        opacity: opacity,
        maxZoom: 19
    }).addTo(weatherMap);
}

function setupMapControls() {
    // Base map selector
    const baseSelect = document.getElementById('base-map-select');
    if (baseSelect) {
        baseSelect.addEventListener('change', (e) => {
            addBaseLayer(e.target.value);
        });
    }

    // Opacity slider
    const opacitySlider = document.getElementById('overlay-opacity');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const rangeValue = e.target.nextElementSibling;
            if (rangeValue) rangeValue.textContent = value + '%';
            if (currentMapLayer) {
                currentMapLayer.setOpacity(value / 100);
            }
        });
    }

    // Show cities toggle
    const citiesToggle = document.getElementById('show-cities');
    if (citiesToggle) {
        citiesToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                addCitiesLayer();
            } else if (citiesLayer) {
                weatherMap.removeLayer(citiesLayer);
                citiesLayer = null;
            }
        });
    }

    // Show stations toggle
    const stationsToggle = document.getElementById('show-stations');
    if (stationsToggle) {
        stationsToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                addStationsLayer();
            } else if (weatherStationsLayer) {
                weatherMap.removeLayer(weatherStationsLayer);
                weatherStationsLayer = null;
            }
        });
    }

    // Search
    const searchBtn = document.getElementById('maps-search-btn');
    const searchInput = document.getElementById('maps-location-input');

    if (searchBtn) searchBtn.addEventListener('click', searchMapLocation);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMapLocation();
    });
}

function setupMapTabs() {
    const tabs = document.querySelectorAll('.maps-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            addMapWeatherLayer(tab.dataset.mapTab);
        });
    });
}

function addCitiesLayer() {
    if (!weatherMap) return;

    const cities = [
        { name: 'London', lat: 51.5074, lon: -0.1278, temp: 12 },
        { name: 'New York', lat: 40.7128, lon: -74.0060, temp: 18 },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, temp: 22 },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093, temp: 25 },
        { name: 'Paris', lat: 48.8566, lon: 2.3522, temp: 14 },
        { name: 'Dubai', lat: 25.2048, lon: 55.2708, temp: 35 },
        { name: 'Singapore', lat: 1.3521, lon: 103.8198, temp: 30 },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777, temp: 32 },
        { name: 'Cairo', lat: 30.0444, lon: 31.2357, temp: 28 },
        { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, temp: 26 },
        { name: 'Lagos', lat: 6.5244, lon: 3.3792, temp: 29 },
        { name: 'Moscow', lat: 55.7558, lon: 37.6173, temp: 5 }
    ];

    if (citiesLayer) {
        weatherMap.removeLayer(citiesLayer);
    }

    citiesLayer = L.layerGroup();

    cities.forEach(city => {
        const color = getTempColor(city.temp);
        const marker = L.circleMarker([city.lat, city.lon], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`
            <div style="font-family: Inter, sans-serif; padding: 4px;">
                <strong style="font-size: 1rem;">${city.name}</strong><br>
                <span style="color: ${color}; font-weight: 700; font-size: 1.1rem;">${city.temp}°C</span>
            </div>
        `);
        citiesLayer.addLayer(marker);
    });

    citiesLayer.addTo(weatherMap);
}

function addStationsLayer() {
    if (!weatherMap) return;

    const stations = [
        { name: 'Station A', lat: 40.0, lon: -100.0 },
        { name: 'Station B', lat: 35.0, lon: -95.0 },
        { name: 'Station C', lat: 45.0, lon: -90.0 },
        { name: 'Station D', lat: 30.0, lon: -85.0 },
        { name: 'Station E', lat: 50.0, lon: -110.0 }
    ];

    if (weatherStationsLayer) {
        weatherMap.removeLayer(weatherStationsLayer);
    }

    weatherStationsLayer = L.layerGroup();

    stations.forEach(station => {
        const icon = L.divIcon({
            className: 'weather-station-icon',
            html: '<i class="fas fa-tower-broadcast" style="color: #10b981; font-size: 14px;"></i>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([station.lat, station.lon], { icon })
            .bindPopup(`<strong>${station.name}</strong><br>Weather Station`);
        weatherStationsLayer.addLayer(marker);
    });

    weatherStationsLayer.addTo(weatherMap);
}

function getTempColor(temp) {
    if (temp <= -10) return '#313695';
    if (temp <= 0) return '#4575b4';
    if (temp <= 10) return '#74add1';
    if (temp <= 20) return '#abd9e9';
    if (temp <= 25) return '#e0f3f8';
    if (temp <= 30) return '#fee090';
    if (temp <= 35) return '#fdae61';
    if (temp <= 40) return '#f46d43';
    return '#d73027';
}

async function searchMapLocation() {
    const input = document.getElementById('maps-location-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    // Try to parse as coordinates
    const coords = query.split(',').map(c => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        if (weatherMap) weatherMap.setView([coords[0], coords[1]], 8);
        return;
    }

    // Search by city name
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (data.coord && weatherMap) {
            weatherMap.setView([data.coord.lat, data.coord.lon], 8);
        }
    } catch (error) {
        console.error('Map location search failed:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    locationForm.addEventListener('submit', handleSubmit);
    unitToggle.addEventListener('click', toggleUnit);
    themeToggle.addEventListener('click', toggleTheme);
    geoBtn.addEventListener('click', getGeoLocation);

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

// ============================================
// THEME MANAGEMENT
// ============================================
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

// ============================================
// UNIT TOGGLE
// ============================================
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

// ============================================
// GEOLOCATION
// ============================================
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

// ============================================
// API FUNCTIONS
// ============================================
async function getWeather(city) {
    try {
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

// ============================================
// FORM HANDLER
// ============================================
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

// ============================================
// DISPLAY FUNCTIONS
// ============================================
function displayWeather(data) {
    const current = data.current;

    document.getElementById('city-name').textContent = current.name + (current.sys.country ? `, ${current.sys.country}` : '');
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const weatherMain = current.weather[0].main;
    document.getElementById('weather-badge').textContent = weatherMain;

    const mainIcon = document.getElementById('main-icon');
    mainIcon.className = getWeatherIconClass(current.weather[0].description, current.weather[0].icon);

    document.getElementById('temperature').textContent = convertTemp(current.main.temp);
    document.querySelector('.temp-unit').textContent = '°' + currentUnit;

    document.getElementById('weather-desc').textContent = current.weather[0].description;

    document.getElementById('temp-min').textContent = convertTemp(current.main.temp_min);
    document.getElementById('temp-max').textContent = convertTemp(current.main.temp_max);

    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
    document.getElementById('wind-dir').textContent = getWindDirection(current.wind.deg);
    document.getElementById('pressure').textContent = `${current.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    document.getElementById('clouds').textContent = `${current.clouds.all}%`;

    const sunrise = new Date(current.sys.sunrise * 1000);
    const sunset = new Date(current.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = formatTime(sunrise);
    document.getElementById('sunset').textContent = formatTime(sunset);
}

function displayForecast(forecastData) {
    const hourlyContainer = document.getElementById('hourly-forecast');
    const dailyContainer = document.getElementById('daily-forecast');

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

// ============================================
// HELPER FUNCTIONS
// ============================================
function getWeatherIconClass(description, iconCode) {
    const desc = description.toLowerCase();
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

// ============================================
// UI STATE MANAGEMENT
// ============================================
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

if (slideshowContainer) {
    slideshowContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slideshowContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

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