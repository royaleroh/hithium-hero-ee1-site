import { WHATSAPP_NUMBER } from '../config.js';
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

const checkout = document.getElementById('consultation-checkout');
if (checkout) {
 document.getElementById('consultation-product-name').textContent='Find a solution for your setup';
 document.getElementById('consultation-product-price').textContent='Compare what fits';
 checkout.hidden=false;
 checkout.textContent='Find my solution';
 checkout.addEventListener('click',()=>{window.location.hash='calculator';});
}
