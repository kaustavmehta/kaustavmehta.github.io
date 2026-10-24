---
layout: distill
title: "The quiet injury"
description: "Part 1 of a series on traumatic brain injury. What a brain injury is, how a blow that never breaks the skull can still damage a brain, why “mild” is a misleading word, and why the injury is better thought of as the start of a long process than as an event."
tags: traumatic-brain-injury neuroscience comorbidity network-medicine
cover: tbi
categories: research
giscus_comments: false
related_posts: false
date: 2026-10-23 12:00:00 +0530

authors:
  - name: Kaustav Mehta
    url: "https://kaustavmehta.github.io"
    affiliations:
      name: Krea University

bibliography: 2026-10-23-tbi-part-1-the-quiet-injury.bib

toc:
  - name: An ordinary injury
  - name: Who, how and where
  - name: A soft thing in a hard box
  - name: What a blow does
  - name: Stretch, not crush
  - name: The second injury
  - name: Why there is no drug
  - name: Counting consciousness
  - name: Mild is not minor
  - name: A process, not an event
  - name: Tangles

_styles: >
  :root { --tbi1-bone: #e9e1d2; --tbi1-bone-edge: #c9bca4; --tbi1-csf: #d7e8f2; --tbi1-tissue: #e8b9b0; --tbi1-tissue-edge: #b9786d; --tbi1-faint: rgba(0,0,0,0.16); }
  html[data-theme="dark"] { --tbi1-bone: #4a443b; --tbi1-bone-edge: #6d6455; --tbi1-csf: #1d3442; --tbi1-tissue: #8d5a55; --tbi1-tissue-edge: #c48a80; --tbi1-faint: rgba(255,255,255,0.2); }
  .tbi1-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .tbi1-since { display: flex; align-items: baseline; gap: 0.9rem; flex-wrap: wrap; margin: 1.6rem 0 0.4rem; }
  .tbi1-since .tbi-stat-num { font-size: 2.6rem; min-width: 6.5ch; }
  .tbi1-since .tbi-stat-label { font-size: 0.9rem; color: var(--tbi-ink-2); }
  .tbi1-canvas-wrap { position: relative; width: 100%; }
  .tbi1-canvas-wrap canvas { width: 100%; display: block; touch-action: pan-y; }
  #tbi1-incidence { aspect-ratio: 16 / 7; }
  #tbi1-jelly { aspect-ratio: 16 / 10; touch-action: none; cursor: grab; border-radius: 10px; }
  #tbi1-jelly:active { cursor: grabbing; }
  #tbi1-axon { aspect-ratio: 16 / 6; }
  .tbi1-est-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem 1rem; margin-bottom: 0.4rem; }
  .tbi1-est-head .tbi-stat-num { font-size: 2.4rem; }
  .tbi1-est-note { font-size: 0.82rem; color: var(--tbi-ink-2); max-width: 32rem; line-height: 1.45; min-height: 2.4em; }
  .tbi1-bars { display: grid; grid-template-columns: minmax(7rem, 13rem) 1fr; gap: 0.55rem 0.9rem; align-items: center; }
  .tbi1-bar-label { font-size: 0.8rem; line-height: 1.25; text-align: right; color: var(--tbi-ink); }
  .tbi1-bar-label small { display: block; color: var(--tbi-ink-2); font-size: 0.68rem; }
  .tbi1-bar { display: flex; height: 22px; border-radius: 4px; overflow: hidden; background: var(--tbi-soft); }
  .tbi1-seg { height: 100%; width: 0; transition: width 1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s; outline: none; position: relative; cursor: default; }
  .tbi1-seg:focus-visible { box-shadow: inset 0 0 0 2px var(--global-text-color); }
  .tbi1-seg.is-dim { opacity: 0.25; }
  .tbi1-seg-road { background: var(--tbi-cardio); }
  .tbi1-seg-falls { background: var(--tbi-metab); }
  .tbi1-seg-violence { background: var(--tbi-psych); }
  .tbi1-seg-other { background: var(--tbi-other); opacity: 0.55; }
  .tbi1-seg-range { background: repeating-linear-gradient(135deg, var(--tbi-metab) 0 3px, transparent 3px 6px); }
  .tbi1-seg-rest { background: transparent; }
  .tbi1-gap { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 0.5rem; }
  .tbi1-gap-item h3 { font-size: 0.78rem !important; font-weight: 600; margin: 0 0 0.6rem; letter-spacing: 0.02em; }
  .tbi1-gap-row { display: grid; grid-template-columns: 4.2rem 1fr 3.4rem; align-items: center; gap: 0.5rem; font-size: 0.78rem; margin-bottom: 0.35rem; }
  .tbi1-gap-row .tbi1-gap-track { height: 12px; background: var(--tbi-soft); border-radius: 0 3px 3px 0; }
  .tbi1-gap-row .tbi1-gap-fill { height: 100%; width: 0; background: var(--tbi-ink-2); border-radius: 0 3px 3px 0; transition: width 1.1s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .tbi1-gap-row.is-india .tbi1-gap-fill { background: var(--tbi-accent); }
  .tbi1-gap-row .tbi1-gap-val { font-variant-numeric: tabular-nums; text-align: right; }
  .tbi1-jelly-bar { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem; align-items: center; }
  .tbi1-jelly-bar .tbi1-spacer { flex: 1; }
  .tbi1-hint { position: absolute; left: 0.75rem; top: 0.6rem; font-size: 0.72rem; color: var(--tbi-ink-2); pointer-events: none; transition: opacity 0.4s; }
  .tbi1-readout { min-height: 3em; margin-top: 0.6rem; font-size: 0.85rem; line-height: 1.5; }
  .tbi1-accel svg { width: 100%; height: auto; overflow: visible; }
  .tbi1-accel .tbi1-mark { cursor: pointer; outline: none; }
  .tbi1-accel .tbi1-mark:focus-visible circle, .tbi1-accel .tbi1-mark:focus-visible rect { stroke: var(--global-text-color); stroke-width: 2; }
  .tbi1-axis line, .tbi1-axis path { stroke: var(--tbi-ink-2); stroke-opacity: 0.5; }
  .tbi1-axis text { font-size: 10px; fill: var(--tbi-ink-2) !important; }
  .tbi1-svg-label { font-size: 11px; }
  .tbi1-svg-small { font-size: 10px; fill: var(--tbi-ink-2) !important; }
  .tbi1-scrub { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.6rem; flex-wrap: wrap; }
  .tbi1-scrub input[type="range"] { flex: 1 1 12rem; accent-color: var(--global-theme-color); min-width: 0; }
  .tbi1-scrub .tbi1-time { font-variant-numeric: tabular-nums; font-size: 0.8rem; min-width: 7.5rem; color: var(--tbi-ink); }
  .tbi1-cascade { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 1.25rem; align-items: start; }
  .tbi1-cascade svg { width: 100%; height: auto; display: block; overflow: visible; }
  .tbi1-stage-title { font-family: "Newsreader", Georgia, serif; font-size: 1.15rem; margin: 0 0 0.35rem; color: var(--tbi-ink); }
  .tbi1-stage-when { font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tbi-accent); font-weight: 600; }
  .tbi1-stage-text { font-size: 0.86rem; line-height: 1.55; margin: 0.3rem 0 0; }
  .tbi1-stage-dots { display: flex; gap: 0.35rem; margin-top: 0.8rem; flex-wrap: wrap; }
  .tbi1-trials { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.25rem; align-items: start; }
  .tbi1-trials canvas { width: 100%; aspect-ratio: 28 / 14; }
  .tbi1-trial-cards { display: grid; gap: 0.6rem; }
  .tbi1-trial { padding: 0.65rem 0.8rem; }
  .tbi1-trial h3 { font-size: 0.8rem !important; margin: 0 0 0.15rem; font-weight: 600; }
  .tbi1-trial p { font-size: 0.75rem; line-height: 1.4; margin: 0 0 0.4rem; color: var(--tbi-ink-2); }
  .tbi1-pair { display: grid; grid-template-columns: 5.6rem 1fr 2.8rem; gap: 0.4rem; align-items: center; font-size: 0.72rem; margin-top: 0.2rem; }
  .tbi1-pair-track { height: 9px; background: var(--tbi-soft); border-radius: 0 3px 3px 0; }
  .tbi1-pair-fill { height: 100%; width: 0; background: var(--tbi-ink-2); opacity: 0.6; border-radius: 0 3px 3px 0; transition: width 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .tbi1-pair-fill.is-drug { background: var(--tbi-accent); opacity: 1; }
  .tbi1-pair-val { text-align: right; font-variant-numeric: tabular-nums; }
  .tbi1-gcs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.9rem; }
  .tbi1-gcs fieldset { border: 1px solid var(--tbi-rule); border-radius: 10px; padding: 0.6rem 0.7rem 0.7rem; margin: 0; min-width: 0; }
  .tbi1-gcs legend { font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; color: var(--tbi-ink-2); padding: 0 0.3rem; width: auto; margin: 0; }
  .tbi1-opt { display: grid; grid-template-columns: 1.5rem 1fr; gap: 0.4rem; align-items: center; width: 100%; text-align: left; font: inherit; font-size: 0.78rem; line-height: 1.3; padding: 0.32rem 0.45rem; margin: 0.12rem 0; border-radius: 6px; border: 1px solid transparent; background: transparent; color: var(--tbi-ink); cursor: pointer; transition: background 0.2s, border-color 0.2s; }
  .tbi1-opt:hover { border-color: var(--tbi-rule); }
  .tbi1-opt:focus-visible { outline: 2px solid var(--tbi-accent); outline-offset: 1px; }
  .tbi1-opt .tbi1-opt-n { font-family: "Newsreader", Georgia, serif; font-size: 1rem; text-align: center; color: var(--tbi-ink-2); }
  .tbi1-opt[aria-checked="true"] { background: var(--tbi-soft); border-color: var(--tbi-accent); }
  .tbi1-opt[aria-checked="true"] .tbi1-opt-n { color: var(--tbi-accent); }
  .tbi1-gcs-out { display: grid; grid-template-columns: auto 1fr; gap: 0.4rem 1.25rem; align-items: center; margin-top: 1.1rem; }
  .tbi1-gcs-total { font-family: "Newsreader", Georgia, serif; font-weight: 300; font-size: 3.6rem; line-height: 1; color: var(--tbi-accent); font-variant-numeric: tabular-nums; min-width: 2.2ch; }
  .tbi1-scale { position: relative; height: 34px; margin-top: 0.3rem; }
  .tbi1-scale-band { position: absolute; top: 0; height: 12px; border-radius: 3px; }
  .tbi1-scale-band span { position: absolute; top: 15px; left: 0; font-size: 0.68rem; color: var(--tbi-ink-2); white-space: nowrap; }
  .tbi1-scale-pin { position: absolute; top: -4px; width: 3px; height: 20px; margin-left: -1.5px; background: var(--global-text-color); border-radius: 2px; transition: left 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s; }
  .tbi1-waffle-wrap { display: grid; grid-template-columns: minmax(0, 15rem) minmax(0, 1fr); gap: 1.4rem; align-items: center; }
  .tbi1-waffle { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; }
  .tbi1-cell { aspect-ratio: 1; border-radius: 50%; background: var(--tbi-faint); transition: background 0.35s, transform 0.35s; }
  .tbi1-cell.is-on { background: var(--tbi-accent); transform: scale(1.06); }
  .tbi1-waffle-num { font-family: "Newsreader", Georgia, serif; font-weight: 300; font-size: 3rem; line-height: 1; color: var(--tbi-accent); font-variant-numeric: tabular-nums; }
  .tbi1-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
  .tbi1-timeline svg, .tbi1-links svg { width: 100%; height: auto; display: block; overflow: visible; }
  .tbi1-tl-mark { cursor: pointer; outline: none; }
  .tbi1-tl-mark circle { transition: r 0.3s, fill-opacity 0.3s; }
  .tbi1-tl-mark:focus-visible circle { stroke: var(--global-text-color); stroke-width: 2; }
  .tbi1-node { cursor: pointer; outline: none; }
  .tbi1-node:focus-visible circle { stroke: var(--global-text-color); stroke-width: 2; }
  .tbi1-node text { font-size: 11px; pointer-events: none; }
  .tbi1-link { stroke: var(--tbi-ink-2); stroke-linecap: round; transition: stroke-opacity 0.4s, stroke 0.3s; }
  .tbi1-link.is-hot { stroke: var(--tbi-accent); }
  .tbi1-brain-fig .tbi-brain { margin-top: 0.25rem; }
  .tbi1-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; }
  @media (max-width: 760px) {
    .tbi1-cascade, .tbi1-trials, .tbi1-waffle-wrap, .tbi1-two { grid-template-columns: 1fr; }
    .tbi1-gcs { grid-template-columns: 1fr; }
    .tbi1-waffle { max-width: 15rem; }
  }
  @media (max-width: 640px) {
    .tbi1-bars { grid-template-columns: 6.6rem 1fr; }
    .tbi1-gap { grid-template-columns: 1fr; }
    #tbi1-incidence { aspect-ratio: 4 / 3; }
    #tbi1-jelly { aspect-ratio: 1 / 1; }
    #tbi1-axon { aspect-ratio: 4 / 3; }
    .tbi1-since .tbi-stat-num { font-size: 2.2rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .tbi1-seg, .tbi1-gap-fill, .tbi1-pair-fill, .tbi1-cell, .tbi1-scale-pin { transition: none; }
  }
---

<link rel="stylesheet" href="{{ '/assets/css/tbi-series.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/tbi-brain.css' | relative_url }}">

<blockquote class="tbi-lede">
Somewhere in the world, about once or twice every second, a force from outside the body changes how somebody’s brain works. Most of those people are told the injury is mild, many walk out of the emergency department with a normal scan, and for a good number of them that is not the end of it.
</blockquote>

<div class="tbi1-since" aria-live="off">
  <span class="tbi-stat-num" id="tbi1-since-num">0</span>
  <span class="tbi-stat-label" id="tbi1-since-label">people have had a traumatic brain injury since you opened this page, going by the lowest of the global estimates. The highest would make it about two and a half times as many.</span>
</div>

<nav class="tbi-series" aria-label="Series">
  <a href="{{ '/blog/2026/tbi-part-1-the-quiet-injury/' | relative_url }}" class="is-current" aria-current="page"><span class="tbi-series-num">Part 1</span><span class="tbi-series-title">The quiet injury</span></a>
  <a href="{{ '/blog/2026/tbi-part-2-thinking-in-graphs/' | relative_url }}"><span class="tbi-series-num">Part 2</span><span class="tbi-series-title">Thinking in graphs</span></a>
  <a href="{{ '/blog/2026/tbi-part-3-a-map-of-what-comes-after/' | relative_url }}"><span class="tbi-series-num">Part 3</span><span class="tbi-series-title">A map of what comes after</span></a>
</nav>

In 2023, for my undergraduate capstone at Krea University, I spent a few months with a database of people who had been through a traumatic brain injury in the United States, trying to work out which other illnesses tended to turn up together in the years afterwards. The project was supervised by Dr Shyam Kumar Sudhakar, and it led to a paper on how common those illnesses were five years after a mild injury <d-cite key="sudhakar2023frontiers"></d-cite>, a perspective piece on why graph theory might help <d-cite key="sudhakar2024bosn"></d-cite>, and a paper that built the illnesses into networks <d-cite key="mehta2025bmc"></d-cite>. This series is my attempt to explain that work to someone who has never studied medicine, statistics or graph theory, which, at the start of the project, was more or less me.

Before I can get to networks, though, I need you to care about the injury, and in my experience most people do not think about brain injury at all unless it has happened to someone they know. This first part is about the injury itself: how common it is, what physically happens inside a head when it is struck or shaken, why the word “mild” misleads, and why the people who study it have started to describe it as a disease that goes on for years rather than as an event that is over once the bruise fades. Part 2 builds the graph-theory toolkit from scratch, and Part 3 puts the two together.

## An ordinary injury

The consensus definition is broad on purpose. A traumatic brain injury (TBI) is “an alteration in brain function, or other evidence of brain pathology, caused by an external force” <d-cite key="menon2010definition"></d-cite>. The force can be a blow, the head hitting the ground, a sudden stop in a car, a blast, or a penetrating object, and the alteration can be anything from a few minutes of confusion to a coma. My thesis used a textbook wording that I still like because it spells out what can be affected: damage to the brain from an external mechanical force, “resulting in either temporary or permanent impairment of physical, cognitive, and psychosocial functions, as well as alterations or reductions in consciousness” <d-cite key="mehta2023thesis,whitfield2020tbi"></d-cite>.

How many people does this happen to? The honest answer is that nobody knows to within a factor of two or so. The Global Burden of Disease study estimated 27.08 million new cases in 2016 <d-cite key="gbd2019tbi"></d-cite>. The _Lancet Neurology_ Commission on TBI puts it at 50 to 60 million a year, and points out the gap with the GBD figure itself <d-cite key="maas2017lancet,maas2022lancet"></d-cite>. A third estimate, built from a different set of studies, comes to 69 million <d-cite key="dewan2019jns"></d-cite>. The Commission also says that “of all common neurological disorders, TBI has the highest incidence” <d-cite key="maas2022lancet"></d-cite>.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">One year of brain injuries, one dot per 100,000 people</div>
  <div class="tbi1-est-head">
    <div class="tbi-stat" style="margin: 0"><span class="tbi-stat-num" id="tbi1-inc-num">27.1M</span></div>
    <div class="tbi-controls" role="group" aria-label="Choose an estimate" id="tbi1-inc-btns">
      <button class="tbi-btn" type="button" data-est="gbd" aria-pressed="true">GBD 2016</button>
      <button class="tbi-btn" type="button" data-est="lancet" aria-pressed="false">Lancet Commission</button>
      <button class="tbi-btn" type="button" data-est="dewan" aria-pressed="false">Dewan et al.</button>
    </div>
  </div>
  <div class="tbi1-canvas-wrap"><canvas id="tbi1-incidence" role="img" aria-label="Dots, each standing for 100,000 people with a new traumatic brain injury in a year. The number of dots changes with the chosen estimate, from about 270 to about 740."></canvas></div>
  <div class="tbi-legend">
    <span><span class="tbi-swatch" style="background: var(--tbi-accent)"></span>Classified mild (more than nine in ten)</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-injury)"></span>Moderate or severe</span>
    <span><span class="tbi-swatch" style="border: 1px solid var(--tbi-ink-2)"></span>Within the estimate’s uncertainty range</span>
  </div>
  <p class="tbi1-est-note" id="tbi1-inc-note" aria-live="polite"></p>
  <figcaption>Data, drawn as a unit chart. Annual new cases from the Global Burden of Disease study for 2016 (27.08 million; 95% uncertainty interval 24.3 to 30.3 million) <d-cite key="gbd2019tbi"></d-cite>, the <em>Lancet Neurology</em> Commission (50 to 60 million) <d-cite key="maas2022lancet"></d-cite> and Dewan et al. (69 million; 95% CI 64 to 74 million) <d-cite key="dewan2019jns"></d-cite>. Solid dots are the lower end of each range and hollow dots the rest of it. The share marked mild uses the Commission’s statement that more than 90% of cases are classified as mild <d-cite key="maas2022lancet"></d-cite>; I have coloured exactly nine in ten, so the moderate and severe share is, if anything, slightly too large. The counter under the opening paragraph is my own arithmetic: 27.08 million and 69 million a year are about 0.86 and 2.2 people a second. Choose an estimate to redraw.</figcaption>
