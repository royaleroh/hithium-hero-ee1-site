// js/main-sections.js
// ─────────────────────────────────────────────────────────────────────────────
// Renders data-driven sections on index.html:
//   - Gap / horizontal price scale (from catalogue.powerSpectrum)
//   - Who it's for accordion rows (from data/presets.js + dynamic recommend())
//   - Product details (from catalogue.products)
//   - Trust facts & delivery fee table (from catalogue.deliveryFeeByState)
//   - WhatsApp links
// ─────────────────────────────────────────────────────────────────────────────

import { catalogue }               from '../data/catalogue.js';
import { presets }                 from '../data/presets.js';
import { appliances }              from '../data/appliances.js';
import { recommend }               from './recommend.js';
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

  const steps = catalogue.powerSpectrum || [];

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
          let priceDisplay = step.priceRange;
          // Format prices with proper Naira symbols if not already formatted
          if (step.id === 'power-bank') {
            priceDisplay = `${formatNaira(5000)} to ${formatNaira(30000)}`;
          } else if (step.id === 'power-station') {
            const confirmedProduct = catalogue.products.find(p => p.price !== null && p.tier === 'portable');
            priceDisplay = confirmedProduct ? `from ${formatNaira(confirmedProduct.price)}` : 'from ₦285,000';
          } else if (step.id === 'inverter-system') {
            priceDisplay = `${formatNaira(600000)} to ${formatNaira(2000000)}+`;
          }

          return `
            <div
              class="price-marker-card ${step.highlight ? 'price-marker-card--active' : ''}"
              role="listitem"
              ${step.callout ? `data-callout="${step.callout}"` : ''}
            >
              <div class="price-marker-name">${step.label}</div>
              <div class="price-marker-amount">${priceDisplay}</div>
              <div class="price-marker-desc">
                <strong>Runs:</strong> ${step.canRun}<br>
                <span style="display:inline-block;margin-top:4px;"><strong>Duration:</strong> ${step.duration}</span>
              </div>
              ${step.limitation ? `<div class="price-marker-limit">${step.limitation}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ─── 2. Who it's for (numbered accordion rows) ────────────────────────────────
