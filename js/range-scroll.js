const rail = document.getElementById('trust-facts');
const previous = document.getElementById('range-prev');
const next = document.getElementById('range-next');
const position = document.getElementById('range-position');
const controls = document.getElementById('range-controls');

if (rail && previous && next && position) {
  const cards = [...rail.children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const move = amount => rail.scrollBy({left: amount, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  const stride = () => cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth;
  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    previous.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max - 2;
    controls.hidden = max <= 2;
    const bounds = rail.getBoundingClientRect();
    const visible = cards.map((card, index) => {
      const box = card.getBoundingClientRect();
      return Math.min(box.right,bounds.right) - Math.max(box.left,bounds.left) >= box.width / 2 ? index + 1 : null;
    }).filter(Boolean);
    if (visible.length) {
      const first = visible[0], last = visible.at(-1);
      position.textContent = `${first === last ? first : `${first} to ${last}`} of ${cards.length}`;
    }
  };
  previous.addEventListener('click', () => move(-stride()));
  next.addEventListener('click', () => move(stride()));
  rail.addEventListener('keydown', event => {
    if (event.target !== rail) return;
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') move((event.key === 'ArrowLeft' ? -1 : 1) * stride());
    else rail.scrollTo({left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  });
  rail.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(rail);
  update();
}
// Wait for the catalogue-backed cards before measuring the rail.
import './main-sections.js';
