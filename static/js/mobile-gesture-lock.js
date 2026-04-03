(function lockMobileGestures() {
  if (window.__cdlaGestureLockInstalled) return;
  window.__cdlaGestureLockInstalled = true;

  const LOCKED_VIEWPORT = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  const DOUBLE_TAP_DELAY_MS = 320;
  const DOUBLE_TAP_DISTANCE_PX = 24;
  const ACTIVE_CAPTURE = { passive: false, capture: true };
  const PASSIVE_CAPTURE = { passive: true, capture: true };

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
      window.scrollTo({ left: 0, top: window.scrollY || 0, behavior: "auto" });

      if (document.documentElement) {
        document.documentElement.scrollLeft = 0;
      }

      if (document.body) {
        document.body.scrollLeft = 0;
      }

      resetScheduled = false;
    });
  };

  const blockGesture = event => {
    preventDefaultIfPossible(event);
  };

  ensureLockedViewportMeta();

  document.addEventListener("gesturestart", blockGesture, ACTIVE_CAPTURE);
  document.addEventListener("gesturechange", blockGesture, ACTIVE_CAPTURE);
  document.addEventListener("gestureend", blockGesture, ACTIVE_CAPTURE);
  document.addEventListener("dblclick", blockGesture, ACTIVE_CAPTURE);

  document.addEventListener(
    "wheel",
    event => {
      if (event.ctrlKey || event.metaKey) {
        preventDefaultIfPossible(event);
      }
    },
    ACTIVE_CAPTURE
  );

  let lastTapTimestamp = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  document.addEventListener(
    "touchstart",
    event => {
      if (event.touches && event.touches.length > 1) {
        preventDefaultIfPossible(event);
      }

      enforceNoHorizontalDrift();
    },
    ACTIVE_CAPTURE
  );

  document.addEventListener(
    "touchmove",
    event => {
      if (event.touches && event.touches.length > 1) {
        preventDefaultIfPossible(event);
      }

      enforceNoHorizontalDrift();
    },
    ACTIVE_CAPTURE
  );

  document.addEventListener(
    "touchend",
    event => {
      if (event.changedTouches && event.changedTouches.length === 1 && (!event.touches || event.touches.length === 0)) {
        const touch = event.changedTouches[0];
        const now = Date.now();
        const elapsedMs = now - lastTapTimestamp;
        const isQuickSecondTap = elapsedMs > 0 && elapsedMs < DOUBLE_TAP_DELAY_MS;
        const isNearLastTap =
          Math.abs(touch.clientX - lastTapX) < DOUBLE_TAP_DISTANCE_PX
          && Math.abs(touch.clientY - lastTapY) < DOUBLE_TAP_DISTANCE_PX;

        if (isQuickSecondTap && isNearLastTap) {
          preventDefaultIfPossible(event);
          lastTapTimestamp = 0;
          enforceNoHorizontalDrift();
          return;
        }

        lastTapTimestamp = now;
        lastTapX = touch.clientX;
        lastTapY = touch.clientY;
      }

      enforceNoHorizontalDrift();
    },
    ACTIVE_CAPTURE
  );

  document.addEventListener("touchcancel", enforceNoHorizontalDrift, PASSIVE_CAPTURE);

  window.addEventListener("scroll", enforceNoHorizontalDrift, PASSIVE_CAPTURE);
  window.addEventListener("resize", () => {
    ensureLockedViewportMeta();
    enforceNoHorizontalDrift();
  }, PASSIVE_CAPTURE);
  window.addEventListener("orientationchange", () => {
    ensureLockedViewportMeta();
    enforceNoHorizontalDrift();
  }, PASSIVE_CAPTURE);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      ensureLockedViewportMeta();
      enforceNoHorizontalDrift();
    }, PASSIVE_CAPTURE);
    window.visualViewport.addEventListener("scroll", enforceNoHorizontalDrift, PASSIVE_CAPTURE);
  }

  ensureLockedViewportMeta();
  enforceNoHorizontalDrift();
})();
