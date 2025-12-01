# Signature Cowboy Hat Picks  
Available in **Bronze & Sterling Silver**

$75 each  
11 unique designs available

<div class="product-grid">
{% for item in collections.cowboy_hat_picks %}
  <div class="product-card">
    <a href="{{ item.url }}">
      <img src="{{ item.data.images[0] }}" alt="{{ item.data.title }}">
      <h3>{{ item.data.title }}</h3>
      <p>${{ item.data.price }} USD</p>
    </a>
  </div>
{% endfor %}
</div>
