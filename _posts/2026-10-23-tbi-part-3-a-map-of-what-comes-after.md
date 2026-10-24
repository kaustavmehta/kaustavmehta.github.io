---
layout: distill
title: "A map of what comes after"
description: "Part 3 of a series on traumatic brain injury. The research itself: from 225 people five years after a mild brain injury to a network of 26 conditions, its hubs and bridges, its clusters, how it differs between younger and older people, and what it cannot tell us."
tags: traumatic-brain-injury graph-theory network-medicine comorbidity
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
  - name: Beyond the paper
  - name: Open questions

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

Part 1 was about the injury. A traumatic brain injury is damage to the brain from an outside force, and most of them are classed as mild, which is a statement about how responsive someone was when they arrived at hospital and not a promise about how the next ten years will go. The brain can be stretched and sheared without the skull breaking, the damage can keep unfolding for months and years after the impact, and there is still no drug that stops it. What follows, for many people, is a long tail of other conditions: depression, anxiety, sleep problems, chronic pain, high blood pressure, and often several of these at once <d-cite key="maas2022lancet,masel2010,corrigan2013"></d-cite>.

Part 2 was about a way of looking. A graph is a set of things and the connections between them, and once a problem has been recast as one, a small set of measures (degree, path length, clustering, assortativity, betweenness, eigenvector centrality) lets you ask precise questions about its shape. It ended with a recasting that does not come naturally: taking a table of people and their conditions and turning it into a network in which the conditions are the nodes, joined when they turn up together in the same people more often than chance would allow.

This part is about the research that did that for mild traumatic brain injury (I will write TBI from here on). It began as my undergraduate capstone at Krea University in 2023, supervised by Dr Shyam Kumar Sudhakar <d-cite key="mehta2023thesis"></d-cite>, and grew into three papers with him: one measuring how common 26 conditions were five years after a mild TBI <d-cite key="sudhakar2023frontiers"></d-cite>, a perspective arguing that comorbidity networks could be useful in TBI care <d-cite key="sudhakar2024bosn"></d-cite>, and one building the networks themselves, for everyone and separately for younger and older people <d-cite key="mehta2025bmc"></d-cite>. The question running through all of them is simple to state. After a mild TBI, which conditions keep company, and what does the web they form look like?

I want to walk through every step, from where the data comes from to what the final network can and cannot say, and to fill in enough of the surrounding medicine and statistics that each step makes sense on its own. For this post the whole analysis was also rebuilt from the raw public-use files and my original code, so every number in the figures below is either taken from the papers or recomputed from the same data.

## Where the numbers come from

### A database of people who went to rehab

The data comes from the Traumatic Brain Injury Model Systems (TBIMS) National Database. The TBIMS programme was set up in the United States in 1987 and is funded by the National Institute on Disability, Independent Living, and Rehabilitation Research. Its centres (currently 16) enrol people aged 16 or over who were admitted to hospital with a TBI and then received inpatient rehabilitation at one of them, and then follow them up by interview at one, two and five years after the injury and every five years after that, for decades in some cases <d-cite key="tbims2020infosheet,msktc2023brochure"></d-cite>. As of March 2022 it held information on 19,045 people <d-cite key="tbims2022profile"></d-cite>, and it is often described as the largest longitudinal TBI dataset in the world <d-cite key="tso2021tbims"></d-cite>. A de-identified public-use version is available on request, which is what an undergraduate with no clinical access could actually work with.

The most important thing to understand about TBIMS, for everything that follows, is who is in it. To be enrolled, a person had to be injured badly enough to be admitted to hospital and then to need inpatient rehabilitation, and the programme's own materials note that people needing inpatient rehabilitation are fewer than one in ten of everyone hospitalised with a TBI <d-cite key="tbims_lifelong"></d-cite>. The "mild" injuries in this database are therefore not the typical concussion from a football tackle. The Frontiers paper described them as typically involving intracranial pathology or a period of post-traumatic amnesia (the mild group's average amnesia lasted about ten days) <d-cite key="sudhakar2023frontiers"></d-cite>. They are mild by one particular measure, which needs its own introduction.

### What makes an injury "mild"

The Glasgow Coma Scale, described by Graham Teasdale and Bryan Jennett in 1974, scores how responsive someone is on three counts: whether and how they open their eyes (1 to 4), how they respond verbally (1 to 5), and how they move in response to instructions or pressure (1 to 6) <d-cite key="teasdale1974,gcs_website"></d-cite>. The three add up to a total between 3 and 15. By convention, 13 to 15 is mild, 9 to 12 moderate and 3 to 8 severe, and that is how the thesis and both papers describe the groups <d-cite key="mehta2023thesis,sudhakar2023frontiers,mehta2025bmc"></d-cite>. It is worth knowing that the scale's authors have since argued that individual patients are best described by the three components separately, and that the total is better used to characterise groups <d-cite key="teasdale2014"></d-cite>, which is what a study like this does.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Coma scores on arrival, everyone aged 16 or over</div>
  <svg id="tbi3-gcs" role="img" aria-label="Bar chart of the number of people at each total Glasgow Coma Scale score from 3 to 15. Scores of 15 and 14 are by far the most common."></svg>
  <figcaption>Recomputed data: the TBIMS public-use files (release of October 2021), everyone aged 16 or over with a valid total score (10,404 people). Another 7,340 had no score because they were sedated, intubated or otherwise untestable, or the score was unknown. Hover, tap or tab to a bar for its count.</figcaption>
</figure>

In what follows, “mild” means mild as the papers define it.

### From thousands to 225

The study did not use everyone with a mild injury. It used the five-year follow-up, chosen (as the thesis admitted plainly) somewhat arbitrarily, as a point far enough from the injury for the long tail to show <d-cite key="mehta2023thesis"></d-cite>. And at five years, it needed people who had answered a particular set of health questions.

