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

  if (!slider || !track) return;

  /* ==========================================================
     HARDEN SLIDER LAYOUT (prevents CSS from stacking images)
     Only affects the slider elements.
  ========================================================== */
  slider.style.overflow = "hidden";
  slider.style.position = "relative";

  track.style.display = "flex";
  track.style.flexDirection = "row";
  track.style.height = "100%";
  track.style.width = "100%";
  track.style.transition = "transform 0.4s ease";
  track.style.willChange = "transform";

  slider.style.cursor = "grab";
  slider.style.userSelect = "none";

  let currentIndex = 0;

  imageFiles.forEach((filename, idx) => {
    const slide = document.createElement("div");
    slide.className = "slider-slide";

    /* Force each slide to be 1 viewport wide so it cannot stack */
    slide.style.flex = "0 0 100%";
    slide.style.height = "100%";
    slide.style.display = "flex";
    slide.style.alignItems = "center";
    slide.style.justifyContent = "center";

    const img = document.createElement("img");
    img.src = `/static/img/homepage-slider/${filename}`; // ✅ FIXED
    img.alt = `Custom piece ${idx + 1}`;
    img.draggable = false;

    /* Prevent global image CSS from breaking slider */
    img.style.width = "auto";
    img.style.height = "100%";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";
    img.style.display = "block";

    slide.appendChild(img);
    track.appendChild(slide);
  });

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, imageFiles.length - 1));
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

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
