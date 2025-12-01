---
title: "Signature Cowboy Hat Picks"
layout: "base"
permalink: "/ltr/cowboy-hat-picks/"
---

# Signature Cowboy Hat Picks  
Available in **Bronze & Sterling Silver**

$75 each  
11 unique designs available

<div class="ltr-card-grid">
{% for item in collections.cowboy_hat_picks %}
  <a class="ltr-card-link" href="{{ item.url }}">
    <article class="ltr-card">
      <div class="ltr-card-image">
        {% if item.data.images and item.data.images.length %}
          <img src="{{ item.data.images[0] }}" alt="{{ item.data.title }}">
        {% else %}
          <span class="ltr-card-image-placeholder">Image Coming Soon</span>
        {% endif %}
      </div>

      <div class="ltr-card-body">
        <h3 class="ltr-card-title">{{ item.data.title }}</h3>
        {% if item.data.price %}
          <p class="ltr-card-price">${{ item.data.price }} USD</p>
        {% endif %}
      </div>
    </article>
  </a>
{% endfor %}
</div>

<style>
.ltr-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* Make the whole card clickable, remove blue link styles */
.ltr-card-link {
  text-decoration: none;
  color: inherit;
}

/* Wooden plaque card */
.ltr-card {
  position: relative;
  padding: 1.5rem 1.5rem 2rem;
  background-image: url("/static/img/LTR-Western-Integration/ltr-card-blank.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Image slot (top inset rectangle) */
.ltr-card-image {
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

/* Product image inside the window */
.ltr-card-image img {
  max-width: 80%;
  max-height: 100%;
  border-radius: 0.5rem;
}

/* "Image Coming Soon" placeholder text */
.ltr-card-image-placeholder {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
}

/* Title + price text area (bottom of plaque) */
.ltr-card-body {
  text-align: center;
}

.ltr-card-title {
  font-family: "Georgia", serif;
  font-size: 1.05rem;
  line-height: 1.3;
}

.ltr-card-price {
  margin-top: 0.35rem;
  font-weight: 600;
}
</style>
