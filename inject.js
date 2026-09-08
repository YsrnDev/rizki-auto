const fs = require('fs');
let html = fs.readFileSync('admin/dashboard.html', 'utf8');

const jsLogic = 
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
                console.error('Error loading stats', e);
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
;

html = html.replace('<script>', '<script>\n' + jsLogic);
html = html.replace('loadSettings();', 'loadSettings();\n            loadDashboardStats();');

fs.writeFileSync('admin/dashboard.html', html);
