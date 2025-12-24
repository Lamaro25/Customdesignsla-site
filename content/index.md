---
layout: layouts/base.njk
title: "Home — Custom Design's LA"
description: ""
---

<!-- PRIMARY HERO -->
<section class="homepage-hero full-bleed">
  <div class="hero-wrapper">
    <picture>
      <!-- MOBILE -->
      <source srcset="/static/img/hero-mobile.jpg" media="(max-width: 767px)">

      <!-- TABLET -->
      <source srcset="/static/img/hero-tablet.jpg" media="(min-width: 768px) and (max-width: 1023px)">

      <!-- DESKTOP -->
      <source srcset="/static/img/hero-desktop.jpg" media="(min-width: 1024px)">

      <!-- FALLBACK -->
      <img
        src="/static/img/hero-desktop.jpg"
        alt="Custom Design’s LA — handcrafted custom jewelry"
        class="hero-img"
        loading="eager"
        decoding="async">
    </picture>
  </div>
</section>

<!-- HALL OF FAME SLIDER -->
<section class="homepage-slider">
  <div class="slider-track">
    <!-- Slider images injected by home-slider.js -->
  </div>
</section>

<!-- HERO 2.0 — CUSTOMIZATION -->
<section class="homepage-hero hero-secondary full-bleed">
  <div class="hero-wrapper">
    <picture>
      <!-- MOBILE -->
      <source
        srcset="/static/img/hero-2.0-mobile.jpg"
        media="(max-width: 767px)"
      />

      <!-- TABLET -->
      <source
        srcset="/static/img/hero-2.0-tablet.jpg"
        media="(min-width: 768px) and (max-width: 1023px)"
      />

      <!-- DESKTOP -->
      <source
        srcset="/static/img/hero-2.0-desktop.jpg"
        media="(min-width: 1024px)"
      />

      <!-- FALLBACK -->
      <img
        src="/static/img/hero-2.0-desktop.jpg"
        alt="Explore the customization options available for CDLA pieces"
        class="hero-img"
        loading="lazy"
        decoding="async">
    </picture>
  </div>
</section>
