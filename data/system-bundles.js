const backupSource = 'https://itelsolar.com/product/itel-powercore-3k-unit-3kw-24v-ip54-smart-inverter-2-56kwh-lithium-battery-without-panels/';
const solarSource = 'https://itelsolar.com/product/itel-1500w-complete-off-grid-solar-system-setup-customizable-12v-starter-kit-1-5kva/';
const inverterManual = 'https://itelsolar.com/wp-content/uploads/2025/07/IP54_IPV-1K512U_IPV-3K24U_User_Manual.pdf';
const batteryManual = 'https://www.itel-life.com/fileadmin/assets/img/ESS/User_Manual/2.56kWh__ESS_LV_Battery-IPW-25100.pdf';
const starterBatterySource = 'https://itelsolar.com/product/itel-1280wh-12v-lithium-battery-lifepo%E2%82%84-smart-solar-storage-solution-ipb-12100/';
const starterPanelSource = 'https://itelsolar.com/product/itel-410w-solar-panel-20-97-module-efficiency-with-108-n-mono-cells-182-by-91mm/';

const part = (slug, name, model, tier, source, ratings) => ({
  id: slug, slug, name, model, tier, brand: 'itel Energy', source,
  calculatorEligible: false, specStatus: 'bundle-only', photos: [], ...ratings,
});

// Quote references only. Local price and availability come from products.json.
export const bundleProducts = [
  part('itel-ipv-3k24upro', 'itel 3 kW hybrid inverter', 'IPV-3K24UPRO', 'inverter', backupSource, { maxOutputW: 3000 }),
  part('itel-ipw-25100', 'itel 2.56 kWh lithium battery', 'IPW-25100', 'home-battery', batteryManual, { nominalBatteryWh: 2560 }),
  part('itel-ipv-1k512u', 'itel 1.5 kW off-grid inverter', 'IPV-1K512U', 'inverter', inverterManual, { maxOutputW: 1500, maxPvInputW: 650 }),
  part('itel-ipb-12100', 'itel 1.28 kWh lithium battery', 'IPB-12100', 'home-battery', starterBatterySource, { nominalBatteryWh: 1280 }),
  part('itel-oda410-27v-mhp', 'itel 410 W solar panel', 'ODA410-27V-MHP', 'solar-panel', starterPanelSource, { ratedPanelW: 410 }),
];

export const systemBundles = [
  {
    id: 'itel-powercore-3k-backup', name: 'itel PowerCore 3K backup kit', kind: 'installed',
    status: 'published', source: backupSource,
    items: [{ slug: 'itel-ipv-3k24upro', quantity: 1 }, { slug: 'itel-ipw-25100', quantity: 1 }],
    // Conservative AC screen: 20 V cutoff x 100 A continuous x 0.9. No surge boost assumed.
    limits: { continuousW: 1800, startingW: 1800, nominalWh: 2560 },
  },
  {
    id: 'itel-starter-solar-410', name: 'itel Starter solar kit', kind: 'solar',
    status: 'published', source: solarSource,
    // Published configurator choices. The 410 W option stays below the manual's 650 W limit.
    items: [
      { slug: 'itel-ipv-1k512u', quantity: 1 },
      { slug: 'itel-ipb-12100', quantity: 2 },
      { slug: 'itel-oda410-27v-mhp', quantity: 1 },
    ],
    // Screen using 11.2 V x 2 x 50 A recommended discharge x 0.9, rounded down.
    limits: { continuousW: 1000, startingW: 1000, nominalWh: 2560, solarW: 410 },
  },
];
