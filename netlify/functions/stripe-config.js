function sanitizeString(value, maxLength = 200) {
  return String(value || "").trim().slice(0, maxLength);
}

function resolveStripeMode() {
  const mode = sanitizeString(process.env.STRIPE_MODE || "", 12).toLowerCase();
  if (mode === "test" || mode === "live") {
    return mode;
  }
  return "";
}

function getMissingKeysSummary() {
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

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const missingKeys = getMissingKeysSummary();

  if (missingKeys.length) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        ready: false,
        message: `Stripe server configuration is missing. Add ${missingKeys.join(", ")} in Netlify environment variables.`
      })
    };
  }

  const stripeMode = resolveStripeMode();

  return {
    statusCode: 200,
    body: JSON.stringify({
      ready: true,
      mode: stripeMode,
      message: `Secure Stripe checkout is ready (${stripeMode} mode).`
    })
  };
};
