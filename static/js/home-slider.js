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

  const track = document.querySelector(".slider-track");
  const dotsContainer = document.querySelector(".slider-dots");

  if (!track || !dotsContainer) {
    console.warn("Slider elements not found");
    return;
  }

  let currentIndex = 0;

  /* =========================
     BUILD SLIDES + DOTS
  ========================== */
  imageFiles.forEach((filename, idx) => {
    // Slide
    const slide = document.createElement("div");
    slide.className = "slider-slide";

    const img = document.createElement("img");
    img.src = `/static/img/homepage-slider/${filename}`;
    img.alt = `Custom piece ${idx + 1}`;

    slide.appendChild(img);
    track.appendChild(slide);

    // Dot
    const dot = document.createElement("span");
    if (idx === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  /* =========================
     SLIDE CONTROL
  ========================== */
  function goToSlide(index) {
    if (index < 0 || index >= imageFiles.length) return;

    currentIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[index].classList.add("active");
  }

  /* =========================
     SWIPE SUPPORT
  ========================== */
  let startX = 0;
  let isDragging = false;

  track.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener("touchend", e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    handleSwipe(diff);
    isDragging = false;
  });

  track.addEventListener("mousedown", e => {
    startX = e.clientX;
    isDragging = true;
  });

  window.addEventListener("mouseup", e => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    handleSwipe(diff);
    isDragging = false;
  });

  function handleSwipe(diff) {
    if (diff > 50 && currentIndex < imageFiles.length - 1) {
      goToSlide(currentIndex + 1);
    }
    if (diff < -50 && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

});
