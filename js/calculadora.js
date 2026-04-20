/* =========================================================================
   SUSTAINABILITY CALCULATOR - PHASE 4 (MULTI-YEAR PROJECTIONS & COMPARISON)
   Designed by: Group 7 (Walid & Roger)
   ========================================================================= */

const MESOS_NOMS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FACTORS_CO2 = { elec: 0.25, aigua: 0.91, paper: 1.2, neteja: 1.5 };
const PREU_KWH_BASE = 0.18;

let consumChart = null;
let projectionYear = 0; // 0 = Actual, 1 = Año 1, 3 = Año 3, etc.

/**
 * Inicialización segura
 */
function inicialitzarCalculadora() {
    console.log("Initializing simulator with multi-year projection...");

    const idsEscucha = [
        'baseElec', 'baseAigua', 'baseOficina', 'baseNeteja',
        'redElec', 'redAigua', 'redPaper', 'redNeteja', 'seasonFilter'
    ];

    idsEscucha.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const evento = el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(evento, updateSimulator);
        }
    });

    updateSimulator();
}

/**
 * Nueva función para cambiar el año de la proyección desde los botones
 */
function setProjection(year) {
    projectionYear = year;

    // Feedback visual opcional en consola o UI
    console.log(`Cambiando vista a: ${year === 0 ? 'Actual' : 'Año ' + year}`);

    // Actualizamos el título del bloque de resultados si existe
    const titol = document.getElementById('titol-resultats');
    if(titol) titol.innerText = year === 0 ? "Current Consumption" : `Forecast for Year ${year}`;

    updateSimulator();
}

function updateSimulator() {
    const season = document.getElementById('seasonFilter').value;
    generarInforme('custom', season);
}

function generarInforme(mode, season = 'all') {
    // Si se pulsan los botones antiguos, actualizamos el año de proyección
    if (mode === 'any1') projectionYear = 1;
    if (mode === 'any3') projectionYear = 3;

    const vBase = {
        elec: parseFloat(document.getElementById('baseElec').value) || 0,
        aigua: parseFloat(document.getElementById('baseAigua').value) || 0,
        paper: parseFloat(document.getElementById('baseOficina').value) || 0,
        neteja: parseFloat(document.getElementById('baseNeteja').value) || 0
    };

    // Leemos el % de reducción manual de los sliders
    let manualRed = {
        elec: (parseFloat(document.getElementById('redElec')?.value) || 0) / 100,
        aigua: (parseFloat(document.getElementById('redAigua')?.value) || 0) / 100,
        paper: (parseFloat(document.getElementById('redPaper')?.value) || 0) / 100,
        neteja: (parseFloat(document.getElementById('redNeteja')?.value) || 0) / 100
    };

    const seasonalFactors = [1.2, 1.1, 1.0, 0.5, 1.0, 0.8, 0.3, 0.1, 1.0, 1.1, 1.2, 0.6];

    let indicesMesos = [];
    switch(season) {
        case 'winter': indicesMesos = [11, 0, 1]; break;
        case 'spring': indicesMesos = [2, 3, 4]; break;
        case 'summer': indicesMesos = [5, 6, 7]; break;
        case 'autumn': indicesMesos = [8, 9, 10]; break;
        default: indicesMesos = [0,1,2,3,4,5,6,7,8,9,10,11];
    }

    let labels = [], dElec = [], dAigua = [], dPaper = [], dNeteja = [], dCost = [];
    let totalAcumulado = { elec: 0, aigua: 0, paper: 0, neteja: 0 };

    indicesMesos.forEach(i => {
        const factorS = seasonalFactors[i];

        // LOGICA DE PROYECCIÓN:
        // Aplicamos la reducción del slider multiplicada por los años proyectados.
        // Ejemplo: 10% de reducción en el slider -> en Año 3 es un 30% de ahorro.
        const calcRed = (key) => Math.max(0, 1 - (manualRed[key] * (projectionYear || 1)));
        // Si projectionYear es 0 (Actual), usamos el valor base (sin reducción del slider)
        const currentFac = projectionYear === 0 ? 1 : calcRed;

        const e = (vBase.elec * 30) * factorS * (projectionYear === 0 ? 1 : calcRed('elec'));
        const a = vBase.aigua * factorS * (projectionYear === 0 ? 1 : calcRed('aigua'));
        const p = vBase.paper * factorS * (projectionYear === 0 ? 1 : calcRed('paper'));
        const n = vBase.neteja * factorS * (projectionYear === 0 ? 1 : calcRed('neteja'));

        // Inflación del coste del 3% anual según el año proyectado
        const cost = e * (PREU_KWH_BASE * Math.pow(1.03, projectionYear));

        labels.push(MESOS_NOMS[i]);
        dElec.push(e.toFixed(0));
        dAigua.push(a.toFixed(0));
        dPaper.push(p.toFixed(0));
        dNeteja.push(n.toFixed(0));
        dCost.push(cost.toFixed(2));

        totalAcumulado.elec += e;
        totalAcumulado.aigua += a;
        totalAcumulado.paper += p;
        totalAcumulado.neteja += n;
    });

    dibuixarGrafic(labels, dElec, dAigua, dPaper, dNeteja, dCost);
    renderCards(totalAcumulado, season);
}

