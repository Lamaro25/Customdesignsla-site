Ring & Charm Builder - Custom Designs LA
---------------------------------

Version: v6.17

Summary:
- CMS-style JSON integration for product collections.
- Products (names + images) now load dynamically from /data/rings.json and /data/charms.json.
- Easy to update collections without editing app.js code.
- Preserves all previous features: polished UI, assets for images, pricing, engraving, metals, add-ons.

Changelog:
v6.17
- Added /data folder with rings.json and charms.json.
- Builder now fetches JSON and populates collections dynamically.
- Simplified product updates: edit JSON instead of JavaScript.

v6.16
- Polished UI styling for a professional look (modern fonts, shadows, hover effects).
- Improved mobile responsiveness with breakpoints for smaller screens.
- Header and footer added for brand identity.

v6.15
- Set up /assets folder for real product photos.
- Updated product collections to load local image files.
- Product images now primary in cards; placeholder used if missing.

... (earlier changelog entries remain) ...

Deployment Instructions:
1. Unzip this folder.
2. Upload/extract into your Netlify (or local) project repo.
3. Place product photos in the /assets subfolders.
4. Update /data/rings.json and /data/charms.json to control product names and images.
5. Deploy — builder will now pull product info dynamically.

Next Updates:
- Extend JSON to include pricing metadata (heights, sizes, add-ons).
- Prepare for CMS or database integration for full e-commerce flow.
