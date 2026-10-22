import { escapeHTML } from './plain.js';

// CSS frames the original supplier pixels; product features are never generated.
export function productPhoto(product, { className = '', eager = false } = {}) {
  if (!product?.photos?.[0]) return '';
  return `<div class="product-photo product-photo--${escapeHTML(product.slug)} ${escapeHTML(className)}"><img src="${escapeHTML(product.photos[0])}" width="${product.imageWidth}" height="${product.imageHeight}" alt="${escapeHTML(product.name)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}></div>`;
}
