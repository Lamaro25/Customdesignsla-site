document.addEventListener("DOMContentLoaded", () => {
  // 🔒 SAFETY: Only run slider on homepage
  if (!document.body.classList.contains("page-home")) return;

  /* ==========================================================
     SLIDER IMAGE SETS
  ========================================================== */

  const primaryImages = [
    "slider_01.jpg","slider_02.jpg","slider_03.jpg","slider_04.jpg",
    "slider_05.jpg","slider_06.jpg","slider_07.jpg","slider_08.jpg",
    "slider_09.jpg","slider_10.jpg","slider_11.jpg","slider_12.jpg",
    "slider_13.jpg","slider_14.jpg","slider_15.jpg","slider_16.jpg",
    "slider_17.jpg","slider_18.jpg","slider_19.jpg","slider_20.jpg",
    "slider_21.jpg","slider_22.jpg","slider_23.jpg","slider_24.jpg",
    "slider_25.jpg","slider_26.jpg","slider_27.jpg","slider_28.jpg",
    "slider_29.jpg","slider_30.jpg","slider_31.jpg","slider_32.jpg",
  ];

  const customizationImages = [
    "custom_01.jpg",
    "custom_02.jpg",
    "custom_03.jpg",
    "custom_04.jpg"
  ];

  /* ==========================================================
     SLIDER FACTORY
  ========================================================== */

  function initSlider(selector, images, folder) {
    const slider = document.querySelector(selector);
    if (!slider) return;

    const track = slider.querySelector(".slider-track");
    if (!track) return;

    slider.style.overflow = "hidden";
    slider.style.position = "relative";
    slider.style.cursor = "grab";
    slider.style.userSelect = "none";

    track.style.display = "flex";
    track.style.transition = "transform 0.45s ease";
    track.style.willChange = "transform";

    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;

    /* Build slides */
    images.forEach((file, idx) => {
      const slide = document.createElement("div");
      slide.className = "slider-slide";
      slide.style.flex = "0 0 100%";
      slide.style.display = "flex";
      slide.style.alignItems = "center";
      slide.style.justifyContent = "center";

      const img = document.createElement("img");
      img.src = `/static/img/${folder}/${file}`;
      img.alt = `Slide ${idx + 1}`;
      img.draggable = false;
      img.style.height = "100%";
      img.style.maxWidth = "100%";
      img.style.objectFit = "contain";

      slide.appendChild(img);
      track.appendChild(slide);
    });

    /* Dots */
    const dots = document.createElement("div");
    dots.className = "slider-dots";
    slider.appendChild(dots);

    images.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot";
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(i));
      dots.appendChild(dot);
    });

    /* Arrows */
    ["prev", "next"].forEach(dir => {
      const btn = document.createElement("button");
      btn.className = `slider-arrow ${dir === "prev" ? "left" : "right"}`;
      btn.addEventListener("click", () => {
        goToSlide(dir === "prev" ? currentIndex - 1 : currentIndex + 1);
      });
      slider.appendChild(btn);
    });

    function updateDots() {
      dots.querySelectorAll(".slider-dot").forEach((d, i) => {
        d.classList.toggle("active", i === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, images.length - 1));
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots();
    }

    /* Drag / Swipe */
    slider.addEventListener("mousedown", e => {
      isDragging = true;
      startX = e.clientX;
      slider.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", e => {
      if (!isDragging) return;
      const diff = startX - e.clientX;
      if (diff > 60) goToSlide(currentIndex + 1);
      if (diff < -60) goToSlide(currentIndex - 1);
      isDragging = false;
      slider.style.cursor = "grab";
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

  /* ==========================================================
     INIT SLIDERS (CORRECT SELECTORS)
  ========================================================== */

  initSlider(".homepage-slider:not(.slider-secondary)", primaryImages, "homepage-slider");
  initSlider(".slider-secondary", customizationImages, "customization-slider");

});
