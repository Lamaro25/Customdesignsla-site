---
layout: base.njk
title: "Western Ring Collection — Custom Designs LA"
description: "Handcrafted Western rings — Texas heritage, frontier symbolism, and sculpted sterling silver designs by Custom Designs LA."
permalink: /rings/western/
---

<div class="collection-page">

<div class="collection-page-header-image-wrap">
  <img
    src="/static/img/western-ring-collection.png"
    alt="Western collection header"
    class="collection-page-header-image"
  >
</div>

<div class="collection-grid">

{% for ring in collections["western"] %}
  {% assign sku = ring.data.sku | default: "" %}
  {% assign cardTitleImage = "" %}

  {% if sku == "WR-001" %}
    {% assign cardTitleImage = "/static/img/wr-001-card-title.png" %}
  {% elsif sku == "WR-002" %}
    {% assign cardTitleImage = "/static/img/wr-002-card-title.png" %}
  {% elsif sku == "WR-003" %}
    {% assign cardTitleImage = "/static/img/wr-003-card-title.png" %}
  {% elsif sku == "WR-004" %}
    {% assign cardTitleImage = "/static/img/wr-004-card-title.png" %}
  {% elsif sku == "WR-005" %}
    {% assign cardTitleImage = "/static/img/wr-005-card-title.png" %}
  {% elsif sku == "WR-006" %}
    {% assign cardTitleImage = "/static/img/wr-006-card-title.png" %}
  {% endif %}

  <a href="{{ ring.url }}" class="collection-card">
    <img src="{{ ring.data.images | first | default: '/static/img/placeholder.png' }}" alt="{{ ring.data.title }}">

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

      <p class="price{% if cardTitleImage != "" %} product-card-price--silver{% endif %}">
        ${{ ring.data.price }} USD
      </p>

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

/* MOBILE */
@media (max-width: 1023px) {
  .collection-grid {
    grid-template-columns: 1fr;
  }
}

/* DESKTOP */
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
}

.collection-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

/* ===============================
   FOOTER (WORKING SYSTEM)
================================ */

.collection-card-text {
  padding: 1rem;
  text-align: center;
}

.product-card-title-panel--black {
  background: #000;
  height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.product-card-title-image-slot {
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-card-title-image {
  max-width: 90%;
  max-height: 100%;
  object-fit: contain;
}

.product-card-price--silver {
  background: linear-gradient(180deg,#fff,#ccc,#fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}
</style>

</div>
