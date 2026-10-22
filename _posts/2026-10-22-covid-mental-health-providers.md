---
layout: distill
title: "Bread, butter and a WhatsApp prescription"
description: How one community mental health organisation in Chennai kept care going through the 2020 lockdown. A visual walk through my first research paper, published in the Journal of Public Health.
tags: public-health mental-health covid-19 qualitative-research
categories: research
giscus_comments: false
related_posts: false
date: 2026-10-22
featured: true

authors:
  - name: Kaustav Mehta
    url: "https://kaustavmehta.github.io"
    affiliations:
      name: Krea University

bibliography: 2026-10-22-covid-mental-health-providers.bib

toc:
  - name: The view from outside
  - name: One organisation, many services
  - name: What broke
  - name: What they built instead
  - name: Relationships, responsiveness, resilience
  - name: What this study cannot tell us
  - name: Coming back to it

_styles: >
  .mh-fig { margin: 2rem 0 2.5rem; }
  .mh-fig figcaption, .mh-caption { font-size: 0.8rem; line-height: 1.5; color: var(--global-text-color-light); margin-top: 0.75rem; }
  .mh-kicker { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--global-text-color-light); margin-bottom: 0.4rem; font-weight: 600; }
  .mh-lede { font-family: Georgia, "Times New Roman", serif; font-size: 1.45rem; line-height: 1.45; color: var(--global-text-color); border: none; margin: 1.5rem 0 0.5rem; padding: 0; }
  .mh-lede .mh-attrib { display: block; font-family: inherit; font-size: 0.85rem; margin-top: 0.75rem; color: var(--global-text-color-light); font-style: normal; }
  .mh-pull { font-family: Georgia, "Times New Roman", serif; font-size: 1.35rem; line-height: 1.45; border-left: 3px solid var(--global-theme-color); padding: 0.25rem 0 0.25rem 1.25rem; margin: 2rem 0; color: var(--global-text-color); }
  .mh-pull cite { display: block; font-size: 0.8rem; font-style: normal; color: var(--global-text-color-light); margin-top: 0.6rem; font-family: inherit; }
  .mh-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .mh-reveal.is-visible { opacity: 1; transform: none; }
  .mh-waffle-wrap { position: relative; }
  .mh-waffle-wrap canvas { width: 100%; display: block; }
  .mh-waffle-legend { display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: 0.8rem; color: var(--global-text-color-light); margin-top: 0.6rem; align-items: center; }
  .mh-swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 0.4rem; vertical-align: middle; }
  .mh-btn { font: inherit; font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 999px; border: 1px solid var(--global-divider-color); background: transparent; color: var(--global-text-color); cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s; }
  .mh-btn:hover, .mh-btn:focus-visible { border-color: var(--global-theme-color); color: var(--global-theme-color); outline: none; }
  .mh-btn[aria-pressed="true"] { background: var(--global-theme-color); border-color: var(--global-theme-color); color: var(--global-bg-color); }
  .mh-stat { display: flex; align-items: baseline; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .mh-stat-num { font-family: Georgia, "Times New Roman", serif; font-size: 3.5rem; line-height: 1; color: var(--global-theme-color); font-variant-numeric: tabular-nums; }
  .mh-stat-label { font-size: 0.95rem; color: var(--global-text-color); max-width: 26rem; line-height: 1.4; }
  .mh-bars { display: grid; grid-template-columns: minmax(8rem, 15rem) 1fr; gap: 0.45rem 0.9rem; align-items: center; }
  .mh-bar-label { font-size: 0.8rem; color: var(--global-text-color); text-align: right; line-height: 1.25; }
  .mh-bar-track { position: relative; height: 18px; border-radius: 0 4px 4px 0; cursor: default; }
  .mh-bar-fill { height: 100%; width: 0; border-radius: 0 4px 4px 0; background: var(--global-text-color-light); opacity: 0.35; transition: width 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s; }
  .mh-bar-fill.is-key { background: var(--global-theme-color); opacity: 1; }
  .mh-bar-track:hover .mh-bar-fill { opacity: 0.85; }
  .mh-bar-val { position: absolute; top: 0; left: 0; height: 100%; display: flex; align-items: center; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: var(--global-text-color); padding-left: 0.4rem; transition: left 1.1s cubic-bezier(0.2, 0.8, 0.2, 1); white-space: nowrap; }
  .mh-tooltip { position: fixed; z-index: 1000; pointer-events: none; max-width: 18rem; padding: 0.55rem 0.75rem; border-radius: 6px; background: var(--global-card-bg-color, var(--global-bg-color)); border: 1px solid var(--global-divider-color); color: var(--global-text-color); font-size: 0.78rem; line-height: 1.45; box-shadow: 0 4px 16px rgba(0,0,0,0.12); opacity: 0; transition: opacity 0.15s; }
  .mh-tooltip.is-on { opacity: 1; }
  .mh-timeline { position: relative; margin: 1rem 0 0; padding-left: 1.6rem; border-left: 2px solid var(--global-divider-color); list-style: none; }
  .mh-timeline li { position: relative; margin: 0 0 1.3rem; }
  .mh-timeline li::before { content: ""; position: absolute; left: calc(-1.6rem - 6px); top: 0.3rem; width: 10px; height: 10px; border-radius: 50%; background: var(--global-bg-color); border: 2px solid var(--global-theme-color); }
  .mh-timeline li.is-study::before { background: var(--global-theme-color); }
  .mh-timeline .mh-date { font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--global-text-color-light); font-weight: 600; }
  .mh-timeline .mh-event { font-size: 0.92rem; color: var(--global-text-color); line-height: 1.45; }
  .mh-steps { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
  .mh-step-detail { min-height: 5.5rem; padding: 1rem 1.1rem; border-radius: 8px; border: 1px solid var(--global-divider-color); font-size: 0.9rem; line-height: 1.55; color: var(--global-text-color); }
  .mh-step-detail strong { color: var(--global-theme-color); }
  .mh-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.1rem; }
  .mh-quotes { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.9rem; }
  .mh-quote { padding: 1rem 1.1rem 0.9rem; border-radius: 8px; border: 1px solid var(--global-divider-color); background: var(--global-card-bg-color, transparent); transition: opacity 0.35s, transform 0.35s; }
  .mh-quote.is-hidden { display: none; }
  .mh-quote p { font-family: Georgia, "Times New Roman", serif; font-size: 1rem; line-height: 1.5; margin: 0 0 0.6rem; }
  .mh-quote .mh-who { font-size: 0.72rem; color: var(--global-text-color-light); line-height: 1.4; }
  .mh-quote .mh-theme { display: inline-block; font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--global-theme-color); margin-bottom: 0.5rem; font-weight: 600; }
  .mh-clocks { display: flex; flex-wrap: wrap; justify-content: center; gap: 2.5rem; align-items: flex-start; }
  .mh-clock { text-align: center; width: 11rem; }
  .mh-clock svg { width: 100%; height: auto; overflow: visible; }
  .mh-clock .mh-clock-label { font-size: 0.85rem; color: var(--global-text-color); margin-top: 0.3rem; line-height: 1.35; }
  .mh-clock .mh-clock-sub { font-size: 0.75rem; color: var(--global-text-color-light); }
  .mh-flow { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; align-items: stretch; margin-top: 1.5rem; }
  .mh-flow-step { flex: 1 1 9rem; max-width: 13rem; padding: 0.7rem 0.8rem; border-radius: 8px; border: 1px dashed var(--global-divider-color); font-size: 0.8rem; line-height: 1.45; color: var(--global-text-color); text-align: center; }
  .mh-flow-step.is-core { border-style: solid; border-color: var(--global-theme-color); }
  .mh-flow-arrow { align-self: center; color: var(--global-text-color-light); font-size: 1rem; }
  .mh-ledger { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .mh-ledger h4 { font-size: 0.75rem !important; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 2px solid var(--global-divider-color); }
  .mh-ledger .mh-gain h4 { border-bottom-color: var(--global-theme-color); }
  .mh-ledger ul { list-style: none; padding: 0; margin: 0; }
  .mh-ledger li { font-size: 0.88rem; line-height: 1.45; padding: 0.55rem 0; border-bottom: 1px solid var(--global-divider-color); }
  .mh-ledger li small { display: block; color: var(--global-text-color-light); font-size: 0.72rem; margin-top: 0.2rem; }
  .mh-venn { display: grid; grid-template-columns: minmax(14rem, 22rem) 1fr; gap: 1.5rem; align-items: center; }
  .mh-venn svg { width: 100%; height: auto; }
  .mh-venn circle { fill: var(--global-theme-color); fill-opacity: 0.12; stroke: var(--global-theme-color); stroke-width: 1.5; cursor: pointer; transition: fill-opacity 0.25s; }
  .mh-venn circle.is-active { fill-opacity: 0.38; }
  .mh-venn circle:focus-visible { outline: none; stroke-width: 3; }
  .mh-venn text { fill: var(--global-text-color); font-size: 13px; pointer-events: none; }
  .mh-venn text.mh-centre { font-size: 10px; fill: var(--global-text-color-light); }
  .mh-venn-panel h4 { margin: 0 0 0.5rem; font-size: 1.05rem !important; }
  .mh-venn-panel p { font-size: 0.9rem; line-height: 1.55; margin: 0 0 0.5rem; }
  @media (max-width: 640px) {
    .mh-lede { font-size: 1.2rem; }
    .mh-bars { grid-template-columns: 7.5rem 1fr; }
    .mh-ledger, .mh-venn { grid-template-columns: 1fr; }
    .mh-flow-arrow { transform: rotate(90deg); width: 100%; text-align: center; }
    .mh-flow-step { max-width: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mh-reveal { opacity: 1; transform: none; transition: none; }
    .mh-bar-fill, .mh-bar-val { transition: none; }
  }
---

<blockquote class="mh-lede">
“Of course, we cannot give bread and butter for all 6000 patients. But we gave provisions for about 300 of them through various sources.”
<span class="mh-attrib">A manager heading outreach at the Schizophrenia Research Foundation, Chennai, on the months after India's 2020 lockdown <d-cite key="nair2021covid"></d-cite></span>
</blockquote>

That sentence is from an interview with a service provider at the Schizophrenia Research Foundation (SCARF), a non-government organisation in Chennai that provides care for a range of mental disorders and runs outreach services for rural communities. It is an odd thing to hear from a mental health organisation, because food is not usually counted as part of mental health care. But the paper places it in a section on the burden of care at home, where the closure of the vocational centre and day-care came on top of job loss, pay cuts and rising debt for caregivers. In that situation the two could not really be separated, and the people interviewed did not try to separate them.

<figure class="mh-fig l-body-outset">
  <div class="mh-kicker">One dot, one patient</div>
  <div class="mh-waffle-wrap"><canvas id="mh-waffle" role="img" aria-label="A grid of 6000 dots, one per patient. 300 of them, about one in twenty, are highlighted to show those who received food provisions."></canvas></div>
  <div class="mh-waffle-legend">
    <span><span class="mh-swatch" style="background: var(--global-theme-color)"></span>Received provisions (about 300)</span>
    <span><span class="mh-swatch" style="background: var(--global-text-color-light); opacity: 0.35"></span>Rest of SCARF's patients (6000 in all)</span>
    <button class="mh-btn" id="mh-waffle-replay" type="button">Replay</button>
  </div>
  <figcaption>The scale the manager was describing. About one patient in twenty received food provisions, gathered “through various sources” while the organisation's usual services were shut or shrinking. Figures as reported by the interviewee <d-cite key="nair2021covid"></d-cite>.</figcaption>
</figure>

This post is about my first research paper, _The COVID-19 pandemic and its impact on mental health services: the provider perspective_, published in the _Journal of Public Health_ in October 2021 <d-cite key="nair2021covid"></d-cite>. It came out of a partnership between LEAD at Krea University and the University of Oxford, funded through the Global Challenges Research Fund's India–Oxford Initiative, and it asked a fairly simple question: when the country shut down, what happened to community mental health services, and how did the people providing them keep them running?

I should say up front what my part in it was. The interviews, the focus group and the thematic analysis were done by my co-authors. My part was the literature review, which meant reading what had been reported from a geographically and socio-economically spread set of countries and using it to place the Chennai data in a wider context. The journal format is tight, about six pages, and most of the participants' words had to be cut down to fragments. So, five years on, I wanted to write about it in a form where the quotes get more room and some of the numbers can be drawn out.

## The view from outside

By late 2020 it was already clear that mental health care had been hit hard almost everywhere. In October 2020 the World Health Organization published a survey of 130 countries <d-cite key="who2020survey"></d-cite>, and the headline figure was blunt.

<figure class="mh-fig l-body-outset">
  <div class="mh-stat">
    <span class="mh-stat-num" id="mh-who-headline" data-target="93">0%</span>
    <span class="mh-stat-label">of the 130 countries surveyed by the WHO reported that critical mental health services had been disrupted or halted.</span>
  </div>
  <div class="mh-kicker">Share of countries reporting disruption, by service</div>
  <div class="mh-bars" id="mh-who-bars"></div>
  <div class="mh-waffle-legend">
    <span><span class="mh-swatch" style="background: var(--global-theme-color)"></span>Services our interviewees talked about directly</span>
    <span><span class="mh-swatch" style="background: var(--global-text-color-light); opacity: 0.35"></span>Other services</span>
  </div>
  <figcaption>Percentages from the WHO's news release of 5 October 2020 <d-cite key="who2020survey"></d-cite>. Hover over a bar for the WHO's own wording. The same release reported that 70% of countries had adopted telemedicine or teletherapy, but that the split was uneven: more than 80% of high-income countries against less than 50% of low-income ones.</figcaption>
</figure>

The literature I was reading at the time came at the problem from several directions. From China there were accounts of psychiatric hospitals reorganising themselves around infection control <d-cite key="xiang2020covid,li2020challenges"></d-cite>. From the United States, descriptions of how psychiatric care had been reshaped in the first months <d-cite key="bojdani2020covid"></d-cite>. From the UK, a mixed-methods study of services for older adults <d-cite key="bhome2020impact"></d-cite>, and from a cross-continental group, lessons on managing psychiatric conditions during the pandemic <d-cite key="ojeahere2020management"></d-cite>. A piece in _The Lancet Psychiatry_ set out how mental health care should change as a consequence <d-cite key="moreno2020how"></d-cite>. In India, services were disrupted by the nationwide lockdown in March 2020, and the government released guidelines to move to telemedicine <d-cite key="mohfw2020telemedicine"></d-cite>. Tele-psychiatry had raised concerns about patient dynamics, proper diagnosis and legal issues <d-cite key="kumar2020community"></d-cite>, though it had worked in some contexts <d-cite key="grover2020state"></d-cite>.

What most of this work described was disruption: what stopped, what moved online, which systems were under strain. There was much less on how the organisations doing the care actually adapted, and that gap matters more in India than in many of the countries above, because mental health outreach to communities and vulnerable groups here was pioneered by NGOs, and their lessons have proved useful to the public mental health system <d-cite key="vanginneken2014development"></d-cite>. So the study went to the people who had kept care going, and asked them.

## One organisation, many services

SCARF is, in the paper's words, a training centre for psychiatry, psychology and psychiatric social work, and a training partner for public mental health services, as well as a provider <d-cite key="nair2021covid"></d-cite>. That breadth was useful: it meant one organisation could stand in for many kinds of service at once, from inpatient wards to rural outreach.

<figure class="mh-fig">
  <div class="mh-kicker">How the study was done</div>
  <div class="mh-steps" id="mh-steps" role="tablist" aria-label="Study steps"></div>
  <div class="mh-step-detail" id="mh-step-detail" role="tabpanel" aria-live="polite"></div>
  <figcaption>The design, step by step, as described in the paper's methods <d-cite key="nair2021covid"></d-cite>. Click through the steps.</figcaption>
</figure>

The people interviewed included managers of clinical services, administrative staff, psychiatrists, social workers, a psychologist and research staff, with between three and more than twenty years at the organisation. Their accounts covered the period from February to December 2020, and the fieldwork itself ran over December 2020 and January 2021.

<figure class="mh-fig">
  <div class="mh-kicker">The study against the pandemic's calendar</div>
  <ol class="mh-timeline" id="mh-timeline">
    <li class="mh-reveal"><div class="mh-date">February – December 2020</div><div class="mh-event">The period the interviews look back on.</div></li>
    <li class="mh-reveal"><div class="mh-date">Late March 2020</div><div class="mh-event">India's national lockdown begins, and the Ministry of Health and Family Welfare issues its Telemedicine Practice Guidelines <d-cite key="mohfw2020telemedicine"></d-cite>. At SCARF, in the paper’s account, “all services were affected” in the two weeks of complete lockdown, after which essential care services resumed.</div></li>
    <li class="mh-reveal"><div class="mh-date">5 October 2020</div><div class="mh-event">WHO publishes its 130-country survey of disrupted mental health services <d-cite key="who2020survey"></d-cite>.</div></li>
    <li class="mh-reveal is-study"><div class="mh-date">December 2020 – January 2021</div><div class="mh-event">In-depth interviews and a focus group discussion with SCARF's service providers.</div></li>
    <li class="mh-reveal is-study"><div class="mh-date">29 December 2020</div><div class="mh-event">Preliminary findings presented at <em>India Research Insights: The COVID-19 Impact</em>, a workshop hosted by LEAD and Krea University.</div></li>
    <li class="mh-reveal is-study"><div class="mh-date">26 January 2021</div><div class="mh-event">Manuscript received by the <em>Journal of Public Health</em>; accepted on 5 May 2021.</div></li>
    <li class="mh-reveal is-study"><div class="mh-date">8 October 2021</div><div class="mh-event">Published in a supplement of the journal <d-cite key="nair2021covid"></d-cite>.</div></li>
  </ol>
  <figcaption>Filled markers are milestones of the study itself.</figcaption>
</figure>

## What broke

The first thing to go was access. For two weeks of complete lockdown everything stopped, and even once essential services resumed, patients could not easily reach the centre. Not every neighbourhood pharmacy stocked psychiatric medication, and some pharmacists that did were reluctant to dispense it. In smaller towns, psychiatric care was taken over for COVID-19 treatment. Rural patients were stopped by the police and fined on their way to refill prescriptions at SCARF, even when they showed the prescription.

<blockquote class="mh-pull mh-reveal">
“These are people who can’t even afford medicines… it felt painful that we were helpless.”
<cite>A manager heading outreach efforts (P6)</cite>
</blockquote>

Missed medication meant relapses of conditions like schizophrenia and mood disorders, often needing in-patient care, at exactly the time the centre had stopped admissions for fear of spreading COVID-19 inside the facility. One of the psychiatrists recalled handling "at least ten DESPERATE requests for admissions" (the capitals are in the transcript). For patients who had been discharged and rehabilitated, the closure of the vocational centre took away a daily routine as well; the same psychiatrist described the "11 o clock tea" and the people they talked to, and said: "It was sad for them because this was their social life..."

The providers were affected as well. The paper has a section on their personal costs, which I think is easy to skim past and should not be. Work moved onto personal phones and into the time that used to belong to families. One counsellor, taking sessions from home, said that her children "would wonder why the person on the other end was crying so much".

<figure class="mh-fig l-body-outset">
  <div class="mh-kicker">In their words</div>
  <div class="mh-chips" id="mh-chips" role="group" aria-label="Filter quotes by theme"></div>
  <div class="mh-quotes" id="mh-quotes"></div>
  <figcaption>Excerpts from the interviews as quoted in the paper, grouped by theme, roughly following the sections of its results <d-cite key="nair2021covid"></d-cite>. Participant numbers and role descriptions are the paper’s own; where an excerpt is printed with only a number, the role is taken from that participant’s other quotes. Ellipses mark cuts, some in the original and some mine.</figcaption>
</figure>

## What they built instead

What I find most striking, reading the paper again, is how ordinary the adaptations were. Prescriptions were written on the official pad, signed, photographed and sent over WhatsApp, in line with the teleconsultation guidelines, and the consultants then spent time on the phone with pharmacists sorting out legibility, brand names and substitutes. A health worker tracked down the doctors of clients stuck in other districts and passed their prescriptions along.

A 24-hour helpline, advertised by the government, linked new and existing patients to consultants and therapists, and stretched everyone's working hours. In the in-patient centres, staff used their own phones to set up video calls with families, because many patients did not have smartphones. Even the paperwork needed a person: when staff or patients with cards and e-passes were stopped, the police would be handed a phone with an administrator on the other end. Much of the coordination itself happened in WhatsApp groups.

The clearest change in clinical practice was time. One psychiatrist described how a first consultation for a new patient, which used to take an hour, was now done in fifteen to twenty minutes.

<figure class="mh-fig">
  <div class="mh-chips" role="group" aria-label="Compare consultation times">
    <button class="mh-btn" type="button" data-clock="before" aria-pressed="true">Before COVID-19</button>
    <button class="mh-btn" type="button" data-clock="during" aria-pressed="false">During COVID-19</button>
  </div>
  <div class="mh-clocks">
    <div class="mh-clock">
      <svg viewBox="0 0 120 120" id="mh-clock" role="img" aria-label="Time spent in a first psychiatric consultation">
        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--global-divider-color)" stroke-width="12"></circle>
        <circle id="mh-clock-range" cx="60" cy="60" r="48" fill="none" stroke="var(--global-theme-color)" stroke-opacity="0.35" stroke-width="12" transform="rotate(-90 60 60)"></circle>
        <circle id="mh-clock-arc" cx="60" cy="60" r="48" fill="none" stroke="var(--global-theme-color)" stroke-width="12" transform="rotate(-90 60 60)"></circle>
        <text x="60" y="58" text-anchor="middle" id="mh-clock-text" style="font-size: 15px; fill: var(--global-text-color); font-family: Georgia, serif">60 min</text>
        <text x="60" y="76" text-anchor="middle" style="font-size: 8px; fill: var(--global-text-color-light)">new patient</text>
      </svg>
      <div class="mh-clock-label" id="mh-clock-label">The usual first psychiatric consultation</div>
    </div>
  </div>
  <div class="mh-flow" id="mh-flow" aria-hidden="false">
    <div class="mh-flow-step">Case details taken over the phone before the visit</div>
    <div class="mh-flow-arrow">→</div>
    <div class="mh-flow-step is-core">Shorter face-to-face consultation</div>
    <div class="mh-flow-arrow">→</div>
    <div class="mh-flow-step">Case worker calls back; notes are read by the consultant at the next visit</div>
  </div>
  <figcaption>The shortened consultation, and the work that moved around it, as described by a psychiatrist (P7) <d-cite key="nair2021covid"></d-cite>. The lighter segment of the ring marks the range of fifteen to twenty minutes.</figcaption>
</figure>

A natural reading of that number is that care got worse. I do not think the paper lets us say that, and I would be wary of saying it here. The time in the room shrank, but the work was redistributed: the history was taken over the phone before the visit, and a case worker followed up afterwards. Whether that amounted to a loss, a different kind of care, or in some cases a better use of a psychiatrist's hour is something interviews with providers alone cannot settle.

Telemedicine is where the trade-offs were clearest. The paper's abstract says it enabled an expansion of both the service and its clientele, as well as efficiency. It also changed what a therapy session was like, for both sides: some clients took phone sessions as "a friendly catch-up call rather than a teletherapy session".

<figure class="mh-fig l-body-outset">
  <div class="mh-ledger">
    <div class="mh-gain mh-reveal">
      <h4>What it opened up</h4>
      <ul>
        <li>Access to consultations, prescriptions and counselling for more clients, “in a shorter period of time and with less effort”<small>Discussion</small></li>
        <li>Sessions without travelling to the clinic, which “decreased the overall attrition”<small>Results</small></li>
        <li>Better compliance where family members became co-therapists; one patient was rehabilitated with the help of her 10-year-old child<small>Results</small></li>
      </ul>
    </div>
    <div class="mh-cost mh-reveal">
      <h4>What it cost</h4>
      <ul>
        <li>“Some think it is just a normal call.”<small>Researcher, trainer and case worker (P10)</small></li>
        <li>“When the husband is around, how can they talk about the husband to someone over [the] phone?”<small>Manager heading outreach (P6), on lack of privacy at home</small></li>
        <li>“Women in rural areas were not comfortable with gadgets.”<small>Manager heading outreach (P6)</small></li>
        <li>An additional burden on counsellors “to ensure that the client attended the calls”<small>Results</small></li>
      </ul>
    </div>
  </div>
  <figcaption>Gains and costs of tele-counselling as the paper reports them <d-cite key="nair2021covid"></d-cite>. The paper's own summary of the costs is “lack of privacy, casualization of the exchange between service provider and patient, and absence of the social connect”.</figcaption>
</figure>

The phrase "casualization" is the one I keep coming back to.<d-footnote>The abstract uses "casualization of therapy"; the discussion uses "casualization of the exchange between service provider and patient". I have used both, since they describe the same concern from slightly different angles.</d-footnote> A therapy session in a clinic has a frame around it: a room, a time, a journey to get there. Over the phone, that frame dissolves into the rest of the day, and some patients, reasonably enough, treated it like any other call. I doubt better connectivity would have fixed that.

## Relationships, responsiveness, resilience

When the paper pulls these threads together, it names "three crucial elements in continuity and quality service delivery: relationships, responsiveness and resilience" <d-cite key="nair2021covid"></d-cite>.

<figure class="mh-fig l-body-outset">
  <div class="mh-venn">
    <svg viewBox="0 0 300 280" id="mh-venn" role="group" aria-label="Three overlapping circles labelled relationships, responsiveness and resilience, with continuity of care at the centre">
      <circle cx="117" cy="108" r="74" data-r="relationships" tabindex="0" role="button" aria-label="Relationships"></circle>
      <circle cx="183" cy="108" r="74" data-r="responsiveness" tabindex="0" role="button" aria-label="Responsiveness"></circle>
      <circle cx="150" cy="166" r="74" data-r="resilience" tabindex="0" role="button" aria-label="Resilience"></circle>
      <text x="72" y="22" text-anchor="middle">Relationships</text>
      <text x="228" y="22" text-anchor="middle">Responsiveness</text>
      <text x="150" y="272" text-anchor="middle">Resilience</text>
      <text x="150" y="126" text-anchor="middle" class="mh-centre">continuity</text>
      <text x="150" y="138" text-anchor="middle" class="mh-centre">of care</text>
    </svg>
    <div class="mh-venn-panel" id="mh-venn-panel" aria-live="polite"></div>
  </div>
  <figcaption>The three elements named in the paper <d-cite key="nair2021covid"></d-cite>. The overlapping layout is my own sketch of how they relate, not a figure from the paper. Hover over or tap a circle.</figcaption>
</figure>

I think the useful thing about this framing is that none of the three is a technology or a policy. They are properties of an organisation that existed before the pandemic and were tested by it. The relationships had been built over many years, partly through educating patients and families, and the providers felt that psycho-education showed its value in how well patients kept to treatment. The resilience drew on lessons from earlier floods, a tsunami and cyclones, and on prior experience with tele-psychiatry. The WhatsApp prescription only works if the health worker already knows the patient's doctor, and provisions only reach 300 patients if somebody already knows who those patients are. In that sense SCARF is a single, fairly small test case of a broader question that the national-level surveys could not get at: what is it, inside an organisation, that lets care continue when the system around it stops?

## What this study cannot tell us

The paper is direct about its main limitation: "Though limited to a single NGO and to providers, insights from a variety of services within mental healthcare was gleaned" <d-cite key="nair2021covid"></d-cite>. Both halves of that sentence matter. One organisation in one city, however broad its services, is not Indian community mental health care as a whole. And the people we heard from were the people delivering care, not receiving it. We do not know how the shortened consultation felt from the patient's side, whether the phone sessions that providers worried were too casual felt that way to the people on the other end, or what the families who were not among the 300 made of the year.

It is also a retrospective account. The interviews were conducted at the end of 2020 about the months that came before, and what people remember of a crisis, and how they make sense of it afterwards, is not quite the same as what happened at the time. None of this undermines the findings, but it does bound them, and I would rather say so plainly than have the post read as a claim about more than it is.

## Coming back to it

The paper ends by arguing that these insights are crucial for planning resilient community-based mental health care, and the wider literature at the time was saying something similar: that the pandemic was an opportunity to reform mental health care in India <d-cite key="dandona2021covid"></d-cite>, and that health systems needed to be built with preparedness in mind <d-cite key="sundararaman2021pandemic"></d-cite>. The paper is specific about what that would mean: bringing care for people with mental illness into government and city disaster planning, including housing, transport and medication; sensitising the police and other enforcing authorities to their needs; training health workers for isolation, infection and relocation; and preparing patients and caregivers for how to manage care during a disaster.

Reading it again now, the questions I am left with are ones the study opened rather than answered. Which of these adaptations outlasted the pandemic? Did the phone intake before a consultation become routine, and if it did, did anyone check what it changed for patients? If relationships with communities were what made continuity possible, can that be planned for, or only maintained? And how would you even measure a relationship as a piece of health infrastructure, in a way that would make it visible to the people who fund and plan services? I do not have answers to these, and I suspect they need the patient and family perspective that this study did not have.

It was my first time seeing my name on a paper, and I am properly thankful to my co-authors, Sapna Nair, Preethi Kannan, Ananya Raju, John Mathew and Padmavati Ramachandran, for bringing me in, and to the providers at SCARF who gave their time to be interviewed at the end of a very hard year. The full paper is available from the [_Journal of Public Health_](https://doi.org/10.1093/pubmed/fdab163).

<div class="mh-tooltip" id="mh-tooltip" role="tooltip"></div>
<script src="{{ '/assets/js/posts/covid-mental-health-providers.js' | relative_url }}"></script>