</figure>

The reason for the spread is not carelessness. Most brain injuries are mild, and much mild injury never reaches a hospital, so any estimate built from hospital records misses a large share of it. The WHO’s task force on mild TBI put the hospital-treated rate at about 100 to 300 per 100,000 people a year, and the true population rate at “probably above 600/100,000” <d-cite key="cassidy2004who"></d-cite>. A Canadian study of concussion found 1,153 per 100,000 per year <d-cite key="maas2022lancet"></d-cite>. Between 70 and 90 per cent of treated brain injuries are mild <d-cite key="cassidy2004who"></d-cite>, and the Commission puts it at more than 90 per cent of all cases <d-cite key="maas2022lancet"></d-cite>. So when you read a number for TBI, it is mostly a number for mild TBI, and it is probably an undercount.

The cost is easier to pin down than the count. The Commission puts it at around US$400 billion a year to the global economy, and in Europe alone more than two million people are admitted to hospital with TBI each year and about 82,000 die <d-cite key="maas2022lancet"></d-cite>. In the United States in 2013 there were about 2.8 million TBI-related emergency visits, hospitalisations and deaths <d-cite key="taylor2017mmwr"></d-cite>. One self-reported estimate quoted in the textbook my thesis leaned on has lifetime prevalence at up to 40% of adults <d-cite key="critchley2020epi"></d-cite>, which I find hard to square with how rarely anyone mentions having had one. I suspect that is because a large part of it is the kind of thing people describe as “I hit my head” and then stop thinking about.

