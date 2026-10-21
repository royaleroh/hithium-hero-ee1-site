// js/checkout.js
// ─────────────────────────────────────────────────────────────────────────────
// Checkout page logic: order summary, Paystack payment, demo mode, lead send.
//
// Three states:
//   1. Paystack key present    → real payment via Paystack Inline
//   2. Paystack key missing    → demo mode (clearly labelled, skips payment)
//   3. Payment closed/cancelled → stay on page with a calm message
//
// TODO: To add server-side verification later, create a Vercel serverless
// function at /api/verify that receives { reference } and calls
// https://api.paystack.co/transaction/verify/:reference with the
// PAYSTACK_SECRET_KEY. Never put the secret key in this file.
// ─────────────────────────────────────────────────────────────────────────────

import { product }     from '../data/product.js';
import { PAYSTACK_PUBLIC_KEY, WHATSAPP_NUMBER } from '../config.js';
import { formatNaira } from './format.js';
import { sendLead }    from './leads.js';

// ─── Read estimate from sessionStorage ────────────────────────────────────────
const raw      = sessionStorage.getItem('estimate');
const estimate = raw ? JSON.parse(raw) : null;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const summaryEl       = document.getElementById('order-summary');
const stateSelect     = document.getElementById('delivery-state');
const deliveryFeeEl   = document.getElementById('delivery-fee');
const totalEl         = document.getElementById('order-total');
const payBtn          = document.getElementById('pay-btn');
const demoBanner      = document.getElementById('demo-banner');
const payMessage      = document.getElementById('pay-message');
const form            = document.getElementById('checkout-form');

// ─── Populate state selector ───────────────────────────────────────────────────
function buildStateSelector() {
  if (!stateSelect) return;
  stateSelect.innerHTML = '<option value="">Select your state</option>';
  product.deliveryFeeByState.forEach(({ state, fee }) => {
    const opt = document.createElement('option');
    opt.value = state;
    opt.textContent = `${state} — ${formatNaira(fee)}`;
    stateSelect.appendChild(opt);
  });
}

// ─── Calculate and display totals ─────────────────────────────────────────────
function getDeliveryFee(stateName) {
  const match = product.deliveryFeeByState.find(d => d.state === stateName);
  return match?.fee ?? 0;
}

function updateTotal() {
  const stateName  = stateSelect?.value ?? '';
  const fee        = getDeliveryFee(stateName);
  const subtotal   = product.price;
  const total      = subtotal + fee;

  if (deliveryFeeEl) deliveryFeeEl.textContent = fee ? formatNaira(fee) : 'Select state';
  if (totalEl)       totalEl.textContent       = formatNaira(total);

  return total;
}

stateSelect?.addEventListener('change', updateTotal);

// ─── Build order summary ───────────────────────────────────────────────────────
function buildSummary() {
  if (!summaryEl) return;

  const applianceLines = estimate?.selections
    ?.map(s => `<li>${s.label} ×${s.qty} — ${s.hours} h/day</li>`)
    .join('') ?? '';

  summaryEl.innerHTML = `
    <div class="card card--body">
      <div class="card__body">
        <h3 style="margin-bottom:1rem;">${product.name}</h3>
        ${applianceLines ? `
          <p style="margin-bottom:.5rem;font-weight:600;font-size:.875rem;color:var(--color-ink-muted);">YOUR SETUP</p>
          <ul style="list-style:disc;padding-left:1.25rem;margin-bottom:1rem;font-size:.9rem;color:var(--color-ink-muted);">${applianceLines}</ul>
          ${estimate.runtimeLabel ? `<p style="margin-bottom:1rem;font-size:.875rem;">Estimated runtime: <strong>${estimate.runtimeLabel}</strong></p>` : ''}
        ` : ''}
        <table class="spec-table" style="margin-top:1rem;">
          <tr><th>Unit price</th><td>${formatNaira(product.price)}</td></tr>
          <tr><th>Delivery</th><td id="delivery-fee">Select state above</td></tr>
          <tr style="font-size:1.1rem;font-weight:700;"><th>Total</th><td id="order-total">${formatNaira(product.price)}</td></tr>
        </table>
        <p style="margin-top:1rem;font-size:.8rem;color:var(--color-ink-faint);">Warranty: ${product.warranty}. In the box: ${product.inTheBox.join(', ')}.</p>
      </div>
    </div>
  `;
}

// ─── Demo mode ─────────────────────────────────────────────────────────────────
const isDemoMode = !PAYSTACK_PUBLIC_KEY;

function showDemoBanner() {
  if (!demoBanner) return;
  demoBanner.hidden  = false;
  demoBanner.textContent =
    '⚠️ Demo mode — payment is simulated. No money will be charged. ' +
    'Add your Paystack public key to config.js to go live.';
}

if (isDemoMode) showDemoBanner();

// ─── Payment ───────────────────────────────────────────────────────────────────
payBtn?.addEventListener('click', e => {
  e.preventDefault();

  if (!form?.checkValidity()) {
    form?.reportValidity();
    return;
  }

  const name    = document.getElementById('buyer-name')?.value?.trim()  ?? '';
  const phone   = document.getElementById('buyer-phone')?.value?.trim() ?? '';
  const email   = document.getElementById('buyer-email')?.value?.trim() ?? '';
  const address = document.getElementById('buyer-address')?.value?.trim() ?? '';
  const state   = stateSelect?.value ?? '';
  const total   = updateTotal();

  if (!state) {
    if (payMessage) {
      payMessage.textContent = 'Please select your delivery state.';
      payMessage.hidden = false;
    }
    return;
  }

  // Fire lead with contact info
  sendLead({
    source:  'checkout-pay',
    name, phone, email, address, state,
    product: product.slug,
    price:   total,
    estimate: estimate ? {
      dailyWh:    estimate.dailyWh,
      adjustedWh: estimate.adjustedWh,
      runtimeLabel: estimate.runtimeLabel,
    } : null,
  });

  if (isDemoMode) {
    // Demo: skip payment and go straight to thank-you
    sessionStorage.setItem('order', JSON.stringify({ name, phone, state, total, demo: true }));
    window.location.href = 'thank-you.html';
    return;
  }

  // Paystack Inline
  const handler = window.PaystackPop.setup({
    key:       PAYSTACK_PUBLIC_KEY,
    email:     email || `${phone}@noemail.local`, // Paystack requires an email
    amount:    total * 100, // Paystack expects kobo
    currency:  'NGN',
    ref:       `LIS-${Date.now()}`,
    metadata: {
      custom_fields: [
        { display_name: 'Name',    variable_name: 'name',    value: name },
        { display_name: 'Phone',   variable_name: 'phone',   value: phone },
        { display_name: 'State',   variable_name: 'state',   value: state },
        { display_name: 'Address', variable_name: 'address', value: address },
      ],
    },
    callback(response) {
      // TODO: For server-side verification, POST response.reference to
      // /api/verify before redirecting. See comment at top of file.
      sessionStorage.setItem('order', JSON.stringify({ name, phone, state, total, reference: response.reference }));
      window.location.href = 'thank-you.html';
    },
    onClose() {
      if (payMessage) {
        payMessage.textContent = 'Payment window closed. No charge was made. Try again when you are ready.';
        payMessage.hidden = false;
      }
    },
  });

  handler.openIframe();
});

// ─── Initialise ────────────────────────────────────────────────────────────────
buildStateSelector();
buildSummary();
updateTotal();
