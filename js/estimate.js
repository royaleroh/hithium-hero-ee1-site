import { appliances } from '../data/appliances.js';
import { recommend } from './recommend.js';

// Both audience presets and the live calculator enter through this function.
export function selectionsFromItems(items) {
  return items.map(item => {
    const id = item.applianceId ?? item.id;
    const appliance = id?.startsWith('custom-') ? {
      id, label: item.label || 'Other appliance', watts: item.watts,
      surgeMultiplier: item.surgeMultiplier, acRequired: true,
    } : appliances.find(a => a.id === id);
    if (!appliance) throw new Error('Unknown appliance');
    return { ...appliance, watts: item.watts ?? appliance.watts, qty: item.qty, hours: item.hours };
  });
}
export function estimateSetup(items, options = {}) {
  return recommend({ selections: selectionsFromItems(items), ...options });
}
