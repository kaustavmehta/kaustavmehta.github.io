// Blog index: a slowly drifting contour field behind the hero, and a cursor-following light on post cards.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Contour field: marching squares over a smooth, time-varying scalar field.
  const canvas = document.getElementById("blog-contours");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const cell = 14;
    const levels = [-1.6, -1.1, -0.6, -0.1, 0.4, 0.9, 1.4];
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let values = new Float32Array(0);
    let color = "";
    let visible = true;
    let frame = null;
    let last = 0;

    const field = (x, y, t) =>
      Math.sin(x * 0.0062 + t * 0.21) +
      Math.sin(y * 0.0081 - t * 0.17) +
      Math.sin((x + y) * 0.0043 + t * 0.12) +
      Math.cos(Math.hypot(x - width * 0.72, y - height * 0.35) * 0.0105 - t * 0.25);

    const readColor = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--global-theme-color").trim() || "#5a7a9a";
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;
      values = new Float32Array(cols * rows);
    };

    const lerp = (a, b, level) => (level - a) / (b - a);

    const draw = (t) => {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) values[j * cols + i] = field(i * cell, j * cell, t);
      }
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      levels.forEach((level, k) => {
        ctx.globalAlpha = k === 3 ? 0.42 : 0.2;
        ctx.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = values[j * cols + i];
            const b = values[j * cols + i + 1];
            const c = values[(j + 1) * cols + i + 1];
            const d = values[(j + 1) * cols + i];
            const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
            if (index === 0 || index === 15) continue;
            const x = i * cell;
            const y = j * cell;
            const top = [x + cell * lerp(a, b, level), y];
            const right = [x + cell, y + cell * lerp(b, c, level)];
            const bottom = [x + cell * lerp(d, c, level), y + cell];
            const left = [x, y + cell * lerp(a, d, level)];
            const segments = {
              1: [[left, bottom]],
              2: [[bottom, right]],
              3: [[left, right]],
              4: [[top, right]],
              5: [
                [left, top],
                [bottom, right],
              ],
              6: [[top, bottom]],
              7: [[left, top]],
              8: [[left, top]],
              9: [[top, bottom]],
              10: [
                [left, bottom],
                [top, right],
              ],
              11: [[top, right]],
              12: [[left, right]],
              13: [[bottom, right]],
              14: [[left, bottom]],
            }[index];
            segments.forEach(([p, q]) => {
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(q[0], q[1]);
            });
          }
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      frame = requestAnimationFrame(loop);
      if (!visible || now - last < 40) return;
      last = now;
      draw(now / 1000);
    };

    readColor();
    resize();
    draw(0);
    if (!reduceMotion) frame = requestAnimationFrame(loop);

    window.addEventListener("resize", () => {
      resize();
      draw(performance.now() / 1000);
    });
    new MutationObserver(() => {
      readColor();
      draw(performance.now() / 1000);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => entries.forEach((entry) => (visible = entry.isIntersecting))).observe(canvas);
    }
    document.addEventListener("visibilitychange", () => (visible = !document.hidden));
  }

  // Cursor-following light on post cards
  if (!reduceMotion) {
    document.querySelectorAll(".blog-entry-link").forEach((link) => {
      link.addEventListener("pointermove", (event) => {
        const rect = link.getBoundingClientRect();
        link.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        link.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }
})();
