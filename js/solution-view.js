import { escapeHTML } from './plain.js';
import { formatNaira } from './format.js';
import { solutionTitle } from './solutions.js';

export function solutionPhoto(kind,{className='',eager=false}={}) {
  const image=kind==='power-bank'?'bank':kind==='portable'?'station':kind==='solar'?'solar':'system';
  return `<figure class="solution-photo ${escapeHTML(className)}"><img src="assets/solutions/${image}.webp" alt="Generic ${escapeHTML(image)} illustration" width="768" height="768" ${eager?'':'loading="lazy"'}><figcaption>Illustration</figcaption></figure>`;
}
export function solutionOptions(options,currentSlug,energyNeedWh=0) {
  if(options.length<2)return '';
  return `<details class="solution-options"><summary>Compare ${options.length} suitable choices</summary><div>${options.map((p,i)=>`<button type="button" data-solution-option="${escapeHTML(p.slug)}" aria-pressed="${p.slug===currentSlug}"><span>Option ${i+1}: ${escapeHTML(solutionTitle(p))}</span><small>About ${Math.max(0,Math.floor(100-energyNeedWh/p.usableWh*100))}% left. ${p.price===null?'Price on request':formatNaira(p.price)}${p.slug===currentSlug?' · Selected':''}</small></button>`).join('')}</div></details>`;
}

export const needs = [
  {id:'phones',title:'Phones and tablets',kind:'power-bank',line:'A power bank for charging on the move.',action:'Find phone backup',preset:'custom',appliance:'phone-charger',goal:'auto'},
  {id:'laptops',title:'Work on the go',kind:'power-bank',line:'USB-C laptop charging, without a wall socket.',action:'Find laptop backup',preset:'custom',appliance:'laptop',goal:'auto'},
  {id:'essentials',title:'Lights, fans and Wi-Fi',kind:'portable',line:'One rechargeable box for your daily essentials.',action:'Find a power station',preset:'shops',goal:'auto'},
  {id:'installed',title:'Home and shop backup',kind:'installed',line:'An inverter, a separate battery and installation.',action:'Plan my setup',preset:'families',goal:'installed'},
  {id:'solar',title:'Add power from the sun',kind:'solar',line:'Panels and storage, matched to your setup.',action:'Explore solar',preset:'families',goal:'solar'},
];
export function needCard(need) {
  return `<article class="trust-fact-card solution-card" aria-label="${escapeHTML(need.title)}"><h3 class="trust-fact-value">${need.title}</h3>${solutionPhoto(need.kind)}<p>${need.line}</p><p class="range-example-note">Model and price confirmed with your options.</p><a class="solution-link" href="#calculator" data-need="${need.id}">${need.action}<span aria-hidden="true">↗</span></a></article>`;
}
