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

  // HARD STOP browser drag/selection (DESKTOP FIX)
  slider.style.userSelect = "none";
  slider.style.webkitUserSelect = "none";
  slider.style.msUserSelect = "none";
  slider.style.cursor = "grab";

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
    img.style.pointerEvents = "none"; // critical for desktop drag

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
     UNIVERSAL DRAG / SWIPE
     (DESKTOP + MOBILE)
  ========================== */
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;
  let lockAxis = null; // "x" | "y"

  const SWIPE_THRESHOLD = 60;
  const AXIS_LOCK_THRESHOLD = 12;

  function start(x, y) {
    startX = x;
    startY = y;
    currentX = x;
    currentY = y;
    isDragging = true;
    lockAxis = null;
    slider.style.cursor = "grabbing";
  }

  function move(x, y) {
    if (!isDragging) return;

    const dx = x - startX;
    const dy = y - startY;

    if (!lockAxis) {
      if (Math.abs(dx) > AXIS_LOCK_THRESHOLD || Math.abs(dy) > AXIS_LOCK_THRESHOLD) {
        lockAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      } else {
        return;
      }
    }

    if (lockAxis === "x") {
      currentX = x;
    }
  }

  function end() {
    if (!isDragging) return;

    slider.style.cursor = "grab";

    if (lockAxis === "x") {
      const diff = startX - currentX;

      if (diff > SWIPE_THRESHOLD) {
        goToSlide(currentIndex + 1);
      } else if (diff < -SWIPE_THRESHOLD) {
        goToSlide(currentIndex - 1);
      }
    }

    isDragging = false;
    lockAxis = null;
  }

  /* ---------- TOUCH (MOBILE) ---------- */
  slider.addEventListener("touchstart", e => {
    start(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  slider.addEventListener("touchmove", e => {
    move(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  slider.addEventListener("touchend", end);
  slider.addEventListener("touchcancel", end);

  /* ---------- MOUSE (DESKTOP) ---------- */
  slider.addEventListener("mousedown", e => {
    e.preventDefault(); // REQUIRED for desktop
    start(e.clientX, e.clientY);
  });

  window.addEventListener("mousemove", e => {
    move(e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", end);

});
