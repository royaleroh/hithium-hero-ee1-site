import './main-sections.js';
import { recommendSolutions, solutionTitle, solutionLabels, solutionEnquiry, componentLabels, componentRating } from './solutions.js';
import { solutionPhoto, solutionOptions, needs } from './solution-view.js';
import { resultPresentation, coverageMeter, trimAction } from './result-view.js';
import { applianceNames } from '../data/plain-language.js';
import { technicalDetails, plainDuration, escapeHTML } from './plain.js';
import { appliances } from '../data/appliances.js';
import { presets } from '../data/presets.js';
import { selectionsFromItems } from './estimate.js';
import { createCalculatorState, reduceCalculator } from './calculator-state.js';
import { computePayback } from './recommend.js';
import { formatNaira, formatNumber } from './format.js';
import { sendLead } from './leads.js';
import { WHATSAPP_NUMBER } from '../config.js';

const byId = id => document.getElementById(id);
const shortNames = { 'led-bulb': 'LED bulb', fan: 'Fan', tv: 'TV', 'phone-charger': 'Phone', monitor: 'Monitor', decoder: 'Decoder', speaker: 'Speaker' };
const situationNames = { students: 'Students', 'remote-workers': 'Remote workers', shops: 'Shops and stalls', families: 'Families', events: 'Events' };
const catalogueById = new Map(appliances.map(item => [item.id, item]));
const form = byId('load-form');
const rows = byId('load-rows');
let state = createCalculatorState();
state = reduceCalculator(state, { type: 'clear' });
let latest = null;
let optionIndex = null;

const appliancePicture = id => `<svg class="appliance-picture" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><use href="assets/calculator/appliances.svg#${id}"></use></svg>`;

byId('situation-pills').innerHTML = presets.filter(p => situationNames[p.id]).map(p => `<button type="button" data-preset="${p.id}" aria-pressed="false">${situationNames[p.id]}</button>`).join('');
byId('appliance-list').innerHTML = appliances.map(a => {
  const label = shortNames[a.id] ?? a.label;
  return `<div class="load-tile" id="tile-${a.id}">
    <button type="button" class="tile-toggle" data-action="add" data-id="${a.id}" aria-label="Add ${label}">${appliancePicture(a.id)}<span>${label}</span><span class="load-count" aria-hidden="true" hidden></span></button>
    <button type="button" class="load-minus" data-action="subtract" data-id="${a.id}" aria-label="Remove one ${label}" hidden>−</button>
  </div>`;
}).join('');

function invalidate() {
  if (latest) byId('result-empty').textContent = 'Your inputs changed. Calculate again to update the estimate.';
  latest = null;
  optionIndex = null;
  byId('result-empty').hidden = false;
  byId('result-cards').hidden = true;
}

function renderControls() {
  for (const item of state.items) {
    const tile = byId(`tile-${item.applianceId}`);
    if (!tile) continue;
    const quantity = item.enabled ? item.qty : 0;
    tile.classList.toggle('is-selected', Boolean(quantity));
    const count = tile.querySelector('.load-count');
    count.textContent = quantity;
    count.hidden = !quantity;
    tile.querySelector('.load-minus').hidden = !quantity;
    const button = tile.querySelector('.tile-toggle');
    const name = shortNames[item.applianceId] ?? catalogueById.get(item.applianceId).label;
    button.setAttribute('aria-label', `Add ${name}, ${quantity ?? 0} selected`);
    button.disabled = quantity >= 20;
  }
  document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.preset === state.preset)));
  const solar = state.goal === 'solar' || (state.goal === 'auto' && ['panels', 'both'].includes(state.existing));
  byId('solar-hours-field').hidden = !solar;
  byId('solar-hours').disabled = !solar;
  byId('solar-hours').required = solar;
  byId('calculate-load').disabled = !state.items.some(item => item.enabled);
}

function rowField(item, field, caption, value, min, max, step = 'any') {
  const id = `load-${item.applianceId}-${field}`;
  const name = catalogueById.get(item.applianceId)?.label ?? 'custom appliance';
  return `<label class="load-field" for="${id}" ${field === 'watts' ? 'data-level="technical"' : ''}><span>${caption}</span><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" inputmode="${step === 1 ? 'numeric' : 'decimal'}" required data-field="${field}" aria-label="${caption} for ${name}" value="${value ?? ''}"></label>`;
}

