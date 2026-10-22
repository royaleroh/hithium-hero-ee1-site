import { appliances } from '../data/appliances.js';
import { WHATSAPP_NUMBER } from '../config.js';
import { equivalentFor, canRunAppliance, productPlainContent, productTechnicalContent, technicalDetails, lifespan, escapeHTML } from './plain.js';
import { productPhoto } from './product-photo.js';
import { formatNaira } from './format.js';

export function productCardSummary(product) {
  const ids = product.acOutput ? ['led-bulb', 'fan'] : ['phone-charger', 'router'];
  return ids.map(id => equivalentFor(product, id)).filter(Boolean).concat(
    product.acOutput ? `${product.warranty} warranty` : 'No normal wall socket'
  );
}

export function productCard(product) {
  const fridge = appliances.find(a => a.id === 'mini-fridge');
  const warning = product.acOutput && !canRunAppliance(product, fridge)
    ? 'The mini fridge in our calculator needs a bigger unit.' : '';
  const quote = `Hello! Please send today's price for ${product.name} (${product.model}).`;
  const price = product.available === false ? 'Not available to order' : product.price === null
    ? `<a class="range-price-link" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(quote)}" target="_blank" rel="noopener noreferrer">Ask for today's price</a>`
    : formatNaira(product.price);
  return `<article class="trust-fact-card" aria-label="${escapeHTML(product.name)}">
    <h3 class="trust-fact-value">${escapeHTML(product.name)}</h3>${productPhoto(product)}
    <ul class="range-key-facts">${productCardSummary(product).map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ul>
    <p class="range-example-note">Each example uses a separate full charge.</p>
    ${warning ? `<p class="range-warning">${warning}</p>` : ''}
    <p class="range-card-price">${price}</p>
    ${technicalDetails(`<p>${escapeHTML(product.warranty)} warranty. ${escapeHTML(lifespan(product))}</p>${productPlainContent(product)}${productTechnicalContent(product)}`)}
  </article>`;
}
