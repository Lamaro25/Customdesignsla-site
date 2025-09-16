Ring & Charm Builder - Custom Designs LA
---------------------------------

Version: v6.15

Summary:
- Integrated real image file paths for all products (rings & charms).
- Added /assets folder structure for product photos (rings/cuban, western, faith; charms/cuban, western, faith, medical).
- Product cards show real product images (fallbacks to placeholder if missing).
- Maintains all features from v6.14: engraving, metals, pricing ladder, expanded add-ons.

Changelog:
v6.15
- Set up /assets folder for real product photos.
- Updated product collections to load local image files.
- Product images now primary in cards; placeholder used if missing.

v6.14
- Expanded add-ons: Rope Twist, Cuban Weave Tight, Cuban Weave Loose.
- Added placeholder product images for all rings and charms.
- Enhanced product cards with image previews.

v6.13
- Integrated engraving inputs (inside & outside text).
- Engraving price calculated at $5 per word.
- Added metal selector with costs for Gold, Rose Gold, and Platinum.
- Price updates live with engraving and metal selections.

v6.12
- Pricing ladder implemented for rings and charms.
- Base design fee included ($25).
- Add-ons integrated with checkbox selections.
- Total price displayed dynamically.

v6.11
- Added charm collections with dropdown (Cuban, Western, Faith, Medical).
- Added mode toggle between Ring Builder and Charm Builder.
- Each charm collection has 6 placeholder products.
- Ring and charm previews share the same color selector.

v6.10
- Added dropdown for ring collections (Cuban, Western, Faith).
- Cuban Link Rings use real product names.
- Western and Faith collections scaffolded with placeholders.
- Product grid with previews and names.

v6.9
- Ring color-changing functionality (silver, gold, rose/pink, black).
- Live preview panel showing the selected color.
- Clean modular structure (index.html, styles.css, app.js).

Deployment Instructions:
1. Unzip this folder.
2. Upload/extract into your Netlify (or local) project repo.
3. Place your product photos in the /assets subfolders (e.g., assets/rings/cuban/cuban-original.jpg).
4. Ensure filenames match the code references in app.js.
5. Deploy — updated builder will show your real photos.

Next Updates:
- Polish UI styling for mobile responsiveness.
- Integrate with CMS to load product data dynamically.
- Begin preparing customer-facing launch version.
