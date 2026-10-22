import { productPhoto } from './product-photo.js';
import { resultPresentation, coverageMeter, trimAction } from './result-view.js';
import { plainCopy, applianceNames } from '../data/plain-language.js';
import { technicalDetails, plainDuration, productTechnicalContent, escapeHTML } from './plain.js';
import { appliances } from '../data/appliances.js';
import { presets } from '../data/presets.js';
import { selectionsFromItems } from './estimate.js';
import { createCalculatorState, reduceCalculator, calculatorView } from './calculator-state.js';
import { buildWhatsAppMessage } from './recommend.js';
import { formatNaira, formatNumber } from './format.js';
import { canCheckout } from './order.js';
import { sendLead } from './leads.js';
import { WHATSAPP_NUMBER } from '../config.js';

const byId = id => document.getElementById(id);
const mobile = window.matchMedia('(max-width: 767px)');
const shortNames = { 'led-bulb': 'LED bulbs', fan: 'Fan', tv: 'TV', router: 'Wi-Fi router', 'phone-charger': 'Phone charger', laptop: 'Laptop', monitor: 'Monitor', decoder: 'Decoder', speaker: 'Speaker', 'mini-fridge': 'Mini fridge' };
const situationNames = { students: 'Students', 'remote-workers': 'Remote workers', shops: 'Shops and stalls', families: 'Families', events: 'Events', custom: 'Custom' };
let state = createCalculatorState();
let latest = null;

function stepper(id, type, label) {
  return `<div class="tile-stepper" role="group" aria-label="${label}">
    <button type="button" data-action="${type}" data-id="${id}" data-delta="-1" aria-label="Decrease ${label}">−</button>
    <span class="stepper-value"><small>${type === 'qty' ? 'How many' : 'Hours a day'}</small><output data-value="${type}"></output></span>
    <button type="button" data-action="${type}" data-id="${id}" data-delta="1" aria-label="Increase ${label}">+</button></div>`;
}

byId('situation-pills').innerHTML = presets.map(p => `<button type="button" data-preset="${p.id}" aria-pressed="false">${situationNames[p.id]}</button>`).join('');
byId('appliance-list').innerHTML = appliances.map(a => `<div class="appliance-tile" id="tile-${a.id}">
  <button class="tile-toggle" type="button" data-action="toggle" data-id="${a.id}" aria-pressed="false" aria-label="Include ${a.label}" >
    <span class="tile-name">${shortNames[a.id]}</span><span class="tile-watts"><span class="tile-selection-summary"></span></span><span class="tile-corner" aria-hidden="true"></span>
  </button>
  <button type="button" class="tile-editor-button" data-action="edit" data-id="${a.id}" aria-label="Adjust ${a.label}" aria-expanded="false" hidden>Edit</button>
  <div class="tile-controls" hidden>${stepper(a.id,'qty',`quantity for ${a.label}`)}${stepper(a.id,'hours',`hours for ${a.label}`)}</div>
</div>`).join('');

