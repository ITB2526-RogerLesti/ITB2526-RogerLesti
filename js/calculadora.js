const MESOS_CURS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
const FACTORS_CO2 = { elec: 0.25, aigua: 0.91, paper: 1.2, neteja: 1.5 };
const PREU_KWH_BASE = 0.18; // Precio base €/kWh

let consumChart = null; // Para el gráfico de Chart.js

async function inicialitzarCalculadora() {
    // Mantengo tus valores iniciales de la imagen
    document.getElementById('baseElec').value = 164.8;
    document.getElementById('baseAigua').value = 145;
    document.getElementById('baseOficina').value = 85;
    document.getElementById('baseNeteja').value = 42;

    // Escuchadores para que cambie al escribir (Tiempo real)
    const ids = ['baseElec', 'baseAigua', 'baseOficina', 'baseNeteja'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('input', () => generarInforme(false));
    });

    generarInforme(false);
}

function generarInforme(tipusPla) {
    let reduccio = 1.0;
    let titol = "📊 Diagnòstic Escenari Actual";
    let anysIPC = 0;

    if (tipusPla === 'any1') { reduccio = 0.88; titol = "📈 Any 1 (-12%)"; anysIPC = 1; }
    if (tipusPla === 'any3') { reduccio = 0.70; titol = "🌱 Any 3 (-30%)"; anysIPC = 3; }

    const vElecDiari = parseFloat(document.getElementById('baseElec').value) || 0;
    const vAigua = parseFloat(document.getElementById('baseAigua').value) || 0;
    const vPaper = parseFloat(document.getElementById('baseOficina').value) || 0;
    const vNeteja = parseFloat(document.getElementById('baseNeteja').value) || 0;

    // DEFINICIÓN DE VACACIONES Y PICOS (Estiu, Nadal, Setmana Santa)
    const mesosLabels = ["Gen", "Feb", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Des"];
    const factorsMensuals = [
        1.2, // Gen (Frío/Luces)
        1.1, // Feb
        1.0, // Mar
        0.5, // ABRIL (Setmana Santa - BAJADA)
        1.0, // Mai
        0.8, // Jun
        0.3, // JULIO (Estiu - BAJADA)
        0.1, // AGOSTO (Cerrado - MÍNIMO)
        1.0, // Set
        1.1, // Oct
        1.2, // Nov
        0.6  // DICIEMBRE (Navidad - BAJADA)
    ];

    const totals = { elec: { any: 0, curs: 0 }, aigua: { any: 0, curs: 0 }, paper: { any: 0, curs: 0 }, neteja: { any: 0, curs: 0 } };
    let dadesGraficElec = [];
    let dadesGraficCost = [];

    factorsMensuals.forEach((f, i) => {
        // Cálculo Consumo
        const e = (vElecDiari * 30) * f * reduccio;
        const a = vAigua * f * reduccio;
        const p = vPaper * f * reduccio;
        const n = vNeteja * f * reduccio;

        // Cálculo Precio con IPC acumulado (+3% anual)
        const preuActualitzat = PREU_KWH_BASE * Math.pow(1.03, anysIPC);
        const costMes = e * preuActualitzat;

        dadesGraficElec.push(e.toFixed(0));
        dadesGraficCost.push(costMes.toFixed(2));

        totals.elec.any += e; totals.aigua.any += a;
        totals.paper.any += p; totals.neteja.any += n;

        if (MESOS_CURS.includes(i)) {
            totals.elec.curs += e; totals.aigua.curs += a;
            totals.paper.curs += p; totals.neteja.curs += n;
        }
    });

    const co2 = (totals.elec.any * FACTORS_CO2.elec) + (totals.aigua.any * FACTORS_CO2.aigua);

    // Dibujamos el gráfico
    dibuixarGrafic(mesosLabels, dadesGraficElec, dadesGraficCost);

    // Renderizamos tus tarjetas de siempre
    renderitza(totals, titol, co2, tipusPla);
}

function dibuixarGrafic(labels, dadesKwh, dadesPreu) {
    const ctx = document.getElementById('graficConsum').getContext('2d');
    if (consumChart) consumChart.destroy();

    consumChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Consum (kWh)',
                    data: dadesKwh,
                    borderColor: '#1e3a8a',
                    backgroundColor: 'rgba(30, 58, 138, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Cost (€) amb IPC +3%',
                    data: dadesPreu,
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Energia (kWh)' } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Cost Mensual (€)' } }
            }
        }
    });
}

function renderitza(res, titol, co2, estat) {
    const container = document.getElementById('grid-resultats');
    document.getElementById('titol-resultats').innerText = titol;

    const config = {
        elec: { n: 'Electricitat', u: 'kWh', i: '⚡', c: '#1e3a8a' },
        aigua: { n: 'Aigua', u: 'm³', i: '💧', c: '#3b82f6' },
        paper: { n: 'Paper', u: 'kg', i: '📄', c: '#64748b' },
        neteja: { n: 'Neteja', u: 'L', i: '🧼', c: '#10b981' }
    };

    let html = '';
    Object.keys(res).forEach(k => {
        const conf = config[k];
        html += `
        <div style="background:white; padding:1.2rem; border-radius:12px; margin-bottom:1rem; border-left:6px solid ${conf.c}; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
            <h3 style="margin-top:0">${conf.i} ${conf.n}</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div><small>ANUAL</small><br><strong style="font-size:1.2rem">${res[k].any.toFixed(0)} ${conf.u}</strong></div>
                <div style="color:#166534"><small>CURS</small><br><strong style="font-size:1.2rem">${res[k].curs.toFixed(0)} ${conf.u}</strong></div>
            </div>
        </div>`;
    });

    html += `<div style="background:linear-gradient(135deg,#1e3a8a,#10b981); color:white; padding:1.5rem; border-radius:12px; text-align:center; margin-top:1rem;">
        <div style="font-size:1.8rem; font-weight:900">${(co2/1000).toFixed(2)} Tones CO2/any</div>
        <p style="margin:0; font-size:0.8rem; opacity:0.8">${estat ? 'Preus calculats amb increment IPC anual' : 'Escenari base sense increments'}</p>
    </div>`;

    container.innerHTML = html;
}

window.onload = inicialitzarCalculadora;