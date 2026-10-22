// js/recommend.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure functions only. No DOM access. Safe to run in Node tests.
//
// The recommender takes a visitor's appliance selections and outage hours,
// then returns the smallest suitable unit from the catalogue, and says why.
//
// Terminology used throughout:
//   energyNeedWh   - Wh needed during the outage window, with 20 % loss allowance
//   runningW       - sum of all selected watts running simultaneously (no surge)
//   peakW          - worst-case simultaneous peak (with surge multipliers)
//   needsAC        - true if any selected appliance has acRequired: true
// ─────────────────────────────────────────────────────────────────────────────

import { DEFAULT_MONTHLY_POWER_SPEND, DEFAULT_DAILY_OUTAGE_HOURS, portableProducts } from '../data/catalogue.js';
import { PAYBACK_MONTH_CAP, NEAR_MISS_THRESHOLD, TIGHT_FIT_THRESHOLD } from '../config.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const LOSS_FACTOR = 1.2; // 20 % allowance for inverter losses and wiring

// ── Pure helper: runtime as plain English ─────────────────────────────────────

/**
 * @param {number} hours
 * @returns {string}
 */
export function runtimeLabel(hours) {
  if (!isFinite(hours) || hours <= 0) return 'no runtime';
  if (hours < 1)  return 'less than 1 hour';
  if (hours < 2)  return 'about 1 hour';
  if (hours < 6)  return `about ${Math.round(hours)} hours`;
  if (hours < 14) return 'about half a day';
  if (hours < 22) return 'about 1 night';
  if (hours < 30) return 'about 1 day';
  if (hours < 42) return 'about 1.5 days';
  const days = Math.round(hours / 24);
  return `about ${days} day${days === 1 ? '' : 's'}`;
}

// ── Pure helper: Naira formatting ─────────────────────────────────────────────

const _fmt = new Intl.NumberFormat('en-NG');
/**
 * Format a number as Nigerian Naira, e.g. "₦285,000".
 * @param {number} n
 * @returns {string}
 */
export function formatNaira(n) {
  return `\u20A6${_fmt.format(n)}`;
}

// ── Step 1: derive load numbers from selections ────────────────────────────────

/**
 * Compute load numbers from the visitor's selections.
 *
 * @param {Array<{watts:number, qty:number, hours:number, surgeMultiplier:number, acRequired:boolean}>} selections
 * @param {number} outageHours  - hours per day the grid is off
 * @returns {{ energyNeedWh:number, runningW:number, peakW:number, needsAC:boolean }}
 */
export function deriveLoad(selections, outageHours) {
  const active = selections.filter(s => s.qty > 0 && s.hours > 0);

  const energyNeedWh = LOSS_FACTOR * active.reduce((sum, s) => {
    // Only count energy used during the outage window
    const effectiveHours = Math.min(s.hours, outageHours);
    return sum + s.watts * s.qty * effectiveHours;
  }, 0);

  const runningW = active.reduce((sum, s) => sum + s.watts * s.qty, 0);

  const peakW = active.reduce(
    (sum, s) => sum + s.watts * s.qty * (s.surgeMultiplier || 1),
    0,
  );

  const needsAC = active.some(s => s.acRequired === true);

  return { energyNeedWh, runningW, peakW, needsAC };
}

// ── Step 2: check a single product against the load ───────────────────────────

/**
 * Check whether a product passes all four suitability criteria.
 *
 * @param {object} product
 * @param {{ energyNeedWh:number, runningW:number, peakW:number, needsAC:boolean }} load
 * @returns {{ passes:boolean, failReasons:string[] }}
 */
export function checkProduct(product, load) {
  const failReasons = [];

  // 1. AC output
  if (load.needsAC && !product.acOutput) {
    failReasons.push('no-ac');
  }

  // 2. Running output
  if (load.runningW > product.maxOutputW) {
    failReasons.push('output-too-low');
  }

  // 3. Peak / surge output
  const effectivePeak = product.peakOutputW ?? product.maxOutputW;
  if (load.peakW > effectivePeak) {
    failReasons.push('peak-too-low');
  }

  // 4. Battery capacity
  if (load.energyNeedWh > product.usableWh) {
    failReasons.push('battery-too-small');
  }

  return { passes: failReasons.length === 0, failReasons };
}