## Who, how and where

Who gets hurt, and how, depends a great deal on where they live and how old they are. In high-income countries most TBI comes from falls, “particularly in older people (aged ≥65 years), who often have comorbidities” <d-cite key="maas2022lancet"></d-cite>. In the United States the highest rates of TBI-related emergency visits, hospitalisations and deaths were in people aged 75 and over (2,232.2 per 100,000), followed by the very young (0 to 4) and people aged 15 to 24, and falls in the over-75s drove much of the rise in emergency visits between 2007 and 2013 <d-cite key="taylor2017mmwr"></d-cite>. In low- and middle-income countries the picture is driven by road traffic, “particularly those involving motorcyclists” <d-cite key="maas2022lancet"></d-cite>. Globally, falls were 52% of causes in 1990 and 54% in 2019 <d-cite key="maas2022lancet"></d-cite>.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">How the injuries happen, by source</div>
  <div class="tbi1-bars" id="tbi1-causes" role="group" aria-label="Causes of traumatic brain injury in different populations"></div>
  <div class="tbi-legend">
    <span><span class="tbi-swatch" style="background: var(--tbi-cardio)"></span>Road traffic</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-metab)"></span>Falls</span>
    <span><span class="tbi-swatch" style="background: repeating-linear-gradient(135deg, var(--tbi-metab) 0 3px, transparent 3px 6px)"></span>Falls, upper end of a range</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-psych)"></span>Violence</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-other); opacity: 0.55"></span>Other</span>
    <span><span class="tbi-swatch" style="border: 1px solid var(--tbi-ink-2)"></span>Not broken down in the source</span>
  </div>
  <figcaption>Data. Shares of TBI by cause as each source reports them: the world in 2019 (GBD, via the Lancet Commission) <d-cite key="maas2022lancet"></d-cite>; Africa and South-East Asia against North America, road traffic only <d-cite key="dewan2019jns"></d-cite>; India from Gururaj’s 2002 review <d-cite key="gururaj2002"></d-cite> and from a systematic review of 72 Indian hospital studies <d-cite key="massenburg2017india"></d-cite>; and the people in the US database my project used, who were all admitted for inpatient rehabilitation <d-cite key="tbims2022profile"></d-cite>. The sources define their categories differently (the US database says “vehicular”, which includes more than road crashes), so compare the shapes rather than the decimals. Hover over, tap or tab to a segment for its source.</figcaption>
</figure>

India deserves its own paragraph, partly because I live here and partly because the numbers are so thin. The estimate that is still cited most often is from 2002: “nearly 1.5 to 2 million persons are injured” every year, with road traffic the leading cause at about 60%, followed by falls at 20 to 25% and violence at about 10%, and alcohol involved in 15 to 20% of cases <d-cite key="gururaj2002"></d-cite>. That a twenty-year-old figure is still the reference point is itself a finding. A 2017 systematic review pooled 72 studies of 19,962 patients from 14 states over 27 years and found a mean age of 31.3, a male to female ratio of 3.8 to 1, and a mean in-hospital mortality of 24.6%; it also noted that “over a quarter of the world’s trauma deaths occur in India, with traumatic brain injury (TBI) as the leading cause of death and disability within trauma”, and that the quality of reporting was low <d-cite key="massenburg2017india"></d-cite>. The patients are young, and they are mostly men on roads.

