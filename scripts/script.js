// Variables
//const searchEl = document.getElementById("search-box");
//const buttonEl = document.getElementById("search-btn");
const botonInstalacion = document.getElementById('install-btn');
const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const currentWeatherItemsEl = document.getElementById("current-weather-items");
const timezoneEl = document.getElementById("time-zone");
const countryEl = document.getElementById("country");
const weatherForecastEl = document.getElementById("weather-forecast");
const currentTempEl = document.getElementById("current-temp");


// Días y meses
const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// API Key
const API_KEY = "4d4211a7206df1505bb64b08d835c07e";

//searchEl.addEventListener("keypress",function(event){
//    if (event.key === "Enter") {
//        event.preventDefault();
//       // Trigger the button element with a click
//        buttonEl.click();
//    }
//})

//buttonEl.addEventListener("click", function(){
//    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchEl.value}&appid=4d4211a7206df1505bb64b08d835c07e`)
//        .then(res => res.json())
//        .then(data => {
//            console.log(data);
//            fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${data[0].lat}&lon=${data[0].lon}&units=metric&appid=${API_KEY}`, showCityData, showWeatherData);
//            fetchWeatherData(`https://api.openweathermap.org/data/2.5/forecast?lat=${data[0].lat}&lon=${data[0].lon}&units=metric&appid=${API_KEY}`, showForecastData);
//        })
//    
//    .catch(err => alert("Ciudad equivocada"));
//})

// Función para obtener datos meteorológicos
function getWeatherData() {
    navigator.geolocation.getCurrentPosition((success) => {
        const { latitude, longitude } = success.coords;

        // Obtener datos del clima actual
        fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`, showCityData, showWeatherData);

        // Obtener datos del pronóstico del tiempo
        fetchWeatherData(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`, showForecastData);
    }, (error) => console.log("Sin acceso a la ubicación."));
}

// Función para mostrar datos de la ciudad
function showCityData(data) {
    const city = data.name;
    const country = data.sys.country;
    timezoneEl.innerHTML = `${city}`;
    countryEl.innerHTML = `${country}`;
}

