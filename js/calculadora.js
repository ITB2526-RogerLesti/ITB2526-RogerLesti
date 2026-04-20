/* =========================================================================
   SUSTAINABILITY CALCULATOR - PHASE 3 (INTEGRATED SEASONAL FILTERS & COMPARISON)
   Designed by: Group 7 (Walid & Roger)
   ========================================================================= */

const MESOS_NOMS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FACTORS_CO2 = { elec: 0.25, aigua: 0.91, paper: 1.2, neteja: 1.5 };
const PREU_KWH_BASE = 0.18; // Precio base €/kWh para coste

let consumChart = null;

/**
 * Función segura de inicialización.
 * Se asegura de que el HTML esté listo antes de intentar dibujar nada.
 */
function inicialitzarCalculadora() {
    console.log("Initializing simulator...");

    // 1. Vinculamos los eventos de escucha a todos los inputs
    const idsEscucha = [
        'baseElec', 'baseAigua', 'baseOficina', 'baseNeteja',
        'redElec', 'redAigua', 'redPaper', 'redNeteja', 'seasonFilter'
    ];

    idsEscucha.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // "change" para el select, "input" para los sliders y números
            const evento = el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(evento, updateSimulator);
        } else {
            console.warn(`Warning: Element with id '${id}' not found.`);
        }
    });

    // 2. Ejecutamos la primera carga del simulador
    updateSimulator();
}

/**
 * Función principal que orquesta el cálculo y la actualización visual.
 */
function updateSimulator() {
    const season = document.getElementById('seasonFilter').value;
    // Por defecto modo 'custom' para que lea los sliders
    generarInforme('custom', season);
}

/**
 * Procesa los datos y genera los informes (Gráfico y Tarjetas).
 */
function generarInforme(mode, season = 'all') {
    let yearsCPI = 0;

    // 1. Obtener valores Base (Diarios/Mensuales)
    const vBase = {
        elec: parseFloat(document.getElementById('baseElec').value) || 0,
        aigua: parseFloat(document.getElementById('baseAigua').value) || 0,
        paper: parseFloat(document.getElementById('baseOficina').value) || 0,
        neteja: parseFloat(document.getElementById('baseNeteja').value) || 0
    };

    // 2. Obtener multiplicadores de reducción de los sliders
    let red = {
        elec: (100 - (parseFloat(document.getElementById('redElec')?.value) || 0)) / 100,
        aigua: (100 - (parseFloat(document.getElementById('redAigua')?.value) || 0)) / 100,
        paper: (100 - (parseFloat(document.getElementById('redPaper')?.value) || 0)) / 100,
        neteja: (100 - (parseFloat(document.getElementById('redNeteja')?.value) || 0)) / 100
    };

    // Lógica para los botones de preset (Año 1 / Año 3) si se usaran
    if (mode === 'any1') { Object.keys(red).forEach(k => red[k] = 0.88); yearsCPI = 1; }
    if (mode === 'any3') { Object.keys(red).forEach(k => red[k] = 0.70); yearsCPI = 3; }

    const seasonalFactors = [1.2, 1.1, 1.0, 0.5, 1.0, 0.8, 0.3, 0.1, 1.0, 1.1, 1.2, 0.6];

    // 3. Definir qué meses procesar según el filtro estacional
    let indicesMesos = [];
    switch(season) {
        case 'winter': indicesMesos = [11, 0, 1]; break; // Dic, Ene, Feb
        case 'spring': indicesMesos = [2, 3, 4]; break;  // Mar, Abr, May
        case 'summer': indicesMesos = [5, 6, 7]; break;  // Jun, Jul, Ago
        case 'autumn': indicesMesos = [8, 9, 10]; break; // Sep, Oct, Nov
        default: indicesMesos = [0,1,2,3,4,5,6,7,8,9,10,11]; // Todo el año
    }

    let labels = [], dElec = [], dAigua = [], dPaper = [], dNeteja = [], dCost = [];
    let totalAcumulado = { elec: 0, aigua: 0, paper: 0, neteja: 0 };

    // 4. Bucle de cálculo mensual
    indicesMesos.forEach(i => {
        const factor = seasonalFactors[i];

        // Aplicamos factor estacional Y reducción del slider
        const e = (vBase.elec * 30) * factor * red.elec; // Elec base es diaria (*30)
        const a = vBase.aigua * factor * red.aigua;
        const p = vBase.paper * factor * red.paper;
        const n = vBase.neteja * factor * red.neteja;

        // Cálculo de coste (solo Elec para simplificar) con IPC del 3% anual
        const cost = e * (PREU_KWH_BASE * Math.pow(1.03, yearsCPI));

        // Guardar datos para el gráfico
        labels.push(MESOS_NOMS[i]);
        dElec.push(e.toFixed(0));
        dAigua.push(a.toFixed(0));
        dPaper.push(p.toFixed(0));
        dNeteja.push(n.toFixed(0));
        dCost.push(cost.toFixed(2));

        // Acumular totales para las tarjetas
        totalAcumulado.elec += e;
        totalAcumulado.aigua += a;
        totalAcumulado.paper += p;
        totalAcumulado.neteja += n;
    });

    // 5. Actualizar los elementos visuales de forma segura
    dibuixarGrafic(labels, dElec, dAigua, dPaper, dNeteja, dCost);
    renderCards(totalAcumulado, season);
}

