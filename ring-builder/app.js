const app = document.getElementById('app');

let ringsData = [];
let pricingData = {};
let currentProduct = null;
let symbolsData = [];

let currentMetal = "Silver";
let currentBandWidth = "";
let selectedAddOns = [];
let engravingTextInside = "";
let engravingTextOutside = "";
let selectedSymbols = [];
let symbolSectionExpanded = false;
let customSymbolDesignRequestOptIn = false;
let customSymbolDesignDescription = "";
let customSymbolUploadFileName = "";
let orderNotes = "";
const CUSTOM_SYMBOL_SERVICE_FEE = 10;

let cart = JSON.parse(localStorage.getItem('cdla_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('cdla_wishlist')) || [];

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return (params.get(name) || "").trim().toLowerCase();
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeProduct(product) {
  const title = product.title || product.name || "Custom Ring";
  const sku = String(product.sku || "").trim().toUpperCase();
  const slug = String(product.slug || slugify(title)).trim().toLowerCase();
  const builderKey = `${sku.toLowerCase()}-${slug}`;

  return {
    ...product,
    title,
    sku,
    slug,
    builderKey,
    collection: product.collection || "Ring Collection",
    image:
      (Array.isArray(product.images) && product.images[0]) ||
      (Array.isArray(product.gallery) && product.gallery[0]) ||
      product.img ||
      "",
    price: Number(product.price || 0),
    description: typeof product.description === "string" ? product.description.trim() : "",
    overview: typeof product.overview === "string" ? product.overview.trim() : "",
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    notes: Array.isArray(product.notes) ? product.notes : []
  };
}

function findRingByBuilderKey(products, builderKey) {
  const normalizedKey = String(builderKey || "").trim().toLowerCase();

  return products.find(product => {
    const sku = String(product.sku || "").trim().toLowerCase();
    const slug = String(product.slug || "").trim().toLowerCase();
    const combined = `${sku}-${slug}`;

    return (
      normalizedKey === combined ||
      normalizedKey === sku ||
      normalizedKey === slug
    );
  }) || null;
}

function getAvailableMetals(product) {
  if (Array.isArray(product.availableMetals) && product.availableMetals.length) {
    return product.availableMetals;
  }

  if (product.material && /silver|sterling/i.test(product.material)) {
    return ["Silver"];
  }

  return Object.keys(pricingData.metals || {});
}

function getAvailableBandWidths(product) {
  if (Array.isArray(product.availableRingHeights) && product.availableRingHeights.length) {
    return product.availableRingHeights;
  }

  if (Array.isArray(product.availableBandWidths) && product.availableBandWidths.length) {
    return product.availableBandWidths;
  }

  if (product.band_width) {
    return [product.band_width];
  }

  return Object.keys(pricingData.ringHeights || {});
}

function getAvailableAddOns(product) {
  let addOns = Array.isArray(product.availableAddOns)
    ? [...product.availableAddOns]
    : [];

  const isCubanLink = /cuban link/i.test(product.collection || "");
  if (isCubanLink) {
    addOns = addOns.filter(addon => !["Engraved Pattern", "Beading"].includes(addon));
  }

  return addOns;
}

function isCubanLinkProduct(product) {
  return /cuban link/i.test(product?.collection || "");
}

function supportsInnerSymbolSelection(product) {
  return isCubanLinkProduct(product);
}

function getAvailableSymbols(product) {
  if (!supportsInnerSymbolSelection(product)) {
    return [];
  }

  return symbolsData.filter(symbol => {
    if (symbol.active === false) return false;
    if (symbol.usageType !== "inner-engraved-symbol") return false;
    if (!Array.isArray(symbol.collections) || !symbol.collections.length) return true;
    return symbol.collections.includes("cuban-link-ring-collection");
  });
}

function supportsInsideEngraving(product) {
  if (typeof product.allowInsideEngraving === "boolean") {
    return product.allowInsideEngraving;
  }
  return true;
}

function supportsOutsideEngraving(product) {
  if (typeof product.allowOutsideEngraving === "boolean") {
    return product.allowOutsideEngraving;
  }
  return false;
}

function getProductGallery(product) {
  if (Array.isArray(product.gallery) && product.gallery.length) {
    return product.gallery;
  }

  if (Array.isArray(product.images) && product.images.length) {
    return product.images;
  }

  return [];
}

function isBandWidthLocked(product) {
  return product.lockBandWidth === true;
}

function isMetalLocked(product) {
  return getAvailableMetals(product).length === 1;
}

function initializeSelections() {
  if (!currentProduct) return;

  const metals = getAvailableMetals(currentProduct);
  const bandWidths = getAvailableBandWidths(currentProduct);

  currentMetal = metals[0] || "Silver";
  currentBandWidth = bandWidths[0] || "";
  selectedAddOns = [];
  engravingTextInside = "";
  engravingTextOutside = "";
  selectedSymbols = [];
  symbolSectionExpanded = false;
  customSymbolDesignRequestOptIn = false;
  customSymbolDesignDescription = "";
  customSymbolUploadFileName = "";
  orderNotes = "";
}

function calculatePrice() {
  if (!currentProduct) return 0;

  let total = currentProduct.price || 0;

  selectedAddOns.forEach(addon => {
    total += pricingData.addOns?.[addon] || 0;
  });

  let engravingWords = 0;

  if (supportsInsideEngraving(currentProduct)) {
    engravingWords += engravingTextInside.trim().split(/\s+/).filter(Boolean).length;
  }

  if (supportsOutsideEngraving(currentProduct)) {
    engravingWords += engravingTextOutside.trim().split(/\s+/).filter(Boolean).length;
  }

  total += engravingWords * (pricingData.engravingPerWord || 0);
  total += selectedSymbols.reduce((sum, symbolId) => {
    const symbol = symbolsData.find(item => item.id === symbolId);
    return sum + Number(symbol?.price || 0);
  }, 0);
  if (customSymbolDesignRequestOptIn) {
    total += CUSTOM_SYMBOL_SERVICE_FEE;
  }

  return total;
}

function updatePriceUI() {
  const priceBox = document.querySelector(".price-box h2");
  if (priceBox) {
    priceBox.textContent = `Total Price: $${calculatePrice()}`;
  }
}

function formatCurrency(amount) {
  return `$${Number(amount || 0)}`;
}

function renderPriceBreakdownSection(product) {
  if (!Array.isArray(product?.breakdown) || !product.breakdown.length) {
    return "";
  }

  const rowsMarkup = product.breakdown.map(item => `
    <li class="price-breakdown-item">
      <span class="price-breakdown-line">${item.label || "Item"} — <strong>${formatCurrency(item.amount)}</strong></span>
    </li>
  `).join("");

  return `
    <div class="price-breakdown">
      <h3>Price Breakdown</h3>
      <ul class="price-breakdown-list">
        ${rowsMarkup}
      </ul>
      <p class="price-breakdown-total"><strong>Base Ring Total — ${formatCurrency(product.price)}</strong></p>
    </div>
  `;
}

function persistCart() {
  localStorage.setItem("cdla_cart", JSON.stringify(cart));
}

function persistWishlist() {
  localStorage.setItem("cdla_wishlist", JSON.stringify(wishlist));
}

function renderNotFound() {
  const requestedKey = getUrlParam("sku");

  app.innerHTML = `
    <section class="builder-shell">
      <h2>Customize Your Ring</h2>
      <p>We couldn’t find a ring for this product key.</p>
      <p><strong>Requested:</strong> ${requestedKey || "none"}</p>
    </section>
  `;
}

function render() {
  if (!currentProduct) {
    renderNotFound();
    return;
  }

  const metals = getAvailableMetals(currentProduct);
  const bandWidths = getAvailableBandWidths(currentProduct);
  const addOns = getAvailableAddOns(currentProduct);
  const symbols = getAvailableSymbols(currentProduct);
  const selectedSymbolDetails = selectedSymbols
    .map(symbolId => symbolsData.find(item => item.id === symbolId))
    .filter(Boolean);
  const symbolsTotal = selectedSymbolDetails.reduce((sum, symbol) => sum + Number(symbol.price || 0), 0);
  const price = calculatePrice();
  const priceBreakdownMarkup = renderPriceBreakdownSection(currentProduct);

  const metalOptions = metals.map(metal => `
    <option value="${metal}" ${metal === currentMetal ? "selected" : ""}>
      ${metal} (+$${pricingData.metals?.[metal] || 0})
    </option>
  `).join("");

  const bandWidthOptions = bandWidths.map(width => `
    <option value="${width}" ${width === currentBandWidth ? "selected" : ""}>
      ${width}
    </option>
  `).join("");

  const bandWidthMarkup = isBandWidthLocked(currentProduct)
    ? `
      <h3>Band Width:</h3>
      <p><strong>${currentProduct.band_width}</strong></p>
    `
    : `
      <h3>Select Band Width:</h3>
      <select onchange="setBandWidth(this.value)">
        ${bandWidthOptions}
      </select>
    `;

  const metalMarkup = isMetalLocked(currentProduct)
    ? `
      <h3>Metal:</h3>
      <p><strong>${currentMetal}</strong></p>
    `
    : `
      <h3>Select Metal:</h3>
      <select onchange="setMetal(this.value)">
        ${metalOptions}
      </select>
    `;

  const addOnMarkup = addOns.length
    ? addOns.map(addon => `
        <label>
          <input
            type="checkbox"
            ${selectedAddOns.includes(addon) ? "checked" : ""}
            onchange="toggleAddOn('${addon}', this.checked)"
          />
          ${addon} (+$${pricingData.addOns?.[addon] || 0})
        </label><br/>
      `).join("")
    : "<p>No add-ons available for this ring.</p>";

  const galleryImages = getProductGallery(currentProduct);

  const galleryMarkup = galleryImages.length
    ? `
      <div class="builder-gallery-grid">
        ${galleryImages.map((src, index) => `
          <div class="builder-gallery-item">
            <img
              src="${src}"
              alt="${currentProduct.title} image ${index + 1}"
              class="builder-product-image"
              loading="lazy"
              onerror="this.closest('.builder-gallery-item').style.display='none'"
            />
          </div>
        `).join("")}
      </div>
    `
    : "";

  const standardSymbols = symbols.filter(symbol => symbol.id !== "custom-symbol");
  const customSymbol = symbols.find(symbol => symbol.id === "custom-symbol");

  const symbolCardsMarkup = standardSymbols.map(symbol => `
    <button
      type="button"
      class="symbol-card ${selectedSymbols.includes(symbol.id) ? "is-selected" : ""}"
      onclick="toggleSymbol('${symbol.id}')"
      aria-pressed="${selectedSymbols.includes(symbol.id) ? "true" : "false"}"
    >
      <div class="symbol-image-wrap">
        <img
          src="${symbol.image || ""}"
          alt="${symbol.name}"
          loading="lazy"
          style="${symbol.image ? "" : "display:none;"}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
        />
        <div class="symbol-image-placeholder" style="${symbol.image ? "" : "display:grid;"}">No Image</div>
      </div>
      <span class="symbol-name">${symbol.name}</span>
      <span class="symbol-price">+$${symbol.price}</span>
      <span class="symbol-select-indicator" aria-hidden="true">
        <span class="symbol-select-checkbox">${selectedSymbols.includes(symbol.id) ? "✓" : ""}</span>
      </span>
    </button>
  `).join("");

  const isCustomSymbolSelected = selectedSymbols.includes("custom-symbol");

  const symbolMarkup = symbols.length
    ? `
      <section class="symbol-section">
        <button type="button" class="symbol-toggle" onclick="toggleSymbolSection()">
          ${symbolSectionExpanded ? "Hide Symbols" : "Add Symbols"}
        </button>
        ${symbolSectionExpanded ? `
          <div class="symbol-grid-wrap">
            <p class="symbol-help">Inner Engraved Symbol only for this Cuban Link ring.</p>
            <p class="symbol-help">Symbols selected here are engraved on the inside of the ring.</p>
            <div class="symbol-grid">
              ${symbolCardsMarkup}
            </div>
            ${customSymbol ? `
              <button
                type="button"
                class="custom-symbol-trigger ${isCustomSymbolSelected ? "is-selected" : ""}"
                onclick="toggleSymbol('custom-symbol')"
                aria-pressed="${isCustomSymbolSelected ? "true" : "false"}"
              >
                <div class="symbol-image-wrap">
                  <img
                    src="${customSymbol.image || ""}"
                    alt="${customSymbol.name}"
                    loading="lazy"
                    style="${customSymbol.image ? "" : "display:none;"}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
                  />
                  <div class="symbol-image-placeholder" style="${customSymbol.image ? "" : "display:grid;"}">No Image</div>
                </div>
                <div class="custom-symbol-trigger-copy">
                  <span class="custom-symbol-trigger-title">Custom Symbol / Brand</span>
                  <span class="custom-symbol-trigger-text">Need something custom? Upload a brand, logo, or request a new design.</span>
                </div>
                <span class="custom-symbol-trigger-price">+$${customSymbol.price}</span>
              </button>
            ` : ""}
            ${isCustomSymbolSelected ? `
              <div class="custom-symbol-panel">
                <div class="custom-symbol-panel-inner">
                  <h4>Custom Symbol / Brand</h4>
                  <p>Upload or describe your custom symbol, brand, or logo.</p>
                  <ul>
                    <li>Black and white only</li>
                    <li>Clean, high contrast</li>
                    <li>Simple shapes with no shading or background clutter</li>
                  </ul>
                  <p><strong>✔ Good:</strong> clean black silhouette or clean black-and-white brand</p>
                  <p><strong>✖ Not ideal:</strong> real photos, blurry images, color images, shaded artwork</p>
                  <div class="custom-symbol-examples">
                    <div class="custom-symbol-example-card">
                      <div class="custom-symbol-example-placeholder">No Image</div>
                      <span class="custom-symbol-example-label">Good Example</span>
                    </div>
                    <div class="custom-symbol-example-card">
                      <div class="custom-symbol-example-placeholder">No Image</div>
                      <span class="custom-symbol-example-label">Not Ideal Example</span>
                    </div>
                  </div>
                  <p>Use the example images above as a guide when uploading your reference image.</p>
                  <p>If your uploaded image is clean and production-ready, no extra design fee applies.</p>
                  <p>If your uploaded image is not production-ready and needs cleanup or redrawing, a $10 cleanup fee may apply. We will review the image and contact you before moving forward.</p>
                  <p>If you do not have a usable image and want CDLA to create one for you, you can request that below for a $10 design fee.</p>
                  <p class="custom-symbol-note"><strong>Add placement details in Order Notes.</strong></p>
                  <label class="custom-symbol-checkbox">
                    <input
                      type="checkbox"
                      ${customSymbolDesignRequestOptIn ? "checked" : ""}
                      onchange="setCustomSymbolDesignRequest(this.checked)"
                    />
                    Have CDLA design my symbol / brand (+$10)
                  </label>
                  ${customSymbolDesignRequestOptIn ? `
                    <label class="custom-symbol-description">
                      Describe Your Symbol / Brand
                      <textarea
                        rows="5"
                        oninput="setCustomSymbolDesignDescription(this.value)"
                        placeholder="Example:&#10;Simple cattle brand with the letters R and B connected in a western style.&#10;Or:&#10;Create a clean black-and-white elephant silhouette for engraving."
                      >${escapeHtml(customSymbolDesignDescription)}</textarea>
                    </label>
                  ` : ""}
                  <div class="upload-placeholder">
                    <p class="upload-label">Upload Reference Image (optional)</p>
                    <div class="upload-input-wrap">
                      <input type="file" aria-label="Upload Reference Image (optional)" onchange="setCustomSymbolUploadFileName(this.files)" />
                    </div>
                    ${customSymbolUploadFileName ? `<p class="upload-file-name">Selected file: ${escapeHtml(customSymbolUploadFileName)}</p>` : ""}
                  </div>
                </div>
              </div>
            ` : ""}
            <p class="symbol-summary">${selectedSymbolDetails.length} symbols selected — $${symbolsTotal}</p>
          </div>
        ` : ""}
      </section>
    `
    : "";

  app.innerHTML = `
    <section class="builder-shell">
      <h2>Customize Your Ring</h2>

      <div class="builder-product-header">
        ${galleryMarkup}
        <div class="builder-product-meta">
          <h3>${currentProduct.title}</h3>
          <p><strong>Product Key:</strong> ${currentProduct.builderKey}</p>
          <p><strong>SKU:</strong> ${currentProduct.sku}</p>
          <p><strong>Collection:</strong> ${currentProduct.collection}</p>
          <p><strong>Base Price:</strong> $${currentProduct.price}</p>
        </div>
      </div>

      ${priceBreakdownMarkup}

      <div class="builder-section builder-section-option">
        ${bandWidthMarkup}
      </div>

      <div class="builder-section builder-section-option">
        ${metalMarkup}
      </div>

      <section class="builder-section engraving-section">
        <h3>Engraving Options:</h3>
        ${supportsInsideEngraving(currentProduct) ? `
          <label class="engraving-field">Inside Text:
            <textarea
              rows="2"
              oninput="setEngraving('inside', this.value)"
            >${engravingTextInside}</textarea>
          </label>
        ` : ""}

        ${supportsOutsideEngraving(currentProduct) ? `
          <label class="engraving-field">Outside Text:
            <textarea
              rows="2"
              oninput="setEngraving('outside', this.value)"
            >${engravingTextOutside}</textarea>
          </label>
        ` : ""}

        <small>$${pricingData.engravingPerWord || 0} per word</small>
      </section>

      ${symbolMarkup}

      <section class="builder-section customization-section">
        <h3>Customization Add-ons:</h3>
        ${addOnMarkup}
      </section>

      <section class="builder-section order-notes-section">
        <h3>Order Notes</h3>
        <textarea
          rows="6"
          oninput="setOrderNotes(this.value)"
          placeholder="Example:&#10;Inside text: I ❤️ love you&#10;Place the heart after the letter I.&#10;You can also use this box to explain symbol placement, order, or custom requests."
        >${orderNotes}</textarea>
      </section>

      <div class="builder-actions">
        <button class="add-to-cart-main" onclick="addCurrentRingToCart()">
          Add to Cart
        </button>

        <button class="add-to-cart-main" type="button" onclick="addCurrentRingToWishlist()">
          Add to Wishlist
        </button>
      </div>

      <section class="builder-section how-it-works">
        <h3>How This Works</h3>
        <p><strong>Add to Wishlist</strong> — Save your design and receive a free preview before ordering</p>
        <p><strong>Preview turnaround:</strong> 3D design previews are typically delivered within 2–3 business days. Timing may vary depending on design complexity and workload</p>
        <p><strong>Add to Cart</strong> — Move forward with your custom order at the current total price</p>
      </section>

      <div class="price-box">
        <h2>Total Price: $${price}</h2>
      </div>

      <div class="cart-box">
        <h3>🛒 Cart (${cart.length})</h3>
        <ul>
          ${cart.map(item => `
            <li>${item.productName} (${item.builderKey}) — $${item.unitPrice}</li>
          `).join("")}
        </ul>

        <h3>♡ Wishlist (${wishlist.length})</h3>
        <ul>
          ${wishlist.map(item => `
            <li>${item.productName} (${item.builderKey})</li>
          `).join("")}
        </ul>
      </div>
    </section>
  `;
}

window.setBandWidth = value => {
  currentBandWidth = value;
  render();
};

window.setMetal = value => {
  currentMetal = value;
  render();
};

window.toggleAddOn = (addon, checked) => {
  if (checked) {
    if (!selectedAddOns.includes(addon)) {
      selectedAddOns.push(addon);
    }
  } else {
    selectedAddOns = selectedAddOns.filter(item => item !== addon);
  }
  render();
};

window.setEngraving = (type, value) => {
  if (type === "inside") engravingTextInside = value;
  if (type === "outside") engravingTextOutside = value;
  updatePriceUI();
};

window.toggleSymbolSection = () => {
  symbolSectionExpanded = !symbolSectionExpanded;
  render();
};

window.toggleSymbol = symbolId => {
  if (selectedSymbols.includes(symbolId)) {
    selectedSymbols = selectedSymbols.filter(item => item !== symbolId);
    if (symbolId === "custom-symbol") {
      customSymbolDesignRequestOptIn = false;
      customSymbolDesignDescription = "";
      customSymbolUploadFileName = "";
    }
  } else {
    selectedSymbols.push(symbolId);
  }
  render();
};

window.setOrderNotes = value => {
  orderNotes = value;
};

window.setCustomSymbolDesignRequest = checked => {
  customSymbolDesignRequestOptIn = checked;
  if (!checked) {
    customSymbolDesignDescription = "";
  }
  render();
};

window.setCustomSymbolDesignDescription = value => {
  customSymbolDesignDescription = value;
};

window.setCustomSymbolUploadFileName = files => {
  customSymbolUploadFileName = files?.[0]?.name || "";
};

window.addCurrentRingToCart = () => {
  if (!currentProduct) return;
  const selectedSymbolDetails = selectedSymbols
    .map(symbolId => symbolsData.find(item => item.id === symbolId))
    .filter(Boolean);

  const item = {
    id: Date.now(),
    builderKey: currentProduct.builderKey,
    sku: currentProduct.sku,
    slug: currentProduct.slug,
    productName: currentProduct.title,
    collection: currentProduct.collection,
    mode: "rings",
    metal: currentMetal,
    bandWidth: currentBandWidth || currentProduct.band_width,
    engravingInside: supportsInsideEngraving(currentProduct) ? engravingTextInside : "",
    engravingOutside: supportsOutsideEngraving(currentProduct) ? engravingTextOutside : "",
    addOns: [...selectedAddOns],
    symbols: [...selectedSymbolDetails],
    customSymbolCleanupFeeSelected: false,
    customSymbolDesignRequestSelected: customSymbolDesignRequestOptIn,
    customSymbolDesignDescription: customSymbolDesignDescription.trim(),
    customSymbolUploadFileName,
    orderNotes,
    symbolPlacementNotes: orderNotes,
    unitPrice: calculatePrice(),
    quantity: 1,
    shippingProfile: "ring",
    image: currentProduct.image,
    gallery: getProductGallery(currentProduct),
    sourceUrl: window.location.pathname + window.location.search
  };

  cart.push(item);
  persistCart();
  render();
};

window.addCurrentRingToWishlist = () => {
  if (!currentProduct) return;

  wishlist.push({
    builderKey: currentProduct.builderKey,
    sku: currentProduct.sku,
    slug: currentProduct.slug,
    productName: currentProduct.title,
    mode: "rings",
    image: currentProduct.image
  });

  persistWishlist();
  render();
};

async function loadData() {
  const [ringsResp, pricingResp, symbolsResp] = await Promise.all([
    fetch("data/rings.json"),
    fetch("data/pricing.json"),
    fetch("data/symbols.json")
  ]);

  const ringsJson = await ringsResp.json();
  pricingData = await pricingResp.json();
  symbolsData = await symbolsResp.json();

  let rawProducts = [];

  if (Array.isArray(ringsJson)) {
    rawProducts = ringsJson;
  } else if (Array.isArray(ringsJson.items)) {
    rawProducts = ringsJson.items;
  } else if (typeof ringsJson === "object" && ringsJson !== null) {
    rawProducts = Object.values(ringsJson).flat().filter(Boolean);
  }

  ringsData = rawProducts.map(normalizeProduct);

  const builderKey = getUrlParam("sku");
  currentProduct = findRingByBuilderKey(ringsData, builderKey);

  if (currentProduct) {
    initializeSelections();
  }

  render();
}

loadData();
