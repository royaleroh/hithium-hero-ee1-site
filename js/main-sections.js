import { productPhoto } from './product-photo.js';
import { productCard } from './product-card.js';
import { plainCopy } from '../data/plain-language.js';
import { productPlainContent, productTechnicalContent, technicalDetails } from './plain.js';
import { faqAnswers, gapDescription } from './plain-sections.js';
// js/main-sections.js
// ─────────────────────────────────────────────────────────────────────────────
// Renders data-driven sections on index.html:
//   - Gap / horizontal price scale (from catalogue.powerSpectrum)
//   - Who it's for accordion rows (from data/presets.js + dynamic recommend())
//   - Product details (from catalogue.products)
//   - Trust facts & delivery fee table (from deliveryFeeByState)
//   - WhatsApp links
// ─────────────────────────────────────────────────────────────────────────────

import { catalogue, deliveryFeeByState, powerSpectrum }               from '../data/catalogue.js';
import { WHATSAPP_NUMBER }         from '../config.js';
import { formatNaira }             from './format.js';

// Eligible portable products for the recommender
const eligibleProducts = catalogue.products.filter(
  p => p.calculatorEligible && p.tier === 'portable'
);

// ─── 1. Gap / price scale ─────────────────────────────────────────────────────
function buildPriceScale() {
  const container = document.getElementById('price-scale-container');
  if (!container) return;

  const steps = powerSpectrum;

  container.innerHTML = `
    <div class="price-scale">
      <div class="price-track" aria-hidden="true">
        <div class="price-track-fill"></div>
      </div>
      <div class="price-markers" aria-hidden="true">
        <div class="price-marker">
          <span class="price-marker-dot"></span>
        </div>
        <div class="price-marker price-marker--active">
          <span class="price-marker-dot"></span>
        </div>
        <div class="price-marker">
          <span class="price-marker-dot"></span>
        </div>
      </div>
      <div class="price-marker-cards" role="list">
        ${steps.map(step => {
          let priceDisplay = step.confirmed ? step.priceRange : '';
          if (step.id === 'power-station') {
            const available = eligibleProducts.filter(p => p.available);
            const priced = available.filter(p => p.price !== null);
            const prices = priced.map(p => p.price);
            const missing = available.length - priced.length;
            priceDisplay = prices.length ? `from ${formatNaira(Math.min(...prices))}` : plainCopy.price;
            if (prices.length && missing) priceDisplay += `<small class="price-pending">Other units: ${plainCopy.price}</small>`;
            if (prices.length && prices.length === available.length && Math.max(...prices) !== Math.min(...prices)) priceDisplay = `${formatNaira(Math.min(...prices))} to ${formatNaira(Math.max(...prices))}`;
          }

          return `
            <div
              class="price-marker-card ${step.highlight ? 'price-marker-card--active' : ''}"
              role="listitem"
              ${step.callout ? `data-callout="The one most people miss"` : ''}
            >
              <div class="price-marker-name">${step.id === 'power-station' ? 'Power box' : step.label}</div>
              <div class="price-marker-amount">${priceDisplay}</div>
              <div class="price-marker-desc">
                ${gapDescription(step)}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ─── 3. Product section (itel Power Tank) ──────────────────────────────────────
function buildProductSection() {
  const mainProduct = catalogue.products.find(
    p => p.id === 'itel-power-tank-iess-1000h' || p.slug === 'itel-power-tank'
  ) || catalogue.products[0];

  if (!mainProduct) return;
  document.getElementById('product-h2').textContent = `The ${mainProduct.name}.`;
  document.getElementById('product-structured-data').textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: `${mainProduct.brand} ${mainProduct.name}`,
    description: mainProduct.description, brand: { '@type': 'Brand', name: mainProduct.brand },
    ...(mainProduct.price !== null ? { offers: { '@type': 'Offer', priceCurrency: 'NGN', price: mainProduct.price,
      availability: `https://schema.org/${mainProduct.available ? 'InStock' : 'OutOfStock'}` } } : {}),
  });

  document.querySelector('.product-img-wrap').innerHTML = productPhoto(mainProduct);

  // Plain-English capacity
  const capacityEl = document.getElementById('product-capacity');
  if (capacityEl && mainProduct.plainEnglishCapacity) {
    capacityEl.textContent = mainProduct.plainEnglishCapacity;
  }

  document.getElementById('recharge-list').innerHTML = `<li class="recharge-item">${plainCopy.recharge}</li><li class="recharge-item">${plainCopy.rechargeTime}</li>`;
  document.getElementById('product-plain').innerHTML = productPlainContent(mainProduct);
  document.getElementById('featured-technical').innerHTML = technicalDetails(productTechnicalContent(mainProduct));
  faqAnswers(mainProduct).forEach((answer, i) => { document.getElementById(`faq-answer-${i}`).innerHTML = answer; });

}

// ─── 4. Trust section (facts & delivery fees from catalogue) ───────────────────
function buildTrustSection() {
  // Trust facts - verified data only, no invented numbers
  const factsContainer = document.getElementById('trust-facts');
  if (factsContainer) {
    factsContainer.innerHTML = eligibleProducts.map(productCard).join('');
  }

  // Delivery table
  const deliveryTbody = document.getElementById('delivery-table-body');
  if (deliveryTbody && Array.isArray(deliveryFeeByState)) {
    deliveryTbody.innerHTML = deliveryFeeByState.map(item => `
      <tr>
        <td style="color:var(--color-dark-ink);font-weight:var(--weight-medium);">${item.state}</td>
        <td style="color:var(--color-accent);font-weight:var(--weight-semibold);">${formatNaira(item.fee)}</td>
      </tr>
    `).join('');
  }
}

// ─── 5. WhatsApp links ────────────────────────────────────────────────────────
function setWhatsAppLinks() {
  const number = WHATSAPP_NUMBER;
  const baseUrl = `https://wa.me/${number}`;
  const greeting = encodeURIComponent('Hello! Please help me choose a power box.');

  const footerBtn = document.getElementById('footer-whatsapp');
  if (footerBtn) footerBtn.href = `${baseUrl}?text=${greeting}`;

  const faqWa = document.getElementById('faq-whatsapp');
  if (faqWa) faqWa.href = `${baseUrl}?text=${greeting}`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
buildPriceScale();
buildProductSection();
buildTrustSection();
setWhatsAppLinks();
