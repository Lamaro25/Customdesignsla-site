---
title: "Cowboy Hat Picks"
layout: "base.njk"
permalink: "/ltr/cowboy-hat-picks/"
---

# Signature Cowboy Hat Picks  
Available in **Bronze & Sterling Silver**

$75 each  
11 unique designs available

<div class="product-grid">
{% for item in collections.cowboy_hat_picks %}
  {% include "ltr-card.njk" 
      title=item.data.title 
      price=item.data.price 
      image=item.data.images[0]
      url=item.url
  %}
{% endfor %}
</div>

<style>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
</style>
