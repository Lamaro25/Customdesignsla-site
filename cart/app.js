const cartApp = document.getElementById("cart-app");
const cartStore = window.CdlaCartStore;

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

function getItemSummary(item) {
  const symbolsCount = Array.isArray(item.symbols) ? item.symbols.length : 0;
  const flags = [];
  if (item.engravingInside) flags.push("inside engraving");
  if (item.engravingOutside) flags.push("outside engraving");
  if (symbolsCount) flags.push(`${symbolsCount} symbol${symbolsCount === 1 ? "" : "s"}`);
  if (item.customSymbolDesignRequestSelected) flags.push("custom request");
  return flags.length ? flags.join(", ") : "No additional customization notes";
}

function renderCart() {
  const cart = cartStore ? cartStore.loadCart() : [];

  if (!cart.length) {
    cartApp.innerHTML = `
      <section class="cart-shell">
        <div class="plaque card">
          <h1>Your Cart</h1>
          <p class="muted">No configured items yet.</p>
          <a class="btn" href="/ring-builder/">Start in Builder</a>
        </div>
      </section>
    `;
    return;
  }

  const total = cart.reduce((sum, item) => sum + Number(item.unitPrice || 0), 0);

  cartApp.innerHTML = `
    <section class="cart-shell">
      <div class="plaque card">
        <h1>Your Cart (${cart.length})</h1>
        <p class="muted">Saved custom rings are held here until you review one item at checkout.</p>
        <div class="header-actions">
          <a class="btn" href="/ring-builder/">Add Another Item</a>
          <button class="btn subtle" type="button" onclick="clearCart()">Clear Cart</button>
        </div>
      </div>

      <div class="plaque card">
        ${cart.map(item => `
          <article class="cart-item">
            <h3>${escapeHtml(item.productName || "Custom Ring")}</h3>
            <p class="muted">${escapeHtml(item.collection || "Ring Collection")}</p>
            <div class="meta-grid">
              <div><strong>SKU:</strong> ${escapeHtml(item.sku || "N/A")}</div>
              <div><strong>Ring Size:</strong> ${escapeHtml(item.ringSize || "N/A")}</div>
              <div><strong>Total:</strong> ${formatMoney(item.unitPrice)}</div>
              <div><strong>Summary:</strong> ${escapeHtml(getItemSummary(item))}</div>
            </div>
            <div class="item-actions">
              <button class="btn" type="button" onclick="reviewItem('${escapeHtml(String(item.id))}')">Review & Checkout</button>
              <a class="btn subtle" href="${escapeHtml(item.sourceUrl || '/ring-builder/')}" >Edit in Builder</a>
              <button class="btn subtle" type="button" onclick="removeItem('${escapeHtml(String(item.id))}')">Remove</button>
            </div>
          </article>
        `).join("")}
      </div>

      <div class="plaque card">
        <h2>Cart Total (all saved items)</h2>
        <p><strong>${formatMoney(total)}</strong></p>
      </div>
    </section>
  `;
}

window.reviewItem = itemId => {
  if (!cartStore) return;
  cartStore.selectItem(itemId);
  window.location.href = `/checkout/?item=${encodeURIComponent(itemId)}`;
};

window.removeItem = itemId => {
  if (!cartStore) return;
  cartStore.removeItem(itemId);
  renderCart();
};

window.clearCart = () => {
  if (!cartStore) return;
  if (!window.confirm("Clear all items from cart?")) return;
  cartStore.clearCart();
  renderCart();
};

renderCart();
