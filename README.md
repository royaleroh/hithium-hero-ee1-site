# Let It Shine — Power Station Landing Page

A static landing page for selling itel portable power stations and Hithium home battery systems to Nigerian home and small business customers.

Built with plain HTML, CSS (custom properties) and vanilla JavaScript (ES modules). No framework, no bundler, no build step. Deploys directly to Vercel.

> **TODO: confirm we have permission to use the product images downloaded from itelsolar.com before going live.**

---

## Running locally

ES modules require a local server — they will not work when opened directly from `file://`.

**Option 1 — npx serve (no install needed):**
```bash
npx serve .
```

**Option 2 — VS Code Live Server extension:**
Right-click `index.html` → "Open with Live Server".

**Option 3 — Python:**
```bash
python -m http.server 8080
```

Then open `http://localhost:3000` (or whichever port the server reports).

---

## Running tests

Tests use Node's built-in test runner. No npm dependencies are needed beyond Node 18+.

```bash
# Main test suite (recommender — 46 tests)
node --test tests/recommend.test.js

# Or via npm:
npm test
```

The tests cover all six scenarios from the spec:

| # | Scenario | Expected best fit | State |
|---|---|---|---|
| 1 | Student, all DC-friendly | Power Go | fit |
| 2 | Shop with near miss | Power Tank 1000 | near-miss (trim fan by 2 h) |
| 3 | Surge excludes Power Go Pro | Power Tank | fit |
| 4 | Too big, whole home system | — | none |
| 5 | Zero appliances | — | empty |
| 6 | Null price, no payback | Power Go | fit, payback null |

Plus edge cases for `runtimeLabel` and outage-hours capping.

---

## Deploying to Vercel

Point Vercel at this folder. No configuration is needed — it is a static site.

1. Push the folder to a GitHub repository.
2. Import the repository in Vercel.
3. Leave the build command and output directory blank (or set output to `/`).
4. Deploy.

---

## Configuration (`config.js`)

All environment-style values live in `config.js`. Edit this file before going live.

| Value | Description |
|---|---|
| `SITE_NAME` | Replace `PLACEHOLDER_SITE_NAME` with your actual business name |
| `WHATSAPP_NUMBER` | Your WhatsApp number with country code, no `+` or spaces. Example: `2348012345678` |
| `PAYSTACK_PUBLIC_KEY` | Your Paystack public key. Starts with `pk_live_` (production) or `pk_test_` (test). Never use the secret key here. |
| `LEAD_ENDPOINT` | A URL that accepts a `POST` request with a JSON body. Works with Google Apps Script web apps or Formspree. Leave blank to disable lead capture silently. |
| `SHOW_TRUST_STATS` | Set to `true` when you have real verified figures (units delivered, states served, etc.). Currently `false`. |
| `SHOW_TESTIMONIALS` | Set to `true` when you have real customer quotes with permission to publish. Currently `false`. |
| `PAYBACK_MONTH_CAP` | Hide payback figures beyond this many months (default: 60). |
| `TIGHT_FIT_THRESHOLD` | Battery usage percentage above which the "tight fit" badge shows (default: 0.85 = 85 %). |
| `NEAR_MISS_THRESHOLD` | How far over capacity counts as a near miss (default: 0.15 = 15 %). |

**Important:** Public keys (Paystack) are safe in the browser. Never put `sk_live_` or `sk_test_` (secret keys) in any file in this repository.

---

## Adding a product

1. Open `data/catalogue.js`.
2. Add a new object to the `products` array. Follow the existing pattern exactly.
3. Set the correct `tier`:
   - `"portable"` — portable power stations. Appears in the range section and calculator.
   - `"home-battery"` — large home batteries. Appears only in the "whole home system" strip.
   - `"cell"` — industrial cells. Never shown to visitors.
4. Set `calculatorEligible: true` only for portable power stations.
5. Set `acOutput: true` if the unit has an AC (mains) socket.
6. Download the product image to `assets/products/<slug>/hero.webp` (WebP preferred).
7. Set `imageWidth` and `imageHeight` to the actual pixel dimensions.
8. Run `npm test` to confirm nothing broke.

---

## Setting a price

