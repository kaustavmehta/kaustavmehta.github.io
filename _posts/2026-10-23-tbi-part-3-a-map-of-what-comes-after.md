---
layout: distill
title: "A map of what comes after"
description: "Part 3 of a series on traumatic brain injury. The research itself: from 225 people five years after a mild brain injury to a network of 26 conditions, its hubs and bridges, its clusters, how it differs between younger and older people, and what it cannot tell us."
tags: traumatic-brain-injury graph-theory network-medicine comorbidity
cover: tbi-map
categories: research
giscus_comments: false
related_posts: false
date: 2026-10-23 10:00:00 +0530

authors:
  - name: Kaustav Mehta
    url: "https://kaustavmehta.github.io"
    affiliations:
      name: Krea University

bibliography: 2026-10-23-tbi-part-3-a-map-of-what-comes-after.bib

toc:
  - name: Where we left off
  - name: Where the numbers come from
  - name: What was asked, and how it became data
  - name: From people to pairs
  - name: Where to draw the line
  - name: The map
  - name: Reading the map
  - name: Finding the neighbourhoods
  - name: Younger and older
  - name: What it means, and what it does not
  - name: Beyond the paper, and open questions

_styles: >
  .tbi3-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .tbi3-fig svg { width: 100%; overflow: visible; user-select: none; -webkit-user-select: none; }
  .tbi3-fig .tbi-readout { min-height: 3em; line-height: 1.5; margin-top: 0.5rem; }
  .tbi3-fig .tbi-btn:disabled { opacity: 0.4; cursor: default; }
  .tbi3-error { font-size: 0.85rem; color: var(--tbi-ink-2); border: 1px dashed var(--tbi-rule); border-radius: 8px; padding: 0.6rem 0.8rem; }
  .tbi3-group-label { font-size: 0.72rem; color: var(--tbi-ink-2); margin-right: 0.2rem; align-self: center; }
  .tbi3-group { display: inline-flex; flex-wrap: wrap; gap: 0.35rem; }
  .tbi3-c-psych { --c: var(--tbi-psych); } .tbi3-c-subst { --c: var(--tbi-subst); } .tbi3-c-cardio { --c: var(--tbi-cardio); } .tbi3-c-metab { --c: var(--tbi-metab); }
  .tbi3-c-resp { --c: var(--tbi-resp); } .tbi3-c-musc { --c: var(--tbi-musc); } .tbi3-c-neuro { --c: var(--tbi-neuro); } .tbi3-c-other { --c: var(--tbi-other); }
  .tbi3-swatch { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--c); margin-right: 0.4rem; vertical-align: middle; }
  .tbi3-grid { stroke: var(--tbi-rule); }
  .tbi3-tick { font-size: 11px; fill: var(--tbi-ink-2) !important; font-variant-numeric: tabular-nums; }
  .tbi3-tick-strong { fill: var(--tbi-ink) !important; }
  .tbi3-axis-label { font-size: 11px; fill: var(--tbi-ink-2) !important; }
  .tbi3-gcs-severe { fill: var(--tbi-injury); stroke: var(--tbi-injury); }
  .tbi3-gcs-moderate { fill: var(--tbi-metab); stroke: var(--tbi-metab); }
  .tbi3-gcs-mild { fill: var(--tbi-resp); stroke: var(--tbi-resp); }
  .tbi3-gcs-bar rect { stroke: none; opacity: 0.85; transition: fill 0.4s; }
  .tbi3-gcs-bar { outline: none; cursor: default; }
  .tbi3-gcs-bar:focus-visible rect { stroke: var(--tbi-ink); stroke-width: 2; }
  .tbi3-band-line { stroke-width: 3; stroke-linecap: round; }
  .tbi3-band-text { font-size: 11px; font-weight: 600; fill: var(--tbi-ink) !important; }
  .tbi3-steps { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.4rem; margin: 0.6rem 0 0.8rem; }
  .tbi3-step { text-align: left; font: inherit; padding: 0.45rem 0.55rem; border-radius: 8px; border: 1px solid var(--tbi-rule); background: transparent; color: var(--tbi-ink-2); cursor: pointer; transition: border-color 0.2s, background 0.2s, color 0.2s; }
  .tbi3-step:hover { border-color: var(--tbi-accent); }
  .tbi3-step:focus-visible { outline: 2px solid var(--tbi-accent); outline-offset: 2px; }
  .tbi3-step[aria-pressed="true"] { border-color: var(--tbi-accent); background: var(--tbi-soft); color: var(--tbi-ink); }
  .tbi3-step.is-past { color: var(--tbi-ink); }
  .tbi3-step-n { display: block; font-family: "Newsreader", Georgia, serif; font-size: 1.15rem; line-height: 1.1; color: var(--tbi-accent); font-variant-numeric: tabular-nums; }
  .tbi3-step-l { display: block; font-size: 0.68rem; line-height: 1.3; margin-top: 0.15rem; }
  #tbi3-funnel { width: 100%; display: block; }
  .tbi3-demo { display: grid; grid-template-columns: 1.3fr 1fr 1.2fr; gap: 1.25rem; }
  .tbi3-demo-svg { width: 100%; display: block; }
  .tbi3-demo-bar { fill: var(--tbi-accent); opacity: 0.85; }
  .tbi3-demo-track { fill: var(--tbi-soft); }
  .tbi3-demo-ghost { stroke: var(--tbi-ink); stroke-width: 2; opacity: 0.5; }
  .tbi3-fu-a { fill: var(--tbi-ink-2); opacity: 0.25; }
  .tbi3-fu-b { fill: var(--tbi-ink-2); opacity: 0.55; }
  .tbi3-fu-c { fill: var(--tbi-accent); }
  .tbi3-fu-n { font-size: 10.5px; font-weight: 600; fill: var(--tbi-accent) !important; }
  .tbi3-key { display: inline-block; width: 16px; height: 3px; border-radius: 2px; vertical-align: middle; margin-right: 0.35rem; }
  .tbi3-key.tbi3-fu-a { background: var(--tbi-ink-2); opacity: 0.35; height: 10px; width: 10px; }
  .tbi3-key.tbi3-fu-b { background: var(--tbi-ink-2); opacity: 0.65; height: 10px; width: 10px; }
  .tbi3-key.tbi3-fu-c { background: var(--tbi-accent); height: 10px; width: 10px; }
  .tbi3-person { stroke: none; }
  .tbi3-p-both { fill: var(--tbi-accent); }
  .tbi3-p-a { fill: var(--tbi-psych); }
  .tbi3-p-b { fill: var(--tbi-metab); }
  .tbi3-p-none { fill: var(--tbi-ink-2); opacity: 0.35; }
  .tbi3-cell { fill: var(--tbi-soft); stroke: var(--tbi-rule); }
  .tbi3-cell.is-both { stroke: var(--tbi-accent); stroke-width: 1.5; }
  .tbi3-cell-label { font-size: 11.5px; font-weight: 600; fill: var(--tbi-ink) !important; }
  .tbi3-cell-exp { font-size: 11px; font-weight: 600; fill: var(--tbi-ink-2) !important; }
  .tbi3-cell-axis { font-size: 11px; fill: var(--tbi-ink-2) !important; letter-spacing: 0.04em; text-transform: uppercase; }
  .tbi3-ghost { fill: none; stroke: var(--tbi-ink); stroke-width: 1.2; stroke-dasharray: 2 2; }
  .tbi3-split { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 1.25rem; align-items: start; }
  .tbi3-split-even { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); margin-top: 0.75rem; }
  .tbi3-split-beyond { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); align-items: center; }
  .tbi3-eq { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-family: "Newsreader", Georgia, serif; font-size: 1.05rem; margin-bottom: 0.6rem; font-variant-numeric: tabular-nums; }
  .tbi3-frac { display: inline-flex; flex-direction: column; text-align: center; font-size: 0.92rem; }
  .tbi3-frac span:first-child { border-bottom: 1px solid var(--tbi-ink); padding: 0 0.3rem 0.15rem; }
  .tbi3-frac span:last-child { padding-top: 0.15rem; }
  .tbi3-eq strong { color: var(--tbi-accent); font-weight: 600; font-size: 1.25rem; }
  .tbi3-eq-note { font-size: 0.85rem; line-height: 1.5; color: var(--tbi-ink); }
  .tbi3-rr-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.25rem; align-items: center; }
  .tbi3-rr-ctl { display: grid; gap: 0.6rem; }
  .tbi3-rr-ctl label { display: grid; grid-template-columns: 7.5rem 1fr 6.5rem; gap: 0.5rem; align-items: center; font-size: 0.78rem; color: var(--tbi-ink-2); }
  .tbi3-rr-ctl input[type="range"] { accent-color: var(--global-theme-color); width: 100%; }
  .tbi3-rr-ctl output { font-variant-numeric: tabular-nums; color: var(--tbi-ink); font-size: 0.8rem; }
  .tbi3-rr-bar { display: grid; grid-template-columns: 7.5rem 1fr 3.4rem; gap: 0.6rem; align-items: center; font-size: 0.8rem; margin: 0.4rem 0; }
  .tbi3-rr-track { height: 14px; border-radius: 7px; background: var(--tbi-soft); overflow: hidden; border: 1px solid var(--tbi-rule); }
  .tbi3-rr-fill { display: block; height: 100%; width: 0; background: var(--tbi-accent); transition: width 0.25s; }
  #tbi3-rr-rr .tbi3-rr-fill { background: var(--tbi-metab); }
  .tbi3-rr-val { font-family: "Newsreader", Georgia, serif; font-size: 1.1rem; font-variant-numeric: tabular-nums; }
  .tbi3-rr-scale { font-size: 0.7rem; color: var(--tbi-ink-2); }
  .tbi3-edge { stroke: var(--tbi-ink-2); stroke-opacity: 0.4; stroke-linecap: round; transition: stroke 0.25s, stroke-opacity 0.25s; }
  .tbi3-edge.is-hot { stroke: var(--tbi-accent); stroke-opacity: 0.95; }
  .tbi3-edge.is-faint { stroke-opacity: 0.08; }
  .tbi3-edge.is-gone { stroke-opacity: 0.05; }
  .tbi3-edge.is-new { stroke: var(--tbi-metab); stroke-opacity: 0.8; }
  .tbi3-edge.is-neg { stroke: var(--tbi-cardio); stroke-opacity: 0.9; stroke-dasharray: 4 3; }
  .tbi3-edge.is-young { stroke: var(--tbi-resp); stroke-opacity: 0.75; }
  .tbi3-edge.is-old { stroke: var(--tbi-metab); stroke-opacity: 0.85; }
  .tbi3-edge.is-both { stroke: var(--tbi-ink-2); stroke-opacity: 0.55; }
  .tbi3-edge.is-young.is-faint, .tbi3-edge.is-old.is-faint, .tbi3-edge.is-both.is-faint { stroke-opacity: 0.07; }
  .tbi3-edge.is-young.is-hot, .tbi3-edge.is-old.is-hot { stroke-opacity: 1; }
  .tbi3-edge.is-both.is-hot { stroke: var(--tbi-ink); stroke-opacity: 0.8; }
  .tbi3-edge.is-cledge { stroke: var(--tbi-ink-2); stroke-opacity: 0.55; }
  .tbi3-node { outline: none; cursor: default; }
  .tbi3-node[role="button"] { cursor: pointer; }
  .tbi3-hit { fill: transparent; }
  .tbi3-dot { fill: var(--c); stroke: var(--global-bg-color); stroke-width: 1.5; transition: opacity 0.25s, fill 0.3s; }
  .tbi3-ring { fill: none; stroke: transparent; stroke-width: 2; }
  .tbi3-label { font-size: 12px; fill: var(--tbi-ink) !important; pointer-events: none; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 3.5px; stroke-linejoin: round; transition: opacity 0.25s; }
  svg.tbi3-small-labels .tbi3-label { font-size: 10.5px; }
  .tbi3-node.is-dim .tbi3-dot { opacity: 0.18; }
  .tbi3-node.is-dim .tbi3-label { opacity: 0.25; }
  .tbi3-node.is-focus .tbi3-ring, .tbi3-node:focus-visible .tbi3-ring { stroke: var(--tbi-ink); }
  .tbi3-node.is-focus .tbi3-label { font-weight: 700; }
  .tbi3-node.is-gone .tbi3-dot { opacity: 0.12; }
  .tbi3-node.is-gone .tbi3-label { opacity: 0.2; text-decoration: line-through; }
  .tbi3-node.is-next .tbi3-ring { stroke: var(--tbi-injury); stroke-width: 2.5; stroke-dasharray: 3 2; }
  .tbi3-node.is-bridge .tbi3-dot { fill: var(--global-bg-color); stroke: var(--c); stroke-width: 2.5; }
  .tbi3-node.is-core .tbi3-ring { stroke: var(--tbi-accent); }
  .tbi3-node.is-cl .tbi3-ring { stroke: var(--cl); stroke-width: 3; }
  .tbi3-tray-label { font-size: 11px; fill: var(--tbi-ink-2) !important; }
  .tbi3-netwrap { position: relative; }
  .tbi3-netwrap svg.is-zoomed { cursor: grab; }
  .tbi3-zoombar { position: absolute; right: 0; top: 0; display: flex; flex-direction: column; gap: 0.3rem; z-index: 2; }
  .tbi3-zoombar .tbi-btn { width: 2.2rem; height: 2.2rem; padding: 0; font-size: 1rem; line-height: 1; background: var(--global-bg-color); }
  .tbi3-card { min-height: 12rem; font-size: 0.85rem; line-height: 1.5; }
  .tbi3-card-hint { color: var(--tbi-ink-2); margin: 0; }
  .tbi3-card-head { font-size: 1rem; }
  .tbi3-card-cat { font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--tbi-ink-2); margin: 0.1rem 0 0.5rem; }
  .tbi3-card-grid { display: grid; grid-template-columns: 1fr auto; gap: 0.15rem 0.8rem; font-variant-numeric: tabular-nums; margin-bottom: 0.6rem; }
  .tbi3-card-grid span:nth-child(2n) { text-align: right; }
  .tbi3-ci { color: var(--tbi-ink-2); font-size: 0.75rem; }
  .tbi3-chip { font: inherit; font-size: 0.72rem; display: inline-block; margin: 0.2rem 0.25rem 0 0; padding: 0.1rem 0.45rem; border-radius: 999px; border: 1px solid var(--c); background: transparent; color: var(--tbi-ink); cursor: pointer; }
  .tbi3-chip span { color: var(--tbi-ink-2); font-variant-numeric: tabular-nums; }
  .tbi3-chip:focus-visible { outline: 2px solid var(--tbi-accent); outline-offset: 2px; }
  #tbi3-map-heat { display: block; touch-action: manipulation; outline: none; border-radius: 4px; }
  #tbi3-map-heat:focus-visible { box-shadow: 0 0 0 2px var(--tbi-accent); }
  .tbi3-heat-read { font-size: 0.78rem; color: var(--tbi-ink); min-height: 3.2em; margin-top: 0.4rem; line-height: 1.45; }
  .tbi3-table { width: 100%; font-size: 0.78rem; border-collapse: collapse; }
  .tbi3-table th, .tbi3-table td { text-align: left; padding: 0.35rem 0.4rem; border-bottom: 1px solid var(--tbi-rule); vertical-align: top; font-weight: normal; }
  .tbi3-table thead th { font-weight: 600; color: var(--tbi-ink-2); }
  .tbi3-table tbody th { white-space: nowrap; font-weight: 600; }
  .tbi3-list { max-height: 26rem; overflow: auto; margin-top: 0.75rem; border: 1px solid var(--tbi-rule); border-radius: 8px; }
  .tbi3-gcards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.7rem; }
  .tbi3-gcard { border: 1px solid var(--tbi-rule); border-radius: 10px; padding: 0.7rem 0.8rem; }
  .tbi3-gcard-k { font-size: 0.68rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--tbi-ink-2); font-weight: 600; }
  .tbi3-gcard-v { font-family: "Newsreader", Georgia, serif; font-weight: 300; font-size: 2.1rem; line-height: 1.15; color: var(--tbi-accent); font-variant-numeric: tabular-nums; }
  .tbi3-gcard-ref { font-size: 0.78rem; color: var(--tbi-metab); }
  .tbi3-gcard-s { font-size: 0.75rem; color: var(--tbi-ink-2); line-height: 1.35; margin-top: 0.2rem; }
  .tbi3-sc circle { fill: var(--c); stroke: var(--global-bg-color); stroke-width: 1.5; }
  .tbi3-sc { outline: none; }
  .tbi3-sc:focus-visible circle, .tbi3-sc.is-guess circle { stroke: var(--tbi-ink); stroke-width: 2.5; }
  .tbi3-sc-label { font-size: 11px; fill: var(--tbi-ink) !important; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 3px; pointer-events: none; }
  .tbi3-toy-edge { stroke: var(--tbi-ink-2); stroke-width: 2.5; stroke-linecap: round; transition: stroke-opacity 0.3s; }
  .tbi3-toy-edge.is-gone { stroke-opacity: 0.12; stroke-dasharray: 4 4; }
  .tbi3-toy-node circle { fill: var(--global-bg-color); stroke: var(--tbi-ink-2); stroke-width: 2; }
  .tbi3-toy-node.is-gone circle { stroke-dasharray: 3 3; opacity: 0.4; }
  .tbi3-toy-node.is-gone text { opacity: 0.4; }
  .tbi3-toy-node.is-out circle { stroke: var(--tbi-injury); }
  .tbi3-toy-node.tbi3-cl-1 circle, .tbi3-toy-node.tbi3-cl-2 circle, .tbi3-toy-node.tbi3-cl-3 circle, .tbi3-toy-node.tbi3-cl-4 circle { fill: var(--cl); stroke: var(--cl); }
  .tbi3-toy-node.tbi3-cl-1 .tbi3-toy-id, .tbi3-toy-node.tbi3-cl-2 .tbi3-toy-id, .tbi3-toy-node.tbi3-cl-3 .tbi3-toy-id, .tbi3-toy-node.tbi3-cl-4 .tbi3-toy-id { fill: #fff !important; }
  .tbi3-toy-id { font-size: 13px; font-weight: 700; }
  .tbi3-toy-b { font-size: 11px; font-weight: 600; fill: var(--tbi-accent) !important; font-variant-numeric: tabular-nums; paint-order: stroke; stroke: var(--global-bg-color); stroke-width: 3px; }
  .tbi3-hull { fill: var(--cl); fill-opacity: 0.1; stroke: var(--cl); stroke-width: 1.5; stroke-opacity: 0.8; }
  .tbi3-cl-1 { --cl: #7b5ea7; } .tbi3-cl-2 { --cl: #c4553a; } .tbi3-cl-3 { --cl: #3a8fb7; } .tbi3-cl-4 { --cl: #5f8f4e; } .tbi3-cl-5 { --cl: #d08c2c; } .tbi3-cl-6 { --cl: #a0567a; } .tbi3-cl-7 { --cl: #4a6fa5; }
  html[data-theme="dark"] .tbi3-cl-1 { --cl: #a68bd4; } html[data-theme="dark"] .tbi3-cl-2 { --cl: #e57c62; } html[data-theme="dark"] .tbi3-cl-3 { --cl: #6cb8dc; } html[data-theme="dark"] .tbi3-cl-4 { --cl: #8fbf7c; } html[data-theme="dark"] .tbi3-cl-5 { --cl: #e8b25c; } html[data-theme="dark"] .tbi3-cl-6 { --cl: #cf88aa; } html[data-theme="dark"] .tbi3-cl-7 { --cl: #7fa3d8; }
  .tbi3-clchips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.6rem; }
  .tbi3-clchip { font: inherit; font-size: 0.75rem; line-height: 1.35; text-align: left; padding: 0.3rem 0.6rem; border-radius: 8px; border: 1px solid var(--cl); border-left-width: 4px; background: transparent; color: var(--tbi-ink); }
  button.tbi3-clchip { cursor: pointer; }
  button.tbi3-clchip[aria-pressed="true"] { background: var(--tbi-soft); box-shadow: inset 0 0 0 1px var(--cl); }
  button.tbi3-clchip:focus-visible { outline: 2px solid var(--tbi-accent); outline-offset: 2px; }
  .tbi3-clchip-b { color: var(--tbi-ink-2); }
  .tbi3-bars { display: grid; gap: 0.3rem; }
  .tbi3-bar { display: grid; grid-template-columns: 8.5rem 1fr 2.8rem; gap: 0.5rem; align-items: center; font-size: 0.76rem; }
  .tbi3-bar-label { text-align: right; color: var(--tbi-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tbi3-bar-track { position: relative; height: 10px; border-radius: 5px; background: var(--tbi-soft); }
  .tbi3-bar-fill { display: block; height: 100%; border-radius: 5px; background: var(--tbi-accent); opacity: 0.7; transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .tbi3-bar.is-key .tbi3-bar-fill { background: var(--tbi-injury); opacity: 1; }
  .tbi3-bar-thr { position: absolute; top: -3px; bottom: -3px; border-left: 1.5px dashed var(--tbi-ink); }
  .tbi3-bar-val { font-variant-numeric: tabular-nums; color: var(--tbi-ink-2); }
  .tbi3-bar-note { font-size: 0.7rem; color: var(--tbi-ink-2); margin-top: 0.2rem; }
  .tbi3-agestats { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.5rem; }
  .tbi3-agestat { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; font-size: 0.8rem; color: var(--tbi-ink); border: 1px solid var(--tbi-rule); border-radius: 8px; padding: 0.45rem 0.7rem; }
  .tbi3-agestat-k { font-weight: 600; width: 100%; font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--tbi-ink-2); }
  .tbi3-key.is-young { background: var(--tbi-resp); }
  .tbi3-key.is-old { background: var(--tbi-metab); }
  .tbi3-key.is-both { background: var(--tbi-ink-2); }
  .tbi3-bx { display: grid; grid-template-columns: 4.6rem repeat(5, minmax(0, 1fr)); gap: 0.35rem; align-items: center; }
  .tbi3-bx-head { font-size: 0.7rem; text-align: center; color: var(--tbi-ink-2); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
  .tbi3-bx-row { font-size: 0.75rem; color: var(--tbi-ink); font-weight: 600; }
  .tbi3-bx-cell { font: inherit; padding: 0.2rem; border: 1px solid var(--tbi-rule); border-radius: 8px; background: transparent; cursor: pointer; color: var(--tbi-ink-2); transition: border-color 0.2s; }
  .tbi3-bx-cell svg { display: block; width: 100%; height: auto; }
  .tbi3-bx-cell:hover { border-color: var(--tbi-accent); }
  .tbi3-bx-cell[aria-pressed="true"] { border-color: var(--tbi-accent); background: var(--tbi-soft); box-shadow: inset 0 0 0 1px var(--tbi-accent); }
  .tbi3-bx-cell:focus-visible { outline: 2px solid var(--tbi-accent); outline-offset: 2px; }
  .tbi3-bx-edge { stroke: var(--tbi-ink-2); stroke-opacity: 0.35; stroke-width: 0.6; }
  .tbi3-bx-node { fill: var(--c); }
  .tbi3-bx-node.is-iso { opacity: 0.3; }
  .tbi3-bx-lab { display: block; font-size: 0.62rem; line-height: 1.2; text-align: center; font-variant-numeric: tabular-nums; }
  .tbi3-conds { column-count: 2; column-gap: 1.8rem; }
  .tbi3-cgroup { break-inside: avoid; margin-bottom: 1rem; }
  .tbi3-cgroup-h { font-size: 0.7rem; letter-spacing: 0.07em; text-transform: uppercase; font-weight: 600; color: var(--tbi-ink-2); margin-bottom: 0.2rem; }
  .tbi3-crow { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 0.6rem; align-items: center; padding: 0.35rem 0; border-bottom: 1px solid var(--tbi-rule); }
  .tbi3-cname strong { display: block; font-size: 0.82rem; font-weight: 600; }
  .tbi3-cname span { display: block; font-size: 0.72rem; line-height: 1.35; color: var(--tbi-ink-2); }
  .tbi3-cbar { display: grid; grid-template-columns: 1fr; gap: 0.15rem; outline: none; }
  .tbi3-cbar:focus-visible { box-shadow: 0 0 0 2px var(--tbi-accent); border-radius: 4px; }
  .tbi3-ctrack { display: flex; height: 10px; border-radius: 5px; background: var(--tbi-soft); overflow: hidden; }
  .tbi3-cbar-a { background: var(--c); transition: width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); width: 0; }
  .tbi3-cval { font-size: 0.68rem; color: var(--tbi-ink-2); font-variant-numeric: tabular-nums; }
  @media (max-width: 760px) {
    .tbi3-conds { column-count: 1; }
    .tbi3-split, .tbi3-rr-grid { grid-template-columns: 1fr; }
    .tbi3-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .tbi3-demo { grid-template-columns: 1fr; gap: 0.8rem; }
    .tbi3-gcards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .tbi3-label { font-size: 10.5px; }
  }
  @media (max-width: 420px) {
    .tbi3-rr-ctl label { grid-template-columns: 5.6rem 1fr 4.6rem; }
    .tbi3-rr-bar { grid-template-columns: 5.6rem 1fr 3rem; }
    .tbi3-bar { grid-template-columns: 6.4rem 1fr 2.6rem; }
    .tbi3-bx { grid-template-columns: 3.4rem repeat(5, minmax(0, 1fr)); gap: 0.2rem; }
    .tbi3-bx-lab { font-size: 0.55rem; }
    .tbi3-gcard-v { font-size: 1.7rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .tbi3-edge, .tbi3-dot, .tbi3-label, .tbi3-bar-fill, .tbi3-rr-fill, .tbi3-gcs-bar rect { transition: none; }
  }
---

<link rel="stylesheet" href="{{ '/assets/css/tbi-series.css' | relative_url }}">
<div id="tbi3-root" data-base="{{ '/assets/data/tbi/' | relative_url }}" hidden></div>

<blockquote class="tbi-lede">
Five years after a mild brain injury, 225 people answered a set of questions about their health. This is what their answers look like when you stop reading them as lists and start reading them as a network.
</blockquote>

<nav class="tbi-series" aria-label="Series">
  <a href="{{ '/blog/2026/tbi-part-1-the-quiet-injury/' | relative_url }}"><span class="tbi-series-num">Part 1</span><span class="tbi-series-title">The quiet injury</span></a>
  <a href="{{ '/blog/2026/tbi-part-2-thinking-in-graphs/' | relative_url }}"><span class="tbi-series-num">Part 2</span><span class="tbi-series-title">Thinking in graphs</span></a>
  <a href="{{ '/blog/2026/tbi-part-3-a-map-of-what-comes-after/' | relative_url }}" class="is-current" aria-current="page"><span class="tbi-series-num">Part 3</span><span class="tbi-series-title">A map of what comes after</span></a>
</nav>

## Where we left off

Part 1 was about the injury. Most traumatic brain injuries are classed as mild, which describes how responsive someone was on arrival at hospital, not how the next ten years will go. For many people what follows is a long tail of other conditions, often several at once <d-cite key="maas2022lancet,masel2010,corrigan2013"></d-cite>. Part 2 ended by turning a table of people and their conditions into a network, with conditions joined when they turn up together more often than chance would allow.

This part is about research that did that for mild traumatic brain injury (TBI from here on). It began as my undergraduate capstone at Krea University in 2023, supervised by Dr Shyam Kumar Sudhakar <d-cite key="mehta2023thesis"></d-cite>. It grew into three papers with him: on how common 26 conditions were five years after a mild TBI <d-cite key="sudhakar2023frontiers"></d-cite>, on using comorbidity networks in TBI care <d-cite key="sudhakar2024bosn"></d-cite>, and on the networks themselves <d-cite key="mehta2025bmc"></d-cite>. The question running through them: after a mild TBI, which conditions keep company, and what does the web they form look like?

For this post I rebuilt the analysis from the public-use files and my original code; every number shown is from the papers or recomputed from the same data.

## Where the numbers come from

### A database of people who went to rehab

The data comes from the Traumatic Brain Injury Model Systems (TBIMS) National Database, set up in the United States in 1987. Its centres (currently 16) enrol people aged 16 or over who were admitted to hospital with a TBI and then had inpatient rehabilitation. They are interviewed one, two and five years after injury, and every five years after that <d-cite key="tbims2020infosheet,msktc2023brochure"></d-cite>. By March 2022 it held 19,045 people <d-cite key="tbims2022profile"></d-cite>. Its public-use version is what an undergraduate without clinical access could work with.

Who is in it matters. Fewer than one in ten people hospitalised with a TBI need inpatient rehabilitation <d-cite key="tbims_lifelong"></d-cite>, so the "mild" injuries here are not the typical sports concussion. The Frontiers paper described them as typically involving intracranial pathology or post-traumatic amnesia (about ten days, on average, in the mild group) <d-cite key="sudhakar2023frontiers"></d-cite>.

### What makes an injury "mild"

They are mild by the Glasgow Coma Scale, described by Graham Teasdale and Bryan Jennett in 1974. It scores eye opening (1 to 4), verbal response (1 to 5) and movement (1 to 6), for a total from 3 to 15 <d-cite key="teasdale1974,gcs_website"></d-cite>. By convention 13 to 15 is mild, 9 to 12 moderate and 3 to 8 severe, as in the thesis and both papers <d-cite key="mehta2023thesis,sudhakar2023frontiers,mehta2025bmc"></d-cite>. Its authors have since argued that the total suits groups better than individuals <d-cite key="teasdale2014"></d-cite>, which is how this study uses it.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Coma scores on arrival, everyone aged 16 or over</div>
  <svg id="tbi3-gcs" role="img" aria-label="Bar chart of the number of people at each total Glasgow Coma Scale score from 3 to 15. Scores of 15 and 14 are by far the most common."></svg>
  <figcaption>Recomputed from the TBIMS public-use files (October 2021 release): 10,404 people aged 16 or over with a valid total score; 7,340 more had no usable score. Hover, tap or tab to a bar for its count.</figcaption>
</figure>

### From thousands to 225

The study used the five-year follow-up, chosen somewhat arbitrarily (as the thesis admitted) as far enough from the injury for the long tail to show <d-cite key="mehta2023thesis"></d-cite>. It needed people who answered the health questions at that interview.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Each dot is ten people</div>
  <div class="tbi3-steps" id="tbi3-funnel-steps" role="group" aria-label="Filters, in order"></div>
  <canvas id="tbi3-funnel" role="img" aria-label="About 1,800 dots, one for every ten people in the database. Each filter fades the people it removes; at the end, 23 dots, about 225 people, remain."></canvas>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi3-funnel-next" type="button">Apply the next filter</button>
  </div>
  <div class="tbi-readout" id="tbi3-funnel-read" aria-live="polite"></div>
  <figcaption>Recomputed from the TBIMS public-use files; each dot is ten people, rounded. Press the button, or choose a stage, to apply the filters in order.</figcaption>
</figure>

The last step is the steep one. Of 1,915 people interviewed at five years, only 225 answered the health questions, because the questions were only asked in interviews between 2017 and 2019. The papers quote 223 to 228 depending on the question <d-cite key="sudhakar2023frontiers,mehta2025bmc"></d-cite>, but not why so few. I think it matters: the 225 are mostly people whose interview fell in a three-year window, not people especially keen to talk about their health.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Who they are</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group" role="group" aria-label="Group">
      <button class="tbi-btn" type="button" data-demo="all" aria-pressed="true">Everyone with a mild TBI (4,775)</button>
      <button class="tbi-btn" type="button" data-demo="net" aria-pressed="false">The 225 in the network</button>
    </span>
  </div>
  <div class="tbi3-demo" id="tbi3-demo"></div>
  <div class="tbi-readout" id="tbi3-demo-read" aria-live="polite"></div>
  <figcaption>Recomputed from the TBIMS public-use files. Bars are shares of each group; the faint line on the age chart marks the other group. Groups under 11 people are hidden, as the data-use agreement requires, and marked “&lt;11”.</figcaption>
</figure>

The mild group as a whole is older than you might expect (median age 57 at injury) and mostly male, and falls are the commonest cause. That fits TBI in high-income countries <d-cite key="maas2022lancet"></d-cite>. The 225 look much like the larger group, though they could differ in ways these few variables cannot show.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Who is still there, year by year</div>
  <svg id="tbi3-fu" role="img" aria-label="Grouped bars for follow-ups at 1, 2, 5, 10, 15 and 20 years: people due a follow-up, people interviewed, and people who answered the health questions. All three fall with time; the health questions were answered by 384 people at one year and 225 at five."></svg>
  <div class="tbi-legend">
    <span><span class="tbi3-key tbi3-fu-a"></span>Due a follow-up</span>
    <span><span class="tbi3-key tbi3-fu-b"></span>Interviewed</span>
    <span><span class="tbi3-key tbi3-fu-c"></span>Answered the health questions (number shown)</span>
  </div>
  <figcaption>Recomputed: the 4,775 people with a mild TBI in the TBIMS public-use files. Hover, tap or tab to a year for its numbers.</figcaption>
</figure>

Numbers fall at every follow-up, and if the sickest drop out first, five-year figures understate what the injury does.

## What was asked, and how it became data

### The 26 conditions

The TBIMS interview includes questions modelled on the US National Health and Nutrition Examination Survey (NHANES), in the style of “Has a doctor or other health professional ever told you that you have…?”. Self-diagnosis was not accepted <d-cite key="sudhakar2023frontiers"></d-cite>. My thesis used 25 conditions (all but “other heart conditions”); the BMC paper used all 26 <d-cite key="mehta2023thesis,mehta2025bmc"></d-cite>.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">The 26 conditions, and when people said they began</div>
  <div class="tbi3-conds" id="tbi3-conds">
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-psych"></span>Psychiatric</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Depression</strong><span>Persistent low mood or loss of interest that gets in the way of life.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="Depression"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Anxiety</strong><span>Excessive, hard-to-control worry and tension.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="Anxiety"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Post-traumatic stress disorder</strong><span>Intrusive memories, avoidance and constant vigilance after a frightening event.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="PTSD"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Panic attacks</strong><span>Sudden surges of intense fear, with a racing heart.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="PanicAttacks"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Bipolar disorder</strong><span>Episodes of raised mood and energy (mania), usually alternating with depression.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="BipolarDisorder"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Obsessive-compulsive disorder</strong><span>Intrusive thoughts and repeated acts done to quiet them.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="ObsessiveCompulsiveDisorder"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>ADD / ADHD</strong><span>Long-standing difficulty sustaining attention, often with restlessness.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="ADDADHD"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-subst"></span>Substance use</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Alcoholism</strong><span>Dependence on alcohol.</span></div><div class="tbi3-cbar tbi3-c-subst" data-cond="Alcoholism"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Drug addiction</strong><span>Dependence on drugs, prescribed or not.</span></div><div class="tbi3-cbar tbi3-c-subst" data-cond="DrugAddiction"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-cardio"></span>Heart and circulation</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Hypertension</strong><span>Blood pressure that stays high.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="Hypertension"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>High blood cholesterol</strong><span>Too much cholesterol in the blood; a risk factor for heart disease.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="HighBloodCholesterol"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Stroke</strong><span>Brain damage from a blocked or burst blood vessel.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="Stroke"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Myocardial infarction</strong><span>A heart attack: heart muscle dying from a blocked artery.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="MyocardialInfarction"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Congestive heart failure</strong><span>A heart too weak to pump enough, so fluid backs up.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="CongHF"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Other heart conditions</strong><span>Any other diagnosed heart problem; the one condition the thesis left out.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="OtherHeartConditions"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-metab"></span>Metabolic</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Diabetes</strong><span>Blood sugar the body can no longer keep in range.</span></div><div class="tbi3-cbar tbi3-c-metab" data-cond="Diabetes"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-neuro"></span>Neurological</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Sleep disorder</strong><span>A diagnosed problem with sleep, such as insomnia or sleep apnoea.</span></div><div class="tbi3-cbar tbi3-c-neuro" data-cond="SleepDisorder"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Dementia</strong><span>Progressive decline in memory and thinking.</span></div><div class="tbi3-cbar tbi3-c-neuro" data-cond="Dementia"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Movement disorder</strong><span>Trouble controlling movement, such as tremor or Parkinson’s disease.</span></div><div class="tbi3-cbar tbi3-c-neuro" data-cond="MovementDisorder"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-musc"></span>Joints and pain</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Chronic pain</strong><span>Pain lasting months, beyond normal healing.</span></div><div class="tbi3-cbar tbi3-c-musc" data-cond="ChronicPain"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Osteoarthritis</strong><span>Wear of the cartilage in joints, bringing pain and stiffness.</span></div><div class="tbi3-cbar tbi3-c-musc" data-cond="Osteoarthritis"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Rheumatoid arthritis</strong><span>The immune system attacking the lining of the joints.</span></div><div class="tbi3-cbar tbi3-c-musc" data-cond="RheumatoidArthritis"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-resp"></span>Lungs</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Emphysema</strong><span>Destroyed air sacs in the lungs, mostly from smoking.</span></div><div class="tbi3-cbar tbi3-c-resp" data-cond="Emphysema"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Pneumonia</strong><span>An infection that inflames the lungs.</span></div><div class="tbi3-cbar tbi3-c-resp" data-cond="Pneumonia"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-other"></span>Eyes and liver</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Cataracts</strong><span>Clouding of the lens of the eye, common with age.</span></div><div class="tbi3-cbar tbi3-c-other" data-cond="Cataracts"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Liver disease</strong><span>Long-term liver damage, from alcohol, hepatitis, fat and other causes.</span></div><div class="tbi3-cbar tbi3-c-other" data-cond="Liver"></div></div>
    </div>
  </div>
  <div class="tbi-legend">
    <span>Bars run to 50% of the people asked</span>
  </div>
  <figcaption>Descriptions are mine. Bars: the share reporting each condition at five years, of those giving a clear yes or no, recomputed from the TBIMS public-use files (counts under 11 marked “&lt;11”). Hover, tap or tab to a bar for the numbers. Groups follow Sudhakar et al. 2023, with substance use split out.</figcaption>
</figure>

### From answers to ones and zeros

Anything other than a clear yes or no is set aside, so each condition rests on slightly fewer than 225 people. One wrinkle I cannot resolve: the Frontiers paper notes that a condition reported at an earlier follow-up was not asked about again <d-cite key="sudhakar2023frontiers"></d-cite>. I would want to check how those answers carry forward before trusting any one person’s record.

So for each person and condition, the network gets a 1 (diagnosed), a 0 (never diagnosed) or a blank. Everything after this is arithmetic on those columns.

## From people to pairs

Twenty-six conditions make $26 \times 25 / 2 = 325$ pairs. For each, we must decide whether the two are connected, and how strongly.

### Four kinds of people

Take anxiety and depression. Everyone who answered both falls into one of four groups: both, anxiety only, depression only, or neither. Counting them gives a two-by-two contingency table.

<figure class="tbi-fig tbi3-fig l-page">
  <div class="tbi-kicker">Sorting people into a two-by-two table</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group-label">Pair</span>
    <span class="tbi3-group" role="group" aria-label="Pair of conditions">
      <button class="tbi-btn" type="button" data-pair="anxiety-depression-onset" aria-pressed="true">Anxiety and depression</button>
      <button class="tbi-btn" type="button" data-pair="depression-hypertension" aria-pressed="false">Depression and hypertension</button>
      <button class="tbi-btn" type="button" data-pair="cataracts-depression" aria-pressed="false">Cataracts and depression</button>
    </span>
  </div>
  <div class="tbi3-split">
    <svg id="tbi3-grid" role="img" aria-label="Dots, one per person who answered both questions, sorted into four boxes: both conditions, the first only, the second only, and neither."></svg>
    <div>
      <div class="tbi-panel" id="tbi3-grid-math" aria-live="polite"></div>
      <div class="tbi-controls">
        <button class="tbi-btn" id="tbi3-grid-sort" type="button" aria-pressed="false">Sort into the table</button>
        <button class="tbi-btn" id="tbi3-grid-chance" type="button" aria-pressed="false">Show what chance predicts</button>
      </div>
    </div>
  </div>
  <div class="tbi-readout" id="tbi3-grid-read" aria-live="polite"></div>
  <figcaption>Recomputed: real counts from the five-year mild TBI group, one dot per person. Dashed rings show what chance alone would put in each box. Only pairs with at least 11 people in every box are shown.</figcaption>
</figure>

Nineteen people have both. Is that a lot? If a third of people had each and the two were unrelated, a ninth would still have both by chance. So the real question is how the count compares with what independence predicts. Here chance predicts about six, so nineteen is about three times that.

Depression and hypertension are both common here (about a third and a half of people), and 34 people have both. That looks like a strong overlap, but chance also predicts about 34. Counting shared people, as the toy network in Part 2 did, would draw a thick edge; comparing with chance draws none.

### The phi coefficient

The study used the phi coefficient, $\varphi$, the ordinary Pearson correlation between two columns of 1s and 0s. With $a$ people having both, $b$ only the first, $c$ only the second and $d$ neither,

$$
\varphi = \frac{ad - bc}{\sqrt{(a+b)(c+d)(a+c)(b+d)}}.
$$

The product $ad$ grows when people have both or neither; $bc$ grows when they have one without the other. If the conditions are independent, these balance and $\varphi$ is zero. The denominator scales $\varphi$ to run from $-1$ (one present exactly when the other is absent) to $+1$ (always together).

For anxiety and depression, $\varphi = 0.48$, one of the strongest in the network and the value in the BMC paper <d-cite key="mehta2025bmc"></d-cite>. For depression and hypertension it is 0.005. For cataracts and depression it is $-0.08$, plausibly because cataracts come with age and depression was reported more by younger people here.

### Why not just compare with chance directly?

The obvious alternative, which my thesis discussed, is the relative risk: the observed number with both divided by the number chance predicts. In 2009 César Hidalgo and colleagues compared the two measures on the hospital records of more than 30 million elderly Americans. Relative risk, they found, "overestimates relationships involving rare diseases", while φ "underestimates the comorbidity between rare and common diseases" <d-cite key="hidalgo2009"></d-cite>.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Two measures of “more often than chance”</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group" role="group" aria-label="Examples">
      <button class="tbi-btn" type="button" data-rr="rare" aria-pressed="true">Two rare conditions</button>
      <button class="tbi-btn" type="button" data-rr="common" aria-pressed="false">Two common ones</button>
      <button class="tbi-btn" type="button" data-rr="mixed" aria-pressed="false">One rare, one common</button>
    </span>
  </div>
  <div class="tbi3-rr-grid" id="tbi3-rr">
    <div class="tbi3-rr-ctl">
      <label>Condition A <input type="range" id="tbi3-rr-a" min="0" max="100" step="1" aria-describedby="tbi3-rr-av" /><output id="tbi3-rr-av"></output></label>
      <label>Condition B <input type="range" id="tbi3-rr-b" min="0" max="100" step="1" aria-describedby="tbi3-rr-bv" /><output id="tbi3-rr-bv"></output></label>
      <label>Together, × chance <input type="range" id="tbi3-rr-l" min="10" max="100" step="1" aria-describedby="tbi3-rr-lv" /><output id="tbi3-rr-lv"></output></label>
    </div>
    <div>
      <div class="tbi3-rr-bar" id="tbi3-rr-rr"><span>Relative risk</span><span class="tbi3-rr-track"><span class="tbi3-rr-fill"></span></span><span class="tbi3-rr-val"></span></div>
      <div class="tbi3-rr-bar" id="tbi3-rr-phi"><span>φ</span><span class="tbi3-rr-track"><span class="tbi3-rr-fill"></span></span><span class="tbi3-rr-val"></span></div>
      <div class="tbi3-rr-scale">Bars run to a relative risk of 10 and a φ of 1.</div>
    </div>
  </div>
  <div class="tbi-readout" id="tbi3-rr-read" aria-live="polite"></div>
  <figcaption>An illustration with 10,000 imaginary people, not study data. The first two sliders set how common each condition is (0.5% to 50%, logarithmic); the third sets how many times more often than chance they co-occur, which is the relative risk.</figcaption>
</figure>

With two rare conditions, a handful of shared cases pushes the relative risk to 6 or more while $\varphi$ stays modest. With two common ones the relative risk has a ceiling: if half of everyone has each, they cannot co-occur more than twice as often as chance. The thesis chose $\varphi$ because, in a small sample, it does not make dramatic associations out of three or four people. The cost is that a rare condition can look weakly linked to a common one even when the link is real.

## Where to draw the line

A correlation from a couple of hundred people will rarely be exactly zero, even for unrelated conditions. The standard test converts $\varphi$ into a $t$ statistic,

$$
t = \frac{|\varphi|\sqrt{N-2}}{\sqrt{1-\varphi^2}},
$$

where $N$ is the number of people behind the pair, compared with Student's $t$ distribution with $N-2$ degrees of freedom. The BMC paper drew an edge when the one-sided p-value was below 0.01 <d-cite key="mehta2025bmc"></d-cite>, a $t$ above about 2.35. For around 200 people, that is a $\varphi$ of roughly 0.16 or more. The edge's weight is $\varphi$ itself.

<figure class="tbi-fig tbi3-fig l-page">
  <div class="tbi-kicker">Moving the line</div>
  <div class="tbi-controls" style="margin-top: 0">
    <label class="tbi-range">Edge if <input type="range" id="tbi3-th-alpha" min="0" max="1000" step="1" aria-label="Significance threshold" /></label>
    <span class="tbi-readout" id="tbi3-th-val"></span>
  </div>
  <div class="tbi-controls">
    <span class="tbi3-group-label">Jump to</span>
    <span class="tbi3-group" role="group" aria-label="Thresholds">
      <button class="tbi-btn" type="button" data-alpha="0.05" aria-pressed="false">0.05</button>
      <button class="tbi-btn" type="button" data-alpha="0.01" aria-pressed="true">0.01, the paper</button>
      <button class="tbi-btn" type="button" data-alpha="0.001" aria-pressed="false">0.001</button>
      <button class="tbi-btn" type="button" data-alpha="0.0000307" aria-pressed="false">0.01 ÷ 325</button>
    </span>
  </div>
  <svg id="tbi3-th" role="img" aria-label="The 26 conditions at fixed positions. Edges appear and disappear as the threshold changes."></svg>
  <div class="tbi-readout" id="tbi3-th-read" aria-live="polite"></div>
  <div class="tbi-legend">
    <span><span class="tbi3-key" style="background: var(--tbi-ink-2)"></span>In the published network</span>
    <span><span class="tbi3-key" style="background: var(--tbi-metab)"></span>Not in it</span>
    <span><span class="tbi3-key" style="background: var(--tbi-cardio)"></span>Negative association</span>
  </div>
  <figcaption>Recomputed: φ, sample size and one-sided p-value for all 325 pairs, five-year mild TBI group. Drag the slider or choose a threshold; the last is a Bonferroni correction for 325 tests.</figcaption>
</figure>

So the network depends on a choice as well as on the data: at 0.05 there are many more edges, at 0.001 only the strongest. Then there is the problem of many tests. Even if no pair were truly related, a 0.01 threshold across 325 pairs would let through about three edges by chance, and we cannot know which. A Bonferroni correction (dividing the threshold by 325) removes a good part of the edges but keeps the psychiatric core and the strongest links. So I think the strong edges are very unlikely to be flukes, while any single weak edge should be held lightly.

The thesis network was an earlier version of this analysis, with a different threshold: 25 conditions, 69 edges, diameter 5 <d-cite key="mehta2023thesis"></d-cite>. The paper’s has 26 conditions, 25 with at least one edge, and 65 edges <d-cite key="mehta2025bmc"></d-cite>. From here on I use the paper’s, which went through peer review.

## The map

Here is the network for everyone. Stroke sits alone because none of its associations passed the threshold.

<figure class="tbi-fig tbi3-fig l-page">
  <div class="tbi-kicker">Comorbidities five years after a mild TBI</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group-label">Size by</span>
    <span class="tbi3-group" role="group" aria-label="Node size">
      <button class="tbi-btn" type="button" data-measure="prevalence" aria-pressed="true">How common</button>
      <button class="tbi-btn" type="button" data-measure="degree" aria-pressed="false">Degree</button>
      <button class="tbi-btn" type="button" data-measure="strength" aria-pressed="false">Weighted degree</button>
      <button class="tbi-btn" type="button" data-measure="betweenness" aria-pressed="false">Betweenness</button>
      <button class="tbi-btn" type="button" data-measure="eigenvector" aria-pressed="false">Eigenvector</button>
      <button class="tbi-btn" type="button" data-measure="triangles" aria-pressed="false">Triangles</button>
    </span>
  </div>
  <div class="tbi-controls">
    <span class="tbi3-group-label">Show me</span>
    <span class="tbi3-group" role="group" aria-label="Guided views">
      <button class="tbi-btn" type="button" data-tour="core" aria-pressed="false">The psychiatric core</button>
      <button class="tbi-btn" type="button" data-tour="bridges" aria-pressed="false">The bridges</button>
      <button class="tbi-btn" type="button" data-tour="heart" aria-pressed="false">Heart, lungs and metabolism</button>
    </span>
    <button class="tbi-btn" type="button" id="tbi3-map-listbtn" aria-pressed="false" aria-controls="tbi3-map-list">As a list</button>
  </div>
  <div class="tbi3-netwrap">
    <div class="tbi3-zoombar" role="group" aria-label="Zoom">
      <button class="tbi-btn" type="button" id="tbi3-zoom-in" aria-label="Zoom in">+</button>
      <button class="tbi-btn" type="button" id="tbi3-zoom-out" aria-label="Zoom out">−</button>
      <button class="tbi-btn" type="button" id="tbi3-zoom-reset" aria-label="Reset zoom">⟲</button>
    </div>
    <svg id="tbi3-map" role="group" aria-label="The comorbidity network for everyone. Each condition is a focusable node."></svg>
  </div>
  <div class="tbi3-split tbi3-split-even">
    <div class="tbi-panel tbi3-card" id="tbi3-map-card" aria-live="polite"></div>
    <div>
      <div class="tbi-kicker">Every pair’s φ</div>
      <canvas id="tbi3-map-heat" tabindex="0" role="img" aria-label="A 26 by 26 matrix of phi values between every pair of conditions, grouped by type. Focus it and use the arrow keys to read pairs."></canvas>
      <div class="tbi3-heat-read" id="tbi3-map-heat-read" aria-live="polite"></div>
    </div>
  </div>
  <div class="tbi-legend" id="tbi3-map-legend">
    <span><span class="tbi3-swatch tbi3-c-psych"></span>Psychiatric</span>
    <span><span class="tbi3-swatch tbi3-c-subst"></span>Substance use</span>
    <span><span class="tbi3-swatch tbi3-c-musc"></span>Joints and pain</span>
    <span><span class="tbi3-swatch tbi3-c-neuro"></span>Neurological</span>
    <span><span class="tbi3-swatch tbi3-c-cardio"></span>Heart and circulation</span>
    <span><span class="tbi3-swatch tbi3-c-metab"></span>Metabolic</span>
    <span><span class="tbi3-swatch tbi3-c-resp"></span>Lungs</span>
    <span><span class="tbi3-swatch tbi3-c-other"></span>Eyes and liver</span>
  </div>
  <div class="tbi-readout" id="tbi3-map-read" aria-live="polite"></div>
  <div class="tbi3-list" id="tbi3-map-list" hidden></div>
  <figcaption>The network of Mehta &amp; Sudhakar 2025 (BMC Neurology, Fig. 2), rebuilt from the TBIMS public-use files with φ as edge thickness; every network in this post shares this layout. Hover, tap or tab to a condition to pin it and list its links. In the matrix, darker is stronger, red is negative and a dot marks an edge. The paper groups high cholesterol with the heart; the colours here put it with diabetes.</figcaption>
</figure>

What I notice first is the dense knot of psychiatric and substance-use conditions, which holds the strongest associations: anxiety with panic attacks ($\varphi = 0.56$), attention deficit disorders with alcoholism (0.53), depression with panic attacks (0.49), anxiety with depression (0.48). Next is dementia with movement disorders (0.42), off on their own. Heart, lung and metabolic conditions form a looser web.

The matrix shows that most pairs are close to independent: only 65 of 325 are edges, and no negative association is strong enough to become one.

## Reading the map

### The whole network

The BMC paper did not report whole-network measures, so these are computed here.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Before you look</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group-label">Compared with a random network with the same 25 nodes and 65 edges, is this one</span>
    <span class="tbi3-group" role="group" aria-label="Your guess">
      <button class="tbi-btn" type="button" data-glob-guess="more" aria-pressed="false">more clustered</button>
      <button class="tbi-btn" type="button" data-glob-guess="same" aria-pressed="false">about the same</button>
      <button class="tbi-btn" type="button" data-glob-guess="less" aria-pressed="false">less clustered?</button>
    </span>
    <button class="tbi-btn" type="button" id="tbi3-glob-show">Just show me</button>
  </div>
  <div class="tbi3-gcards" id="tbi3-glob"></div>
  <div class="tbi-readout" id="tbi3-glob-read" aria-live="polite"></div>
  <figcaption>Computed here from the published network, against the average of 500 random (Erdős–Rényi) networks with the same numbers of nodes and edges. Clustering is the mean local coefficient over the 25 conditions with an edge.</figcaption>
</figure>

A density of 0.22 means about one in five possible links is present. The average path is 2.31 steps (no two conditions are more than 4 apart), but random networks of this size have short paths too (2.05). Clustering is more telling: 0.36 here against 0.21 at random, so a condition's neighbours are much more often linked to each other. High clustering with short paths is a small world <d-cite key="wattsstrogatz1998"></d-cite>, and this network is mildly one, as was the thesis network.

The assortativity is $+0.41$: well-connected conditions tend to link to each other. That is the psychiatric core again. With 25 nodes I would not lean on the exact value, but its sign matches what you can see.

### The core

By degree or triangles, the psychiatric knot dominates. Panic attacks has the most links (10), then anxiety, depression and post-traumatic stress disorder (PTSD) with 9 each. The same four sit in the most triangles (panic attacks in 25; depression and PTSD in 23 each). My thesis's main conclusion was about exactly this: "the critical hub formed by the triangular relationship between mental disorders such as depression, anxiety, and Post-Traumatic Stress Disorder (PTSD)" <d-cite key="mehta2023thesis"></d-cite>.

That is not surprising. Psychiatric conditions co-occur heavily in general, through shared risk factors and overlapping categories. It also fits the Frontiers finding that anxiety, depression and PTSD were among the commonest conditions after a mild TBI <d-cite key="sudhakar2023frontiers"></d-cite>. What the network adds is that someone with one of them is quite likely to have several. Eigenvector centrality agrees, ranking the same four highest, and across conditions it tracks degree closely (a correlation of 0.93 <d-cite key="mehta2025bmc"></d-cite>).

### The bridges

Betweenness tells a different story, the one the paper followed. Make a guess first.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Common is not the same as central</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group-label">Which of these lies on the most shortest paths?</span>
    <span class="tbi3-group" role="group" aria-label="Your guess">
      <button class="tbi-btn" type="button" data-bridge-guess="Depression" aria-pressed="false">Depression</button>
      <button class="tbi-btn" type="button" data-bridge-guess="PanicAttacks" aria-pressed="false">Panic attacks</button>
      <button class="tbi-btn" type="button" data-bridge-guess="ChronicPain" aria-pressed="false">Chronic pain</button>
      <button class="tbi-btn" type="button" data-bridge-guess="BipolarDisorder" aria-pressed="false">Bipolar disorder</button>
    </span>
    <button class="tbi-btn" type="button" id="tbi3-bridge-show">Just show me</button>
  </div>
  <svg id="tbi3-bridge" role="group" aria-label="Each condition plotted by how many people reported it (across) and, once revealed, by its betweenness (up)."></svg>
  <div class="tbi-readout" id="tbi3-bridge-read" aria-live="polite"></div>
  <figcaption>Recomputed. Across: share of the 225 reporting the condition (under 11 people: the band on the left). Up: normalised betweenness in the published network. Hover, tap or tab to a point for its values.</figcaption>
</figure>

It is bipolar disorder. About 7% of people reported it, yet it has the second-highest betweenness (0.157), behind high cholesterol (0.186) and ahead of emphysema (0.133). Across conditions, betweenness was almost uncorrelated with prevalence ($r = 0.028$). As the paper put it, "despite exhibiting a low prevalence rate, a specific comorbidity could play a vital role in controlling disease transitions" <d-cite key="mehta2025bmc"></d-cite>.

Roger Guimerà and colleagues found that in the world's airline network, "the most connected cities are not necessarily the most central" <d-cite key="guimera2005air"></d-cite>. Anchorage has few routes, but it is a gateway between an isolated region and the world. Bipolar disorder is linked into the psychiatric core and out to the heart (congestive heart failure, myocardial infarction, high cholesterol), so many shortest paths between the two pass through it.

A shortest path here is a chain of statistical associations, not a route a disease travels. It does not say that bipolar disorder leads to heart disease, or the reverse. Then again, it flags a place where psychiatry and cardiology, which rarely talk to each other, share patients.

## Finding the neighbourhoods

To find groups in a principled way, the study borrowed a method from Camarillo-Ramirez and colleagues' 2020 study of COVID-19 comorbidities in Mexico <d-cite key="camarilloramirez2020"></d-cite>. It is a cousin of Girvan–Newman from Part 2 <d-cite key="girvan2002"></d-cite>, but removes nodes instead of edges. Take out the node with the highest betweenness, recompute, and repeat until no node is above a threshold. The pieces left are the cluster cores. Each removed node then goes back into every cluster it had an edge to, so clusters can overlap, which for diseases seems right to me. The paper's supplement shows it on seven nodes.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">The algorithm on seven nodes</div>
  <svg id="tbi3-toy" role="img" aria-label="Seven numbered nodes: 0 joined to 1; 1 joined to 2 and 3; 2 to 5; 5 to 4; 3 to 4; 4 to 6. Numbers above the nodes are betweenness values."></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi3-toy-back" type="button">Back</button>
    <button class="tbi-btn" id="tbi3-toy-next" type="button">Next step</button>
  </div>
  <div class="tbi-readout" id="tbi3-toy-read" aria-live="polite"></div>
  <div class="tbi3-clchips" id="tbi3-toy-clusters"></div>
  <figcaption>Redrawn from Mehta &amp; Sudhakar 2025, Additional file 1, Fig. S5; betweenness recomputed here (normalised, as in networkx) matches the paper’s. Step through with the buttons.</figcaption>
</figure>

The BMC paper's threshold was the median betweenness of the starting network <d-cite key="mehta2025bmc"></d-cite>. On the real network seven conditions are removed in turn: high cholesterol, emphysema, liver disease, bipolar disorder, rheumatoid arthritis, other heart conditions and attention deficit disorders. Rheumatoid arthritis starts modest, but once the conditions around it are gone it becomes the only link between its neighbours, and its score jumps to 0.48.

<figure class="tbi-fig tbi3-fig l-page">
  <div class="tbi-kicker">Removing the bridges, one at a time</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group-label">Network</span>
    <span class="tbi3-group" role="group" aria-label="Network">
      <button class="tbi-btn" type="button" data-vbc-net="bmc-all-y5" aria-pressed="true">Everyone</button>
      <button class="tbi-btn" type="button" data-vbc-net="bmc-old-y5" aria-pressed="false">Older</button>
      <button class="tbi-btn" type="button" data-vbc-net="bmc-young-y5" aria-pressed="false">Younger</button>
    </span>
  </div>
  <div class="tbi3-split">
    <svg id="tbi3-vbc" role="img" aria-label="The network, with node size showing current betweenness. Removed conditions fade; at the end the remaining pieces are coloured by cluster."></svg>
    <div>
      <div class="tbi-kicker">Highest betweenness now</div>
      <div class="tbi3-bars" id="tbi3-vbc-bars" aria-hidden="true"></div>
      <div class="tbi-controls">
        <button class="tbi-btn" id="tbi3-vbc-step" type="button">Remove the top node</button>
        <button class="tbi-btn" id="tbi3-vbc-run" type="button">Run it</button>
        <button class="tbi-btn" id="tbi3-vbc-reset" type="button">Start again</button>
      </div>
    </div>
  </div>
  <div class="tbi-readout" id="tbi3-vbc-read" aria-live="polite"></div>
  <div class="tbi3-clchips" id="tbi3-vbc-clusters"></div>
  <figcaption>The three published networks, rebuilt from the TBIMS public-use files, with betweenness recomputed in your browser after each removal; a dashed red ring marks the next to go. At the end, choose a cluster to see it with its bridges. Cluster numbers follow the paper’s Figs 4, 6 and 8.</figcaption>
</figure>

For everyone, the method finds the paper's six clusters <d-cite key="mehta2025bmc"></d-cite>. The first is the psychiatric core with chronic pain and sleep disorder, plus five bridges: attention deficit disorders, bipolar disorder, emphysema, liver disease and rheumatoid arthritis. The second pairs diabetes and cataracts. The third is obsessive-compulsive disorder (OCD) with attention deficit disorders and rheumatoid arthritis; OCD is otherwise cut off from the core. The fourth is heart and lungs, around congestive heart failure, myocardial infarction and pneumonia. The fifth joins dementia, hypertension and movement disorders, and the sixth is osteoarthritis with high cholesterol.

## Younger and older

The BMC paper then asked whether the network changes with age, since a fall at 75 and a road accident at 25 happen to different bodies. The Frontiers paper had found that, at five years, younger people reported depression more often, and older people hypertension, high cholesterol, cataracts and osteoarthritis <d-cite key="sudhakar2023frontiers"></d-cite>. An earlier TBIMS study found much the same after moderate and severe injuries <d-cite key="hammond2019"></d-cite>. So the paper split the 225 at age 50.

<figure class="tbi-fig tbi3-fig l-page">
  <div class="tbi-kicker">The same 26 conditions, by age</div>
  <div class="tbi-controls" style="margin-top: 0">
    <span class="tbi3-group" role="group" aria-label="Group">
      <button class="tbi-btn" type="button" data-age="young" aria-pressed="true">Younger (50 or under)</button>
      <button class="tbi-btn" type="button" data-age="old" aria-pressed="false">Older (over 50)</button>
      <button class="tbi-btn" type="button" data-age="diff" aria-pressed="false">Overlay the two</button>
    </span>
  </div>
  <div class="tbi-controls">
    <span class="tbi3-group-label">Look at</span>
    <span class="tbi3-group" role="group" aria-label="Findings">
      <button class="tbi-btn" type="button" data-age-focus="bipolar" aria-pressed="false">Bipolar disorder and the heart</button>
      <button class="tbi-btn" type="button" data-age-focus="ocd" aria-pressed="false">OCD and rheumatoid arthritis</button>
      <button class="tbi-btn" type="button" data-age-focus="cross" aria-pressed="false">Psychiatric links outward</button>
    </span>
  </div>
  <svg id="tbi3-age" role="img" aria-label="The comorbidity network for one age group, on the shared layout. Switching groups moves edges in and out."></svg>
  <div class="tbi3-agestats" id="tbi3-age-stats" aria-live="polite"></div>
  <div class="tbi-readout" id="tbi3-age-read" aria-live="polite"></div>
  <figcaption>The younger and older networks of Mehta &amp; Sudhakar 2025 (Figs 5 and 7), rebuilt from the TBIMS public-use files. Node size is how many in that group reported the condition. In the overlay, blue edges are younger only, amber older only, grey both.</figcaption>
</figure>

The younger network (91 people, 48 edges among 21 conditions) is held together by panic attacks, with 12 links, more than any condition elsewhere in the study. Its assortativity is negative ($-0.20$), like a hub with spokes. The older network (134 people, 37 edges among 22 conditions) is sparser, with assortativity $+0.44$, and dementia and movement disorders split off on their own.

The paper's abstract leads with one difference: "bipolar disorder was seen as related to cardiovascular comorbidities, a pattern that was observed only in the young subjects" <d-cite key="mehta2025bmc"></d-cite>. This has precedent. The paper cites an American Heart Association statement that bipolar disorder predisposes young people to early cardiovascular disease, and a Korean cohort finding a raised risk of heart attack in young adults with it <d-cite key="mehta2025bmc"></d-cite>. OCD is linked with rheumatoid arthritis only in the younger group, which the paper connects to evidence that OCD may involve inflammation. And psychiatric links reach different places with age. Liver disease is linked to anxiety and PTSD only in the young; chronic pain to drug addiction, panic attacks and PTSD only in the old.

How much weight can these bear? The younger network rests on 91 people, and some of its conditions were reported by fewer than 11 of them. Stroke has seven links and the second-highest betweenness there, yet fewer than 11 younger people reported it, so a few people with several conditions could produce all of those edges. The bipolar–cardiovascular links fit the literature, but I would treat them as a hypothesis for a larger cohort, not a finding to act on. The paper itself warns that subgroup samples are smaller still <d-cite key="mehta2025bmc"></d-cite>.

## What it means, and what it does not

### The argument for using networks

No medicine prevents the secondary injuries after TBI, so much of care is managing what comes after. The perspective paper proposes "applying graph theory via the construction of disease comorbidity networks to identify high-risk patient groups, offer preventive care to affected populations, and reduce the disease burden" <d-cite key="sudhakar2024bosn"></d-cite>. The BMC paper adds that surveillance "for all possible sets of comorbidities is impractical" <d-cite key="mehta2025bmc"></d-cite>.

A network suggests where to look, and the paper's main suggestion for practice is that a young patient with bipolar disorder after a mild TBI might have their heart checked earlier than usual. A larger study of mild TBI over up to ten years found raised risks of hypertension, diabetes and stroke, and called for screening <d-cite key="izzy2022"></d-cite>. In Hidalgo's study, patients tended to develop diseases close in the network to those they already had <d-cite key="hidalgo2009,barabasi2011netmed"></d-cite>. If that holds after TBI, a comorbidity network is a rough map of where a patient might be heading. That is what I hope these networks could become; what they show now is much narrower.

### What the study cannot tell us

**It cannot say which came first.** An edge says nothing about direction: "one won't be able to establish if A preceded B or B preceded A" <d-cite key="mehta2025bmc"></d-cite>. Hidalgo's study could infer direction from successive hospital visits <d-cite key="hidalgo2009"></d-cite>; one set of answers at five years cannot.

**It cannot say the injury caused any of this.** With no comparison group without a brain injury, we cannot tell which associations are specific to TBI; anxiety and depression go together almost everywhere. The paper replies that the patterns matter for people with mild TBI either way, and that brains may age faster after TBI, which complicates choosing controls <d-cite key="mehta2025bmc,cole2015brainage"></d-cite>. Both points are fair, but a control group is what would most change what this network can claim.

**The conditions are self-reported**, as diagnoses people recall being given. People who see doctors more get diagnosed with more, and memory is imperfect.

**The people are a particular slice of TBI**: hospitalised, then in inpatient rehabilitation in the United States, alive at five years and interviewed in 2017–2019. The Frontiers paper urged "sufficient caution" in generalising <d-cite key="sudhakar2023frontiers"></d-cite>. If the sickest died or dropped out, the network looks healthier than reality.

**The network depends on choices**: the 1% threshold, $\varphi$ over relative risk, the median in the clustering. With 325 pairs tested, some edges are likely to be chance.

**The numbers are small**, especially by age. A condition reported by fewer than 11 people can gain or lose edges through one or two individuals.

## Beyond the paper, and open questions

The thesis ended with a line I still stand by: "future research will focus on integrating data across TBI severities and longitudinal scales" <d-cite key="mehta2023thesis"></d-cite>. My original code had computed networks for other severities and years that were never analysed; here they are, outside anything the papers claim.

<figure class="tbi-fig tbi3-fig l-page">
  <div class="tbi-kicker">Exploratory, not published: severity × years since injury</div>
  <div class="tbi3-split tbi3-split-beyond">
    <div class="tbi3-bx" id="tbi3-beyond" role="group" aria-label="Fifteen small networks: mild, moderate and severe TBI at 1, 2, 5, 10 and 15 years after injury. Choose one to enlarge it."></div>
    <svg id="tbi3-beyond-big" role="img" aria-label="The chosen network, enlarged, with node size showing degree."></svg>
  </div>
  <div class="tbi-readout" id="tbi3-beyond-read" aria-live="polite"></div>
  <figcaption>Exploratory and unpublished: recomputed from the TBIMS public-use files with the thesis’s edge rule ($t \ge 2.920$), so the mild five-year cell is the thesis network. Each cell is a different set of people. Choose a cell to enlarge it; node size is degree.</figcaption>
</figure>

Each cell is a different set of people (53 to 384), so a row is not a fifteen-year story. What the grid does show is something like the psychiatric core in most cells, which makes me more inclined to think it is a stable feature of life after TBI.

Given the time and data, I would first follow the same people across years, so that edges could carry a direction. Depression at two years and heart problems at ten says far more than both at five. Second, I would build the same networks for matched people without a brain injury, where anything specific to TBI would have to show. Third, I would compare severities with enough people in each. The BMC paper's stated aim, a large database of TBI patients followed across trauma centres in India <d-cite key="mehta2025bmc"></d-cite>, is the version I would most like to see.

Some questions I cannot answer. Is the psychiatric core a feature of brain injury, or of people in general? Is bipolar disorder a bridge to the heart in young people because of shared biology (inflammation, metabolism, the medicines used to treat it), or because of how they see doctors? Could betweenness help decide which specialists a patient sees, and would that help anyone? How much would the map change if everyone had been asked every year? I hope someone finds them curious enough to take up.

---

I am properly thankful to Dr Shyam Kumar Sudhakar, who supervised this work, conceived the papers that grew from it and did much of the writing. Thanks also to Shreya Sridhar, Satvika Char and Kathan Pandya, co-authors of the prevalence paper. The data come from the TBIMS National Database, funded by the National Institute on Disability, Independent Living, and Rehabilitation Research, and from the people who answered its questions for years. The papers are open access: the networks in [BMC Neurology](https://doi.org/10.1186/s12883-025-04102-x) <d-cite key="mehta2025bmc"></d-cite>, the prevalences in [Frontiers in Human Neuroscience](https://doi.org/10.3389/fnhum.2023.1158483) <d-cite key="sudhakar2023frontiers"></d-cite>, and the perspective in the [Brain Organoid and Systems Neuroscience Journal](https://doi.org/10.1016/j.bosn.2024.03.002) <d-cite key="sudhakar2024bosn"></d-cite>. The aggregated data behind every figure are in [the site’s repository]({{ '/assets/data/tbi/README.md' | relative_url }}).

<nav class="tbi-series" aria-label="Series">
  <a href="{{ '/blog/2026/tbi-part-1-the-quiet-injury/' | relative_url }}"><span class="tbi-series-num">Part 1</span><span class="tbi-series-title">The quiet injury</span></a>
  <a href="{{ '/blog/2026/tbi-part-2-thinking-in-graphs/' | relative_url }}"><span class="tbi-series-num">Part 2</span><span class="tbi-series-title">Thinking in graphs</span></a>
  <a href="{{ '/blog/2026/tbi-part-3-a-map-of-what-comes-after/' | relative_url }}" class="is-current" aria-current="page"><span class="tbi-series-num">Part 3</span><span class="tbi-series-title">A map of what comes after</span></a>
</nav>

<script src="{{ '/assets/js/vendor/d3.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/posts/tbi-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/posts/tbi-part3.js' | relative_url }}"></script>
