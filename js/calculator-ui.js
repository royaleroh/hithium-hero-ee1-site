// js/calculator-ui.js
// ─────────────────────────────────────────────────────────────────────────────
// Calculator section: appliance list, preset loading, results rendering
// and WhatsApp / checkout actions.
// ─────────────────────────────────────────────────────────────────────────────

import { appliances }        from '../data/appliances.js';
import { presets }           from '../data/presets.js';
import { product, DEFAULT_MONTHLY_POWER_SPEND } from '../data/product.js';
import { calculateEstimate } from './calculate.js';
import { formatNaira, formatNumber } from './format.js';
import { sendLead }          from './leads.js';
import { WHATSAPP_NUMBER }   from '../config.js';

// ─── State ───────────────────────────────────────────────────────────────────
let state = {
  // Map of applianceId -> { qty, hours, enabled }
  items: Object.fromEntries(
    appliances.map(a => [a.id, { qty: 1, hours: 4, enabled: false }])
  ),
  monthlyPowerSpend: null,
  dailyOutageHours: null,
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const applianceList   = document.getElementById('appliance-list');
const resultsPanel    = document.getElementById('calc-results');
const resultRuntime   = document.getElementById('result-runtime');
const resultFit       = document.getElementById('result-fit');
const resultFitSub    = document.getElementById('result-fit-sub');
const resultCost      = document.getElementById('result-cost');
const resultCostSub   = document.getElementById('result-cost-sub');
const resultEmpty     = document.getElementById('result-empty');
const resultCards     = document.getElementById('result-cards');
const workingsBody    = document.getElementById('workings-body');
const spendInput      = document.getElementById('monthly-spend');
const outageInput     = document.getElementById('daily-outage');
const whatsappBtn     = document.getElementById('btn-whatsapp');
const checkoutBtn     = document.getElementById('btn-checkout');
const calcPresetLabel = document.getElementById('calc-preset-label');

// Compare section refs
const compareMonthly  = document.getElementById('compare-monthly');
const compareUnitCost = document.getElementById('compare-unit-cost');
const comparePayback  = document.getElementById('compare-payback');
const compareNote     = document.getElementById('compare-note');

// ─── Build appliance rows ─────────────────────────────────────────────────────
function buildApplianceList() {
  if (!applianceList) return;
  applianceList.innerHTML = '';

  appliances.forEach(a => {
    const row = document.createElement('div');
    row.className = 'appliance-row';
    row.id = `row-${a.id}`;

    const s = state.items[a.id];

    row.innerHTML = `
      <input
        type="checkbox"
        id="chk-${a.id}"
        class="appliance-checkbox"
        aria-label="Include ${a.label}"
        ${s.enabled ? 'checked' : ''}
      />
      <div>
        <label for="chk-${a.id}" class="appliance-label">
          <span aria-hidden="true">${a.icon}</span> ${a.label}
        </label>
        <div class="appliance-watts">${a.watts} W${a.surgeMultiplier > 1 ? ` · surge ×${a.surgeMultiplier}` : ''}</div>
      </div>
      <div class="qty-stepper" aria-label="Quantity for ${a.label}">
        <button type="button" aria-label="Decrease quantity" data-id="${a.id}" data-action="dec">−</button>
        <span class="qty-value" id="qty-val-${a.id}">${s.qty}</span>
        <button type="button" aria-label="Increase quantity" data-id="${a.id}" data-action="inc">+</button>
      </div>
      <div>
        <label for="hrs-${a.id}" class="visually-hidden">Hours per day for ${a.label}</label>
        <input
          type="number"
          id="hrs-${a.id}"
          class="hours-input"
          min="0"
          max="24"
          step="0.5"
          value="${s.hours}"
          aria-label="Hours per day"
        />
      </div>
    `;

    // Checkbox
    const chk = row.querySelector(`#chk-${a.id}`);
    chk.addEventListener('change', () => {
      state.items[a.id].enabled = chk.checked;
      updateResults();
    });

    // Qty stepper
    row.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const action = btn.dataset.action;
        let qty = state.items[id].qty;
        if (action === 'inc') qty = Math.min(qty + 1, 20);
        if (action === 'dec') qty = Math.max(qty - 1, 1);
        state.items[id].qty = qty;
        row.querySelector(`#qty-val-${id}`).textContent = qty;
        if (state.items[id].enabled) updateResults();
      });
    });

    // Hours input
    const hrsInput = row.querySelector(`#hrs-${a.id}`);
    hrsInput.addEventListener('input', () => {
      const val = parseFloat(hrsInput.value);
      state.items[a.id].hours = isNaN(val) ? 0 : Math.min(Math.max(val, 0), 24);
      if (state.items[a.id].enabled) updateResults();
    });

    applianceList.appendChild(row);
  });
}