function renderRows() {
  const selected = state.items.filter(item => item.enabled);
  byId('load-empty').hidden = selected.length > 0;
  byId('load-table').hidden = !selected.length;
  rows.innerHTML = selected.map(item => {
    const { applianceId: id } = item;
    const a = catalogueById.get(id);
    const name = shortNames[id] ?? a?.label;
    return `<div class="load-row" data-row="${id}">
      <div class="load-row-name">${appliancePicture(a ? id : 'other')}${a ? `<strong>${name}</strong>` : `<input id="load-${id}-label" type="text" maxlength="80" aria-label="Custom appliance name" placeholder="Appliance name" data-field="label" value="${escapeHTML(item.label)}"><div class="load-surge">${rowField(item, 'surgeMultiplier', 'Startup multiplier', item.surgeMultiplier, 1, 10)}</div>`}</div>
      ${rowField(item, 'qty', 'Quantity', item.qty, 1, 20, 1)}
      ${rowField(item, 'watts', 'Watts each', Object.hasOwn(item, 'watts') ? item.watts : a?.watts, 1, 50000)}
      ${rowField(item, 'hours', 'Hours a day', item.hours, 0.1, 24)}
      <button type="button" class="load-remove" aria-label="Remove ${escapeHTML(name ?? 'custom appliance')}" data-remove="${id}">×</button>
    </div>`;
  }).join('');
}

function syncSettings() {
  byId('daily-outage').value = state.outageHours;
  byId('monthly-spend').value = state.spend;
  byId('unit-budget').value = state.budget;
  byId('solution-goal').value = state.goal;
  byId('existing-equipment').value = state.existing;
  byId('solar-hours').value = state.sunHours;
}

function dispatch(action, { rebuild = true } = {}) {
  state = reduceCalculator(state, action);
  invalidate();
  renderControls();
  if (rebuild) renderRows();
}

function calculate({ focus = false } = {}) {
  if (!form.reportValidity()) return;
  const selections = selectionsFromItems(state.items.filter(item => item.enabled));
  if (!selections.length) return;
  const result = recommendSolutions({ selections, outageHours: state.outageHours, monthlyPowerSpend: Number(state.spend) || 0, budget: state.budget, goal: state.goal, existing: state.existing, sunHours: state.sunHours });
  renderResult(result, selections);
  if (focus) {
    byId('load-result-heading').focus({ preventScroll: true });
    byId('calculator-result').scrollIntoView({ block: 'start' });
  }
}

