module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  skippedContentGlobs: ["_site/assets/**/*.html"],
  // Elements and classes that only exist after third-party scripts run
  safelist: {
    standard: [/^mjx-/],
  },
};