Those questions, which the next section describes in detail, were about 26 long-term conditions, and only people who answered them can contribute to a network of those conditions.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Each dot is ten people</div>
  <div class="tbi3-steps" id="tbi3-funnel-steps" role="group" aria-label="Filters, in order"></div>
  <canvas id="tbi3-funnel" role="img" aria-label="About 1,800 dots, one for every ten people in the database. Each filter fades the people it removes; at the end, 23 dots, about 225 people, remain."></canvas>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi3-funnel-next" type="button">Apply the next filter</button>
  </div>
  <div class="tbi-readout" id="tbi3-funnel-read" aria-live="polite"></div>
  <figcaption>Recomputed data from the TBIMS public-use files; each dot stands for ten people, rounded. Press the button, or choose any stage, to apply the filters in order. “Interviewed” counts follow-up records marked as completed interviews.</figcaption>
</figure>

The last step is the steep one. Of 1,915 people interviewed at five years, only 225 answered the health questions, because (as the rebuild made clear) the questions were only included in interviews conducted between 2017 and 2019. Most of the 225 were injured between about 2011 and 2014. The papers mention the small number, quoting 223 to 228 depending on the question <d-cite key="sudhakar2023frontiers,mehta2025bmc"></d-cite>, but not why it was small, and I think the reason matters: the 225 are not people who were especially willing to talk about their health, they are mostly the people whose five-year interview happened to fall in a three-year window.

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
  <figcaption>Recomputed data from the TBIMS public-use files. Bars are shares of each group; on the age chart the faint line marks the other group, for comparison. Groups of fewer than 11 people are not shown, under the database’s data-use agreement, and are marked “&lt;11”.</figcaption>
</figure>

The mild group as a whole is older than you might expect (a median age of 57 at injury) and mostly male, and falls are the commonest cause, followed by road traffic. That fits what is known about TBI in high-income countries, where falls in older people drive much of the burden <d-cite key="maas2022lancet"></d-cite>. The 225 look much like the larger group they came from, which is reassuring, though it does not settle whether they differ in ways that these few variables cannot show.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">Who is still there, year by year</div>
  <svg id="tbi3-fu" role="img" aria-label="Grouped bars for follow-ups at 1, 2, 5, 10, 15 and 20 years: people due a follow-up, people interviewed, and people who answered the health questions. All three fall with time; the health questions were answered by 384 people at one year and 225 at five."></svg>
  <div class="tbi-legend">
    <span><span class="tbi3-key tbi3-fu-a"></span>Due a follow-up</span>
    <span><span class="tbi3-key tbi3-fu-b"></span>Interviewed</span>
    <span><span class="tbi3-key tbi3-fu-c"></span>Answered the health questions (number shown)</span>
  </div>
  <figcaption>Recomputed data: the mild TBI group (4,775 people) in the TBIMS public-use files. Hover, tap or tab to a year for its numbers.</figcaption>
</figure>

Attrition is the quiet companion of every long study. People move, stop answering, become too unwell to take part, or die, and the ones who remain may not be like the ones who left. For a study of illness after injury, that is not a small worry: if the sickest people are the likeliest to drop out, the conditions we see at five years will understate what the injury does. I will come back to this.

## What was asked, and how it became data

Part 1 introduced the conditions by family. Here I want to be exact about what each one is, what people were asked about it, and how an answer became a number, because every later step depends on it.

### The 26 conditions