function renderResult(result, selections) {
  if (optionIndex !== null && result.options[optionIndex]) {
    const chosen=result.options[optionIndex];
    result={...result,bestFit:chosen,kind:chosen.tier==='power-bank'?'power-bank':'portable',usagePercent:result.load.energyNeedWh/chosen.usableWh*100,nearMissTrim:null,roomToGrow:null,state:result.load.energyNeedWh/chosen.usableWh>=.85?'tight':'fit',budget:undefined};
    if(state.budget!=='')result.budget={amount:Number(state.budget),status:chosen.price===null?'unconfirmed':chosen.price<=Number(state.budget)?'within':'over',shortfall:chosen.price===null?null:Math.max(0,chosen.price-Number(state.budget))};
  }
  const paybackLine = result.bestFit?.price && state.spend!=='' ? computePayback(result.bestFit.price,Number(state.spend)).label : '';
  const unit = result.bestFit;
  const selectedIndex = unit ? result.options.findIndex(p => p.slug === unit.slug) : -1;
  latest = { result, selections, outageHours: state.outageHours, budget: state.budget === '' ? null : Number(state.budget) };
  byId('result-empty').hidden = true;
  byId('result-cards').hidden = false;
  byId('result-cards').dataset.state = result.state;
  const dailyWh = selections.reduce((sum, item) => sum + item.watts * item.qty * item.hours, 0);
  const backupWh = unit?.usableWh ?? (result.sizing ? (result.bundle?.limits.nominalWh ?? result.sizing.batteryWh) * result.sizing.usableFraction : 0);
  byId('load-metrics').innerHTML = [
    ['Peak load', formatNumber(result.load.peakW, 1) + ' W', 'With startup surges'],
    ['Daily energy', formatNumber(dailyWh, 1) + ' Wh', 'Before losses, using the hours entered'],
    ['Estimated backup', backupWh ? formatNumber(backupWh / (1.2 * result.load.runningW), 1) + ' h' : 'To confirm', 'With everything running at once'],
  ].map(([label, value, note]) => `<div class="load-metric" data-level="technical"><p>${label}</p><strong>${value}</strong><small>${note}</small></div>`).join('');
  const runtime = unit ? plainDuration(unit.usableWh / (1.2 * result.load.runningW)) : '';
  const view = resultPresentation(result, selections, state.outageHours);
  if(result.sizing && !result.availabilityLimited)view.status='Plan a fitted setup';
  byId('result-content').innerHTML = `
    <p class="result-verdict" data-fit="${result.state}">${view.status}</p>
    ${unit ? `<div class="compact-product">${solutionPhoto(result.kind, {className: 'compact-product-photo'})}<div><p class="zone-label">${result.options.length > 1 && selectedIndex >= 0 ? `Option ${selectedIndex + 1}` : 'Suggested option'}</p><h3 id="result-unit-name">${escapeHTML(solutionTitle(unit))}</h3>${result.kind === 'portable' ? '<p class="solution-confirmation">One portable unit with a built-in rechargeable battery.</p>' : ''}</div></div>
      <p class="result-coverage">${view.coverage}</p><p class="result-explanation">${view.explanation}</p>
      <div class="result-charge"><span>About ${view.chargeLeft}% left after your power cut</span>${coverageMeter(view.chargeLeft)}</div>
      ${view.trim ? `<div class="result-trim"><p>${escapeHTML(view.trim)}</p><button type="button" class="btn btn--outline" id="apply-trim">Use this change</button></div>` : ''}
      ${result.state === 'tight' && result.roomToGrow ? `<p class="compact-notice">Adding more? Consider a larger option below.</p>` : ''}
      <div class="result-price-block"><p class="result-price-label">${unit.price === null ? 'Price to confirm' : 'Unit price, delivery extra'}</p><p id="result-cost" class="compact-price">${view.price}</p>
      ${view.budgetLine ? `<p id="result-budget" class="compact-budget" data-budget-status="${result.budget.status}">${view.budgetLine}</p>` : ''}
      ${state.spend !== '' && paybackLine ? `<p id="result-payback" class="compact-payback">${paybackLine}</p>` : ''}</div>
      ${result.kind==='power-bank'&&selections.some(s=>s.id==='laptop')?'<p class="solution-confirmation">Your laptop must support charging through USB-C. Check the cable rating too.</p>':''}
      ${solutionOptions(result.options,selectedIndex,result.load.energyNeedWh)}`
      : `<div class="compact-product">${solutionPhoto(result.kind,{className:'compact-product-photo'})}<div><p class="zone-label">${result.bundle ? (result.bundle.status === 'approved' ? 'Installer-reviewed kit' : 'Equipment kit') : 'Fitted system'}</p><h3 id="result-unit-name">${escapeHTML(result.availabilityLimited ? 'Ask about availability' : solutionLabels[result.kind])}</h3></div></div><p class="result-coverage">${result.bundle ? 'A kit to quote for your selected appliances.' : result.availabilityLimited?'Check stock with us.':'Separate products fitted to work together.'}</p>${systemComponents(result)}${result.bundle ? bundleQuoteDetails(result.bundle) : ''}`}`;
  byId('result-content').querySelectorAll('[data-solution-option]').forEach(button=>button.addEventListener('click',()=>{optionIndex=Number(button.dataset.solutionOption);calculate({focus:true});}));
  byId('apply-trim')?.addEventListener('click', () => {
    const action = trimAction(result.nearMissTrim, selections);
    if (action) {
      if (action.type === 'hours') {
        const selection = selections.find(item => item.id === action.id);
        dispatch({ type: 'field', id: action.id, field: 'hours', value: String(selection.hours + action.delta) });
      } else {
        dispatch(action);
      }
      calculate();
      byId('result-unit-name').setAttribute('tabindex', '-1');
      byId('result-unit-name').focus({preventScroll: true});
    }
  });
  const detail = `<div id="workings-body" data-level="technical"><p>Your selection: ${escapeHTML(view.applianceLine)}.</p><p>Battery used: <span id="result-usage">${unit ? formatNumber(result.usagePercent,1) + '%' : 'Not applicable'}</span>. With everything on at once: <span id="result-runtime">${runtime || 'No suitable portable unit'}</span>.</p><p>${state.outageHours} outage hours. Before losses: ${formatNumber(result.load.energyNeedWh / 1.2,1)} Wh.</p><p>With 1.2 loss allowance: <strong id="result-energy">${formatNumber(result.load.energyNeedWh,1)} Wh</strong>. Running: <strong id="result-running">${result.load.runningW} W</strong>. Peak with surge multipliers: <strong id="result-peak">${result.load.peakW} W</strong>.</p><p>Energy = 1.2 x sum(watts x quantity x min(hours, outage hours)). Running = sum(watts x quantity). Peak = sum(watts x quantity x surge multiplier).</p><p>AC needed: ${result.load.needsAC ? 'yes' : 'no'}. Runtime = usableWh / (1.2 x runningW).</p><ul>${selections.map(s => `<li>${escapeHTML(applianceNames[s.id] ?? s.label)}: ${s.watts} W, surge x${s.surgeMultiplier}, ${s.qty} x ${s.hours} hours.</li>`).join('')}</ul>${unit ? `<p>Selected option: ${formatNumber(unit.usableWh)} Wh storage, ${formatNumber(unit.maxOutputW)} W output.</p>` : ''}</div>`;
  const old = byId('calculator-technical').querySelector('details');
  const wasOpen = old?.open ?? false;
  byId('calculator-technical').innerHTML = technicalDetails(detail, {className: 'calculator-workings'});
  if(result.sizing){const s=result.sizing;byId('calculator-technical').querySelector('[data-level="technical"]').insertAdjacentHTML('beforeend',`<p>Preliminary sizing: ${s.batteryWh} Wh nominal battery, ${s.inverterW} W continuous inverter, ${s.peakW} W simultaneous starting load.</p><p>Battery = energy including losses / 0.8 usable fraction. Inverter = running watts x 1.25, rounded up.</p>${result.kind==='solar'?`<p>Solar = energy / (${s.sunHours} peak sun hours x 0.75 system yield), rounded up: ${s.panelW} W. Sun hours are an assumption, not a local weather forecast.</p>`:''}<p>Installer must check battery BMS support, voltage, discharge current, panel Voc at low temperature, MPPT range, wiring and protection.</p>`);}
  byId('calculator-technical').querySelector('details').open = wasOpen;
  byId('btn-whatsapp').textContent = result.availabilityLimited ? 'Ask about availability on WhatsApp' : 'Confirm on WhatsApp';
}

