// Quantum-mechanics widgets for the umbrella-inversion post: classical ball, double-well playground,
// tunnelling in time and the four-potential comparison. Needs inversion-common.js (window.INV).
//
// The file opens with the physics core (a 1D Schrodinger solver); the widgets follow.
(function () {
  const INV = window.INV;
  if (!INV) return;

  // =====================================================================================
  // PHYSICS CORE
  // =====================================================================================
  // We solve  -(hbar^2 / 2m) psi'' + V(x) psi = E psi  for one coordinate x, the mass-weighted
  // inversion coordinate (units: bohr * amu^1/2), so the "mass" is m = 1 amu.
  // In atomic units hbar = 1 and m = AMU_ME electron masses. We keep energies in cm^-1:
  //   kinetic prefactor   hbar^2 / (2 m h^2)  =  HARTREE_CM / (2 AMU_ME h^2)   [cm^-1]
  // for a grid spacing h in bohr * amu^1/2.
  //
  // Method: finite differences on a uniform grid -> symmetric tridiagonal matrix. V is symmetric,
  // so every eigenstate is either even or odd; we solve the two parities separately on the half
  // line x > 0 with a cell-centred grid x_i = (i + 1/2) h, which is half the work and gives the
  // even/odd partners (the "+" and "-" states of a tunnelling pair) as clean separate eigenvalues.
  //   even:  psi(-x) =  psi(x)  ->  mirror boundary adds  -t to the first diagonal entry
  //   odd :  psi(-x) = -psi(x)  ->  mirror boundary adds  +t to the first diagonal entry
  // Eigenvalues: Sturm-sequence bisection (count the negative pivots of the LDL^T factorisation of
  // H - lambda I). Eigenvectors: inverse iteration with a shift sitting on the eigenvalue.
  // Double precision limits how small a splitting we can resolve: a few 1e-13 cm^-1 at best, which is
  // why the widgets never quote a computed splitting below about 1e-9 cm^-1 (see MIN_SPLIT).

  const HARTREE_CM = INV.HARTREE_CM;
  const AMU_ME = INV.AMU_ME;
  const MIN_SPLIT = 1e-9; // cm^-1: splittings below this are not trusted from the solver

  // Number of eigenvalues of the tridiagonal matrix (diag d, constant off-diagonal -t) below lambda.
  const sturmCount = (d, t, lambda) => {
    const t2 = t * t;
    let count = 0;
    let q = d[0] - lambda;
    if (q < 0) count++;
    for (let i = 1; i < d.length; i++) {
      if (q === 0) q = 1e-300;
      q = d[i] - lambda - t2 / q;
      if (q < 0) count++;
    }
    return count;
  };

  // k-th (0-based) eigenvalue by bisection; lo/hi bracket the spectrum.
  const bisect = (d, t, k, lo, hi) => {
    // grow hi if it does not enclose the k-th eigenvalue
    let guard = 0;
    while (sturmCount(d, t, hi) <= k && guard++ < 40) hi = lo + (hi - lo) * 2;
    for (let it = 0; it < 90; it++) {
      const mid = 0.5 * (lo + hi);
      if (sturmCount(d, t, mid) > k) hi = mid;
      else lo = mid;
      if (hi - lo < 1e-13 * (1 + Math.abs(mid))) break;
    }
    return 0.5 * (lo + hi);
  };

  // Eigenvector by inverse iteration (Thomas algorithm on H - (lambda + eps) I).
  const inverseIteration = (d, t, lambda, seed) => {
    const n = d.length;
    const shift = lambda + 1e-9 * Math.max(1, Math.abs(lambda));
    const c = new Float64Array(n);
    const dd = new Float64Array(n);
    const v = new Float64Array(n);
    for (let i = 0; i < n; i++) v[i] = 1 + 0.3 * Math.sin(1.7 * i + seed);
    for (let iter = 0; iter < 3; iter++) {
      // forward elimination
      let piv = d[0] - shift;
      if (Math.abs(piv) < 1e-30) piv = 1e-30;
      dd[0] = piv;
      for (let i = 1; i < n; i++) {
        const m = -t / dd[i - 1];
        let p = d[i] - shift - m * -t;
        if (Math.abs(p) < 1e-30) p = 1e-30;
        dd[i] = p;
        c[i] = m;
      }
      for (let i = 1; i < n; i++) v[i] -= c[i] * v[i - 1];
      v[n - 1] /= dd[n - 1];
      for (let i = n - 2; i >= 0; i--) v[i] = (v[i] + t * v[i + 1]) / dd[i];
      let big = 0;
      for (let i = 0; i < n; i++) big = Math.max(big, Math.abs(v[i]));
      for (let i = 0; i < n; i++) v[i] /= big;
    }
    return v;
  };

  // Solves for the lowest nEach even and nEach odd states of V (a function x -> cm^-1) on |x| <= L.
  // Returns { h, L, x[] (positive-side grid), levels[] sorted by energy }, each level
  //   { E, parity (+1 even / -1 odd), k (index in energy order), psi (Float64Array on x > 0) }.
  // psi is normalised so that the integral of psi^2 over the whole line is 1, and signed so that the
  // left-most lobe is positive (so (psi0+ + psi0-)/sqrt 2 sits in the LEFT well).
  const solve = (Vfn, L, N, nEach) => {
    const h = L / N;
    const t = HARTREE_CM / (2 * AMU_ME * h * h);
    const x = new Float64Array(N);
    const v = new Float64Array(N);
    let vmin = Infinity;
    let vmax = -Infinity;
    for (let i = 0; i < N; i++) {
      x[i] = (i + 0.5) * h;
      v[i] = Vfn(x[i]);
      vmin = Math.min(vmin, v[i]);
      vmax = Math.max(vmax, v[i]);
    }
    const levels = [];
    for (const parity of [1, -1]) {
      const d = new Float64Array(N);
      for (let i = 0; i < N; i++) d[i] = v[i] + 2 * t;
      d[0] += parity === 1 ? -t : t;
      const lo = vmin - 2 * t;
      const hi = Math.min(vmax + 2 * t, vmin + 4e4);
      for (let k = 0; k < nEach; k++) {
        const E = bisect(d, t, k, lo, hi);
        const psi = inverseIteration(d, t, E, k + (parity === 1 ? 0 : 7));
        let norm = 0;
        let peak = 0;
        for (let i = 0; i < N; i++) {
          norm += psi[i] * psi[i];
          peak = Math.max(peak, Math.abs(psi[i]));
        }
        const s = 1 / Math.sqrt(2 * norm * h); // full line = 2 x half line
        for (let i = 0; i < N; i++) psi[i] *= s;
        // sign convention: left-most lobe positive. On the left, psi(-x) = parity * psi(x).
        for (let i = N - 1; i >= 0; i--) {
          if (Math.abs(psi[i]) > 0.3 * peak * s) {
            if (parity * psi[i] < 0) for (let j = 0; j < N; j++) psi[j] = -psi[j];
            break;
          }
        }
        levels.push({ E, parity, psi });
      }
    }
    levels.sort((a, b) => a.E - b.E);
    levels.forEach((lv, k) => (lv.k = k));
    return { h, L, N, x, levels };
  };

  // Value of a level's wavefunction on the whole line, sampled on a symmetric grid (2N points).
  const fullGrid = (sol, step = 1) => {
    const { N, h } = sol;
    const xs = [];
    const idx = [];
    for (let i = N - 1; i >= 0; i -= step) {
      xs.push(-(i + 0.5) * h);
      idx.push(-(i + 1));
    }
    for (let i = 0; i < N; i += step) {
      xs.push((i + 0.5) * h);
      idx.push(i);
    }
    return { xs, idx };
  };
  const psiOn = (lv, idx) => idx.map((j) => (j >= 0 ? lv.psi[j] : lv.parity * lv.psi[-j - 1]));

  // WKB estimate of a tunnelling-pair splitting (Landau-Lifshitz):  dE = (hbar w / pi) exp(-theta),
  // theta = 2 * integral_0^{x_t} sqrt(2 m (V - E)) dx / hbar through the barrier; hbar*w is taken as the
  // spacing between the lowest two pairs. This is an order-of-magnitude estimate, not an eigenvalue.
  const wkbSplit = (Vfn, E, hw) => {
    let xt = 0;
    const dx = 1e-3;
    while (Vfn(xt) > E && xt < 20) xt += dx;
    const n = 2000;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const xm = ((i + 0.5) / n) * xt;
      const kap = Math.sqrt(Math.max(0, (2 * AMU_ME * (Vfn(xm) - E)) / HARTREE_CM));
      sum += kap * (xt / n);
    }
    const theta = 2 * sum;
    return { split: (hw / Math.PI) * Math.exp(-theta), theta };
  };

  // Exact (high-precision) ground-state splittings of the fitted PH3 curves, cm^-1. Double precision here cannot
  // resolve them; WKB agrees within a few per cent. The paper's own Table 8 values sit at the rounding floor.
  const PH_EXACT = { ph: 3.6e-16, phC60: 5.0e-15 };

  // ---- Reference systems (the four fitted potentials of the paper) ----
  const SYS = {};
  const sysSpec = {
    oh: { L: 3.2, N: 900, nEach: 5, paper: { e: INV.LEVELS.oh.ccsdtQZ.e, tag: "CCSD(T)/aug-cc-pVQZ" } },
    ohC60: { L: 3.2, N: 900, nEach: 5, paper: { e: INV.LEVELS.ohC60.b97d.e, tag: "B97D/aug-cc-pVTZ" } },
    ph: { L: 6.5, N: 1000, nEach: 6, paper: { e: INV.LEVELS.ph.b97d.e, tag: "B97D/aug-cc-pVTZ" }, pairs: true },
    phC60: { L: 6.5, N: 1000, nEach: 6, paper: { e: INV.LEVELS.phC60.b97d.e, tag: "B97D/aug-cc-pVTZ" }, pairs: true },
  };
  // Minimum and top of the barrier of a fitted curve, from the curve itself.
  const curveStats = (p) => {
    let xm = 0;
    let vm = Infinity;
    for (let x = 0; x < 8; x += 0.0005) {
      const vv = INV.V(p, x);
      if (vv < vm) {
        vm = vv;
        xm = x;
      }
    }
    return { xmin: xm, vmin: vm, v0: INV.V(p, 0), barrier: INV.V(p, 0) - vm };
  };
  // Lazily solved and cached. Energies are on the paper's scale: the zero of the fitted V(x), which is why the
  // levels agree with Tables 7 and 8 (the well bottom sits a few to a few hundred cm^-1 away from zero).
  const getSystem = (key) => {
    if (SYS[key]) return SYS[key];
    const p = INV.POTENTIALS[key];
    const spec = sysSpec[key];
    const st = curveStats(p);
    const Vfn = (x) => INV.V(p, x);
    const sol = solve(Vfn, spec.L, spec.N, spec.nEach);
    SYS[key] = { key, p, spec, stats: st, V: Vfn, sol, levels: sol.levels };
    return SYS[key];
  };

  INV.quantum = { solve, fullGrid, psiOn, wkbSplit, getSystem, curveStats, MIN_SPLIT };
  if (typeof document === "undefined") return;

  // =====================================================================================
  // SHARED DRAWING HELPERS
  // =====================================================================================
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, parent, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  let uid = 0;
  const nextId = (p) => `${p}-${++uid}`;
  const num = (v, d = 1) => v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = (v) => (Math.round(v) + 0).toLocaleString("en-GB");
  const nice = (v) => (v >= 100 ? int(v) : v >= 10 ? num(v, 1) : v >= 0.1 ? num(v, 2) : INV.sci(v, 2));
  const sgn = (p) => (p > 0 ? "⁺" : "⁻");

  // Human-readable duration: the largest unit in which the number is at least 0.5.
  const TIME_UNITS = [
    ["fs", 1e-15],
    ["ps", 1e-12],
    ["ns", 1e-9],
    ["µs", 1e-6],
    ["ms", 1e-3],
    ["s", 1],
    ["min", 60],
    ["hours", 3600],
    ["days", 86400],
    ["years", 3.156e7],
  ];
  const fmtTime = (s) => {
    let u = TIME_UNITS[0];
    for (const x of TIME_UNITS) if (s / x[1] >= 0.5) u = x;
    const v = s / u[1];
    return `${v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)} ${u[0]}`;
  };

  // Colours are read from the CSS tokens and refreshed when the theme flips.
  const col = {};
  const COLOR_VARS = {
    ink: "--inv-ink",
    ink2: "--inv-ink-2",
    rule: "--inv-rule",
    soft: "--inv-soft",
    free: "--inv-free",
    caged: "--inv-caged",
    pos: "--inv-wave-pos",
    neg: "--inv-wave-neg",
    oh: "--inv-oh",
    ph: "--inv-ph",
    accent: "--inv-accent",
    bg: "--global-bg-color",
  };
  const loadColors = () => {
    for (const [k, v] of Object.entries(COLOR_VARS)) col[k] = INV.cssVar(v) || (k === "bg" ? "#fff" : "#888");
  };
  loadColors();
  const redrawers = [];
  INV.onThemeChange(() => {
    loadColors();
    redrawers.forEach((f) => f());
  });
  const fontFamily = () => getComputedStyle(document.body).fontFamily || "sans-serif";

  const txt = (ctx, s, x, y, o = {}) => {
    ctx.font = `${o.weight || 400} ${o.size || 11}px ${fontFamily()}`;
    ctx.fillStyle = o.color || col.ink2;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "alphabetic";
    ctx.fillText(s, x, y);
  };

  // Plot geometry: box in CSS pixels plus data -> pixel maps.
  const geom = (W, H, m, xr, er) => {
    const l = m.l;
    const r = W - m.r;
    const t = m.t;
    const b = H - m.b;
    return {
      W,
      H,
      l,
      r,
      t,
      b,
      xr,
      er,
      X: (x) => l + ((x - xr[0]) / (xr[1] - xr[0])) * (r - l),
      Y: (e) => b - ((e - er[0]) / (er[1] - er[0])) * (b - t),
      xOf: (px) => xr[0] + ((px - l) / (r - l)) * (xr[1] - xr[0]),
    };
  };

  const niceTicks = (lo, hi, n) => {
    const raw = (hi - lo) / n;
    const p = 10 ** Math.floor(Math.log10(raw));
    const f = raw / p;
    const step = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(v);
    return out;
  };

  // Gridlines, energy ticks, and axis titles in words (technical units in small type).
  const drawAxes = (ctx, g, o = {}) => {
    const small = g.W < 460;
    ctx.lineWidth = 1;
    ctx.strokeStyle = col.rule;
    ctx.globalAlpha = 0.6;
    for (const v of niceTicks(g.er[0], g.er[1], small ? 4 : 5)) {
      const y = Math.round(g.Y(v)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(g.l, y);
      ctx.lineTo(g.r, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      txt(ctx, int(v), g.l - 6, y + 3.5, { align: "right", size: 10 });
      ctx.globalAlpha = 0.6;
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = col.ink2;
    ctx.beginPath();
    ctx.moveTo(g.l + 0.5, g.t);
    ctx.lineTo(g.l + 0.5, g.b + 0.5);
    ctx.lineTo(g.r, g.b + 0.5);
    ctx.stroke();
    // y title
    ctx.save();
    ctx.translate(11, (g.t + g.b) / 2);
    ctx.rotate(-Math.PI / 2);
    const yt = o.yTitle || "energy";
    ctx.font = `400 11px ${fontFamily()}`;
    const tw = ctx.measureText(yt).width;
    txt(ctx, yt, -14, 0, { align: "center", size: 11 });
    txt(ctx, o.ySub || "cm⁻¹", -14 + tw / 2 + 5, 0, { align: "left", size: 9 });
    ctx.restore();
    // x title
    const cx = (g.l + g.r) / 2;
    txt(ctx, o.xTitle || "umbrella coordinate", cx, g.H - 17, { align: "center", size: 11 });
    txt(ctx, o.xSub || "mass-weighted, bohr·amu½", cx, g.H - 5, { align: "center", size: 9 });
    if (o.ends !== false) {
      txt(ctx, "◂ umbrella up", g.l + 4, g.b + 12, { size: 9 });
      txt(ctx, "umbrella down ▸", g.r - 2, g.b + 12, { size: 9, align: "right" });
    }
  };

  const strokeCurve = (ctx, g, fn, color, width, dash) => {
    ctx.beginPath();
    const n = 260;
    let started = false;
    for (let i = 0; i <= n; i++) {
      const x = g.xr[0] + ((g.xr[1] - g.xr[0]) * i) / n;
      const e = fn(x);
      const y = g.Y(e);
      if (!started) {
        ctx.moveTo(g.X(x), y);
        started = true;
      } else ctx.lineTo(g.X(x), y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash || []);
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Outer classical turning point on the right: walks out from xStart until V exceeds E.
  const outerTurning = (Vfn, E, xStart, xCap) => {
    let x = xStart;
    const dx = 0.005;
    while (Vfn(x) < E && x < xCap) x += dx;
    return Math.min(x, xCap);
  };

  // Restricts drawing to the plot box (waves and densities extend past the visible range).
  const clipPlot = (ctx, g) => {
    ctx.beginPath();
    ctx.rect(g.l, g.t - 2, g.r - g.l, g.b - g.t + 2);
    ctx.clip();
  };

  // Draws a wavefunction (or its square) on the baseline of its level, filled with low alpha.
  const drawWave = (ctx, g, lv, grid, scale, prob, color, alpha) => {
    const vals = psiOn(lv, grid.idx);
    const base = g.Y(lv.E);
    ctx.beginPath();
    for (let i = 0; i < vals.length; i++) {
      const v = prob ? vals[i] * vals[i] : vals[i];
      const px = g.X(grid.xs[i]);
      const py = g.Y(lv.E + v * scale);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    const last = g.X(grid.xs[vals.length - 1]);
    const first = g.X(grid.xs[0]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.lineTo(last, base);
    ctx.lineTo(first, base);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Labels for a column of levels; neighbours closer than minGap pixels share one label.
  const placeLabels = (ctx, items, x, color, align = "left") => {
    items.sort((a, b) => a.y - b.y);
    const groups = [];
    for (const it of items) {
      const gp = groups[groups.length - 1];
      if (gp && Math.abs(gp.y - it.y) < 11 && gp.pair === it.pair) {
        gp.merged = true;
        gp.y = (gp.y + it.y) / 2;
      } else groups.push({ ...it });
    }
    for (const gp of groups) txt(ctx, gp.merged ? gp.pair : gp.text, x, gp.y + 3.5, { size: 10, color, align });
  };

  // Debounced redraw on size change.
  const watchSize = (host, draw) => {
    let w = 0;
    const check = () => {
      const nw = Math.round(host.getBoundingClientRect().width);
      if (nw !== w) {
        w = nw;
        draw();
      }
    };
    if ("ResizeObserver" in window) new ResizeObserver(check).observe(host);
    else window.addEventListener("resize", check);
    redrawers.push(draw);
  };

  // Hit-testing of level lines for tooltips: hits = [{x0, x1, y, html}] in CSS pixels.
  const bindHits = (canvas, getHits) => {
    const find = (e) => {
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      let best = null;
      let bd = 8;
      for (const h of getHits()) {
        if (px < h.x0 - 6 || px > h.x1 + 6) continue;
        const d = Math.abs(py - h.y);
        if (d < bd) {
          bd = d;
          best = h;
        }
      }
      return best;
    };
    const show = (e) => {
      const h = find(e);
      if (h) INV.showTooltip(h.html, e);
      else INV.hideTooltip();
      canvas.style.cursor = h ? "pointer" : "";
    };
    canvas.addEventListener("pointermove", (e) => e.pointerType === "mouse" && show(e));
    canvas.addEventListener("pointerup", (e) => e.pointerType !== "mouse" && show(e));
    canvas.addEventListener("pointerleave", () => INV.hideTooltip());
    document.addEventListener("scroll", () => INV.hideTooltip(), { passive: true });
  };

  // Buttons that behave as a radio group via aria-pressed.
  const buttonGroup = (parent, items, onPick, label) => {
    const wrap = el("div", "inv-q-group", parent);
    if (label) wrap.setAttribute("aria-label", label);
    wrap.setAttribute("role", "group");
    const btns = {};
    for (const it of items) {
      const b = el("button", "inv-btn", wrap);
      b.type = "button";
      b.innerHTML = it.html;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => onPick(it.key));
      btns[it.key] = b;
    }
    return {
      set(key) {
        for (const [k, b] of Object.entries(btns)) b.setAttribute("aria-pressed", String(k === key));
      },
    };
  };

  const sliderRow = (parent, label, min, max, step, value, fmt, onInput) => {
    const row = el("div", "inv-range", parent);
    const id = nextId("inv-q-r");
    const lab = el("label", "inv-q-rlabel", row, label);
    lab.htmlFor = id;
    const input = el("input", "", row);
    input.type = "range";
    input.id = id;
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    const out = el("output", "", row);
    out.htmlFor = id;
    const upd = () => (out.textContent = fmt(parseFloat(input.value)));
    input.addEventListener("input", () => {
      upd();
      onInput(parseFloat(input.value));
    });
    upd();
    return {
      input,
      set(v) {
        input.value = v;
        upd();
      },
    };
  };

  // Sets the height of a canvas from its width and returns a ready 2D context.
  const prep = (canvas, ratio, minH, maxH) => {
    const w = canvas.parentElement.getBoundingClientRect().width || 600;
    canvas.style.height = `${Math.round(clamp(w * ratio, minH, maxH))}px`;
    return INV.fitCanvas(canvas);
  };

  // =====================================================================================
  // 1. #inv-ball: classical ball in a double well
  // =====================================================================================
  const initBall = (root) => {
    root.classList.add("inv-q");
    const state = { sys: "oh", E: 0, x: 0, v: 0, crossings: 0, side: -1, play: !INV.reduceMotion, visible: true };
    const info = {};
    const prepSys = (key) => {
      const p = INV.POTENTIALS[key];
      const st = curveStats(p);
      const u = (x) => INV.V(p, x) - st.vmin;
      const d = 0.01;
      const k2 = (u(st.xmin + d) + u(st.xmin - d) - 2 * u(st.xmin)) / (d * d);
      info[key] = { p, st, u, kscale: (2 * Math.PI) ** 2 / (1.6 * 1.6) / k2, xr: key === "oh" ? 2.2 : 5.4, emax: st.barrier * 1.6 };
      const I = info[key];
      I.du = (x) => (u(x + 0.002) - u(x - 0.002)) / 0.004;
    };
    prepSys("oh");
    prepSys("ph");

    const controls = el("div", "inv-controls", root);
    const grp = buttonGroup(
      controls,
      [
        { key: "oh", html: "OH₃⁺ (low barrier)" },
        { key: "ph", html: "PH₃ (high barrier)" },
      ],
      (k) => setSys(k),
      "Choose the molecule's potential"
    );
    const canvas = el("canvas", "inv-q-canvas", root);
    canvas.setAttribute("role", "img");
    const rangeWrap = el("div", "", root);
    const slider = sliderRow(
      rangeWrap,
      "Ball's energy",
      0,
      100,
      1,
      50,
      (v) => `${int(v)} cm⁻¹`,
      (v) => setEnergy(v, true)
    );
    const btnRow = el("div", "inv-controls", root);
    const bKT = el("button", "inv-btn", btnRow, "Set to room temperature");
    const bBar = el("button", "inv-btn", btnRow, "Just above the barrier");
    const bRe = el("button", "inv-btn", btnRow, "Restart ball");
    for (const b of [bKT, bBar, bRe]) b.type = "button";
    const readout = el("div", "inv-readout", root);
    readout.setAttribute("aria-live", "polite");
    const verdict = el("div", "inv-q-verdict", readout);
    const detail = el("div", "inv-q-detail", readout);

    const reset = () => {
      const I = info[state.sys];
      const E = state.E;
      let x0 = -I.st.xmin;
      if (E > 0) {
        x0 = -outerTurning(I.u, E, I.st.xmin, I.xr);
      }
      state.x = x0;
      state.v = 0;
      state.crossings = 0;
      state.side = -1;
    };
    const describe = () => {
      const I = info[state.sys];
      const crosses = state.E >= I.st.barrier;
      const kt = INV.KT_300_CM;
      const mol = state.sys === "oh" ? "OH₃⁺" : "PH₃";
      verdict.textContent = crosses
        ? `Energy above the barrier: the ball crosses over, back and forth${state.crossings ? ` (${state.crossings} crossing${state.crossings > 1 ? "s" : ""} so far)` : ""}.`
        : "Energy below the barrier: the ball is trapped in the left well, forever.";
      verdict.classList.toggle("is-cross", crosses);
      detail.innerHTML = `Ball energy ${int(state.E)} cm⁻¹ = ${num(state.E / I.st.barrier, 2)} × the ${mol} barrier of ${int(I.st.barrier)} cm⁻¹ (from the fitted curve).
        Room-temperature thermal energy kT = ${num(kt, 0)} cm⁻¹, so this barrier is <strong>${num(I.st.barrier / kt, 1)} kT</strong> high.`;
      canvas.setAttribute(
        "aria-label",
        `A ball in the double-well potential of ${mol} with energy ${int(state.E)} wavenumbers. ${crosses ? "It rolls over the barrier between the two wells." : "It stays in the left well."}`
      );
    };
    const setEnergy = (E, fromSlider) => {
      const I = info[state.sys];
      state.E = clamp(E, 0, I.emax);
      if (!fromSlider) slider.set(state.E);
      reset();
      describe();
      draw();
    };
    const setSys = (key) => {
      state.sys = key;
      const I = info[key];
      grp.set(key);
      slider.input.max = Math.round(I.emax);
      slider.input.step = key === "oh" ? 1 : 10;
      setEnergy(0.6 * I.st.barrier);
      slider.set(state.E);
    };
    bKT.addEventListener("click", () => setEnergy(INV.KT_300_CM));
    bBar.addEventListener("click", () => setEnergy(1.04 * info[state.sys].st.barrier));
    bRe.addEventListener("click", () => {
      reset();
      describe();
      draw();
    });

    function draw() {
      const { ctx, width: W, height: H } = prep(canvas, 0.5, 240, 340);
      ctx.clearRect(0, 0, W, H);
      const I = info[state.sys];
      const top = I.emax * 1.04;
      const g = geom(W, H, { l: 52, r: 14, t: 12, b: 46 }, [-I.xr, I.xr], [-top * 0.02, top]);
      drawAxes(ctx, g, { yTitle: "energy above the well bottom" });
      // thermal band
      const kt = INV.KT_300_CM;
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = col.accent;
      ctx.fillRect(g.l, g.Y(kt), g.r - g.l, g.Y(0) - g.Y(kt));
      ctx.globalAlpha = 1;
      txt(ctx, W < 460 ? `kT at 300 K = ${num(kt, 0)}` : `room temperature: kT = ${num(kt, 0)} cm⁻¹`, g.r - 4, Math.min(g.Y(kt) - 4, g.b - 14), {
        align: "right",
        size: 10,
        color: col.accent,
      });
      // barrier line
      const yb = g.Y(I.st.barrier);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = col.ink2;
      ctx.beginPath();
      ctx.moveTo(g.l, yb);
      ctx.lineTo(g.r, yb);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, `barrier ${int(I.st.barrier)} cm⁻¹ ≈ ${num(I.st.barrier / kt, 0)} kT`, g.r - 4, yb - 5, { size: 10, align: "right" });
      // the curve
      const mol = state.sys === "oh" ? col.oh : col.ph;
      strokeCurve(ctx, g, I.u, col.ink, 2.4);
      // energy line over the classically allowed region
      const E = state.E;
      const xo = outerTurning(I.u, E, I.st.xmin, I.xr);
      const xl = -xo;
      let right = xo;
      if (E < I.st.barrier) {
        // the left well's inner turning point: walk from -xmin toward 0
        let x = -I.st.xmin;
        while (I.u(x) < E && x < 0) x += 0.005;
        right = x;
      }
      ctx.strokeStyle = mol;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(g.X(xl), g.Y(E));
      ctx.lineTo(g.X(right), g.Y(E));
      ctx.stroke();
      txt(ctx, `ball's energy ${int(E)} cm⁻¹`, g.l + 6, g.Y(E) - 5, { size: 10, color: mol });
      // ball
      const bx = g.X(state.x);
      const by = g.Y(I.u(state.x));
      ctx.beginPath();
      ctx.arc(bx, by - 7, 7, 0, Math.PI * 2);
      ctx.fillStyle = mol;
      ctx.fill();
      ctx.strokeStyle = col.bg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // simple classical dynamics: x'' = -k V'(x), leapfrog
    let last = 0;
    let running = false;
    const frame = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const I = info[state.sys];
      const n = Math.ceil(dt / (1 / 240));
      const h = dt / n;
      const k = I.kscale;
      for (let i = 0; i < n; i++) {
        state.v += -0.5 * h * k * I.du(state.x);
        state.x += h * state.v;
        state.v += -0.5 * h * k * I.du(state.x);
      }
      const side = state.x < 0 ? -1 : 1;
      if (side !== state.side) {
        state.side = side;
        state.crossings++;
        if (state.E >= I.st.barrier) describe();
      }
      draw();
      requestAnimationFrame(frame);
    };
    const wake = () => {
      if (running || !state.play || !state.visible || INV.reduceMotion) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    };
    const sleep = () => (running = false);
    INV.watchVisibility(root, (v) => {
      state.visible = v;
      if (v) wake();
      else sleep();
    });
    document.addEventListener("visibilitychange", () => (document.hidden ? sleep() : wake()));

    watchSize(root, draw);
    setSys("oh");
    wake();
  };

  // =====================================================================================
  // 2. #inv-well: the quantum playground
  // =====================================================================================
  const initWell = (root) => {
    root.classList.add("inv-q");
    const state = { mode: "generic", Vb: 900, a: 1.3, prob: false };
    let cur = null; // current solution { V, levels, sol, Etop, xr, ... }
    let hits = [];

    const controls = el("div", "inv-controls", root);
    const modes = buttonGroup(
      controls,
      [
        { key: "generic", html: "Generic well" },
        { key: "oh", html: "OH₃⁺" },
        { key: "ph", html: "PH₃" },
      ],
      (k) => setMode(k),
      "Potential"
    );
    const showGrp = buttonGroup(
      controls,
      [
        { key: "psi", html: "ψ" },
        { key: "prob", html: "|ψ|²" },
      ],
      (k) => {
        state.prob = k === "prob";
        showGrp.set(k);
        draw();
      },
      "Draw the wavefunction or its probability"
    );
    const canvas = el("canvas", "inv-q-canvas", root);
    canvas.setAttribute("role", "img");
    const sliders = el("div", "inv-q-sliders", root);
    const sB = sliderRow(
      sliders,
      "Barrier height",
      200,
      6000,
      50,
      state.Vb,
      (v) => `${int(v)} cm⁻¹`,
      (v) => {
        state.Vb = v;
        state.mode = "generic";
        modes.set("generic");
        schedule();
      }
    );
    const sA = sliderRow(
      sliders,
      "Well separation",
      0.6,
      2,
      0.02,
      state.a,
      (v) => `±${num(v, 2)}`,
      (v) => {
        state.a = v;
        state.mode = "generic";
        modes.set("generic");
        schedule();
      }
    );
    const legend = el("div", "inv-legend", root);
    legend.innerHTML = `<span><i class="inv-swatch" style="background:var(--inv-wave-pos)"></i>even state (+)</span>
      <span><i class="inv-swatch" style="background:var(--inv-wave-neg)"></i>odd state (−)</span>
      <span>Separation is in the mass-weighted unit bohr·amu½ (half the distance between the two minima). Generic wells use a simple quartic shape, not a molecule's curve.</span>`;
    const out = el("div", "inv-q-out", root);
    const big = el("div", "inv-q-big", out);
    big.setAttribute("aria-live", "polite");
    const bigNum = el("div", "inv-stat-num", big);
    const bigSub = el("div", "inv-q-bigsub", big);
    const stripWrap = el("div", "inv-q-stripwrap", out);
    const strip = el("canvas", "inv-q-strip", stripWrap);
    strip.setAttribute("role", "img");

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        compute();
        draw();
      });
    };

    const compute = () => {
      if (state.mode === "generic") {
        const { Vb, a } = state;
        const Vfn = (x) => Vb * ((x / a) ** 2 - 1) ** 2;
        const Ecap = Math.max(2.2 * Vb, 6000);
        const L = a * Math.sqrt(1 + Math.sqrt(Ecap / Vb)) + 0.2;
        const sol = solve(Vfn, L, 360, 6);
        const levels = sol.levels.filter((l) => l.E < 0.85 * Ecap);
        const Etop = Math.max(1.5 * Vb, 1.4 * levels[3].E);
        const xr = outerTurning(Vfn, Etop * 1.02, a, L * 0.98);
        cur = { V: Vfn, sol, levels, Etop, ylow: -0.03 * Etop, xr, barrier: Vb, V0: Vb, xmin: a, label: "generic double well", pairs: false };
      } else {
        const sys = getSystem(state.mode);
        const Etop = state.mode === "oh" ? 1750 : 13800;
        const xr = outerTurning(sys.V, Etop * 1.02, sys.stats.xmin, sys.sol.L * 0.98);
        const lo = Math.min(0, sys.stats.vmin);
        cur = {
          V: sys.V,
          sol: sys.sol,
          levels: sys.levels,
          Etop,
          ylow: lo - 0.04 * Etop,
          xr,
          barrier: sys.stats.barrier,
          V0: sys.stats.v0,
          xmin: sys.stats.xmin,
          label: state.mode === "oh" ? "OH₃⁺" : "PH₃",
          pairs: state.mode === "ph",
        };
      }
      cur.grid = fullGrid(cur.sol, 2);
    };

    const setMode = (m) => {
      state.mode = m;
      modes.set(m);
      compute();
      draw();
    };

    function draw() {
      if (!cur) return;
      const { ctx, width: W, height: H } = prep(canvas, 0.68, 300, 440);
      ctx.clearRect(0, 0, W, H);
      const g = geom(W, H, { l: 52, r: 44, t: 12, b: 46 }, [-cur.xr, cur.xr], [cur.ylow, cur.Etop]);
      drawAxes(ctx, g);
      const shown = cur.levels.filter((l) => l.E < cur.Etop * 0.98);
      // wave scale: fraction of the typical level spacing
      const n4 = Math.min(4, shown.length - 1);
      const spacing = n4 > 0 ? (shown[n4].E - shown[0].E) / n4 : cur.Etop / 6;
      let pk = 0;
      let pk2 = 0;
      for (const lv of shown) {
        for (let i = 0; i < lv.psi.length; i += 3) {
          pk = Math.max(pk, Math.abs(lv.psi[i]));
          pk2 = Math.max(pk2, lv.psi[i] ** 2);
        }
      }
      const amp = clamp(0.5 * Math.max(spacing, cur.Etop / 14), 0, cur.Etop / 6);
      const scale = state.prob ? amp / pk2 : amp / pk;
      // levels first (thin), then waves, then the potential on top
      hits = [];
      const labels = [];
      const mode = cur.pairs;
      ctx.save();
      clipPlot(ctx, g);
      for (const lv of shown) {
        const color = lv.parity > 0 ? col.pos : col.neg;
        const xo = outerTurning(cur.V, lv.E, cur.xmin, cur.sol.L * 0.98);
        const y = g.Y(lv.E);
        drawWave(ctx, g, lv, cur.grid, scale, state.prob, color, 0.2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash(mode && lv.parity < 0 ? [3, 3] : []);
        ctx.beginPath();
        ctx.moveTo(g.X(-xo), y);
        ctx.lineTo(g.X(xo), y);
        ctx.stroke();
        ctx.setLineDash([]);
        const pairIdx = Math.floor(lv.k / 2);
        labels.push({ y, text: `e${pairIdx}${sgn(lv.parity)}`, pair: `e${pairIdx}${mode ? "" : "±"}` });
        hits.push({
          x0: g.X(-xo),
          x1: g.r + 40,
          y,
          html: `<b>${cur.label} · e${pairIdx}${sgn(lv.parity)}</b> (${lv.parity > 0 ? "even" : "odd"} state)<br>${num(lv.E, 1)} cm⁻¹`,
        });
      }
      strokeCurve(ctx, g, cur.V, col.ink, 2.4);
      ctx.restore();
      placeLabels(ctx, labels, g.r + 5, col.ink2);
      // barrier marker
      txt(ctx, `barrier ${int(cur.barrier)}`, g.X(0), g.Y(cur.V0) - 6, { align: "center", size: 10 });
      // readouts
      const E0 = cur.levels[0].E;
      const E1 = cur.levels[1].E;
      let ariaSplit;
      if (state.mode === "ph") {
        const paper = PH_EXACT.ph;
        bigNum.textContent = `${INV.sci(paper, 2)} cm⁻¹`;
        bigSub.innerHTML = `ground-state splitting ΔE of the fitted PH₃ curve: an exact high-precision solve (a WKB estimate agrees within a few per cent). Double precision cannot show it here, so the two states below come out identical. The paper's B97D table value, ~${INV.sci(INV.LEVELS.ph.b97d.split[0], 1)} cm⁻¹, sits at the rounding floor of that calculation. Flip time T = 1/(c·ΔE) is about ${fmtTime(1 / (INV.CM_HZ * paper))}.`;
        drawStrip(paper, "exact solve of the fitted curve");
        ariaSplit = `about ${INV.sci(paper, 1)} wavenumbers (exact solve)`;
      } else {
        const d = E1 - E0;
        const safe = Math.max(d, MIN_SPLIT);
        const below = d < MIN_SPLIT;
        const T = 1 / (INV.CM_HZ * safe);
        bigNum.textContent = below ? "< 10⁻⁹ cm⁻¹" : `${nice(d)} cm⁻¹`;
        const nBelow = cur.levels.filter((l) => l.E < cur.V0).length;
        const note =
          E0 > cur.V0
            ? "The ground state sits above the top of the barrier, so there is no real tunnelling pair left."
            : `Tunnelling period T = 1/(c·ΔE) ≈ ${fmtTime(T)}; ${Math.floor(nBelow / 2) === 1 ? "one pair of levels lies" : `${Math.floor(nBelow / 2)} pairs of levels lie`} below the barrier.`;
        bigSub.innerHTML = `ground-state splitting ΔE = e1 − e0 for ${cur.label}. ${note}`;
        drawStrip(safe, state.mode === "oh" ? "computed" : "this well");
        ariaSplit = below ? "below 1e-9 wavenumbers" : `${nice(d)} wavenumbers`;
      }
      canvas.setAttribute(
        "aria-label",
        `Energy levels and wavefunctions of the ${cur.label}, barrier ${int(cur.barrier)} wavenumbers; ground-state splitting ${ariaSplit}.`
      );
    }

    // log-scale strip: ground-state splitting from 1e-17 to 1e3 cm^-1
    function drawStrip(value, tag) {
      const { ctx, width: W, height: H } = INV.fitCanvas(strip);
      ctx.clearRect(0, 0, W, H);
      const lo = -17;
      const hi = 3;
      const pad = 14;
      const X = (v) => pad + ((clamp(Math.log10(v), lo, hi) - lo) / (hi - lo)) * (W - 2 * pad);
      const yBar = 30;
      // axis
      ctx.strokeStyle = col.ink2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, yBar + 0.5);
      ctx.lineTo(W - pad, yBar + 0.5);
      ctx.stroke();
      const step = W < 420 ? 4 : 2;
      for (let e = lo + 1; e <= hi; e += 1) {
        const x = X(10 ** e);
        ctx.beginPath();
        ctx.moveTo(x + 0.5, yBar - (e % step === 0 || e === hi ? 4 : 2));
        ctx.lineTo(x + 0.5, yBar + (e % step === 0 || e === hi ? 4 : 2));
        ctx.stroke();
        if ((e - lo) % step === 0 || e === hi)
          txt(
            ctx,
            e === 0
              ? "1"
              : `10${String(e)
                  .replace("-", "⁻")
                  .replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c])}`,
            x,
            yBar + 17,
            { align: "center", size: 9 }
          );
      }
      txt(ctx, "ΔE on a log scale (cm⁻¹); each tick is ten times smaller or larger", W / 2, H - 3, { align: "center", size: 9 });
      // reference marks
      const ref = (v, label, up, color, align) => {
        const x = X(v);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, yBar - 2);
        ctx.lineTo(x + 0.5, yBar - (up ? 14 : 8));
        ctx.stroke();
        txt(ctx, label, x, yBar - (up ? 17 : 11), { align: align || "center", size: 9, color });
      };
      ref(INV.LEVELS.oh.expt.split[0], "OH₃⁺ expt.", false, col.oh);
      ref(PH_EXACT.ph, "PH₃ (fit)", false, col.ph, "left");
      // value marker
      const x = X(value);
      ctx.fillStyle = col.accent;
      ctx.beginPath();
      ctx.moveTo(x, yBar + 0.5);
      ctx.lineTo(x - 6, yBar + 11);
      ctx.lineTo(x + 6, yBar + 11);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = col.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pad, yBar + 0.5);
      ctx.lineTo(x, yBar + 0.5);
      ctx.stroke();
      strip.setAttribute("aria-label", `Ground-state splitting ${nice(value)} wavenumbers (${tag}) on a log scale from 1e-17 to 1000.`);
    }

    bindHits(canvas, () => hits);
    watchSize(root, () => draw());
    modes.set("generic");
    showGrp.set("psi");
    compute();
    draw();
  };

  // =====================================================================================
  // 3. #inv-slosh: tunnelling in time
  // =====================================================================================
  const SCREEN_T = 4; // seconds on screen per full oscillation
  const SLOSH = {
    oh: { label: "OH₃⁺", dnu: [INV.LEVELS.oh.expt.split[0]] },
    ohC60: { label: "OH₃⁺ in C₆₀", dnu: [INV.LEVELS.ohC60.b97d.split[0]] },
    ph: { label: "PH₃", dnu: [PH_EXACT.ph, INV.LEVELS.ph.ccsdtTZ.split[0]] },
    phC60: { label: "PH₃ in C₆₀", dnu: null },
  };

  const initSlosh = (root) => {
    root.classList.add("inv-q");
    const state = { key: "oh", u: 0, play: !INV.reduceMotion, visible: true };
    let data = null;

    const controls = el("div", "inv-controls", root);
    const grp = buttonGroup(
      controls,
      Object.entries(SLOSH).map(([key, s]) => ({ key, html: s.label.replace("C₆₀", "C₆₀") })),
      (k) => setSys(k),
      "Choose a system"
    );
    const playBtn = el("button", "inv-btn inv-q-play", controls);
    playBtn.type = "button";
    const eq = el("div", "inv-q-eq", root);
    eq.innerHTML = "Ψ(x, t) = [ ψ₀⁺(x) e<sup>−iE₊t/ħ</sup> + ψ₀⁻(x) e<sup>−iE₋t/ħ</sup> ] / √2 &nbsp;·&nbsp; the shaded curve is |Ψ|²";
    const canvas = el("canvas", "inv-q-canvas", root);
    canvas.setAttribute("role", "img");
    const gaugeRow = el("div", "inv-q-gauge", root);
    const gLab = el("span", "inv-q-gl", gaugeRow, "Left well");
    const track = el("div", "inv-q-track", gaugeRow);
    const fill = el("div", "inv-q-fill", track);
    const gRab = el("span", "inv-q-gr", gaugeRow, "Right well");
    const pct = el("div", "inv-q-pct", root);
    pct.setAttribute("aria-live", "off");
    const trace = el("canvas", "inv-q-trace", root);
    trace.setAttribute("role", "img");
    const scrub = sliderRow(
      root,
      "Time (periods)",
      0,
      2,
      0.005,
      0,
      (v) => `${num(v, 2)} T`,
      (v) => {
        state.u = v;
        state.play = false;
        syncPlay();
        draw();
      }
    );
    const out = el("div", "inv-q-out inv-q-outslosh", root);
    const big = el("div", "inv-q-big", out);
    big.setAttribute("aria-live", "polite");
    const bigNum = el("div", "inv-stat-num", big);
    const bigSub = el("div", "inv-q-bigsub", big);
    const clock = el("div", "inv-q-clock", out);

    const syncPlay = () => {
      playBtn.textContent = state.play ? "Pause" : "Play";
      playBtn.setAttribute("aria-pressed", String(state.play));
    };
    playBtn.addEventListener("click", () => {
      state.play = !state.play;
      syncPlay();
      if (state.play) wake();
    });

    const periodInfo = () => {
      const s = SLOSH[state.key];
      const sys = getSystem(state.key);
      const e = sys.levels;
      let Ts;
      let lines;
      let head;
      if (state.key === "oh") {
        const T = 1 / (INV.CM_HZ * s.dnu[0]);
        Ts = [T];
        head = fmtTime(T);
        lines = `Period T = h/ΔE = 1/(c·Δν̃) with the experimental splitting Δν̃ = ${num(s.dnu[0], 2)} cm⁻¹ (Table 7). Other methods: CCSD(T)/QZ ${num(INV.LEVELS.oh.ccsdtQZ.split[0], 1)} cm⁻¹ (T = ${fmtTime(1 / (INV.CM_HZ * INV.LEVELS.oh.ccsdtQZ.split[0]))}), B97D ${num(INV.LEVELS.oh.b97d.split[0], 1)} cm⁻¹ (T = ${fmtTime(1 / (INV.CM_HZ * INV.LEVELS.oh.b97d.split[0]))}). The wavefunction shape comes from the fitted curve, whose own splitting is ${num(e[1].E - e[0].E, 1)} cm⁻¹.`;
      } else if (state.key === "ohC60") {
        const T = 1 / (INV.CM_HZ * s.dnu[0]);
        const free = INV.LEVELS.oh.b97d.split[0];
        Ts = [T];
        head = fmtTime(T);
        lines = `Δν̃ = ${num(s.dnu[0], 2)} cm⁻¹ (B97D, Table 7). At the same level of theory free OH₃⁺ splits by ${num(free, 2)} cm⁻¹ (T = ${fmtTime(1 / (INV.CM_HZ * free))}), so the cage slows the flipping about ${num(free / s.dnu[0], 1)}×. Experiment is for the free ion only.`;
      } else if (state.key === "ph") {
        const [a, b] = s.dnu;
        Ts = [1 / (INV.CM_HZ * b), 1 / (INV.CM_HZ * a)];
        head = `${fmtTime(Ts[0])} to ${fmtTime(Ts[1])}`;
        lines = `An order-of-magnitude range, depending on method. The CCSD(T)/TZ table value of the paper, ${INV.sci(b, 2)} cm⁻¹, gives T = ${fmtTime(Ts[0])}; an exact solve of the fitted curve gives ${INV.sci(a, 2)} cm⁻¹ (WKB agrees), i.e. T ~ ${fmtTime(Ts[1])}. The paper's B97D value, ${INV.sci(INV.LEVELS.ph.b97d.split[0], 1)} cm⁻¹, sits at the rounding floor. Not an ammonia-like fast flip.`;
      } else {
        const w = PH_EXACT.phC60;
        const T = 1 / (INV.CM_HZ * w);
        Ts = [T];
        head = `~${fmtTime(T)}`;
        lines = `The paper lists this ground-state splitting as 0.0 cm⁻¹ (below its precision). An exact solve of the fitted curve gives ${INV.sci(w, 1)} cm⁻¹ (about 14× the free fit's ${INV.sci(PH_EXACT.ph, 1)}), so T is of order hours: still effectively no flipping.`;
      }
      return { Ts, head, lines };
    };

    const setSys = (k) => {
      state.key = k;
      grp.set(k);
      const sys = getSystem(k);
      const [lp, lm] = [sys.levels[0], sys.levels[1]];
      const grid = fullGrid(sys.sol, 2);
      const pp = psiOn(lp, grid.idx);
      const pm = psiOn(lm, grid.idx);
      let c = 0;
      for (let i = 0; i < sys.sol.N; i++) c += lp.psi[i] * lm.psi[i] * sys.sol.h;
      let peak = 0;
      for (let i = 0; i < pp.length; i++) peak = Math.max(peak, 0.5 * (pp[i] * pp[i] + pm[i] * pm[i] + 2 * pp[i] * pm[i]));
      const Etop = (k.startsWith("oh") ? 1.4 : 1.2) * sys.stats.v0;
      const xr = outerTurning(sys.V, Etop, sys.stats.xmin, sys.sol.L * 0.98);
      data = { sys, grid, pp, pm, c, peak, Etop, xr, info: periodInfo() };
      bigNum.textContent = data.info.head;
      bigSub.innerHTML = `time for the molecule to flip from one side to the other and back, T = h/ΔE.<span class="inv-q-note">${data.info.lines}</span>`;
      const Ts = data.info.Ts;
      const rate = Ts.length > 1 ? `${fmtTime(Ts[0] / SCREEN_T)} to ${fmtTime(Ts[1] / SCREEN_T)}` : fmtTime(Ts[0] / SCREEN_T);
      data.rate = rate;
      draw();
    };

    const pRight = () => 0.5 + data.c * Math.cos(2 * Math.PI * state.u);

    function draw() {
      if (!data) return;
      const { sys, grid, pp, pm, c, peak, Etop, xr } = data;
      const { ctx, width: W, height: H } = prep(canvas, 0.52, 250, 360);
      ctx.clearRect(0, 0, W, H);
      const lo = Math.min(0, sys.stats.vmin) - 0.04 * Etop;
      const g = geom(W, H, { l: 52, r: 44, t: 12, b: 46 }, [-xr, xr], [lo, Etop]);
      drawAxes(ctx, g);
      const Ep = sys.levels[0].E;
      const Em = sys.levels[1].E;
      const E0 = 0.5 * (Ep + Em);
      const amp = 0.55 * (Etop - E0);
      const cs = Math.cos(2 * Math.PI * state.u);
      // centre line
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = col.rule;
      ctx.beginPath();
      ctx.moveTo(g.X(0), g.t);
      ctx.lineTo(g.X(0), g.b);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      clipPlot(ctx, g);
      // the two levels
      const xo = outerTurning(sys.V, Em, sys.stats.xmin, sys.sol.L * 0.98);
      for (const [E, color, lab] of [
        [Ep, col.pos, "e0⁺"],
        [Em, col.neg, "e0⁻"],
      ]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash(Math.abs(Em - Ep) < 1e-3 && E === Em ? [3, 3] : []);
        ctx.beginPath();
        ctx.moveTo(g.X(-xo), g.Y(E));
        ctx.lineTo(g.X(xo), g.Y(E));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // |Psi|^2
      ctx.beginPath();
      for (let i = 0; i < grid.xs.length; i++) {
        const d = 0.5 * (pp[i] * pp[i] + pm[i] * pm[i] + 2 * pp[i] * pm[i] * cs);
        const px = g.X(grid.xs[i]);
        const py = g.Y(E0 + (d / peak) * amp);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = col.accent;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.lineTo(g.X(grid.xs[grid.xs.length - 1]), g.Y(E0));
      ctx.lineTo(g.X(grid.xs[0]), g.Y(E0));
      ctx.closePath();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = col.accent;
      ctx.fill();
      ctx.globalAlpha = 1;
      strokeCurve(ctx, g, sys.V, col.ink, 2.4);
      ctx.restore();
      placeLabels(
        ctx,
        [
          { y: g.Y(Ep), text: "e0⁺", pair: "e0±" },
          { y: g.Y(Em), text: "e0⁻", pair: "e0±" },
        ],
        g.r + 5,
        col.ink2
      );
      txt(ctx, "left well", g.X(-xr * 0.5), g.t + 12, { align: "center", size: 10 });
      txt(ctx, "right well", g.X(xr * 0.5), g.t + 12, { align: "center", size: 10 });
      // gauge
      const pr = 0.5 + c * cs;
      fill.style.width = `${((1 - pr) * 100).toFixed(1)}%`;
      pct.textContent = `${Math.round((1 - pr) * 100)}% left · ${Math.round(pr * 100)}% right`;
      const mol = SLOSH[state.key].label;
      canvas.setAttribute(
        "aria-label",
        `Probability density of ${mol} oscillating between the two wells of the double-well potential; currently ${Math.round(pr * 100)} percent in the right well.`
      );
      drawTrace();
      if (!state.play) updateClock();
    }

    function drawTrace() {
      const { ctx, width: W, height: H } = INV.fitCanvas(trace);
      ctx.clearRect(0, 0, W, H);
      const l = 52;
      const r = W - 44;
      const t = 6;
      const b = H - 16;
      const X = (u) => l + (u / 2) * (r - l);
      const Y = (p) => b - p * (b - t);
      ctx.strokeStyle = col.rule;
      ctx.lineWidth = 1;
      for (const p of [0, 0.5, 1]) {
        ctx.beginPath();
        ctx.moveTo(l, Y(p) + 0.5);
        ctx.lineTo(r, Y(p) + 0.5);
        ctx.stroke();
        txt(ctx, `${p * 100}%`, l - 6, Y(p) + 3.5, { align: "right", size: 9 });
      }
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const u = i / 100;
        const p = 0.5 + data.c * Math.cos(2 * Math.PI * u);
        if (i === 0) ctx.moveTo(X(u), Y(p));
        else ctx.lineTo(X(u), Y(p));
      }
      ctx.strokeStyle = col.accent;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      const pr = pRight();
      ctx.beginPath();
      ctx.arc(X(state.u), Y(pr), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = col.accent;
      ctx.fill();
      txt(ctx, "chance of finding it in the right well, over two full oscillations", (l + r) / 2, H - 3, { align: "center", size: 9 });
      trace.setAttribute(
        "aria-label",
        `Chance of finding the molecule in the right well over time: a smooth oscillation. Now ${Math.round(pr * 100)} percent.`
      );
    }

    function updateClock() {
      const Ts = data.info.Ts;
      const frac = state.u % 1;
      let real;
      if (Ts.length === 1) real = `Real time elapsed: ${fmtTime(Math.max(frac * Ts[0], 1e-16))} of one ${fmtTime(Ts[0])} period.`;
      else real = `Phase: ${num(frac * 100, 0)}% of one oscillation.`;
      clock.innerHTML = `${real}<br><span>On screen one oscillation takes ${SCREEN_T} s, so <strong>1 second here = ${data.rate}</strong> of real time.</span>`;
    }

    // animation
    let running = false;
    let last = 0;
    let lastClock = 0;
    const frame = (now) => {
      if (!running) return;
      if (!state.play || !state.visible) {
        running = false;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      state.u = (state.u + dt / SCREEN_T) % 2;
      scrub.set(state.u);
      draw();
      if (now - lastClock > 120) {
        lastClock = now;
        updateClock();
      }
      requestAnimationFrame(frame);
    };
    const wake = () => {
      if (running || !state.play || !state.visible) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    };
    INV.watchVisibility(root, (v) => {
      state.visible = v;
      if (v) wake();
    });
    document.addEventListener("visibilitychange", () => !document.hidden && wake());

    watchSize(root, draw);
    if (INV.reduceMotion) state.u = 0.5;
    syncPlay();
    setSys("oh");
    scrub.set(state.u);
    wake();
  };

  // =====================================================================================
  // 4. #inv-four: free vs caged, the paper's main result
  // =====================================================================================
  const PANELS = [
    {
      mol: "oh",
      title: "OH₃⁺ (hydronium)",
      free: "oh",
      caged: "ohC60",
      maxLevel: 1550,
      Etop: 1500,
      freeNote:
        "Free curve: the CCSD(T)/aug-cc-pVQZ fit (Table 6); the B97D free fit is not in the paper, whose B97D barrier and splitting (612 and 104 cm⁻¹) are quoted as numbers only. Caged curve: B97D/aug-cc-pVTZ.",
    },
    {
      mol: "ph",
      title: "PH₃ (phosphine)",
      free: "ph",
      caged: "phC60",
      maxLevel: 4900,
      Etop: 12800,
      freeNote:
        "Both curves: B97D/aug-cc-pVTZ fits. Levels come in degenerate pairs, drawn once. Note the fitted caged curve's valley floor sits ~424 cm⁻¹ above zero (free: ~45), so absolute levels are offset; compare each level with its own well bottom, not with the axis zero.",
    },
  ];

  const initFour = (root) => {
    root.classList.add("inv-q");
    const show = { free: true, caged: true };
    const panels = [];

    const controls = el("div", "inv-controls", root);
    el("span", "inv-q-ctl", controls, "Show:");
    const bF = el("button", "inv-btn", controls);
    bF.type = "button";
    bF.innerHTML = `<i class="inv-swatch" style="background:var(--inv-free)"></i>Free molecule`;
    const bC = el("button", "inv-btn", controls);
    bC.type = "button";
    bC.innerHTML = `<i class="inv-swatch" style="background:var(--inv-caged)"></i>Inside C₆₀`;
    const sync = () => {
      bF.setAttribute("aria-pressed", String(show.free));
      bC.setAttribute("aria-pressed", String(show.caged));
      panels.forEach((p) => p.render());
    };
    bF.addEventListener("click", () => {
      if (show.free && !show.caged) return;
      show.free = !show.free;
      sync();
    });
    bC.addEventListener("click", () => {
      if (show.caged && !show.free) return;
      show.caged = !show.caged;
      sync();
    });

    const grid = el("div", "inv-q-four", root);
    // 1.2 x 10^-15 style markup for tiny numbers
    const sciHtml = (v) => {
      const e = Math.floor(Math.log10(v));
      return `${(v / 10 ** e).toFixed(1)} × 10<sup>${String(e).replace("-", "−")}</sup>`;
    };

    for (const cfg of PANELS) {
      const sf = getSystem(cfg.free);
      const sc = getSystem(cfg.caged);
      const wrap = el("div", "inv-q-fpanel", grid);
      el("div", "inv-kicker", wrap, cfg.title);
      const canvas = el("canvas", "inv-q-canvas", wrap);
      canvas.setAttribute("role", "img");
      const tbl = el("table", "inv-q-table", wrap);
      const note = el("div", "inv-q-note", wrap, cfg.freeNote);
      let hits = [];
      const isPh = cfg.mol === "ph";
      const wf = PH_EXACT.ph;
      const wc = PH_EXACT.phC60;

      const table = () => {
        const bF2 = sf.stats.barrier;
        const bC2 = sc.stats.barrier;
        const e0f = sf.levels[0].E;
        const e0c = sc.levels[0].E;
        const dim = (k) => (show[k] ? "" : ' class="is-dim"');
        const kc = (v) => `${num(v * INV.CM_KCAL, 1)} kcal/mol`;
        const split = isPh
          ? `<tr><th scope="row">Ground-state splitting<small>cm⁻¹, tunnelling</small></th>
              <td${dim("free")}>${sciHtml(wf)}<small>exact solve of the fitted curve (WKB agrees); paper's Table 8: ~5 × 10<sup>−13</sup>, at the rounding floor</small></td>
              <td${dim("caged")}>${sciHtml(wc)}<small>exact solve, about ${num(wc / wf, 0)}× the free value; paper lists 0.0</small></td></tr>`
          : `<tr><th scope="row">Ground-state splitting<small>cm⁻¹, solved here on the curves shown</small></th>
              <td${dim("free")}>${num(sf.levels[1].E - sf.levels[0].E, 1)}<small>paper: ${num(INV.LEVELS.oh.ccsdtQZ.split[0], 1)} (CCSD(T)/QZ); 104.0 at B97D</small></td>
              <td${dim("caged")}>${num(sc.levels[1].E - sc.levels[0].E, 1)}<small>paper: ${num(INV.LEVELS.ohC60.b97d.split[0], 1)} (B97D)</small></td></tr>`;
        tbl.innerHTML = `<thead><tr><th></th><th${dim("free")}><i class="inv-swatch" style="background:var(--inv-free)"></i>Free</th><th${dim("caged")}><i class="inv-swatch" style="background:var(--inv-caged)"></i>In C₆₀</th></tr></thead>
          <tbody>
          <tr><th scope="row">Barrier height<small>cm⁻¹, top of the curve minus well bottom</small></th>
            <td${dim("free")}>${int(bF2)}<small>${kc(bF2)}${isPh ? "" : " · paper B97D: 612"}</small></td><td${dim("caged")}>${int(bC2)}<small>${kc(bC2)} · ${bC2 > bF2 ? "+" : "−"}${int(Math.abs(bC2 - bF2))}</small></td></tr>
          ${split}
          <tr><th scope="row">Lowest level, e0<small>cm⁻¹, on the paper's zero of energy; below: above its own well bottom</small></th>
            <td${dim("free")}>${num(e0f, 1)}<small>paper: ${num(cfg.mol === "oh" ? INV.LEVELS.oh.ccsdtQZ.e[0] : INV.LEVELS.ph.b97d.e[0], 1)} · ${num(e0f - sf.stats.vmin, 1)} above well bottom</small></td>
            <td${dim("caged")}>${num(e0c, 1)}<small>paper: ${num(cfg.mol === "oh" ? INV.LEVELS.ohC60.b97d.e[0] : INV.LEVELS.phC60.b97d.e[0], 1)} · ${num(e0c - sc.stats.vmin, 1)} above well bottom</small></td></tr>
          </tbody>`;
      };

      const render = () => {
        const { ctx, width: W, height: H } = prep(canvas, isPh ? 0.8 : 0.78, 290, 420);
        ctx.clearRect(0, 0, W, H);
        const Vs = [sf, sc];
        const xr = Math.max(...Vs.map((s) => outerTurning(s.V, cfg.Etop * 1.02, s.stats.xmin, s.sol.L * 0.98)));
        const lo = Math.min(0, sf.stats.vmin, sc.stats.vmin) - 0.04 * cfg.Etop;
        const g = geom(W, H, { l: 52, r: show.free && show.caged ? 66 : 44, t: 12, b: 46 }, [-xr, xr], [lo, cfg.Etop]);
        drawAxes(ctx, g);
        hits = [];
        const cols = { free: col.free, caged: col.caged };
        const names = { free: cfg.mol === "oh" ? "OH₃⁺" : "PH₃", caged: cfg.mol === "oh" ? "OH₃⁺ in C₆₀" : "PH₃ in C₆₀" };
        const colX = { free: g.r + 5, caged: g.r + (show.free ? 33 : 5) };
        for (const k of ["free", "caged"]) {
          if (!show[k]) continue;
          const sys = k === "free" ? sf : sc;
          const paper =
            k === "free"
              ? cfg.mol === "oh"
                ? INV.LEVELS.oh.ccsdtQZ
                : INV.LEVELS.ph.b97d
              : cfg.mol === "oh"
                ? INV.LEVELS.ohC60.b97d
                : INV.LEVELS.phC60.b97d;
          const tag = sysSpec[sys.key].paper.tag;
          const labels = [];
          for (const lv of sys.levels) {
            if (lv.E > cfg.maxLevel) continue;
            if (isPh && lv.parity < 0) continue;
            const y = g.Y(lv.E);
            const xo = outerTurning(sys.V, lv.E, sys.stats.xmin, sys.sol.L * 0.98);
            ctx.strokeStyle = cols[k];
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(g.X(-xo), y);
            ctx.lineTo(g.X(xo), y);
            ctx.stroke();
            // dotted leader to the label column
            ctx.globalAlpha = 0.35;
            ctx.setLineDash([1, 3]);
            ctx.beginPath();
            ctx.moveTo(g.X(xo), y);
            ctx.lineTo(colX[k] - 2, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
            const pairIdx = Math.floor(lv.k / 2);
            const name = isPh ? `e${pairIdx}` : `e${pairIdx}${sgn(lv.parity)}`;
            labels.push({ y, text: name, pair: isPh ? name : `e${pairIdx}±` });
            const pv = isPh ? paper.e[pairIdx] : paper.e[lv.k];
            hits.push({
              x0: g.X(-xo),
              x1: colX[k] + 24,
              y,
              html: `<b>${names[k]} · ${name}</b>${isPh ? " (degenerate pair)" : lv.parity > 0 ? " (even)" : " (odd)"}<br>computed here: ${num(lv.E, 1)} cm⁻¹<br>${pv !== undefined ? `paper${isPh ? "" : ` (its e${lv.k})`}: ${num(pv, 1)} cm⁻¹ <span style="opacity:.7">(${tag})</span>` : "not tabulated in the paper"}`,
            });
          }
          placeLabels(ctx, labels, colX[k], cols[k]);
        }
        for (const k of ["free", "caged"]) {
          if (!show[k]) continue;
          const sys = k === "free" ? sf : sc;
          strokeCurve(ctx, g, sys.V, cols[k], 2.4);
          ctx.beginPath();
          ctx.arc(g.X(0), g.Y(sys.stats.v0), 3.2, 0, Math.PI * 2);
          ctx.fillStyle = cols[k];
          ctx.fill();
        }
        // barrier tags: the higher summit's label above its dot, the lower one's below
        const ks = ["free", "caged"].filter((k) => show[k]);
        const v0 = (k) => (k === "free" ? sf : sc).stats.v0;
        for (const k of ks) {
          const above = ks.length === 1 || v0(k) >= v0(ks.find((q) => q !== k));
          const sys = k === "free" ? sf : sc;
          txt(ctx, `barrier ${int(sys.stats.barrier)}`, g.X(0), g.Y(sys.stats.v0) + (above ? -8 : 16), { align: "center", size: 10, color: cols[k] });
        }
        canvas.setAttribute(
          "aria-label",
          `${cfg.title}: double-well potential${show.free && show.caged ? "s, free and inside C60, overlaid" : show.free ? ", free molecule" : ", inside C60"}, with the lowest energy levels. Free barrier ${int(sf.stats.barrier)} wavenumbers, caged ${int(sc.stats.barrier)}.`
        );
        table();
      };
      bindHits(canvas, () => hits);
      panels.push({ render });
      watchSize(wrap, render);
    }
    sync();
  };

  // =====================================================================================
  // mount
  // =====================================================================================
  const mount = (id, init) => {
    const root = $(id);
    if (!root) return;
    INV.onVisible(root, () => init(root));
  };
  mount("inv-ball", initBall);
  mount("inv-well", initWell);
  mount("inv-slosh", initSlosh);
  mount("inv-four", initFour);
})();
