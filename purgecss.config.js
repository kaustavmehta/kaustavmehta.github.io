module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  skippedContentGlobs: ["_site/assets/**/*.html"],
  // medium-zoom (loaded from a CDN) adds these classes at runtime, so they never appear in _site
  safelist: { greedy: [/medium-zoom/] },
};
