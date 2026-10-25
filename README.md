# kaustavmehta.github.io

The source for my personal website, [kaustavmehta.github.io](https://kaustavmehta.github.io): my CV, publications, and a blog where I explain my research from scratch, with interactive figures.

## Blog posts

| Post                                                                                                                 | About                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [Umbrellas in a cage](https://kaustavmehta.github.io/blog/2026/umbrellas-in-a-cage/)                                 | Umbrella inversion and tunnelling in OH₃⁺ and PH₃ inside a C₆₀ fullerene, and an introduction to quantum chemistry methods, DFT included |
| [The quiet injury](https://kaustavmehta.github.io/blog/2026/tbi-part-1-the-quiet-injury/)                            | Part 1 of a series on traumatic brain injury: what the injury is and why "mild" misleads                                                 |
| [Thinking in graphs](https://kaustavmehta.github.io/blog/2026/tbi-part-2-thinking-in-graphs/)                        | Part 2: the graph theory behind the research, built up from Euler's bridges                                                              |
| [A map of what comes after](https://kaustavmehta.github.io/blog/2026/tbi-part-3-a-map-of-what-comes-after/)          | Part 3: a network of conditions five years after a mild brain injury                                                                     |
| [Bread, butter and a WhatsApp prescription](https://kaustavmehta.github.io/blog/2026/covid-mental-health-providers/) | How a community mental health organisation in Chennai kept care going through the 2020 lockdown                                          |

## Where things live

- `_posts/`: blog posts (Markdown, mostly with the `distill` layout)
- `assets/js/posts/`, `assets/css/`: the interactive figures and styles for each post
- `assets/bibliography/`: one BibTeX file per post
- `_includes/blog_covers/`: the cover art shown on the blog index
- `_bibliography/papers.bib`: publications
- `_data/`, `assets/json/resume.json`: CV data
- `_pages/`: the site's pages (about, blog, CV, publications)

## Running it locally

With Docker:

```bash
docker compose pull
docker compose up
```

Or with Ruby and Bundler:

```bash
bundle install
bundle exec jekyll serve
```

The site is then at `http://localhost:4000`. If the build fails with `invalid byte sequence in US-ASCII`, set a UTF-8 locale first (`export LANG=C.UTF-8 LC_ALL=C.UTF-8`).

Pushing to `main` builds and deploys the site through GitHub Actions. Formatting is checked with Prettier (`npx prettier . --check`).

## Credits

The site is built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme by Maruan Al-Shedivat and contributors, released under the MIT licence (see `LICENSE`). The theme's own documentation is kept in `INSTALL.md`, `CUSTOMIZE.md` and `FAQ.md`.
