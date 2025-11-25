---
layout: base.njk
title: "Faith Ring Collection — Custom Designs LA"
description: "Faith-inspired rings — scripture engravings, symbolic crosses, and meaningful Christian designs in polished and oxidized .925 sterling silver by Custom Designs LA."
permalink: /rings/faith/
---

# Faith Ring Collection

A collection of spiritually inspired rings — each crafted with scripture, symbols of devotion, and meaningful design. Sculpted in .925 Sterling Silver, oxidized for depth, and polished by hand.

<div class="product-grid">

{% for ring in collections["faith"] %}
  <div class="product-card">
    <a href="{{ ring.url }}">
      <img src="{{ ring.data.images[0] }}" alt="{{ ring.data.title }}" />
      <h3>{{ ring.data.title }}</h3>
      <p>${{ ring.data.price }} USD</p>
    </a>
  </div>
{% endfor %}

</div>

<style>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.product-card {
  background: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ddd;
}

.product-card img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}
</style>