// Función para mostrar datos del clima actual
function showWeatherData(data) {
    const { humidity, temp, pressure, feels_like } = data.main;
    const wind_speed = data.wind.speed;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    const timezone = data.timezone;
    const unixTimeStamp = data.dt;
    const icon = data.weather[0].icon;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humedad</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Presión</div>
            <div>${pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Viento</div>
            <div>${Math.round(wind_speed * 3.6)} km/h</div>
        </div>
        <div class="weather-item">
            <div>Salida del Sol</div>
            <div>${convertTimeStampToTime(sunrise, timezone)}</div>
        </div>
        <div class="weather-item">
            <div>Puesta del Sol</div>
            <div>${convertTimeStampToTime(sunset, timezone)}</div>
        </div>`;

    currentTempEl.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${convertTimeStampToDay(unixTimeStamp, timezone)}</div>
            <div class="temp">${Math.round(temp)}&#176;C</div>
            <div class="temp">ST ${Math.round(feels_like)}&#176;C</div>
        </div>`;
}

// Función para mostrar datos del pronóstico del tiempo
function showForecastData(data) {
    let otherDayForecast = "";
    const timezone = data.city.timezone;
    const time = new Date();
    const today = time.getDay();
    let tempsPerDay = initDayObject();
    let iconsPerDay = initDayObject();

    data.list.forEach((element) => {
        const day = convertTimeStampToDay(element.dt, timezone);
        if (day !== days[today]) {
            tempsPerDay[day.toLowerCase()].push(Math.round(element.main.temp));
        }
    });

    data.list.forEach((element) => {
        const day = convertTimeStampToDay(element.dt, timezone);
        const hour = convertTimeStampToHours(element.dt, timezone);
        if (day !== days[today] && hour === "12") {
            iconsPerDay[day.toLowerCase()].push(element.weather[0].icon);
        }
    });

    tempsPerDay = reorderPerToday(tempsPerDay);
    iconsPerDay = reorderPerToday(iconsPerDay);

    for (const day in tempsPerDay) {
        if (tempsPerDay[day].length !== 0 && iconsPerDay[day].length !== 0) {
            otherDayForecast += `
                <div class="weather-forecast-item">
                    <div class="day">${toTitleCase(day)}</div>
                    <img src="https://openweathermap.org/img/wn/${iconsPerDay[day]}@2x.png" alt="weather icon" class="w-icon">
                    <div class="temp">Máx - ${Math.max.apply(null, tempsPerDay[day])}&#176;C</div>
                    <div class="temp">Mín - ${Math.min.apply(null, tempsPerDay[day])}&#176;C</div>
                </div>`;
        }
    }

    weatherForecastEl.innerHTML = otherDayForecast;
}

// Función para inicializar un objeto para los días
function initDayObject() {
    return {
        "lunes": [],
        "martes": [],
        "miércoles": [],
        "jueves": [],
        "viernes": [],
        "sábado": [],
        "domingo": [],
    };
}

// Función para reordenar datos según el día actual
function reorderPerToday(tempsPerDay) {
    const daysOfWeek = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const today = new Date().getDay();
    const currentDayIndex = today;

    const reorderedTempsPerDay = {};
    for (let i = 0; i < daysOfWeek.length; i++) {
        const dayIndex = (currentDayIndex + i) % daysOfWeek.length;
        const dayName = daysOfWeek[dayIndex];
        reorderedTempsPerDay[dayName] = tempsPerDay[dayName];
    }

    return reorderedTempsPerDay;
}

// Función para convertir un timestamp a un día de la semana
function convertTimeStampToDay(unixTimeStamp, timezone) {
    const dateObj = new Date((unixTimeStamp + timezone) * 1000);
    const day = dateObj.getUTCDay();
    return days[day];
}

// Función para convertir un timestamp a horas
function convertTimeStampToHours(unixTimeStamp, timezone) {
    const dateObj = new Date((unixTimeStamp + timezone) * 1000);
    const hours = dateObj.getUTCHours();
    return hours.toString().padStart(2, '0');
}

// Función para convertir un timestamp a una hora formateada
function convertTimeStampToTime(unixTimeStamp, timezone) {
    const dateObj = new Date((unixTimeStamp + timezone) * 1000);
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const hoursIn12HrFormat = hours >= 13 ? hours % 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hoursIn12HrFormat.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Función para convertir un string a formato de título
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

// Función para obtener datos del clima
function fetchWeatherData(url, callback, callback2) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            callback(data);
            if (callback2) {
                callback2(data);
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

// Ejecutar la función principal
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hours = time.getHours();
    const hoursIn12HrFormat = hours >= 13 ? hours % 12 : hours;
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    timeEl.innerHTML = `${hoursIn12HrFormat.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} <span id="am-pm">${ampm}</span>`;

    dateEl.innerHTML = `${days[day]}, ${date} de ${months[month].toLowerCase()}`;
}, 1000);

window.addEventListener('beforeinstallprompt', (event) => {
    // Previene que el navegador muestre el mensaje predeterminado de instalación
    event.preventDefault();

    // Guarda el evento para usarlo más adelante
    window.deferredPrompt = event;

    // Muestra tu propio botón o banner de instalación
    botonInstalacion.hidden = false;
    mostrarBotonInstalacion();
});
  
function mostrarBotonInstalacion() {
// Muestra tu propio botón o banner de instalación

    if (botonInstalacion) {
        botonInstalacion.addEventListener('click', () => {
            // Muestra el mensaje de instalación cuando el botón es clicado
            const deferredPrompt = window.deferredPrompt;
            if (deferredPrompt) {
                deferredPrompt.prompt();
                botonInstalacion.disabled = true;
                // Espera a que el usuario responda
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Usuario aceptó la instalación');
                        botonInstalacion.hidden = true;
                    } else {
                        console.log('Usuario rechazó la instalación');
                    }

                    // Limpia el evento
                    botonInstalacion.disabled = false;
                    window.deferredPrompt = null;
                });
            }
        });
    }
}

// Verifica si la aplicación ya está instalada
window.addEventListener('appinstalled', (event) => {
    console.log('La aplicación fue instalada.');
});
  
// Obtener datos meteorológicos al cargar la página
getWeatherData();
