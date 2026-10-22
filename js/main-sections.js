import { needs, needCard, solutionPhoto } from './solution-view.js';
import { faqAnswers } from './plain-sections.js';
import { deliveryFeeByState } from '../data/catalogue.js';
import { WHATSAPP_NUMBER, SITE_NAME } from '../config.js';
import { formatNaira } from './format.js';

const path=document.getElementById('price-scale-container');
if(path)path.innerHTML=`<ol class="solution-path"><li><span>01</span><h3>What needs power?</h3><p>A phone, your workspace, a shop or your home.</p></li><li><span>02</span><h3>How long must it last?</h3><p>Tell us about your power cuts and your budget.</p></li><li><span>03</span><h3>See what suits you</h3><p>Compare options or ask us to put a setup together.</p></li></ol>`;
const product=document.getElementById('product');
if(product)product.innerHTML=`<div class="container"><div class="solution-help"><div class="product-img-wrap">${solutionPhoto('installed')}</div><div><p class="section-label">One place to figure it out</p><h2 class="section-heading" id="product-h2">From a phone top-up to a home that stays on.</h2><p>Start with what you need to run. We will help you understand the options.</p><ul><li>Power banks for USB devices</li><li>Portable stations for everyday backup</li><li>Inverters, batteries and panels for a fitted setup</li></ul><p>We source across brands. Your quotation confirms the actual model, warranty and full cost.</p><a href="#calculator" class="btn btn--primary">Find my solution</a></div></div></div>`;
const schema=document.getElementById('product-structured-data');
if(schema)schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:SITE_NAME,description:'Independent power solutions for phones, workspaces, shops and homes.'});
faqAnswers().forEach((answer,i)=>{const target=document.getElementById(`faq-answer-${i}`);if(target)target.innerHTML=answer;});
const range=document.getElementById('trust-facts');
if(range)range.innerHTML=needs.map(needCard).join('');
const delivery=document.getElementById('delivery-table-body');
if(delivery)delivery.innerHTML=deliveryFeeByState.map(item=>`<tr><td>${item.state}</td><td>${formatNaira(item.fee)}</td></tr>`).join('');
for(const id of ['footer-whatsapp','faq-whatsapp']){
 const link=document.getElementById(id);
 if(link)link.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello! Please help me choose a power solution.')}`;
}
