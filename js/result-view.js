import { formatNaira } from './format.js';
import { applianceNames } from '../data/plain-language.js';

export function resultPresentation(result, selections, outageHours) {
  const unit = result.bestFit;
  const tight = result.state === 'tight';
  const budget = result.budget;
  const budgetLine = !unit || !budget ? '' : budget.status === 'within'
    ? `Fits your ${formatNaira(budget.amount)} budget.`
    : budget.status === 'over' ? `${formatNaira(budget.shortfall)} above your budget.`
    : `Ask us if this fits your ${formatNaira(budget.amount)} budget.`;
  const applianceLine = selections.map(s => `${s.qty} ${applianceNames[s.id] ?? s.label}`).join(', ');
  return {
    status: result.availabilityLimited ? 'Ask about availability' : !unit ? 'A bigger system is needed' : tight ? 'Only just enough' : 'Your setup is covered',
    coverage: result.availabilityLimited ? 'Suitable units are unavailable to order.' : unit ? `Covers your ${outageHours}-hour power cut.` : 'Your setup needs a whole home system.',
    explanation: result.availabilityLimited ? 'Message us to check when you can order.' : unit ? 'Based on the hours you chose.' : 'Message us and we will help you size it.',
    chargeLeft: unit ? Math.max(0, Math.floor(100 - result.usagePercent)) : null,
    applianceLine,
    budgetLine,
    price: unit ? unit.price === null ? "Ask for today's price" : formatNaira(unit.price) : '',
    trim: result.nearMissTrim ? `Cut the ${applianceNames[selections.find(s => s.label === result.nearMissTrim.applianceLabel)?.id] ?? result.nearMissTrim.applianceLabel.toLowerCase()} by ${result.nearMissTrim.reduceByHours} hours and ${result.closestUnit.name} fits.` : '',
  };
}

export function coverageMeter(percent) {
  return `<div class="coverage-meter" aria-hidden="true"><span style="width:${Math.max(0, Math.min(100, percent))}%"></span></div>`;
}

export function trimAction(trim, selections) {
  const target = selections.find(s => s.label === trim.applianceLabel);
  if (!target) return null;
  return target.hours <= trim.reduceByHours
    ? { type: 'toggle', id: target.id }
    : { type: 'hours', id: target.id, delta: -trim.reduceByHours };
}
