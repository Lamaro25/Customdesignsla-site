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
let cart = [];
let wishlist = [];

function calculatePrice() {
  let base = pricingData.designFee || 0;
  if (mode === 'rings') base += pricingData.ringHeights[currentHeight];
  else base += pricingData.charmSizes[currentSize];
  base += pricingData.metals[currentMetal];
  selectedAddOns.forEach(addon => { base += pricingData.addOns[addon]; });
  let engravingWords = (engravingTextInside + " " + engravingTextOutside).trim().split(/\s+/).filter(Boolean).length;
  base += engravingWords * (pricingData.engravingPerWord || 0);
  return base;
}

function render() {
  const collections = mode === 'rings' ? ringsData : charmsData;
  const items = collections[currentCollection] || [];
  const products = items.map(
    item => `
      <div class="product-card">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/200?text=No+Image'" />
        <div class="ring-preview" style="background:${currentColor}">${mode==='rings'?'💍':'⭐'}</div>
        <p>${item.name}</p>
        <button onclick="addToCart('${item.name}')">Add to Cart</button>
        <button onclick="addToWishlist('${item.name}')">♡ Wishlist</button>
      </div>`
  ).join("");

  const addOnCheckboxes = Object.keys(pricingData.addOns||{}).map(a =>
    `<label><input type="checkbox" onchange="toggleAddOn('${a}', this.checked)"> ${a} (+$${pricingData.addOns[a]})</label><br/>`
  ).join("");

  const metalOptions = Object.keys(pricingData.metals||{}).map(m =>
    `<option value="${m}" ${m===currentMetal ? "selected":""}>${m} (+$${pricingData.metals[m]})</option>`
  ).join("");

  const price = calculatePrice();

  app.innerHTML = `
    <h2>${mode === 'rings' ? 'Ring' : 'Charm'} Builder</h2>
    <button onclick="toggleMode()">Switch to ${mode === 'rings' ? 'Charms' : 'Rings'}</button>
    <br/>
    <label>Select Collection:</label>
    <select onchange="setCollection(this.value)">
      ${Object.keys(collections).map(col => `<option value="${col}" ${col===currentCollection ? "selected" : ""}>${col}</option>`).join("")}
    </select>
    <h3>Select Color:</h3>
    <div>
      <span class="color-option" style="background:silver" onclick="setColor('silver')"></span>
      <span class="color-option" style="background:gold" onclick="setColor('gold')"></span>
      <span class="color-option" style="background:pink" onclick="setColor('pink')"></span>
      <span class="color-option" style="background:black" onclick="setColor('black')"></span>
    </div>
    ${mode==='rings' ? `
      <h3>Select Band Height:</h3>
      <select onchange="setHeight(this.value)">
        ${Object.keys(pricingData.ringHeights||{}).map(h => `<option value="${h}" ${h===currentHeight ? "selected":""}>${h} (+$${pricingData.ringHeights[h]})</option>`).join("")}
      </select>
    ` : `
      <h3>Select Charm Size:</h3>
      <select onchange="setSize(this.value)">
        ${Object.keys(pricingData.charmSizes||{}).map(s => `<option value="${s}" ${s===currentSize ? "selected":""}>${s} (+$${pricingData.charmSizes[s]})</option>`).join("")}
      </select>
    `}
    <h3>Select Metal:</h3>
    <select onchange="setMetal(this.value)">${metalOptions}</select>
    <h3>Engraving Options:</h3>
    <label>Inside Text: <input type="text" oninput="setEngraving('inside', this.value)" /></label><br/>
    <label>Outside Text: <input type="text" oninput="setEngraving('outside', this.value)" /></label><br/>
    <small>$${pricingData.engravingPerWord} per word</small>
    <h3>Customization Add-ons:</h3>
    ${addOnCheckboxes}
    <div class="product-grid">${products}</div>
    <div class="price-box"><h2>Total Price: $${price}</h2></div>
    <div class="cart-box">
      <h3>🛒 Cart (${cart.length})</h3>
      <ul>${cart.map(c => `<li>${c}</li>`).join("")}</ul>
      <h3>♡ Wishlist (${wishlist.length})</h3>
      <ul>${wishlist.map(w => `<li>${w}</li>`).join("")}</ul>
    </div>
  `;
}

window.setColor = c => { currentColor = c; render(); }
window.setCollection = col => { currentCollection = col; render(); }
window.toggleMode = () => { mode = mode==='rings'?'charms':'rings'; currentCollection='Cuban'; render(); }
window.setHeight = h => { currentHeight=h; render(); }
window.setSize = s => { currentSize=s; render(); }
window.setMetal = m => { currentMetal=m; render(); }
window.toggleAddOn = (a,checked)=>{ if(checked) selectedAddOns.push(a); else selectedAddOns=selectedAddOns.filter(x=>x!==a); render(); }
window.setEngraving = (t,v)=>{ if(t==='inside') engravingTextInside=v; if(t==='outside') engravingTextOutside=v; render(); }
window.addToCart = name => { cart.push(name); render(); }
window.addToWishlist = name => { wishlist.push(name); render(); }

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