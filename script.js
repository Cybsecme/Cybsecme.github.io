// Update current time
function updateTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Puerto_Rico'
    });
    document.getElementById('current-time').textContent = formatter.format(now);
}

// Water Monitoring - Rio Canovanas, Puerto Rico
let waterChart;
async function loadWaterMonitoring() {
    try {
        const waterHTML = `
            <div>
                <p><strong>Rio Canovanas, Puerto Rico</strong></p>
                <p class="location-meta">📍 USGS Station 50061800</p>
                <p class="location-meta"><a href="https://waterdata.usgs.gov/monitoring-location/USGS-50061800#dataTypeId=continuous-00065-0&period=P7D&showFieldMeasurements=true" target="_blank">View on USGS</a></p>
                <p>💧 Water Level: Real-time monitoring data</p>
                <p class="text-muted">Last updated: ${new Date().toLocaleTimeString()}</p>
            </div>
        `;
        document.getElementById('water-content').innerHTML = waterHTML;

        // Fetch real water data from USGS
        const response = await fetch('https://waterservices.usgs.gov/nwis/iv/?sites=USGS-50061800&format=json&parameterCd=00065&period=P7D');
        const data = await response.json();
        
        if (data.value && data.value.timeSeries && data.value.timeSeries.length > 0) {
            const values = data.value.timeSeries[0].values[0].value;
            const labels = [];
            const chartData = [];
            
            // Get last 7 days of data
            values.slice(-168).forEach((point, index) => {
                if (index % 24 === 0) { // One point per day
                    labels.push(new Date(point.dateTime).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}));
                }
                chartData.push(parseFloat(point.value));
            });

            // Create water level chart
            const ctx = document.getElementById('waterChart').getContext('2d');
            
            if (waterChart) {
                waterChart.destroy();
            }
            
            waterChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Water Level (feet)',
                        data: chartData,
                        borderColor: '#0066cc',
                        backgroundColor: 'rgba(0, 102, 204, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#0066cc',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#212529',
                                font: { size: 11 }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                color: '#666',
                                callback: function(value) {
                                    return value.toFixed(1) + ' ft';
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#666'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        document.getElementById('water-content').innerHTML = '<p><strong>Rio Canovanas, Puerto Rico</strong></p><p class="location-meta">📍 USGS Station 50061800</p><p>Unable to load water data</p>';
        console.error('Water monitoring error:', error);
    }
}

// Weather (using Open-Meteo API - free, no auth needed)
async function loadWeather() {
    try {
        const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=18.2208&longitude=-66.5901&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&timezone=America/Puerto_Rico'
        );
        const data = await response.json();
        const current = data.current;

        const weatherHTML = `
            <div class="weather-info">
                <p><strong>San Juan Area</strong></p>
                <p>🌡️ ${current.temperature_2m}°F</p>
                <p>💨 Wind: ${current.wind_speed_10m} mph</p>
                <p class="text-muted">Last updated: ${new Date().toLocaleTimeString()}</p>
            </div>
        `;
        document.getElementById('weather-content').innerHTML = weatherHTML;
    } catch (error) {
        document.getElementById('weather-content').innerHTML = '<p>Unable to load weather data</p>';
        console.error('Weather error:', error);
    }
}

// NOAA Tides & Currents - Fajardo, PR (18.3242, -65.6500)
async function loadTidesAndCurrents() {
    try {
        // Fajardo, PR coordinates
        const lat = 18.3242;
        const lon = -65.6500;
        
        // Fetch tide predictions from NOAA
        const tideResponse = await fetch(
            `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=9755371&product=predictions&begin_date=20250912&end_date=20250913&datum=MLLW&units=metric&format=json&interval=hilo`
        );
        const tideData = await tideResponse.json();

        let tidesHTML = `
            <div>
                <p><strong>Fajardo, Puerto Rico</strong></p>
                <p class="location-meta">📍 Latitude: ${lat}°, Longitude: ${lon}°</p>
        `;

        if (tideData.predictions && tideData.predictions.length > 0) {
            tidesHTML += '<p><strong>Today\'s Tide Events:</strong></p>';
            tideData.predictions.slice(0, 4).forEach(tide => {
                const time = new Date(tide.t).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
                const height = parseFloat(tide.v).toFixed(2);
                const tideType = tide.type === 'H' ? '🔺 High' : '🔻 Low';
                tidesHTML += `<p>${tideType} Tide: ${height}m at ${time}</p>`;
            });
        } else {
            tidesHTML += '<p>Tide data available</p>';
        }

        tidesHTML += `<p class="text-muted">Last updated: ${new Date().toLocaleTimeString()}</p>`;
        tidesHTML += '<p style="font-size: 0.85rem;"><a href="https://www.tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9755371" target="_blank">📊 View full tide predictions</a></p>';
        tidesHTML += '</div>';

        document.getElementById('tides-content').innerHTML = tidesHTML;
    } catch (error) {
        document.getElementById('tides-content').innerHTML = `
            <div>
                <p><strong>Fajardo, Puerto Rico</strong></p>
                <p class="location-meta">📍 18.3242°N, 65.6500°W</p>
                <p>🌊 Tide and current data available from NOAA</p>
                <p><a href="https://www.tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9755371" target="_blank">📊 View on NOAA</a></p>
            </div>
        `;
        console.error('Tides & Currents error:', error);
    }
}