// ── Step 3: find a near-miss trim suggestion ──────────────────────────────────

/**
 * Given a product that fails only on energy, find the single appliance whose
 * hours can be reduced (one hour at a time) until the product fits.
 *
 * Returns null if no single-appliance trim achieves the fit.
 *
 * @param {object} product
 * @param {Array<{label:string, watts:number, qty:number, hours:number}>} selections
 * @param {number} outageHours
 * @returns {{ applianceLabel:string, reduceByHours:number } | null}
 */
export function findNearMissTrim(product, selections, outageHours) {
  // Find the appliance with the highest energy contribution
  const active = selections
    .map((s, index) => ({ ...s, index }))
    .filter(s => s.qty > 0 && s.hours > 0)
    .map(s => ({
      ...s,
      energy: s.watts * s.qty * Math.min(s.hours, outageHours),
    }))
    .sort((a, b) => b.energy - a.energy);

  for (const target of active) {
    // Try reducing hours one at a time
    for (let cut = 1; cut <= target.hours; cut++) {
      const trimmed = selections.map((s, index) =>
        index === target.index
          ? { ...s, hours: s.hours - cut }
          : s,
      );
      const load = deriveLoad(trimmed, outageHours);
      if (load.energyNeedWh <= product.usableWh) {
        return { applianceLabel: target.label, reduceByHours: cut };
      }
    }
  }

  return null;
}

// ── Step 4: payback calculation ────────────────────────────────────────────────

/**
 * Compute payback months. Returns null if not computable.
 * Never returns a negative or absurd number.
 *
 * @param {number|null} price
 * @param {number} monthlySpend
 * @returns {{ months:number|null, label:string }}
 */
export function computePayback(price, monthlySpend) {
  if (!Number.isFinite(price) || price <= 0) {
    return {
      months: null,
      label: null,  // Caller should show "Price on request" instead
    };
  }

  if (!monthlySpend || monthlySpend <= 0) {
    return {
      months: null,
      label: 'Enter your monthly petrol or generator spend above to see a payback estimate.',
    };
  }

  const raw = price / monthlySpend;

  if (raw <= 0 || raw > PAYBACK_MONTH_CAP) {
    return {
      months: null,
      label: 'The unit is a one-time cost against ongoing fuel bills. A simple payback figure is not meaningful here.',
    };
  }

  const months = Math.max(1, Math.round(raw));
  const label =
    months <= 3
      ? `You could recover the cost in as little as ${months} month${months === 1 ? '' : 's'} compared to your current spend.`
      : `At your current spend, you recover the cost in about ${months} month${months === 1 ? '' : 's'}.`;

  return { months, label };
}

// ── Step 5: build a WhatsApp message ──────────────────────────────────────────

/**
 * Build the pre-filled WhatsApp message body.
 *
 * @param {object} params
 * @param {string}  params.productName
 * @param {string}  params.productModel
 * @param {number|null} params.price
 * @param {Array<{label:string, qty:number, hours:number}>} params.selections
 * @param {number}  params.outageHours
 * @param {boolean} [params.wholeHomeSystem]
 * @returns {string}
 */
export function buildWhatsAppMessage({
  productName,
  productModel,
  price,
  selections,
  outageHours,
  wholeHomeSystem = false,
  availabilityEnquiry = false,
}) {
  const priceStr = price !== null ? formatNaira(price) : 'price on request';

  const applianceLines = selections
    .filter(s => s.qty > 0 && s.hours > 0)
    .map(s => `  - ${s.label} x${s.qty}, ${s.hours} h/day`)
    .join('\n');

  const intro = availabilityEnquiry ? 'Hello, please help me find an available unit for this setup.' : wholeHomeSystem
    ? `Hello, I think I need a whole home system. The calculator suggested my load is too large for a portable unit.`
    : `Hello, I am interested in the ${productName} (${productModel}) at ${priceStr}.`;

  return (
    `${intro}\n\n` +
    `My appliances during a ${outageHours}-hour outage:\n${applianceLines}\n\n` +
    `Could you help me confirm this is the right fit?`
  );
}

// ── Main: recommend ───────────────────────────────────────────────────────────

