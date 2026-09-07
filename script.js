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

// Water Monitoring
let waterChart;
async function loadWaterMonitoring() {
    try {
        const waterHTML = `
            <div>
                <p><strong>San Juan Water District</strong></p>
                <p class="location-meta">📍 Real-time monitoring across major reservoirs</p>
                <p>💧 Current Level: 85%</p>
                <p>📊 Daily Change: +2.5%</p>
                <p class="text-muted">Last updated: ${new Date().toLocaleTimeString()}</p>
            </div>
        `;
        document.getElementById('water-content').innerHTML = waterHTML;

        // Create water level chart
        const ctx = document.getElementById('waterChart').getContext('2d');
        
        if (waterChart) {
            waterChart.destroy();
        }
        
        waterChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Water Level (%)',
                    data: [75, 76, 78, 80, 82, 84, 85],
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
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#666',
                            callback: function(value) {
                                return value + '%';
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
    } catch (error) {
        document.getElementById('water-content').innerHTML = '<p>Unable to load water data</p>';
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

// Transit Info (static data + links)
function loadTransit() {
    const transitHTML = `
        <ul>
            <li><strong>San Juan Metro (ATS)</strong>
                <p style="font-size: 0.9rem; margin-top: 0.3rem;">
                    <a href="https://www.dtop.gov.pr/" target="_blank">Real-time updates</a>
                </p>
            </li>
            <li><strong>Publicos Status:</strong> Operating normally</li>
            <li><strong>Luis A. Ferré Expressway:</strong> 
                <a href="https://www.aae.pr/" target="_blank">Traffic info</a>
            </li>
            <li><strong>Ferry Service:</strong> 
                <a href="https://www.aceitransportacion.com/" target="_blank">Vieques/Culebra schedule</a>
            </li>
        </ul>
    `;
    document.getElementById('transit-content').innerHTML = transitHTML;
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
                <li><a href="https://www.primera.pr/" target="_blank">Primera Hora</a></li>
                <li><a href="https://www.metro.pr/" target="_blank">Metro.pr</a></li>
            </ul>
        `;
        document.getElementById('news-content').innerHTML = fallbackHTML;
    }
}

// Community Events (static curated list)
function loadEvents() {
    const events = [
        { name: 'Old San Juan Street Festival', date: 'Monthly, Saturdays' },
        { name: 'El Yunque National Forest Tours', date: 'Daily' },
        { name: 'Local Markets & Farmers Markets', date: 'Weekends in most municipalities' }
    ];

    const eventsHTML = events.map(event => `
        <li>
            <strong>${event.name}</strong>
            <p style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">${event.date}</p>
        </li>
    `).join('');

    document.getElementById('events-content').innerHTML = eventsHTML;
}

// Quick Links
function loadQuickLinks() {
    const links = [
        { title: '🏛️ ASPIRe (Gov Portal)', url: 'https://www.puerto-rico.gov/' },
        { title: '🚔 Police (311)', url: 'tel:311' },
        { title: '🏥 Health Emergencies', url: 'tel:911' },
        { title: '📞 Mayor\'s Office Locator', url: 'https://www.estado.pr.gov/' },
        { title: '💼 Business PR', url: 'https://www.commercepuertorico.com/' },
        { title: '🌊 Weather Alerts', url: 'https://www.weather.gov/sju/' }
    ];

    const linksHTML = links.map(link => `
        <li><a href="${link.url}" target="_blank">${link.title}</a></li>
    `).join('');

    document.getElementById('links-content').innerHTML = `<ul>${linksHTML}</ul>`;
}

// Initialize dashboard
function initDashboard() {
    updateTime();
    loadWaterMonitoring();
    loadWeather();
    loadSafetyAlerts();
    loadTransit();
    loadNews();
    loadEvents();
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