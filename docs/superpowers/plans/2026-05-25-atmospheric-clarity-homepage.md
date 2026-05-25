# Atmospheric Clarity Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage of kaustavmehta.github.io with the "Atmospheric Clarity" visual direction — warm atmospheric dual-theme, Newsreader + Space Grotesk typography, considered motion, ambient visual details.

**Architecture:** Modify existing al-folio SCSS theme files to remap CSS custom properties to new color values. Self-host fonts via `@font-face` declarations. Add new SCSS partials for fonts, animations, and homepage-specific ambient styling. Update the about page frontmatter and layout to enable publications/posts sections. Add a small JavaScript file for scroll-triggered animations using IntersectionObserver.

**Tech Stack:** Jekyll, SCSS, Liquid templates, vanilla JavaScript, WOFF2 fonts

**Dev server:** Running via podman on `http://127.0.0.1:8080` with LiveReload. Changes to SCSS/Liquid files trigger automatic rebuild.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `assets/fonts/*.woff2` | Create | Self-hosted Newsreader, Space Grotesk, JetBrains Mono font files |
| `_sass/_fonts.scss` | Create | `@font-face` declarations for all three font families |
| `_sass/_variables.scss` | Modify | Add new color variables for atmospheric palette |
| `_sass/_themes.scss` | Modify | Remap CSS custom properties to new colors for both light/dark |
| `_sass/_base.scss` | Modify | Typography overrides (font-family on body, headings, code) |
| `_sass/_atmospheric.scss` | Create | Homepage ambient glows, rings, gradient separators, dark-mode body gradient |
| `_sass/_animations.scss` | Create | Scroll fade-in, hover states, page-load animations, reduced-motion |
| `assets/css/main.scss` | Modify | Import new `_fonts`, `_atmospheric`, `_animations` partials |
| `_includes/head.liquid` | Modify | Replace Google Fonts CDN link with nothing (fonts loaded via SCSS) |
| `_config.yml` | Modify | Update google_fonts URL to empty/remove, set dark as default theme |
| `_pages/about.md` | Modify | Enable `selected_papers: true`, `latest_posts.enabled: true` |
| `_bibliography/papers.bib` | Modify | Add `selected={true}` to 2-3 key papers |
| `_layouts/about.liquid` | Modify | Add atmospheric wrapper, section classes, ambient ring markup |
| `assets/js/atmospheric.js` | Create | IntersectionObserver scroll animations, ambient parallax |
| `_includes/scripts.liquid` | Modify | Include atmospheric.js on about page |

---

### Task 1: Download and Self-Host Fonts

**Files:**
- Create: `assets/fonts/newsreader-300.woff2`, `assets/fonts/newsreader-300-italic.woff2`, `assets/fonts/newsreader-400.woff2`
- Create: `assets/fonts/space-grotesk-300.woff2`, `assets/fonts/space-grotesk-400.woff2`, `assets/fonts/space-grotesk-500.woff2`
- Create: `assets/fonts/jetbrains-mono-400.woff2`

- [ ] **Step 1: Download Newsreader WOFF2 files**

Use the Google Fonts CSS API to extract direct WOFF2 URLs, then download them. The API returns different URLs based on user-agent — use a Chrome UA to get WOFF2.

```bash
# Newsreader 300 normal
curl -s -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0" \
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;1,6..72,300&display=swap" \
  | grep -oP 'url\(\K[^)]+' | while read url; do
    if echo "$url" | grep -q "italic"; then
      curl -sL "$url" -o assets/fonts/newsreader-300-italic.woff2
    else
      curl -sL "$url" -o assets/fonts/newsreader-300.woff2
    fi
  done

# Newsreader 400 normal
curl -s -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0" \
  "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400&display=swap" \
  | grep -oP 'url\(\K[^)]+' | head -1 | xargs -I{} curl -sL {} -o assets/fonts/newsreader-400.woff2
```

