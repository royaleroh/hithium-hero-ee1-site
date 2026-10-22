import { appliances } from '../data/appliances.js';
import { recommend } from './recommend.js';

// Both audience presets and the live calculator enter through this function.
export function selectionsFromItems(items) {
  return items.map(item => {
    const appliance = appliances.find(a => a.id === (item.applianceId ?? item.id));
    if (!appliance) throw new Error('Unknown appliance');
    return { ...appliance, qty: item.qty, hours: item.hours };
  });
}
export function estimateSetup(items, options = {}) {
  return recommend({ selections: selectionsFromItems(items), ...options });
}
