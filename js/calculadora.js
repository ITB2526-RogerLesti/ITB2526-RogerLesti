/* =========================================================================
   SUSTAINABILITY CALCULATOR - PHASE 3 (INTERACTIVE & RESPONSIVE)
   Designed by: Group 7
   ========================================================================= */

const MESOS_CURS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5]; // School months (Sept-June)
const FACTORS_CO2 = { elec: 0.25, aigua: 0.91, paper: 1.2, neteja: 1.5 };
const PREU_KWH_BASE = 0.18; // Base price €/kWh

let consumChart = null; // Chart.js instance

/**
 * Initializes the calculator with default diagnostic values
 */
async function inicialitzarCalculadora() {
    // Initial diagnostic base values
    document.getElementById('baseElec').value = 164.8;
    document.getElementById('baseAigua').value = 145;
    document.getElementById('baseOficina').value = 85;
    document.getElementById('baseNeteja').value = 42;

    // Setting default reduction values to 0
    ['redElec', 'redAigua', 'redPaper', 'redNeteja'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 0;
    });

    // Listeners for real-time updates on ALL inputs
    const ids = [
        'baseElec', 'baseAigua', 'baseOficina', 'baseNeteja',
        'redElec', 'redAigua', 'redPaper', 'redNeteja'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => generarInforme('custom'));
        }
    });

    generarInforme(false);
}

/**
 * Main logic to calculate consumption and update visuals
 */
function generarInforme(mode) {
    let title = "📊 Interactive Sustainability Calculator";
    let yearsCPI = 0;

    // 1. Get Base Values (Daily/Monthly)
    const vBase = {
        elec: parseFloat(document.getElementById('baseElec').value) || 0,
        aigua: parseFloat(document.getElementById('baseAigua').value) || 0,
        paper: parseFloat(document.getElementById('baseOficina').value) || 0,
        neteja: parseFloat(document.getElementById('baseNeteja').value) || 0
    };

    // 2. Logic for Individual Reductions
    // If user inputs 10 in redAigua, multiplier becomes 0.90 (10% less)
    let red = {
        elec: (100 - (parseFloat(document.getElementById('redElec')?.value) || 0)) / 100,
        aigua: (100 - (parseFloat(document.getElementById('redAigua')?.value) || 0)) / 100,
        paper: (100 - (parseFloat(document.getElementById('redPaper')?.value) || 0)) / 100,
        neteja: (100 - (parseFloat(document.getElementById('redNeteja')?.value) || 0)) / 100
    };

    // 3. Preset Button Logic (Global Reductions)
    if (mode === 'any1') {
        Object.keys(red).forEach(k => red[k] = 0.88);
        title = "📈 Year 1 Plan (-12% Global)";
        yearsCPI = 1;
    } else if (mode === 'any3') {
        Object.keys(red).forEach(k => red[k] = 0.70);
        title = "🌱 Year 3 Plan (-30% Global)";
        yearsCPI = 3;
    } else if (mode === 'custom') {
        title = "⚙️ Custom Savings Scenario";
    }

    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const seasonalFactors = [1.2, 1.1, 1.0, 0.5, 1.0, 0.8, 0.3, 0.1, 1.0, 1.1, 1.2, 0.6];

    const totals = {
        elec: { any: 0, curs: 0 },
        aigua: { any: 0, curs: 0 },
        paper: { any: 0, curs: 0 },
        neteja: { any: 0, curs: 0 }
    };

    // Data arrays for the 5-line graph
    let dElec = [], dAigua = [], dPaper = [], dNeteja = [], dCost = [];

    seasonalFactors.forEach((factor, i) => {
        // Apply seasonal factor AND user-defined reduction/increase
        const e = (vBase.elec * 30) * factor * red.elec;
        const a = vBase.aigua * factor * red.aigua;
        const p = vBase.paper * factor * red.paper;
        const n = vBase.neteja * factor * red.neteja;

        // Calculate cost based on Electricity with 3% annual CPI
        const updatedPrice = PREU_KWH_BASE * Math.pow(1.03, yearsCPI);
        const monthlyCost = e * updatedPrice;

        // Populate Graph Arrays
        dElec.push(e.toFixed(0));
        dAigua.push(a.toFixed(0));
        dPaper.push(p.toFixed(0));
        dNeteja.push(n.toFixed(0));
        dCost.push(monthlyCost.toFixed(2));

        // Aggregate Totals
        totals.elec.any += e; totals.aigua.any += a;
        totals.paper.any += p; totals.neteja.any += n;

        if (MESOS_CURS.includes(i)) {
            totals.elec.curs += e; totals.aigua.curs += a;
            totals.paper.curs += p; totals.neteja.curs += n;
        }
    });

    const totalCO2 = (totals.elec.any * FACTORS_CO2.elec) + (totals.aigua.any * FACTORS_CO2.aigua);

    // Update visuals
    dibuixarGrafic(labels, dElec, dAigua, dPaper, dNeteja, dCost);
    renderitza(totals, title, totalCO2, mode !== false);
}

