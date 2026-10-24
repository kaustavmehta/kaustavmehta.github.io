---
layout: distill
title: "Thinking in graphs"
description: "Part 2 of a series on traumatic brain injury. Graph networks built up from Euler's bridges, with every measure my research used made into something you can poke: degree, paths, triangles, assortativity, centrality and small worlds."
tags: traumatic-brain-injury graph-theory network-medicine comorbidity
categories: research
giscus_comments: false
related_posts: false
date: 2026-10-23 11:00:00 +0530

authors:
  - name: Kaustav Mehta
    url: "https://kaustavmehta.github.io"
    affiliations:
      name: Krea University

bibliography: 2026-10-23-tbi-part-2-thinking-in-graphs.bib

toc:
  - name: How do you look at a tangle?
  - name: Seven bridges
  - name: Dots and lines
  - name: Who has the most friends?
  - name: How much could be connected, and is?
  - name: How far apart is everyone?
  - name: Are my friends friends with each other?
  - name: Do hubs hold hands?
  - name: Who matters?
  - name: Small worlds
  - name: Islands
  - name: One graph, many worlds
  - name: From people to diseases

_styles: >
  :root { --tbi2-land: #ebe6d9; --tbi2-water: #c9dcec; --tbi2-wood: #8a6a46; }
  html[data-theme="dark"] { --tbi2-land: #1f2628; --tbi2-water: #1b3445; --tbi2-wood: #b38f63; }
  .tbi2-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .tbi2-fig-body { position: relative; }
  .tbi2-split { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 1.25rem; align-items: center; }
  .tbi2-split-even { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .tbi2-stack { position: relative; }
  .tbi2-stack canvas { position: absolute; left: 0; top: 0; pointer-events: none; }
  .tbi2-fig svg { overflow: visible; touch-action: none; user-select: none; -webkit-user-select: none; }
  .tbi2-fig svg.tbi2-scroll-ok { touch-action: pan-y; }
  .tbi2-fig .tbi-readout { min-height: 3.2em; line-height: 1.5; margin-top: 0.4rem; }
  .tbi2-fig .tbi-readout .tbi-btn { margin-left: 0.4rem; }
  .tbi2-fig .tbi-btn:disabled { opacity: 0.4; cursor: default; }
  .tbi2-fig .tbi-btn[hidden] { display: none; }
  .tbi2-group { display: inline-flex; flex-wrap: wrap; gap: 0.35rem; }
  .tbi2-group-label { font-size: 0.72rem; color: var(--tbi-ink-2); margin-right: 0.2rem; align-self: center; }
  .tbi2-edge { stroke: var(--tbi-ink-2); stroke-opacity: 0.45; stroke-linecap: round; transition: stroke 0.25s, stroke-opacity 0.25s; }
  .tbi2-edge.is-hot, .tbi2-edge.is-path, .tbi2-edge.is-among { stroke: var(--tbi-metab); stroke-opacity: 1; }
  .tbi2-edge.is-path { stroke-width: 4px; }
  .tbi2-edge.is-reached { stroke: var(--tbi-accent); stroke-opacity: 0.85; }
  .tbi2-edge.is-shortcut { stroke-dasharray: 6 4; }
  .tbi2-edge.is-gone { stroke-opacity: 0.08; }
  .tbi2-ghost { stroke: var(--tbi-ink-2); stroke-opacity: 0.22; stroke-dasharray: 2 4; }
  .tbi2-node { cursor: pointer; outline: none; }
  .tbi2-node-dot { fill: var(--tbi-accent); stroke: var(--global-bg-color); stroke-width: 2; transition: fill 0.3s, r 0.5s, opacity 0.3s; }
  .tbi2-node-halo { fill: var(--tbi-metab); fill-opacity: 0.28; opacity: 0; transition: opacity 0.3s, r 0.5s; }
  .tbi2-node-label { fill: var(--tbi-ink); font-size: 12px; pointer-events: none; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 3px; stroke-linejoin: round; }
  .tbi2-node-label.is-inside { fill: var(--global-bg-color); stroke: none; font-weight: 600; font-size: 11px; }
  .tbi2-node:focus-visible .tbi2-node-halo { opacity: 1; fill: none; stroke: var(--tbi-accent); stroke-width: 2; stroke-dasharray: 4 3; }
  .tbi2-node.is-hot .tbi2-node-dot, .tbi2-node.is-source .tbi2-node-dot, .tbi2-node.is-onpath .tbi2-node-dot, .tbi2-node.is-warm .tbi2-node-dot { fill: var(--tbi-metab); }
  .tbi2-node.is-target .tbi2-node-dot { stroke: var(--tbi-metab); stroke-width: 4; }
  .tbi2-node.is-top .tbi2-node-halo { opacity: 1; }
  .tbi2-node.is-guess .tbi2-node-halo { opacity: 1; fill: none; stroke: var(--tbi-ink); stroke-width: 1.5; stroke-dasharray: 3 3; }
  .tbi2-node.is-gone { opacity: 0.15; }
  .tbi2-node.is-nbr .tbi2-node-dot { fill: var(--tbi-accent); }
  #tbi2-cc .tbi2-node:not(.is-nbr):not(.is-source) .tbi2-node-dot { opacity: 0.45; }
  .tbi2-tri { fill: var(--tbi-metab); fill-opacity: 0.16; stroke: none; }
  .tbi2-cc-pair { cursor: pointer; outline: none; }
  .tbi2-cc-hit { stroke: transparent; stroke-width: 16px; }
  .tbi2-cc-ghost { stroke: var(--tbi-metab); stroke-width: 1.6; stroke-dasharray: 3 5; opacity: 0.8; }
  .tbi2-cc-pair.is-real .tbi2-cc-ghost { opacity: 0; }
  .tbi2-cc-pair:hover .tbi2-cc-ghost, .tbi2-cc-pair:focus-visible .tbi2-cc-ghost { stroke-width: 3; opacity: 1; }
  .tbi2-cc-pair.is-real:focus-visible .tbi2-cc-ghost { opacity: 1; stroke-dasharray: none; }
  .tbi2-kb-wrap svg { width: 100%; height: auto; display: block; touch-action: manipulation; }
  .tbi2-land { fill: var(--tbi2-land); }
  .tbi2-water-f { fill: var(--tbi2-water); }
  .tbi2-water-s { stroke: var(--tbi2-water); stroke-width: 54; fill: none; stroke-linecap: round; }
  .tbi2-kb-river { fill: var(--tbi-ink-2) !important; font-style: italic; font-size: calc(12px * var(--k, 1)); opacity: 0.8; }
  .tbi2-kb-bridge { cursor: pointer; outline: none; }
  .tbi2-kb-bridge rect { fill: var(--tbi2-wood); stroke: var(--global-bg-color); stroke-width: 1.5; transition: fill 0.3s; }
  .tbi2-kb-bridge text { fill: #fff !important; font-size: calc(12px * var(--k, 1)); font-weight: 600; pointer-events: none; }
  .tbi2-kb-bridge.is-used rect { fill: var(--tbi-ink-2); opacity: 0.55; }
  .tbi2-kb-bridge:hover rect, .tbi2-kb-bridge:focus-visible rect { fill: var(--tbi-metab); }
  .tbi2-kb-edge { outline: none; cursor: pointer; }
  .tbi2-kb-hit { stroke: transparent; stroke-width: 18; fill: none; }
  .tbi2-kb-line { stroke: var(--tbi-ink); stroke-width: 3.5; fill: none; stroke-linecap: round; transition: stroke 0.3s; }
  .tbi2-kb-edge:hover .tbi2-kb-line, .tbi2-kb-edge:focus-visible .tbi2-kb-line { stroke: var(--tbi-cardio); stroke-dasharray: 6 5; }
  .tbi2-kb-edge.is-walked .tbi2-kb-line { stroke: var(--tbi-metab); }
  .tbi2-kb-num { font-size: calc(13px * var(--k, 1)); font-weight: 700; fill: var(--tbi-ink) !important; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 4px; pointer-events: none; }
  .tbi2-kb-node { cursor: pointer; outline: none; }
  .tbi2-kb-dot { fill: var(--tbi-accent); stroke: var(--global-bg-color); stroke-width: 3; }
  .tbi2-kb-glow { fill: none; stroke: var(--tbi-metab); stroke-width: 5; transition: opacity 0.4s; }
  .tbi2-kb-node.is-odd .tbi2-kb-glow { animation: tbi2-pulse 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .tbi2-kb-node.is-selected .tbi2-kb-dot { fill: var(--tbi-metab); }
  .tbi2-kb-deg { fill: var(--global-bg-color) !important; font-size: calc(17px * var(--k, 1)); font-weight: 700; pointer-events: none; font-family: "Newsreader", Georgia, serif; }
  .tbi2-kb-pill { fill: var(--global-bg-color); stroke: var(--tbi-ink-2); stroke-width: 1; }
  .tbi2-kb-node.is-here .tbi2-kb-pill { stroke: var(--tbi-metab); stroke-width: 2.5; }
  .tbi2-kb-node:hover .tbi2-kb-pill, .tbi2-kb-node:focus-visible .tbi2-kb-pill { stroke: var(--tbi-accent); stroke-width: 2; }
  .tbi2-kb-node:focus-visible .tbi2-kb-dot { stroke: var(--tbi-metab); }
  .tbi2-kb-name { font-size: calc(13px * var(--k, 1)); pointer-events: none; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 3px; }
  .tbi2-kb-walker { fill: var(--tbi-metab); stroke: var(--global-bg-color); stroke-width: 2.5; pointer-events: none; }
  @keyframes tbi2-pulse { 0%, 100% { stroke-opacity: 1; stroke-width: 4; } 50% { stroke-opacity: 0.35; stroke-width: 9; } }
  .tbi2-mx { border-collapse: separate; border-spacing: 3px; margin: 0 auto; font-size: 0.8rem; font-variant-numeric: tabular-nums; }
  .tbi2-mx th { font-weight: 600; color: var(--tbi-ink-2); text-align: center; padding: 0 0.15rem; font-size: 0.75rem; }
  .tbi2-mx td { padding: 0; border: none; }
  .tbi2-mx-cell { width: 2.15rem; height: 2.15rem; border-radius: 6px; border: 1px solid var(--tbi-rule); background: transparent; color: var(--tbi-ink-2); font: inherit; font-size: 0.75rem; cursor: pointer; padding: 0; transition: background 0.2s, color 0.2s, box-shadow 0.2s; }
  .tbi2-mx-cell.is-on { background: color-mix(in srgb, var(--tbi-accent) calc(var(--w, 1) * 100%), transparent); color: var(--global-bg-color); border-color: transparent; font-weight: 600; }
  .tbi2-mx-cell.is-hot { box-shadow: 0 0 0 2px var(--tbi-metab); }
  .tbi2-mx-cell:disabled { cursor: default; opacity: 0.35; }
  .tbi2-mx-cell:focus-visible { outline: 2px solid var(--tbi-accent); outline-offset: 2px; }
  .tbi2-mx-sum { color: var(--tbi-ink-2); font-size: 0.75rem; min-width: 2.6rem; text-align: center; }
  .tbi2-mx-edge { cursor: default; }
  .tbi2-mx-hit { stroke: transparent; stroke-width: 14; fill: none; }
  .tbi2-mx-line { stroke: var(--tbi-ink-2); stroke-opacity: 0.6; fill: none; stroke-linecap: round; transition: stroke 0.2s; }
  .tbi2-mx-arrow { fill: var(--tbi-ink-2); }
  .tbi2-mx-edge.is-hot .tbi2-mx-line { stroke: var(--tbi-metab); stroke-opacity: 1; }
  .tbi2-mx-edge.is-hot .tbi2-mx-arrow { fill: var(--tbi-metab); }
  .tbi2-mx-w { font-size: 11px; fill: var(--tbi-ink-2) !important; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 3px; }
  .tbi2-bars { display: grid; gap: 0.3rem; }
  .tbi2-bar { display: grid; grid-template-columns: 3.4rem 1fr 2.6rem; gap: 0.5rem; align-items: center; font-size: 0.78rem; }
  .tbi2-bar-label { text-align: right; color: var(--tbi-ink); }
  .tbi2-bar-track { height: 10px; border-radius: 5px; background: var(--tbi-soft); overflow: hidden; }
  .tbi2-bar-fill { display: block; height: 100%; width: 0; border-radius: 5px; background: var(--tbi-accent); opacity: 0.7; transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .tbi2-bar.is-key .tbi2-bar-fill { background: var(--tbi-metab); opacity: 1; }
  .tbi2-bar-val { font-variant-numeric: tabular-nums; color: var(--tbi-ink-2); }
  .tbi2-dens-dot { fill: var(--tbi-accent); stroke: var(--global-bg-color); stroke-width: 2; }
  .tbi2-meter { height: 8px; border-radius: 4px; background: var(--tbi-soft); border: 1px solid var(--tbi-rule); overflow: hidden; margin-top: 0.5rem; }
  .tbi2-meter span { display: block; height: 100%; width: 0; background: var(--tbi-accent); transition: width 0.3s; }
  .tbi2-hbar { fill: var(--tbi-ink-2); opacity: 0.25; transition: y 0.4s, height 0.4s; }
  .tbi2-hbar-mine { fill: var(--tbi-accent); opacity: 0.85; transition: y 0.4s, height 0.4s; }
  .tbi2-hlab, .tbi2-haxis { font-size: 11px; fill: var(--tbi-ink-2) !important; }
  .tbi2-hmean { stroke: var(--tbi-metab); stroke-width: 2; stroke-dasharray: 4 3; }
  .tbi2-hmean-lab, .tbi2-hdiam { font-size: 11px; fill: var(--tbi-metab) !important; font-weight: 600; }
  .tbi2-asr-edge { stroke: var(--tbi-ink-2); stroke-opacity: 0.35; stroke-width: 1; }
  .tbi2-asr-frame { fill: none; stroke: var(--tbi-rule); }
  .tbi2-asr-diag { stroke: var(--tbi-ink-2); stroke-dasharray: 3 4; opacity: 0.6; }
  .tbi2-asr-pt { fill: var(--tbi-metab); fill-opacity: 0.55; stroke: var(--tbi-metab); stroke-width: 0.8; transition: cx 0.3s, cy 0.3s, r 0.3s; }
  .tbi2-asr-ax, .tbi2-asr-tick { font-size: 11px; fill: var(--tbi-ink-2) !important; }
  .tbi2-asr-axis { stroke: var(--tbi-ink-2); stroke-width: 1.5; }
  .tbi2-asr-ref { outline: none; cursor: default; }
  .tbi2-asr-ref line { stroke: var(--tbi-ink-2); stroke-opacity: 0.4; }
  .tbi2-asr-ref circle { fill: var(--global-bg-color); stroke: var(--tbi-ink-2); stroke-width: 1.5; }
  .tbi2-asr-ref text { font-size: 10.5px; fill: var(--tbi-ink-2) !important; }
  .tbi2-asr-ref:focus-visible circle, .tbi2-asr-ref:hover circle { fill: var(--tbi-ink-2); }
  .tbi2-asr-me path { fill: var(--tbi-metab); }
  .tbi2-asr-me text { font-size: 11px; font-weight: 600; fill: var(--tbi-metab) !important; }
  .tbi2-asr-me { transition: transform 0.3s; }
  .tbi2-ev-line { fill: none; stroke: var(--tbi-ink-2); stroke-opacity: 0.25; stroke-width: 1.2; }
  .tbi2-ev-line.is-pat { stroke: var(--tbi-accent); stroke-opacity: 1; stroke-width: 2.5; }
  .tbi2-ev-line.is-quinn { stroke: var(--tbi-metab); stroke-opacity: 1; stroke-width: 2.5; }
  .tbi2-ev-lab { font-size: 12px; font-weight: 600; }
  .tbi2-ev-ax { font-size: 11px; fill: var(--tbi-ink-2) !important; }
  .tbi2-ev-base { stroke: var(--tbi-rule); }
  #tbi2-ev .tbi2-node-dot { fill: var(--tbi-ink-2); fill-opacity: 0.6; } #tbi2-ev .tbi2-node.is-source .tbi2-node-dot, #tbi2-ev .tbi2-node.is-target .tbi2-node-dot { fill-opacity: 1; } #tbi2-ev .tbi2-node.is-source .tbi2-node-dot { fill: var(--tbi-accent); }
  #tbi2-ev .tbi2-node.is-target .tbi2-node-dot { fill: var(--tbi-metab); stroke: var(--global-bg-color); stroke-width: 2; }
  .tbi2-ws-wrap { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 1.25rem; align-items: center; }
  .tbi2-ws-wrap canvas { margin: 0 auto; display: block; }
  .tbi2-ws-grid { stroke: var(--tbi-rule); }
  .tbi2-ws-xtick, .tbi2-ws-ytick, .tbi2-ws-xlab { font-size: 11px; fill: var(--tbi-ink-2) !important; }
  .tbi2-ws-curve { fill: none; stroke-width: 2.5; }
  .tbi2-ws-curve.is-c, .tbi2-ws-pts.is-c circle { stroke: var(--tbi-accent); }
  .tbi2-ws-curve.is-l, .tbi2-ws-pts.is-l circle { stroke: var(--tbi-metab); }
  .tbi2-ws-pts circle { fill: var(--global-bg-color); stroke-width: 1.5; }
  .tbi2-ws-name { font-size: 11.5px; font-weight: 600; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 3px; }
  .tbi2-ws-name.is-c { fill: var(--tbi-accent) !important; }
  .tbi2-ws-name.is-l { fill: var(--tbi-metab) !important; }
  .tbi2-ws-now { stroke: var(--tbi-ink-2); stroke-dasharray: 2 3; }
  .tbi2-ws-me { stroke: var(--global-bg-color); stroke-width: 2; }
  .tbi2-ws-me.is-c { fill: var(--tbi-accent); }
  .tbi2-ws-me.is-l { fill: var(--tbi-metab); }
  .tbi2-legend-line { display: inline-block; width: 16px; height: 3px; border-radius: 2px; vertical-align: middle; margin-right: 0.35rem; }
  .tbi2-gal-panel { min-height: 9rem; }
  .tbi2-gal-panel p { font-size: 0.92rem; line-height: 1.55; margin: 0 0 0.5rem; }
  .tbi2-gal-head { color: var(--tbi-ink-2); font-size: 0.85rem !important; }
  .tbi2-cite { color: var(--tbi-ink-2); font-size: 0.85em; }
  .tbi2-people { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem; }
  .tbi2-person { text-align: left; font: inherit; font-size: 0.72rem; line-height: 1.3; padding: 0.45rem 0.55rem; border-radius: 8px; border: 1px solid var(--tbi-rule); background: transparent; color: var(--tbi-ink); cursor: pointer; transition: border-color 0.2s, background 0.2s; }
  .tbi2-person:hover { border-color: var(--tbi-accent); }
  .tbi2-person:focus-visible { outline: 2px solid var(--tbi-accent); outline-offset: 2px; }
  .tbi2-person[aria-pressed="true"] { border-color: var(--tbi-accent); background: var(--tbi-soft); }
  .tbi2-person-name { display: block; font-weight: 600; font-size: 0.68rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--tbi-ink-2); margin-bottom: 0.25rem; }
  .tbi2-chip { display: inline-block; margin: 0 0.2rem 0.2rem 0; padding: 0.05rem 0.4rem; border-radius: 999px; border: 1px solid var(--c, var(--tbi-rule)); color: var(--tbi-ink); white-space: nowrap; }
  .tbi2-chip.is-none { border-style: dashed; color: var(--tbi-ink-2); }
  #tbi2-pd-net .tbi2-node-dot { stroke-width: 2.5; }
  .tbi2-eq-note { font-size: 0.85rem; color: var(--tbi-ink-2); }
  @media (max-width: 720px) {
    .tbi2-split, .tbi2-split-even, .tbi2-ws-wrap { grid-template-columns: 1fr; }
    .tbi2-mx-cell { width: 1.9rem; height: 1.9rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .tbi2-kb-node.is-odd .tbi2-kb-glow { animation: none; }
    .tbi2-node-dot, .tbi2-node-halo, .tbi2-bar-fill, .tbi2-hbar, .tbi2-hbar-mine, .tbi2-asr-pt { transition: none; }
  }
---

<link rel="stylesheet" href="{{ '/assets/css/tbi-series.css' | relative_url }}">

<blockquote class="tbi-lede">
In 1735 Leonhard Euler settled a question about the bridges of a Prussian city by throwing away almost everything there was to know about the city.
</blockquote>

<nav class="tbi-series" aria-label="Series">
  <a href="{{ '/blog/2026/tbi-part-1-the-quiet-injury/' | relative_url }}"><span class="tbi-series-num">Part 1</span><span class="tbi-series-title">The quiet injury</span></a>
  <a href="{{ '/blog/2026/tbi-part-2-thinking-in-graphs/' | relative_url }}" class="is-current" aria-current="page"><span class="tbi-series-num">Part 2</span><span class="tbi-series-title">Thinking in graphs</span></a>
  <a href="{{ '/blog/2026/tbi-part-3-a-map-of-what-comes-after/' | relative_url }}"><span class="tbi-series-num">Part 3</span><span class="tbi-series-title">A map of what comes after</span></a>
</nav>

## How do you look at a tangle?

Part 1 ended with a person five years after a mild traumatic brain injury. The injury itself may be long healed in the sense that a scan would show nothing, but they are more likely than they would otherwise have been to be living with depression, or anxiety, or trouble sleeping, or chronic pain, or high blood pressure, and quite often with several of these at once. For a clinician seeing that person, this is a list of problems to manage. For anyone trying to understand what a brain injury does to people in general, though, it is something messier: thousands of people, each carrying a different handful of conditions, with the handfuls overlapping in ways that are hard to hold in your head. It is a tangle, and the question this post is about is how you look at one.

The answer I used in my undergraduate capstone at Krea University, supervised by Dr Shyam Kumar Sudhakar, and in the papers that came out of it <d-cite key="mehta2025exploring"></d-cite>, was graph theory. I had not met it formally before that project, and most of what follows is what I wish someone had shown me at the start. I want to build it up from nothing, with figures you can push around, because I think the ideas are much simpler than their notation suggests, and because almost all of them come from a person asking a plain question about who is connected to whom. If you already know the definitions, I hope the figures still give you a slightly different angle on them; I found that drawing each one forced me to understand it better than the formula had.

There is one move that runs through the whole series, and it is worth naming before the first figure. It is the act of _recasting_: taking a problem that looks like it is about one thing (a city, a group of friends, a population of patients) and deciding that the only thing that matters about it is what is connected to what. Everything else gets thrown away. That sounds like a loss, and sometimes it is, but it is also what lets a single set of tools work on bridges, friendships, power grids, brains and diseases.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">A tangle, and the same tangle laid out</div>
  <svg id="tbi2-tangle" role="img" aria-label="Thirty-six dots joined by lines, first scattered at random so that the lines cross everywhere, then pulled into four coloured clusters by a layout algorithm. The dots and lines are the same in both pictures."></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-tangle-btn" type="button">Untangle</button>
    <span class="tbi-readout" id="tbi2-tangle-read" aria-live="polite"></span>
  </div>
  <figcaption>An illustration, not data: a small random network with four groups planted in it. Scattered at random, the structure is invisible. A force-directed layout, which treats lines as springs and dots as repelling magnets, pulls the same network into shape. Nothing about who is connected to whom changes between the two pictures.</figcaption>
</figure>

## Seven bridges

Königsberg (now Kaliningrad) was built where the river Pregel splits around two islands. Seven bridges joined the islands and the two banks, and the story goes that people liked to ask whether you could take a walk through the city that crossed every bridge exactly once. Try it.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">The puzzle, then the graph</div>
  <div class="tbi2-kb-wrap"><svg id="tbi2-kb" role="group" aria-label="A stylised map of Königsberg: the river Pregel splits around the island of Kneiphof and joins again; east of Kneiphof it splits around a second island, Lomse. Seven bridges, labelled a to g, join the four land masses."></svg></div>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-kb-abstract" type="button" aria-pressed="false">Throw away the map</button>
    <button class="tbi-btn" id="tbi2-kb-reset" type="button">Start again</button>
    <button class="tbi-btn" id="tbi2-kb-solve" type="button">Find a walk</button>
    <button class="tbi-btn" id="tbi2-kb-today" type="button">Five bridges, as today</button>
  </div>
  <div class="tbi-readout" id="tbi2-kb-read" aria-live="polite"></div>
  <figcaption>A stylised map, not a survey: the shapes are simplified, but which land masses each bridge joins follows the arrangement Euler described, with bridges lettered a to g as in his paper <d-cite key="euler1741solutio"></d-cite>. Click or tab to a land mass to start, then click bridges to cross them. “Throw away the map” turns the city into a graph; there you can click two land masses to build a bridge between them and click a bridge to demolish it. The numbers in the circles count the bridges touching each land mass, and odd ones glow. The five-bridge button shows one arrangement consistent with the walk that is possible today, not a survey of the modern bridges.</figcaption>
</figure>

You will have got stuck, and so does everyone, but getting stuck six times does not prove that the seventh attempt will fail. Euler's contribution was to show that it must. His first step was to notice that nearly everything about the city is irrelevant. The shape of the islands, the length of the bridges, the streets you walk along on the way, none of it changes the answer. All that matters is which land masses are joined by how many bridges. That is the recasting, and the second half of the figure shows it: each land mass becomes a dot and each bridge a line.

The second step is an argument about counting, and I find it one of the most satisfying in mathematics. Think about any land mass that is neither where your walk starts nor where it ends. Every time you arrive there by one bridge you have to leave by another, so the bridges you use there come in pairs, and if you are to use all of them, that land mass must touch an even number of bridges. Only the start and the end can be odd. In Königsberg, Kneiphof touches five bridges and each of the other three land masses touches three, which makes four odd land masses, and a walk can have at most two ends. No route exists, and no amount of trying will find one.

Building a bridge in the figure lets you check the converse. Make every land mass even, and a walk exists that can even end where it began; make exactly two odd, and a walk exists that must start at one of them and end at the other. Euler stated this, though the proof that the condition is enough, as well as necessary, came from Carl Hierholzer in 1873 <d-cite key="hierholzer1873moglichkeit"></d-cite>, and the “Find a walk” button uses his method. The city itself has run the experiment: two of the seven bridges did not survive the bombing of the Second World War and two more were replaced by a modern road, and with the bridges that stand at the original sites today a walk is possible, provided it starts on one island and finishes on the other <d-cite key="wiki2026konigsberg"></d-cite>.

I should be honest about one part of the story as it is usually told. Euler did not draw the dots-and-lines picture. His paper, presented to the St Petersburg Academy in 1735 and published in 1741, reasons with letters for the regions and the bridges, and the diagrams we now call graphs only appear in the second half of the nineteenth century <d-cite key="hopkins2004truth"></d-cite>. The picture is ours. The idea that only the connections matter is his.

## Dots and lines

So here is the object itself. A **graph** $G = (V, E)$ is a set of **nodes** (or vertices) $V$ and a set of **edges** $E$, where each edge joins two nodes. That is the whole definition. A graph is a guest list together with a list of who knows whom; it says nothing about where anyone is standing.

Two refinements matter for this series. An edge can carry a **weight**, a number saying how strong the connection is, which makes the graph _weighted_. And an edge can have a **direction**, from one node to another, as a follow on social media does, which makes the graph _directed_. The disease networks in Part 3 are weighted and undirected. They are weighted because some pairs of conditions are much more strongly associated than others. They are undirected because the study can only see that two conditions turn up together in the same people, and co-occurrence is not causation: depression and chronic pain appearing together tells you nothing on its own about which, if either, led to the other. An arrow would claim something the data cannot support.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">Two views of one object</div>
  <div class="tbi2-split">
    <div><svg id="tbi2-mx-graph" role="group" aria-label="Six people drawn as circles, with lines between those who know each other."></svg></div>
    <div><table class="tbi2-mx" id="tbi2-mx" aria-label="Adjacency matrix: rows and columns are the six people, Asha, Ben, Chen, Dara, Eli and Farah"></table></div>
  </div>
  <div class="tbi-controls">
    <span class="tbi2-group" role="group" aria-label="Kind of graph">
      <button class="tbi-btn" type="button" data-mx="plain" aria-pressed="true">Unweighted</button>
      <button class="tbi-btn" type="button" data-mx="weighted" aria-pressed="false">Weighted</button>
      <button class="tbi-btn" type="button" data-mx="directed" aria-pressed="false">Directed</button>
    </span>
    <button class="tbi-btn" id="tbi2-mx-shuffle" type="button">Redraw the picture</button>
  </div>
  <div class="tbi-readout" id="tbi2-mx-read" aria-live="polite">Hover over or tab to a cell to light up its edge; click a cell to change it. Drag a person to move them.</div>
  <figcaption>The same small graph as a drawing and as an adjacency matrix. Row Asha, column Ben holds whatever connects Asha to Ben. In the undirected modes the matrix is symmetric, so changing one cell changes its mirror. The last column adds up each row, which is the degree (or, with weights, the strength) of the next section. Nodes can be dragged with a mouse or finger, or moved with the arrow keys once focused.</figcaption>
</figure>

The matrix on the right is called the **adjacency matrix**, $A$, and it is the same information as the drawing in a different form: $a_{ij} = 1$ if nodes $i$ and $j$ are joined and $0$ if not, or the weight of the edge in a weighted graph. Computers work with the matrix, which is why most of the formulas below are written in terms of $a_{ij}$. People work with the drawing, and the drawing has a trap in it.

Drag a few people around, or press “Redraw the picture”. The matrix does not change, because the graph has not changed. A drawing of a graph is one of infinitely many, and where a node sits on the page carries no information unless someone has decided that it should. This was the first thing about graphs that genuinely changed how I looked at pictures. When a network figure in a paper puts two nodes close together, it is tempting to read closeness as similarity, and sometimes the layout algorithm has made that roughly true; but the data is the list of edges, and everything else is a choice made to help the eye. The tangle at the top of the post is the extreme case. I will keep coming back to the question of what a picture can and cannot tell you, because it matters a great deal once the nodes are diseases.

## Who has the most friends?

The first question anyone asks about a network is who has the most connections. The **degree** of a node $u$ is the number of edges touching it,

$$
k_u = \sum_{v} a_{uv},
$$

which is just the row sum of the adjacency matrix. In a weighted graph there is a second answer: the **weighted degree**, or strength, adds up the weights instead of counting the edges,

$$
s_u = \sum_{v} w_{uv},
$$

where $w_{uv}$ is the weight of the edge between $u$ and $v$ (zero if there is none). The two can disagree, and the difference between them is worth noticing.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">Counting friends, and weighing them</div>
  <div class="tbi2-split">
    <div><svg id="tbi2-deg" role="group" aria-label="Ten people and their friendships. Line thickness shows how strong each friendship is in the weighted view."></svg></div>
    <div>
      <div class="tbi-kicker" id="tbi2-deg-title">Degree</div>
      <div class="tbi2-bars" id="tbi2-deg-bars"></div>
    </div>
  </div>
  <div class="tbi-controls">
    <span class="tbi2-group" role="group" aria-label="Measure">
      <button class="tbi-btn" type="button" data-deg="k" aria-pressed="true">Count the friends</button>
      <button class="tbi-btn" type="button" data-deg="s" aria-pressed="false">Weigh the friendships</button>
    </span>
    <button class="tbi-btn" id="tbi2-deg-paradox" type="button" aria-pressed="false">Ask everyone about their friends</button>
  </div>
  <div class="tbi-readout" id="tbi2-deg-read" aria-live="polite"></div>
  <figcaption>An invented friendship network with invented weights between 0 and 1. Node size follows the selected measure. Click or tab to a person to see their sum written out. “Ask everyone about their friends” labels each person with their own number of friends and their friends’ average.</figcaption>
</figure>

Ravi has the most friends, but they are all acquaintances; Mina has fewer, and they are close. Neither number is the right one in general, and which you want depends on the question. If you want to know who hears gossip from the most directions, count. If you want to know whose absence would be felt most, weigh. In a comorbidity network the weights are measures of how strongly two conditions are associated, so a condition with a high degree is associated with many others, and a condition with a high weighted degree has strong associations, which need not be the same conditions at all.

The third button shows something that surprised me when I first met it. Scott Feld pointed out in 1991 that most people have fewer friends than their friends do, on average <d-cite key="feld1991friends"></d-cite>, and in this little network it is true of most of the ten. It sounds like a statement about popularity and self-esteem, but it is arithmetic. A person with many friends appears in many friends' lists, so when you average over friends you count the popular people again and again. Averaging over edges rather than over people gives $\langle k^2 \rangle / \langle k \rangle$, which is never less than the ordinary mean $\langle k \rangle$ and is larger whenever degrees vary at all. The same bias applies to anything sampled by following edges. If you find patients by asking a patient to name others, or meet conditions by following them from a condition you already know, you will meet the well-connected ones first.

## How much could be connected, and is?

The next question is about the network as a whole: how full is it? Among $V$ nodes there are $V(V-1)/2$ possible pairs, and the **density** is the share of them that are actually joined,

$$
\text{density} = \frac{2E}{V(V-1)},
$$

where $E$ is the number of edges. The factor of 2 is there because each edge is one of the $V(V-1)/2$ pairs.

<figure class="tbi-fig tbi2-fig l-body">
  <div class="tbi-kicker">The edges that are, among the edges that could be</div>
  <svg id="tbi2-dens" class="tbi2-scroll-ok" role="img" aria-label="Nodes in a circle with every possible pair drawn faintly and the edges that exist drawn solid."></svg>
  <div class="tbi-controls">
    <label class="tbi-range">Nodes <input type="range" id="tbi2-dens-n" min="3" max="12" value="8" /></label>
    <label class="tbi-range">Edges <input type="range" id="tbi2-dens-e" min="0" max="28" value="9" /></label>
  </div>
  <div class="tbi2-meter" aria-hidden="true"><span id="tbi2-dens-fill"></span></div>
  <div class="tbi-readout" id="tbi2-dens-read" aria-live="polite"></div>
  <figcaption>Faint dotted lines are every pair that could be joined; solid lines are the edges present, added in a fixed random order. Add nodes with the edges held fixed and watch the density fall.</figcaption>
</figure>

I think of the faint lines as ghosts, the friendships that could exist and don't. Density is the fraction of ghosts that have become real. Adding nodes without adding edges makes a network sparser very quickly, because the number of possible pairs grows with the square of the number of nodes. Most real networks are very sparse for exactly this reason: no one can know everyone in a city. A disease network has only a couple of dozen nodes, so its density can be much higher, and in Part 3 the interesting question will be less “how dense is it?” than “which of the ghosts became real, and why those?”

## How far apart is everyone?

Two nodes that are not joined directly may still be joined through others. The **distance** $\delta(v_i, v_j)$ between them is the number of edges on the shortest path from one to the other. Finding it is easier than it sounds, and the method, **breadth-first search**, has a lovely physical picture. Drop a stone into a pond at the starting node: the first ripple reaches its neighbours, the second reaches their neighbours, and so on, and the ripple that first touches a node tells you how far away it is.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">A ripple from one node, and every distance at once</div>
  <svg id="tbi2-path" role="group" aria-label="Eighteen nodes, labelled A to R, joined in a rough grid."></svg>
  <div class="tbi-kicker" style="margin-top: 0.5rem">How many pairs are each distance apart</div>
  <svg id="tbi2-path-hist" class="tbi2-scroll-ok" role="img" aria-label="Histogram of shortest-path lengths between all pairs of nodes."></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-path-shortcut" type="button">Add a shortcut</button>
    <button class="tbi-btn" id="tbi2-path-reset" type="button">Start again</button>
  </div>
  <div class="tbi-readout" id="tbi2-path-read" aria-live="polite"></div>
  <figcaption>Click or tab to a node and press Enter to start a ripple: nodes darken in order of distance and are labelled with the number of steps. Choose a second node to see every shortest path between the two. The histogram counts all 153 pairs by distance; the blue part is the pairs that involve your starting node. Shortcuts are drawn dashed.</figcaption>
</figure>

Two numbers summarise all the distances in a connected network. The **average path length** is the mean over every pair,

$$
\bar{\delta} = \frac{2}{V(V-1)} \sum_{i \lt j} \delta(v_i, v_j),
$$

and the **diameter** is the largest distance between any pair, $D = \max_{i,j} \delta(v_i, v_j)$: the furthest apart two nodes can be. In the histogram the average is the dashed line and the diameter is the right-most bar.

Now press “Add a shortcut”. A single edge between far corners pulls the whole histogram to the left and cuts the average by a surprising amount, because it shortens not one journey but every journey that can use it. Hold on to that, because it is the heart of the small-world idea later on.

The most famous measurement of a path length was made with letters. In the 1960s Stanley Milgram and Jeffrey Travers asked 296 people in Nebraska and Boston to get a document to a stockbroker in Massachusetts by passing it only to someone they knew on first-name terms. Sixty-four of the chains arrived, and those took an average of 5.2 intermediaries <d-cite key="travers1969experimental"></d-cite>, which is where “six degrees of separation” comes from (a phrase the paper did not use, and an average over the chains that finished, which were probably the shorter ones). In 2012 a team at Facebook and the University of Milan reported the same quantity computed directly for all of Facebook's roughly 721 million active users, and the average distance came out at 4.74 <d-cite key="backstrom2012four"></d-cite>.

For diseases, a short path between two conditions would mean they are linked through a few intermediate conditions that each co-occur with the next. I want to be careful here, because it is very easy to read a path as a mechanism, as if one condition led to the next and then the next. In an undirected co-occurrence network a path is only a chain of associations. It suggests where to look; it does not show what happens.

## Are my friends friends with each other?

Pick a person and look only at their friends. Do those friends know each other? In some circles nearly everyone does, and in others the person is the only thing the friends have in common. The **clustering coefficient** of a node $u$ measures this. If $u$ has $k_u$ neighbours, they could share $k_u(k_u-1)/2$ edges among themselves; if $E_u$ of those exist, then

$$
C_u = \frac{2E_u}{k_u(k_u-1)}, \qquad 0 \le C_u \le 1.
$$

Every edge between two of $u$'s neighbours closes a **triangle** through $u$, so $E_u$ is also the number of triangles that $u$ sits in. The network's **average clustering** is the mean of $C_u$ over all nodes, $\bar{C} = \frac{1}{n} \sum_u C_u$.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">Closing triangles</div>
  <svg id="tbi2-cc" role="group" aria-label="Nine people. The selected person's friends are highlighted, possible friendships between them are dashed, and triangles are shaded."></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-cc-reset" type="button">Start again</button>
  </div>
  <div class="tbi-readout" id="tbi2-cc-read" aria-live="polite"></div>
  <figcaption>Choose a person (click, tap or press Enter) to look at the network from where they stand. Dashed lines are friendships that could exist among their friends; click one to introduce the two, and a triangle closes. Click a solid line between two of their friends to undo it. An invented network.</figcaption>
</figure>

Clustering is density again, but local: it is the density of the little network formed by one node's neighbours. That is why it says something different from the global density. A network can be sparse overall and still be made of tight knots, and social networks usually are, because friends introduce their friends to each other. One detail matters for reading the numbers in Part 3: a node with fewer than two neighbours has no pairs to close, and networkx, the library I used, gives it $C_u = 0$ and still includes it in the average <d-cite key="hagberg2008networkx"></d-cite>, so a few isolated or dangling nodes pull the average down.

In a disease network, a triangle is three conditions where each pair co-occurs more than chance would predict. A condition with many triangles sits inside a knot of conditions that tend to come together. Whether that knot reflects a shared cause, a shared treatment, a shared way of being diagnosed, or something else entirely is not something the triangle can tell you, but it is a good place to start asking.

## Do hubs hold hands?

Once you know some nodes have many connections and some few, a natural question is who connects to whom. Do the well-connected nodes link to each other, or do they mostly link to the poorly connected ones? This is **degree assortativity**, and Mark Newman's way of measuring it is wonderfully direct <d-cite key="newman2002assortative"></d-cite>. Take every edge, write down the degree at each end, and compute the ordinary correlation between the two columns:

$$
r = \frac{\sum_{e} j_e k_e / M - \left[ \sum_{e} \tfrac{1}{2}(j_e + k_e) / M \right]^2}{\sum_{e} \tfrac{1}{2}(j_e^2 + k_e^2) / M - \left[ \sum_{e} \tfrac{1}{2}(j_e + k_e) / M \right]^2},
$$

where the sums run over the $M$ edges and $j_e$, $k_e$ are the degrees of the two nodes that edge $e$ joins. It looks heavy, but it is nothing more than a Pearson correlation coefficient, and it runs from $-1$ to $+1$. Positive means hubs attach to hubs; negative means hubs attach to the periphery. My thesis wrote it in the language networkx uses, comparing the joint distribution of degrees at the two ends of an edge with what independence would give, $P(k_i, k_j) = P(k_i)P(k_j)$; it comes to the same number.

<figure class="tbi-fig tbi2-fig l-page">
  <div class="tbi-kicker">Rewiring a network without changing anyone's degree</div>
  <div class="tbi2-split-even tbi2-split">
    <div><svg id="tbi2-asr-net" class="tbi2-scroll-ok" role="img" aria-label="A network of 40 nodes; larger, warmer nodes have more connections."></svg></div>
    <div><svg id="tbi2-asr-scatter" class="tbi2-scroll-ok" role="img" aria-label="For every edge, the degree at one end plotted against the degree at the other end. Larger dots mean more edges with that pair of degrees."></svg></div>
  </div>
  <div class="tbi-controls">
    <label class="tbi-range">Hubs avoid hubs <input type="range" id="tbi2-asr-slider" min="-100" max="100" value="0" aria-label="Push the wiring towards disassortative or assortative" /> Hubs seek hubs</label>
    <button class="tbi-btn" id="tbi2-asr-reset" type="button">Start again</button>
  </div>
  <svg id="tbi2-asr-line" class="tbi2-scroll-ok" role="group" aria-label="A number line of assortativity from minus 0.6 to plus 0.6, with real networks marked and this network's value shown by a triangle."></svg>
  <div class="tbi-readout" id="tbi2-asr-read" aria-live="polite"></div>
  <figcaption>Left: a network grown by preferential attachment, so that it has a few hubs. Right: one dot for each pair of degrees found at the two ends of an edge (each edge counted both ways round); assortativity is the correlation in this plot. The slider rewires the network by repeatedly swapping the ends of two edges, a move that leaves every node's degree exactly as it was. Below: the values Newman reported for real networks <d-cite key="newman2002assortative"></d-cite>; hover over, tap or tab to a mark for its value.</figcaption>
</figure>

The rewiring in the figure is the important part, because it shows that assortativity is a property of the wiring and not of the degrees. Every node keeps exactly the number of edges it started with, yet the network can be pushed from hubs that avoid each other to hubs that cling together, and the cloud of dots in the scatter plot tilts with it. When you push hard enough, the hubs fold into a dense core and the low-degree nodes are left to link among themselves in long strings.

Newman found that social networks tend to be assortative and technological and biological networks tend to be disassortative <d-cite key="newman2002assortative"></d-cite>, and the marks under the figure show some of his values. One way to read the difference: in a network of collaborators, prolific people work with prolific people, whereas in the internet or a protein network, hubs are, in a sense, there to serve the periphery. For a disease network, positive assortativity would mean that conditions associated with many others tend to be associated with each other, forming a core of highly comorbid conditions, while the rarer, less connected conditions sit in their own corners. One caution I would give my undergraduate self: on a network of a couple of dozen nodes, this coefficient rests on few edges and can move a long way if a handful of them change.

## Who matters?

“Which node is most important?” is the question people most want a network to answer, and it does not have one answer. It has several, each a different way of making “important” precise, and they are known collectively as **centralities**. My research used three.

**Degree centrality** is the simplest: a node matters if it has many connections. It is the degree, usually divided by $n-1$ so that a node connected to everyone scores 1. The thesis wrote it via the neighbourhood $N(u) = \lbrace v \in V : uv \in E \rbrace$, the set of nodes joined to $u$, whose size is the degree.

**Betweenness centrality** asks a different question: how much of the traffic in the network has to pass through this node? Picture everyone sending a message to everyone else along the shortest route available. A node that sits on many of those routes is a toll booth, a broker, a bridge between parts of the network that would otherwise have to go a long way round. Make a guess before anything is revealed.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">The toll booth</div>
  <div class="tbi2-stack">
    <svg id="tbi2-bt" role="group" aria-label="Fifteen people in two groups, one around Hal and one around Rosa, with Bea between them."></svg>
    <canvas id="tbi2-bt-canvas" aria-hidden="true"></canvas>
  </div>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-bt-reveal" type="button">Just show me</button>
    <button class="tbi-btn" id="tbi2-bt-flow" type="button" aria-pressed="false">Send travellers</button>
    <button class="tbi-btn" id="tbi2-bt-remove" type="button" aria-pressed="false">Close Bea</button>
  </div>
  <div class="tbi-readout" id="tbi2-bt-read" aria-live="polite"></div>
  <div class="tbi2-bars" id="tbi2-bt-bars" aria-label="Highest betweenness"></div>
  <figcaption>An invented network. Click, tap or tab to the person you think lies on the most shortest paths. After the reveal, node size shows normalised betweenness and the bars list the top six. “Send travellers” routes random journeys along randomly chosen shortest paths (each dot is one traveller), and the glow around each person grows with the traffic through them. “Close Bea” removes her.</figcaption>
</figure>

Most people pick Hal or Rosa, because they are the obvious hubs, with six connections each. But Bea, with four, carries more than half of all the shortest paths between other pairs, because every journey from one side to the other has to go through her. Close her and the network falls into two islands. Hal and Rosa, for all their friends, are each only the centre of their own half.

Formally, if $\sigma_{uv}$ is the number of shortest paths between $u$ and $v$ and $\sigma_{uv}(w)$ is the number of those that pass through $w$, the betweenness of $w$ is

$$
C_B(w) = \sum_{u \neq v \neq w} \frac{\sigma_{uv}(w)}{\sigma_{uv}},
$$

so that each pair contributes the fraction of its shortest paths that $w$ lies on <d-cite key="freeman1977set"></d-cite>. Computing this naively means finding every shortest path between every pair; the trick that makes it fast, and that this page uses, is Ulrik Brandes's 2001 algorithm, which runs one breadth-first search per node and accumulates the fractions on the way back <d-cite key="brandes2001faster"></d-cite>.<d-footnote>A note for anyone comparing numbers. The thesis writes the sum over $(u,v) \in V^2$, which counts each pair twice in an undirected graph. networkx sums over unordered pairs and, by default, divides by $(n-1)(n-2)/2$, the number of pairs not involving $w$, so that a value of 1 means $w$ is on every shortest path between every other pair (the centre of a star). The betweenness values in my thesis and papers, and in Part 3, are normalised this way. In this figure Bea’s 0.55 means that 55% of the pairs’ shortest-path traffic runs through her.</d-footnote>

Milgram's letters contain a real toll booth. Of the 64 chains that reached the stockbroker, 16 reached him through the same person, a clothing merchant in his home town, and two business associates accounted for another 15 between them <d-cite key="travers1969experimental"></d-cite>. Half of all the successful chains funnelled through three people. In a disease network a high-betweenness condition is one that sits between groups of conditions that otherwise rarely meet. The papers made a point of this because betweenness did not simply track how common a condition was: some conditions were rare after mild TBI and yet sat on many of the network's shortest paths. I will come back to what that might mean in Part 3.

**Eigenvector centrality** gives the third answer, and it is the one that took me longest to feel. It says you are important if your neighbours are important. That sounds circular, and it is, but the circle can be solved. Give every node a score $x_v$ and ask that each score be proportional to the sum of its neighbours' scores:

$$
x_v = \frac{1}{\lambda} \sum_{t \in M(v)} x_t = \frac{1}{\lambda} \sum_{t \in V} a_{vt}\, x_t,
$$

where $M(v)$ is the set of $v$'s neighbours and $\lambda$ is a constant. Written with the adjacency matrix, this is the eigenvector equation $A\mathbf{x} = \lambda \mathbf{x}$, and choosing the largest eigenvalue guarantees, for a connected network, a solution in which every score is positive <d-cite key="bonacich1972factoring"></d-cite>. The way to find it is to stop solving and start iterating. Give everyone a score of 1, then let everyone pass their score to their neighbours, and repeat. I picture a drop of dye in water: it pools wherever the channels are densest, and after enough rounds the pattern stops changing.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">Importance by association</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi2-group-label">Who ends up more central?</span>
    <span class="tbi2-group" role="group" aria-label="Your prediction">
      <button class="tbi-btn" type="button" data-ev-guess="Pat" aria-pressed="false">Pat, with seven friends</button>
      <button class="tbi-btn" type="button" data-ev-guess="Quinn" aria-pressed="false">Quinn, with three</button>
    </span>
  </div>
  <div class="tbi2-stack">
    <svg id="tbi2-ev" class="tbi2-scroll-ok" role="img" aria-label="Pat is connected to six people who know no one else, and to Ed. Quinn is connected to Ada, Bo and Cy, members of a tight group of five."></svg>
    <canvas id="tbi2-ev-canvas" aria-hidden="true"></canvas>
  </div>
  <svg id="tbi2-ev-chart" class="tbi2-scroll-ok" role="img" aria-label="Scores after each round."></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-ev-step" type="button">Pass the scores on</button>
    <button class="tbi-btn" id="tbi2-ev-run" type="button">Run until it settles</button>
    <button class="tbi-btn" id="tbi2-ev-reset" type="button">Start again</button>
  </div>
  <div class="tbi-readout" id="tbi2-ev-read" aria-live="polite"></div>
  <figcaption>Each round, every node keeps its score and adds its neighbours’ scores; the scores are then rescaled so that the highest is 1. Node size and the labels show the current scores, and the chart tracks them round by round, with Pat in blue and Quinn in amber. Keeping your own score (iterating with $A + I$ rather than $A$) is what networkx does too: it stops the scores see-sawing on star-shaped parts of the graph and does not change where they end up.</figcaption>
</figure>

After one round the scores are just degree plus one, and Pat leads easily. By the fourth round Quinn has overtaken Pat, because Quinn's three friends are in the dense core and their scores keep growing, while Pat's six friends know no one else and have nothing to pass back. Eigenvector centrality remembers who your friends are, and their friends, all the way out. The same idea, with some important modifications for direction and for pages that link nowhere, is at the heart of PageRank, the method Google was founded on <d-cite key="brin1998anatomy"></d-cite>. In a disease network a condition with high eigenvector centrality is associated with conditions that are themselves highly associated: it is embedded in the core. In the published version of my work, degree and eigenvector centrality turned out to be highly correlated across conditions, while betweenness told a different story <d-cite key="mehta2025exploring"></d-cite>, which is part of why the papers leaned on betweenness.

## Small worlds

Two observations from earlier sections sit uneasily together. Social networks are full of triangles, with friends of friends being friends, which makes them locally dense and, you might think, slow to cross: a world of tight villages. Yet the average distance between two people is tiny. How can a network be both cliquish and small?

In 1998 Duncan Watts and Steven Strogatz answered this with a model simple enough to play with <d-cite key="watts1998collective"></d-cite>. Start with a ring of nodes, each joined to its nearest neighbours on either side. This is the village: lots of triangles, and a long way round to the other side. Now go through the edges and, with some probability $p$, cut one end loose and reattach it to a node chosen at random. At $p = 0$ you have the ring; at $p = 1$ you have a random network. The question is what happens in between.

<figure class="tbi-fig tbi2-fig l-page">
  <div class="tbi-kicker">From a ring to a random graph</div>
  <div class="tbi2-ws-wrap">
    <div><canvas id="tbi2-ws-ring" role="img" aria-label="A ring of 100 nodes, each joined to its three nearest neighbours on each side. Rewired edges are drawn as amber chords across the ring."></canvas></div>
    <div><svg id="tbi2-ws-plot" class="tbi2-scroll-ok" role="img" aria-label="Normalised clustering and path length against rewiring probability."></svg></div>
  </div>
  <div class="tbi-controls">
    <label class="tbi-range">Rewiring probability <input type="range" id="tbi2-ws-p" min="0" max="100" value="0" /></label>
    <span class="tbi-readout" id="tbi2-ws-pval"></span>
    <button class="tbi-btn" id="tbi2-ws-new" type="button">A different random draw</button>
  </div>
  <div class="tbi-legend">
    <span><span class="tbi2-legend-line" style="background: var(--tbi-accent)"></span>Clustering, as a share of the ring’s</span>
    <span><span class="tbi2-legend-line" style="background: var(--tbi-metab)"></span>Average path length, as a share of the ring’s</span>
  </div>
  <div class="tbi-readout" id="tbi2-ws-read" aria-live="polite"></div>
  <figcaption>The curves are computed in your browser when the figure comes into view: for each of 17 values of $p$, 20 random rewirings of a ring of $n = 100$ nodes with $k = 6$ neighbours each, averaged and divided by the ring’s own values. (Watts and Strogatz used $n = 1000$ and $k = 10$, so their curves are smoother and the drop sits further left <d-cite key="watts1998collective"></d-cite>.) The large dots are the single network drawn on the left. The slider is logarithmic.</figcaption>
</figure>

The path length collapses long before the clustering does. A rewiring probability of a few in a hundred is enough to bring the average distance most of the way down to that of a random network, because each rewired edge is a shortcut like the one you added in the path-length figure, and shortcuts help everyone. But a few shortcuts barely disturb the triangles, so the network still looks like a village from the inside. That window, high clustering and short paths together, is what Watts and Strogatz called a **small world**, and they showed that real networks sat in it. The film-actor network had an average path length of 3.65 against 2.99 for a random network of the same size, but a clustering of 0.79 against 0.00027; the western United States power grid had 18.7 against 12.4 for path length and 0.08 against 0.005 for clustering; the neural network of the worm _C. elegans_ had 2.65 against 2.25, and 0.28 against 0.05 <d-cite key="watts1998collective,albert2002statistical"></d-cite>.

That comparison against a random network of the same size is the part that matters, and it is a part I skipped as an undergraduate. My thesis described the TBI comorbidity network as having “a relatively small-world structure” on the strength of its clustering and its short average path. Reading it now, I would want to see those numbers next to the same numbers for random networks with the same nodes and edges before saying so, because a network of 25 nodes and 69 edges will have short paths almost however it is wired. I mention this not to undo the claim but because it is a good example of how the vocabulary of networks can run ahead of the evidence.

## Islands

The last idea is about groups. Many networks are made of communities, sets of nodes much more densely connected to each other than to the rest, and finding them is one of the most common things people do with a network. One of the most intuitive methods, from Michelle Girvan and Mark Newman <d-cite key="girvan2002community"></d-cite>, uses betweenness backwards. The edges that link communities are the bridges, so they carry many shortest paths; remove the busiest edge, recompute, and repeat, and the network falls apart along its natural seams.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">Cutting the busiest edge, again and again</div>
  <svg id="tbi2-gn" class="tbi2-scroll-ok" role="img" aria-label="A network of eighteen nodes in which edge thickness shows edge betweenness."></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-gn-step" type="button">Remove the busiest edge</button>
    <button class="tbi-btn" id="tbi2-gn-reset" type="button">Start again</button>
  </div>
  <div class="tbi-readout" id="tbi2-gn-read" aria-live="polite"></div>
  <figcaption>An invented network with three groups planted in it. Edge thickness is edge betweenness, recomputed after every removal; the edge about to go is highlighted first. Once the network breaks, nodes are coloured by the piece they are in.</figcaption>
</figure>

The study in Part 3 uses a cousin of this idea, adapted from a study of COVID-19 comorbidities in Mexico. Instead of edges, it removes the _node_ with the highest betweenness, recomputes, and repeats until no node stands out, and then puts each removed node back into every group it touched. That last step means a condition can belong to more than one cluster, which for diseases seems right to me: a condition that bridges two groups belongs, in a sense, to both. I will leave the details for Part 3.

## One graph, many worlds

By now there are enough measures to see the real payoff of recasting. Once a problem is a graph, the same handful of numbers can be computed for it, but what they mean depends entirely on what the nodes and edges stand for. Below is one small network and four measures, and you can choose what it represents.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi2-group-label">The nodes are</span>
    <span class="tbi2-group" role="group" aria-label="What the nodes are">
      <button class="tbi-btn" type="button" data-world="friends" aria-pressed="true">People</button>
      <button class="tbi-btn" type="button" data-world="flights" aria-pressed="false">Airports</button>
      <button class="tbi-btn" type="button" data-world="power" aria-pressed="false">Substations</button>
      <button class="tbi-btn" type="button" data-world="brain" aria-pressed="false">Brain regions</button>
      <button class="tbi-btn" type="button" data-world="disease" aria-pressed="false">Diseases</button>
    </span>
  </div>
  <div class="tbi-controls">
    <span class="tbi2-group-label">The measure is</span>
    <span class="tbi2-group" role="group" aria-label="Measure">
      <button class="tbi-btn" type="button" data-measure="degree" aria-pressed="false">Degree</button>
      <button class="tbi-btn" type="button" data-measure="betweenness" aria-pressed="true">Betweenness</button>
      <button class="tbi-btn" type="button" data-measure="eigenvector" aria-pressed="false">Eigenvector</button>
      <button class="tbi-btn" type="button" data-measure="clustering" aria-pressed="false">Clustering</button>
    </span>
  </div>
  <div class="tbi2-split">
    <div><svg id="tbi2-gal" class="tbi2-scroll-ok" role="img" aria-label="A 13-node network."></svg></div>
    <div class="tbi2-gal-panel" id="tbi2-gal-panel" aria-live="polite"></div>
  </div>
  <figcaption>The network never changes; only the reading does. Each measure picks out a different node: G has the most connections, F carries the most traffic, C sits in the densest knot, and several nodes have perfectly clustered neighbourhoods. The interpretations are mine, as illustrations, with the cited studies as examples of each idea in real networks.</figcaption>
</figure>

Some of the most striking uses of graphs in medicine have been exactly this kind of recasting. In 2007 Goh and colleagues built a “human disease network” from 1,284 disorders and 1,777 genes, joining two disorders whenever a gene was implicated in both <d-cite key="goh2007human"></d-cite>. Nothing about that network required new data; it was a new way of looking at a catalogue that already existed, and it showed disorders clustering by shared genetic origin. Two years later Hidalgo and colleagues built a phenotypic disease network from the disease histories of more than 30 million patients, linking diseases that co-occurred in the same people, and found that patients tended to develop diseases close in the network to those they already had <d-cite key="hidalgo2009dynamic"></d-cite>. That is very nearly the kind of network my research built for mild TBI, on a much smaller scale, and the field that grew around these ideas is now often called network medicine <d-cite key="barabasi2011network"></d-cite>.

The recasting also works with people as the nodes. Christakis and Fowler followed a network of 12,067 people from the Framingham Heart Study over three decades and reported that a person's chance of becoming obese rose by 57% if a friend became obese <d-cite key="christakis2007spread"></d-cite>, a finding that started a long and useful argument about how much of that is contagion and how much is people choosing similar friends. Epidemics are the clearest case of all. On networks where a few nodes have enormous numbers of contacts, Pastor-Satorras and Vespignani showed that an infection need not cross any threshold of infectiousness to persist <d-cite key="pastorsatorras2001epidemic"></d-cite>, which is a formal version of why super-spreaders matter. And the same structure that makes such networks robust to random failures makes them fragile to the targeted loss of their hubs <d-cite key="albert2000error"></d-cite>, which is why it matters so much to know which nodes those are.

## From people to diseases

Everything so far has been about networks where the nodes were obvious: people, airports, land masses. The research in Part 3 makes one more recasting, and it is the least obvious of all. The raw data is a table of people, each with a list of conditions they do or do not have. Nobody hands you a network. You have to decide that the conditions will be the nodes, and that two conditions are connected when they turn up together in the same people.

<figure class="tbi-fig tbi2-fig l-body-outset">
  <div class="tbi-kicker">Turning people into a disease network</div>
  <div class="tbi2-split tbi2-split-even">
    <div id="tbi2-pd-people" class="tbi2-people" role="group" aria-label="Ten invented people and their conditions. Press a person to add or remove them."></div>
    <div><svg id="tbi2-pd-net" class="tbi2-scroll-ok" role="img" aria-label="Eight conditions arranged in a circle."></svg></div>
  </div>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi2-pd-next" type="button">Add the next person</button>
    <button class="tbi-btn" id="tbi2-pd-all" type="button">Add everyone</button>
    <button class="tbi-btn" id="tbi2-pd-reset" type="button">Start again</button>
  </div>
  <div class="tbi-readout" id="tbi2-pd-read" aria-live="polite"></div>
  <figcaption>Ten invented people, not patients and not data from the study: an illustration of the construction only. Each person you add draws or thickens an edge between every pair of conditions they have, and each condition grows with the number of people who have it. Colours follow the condition groups used throughout the series.</figcaption>
</figure>

Add everyone and look at what you get. Depression ends up connected to almost everything, but that is partly because depression is the most common condition among these ten invented people; a common condition will co-occur with lots of others by chance alone. Counting shared people is therefore not quite the right weight for an edge. What you want to know is whether two conditions occur together _more than you would expect if they had nothing to do with each other_, and that is a question about the people who have neither as well as the people who have both, which is why Person 10, who adds nothing to the drawing, still matters. Part 3 answers it with a correlation coefficient for yes-or-no data and a significance test, and only draws an edge when the association is unlikely to be a coincidence.

Once that network exists, every measure in this post becomes a question about brain injury. What would a hub be: a condition so entangled with others that treating it might ease several more? What would a bridge be: a condition that links, say, mental health conditions to cardiovascular ones, so that it sits between two specialities that rarely talk? What would a triangle be: three conditions that keep company, and what might they share? Would the network be assortative, with the most comorbid conditions clinging together in a core? Would it look different for younger and older people? And how much of what we see would reflect the biology of an injured brain, rather than who gets diagnosed with what, and who stays in a study long enough to be asked?

Some of those questions the study could answer, and some it could not, and Part 3 tries to be clear about which are which.

<nav class="tbi-series" aria-label="Series">
  <a href="{{ '/blog/2026/tbi-part-1-the-quiet-injury/' | relative_url }}"><span class="tbi-series-num">Part 1</span><span class="tbi-series-title">The quiet injury</span></a>
  <a href="{{ '/blog/2026/tbi-part-2-thinking-in-graphs/' | relative_url }}" class="is-current" aria-current="page"><span class="tbi-series-num">Part 2</span><span class="tbi-series-title">Thinking in graphs</span></a>
  <a href="{{ '/blog/2026/tbi-part-3-a-map-of-what-comes-after/' | relative_url }}"><span class="tbi-series-num">Part 3</span><span class="tbi-series-title">A map of what comes after</span></a>
</nav>

<script src="{{ '/assets/js/vendor/d3.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/posts/tbi-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/posts/tbi-part2.js' | relative_url }}"></script>
