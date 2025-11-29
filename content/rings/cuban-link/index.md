---
layout: base.njk
title: "Cuban Link Ring Collection — Custom Designs LA"
description: "Handcrafted Cuban Link rings — sculpted, oxidized, and polished .925 sterling silver pieces by Custom Designs LA."
permalink: /rings/cuban-link/
---

# Cuban Link Ring Collection

Explore the full handcrafted Cuban Link series — bold, sculpted, and polished pieces cast in .925 Sterling Silver.

<div class="product-grid">

{% for ring in collections["cuban-link"] %}
  <div class="product-card">
    <a href="{{ ring.url }}">
      <img src="{{ ring.data.images[0] }}" alt="{{ ring.data.title }}" />
      <h3>{{ ring.data.title }}</h3>
      <p>${{ ring.data.price }} USD</p>
    </a>
  </div>
{% endfor %}

</div>
