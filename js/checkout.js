import { productPhoto } from './product-photo.js';
import { productPlainContent, productTechnicalContent, technicalDetails, escapeHTML } from './plain.js';
import { catalogue, deliveryFeeByState } from '../data/catalogue.js';
import { PAYSTACK_PUBLIC_KEY } from '../config.js';
import { formatNaira } from './format.js';
import { sendLead } from './leads.js';
import { canCheckout, computeOrderTotal } from './order.js';

const byId = id => document.getElementById(id);
let estimate;
try { estimate = JSON.parse(sessionStorage.getItem('estimate') || 'null'); } catch { estimate = null; }
const product = catalogue.products.find(p => p.slug === estimate?.product);
const demo = !PAYSTACK_PUBLIC_KEY;

if (!canCheckout(product)) {
  byId('checkout-layout').hidden = true;
  byId('checkout-invalid').hidden = false;
} else {
  initialise();
}

function initialise() {
  byId('delivery-state').replaceChildren(new Option('Select your state', ''),
    ...deliveryFeeByState.map(d => new Option(`${d.state}: ${formatNaira(d.fee)}`, d.state)));
  const summary = byId('order-summary');
  summary.innerHTML = `${productPhoto(product, {className: 'checkout-product-photo'})}
    <p class="result-label">Your chosen unit</p><h2>${escapeHTML(product.name)}</h2>
    ${productPlainContent(product)}${technicalDetails(productTechnicalContent(product))}<ul id="summary-appliances" class="summary-appliances"></ul>
    <dl class="order-totals"><div><dt>Unit price</dt><dd>${formatNaira(product.price)}</dd></div>
      <div><dt>Delivery to your state</dt><dd id="delivery-fee">Select state</dd></div>
      <div class="order-grand-total"><dt>Order total</dt><dd id="order-total">${formatNaira(product.price)}</dd></div></dl>
    <p class="order-warranty">Warranty: ${product.warranty}. Delivery time is confirmed on WhatsApp.</p>`;
  for (const s of Array.isArray(estimate.selections) ? estimate.selections : []) {
    const li = document.createElement('li');
    li.textContent = `${s.label} x${s.qty}, ${s.hours} hours`;
    byId('summary-appliances').append(li);
  }
  byId('delivery-state').addEventListener('change', updateTotal);
  if (demo) {
    byId('demo-banner').hidden = false;
    byId('demo-banner').textContent = 'Demo checkout. No payment will be taken.';
    byId('pay-btn').textContent = 'Place demo order';
  }
  byId('pay-btn').addEventListener('click', pay);
}

function updateTotal() {
  const state = byId('delivery-state').value;
  const totals = computeOrderTotal(product, state);
  byId('delivery-fee').textContent = state ? formatNaira(totals.deliveryFee) : 'Select state';
  byId('order-total').textContent = formatNaira(state ? totals.total : totals.subtotal);
  return totals;
}

function pay() {
  if (!byId('checkout-form').reportValidity()) return;
  const name = byId('buyer-name').value.trim();
  const phone = byId('buyer-phone').value.trim();
  const email = byId('buyer-email').value.trim();
  const address = byId('buyer-address').value.trim();
  const state = byId('delivery-state').value;
  const { total, deliveryFee, subtotal } = updateTotal();
  const order = { name, phone, state, total, subtotal, deliveryFee, product: product.slug, productName: product.name, model: product.model };
  const message = byId('pay-message');
  message.hidden = true;
  sendLead({ source: 'checkout-pay', name, phone, email, address, state, product: product.slug, price: total, estimate });
  function finish(extra) {
    sessionStorage.setItem('order', JSON.stringify({ ...order, ...extra }));
    window.location.href = 'thank-you.html';
  }
  if (demo) { finish({ demo: true }); return; }
  if (!window.PaystackPop) {
    message.textContent = 'Payment could not load. Please try again.'; message.hidden = false; return;
  }
  byId('pay-btn').disabled = true;
  // TODO: POST the reference to /api/verify and verify amount, currency and product
  // server-side before confirming an order. Never place a secret key in this site.
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY, email: email || `${phone}@noemail.local`,
    amount: total * 100, currency: 'NGN', ref: `ORDER-${Date.now()}`,
    metadata: { custom_fields: Object.entries({ name, phone, state, address, product: product.slug }).map(([key, value]) => ({ display_name: key, variable_name: key, value })) },
    callback(response) { finish({ reference: response.reference }); },
    onClose() {
      byId('pay-btn').disabled = false;
      message.textContent = 'Payment window closed. Check your payment status before trying again.';
      message.hidden = false;
    },
  });
  handler.openIframe();
}
