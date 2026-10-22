// data/presets.js
// Situation presets for the calculator.
// Each preset maps to an appliance selection that preloads the calculator.
// applianceId must match an id in data/appliances.js.

export const presets = [
  {
    id: 'students',
    title: 'Students',
    tagline: 'Study through the night without touching your neighbours\' generator.',
    detail: 'Lights, your phone and a laptop - quiet, steady power while you work.',
    items: [
      { applianceId: 'led-bulb',      qty: 2, hours: 5 },
      { applianceId: 'phone-charger', qty: 1, hours: 2 },
      { applianceId: 'laptop',        qty: 1, hours: 4 },
      { applianceId: 'router',        qty: 1, hours: 5 },
    ],
  },
  {
    id: 'remote-workers',
    title: 'Remote workers',
    tagline: 'Keep your laptop, router and monitor on during a full working day.',
    detail: 'No generator noise. No fuel runs. Just a full workday at your desk.',
    items: [
      { applianceId: 'laptop',        qty: 1, hours: 8 },
      { applianceId: 'router',        qty: 1, hours: 10 },
      { applianceId: 'monitor',       qty: 1, hours: 8 },
      { applianceId: 'phone-charger', qty: 2, hours: 3 },
      { applianceId: 'led-bulb',      qty: 2, hours: 6 },
    ],
  },
  {
    id: 'shops',
    title: 'Shops and market stalls',
    tagline: 'Keep your lights on, POS machine running and phones charged all day.',
    detail: 'No sale lost to a dead screen. No customer turned away in the dark.',
    items: [
      { applianceId: 'led-bulb',      qty: 4, hours: 8 },
      { applianceId: 'phone-charger', qty: 2, hours: 4 },
      { applianceId: 'fan',           qty: 1, hours: 6 },
      { applianceId: 'router',        qty: 1, hours: 8 },
    ],
  },
  {
    id: 'families',
    title: 'Families during outages',
    tagline: 'Lights, a fan, the TV and your router - a normal evening at home.',
    detail: 'Everyone stays cool and connected while the neighbourhood goes dark.',
    items: [
      { applianceId: 'led-bulb',      qty: 4, hours: 5 },
      { applianceId: 'fan',           qty: 1, hours: 6 },
      { applianceId: 'tv',            qty: 1, hours: 4 },
      { applianceId: 'router',        qty: 1, hours: 8 },
      { applianceId: 'phone-charger', qty: 3, hours: 2 },
    ],
  },
  {
    id: 'events',
    title: 'Events and outdoor use',
    tagline: 'Run your speaker and lights without hunting for a power source.',
    detail: 'A garden party, a pop-up stall, an outdoor shoot - handled.',
    items: [
      { applianceId: 'speaker',       qty: 1, hours: 4 },
      { applianceId: 'led-bulb',      qty: 6, hours: 5 },
      { applianceId: 'phone-charger', qty: 4, hours: 2 },
      { applianceId: 'fan',           qty: 1, hours: 4 },
    ],
  },
  { id: 'custom', title: 'Custom', tagline: 'Build your own setup.', detail: 'Choose the appliances you want to run.', items: [] },
];
