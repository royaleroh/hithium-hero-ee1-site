// data/appliances.js
// ─────────────────────────────────────────────────────────────────────────────
// Appliance list for the calculator.
//
// Fields:
//   id              - unique string, used as key in presets and test fixtures
//   label           - plain English name shown in the UI
//   watts           - typical running wattage  // TODO: confirm all values
//   surgeMultiplier - peak draw = watts * surgeMultiplier  // TODO: confirm
//   acRequired      - true if the appliance needs an AC mains socket.
//                     The Power Go has no AC output, so acRequired:true appliances
//                     rule it out.
//   note            - optional guidance shown below the appliance label in the UI
//
// All wattage figures are estimates. Flag them with // TODO: confirm before publishing.
// ─────────────────────────────────────────────────────────────────────────────

export const appliances = [

  {
    id: 'led-bulb',
    label: 'LED bulb',
    watts: 10,          // TODO: confirm
    surgeMultiplier: 1, // TODO: confirm
    acRequired: true,   // DC bulbs exist but assume AC - TODO: confirm
    note: null,
  },

  {
    id: 'fan',
    label: 'Standing or ceiling fan',
    watts: 50,          // TODO: confirm
    surgeMultiplier: 2, // TODO: confirm
    acRequired: true,
    note: null,
  },

  {
    id: 'tv',
    label: 'TV (32 to 43 inch)',
    watts: 80,          // TODO: confirm
    surgeMultiplier: 1, // TODO: confirm
    acRequired: true,
    note: null,
  },

  {
    id: 'router',
    label: 'Wi-Fi router',
    watts: 12,          // TODO: confirm
    surgeMultiplier: 1, // TODO: confirm
    acRequired: false,  // Most routers take 12 V DC
    note: 'Check your router\'s adapter label says 12 V.',
  },

  {
    id: 'phone-charger',
    label: 'Phone charger',
    watts: 10,          // TODO: confirm
    surgeMultiplier: 1, // TODO: confirm
    acRequired: false,  // USB
    note: null,
  },

  {
    id: 'laptop',
    label: 'Laptop',
    watts: 65,          // TODO: confirm - charges over USB-C up to 65 W
    surgeMultiplier: 1, // TODO: confirm
    acRequired: false,  // Charges over USB-C up to 65 W
    note: null,
  },

  {
    id: 'monitor',
    label: 'Desktop monitor',
    watts: 30,          // TODO: confirm
    surgeMultiplier: 1, // TODO: confirm
    acRequired: true,
    note: null,
  },

  {
    id: 'decoder',
    label: 'Decoder or satellite box',
    watts: 25,          // TODO: confirm
    surgeMultiplier: 1, // TODO: confirm
    acRequired: true,
    note: null,
  },

  {
    id: 'speaker',
    label: 'Small speaker or sound bar',
    watts: 40,          // TODO: confirm
    surgeMultiplier: 1, // TODO: confirm
    acRequired: true,
    note: null,
  },

  {
    id: 'mini-fridge',
    label: 'Mini fridge',
    watts: 90,          // TODO: confirm
    surgeMultiplier: 3, // TODO: confirm - compressor start surge
    acRequired: true,
    note: null,
  },

  // Editable examples only. Use the appliance rating or manual for an actual quote.
  { id: 'water-heater', label: 'Water heater', watts: 2000, surgeMultiplier: 1, acRequired: true },
  { id: 'refrigerator', label: 'Refrigerator', watts: 150, surgeMultiplier: 3, acRequired: true },
  { id: 'washer', label: 'Washing machine', watts: 500, surgeMultiplier: 2, acRequired: true },
  { id: 'air-conditioner', label: 'Air conditioner', watts: 1200, surgeMultiplier: 3, acRequired: true },
  { id: 'iron', label: 'Pressing iron', watts: 1200, surgeMultiplier: 1, acRequired: true },
  { id: 'pressure-pump', label: 'Pressure pump', watts: 750, surgeMultiplier: 3, acRequired: true },
  { id: 'microwave', label: 'Microwave', watts: 1200, surgeMultiplier: 1, acRequired: true },
  { id: 'water-pump', label: 'Water pump', watts: 750, surgeMultiplier: 3, acRequired: true },
  { id: 'freezer', label: 'Freezer', watts: 150, surgeMultiplier: 3, acRequired: true },

];