/**
 * Renders the multi-line chart using Chart.js
 */
function dibuixarGrafic(labels, dElec, dAigua, dPaper, dNeteja, dCost) {
    const ctx = document.getElementById('graficConsum').getContext('2d');
    if (consumChart) consumChart.destroy();

    consumChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Electricity (kWh)', data: dElec, borderColor: '#facc15', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Water (m³)', data: dAigua, borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Paper (kg)', data: dPaper, borderColor: '#94a3b8', borderDash: [5, 5], backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Cleaning (L)', data: dNeteja, borderColor: '#f472b6', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Total Cost (€)', data: dCost, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Quantity (Units)' } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Monthly Cost (€)' } }
            }
        }
    });
}

/**
 * Updates the summary cards in the HTML
 */
function renderitza(res, title, co2, isScenario) {
    const container = document.getElementById('grid-resultats');
    const titleEl = document.getElementById('titol-resultats');
    if (titleEl) titleEl.innerText = title;

    const config = {
        elec: { n: 'Electricity', u: 'kWh', i: '⚡', c: '#facc15' },
        aigua: { n: 'Water', u: 'm³', i: '💧', c: '#3b82f6' },
        paper: { n: 'Paper', u: 'kg', i: '📄', c: '#94a3b8' },
        neteja: { n: 'Cleaning', u: 'L', i: '🧼', c: '#f472b6' }
    };

    let html = '';
    Object.keys(res).forEach(key => {
        const conf = config[key];
        html += `
        <div style="background:white; padding:1.2rem; border-radius:12px; margin-bottom:1rem; border-left:6px solid ${conf.c}; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
            <h3 style="margin-top:0; color:${conf.c}">${conf.i} ${conf.n}</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div><small style="color:#64748b">ANNUAL TOTAL</small><br><strong style="font-size:1.2rem; color:#1e293b">${res[key].any.toFixed(0)} ${conf.u}</strong></div>
                <div><small style="color:#166534">SCHOOL YEAR</small><br><strong style="font-size:1.2rem; color:#166534">${res[key].curs.toFixed(0)} ${conf.u}</strong></div>
            </div>
        </div>`;
    });

    // CO2 Footprint Summary Card
    html += `
    <div style="background:linear-gradient(135deg,#1e3a8a,#10b981); color:white; padding:1.5rem; border-radius:12px; text-align:center; margin-top:1rem;">
        <div style="font-size:1.8rem; font-weight:900">${(co2/1000).toFixed(2)} Tons CO2 / Year</div>
        <p style="margin:0; font-size:0.8rem; opacity:0.8">${isScenario ? 'Impact based on custom reductions and CPI' : 'Baseline environmental impact'}</p>
    </div>`;

    if (container) container.innerHTML = html;
}

// Global initialization
window.onload = inicialitzarCalculadora;