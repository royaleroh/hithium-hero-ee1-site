import { escapeHTML } from './plain.js';
import { formatNaira, formatNumber } from './format.js';
import { solutionTitle } from './solutions.js';

export function solutionPhoto(kind,{className='',eager=false}={}) {
  const image=kind==='laptop-bank'?'laptop-bank':kind==='power-bank'?'bank':kind==='portable'?'station':kind==='solar'?'solar':'system';
  const alt=image==='laptop-bank'?'Illustration of a laptop connected to a power bank by USB-C':'Generic '+image+' illustration';
  return `<figure class="solution-photo ${escapeHTML(className)}"><img src="assets/solutions/${image}.webp" alt="${escapeHTML(alt)}" width="768" height="768" ${eager?'':'loading="lazy"'}><figcaption>Illustration</figcaption></figure>`;
}
export function solutionOptions(options,currentIndex,energyNeedWh=0) {
  if (options.length < 2) return '';
  return `<section class="solution-options" aria-labelledby="alternatives-heading">
    <h4 id="alternatives-heading">Other matching options</h4>
    <div class="solution-option-grid">${options.map((p,index) => index === currentIndex ? '' : `<button type="button" data-solution-option="${index}"><strong>Option ${index + 1}: ${escapeHTML(solutionTitle(p))}</strong><small data-level="technical">${formatNumber(p.usableWh)} Wh storage · ${formatNumber(p.maxOutputW)} W output</small><small>${p.price===null?'Price on request':formatNaira(p.price)} · About ${Math.max(0,Math.floor(100-energyNeedWh/p.usableWh*100))}% charge left</small><span class="solution-option-action">Select this option <span aria-hidden="true">→</span></span></button>`).join('')}</div>
  </section>`;
}

export const needs = [
  {id:'phones',title:'Phones and tablets',kind:'power-bank',line:'A power bank for charging on the move.',action:'Find phone backup',preset:'custom',appliance:'phone-charger',goal:'auto'},
  {id:'laptops',title:'Work on the go',kind:'power-bank',imageKind:'laptop-bank',line:'USB-C laptop charging, without a wall socket.',action:'Find laptop backup',preset:'custom',appliance:'laptop',goal:'auto'},
  {id:'essentials',title:'Lights, fans and Wi-Fi',kind:'portable',line:'One rechargeable box for your daily essentials.',action:'Find a power station',preset:'shops',goal:'auto'},
  {id:'installed',title:'Home and shop backup',kind:'installed',line:'An inverter, a separate battery and installation.',action:'Plan my setup',preset:'families',goal:'installed'},
  {id:'solar',title:'Add power from the sun',kind:'solar',line:'Panels and storage, matched to your setup.',action:'Explore solar',preset:'families',goal:'solar'},
];
export function needCard(need) {
  return `<article class="trust-fact-card solution-card" aria-label="${escapeHTML(need.title)}"><h3 class="trust-fact-value">${need.title}</h3>${solutionPhoto(need.imageKind ?? need.kind)}<p>${need.line}</p><p class="range-example-note">Exact models confirmed on WhatsApp.</p><a class="solution-link" href="#calculator" data-need="${need.id}">${need.action}<span aria-hidden="true">↗</span></a></article>`;
}
