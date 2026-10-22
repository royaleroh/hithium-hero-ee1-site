import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogue, portableProducts, DEFAULT_DAILY_OUTAGE_HOURS, DEFAULT_MONTHLY_POWER_SPEND } from '../data/catalogue.js';
import { presets } from '../data/presets.js';
import { estimateSetup, selectionsFromItems } from '../js/estimate.js';
import { recommend, buildWhatsAppMessage, computePayback } from '../js/recommend.js';
import { canCheckout, computeOrderTotal } from '../js/order.js';

const tank = catalogue.products.find(p => p.slug === 'itel-power-tank');
const go = catalogue.products.find(p => p.slug === 'itel-power-go');
const cases = [
  { name: 'student', items: [['laptop',1,2],['phone-charger',1,2],['router',1,4]], slug:'itel-power-go', state:'fit', energy:237.6 },
  { name: 'shop', items: [['led-bulb',4,8],['fan',1,8],['phone-charger',2,4],['router',1,8]], slug:'itel-power-tank-1000', state:'near-miss', energy:1075.2 },
  { name: 'fridge', items: [['mini-fridge',1,2]], slug:'itel-power-tank', state:'fit', energy:216 },
  { name: 'large load', items: [['mini-fridge',2,8],['tv',1,6],['fan',2,8]], slug:undefined, state:'none', energy:3264 },
];
const itemsFor = c => c.items.map(([applianceId,qty,hours]) => ({applianceId,qty,hours}));
for (const c of cases) test(`audit input: ${c.name}`, () => {
  const r = estimateSetup(itemsFor(c), {outageHours:8});
  assert.equal(r.bestFit?.slug,c.slug); assert.equal(r.state,c.state); assert.equal(r.load.energyNeedWh,c.energy);
});
for (const preset of presets) test(`audience and calculator agree: ${preset.id}`, () => {
  const preview = estimateSetup(preset.items);
  const selections = selectionsFromItems(preset.items);
  assert.ok(selections.every(s => s.id && typeof s.acRequired === 'boolean'));
  assert.deepEqual(preview, recommend({selections},portableProducts));
});
test('near miss works without IDs and cuts only the targeted row', () => {
  const selections = selectionsFromItems(itemsFor(cases[1])).map(({id,...s}) => s);
  const r = recommend({selections});
  assert.equal(r.state,'near-miss');
  assert.equal(r.nearMissTrim.reduceByHours,2);
  assert.equal(r.nearMissTrim.applianceLabel,'Standing or ceiling fan');
  assert.equal(selections.find(s=>s.watts===50).hours,8);
});
test('defaults come from catalogue exports', () => {
  const selections = selectionsFromItems([{applianceId:'mini-fridge',qty:1,hours:12}]);
  const r = recommend({selections});
  assert.equal(r.load.energyNeedWh,1.2*90*DEFAULT_DAILY_OUTAGE_HOURS);
  assert.deepEqual(r.payback,computePayback(r.bestFit.price,DEFAULT_MONTHLY_POWER_SPEND));
});
test('Lagos total includes the real catalogue delivery fee', () => {
  assert.deepEqual(computeOrderTotal(tank,'Lagos'),{subtotal:285000,deliveryFee:3000,total:288000});
});
test('Other states and unknown states use the fallback fee', () => {
  for (const state of ['Other states','Unknown state','']) assert.equal(computeOrderTotal(tank,state).total,293000);
});
test('checkout requires a priced, available portable unit', () => {
  assert.equal(canCheckout(go),false); assert.equal(canCheckout(tank),true);
  assert.equal(canCheckout(null),false); assert.equal(canCheckout({...tank,available:false}),false);
  assert.equal(computeOrderTotal(go,'Lagos'),null);
});
test('WhatsApp message includes model, price, appliances and outage hours', () => {
  const msg=buildWhatsAppMessage({productName:tank.name,productModel:tank.model,price:tank.price,selections:selectionsFromItems(itemsFor(cases[2])),outageHours:8});
  for(const text of [tank.name,tank.model,'₦285,000','Mini fridge x1, 2 h/day','8-hour outage']) assert.ok(msg.includes(text));
});
test('WhatsApp null price and whole home wording', () => {
  const params={productName:go.name,productModel:go.model,price:null,selections:[],outageHours:8};
  assert.match(buildWhatsAppMessage(params),/price on request/);
  assert.match(buildWhatsAppMessage({...params,wholeHomeSystem:true}),/whole home system/);
});
test('tight state returns a passing room-to-grow unit', () => {
  const r=estimateSetup([{applianceId:'laptop',qty:1,hours:3.5}]);
  assert.equal(r.state,'tight'); assert.equal(r.roomToGrow.slug,'itel-power-go-pro');
});
test('payback cannot round to zero and is capped at 60 months', () => {
  assert.equal(computePayback(1,10000).months,1);
  assert.equal(computePayback(285000,100).months,null);
});
test('near-miss chooses the smallest power-capable unit at equal capacity', () => {
  const r = estimateSetup([{applianceId:'laptop',qty:1,hours:4.5}]);
  assert.equal(r.state,'near-miss');
  assert.equal(r.closestUnit.slug,'itel-power-go');
});
