document.addEventListener("DOMContentLoaded", () => {

  // ✅ Only run on homepage
  if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
    return;
  }

  /* ==========================
     PRIMARY SLIDER IMAGES
  ========================== */
  const primaryImages = [
    "slider_01.jpg","slider_02.jpg","slider_03.jpg","slider_04.jpg",
    "slider_05.jpg","slider_06.jpg","slider_07.jpg","slider_08.jpg",
    "slider_09.jpg","slider_10.jpg","slider_11.jpg","slider_12.jpg",
    "slider_13.jpg","slider_14.jpg","slider_15.jpg","slider_16.jpg",
    "slider_17.jpg","slider_18.jpg","slider_19.jpg","slider_20.jpg",
    "slider_21.jpg","slider_22.jpg","slider_23.jpg","slider_24.jpg",
    "slider_25.jpg","slider_26.jpg","slider_27.jpg","slider_28.jpg",
    "slider_29.jpg","slider_30.jpg","slider_31.jpg","slider_32.jpg"
  ];

  /* ==========================
     SECONDARY SLIDER IMAGES
  ========================== */
  const secondaryImages = [
    "feature_01.jpg","feature_02.jpg","feature_03.jpg","feature_04.jpg",
    "feature_05.jpg","feature_06.jpg","feature_07.jpg","feature_08.jpg",
    "feature_09.jpg","feature_10.jpg","feature_11.jpg","feature_12.jpg",
    "feature_13.jpg","feature_14.jpg","feature_15.jpg","feature_16.jpg",
    "feature_17.jpg","feature_18.jpg","feature_19.jpg","feature_20.jpg",
    "feature_21.jpg","feature_22.jpg","feature_23.jpg","feature_24.jpg",
    "feature_25.jpg","feature_26.jpg","feature_27.jpg","feature_28.jpg",
    "feature_29.jpg","feature_30.jpg"
  ];

  function initSlider(selector, images, folder) {
    const slider = document.querySelector(selector);
    if (!slider) return;

    const track = slider.querySelector(".slider-track");
    if (!track) return;

    track.style.display = "flex";
    track.style.transition = "transform 0.45s ease";
    track.style.willChange = "transform";

    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;

    const slides = [];

    /* ==========================
       BUILD SLIDES
    ========================== */
    images.forEach((file, idx) => {
      const slide = document.createElement("div");
      slide.className = "slide";
      slide.style.flex = "0 0 100%";

      const img = document.createElement("img");
      img.src = `/static/img/${folder}/${file}`;
      img.alt = `Slide ${idx + 1}`;
      img.draggable = false;

      slide.appendChild(img);
      track.appendChild(slide);
      slides.push(slide);
    });

    /* ==========================
       DOTS
    ========================== */
    const dots = slider.querySelector(".slider-dots");
    dots.innerHTML = "";

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot";
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => goToSlide(i));
      dots.appendChild(dot);
    });

    function updateDots() {
      dots.querySelectorAll(".slider-dot").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, slides.length - 1));
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots();
    }

    /* ==========================
       ARROWS
    ========================== */
    const prev = slider.querySelector(".slider-arrow.left");
    const next = slider.querySelector(".slider-arrow.right");

    prev.addEventListener("click", () => goToSlide(currentIndex - 1));
    next.addEventListener("click", () => goToSlide(currentIndex + 1));

    /* ==========================
       DRAG / SWIPE
    ========================== */
    slider.addEventListener("mousedown", e => {
      isDragging = true;
      startX = e.clientX;
    });

    window.addEventListener("mouseup", e => {
      if (!isDragging) return;
      const diff = startX - e.clientX;
      if (diff > 60) goToSlide(currentIndex + 1);
      if (diff < -60) goToSlide(currentIndex - 1);
      isDragging = false;
    });

    slider.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 60) goToSlide(currentIndex + 1);
      if (diff < -60) goToSlide(currentIndex - 1);
    });
  }

  /* ==========================
     INITIALIZE BOTH SLIDERS
  ========================== */
  initSlider(".homepage-slider", primaryImages, "slider");
  initSlider(".secondary-slider", secondaryImages, "features");

});
