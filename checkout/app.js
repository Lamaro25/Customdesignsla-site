const checkoutApp = document.getElementById("checkout-app");
const CHECKOUT_STORAGE_KEY = "cdla_checkout_draft";
const CHECKOUT_SUBMISSION_KEY = "cdla_checkout_submission";

let checkoutDraft = null;
let selectedPaymentOption = "full";

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

function loadCheckoutDraft() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function hasValidCheckoutDraft(draft) {
  return Boolean(
    draft &&
      (draft.productTitle || draft.sku) &&
      Number.isFinite(Number(draft.totalPrice))
  );
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
        <p class="muted">We couldn't find your ring customization details.</p>
        <p class="muted">Please return to the builder and click <strong>Order Now</strong> again.</p>
        <a class="primary-btn" href="/ring-builder/">Return to Builder</a>
      </div>
    </section>
  `;
}

function renderCheckout() {
  if (!hasValidCheckoutDraft(checkoutDraft)) {
    renderMissingState();
    return;
  }

  const insideText = checkoutDraft.insideText?.trim() || "Not provided";
  const outsideText = checkoutDraft.outsideText?.trim() || "Not provided";
  const orderNotes = checkoutDraft.orderNotes?.trim() || "Not provided";
  const customSymbolStatus = checkoutDraft.customSymbolRequestSelected ? "Requested" : "Not requested";

  const breakdownLines = Array.isArray(checkoutDraft.priceBreakdown)
    ? checkoutDraft.priceBreakdown
        .map(item => `
          <li>
            <span>${escapeHtml(item.label || "Line Item")}</span>
            <strong>${formatMoney(item.amount)}</strong>
          </li>
        `)
        .join("")
    : "";

  checkoutApp.innerHTML = `
    <section class="checkout-shell">
      <div class="plaque card header-card">
        <h1>Review & Checkout</h1>
        <p class="muted">Please confirm your customization details before continuing to payment.</p>
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
        <ul class="breakdown-list">
          <li>
            <span>Base Ring Total</span>
            <strong>${formatMoney(checkoutDraft.baseRingPrice)}</strong>
          </li>
          ${breakdownLines}
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
              <input type="text" name="customerName" autocomplete="name" required />
            </label>
            <label>Email Address*
              <input type="email" name="customerEmail" autocomplete="email" required />
            </label>
            <label>Phone Number
              <input type="tel" name="customerPhone" autocomplete="tel" />
            </label>
          </div>
        </section>

        <section class="plaque card">
          <h2>Shipping Information</h2>
          <div class="form-grid">
            <label>Shipping Full Name*
              <input type="text" name="shippingName" autocomplete="shipping name" required />
            </label>
            <label>Address Line 1*
              <input type="text" name="address1" autocomplete="shipping address-line1" required />
            </label>
            <label>Address Line 2
              <input type="text" name="address2" autocomplete="shipping address-line2" />
            </label>
            <label>City*
              <input type="text" name="city" autocomplete="shipping address-level2" required />
            </label>
            <label>State / Region*
              <input type="text" name="state" autocomplete="shipping address-level1" required />
            </label>
            <label>ZIP / Postal Code*
              <input type="text" name="zip" autocomplete="shipping postal-code" required />
            </label>
            <label>Country*
              <input type="text" name="country" autocomplete="shipping country-name" required />
            </label>
          </div>
        </section>

        <section class="plaque card">
          <h2>Payment Option</h2>
          <div class="payment-options" role="radiogroup" aria-label="Payment options">
            <label class="radio-row">
              <input type="radio" name="paymentOption" value="full" checked />
              <span>Pay in Full</span>
            </label>
            <label class="radio-row">
              <input type="radio" name="paymentOption" value="deposit" />
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
            <input type="checkbox" id="confirmation-checkbox" required />
            <span>I confirm my customization details and shipping information are correct.</span>
          </label>
          <p id="form-error" class="form-error" aria-live="polite"></p>
          <button class="primary-btn" type="submit">Proceed to Payment</button>
          <p class="muted integration-note">Stripe handoff will be connected in the next integration pass.</p>
        </section>
      </form>
    </section>
  `;

  bindCheckoutEvents();
}

function bindCheckoutEvents() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  const paymentOptions = form.querySelectorAll('input[name="paymentOption"]');

  paymentOptions.forEach(input => {
    input.addEventListener("change", event => {
      selectedPaymentOption = event.target.value;
      const paymentOptionEl = document.getElementById("selected-payment-option");
      const amountDueEl = document.getElementById("amount-due-today");

      if (paymentOptionEl) paymentOptionEl.textContent = getPaymentOptionLabel();
      if (amountDueEl) amountDueEl.textContent = formatMoney(getAmountDueToday());
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    const errorEl = document.getElementById("form-error");
    const confirm = document.getElementById("confirmation-checkbox");

    if (!form.checkValidity() || !confirm?.checked) {
      if (errorEl) {
        errorEl.textContent = "Please complete required fields and confirm your details before continuing.";
      }
      form.reportValidity();
      return;
    }

    if (errorEl) errorEl.textContent = "";

    const formData = new FormData(form);
    const checkoutSubmission = {
      draft: checkoutDraft,
      customer: {
        fullName: formData.get("customerName"),
        email: formData.get("customerEmail"),
        phone: formData.get("customerPhone") || ""
      },
      shipping: {
        fullName: formData.get("shippingName"),
        address1: formData.get("address1"),
        address2: formData.get("address2") || "",
        city: formData.get("city"),
        state: formData.get("state"),
        zip: formData.get("zip"),
        country: formData.get("country")
      },
      paymentOption: selectedPaymentOption,
      paymentOptionLabel: getPaymentOptionLabel(),
      shippingQuoteStatus: "pending-shippo-address-verification",
      amountDueToday: getAmountDueToday(),
      paymentStatus: "placeholder-pending-stripe"
    };

    sessionStorage.setItem(CHECKOUT_SUBMISSION_KEY, JSON.stringify(checkoutSubmission));
    alert("Checkout structure is ready. Stripe payment handoff will be connected in the next integration pass.");
  });
}

function initCheckoutPage() {
  checkoutDraft = loadCheckoutDraft();
  renderCheckout();
}

initCheckoutPage();
