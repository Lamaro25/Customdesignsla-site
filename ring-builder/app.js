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
let howThisWorksExpanded = false;
let customSymbolDesignRequestOptIn = false;
let customSymbolDesignDescription = "";
let customSymbolUploadFileName = "";
let orderNotes = "";
let selectedRingSize = "";
const CUSTOM_SYMBOL_SERVICE_FEE = 10;
const RING_SIZE_OPTIONS = [
  "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9",
  "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13", "13.5"
];

let cart = JSON.parse(localStorage.getItem('cdla_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('cdla_wishlist')) || [];

let totalPriceVisibilityObserver = null;
let activeTextEntryField = null;
let keyboardViewportListenersBound = false;
let inputFocusListenersBound = false;

const TEXT_ENTRY_INPUT_TYPES = new Set([
  "text",
  "search",
  "email",
  "tel",
  "url",
  "password",
  "number"
]);

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

function isWesternRingProduct(product) {
  return /western ring/i.test(product?.collection || "");
}

function supportsInnerSymbolSelection(product) {
  return isCubanLinkProduct(product) || isWesternRingProduct(product);
}

function getAvailableSymbols(product) {
  if (!supportsInnerSymbolSelection(product)) {
    return [];
  }

  const symbolCollectionKey = isWesternRingProduct(product)
    ? "western-ring-collection"
    : "cuban-link-ring-collection";

  return symbolsData.filter(symbol => {
    if (symbol.active === false) return false;
    if (symbol.usageType !== "inner-engraved-symbol") return false;
    if (!Array.isArray(symbol.collections) || !symbol.collections.length) return true;

    if (symbol.collections.includes(symbolCollectionKey)) return true;

    // Keep existing symbol inventory available for Western rings without
    // forcing a separate symbol catalog migration.
    if (isWesternRingProduct(product)) {
      return symbol.collections.includes("cuban-link-ring-collection");
    }

    return false;
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

function countEngravingWords(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function getIncludedOutsideWords(product) {
  const includedWords = Number(product?.includedOutsideWords || 0);
  if (!supportsOutsideEngraving(product)) return 0;
  if (!Number.isFinite(includedWords) || includedWords <= 0) return 0;
  return Math.floor(includedWords);
}

function getChargeableEngravingWords(product) {
  const insideWords = supportsInsideEngraving(product) ? countEngravingWords(engravingTextInside) : 0;
  const outsideWords = supportsOutsideEngraving(product) ? countEngravingWords(engravingTextOutside) : 0;
  const includedOutsideWords = getIncludedOutsideWords(product);
  const chargeableOutsideWords = Math.max(outsideWords - includedOutsideWords, 0);

  return {
    insideWords,
    outsideWords,
    includedOutsideWords,
    chargeableOutsideWords,
    chargeableInsideWords: insideWords
  };
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
  howThisWorksExpanded = false;
  customSymbolDesignRequestOptIn = false;
  customSymbolDesignDescription = "";
  customSymbolUploadFileName = "";
  orderNotes = "";
  selectedRingSize = RING_SIZE_OPTIONS[0];
}

function calculatePrice() {
  if (!currentProduct) return 0;

  let total = currentProduct.price || 0;

  selectedAddOns.forEach(addon => {
    total += pricingData.addOns?.[addon] || 0;
  });

  const {
    chargeableInsideWords,
    chargeableOutsideWords
  } = getChargeableEngravingWords(currentProduct);
  const engravingWords = chargeableInsideWords + chargeableOutsideWords;
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
  const livePrice = `Total Price: $${calculatePrice()}`;
  const priceElements = document.querySelectorAll('[data-live-total-price]');

  priceElements.forEach(priceElement => {
    priceElement.textContent = livePrice;
  });
}

function updateSymbolSelectionCardUI(symbolId, isSelected) {
  const symbolButtons = document.querySelectorAll(`.symbol-card[onclick="toggleSymbol('${symbolId}')"]`);

  symbolButtons.forEach(card => {
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
    const checkBox = card.querySelector(".symbol-select-checkbox");
    if (checkBox) {
      checkBox.textContent = isSelected ? "✓" : "";
    }
  });
}

function updateSymbolSummaryUI() {
  const symbolSummary = document.querySelector(".symbol-summary");
  if (!symbolSummary) return;

  const selectedSymbolDetails = selectedSymbols
    .map(symbolId => symbolsData.find(item => item.id === symbolId))
    .filter(Boolean);
  const symbolsTotal = selectedSymbolDetails.reduce((sum, symbol) => sum + Number(symbol.price || 0), 0);

  symbolSummary.textContent = `${selectedSymbolDetails.length} symbols selected — $${symbolsTotal}`;
}

function formatCurrency(amount) {
  return `$${Number(amount || 0)}`;
}

function getBuilderPriceBreakdown(product) {
  const breakdown = [];

  if (Array.isArray(product?.breakdown)) {
    product.breakdown.forEach(item => {
      breakdown.push({
        label: item.label || "Item",
        amount: Number(item.amount || 0),
        source: "base"
      });
    });
  }

  const addOnLines = selectedAddOns.map(addon => ({
    label: addon,
    amount: Number(pricingData.addOns?.[addon] || 0),
    source: "addon"
  }));

  const {
    chargeableInsideWords,
    chargeableOutsideWords
  } = getChargeableEngravingWords(product);

  const engravingWords = chargeableInsideWords + chargeableOutsideWords;

  if (engravingWords > 0) {
    breakdown.push({
      label: `Engraving ×${engravingWords} words`,
      amount: engravingWords * Number(pricingData.engravingPerWord || 0),
      source: "engraving"
    });
  }

  const selectedSymbolDetails = selectedSymbols
    .map(symbolId => symbolsData.find(item => item.id === symbolId))
    .filter(Boolean);

  selectedSymbolDetails.forEach(symbol => {
    breakdown.push({
      label: `Symbol: ${symbol.name || symbol.id || "Custom Symbol"}`,
      amount: Number(symbol.price || 0),
      source: "symbol"
    });
  });

  if (customSymbolDesignRequestOptIn) {
    breakdown.push({
      label: "Custom symbol design request",
      amount: CUSTOM_SYMBOL_SERVICE_FEE,
      source: "custom-symbol-design"
    });
  }

  return [...breakdown, ...addOnLines];
}

function saveCheckoutDraft(item) {
  if (!item) return;

  const checkoutDraft = {
    createdAt: new Date().toISOString(),
    productTitle: item.productName,
    sku: item.sku,
    collection: item.collection,
    ringSize: item.ringSize,
    insideText: item.engravingInside,
    outsideText: item.engravingOutside,
    selectedSymbols: item.symbols || [],
    customSymbolRequestSelected: item.customSymbolDesignRequestSelected,
    customSymbolRequestDescription: item.customSymbolDesignDescription || "",
    orderNotes: item.orderNotes || "",
    baseRingPrice: Number(currentProduct?.price || 0),
    priceBreakdown: getBuilderPriceBreakdown(currentProduct),
    totalPrice: Number(item.unitPrice || 0),
    productImage: item.image || "",
    builderUrl: item.sourceUrl || window.location.pathname + window.location.search
  };

  sessionStorage.setItem("cdla_checkout_draft", JSON.stringify(checkoutDraft));
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

  const includedOutsideWords = getIncludedOutsideWords(product);
  const includedOutsideMarkup = includedOutsideWords > 0 ? `
    <li class="price-breakdown-item">
      <span class="price-breakdown-line">Engraved Name ×${includedOutsideWords} — <strong>included</strong></span>
    </li>
  ` : "";

  return `
    <div class="price-breakdown builder-plaque">
      <h3>Price Breakdown</h3>
      <ul class="price-breakdown-list">
        ${rowsMarkup}
        ${includedOutsideMarkup}
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


function disconnectTotalPriceVisibilityObserver() {
  if (totalPriceVisibilityObserver) {
    totalPriceVisibilityObserver.disconnect();
    totalPriceVisibilityObserver = null;
  }
}

function setFloatingTotalVisibility(shouldShow) {
  const floatingBar = document.getElementById("floating-total-bar");
  if (!floatingBar) return;

  floatingBar.classList.toggle("is-hidden", !shouldShow);
  floatingBar.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

function isBuilderTextEntryField(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.closest(".builder-shell")) return false;

  if (element.matches("textarea")) return true;

  if (element.matches("input")) {
    const inputType = String(element.getAttribute("type") || "text").toLowerCase();
    return TEXT_ENTRY_INPUT_TYPES.has(inputType);
  }

  return element.isContentEditable;
}

function bindKeyboardViewportListeners() {
  if (keyboardViewportListenersBound || !window.visualViewport) return;

  window.visualViewport.addEventListener("resize", updateFloatingBarInputPosition);
  window.visualViewport.addEventListener("scroll", updateFloatingBarInputPosition);
  window.addEventListener("resize", updateFloatingBarInputPosition);

  keyboardViewportListenersBound = true;
}

function unbindKeyboardViewportListeners() {
  if (!keyboardViewportListenersBound || !window.visualViewport) return;

  window.visualViewport.removeEventListener("resize", updateFloatingBarInputPosition);
  window.visualViewport.removeEventListener("scroll", updateFloatingBarInputPosition);
  window.removeEventListener("resize", updateFloatingBarInputPosition);

  keyboardViewportListenersBound = false;
}

function updateFloatingBarInputPosition() {
  const floatingBar = document.getElementById("floating-total-bar");
  const body = document.body;
  if (!floatingBar || !body) return;

  const hasFocusedInput =
    activeTextEntryField &&
    activeTextEntryField.isConnected &&
    document.activeElement === activeTextEntryField;

  body.classList.toggle("input-focused", Boolean(hasFocusedInput));
  floatingBar.classList.toggle("input-focused", Boolean(hasFocusedInput));

  if (!hasFocusedInput) {
    body.classList.remove("keyboard-open");
    floatingBar.style.removeProperty("--floating-total-keyboard-offset");
    return;
  }

  let keyboardOffset = 0;
  const viewport = window.visualViewport;

  if (viewport) {
    const keyboardHeight = Math.max(
      0,
      window.innerHeight - viewport.height - viewport.offsetTop
    );
    if (keyboardHeight > 0) {
      keyboardOffset = keyboardHeight + 12;
    }
  }

  const floatingBarHeight = floatingBar.offsetHeight || 62;
  const estimatedBarTop = window.innerHeight - keyboardOffset - floatingBarHeight - 12;
  const activeRect = activeTextEntryField.getBoundingClientRect();
  const overlapPadding = 10;
  const overlapAmount = activeRect.bottom - (estimatedBarTop - overlapPadding);

  if (overlapAmount > 0) {
    keyboardOffset += overlapAmount;
  }

  const maxOffset = Math.max(0, window.innerHeight - floatingBarHeight - 16);
  keyboardOffset = Math.min(Math.max(0, keyboardOffset), maxOffset);

  body.classList.toggle("keyboard-open", keyboardOffset > 0);
  floatingBar.style.setProperty("--floating-total-keyboard-offset", `${Math.round(keyboardOffset)}px`);
}

function setupFloatingInputFocusBehavior() {
  if (inputFocusListenersBound) return;

  document.addEventListener("focusin", event => {
    const target = event.target;
    if (!isBuilderTextEntryField(target)) return;

    activeTextEntryField = target;
    bindKeyboardViewportListeners();
    updateFloatingBarInputPosition();
  });

  document.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      const nextActive = document.activeElement;
      activeTextEntryField = isBuilderTextEntryField(nextActive) ? nextActive : null;

      if (!activeTextEntryField) {
        unbindKeyboardViewportListeners();
      }

      updateFloatingBarInputPosition();
    });
  });

  inputFocusListenersBound = true;
}

function setupFloatingTotalVisibility() {
  disconnectTotalPriceVisibilityObserver();

  const floatingBar = document.getElementById("floating-total-bar");
  const originalTotalSection = document.getElementById("original-total-price");

  if (!floatingBar || !originalTotalSection) return;

  if (!("IntersectionObserver" in window)) {
    setFloatingTotalVisibility(true);
    return;
  }

  setFloatingTotalVisibility(true);

  totalPriceVisibilityObserver = new IntersectionObserver(
    ([entry]) => {
      setFloatingTotalVisibility(!entry.isIntersecting);
    },
    {
      root: null,
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.05
    }
  );

  totalPriceVisibilityObserver.observe(originalTotalSection);
}

function renderNotFound() {
  disconnectTotalPriceVisibilityObserver();
  const requestedKey = getUrlParam("sku");

  app.innerHTML = `
    <section class="builder-shell">
      <div class="builder-plaque hero-plaque">
        <h2>Your Vision, Crafted in Silver</h2>
        <p>Designed by you. Hand-finished by Custom Design’s LA.</p>
      </div>
      <div class="builder-plaque">
        <p>We couldn’t find a ring for this product key.</p>
        <p><strong>Requested:</strong> ${requestedKey || "none"}</p>
      </div>
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
    : "";

  const ringSizeOptionsMarkup = RING_SIZE_OPTIONS.map(size => `
    <button
      type="button"
      class="ring-size-pill ${selectedRingSize === size ? "is-selected" : ""}"
      onclick="setRingSize('${size}')"
      aria-pressed="${selectedRingSize === size ? "true" : "false"}"
    >
      ${size}
    </button>
  `).join("");

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
  const symbolImageFileOverrides = {
    "acts": "ACTS.PNG",
    "cross": "Cross.PNG",
    "praying-hands": "Praying hands.PNG",
    "horse": "Horse.PNG",
    "horseshoe": "Horseshoe.PNG",
    "yin-and-yang": "Yin and yang.PNG",
    "turtle-dove": "Turtle dove.PNG",
    "elephant": "Elephant.PNG",
    "cardinal": "Cardinal.PNG",
    "heart": "Heart.PNG",
    "star": "Star.PNG",
    "crescent-moon": "Crecent moon.PNG",
    "custom-symbol": "Custom symbol:brand.PNG"
  };

  const normalizeSymbolImageName = name => String(name || "").trim();
  const toSentenceCaseSymbolName = name => {
    const normalized = normalizeSymbolImageName(name);
    if (!normalized) return "";
    const words = normalized.split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    return words
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(" ");
  };

  const buildSymbolImageCandidates = symbol => {
    const candidates = [];
    const push = value => {
      if (!value) return;
      if (!candidates.includes(value)) candidates.push(value);
    };

    const pushPngCandidateSet = basePath => {
      push(`${basePath}.PNG`);
      push(`${basePath}.png`);
    };

    // A. Explicit override files for known non-standard filenames.
    const overrideFile = symbolImageFileOverrides[symbol.id];
    if (overrideFile) {
      const symbolsOverridePath = `/static/img/symbols/${overrideFile}`;
      push(symbolsOverridePath);
      push(encodeURI(symbolsOverridePath));
      push(`/static/img/${overrideFile}`);
      push(`/img/${overrideFile}`);
    }

    const normalizedName = normalizeSymbolImageName(symbol.name);
    if (normalizedName) {
      // B. Exact symbol name in symbols directory.
      const nameBasedPath = `/static/img/symbols/${normalizedName}.PNG`;
      push(nameBasedPath);

      // C. URI-encoded exact symbol name.
      push(encodeURI(nameBasedPath));

      // D. Sentence-case variants for files where only first word is capitalized.
      const sentenceCaseName = toSentenceCaseSymbolName(normalizedName);
      if (sentenceCaseName && sentenceCaseName !== normalizedName) {
        const sentenceCasePath = `/static/img/symbols/${sentenceCaseName}.PNG`;
        push(sentenceCasePath);
        push(encodeURI(sentenceCasePath));
      }

      // Additional directory candidates to support legacy root /static/img paths.
      pushPngCandidateSet(`/static/img/symbols/${normalizedName}`);
      pushPngCandidateSet(`/static/img/${normalizedName}`);
      pushPngCandidateSet(`/img/${normalizedName}`);

      if (sentenceCaseName && sentenceCaseName !== normalizedName) {
        pushPngCandidateSet(`/static/img/symbols/${sentenceCaseName}`);
        pushPngCandidateSet(`/static/img/${sentenceCaseName}`);
        pushPngCandidateSet(`/img/${sentenceCaseName}`);
        push(encodeURI(`/static/img/${sentenceCaseName}.PNG`));
      }
    }

    // E. Existing explicit symbol.image value.
    if (symbol.image) {
      push(symbol.image);
    }

    // F. imageKey fallback paths.
    if (symbol.imageKey) {
      push(`/static/img/symbols/${symbol.imageKey}.PNG`);
      push(`/static/img/symbols/${symbol.imageKey}.png`);
      push(`/static/img/${symbol.imageKey}.PNG`);
      push(`/static/img/${symbol.imageKey}.png`);
      push(`/img/${symbol.imageKey}.PNG`);
      push(`/img/${symbol.imageKey}.png`);
    }

    return candidates;
  };

  const toAttrSafe = value => String(value || "").replace(/"/g, "&quot;");
  const renderSymbolImageMarkup = (symbol, imageClass = "") => {
    const candidates = buildSymbolImageCandidates(symbol);
    const initialSrc = candidates[0] || "";
    const classes = ["symbol-image", imageClass].filter(Boolean).join(" ");
    const candidateAttr = toAttrSafe(candidates.join("|"));

    return `
      <img
        class="${classes}"
        src="${initialSrc}"
        alt="${symbol.name}"
        loading="lazy"
        data-image-candidates="${candidateAttr}"
        data-image-index="0"
        style="${initialSrc ? "" : "display:none;"}"
        onerror="handleSymbolImageError(this)"
      />
      <div class="symbol-image-placeholder" style="${initialSrc ? "" : "display:grid;"}">No Image</div>
    `;
  };

  const symbolCardsMarkup = standardSymbols.map(symbol => {

    return `
    <button
      type="button"
      class="symbol-card ${selectedSymbols.includes(symbol.id) ? "is-selected" : ""}"
      onclick="toggleSymbol('${symbol.id}')"
      aria-pressed="${selectedSymbols.includes(symbol.id) ? "true" : "false"}"
    >
      <div class="symbol-image-wrap">
        ${renderSymbolImageMarkup(symbol)}
      </div>
      <span class="symbol-name">${symbol.name}</span>
      <span class="symbol-price">+$${symbol.price}</span>
      <span class="symbol-select-indicator" aria-hidden="true">
        <span class="symbol-select-checkbox">${selectedSymbols.includes(symbol.id) ? "✓" : ""}</span>
      </span>
    </button>
  `;
  }).join("");

  const isCustomSymbolSelected = selectedSymbols.includes("custom-symbol");
  const symbolIndicatorsMarkup = standardSymbols.length
    ? `
      <div class="symbol-indicator-row" aria-hidden="true">
        ${standardSymbols.slice(0, 5).map(symbol => `
          <div class="symbol-indicator-item">
            ${renderSymbolImageMarkup(symbol, "symbol-indicator-image")}
          </div>
        `).join("")}
      </div>
    `
    : "";

  const productSymbolNote = String(currentProduct.symbolCustomizationNote || "").trim();

  const symbolMarkup = symbols.length
    ? `
      <section class="symbol-section">
        <button
          type="button"
          class="symbol-toggle"
          onclick="toggleSymbolSection()"
          aria-expanded="${symbolSectionExpanded ? "true" : "false"}"
        >
          ${symbolSectionExpanded ? "Hide Symbol Options" : "Click here to add engraved symbols"}
        </button>
        ${productSymbolNote ? `
          <p class="symbol-help"><strong>Note:</strong> ${escapeHtml(productSymbolNote)}</p>
        ` : ""}
        ${symbolSectionExpanded ? `
          <div class="symbol-grid-wrap">
            <p class="symbol-help">Inner engraved symbols are available for this ring.</p>
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
                  ${renderSymbolImageMarkup(customSymbol, "custom-symbol-image")}
                </div>
                <div class="custom-symbol-trigger-copy">
                  <span class="custom-symbol-trigger-title">Custom Symbol / Brand</span>
                  <span class="custom-symbol-trigger-text">Need something custom? Upload a brand, logo, or request a new design.</span>
                </div>
                <span class="custom-symbol-trigger-price">+$${customSymbol.price}</span>
                <span class="symbol-select-indicator" aria-hidden="true">
                  <span class="symbol-select-checkbox">${isCustomSymbolSelected ? "✓" : ""}</span>
                </span>
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
                    <div class="custom-symbol-example-card" data-example-key="good-example-image">
                      <img
                        class="custom-symbol-example-image"
                        src="/static/img/goodexamples.jpg"
                        alt="Good Example"
                        loading="lazy"
                      />
                      <span class="custom-symbol-example-label">Good Example</span>
                    </div>
                    <div class="custom-symbol-example-card" data-example-key="not-ideal-example-image">
                      <img
                        class="custom-symbol-example-image"
                        src="/static/img/badexamples.jpg"
                        alt="Bad Example"
                        loading="lazy"
                      />
                      <span class="custom-symbol-example-label">Not Ideal Example</span>
                    </div>
                  </div>
                  <p>Use the examples above as a guide when uploading your image.</p>
                  <ul class="custom-symbol-fee-notes">
                    <li>Clean, ready-to-use images → no extra fee</li>
                    <li>If cleanup or redraw is needed → +$10 (we’ll confirm first)</li>
                  </ul>
                  <p>Don’t have an image?</p>
                  <p class="custom-symbol-checkline">✔ Request a custom design below (+$10)</p>
                  <label class="custom-symbol-checkbox">
                    <input
                      type="checkbox"
                      ${customSymbolDesignRequestOptIn ? "checked" : ""}
                      onchange="setCustomSymbolDesignRequest(this.checked)"
                    />
                    Have Custom Design’s LA design my symbol / brand (+$10)
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
      <div class="builder-plaque hero-plaque">
        <h2>Your Vision, Crafted in Silver</h2>
        <p>Designed by you. Hand-finished by Custom Design’s LA.</p>
      </div>

      <div class="builder-gallery-strip builder-plaque">
        ${galleryMarkup || '<p class="gallery-empty">Reference images coming soon.</p>'}
      </div>

      <div class="builder-plaque product-info-plaque">
        <h3>${currentProduct.title}</h3>
        <p><strong>SKU:</strong> ${currentProduct.sku}</p>
        <p><strong>Collection:</strong> ${currentProduct.collection}</p>
        <p><strong>Base Price:</strong> $${currentProduct.price}</p>
        <p><strong>Starting Ring Size:</strong> ${selectedRingSize}</p>
      </div>

      ${priceBreakdownMarkup}

      <section class="builder-plaque ring-size-section">
        <h3>Ring Size</h3>
        <div class="ring-size-grid" role="group" aria-label="Ring size options">
          ${ringSizeOptionsMarkup}
        </div>
        <p class="ring-size-note">
          <strong>Not sure of your ring size?</strong><br/>
          Every order includes a ring sizer so you can confirm your final size before production.
        </p>
        <p class="ring-size-note ring-size-note-secondary">
          Need a size outside this range? Add it in Order Notes and we’ll review whether your selected design can be made in that size.
        </p>
        <p class="ring-size-note ring-size-note-secondary">
          Your selected size is your starting size.<br/>
          Final ring size must be confirmed with the ring sizer we send before production begins.
        </p>
      </section>

      <section class="builder-plaque customization-options">
        <h3>Customization Options</h3>

        ${(!isBandWidthLocked(currentProduct) || !isMetalLocked(currentProduct)) ? `
          <div class="builder-mini-card ring-specs-card">
            <h4>Ring Specifications</h4>
            ${!isBandWidthLocked(currentProduct) ? `
              <label>
                Band Width
                <select onchange="setBandWidth(this.value)">
                  ${bandWidthOptions}
                </select>
              </label>
            ` : ""}
            ${!isMetalLocked(currentProduct) ? `
              <label>
                Metal
                <select onchange="setMetal(this.value)">
                  ${metalOptions}
                </select>
              </label>
            ` : ""}
          </div>
        ` : ""}

        <div class="builder-mini-card engraving-section">
          <h4>Engraving</h4>
          ${supportsInsideEngraving(currentProduct) ? `
            <label class="engraving-field">Inside Text
              <textarea rows="2" oninput="setEngraving('inside', this.value)">${engravingTextInside}</textarea>
            </label>
          ` : ""}
          ${supportsOutsideEngraving(currentProduct) ? `
            <label class="engraving-field">Outside Text
              <textarea rows="2" oninput="setEngraving('outside', this.value)">${engravingTextOutside}</textarea>
            </label>
          ` : ""}
        </div>

        <div class="builder-mini-card symbols-card">
          <h4>Symbols</h4>
          ${symbolIndicatorsMarkup}
          ${symbolMarkup || '<p class="subtle-text">Symbol customization is not available for this ring style.</p>'}
        </div>

        ${addOns.length ? `
          <div class="builder-mini-card add-ons-card">
            <h4>Additional Add-ons</h4>
            ${addOnMarkup}
          </div>
        ` : ""}

        <div class="builder-mini-card order-notes-section">
          <h4>Order Notes</h4>
          <textarea
            rows="6"
            oninput="setOrderNotes(this.value)"
            placeholder="Example:&#10;Inside text: I ❤️ love you&#10;Place the heart after the letter I.&#10;You can also use this box to explain symbol placement, order, or custom requests."
          >${orderNotes}</textarea>
        </div>
      </section>

      <p class="material-note">All jewelry pieces are crafted in solid .925 sterling silver.</p>

      <div class="builder-actions builder-plaque">
        <button class="add-to-cart-main" onclick="addCurrentRingToCart()">
          Order Now
        </button>

        <button class="add-to-cart-main" type="button" onclick="addCurrentRingToWishlist()">
          Save & Get Free Preview
        </button>
      </div>

      <section class="builder-plaque how-it-works-wrap">
        <button
          type="button"
          class="how-it-works-toggle"
          onclick="toggleHowThisWorks()"
          aria-expanded="${howThisWorksExpanded ? "true" : "false"}"
        >
          How This Works
        </button>
        <div class="how-it-works-content ${howThisWorksExpanded ? "is-open" : ""}">
          <div class="how-it-works">
            <h3>How This Works</h3>
            <p><strong>Save &amp; Get Free Preview</strong> — Receive a custom design preview before placing your order.</p>
            <p>Free previews are completed within 2–3 weeks depending on current workload.</p>
            <p><strong>Order Now</strong> — Receive your custom design preview within 3–7 business days after payment.</p>
            <p>Paid orders are prioritized.</p>
            <p><strong>Payment Options:</strong></p>
            <p>• Pay in full — highest priority</p>
            <p>• 50% deposit — design completed within the same 3–7 day window</p>
            <p>All orders receive a design preview before production begins.</p>
          </div>
        </div>
      </section>


      <div id="original-total-price" class="price-box builder-plaque total-price-card">
        <h2 data-live-total-price>Total Price: $${price}</h2>
      </div>

      <div class="cart-box builder-plaque">
        <h3>🛒 Cart (${cart.length})</h3>
        <ul>
          ${cart.map(item => `
            <li>${item.productName} (${item.builderKey}) — Size ${item.ringSize || "N/A"} — $${item.unitPrice}</li>
          `).join("")}
        </ul>

        <h3>♡ Wishlist (${wishlist.length})</h3>
        <ul>
          ${wishlist.map(item => `
            <li>${item.productName} (${item.builderKey})</li>
          `).join("")}
        </ul>
      </div>

      <div id="floating-total-bar" class="floating-total-bar builder-plaque" aria-hidden="true">
        <p data-live-total-price>Total Price: $${price}</p>
      </div>
    </section>
  `;

  setupFloatingTotalVisibility();
  updateFloatingBarInputPosition();
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

window.toggleHowThisWorks = () => {
  howThisWorksExpanded = !howThisWorksExpanded;
  render();
};

window.handleSymbolImageError = imageEl => {
  const candidates = (imageEl.dataset.imageCandidates || "")
    .split("|")
    .map(item => item.trim())
    .filter(Boolean);

  const nextIndex = Number(imageEl.dataset.imageIndex || 0) + 1;

  if (nextIndex < candidates.length) {
    imageEl.dataset.imageIndex = String(nextIndex);
    imageEl.src = candidates[nextIndex];
    return;
  }

  imageEl.style.display = "none";
  if (imageEl.nextElementSibling) {
    imageEl.nextElementSibling.style.display = "grid";
  }
};

window.toggleSymbol = symbolId => {
  const isSelected = selectedSymbols.includes(symbolId);

  selectedSymbols = isSelected
    ? selectedSymbols.filter(item => item !== symbolId)
    : [...selectedSymbols, symbolId];

  if (symbolId === "custom-symbol" && isSelected) {
    customSymbolDesignRequestOptIn = false;
    customSymbolDesignDescription = "";
    customSymbolUploadFileName = "";
    render();
    return;
  }

  if (symbolId === "custom-symbol") {
    render();
    return;
  }

  updateSymbolSelectionCardUI(symbolId, !isSelected);
  updateSymbolSummaryUI();
  updatePriceUI();
};

window.setOrderNotes = value => {
  orderNotes = value;
};

window.setRingSize = value => {
  selectedRingSize = value;
  render();
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
    ringSize: selectedRingSize,
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
  saveCheckoutDraft(item);
  window.location.href = "/checkout/";
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
  setupFloatingInputFocusBehavior();

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
