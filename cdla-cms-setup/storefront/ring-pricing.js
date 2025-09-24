export function calculateRingPrice(data) {
  let breakdown = [];
  let total = 0;

  const base = parseInt(data.band_height) || 0;
  total += base;
  breakdown.push({ label: `Base Band Height`, value: `$${base}` });

  if (data.addons) {
    if (data.addons.rope_braid > 0) {
      const cost = data.addons.rope_braid * 5;
      total += cost;
      breakdown.push({ label: `Rope Braid × ${data.addons.rope_braid}`, value: `$${cost}` });
    }
    if (data.addons.small_cuban > 0) {
      const cost = data.addons.small_cuban * 5;
      total += cost;
      breakdown.push({ label: `Small Cuban Link × ${data.addons.small_cuban}`, value: `$${cost}` });
    }
    if (data.addons.large_cuban > 0) {
      const cost = data.addons.large_cuban * 30;
      total += cost;
      breakdown.push({ label: `Large Cuban Link × ${data.addons.large_cuban}`, value: `$${cost}` });
    }
    if (data.addons.channels > 0) {
      const cost = data.addons.channels * 4;
      total += cost;
      breakdown.push({ label: `Channels × ${data.addons.channels}`, value: `$${cost}` });
    }
    if (data.addons.beading) {
      total += 30;
      breakdown.push({ label: `Beading`, value: `$30` });
    }
    if (data.addons.cutouts > 0) {
      const cost = data.addons.cutouts * 4;
      total += cost;
      breakdown.push({ label: `Cut-Outs × ${data.addons.cutouts}`, value: `$${cost}` });
    }
    if (data.addons.pattern && data.addons.pattern !== "none") {
      total += 35;
      breakdown.push({ label: `Pattern: ${data.addons.pattern}`, value: `$35` });
    }
    if (data.addons.symbols > 0) {
      const cost = data.addons.symbols * 4;
      total += cost;
      breakdown.push({ label: `Symbols × ${data.addons.symbols}`, value: `$${cost}` });
    }
  }

  if (data.engraving) {
    if (data.engraving.inside) {
      const words = data.engraving.inside.trim().split(/\s+/).length;
      const cost = words * 4;
      total += cost;
      breakdown.push({ label: `Inside Engraving (“${data.engraving.inside}”)`, value: `$${cost}` });
    }
    if (data.engraving.outside) {
      const words = data.engraving.outside.trim().split(/\s+/).length;
      const cost = words * 4;
      total += cost;
      breakdown.push({ label: `Outside Engraving (“${data.engraving.outside}”)`, value: `$${cost}` });
    }
  }

  return { total, breakdown };
}
