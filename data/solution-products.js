// Research selection, not a best-seller ranking. Sources and gaps: SOLUTIONS_RESEARCH.md.
const oraSource = 'https://www.oraimo.com/en/collections/power-bank';
const itelSource = 'https://ng.itelhome.shop/collections/powerbank?page=1';
const newAgeSource = 'https://alkayconcepts.com/product-category/new-age-power-bank/';
const bankRows = [
  ['oraimo','Toast 22.5 Byte','OPB-7100Q',10000,22.5],
  ['oraimo','PowerJet 130','OPB-727SQ',27600,130],
  ['oraimo','PowerBox 600','OPB-P600Q-U97S',60000,22.5],
  ['oraimo','PowerNova Q21','OPB-7200Q',20000,22.5],
  ['oraimo','PowerNova L21','OPB-7203C',20000,30],
  ['oraimo','PowerNova Q31','OPB-7300Q',30000,22.5],
  ['oraimo','PowerNova Q41','OPB-7401Q',40000,35],
  ['oraimo','PowerNova L11','OPB-7103C',10000,22.5],
  ['oraimo','Traveler 15','OPB-1201P',20000,15],
  ['oraimo','PowerBox 300 Lite','OPB-1301',30000,15],
  ['itel','Star 200','Star 200',20000,15],
  ['itel','PowerPulse','A1481',27000,22.5],
  ['itel','PowerPulse Turbo','A1990',60000,65],
  ['itel','PowerEasy','A1820',10000,22.5],
  ['itel','PowerEasy 1','A1111',5000,12],
  ['itel','PowerPulse','A1420',10000,20],
  ['itel','PowerEasy 1','A1110',5000,12],
  ['itel','PowerPulse Turbo','A1980',27000,65],
  ['itel','PowerEasy 1','A1123',10000,15],
  ['itel','PowerEasy Nano','A1421',10000,22.5],
  // New Age names are sourcing leads only. Primary electrical specifications not found.
  ['New Age','Turbo Ultra 3','Turbo Ultra 3',null,null],
  ['New Age','Turbo Ultra 4','Turbo Ultra 4',null,null],
  ['New Age','Turbo Ultra 5','Turbo Ultra 5',null,null],
  ['New Age','Turbo Ultra 8','Turbo Ultra 8',null,null],
  ['New Age','Turbo Ultra 11','Turbo Ultra 11',null,null],
  ['New Age','Y107 Pro','Y107 Pro',null,null],
  ['New Age','J208','J208',null,null],
  ['New Age','J159-20KS','J159-20KS',null,null],
  ['New Age','Turbo Prime 3','Turbo Prime 3',null,null],
  ['New Age','FC50P','FC50P',null,null],
];
const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const base = (brand,name,model,tier,source) => ({
  id: slugify(`${brand}-${model}`), slug: slugify(`${brand}-${model}`), brand, name: `${brand} ${name}`, model, tier,
  calculatorEligible: false, available: false, price: null, acOutput: false,
  usableWh: null, maxOutputW: null, peakOutputW: null, specStatus: 'partial', source,
  warranty: 'Confirm with your quotation', inTheBox: ['Confirm with your quotation'], rechargeOptions: [], specs: [],
  photos: [], images: [],
});
export const researchedPowerBanks = bankRows.map(([brand,name,model,capacityMah,advertisedOutputW]) => {
  const p = { ...base(brand,name,model,'power-bank',brand==='oraimo'?oraSource:brand==='itel'?itelSource:newAgeSource), capacityMah, advertisedOutputW,
    missingSpecs: ['Battery energy in Wh', 'Combined output and per-port limits'] };
  if(brand==='New Age'){
    p.specStatus='unverified';
    if(['FC50P','J159-20KS'].includes(model))p.source='https://mypadistore.com/product-category/new-age-power-banks/';
    if(model==='J208')p.source='https://www.jonathan.ng/shop/new-age-j208-power-bank/';
    if(model==='Turbo Ultra 8')p.source='https://www.jumia.com.ng/new-age-power-bank-22500mahh-typec-inout-2usb-turbo-ultra8-257252303.html';
  }
  if (brand==='oraimo' && model==='OPB-7100Q') Object.assign(p, {
    specStatus:'verified', usableWh:37, maxOutputW:15, usbPortWatts:[15,15,15], supportsLaptop:false,
    source:'https://ng.oraimo.com/product/oraimo-toast-22.5-byte-22.5w-10000mah-power-bank?ean=4894947050954', missingSpecs:[],
  });
  if (brand==='oraimo' && model==='OPB-727SQ') Object.assign(p, {
    specStatus:'verified', usableWh:99.3, maxOutputW:115, usbPortWatts:[100,30,22.5], supportsLaptop:true,
    source:'https://ng.oraimo.com/product/oraimo-powerjet-130-27600mah-smart-display-130w-fast-charge-power-bank-for-laptop-and-phone?ean=4894947025495', missingSpecs:[],
  });
  if (brand==='oraimo' && model==='OPB-P600Q-U97S') Object.assign(p, {
    specStatus:'partial', usableWh:222, usbPortWatts:[22.5,22.5,15,15,20], supportsLaptop:false,
    source:'https://ng.oraimo.com/product/oraimo-powerbox-600-22-5w-pd-qc-5-outputs-60000mah-with-charger-type-c-cable-portable-power-bank?ean=4895180791857',
    missingSpecs:['Combined output limit'],
  });
  p.specs = [
    {label:'Model',value:p.model}, {label:'Capacity',value:capacityMah ? `${capacityMah} mAh` : 'Not confirmed'},
    {label:'Battery energy',value:p.usableWh ? `${p.usableWh} Wh` : 'Not confirmed'},
    {label:'Combined output used by calculator',value:p.maxOutputW ? `${p.maxOutputW} W` : 'Not confirmed'},
    {label:'Warranty',value:p.warranty},
  ];
  return p;
});