What happens after the injury differs just as much. A comparison in the Commission’s report is the starkest pair of numbers I came across while reading for this series.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">The care gap: Europe and India</div>
  <div class="tbi1-gap" id="tbi1-gap">
    <div class="tbi1-gap-item">
      <h3>Emergency care at the scene</h3>
      <div class="tbi1-gap-row"><span>Europe</span><div class="tbi1-gap-track"><div class="tbi1-gap-fill" data-v="89.6"></div></div><span class="tbi1-gap-val">89.6%</span></div>
      <div class="tbi1-gap-row is-india"><span>India</span><div class="tbi1-gap-track"><div class="tbi1-gap-fill" data-v="5.8"></div></div><span class="tbi1-gap-val">5.8%</span></div>
    </div>
    <div class="tbi1-gap-item">
      <h3>Discharged to a rehabilitation facility</h3>
      <div class="tbi1-gap-row"><span>Europe</span><div class="tbi1-gap-track"><div class="tbi1-gap-fill" data-v="16.3"></div></div><span class="tbi1-gap-val">16.3%</span></div>
      <div class="tbi1-gap-row is-india"><span>India</span><div class="tbi1-gap-track"><div class="tbi1-gap-fill" data-v="0.4"></div></div><span class="tbi1-gap-val">0.4%</span></div>
    </div>
  </div>
  <figcaption>Data. Shares of patients in the Global Neurotrauma Outcomes comparison, as reported in the Lancet Neurology Commission <d-cite key="maas2022lancet"></d-cite>. Both bars use the same scale (0 to 100%).</figcaption>
</figure>

Hold on to that second pair. The database my project used is made up entirely of people who were discharged to inpatient rehabilitation in the United States, which, in India, would describe almost nobody.

## A soft thing in a hard box

To see why a blow that leaves the skull intact can still hurt the brain, it helps to know what kind of object the brain is, physically. It is very soft. When engineers press on slices of brain to measure how stiff it is, they find moduli of about 1.4 kilopascals for grey matter and 1.9 for white matter in cow brain <d-cite key="budday2015"></d-cite>, and in human tissue the best-fitting models give a shear modulus (how easily it deforms when one layer slides over another) of about 0.4 to 1.4 kilopascals <d-cite key="budday2017"></d-cite>. Those numbers are hard to feel, so here is an image rather than a measurement: the comparison usually made is to soft tofu or a set jelly. It holds its shape on a plate, and it tears if you pull on it. Mechanically, it is “nonlinear and viscoelastic” <d-cite key="budday2017"></d-cite>, which means it behaves partly like a spring and partly like honey, and stiffens the more you deform it.

That soft object does not sit directly against bone. It floats in cerebrospinal fluid, a thin layer of clear liquid that fills the space between brain and skull, and it is tethered at the bottom by the brainstem and loosely by membranes and blood vessels. The skull around it is hard and, on the outside, smooth. The inside of its floor is not. The front of the brain rests on the bony roofs of the eye sockets, and the tips of the temporal lobes sit in two cup-shaped hollows on either side, behind a sharp ledge of bone called the sphenoid ridge. As Bigler puts it, “these concavities of the skull base cup the frontal and temporal lobes”, and the ridge and the edge of the tentorium (a stiff fold of membrane that separates the back of the brain from the cerebellum) “are uniquely situated to facilitate injury to the posterior base of the frontal lobe and the anterior pole and medial surface area of the temporal lobe” <d-cite key="bigler2007"></d-cite>. Keep those two places in mind: the underside of the frontal lobes and the front tips of the temporal lobes.

The model below is a real brain surface, reconstructed from MRI, inside a skull. Turn it, open the skull, and pick a region to see where it is and what it does.

<figure class="tbi-fig tbi1-brain-fig l-page">
  <div class="tbi-kicker">The brain, region by region</div>
  <div class="tbi-brain" id="tbi-brain" data-mode="explore"></div>
  <figcaption id="tbi1-brain-cap-explore">Anatomy, not a schematic: the cortex is FreeSurfer’s fsaverage surface (an average of 40 adult brains reconstructed from MRI), divided into regions with the Destrieux atlas, with deep structures from the Harvard-Oxford and Juelich atlases; the skull is derived and simplified. The descriptions of what each region does are my plain-language summaries. Drag to turn, tap or choose a region, and use Skull, See-through and Cutaway to look inside; Cutaway shows the midline and the bony floor the frontal and temporal lobes rest on.</figcaption>
</figure>

The functions in that model are summaries, and the brain does not really divide its work this neatly, but the broad strokes matter for this series. The frontal lobes, and in particular their underside (the orbitofrontal cortex), are heavily involved in planning, holding back impulses and regulating emotion. The temporal lobes hold the machinery for forming new memories and for processing emotion. These are the regions that sit on the rough parts of the skull floor. If you were designing a skull to protect personality, mood and memory, you would not put them there.

## What a blow does

Now strike the box. The skull is pushed one way, and for a brief moment the brain, which is only loosely attached and has inertia of its own, stays where it was. The skull’s inner wall catches up with the brain on the side that was struck and compresses it there, and when the skull is stopped (by the neck, or by the floor) the brain carries on moving and meets the far wall. Neuropathologists call the bruise at the site of the blow a coup injury and the bruise on the opposite side a contrecoup injury. The textbook chapter on neuropathology describes the mechanism of most non-penetrating injury as “rapid acceleration or deceleration of the head, with or without impact” <d-cite key="hilton2020neuropath"></d-cite>. “With or without impact” is the important part. What hurts the brain is the motion, and the skull does not need to break for that to happen.

Below is a deliberately crude model of the idea: a soft body in a fluid inside a rigid shell, with a ridged floor at the front. It is not a brain and not a simulation of one, but it obeys the same basic rule, which is that a soft, loosely held thing lags behind its container.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">A soft body in a hard shell (an illustration)</div>
  <div class="tbi1-canvas-wrap">
    <canvas id="tbi1-jelly" tabindex="0" role="img" aria-label="A side view of a soft, brain-shaped body floating in fluid inside a rigid shell with a ridged floor at the front. Buttons below deliver blows; places where the body hits the shell are marked as bruises."></canvas>
    <span class="tbi1-hint" id="tbi1-jelly-hint">Drag the shell to shake it, or use the buttons</span>
  </div>
  <div class="tbi1-jelly-bar" role="group" aria-label="Deliver a blow">
    <button class="tbi-btn" type="button" data-blow="front">Blow to the forehead</button>
    <button class="tbi-btn" type="button" data-blow="fall">Fall onto the back of the head</button>
    <button class="tbi-btn" type="button" data-blow="hook">Glancing, rotating blow</button>
    <span class="tbi1-spacer"></span>
    <button class="tbi-btn" type="button" id="tbi1-jelly-slow" aria-pressed="true">Slow motion</button>
    <button class="tbi-btn" type="button" id="tbi1-jelly-clear">Clear bruises</button>
  </div>
  <div class="tbi1-readout tbi-readout" id="tbi1-jelly-read" aria-live="polite">Front of the head is on the left. The lines inside the body stretch and turn red where the tissue is being strained.</div>
  <figcaption>An illustration, not a model of real tissue: a two-dimensional soft body with a stiffness, fluid drag and ridge shape chosen by me to make the effect visible. Time is slowed down a great deal (the peak of a real concussive impact lasts about 15 milliseconds <d-cite key="pellman2003"></d-cite>). Red dots mark places where the body has hit the shell hard enough to bruise in this toy, and they build up with repeated blows. Drag the shell with a mouse or finger to shake it yourself.</figcaption>
</figure>

Try the blow to the forehead and the fall backwards a few times each. In both, the front of the body ends up hitting the front of the shell: once as the coup, once as the contrecoup, and every time it does, the lower front edge slides across the ridges. That is the intuition behind a pattern that took me a while to believe, which is that contusions cluster in the frontal and temporal poles more or less regardless of where on the head the blow lands <d-cite key="bigler2007"></d-cite>. The skull floor is shaped so that whatever the brain does in those first milliseconds, its front and its temporal tips grind against something rough.

The 3D model can do the same thing on real anatomy. Choose where the blow comes from and how hard, and press Strike.

<figure class="tbi-fig tbi1-brain-fig l-page">
  <div class="tbi-kicker">Coup, contrecoup and shear on a real brain surface</div>
  <div class="tbi-brain" id="tbi-brain-impact" data-mode="impact" data-scenario="back"></div>
  <figcaption id="tbi1-brain-cap-impact">An illustration on MRI-derived anatomy. The mechanics are a toy model built to give intuition, not a finite-element simulation: the brain lags the skull in its fluid, bruises where it is pressed against or scraped over bone and where it pulls away on the far side, and shears when the head rotates. Severity is unitless and the times are illustrative, so none of its numbers should be read as measurements. The pattern it is built to reproduce, frontal and temporal bruising for most directions of blow and deeper axonal injury with harder rotation, is from the clinical and experimental work cited in the text <d-cite key="bigler2007,gennarelli1982,adams1989dai"></d-cite>. Choose where the blow lands and how hard, then press Strike; scrub the timeline to replay in slow motion, and turn on Cutaway to watch the fluid gap close at one side and open at the other. The skull is intact every time.</figcaption>
