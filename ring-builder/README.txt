Ring & Charm Builder - Custom Designs LA
---------------------------------

Version: v6.18

Summary:
- Pricing system now fully JSON-driven.
- Added /data/pricing.json controlling design fee, engraving price, band heights, charm sizes, metals, and add-ons.
- All pricing pulled dynamically from JSON (no code edits needed).
- Preserves all features from v6.17: CMS-style JSON for products, polished UI, assets for images.

Changelog:
v6.18
- Introduced /data/pricing.json file.
- Builder now fetches pricing dynamically.
- Editing pricing is as simple as updating JSON.

v6.17
- Added /data folder with rings.json and charms.json.
- Builder now fetches JSON and populates collections dynamically.
- Simplified product updates: edit JSON instead of JavaScript.

v6.16
- Polished UI styling for a professional look (modern fonts, shadows, hover effects).
- Improved mobile responsiveness with breakpoints for smaller screens.
- Header and footer added for brand identity.

... (earlier changelog entries remain) ...

Deployment Instructions:
1. Unzip this folder.
2. Upload/extract into your Netlify (or local) project repo.
3. Place product photos in the /assets subfolders.
4. Update /data/rings.json, /data/charms.json, and /data/pricing.json to control products and pricing.
5. Deploy — builder will now pull products and pricing dynamically.

Next Updates:
- Add-to-Cart / Wishlist mockup (UX only, no checkout).
- Prepare for CMS admin panel integration.
