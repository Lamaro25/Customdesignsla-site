---
layout: base.njk
title: "Garden of Silver Ring Collection — Custom Designs LA"
description: "Garden of Silver rings — CDLA’s first AI-assisted ring collection inspired by nature: sculpted florals, flowing vines, and organic textures, all handcrafted in .925 Sterling Silver."
permalink: /rings/garden-of-silver/
---

<div class="collection-page">

<header class="collection-intro">
  <div class="collection-intro-row">
    <span class="collection-accent" aria-hidden="true"></span>
    <h1 class="collection-intro-title">Garden of Silver Ring</h1>
    <span class="collection-accent" aria-hidden="true"></span>
  </div>
  <p class="collection-intro-subtitle">COLLECTION</p>
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
  margin: clamp(1.1rem, 3vw, 2rem) 0 1.4rem;
  text-align: center;
}

.collection-page .collection-intro-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.45rem, 1.8vw, 0.95rem);
  width: 100%;
}

.collection-page .collection-intro-title {
  margin: 0;
  color: #232323;
  font-family: "Great Vibes", "Times New Roman", serif;
  font-size: clamp(1.95rem, 5.7vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.collection-page .collection-intro-subtitle {
  margin: 0.45rem 0 0;
  color: rgba(35, 35, 35, 0.8);
  font-size: clamp(0.68rem, 1.7vw, 0.8rem);
  font-weight: 500;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
}

.collection-page .collection-accent {
  width: clamp(1.9rem, 9vw, 4.2rem);
  height: 1px;
  background: linear-gradient(90deg, rgba(35, 35, 35, 0) 0%, rgba(35, 35, 35, 0.42) 100%);
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
  transform: translateY(-0.12em);
}

.collection-page .collection-accent:last-child {
  transform: translateY(-0.12em) scaleX(-1);
}

@media (max-width: 640px) {
  .collection-page .collection-intro {
    margin: 1rem 0 1.1rem;
  }

  .collection-page .collection-intro-subtitle {
    margin-top: 0.35rem;
    letter-spacing: 0.28em;
    text-indent: 0.28em;
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
