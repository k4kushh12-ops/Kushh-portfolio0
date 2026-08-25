/* ==========================================================================
   KUSHH KOTHARI PORTFOLIO & RESUME - JAVASCRIPT
   ========================================================================== */

let anovaChartInstance = null;
let forecastChartInstance = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    loadSavedEdits();
    initAnovaChart();
    initForecasterChart();
});

/* --------------------------------------------------------------------------
   LIVE EDIT MODE FUNCTIONS
   -------------------------------------------------------------------------- */
function toggleEditMode() {
    isEditMode = false;
    const editBtn = document.getElementById('edit-toggle-btn');
    const editBanner = document.getElementById('edit-banner');
    if (editBtn) editBtn.style.display = 'none';
    if (editBanner) editBanner.style.display = 'none';
    document.querySelectorAll('.editable').forEach(el => el.removeAttribute('contenteditable'));
}

function saveEdits() {}

function loadSavedEdits() {
    // Live edit mode turned off; clear any cached local edits to ensure fresh content
    try {
        localStorage.removeItem('kushh_portfolio_edits');
    } catch (e) {}
}

function resetEdits() {
    if (confirm('Are you sure you want to reset all edits to default?')) {
        localStorage.removeItem('kushh_portfolio_edits');
        window.location.reload();
    }
}

/* --------------------------------------------------------------------------
   VIEW SWITCHER (Interactive Showcase vs Executive CV)
   -------------------------------------------------------------------------- */
function switchView(mode) {
    const interactiveView = document.getElementById('interactive-view');
    const cvView = document.getElementById('cv-view');
    const interactiveBtn = document.getElementById('view-interactive-btn');
    const cvBtn = document.getElementById('view-cv-btn');

    if (mode === 'interactive') {
        interactiveView.classList.add('active');
        cvView.classList.remove('active');
        interactiveBtn.classList.add('active');
        cvBtn.classList.remove('active');
    } else {
        cvView.classList.add('active');
        interactiveView.classList.remove('active');
        cvBtn.classList.add('active');
        interactiveBtn.classList.remove('active');
    }
}

/* --------------------------------------------------------------------------
   DARK / LIGHT THEME TOGGLE
   -------------------------------------------------------------------------- */
function toggleTheme() {
    const htmlEl = document.documentElement;
    const themeBtnIcon = document.querySelector('#theme-toggle i');
    const currentTheme = htmlEl.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        htmlEl.setAttribute('data-theme', 'light');
        themeBtnIcon.className = 'fa-solid fa-sun';
    } else {
        htmlEl.setAttribute('data-theme', 'dark');
        themeBtnIcon.className = 'fa-solid fa-moon';
    }

    // Refresh charts on theme change
    if (anovaChartInstance) anovaChartInstance.destroy();
    if (forecastChartInstance) forecastChartInstance.destroy();
    initAnovaChart();
    initForecasterChart();
}

/* --------------------------------------------------------------------------
   TAB NAVIGATION
   -------------------------------------------------------------------------- */
function openTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabLinks = document.querySelectorAll('.tab-link');

    tabs.forEach(tab => tab.classList.remove('active'));
    tabLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

/* --------------------------------------------------------------------------
   CHART 1: ANOVA RISK VS RETURN DISTRIBUTION CHART
   -------------------------------------------------------------------------- */
function initAnovaChart() {
    const ctx = document.getElementById('anovaChart');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e5e7eb' : '#374151';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    anovaChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Low Risk (Corp Bonds)', 'Medium Risk (ELSS)', 'High Risk (Tech Funds)'],
            datasets: [{
                label: '10-Yr Historical Avg Return (%)',
                data: [8.28, 14.96, 20.83],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.75)',
                    'rgba(59, 130, 246, 0.75)',
                    'rgba(139, 92, 246, 0.75)'
                ],
                borderColor: [
                    '#10b981',
                    '#3b82f6',
                    '#8b5cf6'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            if (context[0].dataIndex === 0) {
                                return 'Statistically Significant (F=17.55, p < 0.001)';
                            }
                            return 'Homogenous Variance (p > 0.05)';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor, callback: value => value + '%' },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   CHART 2: STOCK FORECASTER DEMO SIMULATION
   -------------------------------------------------------------------------- */
const stockDataMock = {
    RELIANCE: { base: 2850, drift: 0.15, volatility: 25 },
    TCS: { base: 4120, drift: 0.12, volatility: 30 },
    HDFCBANK: { base: 1640, drift: 0.10, volatility: 20 },
    NIFTY50: { base: 24500, drift: 0.14, volatility: 150 }
};

function initForecasterChart() {
    updateForecaster();
}

function updateForecaster() {
    const ctx = document.getElementById('forecastChart');
    if (!ctx) return;

    const ticker = document.getElementById('stock-select').value || 'RELIANCE';
    const horizon = parseInt(document.getElementById('horizon-select').value || '90');
    const mock = stockDataMock[ticker];

    const labels = [];
    const historicalData = [];
    const forecastData = [];
    const upperConfidence = [];
    const lowerConfidence = [];

    // Past 30 days historical
    let price = mock.base;
    for (let i = 30; i >= 0; i--) {
        labels.push(`Day -${i}`);
        const noise = (Math.random() - 0.48) * mock.volatility;
        price += noise;
        historicalData.push(price.toFixed(2));
        forecastData.push(null);
        upperConfidence.push(null);
        lowerConfidence.push(null);
    }

    // Connect forecast start point
    forecastData[forecastData.length - 1] = price.toFixed(2);
    upperConfidence[upperConfidence.length - 1] = price.toFixed(2);
    lowerConfidence[lowerConfidence.length - 1] = price.toFixed(2);

    // Forward forecast
    let forecastPrice = price;
    for (let j = 1; j <= horizon; j += Math.ceil(horizon / 15)) {
        labels.push(`Day +${j}`);
        historicalData.push(null);
        
        forecastPrice += (mock.drift * 5) + ((Math.random() - 0.45) * mock.volatility);
        const spread = (j / horizon) * (mock.volatility * 4);

        forecastData.push(forecastPrice.toFixed(2));
        upperConfidence.push((forecastPrice + spread).toFixed(2));
        lowerConfidence.push((forecastPrice - spread).toFixed(2));
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e5e7eb' : '#374151';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    if (forecastChartInstance) forecastChartInstance.destroy();

    forecastChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Historical Price',
                    data: historicalData,
                    borderColor: '#3b82f6',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.2
                },
                {
                    label: 'Forecast Trendline',
                    data: forecastData,
                    borderColor: '#10b981',
                    borderDash: [6, 4],
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.2
                },
                {
                    label: 'Upper 95% CI',
                    data: upperConfidence,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Lower 95% CI',
                    data: lowerConfidence,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor, maxTicksLimit: 12 },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}
