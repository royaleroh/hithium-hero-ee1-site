import { technicalDetails, escapeHTML } from './plain.js';
import { WHATSAPP_NUMBER } from '../config.js';
import { formatNaira } from './format.js';

let order;
try { order = JSON.parse(sessionStorage.getItem('order') || '{}'); } catch { order = {}; }
const heading = document.getElementById('thankyou-heading');
if (order.name) heading.textContent = `Thank you, ${order.name.split(' ')[0]}.`;
if (order.demo) document.getElementById('demo-confirmation').hidden = false;
const detail = document.getElementById('order-detail');
for (const [label, value] of [['Unit', order.productName], ['Name', order.name], ['Delivery state', order.state], ['Order total', order.total ? formatNaira(order.total) : null], ['Reference', order.reference]]) {
  if (!value) continue;
  const row = document.createElement('div');
  const term = document.createElement('dt'); term.textContent = label;
  const description = document.createElement('dd'); description.textContent = value;
  row.append(term, description); detail.append(row);
}
if (order.model) detail.insertAdjacentHTML('afterend', technicalDetails(`<p>Model: ${escapeHTML(order.model)}</p>`));
if (!order.product) {
  heading.textContent = 'No order to show yet.';
  document.getElementById('thankyou-sub').textContent = 'Choose a unit in the calculator, then continue to checkout.';
  detail.hidden = true;
}
const message = order.reference
  ? `Hello! I placed an order for ${order.productName} (${order.model}). Reference: ${order.reference}. Please confirm.`
  : order.demo ? `Hello! I tried the demo checkout for ${order.productName} (${order.model}). No payment was taken. Please help me order.`
  : 'Hello! Please help me choose a power box.';
document.getElementById('wa-confirm').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