</figure>

## Stretch, not crush

Bruises on the surface are only half of the story, and for mild injury probably the smaller half. In 1943 the physicist A. H. S. Holbourn, reasoning from physical models of the head, argued that brain tissue is very hard to compress but very easy to shear, and that it is therefore rotation of the head, more than straight-line acceleration, that damages it <d-cite key="holbourn1943"></d-cite>. Think of the jelly again. Push it straight and it moves as a block; twist the plate quickly and the edge goes with the plate while the middle lags behind, and the jelly in between is stretched. Ommaya and Gennarelli later tied this idea to concussion and loss of consciousness, proposing that as the severity of rotation rises, the shearing reaches progressively deeper structures <d-cite key="ommaya1974"></d-cite>.

The experimental evidence for this is from monkeys, and it is not pleasant to read, but it is clear. In 1982 Gennarelli and colleagues accelerated the heads of 45 primates without any impact at all, varying only the direction of the rotation <d-cite key="gennarelli1982"></d-cite>. Brief coma of under 15 minutes (a concussion) followed in 11 of 13 animals rotated front to back, 2 of 6 rotated obliquely and 2 of 26 rotated sideways. All 15 concussed animals recovered and showed no diffuse axonal injury. But 20 of the animals rotated sideways were in coma for more than six hours, all were severely disabled, and their brains showed the axonal damage seen in severe human injury. The authors concluded that “axonal damage produced by coronal head acceleration is a major cause of prolonged traumatic coma and its sequelae” <d-cite key="gennarelli1982"></d-cite>. Nothing struck those skulls.

How hard is the motion in an ordinary concussion? The best numbers come from American football, because players can be filmed, reconstructed with crash-test dummies or fitted with sensors in their helmets.

<figure class="tbi-fig l-body-outset tbi1-accel">
  <div class="tbi-kicker">Head accelerations measured in football</div>
  <div class="tbi-controls" role="group" aria-label="Choose the kind of acceleration">
    <button class="tbi-btn" type="button" data-acc="lin" aria-pressed="true">Straight-line (g)</button>
    <button class="tbi-btn" type="button" data-acc="rot" aria-pressed="false">Rotational (rad/s²)</button>
  </div>
  <svg id="tbi1-accel" viewBox="0 0 640 190" role="img" aria-label="Head accelerations in concussive and non-concussive football impacts"></svg>
  <div class="tbi1-readout tbi-readout" id="tbi1-accel-read" aria-live="polite"></div>
  <figcaption>Data. Straight-line: reconstructions of 31 professional football impacts, as mean ± standard deviation for concussed and uninjured struck players <d-cite key="pellman2003"></d-cite>, and the range of 13 concussive impacts recorded by helmet sensors in 88 college players <d-cite key="guskiewicz2007"></d-cite>. Rotational: averages over 300,977 non-concussive and 57 concussive impacts in 335 instrumented players, and the level at which the fitted risk of concussion reaches 50% <d-cite key="rowson2012rot"></d-cite>. One g is the acceleration of gravity. Hover over, tap or tab to a marker.</figcaption>
</figure>

A concussed professional player’s head, on average, briefly experienced about 98 times the acceleration of gravity, over about 15 milliseconds <d-cite key="pellman2003"></d-cite>. What I find more telling is how much the ranges overlap. In the college study, concussive impacts ranged from about 61 g to about 169 g, and how severe the concussion was clinically had nothing to do with the size of the impact. The authors were candid that “it may be difficult to establish a threshold for concussive injury that can be applied to all football players” <d-cite key="guskiewicz2007"></d-cite>. The same blow can concuss one person and not the next, which is part of why concussion is so hard to see from the outside.

What the rotation does inside is easiest to picture with the brain’s wiring. Nerve cells talk over long, thin cables called axons, bundled together in the white matter, and each axon is held in shape by an internal scaffold of protein tubes (microtubules) that also act as the rails along which the cell transports material. Axons are, in the words of one review, “especially vulnerable to injury due to the mechanical loading of the brain”, and diffuse axonal injury “has been found in all severities of TBI and may represent a key pathologic substrate of mild TBI (concussion)” <d-cite key="johnson2013axonal"></d-cite>.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">What a fast stretch does to an axon (an illustration)</div>
  <div class="tbi1-canvas-wrap"><canvas id="tbi1-axon" role="img" aria-label="A bundle of axons is stretched quickly. Over the following hours they develop wavy kinks, then swellings, and by 24 hours most have broken into fragments."></canvas></div>
  <div class="tbi1-scrub">
    <button class="tbi-btn" type="button" id="tbi1-axon-play">Stretch</button>
    <input type="range" id="tbi1-axon-t" min="0" max="1000" value="0" aria-label="Time after the stretch" />
    <span class="tbi1-time" id="tbi1-axon-time" aria-live="polite">Before the stretch</span>
  </div>
  <figcaption>An illustration of what Tang-Schomer and colleagues saw when they stretched cultured axons quickly: “undulating distortions formed along the axons”, then swellings, “leading to degeneration of almost all axons by 24 h”, because the fast stretch broke microtubules at specific points and interrupted transport along them <d-cite key="tangschomer2010"></d-cite>. The timings on the slider follow their description; the drawing is mine and is not to scale. Press Stretch, or drag the slider.</figcaption>
</figure>

In other words, the stretch lasts milliseconds but the damage plays out over a day, and in people, “axonal degeneration has been found to continue even years after injury” <d-cite key="johnson2013axonal"></d-cite>. Where it happens is also not random. In a classic study of 434 fatal non-penetrating head injuries, Adams and colleagues found diffuse axonal injury in 122, and graded it by where the damage reached: the white matter of the hemispheres, then a focal lesion in the corpus callosum (the thick band of fibres joining the two halves of the brain), then a lesion in the upper brainstem <d-cite key="adams1989dai"></d-cite>. In 24 of those cases the injury could only be seen under the microscope. The last model below shows the same idea in three dimensions, with the long fibre bundles drawn in.

<figure class="tbi-fig tbi1-brain-fig l-page">
  <div class="tbi-kicker">Rotation and the long fibre bundles</div>
  <div class="tbi-brain" id="tbi-brain-shear" data-mode="shear"></div>
  <figcaption id="tbi1-brain-cap-shear">The same toy model, with the cortex made see-through and 364 stylised axon bundles drawn in: fibres crossing the corpus callosum, the tract running down into the brainstem, and short fibres just under the cortex. During a rotation the deep core lags the outer brain (the deformation is drawn four times larger than the model computes); bundles turn amber as they stretch and, past a threshold, swell and break. The bundles are drawn, not traced from imaging. Choose a kind of motion, including whiplash, where nothing touches the head, and press Rotate.</figcaption>
</figure>

None of the damage in this section needs a broken skull, a bleed, or anything that shows up on the CT scan used in most emergency departments. In one study of 135 people with mild TBI, 27% of those with a normal CT on admission had an abnormal MRI soon after, and contusions or four or more small bleeds along axons on that MRI predicted a worse outcome at three months <d-cite key="yuh2013mri"></d-cite>. A normal scan means that the scan was normal.

## The second injury

So far everything I have described happens in the first fraction of a second. The neuroscientists who study concussion call this the primary injury, and it is, in one review’s words, “the direct mechanical damage”, which “cannot be therapeutically influenced” <d-cite key="werner2007"></d-cite>. By the time anyone could treat it, it is over. What follows over the next hours, days and weeks is the secondary injury, and that is where medicine has tried to intervene. The textbook chapter on epidemiology puts it bluntly: “there is no effective treatment to reverse the effects of the primary brain injury sustained, and treatment is aimed at minimising the secondary brain injury that can occur due to the effects of ischaemia, hypoxia and raised intracranial pressure” <d-cite key="critchley2020epi"></d-cite>.

