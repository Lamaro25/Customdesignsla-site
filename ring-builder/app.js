const app = document.getElementById('app');

// Product collections for rings
const ringCollections = {
  Cuban: [
    "Cuban Original",
    "Cuban Classic",
    "Cuban Elegance",
    "Cuban Intricate",
    "Cuban Statement Ring Thin",
    "Cuban Statement Ring Thick"
  ],
  Western: [
    "Western Style 1",
    "Western Style 2",
    "Western Style 3",
    "Western Style 4",
    "Western Style 5",
    "Western Style 6"
  ],
  Faith: [
    "Faith Style 1",
    "Faith Style 2",
    "Faith Style 3",
    "Faith Style 4",
    "Faith Style 5",
    "Faith Style 6"
  ]
};

// Product collections for charms
const charmCollections = {
  Cuban: [
    "Cuban Charm 1",
    "Cuban Charm 2",
    "Cuban Charm 3",
    "Cuban Charm 4",
    "Cuban Charm 5",
    "Cuban Charm 6"
  ],
  Western: [
    "Western Charm 1",
    "Western Charm 2",
    "Western Charm 3",
    "Western Charm 4",
    "Western Charm 5",
    "Western Charm 6"
  ],
  Faith: [
    "Faith Charm 1",
    "Faith Charm 2",
    "Faith Charm 3",
    "Faith Charm 4",
    "Faith Charm 5",
    "Faith Charm 6"
  ],
  Medical: [
    "Medical Charm 1",
    "Medical Charm 2",
    "Medical Charm 3",
    "Medical Charm 4",
    "Medical Charm 5",
    "Medical Charm 6"
  ]
};

// Pricing structures
const ringHeights = {
  "3-6mm": 50,
  "6-9mm": 75,
  "10-13mm": 100
};

const charmSizes = {
  "Dime (17.9mm)": 30,
  "Penny (19mm)": 35,
  "Nickel (21.2mm)": 40,
  "Quarter (24.3mm)": 45,
  "Lin (25.4mm)": 50,
  "Half-Dollar (30.6mm)": 60,
  "Large (38.1mm)": 70,
  "X-Large (50.8mm)": 85,
  "XX-Large (63.5mm)": 100
};

// Add-ons
const addOns = {
  "Engraved Pattern": 45,
  "Carved Channels": 4,
  "Beading": 5,
  "Rope Braid": 5,
  "Cut-outs": 10
};

// Metal types
const metals = {
  Silver: 0,
  Gold: 100,
  RoseGold: 120,
  Platinum: 200
};

let currentColor = 'silver';
let mode = 'rings'; // 'rings' or 'charms'
let currentCollection = 'Cuban';
let currentHeight = "3-6mm";
let currentSize = "Dime (17.9mm)";
let currentMetal = "Silver";
let selectedAddOns = [];
let engravingTextInside = "";
let engravingTextOutside = "";

function calculatePrice() {
  let base = 25; // design fee
  if (mode === 'rings') {
    base += ringHeights[currentHeight];
  } else {
    base += charmSizes[currentSize];
  }
  base += metals[currentMetal];
  selectedAddOns.forEach(addon => {
    base += addOns[addon];
  });
  // Engraving costs $5 per word
  let engravingWords = (engravingTextInside + " " + engravingTextOutside).trim().split(/\s+/).filter(Boolean).length;
  base += engravingWords * 5;
  return base;
}

function render() {
  const collections = mode === 'rings' ? ringCollections : charmCollections;
  const products = collections[currentCollection].map(
    name => `
      <div class="product-card">
        <div class="ring-preview" style="background:${currentColor}">${mode==='rings'?'💍':'⭐'}</div>
        <p>${name}</p>
      </div>`
  ).join("");

  const addOnCheckboxes = Object.keys(addOns).map(a =>
    `<label><input type="checkbox" onchange="toggleAddOn('${a}', this.checked)"> ${a} (+$${addOns[a]})</label><br/>`
  ).join("");

  const metalOptions = Object.keys(metals).map(m =>
    `<option value="${m}" ${m===currentMetal ? "selected":""}>${m} (+$${metals[m]})</option>`
  ).join("");

  const price = calculatePrice();

  app.innerHTML = `
    <h1>${mode === 'rings' ? 'Ring' : 'Charm'} Builder</h1>
    <button onclick="toggleMode()">
      Switch to ${mode === 'rings' ? 'Charms' : 'Rings'}
    </button>
    <br/>
    <label for="collection">Select ${mode === 'rings' ? 'Ring' : 'Charm'} Collection:</label>
    <select id="collection" onchange="setCollection(this.value)">
      ${Object.keys(collections).map(
        col => `<option value="${col}" ${col===currentCollection ? "selected" : ""}>${col}</option>`
      ).join("")}
    </select>
    <h3>Select ${mode === 'rings' ? 'Ring' : 'Charm'} Color:</h3>
    <div>
      <span class="color-option" style="background:silver" onclick="setColor('silver')"></span>
      <span class="color-option" style="background:gold" onclick="setColor('gold')"></span>
      <span class="color-option" style="background:pink" onclick="setColor('pink')"></span>
      <span class="color-option" style="background:black" onclick="setColor('black')"></span>
    </div>
    ${mode==='rings' ? `
      <h3>Select Band Height:</h3>
      <select onchange="setHeight(this.value)">
        ${Object.keys(ringHeights).map(h =>
          `<option value="${h}" ${h===currentHeight ? "selected":""}>${h} (+$${ringHeights[h]})</option>`
        ).join("")}
      </select>
    ` : `
      <h3>Select Charm Size:</h3>
      <select onchange="setSize(this.value)">
        ${Object.keys(charmSizes).map(s =>
          `<option value="${s}" ${s===currentSize ? "selected":""}>${s} (+$${charmSizes[s]})</option>`
        ).join("")}
      </select>
    `}
    <h3>Select Metal:</h3>
    <select onchange="setMetal(this.value)">${metalOptions}</select>
    <h3>Engraving Options:</h3>
    <label>Inside Text: <input type="text" oninput="setEngraving('inside', this.value)" placeholder="Inside engraving" /></label><br/>
    <label>Outside Text: <input type="text" oninput="setEngraving('outside', this.value)" placeholder="Outside engraving" /></label><br/>
    <small>$5 per word</small>
    <h3>Customization Add-ons:</h3>
    ${addOnCheckboxes}
    <div class="product-grid">${products}</div>
    <div class="price-box">
      <h2>Total Price: $${price}</h2>
    </div>
  `;
}

window.setColor = function(color) {
  currentColor = color;
  render();
}

window.setCollection = function(col) {
  currentCollection = col;
  render();
}

window.toggleMode = function() {
  mode = mode === 'rings' ? 'charms' : 'rings';
  currentCollection = 'Cuban';
  render();
}

window.setHeight = function(h) {
  currentHeight = h;
  render();
}

window.setSize = function(s) {
  currentSize = s;
  render();
}

window.setMetal = function(m) {
  currentMetal = m;
  render();
}

window.toggleAddOn = function(addon, checked) {
  if (checked) {
    selectedAddOns.push(addon);
  } else {
    selectedAddOns = selectedAddOns.filter(a => a !== addon);
  }
  render();
}

window.setEngraving = function(type, value) {
  if (type === 'inside') engravingTextInside = value;
  if (type === 'outside') engravingTextOutside = value;
  render();
}

render();