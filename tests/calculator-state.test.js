import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presets } from '../data/presets.js';
import { createCalculatorState, loadPreset, reduceCalculator, calculatorView, clampHours } from '../js/calculator-state.js';

test('calculator starts with exactly the Families preset and a real result', () => {
  const state = createCalculatorState();
  assert.equal(state.preset,'families');
  assert.deepEqual(state.items.filter(i=>i.enabled).map(({enabled,...i})=>i),presets.find(p=>p.id==='families').items.map(i=>({...i})).sort((a,b)=>state.items.findIndex(i=>i.applianceId===a.applianceId)-state.items.findIndex(i=>i.applianceId===b.applianceId)));
  assert.equal(calculatorView(state).result.bestFit.slug,'itel-power-tank-1000');
});
test('preset loading replaces the previous selection without mutating preset data', () => {
  const before=JSON.stringify(presets);
  const state=loadPreset(createCalculatorState(),'students');
  assert.equal(state.items.find(i=>i.applianceId==='fan').enabled,false);
  assert.equal(state.items.find(i=>i.applianceId==='laptop').hours,4);
  assert.equal(JSON.stringify(presets),before);
});
test('Custom and Clear all provide an empty selection with an empty spend field', () => {
  const initial=createCalculatorState();
  for(const state of [loadPreset(initial,'custom'),reduceCalculator(initial,{type:'clear'})]){
    assert.equal(calculatorView(state).result.state,'empty');assert.equal(state.spend,'');
  }
});
test('hours steppers advance one hour and clamp to 1 through 24', () => {
  assert.equal(clampHours(-10),1);assert.equal(clampHours(99),24);
  let state=createCalculatorState();
  const id='fan';const start=state.items.find(i=>i.applianceId===id).hours;
  state=reduceCalculator(state,{type:'hours',id,delta:1});
  assert.equal(state.items.find(i=>i.applianceId===id).hours,start+1);
  for(let i=0;i<50;i++)state=reduceCalculator(state,{type:'hours',id,delta:1});
  assert.equal(state.items.find(i=>i.applianceId===id).hours,24);
  for(let i=0;i<50;i++)state=reduceCalculator(state,{type:'hours',id,delta:-1});
  assert.equal(state.items.find(i=>i.applianceId===id).hours,1);
});
test('empty spend does not calculate payback or produce a zero-currency display', () => {
  const state=loadPreset(createCalculatorState(),'shops');
  const view=calculatorView(state);
  assert.equal(state.spend,'');assert.equal(view.spend,null);
  assert.equal(view.result.payback.months,null);
  assert.equal(view.paybackLine,'Add your monthly petrol spend to see payback.');
  assert.doesNotMatch(view.paybackLine,/₦0/);
});
test('typed spend produces payback only for a priced unit', () => {
  let state=loadPreset(createCalculatorState(),'shops');
  state=reduceCalculator(state,{type:'spend',value:'30000'});
  assert.equal(calculatorView(state).result.payback.months,10);
  state=loadPreset(state,'families');state=reduceCalculator(state,{type:'spend',value:'30000'});
  assert.equal(calculatorView(state).paybackLine,'');
});
test('mobile step transitions stay within Who, What and Your unit', () => {
  let state=createCalculatorState();assert.equal(state.step,1);
  for(const step of [2,3,2,1]){state=reduceCalculator(state,{type:'step',step});assert.equal(state.step,step);}
  assert.equal(reduceCalculator(state,{type:'step',step:0}).step,1);
  assert.equal(reduceCalculator(state,{type:'step',step:4}).step,3);
});
test('tile toggles and quantity edits retain a stable appliance identity', () => {
  let state=loadPreset(createCalculatorState(),'custom');
  state=reduceCalculator(state,{type:'toggle',id:'fan'});
  assert.equal(state.editingId,'fan');assert.equal(state.items.find(i=>i.applianceId==='fan').enabled,true);
  state=reduceCalculator(state,{type:'qty',id:'fan',delta:1});
  assert.equal(state.items.find(i=>i.applianceId==='fan').qty,2);
  state=reduceCalculator(state,{type:'toggle',id:'fan'});
  assert.equal(calculatorView(state).result.state,'empty');
});
