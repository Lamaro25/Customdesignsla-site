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
     HARDEN SLIDER LAYOUT (PREVENT STACKING)
  ========================================================== */
  slider.style.overflow = "hidden";
  slider.style.position = "relative";

  track.style.display = "flex";
  track.style.flexDirection = "row";
  track.style.height = "100%";
  track.style.width = "100%";
  track.style.transition = "transform 0.45s ease";
  track.style.willChange = "transform";

  slider.style.cursor = "grab";
  slider.style.userSelect = "none";

  let currentIndex = 0;

  /* ==========================================================
     BUILD SLIDES
  ========================================================== */
  imageFiles.forEach((filename, idx) => {
    const slide = document.createElement("div");
    slide.className = "slider-slide";
    slide.style.flex = "0 0 100%";
    slide.style.height = "100%";
    slide.style.display = "flex";
    slide.style.alignItems = "center";
    slide.style.justifyContent = "center";

    const img = document.createElement("img");
    img.src = `/static/img/homepage-slider/${filename}`;
    img.alt = `Custom piece ${idx + 1}`;
    img.draggable = false;

    img.style.width = "auto";
    img.style.height = "100%";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";
    img.style.display = "block";

    slide.appendChild(img);
    track.appendChild(slide);
  });

  /* ==========================================================
     SLIDE CONTROL
  ========================================================== */
  function goToSlide(index) {
    if (index < 0) index = imageFiles.length - 1;
    if (index >= imageFiles.length) index = 0;

    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) =>
      dot.classList.toggle("active", i === currentIndex)
    );
  }

  /* ==========================================================
     ARROWS
  ========================================================== */
  const leftArrow = document.createElement("div");
  leftArrow.className = "slider-arrow left";

  const rightArrow = document.createElement("div");
  rightArrow.className = "slider-arrow right";

  slider.appendChild(leftArrow);
  slider.appendChild(rightArrow);

  leftArrow.addEventListener("click", () => goToSlide(currentIndex - 1));
  rightArrow.addEventListener("click", () => goToSlide(currentIndex + 1));

  /* ==========================================================
     DOTS
  ========================================================== */
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "slider-dots";

  const dots = imageFiles.map((_, index) => {
    const dot = document.createElement("div");
    dot.className = "slider-dot";
    if (index === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  slider.appendChild(dotsContainer);

  /* ==========================================================
     DRAG / SWIPE SUPPORT
  ========================================================== */
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
  }, { passive: true });

  slider.addEventListener("touchend", e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 60) goToSlide(currentIndex + 1);
    if (diff < -60) goToSlide(currentIndex - 1);
  });
});
