---
layout: base.njk
title: "Charm Bracelets — Custom Designs LA"
description: "Handcrafted charm bracelets in solid .925 sterling silver."
permalink: /bracelets/charm/
---

# Charm Bracelets

Handcrafted sterling silver charm bracelets, finished and assembled by hand.

<div class="collection-grid">

{% for bracelet in collections["charm"] %}
  <a href="{{ bracelet.url }}" class="collection-card">
    <img
      src="{{ bracelet.data.images | first | default('/static/img/placeholders/product-coming-soon.jpg') }}"
      alt="{{ bracelet.data.title }}"
      loading="lazy"
    >
    <div class="collection-card-text">
      <h3>{{ bracelet.data.title }}</h3>
      {% if bracelet.data.price %}
        <p class="price">${{ bracelet.data.price }} USD</p>
      {% endif %}
    </div>
  </a>
{% endfor %}

</div>
