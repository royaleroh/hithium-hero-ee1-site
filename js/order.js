import { deliveryFeeByState } from '../data/catalogue.js';

export function canCheckout(product) {
  return Boolean(product?.calculatorEligible && product.tier === 'portable' &&
    product.available && Number.isFinite(product.price) && product.price > 0);
}
export function computeOrderTotal(product, stateName) {
  if (!canCheckout(product)) return null;
  const delivery = deliveryFeeByState.find(d => d.state === stateName) ??
    deliveryFeeByState.find(d => d.state === 'Other states');
  return { subtotal: product.price, deliveryFee: delivery.fee, total: product.price + delivery.fee };
}
