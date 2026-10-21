// js/leads.js
// ─────────────────────────────────────────────────────────────────────────────
// Fire-and-forget lead submission.
// A failed request must never block the user from continuing.
// ─────────────────────────────────────────────────────────────────────────────

import { LEAD_ENDPOINT } from '../config.js';

/**
 * Send a lead record to the configured endpoint.
 * Works with Google Apps Script web apps and Formspree.
 * If LEAD_ENDPOINT is empty or the request fails, fails silently.
 *
 * @param {object} payload  - Any serialisable object describing the lead.
 */
export async function sendLead(payload) {
  if (!LEAD_ENDPOINT) return;
  try {
    await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
      // keepalive lets the request outlive page navigation
      keepalive: true,
    });
  } catch {
    // Intentionally silent — never block the user.
  }
}
