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

  // Cover art: the post's dot grid laid over seeded flow lines. The dots sway along the
  // same flow field, part around the cursor, and the lit ones sweep on when revealed.
  const hashSeed = (text) => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return h >>> 0;
  };

  const makeRandom = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  document.querySelectorAll(".cover-art").forEach((canvas) => {
    const cover = canvas.closest(".blog-cover");
    const entry = canvas.closest(".blog-entry");
    const ctx = canvas.getContext("2d");
    const cols = Number(canvas.dataset.cols);
    const rows = Number(canvas.dataset.rows);
    const litTotal = Number(canvas.dataset.lit);
    const random = makeRandom(hashSeed(cover.dataset.seed || ""));

    // A seeded flow field: a few random sine waves give each post its own pattern.
    const waves = Array.from({ length: 4 }, () => ({
      fx: 0.4 + random() * 2.2,
      fy: 0.4 + random() * 2.2,
      phase: random() * Math.PI * 2,
      weight: 0.5 + random(),
    }));
    const angleAt = (u, v, t = 0) =>
      waves.reduce((sum, w) => sum + w.weight * Math.sin(u * w.fx * Math.PI + v * w.fy * Math.PI + w.phase + t * 0.15), 0);

    let width = 0;
    let height = 0;
    let gridX = 0;
    let gridY = 0;
    let gridW = 0;
    let gridH = 0;
    let lines = null;
    let accent = "";
    let muted = "";
    let pointer = null;
    let litShown = reduceMotion ? litTotal : 0;
    let visible = true;
    let last = 0;

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      accent = styles.getPropertyValue("--global-theme-color").trim() || "#5a7a9a";
      muted = styles.getPropertyValue("--global-text-color-light").trim() || "#777";
    };

    // Flow lines are drawn once per size or theme change onto an offscreen canvas.
    const drawLines = (dpr) => {
      lines = document.createElement("canvas");
      lines.width = canvas.width;
      lines.height = canvas.height;
      const lctx = lines.getContext("2d");
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.strokeStyle = accent;
      lctx.lineCap = "round";
      const lineRandom = makeRandom(hashSeed(cover.dataset.seed || "") + 7);
      for (let n = 0; n < 90; n++) {
        let x = lineRandom() * width;
        let y = lineRandom() * height;
        lctx.globalAlpha = 0.05 + lineRandom() * 0.16;
        lctx.lineWidth = 0.6 + lineRandom() * 1.1;
        lctx.beginPath();
        lctx.moveTo(x, y);
        for (let step = 0; step < 70; step++) {
          const a = angleAt(x / width, y / height);
          x += Math.cos(a) * 3;
          y += Math.sin(a) * 3;
          if (x < -10 || y < -10 || x > width + 10 || y > height + 10) break;
          lctx.lineTo(x, y);
        }
        lctx.stroke();
      }
    };

    const resize = () => {
      const rect = cover.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const caption = cover.querySelector(".cover-caption");
      const pad = Math.min(28, width * 0.07);
      const bottom = caption ? height - caption.offsetTop + 14 : pad;
      gridX = pad;
      gridY = pad;
      gridW = width - pad * 2;
      gridH = height - pad - bottom;
      readColors();
      drawLines(dpr);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(lines, 0, 0, width, height);
      const pitchX = gridW / cols;
      const pitchY = gridH / rows;
      const radius = Math.max(0.7, Math.min(pitchX, pitchY) * 0.3);
      const sway = reduceMotion ? 0 : Math.min(pitchX, pitchY) * 0.55;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const u = c / cols;
          const v = r / rows;
          const a = angleAt(u, v, t);
          let x = gridX + (c + 0.5) * pitchX + Math.cos(a) * sway;
          let y = gridY + (r + 0.5) * pitchY + Math.sin(a) * sway;
          if (pointer) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < 70 && d > 0.01) {
              const push = (1 - d / 70) ** 2 * 14;
              x += (dx / d) * push;
              y += (dy / d) * push;
            }
          }
          // Lit dots fill the first rows column by column, so the sweep reads left to right.
          const litIndex = c * 3 + r;
          const lit = r < 3 && litIndex < litShown;
          ctx.fillStyle = lit ? accent : muted;
          ctx.globalAlpha = lit ? 1 : 0.34 - v * 0.22;
          ctx.beginPath();
          ctx.arc(x, y, lit ? radius * 1.25 : radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!visible || now - last < 33) return;
      last = now;
      draw(now / 1000);
    };

    cover.classList.add("has-art");
    resize();
    draw(0);

    if (!reduceMotion) {
      requestAnimationFrame(loop);
      const sweep = () => {
        const start = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - start) / 1600);
          litShown = Math.round((1 - Math.pow(1 - k, 3)) * litTotal);
          if (k < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 500);
      };
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              visible = e.isIntersecting;
              if (e.isIntersecting && litShown === 0) sweep();
            }),
          { threshold: 0.25 }
        );
        observer.observe(entry || cover);
      } else {
        litShown = litTotal;
      }
      cover.addEventListener("pointermove", (event) => {
        const rect = cover.getBoundingClientRect();
        pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      });
      cover.addEventListener("pointerleave", () => (pointer = null));
    }

    window.addEventListener("resize", () => {
      resize();
      draw(performance.now() / 1000);
    });
    new MutationObserver(() => {
      resize();
      draw(performance.now() / 1000);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  });

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
