// Shared data and helpers for the umbrella-inversion post. Exposes window.INV.
// Numbers are from Mishra, Mehta, Chidambaram, Krishna & Srinivasan, PCCP 2026 (doi:10.1039/d5cp03624k);
// table and equation numbers below refer to that paper.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Unit conversions
  const HARTREE_CM = 219474.6313; // 1 hartree in cm^-1
  const AMU_ME = 1822.888486; // 1 amu in electron masses
  const CM_KCAL = 1 / 349.755; // 1 cm^-1 in kcal/mol
  const CM_HZ = 2.99792458e10; // 1 cm^-1 in Hz (multiply by c in cm/s)
  const KT_300_CM = 208.5; // k_B T at 300 K, in cm^-1

  // Fitted double-well potentials, eqn (6) with the signs restored:
  //   V(x) = A x^4 + B exp(-C x^2) - D x^2
  // x is the mass-weighted reaction coordinate (bohr amu^1/2), V in cm^-1 (Table 6).
  // Solving the 1D Schrodinger equation on these reproduces the paper's eigenvalues; the free OH3+
  // parameters (B = 701) reproduce the CCSD(T)/aug-cc-pVQZ levels of Table 7.
  const POTENTIALS = {
    oh: { label: "OH₃⁺", name: "hydronium", A: 856.7545, B: 701, C: 1.4066, D: 958.402 },
    ohC60: { label: "OH₃⁺@C₆₀", name: "hydronium in C₆₀", A: 966.7, B: 870, C: 1, D: 1287.6 },
    ph: { label: "PH₃", name: "phosphine", A: 67.2717, B: 11603, C: 0.3764, D: 582.8025 },
    phC60: { label: "PH₃@C₆₀", name: "phosphine in C₆₀", A: 73.5334, B: 11000, C: 0.3619, D: 573.6787 },
  };
  const V = (p, x) => p.A * x ** 4 + p.B * Math.exp(-p.C * x * x) - p.D * x * x;

  // Equilibrium geometries at B97D/aug-cc-pVTZ (Tables 2 and 3). r in angstrom, angle in degrees.
  const GEOMETRY = {
    oh: { r: 0.982, angle: 112.0, dipole: 1.44 },
    ohC60: { r: 0.995, angle: 107.6, dipole: 1.18 },
    ph: { r: 1.428, angle: 93.1, dipole: 0.59 },
    phC60: { r: 1.396, angle: 92.7, dipole: 0.2 },
  };
  // Height of the central atom above the plane of the three H atoms, for a symmetric AB3 pyramid.
  const pyramidHeight = (r, angleDeg) => {
    const hh = 2 * r * Math.sin((angleDeg * Math.PI) / 360);
    const R = hh / Math.sqrt(3);
    return Math.sqrt(Math.max(0, r * r - R * R));
  };

  // Barrier heights in cm^-1 (Table 1): [aug-cc-pVTZ, 6-311G**]
  const BENCHMARK = {
    methods: ["B3LYP", "PBE1PBE", "M062X", "MN15", "B97D", "MP2"],
    oh: { B3LYP: [513, 401], PBE1PBE: [563, 439], M062X: [463, 352], MN15: [255, 166], B97D: [612, 476], MP2: [764, 682], ref: 706, expt: 721 },
    ph: { B3LYP: [11623, 11778], PBE1PBE: [11384, 11507], M062X: [11599, 11663], MN15: [10873, 10828], B97D: [11603, 11743], MP2: [11377, 12366], ref: 11595, expt: 11030 },
  };

  // Barrier heights at B97D/aug-cc-pVTZ, free and confined (Tables 2, 3)
  const BARRIER = { oh: 612, ohC60: 870, ph: 11603, phC60: 11000 };

  // Tunnelling eigenstates and splittings, cm^-1 (Tables 7 and 8)
  const LEVELS = {
    oh: {
      expt: { split: [55.35, 373.23, 583.0] },
      ccsdtQZ: { e: [380.69, 445.22, 975.93, 1374.37, 1930.9, 2526.13], split: [64.53, 398.44, 595.23] },
      ccsdtTZ: { e: [409.73, 458.93, 1019.49, 1392.92, 1942.99, 2535.0], split: [49.2, 373.43, 592.01] },
      b97d: { e: [361.34, 465.38, 1013.03, 1487.29, 2101.08, 2764.07], split: [104.04, 474.26, 662.99] },
    },
    ohC60: { b97d: { e: [407.31, 445.22, 1036.42], split: [37.91] } },
    ph: {
      ccsdtQZ: { e: [477.15, 1398.57, 2318.85, 3238.32, 4155.38], split: [0.0, 1.0e-7, 0.9e-7, 0.37e-4, 0.17e-2] },
      ccsdtTZ: { e: [473.09, 1396.55, 2320.46, 3242.36, 4163.44], split: [1.1e-11, 1.8e-11, 1.6e-11, 3.2e-10, 1.1e-9] },
      b97d: { e: [509.74, 1439.7, 2368.05, 3293.17, 4214.26], split: [5.49e-13, 1.61e-13, 2.05e-13, 2.66e-12, 9.99e-11] },
    },
    phC60: { b97d: { e: [897.7, 1842.17, 2782.62, 3716.61, 4637.7], split: [0.0, 0.7e-7, 0.9e-6, 0.19e-3, 0.17e-2] } },
  };

  // Interaction energies, kcal/mol (Table 4) and their local energy decomposition (Table 5).
  // Signs: preparation costs energy (+), everything else stabilises (-).
  const INTERACTION = {
    ohC60: { b97d: -35.5, b97dCP: -34.5, dlpno: -30.8 },
    phC60: { b97d: -8.0, b97dCP: -6.7, dlpno: -13.4 },
  };
  const LED = {
    terms: [
      { key: "prep", label: "Electronic preparation" },
      { key: "elstat", label: "Electrostatics" },
      { key: "exch", label: "Exchange" },
      { key: "disp", label: "Dispersion" },
      { key: "nondisp", label: "Non-dispersion correlation" },
      { key: "triples", label: "Triples, (T)" },
    ],
    ohC60: { prep: 117.8, elstat: -107.8, exch: -16.4, disp: -18.3, nondisp: -4.6, triples: -1.6 },
    phC60: { prep: 174.5, elstat: -90.5, exch: -41.6, disp: -38.9, nondisp: -9.9, triples: -6.5 },
  };

  // Electron counts
  const ELECTRONS = { oh: 10, ph: 18, c60: 360 };

  // ---- DOM helpers ----
  const cssVar = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();
  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

  // Calls back once the element scrolls near the viewport (immediately under reduced motion).
  const onVisible = (el, callback, rootMargin = "200px") => {
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          callback();
        }
      },
      { rootMargin }
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

  const onThemeChange = (callback) => {
    new MutationObserver(callback).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  };

  // Sizes a canvas to its CSS box at device pixel ratio; returns the 2D context scaled to CSS pixels.
  const fitCanvas = (canvas) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  };

  let tooltip = null;
  const showTooltip = (html, at) => {
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "inv-tooltip";
      tooltip.setAttribute("role", "tooltip");
      document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = html;
    tooltip.classList.add("is-on");
    const pad = 12;
    let x, y;
    if (at && "clientX" in at) {
      x = at.clientX + pad;
      y = at.clientY + pad;
    } else if (at && at.getBoundingClientRect) {
      const r = at.getBoundingClientRect();
      x = r.left;
      y = r.bottom + 6;
    }
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    x = Math.min(x, window.innerWidth - tw - 8);
    if (y + th > window.innerHeight - 8) y = Math.max(8, y - th - 2 * pad);
    tooltip.style.left = `${Math.max(8, x)}px`;
    tooltip.style.top = `${y}px`;
  };
  const hideTooltip = () => tooltip && tooltip.classList.remove("is-on");

  // Formats a number like 1.7 × 10⁻² for small or large magnitudes.
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sci = (v, digits = 2) => {
    if (v === 0) return "0";
    const exp = Math.floor(Math.log10(Math.abs(v)));
    if (exp >= -2 && exp < 5) return v.toLocaleString("en-GB", { maximumSignificantDigits: digits + 1 });
    const mant = v / 10 ** exp;
    return `${mant.toFixed(digits - 1)} × 10${String(exp)
      .split("")
      .map((c) => SUP[c])
      .join("")}`;
  };

  window.INV = {
    reduceMotion,
    HARTREE_CM,
    AMU_ME,
    CM_KCAL,
    CM_HZ,
    KT_300_CM,
    POTENTIALS,
    V,
    GEOMETRY,
    pyramidHeight,
    BENCHMARK,
    BARRIER,
    LEVELS,
    INTERACTION,
    LED,
    ELECTRONS,
    cssVar,
    isDark,
    onVisible,
    watchVisibility,
    onThemeChange,
    fitCanvas,
    showTooltip,
    hideTooltip,
    sci,
  };
})();
