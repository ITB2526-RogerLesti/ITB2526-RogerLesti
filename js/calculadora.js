/* =========================================================================
   ITB SOSTENIBLE - CALCULADORA AMB ACTUALITZACIÓ EN TEMPS REAL
   ========================================================================= */

const MESOS_CURS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
const FACTORS_CO2 = { elec: 0.25, aigua: 0.91, paper: 1.2, neteja: 1.5 };

let dadesITB = [];

// 1. AQUESTA ÉS LA FUNCIÓ QUE HAS DE SUBSTITUIR
async function inicialitzarCalculadora() {
    // Valors inicials per si el JSON triga a carregar
    document.getElementById('baseElec').value = 164.8;
    document.getElementById('baseAigua').value = 145;
    document.getElementById('baseOficina').value = 85;
    document.getElementById('baseNeteja').value = 42;

    try {
        const res = await fetch('assets/dataclean1.json');
        const data = await res.json();
        dadesITB = data.mesos;

        // Si el JSON ha carregat bé, actualitzem els inputs amb la dada del Gener
        if (dadesITB && dadesITB.length > 0) {
            document.getElementById('baseElec').value = (dadesITB[0].elec / 30).toFixed(1);
            document.getElementById('baseAigua').value = dadesITB[0].aigua;
            document.getElementById('baseOficina').value = dadesITB[0].paper;
            document.getElementById('baseNeteja').value = dadesITB[0].neteja;
        }
    } catch (e) {
        console.warn("⚠️ No s'ha pogut carregar el JSON, usant valors de seguretat.");
        // Dades per defecte si falla el fitxer extern
        dadesITB = Array(12).fill({ elec: 4500, aigua: 145, paper: 85, neteja: 42 });
    }

    // --- LA MILLORA PERQUÈ S'ACTUALITZI EN TEMPS REAL ---
    const ids = ['baseElec', 'baseAigua', 'baseOficina', 'baseNeteja'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            // Cada vegada que l'usuari canvia un número, es torna a calcular tot
            generarInforme(false);
        });
    });

    generarInforme(false);
}

// 2. MOTOR DE CÀLCUL MODIFICAT PER LLEGIR ELS INPUTS EN TEMPS REAL
function generarInforme(tipusPla) {
    let reduccio = 1.0;
    let titol = "📊 Diagnòstic Escenari Actual";

    if (tipusPla === 'any1') { reduccio = 0.88; titol = "📈 Any 1 (-12%)"; }
    if (tipusPla === 'any3') { reduccio = 0.70; titol = "🌱 Any 3 (-30%)"; }

    // Llegim el que hi ha escrit actualment als quadrets blancs
    const vElec = parseFloat(document.getElementById('baseElec').value) || 0;
    const vAigua = parseFloat(document.getElementById('baseAigua').value) || 0;
    const vPaper = parseFloat(document.getElementById('baseOficina').value) || 0;
    const vNeteja = parseFloat(document.getElementById('baseNeteja').value) || 0;

    const totals = {
        elec: { any: 0, curs: 0 },
        aigua: { any: 0, curs: 0 },
        paper: { any: 0, curs: 0 },
        neteja: { any: 0, curs: 0 }
    };

    // Fem el càlcul basat en els inputs manuals
    // (Aquesta part simula la corba de consum anual multiplicant l'input pel factor de cada mes)
    const factorsMensuals = [1.2, 1.1, 1.0, 0.9, 0.8, 1.0, 0.5, 0.3, 0.9, 1.1, 1.2, 1.2];

    factorsMensuals.forEach((f, i) => {
        const e = (vElec * 30) * f * reduccio;
        const a = vAigua * f * reduccio;
        const p = vPaper * f * reduccio;
        const n = vNeteja * f * reduccio;

        totals.elec.any += e; totals.aigua.any += a;
        totals.paper.any += p; totals.neteja.any += n;

        if (MESOS_CURS.includes(i)) {
            totals.elec.curs += e; totals.aigua.curs += a;
            totals.paper.curs += p; totals.neteja.curs += n;
        }
    });

    const co2 = (totals.elec.any * FACTORS_CO2.elec) + (totals.aigua.any * FACTORS_CO2.aigua);
    renderitza(totals, titol, co2, tipusPla);
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
        <div style="background:white; padding:1rem; border-radius:12px; margin-bottom:1rem; border-left:6px solid ${conf.c}; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
            <h3 style="margin-top:0">${conf.i} ${conf.n}</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div><small>ANUAL</small><br><strong>${res[k].any.toFixed(0)} ${conf.u}</strong></div>
                <div style="color:#166534"><small>CURS</small><br><strong>${res[k].curs.toFixed(0)} ${conf.u}</strong></div>
            </div>
        </div>`;
    });

    html += `<div style="background:linear-gradient(135deg,#1e3a8a,#10b981); color:white; padding:1.5rem; border-radius:12px; text-align:center; margin-top:1rem;">
        <div style="font-size:1.8rem; font-weight:900">${(co2/1000).toFixed(2)} Tones CO2/any</div>
    </div>`;

    container.innerHTML = html;
}

window.onload = inicialitzarCalculadora;