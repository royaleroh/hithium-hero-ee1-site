// data/product.js
// ─────────────────────────────────────────────────────────────────────────────
// All product data lives here. Do not hardcode any of these values in the HTML.
// Values marked  // TODO: confirm  are placeholders and must be verified.
// ─────────────────────────────────────────────────────────────────────────────

export const product = {
  name: 'Hithium Power Station',          // TODO: confirm full product name
  slug: 'hithium-power-station',
  price: 285_000,                         // TODO: confirm — naira
  usableWh: 1_000,                        // TODO: confirm — usable Wh (typically 80–85 % of rated capacity)
  maxOutputW: 1_000,                      // TODO: confirm — max continuous AC output in watts
  peakOutputW: 2_000,                     // TODO: confirm — surge / peak output
  warranty: '12 months',                  // TODO: confirm
  plainEnglishCapacity:
    'Runs four lights, a fan and your Wi-Fi all night — about 8 hours — on a single charge.', // TODO: confirm based on real usableWh

  deliveryFeeByState: [
    // TODO: confirm all fees and state list
    { state: 'Lagos',        fee: 3_000 },
    { state: 'Abuja (FCT)', fee: 5_000 },
    { state: 'Rivers',       fee: 6_000 },
    { state: 'Kano',         fee: 7_000 },
    { state: 'Oyo',          fee: 5_500 },
    { state: 'Delta',        fee: 6_500 },
    { state: 'Anambra',      fee: 6_000 },
    { state: 'Enugu',        fee: 6_500 },
    { state: 'Kaduna',       fee: 7_000 },
    { state: 'Ondo',         fee: 6_000 },
    { state: 'Other states', fee: 8_000 },
  ],

  photos: [
    'assets/images/hithium-front.webp', // TODO: replace with real product photo
  ],

  inTheBox: [
    // TODO: confirm complete box contents
    'Hithium Power Station unit',
    'AC charging cable (mains adapter)',
    'DC car charging cable (12 V)',
    'User manual',
    'Warranty card',
  ],

  specs: [
    // TODO: confirm all values
    { label: 'Capacity',          value: '1 000 Wh (1 kWh)' },
    { label: 'AC output',         value: '1 000 W continuous / 2 000 W peak' },
    { label: 'DC output',         value: '12 V / 10 A' },
    { label: 'USB-A output',      value: '5 V / 2.4 A (x2)' },
    { label: 'USB-C output',      value: '20 W PD (x1)' },
    { label: 'Recharge (mains)',  value: 'About 2 hours (0 to 100 %)' },
    { label: 'Recharge (solar)',  value: 'Up to 200 W solar input' },
    { label: 'Recharge (car)',    value: '12 V DC, about 8 hours' },
    { label: 'Battery type',      value: 'LiFePO4 (lithium iron phosphate)' },
    { label: 'Cycle life',        value: '2 000+ cycles to 80 % capacity' },
    { label: 'Weight',            value: 'Approx. 10 kg' },           // TODO: confirm
    { label: 'Dimensions',        value: 'Approx. 330 x 190 x 220 mm' }, // TODO: confirm
  ],

  rechargeOptions: [
    // TODO: confirm all options
    { method: 'Mains socket',  detail: 'Plug into any standard wall socket',              time: 'About 2 hours' },
    { method: 'Solar panel',   detail: 'Up to 200 W solar input (panel sold separately)', time: 'Typically 4 to 6 hours in good sunlight' },
    { method: 'Car socket',    detail: '12 V DC from your car or a generator output',     time: 'About 8 hours' },
  ],
};

// Power spectrum comparison — used in the Gap section.
// TODO: confirm all price ranges.
export const powerSpectrum = [
  {
    id: 'power-bank',
    label: 'Power bank',
    priceRange: '₦5 000 – ₦30 000',
    canRun: 'Phone charging, maybe a small light',
    duration: '6 to 12 hours of phone use',
    limitation: 'Cannot run a fan, TV or laptop for long',
    highlight: false,
  },
  {
    id: 'power-station',
    label: 'Power station',
    priceRange: '₦150 000 – ₦350 000', // TODO: confirm
    canRun: 'Lights, fan, TV, Wi-Fi, laptop — everything typical for a home or office',
    duration: '1 to 2 nights on a single charge',
    highlight: true,
    callout: 'This is the one most people miss',
  },
  {
    id: 'inverter-system',
    label: 'Inverter + batteries',
    priceRange: '₦600 000 – ₦2 000 000+', // TODO: confirm
    canRun: 'Whole home, including fridge and air conditioner',
    duration: 'Depends on battery bank size',
    limitation: 'High upfront cost, fixed installation, requires maintenance',
    highlight: false,
  },
];

// Default used in the comparison section when the user has not entered a figure.
// TODO: confirm a reasonable average for your target audience.
export const DEFAULT_MONTHLY_POWER_SPEND = 30_000; // naira

// Default daily outage hours when the user leaves the field blank.
// TODO: confirm typical figure for target audience.
export const DEFAULT_DAILY_OUTAGE_HOURS = 8;
