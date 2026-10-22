// Atmospheric Clarity — site-wide motion and small interaction helpers.
// Loaded with `defer` on every page. Each feature is independent and no-ops
// when its elements are absent.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  // ---- Navbar height, so sticky elements pin just below the fixed navbar ----
  var navbar = document.getElementById("navbar");
  function syncNavbarHeight() {
    if (navbar) root.style.setProperty("--atmo-navbar-height", navbar.offsetHeight + "px");
  }
  syncNavbarHeight();
  window.addEventListener("resize", syncNavbarHeight, { passive: true });

  // ---- Scroll reveal ----
  // Content already on screen is revealed at once (with a short stagger);
  // the rest fades in as it scrolls into view.
  var reveals = document.querySelectorAll(".atmo-reveal");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) {
        el.classList.add("revealed");
      });
    } else {
      var batch = 0;
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty("--atmo-delay", Math.min(batch++, 4) * 80 + "ms");
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          });
          batch = 0;
        },
        { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
      );
      reveals.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  // ---- Ambient glow parallax ----
  // --atmo-parallax-y is registered as non-inherited (_animations.scss), so
  // updating it restyles only the host element, not its whole subtree.
  var glowHosts = document.querySelectorAll(".about, .atmo-page-hero");
  if (glowHosts.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var y = window.scrollY;
      glowHosts.forEach(function (el) {
        el.style.setProperty("--atmo-parallax-y", Math.min(y, 1200) * 0.12 + "px");
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  // ---- Looping clips (GIF replacements) ----
  // Play only while visible; under reduced motion, show the poster with controls.
  var clips = document.querySelectorAll("video[data-autoplay]");
  if (clips.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      clips.forEach(function (v) {
        v.controls = true;
      });
    } else {
      var clipObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var v = entry.target;
            if (entry.isIntersecting) {
              var p = v.play();
              if (p && p.catch)
                p.catch(function () {
                  v.controls = true;
                });
            } else {
              v.pause();
            }
          });
        },
        { threshold: 0.25 }
      );
      clips.forEach(function (v) {
        clipObserver.observe(v);
      });
    }
  }

  // ---- CV tooltips ----
  // Keep each tooltip inside the viewport, and let touch users tap to toggle.
  var pills = document.querySelectorAll(".has-tooltip");
  if (pills.length) {
    var place = function (pill) {
      var tip = pill.querySelector(".atmo-cv-tooltip");
      if (!tip) return;
      // Work from layout boxes rather than the tooltip's (transitioning) transform:
      // the tooltip is centred on the pill, so its resting edges follow from the widths.
      var pr = pill.getBoundingClientRect();
      var w = tip.offsetWidth;
      var left = pr.left + pr.width / 2 - w / 2;
      var margin = 12;
      var vw = root.clientWidth;
      var shift = 0;
      if (left < margin) shift = margin - left;
      else if (left + w > vw - margin) shift = vw - margin - (left + w);
      tip.style.setProperty("--atmo-tip-shift", shift + "px");
    };
    var closeAll = function (except) {
      pills.forEach(function (p) {
        if (p !== except) p.classList.remove("is-open");
      });
    };
    pills.forEach(function (pill) {
      pill.addEventListener("pointerenter", function () {
        place(pill);
      });
      pill.addEventListener("focus", function () {
        place(pill);
      });
      pill.addEventListener("click", function (e) {
        e.stopPropagation();
        place(pill);
        var open = !pill.classList.contains("is-open");
        closeAll(pill);
        pill.classList.toggle("is-open", open);
      });
    });
    document.addEventListener("click", function () {
      closeAll();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAll();
        if (document.activeElement && document.activeElement.classList.contains("has-tooltip")) {
          document.activeElement.blur();
        }
      }
    });
  }
})();
