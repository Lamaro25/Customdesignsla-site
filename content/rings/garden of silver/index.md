---
layout: base.njk
title: "Garden of Silver Ring Collection — Custom Designs LA"
description: "Garden of Silver rings — CDLA’s first AI-assisted ring collection inspired by nature: sculpted florals, flowing vines, and organic textures, all handcrafted in .925 Sterling Silver."
permalink: /rings/garden-of-silver/
---

<div class="collection-page">

# Garden of Silver Ring Collection

The Garden of Silver collection is CDLA’s first AI-assisted ring series — inspired by nature and the quiet beauty you can find in it. Sculpted florals, flowing vines, and organic textures — all cast in .925 Sterling Silver.

<div class="collection-grid">

{% for ring in collections["garden-of-silver"] %}
  <a href="{{ ring.url }}" class="collection-card">
    <img src="{{ ring.data.images | first }}" alt="{{ ring.data.title }}">
    <div class="collection-card-text">
      <h3>{{ ring.data.title }}</h3>
      <p class="price">${{ ring.data.price }} USD</p>
    </div>
  </a>
{% endfor %}

</div>

</div>

<style>
/* ===============================
   COLLECTION GRID (SCOPED)
================================ */

.collection-page .collection-grid {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

/* MOBILE — single column */
@media (max-width: 1023px) {
  .collection-page .collection-grid {
    grid-template-columns: 1fr;
  }
}

/* DESKTOP — 4 columns */
@media (min-width: 1024px) {
  .collection-page .collection-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .collection-page .collection-grid > .collection-card:nth-last-child(2) {
    grid-column: 2;
  }

  .collection-page .collection-grid > .collection-card:nth-last-child(1) {
    grid-column: 3;
  }
}

/* ===============================
   COLLECTION CARD (SCOPED)
================================ */

.collection-page .collection-card {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: #111;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.collection-page .collection-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}

.collection-page .collection-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

/* ===============================
   TEXT (SCOPED)
================================ */

.collection-page .collection-card-text {
  padding: 1rem;
  text-align: center;
}

.collection-page .collection-card-text h3 {
  margin: 0.25rem 0 0.4rem;
  font-size: 1rem;
  font-weight: 600;
}

.collection-page .collection-card-text .price {
  font-weight: 700;
  font-size: 0.95rem;
}
</style>
