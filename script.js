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
                <p class="location-meta"><a href="https://waterdata.usgs.gov/monitoring-location/USGS-50061800#dataTypeId=continuous-00065-0&period=P7D&showFieldMeasurements=true" target="_blank">View Full Data →</a></p>
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
        document.getElementById('water-content').innerHTML = '<p><strong>Rio Canovanas, Puerto Rico</strong></p><p class="location-meta">📍 USGS Station 50061800</p><p><a href="https://waterdata.usgs.gov/monitoring-location/USGS-50061800#dataTypeId=continuous-00065-0&period=P7D&showFieldMeasurements=true" target="_blank">View Real-time Data →</a></p><p class="text-muted">Real-time monitoring available at USGS</p>';
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
    }
}

// Safety Alerts (local static data + social monitoring)
function loadSafetyAlerts() {
    const alerts = [
        { type: 'warning', text: '⚠️ Heavy rainfall expected in northern regions' },
        { type: 'info', text: 'ℹ️ Road work on PR-52 near Caguas (check transit)' }
    ];

    const safetyHTML = alerts.map(alert => `
        <div class="alert ${alert.type}">
            ${alert.text}
        </div>
    `).join('');

    document.getElementById('safety-content').innerHTML = safetyHTML || 
        '<p>No active safety alerts</p>';
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
                        <img src="${link.screenshot}" alt="${link.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2260%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
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
    loadSafetyAlerts();
    loadNews();
    loadQuickLinks();

    // Refresh every 5 minutes
    setInterval(() => {
        updateTime();
        loadWaterMonitoring();
        loadWeather();
        loadNews();
    }, 300000);
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
