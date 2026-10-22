// config.js
// ─────────────────────────────────────────────────────────────────────────────
// All site-wide configuration lives here.
// Public keys (Paystack) are safe in the browser.
// NEVER add a Paystack secret key or any private API credential to this file.
// ─────────────────────────────────────────────────────────────────────────────

// TODO: replace with your actual business name before going live
export const SITE_NAME = 'Let It Shine'; // TODO: confirm

export const WHATSAPP_NUMBER = '2348076229301'; // Country code and number, without + or spaces.

export const PAYSTACK_PUBLIC_KEY = ''; // TODO: add your Paystack public key (starts with pk_live_ or pk_test_)

// Lead endpoint - set to a Google Apps Script web app URL, a Formspree URL,
// or any URL that accepts a POST with a JSON body.
// If empty, lead sending is silently skipped.
export const LEAD_ENDPOINT = ''; // TODO: add your lead collection URL

export const CURRENCY = 'NGN';
export const PHONE_CHARGE_WH = 15; // TODO: confirm typical phone battery
export const CURRENCY_SYMBOL = '₦';

// ── Trust and social proof flags ──────────────────────────────────────────────
// Set these to true only when you have real verified data to show.
// Both are false until confirmed data exists.
export const SHOW_TRUST_STATS   = false;  // units delivered, states served, etc.
export const SHOW_TESTIMONIALS  = false;  // customer testimonials and ratings

// ── Payback period - hide if payback is longer than this ─────────────────────
// 60 months = 5 years. Beyond this, the figure is not useful to show.
export const PAYBACK_MONTH_CAP = 60;

// ── Near-miss threshold ───────────────────────────────────────────────────────
// A unit is a "near miss" if energyNeedWh is within this fraction of its usableWh.
export const NEAR_MISS_THRESHOLD = 0.15; // 15 %

// ── Tight-fit threshold ───────────────────────────────────────────────────────
// Usage at or above this fraction triggers the "tight" badge.
export const TIGHT_FIT_THRESHOLD = 0.85; // 85 %
