import { SITE_NAME } from '../config.js';
import { productControlErrors } from '../data/catalogue.js';

if (productControlErrors.length) {
  console.error(productControlErrors.join('\n'));
  const notice = document.createElement('p');
  notice.setAttribute('role', 'alert');
  notice.className = 'product-control-notice';
  notice.textContent = 'Some product details could not load. Please contact us before ordering.';
  const main = document.querySelector('main');
  if (main) main.prepend(notice);
  else document.querySelector('.nav-spacer')?.after(notice);
}
document.querySelectorAll('[data-site-name]').forEach(el => { el.textContent = SITE_NAME; });
document.querySelectorAll('[data-brand-label]').forEach(el => {
  el.setAttribute('aria-label', `${SITE_NAME}, ${el.dataset.brandLabel}`);
});
document.title = `${document.querySelector('title').dataset.pageTitle} | ${SITE_NAME}`;
const ogTitle = document.querySelector('meta[property="og:title"]');
if (ogTitle) ogTitle.content = `${SITE_NAME}: Steady light isn't expensive.`;
