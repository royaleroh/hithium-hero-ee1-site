// tests/recommend.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Run with: node --test tests/recommend.test.js
// No npm dependencies required.
//
// All six test scenarios from the brief, plus helpers and edge cases.
// Outage hours = 8 unless stated.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { recommend, deriveLoad, checkProduct, computePayback, runtimeLabel } from '../js/recommend.js';

// ─── Catalogue subset: four portable units ────────────────────────────────────
//
// Using the exact values from data/catalogue.js so the tests are honest.
// peakOutputW for Power Tank is 600 (confirmed lower figure from key_specs).

import { catalogue, portableProducts } from '../data/catalogue.js';
const POWER_GO = catalogue.products.find(p => p.slug === 'itel-power-go');
const POWER_GO_PRO = catalogue.products.find(p => p.slug === 'itel-power-go-pro');
const POWER_TANK = catalogue.products.find(p => p.slug === 'itel-power-tank');
const POWER_TANK_1000 = catalogue.products.find(p => p.slug === 'itel-power-tank-1000');
const ALL_ELIGIBLE = portableProducts;

// ─── Helper: build a selection item ──────────────────────────────────────────

function sel({ id = 'x', label = 'Item', watts, qty = 1, hours, surgeMultiplier = 1, acRequired = false }) {
  return { id, label, watts, qty, hours, surgeMultiplier, acRequired };
}

// ─── Appliance constants from the brief ──────────────────────────────────────

const LED_BULB      = (qty, hours) => sel({ id: 'led-bulb',      label: 'LED bulb',           watts: 10,  qty, hours, surgeMultiplier: 1, acRequired: true });
const FAN           = (qty, hours) => sel({ id: 'fan',           label: 'Fan',                watts: 50,  qty, hours, surgeMultiplier: 2, acRequired: true });
const TV            = (qty, hours) => sel({ id: 'tv',            label: 'TV',                 watts: 80,  qty, hours, surgeMultiplier: 1, acRequired: true });
const ROUTER        = (qty, hours) => sel({ id: 'router',        label: 'Wi-Fi router',       watts: 12,  qty, hours, surgeMultiplier: 1, acRequired: false });
const PHONE_CHARGER = (qty, hours) => sel({ id: 'phone-charger', label: 'Phone charger',      watts: 10,  qty, hours, surgeMultiplier: 1, acRequired: false });
const LAPTOP        = (qty, hours) => sel({ id: 'laptop',        label: 'Laptop',             watts: 65,  qty, hours, surgeMultiplier: 1, acRequired: false });
const MINI_FRIDGE   = (qty, hours) => sel({ id: 'mini-fridge',   label: 'Mini fridge',        watts: 90,  qty, hours, surgeMultiplier: 3, acRequired: true });

// =============================================================================
// TEST 1 - Student, all DC-friendly
// =============================================================================
//
// Laptop 65 W x1 for 2 h (min(2,8) = 2): 130 Wh
// Phone charger 10 W x1 for 2 h:          20 Wh
// Router 12 W x1 for 4 h:                 48 Wh
// Total raw: 198 Wh  x1.2 = 237.6 Wh
// runningW: 65+10+12 = 87 W
// peakW: 87 W (all surge x1)
// needsAC: false
// Best fit: Power Go (320 Wh, no AC needed). Usage = 237.6/320 = 74.25 %

describe('Test 1 - Student, all DC-friendly', () => {
  const selections = [
    LAPTOP(1, 2),
    PHONE_CHARGER(1, 2),
    ROUTER(1, 4),
  ];
  const input = { selections, outageHours: 8 };

  it('energyNeedWh is 237.6', () => {
    const { energyNeedWh } = deriveLoad(selections, 8);
    assert.ok(Math.abs(energyNeedWh - 237.6) < 0.01, `expected 237.6, got ${energyNeedWh}`);
  });

  it('runningW is 87', () => {
    const { runningW } = deriveLoad(selections, 8);
    assert.equal(runningW, 87);
  });

  it('peakW is 87', () => {
    const { peakW } = deriveLoad(selections, 8);
    assert.equal(peakW, 87);
  });

  it('needsAC is false', () => {
    const { needsAC } = deriveLoad(selections, 8);
    assert.equal(needsAC, false);
  });

  it('recommend returns state fit', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.equal(result.state, 'fit');
  });

  it('best fit is Power Go', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.equal(result.bestFit.slug, 'itel-power-go');
  });

  it('usage is approximately 74 %', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.ok(
      Math.abs(result.usagePercent - 74.25) < 1,
      `expected ~74 %, got ${result.usagePercent.toFixed(1)} %`,
    );
  });
});

