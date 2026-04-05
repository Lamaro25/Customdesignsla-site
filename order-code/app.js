const orderCodeApp = document.getElementById("order-code-app");
const orderRecordStore = window.CdlaOrderRecordStore;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSymbolSummary(symbols) {
  if (!Array.isArray(symbols) || !symbols.length) return "None selected";
  return symbols.map(symbol => symbol.name || symbol.id || "Symbol").join(", ");
}

function renderLookup(record = null, errorMessage = "") {
  orderCodeApp.innerHTML = `
    <section class="lookup-shell">
      <div class="plaque card">
        <h1>Returning Customer / Order Code</h1>
        <p class="muted">Enter both your Email Address and Order Code to view your saved preview or order.</p>
        <div class="btn-row">
          <a class="btn subtle" href="/ring-builder/">Back to Builder</a>
          <a class="btn subtle" href="/cart/">View Cart</a>
        </div>
      </div>

      <form id="order-code-form" class="plaque card" novalidate>
        <h2>Order Lookup</h2>
        <label>Email Address
          <input type="email" name="email" autocomplete="email" required />
        </label>
        <label>Order Code
          <input type="text" name="orderCode" placeholder="CDLA-XXXXXX" required />
        </label>
        <p class="error" id="lookup-error" aria-live="polite">${escapeHtml(errorMessage)}</p>
        <div class="btn-row">
          <button class="btn" type="submit">View My Order</button>
        </div>
      </form>

      ${record ? `
        <section class="plaque card">
          <h2>Order Summary</h2>
          <dl class="summary-grid">
            <div><dt>Order Code</dt><dd>${escapeHtml(record.orderCode)}</dd></div>
            <div><dt>Type</dt><dd>${escapeHtml(record.recordType === "order" ? "Paid Order" : "Saved Preview")}</dd></div>
            <div><dt>Status</dt><dd><span class="status-chip">${escapeHtml(record.status)}</span></dd></div>
            <div><dt>Last Updated</dt><dd>${escapeHtml(new Date(record.updatedAt).toLocaleString())}</dd></div>
            <div><dt>Product</dt><dd>${escapeHtml(record.productTitle || "Custom Ring")}</dd></div>
            <div><dt>SKU</dt><dd>${escapeHtml(record.sku || "N/A")}</dd></div>
            <div><dt>Collection</dt><dd>${escapeHtml(record.collection || "N/A")}</dd></div>
            <div><dt>Ring Size</dt><dd>${escapeHtml(record.ringSize || "N/A")}</dd></div>
            <div><dt>Inside Text</dt><dd>${escapeHtml(record.engraving?.inside || "Not provided")}</dd></div>
            <div><dt>Outer Text</dt><dd>${escapeHtml(record.engraving?.outside || "Not provided")}</dd></div>
            <div><dt>Symbols</dt><dd>${escapeHtml(buildSymbolSummary(record.symbols))}</dd></div>
            <div><dt>Notes</dt><dd>${escapeHtml(record.notes || "Not provided")}</dd></div>
          </dl>
        </section>

        <section class="plaque card">
          <h3>Portal-Ready Workspace (Scaffold)</h3>
          <ul class="portal-scaffold-list">
            <li>Render assets placeholder: ${record.renderAssets?.length || 0} files</li>
            <li>Internal messages placeholder: ${record.internalMessages?.length || 0} messages</li>
            <li>Customer messages placeholder: ${record.customerMessages?.length || 0} messages</li>
            <li>Ring size confirmation placeholder: ${record.ringSizeConfirmation?.finalSize || "Pending final size"}</li>
          </ul>
        </section>
      ` : ""}
    </section>
  `;

  const form = document.getElementById("order-code-form");
  form?.addEventListener("submit", event => {
    event.preventDefault();

    if (!orderRecordStore) {
      renderLookup(null, "Order lookup is temporarily unavailable.");
      return;
    }

    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const orderCode = String(data.get("orderCode") || "").trim();

    if (!email || !orderCode) {
      renderLookup(null, "Please enter both Email Address and Order Code.");
      return;
    }

    const found = orderRecordStore.findRecordByEmailAndCode(email, orderCode);
    if (!found) {
      renderLookup(null, "No record found. Check both your email and order code, then try again.");
      return;
    }

    renderLookup(found);
  });
}

renderLookup();
