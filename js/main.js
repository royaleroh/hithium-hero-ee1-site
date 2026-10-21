// js/main.js
// ─────────────────────────────────────────────────────────────────────────────
// Site-wide JS: nav behaviour, scroll reveals, count-up animation.
// ─────────────────────────────────────────────────────────────────────────────

// ── Nav: scroll shadow + mobile toggle ────────────────────────────────────────
const nav       = document.getElementById('site-nav');
const burger    = document.getElementById('nav-burger');
const mobileNav = document.getElementById('nav-mobile');

// Add scrolled class for shadow / border
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

// Mobile menu toggle
burger?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile menu when a link is clicked
mobileNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ── Scroll reveals ─────────────────────────────────────────────────────────────
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Skip animation entirely for users who prefer reduced motion
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  elements.forEach(el => observer.observe(el));
}

initReveal();

// ── Count-up animation ─────────────────────────────────────────────────────────
/**
 * Animate a numeric element from 0 to its target value.
 *
 * @param {HTMLElement} el        - Element with data-count-target and data-count-suffix
 * @param {number}      duration  - Animation duration in ms
 */
export function countUp(el, duration = 1600) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target  = parseFloat(el.dataset.countTarget ?? '0');
  const suffix  = el.dataset.countSuffix ?? '';
  const isFloat = target % 1 !== 0;
  const decimals = isFloat ? 1 : 0;

  if (prefersReduced) {
    el.textContent = target.toFixed(decimals) + suffix;
    return;
  }

  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Trigger count-up when stat elements enter the viewport
function initCountUps() {
  const elements = document.querySelectorAll('[data-count-target]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  elements.forEach(el => observer.observe(el));
}

initCountUps();

// ── Smooth scroll for in-page links ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