function bundleQuoteDetails(bundle) {
  const pricing = bundle.subtotal === null ? (bundle.stocked ? 'Ask for equipment pricing.' : 'Ask us to confirm stock and pricing.')
    : `Equipment subtotal: ${formatNaira(bundle.subtotal)}. Installation and delivery are quoted separately.`;
  return `<p id="bundle-price">${pricing}</p>`;
}

function systemComponents({ sizing, components, bundle }) {
  const targets = {
    inverter: `Inverter target: ${formatNumber(sizing.inverterW)} W rated. Estimated startup load: ${formatNumber(sizing.peakW)} W.`,
    battery: `Storage target: ${formatNumber(sizing.batteryWh / 1000)} kWh rated.`,
    solar: `At least ${formatNumber(sizing.panelW)} W total.${bundle ? '' : ' Panel count to confirm.'}`,
  };
  return `<h4 class="component-heading">${bundle ? 'What’s included in the kit' : 'Products for your quote'}</h4><div class="load-components">${components.map(({ id, product, quantity, existing, needsExistingInverterCheck }) => {
    const rating = product && componentRating[id](product);
    const stock = product && (!product.available ? 'Stock to confirm' : product.price === null ? 'Price on request' : `${formatNaira(product.price)} per unit`);
    return `<article class="load-component"><div class="load-component-type">${appliancePicture(id)}<h5>${componentLabels[id]}</h5>${quantity ? `<span class="component-quantity">Qty: ${quantity}</span>` : ''}</div>
      ${product ? `<p class="component-product" data-level="technical">${rating}</p><small>${stock}</small>${id === 'battery' && product.nominalBatteryWh * (quantity ?? 1) >= sizing.batteryWh * 2 ? '<small>This option has more storage than the estimate needs.</small>' : ''}`
        : `<p class="component-product">${existing ? 'Check your existing equipment' : needsExistingInverterCheck ? 'Check your inverter before choosing' : 'Model to confirm'}</p>`}
      <small class="component-target" data-level="technical">${targets[id]}</small>
    </article>`;
  }).join('')}</div>`;
}

