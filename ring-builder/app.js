const app = document.getElementById('app');

let ringsData = [];
let pricingData = {};
let currentProduct = null;

let currentMetal = "Silver";
let currentBandWidth = "";
let selectedAddOns = [];
let engravingTextInside = "";
let engravingTextOutside = "";

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
    price: Number(product.price || 0)
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
  if (Array.isArray(product.availableAddOns) && product.availableAddOns.length) {
    return product.availableAddOns;
  }

  return Object.keys(pricingData.addOns || {});
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

function initializeSelections() {
  if (!currentProduct) return;

  const metals = getAvailableMetals(currentProduct);
  const bandWidths = getAvailableBandWidths(currentProduct);

  currentMetal = metals[0] || "Silver";
  currentBandWidth = bandWidths[0] || "";
  selectedAddOns = [];
  engravingTextInside = "";
  engravingTextOutside = "";
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

  return total;
}

function updatePriceUI() {
  const priceBox = document.querySelector(".price-box h2");
  if (priceBox) {
    priceBox.textContent = `Total Price: $${calculatePrice()}`;
  }
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
      <h2>Ring Builder</h2>
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
  const price = calculatePrice();

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

  app.innerHTML = `
    <section class="builder-shell">
      <h2>Ring Builder</h2>

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

      ${bandWidthMarkup}

      <h3>Select Metal:</h3>
      <select onchange="setMetal(this.value)">
        ${metalOptions}
      </select>

      <h3>Engraving Options:</h3>
      ${supportsInsideEngraving(currentProduct) ? `
        <label>Inside Text:
          <input
            type="text"
            value="${engravingTextInside}"
            oninput="setEngraving('inside', this.value)"
          />
        </label><br/>
      ` : ""}

      ${supportsOutsideEngraving(currentProduct) ? `
        <label>Outside Text:
          <input
            type="text"
            value="${engravingTextOutside}"
            oninput="setEngraving('outside', this.value)"
          />
        </label><br/>
      ` : ""}

      <small>$${pricingData.engravingPerWord || 0} per word</small>

      <h3>Customization Add-ons:</h3>
      ${addOnMarkup}

      <button class="add-to-cart-main" onclick="addCurrentRingToCart()">
        Add to Cart
      </button>

      <button class="add-to-cart-main" type="button" onclick="addCurrentRingToWishlist()">
        Add to Wishlist
      </button>

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

window.addCurrentRingToCart = () => {
  if (!currentProduct) return;

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
  const [ringsResp, pricingResp] = await Promise.all([
    fetch("data/rings.json"),
    fetch("data/pricing.json")
  ]);

  const ringsJson = await ringsResp.json();
  pricingData = await pricingResp.json();

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
