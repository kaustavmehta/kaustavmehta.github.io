module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  skippedContentGlobs: ["_site/assets/**/*.html"],
  // Added at runtime by scripts loaded from CDNs (medium-zoom, MathJax, Bootstrap tooltips and
  // popovers), so they never appear in _site
  safelist: { greedy: [/medium-zoom/, /mjx-/, /tooltip/, /popover/] },
};