// =============================================================================
// TEST 2 - Shop with a near miss
// =============================================================================
//
// 4 LED bulbs x 8 h: 320 Wh
// Fan x1 x 8 h: 400 Wh
// 2 phone chargers x 4 h: 80 Wh
// Router x 8 h: 96 Wh
// Total raw: 896 Wh  x1.2 = 1,075.2 Wh
// runningW: 40+50+20+12 = 122 W
// peakW: 40+100+20+12 = 172 W
// needsAC: true (LED bulbs and fan are acRequired)
//
// Power Go: fails (no AC)
// Power Go Pro: fails (energy 1,075.2 > 320)
// Power Tank: fails (energy 1,075.2 > 1,000 - 7.5 % over, within 15 %)
//   → near-miss candidate: trim fan by 2 h
//     fan 6 h: 40*8 + 50*6 + 20*4 + 12*8 = 320+300+80+96 = 796 Wh x1.2 = 955.2 Wh ≤ 1000 ✓
// Power Tank 1000: passes (energy 1,075.2 ≤ 2000)
// Best fit: Power Tank 1000

describe('Test 2 - Shop with a near miss', () => {
  const selections = [
    LED_BULB(4, 8),
    FAN(1, 8),
    PHONE_CHARGER(2, 4),
    ROUTER(1, 8),
  ];
  const input = { selections, outageHours: 8 };

  it('energyNeedWh is 1,075.2', () => {
    const { energyNeedWh } = deriveLoad(selections, 8);
    assert.ok(Math.abs(energyNeedWh - 1075.2) < 0.01, `expected 1075.2, got ${energyNeedWh}`);
  });

  it('runningW is 122', () => {
    const { runningW } = deriveLoad(selections, 8);
    assert.equal(runningW, 122);
  });

  it('peakW is 172', () => {
    const { peakW } = deriveLoad(selections, 8);
    // 4*10*1 + 1*50*2 + 2*10*1 + 1*12*1 = 40 + 100 + 20 + 12 = 172
    assert.equal(peakW, 172);
  });

  it('needsAC is true', () => {
    const { needsAC } = deriveLoad(selections, 8);
    assert.equal(needsAC, true);
  });

  it('Power Go fails (no-ac)', () => {
    const { passes, failReasons } = checkProduct(POWER_GO, deriveLoad(selections, 8));
    assert.equal(passes, false);
    assert.ok(failReasons.includes('no-ac'));
  });

  it('Power Go Pro fails (battery-too-small)', () => {
    const load = deriveLoad(selections, 8);
    const { passes, failReasons } = checkProduct(POWER_GO_PRO, load);
    assert.equal(passes, false);
    assert.ok(failReasons.includes('battery-too-small'));
  });

  it('Power Tank fails (battery-too-small only)', () => {
    const load = deriveLoad(selections, 8);
    const { passes, failReasons } = checkProduct(POWER_TANK, load);
    assert.equal(passes, false);
    assert.equal(failReasons.length, 1);
    assert.ok(failReasons.includes('battery-too-small'));
  });

  it('Power Tank 1000 passes all checks', () => {
    const { passes } = checkProduct(POWER_TANK_1000, deriveLoad(selections, 8));
    assert.equal(passes, true);
  });

  it('recommend best fit is Power Tank 1000', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.equal(result.bestFit.slug, 'itel-power-tank-1000');
  });

  it('recommend state is near-miss (Power Tank is near miss)', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.equal(result.state, 'near-miss');
  });

  it('near-miss trim reduces the fan by 2 hours', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.ok(result.nearMissTrim !== null, 'expected a trim suggestion');
    assert.ok(
      result.nearMissTrim.applianceLabel.toLowerCase().includes('fan'),
      `expected fan, got ${result.nearMissTrim.applianceLabel}`,
    );
    assert.equal(result.nearMissTrim.reduceByHours, 2);
  });
});

