document.addEventListener("DOMContentLoaded", () => {

  // ---- 1. LIST OF IMAGES ----
  const imageFiles = [
    "slider_01.jpg",
    "slider_02.jpg",
    "slider_03.jpg",
    "slider_04.jpg",
    "slider_05.jpg",
    "slider_06.jpg",
    "slider_07.jpg",
    "slider_08.jpg",
    "slider_09.jpg",
    "slider_10.jpg",
    "slider_11.jpg",
    "slider_12.jpg",
    "slider_13.jpg",
    "slider_14.jpg",
    "slider_15.jpg",
    "slider_16.jpg",
    "slider_17.jpg",
    "slider_18.jpg",
    "slider_19.jpg",
    "slider_20.jpg",
    "slider_21.jpg",
    "slider_22.jpg",
    "slider_23.jpg",
    "slider_24.jpg",
    "slider_25.jpg",
    "slider_26.jpg",
    "slider_27.jpg",
    "slider_28.jpg"
  ];

  const track = document.querySelector(".slider-track");
  const dotsContainer = document.querySelector(".slider-dots");

  // Build slides: ONE IMAGE PER SLIDE (mobile + desktop compatible)
  imageFiles.forEach(filename => {
    const slideDiv = document.createElement("div");
    slideDiv.classList.add("slider-slide");

    const img = document.createElement("img");
    img.src = `/static/img/homepage-slider/${filename}`;

    slideDiv.appendChild(img);
    track.appendChild(slideDiv);
  });

  // ---- DOTS ----
  imageFiles.forEach((_, idx) => {
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
