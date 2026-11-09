import { appliances } from '../data/appliances.js';
import { presets } from '../data/presets.js';
import { DEFAULT_DAILY_OUTAGE_HOURS } from '../data/catalogue.js';
import { estimateSetup } from './estimate.js';

export const clampHours = value => Math.min(24, Math.max(1, Number(value) || 1));
const defaultHours = { 'water-heater': 0.5, microwave: 0.5, iron: 0.5, 'water-pump': 1, 'pressure-pump': 1, washer: 1 };
const blankItems = () => appliances.map(a => ({ applianceId: a.id, qty: 1, hours: defaultHours[a.id] ?? 4, enabled: false }));
const limits = { qty: [1, 20], hours: [0.1, 24], watts: [1, 50000], surgeMultiplier: [1, 10] };

export function loadPreset(state, id) {
  const preset = presets.find(p => p.id === id);
  if (!preset) return state;
  const items = blankItems().map(item => {
    const selected = preset.items.find(s => s.applianceId === item.applianceId);
    return selected ? { ...item, ...selected, hours: clampHours(selected.hours), enabled: true } : item;
  });
  return { ...state, items, preset: id, editingId: null, outageHours: DEFAULT_DAILY_OUTAGE_HOURS, spend: '', budget: state.budget ?? '' };
}

export function createCalculatorState() {
  return loadPreset({ items: [], step: 1, spend: '', outageHours: DEFAULT_DAILY_OUTAGE_HOURS }, 'families');
}

export function reduceCalculator(state, action) {
  if (action.type === 'add-custom') {
    const nextCustom = (state.nextCustom ?? 0) + 1;
    return { ...state, nextCustom, preset: 'custom', items: [...state.items, {
      applianceId: `custom-${nextCustom}`, label: '', qty: 1, hours: 1, watts: null,
      surgeMultiplier: 1, enabled: true,
    }] };
  }
  if (action.type === 'remove') return { ...state, preset: 'custom', items: state.items
    .filter(item => item.applianceId !== action.id || !action.id.startsWith('custom-'))
    .map(item => item.applianceId === action.id ? { ...item, enabled: false, qty: 1 } : item) };
  if (action.type === 'field') {
    const range = limits[action.field];
    if (!range && action.field !== 'label') return state;
    const value = range
      ? (action.value === '' || !Number.isFinite(Number(action.value)) ? null : Math.min(range[1], Math.max(range[0], Number(action.value))))
      : action.value.trim().slice(0, 80);
    return { ...state, preset: 'custom', items: state.items.map(item =>
      item.applianceId === action.id ? { ...item, [action.field]: value } : item) };
  }
  if (action.type === 'add' || action.type === 'subtract') return { ...state, preset: 'custom', items: state.items.map(item => {
    if (item.applianceId !== action.id) return item;
    if (action.type === 'add') return { ...item, enabled: true, qty: item.enabled ? Math.min(20, (item.qty ?? 1) + 1) : 1 };
    return item.qty > 1 ? { ...item, qty: item.qty - 1 } : { ...item, enabled: false, qty: 1 };
  }) };
  if (action.type === 'goal') return { ...state, goal: ['auto','portable','installed','solar'].includes(action.value) ? action.value : 'auto' };
  if (action.type === 'existing') return { ...state, existing: ['none','inverter','panels','both'].includes(action.value) ? action.value : 'none' };
  if (action.type === 'sun') return { ...state, sunHours: Math.min(8,Math.max(1,Number(action.value)||4)) };
  if (action.type === 'preset') return loadPreset(state, action.id);
  if (action.type === 'clear') return { ...loadPreset(state, 'custom'), budget: '', goal:'auto', existing:'none', sunHours:4 };
  if (action.type === 'step') return { ...state, step: Math.min(3, Math.max(1, Number(action.step) || 1)) };
  if (action.type === 'spend') return { ...state, spend: action.value };
  if (action.type === 'budget') return { ...state, budget: action.value === '' ? '' : String(Math.max(0, Number(action.value) || 0)) };
  if (action.type === 'outage') return { ...state, outageHours: clampHours(state.outageHours + action.delta) };
  if (action.type === 'edit') return { ...state, editingId: state.editingId === action.id ? null : action.id };
  const items = state.items.map(item => {
    if (item.applianceId !== action.id) return item;
    if (action.type === 'toggle') return { ...item, enabled: !item.enabled };
    if (action.type === 'hours') return { ...item, hours: clampHours(item.hours + action.delta) };
    if (action.type === 'qty') return { ...item, qty: Math.min(20, Math.max(1, item.qty + action.delta)) };
    return item;
  });
  const enabled = items.find(i => i.applianceId === action.id)?.enabled;
  return { ...state, items, preset: 'custom', editingId: action.type === 'toggle' ? enabled ? action.id : null : state.editingId };
}

export function calculatorView(state) {
  const selected = state.items.filter(item => item.enabled);
  const spend = state.spend.trim() === '' ? null : Math.max(0, Number(state.spend) || 0);
  const result = estimateSetup(selected, { outageHours: state.outageHours, monthlyPowerSpend: spend ?? 0, budget: state.budget });
  let paybackLine = '';
  if (result.bestFit?.price !== null && result.bestFit) {
    paybackLine = spend === null ? 'Add your monthly petrol spend to see payback.' : result.payback.label;
  }
  return { selected, result, spend, paybackLine };
}
