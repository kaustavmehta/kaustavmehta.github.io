// Initialize medium zoom.
$(document).ready(function () {
  medium_zoom = mediumZoom("[data-zoomable]", {
    background: "color-mix(in srgb, var(--global-bg-color) 93%, transparent)", // Works for hex and hsl() theme colours alike.
  });
});
