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

  /* 🔥 THIS IS THE FIX */
  track.style.width = `${imageFiles.length * 100}%`;

  let currentIndex = 0;
  slider.style.cursor = "grab";

  imageFiles.forEach((file, i) => {
    const slide = document.createElement("div");
    slide.className = "slider-slide";

    const img = document.createElement("img");
    img.src = `/static/img/homepage-slider/${file}`;
    img.alt = `Custom Designs LA ${i + 1}`;
    img.draggable = false;

    slide.appendChild(img);
    track.appendChild(slide);
  });

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, imageFiles.length - 1));
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  let startX = 0;
  let currentX = 0;
  let dragging = false;

  slider.addEventListener("mousedown", e => {
    startX = e.clientX;
    currentX = startX;
    dragging = true;
    slider.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    currentX = e.clientX;
  });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    slider.style.cursor = "grab";
    const diff = startX - currentX;
    if (diff > 60) goToSlide(currentIndex + 1);
    if (diff < -60) goToSlide(currentIndex - 1);
    dragging = false;
  });

  slider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    currentX = startX;
  });

  slider.addEventListener("touchend", e => {
    const diff = startX - currentX;
    if (diff > 60) goToSlide(currentIndex + 1);
    if (diff < -60) goToSlide(currentIndex - 1);
  });

});
