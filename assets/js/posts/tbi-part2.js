// Interactive figures for "Thinking in graphs", part 2 of the TBI series.
// Every graph algorithm used on the page is implemented here (BFS, Brandes betweenness, power iteration,
// clustering, assortativity, Watts–Strogatz) and was checked against networkx on test graphs.
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Graph algorithms                                                    */
  /* ------------------------------------------------------------------ */

  const algo = {};

  // Seeded random numbers so that "random" graphs look the same on every visit.
  algo.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  algo.key = (u, v) => (u < v ? u * 65536 + v : v * 65536 + u);

  // Simple undirected graph from an edge list [[u, v, w?], ...]. `removed` is an optional Set of nodes to ignore.
  algo.build = (n, edges, removed) => {
    const adj = Array.from({ length: n }, () => []);
    const weight = new Map();
    const list = [];
    edges.forEach(([u, v, w]) => {
      if (u === v) return;
      if (removed && (removed.has(u) || removed.has(v))) return;
      const k = algo.key(u, v);
      if (weight.has(k)) return;
      adj[u].push(v);
      adj[v].push(u);
      weight.set(k, w == null ? 1 : w);
      list.push([u, v, w == null ? 1 : w]);
    });
    return { n, adj, weight, edges: list, removed: removed || null };
  };

  algo.alive = (g, u) => !g.removed || !g.removed.has(u);
  algo.degree = (g) => g.adj.map((a) => a.length);
  algo.strength = (g) => {
    const s = new Array(g.n).fill(0);
    g.edges.forEach(([u, v, w]) => {
      s[u] += w;
      s[v] += w;
    });
    return s;
  };

  // Breadth-first search from s: distances (-1 = unreachable), shortest-path counts, predecessors and visit order.
  algo.bfs = (g, s) => {
    const dist = new Array(g.n).fill(-1);
    const sigma = new Array(g.n).fill(0);
    const pred = Array.from({ length: g.n }, () => []);
    const order = [];
    dist[s] = 0;
    sigma[s] = 1;
    const queue = [s];
    for (let head = 0; head < queue.length; head++) {
      const v = queue[head];
      order.push(v);
      for (const w of g.adj[v]) {
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1;
          queue.push(w);
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          pred[w].push(v);
        }
      }
    }
    return { dist, sigma, pred, order };
  };

  // Average shortest path length, diameter and the histogram of distances over all reachable unordered pairs.
  algo.pathStats = (g) => {
    let sum = 0;
    let pairs = 0;
    let max = 0;
    let unreachable = 0;
    const hist = [];
    for (let s = 0; s < g.n; s++) {
      if (!algo.alive(g, s)) continue;
      const { dist } = algo.bfs(g, s);
      for (let t = s + 1; t < g.n; t++) {
        if (!algo.alive(g, t)) continue;
        const d = dist[t];
        if (d < 0) {
          unreachable++;
          continue;
        }
        sum += d;
        pairs++;
        if (d > max) max = d;
        hist[d] = (hist[d] || 0) + 1;
      }
    }
    for (let i = 0; i < hist.length; i++) hist[i] = hist[i] || 0;
    return { avg: pairs ? sum / pairs : 0, diameter: max, hist, pairs, unreachable };
  };

  // Brandes (2001) betweenness. Normalised as networkx does for undirected graphs: divided by (n-1)(n-2)/2.
  algo.betweenness = (g, normalized = true) => {
    const cb = new Array(g.n).fill(0);
    for (let s = 0; s < g.n; s++) {
      if (!algo.alive(g, s)) continue;
      const { sigma, pred, order } = algo.bfs(g, s);
      const delta = new Array(g.n).fill(0);
      for (let i = order.length - 1; i >= 0; i--) {
        const w = order[i];
        for (const v of pred[w]) delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
        if (w !== s) cb[w] += delta[w];
      }
    }
    const alive = g.removed ? g.n - g.removed.size : g.n;
    const scale = normalized ? (alive > 2 ? 1 / ((alive - 1) * (alive - 2)) : 1) : 0.5;
    return cb.map((x) => x * scale);
  };

  // Edge betweenness (unnormalised, unordered pairs), keyed by algo.key.
  algo.edgeBetweenness = (g) => {
    const eb = new Map();
    g.edges.forEach(([u, v]) => eb.set(algo.key(u, v), 0));
    for (let s = 0; s < g.n; s++) {
      if (!algo.alive(g, s)) continue;
      const { sigma, pred, order } = algo.bfs(g, s);
      const delta = new Array(g.n).fill(0);
      for (let i = order.length - 1; i >= 0; i--) {
        const w = order[i];
        for (const v of pred[w]) {
          const c = (sigma[v] / sigma[w]) * (1 + delta[w]);
          const k = algo.key(v, w);
          eb.set(k, eb.get(k) + c);
          delta[v] += c;
        }
      }
    }
    eb.forEach((x, k) => eb.set(k, x / 2));
    return eb;
  };

  // One round of "keep your score and add your neighbours' scores": x' = (A + I) x, rescaled so the largest is 1.
  // Adding I (as networkx does) stops the scores see-sawing on star-like parts of a graph; the limit is unchanged.
  algo.eigenStep = (g, x) => {
    const next = x.slice();
    for (let v = 0; v < g.n; v++) for (const t of g.adj[v]) next[v] += x[t];
    const max = Math.max(...next) || 1;
    return next.map((y) => y / max);
  };

  // Eigenvector centrality as networkx computes it: power iteration on (A + I), unit Euclidean norm.
  algo.eigenvector = (g, maxIter = 1000, tol = 1e-10) => {
    let x = new Array(g.n).fill(1 / g.n);
    for (let it = 0; it < maxIter; it++) {
      const next = x.slice();
      for (let v = 0; v < g.n; v++) for (const t of g.adj[v]) next[v] += x[t];
      const norm = Math.hypot(...next) || 1;
      const y = next.map((q) => q / norm);
      let err = 0;
      for (let i = 0; i < g.n; i++) err += Math.abs(y[i] - x[i]);
      x = y;
      if (err < g.n * tol) break;
    }
    return x;
  };

  // Per-node triangles and local clustering C_u = 2 E_u / (k_u (k_u - 1)); networkx counts C_u = 0 when k_u < 2.
  algo.clustering = (g) => {
    const tri = new Array(g.n).fill(0);
    const cc = new Array(g.n).fill(0);
    for (let u = 0; u < g.n; u++) {
      const nb = g.adj[u];
      let links = 0;
      for (let i = 0; i < nb.length; i++) for (let j = i + 1; j < nb.length; j++) if (g.weight.has(algo.key(nb[i], nb[j]))) links++;
      tri[u] = links;
      cc[u] = nb.length > 1 ? (2 * links) / (nb.length * (nb.length - 1)) : 0;
    }
    return { tri, cc };
  };

  algo.averageClustering = (g) => {
    const { cc } = algo.clustering(g);
    let s = 0;
    let c = 0;
    for (let u = 0; u < g.n; u++) {
      if (!algo.alive(g, u)) continue;
      s += cc[u];
      c++;
    }
    return c ? s / c : 0;
  };

  // Newman's (2002) degree assortativity: the Pearson correlation between the degrees at either end of an edge.
  algo.assortativity = (g) => {
    const k = algo.degree(g);
    const m = g.edges.length;
    if (!m) return 0;
    let sp = 0;
    let s1 = 0;
    let s2 = 0;
    g.edges.forEach(([u, v]) => {
      sp += k[u] * k[v];
      s1 += (k[u] + k[v]) / 2;
      s2 += (k[u] * k[u] + k[v] * k[v]) / 2;
    });
    const mean = s1 / m;
    const den = s2 / m - mean * mean;
    return den > 1e-12 ? (sp / m - mean * mean) / den : 0;
  };

  // Connected components among live nodes; returns component id per node (-1 for removed) and their count.
  algo.components = (g) => {
    const comp = new Array(g.n).fill(-1);
    let count = 0;
    for (let s = 0; s < g.n; s++) {
      if (comp[s] >= 0 || !algo.alive(g, s)) continue;
      const stack = [s];
      comp[s] = count;
      while (stack.length) {
        const v = stack.pop();
        for (const w of g.adj[v]) {
          if (comp[w] < 0) {
            comp[w] = count;
            stack.push(w);
          }
        }
      }
      count++;
    }
    return { comp, count };
  };

  // Watts–Strogatz (1998): ring of n nodes, each joined to its k nearest neighbours; each edge's far end is
  // rewired with probability p, avoiding self-loops and duplicate edges (the same procedure as networkx).
  algo.wattsStrogatz = (n, k, p, rand) => {
    const has = new Set();
    const edges = [];
    for (let j = 1; j <= k / 2; j++) {
      for (let i = 0; i < n; i++) {
        const v = (i + j) % n;
        edges.push([i, v, 1, false]);
        has.add(algo.key(i, v));
      }
    }
    edges.forEach((e) => {
      if (rand() >= p) return;
      const u = e[0];
      let w = Math.floor(rand() * n);
      let guard = 0;
      while ((w === u || has.has(algo.key(u, w))) && guard++ < 50) w = Math.floor(rand() * n);
      if (guard >= 50) return;
      has.delete(algo.key(u, e[1]));
      has.add(algo.key(u, w));
      e[1] = w;
      e[3] = true;
    });
    return edges;
  };

  // Barabási–Albert style preferential attachment, used to give the assortativity figure some hubs.
  algo.preferential = (n, m, rand) => {
    const edges = [];
    const has = new Set();
    const targets = [];
    for (let i = 0; i < m + 1; i++)
      for (let j = i + 1; j < m + 1; j++) {
        edges.push([i, j]);
        has.add(algo.key(i, j));
        targets.push(i, j);
      }
    for (let v = m + 1; v < n; v++) {
      const chosen = new Set();
      while (chosen.size < m) chosen.add(targets[Math.floor(rand() * targets.length)]);
      chosen.forEach((t) => {
        edges.push([v, t]);
        has.add(algo.key(v, t));
        targets.push(v, t);
      });
    }
    return edges;
  };

  // Hierholzer (1873): an Euler trail over a multigraph given as [[u, v], ...]; returns edge indices or null.
  algo.eulerTrail = (n, edges) => {
    const deg = new Array(n).fill(0);
    const inc = Array.from({ length: n }, () => []);
    edges.forEach(([u, v], i) => {
      deg[u]++;
      deg[v]++;
      inc[u].push(i);
      inc[v].push(i);
    });
    const odd = deg.map((d, i) => (d % 2 ? i : -1)).filter((i) => i >= 0);
    if (!edges.length || (odd.length !== 0 && odd.length !== 2)) return null;
    const start = odd.length ? odd[0] : edges[0][0];
    const used = new Array(edges.length).fill(false);
    const ptr = new Array(n).fill(0);
    const stack = [[start, -1]];
    const trail = [];
    while (stack.length) {
      const [v] = stack[stack.length - 1];
      while (ptr[v] < inc[v].length && used[inc[v][ptr[v]]]) ptr[v]++;
      if (ptr[v] === inc[v].length) {
        const [, e] = stack.pop();
        if (e >= 0) trail.push(e);
      } else {
        const e = inc[v][ptr[v]];
        used[e] = true;
        const w = edges[e][0] === v ? edges[e][1] : edges[e][0];
        stack.push([w, e]);
      }
    }
    if (trail.length !== edges.length) return null;
    trail.reverse();
    return { start, trail };
  };

  if (typeof window === "undefined" || !window.TBI || !window.d3) {
    if (typeof module !== "undefined") module.exports = algo;
    return;
  }

  /* ------------------------------------------------------------------ */
  /* Shared figure helpers                                               */
  /* ------------------------------------------------------------------ */

  const { reduceMotion, cssVar, onVisible, watchVisibility, onThemeChange, showTooltip, hideTooltip } = window.TBI;
  const d3 = window.d3;
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmt = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "–");
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = d3.easeCubicInOut;

  const palette = () => ({
    accent: cssVar("--global-theme-color") || "#50708f",
    ink: cssVar("--global-text-color") || "#1a1a1a",
    ink2: cssVar("--global-text-color-light") || "#666",
    bg: cssVar("--global-bg-color") || "#fafaf8",
    rule: cssVar("--tbi-rule") || "rgba(0,0,0,.12)",
    hot: cssVar("--tbi-metab") || "#d08c2c",
    alarm: cssVar("--tbi-injury") || "#d9483b",
    water: cssVar("--tbi2-water") || "#cfe0ee",
    land: cssVar("--tbi2-land") || "#efece4",
    groups: ["--tbi-resp", "--tbi-metab", "--tbi-psych", "--tbi-musc", "--tbi-cardio", "--tbi-subst"].map((v) => cssVar(v)),
  });
  let P = palette();
  const repaints = [];
  onThemeChange(() => {
    P = palette();
    repaints.forEach((f) => f());
  });

  // A responsive SVG stage drawn in CSS pixels, so text and node sizes stay legible at every width.
  // `place(x, y)` maps normalised [0, 1] coordinates into the padded box.
  const stage = (svg, { ratio = 0.62, minH = 260, maxH = 460, mobileRatio = 0.95, pad = 28 } = {}) => {
    const s = { svg, w: 0, h: 0, pad, listeners: [] };
    s.place = (x, y) => [pad + x * (s.w - 2 * pad), pad + y * (s.h - 2 * pad)];
    s.unplace = (px, py) => [(px - pad) / (s.w - 2 * pad), (py - pad) / (s.h - 2 * pad)];
    s.measure = () => {
      const w = Math.max(280, svg.parentNode.clientWidth || svg.clientWidth || 600);
      const r = w < 560 ? mobileRatio : ratio;
      const h = clamp(Math.round(w * r), minH, maxH);
      if (w === s.w && h === s.h) return false;
      s.w = w;
      s.h = h;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      svg.style.width = "100%";
      svg.style.height = "auto";
      return true;
    };
    s.onResize = (f) => s.listeners.push(f);
    s.measure();
    let t = null;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (s.measure()) s.listeners.forEach((f) => f());
      }, 120);
    });
    return s;
  };

  // Converts a pointer event to SVG user coordinates.
  const svgPoint = (svg, event) => {
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  };

  // Makes node groups draggable with a pointer and movable with arrow keys; `onMove(d, x, y)` gets normalised coords.
  // A press without movement counts as a click and calls `onClick(d)`; Enter or Space do the same.
  const interactive = (sel, st, { onMove, onClick, label }) => {
    sel
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", label)
      .on("pointerdown", function (event, d) {
        if (event.button !== 0) return;
        const svg = st.svg;
        const start = svgPoint(svg, event);
        let moved = false;
        this.setPointerCapture?.(event.pointerId);
        const move = (e) => {
          const p = svgPoint(svg, e);
          if (!moved && Math.hypot(p.x - start.x, p.y - start.y) < 4) return;
          moved = true;
          if (onMove) {
            const [x, y] = st.unplace(p.x, p.y);
            onMove(d, clamp(x, -0.02, 1.02), clamp(y, -0.04, 1.04));
          }
        };
        const up = () => {
          this.removeEventListener("pointermove", move);
          this.removeEventListener("pointerup", up);
          this.removeEventListener("pointercancel", up);
          if (!moved && onClick) onClick(d);
        };
        this.addEventListener("pointermove", move);
        this.addEventListener("pointerup", up);
        this.addEventListener("pointercancel", up);
        event.preventDefault();
      })
      .on("keydown", (event, d) => {
        const step = event.shiftKey ? 0.08 : 0.025;
        const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        if (moves[event.key] && onMove) {
          onMove(d, clamp(d.x + moves[event.key][0], 0, 1), clamp(d.y + moves[event.key][1], 0, 1));
          event.preventDefault();
        } else if ((event.key === "Enter" || event.key === " ") && onClick) {
          onClick(d);
          event.preventDefault();
        }
      });
  };

  // Runs `frame(t)` from 0 to 1 over `ms`, or jumps to the end under reduced motion. Returns a cancel function.
  const animate = (ms, frame, done) => {
    if (reduceMotion || ms <= 0) {
      frame(1);
      done?.();
      return () => {};
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      frame(t);
      if (t < 1) raf = requestAnimationFrame(tick);
      else done?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  };

  const setText = (node, html) => {
    if (node && node.innerHTML !== html) node.innerHTML = html;
  };

  // Pressed-state helper for a group of toggle buttons.
  const pressGroup = (buttons, active) => buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === active)));

  // Small horizontal bar ranking used by several figures.
  const drawBars = (host, rows, { max, digits = 2, highlight } = {}) => {
    const top = max ?? Math.max(...rows.map((r) => r.value), 1e-9);
    const sel = d3
      .select(host)
      .selectAll("div.tbi2-bar")
      .data(rows, (r) => r.label);
    const enter = sel.enter().append("div").attr("class", "tbi2-bar");
    enter.append("span").attr("class", "tbi2-bar-label");
    const track = enter.append("span").attr("class", "tbi2-bar-track");
    track.append("span").attr("class", "tbi2-bar-fill");
    enter.append("span").attr("class", "tbi2-bar-val");
    sel.exit().remove();
    const all = enter.merge(sel).order();
    all.classed("is-key", (r) => r.label === highlight || r.key);
    all.select(".tbi2-bar-label").text((r) => r.label);
    all.select(".tbi2-bar-fill").style("width", (r) => `${Math.max(0, (r.value / top) * 100)}%`);
    all.select(".tbi2-bar-val").text((r) => (r.text != null ? r.text : fmt(r.value, digits)));
  };

  /* ------------------------------------------------------------------ */
  /* Figure: a tangle that untangles itself                              */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-tangle");
    if (!svg) return;
    const btn = $("#tbi2-tangle-btn");
    const read = $("#tbi2-tangle-read");
    const st = stage(svg, { ratio: 0.5, minH: 280, maxH: 400, mobileRatio: 1 });
    const rand = algo.rng(11);
    const groups = 4;
    const per = 9;
    const n = groups * per;
    const edges = [];
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const same = Math.floor(i / per) === Math.floor(j / per);
        if (rand() < (same ? 0.42 : 0.018)) edges.push([i, j]);
      }
    const nodes = d3.range(n).map((i) => ({ i, g: Math.floor(i / per), x: 0, y: 0, tx: 0, ty: 0 }));
    const scatter = () =>
      nodes.forEach((d) => {
        d.x = 30 + rand() * (st.w - 60);
        d.y = 30 + rand() * (st.h - 60);
      });
    scatter();
    const links = edges.map(([s, t]) => ({ source: nodes[s], target: nodes[t] }));
    const gl = d3.select(svg).append("g");
    const gn = d3.select(svg).append("g");
    const lineSel = gl.selectAll("line").data(links).join("line").attr("stroke-width", 1);
    const dotSel = gn.selectAll("circle").data(nodes).join("circle").attr("r", 5.5);
    let colour = 0;
    const paint = () => {
      lineSel
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)
        .attr("stroke", P.ink2)
        .attr("stroke-opacity", 0.28);
      dotSel
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("fill", (d) => d3.interpolateRgb(P.ink2, P.groups[d.g])(colour))
        .attr("stroke", P.bg)
        .attr("stroke-width", 1.5);
    };
    repaints.push(paint);
    let sim = null;
    let tangled = true;
    const untangle = () => {
      tangled = false;
      btn.textContent = "Tangle it again";
      setText(read, "Same nodes, same edges. Only the positions have changed.");
      sim?.stop();
      sim = d3
        .forceSimulation(nodes)
        .force("link", d3.forceLink(links).distance(26).strength(0.5))
        .force("charge", d3.forceManyBody().strength(-70))
        .force("x", d3.forceX(st.w / 2).strength(0.06))
        .force("y", d3.forceY(st.h / 2).strength(0.09))
        .force("collide", d3.forceCollide(8))
        .alphaDecay(0.035)
        .on("tick", () => {
          nodes.forEach((d) => {
            d.x = clamp(d.x, 10, st.w - 10);
            d.y = clamp(d.y, 10, st.h - 10);
          });
          colour = Math.min(1, colour + 0.012);
          paint();
        })
        .on("end", () => {
          colour = 1;
          paint();
        });
      if (reduceMotion) {
        sim.stop();
        for (let i = 0; i < 300; i++) sim.tick();
        colour = 1;
        paint();
      }
    };
    const retangle = () => {
      tangled = true;
      sim?.stop();
      btn.textContent = "Untangle";
      setText(read, "");
      const from = nodes.map((d) => [d.x, d.y]);
      scatter();
      const to = nodes.map((d) => [d.x, d.y]);
      const c0 = colour;
      animate(900, (t) => {
        const e = ease(t);
        nodes.forEach((d, i) => {
          d.x = lerp(from[i][0], to[i][0], e);
          d.y = lerp(from[i][1], to[i][1], e);
        });
        colour = lerp(c0, 0, e);
        paint();
      });
    };
    btn?.addEventListener("click", () => (tangled ? untangle() : retangle()));
    st.onResize(() => {
      if (tangled) scatter();
      else untangle();
      paint();
    });
    paint();
    onVisible(svg, () => setTimeout(() => tangled && untangle(), reduceMotion ? 0 : 700), 0.5);
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: the seven bridges of Königsberg                             */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-kb");
    if (!svg) return;
    const read = $("#tbi2-kb-read");
    const btnReset = $("#tbi2-kb-reset");
    const btnAbstract = $("#tbi2-kb-abstract");
    const btnSolve = $("#tbi2-kb-solve");
    const btnToday = $("#tbi2-kb-today");
    const W = 640;
    const H = 400;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const scaleText = () => svg.style.setProperty("--k", String(W / Math.max(280, svg.clientWidth || W)));
    scaleText();
    window.addEventListener("resize", scaleText);

    const lands = [
      { id: 0, name: "Kneiphof", long: "the island of Kneiphof", x: 228, y: 200 },
      { id: 1, name: "North bank", long: "the north bank", x: 250, y: 42 },
      { id: 2, name: "South bank", long: "the south bank", x: 250, y: 358 },
      { id: 3, name: "Lomse", long: "the eastern island, Lomse", x: 540, y: 200 },
    ];
    const bridges = [
      { name: "a", u: 0, v: 1, x: 185, y: 135, a: 90 },
      { name: "b", u: 0, v: 1, x: 272, y: 135, a: 90 },
      { name: "c", u: 0, v: 2, x: 185, y: 265, a: 90 },
      { name: "d", u: 0, v: 2, x: 272, y: 265, a: 90 },
      { name: "e", u: 0, v: 3, x: 333, y: 200, a: 0 },
      { name: "f", u: 1, v: 3, x: 445, y: 108, a: 84 },
      { name: "g", u: 2, v: 3, x: 445, y: 292, a: 96 },
    ];
    const original = () => bridges.map((b, i) => ({ u: b.u, v: b.v, bridge: i, uid: i }));
    let uid = 100;
    let edges = original();
    let mode = "map";
    let pos = null;
    let used = [];
    let selected = null;
    let walking = false;
    let morph = 0; // 0 = map, 1 = graph

    const root = d3.select(svg);
    const gMap = root.append("g").attr("class", "tbi2-kb-map").attr("aria-hidden", "true");
    gMap.append("rect").attr("class", "tbi2-land").attr("width", W).attr("height", H).attr("rx", 10);
    gMap.append("path").attr("class", "tbi2-water-s").attr("d", "M -20 200 L 160 200");
    gMap.append("ellipse").attr("class", "tbi2-water-f").attr("cx", 230).attr("cy", 200).attr("rx", 125).attr("ry", 100);
    gMap.append("path").attr("class", "tbi2-water-s").attr("d", "M 320 150 C 400 110, 500 92, 680 88");
    gMap.append("path").attr("class", "tbi2-water-s").attr("d", "M 320 250 C 400 290, 500 308, 680 312");
    gMap.append("ellipse").attr("class", "tbi2-land").attr("cx", 228).attr("cy", 200).attr("rx", 82).attr("ry", 42);
    gMap.append("text").attr("class", "tbi2-kb-river").attr("x", 40).attr("y", 236).text("Pregel");
    const gEdges = root.append("g");
    const gBridges = root.append("g");
    const gNodes = root.append("g");
    const walker = root.append("circle").attr("class", "tbi2-kb-walker").attr("r", 9).style("opacity", 0);

    // Quadratic curve control point for an edge: through the bridge on the map, a fanned curve in the graph.
    const control = (e, t) => {
      const p0 = lands[e.u];
      const p1 = lands[e.v];
      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;
      const siblings = edges.filter((f) => (f.u === e.u && f.v === e.v) || (f.u === e.v && f.v === e.u));
      const idx = siblings.indexOf(e);
      const off = (idx - (siblings.length - 1) / 2) * 46;
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy) || 1;
      const sgn = e.u < e.v ? 1 : -1;
      const gx = mx + (-dy / len) * off * sgn;
      const gy = my + (dx / len) * off * sgn;
      if (e.bridge == null) return [gx, gy];
      const b = bridges[e.bridge];
      const cx = 2 * b.x - mx;
      const cy = 2 * b.y - my;
      return [lerp(cx, gx, t), lerp(cy, gy, t)];
    };
    const pathD = (e, t) => {
      const [cx, cy] = control(e, t);
      const p0 = lands[e.u];
      const p1 = lands[e.v];
      return `M ${p0.x} ${p0.y} Q ${cx} ${cy} ${p1.x} ${p1.y}`;
    };
    const degrees = () => {
      const d = [0, 0, 0, 0];
      edges.forEach((e) => {
        d[e.u]++;
        d[e.v]++;
      });
      return d;
    };

    const render = () => {
      const t = morph;
      gMap.style("opacity", 1 - t);
      const deg = degrees();
      // Bridges (map only)
      gBridges
        .selectAll("g.tbi2-kb-bridge")
        .data(bridges)
        .join((enter) => {
          const g = enter.append("g").attr("class", "tbi2-kb-bridge tbi-focusable");
          g.append("rect").attr("x", -34).attr("y", -9).attr("width", 68).attr("height", 18).attr("rx", 4);
          g.append("text").attr("text-anchor", "middle").attr("dy", "0.35em");
          g.attr("tabindex", 0)
            .attr("role", "button")
            .on("click", (ev, b) => crossBridge(bridges.indexOf(b)))
            .on("keydown", (ev, b) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                crossBridge(bridges.indexOf(b));
              }
            });
          return g;
        })
        .attr("transform", (b) => `translate(${b.x},${b.y}) rotate(${b.a})`)
        .attr("aria-label", (b, i) => `Bridge ${b.name}, between ${lands[b.u].long} and ${lands[b.v].long}${used.includes(i) ? ", already crossed" : ""}`)
        .classed("is-used", (b, i) => used.includes(i))
        .style("opacity", 1 - t)
        .style("pointer-events", mode === "map" ? null : "none")
        .attr("tabindex", mode === "map" ? 0 : -1)
        .attr("aria-hidden", mode === "map" ? null : "true")
        .select("text")
        .attr("transform", (b) => `rotate(${-b.a})`)
        .text((b, i) => (used.includes(i) ? String(used.indexOf(i) + 1) : b.name));

      // Edges
      gEdges
        .selectAll("g.tbi2-kb-edge")
        .data(edges, (e) => e.uid)
        .join((enter) => {
          const g = enter.append("g").attr("class", "tbi2-kb-edge");
          g.append("path").attr("class", "tbi2-kb-hit");
          g.append("path").attr("class", "tbi2-kb-line");
          g.append("text").attr("class", "tbi2-kb-num").attr("text-anchor", "middle").attr("dy", "0.35em");
          g.on("click", (ev, e) => removeEdge(e)).on("keydown", (ev, e) => {
            if (ev.key === "Enter" || ev.key === " " || ev.key === "Delete" || ev.key === "Backspace") {
              ev.preventDefault();
              removeEdge(e);
            }
          });
          return g;
        })
        .attr("tabindex", mode === "graph" ? 0 : -1)
        .attr("role", "button")
        .attr("aria-hidden", mode === "graph" ? null : "true")
        .attr("aria-label", (e) => `Bridge between ${lands[e.u].long} and ${lands[e.v].long}. Press Enter to remove it.`)
        .style("pointer-events", mode === "graph" && !walking ? null : "none")
        .classed("is-walked", (e) => e.walked != null)
        .call((g) => g.selectAll("path").attr("d", (e) => pathD(e, t)))
        .call((g) => g.select(".tbi2-kb-line").style("opacity", 0.25 + 0.75 * t))
        .call((g) =>
          g
            .select(".tbi2-kb-num")
            .attr("x", (e) => {
              const [cx] = control(e, t);
              return 0.25 * lands[e.u].x + 0.5 * cx + 0.25 * lands[e.v].x;
            })
            .attr("y", (e) => {
              const [, cy] = control(e, t);
              return 0.25 * lands[e.u].y + 0.5 * cy + 0.25 * lands[e.v].y;
            })
            .text((e) => (e.walked != null ? e.walked + 1 : ""))
        );

      // Land masses: labelled pins on the map, nodes in the graph
      gNodes
        .selectAll("g.tbi2-kb-node")
        .data(lands)
        .join((enter) => {
          const g = enter.append("g").attr("class", "tbi2-kb-node tbi-focusable");
          g.append("circle").attr("class", "tbi2-kb-glow").attr("r", 30);
          g.append("circle").attr("class", "tbi2-kb-dot").attr("r", 22);
          g.append("text").attr("class", "tbi2-kb-deg").attr("text-anchor", "middle").attr("dy", "0.36em");
          g.append("rect").attr("class", "tbi2-kb-pill").attr("rx", 13);
          g.append("text").attr("class", "tbi2-kb-name").attr("text-anchor", "middle").attr("dy", "0.35em");
          g.attr("tabindex", 0)
            .attr("role", "button")
            .on("click", (ev, d) => clickLand(d.id))
            .on("keydown", (ev, d) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                clickLand(d.id);
              }
            });
          return g;
        })
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .attr("aria-label", (d) =>
          mode === "map"
            ? `${d.name}. ${pos == null ? "Press Enter to start your walk here." : ""}`
            : `${d.name}, touched by ${deg[d.id]} bridges. Select two land masses to build a bridge between them.`
        )
        .classed("is-odd", (d) => t > 0.5 && deg[d.id] % 2 === 1)
        .classed("is-here", (d) => mode === "map" && pos === d.id)
        .classed("is-selected", (d) => selected === d.id)
        .call((g) => g.select(".tbi2-kb-dot").attr("r", 22 * t + 0.01))
        .call((g) => g.select(".tbi2-kb-glow").style("opacity", (d) => (t > 0.5 && deg[d.id] % 2 ? 1 : 0)))
        .call((g) =>
          g
            .select(".tbi2-kb-deg")
            .style("opacity", t)
            .text((d) => deg[d.id])
        )
        .call((g) =>
          g
            .select(".tbi2-kb-name")
            .attr("y", (d) => (t > 0.5 ? (d.id === 2 ? -38 : 38) * 0 + (d.y > 300 ? -36 : 36) * t : 0))
            .text((d) => d.name)
        )
        .call((g) =>
          g.select(".tbi2-kb-pill").each(function (d) {
            const txt = this.parentNode.querySelector(".tbi2-kb-name");
            let bw = 80;
            try {
              bw = txt.getBBox().width + 22;
            } catch (e) {
              /* not rendered yet */
            }
            d3.select(this)
              .attr("x", -bw / 2)
              .attr("y", -13 + (t > 0.5 ? (d.y > 300 ? -36 : 36) * t : 0))
              .attr("width", bw)
              .attr("height", 26)
              .style("opacity", 1 - t);
          })
        );
    };

    const say = (html) => setText(read, html);
    const landName = (i) => lands[i].long;

    const moveWalker = (e, from, done) => {
      const path = gEdges
        .selectAll("g.tbi2-kb-edge")
        .filter((f) => f === e)
        .select(".tbi2-kb-line")
        .node();
      if (!path) return done();
      const L = path.getTotalLength();
      const forward = e.u === from;
      walker.style("opacity", 1);
      walking = true;
      animate(
        650,
        (t) => {
          const p = path.getPointAtLength((forward ? ease(t) : 1 - ease(t)) * L);
          walker.attr("cx", p.x).attr("cy", p.y);
        },
        () => {
          walking = false;
          done();
        }
      );
    };

    const clickLand = (id) => {
      if (walking) return;
      if (mode === "graph") {
        if (selected == null) {
          selected = id;
          say(`Building a bridge from <strong>${lands[id].name}</strong>. Choose where it should land.`);
        } else if (selected === id) {
          selected = null;
          say("Cancelled.");
        } else {
          const count = edges.filter((e) => (e.u === selected && e.v === id) || (e.u === id && e.v === selected)).length;
          if (count >= 3) say("That pair already has three bridges; try another.");
          else edges.push({ u: selected, v: id, bridge: null, uid: uid++ });
          selected = null;
          clearWalk();
          report();
        }
        render();
        return;
      }
      if (pos == null) {
        pos = id;
        walker
          .attr("cx", lands[id].x)
          .attr("cy", lands[id].y + (lands[id].y > 300 ? -24 : 24))
          .style("opacity", 1);
        say(`You start on ${landName(id)}. Now click a bridge that touches it.`);
        render();
      } else if (used.length === 0) {
        pos = id;
        walker.attr("cx", lands[id].x).attr("cy", lands[id].y + (lands[id].y > 300 ? -24 : 24));
        say(`You start on ${landName(id)} instead. Click a bridge that touches it.`);
        render();
      }
    };

    const crossBridge = (i) => {
      if (mode !== "map" || walking) return;
      const b = bridges[i];
      if (pos == null) return say("First choose where to start: click one of the four land masses.");
      if (used.includes(i)) return say(`You have already crossed bridge ${b.name}, and the rule is once only.`);
      if (b.u !== pos && b.v !== pos) return say(`Bridge ${b.name} doesn’t touch ${landName(pos)}, where you are standing.`);
      const e = edges.find((f) => f.bridge === i);
      const from = pos;
      used.push(i);
      render();
      moveWalker(e, from, () => {
        pos = b.u === from ? b.v : b.u;
        const left = bridges.map((_, j) => j).filter((j) => !used.includes(j));
        const exits = left.filter((j) => bridges[j].u === pos || bridges[j].v === pos);
        if (!left.length) say("All seven crossed. (If you are reading this, please tell me how.)");
        else if (!exits.length)
          say(
            `Stuck on ${landName(pos)} after ${used.length} of 7 bridges, with ${left.map((j) => bridges[j].name).join(", ")} still uncrossed. <button class="tbi-btn" type="button" data-kb="again">Try again</button>`
          );
        else say(`${used.length} of 7 crossed. You are on ${landName(pos)}.`);
        render();
      });
    };

    const clearWalk = () => edges.forEach((e) => (e.walked = null));

    const removeEdge = (e) => {
      if (mode !== "graph" || walking) return;
      edges = edges.filter((f) => f !== e);
      clearWalk();
      report();
      render();
    };

    const report = () => {
      const deg = degrees();
      const odd = deg.map((d, i) => (d % 2 ? i : -1)).filter((i) => i >= 0);
      const g = algo.build(
        4,
        edges.map((e) => [e.u, e.v])
      );
      const touched = deg.map((d, i) => (d > 0 ? i : -1)).filter((i) => i >= 0);
      const comp = algo.components(g).comp;
      const connected = touched.every((i) => comp[i] === comp[touched[0]]);
      const names = odd.map((i) => lands[i].name).join(", ");
      let msg;
      if (!edges.length) msg = "No bridges at all. Click two land masses to build one.";
      else if (!connected) msg = "The bridges now fall into separate pieces, so no single walk can reach them all.";
      else if (odd.length === 0) msg = "Every land mass touches an even number of bridges, so a walk exists, and it can finish where it started.";
      else if (odd.length === 2) msg = `Exactly two land masses are odd (${names}), so a walk exists: it must start on one of them and finish on the other.`;
      else msg = `${odd.length} land masses touch an odd number of bridges (${names}). A walk can have at most two, its start and its end, so no walk crosses every bridge once.`;
      say(msg);
      if (btnSolve) btnSolve.disabled = !(connected && edges.length && (odd.length === 0 || odd.length === 2));
    };

    const setMode = (m) => {
      if (walking) return;
      const target = m === "graph" ? 1 : 0;
      mode = m;
      selected = null;
      if (m === "map") {
        edges = original();
        clearWalk();
      }
      walker.style("opacity", 0);
      pos = null;
      used = [];
      btnAbstract.textContent = m === "graph" ? "Back to the map" : "Throw away the map";
      btnAbstract.setAttribute("aria-pressed", String(m === "graph"));
      [btnSolve, btnToday].forEach((b) => b && (b.hidden = m !== "graph"));
      btnReset.textContent = m === "graph" ? "Euler’s seven bridges" : "Start again";
      const from = morph;
      animate(
        1100,
        (t) => {
          morph = lerp(from, target, ease(t));
          render();
        },
        () => {
          morph = target;
          render();
          if (m === "graph") report();
          else say("Choose where to start: click one of the four land masses.");
        }
      );
    };

    btnAbstract?.addEventListener("click", () => setMode(mode === "map" ? "graph" : "map"));
    btnReset?.addEventListener("click", () => {
      if (walking) return;
      if (mode === "graph") {
        edges = original();
        clearWalk();
        selected = null;
        report();
      } else {
        pos = null;
        used = [];
        walker.style("opacity", 0);
        say("Choose where to start: click one of the four land masses.");
      }
      render();
    });
    btnToday?.addEventListener("click", () => {
      if (walking) return;
      edges = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 3],
        [2, 3],
      ].map(([u, v]) => ({ u, v, bridge: null, uid: uid++ }));
      selected = null;
      clearWalk();
      report();
      render();
    });
    btnSolve?.addEventListener("click", () => {
      if (walking) return;
      const res = algo.eulerTrail(
        4,
        edges.map((e) => [e.u, e.v])
      );
      if (!res) return;
      clearWalk();
      render();
      let at = res.start;
      let k = 0;
      walker
        .attr("cx", lands[at].x)
        .attr("cy", lands[at].y)
        .style("opacity", 1);
      const next = () => {
        if (k >= res.trail.length) {
          say(`One walk that crosses every bridge exactly once, starting at ${lands[res.start].name} and finishing at ${lands[at].name}.`);
          walker.style("opacity", 0);
          render();
          return;
        }
        const e = edges[res.trail[k]];
        e.walked = k;
        render();
        const from = at;
        at = e.u === at ? e.v : e.u;
        k++;
        if (reduceMotion) next();
        else moveWalker(e, from, next);
      };
      next();
    });
    read?.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-kb='again']")) btnReset.click();
    });
    if (btnSolve) btnSolve.hidden = true;
    if (btnToday) btnToday.hidden = true;
    render();
    say("Choose where to start: click one of the four land masses.");
    repaints.push(render);
  })();

  // Draws simple node-link graphs into a stage; shared by several figures.
  // nodes: [{x, y (normalised), label}], links: [{u, v, w}]. Returns selections for further styling.
  const nodeLink = (st, layers, nodes, links, { r = () => 14, edgeWidth = () => 1.6, labelPos = "below" } = {}) => {
    const edgeSel = layers.edges
      .selectAll("line.tbi2-edge")
      .data(links, (l) => `${l.u}-${l.v}`)
      .join("line")
      .attr("class", "tbi2-edge")
      .each(function (l) {
        const [x1, y1] = st.place(nodes[l.u].x, nodes[l.u].y);
        const [x2, y2] = st.place(nodes[l.v].x, nodes[l.v].y);
        this.setAttribute("x1", x1);
        this.setAttribute("y1", y1);
        this.setAttribute("x2", x2);
        this.setAttribute("y2", y2);
      })
      .attr("stroke-width", edgeWidth);
    const nodeSel = layers.nodes
      .selectAll("g.tbi2-node")
      .data(nodes)
      .join("g")
      .attr("class", (d, i, els) => els[i].getAttribute("class") || "tbi2-node tbi-focusable")
      .each(function () {
        if (this.querySelector(".tbi2-node-dot")) return;
        const g = d3.select(this);
        g.append("circle").attr("class", "tbi2-node-halo");
        g.append("circle").attr("class", "tbi2-node-dot");
        g.append("text").attr("class", "tbi2-node-label").attr("text-anchor", "middle");
      })
      .attr("transform", (d) => {
        const [x, y] = st.place(d.x, d.y);
        return `translate(${x},${y})`;
      });
    nodeSel.select(".tbi2-node-dot").attr("r", r);
    nodeSel.select(".tbi2-node-halo").attr("r", (d, i) => r(d, i) + 6);
    nodeSel
      .select(".tbi2-node-label")
      .attr("dy", (d, i) => (labelPos === "inside" ? "0.35em" : r(d, i) + 13))
      .text((d) => d.label);
    return { edgeSel, nodeSel };
  };

  const layersFor = (svg) => {
    const root = d3.select(svg);
    return { root, back: root.append("g"), edges: root.append("g"), mid: root.append("g"), nodes: root.append("g"), top: root.append("g") };
  };

  /* ------------------------------------------------------------------ */
  /* Figure: adjacency matrix and drawing, two views of one object       */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-mx-graph");
    const table = $("#tbi2-mx");
    if (!svg || !table) return;
    const read = $("#tbi2-mx-read");
    const modeBtns = [...document.querySelectorAll("[data-mx]")];
    const st = stage(svg, { ratio: 0.85, minH: 260, maxH: 340, mobileRatio: 0.8, pad: 34 });
    const names = ["Asha", "Ben", "Chen", "Dara", "Eli", "Farah"];
    const n = names.length;
    const layouts = [
      [
        [0.12, 0.2],
        [0.12, 0.8],
        [0.4, 0.5],
        [0.62, 0.5],
        [0.9, 0.2],
        [0.9, 0.8],
      ],
      d3.range(n).map((i) => [0.5 + 0.42 * Math.cos((i / n) * 2 * Math.PI - Math.PI / 2), 0.5 + 0.45 * Math.sin((i / n) * 2 * Math.PI - Math.PI / 2)]),
      [
        [0.85, 0.85],
        [0.5, 0.1],
        [0.15, 0.6],
        [0.88, 0.3],
        [0.3, 0.12],
        [0.45, 0.9],
      ],
      [
        [0.05, 0.5],
        [0.25, 0.15],
        [0.45, 0.85],
        [0.6, 0.15],
        [0.78, 0.85],
        [0.95, 0.5],
      ],
    ];
    let layoutIdx = 0;
    const nodes = names.map((label, i) => ({ i, label, x: layouts[0][i][0], y: layouts[0][i][1] }));
    const defaultW = {};
    [
      [0, 1, 0.9],
      [0, 2, 0.5],
      [1, 2, 0.2],
      [2, 3, 0.5],
      [3, 4, 0.9],
      [3, 5, 0.2],
      [4, 5, 0.5],
    ].forEach(([u, v, w]) => (defaultW[`${u}-${v}`] = w));
    const M = d3.range(n).map(() => new Array(n).fill(0));
    Object.entries(defaultW).forEach(([k]) => {
      const [u, v] = k.split("-").map(Number);
      M[u][v] = M[v][u] = 1;
    });
    let mode = "plain";
    let hot = null; // {u, v} or {node}
    const weightCycle = [0, 0.2, 0.5, 0.9];
    const L = layersFor(svg);
    const fmtW = (x) => (mode === "weighted" ? x.toFixed(1).replace(/^0/, "") : String(x));

    // Build the table once
    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    hr.innerHTML = `<th scope="col"><span class="tbi2-sr">Row to column</span></th>${names.map((nm) => `<th scope="col">${nm[0]}</th>`).join("")}<th scope="col" class="tbi2-mx-sum" id="tbi2-mx-sumhead">Sum</th>`;
    thead.appendChild(hr);
    const tbody = document.createElement("tbody");
    const cells = [];
    names.forEach((nm, i) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = nm[0];
      th.title = nm;
      tr.appendChild(th);
      cells[i] = [];
      for (let j = 0; j < n; j++) {
        const td = document.createElement("td");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tbi2-mx-cell";
        if (i === j) b.disabled = true;
        b.addEventListener("click", () => toggle(i, j));
        b.addEventListener("pointerenter", () => setHot({ u: i, v: j }));
        b.addEventListener("pointerleave", () => setHot(null));
        b.addEventListener("focus", () => setHot({ u: i, v: j }));
        b.addEventListener("blur", () => setHot(null));
        td.appendChild(b);
        tr.appendChild(td);
        cells[i][j] = b;
      }
      const sum = document.createElement("td");
      sum.className = "tbi2-mx-sum";
      tr.appendChild(sum);
      cells[i].sum = sum;
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);

    const toggle = (i, j) => {
      if (i === j) return;
      if (mode === "weighted") {
        const k = weightCycle.indexOf(M[i][j]);
        M[i][j] = M[j][i] = weightCycle[(k + 1) % weightCycle.length];
      } else if (mode === "directed") {
        M[i][j] = M[i][j] ? 0 : 1;
      } else {
        M[i][j] = M[j][i] = M[i][j] ? 0 : 1;
      }
      const verb =
        mode === "directed"
          ? M[i][j]
            ? `${names[i]} now points to ${names[j]}`
            : `${names[i]} no longer points to ${names[j]}`
          : M[i][j]
            ? `${names[i]} and ${names[j]} are now connected${mode === "weighted" ? ` with weight ${fmtW(M[i][j])}` : ""}`
            : `${names[i]} and ${names[j]} are no longer connected`;
      setText(read, `${verb}. ${mode === "directed" ? "Only one cell changed." : "Both cells changed, because the matrix of an undirected graph is symmetric."}`);
      render();
    };

    const setHot = (h) => {
      hot = h;
      render();
    };

    const edgeList = () => {
      const out = [];
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          if (i === j || !M[i][j]) continue;
          if (mode !== "directed" && j < i) continue;
          out.push({ u: i, v: j, w: M[i][j], both: mode === "directed" && M[j][i] > 0 });
        }
      return out;
    };

    const isHotEdge = (e) => {
      if (!hot) return false;
      if (hot.node != null) return e.u === hot.node || e.v === hot.node;
      if (mode === "directed") return e.u === hot.u && e.v === hot.v;
      return (e.u === hot.u && e.v === hot.v) || (e.u === hot.v && e.v === hot.u);
    };

    const render = () => {
      const R = 15;
      const edges = edgeList();
      const geo = (e) => {
        const [x1, y1] = st.place(nodes[e.u].x, nodes[e.u].y);
        const [x2, y2] = st.place(nodes[e.v].x, nodes[e.v].y);
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const off = e.both ? 16 : 0;
        const cx = (x1 + x2) / 2 + (-dy / len) * off;
        const cy = (y1 + y2) / 2 + (dx / len) * off;
        // end point pulled back to the node rim for the arrowhead
        const tx = x2 - cx;
        const ty = y2 - cy;
        const tl = Math.hypot(tx, ty) || 1;
        const ex = x2 - (tx / tl) * (R + 3);
        const ey = y2 - (ty / tl) * (R + 3);
        return { x1, y1, cx, cy, x2, y2, ex, ey, ux: tx / tl, uy: ty / tl };
      };
      L.edges
        .selectAll("g.tbi2-mx-edge")
        .data(edges, (e) => `${e.u}-${e.v}`)
        .join((enter) => {
          const g = enter.append("g").attr("class", "tbi2-mx-edge");
          g.append("path").attr("class", "tbi2-mx-hit");
          g.append("path").attr("class", "tbi2-mx-line");
          g.append("path").attr("class", "tbi2-mx-arrow");
          g.append("text").attr("class", "tbi2-mx-w").attr("text-anchor", "middle").attr("dy", "0.35em");
          g.on("pointerenter", (ev, e) => setHot({ u: e.u, v: e.v })).on("pointerleave", () => setHot(null));
          return g;
        })
        .classed("is-hot", isHotEdge)
        .each(function (e) {
          const p = geo(e);
          const d = mode === "directed" ? `M ${p.x1} ${p.y1} Q ${p.cx} ${p.cy} ${p.ex} ${p.ey}` : `M ${p.x1} ${p.y1} Q ${p.cx} ${p.cy} ${p.x2} ${p.y2}`;
          const g = d3.select(this);
          g.selectAll(".tbi2-mx-hit, .tbi2-mx-line").attr("d", d);
          g.select(".tbi2-mx-line").attr("stroke-width", mode === "weighted" ? 1 + e.w * 7 : 2);
          const a = 9;
          g.select(".tbi2-mx-arrow")
            .attr(
              "d",
              mode === "directed"
                ? `M ${p.ex} ${p.ey} L ${p.ex - p.ux * a - p.uy * a * 0.55} ${p.ey - p.uy * a + p.ux * a * 0.55} L ${p.ex - p.ux * a + p.uy * a * 0.55} ${p.ey - p.uy * a - p.ux * a * 0.55} Z`
                : ""
            )
            .style("display", mode === "directed" ? null : "none");
          g.select(".tbi2-mx-w")
            .attr("x", 0.25 * p.x1 + 0.5 * p.cx + 0.25 * p.x2)
            .attr("y", 0.25 * p.y1 + 0.5 * p.cy + 0.25 * p.y2 - 9)
            .text(mode === "weighted" ? fmtW(e.w) : "");
        });
      const { nodeSel } = nodeLink(st, L, nodes, [], { r: () => R, labelPos: "inside" });
      nodeSel.select(".tbi2-node-label").text((d) => d.label[0]);
      nodeSel
        .classed("is-hot", (d) => hot && (hot.node === d.i || hot.u === d.i || hot.v === d.i))
        .attr("aria-label", (d) => `${d.label}. Drag, or use the arrow keys, to move.`)
        .attr("data-name", (d) => d.label);
      // table
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          const b = cells[i][j];
          const v = M[i][j];
          sum += v;
          b.textContent = i === j ? "–" : v ? fmtW(v) : "0";
          b.classList.toggle("is-on", v > 0);
          b.style.setProperty("--w", mode === "weighted" ? String(0.25 + v * 0.75) : v ? "1" : "0");
          const lit = hot && ((hot.u === i && hot.v === j) || (mode !== "directed" && hot.u === j && hot.v === i) || hot.node === i || hot.node === j);
          b.classList.toggle("is-hot", !!lit);
          b.setAttribute(
            "aria-label",
            i === j
              ? `${names[i]} and ${names[i]}: a node is not connected to itself`
              : mode === "directed"
                ? `${names[i]} to ${names[j]}: ${v ? "arrow" : "none"}. Press to toggle.`
                : `${names[i]} and ${names[j]}: ${v ? (mode === "weighted" ? `weight ${fmtW(v)}` : "connected") : "not connected"}. Press to change.`
          );
        }
        cells[i].sum.textContent = mode === "weighted" ? sum.toFixed(1) : String(sum);
      }
      setText($("#tbi2-mx-sumhead"), mode === "directed" ? "Out" : mode === "weighted" ? "Strength" : "Degree");
    };

    interactive(
      L.nodes.selectAll("g.tbi2-node").data(nodes).join("g").attr("class", "tbi2-node tbi-focusable"),
      st,
      {
        label: (d) => d.label,
        onMove: (d, x, y) => {
          d.x = x;
          d.y = y;
          setText(read, `You moved ${d.label}. The matrix has not changed, because the graph has not changed.`);
          render();
        },
        onClick: (d) => setHot(hot && hot.node === d.i ? null : { node: d.i }),
      }
    );
    L.nodes.selectAll("g.tbi2-node").on("pointerenter", (ev, d) => ev.pointerType === "mouse" && setHot({ node: d.i })).on("pointerleave", () => setHot(null));

    modeBtns.forEach((b) =>
      b.addEventListener("click", () => {
        const m = b.dataset.mx;
        if (m === mode) return;
        for (let i = 0; i < n; i++)
          for (let j = i + 1; j < n; j++) {
            const on = M[i][j] || M[j][i];
            if (m === "weighted") M[i][j] = M[j][i] = on ? (defaultW[`${i}-${j}`] ?? 0.5) : 0;
            else M[i][j] = M[j][i] = on ? 1 : 0;
          }
        mode = m;
        pressGroup(modeBtns, b);
        const msg = {
          plain: "Unweighted and undirected: a 1 means connected, a 0 means not.",
          weighted: "Weighted: each cell now holds how strong the connection is. Click a cell to cycle its weight.",
          directed: "Directed: a cell in row A, column B means A points to B. Click a cell and see that its mirror no longer follows.",
        }[m];
        setText(read, msg);
        render();
      })
    );
    $("#tbi2-mx-shuffle")?.addEventListener("click", () => {
      layoutIdx = (layoutIdx + 1) % layouts.length;
      const from = nodes.map((d) => [d.x, d.y]);
      const to = layouts[layoutIdx];
      animate(800, (t) => {
        const e = ease(t);
        nodes.forEach((d, i) => {
          d.x = lerp(from[i][0], to[i][0], e);
          d.y = lerp(from[i][1], to[i][1], e);
        });
        render();
      });
      setText(read, "A different drawing. The matrix has not changed, because the graph has not changed.");
    });
    st.onResize(render);
    repaints.push(render);
    render();
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: degree, weighted degree and the friendship paradox          */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-deg");
    if (!svg) return;
    const read = $("#tbi2-deg-read");
    const bars = $("#tbi2-deg-bars");
    const title = $("#tbi2-deg-title");
    const btns = [...document.querySelectorAll("[data-deg]")];
    const st = stage(svg, { ratio: 0.72, minH: 300, maxH: 380, mobileRatio: 0.95, pad: 30 });
    const people = [
      ["Ravi", 0.42, 0.45],
      ["Mina", 0.72, 0.5],
      ["Tom", 0.12, 0.2],
      ["Ana", 0.3, 0.1],
      ["Joe", 0.52, 0.12],
      ["Lea", 0.1, 0.72],
      ["Sam", 0.3, 0.88],
      ["Ivy", 0.95, 0.28],
      ["Kit", 0.95, 0.8],
      ["Noor", 0.7, 0.92],
    ];
    const nodes = people.map(([label, x, y], i) => ({ i, label, x, y }));
    const links = [
      [0, 2, 0.2],
      [0, 3, 0.15],
      [0, 4, 0.2],
      [0, 5, 0.1],
      [0, 6, 0.2],
      [0, 1, 0.3],
      [1, 7, 0.9],
      [1, 8, 0.85],
      [1, 9, 0.9],
      [7, 8, 0.6],
      [2, 3, 0.4],
      [5, 6, 0.3],
      [4, 7, 0.2],
    ].map(([u, v, w]) => ({ u, v, w }));
    const g = algo.build(
      nodes.length,
      links.map((l) => [l.u, l.v, l.w])
    );
    const k = algo.degree(g);
    const s = algo.strength(g);
    const nbrMean = g.adj.map((a) => d3.mean(a, (j) => k[j]));
    let mode = "k";
    let paradox = false;
    let sel = null;
    const L = layersFor(svg);
    const render = () => {
      const val = mode === "k" ? k : s;
      const max = d3.max(val);
      const r = (d) => 7 + 15 * Math.sqrt(val[d.i] / max);
      const { edgeSel, nodeSel } = nodeLink(st, L, nodes, links, { r, edgeWidth: (l) => (mode === "s" ? 1 + l.w * 7 : 1.6) });
      edgeSel.classed("is-hot", (l) => sel != null && (l.u === sel || l.v === sel));
      nodeSel
        .classed("is-hot", (d) => sel === d.i)
        .classed("is-warm", (d) => paradox && k[d.i] < nbrMean[d.i])
        .attr(
          "aria-label",
          (d) => `${d.label}: ${k[d.i]} friends, total strength ${s[d.i].toFixed(2)}${paradox ? `, friends have ${nbrMean[d.i].toFixed(1)} friends on average` : ""}`
        );
      nodeSel.select(".tbi2-node-label").text((d) => (paradox ? `${d.label} ${k[d.i]}·${nbrMean[d.i].toFixed(1)}` : d.label));
      const rows = nodes
        .map((d) => ({ label: d.label, value: val[d.i], text: mode === "k" ? String(k[d.i]) : s[d.i].toFixed(2), key: sel === d.i }))
        .sort((a, b) => b.value - a.value);
      drawBars(bars, rows, { max });
      setText(title, mode === "k" ? "Degree: number of friends" : "Weighted degree: total strength");
    };
    interactive(L.nodes.selectAll("g.tbi2-node").data(nodes).join("g").attr("class", "tbi2-node tbi-focusable"), st, {
      label: (d) => d.label,
      onMove: (d, x, y) => {
        d.x = x;
        d.y = y;
        render();
      },
      onClick: (d) => {
        sel = sel === d.i ? null : d.i;
        if (sel != null)
          setText(
            read,
            `<strong>${d.label}</strong> has degree ${k[d.i]} and weighted degree ${s[d.i].toFixed(2)} (${g.adj[d.i].map((j) => g.weight.get(algo.key(d.i, j)).toFixed(2)).join(" + ")}).`
          );
        render();
      },
    });
    btns.forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.dataset.deg;
        pressGroup(btns, b);
        setText(
          read,
          mode === "k"
            ? "Counting friends: Ravi, with six, is the most connected."
            : "Weighing friendships: Mina’s four strong ties add up to more than Ravi’s six weak ones."
        );
        render();
      })
    );
    $("#tbi2-deg-paradox")?.addEventListener("click", (ev) => {
      paradox = !paradox;
      ev.currentTarget.setAttribute("aria-pressed", String(paradox));
      const meanK = d3.mean(k);
      const meanNbr = d3.mean(nbrMean);
      const fewer = nodes.filter((d) => k[d.i] < nbrMean[d.i]).length;
      const edgeMean = d3.sum(k, (x) => x * x) / d3.sum(k);
      setText(
        read,
        paradox
          ? `Each label now reads <em>own friends · friends’ average</em>. The average person has ${meanK.toFixed(1)} friends, but ${fewer} of the ${nodes.length} have fewer friends than their friends do, on average. Pick a friendship at random and look at either end, and that person has ${edgeMean.toFixed(1)} friends on average.`
          : ""
      );
      render();
    });
    st.onResize(render);
    repaints.push(render);
    render();
    setText(read, "Counting friends: Ravi, with six, is the most connected.");
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: density, solid edges against the ghosts of possible ones    */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-dens");
    if (!svg) return;
    const nIn = $("#tbi2-dens-n");
    const eIn = $("#tbi2-dens-e");
    const read = $("#tbi2-dens-read");
    const fill = $("#tbi2-dens-fill");
    const st = stage(svg, { ratio: 0.5, minH: 260, maxH: 340, mobileRatio: 0.9, pad: 24 });
    const order = (n) => {
      const pairs = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
      const rand = algo.rng(n * 31);
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      return pairs;
    };
    const L = layersFor(svg);
    const render = () => {
      const n = +nIn.value;
      const maxE = (n * (n - 1)) / 2;
      eIn.max = String(maxE);
      if (+eIn.value > maxE) eIn.value = String(maxE);
      const E = +eIn.value;
      const pairs = order(n);
      const cx = st.w / 2;
      const cy = st.h / 2;
      const R = Math.min(st.w, st.h) / 2 - 26;
      const pos = d3.range(n).map((i) => [cx + R * Math.cos((i / n) * 2 * Math.PI - Math.PI / 2), cy + R * Math.sin((i / n) * 2 * Math.PI - Math.PI / 2)]);
      L.edges
        .selectAll("line")
        .data(pairs)
        .join("line")
        .attr("x1", (p) => pos[p[0]][0])
        .attr("y1", (p) => pos[p[0]][1])
        .attr("x2", (p) => pos[p[1]][0])
        .attr("y2", (p) => pos[p[1]][1])
        .attr("class", (p, i) => (i < E ? "tbi2-edge" : "tbi2-ghost"));
      L.nodes
        .selectAll("circle")
        .data(pos)
        .join("circle")
        .attr("class", "tbi2-dens-dot")
        .attr("r", 7)
        .attr("cx", (p) => p[0])
        .attr("cy", (p) => p[1]);
      const dens = maxE ? E / maxE : 0;
      setText(
        read,
        `<em>V</em> = ${n} nodes could share <em>V</em>(<em>V</em>&minus;1)/2 = ${maxE} edges, and <em>E</em> = ${E} of them are present. Density = 2<em>E</em> / <em>V</em>(<em>V</em>&minus;1) = 2&times;${E} / (${n}&times;${n - 1}) = <strong>${dens.toFixed(2)}</strong>`
      );
      if (fill) fill.style.width = `${dens * 100}%`;
      svg.setAttribute("aria-label", `${n} nodes arranged in a circle, ${E} of ${maxE} possible edges drawn. Density ${dens.toFixed(2)}.`);
    };
    nIn.addEventListener("input", render);
    eIn.addEventListener("input", render);
    st.onResize(render);
    repaints.push(render);
    render();
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: shortest paths as a ripple, and the distribution of all of them */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-path");
    if (!svg) return;
    const hist = $("#tbi2-path-hist");
    const read = $("#tbi2-path-read");
    const st = stage(svg, { ratio: 0.5, minH: 250, maxH: 360, mobileRatio: 0.85, pad: 26 });
    const hs = stage(hist, { ratio: 0.2, minH: 130, maxH: 150, mobileRatio: 0.42, pad: 0 });
    const cols = 6;
    const rows = 3;
    const rand = algo.rng(42);
    const nodes = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = nodes.length;
        nodes.push({ i, label: String.fromCharCode(65 + i), x: c / (cols - 1) + (rand() - 0.5) * 0.08, y: r / (rows - 1) + (rand() - 0.5) * 0.18 });
      }
    const base = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1) base.push([i, i + 1]);
        if (r < rows - 1) base.push([i, i + cols]);
      }
    const drop = new Set(["1-7", "8-14", "3-4", "10-11", "15-16", "4-10"]);
    const baseEdges = base.filter(([u, v]) => !drop.has(`${u}-${v}`));
    baseEdges.push([7, 14]);
    let edges = baseEdges.slice();
    let g = algo.build(nodes.length, edges);
    let src = null;
    let dst = null;
    let reveal = Infinity; // BFS layer reached by the ripple
    let cancel = () => {};
    const L = layersFor(svg);
    const H = layersFor(hist);

    const shortcutPool = [
      [0, 17],
      [12, 5],
      [2, 15],
      [6, 11],
    ];
    let shortcuts = 0;

    const render = () => {
      const info = src != null ? algo.bfs(g, src) : null;
      const onPath = new Set();
      const onPathNodes = new Set();
      if (info && dst != null && info.dist[dst] >= 0 && reveal >= info.dist[dst]) {
        const stack = [dst];
        onPathNodes.add(dst);
        while (stack.length) {
          const w = stack.pop();
          for (const v of info.pred[w]) {
            onPath.add(algo.key(v, w));
            if (!onPathNodes.has(v)) {
              onPathNodes.add(v);
              stack.push(v);
            }
          }
        }
      }
      const links = g.edges.map(([u, v]) => ({ u, v, short: v - u !== 1 && v - u !== cols && !(u === 7 && v === 14) }));
      const { edgeSel, nodeSel } = nodeLink(st, L, nodes, links, { r: () => 12, labelPos: "inside" });
      edgeSel
        .classed("is-path", (l) => onPath.has(algo.key(l.u, l.v)))
        .classed("is-reached", (l) => info && info.dist[l.u] >= 0 && Math.max(info.dist[l.u], info.dist[l.v]) <= reveal && Math.abs(info.dist[l.u] - info.dist[l.v]) === 1)
        .classed("is-shortcut", (l) => l.short);
      nodeSel
        .classed("is-source", (d) => d.i === src)
        .classed("is-target", (d) => d.i === dst)
        .classed("is-onpath", (d) => onPathNodes.has(d.i))
        .attr("aria-label", (d) => `Node ${d.label}${info && info.dist[d.i] >= 0 ? `, ${info.dist[d.i]} steps from ${nodes[src].label}` : ""}`)
        .each(function (d) {
          const dist = info ? info.dist[d.i] : -1;
          const reached = info && dist >= 0 && dist <= reveal;
          const maxD = info ? Math.max(...info.dist) : 1;
          d3.select(this)
            .select(".tbi2-node-dot")
            .style("fill", reached ? d3.interpolateRgb(P.accent, P.bg)(0.15 + (0.7 * dist) / Math.max(1, maxD)) : null);
          d3.select(this)
            .select(".tbi2-node-label")
            .text(reached && d.i !== src ? dist : d.label);
        });

      // Histogram of all pairwise distances; the selected source's distances are overlaid.
      const stats = algo.pathStats(g);
      const counts = stats.hist.slice(1);
      const mine = [];
      if (info) info.dist.forEach((x, i) => i !== src && x > 0 && (mine[x - 1] = (mine[x - 1] || 0) + 1));
      const maxC = Math.max(...counts);
      const bw = (hs.w - 40) / Math.max(7, counts.length);
      const y0 = hs.h - 22;
      const sy = (y0 - 18) / maxC;
      H.edges
        .selectAll("rect.tbi2-hbar")
        .data(counts)
        .join("rect")
        .attr("class", "tbi2-hbar")
        .attr("x", (c, i) => 30 + i * bw + 3)
        .attr("width", bw - 6)
        .attr("y", (c) => y0 - c * sy)
        .attr("height", (c) => c * sy);
      H.mid
        .selectAll("rect.tbi2-hbar-mine")
        .data(counts.map((c, i) => mine[i] || 0))
        .join("rect")
        .attr("class", "tbi2-hbar-mine")
        .attr("x", (c, i) => 30 + i * bw + 3)
        .attr("width", bw - 6)
        .attr("y", (c) => y0 - c * sy)
        .attr("height", (c) => c * sy);
      H.nodes
        .selectAll("text.tbi2-hlab")
        .data(counts)
        .join("text")
        .attr("class", "tbi2-hlab")
        .attr("text-anchor", "middle")
        .attr("x", (c, i) => 30 + (i + 0.5) * bw)
        .attr("y", y0 + 15)
        .text((c, i) => i + 1);
      const mx = 30 + (stats.avg - 0.5) * bw;
      H.top
        .selectAll("line.tbi2-hmean")
        .data([stats.avg])
        .join("line")
        .attr("class", "tbi2-hmean")
        .attr("x1", mx)
        .attr("x2", mx)
        .attr("y1", 6)
        .attr("y2", y0);
      H.top
        .selectAll("text.tbi2-hmean-lab")
        .data([stats.avg])
        .join("text")
        .attr("class", "tbi2-hmean-lab")
        .attr("x", mx + 5)
        .attr("y", 14)
        .text(`average ${stats.avg.toFixed(2)}`);
      H.top
        .selectAll("text.tbi2-hdiam")
        .data([stats.diameter])
        .join("text")
        .attr("class", "tbi2-hdiam")
        .attr("text-anchor", "middle")
        .attr("x", 30 + (stats.diameter - 0.5) * bw)
        .attr("y", y0 - counts[stats.diameter - 1] * sy - 5)
        .text("diameter");
      H.top
        .selectAll("text.tbi2-haxis")
        .data([0])
        .join("text")
        .attr("class", "tbi2-haxis")
        .attr("x", 0)
        .attr("y", y0 + 15)
        .text("steps");
      hist.setAttribute(
        "aria-label",
        `Histogram of the shortest-path length between every pair of the ${nodes.length} nodes: ${counts.map((c, i) => `${c} pairs at distance ${i + 1}`).join(", ")}. Average path length ${stats.avg.toFixed(2)}, diameter ${stats.diameter}.`
      );
      return { info, stats };
    };

    const pick = (d) => {
      cancel();
      if (src == null || dst != null) {
        src = d.i;
        dst = null;
        const info = algo.bfs(g, src);
        const maxD = Math.max(...info.dist);
        reveal = -1;
        cancel = animate(
          maxD * 420 + 200,
          (t) => {
            const r = Math.floor(t * (maxD + 0.5));
            if (r !== reveal) {
              reveal = r;
              render();
            }
          },
          () => {
            reveal = Infinity;
            render();
          }
        );
        const ecc = Math.max(...info.dist);
        const mean = d3.mean(info.dist.filter((x) => x > 0));
        setText(
          read,
          `From <strong>${d.label}</strong>, the wave reaches everyone in ${ecc} steps; the average distance from ${d.label} is ${mean.toFixed(2)}. Now choose a second node.`
        );
      } else if (d.i === src) {
        src = null;
        setText(read, "Choose a starting node.");
      } else {
        dst = d.i;
        reveal = Infinity;
        const info = render().info;
        setText(
          read,
          `${nodes[src].label} to ${d.label}: ${info.dist[dst]} steps, along ${info.sigma[dst]} different shortest path${info.sigma[dst] > 1 ? "s" : ""}. Choose another node to start again.`
        );
      }
      render();
    };

    interactive(L.nodes.selectAll("g.tbi2-node").data(nodes).join("g").attr("class", "tbi2-node tbi-focusable"), st, {
      label: (d) => `Node ${d.label}`,
      onMove: (d, x, y) => {
        d.x = x;
        d.y = y;
        render();
      },
      onClick: pick,
    });
    const btnShort = $("#tbi2-path-shortcut");
    btnShort?.addEventListener("click", () => {
      if (shortcuts >= shortcutPool.length) return;
      const before = algo.pathStats(g);
      edges.push(shortcutPool[shortcuts++]);
      g = algo.build(nodes.length, edges);
      const after = render().stats;
      setText(
        read,
        `One shortcut added. Average path length ${before.avg.toFixed(2)} &rarr; ${after.avg.toFixed(2)}; diameter ${before.diameter} &rarr; ${after.diameter}.`
      );
      if (shortcuts >= shortcutPool.length) btnShort.disabled = true;
    });
    $("#tbi2-path-reset")?.addEventListener("click", () => {
      cancel();
      edges = baseEdges.slice();
      shortcuts = 0;
      if (btnShort) btnShort.disabled = false;
      g = algo.build(nodes.length, edges);
      src = dst = null;
      reveal = Infinity;
      render();
      setText(read, "Choose a starting node.");
    });
    st.onResize(render);
    hs.onResize(render);
    repaints.push(render);
    render();
    setText(read, "Choose a starting node.");
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: clustering, are my friends friends with each other?        */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-cc");
    if (!svg) return;
    const read = $("#tbi2-cc-read");
    const st = stage(svg, { ratio: 0.6, minH: 300, maxH: 400, mobileRatio: 1, pad: 30 });
    const people = [
      ["Ola", 0.5, 0.5],
      ["Ben", 0.5, 0.12],
      ["Cleo", 0.82, 0.32],
      ["Dev", 0.76, 0.8],
      ["Esi", 0.24, 0.8],
      ["Finn", 0.18, 0.32],
      ["Gus", 0.02, 0.06],
      ["Hana", 0.98, 0.04],
      ["Ida", 0.98, 0.98],
    ];
    const nodes = people.map(([label, x, y], i) => ({ i, label, x, y }));
    const start = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [1, 6],
      [2, 7],
      [3, 8],
      [7, 8],
    ];
    let edges = start.map((e) => e.slice());
    let focus = 0;
    let fresh = new Set();
    const L = layersFor(svg);
    const has = (u, v) => edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
    const render = () => {
      const g = algo.build(nodes.length, edges);
      const { cc, tri } = algo.clustering(g);
      const nb = g.adj[focus].slice().sort((a, b) => a - b);
      const pairs = [];
      for (let i = 0; i < nb.length; i++) for (let j = i + 1; j < nb.length; j++) pairs.push([nb[i], nb[j]]);
      // triangles
      const tris = pairs.filter(([a, b]) => has(a, b));
      const pt = (i) => st.place(nodes[i].x, nodes[i].y);
      L.back
        .selectAll("path.tbi2-tri")
        .data(tris, ([a, b]) => `${focus}-${a}-${b}`)
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("class", "tbi2-tri")
              .style("opacity", 0)
              .call((e) => e.transition().duration(reduceMotion ? 0 : 500).style("opacity", 1)),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr("d", ([a, b]) => {
          const [p, q, r] = [pt(focus), pt(a), pt(b)];
          return `M ${p[0]} ${p[1]} L ${q[0]} ${q[1]} L ${r[0]} ${r[1]} Z`;
        });
      const links = edges.map(([u, v]) => ({ u, v }));
      const { edgeSel, nodeSel } = nodeLink(st, L, nodes, links, { r: (d) => (d.i === focus ? 17 : 13) });
      const among = (l) => nb.includes(l.u) && nb.includes(l.v);
      edgeSel
        .classed("is-hot", (l) => l.u === focus || l.v === focus)
        .classed("is-among", among)
        .classed("is-fresh", (l) => fresh.has(algo.key(l.u, l.v)));
      nodeSel
        .classed("is-source", (d) => d.i === focus)
        .classed("is-nbr", (d) => nb.includes(d.i))
        .attr("aria-label", (d) => `${d.label}: clustering ${cc[d.i].toFixed(2)}, ${tri[d.i]} triangles. Press Enter to look from here.`);
      // Possible friendships among the focus's friends: ghosts you can click to introduce, solid ones to remove
      L.mid
        .selectAll("g.tbi2-cc-pair")
        .data(pairs, (p) => `${p[0]}-${p[1]}`)
        .join((enter) => {
          const gg = enter.append("g").attr("class", "tbi2-cc-pair tbi-focusable").attr("tabindex", 0).attr("role", "button");
          gg.append("line").attr("class", "tbi2-cc-hit");
          gg.append("line").attr("class", "tbi2-cc-ghost");
          gg.on("click", (ev, p) => flip(p)).on("keydown", (ev, p) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.preventDefault();
              flip(p);
            }
          });
          return gg;
        })
        .classed("is-real", ([a, b]) => has(a, b))
        .attr("aria-label", ([a, b]) =>
          has(a, b) ? `${nodes[a].label} and ${nodes[b].label} are friends. Press to remove.` : `${nodes[a].label} and ${nodes[b].label} are not friends. Press to introduce them.`
        )
        .each(function ([a, b]) {
          const [x1, y1] = pt(a);
          const [x2, y2] = pt(b);
          d3.select(this).selectAll("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
        });
      const k = nb.length;
      const E = tris.length;
      const possible = (k * (k - 1)) / 2;
      setText(
        read,
        `<strong>${nodes[focus].label}</strong> has <em>k</em> = ${k} friends, who could share ${possible} friendships among themselves; ${E} exist${E === 1 ? "s" : ""}. ` +
          (k > 1
            ? `<em>C</em> = 2&times;${E} / (${k}&times;${k - 1}) = <strong>${cc[focus].toFixed(2)}</strong>, and ${nodes[focus].label} sits in ${tri[focus]} triangle${tri[focus] === 1 ? "" : "s"}.`
            : "With fewer than two friends there is nothing to close, so <em>C</em> is set to 0.") +
          ` Average clustering of the whole network: ${algo.averageClustering(g).toFixed(2)}.`
      );
    };
    const flip = ([a, b]) => {
      const k = algo.key(a, b);
      if (has(a, b)) {
        edges = edges.filter(([u, v]) => algo.key(u, v) !== k);
        fresh.delete(k);
      } else {
        edges.push([a, b]);
        fresh.add(k);
      }
      render();
    };
    interactive(L.nodes.selectAll("g.tbi2-node").data(nodes).join("g").attr("class", "tbi2-node tbi-focusable"), st, {
      label: (d) => d.label,
      onMove: (d, x, y) => {
        d.x = x;
        d.y = y;
        render();
      },
      onClick: (d) => {
        focus = d.i;
        render();
      },
    });
    $("#tbi2-cc-reset")?.addEventListener("click", () => {
      edges = start.map((e) => e.slice());
      fresh = new Set();
      focus = 0;
      render();
    });
    st.onResize(render);
    repaints.push(render);
    render();
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: assortativity, rewired live while the degrees stay fixed    */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-asr-net");
    if (!svg) return;
    const scatter = $("#tbi2-asr-scatter");
    const line = $("#tbi2-asr-line");
    const slider = $("#tbi2-asr-slider");
    const read = $("#tbi2-asr-read");
    const st = stage(svg, { ratio: 0.75, minH: 280, maxH: 360, mobileRatio: 0.9, pad: 16 });
    const ss = stage(scatter, { ratio: 0.75, minH: 240, maxH: 360, mobileRatio: 0.8, pad: 0 });
    const ls = stage(line, { ratio: 0.14, minH: 104, maxH: 110, mobileRatio: 0.3, pad: 0 });
    const n = 40;
    const rand = algo.rng(2024);
    const initial = algo.preferential(n, 2, rand);
    let edges = initial.map((e) => e.slice());
    const deg = new Array(n).fill(0);
    edges.forEach(([u, v]) => {
      deg[u]++;
      deg[v]++;
    });
    const m = edges.length;
    let s1 = 0;
    let s2 = 0;
    edges.forEach(([u, v]) => {
      s1 += (deg[u] + deg[v]) / 2;
      s2 += (deg[u] ** 2 + deg[v] ** 2) / 2;
    });
    const mean = s1 / m;
    const den = s2 / m - mean * mean;
    const rOf = (S) => (S / m - mean * mean) / den;
    let S = edges.reduce((a, [u, v]) => a + deg[u] * deg[v], 0);
    const keys = new Set(edges.map(([u, v]) => algo.key(u, v)));
    const maxDeg = Math.max(...deg);
    const nodes = d3.range(n).map((i) => ({ i, x: st.w / 2 + Math.cos(i) * 60, y: st.h / 2 + Math.sin(i) * 60 }));
    const linkData = () => edges.map(([u, v]) => ({ source: nodes[u], target: nodes[v] }));
    const gl = d3.select(svg).append("g");
    const gn = d3.select(svg).append("g");
    let lineSel = gl.selectAll("line");
    const dotSel = gn
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => 3.5 + 9 * Math.sqrt(deg[d.i] / maxDeg));
    const colourOf = (k) => d3.interpolateRgb(P.ink2, P.hot)(Math.sqrt((k - 2) / (maxDeg - 2)));
    const drawNet = () => {
      lineSel = gl
        .selectAll("line")
        .data(edges)
        .join("line")
        .attr("class", "tbi2-asr-edge")
        .attr("x1", ([u]) => nodes[u].x)
        .attr("y1", ([u]) => nodes[u].y)
        .attr("x2", ([, v]) => nodes[v].x)
        .attr("y2", ([, v]) => nodes[v].y);
      dotSel
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("fill", (d) => colourOf(deg[d.i]))
        .attr("stroke", P.bg);
    };
    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(linkData()).distance(30).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-60))
      .force("x", d3.forceX(() => st.w / 2).strength(0.08))
      .force("y", d3.forceY(() => st.h / 2).strength(0.1))
      .alphaDecay(0.04)
      .on("tick", () => {
        nodes.forEach((d) => {
          d.x = clamp(d.x, 12, st.w - 12);
          d.y = clamp(d.y, 12, st.h - 12);
        });
        drawNet();
      })
      .stop();
    const S1 = d3.select(scatter);
    const sg = S1.append("g");
    const drawScatter = () => {
      const pad = 34;
      const sx = d3.scaleLinear([1.5, maxDeg + 0.5], [pad, ss.w - 10]);
      const sy = d3.scaleLinear([1.5, maxDeg + 0.5], [ss.h - pad, 10]);
      const cells = new Map();
      edges.forEach(([u, v]) => {
        [
          [deg[u], deg[v]],
          [deg[v], deg[u]],
        ].forEach(([a, b]) => {
          const k = `${a},${b}`;
          cells.set(k, (cells.get(k) || 0) + 1);
        });
      });
      const data = [...cells.entries()].map(([k, c]) => {
        const [a, b] = k.split(",").map(Number);
        return { a, b, c };
      });
      sg.selectAll("rect.tbi2-asr-frame")
        .data([0])
        .join("rect")
        .attr("class", "tbi2-asr-frame")
        .attr("x", pad)
        .attr("y", 10)
        .attr("width", ss.w - 10 - pad)
        .attr("height", ss.h - pad - 10);
      sg.selectAll("line.tbi2-asr-diag")
        .data([0])
        .join("line")
        .attr("class", "tbi2-asr-diag")
        .attr("x1", sx(2))
        .attr("y1", sy(2))
        .attr("x2", sx(maxDeg))
        .attr("y2", sy(maxDeg));
      sg.selectAll("circle.tbi2-asr-pt")
        .data(data, (d) => `${d.a},${d.b}`)
        .join("circle")
        .attr("class", "tbi2-asr-pt")
        .attr("cx", (d) => sx(d.a))
        .attr("cy", (d) => sy(d.b))
        .attr("r", (d) => 2.2 + 2.2 * Math.sqrt(d.c));
      sg.selectAll("text.tbi2-asr-ax")
        .data(["degree at one end", "degree at the other end"])
        .join("text")
        .attr("class", "tbi2-asr-ax")
        .attr("text-anchor", "middle")
        .attr("transform", (t, i) => (i === 0 ? `translate(${(pad + ss.w) / 2},${ss.h - 10})` : `translate(14,${(ss.h - pad) / 2 + 5}) rotate(-90)`))
        .text((t) => t);
    };
    // Real networks from Newman (2002), Table I.
    const refs = [
      { r: 0.363, name: "Physics co-authors", side: 1 },
      { r: 0.276, name: "Company directors", side: -1 },
      { r: 0.208, name: "Film actors", side: 1 },
      { r: -0.156, name: "Yeast proteins", side: 1 },
      { r: -0.163, name: "C. elegans neurons", side: -1 },
      { r: -0.189, name: "Internet", side: 1 },
      { r: -0.276, name: "Food web", side: -1 },
    ];
    const drawLine = () => {
      const x = d3.scaleLinear([-0.6, 0.6], [16, ls.w - 16]);
      const y = ls.h / 2;
      const Lg = d3.select(line);
      Lg.selectAll("line.tbi2-asr-axis")
        .data([0])
        .join("line")
        .attr("class", "tbi2-asr-axis")
        .attr("x1", x(-0.6))
        .attr("x2", x(0.6))
        .attr("y1", y)
        .attr("y2", y);
      Lg.selectAll("text.tbi2-asr-tick")
        .data([-0.5, 0, 0.5])
        .join("text")
        .attr("class", "tbi2-asr-tick")
        .attr("text-anchor", "middle")
        .attr("x", (v) => x(v))
        .attr("y", y + 4)
        .attr("dy", "0.35em")
        .text((v) => (v === 0 ? "0" : v > 0 ? "+0.5" : "−0.5"));
      const narrow = ls.w < 520;
      const g = Lg.selectAll("g.tbi2-asr-ref")
        .data(refs)
        .join((enter) => {
          const gg = enter.append("g").attr("class", "tbi2-asr-ref tbi-focusable").attr("tabindex", 0);
          gg.append("line");
          gg.append("circle").attr("r", 4.5);
          gg.append("text").attr("text-anchor", "middle");
          gg.on("pointerenter focus", (ev, d) => showTooltip(`<strong>${d.name}</strong><br>r = ${d.r.toFixed(3)} (Newman 2002)`, ev.type === "focus" ? ev.currentTarget : ev));
          gg.on("pointerleave blur", hideTooltip);
          return gg;
        })
        .attr("aria-label", (d) => `${d.name}, r = ${d.r}`)
        .attr("transform", (d) => `translate(${x(d.r)},${y})`);
      g.select("line")
        .attr("y1", 0)
        .attr("y2", (d) => d.side * 22);
      g.select("text")
        .attr("y", (d) => d.side * 22 + (d.side > 0 ? 12 : -5))
        .style("display", (d, i) => (narrow && i % 2 ? "none" : null))
        .text((d) => (narrow ? d.name.split(" ")[0] : d.name));
      Lg.selectAll("g.tbi2-asr-me")
        .data([0])
        .join((enter) => {
          const gg = enter.append("g").attr("class", "tbi2-asr-me");
          gg.append("path").attr("d", "M 0 -14 L 7 -26 L -7 -26 Z");
          gg.append("text").attr("text-anchor", "middle").attr("y", -31);
          return gg;
        })
        .attr("transform", `translate(${x(clamp(rOf(S), -0.6, 0.6))},${y})`)
        .select("text")
        .text(`this network ${rOf(S) >= 0 ? "+" : "−"}${Math.abs(rOf(S)).toFixed(2)}`);
    };
    let target = rOf(S);
    let running = false;
    let stale = 0;
    let visible = false;
    const step = () => {
      if (!running) return;
      const goal = m * (target * den + mean * mean);
      let improved = 0;
      for (let a = 0; a < 60; a++) {
        const i = Math.floor(Math.random() * m);
        const j = Math.floor(Math.random() * m);
        if (i === j) continue;
        const [p, q] = edges[i];
        let [r, s] = edges[j];
        if (Math.random() < 0.5) [r, s] = [s, r];
        if (p === r || p === s || q === r || q === s) continue;
        // swap (p,q),(r,s) -> (p,r),(q,s): every degree is unchanged
        if (keys.has(algo.key(p, r)) || keys.has(algo.key(q, s))) continue;
        const delta = deg[p] * deg[r] + deg[q] * deg[s] - deg[p] * deg[q] - deg[r] * deg[s];
        if (Math.abs(S + delta - goal) >= Math.abs(S - goal)) continue;
        keys.delete(algo.key(p, q));
        keys.delete(algo.key(r, s));
        keys.add(algo.key(p, r));
        keys.add(algo.key(q, s));
        edges[i] = [p, r];
        edges[j] = [q, s];
        S += delta;
        improved++;
      }
      stale = improved ? 0 : stale + 1;
      sim.force("link").links(linkData());
      sim.alpha(Math.max(sim.alpha(), 0.25));
      if (!visible) sim.stop();
      else if (reduceMotion) {
        sim.stop();
        sim.tick(30);
      } else sim.restart();
      drawNet();
      drawScatter();
      drawLine();
      setText(
        read,
        `<em>r</em> = <strong>${rOf(S) >= 0 ? "+" : "−"}${Math.abs(rOf(S)).toFixed(2)}</strong>. Every node still has exactly the degree it started with; only who is attached to whom has changed.`
      );
      if (Math.abs(rOf(S) - target) < 0.005 || stale > 25) {
        running = false;
        if (stale > 25) setText(read, `${read.innerHTML} This is as far as this set of degrees can be pushed.`);
        return;
      }
      requestAnimationFrame(step);
    };
    slider.addEventListener("input", () => {
      target = +slider.value / 100;
      slider.setAttribute("aria-valuetext", `push towards r = ${target.toFixed(2)}`);
      stale = 0;
      if (!running) {
        running = true;
        requestAnimationFrame(step);
      }
    });
    $("#tbi2-asr-reset")?.addEventListener("click", () => {
      running = false;
      edges = initial.map((e) => e.slice());
      keys.clear();
      edges.forEach(([u, v]) => keys.add(algo.key(u, v)));
      S = edges.reduce((a, [u, v]) => a + deg[u] * deg[v], 0);
      slider.value = String(Math.round(rOf(S) * 100));
      sim.force("link").links(linkData());
      sim.alpha(0.5).restart();
      drawNet();
      drawScatter();
      drawLine();
      setText(read, `Back to the starting wiring, <em>r</em> = ${rOf(S).toFixed(2)}.`);
    });
    slider.value = String(Math.round(rOf(S) * 100));
    // Lay the network out before it is seen, then let it breathe only while visible.
    sim.tick(200);
    drawNet();
    drawScatter();
    drawLine();
    setText(read, `The starting network has <em>r</em> = ${rOf(S).toFixed(2)}. Drag the slider to rewire it.`);
    watchVisibility(svg, (v) => {
      visible = v;
      if (!v) sim.stop();
    });
    const redraw = () => {
      sim.alpha(0.3);
      if (visible && !reduceMotion) sim.restart();
      else sim.tick(60);
      drawNet();
      drawScatter();
      drawLine();
    };
    st.onResize(redraw);
    ss.onResize(drawScatter);
    ls.onResize(drawLine);
    repaints.push(() => {
      drawNet();
      drawScatter();
      drawLine();
    });
  })();

  // A canvas laid over an SVG stage, for particles that would be wasteful as DOM nodes.
  const overlay = (canvas, st) => {
    const o = { canvas, ctx: null };
    o.fit = () => {
      canvas.style.width = `${st.w}px`;
      canvas.style.height = `${st.h}px`;
      const r = window.TBI.fitCanvas(canvas);
      o.ctx = r.ctx;
      o.scale = svgScale();
    };
    // the SVG is drawn in CSS pixels but may be scaled down by max-width; keep the canvas aligned
    const svgScale = () => (st.svg.clientWidth || st.w) / st.w;
    o.clear = () => o.ctx && o.ctx.clearRect(0, 0, st.w, st.h);
    o.fit();
    st.onResize(o.fit);
    return o;
  };

  /* ------------------------------------------------------------------ */
  /* Figure: betweenness, the toll booth                                 */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-bt");
    if (!svg) return;
    const canvas = $("#tbi2-bt-canvas");
    const read = $("#tbi2-bt-read");
    const bars = $("#tbi2-bt-bars");
    const btnFlow = $("#tbi2-bt-flow");
    const btnRemove = $("#tbi2-bt-remove");
    const btnReveal = $("#tbi2-bt-reveal");
    const st = stage(svg, { ratio: 0.5, minH: 280, maxH: 380, mobileRatio: 1.05, pad: 26 });
    const names = ["Hal", "Ash", "Bo", "Cy", "Dot", "Eve", "Fay", "Bea", "Rosa", "Gil", "Ike", "Jo", "Kai", "Lu", "Max"];
    const mobile = () => st.w < 560;
    // left cluster around Hal, right cluster around Rosa, Bea in between
    const posWide = [
      [0.14, 0.5],
      [0.34, 0.3],
      [0.34, 0.7],
      [0.12, 0.08],
      [0.0, 0.3],
      [0.12, 0.92],
      [0.0, 0.7],
      [0.5, 0.5],
      [0.86, 0.5],
      [0.66, 0.3],
      [0.66, 0.7],
      [0.88, 0.08],
      [1.0, 0.3],
      [0.88, 0.92],
      [1.0, 0.7],
    ];
    const posTall = posWide.map(([x, y]) => [y, x]);
    const nodes = names.map((label, i) => ({ i, label, x: 0, y: 0 }));
    const place = () => (mobile() ? posTall : posWide).forEach((p, i) => ([nodes[i].x, nodes[i].y] = p));
    place();
    const E = [];
    for (let i = 1; i <= 6; i++) E.push([0, i]);
    E.push([3, 4], [5, 6], [2, 5], [1, 4]);
    for (let i = 9; i <= 14; i++) E.push([8, i]);
    E.push([11, 12], [13, 14], [10, 13], [9, 12]);
    E.push([7, 1], [7, 2], [7, 9], [7, 10]);
    const full = algo.build(names.length, E);
    let removed = new Set();
    let g = full;
    let bc = algo.betweenness(g);
    let guess = null;
    let revealed = false;
    let flowing = false;
    const counts = new Array(names.length).fill(0);
    let travellers = 0;
    let throughBea = 0;
    const L = layersFor(svg);
    const ov = overlay(canvas, st);

    const render = () => {
      const comp = algo.components(g).comp;
      const max = Math.max(...bc, 1e-9);
      const r = (d) => (revealed ? 8 + 16 * Math.sqrt(bc[d.i] / max) : 13);
      const links = full.edges.map(([u, v]) => ({ u, v }));
      const { edgeSel, nodeSel } = nodeLink(st, L, nodes, links, { r });
      edgeSel.classed("is-gone", (l) => removed.has(l.u) || removed.has(l.v));
      const cmax = Math.max(...counts, 1);
      nodeSel
        .classed("is-gone", (d) => removed.has(d.i))
        .classed("is-guess", (d) => guess === d.i)
        .classed("is-top", (d) => revealed && bc[d.i] === max && !removed.has(d.i))
        .attr("aria-label", (d) => `${d.label}${revealed ? `, betweenness ${bc[d.i].toFixed(2)}` : ". Press Enter to choose this node."}`)
        .each(function (d) {
          const dot = this.querySelector(".tbi2-node-dot");
          dot.style.fill = removed.size && !removed.has(d.i) ? P.groups[comp[d.i] % P.groups.length] : "";
          this.querySelector(".tbi2-node-halo").style.opacity = flowing || travellers ? String(0.15 + 0.85 * (counts[d.i] / cmax)) : "";
        });
      if (revealed)
        drawBars(
          bars,
          nodes
            .filter((d) => !removed.has(d.i))
            .map((d) => ({ label: d.label, value: bc[d.i], key: d.i === guess }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6),
          { max: Math.max(...algo.betweenness(full)) }
        );
    };

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      if (btnReveal) btnReveal.hidden = true;
      btnFlow.disabled = false;
      btnRemove.disabled = false;
      const rank = [...bc].sort((a, b) => b - a).indexOf(bc[guess ?? 7]) + 1;
      const deg = algo.degree(full);
      setText(
        read,
        (guess == null
          ? ""
          : guess === 7
            ? "Yes: it is Bea. "
            : `You chose ${names[guess]}, who comes ${rank === 1 ? "first" : `${rank}${rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}`}. `) +
          `Bea has only ${deg[7]} connections, fewer than Hal or Rosa with ${deg[0]} each, yet ${(bc[7] * 100).toFixed(0)}% of all the shortest paths between other pairs run through her (betweenness ${bc[7].toFixed(2)}, against ${bc[0].toFixed(2)} for each hub).`
      );
      render();
    };

    interactive(L.nodes.selectAll("g.tbi2-node").data(nodes).join("g").attr("class", "tbi2-node tbi-focusable"), st, {
      label: (d) => d.label,
      onClick: (d) => {
        if (!revealed) {
          guess = d.i;
          reveal();
        }
      },
    });

    // Particles: each picks a random pair, then a random shortest path between them (weighted by path counts).
    let bfsAll = [];
    const recompute = () => {
      g = algo.build(names.length, E, removed);
      bc = algo.betweenness(g);
      bfsAll = nodes.map((d) => (removed.has(d.i) ? null : algo.bfs(g, d.i)));
    };
    recompute();
    const samplePath = (s, t) => {
      const b = bfsAll[s];
      if (!b || b.dist[t] <= 0) return null;
      const path = [t];
      let w = t;
      while (w !== s) {
        const preds = b.pred[w];
        let x = Math.random() * b.sigma[w];
        let pick = preds[0];
        for (const v of preds) {
          x -= b.sigma[v];
          if (x <= 0) {
            pick = v;
            break;
          }
        }
        path.push(pick);
        w = pick;
      }
      return path.reverse();
    };
    const particles = [];
    let raf = 0;
    let visible = false;
    let lastPaint = 0;
    const tick = (now) => {
      raf = 0;
      if (!flowing || !visible) return;
      if (particles.length < 70 && Math.random() < 0.6) {
        const alive = nodes.filter((d) => !removed.has(d.i));
        const s = alive[Math.floor(Math.random() * alive.length)].i;
        const t = alive[Math.floor(Math.random() * alive.length)].i;
        const path = s !== t ? samplePath(s, t) : null;
        if (path) particles.push({ path, seg: 0, f: 0, speed: 0.035 + Math.random() * 0.02 });
      }
      const ctx = ov.ctx;
      ov.clear();
      ctx.fillStyle = P.hot;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.f += p.speed;
        if (p.f >= 1) {
          p.f = 0;
          p.seg++;
          if (p.seg >= p.path.length - 1) {
            particles.splice(i, 1);
            travellers++;
            if (p.path.includes(7)) throughBea++;
            continue;
          }
          counts[p.path[p.seg]]++;
        }
        const a = nodes[p.path[p.seg]];
        const b = nodes[p.path[p.seg + 1]];
        const [x1, y1] = st.place(a.x, a.y);
        const [x2, y2] = st.place(b.x, b.y);
        const x = lerp(x1, x2, p.f);
        const y = lerp(y1, y2, p.f);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (now - lastPaint > 250) {
        lastPaint = now;
        render();
        if (travellers)
          setText(
            read,
            `${travellers} journeys completed${removed.size ? "" : `; ${Math.round((100 * throughBea) / travellers)}% of them passed through Bea`}. The glow around each person grows with the traffic through them.`
          );
      }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf && flowing && visible) raf = requestAnimationFrame(tick);
    };
    watchVisibility(svg, (v) => {
      visible = v;
      kick();
    });
    btnFlow.addEventListener("click", () => {
      flowing = !flowing;
      btnFlow.setAttribute("aria-pressed", String(flowing));
      btnFlow.textContent = flowing ? "Stop the travellers" : "Send travellers";
      if (reduceMotion && flowing) {
        // Without motion: route a few thousand journeys at once and show where they went.
        for (let k = 0; k < 3000; k++) {
          const alive = nodes.filter((d) => !removed.has(d.i));
          const s = alive[Math.floor(Math.random() * alive.length)].i;
          const t = alive[Math.floor(Math.random() * alive.length)].i;
          const path = s !== t ? samplePath(s, t) : null;
          if (!path) continue;
          path.slice(1, -1).forEach((v) => counts[v]++);
          travellers++;
          if (path.includes(7)) throughBea++;
        }
        render();
        setText(read, `${travellers} journeys routed; ${Math.round((100 * throughBea) / travellers)}% passed through Bea.`);
        flowing = false;
        btnFlow.setAttribute("aria-pressed", "false");
        btnFlow.textContent = "Send travellers";
        return;
      }
      if (!flowing) {
        particles.length = 0;
        ov.clear();
      }
      kick();
    });
    btnRemove.addEventListener("click", () => {
      const closing = !removed.size;
      removed = closing ? new Set([7]) : new Set();
      btnRemove.setAttribute("aria-pressed", String(closing));
      btnRemove.textContent = closing ? "Reopen Bea" : "Close Bea";
      particles.length = 0;
      counts.fill(0);
      travellers = throughBea = 0;
      ov.clear();
      recompute();
      const stats = algo.pathStats(g);
      setText(
        read,
        closing
          ? `With Bea gone the network falls into ${algo.components(g).count} islands, and ${stats.unreachable} of the ${stats.pairs + stats.unreachable} remaining pairs can no longer reach each other at all. Hal and Rosa have lost nothing but their link to the other side.`
          : "Bea is back, and the two halves are joined again."
      );
      render();
    });
    btnReveal?.addEventListener("click", reveal);
    btnFlow.disabled = true;
    btnRemove.disabled = true;
    st.onResize(() => {
      place();
      render();
    });
    repaints.push(render);
    render();
    setText(read, "Before anything is computed: which person do you think lies on the most shortest paths between everyone else? Click them.");
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: eigenvector centrality by power iteration                   */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-ev");
    if (!svg) return;
    const canvas = $("#tbi2-ev-canvas");
    const chart = $("#tbi2-ev-chart");
    const read = $("#tbi2-ev-read");
    const btnStep = $("#tbi2-ev-step");
    const btnRun = $("#tbi2-ev-run");
    const btnReset = $("#tbi2-ev-reset");
    const predictBtns = [...document.querySelectorAll("[data-ev-guess]")];
    const st = stage(svg, { ratio: 0.55, minH: 280, maxH: 380, mobileRatio: 0.95, pad: 26 });
    const cs = stage(chart, { ratio: 0.22, minH: 130, maxH: 160, mobileRatio: 0.45, pad: 0 });
    const labels = ["Ada", "Bo", "Cy", "Di", "Ed", "Quinn", "Pat", "", "", "", "", "", ""];
    const pos = [
      [0.42, 0.18],
      [0.62, 0.3],
      [0.55, 0.62],
      [0.3, 0.62],
      [0.24, 0.32],
      [0.8, 0.6],
      [0.1, 0.5],
      [0.0, 0.18],
      [0.0, 0.85],
      [0.14, 0.95],
      [0.16, 0.04],
      [0.0, 0.52],
      [0.3, 0.98],
    ];
    const nodes = labels.map((label, i) => ({ i, label, x: pos[i][0] * 0.9 + 0.05, y: pos[i][1] }));
    const E = [];
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) E.push([i, j]);
    E.push([5, 0], [5, 1], [5, 2], [6, 4]);
    for (let l = 7; l < 13; l++) E.push([6, l]);
    const g = algo.build(nodes.length, E);
    let x = new Array(nodes.length).fill(1);
    let history = [x.slice()];
    let round = 0;
    let guess = null;
    let busy = false;
    const L = layersFor(svg);
    const ov = overlay(canvas, st);
    const C = layersFor(chart);

    const render = () => {
      const r = (d) => 6 + 16 * Math.sqrt(x[d.i]);
      const { nodeSel } = nodeLink(
        st,
        L,
        nodes,
        g.edges.map(([u, v]) => ({ u, v })),
        { r }
      );
      const top = x.indexOf(Math.max(...x));
      nodeSel
        .classed("is-source", (d) => d.i === 6)
        .classed("is-target", (d) => d.i === 5)
        .classed("is-top", (d) => d.i === top && round > 0)
        .attr("aria-label", (d) => `${d.label || "A friend of Pat"}: score ${x[d.i].toFixed(2)}`);
      nodeSel.select(".tbi2-node-label").text((d) => (d.label ? `${d.label} ${x[d.i].toFixed(2)}` : ""));
      // chart of scores per round
      const R = Math.max(12, history.length - 1);
      const sx = d3.scaleLinear([0, R], [40, cs.w - 70]);
      const sy = d3.scaleLinear([0, 1], [cs.h - 20, 8]);
      const series = nodes.map((d) => ({ d, pts: history.map((h, k) => [sx(k), sy(h[d.i])]) }));
      C.edges
        .selectAll("path")
        .data(series)
        .join("path")
        .attr("class", (s) => (s.d.i === 6 ? "tbi2-ev-line is-pat" : s.d.i === 5 ? "tbi2-ev-line is-quinn" : "tbi2-ev-line"))
        .attr("d", (s) => d3.line()(s.pts));
      C.nodes
        .selectAll("text.tbi2-ev-lab")
        .data(series.filter((s) => s.d.i === 5 || s.d.i === 6))
        .join("text")
        .attr("class", "tbi2-ev-lab")
        .attr("x", (s) => s.pts[s.pts.length - 1][0] + 6)
        .attr("y", (s) => s.pts[s.pts.length - 1][1])
        .attr("dy", "0.35em")
        .text((s) => s.d.label);
      C.back
        .selectAll("text.tbi2-ev-ax")
        .data(["1", "0", "round"])
        .join("text")
        .attr("class", "tbi2-ev-ax")
        .attr("x", (t, i) => (i < 2 ? 30 : 40))
        .attr("y", (t, i) => (i === 0 ? sy(1) : i === 1 ? sy(0) : cs.h - 4))
        .attr("text-anchor", (t, i) => (i < 2 ? "end" : "start"))
        .attr("dy", (t, i) => (i < 2 ? "0.35em" : 0))
        .text((t) => t);
      C.back
        .selectAll("line.tbi2-ev-base")
        .data([0])
        .join("line")
        .attr("class", "tbi2-ev-base")
        .attr("x1", sx(0))
        .attr("x2", sx(R))
        .attr("y1", sy(0))
        .attr("y2", sy(0));
      chart.setAttribute("aria-label", `Scores after each of ${round} rounds. Pat ${x[6].toFixed(2)}, Quinn ${x[5].toFixed(2)}.`);
    };

    // Draw the scores travelling along every edge, both ways, for one round.
    const pulse = (done) => {
      if (reduceMotion) return done();
      busy = true;
      const max = Math.max(...x);
      animate(
        700,
        (t) => {
          ov.clear();
          const ctx = ov.ctx;
          ctx.fillStyle = P.accent;
          const e = ease(t);
          g.edges.forEach(([u, v]) => {
            [
              [u, v],
              [v, u],
            ].forEach(([a, b]) => {
              const [x1, y1] = st.place(nodes[a].x, nodes[a].y);
              const [x2, y2] = st.place(nodes[b].x, nodes[b].y);
              ctx.globalAlpha = 0.85 * Math.sin(Math.PI * t);
              ctx.beginPath();
              ctx.arc(lerp(x1, x2, e), lerp(y1, y2, e), 1.5 + 4 * Math.sqrt(x[a] / max), 0, Math.PI * 2);
              ctx.fill();
            });
          });
          ctx.globalAlpha = 1;
        },
        () => {
          ov.clear();
          busy = false;
          done();
        }
      );
    };

    const say = () => {
      const prev = history[history.length - 2] || x;
      const change = Math.max(...x.map((v, i) => Math.abs(v - prev[i])));
      const leader = x[5] > x[6] ? "Quinn" : "Pat";
      let msg = `Round ${round}: Pat ${x[6].toFixed(2)}, Quinn ${x[5].toFixed(2)}. `;
      if (round === 1) msg += "After one round every score is just one plus the degree, so Pat, with seven friends, leads. ";
      else if (change < 0.002) msg += "The scores have stopped changing: this is the eigenvector. ";
      else msg += `Largest change since the last round: ${change.toFixed(3)}. `;
      if (guess && round > 1 && change < 0.002) msg += guess === leader ? "Your guess was right." : `You guessed ${guess}; it is ${leader}.`;
      setText(read, msg);
    };

    const step = (then) => {
      if (busy) return;
      pulse(() => {
        x = algo.eigenStep(g, x);
        round++;
        history.push(x.slice());
        render();
        say();
        then?.();
      });
    };
    btnStep.addEventListener("click", () => step());
    btnRun.addEventListener("click", () => {
      if (busy) return;
      let k = 0;
      const go = () => {
        const prev = history[history.length - 2] || [];
        const change = Math.max(...x.map((v, i) => Math.abs(v - (prev[i] ?? 0))));
        if (k++ > 40 || (round > 1 && change < 0.002)) return;
        step(go);
      };
      go();
    });
    btnReset.addEventListener("click", () => {
      if (busy) return;
      x = new Array(nodes.length).fill(1);
      history = [x.slice()];
      round = 0;
      render();
      setText(read, "Everyone starts with a score of 1.");
    });
    predictBtns.forEach((b) =>
      b.addEventListener("click", () => {
        guess = b.dataset.evGuess;
        pressGroup(predictBtns, b);
        setText(read, `You think ${guess} will end up more central. Now pass the scores on, one round at a time.`);
      })
    );
    st.onResize(render);
    cs.onResize(render);
    repaints.push(render);
    render();
    setText(read, "Everyone starts with a score of 1. Who do you think will end up more central, Pat or Quinn?");
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: Watts–Strogatz small worlds, computed live                  */
  /* ------------------------------------------------------------------ */
  (() => {
    const canvas = $("#tbi2-ws-ring");
    const plot = $("#tbi2-ws-plot");
    if (!canvas || !plot) return;
    const slider = $("#tbi2-ws-p");
    const pval = $("#tbi2-ws-pval");
    const read = $("#tbi2-ws-read");
    const N = 100;
    const K = 6;
    const ps = d3.range(0, 17).map((i) => 10 ** (-4 + i / 4)); // 1e-4 … 1
    const pOf = (v) => (v <= 0 ? 0 : 10 ** (-4 + (4 * v) / 100));
    let seed = 1;

    // A coupled draw: every edge gets one uniform number and a list of candidate targets, so raising p only ever
    // rewires more edges, and the picture changes smoothly as the slider moves.
    let draw = null;
    const newDraw = () => {
      const rand = algo.rng(seed * 7919);
      const lattice = [];
      for (let j = 1; j <= K / 2; j++) for (let i = 0; i < N; i++) lattice.push([i, (i + j) % N]);
      draw = lattice.map(([u, v]) => ({ u, v, r: rand(), cands: d3.range(12).map(() => Math.floor(rand() * N)) }));
    };
    const graphAt = (p) => {
      const has = new Set(draw.map((e) => algo.key(e.u, e.v)));
      return draw.map((e) => {
        if (e.r >= p) return [e.u, e.v, 1, false];
        const w = e.cands.find((c) => c !== e.u && !has.has(algo.key(e.u, c)));
        if (w == null) return [e.u, e.v, 1, false];
        has.delete(algo.key(e.u, e.v));
        has.add(algo.key(e.u, w));
        return [e.u, w, 1, true];
      });
    };
    const measure = (edges) => {
      const g = algo.build(N, edges);
      return { C: algo.averageClustering(g), L: algo.pathStats(g).avg };
    };
    newDraw();
    const base = measure(graphAt(0));

    // The averaged curve, computed in small slices so the page never stalls.
    const REAL = 20;
    const curve = ps.map((p) => ({ p, C: 0, L: 0, k: 0 }));
    let job = 0;
    const computeSlice = () => {
      const t0 = performance.now();
      while (job < ps.length * REAL && performance.now() - t0 < 12) {
        const i = job % ps.length;
        const rep = Math.floor(job / ps.length);
        const edges = algo.wattsStrogatz(N, K, ps[i], algo.rng(1000 + rep * 97 + i));
        const m = measure(edges);
        const c = curve[i];
        c.C += m.C;
        c.L += m.L;
        c.k++;
        job++;
      }
      drawPlot();
      if (job < ps.length * REAL) setTimeout(computeSlice, 16);
    };

    const ps2 = stage(plot, { ratio: 0.75, minH: 240, maxH: 320, mobileRatio: 0.75, pad: 0 });
    const P2 = layersFor(plot);
    let current = { p: 0, ...base };
    const drawPlot = () => {
      const m = { l: 40, r: 12, t: 14, b: 36 };
      const sx = d3.scaleLog([1e-4, 1], [m.l, ps2.w - m.r]);
      const sy = d3.scaleLinear([0, 1.02], [ps2.h - m.b, m.t]);
      const done = curve.filter((c) => c.k);
      const c0 = curve[0].k ? { C: curve[0].C / curve[0].k, L: curve[0].L / curve[0].k } : base;
      const pts = (key) => done.map((c) => [sx(c.p), sy(c[key] / c.k / c0[key])]);
      P2.back
        .selectAll("line.tbi2-ws-grid")
        .data([0, 0.5, 1])
        .join("line")
        .attr("class", "tbi2-ws-grid")
        .attr("x1", m.l)
        .attr("x2", ps2.w - m.r)
        .attr("y1", (v) => sy(v))
        .attr("y2", (v) => sy(v));
      P2.back
        .selectAll("text.tbi2-ws-ytick")
        .data([0, 0.5, 1])
        .join("text")
        .attr("class", "tbi2-ws-ytick")
        .attr("x", m.l - 6)
        .attr("y", (v) => sy(v))
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text((v) => v);
      P2.back
        .selectAll("text.tbi2-ws-xtick")
        .data([1e-4, 1e-3, 1e-2, 1e-1, 1])
        .join("text")
        .attr("class", "tbi2-ws-xtick")
        .attr("x", (v) => sx(v))
        .attr("y", ps2.h - m.b + 16)
        .attr("text-anchor", "middle")
        .text((v) => (v === 1 ? "1" : v === 0.1 ? "0.1" : v === 0.01 ? "0.01" : v === 0.001 ? "0.001" : "0.0001"));
      P2.back
        .selectAll("text.tbi2-ws-xlab")
        .data([0])
        .join("text")
        .attr("class", "tbi2-ws-xlab")
        .attr("x", (m.l + ps2.w) / 2)
        .attr("y", ps2.h - 4)
        .attr("text-anchor", "middle")
        .text("rewiring probability p (log scale)");
      P2.edges
        .selectAll("path.tbi2-ws-curve")
        .data(["C", "L"])
        .join("path")
        .attr("class", (k) => `tbi2-ws-curve ${k === "C" ? "is-c" : "is-l"}`)
        .attr("d", (k) => (done.length > 1 ? d3.line().curve(d3.curveMonotoneX)(pts(k)) : ""));
      P2.mid
        .selectAll("g.tbi2-ws-pts")
        .data(["C", "L"])
        .join("g")
        .attr("class", (k) => `tbi2-ws-pts ${k === "C" ? "is-c" : "is-l"}`)
        .selectAll("circle")
        .data((k) => pts(k))
        .join("circle")
        .attr("r", 2.6)
        .attr("cx", (p) => p[0])
        .attr("cy", (p) => p[1]);
      const lastC = pts("C");
      const lastL = pts("L");
      P2.nodes
        .selectAll("text.tbi2-ws-name")
        .data([
          ["clustering C(p)/C(0)", lastC[3]],
          ["path length L(p)/L(0)", lastL[Math.min(lastL.length - 1, 9)]],
        ])
        .join("text")
        .attr("class", (d, i) => `tbi2-ws-name ${i ? "is-l" : "is-c"}`)
        .attr("x", (d) => (d[1] ? d[1][0] : 0))
        .attr("y", (d, i) => (d[1] ? d[1][1] + (i ? -10 : 16) : -99))
        .attr("text-anchor", (d, i) => (i ? "start" : "middle"))
        .text((d) => d[0]);
      // the reader's own graph
      const xp = sx(Math.max(1e-4, current.p || 1e-4));
      P2.top
        .selectAll("line.tbi2-ws-now")
        .data([0])
        .join("line")
        .attr("class", "tbi2-ws-now")
        .attr("x1", xp)
        .attr("x2", xp)
        .attr("y1", m.t)
        .attr("y2", ps2.h - m.b);
      P2.top
        .selectAll("circle.tbi2-ws-me")
        .data([
          ["C", current.C / base.C],
          ["L", current.L / base.L],
        ])
        .join("circle")
        .attr("class", (d) => `tbi2-ws-me ${d[0] === "C" ? "is-c" : "is-l"}`)
        .attr("r", 6)
        .attr("cx", xp)
        .attr("cy", (d) => sy(Math.min(1.02, d[1])));
      plot.setAttribute(
        "aria-label",
        `Normalised clustering and path length against rewiring probability, averaged over ${REAL} random draws at each of ${ps.length} values of p${job < ps.length * REAL ? " (still computing)" : ""}. Your graph: clustering ${(current.C / base.C).toFixed(2)}, path length ${(current.L / base.L).toFixed(2)} of the lattice values.`
      );
    };

    let ctx = null;
    let cw = 0;
    const fit = () => {
      const w = Math.min(canvas.parentNode.clientWidth, 380);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${w}px`;
      const r = window.TBI.fitCanvas(canvas);
      ctx = r.ctx;
      cw = r.width;
    };
    const drawRing = (edges) => {
      if (!ctx) return;
      const R = cw / 2 - 12;
      const c = cw / 2;
      const at = (i) => [c + R * Math.cos((i / N) * 2 * Math.PI - Math.PI / 2), c + R * Math.sin((i / N) * 2 * Math.PI - Math.PI / 2)];
      ctx.clearRect(0, 0, cw, cw);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = P.ink2;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      edges.forEach(([u, v, , re]) => {
        if (re) return;
        const [x1, y1] = at(u);
        const [x2, y2] = at(v);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      });
      ctx.stroke();
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = P.hot;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      edges.forEach(([u, v, , re]) => {
        if (!re) return;
        const [x1, y1] = at(u);
        const [x2, y2] = at(v);
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(c + (x1 + x2 - 2 * c) * 0.25, c + (y1 + y2 - 2 * c) * 0.25, x2, y2);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = P.accent;
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i);
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const update = () => {
      const p = pOf(+slider.value);
      const edges = graphAt(p);
      const re = edges.filter((e) => e[3]).length;
      current = { p, ...measure(edges) };
      drawRing(edges);
      drawPlot();
      const pTxt = p === 0 ? "0" : p < 0.01 ? p.toExponential(1).replace("e-", " × 10<sup>−") + "</sup>" : p.toFixed(p < 0.1 ? 3 : 2);
      setText(pval, `p = ${pTxt}`);
      slider.setAttribute("aria-valuetext", `p = ${p === 0 ? 0 : p.toPrecision(2)}, ${re} edges rewired`);
      setText(
        read,
        `${re} of ${edges.length} edges rewired. Clustering is ${((100 * current.C) / base.C).toFixed(0)}% of the lattice’s (${current.C.toFixed(2)}); average path length is ${((100 * current.L) / base.L).toFixed(0)}% of it (${current.L.toFixed(2)} steps).`
      );
    };
    slider.addEventListener("input", update);
    $("#tbi2-ws-new")?.addEventListener("click", () => {
      seed++;
      newDraw();
      update();
    });
    fit();
    let resizeT = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        fit();
        update();
      }, 120);
    });
    ps2.onResize(drawPlot);
    repaints.push(update);
    update();
    onVisible(plot, () => setTimeout(computeSlice, 50), 0.05);
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: Girvan–Newman, cutting the busiest edges reveals communities */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-gn");
    if (!svg) return;
    const read = $("#tbi2-gn-read");
    const btnStep = $("#tbi2-gn-step");
    const st = stage(svg, { ratio: 0.55, minH: 300, maxH: 400, mobileRatio: 1.05, pad: 24 });
    const rand = algo.rng(77);
    const centres = [
      [0.18, 0.3],
      [0.82, 0.3],
      [0.5, 0.86],
    ];
    const nodes = [];
    centres.forEach(([cx, cy], c) => {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 2 * Math.PI + c;
        nodes.push({ i: nodes.length, c, label: "", x: cx + 0.15 * Math.cos(a), y: cy + 0.22 * Math.sin(a) });
      }
    });
    const start = [];
    for (let c = 0; c < 3; c++)
      for (let i = 0; i < 6; i++)
        for (let j = i + 1; j < 6; j++) if (rand() < 0.62 || j === i + 1) start.push([c * 6 + i, c * 6 + j]);
    start.push([1, 9], [4, 14], [10, 17], [5, 12]);
    let edges = start.slice();
    let stepNo = 0;
    let hotKey = null;
    let busy = false;
    const L = layersFor(svg);
    const render = () => {
      const g = algo.build(nodes.length, edges);
      const eb = algo.edgeBetweenness(g);
      const { comp, count } = algo.components(g);
      const maxEb = Math.max(...eb.values(), 1);
      const links = edges.map(([u, v]) => ({ u, v, b: eb.get(algo.key(u, v)) }));
      const { edgeSel, nodeSel } = nodeLink(st, L, nodes, links, { r: () => 9, edgeWidth: (l) => 0.8 + 6 * (l.b / maxEb) });
      edgeSel.classed("is-hot", (l) => algo.key(l.u, l.v) === hotKey);
      // colour groups by the planted community most common in each component, so colours stay put as edges go
      const major = d3.range(count).map((k) => {
        const tally = [0, 0, 0];
        nodes.forEach((d) => comp[d.i] === k && tally[d.c]++);
        return tally.indexOf(Math.max(...tally));
      });
      nodeSel.each(function (d) {
        this.querySelector(".tbi2-node-dot").style.fill = count > 1 ? P.groups[(count <= 3 ? major[comp[d.i]] : comp[d.i]) % P.groups.length] : "";
      });
      nodeSel.attr("tabindex", null).attr("role", null);
      svg.setAttribute("aria-label", `A network of ${nodes.length} nodes and ${edges.length} edges, now in ${count} connected piece${count > 1 ? "s" : ""}. Edge thickness shows edge betweenness.`);
      return { g, eb, count };
    };
    const step = () => {
      if (busy || !edges.length) return;
      const { eb } = render();
      let best = null;
      eb.forEach((v, k) => {
        if (!best || v > best[1]) best = [k, v];
      });
      hotKey = best[0];
      busy = true;
      render();
      setTimeout(
        () => {
          edges = edges.filter(([u, v]) => algo.key(u, v) !== best[0]);
          hotKey = null;
          stepNo++;
          busy = false;
          const { count } = render();
          setText(
            read,
            `Step ${stepNo}: removed the edge carrying the most shortest paths (${best[1].toFixed(1)} of them). ${count === 1 ? "Still one piece." : `Now ${count} pieces.`}${count === 3 && stepNo <= 6 ? " These are the three groups I planted when I made the network." : ""}`
          );
          if (!edges.length) btnStep.disabled = true;
        },
        reduceMotion ? 0 : 650
      );
    };
    btnStep?.addEventListener("click", step);
    $("#tbi2-gn-reset")?.addEventListener("click", () => {
      edges = start.slice();
      stepNo = 0;
      btnStep.disabled = false;
      render();
      setText(read, "Thick edges carry many shortest paths. Remove the busiest one, then recompute.");
    });
    st.onResize(render);
    repaints.push(render);
    render();
    setText(read, "Thick edges carry many shortest paths. Remove the busiest one, then recompute.");
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: one graph, many worlds                                      */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-gal");
    if (!svg) return;
    const panel = $("#tbi2-gal-panel");
    const worldBtns = [...document.querySelectorAll("[data-world]")];
    const measureBtns = [...document.querySelectorAll("[data-measure]")];
    const st = stage(svg, { ratio: 0.62, minH: 280, maxH: 380, mobileRatio: 0.95, pad: 26 });
    const pos = [
      [0.12, 0.2],
      [0.3, 0.06],
      [0.36, 0.38],
      [0.08, 0.55],
      [0.24, 0.62],
      [0.5, 0.55],
      [0.7, 0.5],
      [0.86, 0.22],
      [0.98, 0.45],
      [0.92, 0.78],
      [0.72, 0.92],
      [0.6, 0.18],
      [0.38, 0.9],
    ];
    const nodes = pos.map(([x, y], i) => ({ i, label: String.fromCharCode(65 + i), x, y }));
    const E = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 2],
      [2, 4],
      [3, 4],
      [2, 3],
      [4, 12],
      [2, 5],
      [5, 6],
      [6, 7],
      [6, 8],
      [6, 9],
      [6, 10],
      [6, 11],
      [7, 8],
      [5, 12],
    ];
    const g = algo.build(nodes.length, E);
    const k = algo.degree(g);
    const measures = {
      degree: { name: "Degree", values: k, digits: 0 },
      betweenness: { name: "Betweenness", values: algo.betweenness(g), digits: 2 },
      eigenvector: { name: "Eigenvector centrality", values: algo.eigenvector(g), digits: 2 },
      clustering: { name: "Clustering", values: algo.clustering(g).cc, digits: 2 },
    };
    const worlds = {
      friends: "friends",
      flights: "airports and routes",
      power: "substations and power lines",
      brain: "brain regions and the fibres between them",
      disease: "conditions, linked when they turn up together in the same people",
    };
    const text = {
      friends: {
        degree: "The most popular person: the one with the most friends. Popularity is easy to see from the inside, which is not true of the other measures.",
        betweenness:
          "The person who introduces two circles that would otherwise never meet. In Milgram’s letter-passing study, 16 of the 64 chains that reached their target got there through the same man, a clothing merchant in the target’s home town <span class=\"tbi2-cite\">(Travers and Milgram, 1969)</span>.",
        eigenvector: "Influence by association: someone whose friends are themselves well connected, even if they have only a handful of friends.",
        clustering: "How tight-knit a person’s circle is: whether their friends also know one another. Social networks tend to be full of triangles.",
      },
      flights: {
        degree: "The airport with the most direct routes, which is what airlines mean by a hub.",
        betweenness:
          "A connecting airport that a great many journeys have to pass through. In the worldwide air network the most connected cities are not necessarily the most central ones <span class=\"tbi2-cite\">(Guimerà and colleagues, 2005)</span>, which is exactly the gap between degree and betweenness.",
        eigenvector: "An airport whose routes lead to other big airports, so that its importance is borrowed from where you can go next.",
        clustering: "Whether an airport’s destinations also fly to each other, as they do in a dense regional network, rather than only through the hub.",
      },
      power: {
        degree: "A substation with many lines in and out.",
        betweenness:
          "A choke point between regions of the grid. If it fails, the load has to find another way round, and if there is none, part of the network is cut off. Networks with a few critical nodes can shrug off random failures yet be fragile to the loss of exactly those nodes <span class=\"tbi2-cite\">(Albert, Jeong and Barabási, 2000)</span>.",
        eigenvector: "Part of the grid’s well-connected core, rather than a long spur running out to the edge.",
        clustering:
          "Local redundancy: whether there is a triangle of lines around a substation. For the western United States grid Watts and Strogatz measured a clustering of 0.08, against 0.005 for a random graph of the same size <span class=\"tbi2-cite\">(Watts and Strogatz, 1998)</span>.",
      },
      brain: {
        degree: "A region wired directly to many others; in connectome studies such regions are called hubs.",
        betweenness: "A relay: a region that sits on many of the shortest routes between others.",
        eigenvector: "A region inside the densely interconnected core, connected to other well-connected regions.",
        clustering:
          "Local wiring. In the nervous system of the worm <em>C. elegans</em>, 282 neurons in Watts and Strogatz’s version <span class=\"tbi2-cite\">(mapped by White and colleagues, 1986)</span>, clustering is 0.28 against 0.05 for a comparable random graph <span class=\"tbi2-cite\">(Watts and Strogatz, 1998)</span>.",
      },
      disease: {
        degree:
          "A condition that co-occurs, more often than chance would suggest, with many others. In a network built from the records of more than 30 million patients, people diagnosed with more highly connected diseases tended to die sooner <span class=\"tbi2-cite\">(Hidalgo and colleagues, 2009)</span>.",
        betweenness: "A condition that links two groups of conditions which otherwise rarely meet in the same person. This is the measure the study in Part 3 leans on most.",
        eigenvector: "A condition embedded among other highly connected conditions, at the centre of a dense knot of comorbidity.",
        clustering: "Whether the conditions that come with one condition also come with each other: triangles of conditions.",
      },
    };
    let world = "friends";
    let measure = "betweenness";
    const L = layersFor(svg);
    const render = () => {
      const m = measures[measure];
      const vals = m.values;
      const max = Math.max(...vals, 1e-9);
      const top = vals.indexOf(max);
      const { nodeSel } = nodeLink(
        st,
        L,
        nodes,
        g.edges.map(([u, v]) => ({ u, v })),
        { r: (d) => 6 + 15 * Math.sqrt(vals[d.i] / max), labelPos: "below" }
      );
      nodeSel
        .classed("is-top", (d) => vals[d.i] === max)
        .attr("tabindex", null)
        .attr("role", null);
      nodeSel.select(".tbi2-node-label").text((d) => (vals[d.i] === max ? `${d.label} ${vals[d.i].toFixed(m.digits)}` : d.label));
      svg.setAttribute(
        "aria-label",
        `The same 13-node network, node size showing ${m.name.toLowerCase()}. Highest: ${nodes[top].label} with ${max.toFixed(m.digits)}.`
      );
      panel.innerHTML = `<div class="tbi-kicker">${m.name}, when the nodes are ${worlds[world]}</div><p>${text[world][measure]}</p>`;
    };
    worldBtns.forEach((b) =>
      b.addEventListener("click", () => {
        world = b.dataset.world;
        pressGroup(worldBtns, b);
        render();
      })
    );
    measureBtns.forEach((b) =>
      b.addEventListener("click", () => {
        measure = b.dataset.measure;
        pressGroup(measureBtns, b);
        render();
      })
    );
    st.onResize(render);
    repaints.push(render);
    render();
  })();

  /* ------------------------------------------------------------------ */
  /* Figure: from people to a disease network (invented people)          */
  /* ------------------------------------------------------------------ */
  (() => {
    const svg = $("#tbi2-pd-net");
    const host = $("#tbi2-pd-people");
    if (!svg || !host) return;
    const read = $("#tbi2-pd-read");
    const st = stage(svg, { ratio: 0.85, minH: 300, maxH: 400, mobileRatio: 0.95, pad: 46 });
    const conds = [
      { name: "Depression", v: "--tbi-psych" },
      { name: "Anxiety", v: "--tbi-psych" },
      { name: "PTSD", v: "--tbi-psych" },
      { name: "Sleep disorder", v: "--tbi-neuro" },
      { name: "Chronic pain", v: "--tbi-musc" },
      { name: "Hypertension", v: "--tbi-cardio" },
      { name: "High cholesterol", v: "--tbi-metab" },
      { name: "Alcohol misuse", v: "--tbi-subst" },
    ];
    const people = [
      [0, 1, 3],
      [5, 6],
      [0, 2, 1, 7],
      [4, 0, 3],
      [5, 6, 3],
      [1, 2],
      [7, 0],
      [4, 5],
      [0, 1],
      [],
    ];
    const on = new Array(people.length).fill(false);
    const nodes = conds.map((c, i) => ({
      i,
      label: c.name,
      x: 0.5 + 0.5 * Math.cos((i / conds.length) * 2 * Math.PI - Math.PI / 2),
      y: 0.5 + 0.5 * Math.sin((i / conds.length) * 2 * Math.PI - Math.PI / 2),
    }));
    people.forEach((cs, p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tbi2-person";
      b.setAttribute("aria-pressed", "false");
      b.innerHTML = `<span class="tbi2-person-name">Person ${p + 1}</span>${
        cs.length ? cs.map((c) => `<span class="tbi2-chip" style="--c: var(${conds[c].v})">${conds[c].name}</span>`).join("") : '<span class="tbi2-chip is-none">none recorded</span>'
      }`;
      b.addEventListener("click", () => toggle(p));
      host.appendChild(b);
    });
    const buttons = [...host.querySelectorAll(".tbi2-person")];
    const L = layersFor(svg);
    let flash = null;
    const render = () => {
      const w = new Map();
      const count = new Array(conds.length).fill(0);
      people.forEach((cs, p) => {
        if (!on[p]) return;
        cs.forEach((c) => count[c]++);
        for (let i = 0; i < cs.length; i++)
          for (let j = i + 1; j < cs.length; j++) {
            const kk = algo.key(cs[i], cs[j]);
            w.set(kk, (w.get(kk) || 0) + 1);
          }
      });
      const links = [...w.entries()].map(([kk, c]) => ({ u: Math.floor(kk / 65536), v: kk % 65536, w: c }));
      const { edgeSel, nodeSel } = nodeLink(st, L, nodes, links, { r: (d) => 5 + 4 * count[d.i], edgeWidth: (l) => 1 + 2.4 * (l.w - 1) + 0.6 });
      edgeSel.classed("is-hot", (l) => flash != null && people[flash].includes(l.u) && people[flash].includes(l.v));
      nodeSel.attr("tabindex", null).attr("role", null);
      nodeSel.each(function (d) {
        const dot = this.querySelector(".tbi2-node-dot");
        dot.style.fill = cssVar(conds[d.i].v);
        dot.style.opacity = count[d.i] ? 1 : 0.25;
        const lab = this.querySelector(".tbi2-node-label");
        const [x] = st.place(d.x, d.y);
        lab.setAttribute("text-anchor", x < st.w * 0.3 ? "start" : x > st.w * 0.7 ? "end" : "middle");
      });
      nodeSel.select(".tbi2-node-label").text((d) => `${d.label}${count[d.i] ? ` (${count[d.i]})` : ""}`);
      buttons.forEach((b, p) => b.setAttribute("aria-pressed", String(on[p])));
      const n = on.filter(Boolean).length;
      let best = null;
      w.forEach((c, kk) => {
        if (!best || c > best[1]) best = [kk, c];
      });
      svg.setAttribute("aria-label", `Disease network built from ${n} people: ${links.map((l) => `${conds[l.u].name}–${conds[l.v].name} ${l.w}`).join(", ") || "no edges yet"}.`);
      if (!n) setText(read, "No one added yet: eight conditions, no edges.");
      else
        setText(
          read,
          `${n} ${n === 1 ? "person" : "people"} added, ${links.length} edges.` +
            (best ? ` The thickest edge, ${conds[Math.floor(best[0] / 65536)].name}–${conds[best[0] % 65536].name}, means ${best[1]} of them have both.` : "") +
            (on[9] ? " Person 10 added nothing to the drawing, though, as Part 3 will show, people with none of the conditions matter to the statistics." : "")
        );
    };
    const toggle = (p) => {
      on[p] = !on[p];
      flash = on[p] && people[p].length > 1 ? p : null;
      render();
    };
    $("#tbi2-pd-next")?.addEventListener("click", () => {
      const p = on.indexOf(false);
      if (p >= 0) toggle(p);
    });
    $("#tbi2-pd-all")?.addEventListener("click", () => {
      on.fill(true);
      flash = null;
      render();
    });
    $("#tbi2-pd-reset")?.addEventListener("click", () => {
      on.fill(false);
      flash = null;
      render();
    });
    st.onResize(render);
    repaints.push(render);
    render();
  })();
})();
