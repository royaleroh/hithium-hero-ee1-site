# Stage C review

Stage C is complete. This is a copy pass, the shared technical disclosure, and the two requested hero removals. No new homepage redesign was started.

## 1. What changed

Removed the hero eyebrow and both floating cards. Centred the remaining content vertically and added the requested power-box explainer. Moved the old support line into the gap heading area.

Added `data/plain-language.js`, `js/plain.js` and `js/plain-sections.js`. The helper functions derive everyday examples, preset suitability and appliance exclusions. Model codes, specifications, charging details, formulas and glossary entries sit inside the same closed `<details class="tech">` component. Every summary reads "Technical details".

Updated calculator, featured product, existing four product fact cards, FAQ, checkout and confirmation copy. The recharge label now has its own heading margin and no overlapping bullet.

The recommender, catalogue, appliance figures, order-total functions and design-token file are byte-for-byte unchanged from the start of Stage C:

- js\recommend.js: unchanged
- data\catalogue.js: unchanged
- data\appliances.js: unchanged
- js\order.js: unchanged
- css\tokens.css: unchanged

The checkout script changed only its displayed summary. Browser checks completed the demo order with Lagos delivery: ₦285,000 + ₦3,000 = ₦288,000. No real payment or lead was sent. The WhatsApp and checkout actions retain their previous payloads.

## 2. Git

Actual `git diff --stat` output follows. It is cumulative uncommitted work from Stages A, B and C; it is not a Stage C-only count. Git excludes untracked new files and already-staged deletions from this command. No commit or staging operation was made in Stage C.

```text
README.md                                 | 253 ++++------------
 REFERENCE_NOTES.md                        |  47 +++
 STAGE_A_REVIEW.md                         |  41 +++
 STAGE_B_PART1_REVIEW.md                   |  90 ++++++
 assets/products/itel-power-tank/hero.webp | Bin 0 -> 47358 bytes
 checkout.html                             |  32 ++-
 config.js                                 |   9 +-
 css/base.css                              |  14 +-
 css/components.css                        |   2 +-
 css/sections.css                          |  22 +-
 css/stage-a.css                           | 127 ++++++++
 css/stage-b.css                           | 164 +++++++++++
 css/tokens.css                            |  63 ++--
 data/appliances.js                        |  18 +-
 data/catalogue.js                         |  45 +--
 data/presets.js                           |  14 +-
 index.html                                | 456 ++++++-----------------------
 js/brand.js                               |   8 +
 js/calculator-state.js                    |  50 ++++
 js/calculator-ui.js                       | 464 +++++++++---------------------
 js/checkout.js                            | 246 +++++-----------
 js/estimate.js                            |  14 +
 js/leads.js                               |   2 +-
 js/main-sections.js                       | 223 +++-----------
 js/main.js                                |   4 +-
 js/order.js                               |  12 +
 js/recommend.js                           |  55 ++--
 js/thank-you.js                           |  28 ++
 package.json                              |   6 +-
 references/sunvora.webp                   | Bin 0 -> 151448 bytes
 references/windora.webp                   | Bin 0 -> 150336 bytes
 tests/calculator-state.test.js            |  65 +++++
 tests/integration.test.js                 |  74 +++++
 tests/recommend.test.js                   |  91 ++----
 thank-you.html                            | 102 ++-----
 35 files changed, 1297 insertions(+), 1544 deletions(-)
```

Stage C's new, untracked files: `css/plain.css`, `data/plain-language.js`, `js/plain.js`, `js/plain-sections.js`, `tests/plain-language.test.js`, and this report. They must be included when this work is committed. Screenshots and QA records remain ignored development artifacts.

`git log --oneline`:

```text
d0563fb baseline before stage A
```

## 3. Screenshots

All viewport captures below are exactly 1440 by 900 or 390 by 844. Open technical details and FAQ content naturally continue below the viewport; full-section captures are linked afterwards.

| View | 1440 by 900 | 390 by 844 |
|---|---|---|
| Hero before | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/hero-before-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/hero-before-390.png) |
| Hero after | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/hero-after-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/hero-after-390.png) |
| Gap | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/gap-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/gap-390.png) |
| Calculator result | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/calculator-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/calculator-390.png) |
| Product, details closed | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/product-closed-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/product-closed-390.png) |
| Product, details open | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/product-open-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/product-open-390.png) |
| FAQ, answers open | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/faq-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/faq-390.png) |

Full sections, captured using the same browser viewport widths:

