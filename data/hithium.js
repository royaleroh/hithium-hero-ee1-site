// Manufacturer specifications and price sources: ../HITHIUM_RESEARCH.md.
// Prices and availability are supplied separately by ../products.json.
const models = [
  { slug: 'hithium-heroee-1', model: 'HeroEE 1', wh: 1004.8, output: 200, cycles: 6000,
    cycleNote: '6,000 cycles to 80% remaining capacity', solar: '200 W, 12 to 36 V DC',
    warranty: '2 years', width: 701, height: 900 },
  { slug: 'hithium-heroee-light-1', model: 'HeroEE LIGHT 1', wh: 1004.8, output: 500, cycles: 11000,
    cycleNote: 'Up to 11,000 cycles at 25 C, 100% depth of discharge, 0.5P, to 70% remaining capacity',
    solar: '300 W, 12 to 55 V DC', warranty: '2 years', width: 672, height: 900 },
  { slug: 'hithium-heroee-2', model: 'HeroEE 2', wh: 2009.6, output: 1000, cycles: 6000,
    cycleNote: '6,000 cycles to 80% remaining capacity', solar: '450 W, 12 to 50 V DC',
    warranty: '2 years', width: 876, height: 900 },
];

export const hithiumProducts = models.map(m => ({
  id: m.slug, slug: m.slug, brand: 'Hithium', name: `Hithium ${m.model}`, model: m.model,
  category: 'Portable Power Station', tier: 'portable', calculatorEligible: true,
  acOutput: true, available: false, price: null, usableWh: m.wh, maxOutputW: m.output,
  // TODO: confirm peak output with supplier. No separate surge rating found.
  // The recommender conservatively falls back to rated output, never an invented surge.
  peakOutputW: null, cycleLife: m.cycles, warranty: m.warranty,
  plainEnglishCapacity: 'Choose your appliances to check how long this unit covers you.',
  description: `Hithium ${m.model} portable power station with a LiFePO4 battery and AC output.`,
  images: [`assets/products/${m.slug}/product.webp`],
  photos: [`assets/products/${m.slug}/product.webp`],
  imageWidth: m.width, imageHeight: m.height,
  inTheBox: m.model === 'HeroEE LIGHT 1' ? ['Confirm supplied accessories with us'] : [m.model, 'Charging lead', 'Manual and warranty card'],
  rechargeOptions: [
    { method: 'Wall socket', detail: `AC charging up to ${m.output} W`, time: 'Confirm charge time with us' },
    { method: 'Solar', detail: m.solar, time: 'Depends on sunlight and panel size; panel sold separately' },
  ],
  key_specs: { battery: `${m.wh} Wh`, output: `${m.output} W`, cycle_life: m.cycleNote },
  specs: [
    { label: 'Battery', value: `${m.wh} Wh` },
    { label: 'Rated output', value: `${m.output} W` },
    { label: 'Peak output', value: `Not confirmed. Calculator uses ${m.output} W.` },
    { label: 'Chemistry', value: 'LiFePO4' },
    { label: 'Cycle life', value: m.cycleNote },
    { label: 'Warranty', value: m.warranty },
    { label: 'Solar input', value: m.solar },
  ],
}));
