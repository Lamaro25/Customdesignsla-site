# Custom Designs LA — V6.26

## What's new
- Calculators (Ring + Charm/Pendant) now accept **URL defaults** so product detail pages can open them **pre-filled**.
- Added **live total** and **line-item price breakdown** that updates in real time.
- Included **Reset to Defaults** and **Save My Customization** (downloads a JSON summary).
- Detail pages for example products link to calculators with sensible defaults pre-selected.

## How to use
- Link to the calculators with query params:
  - Ring: `ring_calculator.html?product=NAME&band_height=small|medium|large&band_style=flat|domed|apex&cuban_small=1&channel=1&engrave_inside=2...`
  - Charm: `charm_calculator.html?product=NAME&size=penny|dime|...&design_fee=25&engraving_words=2&beading=1...`

- You can keep defaults in CMS and render links accordingly, or paste links manually for now.

## Next
- If you'd like, we can wire Netlify CMS entries to **auto-generate these calculator links** so you never have to touch code.