// ─── Build selections from state ──────────────────────────────────────────────
function buildSelections() {
  return appliances
    .filter(a => state.items[a.id].enabled && state.items[a.id].qty > 0)
    .map(a => ({
      applianceId:     a.id,
      label:           a.label,
      watts:           a.watts,
      surgeMultiplier: a.surgeMultiplier,
      qty:             state.items[a.id].qty,
      hours:           state.items[a.id].hours,
    }));
}

// ─── Render results ────────────────────────────────────────────────────────────
let lastResult = null;

function updateResults() {
  const selections = buildSelections();
  const input = {
    selections,
    monthlyPowerSpend: state.monthlyPowerSpend ?? undefined,
    dailyOutageHours:  state.dailyOutageHours  ?? undefined,
  };

  const result = calculateEstimate(input, {
    usableWh:   product.usableWh,
    maxOutputW: product.maxOutputW,
    price:      product.price,
  });

  lastResult = { result, selections };

  const hasSelections = selections.length > 0;

  if (resultEmpty)  resultEmpty.hidden  = hasSelections;
  if (resultCards)  resultCards.hidden  = !hasSelections;

  if (!hasSelections) return;

  // Runtime card
  if (resultRuntime) {
    resultRuntime.textContent = result.runtimeLabel;
  }

  // Fit card
  if (resultFit) {
    resultFit.textContent = result.fitsInOneCharge
      ? (result.fitsOutput ? 'Covered' : 'Adjust load')
      : 'Partial cover';
  }
  if (resultFitSub) {
    resultFitSub.textContent = result.fitMessage;
  }

  // Cost card
  const spend = state.monthlyPowerSpend || DEFAULT_MONTHLY_POWER_SPEND;
  if (resultCost) {
    resultCost.textContent = formatNaira(product.price);
  }
  if (resultCostSub) {
    resultCostSub.textContent = result.paybackLabel;
  }

  // Workings
  if (workingsBody) {
    workingsBody.innerHTML = `
      <p><strong>Daily energy:</strong> ${formatNumber(result.dailyWh, 0)} Wh (unadjusted)</p>
      <p><strong>With 20 % losses allowance:</strong> ${formatNumber(result.adjustedWh, 0)} Wh</p>
      <p><strong>Unit capacity:</strong> ${formatNumber(product.usableWh, 0)} Wh usable</p>
      <p><strong>Peak draw:</strong> ${formatNumber(result.peakW, 0)} W (max output: ${formatNumber(product.maxOutputW, 0)} W)</p>
      <p><strong>Runtime at full load:</strong> ${result.runtimeLabel}</p>
      <p>The 20 % allowance covers battery losses, inverter conversion losses and wiring heat. Real runtimes vary with temperature and appliance age.</p>
    `;
  }

  // Update compare section
  updateCompare(result, spend);

  // Update action buttons
  updateActionButtons(selections);
}

// ─── Update compare section ────────────────────────────────────────────────────
function updateCompare(result, spend) {
  if (!compareMonthly) return;

  const monthlyFuel = spend || DEFAULT_MONTHLY_POWER_SPEND;
  const annualFuel  = monthlyFuel * 12;
  const price       = product.price;

  compareMonthly.textContent  = formatNaira(monthlyFuel);
  compareUnitCost.textContent = formatNaira(price);

  if (result.paybackMonths && result.paybackMonths > 0) {
    comparePayback.textContent  = `${result.paybackMonths} month${result.paybackMonths === 1 ? '' : 's'}`;
    compareNote.textContent     = `You would save about ${formatNaira(annualFuel - price)} in the first year compared to your current spend.`;
  } else {
    comparePayback.textContent = 'Enter your monthly spend';
    compareNote.textContent    = 'Add your monthly generator or petrol spend to the calculator above to see your personal payback estimate.';
  }
}

