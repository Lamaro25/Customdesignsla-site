const checkoutApp = document.getElementById("checkout-app");
const CHECKOUT_STORAGE_KEY = "cdla_checkout_draft";
const CHECKOUT_SUBMISSION_KEY = "cdla_checkout_submission";
const LEGACY_CHECKOUT_FORM_STORAGE_KEY = "cdla_checkout_forms_by_item";

const cartStore = window.CdlaCartStore;

const REQUIRED_FIELD_NAMES = [
  "customerName",
  "customerEmail",
  "shippingName",
  "address1",
  "city",
  "state",
  "zip",
  "country"
];

let checkoutDraft = null;
let selectedPaymentOption = "full";
let stripeConfigStatus = {
  ready: false,
  loading: true,
  message: "Checking secure payment setup..."
};

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
    orderNotes: item.orderNotes || "",
    baseRingPrice: Number(item.baseRingPrice || item.unitPrice || 0),
    priceBreakdown: Array.isArray(item.priceBreakdown) ? item.priceBreakdown : [],
    totalPrice: Number(item.unitPrice || 0),
    productImage: item.image || "",
    builderUrl: item.sourceUrl || "/ring-builder/"
  };
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
  return selectedPaymentOption === "deposit" ? total * 0.5 : total;
}

function getPaymentOptionLabel() {
  return selectedPaymentOption === "deposit" ? "50% Deposit" : "Pay in Full";
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
  selectedPaymentOption = persisted?.paymentOption === "deposit" ? "deposit" : "full";

  const insideText = checkoutDraft.insideText?.trim() || "Not provided";
  const outsideText = checkoutDraft.outsideText?.trim() || "Not provided";
  const orderNotes = checkoutDraft.orderNotes?.trim() || "Not provided";
  const customSymbolStatus = checkoutDraft.customSymbolRequestSelected ? "Requested" : "Not requested";

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
        <h1>Review & Checkout</h1>
        <p class="muted">Reviewing cart item <strong>#${escapeHtml(checkoutDraft.cartItemId || "N/A")}</strong></p>
        <p class="muted">Please confirm your customization details before continuing to payment.</p>
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
              <input type="tel" name="customerPhone" autocomplete="tel" value="${escapeHtml(persisted?.customer?.phone || "")}" />
            </label>
          </div>
        </section>

        <section class="plaque card">
          <h2>Shipping Information</h2>
          <div class="form-grid">
            <label>Shipping Full Name*
              <input type="text" name="shippingName" autocomplete="shipping name" value="${escapeHtml(persisted?.shipping?.fullName || "")}" required />
            </label>
            <label>Address Line 1*
              <input type="text" name="address1" autocomplete="shipping address-line1" value="${escapeHtml(persisted?.shipping?.address1 || "")}" required />
            </label>
            <label>Address Line 2
              <input type="text" name="address2" autocomplete="shipping address-line2" value="${escapeHtml(persisted?.shipping?.address2 || "")}" />
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
            <label>Country*
              <input type="text" name="country" autocomplete="shipping country-name" value="${escapeHtml(persisted?.shipping?.country || "")}" required />
            </label>
          </div>
        </section>

        <section class="plaque card">
          <h2>Payment Option</h2>
          <div class="payment-options" role="radiogroup" aria-label="Payment options">
            <label class="radio-row">
              <input type="radio" name="paymentOption" value="full" ${selectedPaymentOption === "full" ? "checked" : ""} />
              <span>Pay in Full</span>
            </label>
            <label class="radio-row">
              <input type="radio" name="paymentOption" value="deposit" ${selectedPaymentOption === "deposit" ? "checked" : ""} />
              <span>50% Deposit</span>
            </label>
          </div>
        </section>

        <section class="plaque card">
          <h2>Shipping & Fulfillment</h2>
          <p class="muted">Shipping will be calculated at checkout.</p>
          <p class="placeholder-chip">Shippo integration placeholder</p>
        </section>

        <section class="plaque card">
          <h2>Final Summary / Amount Due Today</h2>
          <ul class="breakdown-list final-summary-list">
            <li><span>Ring Total</span><strong>${formatMoney(checkoutDraft.totalPrice)}</strong></li>
            <li><span>Shipping</span><strong>Calculated at checkout</strong></li>
            <li><span>Payment Option</span><strong id="selected-payment-option">${getPaymentOptionLabel()}</strong></li>
            <li class="total-line"><span>Amount Due Today</span><strong id="amount-due-today">${formatMoney(getAmountDueToday())}</strong></li>
          </ul>
        </section>

        <section class="plaque card action-card">
          <label class="confirm-row">
            <input type="checkbox" id="confirmation-checkbox" ${persisted?.confirmationAccepted ? "checked" : ""} required />
            <span>I confirm my customization details and shipping information are correct.</span>
          </label>
          <p id="form-error" class="form-error" aria-live="polite"></p>
          <p id="stripe-config-message" class="muted integration-note" aria-live="polite"></p>
          <button id="proceed-to-payment-btn" class="primary-btn" type="submit">Proceed to Payment</button>
        </section>
      </form>
    </section>
  `;

  bindCheckoutEvents();
}

function renderStripeConfigMessage() {
  const messageEl = document.getElementById("stripe-config-message");
  if (!messageEl) return;
  messageEl.textContent = stripeConfigStatus.message || "";
}

function syncStripeButtonReadiness(form) {
  const submitBtn = document.getElementById("proceed-to-payment-btn");
  if (!submitBtn) return;

  const hasRequiredFields = areRequiredFieldsComplete(form);
  const confirmationAccepted = Boolean(document.getElementById("confirmation-checkbox")?.checked);
  const canProceed = hasRequiredFields && confirmationAccepted && stripeConfigStatus.ready;

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
    renderStripeConfigMessage();
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
      address2: getTrimmedValue(form, "address2"),
      city: getTrimmedValue(form, "city"),
      state: getTrimmedValue(form, "state"),
      zip: getTrimmedValue(form, "zip"),
      country: getTrimmedValue(form, "country")
    },
    paymentOption: selectedPaymentOption,
    confirmationAccepted: Boolean(document.getElementById("confirmation-checkbox")?.checked)
  };
}

function areRequiredFieldsComplete(form) {
  return REQUIRED_FIELD_NAMES.every(fieldName => Boolean(getTrimmedValue(form, fieldName)));
}

function updateProceedButtonState(form) {
  syncStripeButtonReadiness(form);
}

function bindCheckoutEvents() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  const confirmationCheckbox = document.getElementById("confirmation-checkbox");
  const paymentOptions = form.querySelectorAll('input[name="paymentOption"]');
  const observedFields = form.querySelectorAll("input[name]");

  renderStripeConfigMessage();

  const persistAndRefreshButtonState = () => {
    persistActiveCheckoutForm(buildFormState(form));
    updateProceedButtonState(form);
  };

  paymentOptions.forEach(input => {
    input.addEventListener("change", event => {
      selectedPaymentOption = event.target.value;
      const paymentOptionEl = document.getElementById("selected-payment-option");
      const amountDueEl = document.getElementById("amount-due-today");

      if (paymentOptionEl) paymentOptionEl.textContent = getPaymentOptionLabel();
      if (amountDueEl) amountDueEl.textContent = formatMoney(getAmountDueToday());

      persistAndRefreshButtonState();
    });
  });

  observedFields.forEach(field => {
    field.addEventListener("input", persistAndRefreshButtonState);
    field.addEventListener("change", persistAndRefreshButtonState);
  });

  if (confirmationCheckbox) {
    confirmationCheckbox.addEventListener("change", persistAndRefreshButtonState);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const errorEl = document.getElementById("form-error");
    const confirm = document.getElementById("confirmation-checkbox");

    const hasRequiredFields = areRequiredFieldsComplete(form);

    if (!stripeConfigStatus.ready) {
      if (errorEl) errorEl.textContent = stripeConfigStatus.message || "Stripe server configuration is missing.";
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

    const persistedFormState = buildFormState(form);
    persistActiveCheckoutForm(persistedFormState);

    const checkoutSubmission = {
      draft: checkoutDraft,
      checkoutItemKey: getActiveCheckoutItemKey(),
      customer: persistedFormState.customer,
      shipping: persistedFormState.shipping,
      paymentOption: selectedPaymentOption,
      paymentOptionLabel: getPaymentOptionLabel(),
      shippingQuoteStatus: "pending-shippo-address-verification",
      amountDueToday: getAmountDueToday(),
      paymentStatus: "initiating-stripe-checkout"
    };

    sessionStorage.setItem(CHECKOUT_SUBMISSION_KEY, JSON.stringify(checkoutSubmission));

    const submitBtn = document.getElementById("proceed-to-payment-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Redirecting to Stripe...";
    }

    if (errorEl) {
      errorEl.textContent = "";
    }

    fetch("/.netlify/functions/create-stripe-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(checkoutSubmission)
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.checkoutUrl) {
          throw new Error(data.error || "Unable to start Stripe checkout.");
        }

        window.location.assign(data.checkoutUrl);
      })
      .catch(error => {
        if (errorEl) {
          errorEl.textContent = error.message || "We couldn't connect to Stripe. Please try again.";
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Proceed to Payment";
        }
      });
  });

  persistAndRefreshButtonState();
  loadStripeConfigStatus(form);
}

function initCheckoutPage() {
  checkoutDraft = resolveCheckoutDraft();

  if (hasValidCheckoutDraft(checkoutDraft)) {
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutDraft));
  }

  renderCheckout();
}

initCheckoutPage();