- [ ] **Step 2: Download Space Grotesk WOFF2 files**

```bash
for weight in 300 400 500; do
  curl -s -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0" \
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}&display=swap" \
    | grep -oP 'url\(\K[^)]+' | head -1 | xargs -I{} curl -sL {} -o assets/fonts/space-grotesk-${weight}.woff2
done
```

- [ ] **Step 3: Download JetBrains Mono WOFF2 file**

```bash
curl -s -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0" \
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap" \
  | grep -oP 'url\(\K[^)]+' | head -1 | xargs -I{} curl -sL {} -o assets/fonts/jetbrains-mono-400.woff2
```

- [ ] **Step 4: Verify all files exist and are valid WOFF2**

```bash
ls -la assets/fonts/*.woff2
file assets/fonts/*.woff2
```

Expected: 7 WOFF2 files, each identified as `Web Open Font Format (Version 2)`.

- [ ] **Step 5: Commit**

```bash
git add assets/fonts/
git commit -m "feat: add self-hosted Newsreader, Space Grotesk, JetBrains Mono fonts"
```

---

### Task 2: Create Font-Face SCSS Partial

**Files:**
- Create: `_sass/_fonts.scss`
- Modify: `assets/css/main.scss`

- [ ] **Step 1: Create `_sass/_fonts.scss`**

```scss
// Self-hosted font declarations
// Newsreader (headlines), Space Grotesk (body/UI), JetBrains Mono (code)

@font-face {
  font-family: 'Newsreader';
  src: url('../fonts/newsreader-300.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Newsreader';
  src: url('../fonts/newsreader-300-italic.woff2') format('woff2');
  font-weight: 300;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: 'Newsreader';
  src: url('../fonts/newsreader-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Space Grotesk';
  src: url('../fonts/space-grotesk-300.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Space Grotesk';
  src: url('../fonts/space-grotesk-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Space Grotesk';
  src: url('../fonts/space-grotesk-500.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('../fonts/jetbrains-mono-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 2: Add `_fonts` import to `assets/css/main.scss`**

Add `"fonts"` as the FIRST import, before `"variables"`:

```scss
@import
  "fonts",
  "variables",
  "themes",
  "layout",
  "base",
  ...
```

- [ ] **Step 3: Remove Google Fonts CDN link from `_includes/head.liquid`**

Replace lines 27-32 of `_includes/head.liquid`:

```liquid
<link
  defer
  rel="stylesheet"
  type="text/css"
  href="{{ site.third_party_libraries.google_fonts.url.fonts }}"
>
```

With nothing (delete the entire block). Fonts are now loaded via SCSS `@font-face`.

- [ ] **Step 4: Verify site rebuilds without errors**

Check podman logs:
```bash
podman logs --tail 5 al-folio-dev
```

Expected: `Server running... press ctrl-c to stop.` with no SCSS compilation errors.

- [ ] **Step 5: Commit**

```bash
git add _sass/_fonts.scss assets/css/main.scss _includes/head.liquid
git commit -m "feat: self-host fonts via @font-face, remove Google Fonts CDN"
```

---

### Task 3: Update Color System — Variables and Themes

**Files:**
- Modify: `_sass/_variables.scss`
- Modify: `_sass/_themes.scss`

- [ ] **Step 1: Add atmospheric color variables to `_sass/_variables.scss`**

Add after the existing color declarations (after line 33, before `// Theme colors`):