function dibuixarGrafic(labels, dElec, dAigua, dPaper, dNeteja, dCost) {
    const canvas = document.getElementById('graficConsum');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (consumChart) consumChart.destroy();

    consumChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Elec (kWh)', data: dElec, borderColor: '#facc15', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Water (m³)', data: dAigua, borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Paper (kg)', data: dPaper, borderColor: '#94a3b8', borderDash: [5, 5], tension: 0.4, yAxisID: 'y' },
                { label: 'Cleaning (L)', data: dNeteja, borderColor: '#f472b6', tension: 0.4, yAxisID: 'y' },
                { label: 'Cost (€)', data: dCost, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', position: 'left' },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });
}

function renderCards(res, seasonName) {
    const container = document.getElementById('grid-resultats');
    const co2Display = document.getElementById('co2-val');
    if (!container) return;

    // Título dinámico según el año
    const yearLabel = projectionYear === 0 ? "CURRENT" : `YEAR ${projectionYear}`;
    const seasonLabel = seasonName === 'all' ? 'ANNUAL' : 'SEASONAL';

    const co2Total = (res.elec * FACTORS_CO2.elec) + (res.aigua * FACTORS_CO2.aigua);
    if(co2Display) co2Display.innerHTML = `${(co2Total/1000).toFixed(2)} <span>tons CO2 (${yearLabel})</span>`;

    const items = [
        { n: 'Electricity', v: res.elec, u: 'kWh', c: '#facc15', img: '⚡' },
        { n: 'Water', v: res.aigua, u: 'm³', c: '#3b82f6', img: '💧' },
        { n: 'Paper', v: res.paper, u: 'kg', c: '#94a3b8', img: '📄' },
        { n: 'Cleaning', v: res.neteja, u: 'L', c: '#f472b6', img: '🧼' }
    ];

    container.innerHTML = items.map(item => {
        // Uso escolar estimado
        const schoolUsage = seasonName === 'all' ? item.v * (10/12) : item.v * 0.90;

        return `
        <div class="result-card" style="border-bottom-color: ${item.c}; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.2rem; background: #f8fafc; padding: 12px; border-radius: 12px; min-width: 65px; text-align: center;">
                ${item.img}
            </div>
            <div style="flex-grow: 1;">
                <h4 style="margin: 0; color: #64748b; font-size: 0.7rem; font-weight: 800;">${yearLabel} ${item.n.toUpperCase()}</h4>
                <div style="display: flex; gap: 20px; margin-top: 5px;">
                    <div>
                        <div style="font-size: 0.55rem; color: #94a3b8; font-weight: bold;">TOTAL</div>
                        <div style="font-size: 1.3rem; font-weight: 800; color: #1e293b;">
                            ${Math.round(item.v).toLocaleString()} <small style="font-size: 0.7rem;">${item.u}</small>
                        </div>
                    </div>
                    <div style="border-left: 1px solid #e2e8f0; padding-left: 15px;">
                        <div style="font-size: 0.55rem; color: #10b981; font-weight: bold;">SCHOOL USE</div>
                        <div style="font-size: 1.3rem; font-weight: 800; color: #1e293b;">
                            ${Math.round(schoolUsage).toLocaleString()} <small style="font-size: 0.7rem;">${item.u}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.onload = inicialitzarCalculadora;