function dispatch(action) { state = reduceCalculator(state, action); render(); }
function renderTiles() {
  for (const item of state.items) {
    const tile = byId(`tile-${item.applianceId}`);
    tile.classList.toggle('is-selected', item.enabled);
    tile.classList.toggle('is-editing', item.enabled && state.editingId === item.applianceId);
    tile.querySelector('.tile-toggle').setAttribute('aria-pressed', String(item.enabled));
    tile.querySelector('.tile-controls').hidden = !item.enabled;
    tile.querySelector('.tile-editor-button').hidden = !item.enabled;
    tile.querySelector('.tile-editor-button').setAttribute('aria-expanded', String(state.editingId === item.applianceId));
    tile.querySelector('.tile-selection-summary').textContent = item.enabled ? `${item.qty} x ${item.hours} hours` : '';
    tile.querySelector('[data-value="qty"]').textContent = item.qty;
    tile.querySelector('[data-value="hours"]').textContent = item.hours;
    tile.querySelectorAll('[data-delta]').forEach(button => {
      const value = button.dataset.action === 'qty' ? item.qty : item.hours;
      const max = button.dataset.action === 'qty' ? 20 : 24;
      button.disabled = Number(button.dataset.delta) < 0 ? value <= 1 : value >= max;
    });
  }
}
function renderStep() {
  byId('calculator-panel').dataset.step = state.step;
  document.querySelectorAll('.calculator-progress [data-step-to]').forEach(button => {
    if (Number(button.dataset.stepTo) === state.step) button.setAttribute('aria-current','step');
    else button.removeAttribute('aria-current');
  });
  for (const [id, step] of [['calculator-situations',1],['calculator-appliances',2],['calculator-result',3]]) byId(id).inert = mobile.matches && state.step !== step;
}
function render() {
  renderTiles(); renderStep();
  document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.preset === state.preset)));
  byId('daily-outage').textContent = state.outageHours;
  document.querySelector('[data-outage="-1"]').disabled = state.outageHours <= 1;
  document.querySelector('[data-outage="1"]').disabled = state.outageHours >= 24;
  if (byId('monthly-spend').value !== state.spend) byId('monthly-spend').value = state.spend;
  if (byId('unit-budget').value !== state.budget) byId('unit-budget').value = state.budget;
  const { selected, result, paybackLine } = calculatorView(state);
  const selections = selectionsFromItems(selected);
  latest = { result, selections, outageHours: state.outageHours, budget: result.budget?.amount ?? null };
  const unit = result.bestFit;
  const empty = result.state === 'empty';
  byId('calculator-result').classList.toggle('is-empty', empty);
  byId('result-empty').hidden = !empty;
  byId('result-cards').hidden = empty;
  byId('result-cards').dataset.state = result.state;
  byId('live-recommendation').textContent = empty ? 'Choose an appliance to find your unit.' : unit ? `${unit.name}, ${formatNumber(result.usagePercent,0)}% of a full charge` : result.availabilityLimited ? 'Ask about availability.' : 'A whole home system will fit better.';
  const previewUnit = unit ?? result.closestUnit;
  byId('situation-preview').innerHTML = previewUnit ? `${productPhoto(previewUnit, {className: 'preview-photo'})}<div><p class="zone-label">Already figured out for you</p><strong>${unit ? escapeHTML(unit.name) : result.availabilityLimited ? 'Ask about availability' : 'A whole home system'}</strong><p>${unit ? `${formatNumber(result.usagePercent,0)}% of a full charge.` : result.availabilityLimited ? 'Suitable units are unavailable to order.' : 'You need a bigger home system.'}</p><small>You can change every appliance next.</small></div>` : '<p>Start with the appliances you need. We will find your unit.</p>';
  if (empty) return;
  const photo = unit ?? result.closestUnit;
  const runtime = unit ? plainDuration(unit.usableWh / (1.2 * result.load.runningW)) : '';
  const view = resultPresentation(result, selections, state.outageHours);
  byId('result-content').innerHTML = `
    <p class="result-verdict" data-fit="${result.state}">${view.status}</p>
    ${unit ? `<div class="compact-product">${productPhoto(unit, {className: 'compact-product-photo'})}<div><p class="zone-label">Your best fit</p><h3 id="result-unit-name">${escapeHTML(unit.name)}</h3></div></div>
      <p class="result-coverage">${view.coverage}</p><p class="result-explanation">${view.explanation}</p>
      <div class="result-charge"><span>About ${view.chargeLeft}% left after your power cut</span>${coverageMeter(view.chargeLeft)}</div>
      ${view.trim ? `<div class="result-trim"><p>${escapeHTML(view.trim)}</p><button type="button" class="btn btn--outline" id="apply-trim">Use this change</button></div>` : ''}
      ${result.state === 'tight' && result.roomToGrow ? `<p class="compact-notice">Adding more? Step up to ${escapeHTML(result.roomToGrow.name)}.</p>` : ''}
      <div class="result-price-block"><p class="result-price-label">${unit.price === null ? 'Price to confirm' : 'Unit price, delivery extra'}</p><p id="result-cost" class="compact-price">${view.price}</p>
      ${view.budgetLine ? `<p id="result-budget" class="compact-budget" data-budget-status="${result.budget.status}">${view.budgetLine}</p>` : ''}
      ${state.spend !== '' && paybackLine ? `<p id="result-payback" class="compact-payback">${paybackLine}</p>` : ''}</div>`
      : `<h3 id="result-unit-name">${result.availabilityLimited ? 'Ask about availability' : 'A whole home system'}</h3><p class="result-coverage">${view.coverage}</p><p class="result-explanation">${view.explanation}</p>`}`;
  byId('apply-trim')?.addEventListener('click', () => {
    const action = trimAction(result.nearMissTrim, selections);
    if (action) {
      dispatch(action);
      byId('result-unit-name').setAttribute('tabindex', '-1');
      byId('result-unit-name').focus({preventScroll: true});
    }
  });
  const detail = `<div id="workings-body" data-level="technical"><p>Your selection: ${view.applianceLine}.</p><p>Battery used: <span id="result-usage">${formatNumber(result.usagePercent,1)}%</span>. With everything on at once: <span id="result-runtime">${runtime || 'No suitable portable unit'}</span>.</p><p>${state.outageHours} outage hours. Before losses: ${formatNumber(result.load.energyNeedWh / 1.2,1)} Wh.</p><p>With 1.2 loss allowance: <strong id="result-energy">${formatNumber(result.load.energyNeedWh,1)} Wh</strong>. Running: <strong id="result-running">${result.load.runningW} W</strong>. Peak with surge multipliers: <strong id="result-peak">${result.load.peakW} W</strong>.</p><p>Energy = 1.2 x sum(watts x quantity x min(hours, outage hours)). Running = sum(watts x quantity). Peak = sum(watts x quantity x surge multiplier).</p><p>AC needed: ${result.load.needsAC ? 'yes' : 'no'}. Runtime = usableWh / (1.2 x runningW).</p><ul>${selections.map(s => `<li>${applianceNames[s.id] ?? s.label}: ${s.watts} W, surge x${s.surgeMultiplier}, ${s.qty} x ${s.hours} hours.</li>`).join('')}</ul>${photo ? productTechnicalContent(photo) : ''}</div>`;
  const old = byId('calculator-technical').querySelector('details');
  const wasOpen = old?.open ?? false;
  byId('calculator-technical').innerHTML = technicalDetails(detail, {className: 'calculator-workings'});
  byId('calculator-technical').querySelector('details').open = wasOpen;
  byId('btn-checkout').hidden = !canCheckout(unit);
  byId('btn-whatsapp').textContent = result.availabilityLimited ? 'Ask about availability' : !unit ? 'Size my home system' : unit.price === null ? 'Get my price on WhatsApp' : 'Ask about this unit';
}

