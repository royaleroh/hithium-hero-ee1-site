import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateSetup,selectionsFromItems} from '../js/estimate.js';
import {resultPresentation,coverageMeter,trimAction} from '../js/result-view.js';
import {productPhoto} from '../js/product-photo.js';
import {portableProducts} from '../data/catalogue.js';
import {presets} from '../data/presets.js';
import {checkProduct} from '../js/recommend.js';
test('coverage describes the outage window and leaves a conservative remaining charge',()=>{
 const items=presets.find(p=>p.id==='families').items;
 const r=estimateSetup(items);const v=resultPresentation(r,selectionsFromItems(items),8);
 assert.equal(v.coverage,'Covers your 8-hour power cut.');assert.equal(v.explanation,'Based on the hours you chose.');assert.equal(v.chargeLeft,41);
 assert.equal(v.price,"Ask for today's price");assert.equal(v.status,'Your setup is covered');
});
test('tight and none states never promise room to spare or a portable fit',()=>{
 const items=[{applianceId:'laptop',qty:1,hours:4}];const r=estimateSetup(items);
 assert.equal(resultPresentation(r,selectionsFromItems(items),8).status,'Only just enough');
 const big=[{applianceId:'mini-fridge',qty:20,hours:8}];const v=resultPresentation(estimateSetup(big),selectionsFromItems(big),8);
 assert.equal(v.status,'A bigger system is needed');assert.equal(v.chargeLeft,null);assert.equal(v.price,'');
});
test('near-miss wording names the actual appliance, cut and smaller unit',()=>{
 const items=presets.find(p=>p.id==='shops').items.map(i=>i.applianceId==='fan'?{...i,hours:8}:i);
 const v=resultPresentation(estimateSetup(items),selectionsFromItems(items),8);
 assert.equal(v.trim,'Cut the fan by 2 hours and Power Tank fits.');
});
test('budget and price display retain the recommender facts',()=>{
 const items=presets.find(p=>p.id==='shops').items;
 const r=estimateSetup(items,{budget:200000});const v=resultPresentation(r,selectionsFromItems(items),8);
 assert.equal(v.budgetLine,'₦85,000 above your budget.');assert.equal(v.price,'₦285,000');
});
test('photo markup uses local catalogue images and declared dimensions',()=>{
 for(const p of portableProducts){const html=productPhoto(p);assert.ok(html.includes(p.photos[0]));assert.match(html,/src="assets\/products\//);assert.ok(html.includes(`width="${p.imageWidth}"`));assert.ok(html.includes(`height="${p.imageHeight}"`));}
 assert.equal(productPhoto(null),'');
});
test('coverage meter clamps percentage values',()=>{
 assert.match(coverageMeter(150),/width:100%/);assert.match(coverageMeter(-5),/width:0%/);
});
test('applying a full-hour trim removes an appliance when no hours remain',()=>{
 const items=[{applianceId:'led-bulb',qty:10,hours:1},{applianceId:'phone-charger',qty:5,hours:2},{applianceId:'router',qty:3,hours:2}];
 const r=estimateSetup(items);assert.equal(r.state,'near-miss');
 assert.deepEqual(trimAction(r.nearMissTrim,selectionsFromItems(items)),{type:'toggle',id:'led-bulb'});
 const trimmed=estimateSetup(items.slice(1));
 assert.equal(trimmed.bestFit.slug,'itel-power-go');
 assert.equal(checkProduct(r.closestUnit,trimmed.load).passes,true);
 assert.deepEqual(trimAction({applianceLabel:'Standing or ceiling fan',reduceByHours:2},selectionsFromItems([{applianceId:'fan',qty:1,hours:8}])),{type:'hours',id:'fan',delta:-2});
});
