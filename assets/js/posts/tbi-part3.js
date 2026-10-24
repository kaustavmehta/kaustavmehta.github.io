// Interactive figures for "A map of what comes after", part 3 of the TBI series.
// Data: assets/data/tbi/*.json (aggregates recomputed from the TBIMS public-use files; see the README there).
// Every graph measure shown is recomputed here in the browser and was checked against networkx on the study networks.
(function () {
  "use strict";

  const T = window.TBI;
  const root = document.getElementById("tbi3-root");
  if (!root || !window.d3 || !T) return;
  const BASE = root.getAttribute("data-base") || "/assets/data/tbi/";
  const RM = T.reduceMotion;
  const DUR = RM ? 0 : 650;
  const $ = (id) => document.getElementById(id);
  const fmtInt = d3.format(",");
  const f2 = d3.format(".2f");
  const f3 = d3.format(".3f");
  const pct = (p) => (p == null ? "–" : `${(p * 100).toFixed(1)}%`);

  /* ------------------------------------------------------------------ */
  /* Labels and colours                                                  */
  /* ------------------------------------------------------------------ */

  // Category classes are written out in full so that PurgeCSS keeps them.
  const CAT_CLASS = {
    psych: "tbi3-c-psych",
    subst: "tbi3-c-subst",
    cardio: "tbi3-c-cardio",
    metab: "tbi3-c-metab",
    resp: "tbi3-c-resp",
    musc: "tbi3-c-musc",
    neuro: "tbi3-c-neuro",
    other: "tbi3-c-other",
  };
  const CAT_VAR = {
    psych: "--tbi-psych",
    subst: "--tbi-subst",
    cardio: "--tbi-cardio",
    metab: "--tbi-metab",
    resp: "--tbi-resp",
    musc: "--tbi-musc",
    neuro: "--tbi-neuro",
    other: "--tbi-other",
  };
  const CAT_NAME = {
    psych: "Psychiatric",
    subst: "Substance use",
    cardio: "Heart and circulation",
    metab: "Metabolic",
    resp: "Lungs",
    musc: "Joints and pain",
    neuro: "Neurological",
    other: "Eyes and liver",
  };
  const CAT_ORDER = ["psych", "subst", "musc", "neuro", "cardio", "metab", "resp", "other"];
  const LABEL = {
    ADDADHD: "ADD/ADHD",
    Alcoholism: "Alcoholism",
    Anxiety: "Anxiety",
    BipolarDisorder: "Bipolar disorder",
    Cataracts: "Cataracts",
    ChronicPain: "Chronic pain",
    CongHF: "Heart failure",
    Dementia: "Dementia",
    Depression: "Depression",
    Diabetes: "Diabetes",
    DrugAddiction: "Drug addiction",
    Emphysema: "Emphysema",
    HighBloodCholesterol: "High cholesterol",
    Hypertension: "Hypertension",
    Liver: "Liver disease",
    MovementDisorder: "Movement disorder",
    MyocardialInfarction: "Heart attack (MI)",
    ObsessiveCompulsiveDisorder: "OCD",
    Osteoarthritis: "Osteoarthritis",
    OtherHeartConditions: "Other heart conditions",
    PTSD: "PTSD",
    PanicAttacks: "Panic attacks",
    Pneumonia: "Pneumonia",
    RheumatoidArthritis: "Rheumatoid arthritis",
    SleepDisorder: "Sleep disorder",
    Stroke: "Stroke",
  };
  const SHORT = {
    ADDADHD: "ADHD",
    Alcoholism: "Alc",
    Anxiety: "Anx",
    BipolarDisorder: "Bipolar",
    Cataracts: "Cat",
    ChronicPain: "Pain",
    CongHF: "CHF",
    Dementia: "Dem",
    Depression: "Dep",
    Diabetes: "Diab",
    DrugAddiction: "Drugs",
    Emphysema: "Emph",
    HighBloodCholesterol: "Chol",
    Hypertension: "HT",
    Liver: "Liver",
    MovementDisorder: "MD",
    MyocardialInfarction: "MI",
    ObsessiveCompulsiveDisorder: "OCD",
    Osteoarthritis: "OA",
    OtherHeartConditions: "OHC",
    PTSD: "PTSD",
    PanicAttacks: "Panic",
    Pneumonia: "Pneu",
    RheumatoidArthritis: "RA",
    SleepDisorder: "Sleep",
    Stroke: "Stroke",
  };
  let INFO = {};
  const cat = (id) => (INFO[id] ? INFO[id].category : "other");
  const fullName = (id) => (INFO[id] ? INFO[id].label : id);
  const catColor = (id) => T.cssVar(CAT_VAR[cat(id)]);

  /* ------------------------------------------------------------------ */
  /* Data                                                                */
  /* ------------------------------------------------------------------ */

  let dataPromise = null;
  const getJSON = (name) =>
    fetch(BASE + name).then((r) => {
      if (!r.ok) throw new Error(`${name}: ${r.status}`);
      return r.json();
    });

  const loadData = () => {
    if (!dataPromise) {
      dataPromise = Promise.all([getJSON("networks.json"), getJSON("cohort.json"), getJSON("pairs.json"), getJSON("phi-matrix-mild-y5.json")]).then(
        ([nets, cohort, pairs, phi]) => {
          INFO = nets.nodeInfo;
          const byId = {};
          nets.networks.forEach((net) => {
            // An edge whose phi is exactly 1 has an infinite t statistic. The published young network does not contain the one
            // such edge (alcoholism with drug addiction), so it is set aside here and discussed in the text.
            net.dropped = net.id.startsWith("bmc") ? net.edges.filter((e) => e.t == null) : [];
            net.useEdges = net.edges.filter((e) => !net.dropped.includes(e));
            net.nodeMap = new Map(net.nodes.map((n) => [n.id, n]));
            byId[net.id] = net;
          });
          return { nets: byId, cohort, pairs: pairs.pairs, phi, ids: Object.keys(nets.nodeInfo).sort((a, b) => LABEL[a].localeCompare(LABEL[b])) };
        }
      );
    }
    return dataPromise;
  };

  // Starts a figure once it nears the viewport, after the data arrives. Failures show in the figure, not silently.
  const lazy = (id, init) => {
    const node = $(id);
    if (!node) return;
    T.onVisible(
      node,
      () =>
        loadData()
          .then((D) => init(D, node))
          .catch((err) => {
            const msg = document.createElement("p");
            msg.className = "tbi3-error";
            msg.textContent = "This figure could not load its data. Reloading the page usually fixes it.";
            node.appendChild(msg);
            if (window.console) console.warn(err);
          }),
      0.05
    );
  };

  // Calls fn when the element's width changes (not on every scroll-induced resize on mobile).
  const onWidth = (el, fn) => {
    let w = el.clientWidth;
    let raf = 0;
    if (!("ResizeObserver" in window)) return;
    new ResizeObserver(() => {
      const nw = el.clientWidth;
      if (Math.abs(nw - w) < 2) return;
      w = nw;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => fn(nw));
    }).observe(el);
  };

  const pressed = (buttons, active) => buttons.forEach((b) => b.setAttribute("aria-pressed", b === active ? "true" : "false"));
  const all = (sel) => Array.from(document.querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* Graph algorithms                                                    */
  /* ------------------------------------------------------------------ */

  const G = {};

  // Undirected graph over a list of node ids; `edges` are {source, target, phi}.
  G.build = (ids, edges) => {
    const index = new Map(ids.map((id, i) => [id, i]));
    const adj = ids.map(() => []);
    const list = [];
    edges.forEach((e) => {
      const a = index.get(e.source);
      const b = index.get(e.target);
      if (a == null || b == null || a === b) return;
      adj[a].push(b);
      adj[b].push(a);
      list.push([a, b, Math.abs(e.phi == null ? 1 : e.phi)]);
    });
    return { ids, index, adj, edges: list, n: ids.length };
  };

  // Brandes (2001), normalised as networkx does for undirected graphs: divided by (n - 1)(n - 2) / 2.
  G.betweenness = (g) => {
    const n = g.n;
    const cb = new Float64Array(n);
    const sigma = new Float64Array(n);
    const dist = new Int32Array(n);
    const delta = new Float64Array(n);
    const pred = Array.from({ length: n }, () => []);
    const stack = [];
    const queue = new Int32Array(Math.max(1, n));
    for (let s = 0; s < n; s++) {
      stack.length = 0;
      for (let i = 0; i < n; i++) {
        pred[i].length = 0;
        sigma[i] = 0;
        dist[i] = -1;
        delta[i] = 0;
      }
      sigma[s] = 1;
      dist[s] = 0;
      let head = 0;
      let tail = 0;
      queue[tail++] = s;
      while (head < tail) {
        const v = queue[head++];
        stack.push(v);
        for (const u of g.adj[v]) {
          if (dist[u] < 0) {
            dist[u] = dist[v] + 1;
            queue[tail++] = u;
          }
          if (dist[u] === dist[v] + 1) {
            sigma[u] += sigma[v];
            pred[u].push(v);
          }
        }
      }
      while (stack.length) {
        const u = stack.pop();
        for (const v of pred[u]) delta[v] += (sigma[v] / sigma[u]) * (1 + delta[u]);
        if (u !== s) cb[u] += delta[u];
      }
    }
    const scale = n > 2 ? 1 / ((n - 1) * (n - 2)) : 0;
    return Array.from(cb, (x) => x * scale);
  };

  G.bfsDist = (g, s) => {
    const dist = new Int32Array(g.n).fill(-1);
    const q = [s];
    dist[s] = 0;
    for (let h = 0; h < q.length; h++) {
      const v = q[h];
      for (const u of g.adj[v])
        if (dist[u] < 0) {
          dist[u] = dist[v] + 1;
          q.push(u);
        }
    }
    return dist;
  };

  G.components = (g) => {
    const seen = new Int32Array(g.n).fill(-1);
    const comps = [];
    for (let s = 0; s < g.n; s++) {
      if (seen[s] >= 0) continue;
      const c = [s];
      seen[s] = comps.length;
      for (let h = 0; h < c.length; h++)
        for (const u of g.adj[c[h]])
          if (seen[u] < 0) {
            seen[u] = comps.length;
            c.push(u);
          }
      comps.push(c);
    }
    return comps;
  };

  // Power iteration on A + I with unit Euclidean norm, as networkx.eigenvector_centrality does.
  G.eigenvector = (g) => {
    const n = g.n;
    let x = new Float64Array(n).fill(1 / n);
    for (let it = 0; it < 1000; it++) {
      const y = Float64Array.from(x);
      for (let v = 0; v < n; v++) for (const u of g.adj[v]) y[u] += x[v];
      let norm = 0;
      for (let i = 0; i < n; i++) norm += y[i] * y[i];
      norm = Math.sqrt(norm) || 1;
      let err = 0;
      for (let i = 0; i < n; i++) {
        y[i] /= norm;
        err += Math.abs(y[i] - x[i]);
      }
      x = y;
      if (err < n * 1e-9) break;
    }
    return Array.from(x);
  };

  G.local = (g) => {
    const nb = g.adj.map((a) => new Set(a));
    const tri = new Array(g.n).fill(0);
    const clus = new Array(g.n).fill(0);
    const strength = new Array(g.n).fill(0);
    for (let v = 0; v < g.n; v++) {
      const a = g.adj[v];
      let t = 0;
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (nb[a[i]].has(a[j])) t++;
      tri[v] = t;
      const k = a.length;
      clus[v] = k > 1 ? (2 * t) / (k * (k - 1)) : 0;
    }
    g.edges.forEach(([a, b, w]) => {
      strength[a] += w;
      strength[b] += w;
    });
    return { degree: g.adj.map((a) => a.length), triangles: tri, clustering: clus, strength };
  };

  G.assortativity = (g) => {
    const k = g.adj.map((a) => a.length);
    let sx = 0;
    let sxx = 0;
    let sxy = 0;
    let m = 0;
    g.edges.forEach(([a, b]) => {
      sx += k[a] + k[b];
      sxx += k[a] * k[a] + k[b] * k[b];
      sxy += 2 * k[a] * k[b];
      m += 2;
    });
    if (!m) return 0;
    const mean = sx / m;
    const v = sxx / m - mean * mean;
    return v > 1e-12 ? (sxy / m - mean * mean) / v : 0;
  };

  // Summary of the part of a network that has edges (isolated conditions are dropped, as in the paper).
  G.summary = (ids, edges) => {
    const touched = new Set();
    edges.forEach((e) => {
      touched.add(e.source);
      touched.add(e.target);
    });
    const g = G.build(
      ids.filter((id) => touched.has(id)),
      edges
    );
    const loc = G.local(g);
    const n = g.n;
    const m = g.edges.length;
    let total = 0;
    let pairs = 0;
    let diam = 0;
    for (let s = 0; s < n; s++) {
      const d = G.bfsDist(g, s);
      for (let t = 0; t < n; t++)
        if (t !== s && d[t] > 0) {
          total += d[t];
          pairs++;
          if (d[t] > diam) diam = d[t];
        }
    }
    return {
      n,
      m,
      density: n > 1 ? (2 * m) / (n * (n - 1)) : 0,
      avgDegree: n ? (2 * m) / n : 0,
      clustering: n ? d3.mean(loc.clustering) : 0,
      avgPath: pairs ? total / pairs : 0,
      diameter: diam,
      assortativity: G.assortativity(g),
      triangles: d3.sum(loc.triangles) / 3,
      components: G.components(g).length,
    };
  };

  // Every per-node measure the figures can size nodes by, for the non-isolated part of a network.
  G.measures = (ids, edges) => {
    const touched = new Set();
    edges.forEach((e) => {
      touched.add(e.source);
      touched.add(e.target);
    });
    const live = ids.filter((id) => touched.has(id));
    const g = G.build(live, edges);
    const loc = G.local(g);
    const b = G.betweenness(g);
    const ev = G.eigenvector(g);
    const out = {};
    ids.forEach((id) => {
      const i = g.index.get(id);
      out[id] =
        i == null
          ? { degree: 0, strength: 0, betweenness: 0, eigenvector: 0, triangles: 0, clustering: 0 }
          : {
              degree: loc.degree[i],
              strength: loc.strength[i],
              betweenness: b[i],
              eigenvector: ev[i],
              triangles: loc.triangles[i],
              clustering: loc.clustering[i],
            };
    });
    return out;
  };

  // Vertex-betweenness clustering (Camarillo-Ramirez et al. 2020, as adapted in the thesis and in BMC Neurology 2025).
  // Threshold: the median betweenness of the starting network (BMC supplementary methods). Returns every step.
  G.vbc = (ids, edges, threshold) => {
    const touched = new Set();
    edges.forEach((e) => {
      touched.add(e.source);
      touched.add(e.target);
    });
    const live = ids.filter((id) => touched.has(id));
    const full = G.build(live, edges);
    const steps = [];
    const removed = [];
    let thr = threshold;
    for (;;) {
      const g = G.build(
        live.filter((id) => !removed.includes(id)),
        edges
      );
      const b = G.betweenness(g);
      if (thr == null) thr = d3.median(b);
      let best = 0;
      for (let i = 1; i < g.n; i++) if (b[i] > b[best] + 1e-12) best = i;
      steps.push({ removed: removed.slice(), scores: new Map(g.ids.map((id, i) => [id, b[i]])), top: g.ids[best], max: b[best] });
      if (!(b[best] > thr + 1e-12)) break;
      removed.push(g.ids[best]);
    }
    const rest = G.build(
      live.filter((id) => !removed.includes(id)),
      edges
    );
    const nbr = (a, c) => full.adj[full.index.get(a)].includes(full.index.get(c));
    const clusters = G.components(rest).map((c) => {
      const core = c.map((i) => rest.ids[i]);
      const bridges = removed.filter((r) => core.some((u) => nbr(r, u)));
      return { core, bridges, members: core.concat(bridges) };
    });
    return { threshold: thr, steps, removed, clusters, live };
  };

  /* ------------------------------------------------------------------ */
  /* Student's t distribution (for the threshold slider)                 */
  /* ------------------------------------------------------------------ */

  const lgamma = (x) => {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (const ci of c) ser += ci / ++y;
    return -tmp + Math.log((2.5066282746310005 * ser) / x);
  };
  const betacf = (a, b, x) => {
    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - (qab * x) / qap;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 200; m++) {
      const m2 = 2 * m;
      let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      h *= d * c;
      aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 3e-12) break;
    }
    return h;
  };
  const ibeta = (a, b, x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
  };
  // One-tailed upper p-value of Student's t with df degrees of freedom.
  const tUpper = (t, df) => (t < 0 ? 1 - tUpper(-t, df) : 0.5 * ibeta(df / 2, 0.5, df / (df + t * t)));

  /* ------------------------------------------------------------------ */
  /* A reusable network drawing                                          */
  /* ------------------------------------------------------------------ */

  // Draws nodes at a network's shared layout (x, y in [0, 1]), nudged apart with a few silent d3-force ticks so that
  // labels stay legible at the current width. Isolated nodes sit in a tray along the bottom.
  function NetView(svgEl, opts) {
    const o = Object.assign(
      {
        minR: 4,
        maxR: 14,
        aspect: (w) => (w < 560 ? 1.12 : 0.66),
        pad: 26,
        focusable: false,
        trayLabel: "No edges:",
        label: (id, narrow) => (narrow ? SHORT[id] : LABEL[id]),
        onHover: null,
        onSelect: null,
      },
      opts
    );
    const svg = d3.select(svgEl);
    const zoomG = svg.append("g").attr("class", "tbi3-zoom");
    const gE = zoomG.append("g").attr("class", "tbi3-edges");
    const gN = zoomG.append("g").attr("class", "tbi3-nodes");
    const trayText = svg.append("text").attr("class", "tbi3-tray-label");
    const cache = new Map();
    let state = { key: "", nodes: [], edges: [], size: () => 0.4, nodeClass: () => "", edgeClass: () => "", isolatedOK: true };
    let W = 0;
    let H = 0;
    let narrow = false;
    let pos = new Map();
    const api = { svg: svgEl, zoomG: zoomG.node() };

    const radius = (v) => o.minR + (o.maxR - o.minR) * Math.sqrt(Math.max(0, Math.min(1, v)));
    const ew = d3.scaleLinear().domain([0.15, 0.7]).range([0.8, 5]).clamp(true);

    const place = () => {
      W = svgEl.clientWidth || svgEl.parentNode.clientWidth || 600;
      narrow = W < 560;
      const minR = narrow ? o.minR * 0.8 : o.minR;
      const maxR = narrow ? o.maxR * 0.75 : o.maxR;
      const rad = (v) => minR + (maxR - minR) * Math.sqrt(Math.max(0, Math.min(1, v)));
      const iso = state.nodes.filter((n) => n.iso);
      const trayH = iso.length ? 40 : 0;
      H = Math.round(W * o.aspect(W)) + trayH;
      svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", W).attr("height", H);
      const pad = narrow ? 18 : o.pad;
      const ck = `${state.key}|${W}`;
      let p = cache.get(ck);
      if (!p) {
        const live = state.nodes.filter((n) => !n.iso);
        const ex = d3.extent(live, (n) => n.ux);
        const ey = d3.extent(live, (n) => n.uy);
        const nx = (v) => (ex[1] - ex[0] > 0.05 ? (v - ex[0]) / (ex[1] - ex[0]) : 0.5);
        const ny = (v) => (ey[1] - ey[0] > 0.05 ? (v - ey[0]) / (ey[1] - ey[0]) : 0.5);
        const sim = live.map((n) => {
          const tx = pad + 8 + nx(n.ux) * (W - 2 * pad - 16);
          const ty = pad + 6 + ny(n.uy) * (H - trayH - 2 * pad - 12);
          return { id: n.id, x: tx, y: ty, tx, ty, r: rad(state.size(n.id)) };
        });
        const lab = (id) => Math.min(narrow ? 16 : 26, 5 + String(o.label(id, narrow) || "").length * (narrow ? 1.6 : 2.2));
        d3.forceSimulation(sim)
          .force("x", d3.forceX((d) => d.tx).strength(0.35))
          .force("y", d3.forceY((d) => d.ty).strength(0.35))
          .force("c", d3.forceCollide((d) => d.r + lab(d.id)).strength(0.9))
          .stop()
          .tick(90);
        p = new Map();
        sim.forEach((d) => p.set(d.id, [Math.max(pad, Math.min(W - pad, d.x)), Math.max(pad * 0.8, Math.min(H - trayH - pad * 0.6, d.y))]));
        const step = Math.min(narrow ? 46 : 90, (W - 2 * pad - 70) / Math.max(1, iso.length));
        iso.forEach((n, i) => p.set(n.id, [pad + 74 + i * step + 6, H - 18]));
        cache.set(ck, p);
        if (cache.size > 40) cache.delete(cache.keys().next().value);
      }
      pos = p;
      trayText
        .attr("x", pad)
        .attr("y", H - 14)
        .text(iso.length ? o.trayLabel : "");
      api.rad = rad;
    };

    api.set = (s) => {
      state = Object.assign(state, s);
      return api;
    };

    api.draw = (animate) => {
      place();
      const t = animate && !RM ? d3.transition().duration(DUR).ease(d3.easeCubicInOut) : null;
      const P = (id) => pos.get(id) || [W / 2, H / 2];
      const edges = gE.selectAll("line").data(state.edges, (e) => `${e.source}|${e.target}`);
      edges.exit().interrupt().remove();
      const enterE = edges
        .enter()
        .append("line")
        .attr("x1", (e) => P(e.source)[0])
        .attr("y1", (e) => P(e.source)[1])
        .attr("x2", (e) => P(e.target)[0])
        .attr("y2", (e) => P(e.target)[1])
        .style("opacity", t ? 0 : null);
      const mergedE = enterE.merge(edges).attr("class", (e) => `tbi3-edge ${state.edgeClass(e)}`);
      (t ? mergedE.transition(t) : mergedE)
        .attr("x1", (e) => P(e.source)[0])
        .attr("y1", (e) => P(e.source)[1])
        .attr("x2", (e) => P(e.target)[0])
        .attr("y2", (e) => P(e.target)[1])
        .attr("stroke-width", (e) => ew(Math.abs(e.phi == null ? 0.3 : e.phi)))
        .style("opacity", null);

      const nodes = gN.selectAll("g.tbi3-node").data(state.nodes, (n) => n.id);
      nodes.exit().remove();
      const enterN = nodes
        .enter()
        .append("g")
        .attr("transform", (n) => `translate(${P(n.id)[0]},${P(n.id)[1]})`);
      enterN.append("circle").attr("class", "tbi3-hit");
      enterN.append("circle").attr("class", "tbi3-ring");
      enterN.append("circle").attr("class", "tbi3-dot");
      enterN.append("text").attr("class", "tbi3-label");
      if (o.focusable) {
        enterN.attr("tabindex", 0).attr("role", "button");
        enterN
          .on("pointerenter", (ev, n) => o.onHover && ev.pointerType === "mouse" && o.onHover(n.id, ev))
          .on("pointerleave", (ev) => o.onHover && ev.pointerType === "mouse" && o.onHover(null, ev))
          .on("click", (ev, n) => o.onSelect && o.onSelect(n.id, ev))
          .on("focus", (ev, n) => o.onHover && o.onHover(n.id, ev))
          .on("blur", (ev) => o.onHover && o.onHover(null, ev))
          .on("keydown", (ev, n) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.preventDefault();
              if (o.onSelect) o.onSelect(n.id, ev);
            } else if (ev.key === "Escape" && o.onSelect) o.onSelect(null, ev);
          });
      }
      const merged = enterN.merge(nodes).attr("class", (n) => `tbi3-node ${CAT_CLASS[cat(n.id)]} ${state.nodeClass(n.id)}`);
      if (o.focusable) merged.attr("aria-label", (n) => (o.ariaLabel ? o.ariaLabel(n.id) : LABEL[n.id]));
      (t ? merged.transition(t) : merged).attr("transform", (n) => `translate(${P(n.id)[0]},${P(n.id)[1]})`);
      merged.each(function (n) {
        const r = n.iso ? 4 : api.rad(state.size(n.id));
        const g = d3.select(this);
        (t ? g.select(".tbi3-dot").transition(t) : g.select(".tbi3-dot")).attr("r", r);
        g.select(".tbi3-ring").attr("r", r + 3.5);
        g.select(".tbi3-hit").attr("r", Math.max(r + 6, narrow ? 13 : 11));
        const [x] = P(n.id);
        const left = !n.iso && x > W * 0.62;
        g.select(".tbi3-label")
          .text(o.label(n.id, narrow, n))
          .attr("text-anchor", n.iso ? "middle" : left ? "end" : "start")
          .attr("x", n.iso ? 0 : left ? -(r + 3) : r + 3)
          .attr("y", n.iso ? -9 : 4);
      });
      return api;
    };

    api.pos = (id) => pos.get(id);
    api.size = () => [W, H];
    api.narrow = () => narrow;
    return api;
  }

  // Nodes for a NetView from a study network: layout from that network, isolated conditions in the tray.
  const viewNodes = (net, edges, ids) => {
    const touched = new Set();
    edges.forEach((e) => {
      touched.add(e.source);
      touched.add(e.target);
    });
    return ids.map((id) => {
      const n = net.nodeMap.get(id);
      return { id, ux: n ? n.x : 0.5, uy: n ? n.y : 0.5, iso: !touched.has(id) };
    });
  };

  // Zoom with buttons and drag-to-pan once zoomed in; the page still scrolls normally at 1x.
  function addZoom(view, wrap, ids) {
    let k = 1;
    let tx = 0;
    let ty = 0;
    const svg = view.svg;
    const apply = () => {
      const [W, H] = view.size();
      const minX = W - W * k;
      const minY = H - H * k;
      tx = Math.min(0, Math.max(minX, tx));
      ty = Math.min(0, Math.max(minY, ty));
      d3.select(view.zoomG)
        .transition()
        .duration(RM ? 0 : 250)
        .attr("transform", `translate(${tx},${ty}) scale(${k})`);
      svg.style.touchAction = k > 1 ? "none" : "";
      svg.classList.toggle("is-zoomed", k > 1);
    };
    const zoomTo = (nk) => {
      const [W, H] = view.size();
      const cx = (W / 2 - tx) / k;
      const cy = (H / 2 - ty) / k;
      k = Math.max(1, Math.min(4, nk));
      tx = W / 2 - cx * k;
      ty = H / 2 - cy * k;
      apply();
    };
    $(ids.inBtn).addEventListener("click", () => zoomTo(k * 1.6));
    $(ids.outBtn).addEventListener("click", () => zoomTo(k / 1.6));
    $(ids.resetBtn).addEventListener("click", () => {
      k = 1;
      tx = 0;
      ty = 0;
      apply();
    });
    let drag = null;
    svg.addEventListener("pointerdown", (ev) => {
      if (k <= 1) return;
      drag = { x: ev.clientX, y: ev.clientY, tx, ty, moved: false };
    });
    svg.addEventListener("pointermove", (ev) => {
      if (!drag) return;
      const dx = ev.clientX - drag.x;
      const dy = ev.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      tx = drag.tx + dx;
      ty = drag.ty + dy;
      d3.select(view.zoomG).attr("transform", `translate(${tx},${ty}) scale(${k})`);
    });
    const end = () => {
      if (drag) apply();
      drag = null;
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("pointerleave", end);
    return {
      focus: (id) => {
        if (k <= 1) return;
        const p = view.pos(id);
        if (!p) return;
        const [W, H] = view.size();
        tx = W / 2 - p[0] * k;
        ty = H / 2 - p[1] * k;
        apply();
      },
      reset: () => {
        k = 1;
        tx = 0;
        ty = 0;
        apply();
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* 1. Glasgow Coma Scale                                               */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-gcs", (D, svgEl) => {
    const counts = D.cohort.gcs.counts;
    const scores = d3.range(3, 16);
    const svg = d3.select(svgEl);
    const buttons = all("[data-gcs]");
    let mode = "paper";
    const band = (s) => (s <= 8 ? "severe" : s <= 12 ? "moderate" : s === 13 ? (mode === "paper" ? "mild" : "moderate") : "mild");
    const BAND_CLASS = { severe: "tbi3-gcs-severe", moderate: "tbi3-gcs-moderate", mild: "tbi3-gcs-mild" };
    const draw = () => {
      const W = svgEl.clientWidth || 600;
      const H = W < 500 ? 230 : 250;
      const m = { l: W < 500 ? 34 : 44, r: 8, t: 26, b: 40 };
      svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);
      const x = d3
        .scaleBand()
        .domain(scores)
        .range([m.l, W - m.r])
        .padding(0.18);
      const y = d3
        .scaleLinear()
        .domain([0, 3000])
        .range([H - m.b, m.t]);
      svg.selectAll("*").remove();
      svg
        .append("g")
        .selectAll("line")
        .data([1000, 2000, 3000])
        .join("line")
        .attr("class", "tbi3-grid")
        .attr("x1", m.l)
        .attr("x2", W - m.r)
        .attr("y1", y)
        .attr("y2", y);
      svg
        .append("g")
        .selectAll("text")
        .data([0, 1000, 2000, 3000])
        .join("text")
        .attr("class", "tbi3-tick")
        .attr("x", m.l - 6)
        .attr("y", (d) => y(d) + 4)
        .attr("text-anchor", "end")
        .text((d) => (W < 500 ? `${d / 1000}k` : fmtInt(d)));
      const bars = svg
        .append("g")
        .selectAll("g")
        .data(scores)
        .join("g")
        .attr("class", "tbi3-gcs-bar tbi-focusable")
        .attr("tabindex", 0)
        .attr("role", "img")
        .attr("aria-label", (s) => `GCS ${s}: ${fmtInt(counts[s])} people, counted as ${band(s)}`);
      bars
        .append("rect")
        .attr("x", (s) => x(s))
        .attr("width", x.bandwidth())
        .attr("y", (s) => y(counts[s]))
        .attr("height", (s) => y(0) - y(counts[s]))
        .attr("rx", 2)
        .attr("class", (s) => BAND_CLASS[band(s)] + (s === 13 ? " is-13" : ""));
      bars
        .append("text")
        .attr("class", "tbi3-tick")
        .attr("x", (s) => x(s) + x.bandwidth() / 2)
        .attr("y", H - m.b + 15)
        .attr("text-anchor", "middle")
        .text((s) => s);
      bars.on("pointerenter focus", (ev, s) =>
        T.showTooltip(`<strong>GCS ${s}</strong><br>${fmtInt(counts[s])} people aged 16 or over`, ev.type === "focus" ? ev.currentTarget : ev)
      );
      bars.on("pointerleave blur", T.hideTooltip);
      svg
        .append("text")
        .attr("class", "tbi3-axis-label")
        .attr("x", (m.l + W - m.r) / 2)
        .attr("y", H - 6)
        .attr("text-anchor", "middle")
        .text("Total Glasgow Coma Scale score on arrival (3 = deepest coma, 15 = fully responsive)");
      const bands = [
        ["Severe", 3, 8, "tbi3-gcs-severe"],
        ["Moderate", 9, mode === "paper" ? 12 : 13, "tbi3-gcs-moderate"],
        ["Mild", mode === "paper" ? 13 : 14, 15, "tbi3-gcs-mild"],
      ];
      const bg = svg.append("g");
      bands.forEach(([name, a, b, cls]) => {
        const x0 = x(a);
        const x1 = x(b) + x.bandwidth();
        bg.append("line")
          .attr("class", `tbi3-band-line ${cls}`)
          .attr("x1", x0)
          .attr("x2", x1)
          .attr("y1", m.t - 12)
          .attr("y2", m.t - 12);
        const total = d3.sum(d3.range(a, b + 1), (s) => counts[s]);
        bg.append("text")
          .attr("class", "tbi3-band-text")
          .attr("x", (x0 + x1) / 2)
          .attr("y", m.t - 17)
          .attr("text-anchor", "middle")
          .text(W < 500 ? name : `${name} · ${fmtInt(total)}`);
      });
      const mild = mode === "paper" ? counts[13] + counts[14] + counts[15] : counts[14] + counts[15];
      $("tbi3-gcs-read").textContent =
        mode === "paper"
          ? `As the papers define it (GCS 13–15), the mild group would hold ${fmtInt(mild)} of these people.`
          : `As the analysis code actually ran (GCS 14–15), the mild group holds ${fmtInt(mild)}: the ${fmtInt(counts[13])} people who scored exactly 13 were counted as moderate.`;
    };
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.getAttribute("data-gcs");
        pressed(buttons, b);
        draw();
      })
    );
    draw();
    onWidth(svgEl, draw);
  });

  /* ------------------------------------------------------------------ */
  /* 2. The funnel: from the whole database to 225 people               */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-funnel", (D, canvas) => {
    const c = D.cohort;
    const fu5 = c.followUp.rows.find((r) => r.year === 5);
    const gcsScored = d3.sum(d3.range(3, 16), (s) => c.gcs.counts[s]);
    const stages = [
      {
        n:
          d3.sum(d3.range(3, 16), (s) => c.gcs.counts[s]) +
          c.gcs.sentinel.code77 +
          c.gcs.sentinel.code88 +
          c.gcs.sentinel.code99 +
          c.gcs.sentinel.missing,
        label: "In the public database, aged 16 or over",
        note: "Everyone in the TBIMS public-use files with a valid age of 16 or more at injury.",
      },
      {
        n: gcsScored,
        label: "Had a coma score recorded",
        note: "The rest were sedated, intubated or otherwise could not be scored on arrival, or the score is unknown.",
      },
      {
        n: c.mildCohortForm1.n,
        label: "Mild by that score",
        note: "A total score of 14 or 15, which is how the analysis code defined mild (see the previous figure).",
      },
      {
        n: fu5.followUpRecords,
        label: "Due a five-year follow-up",
        note: "Had a record at the five-year follow-up, including people who could not be reached.",
      },
      { n: fu5.interviewed, label: "Interviewed at five years", note: "Actually reached and interviewed at the five-year mark." },
      {
        n: c.networkCohort.n,
        label: "Answered the health questions",
        note: "The comorbidity questions were only asked in interviews from 2017 to 2019, so most interviews never included them.",
      },
    ];
    const PER = 10;
    const total = Math.round(stages[0].n / PER);
    const keepN = stages.map((s) => Math.round(s.n / PER));
    const dots = d3.range(total).map((i) => ({ i, x: 0, y: 0, tx: 0, ty: 0, a: 1, ta: 1 }));
    const stepsBox = $("tbi3-funnel-steps");
    let stage = 0;
    let W = 0;
    let H = 0;
    let ctx = null;
    let raf = 0;
    let visible = true;
    const btns = stages.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tbi3-step";
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = `<span class="tbi3-step-n">${fmtInt(s.n)}</span><span class="tbi3-step-l">${s.label}</span>`;
      b.addEventListener("click", () => go(i));
      stepsBox.appendChild(b);
      return b;
    });
    const layout = () => {
      W = canvas.clientWidth || 600;
      const gap = W < 500 ? 5 : 6.5;
      const cols = Math.floor((W - 4) / gap);
      const rows = Math.ceil(total / cols);
      H = rows * gap + 6;
      canvas.style.height = `${H}px`;
      ctx = T.fitCanvas(canvas).ctx;
      // Kept dots pack from the top-left; dropped dots stay where they were, faded.
      const kept = keepN[stage];
      dots.forEach((d) => {
        let slot = d.i;
        if (d.i < kept) slot = d.i;
        d.tx = 3 + (slot % cols) * gap + gap / 2;
        d.ty = 3 + Math.floor(slot / cols) * gap + gap / 2;
        d.ta = d.i < kept ? 1 : 0.13;
        d.r = gap * 0.36;
      });
    };
    const paint = () => {
      const on = T.cssVar("--global-theme-color");
      const off = T.cssVar("--global-text-color-light");
      ctx.clearRect(0, 0, W, H);
      const kept = keepN[stage];
      for (const d of dots) {
        ctx.globalAlpha = d.a;
        ctx.fillStyle = d.i < kept ? on : off;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const animate = () => {
      cancelAnimationFrame(raf);
      const from = dots.map((d) => [d.x, d.y, d.a]);
      const t0 = performance.now();
      const dur = RM ? 0 : 900;
      const tick = (now) => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1;
        const e = d3.easeCubicInOut(k);
        dots.forEach((d, i) => {
          d.x = from[i][0] + (d.tx - from[i][0]) * e;
          d.y = from[i][1] + (d.ty - from[i][1]) * e;
          d.a = from[i][2] + (d.ta - from[i][2]) * e;
        });
        paint();
        if (k < 1 && visible) raf = requestAnimationFrame(tick);
        else if (k < 1) {
          dots.forEach((d) => {
            d.x = d.tx;
            d.y = d.ty;
            d.a = d.ta;
          });
          paint();
        }
      };
      raf = requestAnimationFrame(tick);
    };
    const go = (i) => {
      stage = i;
      btns.forEach((b, j) => {
        b.setAttribute("aria-pressed", j === i ? "true" : "false");
        b.classList.toggle("is-past", j < i);
      });
      layout();
      animate();
      const s = stages[i];
      const share = (s.n / stages[0].n) * 100;
      $("tbi3-funnel-read").textContent = `${fmtInt(s.n)} people (${share < 1 ? share.toFixed(1) : Math.round(share)}% of the database). ${s.note}`;
      $("tbi3-funnel-next").textContent = i < stages.length - 1 ? "Apply the next filter" : "Start again";
    };
    $("tbi3-funnel-next").addEventListener("click", () => go(stage < stages.length - 1 ? stage + 1 : 0));
    layout();
    dots.forEach((d) => {
      d.x = d.tx;
      d.y = d.ty;
      d.a = d.ta;
    });
    paint();
    go(0);
    T.watchVisibility(canvas, (v) => (visible = v));
    onWidth(canvas, () => {
      layout();
      dots.forEach((d) => {
        d.x = d.tx;
        d.y = d.ty;
        d.a = d.ta;
      });
      paint();
    });
    T.onThemeChange(paint);
  });

  /* ------------------------------------------------------------------ */
  /* 3. Who they are                                                     */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-demo", (D, box) => {
    const c = D.cohort;
    const sets = { all: c.mildCohortForm1, net: c.networkCohort };
    const buttons = all("[data-demo]");
    let which = "all";
    const panels = ["age", "sex", "cause"].map((k) => {
      const wrap = document.createElement("div");
      wrap.className = "tbi3-demo-panel";
      const h = document.createElement("div");
      h.className = "tbi-kicker";
      h.textContent = { age: "Age at injury", sex: "Sex", cause: "Cause of injury" }[k];
      wrap.appendChild(h);
      const s = d3.select(wrap).append("svg").attr("class", "tbi3-demo-svg").attr("role", "img").node();
      box.appendChild(wrap);
      return { k, s };
    });
    const draw = () => {
      const d = sets[which];
      const other = sets[which === "all" ? "net" : "all"];
      panels.forEach(({ k, s }) => {
        const svg = d3.select(s);
        const W = s.clientWidth || 300;
        svg.selectAll("*").remove();
        if (k === "age") {
          const bins = Object.keys(d.ageBins);
          const tot = d3.sum(bins, (b) => d.ageBins[b] || 0);
          const totO = d3.sum(bins, (b) => other.ageBins[b] || 0);
          const H = 150;
          svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);
          const x = d3
            .scaleBand()
            .domain(bins)
            .range([4, W - 4])
            .padding(0.2);
          const y = d3
            .scaleLinear()
            .domain([0, 0.26])
            .range([H - 22, 8]);
          bins.forEach((b) => {
            const v = d.ageBins[b] / tot;
            const vo = other.ageBins[b] / totO;
            svg
              .append("rect")
              .attr("class", "tbi3-demo-bar")
              .attr("x", x(b))
              .attr("width", x.bandwidth())
              .attr("y", y(v))
              .attr("height", y(0) - y(v))
              .attr("rx", 2);
            svg
              .append("line")
              .attr("class", "tbi3-demo-ghost")
              .attr("x1", x(b))
              .attr("x2", x(b) + x.bandwidth())
              .attr("y1", y(vo))
              .attr("y2", y(vo));
            svg
              .append("text")
              .attr("class", "tbi3-tick")
              .attr("x", x(b) + x.bandwidth() / 2)
              .attr("y", H - 6)
              .attr("text-anchor", "middle")
              .text(b);
          });
          s.setAttribute("aria-label", `Age at injury: median ${d.ageMedian} years, interquartile range ${d.ageIQR[0]} to ${d.ageIQR[1]}.`);
        } else {
          const entries =
            k === "sex"
              ? [
                  ["Men", d.sex.male],
                  ["Women", d.sex.female],
                ]
              : Object.entries(d.cause);
          const tot = d3.sum(entries, (e) => e[1] || 0);
          const rowH = 22;
          const H = entries.length * rowH + 4;
          svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);
          const lw = 104;
          const x = d3
            .scaleLinear()
            .domain([0, 1])
            .range([lw, W - 44]);
          entries.forEach(([name, v], i) => {
            const y0 = i * rowH + 2;
            svg
              .append("text")
              .attr("class", "tbi3-tick tbi3-tick-strong")
              .attr("x", lw - 6)
              .attr("y", y0 + 14)
              .attr("text-anchor", "end")
              .text(name);
            svg
              .append("rect")
              .attr("class", "tbi3-demo-track")
              .attr("x", lw)
              .attr("y", y0 + 4)
              .attr("width", x(1) - lw)
              .attr("height", 12)
              .attr("rx", 3);
            if (v != null) {
              svg
                .append("rect")
                .attr("class", "tbi3-demo-bar")
                .attr("x", lw)
                .attr("y", y0 + 4)
                .attr("width", x(v / tot) - lw)
                .attr("height", 12)
                .attr("rx", 3);
            }
            svg
              .append("text")
              .attr("class", "tbi3-tick")
              .attr("x", W - 40)
              .attr("y", y0 + 14)
              .text(v == null ? "<11" : `${Math.round((v / tot) * 100)}%`);
          });
          s.setAttribute("aria-label", entries.map(([n, v]) => `${n}: ${v == null ? "fewer than 11" : fmtInt(v)}`).join("; "));
        }
      });
      $("tbi3-demo-read").textContent =
        which === "all"
          ? `All ${fmtInt(d.n)} people with a mild injury: median age at injury ${d.ageMedian} (half were between ${d.ageIQR[0]} and ${d.ageIQR[1]}), ${Math.round((d.sex.male / d.n) * 100)}% men, and falls the commonest cause.`
          : `The ${fmtInt(d.n)} people behind the network: median age at injury ${d.ageMedian} (half between ${d.ageIQR[0]} and ${d.ageIQR[1]}), ${Math.round((d.sex.male / d.n) * 100)}% men. The faint lines show the larger group, for comparison.`;
    };
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        which = b.getAttribute("data-demo");
        pressed(buttons, b);
        draw();
      })
    );
    draw();
    onWidth(box, draw);
  });

  /* ------------------------------------------------------------------ */
  /* 4. Who is still there, year by year                                 */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-fu", (D, svgEl) => {
    const rows = D.cohort.followUp.rows;
    const svg = d3.select(svgEl);
    const series = [
      ["followUpRecords", "Due a follow-up", "tbi3-fu-a"],
      ["interviewed", "Interviewed", "tbi3-fu-b"],
      ["comorbidityModuleAnswered", "Answered the health questions", "tbi3-fu-c"],
    ];
    const draw = () => {
      const W = svgEl.clientWidth || 600;
      const H = W < 500 ? 220 : 240;
      const m = { l: W < 500 ? 34 : 44, r: 8, t: 10, b: 36 };
      svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);
      svg.selectAll("*").remove();
      const x0 = d3
        .scaleBand()
        .domain(rows.map((r) => r.year))
        .range([m.l, W - m.r])
        .padding(0.22);
      const x1 = d3
        .scaleBand()
        .domain(series.map((s) => s[0]))
        .range([0, x0.bandwidth()])
        .padding(0.08);
      const y = d3
        .scaleLinear()
        .domain([0, 4800])
        .range([H - m.b, m.t]);
      [1000, 2000, 3000, 4000].forEach((v) =>
        svg
          .append("line")
          .attr("class", "tbi3-grid")
          .attr("x1", m.l)
          .attr("x2", W - m.r)
          .attr("y1", y(v))
          .attr("y2", y(v))
      );
      [0, 2000, 4000].forEach((v) =>
        svg
          .append("text")
          .attr("class", "tbi3-tick")
          .attr("x", m.l - 6)
          .attr("y", y(v) + 4)
          .attr("text-anchor", "end")
          .text(W < 500 ? `${v / 1000}k` : fmtInt(v))
      );
      rows.forEach((r) => {
        const g = svg
          .append("g")
          .attr("class", "tbi-focusable")
          .attr("tabindex", 0)
          .attr("role", "img")
          .attr(
            "aria-label",
            `Year ${r.year}: ${fmtInt(r.followUpRecords)} due, ${fmtInt(r.interviewed)} interviewed, ${fmtInt(r.comorbidityModuleAnswered)} answered the health questions`
          );
        series.forEach(([k, , cls]) => {
          g.append("rect")
            .attr("class", cls)
            .attr("x", x0(r.year) + x1(k))
            .attr("width", x1.bandwidth())
            .attr("y", y(r[k]))
            .attr("height", Math.max(1, y(0) - y(r[k])))
            .attr("rx", 1.5);
        });
        g.append("text")
          .attr("class", "tbi3-fu-n")
          .attr("x", x0(r.year) + x1("comorbidityModuleAnswered") + x1.bandwidth() / 2)
          .attr("y", y(r.comorbidityModuleAnswered) - 4)
          .attr("text-anchor", "middle")
          .text(r.comorbidityModuleAnswered);
        g.append("text")
          .attr("class", "tbi3-tick")
          .attr("x", x0(r.year) + x0.bandwidth() / 2)
          .attr("y", H - m.b + 15)
          .attr("text-anchor", "middle")
          .text(`${r.year}${W < 500 ? "" : r.year === 1 ? " year" : " years"}`);
        g.on("pointerenter focus", (ev) =>
          T.showTooltip(
            `<strong>${r.year} year${r.year > 1 ? "s" : ""} after injury</strong><br>${fmtInt(r.followUpRecords)} due a follow-up<br>${fmtInt(r.interviewed)} interviewed<br>${fmtInt(r.comorbidityModuleAnswered)} answered the health questions`,
            ev.type === "focus" ? ev.currentTarget : ev
          )
        ).on("pointerleave blur", T.hideTooltip);
      });
      svg
        .append("text")
        .attr("class", "tbi3-axis-label")
        .attr("x", (m.l + W - m.r) / 2)
        .attr("y", H - 4)
        .attr("text-anchor", "middle")
        .text("Follow-up after injury, mild TBI group");
    };
    draw();
    onWidth(svgEl, draw);
  });

  /* ------------------------------------------------------------------ */
  /* 4b. The conditions, and when they began                             */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-conds", (D, box) => {
    const prev = D.cohort.prevalence.overall.conditions;
    const MAX = 0.5;
    box.querySelectorAll("[data-cond]").forEach((el, i) => {
      const id = el.getAttribute("data-cond");
      const p = prev[id];
      const after = p.afterInjury.p;
      const before = p.beforeInjury.p;
      const show = (v) => (v == null ? "<11" : `${Math.round(v * 100)}%`);
      el.innerHTML = `<span class="tbi3-ctrack"><span class="tbi3-cbar-a"></span><span class="tbi3-cbar-b"></span></span><span class="tbi3-cval">after ${show(after)} · before ${show(before)}</span>`;
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "img");
      const txt = `${fullName(id)}: of ${p.any.n} people, ${p.afterInjury.x == null ? "fewer than 11" : p.afterInjury.x} reported it beginning at or after the injury and ${
        p.beforeInjury.x == null ? "fewer than 11" : p.beforeInjury.x
      } before it.`;
      el.setAttribute("aria-label", txt);
      el.addEventListener("pointerenter", (ev) => T.showTooltip(txt, ev));
      el.addEventListener("focus", () => T.showTooltip(txt, el));
      el.addEventListener("pointerleave", T.hideTooltip);
      el.addEventListener("blur", T.hideTooltip);
      const a = el.querySelector(".tbi3-cbar-a");
      const b = el.querySelector(".tbi3-cbar-b");
      setTimeout(
        () => {
          a.style.width = `${((after || 0) / MAX) * 100}%`;
          b.style.width = `${((before || 0) / MAX) * 100}%`;
        },
        RM ? 0 : 60 + i * 25
      );
    });
  });

  /* ------------------------------------------------------------------ */
  /* 5. People into a two-by-two table                                    */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-grid", (D, svgEl) => {
    const pairs = {};
    D.pairs.forEach((p) => (pairs[p.id] = p));
    const pairButtons = all("[data-pair]");
    const svg = d3.select(svgEl);
    const gBoxes = svg.append("g");
    const gDots = svg.append("g");
    const gGhost = svg.append("g");
    const gText = svg.append("g");
    let pair = pairs["anxiety-depression-onset"];
    let phase = 0; // 0 mixed, 1 sorted, 2 chance shown
    const CELL_KEYS = ["bothYes", "aOnly", "bOnly", "neither"];
    const PAIR_NOTE = {
      "anxiety-depression-onset":
        "Only conditions that began at or after the injury count here, which is why 180 people rather than 220 are in the table.",
      "depression-hypertension": "Two common conditions that meet almost exactly as often as chance predicts.",
      "cataracts-depression": "Slightly fewer people have both than chance predicts; plausibly an effect of age, since cataracts come later in life.",
    };
    const CELL_CLASS = { bothYes: "tbi3-p-both", aOnly: "tbi3-p-a", bOnly: "tbi3-p-b", neither: "tbi3-p-none" };
    const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    const people = () => {
      const t = pair.table;
      const list = [];
      CELL_KEYS.forEach((k) => d3.range(t[k]).forEach((i) => list.push({ cell: k, k: i })));
      // A seeded shuffle, so the unsorted crowd looks the same on every visit.
      const r = rng(7);
      const order = list.map((p, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      order.forEach((o, slot) => (list[o].slot = slot));
      return list;
    };
    let list = people();

    const draw = () => {
      const W = svgEl.clientWidth || 600;
      const narrow = W < 520;
      const gap = narrow ? 9.5 : 12;
      const r = gap * 0.38;
      const t = pair.table;
      const perRow = narrow ? 13 : 16;
      const labelH = 34;
      const headH = narrow && phase === 2 ? 36 : 22;
      const colW = perRow * gap + 16;
      const leftW = narrow ? 0 : 92;
      const rowsOf = (k) => Math.ceil(t[k] / perRow);
      const rowTop = labelH + 4;
      const h0 = Math.max(rowsOf("bothYes"), rowsOf("aOnly")) * gap + headH + 8;
      const h1 = Math.max(rowsOf("bOnly"), rowsOf("neither")) * gap + headH + 8;
      const boxW = Math.min(colW, (W - leftW - 12) / 2);
      const ox = leftW + (W - leftW - 2 * boxW - 10) / 2;
      const cellXY = {
        bothYes: [ox, rowTop],
        bOnly: [ox, rowTop + h0 + 10],
        aOnly: [ox + boxW + 10, rowTop],
        neither: [ox + boxW + 10, rowTop + h0 + 10],
      };
      const cellH = { bothYes: h0, aOnly: h0, bOnly: h1, neither: h1 };
      const sortedH = rowTop + h0 + h1 + 16;
      const mixCols = Math.floor((W - 8) / gap);
      const mixH = Math.ceil(list.length / mixCols) * gap + 16;
      const H = phase === 0 ? Math.max(mixH, 120) : sortedH;
      svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);
      const tr = !RM ? d3.transition().duration(800).ease(d3.easeCubicInOut) : null;
      const A = pair.aLabel;
      const B = pair.bLabel;
      const cellLabel = {
        bothYes: `Both`,
        aOnly: `${A} only`,
        bOnly: `${B} only`,
        neither: `Neither`,
      };
      const cellPos = (p) => {
        if (phase === 0) return [4 + (p.slot % mixCols) * gap + gap / 2, 8 + Math.floor(p.slot / mixCols) * gap + gap / 2];
        const [cx, cy] = cellXY[p.cell];
        const w = Math.min(perRow, Math.floor((boxW - 16) / gap));
        return [cx + 8 + (p.k % w) * gap + gap / 2, cy + headH + Math.floor(p.k / w) * gap + gap / 2];
      };
      const dots = gDots.selectAll("circle").data(list, (p) => `${p.cell}-${p.k}`);
      dots.exit().remove();
      const ent = dots
        .enter()
        .append("circle")
        .attr("r", r)
        .attr("cx", (p) => cellPos(p)[0])
        .attr("cy", (p) => cellPos(p)[1]);
      const m = ent.merge(dots).attr("class", (p) => `tbi3-person ${CELL_CLASS[p.cell]}`);
      (tr ? m.transition(tr) : m)
        .attr("r", r)
        .attr("cx", (p) => cellPos(p)[0])
        .attr("cy", (p) => cellPos(p)[1]);

      // Boxes, labels and counts
      gBoxes.selectAll("*").remove();
      gText.selectAll("*").remove();
      gGhost.selectAll("*").remove();
      if (phase === 0) return;
      const N = t.N;
      const rowA = t.bothYes + t.aOnly;
      const colB = t.bothYes + t.bOnly;
      const expected = {
        bothYes: (rowA * colB) / N,
        aOnly: (rowA * (N - colB)) / N,
        bOnly: ((N - rowA) * colB) / N,
        neither: ((N - rowA) * (N - colB)) / N,
      };
      CELL_KEYS.forEach((k) => {
        const [cx, cy] = cellXY[k];
        gBoxes
          .append("rect")
          .attr("class", `tbi3-cell ${k === "bothYes" ? "is-both" : ""}`)
          .attr("x", cx)
          .attr("y", cy)
          .attr("width", boxW)
          .attr("height", cellH[k])
          .attr("rx", 8);
        gText
          .append("text")
          .attr("class", "tbi3-cell-label")
          .attr("x", cx + 8)
          .attr("y", cy + 15)
          .text(`${cellLabel[k]}: ${t[k]}`);
        if (phase === 2) {
          const w = Math.min(perRow, Math.floor((boxW - 16) / gap));
          const e = expected[k];
          const full = Math.floor(e);
          // Outline the slots chance alone would fill, so the gap between observed and expected is visible.
          const pts = d3.range(Math.round(e)).map((i) => [cx + 8 + (i % w) * gap + gap / 2, cy + headH + Math.floor(i / w) * gap + gap / 2]);
          gGhost
            .selectAll(null)
            .data(pts)
            .join("circle")
            .attr("class", "tbi3-ghost")
            .attr("cx", (d) => d[0])
            .attr("cy", (d) => d[1])
            .attr("r", r + 1.6)
            .style("opacity", 0)
            .transition()
            .duration(RM ? 0 : 400)
            .delay((d, i) => (RM ? 0 : i * 4))
            .style("opacity", 1);
          gText
            .append("text")
            .attr("class", "tbi3-cell-exp")
            .attr("x", narrow ? cx + 8 : cx + boxW - 8)
            .attr("y", narrow ? cy + 29 : cy + 15)
            .attr("text-anchor", narrow ? "start" : "end")
            .text(`chance: ${e.toFixed(1)}`);
          void full;
        }
      });
      if (!narrow) {
        gText
          .append("text")
          .attr("class", "tbi3-cell-axis")
          .attr("x", ox - 10)
          .attr("y", rowTop + h0 / 2)
          .attr("text-anchor", "end")
          .text(`${B}: yes`);
        gText
          .append("text")
          .attr("class", "tbi3-cell-axis")
          .attr("x", ox - 10)
          .attr("y", rowTop + h0 + 10 + h1 / 2)
          .attr("text-anchor", "end")
          .text(`${B}: no`);
      }
      gText
        .append("text")
        .attr("class", "tbi3-cell-axis")
        .attr("x", ox + boxW / 2)
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .text(`${A}: yes`);
      gText
        .append("text")
        .attr("class", "tbi3-cell-axis")
        .attr("x", ox + boxW + 10 + boxW / 2)
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .text(`${A}: no`);
      void expected;
    };

    // The arithmetic panel, rebuilt for the chosen pair.
    const math = () => {
      const t = pair.table;
      const a = t.bothYes;
      const b = t.aOnly;
      const c = t.bOnly;
      const d = t.neither;
      const N = t.N;
      const phi = (a * d - b * c) / Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
      const tt = (Math.abs(phi) * Math.sqrt(N - 2)) / Math.sqrt(1 - phi * phi);
      const expBoth = ((a + b) * (a + c)) / N;
      const box = $("tbi3-grid-math");
      box.innerHTML = `
        <div class="tbi3-eq"><span class="tbi3-eq-l">φ =</span>
          <span class="tbi3-frac"><span>${a} × ${d} − ${b} × ${c}</span><span>√(${a + b} × ${c + d} × ${a + c} × ${b + d})</span></span>
          <span class="tbi3-eq-r">= <strong>${phi.toFixed(2)}</strong></span></div>
        <div class="tbi3-eq-note">Both: ${a} people, against ${expBoth.toFixed(1)} expected by chance.
        With ${N} people answering both questions, t = ${tt.toFixed(2)}; the cut-off for p&nbsp;&lt;&nbsp;0.01 is ${pair.tCritical_p01_oneTailed.toFixed(2)}.
        <strong>${tt > pair.tCritical_p01_oneTailed ? "An edge." : "No edge."}</strong></div>`;
      $("tbi3-grid-read").textContent =
        phase === 0
          ? `${N} people who answered questions about both ${pair.aLabel.toLowerCase()} and ${pair.bLabel.toLowerCase()}, in no particular order.`
          : phase === 1
            ? `Sorted: ${a} have both, ${b} only ${pair.aLabel.toLowerCase()}, ${c} only ${pair.bLabel.toLowerCase()}, ${d} neither.`
            : `If the two conditions had nothing to do with each other, about ${expBoth.toFixed(1)} people would have both. ${a} do. φ = ${phi.toFixed(2)}. ${PAIR_NOTE[pair.id] || ""}`;
    };

    const setPhase = (p) => {
      phase = p;
      $("tbi3-grid-sort").setAttribute("aria-pressed", p >= 1 ? "true" : "false");
      $("tbi3-grid-chance").setAttribute("aria-pressed", p === 2 ? "true" : "false");
      draw();
      math();
    };
    $("tbi3-grid-sort").addEventListener("click", () => setPhase(phase >= 1 ? 0 : 1));
    $("tbi3-grid-chance").addEventListener("click", () => setPhase(phase === 2 ? 1 : 2));
    pairButtons.forEach((b) =>
      b.addEventListener("click", () => {
        pair = pairs[b.getAttribute("data-pair")];
        pressed(pairButtons, b);
        list = people();
        gDots.selectAll("*").remove();
        draw();
        math();
      })
    );
    draw();
    math();
    onWidth(svgEl, draw);
    T.onVisible(svgEl, () => setTimeout(() => phase === 0 && setPhase(1), RM ? 0 : 900), 0.6);
  });

  /* ------------------------------------------------------------------ */
  /* 6. Relative risk and phi (illustration)                             */
  /* ------------------------------------------------------------------ */

  (function rrFigure() {
    const box = $("tbi3-rr");
    if (!box) return;
    const sA = $("tbi3-rr-a");
    const sB = $("tbi3-rr-b");
    const sL = $("tbi3-rr-l");
    const N = 10000;
    const logP = (v) => Math.round(10 ** (-2.3 + (v / 100) * 2) * 1000) / 1000; // 0.5%..50%
    const toSlider = (p) => ((Math.log10(p) + 2.3) / 2) * 100;
    const presets = {
      rare: [0.01, 0.015, 6],
      common: [0.3, 0.35, 1.8],
      mixed: [0.01, 0.35, 2.5],
    };
    const update = () => {
      const pA = logP(+sA.value);
      const pB = logP(+sB.value);
      const nA = pA * N;
      const nB = pB * N;
      const lmax = N / Math.max(nA, nB);
      const L = Math.min(+sL.value / 10, lmax);
      const both = (L * nA * nB) / N;
      const rr = (both * N) / (nA * nB);
      const phi = (both * N - nA * nB) / Math.sqrt(nA * nB * (N - nA) * (N - nB));
      const phiMax = (Math.min(nA, nB) * N - nA * nB) / Math.sqrt(nA * nB * (N - nA) * (N - nB));
      $("tbi3-rr-av").textContent = `${(pA * 100).toFixed(1)}%`;
      $("tbi3-rr-bv").textContent = `${(pB * 100).toFixed(1)}%`;
      $("tbi3-rr-lv").textContent = `${L.toFixed(1)}×${L < +sL.value / 10 - 0.01 ? " (the most possible)" : ""}`;
      const setBar = (id, v, max, label) => {
        const el = $(id);
        el.querySelector(".tbi3-rr-fill").style.width = `${Math.max(0, Math.min(1, v / max)) * 100}%`;
        el.querySelector(".tbi3-rr-val").textContent = label;
      };
      setBar("tbi3-rr-rr", rr, 10, rr.toFixed(1));
      setBar("tbi3-rr-phi", Math.max(0, phi), 1, phi.toFixed(3));
      $("tbi3-rr-read").textContent =
        `Of 10,000 imaginary people, ${Math.round(nA)} have A, ${Math.round(nB)} have B and ${Math.round(both)} have both (chance alone would give ${((nA * nB) / N).toFixed(1)}). Relative risk ${rr.toFixed(1)}; φ ${phi.toFixed(3)}, out of a highest possible φ of ${phiMax.toFixed(2)} for these two prevalences.`;
    };
    [sA, sB, sL].forEach((s) => s.addEventListener("input", update));
    const pb = all("[data-rr]");
    pb.forEach((b) =>
      b.addEventListener("click", () => {
        const [a, bb, l] = presets[b.getAttribute("data-rr")];
        sA.value = toSlider(a);
        sB.value = toSlider(bb);
        sL.value = l * 10;
        pressed(pb, b);
        update();
      })
    );
    [sA, sB, sL].forEach((s) => s.addEventListener("input", () => pressed(pb, null)));
    sA.value = toSlider(0.01);
    sB.value = toSlider(0.015);
    sL.value = 60;
    update();
  })();

  /* ------------------------------------------------------------------ */
  /* 7. Where to draw the line: the significance threshold               */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-th", (D, svgEl) => {
    const P = D.phi;
    const order = P.order;
    const net = D.nets["bmc-all-y5"];
    const pairs = [];
    for (let i = 0; i < order.length; i++)
      for (let j = i + 1; j < order.length; j++) {
        const phi = P.bmc.phi[i][j];
        const N = P.bmc.N[i][j];
        if (phi == null || N == null || Math.abs(phi) >= 1) continue;
        const t = (Math.abs(phi) * Math.sqrt(N - 2)) / Math.sqrt(1 - phi * phi);
        pairs.push({ source: order[i], target: order[j], phi, N, p: tUpper(t, N - 2), paper: !!P.bmc.significant[i][j] });
      }
    const tested = (order.length * (order.length - 1)) / 2;
    const slider = $("tbi3-th-alpha");
    const marks = all("[data-alpha]");
    const toAlpha = (v) => 10 ** (-5 + (v / 1000) * 4.3); // 1e-5 .. 0.2
    const toSlider = (a) => ((Math.log10(a) + 5) / 4.3) * 1000;
    const view = NetView(svgEl, { minR: 5, maxR: 5, aspect: (w) => (w < 560 ? 1.0 : 0.6), trayLabel: "" });
    const ids = D.ids;
    const update = (animate) => {
      const alpha = toAlpha(+slider.value);
      const edges = pairs.filter((p) => p.p < alpha);
      const touched = new Set();
      edges.forEach((e) => {
        touched.add(e.source);
        touched.add(e.target);
      });
      view
        .set({
          key: "th",
          nodes: ids.map((id) => ({ id, ux: net.nodeMap.get(id).x, uy: net.nodeMap.get(id).y, iso: false })),
          edges,
          size: () => 0,
          nodeClass: (id) => (touched.has(id) ? "" : "is-dim"),
          edgeClass: (e) => (e.phi < 0 ? "is-neg" : e.paper ? "" : "is-new"),
        })
        .draw(animate);
      const neg = edges.filter((e) => e.phi < 0).length;
      const extra = edges.filter((e) => !e.paper).length;
      const missing = pairs.filter((p) => p.paper && p.p >= alpha).length;
      const exp = tested * alpha;
      $("tbi3-th-val").textContent = alpha >= 0.001 ? `p < ${alpha.toPrecision(2)}` : `p < ${alpha.toExponential(1)}`;
      $("tbi3-th-read").innerHTML = `<strong>${edges.length}</strong> edges${neg ? `, ${neg} of them negative (dashed)` : ""}. ${
        extra ? `${extra} not in the published network. ` : ""
      }${missing ? `${missing} published edges gone. ` : ""}If no two conditions were truly related, about <strong>${exp < 0.1 ? exp.toFixed(3) : exp < 10 ? exp.toFixed(1) : Math.round(exp)}</strong> edges would appear by chance alone at this threshold.`;
    };
    slider.addEventListener("input", () => {
      pressed(marks, null);
      update(false);
    });
    marks.forEach((b) =>
      b.addEventListener("click", () => {
        slider.value = toSlider(+b.getAttribute("data-alpha"));
        pressed(marks, b);
        update(true);
      })
    );
    slider.value = toSlider(0.01);
    update(false);
    onWidth(svgEl, () => update(false));
  });

  /* ------------------------------------------------------------------ */
  /* 8. The map, with a linked phi heatmap                               */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-map", (D, svgEl) => {
    const net = D.nets["bmc-all-y5"];
    const ids = D.ids;
    const edges = net.useEdges;
    const M = G.measures(ids, edges);
    const prev = D.cohort.prevalence.overall.conditions;
    const P = D.phi;
    const measureButtons = all("[data-measure]");
    const tourButtons = all("[data-tour]");
    const card = $("tbi3-map-card");
    let measure = "prevalence";
    let selected = null;
    let hover = null;
    let tour = null;
    let heatHover = null;
    const MEAS = {
      prevalence: {
        name: "How common",
        get: (id) => (prev[id].any.p == null ? 0.02 : prev[id].any.p),
        fmt: (id) => (prev[id].any.p == null ? "fewer than 11 people" : pct(prev[id].any.p)),
      },
      degree: { name: "Degree", get: (id) => M[id].degree, fmt: (id) => `${M[id].degree} links` },
      strength: { name: "Weighted degree", get: (id) => M[id].strength, fmt: (id) => f2(M[id].strength) },
      betweenness: { name: "Betweenness", get: (id) => M[id].betweenness, fmt: (id) => f3(M[id].betweenness) },
      eigenvector: { name: "Eigenvector", get: (id) => M[id].eigenvector, fmt: (id) => f3(M[id].eigenvector) },
      triangles: { name: "Triangles", get: (id) => M[id].triangles, fmt: (id) => `${M[id].triangles}` },
    };
    const maxOf = (k) => d3.max(ids, (id) => MEAS[k].get(id)) || 1;
    const nbrs = (id) =>
      edges
        .filter((e) => e.source === id || e.target === id)
        .map((e) => ({ id: e.source === id ? e.target : e.source, phi: e.phi }))
        .sort((a, b) => b.phi - a.phi);
    const TOURS = {
      core: {
        nodes: ["Anxiety", "Depression", "PTSD", "PanicAttacks", "Alcoholism", "DrugAddiction", "ADDADHD"],
        text: "The psychiatric core: seven conditions with 2 to 25 triangles each, tied together by the network's strongest edges.",
      },
      bridges: {
        nodes: ["HighBloodCholesterol", "BipolarDisorder", "Emphysema", "CongHF", "OtherHeartConditions"],
        text: "The five conditions with the highest betweenness: they sit between groups rather than inside one.",
      },
      heart: {
        nodes: [
          "CongHF",
          "MyocardialInfarction",
          "OtherHeartConditions",
          "Pneumonia",
          "Emphysema",
          "HighBloodCholesterol",
          "Hypertension",
          "Diabetes",
          "Cataracts",
          "Stroke",
        ],
        text: "Heart, lungs and metabolism: a looser neighbourhood, joined to the psychiatric core mostly through bipolar disorder, emphysema and liver disease.",
      },
    };
    const focusSet = () => {
      const f = selected || hover || (heatHover ? heatHover[0] : null);
      if (tour) return { set: new Set(TOURS[tour].nodes), edgesIn: true };
      if (heatHover) return { set: new Set(heatHover), pair: heatHover };
      if (!f) return null;
      return { set: new Set([f, ...nbrs(f).map((n) => n.id)]), center: f };
    };
    const ariaFor = (id) =>
      `${LABEL[id]}: ${MEAS.prevalence.fmt(id)} reported it; ${M[id].degree} links; betweenness ${f3(M[id].betweenness)}. Press Enter to pin.`;
    const view = NetView(svgEl, {
      minR: 4,
      maxR: 18,
      focusable: true,
      ariaLabel: ariaFor,
      trayLabel: "No edges:",
      onHover: (id) => {
        hover = id;
        refresh();
      },
      onSelect: (id) => {
        selected = id === selected ? null : id;
        tour = null;
        pressed(tourButtons, null);
        if (selected) zoom.focus(selected);
        refresh();
      },
    });
    const zoom = addZoom(view, svgEl.parentNode, { inBtn: "tbi3-zoom-in", outBtn: "tbi3-zoom-out", resetBtn: "tbi3-zoom-reset" });
    const nodes = viewNodes(net, edges, ids);

    const renderCard = (id) => {
      if (!id) {
        card.innerHTML = `<p class="tbi3-card-hint">Hover, tap or tab to a condition to see how common it was and what it is linked to. Tap again, or press Escape, to let go.</p>`;
        return;
      }
      const p = prev[id];
      const line = (o, label) =>
        o.suppressed || o.p == null
          ? `<span>${label}</span><span>fewer than 11</span>`
          : `<span>${label}</span><span>${pct(o.p)} <span class="tbi3-ci">(${pct(o.lo)}–${pct(o.hi)})</span></span>`;
      const nb = nbrs(id);
      card.innerHTML = `
        <div class="tbi3-card-head"><span class="tbi3-swatch ${CAT_CLASS[cat(id)]}"></span><strong>${fullName(id)}</strong></div>
        <div class="tbi3-card-cat">${CAT_NAME[cat(id)]}</div>
        <div class="tbi3-card-grid">
          ${line(p.any, "Reported at all")}
          ${line(p.afterInjury, "Began at or after the injury")}
          <span>Links (degree)</span><span>${M[id].degree}</span>
          <span>Betweenness</span><span>${f3(M[id].betweenness)}</span>
          <span>Eigenvector</span><span>${f3(M[id].eigenvector)}</span>
          <span>Triangles</span><span>${M[id].triangles}</span>
        </div>
        <div class="tbi3-card-nb">${
          nb.length
            ? `Linked to ${nb.map((n) => `<button type="button" class="tbi3-chip ${CAT_CLASS[cat(n.id)]}" data-go="${n.id}">${LABEL[n.id]} <span>${n.phi.toFixed(2)}</span></button>`).join("")}`
            : "No significant links in this network."
        }</div>`;
      card.querySelectorAll("[data-go]").forEach((b) =>
        b.addEventListener("click", () => {
          selected = b.getAttribute("data-go");
          zoom.focus(selected);
          refresh();
        })
      );
    };

    // Heatmap
    const heat = $("tbi3-map-heat");
    const hOrder = ids.slice().sort((a, b) => CAT_ORDER.indexOf(cat(a)) - CAT_ORDER.indexOf(cat(b)) || LABEL[a].localeCompare(LABEL[b]));
    const pIdx = new Map(P.order.map((id, i) => [id, i]));
    let hctx = null;
    let hW = 0;
    let cell = 0;
    let hOff = 0;
    let cursor = [0, 1];
    const phiAt = (a, b) => P.bmc.phi[pIdx.get(a)][pIdx.get(b)];
    const sigAt = (a, b) => P.bmc.significant[pIdx.get(a)][pIdx.get(b)];
    const paintHeat = () => {
      if (!hctx) return;
      const ink = T.cssVar("--global-text-color");
      const accent = T.cssVar("--global-theme-color");
      const neg = T.cssVar("--tbi-cardio");
      const bg = T.cssVar("--global-bg-color");
      hctx.clearRect(0, 0, hW, hW);
      const f = focusSet();
      hOrder.forEach((a, i) => {
        hctx.fillStyle = catColor(a);
        hctx.fillRect(hOff - 6, hOff + i * cell + 1, 4, cell - 2);
        hctx.fillRect(hOff + i * cell + 1, hOff - 6, cell - 2, 4);
        hOrder.forEach((b, j) => {
          const x = hOff + j * cell;
          const y = hOff + i * cell;
          if (i === j) {
            hctx.fillStyle = T.cssVar("--tbi-rule") || "rgba(0,0,0,0.1)";
            hctx.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
            return;
          }
          const v = phiAt(a, b);
          if (v == null) return;
          const s = Math.min(1, Math.abs(v) / 0.5);
          hctx.globalAlpha = 0.04 + 0.96 * Math.pow(s, 1.25);
          hctx.fillStyle = v < 0 ? neg : accent;
          hctx.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
          hctx.globalAlpha = 1;
          if (sigAt(a, b)) {
            hctx.fillStyle = bg;
            hctx.beginPath();
            hctx.arc(x + cell / 2, y + cell / 2, Math.max(1.2, cell * 0.12), 0, 6.2832);
            hctx.fill();
          }
          if (
            f &&
            ((f.pair && ((a === f.pair[0] && b === f.pair[1]) || (a === f.pair[1] && b === f.pair[0]))) ||
              (f.center && (a === f.center || b === f.center)))
          ) {
            hctx.globalAlpha = f.pair ? 1 : 0.45;
            hctx.strokeStyle = ink;
            hctx.lineWidth = 1;
            hctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
            hctx.globalAlpha = 1;
          }
        });
      });
      if (document.activeElement === heat) {
        hctx.strokeStyle = accent;
        hctx.lineWidth = 2;
        hctx.strokeRect(hOff + cursor[1] * cell, hOff + cursor[0] * cell, cell, cell);
      }
    };
    const sizeHeat = () => {
      hW = Math.min(heat.parentNode.clientWidth, 420);
      heat.style.width = `${hW}px`;
      heat.style.height = `${hW}px`;
      hctx = T.fitCanvas(heat).ctx;
      hOff = 10;
      cell = (hW - hOff - 2) / hOrder.length;
      paintHeat();
    };
    const heatPair = (ev) => {
      const r = heat.getBoundingClientRect();
      const j = Math.floor((ev.clientX - r.left - hOff) / cell);
      const i = Math.floor((ev.clientY - r.top - hOff) / cell);
      if (i < 0 || j < 0 || i >= hOrder.length || j >= hOrder.length || i === j) return null;
      return [i, j];
    };
    const showPair = (ij, anchor) => {
      if (!ij) {
        heatHover = null;
        $("tbi3-map-heat-read").textContent = "Hover, tap, or focus the matrix and use the arrow keys, to read any pair.";
        refresh();
        return;
      }
      const a = hOrder[ij[0]];
      const b = hOrder[ij[1]];
      heatHover = [a, b];
      const i = pIdx.get(a);
      const j = pIdx.get(b);
      const v = P.bmc.phi[i][j];
      const t = P.bmc.t[i][j];
      $("tbi3-map-heat-read").textContent =
        v == null
          ? `${LABEL[a]} and ${LABEL[b]}: not computable (too few answers).`
          : `${LABEL[a]} and ${LABEL[b]}: φ = ${v.toFixed(2)}, ${P.bmc.N[i][j]} people answered both; t = ${t == null ? "∞" : t.toFixed(2)} against a cut-off of ${P.bmc.tCrit[i][j].toFixed(2)}. ${P.bmc.significant[i][j] ? "An edge." : "No edge."}`;
      void anchor;
      refresh();
    };
    heat.addEventListener("pointermove", (ev) => showPair(heatPair(ev), ev));
    heat.addEventListener("pointerdown", (ev) => showPair(heatPair(ev), ev));
    heat.addEventListener("pointerleave", (ev) => ev.pointerType === "mouse" && showPair(null));
    heat.addEventListener("focus", () => showPair(cursor));
    heat.addEventListener("blur", () => showPair(null));
    heat.addEventListener("keydown", (ev) => {
      const k = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[ev.key];
      if (!k) return;
      ev.preventDefault();
      const n = hOrder.length;
      cursor = [(cursor[0] + k[0] + n) % n, (cursor[1] + k[1] + n) % n];
      if (cursor[0] === cursor[1]) cursor[1] = (cursor[1] + (k[1] || 1) + n) % n;
      showPair(cursor);
    });

    const refresh = () => {
      const mx = maxOf(measure);
      const f = focusSet();
      view
        .set({
          key: "map",
          nodes,
          edges,
          size: (id) => MEAS[measure].get(id) / mx,
          nodeClass: (id) => {
            if (!f) return "";
            if (f.center === id || (f.pair && f.pair.includes(id))) return "is-focus";
            return f.set.has(id) ? "is-near" : "is-dim";
          },
          edgeClass: (e) => {
            if (!f) return "";
            if (f.pair)
              return (e.source === f.pair[0] && e.target === f.pair[1]) || (e.source === f.pair[1] && e.target === f.pair[0]) ? "is-hot" : "is-faint";
            if (f.center) return e.source === f.center || e.target === f.center ? "is-hot" : "is-faint";
            return f.set.has(e.source) && f.set.has(e.target) ? "is-hot" : "is-faint";
          },
        })
        .draw(false);
      renderCard(selected || hover || null);
      paintHeat();
      const list = $("tbi3-map-list");
      if (!list.hidden) renderList();
    };
    const renderList = () => {
      const list = $("tbi3-map-list");
      const rows = ids.slice().sort((a, b) => MEAS[measure].get(b) - MEAS[measure].get(a));
      list.innerHTML = `<table class="tbi3-table"><caption class="tbi3-sr">Conditions sorted by ${MEAS[measure].name.toLowerCase()}</caption><thead><tr><th scope="col">Condition</th><th scope="col">${MEAS[measure].name}</th><th scope="col">Linked to (φ)</th></tr></thead><tbody>${rows
        .map(
          (id) =>
            `<tr><th scope="row"><span class="tbi3-swatch ${CAT_CLASS[cat(id)]}"></span>${LABEL[id]}</th><td>${MEAS[measure].fmt(id)}</td><td>${
              nbrs(id)
                .map((n) => `${LABEL[n.id]} ${n.phi.toFixed(2)}`)
                .join(", ") || "none"
            }</td></tr>`
        )
        .join("")}</tbody></table>`;
    };
    $("tbi3-map-listbtn").addEventListener("click", (ev) => {
      const list = $("tbi3-map-list");
      list.hidden = !list.hidden;
      ev.currentTarget.setAttribute("aria-pressed", list.hidden ? "false" : "true");
      if (!list.hidden) renderList();
    });
    measureButtons.forEach((b) =>
      b.addEventListener("click", () => {
        measure = b.getAttribute("data-measure");
        pressed(measureButtons, b);
        const top = ids
          .slice()
          .sort((a, c) => MEAS[measure].get(c) - MEAS[measure].get(a))
          .slice(0, 3);
        $("tbi3-map-read").textContent =
          `Sized by ${MEAS[measure].name.toLowerCase()}. Largest: ${top.map((id) => `${LABEL[id]} (${MEAS[measure].fmt(id)})`).join(", ")}.`;
        view.set({ size: (id) => MEAS[measure].get(id) / maxOf(measure) }).draw(true);
        refresh();
      })
    );
    tourButtons.forEach((b) =>
      b.addEventListener("click", () => {
        const k = b.getAttribute("data-tour");
        tour = tour === k ? null : k;
        selected = null;
        pressed(tourButtons, tour ? b : null);
        $("tbi3-map-read").textContent = tour ? TOURS[tour].text : "";
        refresh();
      })
    );
    svgEl.addEventListener("click", (ev) => {
      if (ev.target === svgEl && selected) {
        selected = null;
        refresh();
      }
    });
    refresh();
    sizeHeat();
    showPair(null);
    onWidth(svgEl, () => {
      zoom.reset();
      refresh();
    });
    onWidth(heat.parentNode, sizeHeat);
    T.onThemeChange(paintHeat);
  });

  /* ------------------------------------------------------------------ */
  /* 9. Global measures: predict, then compare with chance               */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-glob", (D, box) => {
    const net = D.nets["bmc-all-y5"];
    const s = G.summary(D.ids, net.useEdges);
    const ref = net.stats.randomReference;
    const th = D.nets["thesis-mild-y5"];
    const guessButtons = all("[data-glob-guess]");
    const cards = [
      { k: "Density", v: f2(s.density), sub: `${s.m} of ${(s.n * (s.n - 1)) / 2} possible edges, among the ${s.n} conditions with any edge` },
      { k: "Average path length", v: f2(s.avgPath), sub: `steps between two conditions, on average`, ref: f2(ref.avgPathLength) },
      { k: "Diameter", v: s.diameter, sub: "the longest shortest path" },
      {
        k: "Average clustering",
        v: f2(s.clustering),
        sub: "share of a condition's neighbours that are linked to each other",
        ref: f2(ref.avgClustering),
      },
      { k: "Assortativity", v: (s.assortativity > 0 ? "+" : "") + f2(s.assortativity), sub: "do well-connected conditions link to each other?" },
      { k: "Triangles", v: s.triangles, sub: "closed loops of three conditions" },
    ];
    box.innerHTML = cards
      .map(
        (c) =>
          `<div class="tbi3-gcard"><div class="tbi3-gcard-k">${c.k}</div><div class="tbi3-gcard-v">${c.v}</div>${
            c.ref ? `<div class="tbi3-gcard-ref" hidden>random networks: <strong>${c.ref}</strong></div>` : ""
          }<div class="tbi3-gcard-s">${c.sub}</div></div>`
      )
      .join("");
    const reveal = (guess) => {
      box.querySelectorAll(".tbi3-gcard-ref").forEach((el) => (el.hidden = false));
      box.classList.add("is-revealed");
      const cr = s.clustering / ref.avgClustering;
      const lr = s.avgPath / ref.avgPathLength;
      const verdict = guess === "more" ? "You guessed more clustered, and it is." : guess ? "It is in fact more clustered than chance." : "";
      $("tbi3-glob-read").textContent =
        `${verdict} Against 500 random networks with the same ${s.n} nodes and ${s.m} edges, the clustering is ${cr.toFixed(1)} times higher (${f2(s.clustering)} against ${f2(ref.avgClustering)}), while the average path is only ${Math.round((lr - 1) * 100)}% longer (${f2(s.avgPath)} against ${f2(ref.avgPathLength)}). Thesis network, for comparison: ${th.stats.edges} edges, diameter ${th.stats.diameter}, clustering ${th.published_values.avgClustering} as published.`;
    };
    guessButtons.forEach((b) =>
      b.addEventListener("click", () => {
        pressed(guessButtons, b);
        reveal(b.getAttribute("data-glob-guess"));
      })
    );
    $("tbi3-glob-show").addEventListener("click", () => reveal(null));
  });

  /* ------------------------------------------------------------------ */
  /* 10. Common is not central: prevalence against betweenness           */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-bridge", (D, svgEl) => {
    const net = D.nets["bmc-all-y5"];
    const M = G.measures(D.ids, net.useEdges);
    const prev = D.cohort.prevalence.overall.conditions;
    const guessButtons = all("[data-bridge-guess]");
    const svg = d3.select(svgEl);
    let revealed = false;
    let guess = null;
    const draw = () => {
      const W = svgEl.clientWidth || 600;
      const narrow = W < 520;
      const H = narrow ? 320 : 340;
      const m = { l: narrow ? 72 : 96, r: narrow ? 14 : 24, t: 14, b: 44 };
      svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);
      svg.selectAll("*").remove();
      const x = d3
        .scaleLinear()
        .domain([0, 0.5])
        .range([m.l, W - m.r]);
      const y = d3
        .scaleLinear()
        .domain([0, 0.2])
        .range([H - m.b, m.t]);
      [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach((v) => {
        svg
          .append("line")
          .attr("class", "tbi3-grid")
          .attr("x1", x(v))
          .attr("x2", x(v))
          .attr("y1", m.t)
          .attr("y2", H - m.b);
        svg
          .append("text")
          .attr("class", "tbi3-tick")
          .attr("x", x(v))
          .attr("y", H - m.b + 15)
          .attr("text-anchor", "middle")
          .text(`${v * 100}%`);
      });
      [0, 0.05, 0.1, 0.15, 0.2].forEach((v) => {
        svg
          .append("line")
          .attr("class", "tbi3-grid")
          .attr("x1", m.l)
          .attr("x2", W - m.r)
          .attr("y1", y(v))
          .attr("y2", y(v));
        svg
          .append("text")
          .attr("class", "tbi3-tick")
          .attr("x", m.l - 6)
          .attr("y", y(v) + 4)
          .attr("text-anchor", "end")
          .text(v.toFixed(2));
      });
      // Conditions reported by fewer than 11 people can't be shown at their true prevalence.
      const bandX = narrow ? 10 : 18;
      svg
        .append("text")
        .attr("class", "tbi3-tick")
        .attr("x", bandX)
        .attr("y", H - m.b + 15)
        .text("<11 people");
      svg
        .append("text")
        .attr("class", "tbi3-axis-label")
        .attr("x", (m.l + W - m.r) / 2)
        .attr("y", H - 6)
        .attr("text-anchor", "middle")
        .text("Share of the 225 who reported the condition at all");
      svg
        .append("text")
        .attr("class", "tbi3-axis-label")
        .attr("transform", `translate(${narrow ? 12 : 14},${(m.t + H - m.b) / 2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .text(revealed ? "Betweenness" : "Betweenness (hidden until you guess)");
      const pts = D.ids
        .filter((id) => M[id].degree > 0)
        .map((id) => ({ id, px: prev[id].any.p, b: M[id].betweenness }))
        .map((d) => ({ ...d, x: d.px == null ? bandX + 20 : x(d.px), y: revealed ? y(d.b) : y(0.1) + ((D.ids.indexOf(d.id) % 7) - 3) * 9 }));
      const tr = !RM ? d3.transition().duration(900).ease(d3.easeCubicOut) : null;
      const g = svg
        .append("g")
        .selectAll("g")
        .data(pts)
        .join("g")
        .attr("class", (d) => `tbi3-sc ${CAT_CLASS[cat(d.id)]} ${guess === d.id ? "is-guess" : ""}`)
        .attr("transform", (d) => `translate(${d.x},${revealed && tr ? y(0.1) + ((D.ids.indexOf(d.id) % 7) - 3) * 9 : d.y})`);
      if (tr && revealed)
        g.transition(tr)
          .delay((d, i) => i * 18)
          .attr("transform", (d) => `translate(${d.x},${d.y})`);
      g.append("circle").attr("r", narrow ? 4.5 : 5.5);
      const labelled = new Set([
        "HighBloodCholesterol",
        "BipolarDisorder",
        "Emphysema",
        "CongHF",
        "OtherHeartConditions",
        "Hypertension",
        "Depression",
        "Anxiety",
        "ChronicPain",
        "PanicAttacks",
        "RheumatoidArthritis",
        "Cataracts",
        "Diabetes",
      ]);
      g.filter((d) => revealed && (labelled.has(d.id) || !narrow))
        .append("text")
        .attr("class", "tbi3-sc-label")
        .attr("x", (d) => (d.x > W * 0.72 ? -7 : 7))
        .attr("y", (d) => (["Anxiety", "Pneumonia", "SleepDisorder", "Cataracts"].includes(d.id) ? -7 : 4))
        .attr("text-anchor", (d) => (d.x > W * 0.72 ? "end" : "start"))
        .text((d) => (narrow ? SHORT[d.id] : LABEL[d.id]));
      g.attr("tabindex", 0)
        .attr("role", "img")
        .attr(
          "aria-label",
          (d) => `${LABEL[d.id]}: ${d.px == null ? "fewer than 11 reported it" : pct(d.px)}${revealed ? `, betweenness ${f3(d.b)}` : ""}`
        )
        .on("pointerenter focus", (ev, d) =>
          T.showTooltip(
            `<strong>${LABEL[d.id]}</strong><br>${d.px == null ? "fewer than 11 people" : `${pct(d.px)} reported it`}${revealed ? `<br>betweenness ${f3(d.b)}` : ""}`,
            ev.type === "focus" ? ev.currentTarget : ev
          )
        )
        .on("pointerleave blur", T.hideTooltip);
    };
    const reveal = () => {
      revealed = true;
      draw();
      const ranked = D.ids.slice().sort((a, b) => M[b].betweenness - M[a].betweenness);
      const r = (id) => ranked.indexOf(id) + 1;
      const gtxt = guess ? `You picked ${LABEL[guess]}: it ranks ${r(guess)} of 25 for betweenness. ` : "";
      $("tbi3-bridge-read").textContent =
        `${gtxt}The top three are high cholesterol (${f3(M.HighBloodCholesterol.betweenness)}), bipolar disorder (${f3(M.BipolarDisorder.betweenness)}) and emphysema (${f3(M.Emphysema.betweenness)}). Depression, reported by almost a third of people, ranks ${r("Depression")}.`;
    };
    guessButtons.forEach((b) =>
      b.addEventListener("click", () => {
        guess = b.getAttribute("data-bridge-guess");
        pressed(guessButtons, b);
        reveal();
      })
    );
    $("tbi3-bridge-show").addEventListener("click", () => {
      guess = null;
      pressed(guessButtons, null);
      reveal();
    });
    draw();
    onWidth(svgEl, draw);
  });

  /* ------------------------------------------------------------------ */
  /* 11. Vertex-betweenness clustering on the paper's seven-node example  */
  /* ------------------------------------------------------------------ */

  (function toyFigure() {
    const svgEl = $("tbi3-toy");
    if (!svgEl) return;
    const ids = ["0", "1", "2", "3", "4", "5", "6"];
    const E = [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 5],
      [5, 4],
      [3, 4],
      [4, 6],
    ].map(([a, b]) => ({ source: `${a}`, target: `${b}`, phi: 0.4 }));
    const R = G.vbc(ids, E);
    // Positions after the paper's supplementary Fig. S5 (redrawn).
    const XY = { 0: [0.08, 0.5], 1: [0.3, 0.5], 2: [0.5, 0.18], 3: [0.5, 0.82], 4: [0.72, 0.5], 5: [0.72, 0.12], 6: [0.94, 0.5] };
    const CL_CLASS = ["tbi3-cl-1", "tbi3-cl-2", "tbi3-cl-3", "tbi3-cl-4", "tbi3-cl-5", "tbi3-cl-6", "tbi3-cl-7"];
    const svg = d3.select(svgEl);
    const steps = [
      {
        text: `Start: compute every node's betweenness. Nodes 1 and 4 lie on the most shortest paths (0.40 each). The threshold is the median, ${R.threshold.toFixed(2)}.`,
        removed: [],
        scores: R.steps[0].scores,
      },
      {
        text: "The highest is above the threshold, so remove it: node 1 goes (it ties with 4; the first in order is taken).",
        removed: ["1"],
        scores: R.steps[0].scores,
        gone: "1",
      },
      {
        text: "Recompute on what is left. Without node 1, node 4 now carries even more of the traffic (0.50).",
        removed: ["1"],
        scores: R.steps[1].scores,
      },
      { text: "Still above the threshold: remove node 4.", removed: ["1", "4"], scores: R.steps[1].scores, gone: "4" },
      {
        text: "Recompute: every remaining node scores 0, below the threshold, so stop. What is left falls into four pieces: {0}, {2, 5}, {3} and {6}.",
        removed: ["1", "4"],
        scores: R.steps[2].scores,
        comps: true,
      },
      {
        text: "Put each removed node back into every piece it touched. Node 1 touched 0, 2 and 3; node 4 touched 5, 3 and 6. Four overlapping clusters, exactly as in the paper.",
        removed: [],
        clusters: true,
      },
    ];
    let k = 0;
    const draw = () => {
      const s = steps[k];
      const W = svgEl.clientWidth || 500;
      const H = Math.round(Math.min(260, W * 0.5));
      svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);
      svg.selectAll("*").remove();
      const P = (id) => [24 + XY[id][0] * (W - 48), 26 + XY[id][1] * (H - 52)];
      const compOf = {};
      if (s.comps) {
        const rest = G.build(
          ids.filter((id) => !s.removed.includes(id)),
          E
        );
        G.components(rest).forEach((c, ci) => c.forEach((i) => (compOf[rest.ids[i]] = ci)));
      }
      if (s.clusters) {
        R.clusters.forEach((c, ci) => {
          const pts = c.members.map(P);
          const hull = pts.length > 2 ? d3.polygonHull(pts) : pts;
          const line = d3.line().curve(d3.curveCatmullRomClosed.alpha(0.6));
          const grow = hull.map(([x, y]) => {
            const cx = d3.mean(pts, (p) => p[0]);
            const cy = d3.mean(pts, (p) => p[1]);
            const dx = x - cx;
            const dy = y - cy;
            const L = Math.hypot(dx, dy) || 1;
            const pad = 18 + ci * 3;
            return [x + (dx / L) * pad, y + (dy / L) * pad];
          });
          const shape =
            grow.length > 2
              ? line(grow)
              : (() => {
                  const [a, b] = pts;
                  const dx = b[0] - a[0];
                  const dy = b[1] - a[1];
                  const L = Math.hypot(dx, dy) || 1;
                  const nx = (-dy / L) * (14 + ci * 3);
                  const ny = (dx / L) * (14 + ci * 3);
                  const ex = (dx / L) * 16;
                  const ey = (dy / L) * 16;
                  return line([
                    [a[0] - ex + nx, a[1] - ey + ny],
                    [b[0] + ex + nx, b[1] + ey + ny],
                    [b[0] + ex - nx, b[1] + ey - ny],
                    [a[0] - ex - nx, a[1] - ey - ny],
                  ]);
                })();
          svg.append("path").attr("class", `tbi3-hull ${CL_CLASS[ci]}`).attr("d", shape);
        });
      }
      E.forEach((e) => {
        const gone = s.removed.includes(e.source) || s.removed.includes(e.target);
        const [x1, y1] = P(e.source);
        const [x2, y2] = P(e.target);
        svg
          .append("line")
          .attr("class", `tbi3-toy-edge ${gone ? "is-gone" : ""}`)
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2);
      });
      ids.forEach((id) => {
        const [x, y] = P(id);
        const gone = s.removed.includes(id);
        const g = svg
          .append("g")
          .attr("class", `tbi3-toy-node ${gone ? "is-gone" : ""} ${s.gone === id ? "is-out" : ""} ${s.comps && !gone ? CL_CLASS[compOf[id]] : ""}`);
        g.attr("transform", `translate(${x},${y})`);
        g.append("circle").attr("r", 14);
        g.append("text").attr("class", "tbi3-toy-id").attr("y", 5).attr("text-anchor", "middle").text(id);
        if (s.scores && s.scores.has(id) && !gone)
          g.append("text").attr("class", "tbi3-toy-b").attr("y", -21).attr("text-anchor", "middle").text(s.scores.get(id).toFixed(2));
      });
      $("tbi3-toy-read").textContent = `Step ${k + 1} of ${steps.length}. ${s.text}`;
      $("tbi3-toy-back").disabled = k === 0;
      $("tbi3-toy-next").textContent = k === steps.length - 1 ? "Start again" : "Next step";
      const list = $("tbi3-toy-clusters");
      list.innerHTML = s.clusters
        ? R.clusters
            .map((c, ci) => `<span class="tbi3-clchip ${CL_CLASS[ci]}">Cluster ${ci + 1}: ${c.members.slice().sort().join(", ")}</span>`)
            .join("")
        : "";
    };
    $("tbi3-toy-next").addEventListener("click", () => {
      k = k === steps.length - 1 ? 0 : k + 1;
      draw();
    });
    $("tbi3-toy-back").addEventListener("click", () => {
      k = Math.max(0, k - 1);
      draw();
    });
    T.onVisible(svgEl, draw, 0.05);
    onWidth(svgEl, draw);
  })();

  /* ------------------------------------------------------------------ */
  /* 12. The same algorithm on the real networks                          */
  /* ------------------------------------------------------------------ */

  // Paper numbering of clusters, identified by one core member (BMC Neurology 2025, Figs 4, 6 and 8).
  const PAPER_CLUSTER = {
    "bmc-all-y5": ["Anxiety", "Diabetes", "ObsessiveCompulsiveDisorder", "CongHF", "Dementia", "Osteoarthritis"],
    "bmc-old-y5": ["PTSD", "Emphysema", "Dementia", "HighBloodCholesterol", "SleepDisorder", "Liver"],
    "bmc-young-y5": ["Alcoholism", "Anxiety", "MyocardialInfarction", "PTSD", "RheumatoidArthritis", "SleepDisorder", "Hypertension"],
  };
  const NET_NAME = { "bmc-all-y5": "everyone", "bmc-old-y5": "the older group", "bmc-young-y5": "the younger group" };
  const CL_CLASS = ["tbi3-cl-1", "tbi3-cl-2", "tbi3-cl-3", "tbi3-cl-4", "tbi3-cl-5", "tbi3-cl-6", "tbi3-cl-7"];
  const orderClusters = (netId, clusters) => {
    const sig = PAPER_CLUSTER[netId];
    return clusters.slice().sort((a, b) => sig.findIndex((s) => a.core.includes(s)) - sig.findIndex((s) => b.core.includes(s)));
  };

  lazy("tbi3-vbc", (D, svgEl) => {
    const netButtons = all("[data-vbc-net]");
    const bars = $("tbi3-vbc-bars");
    const chips = $("tbi3-vbc-clusters");
    let netId = "bmc-all-y5";
    let R = null;
    let k = 0;
    let shown = null;
    let timer = 0;
    const view = NetView(svgEl, { minR: 4, maxR: 13, aspect: (w) => (w < 560 ? 1.05 : 0.62) });
    const setup = () => {
      const net = D.nets[netId];
      R = G.vbc(D.ids, net.useEdges);
      R.clusters = orderClusters(netId, R.clusters);
      k = 0;
      shown = null;
      clearInterval(timer);
      render(false);
    };
    const render = (animate) => {
      const net = D.nets[netId];
      const done = k >= R.steps.length;
      const step = R.steps[Math.min(k, R.steps.length - 1)];
      const removed = done ? R.removed : step.removed;
      const sel = shown == null ? null : R.clusters[shown];
      const edges = net.useEdges;
      const ids = D.ids;
      const clusterOf = new Map();
      if (done)
        R.clusters.forEach((c, ci) =>
          c.core.forEach((id) => {
            clusterOf.set(id, ci);
          })
        );
      view
        .set({
          key: netId,
          nodes: viewNodes(net, edges, ids),
          edges,
          size: (id) => (done ? 0.3 : step.scores.has(id) ? Math.min(1, step.scores.get(id) / 0.35) : 0),
          nodeClass: (id) => {
            const parts = [];
            if (sel) parts.push(sel.core.includes(id) ? "is-core" : sel.bridges.includes(id) ? "is-bridge" : "is-dim");
            else if (done)
              parts.push(R.removed.includes(id) ? "is-bridge" : clusterOf.has(id) ? `is-cl ${CL_CLASS[clusterOf.get(id) % 7]}` : "is-dim");
            else if (removed.includes(id)) parts.push("is-gone");
            else if (id === step.top && step.max > R.threshold) parts.push("is-next");
            return parts.join(" ");
          },
          edgeClass: (e) => {
            if (sel)
              return sel.members.includes(e.source) &&
                sel.members.includes(e.target) &&
                !(sel.bridges.includes(e.source) && sel.bridges.includes(e.target))
                ? "is-hot"
                : "is-faint";
            if (done) return clusterOf.has(e.source) && clusterOf.get(e.source) === clusterOf.get(e.target) ? "is-cledge" : "is-faint";
            return removed.includes(e.source) || removed.includes(e.target) ? "is-gone" : "";
          },
        })
        .draw(animate);
      // Bars: the current betweenness ranking with the threshold marked.
      const top = Array.from(step.scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      const max = 0.5;
      bars.innerHTML =
        top
          .map(
            ([id, v], i) =>
              `<div class="tbi3-bar ${i === 0 && v > R.threshold && !done ? "is-key" : ""}"><span class="tbi3-bar-label">${LABEL[id]}</span><span class="tbi3-bar-track"><span class="tbi3-bar-fill" style="width:${Math.min(100, (v / max) * 100)}%"></span><span class="tbi3-bar-thr" style="left:${(R.threshold / max) * 100}%"></span></span><span class="tbi3-bar-val">${f3(v)}</span></div>`
          )
          .join("") + `<div class="tbi3-bar-note">Dashed line: the threshold, the median starting betweenness (${f3(R.threshold)}).</div>`;
      chips.innerHTML = done
        ? R.clusters
            .map(
              (c, ci) =>
                `<button type="button" class="tbi3-clchip ${CL_CLASS[ci % 7]}" data-cl="${ci}" aria-pressed="${shown === ci}">Cluster ${ci + 1}: ${c.core.map((id) => LABEL[id]).join(", ")}${
                  c.bridges.length ? ` <span class="tbi3-clchip-b">+ ${c.bridges.map((id) => LABEL[id]).join(", ")}</span>` : ""
                }</button>`
            )
            .join("")
        : "";
      chips.querySelectorAll("[data-cl]").forEach((b) =>
        b.addEventListener("click", () => {
          const ci = +b.getAttribute("data-cl");
          shown = shown === ci ? null : ci;
          render(false);
        })
      );
      const read = $("tbi3-vbc-read");
      if (done) {
        read.textContent = sel
          ? `Cluster ${shown + 1} for ${NET_NAME[netId]}: core ${sel.core.map((id) => LABEL[id]).join(", ")}${sel.bridges.length ? `; bridges put back in: ${sel.bridges.map((id) => LABEL[id]).join(", ")}` : ""}.`
          : `Done. ${R.removed.length} conditions were removed (${R.removed.map((id) => LABEL[id]).join(", ")}), leaving ${R.clusters.length} clusters once they are put back. Choose a cluster to see it.`;
      } else if (k === 0) {
        read.textContent = `Node size is betweenness. ${LABEL[step.top]} carries the most shortest paths (${f3(step.max)}), above the threshold of ${f3(R.threshold)}.`;
      } else {
        const last = removed[removed.length - 1];
        read.textContent = `Removed ${LABEL[last]}. Recomputed: ${LABEL[step.top]} now leads with ${f3(step.max)}${step.max > R.threshold ? ", still above the threshold." : ", below the threshold, so the removals stop."}`;
      }
      $("tbi3-vbc-step").disabled = done;
      $("tbi3-vbc-step").textContent = k === R.steps.length - 1 ? "Put the removed back" : "Remove the top node";
    };
    const step = () => {
      if (k < R.steps.length) {
        k++;
        render(true);
      }
    };
    $("tbi3-vbc-step").addEventListener("click", step);
    $("tbi3-vbc-run").addEventListener("click", () => {
      clearInterval(timer);
      if (k >= R.steps.length) k = 0;
      render(false);
      if (RM) {
        k = R.steps.length;
        render(false);
        return;
      }
      timer = setInterval(() => {
        if (k >= R.steps.length) clearInterval(timer);
        else step();
      }, 900);
    });
    $("tbi3-vbc-reset").addEventListener("click", () => {
      clearInterval(timer);
      k = 0;
      shown = null;
      render(true);
    });
    netButtons.forEach((b) =>
      b.addEventListener("click", () => {
        netId = b.getAttribute("data-vbc-net");
        pressed(netButtons, b);
        setup();
      })
    );
    T.watchVisibility(svgEl, (v) => !v && clearInterval(timer));
    setup();
    onWidth(svgEl, () => render(false));
  });

  /* ------------------------------------------------------------------ */
  /* 13. Younger and older                                               */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-age", (D, svgEl) => {
    const modeButtons = all("[data-age]");
    const focusButtons = all("[data-age-focus]");
    const old = D.nets["bmc-old-y5"];
    const young = D.nets["bmc-young-y5"];
    const allNet = D.nets["bmc-all-y5"];
    const key = (e) => (e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`);
    const oldSet = new Map(old.useEdges.map((e) => [key(e), e]));
    const youngSet = new Map(young.useEdges.map((e) => [key(e), e]));
    const union = [];
    new Set([...oldSet.keys(), ...youngSet.keys()]).forEach((k) => {
      const o = oldSet.get(k);
      const y = youngSet.get(k);
      const e = o || y;
      union.push({
        source: e.source,
        target: e.target,
        phi: Math.max(o ? Math.abs(o.phi) : 0, y ? Math.abs(y.phi) : 0),
        side: o && y ? "both" : o ? "old" : "young",
      });
    });
    const PSY = new Set([
      "Anxiety",
      "Depression",
      "PTSD",
      "PanicAttacks",
      "ObsessiveCompulsiveDisorder",
      "BipolarDisorder",
      "ADDADHD",
      "Alcoholism",
      "DrugAddiction",
    ]);
    const FOCUS = {
      bipolar: {
        nodes: ["BipolarDisorder", "MyocardialInfarction", "CongHF", "HighBloodCholesterol"],
        text: "Bipolar disorder and the heart: in the younger group bipolar disorder is linked to heart attack, heart failure and high cholesterol. In the older group it has no link to any of them.",
      },
      ocd: {
        nodes: ["ObsessiveCompulsiveDisorder", "RheumatoidArthritis", "ADDADHD"],
        text: "OCD with rheumatoid arthritis and ADD/ADHD: present for everyone and in the younger group, absent in the older group.",
      },
      cross: {
        cross: true,
        text: "Every edge between a psychiatric or substance-use condition and anything else. Which non-psychiatric conditions they touch depends on the age group.",
      },
    };
    let mode = "young";
    let focus = null;
    const view = NetView(svgEl, { minR: 4, maxR: 13, aspect: (w) => (w < 560 ? 1.1 : 0.62), trayLabel: "No edges:" });
    const stats = $("tbi3-age-stats");
    const render = (animate) => {
      const net = mode === "old" ? old : mode === "young" ? young : allNet;
      const edges = mode === "diff" ? union : net.useEdges;
      const layoutNet = mode === "diff" ? allNet : net;
      const f = focus ? FOCUS[focus] : null;
      const inFocus = (e) =>
        f ? (f.cross ? PSY.has(e.source) !== PSY.has(e.target) : f.nodes.includes(e.source) && f.nodes.includes(e.target)) : true;
      const nodesIn = new Set();
      if (f) edges.filter(inFocus).forEach((e) => (nodesIn.add(e.source), nodesIn.add(e.target)));
      if (f && !f.cross) f.nodes.forEach((n) => nodesIn.add(n));
      const prevSet =
        mode === "old"
          ? D.cohort.prevalence.olderAtInjury.conditions
          : mode === "young"
            ? D.cohort.prevalence.youngerAtInjury.conditions
            : D.cohort.prevalence.overall.conditions;
      view
        .set({
          key: `age-${mode}`,
          nodes: viewNodes(layoutNet, edges, D.ids),
          edges,
          size: (id) => (prevSet[id].any.p == null ? 0.04 : prevSet[id].any.p / 0.6),
          nodeClass: (id) => (f && !nodesIn.has(id) ? "is-dim" : ""),
          edgeClass: (e) => {
            const side = e.side === "young" ? "is-young" : e.side === "old" ? "is-old" : e.side === "both" ? "is-both" : "";
            return `${side} ${f ? (inFocus(e) ? "is-hot" : "is-faint") : ""}`;
          },
        })
        .draw(animate);
      const sumOf = (n) => G.summary(D.ids, n.useEdges);
      const row = (label, n, s) =>
        `<div class="tbi3-agestat"><div class="tbi3-agestat-k">${label}</div><div><strong>${fmtInt(n.n.comorbidityRespondents)}</strong> people</div><div><strong>${s.m}</strong> edges among <strong>${s.n}</strong></div><div>density <strong>${f2(s.density)}</strong></div><div>assortativity <strong>${(s.assortativity > 0 ? "+" : "") + f2(s.assortativity)}</strong></div></div>`;
      if (mode === "diff") {
        const ny = union.filter((e) => e.side === "young").length;
        const no = union.filter((e) => e.side === "old").length;
        const nb = union.filter((e) => e.side === "both").length;
        stats.innerHTML = `<div class="tbi3-agestat"><div class="tbi3-agestat-k">Overlay</div><div><span class="tbi3-key is-young"></span><strong>${ny}</strong> edges only in the younger group</div><div><span class="tbi3-key is-old"></span><strong>${no}</strong> only in the older group</div><div><span class="tbi3-key is-both"></span><strong>${nb}</strong> in both</div></div>`;
      } else {
        stats.innerHTML = row(
          mode === "old" ? "Older (over 50 at injury)" : mode === "young" ? "Younger (50 or under)" : "Everyone",
          net,
          sumOf(net)
        );
      }
      $("tbi3-age-read").textContent = f
        ? f.text
        : mode === "diff"
          ? "Both age groups drawn on one layout. Edges are coloured by where they appear."
          : `Showing ${NET_NAME[net.id]}. Node size is how many reported the condition at all, in this group.`;
    };
    modeButtons.forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.getAttribute("data-age");
        pressed(modeButtons, b);
        render(true);
      })
    );
    focusButtons.forEach((b) =>
      b.addEventListener("click", () => {
        const k = b.getAttribute("data-age-focus");
        focus = focus === k ? null : k;
        pressed(focusButtons, focus ? b : null);
        render(false);
      })
    );
    render(false);
    onWidth(svgEl, () => render(false));
  });

  /* ------------------------------------------------------------------ */
  /* 14. Beyond the paper: severities and years (exploratory)             */
  /* ------------------------------------------------------------------ */

  lazy("tbi3-beyond", (D, box) => {
    const sev = [
      ["mild", "Mild"],
      ["moderate", "Moderate"],
      ["severe", "Severe"],
    ];
    const years = [1, 2, 5, 10, 15];
    const netFor = (s, y) => (s === "mild" && y === 5 ? D.nets["thesis-mild-y5"] : D.nets[`supp-${s}-y${y}`]);
    const big = NetView($("tbi3-beyond-big"), { minR: 4, maxR: 11, aspect: (w) => (w < 560 ? 1.05 : 0.9) });
    let current = ["mild", 1];
    const cells = [];
    box.innerHTML = "";
    const corner = document.createElement("div");
    corner.className = "tbi3-bx-corner";
    box.appendChild(corner);
    years.forEach((y) => {
      const h = document.createElement("div");
      h.className = "tbi3-bx-head";
      h.textContent = `${y} yr`;
      box.appendChild(h);
    });
    sev.forEach(([s, sName]) => {
      const h = document.createElement("div");
      h.className = "tbi3-bx-row";
      h.textContent = sName;
      box.appendChild(h);
      years.forEach((y) => {
        const net = netFor(s, y);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tbi3-bx-cell";
        b.setAttribute("aria-label", `${sName} TBI, ${y}-year follow-up: ${net.n.comorbidityRespondents} people, ${net.edges.length} edges`);
        const sv = d3.select(b).append("svg").attr("viewBox", "0 0 100 100").attr("aria-hidden", "true");
        net.edges.forEach((e) => {
          const a = net.nodeMap.get(e.source);
          const c = net.nodeMap.get(e.target);
          sv.append("line")
            .attr("class", "tbi3-bx-edge")
            .attr("x1", 6 + a.x * 88)
            .attr("y1", 6 + a.y * 88)
            .attr("x2", 6 + c.x * 88)
            .attr("y2", 6 + c.y * 88);
        });
        net.nodes.forEach((n) => {
          sv.append("circle")
            .attr("class", `tbi3-bx-node ${CAT_CLASS[cat(n.id)]} ${n.isolated ? "is-iso" : ""}`)
            .attr("cx", 6 + n.x * 88)
            .attr("cy", 6 + n.y * 88)
            .attr("r", n.isolated ? 1.8 : 2.6);
        });
        const lab = document.createElement("span");
        lab.className = "tbi3-bx-lab";
        lab.textContent = `${net.edges.length} edges · n ${net.n.comorbidityRespondents}`;
        b.appendChild(lab);
        b.addEventListener("click", () => {
          current = [s, y];
          show(true);
        });
        box.appendChild(b);
        cells.push({ b, s, y });
      });
    });
    const show = (animate) => {
      const [s, y] = current;
      const net = netFor(s, y);
      cells.forEach((c) => c.b.setAttribute("aria-pressed", c.s === s && c.y === y ? "true" : "false"));
      const M = G.measures(
        D.ids.filter((id) => net.nodeMap.has(id)),
        net.edges
      );
      const mx = d3.max(Object.values(M), (m) => m.degree) || 1;
      big
        .set({
          key: net.id,
          nodes: viewNodes(
            net,
            net.edges,
            D.ids.filter((id) => net.nodeMap.has(id))
          ),
          edges: net.edges,
          size: (id) => M[id].degree / mx,
        })
        .draw(animate);
      const top = Object.keys(M)
        .sort((a, b) => M[b].degree - M[a].degree)
        .slice(0, 4);
      $("tbi3-beyond-read").textContent =
        `${sev.find((x) => x[0] === s)[1]} TBI, ${y} year${y > 1 ? "s" : ""} after injury: ${net.n.comorbidityRespondents} people answered the health questions; ${net.edges.length} edges by the thesis rule (${
          net.edgesWithBmcMethod != null ? net.edgesWithBmcMethod : D.nets["bmc-all-y5"].edges.length
        } by the paper's). Most connected: ${top.map((id) => `${LABEL[id]} (${M[id].degree})`).join(", ")}.${s === "mild" && y === 5 ? " This cell is the thesis network itself." : ""}`;
    };
    show(false);
    onWidth($("tbi3-beyond-big"), () => show(false));
  });
})();
