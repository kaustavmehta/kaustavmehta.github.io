// Lazy loader for the 3D figures of the umbrella-inversion post (#inv-umbrella, #inv-cage, #inv-c60).
// Each mount gets a lightweight placeholder at once; three.js and inversion-3d-core.js (~700 kB) are fetched only
// when a figure comes within ~600 px of the viewport. Needs inversion-common.js (window.INV) loaded first.
(function () {
  const KINDS = { "inv-umbrella": "umbrella", "inv-cage": "cage", "inv-c60": "c60" };
  const base = (document.currentScript && document.currentScript.src) || new URL("assets/js/posts/inversion-3d.js", location.href).href;
  const coreUrl = new URL("inversion-3d-core.js", base).href;
  let corePromise = null;
  const loadCore = () => (corePromise = corePromise || import(coreUrl));

  function placeholder(node) {
    node.classList.add("inv-3d-root");
    if (node.firstElementChild) return;
    const box = document.createElement("div");
    box.className = "inv-3d inv-panel";
    const stage = document.createElement("div");
    stage.className = "inv-3d-stage inv-3d-placeholder";
    const msg = document.createElement("div");
    msg.className = "inv-3d-loading";
    msg.textContent = "Loading the 3D view…";
    stage.append(msg);
    box.append(stage);
    node.append(box);
  }

  function start(node, kind) {
    loadCore()
      .then((core) => core.mount(kind, node))
      .catch(() => {
        const msg = node.querySelector(".inv-3d-loading");
        if (msg) {
          msg.textContent = "The interactive 3D view could not be loaded. The text around it describes what it shows.";
          msg.classList.add("is-error");
        }
      });
  }

  function boot() {
    const items = Object.keys(KINDS)
      .map((id) => [document.getElementById(id), KINDS[id]])
      .filter(([node]) => node);
    items.forEach(([node]) => placeholder(node));
    if (!("IntersectionObserver" in window)) {
      items.forEach(([node, kind]) => start(node, kind));
      return;
    }
    const kinds = new Map(items);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          start(e.target, kinds.get(e.target));
        }),
      { rootMargin: "600px 0px" }
    );
    items.forEach(([node]) => io.observe(node));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
