/**
 * ITB SUSTAINABLE — js/calculadora.js (Dashboard Redesign)
 * Phase 3 · Group 7: Walid & Roger
 */

'use strict';

const DATA_PATH = 'assets/dataclean1.json';

const BASE_DEFAULTS = { elec: 4078.8, water: 119.7, paper: 70.2, clean: 34.7 };

const RAW_PROFILES = {
    //          Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct   Nov   Dec
    elec:  [1.10, 1.55, 1.20, 0.95, 0.85, 0.90, 0.45, 0.12, 1.05, 1.10, 1.15, 1.55],
    water: [0.62, 0.64, 0.78, 0.93, 1.08, 1.28, 1.48, 1.42, 1.06, 0.88, 0.75, 0.68],
    paper: [0.85, 0.90, 0.95, 0.90, 1.00, 1.30, 0.20, 0.10, 1.40, 1.05, 0.95, 0.40],
    clean: [0.90, 0.90, 0.95, 0.95, 0.95, 1.20, 0.40, 0.25, 1.35, 1.05, 0.95, 1.15]
};

const SEASONAL = Object.fromEntries(
    Object.entries(RAW_PROFILES).map(([k, raw]) => {
        const avg = raw.reduce((a, b) => a + b, 0) / raw.length;
        return [k, raw.map(v => v / avg)];
    })
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SCHOOL_MONTHS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];

const CO2 = { elec: 0.2165, water: 0.910, paper: 1.200, clean: 1.500 };

const MEASURES = [
    { id:'m1', year:1, faIcon:'fa-solid fa-wifi',               title:'IoT Energy Audit',          tooltip:'Smart sensors detect phantom loads and optimise HVAC scheduling across all classrooms and server rooms.',            color:'#3b5bdb', elec:0.04, water:0,    paper:0,    clean:0    },
    { id:'m2', year:1, faIcon:'fa-solid fa-lightbulb',          title:'LED + Motion Sensors',       tooltip:'High-efficiency LED fixtures and PIR occupancy sensors cut lighting consumption by 9% — ROI under 2 years.',       color:'#e67700', elec:0.09, water:0,    paper:0,    clean:0    },
    { id:'m3', year:1, faIcon:'fa-solid fa-server',             title:'Smart Server Management',    tooltip:'VM consolidation + Wake-on-LAN scripts reduce physical hosts by 40% with zero impact on teaching quality.',        color:'#7048e8', elec:0.04, water:0,    paper:0,    clean:0    },
    { id:'m4', year:2, faIcon:'fa-solid fa-solar-panel',        title:'Solar Panel Expansion',      tooltip:'Expanding the rooftop PV array adds ~25 kWp to cover 13% of annual electricity demand (RD 244/2019).',             color:'#f76707', elec:0.13, water:0,    paper:0,    clean:0    },
    { id:'m5', year:2, faIcon:'fa-solid fa-screwdriver-wrench', title:'Right to Repair Workshop',   tooltip:'ASIX students repair school hardware weekly, extending device life and reducing e-waste and paper admin by 5%.',    color:'#2f9e44', elec:0,    water:0,    paper:0.05, clean:0    },
    { id:'m6', year:2, faIcon:'fa-solid fa-file-circle-check',  title:'Document Digitalisation',    tooltip:'Full digital-first workflow via Google Workspace eliminates printed exams, minutes and forms. Target: −40% paper.', color:'#495057', elec:0,    water:0,    paper:0.40, clean:0    },
    { id:'m7', year:3, faIcon:'fa-solid fa-cloud-rain',         title:'Rainwater Harvesting',       tooltip:'8,000 L underground tank collects Barcelona rainfall for irrigation and outdoor cleaning — covers 12% of water.',   color:'#1971c2', elec:0,    water:0.12, paper:0,    clean:0    },
    { id:'m8', year:3, faIcon:'fa-solid fa-faucet-drip',        title:'High-Efficiency Aerators',   tooltip:'4 L/min aerating inserts on 40+ taps and dual-flush toilets. Payback under 6 months. Saves 18% of mains water.',   color:'#0891b2', elec:0,    water:0.18, paper:0,    clean:0    },
    { id:'m9', year:3, faIcon:'fa-solid fa-leaf',               title:'Eco-Label Cleaning',         tooltip:'EU Eco-Label concentrates (1:30–1:50) reduce volume purchased by 40% with AENOR-certified compliance.',            color:'#c2185b', elec:0,    water:0,    paper:0,    clean:0.40 }
];

