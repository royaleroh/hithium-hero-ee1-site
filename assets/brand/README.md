# Brand assets

Supplied by the site owner on 22 October 2026:

- `bareLogo.png`: transparent standalone mark, used beside the site name in page headers.
- `1barelogo.png`: full wordmark, used in the footer on its original white background.
- `1barefavicon.png`: standalone mark on white, used for browser and Apple touch icons.

Production copies trim excess canvas and reduce dimensions only. The artwork,
colours and lettering are preserved. The source files remain in the owner's
Pictures folder. PNG keeps the supplied transparency on the header mark.

`css/brand.css` sizes the assets and preserves their proportions. Header marks
have empty alt text because the adjacent brand text and home-link label supply
their accessible name. The footer wordmark includes its full brand and tagline
as alt text. All three HTML pages link the 32- and 192-pixel favicons and the
180-pixel Apple touch icon.

Visual review at 1440, 390 and 360 pixels:

1. The header mark stays readable beside the short site name.
2. Removing the amber placeholder background keeps the supplied logo colours clear.
3. The full wordmark retains its white backing against the dark footer.
4. Both marks preserve their proportions and leave room for the mobile menu.
5. The confirmation and checkout headers use the same mark as the homepage.

All 111 existing tests pass. Browser checks confirm loaded branding and no
horizontal overflow on all three pages. Screenshots are saved under ignored
`.screenshots/brand-*`.
