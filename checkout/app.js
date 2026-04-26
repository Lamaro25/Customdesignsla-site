const checkoutApp = document.getElementById("checkout-app");
const CHECKOUT_STORAGE_KEY = "cdla_checkout_draft";
const CHECKOUT_SUBMISSION_KEY = "cdla_checkout_submission";
const LEGACY_CHECKOUT_FORM_STORAGE_KEY = "cdla_checkout_forms_by_item";
const CUSTOM_SYMBOL_UPLOAD_STORAGE_KEY = "cdla_custom_symbol_uploads";

const cartStore = window.CdlaCartStore;

const REQUIRED_FIELD_NAMES = [
  "customerName",
  "customerEmail",
  "shippingName",
  "address1",
  "city",
  "state",
  "zip"
];

const REQUIRED_SHIPPING_FIELD_NAMES = ["shippingName", "address1", "city", "state", "zip"];
const REQUIRED_PREVIEW_FIELD_NAMES = ["customerName", "customerEmail", "customerPhone"];

let checkoutDraft = null;
let shippingQuoteState = {
  status: "idle",
  amount: 0,
  message: ""
};
let lastShippingRequestSignature = "";
let shippingRequestDebounceTimer = null;
let stripeConfigStatus = {
  ready: false,
  loading: true,
  message: "Checking secure payment setup..."
};

function isPreviewRequestMode() {
  return String(checkoutDraft?.requestType || "").trim().toLowerCase() === "preview";
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return String(params.get(name) || "").trim();
}

