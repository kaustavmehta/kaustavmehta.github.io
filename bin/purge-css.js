// Removes unused selectors from the built CSS in _site using purgecss.config.js.
// Uses the API because `purgecss -c` fails to load a CommonJS config and silently does nothing.
const fs = require("fs");
const { PurgeCSS } = require("purgecss");
const config = require("../purgecss.config.js");

new PurgeCSS().purge(config).then((results) => {
  for (const { file, css } of results) {
    const before = fs.statSync(file).size;
    fs.writeFileSync(file, css);
    console.log(`${file}: ${before} -> ${css.length} bytes`);
  }
});
