// Interactive figures for the post "Bread, butter and a WhatsApp prescription".
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tooltip = document.getElementById("mh-tooltip");

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const onVisible = (el, callback, threshold = 0.3) => {
    if (!el) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.disconnect();
          }
        });
      },
      { threshold }
    );
    observer.observe(el);
  };

  const showTooltip = (html, event) => {
    if (!tooltip) return;
    tooltip.innerHTML = html;
    tooltip.classList.add("is-on");
    moveTooltip(event);
  };

  const moveTooltip = (event) => {
    if (!tooltip) return;
    const pad = 14;
    const rect = tooltip.getBoundingClientRect();
    let x = event.clientX + pad;
    let y = event.clientY + pad;
    if (x + rect.width > window.innerWidth - 8) x = event.clientX - rect.width - pad;
    if (y + rect.height > window.innerHeight - 8) y = event.clientY - rect.height - pad;
    tooltip.style.left = `${Math.max(8, x)}px`;
    tooltip.style.top = `${Math.max(8, y)}px`;
  };

  const hideTooltip = () => tooltip && tooltip.classList.remove("is-on");

  // Scroll reveals
  document.querySelectorAll(".mh-reveal").forEach((el) => onVisible(el, () => el.classList.add("is-visible"), 0.2));

  // Waffle: 6000 patients, 300 received provisions
  const waffle = document.getElementById("mh-waffle");
  if (waffle) {
    const cols = 150;
    const rows = 40;
    const highlighted = 300;
    let progress = 0;
    let frame = null;

    const draw = () => {
      const width = waffle.clientWidth;
      const cell = width / cols;
      const height = cell * rows;
      const dpr = window.devicePixelRatio || 1;
      waffle.width = Math.round(width * dpr);
      waffle.height = Math.round(height * dpr);
      waffle.style.height = `${height}px`;
      const ctx = waffle.getContext("2d");
      ctx.scale(dpr, dpr);
      const gap = Math.max(0.6, cell * 0.18);
      const size = cell - gap;
      const accent = cssVar("--global-theme-color");
      const muted = cssVar("--global-text-color-light");
      // Phase 1 (0-0.6): all dots appear row by row. Phase 2 (0.6-1): the 300 light up.
      const shown = Math.floor(Math.min(1, progress / 0.6) * cols * rows);
      const lit = Math.floor(Math.max(0, (progress - 0.6) / 0.4) * highlighted);
      for (let i = 0; i < shown; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        ctx.globalAlpha = i < lit ? 1 : 0.3;
        ctx.fillStyle = i < lit ? accent : muted;
        ctx.fillRect(c * cell, r * cell, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const play = () => {
      cancelAnimationFrame(frame);
      if (reduceMotion) {
        progress = 1;
        draw();
        return;
      }
      const start = performance.now();
      const duration = 3200;
      const step = (now) => {
        progress = Math.min(1, (now - start) / duration);
        draw();
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    draw();
    onVisible(waffle, play, 0.4);
    document.getElementById("mh-waffle-replay")?.addEventListener("click", play);
    window.addEventListener("resize", draw);
    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    waffle.addEventListener("mousemove", (event) => {
      const rect = waffle.getBoundingClientRect();
      const cell = rect.width / cols;
      const c = Math.floor((event.clientX - rect.left) / cell);
      const r = Math.floor((event.clientY - rect.top) / cell);
      const index = r * cols + c + 1;
      if (index < 1 || index > cols * rows) return hideTooltip();
      const text =
        index <= highlighted
          ? `Patient ${index.toLocaleString()} of 6,000<br><strong>Among the ~300 who received provisions</strong>`
          : `Patient ${index.toLocaleString()} of 6,000`;
      showTooltip(text, event);
    });
    waffle.addEventListener("mouseleave", hideTooltip);
  }

  // WHO survey: headline counter and bars
  const headline = document.getElementById("mh-who-headline");
  if (headline) {
    const target = Number(headline.dataset.target);
    onVisible(headline, () => {
      if (reduceMotion) {
        headline.textContent = `${target}%`;
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1400);
        const eased = 1 - Math.pow(1 - t, 3);
        headline.textContent = `${Math.round(eased * target)}%`;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  const whoData = [
    {
      label: "School mental health services",
      value: 78,
      quote: "at least partial disruptions to school and workplace mental health services (78% and 75% respectively)",
    },
    {
      label: "Workplace mental health services",
      value: 75,
      quote: "at least partial disruptions to school and workplace mental health services (78% and 75% respectively)",
    },
    {
      label: "Services for children and adolescents",
      value: 72,
      quote: "disruptions to mental health services for vulnerable people, including children and adolescents (72%)",
    },
    { label: "Services for older adults", value: 70, quote: "older adults (70%)" },
    { label: "Counselling and psychotherapy", value: 67, key: true, quote: "67% saw disruptions to counseling and psychotherapy" },
    { label: "Critical harm reduction services", value: 65, quote: "65% to critical harm reduction services" },
    { label: "Antenatal or postnatal services for women", value: 61, quote: "women requiring antenatal or postnatal services (61%)" },
    { label: "Opioid agonist maintenance treatment", value: 45, quote: "45% to opioid agonist maintenance treatment for opioid dependence" },
    { label: "Emergency interventions", value: 35, key: true, quote: "More than a third (35%) reported disruptions to emergency interventions" },
    {
      label: "Access to medications",
      value: 30,
      key: true,
      quote: "30% reported disruptions to access for medications for mental, neurological and substance use disorders",
    },
  ];

  const bars = document.getElementById("mh-who-bars");
  if (bars) {
    const fills = [];
    whoData.forEach((d) => {
      const label = document.createElement("div");
      label.className = "mh-bar-label";
      label.textContent = d.label;
      const track = document.createElement("div");
      track.className = "mh-bar-track";
      track.setAttribute("aria-label", `${d.label}: ${d.value}% of countries`);
      track.setAttribute("role", "img");
      const fill = document.createElement("div");
      fill.className = `mh-bar-fill${d.key ? " is-key" : ""}`;
      const val = document.createElement("span");
      val.className = "mh-bar-val";
      val.textContent = `${d.value}%`;
      track.append(fill, val);
      track.addEventListener("mousemove", (event) => showTooltip(`<strong>${d.label}: ${d.value}%</strong><br>WHO: “${d.quote}”`, event));
      track.addEventListener("mouseleave", hideTooltip);
      bars.append(label, track);
      fills.push({ fill, val, value: d.value });
    });
    onVisible(bars, () =>
      fills.forEach(({ fill, val, value }, i) => {
        setTimeout(
          () => {
            fill.style.width = `${value}%`;
            val.style.left = `${value}%`;
          },
          reduceMotion ? 0 : i * 70
        );
      })
    );
  }

  // Methods stepper
  const steps = [
    {
      name: "Sample",
      text: "<strong>Purposive sampling.</strong> Ten service providers were selected for in-depth interviews, drawn from across outpatient and inpatient clinical services, residential services, community outreach, psychosocial rehabilitation (including family interventions), research and training. One interview could not be scheduled within the data collection period.",
    },
    {
      name: "Interview",
      text: "<strong>In-depth interviews.</strong> Each lasted 50 to 80 minutes, in English or Tamil, by telephone or video call, after oral consent. An interview guide covered three areas: the impact on services, how providers adapted, and their personal and professional learnings.",
    },
    {
      name: "Focus group",
      text: "<strong>Focus group discussion.</strong> Four of the interview respondents, chosen to represent management, clinical work, rehabilitation, and outreach and training, met as a group to gain shared insights and aid reflection.",
    },
    {
      name: "Code",
      text: "<strong>Coding.</strong> Recordings were transcribed and coded by one researcher using a codebook; a second researcher verified the coding.",
    },
    {
      name: "Check back",
      text: "<strong>Respondent review.</strong> Transcripts were shared with respondents so they could correct them.",
    },
    {
      name: "Analyse",
      text: "<strong>Thematic analysis</strong> in QDA Miner, starting from a broad set of a priori themes drawn from the research areas, with sub-themes allowed to emerge from the data. Ethics approval came from the IFMR Human Subjects Committee and SCARF's Ethics Committee.",
    },
  ];
  const stepBar = document.getElementById("mh-steps");
  const stepDetail = document.getElementById("mh-step-detail");
  if (stepBar && stepDetail) {
    const buttons = steps.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mh-btn";
      b.setAttribute("role", "tab");
      b.textContent = `${i + 1}. ${s.name}`;
      b.addEventListener("click", () => select(i));
      stepBar.append(b);
      return b;
    });
    const select = (i) => {
      buttons.forEach((b, j) => {
        b.setAttribute("aria-pressed", String(i === j));
        b.setAttribute("aria-selected", String(i === j));
      });
      stepDetail.innerHTML = steps[i].text;
    };
    select(0);
  }

  // Quote explorer
  const quotes = [
    {
      theme: "Access",
      text: "(Rural clients), get caught by the police who levied a penalty on them even if they said they were going to refill the medicines at SCARF, even if they showed the prescription. These are people who can’t even afford medicines… it felt painful that we were helpless.",
      who: "P6, male manager heading outreach efforts",
    },
    {
      theme: "Access",
      text: "We stopped admission for few months… I would have handled at least ten DESPERATE requests for admissions.",
      who: "P4, female psychiatrist",
    },
    {
      theme: "Access",
      text: "I had to talk to a pharmacist 2 weeks back, to honour a prescription that was already overdue… requesting them to give medicines for 1 week or 10 days.",
      who: "P4, female psychiatrist",
    },
    {
      theme: "Patients’ lives",
      text: "For them, talking to others, the 11 o clock tea, etc. are some routines they are so used to… It was sad for them because this was their social life...",
      who: "P4, female psychiatrist",
    },
    {
      theme: "Patients’ lives",
      text: "Of course, we cannot give bread and butter for all 6000 patients. But we gave provisions for about 300 of them through various sources.",
      who: "P6, male manager heading outreach efforts",
    },
    {
      theme: "Providers",
      text: "After 4.30 used to be ‘my time’. Now even at 10 p.m. I need to work… I am more addicted to checking my phone-every 3–5 min because I don’t want to miss anything...",
      who: "P5, middle-aged female administrative co-ordinator",
    },
    {
      theme: "Providers",
      text: "There was loss with respect to my privacy and my family time. My children were there; my parents were listening when I was on the phone. My children would wonder why the person on the other end was crying so much.",
      who: "P2, middle-aged female rehabilitation coordinator/counsellor",
    },
    {
      theme: "Adaptations",
      text: "Even if they had the cards/e-pass, police would still stop them and ask why they were going out… they would call me and hand over the phone to the police.",
      who: "P5, middle-aged female administrative co-ordinator",
    },
    {
      theme: "Adaptations",
      text: "Some of the clients who had travelled to other districts and got stuck there… I contacted their doctor on their behalf and passed on the prescription over WhatsApp.",
      who: "P3, middle-aged female health worker",
    },
    {
      theme: "Adaptations",
      text: "We usually used to take 1 h for a new patient for psychiatric consultation. In view of COVID-19, we addressed them in 15–20 min.",
      who: "P7, female psychiatrist",
    },
    {
      theme: "Telemedicine",
      text: "Some think it is just a normal call. If I ask why they didn’t call they’ll say that they thought we called just to ask ‘How are you doing? Are you taking medicine’…",
      who: "P10, female researcher/trainer/case worker",
    },
    {
      theme: "Telemedicine",
      text: "Some people might say bonding has increased, but especially families who have alcoholic men at home, women and children have faced a lot of issues.",
      who: "P6, male manager heading outreach efforts",
    },
    {
      theme: "Telemedicine",
      text: "I am sitting and talking to you in a sound proof room, but that is not possible for everyone. Women in rural areas were not comfortable with gadgets.",
      who: "P6, male manager heading outreach efforts",
    },
  ];
  const chipBar = document.getElementById("mh-chips");
  const quoteGrid = document.getElementById("mh-quotes");
  if (chipBar && quoteGrid) {
    const cards = quotes.map((q) => {
      const card = document.createElement("article");
      card.className = "mh-quote";
      card.dataset.theme = q.theme;
      card.innerHTML = `<span class="mh-theme">${q.theme}</span><p>“${q.text}”</p><div class="mh-who">${q.who}</div>`;
      quoteGrid.append(card);
      return card;
    });
    const themes = ["All", ...new Set(quotes.map((q) => q.theme))];
    const chips = themes.map((theme) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mh-btn";
      b.textContent = theme;
      b.addEventListener("click", () => filter(theme));
      chipBar.append(b);
      return b;
    });
    const filter = (theme) => {
      chips.forEach((b) => b.setAttribute("aria-pressed", String(b.textContent === theme)));
      cards.forEach((card) => {
        const show = theme === "All" || card.dataset.theme === theme;
        card.classList.toggle("is-hidden", !show);
        if (show && !reduceMotion) {
          card.animate(
            [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: 350,
              easing: "ease-out",
            }
          );
        }
      });
    };
    filter("All");
  }

  // Consultation clock
  const arc = document.getElementById("mh-clock-arc");
  const range = document.getElementById("mh-clock-range");
  const clockText = document.getElementById("mh-clock-text");
  const clockLabel = document.getElementById("mh-clock-label");
  if (arc && range) {
    const circumference = 2 * Math.PI * 48;
    [arc, range].forEach((c) => {
      c.style.strokeDasharray = `0 ${circumference}`;
      if (!reduceMotion) c.style.transition = "stroke-dasharray 1s cubic-bezier(0.2, 0.8, 0.2, 1)";
    });
    const states = {
      before: { solid: 60, upper: 60, text: "60 min", label: "The usual first psychiatric consultation" },
      during: { solid: 15, upper: 20, text: "15–20 min", label: "The same consultation during COVID-19" },
    };
    const setClock = (key) => {
      const s = states[key];
      arc.style.strokeDasharray = `${(s.solid / 60) * circumference} ${circumference}`;
      range.style.strokeDasharray = `${(s.upper / 60) * circumference} ${circumference}`;
      clockText.textContent = s.text;
      clockLabel.textContent = s.label;
      document.querySelectorAll("[data-clock]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.clock === key)));
    };
    document.querySelectorAll("[data-clock]").forEach((b) => b.addEventListener("click", () => setClock(b.dataset.clock)));
    onVisible(arc.closest("figure"), () => {
      setClock("before");
      if (!reduceMotion) setTimeout(() => setClock("during"), 1800);
    });
  }

  // Three Rs
  const venn = document.getElementById("mh-venn");
  const panel = document.getElementById("mh-venn-panel");
  if (venn && panel) {
    const content = {
      relationships: {
        title: "Relationships",
        body: "Relationships between providers and the patient-caregiver community, built over many years and strengthened through an existing system of educating patients and families. The paper says these were crucial for communication and trust during the crisis, and the providers felt the psycho-education showed its value in how well patients kept to treatment.",
      },
      responsiveness: {
        title: "Responsiveness",
        body: "Meeting end-to-end care needs, from diagnosis to rehabilitation: making medication, counselling, rehabilitation and job placement available remotely, while still allowing safe physical access when it was needed. In 2020 that also meant food provisions.",
      },
      resilience: {
        title: "Resilience",
        body: "Learning from past crises, including floods, the tsunami and cyclones, and from earlier experience with tele-psychiatry, while continually adapting to problems on the ground.",
      },
    };
    const intro =
      "<h4>Continuity of care</h4><p>The paper's argument is that continuity came from these three together. Select a circle to see what each one meant in practice.</p>";
    const circles = venn.querySelectorAll("circle");
    const activate = (key) => {
      circles.forEach((c) => c.classList.toggle("is-active", c.dataset.r === key));
      panel.innerHTML = key ? `<h4>${content[key].title}</h4><p>${content[key].body}</p>` : intro;
    };
    // The circles overlap, so pick the one whose centre is nearest the pointer.
    const nearest = (event) => {
      const point = venn.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const { x, y } = point.matrixTransform(venn.getScreenCTM().inverse());
      let best = null;
      let bestDist = Infinity;
      circles.forEach((c) => {
        const d = Math.hypot(x - c.cx.baseVal.value, y - c.cy.baseVal.value);
        if (d <= c.r.baseVal.value && d < bestDist) {
          best = c.dataset.r;
          bestDist = d;
        }
      });
      return best;
    };
    venn.addEventListener("mousemove", (event) => activate(nearest(event)));
    venn.addEventListener("click", (event) => activate(nearest(event)));
    circles.forEach((c) => {
      c.addEventListener("focus", () => activate(c.dataset.r));
      c.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(c.dataset.r);
        }
      });
    });
    venn.addEventListener("mouseleave", () => activate(null));
    activate(null);
  }
})();
