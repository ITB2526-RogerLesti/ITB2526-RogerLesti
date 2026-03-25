/**
 * ITB Energy Calculator Logic
 * Authors: Roger & Walid
 */

function calculate() {
    const energyInput = parseFloat(document.getElementById('inputElec').value) || 0;
    const waterInput = parseFloat(document.getElementById('inputWater').value) || 0;
    const resultsGrid = document.getElementById('resultsGrid');

    // The 8 calculations required for Phase 3
    const dataModels = [
        {
            label: "Energy (Next Year)",
            val: (energyInput * 12 * 1.05).toFixed(0),
            unit: "kWh",
            info: "Estimated with a 5% annual growth trend."
        },
        {
            label: "Energy (Academic Term)",
            val: (energyInput * 10 * 1.15).toFixed(0),
            unit: "kWh",
            info: "Winter heating and PC usage peaks (+15%)."
        },
        {
            label: "Water (Next Year)",
            val: (waterInput * 12).toFixed(0),
            unit: "L",
            info: "Based on monthly historical consumption."
        },
        {
            label: "Water (Academic Term)",
            val: (waterInput * 10 * 1.25).toFixed(0),
            unit: "L",
            info: "Higher consumption during warm months (+25%)."
        },
        {
            label: "Supplies (Yearly)",
            val: "850",
            unit: "€",
            info: "Fixed office supplies (Lyreco F036 invoice)."
        },
        {
            label: "Supplies (Term)",
            val: "780",
            unit: "€",
            info: "90% of consumables used during school months."
        },
        {
            label: "Cleaning (Yearly)",
            val: "2400",
            unit: "€",
            info: "Annual maintenance service (Neteges F055)."
        },
        {
            label: "Cleaning (Term)",
            val: "2100",
            unit: "€",
            info: "Standard school term cleaning frequency."
        }
    ];

    resultsGrid.innerHTML = '';

    dataModels.forEach(item => {
        resultsGrid.innerHTML += `
            <div class="glass-card p-6 rounded-2xl">
                <h4 class="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">${item.label}</h4>
                <div class="text-2xl font-black text-emerald-600">
                    ${item.val} <span class="text-xs font-normal text-gray-400">${item.unit}</span>
                </div>
                <p class="text-[10px] text-gray-500 mt-2 italic leading-tight">${item.info}</p>
            </div>
        `;
    });
}

// Initial calculation on load
document.addEventListener('DOMContentLoaded', calculate);