// ─── WhatsApp and checkout buttons ────────────────────────────────────────────
function updateActionButtons(selections) {
  if (!whatsappBtn || !checkoutBtn) return;
  const hasLoad = selections.length > 0;
  whatsappBtn.disabled = !hasLoad;
  checkoutBtn.disabled = !hasLoad;
}

whatsappBtn?.addEventListener('click', () => {
  if (!lastResult) return;
  const { result, selections } = lastResult;

  const lines = [
    'Hello! I used the calculator on your website and here is my estimate:',
    '',
    'Appliances I need to run:',
    ...selections.map(s => `  - ${s.label} ×${s.qty} for ${s.hours} h/day`),
    '',
    `Daily energy needed: ${formatNumber(result.dailyWh, 0)} Wh (${formatNumber(result.adjustedWh, 0)} Wh with losses)`,
    `Estimated runtime per charge: ${result.runtimeLabel}`,
    `Recommended unit: ${product.name}`,
    `Unit price: ${formatNaira(product.price)}`,
    '',
    'I would like to know more. Please get back to me.',
  ];

  const text    = lines.join('\n');
  const number  = WHATSAPP_NUMBER;
  const url     = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  // Fire lead before opening WhatsApp
  sendLead({
    source: 'whatsapp',
    appliances: selections.map(s => ({ id: s.applianceId, qty: s.qty, hours: s.hours })),
    dailyWh:    result.dailyWh,
    adjustedWh: result.adjustedWh,
    product:    product.slug,
  });

  window.open(url, '_blank', 'noopener,noreferrer');
});

checkoutBtn?.addEventListener('click', () => {
  if (!lastResult) return;
  const { result, selections } = lastResult;

  // Save estimate to sessionStorage for the checkout page
  sessionStorage.setItem('estimate', JSON.stringify({
    selections,
    dailyWh:    result.dailyWh,
    adjustedWh: result.adjustedWh,
    runtimeLabel: result.runtimeLabel,
    product:    product.slug,
    price:      product.price,
  }));

  // Fire lead
  sendLead({
    source: 'checkout-start',
    appliances: selections.map(s => ({ id: s.applianceId, qty: s.qty, hours: s.hours })),
    dailyWh:    result.dailyWh,
    product:    product.slug,
  });

  window.location.href = 'checkout.html';
});

// ─── Extra inputs ─────────────────────────────────────────────────────────────
spendInput?.addEventListener('input', () => {
  const val = parseFloat(spendInput.value.replace(/[^0-9.]/g, ''));
  state.monthlyPowerSpend = isNaN(val) ? null : val;
  updateResults();
});

outageInput?.addEventListener('input', () => {
  const val = parseFloat(outageInput.value);
  state.dailyOutageHours = isNaN(val) ? null : val;
  updateResults();
});

// ─── Preset loading ────────────────────────────────────────────────────────────
export function applyPreset(presetId) {
  const preset = presets.find(p => p.id === presetId);
  if (!preset) return;

  // Disable everything first
  appliances.forEach(a => { state.items[a.id].enabled = false; });

  // Apply preset items
  preset.items.forEach(item => {
    if (state.items[item.applianceId]) {
      state.items[item.applianceId].enabled = true;
      state.items[item.applianceId].qty     = item.qty;
      state.items[item.applianceId].hours   = item.hours;
    }
  });

  // Rebuild list to reflect state
  buildApplianceList();

  if (calcPresetLabel) {
    calcPresetLabel.textContent = `Preset: ${preset.title}`;
    calcPresetLabel.hidden = false;
  }

  updateResults();
}

// ─── Initialise ────────────────────────────────────────────────────────────────
buildApplianceList();
updateResults();

// Expose preset loader for who-cards
window.__applyPreset = applyPreset;