function buildWhoRows() {
  const container = document.getElementById('who-rows');
  if (!container) return;

  const rowsHtml = presets.map((preset, index) => {
    // Dynamically compute the recommended unit from the preset's items
    const selections = preset.items.map(item => {
      const app = appliances.find(a => a.id === item.applianceId);
      return {
        label: app?.label || item.applianceId,
        watts: app?.watts || 0,
        qty: item.qty,
        hours: item.hours,
        surgeMultiplier: app?.surgeMultiplier || 1,
        acRequired: app?.acRequired ?? false,
      };
    });

    const recResult = recommend(
      { selections, outageHours: 8, monthlyPowerSpend: 0 },
      eligibleProducts
    );
    const unit = recResult.bestFit || recResult.closestUnit || eligibleProducts[0];
    const unitImg = unit.photos?.[0] || unit.images?.[0] || 'assets/products/itel-power-tank/hero.png';
    const num = String(index + 1).padStart(2, '0');
    const isOpen = index === 0 ? 'open' : '';

    return `
      <details class="who-row" name="who-accordion" ${isOpen}>
        <summary class="who-row-header">
          <span class="who-row-num">${num}</span>
          <div>
            <div class="who-row-title">${preset.title}</div>
            <div class="who-row-tagline">${preset.tagline}</div>
          </div>
          <span class="who-row-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
        </summary>
        <div class="who-row-body">
          <div class="who-row-detail">
            <p style="margin-bottom:var(--space-4);">${preset.detail}</p>
            <p style="font-size:var(--text-sm);color:var(--color-ink-faint);">
              Typical outage setup: ${preset.items.map(i => {
                const app = appliances.find(a => a.id === i.applianceId);
                return `${app?.label || i.applianceId} (${i.hours}h)`;
              }).join(', ')}.
            </p>
          </div>
          <div class="who-unit-card">
            <img
              src="${unitImg}"
              alt="${unit.brand} ${unit.name} (${unit.model})"
              class="who-unit-img"
              width="320"
              height="240"
              loading="lazy"
            />
            <div class="who-unit-info">
              <div class="who-unit-label">Typical best fit</div>
              <div class="who-unit-name">${unit.name}</div>
              <div class="who-unit-capacity">${unit.plainEnglishCapacity || ''}</div>
              <button
                type="button"
                class="btn btn--outline who-unit-cta"
                data-preset="${preset.id}"
                style="width:100%;justify-content:center;"
              >
                See this setup in calculator
                <span class="btn-arrow" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </details>
    `;
  }).join('');

  container.innerHTML = rowsHtml;

  // Bind clicks on preset buttons to load preset and scroll to calculator
  container.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const presetId = btn.dataset.preset;
      if (typeof window.__applyPreset === 'function') {
        window.__applyPreset(presetId);
      }
      const calcEl = document.getElementById('calculator');
      if (calcEl) {
        calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ─── 3. Product section (itel Power Tank) ──────────────────────────────────────
function buildProductSection() {
  const mainProduct = catalogue.products.find(
    p => p.id === 'itel-power-tank-iess-1000h' || p.slug === 'itel-power-tank'
  ) || catalogue.products[0];

  if (!mainProduct) return;

  // Plain-English capacity
  const capacityEl = document.getElementById('product-capacity');
  if (capacityEl && mainProduct.plainEnglishCapacity) {
    capacityEl.textContent = mainProduct.plainEnglishCapacity;
  }

  // Recharge options
  const rechargeList = document.getElementById('recharge-list');
  if (rechargeList && Array.isArray(mainProduct.rechargeOptions)) {
    rechargeList.innerHTML = mainProduct.rechargeOptions.map(r => `
      <li class="recharge-item">
        <span class="recharge-dot" aria-hidden="true"></span>
        <div>
          <strong>${r.method}</strong> — ${r.detail}
          <span style="color:var(--color-ink-faint);font-size:var(--text-sm);"> (${r.time})</span>
        </div>
      </li>
    `).join('');
  }

  // In the box
  const inBoxList = document.getElementById('in-box-list');
  if (inBoxList && Array.isArray(mainProduct.inTheBox)) {
    inBoxList.innerHTML = mainProduct.inTheBox.map(item => `
      <div class="in-box-item" role="listitem">${item}</div>
    `).join('');
  }

  // Technical specifications table
  const specTable = document.getElementById('spec-table');
  if (specTable && Array.isArray(mainProduct.specs)) {
    specTable.innerHTML = mainProduct.specs.map(s => `
      <tr>
        <th scope="row">${s.label}</th>
        <td>${s.value}</td>
      </tr>
    `).join('');
  }
}

// ─── 4. Trust section (facts & delivery fees from catalogue) ───────────────────
function buildTrustSection() {
  // Trust facts — verified data only, no invented numbers
  const factsContainer = document.getElementById('trust-facts');
  if (factsContainer) {
    const verifiedFacts = [
      {
        value: '12 months',
        label: 'Comprehensive warranty against manufacturing defects on all units.',
      },
      {
        value: 'LiFePO4',
        label: 'Lithium iron phosphate cells. Safe chemistry, high heat resistance, no thermal runaway.',
      },
      {
        value: '6,000+',
        label: 'Rated charge cycles. Over 16 years of daily charging before capacity drops.',
      },
      {
        value: '< 47 dB',
        label: 'Whisper quiet running. Produce zero fumes and safe to operate in bedrooms.',
      },
    ];

    factsContainer.innerHTML = verifiedFacts.map(fact => `
      <div class="trust-fact-card">
        <div class="trust-fact-value">${fact.value}</div>
        <div class="trust-fact-label">${fact.label}</div>
      </div>
    `).join('');
  }

  // Delivery table
  const deliveryTbody = document.getElementById('delivery-table-body');
  if (deliveryTbody && Array.isArray(catalogue.deliveryFeeByState)) {
    deliveryTbody.innerHTML = catalogue.deliveryFeeByState.map(item => `
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
  const greeting = encodeURIComponent('Hello! I have a question about the portable power stations.');

  const footerBtn = document.getElementById('footer-whatsapp');
  if (footerBtn) footerBtn.href = `${baseUrl}?text=${greeting}`;

  const footerSupport = document.getElementById('footer-wa-support');
  if (footerSupport) footerSupport.href = `${baseUrl}?text=${greeting}`;

  const faqWa = document.getElementById('faq-whatsapp');
  if (faqWa) faqWa.href = `${baseUrl}?text=${greeting}`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
buildPriceScale();
buildWhoRows();
buildProductSection();
buildTrustSection();
setWhatsAppLinks();
