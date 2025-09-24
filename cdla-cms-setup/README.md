# CDLA CMS + Storefront Setup

This bundle includes:
- Full Netlify CMS config (`config.yml`)
- Rings CMS preview template
- Shared pricing calculator (`ring-pricing.js`)
- Example storefront HTML (`ring-template.html`)

## How to Use
1. Place `config.yml` in your Netlify CMS `admin/` folder.
2. Place `cms/` and `storefront/` into your repo.
3. Import `ring-pricing.js` into your storefront product template.
4. Netlify CMS will use the same pricing logic for previews.
5. Commit and push to GitHub → Netlify will rebuild automatically.
