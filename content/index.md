---
layout: layouts/base.njk
title: "Home — Custom Design's LA"
description: ""
---

<section class="homepage-hero">
  <div class="hero-wrapper" style="position:relative; text-align:center; margin-bottom:40px;">

    <!-- RESPONSIVE HERO IMAGE -->
 <picture class="hero-picture">
  <!-- MOBILE -->
  <source
    srcset="/static/img/hero-mobile.jpg"
    media="(max-width: 767px)"
  />

  <!-- TABLET -->
  <source
    srcset="/static/img/hero-tablet.jpg"
    media="(min-width: 768px) and (max-width: 1023px)"
  />

  <!-- DESKTOP -->
  <source
    srcset="/static/img/hero-desktop.jpg"
    media="(min-width: 1024px)"
  />

  <!-- Fallback (never used unless browser is ancient) -->
  <img
    src="/static/img/hero-desktop.jpg"
    alt="Custom Design’s LA — handcrafted custom jewelry"
    class="hero-img"
    loading="eager"
    decoding="async"
  />
</picture>

  </div>
</section>

<!-- HOMEPAGE SLIDER (RESTORED) -->
<section class="homepage-slider">
  <div class="slider-track">
    <!-- Slider images injected by home-slider.js -->
  </div>
</section>
