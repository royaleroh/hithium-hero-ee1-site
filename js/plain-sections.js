export function faqAnswers() {
 return [
  'Choose your devices and their hours in the calculator. We include an allowance for energy losses. Actual runtime depends on your equipment.',
  'Fridges need extra power when they start. Add yours in the calculator, then ask us to check its label before ordering.',
  'Power banks charge from USB. Portable stations may accept wall or solar charging. Installed setups need equipment matched by an installer.',
  'Battery life varies by model and use. Your quotation or order review shows the actual model and its warranty.',
  'Use each product as its maker instructs. An installed system needs suitable wiring, protection and an installer.',
  'Warranty terms depend on the model and supplier. We confirm the applicable warranty before you pay.',
  'Check the delivery table above for your state. Fitting, site visits and delivery times are confirmed in your quotation.',
  'A portable station is a single rechargeable box. An installed system uses separate equipment chosen around your home or shop.',
  'The calculator can outline an inverter, battery and solar setup. An installer checks the final design, compatibility and full price.',
 ];
}
export function gapDescription(step) {
 return step.id==='power-bank'?'USB charging for phones and compatible laptops.':step.id==='power-station'?'Portable backup for everyday essentials.':'A fitted setup planned around your home or shop.';
}
