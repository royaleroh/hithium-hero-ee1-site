import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogue,productControlErrors} from '../data/catalogue.js';
import {solutionProducts} from '../data/solution-products.js';
import {recommendSolutions,bankSupports,systemSizing,solutionEnquiry} from '../js/solutions.js';
import {deriveLoad,checkProduct} from '../js/recommend.js';
import {selectionsFromItems} from '../js/estimate.js';
import {canCheckout} from '../js/order.js';
const selections=(id,qty,hours)=>selectionsFromItems([{applianceId:id,qty,hours}]);
const phone=selections('phone-charger',1,2);

test('research catalogue has ten power banks per requested brand and ten inverters and panels',()=>{
 for(const brand of ['oraimo','itel','New Age'])assert.equal(solutionProducts.filter(p=>p.brand===brand&&p.tier==='power-bank').length,10);
 for(const tier of ['inverter','solar-panel'])assert.equal(solutionProducts.filter(p=>p.tier===tier).length,10);
 assert.deepEqual(productControlErrors,[]);
 assert.equal(new Set(catalogue.products.map(p=>p.slug)).size,catalogue.products.length);
});
test('a phone selects a verified small USB power bank and retains other suitable options',()=>{
 const r=recommendSolutions({selections:phone,outageHours:8});
 assert.equal(r.kind,'power-bank');assert.equal(r.bestFit.model,'OPB-7100Q');
 assert.equal(r.load.energyNeedWh,24);assert.ok(r.options.length>1);
 assert.equal(r.bestFit.price,null);assert.equal(canCheckout(r.bestFit),false);
});
test('a short laptop load uses verified USB-C output and bank energy',()=>{
 const r=recommendSolutions({selections:selections('laptop',1,1)});
 assert.equal(r.bestFit.model,'OPB-727SQ');assert.equal(r.kind,'power-bank');
 assert.equal(r.load.energyNeedWh,78);
 const longer=recommendSolutions({selections:selections('laptop',1,2)});
 assert.equal(longer.kind,'portable');assert.ok(longer.bestFit.usableWh>=156);
});
test('USB banks never inherit 12 V router or wall-socket support',()=>{
 for(const id of ['router','led-bulb','fan','mini-fridge']){
  const r=recommendSolutions({selections:selections(id,1,1)});
  assert.notEqual(r.kind,'power-bank');
 }
});
test('per-port limits reject two 65 W laptops even when a marketing total seems sufficient',()=>{
 const p={...catalogue.products.find(p=>p.model==='OPB-727SQ'),usableWh:1000,maxOutputW:150};
 const s=selections('laptop',2,1);
 assert.equal(checkProduct(p,deriveLoad(s,8)).passes,true);
 assert.equal(bankSupports(p,s,deriveLoad(s,8)),false);
});
test('unknown electrical ratings remain ineligible even if availability and price are enabled',()=>{
 const candidates=catalogue.products.filter(p=>p.tier==='power-bank'&&p.specStatus!=='verified').map(p=>({...p,available:true,price:1,usableWh:9999,maxOutputW:999,usbPortWatts:[100,100]}));
 assert.equal(recommendSolutions({selections:phone},candidates).bestFit,null);
 assert.ok(candidates.every(p=>!canCheckout(p)));
});
test('budget never relaxes suitability and model availability controls both routes',()=>{
 const r=recommendSolutions({selections:phone,budget:300000});
 assert.equal(r.budget.status,'unconfirmed');assert.equal(r.bestFit.model,'OPB-7100Q');
 const p=catalogue.products.find(p=>p.model==='OPB-7100Q');
 const list=catalogue.products.map(x=>({...x,available:x.slug!==p.slug&&x.available}));
 assert.notEqual(recommendSolutions({selections:phone},list).bestFit.slug,p.slug);
});
test('installed and solar preferences return preliminary designs rather than a fabricated compatible bundle',()=>{
 for(const goal of ['installed','solar']){
  const r=recommendSolutions({selections:selections('mini-fridge',2,8),goal});
  assert.equal(r.kind,goal);assert.equal(r.bestFit,null);assert.ok(r.sizing.installerReview);
  assert.equal(canCheckout(r.bestFit),false);
 }
});
test('existing equipment is retained in enquiry and solar assumptions are adjustable',()=>{
 const r=recommendSolutions({selections:phone,existing:'both',sunHours:3});
 assert.equal(r.kind,'solar');assert.equal(r.existing,'both');
 const message=solutionEnquiry(r,phone,8,300000);
 assert.match(message,/Existing equipment: both/);assert.match(message,/3 peak sun hours/);assert.match(message,/compatibility/);
 assert.ok(systemSizing({energyNeedWh:3000,runningW:500,peakW:1000},{sunHours:3}).panelW>systemSizing({energyNeedWh:3000,runningW:500,peakW:1000},{sunHours:6}).panelW);
});
test('large loads produce separate energy, running and starting requirements',()=>{
 const r=recommendSolutions({selections:selections('mini-fridge',20,8)});
 assert.equal(r.kind,'installed');assert.ok(r.sizing.batteryWh>=r.load.energyNeedWh/.8);
 assert.ok(r.sizing.inverterW>=r.load.runningW*1.25);
 assert.equal(r.sizing.peakW,r.load.peakW);
});
test('empty selections remain empty even with installed or solar preferences',()=>{
 for(const goal of ['auto','solar','installed'])assert.equal(recommendSolutions({selections:[],goal}).state,'empty');
});