At each follow-up, the TBIMS interview includes a block of questions modelled on the US National Health and Nutrition Examination Survey (NHANES), asked in the style of “Has a doctor or other health professional ever told you that you have…?”. A condition counts only if a doctor or other health professional diagnosed it; self-diagnosis was not accepted <d-cite key="sudhakar2023frontiers"></d-cite>. My thesis used 25 of these conditions (all but “other heart conditions”); the BMC paper used all 26 <d-cite key="mehta2023thesis,mehta2025bmc"></d-cite>.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">The 26 conditions, and when people said they began</div>
  <div class="tbi3-conds" id="tbi3-conds">
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-psych"></span>Psychiatric</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Depression</strong><span>Low mood or loss of interest and pleasure that persists for weeks and gets in the way of life.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="Depression"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Anxiety</strong><span>Excessive, hard-to-control worry and tension.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="Anxiety"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Post-traumatic stress disorder</strong><span>Intrusive memories, avoidance and being constantly on guard after a frightening event.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="PTSD"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Panic attacks</strong><span>Sudden surges of intense fear, with a racing heart and breathlessness.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="PanicAttacks"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Bipolar disorder</strong><span>Episodes of abnormally raised mood and energy (mania), usually alternating with depression.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="BipolarDisorder"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Obsessive-compulsive disorder</strong><span>Unwanted, intrusive thoughts and repeated acts done to quiet them.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="ObsessiveCompulsiveDisorder"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>ADD / ADHD</strong><span>Long-standing difficulty sustaining attention, often with restlessness and impulsivity.</span></div><div class="tbi3-cbar tbi3-c-psych" data-cond="ADDADHD"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-subst"></span>Substance use</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Alcoholism</strong><span>Dependence on alcohol.</span></div><div class="tbi3-cbar tbi3-c-subst" data-cond="Alcoholism"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Drug addiction</strong><span>Dependence on drugs, prescribed or not.</span></div><div class="tbi3-cbar tbi3-c-subst" data-cond="DrugAddiction"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-cardio"></span>Heart and circulation</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Hypertension</strong><span>Blood pressure that stays high.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="Hypertension"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>High blood cholesterol</strong><span>Too much cholesterol in the blood, a risk factor for heart disease and stroke.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="HighBloodCholesterol"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Stroke</strong><span>Brain damage from a blocked or burst blood vessel.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="Stroke"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Myocardial infarction</strong><span>A heart attack: heart muscle dying because its artery is blocked.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="MyocardialInfarction"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Congestive heart failure</strong><span>A heart too weak to pump what the body needs, so fluid backs up into the lungs and legs.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="CongHF"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Other heart conditions</strong><span>Any other heart problem a doctor diagnosed; a catch-all, and the one condition the thesis left out.</span></div><div class="tbi3-cbar tbi3-c-cardio" data-cond="OtherHeartConditions"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-metab"></span>Metabolic</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Diabetes</strong><span>Blood sugar the body can no longer keep in range.</span></div><div class="tbi3-cbar tbi3-c-metab" data-cond="Diabetes"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-neuro"></span>Neurological</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Sleep disorder</strong><span>A diagnosed problem with sleep, such as insomnia or sleep apnoea.</span></div><div class="tbi3-cbar tbi3-c-neuro" data-cond="SleepDisorder"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Dementia</strong><span>A progressive decline in memory and thinking that interferes with daily life.</span></div><div class="tbi3-cbar tbi3-c-neuro" data-cond="Dementia"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Movement disorder</strong><span>Trouble controlling movement, such as tremor or Parkinson’s disease.</span></div><div class="tbi3-cbar tbi3-c-neuro" data-cond="MovementDisorder"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-musc"></span>Joints and pain</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Chronic pain</strong><span>Pain that lasts for months, beyond normal healing.</span></div><div class="tbi3-cbar tbi3-c-musc" data-cond="ChronicPain"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Osteoarthritis</strong><span>Wear of the cartilage in joints, bringing pain and stiffness.</span></div><div class="tbi3-cbar tbi3-c-musc" data-cond="Osteoarthritis"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Rheumatoid arthritis</strong><span>The immune system attacking the lining of the joints.</span></div><div class="tbi3-cbar tbi3-c-musc" data-cond="RheumatoidArthritis"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-resp"></span>Lungs</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Emphysema</strong><span>Destroyed air sacs in the lungs, a form of chronic obstructive lung disease, mostly from smoking.</span></div><div class="tbi3-cbar tbi3-c-resp" data-cond="Emphysema"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Pneumonia</strong><span>An infection that inflames the lungs.</span></div><div class="tbi3-cbar tbi3-c-resp" data-cond="Pneumonia"></div></div>
    </div>
    <div class="tbi3-cgroup"><div class="tbi3-cgroup-h"><span class="tbi3-swatch tbi3-c-other"></span>Eyes and liver</div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Cataracts</strong><span>Clouding of the lens of the eye, common with age.</span></div><div class="tbi3-cbar tbi3-c-other" data-cond="Cataracts"></div></div>
      <div class="tbi3-crow"><div class="tbi3-cname"><strong>Liver disease</strong><span>Long-term damage to the liver, from alcohol, viral hepatitis, fat and other causes.</span></div><div class="tbi3-cbar tbi3-c-other" data-cond="Liver"></div></div>
    </div>
  </div>
  <div class="tbi-legend">
    <span>Bars run to 50% of the people asked</span>
  </div>
  <figcaption>Descriptions are mine, in plain language. Recomputed data: the share of people at the five-year follow-up who reported each condition (of those who gave a clear yes or no) from the TBIMS public-use files. Counts below 11 are not shown, under the data-use agreement, and the bar is marked “&lt;11”. Hover, tap or tab to a bar for the numbers. Groups follow Sudhakar et al. 2023, with substance use split from the other psychiatric conditions and high cholesterol drawn with diabetes rather than with the heart.</figcaption>
</figure>

### From answers to ones and zeros

In the data each condition is stored as a code: yes, no, or one of several codes for “unknown”, “refused” or “not asked”. Anything other than a clear yes or no is set aside, which is why the number of people behind each condition is a little below 225. One wrinkle, which I cannot fully resolve from the public files: the Frontiers paper notes that a condition reported at an earlier follow-up was not asked about again <d-cite key="sudhakar2023frontiers"></d-cite>, so how earlier answers are carried forward to year five is something I would want to check before trusting any single person’s record.

So the data that goes into the network is, for each person and each condition, a 1 (diagnosed), a 0 (never diagnosed), or a blank. Everything from here on is arithmetic on those columns.

## From people to pairs

The raw material, then, is 225 people, each with a yes or no for each of 26 conditions. To build a network we need to decide, for each of the $26 \times 25 / 2 = 325$ pairs of conditions, whether the two are connected and how strongly.

### Four kinds of people

Take one pair, anxiety and depression. Every person who answered both questions falls into exactly one of four groups: they have both, they have anxiety but not depression, depression but not anxiety, or neither. Counting the four groups gives what statisticians call a two-by-two contingency table, and everything else in this section is a way of reading one.

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
  <figcaption>Recomputed data: real counts from the five-year mild TBI group, one dot per person, with positions arbitrary. Dashed rings show how many people chance alone would put in each box. Only pairs whose four boxes all hold at least 11 people can be shown.</figcaption>
</figure>

Nineteen people have both anxiety and depression. Is that a lot? It depends on how common each condition is. If a third of people had anxiety and a third had depression, and the two had nothing to do with each other, you would still expect about a ninth of people to have both, simply by chance. So the question is never "how many have both?" but "how many have both, compared with what we would expect if the two were independent?" For anxiety and depression here, the expected number is about six, and nineteen is about three times that.

The second pair shows the other side. Depression and hypertension are both common in this group (each reported by about a third and a half of people, respectively, at any time), and 34 people have both. That looks like a strong overlap until you work out the expectation, which is also about 34. These two conditions are each common, and they meet exactly as often as two common conditions would if they never influenced each other at all. Counting shared people, as the toy network at the end of Part 2 did, would have drawn a thick edge between them; the comparison with chance draws none.

