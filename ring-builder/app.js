const app = document.getElementById('app');

let ringsData = {};
let charmsData = {};
let pricingData = {};

let currentMode = 'rings';
let currentProduct = null;

let currentHeight = "3-6mm";
let currentSize = "Dime (17.9mm)";
let currentMetal = "Silver";
let selectedAddOns = [];
let engravingTextInside = "";
let engravingTextOutside = "";

let cart = JSON.parse(localStorage.getItem('cdla_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('cdla_wishlist')) || [];

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    sku: params.get('sku') || '',
    mode: params.get('mode') || ''
  };
}

function detectModeFromPage() {
  const { mode, sku } = getUrlParams();

  if (mode === 'rings' || mode === 'charms') {
    return mode;
  }

  if (sku) {
    const normalizedSku = sku.toLowerCase();
    if (
      normalizedSku.startsWith('cl-') ||
      normalizedSku.startsWith('gs-') ||
      normalizedSku.startsWith('wr-') ||
      normalizedSku.startsWith('r-')
    ) {
      return 'rings';
    }
    if (
      normalizedSku.startsWith('hf-') ||
      normalizedSku.startsWith('hs-') ||
      normalizedSku.startsWith('hfr-') ||
      normalizedSku.startsWith('c-')
    ) {
      return 'charms';
    }
  }

  const path = window.location.pathname.toLowerCase();
  if (path.includes('/builder/ring')) return 'rings';
  if (path.includes('/builder/charm')) return 'charms';

  return 'rings';
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getProductSku(product) {
  return (
    product?.sku ||
    product?.SKU ||
    product?.id ||
    product?.slug ||
    ''
  );
}

function getProductName(product) {
  return (
    product?.name ||
    product?.title ||
    product?.productName ||
    'Custom Piece'
  );
}

function getProductImage(product) {
  return (
    product?.img ||
    product?.image ||
    product?.featured_image ||
    product?.featuredImage ||
    ''
  );
}

function flattenProducts(collectionsObj) {
  const products = [];

  Object.entries(collectionsObj || {}).forEach(([collectionName, items]) => {
    if (!Array.isArray(items)) return;

    items.forEach(item => {
      products.push({
        ...item,
        collectionName
      });
    });
  });

  return products;
}

function findProductBySku(collectionsObj, sku) {
  const allProducts = flattenProducts(collectionsObj);
  const normalizedSku = normalizeValue(sku);

  return allProducts.find(product => {
    const productSku = normalizeValue(getProductSku(product));
    return productSku === normalizedSku;
  }) || null;
}

function getAllowedMetals() {
  if (Array.isArray(currentProduct?.availableMetals) && currentProduct.availableMetals.length) {
    return currentProduct.availableMetals;
  }
  if (Array.isArray(currentProduct?.metals) && currentProduct.metals.length) {
    return currentProduct.metals;
  }
  return Object.keys(pricingData.metals || {});
}

function getAllowedAddOns() {
  if (Array.isArray(currentProduct?.availableAddOns) && currentProduct.availableAddOns.length) {
    return currentProduct.availableAddOns;
  }
  if (Array.isArray(currentProduct?.addOnsAvailable) && currentProduct.addOnsAvailable.length) {
    return currentProduct.addOnsAvailable;
  }
  return Object.keys(pricingData.addOns || {});
}

function getAllowedRingHeights() {
  if (Array.isArray(currentProduct?.availableRingHeights) && currentProduct.availableRingHeights.length) {
    return currentProduct.availableRingHeights;
  }
  if (Array.isArray(currentProduct?.ringHeights) && currentProduct.ringHeights.length) {
    return currentProduct.ringHeights;
  }
  return Object.keys(pricingData.ringHeights || {});
}

function getAllowedCharmSizes() {
  if (Array.isArray(currentProduct?.availableCharmSizes) && currentProduct.availableCharmSizes.length) {
    return currentProduct.availableCharmSizes;
  }
  if (Array.isArray(currentProduct?.charmSizes) && currentProduct.charmSizes.length) {
    return currentProduct.charmSizes;
  }
  return Object.keys(pricingData.charmSizes || {});
}

function supportsInsideEngraving() {
  if (typeof currentProduct?.engravingInside === 'boolean') return currentProduct.engravingInside;
  if (typeof currentProduct?.allowInsideEngraving === 'boolean') return currentProduct.allowInsideEngraving;
  return true;
}

function supportsOutsideEngraving() {
  if (typeof currentProduct?.engravingOutside === 'boolean') return currentProduct.engravingOutside;
  if (typeof currentProduct?.allowOutsideEngraving === 'boolean') return currentProduct.allowOutsideEngraving;
  return true;
}

function calculatePrice() {
  let base = pricingData.designFee || 0;

  if (currentMode === 'rings') {
    base += pricingData.ringHeights?.[currentHeight] || 0;
  } else {
    base += pricingData.charmSizes?.[currentSize] || 0;
  }

  base += pricingData.metals?.[currentMetal] || 0;

  selectedAddOns.forEach(addon => {
    base += pricingData.addOns?.[addon] || 0;
  });

  let engravingWords = 0;

  if (supportsInsideEngraving()) {
    engravingWords += engravingTextInside
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  if (supportsOutsideEngraving()) {
    engravingWords += engravingTextOutside
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  base += engravingWords * (pricingData.engravingPerWord || 0);

  return base;
}

function updatePriceUI() {
  const price = calculatePrice();
  const priceBox = document.querySelector('.price-box h2');
  if (priceBox) {
    priceBox.textContent = `Total Price: $${price}`;
  }
}

function syncSelectionsToProduct() {
  if (!currentProduct) return;

  const allowedMetals = getAllowedMetals();
  if (!allowedMetals.includes(currentMetal)) {
    currentMetal = allowedMetals[0] || 'Silver';
  }

  if (currentMode === 'rings') {
    const allowedHeights = getAllowedRingHeights();
    if (!allowedHeights.includes(currentHeight)) {
      currentHeight = allowedHeights[0] || Object.keys(pricingData.ringHeights || {})[0] || "3-6mm";
    }
    currentSize = "";
  } else {
    const allowedSizes = getAllowedCharmSizes();
    if (!allowedSizes.includes(currentSize)) {
      currentSize = allowedSizes[0] || Object.keys(pricingData.charmSizes || {})[0] || "Dime (17.9mm)";
    }
    currentHeight = "";
  }

  const allowedAddOns = getAllowedAddOns();
  selectedAddOns = selectedAddOns.filter(addon => allowedAddOns.includes(addon));

  if (!supportsInsideEngraving()) {
    engravingTextInside = "";
  }

  if (!supportsOutsideEngraving()) {
    engravingTextOutside = "";
  }
}

function persistCart() {
  localStorage.setItem('cdla_cart', JSON.stringify(cart));
}

function persistWishlist() {
  localStorage.setItem('cdla_wishlist', JSON.stringify(wishlist));
}

function renderBuilderNotFound() {
  app.innerHTML = `
    <section class="builder-shell">
      <h2>${currentMode === 'rings' ? 'Ring' : 'Charm'} Builder</h2>
      <p>We couldn’t find a ${currentMode === 'rings' ? 'ring' : 'charm'} for this SKU.</p>
      <p>Please check the product link and try again.</p>
    </section>
  `;
}

function render() {
  if (!currentProduct) {
    renderBuilderNotFound();
    return;
  }

  syncSelectionsToProduct();

  const productName = getProductName(currentProduct);
  const productSku = getProductSku(currentProduct);
  const productImage = getProductImage(currentProduct);
  const allowedMetals = getAllowedMetals();
  const allowedAddOns = getAllowedAddOns();
  const price = calculatePrice();

  const metalOptions = allowedMetals.map(metal => `
    <option value="${metal}" ${metal === currentMetal ? 'selected' : ''}>
      ${metal} (+$${pricingData.metals?.[metal] || 0})
    </option>
  `).join('');

  const addOnCheckboxes = allowedAddOns.length
    ? allowedAddOns.map(addon => {
        const checked = selectedAddOns.includes(addon);
        return `
          <label>
            <input
              type="checkbox"
              ${checked ? 'checked' : ''}
              onchange="toggleAddOn('${addon}', this.checked)"
            />
            ${addon} (+$${pricingData.addOns?.[addon] || 0})
          </label><br/>
        `;
      }).join('')
    : '<p>No add-ons available for this piece.</p>';

  const ringHeightSection = currentMode === 'rings'
    ? `
      <h3>Select Band Height:</h3>
      <select onchange="setHeight(this.value)">
        ${getAllowedRingHeights().map(height => `
          <option value="${height}" ${height === currentHeight ? 'selected' : ''}>
            ${height} (+$${pricingData.ringHeights?.[height] || 0})
          </option>
        `).join('')}
      </select>
    `
    : '';

  const charmSizeSection = currentMode === 'charms'
    ? `
      <h3>Select Charm Size:</h3>
      <select onchange="setSize(this.value)">
        ${getAllowedCharmSizes().map(size => `
          <option value="${size}" ${size === currentSize ? 'selected' : ''}>
            ${size} (+$${pricingData.charmSizes?.[size] || 0})
          </option>
        `).join('')}
      </select>
    `
    : '';

  const engravingSection = (!supportsInsideEngraving() && !supportsOutsideEngraving())
    ? `
      <h3>Engraving Options:</h3>
      <p>Engraving is not available for this piece.</p>
    `
    : `
      <h3>Engraving Options:</h3>

      ${supportsInsideEngraving() ? `
        <label>Inside Text:
          <input
            type="text"
            value="${engravingTextInside}"
            oninput="setEngraving('inside', this.value)"
          />
        </label><br/>
      ` : ''}

      ${supportsOutsideEngraving() ? `
        <label>Outside Text:
          <input
            type="text"
            value="${engravingTextOutside}"
            oninput="setEngraving('outside', this.value)"
          />
        </label><br/>
      ` : ''}

      <small>$${pricingData.engravingPerWord || 0} per word</small>
    `;

  const imageMarkup = productImage
    ? `<img src="${productImage}" alt="${productName}" class="builder-product-image" onerror="this.style.display='none'" />`
    : '';

  app.innerHTML = `
    <section class="builder-shell">
      <h2>${currentMode === 'rings' ? 'Ring' : 'Charm'} Builder</h2>

      <div class="builder-product-header">
        ${imageMarkup}
        <div class="builder-product-meta">
          <h3>${productName}</h3>
          <p><strong>SKU:</strong> ${productSku || 'N/A'}</p>
          <p><strong>Collection:</strong> ${currentProduct.collectionName || 'N/A'}</p>
        </div>
      </div>

      ${ringHeightSection}
      ${charmSizeSection}

      <h3>Select Metal:</h3>
      <select onchange="setMetal(this.value)">${metalOptions}</select>

      ${engravingSection}

      <h3>Customization Add-ons:</h3>
      ${addOnCheckboxes}

      <button class="add-to-cart-main" onclick="addCurrentProductToCart()">
        Add to Cart
      </button>

      <div class="price-box">
        <h2>Total Price: $${price}</h2>
      </div>

      <div class="cart-box">
        <h3>🛒 Cart (${cart.length})</h3>
        <ul>
          ${cart.map(item => `
            <li>
              ${item.productName} (${item.sku || 'no-sku'}) — $${item.unitPrice}
            </li>
          `).join('')}
        </ul>

        <h3>♡ Wishlist (${wishlist.length})</h3>
        <ul>
          ${wishlist.map(item => `
            <li>
              ${item.productName} (${item.sku || 'no-sku'})
            </li>
          `).join('')}
        </ul>
      </div>
    </section>
  `;
}

window.setHeight = value => {
  currentHeight = value;
  render();
};

window.setSize = value => {
  currentSize = value;
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
  if (type === 'inside') engravingTextInside = value;
  if (type === 'outside') engravingTextOutside = value;
  updatePriceUI();
};

window.addCurrentProductToCart = () => {
  if (!currentProduct) return;

  const item = {
    id: Date.now(),
    sku: getProductSku(currentProduct),
    productName: getProductName(currentProduct),
    collection: currentProduct.collectionName || '',
    mode: currentMode,
    metal: currentMetal,
    bandHeight: currentMode === 'rings' ? currentHeight : null,
    charmSize: currentMode === 'charms' ? currentSize : null,
    engravingInside: supportsInsideEngraving() ? engravingTextInside : '',
    engravingOutside: supportsOutsideEngraving() ? engravingTextOutside : '',
    addOns: [...selectedAddOns],
    unitPrice: calculatePrice(),
    quantity: 1,
    shippingProfile: currentMode === 'rings' ? 'ring' : 'charm',
    image: getProductImage(currentProduct)
  };

  cart.push(item);
  persistCart();
  render();
};

window.addCurrentProductToWishlist = () => {
  if (!currentProduct) return;

  const item = {
    sku: getProductSku(currentProduct),
    productName: getProductName(currentProduct),
    mode: currentMode,
    image: getProductImage(currentProduct)
  };

  wishlist.push(item);
  persistWishlist();
  render();
};

function initializeProduct() {
  const { sku } = getUrlParams();
  currentMode = detectModeFromPage();

  if (currentMode === 'rings') {
    currentProduct = findProductBySku(ringsData, sku);
  } else {
    currentProduct = findProductBySku(charmsData, sku);
  }

  syncSelectionsToProduct();
}

async function loadData() {
  const [ringsResp, charmsResp, pricingResp] = await Promise.all([
    fetch('data/rings.json'),
    fetch('data/charms.json'),
    fetch('data/pricing.json')
  ]);

  ringsData = await ringsResp.json();
  charmsData = await charmsResp.json();
  pricingData = await pricingResp.json();

  initializeProduct();
  render();
}

loadData();
