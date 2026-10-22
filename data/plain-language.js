// Visitor-facing language. Technical catalogue fields remain unchanged.
export const glossary = {
  'battery size': 'How much power the box stores for later.',
  'power output': 'How much the box can run at once.',
  'solar input': 'How much power it can take from a solar panel.',
};

export const everydayLoads = [
  { id: 'phone-charger', kind: 'phone', label: 'phone charges', qty: 1 },
  { id: 'router', label: 'Wi-Fi', qty: 1 },
  { id: 'led-bulb', label: 'four lights', qty: 4 },
  { id: 'fan', label: 'fan', qty: 1 },
  { id: 'tv', label: 'TV', qty: 1 },
  { id: 'laptop', label: 'laptop', qty: 1 },
];

export const applianceNames = {
  'led-bulb': 'lights', fan: 'fan', tv: 'TV', router: 'Wi-Fi router',
  'phone-charger': 'phone charger', laptop: 'laptop', monitor: 'monitor',
  decoder: 'decoder', speaker: 'speaker', 'mini-fridge': 'fridge',
};
export const presetNames = {
  students: 'Students', 'remote-workers': 'Remote workers', shops: 'Shops and stalls',
  families: 'Families', events: 'Events', custom: 'Custom',
};

export const plainCopy = {
  bestFit: 'Your best fit',
  bestFitReason: 'The smallest one that does the job, so you do not pay for more than you need.',
  covers: 'It covers your power cut with room to spare.',
  tight: 'Covers you, but only just. If you add anything, step up to the bigger one.',
  none: 'This is more than a portable unit can run. You need a whole home system. Message us and we will size one for you.',
  price: "Ask us for today's price",
  router: "Most routers can run from this unit. Check the label on your router's charger.",
  recharge: 'Charge it from the wall or a solar panel (sold separately). Use both at once for the fastest refill.',
  // TODO: confirm wall-only charging time; catalogue only times combined charging.
  rechargeTime: 'Using both takes about two hours. Ask us how long wall charging alone takes.',
  // TODO: confirm the comparison
  noise: 'Quiet, about as loud as a quiet office.',
  gap: {
    'power-bank': 'Charges your phone. Cannot run a fan or TV.',
    'power-station': 'Runs your lights, fan, TV, Wi-Fi and laptop. The Power Tank keeps four lights, a fan and Wi-Fi going for about 8 hours.',
    inverter: 'Runs the whole house, even the fridge and air conditioner. Costs much more and needs an installer.',
  },
};
