---
layout: base.njk
title: "Cuban Link Ring Collection — Custom Designs LA"
description: "Cuban Link rings — bold sculpted links, polished surfaces, and handcrafted .925 Sterling Silver designs. Sculpted, oxidized, and finished by hand."
permalink: /rings/cuban-link/
---

<div class="collection-page">


<div class="collection-page-header-image-wrap">
  <img
    src="/static/img/cuban-link-ring-collection.png"
    alt="Cuban Link collection header"
    class="collection-page-header-image"
  >
</div>

<div class="collection-grid">

{% for ring in collections["cuban-link"] %}
  {% assign sku = ring.data.sku | default: "" %}
  {% assign isTargetCard = false %}
  {% if sku == "CL-001" or sku == "CL-002" or sku == "CL-003" or sku == "CL-004" or sku == "CL-005" or sku == "CL-006" %}
    {% assign isTargetCard = true %}
  {% endif %}
  {% assign cardTitleImage = "" %}
  {% assign displayPrice = ring.data.price %}
  {% if sku == "CL-001" %}
    {% assign displayPrice = 114 %}
    {% assign cardTitleImage = "/static/img/cl-001-card-title.png" %}
  {% elsif sku == "CL-002" %}
    {% assign cardTitleImage = "/static/img/cl-002-card-title.png" %}
    {% assign displayPrice = 176 %}
  {% elsif sku == "CL-003" %}
    {% assign cardTitleImage = "/static/img/cl-003-card-title.png" %}
    {% assign displayPrice = 136 %}
  {% elsif sku == "CL-006" %}
    {% assign cardTitleImage = "/static/img/cl-006-card-title.png" %}
  {% endif %}
  <a href="{{ ring.url }}" class="collection-card product-card" data-sku="{{ sku }}">
    <img src="{{ ring.data.images | first }}" alt="{{ ring.data.title }}">
    <div class="collection-card-text{% if isTargetCard %} product-card-footer{% endif %}">
      {% if isTargetCard %}
        <div class="product-card-title-slot">
          <img
            {% if cardTitleImage != "" %}src="{{ cardTitleImage }}"{% endif %}
            alt="{{ ring.data.title }}"
            class="product-card-title-image"
            loading="lazy"
            onerror="this.removeAttribute('src'); this.style.display='none';"
          >
        </div>
      {% else %}
        <h3>{{ ring.data.title }}</h3>
      {% endif %}
      <p class="price{% if isTargetCard %} product-card-price{% endif %}{% if sku == "CL-001" %} product-card-price--silver{% endif %}">${{ displayPrice }} USD</p>
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



.product-card .product-card-footer {
  width: 100% !important;
  box-sizing: border-box;
  background: #000 !important;
  color: #d8d8d8;
  min-height: 120px;
  max-height: 150px;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  border-radius: 0 0 inherit inherit;
}

.product-card .product-card-title-slot {
  width: 100%;
  max-width: 100%;
  background: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.product-card .product-card-title-image {
  display: block !important;
  width: 92% !important;
  max-width: calc(100% - 32px) !important;
  height: auto !important;
  max-height: 72px !important;
  object-fit: contain !important;
  background: transparent !important;
  opacity: 1 !important;
  visibility: visible !important;
  filter: none !important;
  position: relative;
  z-index: 5;
}

.product-card .product-card-title-image[src=""],
.product-card .product-card-title-image:not([src]) {
  display: none !important;
}


.product-card .product-card-price {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  color: #d8d8d8 !important;
  font-weight: 800;
  text-align: center;
  margin-top: 8px;
  position: relative;
  z-index: 10;
  filter: none !important;
  transform: none !important;
  text-shadow:
    0 1px 0 #fff,
    0 2px 4px rgba(255,255,255,.35),
    0 -1px 0 #555;
}

.product-card .product-card-price--silver {
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
  text-shadow:
    0 0 1px rgba(255,255,255,0.3),
    0 1px 1px rgba(0,0,0,0.4);
}

.product-card[data-sku="CL-001"] .product-card-price {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 20 !important;
  color: #d8d8d8 !important;
  -webkit-text-fill-color: #d8d8d8 !important;
  background: none !important;
  -webkit-background-clip: border-box !important;
  background-clip: border-box !important;
  font-weight: 800;
  text-align: center;
  margin-top: 8px;
  filter: none !important;
  transform: none !important;
  text-shadow:
    0 1px 0 #fff,
    0 2px 4px rgba(255,255,255,.35),
    0 -1px 0 #555;
}

.product-card[data-sku="CL-001"] .product-card-footer {
  overflow: visible;
}

</style>

</div>
