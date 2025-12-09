/* ==========================================================
   HOMEPAGE SLIDER — MULTI-IMAGE SLIDE VERSION
========================================================== */

.homepage-slider {
  width: 100%;
  max-width: 1100px;
  margin: 40px auto;
  overflow: hidden;
  position: relative;
  border-radius: 14px;
  background: #000;
  box-shadow: 0 0 25px rgba(0,0,0,0.25);
}

/* Track holds all slides horizontally */
.slider-track {
  display: flex;
  transition: transform 0.45s ease-in-out;
}

/* Each slide is a row of images */
.slide {
  min-width: 100%;
  display: flex;
  gap: 8px;
  padding: 12px;
  box-sizing: border-box;
}

/* Images inside each slide */
.slide img {
  width: calc(25% - 6px);  /* 4 images per slide */
  height: 360px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

/* Dots */
.slider-dots {
  text-align: center;
  margin-top: 12px;
}

.slider-dots span {
  width: 12px;
  height: 12px;
  background: #bbb;
  display: inline-block;
  margin: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}

.slider-dots .active {
  background: #333;
  transform: scale(1.2);
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .slide img {
    width: calc(50% - 6px); /* Show 2 images per row on mobile */
    height: 220px;
  }

  .slide {
    flex-wrap: wrap; /* stack into 2×2 grid */
  }
}
