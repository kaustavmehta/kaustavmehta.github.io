/* Garden: on-demand interactive graph.
 * Nothing runs until a [data-garden-explore] button is clicked. Then graph.json
 * is fetched and shown in a modal <dialog> with a pan/zoom SVG.
 * Class names are written as complete literals (PurgeCSS scans this file). */
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var BOX_W = 1000;
  var BOX_H = 600;
  var MIN_ZOOM = 0.7; // relative to the "fit everything" scale
  var MAX_ZOOM = 10;
  var LABEL_ZOOM = 1.6; // show every label past this relative zoom
  var DRAG_SLOP = 5;

  var reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  var graphs = {}; // url -> promise
  var dialog = null;
  var stage, svg, edgeLayer, nodeLayer, resetBtn, closeBtn;
  var opener = null;
  var builtKey = null;

  // View state: screen = data * k + (tx, ty)
  var view = { k: 1, tx: 0, ty: 0 };
  var baseK = 1; // scale that fits the whole 1000x600 box
  var W = 0;
  var H = 0;
  var nodes = []; // { data, g, label, r, nbrs }
  var edges = []; // { a, b, line }
  var byId = {};
  var currentId = null;
  var hoverNode = null;
  var animFrame = 0;
  var dragged = false;

  function svgEl(tag, cls, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (cls) e.setAttribute("class", cls);
    for (var a in attrs || {}) e.setAttribute(a, attrs[a]);
    return e;
  }

  function button(cls, label, text) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.setAttribute("aria-label", label);
    b.textContent = text;
    return b;
  }

  function loadGraph(url) {
    if (!graphs[url]) {
      graphs[url] = fetch(url).then(function (r) {
        if (!r.ok) throw new Error("graph.json " + r.status);
        return r.json();
      });
      graphs[url].catch(function () {
        delete graphs[url]; // allow a retry
      });
    }
    return graphs[url];
  }

  // ---- dialog scaffold (created once) -------------------------------------

  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement("dialog");
    dialog.className = "gd-explorer";
    dialog.setAttribute("aria-label", "Garden graph");

    var bar = document.createElement("div");
    bar.className = "gd-explorer-bar";
    var title = document.createElement("h2");
    title.className = "gd-explorer-title";
    title.textContent = "Garden";
    var tools = document.createElement("div");
    tools.className = "gd-explorer-tools";
    var zin = button("gd-explorer-btn", "Zoom in", "+");
    var zout = button("gd-explorer-btn", "Zoom out", "−");
    resetBtn = button("gd-explorer-btn gd-explorer-reset", "Reset view", "Reset");
    var close = button("gd-explorer-btn gd-explorer-close", "Close", "×");
    closeBtn = close;
    [zin, zout, resetBtn, close].forEach(function (b) {
      tools.appendChild(b);
    });
    bar.appendChild(title);
    bar.appendChild(tools);

    stage = document.createElement("div");
    stage.className = "gd-explorer-stage";
    svg = svgEl("svg", "gd-explorer-svg", { role: "group", "aria-label": "Notes and their links" });
    edgeLayer = svgEl("g", "gd-explorer-edges");
    nodeLayer = svgEl("g", "gd-explorer-nodes");
    svg.appendChild(edgeLayer);
    svg.appendChild(nodeLayer);
    stage.appendChild(svg);

    dialog.appendChild(bar);
    dialog.appendChild(stage);
    document.body.appendChild(dialog);

    close.addEventListener("click", function () {
      dialog.close();
    });
    zin.addEventListener("click", function () {
      zoomBy(1.5);
    });
    zout.addEventListener("click", function () {
      zoomBy(1 / 1.5);
    });
    resetBtn.addEventListener("click", function () {
      animateTo(initialView());
    });
    // Click on the backdrop (the dialog element itself) closes.
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      cancelAnim();
      document.documentElement.classList.remove("gd-explorer-open");
      if (opener && document.contains(opener)) opener.focus();
    });
    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", function () {
      if (dialog.open) measure(true);
    });
  }

  // ---- building the graph --------------------------------------------------

  function build(graph, cur) {
    edgeLayer.textContent = "";
    nodeLayer.textContent = "";
    nodes = [];
    edges = [];
    byId = {};
    hoverNode = null;
    currentId = cur;

    graph.nodes.forEach(function (d) {
      var n = { data: d, nbrs: {}, r: 4 };
      var isCur = d.id === cur;
      var cls = "gd-explorer-node";
      if (isCur) cls = "gd-explorer-node is-current";
      else if (d.missing) cls = "gd-explorer-node is-missing";
      n.isCur = isCur;
      n.g = svgEl("g", cls);
      if (!d.missing) {
        n.g.setAttribute("tabindex", "0");
        n.g.setAttribute("role", "link");
      }
      n.g.setAttribute("aria-label", d.missing ? d.title + " (not written yet)" : d.title);
      n.r = isCur ? 7 : 4.5;
      n.g.appendChild(svgEl("circle", "gd-explorer-hit", { r: 14 }));
      n.g.appendChild(svgEl("circle", "gd-explorer-dot", { r: n.r }));
      n.label = svgEl("text", "gd-explorer-label", { x: n.r + 5, y: 4 });
      n.label.textContent = d.title;
      n.g.appendChild(n.label);
      byId[d.id] = n;
      nodes.push(n);
    });

    graph.edges.forEach(function (e) {
      var a = byId[e.source];
      var b = byId[e.target];
      if (!a || !b) return;
      a.nbrs[b.data.id] = true;
      b.nbrs[a.data.id] = true;
      var line = svgEl("line", "gd-explorer-edge", {
        x1: a.data.x,
        y1: a.data.y,
        x2: b.data.x,
        y2: b.data.y,
      });
      edges.push({ a: a, b: b, line: line });
      edgeLayer.appendChild(line);
    });

    var curNode = cur ? byId[cur] : null;
    nodes.forEach(function (n) {
      nodeLayer.appendChild(n.g);
      if (curNode && curNode.nbrs[n.data.id]) n.g.classList.add("is-near");
      if (n.data.missing) return;
      n.g.addEventListener("click", function () {
        if (!dragged) window.location.href = n.data.url;
      });
      n.g.addEventListener("keydown", function (e) {
        if (e.key === "Enter") window.location.href = n.data.url;
      });
    });
    nodes.forEach(function (n) {
      n.g.addEventListener("mouseenter", function () {
        highlight(n);
      });
      n.g.addEventListener("mouseleave", function () {
        highlight(null);
      });
      n.g.addEventListener("focus", function () {
        highlight(n);
      });
      n.g.addEventListener("blur", function () {
        highlight(null);
      });
    });
  }

  // ---- highlight + labels ----------------------------------------------------

  function highlight(n) {
    hoverNode = n;
    var lit = n ? Object.assign({}, n.nbrs) : null;
    if (n) lit[n.data.id] = true;
    svg.classList.toggle("is-focused", !!n);
    nodes.forEach(function (m) {
      var on = !!lit && !!lit[m.data.id];
      m.g.classList.toggle("is-lit", on);
      m.g.classList.toggle("is-hover", !!n && m === n);
      m.g.classList.toggle("is-dim", !!lit && !on);
    });
    edges.forEach(function (e) {
      var on = !!n && (e.a === n || e.b === n);
      e.line.classList.toggle("is-lit", on);
      e.line.classList.toggle("is-dim", !!n && !on);
    });
    updateLabels();
  }

  function updateLabels() {
    var zoomedIn = view.k / baseK > LABEL_ZOOM;
    var cur = currentId ? byId[currentId] : null;
    nodes.forEach(function (n) {
      var show =
        zoomedIn || n.isCur || (cur && cur.nbrs[n.data.id]) || (hoverNode && (hoverNode === n || hoverNode.nbrs[n.data.id])) || n.data.degree >= 2;
      n.label.classList.toggle("is-shown", !!show);
    });
  }

  // ---- view transform ---------------------------------------------------------

  function apply() {
    edgeLayer.setAttribute("transform", "translate(" + view.tx + " " + view.ty + ") scale(" + view.k + ")");
    nodes.forEach(function (n) {
      // Flip the label to the left of the dot near the right edge.
      var flip = n.data.x * view.k + view.tx > W - 130;
      if (flip !== n.flip) {
        n.flip = flip;
        n.label.setAttribute("x", flip ? -(n.r + 5) : n.r + 5);
        n.label.setAttribute("text-anchor", flip ? "end" : "start");
      }
      n.g.setAttribute("transform", "translate(" + (n.data.x * view.k + view.tx) + " " + (n.data.y * view.k + view.ty) + ")");
    });
    updateLabels();
  }

  // View that frames a data-space rectangle, never zooming in past maxK.
  function frame(x0, y0, x1, y1, pad, maxRel) {
    var w = Math.max(x1 - x0, 1) + pad * 2;
    var h = Math.max(y1 - y0, 1) + pad * 2;
    var k = Math.min(W / w, H / h, baseK * maxRel);
    return { k: k, tx: W / 2 - ((x0 + x1) / 2) * k, ty: H / 2 - ((y0 + y1) / 2) * k };
  }

  function initialView() {
    var cur = currentId ? byId[currentId] : null;
    if (cur) {
      var set = [cur].concat(
        Object.keys(cur.nbrs).map(function (id) {
          return byId[id];
        })
      );
      if (set.length > 1) {
        return frame(
          Math.min.apply(
            null,
            set.map(function (n) {
              return n.data.x;
            })
          ),
          Math.min.apply(
            null,
            set.map(function (n) {
              return n.data.y;
            })
          ),
          Math.max.apply(
            null,
            set.map(function (n) {
              return n.data.x;
            })
          ),
          Math.max.apply(
            null,
            set.map(function (n) {
              return n.data.y;
            })
          ),
          70,
          3
        );
      }
    }
    // Fit every node (not the whole box), so tall phone screens are used well.
    var xs = nodes.map(function (n) {
      return n.data.x;
    });
    var ys = nodes.map(function (n) {
      return n.data.y;
    });
    if (!xs.length) return frame(0, 0, BOX_W, BOX_H, 0, 1);
    return frame(Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys), 50, 2.5);
  }

  function measure(keep) {
    var r = stage.getBoundingClientRect();
    W = r.width;
    H = r.height;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    baseK = Math.min(W / BOX_W, H / BOX_H);
    if (!keep) {
      view = initialView();
      apply();
    }
  }

  function clampK(k) {
    return Math.max(baseK * MIN_ZOOM, Math.min(baseK * MAX_ZOOM, k));
  }

  // Zoom to factor f keeping screen point (px, py) fixed.
  function zoomAt(px, py, f, from) {
    var v = from || view;
    var k = clampK(v.k * f);
    return { k: k, tx: px - (px - v.tx) * (k / v.k), ty: py - (py - v.ty) * (k / v.k) };
  }

  function zoomBy(f) {
    animateTo(zoomAt(W / 2, H / 2, f));
  }

  function cancelAnim() {
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = 0;
  }

  function animateTo(t) {
    cancelAnim();
    if (reduceMotion.matches) {
      view = t;
      apply();
      return;
    }
    var s = { k: view.k, tx: view.tx, ty: view.ty };
    var t0 = performance.now();
    function step(now) {
      var p = Math.min((now - t0) / 260, 1);
      var e = 1 - Math.pow(1 - p, 3);
      // Interpolate k geometrically so zoom feels even.
      var k = s.k * Math.pow(t.k / s.k, e);
      view = { k: k, tx: s.tx + (t.tx - s.tx) * e, ty: s.ty + (t.ty - s.ty) * e };
      apply();
      animFrame = p < 1 ? requestAnimationFrame(step) : 0;
    }
    animFrame = requestAnimationFrame(step);
  }

  // ---- input -------------------------------------------------------------------

  function local(e) {
    var r = svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onWheel(e) {
    e.preventDefault();
    cancelAnim();
    var p = local(e);
    var f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015));
    view = zoomAt(p.x, p.y, f);
    apply();
  }

  var pointers = {}; // pointerId -> {x, y}
  var gesture = null;

  function count() {
    return Object.keys(pointers).length;
  }

  function startGesture() {
    var ids = Object.keys(pointers);
    var a = pointers[ids[0]];
    var b = pointers[ids[1]];
    gesture = {
      v: { k: view.k, tx: view.tx, ty: view.ty },
      cx: b ? (a.x + b.x) / 2 : a.x,
      cy: b ? (a.y + b.y) / 2 : a.y,
      d: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
    };
  }

  function onPointerDown(e) {
    cancelAnim();
    pointers[e.pointerId] = local(e);
    if (count() === 1) dragged = false;
    startGesture();
  }

  function onPointerMove(e) {
    if (!pointers[e.pointerId]) return;
    pointers[e.pointerId] = local(e);
    var ids = Object.keys(pointers);
    var a = pointers[ids[0]];
    var b = pointers[ids[1]];
    var cx = b ? (a.x + b.x) / 2 : a.x;
    var cy = b ? (a.y + b.y) / 2 : a.y;
    if (!dragged && Math.hypot(cx - gesture.cx, cy - gesture.cy) < DRAG_SLOP && !b) return;
    if (!dragged) {
      dragged = true;
      try {
        svg.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
      svg.classList.add("is-dragging");
    }
    var f = b && gesture.d ? Math.hypot(a.x - b.x, a.y - b.y) / gesture.d : 1;
    var k = clampK(gesture.v.k * f);
    // Keep the data point under the gesture centre under the current centre.
    var dx = (gesture.cx - gesture.v.tx) / gesture.v.k;
    var dy = (gesture.cy - gesture.v.ty) / gesture.v.k;
    view = { k: k, tx: cx - dx * k, ty: cy - dy * k };
    apply();
  }

  function onPointerUp(e) {
    delete pointers[e.pointerId];
    if (count() > 0) startGesture();
    else {
      svg.classList.remove("is-dragging");
      // Let the click that follows a drag be ignored, then reset.
      setTimeout(function () {
        dragged = false;
      }, 0);
    }
  }

  // ---- opening -------------------------------------------------------------------

  function open(btn) {
    var host = btn.closest("[data-graph-url]") || document.querySelector(".gd-page, .gd-index");
    var url = host && host.getAttribute("data-graph-url");
    if (!url) return;
    var page = document.querySelector(".gd-page");
    var cur = page ? page.getAttribute("data-garden-id") : null;
    opener = btn;
    btn.setAttribute("aria-busy", "true");
    loadGraph(url)
      .then(
        function (graph) {
          show(graph, url, cur);
        },
        function () {
          // The graph didn't load: fall back to the index, unless we are on it.
          var index = url.replace(/graph\.json$/, "");
          if (window.location.pathname !== new URL(index, window.location.href).pathname) {
            window.location.href = index;
          }
        }
      )
      .then(function () {
        btn.removeAttribute("aria-busy");
      });
  }

  function show(graph, url, cur) {
    ensureDialog();
    dialog.showModal();
    document.documentElement.classList.add("gd-explorer-open");
    var key = url + "|" + cur;
    measure(true);
    if (key !== builtKey) {
      build(graph, cur);
      builtKey = key;
    }
    view = initialView();
    apply();
    highlight(null);
    closeBtn.focus({ preventScroll: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-garden-explore]").forEach(function (b) {
      b.addEventListener("click", function () {
        open(b);
      });
    });
  });
})();