/* ─── STATE ──────────────────────────────────────────────────────── */
const active = new Set();
let chartElec = null, chartWater = null;
let currentYear = 0; // 0 = Now, 1 = Year1, 2 = Year2, 3 = Year3

/* ─── YEAR SELECTOR ──────────────────────────────────────────────── */
const YEAR_INFO = [
    'No measures active — baseline consumption',
    'Year 1 · IoT Audit + LED + Server Management active',
    'Year 2 · + Solar Panels + Repair Workshop + Digitalisation',
    'Year 3 · Full plan · All 9 measures active'
];

window.setYear = function(year) {
    currentYear = year;

    // Update active buttons
    document.querySelectorAll('.year-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.year) === year);
    });

    // Update info text
    const info = document.getElementById('yearInfo');
    if (info) info.textContent = YEAR_INFO[year];

    // Activate measures up to selected year
    active.clear();
    MEASURES.forEach(m => {
        if (m.year <= year) active.add(m.id);
    });

    updateAll();
};

/* ─── HELPERS ────────────────────────────────────────────────────── */
function getBase() {
    const read = (id, def) => { const el = document.getElementById(id); if (!el) return def; const v = parseFloat(el.value); return (isFinite(v) && v >= 0) ? v : def; };
    return { elec: read('baseElec', BASE_DEFAULTS.elec), water: read('baseWater', BASE_DEFAULTS.water), paper: read('basePaper', BASE_DEFAULTS.paper), clean: read('baseClean', BASE_DEFAULTS.clean) };
}

function monthlyProfile(b, p) { return p.map(f => +(b * f).toFixed(2)); }
function sumYear(m) { return +m.reduce((a, b) => a + b, 0).toFixed(1); }
function sumSchoolYear(m) { return +SCHOOL_MONTHS.reduce((acc, i) => acc + m[i], 0).toFixed(1); }
function applyReduction(m, f) { return m.map(v => +(v * (1 - f)).toFixed(2)); }
function calcReductions() {
    const r = { elec:0, water:0, paper:0, clean:0 };
    active.forEach(id => { const m = MEASURES.find(x => x.id === id); if (m) { r.elec += m.elec; r.water += m.water; r.paper += m.paper; r.clean += m.clean; } });
    return r;
}
const fmt = (v, d = 0) => parseFloat(v).toLocaleString('en-GB', { maximumFractionDigits: d });

function compute8(base, red) {
    return Object.fromEntries(['elec','water','paper','clean'].map(k => {
        const monthly = monthlyProfile(base[k], SEASONAL[k]);
        const monthlyPlan = applyReduction(monthly, red[k]);
        const annual = sumYear(monthly), schoolYear = sumSchoolYear(monthly);
        const annualPlan = sumYear(monthlyPlan), schoolYearPlan = sumSchoolYear(monthlyPlan);
        return [k, { monthly, monthlyPlan, annual, schoolYear, annualPlan, schoolYearPlan, savedAnnual: +(annual - annualPlan).toFixed(1), savedSchool: +(schoolYear - schoolYearPlan).toFixed(1), reductPct: +(red[k] * 100).toFixed(0) }];
    }));
}

/* ─── RES META ───────────────────────────────────────────────────── */
const RES_META = {
    elec:  { color:'#e67700', label:'Electricity', unit:'kWh', icon:'fa-solid fa-bolt' },
    water: { color:'#1971c2', label:'Water',        unit:'m³',  icon:'fa-solid fa-droplet' },
    paper: { color:'#495057', label:'Paper',        unit:'kg',  icon:'fa-solid fa-file' },
    clean: { color:'#c2185b', label:'Cleaning',     unit:'L',   icon:'fa-solid fa-spray-can-sparkles' }
};

