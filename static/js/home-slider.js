document.addEventListener("DOMContentLoaded", () => {
  const imageFiles = [
    "slider_01.jpg","slider_02.jpg","slider_03.jpg","slider_04.jpg",
    "slider_05.jpg","slider_06.jpg","slider_07.jpg","slider_08.jpg",
    "slider_09.jpg","slider_10.jpg","slider_11.jpg","slider_12.jpg",
    "slider_13.jpg","slider_14.jpg","slider_15.jpg","slider_16.jpg",
    "slider_17.jpg","slider_18.jpg","slider_19.jpg","slider_20.jpg",
    "slider_21.jpg","slider_22.jpg","slider_23.jpg","slider_24.jpg",
    "slider_25.jpg","slider_26.jpg","slider_27.jpg","slider_28.jpg"
  ];

  const slider = document.querySelector(".homepage-slider");
  const track = document.querySelector(".slider-track");

  if (!slider || !track) {
    console.warn("Slider container not found");
    return;
  }

  slider.style.cursor = "grab";
  slider.style.userSelect = "none";

  let currentIndex = 0;

  /* =========================
     BUILD SLIDES
  ========================== */
  imageFiles.forEach((filename, idx) => {
    const slide = document.createElement("div");
    slide.className = "slider-slide";

    const img = document.createElement("img");
    img.src = `/static/img/homepage-slider/${filename}`;
    img.alt = `Custom piece ${idx + 1}`;
    img.draggable = false;

    slide.appendChild(img);
    track.appendChild(slide);
  });

  /* ✅ CRITICAL FIX — LOCK TRACK WIDTH */
  track.style.width = `${imageFiles.length * 100}%`;

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, imageFiles.length - 1));
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  /* =========================
     DESKTOP + MOBILE SWIPE
  ========================== */
  let startX = 0;
  let isDragging = false;

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
});
