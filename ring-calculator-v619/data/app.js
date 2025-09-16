// app.js – Ring & Charm Builder v6.19

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  if (!app) return;

  // Load data files
  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  let rings = [], charms = [], pricing = {};
  try {
    rings = await loadJSON("data/rings.json");
    charms = await loadJSON("data/charms.json");
    pricing = await loadJSON("data/pricing.json");
  } catch (err) {
    console.error("Data load error:", err);
    app.innerHTML = `<p style="color:red;">Error loading builder data. Check console for details.</p>`;
    return;
  }

  // Utility: word count pricing
  function wordCost(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length * (pricing.word || 4);
  }

  // UI builder
  app.innerHTML = `
    <section class="card">
      <h2>Band Options</h2>
      <label>Band Height:
        <select id="bandHeight">
          <option value="">--Select--</option>
          ${Object.keys(pricing.bandHeights || {}).map(h => 
            `<option value="${h}">${h} ($${pricing.bandHeights[h]})</option>`
          ).join("")}
        </select>
      </label>
      <label>Band Style:
        <select id="bandStyle">
          <option value="">--Select--</option>
          <option>Domed</option>
          <option>Flat</option>
          <option>Apex</option>
        </select>
      </label>
    </section>

    <section class="card">
      <h2>Engraving / Embossing</h2>
      <textarea id="engravedInner" placeholder="Engraved inner band"></textarea>
      <textarea id="embossedInner" placeholder="Embossed inner band"></textarea>
      <textarea id="engravedOuter" placeholder="Engraved outer band"></textarea>
      <textarea id="embossedOuter" placeholder="Embossed outer band"></textarea>
    </section>

    <section class="card">
      <h2>Symbols</h2>
      <div id="symbolsWrap" class="row"></div>
    </section>

    <section class="card">
      <h2>Decorations</h2>
      <label><input type="checkbox" id="beading"> Beading (+$${pricing.beading})</label><br>
      <label><input type="checkbox" id="engravedPattern"> Engraved Pattern (+$${pricing.engravedPattern})</label><br>
      <label><input type="checkbox" id="cutOut"> Cut-out Symbol (+$${pricing.cutOut})</label>
    </section>

    <section class="card">
      <h2>Notes</h2>
      <textarea id="notes" placeholder="Extra instructions for jeweler"></textarea>
    </section>

    <section class="card">
      <h2>Summary</h2>
      <div id="priceBreakdown"></div>
      <div class="total" id="totalLine">Total: $0</div>
      <button id="addToCart">Add to Cart</button>
    </section>
  `;

  // Populate symbols
  const SYMBOLS = pricing.symbols || [
    "Cross","Heart","Star","Rose","Horse","Sun","Moon"
  ];
  const sw = document.getElementById("symbolsWrap");
  SYMBOLS.forEach((s, i) => {
    const label = document.createElement("label");
    label.className = "pill";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = s;
    cb.addEventListener("change", compute);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(` ${i+1}. ${s}`));
    sw.appendChild(label);
  });

  // Compute total
  function compute() {
    let total = 0;
    let breakdown = [];

    // Band height
    const h = document.getElementById("bandHeight").value;
    if (pricing.bandHeights && pricing.bandHeights[h]) {
      total += pricing.bandHeights[h];
      breakdown.push(`Band height ${h}: $${pricing.bandHeights[h]}`);
    }

    // Text costs
    let texts = ["engravedInner","embossedInner","engravedOuter","embossedOuter"];
    let textTotal = 0;
    texts.forEach(id => textTotal += wordCost(document.getElementById(id).value));
    if (textTotal) breakdown.push(`Text: $${textTotal}`);
    total += textTotal;

    // Symbols
    const chosen = Array.from(sw.querySelectorAll("input:checked")).map(cb => cb.value);
    if (chosen.length) {
      const symCost = chosen.length * (pricing.symbol || 4);
      total += symCost;
      breakdown.push(`Symbols (${chosen.length}): $${symCost}`);
    }

    // Decorations
    if (document.getElementById("beading").checked) {
      total += pricing.beading || 30;
      breakdown.push(`Beading: $${pricing.beading || 30}`);
    }
    if (document.getElementById("engravedPattern").checked) {
      total += pricing.engravedPattern || 45;
      breakdown.push(`Engraved Pattern: $${pricing.engravedPattern || 45}`);
    }
    if (document.getElementById("cutOut").checked) {
      total += pricing.cutOut || 4;
      breakdown.push(`Cut-out Symbol: $${pricing.cutOut || 4}`);
    }

    // Output
    document.getElementById("priceBreakdown").innerHTML = breakdown.join("<br>");
    document.getElementById("totalLine").innerText = `Total: $${total}`;
  }

  // Bind events
  ["bandHeight","bandStyle","engravedInner","embossedInner","engravedOuter","embossedOuter","beading","engravedPattern","cutOut"].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    const evt = el.tagName==="TEXTAREA" ? "input" : "change";
    el.addEventListener(evt, compute);
  });

  document.getElementById("addToCart").addEventListener("click", ()=>{
    compute();
    alert("Added to cart (placeholder)");
  });

  // Initial compute
  compute();
});
