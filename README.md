# Independent power solutions site

Plain HTML, CSS and vanilla JavaScript ES modules. No framework, bundler, site dependencies or build step. The folder can be deployed as static files to Vercel.

## Solution guide

The homepage is organised around phones, laptops, daily essentials, fitted backup
and solar. Public recommendations show a solution type and multiple suitable
choices. The quotation or checkout identifies the actual manufacturer and model
before payment. Manufacturer records in static JavaScript are public, not secret.

`js/solutions.js` adds verified USB-bank checks and preliminary installed-system
sizing around the existing portable engine. Only confirmed energy/output/port
ratings enter USB recommendations. Existing equipment and editable sun-hour
assumptions are included in installed quotations. The calculator does not certify
component compatibility or offer an unverified fitted bundle for checkout.

`data/solution-products.js` adds 30 power-bank sourcing records, ten inverter
records and ten panel records. `SOLUTIONS_RESEARCH.md` lists sources and gaps.
Two checked USB-bank records start enabled for enquiries with null prices;
other new records are disabled pending specification/supply checks. An owner's
availability change cannot make an incomplete bank eligible. Edit the technical
record only when its missing specifications have been verified.

The five generic AI illustrations are in `assets/solutions/`. Their prompt set
and provenance are in `assets/solutions/README.md`. They are visibly labelled
illustrations; they do not depict a specific product offered for sale.

## Run locally

Run `node server.js`, then open http://127.0.0.1:3000/. ES module imports need an HTTP server; do not open the HTML using file URLs.

## Tests

Run `node --test` or `npm test`. Tests import the real catalogue. Browser QA uses external development tooling, not a site dependency. Local screenshots and QA records are ignored under `.screenshots/`.

## Payment warning

**Do not enable production payments yet. Payment verification is not implemented.** The current Paystack callback is client-side and does not prove that a transaction has been verified. Orders are stored only in browser session storage, not a persistent order database.

The marked TODO in `js/checkout.js` is where a future request to `/api/verify` must go. That server endpoint must verify reference, amount, currency and selected product using a secret key held only on the server. It is deliberately outside Stage A.

An empty `PAYSTACK_PUBLIC_KEY` enables demo checkout. It takes no payment and labels the confirmation as a demo. A configured public key loads Paystack Inline. Never put a secret key in this repository.

## Product controls and one resolved catalogue

Edit root `products.json` for everyday administration. Each stable slug has only
three editable fields, for example:

```json
"hithium-heroee-1": {
  "name": "Hithium HeroEE 1",
  "price": 270000,
  "available": true
}
```

Use a positive number in naira without commas or a currency symbol. Use `null`
for a price on request. Use `false` to stop recommending and selling a model.
The category guide stays visible independently of model stock. Keep the slug keys and
JSON punctuation. Names can change without breaking saved product selections.
The example above is one entry inside the file's outer object.

The resolved catalogue applies these values to model choices, the calculator, budget,
WhatsApp, payback and checkout. Missing or invalid entries become unavailable
and unpriced, with a visitor notice and console diagnostics. Unknown slug keys
are reported. Commercial controls cannot change technical ratings, tiers or
calculator eligibility. `name` is the actual model name shown at checkout; solution
headlines are generic. Cells remain hidden even if their availability is true.

Refresh the page after saving locally; deploy the updated file for a hosted site.
This is public static configuration, so do not put secrets or private costs in it.
The browser loads it using native fetch before the catalogue is exported; Node
tests read the same file. No framework or build tool is needed.

`data/catalogue.js` exports `catalogue`, `portableProducts`, `deliveryFeeByState`, `powerSpectrum`, `DEFAULT_MONTHLY_POWER_SPEND` and `DEFAULT_DAILY_OUTAGE_HOURS`.

To add a product, add a technical object to `baseCatalogue.products` in
`data/catalogue.js`, or the Hithium records in `data/hithium.js`, preserving the
existing fields. Also add its stable slug to root `products.json`. Only available
portable products with `calculatorEligible: true` reach the portable engine. The
solution layer separately admits verified power banks. Cells are never rendered.
The technical catalogue retains four itel and three Hithium portable stations.

