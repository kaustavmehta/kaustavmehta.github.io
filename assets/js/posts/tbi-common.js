// Shared helpers for the three-part TBI series. Exposes window.TBI.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cssVar = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();

  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

  // Calls back once the element scrolls into view (immediately under reduced motion).
  const onVisible = (el, callback, threshold = 0.3) => {
    if (!el) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.disconnect();
          }
        });
      },
      { threshold }
    );
    observer.observe(el);
  };

  // Calls back with true/false as the element enters and leaves the viewport, to pause animation loops.
  const watchVisibility = (el, callback) => {
    if (!el || !("IntersectionObserver" in window)) {
      callback(true);
      return;
    }
    new IntersectionObserver((entries) => entries.forEach((e) => callback(e.isIntersecting)), { threshold: 0 }).observe(el);
  };

  // Re-runs callback when the site's light/dark toggle changes.
  const onThemeChange = (callback) => {
    new MutationObserver(callback).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  };

  let tooltip = null;
  const getTooltip = () => {
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "tbi-tooltip";
      tooltip.setAttribute("role", "tooltip");
      document.body.appendChild(tooltip);
    }
    return tooltip;
  };

  // `at` is a pointer event or an element; the tooltip sits beside the point or below the element.
  const showTooltip = (html, at) => {
    const tip = getTooltip();
    tip.innerHTML = html;
    tip.classList.add("is-on");
    const pad = 12;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let x;
    let y;
    if (at && typeof at.clientX === "number") {
      x = at.clientX + pad;
      y = at.clientY + pad;
    } else if (at && at.getBoundingClientRect) {
      const r = at.getBoundingClientRect();
      x = r.left;
      y = r.bottom + 6;
    } else {
      x = pad;
      y = pad;
    }
    x = Math.min(x, window.innerWidth - w - pad);
    y = Math.min(y, window.innerHeight - h - pad);
    tip.style.left = `${Math.max(pad, x)}px`;
    tip.style.top = `${Math.max(pad, y)}px`;
  };
  const hideTooltip = () => {
    if (tooltip) tooltip.classList.remove("is-on");
  };

  // Sizes a canvas to its CSS box at device pixel ratio (capped) and returns a 2D context in CSS pixels.
  const fitCanvas = (canvas, maxDpr = 2) => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: rect.width, height: rect.height, dpr };
  };

  const revealAll = () => {
    document.querySelectorAll(".tbi-reveal").forEach((el) => onVisible(el, () => el.classList.add("is-visible"), 0.15));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", revealAll);
  else revealAll();

  window.TBI = { reduceMotion, cssVar, isDark, onVisible, watchVisibility, onThemeChange, showTooltip, hideTooltip, fitCanvas };
})();
