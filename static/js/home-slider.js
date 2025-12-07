/* ==========================================================
   Custom Design’s LA — Homepage Slider Script
   Handles:
   • Swipe left/right on mobile
   • Clickable dots
   • Smooth slide transitions
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const track = document.querySelector(".slider-track");
  const slides = Array.from(track.children);
  const dots = Array.from(document.querySelectorAll(".slider-dots span"));

  let currentIndex = 0;
  let startX = 0;
  let isSwiping = false;

  const updateSlider = (index) => {
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;

    dots.forEach(dot => dot.classList.remove("active"));
    dots[index].classList.add("active");
  };

  /* ---- Dot Navigation ---- */
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentIndex = index;
      updateSlider(currentIndex);
    });
  });

  /* ---- Touch Events (Mobile Swipe) ---- */
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  });

  track.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - startX;

    // Optional: Add slight drag effect (visual only)
    track.style.transform = `translateX(calc(${-currentIndex * 100}% + ${deltaX}px))`;
  });

  track.addEventListener("touchend", (e) => {
    isSwiping = false;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    // Swipe threshold
    if (deltaX > 50 && currentIndex > 0) {
      currentIndex--;
    } else if (deltaX < -50 && currentIndex < slides.length - 1) {
      currentIndex++;
    }

    updateSlider(currentIndex);
  });

  /* ---- Initialize ---- */
  updateSlider(0);
});
<script src="/static/js/home-slider.js"></script>