Giza and Hovda pulled together decades of animal work into what they called the neurometabolic cascade of concussion <d-cite key="giza2001,giza2014"></d-cite>. It is worth walking through slowly, because it explains why a brain that looks fine can be, for a while, unusually fragile.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">The neurometabolic cascade, step by step</div>
  <div class="tbi1-cascade">
    <div>
      <svg id="tbi1-cell" viewBox="0 0 320 240" role="img" aria-label="A schematic nerve cell membrane with ions crossing it, an energy gauge and a mitochondrion, changing with time after injury"></svg>
    </div>
    <div>
      <div class="tbi1-stage-when" id="tbi1-stage-when">Before the injury</div>
      <h3 class="tbi1-stage-title" id="tbi1-stage-title">A cell at rest</h3>
      <p class="tbi1-stage-text" id="tbi1-stage-text" aria-live="polite"></p>
      <div class="tbi1-stage-dots" role="group" aria-label="Jump to a stage" id="tbi1-stage-btns"></div>
    </div>
  </div>
  <svg id="tbi1-curve" viewBox="0 0 640 150" role="img" aria-label="Schematic of glucose use after injury: a sharp rise in the first minutes and hours, then a long dip below normal lasting days, then a return toward normal"></svg>
  <div class="tbi1-scrub">
    <button class="tbi-btn" type="button" id="tbi1-cascade-play">Play</button>
    <input type="range" id="tbi1-cascade-t" min="0" max="1000" value="0" aria-label="Time after injury, on a logarithmic scale" />
    <span class="tbi1-time" id="tbi1-cascade-time">Before the injury</span>
  </div>
  <figcaption>A schematic after Giza and Hovda <d-cite key="giza2001,giza2014"></d-cite>. The sequence and the timescales (seconds to minutes for the ion shifts, minutes to hours for the burst of glucose use, up to 7 to 10 days of depressed metabolism in adult animals, days to weeks for the mitochondrial and axonal changes) are theirs and come mostly from rodent studies; the shape of the curve is illustrative, not data. Time runs on a logarithmic scale, so each step to the right is a longer stretch than the last. Drag the slider, press Play, or jump to a stage.</figcaption>
</figure>

The sequence, roughly, is this. The mechanical stretch pokes holes in cell membranes, so that potassium floods out of nerve cells and sodium and calcium flood in, and the cells release glutamate, a signalling chemical, “hyperacute” and “indiscriminate” <d-cite key="giza2014"></d-cite>. Every cell then tries to pump the ions back where they belong, and the pumps run on energy, so “ATP-requiring membrane ionic pumps shift into overdrive, causing hyperglycolysis” (a burst of glucose burning) and a “relative depletion of intracellular energy reserves” <d-cite key="giza2014"></d-cite>. The calcium that got in is mopped up by mitochondria, the cell’s power stations, which impairs them. After the burst comes a long slump: glucose metabolism falls into “a state of impaired metabolism that can last up to 7-10 days in adult animals” <d-cite key="giza2014"></d-cite>. Calcium inside axons also collapses their internal scaffolding, which links the cascade back to the axon figure above.

There is a practical consequence that I think everyone who plays a contact sport should know about. During that slump the brain is more vulnerable to a second injury. Clinically the window of greatest vulnerability looks like the first ten days, and in animal models two injuries three to five days apart did more damage than two injuries seven days apart <d-cite key="giza2014"></d-cite>. Inflammation adds another layer over the following days and weeks, and it has been linked to later neurodegeneration <d-cite key="simon2017neuroinflam"></d-cite>.

## Why there is no drug

If the secondary injury unfolds over days, you would think it should be possible to interrupt it. People have been trying for a long time. The abstract of our _BMC Neurology_ paper says it flatly: “no drug exists to prevent the spread of secondary injuries after a primary impact” <d-cite key="mehta2025bmc"></d-cite>. That sentence is backed by an unusual amount of failure.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">Four decades of trials</div>
  <div class="tbi1-trials">
    <div>
      <div class="tbi1-canvas-wrap"><canvas id="tbi1-rct" role="img" aria-label="392 dots, one per comparison in 191 randomised trials of acute TBI care; 74 per cent of them, about 290, are marked as showing no significant difference"></canvas></div>
      <div class="tbi-controls">
        <button class="tbi-btn" type="button" id="tbi1-rct-btn" aria-pressed="false">Mark the comparisons with no difference</button>
      </div>
      <p class="tbi1-stage-text" id="tbi1-rct-read" aria-live="polite">392 comparisons from 191 completed randomised trials of acute care for moderate and severe TBI <d-cite key="bragge2016"></d-cite>.</p>
    </div>
    <div class="tbi1-trial-cards" id="tbi1-trial-cards">
      <div class="tbi-panel tbi1-trial">
        <h3>Corticosteroids (CRASH)</h3>
        <p>10,008 adults. Death within two weeks:</p>
        <div class="tbi1-pair"><span>Steroid</span><div class="tbi1-pair-track"><div class="tbi1-pair-fill is-drug" data-v="21.1"></div></div><span class="tbi1-pair-val">21.1%</span></div>
        <div class="tbi1-pair"><span>Placebo</span><div class="tbi1-pair-track"><div class="tbi1-pair-fill" data-v="17.9"></div></div><span class="tbi1-pair-val">17.9%</span></div>
      </div>
      <div class="tbi-panel tbi1-trial">
        <h3>Progesterone (SyNAPSe)</h3>
        <p>1,195 people with severe TBI. Favourable outcome:</p>
        <div class="tbi1-pair"><span>Progesterone</span><div class="tbi1-pair-track"><div class="tbi1-pair-fill is-drug" data-v="50.4"></div></div><span class="tbi1-pair-val">50.4%</span></div>
        <div class="tbi1-pair"><span>Placebo</span><div class="tbi1-pair-track"><div class="tbi1-pair-fill" data-v="50.5"></div></div><span class="tbi1-pair-val">50.5%</span></div>
      </div>
      <div class="tbi-panel tbi1-trial">
        <h3>Tranexamic acid (CRASH-3)</h3>
        <p>An anti-bleeding drug, not a neuroprotective one. Risk of head-injury death relative to placebo, if given within 3 hours:</p>
        <div class="tbi1-pair"><span>Mild–moderate</span><div class="tbi1-pair-track"><div class="tbi1-pair-fill is-drug" data-v="78"></div></div><span class="tbi1-pair-val">0.78</span></div>
        <div class="tbi1-pair"><span>Severe</span><div class="tbi1-pair-track"><div class="tbi1-pair-fill is-drug" data-v="99"></div></div><span class="tbi1-pair-val">0.99</span></div>
      </div>
    </div>
  </div>
  <figcaption>Data. Left: the 392 comparisons in 191 completed randomised trials of acute care for moderate and severe TBI, of which 74% found no significant difference between groups <d-cite key="bragge2016"></d-cite> (74% of 392 is about 290; the arrangement of the dots is arbitrary). Right: CRASH <d-cite key="crash2004"></d-cite>, SyNAPSe <d-cite key="skolnick2014synapse"></d-cite> and CRASH-3 <d-cite key="crash3"></d-cite>; for CRASH-3 the bars are relative risks, where 1.00 would mean no effect.</figcaption>
</figure>

A review of the field in 2010 counted 33 large phase III trials in TBI between 1980 and 2009, and said that their “disappointing results ... have led to a critical reappraisal of clinical trial methodology” <d-cite key="maas2010trials"></d-cite>. Steroids, which reduce swelling elsewhere in the body, made things worse: in the CRASH trial of more than ten thousand adults, more people died within two weeks on steroids than on placebo <d-cite key="crash2004"></d-cite>. Progesterone failed in two large trials. ProTECT III was stopped for futility after 882 of a planned 1,140 patients <d-cite key="wright2014protect"></d-cite>, and in SyNAPSe the progesterone and placebo groups had favourable outcomes 50.4% and 50.5% of the time <d-cite key="skolnick2014synapse"></d-cite>. Donald Stein, who had championed progesterone, wrote afterwards that “a 100% failure rate continues to plague the field of TBI trials” <d-cite key="stein2015embracing"></d-cite>. A systematic review of 191 completed trials of acute care concluded that “considerable investment of resources ... has resulted in very little translatable evidence” <d-cite key="bragge2016"></d-cite>. Anti-inflammatory drugs have also failed in trials <d-cite key="simon2017neuroinflam"></d-cite>, and Dr Sudhakar’s own review of drugs that act on the brain’s main inhibitory signalling system found that in animal models they “fail to produce any neuroprotection after a primary impact to the brain” and can be harmful <d-cite key="sudhakar2023gaba"></d-cite>.

I should be precise about the claim, because it is easy to overstate. There are treatments that help people with TBI: neurosurgery, intensive care that keeps oxygen and blood pressure up and pressure inside the skull down, and rehabilitation. And one drug did reduce deaths in a large trial. Tranexamic acid, which stops bleeding rather than protecting nerve cells, reduced head-injury deaths in people with mild to moderate TBI when given within three hours, though not in severe TBI <d-cite key="crash3"></d-cite>. What has not worked, so far, is a drug that protects the brain’s cells from the secondary cascade itself. Why is a question the field argues about, and I am not in a position to settle it. Many of the explanations offered come back to the same thing, though, which is that TBI is not one disease: the mix of bruising, bleeding, axonal damage and swelling differs from one person to the next, and so does what comes after. Which brings me to how we decide who has a mild injury and who has a severe one.