1. Find the product in `data/catalogue.js` by its `slug`.
2. Change `price: null` to `price: 285000` (naira, no currency symbol, no commas).
3. Update `powerSpectrum[1].priceRange` and remove the `priceRangePlaceholder: true` flag once all portable prices are confirmed.
4. The calculator will automatically show the price, payback estimate, and checkout button.

---

## Adding product photos

1. Save the photo to `assets/products/<slug>/` as a `.webp` file (use Squoosh or cwebp to convert).
2. Add the relative path to the `images` array in the product's entry in `data/catalogue.js`.
3. Set `imageWidth` and `imageHeight` to the actual pixel dimensions of the image you saved.
4. Add `// TODO: confirm we have permission to use these images` above any image from a third-party site.

---

## Appliances (`data/appliances.js`)

Each appliance has:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique key. Used in presets and test fixtures. |
| `label` | string | Shown in the calculator UI. |
| `watts` | number | Typical running wattage. All values flagged `// TODO: confirm`. |
| `surgeMultiplier` | number | Peak draw = `watts * surgeMultiplier`. |
| `acRequired` | boolean | `true` = needs a mains AC socket. Excludes the Power Go. |
| `note` | string or null | Optional guidance shown below the appliance label. |

---

## Product tiers and what appears where

| Tier | Where it appears |
|---|---|
| `portable` | Range section, calculator, "Who it's for" cards |
| `home-battery` | "Need a whole home system?" strip at the end of the range section |
| `cell` | Nowhere (filtered out at every view) |

---

## Recommender logic (`js/recommend.js`)

The recommender is pure functions only (no DOM access). Import it in Node tests and in browser modules alike.

**Key formulas:**
```
energyNeedWh = 1.2 × sum( watts × qty × min(hours, outageHours) )
runningW     = sum( watts × qty )
peakW        = sum( watts × qty × surgeMultiplier )
needsAC      = any ticked appliance has acRequired = true
```

**A unit passes if all four pass:**
1. `needsAC` is false, or `product.acOutput` is true
2. `runningW <= product.maxOutputW`
3. `peakW <= (product.peakOutputW ?? product.maxOutputW)`
4. `energyNeedWh <= product.usableWh`

---

## Image assets

| Location | Used for |
|---|---|
| `assets/images/hero-bg.webp` | Hero section background |
| `assets/images/hithium-front.webp` | Legacy product photo (will be replaced) |
| `assets/images/og-image.webp` | Open Graph / social share image |
| `assets/products/itel-power-go/hero.webp` | Power Go product image |
| `assets/products/itel-power-go-pro/hero.webp` | Power Go Pro product image |
| `assets/products/itel-power-tank/hero.png` | Power Tank product image (convert to WebP) |
| `assets/products/itel-power-tank-1000/hero.webp` | Power Tank 1000 product image |

> **TODO: confirm we have permission to use the itel product images before going live.**

Use WebP format with explicit `width` and `height` attributes on `<img>` tags for best performance.

---

## Payment verification (future)

The checkout page redirects to `thank-you.html` after a successful Paystack callback. For a fully secure payment confirmation, you would need a serverless function that calls the Paystack Verify Transaction API using your **secret key** server-side.

When you are ready to add this:

1. Create `/api/verify.js` (for Vercel):
```js
export default async function handler(req, res) {
  const { reference } = req.body;
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );
  const data = await response.json();
  res.json({ status: data.data.status });
}
```
2. In `checkout.js`, in the `callback` function, replace the direct redirect with a `fetch('/api/verify', ...)` call, then redirect only on a `"success"` response.
3. Set `PAYSTACK_SECRET_KEY` as an environment variable in Vercel (never in code).

---

## Lead capture setup

### Google Apps Script (Google Sheets)
1. Create a Google Sheet.
2. Open Extensions → Apps Script.
3. Paste the following, then deploy as a web app (access: "Anyone"):
```js
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet()
    .appendRow([
      new Date(),
      data.source, data.product, data.price,
      data.appliances, data.outageHours
    ]);
  return ContentService.createTextOutput('ok');
}
```
4. Copy the web app URL into `LEAD_ENDPOINT` in `config.js`.

### Formspree
1. Create a form at [formspree.io](https://formspree.io).
2. Copy the form endpoint URL into `LEAD_ENDPOINT`.
