// Compare individual component ratings. These candidates are for an installer
// quote: overlapping ratings do not verify BMS support, wiring or PV strings.
const positive = value => Number.isFinite(value) && value > 0;
const coversRange = (outer, inner) => Array.isArray(outer) && Array.isArray(inner) &&
  inner.length === 2 && inner.every(positive) && inner[0] <= inner[1] &&
  outer[0] <= inner[0] && outer[1] >= inner[1];
const choose = (items, size) => items.sort((a, b) =>
  Number(b.available) - Number(a.available) || size(a) - size(b))[0] ?? null;

export function systemProducts(products, sizing, kind, existing) {
  const keepInverter = ['inverter', 'both'].includes(existing);
  const keepPanels = ['panels', 'both'].includes(existing);
  const newSolar = kind === 'solar' && !keepPanels;
  const inverter = keepInverter ? null : choose(products.filter(product =>
    product.tier === 'inverter' && product.specStatus === 'verified' &&
    product.maxOutputW >= sizing.inverterW && product.peakOutputW >= sizing.peakW &&
    (!newSolar || product.maxPvInputW >= sizing.panelW)), p => p.maxOutputW);

  const battery = inverter ? choose(products.filter(product => {
    if (product.tier !== 'home-battery' || !product.available ||
        !(product.nominalBatteryWh >= sizing.batteryWh) ||
        !coversRange(inverter.batteryVoltageRange, product.batteryOperatingV)) return false;
    const dcW = product.batteryOperatingV[0] * product.maxBatteryDischargeA;
    return dcW * 0.9 >= Math.max(sizing.inverterW, sizing.peakW);
  }), p => p.nominalBatteryWh) : null;

  const panel = newSolar && inverter ? choose(products.filter(product =>
    product.tier === 'solar-panel' && product.specStatus === 'verified' &&
    [product.ratedPanelW, product.vmp, product.voc, product.imp, product.isc].every(positive) &&
    product.imp <= inverter.maxPvStringA && product.isc <= inverter.maxPvStringShortCircuitA), p => p.ratedPanelW) : null;

  return [
    { id: 'inverter', product: inverter, existing: keepInverter },
    { id: 'battery', product: battery, needsExistingInverterCheck: keepInverter },
    ...(kind === 'solar' ? [{ id: 'solar', product: panel, existing: keepPanels, needsExistingInverterCheck: keepInverter }] : []),
  ];
}