## Counting consciousness

The most widely used measure of how badly a brain is injured is the Glasgow Coma Scale, published by Graham Teasdale and Bryan Jennett in 1974 <d-cite key="teasdale1974,teasdale1976"></d-cite>. It asks three questions of a person who may not be able to answer you, and scores each: how readily do their eyes open, how well can they talk, and how well can they move on command. The three scores add up to a total between 3 and 15. My project, and both of the papers, used the total score recorded at admission to sort people into mild (13 to 15), moderate (9 to 12) and severe (3 to 8) <d-cite key="mehta2023thesis,sudhakar2023frontiers,mehta2025bmc"></d-cite>. Try it.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">The Glasgow Coma Scale</div>
  <div class="tbi1-gcs" id="tbi1-gcs"></div>
  <div class="tbi1-gcs-out">
    <div class="tbi1-gcs-total" id="tbi1-gcs-total" aria-hidden="true">15</div>
    <div>
      <div class="tbi-readout" id="tbi1-gcs-read" aria-live="polite"></div>
      <div class="tbi1-scale" id="tbi1-gcs-scale" aria-hidden="true"></div>
    </div>
  </div>
  <figcaption>The scale’s components with the current official wording <d-cite key="gcs_website"></d-cite>, and the severity bands used in my thesis and both papers <d-cite key="mehta2023thesis,sudhakar2023frontiers,mehta2025bmc"></d-cite>. Choose a response in each column with a click, tap or the keyboard (arrow keys move within a column). “Not testable” covers, for example, a person who cannot speak because a breathing tube is in place; the official guidance is then not to report a total <d-cite key="gcs_website"></d-cite>.</figcaption>
</figure>

Play with it for a minute and something odd shows up. A person who opens their eyes only when spoken to, is confused, and obeys commands scores 3 + 4 + 6 = 13: mild. A person who opens their eyes spontaneously, is orientated, but can only localise to pressure instead of obeying scores 4 + 5 + 5 = 14: also mild, and milder. Very different people can land on the same total. Teasdale himself, revisiting the scale forty years on, wrote that “individual patients are best described by the three components of the coma scale; whereas the derived total coma score should be used to characterise groups”, and that predicting outcome needs other information as well <d-cite key="teasdale2014"></d-cite>. That is a caveat that applies to my own work, which sorted people by a single total taken at admission.

## Mild is not minor

Here is the part of the story that I most want readers to take away. “Mild” in “mild TBI” describes the score in the first hours, not the consequences. The textbook chapter on mild injury says that “for a sizeable minority of patients diagnosed with mTBI, the term can seem a cruel misnomer”, and that although most people’s symptoms (fatigue, irritability, poor concentration, headache, dizziness, sensitivity to noise and light, depression and anxiety) subside within three months, “in up to 30% of patients with mTBI, they can persist well beyond 6 months” <d-cite key="kehoe2020mild"></d-cite>.

Large studies since then have found it to be worse than that. TRACK-TBI followed 1,154 people with mild TBI from eleven US trauma centres, alongside 299 people with orthopaedic injuries (a broken leg, say) as a comparison <d-cite key="nelson2019jamaneurol"></d-cite>. The outcome measure is the Glasgow Outcome Scale–Extended, whose top score (8) means a full return to the life a person had before; anything below 8 means some injury-related limitation, at work, at home or socially.

<figure class="tbi-fig l-body-outset">
  <div class="tbi-kicker">Out of every hundred people, how many had not fully recovered?</div>
  <div class="tbi1-chips" role="group" aria-label="Choose a group" id="tbi1-waffle-btns"></div>
  <div class="tbi1-waffle-wrap">
    <div class="tbi1-waffle" id="tbi1-waffle" role="img" aria-label="A grid of 100 dots"></div>
    <div>
      <div class="tbi1-waffle-num" id="tbi1-waffle-num" aria-hidden="true">0</div>
      <p class="tbi1-stage-text" id="tbi1-waffle-read" aria-live="polite"></p>
    </div>
  </div>
  <figcaption>Data, drawn as 100 dots. Shares with a Glasgow Outcome Scale–Extended score below 8 (incomplete recovery). TRACK-TBI, mild TBI at 2 weeks and 12 months, and orthopaedic controls at 12 months <d-cite key="nelson2019jamaneurol"></d-cite>; CENTER-TBI at 6 months, all severities, by where people were first treated <d-cite key="steyerberg2019centertbi"></d-cite>. Rounded to whole people. Choose a group.</figcaption>
</figure>

At two weeks, 87% of the people with mild TBI in TRACK-TBI reported some functional limitation. At twelve months it was still 53%, against 38% of the orthopaedic patients, and the authors concluded that “most patients with mTBI presenting to US level I trauma centers report persistent, injury-related life difficulties at 1 year postinjury” <d-cite key="nelson2019jamaneurol"></d-cite>. That comparison group matters, because it answers the obvious objection: being injured badly enough to go to a trauma centre is disruptive whatever the injury, and some of that 53% would be there for reasons unrelated to the brain. The excess over the orthopaedic group is the part that is harder to explain away. The same study found that at three and six months about a fifth of the mild TBI group had probable post-traumatic stress disorder or major depression, against roughly a tenth of the orthopaedic group <d-cite key="stein2019jamapsych"></d-cite>. In Europe, CENTER-TBI found that 30% of people sent home from the emergency department had not fully recovered at six months <d-cite key="steyerberg2019centertbi"></d-cite>, and the Commission summarises the European and American studies together as showing that “the persisting effects of mild TBI are common and well outside the conventional perception of mild” <d-cite key="maas2022lancet"></d-cite>.

Those are the people most likely to be told they are fine and sent home, and the Commission’s report notes how little follows: in CENTER-TBI only 26% were given written information and 6% a follow-up appointment, and 90% of centres do not routinely schedule follow-up after discharge from the emergency department <d-cite key="maas2022lancet"></d-cite>. The papers my project produced quote an old description of mild TBI as a “silent epidemic”, “because the sign and symptoms of the injury don't usually manifest immediately leading to difficulties in diagnosis” <d-cite key="sudhakar2023frontiers"></d-cite>. The other side of the blunt labels is worth stating too: in TRACK-TBI, by twelve months 52.4% of people with severe TBI and 75% of those with moderate TBI had a favourable outcome <d-cite key="mccrea2021jamaneurol"></d-cite>. Severity at admission is a starting point, in both directions.

## A process, not an event

In 2010 Brent Masel and Douglas DeWitt published a paper whose title is the argument: “Traumatic brain injury: a disease process, not an event” <d-cite key="masel2010"></d-cite>. They argued that TBI “is a chronic disease process, one that fits the World Health Organization definition”, that it “increases long-term mortality and reduces life expectancy”, and that it is associated with seizures, sleep disorders, neurodegenerative diseases, hormonal problems and psychiatric illness, as well as conditions well outside the brain such as metabolic dysregulation. They were careful to add that their “intent is not to discourage patients with TBI or their families and caregivers, but rather to emphasize that TBI should be managed as a chronic disease” <d-cite key="masel2010"></d-cite>. Corrigan and Hammond made the same case from rehabilitation, describing brain injuries as “dynamic conditions that continue to change years after onset” <d-cite key="corrigan2013"></d-cite>, and a _Lancet Neurology_ review found that outcomes can improve or worsen “up to two decades after injury” <d-cite key="wilson2017lancetneurol"></d-cite>. Between one and five years after injury, according to the Commission, “decline occurs as frequently as improvement” <d-cite key="maas2022lancet"></d-cite>.

The figure below lays some of the evidence along a timeline. It is not one person’s story (I have not invented a patient), and the studies do not all look at the same people, but together they give a sense of how long the tail is.

