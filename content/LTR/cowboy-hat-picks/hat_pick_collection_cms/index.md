---
title: "Signature Cowboy Hat Picks"
layout: base.njk
permalink: "/ltr/cowboy-hat-picks/"
---

# Signature Cowboy Hat Picks

Available in **Bronze & Sterling Silver**

$75 Bronze  
$150 Sterling Silver  
11 unique designs available

<div class="product-grid">
  {% for item in collections.cowboy_hat_picks %}
    {% include "ltr-card.njk" with {
      title: item.data.title,
      price_bronze: item.data.bronze_price,
      price_silver: item.data.silver_price,
      image: item.data.images[0],
      url: item.url
    } %}
  {% endfor %}
</div>

<style>
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}
</style>
