// ---------- FAQ ACCORDION ----------
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if(openItem !== item){ openItem.classList.remove('open'); openItem.querySelector('.faq-a').style.maxHeight = null; }
    });
    if(isOpen){ item.classList.remove('open'); a.style.maxHeight = null; }
    else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
});

// ---------- STICKY MOBILE CTA ----------
const stickyCta = document.getElementById('stickyCta');
const heroEl = document.querySelector('.hero');
if(stickyCta && heroEl){
  window.addEventListener('scroll', () => {
    if(window.innerWidth <= 860){
      const heroBottom = heroEl.getBoundingClientRect().bottom;
      if(heroBottom < 0){ stickyCta.classList.add('show'); } else { stickyCta.classList.remove('show'); }
    }
  });

  // Sticky button always jumps to whichever lead form is coming up next
  const stickyLink = stickyCta.querySelector('[data-sticky-link]');
  if(stickyLink){
    stickyLink.addEventListener('click', (e) => {
      e.preventDefault();
      const forms = Array.from(document.querySelectorAll('[data-lead-card]'));
      const scrollY = window.scrollY + window.innerHeight * 0.5;
      let target = forms.find(f => f.getBoundingClientRect().top + window.scrollY > scrollY);
      if(!target) target = forms[forms.length - 1];
      if(target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

// ---------- LEAD CAPTURE FORMS (dual CTA: consult -> WhatsApp, order -> thank-you page) ----------
const WHATSAPP_NUMBER = '2347047093487';

function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function saveLead(name, email, intent){
  try{
    const leads = JSON.parse(localStorage.getItem('hithium_leads') || '[]');
    leads.push({ name, email, intent, timestamp: new Date().toISOString() });
    localStorage.setItem('hithium_leads', JSON.stringify(leads));
  }catch(err){ /* localStorage unavailable, continue anyway */ }
}

document.querySelectorAll('[data-lead-card]').forEach(card => {
  const nameInput = card.querySelector('[data-input="name"]');
  const emailInput = card.querySelector('[data-input="email"]');
  const nameField = card.querySelector('[data-field="name"]');
  const emailField = card.querySelector('[data-field="email"]');
  const fieldsWrap = card.querySelector('[data-lead-fields]');
  const successWrap = card.querySelector('[data-lead-success]');
  const successTitle = card.querySelector('[data-success-title]');
  const successText = card.querySelector('[data-success-text]');
  const whatsappLink = card.querySelector('[data-whatsapp-link]');

  function validate(){
    let valid = true;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if(name.length < 2){ nameField.classList.add('error'); valid = false; } else { nameField.classList.remove('error'); }
    if(!isValidEmail(email)){ emailField.classList.add('error'); valid = false; } else { emailField.classList.remove('error'); }
    return valid ? { name, email } : null;
  }

  [nameInput, emailInput].forEach(input => {
    input.addEventListener('input', () => input.closest('.field').classList.remove('error'));
  });

  // Action 1: Free consultation -> opens WhatsApp with prefilled details
  const consultBtn = card.querySelector('[data-action="consult"]');
  if(consultBtn){
    consultBtn.addEventListener('click', () => {
      const data = validate();
      if(!data) return;

      saveLead(data.name, data.email, 'consultation');

      const message = `Hi, I'm ${data.name} (${data.email}). I'd like a free power consultation for the Hithium Hero EE1.`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      whatsappLink.href = waUrl;
      successTitle.textContent = "You're all set!";
      successText.textContent = "Click below to continue on WhatsApp — we've pre-filled it with your details.";
      fieldsWrap.style.display = 'none';
      const noteEl = card.querySelector('.lead-note');
      if(noteEl) noteEl.style.display = 'none';
      const trustEl = card.querySelector('.consult-trust-row');
      if(trustEl) trustEl.style.display = 'none';
      const reassureEl = card.querySelector('.consult-reassurance');
      if(reassureEl) reassureEl.style.display = 'none';
      successWrap.classList.add('show');

      window.open(waUrl, '_blank');
    });
  }

  // Action 2: Order the power station -> redirect to thank-you page
  const orderBtn = card.querySelector('[data-action="order"]');
  if(orderBtn){
    orderBtn.addEventListener('click', () => {
      const data = validate();
      if(!data) return;

      saveLead(data.name, data.email, 'order');

      const params = new URLSearchParams({ name: data.name, email: data.email });
      window.location.href = `thank-you.html?${params.toString()}`;
    });
  }
});

// ---------- REVEAL ON SCROLL ----------
const revealEls = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('in'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));