```scss
// Atmospheric Clarity palette
$atmo-canvas-light: #FAFAF8;
$atmo-canvas-dark-start: #0c0c14;
$atmo-canvas-dark-mid: #0e1520;
$atmo-canvas-dark-end: #0a0e18;
$atmo-text-primary-light: #1a1a1a;
$atmo-text-secondary-light: #777;
$atmo-text-primary-dark: rgba(255, 255, 255, 0.9);
$atmo-text-secondary-dark: rgba(255, 255, 255, 0.4);
$atmo-accent-light: #5a7a9a;
$atmo-accent-dark: rgba(140, 180, 220, 0.9);
$atmo-ui-text-light: #999;
$atmo-ui-text-dark: rgba(255, 255, 255, 0.25);
$atmo-divider-light: rgba(0, 0, 0, 0.06);
$atmo-divider-dark: rgba(255, 255, 255, 0.04);
$atmo-card-bg-light: rgba(255, 255, 255, 0.7);
$atmo-card-border-light: #eee;
$atmo-card-bg-dark: rgba(255, 255, 255, 0.03);
$atmo-card-border-dark: rgba(255, 255, 255, 0.06);
```

- [ ] **Step 2: Remap `:root` (light mode) CSS custom properties in `_sass/_themes.scss`**

Replace the color variable assignments in the `:root` block (lines 8-31) with:

```scss
:root {
  color-scheme: light;
  --global-bg-color: #{$atmo-canvas-light};
  --global-code-bg-color: rgba(90, 122, 154, 0.06);
  --global-text-color: #{$atmo-text-primary-light};
  --global-text-color-light: #{$atmo-text-secondary-light};
  --global-theme-color: #{$atmo-accent-light};
  --global-hover-color: #{$atmo-accent-light};
  --global-hover-text-color: #{$white-color};
  --global-footer-bg-color: #e8e8e4;
  --global-footer-text-color: #{$atmo-text-secondary-light};
  --global-footer-link-color: #{$atmo-text-primary-light};
  --global-distill-app-color: #{$atmo-ui-text-light};
  --global-divider-color: #{$atmo-divider-light};
  --global-card-bg-color: #{$atmo-card-bg-light};
  --global-highlight-color: #{$red-color-dark};
  --global-back-to-top-bg-color: rgba(0, 0, 0, 0.3);
  --global-back-to-top-text-color: #{$white-color};
  --global-newsletter-bg-color: #{$atmo-canvas-light};
  --global-newsletter-text-color: #{$atmo-text-primary-light};
  --global-accent-color: #{$atmo-accent-light};
  --global-card-border-color: #{$atmo-card-border-light};
```

Keep the tip/warning/danger block variables and toggle display rules unchanged.

- [ ] **Step 3: Remap `html[data-theme="dark"]` CSS custom properties**

Replace the color assignments in the dark theme block (lines 80-101) with:

```scss
html[data-theme="dark"] {
  color-scheme: dark;
  --global-bg-color: #{$atmo-canvas-dark-start};
  --global-bg-gradient: linear-gradient(160deg, #{$atmo-canvas-dark-start} 0%, #{$atmo-canvas-dark-mid} 40%, #{$atmo-canvas-dark-end} 100%);
  --global-code-bg-color: rgba(140, 180, 220, 0.08);
  --global-text-color: #{$atmo-text-primary-dark};
  --global-text-color-light: #{$atmo-text-secondary-dark};
  --global-theme-color: #{$atmo-accent-dark};
  --global-hover-color: #{$atmo-accent-dark};
  --global-hover-text-color: #{$white-color};
  --global-footer-bg-color: #12121a;
  --global-footer-text-color: #{$atmo-text-secondary-dark};
  --global-footer-link-color: #{$atmo-text-primary-dark};
  --global-distill-app-color: #{$atmo-ui-text-dark};
  --global-divider-color: #{$atmo-divider-dark};
  --global-card-bg-color: #{$atmo-card-bg-dark};
  --global-back-to-top-bg-color: rgba(255, 255, 255, 0.15);
  --global-back-to-top-text-color: #{$atmo-text-primary-dark};
  --global-newsletter-bg-color: #{$atmo-canvas-dark-start};
  --global-newsletter-text-color: #{$atmo-text-primary-dark};
  --global-accent-color: #{$atmo-accent-dark};
  --global-card-border-color: #{$atmo-card-border-dark};
```

Keep the tip/warning/danger block variables and `.only-light`/`.only-dark` rules unchanged.

