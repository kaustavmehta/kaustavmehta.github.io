// Interactive figures for "The quiet injury" (TBI series, part 1). Needs tbi-common.js (window.TBI).
(function () {
  const T = window.TBI;
  if (!T) return;
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const RM = T.reduceMotion;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const fmt = (n) => n.toLocaleString("en-GB");

  const svgEl = (tag, attrs = {}, parent = null, text = null) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) el.setAttribute(k, v);
    if (text !== null) el.textContent = text;
    if (parent) parent.appendChild(el);
    return el;
  };
  const clear = (el) => {
    while (el.firstChild) el.removeChild(el.firstChild);
  };
  const isNarrow = (el) => (el.getBoundingClientRect().width || 640) < 560;

  // Hover with a mouse, tap on touch, focus with a keyboard: all show the same tooltip.
  const bindTip = (el, html) => {
    el.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && T.showTooltip(html(), e));
    el.addEventListener("pointermove", (e) => e.pointerType === "mouse" && T.showTooltip(html(), e));
    el.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && T.hideTooltip());
    el.addEventListener("pointerup", (e) => e.pointerType !== "mouse" && T.showTooltip(html(), el));
    el.addEventListener("focus", () => T.showTooltip(html(), el));
    el.addEventListener("blur", () => T.hideTooltip());
  };
  document.addEventListener("scroll", () => T.hideTooltip(), { passive: true });

  // Rebuilds an SVG when its container crosses the narrow/wide threshold.
  const onResize = (el, fn) => {
    let narrow = isNarrow(el);
    let timer = null;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const n = isNarrow(el);
        if (n !== narrow) {
          narrow = n;
          fn();
        }
      }, 150);
    });
  };

  // A tiny animation runner that only ticks while needed and while the element is on screen.
  const loop = (el, step) => {
    let visible = false;
    let running = false;
    let last = 0;
    const frame = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const keep = step(dt);
      if (keep && visible) requestAnimationFrame(frame);
      else running = false;
    };
    const api = {
      wake() {
        if (running || !visible) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      },
    };
    T.watchVisibility(el, (v) => {
      visible = v;
      if (v) api.wake();
    });
    return api;
  };

  /* ---------------------------------------------------------------- counter under the lede */
  (() => {
    const num = $("tbi1-since-num");
    if (!num) return;
    const perSecond = 27.08e6 / (365 * 86400);
    const t0 = performance.now();
    const tick = () => {
      if (document.hidden) return;
      num.textContent = fmt(Math.floor(((performance.now() - t0) / 1000) * perSecond));
    };
    tick();
    setInterval(tick, 500);
  })();

  /* ---------------------------------------------------------------- incidence unit chart */
  (() => {
    const canvas = $("tbi1-incidence");
    if (!canvas) return;
    const EST = {
      gbd: {
        lo: 243,
        hi: 303,
        num: "27.1M",
        note: "Global Burden of Disease, 2016: 27.08 million new cases, with a 95% uncertainty interval of 24.3 to 30.3 million. Built from hospital and registry data, so it misses much mild injury.",
      },
      lancet: {
        lo: 500,
        hi: 600,
        num: "50–60M",
        note: "Lancet Neurology Commission: 50 to 60 million people a year, about twice the GBD figure. The Commission itself flags the discrepancy.",
      },
      dewan: {
        lo: 640,
        hi: 740,
        num: "69M",
        note: "Dewan et al.: 69 million a year (95% CI 64 to 74 million), and nearly three times more cases, proportionally, in low- and middle-income countries than in high-income ones.",
      },
    };
    const MAX = 740;
    const dots = Array.from({ length: MAX }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      a: 0,
      tx: 0,
      ty: 0,
      ta: 0,
      delay: Math.random() * 0.6,
      severe: i % 10 === 9,
    }));
    let w = 0;
    let h = 0;
    let ctx = null;
    let current = "gbd";
    let started = false;
    let clock = 0;
    const layout = () => {
      const fit = T.fitCanvas(canvas);
      ctx = fit.ctx;
      w = fit.width;
      h = fit.height;
      const cols = Math.ceil(Math.sqrt((MAX * w) / h));
      const rows = Math.ceil(MAX / cols);
      const cell = Math.min(w / cols, h / rows);
      const ox = (w - cols * cell) / 2;
      const oy = (h - rows * cell) / 2;
      dots.forEach((d, i) => {
        d.tx = (ox + ((i % cols) + 0.5) * cell) / w;
        d.ty = (oy + (Math.floor(i / cols) + 0.5) * cell) / h;
        d.cell = cell;
      });
    };
    const target = () => {
      const e = EST[current];
      dots.forEach((d, i) => (d.ta = i < e.lo ? 1 : i < e.hi ? 0.5 : 0));
    };
    const draw = () => {
      const accent = T.cssVar("--global-theme-color");
      const injury = T.cssVar("--tbi-injury");
      const ink = T.cssVar("--global-text-color-light");
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        if (d.a < 0.01) return;
        const r = Math.max(1.2, d.cell * 0.34);
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, r, 0, Math.PI * 2);
        if (d.a > 0.75) {
          ctx.globalAlpha = Math.min(1, d.a);
          ctx.fillStyle = d.severe ? injury : accent;
          ctx.fill();
        } else {
          ctx.globalAlpha = Math.min(1, d.a * 1.6);
          ctx.strokeStyle = d.severe ? injury : ink;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    };
    const anim = loop(canvas, (dt) => {
      clock += dt;
      let moving = false;
      dots.forEach((d) => {
        if (clock < d.delay) {
          moving = true;
          return;
        }
        const k = 1 - Math.pow(0.002, dt);
        d.x += (d.tx - d.x) * k;
        d.y += (d.ty - d.y) * k;
        d.a += (d.ta - d.a) * k;
        if (Math.abs(d.tx - d.x) + Math.abs(d.ty - d.y) + Math.abs(d.ta - d.a) > 0.002) moving = true;
      });
      draw();
      return moving;
    });
    const settle = () => {
      dots.forEach((d) => {
        d.x = d.tx;
        d.y = d.ty;
        d.a = d.ta;
      });
      draw();
    };
    const select = (key) => {
      current = key;
      $("tbi1-inc-num").textContent = EST[key].num;
      $("tbi1-inc-note").textContent = EST[key].note;
      document.querySelectorAll("#tbi1-inc-btns .tbi-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.est === key)));
      target();
      if (!started) return;
      if (RM) settle();
      else {
        clock = 1;
        anim.wake();
      }
    };
    document.querySelectorAll("#tbi1-inc-btns .tbi-btn").forEach((b) => b.addEventListener("click", () => select(b.dataset.est)));
    layout();
    select("gbd");
    draw();
    T.onVisible(canvas, () => {
      started = true;
      if (RM) settle();
      else anim.wake();
    });
    let rt = null;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        layout();
        settle();
      }, 150);
    });
    T.onThemeChange(draw);
  })();

  /* ---------------------------------------------------------------- causes of injury */
  (() => {
    const root = $("tbi1-causes");
    if (!root) return;
    const NAMES = {
      road: "Road traffic",
      falls: "Falls",
      range: "Falls (upper end of range)",
      violence: "Violence",
      other: "Other",
      rest: "Not broken down",
    };
    const CLS = {
      road: "tbi1-seg-road",
      falls: "tbi1-seg-falls",
      range: "tbi1-seg-range",
      violence: "tbi1-seg-violence",
      other: "tbi1-seg-other",
      rest: "tbi1-seg-rest",
    };
    const ROWS = [
      {
        label: "World, 2019",
        sub: "Global Burden of Disease",
        segs: [
          ["falls", 54, "Falls were 54% of the causes of new TBI worldwide in 2019, up from 52% in 1990 (GBD, via the Lancet Neurology Commission)."],
          ["rest", 46, "The remaining causes are not broken down in the source I used."],
        ],
      },
      {
        label: "Africa and South-East Asia",
        sub: "Dewan et al., road traffic only",
        segs: [
          ["road", 56, "Road traffic: 56% of TBI in Africa and South-East Asia (Dewan et al.)."],
          ["rest", 44, "Other causes, not broken down here."],
        ],
      },
      {
        label: "North America",
        sub: "Dewan et al., road traffic only",
        segs: [
          ["road", 25, "Road traffic: 25% of TBI in North America (Dewan et al.)."],
          ["rest", 75, "Other causes, not broken down here; in high-income countries falls dominate."],
        ],
      },
      {
        label: "India, 2002 estimate",
        sub: "Gururaj",
        segs: [
          ["road", 60, "Road traffic: about 60% (Gururaj 2002)."],
          ["falls", 20, "Falls: 20 to 25%. The solid part is the lower end."],
          ["range", 5, "Falls: the upper end of the 20 to 25% range."],
          ["violence", 10, "Violence: about 10%."],
          ["other", 5, "The remaining 5 to 10%, depending on the falls figure; not specified in the abstract."],
        ],
      },
      {
        label: "India, 72 hospital studies",
        sub: "Massenburg et al. 2017",
        segs: [
          ["road", 55.5, "Road traffic accidents: 55.5% across 19,962 patients in 72 studies (Massenburg et al. 2017)."],
          ["falls", 29.2, "Falls: 29.2%."],
          ["other", 15.3, "Other causes: the remaining 15.3%."],
        ],
      },
      {
        label: "US rehabilitation cohort",
        sub: "TBIMS, 2022 profile",
        segs: [
          ["road", 49, "Vehicular: 49% of people in the TBIMS database (2022 profile). “Vehicular” includes more than road crashes."],
          ["falls", 29, "Falls: 29%."],
          ["violence", 11, "Violence: 11%."],
          ["other", 11, "Other: 11%."],
        ],
      },
    ];
    const segs = [];
    ROWS.forEach((row) => {
      const lab = document.createElement("div");
      lab.className = "tbi1-bar-label";
      lab.innerHTML = `${row.label}<small>${row.sub}</small>`;
      const bar = document.createElement("div");
      bar.className = "tbi1-bar";
      row.segs.forEach(([kind, v, tip]) => {
        const s = document.createElement("div");
        s.className = `tbi1-seg ${CLS[kind]}`;
        s.dataset.kind = kind;
        s.dataset.v = v;
        if (kind !== "rest") {
          s.tabIndex = 0;
          s.setAttribute("role", "img");
          s.setAttribute("aria-label", `${row.label}: ${tip}`);
          bindTip(s, () => `<strong>${NAMES[kind]}${kind === "rest" ? "" : `, ${v}%`}</strong><br>${tip}`);
          const hl = (on) =>
            segs.forEach((o) =>
              o.classList.toggle(
                "is-dim",
                on &&
                  o.dataset.kind !== kind &&
                  !(kind === "falls" && o.dataset.kind === "range") &&
                  !(kind === "range" && o.dataset.kind === "falls")
              )
            );
          s.addEventListener("pointerenter", () => hl(true));
          s.addEventListener("pointerleave", () => hl(false));
          s.addEventListener("focus", () => hl(true));
          s.addEventListener("blur", () => hl(false));
        } else {
          s.style.boxShadow = "inset 0 0 0 1px var(--tbi-rule)";
        }
        segs.push(s);
        bar.appendChild(s);
      });
      root.append(lab, bar);
    });
    const grow = () => segs.forEach((s) => (s.style.width = `${s.dataset.v}%`));
    T.onVisible(root, grow);
  })();

  /* ---------------------------------------------------------------- bars that grow on view (care gap, trials) */
  (() => {
    const grow = (rootId, sel, scale = (v) => v) => {
      const root = $(rootId);
      if (!root) return;
      T.onVisible(root, () => root.querySelectorAll(sel).forEach((f) => (f.style.width = `${scale(+f.dataset.v)}%`)));
    };
    grow("tbi1-gap", ".tbi1-gap-fill");
    grow("tbi1-trial-cards", ".tbi1-pair-fill");
  })();

  /* ---------------------------------------------------------------- soft body in a hard shell */
  (() => {
    const canvas = $("tbi1-jelly");
    if (!canvas) return;
    const TAU = Math.PI * 2;
    const gauss = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
    const wrap = (a) => ((a % TAU) + TAU) % TAU;
    // Brain outline in polar form (y points down, front of the head at angle pi, i.e. on the left).
    const brainR = (th) => {
      const a = 1.0;
      const b = 0.72;
      let r = (a * b) / Math.sqrt((b * Math.cos(th)) ** 2 + (a * Math.sin(th)) ** 2);
      const s = Math.max(0, Math.sin(th));
      r *= 1 - 0.1 * s ** 3;
      r *= 1 - 0.1 * gauss(th, 2.02, 0.1); // notch where the sphenoid ridge sits
      r *= 1 + 0.07 * gauss(th, 1.72, 0.17); // temporal pole dips into the middle fossa
      r *= 1 + 0.05 * gauss(th, 0.62, 0.25); // cerebellum
      r *= 1 + 0.03 * gauss(th, 3.1, 0.35); // frontal pole
      return r;
    };
    const GAP = 0.055;
    const RIDGE_A = 2.12;
    const RIDGE_B = 2.85;
    const ridge = (th) => (th > RIDGE_A && th < RIDGE_B ? 0.026 * Math.sin(((th - RIDGE_A) / (RIDGE_B - RIDGE_A)) * Math.PI * 5) ** 2 : 0);
    const N_TAB = 720;
    const wallTab = new Float32Array(N_TAB);
    for (let i = 0; i < N_TAB; i++) {
      const th = (i / N_TAB) * TAU;
      wallTab[i] = brainR(th) + GAP - ridge(th);
    }
    const wallR = (th) => {
      const f = (wrap(th) / TAU) * N_TAB;
      const i = Math.floor(f) % N_TAB;
      const j = (i + 1) % N_TAB;
      return lerp(wallTab[i], wallTab[j], f - Math.floor(f));
    };
    const onRidge = (th) => {
      const t = wrap(th);
      return t > RIDGE_A - 0.12 && t < RIDGE_B;
    };

    // Particles: three rings and a centre, with distance constraints between them.
    const RINGS = [
      [1, 72],
      [0.68, 40],
      [0.36, 18],
    ];
    const P = [];
    const ringIdx = [];
    RINGS.forEach(([f, n], ri) => {
      const idx = [];
      for (let k = 0; k < n; k++) {
        const th = (k / n) * TAU;
        const r = brainR(th) * f;
        P.push({ qx: r * Math.cos(th), qy: r * Math.sin(th), th, ring: ri, k, bruise: 0, flash: 0 });
        idx.push(P.length - 1);
      }
      ringIdx.push(idx);
    });
    P.push({ qx: 0, qy: 0, th: 0, ring: 3, k: 0, bruise: 0, flash: 0 });
    const CENTRE = P.length - 1;
    const C = [];
    const addC = (i, j, k, kind) => C.push({ i, j, rest: Math.hypot(P[i].qx - P[j].qx, P[i].qy - P[j].qy), k, kind, strain: 0 });
    ringIdx.forEach((idx, ri) => {
      idx.forEach((pi, k) => addC(pi, idx[(k + 1) % idx.length], ri === 0 ? 0.9 : 0.6, "ring"));
      if (ri < ringIdx.length - 1) {
        const inner = ringIdx[ri + 1];
        idx.forEach((pi) => {
          const th = P[pi].th;
          const near = inner
            .map((q) => [q, Math.abs(Math.atan2(Math.sin(P[q].th - th), Math.cos(P[q].th - th)))])
            .sort((a, b) => a[1] - b[1])
            .slice(0, 2);
          near.forEach(([q], n) => addC(pi, q, 0.35, n === 0 ? "spoke" : "diag"));
        });
      } else idx.forEach((pi) => addC(pi, CENTRE, 0.35, "spoke"));
    });
    // State: skull rigid body and brain particles (Verlet).
    const S = { x: 0, y: 0, a: 0, vx: 0, vy: 0, w: 0, drag: null, fall: 0, stopAt: null };
    const reset = () => {
      P.forEach((p) => {
        p.x = p.px = p.qx;
        p.y = p.py = p.qy;
      });
    };
    reset();
    let events = [];
    let lastBlow = null;
    let blowClock = 0;
    let summaryTimer = null;
    let slow = true;
    let quiet = 0;

    const regionOf = (th) => {
      const t = wrap(th);
      if (t > RIDGE_A - 0.12 && t <= RIDGE_B) return "base";
      if (t > 1.45 && t <= RIDGE_A - 0.12) return "temporal";
      if (t > RIDGE_B && t < 3.6) return "front";
      if (t >= 3.6 && t < 5.0) return "top";
      if (t >= 5.0 || t < 0.35) return "back";
      return "cerebellum";
    };
    const REGION_NAME = {
      front: "the front of the brain (frontal pole)",
      base: "the underside of the frontal lobe, over the ridged floor",
      temporal: "the temporal tip, against the sphenoid ridge",
      top: "the top of the brain",
      back: "the back of the brain (occipital pole)",
      cerebellum: "the cerebellum at the back of the base",
    };

    const substep = (h) => {
      // Skull: neck spring, or the reader's drag, or a fall that is stopped by the floor.
      let ax;
      let ay;
      let aw;
      if (S.drag) {
        ax = 420 * (S.drag.tx - S.x) - 30 * S.vx;
        ay = 420 * (S.drag.ty - S.y) - 30 * S.vy;
        aw = -40 * S.a - 6 * S.w;
      } else if (S.fall > 0) {
        ax = 0;
        ay = 0;
        aw = 0;
        S.fall -= h;
        if (S.fall <= 0) {
          S.vx *= -0.15;
          S.vy *= -0.15;
          S.w = 0;
        }
      } else {
        ax = -55 * S.x - 9 * S.vx;
        ay = -55 * S.y - 9 * S.vy;
        aw = -55 * S.a - 9 * S.w;
      }
      S.vx += ax * h;
      S.vy += ay * h;
      S.w += aw * h;
      S.x += S.vx * h;
      S.y += S.vy * h;
      S.a += S.w * h;
      const ca = Math.cos(S.a);
      const sa = Math.sin(S.a);
      // Brain particles: inertia plus drag from the fluid toward the skull's motion.
      P.forEach((p) => {
        let vx = p.x - p.px;
        let vy = p.y - p.py;
        const sx = (S.vx - S.w * (p.y - S.y)) * h;
        const sy = (S.vy + S.w * (p.x - S.x)) * h;
        const kf = p.ring === 0 ? 0.035 : 0.004;
        vx += (sx - vx) * kf;
        vy += (sy - vy) * kf;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy;
      });
      for (let it = 0; it < 6; it++) {
        C.forEach((c) => {
          const a = P[c.i];
          const b = P[c.j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1e-6;
          const diff = ((d - c.rest) / d) * 0.5 * c.k;
          a.x += dx * diff;
          a.y += dy * diff;
          b.x -= dx * diff;
          b.y -= dy * diff;
        });
        // Weak shape matching keeps the overall form.
        let cx = 0;
        let cy = 0;
        P.forEach((p) => {
          cx += p.x;
          cy += p.y;
        });
        cx /= P.length;
        cy /= P.length;
        let num = 0;
        let den = 0;
        P.forEach((p) => {
          const rx = p.x - cx;
          const ry = p.y - cy;
          num += p.qx * ry - p.qy * rx;
          den += p.qx * rx + p.qy * ry;
        });
        const ang = Math.atan2(num, den);
        const c2 = Math.cos(ang);
        const s2 = Math.sin(ang);
        P.forEach((p) => {
          const gx = cx + c2 * p.qx - s2 * p.qy;
          const gy = cy + s2 * p.qx + c2 * p.qy;
          p.x += (gx - p.x) * 0.03;
          p.y += (gy - p.y) * 0.03;
        });
      }
      // Collisions of the surface with the inside of the skull.
      ringIdx[0].forEach((pi) => {
        const p = P[pi];
        const dx = p.x - S.x;
        const dy = p.y - S.y;
        const lx = ca * dx + sa * dy;
        const ly = -sa * dx + ca * dy;
        const r = Math.hypot(lx, ly);
        const th = Math.atan2(ly, lx);
        const rw = wallR(th) - 0.004;
        if (r <= rw) return;
        const k = rw / r;
        const nlx = lx * k;
        const nly = ly * k;
        p.x = S.x + ca * nlx - sa * nly;
        p.y = S.y + sa * nlx + ca * nly;
        const nx = (ca * lx - sa * ly) / r;
        const ny = (sa * lx + ca * ly) / r;
        const svx = (S.vx - S.w * (p.y - S.y)) * h;
        const svy = (S.vy + S.w * (p.x - S.x)) * h;
        let rvx = p.x - p.px - svx;
        let rvy = p.y - p.py - svy;
        const vn = rvx * nx + rvy * ny;
        if (vn > 0) {
          rvx -= 1.15 * vn * nx;
          rvy -= 1.15 * vn * ny;
          const mu = onRidge(th) ? 0.45 : 0.12;
          const tvx = rvx - (rvx * nx + rvy * ny) * nx;
          const tvy = rvy - (rvx * nx + rvy * ny) * ny;
          const slide = Math.hypot(tvx, tvy) / h;
          rvx -= tvx * mu;
          rvy -= tvy * mu;
          const speed = vn / h;
          let hit = Math.max(0, speed - 0.42);
          if (onRidge(th)) hit += Math.max(0, slide - 0.9) * 0.35;
          if (hit > 0) {
            p.bruise = Math.min(1.6, p.bruise + hit * 0.22);
            p.flash = Math.min(1, p.flash + hit * 1.2);
            if (lastBlow && blowClock < 3) {
              const reg = regionOf(p.th);
              const ev = events.find((e) => e.reg === reg);
              if (ev) ev.w += hit;
              else events.push({ reg, t: blowClock, w: hit });
            }
          }
        }
        p.px = p.x - (svx + rvx);
        p.py = p.y - (svy + rvy);
      });
      C.forEach((c) => {
        const a = P[c.i];
        const b = P[c.j];
        const s = Math.abs(Math.hypot(b.x - a.x, b.y - a.y) / c.rest - 1);
        c.strain = Math.max(s, c.strain * 0.985);
      });
    };

    // Drawing.
    let ctx = null;
    let W = 0;
    let H = 0;
    let scale = 1;
    let ox = 0;
    let oy = 0;
    const fit = () => {
      const f = T.fitCanvas(canvas);
      ctx = f.ctx;
      W = f.width;
      H = f.height;
      scale = Math.min(W / 2.9, H / 2.3);
      ox = W / 2;
      oy = H / 2 + scale * 0.05;
    };
    const px = (x) => ox + x * scale;
    const py = (y) => oy + y * scale;
    const pathRing = (idx) => {
      // Smooth closed curve through particle positions (midpoint quadratic splines).
      const n = idx.length;
      const p = (k) => P[idx[((k % n) + n) % n]];
      ctx.beginPath();
      const m0x = (px(p(0).x) + px(p(1).x)) / 2;
      const m0y = (py(p(0).y) + py(p(1).y)) / 2;
      ctx.moveTo(m0x, m0y);
      for (let k = 1; k <= n; k++) {
        const a = p(k);
        const b = p(k + 1);
        ctx.quadraticCurveTo(px(a.x), py(a.y), (px(a.x) + px(b.x)) / 2, (py(a.y) + py(b.y)) / 2);
      }
      ctx.closePath();
    };
    const mixHex = (a, b, t) => {
      const pa = parseCol(a);
      const pb = parseCol(b);
      return `rgb(${Math.round(lerp(pa[0], pb[0], t))},${Math.round(lerp(pa[1], pb[1], t))},${Math.round(lerp(pa[2], pb[2], t))})`;
    };
    const colCtx = document.createElement("canvas").getContext("2d");
    const colCache = new Map();
    const parseCol = (c) => {
      if (colCache.has(c)) return colCache.get(c);
      colCtx.fillStyle = "#888";
      colCtx.fillStyle = c;
      const s = colCtx.fillStyle;
      let out;
      if (s[0] === "#") {
        const n = parseInt(s.slice(1), 16);
        out = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      } else out = (s.match(/[\d.]+/g) || [128, 128, 128]).map(Number);
      colCache.set(c, out);
      return out;
    };
    let pal = {};
    const readPalette = () => {
      pal = {
        bone: T.cssVar("--tbi1-bone"),
        boneEdge: T.cssVar("--tbi1-bone-edge"),
        csf: T.cssVar("--tbi1-csf"),
        tissue: T.cssVar("--tbi1-tissue"),
        edge: T.cssVar("--tbi1-tissue-edge"),
        injury: T.cssVar("--tbi-injury"),
        ink2: T.cssVar("--global-text-color-light"),
      };
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const ca = Math.cos(S.a);
      const sa = Math.sin(S.a);
      const toW = (lx, ly) => [px(S.x + ca * lx - sa * ly), py(S.y + sa * lx + ca * ly)];
      // Bone: outer smooth outline minus the ridged inner wall.
      ctx.beginPath();
      for (let i = 0; i <= 180; i++) {
        const th = (i / 180) * TAU;
        const r = brainR(th) + GAP + 0.13 + 0.04 * gauss(wrap(th), 3.3, 0.5);
        const [x, y] = toW(r * Math.cos(th), r * Math.sin(th));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      for (let i = 0; i <= 360; i++) {
        const th = -(i / 360) * TAU;
        const r = wallR(th);
        const [x, y] = toW(r * Math.cos(th), r * Math.sin(th));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = pal.bone;
      ctx.fill("evenodd");
      ctx.strokeStyle = pal.boneEdge;
      ctx.lineWidth = 1;
      ctx.stroke();
      // Fluid.
      ctx.beginPath();
      for (let i = 0; i <= 360; i++) {
        const th = (i / 360) * TAU;
        const r = wallR(th);
        const [x, y] = toW(r * Math.cos(th), r * Math.sin(th));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = pal.csf;
      ctx.fill();
      // Labels on the skull.
      ctx.fillStyle = pal.ink2;
      ctx.font = `600 ${Math.max(9, scale * 0.065)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      const lab = (t, lx, ly) => {
        const [x, y] = toW(lx, ly);
        ctx.fillText(t, x, y);
      };
      lab("FRONT", -1.18, -0.82);
      lab("BACK", 1.15, -0.82);
      ctx.font = `${Math.max(9, scale * 0.058)}px system-ui, sans-serif`;
      lab("ridged floor", -0.98, 0.98);
      lab("fluid", 0.2, -0.86);
      // Brain body.
      pathRing(ringIdx[0]);
      ctx.fillStyle = pal.tissue;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = pal.edge;
      ctx.stroke();
      // Internal lines coloured by strain.
      ctx.lineCap = "round";
      C.forEach((c) => {
        if (c.kind === "diag" || (c.kind === "ring" && P[c.i].ring === 0)) return;
        const t = clamp(c.strain * 9, 0, 1);
        ctx.strokeStyle = t < 0.05 ? pal.edge : mixHex(pal.edge, pal.injury, t);
        ctx.globalAlpha = 0.35 + 0.65 * t;
        ctx.lineWidth = 0.8 + t * 1.6;
        ctx.beginPath();
        ctx.moveTo(px(P[c.i].x), py(P[c.i].y));
        ctx.lineTo(px(P[c.j].x), py(P[c.j].y));
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // Bruises and contact flashes.
      ringIdx[0].forEach((pi) => {
        const p = P[pi];
        if (p.flash > 0.02) {
          ctx.beginPath();
          ctx.arc(px(p.x), py(p.y), 4 + p.flash * 10, 0, TAU);
          ctx.fillStyle = pal.injury;
          ctx.globalAlpha = p.flash * 0.35;
          ctx.fill();
        }
        if (p.bruise > 0.03) {
          ctx.beginPath();
          ctx.arc(px(p.x), py(p.y), 2 + Math.min(1.6, p.bruise) * 4.5, 0, TAU);
          ctx.fillStyle = pal.injury;
          ctx.globalAlpha = 0.45 + 0.5 * Math.min(1, p.bruise);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };

    const readout = $("tbi1-jelly-read");
    const summarise = () => {
      if (!lastBlow) return;
      const hard = events.filter((e) => e.w > 0.05).sort((a, b) => a.t - b.t);
      if (!hard.length) {
        readout.textContent = "That one was gentle: the body moved with the shell and nothing hit hard enough to bruise.";
        return;
      }
      const parts = hard.slice(0, 3).map((e, i) => {
        let tag = "";
        if (lastBlow === "front" && e.reg === "front") tag = i === 0 ? " (coup, under the blow)" : "";
        if (lastBlow === "front" && e.reg === "back") tag = " (contrecoup, opposite the blow)";
        if (lastBlow === "fall" && e.reg === "back") tag = i === 0 ? " (coup, where the head hit the floor)" : "";
        if (lastBlow === "fall" && (e.reg === "front" || e.reg === "base")) tag = " (contrecoup, opposite the impact)";
        return REGION_NAME[e.reg] + tag;
      });
      const intro =
        lastBlow === "hook"
          ? "Almost no straight-line push, but the shell turned and the body lagged. Contacts, in order: "
          : "Hard contacts, in order: ";
      readout.textContent = intro + parts.join("; then ") + ".";
    };

    let sleeping = true;
    const anim = loop(canvas, (dt) => {
      const sim = dt * (slow ? 0.3 : 1);
      const n = 4;
      for (let i = 0; i < n; i++) substep(sim / n);
      blowClock += sim;
      let energy = Math.abs(S.vx) + Math.abs(S.vy) + Math.abs(S.w) * 0.3 + Math.abs(S.x) + Math.abs(S.y);
      P.forEach((p) => {
        energy += (Math.abs(p.x - p.px) + Math.abs(p.y - p.py)) * 2;
        p.flash *= Math.pow(0.02, dt);
      });
      draw();
      quiet = energy < 0.004 && !S.drag && S.fall <= 0 ? quiet + dt : 0;
      if (quiet > 0.6) {
        sleeping = true;
        return false;
      }
      return true;
    });
    const wake = () => {
      sleeping = false;
      quiet = 0;
      anim.wake();
    };

    const hint = $("tbi1-jelly-hint");
    const hideHint = () => hint && (hint.style.opacity = "0");
    const blow = (kind) => {
      hideHint();
      lastBlow = kind;
      events = [];
      blowClock = 0;
      S.drag = null;
      if (kind === "front") {
        S.vx += 3.2;
        S.w += -0.6;
      } else if (kind === "fall") {
        // The head is already moving backwards with the body; the floor stops it in an instant.
        const v = 2.6;
        S.vx = v;
        S.vy = 0.1;
        S.w = 0;
        P.forEach((p) => {
          p.px = p.x - v * 0.004;
          p.py = p.y - 0.1 * 0.004;
        });
        S.fall = 0.12;
      } else {
        S.w += 9;
        S.vx += 0.2;
      }
      clearTimeout(summaryTimer);
      summaryTimer = setTimeout(summarise, slow ? 2600 : 1100);
      wake();
    };
    document.querySelectorAll("[data-blow]").forEach((b) => b.addEventListener("click", () => blow(b.dataset.blow)));
    const slowBtn = $("tbi1-jelly-slow");
    slowBtn.addEventListener("click", () => {
      slow = !slow;
      slowBtn.setAttribute("aria-pressed", String(slow));
    });
    $("tbi1-jelly-clear").addEventListener("click", () => {
      P.forEach((p) => (p.bruise = p.flash = 0));
      C.forEach((c) => (c.strain = 0));
      events = [];
      lastBlow = null;
      readout.textContent = "Bruises cleared.";
      if (sleeping) draw();
    });
    // Drag the shell.
    const toWorld = (e) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left - ox) / scale, (e.clientY - r.top - oy) / scale];
    };
    canvas.addEventListener("pointerdown", (e) => {
      const [x, y] = toWorld(e);
      canvas.setPointerCapture(e.pointerId);
      S.drag = { tx: S.x, ty: S.y, gx: x - S.x, gy: y - S.y };
      S.fall = 0;
      lastBlow = "drag";
      events = [];
      blowClock = 0;
      hideHint();
      wake();
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!S.drag) return;
      const [x, y] = toWorld(e);
      S.drag.tx = clamp(x - S.drag.gx, -0.6, 0.6);
      S.drag.ty = clamp(y - S.drag.gy, -0.4, 0.4);
    });
    const release = () => {
      if (!S.drag) return;
      S.drag = null;
      const hard = events.filter((e) => e.w > 0.05).sort((a, b) => a.t - b.t);
      if (hard.length)
        readout.textContent =
          "You shook it hard enough to bruise: " +
          hard
            .slice(0, 3)
            .map((e) => REGION_NAME[e.reg])
            .join("; ") +
          ".";
      lastBlow = null;
      wake();
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("keydown", (e) => {
      const map = { ArrowLeft: [-2.2, 0], ArrowRight: [2.2, 0], ArrowUp: [0, -2.2], ArrowDown: [0, 2.2] };
      if (!map[e.key]) return;
      e.preventDefault();
      lastBlow = "drag";
      events = [];
      blowClock = 0;
      S.vx += map[e.key][0];
      S.vy += map[e.key][1];
      hideHint();
      wake();
    });
    readPalette();
    fit();
    draw();
    let rt = null;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        fit();
        draw();
      }, 150);
    });
    T.onThemeChange(() => {
      readPalette();
      draw();
    });
  })();

  /* ---------------------------------------------------------------- head accelerations */
  (() => {
    const svg = $("tbi1-accel");
    if (!svg) return;
    const read = $("tbi1-accel-read");
    const DATA = {
      lin: {
        max: 200,
        ticks: [0, 50, 100, 150, 200],
        unit: "g",
        rows: [
          {
            label: "Professional, struck but not injured",
            lo: 36,
            hi: 84,
            mid: 60,
            tip: "Uninjured struck players in reconstructed professional impacts: 60 ± 24 g (mean ± standard deviation).",
          },
          {
            label: "Professional, concussed",
            lo: 70,
            hi: 126,
            mid: 98,
            hot: true,
            tip: "Concussed players: 98 ± 28 g, over about 15 milliseconds. Their heads were hit at 9.3 ± 1.9 m/s.",
          },
          {
            label: "College, concussive impacts",
            lo: 60.51,
            hi: 168.71,
            hot: true,
            tip: "Thirteen concussions recorded by helmet sensors ranged from 60.51 to 168.71 g, and clinical severity was unrelated to impact size.",
          },
        ],
        intro:
          "Straight-line acceleration of the head in g, multiples of the acceleration of gravity. The bands overlap: some uninjured players took harder hits than some concussed ones.",
      },
      rot: {
        max: 8000,
        ticks: [0, 2000, 4000, 6000, 8000],
        unit: "rad/s²",
        rows: [
          {
            label: "Average non-concussive impact",
            mid: 1230,
            tip: "Average of 300,977 non-concussive impacts: 1,230 rad/s² (and 5.5 rad/s peak rotational velocity).",
          },
          { label: "Average concussive impact", mid: 5022, hot: true, tip: "Average of 57 concussive impacts: 5,022 rad/s² (and 22.3 rad/s)." },
        ],
        line: { v: 6383, tip: "The fitted risk of concussion reaches 50% at 6,383 rad/s² (with 28.3 rad/s)." },
        intro:
          "Rotational acceleration: how quickly the head’s spin speeds up, in radians per second per second. A concussive impact averaged about four times the rotational acceleration of an ordinary hit.",
      },
    };
    let mode = "lin";
    const build = () => {
      clear(svg);
      const narrow = isNarrow(svg);
      const Wd = narrow ? 360 : 640;
      const d = DATA[mode];
      const left = narrow ? 12 : 200;
      const right = Wd - 18;
      const rowH = narrow ? 50 : 38;
      const top = 14;
      const Hh = top + d.rows.length * rowH + 40;
      svg.setAttribute("viewBox", `0 0 ${Wd} ${Hh}`);
      const x = (v) => left + (v / d.max) * (right - left);
      const axisY = top + d.rows.length * rowH + 6;
      const ax = svgEl("g", { class: "tbi1-axis" }, svg);
      d.ticks.forEach((t) => {
        svgEl("line", { x1: x(t), x2: x(t), y1: top - 6, y2: axisY, "stroke-dasharray": "2 4" }, ax);
        svgEl("text", { x: x(t), y: axisY + 14, "text-anchor": "middle" }, ax, fmt(t));
      });
      svgEl("text", { x: right, y: axisY + 28, "text-anchor": "end" }, ax, d.unit);
      const accent = "var(--global-theme-color)";
      const muted = "var(--global-text-color-light)";
      const marks = [];
      d.rows.forEach((r, i) => {
        const cy = top + i * rowH + (narrow ? 32 : rowH / 2);
        svgEl(
          "text",
          { x: narrow ? left : left - 12, y: narrow ? cy - 16 : cy + 4, "text-anchor": narrow ? "start" : "end", class: "tbi1-svg-label" },
          svg,
          r.label
        );
        const g = svgEl("g", { class: "tbi1-mark", tabindex: 0, role: "img", "aria-label": r.tip }, svg);
        if (r.lo !== undefined) {
          const rect = svgEl(
            "rect",
            { x: x(r.lo), y: cy - 6, width: 0, height: 12, rx: 6, fill: r.hot ? accent : muted, "fill-opacity": r.hot ? 0.35 : 0.25 },
            g
          );
          rect.style.transition = RM ? "none" : "width 0.9s cubic-bezier(0.2,0.8,0.2,1)";
          requestAnimationFrame(() => requestAnimationFrame(() => rect.setAttribute("width", x(r.hi) - x(r.lo))));
        }
        if (r.mid !== undefined) svgEl("circle", { cx: x(r.mid), cy, r: 6, fill: r.hot ? accent : muted }, g);
        svgEl("rect", { x: x(r.lo ?? r.mid) - 10, y: cy - 14, width: x(r.hi ?? r.mid) - x(r.lo ?? r.mid) + 20, height: 28, fill: "transparent" }, g);
        marks.push([g, r.tip]);
      });
      if (d.line) {
        const g = svgEl("g", { class: "tbi1-mark", tabindex: 0, role: "img", "aria-label": d.line.tip }, svg);
        svgEl(
          "line",
          { x1: x(d.line.v), x2: x(d.line.v), y1: top - 8, y2: axisY, stroke: "var(--tbi-injury)", "stroke-width": 2, "stroke-dasharray": "5 4" },
          g
        );
        svgEl("text", { x: x(d.line.v) - 6, y: top + 2, "text-anchor": "end", class: "tbi1-svg-small" }, g, "50% risk");
        svgEl("rect", { x: x(d.line.v) - 10, y: top - 8, width: 20, height: axisY - top + 8, fill: "transparent" }, g);
        marks.push([g, d.line.tip]);
      }
      marks.forEach(([g, tip]) => {
        const show = () => (read.textContent = tip);
        g.addEventListener("pointerenter", show);
        g.addEventListener("click", show);
        g.addEventListener("focus", show);
      });
      read.textContent = d.intro;
    };
    document.querySelectorAll("[data-acc]").forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.dataset.acc;
        document.querySelectorAll("[data-acc]").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
        build();
      })
    );
    T.onVisible(svg, build, 0.2);
    onResize(svg, build);
  })();

  /* ---------------------------------------------------------------- axon stretch */
  (() => {
    const canvas = $("tbi1-axon");
    if (!canvas) return;
    const slider = $("tbi1-axon-t");
    const label = $("tbi1-axon-time");
    const btn = $("tbi1-axon-play");
    let rng = 7;
    const rand = () => ((rng = (rng * 16807) % 2147483647) - 1) / 2147483646;
    const AXONS = Array.from({ length: 7 }, (_, i) => ({
      y: (i + 1) / 8,
      phase: rand() * 6,
      fails: [0.18 + rand() * 0.15, 0.45 + rand() * 0.12, 0.7 + rand() * 0.15],
      survives: i === 4,
      gaps: Array.from({ length: 9 }, () => 0.08 + rand() * 0.84),
    }));
    let t = 0;
    let ctx;
    let W;
    let H;
    const fit = () => {
      const f = T.fitCanvas(canvas);
      ctx = f.ctx;
      W = f.width;
      H = f.height;
    };
    const STRETCH_END = 0.08;
    const hoursAt = (u) => Math.exp(lerp(Math.log(1 / 60), Math.log(24), (u - STRETCH_END) / (1 - STRETCH_END)));
    const timeText = (u) => {
      if (u < 0.015) return "Before the stretch";
      if (u < STRETCH_END) return "The stretch: milliseconds";
      const hrs = hoursAt(u);
      if (hrs < 1) return `About ${Math.max(1, Math.round(hrs * 60))} min after`;
      return `About ${hrs < 10 ? hrs.toFixed(1) : Math.round(hrs)} h after`;
    };
    const draw = () => {
      const accent = T.cssVar("--global-theme-color");
      const ink = T.cssVar("--global-text-color");
      const ink2 = T.cssVar("--global-text-color-light");
      const injury = T.cssVar("--tbi-injury");
      ctx.clearRect(0, 0, W, H);
      const stretch = t < 0.015 ? 0 : t < STRETCH_END ? Math.sin(((t - 0.015) / (STRETCH_END - 0.015)) * Math.PI) : 0;
      const und = clamp((t - STRETCH_END) / 0.25, 0, 1);
      const swell = clamp((t - 0.3) / 0.38, 0, 1);
      const degen = clamp((t - 0.68) / 0.3, 0, 1);
      const pad = Math.max(18, W * 0.05);
      const grip = Math.max(10, W * 0.02);
      const pull = stretch * W * 0.05;
      // Grips that pull the ends.
      ctx.fillStyle = ink2;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(pad - grip - pull, H * 0.06, grip, H * 0.88);
      ctx.fillRect(W - pad + pull, H * 0.06, grip, H * 0.88);
      ctx.globalAlpha = 1;
      const x0 = pad - pull;
      const x1 = W - pad + pull;
      const thick = Math.max(3, H * 0.045) * (1 - 0.45 * stretch);
      AXONS.forEach((a) => {
        const y0 = a.y * H;
        const dead = a.survives ? 0 : degen;
        const yAt = (u) => {
          let y = y0 + Math.sin(u * 9 + a.phase) * H * 0.006;
          a.fails.forEach((f) => {
            const env = Math.exp(-(((u - f) / 0.045) ** 2));
            y += Math.sin((u - f) * 140) * env * und * H * 0.022 * (a.survives ? 0.4 : 1);
          });
          return y;
        };
        const N = 160;
        // Fragmentation: gaps open along degenerating axons.
        const gapW = dead * 0.035;
        const inGap = (u) => dead > 0 && a.gaps.some((g) => Math.abs(u - g) < gapW);
        ctx.lineCap = "round";
        ctx.lineWidth = thick;
        ctx.strokeStyle = mixCol(accent, ink2, dead * 0.7);
        ctx.globalAlpha = 1 - dead * 0.55;
        ctx.beginPath();
        let pen = false;
        for (let k = 0; k <= N; k++) {
          const u = k / N;
          const x = lerp(x0, x1, u);
          if (inGap(u)) {
            pen = false;
            continue;
          }
          const y = yAt(u);
          if (!pen) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          pen = true;
        }
        ctx.stroke();
        // Microtubules inside, broken at the failure points after the stretch.
        ctx.lineWidth = 1;
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.35 * (1 - dead);
        [-0.22, 0.22].forEach((off) => {
          ctx.beginPath();
          let on = false;
          for (let k = 0; k <= N; k++) {
            const u = k / N;
            const broken = t > STRETCH_END * 0.7 && a.fails.some((f) => Math.abs(u - f) < 0.012 + und * 0.008);
            if (broken || inGap(u)) {
              on = false;
              continue;
            }
            const x = lerp(x0, x1, u);
            const y = yAt(u) + off * thick;
            if (!on) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            on = true;
          }
          ctx.stroke();
        });
        // Swellings where transport piles up.
        if (swell > 0) {
          a.fails.forEach((f, j) => {
            const s = swell * (a.survives ? 0.35 : 1) * (j === 1 ? 1 : 0.75);
            ctx.globalAlpha = (0.85 - dead * 0.4) * Math.min(1, s * 2);
            ctx.fillStyle = mixCol(accent, injury, Math.min(1, swell * 1.2));
            ctx.beginPath();
            ctx.ellipse(lerp(x0, x1, f), yAt(f), thick * (0.8 + s * 2.2), thick * (0.6 + s * 1.5), 0, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        ctx.globalAlpha = 1;
      });
      label.textContent = timeText(t);
      slider.setAttribute("aria-valuetext", timeText(t));
    };
    const colCtx = document.createElement("canvas").getContext("2d");
    const rgb = (c) => {
      colCtx.fillStyle = "#888";
      colCtx.fillStyle = c;
      const s = colCtx.fillStyle;
      if (s[0] === "#") {
        const n = parseInt(s.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }
      return (s.match(/[\d.]+/g) || [128, 128, 128]).map(Number);
    };
    function mixCol(a, b, k) {
      const A = rgb(a);
      const B = rgb(b);
      return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
    }
    let playing = false;
    const anim = loop(canvas, (dt) => {
      if (!playing) return false;
      // Linger on the stretch itself, then move through the hours.
      t = Math.min(1, t + dt * (t < STRETCH_END ? 0.05 : 0.12));
      slider.value = Math.round(t * 1000);
      draw();
      if (t >= 1) {
        playing = false;
        btn.textContent = "Stretch again";
      }
      return playing;
    });
    btn.addEventListener("click", () => {
      if (RM) {
        t = 1;
        slider.value = 1000;
        draw();
        btn.textContent = "Stretch again";
        return;
      }
      t = 0;
      playing = true;
      btn.textContent = "Stretch again";
      anim.wake();
    });
    slider.addEventListener("input", () => {
      playing = false;
      t = slider.value / 1000;
      draw();
    });
    fit();
    draw();
    window.addEventListener("resize", () => {
      fit();
      draw();
    });
    T.onThemeChange(draw);
  })();

  /* ---------------------------------------------------------------- neurometabolic cascade */
  (() => {
    const cell = $("tbi1-cell");
    const curve = $("tbi1-curve");
    if (!cell || !curve) return;
    const slider = $("tbi1-cascade-t");
    const timeLab = $("tbi1-cascade-time");
    const playBtn = $("tbi1-cascade-play");
    const LOGMAX = Math.log10(3.15e7); // one year in seconds
    const U0 = 0.04; // slider fraction where the injury happens
    const secAt = (u) => (u <= U0 ? 0 : Math.pow(10, ((u - U0) / (1 - U0)) * LOGMAX));
    const uAt = (sec) => U0 + (Math.log10(Math.max(1, sec)) / LOGMAX) * (1 - U0);
    const MIN = 60;
    const HOUR = 3600;
    const DAY = 86400;
    const STAGES = [
      {
        from: 0,
        to: 0,
        when: "Before the injury",
        title: "A cell at rest",
        text: "Pumps in the membrane keep potassium mostly inside nerve cells and sodium and calcium mostly outside. Keeping those differences costs energy, which the cell gets by burning glucose with oxygen in its mitochondria.",
      },
      {
        from: 1,
        to: 10 * MIN,
        when: "Seconds to minutes",
        title: "Ionic flux and glutamate",
        text: "The stretch tears tiny holes in membranes (“mechanoporation”). Potassium rushes out, sodium and calcium rush in, and cells release the signalling chemical glutamate “hyperacute” and “indiscriminate”, which opens more channels and makes it worse.",
      },
      {
        from: 10 * MIN,
        to: 6 * HOUR,
        when: "Minutes to hours",
        title: "An energy crisis",
        text: "To restore the balance, “ATP-requiring membrane ionic pumps shift into overdrive, causing hyperglycolysis”: the cells burn glucose much faster than usual, at a time when blood flow may not keep up, and their energy reserves run down.",
      },
      {
        from: 6 * HOUR,
        to: 10 * DAY,
        when: "Hours to about ten days",
        title: "A long metabolic slump",
        text: "After the burst, glucose use falls below normal, a state of impaired metabolism “that can last up to 7–10 days in adult animals” (about 3 in young ones). Calcium soaked up by mitochondria impairs them. This is the window in which a second blow does disproportionate harm.",
      },
      {
        from: 10 * DAY,
        to: 60 * DAY,
        when: "Days to weeks",
        title: "Axons and mitochondria",
        text: "Calcium inside axons collapses parts of their internal scaffolding (neurofilament side-arms) and activates enzymes that digest structural proteins such as spectrin. Mitochondrial function can stay impaired into this period.",
      },
      {
        from: 60 * DAY,
        to: Infinity,
        when: "Months to years",
        title: "Possible chronic processes",
        text: "In some people, axonal degeneration, inflammation and other slow processes continue for months or years. Which people, and why, is one of the big open questions in the field.",
      },
    ];
    const stageAt = (sec) => (sec <= 0 ? 0 : STAGES.findIndex((s, i) => i > 0 && sec >= s.from && sec < s.to));
    // Schematic glucose use relative to baseline (illustrative shape only).
    const glucose = (sec) => {
      if (sec <= 0) return 1;
      const lt = Math.log10(sec);
      const rise = 1 / (1 + Math.exp(-(lt - 0.6) * 5));
      const fall = 1 / (1 + Math.exp(-(lt - Math.log10(2 * HOUR)) * 4));
      const recover = 1 / (1 + Math.exp(-(lt - Math.log10(9 * DAY)) * 6));
      return 1 + 0.9 * rise * (1 - fall) - 0.45 * fall * (1 - recover);
    };
    // Curve.
    let curveMarker = null;
    let curveDot = null;
    let cx = null;
    let cy = null;
    const buildCurve = () => {
      clear(curve);
      const narrow = isNarrow(curve);
      const Wd = narrow ? 360 : 640;
      const Hh = narrow ? 170 : 150;
      curve.setAttribute("viewBox", `0 0 ${Wd} ${Hh}`);
      const L = 34;
      const R = Wd - 10;
      const top = 18;
      const bot = Hh - 30;
      cx = (u) => L + ((u - U0) / (1 - U0)) * (R - L);
      cy = (g) => bot - ((g - 0.3) / (2.1 - 0.3)) * (bot - top);
      const ax = svgEl("g", { class: "tbi1-axis" }, curve);
      // Vulnerability window: injury to ten days.
      svgEl(
        "rect",
        { x: cx(U0), y: top - 6, width: cx(uAt(10 * DAY)) - cx(U0), height: bot - top + 6, fill: "var(--tbi-injury)", "fill-opacity": 0.07 },
        curve
      );
      svgEl(
        "text",
        { x: cx(uAt(10 * DAY)) - 4, y: top + 4, "text-anchor": "end", class: "tbi1-svg-small" },
        curve,
        narrow ? "more vulnerable" : "more vulnerable to a second injury"
      );
      svgEl("line", { x1: L, x2: R, y1: cy(1), y2: cy(1), "stroke-dasharray": "3 4" }, ax);
      svgEl("text", { x: L - 4, y: cy(1) + 3, "text-anchor": "end" }, ax, "normal");
      const ticks = narrow
        ? [
            [1, "1 s"],
            [HOUR, "1 h"],
            [DAY, "1 day"],
            [30 * DAY, "1 mo"],
            [3.15e7, "1 yr"],
          ]
        : [
            [1, "1 s"],
            [MIN, "1 min"],
            [HOUR, "1 h"],
            [DAY, "1 day"],
            [7 * DAY, "1 wk"],
            [30 * DAY, "1 mo"],
            [3.15e7, "1 yr"],
          ];
      ticks.forEach(([s, t]) => {
        const x = cx(uAt(s));
        svgEl("line", { x1: x, x2: x, y1: bot, y2: bot + 4 }, ax);
        svgEl("text", { x, y: bot + 16, "text-anchor": "middle" }, ax, t);
      });
      svgEl("line", { x1: L, x2: R, y1: bot, y2: bot }, ax);
      svgEl("text", { x: L, y: top - 6, class: "tbi1-svg-small" }, curve, "glucose use (schematic)");
      let d = "";
      for (let i = 0; i <= 200; i++) {
        const u = U0 + (i / 200) * (1 - U0);
        d += `${i ? "L" : "M"}${cx(u).toFixed(1)},${cy(glucose(secAt(u))).toFixed(1)}`;
      }
      svgEl("path", { d, fill: "none", stroke: "var(--global-theme-color)", "stroke-width": 2.2 }, curve);
      curveMarker = svgEl("line", { y1: top - 6, y2: bot, stroke: "var(--global-text-color)", "stroke-opacity": 0.5 }, curve);
      curveDot = svgEl("circle", { r: 5, fill: "var(--global-theme-color)", stroke: "var(--global-bg-color)", "stroke-width": 2 }, curve);
      update(false);
    };
    // Cell schematic.
    const pores = [100, 150, 200];
    const c = {};
    const buildCell = () => {
      clear(cell);
      svgEl("rect", { x: 0, y: 0, width: 320, height: 92, fill: "var(--tbi1-csf)", "fill-opacity": 0.55, rx: 8 }, cell);
      svgEl("text", { x: 10, y: 18, class: "tbi1-svg-small" }, cell, "outside the cell");
      svgEl("rect", { x: 0, y: 108, width: 320, height: 132, fill: "var(--tbi1-tissue)", "fill-opacity": 0.35, rx: 8 }, cell);
      svgEl("text", { x: 10, y: 232, class: "tbi1-svg-small" }, cell, "inside a nerve cell");
      // Membrane with pores that open after the stretch.
      c.membrane = svgEl("g", {}, cell);
      for (let x = 0; x < 320; x += 10) {
        svgEl("circle", { cx: x + 5, cy: 95, r: 3.2, fill: "var(--tbi1-tissue-edge)" }, c.membrane);
        svgEl("circle", { cx: x + 5, cy: 105, r: 3.2, fill: "var(--tbi1-tissue-edge)" }, c.membrane);
      }
      c.pores = pores.map((x) => svgEl("rect", { x: x - 7, y: 89, width: 14, height: 22, fill: "var(--global-bg-color)", opacity: 0 }, cell));
      // Pumps.
      c.pumps = [40, 270].map((x) => {
        const g = svgEl("g", { transform: `translate(${x},100)` }, cell);
        svgEl("circle", { r: 10, fill: "var(--global-bg-color)", stroke: "var(--global-theme-color)", "stroke-width": 2 }, g);
        const arm = svgEl("path", { d: "M-6,0 A6,6 0 1,1 0,6", fill: "none", stroke: "var(--global-theme-color)", "stroke-width": 2 }, g);
        return { g, arm, x, rot: 0 };
      });
      svgEl("text", { x: 40, y: 128, "text-anchor": "middle", class: "tbi1-svg-small" }, cell, "pump");
      // Mitochondrion.
      c.mito = svgEl(
        "ellipse",
        { cx: 120, cy: 180, rx: 34, ry: 16, fill: "var(--tbi-metab)", "fill-opacity": 0.35, stroke: "var(--tbi-metab)", "stroke-width": 1.5 },
        cell
      );
      svgEl("path", { d: "M92,180 q6,-10 12,0 t12,0 t12,0 t12,0 t12,0", fill: "none", stroke: "var(--tbi-metab)", "stroke-width": 1.2 }, cell);
      svgEl("text", { x: 120, y: 208, "text-anchor": "middle", class: "tbi1-svg-small" }, cell, "mitochondrion");
      c.mitoCa = svgEl("g", {}, cell);
      // Energy gauge.
      svgEl("rect", { x: 284, y: 128, width: 16, height: 80, rx: 3, fill: "none", stroke: "var(--global-text-color-light)" }, cell);
      c.atp = svgEl("rect", { x: 286, width: 12, rx: 2, fill: "var(--tbi-musc)" }, cell);
      svgEl("text", { x: 292, y: 222, "text-anchor": "middle", class: "tbi1-svg-small" }, cell, "energy");
      // Scaffold in an axon segment.
      c.scaffold = svgEl("g", {}, cell);
      svgEl("text", { x: 215, y: 160, "text-anchor": "middle", class: "tbi1-svg-small" }, cell, "scaffold");
      c.bars = [];
      for (let i = 0; i < 6; i++)
        c.bars.push(
          svgEl(
            "line",
            {
              x1: 180 + i * 14,
              x2: 180 + i * 14,
              y1: 172,
              y2: 196,
              stroke: "var(--global-text-color-light)",
              "stroke-width": 2,
              "stroke-linecap": "round",
            },
            c.scaffold
          )
        );
      c.ions = svgEl("g", {}, cell);
      // Legend.
      const lg = svgEl("g", { transform: "translate(130,16)" }, cell);
      [
        ["K⁺", "var(--tbi-resp)"],
        ["Na⁺", "var(--tbi-metab)"],
        ["Ca²⁺", "var(--tbi-injury)"],
        ["glutamate", "var(--tbi-psych)"],
      ].forEach(([t, col], i) => {
        svgEl("circle", { cx: i * 46, cy: 0, r: 4, fill: col }, lg);
        svgEl("text", { x: i * 46 + 7, y: 4, class: "tbi1-svg-small" }, lg, t);
      });
    };
    // Ion particles.
    const ions = [];
    const KIND = {
      K: { col: "var(--tbi-resp)", dir: -1 },
      Na: { col: "var(--tbi-metab)", dir: 1 },
      Ca: { col: "var(--tbi-injury)", dir: 1 },
      Glu: { col: "var(--tbi-psych)", dir: -1 },
    };
    const spawn = (kind) => {
      const k = KIND[kind];
      const px = pores[Math.floor(Math.random() * pores.length)] + (Math.random() - 0.5) * 8;
      const el = svgEl("circle", { r: kind === "Glu" ? 3 : 3.5, fill: k.col }, c.ions);
      ions.push({
        el,
        x: px,
        y: k.dir > 0 ? 40 + Math.random() * 30 : 140 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 20,
        dir: k.dir,
        life: 0,
      });
    };
    let sec = 0;
    let stage = 0;
    let acc = 0;
    const intensity = () => {
      if (sec <= 0) return 0;
      if (sec < 10 * MIN) return 1;
      if (sec < 6 * HOUR) return 0.25;
      return 0;
    };
    const update = (fromSlider = true) => {
      const u = slider.value / 1000;
      sec = secAt(u);
      stage = Math.max(0, stageAt(sec));
      const S = STAGES[stage];
      $("tbi1-stage-when").textContent = S.when;
      $("tbi1-stage-title").textContent = S.title;
      $("tbi1-stage-text").textContent = S.text;
      document.querySelectorAll("#tbi1-stage-btns .tbi-btn").forEach((b, i) => b.setAttribute("aria-pressed", String(i === stage)));
      const label =
        sec <= 0
          ? "Before the injury"
          : sec < 60
            ? `${Math.round(sec)} s after`
            : sec < HOUR
              ? `${Math.round(sec / 60)} min after`
              : sec < DAY
                ? `${Math.round(sec / HOUR)} h after`
                : sec < 60 * DAY
                  ? `${Math.round(sec / DAY)} days after`
                  : sec < 3.0e7
                    ? `${Math.round(sec / (30 * DAY))} months after`
                    : "A year after";
      timeLab.textContent = label;
      slider.setAttribute("aria-valuetext", `${label}: ${S.title}`);
      if (cx) {
        const x = cx(Math.max(U0, u));
        curveMarker.setAttribute("x1", x);
        curveMarker.setAttribute("x2", x);
        curveDot.setAttribute("cx", x);
        curveDot.setAttribute("cy", cy(glucose(sec)));
        curveDot.setAttribute("opacity", u < U0 ? 0.4 : 1);
      }
      if (c.atp) {
        const energy = stage === 0 ? 0.85 : stage === 1 ? 0.55 : stage === 2 ? 0.2 : stage === 3 ? 0.4 : stage === 4 ? 0.6 : 0.78;
        c.atp.setAttribute("height", 76 * energy);
        c.atp.setAttribute("y", 130 + 76 * (1 - energy));
        c.atp.setAttribute("fill", energy < 0.3 ? "var(--tbi-injury)" : energy < 0.5 ? "var(--tbi-metab)" : "var(--tbi-musc)");
        c.pores.forEach((p) => p.setAttribute("opacity", stage === 1 ? 1 : stage === 2 ? 0.5 : 0));
        const caLoad = stage >= 3 && stage <= 4 ? 1 : stage === 2 ? 0.5 : stage === 5 ? 0.3 : 0;
        clear(c.mitoCa);
        for (let i = 0; i < Math.round(caLoad * 7); i++)
          svgEl("circle", { cx: 98 + i * 7.5, cy: 172 + (i % 2) * 14, r: 2.6, fill: "var(--tbi-injury)" }, c.mitoCa);
        c.mito.setAttribute("fill-opacity", stage >= 3 && stage <= 4 ? 0.15 : 0.35);
        const collapse = stage >= 4 ? (stage === 4 ? 1 : 0.6) : 0;
        c.bars.forEach((b, i) => {
          const tilt = collapse * (i % 2 ? 9 : -9);
          b.setAttribute("x1", 180 + i * 14 - tilt);
          b.setAttribute("x2", 180 + i * 14 + tilt);
          b.setAttribute("stroke", collapse ? "var(--tbi-injury)" : "var(--global-text-color-light)");
        });
        if (RM || fromSlider === "static") {
          clear(c.ions);
          ions.length = 0;
          if (stage === 1)
            ["K", "Na", "Ca", "Glu", "K", "Na"].forEach((k, i) =>
              svgEl("circle", { cx: pores[i % 3] + (i > 2 ? 10 : -10), cy: KIND[k].dir > 0 ? 125 : 70, r: 3.5, fill: KIND[k].col }, c.ions)
            );
        }
      }
      if (!RM) ionLoop.wake();
    };
    const ionLoop = loop(cell, (dt) => {
      const inten = intensity();
      acc += dt * inten * 26;
      const kinds = ["K", "Na", "Ca", "Glu"];
      while (acc > 1) {
        acc -= 1;
        if (ions.length < 70) spawn(kinds[Math.floor(Math.random() * 4)]);
      }
      for (let i = ions.length - 1; i >= 0; i--) {
        const p = ions[i];
        p.y += p.dir * 70 * dt;
        p.x += p.vx * dt;
        p.life += dt;
        const gone = p.dir > 0 ? p.y > 225 : p.y < 26;
        p.el.setAttribute("cx", p.x.toFixed(1));
        p.el.setAttribute("cy", p.y.toFixed(1));
        p.el.setAttribute("opacity", gone ? 0 : Math.min(1, p.life * 4));
        if (gone) {
          p.el.remove();
          ions.splice(i, 1);
        }
      }
      const spin = stage === 2 ? 14 : stage === 1 ? 8 : stage === 0 ? 1.5 : 0.8;
      c.pumps.forEach((p) => {
        p.rot = (p.rot + spin * dt * 60) % 360;
        p.arm.setAttribute("transform", `rotate(${p.rot.toFixed(1)})`);
      });
      if (playing) {
        const v = Math.min(1000, +slider.value + dt * 95);
        slider.value = v;
        update(true);
        if (v >= 1000) {
          playing = false;
          playBtn.textContent = "Play again";
        }
      }
      return true;
    });
    let playing = false;
    playBtn.addEventListener("click", () => {
      if (RM) {
        const next = STAGES.findIndex((s, i) => i > stage);
        const target = next < 0 ? 0 : next;
        slider.value = target === 0 ? 0 : Math.round(uAt(Math.sqrt(STAGES[target].from * Math.min(STAGES[target].to, 3.15e7))) * 1000);
        update("static");
        playBtn.textContent = "Next stage";
        return;
      }
      if (+slider.value >= 1000) slider.value = 0;
      playing = true;
      playBtn.textContent = "Playing…";
      ionLoop.wake();
    });
    slider.addEventListener("input", () => {
      playing = false;
      playBtn.textContent = "Play";
      update(RM ? "static" : true);
    });
    const btns = $("tbi1-stage-btns");
    STAGES.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tbi-btn";
      b.textContent = ["At rest", "Ion flux", "Energy crisis", "Slump", "Axons", "Chronic"][i];
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        playing = false;
        playBtn.textContent = "Play";
        slider.value = i === 0 ? 0 : Math.round(uAt(Math.sqrt(s.from * Math.min(s.to, 3.15e7))) * 1000);
        update(RM ? "static" : true);
      });
      btns.appendChild(b);
    });
    buildCell();
    buildCurve();
    update(RM ? "static" : true);
    onResize(curve, buildCurve);
  })();

  /* ---------------------------------------------------------------- 392 trial comparisons */
  (() => {
    const canvas = $("tbi1-rct");
    if (!canvas) return;
    const btn = $("tbi1-rct-btn");
    const read = $("tbi1-rct-read");
    const N = 392;
    const NO = Math.round(0.74 * N);
    let rng = 3;
    const rand = () => ((rng = (rng * 16807) % 2147483647) - 1) / 2147483646;
    const order = Array.from({ length: N }, (_, i) => i).sort(() => rand() - 0.5);
    const isNo = new Array(N).fill(false);
    order.slice(0, NO).forEach((i) => (isNo[i] = true));
    let on = false;
    let k = 0;
    let ctx;
    let W;
    let H;
    const draw = () => {
      const f = T.fitCanvas(canvas);
      ctx = f.ctx;
      W = f.width;
      H = f.height;
      const cols = 28;
      const rows = 14;
      const cell = Math.min(W / cols, H / rows);
      const r = cell * 0.36;
      const accent = T.cssVar("--global-theme-color");
      const ink2 = T.cssVar("--global-text-color-light");
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const x = ((i % cols) + 0.5) * cell;
        const y = (Math.floor(i / cols) + 0.5) * cell;
        const fade = isNo[i] ? k : 0;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (fade > 0.5) {
          ctx.strokeStyle = ink2;
          ctx.globalAlpha = 0.6;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.fillStyle = accent;
          ctx.globalAlpha = 1 - fade * 0.8;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    const anim = loop(canvas, (dt) => {
      const goal = on ? 1 : 0;
      k += Math.sign(goal - k) * dt * 2.2;
      k = clamp(k, 0, 1);
      draw();
      return k !== goal;
    });
    btn.addEventListener("click", () => {
      on = !on;
      btn.setAttribute("aria-pressed", String(on));
      read.textContent = on
        ? `Hollow: the 74% of comparisons (about ${NO}) that found no significant difference between groups. Solid: the remaining ${N - NO} or so, which include harms as well as benefits.`
        : "392 comparisons from 191 completed randomised trials of acute care for moderate and severe TBI.";
      if (RM) {
        k = on ? 1 : 0;
        draw();
      } else anim.wake();
    });
    draw();
    window.addEventListener("resize", draw);
    T.onThemeChange(draw);
  })();

  /* ---------------------------------------------------------------- Glasgow Coma Scale */
  (() => {
    const root = $("tbi1-gcs");
    if (!root) return;
    const COMP = [
      {
        key: "E",
        name: "Eye opening",
        opts: [
          [4, "Spontaneous"],
          [3, "To sound"],
          [2, "To pressure"],
          [1, "None"],
          ["NT", "Not testable"],
        ],
      },
      {
        key: "V",
        name: "Verbal response",
        opts: [
          [5, "Orientated"],
          [4, "Confused"],
          [3, "Words"],
          [2, "Sounds"],
          [1, "None"],
          ["NT", "Not testable"],
        ],
      },
      {
        key: "M",
        name: "Motor response",
        opts: [
          [6, "Obeys commands"],
          [5, "Localising"],
          [4, "Normal flexion"],
          [3, "Abnormal flexion"],
          [2, "Extension"],
          [1, "None"],
          ["NT", "Not testable"],
        ],
      },
    ];
    const state = { E: 4, V: 5, M: 6 };
    const groups = COMP.map((c) => {
      const fs = document.createElement("fieldset");
      const lg = document.createElement("legend");
      lg.textContent = c.name;
      lg.id = `tbi1-gcs-${c.key}`;
      fs.appendChild(lg);
      const grp = document.createElement("div");
      grp.setAttribute("role", "radiogroup");
      grp.setAttribute("aria-labelledby", lg.id);
      const btns = c.opts.map(([v, t]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tbi1-opt";
        b.setAttribute("role", "radio");
        b.dataset.v = v;
        b.innerHTML = `<span class="tbi1-opt-n">${v}</span><span>${t}</span>`;
        b.addEventListener("click", () => set(c.key, v, true));
        b.addEventListener("keydown", (e) => {
          const i = btns.indexOf(b);
          let j = null;
          if (e.key === "ArrowDown" || e.key === "ArrowRight") j = (i + 1) % btns.length;
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = (i - 1 + btns.length) % btns.length;
          if (j === null) return;
          e.preventDefault();
          set(c.key, c.opts[j][0], true);
        });
        grp.appendChild(b);
        return b;
      });
      fs.appendChild(grp);
      root.appendChild(fs);
      return { key: c.key, btns };
    });
    const scale = $("tbi1-gcs-scale");
    const pos = (s) => ((s - 2.5) / 13) * 100;
    [
      [3, 8, "Severe 3–8", "var(--tbi-injury)"],
      [9, 12, "Moderate 9–12", "var(--tbi-metab)"],
      [13, 15, "Mild 13–15", "var(--global-theme-color)"],
    ].forEach(([a, b, t, col]) => {
      const d = document.createElement("div");
      d.className = "tbi1-scale-band";
      d.style.left = `calc(${pos(a - 0.5 + 0.5)}% - ${100 / 26}%)`;
      d.style.width = `calc(${pos(b + 0.5) - pos(a - 0.5)}% - 3px)`;
      d.style.left = `${pos(a - 0.5)}%`;
      d.style.background = col;
      d.style.opacity = "0.8";
      const s = document.createElement("span");
      s.textContent = t;
      d.appendChild(s);
      scale.appendChild(d);
    });
    const pin = document.createElement("div");
    pin.className = "tbi1-scale-pin";
    scale.appendChild(pin);
    const set = (key, v, focus) => {
      state[key] = v;
      const g = groups.find((x) => x.key === key);
      g.btns.forEach((b) => {
        const sel = String(b.dataset.v) === String(v);
        b.setAttribute("aria-checked", String(sel));
        b.tabIndex = sel ? 0 : -1;
        if (sel && focus) b.focus();
      });
      render();
    };
    const render = () => {
      const tot = $("tbi1-gcs-total");
      const read = $("tbi1-gcs-read");
      const code = `E${state.E} V${state.V} M${state.M}`;
      if ([state.E, state.V, state.M].includes("NT")) {
        tot.textContent = "–";
        pin.style.opacity = "0";
        read.innerHTML = `<strong>${code}</strong>. One component cannot be tested, so the official guidance is to report the components and not a total. Studies that sort people by the total have to drop or impute these cases.`;
        return;
      }
      const s = state.E + state.V + state.M;
      tot.textContent = s;
      pin.style.opacity = "1";
      pin.style.left = `${pos(s)}%`;
      const band = s >= 13 ? "mild" : s >= 9 ? "moderate" : "severe";
      const extra =
        s >= 13
          ? "Everyone in this band counts as “mild TBI”, which is where more than nine in ten injuries fall and where my project’s cohort came from."
          : s >= 9
            ? "Moderate TBI."
            : "Severe TBI; 8 or less is also the conventional threshold for coma.";
      read.innerHTML = `<strong>${code}</strong>: a total of ${s}, in the <strong>${band}</strong> band. ${extra}`;
    };
    groups.forEach((g) => set(g.key, state[g.key], false));
  })();

  /* ---------------------------------------------------------------- recovery waffle */
  (() => {
    const grid = $("tbi1-waffle");
    if (!grid) return;
    const GROUPS = [
      {
        id: "t2w",
        btn: "Mild TBI, 2 weeks",
        v: 87,
        text: "TRACK-TBI, mild TBI, two weeks after injury: 87% reported some injury-related limitation.",
      },
      {
        id: "t12",
        btn: "Mild TBI, 12 months",
        v: 53,
        text: "TRACK-TBI, mild TBI, twelve months after injury: 53% (95% CI 49 to 56%) had not fully recovered.",
      },
      {
        id: "o12",
        btn: "Orthopaedic injury, 12 months",
        v: 38,
        text: "TRACK-TBI’s comparison group of people with orthopaedic injuries, twelve months on: 38%. The gap with the mild TBI group is the part harder to explain away.",
      },
      {
        id: "cer",
        btn: "Sent home from ER, 6 months",
        v: 30,
        text: "CENTER-TBI, people discharged from the emergency department: 30% had not fully recovered six months later.",
      },
      { id: "cad", btn: "Admitted to a ward, 6 months", v: 53, text: "CENTER-TBI, people admitted to a ward: 53% at six months." },
      { id: "cic", btn: "Intensive care, 6 months", v: 84, text: "CENTER-TBI, people admitted to intensive care: 84% at six months." },
    ];
    const cells = Array.from({ length: 100 }, () => {
      const d = document.createElement("div");
      d.className = "tbi1-cell";
      grid.appendChild(d);
      return d;
    });
    const num = $("tbi1-waffle-num");
    const read = $("tbi1-waffle-read");
    let shown = 0;
    let numTimer = null;
    const show = (g) => {
      const prev = shown;
      shown = g.v;
      cells.forEach((c, i) => {
        const on = i < g.v;
        const d = RM ? 0 : Math.abs(i - (on ? prev : g.v)) * 8;
        c.style.transitionDelay = `${d}ms`;
        c.classList.toggle("is-on", on);
      });
      grid.setAttribute("aria-label", `${g.v} of 100 dots filled: ${g.text}`);
      read.textContent = g.text;
      document.querySelectorAll("#tbi1-waffle-btns .tbi-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.g === g.id)));
      clearInterval(numTimer);
      if (RM) {
        num.textContent = `${g.v}`;
        return;
      }
      let cur = prev;
      numTimer = setInterval(() => {
        cur += Math.sign(g.v - cur) * Math.max(1, Math.round(Math.abs(g.v - cur) / 6));
        num.textContent = `${cur}`;
        if (cur === g.v) clearInterval(numTimer);
      }, 30);
    };
    const bar = $("tbi1-waffle-btns");
    GROUPS.forEach((g) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tbi-btn";
      b.dataset.g = g.id;
      b.textContent = g.btn;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => show(g));
      bar.appendChild(b);
    });
    read.textContent = GROUPS[0].text;
    document.querySelector("#tbi1-waffle-btns .tbi-btn").setAttribute("aria-pressed", "true");
    T.onVisible(grid, () => show(GROUPS[0]), 0.4);
  })();

  /* ---------------------------------------------------------------- the long tail timeline */
  (() => {
    const svg = $("tbi1-tl");
    if (!svg) return;
    const slider = $("tbi1-tl-t");
    const label = $("tbi1-tl-time");
    const read = $("tbi1-tl-read");
    const playBtn = $("tbi1-tl-play");
    const MAXD = 7300;
    // Findings, placed at the time point each study reports. `day: null` sits in the "over the long run" lane.
    const MARKS = [
      { day: 14, when: "2 weeks", text: "87% of people with mild TBI report some functional limitation (TRACK-TBI).", nodes: ["func"] },
      {
        day: 91,
        when: "3 months",
        text: "Probable PTSD and/or major depression in 20.0% after mild TBI, against 8.7% after an orthopaedic injury (TRACK-TBI).",
        nodes: ["ptsd", "dep"],
      },
      {
        day: 182,
        when: "First 6 months",
        text: "Dementia risk is highest soon after injury: a hazard ratio of 4.06 in the first six months (Denmark, 2.79 million people).",
        nodes: ["dem"],
      },
      {
        day: 365,
        when: "12 months",
        text: "53% of people with mild TBI have not fully recovered, against 38% of orthopaedic patients (TRACK-TBI).",
        nodes: [],
      },
      {
        day: 1275,
        when: "Median 3.5 years",
        text: "New conditions appear at a median of 3.49 years. After mild TBI: high blood pressure HR 2.5, diabetes HR 1.9, stroke HR 2.2; in 18 to 40 year olds, high blood pressure HR 5.9 (US health system, up to 10 years).",
        nodes: ["ht", "dia", "stroke"],
      },
      {
        day: 1826,
        when: "5 years",
        text: "After mild TBI in TBIMS, diagnosed since the injury: anxiety 16.1%, depression 15.7%, chronic pain 15.7%, high blood pressure 14.0%, PTSD 11.2%.",
        nodes: ["anx", "pain"],
      },
      {
        day: null,
        when: "Over the long run",
        text: "Any TBI: dementia HR 1.24, rising with the number of injuries. Mild TBI: suicide IRR 1.81 (Denmark). After inpatient rehabilitation in TBIMS: life expectancy about 9 years shorter.",
        nodes: ["sui", "life"],
      },
    ];
    const NODES = {
      func: { label: "Functional limits", cat: "--tbi-other" },
      ptsd: { label: "PTSD", cat: "--tbi-psych" },
      dep: { label: "Depression", cat: "--tbi-psych" },
      dem: { label: "Dementia", cat: "--tbi-neuro" },
      ht: { label: "High blood pressure", cat: "--tbi-cardio" },
      dia: { label: "Diabetes", cat: "--tbi-metab" },
      stroke: { label: "Stroke", cat: "--tbi-cardio" },
      anx: { label: "Anxiety", cat: "--tbi-psych" },
      pain: { label: "Chronic pain", cat: "--tbi-musc" },
      sui: { label: "Suicide", cat: "--tbi-psych" },
      life: { label: "Shorter life", cat: "--tbi-injury" },
    };
    // Node positions as fractions of the plot (x) and of the cloud height (y); they gather above the marker that introduces them.
    const NODEPOS = {
      func: [0.27, 0.78],
      ptsd: [0.43, 0.6],
      dep: [0.5, 0.85],
      dem: [0.52, 0.3],
      ht: [0.7, 0.85],
      dia: [0.73, 0.52],
      stroke: [0.66, 0.2],
      anx: [0.84, 0.72],
      pain: [0.82, 0.32],
      sui: [0.96, 0.5],
      life: [0.96, 0.88],
    };
    let x;
    let u = 0;
    let marks = [];
    let nodes = {};
    let pinned = null;
    const dayAt = (v) => (v <= 0 ? 0 : Math.pow(10, v * Math.log10(MAXD * 1.6)));
    const build = () => {
      clear(svg);
      const narrow = isNarrow(svg);
      const Wd = narrow ? 360 : 640;
      const Hh = narrow ? 360 : 330;
      svg.setAttribute("viewBox", `0 0 ${Wd} ${Hh}`);
      const L = 16;
      const R = Wd - (narrow ? 40 : 60);
      const axisY = Hh - 44;
      const longX = Wd - (narrow ? 20 : 30);
      x = (day) => (day === null ? longX : L + (Math.log10(Math.max(1, day)) / Math.log10(MAXD)) * (R - L));
      const ax = svgEl("g", { class: "tbi1-axis" }, svg);
      svgEl("line", { x1: L, x2: R, y1: axisY, y2: axisY }, ax);
      svgEl("line", { x1: R + 8, x2: longX + 10, y1: axisY, y2: axisY, "stroke-dasharray": "2 4" }, ax);
      (narrow
        ? [
            [1, "injury"],
            [30, "1 mo"],
            [365, "1 yr"],
            [3650, "10 yr"],
          ]
        : [
            [1, "injury"],
            [7, "1 week"],
            [30, "1 month"],
            [365, "1 year"],
            [1826, "5 years"],
            [7300, "20 years"],
          ]
      ).forEach(([d, t]) => {
        svgEl("line", { x1: x(d), x2: x(d), y1: axisY - 4, y2: axisY + 4 }, ax);
        svgEl("text", { x: x(d), y: axisY + 30, "text-anchor": d === 1 ? "start" : "middle" }, ax, t);
      });
      svgEl("text", { x: longX, y: axisY + 30, "text-anchor": "middle" }, ax, "long run");
      if (!narrow)
        svgEl(
          "text",
          { x: x(7300), y: axisY + 42, "text-anchor": "end", class: "tbi1-svg-small" },
          svg,
          "outcomes still changing up to two decades on"
        );
      // Progress line.
      svg.__prog = svgEl(
        "line",
        { x1: L, x2: L, y1: axisY, y2: axisY, stroke: "var(--global-theme-color)", "stroke-width": 3, "stroke-linecap": "round" },
        svg
      );
      // Nodes.
      const cloudTop = 18;
      const cloudBot = axisY - 46;
      nodes = {};
      Object.entries(NODEPOS).forEach(([id, [fx, fy]]) => {
        const g = svgEl("g", { opacity: 0 }, svg);
        g.style.transition = RM ? "none" : "opacity 0.6s";
        const nx = L + fx * (longX - L);
        const ny = cloudTop + fy * (cloudBot - cloudTop);
        const cx = narrow ? Math.min(nx, Wd - 34) : nx;
        svgEl("circle", { cx, cy: ny, r: 8, fill: `var(${NODES[id].cat})` }, g);
        svgEl("text", { x: cx, y: ny + 22, "text-anchor": "middle", class: "tbi1-svg-label" }, g, NODES[id].label);
        nodes[id] = g;
      });
      // Markers.
      marks = MARKS.map((m) => {
        const g = svgEl("g", { class: "tbi1-tl-mark", tabindex: 0, role: "button", "aria-label": `${m.when}: ${m.text}` }, svg);
        const mx = x(m.day);
        svgEl(
          "line",
          {
            x1: mx,
            x2: mx,
            y1: axisY,
            y2: cloudBot + 10,
            stroke: "var(--global-text-color-light)",
            "stroke-opacity": 0.25,
            "stroke-dasharray": "2 3",
          },
          g
        );
        const c = svgEl(
          "circle",
          { cx: mx, cy: axisY, r: 6, fill: "var(--global-theme-color)", "fill-opacity": 0.25, stroke: "var(--global-bg-color)", "stroke-width": 2 },
          g
        );
        svgEl("circle", { cx: mx, cy: axisY, r: 14, fill: "transparent" }, g);
        const pick = () => {
          pinned = m;
          read.innerHTML = `<strong>${m.when}.</strong> ${m.text}`;
        };
        g.addEventListener("click", () => {
          pick();
          // Clicking a marker also moves time to it, so its conditions appear.
          const target = m.day === null ? 1 : Math.log10(m.day) / Math.log10(MAXD * 1.6) + 0.001;
          if (target > u) setU(target);
        });
        g.addEventListener("pointerenter", pick);
        g.addEventListener("focus", pick);
        return { m, c };
      });
      setU(u, true);
    };
    const setU = (v, silent) => {
      u = clamp(v, 0, 1);
      slider.value = Math.round(u * 1000);
      const day = dayAt(u);
      const longRun = u >= 0.999;
      const passed = MARKS.filter((m) => (m.day === null ? longRun : day >= m.day));
      const lit = new Set(passed.flatMap((m) => m.nodes));
      Object.entries(nodes).forEach(([id, g]) => g.setAttribute("opacity", lit.has(id) ? 1 : 0));
      marks.forEach(({ m, c }) => {
        const on = passed.includes(m);
        c.setAttribute("fill-opacity", on ? 1 : 0.25);
        c.setAttribute("r", on ? 7 : 6);
      });
      const prog = svg.__prog;
      if (prog) prog.setAttribute("x2", longRun ? x(null) : x(Math.min(MAXD, Math.max(1, day))));
      const txt =
        u <= 0
          ? "The day of injury"
          : longRun
            ? "Over the long run"
            : day < 30
              ? `${Math.round(day)} days`
              : day < 365
                ? `${Math.round(day / 30.4)} months`
                : day < MAXD
                  ? `${(day / 365).toFixed(day < 3650 ? 1 : 0)} years`
                  : "20 years and beyond";
      label.textContent = txt;
      slider.setAttribute("aria-valuetext", txt);
      if (!silent) {
        const last = passed[passed.length - 1];
        if (last && last !== pinned) {
          pinned = last;
          read.innerHTML = `<strong>${last.when}.</strong> ${last.text}`;
        } else if (!last) read.textContent = "Drag the slider or press Play to move forward in time.";
      }
    };
    let playing = false;
    const anim = loop(svg, (dt) => {
      if (!playing) return false;
      setU(u + dt * 0.11);
      if (u >= 1) {
        playing = false;
        playBtn.textContent = "Play again";
      }
      return playing;
    });
    playBtn.addEventListener("click", () => {
      if (u >= 1) setU(0);
      if (RM) {
        const next = MARKS.find((m) => m.day === null || dayAt(u) < m.day);
        setU(next.day === null ? 1 : Math.log10(next.day) / Math.log10(MAXD * 1.6) + 0.001);
        playBtn.textContent = "Next finding";
        return;
      }
      playing = true;
      playBtn.textContent = "Playing…";
      anim.wake();
    });
    slider.addEventListener("input", () => {
      playing = false;
      playBtn.textContent = "Play";
      setU(slider.value / 1000);
    });
    read.textContent = "Drag the slider or press Play to move forward in time.";
    build();
    onResize(svg, build);
  })();

  /* ---------------------------------------------------------------- five-year conditions and their links */
  (() => {
    const svg = $("tbi1-links");
    if (!svg) return;
    const btn = $("tbi1-links-btn");
    const read = $("tbi1-links-read");
    const dataUrl = svg.closest("figure").dataset.src || "/assets/data/tbi/part1/top10-links.json";
    // Sudhakar et al. 2023, Table 1/2: diagnosed at the time of or after the injury, 5-year follow-up, mild TBI.
    const COND = [
      { id: "Anxiety", label: "Anxiety", p: 16.14, x: 36, n: 223, cat: "--tbi-psych", pos: [0.3, 0.3], m: [0.28, 0.2] },
      { id: "Depression", label: "Depression", p: 15.7, x: 35, n: 223, cat: "--tbi-psych", pos: [0.14, 0.58], m: [0.2, 0.44] },
      { id: "ChronicPain", label: "Chronic pain", p: 15.7, x: 35, n: 223, cat: "--tbi-musc", pos: [0.53, 0.5], m: [0.62, 0.42] },
      { id: "Hypertension", label: "High blood pressure", p: 14.04, x: 32, n: 228, cat: "--tbi-cardio", pos: [0.8, 0.28], m: [0.7, 0.68] },
      { id: "PTSD", label: "PTSD", p: 11.16, x: 25, n: 224, cat: "--tbi-psych", pos: [0.33, 0.78], m: [0.42, 0.6] },
      { id: "HighBloodCholesterol", label: "High cholesterol", p: 10.27, x: 23, n: 224, cat: "--tbi-cardio", pos: [0.9, 0.56], m: [0.84, 0.86] },
      { id: "Cataracts", label: "Cataracts", p: 9.38, x: 21, n: 224, cat: "--tbi-other", pos: [0.92, 0.88], m: [0.18, 0.92] },
      { id: "SleepDisorder", label: "Sleep disorder", p: 8.52, x: 19, n: 223, cat: "--tbi-neuro", pos: [0.55, 0.15], m: [0.8, 0.14] },
      { id: "PanicAttacks", label: "Panic attacks", p: 8.48, x: 19, n: 224, cat: "--tbi-psych", pos: [0.12, 0.16], m: [0.55, 0.22] },
      { id: "Osteoarthritis", label: "Osteoarthritis", p: 6.22, x: 14, n: 225, cat: "--tbi-musc", pos: [0.68, 0.8], m: [0.48, 0.84] },
    ];
    let edges = [];
    let shown = false;
    let lines = [];
    let groups = {};
    const build = () => {
      clear(svg);
      const narrow = isNarrow(svg);
      const Wd = narrow ? 380 : 640;
      const Hh = narrow ? 440 : 400;
      svg.setAttribute("viewBox", `0 0 ${Wd} ${Hh}`);
      const pad = narrow ? 44 : 60;
      const P = (c) => {
        const [fx, fy] = narrow ? c.m : c.pos;
        return [pad + fx * (Wd - 2 * pad), pad * 0.7 + fy * (Hh - 1.6 * pad)];
      };
      const rad = (c) => (narrow ? 4 : 6) + Math.sqrt(c.p) * (narrow ? 4.2 : 5.4);
      const lg = svgEl("g", {}, svg);
      lines = edges.map((e) => {
        const a = COND.find((c) => c.id === e.source);
        const b = COND.find((c) => c.id === e.target);
        const [x1, y1] = P(a);
        const [x2, y2] = P(b);
        const len = Math.hypot(x2 - x1, y2 - y1);
        const l = svgEl(
          "line",
          {
            x1,
            y1,
            x2,
            y2,
            class: "tbi1-link",
            "stroke-width": 1 + e.phi * 9,
            "stroke-opacity": shown ? 0.55 : 0,
            "stroke-dasharray": len,
            "stroke-dashoffset": shown ? 0 : len,
          },
          lg
        );
        return { l, e, len };
      });
      groups = {};
      COND.forEach((c) => {
        const [cx, cy] = P(c);
        const r = rad(c);
        const g = svgEl("g", { class: "tbi1-node", tabindex: 0, role: "img", "aria-label": `${c.label}: ${c.p}% (${c.x} of ${c.n})` }, svg);
        svgEl("circle", { cx, cy, r, fill: `var(${c.cat})`, "fill-opacity": 0.85, stroke: "var(--global-bg-color)", "stroke-width": 2 }, g);
        const below = cy + r + 14 < Hh - 4;
        svgEl("text", { x: cx, y: below ? cy + r + 14 : cy - r - 6, "text-anchor": "middle" }, g, c.label);
        const tip = () => {
          const deg = edges.filter((e) => e.source === c.id || e.target === c.id);
          const linkTxt = shown
            ? `<br>${deg.length ? `Significantly linked to ${deg.length} of the other nine.` : "No significant link to the other nine."}`
            : "";
          return `<strong>${c.label}</strong><br>${c.p.toFixed(1)}% (${c.x} of ${c.n}) at five years, diagnosed since the injury${linkTxt}`;
        };
        bindTip(g, tip);
        const hl = (on) => {
          if (!shown) return;
          lines.forEach(({ l, e }) => {
            const hit = e.source === c.id || e.target === c.id;
            l.classList.toggle("is-hot", on && hit);
            l.setAttribute("stroke-opacity", on ? (hit ? 0.95 : 0.12) : 0.55);
          });
        };
        g.addEventListener("pointerenter", () => hl(true));
        g.addEventListener("pointerleave", () => hl(false));
        g.addEventListener("focus", () => hl(true));
        g.addEventListener("blur", () => hl(false));
        groups[c.id] = g;
      });
    };
    const reveal = () => {
      shown = !shown;
      btn.setAttribute("aria-pressed", String(shown));
      btn.textContent = shown ? "Hide the links" : "Draw the links the data support";
      lines.forEach(({ l, len }, i) => {
        l.style.transition = RM ? "none" : `stroke-dashoffset 0.9s ease ${i * 60}ms, stroke-opacity 0.4s ease ${i * 60}ms`;
        l.setAttribute("stroke-dashoffset", shown ? 0 : len);
        l.setAttribute("stroke-opacity", shown ? 0.55 : 0);
      });
      read.textContent = shown ? `${edges.length} statistically significant links among these ten conditions. Only cataracts stands alone.` : "";
      svg.setAttribute(
        "aria-label",
        shown
          ? `Ten conditions with ${edges.length} links between them; the psychiatric conditions are tightly interlinked, and cataracts has no links.`
          : "Ten conditions drawn as circles sized by how common they were five years after a mild TBI"
      );
    };
    btn.disabled = true;
    fetch(dataUrl)
      .then((r) => r.json())
      .then((d) => {
        edges = d.edges;
        btn.disabled = false;
        build();
      })
      .catch(() => {
        read.textContent = "The link data could not be loaded.";
      });
    btn.addEventListener("click", reveal);
    build();
    onResize(svg, build);
  })();
  /* ---------------------------------------------------------------- six routes to comorbidity */
  (() => {
    const canvas = $("tbi1-routes");
    if (!canvas) return;
    const N = 400;
    const ROUTES = [
      {
        id: "chance",
        btn: "Chance",
        title: "Plain chance",
        text: "A and B are independent: each person gets each condition at random. Some people still have both, simply because both are common.",
        gen: (r) => ({ A: r() < 0.25, B: r() < 0.25 }),
      },
      {
        id: "cause",
        btn: "One causes the other",
        title: "A causes B",
        text: "Having A makes B more likely (here, B is about three times as likely in people with A), as chronic pain can lead to depression.",
        gen: (r) => {
          const A = r() < 0.25;
          return { A, B: A ? r() < 0.5 : r() < 0.15 };
        },
      },
      {
        id: "mech",
        btn: "Shared mechanism",
        title: "One process, two conditions",
        text: "A hidden process, such as damage to the circuits that regulate emotion, produces both A and B. Neither causes the other, but they arrive together.",
        gen: (r) => {
          const M = r() < 0.2;
          return { A: M ? r() < 0.7 : r() < 0.12, B: M ? r() < 0.7 : r() < 0.12 };
        },
      },
      {
        id: "risk",
        btn: "Shared risk factor",
        title: "A common cause outside both: age",
        text: "Older people (shaded squares) are more likely to have both A and B, as with high blood pressure and cataracts. Look only within the older people, or only within the younger, and A and B are unrelated.",
        extra: "Shaded square: older person",
        gen: (r) => {
          const Z = r() < 0.4;
          return { Z, A: Z ? r() < 0.45 : r() < 0.1, B: Z ? r() < 0.45 : r() < 0.1 };
        },
      },
      {
        id: "treat",
        btn: "Treatment side effect",
        title: "The treatment for A brings on B",
        text: "Most people with A are treated, and the treatment raises the risk of B. Remove the treatment and the link would disappear.",
        gen: (r) => {
          const A = r() < 0.25;
          const T = A && r() < 0.7;
          return { A, B: T ? r() < 0.45 : r() < 0.15 };
        },
      },
      {
        id: "detect",
        btn: "Detection",
        title: "Seen more because looked for more",
        text: "A and B are truly independent here, but people already being treated for A see doctors more, so 90% of their B gets diagnosed, against 40% in everyone else. The link is in the records, not in the bodies.",
        gen: (r) => {
          const A = r() < 0.25;
          const trueB = r() < 0.3;
          return { A, B: trueB && (A ? r() < 0.9 : r() < 0.4) };
        },
      },
    ];
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    let people = [];
    let route = ROUTES[0];
    let ctx;
    let W;
    let H;
    const draw = () => {
      const f = T.fitCanvas(canvas);
      ctx = f.ctx;
      W = f.width;
      H = f.height;
      const cols = 20;
      const cell = Math.min(W, H) / cols;
      const r = cell * 0.36;
      const a = T.cssVar("--tbi-psych");
      const b = T.cssVar("--tbi-cardio");
      const ink = T.cssVar("--global-text-color");
      const faint = T.cssVar("--tbi1-faint");
      const soft = T.cssVar("--tbi-rule");
      ctx.clearRect(0, 0, W, H);
      people.forEach((p, i) => {
        const x = ((i % cols) + 0.5) * cell;
        const y = (Math.floor(i / cols) + 0.5) * cell;
        if (p.Z) {
          ctx.fillStyle = soft;
          ctx.fillRect(x - cell / 2 + 0.5, y - cell / 2 + 0.5, cell - 1, cell - 1);
        }
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI / 2, (Math.PI * 3) / 2);
        ctx.fillStyle = p.A ? a : faint;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2);
        ctx.fillStyle = p.B ? b : faint;
        ctx.fill();
        if (p.A && p.B) {
          ctx.beginPath();
          ctx.arc(x, y, r + 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      });
    };
    const stats = () => {
      const nA = people.filter((p) => p.A).length;
      const nB = people.filter((p) => p.B).length;
      const both = people.filter((p) => p.A && p.B).length;
      const exp = (nA * nB) / N;
      let html = `<span class="tbi1-big">${both}</span><span>have both A and B</span><span class="tbi1-big">${exp.toFixed(0)}</span><span>would have both by chance alone (${nA} have A, ${nB} have B)</span>`;
      if (route.id === "risk") {
        const old = people.filter((p) => p.Z);
        const oA = old.filter((p) => p.A).length;
        const oB = old.filter((p) => p.B).length;
        const oBoth = old.filter((p) => p.A && p.B).length;
        html += `<span class="tbi1-big">${oBoth}</span><span>have both among the ${old.length} older people, against ${((oA * oB) / old.length).toFixed(0)} expected by chance within that group</span>`;
      }
      $("tbi1-routes-stats").innerHTML = html;
    };
    const select = (rt) => {
      route = rt;
      people = Array.from({ length: N }, () => rt.gen(rand));
      $("tbi1-routes-title").textContent = rt.title;
      $("tbi1-routes-text").textContent = rt.text;
      $("tbi1-routes-extra").textContent = rt.extra || "";
      document.querySelectorAll("#tbi1-routes-btns .tbi-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === rt.id)));
      draw();
      stats();
      const both = people.filter((p) => p.A && p.B).length;
      canvas.setAttribute("aria-label", `${N} simulated people under the route “${rt.title}”: ${both} have both conditions.`);
    };
    const bar = $("tbi1-routes-btns");
    ROUTES.forEach((rt) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tbi-btn";
      b.dataset.r = rt.id;
      b.textContent = rt.btn;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => select(rt));
      bar.appendChild(b);
    });
    select(ROUTES[0]);
    let rt = null;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(draw, 150);
    });
    T.onThemeChange(draw);
  })();
})();