byId('appliance-list').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  dispatch({ type: action, id });
  if (button.hidden || button.disabled) byId(`tile-${id}`).querySelector('button:not([hidden]):not(:disabled)')?.focus();
});
rows.addEventListener('input', event => {
  const { field } = event.target.dataset;
  if (field) dispatch({ type: 'field', id: event.target.closest('[data-row]').dataset.row, field, value: event.target.value }, { rebuild: false });
});
rows.addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  dispatch({ type: 'remove', id: button.dataset.remove });
  (rows.querySelector('[data-remove]') ?? byId('add-custom-appliance')).focus();
});
byId('add-custom-appliance').addEventListener('click', () => {
  dispatch({ type: 'add-custom' });
  byId(`load-custom-${state.nextCustom}-label`).focus();
});
byId('situation-pills').addEventListener('click', event => {
  const button = event.target.closest('[data-preset]');
  if (button) applyPreset(button.dataset.preset);
});
byId('reset-calc').addEventListener('click', () => {
  dispatch({ type: 'clear' });
  syncSettings();
  byId('solution-settings').open = false;
  byId('result-empty').textContent = 'Calculate your requirements to see your options.';
});
for (const [id, type] of [['monthly-spend','spend'],['unit-budget','budget'],['solution-goal','goal'],['existing-equipment','existing'],['solar-hours','sun']]) {
  byId(id).addEventListener(byId(id).tagName === 'SELECT' ? 'change' : 'input', event => dispatch({ type, value: event.target.value }, { rebuild: false }));
}
byId('daily-outage').addEventListener('input', event => {
  if (event.target.validity.valid) state = { ...state, outageHours: Number(event.target.value) };
  invalidate();
});
form.addEventListener('submit', event => { event.preventDefault(); calculate({ focus: true }); });
form.addEventListener('invalid', event => {
  const details = event.target.closest('details');
  if (details) details.open = true;
}, true);

document.querySelectorAll('[data-need]').forEach(link => link.addEventListener('click', () => {
  const need = needs.find(n => n.id === link.dataset.need);
  if (!need) return;
  applyPreset(need.preset);
  if (need.appliance) {
    dispatch({ type: 'add', id: need.appliance });
    dispatch({ type: 'field', id: need.appliance, field: 'hours', value: need.appliance === 'laptop' ? '1' : '2' });
  }
  dispatch({ type: 'goal', value: need.goal });
  syncSettings();
  byId('solution-settings').open = need.goal !== 'auto';
}));
export function applyPreset(id) {
  dispatch({ type: 'preset', id });
  syncSettings();
}
window.__applyPreset = applyPreset;
syncSettings();
renderRows();
renderControls();

byId('btn-whatsapp').addEventListener('click', () => {
  if (!latest || latest.result.state === 'empty') return;
  const { result, selections, outageHours } = latest;
  const unit = result.bestFit;
  const message = solutionEnquiry(result,selections,outageHours,latest.budget);
  sendLead({ source: 'whatsapp', product: unit?.slug ?? null, bundle: result.bundle?.id ?? null, selections, outageHours, budget: latest.budget, ...result.load });
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