| Section | Desktop | Phone |
|---|---|---|
| product | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/full-product-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/full-product-390.png) |
| trust | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/full-trust-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/full-trust-390.png) |
| faq | [1440](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/full-faq-1440.png) | [390](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/full-faq-390.png) |

[Phone appliance editor](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/mobile-editor.png).

Visual review against Windora and Sunvora:

1. The hero keeps its photograph and existing composition, with the remaining text vertically centred.
2. The darker amber heading and light photo overlay make the text readable.
3. Disclosures use the references' quiet hairline borders and existing type scale.
4. The desktop dashboard and phone steps keep their existing layout; longer labels wrap without clipping.
5. Expanded technical tables need vertical scrolling on phones, with no horizontal overflow.

Default calculator panel heights: 645.6 px at 1440 and 708.4 px at 390. The extra plain explanation adds height without changing the grid. The phone result still fits in its viewport. No browser script errors or horizontal overflow were found at these widths. See [browser results](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/browser-report.json).

Hero contrast: the photograph is covered by rgba(251,248,243,0.90). Even over black image pixels, the calculated minimum is 4.81:1 for the darker amber word and 12.64:1 for the espresso text. Both exceed 4.5:1. Computed colours were checked at both widths in [contrast styles](/C:/Users/PC/Desktop/letitshinelandingpage/.screenshots/stage-c/contrast-styles.json). The stronger overlay is the contrast adjustment, not a new hero design.

## 4. Generated product language

Each equivalent is a separate example using a full charge. They do not run together for these durations. The first four supported examples appear in the requested order.

| Product | Good for | Will not run | Everyday equivalents |
|---|---|---|---|
| Power Go | No full preset passes; choose individual appliances. | Will not run: lights, fan, TV, monitor, decoder, speaker, fridge. They need a normal wall socket, and this one does not have one. | about 17 phone charges<br>about 22 hours of Wi-Fi<br>about 4 hours of laptop |
| Power Go Pro | No full preset passes; choose individual appliances. | Will not run: fridge. It needs more power at once than this box can give. | about 17 phone charges<br>about 22 hours of Wi-Fi<br>about 6 hours of four lights<br>about 5 hours of fan |
| Power Tank | Students, Shops and stalls, Events | Nothing on the appliance list is excluded individually. | about 55 phone charges<br>about 2 days of Wi-Fi<br>about 20 hours of four lights<br>about 16 hours of fan |
| Power Tank 1000 | Students, Remote workers, Shops and stalls, Families, Events | Nothing on the appliance list is excluded individually. | about 111 phone charges<br>about 5 days of Wi-Fi<br>about 41 hours of four lights<br>about 33 hours of fan |

The Power Tank TV example also calculates to "about 10 hours of TV" and passes its test. It is the fifth supported example, so it is not displayed under the four-line limit. Power Go's monitor is included in its blocked list because the appliance data says it needs a wall socket.

Lifespan lines:

- Power Go: Rated for 3,000 full charges, which is about 8 years of charging once a day. (maker's rating)
- Power Go Pro: Rated for 6,000 full charges, which is about 16 years of charging once a day. (maker's rating)
- Power Tank: Rated for 6,000 full charges, which is about 16 years of charging once a day. (maker's rating)
- Power Tank 1000: Rated for 6,000 full charges, which is about 16 years of charging once a day. (maker's rating)

The other catalogue entries are excluded from these portable appliance examples. Home batteries need a separate inverter; cells stay hidden. Their generated Good for and everyday lists are empty, and Will not run is empty rather than guessing inverter support:

| Product | Tier | Good for | Will not run | Everyday equivalents |
|---|---|---|---|---|
| ARKVOLT L16 | home-battery | Empty | Empty, not assessed | Empty |
| ARKVOLT L16S | home-battery | Empty | Empty, not assessed | Empty |
| ARKVOLT F8S | home-battery | Empty | Empty, not assessed | Empty |
| ARKVOLT R30 | home-battery | Empty | Empty, not assessed | Empty |
| ESS Cell 314Ah | cell | Empty | Empty, not assessed | Empty |
| Infinity Cell 587Ah | cell | Empty | Empty, not assessed | Empty |
| Infinity Cell 1175Ah | cell | Empty | Empty, not assessed | Empty |
| Infinity Cell 1300Ah | cell | Empty | Empty, not assessed | Empty |
| Infinity Cell N162Ah | cell | Empty | Empty, not assessed | Empty |

## 5. Lint output and limits

The lint reads the three HTML files, plain-language data, preset copy and generated helper content. It also renders the actual JavaScript output across every preset, tight, near-miss, none, priced, checkout and confirmation states. It excludes full nested `.tech` and `data-level="technical"` subtrees, scripts and styles. Alt text, accessible labels and placeholders are included. Technical catalogue fields remain unchanged and are checked where they render.

The full run below reports zero banned terms outside technical disclosures. No banned term was left in the plain text. It reports five sentence warnings above 15 words and no failures above 20; the warnings are the requested wording or catalogue-derived lines. The source images were not OCR-tested; existing supplier images were kept unchanged.

## 6. What needs confirmation or differs from an example

- The wall-only "about 2 hours" claim was not used. The catalogue times combined wall and solar charging. The page explains combined charging and asks visitors to check the wall-only time.
- Families' actual full simultaneous draw gives about 7 hours, rounded down. It does not justify the example's 12 hours. Its original daily-hours selection still fits the eight-hour outage window.
- Power Tank's existing cycle figure is 6,000+, giving about 16 years of daily charging in the maker's rating. It does not justify replacing that line with the example's eight years.
- The phone battery assumption remains 15 in `PHONE_CHARGE_WH`, with the requested TODO. The quiet-office comparison also has the requested TODO in `data/plain-language.js`.
- No new photos, product data changes, token changes, recommender changes, payment verification work or new section redesign were included.
- Copy-lint tests require Playwright as a development tool, with Chromium or installed Edge. They use the bundled runtime here. The site itself still has no npm dependency or build step.

## 7. Full node --test output

```text
✔ calculator starts with exactly the Families preset and a real result (3.9792ms)
✔ preset loading replaces the previous selection without mutating preset data (0.3133ms)
✔ Custom and Clear all provide an empty selection with an empty spend field (0.3273ms)
✔ hours steppers advance one hour and clamp to 1 through 24 (0.6553ms)
✔ empty spend does not calculate payback or produce a zero-currency display (0.4218ms)
✔ typed spend produces payback only for a priced unit (3.8484ms)
✔ mobile step transitions stay within Who, What and Your unit (0.6025ms)
✔ tile toggles and quantity edits retain a stable appliance identity (0.2977ms)
✔ audit input: student (2.0483ms)
✔ audit input: shop (0.7008ms)
✔ audit input: fridge (0.2337ms)
✔ audit input: large load (0.2365ms)
✔ audience and calculator agree: students (5.7868ms)
✔ audience and calculator agree: remote-workers (0.2454ms)
✔ audience and calculator agree: shops (0.1913ms)
✔ audience and calculator agree: families (0.1803ms)
✔ audience and calculator agree: events (0.304ms)
✔ audience and calculator agree: custom (0.2308ms)
✔ near miss works without IDs and cuts only the targeted row (0.3793ms)
✔ defaults come from catalogue exports (0.1866ms)
✔ Lagos total includes the real catalogue delivery fee (0.2171ms)
✔ Other states and unknown states use the fallback fee (0.2127ms)
✔ checkout requires a priced, available portable unit (0.1441ms)
✔ WhatsApp message includes model, price, appliances and outage hours (3.6699ms)
✔ WhatsApp null price and whole home wording (0.4053ms)
✔ tight state returns a passing room-to-grow unit (0.3366ms)
✔ payback cannot round to zero and is capped at 60 months (0.2125ms)
✔ near-miss chooses the smallest power-capable unit at equal capacity (0.3272ms)
Jargon lint: 4715 plain-copy samples; 0 banned terms. Technical disclosures excluded.
Sentence lint: 0 failures; 5 warnings above 15 words.
index.html (16 words): A power bank that charges a phone, or a big, costly system for the whole house.
data/plain-language.js (17 words): The smallest one that does the job, so you do not pay for more than you need.
rendered home (16 words): Runs four lights, a fan and your Wi-Fi all night, about 8 hours, on one charge.
rendered home (16 words): Rated for 3,000 full charges, which is about 8 years of charging once a day.
rendered home (16 words): Rated for 6,000 full charges, which is about 16 years of charging once a day.
✔ Power Tank worked examples include fan, Wi-Fi, four lights and TV (11461.9155ms)
✔ Power Go examples exactly match the brief and exclude wall-socket appliances (0.2577ms)
✔ every displayed equivalent passes socket, running and starting-power checks (0.4932ms)
✔ goodFor checks each full preset with the real recommender (0.588ms)
✔ wontRun includes every Power Go wall-socket appliance and nothing for Tank 1000 (0.3032ms)
✔ lifespan uses the lowest range figure and always marks the maker rating (0.8893ms)
✔ duration uses the requested hour and day buckets, rounding down (0.1965ms)
✔ all reusable technical disclosures are collapsed with the same label (1.8323ms)
✔ jargon lint: HTML and rendered plain-copy strings exclude every banned term (7.1589ms)
✔ sentence lint: no plain sentence exceeds 20 words; warn above 15 (5.948ms)
▶ Test 1 - Student, all DC-friendly
  ✔ energyNeedWh is 237.6 (1.2013ms)
  ✔ runningW is 87 (0.222ms)
  ✔ peakW is 87 (0.1629ms)
  ✔ needsAC is false (0.1879ms)
  ✔ recommend returns state fit (0.5875ms)
  ✔ best fit is Power Go (0.2185ms)
  ✔ usage is approximately 74 % (0.2402ms)
✔ Test 1 - Student, all DC-friendly (4.5052ms)
▶ Test 2 - Shop with a near miss
  ✔ energyNeedWh is 1,075.2 (0.4869ms)
  ✔ runningW is 122 (0.2345ms)
  ✔ peakW is 172 (0.2099ms)
  ✔ needsAC is true (0.1388ms)
  ✔ Power Go fails (no-ac) (0.1118ms)
  ✔ Power Go Pro fails (battery-too-small) (0.0939ms)
  ✔ Power Tank fails (battery-too-small only) (0.0958ms)
  ✔ Power Tank 1000 passes all checks (0.0803ms)
  ✔ recommend best fit is Power Tank 1000 (0.6449ms)
  ✔ recommend state is near-miss (Power Tank is near miss) (0.3808ms)
  ✔ near-miss trim reduces the fan by 2 hours (2.6716ms)
✔ Test 2 - Shop with a near miss (6.0549ms)
▶ Test 3 - Surge excludes Power Go Pro
  ✔ energyNeedWh is 216 (0.349ms)
  ✔ runningW is 90 (0.1447ms)
  ✔ peakW is 270 (0.0916ms)
  ✔ Power Go fails (no-ac) (0.1265ms)
  ✔ Power Go Pro fails (peak-too-low) (0.1543ms)
  ✔ Power Tank passes all checks (0.1178ms)
  ✔ recommend best fit is Power Tank (0.1849ms)
  ✔ recommend state is fit (0.2501ms)
✔ Test 3 - Surge excludes Power Go Pro (1.7239ms)
▶ Test 4 - Too big, whole home system
  ✔ energyNeedWh is 3264 (0.1757ms)
  ✔ Power Tank 1000 fails (battery-too-small) (0.1884ms)
  ✔ recommend state is none (0.2208ms)
  ✔ noReason is a non-empty string (0.1564ms)
  ✔ closestUnit is the largest portable unit (0.1442ms)
✔ Test 4 - Too big, whole home system (1.1099ms)
▶ Test 5 - Zero appliances
  ✔ empty selections returns state empty (0.1968ms)
  ✔ zero qty returns state empty (0.4161ms)
  ✔ zero hours returns state empty (0.2321ms)
  ✔ does not throw for empty input (0.4175ms)
  ✔ energyNeedWh is 0 for empty selections (0.1535ms)
✔ Test 5 - Zero appliances (1.7232ms)
▶ Test 6 - Null price never produces payback
  ✔ computePayback with null price returns null months (0.1392ms)
  ✔ computePayback with null price returns null label (0.1017ms)
  ✔ recommend with a null-priced best fit returns null payback months (0.1559ms)
✔ Test 6 - Null price never produces payback (0.5745ms)
▶ runtimeLabel helper
  ✔ returns "no runtime" for zero (0.2068ms)
  ✔ returns "less than 1 hour" for 0.5 (0.1357ms)
  ✔ returns "about 1 hour" for 1 (0.0718ms)
  ✔ returns "about 1 night" for 18 (0.1185ms)
  ✔ returns "about 2 days" for 48 (0.0896ms)
✔ runtimeLabel helper (0.7939ms)
▶ deriveLoad - outage hours cap
  ✔ caps hours at outageHours if appliance is used longer (0.1586ms)
  ✔ does not cap hours if appliance hours <= outageHours (0.095ms)
✔ deriveLoad - outage hours cap (0.3396ms)
ℹ tests 84
ℹ suites 8
ℹ pass 84
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 12219.5735
```