To set a price, edit the matching root `products.json` entry. Technical-record
prices are not the selling-price controller. Null prices use WhatsApp, have no
payback and cannot enter checkout. The former price scale is now a simple guide
to choosing by need; model prices are shown with suitable calculator choices.

`HITHIUM_RESEARCH.md` records specifications, Nigerian starter-price sources and
supplier conflicts. Unknown Hithium surge ratings use rated-output limits in
the calculator until confirmed. Replace researched starter prices with yours.

## Photos

Save local WebP photos under `assets/products/<slug>/`. Update the product's `images`, `photos`, `imageWidth` and `imageHeight`. Set the dimensions to the actual image dimensions. Active product images are local. Power Tank is 1600 by 1718 pixels. The supplier hero photo is 1600 by 1600 pixels.

// TODO: confirm we have permission to use these images before going live.

The Power Tank supplier image is a collage. The shared product-photo component uses a CSS crop to show only its top product photograph. Product features and logos are never generated. Image sources are recorded in assets/products/PHOTO_SOURCES.md. Reference images are not shipped in page content.

## Configuration

All public settings live in `config.js`:

| Setting | Current purpose |
|---|---|
| `SITE_NAME` | Brand text, page titles and accessible home-link names; confirm the chosen name |
| `WHATSAPP_NUMBER` | Consultation and enquiry number, including country code without a plus sign or spaces |
| `PAYSTACK_PUBLIC_KEY` | Empty means demo mode; never use a secret key |
| `LEAD_ENDPOINT` | Empty disables sending; set to a JSON POST endpoint |
| `CURRENCY`, `CURRENCY_SYMBOL` | Naira display configuration |
| `SHOW_TRUST_STATS`, `SHOW_TESTIMONIALS` | Reserved false flags; there are no invented stats or testimonial renderers |
| `PAYBACK_MONTH_CAP` | Suppress estimates over 60 months |
| `NEAR_MISS_THRESHOLD` | Energy overshoot allowance of 15 percent |
| `TIGHT_FIT_THRESHOLD` | Close-to-limit threshold of 85 percent |

Appliance wattages, surge assumptions, delivery fees and supplier details still need confirmation where marked TODO. Blank calculator inputs use the exported 8-hour outage and 30000-naira example spend. Default spend is explicitly labelled as an example, never as the visitor's own spending.

## Calculation and actions

The final consultation form validates the visitor's name and email before opening
WhatsApp with those details. It uses `WHATSAPP_NUMBER` and sends an optional lead
through the shared `sendLead()` function. Set a real number before using it with
customers. The adjacent action opens the calculator rather than silently ordering
a featured manufacturer's unit. Only a suitable, available and priced model
selected in the calculator can enter checkout.

The live UI calls `recommendSolutions()` in `js/solutions.js` for all situations.
The existing `estimateSetup()` and `recommend()` remain the pure portable engine
and its regression interface. Bank checks and installed sizing are layered around it.

Energy is `1.2 * sum(watts * qty * min(hours, outageHours))`. Candidates must pass AC socket, running output, peak output and capacity checks. Runtime at simultaneous full load includes the same loss allowance. This is an estimate, not a promised appliance schedule.

The UI renders empty, fit, tight, near-miss and installed-quote states. WhatsApp
uses `solutionEnquiry()` to include the devices, hours, budget, selected model
reference or preliminary system requirements. Checkout saves the selected slug,
selections, outage hours and load figures in session storage. Checkout refuses
missing, unknown, unavailable or unpriced products. `computeOrderTotal()` uses
the shared delivery table and falls back to 'Other states'.

`sendLead()` POSTs JSON with a timestamp when configured. Network errors do not block actions. WhatsApp and checkout-start records include selections and outage/load figures. Checkout-pay includes contact and delivery details. Configure an endpoint with appropriate CORS support; no lead service is currently connected.

## Stage A scope

`REFERENCE_NOTES.md` records the visual study. The calculator, audience product frame, checkout and confirmation borrow spacing, hierarchy and framing from the references. Hero/gap/range/footer redesign, whole-home strip and server payment verification remain separate stages. Stage A changes only the required copy/data behaviour in those existing sections.


