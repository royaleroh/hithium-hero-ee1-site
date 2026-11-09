const roles = { inverter: 'inverter', 'home-battery': 'battery', 'solar-panel': 'solar' };
const positive = value => Number.isFinite(value) && value > 0;
const text = value => typeof value === 'string' && Boolean(value.trim());
const https = value => typeof value === 'string' && /^https:\/\/[^\s]+$/i.test(value);

function resolveBundle(bundle, products, sizing, kind) {
  if (bundle.kind !== kind || !text(bundle.id) || !text(bundle.name)) return null;
  const approved = bundle.status === 'approved';
  if (approved) {
    if (!text(bundle.approval?.reference) || !/^\d{4}-\d{2}-\d{2}$/.test(bundle.approval?.date ?? '')) return null;
  } else if (bundle.status !== 'published' || !https(bundle.source)) return null;

  const parts = new Map();
  if (!Array.isArray(bundle.items)) return null;
  for (const { slug, quantity } of bundle.items) {
    const product = products.get(slug);
    const id = roles[product?.tier];
    if (!id || parts.has(id) || !Number.isSafeInteger(quantity) || quantity < 1) return null;
    parts.set(id, { id, quantity, product });
  }
  const inverter = parts.get('inverter');
  const battery = parts.get('battery');
  const solar = parts.get('solar');
  if (!inverter || !battery || Boolean(solar) !== (kind === 'solar')) return null;
  const { continuousW, startingW, nominalWh, solarW = 0 } = bundle.limits ?? {};
  if (![continuousW, startingW, nominalWh].every(positive) ||
      continuousW < sizing.inverterW || startingW < sizing.peakW || nominalWh < sizing.batteryWh ||
      !(continuousW <= inverter.product.maxOutputW * inverter.quantity) ||
      !(startingW <= (inverter.product.peakOutputW ?? inverter.product.maxOutputW) * inverter.quantity) ||
      !(nominalWh <= battery.product.nominalBatteryWh * battery.quantity)) return null;
  if (solar && (!positive(solarW) || solarW < sizing.panelW ||
      !(solarW <= solar.product.ratedPanelW * solar.quantity) ||
      !(solar.product.ratedPanelW * solar.quantity <= inverter.product.maxPvInputW * inverter.quantity))) return null;

  const components = [inverter, battery, ...(solar ? [solar] : [])];
  const stocked = components.every(({ product }) => product.available === true);
  const subtotal = stocked && components.every(({ product }) => positive(product.price))
    ? components.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0) : null;
  return {
    id: bundle.id, name: bundle.name, status: bundle.status, source: https(bundle.source) ? bundle.source : null,
    components, stocked, subtotal, limits: { continuousW, startingW, nominalWh, solarW },
  };
}

export function matchSystemBundle(bundles, products, sizing, kind, existing, budget) {
  if (existing !== 'none') return null;
  const catalogue = new Map(products.map(product => [product.slug, product]));
  const fits = bundles.map(bundle => resolveBundle(bundle, catalogue, sizing, kind)).filter(Boolean);
  const withinBudget = bundle => Number.isFinite(budget) && bundle.subtotal !== null && bundle.subtotal <= budget;
  fits.sort((a, b) => Number(b.status === 'approved') - Number(a.status === 'approved') ||
    Number(b.stocked) - Number(a.stocked) || Number(withinBudget(b)) - Number(withinBudget(a)) ||
    a.limits.nominalWh - b.limits.nominalWh || a.limits.continuousW - b.limits.continuousW);
  return fits[0] ?? null;
}