/**
 * The main recommender function.
 *
 * @param {object} input
 * @param {Array<{label:string, watts:number, qty:number, hours:number, surgeMultiplier:number, acRequired:boolean}>} input.selections
 * @param {number} [input.outageHours]       - default from catalogue.DEFAULT_DAILY_OUTAGE_HOURS
 * @param {number} [input.monthlyPowerSpend] - default from catalogue.DEFAULT_MONTHLY_POWER_SPEND
 *
 * @param {Array<object>} eligibleProducts   - products where calculatorEligible === true,
 *                                            already filtered to tier === "portable"
 *
 * @returns {RecommendResult}
 *
 * @typedef {object} RecommendResult
 * @property {'empty'|'fit'|'tight'|'near-miss'|'none'} state
 * @property {object|null} bestFit            - the recommended product
 * @property {object|null} roomToGrow         - next-larger product (tight state only)
 * @property {number}      usagePercent       - energyNeedWh / bestFit.usableWh * 100
 * @property {{ months:number|null, label:string }|null} payback
 * @property {{ applianceLabel:string, reduceByHours:number }|null} nearMissTrim
 * @property {{ energyNeedWh:number, runningW:number, peakW:number, needsAC:boolean }} load
 * @property {string|null} noReason           - plain English reason when state === 'none'
 * @property {object|null} closestUnit        - closest unit in the none state
 * @property {number|null} closestUnitHours   - hours of the load the closest unit covers
 */