### The phi coefficient

The measure the study used is the phi coefficient, $\varphi$, which is what you get if you code each condition as 1 (present) or 0 (absent) and compute the ordinary Pearson correlation between the two columns. Written in terms of the table, with $a$ people having both, $b$ only the first, $c$ only the second and $d$ neither,

$$
\varphi = \frac{ad - bc}{\sqrt{(a+b)(c+d)(a+c)(b+d)}}.
$$

The numerator is the heart of it. The product $ad$ grows when people tend to have both or neither (the two conditions agree), and $bc$ grows when people tend to have one without the other (they disagree). If the conditions are independent the two products balance, and $\varphi$ is zero. The denominator is the product of the four row and column totals, and it scales the result so that $\varphi$ runs from $-1$ (whenever one is present, the other is absent) to $+1$ (the two always occur together). For anxiety and depression, $\varphi = 0.48$, one of the strongest associations in the whole network and the value quoted in the BMC paper <d-cite key="mehta2025bmc"></d-cite>. For depression and hypertension it is 0.005. For cataracts and depression it is slightly negative, $-0.08$, with fewer people having both than chance would predict, plausibly because cataracts are a condition of older people and depression was reported more often by younger ones in this group.

### Why not just compare with chance directly?

There is an obvious alternative to $\varphi$, and my thesis discussed it: divide the observed number with both by the number expected by chance. That ratio is called the relative risk (or observed-to-expected ratio) and it is perhaps the most intuitive measure of all; a relative risk of 3 means "three times as often as chance". In 2009 César Hidalgo and colleagues built a disease network from the hospital records of more than 30 million elderly Americans and compared the two measures carefully. Their conclusion was that each is biased in its own way: relative risk "overestimates relationships involving rare diseases and underestimates the comorbidity between highly prevalent illnesses, whereas φ accurately discriminates comorbidities between pairs of diseases of similar prevalence but underestimates the comorbidity between rare and common diseases" <d-cite key="hidalgo2009"></d-cite>. The figure below lets you see why.

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
  <figcaption>An illustration with 10,000 imaginary people, not data from the study. The first two sliders set how common each condition is (on a logarithmic scale, from 0.5% to 50%); the third sets how many times more often than chance the two occur together, which is exactly the relative risk. When the conditions are common, that multiple has a ceiling, because no more people can have both than have either.</figcaption>
</figure>

With two rare conditions you can push the relative risk to 6 or more while $\varphi$ stays modest: a handful of shared cases is a large multiple of a tiny expectation, but it is still a handful of people. With two common conditions, the relative risk cannot climb far at all (if half of everyone has each, they cannot occur together more than twice as often as chance), while $\varphi$ can be large. And when one condition is rare and the other common, $\varphi$ is capped well below 1 however strongly they are linked. Neither measure is wrong; each answers a slightly different question. For a small sample with several rare conditions, $\varphi$ has the advantage of not producing dramatic-looking associations from three or four people, which is why the thesis chose it, but it is worth remembering that a rare condition will tend to look weakly connected to a common one even when the link is real.

## Where to draw the line

A correlation computed from a couple of hundred people will rarely be exactly zero, even for two conditions with nothing to do with each other. So the study needed a rule for when $\varphi$ is large enough to believe. The standard test for a correlation coefficient converts it into a $t$ statistic,

$$
t = \frac{|\varphi|\sqrt{N-2}}{\sqrt{1-\varphi^2}},
$$

where $N$ is the number of people behind that pair, and compares it with Student's $t$ distribution with $N-2$ degrees of freedom. If the conditions were truly unrelated, a $t$ above about 2.35 would happen less than 1% of the time, and that was the rule in the BMC paper: an edge whenever the one-sided p-value was below 0.01 <d-cite key="mehta2025bmc"></d-cite>. For a pair answered by around 200 people, that works out to $\varphi$ of roughly 0.16 or more. The edge's weight is then $\varphi$ itself.

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
  <figcaption>Recomputed data: φ, the number of people and a one-sided p-value for all 325 pairs, five-year mild TBI group. Drag the slider (logarithmic) or choose a threshold; nodes keep their positions from the published network, and conditions with no edges fade. The last button is a Bonferroni correction for 325 tests.</figcaption>
</figure>

Play with the slider and two things become clear. The first is that the network depends on a choice as well as on the data. At 0.05 there are many more edges, including a few negative ones; at 0.001 the network thins to its strongest bonds. The second is the problem of many tests. The study tested 325 pairs. If none of them were truly related, a threshold of 0.01 would still let through about three edges by chance alone, and we have no way of knowing which three. The usual remedy, a Bonferroni correction, divides the threshold by the number of tests, and if you apply it here the network loses a good part of its edges but keeps its psychiatric core and its strongest links. I think the honest reading is that the strong edges are very unlikely to be flukes, and that any single weak edge (a $\varphi$ near 0.16, resting on a handful of shared people) should be held lightly.

### The thesis, and then the paper

A word on the thesis network, which was an earlier version of this analysis and is not quite the same as the paper’s. It had 25 conditions (it did not include “other heart conditions”), 69 edges and a diameter of 5 <d-cite key="mehta2023thesis"></d-cite>, and used a different threshold for drawing an edge. The paper’s has 26 conditions, of which 25 have at least one edge, and 65 edges <d-cite key="mehta2025bmc"></d-cite>. From here on I use the paper’s network, which is the one that went through peer review.

## The map