function loadCheckoutDraftFromSession() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function loadLegacyCheckoutFormsByItem() {
  try {
    const raw = localStorage.getItem(LEGACY_CHECKOUT_FORM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function getActiveCheckoutItemKey() {
  return String(checkoutDraft?.cartItemId || getQueryParam("item") || "session-draft");
}

function getPersistedFormForActiveItem() {
  const activeItemKey = getActiveCheckoutItemKey();

  if (cartStore && typeof cartStore.getItemCheckoutState === "function") {
    const checkoutState = cartStore.getItemCheckoutState(activeItemKey);
    if (checkoutState) return checkoutState;
  }

  const legacyFormsByItem = loadLegacyCheckoutFormsByItem();
  return legacyFormsByItem[activeItemKey] || null;
}

function persistActiveCheckoutForm(formState) {
  const activeItemKey = getActiveCheckoutItemKey();
  const nextState = {
    ...formState,
    updatedAt: new Date().toISOString()
  };

  if (cartStore && typeof cartStore.setItemCheckoutState === "function") {
    cartStore.setItemCheckoutState(activeItemKey, nextState);
    return;
  }

  const legacyFormsByItem = loadLegacyCheckoutFormsByItem();
  legacyFormsByItem[activeItemKey] = nextState;
  localStorage.setItem(LEGACY_CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(legacyFormsByItem));
}

function migrateLegacyCheckoutFormIntoCartItem(itemId) {
  if (!itemId || !cartStore || typeof cartStore.getItemCheckoutState !== "function" || typeof cartStore.setItemCheckoutState !== "function") {
    return;
  }

  if (cartStore.getItemCheckoutState(itemId)) return;

  const formsByItem = loadLegacyCheckoutFormsByItem();
  const legacyState = formsByItem[itemId];
  if (!legacyState || typeof legacyState !== "object") return;

  cartStore.setItemCheckoutState(itemId, legacyState);
  delete formsByItem[itemId];
  localStorage.setItem(LEGACY_CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(formsByItem));
}

function hasValidCheckoutDraft(draft) {
  return Boolean(
    draft &&
      (draft.productTitle || draft.sku) &&
      Number.isFinite(Number(draft.totalPrice))
  );
}

function buildCheckoutDraftFromCartItem(item) {
  if (!item) return null;
  const customSymbolUpload = loadCustomSymbolUploadForItem(item.id);

  return {
    createdAt: item.createdAt || new Date().toISOString(),
    cartItemId: item.id,
    productTitle: item.productName,
    sku: item.sku,
    collection: item.collection,
    ringSize: item.ringSize,
    insideText: item.engravingInside,
    outsideText: item.engravingOutside,
    selectedSymbols: Array.isArray(item.symbols) ? item.symbols : [],
    customSymbolRequestSelected: Boolean(item.customSymbolDesignRequestSelected),
    customSymbolRequestDescription: item.customSymbolDesignDescription || "",
    customSymbolUploadFileName: customSymbolUpload.fileName || item.customSymbolUploadFileName || "",
    customSymbolUploadDataUrl: customSymbolUpload.dataUrl || item.customSymbolUploadDataUrl || "",
    orderNotes: item.orderNotes || "",
    customerNotes: item.customerNotes || "",
    baseRingPrice: Number(item.baseRingPrice || item.unitPrice || 0),
    priceBreakdown: Array.isArray(item.priceBreakdown) ? item.priceBreakdown : [],
    totalPrice: Number(item.unitPrice || 0),
    requestType: item.requestType === "preview" ? "preview" : "order",
    productImage: item.image || "",
    builderUrl: item.sourceUrl || "/ring-builder/"
  };
}

function loadCustomSymbolUploadForItem(itemId) {
  try {
    const raw = sessionStorage.getItem(CUSTOM_SYMBOL_UPLOAD_STORAGE_KEY);
    if (!raw) return { dataUrl: "", fileName: "" };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { dataUrl: "", fileName: "" };
    const record = parsed[String(itemId || "").trim()];
    if (!record || typeof record !== "object") return { dataUrl: "", fileName: "" };
    return {
      dataUrl: String(record.dataUrl || ""),
      fileName: String(record.fileName || "")
    };
  } catch (_error) {
    return { dataUrl: "", fileName: "" };
  }
}

function resolveCheckoutDraft() {
  const requestedItemId = getQueryParam("item");

  if (cartStore) {
    const selectedId = requestedItemId || cartStore.getSelectedItemId();
    const selectedItem = selectedId ? cartStore.getItemById(selectedId) : null;

    if (selectedItem) {
      migrateLegacyCheckoutFormIntoCartItem(selectedItem.id);
      cartStore.selectItem(selectedItem.id);
      return buildCheckoutDraftFromCartItem(selectedItem);
    }
  }

  return loadCheckoutDraftFromSession();
}

function getAmountDueToday() {
  if (!checkoutDraft) return 0;

  const total = Number(checkoutDraft.totalPrice || 0);
  const shippingAmount = shippingQuoteState.status === "success" ? Number(shippingQuoteState.amount || 0) : 0;
  return total + shippingAmount;
}

function buildSymbolsSummary() {
  const symbols = Array.isArray(checkoutDraft?.selectedSymbols) ? checkoutDraft.selectedSymbols : [];
  if (!symbols.length) return "None selected";

  return symbols
    .map(symbol => {
      const name = escapeHtml(symbol.name || symbol.id || "Symbol");
      return symbol.price ? `${name} (${formatMoney(symbol.price)})` : name;
    })
    .join(", ");
}

function renderMissingState() {
  checkoutApp.innerHTML = `
    <section class="checkout-shell">
      <div class="plaque card center-card">
        <h1>Review & Checkout</h1>
        <p class="muted">We couldn't find a selected cart item to review.</p>
        <p class="muted">Please choose an item from your cart or return to the builder.</p>
        <div class="missing-actions">
          <a class="primary-btn" href="/cart/">View Cart</a>
          <a class="primary-btn secondary-btn" href="/ring-builder/">Return to Builder</a>
        </div>
      </div>
    </section>
  `;
}

function renderCheckout() {
  if (!hasValidCheckoutDraft(checkoutDraft)) {
    renderMissingState();
    return;
  }

  const persisted = getPersistedFormForActiveItem();
  const persistedShippingQuote = persisted?.shippingQuote;

  if (persistedShippingQuote?.status === "success") {
    shippingQuoteState = {
      status: "success",
      amount: Number(persistedShippingQuote.amount || 0),
      message: ""
    };
  } else if (persistedShippingQuote?.status === "fallback") {
    shippingQuoteState = {
      status: "fallback",
      amount: 0,
      message: "Shipping will be calculated after checkout"
    };
  } else {
    shippingQuoteState = {
      status: "idle",
      amount: 0,
      message: ""
    };
  }

  const insideText = checkoutDraft.insideText?.trim() || "Not provided";
  const outsideText = checkoutDraft.outsideText?.trim() || "Not provided";
  const orderNotes = checkoutDraft.orderNotes?.trim() || "Not provided";
  const customSymbolStatus = checkoutDraft.customSymbolRequestSelected ? "Requested" : "Not requested";
  const previewMode = isPreviewRequestMode();
  const continueCopy = previewMode
    ? "Please confirm your customization details to request your free design preview."
    : "Please confirm your customization details before continuing to payment.";
  const submitButtonLabel = previewMode ? "Send Free Preview Request" : "Proceed to Payment";
  const confirmationLabel = previewMode
    ? "I confirm my customization details and contact information are correct."
    : "I confirm my customization details and shipping information are correct.";

  const priceBreakdownItems = Array.isArray(checkoutDraft.priceBreakdown) ? checkoutDraft.priceBreakdown : [];
  const baseBreakdownLines = priceBreakdownItems
    .filter(item => String(item?.source || "").toLowerCase() === "base")
    .map(item => `
      <li>
        <span>${escapeHtml(item.label || "Included Component")}</span>
        <strong>${formatMoney(item.amount)}</strong>
      </li>
    `)
    .join("");

  const customizationBreakdownLines = priceBreakdownItems
    .filter(item => String(item?.source || "").toLowerCase() !== "base")
    .map(item => `
      <li>
        <span>${escapeHtml(item.label || "Customization")}</span>
        <strong>${formatMoney(item.amount)}</strong>
      </li>
    `)
    .join("");

  const customizationSectionMarkup = customizationBreakdownLines || `
    <li>
      <span>No additional customization charges</span>
      <strong>${formatMoney(0)}</strong>
    </li>
  `;

  checkoutApp.innerHTML = `
    <section class="checkout-shell">
      <div class="plaque card header-card">
        <h1>${previewMode ? "Review & Free Preview Request" : "Review & Checkout"}</h1>
        <p class="muted">Reviewing cart item <strong>#${escapeHtml(checkoutDraft.cartItemId || "N/A")}</strong></p>
        <p class="muted">${continueCopy}</p>
        <p class="muted"><a class="returning-link" href="/order-code/">Returning Customer / Order Code</a></p>
      </div>

      <section class="plaque card">
        <h2>Design Summary</h2>
        <dl class="summary-grid">
          <div><dt>Product</dt><dd>${escapeHtml(checkoutDraft.productTitle || "Custom Ring")}</dd></div>
          <div><dt>SKU</dt><dd>${escapeHtml(checkoutDraft.sku || "N/A")}</dd></div>
          <div><dt>Collection</dt><dd>${escapeHtml(checkoutDraft.collection || "N/A")}</dd></div>
          <div><dt>Ring Size</dt><dd>${escapeHtml(checkoutDraft.ringSize || "N/A")}</dd></div>
          <div><dt>Inside Text</dt><dd>${escapeHtml(insideText)}</dd></div>
          <div><dt>Outside Text</dt><dd>${escapeHtml(outsideText)}</dd></div>
          <div><dt>Selected Symbols</dt><dd>${buildSymbolsSummary()}</dd></div>
          <div><dt>Custom Symbol Request</dt><dd>${customSymbolStatus}</dd></div>
          <div><dt>Custom Request Details</dt><dd>${escapeHtml(checkoutDraft.customSymbolRequestDescription || "Not provided")}</dd></div>
          <div><dt>Order Notes</dt><dd>${escapeHtml(orderNotes)}</dd></div>
        </dl>
      </section>

      <section class="plaque card">
        <h2>Price Breakdown</h2>

        <div class="pricing-group">
          <h3>Base Ring Price</h3>
          <ul class="breakdown-list">
            <li>
              <span>Base Ring Total</span>
              <strong>${formatMoney(checkoutDraft.baseRingPrice)}</strong>
            </li>
            ${baseBreakdownLines}
          </ul>
        </div>

        <div class="pricing-group">
          <h3>Customization Added</h3>
          <ul class="breakdown-list">
            ${customizationSectionMarkup}
          </ul>
        </div>

        <ul class="breakdown-list">
          <li class="total-line">
            <span>Final Total (before shipping)</span>
            <strong>${formatMoney(checkoutDraft.totalPrice)}</strong>
          </li>
        </ul>
      </section>

      <form id="checkout-form" class="checkout-form" novalidate>
        <section class="plaque card">
          <h2>Customer Information</h2>
          <div class="form-grid">
            <label>Full Name*
              <input type="text" name="customerName" autocomplete="name" value="${escapeHtml(persisted?.customer?.fullName || "")}" required />
            </label>
            <label>Email Address*
              <input type="email" name="customerEmail" autocomplete="email" value="${escapeHtml(persisted?.customer?.email || "")}" required />
            </label>
            <label>Phone Number
              <input type="tel" name="customerPhone" autocomplete="tel" value="${escapeHtml(persisted?.customer?.phone || "")}" ${previewMode ? "required" : ""} />
            </label>
          </div>
        </section>

        ${previewMode ? "" : `<section class="plaque card">
          <h2>Shipping Information</h2>
          <div class="form-grid">
            <label>Shipping Full Name*
              <input type="text" name="shippingName" autocomplete="shipping name" value="${escapeHtml(persisted?.shipping?.fullName || "")}" required />
            </label>
            <label>Address Line 1*
              <input type="text" name="address1" autocomplete="shipping address-line1" value="${escapeHtml(persisted?.shipping?.address1 || "")}" required />
            </label>
            <label>City*
              <input type="text" name="city" autocomplete="shipping address-level2" value="${escapeHtml(persisted?.shipping?.city || "")}" required />
            </label>
            <label>State / Region*
              <input type="text" name="state" autocomplete="shipping address-level1" value="${escapeHtml(persisted?.shipping?.state || "")}" required />
            </label>
            <label>ZIP / Postal Code*
              <input type="text" name="zip" autocomplete="shipping postal-code" value="${escapeHtml(persisted?.shipping?.zip || "")}" required />
            </label>
          </div>
        </section>`}


        ${previewMode ? "" : `<section class="plaque card">
          <h2>Final Summary / Amount Due Today</h2>
          <ul class="breakdown-list final-summary-list">
            <li><span>Product Total</span><strong>${formatMoney(checkoutDraft.totalPrice)}</strong></li>
            <li><span>Shipping</span><strong id="shipping-amount">$0.00</strong></li>
            <li class="total-line"><span>Amount Due Today</span><strong id="amount-due-today">${formatMoney(getAmountDueToday())}</strong></li>
          </ul>
        </section>`}

        <section class="plaque card action-card">
          <label class="confirm-row">
            <input type="checkbox" id="confirmation-checkbox" ${persisted?.confirmationAccepted ? "checked" : ""} required />
            <span>${confirmationLabel}</span>
          </label>
          <p id="shipping-status" class="muted integration-note" aria-live="polite"></p>
          <p id="form-success" class="success-note" aria-live="polite"></p>
          <p id="form-error" class="form-error" aria-live="polite"></p>
          <button id="proceed-to-payment-btn" class="primary-btn" type="submit">${submitButtonLabel}</button>
        </section>
      </form>
    </section>
  `;

  bindCheckoutEvents();
}


function syncStripeButtonReadiness(form) {
  const submitBtn = document.getElementById("proceed-to-payment-btn");
  if (!submitBtn) return;

  const hasRequiredFields = areRequiredFieldsComplete(form);
  const confirmationAccepted = Boolean(document.getElementById("confirmation-checkbox")?.checked);
  const canProceed = isPreviewRequestMode()
    ? hasRequiredFields && confirmationAccepted
    : hasRequiredFields && confirmationAccepted && stripeConfigStatus.ready && isShippingReadyForCheckout();

  submitBtn.disabled = !canProceed;
}

async function loadStripeConfigStatus(form) {
  try {
    const response = await fetch("/.netlify/functions/stripe-config", {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      stripeConfigStatus = {
        ready: false,
        loading: false,
        message: data.error || "Stripe configuration could not be verified. Please try again shortly."
      };
      return;
    }

    stripeConfigStatus = {
      ready: Boolean(data.ready),
      loading: false,
      message: data.message || "You will be securely redirected to Stripe to complete payment."
    };
  } catch (_error) {
    stripeConfigStatus = {
      ready: false,
      loading: false,
      message: "Stripe configuration could not be verified. Please refresh and try again."
    };
  } finally {
    syncStripeButtonReadiness(form);
  }
}

function getTrimmedValue(form, fieldName) {
  const element = form.elements.namedItem(fieldName);
  return element ? String(element.value || "").trim() : "";
}

function buildFormState(form) {
  return {
    checkoutItemKey: getActiveCheckoutItemKey(),
    customer: {
      fullName: getTrimmedValue(form, "customerName"),
      email: getTrimmedValue(form, "customerEmail"),
      phone: getTrimmedValue(form, "customerPhone")
    },
    shipping: {
      fullName: getTrimmedValue(form, "shippingName"),
      address1: getTrimmedValue(form, "address1"),
      city: getTrimmedValue(form, "city"),
      state: getTrimmedValue(form, "state"),
      zip: getTrimmedValue(form, "zip")
    },
    shippingQuote: {
      status: shippingQuoteState.status,
      amount: shippingQuoteState.amount
    },
    paymentOption: "full",
    confirmationAccepted: Boolean(document.getElementById("confirmation-checkbox")?.checked)
  };
}

function areRequiredFieldsComplete(form) {
  const requiredFields = isPreviewRequestMode() ? REQUIRED_PREVIEW_FIELD_NAMES : REQUIRED_FIELD_NAMES;
  return requiredFields.every(fieldName => Boolean(getTrimmedValue(form, fieldName)));
}

function isShippingReadyForCheckout() {
  if (isPreviewRequestMode()) return true;
  return shippingQuoteState.status === "success" || shippingQuoteState.status === "fallback";
}

function updateShippingSummary() {
  const shippingAmountEl = document.getElementById("shipping-amount");
  const amountDueEl = document.getElementById("amount-due-today");
  const shippingStatusEl = document.getElementById("shipping-status");

  if (shippingAmountEl) {
    if (shippingQuoteState.status === "success") {
      shippingAmountEl.textContent = formatMoney(shippingQuoteState.amount);
    } else if (shippingQuoteState.status === "fallback") {
      shippingAmountEl.textContent = "Shipping will be calculated after checkout";
    } else {
      shippingAmountEl.textContent = "$0.00";
    }
  }

  if (shippingStatusEl) {
    if (shippingQuoteState.status === "loading") {
      shippingStatusEl.textContent = "Calculating shipping...";
    } else {
      shippingStatusEl.textContent = shippingQuoteState.message || "";
    }
  }

  if (amountDueEl) amountDueEl.textContent = formatMoney(getAmountDueToday());
}

function getShippingPayload(form) {
  return {
    name: getTrimmedValue(form, "shippingName"),
    address: getTrimmedValue(form, "address1"),
    city: getTrimmedValue(form, "city"),
    state: getTrimmedValue(form, "state"),
    zip: getTrimmedValue(form, "zip"),
    items: [
      {
        name: checkoutDraft?.productTitle || "Custom Ring",
        quantity: 1,
        weight: Number(checkoutDraft?.shippingWeight || checkoutDraft?.weight || 0),
        dimensions: checkoutDraft?.shippingDimensions || checkoutDraft?.dimensions || null
      }
    ]
  };
}

function areRequiredShippingFieldsComplete(form) {
  return REQUIRED_SHIPPING_FIELD_NAMES.every(fieldName => Boolean(getTrimmedValue(form, fieldName)));
}

async function calculateShippingIfReady(form) {
  if (!areRequiredShippingFieldsComplete(form)) {
    shippingQuoteState = { status: "idle", amount: 0, message: "" };
    lastShippingRequestSignature = "";
    updateShippingSummary();
    updateProceedButtonState(form);
    return;
  }

  const payload = getShippingPayload(form);
  const requestSignature = JSON.stringify(payload);
  if (requestSignature === lastShippingRequestSignature) {
    updateProceedButtonState(form);
    return;
  }

  lastShippingRequestSignature = requestSignature;
  shippingQuoteState = { status: "loading", amount: 0, message: "" };
  updateShippingSummary();
  updateProceedButtonState(form);

  try {
    const response = await fetch("/api/calculate-shipping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Number.isFinite(Number(data.shipping_cost))) {
      throw new Error("shipping unavailable");
    }

    shippingQuoteState = {
      status: "success",
      amount: Number(data.shipping_cost),
      message: ""
    };
  } catch (_error) {
    shippingQuoteState = {
      status: "fallback",
      amount: 0,
      message: "Shipping will be calculated after checkout"
    };
  }

  updateShippingSummary();
  persistActiveCheckoutForm(buildFormState(form));
  updateProceedButtonState(form);
}

function scheduleShippingCalculation(form) {
  if (isPreviewRequestMode()) return;

  if (shippingRequestDebounceTimer) {
    window.clearTimeout(shippingRequestDebounceTimer);
  }

  shippingRequestDebounceTimer = window.setTimeout(() => {
    calculateShippingIfReady(form);
  }, 300);
}

function updateProceedButtonState(form) {
  syncStripeButtonReadiness(form);
}

function buildPreviewSubmissionPayload(form) {
  const customerName = getTrimmedValue(form, "customerName");
  const customerEmail = getTrimmedValue(form, "customerEmail");
  const customerPhone = getTrimmedValue(form, "customerPhone");
  const productName = String(checkoutDraft?.productTitle || "Custom Ring").trim();
  const sku = String(checkoutDraft?.sku || "").trim();
  const ringSize = String(checkoutDraft?.ringSize || "").trim();
  const insideText = String(checkoutDraft?.insideText || "").trim();
  const outsideText = String(checkoutDraft?.outsideText || "").trim();
  const symbols = buildSymbolsSummary();
  const notes = String(checkoutDraft?.customerNotes || "").trim();
  const estimatedTotal = formatMoney(checkoutDraft?.totalPrice || 0);
  const uploadedImageFilename = String(checkoutDraft?.customSymbolUploadFileName || "").trim();
  const uploadedImageDataUrl = String(checkoutDraft?.customSymbolUploadDataUrl || "").trim();

  return {
    customerName,
    customerEmail,
    customerPhone,
    productName,
    sku,
    ringSize,
    insideText,
    outsideText,
    symbols,
    notes,
    estimatedTotal,
    uploadedImageFilename,
    uploadedImageDataUrl
  };
}

function renderPreviewRequestSuccessState() {
  checkoutApp.innerHTML = `
    <section class="checkout-shell">
      <section class="plaque card center-card">
        <h1>Preview Request Sent</h1>
        <p>Your free preview request has been sent to CDLA.</p>
        <p>Please allow 3–5 business days for your custom preview to be created. We’ll contact you by text message using the phone number provided with your rendering and next steps.</p>
        <p>If your request includes custom artwork, logos, brands, or artwork cleanup, additional time or a small design fee may be required before the preview is created.</p>
        <p>Once you approve your preview, we’ll send your invoice before production begins and ship out a ring sizer after payment is received to confirm your final size.</p>
        <a class="primary-btn" href="/">Return Home</a>
      </section>
    </section>
  `;
}

function bindCheckoutEvents() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  const confirmationCheckbox = document.getElementById("confirmation-checkbox");
  const observedFields = form.querySelectorAll("input[name]");

  const persistAndRefreshButtonState = () => {
    persistActiveCheckoutForm(buildFormState(form));
    updateProceedButtonState(form);
  };


  observedFields.forEach(field => {
    field.addEventListener("input", () => {
      persistAndRefreshButtonState();
      scheduleShippingCalculation(form);
    });
    field.addEventListener("change", () => {
      persistAndRefreshButtonState();
      scheduleShippingCalculation(form);
    });
  });

  if (confirmationCheckbox) {
    confirmationCheckbox.addEventListener("change", persistAndRefreshButtonState);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const errorEl = document.getElementById("form-error");
    const successEl = document.getElementById("form-success");
    const confirm = document.getElementById("confirmation-checkbox");
    const submitBtn = document.getElementById("proceed-to-payment-btn");
    const previewMode = isPreviewRequestMode();

    const hasRequiredFields = areRequiredFieldsComplete(form);

    if (!previewMode && !stripeConfigStatus.ready) {
      if (errorEl) errorEl.textContent = stripeConfigStatus.message || "Secure payment setup is not ready. Please try again shortly.";
      updateProceedButtonState(form);
      return;
    }

    if (!previewMode && !isShippingReadyForCheckout()) {
      if (errorEl) errorEl.textContent = "Please wait for shipping to finish calculating before continuing.";
      updateProceedButtonState(form);
      return;
    }
    const emailField = form.elements.namedItem("customerEmail");
    const emailLooksValid = Boolean(emailField && emailField.checkValidity());

    if (!hasRequiredFields || !emailLooksValid || !confirm?.checked) {
      if (errorEl) {
        errorEl.textContent = "Please complete required fields and confirm your details before continuing.";
      }
      form.reportValidity();
      updateProceedButtonState(form);
      return;
    }

    if (errorEl) errorEl.textContent = "";
    if (successEl) successEl.textContent = "";

    const persistedFormState = buildFormState(form);
    persistActiveCheckoutForm(persistedFormState);

    const checkoutSubmission = {
      draft: checkoutDraft,
      checkoutItemKey: getActiveCheckoutItemKey(),
      customer: persistedFormState.customer,
      shipping: persistedFormState.shipping,
      paymentOption: "full",
      paymentOptionLabel: "Pay in Full",
      shippingQuoteStatus: shippingQuoteState.status,
      shippingAmount: Number(shippingQuoteState.amount || 0),
      amountDueToday: getAmountDueToday(),
      requestType: previewMode ? "preview" : "order",
      paymentStatus: previewMode ? "not-required-preview-request" : "initiating-stripe-checkout"
    };

    sessionStorage.setItem(CHECKOUT_SUBMISSION_KEY, JSON.stringify(checkoutSubmission));

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = previewMode ? "Sending Preview Request..." : "Redirecting to Stripe...";
    }

    if (errorEl) {
      errorEl.textContent = "";
    }

    const endpoint = previewMode ? "/.netlify/functions/submit-preview" : "/.netlify/functions/create-stripe-checkout-session";
    const requestPayload = previewMode ? buildPreviewSubmissionPayload(form) : checkoutSubmission;

    if (previewMode) {
      console.log("Preview request payload:", requestPayload);
    }

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || (previewMode ? "Unable to submit your free preview request." : "Unable to start Stripe checkout."));
        }

        if (previewMode) {
          renderPreviewRequestSuccessState();
          return;
        }

        if (!data.checkoutUrl) {
          throw new Error("Unable to start Stripe checkout.");
        }

        window.location.assign(data.checkoutUrl);
      })
      .catch(error => {
        if (errorEl) {
          errorEl.textContent = error.message || "We couldn't connect to Stripe. Please try again.";
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = previewMode ? "Send Free Preview Request" : "Proceed to Payment";
        }
      });
  });

  persistAndRefreshButtonState();
  updateShippingSummary();
  scheduleShippingCalculation(form);
  if (isPreviewRequestMode()) {
    syncStripeButtonReadiness(form);
  } else {
    loadStripeConfigStatus(form);
  }
}

function initCheckoutPage() {
  checkoutDraft = resolveCheckoutDraft();

  if (hasValidCheckoutDraft(checkoutDraft)) {
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutDraft));
  }

  renderCheckout();
}

initCheckoutPage();
