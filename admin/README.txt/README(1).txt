✅ Custom Designs LA – CMS Setup (Stable October 2025)

This folder powers the Netlify CMS admin panel at /admin.

IMPORTANT:
- Do NOT delete or rename config.yml
- Backend uses GitHub OAuth login for repo:
  Lamaro25/Customdesignsla-site (branch: main)
- Netlify Identity is disabled (deprecated)
- Login works only with "Log in with GitHub"

If the CMS ever fails to load:
1. Confirm backend: github is still in config.yml
2. Confirm repo and branch match above
3. Do NOT change netlify.toml redirects for /admin
4. Redeploy from main if changes are made
