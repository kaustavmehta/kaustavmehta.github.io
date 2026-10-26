# Handoff: learning in the open

Written 2026-10-26 at the end of a Claude Code session, so a new session can pick up the brainstorm. Read this whole file before replying to Kaustav.

## Where the conversation is

Kaustav wants the site to be where he learns in public. He wants to work through foundational research (deep learning first), keep his notes and highlights as he reads papers, and turn them into teaching content: visual, interactive explainers of hard ideas, written for the teenager he was. In his words, part of why he built the site was "so that I could keep a record of the things I try to self-learn and sort of create teaching content for what I would imagine a teenager version of me would've loved engaging with (visuals, interactive, complex concepts that are super approachable)."

He asked whether the existing Distill blog posts should move to the projects section. **The answer was no.** Posts stay posts, and moving them would break their URLs. The proposal instead was three layers:

1. **Notes**: a new `_notes` collection at `/notes/`, one page per paper.
   - **Contents:** paper metadata (title, authors, year, link) and a status (reading or finished). Then his highlights with his commentary, his own explanation in plain words, and the questions he still has.
   - **Layout:** plainer than a post, so a note takes half an hour, not a week.
   - **Links:** notes link to each other, and pages show backlinks, so the notes form a map of how ideas build on each other.
   - **Index:** the notes index doubles as a reading log, with dates, in-progress items and filters by topic.
2. **Topics**: an ordered path through a subject, such as "Deep learning from first principles". This would reuse the existing projects collection, which already supports ordering by `importance` and grouping by `category`, with a new design and a new name.
   - **Contents:** it mixes paper notes and finished explainers in reading order.
   - **First topics:** the TBI series and the umbrella-inversion post would become the first ones.
3. **Explainers**: the existing Distill blog posts. These are the finished, interactive pieces, built up from the notes once he understands something well enough to teach it. A note can link forward to the explainer it became.

The flow is: read a paper, take notes, the notes join a topic, and eventually a topic produces an explainer.

### Open questions (asked, not yet answered)

1. **Where does he read and highlight papers now?** Zotero, a PDF reader, paper, Obsidian, or nothing yet. If it's a tool, build an importer so highlights flow in without retyping. If nothing, suggest plain Markdown in the repo with a simple highlight format. (`_data/socials.yml` has a commented-out `zotero_username`, which is a weak hint he has used Zotero.)
2. **Should notes be public from the start, or private drafts until he publishes each one?** For private drafts: keep them in the repo but leave them out of the build behind a front-matter flag.
3. **Which deep learning paper comes first?** The plan was to scaffold that paper's note page so he sees the format with real content.

### Suggested next steps once he answers

- Agree on the note format: front matter fields, the highlight syntax, and how note-to-note links are written.
- Build the `_notes` collection, a note layout, the notes index or reading log, and backlinks. The backlinks can be computed at build time in Liquid, or with a small plugin in `_plugins/`.
- Rework projects into topics: rename the collection and permalink, and design an ordered-path page rather than a card grid. Decide with him whether topics or notes go in the top menu.
- Seed one real note and one topic, then show him on desktop and on a phone.
- Brainstorming is the point of the next session. Explore with him before building: what he wants a reader to experience, how polished notes should be, and whether to reuse the series navigation from the TBI posts (`assets/css/tbi-series.css`).

## Things to know about how he works

- **Voice.** Prose that appears on the site as his writing must use the `kaustav-voice` skill. He has rejected text that sounds AI-written, such as "Papers I've been part of, explained with more room than a journal gives them…" and "Longer walks through the work."
- **Audience.** Write for a moderately science-literate undergraduate, or a curious teenager, building up from first principles.
- **Don't break the look.** He asked that nothing visually changes or breaks. Before merging anything, build the site before and after, diff the output, and screenshot the affected pages at desktop and phone widths.
- **Merging.** He merges through PRs: create one with the GitHub MCP tools, wait for the `check` (Prettier) and `deploy` checks, then merge with the merge method. He has been fine with merging once checks pass.
- **Subagents.** For larger builds he has asked for Sonnet subagents for well-defined implementation, and one Opus subagent for research and validation.

## Site and tooling facts

- **Stack.** Jekyll with al-folio v0.x, forked June 2025 and heavily customised.
  - Blog posts use `layout: distill`.
  - Per-post JS is in `assets/js/posts/`, per-post CSS in `assets/css/`, and one BibTeX file per post in `assets/bibliography/`.
  - Blog index cover art is in `_includes/blog_covers/<name>.liquid`, chosen with `cover:` front matter.
  - three.js is vendored at `assets/js/vendor/`.
- **Local build.** Plain `bundle exec jekyll` is not on PATH in the cloud container, and the build needs a UTF-8 locale:
  ```bash
  LANG=C.UTF-8 LC_ALL=C.UTF-8 bundle exec ruby "$(bundle exec gem contents jekyll | grep 'exe/jekyll$')" build -d /path/to/scratch/site
  ```
- **Prettier.** Pinned to 3.9.10 with `@shopify/prettier-plugin-liquid` 1.11.2. CI runs `npx prettier . --check` with the repo's `.prettierrc` (printWidth 150). Run the same check before pushing.
- **Don't `pkill -f` in the container.** It has killed the agent's own shell twice. Start servers with `python3 -m http.server PORT --directory DIR` as a background command instead.
- **Previews.** Playwright and Chromium are preinstalled (`require('playwright')`), which is good for screenshots.

## What was done in the previous session (all merged to main)

- **#5 Umbrellas in a cage:** an interactive post on the PCCP 2026 paper about PH₃ and OH₃⁺ inversion inside C₆₀, plus blog covers on every post card and a new blog index.
- **#6:** blog hero text changed to "My research, explained from scratch."
- **#7:** a site-specific README replacing the template one.
- **#8:**
  - Prettier check green, Prettier version pinned.
  - `docker-compose.yml` had a duplicate `build:` key, now merged into one.
- **#9:** three upstream al-folio bug fixes ported:
  - bib month carry-over
  - `-auto-orient` on WebP conversion
  - MathJax overflow on small screens
- **#10:** the template's demo content was unpublished.
  - Removed: projects, books, news, people, teaching, repositories and their demo assets.
  - The CV "Download CV" button, which served the template's example PDF, is hidden until `cv_pdf:` is set in `_pages/cv.md`.
  - The placeholder custom social link in search is gone.
  - The projects, books and news layouts and includes were kept, so projects can come back as topics.
- **Issue #11:** evaluates migrating to al-folio v1.x. The modular plugin-gem architecture would hold his customisations as local overrides. The issue has the risk list and a spike plan. If the notes and topics work happens first, build it so it would survive that migration: keep it self-contained in its own layouts, includes and Sass.

## Other loose ends

- **Phosphine TODO.** The umbrella post has a `<!-- TODO(Kaustav): … -->` about the paper's phosphine level-shift and splitting claims, which the solver could not reproduce. He still needs to decide how to handle it.
- **His role in the paper.** The post could use a sentence from him on what he did in the paper.
- **The ORCA/HPC post.** A planned second post on teaching himself ORCA, quantum chemistry and HPC, to be built from a conversation with him and his files. It would also fit naturally as a note or topic in the new structure.
- **Raw data.** He may supply raw data (IRC scans and so on) to replace values transcribed from the paper.
- **CV PDF.** He has no real CV PDF in the repo yet.
- **Animated GIFs.** The GIFs in `assets/img/CV/` produce 0-byte WebPs: their frames are 1×1, so ImageMagick fails. They aren't shown anywhere right now. See issue #11.