<figure class="tbi-fig l-body-outset tbi1-timeline">
  <div class="tbi-kicker">What the studies find, and when</div>
  <svg id="tbi1-tl" viewBox="0 0 640 330" role="group" aria-label="A timeline from the day of injury to twenty years after, with findings from studies marked along it and the conditions they concern gathering above"></svg>
  <div class="tbi1-scrub">
    <button class="tbi-btn" type="button" id="tbi1-tl-play">Play</button>
    <input type="range" id="tbi1-tl-t" min="0" max="1000" value="0" aria-label="Time after injury" />
    <span class="tbi1-time" id="tbi1-tl-time">The day of injury</span>
  </div>
  <div class="tbi1-readout tbi-readout" id="tbi1-tl-read" aria-live="polite"></div>
  <figcaption>Data from several studies, placed at the time point each one reports; the time axis is logarithmic. Ratios (HR, hazard ratio; IRR, incidence rate ratio) are relative risks compared with people without TBI or, for TRACK-TBI, with orthopaedic patients: a hazard ratio of 2.5 means about two and a half times the risk, not 2.5% of people. Sources: TRACK-TBI <d-cite key="nelson2019jamaneurol,stein2019jamapsych"></d-cite>; Danish national cohorts <d-cite key="fann2018lancetpsych,madsen2018suicide"></d-cite>; a US health-system cohort followed for up to ten years <d-cite key="izzy2022"></d-cite>; the TBIMS mild-TBI study I worked on <d-cite key="sudhakar2023frontiers"></d-cite>; and TBIMS mortality <d-cite key="harrisonfelix2015"></d-cite>. The circles above the axis are the conditions named so far, coloured by organ system. Drag the slider, press Play, or tab to a marker.</figcaption>
</figure>

A few of these deserve a sentence each. In a study of 2.79 million Danes, people with any TBI had about 1.24 times the risk of dementia of people without one, rising with the number of injuries, and the excess was largest in the first six months <d-cite key="fann2018lancetpsych"></d-cite>. In 7.4 million Danes, the suicide rate was about twice as high after TBI, and still about 1.8 times as high after mild TBI alone <d-cite key="madsen2018suicide"></d-cite>. And in a US study that matched 4,351 people with mild TBI to 4,351 unexposed people and followed them for up to ten years, mild TBI was associated with about 2.5 times the risk of developing high blood pressure, 1.9 times the risk of diabetes and 2.2 times the risk of stroke, with new conditions appearing at a median of three and a half years after injury <d-cite key="izzy2022"></d-cite>. In people aged 18 to 40 with mild TBI, the hazard ratio for high blood pressure was 5.9. The authors called for “a targeted screening program for multisystem diseases after TBI” <d-cite key="izzy2022"></d-cite>. For the people in the US database I used, who had more severe injuries on average, life expectancy was about nine years shorter than for comparable people in the general population <d-cite key="harrisonfelix2015"></d-cite>.

Some of these associations will be causal and some will not. People who fall over are not a random sample of people, and neither are people who crash motorbikes; conditions that were already there can make an injury more likely, and the same habits or circumstances can raise the risk of both. Most of these studies adjust for what they can, and none of them can adjust for everything. I come back to this in Part 3, because it applies just as much to my own work.

## Tangles

This is where my project begins. The first paper that came out of it asked a simple question of the TBI Model Systems (TBIMS) database, which is the largest longitudinal TBI dataset in the world and has followed some participants for 35 years <d-cite key="tbims2020infosheet,msktc2023brochure"></d-cite>: five years after a mild TBI, how many people have been diagnosed with each of 26 medical and psychiatric conditions since their injury <d-cite key="sudhakar2023frontiers"></d-cite>? Of the 10,564 people in the database whose admission GCS was recorded, 4,915 (46.5%) had a score in the mild range. A caveat that runs through the whole series is that these are not typical concussions. Everyone in TBIMS was admitted for inpatient rehabilitation, which fewer than one in ten hospitalised TBI patients receives <d-cite key="tbims_lifelong"></d-cite>, and the mild cases there were “typically characterized by the presence of intracranial pathology and/or PTA” (post-traumatic amnesia, a stretch of time after the injury the person cannot remember) <d-cite key="sudhakar2023frontiers"></d-cite>. Only 223 to 228 of them answered the questions about other conditions at the five-year follow-up.

<figure class="tbi-fig l-body-outset tbi1-links" data-src="{{ '/assets/data/tbi/part1/top10-links.json' | relative_url }}">
  <div class="tbi-kicker">Five years after a mild TBI: the ten most common new conditions</div>
  <svg id="tbi1-links" viewBox="0 0 640 400" role="group" aria-label="Ten conditions drawn as circles sized by how common they were five years after a mild TBI"></svg>
  <div class="tbi-controls">
    <button class="tbi-btn" type="button" id="tbi1-links-btn" aria-pressed="false">Draw the links the data support</button>
    <span class="tbi-readout" id="tbi1-links-read" aria-live="polite"></span>
  </div>
  <div class="tbi-legend">
    <span><span class="tbi-swatch" style="background: var(--tbi-psych)"></span>Psychiatric</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-cardio)"></span>Cardiovascular</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-musc)"></span>Musculoskeletal and pain</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-neuro)"></span>Neurologic</span>
    <span><span class="tbi-swatch" style="background: var(--tbi-other)"></span>Ophthalmologic</span>
  </div>
  <figcaption>Data. Circle areas are the share of mild-TBI subjects in TBIMS with each condition diagnosed at the time of or after the injury, at the five-year follow-up (Table 2 of Sudhakar et al. 2023) <d-cite key="sudhakar2023frontiers"></d-cite>. The links are the statistically significant associations between these ten conditions in the network from Mehta and Sudhakar 2025 <d-cite key="mehta2025bmc"></d-cite>, recomputed from the TBIMS public-use data; thicker lines mean stronger association. How those links are found is the subject of Part 3. Hover over, tap or tab to a condition.</figcaption>
</figure>

Anxiety (16.1%), depression (15.7%), chronic pain (15.7%), high blood pressure (14.0%) and post-traumatic stress disorder (11.2%) top the list <d-cite key="sudhakar2023frontiers"></d-cite>. The younger people (50 or under at the follow-up) had more depression than the older ones, and the older ones more high blood pressure, high cholesterol, cataracts and osteoarthritis, which is roughly what you would expect from age alone; post-traumatic stress disorder was more common in women. The paper concluded that “individuals who have sustained mild TBI could develop serious long-term medical and psychiatric comorbidities which could affect their pace of recovery” <d-cite key="sudhakar2023frontiers"></d-cite>, and it said nothing about cause, deliberately.

A list of percentages, though, treats each condition as if it lived alone, and people do not have conditions one at a time. Someone with depression after a brain injury is also more likely to have anxiety, panic attacks and trouble sleeping, and the press of a button above shows that those overlaps are not small. Once you start drawing the lines, the list turns into a tangle, and the question my capstone was really about is how you see the structure of a tangle like that. Which conditions sit at the centre, which ones bridge otherwise separate groups, and does the shape of the tangle change with age? Could a condition that is rare be important because of where it sits, rather than how often it occurs? And if it could, what would a doctor do differently with that knowledge?

Answering those questions needs a way of thinking about connections that most people (and I, at the start of the project) have never been taught. That is what Part 2 is for.

<nav class="tbi-series" aria-label="Series">
  <a href="{{ '/blog/2026/tbi-part-1-the-quiet-injury/' | relative_url }}" class="is-current" aria-current="page"><span class="tbi-series-num">Part 1</span><span class="tbi-series-title">The quiet injury</span></a>
  <a href="{{ '/blog/2026/tbi-part-2-thinking-in-graphs/' | relative_url }}"><span class="tbi-series-num">Part 2</span><span class="tbi-series-title">Thinking in graphs</span></a>
  <a href="{{ '/blog/2026/tbi-part-3-a-map-of-what-comes-after/' | relative_url }}"><span class="tbi-series-num">Part 3</span><span class="tbi-series-title">A map of what comes after</span></a>
</nav>

<p class="tbi-caption" id="tbi1-brain-credits">About the 3D brain: the cortex is FreeSurfer’s fsaverage surface (Fischl et al. 1999), parcellated with the Destrieux atlas (Destrieux et al. 2010); deep structures come from the Harvard-Oxford and Juelich atlases in MNI152 space, processed with nilearn (Abraham et al. 2014). The skull and fibre bundles are derived or stylised, and the mechanics are a toy model. Sources and build steps are in the repository’s <code>assets/data/tbi/README.md</code>.</p>

<script src="{{ '/assets/js/posts/tbi-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/posts/tbi-part1.js' | relative_url }}"></script>
<script type="module" src="{{ '/assets/js/posts/tbi-brain.js' | relative_url }}"></script>
