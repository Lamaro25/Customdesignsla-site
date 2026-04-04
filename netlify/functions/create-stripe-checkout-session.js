const ALLOWED_PAYMENT_OPTIONS = new Set(["full", "deposit"]);

function readJsonBody(event) {
  if (!event.body) return null;

  try {
    return JSON.parse(event.body);
  } catch (_error) {
    return null;
  }
}

function toCents(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 100);
}

function sanitizeString(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}


function resolveStripeMode() {
  const mode = sanitizeString(process.env.STRIPE_MODE || "", 12).toLowerCase();
  if (mode === "test" || mode === "live") {
    return mode;
  }
  return "";
}

function getMissingStripeServerKeys() {
  const missing = [];

  if (!sanitizeString(process.env.STRIPE_SECRET_KEY, 200)) {
    missing.push("STRIPE_SECRET_KEY");
  }

  if (!sanitizeString(process.env.STRIPE_PUBLISHABLE_KEY, 200)) {
    missing.push("STRIPE_PUBLISHABLE_KEY");
  }

  if (!resolveStripeMode()) {
    missing.push("STRIPE_MODE");
  }

  return missing;
}

function buildStripeFormBody({ amountDueCents, productTitle, paymentOption, payload, customerEmail, successUrl, cancelUrl }) {
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);

  if (customerEmail) {
    params.set("customer_email", customerEmail);
  }

  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(amountDueCents));
  params.set("line_items[0][price_data][product_data][name]", productTitle);
  params.set(
    "line_items[0][price_data][product_data][description]",
    `${paymentOption === "deposit" ? "50% Deposit" : "Pay in Full"} · Custom ring checkout`
  );

  const metadata = {
    checkout_item_key: sanitizeString(payload.checkoutItemKey, 120),
    payment_option: paymentOption,
    payment_option_label: sanitizeString(payload.paymentOptionLabel, 40),
    sku: sanitizeString(payload?.draft?.sku, 80),
    collection: sanitizeString(payload?.draft?.collection, 80),
    ring_size: sanitizeString(payload?.draft?.ringSize, 40),
    customer_name: sanitizeString(payload?.customer?.fullName, 120),
    customer_phone: sanitizeString(payload?.customer?.phone, 50),
    shipping_name: sanitizeString(payload?.shipping?.fullName, 120),
    shipping_address1: sanitizeString(payload?.shipping?.address1, 120),
    shipping_address2: sanitizeString(payload?.shipping?.address2, 120),
    shipping_city: sanitizeString(payload?.shipping?.city, 80),
    shipping_state: sanitizeString(payload?.shipping?.state, 80),
    shipping_zip: sanitizeString(payload?.shipping?.zip, 20),
    shipping_country: sanitizeString(payload?.shipping?.country, 80),
    shippo_status: sanitizeString(payload.shippingQuoteStatus, 80)
  };

  Object.entries(metadata).forEach(([key, value]) => {
    if (value) {
      params.set(`metadata[${key}]`, value);
    }
  });

  return params;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const stripeSecretKey = sanitizeString(process.env.STRIPE_SECRET_KEY, 200);
  const stripeMode = resolveStripeMode();
  const missingServerKeys = getMissingStripeServerKeys();

  if (missingServerKeys.length) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Stripe server configuration is missing. Add ${missingServerKeys.join(", ")} in Netlify environment variables.`
      })
    };
  }

  const payload = readJsonBody(event);
  if (!payload || typeof payload !== "object") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid checkout payload." })
    };
  }

  const paymentOption = sanitizeString(payload.paymentOption, 20).toLowerCase();
  if (!ALLOWED_PAYMENT_OPTIONS.has(paymentOption)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid payment option." })
    };
  }

  const amountDueCents = toCents(payload.amountDueToday);
  if (!amountDueCents) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Amount due today must be greater than zero." })
    };
  }

  const productTitle = sanitizeString(payload?.draft?.productTitle || "Custom Ring", 120);
  const customerEmail = sanitizeString(payload?.customer?.email, 120);

  try {
    const origin = event.headers.origin || event.headers.referer || "https://customdesignsla.com";
    const safeOrigin = String(origin).replace(/\/$/, "");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: buildStripeFormBody({
        amountDueCents,
        productTitle,
        paymentOption,
        payload,
        customerEmail,
        successUrl: `${safeOrigin}/checkout/?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${safeOrigin}/checkout/?status=cancelled`
      })
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Unable to create Stripe checkout session." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        checkoutUrl: data.url,
        sessionId: data.id
      })
    };
  } catch (_error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unable to start Stripe checkout session." })
    };
  }
};