/* ─── RENDERERS ──────────────────────────────────────────────────── */
function renderProgress(red) {
    const pct = Math.min((red.elec * 0.45 + red.water * 0.25 + red.paper * 0.20 + red.clean * 0.10) * 100, 100);
    const el = document.getElementById('progPct'); if (el) el.textContent = `${pct.toFixed(1)}%`;
    const bar = document.getElementById('progBar'); if (bar) bar.style.width = `${Math.min(pct / 30 * 100, 100)}%`;
    const foot = document.getElementById('progFoot'); if (foot) foot.textContent = `${active.size} / 9 active`;
}

function renderMeasures() {
    const list = document.getElementById('measuresList');
    if (!list) return;
    list.innerHTML = '';
    MEASURES.forEach(m => {
        const on = active.has(m.id);
        const impacts = [m.elec>0?`⚡ −${(m.elec*100).toFixed(0)}%`:null, m.water>0?`💧 −${(m.water*100).toFixed(0)}%`:null, m.paper>0?`📄 −${(m.paper*100).toFixed(0)}%`:null, m.clean>0?`🧼 −${(m.clean*100).toFixed(0)}%`:null].filter(Boolean).join(' · ');
        const el = document.createElement('div');
        el.className = `measure-item${on ? ' on' : ''}`;
        el.style.setProperty('--mc', m.color);
        el.setAttribute('role', 'switch');
        el.setAttribute('aria-checked', String(on));
        el.setAttribute('tabindex', '0');
        el.innerHTML = `
            <div class="m-icon"><i class="${m.faIcon}"></i></div>
            <div class="m-main">
                <div class="m-title">${m.title}</div>
                <div class="m-meta">
                    <span class="m-badge">${impacts}</span>
                    <span class="year-chip y${m.year}">Y${m.year}</span>
                </div>
            </div>
            <div class="toggle"></div>
            <div class="m-tooltip">${m.tooltip}</div>`;
        const toggle = () => {
            active.has(m.id) ? active.delete(m.id) : active.add(m.id);
            // Reset year selector to manual mode when toggling individually
            currentYear = -1;
            document.querySelectorAll('.year-btn').forEach(btn => btn.classList.remove('active'));
            const info = document.getElementById('yearInfo');
            if (info) info.textContent = `${active.size} measure${active.size !== 1 ? 's' : ''} manually selected`;
            updateAll();
        };
        el.onclick = toggle;
        el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
        list.appendChild(el);
    });
}

function renderKPIs(calcs) {
    const panel = document.getElementById('kpiPanel');
    if (!panel) return;
    panel.innerHTML = Object.entries(RES_META).map(([k, m]) => {
        const d = calcs[k], hp = d.reductPct > 0;
        return `<div class="kpi-box" style="--kb-color:${m.color}"><div class="kb-period">Full Year</div><div class="kb-val">${fmt(d.annual)} <span class="kb-unit">${m.unit}</span></div>${hp ? `<div class="kb-plan">Plan: ${fmt(d.annualPlan)} · −${fmt(d.savedAnnual)}</div>` : ''}</div>
        <div class="kpi-box" style="--kb-color:${m.color}"><div class="kb-period">School Year</div><div class="kb-val">${fmt(d.schoolYear)} <span class="kb-unit">${m.unit}</span></div>${hp ? `<div class="kb-plan">Plan: ${fmt(d.schoolYearPlan)} · −${fmt(d.savedSchool)}</div>` : ''}</div>`;
    }).join('');
}

