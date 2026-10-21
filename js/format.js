// js/format.js
// ─────────────────────────────────────────────────────────────────────────────
// Number and currency formatting helpers.
// ─────────────────────────────────────────────────────────────────────────────

const nairaFmt = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat('en-NG');

/**
 * Format a number as naira with thousands separators.
 * e.g. 285000 → "₦285,000"
 * @param {number} amount
 * @returns {string}
 */
export function formatNaira(amount) {
  return nairaFmt.format(amount);
}

/**
 * Format a plain number with thousands separators.
 * e.g. 1234.5 → "1,234.5"
 * @param {number} n
 * @param {number} [decimals]
 * @returns {string}
 */
export function formatNumber(n, decimals) {
  if (decimals !== undefined) {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);
  }
  return numberFmt.format(n);
}
