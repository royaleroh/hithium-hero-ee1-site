# Stage B, Part 1

Part 1 is complete. Part 2 has not started.

## Git

`git log --oneline` contains `d0563fb baseline before stage A`.
Stage A was left uncommitted, so `git diff --stat` includes both stages. Full output is saved in `.screenshots/stage-b/git-stat.txt`.
No new commit was created. The recommender, catalogue, appliance data and order/checkout/confirmation JavaScript match their pre-Part-1 SHA256 hashes.

## Tests

`node --test`: 74 tests passed, zero failed. Full output is saved in `.screenshots/stage-b/test-output.txt`.
Added coverage checks Families on load, exact preset replacement, Custom/Clear all, whole-hour limits, empty spend without payback, typed spend, mobile step boundaries and tile identity.
Browser checks cover the three mobile steps, real control changes, keyboard toggling with retained focus, near-miss and none results, all ten appliances selected, target sizes and unchanged Lagos checkout totals.

## Captures

All files below are in `.screenshots/stage-b/`.

| View | Desktop 1440 by 900 | Mobile 390 by 844 |
|---|---|---|
| Default | desktop-default.png | mobile-step-1.png |
| Appliances | desktop-default.png | mobile-step-2.png |
| Selected tile editor | desktop-default.png | mobile-step-2-editor.png |
| Default result | desktop-default.png | mobile-step-3.png |
| Priced result | desktop-priced.png | mobile-priced.png |
| Near miss | desktop-near-miss.png | mobile-near-miss.png |
| None | desktop-none.png | mobile-none.png |

Reference boards: `comparison-desktop.png`, `comparison-mobile-steps.png`, `comparison-near-miss.png`, `comparison-none.png`.

## Five-line critiques

### Default desktop against Windora

1. The inset warm shell and white result card carry the dashboard's surface hierarchy.
2. One medium-weight geometric typeface replaces the earlier serif emphasis and heavy headings.
3. Five-by-two tiles make the appliance list a bounded composition rather than a long form.
4. The large percentage follows Sunvora's numeral hierarchy while the missing price stays quiet.
5. The remaining homepage layouts still need Part 2; shared tokens alone do not finish that composition.

### Mobile steps against Windora and Sunvora

1. Numbered progress keeps each screen focused on one decision.
2. The same warm shell, white surfaces and fine borders continue through all three steps.
3. A single open selected-tile editor keeps quantity and hours controls at 44 pixel targets.
4. The bottom recommendation and Next action stay visible while appliances are changed.
5. Editing expands one grid row; neighbouring tiles stay aligned rather than using a separate scrolling list.

### Near miss against the reference dashboard

1. The trim suggestion is a short line within the existing result composition.
2. The product photo remains small and the battery percentage retains visual priority.
3. Price on request stays in espresso text instead of becoming a large amber warning.
4. The WhatsApp action is the only large amber element in the result.
5. The source photography is unchanged in this part, as the image cleanup belongs to Part 2.

### None against the reference dashboard

1. The result keeps the same frame and spacing instead of switching to an error-style panel.
2. A short reason and closest-unit runtime explain the next step without a large warning block.
3. The whole-home action remains a normal primary button.
4. Neither checkout nor a fabricated price is shown.
5. The portable photograph is explicitly contextualised as the closest portable unit, not a whole-home system photograph.

## Measured heights

| State | Panel height in pixels |
|---|---:|
| Desktop default | 572.8 |
| Desktop priced result with both actions | 625.8 |
| Desktop near miss | 601.3 |
| Desktop none | 621.8 |
| Mobile 01 Who | 590.4 |
| Mobile 02 What | 620.0 |
| Mobile selected-tile editor | 713.0 |
| Mobile 03 Your unit | 635.6 |
| Mobile priced result with both actions | 744.6 |
| Mobile near miss | 664.1 |
| Mobile none | 570.5 |
| Mobile all ten selected, one editor open | 713.0 |

Each measured panel fits below the header in its requested viewport, with workings collapsed. There is no internal scrolling or horizontal overflow. Visible button targets are at least 44 by 44 pixels. Browser errors: zero.

## Scope and trade-off

Mobile selected tiles show summaries and reveal one tile's two steppers through Edit, rather than displaying all selected tiles' steppers simultaneously. This is the deliberate layout trade-off that preserves both the one-screen limit and usable tap targets.
The original five presets are unchanged; Custom was added. Families uses 1171.2 Wh with losses and recommends Power Tank 1000 at 58.6 percent usage.
Part 2's hero/gap/range/details/FAQ/footer compositions, photo cleanup and Lighthouse audit await approval. Recommender logic, product data and checkout behaviour were not changed.