Here, then, is the network for everyone: 25 conditions with at least one edge, joined by 65 edges, and stroke on its own because none of its associations passed the threshold.

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
  <figcaption>Recomputed data: the network from Mehta &amp; Sudhakar 2025 (BMC Neurology, Fig. 2), rebuilt from the TBIMS public-use files, which reproduces the published edges exactly and adds φ to each. Edge thickness is φ. Positions come from a fixed layout shared by every network in this post, nudged apart for legibility. Hover, tap or tab to a condition to pin it; its card lists its links in order of strength. In the matrix, darker cells are stronger associations, red cells negative ones, and a dot marks an edge. Prevalence counts a condition reported at any time; conditions reported by fewer than 11 people show no figure. The paper groups high cholesterol with cardiovascular conditions; the colours here put it with diabetes.</figcaption>
</figure>

Spend a minute with it before reading on. The first thing I notice every time is the dense knot on one side, the psychiatric conditions and substance use, tied to each other by most of the network's thickest edges. The strongest associations in the whole network are all there: anxiety with panic attacks ($\varphi = 0.56$), attention deficit disorders with alcoholism (0.53), depression with panic attacks (0.49), anxiety with depression (0.48). The next strongest is dementia with movement disorders (0.42), two neurological conditions of later life off on their own. Then there is a looser web of heart, lung and metabolic conditions on the other side, and a few conditions that seem to sit between.

The matrix beside it is the same information without the drawing: all 325 values of $\varphi$, grouped by type of condition. It is worth looking at for what the network hides. Most cells are pale, meaning most pairs of conditions are close to independent, and the edges are a minority (65 of 325, about one in five). The psychiatric block in the corner is dark almost throughout. And there are a few red cells, negative associations, none of them strong enough to become an edge.

## Reading the map

### The whole network

Part 2 introduced a set of measures for the shape of a network as a whole. The BMC paper did not report them (it went straight to centrality and clusters), so the values below are computed here, from the published network; the thesis reported them for its own, slightly different, network.

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
  <figcaption>Computed here from the published network (the paper reports no global measures). The random comparison is the average of 500 random networks with the same numbers of nodes and edges (Erdős–Rényi graphs), computed alongside the rebuild. Clustering is the average of each condition’s local clustering coefficient over the 25 conditions with any edge.</figcaption>
</figure>

A density of 0.22 means about one in five of all possible links is present. The average path between two conditions is 2.31 steps, and no two are more than 4 apart. A random network of the same size would also have short paths (2.05 on average), because 65 edges among 25 nodes is a lot of wiring, so the short paths on their own do not say much. The clustering is the more telling number: 0.36 here against 0.21 for random networks, meaning a condition's neighbours are much more likely to be linked to each other than chance would arrange. High clustering with short paths is the signature of what Part 2 called a small world <d-cite key="wattsstrogatz1998"></d-cite>, and this network has a mild case of it, as did the thesis network when Part 2 gave it the same comparison.

The assortativity is $+0.41$: conditions with many links tend to be linked to other conditions with many links. That is the psychiatric core again. The most connected conditions are the psychiatric ones, and they are connected mainly to each other, while the rarer, less connected conditions link among themselves at the edges. On a network of 25 nodes this number rests on few edges, so I would not lean on its exact value, but its sign matches what you can see.

### The core

Size the nodes by degree or by triangles and the psychiatric knot dominates. Panic attacks has the most links (10), followed by anxiety, depression and post-traumatic stress disorder with 9 each, and the same four sit in the most triangles (panic attacks in 25; depression and PTSD in 23 each). A triangle, three conditions all linked to each other, is the smallest unit of a cluster, and these four are tied into dozens of them. My thesis's main conclusion was about exactly this: "the critical hub formed by the triangular relationship between mental disorders such as depression, anxiety, and Post-Traumatic Stress Disorder (PTSD) and with various other disease comorbidities" <d-cite key="mehta2023thesis"></d-cite>.

What does a dense psychiatric core mean? It is not a surprising finding in itself. Psychiatric conditions co-occur heavily in the general population, partly because they share risk factors and partly because the categories themselves overlap (panic attacks are, after all, a common feature of anxiety disorders). It is consistent with what the Frontiers paper found about prevalence, that anxiety, depression and PTSD were among the most common conditions to appear at or after a mild TBI <d-cite key="sudhakar2023frontiers"></d-cite>, and with the broader literature on mental health after TBI. What the network adds is the shape: these conditions are each common and they also occur together, so that someone with one of them is quite likely to have several. Eigenvector centrality, which scores a node by the scores of its neighbours, says the same thing in another way: its highest values are panic attacks, depression, PTSD and anxiety, the conditions embedded deepest in the core. Across all conditions it tracks degree closely (the paper reports a correlation of 0.93 between the two <d-cite key="mehta2025bmc"></d-cite>).

### The bridges

Betweenness tells a different story, and it is the one the paper chose to follow. Before you size the map by it, make a guess.

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
  <figcaption>Recomputed data. Across: the share of the 225 who reported the condition at any time; conditions reported by fewer than 11 people sit in the band on the left. Up: normalised betweenness in the published network. Hover, tap or tab to a point for its values.</figcaption>
</figure>

The answer is bipolar disorder, among the four, and it is not close. Bipolar disorder was reported by about 7% of people, yet it has the second-highest betweenness in the network (0.157), behind only high cholesterol (0.186), with emphysema third (0.133). Depression, reported by almost a third, is near the middle. The paper put the general point this way: across conditions, betweenness was almost uncorrelated with prevalence ($r = 0.028$), and "despite exhibiting a low prevalence rate, a specific comorbidity could play a vital role in controlling disease transitions by being associated either directly or indirectly with other comorbidities in the network" <d-cite key="mehta2025bmc"></d-cite>.

