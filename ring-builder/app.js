const app = document.getElementById('app');

// Product collections
const collections = {
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

let currentColor = 'silver';
let currentCollection = 'Cuban';

function render() {
  const products = collections[currentCollection].map(
    name => `
      <div class="product-card">
        <div class="ring-preview" style="background:${currentColor}">💍</div>
        <p>${name}</p>
      </div>`
  ).join("");

  app.innerHTML = `
    <h1>Ring Builder</h1>
    <label for="collection">Select Collection:</label>
    <select id="collection" onchange="setCollection(this.value)">
      ${Object.keys(collections).map(
        col => `<option value="${col}" ${col===currentCollection ? "selected" : ""}>${col}</option>`
      ).join("")}
    </select>
    <h3>Select Ring Color:</h3>
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

render();