const apiKey = '1e2bec4abb80b8f25eba7c9e5a5d556f'; 

async function getWeather(city, date) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

function displayWeather(weatherData) {
    if (!weatherData) {
        alert('Weather data not available. Please try again.');
        return;
    }
    
    const weatherInfo = document.getElementById('weather-info');
    const weatherDescription = weatherData.weather[0].description;
    let weatherIconClass = '';

    // weather icon based on the weather description
    if (weatherDescription.includes('cloud')) {
        weatherIconClass = 'fas fa-cloud';
    } else if (weatherDescription.includes('rain') || weatherDescription.includes('drizzle')) {
        weatherIconClass = 'fas fa-cloud-rain';
    } else if (weatherDescription.includes('thunderstorm')) {
        weatherIconClass = 'fas fa-bolt';
    } else if (weatherDescription.includes('snow')) {
        weatherIconClass = 'fas fa-snowflake';
    } else if (weatherDescription.includes('sun') || weatherDescription.includes('clear')) {
        weatherIconClass = 'fas fa-sun';
    } else if (weatherDescription.includes('haze') || weatherDescription.includes('mist') || weatherDescription.includes('fog')) {
        weatherIconClass = 'fas fa-smog';
    } else {
        weatherIconClass = 'fas fa-question-circle'; // Default icon
    }

    weatherInfo.innerHTML = `
        <h2>Weather Forecast</h2>
        <p><strong>Location:</strong> ${weatherData.name}</p>
        <p><strong>Temperature:</strong> ${weatherData.main.temp}°C</p>
        <p><strong>Description:</strong> ${weatherData.weather[0].description}</p>
        <i class="${weatherIconClass}"></i> <!-- Weather icon -->
    `;
}

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
    
    const weatherData = await getWeather(city, date);
    displayWeather(weatherData);
}

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
