---
title: "Hammered Oval Charm Bracelet"
layout: layouts/product.njk
permalink: /bracelets/charm/hammered-oval-charm-bracelet/
price: 56
sku: BR-002
published: true

collection: "Charm Bracelets"

tags:
  - bracelet
  - charm
---

sizes:
  - Petite (6 5/8 in) "S"
  - Standard (7 1/4 in) "M"
  - Generous (8 in) "L"
  - Extra (8 3/8 in) "XL"

material: "Sterling Silver (.925)"
---

**Hammered Oval Charm Bracelet**

**English**  
Solid sterling-silver chain built for daily wear and charms. Oval cable links with subtle hammered facets that catch the light. Includes our **CDLA bronze hallmark tag** with honeycomb texture (≈ 10.5×11×2.44 mm).

---

**Español**  
Cadena de plata esterlina sólida, ideal para uso diario y para dijes. Eslabones ovalados martillados que capturan la luz. Incluye nuestra **placa de autor CDLA en bronce** con textura de panal (≈ 10.5×11×2.44 mm).



# Bracelet Collection

Explore sculpted Cuban Link rings inspired by timeless chainwork and modern artistry — all cast in .925 Sterling Silver.

<div class="collection-grid">

{% for ring in collections["cuban-link"] %}
  <a href="{{ ring.url }}" class="collection-card">
    <img src="{{ ring.data.images | first }}" alt="{{ ring.data.title }}">
    <div class="collection-card-text">
      <h3>{{ ring.data.title }}</h3>
      <p class="price">${{ ring.data.price }} USD</p>
    </div>
  </a>
{% endfor %}

</div>

<style>
/* ===============================
   COLLECTION GRID
================================ */

.collection-grid {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

/* MOBILE — single column */
@media (max-width: 1023px) {
  .collection-grid {
    grid-template-columns: 1fr;
  }
}

/* DESKTOP — 4 columns */
@media (min-width: 1024px) {
  .collection-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .collection-grid > .collection-card:nth-last-child(2) {
    grid-column: 2;
  }

  .collection-grid > .collection-card:nth-last-child(1) {
    grid-column: 3;
  }
}

/* ===============================
   COLLECTION CARD
================================ */

.collection-card {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: #111;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.collection-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}

.collection-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

/* ===============================
   TEXT
================================ */

.collection-card-text {
  padding: 1rem;
  text-align: center;
}

.collection-card-text h3 {
  margin: 0.25rem 0 0.4rem;
  font-size: 1rem;
  font-weight: 600;
}

.collection-card-text .price {
  font-weight: 700;
  font-size: 0.95rem;
}
</style>
