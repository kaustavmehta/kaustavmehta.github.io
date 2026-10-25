// "How do you compute any of this?" widgets for the umbrella-inversion post.
// Mounts: #inv-curse, #inv-basis, #inv-cost, #inv-bench, #inv-led, #inv-scf. Requires window.INV (inversion-common.js).
(function () {
  const INV = window.INV;
  if (!INV) return;
  const NS = "http://www.w3.org/2000/svg";

  // ---------- helpers ----------
  const S = (tag, attrs, parent, text) => {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  const H = (tag, attrs, parent, html) => {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    if (html !== undefined) n.innerHTML = html;
    if (parent) parent.appendChild(n);
    return n;
  };
  const SUPD = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const supStr = (e) =>
    String(e)
      .split("")
      .map((c) => SUPD[c])
      .join("");
  const ten = (e) => `10^{${e}}`; // markup: ^{..} becomes a superscript
  const plain = (str) => str.replace(/\^\{(.*?)\}/g, (_, x) => supStr(x));
  const rich = (str) => str.replace(/\^\{(.*?)\}/g, "<sup>$1</sup>");
  // SVG text with superscripts
  const ST = (parent, attrs, str) => {
    const t = S("text", attrs, parent);
    str.split(/(\^\{.*?\})/).forEach((part) => {
      const m = part.match(/^\^\{(.*)\}$/);
      if (m) {
        S("tspan", { dy: -4, "font-size": 8 }, t, m[1]);
        S("tspan", { dy: 4 }, t, "\u200b");
      } else if (part) t.appendChild(document.createTextNode(part));
    });
    return t;
  };
  const sciH = (v, d = 2) => {
    const e = Math.floor(Math.log10(Math.abs(v)));
    return `${(v / 10 ** e).toFixed(d - 1)} × 10<sup>${e}</sup>`;
  };
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const MINUS = "−";
  const signed = (v, d = 1) => (v < 0 ? MINUS : v > 0 ? "+" : "") + Math.abs(v).toFixed(d);
  const niceStep = (span, n) => {
    const raw = span / n;
    const p = 10 ** Math.floor(Math.log10(raw));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  };
  const mount = (id, init) => {
    const el = document.getElementById(id);
    if (!el) return;
    INV.onVisible(el, () => init(el));
  };
  // Responsive SVG: draw(svg, width) must return the height.
  const makeChart = (host, draw, label) => {
    const wrap = H("div", { class: "invm-chart" }, host);
    const svg = S("svg", { role: "img" }, wrap);
    let lastW = 0;
    const api = {
      svg,
      setLabel(t) {
        svg.setAttribute("aria-label", t);
      },
      render() {
        const w = Math.floor(wrap.clientWidth);
        if (w < 10) return;
        lastW = w;
        svg.replaceChildren();
        const h = draw(svg, w);
        svg.setAttribute("width", w);
        svg.setAttribute("height", h);
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      },
    };
    if (label) api.setLabel(label);
    if ("ResizeObserver" in window) new ResizeObserver(() => Math.floor(wrap.clientWidth) !== lastW && api.render()).observe(wrap);
    INV.onThemeChange(() => api.render());
    api.render();
    return api;
  };
  const toggleGroup = (parent, items, current, onPick, aria) => {
    const box = H("div", { class: "inv-controls", role: "group", "aria-label": aria }, parent);
    const btns = items.map((it) => {
      const b = H("button", { type: "button", class: "inv-btn", "aria-pressed": String(it.id === current) }, box, it.label);
      b.addEventListener("click", () => {
        onPick(it.id);
        btns.forEach((x, i) => x.setAttribute("aria-pressed", String(items[i].id === it.id)));
      });
      return b;
    });
    return { box, btns, set: (id) => btns.forEach((x, i) => x.setAttribute("aria-pressed", String(items[i].id === id))) };
  };

  // ---------- basis function counts (derived, used by #inv-basis and #inv-cost) ----------
  // aug-cc-pVTZ contractions; spherical shells: s=1, p=3, d=5, f=7 functions each.
  const L_SIZE = { s: 1, p: 3, d: 5, f: 7 };
  const AUG = {
    H: { shells: { s: 4, p: 3, d: 2 }, note: "cc-pVTZ [3s2p1d] + one diffuse of each" },
    C: { shells: { s: 5, p: 4, d: 3, f: 2 }, note: "cc-pVTZ [4s3p2d1f] + one diffuse of each" },
    O: { shells: { s: 5, p: 4, d: 3, f: 2 }, note: "cc-pVTZ [4s3p2d1f] + one diffuse of each" },
    P: { shells: { s: 6, p: 5, d: 3, f: 2 }, note: "cc-pVTZ [5s4p2d1f] + one diffuse of each" },
  };
  const count = (a) => Object.entries(AUG[a].shells).reduce((t, [l, n]) => t + n * L_SIZE[l], 0);
  const NB = { H: count("H"), C: count("C"), O: count("O"), P: count("P") };
  const SYSTEMS = [
    { id: "oh", label: "OH₃⁺ (free)", n: NB.O + 3 * NB.H },
    { id: "ph", label: "PH₃ (free)", n: NB.P + 3 * NB.H },
    { id: "c60", label: "C₆₀", n: 60 * NB.C },
    { id: "ohC60", label: "OH₃⁺@C₆₀", n: NB.O + 3 * NB.H + 60 * NB.C, caged: true },
    { id: "phC60", label: "PH₃@C₆₀", n: NB.P + 3 * NB.H + 60 * NB.C, caged: true },
  ];
  const NSYS = Object.fromEntries(SYSTEMS.map((s) => [s.id, s.n]));
  const shellStr = (a) =>
    "[" +
    Object.entries(AUG[a].shells)
      .map(([l, n]) => n + l)
      .join(" ") +
    "]";
  const arith = (a) =>
    Object.entries(AUG[a].shells)
      .map(([l, n]) => `${n}×${L_SIZE[l]}`)
      .join(" + ");

  // =====================================================================
  // 1. #inv-curse
  // =====================================================================
  mount("inv-curse", (host) => {
    const E = INV.ELECTRONS;
    const stops = [
      { n: 1, label: "H atom" },
      { n: E.oh, label: "OH₃⁺" },
      { n: E.ph, label: "PH₃" },
      { n: E.c60, label: "C₆₀" },
      { n: E.oh + E.c60, label: "OH₃⁺@C₆₀" },
      { n: E.ph + E.c60, label: "PH₃@C₆₀" },
    ];
    const NMAX = stops[stops.length - 1].n;
    const toPos = (n) => Math.round((1000 * Math.log(n)) / Math.log(NMAX));
    const fromPos = (p) => Math.max(1, Math.round(Math.exp((p / 1000) * Math.log(NMAX))));
    let N = E.oh;

    const presets = toggleGroup(
      host,
      stops.map((s) => ({ id: s.n, label: `${s.label} · ${s.n}` })),
      N,
      (n) => set(n),
      "Choose a system"
    );
    const rng = H("div", { class: "inv-range" }, host);
    const lab = H("label", { for: "invm-curse-n" }, rng, "Number of electrons N");
    const slider = H("input", { type: "range", id: "invm-curse-n", min: 0, max: 1000, step: 1, value: toPos(N) }, rng);
    const out = H("output", { for: "invm-curse-n" }, rng);

    const pair = H("div", { class: "invm-big-pair" }, host);
    const bigW = H("div", { class: "invm-big" }, pair);
    const bigD = H("div", { class: "invm-big is-density" }, pair);
    const cubeHost = H("div", { class: "invm-cube", "aria-hidden": "true" });
    bigD.appendChild(cubeHost);
    const wNum = H("div", { class: "inv-stat-num" }, bigW);
    H(
      "div",
      { class: "invm-big-sub" },
      bigW,
      "numbers to store the <b>wavefunction</b> ψ(r₁…r<sub>N</sub>), roughly: 3 coordinates per electron, 10 grid points each"
    );
    H("div", { class: "inv-stat-num" }, bigD, "10<sup>3</sup>");
    H(
      "div",
      { class: "invm-big-sub" },
      bigD,
      "numbers to store the electron <b>density</b> ρ(x,y,z), whatever N is: a fixed 10×10×10 grid of 1,000 cells"
    );

    // cube: three visible faces of a 10x10x10 grid
    const cube = S("svg", { width: 62, height: 62, viewBox: "0 0 62 62" }, cubeHost);
    {
      const ox = 4,
        oy = 58,
        s = 36,
        dx = 16,
        dy = -16;
      const g = S("g", { class: "invm-grid", style: "stroke:var(--invm-blue);stroke-width:.6;opacity:.8" }, cube);
      let d = "";
      for (let i = 0; i <= 10; i++) {
        const t = (i / 10) * s;
        d += `M${ox + t} ${oy}v${-s}M${ox} ${oy - t}h${s}`; // front
        d += `M${ox + t} ${oy - s}l${dx} ${dy}`; // top
        d += `M${ox + s} ${oy - t}l${dx} ${dy}`; // right
      }
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        d += `M${ox + u * dx} ${oy - s + u * dy}h${s}`; // top, lines parallel to front-x
        d += `M${ox + s + u * dx} ${oy + u * dy}v${-s}`; // right, vertical lines
      }
      S("path", { d }, g);
      S(
        "path",
        {
          d: `M${ox} ${oy}h${s}v${-s}h${-s}zM${ox} ${oy - s}l${dx} ${dy}h${s}l${-dx} ${-dy}M${ox + s} ${oy}l${dx} ${dy}v${-s}`,
          fill: "none",
          stroke: "var(--invm-blue)",
          "stroke-width": 1.2,
        },
        cube
      );
    }

    const stripHost = H("div", {}, host);
    const verdict = H("div", { class: "invm-verdict", "aria-live": "polite" }, host);
    H(
      "div",
      { class: "invm-note" },
      host,
      "Grain and atom counts are rough orders of magnitude. Spin is ignored. A coarse 10-point grid is already generous; real calculations use cleverer representations, which is precisely why the trick is to avoid ψ altogether."
    );

    const chart = makeChart(stripHost, (svg, w) => {
      const exp = 3 * N;
      const dmax = Math.max(100, Math.ceil((exp * 1.06) / 10) * 10);
      const l = 4,
        r = 8,
        top = 50,
        W = w - l - r;
      const X = (e) => l + (e / dmax) * W;
      const lines = [
        { e: 19, t: "≈ grains of sand on Earth (~10^{19})", row: 0 },
        { e: 80, t: "≈ atoms in the observable universe (~10^{80})", row: 1 },
      ];
      const barY = [top + 6, top + 44],
        bh = 14;
      // axis ticks
      const step = niceStep(dmax, w < 460 ? 4 : 8);
      for (let e = 0; e <= dmax; e += step) {
        S("line", { x1: X(e), x2: X(e), y1: top, y2: top + 76, class: "invm-grid" }, svg);
        ST(svg, { x: X(e), y: top + 90, "text-anchor": e === 0 ? "start" : X(e) > w - 18 ? "end" : "middle", class: "invm-2" }, ten(e));
      }
      S(
        "text",
        { x: l + W, y: top + 106, "text-anchor": "end", class: "invm-2" },
        svg,
        "number of numbers to store (log scale: each tick is 10× more)"
      );
      // reference lines (drawn on top of grid)
      lines.forEach((ln) => {
        const x = X(ln.e),
          y0 = 14 + ln.row * 14;
        S("line", { x1: x, x2: x, y1: y0 + 4, y2: top + 76, stroke: "var(--inv-ink-2)", "stroke-dasharray": "3 3", "stroke-width": 1 }, svg);
        const lab = ST(svg, { x: Math.min(x + 4, w - 4), y: y0, class: "invm-2", "text-anchor": x > w * 0.62 ? "end" : "start" }, ln.t);
        if (x > w * 0.62) lab.setAttribute("x", x - 4);
      });
      // bars
      const bw = S("rect", { x: X(0), y: barY[0], width: Math.max(2, X(exp) - X(0)), height: bh, rx: 2, fill: "var(--invm-red)" }, svg);
      const bd = S("rect", { x: X(0), y: barY[1], width: Math.max(2, X(3) - X(0)), height: bh, rx: 2, fill: "var(--invm-blue)" }, svg);
      const wl = `wavefunction ≈ ${ten(exp)}`;
      const inside = X(exp) - X(0) > 150;
      ST(
        svg,
        {
          x: inside ? X(exp) - 6 : X(exp) + 6,
          y: barY[0] + 11,
          "text-anchor": inside ? "end" : "start",
          class: inside ? "" : "invm-b",
          style: inside ? "fill:#fff" : "",
        },
        wl
      );
      ST(svg, { x: X(3) + 6, y: barY[1] + 11, class: "invm-b" }, "density 10^{3}");
      return top + 112;
    });

    function set(n) {
      N = Math.min(NMAX, Math.max(1, n));
      slider.value = toPos(N);
      update();
    }
    function update() {
      const exp = 3 * N;
      out.textContent = `N = ${N}`;
      presets.btns.forEach((b, i) => b.setAttribute("aria-pressed", String(stops[i].n === N)));
      wNum.innerHTML = rich(ten(exp));
      let v;
      if (exp <= 3) v = "With one electron there is no difference: the wavefunction and the density both fit in 1,000 numbers.";
      else if (exp <= 9) v = `About ${fmt(10 ** exp)} numbers: fits in a laptop's memory, just. Add a few more electrons and it will not.`;
      else if (exp <= 19)
        v = `${ten(exp)} numbers: far beyond any computer's memory. For scale, it is comparable to the number of grains of sand on Earth (${ten(19)}) at the top of this range.`;
      else if (exp <= 80)
        v = `${ten(exp)} numbers: more than the number of grains of sand on Earth, about ${ten(exp - 19)} times more. The density still needs 1,000.`;
      else
        v = `${ten(exp)} numbers: even one number per atom in the observable universe (~${ten(80)}) would fall short by a factor of about ${ten(exp - 80)}. The density still needs 1,000.`;
      verdict.innerHTML = rich(v);
      chart.setLabel(plain(`Storage needed: wavefunction roughly ${ten(exp)} numbers, density ${ten(3)} numbers, for ${N} electrons.`));
      chart.render();
    }
    slider.addEventListener("input", () => {
      N = fromPos(+slider.value);
      update();
    });
    update();
  });

  // =====================================================================
  // 2. #inv-basis
  // =====================================================================
  // STO-nG fits to a Slater 1s function (zeta = 1): Hehre, Stewart & Pople, J. Chem. Phys. 51, 2657 (1969), standard tabulation.
  // Normalised primitives: g(r) = (2a/pi)^(3/4) exp(-a r^2); coefficients d. Overlaps with the exact 1s are recomputed below.
  const STO = {
    1: { a: [0.27095], d: [1.0] },
    2: { a: [0.151623, 0.851819], d: [0.678914, 0.430129] },
    3: { a: [2.22766, 0.405771, 0.109818], d: [0.154329, 0.535328, 0.444635] },
    6: {
      a: [23.103031, 4.2359157, 1.1850565, 0.4070988, 0.1580884, 0.0651095],
      d: [0.00916359628, 0.04936149294, 0.1685383049, 0.3705627997, 0.4164915298, 0.1303340841],
    },
  };
  const SQRT_PI = Math.sqrt(Math.PI);
  // comparison function: exact is exp(-r); STO-nG expressed on the same scale (multiply by sqrt(pi)).
  const prim = (n, i, r) => SQRT_PI * STO[n].d[i] * ((2 * STO[n].a[i]) / Math.PI) ** 0.75 * Math.exp(-STO[n].a[i] * r * r);
  const gsum = (n, r) => STO[n].a.reduce((t, _, i) => t + prim(n, i, r), 0);
  const overlap = (n) => {
    // <STO-nG | exact 1s>; both normalised, radial integral by trapezoid
    let t = 0;
    const dr = 0.002;
    for (let r = 0; r < 40; r += dr) t += 4 * Math.PI * r * r * (gsum(n, r) / SQRT_PI) * (Math.exp(-r) / SQRT_PI) * dr;
    return t;
  };

  mount("inv-basis", (host) => {
    H("div", { class: "inv-kicker" }, host, "Part 1 · A hydrogen 1s orbital built from Gaussians");
    let n = 2,
      logY = false;
    const g1 = toggleGroup(
      host,
      [1, 2, 3, 6].map((k) => ({ id: k, label: `${k} Gaussian${k > 1 ? "s" : ""}` })),
      n,
      (k) => {
        n = k;
        draw();
      },
      "Number of Gaussians"
    );
    const g2 = toggleGroup(
      g1.box,
      [
        { id: "lin", label: "Linear scale" },
        { id: "log", label: "Log scale (see the tail)" },
      ],
      "lin",
      (k) => {
        logY = k === "log";
        draw();
      },
      "Vertical scale"
    );
    g2.box.style.margin = "0 0 0 auto";
    g2.box.style.display = "contents";
    const R = 5;
    const chart = makeChart(
      host,
      (svg, w) => {
        const l = 44,
          r = 10,
          t1 = 24,
          h1 = w < 460 ? 190 : 230,
          gap = 38,
          h2 = 86,
          bottom = 30;
        const pw = w - l - r;
        const X = (v) => l + (v / R) * pw;
        const yMin = 1e-3;
        const Y1 = (v) => (logY ? t1 + h1 - ((Math.log10(Math.max(v, yMin)) + 3) / 3.08) * h1 : t1 + h1 - (v / 1.05) * h1);
        // grid + axes
        const yTicks = logY ? [1e-3, 1e-2, 1e-1, 1] : [0, 0.25, 0.5, 0.75, 1];
        yTicks.forEach((v) => {
          S("line", { x1: l, x2: l + pw, y1: Y1(v), y2: Y1(v), class: "invm-grid" }, svg);
          ST(svg, { x: l - 6, y: Y1(v) + 4, "text-anchor": "end", class: "invm-2" }, logY ? ten(Math.round(Math.log10(v))) : String(v));
        });
        for (let v = 0; v <= R; v++) S("line", { x1: X(v), x2: X(v), y1: t1, y2: t1 + h1, class: "invm-grid", opacity: 0.5 }, svg);
        S("text", { x: 4, y: 10, class: "invm-2" }, svg, "ψ (scaled so ψ(0) = 1)");
        const path = (fn, N = 400, floor = 0) => {
          let d = "",
            pen = false;
          for (let i = 0; i <= N; i++) {
            const r = (i / N) * R,
              v = fn(r);
            if (v < floor) {
              pen = false;
              continue;
            }
            d += `${pen ? "L" : "M"}${X(r).toFixed(1)} ${Y1(v).toFixed(1)}`;
            pen = true;
          }
          return d;
        };
        const floor = logY ? yMin : -1;
        STO[n].a.forEach((_, i) =>
          S("path", { d: path((r) => prim(n, i, r), 300, floor), fill: "none", stroke: "var(--invm-blue)", "stroke-width": 1.2, opacity: 0.45 }, svg)
        );
        S("path", { d: path((r) => Math.exp(-r), 300, floor), fill: "none", stroke: "var(--inv-ink)", "stroke-width": 2.2 }, svg);
        S(
          "path",
          {
            d: path((r) => gsum(n, r), 300, floor),
            fill: "none",
            stroke: "var(--invm-red)",
            "stroke-width": 2.2,
            "stroke-dasharray": n === 6 ? "5 3" : null,
          },
          svg
        );
        // direct labels (top right, where the curves have already decayed)
        const rx = X(R) - 4;
        S("text", { x: rx, y: t1 + 16, "text-anchor": "end", class: "invm-b" }, svg, "exact: e⁻ʳ (Slater 1s)");
        S(
          "text",
          { x: rx, y: t1 + 31, "text-anchor": "end", class: "invm-b", style: "fill:var(--invm-red)" },
          svg,
          n === 1 ? "1 Gaussian" : `sum of ${n} Gaussians`
        );
        S("text", { x: rx, y: t1 + 46, "text-anchor": "end", class: "invm-2" }, svg, "faint blue: each Gaussian alone");
        // ratio panel
        const t2 = t1 + h1 + gap;
        S("text", { x: 4, y: t2 - 10, class: "invm-2" }, svg, "Gaussian sum ÷ exact (1 = perfect fit)");
        const Y2 = (v) => t2 + h2 - (v / 1.4) * h2;
        [0, 0.5, 1].forEach((v) => {
          S(
            "line",
            { x1: l, x2: l + pw, y1: Y2(v), y2: Y2(v), class: v === 1 ? "invm-axis" : "invm-grid", "stroke-dasharray": v === 1 ? "3 3" : null },
            svg
          );
          S("text", { x: l - 6, y: Y2(v) + 4, "text-anchor": "end", class: "invm-2" }, svg, v);
        });
        let d = "";
        for (let i = 0; i <= 300; i++) {
          const r = (i / 300) * R;
          d += `${i ? "L" : "M"}${X(r).toFixed(1)} ${Y2(gsum(n, r) / Math.exp(-r)).toFixed(1)}`;
        }
        S("path", { d, fill: "none", stroke: "var(--invm-red)", "stroke-width": 2 }, svg);
        for (let v = 0; v <= R; v++)
          S(
            "text",
            { x: X(v), y: t2 + h2 + 16, "text-anchor": v === 0 ? "start" : v === R ? "end" : "middle", class: "invm-2" },
            svg,
            v === R ? `${v} bohr` : v
          );
        S("text", { x: X(0) + 6, y: Y2(gsum(n, 0)) + (gsum(n, 0) > 0.8 ? -6 : 14), class: "invm-b" }, svg, "at the nucleus");
        S("text", { x: X(R) - 4, y: Y2(gsum(n, R) / Math.exp(-R)) - 8, "text-anchor": "end", class: "invm-b" }, svg, "far tail");
        return t2 + h2 + bottom;
      },
      "Gaussian approximations to a hydrogen 1s orbital"
    );
    const readout = H("div", { class: "inv-readout", "aria-live": "polite" }, host);
    H(
      "div",
      { class: "invm-note" },
      host,
      "Exponents and coefficients: the standard STO-nG least-squares fits (Hehre, Stewart & Pople, 1969) for a Slater function with ζ = 1; the overlaps below are recomputed here. Real basis sets then contract and add many such functions per atom."
    );

    function draw() {
      const r0 = gsum(n, 0),
        r3 = gsum(n, 3) / Math.exp(-3),
        r5 = gsum(n, 5) / Math.exp(-5);
      readout.innerHTML =
        `<b>${n} Gaussian${n > 1 ? "s" : ""}:</b> overlap with the exact orbital ${overlap(n).toFixed(4)} (1 = identical). ` +
        `At the nucleus the fit reaches ${(r0 * 100).toFixed(0)}% of the true value, and its slope there is 0 where the true orbital has a sharp cusp. ` +
        `At 3 bohr it is ${(r3 * 100).toFixed(0)}% of the true value; at 5 bohr, ${r5 < 0.01 ? "under 1%" : (r5 * 100).toFixed(0) + "%"}. Gaussians fall off too fast in the tail.`;
      chart.setLabel(
        `Sum of ${n} Gaussians fitted to a hydrogen 1s orbital. At the nucleus it reaches ${(r0 * 100).toFixed(0)} percent of the exact value.`
      );
      chart.render();
    }
    draw();

    // ---- Part 2: aug-cc-pVTZ ----
    H("div", { class: "inv-kicker", style: "margin-top:1.6rem" }, host, "Part 2 · Reading “aug-cc-pVTZ”");
    const chips = H("div", { class: "invm-chips" }, host);
    [
      [
        "aug-",
        "augmented",
        "Adds extra, spread-out (diffuse) functions so electrons far from the nuclei have room: tails, cations' neighbours, weak interactions.",
      ],
      ["cc-", "correlation-consistent", "Functions chosen in a fixed hierarchy so that energies improve smoothly as you climb DZ, TZ, QZ…"],
      ["p", "polarised", "Adds higher-angular-momentum functions (p on H, d on O…) so orbitals can bend and shift towards neighbours."],
      ["V", "valence", "The extra functions go to valence electrons, where bonding happens; core electrons get a cheaper description."],
      ["TZ", "triple zeta", "Three functions per valence orbital, so it can shrink or swell. DZ has two; QZ has four."],
    ].forEach(([a, b, c]) => H("div", { class: "invm-chip" }, chips, `<small>${b}</small><b>${a}</b>${c}`));

    const rows = ["H", "C", "O", "P"]
      .map((a) => `<tr><td>${a}</td><td>${shellStr(a)}</td><td>${arith(a)}</td><td class="num">${NB[a]}</td></tr>`)
      .join("");
    H(
      "table",
      { class: "invm-table" },
      host,
      `<thead><tr><th>Atom</th><th>aug-cc-pVTZ shells</th><th>Functions (shells × 1, 3, 5, 7 for s, p, d, f)</th><th style="text-align:right">Per atom</th></tr></thead><tbody>${rows}</tbody>`
    );
    H("div", { class: "invm-label" }, host, "Basis functions for each system (sum over atoms)");
    const maxN = Math.max(...SYSTEMS.map((s) => s.n));
    const tot = H("div", { class: "invm-tot", style: "margin-top:.4rem" }, host);
    SYSTEMS.forEach((s) => {
      H("span", {}, tot, s.label);
      H("span", { class: "bar" }, tot, `<i class="${s.caged ? "caged" : ""}" style="width:${(s.n / maxN) * 100}%"></i>`);
      H("span", { class: "v" }, tot, fmt(s.n));
    });
  });

  // =====================================================================
  // 3. #inv-cost
  // =====================================================================
  mount("inv-cost", (host) => {
    let sys = "oh";
    toggleGroup(
      host,
      [
        { id: "oh", label: "OH₃⁺ → OH₃⁺@C₆₀" },
        { id: "ph", label: "PH₃ → PH₃@C₆₀" },
      ],
      sys,
      (k) => {
        sys = k;
        draw();
      },
      "Choose the molecule"
    );
    const curves = [
      { id: "ccsdt", p: 7, label: "CCSD(T)  ~N⁷", short: "CCSD(T) N⁷", color: "var(--invm-red)" },
      { id: "mp2", p: 5, label: "MP2  ~N⁵", short: "MP2 N⁵", color: "var(--invm-amber)" },
      { id: "dft", p: 4, p2: 3, label: "HF / DFT  ~N³–N⁴", short: "DFT N³–⁴", color: "var(--invm-blue)" },
      { id: "dlpno", p: 1, label: "DLPNO-CCSD(T) ≈ linear", short: "DLPNO ≈N", color: "var(--invm-green)", dash: "5 3" },
    ];
    const chart = makeChart(
      host,
      (svg, w) => {
        const n0 = NSYS[sys],
          n1 = NSYS[sys + "C60"];
        const l = 50,
          rr = w < 460 ? 72 : 150,
          t = 26,
          h = w < 460 ? 250 : 290,
          b = 40;
        const pw = w - l - rr;
        const x0 = 40,
          x1 = 6000,
          y0 = -3,
          y1 = 12;
        const X = (v) => l + ((Math.log10(v) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0))) * pw;
        const Y = (e) => t + h - ((e - y0) / (y1 - y0)) * h;
        const cost = (p, nn) => p * Math.log10(nn / n0);
        for (let e = 0; e <= 12; e += 3) {
          S("line", { x1: l, x2: l + pw, y1: Y(e), y2: Y(e), class: "invm-grid" }, svg);
          ST(svg, { x: l - 6, y: Y(e) + 4, "text-anchor": "end", class: "invm-2" }, e === 0 ? "1×" : ten(e) + "×");
        }
        [100, 1000].forEach((v) => {
          S("line", { x1: X(v), x2: X(v), y1: t, y2: t + h, class: "invm-grid", opacity: 0.6 }, svg);
          S("text", { x: X(v), y: t + h + 16, "text-anchor": "middle", class: "invm-2" }, svg, fmt(v));
        });
        S("text", { x: X(x1), y: t + h + 16, "text-anchor": "end", class: "invm-2" }, svg, "6,000");
        S("text", { x: l + pw / 2, y: t + h + 33, "text-anchor": "middle", class: "invm-2" }, svg, "number of basis functions N (log scale)");
        S("text", { x: 4, y: 8, class: "invm-2" }, svg, "cost relative to the free molecule");
        // DFT band
        const dft = curves[2];
        let bd = "";
        const pts = 60,
          xs = Array.from({ length: pts + 1 }, (_, i) => Math.pow(10, Math.log10(x0) + (i / pts) * (Math.log10(x1) - Math.log10(x0))));
        bd +=
          xs.map((v, i) => `${i ? "L" : "M"}${X(v)} ${Y(cost(4, v))}`).join("") +
          [...xs]
            .reverse()
            .map((v) => `L${X(v)} ${Y(cost(3, v))}`)
            .join("") +
          "Z";
        S("path", { d: bd, fill: "var(--invm-blue)", opacity: 0.16 }, svg);
        // curves
        curves.forEach((c) => {
          const d = xs.map((v, i) => `${i ? "L" : "M"}${X(v).toFixed(1)} ${Y(cost(c.p, v)).toFixed(1)}`).join("");
          S("path", { d, fill: "none", stroke: c.color, "stroke-width": 2, "stroke-dasharray": c.dash || null }, svg);
          const ey = Y(cost(c.p, x1));
          S("text", { x: X(x1) + 6, y: Math.min(Math.max(ey + 4, t + 8), t + h), class: "invm-b" }, svg, w < 460 ? c.short : c.label);
        });
        // markers
        [
          [n0, "free", ""],
          [n1, "caged", ""],
        ].forEach(([nn, name], i) => {
          S("line", { x1: X(nn), x2: X(nn), y1: t, y2: t + h, stroke: "var(--inv-ink)", "stroke-width": 1.2, "stroke-dasharray": "2 3" }, svg);
          const lab =
            (w < 460 ? (i ? "caged" : "free") : i ? (sys === "oh" ? "OH₃⁺@C₆₀" : "PH₃@C₆₀") : sys === "oh" ? "free OH₃⁺" : "free PH₃") +
            " · " +
            fmt(nn);
          S("text", { x: X(nn) + (i ? -5 : 5), y: t + h - 8, "text-anchor": i ? "end" : "start", class: "invm-b" }, svg, lab);
          curves.forEach((c) =>
            S("circle", { cx: X(nn), cy: Y(cost(c.p, nn)), r: 4.5, fill: c.color, stroke: "var(--global-bg-color)", "stroke-width": 2 }, svg)
          );
        });
        return t + h + b;
      },
      "Formal computational cost against number of basis functions"
    );
    const readout = H("div", { class: "inv-readout", "aria-live": "polite" }, host);
    H(
      "div",
      { class: "invm-note" },
      host,
      "Formal textbook scalings only: each curve is anchored at 1× for the free molecule, so the chart shows growth, not absolute time. Real programs beat these exponents with screening and local methods, which is exactly what DLPNO does. The wall-time figure is an illustration, not a measurement."
    );

    function draw() {
      const n0 = NSYS[sys],
        n1 = NSYS[sys + "C60"],
        q = n1 / n0;
      const yrs = q ** 7 / 525960;
      readout.innerHTML =
        `Going from the free molecule (${fmt(n0)} functions) to the caged one (${fmt(n1)}) multiplies the basis by ×${q.toFixed(1)}. ` +
        `That multiplies the cost of <b>CCSD(T)</b> by about <b>×${sciH(q ** 7, 2)}</b> but <b>DFT</b> by about <b>×${sciH(q ** 4, 2)}</b> (×${sciH(q ** 3, 2)} at N³). ` +
        `<br><span class="invm-label">Illustration: if CCSD(T) on the free molecule took 1 minute, the caged one would take roughly ${yrs > 1000 ? fmt(Math.round(yrs / 100) * 100) : fmt(yrs)} years. DLPNO-CCSD(T), roughly linear for large molecules, would cost only about ×${q.toFixed(0)}.</span>`;
      chart.setLabel(
        `Cost multiplier from ${fmt(n0)} to ${fmt(n1)} basis functions: CCSD(T) about ${INV.sci(q ** 7, 2)}, DFT about ${INV.sci(q ** 4, 2)}.`
      );
      chart.render();
    }
    draw();
  });

  // =====================================================================
  // 4. #inv-bench
  // =====================================================================
  mount("inv-bench", (host) => {
    const B = INV.BENCHMARK;
    const NAMES = { B3LYP: "B3LYP", PBE1PBE: "PBE1PBE", M062X: "M06-2X", MN15: "MN15", B97D: "B97-D", MP2: "MP2" };
    const SYS = [
      { id: "oh", label: "OH₃⁺ (hydronium)", color: "var(--inv-oh)" },
      { id: "ph", label: "PH₃ (phosphine)", color: "var(--inv-ph)" },
    ];
    const chart = makeChart(
      host,
      (svg, w) => {
        const wide = w >= 560;
        const l = w < 460 ? 62 : 74,
          rr = wide ? 84 : 12,
          rowH = 26,
          head = 52,
          axisH = 36;
        const pw = w - l - rr;
        let y = 0;
        SYS.forEach((sy) => {
          const d = B[sy.id],
            ref = d.ref,
            ex = d.expt;
          const x0 = 0.2 * ref,
            x1 = 1.15 * ref;
          const X = (v) => l + ((v - x0) / (x1 - x0)) * pw;
          const top = y + head;
          S("text", { x: 0, y: y + 14, class: "invm-b invm-lg" }, svg, sy.label);
          if (wide) S("text", { x: w, y: y + 14, "text-anchor": "end", class: "invm-2" }, svg, "error, aug-cc-pVTZ");
          // reference labels
          const refIsLeft = ref < ex;
          const rowL = y + 40,
            rowR = y + 26;
          S("text", { x: X(ref) - 4, y: refIsLeft ? rowL : rowR, "text-anchor": "end", class: "invm-2" }, svg, `CCSD(T)/QZ ${fmt(ref)}`);
          S("text", { x: X(ex) - 4, y: refIsLeft ? rowR : rowL, "text-anchor": "end", class: "invm-2" }, svg, `reference ${fmt(ex)}`);
          const step = niceStep(x1 - x0, w < 460 ? 3 : 6);
          for (let v = Math.ceil(x0 / step) * step; v <= x1; v += step) {
            S("line", { x1: X(v), x2: X(v), y1: top, y2: top + rowH * 6, class: "invm-grid" }, svg);
            S("text", { x: X(v), y: top + rowH * 6 + 14, "text-anchor": "middle", class: "invm-2" }, svg, fmt(v));
          }
          S("text", { x: l, y: top + rowH * 6 + 30, class: "invm-2" }, svg, "barrier height (cm⁻¹) · same relative scale in both panels");
          B.methods.forEach((m, i) => {
            const cy = top + i * rowH + rowH / 2;
            const chosen = m === "B97D";
            if (chosen) {
              S("rect", { x: 0, y: top + i * rowH + 1, width: w - (wide ? 0 : 0), height: rowH - 2, rx: 4, fill: "var(--inv-soft)" }, svg);
              S("rect", { x: 0, y: top + i * rowH + 1, width: 3, height: rowH - 2, fill: "var(--inv-accent)" }, svg);
            }
            S("text", { x: 8, y: cy + 4, class: chosen ? "invm-b" : "" }, svg, NAMES[m]);
            const [a, b] = d[m];
            S("line", { x1: X(a), x2: X(b), y1: cy, y2: cy, stroke: sy.color, "stroke-width": 1.5, opacity: 0.45 }, svg);
          });
          // reference lines on top of the row bands
          S(
            "line",
            {
              x1: X(ref),
              x2: X(ref),
              y1: refIsLeft ? y + 44 : y + 30,
              y2: top + rowH * 6,
              stroke: "var(--inv-ink)",
              "stroke-width": 1.3,
              "stroke-dasharray": "5 3",
            },
            svg
          );
          S(
            "line",
            {
              x1: X(ex),
              x2: X(ex),
              y1: refIsLeft ? y + 30 : y + 44,
              y2: top + rowH * 6,
              stroke: "var(--inv-ink-2)",
              "stroke-width": 1.3,
              "stroke-dasharray": "1.5 3",
            },
            svg
          );
          B.methods.forEach((m, i) => {
            const cy = top + i * rowH + rowH / 2;
            const vals = d[m];
            [
              ["aug-cc-pVTZ", vals[0], true],
              ["6-311G**", vals[1], false],
            ].forEach(([bs, v, filled]) => {
              const err = ((v - ref) / ref) * 100;
              const g = S(
                "g",
                {
                  tabindex: 0,
                  class: "invm-focus",
                  role: "img",
                  "aria-label": `${sy.label} ${NAMES[m]} ${bs}: ${fmt(v)} per cm, ${signed(err, 0)} percent versus CCSD(T)`,
                },
                svg
              );
              S("circle", { cx: X(v), cy, r: 8, class: "invm-hit" }, g);
              S(
                "circle",
                { cx: X(v), cy, r: 5, fill: filled ? sy.color : "var(--global-bg-color)", stroke: sy.color, "stroke-width": 2, class: "invm-ring" },
                g
              );
              const show = (e) =>
                INV.showTooltip(
                  `<b>${NAMES[m]}</b> / ${bs}<br>${fmt(v)} cm⁻¹<br>${signed(err, 1)}% vs CCSD(T)/aug-cc-pVQZ`,
                  e.type === "focus" ? g : e
                );
              g.addEventListener("pointerenter", show);
              g.addEventListener("pointermove", show);
              g.addEventListener("click", show);
              g.addEventListener("focus", show);
              g.addEventListener("pointerleave", INV.hideTooltip);
              g.addEventListener("blur", INV.hideTooltip);
            });
            if (wide) {
              const err = ((vals[0] - ref) / ref) * 100;
              S("text", { x: w, y: cy + 4, "text-anchor": "end", class: m === "B97D" ? "invm-b" : "invm-2" }, svg, `${signed(err, 0)}%`);
            }
          });
          y = top + rowH * 6 + axisH + 18;
        });
        return y - 8;
      },
      "Barrier heights from six methods for OH3+ and PH3, compared with CCSD(T) and reference values"
    );
    const leg = H("div", { class: "inv-legend" }, host);
    leg.innerHTML =
      `<span><i class="invm-leg-dot" style="background:var(--inv-ink-2)"></i>aug-cc-pVTZ</span>` +
      `<span><i class="invm-leg-dot" style="border:2px solid var(--inv-ink-2)"></i>6-311G**</span>` +
      `<span><i class="invm-leg-line"></i>CCSD(T)/aug-cc-pVQZ</span>` +
      `<span><i class="invm-leg-line" style="border-top-style:dotted"></i>reference (OH₃⁺: fit to spectra; PH₃: 1954 estimate)</span>` +
      `<span><i class="invm-swatch" style="background:var(--inv-soft);border-left:3px solid var(--inv-accent)"></i>method chosen</span>`;
    H(
      "div",
      { class: "invm-note" },
      host,
      "Hover, tap or tab to a dot for its value and error. Phosphine’s barrier is large and every method lands within about 7% of the reference; hydronium’s is small and delicate, and methods disagree by up to 64%. Even M06-2X, which worked for ammonia in earlier work, gives 463 cm⁻¹ here."
    );
  });

  // =====================================================================
  // 5. #inv-led
  // =====================================================================
  mount("inv-led", (host) => {
    const L = INV.LED,
      I = INV.INTERACTION;
    const SYS = [
      { id: "ohC60", label: "OH₃⁺@C₆₀" },
      { id: "phC60", label: "PH₃@C₆₀" },
    ];
    const short = {
      prep: "Preparation",
      elstat: "Electrostatics",
      exch: "Exchange",
      disp: "Dispersion",
      nondisp: "Non-disp. correlation",
      triples: "Triples (T)",
    };
    const col = {
      prep: "var(--invm-slate)",
      elstat: "var(--invm-blue)",
      exch: "var(--invm-green)",
      disp: "var(--invm-amber)",
      nondisp: "var(--invm-amber)",
      triples: "var(--invm-amber)",
      sum: "var(--inv-ink)",
    };
    const opa = { nondisp: 0.5, triples: 0.5, sum: 0.8 };
    const reported = { ohC60: I.ohC60.dlpno, phC60: I.phC60.dlpno };
    H("div", { class: "inv-kicker" }, host, "Interaction energy, step by step (kcal/mol, DLPNO-CCSD(T))");
    const summary = H("div", { class: "inv-readout", "aria-live": "polite" }, host);
    const chart = makeChart(
      host,
      (svg, w) => {
        const l = 124,
          rr = 64,
          rowH = 24,
          head = 24,
          axisH = 34;
        const pw = w - l - rr;
        const lo = -45,
          hi = 185;
        const X = (v) => l + ((v - lo) / (hi - lo)) * pw;
        let y = 0;
        SYS.forEach((sy) => {
          const d = L[sy.id];
          S("text", { x: 0, y: y + 14, class: "invm-b invm-lg" }, svg, sy.label);
          const top = y + head;
          const nrow = 7;
          for (let v = -40; v <= 160; v += 40) {
            S("line", { x1: X(v), x2: X(v), y1: top, y2: top + nrow * rowH, class: v === 0 ? "invm-axis" : "invm-grid" }, svg);
            S("text", { x: X(v), y: top + nrow * rowH + 14, "text-anchor": "middle", class: "invm-2" }, svg, v < 0 ? MINUS + Math.abs(v) : v);
          }
          let cum = 0;
          const bars = L.terms.map((t) => {
            const a = cum;
            cum += d[t.key];
            return { key: t.key, a, b: cum, v: d[t.key] };
          });
          const sum = cum;
          bars.push({ key: "sum", a: 0, b: sum, v: sum });
          bars.forEach((b, i) => {
            const cy = top + i * rowH + rowH / 2;
            const x1 = X(Math.min(b.a, b.b)),
              x2 = X(Math.max(b.a, b.b));
            const isSum = b.key === "sum";
            S(
              "text",
              { x: 0, y: cy + 4, class: isSum ? "invm-b" : b.key === "elstat" || b.key === "disp" ? "invm-b" : "" },
              svg,
              isSum ? "Sum of terms" : short[b.key]
            );
            const g = S(
              "g",
              {
                tabindex: 0,
                class: "invm-focus",
                role: "img",
                "aria-label": `${sy.label} ${isSum ? "sum of terms" : short[b.key]}: ${signed(b.v)} kcal per mol`,
              },
              svg
            );
            S(
              "rect",
              {
                x: x1,
                y: cy - 8,
                width: Math.max(2, x2 - x1 - 1),
                height: 16,
                rx: 2,
                fill: col[b.key],
                opacity: opa[b.key] || 1,
                class: "invm-ring",
              },
              g
            );
            S("rect", { x: x1 - 2, y: cy - 12, width: x2 - x1 + 4, height: 24, class: "invm-hit" }, g);
            const lab = isSum ? `${signed(b.v)}  (paper: ${signed(reported[sy.id])})` : signed(b.v);
            const t = S("text", { x: x2 + 8, y: cy + 4, class: isSum ? "invm-b" : "" }, g, lab);
            if (isSum && x2 + 6 + 90 > w) (t.setAttribute("x", Math.max(l, x1 - 6)), t.setAttribute("text-anchor", "end"));
            if (i < bars.length - 1 && !isSum)
              S(
                "line",
                { x1: X(b.b), x2: X(b.b), y1: cy + 8, y2: cy + rowH - 8, stroke: "var(--inv-ink-2)", "stroke-width": 1, "stroke-dasharray": "2 2" },
                svg
              );
            const tip = () =>
              INV.showTooltip(`<b>${isSum ? "Sum of terms" : short[b.key]}</b><br>${signed(b.v)} kcal/mol<br>running total ${signed(b.b)}`, g);
            g.addEventListener("pointerenter", (e) =>
              INV.showTooltip(`<b>${isSum ? "Sum of terms" : short[b.key]}</b><br>${signed(b.v)} kcal/mol<br>running total ${signed(b.b)}`, e)
            );
            g.addEventListener("click", tip);
            g.addEventListener("focus", tip);
            g.addEventListener("pointerleave", INV.hideTooltip);
            g.addEventListener("blur", INV.hideTooltip);
          });
          y = top + nrow * rowH + axisH;
        });
        S("text", { x: l, y: y - 4, class: "invm-2" }, svg, "kcal/mol; bars float from the running total");
        return y + 6;
      },
      "Local energy decomposition waterfall for OH3+@C60 and PH3@C60"
    );

    // shares
    const share = (id) => {
      const d = L[id];
      const attr = L.terms.filter((t) => t.key !== "prep").reduce((s, t) => s - d[t.key], 0);
      return { e: (-d.elstat / attr) * 100, d: (-d.disp / attr) * 100, dv: d.disp };
    };
    const so = share("ohC60"),
      sp = share("phC60");
    summary.innerHTML = `Of the stabilising terms, electrostatics supplies <b>${so.e.toFixed(0)}%</b> for hydronium but <b>${sp.e.toFixed(0)}%</b> for phosphine; dispersion supplies <b>${so.d.toFixed(0)}%</b> versus <b>${sp.d.toFixed(0)}%</b> (${Math.abs(sp.dv)} against ${Math.abs(so.dv)} kcal/mol).`;
    H(
      "div",
      { class: "invm-note" },
      host,
      `Footnote: the six terms sum to ${signed(Object.values(L.terms).reduce((s, t) => s + L.ohC60[t.key], 0))} (OH₃⁺@C₆₀) and ${signed(L.terms.reduce((s, t) => s + L.phC60[t.key], 0))} (PH₃@C₆₀); the paper reports totals of ${signed(I.ohC60.dlpno)} and ${signed(I.phC60.dlpno)}. The OH₃⁺ difference is rounding; the PH₃ gap of 0.5 kcal/mol is larger than rounding alone would explain, so the last bar shows the sum of the published terms.`
    );

    // companion: B97-D vs DLPNO
    H("div", { class: "inv-kicker", style: "margin-top:1.6rem" }, host, "Does B97-D get the binding right? Interaction energy (kcal/mol)");
    const cmp = makeChart(
      host,
      (svg, w) => {
        const l = w < 460 ? 108 : 150,
          rr = 46,
          rowH = 22,
          head = 22;
        const pw = w - l - rr;
        const X = (v) => l + (v / 40) * pw;
        let y = 0;
        SYS.forEach((sy) => {
          const d = I[sy.id];
          S("text", { x: 0, y: y + 14, class: "invm-b invm-lg" }, svg, sy.label);
          const rowsC = [
            ["B97-D", d.b97d, "var(--invm-blue)"],
            [w < 460 ? "B97-D + CP" : "B97-D, counterpoise", d.b97dCP, "var(--invm-blue)"],
            ["DLPNO-CCSD(T)", d.dlpno, "var(--inv-ink)"],
          ];
          rowsC.forEach(([nm, v, c], i) => {
            const cy = y + head + i * rowH + rowH / 2;
            S("text", { x: 0, y: cy + 4, class: i === 2 ? "invm-b" : "" }, svg, nm);
            S("rect", { x: X(0), y: cy - 7, width: X(-v) - X(0), height: 14, rx: 2, fill: c, opacity: i === 2 ? 0.8 : i === 1 ? 0.55 : 0.85 }, svg);
            S("text", { x: X(-v) + 6, y: cy + 4, class: "invm-b" }, svg, signed(v));
          });
          y += head + 3 * rowH + 14;
        });
        return y;
      },
      "Interaction energies from B97-D and DLPNO-CCSD(T)"
    );
    H(
      "div",
      { class: "invm-note" },
      host,
      `Bar length is the strength of binding. B97-D slightly over-binds hydronium (by about ${((-I.ohC60.b97d / -I.ohC60.dlpno - 1) * 100).toFixed(0)}%) but finds only ${((I.phC60.b97dCP / I.phC60.dlpno) * 100).toFixed(0)}–${((I.phC60.b97d / I.phC60.dlpno) * 100).toFixed(0)}% of the binding of phosphine: roughly half. CP = counterpoise-corrected.`
    );
  });

  // =====================================================================
  // 6. #inv-scf
  // =====================================================================
  mount("inv-scf", (host) => {
    const STEPS = [
      { t: ["Guess", "density"], d: "Start with a guess for where the electrons are: a rough density, often just a sum of atoms." },
      {
        t: ["Build effective", "potential"],
        d: "Each electron feels the nuclei and the average field of all the others. Turn the current density into that one-electron potential (the Fock or Kohn–Sham matrix).",
      },
      {
        t: ["Solve for", "orbitals"],
        d: "Solve the one-electron equations in this potential for the best orbitals, then fill the lowest ones with the electrons.",
      },
      {
        t: ["Make new", "density"],
        d: "Square the occupied orbitals and add them up: this is the density the electrons would actually have in that field.",
      },
      {
        t: ["Changed", "less than ε?"],
        d: "Compare new and old energy or density. If the change is still above the threshold, feed the new density back in; if not, the field is self-consistent and the loop stops.",
      },
    ];
    const DE = [3e-1, 4e-2, 6e-3, 1.1e-3, 2e-4, 3.5e-5, 6e-6, 8e-7];
    const THR = 1e-6;
    const wrap = H("div", { class: "invm-scf" }, host);
    const left = H("div", {}, wrap);
    const right = H("div", {}, wrap);
    const ctl = H("div", { class: "inv-controls" }, left);
    const playBtn = H("button", { type: "button", class: "inv-btn" }, ctl, "Pause");
    const restartBtn = H("button", { type: "button", class: "inv-btn" }, ctl, "Restart");
    const desc = H("div", { class: "invm-desc", "aria-live": "polite" }, left);
    const status = H("div", { class: "invm-note", "aria-live": "polite" });

    let sel = 0,
      userPicked = false,
      playing = !INV.reduceMotion,
      visible = true;
    let iter = INV.reduceMotion ? DE.length : 0; // completed iterations shown on the plot
    let phase = 0; // 0..5, position of the pulse in node units
    let nodesG = [];
    const NN = STEPS.length;
    let geo = null;

    const cycle = makeChart(
      left,
      (svg, w) => {
        const h = 330,
          cx = w / 2,
          cy = h / 2 - 2;
        const bw = Math.min(104, w * 0.3),
          bh = 40;
        const rx = Math.max(60, w / 2 - bw / 2 - 8),
          ry = 116;
        geo = { cx, cy, rx, ry };
        const P = (a) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
        const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / NN;
        S("ellipse", { cx, cy, rx, ry, fill: "none", stroke: "var(--inv-rule)", "stroke-width": 2 }, svg);
        for (let i = 0; i < NN; i++) {
          const a = ang(i) + Math.PI / NN,
            [x, y] = P(a);
          const tx = -rx * Math.sin(a),
            ty = ry * Math.cos(a),
            th = (Math.atan2(ty, tx) * 180) / Math.PI;
          S("path", { d: "M-5 -5L5 0L-5 5z", fill: "var(--inv-ink-2)", transform: `translate(${x} ${y}) rotate(${th})` }, svg);
        }
        nodesG = STEPS.map((s, i) => {
          const [x, y] = P(ang(i));
          const g = S(
            "g",
            { class: "invm-node", tabindex: 0, role: "button", "aria-label": `Step ${i + 1}: ${s.t.join(" ")}`, transform: `translate(${x} ${y})` },
            svg
          );
          S("rect", { x: -bw / 2, y: -bh / 2, width: bw, height: bh, rx: 9 }, g);
          S("text", { x: 0, y: -2, "text-anchor": "middle", class: "invm-b" }, g, s.t[0]);
          S("text", { x: 0, y: 11, "text-anchor": "middle", class: "invm-b" }, g, s.t[1]);
          S("circle", { cx: -bw / 2, cy: -bh / 2, r: 9, fill: "var(--inv-accent)" }, g);
          S("text", { x: -bw / 2, y: -bh / 2 + 4, "text-anchor": "middle", style: "fill:var(--global-bg-color)", class: "invm-b" }, g, i + 1);
          const pick = () => {
            sel = i;
            userPicked = true;
            showSel();
          };
          g.addEventListener("click", pick);
          g.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick()));
          return g;
        });
        S("text", { x: cx, y: cy - 4, "text-anchor": "middle", class: "invm-2" }, svg, "repeat until");
        S("text", { x: cx, y: cy + 11, "text-anchor": "middle", class: "invm-2" }, svg, "self-consistent");
        S("circle", { id: "invm-pulse", r: 7, fill: "var(--invm-red)", stroke: "var(--global-bg-color)", "stroke-width": 2 }, svg);
        placePulse();
        showSel();
        return h;
      },
      "Self-consistent field loop with five steps"
    );

    function placePulse() {
      const p = document.querySelector("#inv-scf #invm-pulse");
      if (!p || !geo) return;
      const a = -Math.PI / 2 + (phase * 2 * Math.PI) / NN;
      p.setAttribute("cx", geo.cx + geo.rx * Math.cos(a));
      p.setAttribute("cy", geo.cy + geo.ry * Math.sin(a));
      p.style.display = playing || phase > 0 ? "" : "none";
    }
    function showSel() {
      nodesG.forEach((g, i) => g.classList.toggle("is-on", i === sel));
      desc.innerHTML = `<b>${sel + 1}. ${STEPS[sel].t.join(" ")}.</b> ${STEPS[sel].d}`;
    }

    // convergence plot
    const conv = makeChart(
      right,
      (svg, w) => {
        const l = 44,
          r = 10,
          t = 22,
          h = 250,
          b = 34,
          pw = w - l - r;
        const nx = 10;
        const X = (i) => l + (i / nx) * pw;
        const Y = (v) => t + h - ((Math.log10(v) + 8) / 8.4) * h;
        S("text", { x: 0, y: 10, class: "invm-b" }, svg, "Energy change per iteration");
        S("text", { x: w, y: 10, "text-anchor": "end", class: "invm-2" }, svg, "illustrative numbers");
        for (let e = -8; e <= 0; e += 2) {
          S("line", { x1: l, x2: l + pw, y1: Y(10 ** e), y2: Y(10 ** e), class: "invm-grid" }, svg);
          ST(svg, { x: l - 6, y: Y(10 ** e) + 4, "text-anchor": "end", class: "invm-2" }, ten(e));
        }
        for (let i = 0; i <= nx; i += 2) S("text", { x: X(i), y: t + h + 16, "text-anchor": "middle", class: "invm-2" }, svg, i);
        S("text", { x: l + pw / 2, y: t + h + 30, "text-anchor": "middle", class: "invm-2" }, svg, "iteration");
        S("line", { x1: l, x2: l + pw, y1: Y(THR), y2: Y(THR), stroke: "var(--invm-green)", "stroke-width": 1.5, "stroke-dasharray": "5 3" }, svg);
        S("text", { x: l + 4, y: Y(THR) - 5, style: "fill:var(--invm-green)", class: "invm-b" }, svg, "threshold ε");
        const pts = DE.slice(0, iter);
        if (pts.length > 1)
          S(
            "path",
            { d: pts.map((v, i) => `${i ? "L" : "M"}${X(i + 1)} ${Y(v)}`).join(""), fill: "none", stroke: "var(--invm-red)", "stroke-width": 2 },
            svg
          );
        pts.forEach((v, i) =>
          S(
            "circle",
            {
              cx: X(i + 1),
              cy: Y(v),
              r: 4,
              fill: v <= THR ? "var(--invm-green)" : "var(--invm-red)",
              stroke: "var(--global-bg-color)",
              "stroke-width": 1.5,
            },
            svg
          )
        );
        return t + h + b;
      },
      "Energy change per iteration falling on a log scale (illustrative)"
    );

    right.appendChild(status);
    function updateStatus() {
      const done = iter >= DE.length;
      status.innerHTML = done
        ? `Converged after ${DE.length} iterations: the change (${sciH(DE[DE.length - 1], 1)}) is below ε. A typical calculation takes 10–30 iterations; the numbers here are illustrative, not from the paper.`
        : `Iteration ${iter + 1}: last energy change ${iter ? sciH(DE[iter - 1], 2) : "–"}. Click any box for what the step does.`;
      conv.setLabel(
        `Energy change per iteration, illustrative: ${iter} of ${DE.length} points shown${done ? ", converged below the threshold" : ""}.`
      );
      conv.render();
    }

    let last = 0;
    const SPEED = 2.4; // nodes per second
    function frame(ts) {
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      if (playing && visible && !document.hidden) {
        phase += dt * SPEED;
        if (!userPicked) {
          sel = Math.floor(phase) % NN;
          showSel();
        }
        if (phase >= NN) {
          phase -= NN;
          iter = Math.min(DE.length, iter + 1);
          updateStatus();
          if (iter >= DE.length) {
            playing = false;
            phase = 0;
            playBtn.textContent = "Play";
          }
        }
        placePulse();
      }
      requestAnimationFrame(frame);
    }
    playBtn.addEventListener("click", () => {
      if (iter >= DE.length) restart();
      else playing = !playing;
      playBtn.textContent = playing ? "Pause" : "Play";
      placePulse();
    });
    function restart() {
      iter = 0;
      phase = 0;
      playing = true;
      userPicked = false;
      sel = 0;
      showSel();
      updateStatus();
      playBtn.textContent = "Pause";
    }
    restartBtn.addEventListener("click", restart);
    INV.watchVisibility(host, (v) => (visible = v));
    if (INV.reduceMotion) {
      playBtn.textContent = "Play";
      playBtn.disabled = true;
      restartBtn.disabled = true;
      iter = DE.length;
    } else requestAnimationFrame(frame);
    updateStatus();
    placePulse();
  });
})();
