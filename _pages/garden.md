---
layout: default
permalink: /garden/
title: garden
# Once the first note is in _garden/, set nav to true and remove sitemap: false.
nav: false
sitemap: false
nav_order: 1.5
kicker: Garden
atmospheric: true
# Optional lede under the heading, in your words.
description:
---

{% assign garden = site.data.garden %}
{% assign note_count = garden.count | default: 0 %}
{% assign wanted_count = garden.wanted.size | default: 0 %}

<div class="post blog-page gd-index" data-graph-url="{{ '/garden/graph.json' | relative_url }}">
  <header class="blog-hero">
    <div class="blog-hero-kicker atmo-hero-entrance">
      <span class="blog-hero-kicker-line"></span>
      {{ page.kicker }}
      <span class="blog-hero-count">
        {{- note_count | prepend: '00' | slice: -2, 2 }} {% if note_count == 1 %}note{% else %}notes{% endif -%}
        {%- if wanted_count > 0 %} · {{ wanted_count | prepend: '00' | slice: -2, 2 }} not written yet{% endif -%}
      </span>
    </div>
    <h1 class="blog-hero-title"><strong>Garden</strong></h1>
    {% if page.description %}
      <p class="blog-hero-lede atmo-hero-entrance">{{ page.description }}</p>
    {% endif %}
  </header>

{% include garden/map.liquid map=garden.overview_map kind="overview" %}

{% if note_count > 0 %}

  <div class="gd-cols">
    <section aria-labelledby="gd-notes-title">
      <h2 class="gd-section-title" id="gd-notes-title">Notes</h2>
      <div class="gd-sorts" role="group" aria-label="Order notes">
        <button type="button" class="gd-sort is-active" data-gd-sort="recent" aria-pressed="true">Recently tended</button>
        <button type="button" class="gd-sort" data-gd-sort="az" aria-pressed="false">A–Z</button>
      </div>
      <ol class="gd-notes" data-gd-list>
        {% for note in garden.notes %}
          <li data-title="{{ note.title | downcase | escape }}" data-order="{{ forloop.index0 }}">
            <a href="{{ note.url }}">
              <h3 class="gd-note-title">{{ note.title | escape }}</h3>
              <span class="gd-note-date">tended <time datetime="{{ note.last_tended | date_to_xmlschema }}">{{ note.last_tended | date: '%-d %b %Y' }}</time></span>
              {% if note.excerpt %}
                <p class="gd-note-excerpt">{{ note.excerpt | escape }}</p>
              {% endif %}
            </a>
          </li>
        {% endfor %}
      </ol>
    </section>

    {% if wanted_count > 0 %}
      <section aria-labelledby="gd-wanted-title">
        <h2 class="gd-section-title" id="gd-wanted-title">Not written yet</h2>
        <ul class="gd-wanted">
          {% for w in garden.wanted %}
            <li>
              <span class="gd-missing">{{ w.title | escape }}</span>
              <small>
                linked from
                {% for src in w.linked_from %}<a href="{{ src.url }}">{{ src.title | escape }}</a>{% unless forloop.last %}, {% endunless %}{% endfor %}
              </small>
            </li>
          {% endfor %}
        </ul>
      </section>
    {% endif %}

  </div>
{% else %}
  <p class="gd-empty">Nothing planted yet.</p>
{% endif %}
</div>

<script>
  // Switch the notes list between most recently tended and A–Z.
  document.querySelectorAll("[data-gd-sort]").forEach(function (button) {
    button.addEventListener("click", function () {
      var list = document.querySelector("[data-gd-list]");
      if (!list) return;
      var key = button.getAttribute("data-gd-sort");
      var items = Array.prototype.slice.call(list.children);
      items.sort(function (a, b) {
        if (key === "az") return a.dataset.title.localeCompare(b.dataset.title);
        return a.dataset.order - b.dataset.order;
      });
      items.forEach(function (item) {
        list.appendChild(item);
      });
      document.querySelectorAll("[data-gd-sort]").forEach(function (other) {
        var on = other === button;
        other.classList.toggle("is-active", on);
        other.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
  });
</script>
<script defer src="{{ '/assets/js/garden/explorer.js' | relative_url }}"></script>
