// "Threads": continuity of care drawn as threads that fray at the lockdown and are re-tied
// through knots, one per adaptation described in the paper. Used as the post banner
// ("story" mode, plays once) and as the blog card cover ("still" mode).
//
// Performance: the finished picture is drawn once to an offscreen canvas. After the story,
// each frame only copies that image and moves a handful of pulses along the threads, and the
// loop is cancelled whenever the canvas is off screen, the tab is hidden, or the reader
// prefers reduced motion.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const KNOTS = [
    { label: "WhatsApp prescription", note: "Prescriptions signed, photographed and sent over WhatsApp" },
    { label: "Public helpline", note: "A 24-hour line, open to the public and advertised by the government" },
    { label: "The call back", note: "A case worker calls back to take the detailed history" },
    { label: "Staff’s own phones", note: "Video calls between in-patients and their families" },
    { label: "Provisions", note: "Food for about 300 patients, gathered through various sources" },
  ];
  const BREAKS = [
    "Medication not stocked at the local pharmacy",
    "A pharmacist reluctant to dispense",
    "Fined at a police checkpoint on the way to SCARF",
    "Admissions stopped for a few months",
    "The vocational centre and day-care closed",
  ];

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
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);

  // Cubic Bezier sampled into points
  const bezier = (p0, p1, p2, p3, n, out) => {
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      out.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  };

  // Geometry in canvas pixels. Every thread is a polyline; `split` marks where the left
  // segment ends (the break), so the story can draw the halves at different times.
  const build = (width, height, seed) => {
    const random = makeRandom(seed);
    const compact = width < 560;
    const count = compact ? 26 : 44;
    const top = height * 0.14;
    const bottom = height * 0.86;
    const breakL = width * (compact ? 0.36 : 0.4);
    const breakR = width * (compact ? 0.64 : 0.6);
    const amp = height * 0.035;

    const knots = KNOTS.map((k, i) => ({
      ...k,
      x: breakL + (breakR - breakL) * (0.3 + random() * 0.4),
      y: top + ((bottom - top) * (i + 0.5)) / KNOTS.length + (random() - 0.5) * height * 0.06,
      threads: [],
    }));

    const threads = [];
    for (let i = 0; i < count; i++) {
      const y0 = top + ((bottom - top) * (i + 0.5)) / count + (random() - 0.5) * 4;
      const phase = random() * Math.PI * 2;
      const freq = (1.2 + random() * 1.2) / width;
      const pts = [];
      const steps = Math.ceil(breakL / 8);
      for (let s = 0; s <= steps; s++) {
        const x = (breakL * s) / steps;
        pts.push([x, y0 + amp * Math.sin(x * freq * Math.PI * 2 + phase)]);
      }
      const split = pts.length;
      const end = pts[pts.length - 1];
      // About a fifth of the threads are not re-tied: they fray at the break and stop.
      const frayed = random() < 0.2;
      const thread = { pts, split, frayed, fibres: [], knot: -1, reason: "" };
      if (frayed) {
        thread.reason = BREAKS[Math.floor(random() * BREAKS.length)];
        for (let f = 0; f < 3; f++) {
          const angle = (random() - 0.5) * 1.3;
          const len = 8 + random() * 16;
          thread.fibres.push([end[0], end[1], end[0] + Math.cos(angle) * len, end[1] + Math.sin(angle) * len]);
        }
        thread.end = end;
      } else {
        // Re-tie through the nearest knot (with a little randomness), then on to the right edge
        let best = 0;
        let bestD = Infinity;
        knots.forEach((k, ki) => {
          const d = Math.abs(k.y - end[1]) + random() * height * 0.12;
          if (d < bestD) {
            bestD = d;
            best = ki;
          }
        });
        const k = knots[best];
        thread.knot = best;
        k.threads.push(i);
        const y1 = y0 + (random() - 0.5) * height * 0.05;
        const right = [breakR, y1];
        bezier(end, [end[0] + (k.x - end[0]) * 0.6, end[1]], [k.x - (k.x - end[0]) * 0.4, k.y], [k.x, k.y], 14, pts);
        bezier([k.x, k.y], [k.x + (right[0] - k.x) * 0.4, k.y], [right[0] - (right[0] - k.x) * 0.6, right[1]], right, 14, pts);
        const steps2 = Math.ceil((width - breakR) / 8);
        for (let s = 1; s <= steps2; s++) {
          const x = breakR + ((width - breakR) * s) / steps2;
          // Offset the wave so it starts exactly at y1, with no kink where the curve joins it
          const wave = (xx) => Math.sin(xx * freq * Math.PI * 2 + phase + 1.3);
          pts.push([x, y1 + amp * (wave(x) - wave(breakR))]);
        }
      }
      threads.push(thread);
    }
    return { threads, knots, breakL, breakR };
  };

  const strokePart = (ctx, pts, from, to) => {
    // Draw points [from, to) with a fractional tail, so lines grow smoothly
    const a = Math.floor(from);
    const b = Math.min(to, pts.length - 1);
    if (b <= a) return;
    ctx.moveTo(pts[a][0], pts[a][1]);
    const whole = Math.floor(b);
    for (let i = a + 1; i <= whole; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    const frac = b - whole;
    if (frac > 0 && whole + 1 < pts.length) {
      const p = pts[whole];
      const q = pts[whole + 1];
      ctx.lineTo(p[0] + (q[0] - p[0]) * frac, p[1] + (q[1] - p[1]) * frac);
    }
  };

  const mount = (canvas) => {
    const host = canvas.parentElement;
    const mode = canvas.dataset.mode || "still";
    const seed = hashSeed(canvas.dataset.seed || "threads");
    const ctx = canvas.getContext("2d");
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");
    const tip = host.querySelector(".threads-tip");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let geo = null;
    let colors = null;
    let story = mode === "story" && !reduceMotion ? 0 : 1; // 0..1 progress of the story
    let storyStart = null;
    let frame = null;
    let hoverKnot = -1;
    let pointerInside = false;
    let pulses = [];
    let last = 0;
    const buttons = [];

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      colors = {
        accent: styles.getPropertyValue("--global-theme-color").trim() || "#50708f",
        muted: styles.getPropertyValue("--global-text-color-light").trim() || "#777",
      };
    };

    // Draw the scene at story progress p into ctx (0 = empty, 1 = finished)
    const drawScene = (c, p) => {
      c.clearRect(0, 0, width, height);
      const tLeft = ease(p / 0.3);
      const tFray = ease((p - 0.28) / 0.14);
      c.lineCap = "round";
      c.lineJoin = "round";
      // Knots appear one by one
      const knotIn = geo.knots.map((k, i) => ease((p - 0.42 - i * 0.055) / 0.08));

      geo.threads.forEach((th) => {
        const highlighted = hoverKnot >= 0 && th.knot === hoverKnot;
        const dim = hoverKnot >= 0 && !highlighted;
        // Left half
        c.beginPath();
        c.strokeStyle = colors.muted;
        c.globalAlpha = dim ? 0.12 : 0.32;
        c.lineWidth = 1;
        strokePart(c, th.pts, 0, tLeft * (th.split - 1));
        c.stroke();
        if (tLeft < 1) return;
        if (th.frayed) {
          c.beginPath();
          c.globalAlpha = (dim ? 0.12 : 0.32) * tFray;
          th.fibres.forEach(([x0, y0, x1, y1]) => {
            c.moveTo(x0, y0);
            c.lineTo(x0 + (x1 - x0) * tFray, y0 + (y1 - y0) * tFray);
          });
          c.stroke();
          return;
        }
        // Re-tied half, drawn once its knot has appeared
        const t = ease((p - 0.5 - th.knot * 0.055) / 0.38);
        if (t <= 0) return;
        c.beginPath();
        c.strokeStyle = colors.accent;
        c.globalAlpha = dim ? 0.15 : highlighted ? 0.95 : 0.55;
        c.lineWidth = highlighted ? 1.6 : 1.1;
        strokePart(c, th.pts, th.split - 1, th.split - 1 + t * (th.pts.length - th.split));
        c.stroke();
      });

      geo.knots.forEach((k, i) => {
        const s = knotIn[i];
        if (s <= 0) return;
        c.globalAlpha = 1;
        c.beginPath();
        c.fillStyle = colors.accent;
        c.arc(k.x, k.y, 3.6 * s, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.strokeStyle = colors.accent;
        c.lineWidth = 1;
        c.globalAlpha = (i === hoverKnot ? 0.9 : 0.4) * s;
        c.arc(k.x, k.y, (i === hoverKnot ? 11 : 8) * s, 0, Math.PI * 2);
        c.stroke();
      });
      c.globalAlpha = 1;
    };

    // Cache the finished picture; rebuilt only on resize, theme change or hover change
    const paintLayer = () => {
      layer.width = canvas.width;
      layer.height = canvas.height;
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(lctx, 1);
    };

    const resetPulses = () => {
      const random = makeRandom(seed + 11);
      const tied = geo.threads.filter((th) => !th.frayed);
      pulses = Array.from({ length: Math.min(10, tied.length) }, () => ({
        th: tied[Math.floor(random() * tied.length)],
        pos: random(),
        speed: 0.04 + random() * 0.05,
      }));
    };

    const drawPulses = (dt) => {
      ctx.fillStyle = colors.accent;
      pulses.forEach((pl) => {
        pl.pos += pl.speed * dt;
        if (pl.pos > 1) pl.pos -= 1;
        const pts = pl.th.pts;
        const f = pl.pos * (pts.length - 1);
        const i = Math.floor(f);
        const q = pts[Math.min(i + 1, pts.length - 1)];
        const x = pts[i][0] + (q[0] - pts[i][0]) * (f - i);
        const y = pts[i][1] + (q[1] - pts[i][1]) * (f - i);
        const fade = Math.sin(pl.pos * Math.PI);
        ctx.globalAlpha = 0.25 + 0.6 * fade;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const placeButtons = () => {
      buttons.forEach((b, i) => {
        b.style.left = `${geo.knots[i].x}px`;
        b.style.top = `${geo.knots[i].y}px`;
      });
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geo = build(width, height, seed);
      readColors();
      paintLayer();
      resetPulses();
      placeButtons();
    };

    const render = (dt) => {
      if (story < 1) {
        drawScene(ctx, story);
      } else {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(layer, 0, 0, width, height);
        if (!reduceMotion && (mode === "story" || pointerInside)) drawPulses(dt);
      }
    };

    // Checked directly rather than through IntersectionObserver: Distill re-lays out the
    // article after load, and an observer can report the banner as hidden and never update.
    const onScreen = () => {
      const r = host.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    };
    const wantsLoop = () => !reduceMotion && !document.hidden && onScreen() && (story < 1 || mode === "story" || pointerInside);

    const loop = (now) => {
      frame = requestAnimationFrame(loop);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      if (story >= 1 && now - last < 40) return; // pulses need only ~25 fps
      last = now;
      if (story < 1) {
        if (storyStart === null) storyStart = now;
        story = Math.min(1, (now - storyStart) / 6500);
        if (story >= 1) paintLayer();
      }
      render(dt);
      if (!wantsLoop()) stop();
    };
    const start = () => {
      if (frame === null && wantsLoop()) {
        last = 0;
        frame = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const setHover = (k) => {
      if (k === hoverKnot) return;
      hoverKnot = k;
      paintLayer();
      render(0);
    };

    const showTip = (html, x, y) => {
      if (!tip) return;
      tip.innerHTML = html;
      tip.hidden = false;
      const w = tip.offsetWidth;
      tip.style.left = `${clamp(x - w / 2, 4, width - w - 4)}px`;
      tip.style.top = `${y > height * 0.55 ? y - tip.offsetHeight - 16 : y + 16}px`;
    };
    const hideTip = () => tip && (tip.hidden = true);

    // Hover: knots within reach, or the frayed end nearest the pointer
    const probe = (x, y) => {
      if (story < 1) return;
      let knot = -1;
      geo.knots.forEach((k, i) => {
        if (Math.hypot(k.x - x, k.y - y) < 22) knot = i;
      });
      if (knot >= 0) {
        setHover(knot);
        const k = geo.knots[knot];
        showTip(`<strong>${k.label}</strong>${k.note}`, k.x, k.y);
        return;
      }
      setHover(-1);
      let best = null;
      let bestD = 20;
      geo.threads.forEach((th) => {
        if (!th.frayed) return;
        const d = Math.hypot(th.end[0] - x, th.end[1] - y);
        if (d < bestD) {
          bestD = d;
          best = th;
        }
      });
      if (best) showTip(`<strong>What broke</strong>${best.reason}`, best.end[0], best.end[1]);
      else hideTip();
    };

    if (mode === "story") {
      host.addEventListener("pointermove", (event) => {
        const r = canvas.getBoundingClientRect();
        probe(event.clientX - r.left, event.clientY - r.top);
      });
      host.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "mouse") return;
        setHover(-1);
        hideTip();
      });
      // Knots as real buttons, so they can be reached by keyboard and screen readers
      KNOTS.forEach((k, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "threads-knot";
        b.setAttribute("aria-label", `${k.label}: ${k.note}`);
        const show = () => {
          if (story < 1) return;
          setHover(i);
          showTip(`<strong>${k.label}</strong>${k.note}`, geo.knots[i].x, geo.knots[i].y);
        };
        b.addEventListener("focus", show);
        b.addEventListener("click", show);
        b.addEventListener("blur", () => {
          setHover(-1);
          hideTip();
        });
        host.appendChild(b);
        buttons.push(b);
      });
    } else {
      // Still mode (blog card): pulses only while the pointer is over the cover
      host.addEventListener("pointerenter", () => {
        pointerInside = true;
        start();
      });
      host.addEventListener("pointerleave", () => {
        pointerInside = false;
      });
    }

    resize();
    render(0);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        render(0);
      }, 150);
    });
    new MutationObserver(() => {
      readColors();
      paintLayer();
      render(0);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    // The loop stops itself when it is no longer wanted; these restart it
    document.addEventListener("visibilitychange", start);
    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", start);
    start();
  };

  document.querySelectorAll("canvas.threads-art").forEach(mount);
})();
