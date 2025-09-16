const app = document.getElementById('app');

// Default ring color
let currentColor = 'silver';

function render() {
  app.innerHTML = `
    <h1>Ring Builder</h1>
    <div class="ring-preview" style="background:${currentColor}">💍</div>
    <h3>Select Ring Color:</h3>
    <div>
      <span class="color-option" style="background:silver" onclick="setColor('silver')"></span>
      <span class="color-option" style="background:gold" onclick="setColor('gold')"></span>
      <span class="color-option" style="background:rose" onclick="setColor('pink')"></span>
      <span class="color-option" style="background:black" onclick="setColor('black')"></span>
    </div>
  `;
}

window.setColor = function(color) {
  currentColor = color;
  render();
}

render();