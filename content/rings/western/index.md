---
layout: base.njk
title: "Western Ring Collection — Custom Designs LA"
description: "Handcrafted Western rings — Texas heritage, frontier symbolism, and sculpted sterling silver designs by Custom Designs LA."
permalink: /rings/western/
---

# Western Ring Collection

Explore handcrafted Western rings inspired by Texas heritage, frontier grit, and bold symbolic design — all cast in .925 Sterling Silver.

<div class="collection-grid">

{% for ring in collections["western"] %}
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

  /* Center bottom row when only 2 cards */
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
 