The best analogy I know comes from a study of the world's airline network. Roger Guimerà and colleagues mapped every pair of cities connected by non-stop flights and found that "the most connected cities are not necessarily the most central" <d-cite key="guimera2005air"></d-cite>. Anchorage and Port Moresby have few routes, but they ranked among the most central cities in the world by betweenness, because they are the gateways between otherwise isolated regions (Alaska, and the interior of Papua New Guinea) and the rest of the network. Bipolar disorder plays something like that role here. Its links run both into the psychiatric core (anxiety, depression, PTSD, panic attacks, alcoholism) and out to the heart (congestive heart failure, myocardial infarction, high cholesterol), so many of the shortest paths between those two neighbourhoods pass through it. Emphysema does the same between substance use and depression on one side and pneumonia and heart failure on the other.

I want to be careful about what "bridge" means. A shortest path in this network is a chain of statistical associations, not a route that a disease travels along. That bipolar disorder sits between psychiatric and cardiovascular conditions says that people with bipolar disorder in this group were more likely than chance to have conditions from both neighbourhoods. It does not say that bipolar disorder leads to heart disease, or the reverse. Then again, it does flag bipolar disorder as a place where two specialities that rarely talk to each other (psychiatry and cardiology) have patients in common, which is the kind of observation a network is good at producing.

## Finding the neighbourhoods

Looking at the map, you can see groups. The question is whether there is a principled way to find them, and here the study borrowed a method from a 2020 study of comorbidities among COVID-19 patients in Mexico by Camarillo-Ramirez and colleagues <d-cite key="camarilloramirez2020"></d-cite>. It is a cousin of the Girvan–Newman method from Part 2 <d-cite key="girvan2002"></d-cite>, which finds communities by repeatedly cutting the edge with the highest betweenness. This one removes nodes instead: find the node with the highest betweenness, take it out, recompute, and repeat until no node's betweenness is above a threshold. What is left falls apart into pieces, and those are the cores of the clusters. Then each removed node is put back into every cluster it had an edge to. Because a removed node can touch several clusters, clusters can overlap, and a bridge can belong to more than one neighbourhood at once, which for diseases seems right to me.

The paper's supplement illustrates this on a seven-node example, and it is the clearest way to see each step.

<figure class="tbi-fig tbi3-fig l-body-outset">
  <div class="tbi-kicker">The algorithm on seven nodes</div>
  <svg id="tbi3-toy" role="img" aria-label="Seven numbered nodes: 0 joined to 1; 1 joined to 2 and 3; 2 to 5; 5 to 4; 3 to 4; 4 to 6. Numbers above the nodes are betweenness values."></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" id="tbi3-toy-back" type="button">Back</button>
    <button class="tbi-btn" id="tbi3-toy-next" type="button">Next step</button>
  </div>
  <div class="tbi-readout" id="tbi3-toy-read" aria-live="polite"></div>
  <div class="tbi3-clchips" id="tbi3-toy-clusters"></div>
  <figcaption>Redrawn from Mehta &amp; Sudhakar 2025, Additional file 1, Fig. S5. The betweenness values are recomputed here (normalised, as in networkx) and match the paper’s. Step through with the buttons.</figcaption>
</figure>

The threshold in the BMC paper was the median betweenness of the starting network, a choice the supplement explains after mentioning that minimum, median and user-chosen values were all tried <d-cite key="mehta2025bmc"></d-cite>. The rebuild found that a threshold around 0.046 reproduces every published removal sequence, and for the three BMC networks the median falls within the range that works. On the real network, the method removes seven conditions in turn: high cholesterol, emphysema, liver disease, bipolar disorder, rheumatoid arthritis, other heart conditions and attention deficit disorders. Notice how the ranking reshuffles after each removal. Rheumatoid arthritis starts with modest betweenness, but once the conditions around it are gone it becomes the only link between its neighbours, and its score jumps to 0.48 before it is removed in turn.

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
  <figcaption>Recomputed data: the three published networks, rebuilt from the TBIMS public-use files, with betweenness recomputed in your browser after each removal. The node about to be removed has a dashed red ring. At the end, cluster cores are ringed in their cluster’s colour and removed bridges are drawn hollow; choose a cluster to see it with its bridges. Cluster numbers follow the paper’s Figs 4, 6 and 8, and every published removal sequence and cluster is reproduced.</figcaption>
</figure>

For everyone, the method finds six clusters, and they are the paper's six <d-cite key="mehta2025bmc"></d-cite>. The first is the psychiatric core (alcoholism, anxiety, depression, drug addiction, PTSD, panic attacks) with chronic pain and sleep disorder, plus five bridges put back in: attention deficit disorders, bipolar disorder, emphysema, liver disease and rheumatoid arthritis. The paper read it as reinforcing that psychiatric conditions are highly comorbid, and noted that emphysema's links were to depression, alcoholism and drug addiction. The second pairs diabetes and cataracts, with high cholesterol, liver disease and other heart conditions as bridges. The third is obsessive-compulsive disorder with attention deficit disorders and rheumatoid arthritis, notable because OCD is otherwise unconnected to the psychiatric core. The fourth is a heart and lung cluster around congestive heart failure, myocardial infarction and pneumonia, which is where bipolar disorder's cardiovascular links live. The fifth joins dementia, hypertension and movement disorders, and the sixth is osteoarthritis with high cholesterol.

## Younger and older

The thesis stopped at one network. The question that drove the BMC paper was whether the network looks different depending on age, which matters for a condition like TBI because the people it happens to differ so much: a fall at 75 and a road accident at 25 happen to different bodies, with different conditions already waiting in the wings. The Frontiers paper had already found that, at five years, younger people reported depression more often and older people reported hypertension, high cholesterol, cataracts and osteoarthritis more often <d-cite key="sudhakar2023frontiers"></d-cite>, a pattern close to what an earlier TBIMS study found ten years after moderate and severe injuries <d-cite key="hammond2019"></d-cite>. So the paper split the 225 at age 50 and built a network for each group.

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
  <figcaption>Recomputed data: the younger and older networks of Mehta &amp; Sudhakar 2025 (Figs 5 and 7), rebuilt from the TBIMS public-use files. Node size is how many in that group reported the condition at any time (conditions reported by fewer than 11 are drawn small). In the overlay, blue edges appear only in the younger network, amber only in the older, and grey in both. Global measures are computed here. The rebuild also finds an edge between alcoholism and drug addiction in the younger group that the paper does not draw; it is left out here (see the note in the text).</figcaption>
