const fs = require('fs');

let css = fs.readFileSync('assets/css/style.css', 'utf8');
if (!css.includes('::-webkit-scrollbar')) {
    css += '\n/* Custom Scrollbar */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n::-webkit-scrollbar-track {\n    background: var(--bg-body);\n}\n::-webkit-scrollbar-thumb {\n    background: var(--border);\n    border-radius: 4px;\n}\n::-webkit-scrollbar-thumb:hover {\n    background: var(--text-muted);\n}\n';
    fs.writeFileSync('assets/css/style.css', css);
}

let html = fs.readFileSync('admin/dashboard.html', 'utf8');

html = html.replace('.sidebar {', '.sidebar { flex-shrink: 0;');

const statsCss = \
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-top: 24px;
            margin-bottom: 32px;
        }
        .stat-card {
            background: var(--bg-surface);
            padding: 24px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(14, 165, 233, 0.1);
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        .stat-info h4 {
            color: var(--text-muted);
            font-size: 0.875rem;
            margin-bottom: 4px;
        }
        .stat-info h2 {
            font-size: 1.5rem;
            color: var(--text-main);
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }
        .chart-card {
            background: var(--bg-surface);
            padding: 24px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }
    </style>\;
html = html.replace('</style>', statsCss);

html = html.replace('</head>', '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n</head>');

const headerOld = '<div class="header">\n                <h1 id="page-title">Dashboard</h1>\n            </div>';
const headerNew = \
            <div class="header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 id="page-title">Dashboard</h1>
                </div>
                <button id="dashboard-theme-toggle" class="icon-btn" style="background: var(--bg-surface); border: 1px solid var(--border); padding: 8px; border-radius: 50%; cursor: pointer;">
                    <i class="ri-moon-line"></i>
                </button>
            </div>
\;
html = html.replace(headerOld, headerNew);

const welcomeOldMatch = html.match(/<!-- Panel: Welcome -->[\s\S]*?<\/div>/);
if (welcomeOldMatch) {
    const welcomeNew = \
            <!-- Panel: Welcome -->
            <div id="panel-welcome" class="panel-section active">
                <div class="admin-card" style="margin-bottom: 24px;">
                    <h3>Ikhtisar Sistem</h3>
                    <p style="color: var(--text-muted); margin-top: 8px;">Ringkasan data yang saat ini aktif di website Anda.</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="ri-car-line"></i></div>
                        <div class="stat-info">
                            <h4>Total Kendaraan</h4>
                            <h2 id="stat-cars">-</h2>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="ri-discuss-line"></i></div>
                        <div class="stat-info">
                            <h4>Testimoni</h4>
                            <h2 id="stat-testimonials">-</h2>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="ri-question-answer-line"></i></div>
                        <div class="stat-info">
                            <h4>FAQ Aktif</h4>
                            <h2 id="stat-faq">-</h2>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="ri-steering-line"></i></div>
                        <div class="stat-info">
                            <h4>Merek Tersedia</h4>
                            <h2 id="stat-brands">-</h2>
                        </div>
                    </div>
                </div>
                
                <div class="charts-grid">
                    <div class="chart-card">
                        <h4 style="margin-bottom: 16px;">Distribusi Transmisi</h4>
                        <canvas id="transmissionChart"></canvas>
                    </div>
                    <div class="chart-card">
                        <h4 style="margin-bottom: 16px;">Distribusi Bahan Bakar</h4>
                        <canvas id="fuelChart"></canvas>
                    </div>
                </div>
            </div>\;
    html = html.replace(welcomeOldMatch[0], welcomeNew);
}

const jsLogic = \
        // --- DASHBOARD THEME TOGGLE ---
        const themeBtn = document.getElementById('dashboard-theme-toggle');
        const body = document.documentElement;
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            if (themeBtn) themeBtn.querySelector('i').className = 'ri-sun-line';
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isDark = body.classList.toggle('dark-mode');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                themeBtn.querySelector('i').className = isDark ? 'ri-sun-line' : 'ri-moon-line';
                initCharts(); 
            });
        }
        
        let transmissionChartInstance = null;
        let fuelChartInstance = null;
        let cachedCarData = [];

        async function loadDashboardStats() {
            try {
                const [cars, testi, faq, brands] = await Promise.all([
                    sbClient.from('gallery').select('*', { count: 'exact', head: true }),
                    sbClient.from('testimonials').select('*', { count: 'exact', head: true }),
                    sbClient.from('faq').select('*', { count: 'exact', head: true }),
                    sbClient.from('brands').select('*', { count: 'exact', head: true })
                ]);
                
                document.getElementById('stat-cars').innerText = cars.count || 0;
                document.getElementById('stat-testimonials').innerText = testi.count || 0;
                document.getElementById('stat-faq').innerText = faq.count || 0;
                document.getElementById('stat-brands').innerText = brands.count || 0;
                
                const { data: carData } = await sbClient.from('gallery').select('transmission, fuel_type');
                if (carData) {
                    initCharts(carData);
                }
            } catch (e) {
                console.error("Error loading stats", e);
            }
        }
        
        function initCharts(carData) {
            if (carData) cachedCarData = carData;
            const data = cachedCarData;
            
            if (!data || data.length === 0) return;
            
            const isDark = document.documentElement.classList.contains('dark-mode');
            const textColor = isDark ? '#94a3b8' : '#64748b';
            
            const transCount = { 'Automatic': 0, 'Manual': 0 };
            data.forEach(c => {
                const t = (c.transmission === 'MT' || c.transmission === 'Manual') ? 'Manual' : 'Automatic';
                transCount[t]++;
            });
            
            const fuelCount = { 'Bensin': 0, 'Diesel': 0, 'Listrik/Hybrid': 0 };
            data.forEach(c => {
                const f = (c.fuel_type || '').toLowerCase();
                if (f.includes('diesel')) fuelCount['Diesel']++;
                else if (f.includes('listrik') || f.includes('hybrid') || f.includes('ev')) fuelCount['Listrik/Hybrid']++;
                else fuelCount['Bensin']++;
            });
            
            Chart.defaults.color = textColor;
            Chart.defaults.font.family = "'Outfit', sans-serif";
            
            const ctxTrans = document.getElementById('transmissionChart');
            if (transmissionChartInstance) transmissionChartInstance.destroy();
            transmissionChartInstance = new Chart(ctxTrans, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(transCount),
                    datasets: [{
                        data: Object.values(transCount),
                        backgroundColor: ['#0ea5e9', '#3b82f6'],
                        borderWidth: 0
                    }]
                },
                options: { cutout: '70%', responsive: true, plugins: { legend: { position: 'bottom' } } }
            });
            
            const ctxFuel = document.getElementById('fuelChart');
            if (fuelChartInstance) fuelChartInstance.destroy();
            fuelChartInstance = new Chart(ctxFuel, {
                type: 'bar',
                data: {
                    labels: Object.keys(fuelCount),
                    datasets: [{
                        label: 'Jumlah Kendaraan',
                        data: Object.values(fuelCount),
                        backgroundColor: '#0ea5e9',
                        borderRadius: 4
                    }]
                },
                options: { 
                    responsive: true, 
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
\;

html = html.replace('// Authentication Check', jsLogic + '\n        // Authentication Check');
html = html.replace('loadSettings();', 'loadSettings();\n            loadDashboardStats();');

fs.writeFileSync('admin/dashboard.html', html);
console.log('Done!');
