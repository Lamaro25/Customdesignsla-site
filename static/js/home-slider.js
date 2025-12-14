document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     IMAGE LIST (28 IMAGES)
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
    console.warn("Homepage slider not found");
    return;
  }

  slider.style.userSelect = "none";
  slider.style.cursor = "grab";

  let currentIndex = 0;

  /* =========================
     BUILD SLIDES (FIXED PATH)
  ========================== */
  imageFiles.forEach((filename, idx) => {
    const slide = document.createElement("div");
    slide.className = "slider-slide";

    const img = document.createElement("img");
    img.src = "/static/img/homepage-slider/" + filename;
    img.alt = "Custom Designs LA piece " + (idx + 1);
    img.draggable = false;

    slide.appendChild(img);
    track.appendChild(slide);
  });

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= imageFiles.length) index = imageFiles.length - 1;
    currentIndex = index;
    track.style.transform = "translateX(-" + (index * 100) + "%)";
  }

  /* =========================
     DRAG / SWIPE SUPPORT
  ========================== */
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const SWIPE_THRESHOLD = 60;

  function start(x) {
    startX = x;
    currentX = x;
    isDragging = true;
    slider.style.cursor = "grabbing";
  }

  function move(x) {
    if (!isDragging) return;
    currentX = x;
  }

  function end() {
    if (!isDragging) return;
    slider.style.cursor = "grab";

    const diff = startX - currentX;
    if (diff > SWIPE_THRESHOLD) goToSlide(currentIndex + 1);
    if (diff < -SWIPE_THRESHOLD) goToSlide(currentIndex - 1);

    isDragging = false;
  }

  /* TOUCH */
  slider.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
  slider.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
  slider.addEventListener("touchend", end);

  /* MOUSE */
  slider.addEventListener("mousedown", e => {
    e.preventDefault();
    start(e.clientX);
  });
  window.addEventListener("mousemove", e => move(e.clientX));
  window.addEventListener("mouseup", end);

});