</figure>

The two networks are clearly different. The younger network (91 people, 48 edges among 21 conditions) is held together by panic attacks, which has 12 links, more than any condition anywhere else in the study, and its assortativity is negative ($-0.20$), meaning its well-connected conditions tend to link to poorly connected ones, hub and spokes. The older network (134 people, 37 edges among 22 conditions) is sparser and splits into two pieces, with dementia and movement disorders on their own, and its assortativity is $+0.44$. In the older group, anxiety and depression become the bridges the clustering method removes first; in the younger, it is panic attacks, stroke and depression.

The paper's abstract leads with one difference: "bipolar disorder was seen as related to cardiovascular comorbidities, a pattern that was observed only in the young subjects" <d-cite key="mehta2025bmc"></d-cite>. In the younger network, bipolar disorder is linked to myocardial infarction, congestive heart failure and high cholesterol; in the older network it has no cardiovascular links at all. This is not without precedent. The paper points to an American Heart Association scientific statement that bipolar disorder and major depression predispose young people to early cardiovascular disease, and to a nationwide Korean cohort in which young adults with bipolar disorder had a raised risk of heart attack <d-cite key="mehta2025bmc"></d-cite>. The second difference is obsessive-compulsive disorder linked with rheumatoid arthritis (and with attention deficit disorders) in the younger group only, which the paper connects to evidence that OCD may involve inflammation and is associated with autoimmune conditions in a Swedish nationwide study. Third, which non-psychiatric conditions the psychiatric ones connect to depends on age: liver disease is linked to anxiety and PTSD only in the younger group, and chronic pain to drug addiction, panic attacks and PTSD only in the older.

I want to be honest about how much weight these can bear. The younger network rests on 91 people, and some of its conditions were reported by fewer than 11 of them. Stroke is a good example: in the younger network it has seven links and the second-highest betweenness, but fewer than 11 younger people reported it, so a few individuals with several conditions each can produce all of those edges. The bipolar–cardiovascular links in the young may be real, and they fit the literature, but they rest on small numbers, and I would treat them as a hypothesis worth testing in a larger cohort rather than as a finding to act on. The paper itself says the sample "could be even lower when considering patient subgroups" <d-cite key="mehta2025bmc"></d-cite>.

## What it means, and what it does not

### The argument for using networks

Why go to all this trouble? The perspective paper Dr Sudhakar and I wrote makes the case. TBI is followed by a multitude of psychiatric and medical conditions over the long term, and there are no medicines that prevent the secondary injuries that follow the first impact, so a good deal of what can be done for people is managing what comes after. In its own words: "we propose applying graph theory via the construction of disease comorbidity networks to identify high-risk patient groups, offer preventive care to affected populations, and reduce the disease burden" <d-cite key="sudhakar2024bosn"></d-cite>. The BMC paper adds the practical problem behind it: continued surveillance of TBI survivors "for all possible sets of comorbidities is impractical due to the associated costs and the wide range of comorbidities", so "a more practical and economical way to monitor comorbidities in TBI subjects is required" <d-cite key="mehta2025bmc"></d-cite>.

A network suggests where to look. If you know that, in young people after a mild TBI, bipolar disorder tends to come with heart problems, then a young patient with bipolar disorder is someone whose heart might be worth checking earlier than usual, and that is the paper's main suggestion for practice. Larger studies point in the same direction: a cohort study of people with mild TBI followed for up to ten years found raised risks of hypertension, diabetes and stroke compared with uninjured people <d-cite key="izzy2022"></d-cite>, and its authors called for screening for these conditions after TBI. And the general idea has deep roots in network medicine: in the Hidalgo study, patients tended to develop diseases close in the network to those they already had <d-cite key="hidalgo2009,barabasi2011netmed"></d-cite>. If that holds after TBI, a comorbidity network is a rough map of where a patient might be heading.

That is what I hope these networks could become. What they show at the moment is much narrower.

### What the study cannot tell us

**It cannot say which came first.** An edge says two conditions occur together more than chance; it says nothing about direction. The BMC paper was explicit: "if there is an association between comorbidities A and B in the study, one won't be able to establish if A preceded B or B preceded A" <d-cite key="mehta2025bmc"></d-cite>. The network is undirected because the data cannot support arrows. Hidalgo's study could infer direction because it had records of successive hospital visits <d-cite key="hidalgo2009"></d-cite>; one set of yes-or-no answers at five years cannot.

**It cannot say the injury caused any of this.** There is no comparison group of similar people without a brain injury, so we cannot tell which associations are peculiar to TBI and which would appear in any group of people of the same age. Anxiety and depression go together in almost every population. The paper's answer is that the aim was to document the patterns in people with mild TBI regardless of their cause, since they matter for those people either way, and it also argues that choosing controls is complicated by evidence that brains age faster after TBI <d-cite key="mehta2025bmc,cole2015brainage"></d-cite>. I think both points are fair, and I also think a control group is the single thing that would most change what this network could claim.

**The conditions are self-reported**, as diagnoses a doctor gave, as the person recalls them. People who see doctors more get diagnosed with more things, and people may misremember what they were told or when.

**The people are a particular slice of TBI.** They were hospitalised and then had inpatient rehabilitation in the United States, they survived five years, they were interviewed, and their interview fell between 2017 and 2019. The Frontiers paper warned that "sufficient caution should be exercised while generalizing the results of the study to the mild TBI population as a whole" <d-cite key="sudhakar2023frontiers"></d-cite>. And survivorship cuts both ways: people who died or dropped out are invisible, and if they were the sickest, the network shows a healthier picture than the reality.

