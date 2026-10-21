// tests/calculate.test.js
// Run with: node --test tests/calculate.test.js
// No npm dependencies required.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimate, runtimeLabel } from '../js/calculate.js';

// ─── Shared test product ──────────────────────────────────────────────────────
const product = { usableWh: 1000, maxOutputW: 1000, price: 285_000 };

// ─── Helper ───────────────────────────────────────────────────────────────────
function sel(applianceId, label, watts, qty, hours, surgeMultiplier = 1) {
  return { applianceId, label, watts, surgeMultiplier, qty, hours };
}

// ─── Zero-appliance case ──────────────────────────────────────────────────────

describe('zero appliances', () => {
  it('returns zero energy when selections array is empty', () => {
    const r = calculateEstimate({ selections: [] }, product);
    assert.equal(r.dailyWh, 0);
    assert.equal(r.adjustedWh, 0);
    assert.equal(r.peakW, 0);
    assert.equal(r.fitsInOneCharge, true);
    assert.equal(r.fitsOutput, true);
    assert.equal(r.paybackMonths, null);
  });

  it('returns zero energy when all quantities are zero', () => {
    const r = calculateEstimate({ selections: [sel('led-bulb', 'LED bulb', 10, 0, 5)] }, product);
    assert.equal(r.dailyWh, 0);
    assert.equal(r.adjustedWh, 0);
  });

  it('returns zero energy when all hours are zero', () => {
    const r = calculateEstimate({ selections: [sel('fan', 'Fan', 50, 1, 0, 2)] }, product);
    assert.equal(r.dailyWh, 0);
  });
});

// ─── Worked example from the spec ────────────────────────────────────────────
// 4 LED bulbs (10 W, 5 h) = 200 Wh
// Fan (50 W, 6 h)         = 300 Wh
// TV (80 W, 4 h)          = 320 Wh
// Router (12 W, 12 h)     = 144 Wh
// Total                   = 964 Wh
// Adjusted (x1.2)         = 1 156.8 Wh

describe('worked example from spec', () => {
  const selections = [
    sel('led-bulb', 'LED bulb', 10, 4, 5),
    sel('fan',      'Fan',      50, 1, 6, 2), // surge x2, does not affect dailyWh
    sel('tv',       'TV',       80, 1, 4),
    sel('router',   'Router',   12, 1, 12),
  ];
  const input = { selections };

  it('dailyWh equals 964', () => {
    const r = calculateEstimate(input, product);
    assert.equal(r.dailyWh, 964);
  });

  it('adjustedWh equals 1156.8 (964 x 1.2)', () => {
    const r = calculateEstimate(input, product);
    assert.ok(Math.abs(r.adjustedWh - 1156.8) < 0.001, `expected 1156.8, got ${r.adjustedWh}`);
  });

  it('does NOT fit in one charge (1156.8 > 1000 usableWh)', () => {
    const r = calculateEstimate(input, product);
    assert.equal(r.fitsInOneCharge, false);
  });

  it('daysPerCharge is roughly 0.865 (1000 / 1156.8)', () => {
    const r = calculateEstimate(input, product);
    const expected = 1000 / 1156.8;
    assert.ok(Math.abs(r.daysPerCharge - expected) < 0.001, `expected ~${expected.toFixed(4)}, got ${r.daysPerCharge}`);
  });

  it('runningW equals 182 (40 + 50 + 80 + 12, no surge in runningW)', () => {
    const r = calculateEstimate(input, product);
    // 4*10 + 1*50 + 1*80 + 1*12 = 40 + 50 + 80 + 12 = 182
    assert.equal(r.runningW, 182);
  });

  it('peakW equals 232 (fan uses surge x2: 40 + 100 + 80 + 12)', () => {
    const r = calculateEstimate(input, product);
    // 4*10*1 + 1*50*2 + 1*80*1 + 1*12*1 = 40 + 100 + 80 + 12 = 232
    assert.equal(r.peakW, 232);
  });

  it('fitsOutput is true (peak 232 W < max 1000 W)', () => {
    const r = calculateEstimate(input, product);
    assert.equal(r.fitsOutput, true);
  });
});

// ─── Comfortable fit within one charge ───────────────────────────────────────

describe('comfortable fit within one charge', () => {
  const selections = [
    sel('led-bulb',      'LED bulb',     10, 2, 4),
    sel('router',        'Router',       12, 1, 8),
    sel('phone-charger', 'Phone',        10, 1, 2),
  ];
  // dailyWh = 80 + 96 + 20 = 196, adjustedWh = 235.2 — well under 1000

  it('fitsInOneCharge is true', () => {
    const r = calculateEstimate({ selections }, product);
    assert.equal(r.fitsInOneCharge, true);
  });

  it('fitsOutput is true', () => {
    const r = calculateEstimate({ selections }, product);
    assert.equal(r.fitsOutput, true);
  });

  it('daysPerCharge is greater than 1', () => {
    const r = calculateEstimate({ selections }, product);
    assert.ok(r.daysPerCharge > 1, `expected > 1, got ${r.daysPerCharge}`);
  });
});

// ─── Surge / output-limit case ───────────────────────────────────────────────
// 5 mini fridges: surge = 5 * 90 * 3 = 1350 W > 1000 W max output

describe('peak output exceeded (surge case)', () => {
  const selections = [sel('mini-fridge', 'Mini fridge', 90, 5, 6, 3)];

  it('fitsOutput is false', () => {
    const r = calculateEstimate({ selections }, product);
    assert.equal(r.fitsOutput, false);
  });

  it('peakW equals 1350', () => {
    const r = calculateEstimate({ selections }, product);
    assert.equal(r.peakW, 1350);
  });

  it('fitMessage mentions "exceeds" or the watt figure', () => {
    const r = calculateEstimate({ selections }, product);
    assert.ok(
      r.fitMessage.includes('1350') || r.fitMessage.toLowerCase().includes('more than'),
      `fitMessage was: ${r.fitMessage}`,
    );
  });

  it('overloadedAppliances is non-empty', () => {
    const r = calculateEstimate({ selections }, product);
    assert.ok(r.overloadedAppliances.length > 0, 'expected at least one overloaded appliance');
  });
});

// ─── Payback calculation ─────────────────────────────────────────────────────

describe('payback calculation', () => {
  const selections = [sel('led-bulb', 'LED bulb', 10, 2, 5)];

  it('calculates payback months correctly (285000 / 30000 = ~10)', () => {
    const r = calculateEstimate({ selections, monthlyPowerSpend: 30_000 }, product);
    assert.equal(r.paybackMonths, Math.round(285_000 / 30_000));
  });

  it('paybackMonths is null when no spend provided', () => {
    const r = calculateEstimate({ selections }, product);
    assert.equal(r.paybackMonths, null);
  });

  it('paybackMonths is null when spend is zero', () => {
    const r = calculateEstimate({ selections, monthlyPowerSpend: 0 }, product);
    assert.equal(r.paybackMonths, null);
  });
});

// ─── runtimeLabel helper ──────────────────────────────────────────────────────

describe('runtimeLabel helper', () => {
  it('returns "no runtime" for zero', () => assert.equal(runtimeLabel(0), 'no runtime'));
  it('returns "less than 1 hour" for 0.5', () => assert.equal(runtimeLabel(0.5), 'less than 1 hour'));
  it('returns "about 1 hour" for 1', () => assert.equal(runtimeLabel(1), 'about 1 hour'));
  it('returns "about 1 night" for 18', () => assert.equal(runtimeLabel(18), 'about 1 night'));
  it('returns "about 2 days" for 48', () => assert.equal(runtimeLabel(48), 'about 2 days'));
});
