// data/catalogue.js
// ─────────────────────────────────────────────────────────────────────────────
// Technical catalogue. Commercial controls are loaded from ../products.json.
//
// TODO: confirm we have permission to use these images (see README).
//
// tier:
//   "portable"     - portable power stations, shown in calculator and range section
//   "home-battery" - large home batteries needing installer + inverter
//   "cell"         - industrial components, never rendered to visitors
//
// calculatorEligible:
//   true  - considered by the recommender
//   false - never fed to the recommender
// ─────────────────────────────────────────────────────────────────────────────

import { hithiumProducts } from './hithium.js';
import { solutionProducts } from './solution-products.js';
import { applyProductControls, loadProductControls } from './product-controls.js';

const baseCatalogue = {

  products: [

    // ── Portable power stations (calculator-eligible) ─────────────────────────

    {
      id: 'itel-power-go-iess-320t',
      brand: 'itel Energy',
      name: 'Power Go',
      model: 'IESS-320T',
      slug: 'itel-power-go',
      category: 'Portable Power Station',
      tier: 'portable',
      calculatorEligible: true,
      acOutput: false,  // No AC socket - USB and DC only
      available: true,
      price: null,      // Show "Price on request"
      usableWh: 320,    // Treated as the usable figure; 20 % loss added in maths
      maxOutputW: 130,
      peakOutputW: 260,
      warranty: '12 months',
      // En/em dashes replaced with plain text (brief §1.3)
      plainEnglishCapacity: 'Charges a phone 15 to 20 times or keeps a Wi-Fi router running 18 to 25 hours on one charge.',
      description:
        'Compact 320 Wh LiFePO4 portable power station focused on USB and DC output. Ideal for phones, laptops, routers, DC fans and lights. No AC socket.',
      images: [
        // TODO: confirm we have permission to use these images
        'assets/products/itel-power-go/product.webp',
      ],
      photos: [
        'assets/products/itel-power-go/product.webp',
      ],
      imageWidth: 580,
      imageHeight: 580,
      inTheBox: [
        'Power Go unit (IESS-320T)',
        '65 W USB-C charger',
        'Type-C to DC5521 cable',
        'DC5521 to DC5521 cable',
        'User manual',
      ],
      rechargeOptions: [
        { method: 'USB-C',       detail: 'Up to 100 W USB-C input',                   time: 'About 3.5 to 4 hours' },
        { method: 'Solar or DC', detail: '11 to 24 V / 5 A or 100 W max solar input', time: 'About 3.5 to 4 hours' },
      ],
      specs: [
        { label: 'Capacity',      value: '320 Wh (100,000 mAh)' },
        { label: 'Battery type',  value: 'LiFePO4 (A-grade)' },
        { label: 'Cycle life',    value: '3,000+' },
        { label: 'Total output',  value: '130 W max' },
        { label: 'AC output',     value: 'None' },
        { label: 'USB-C output',  value: '65 W PD max' },
        { label: 'USB-A ports',   value: '4 x up to 20 W each' },
        { label: 'DC outputs',    value: '2 x 12 V / 2 A (DC5521)' },
        { label: 'Weight',        value: '3.2 to 3.5 kg' },
        { label: 'Dimensions',    value: '190 x 65 x 190 mm' },
      ],
      key_specs: {
        battery_capacity: '320 Wh (100,000 mAh)',
        battery_type: 'LiFePO4 (A-grade)',
        cycle_life: '3,000+',
        total_output_power: '130 W max',
        ac_output: 'None',
        usb_c_output: '65 W max (PD)',
        usb_a_ports: '4 x up to 20 W each',
        dc_outputs: '2 x 12 V/2 A (DC5521)',
        inputs: {
          usb_c: '100 W max',
          dc_solar: '11 to 24 V / 5 A or 100 W max',
        },
        recharge_time: 'About 3.5 to 4 hours (100 W)',
        weight: '3.2 to 3.5 kg',
        dimensions: '190 x 65 x 190 mm',
        features: ['Built-in 2 W LED light and SOS', 'Smart display', 'Carrying strap'],
        operating_temp: 'Charging 0 to 55 C, Discharging 0 to 55 C',
      },
    },

    {
      id: 'itel-power-go-pro-iess-320act',
      brand: 'itel Energy',
      name: 'Power Go Pro',
      model: 'IESS-320ACT',
      slug: 'itel-power-go-pro',
      category: 'Portable Power Station',
      tier: 'portable',
      calculatorEligible: true,
      acOutput: true,
      available: true,
      price: null,      // Show "Price on request"
      usableWh: 320,
      maxOutputW: 200,
      peakOutputW: 200,
      warranty: '12 months',
      plainEnglishCapacity:
        'Runs a 65 W laptop for about 5 hours, a 15 W TV for about 20 hours, or keeps lights and router going overnight.',
      description:
        '320 Wh LiFePO4 portable power station with 200 W pure sine wave AC outlet plus multi-port USB and DC. Compact and highly portable for home backup, travel and outdoor use.',
      images: [
        // TODO: confirm we have permission to use these images
        'assets/products/itel-power-go-pro/product.webp',
      ],
      photos: [
        'assets/products/itel-power-go-pro/product.webp',
      ],
      imageWidth: 482,
      imageHeight: 544,
      inTheBox: [
        'Power Go Pro unit (IESS-320ACT)',
        '100 W charger / AC adapter',
        '5521 Male to 5521 Male cable',
        '5525 Male to PV cable',
        'User manual',
      ],
      rechargeOptions: [
        { method: 'USB-C',              detail: 'Up to 100 W USB-C input',             time: 'About 4 hours' },
        { method: 'Solar or AC adapter', detail: 'DC5525 up to 100 W (solar or wall)', time: 'About 4 hours' },
      ],
      specs: [
        { label: 'Capacity',     value: '320 Wh (100,000 mAh)' },
        { label: 'Battery type', value: 'LiFePO4' },
        { label: 'Cycle life',   value: '6,000+' },
        { label: 'AC output',    value: '200 W pure sine wave (220 / 230 / 240 V 50 Hz)' },
        { label: 'USB-C output', value: '65 W PD max' },
        { label: 'USB-A ports',  value: '3 x total 20 W max' },
        { label: 'DC outputs',   value: '4 x DC5521 (12 V / 4 A total)' },
        { label: 'Weight',       value: '3.2 kg' },
        { label: 'Dimensions',   value: '190 x 65 x 225 mm' },
      ],
      key_specs: {
        battery_capacity: '320 Wh (100,000 mAh)',
        battery_type: 'LiFePO4',
        cycle_life: '6,000+',
        ac_output: '200 W pure sine wave (220 / 230 / 240 V 50 Hz)',
        usb_c_output: '65 W max (PD)',
        usb_a_ports: '3 x total 20 W max',
        dc_outputs: '4 x DC5521 (12 V / 4 A total)',
        inputs: {
          usb_c: '100 W max',
          dc_solar: 'DC5525 100 W max (AC adapter and solar)',
        },
        recharge_time: 'About 4 hours (100 W)',
        weight: '3.2 kg',
        dimensions: '190 x 65 x 225 mm',
        features: ['3-level LED light and SOS', 'Quiet operation (about 30 dB)', 'German Design Award 2026'],
        operating_temp: 'Charging 0 to 55 C, Discharging -10 to 55 C',
      },
    },

    {
      id: 'itel-power-tank-iess-05k10n',
      brand: 'itel Energy',
      name: 'Power Tank',
      model: 'IESS-05K10N',
      slug: 'itel-power-tank',
      category: 'All-in-One Solar Generator / Home ESS',
      tier: 'portable',
      calculatorEligible: true,
      acOutput: true,
      available: true,
      price: 285000,
      usableWh: 1000,   // Treated as the usable figure
      maxOutputW: 500,
      // TODO: confirm with supplier - key_specs says surge 600VA but peakOutputW was 1000.
      // Using 600 (the lower, more conservative figure) until confirmed.
      peakOutputW: 600,
      // TODO: confirm - warranty sheet reads "12 to 24 months". Showing 12 months until confirmed.
      warranty: '12 months',
      // En/em dashes replaced with plain text (brief §1.3)
      plainEnglishCapacity: 'Runs four lights, a fan and your Wi-Fi all night, about 8 hours, on one charge.',
      description:
        '3-in-1 all-in-one system: 500 W pure sine wave inverter plus 1 kWh LiFePO4 battery plus 400 W MPPT. Plug-and-play home backup for lights, fans, TVs, routers and small appliances.',
      images: [
        // TODO: confirm we have permission to use these images
        // Converted from the supplied PNG to local WebP.
        'assets/products/itel-power-tank/product.webp',
      ],
      photos: [
        'assets/products/itel-power-tank/product.webp',
      ],
      imageWidth: 1600,
      imageHeight: 1718,
      inTheBox: [
        'Power Tank unit (IESS-05K10N)',
        'AC charging cable',
        'Solar panel cable / PV connector',
        'User manual',
        'Warranty card',
        'Mounting accessories / wall bracket (where supplied)',
      ],
      rechargeOptions: [
        { method: 'Mains socket',    detail: 'Plug into any standard wall socket (90 to 280 V)', time: 'About 2 hours (combined with solar)' },
        { method: 'Solar panel',     detail: 'Up to 400 W PV input (panel sold separately)',      time: 'Typically 2 to 4 hours in good sunlight' },
        { method: 'Dual (solar and grid)', detail: 'Simultaneous charging for fastest refill',   time: 'About 2 hours' },
      ],
      specs: [
        { label: 'Capacity',                 value: '1,000 Wh (1 kWh)' },
        { label: 'AC output',                value: '500 W continuous / 600 VA peak' },
        { label: 'Battery type',             value: 'LiFePO4 (lithium iron phosphate)' },
        { label: 'Cycle life',               value: '6,000+ cycles' },
        { label: 'PV input',                 value: 'Max 400 W, 11 to 60 V MPPT' },
        { label: 'Switch time',              value: '20 ms or less (UPS-class)' },
        { label: 'Recharge (mains + solar)', value: 'About 2 hours (0 to 100%)' },
        { label: 'Weight',                   value: 'Approx. 10 to 15 kg' },
        { label: 'Dimensions',               value: '225 x 139 x 288 mm' },
        { label: 'Noise',                    value: 'Less than 45 to 47 dB' },
      ],
      key_specs: {
        battery_capacity: '1,000 Wh (1 kWh)',
        battery_type: 'LiFePO4',
        rated_capacity: '314 Ah',
        cycle_life: '6,000+',
        // TODO: confirm with supplier - peakOutputW set to 600 (from surge_power field),
        // not 1000 as originally listed in peakOutputW. See above.
        ac_output: '500 W continuous / 600 VA max (pure sine wave, 230 V 50 Hz)',
        surge_power: '600 VA',
        switch_time: '20 ms or less (UPS-class)',
        pv_input: 'Max 400 W, 11 to 60 V MPPT, 1 tracker, 99% efficiency',
        ac_input: '90 to 280 Vac (handles up to 380 V phase)',
        max_ac_input_power: '1,000 W (bypass and charge)',
        recharge_time: 'About 2 hours (combined solar and grid)',
        noise: 'Less than 45 to 47 dB',
        dimensions: '225 x 139 x 288 mm',
        weight: 'Approx. 10 to 15 kg',
        protections: ['Over-voltage', 'Overload', 'Short-circuit', 'Over-temperature', 'PV OVP', 'Battery fuse'],
        features: ['USB-A and AC outputs', 'Intelligent fan cooling', 'LED SOC display'],
      },
    },

    {
      id: 'itel-power-tank-1000-iess-1k20n',
      brand: 'itel Energy',
      name: 'Power Tank 1000',
      model: 'IESS-1K20N',
      slug: 'itel-power-tank-1000',
      category: 'All-in-One Solar Generator / Home ESS',
      tier: 'portable',
      calculatorEligible: true,
      acOutput: true,
      available: true,
      price: null,      // Show "Price on request"
      usableWh: 2000,
      maxOutputW: 1000,
      peakOutputW: 1200,
      warranty: '12 months',
      // En/em dashes replaced with plain text (brief §1.3)
      plainEnglishCapacity: 'Runs lights, fans, a TV, Wi-Fi and a laptop for a full night or more, roughly double the Power Tank.',
      description:
        'Larger 3-in-1 system: 1,000 W pure sine wave hybrid inverter plus 2,000 Wh LiFePO4 battery plus 1,200 W MPPT. Suitable for more appliances and longer runtimes in homes and small businesses.',
      images: [
        // TODO: confirm we have permission to use these images
        'assets/products/itel-power-tank-1000/product.webp',
      ],
      photos: [
        'assets/products/itel-power-tank-1000/product.webp',
      ],
      imageWidth: 580,
      imageHeight: 580,
      inTheBox: [
        'Power Tank 1000 unit (IESS-1K20N)',
        'AC charging cable',
        'User manual',
        'Warranty card',
      ],
      rechargeOptions: [
        { method: 'Mains socket',         detail: '90 to 280 V AC input',          time: 'About 2 to 2.5 hours (with solar)' },
        { method: 'Solar panel',          detail: 'Up to 1,200 W PV input',        time: 'Typically 2 to 3 hours in good sunlight' },
        { method: 'Dual (solar and grid)', detail: 'Simultaneous charging',        time: 'About 2 hours' },
      ],
      specs: [
        { label: 'Capacity',      value: '2,000 Wh (2 kWh)' },
        { label: 'AC output',     value: '1,000 W continuous / 1,200 VA peak' },
        { label: 'Battery type',  value: 'LiFePO4 (Class-A)' },
        { label: 'Cycle life',    value: '6,000 to 8,000+' },
        { label: 'PV input',      value: 'Max 1,200 W, 11 to 60 V MPPT' },
        { label: 'Switch time',   value: 'Less than 20 ms' },
        { label: 'Weight',        value: 'About 19 kg' },
        { label: 'Dimensions',    value: '300 x 300 x 180 mm' },
      ],
      key_specs: {
        battery_capacity: '2,000 Wh (2 kWh)',
        battery_type: 'LiFePO4 (Class-A)',
        cycle_life: '6,000 to 8,000+',
        ac_output: '1,000 W continuous / 1,200 VA max (pure sine wave, 230 V 50 / 60 Hz)',
        switch_time: 'Less than 20 ms',
        pv_input: 'Max 1,200 W, 11 to 60 V MPPT, max 30 A, 99% efficiency',
        ac_input: '90 to 280 Vac (withstands 380 V phase)',
        max_ac_input_power: '1,000 W (bypass)',
        dc_outputs: ['USB-C', 'USB-A (multiple)', 'DC5525 12 V / 4 A'],
        recharge_time: 'About 2 to 2.5 hours (dual PV and grid)',
        noise: 'Less than 45 dB (silent) / Less than 50 dB (performance)',
        dimensions: '300 x 300 x 180 mm',
        weight: 'About 19 kg',
        protections: ['OVP', 'PV OVP', 'Overload', 'Short-circuit', 'Over-temperature', 'AC Type II surge'],
        features: ['Intelligent fan cooling', 'Plug-and-play 3-in-1 design'],
      },
    },

    // ── Home battery systems (not calculator-eligible; appear in "whole home" strip) ─

    {
      id: 'hithium-arkvolt-l16',
      brand: 'Hithium (ARKVOLT)',
      name: 'ARKVOLT L16',
      model: 'HPB-16LV',
      slug: 'hithium-arkvolt-l16',
      category: 'Residential Low-Voltage Battery',
      tier: 'home-battery',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: 16076,
      maxOutputW: null,
      peakOutputW: null,
      warranty: '10 years / 8,000 cycles',
      plainEnglishCapacity:
        '16 kWh modular home battery. Enough for a full day of essential loads when paired with a compatible inverter.',
      description:
        '16 kWh low-voltage (51.2 V) modular home battery. Highly compatible with mainstream inverters, IP65, long cycle life.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Capacity',               value: '16,076.8 Wh (16.07 kWh)' },
        { label: 'Rated voltage',          value: '51.2 VDC' },
        { label: 'Max charge / discharge', value: '200 A / 200 A' },
        { label: 'Cycle life',             value: '8,000 to 11,000+' },
        { label: 'IP rating',              value: 'IP65' },
        { label: 'Weight',                 value: '123 kg' },
        { label: 'Dimensions',             value: '468.2 x 265 x 900 mm' },
      ],
      key_specs: {
        battery_energy: '16,076.8 Wh (16.07 kWh)',
        cell_capacity: '314 Ah',
        rated_voltage: '51.2 VDC',
        voltage_range: '44.8 to 57.6 VDC',
        max_charge_discharge_current: '200 A / 200 A',
        cycle_life: '11,000 or more (8,000 at standard conditions)',
        chemistry: 'LiFePO4 (LFP)',
        weight: '123 kg',
        dimensions: '468.2 x 265 x 900 mm',
        ip_rating: 'IP65',
        operating_temp: 'Charge / Discharge -20 to 55 C',
        scalability: 'Up to 32 units in parallel (up to about 512 kWh)',
        communication: 'CAN / RS485',
        features: ['Split modular design for easy handling', 'Optional heating'],
      },
    },

    {
      id: 'hithium-arkvolt-l16s',
      brand: 'Hithium (ARKVOLT)',
      name: 'ARKVOLT L16S',
      model: 'HPB-16LV-S',
      slug: 'hithium-arkvolt-l16s',
      category: 'Residential Low-Voltage Battery',
      tier: 'home-battery',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: 16070,
      maxOutputW: null,
      peakOutputW: null,
      warranty: '10 years / 8,000 cycles',
      plainEnglishCapacity:
        'Split-design 16 kWh battery for easier indoor handling and installation.',
      description:
        'Split-design 16 kWh low-voltage battery optimised for easier transport and installation. High current capability.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Capacity',    value: '16.07 kWh' },
        { label: 'Rated voltage', value: '51.2 V' },
        { label: 'Max current', value: '200 A' },
        { label: 'IP rating',   value: 'IP65' },
        { label: 'Weight',      value: '137.5 kg' },
      ],
      key_specs: {
        battery_energy: '16.07 kWh',
        cell_capacity: '314 Ah',
        rated_voltage: '51.2 V',
        voltage_range: '44.8 to 57.6 V',
        max_charge_discharge_current: '200 A',
        recommend_current: '157 A or less',
        cycle_life: '8,000 or more',
        chemistry: 'LiFePO4',
        weight: '137.5 kg',
        dimensions: '480 x 278 x 1025 mm',
        ip_rating: 'IP65',
        operating_temp: 'Charge / Discharge -20 to 55 C',
        scalability: 'Up to 32 units in parallel',
        communication: 'RS485 / CAN',
      },
    },

    {
      id: 'hithium-arkvolt-f8s',
      brand: 'Hithium (ARKVOLT)',
      name: 'ARKVOLT F8S',
      model: 'HiTHIUM DC-Boost HV Series',
      slug: 'hithium-arkvolt-f8s',
      category: 'Residential High-Voltage Modular Battery',
      tier: 'home-battery',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: 8000,
      maxOutputW: 4000,
      peakOutputW: null,
      warranty: null,
      plainEnglishCapacity:
        '8 kWh high-voltage modular pack with built-in DC optimiser. Expand to 32 kWh per stack.',
      description:
        '8 kWh high-voltage modular battery with built-in DC optimiser. Supports mixing old and new modules and flexible expansion.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Module capacity', value: '8 kWh' },
        { label: 'Nominal voltage', value: '576 V' },
        { label: 'Rated power',     value: '4,000 W' },
        { label: 'IP rating',       value: 'IP65' },
        { label: 'Weight',          value: 'About 98 kg per module' },
      ],
      key_specs: {
        battery_module_capacity: '8 kWh',
        usable_capacity: '8 kWh',
        nominal_voltage: '576 V',
        operating_voltage_range: '482 to 657 V',
        rated_output_power: '4,000 W',
        cycle_life: '8,000 or more',
        chemistry: 'LiFePO4',
        weight: 'About 98 kg (per module)',
        dimensions: '597 x 263 x 677 mm',
        ip_rating: 'IP65',
        operating_temp: 'Charge 0 to 55 C, Discharge -20 to 55 C',
        scalability: '1 to 4 modules per stack (8 to 32 kWh), parallel up to 256 kWh',
        features: ['Built-in DC optimiser / DC-BOOST', 'Mix-batch compatible', 'Optional heating'],
      },
    },

    {
      id: 'hithium-arkvolt-r30',
      brand: 'Hithium (ARKVOLT)',
      name: 'ARKVOLT R30',
      model: 'HPC-30LV-22U',
      slug: 'hithium-arkvolt-r30',
      category: 'Residential All-in-One High-Capacity Battery Cabinet',
      tier: 'home-battery',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: 30054,
      maxOutputW: null,
      peakOutputW: null,
      warranty: null,
      plainEnglishCapacity:
        '30 kWh all-in-one cabinet using large 587 Ah cells. High density for energy-intensive homes.',
      description:
        '30 kWh all-in-one low-voltage cabinet using large 587 Ah cells. High energy density, simplified wiring, suitable for energy-intensive homes.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Capacity',     value: '30,054 Wh (30.05 kWh)' },
        { label: 'Cell capacity', value: '587 Ah' },
        { label: 'Max current',  value: '300 A' },
        { label: 'IP rating',    value: 'IP20 (indoor)' },
        { label: 'Weight',       value: 'About 350 kg' },
      ],
      key_specs: {
        battery_energy: '30,054.4 Wh (30.05 kWh)',
        cell_capacity: '587 Ah',
        rated_voltage: '51.2 VDC',
        max_charge_discharge_current: '300 A',
        cycle_life: '8,000 or more',
        chemistry: 'LiFePO4',
        weight: 'About 350 kg',
        dimensions: '600 x 630 x 1000 mm',
        ip_rating: 'IP20 (indoor)',
        operating_temp: 'Charge 0 to 55 C, Discharge -20 to 55 C',
        scalability: 'Up to 32 units in parallel (up to about 960 kWh)',
        communication: 'CAN / RS485 / Wi-Fi',
        features: ['Slide-in quick-plug modules', 'Built-in distribution box', 'Optional heating', 'LED display'],
      },
    },

    // ── Battery cells (industrial components - never rendered to visitors) ────

    {
      id: 'hithium-cell-314ah',
      brand: 'Hithium',
      name: 'ESS Cell 314Ah',
      model: 'LFP71173207 / 314Ah',
      slug: 'hithium-cell-314ah',
      category: 'Battery Cell',
      tier: 'cell',                // Filtered out of every view
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: null,
      maxOutputW: null,
      peakOutputW: null,
      warranty: null,
      plainEnglishCapacity: null,
      description: 'High-performance prismatic LFP cell widely used in residential and commercial ESS.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Nominal capacity', value: '314 Ah' },
        { label: 'Chemistry',        value: 'LiFePO4 (LFP)' },
        { label: 'Cycle life',       value: '13,000 or more' },
        { label: 'Gravimetric ED',   value: '173.2 Wh/kg or more' },
      ],
      key_specs: {
        nominal_capacity: '314 Ah',
        chemistry: 'LiFePO4 (LFP)',
        cycle_life: '13,000 or more',
        gravimetric_ed: '173.2 Wh/kg or more',
        volumetric_ed: '382.6 Wh/L or more',
        features: [
          'No fire or explosion in nail penetration and crush tests',
          'Ultra-wide operating temperature',
          'Certifications: IEC 62619, UL 9540A, UL 1973, UN 38.3',
        ],
      },
    },

    {
      id: 'hithium-cell-587ah',
      brand: 'Hithium',
      name: 'Infinity Cell 587Ah',
      model: '587Ah',
      slug: 'hithium-cell-587ah',
      category: 'Battery Cell',
      tier: 'cell',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: null,
      maxOutputW: null,
      peakOutputW: null,
      warranty: null,
      plainEnglishCapacity: null,
      description: 'Large-format LFP cell used in ARKVOLT R30 and utility systems.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Nominal capacity', value: '587 Ah' },
        { label: 'Chemistry',        value: 'LiFePO4 (LFP)' },
        { label: 'Cycle life',       value: '11,000 or more' },
      ],
      key_specs: {
        nominal_capacity: '587 Ah',
        chemistry: 'LiFePO4 (LFP)',
        cycle_life: '11,000 or more',
        gravimetric_ed: 'About 185 Wh/kg',
        volumetric_ed: 'About 413 Wh/L',
        dimensions: '286 x 73.50 x 216.3 mm',
        certifications: ['IEC 62619', 'UL 9540A', 'UL 1973', 'GB/T 36276', 'UN 38.3'],
      },
    },

    {
      id: 'hithium-cell-1175ah',
      brand: 'Hithium',
      name: 'Infinity Cell 1175Ah',
      model: '1175Ah',
      slug: 'hithium-cell-1175ah',
      category: 'Battery Cell',
      tier: 'cell',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: null,
      maxOutputW: null,
      peakOutputW: null,
      warranty: null,
      plainEnglishCapacity: null,
      description: 'Ultra-large LFP cell designed for long-duration energy storage (4-hour systems).',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Nominal capacity', value: '1,175 Ah' },
        { label: 'Chemistry',        value: 'LiFePO4 (LFP)' },
        { label: 'Cycle life',       value: '11,000 or more' },
      ],
      key_specs: {
        nominal_capacity: '1,175 Ah',
        chemistry: 'LiFePO4 (LFP)',
        cycle_life: '11,000 or more',
        gravimetric_ed: '180 Wh/kg or more',
        volumetric_ed: '400 Wh/L or more',
        dimensions: '580.22 x 75.22 x 216.31 mm',
        certifications: ['IEC 62619', 'UL 9540A', 'UL 1973', 'UN 38.3'],
      },
    },

    {
      id: 'hithium-cell-1300ah',
      brand: 'Hithium',
      name: 'Infinity Cell 1300Ah',
      model: '1300Ah',
      slug: 'hithium-cell-1300ah',
      category: 'Battery Cell',
      tier: 'cell',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: null,
      maxOutputW: null,
      peakOutputW: null,
      warranty: null,
      plainEnglishCapacity: null,
      description: 'Highest-capacity LFP cell for 8-hour long-duration energy storage applications.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Nominal capacity', value: '1,300 Ah' },
        { label: 'Chemistry',        value: 'LiFePO4 (LFP)' },
        { label: 'Cycle life',       value: '10,000 or more' },
      ],
      key_specs: {
        nominal_capacity: '1,300 Ah',
        chemistry: 'LiFePO4 (LFP)',
        cycle_life: '10,000 or more',
        gravimetric_ed: '190 Wh/kg or more',
        volumetric_ed: '406 Wh/L or more',
        dimensions: '580.2 x 75.2 x 234.3 mm',
        features: ['Temperature rise 5 C or less', 'Designed lifespan over 25 years'],
      },
    },

    {
      id: 'hithium-cell-n162ah',
      brand: 'Hithium',
      name: 'Infinity Cell N162Ah',
      model: 'N162Ah',
      slug: 'hithium-cell-n162ah',
      category: 'Battery Cell (Sodium-ion)',
      tier: 'cell',
      calculatorEligible: false,
      acOutput: false,
      available: true,
      price: null,
      usableWh: null,
      maxOutputW: null,
      peakOutputW: null,
      warranty: null,
      plainEnglishCapacity: null,
      description:
        'Sodium-ion (NFPP) cell for utility-scale energy storage with ultra-wide temperature range and very long cycle life.',
      images: [],
      photos: [],
      imageWidth: null,
      imageHeight: null,
      inTheBox: [],
      rechargeOptions: [],
      specs: [
        { label: 'Nominal capacity', value: '162 Ah' },
        { label: 'Chemistry',        value: 'NFPP / HC (Sodium-ion)' },
        { label: 'Cycle life',       value: '20,000 or more' },
      ],
      key_specs: {
        nominal_capacity: '162 Ah',
        chemistry: 'NFPP / HC (Sodium-ion)',
        cycle_life: '20,000 or more',
        gravimetric_ed: '95.2 Wh/kg or more',
        volumetric_ed: '173 Wh/L or more',
        operating_temp: '-40 to 60 C',
        features: ['High energy efficiency 94% or more at 1P', 'High thermal stability'],
      },
    },

  ], // end products

  // ── Delivery fees ─────────────────────────────────────────────────────────

  deliveryFeeByState: [
    { state: 'Lagos',        fee: 3000 },
    { state: 'Abuja (FCT)', fee: 5000 },
    { state: 'Rivers',       fee: 6000 },
    { state: 'Kano',         fee: 7000 },
    { state: 'Oyo',          fee: 5500 },
    { state: 'Delta',        fee: 6500 },
    { state: 'Anambra',      fee: 6000 },
    { state: 'Enugu',        fee: 6500 },
    { state: 'Kaduna',       fee: 7000 },
    { state: 'Ondo',         fee: 6000 },
    { state: 'Other states', fee: 8000 },
  ],

  // ── Power spectrum (gap section) ──────────────────────────────────────────
  //
  // priceRange for "power-station" is computed from the four portable units.
  // Currently only Power Tank has a confirmed price (285,000).
  // The range will be updated as prices are confirmed.
  // TODO: update priceRange when remaining portable prices are set.

  powerSpectrum: [
    {
      id: 'power-bank',
      confirmed: false,
      label: 'Power bank',
      // Approximate market price range for context - not our product
      priceRange: '5,000 to 30,000',
      canRun: 'Phone charging, maybe a small light',
      duration: '6 to 12 hours of phone use',
      limitation: 'Cannot run a fan, TV or laptop for long',
      highlight: false,
    },
    {
      id: 'power-station',
      confirmed: false,
      label: 'Power station',
      // Derived from real product prices: only Power Tank confirmed at 285,000.
      // Other units are price-on-request. Range shown as "from 285,000" until all prices confirmed.
      // TODO: compute full range once remaining prices are set.
      priceRange: 'from 285,000',
      priceRangePlaceholder: true, // flag: this is a partial range, not a full range
      canRun: 'Lights, fan, TV, Wi-Fi, laptop. Everything typical for a home or office.',
      duration: 'About 8 hours of four lights, a fan and Wi-Fi with the Power Tank',
      highlight: true,
      callout: 'This is the one most people miss',
    },
    {
      id: 'inverter-system',
      confirmed: false,
      label: 'Inverter and batteries',
      priceRange: '600,000 to 2,000,000+',
      canRun: 'Whole home, including fridge and air conditioner',
      duration: 'Depends on battery bank size',
      limitation: 'High upfront cost, fixed installation, requires maintenance',
      highlight: false,
    },
  ],

  // ── Site defaults ─────────────────────────────────────────────────────────

  DEFAULT_MONTHLY_POWER_SPEND: 30000,   // naira - TODO: confirm a reasonable average for target audience
  DEFAULT_DAILY_OUTAGE_HOURS: 8,        // hours - TODO: confirm typical figure for target audience

};

const loaded = await loadProductControls();
const resolved = applyProductControls([...baseCatalogue.products, ...hithiumProducts, ...solutionProducts], loaded.controls);
export const productControlErrors = [...(loaded.error ? [loaded.error] : []), ...resolved.errors];
export const catalogue = { ...baseCatalogue, products: resolved.products };

// Every consumer receives the same resolved names, prices and availability.
export const { deliveryFeeByState, powerSpectrum, DEFAULT_MONTHLY_POWER_SPEND, DEFAULT_DAILY_OUTAGE_HOURS } = catalogue;
export const portableProducts = catalogue.products.filter(p => p.calculatorEligible && p.tier === "portable");