byId('appliance-list').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (button) dispatch({ type: button.dataset.action, id: button.dataset.id, delta: Number(button.dataset.delta) });
});
byId('situation-pills').addEventListener('click', event => {
  const button = event.target.closest('[data-preset]');
  if (!button) return;
  dispatch({ type:'preset', id:button.dataset.preset });
  if (mobile.matches) goToStep(2);
});
function goToStep(step) {
  dispatch({ type:'step', step });
  if (mobile.matches) {
    byId('calculator-panel').scrollIntoView({ behavior:'instant', block:'start' });
    const target = step === 1 ? byId('situation-pills').querySelector('[aria-pressed="true"]') : step === 2 ? byId('appliance-list').querySelector('.tile-toggle') : byId('calculator-result').querySelector('.result-back');
    target?.focus({preventScroll:true});
  }
}
document.querySelectorAll('[data-step-to]').forEach(button => button.addEventListener('click',()=>goToStep(Number(button.dataset.stepTo))));
document.querySelectorAll('[data-outage]').forEach(button => button.addEventListener('click',()=>dispatch({type:'outage',delta:Number(button.dataset.outage)})));
byId('monthly-spend').addEventListener('input',event => dispatch({type:'spend',value:event.target.value}));
byId('unit-budget').addEventListener('input',event => dispatch({type:'budget',value:event.target.value}));
byId('reset-calc').addEventListener('click',()=>{dispatch({type:'clear'});if(mobile.matches)goToStep(2);});
mobile.addEventListener('change',renderStep);
export function applyPreset(id) { dispatch({type:'preset',id}); }
window.__applyPreset = applyPreset;
render();

byId('btn-whatsapp').addEventListener('click', () => {
  if (!latest || latest.result.state === 'empty') return;
  const { result, selections, outageHours } = latest;
  const unit = result.bestFit;
  const message = buildWhatsAppMessage({ productName: unit?.name, productModel: unit?.model, price: unit?.price ?? null, selections, outageHours, wholeHomeSystem: result.state === 'none' && !result.availabilityLimited, availabilityEnquiry: result.availabilityLimited }) + (latest.budget !== null ? `\nMy budget for the unit: ${formatNaira(latest.budget)}.` : '');
  sendLead({ source: 'whatsapp', product: unit?.slug ?? null, selections, outageHours, budget: latest.budget, ...result.load });
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
byId('btn-checkout').addEventListener('click', () => {
  if (!canCheckout(latest?.result.bestFit)) return;
  const { result, selections, outageHours } = latest;
  sessionStorage.setItem('estimate', JSON.stringify({ product: result.bestFit.slug, selections, outageHours, budget: latest.budget, rawEnergyWh: result.load.energyNeedWh / 1.2, ...result.load }));
  sendLead({ source: 'checkout-start', product: result.bestFit.slug, selections, outageHours, budget: latest.budget, ...result.load });
  window.location.href = 'checkout.html';
});
