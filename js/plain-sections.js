import { plainCopy } from '../data/plain-language.js';
import { lifespan, technicalDetails, productTechnicalContent, escapeHTML } from './plain.js';
import { estimateSetup } from './estimate.js';
import { appliances } from '../data/appliances.js';

export function faqAnswers(product) {
  const fridge = estimateSetup([{ applianceId: 'mini-fridge', qty: 1, hours: 2 }], { outageHours: 8 });
  const appliance = appliances.find(a => a.id === 'mini-fridge');
  return [
    'Choose your lights, fan and other appliances in the calculator. It shows how long your chosen box can run them.',
    fridge.bestFit ? `For the small fridge in our calculator, choose the ${escapeHTML(fridge.bestFit.name)}. Ask us to check your fridge before you buy.${technicalDetails(`<p>Mini fridge: ${appliance.watts} W, surge x${appliance.surgeMultiplier}, 2 hours, 8 outage hours. Energy including losses: ${fridge.load.energyNeedWh} Wh; peak: ${fridge.load.peakW} W.</p>`)}` : 'Ask us to check your fridge before you buy.',
    `Charge it from the wall or a solar panel, sold separately. Use both together for the fastest refill.${technicalDetails(product.rechargeOptions.map(r => `<p>${escapeHTML(r.method)}: ${escapeHTML(r.detail)}. ${escapeHTML(r.time)}.</p>`).join(''))}`,
    `The maker rates it for many full charges. Actual battery life depends on how you use it.${technicalDetails(`<p>${escapeHTML(lifespan(product))}</p>${productTechnicalContent(product)}`)}`,
    'Ask us on WhatsApp and we will answer for your unit.',
    `Ask us which faults your warranty covers before you buy.${technicalDetails(`<p>Warranty: ${escapeHTML(product.warranty)}. Ask us to confirm the full terms.</p>`)}`,
    'Check the delivery table above for your state. We confirm the delivery time on WhatsApp.',
    'An inverter system is built into your house. It needs an installer and separate batteries, and costs much more. This is one box. You plug it in and it works.',
    'You may need a whole home system with a separate battery and installer. Message us and we will help you choose.',
  ];
}

export function gapDescription(step) {
  if (step.id === 'power-bank') return plainCopy.gap['power-bank'];
  if (step.id === 'power-station') return plainCopy.gap['power-station'];
  return plainCopy.gap.inverter;
}
