---
layout: base.njk
title: "Western Ring Collection — Custom Designs LA"
description: "Handcrafted Western rings — Texas heritage, frontier symbolism, and sculpted sterling silver designs by Custom Designs LA."
permalink: /rings/western/
---

# Western Ring Collection

Explore handcrafted Western rings inspired by Texas heritage, frontier grit, and bold symbolic design — all cast in .925 Sterling Silver.

<div class="product-grid">

{% for ring in collections["western"] %}
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