## Stage B, Part 1

The calculator opens with the Families preset. Six situation buttons include Custom. Desktop has a five-by-two appliance grid and a compact result. Phones use Who, What and Your unit steps. Selected mobile tiles show a quantity/hours summary; Edit reveals that tile's two steppers, one tile at a time, so all controls keep 44 pixel targets without a scrolling panel. Appliance hours range from 1 to 24 in whole-hour steps.

Monthly spend starts empty and does not calculate an example payback. A priced result asks for spend; a supplied spend produces the existing engine's estimate. The old audience accordion and separate comparison section are removed. WhatsApp, saved checkout data and checkout behaviour are unchanged.

The warm tokens and Plus Jakarta Sans are shared across pages. Product photography and result presentation have since been updated. Other homepage compositions remain outside that stage. Screenshots, reference comparisons, measured heights and browser QA are under `.screenshots/stage-b/`.
# Stage C language layer

`data/plain-language.js` holds the everyday labels, glossary and copy. `js/plain.js`
derives examples from the existing product and appliance figures. Examples are
separate uses of a full charge, not a promise that all listed appliances run together.
The first four supported examples appear in the requested order. `goodFor()` checks
full presets with the existing recommender; it does not assign audience tags by hand.

`technicalDetails()` creates the shared, closed-by-default disclosure. Keep model
codes and specifications inside it. `PHONE_CHARGE_WH` in `config.js` defaults to 15
and still needs confirmation. The quiet-office noise comparison also needs confirmation.
The catalogue does not confirm a wall-only two-hour refill, so the page asks visitors
to check that time with us.

Run `node --test` for the complete suite. The copy lint also renders the site with
Playwright as a development tool. Install Playwright outside the shipped site, or
set `PLAYWRIGHT_MODULE_PATH` to its module path. The tests can also locate the Codex
bundled development runtime. They use Chromium or installed Microsoft Edge, start
an ephemeral local server, and do not make a real payment or send a lead.

## Budget input

The optional calculator budget is for the unit, with delivery charged separately.
`recommend({ selections, budget })` first keeps the existing power requirements.
It chooses the smallest suitable product with a confirmed price within budget.
When none has a confirmed affordable price, it retains the power-safe result and
reports either the shortfall or the need for a price quote. A missing price is
never treated as zero. A blank budget preserves the original recommendation.
Budget is retained when choosing a different preset and removed by Clear all.
It is also included in the WhatsApp enquiry and checkout estimate.

## Product photos and calculator result

The hero and product frames now use supplier photos from the original product
file. `js/product-photo.js` supplies the same local image and framing in the
calculator, product section, scrolling options and checkout. Keep those shared
frames in sync when replacing a photograph. See `assets/products/PHOTO_SOURCES.md`
for sources and permission notes. Full-resolution originals were used where available.

`js/result-view.js` turns the existing calculation into a short coverage statement,
the remaining charge (rounded down), a price and any budget warning. Coverage uses
the appliance hours the visitor selected. The full simultaneous runtime and maths
remain inside Technical details. A near-miss button applies the actual suggested
hours change, removing an appliance if no hours remain, and recalculates normally.
The calculation rules, product prices and delivery fees are unchanged by this pass.

## Range cards and navigation

`js/product-card.js` shows three derived facts, a photo and the price or a direct
WhatsApp quote link. Longer examples, suitability, exclusions, warranty details
and specifications remain inside the Technical details disclosure. The mini-fridge
limitation stays visible for units with a wall socket that cannot run that example.

The header has distinct links for the range, delivery and questions. Find my unit
is the single calculator action in that navigation. Repeated calculator links and
the footer's direct checkout shortcut have been removed.

`js/range-scroll.js` handles previous/next controls, a visible position count,
Arrow keys and Home/End on the product row. Touch swiping and native scrolling
remain available. Controls follow the scroll position, disable at each end, and
hide when scrolling is unnecessary. Reduced-motion preferences are respected.
