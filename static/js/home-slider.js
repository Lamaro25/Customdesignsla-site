document.addEventListener("DOMContentLoaded", () => {

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

  function initSlider(selector, images) {
    const slider = document.querySelector(selector);
    if (!slider) return;

    const track = slider.querySelector(".slider-track");
    if (!track) return;

    track.innerHTML = "";
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

      // 🔑 RESTORED WORKING IMAGE PATH
      img.src = `/static/img/hero-slider/${file}`;

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

    goToSlide(0);
  }

  // 🔑 RESTORED INIT
  initSlider(".homepage-slider", primaryImages);

});
