const app = document.getElementById('app');

// Product collections with real image file paths
const ringCollections = {
  Cuban: [
    { name: "Cuban Original", img: "assets/rings/cuban/cuban-original.jpg" },
    { name: "Cuban Classic", img: "assets/rings/cuban/cuban-classic.jpg" },
    { name: "Cuban Elegance", img: "assets/rings/cuban/cuban-elegance.jpg" },
    { name: "Cuban Intricate", img: "assets/rings/cuban/cuban-intricate.jpg" },
    { name: "Cuban Statement Ring Thin", img: "assets/rings/cuban/cuban-thin.jpg" },
    { name: "Cuban Statement Ring Thick", img: "assets/rings/cuban/cuban-thick.jpg" }
  ],
  Western: Array.from({length:6}, (_,i)=>({name:`Western Style ${i+1}`, img:`assets/rings/western/western-${i+1}.jpg`})),
  Faith: Array.from({length:6}, (_,i)=>({name:`Faith Style ${i+1}`, img:`assets/rings/faith/faith-${i+1}.jpg`}))
};

const charmCollections = {
  Cuban: Array.from({length:6}, (_,i)=>({name:`Cuban Charm ${i+1}`, img:`assets/charms/cuban/cuban-${i+1}.jpg`})),
  Western: Array.from({length:6}, (_,i)=>({name:`Western Charm ${i+1}`, img:`assets/charms/western/western-${i+1}.jpg`})),
  Faith: Array.from({length:6}, (_,i)=>({name:`Faith Charm ${i+1}`, img:`assets/charms/faith/faith-${i+1}.jpg`})),
  Medical: Array.from({length:6}, (_,i)=>({name:`Medical Charm ${i+1}`, img:`assets/charms/medical/medical-${i+1}.jpg`}))
};

// Pricing structures
const ringHeights = { "3-6mm": 50, "6-9mm": 75, "10-13mm": 100 };
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

// Add-ons expanded
const addOns = {
  "Engraved Pattern": 45,
  "Carved Channels": 4,
  "Beading": 5,
  "Rope Braid": 5,
  "Rope Twist": 7,
  "Cuban Weave Tight": 10,
  "Cuban Weave Loose": 8,
  "Cut-outs": 10
};

// Metal types
const metals = { Silver: 0, Gold: 100, RoseGold: 120, Platinum: 200 };

let currentColor = 'silver';
let mode = 'rings';
let currentCollection = 'Cuban';
let currentHeight = "3-6mm";
let currentSize = "Dime (17.9mm)";
let currentMetal = "Silver";
let selectedAddOns = [];
let engravingTextInside = "";
let engravingTextOutside = "";

function calculatePrice() {
  let base = 25;
  if (mode === 'rings') base += ringHeights[currentHeight];
  else base += charmSizes[currentSize];
  base += metals[currentMetal];
  selectedAddOns.forEach(addon => { base += addOns[addon]; });
  let engravingWords = (engravingTextInside + " " + engravingTextOutside).trim().split(/\s+/).filter(Boolean).length;
  base += engravingWords * 5;
  return base;
}

function render() {
  const collections = mode === 'rings' ? ringCollections : charmCollections;
  const products = collections[currentCollection].map(
    item => `
      <div class="product-card">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/200?text=No+Image'" />
        <div class="ring-preview" style="background:${currentColor}">${mode==='rings'?'💍':'⭐'}</div>
        <p>${item.name}</p>
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
    <button onclick="toggleMode()">Switch to ${mode === 'rings' ? 'Charms' : 'Rings'}</button>
    <br/>
    <label>Select ${mode === 'rings' ? 'Ring' : 'Charm'} Collection:</label>
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
        ${Object.keys(ringHeights).map(h => `<option value="${h}" ${h===currentHeight ? "selected":""}>${h} (+$${ringHeights[h]})</option>`).join("")}
      </select>
    ` : `
      <h3>Select Charm Size:</h3>
      <select onchange="setSize(this.value)">
        ${Object.keys(charmSizes).map(s => `<option value="${s}" ${s===currentSize ? "selected":""}>${s} (+$${charmSizes[s]})</option>`).join("")}
      </select>
    `}
    <h3>Select Metal:</h3>
    <select onchange="setMetal(this.value)">${metalOptions}</select>
    <h3>Engraving Options:</h3>
    <label>Inside Text: <input type="text" oninput="setEngraving('inside', this.value)" /></label><br/>
    <label>Outside Text: <input type="text" oninput="setEngraving('outside', this.value)" /></label><br/>
    <small>$5 per word</small>
    <h3>Customization Add-ons:</h3>
    ${addOnCheckboxes}
    <div class="product-grid">${products}</div>
    <div class="price-box"><h2>Total Price: $${price}</h2></div>
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

render();