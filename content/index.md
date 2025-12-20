---
layout: layouts/base.njk
title: "Home — Custom Design's LA"
description: ""
---

<section class="homepage-hero">
  <div class="hero-wrapper" style="position:relative; text-align:center; margin-bottom:40px;">

    <!-- RESPONSIVE HERO IMAGE -->
    <picture>

      <!-- mobile -->
      <source 
        srcset="/static/img/hero-img-mobile-1080x1500.jpg"
        media="(max-width: 640px)"
      />

      <!-- tablet -->
      <source 
        srcset="/static/img/hero-img-tablet-1536x900.jpg"
        media="(min-width: 641px) and (max-width: 1200px)"
      />

      <!-- desktop fallback -->
      <img 
        src="/static/img/hero-img-Desktop-1920x650.jpg"
        alt="CDLA homepage hero image"
        class="hero-img"
        style="width:100%; height:auto; display:block; margin:0 auto;"
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
