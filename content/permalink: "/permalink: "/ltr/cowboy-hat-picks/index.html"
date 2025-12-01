<div class="product-grid">
{% for item in collections.cowboy_hat_picks %}
  {% include "ltr-card.njk" with {
    title: item.data.title,
    price: item.data.price,
    image: item.data.images[0],
    url: item.url
  } %}
{% endfor %}
</div>

<style>
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  justify-items: center;
}
</style>
