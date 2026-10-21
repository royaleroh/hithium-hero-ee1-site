// js/calculate.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure maths only. No DOM access, no imports from other site modules.
// Safe to import in Node tests and in browser modules.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a runtime expressed as decimal hours into a friendly English label.
 *
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

/**
 * calculateEstimate
 *
 * @param {object} input
 * @param {Array<{applianceId:string, watts:number, surgeMultiplier:number, qty:number, hours:number}>} input.selections
 * @param {number|undefined} input.monthlyPowerSpend   - naira; optional
 * @param {number|undefined} input.dailyOutageHours    - hours; optional
 *
 * @param {object} product
 * @param {number} product.usableWh     - usable battery capacity in Wh
 * @param {number} product.maxOutputW   - max continuous AC output in watts
 * @param {number} product.price        - unit price in naira
 *
 * @returns {object} result
 */
export function calculateEstimate(input, product) {
  const { selections = [], monthlyPowerSpend } = input;
  const { usableWh, maxOutputW, price } = product;

  // ── Zero-appliance guard ──────────────────────────────────────────────────
  const hasLoad = selections.some(s => s.qty > 0 && s.hours > 0);
  if (!hasLoad) {
    return {
      dailyWh: 0,
      adjustedWh: 0,
      runningW: 0,
      peakW: 0,
      fitsInOneCharge: true,
      fitsOutput: true,
      daysPerCharge: Infinity,
      runtimeHours: Infinity,
      runtimeLabel: 'no appliances selected',
      paybackMonths: null,
      paybackLabel: 'Add some appliances above to see a cost comparison.',
      fitMessage: 'Tick at least one appliance to get your estimate.',
      overloadedAppliances: [],
    };
  }

  // ── Core maths ────────────────────────────────────────────────────────────

  // dailyWh = sum(watts * qty * hours)
  const dailyWh = selections.reduce(
    (sum, s) => sum + s.watts * s.qty * s.hours,
    0,
  );

  // adjustedWh = dailyWh * 1.2  (20% allowance for losses)
  const adjustedWh = dailyWh * 1.2;

  // runningW = sum(watts * qty) — everything running at the same time, no surge
  const runningW = selections.reduce(
    (sum, s) => sum + s.watts * s.qty,
    0,
  );

  // peakW = sum(watts * qty * surgeMultiplier) — worst-case simultaneous peak
  const peakW = selections.reduce(
    (sum, s) => sum + s.watts * s.qty * (s.surgeMultiplier || 1),
    0,
  );

  const fitsInOneCharge = adjustedWh <= usableWh;
  const fitsOutput      = peakW <= maxOutputW;

  const daysPerCharge = adjustedWh > 0 ? usableWh / adjustedWh : Infinity;
  const runtimeHours  = runningW  > 0 ? usableWh / runningW   : Infinity;

  // ── Fit message ───────────────────────────────────────────────────────────

  const overloadedAppliances = [];
  if (!fitsOutput) {
    selections.forEach(s => {
      if (s.watts * s.qty * (s.surgeMultiplier || 1) > maxOutputW) {
        overloadedAppliances.push(s.label || s.applianceId);
      }
    });
  }

  let fitMessage;
  if (!fitsOutput) {
    fitMessage =
      `The peak draw from your selection (${Math.round(peakW)} W) is more than ` +
      `this unit can handle (${maxOutputW} W continuous). ` +
      (overloadedAppliances.length > 0
        ? `Try removing: ${overloadedAppliances.join(', ')}.`
        : 'Try reducing quantities or removing high-draw appliances.');
  } else if (fitsInOneCharge) {
    if (daysPerCharge >= 2) {
      fitMessage = `Your setup fits in one charge — covers about ${runtimeLabel(daysPerCharge * 24)} of typical use.`;
    } else {
      fitMessage = `Your setup fits in one charge. At full load it runs for ${runtimeLabel(runtimeHours)}.`;
    }
  } else {
    const chargesNeeded = Math.ceil(adjustedWh / usableWh);
    fitMessage =
      `Your daily total (${Math.round(adjustedWh)} Wh with losses) is more than ` +
      `one charge. You would need about ${chargesNeeded} charges per day, ` +
      `or you could split usage and recharge in between.`;
  }

  // ── Payback ───────────────────────────────────────────────────────────────

  const spend = monthlyPowerSpend && monthlyPowerSpend > 0 ? monthlyPowerSpend : 0;
  let paybackMonths = null;
  let paybackLabel;

  if (spend > 0 && price > 0) {
    const raw = price / spend;
    if (raw > 0 && raw < 120) {
      paybackMonths = Math.round(raw);
      paybackLabel =
        paybackMonths <= 3
          ? `You could recover the cost in as little as ${paybackMonths} month${paybackMonths === 1 ? '' : 's'} compared to your current spend.`
          : `At your current spend, you recover the cost in about ${paybackMonths} month${paybackMonths === 1 ? '' : 's'}.`;
    } else {
      paybackLabel =
        'A direct payback figure is not straightforward here. ' +
        'The unit is still a one-time cost against ongoing fuel bills.';
    }
  } else {
    paybackLabel = 'Enter your monthly petrol or generator spend above to see a payback estimate.';
  }

  return {
    dailyWh,
    adjustedWh,
    runningW,
    peakW,
    fitsInOneCharge,
    fitsOutput,
    daysPerCharge,
    runtimeHours,
    runtimeLabel: runtimeLabel(runtimeHours),
    paybackMonths,
    paybackLabel,
    fitMessage,
    overloadedAppliances,
  };
}