// =============================================================================
// TEST 3 - Surge excludes a unit
// =============================================================================
//
// Mini fridge x1 x 2 h:
//   energy: 90 * 2 = 180 Wh  x1.2 = 216 Wh
//   runningW: 90 W
//   peakW: 90 * 3 = 270 W
//   needsAC: true
//
// Power Go: fails (no-ac)
// Power Go Pro: fails (peak 270 > 200)
// Power Tank: passes (peak 270 <= 600, energy 216 <= 1000, running 90 <= 500, AC yes)
// Best fit: Power Tank

describe('Test 3 - Surge excludes Power Go Pro', () => {
  const selections = [MINI_FRIDGE(1, 2)];
  const input = { selections, outageHours: 8 };

  it('energyNeedWh is 216', () => {
    const { energyNeedWh } = deriveLoad(selections, 8);
    assert.ok(Math.abs(energyNeedWh - 216) < 0.01, `expected 216, got ${energyNeedWh}`);
  });

  it('runningW is 90', () => {
    const { runningW } = deriveLoad(selections, 8);
    assert.equal(runningW, 90);
  });

  it('peakW is 270', () => {
    const { peakW } = deriveLoad(selections, 8);
    assert.equal(peakW, 270);
  });

  it('Power Go fails (no-ac)', () => {
    const { passes, failReasons } = checkProduct(POWER_GO, deriveLoad(selections, 8));
    assert.equal(passes, false);
    assert.ok(failReasons.includes('no-ac'));
  });

  it('Power Go Pro fails (peak-too-low)', () => {
    const load = deriveLoad(selections, 8);
    const { passes, failReasons } = checkProduct(POWER_GO_PRO, load);
    assert.equal(passes, false);
    assert.ok(failReasons.includes('peak-too-low'));
  });

  it('Power Tank passes all checks', () => {
    const { passes } = checkProduct(POWER_TANK, deriveLoad(selections, 8));
    assert.equal(passes, true);
  });

  it('recommend best fit is Power Tank', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.equal(result.bestFit.slug, 'itel-power-tank');
  });

  it('recommend state is fit', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.ok(result.state === 'fit' || result.state === 'tight');
  });
});

// =============================================================================
// TEST 4 - Too big: whole home system
// =============================================================================
//
// 2 mini fridges x 8 h: 90*2*8 = 1440 Wh
// TV x1 x 6 h: 480 Wh
// 2 fans x 8 h: 50*2*8 = 800 Wh
// Total raw: 2720 Wh  x1.2 = 3264 Wh
// runningW: 180+80+100 = 360 W
// peakW: 2*90*3 + 80 + 2*50*2 = 540+80+200 = 820 W
// needsAC: true
// No unit passes (largest is 2000 Wh). State: none.

describe('Test 4 - Too big, whole home system', () => {
  const selections = [
    MINI_FRIDGE(2, 8),
    TV(1, 6),
    FAN(2, 8),
  ];
  const input = { selections, outageHours: 8 };

  it('energyNeedWh is 3264', () => {
    const { energyNeedWh } = deriveLoad(selections, 8);
    assert.ok(Math.abs(energyNeedWh - 3264) < 0.01, `expected 3264, got ${energyNeedWh}`);
  });

  it('Power Tank 1000 fails (battery-too-small)', () => {
    const load = deriveLoad(selections, 8);
    const { passes, failReasons } = checkProduct(POWER_TANK_1000, load);
    assert.equal(passes, false);
    assert.ok(failReasons.includes('battery-too-small'));
  });

  it('recommend state is none', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.equal(result.state, 'none');
  });

  it('noReason is a non-empty string', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.ok(typeof result.noReason === 'string' && result.noReason.length > 0);
  });

  it('closestUnit is the largest portable unit', () => {
    const result = recommend(input, ALL_ELIGIBLE);
    assert.equal(result.closestUnit.slug, 'hithium-heroee-2');
  });
});