/**
 * Dibuja el gráfico multi-línea.
 * Se asegura de que el canvas exista antes de intentar dibujar.
 */
function dibuixarGrafic(labels, dElec, dAigua, dPaper, dNeteja, dCost) {
    const canvas = document.getElementById('graficConsum');

    // Comprobación de seguridad: si el canvas no existe en el DOM, no hacemos nada.
    if (!canvas) {
        console.error("Error: Canvas element 'graficConsum' not found. Cannot draw chart.");
        return;
    }

    const ctx = canvas.getContext('2d');

    // Si ya existe un gráfico, lo destruimos para evitar superposiciones
    if (consumChart) consumChart.destroy();

    // Colores basados en tu imagen de referencia
    const colorElec = '#facc15'; // Amarillo
    const colorAigua = '#3b82f6'; // Azul
    const colorPaper = '#94a3b8'; // Gris
    const colorNeteja = '#f472b6'; // Rosa
    const colorCost = '#10b981'; // Verde

    consumChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Elec (kWh)', data: dElec, borderColor: colorElec, backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Water (m³)', data: dAigua, borderColor: colorAigua, backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Paper (kg)', data: dPaper, borderColor: colorPaper, borderDash: [5, 5], backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Cleaning (L)', data: dNeteja, borderColor: colorNeteja, backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
                { label: 'Total Cost (€)', data: dCost, borderColor: colorCost, backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Importante para que respete el alto del contenedor CSS
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Units' } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Monthly Cost (€)' } }
            }
        }
    });
}

/**
 * Genera las tarjetas de resultados con la comparativa Anual vs Escolar.
 * Añade los iconos de electricidad, agua, papel y limpieza.
 */
function renderCards(res, seasonName) {
    const container = document.getElementById('grid-resultats');
    const co2Display = document.getElementById('co2-val');

    if (!container) return; // Comprobación de seguridad

    const labelExt = seasonName === 'all' ? 'Annual' : 'Seasonal';

    // Cálculo CO2 simplificado basado en Elec y Agua
    const co2Total = (res.elec * FACTORS_CO2.elec) + (res.aigua * FACTORS_CO2.aigua);
    if(co2Display) co2Display.innerHTML = `${(co2Total/1000).toFixed(2)} <span>tons CO2 (${labelExt})</span>`;

    // Configuración de los recursos con sus iconos
    const items = [
        { n: 'Electricity', v: res.elec, u: 'kWh', c: '#facc15', img: '⚡' },
        { n: 'Water', v: res.aigua, u: 'm³', c: '#3b82f6', img: '💧' },
        { n: 'Paper', v: res.paper, u: 'kg', c: '#94a3b8', img: '📄' },
        { n: 'Cleaning', v: res.neteja, u: 'L', c: '#f472b6', img: '🧼' }
    ];

    // Limpiamos y generamos el HTML
    container.innerHTML = items.map(item => {
        // Cálculo del ciclo escolar (aprox 10 meses lectivos si es anual, o proporcional)
        const schoolUsage = seasonName === 'all' ? item.v * (10/12) : item.v * 0.90;

        return `
        <div class="result-card" style="border-bottom-color: ${item.c}; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem; background: rgba(0,0,0,0.03); padding: 10px; border-radius: 12px;">
                ${item.img}
            </div>

            <div style="flex-grow: 1;">
                <h4 style="margin: 0; color: #64748b; font-size: 0.75rem; text-transform: uppercase;">${item.n}</h4>

                <div style="display: flex; gap: 20px; margin-top: 8px;">
                    <div>
                        <div style="font-size: 0.6rem; color: #94a3b8; font-weight: bold;">TOTAL</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: var(--secondary);">
                            ${Math.round(item.v).toLocaleString()} <small style="font-size: 0.8rem; color: #94a3b8;">${item.u}</small>
                        </div>
                    </div>

                    <div style="border-left: 1px solid #e2e8f0; padding-left: 15px;">
                        <div style="font-size: 0.6rem; color: var(--eco-green); font-weight: bold;">SCHOOL USE</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: var(--secondary);">
                            ${Math.round(schoolUsage).toLocaleString()} <small style="font-size: 0.8rem; color: #94a3b8;">${item.u}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Vinculamos la inicialización al evento onload del navegador.
// Esto soluciona el problema de que el gráfico no cargue a veces.
window.onload = inicialitzarCalculadora;