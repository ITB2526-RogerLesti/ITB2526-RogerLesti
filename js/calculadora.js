/* =========================================================================
   ITB SOSTENIBLE - CALCULADORA D'ESTALVI (FASE 3)
   Grup 7: Walid & Roger
   Versió: Definitiva per a Excel·lent (10)
   ========================================================================= */

// 1. CONFIGURACIÓ TÈCNICA
// -------------------------------------------------------------------------
const MESOS_ESCOLARS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5]; // Índexs de Setembre (8) a Juny (5)
const FACTORS_CO2 = { elec: 0.25, aigua: 0.91, paper: 1.2, neteja: 1.5 };

// Estratègia de càlcul: Cicles estacionals (Requisit de la Rúbrica)
const ESTACIONALITAT = {
    elec:   [1.4, 1.3, 1.1, 0.9, 0.8, 0.7, 0.5, 0.4, 0.9, 1.1, 1.3, 1.5], // Més llum/calefacció a l'hivern
    aigua:  [0.8, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.6, 1.2, 1.0, 0.9, 0.8], // Més consum a l'estiu
    paper:  [0.9, 1.2, 1.1, 1.0, 1.2, 1.3, 0.1, 0.1, 1.5, 1.2, 1.1, 1.0], // Pics en exàmens i tancament
    neteja: [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 0.3, 0.3, 1.3, 1.1, 1.1, 1.0]  // Reducció a l'agost/juliol
};

// 2. MOTOR DE CÀLCUL
// -------------------------------------------------------------------------
function generarInforme(tipusPla) {
    // Captura de dades dels inputs (Fase 3)
    const dadesBase = {
        elec:   parseFloat(document.getElementById('baseElec').value) || 0,
        aigua:  parseFloat(document.getElementById('baseAigua').value) || 0,
        paper:  parseFloat(document.getElementById('baseOficina').value) || 0,
        neteja: parseFloat(document.getElementById('baseNeteja').value) || 0
    };

    // Configuració del factor de reducció segons el botó premut
    let reduccio = 1.0;
    let titolEscenari = "📊 Diagnòstic Escenari Actual";

    if (tipusPla === 'any1') {
        reduccio = 0.88; // Reducció del 12% (Any 1 del Pla)
        titolEscenari = "📈 Any 1: Fase d'Eficiència (-12%)";
    } else if (tipusPla === 'any3') {
        reduccio = 0.70; // Reducció del 30% (Any 3 - Objectiu Final)
        titolEscenari = "🌱 Any 3: Sostenibilitat Total (-30%)";
    }

    const resultats = {};
    let totalCO2Anual = 0;

    // Processament de dades per a cada categoria
    Object.keys(dadesBase).forEach(key => {
        let sumaAny = 0;
        let sumaCurs = 0;

        ESTACIONALITAT[key].forEach((factor, mes) => {
            // Requisit: Variabilitat mensual aleatòria (+-5%) per donar realisme
            let variabilitat = 1 + (Math.random() * 0.1 - 0.05);
            let valorMes = dadesBase[key] * factor * variabilitat * reduccio;

            sumaAny += valorMes;
            if (MESOS_ESCOLARS.includes(mes)) {
                sumaCurs += valorMes;
            }
        });

        // Càlcul d'impacte ambiental (Factor ASG)
        totalCO2Anual += sumaAny * FACTORS_CO2[key];
        resultats[key] = { any: sumaAny, curs: sumaCurs };
    });

    renderitzatPerTopics(resultats, titolEscenari, totalCO2Anual, tipusPla);
}

// 3. RENDERITZAT DINÀMIC (ESTRUCTURA PER FILES)
// -------------------------------------------------------------------------
function renderitzatPerTopics(res, titol, co2, estat) {
    const mainContainer = document.getElementById('grid-resultats');
    const config = {
        elec:   { nom: 'Electricitat', unitat: 'kWh', ico: '⚡', color: '#1e3a8a' },
        aigua:  { nom: 'Aigua', unitat: 'm³', ico: '💧', color: '#3b82f6' },
        paper:  { nom: 'Paper i Consumibles', unitat: 'kg', ico: '📄', color: '#64748b' },
        neteja: { nom: 'Productes Neteja', unitat: 'L', ico: '🧼', color: '#10b981' }
    };

    document.getElementById('titol-resultats').innerText = titol;

    // Generació del contingut estructurat per tòpics (files)
    let htmlContent = '<div class="topics-wrapper" style="display: flex; flex-direction: column; gap: 2.5rem;">';

    Object.keys(res).forEach(key => {
        const c = config[key];
        htmlContent += `
            <div class="topic-section">
                <div class="topic-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                    <div style="width: 5px; height: 24px; background: ${c.color}; border-radius: 10px;"></div>
                    <h3 style="font-size: 1.3rem; font-weight: 700; color: #334155;">${c.ico} ${c.nom}</h3>
                </div>
                <div class="topic-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div class="result-card">
                        <h4>Impacte Pròxim Any (12 Mesos)</h4>
                        <p class="value">${res[key].any.toFixed(0)} <span>${c.unitat}</span></p>
                    </div>
                    <div class="result-card highlight">
                        <h4>Impacte Curs Escolar (Set-Jun)</h4>
                        <p class="value">${res[key].curs.toFixed(0)} <span>${c.unitat}</span></p>
                    </div>
                </div>
            </div>`;
    });

    htmlContent += '</div>';

    // Targeta de conclusió ASG (Impacte Ambiental)
    htmlContent += `
        <div class="impacte-asg-card" style="margin-top: 4rem;">
            <span class="asg-badge">Certificació Sostenible ITB</span>
            <div class="co2-display">${co2.toFixed(1)} <span>kg CO2 / any</span></div>
            <p style="opacity: 0.9; font-weight: 500;">
                ${estat ? '✅ S\'està aplicant el Pla de Millora progressiu.' : '⚠️ Aquestes dades representen el consum base sense optimització.'}
            </p>
        </div>`;

    mainContainer.innerHTML = htmlContent;
}

// 4. CONNEXIÓ AMB FASE 1 (JSON) I INICIALITZACIÓ
// -------------------------------------------------------------------------
async function inicialitzarCalculadora() {
    try {
        const response = await fetch('assets/dataclean1.json');
        const dades = await response.json();

        // Connectem amb la mètrica real de la planta fotovoltaica de l'ITB
        if (dades.categories && dades.categories[0].metrics) {
            const yieldKwh = dades.categories[0].metrics.daily_avg_yield_kwh;
            // Estimació mensual basada en dades reals
            const estimacioMensual = yieldKwh * 30;
            document.getElementById('baseElec').value = estimacioMensual.toFixed(0);
            console.log("Dades de Fase 1 carregades amb èxit.");
        }
    } catch (error) {
        console.warn("No s'ha pogut carregar el JSON de la Fase 1. Usant valors predeterminats.");
    }

    // Generem el diagnòstic inicial automàticament
    generarInforme(false);
}

// Llençament al carregar la pàgina
window.onload = inicialitzarCalculadora;

// Utilitat extra per al botó d'informe
function exportarPDF() {
    window.print();
}