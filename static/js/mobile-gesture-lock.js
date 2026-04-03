(function lockMobileGestures() {
  if (window.__cdlaGestureLockInstalled) return;
  window.__cdlaGestureLockInstalled = true;

  const blockGesture = event => {
    event.preventDefault();
  };

  document.addEventListener("gesturestart", blockGesture, { passive: false });
  document.addEventListener("gesturechange", blockGesture, { passive: false });
  document.addEventListener("gestureend", blockGesture, { passive: false });

  document.addEventListener(
    "touchmove",
    event => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  let lastTapTimestamp = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  const DOUBLE_TAP_DELAY_MS = 320;
  const DOUBLE_TAP_DISTANCE_PX = 24;

  document.addEventListener(
    "touchend",
    event => {
      if (!event.changedTouches || event.changedTouches.length !== 1) return;
      if (event.touches && event.touches.length > 0) return;

      const touch = event.changedTouches[0];
      const now = Date.now();
      const elapsedMs = now - lastTapTimestamp;
      const isQuickSecondTap = elapsedMs > 0 && elapsedMs < DOUBLE_TAP_DELAY_MS;
      const isNearLastTap =
        Math.abs(touch.clientX - lastTapX) < DOUBLE_TAP_DISTANCE_PX &&
        Math.abs(touch.clientY - lastTapY) < DOUBLE_TAP_DISTANCE_PX;

      if (isQuickSecondTap && isNearLastTap) {
        event.preventDefault();
        lastTapTimestamp = 0;
        return;
      }

      lastTapTimestamp = now;
      lastTapX = touch.clientX;
      lastTapY = touch.clientY;
    },
    { passive: false }
  );

  document.addEventListener(
    "dblclick",
    event => {
      event.preventDefault();
    },
    { passive: false }
  );

  const isMobileLikeViewport = () => {
    const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    return coarsePointer || window.innerWidth <= 1024;
  };

  let resetScheduled = false;
  const enforceNoHorizontalDrift = () => {
    if (!isMobileLikeViewport()) return;
    if (window.scrollX === 0) return;
    if (resetScheduled) return;

    resetScheduled = true;
    window.requestAnimationFrame(() => {
      window.scrollTo(0, window.scrollY || 0);
      if (document.documentElement) {
        document.documentElement.scrollLeft = 0;
      }
      if (document.body) {
        document.body.scrollLeft = 0;
      }
      resetScheduled = false;
    });
  };

  window.addEventListener("scroll", enforceNoHorizontalDrift, { passive: true });
  window.addEventListener("orientationchange", enforceNoHorizontalDrift, { passive: true });
  window.addEventListener("resize", enforceNoHorizontalDrift, { passive: true });
  document.addEventListener("touchend", enforceNoHorizontalDrift, { passive: true });
})();
