(function lockMobileGestures() {
  if (window.__cdlaGestureLockInstalled) return;
  window.__cdlaGestureLockInstalled = true;

  const LOCKED_VIEWPORT = "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  const DOUBLE_TAP_DELAY_MS = 320;
  const DOUBLE_TAP_DISTANCE_PX = 24;

  const ensureLockedViewportMeta = () => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.setAttribute("name", "viewport");
      document.head.appendChild(viewportMeta);
    }

    if (viewportMeta.getAttribute("content") !== LOCKED_VIEWPORT) {
      viewportMeta.setAttribute("content", LOCKED_VIEWPORT);
    }
  };

  const preventDefaultIfPossible = event => {
    if (event && event.cancelable) {
      event.preventDefault();
    }
  };

  ensureLockedViewportMeta();

  const blockGesture = event => {
    preventDefaultIfPossible(event);
  };

  document.addEventListener("gesturestart", blockGesture, { passive: false, capture: true });
  document.addEventListener("gesturechange", blockGesture, { passive: false, capture: true });
  document.addEventListener("gestureend", blockGesture, { passive: false, capture: true });

  document.addEventListener(
    "touchstart",
    event => {
      if (event.touches && event.touches.length > 1) {
        preventDefaultIfPossible(event);
      }
    },
    { passive: false, capture: true }
  );

  document.addEventListener(
    "touchmove",
    event => {
      if (event.touches && event.touches.length > 1) {
        preventDefaultIfPossible(event);
      }
    },
    { passive: false, capture: true }
  );

  let lastTapTimestamp = 0;
  let lastTapX = 0;
  let lastTapY = 0;

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
        preventDefaultIfPossible(event);
        lastTapTimestamp = 0;
        return;
      }

      lastTapTimestamp = now;
      lastTapX = touch.clientX;
      lastTapY = touch.clientY;
    },
    { passive: false, capture: true }
  );

  document.addEventListener("dblclick", blockGesture, { passive: false, capture: true });

  document.addEventListener(
    "wheel",
    event => {
      if (event.ctrlKey || event.metaKey) {
        preventDefaultIfPossible(event);
      }
    },
    { passive: false, capture: true }
  );

  const isMobileLikeViewport = () => {
    const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    return coarsePointer || window.innerWidth <= 1024;
  };

  let resetScheduled = false;
  const enforceNoHorizontalDrift = () => {
    if (!isMobileLikeViewport()) return;

    const hasHorizontalOffset = window.scrollX !== 0
      || (document.documentElement && document.documentElement.scrollLeft !== 0)
      || (document.body && document.body.scrollLeft !== 0);

    if (!hasHorizontalOffset || resetScheduled) return;

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
  window.addEventListener("resize", enforceNoHorizontalDrift, { passive: true });
  window.addEventListener("orientationchange", enforceNoHorizontalDrift, { passive: true });
  document.addEventListener("touchstart", enforceNoHorizontalDrift, { passive: true });
  document.addEventListener("touchmove", enforceNoHorizontalDrift, { passive: true });
  document.addEventListener("touchend", enforceNoHorizontalDrift, { passive: true });

  ensureLockedViewportMeta();
  enforceNoHorizontalDrift();
})();
