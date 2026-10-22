# Independent power solutions catalogue

Researched 22 October 2026. This is a sourcing selection, not an objective
"top ten" or a claim of retailer affiliation. The public guide is organised by
need. Exact manufacturers and models stay in the underlying static catalogue
and are identified in the quotation or checkout before payment.

## What was added

`data/solution-products.js` contains 50 research records:

- Ten Oraimo and ten itel power banks from manufacturer catalogues.
- Ten New Age model leads, with electrical specifications explicitly unverified.
- Ten inverter models across Deye and Growatt.
- Ten solar-panel variants across Jinko and Trina.

Existing itel/Hithium portable stations and ARKVOLT batteries remain in the
catalogue. Industrial cells remain excluded from all customer recommendations.
Research records are not an assertion that the shop has physical stock.

All 50 entries have controller records in root `products.json`, with only `name`,
`price` and `available`. New prices are null. The two fully checked USB-bank
records are enabled for enquiries, with no checkout while unpriced. Incomplete
records start unavailable. Availability cannot bypass missing technical ratings.
Enable further entries only after checking specifications and supply. Retail
prices and retailer stock were not copied into the shop's selling controls.

## Manufacturer sources

- [Oraimo product catalogue](https://www.oraimo.com/en/collections/power-bank)
  and [Nigeria store](https://ng.oraimo.com/collections/power-banks).
- [itel Nigeria catalogue](https://ng.itelhome.shop/collections/powerbank?page=1).
  Advertised output and capacity are recorded as partial data. No assumed battery
  voltage is used to convert mAh to Wh. A1990's page also has a conflicting
  6000/60000 mAh specification line, so it is not enabled in calculation.
- [Toast 22.5 Byte parameters](https://ng.oraimo.com/product/oraimo-toast-22.5-byte-22.5w-10000mah-power-bank?ean=4894947050954):
  37 Wh and 15 W combined output. Advertised 22.5 W individual fast charging is
  not treated as 22.5 W available at every port simultaneously.
- [PowerJet 130 parameters](https://ng.oraimo.com/product/oraimo-powerjet-130-27600mah-smart-display-130w-fast-charge-power-bank-for-laptop-and-phone?ean=4894947025495):
  manufacturer energy is 99.3 Wh. Do not substitute 102.12 Wh derived from a
  guessed cell voltage. Port limits are 100/30/22.5 W. We conservatively use
  the stated 115 W simultaneous three-port total, despite inconsistent wording
  alongside that line. Laptop support is limited to compatible USB-C charging.
- [PowerBox 600 parameters](https://ng.oraimo.com/product/oraimo-powerbox-600-22-5w-pd-qc-5-outputs-60000mah-with-charger-type-c-cable-portable-power-bank?ean=4895180791857):
  222 Wh is published, but a combined port limit was not found. Excluded from
  automatic recommendations until confirmed.
- [Deye SG03 manufacturer specifications](https://cn.deyeinverter.com/product/hybrid-inverter-1/sun36-5ksg01-03lp1eu.html)
  give four EU-P variants at 3/3.6/5/6 kW, 40 to 60 V battery range and twice-rated
  peak for ten seconds. These do not prove compatibility with any given battery.
- [Deye product families](https://www.deyeinverter.com/product/hybrid-inverter-1/)
  identify four additional SG06 model leads. Complete electrical fields remain null.
- [Growatt SPF 6000 ES Plus](https://en.growatt.com/products/spf-6000-es-plus)
  and [manufacturer product overview](https://us.growatt.com/upload/file/2026-Product-Overview-MIN-Installation-Commissioning.pdf)
  identify the additional Growatt records. Electrical limits await full verification.
- [Jinko manufacturer range](https://jinkosolar.com.au/products-new/) supplies
  five panel-class leads. These use family names; exact order codes and electrical
  limits must be confirmed and they remain unavailable.
- [Trina manufacturer datasheet](https://static.trinasolar.com/sites/default/files/Datasheet_Vertex%20S%2B_NEG9R.28_EN_2024_C_web.pdf)
  supplies five NEG9R.28 variants and their published voltage/current values.
  Installer approval of string design is still required.

## New Age gaps

`newagechargers.com` was inaccessible. The shop linked from `newagehub.online`
contained unrelated template merchandise and could not verify electrical data.
Consequently no New Age item is eligible for runtime calculations yet.

Model leads come from the following seller pages only; they are not treated as
manufacturer specifications or confirmed shop stock:

- [Alkay](https://alkayconcepts.com/product-category/new-age-power-bank/): Turbo
  Ultra 3, 4, 5, 11; Y107 Pro; Turbo Prime 3.
- [Jumia listing](https://www.jumia.com.ng/new-age-power-bank-22500mahh-typec-inout-2usb-turbo-ultra8-257252303.html): Turbo Ultra 8.
- [Jonathan listing](https://www.jonathan.ng/shop/new-age-j208-power-bank/): J208.
- [My Padi Store](https://mypadistore.com/product-category/new-age-power-banks/): J159-20KS and FC50P.

Capacity, output, per-port limits, warranty and energy remain null or explicitly
unconfirmed where no primary source was established. No invented tenth product
or electrical specification was used to complete a quota.

## Recommendation behaviour

`recommendSolutions()` in `js/solutions.js` uses the existing outage energy,
running-output, simultaneous-surge and AC checks. USB banks additionally need
verified energy, combined output and per-port limits. They support only the
calculator's phone-charger and compatible USB-C laptop selections. Router power
is not assumed to work through a USB-to-12-V adapter.

The smallest suitable category is considered first, with priced options in budget
preferred within that category. An unknown bank price does not cause a phone-only
visitor to be sent to a much larger priced station. Unknown prices are never free.
All choices shown pass the electrical requirements; changing a choice carries its
stable slug to checkout. Names, prices and availability use the same controller.

Installed/solar results are preliminary requirements, not pre-approved bundles:
energy with the existing 1.2 allowance; nominal battery energy divided by an
assumed 0.8 usable fraction; inverter running requirement with 25% headroom;
starting power retained separately. Solar assumes four peak sun hours and 75%
system yield by default; visitors can change the sun-hour assumption. These are
not location forecasts or guaranteed solar generation.

Existing inverter/panel selections are carried into WhatsApp, together with the
load, outage window, budget and draft sizing. No component combination is sold
automatically without voltage, BMS, discharge-current, MPPT, cold Voc, wiring,
protection and installer checks. Installed quotes include equipment and fitting;
no fabricated complete-system price or compatibility claim is shown.

This remains a static website. Catalogue data and manufacturer identities can be
read in downloaded JavaScript. A neutral presentation does not make model data
secret. Prices and availability refresh per page load; deploy edited controls
to update the hosted site.
