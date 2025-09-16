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

let currentColor = 'silver';
let mode = 'rings'; // 'rings' or 'charms'
let currentCollection = 'Cuban';

function render() {
  const collections = mode === 'rings' ? ringCollections : charmCollections;
  const products = collections[currentCollection].map(
    name => `
      <div class="product-card">
        <div class="ring-preview" style="background:${currentColor}">${mode==='rings'?'💍':'⭐'}</div>
        <p>${name}</p>
      </div>`
  ).join("");

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
    <div class="product-grid">${products}</div>
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

render();