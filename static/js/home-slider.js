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
     PREMIUM DRAG / SWIPE
     - Desktop drag works (pointer capture)
     - Mobile stops page-scroll during horizontal swipe
  ========================== */
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isDragging = false;
  let isHorizontal = null; // null until we decide if gesture is horizontal or vertical

  const SWIPE_THRESHOLD = 60;
  const AXIS_LOCK_THRESHOLD = 10; // pixels before deciding direction

  function onStart(x, y) {
    startX = x;
    startY = y;
    currentX = x;
    isDragging = true;
    isHorizontal = null;
  }

  function onMove(x, y) {
    if (!isDragging) return;

    const dx = x - startX;
    const dy = y - startY;

    // Decide gesture axis once the user moves a bit
    if (isHorizontal === null) {
      if (Math.abs(dx) > AXIS_LOCK_THRESHOLD || Math.abs(dy) > AXIS_LOCK_THRESHOLD) {
        isHorizontal = Math.abs(dx) > Math.abs(dy);
      } else {
        return;
      }
    }

    // If horizontal swipe, keep tracking X
    if (isHorizontal) {
      currentX = x;
    }
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;

    if (!isHorizontal) return;

    const diff = startX - currentX;

    if (diff > SWIPE_THRESHOLD) {
      goToSlide(currentIndex + 1);
    } else if (diff < -SWIPE_THRESHOLD) {
      goToSlide(currentIndex - 1);
    }
  }

  // --- Pointer Events (Desktop + modern mobile browsers) ---
  slider.addEventListener("pointerdown", (e) => {
    // Only primary button for mouse
    if (e.pointerType === "mouse" && e.button !== 0) return;

    slider.setPointerCapture(e.pointerId);
    onStart(e.clientX, e.clientY);
  });

  slider.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    onMove(e.clientX, e.clientY);

    // If we determined it's horizontal, prevent page scroll / drag behavior
    if (isHorizontal) {
      e.preventDefault();
    }
  }, { passive: false });

  slider.addEventListener("pointerup", (e) => {
    try { slider.releasePointerCapture(e.pointerId); } catch (_) {}
    onEnd();
  });

  slider.addEventListener("pointercancel", () => {
    isDragging = false;
    isHorizontal = null;
  });

});