// =============================================================================
// TEST 5 - Zero appliances
// =============================================================================

describe('Test 5 - Zero appliances', () => {
  it('empty selections returns state empty', () => {
    const result = recommend({ selections: [] }, ALL_ELIGIBLE);
    assert.equal(result.state, 'empty');
  });

  it('zero qty returns state empty', () => {
    const result = recommend(
      { selections: [{ ...LAPTOP(0, 4) }] },
      ALL_ELIGIBLE,
    );
    assert.equal(result.state, 'empty');
  });

  it('zero hours returns state empty', () => {
    const result = recommend(
      { selections: [{ ...LAPTOP(1, 0) }] },
      ALL_ELIGIBLE,
    );
    assert.equal(result.state, 'empty');
  });

  it('does not throw for empty input', () => {
    assert.doesNotThrow(() => recommend({ selections: [] }, ALL_ELIGIBLE));
  });

  it('energyNeedWh is 0 for empty selections', () => {
    const { energyNeedWh } = deriveLoad([], 8);
    assert.equal(energyNeedWh, 0);
  });
});

// =============================================================================
// TEST 6 - Null price product never produces payback or checkout
// =============================================================================

describe('Test 6 - Null price never produces payback', () => {
  it('computePayback with null price returns null months', () => {
    const { months } = computePayback(null, 30000);
    assert.equal(months, null);
  });

  it('computePayback with null price returns null label', () => {
    const { label } = computePayback(null, 30000);
    assert.equal(label, null);
  });

  it('recommend with a null-priced best fit returns null payback months', () => {
    // Power Go (null price) is the best fit for the student scenario
    const selections = [LAPTOP(1, 2), PHONE_CHARGER(1, 2), ROUTER(1, 4)];
    const result = recommend({ selections, outageHours: 8, monthlyPowerSpend: 30000 }, ALL_ELIGIBLE);
    assert.equal(result.bestFit.slug, 'itel-power-go');
    assert.equal(result.payback.months, null);
  });
});

// =============================================================================
// Extra: runtimeLabel helper (preserved from original tests)
// =============================================================================

describe('runtimeLabel helper', () => {
  it('returns "no runtime" for zero', () => assert.equal(runtimeLabel(0), 'no runtime'));
  it('returns "less than 1 hour" for 0.5', () => assert.equal(runtimeLabel(0.5), 'less than 1 hour'));
  it('returns "about 1 hour" for 1', () => assert.equal(runtimeLabel(1), 'about 1 hour'));
  it('returns "about 1 night" for 18', () => assert.equal(runtimeLabel(18), 'about 1 night'));
  it('returns "about 2 days" for 48', () => assert.equal(runtimeLabel(48), 'about 2 days'));
});

// =============================================================================
// Extra: deriveLoad respects outageHours cap
// =============================================================================

describe('deriveLoad - outage hours cap', () => {
  it('caps hours at outageHours if appliance is used longer', () => {
    // Router used for 12 h, but outage is only 8 h → counts as 8 h
    const s = ROUTER(1, 12);
    const { energyNeedWh } = deriveLoad([s], 8);
    // 12 W * 1 * 8 h * 1.2 = 115.2
    assert.ok(Math.abs(energyNeedWh - 115.2) < 0.01, `expected 115.2, got ${energyNeedWh}`);
  });

  it('does not cap hours if appliance hours <= outageHours', () => {
    const s = ROUTER(1, 4);
    const { energyNeedWh } = deriveLoad([s], 8);
    // 12 W * 1 * 4 h * 1.2 = 57.6
    assert.ok(Math.abs(energyNeedWh - 57.6) < 0.01, `expected 57.6, got ${energyNeedWh}`);
  });
});
