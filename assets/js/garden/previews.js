/* Garden: hover previews for inline wiki links.
 * Fetches graph.json once, then shows one reusable card with title + excerpt. */
(function () {
  "use strict";

  var page = document.querySelector(".gd-page");
  if (!page || !window.matchMedia) return;

  // Embedded videos loop silently, like animations. Under reduced motion they start
  // paused; clicking one (or Enter/Space when focused) pauses or plays it.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  page.querySelectorAll("video.gd-embed-video").forEach(function (video) {
    if (reduceMotion) {
      video.removeAttribute("autoplay");
      video.pause();
    }
    video.setAttribute("tabindex", "0");
    video.setAttribute("title", "Click to pause or play");
    function toggle() {
      if (video.paused) video.play();
      else video.pause();
    }
    video.addEventListener("click", toggle);
    video.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var graphUrl = page.getAttribute("data-graph-url");
  var SHOW_DELAY = 250;
  var HIDE_DELAY = 150;
  var GAP = 8;
  var MARGIN = 12;

  var nodesPromise = null;
  var card = null;
  var titleEl = null;
  var textEl = null;
  var current = null; // link the card is attached to
  var showTimer = 0;
  var hideTimer = 0;

  // Fetch graph.json once and index nodes by id.
  function loadNodes() {
    if (!nodesPromise) {
      nodesPromise = fetch(graphUrl)
        .then(function (r) {
          return r.json();
        })
        .then(function (g) {
          var map = {};
          g.nodes.forEach(function (n) {
            map[n.id] = n;
          });
          return map;
        })
        .catch(function () {
          return {};
        });
    }
    return nodesPromise;
  }

  function ensureCard() {
    if (card) return;
    card = document.createElement("div");
    card.className = "gd-preview";
    card.id = "gd-preview";
    card.setAttribute("role", "tooltip");
    card.hidden = true;
    titleEl = document.createElement("p");
    titleEl.className = "gd-preview-title";
    textEl = document.createElement("p");
    textEl.className = "gd-preview-text";
    card.appendChild(titleEl);
    card.appendChild(textEl);
    // Keep the card open while the pointer is over it.
    card.addEventListener("mouseenter", function () {
      clearTimeout(hideTimer);
    });
    card.addEventListener("mouseleave", scheduleHide);
    document.body.appendChild(card);
  }

  // Place below the link, flip above when there is no room, clamp to viewport.
  function position(link) {
    var r = link.getBoundingClientRect();
    var w = card.offsetWidth;
    var h = card.offsetHeight;
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    var top = r.bottom + GAP;
    var below = true;
    if (top + h > vh - MARGIN && r.top - GAP - h >= MARGIN) {
      top = r.top - GAP - h;
      below = false;
    }
    top = Math.max(MARGIN, Math.min(top, vh - h - MARGIN));
    var left = Math.max(MARGIN, Math.min(r.left, vw - w - MARGIN));
    card.style.left = left + window.scrollX + "px";
    card.style.top = top + window.scrollY + "px";
    card.setAttribute("data-side", below ? "below" : "above");
  }

  function show(link) {
    loadNodes().then(function (map) {
      if (current !== link) return; // intent changed while loading
      var node = map[link.getAttribute("data-garden-id")];
      if (!node || node.missing) return;
      ensureCard();
      titleEl.textContent = node.title;
      textEl.textContent = node.excerpt || "";
      textEl.hidden = !node.excerpt;
      card.hidden = false;
      link.setAttribute("aria-describedby", card.id);
      position(link);
    });
  }

  function hide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    if (current) current.removeAttribute("aria-describedby");
    current = null;
    if (card) card.hidden = true;
  }

  function scheduleHide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, HIDE_DELAY);
  }

  function intent(link) {
    clearTimeout(hideTimer);
    if (current === link) return;
    if (current) current.removeAttribute("aria-describedby");
    current = link;
    clearTimeout(showTimer);
    showTimer = setTimeout(function () {
      show(link);
    }, SHOW_DELAY);
  }

  function linkFrom(e) {
    var t = e.target.closest ? e.target.closest("a.gd-link[data-garden-id]") : null;
    return t && t.closest("d-article") ? t : null;
  }

  // Delegated listeners so links added later also work.
  document.addEventListener("mouseover", function (e) {
    var l = linkFrom(e);
    if (l) intent(l);
  });
  document.addEventListener("mouseout", function (e) {
    if (linkFrom(e)) scheduleHide();
  });
  document.addEventListener("focusin", function (e) {
    var l = linkFrom(e);
    if (l) intent(l);
  });
  document.addEventListener("focusout", function (e) {
    if (linkFrom(e)) scheduleHide();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && card && !card.hidden) hide();
  });
  window.addEventListener("scroll", scheduleHide, { passive: true });
})();
