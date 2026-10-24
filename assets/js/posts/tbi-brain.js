// Lightweight loader for the interactive 3D brain (TBI series, part 1).
// It reserves space and shows a placeholder for every `.tbi-brain` element, then imports the WebGL
// code (three.js + tbi-brain-core.js, ~700 kB) and the anatomy data only when a figure approaches
// the viewport. Each element initialises independently; see tbi-brain-core.js for data-* options.
const els = () => Array.from(document.querySelectorAll(".tbi-brain"));
let corePromise = null;
const loadCore = () => (corePromise = corePromise || import("./tbi-brain-core.js"));

function placeholder(el) {
  if (el.__tbiBrainPending || el.__tbiBrain) return;
  el.__tbiBrainPending = true;
  el.classList.add("tbi-brain-root");
  if (!el.firstElementChild) {
    const stage = document.createElement("div");
    stage.className = "tbi-brain-stage tbi-brain-placeholder";
    const msg = document.createElement("div");
    msg.className = "tbi-brain-loading";
    msg.textContent = "Loading the brain model…";
    stage.append(msg);
    const main = document.createElement("div");
    main.className = "tbi-brain-main";
    main.append(stage);
    el.append(main);
  }
}

function start(el) {
  loadCore()
    .then((core) => core.mount(el))
    .catch(() => {
      const msg = el.querySelector(".tbi-brain-loading");
      if (msg) {
        msg.textContent = "The interactive brain could not be loaded. The surrounding text describes what it shows.";
        msg.classList.add("is-error");
      }
    });
}

function boot() {
  const list = els();
  list.forEach(placeholder);
  if (!("IntersectionObserver" in window)) {
    list.forEach(start);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        start(e.target);
      });
    },
    { rootMargin: "600px 0px" }
  );
  list.forEach((el) => io.observe(el));
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
