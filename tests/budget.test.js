import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommend,checkProduct} from '../js/recommend.js';
import {portableProducts} from '../data/catalogue.js';
import {selectionsFromItems} from '../js/estimate.js';
import {createCalculatorState,reduceCalculator,calculatorView} from '../js/calculator-state.js';
const light=selectionsFromItems([{applianceId:'laptop',qty:1,hours:2}]);
const fridge=selectionsFromItems([{applianceId:'mini-fridge',qty:1,hours:2}]);
test('blank or invalid budget preserves the original recommendation',()=>{
  const expected=recommend({selections:light});
  for(const budget of ['',null,undefined,-1,'wrong',Infinity])assert.deepEqual(recommend({selections:light,budget}),expected);
});
test('budget selects a suitable unit with a confirmed affordable price',()=>{
  const r=recommend({selections:light,budget:300000});
  assert.equal(r.bestFit.slug,'itel-power-tank');assert.equal(r.budget.status,'within');
  assert.equal(r.budget.unknownPriceFits,true);assert.ok(checkProduct(r.bestFit,r.load).passes);
});
test('exact budget is enough and delivery is not included',()=>{
  const r=recommend({selections:fridge,budget:285000});
  assert.equal(r.budget.status,'within');assert.equal(r.budget.shortfall,0);
});
test('too-small budget keeps the power-safe result and reports the shortfall',()=>{
  const r=recommend({selections:fridge,budget:200000});
  assert.equal(r.bestFit.slug,'itel-power-tank');assert.equal(r.budget.status,'over');assert.equal(r.budget.shortfall,85000);
  assert.ok(checkProduct(r.bestFit,r.load).passes);
});
test('unknown price is never treated as an affordable zero price',()=>{
  const state=reduceCalculator(createCalculatorState(),{type:'budget',value:'300000'});
  const r=calculatorView(state).result;
  assert.equal(r.bestFit.slug,'itel-power-tank-1000');assert.equal(r.budget.status,'unconfirmed');assert.equal(r.budget.shortfall,null);
});
test('zero budget cannot mark a positive-price unit as affordable',()=>{
  assert.equal(recommend({selections:fridge,budget:0}).budget.status,'over');
});
test('an unlimited budget never makes an undersized or ineligible unit pass',()=>{
  const selections=selectionsFromItems([{applianceId:'mini-fridge',qty:20,hours:8}]);
  const r=recommend({selections,budget:99999999});assert.equal(r.state,'none');assert.equal(r.bestFit,null);
});
test('budget still sorts suitable priced units by the existing size rules',()=>{
  const products=portableProducts.map((p,i)=>({...p,price:[150000,100000,285000,500000][i]}));
  const r=recommend({selections:light,budget:120000},products);
  assert.equal(r.bestFit.slug,'itel-power-go-pro');assert.equal(r.budget.status,'within');
});
test('budget persists when editing presets and Clear all resets it',()=>{
  let s=reduceCalculator(createCalculatorState(),{type:'budget',value:'250000'});
  s=reduceCalculator(s,{type:'preset',id:'shops'});assert.equal(s.budget,'250000');
  s=reduceCalculator(s,{type:'clear'});assert.equal(s.budget,'');assert.equal(calculatorView(s).result.state,'empty');
});
