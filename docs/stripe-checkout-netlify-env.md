# Stripe checkout environment configuration (Netlify)

Configure these Netlify environment variables in **Site configuration → Environment variables** for each deploy context (Production, Branch deploys, Deploy previews):

- `STRIPE_PUBLISHABLE_KEY`
  - Client-safe key for browser use only.
  - Example format: `pk_test_...` in test mode.
- `STRIPE_SECRET_KEY`
  - Server-only key used by `netlify/functions/create-stripe-checkout-session.js`.
  - Never expose in client code.
  - Example format: `sk_test_...` in test mode.
- `STRIPE_MODE`
  - Set to `test` for current integration.
  - Accepted values in function logic: `test` or `live`.

## Current wiring

- Frontend first audits Stripe readiness via `/.netlify/functions/stripe-config`, then handoff posts to `/.netlify/functions/create-stripe-checkout-session`.
- Serverless functions validate `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_MODE` from Netlify runtime environment (without exposing secret values client-side).
- No Stripe keys are hardcoded in repository files.

## Optional local development

When using Netlify CLI, place environment values in a local `.env`/Netlify env source (do not commit secrets):

```bash
STRIPE_MODE=test
STRIPE_PUBLISHABLE_KEY=pk_test_local_placeholder
STRIPE_SECRET_KEY=sk_test_local_placeholder
```

The placeholders above are examples only.