function renderResultCards(calcs) {
    const grid = document.getElementById('resultsGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(RES_META).map(([k, m]) => {
        const d = calcs[k];
        return `<div class="res-card" style="--rc-color:${m.color}"><div class="rc-lbl"><i class="${m.icon}"></i> ${m.label}</div><div class="rc-val">${fmt(d.annual)} <span class="rc-unit">${m.unit}/yr</span></div><div class="rc-saving${d.reductPct > 0 ? '' : ' zero'}">${d.reductPct > 0 ? `−${d.reductPct}% · Save ${fmt(d.savedAnnual)} ${m.unit}/yr` : 'No reduction active'}</div></div>`;
    }).join('');
}

function renderCO2(calcs) {
    const el = document.getElementById('co2Block');
    if (!el) return;
    const co2Base = Object.keys(CO2).reduce((s, k) => s + calcs[k].annual * CO2[k], 0) / 1000;
    const co2Plan = Object.keys(CO2).reduce((s, k) => s + calcs[k].annualPlan * CO2[k], 0) / 1000;
    const saving = +(co2Base - co2Plan).toFixed(2);
    if (saving > 0) {
        el.style.flexDirection = 'row';
        el.innerHTML = `<div><div class="co2-lbl">Carbon Footprint / Year</div><div class="co2-val">${co2Plan.toFixed(2)}</div><div class="co2-unit">tonnes CO₂</div></div><div class="co2-right"><div style="font-family:'JetBrains Mono',monospace;font-size:0.52rem;opacity:0.45;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Saved vs. baseline</div><div class="co2-saved-num">−${saving.toFixed(2)} t</div><div class="co2-saved-lbl">tonnes CO₂ avoided / year</div></div>`;
    } else {
        el.style.flexDirection = 'column'; el.style.textAlign = 'center';
        el.innerHTML = `<div><div class="co2-val">${co2Base.toFixed(2)} <span style="font-size:1.2rem;opacity:0.6;margin-left:3px;">t</span></div><div class="co2-lbl" style="margin-top:5px;opacity:0.7;">Annual estimated CO₂ emissions</div><div style="font-size:0.78rem;font-weight:600;color:#4ade80;margin-top:0.5rem;">Activate measures above to reduce impact</div></div>`;
    }
}

function renderChartBadges(calcs) {
    const eb = document.getElementById('elecSavingBadge');
    if (eb) { eb.textContent = calcs.elec.reductPct > 0 ? `−${calcs.elec.reductPct}% saved` : 'No reduction'; }
    const wb = document.getElementById('waterSavingBadge');
    if (wb) { wb.textContent = calcs.water.reductPct > 0 ? `−${calcs.water.reductPct}% saved` : 'No reduction'; }
    const ea = document.getElementById('elecAnnual'); if (ea) ea.textContent = `${fmt(calcs.elec.annual)} kWh`;
    const ep = document.getElementById('elecPlan');   if (ep) ep.textContent = `${fmt(calcs.elec.annualPlan)} kWh`;
    const wa = document.getElementById('waterAnnual'); if (wa) wa.textContent = `${fmt(calcs.water.annual)} m³`;
    const wp = document.getElementById('waterPlan');   if (wp) wp.textContent = `${fmt(calcs.water.annualPlan)} m³`;
}

/* ─── CHART PLUGINS ──────────────────────────────────────────────── */

// Plugin para fondo BLANCO en el área del gráfico
const whiteBgPlugin = {
    id: 'whiteBg',
    beforeDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
        ctx.restore();
    }
};

const fillBetweenPlugin = {
    id: 'fillBetween',
    beforeDatasetsDraw(chart) {
        const { ctx: c } = chart;
        const ds0 = chart.getDatasetMeta(0), ds1 = chart.getDatasetMeta(1);
        if (!ds0.data.length || !ds1.data.length) return;
        c.save(); c.beginPath();
        ds0.data.forEach((pt, i) => i === 0 ? c.moveTo(pt.x, pt.y) : c.lineTo(pt.x, pt.y));
        for (let i = ds1.data.length - 1; i >= 0; i--) c.lineTo(ds1.data[i].x, ds1.data[i].y);
        c.closePath(); c.fillStyle = 'rgba(74,222,128,0.15)'; c.fill(); c.restore();
    }
};

