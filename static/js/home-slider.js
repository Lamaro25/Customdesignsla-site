/* ==========================================================
   Custom Designs LA — Responsive Multi-Image Slider
   Desktop: shows 3 images at a time
   Mobile: shows 1 image at a time
   Supports swipe, dots, and dynamic slide groups
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const track = document.querySelector(".slider-track");
  const dotsContainer = document.querySelector(".slider-dots");

  // Collect all images inside the slider
  const images = Array.from(track.querySelectorAll("img"));

  let groupSize = window.innerWidth <= 700 ? 1 : 3;      // 1 on mobile, 3 on desktop
  let currentIndex = 0;

  /* ----------------------------------------------------------
     Build slide groups dynamically (groups of 3 or 1)
  ---------------------------------------------------------- */
  const buildSlides = () => {
    const totalGroups = Math.ceil(images.length / groupSize);

    // Clear track & rebuild grouped slides
    track.innerHTML = "";
    dotsContainer.innerHTML = "";

    for (let i = 0; i < totalGroups; i++) {
      const group = document.createElement("div");
      group.classList.add("slide-group");
      group.style.display = "flex";
      group.style.width = "100%";

      const start = i * groupSize;
      const end = start + groupSize;

      images.slice(start, end).forEach(img => {
        const wrapper = document.createElement("div");
        wrapper.style.flex = `1`;
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "center";
        wrapper.style.alignItems = "center";
        wrapper.style.overflow = "hidden";

        // Force uniform sizing
        img.style.width = "100%";
        img.style.height = "350px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "12px";

        wrapper.appendChild(img);
        group.appendChild(wrapper);
      });

      track.appendChild(group);

      // Create corresponding dot
      const dot = document.createElement("span");
      dot.dataset.index = i;
      dotsContainer.appendChild(dot);
    }

    updateSlider(0);
  };

  /* ----------------------------------------------------------
     Move Slider
  ---------------------------------------------------------- */
  const updateSlider = (index) => {
    const slideWidth = track.clientWidth;
    track.style.transform = `translateX(${-index * slideWidth}px)`;

    const dots = dotsContainer.querySelectorAll("span");
    dots.forEach(dot => dot.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");

    currentIndex = index;
  };

  /* ----------------------------------------------------------
     Dot Navigation
  ---------------------------------------------------------- */
  dotsContainer.addEventListener("click", (e) => {
    if (e.target.tagName !== "SPAN") return;
    const dotIndex = Number(e.target.dataset.index);
    updateSlider(dotIndex);
  });

  /* ----------------------------------------------------------
     Swipe Navigation (Mobile)
  ---------------------------------------------------------- */
  let startX = 0;
  let isSwiping = false;

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  });

  track.addEventListener("touchend", (e) => {
    if (!isSwiping) return;
    isSwiping = false;

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    const totalGroups = dotsContainer.querySelectorAll("span").length;

    if (deltaX > 50 && currentIndex > 0) {
      updateSlider(currentIndex - 1);
    } else if (deltaX < -50 && currentIndex < totalGroups - 1) {
      updateSlider(currentIndex + 1);
    }
  });

  /* ----------------------------------------------------------
     Rebuild slider on resize (switch between 1 & 3 images)
  ---------------------------------------------------------- */
  window.addEventListener("resize", () => {
    const newSize = window.innerWidth <= 700 ? 1 : 3;
    if (newSize !== groupSize) {
      groupSize = newSize;
      buildSlides();
    }
  });

  /* ----------------------------------------------------------
     Initialize slider
  ---------------------------------------------------------- */
  buildSlides();
});
