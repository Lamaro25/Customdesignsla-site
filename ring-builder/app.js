const app = document.getElementById('app');

let ringsData = [];
let pricingData = {};
let currentProduct = null;

let currentHeight = "";
let currentMetal = "Silver";
let selectedAddOns = [];
let engravingTextInside = "";
let engravingTextOutside = "";

let cart = JSON.parse(localStorage.getItem('cdla_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('cdla_wishlist')) || [];

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return (params.get(name) || "").trim();
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function slugify(value) {
  return normalize(value)
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProductTitle(product) {
  return product.title || product.name || "Custom Ring";
}

function getProductSku(product) {
  return (product.sku || "").trim();
}

function getProductSlug(product) {
  return (product.slug || slugify(getProductTitle(product))).trim();
}

function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length) return product.images[0];
  if (Array.isArray(product.gallery) && product.gallery.length) return product.gallery[0];
  return product.img || "";
}

function getProductCollection(product) {
  return product.collection || "Ring Collection";
}

function getAvailableRingHeights(product) {
  if (Array.isArray(product.availableRingHeights) && product.availableRingHeights.length) {
    return product.availableRingHeights;
  }

  if (product.band_width) {
    return [product.band_width];
  }

  return Object.keys(pricingData.ringHeights || {});
}

function getAvailableMetals(product) {
  if (Array.isArray(product.availableMetals) && product.availableMetals.length) {
    return product.availableMetals;
  }

  if (product.material && /sterling|silver/i.test(product.material)) {
    return ["Silver"];
  }

  return Object.keys(pricingData.metals || {});
}

function getAvailableAddOns(product) {
  if (Array.isArray(product.availableAddOns) && product.availableAddOns.length) {
    return product.availableAddOns;
  }

  const notes = `${product.description || ""} ${product.notes || ""} ${product.content || ""}`.toLowerCase();

  if (notes.includes("customization available") || notes.includes("engraving")) {
    return Object.keys(pricingData.addOns || {});
  }

  return Object.keys(pricingData.addOns || {});
}

function supportsInsideEngraving(product) {
  if (typeof product.allowInsideEngraving === "boolean") return product.allowInsideEngraving;
  return true;
}

function supportsOutsideEngraving(product) {
  if (typeof product.allowOutsideEngraving === "boolean") return product.allowOutsideEngraving;
  return false;
}

function getBaseProductPrice(product) {
  return Number(product.price || 0);
}

function findRingBySkuOrSlug(products, rawValue) {
  const query = normalize(rawValue);

  return products.find(product => {
    const sku = normalize(getProductSku(product));
    const slug = normalize(getProductSlug(product));
    const skuSlug = normalize(`${sku}-${slug}`);

    return query === sku || query === slug || query === skuSlug;
  }) || null;
}

function initializeSelections() {
  if (!currentProduct) return;

  const heights = getAvailableRingHeights(currentProduct);
  const metals = getAvailableMetals(currentProduct);

  currentHeight = heights[0] || "";
  currentMetal = metals[0] || "Silver";
  selectedAddOns = [];
  engravingTextInside = "";
  engravingTextOutside = "";
}

function calculatePrice() {
  if (!currentProduct) return 0;

  let total = getBaseProductPrice(currentProduct);

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
  app.innerHTML = `
    <section class="builder-shell">
      <h2>Ring Builder</h2>
      <p>We couldn’t find a ring for this SKU.</p>
      <p>Please check the product link and try again.</p>
    </section>
  `;
}

function render() {
  if (!currentProduct) {
    renderNotFound();
    return;
  }

  const productName = getProductTitle(currentProduct);
  const productSku = getProductSku(currentProduct);
  const productSlug = getProductSlug(currentProduct);
  const productCollection = getProductCollection(currentProduct);
  const productImage = getProductImage(currentProduct);

  const availableHeights = getAvailableRingHeights(currentProduct);
  const availableMetals = getAvailableMetals(currentProduct);
  const availableAddOns = getAvailableAddOns(currentProduct);

  const price = calculatePrice();

  const imageMarkup = productImage
    ? `<img src="${productImage}" alt="${productName}" class="builder-product-image" onerror="this.style.display='none'" />`
    : "";

  const ringHeightOptions = availableHeights.map(height => `
    <option value="${height}" ${height === currentHeight ? "selected" : ""}>
      ${height}
    </option>
  `).join("");

  const metalOptions = availableMetals.map(metal => `
    <option value="${metal}" ${metal === currentMetal ? "selected" : ""}>
      ${metal} (+$${pricingData.metals?.[metal] || 0})
    </option>
  `).join("");

  const addOnMarkup = availableAddOns.length
    ? availableAddOns.map(addon => `
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

  const engravingMarkup = `
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
  `;

  app.innerHTML = `
    <section class="builder-shell">
      <h2>Ring Builder</h2>

      <div class="builder-product-header">
        ${imageMarkup}
        <div class="builder-product-meta">
          <h3>${productName}</h3>
          <p><strong>SKU:</strong> ${productSku}</p>
          <p><strong>Slug:</strong> ${productSlug}</p>
          <p><strong>Collection:</strong> ${productCollection}</p>
          <p><strong>Base Price:</strong> $${getBaseProductPrice(currentProduct)}</p>
        </div>
      </div>

      <h3>Select Band Width:</h3>
      <select onchange="setHeight(this.value)">
        ${ringHeightOptions}
      </select>

      <h3>Select Metal:</h3>
      <select onchange="setMetal(this.value)">
        ${metalOptions}
      </select>

      ${engravingMarkup}

      <h3>Customization Add-ons:</h3>
      ${addOnMarkup}

      <button class="add-to-cart-main" onclick="addCurrentRingToCart()">
        Add to Cart
      </button>

      <button class="add-to-cart-main" onclick="addCurrentRingToWishlist()" type="button">
        Add to Wishlist
      </button>

      <div class="price-box">
        <h2>Total Price: $${price}</h2>
      </div>

      <div class="cart-box">
        <h3>🛒 Cart (${cart.length})</h3>
        <ul>
          ${cart.map(item => `
            <li>${item.productName} (${item.sku}) — $${item.unitPrice}</li>
          `).join("")}
        </ul>

        <h3>♡ Wishlist (${wishlist.length})</h3>
        <ul>
          ${wishlist.map(item => `
            <li>${item.productName} (${item.sku})</li>
          `).join("")}
        </ul>
      </div>
    </section>
  `;
}

window.setHeight = value => {
  currentHeight = value;
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
    sku: getProductSku(currentProduct),
    slug: getProductSlug(currentProduct),
    productName: getProductTitle(currentProduct),
    collection: getProductCollection(currentProduct),
    mode: "rings",
    metal: currentMetal,
    bandHeight: currentHeight,
    engravingInside: supportsInsideEngraving(currentProduct) ? engravingTextInside : "",
    engravingOutside: supportsOutsideEngraving(currentProduct) ? engravingTextOutside : "",
    addOns: [...selectedAddOns],
    unitPrice: calculatePrice(),
    quantity: 1,
    shippingProfile: "ring",
    image: getProductImage(currentProduct),
    sourceUrl: window.location.pathname
  };

  cart.push(item);
  persistCart();
  render();
};

window.addCurrentRingToWishlist = () => {
  if (!currentProduct) return;

  wishlist.push({
    sku: getProductSku(currentProduct),
    slug: getProductSlug(currentProduct),
    productName: getProductTitle(currentProduct),
    mode: "rings",
    image: getProductImage(currentProduct)
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

  if (Array.isArray(ringsJson)) {
    ringsData = ringsJson;
  } else if (Array.isArray(ringsJson.items)) {
    ringsData = ringsJson.items;
  } else if (typeof ringsJson === "object" && ringsJson !== null) {
    ringsData = Object.values(ringsJson).flat().filter(Boolean);
  } else {
    ringsData = [];
  }

  const rawSku = getUrlParam("sku");
  currentProduct = findRingBySkuOrSlug(ringsData, rawSku);

  if (currentProduct) {
    initializeSelections();
  }

  render();
}

loadData();