function axisConfig(unit) {
    return {
        x: {
            grid: { color: '#eef1f7' },
            ticks: { font: { size: 10, family: "'JetBrains Mono', monospace" }, color: '#9aacbf' }
        },
        y: {
            beginAtZero: false,
            grid: { color: '#eef1f7' },
            ticks: { font: { size: 10, family: "'JetBrains Mono', monospace" }, color: '#9aacbf', callback: v => v + ' ' + unit }
        }
    };
}

function tooltipConfig(unit) {
    return {
        backgroundColor: '#0d1f4e', titleColor: '#9aacbf', bodyColor: '#e2e8f0', padding: 10, cornerRadius: 8,
        callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} ${unit}`,
            afterBody: items => { if (items.length < 2) return []; const diff = +(items[0].parsed.y - items[1].parsed.y).toFixed(unit === 'm³' ? 2 : 1); return diff > 0 ? ['', `  Saved: ${diff} ${unit}`] : []; }
        }
    };
}

function updateChartElec(base, plan) {
    const canvas = document.getElementById('chartElec'); if (!canvas) return;
    if (chartElec) {
        chartElec.data.datasets[0].data = base;
        chartElec.data.datasets[1].data = plan;
        chartElec.update('active');
        return;
    }
    chartElec = new Chart(canvas.getContext('2d'), {
        type: 'line',
        plugins: [whiteBgPlugin, fillBetweenPlugin],
        data: { labels: MONTHS, datasets: [
            { label: 'Baseline',      data: base, borderColor: '#fcc419', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#fcc419', pointBorderColor: '#fcc419', tension: 0.4, fill: false },
            { label: 'With measures', data: plan, borderColor: '#51cf66', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#51cf66', pointBorderColor: '#51cf66', fill: false, tension: 0.4 }
        ]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300, easing: 'easeInOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false }, tooltip: tooltipConfig('kWh') },
            scales: axisConfig('kWh')
        }
    });
}

function updateChartWater(base, plan) {
    const canvas = document.getElementById('chartWater'); if (!canvas) return;
    if (chartWater) {
        chartWater.data.datasets[0].data = base;
        chartWater.data.datasets[1].data = plan;
        chartWater.update('active');
        return;
    }
    chartWater = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: MONTHS, datasets: [
            { label: 'Baseline',      data: base, backgroundColor: 'rgba(116,192,252,0.5)', borderColor: '#339af0', borderWidth: 1.5, borderRadius: 4 },
            { label: 'With measures', data: plan, backgroundColor: 'rgba(81,207,102,0.45)',  borderColor: '#51cf66', borderWidth: 1.5, borderRadius: 4 }
        ]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300, easing: 'easeInOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false }, tooltip: tooltipConfig('m³') },
            scales: axisConfig('m³')
        }
    });
}

/* ─── MASTER UPDATE ──────────────────────────────────────────────── */
function updateAll() {
    const base = getBase(), red = calcReductions(), calcs = compute8(base, red);
    renderProgress(red);
    renderMeasures();
    renderKPIs(calcs);
    renderResultCards(calcs);
    renderCO2(calcs);
    renderChartBadges(calcs);
    updateChartElec(calcs.elec.monthly, calcs.elec.monthlyPlan);
    updateChartWater(calcs.water.monthly, calcs.water.monthlyPlan);
}

async function loadJSON() {
    try { const r = await fetch(DATA_PATH); if (!r.ok) throw new Error(`HTTP ${r.status}`); const data = await r.json(); console.info('[ITB] Data loaded:', data.project); }
    catch (e) { console.warn('[ITB] Standalone mode:', e.message); }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadJSON();
    ['baseElec','baseWater','basePaper','baseClean'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', updateAll); });
    updateAll();
});

window.ITBCalc = {
    activateAll: () => { MEASURES.forEach(m => active.add(m.id)); updateAll(); },
    resetAll:    () => { active.clear(); updateAll(); },
    getActiveCount: () => active.size
};