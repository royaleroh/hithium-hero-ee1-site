import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyProductControls } from '../data/product-controls.js';
import { catalogue, portableProducts, productControlErrors } from '../data/catalogue.js';
import { recommend, computePayback, checkProduct, deriveLoad, buildWhatsAppMessage } from '../js/recommend.js';
import { canCheckout, computeOrderTotal } from '../js/order.js';
import { productCard } from '../js/product-card.js';
import { resultPresentation } from '../js/result-view.js';

const controls = JSON.parse(await readFile(new URL('../products.json', import.meta.url), 'utf8'));
const resolve = overrides => applyProductControls(catalogue.products, { ...controls, ...overrides }).products;
const load = [{label:'Fan', watts:50,qty:1,hours:8,surgeMultiplier:2,acRequired:true}];

test('controller covers every product and all three Hithium portables have researched ratings', () => {
  assert.deepEqual(productControlErrors, []);
  assert.equal(portableProducts.length, 7);
  for (const [slug,wh,w,price] of [['hithium-heroee-1',1004.8,200,270000],['hithium-heroee-light-1',1004.8,500,310000],['hithium-heroee-2',2009.6,1000,670000]]) {
    const p = portableProducts.find(p=>p.slug===slug);
    assert.equal(p.usableWh,wh); assert.equal(p.maxOutputW,w); assert.equal(p.price,price);
    assert.equal(p.acOutput,true); assert.equal(p.peakOutputW,null);
  }
});

test('name and price overrides reach recommendations, quotes, payback and checkout totals', () => {
  const products = resolve({'itel-power-tank':{name:'My renamed unit',price:250000,available:true}});
  const r = recommend({selections:load},products);
  assert.equal(r.bestFit.name,'My renamed unit'); assert.equal(r.bestFit.price,250000);
  assert.equal(computePayback(r.bestFit.price,25000).months,10);
  assert.equal(computeOrderTotal(r.bestFit,'Lagos').total,253000);
  assert.match(buildWhatsAppMessage({productName:r.bestFit.name,productModel:r.bestFit.model,price:r.bestFit.price,selections:load,outageHours:8}),/My renamed unit.*250,000/);
});

test('availability is respected with or without a budget and in checkout and cards', () => {
  const products=resolve({'itel-power-tank':{...controls['itel-power-tank'],available:false}});
  for (const budget of [undefined,300000]) assert.equal(recommend({selections:load,budget},products).bestFit.slug,'hithium-heroee-1');
  const p=products.find(p=>p.slug==='itel-power-tank');
  assert.equal(canCheckout(p),false); assert.match(productCard(p),/Not available to order/);
  assert.doesNotMatch(productCard(p),/285,000|wa.me/);
});

test('budget can select Hithium without weakening power checks', () => {
  const r=recommend({selections:load,budget:280000});
  assert.equal(r.bestFit.slug,'hithium-heroee-1'); assert.equal(r.budget.status,'within');
  const fridge=[{label:'Fridge',watts:90,qty:1,hours:2,surgeMultiplier:3,acRequired:true}];
  assert.equal(checkProduct(portableProducts.find(p=>p.slug==='hithium-heroee-1'),deriveLoad(fridge,8)).passes,false);
  const onlyHithium=portableProducts.filter(p=>p.brand==='Hithium');
  assert.equal(recommend({selections:fridge},onlyHithium).bestFit.slug,'hithium-heroee-light-1');
});

test('null price disables checkout and payback and never becomes free within a budget', () => {
  const products=resolve({'itel-power-tank':{...controls['itel-power-tank'],price:null}});
  const r=recommend({selections:load},products);
  assert.equal(r.bestFit.price,null); assert.equal(canCheckout(r.bestFit),false);
  assert.equal(r.payback.months,null);
  assert.equal(recommend({selections:load,budget:280000},products).bestFit.slug,'hithium-heroee-1');
});

test('missing or malformed controls fail closed; unknown fields cannot change specifications', () => {
  for (const bad of [null,[],{}, {'itel-power-tank':{name:'Broken',price:-1,available:true}}]) {
    const r=applyProductControls(catalogue.products,bad);
    assert.ok(r.errors.length); assert.ok(r.products.every(p=>!p.available && p.price===null));
  }
  for(const price of ['285000',0,-1]) assert.equal(applyProductControls([catalogue.products[2]],{'itel-power-tank':{name:'X',price,available:true}}).products[0].available,false);
  const p=resolve({'itel-power-tank':{name:'Safe',price:1,available:true,usableWh:999999,tier:'cell'}}).find(p=>p.slug==='itel-power-tank');
  assert.equal(p.usableWh,1000); assert.equal(p.tier,'portable');
});

test('all unavailable is a stock enquiry, not a whole-home recommendation', () => {
  const r=recommend({selections:load},portableProducts.map(p=>({...p,available:false})));
  assert.equal(r.availabilityLimited,true); assert.equal(r.bestFit,null);
  assert.match(resultPresentation(r,load,8).coverage,/unavailable/);
  const message=buildWhatsAppMessage({selections:load,outageHours:8,price:null,availabilityEnquiry:true});
  assert.match(message,/available unit/); assert.doesNotMatch(message,/whole home|undefined/);
});

test('cells and home batteries stay ineligible even when commercial availability is enabled', () => {
  const products=catalogue.products.filter(p=>['home-battery','cell'].includes(p.tier)).map(p=>({...p,available:true,price:1}));
  assert.equal(recommend({selections:load},products).bestFit,null);
  assert.ok(products.every(p=>!canCheckout(p)));
});

test('editable names render as text instead of markup', () => {
  const p={...portableProducts[0],name:'Unit <em>special</em>'};
  assert.match(productCard(p),/Unit &lt;em&gt;special&lt;\/em&gt;/);
  assert.doesNotMatch(productCard(p),/<em>/);
});