- [ ] **Step 4: Verify the site rebuilds and colors have changed**

```bash
podman logs --tail 5 al-folio-dev
```

Expected: Successful rebuild. Visit `http://127.0.0.1:8080` — the site should now show the warm white canvas (light) or deep blue-black (dark) depending on system preference. Toggle dark mode to verify both themes work.

- [ ] **Step 5: Commit**

```bash
git add _sass/_variables.scss _sass/_themes.scss
git commit -m "feat: remap color system to Atmospheric Clarity palette"
```

---

### Task 4: Apply Typography Overrides

**Files:**
- Modify: `_sass/_base.scss`

- [ ] **Step 1: Add font-family overrides at the top of `_sass/_base.scss`**

Add immediately after the opening comment block (before the existing `p, h1, h2...` rule at line 7):

```scss
body {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 400;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Newsreader', Georgia, serif;
  font-weight: 300;
}

code, pre, kbd, samp {
  font-family: 'JetBrains Mono', monospace;
}
```

- [ ] **Step 2: Update the `.post-title` heading style for hero text**

Find the `.post-title` rule in `_base.scss` (search for `post-title`) and ensure it uses the hero scale:

```scss
.post-header {
  .post-title {
    font-family: 'Newsreader', Georgia, serif;
    font-weight: 300;
    font-size: 1.8rem;
    line-height: 1.45;
  }

  .desc {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--global-text-color-light);
  }
}
```

Note: The `.desc` class is used for the subtitle in `about.liquid` line 14: `<p class="desc">{{ page.subtitle }}</p>`. This turns it into the kicker style from the mockup.

- [ ] **Step 3: Style the about page body text**

Find the `.post` article content rules and add the hero/body typography for the about page. Add to `_base.scss`:

```scss
.about .post .clearfix {
  p {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.95rem;
    font-weight: 300;
    line-height: 1.8;
    color: var(--global-text-color-light);
    max-width: 560px;
  }

  em {
    color: var(--global-accent-color);
    font-style: italic;
  }
}
```

Note: The `.about` class comes from the page layout — need to verify it exists or add it in Task 7.

- [ ] **Step 4: Update nav link typography**

Find the navbar styling in `_base.scss` and add font overrides:

```scss
.navbar {
  font-family: 'Space Grotesk', system-ui, sans-serif;

  .nav-link {
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.5px;
    transition: color 0.2s ease;
  }

  .navbar-brand {
    font-family: 'Newsreader', Georgia, serif;
    font-weight: 400;
  }
}
```

- [ ] **Step 5: Verify typography changes render correctly**

Visit `http://127.0.0.1:8080`. Expected:
- Navbar brand in Newsreader serif
- Nav links in Space Grotesk
- Page title (name) in Newsreader
- Subtitle/kicker in uppercase Space Grotesk
- Body text in Space Grotesk light weight

- [ ] **Step 6: Commit**

```bash
git add _sass/_base.scss
git commit -m "feat: apply Newsreader + Space Grotesk typography system"
```

---

### Task 5: Create Atmospheric Visual Layer (Glows, Rings, Gradient Separators)

**Files:**
- Create: `_sass/_atmospheric.scss`
- Modify: `assets/css/main.scss`

- [ ] **Step 1: Create `_sass/_atmospheric.scss`**

