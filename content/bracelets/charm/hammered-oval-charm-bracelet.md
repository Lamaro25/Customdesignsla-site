---
title: "Hammered Oval Charm Bracelet"
sku: "BR-002"
collection: "Charm Bracelets"
tags: ["charm"]
slug: "hammered-oval-charm-bracelet"
permalink: "/bracelets/charm/hammered-oval-charm-bracelet/"
price: 56
published: true
layout: "layouts/product.njk"

# ✅ FRONT-FACING CARD IMAGE (collection grid)
images:
  - "/static/img/bracelets/charm/hammered-oval-charm-bracelet-full.jpg"

# ✅ PRODUCT PAGE GALLERY (3 slots — safe if some are empty)
gallery:
  - "/static/img/bracelets/charm/hammered-oval-charm-bracelet-full.jpg"
  - "/static/img/bracelets/charm/hammered-oval-charm-bracelet-chain.jpg"
  - ""

material: "Sterling Silver (.925)"

sizes:
  - 'Petite (6 5/8 in) "S"'
  - 'Standard (7 1/4 in) "M"'
  - 'Generous (8 in) "L"'
  - 'Extra (8 3/8 in) "XL"'
---

{% if gallery %}
<div class="product-gallery-section">
  <div class="product-gallery-grid">
    {% for image in gallery %}
      {% if image %}
        <div class="product-gallery-item">
          <img
            src="{{ image }}"
            alt="{{ title }} – Image {{ loop.index }}"
            loading="lazy"
          >
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>
{% endif %}

## Hammered Oval Charm Bracelet

### English
Solid sterling-silver chain built for daily wear and charms. Oval cable links with subtle hammered facets that catch the light. Includes our **CDLA bronze hallmark tag** with honeycomb texture (≈ 10.5×11×2.44 mm).

---

### Español
Cadena de plata esterlina sólida, ideal para uso diario y para dijes. Eslabones ovalados martillados que capturan la luz. Incluye nuestra **placa de autor CDLA en bronce** con textura de panal (≈ 10.5×11×2.44 mm).
