import { catalogue, DEFAULT_DAILY_OUTAGE_HOURS } from '../data/catalogue.js';
import { WHATSAPP_NUMBER } from '../config.js';
import { canCheckout } from './order.js';
import { formatNaira } from './format.js';
import { sendLead } from './leads.js';

const form = document.getElementById('consultation-form');
if (form) {
  const nameInput = form.elements.namedItem('name');
  nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) nameInput.setCustomValidity('Please enter your name.');
    if (!form.reportValidity()) return;
    const email = form.elements.namedItem('email').value.trim();
    const message = `Hello! My name is ${name}. I would like a free power consultation.\nMy email: ${email}\nPlease help me choose a unit for my appliances.`;
    sendLead({ source: 'consultation', name, email });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
}

const product = catalogue.products.find(p => p.slug === 'itel-power-tank');
const checkout = document.getElementById('consultation-checkout');
if (product && checkout) {
  document.getElementById('consultation-product-name').textContent = product.name;
  document.getElementById('consultation-product-price').textContent = !product.available
    ? 'Not available to order' : product.price === null ? 'Price on request' : formatNaira(product.price);
  checkout.hidden = !canCheckout(product);
  checkout.textContent = `Order ${product.name}`;
  checkout.addEventListener('click', () => {
    if (!canCheckout(product)) return;
    sessionStorage.setItem('estimate', JSON.stringify({ product: product.slug, selections: [], outageHours: DEFAULT_DAILY_OUTAGE_HOURS }));
    sendLead({ source: 'featured-checkout', product: product.slug, price: product.price });
    window.location.href = 'checkout.html';
  });
}
