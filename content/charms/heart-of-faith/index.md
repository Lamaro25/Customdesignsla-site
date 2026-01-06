---
layout: base.njk
title: "Heart Of Faith"
permalink: /charms/heart-of-faith/
---

# Heart Of Faith

Faith-inspired charms designed as personal expressions of belief and devotion,
hand-cast in solid .925 sterling silver.

<div class="collection-grid">

{% for charm in collections["heart-of-faith"] %}
  <a href="{{ charm.url }}" class="collection-card">
    <img
      src="{{ charm.data.images | first }}"
      alt="{{ charm.data.title }}"
      loading="lazy"
    >
    <div class="collection-card-text">
      <h3>{{ charm.data.title }}</h3>
      <p class="price">${{ charm.data.price }} USD</p>
    </div>
  </a>
{% endfor %}

</div>