// Local News (RSS feeds via CORS proxy)
async function loadNews() {
    try {
        // Using NewsAPI free tier (requires free API key from newsapi.org)
        const apiKey = '1cc9f77f7f6f4f92baaef791804bbe9f';
        const response = await fetch(
            `https://newsapi.org/v2/everything?q=Puerto+Rico&sortBy=publishedAt&language=es&pageSize=5&apiKey=${apiKey}`
        );
        const data = await response.json();

        const newsHTML = data.articles.slice(0, 5).map(article => `
            <li>
                <a href="${article.url}" target="_blank">${article.title}</a>
                <p style="font-size: 0.85rem; color: #666; margin-top: 0.3rem;">
                    ${new Date(article.publishedAt).toLocaleDateString()}
                </p>
            </li>
        `).join('');

        document.getElementById('news-content').innerHTML = newsHTML || '<p>No news available</p>';
    } catch (error) {
        // Fallback local news sources
        const fallbackHTML = `
            <ul>
                <li><a href="https://www.elnuevodia.com/" target="_blank">El Nuevo Día</a></li>
                <li><a href="https://www.primerahora.com/" target="_blank">Primera Hora</a></li>
                <li><a href="https://www.metro.pr/" target="_blank">Metro.pr</a></li>
            </ul>
        `;
        document.getElementById('news-content').innerHTML = fallbackHTML;
        console.error('News error:', error);
    }
}

// Quick Links with screenshots
function loadQuickLinks() {
    const links = [
        {
            title: 'GeoGuessr',
            url: 'https://www.geoguessr.com/',
            screenshot: 'https://www.geoguessr.com/static/images/og-image.png'
        },
        {
            title: 'Marginalia Search',
            url: 'https://marginalia-search.com/',
            screenshot: 'https://marginalia-search.com/screenshots/main.png'
        },
        {
            title: 'Water Data USGS',
            url: 'https://waterdata.usgs.gov/monitoring-location/USGS-50061800#dataTypeId=continuous-00065-0&period=P7D&showFieldMeasurements=true',
            screenshot: 'https://waterdata.usgs.gov/nwisweb/img/NWIS_Logo.png'
        },
        {
            title: 'myNoise.net',
            url: 'https://mynoise.net/NoiseMachines/windSeaRainNoiseGenerator.php',
            screenshot: 'https://mynoise.net/assets/images/og-image.png'
        },
        {
            title: 'SuperCook',
            url: 'https://www.supercook.com/#/menu',
            screenshot: 'https://www.supercook.com/images/og-image.png'
        },
        {
            title: 'JustWatch',
            url: 'https://www.justwatch.com/',
            screenshot: 'https://www.justwatch.com/images/og-image.png'
        },
        {
            title: 'Ready.gov',
            url: 'https://www.ready.gov/stand-ready',
            screenshot: 'https://www.ready.gov/sites/default/files/inline-images/ready-logo.png'
        },
        {
            title: 'DNS Checker',
            url: 'https://dnschecker.org/reverse-image-search.php',
            screenshot: 'https://dnschecker.org/images/logo.png'
        },
        {
            title: 'Zoom.Earth',
            url: 'https://zoom.earth/maps/radar/#view=18.129784,-66.057357,9.94z',
            screenshot: 'https://zoom.earth/img/og-image.png'
        },
        {
            title: 'Emisoras PR',
            url: 'https://www.emisoras-puertorico.com/',
            screenshot: 'https://www.emisoras-puertorico.com/images/og-image.png'
        },
        {
            title: 'A Soft Murmur',
            url: 'https://asoftmurmur.com/',
            screenshot: 'https://asoftmurmur.com/images/og-image.png'
        },
        {
            title: 'PR Highways',
            url: 'https://es.abcdef.wiki/wiki/List_of_highways_in_Puerto_Rico',
            screenshot: 'https://es.abcdef.wiki/images/og-image.png'
        },
        {
            title: 'Weather Alerts',
            url: 'https://www.weather.gov/sju/',
            screenshot: 'https://www.weather.gov/static/media/nws-logo-large.png'
        }
    ];

    const linksHTML = `
        <div class="quick-links-container">
            ${links.map(link => `
                <a href="${link.url}" target="_blank" class="quick-link" title="${link.title}">
                    <div class="link-thumbnail">
                        <img src="${link.screenshot}" alt="${link.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2260%22%3E%3Crect fill=%22%23eee%22 width=%22100%22 height=%2260%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2212%22 fill=%22%23999%22%3E${link.title}%3C/text%3E%3C/svg%3E'">
                    </div>
                    <span class="link-label">${link.title}</span>
                </a>
            `).join('')}
        </div>
    `;
    document.getElementById('links-content').innerHTML = linksHTML;
}

// Initialize dashboard
function initDashboard() {
    updateTime();
    loadWaterMonitoring();
    loadWeather();
    loadTidesAndCurrents();
    loadNews();
    loadQuickLinks();

    // Refresh every 5 minutes
    setInterval(() => {
        updateTime();
        loadWaterMonitoring();
        loadWeather();
        loadTidesAndCurrents();
        loadNews();
    }, 300000);
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
