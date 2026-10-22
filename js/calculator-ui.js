import './main-sections.js';
import { recommendSolutions, solutionTitle, solutionLabels, solutionEnquiry } from './solutions.js';
import { solutionPhoto, solutionOptions, needs } from './solution-view.js';
import { resultPresentation, coverageMeter, trimAction } from './result-view.js';
import { applianceNames } from '../data/plain-language.js';
import { technicalDetails, plainDuration, productTechnicalContent, escapeHTML } from './plain.js';
import { appliances } from '../data/appliances.js';
import { presets } from '../data/presets.js';
import { selectionsFromItems } from './estimate.js';
import { createCalculatorState, reduceCalculator, calculatorView } from './calculator-state.js';
import { computePayback } from './recommend.js';
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
let optionSlug = null;

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

function dispatch(action) { optionSlug = null; state = reduceCalculator(state, action); render(); }
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
  const { selected } = calculatorView(state);
  const selections = selectionsFromItems(selected);
  let result = recommendSolutions({ selections, outageHours:state.outageHours, monthlyPowerSpend:Number(state.spend)||0, budget:state.budget, goal:state.goal, existing:state.existing, sunHours:state.sunHours });
  if (optionSlug && result.options?.some(p=>p.slug===optionSlug)) {
    const chosen=result.options.find(p=>p.slug===optionSlug);
    result={...result,bestFit:chosen,kind:chosen.tier==='power-bank'?'power-bank':'portable',usagePercent:result.load.energyNeedWh/chosen.usableWh*100,nearMissTrim:null,roomToGrow:null,state:result.load.energyNeedWh/chosen.usableWh>=.85?'tight':'fit',budget:undefined};
    if(state.budget!=='')result.budget={amount:Number(state.budget),status:chosen.price===null?'unconfirmed':chosen.price<=Number(state.budget)?'within':'over',shortfall:chosen.price===null?null:Math.max(0,chosen.price-Number(state.budget))};
  }
  const paybackLine = result.bestFit?.price && state.spend!=='' ? computePayback(result.bestFit.price,Number(state.spend)).label : '';
  byId('solution-goal').value=state.goal??'auto';
  byId('existing-equipment').value=state.existing??'none';
  byId('solar-hours').value=state.sunHours??4;
  byId('solar-hours-field').hidden=result.kind!=='solar';
  if(result.sizing)byId('solution-settings').open=true;
  latest = { result, selections, outageHours: state.outageHours, budget: result.budget?.amount ?? null };
  const unit = result.bestFit;
  const empty = result.state === 'empty';
  byId('calculator-result').classList.toggle('is-empty', empty);
  byId('result-empty').hidden = !empty;
  byId('result-cards').hidden = empty;
  byId('result-cards').dataset.state = result.state;
  byId('live-recommendation').textContent = empty ? 'Choose an appliance to find your solution.' : unit ? `${solutionTitle(unit)}, ${formatNumber(result.usagePercent,0)}% of a full charge` : result.availabilityLimited ? 'Ask about availability.' : 'An installed setup suits your selection.';
  byId('situation-preview').innerHTML = !empty ? `${solutionPhoto(result.kind,{className:'preview-photo'})}<div><p class="zone-label">Your starting point</p><strong>${escapeHTML(solutionLabels[result.kind]??'Your power options')}</strong><p>${unit ? 'Check the hours and devices next.' : 'A setup planned around your home.'}</p><small>You can change every appliance next.</small></div>` : '<p>Start with the appliances you need. We will find your solution.</p>';
  if (empty) return;
  const photo = unit ?? result.closestUnit;
  const runtime = unit ? plainDuration(unit.usableWh / (1.2 * result.load.runningW)) : '';
  const view = resultPresentation(result, selections, state.outageHours);
  if(result.sizing && !result.availabilityLimited)view.status='Plan a fitted setup';
  byId('result-content').innerHTML = `
    <p class="result-verdict" data-fit="${result.state}">${view.status}</p>
    ${unit ? `<div class="compact-product">${solutionPhoto(result.kind, {className: 'compact-product-photo'})}<div><p class="zone-label">Your solution</p><h3 id="result-unit-name">${escapeHTML(solutionTitle(unit))}</h3></div></div>
      <p class="result-coverage">${view.coverage}</p><p class="result-explanation">${view.explanation}</p>
      <div class="result-charge"><span>About ${view.chargeLeft}% left after your power cut</span>${coverageMeter(view.chargeLeft)}</div>
      ${view.trim ? `<div class="result-trim"><p>${escapeHTML(view.trim)}</p><button type="button" class="btn btn--outline" id="apply-trim">Use this change</button></div>` : ''}
      ${result.state === 'tight' && result.roomToGrow ? `<p class="compact-notice">Adding more? Consider a larger option below.</p>` : ''}
      <div class="result-price-block"><p class="result-price-label">${unit.price === null ? 'Price to confirm' : 'Unit price, delivery extra'}</p><p id="result-cost" class="compact-price">${view.price}</p>
      ${view.budgetLine ? `<p id="result-budget" class="compact-budget" data-budget-status="${result.budget.status}">${view.budgetLine}</p>` : ''}
      ${state.spend !== '' && paybackLine ? `<p id="result-payback" class="compact-payback">${paybackLine}</p>` : ''}</div>
      <p class="solution-confirmation">Actual brand, model and warranty shown before payment.</p>
      ${result.kind==='power-bank'&&selections.some(s=>s.id==='laptop')?'<p class="solution-confirmation">Your laptop must support charging through USB-C. Check the cable rating too.</p>':''}
      ${solutionOptions(result.options,unit.slug,result.load.energyNeedWh)}`
      : `<div class="compact-product">${solutionPhoto(result.kind,{className:'compact-product-photo'})}<div><p class="zone-label">Your solution</p><h3 id="result-unit-name">${result.availabilityLimited ? 'Ask about availability' : escapeHTML(solutionLabels[result.kind])}</h3></div></div><p class="result-coverage">${result.availabilityLimited?'Check stock with us.':'Built around the devices you chose.'}</p><p class="result-explanation">We will confirm the equipment, fitting and full price in your quotation.</p><ul class="system-includes"><li>${result.existing==='inverter'||result.existing==='both'?'Check your existing inverter':'An inverter matched to your load'}</li><li>Battery storage for your power cut</li>${result.kind==='solar'?`<li>${result.existing==='panels'||result.existing==='both'?'Check your existing solar panels':'Solar panels and a suitable controller'}</li>`:''}<li>Installation and compatibility review</li></ul><p class="solution-confirmation">This is a starting estimate. An installer confirms the final design.</p>`}`;
  if (view.trim && result.closestUnit) byId('result-content').querySelector('.result-trim p').textContent=`Cut the ${result.nearMissTrim.applianceLabel.toLowerCase()} by ${result.nearMissTrim.reduceByHours} hours and a smaller power station fits.`;
  byId('result-content').querySelectorAll('[data-solution-option]').forEach(button=>button.addEventListener('click',()=>{optionSlug=button.dataset.solutionOption;render();byId('result-unit-name').setAttribute('tabindex','-1');byId('result-unit-name').focus({preventScroll:true});}));
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
  if(result.sizing){const s=result.sizing;byId('calculator-technical').querySelector('[data-level="technical"]').insertAdjacentHTML('beforeend',`<p>Preliminary sizing: ${s.batteryWh} Wh nominal battery, ${s.inverterW} W continuous inverter, ${s.peakW} W simultaneous starting load.</p><p>Battery = energy including losses / 0.8 usable fraction. Inverter = running watts x 1.25, rounded up.</p>${result.kind==='solar'?`<p>Solar = energy / (${s.sunHours} peak sun hours x 0.75 system yield), rounded up: ${s.panelW} W. Sun hours are an assumption, not a local weather forecast.</p>`:''}<p>Installer must check battery BMS support, voltage, discharge current, panel Voc at low temperature, MPPT range, wiring and protection.</p>`);}
  byId('calculator-technical').querySelector('details').open = wasOpen;
  byId('btn-checkout').hidden = !canCheckout(unit);
  byId('btn-whatsapp').textContent = result.availabilityLimited ? 'Ask about availability' : !unit ? 'Get my setup quote' : 'Get my options on WhatsApp';
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
byId('solution-goal').addEventListener('change',event=>dispatch({type:'goal',value:event.target.value}));
byId('existing-equipment').addEventListener('change',event=>dispatch({type:'existing',value:event.target.value}));
byId('solar-hours').addEventListener('input',event=>dispatch({type:'sun',value:event.target.value}));
document.querySelectorAll('[data-need]').forEach(link=>link.addEventListener('click',()=>{
  const need=needs.find(n=>n.id===link.dataset.need); if(!need)return;
  dispatch({type:'preset',id:need.preset});
  if(need.appliance){dispatch({type:'toggle',id:need.appliance});dispatch({type:'hours',id:need.appliance,delta:need.appliance==='laptop'?-3:-2});}
  dispatch({type:'goal',value:need.goal});if(mobile.matches)goToStep(2);
}));
byId('reset-calc').addEventListener('click',()=>{dispatch({type:'clear'});if(mobile.matches)goToStep(2);});
mobile.addEventListener('change',renderStep);
export function applyPreset(id) { dispatch({type:'preset',id}); }
window.__applyPreset = applyPreset;
render();

byId('btn-whatsapp').addEventListener('click', () => {
  if (!latest || latest.result.state === 'empty') return;
  const { result, selections, outageHours } = latest;
  const unit = result.bestFit;
  const message = solutionEnquiry(result,selections,outageHours,latest.budget);
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
