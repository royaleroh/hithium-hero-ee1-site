# Product photo sources

Downloaded from the supplier links in the original `data/products.json`, recovered
from Git baseline `d0563fb`. Original-size files were fetched from the same supplier
where the catalogue link requested a smaller preview. Runtime references are local
WebP files; the site does not hotlink these sources.

| Local file | Supplier source |
|---|---|
| itel-power-go/product.webp | https://i0.wp.com/itelsolar.com/wp-content/uploads/2026/01/itel-130W-Portable-Power-Station-%E2%80%93-320Wh-Smart-Backup-Power-Solution-IESS-320T.webp?fit=580%2C580&ssl=1 |
| itel-power-go-pro/product.webp | https://i0.wp.com/itelsolar.com/wp-content/uploads/2026/08/itel-Power-Go-Pro-320Wh-Portable-Power-Station-IESS-320ACT-200W-AC-Output-LiFePO4-Battery-100W-Solar-Charging.jpg?fit=482%2C544&ssl=1 |
| itel-power-tank/product.webp | https://itelsolar.com/wp-content/uploads/2026/08/power-tank-image-1.png |
| itel-power-tank-1000/product.webp | https://i0.wp.com/itelsolar.com/wp-content/uploads/2026/07/power-tank-1000-with-2000wh-lithium-battery-and-1000w-ac-output-can-draw-upto-to-1200w-PV-input.webp?fit=580%2C580&ssl=1 |
| ../images/itel-home-power.webp | https://itelsolar.com/wp-content/uploads/2026/10/itel-power-tank-1000w-with-2000wh.jpg |

Only format conversion and size reduction were applied to the image files.
`js/product-photo.js` and `css/product-results.css` provide consistent square frames
and CSS crops of the original photographs. The Power Tank frame excludes the lower
collage panels. The hero crop excludes the supplier poster's text. No product details
were synthesised or retouched. Each product keeps its own photo.

The original Power Tank `power-tank-mobile-image-1.png` and
`power-tank-mobile-image-2.png` links returned HTTP 404. Neither is used.

TODO: confirm we have permission to use these images.

Hithium manufacturer assets, checked 22 October 2026:

| Local file | Manufacturer source |
|---|---|
| hithium-heroee-1/product.webp | https://hithium.com/bocupload/2025/09/15/17579150328486wb1cm.png |
| hithium-heroee-light-1/product.webp | https://hithium.com/bocupload/2025/09/15/175791597094697z601.png |
| hithium-heroee-2/product.webp | https://hithium.com/bocupload/2025/09/15/17579161926487xxtew.png |

Hithium images were composited onto white, trimmed of surrounding blank space,
resized to at most 900 pixels and converted to WebP. Product pixels and logos
were not synthesised. Width and height in `data/hithium.js` match the local files.
