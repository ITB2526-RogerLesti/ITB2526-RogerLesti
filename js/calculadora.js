const MESOS_CURS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
const FACTORS_CO2 = { elec: 0.25, aigua: 0.91, paper: 1.2, neteja: 1.5 };
const PREU_KWH_BASE = 0.18; // Base price €/kWh

let consumChart = null; // For Chart.js graph

async function inicialitzarCalculadora() {
    // Initial values from the diagnostic
    document.getElementById('baseElec').value = 164.8;
    document.getElementById('baseAigua').value = 145;
    document.getElementById('baseOficina').value = 85;
    document.getElementById('baseNeteja').value = 42;

    // Listeners for real-time updates
    const ids = ['baseElec', 'baseAigua', 'baseOficina', 'baseNeteja'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('input', () => generarInforme(false));
    });

    generarInforme(false);
}

function generarInforme(tipusPla) {
    let reduccio = 1.0;
    let titol = "📊 Current Scenario Diagnosis";
    let anysIPC = 0;

    if (tipusPla === 'any1') {
        reduccio = 0.88;
        titol = "📈 Year 1 (-12%)";
        anysIPC = 1;
    }
    if (tipusPla === 'any3') {
        reduccio = 0.70;
        titol = "🌱 Year 3 (-30%)";
        anysIPC = 3;
    }

    const vElecDiari = parseFloat(document.getElementById('baseElec').value) || 0;
    const vAigua = parseFloat(document.getElementById('baseAigua').value) || 0;
    const vPaper = parseFloat(document.getElementById('baseOficina').value) || 0;
    const vNeteja = parseFloat(document.getElementById('baseNeteja').value) || 0;

    const mesosLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const factorsMensuals = [1.2, 1.1, 1.0, 0.5, 1.0, 0.8, 0.3, 0.1, 1.0, 1.1, 1.2, 0.6];

    const totals = { elec: { any: 0, curs: 0 }, aigua: { any: 0, curs: 0 }, paper: { any: 0, curs: 0 }, neteja: { any: 0, curs: 0 } };

    // Arrays for the 5 individual lines
    let dElec = [], dAigua = [], dPaper = [], dNeteja = [], dIPC = [];

    factorsMensuals.forEach((f, i) => {
        const e = (vElecDiari * 30) * f * reduccio;
        const a = vAigua * f * reduccio;
        const p = vPaper * f * reduccio;
        const n = vNeteja * f * reduccio;

        const preuActualitzat = PREU_KWH_BASE * Math.pow(1.03, anysIPC);
        const costMes = e * preuActualitzat;

        // Store monthly data for each line
        dElec.push(e.toFixed(0));
        dAigua.push(a.toFixed(0));
        dPaper.push(p.toFixed(0));
        dNeteja.push(n.toFixed(0));
        dIPC.push(costMes.toFixed(2));

        totals.elec.any += e; totals.aigua.any += a;
        totals.paper.any += p; totals.neteja.any += n;

        if (MESOS_CURS.includes(i)) {
            totals.elec.curs += e; totals.aigua.curs += a;
            totals.paper.curs += p; totals.neteja.curs += n;
        }
    });

    const co2 = (totals.elec.any * FACTORS_CO2.elec) + (totals.aigua.any * FACTORS_CO2.aigua);

    // Call the updated drawing function with all 5 data arrays
    dibuixarGrafic(mesosLabels, dElec, dAigua, dPaper, dNeteja, dIPC);
    renderitza(totals, titol, co2, tipusPla);
}

function dibuixarGrafic(labels, dElec, dAigua, dPaper, dNeteja, dIPC) {
    const ctx = document.getElementById('graficConsum').getContext('2d');
    if (consumChart) consumChart.destroy();

    consumChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Electricity (kWh)',
                    data: dElec,
                    borderColor: '#facc15', // Yellow
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Water (m³)',
                    data: dAigua,
                    borderColor: '#3b82f6', // Blue
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Paper (kg)',
                    data: dPaper,
                    borderColor: '#94a3b8', // Gray
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Cleaning (L)',
                    data: dNeteja,
                    borderColor: '#f472b6', // Pink
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Cost/IPC (€)',
                    data: dIPC,
                    borderColor: '#10b981', // Green
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1' // Right scale for money
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Quantity (kWh, m³, kg, L)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Monthly Cost (€)' }
                }
            }
        }
    });
}

function renderitza(res, titol, co2, estat) {
    const container = document.getElementById('grid-resultats');
    document.getElementById('titol-resultats').innerText = titol;

    // Configuración de colores sincronizada con el gráfico
    const config = {
        elec: { n: 'Electricity', u: 'kWh', i: '⚡', c: '#facc15' }, // Amarillo
        aigua: { n: 'Water', u: 'm³', i: '💧', c: '#3b82f6' },      // Azul
        paper: { n: 'Paper', u: 'kg', i: '📄', c: '#94a3b8' },      // Gris
        neteja: { n: 'Cleaning', u: 'L', i: '🧼', c: '#f472b6' }    // Rosa
    };

    let html = '';
    Object.keys(res).forEach(k => {
        const conf = config[k];
        html += `
        <div style="background:white; padding:1.2rem; border-radius:12px; margin-bottom:1rem; border-left:6px solid ${conf.c}; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
            <h3 style="margin-top:0; color:${conf.c}">${conf.i} ${conf.n}</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div><small style="color:#64748b">ANNUAL</small><br><strong style="font-size:1.2rem; color:#1e293b">${res[k].any.toFixed(0)} ${conf.u}</strong></div>
                <div><small style="color:#166534">SCHOOL YEAR</small><br><strong style="font-size:1.2rem; color:#166534">${res[k].curs.toFixed(0)} ${conf.u}</strong></div>
            </div>
        </div>`;
    });

    html += `<div style="background:linear-gradient(135deg,#1e3a8a,#10b981); color:white; padding:1.5rem; border-radius:12px; text-align:center; margin-top:1rem;">
        <div style="font-size:1.8rem; font-weight:900">${(co2/1000).toFixed(2)} Tons CO2/year</div>
        <p style="margin:0; font-size:0.8rem; opacity:0.8">${estat ? 'Prices calculated with annual CPI increase' : 'Base scenario without increases'}</p>
    </div>`;

    container.innerHTML = html;
}

window.onload = inicialitzarCalculadora;