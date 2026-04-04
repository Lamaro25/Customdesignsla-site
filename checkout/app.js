const checkoutApp = document.getElementById("checkout-app");
const CHECKOUT_STORAGE_KEY = "cdla_checkout_draft";

let checkoutDraft = null;
let selectedPaymentOption = "full";

function money(value) {
  return `$${Number(value || 0)}`;
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

function getAmountDueToday() {
  if (!checkoutDraft) return 0;
  return selectedPaymentOption === "deposit"
    ? Number(checkoutDraft.totalPrice || 0) * 0.5
    : Number(checkoutDraft.totalPrice || 0);
}

function getPaymentOptionLabel() {
  return selectedPaymentOption === "deposit" ? "50% Deposit" : "Pay in Full";
}

function buildSymbolsSummary() {
  const symbols = Array.isArray(checkoutDraft?.selectedSymbols) ? checkoutDraft.selectedSymbols : [];
  if (!symbols.length) return "None selected";

  return symbols
    .map(symbol => `${symbol.name || symbol.id || "Symbol"}${symbol.price ? ` (${money(symbol.price)})` : ""}`)
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
  if (!checkoutDraft) {
    renderMissingState();
    return;
  }

  const insideText = checkoutDraft.insideText?.trim() || "Not provided";
  const outsideText = checkoutDraft.outsideText?.trim() || "Not provided";
  const orderNotes = checkoutDraft.orderNotes?.trim() || "Not provided";
  const customSymbolStatus = checkoutDraft.customSymbolRequestSelected
    ? "Requested"
    : "Not requested";

  const breakdownLines = Array.isArray(checkoutDraft.priceBreakdown)
    ? checkoutDraft.priceBreakdown.map(item => `
      <li>
        <span>${item.label || "Line Item"}</span>
        <strong>${money(item.amount)}</strong>
      </li>
    `).join("")
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
          <div><dt>Product</dt><dd>${checkoutDraft.productTitle || "Custom Ring"}</dd></div>
          <div><dt>SKU</dt><dd>${checkoutDraft.sku || "N/A"}</dd></div>
          <div><dt>Collection</dt><dd>${checkoutDraft.collection || "N/A"}</dd></div>
          <div><dt>Ring Size</dt><dd>${checkoutDraft.ringSize || "N/A"}</dd></div>
          <div><dt>Inside Text</dt><dd>${insideText}</dd></div>
          <div><dt>Outside Text</dt><dd>${outsideText}</dd></div>
          <div><dt>Selected Symbols</dt><dd>${buildSymbolsSummary()}</dd></div>
          <div><dt>Custom Symbol Request</dt><dd>${customSymbolStatus}</dd></div>
          <div><dt>Custom Request Details</dt><dd>${checkoutDraft.customSymbolRequestDescription || "Not provided"}</dd></div>
          <div><dt>Order Notes</dt><dd>${orderNotes}</dd></div>
        </dl>
      </section>

      <section class="plaque card">
        <h2>Price Breakdown</h2>
        <ul class="breakdown-list">
          <li>
            <span>Base Ring Total</span>
            <strong>${money(checkoutDraft.baseRingPrice)}</strong>
          </li>
          ${breakdownLines}
          <li class="total-line">
            <span>Final Total (before shipping)</span>
            <strong>${money(checkoutDraft.totalPrice)}</strong>
          </li>
        </ul>
      </section>

      <form id="checkout-form" class="checkout-form" novalidate>
        <section class="plaque card">
          <h2>Customer Information</h2>
          <div class="form-grid">
            <label>Full Name*
              <input type="text" name="customerName" required />
            </label>
            <label>Email Address*
              <input type="email" name="customerEmail" required />
            </label>
            <label>Phone Number
              <input type="tel" name="customerPhone" />
            </label>
          </div>
        </section>

        <section class="plaque card">
          <h2>Shipping Information</h2>
          <div class="form-grid">
            <label>Shipping Full Name*
              <input type="text" name="shippingName" required />
            </label>
            <label>Address Line 1*
              <input type="text" name="address1" required />
            </label>
            <label>Address Line 2
              <input type="text" name="address2" />
            </label>
            <label>City*
              <input type="text" name="city" required />
            </label>
            <label>State / Region*
              <input type="text" name="state" required />
            </label>
            <label>ZIP / Postal Code*
              <input type="text" name="zip" required />
            </label>
            <label>Country*
              <input type="text" name="country" required />
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
          <p class="muted">Shipping rates will appear after address verification (Shippo integration placeholder).</p>
        </section>

        <section class="plaque card">
          <h2>Final Summary / Amount Due Today</h2>
          <ul class="breakdown-list final-summary-list">
            <li><span>Ring Total</span><strong>${money(checkoutDraft.totalPrice)}</strong></li>
            <li><span>Shipping</span><strong>Calculated at checkout</strong></li>
            <li><span>Payment Option</span><strong id="selected-payment-option">${getPaymentOptionLabel()}</strong></li>
            <li class="total-line"><span>Amount Due Today</span><strong id="amount-due-today">${money(getAmountDueToday())}</strong></li>
          </ul>
        </section>

        <section class="plaque card action-card">
          <label class="confirm-row">
            <input type="checkbox" id="confirmation-checkbox" required />
            <span>I confirm my customization details and shipping information are correct.</span>
          </label>
          <p id="form-error" class="form-error" aria-live="polite"></p>
          <button class="primary-btn" type="submit">Proceed to Payment</button>
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
    input.addEventListener("change", () => {
      selectedPaymentOption = input.value;
      const paymentOptionEl = document.getElementById("selected-payment-option");
      const amountDueEl = document.getElementById("amount-due-today");
      if (paymentOptionEl) paymentOptionEl.textContent = getPaymentOptionLabel();
      if (amountDueEl) amountDueEl.textContent = money(getAmountDueToday());
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

    const checkoutSubmission = {
      draft: checkoutDraft,
      paymentOption: selectedPaymentOption,
      amountDueToday: getAmountDueToday(),
      status: "placeholder-pending-payment-provider"
    };

    sessionStorage.setItem("cdla_checkout_submission", JSON.stringify(checkoutSubmission));
    alert("Checkout structure is ready. Stripe payment handoff will be connected in the next integration pass.");
  });
}

function initCheckoutPage() {
  checkoutDraft = loadCheckoutDraft();
  renderCheckout();
}

initCheckoutPage();