**The network depends on choices**: the 1% threshold, with 325 pairs tested and so some edges likely to be false positives, $\varphi$ rather than relative risk, the median threshold in the clustering. Each is defensible, and each could reasonably have been made differently, as the slider above shows.

**The numbers are small**, especially in the age groups, and conditions reported by fewer than 11 people (several of them, in each group) can gain or lose edges from one or two individuals.

## Beyond the paper

The thesis ended with a line I would still stand by: the choice of mild TBI at five years was arbitrary, and "future research will focus on integrating data across TBI severities and longitudinal scales" <d-cite key="mehta2023thesis"></d-cite>. The original code had in fact already computed networks for other severities and other years, though they were never analysed. The rebuild recomputed them, and I show them here as an exploratory figure, clearly outside anything the papers claim.

<figure class="tbi-fig tbi3-fig l-page">
  <div class="tbi-kicker">Exploratory, not published: severity × years since injury</div>
  <div class="tbi3-split tbi3-split-beyond">
    <div class="tbi3-bx" id="tbi3-beyond" role="group" aria-label="Fifteen small networks: mild, moderate and severe TBI at 1, 2, 5, 10 and 15 years after injury. Choose one to enlarge it."></div>
    <svg id="tbi3-beyond-big" role="img" aria-label="The chosen network, enlarged, with node size showing degree."></svg>
  </div>
  <div class="tbi-readout" id="tbi3-beyond-read" aria-live="polite"></div>
  <figcaption>Recomputed data, exploratory and unpublished: networks built from the TBIMS public-use files with the thesis’s edge rule ($t \ge 2.920$), so the mild five-year cell is the thesis network itself. Severity bands follow the original analysis. Each cell is a different set of people, those who answered the health questions at that follow-up, so the row is not the same people followed over time. Choose a cell to enlarge it; node size is degree.</figcaption>
</figure>

It is tempting to read the rows as a story told over fifteen years, and that is precisely the reading the data does not support. Each cell is a cross-section of different people, of different sizes (from 53 to 384), so differences between cells mix the passage of time with who happened to be asked. What the grid does show is that the psychiatric core is not peculiar to mild injuries at five years: something like it appears in most cells, which makes me more inclined to believe it is a stable feature of life after TBI rather than an accident of one sample. The rest I would treat as a set of hypotheses.

## Open questions

What I would do next, given the time and the data, is the work the thesis promised and did not do. The first is to follow the same people across years, so that an edge could carry a direction: if depression tends to be reported at two years and heart problems at ten, in the same people, that is a much stronger statement than both being present at five. The second is to build the same networks for people without a brain injury, matched on age and sex, and look at the difference, which is where anything specific to TBI would have to show up. The third is to compare severities properly, with enough people in each group to say whether the network's shape changes with the force of the injury. Each of these needs more data than an undergraduate project had access to, and the BMC paper's own stated aim, to build a large database of TBI patients and their follow-up across trauma centres in India <d-cite key="mehta2025bmc"></d-cite>, is the version of this I would most like to see.

And some questions I do not know how to answer. Is the psychiatric core a feature of brain injury, or a feature of people, which any network of conditions would show? Is bipolar disorder a bridge to the heart in young people because of something shared in their biology (inflammation, metabolism, the medicines used to treat it) or because of how and when young people with bipolar disorder see doctors? If betweenness picks out conditions that sit between specialities, could it be used to decide which specialists a patient should see, and would that help anyone? How much would the map change if the questions had been asked every year, to everyone, rather than to the 225 whose interview fell in the right three years? I suspect the answers matter more than any single edge in the network, and I hope someone finds them curious enough to take up.

---

This work began as my undergraduate capstone at Krea University, and I am properly thankful to Dr Shyam Kumar Sudhakar, who supervised it, conceived the papers that grew from it and did much of the writing; and to Shreya Sridhar, Satvika Char and Kathan Pandya, co-authors of the prevalence paper. The data come from the TBIMS National Database, funded by the National Institute on Disability, Independent Living, and Rehabilitation Research, and from the people with brain injuries who answered its questions for years. The papers are open access: the networks in [BMC Neurology](https://doi.org/10.1186/s12883-025-04102-x) <d-cite key="mehta2025bmc"></d-cite>, the prevalences in [Frontiers in Human Neuroscience](https://doi.org/10.3389/fnhum.2023.1158483) <d-cite key="sudhakar2023frontiers"></d-cite>, and the perspective in the [Brain Organoid and Systems Neuroscience Journal](https://doi.org/10.1016/j.bosn.2024.03.002) <d-cite key="sudhakar2024bosn"></d-cite>. The aggregated data behind every figure here, with notes on how each file was made, are in [the site’s repository]({{ '/assets/data/tbi/README.md' | relative_url }}).

<nav class="tbi-series" aria-label="Series">
  <a href="{{ '/blog/2026/tbi-part-1-the-quiet-injury/' | relative_url }}"><span class="tbi-series-num">Part 1</span><span class="tbi-series-title">The quiet injury</span></a>
  <a href="{{ '/blog/2026/tbi-part-2-thinking-in-graphs/' | relative_url }}"><span class="tbi-series-num">Part 2</span><span class="tbi-series-title">Thinking in graphs</span></a>
  <a href="{{ '/blog/2026/tbi-part-3-a-map-of-what-comes-after/' | relative_url }}" class="is-current" aria-current="page"><span class="tbi-series-num">Part 3</span><span class="tbi-series-title">A map of what comes after</span></a>
</nav>

<script src="{{ '/assets/js/vendor/d3.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/posts/tbi-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/posts/tbi-part3.js' | relative_url }}"></script>
