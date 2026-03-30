const app = document.getElementById('app');

let ringsData = {};
let charmsData = {};
let pricingData = {};

let currentColor = 'silver';
let mode = 'rings';
let currentCollection = 'Cuban';
let currentHeight = "3-6mm";
let currentSize = "Dime (17.9mm)";
let currentMetal = "Silver";
let selectedAddOns = [];
let engravingTextInside = "";
let engravingTextOutside = "";
let cart = JSON.parse(localStorage.getItem('cdla_cart')) || [];
let wishlist = [];

function calculatePrice() {
  let base = pricingData.designFee || 0;

  if (mode === 'rings') base += pricingData.ringHeights?.[currentHeight] || 0;
  else base += pricingData.charmSizes?.[currentSize] || 0;

  base += pricingData.metals?.[currentMetal] || 0;

  selectedAddOns.forEach(addon => {
    base += pricingData.addOns?.[addon] || 0;
  });

  let engravingWords = (engravingTextInside + " " + engravingTextOutside)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  base += engravingWords * (pricingData.engravingPerWord || 0);

  return base;
}

/**
 * Updates only the price UI without rerendering the entire page.
 * Prevents input fields from resetting while typing.
 */
function updatePriceUI() {
  const price = calculatePrice();
  const priceBox = document.querySelector(".price-box h2");
  if (priceBox) priceBox.textContent = `Total Price: $${price}`;
}

function render() {
  const collections = mode === 'rings' ? ringsData : charmsData;
  const items = collections[currentCollection] || [];

  const products = items.map(item => `
    <div class="product-card">
      <img
        src="${item.img}"
        alt="${item.name}"
        onerror="this.src='https://via.placeholder.com/200?text=No+Image'"
      />
      <div class="ring-preview" style="background:${currentColor}">
        ${mode === 'rings' ? '💍' : '⭐'}
      </div>
      <p>${item.name}</p>
      <button onclick="addToCart('${item.name}')">Add to Cart</button>
      <button onclick="addToWishlist('${item.name}')">♡ Wishlist</button>
    </div>
  `).join("");

  const addOnCheckboxes = Object.keys(pricingData.addOns || {}).map(a => {
    const isChecked = selectedAddOns.includes(a);
    return `
      <label>
        <input
          type="checkbox"
          ${isChecked ? "checked" : ""}
          onchange="toggleAddOn('${a}', this.checked)"
        />
        ${a} (+$${pricingData.addOns[a]})
      </label><br/>
    `;
  }).join("");

  const metalOptions = Object.keys(pricingData.metals || {}).map(m =>
    `<option value="${m}" ${m === currentMetal ? "selected" : ""}>
      ${m} (+$${pricingData.metals[m]})
    </option>`
  ).join("");

  const price = calculatePrice();

  app.innerHTML = `
    <h2>${mode === 'rings' ? 'Ring' : 'Charm'} Builder</h2>
    <button onclick="toggleMode()">Switch to ${mode === 'rings' ? 'Charms' : 'Rings'}</button>

    <br/><br/>
    <label>Select Collection:</label>
    <select onchange="setCollection(this.value)">
      ${Object.keys(collections).map(col => `
        <option value="${col}" ${col === currentCollection ? "selected" : ""}>${col}</option>
      `).join("")}
    </select>

    ${mode === 'rings' ? `
      <h3>Select Band Height:</h3>
      <select onchange="setHeight(this.value)">
        ${Object.keys(pricingData.ringHeights || {}).map(h => `
          <option value="${h}" ${h === currentHeight ? "selected" : ""}>
            ${h} (+$${pricingData.ringHeights[h]})
          </option>
        `).join("")}
      </select>
    ` : `
      <h3>Select Charm Size:</h3>
      <select onchange="setSize(this.value)">
        ${Object.keys(pricingData.charmSizes || {}).map(s => `
          <option value="${s}" ${s === currentSize ? "selected" : ""}>
            ${s} (+$${pricingData.charmSizes[s]})
          </option>
        `).join("")}
      </select>
    `}

    <h3>Select Metal:</h3>
    <select onchange="setMetal(this.value)">${metalOptions}</select>

    <h3>Engraving Options:</h3>
    <label>Inside Text:
      <input
        type="text"
        value="${engravingTextInside}"
        oninput="setEngraving('inside', this.value)"
      />
    </label><br/>

    <label>Outside Text:
      <input
        type="text"
        value="${engravingTextOutside}"
        oninput="setEngraving('outside', this.value)"
      />
    </label><br/>

    <small>$${pricingData.engravingPerWord || 0} per word</small>

    <h3>Customization Add-ons:</h3>
    ${addOnCheckboxes}

    <div class="product-grid">${products}</div>

    <div class="price-box"><h2>Total Price: $${price}</h2></div>

    <div class="cart-box">
      <h3>🛒 Cart (${cart.length})</h3>
      <ul>${cart.map(c => `<li>${c.productName} — $${c.unitPrice}</li>`).join("")}</ul>

      <h3>♡ Wishlist (${wishlist.length})</h3>
      <ul>${wishlist.map(w => `<li>${w}</li>`).join("")}</ul>
    </div>
  `;
}

// Core setters
window.setColor = c => { currentColor = c; render(); };
window.setCollection = col => { currentCollection = col; render(); };
window.toggleMode = () => { mode = mode === 'rings' ? 'charms' : 'rings'; currentCollection = 'Cuban'; render(); };
window.setHeight = h => { currentHeight = h; render(); };
window.setSize = s => { currentSize = s; render(); };
window.setMetal = m => { currentMetal = m; render(); };

window.toggleAddOn = (a, checked) => {
  if (checked) {
    if (!selectedAddOns.includes(a)) selectedAddOns.push(a);
  } else {
    selectedAddOns = selectedAddOns.filter(x => x !== a);
  }
  render();
};

window.setEngraving = (t, v) => {
  if (t === 'inside') engravingTextInside = v;
  if (t === 'outside') engravingTextOutside = v;
  updatePriceUI();
};

window.addToCart = name => {
  const item = {
    id: Date.now(),
    mode,
    collection: currentCollection,
    productName: name,
    color: currentColor,
    bandHeight: mode === 'rings' ? currentHeight : null,
    charmSize: mode === 'charms' ? currentSize : null,
    metal: currentMetal,
    engravingInside: engravingTextInside,
    engravingOutside: engravingTextOutside,
    addOns: [...selectedAddOns],
    unitPrice: calculatePrice(),
    quantity: 1,
    shippingProfile: mode === 'rings' ? 'ring' : 'charm'
  };

  cart.push(item);
  localStorage.setItem('cdla_cart', JSON.stringify(cart));
  render();
};

window.addToWishlist = name => { wishlist.push(name); render(); };

async function loadData() {
  const [ringsResp, charmsResp, pricingResp] = await Promise.all([
    fetch('data/rings.json'),
    fetch('data/charms.json'),
    fetch('data/pricing.json')
  ]);

  ringsData = await ringsResp.json();
  charmsData = await charmsResp.json();
  pricingData = await pricingResp.json();

  render();
}

loadData();