```scss
// Atmospheric Clarity — ambient visual details
// Radial glows, concentric rings, gradient separators, dark-mode body gradient

// Dark mode body gradient
html[data-theme="dark"] body {
  background: var(--global-bg-gradient, var(--global-bg-color));
}

// Ambient radial glows behind main content
.about .post {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 400px 300px at 75% 15%, var(--atmo-glow-1) 0%, transparent 70%),
      radial-gradient(ellipse 300px 300px at 15% 65%, var(--atmo-glow-2) 0%, transparent 70%);
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

:root {
  --atmo-glow-1: rgba(100, 130, 180, 0.07);
  --atmo-glow-2: rgba(140, 100, 160, 0.05);
  --atmo-ring-color: rgba(100, 130, 180, 0.12);
  --atmo-separator-color: rgba(0, 0, 0, 0.06);
}

html[data-theme="dark"] {
  --atmo-glow-1: rgba(60, 120, 180, 0.10);
  --atmo-glow-2: rgba(100, 65, 145, 0.07);
  --atmo-ring-color: rgba(100, 140, 200, 0.08);
  --atmo-separator-color: rgba(255, 255, 255, 0.04);
}

// Concentric ambient rings
.ambient-rings {
  position: absolute;
  bottom: -40px;
  right: -20px;
  width: 200px;
  height: 200px;
  pointer-events: none;
  z-index: 0;
  overflow: visible;

  .ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid var(--atmo-ring-color);

    &:nth-child(1) { inset: 0; }
    &:nth-child(2) { inset: 25px; opacity: 0.7; }
    &:nth-child(3) { inset: 50px; opacity: 0.4; }
    &:nth-child(4) { inset: 75px; opacity: 0.2; }
  }
}

// Gradient separators between homepage sections
.atmo-separator {
  height: 1px;
  margin: 2rem 0;
  background: linear-gradient(90deg, transparent, var(--atmo-separator-color), transparent);
  border: none;
}

// Homepage section titles
.atmo-section-title {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--global-text-color-light);
  margin-bottom: 1rem;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--global-theme-color);
    }
  }
}

// Publication cards on homepage
.about .publications {
  .bib-entry {
    background: var(--global-card-bg-color);
    border: 1px solid var(--global-card-border-color, var(--global-divider-color));
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 0.75rem;
    transition: border-color 0.2s ease, transform 0.2s ease;

    &:hover {
      border-color: var(--global-theme-color);
      transform: translateY(-2px);
    }
  }
}

// Latest posts on homepage
.about .latest-posts-table {
  .news-title {
    font-family: 'Newsreader', Georgia, serif;
    font-weight: 400;
    font-size: 0.95rem;
    color: var(--global-text-color);
    text-decoration: none;

    &:hover {
      color: var(--global-theme-color);
    }
  }

  th {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: var(--global-text-color-light);
    white-space: nowrap;
  }
}
```

- [ ] **Step 2: Add `_atmospheric` import to `assets/css/main.scss`**

Add `"atmospheric"` after `"base"`:

```scss
@import
  "fonts",
  "variables",
  "themes",
  "layout",
  "base",
  "atmospheric",
  "animations",
  ...
```