const deyeSource = 'https://cn.deyeinverter.com/product/hybrid-inverter-1/sun36-5ksg01-03lp1eu.html';
const deyeFamily = 'https://www.deyeinverter.com/product/hybrid-inverter-1/';
const inverterRows = [
  ...[3,3.6,5,6].map(kw=>['Deye',`SUN-${kw}K-SG03LP1-EU-P`,kw*1000,deyeSource]),
  ...[3,4,5,6].map(kw=>['Deye',`SUN-${kw}K-SG06LP1-EU-BM1/BM2`,null,deyeFamily]),
  ['Growatt','SPF 6000 ES Plus',null,'https://en.growatt.com/products/spf-6000-es-plus'],
  ['Growatt','SPF 5000 ES',null,'https://us.growatt.com/upload/file/2026-Product-Overview-MIN-Installation-Commissioning.pdf'],
];
export const researchedInverters = inverterRows.map(([brand,model,watts,source])=>({
  ...base(brand,model,model,'inverter',source), maxOutputW:watts,
  peakOutputW:watts ? watts*2 : null, batteryVoltageRange:watts ? [40,60] : null,
  specStatus:watts?'verified':'partial', requiresInstaller:true,
}));
const jinkoSource='https://jinkosolar.com.au/products-new/';
const trinaSource='https://static.trinasolar.com/sites/default/files/Datasheet_Vertex%20S%2B_NEG9R.28_EN_2024_C_web.pdf';
export const researchedPanels = [
  ...[410,420,430].map(w=>({...base('Jinko',`Tiger Neo ${w} W`,`Tiger Neo 54 HL4 ${w}W`,'solar-panel',jinkoSource),ratedPanelW:w,specStatus:'partial'})),
  ...[460,480].map(w=>({...base('Jinko',`Tiger Neo ${w} W`,`Tiger Neo 60 HL4 ${w}W`,'solar-panel',jinkoSource),ratedPanelW:w,specStatus:'partial'})),
  ...[430,435,440,445,450].map((w,i)=>({...base('Trina',`Vertex S+ ${w} W`,`TSM-${w}NEG9R.28`,'solar-panel',trinaSource),
    ratedPanelW:w, vmp:[43.2,43.6,44,44.3,44.6][i], voc:[51.4,51.8,52.2,52.6,52.9][i],
    imp:[9.96,9.99,10.01,10.05,10.09][i], isc:[10.59,10.64,10.67,10.71,10.74][i],specStatus:'verified'})),
];
export const solutionProducts = [...researchedPowerBanks,...researchedInverters,...researchedPanels];
