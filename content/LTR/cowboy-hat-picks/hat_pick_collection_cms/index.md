---
title: "Signature Cowboy Hat Picks"
layout: base.njk
permalink: "/LTR/cowboy-hat-picks/"
---

# Signature Cowboy Hat Picks  
Available in **Bronze & Sterling Silver**

$75 each  
12+ unique designs available

<div class="product-grid">
{% for pick in collections['hat_picks'] %}
  <div class="product-card">
    <a href="{{ pick.url }}">
      <img src="{{ pick.data.images[0] }}" alt="{{ pick.data.title }}">
      <h3>{{ pick.data.title }}</h3>
      <p>${{ pick.data.price }} USD</p>
    </a>
  </div>
{% endfor %}
</div>