(Add `"animations"` too — we'll create that file in Task 6.)

- [ ] **Step 3: Verify site rebuilds**

```bash
podman logs --tail 5 al-folio-dev
```

Expected: Successful rebuild. The glow effects won't be visible until the layout class `.about` is added in Task 7.

- [ ] **Step 4: Commit**

```bash
git add _sass/_atmospheric.scss assets/css/main.scss
git commit -m "feat: add atmospheric visual layer — glows, rings, separators"
```

---

### Task 6: Create Animations SCSS Partial and JavaScript

**Files:**
- Create: `_sass/_animations.scss`
- Create: `assets/js/atmospheric.js`

- [ ] **Step 1: Create `_sass/_animations.scss`**

```scss
// Atmospheric Clarity — motion design
// Scroll fade-ins, hover refinements, page-load animations

// Scroll reveal — elements start invisible and animate in
.atmo-reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;

  &.revealed {
    opacity: 1;
    transform: translateY(0);
  }
}

// Stagger delays for sequential sections
@for $i from 1 through 6 {
  .atmo-reveal:nth-child(#{$i}) {
    transition-delay: #{$i * 0.1}s;
  }
}

// Page-load fade for hero content
.atmo-hero-entrance {
  opacity: 0;
  animation: heroFadeIn 0.6s ease-out 0.4s forwards;
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Link underline animation
.about article a:not(.news-title):not([class*="btn"]) {
  text-decoration: none;
  background-image: linear-gradient(var(--global-theme-color), var(--global-theme-color));
  background-size: 0% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;

  &:hover {
    background-size: 100% 1px;
    text-decoration: none;
  }
}

// Respect reduced motion
@media (prefers-reduced-motion: reduce) {
  .atmo-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .atmo-hero-entrance {
    opacity: 1;
    animation: none;
  }

  .about article a {
    transition: none;
  }
}
```

- [ ] **Step 2: Create `assets/js/atmospheric.js`**

```javascript
// Atmospheric Clarity — scroll animations and ambient parallax
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Scroll reveal via IntersectionObserver
  var reveals = document.querySelectorAll('.atmo-reveal');
  if (reveals.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach(function (el) { observer.observe(el); });
  }

  // Ambient parallax on radial glows
  var post = document.querySelector('.about .post');
  if (post) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          var maxScroll = document.body.scrollHeight - window.innerHeight;
          var progress = maxScroll > 0 ? scrollY / maxScroll : 0;
          var shift = (progress - 0.5) * 30; // max ±15px
          post.style.setProperty('--atmo-parallax-y', shift + 'px');
          ticking = false;
        });
        ticking = true;
      }
    });
  }
})();
```

- [ ] **Step 3: Update `_sass/_atmospheric.scss` to use the parallax variable**

Add to the `.about .post::before` rule, after `background:`:

```scss
  &::before {
    // ... existing properties ...
    transform: translateY(var(--atmo-parallax-y, 0));
    transition: transform 0.1s linear;
  }
```

- [ ] **Step 4: Verify both files are syntactically correct**

```bash
podman logs --tail 5 al-folio-dev
```

Expected: Successful rebuild. The JS file won't be loaded until we include it in Task 8.

- [ ] **Step 5: Commit**

```bash
git add _sass/_animations.scss assets/js/atmospheric.js _sass/_atmospheric.scss
git commit -m "feat: add scroll animations and ambient parallax motion"
```

---

### Task 7: Update About Page Layout and Content

**Files:**
- Modify: `_layouts/about.liquid`
- Modify: `_pages/about.md`
- Modify: `_bibliography/papers.bib`

- [ ] **Step 1: Add `about` body class and atmospheric markup to `_layouts/about.liquid`**

Replace the entire file content with:

```liquid
---
layout: default
---
<div class="post about">
  <header class="post-header atmo-hero-entrance">
    <h1 class="post-title">
      {% if site.title == 'blank' %}
        <span class="font-weight-bold">{{ site.first_name }}</span> {{ site.middle_name }}
        {{ site.last_name }}
      {% else %}
        {{ site.title }}
      {% endif %}
    </h1>
    <p class="desc">{{ page.subtitle }}</p>
  </header>

  <article>
    {% if page.profile %}
      <div class="profile float-{% if page.profile.align == 'left' %}left{% else %}right{% endif %} atmo-hero-entrance">
        {% if page.profile.image %}
          {% assign profile_image_path = page.profile.image | prepend: 'assets/img/' %}
          {% if page.profile.image_circular %}
            {% assign profile_image_class = 'img-fluid z-depth-1 rounded-circle' %}
          {% else %}
            {% assign profile_image_class = 'img-fluid z-depth-1 rounded' %}
          {% endif %}
          {% capture sizes %}(min-width: {{ site.max_width }}) {{ site.max_width | minus: 30 | times: 0.3}}px, (min-width: 576px) 30vw, 95vw"{% endcapture %}
          {%
            include figure.liquid loading="eager" path=profile_image_path class=profile_image_class sizes=sizes alt=page.profile.image
            cache_bust=true
          %}
        {% endif %}
        {% if page.profile.more_info %}
          <div class="more-info">{{ page.profile.more_info }}</div>
        {% endif %}
      </div>
    {% endif %}

    <div class="clearfix atmo-hero-entrance">{{ content }}</div>

    <!-- Selected papers -->
    {% if page.selected_papers %}
      <div class="atmo-separator"></div>
      <div class="atmo-reveal">
        <h2 class="atmo-section-title">
          <a href="{{ '/publications/' | relative_url }}">selected publications</a>
        </h2>
        {% include selected_papers.liquid %}
      </div>
    {% endif %}

    <!-- Latest posts -->
    {% if page.latest_posts and page.latest_posts.enabled %}
      <div class="atmo-separator"></div>
      <div class="atmo-reveal">
        <h2 class="atmo-section-title">
          <a href="{{ '/blog/' | relative_url }}">latest posts</a>
        </h2>
        {% include latest_posts.liquid %}
      </div>
    {% endif %}

    <!-- News -->
    {% if page.announcements and page.announcements.enabled %}
      <div class="atmo-separator"></div>
      <div class="atmo-reveal">
        <h2 class="atmo-section-title">
          <a href="{{ '/news/' | relative_url }}">news</a>
        </h2>
        {% include news.liquid limit=true %}
      </div>
    {% endif %}

    <!-- Social -->
    {% if page.social %}
      <div class="social atmo-reveal">
        <div class="contact-icons">{% include social.liquid %}</div>
        <div class="contact-note">{{ site.contact_note }}</div>
      </div>
    {% endif %}

    {% if site.newsletter and site.newsletter.enabled and site.footer_fixed %}
      {% include newsletter.liquid center=true %}
    {% endif %}
  </article>

  <!-- Ambient rings -->
  <div class="ambient-rings">
    <div class="ring"></div>
    <div class="ring"></div>
    <div class="ring"></div>
    <div class="ring"></div>
  </div>
</div>
```

Key changes from the original:
- Added `about` class to the `.post` wrapper
- Added `atmo-hero-entrance` class to header, profile, and content
- Wrapped sections with `atmo-reveal` and `atmo-separator`
- Added `atmo-section-title` class to h2 elements
- Moved selected papers before latest posts (publications first)
- Added ambient rings markup at the bottom

- [ ] **Step 2: Enable sections in `_pages/about.md`**

Update the frontmatter:

```yaml
---
layout: about
title: about
permalink: /
subtitle: Independent Research Scientist. Guided by Intuition. Motivated by Questions.

profile:
  align: right
  image: prof_pic.jpg
  image_circular: true

selected_papers: true
social: false

announcements:
  enabled: false
  scrollable: true
  limit: 5

latest_posts:
  enabled: true
  scrollable: true
  limit: 3
---
```

Changes: `selected_papers: true`, `latest_posts.enabled: true`.

- [ ] **Step 3: Mark key papers as selected in `_bibliography/papers.bib`**

Add `selected={true}` to the first-author BMC Neurology paper and the Frontiers paper. In `mehta2025exploring` entry, add after the `preview` line:

```bibtex
  selected={true}
```

In `sudhakar2023prevalence` entry, add after the `preview` line:

```bibtex
  selected={true}
```

- [ ] **Step 4: Verify the homepage renders with publications and posts**

Visit `http://127.0.0.1:8080`. Expected:
- Hero section with name, kicker subtitle, profile image
- Body text below
- Gradient separator
- "SELECTED PUBLICATIONS" section with 2 paper entries
- Gradient separator
- "LATEST POSTS" section with blog post list
- Ambient rings visible at bottom-right

- [ ] **Step 5: Commit**

```bash
git add _layouts/about.liquid _pages/about.md _bibliography/papers.bib
git commit -m "feat: update homepage layout with atmospheric sections and enabled content"
```

---

### Task 8: Include Atmospheric JavaScript and Set Dark Default

**Files:**
- Modify: `_includes/scripts.liquid`
- Modify: `_config.yml`

- [ ] **Step 1: Find the scripts.liquid file and add atmospheric.js**

Add at the end of `_includes/scripts.liquid`, before the closing tag or at the end of the file:

```liquid
{% if page.layout == 'about' %}
  <script defer src="{{ '/assets/js/atmospheric.js' | relative_url }}"></script>
{% endif %}
```

This only loads the scroll/parallax JS on the about page.

- [ ] **Step 2: Set dark mode as the site default in `_config.yml`**

Find the `enable_darkmode` line and ensure it's true. Then find or add the default theme setting. Look for a `default_theme` or similar key near the dark mode toggle. In al-folio, the default is controlled by `assets/js/theme.js` — check if there's a config key for it.

If the config has no `default_theme` key, add one near `enable_darkmode`:

```yaml
enable_darkmode: true
default_theme: dark
```

If `default_theme` is not supported by the theme's JS, we'll handle it in the theme.js directly in the next step.

- [ ] **Step 3: Check if `default_theme` config is read by theme.js**

```bash
grep -n "default_theme\|defaultTheme\|theme.*default" assets/js/theme.js
```

If the theme.js doesn't read `default_theme` from config, we need to modify the JS to default to dark when no user preference is stored. Read `assets/js/theme.js` and adjust the fallback from "light" to "dark" for users who have no saved preference and no system preference.

- [ ] **Step 4: Verify dark mode is the default**

Open `http://127.0.0.1:8080` in an incognito/private window (no saved preference). Expected: Dark theme loads by default.

- [ ] **Step 5: Commit**

```bash
git add _includes/scripts.liquid _config.yml
# Also add assets/js/theme.js if modified
git commit -m "feat: include atmospheric.js on homepage, set dark as default theme"
```

---

### Task 9: Final Polish and Visual Verification

**Files:**
- Possibly adjust: `_sass/_atmospheric.scss`, `_sass/_base.scss`, `_sass/_animations.scss`

- [ ] **Step 1: Desktop visual check**

Visit `http://127.0.0.1:8080` and verify:
- [ ] Warm white canvas (light) or deep gradient (dark) background
- [ ] Newsreader serif for name heading and publication titles
- [ ] Space Grotesk for nav, body, kicker, section titles
- [ ] JetBrains Mono for any code elements
- [ ] Subtle radial glows behind content (look for slight blue/purple tint)
- [ ] Gradient separators between sections
- [ ] Ambient concentric rings at bottom-right
- [ ] Scroll animations: sections fade in as you scroll down
- [ ] Hero text fades in softly on page load
- [ ] Dark mode toggle works — both themes look correct
- [ ] No SCSS compilation errors in podman logs

- [ ] **Step 2: Mobile visual check**

Use browser dev tools (F12 → responsive mode → pick a phone size) and verify:
- [ ] Layout stacks properly on narrow screens
- [ ] Profile image and text don't overlap
- [ ] Typography is readable at mobile sizes
- [ ] Hamburger menu works
- [ ] Scroll animations still work

- [ ] **Step 3: Fix any visual issues found**

Adjust SCSS values as needed. Common fixes:
- Glow opacity too strong/weak: adjust values in `_atmospheric.scss` `:root` / `html[data-theme="dark"]`
- Ring positioning: adjust `bottom`/`right` values on `.ambient-rings`
- Typography sizing: adjust `font-size` in `_base.scss` overrides
- Spacing: adjust margins in `_atmospheric.scss` separator/section rules

- [ ] **Step 4: Reduced motion check**

In browser dev tools, enable "Prefer reduced motion" (Rendering tab in Chrome DevTools, or `about:config` → `ui.prefersReducedMotion` in Firefox). Verify:
- [ ] No scroll animations
- [ ] No page-load fade
- [ ] Content appears immediately and fully visible
- [ ] Site is fully usable

- [ ] **Step 5: Commit final polish**

```bash
git add -A
git commit -m "fix: visual polish from manual verification pass"
```

Only commit this if changes were made in Step 3. If everything looked perfect, skip this step.
