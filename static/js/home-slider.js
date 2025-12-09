document.addEventListener("DOMContentLoaded", () => {

  // ---- 1. LIST OF IMAGES ----
  const imageFiles = [
    "IMG_0816.jpg",
    "IMG_0817.jpg",
    "Photoroom_000_20250116_153758.JPG",
    "Photoroom_000_20250306_160221.JPG",
    "Photoroom_000_20250424_164308.JPEG",
    "Photoroom_001_20240816_174919 2.JPG",
    "Photoroom_001_20250116_153758.JPG",
    "Photoroom_003_20250216_210022.JPG",
    "Photoroom_006_20240816_142521 2.JPG",
    "Photoroom_007_20240816_142521 2.JPG"
  ];

  const IMAGES_PER_SLIDE = 4;

  const track = document.querySelector(".slider-track");
  const dotsContainer = document.querySelector(".slider-dots");

  // ---- 2. GROUP IMAGES INTO SLIDES OF 4 ----
  const slides = [];
  for (let i = 0; i < imageFiles.length; i += IMAGES_PER_SLIDE) {
    slides.push(imageFiles.slice(i, i + IMAGES_PER_SLIDE));
  }

  // ---- 3. BUILD SLIDER HTML ----
  slides.forEach(group => {
    const slideDiv = document.createElement("div");
    slideDiv.classList.add("slide");

    group.forEach(filename => {
      const img = document.createElement("img");
      img.src = `/static/img/homepage-slider/${filename}`;
      slideDiv.appendChild(img);
    });

    track.appendChild(slideDiv);
  });

  // ---- 4. CREATE DOTS ----
  slides.forEach((_, idx) => {
    const dot = document.createElement("span");
    dot.dataset.index = idx;
    if (idx === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".slider-dots span");

  let currentIndex = 0;

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach(dot => dot.classList.remove("active"));
    dots[currentIndex].classList.add("active");
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      currentIndex = Number(dot.dataset.index);
      updateSlider();
    });
  });

  updateSlider();
});
