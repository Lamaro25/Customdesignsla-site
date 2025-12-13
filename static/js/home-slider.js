document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     IMAGE LIST
  ========================== */
  const imageFiles = [
    "slider_01.jpg","slider_02.jpg","slider_03.jpg","slider_04.jpg",
    "slider_05.jpg","slider_06.jpg","slider_07.jpg","slider_08.jpg",
    "slider_09.jpg","slider_10.jpg","slider_11.jpg","slider_12.jpg",
    "slider_13.jpg","slider_14.jpg","slider_15.jpg","slider_16.jpg",
    "slider_17.jpg","slider_18.jpg","slider_19.jpg","slider_20.jpg",
    "slider_21.jpg","slider_22.jpg","slider_23.jpg","slider_24.jpg",
    "slider_25.jpg","slider_26.jpg","slider_27.jpg","slider_28.jpg"
  ];

  /* =========================
     DOM ELEMENTS
  ========================== */
  const slider = document.querySelector(".homepage-slider");
  const track = document.querySelector(".slider-track");

  if (!slider || !track) {
    console.warn("Slider elements not found");
    return;
  }

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

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= imageFiles.length) index = imageFiles.length - 1;

    currentIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  /* =========================
     TRUE SWIPE + DRAG
     (MOBILE + DESKTOP)
  ========================== */
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let hasMoved = false;
  const SWIPE_THRESHOLD = 60;

  function onStart(x) {
    startX = x;
    currentX = x;
    isDragging = true;
    hasMoved = false;
  }

  function onMove(x) {
    if (!isDragging) return;
    currentX = x;
    hasMoved = true;
  }

  function onEnd() {
    if (!isDragging || !hasMoved) {
      isDragging = false;
      return;
    }

    const diff = startX - currentX;

    if (diff > SWIPE_THRESHOLD) {
      goToSlide(currentIndex + 1);
    } else if (diff < -SWIPE_THRESHOLD) {
      goToSlide(currentIndex - 1);
    }

    isDragging = false;
  }

  /* ---- Touch Events ---- */
  slider.addEventListener("touchstart", e => {
    onStart(e.touches[0].clientX);
  }, { passive: true });

  slider.addEventListener("touchmove", e => {
    onMove(e.touches[0].clientX);
  }, { passive: true });

  slider.addEventListener("touchend", onEnd);
  slider.addEventListener("touchcancel", () => {
    isDragging = false;
  });

  /* ---- Mouse Events ---- */
  slider.addEventListener("mousedown", e => {
    e.preventDefault();
    onStart(e.clientX);
  });

  window.addEventListener("mousemove", e => {
    onMove(e.clientX);
  });

  window.addEventListener("mouseup", onEnd);

});
