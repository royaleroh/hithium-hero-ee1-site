import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { portableProducts } from '../data/catalogue.js';
import { appliances } from '../data/appliances.js';
import { presets } from '../data/presets.js';
import { plainCopy, glossary, everydayLoads } from '../data/plain-language.js';
import { everydayEquivalents, equivalentFor, goodFor, wontRun, lifespan, canRunAppliance, plainDuration, technicalDetails, productPlainContent, productTechnicalContent } from '../js/plain.js';
import { faqAnswers } from '../js/plain-sections.js';
import { recommend, checkProduct, deriveLoad } from '../js/recommend.js';
import { selectionsFromItems } from '../js/estimate.js';
const tank=portableProducts.find(p=>p.slug==='itel-power-tank');
const go=portableProducts.find(p=>p.slug==='itel-power-go');

test('Power Tank worked examples include fan, Wi-Fi, four lights and TV',()=>{
  for(const [id,line] of [['fan','about 16 hours of fan'],['router','about 2 days of Wi-Fi'],['led-bulb','about 20 hours of four lights'],['tv','about 10 hours of TV']])assert.equal(equivalentFor(tank,id),line);
  assert.deepEqual(everydayEquivalents(tank),['about 55 phone charges','about 2 days of Wi-Fi','about 20 hours of four lights','about 16 hours of fan']);
});
test('Power Go examples exactly match the brief and exclude wall-socket appliances',()=>{
  assert.deepEqual(everydayEquivalents(go),['about 17 phone charges','about 22 hours of Wi-Fi','about 4 hours of laptop']);
});
test('every displayed equivalent passes socket, running and starting-power checks',()=>{
  for(const p of portableProducts){
    const valid=everydayLoads.filter(e=>canRunAppliance(p,appliances.find(a=>a.id===e.id),e.qty));
    assert.deepEqual(everydayEquivalents(p),valid.slice(0,4).map(e=>equivalentFor(p,e.id)));
    for(const e of valid){const a=appliances.find(a=>a.id===e.id);assert.ok(checkProduct(p,deriveLoad([{...a,qty:e.qty,hours:0.01}],8)).passes);}
  }
  const weak={...tank,maxOutputW:60,peakOutputW:99};assert.equal(equivalentFor(weak,'fan'),null);
});
test('goodFor checks each full preset with the real recommender',()=>{
  const names={students:'Students','remote-workers':'Remote workers',shops:'Shops and stalls',families:'Families',events:'Events'};
  for(const p of portableProducts){
    const expected=presets.filter(s=>s.items.length && recommend({selections:selectionsFromItems(s.items)},[p]).bestFit?.slug===p.slug).map(s=>names[s.id]);
    assert.deepEqual(goodFor(p),expected);
  }
  assert.deepEqual(goodFor(go),[]);
});
test('wontRun includes every Power Go wall-socket appliance and nothing for Tank 1000',()=>{
  assert.equal(wontRun(go),'Will not run: lights, fan, TV, monitor, decoder, speaker, fridge. They need a normal wall socket, and this one does not have one.');
  assert.equal(wontRun(portableProducts.at(-1)),'');
  assert.match(wontRun(portableProducts[1]),/fridge/);
});
test('lifespan uses the lowest range figure and always marks the maker rating',()=>{
  assert.equal(lifespan('6,000 to 8,000+'),"Rated for 6,000 full charges, which is about 16 years of charging once a day. (maker's rating)");
  assert.equal(lifespan('3,000+'),"Rated for 3,000 full charges, which is about 8 years of charging once a day. (maker's rating)");
  assert.equal(lifespan({cycleLife:'8,000 to 6,000+'}),lifespan('6,000+'));
  assert.equal(lifespan('not found'),'');
  for(const p of portableProducts)assert.ok(lifespan(p).includes("(maker's rating)"));
});
test('duration uses the requested hour and day buckets, rounding down',()=>{
  for(const [h,s] of [[0.5,'about 1 hour'],[1.9,'about 1 hour'],[16.7,'about 16 hours'],[48,'about 48 hours'],[69.4,'about 2 days']])assert.equal(plainDuration(h),s);
});
test('all reusable technical disclosures are collapsed with the same label',()=>{
  const html=technicalDetails(productTechnicalContent(tank));
  assert.match(html,/<details class="tech /);assert.match(html,/<summary>Technical details<\/summary>/);assert.doesNotMatch(html,/<details[^>]*\bopen\b/);
});

// Minimal HTML text reader. It excludes full nested technical subtrees, scripts,
// styles and comments, but keeps alt text, accessible labels and placeholders.
function plainStrings(html){
  const result=[];const stack=[];let buffer='';
  const flush=()=>{if(buffer.trim())result.push(buffer.replace(/\s+/g,' ').trim());buffer='';};
  const decode=s=>s.replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&copy;/g,'');
  const voids=new Set(['img','input','meta','link','br','hr','source','wbr']);
  for(const token of html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g)??[]){
    if(token.startsWith('<!--'))continue;
    if(token.startsWith('<')){
      const close=token.match(/^<\/(\w+)/);if(close){flush();const at=stack.map(s=>s.tag).lastIndexOf(close[1].toLowerCase());if(at>=0)stack.splice(at);continue;}
      const tag=token.match(/^<(\w+)/)?.[1]?.toLowerCase();if(!tag)continue;
      const hidden=stack.some(s=>s.hidden)||['script','style','svg'].includes(tag)||/class=["'][^"']*\btech\b/.test(token)||/data-level=["']technical["']/.test(token);
      if(!hidden){for(const m of token.matchAll(/(?:alt|aria-label|placeholder)=["']([^"']*)["']/g))result.push(decode(m[1]));}
      if(['p','li','h1','h2','h3','h4','button','summary','div','td','th'].includes(tag))flush();
      if(!voids.has(tag)&&!token.endsWith('/>'))stack.push({tag,hidden});
    }else if(!stack.some(s=>s.hidden))buffer+=decode(token);
  }flush();return result;
}
const units=/\b(?:Wh|kWh|W|VA|V|Ah|mAh|LiFePO4|MPPT|PV|DC|UPS|Hz|IP65)\b|\b(?:watts?|volts?|lithium iron phosphate|cycle life|surge|peak|pure sine wave|AC output|continuous|usable|loss allowance)\b|\bIESS-[A-Z0-9-]+\b/gi;
// Case-sensitive single-letter units avoid treating ordinary words as units.
const jargon=s=>[...s.matchAll(units)].filter(m=>!['w','v'].includes(m[0]));
const sentences=s=>s.match(/[^.!?]+(?:[.!?](?!\d)|$)/g)??[];
const words=s=>s.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)??[];
const root=fileURLToPath(new URL('../',import.meta.url));
let copy=[];let browser;let server;
before(async()=>{
  for(const name of ['index.html','checkout.html','thank-you.html'])copy.push(...plainStrings(await readFile(path.join(root,name),'utf8')).map(text=>({source:name,text})));
  const dataStrings=value=>typeof value==='string'?[value]:value&&typeof value==='object'?Object.values(value).flatMap(dataStrings):[];
  copy.push(...dataStrings({plainCopy,glossary}).map(text=>({source:'data/plain-language.js',text})));
  copy.push(...presets.flatMap(p=>[p.title,p.tagline,p.detail]).map(text=>({source:'data/presets.js',text})));
  for(const p of portableProducts)copy.push(...plainStrings(productPlainContent(p)).map(text=>({source:`plain helpers: ${p.name}`,text})));
  copy.push(...faqAnswers(tank).flatMap(plainStrings).map(text=>({source:'js/plain-sections.js',text})));
  // Render the HTML and the plain-copy strings actually emitted by data/ and js/.
  // Playwright is a development tool only, never loaded or shipped by the site.
  const require=createRequire(import.meta.url);
  let playwright;
  for(const location of [process.env.PLAYWRIGHT_MODULE_PATH,'playwright',path.join(process.env.USERPROFILE??'', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')].filter(Boolean)){
    try{playwright=require(location);break;}catch{}
  }
  assert.ok(playwright,'Copy lint needs Playwright as a dev tool or PLAYWRIGHT_MODULE_PATH.');
  server=createServer(async(req,res)=>{
    try{
      const target=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
      if(!target.startsWith(root)){res.writeHead(403).end();return;}
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp'})[path.extname(target)]??'application/octet-stream');
      res.end(await readFile(target));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{browser=await playwright.chromium.launch({headless:true});}catch{browser=await playwright.chromium.launch({headless:true,channel:'msedge'});}
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}`;
  const collect=async(source)=>{
    const html=await page.locator('body').innerHTML();copy.push(...plainStrings(html).map(text=>({source,text})));
  };
  await page.goto(base);await page.locator('#result-unit-name').waitFor();
  await collect('rendered home');
  for(const preset of presets){await page.locator(`[data-preset="${preset.id}"]`).click();await collect(`rendered preset ${preset.id}`);}
  // Tight and near-miss states, reached through the real controls.
  await page.locator('#tile-laptop .tile-toggle').click();await collect('rendered tight');
  await page.locator('[data-preset="shops"]').click();
  await page.locator('#tile-fan [data-action="hours"][data-delta="1"]').click({clickCount:2});await collect('rendered near miss');
  await page.locator('[data-preset="custom"]').click();
  await page.locator('#tile-mini-fridge .tile-toggle').click();
  for(let i=0;i<19;i++)await page.locator('#tile-mini-fridge [data-action="qty"][data-delta="1"]').click();await collect('rendered none');
  await page.locator('[data-preset="shops"]').click();
  for (const amount of ['200000','300000','']) { await page.locator('#unit-budget').fill(amount); await collect(`rendered budget ${amount}`); }
  await page.locator('#monthly-spend').fill('30000');await collect('rendered payback');
  await page.locator('#btn-checkout').click();await page.waitForURL('**/checkout.html');await page.locator('#order-summary h2').waitFor();await collect('rendered checkout');
  await page.locator('#delivery-state').selectOption('Lagos');
  await page.locator('#buyer-name').fill('Test Buyer');await page.locator('#buyer-phone').fill('08012345678');await page.locator('#buyer-address').fill('Test street');
  await page.locator('#pay-btn').click();await page.waitForURL('**/thank-you.html');await page.locator('#order-detail').waitFor();await collect('rendered thank you');
  assert.deepEqual(errors,[]);
}, {timeout:60000});
after(async()=>{await browser?.close();await new Promise(resolve=>server?server.close(resolve):resolve());});

test('homepage renders products, delivery and a complete footer without script errors', async()=>{
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator('#trust-facts article').first().waitFor();
  assert.equal(await page.locator('#trust-facts article').count(),portableProducts.length);
  assert.ok(await page.locator('#delivery-table-body tr').count()>0);
  assert.equal(await page.locator('footer.site-footer .footer-bottom').count(),1);
  assert.equal(await page.locator('.product-img-wrap img').count(),1);
  assert.equal(await page.locator('.field-error').count(),0);
  // An optional photograph frame must never prevent unrelated sections rendering.
  await page.route('**/index.html',async route=>{
    const html=await readFile(path.join(root,'index.html'),'utf8');
    await route.fulfill({contentType:'text/html',body:html.replace('class="product-img-wrap reveal"','class="missing-photo-frame"')});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.locator('#trust-facts article').first().waitFor();
  assert.ok(await page.locator('#delivery-table-body tr').count()>0);
  assert.deepEqual(errors,[]);await page.close();
});

test('consultation validates details, builds WhatsApp and uses catalogue checkout pricing', async()=>{
  const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator('#consultation-checkout').waitFor();
  await page.evaluate(()=>{window.openedUrls=[];window.open=url=>{window.openedUrls.push(url);return null;};});
  await page.locator('#consultation-form button').click();
  assert.deepEqual(await page.evaluate(()=>window.openedUrls),[]);
  await page.locator('#consultation-name').fill('   ');
  await page.locator('#consultation-email').fill('visitor@example.com');
  await page.locator('#consultation-form button').click();
  assert.deepEqual(await page.evaluate(()=>window.openedUrls),[]);
  await page.locator('#consultation-name').fill('Test Visitor');
  await page.locator('#consultation-form button').click();
  const urls=await page.evaluate(()=>window.openedUrls);
  assert.equal(urls.length,1);
  assert.match(new URL(urls[0]).searchParams.get('text'),/Test Visitor.*free power consultation/s);
  assert.match(new URL(urls[0]).searchParams.get('text'),/visitor@example.com/);
  assert.equal(await page.locator('#consultation-product-price').innerText(),`₦${new Intl.NumberFormat('en-NG').format(tank.price)}`);
  await page.locator('#consultation-checkout').click();await page.waitForURL('**/checkout.html');
  await page.locator('#order-summary h2').waitFor();
  assert.equal(await page.locator('#order-summary h2').innerText(),tank.name);
  await page.locator('#delivery-state').selectOption('Lagos');
  assert.equal(await page.locator('#order-total').innerText(),`₦${new Intl.NumberFormat('en-NG').format(tank.price+3000)}`);
  await page.close();
});
test('jargon lint: HTML and rendered plain-copy strings exclude every banned term',()=>{
  const failures=copy.flatMap(({source,text})=>jargon(text).map(m=>`${source}: ${m[0]} in ${text}`));
  console.log(`Jargon lint: ${copy.length} plain-copy samples; ${failures.length} banned terms. Technical disclosures excluded.`);
  assert.deepEqual(failures,[]);
});
test('sentence lint: no plain sentence exceeds 20 words; warn above 15',()=>{
  const seen=new Set();const failures=[];const warnings=[];
  for(const {source,text}of copy)for(const sentence of sentences(text)){
    const clean=sentence.trim();if(seen.has(clean))continue;seen.add(clean);
    const count=words(clean).length;
    if(count>20)failures.push(`${source} (${count} words): ${clean}`);
    else if(count>15)warnings.push(`${source} (${count} words): ${clean}`);
  }
  console.log(`Sentence lint: ${failures.length} failures; ${warnings.length} warnings above 15 words.\n${warnings.join('\n')}`);
  assert.deepEqual(failures,[]);
});
