---
layout: base.njk
title: "Faith Ring Collection — Custom Designs LA"
description: "Faith-inspired rings — scripture engravings, symbolic crosses, and meaningful Christian designs in polished and oxidized .925 sterling silver by Custom Designs LA."
permalink: /rings/faith/
---

<div class="collection-page">


<div class="collection-page-header-image-wrap">
  <img
    src="/static/img/faith-ring-collection.png"
    alt="Faith Ring collection header"
    class="collection-page-header-image"
  >
</div>

<div class="collection-grid">

{% for ring in collections["faith"] %}
  {% assign sku = ring.data.sku | default: "" %}
  {% assign cardTitleImage = "" %}
  {% if sku == "FR-001" %}
    {% assign cardTitleImage = "/static/img/fr-001-card-title.png" %}
  {% elsif sku == "FR-002" %}
    {% assign cardTitleImage = "/static/img/fr-002-card-title.png" %}
  {% elsif sku == "FR-003" %}
    {% assign cardTitleImage = "/static/img/fr-003-card-title.png" %}
  {% elsif sku == "FR-004" %}
    {% assign cardTitleImage = "/static/img/fr-004-card-title.png" %}
  {% elsif sku == "FR-005" %}
    {% assign cardTitleImage = "/static/img/fr-005-card-title.png" %}
  {% elsif sku == "FR-006" %}
    {% assign cardTitleImage = "/static/img/fr-006-card-title.png" %}
  {% endif %}
  <a href="{{ ring.url }}" class="collection-card">
    <img src="{{ (ring.data.images | first) or '/static/img/placeholder.png' }}" alt="{{ ring.data.title }}">
    <div class="collection-card-text{% if cardTitleImage != "" %} product-card-title-panel--black{% endif %}">
      {% if cardTitleImage != "" %}
        <div class="product-card-title-image-slot">
          <img
            src="{{ cardTitleImage }}"
            alt="{{ ring.data.title }}"
            class="product-card-title-image"
            loading="lazy"
          >
        </div>
      {% else %}
        <h3>{{ ring.data.title }}</h3>
      {% endif %}
      <p class="price{% if cardTitleImage != "" %} product-card-price--silver{% endif %}">${{ ring.data.price }} USD</p>
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
  margin-top: 1.25rem;
}

.collection-intro {
  margin: clamp(1.1rem, 3vw, 2rem) 0 1.4rem;
  text-align: center;
}

.collection-intro-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.45rem, 1.8vw, 0.95rem);
  width: 100%;
}

.collection-intro-title {
  margin: 0;
  color: #232323;
  font-family: "Great Vibes", "Times New Roman", serif;
  font-size: clamp(1.95rem, 5.7vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.collection-intro-subtitle {
  margin: 0.45rem 0 0;
  color: rgba(35, 35, 35, 0.8);
  font-size: clamp(0.68rem, 1.7vw, 0.8rem);
  font-weight: 500;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
}

.collection-accent {
  width: clamp(1.9rem, 9vw, 4.2rem);
  height: 1px;
  background: linear-gradient(90deg, rgba(35, 35, 35, 0) 0%, rgba(35, 35, 35, 0.42) 100%);
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
  transform: translateY(-0.12em);
}

.collection-accent:last-child {
  transform: translateY(-0.12em) scaleX(-1);
}

@media (max-width: 640px) {
  .collection-intro {
    margin: 1rem 0 1.1rem;
  }

  .collection-intro-subtitle {
    margin-top: 0.35rem;
    letter-spacing: 0.28em;
    text-indent: 0.28em;
  }
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

.product-card-title-panel--black {
  background: #000;
  position: relative;
  height: 88px;
  min-height: 88px;
  max-height: 88px;
  padding: 8px 10px 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.product-card-title-panel--black::before,
.product-card-title-panel--black::after {
  content: none !important;
}

.product-card-title-image-slot {
  height: 46px;
  max-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-card-title-image-slot.is-empty::before {
  content: "";
  width: 1px;
  height: 1px;
}

.product-card-title-image {
  display: block;
  margin: 0 auto;
  width: auto;
  height: auto;
  max-width: 90%;
  max-height: 100%;
  object-fit: contain;
  aspect-ratio: auto !important;
  background: transparent !important;
  border-radius: 0;
  padding: 0;
}

.product-card-price--silver {
  margin-top: 5px;
  line-height: 1.1;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #e6e6e6 25%,
    #cfcfcf 50%,
    #f5f5f5 75%,
    #bfbfbf 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 0;
  margin-bottom: 0;
  font-weight: 600;
  opacity: 1 !important;
  filter: none !important;
  text-shadow:
    0 0 1px rgba(255,255,255,0.3),
    0 1px 1px rgba(0,0,0,0.4);
  mix-blend-mode: normal !important;
  position: relative;
  z-index: 10;
  line-height: 1.15;
  letter-spacing: 0.01em;
  transform: none !important;
}
</style>

</div>
