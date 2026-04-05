const previewRequestApp = document.getElementById("preview-request-app");
const orderRecordStore = window.CdlaOrderRecordStore;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMissingDraft() {
  previewRequestApp.innerHTML = `
    <section class="preview-shell">
      <div class="plaque card">
        <h1>Save & Get Free Preview</h1>
        <p class="muted">No configured design found.</p>
        <p class="muted">Start in the ring builder, then click <strong>Save & Get Free Preview</strong>.</p>
        <div class="btn-row">
          <a class="btn" href="/ring-builder/">Go to Builder</a>
          <a class="btn subtle" href="/order-code/">Returning Customer / Order Code</a>
        </div>
      </div>
    </section>
  `;
}

function buildSymbolSummary(symbols) {
  if (!Array.isArray(symbols) || !symbols.length) return "None selected";
  return symbols.map(symbol => symbol.name || symbol.id || "Symbol").join(", ");
}

function renderForm(draft) {
  previewRequestApp.innerHTML = `
    <section class="preview-shell">
      <div class="plaque card">
        <h1>Save & Get Free Preview</h1>
        <p class="muted">Submit your preview request to receive your Order Code.</p>
        <p class="notice">Free preview requests do not include a ring sizer.<br/>Sizing kits are sent after purchase to confirm your final fit before production.</p>
        <div class="btn-row">
          <a class="btn subtle" href="/ring-builder/">Back to Builder</a>
          <a class="btn subtle" href="/order-code/">Returning Customer / Order Code</a>
        </div>
      </div>

      <section class="plaque card">
        <h2>Configured Item Summary</h2>
        <dl class="summary-grid">
          <div><dt>Product</dt><dd>${escapeHtml(draft.productTitle || "Custom Ring")}</dd></div>
          <div><dt>SKU</dt><dd>${escapeHtml(draft.sku || "N/A")}</dd></div>
          <div><dt>Collection</dt><dd>${escapeHtml(draft.collection || "N/A")}</dd></div>
          <div><dt>Ring Size</dt><dd>${escapeHtml(draft.ringSize || "N/A")}</dd></div>
          <div><dt>Inside Text</dt><dd>${escapeHtml(draft.engraving?.inside || "Not provided")}</dd></div>
          <div><dt>Outer Text</dt><dd>${escapeHtml(draft.engraving?.outside || "Not provided")}</dd></div>
          <div><dt>Symbols</dt><dd>${escapeHtml(buildSymbolSummary(draft.symbols))}</dd></div>
          <div><dt>Request Notes</dt><dd>${escapeHtml(draft.notes || "Not provided")}</dd></div>
          <div><dt>Status</dt><dd><span class="status-chip">Saved</span></dd></div>
        </dl>
      </section>

      <form id="preview-request-form" class="plaque card" novalidate>
        <h2>Your Contact Information</h2>
        <label>Full Name*
          <input type="text" name="fullName" autocomplete="name" required />
        </label>
        <label>Email Address*
          <input type="email" name="email" autocomplete="email" required />
        </label>
        <label>Phone Number (preferred)
          <input type="tel" name="phone" autocomplete="tel" />
        </label>
        <label>Notes / Request Notes
          <textarea name="notes" placeholder="Anything else you'd like us to know about your preview request?"></textarea>
        </label>
        <p id="preview-form-error" class="error" aria-live="polite"></p>
        <div class="btn-row">
          <button class="btn" type="submit">Submit Free Preview Request</button>
        </div>
      </form>
    </section>
  `;

  const form = document.getElementById("preview-request-form");
  const errorEl = document.getElementById("preview-form-error");

  form?.addEventListener("submit", event => {
    event.preventDefault();
    if (!orderRecordStore) {
      errorEl.textContent = "Preview store is unavailable. Please refresh and try again.";
      return;
    }

    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const customerNotes = String(formData.get("notes") || "").trim();

    if (!fullName || !email) {
      errorEl.textContent = "Please complete Full Name and Email Address.";
      return;
    }

    const record = orderRecordStore.createPreviewRecord({
      productTitle: draft.productTitle,
      sku: draft.sku,
      collection: draft.collection,
      ringSize: draft.ringSize,
      engraving: {
        inside: draft.engraving?.inside || "",
        outside: draft.engraving?.outside || ""
      },
      symbols: Array.isArray(draft.symbols) ? draft.symbols : [],
      customRequestFlags: draft.customRequestFlags || {},
      notes: [draft.notes, customerNotes].filter(Boolean).join("\n\n"),
      customer: {
        fullName,
        email,
        phone
      },
      metadata: draft.metadata || {}
    });

    orderRecordStore.queueOrderCodeEmail({ to: email, orderCode: record.orderCode });
    orderRecordStore.clearPreviewDraft();
    renderSuccess(record);
  });
}

function renderSuccess(record) {
  previewRequestApp.innerHTML = `
    <section class="preview-shell">
      <div class="plaque card">
        <h1>Preview Request Saved</h1>
        <p class="muted">Your request has been saved successfully.</p>
        <p class="muted">Use your email address and Order Code to return at any time.</p>
        <p><strong>Order Code</strong></p>
        <p class="order-code"><strong>${escapeHtml(record.orderCode)}</strong></p>
        <p class="muted">Initial status: <span class="status-chip">${escapeHtml(record.status)}</span></p>
        <p class="notice">Free preview requests do not include a ring sizer.<br/>Sizing kits are sent after purchase to confirm your final fit before production.</p>
        <div class="btn-row">
          <a class="btn" href="/order-code/">View My Order</a>
          <a class="btn subtle" href="/ring-builder/">Build Another Ring</a>
        </div>
      </div>
    </section>
  `;
}

function init() {
  if (!orderRecordStore) {
    renderMissingDraft();
    return;
  }

  const draft = orderRecordStore.getPreviewDraft();
  if (!draft || typeof draft !== "object") {
    renderMissingDraft();
    return;
  }

  renderForm(draft);
}

init();
