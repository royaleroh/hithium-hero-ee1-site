import { catalogue } from '../data/catalogue.js';
import { deriveLoad, checkProduct, recommend, computePayback } from './recommend.js';

export const solutionLabels = { 'power-bank':'USB power bank', portable:'Portable power station', installed:'Inverter and battery setup', solar:'Solar and battery setup' };
export function solutionKind(product) { return product?.tier==='power-bank' ? 'power-bank' : 'portable'; }
export function solutionTitle(product) {
  if (!product) return 'Installed power setup';
  if (product.tier==='power-bank') return product.supportsLaptop ? 'Laptop power bank' : 'Phone power bank';
  if(!product.acOutput)return 'USB and router backup';
  return product.usableWh<=400?'Compact power station':product.usableWh<=1100?'Everyday power station':'Extended backup station';
}

// Conservative per-port matching. A USB bank never powers an AC appliance or a 12 V router by assumption.
export function bankSupports(product,selections,load) {
  if (product.tier!=='power-bank' || product.specStatus!=='verified' || !product.available || !Number.isFinite(product.usableWh) || !Number.isFinite(product.maxOutputW)) return false;
  const active=selections.filter(s=>s.qty>0&&s.hours>0);
  if (active.some(s=>!['phone-charger','laptop'].includes(s.id) || s.acRequired || (s.id==='laptop'&&!product.supportsLaptop))) return false;
  if (!checkProduct(product,load).passes) return false;
  const needs=active.flatMap(s=>Array(s.qty).fill(s.watts)).sort((a,b)=>b-a);
  const ports=[...(product.usbPortWatts??[])].sort((a,b)=>b-a);
  return needs.length<=ports.length && needs.every((watts,i)=>watts<=ports[i]);
}

export function systemSizing(load,{sunHours=4}={}) {
  sunHours=Math.min(8,Math.max(1,Number(sunHours)||4));
  // Preliminary design assumptions, shown in the UI and confirmed in an installer quote.
  const batteryWh=Math.ceil(load.energyNeedWh/0.8/500)*500;
  const inverterW=Math.max(500,Math.ceil(load.runningW*1.25/500)*500);
  const panelW=Math.ceil(load.energyNeedWh/(sunHours*0.75)/100)*100;
  return {batteryWh,inverterW,peakW:load.peakW,panelW,sunHours,usableFraction:0.8,solarDerating:0.75,installerReview:true};
}

export function recommendSolutions(input={},products=catalogue.products) {
  const selections=input.selections??[];
  const portable=recommend(input,products);
  if (portable.state==='empty') return {...portable,kind:'empty',options:[]};
  const load=deriveLoad(selections,input.outageHours??8);
  const preference=input.goal??'auto';
  const goal=preference==='auto' && input.existing && input.existing!=='none'
    ? (input.existing==='panels'||input.existing==='both'?'solar':'installed') : preference;
  const matching=products.filter(p=>p.available && (goal!=='portable' || p.tier==='portable') && (
    (p.tier==='portable' && p.calculatorEligible && checkProduct(p,load).passes) || bankSupports(p,selections,load)
  )).sort((a,b)=>a.usableWh-b.usableWh || a.maxOutputW-b.maxOutputW);
  const budget=input.budget==='' || input.budget==null ? null : Number(input.budget);
  const kind=matching.length?solutionKind(matching[0]):null;
  const group=matching.filter(p=>solutionKind(p)===kind);
  // A missing bank price must not turn a phone enquiry into a much larger station purchase.
  const affordable=Number.isFinite(budget) ? group.filter(p=>Number.isFinite(p.price)&&p.price>0&&p.price<=budget) : [];
  const options=affordable.length ? [...affordable,...group.filter(p=>!affordable.includes(p))] : group;
  if (goal==='installed' || goal==='solar' || !options.length) {
    return {...portable,state:'none',bestFit:null,roomToGrow:null,nearMissTrim:null,kind:goal==='solar'?'solar':'installed',
      options:[],load,sizing:systemSizing(load,{sunHours:input.sunHours??4}),existing:input.existing??'none',
      availabilityLimited:!matching.length && portable.availabilityLimited};
  }
  const bestFit=options[0];
  if (bestFit.tier==='portable' && bestFit.slug===portable.bestFit?.slug) return {...portable,kind:'portable',options};
  const usagePercent=load.energyNeedWh/bestFit.usableWh*100;
  return {...portable,state:usagePercent>=85?'tight':'fit',bestFit,kind:solutionKind(bestFit),options,
    usagePercent,nearMissTrim:null,closestUnit:null,roomToGrow:usagePercent>=85?options[1]??null:null,
    payback:computePayback(bestFit.price,input.monthlyPowerSpend),
    budget:budget===null ? undefined : {amount:budget,status:bestFit.price===null?'unconfirmed':bestFit.price<=budget?'within':'over',
      shortfall:bestFit.price===null?null:Math.max(0,bestFit.price-budget)},
  };
}

export function solutionEnquiry(result,selections,outageHours,budget) {
  const lines=selections.filter(s=>s.qty>0&&s.hours>0).map(s=>`${s.label} x${s.qty}, ${s.hours} hours`).join('\n');
  const sizing=result.sizing;
  return `Hello! Please help me choose ${solutionLabels[result.kind]??'a power solution'}.\nMy power cut: ${outageHours} hours.\n${lines}`+
    (budget!=null?`\nUnit budget: NGN ${budget}.`:'')+
    (sizing?`\nPreliminary estimate: ${sizing.batteryWh} Wh battery, ${sizing.inverterW} W inverter, ${sizing.peakW} W starting load.`+
      (result.kind==='solar'?` Solar array estimate: ${sizing.panelW} W at ${sizing.sunHours} peak sun hours.`:'')+`\nExisting equipment: ${result.existing}. Please check compatibility, installation and the full price.`:'')+
    (result.bestFit?`\nCandidate reference: ${result.bestFit.slug}. Please confirm the actual brand, model, warranty and current price.`:'');
}
