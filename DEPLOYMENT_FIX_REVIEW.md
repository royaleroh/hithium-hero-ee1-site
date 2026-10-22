# Deployment repair

The remote merge replaced the product image and footer opening markup in
`index.html`, leaving `buildProductSection()` to write into a missing element.
The resulting exception prevented product cards and delivery fees from rendering.
The consultation markup also lacked styles and handlers.

Restored the product grid and complete footer, guarded the optional photo frame,
and added a separate styled consultation form. Native validation runs before
WhatsApp opens. The order action reads current catalogue values and uses the
existing checkout guard and session format. Hardcoded promotional prices and
emoji were removed. Existing remote history was preserved.

Validation: 111 tests pass. New browser regression checks cover complete sections,
rendering when the optional photo frame is missing, required fields, WhatsApp
message contents, and catalogue-derived checkout totals. Visual checks passed
at 1440, 390 and 360 pixels with seven cards, populated delivery rows, labelled
48-pixel controls, no page overflow and no browser errors. No live payments or
consultation messages were sent during testing.

Five-line visual critique:

1. The consultation heading is centred and wraps into balanced lines.
2. Two columns on desktop become readable full-width cards on phones.
3. Full-width action labels needed centring; explicit flex alignment fixes that.
4. Inputs use 16-pixel type to avoid automatic mobile-browser zoom.
5. The restored dark footer gives its light text a legible background again.

Screenshots are under ignored `.screenshots/`: `consultation-fixed-*`,
`footer-fixed-*`, `range-fixed-*` and `site-fixed-*`.
