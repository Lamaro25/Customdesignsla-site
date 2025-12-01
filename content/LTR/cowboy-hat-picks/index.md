---
title: "Signature Cowboy Hat Picks"
layout: "base.njk"
tags:
  - cowboy_hat_picks_page
permalink: "/ltr/cowboy-hat-picks/"
---

<h1>Signature Cowboy Hat Picks</h1>

<p>Available in <strong>Bronze &amp; Sterling Silver</strong></p>

<p>
$75 Bronze<br>
$150 Sterling Silver<br>
11 unique designs available
</p>

<div class="product-grid">
{% for item in collections.cowboy_hat_picks %}
  {% include "ltr-card.njk" with {
    title: item.data.title,
    price: item.data.price,
    image: item.data.images and item.data.images[0] or null,
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
  padding-bottom: 5rem;
}
</style>