export function recommend(input = {}, eligibleProducts = portableProducts) {
  // Budget is for the unit only. Unknown prices are never treated as free.
  const budget = input.budget === '' || input.budget == null ? null : Number(input.budget);
  if (budget !== null && Number.isFinite(budget) && budget >= 0) {
    const withoutBudget = { ...input, budget: undefined };
    const standard = recommend(withoutBudget, eligibleProducts);
    const suitable = eligibleProducts.filter(p => p.available !== false && p.calculatorEligible && p.tier === 'portable' && checkProduct(p, standard.load).passes);
    const unknownPriceFits = suitable.some(p => p.price === null);
    const affordable = suitable.filter(p => p.available !== false && Number.isFinite(p.price) && p.price >= 0 && p.price <= budget);
    if (!standard.bestFit) return { ...standard, budget: { amount: budget, status: standard.state, unknownPriceFits } };
    if (affordable.length) {
      return { ...recommend(withoutBudget, affordable), budget: { amount: budget, status: 'within', unknownPriceFits, shortfall: 0 } };
    }
    return { ...standard, budget: { amount: budget, status: standard.bestFit.price === null ? 'unconfirmed' : 'over', unknownPriceFits,
      shortfall: standard.bestFit.price === null ? null : Math.max(0, standard.bestFit.price - budget) } };
  }
  const {
    selections = [],
    outageHours = DEFAULT_DAILY_OUTAGE_HOURS,
    monthlyPowerSpend = DEFAULT_MONTHLY_POWER_SPEND,
  } = input;

  // ── Empty state ────────────────────────────────────────────────────────────

  const hasLoad = selections.some(s => s.qty > 0 && s.hours > 0);
  if (!hasLoad) {
    return {
      state: 'empty',
      bestFit: null,
      roomToGrow: null,
      usagePercent: 0,
      payback: null,
      nearMissTrim: null,
      load: { energyNeedWh: 0, runningW: 0, peakW: 0, needsAC: false },
      noReason: null,
      closestUnit: null,
      closestUnitHours: null,
    };
  }

  // ── Derive load ────────────────────────────────────────────────────────────

  const load = deriveLoad(selections, outageHours);

  // ── Check every eligible product ───────────────────────────────────────────

  // Sort candidates: smallest usableWh first, then smallest maxOutputW
  const candidates = eligibleProducts.filter(p => p.available !== false && p.calculatorEligible && p.tier === "portable").sort((a, b) => {
    if (a.usableWh !== b.usableWh) return a.usableWh - b.usableWh;
    return a.maxOutputW - b.maxOutputW;
  });

  const passing = candidates.filter(p => checkProduct(p, load).passes);

  // ── None state: nothing passes ────────────────────────────────────────────

  if (passing.length === 0) {
    const unavailableFit = eligibleProducts.find(p => p.available === false && p.calculatorEligible && p.tier === 'portable' && checkProduct(p, load).passes);
    if (!candidates.length || unavailableFit) {
      return { state: 'none', availabilityLimited: true, bestFit: null, roomToGrow: null,
        usagePercent: 0, payback: null, nearMissTrim: null, load,
        noReason: 'Suitable units are unavailable to order. Ask us about availability.',
        closestUnit: unavailableFit ?? null, closestUnitHours: null };
    }
    // Find the closest unit for the "how many hours it covers" message
    // "Closest" = passes checks 1 to 3 (AC, runningW, peakW) but not energy,
    //             with the largest usableWh
    const powerOk = candidates.filter(p => {
      const { failReasons } = checkProduct(p, load);
      // Passes AC, output, and peak - fails only on energy (or nothing)
      return !failReasons.includes('no-ac') &&
             !failReasons.includes('output-too-low') &&
             !failReasons.includes('peak-too-low');
    });

    const closestUnit = powerOk.length > 0
      ? powerOk[powerOk.length - 1]  // largest usable
      : candidates[candidates.length - 1]; // last resort

    // How many hours of the load the closest unit covers
    const closestUnitHours = closestUnit && load.runningW > 0
      ? Math.round((closestUnit.usableWh / LOSS_FACTOR) / load.runningW * 10) / 10
      : null;

    // Explain the primary failure reason
    let noReason;
    const { failReasons } = candidates.length ? checkProduct(candidates[candidates.length - 1], load) : { failReasons: [] };
    if (failReasons.includes('no-ac')) {
      noReason = 'Your appliances need an AC socket (mains plug), and no portable unit in our range can provide one with enough output for your selection.';
    } else if (failReasons.includes('output-too-low') || failReasons.includes('peak-too-low')) {
      noReason = `Your combined load (${Math.round(load.runningW)} W running, ${Math.round(load.peakW)} W peak) exceeds what our largest portable unit can deliver.`;
    } else {
      noReason = `Your energy need (${Math.round(load.energyNeedWh)} Wh) is larger than the battery in our biggest portable unit.`;
    }

    return {
      state: 'none',
      bestFit: null,
      roomToGrow: null,
      usagePercent: 0,
      payback: null,
      nearMissTrim: null,
      load,
      noReason,
      closestUnit,
      closestUnitHours,
    };
  }

  // ── Best fit ───────────────────────────────────────────────────────────────

  const bestFit = passing[0];
  const usagePercent = (load.energyNeedWh / bestFit.usableWh) * 100;
  const payback = computePayback(bestFit.price, monthlyPowerSpend);

  // ── Tight state ────────────────────────────────────────────────────────────

  if (usagePercent >= TIGHT_FIT_THRESHOLD * 100) {
    const roomToGrow = passing.length > 1 ? passing[1] : null;

    return {
      state: 'tight',
      bestFit,
      roomToGrow,
      usagePercent,
      payback,
      nearMissTrim: null,
      load,
      noReason: null,
      closestUnit: null,
      closestUnitHours: null,
    };
  }

  // ── Near-miss check: is there a smaller unit that nearly passes? ───────────

  // A near-miss unit: smaller than bestFit, passes checks 1 to 3 but fails energy
  // by no more than NEAR_MISS_THRESHOLD (15 %)
  const nearMissCandidate = candidates
    .filter(p => p.usableWh < bestFit.usableWh)
    .find(p => {
      const { failReasons } = checkProduct(p, load);
      if (failReasons.length !== 1 || !failReasons.includes('battery-too-small')) return false;
      const overshoot = (load.energyNeedWh - p.usableWh) / p.usableWh;
      return overshoot <= NEAR_MISS_THRESHOLD;
    });

  if (nearMissCandidate) {
    const trim = findNearMissTrim(nearMissCandidate, selections, outageHours);

    if (trim) {
      return {
        state: 'near-miss',
        bestFit,
        roomToGrow: null,
        usagePercent,
        payback,
        nearMissTrim: trim,
        load,
        noReason: null,
        closestUnit: nearMissCandidate,
        closestUnitHours: null,
      };
    }
  }

  // ── Normal fit ─────────────────────────────────────────────────────────────

  return {
    state: 'fit',
    bestFit,
    roomToGrow: null,
    usagePercent,
    payback,
    nearMissTrim: null,
    load,
    noReason: null,
    closestUnit: null,
    closestUnitHours: null,
  };
}
