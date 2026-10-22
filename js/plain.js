import { PHONE_CHARGE_WH } from '../config.js';
import { appliances } from '../data/appliances.js';
import { presets } from '../data/presets.js';
import { everydayLoads, applianceNames, presetNames, glossary } from '../data/plain-language.js';
import { recommend } from './recommend.js';
import { selectionsFromItems } from './estimate.js';

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function canRunAppliance(product, appliance, qty = 1) {
  return Boolean(product && appliance && product.calculatorEligible &&
    (!appliance.acRequired || product.acOutput) &&
    appliance.watts * qty <= product.maxOutputW &&
    appliance.watts * qty * appliance.surgeMultiplier <= (product.peakOutputW ?? product.maxOutputW));
}

export function plainDuration(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return 'less than 1 hour';
  if (hours < 2) return 'about 1 hour';
  if (hours > 48) {
    const days = Math.floor(hours / 24);
    return `about ${days} days`;
  }
  return `about ${Math.floor(hours)} hours`;
}

// All supported equivalents, before the four-line display limit.
export function equivalentFor(product, id) {
  const entry = everydayLoads.find(item => item.id === id);
  const appliance = appliances.find(item => item.id === id);
  if (!entry || !canRunAppliance(product, appliance, entry.qty)) return null;
  if (entry.kind === 'phone') return `about ${Math.floor(product.usableWh / (PHONE_CHARGE_WH * 1.2))} phone charges`;
  return `${plainDuration(product.usableWh / (appliance.watts * entry.qty * 1.2))} of ${entry.label}`;
}

export function everydayEquivalents(product) {
  return everydayLoads.map(entry => equivalentFor(product, entry.id)).filter(Boolean).slice(0, 4);
}

export function goodFor(product) {
  if (!product?.calculatorEligible) return [];
  return presets.filter(p => p.items.length && recommend({ selections: selectionsFromItems(p.items) }, [product]).bestFit?.slug === product.slug)
    .map(p => presetNames[p.id]);
}

export function wontRun(product) {
  if (!product?.calculatorEligible) return '';
  const blocked = appliances.filter(a => !canRunAppliance(product, a));
  if (!blocked.length) return '';
  const sockets = blocked.filter(a => a.acRequired && !product.acOutput);
  const output = blocked.filter(a => !sockets.includes(a));
  return [
    sockets.length ? `Will not run: ${sockets.map(a => applianceNames[a.id]).join(', ')}. They need a normal wall socket, and this one does not have one.` : '',
    output.length ? `Will not run: ${output.map(a => applianceNames[a.id]).join(', ')}. ${output.length === 1 ? 'It needs' : 'They need'} more power at once than this box can give.` : '',
  ].filter(Boolean).join(' ');
}

export function lifespan(productOrValue) {
  const raw = typeof productOrValue === 'object' ? productOrValue.cycleLife ?? productOrValue.key_specs?.cycle_life ?? productOrValue.specs?.find(s => s.label === 'Cycle life')?.value : productOrValue;
  const figures = String(raw ?? '').replaceAll(',', '').match(/\d+/g)?.map(Number) ?? [];
  if (!figures.length || Math.min(...figures) <= 0) return '';
  const cycles = Math.min(...figures);
  return `Rated for ${new Intl.NumberFormat('en-NG').format(cycles)} full charges, which is about ${Math.floor(cycles / 365)} years of charging once a day. (maker's rating)`;
}

// Reusable disclosure. Trusted HTML only; escape catalogue values at the call site.
export function technicalDetails(content, { className = '', id = '' } = {}) {
  return `<details class="tech ${escapeHTML(className)}"${id ? ` id="${escapeHTML(id)}"` : ''}><summary>Technical details</summary><div data-level="technical">${content}</div></details>`;
}

export function productTechnicalContent(product) {
  return `<p>Model: ${escapeHTML(product.model)}</p><table class="spec-table"><tbody>${product.specs.map(s => `<tr><th scope="row">${escapeHTML(s.label)}</th><td>${escapeHTML(s.value)}</td></tr>`).join('')}</tbody></table>
    <h4>Charging</h4><ul>${product.rechargeOptions.map(r => `<li>${escapeHTML(r.method)}: ${escapeHTML(r.detail)} (${escapeHTML(r.time)})</li>`).join('')}</ul>
    <h4>In the box</h4><ul>${product.inTheBox.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
    ${product.slug === 'itel-power-go' ? `<p>Most routers can run from this unit. Check the label on your router's charger.</p><p>Check that it says 12 V.</p>` : ''}
    <dl>${Object.entries(glossary).map(([term, meaning]) => `<dt>${escapeHTML(term)}</dt><dd>${escapeHTML(meaning)}</dd>`).join('')}</dl>`;
}

export function productPlainContent(product) {
  const fits = goodFor(product);
  return `<ul class="everyday-lines">${everydayEquivalents(product).map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ul><p>These are separate examples, each from a full charge.</p>
    ${fits.length ? `<p>Good for: ${escapeHTML(fits.join(', '))}.</p>` : '<p>Choose your appliances to check this one.</p>'}
    ${wontRun(product) ? `<p>${escapeHTML(wontRun(product))}</p>` : ''}`;
}
