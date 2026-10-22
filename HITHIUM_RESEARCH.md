# Hithium portable stations

Checked 22 October 2026. These are public Nigerian asking prices used as editable
starter prices, not confirmed selling prices for this shop. Delivery and solar
panels are extra. Set your own prices and stock in root `products.json`.

| Model | Battery | Rated output | Starter price | Price source |
|---|---:|---:|---:|---|
| HeroEE 1 | 1004.8 Wh | 200 W | NGN 270,000 | [Manufacturer Nigeria page](https://www.hero-ee.com/en-NG/product_intro/1kWh) |
| HeroEE LIGHT 1 | 1004.8 Wh | 500 W | NGN 310,000 | [Jumia official-store listing](https://www.jumia.com.ng/hithium-heroee-light-1-1004.8wh-500w-portable-power-supply-power-station-for-home-backupoutdoor-401710145.html) |
| HeroEE 2 | 2009.6 Wh | 1000 W | NGN 670,000 | [AYG dealer listing](https://ayg.com.ng/hithium-heroee-1-2-portable-power-station/) |

Availability starts true to include these units in the requested range. This is
an owner-controlled ordering flag, not a claim that this shop's physical stock
has been independently checked. Change it to false for units you cannot supply.
The LIGHT price is a promotional listing and may change. No retailer ratings,
stock counts, discounts or delivery promises were copied into the site.

## Specifications and discrepancies

- [Manufacturer HeroEE 1 datasheet](https://hithium.com/bocupload/2025/06/06/17491898719605jupa3.pdf):
  1004.8 Wh, 200 W AC output/input, 200 W solar input at 12 to 36 V, LiFePO4,
  6,000 cycles to 80% state of health, two-year warranty.
- [Manufacturer LIGHT 1 specifications](https://hero-ee.com/en-NG/product_intro/HeroEELIGHT1):
  1004.8 Wh, 500 W output/input, solar input 300 W at 12 to 55 V. Its cycle
  claim is up to 11,000 at 25 C, full depth of discharge, 0.5P, to 70% state
  of health. The Jumia listing supports the two-year warranty; confirm local
  warranty coverage with the supplying dealer. Supplied accessories: not confirmed.
- [Manufacturer HeroEE 2 datasheet](https://www.hithium.com/bocupload/2025/06/06/17491899543523sqj1c.pdf):
  2009.6 Wh, 1000 W AC output/input, 450 W solar input at 12 to 50 V, LiFePO4,
  6,000 cycles to 80% state of health, two-year warranty.
- The older HeroEE 2 regional page and AYG listing say 2003.2 Wh. The current
  manufacturer datasheet and [manual table](https://hero-ee.com/download/manual)
  say 2009.6 Wh. The catalogue follows the datasheet; confirm the supplied variant.
- The HeroEE 1 regional page advertises 11,000 cycles. The datasheet uses 6,000
  at a different remaining-capacity threshold. We use the conservative datasheet
  figure and keep the LIGHT test conditions explicit. Cycle ratings are not a
  warranty for the derived number of calendar years.
- Some retailer text confuses HeroEE 1 and LIGHT 1 output. They are separate
  200 W and 500 W models. Technical ratings come from manufacturer sources.
- Separate peak/surge output ratings: **not found** for these three models.
  `peakOutputW` is null, so the engine falls back to rated output. It does not
  assume twice-rated surge. This may conservatively exclude some motor loads.
- Nominal capacity is used as `usableWh`, consistently with the existing brief.
  The existing 1.2 energy allowance still applies; actual usable output needs
  supplier confirmation. Appliance wattages and surge factors remain estimates.

The ARKVOLT home batteries and industrial cells remain separate and ineligible
for portable recommendations. HeroEE 8/16 home battery systems were not added
as portable power stations.

## Data flow

`data/hithium.js` adds technical records to `data/catalogue.js`. That module loads
root `products.json` once per page load, validates each stable slug, and merges
only `name`, `price` and `available`. Browser loading uses native fetch with
`cache: 'no-store'`; Node tests use filesystem reading. There is no build step.

The resolved catalogue supplies cards, the price scale, recommendation sorting,
budget checks, WhatsApp messages, payback and checkout. Unavailable units stay
visible as unavailable in the range, but are excluded from all recommendations,
trim suggestions, upgrades and checkout. A stale saved checkout is checked again
against the current catalogue on page load. A missing or invalid controller entry
is unavailable and unpriced; there is no fallback to an old selling price.

`products.json` is public static configuration, not an authenticated browser admin
or stock database. Saving locally and refreshing loads the changes. A deployed
site needs the updated file deployed. A visitor who already has a page open must
refresh it. Server-verified pricing/payment remains future work as noted in README.
