---
layout: base.njk
title: "Garden of Silver Ring Collection — Custom Designs LA"
description: "Garden of Silver rings — CDLA’s first AI-assisted ring collection inspired by nature: sculpted florals, flowing vines, and organic textures, all handcrafted in .925 Sterling Silver."
permalink: /rings/garden-of-silver/
---

<div class="collection-page">

<header class="collection-intro">
  <h1 class="collection-intro-title">Garden of Silver Ring Collection</h1>
</header>

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
  margin-top: 1.25rem;
}

.collection-page .collection-intro {
  margin: 0.5rem 0 1.25rem;
  text-align: center;
}

.collection-page .collection-intro-title {
  margin: 0;
  color: #232323;
  font-family: "Great Vibes", "Times New Roman", serif;
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 400;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.collection-page .collection-intro-title::before,
.collection-page .collection-intro-title::after {
  content: "";
  display: inline-block;
  width: clamp(2.25rem, 12vw, 5.5rem);
  border-top: 1px solid rgba(35, 35, 35, 0.28);
  vertical-align: middle;
  margin: 0 0.75rem;
  transform: translateY(-0.14em);
}

.collection-page .collection-intro::after {
  content: "❦";
  display: block;
  margin-top: 0.35rem;
  color: rgba(35, 35, 35, 0.5);
  font-size: 0.95rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .collection-page .collection-intro {
    margin: 0.25rem 0 1rem;
  }

  .collection-page .collection-intro-title::before,
  .collection-page .collection-intro-title::after {
    margin: 0 0.4rem;
  }
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
