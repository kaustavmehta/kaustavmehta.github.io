---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
kicker: Blog
atmospheric: true
hero_title_strong: My research,
hero_title_rest: explained from scratch.
description: I write these posts to explain my research to anyone who is curious about it. Most of them start from the basics and build up to what we found, with figures you can play with along the way.
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
---

<div class="post blog-page">
  <div class="blog-hero-field" aria-hidden="true"><canvas id="blog-contours"></canvas></div>

  <header class="blog-hero">
    <div class="blog-hero-kicker atmo-hero-entrance">
      <span class="blog-hero-kicker-line"></span>
      {{ page.kicker }}
      <span class="blog-hero-count">{{ site.posts | size | prepend: '00' | slice: -2, 2 }} {% if site.posts.size == 1 %}essay{% else %}essays{% endif %}</span>
    </div>
    <h1 class="blog-hero-title">
      {%- assign words = page.hero_title_strong | split: ' ' -%}
      {%- for word in words -%}
        <span class="blog-word" style="--i: {{ forloop.index0 }}"><strong>{{ word }}</strong></span>{% unless forloop.last %}&#32;{% endunless %}
      {%- endfor %}&#32;<em>
        {%- assign rest = page.hero_title_rest | split: ' ' -%}
        {%- for word in rest -%}
          <span class="blog-word" style="--i: {{ forloop.index0 | plus: words.size }}">{{ word }}</span>{% unless forloop.last %}&#32;{% endunless %}
        {%- endfor -%}
      </em>
    </h1>
    <p class="blog-hero-lede atmo-hero-entrance">{{ page.description }}</p>
  </header>

{% if page.pagination.enabled %}
{% assign postlist = paginator.posts %}
{% else %}
{% assign postlist = site.posts %}
{% endif %}

  <ol class="blog-list">
    {% for post in postlist %}
      {% if post.external_source == blank %}
        {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      {% else %}
        {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
      {% endif %}
      {% if post.redirect == blank %}
        {% assign post_href = post.url | relative_url %}
      {% elsif post.redirect contains '://' %}
        {% assign post_href = post.redirect %}
      {% else %}
        {% assign post_href = post.redirect | relative_url %}
      {% endif %}
      {% assign is_feature = false %}
      {% if forloop.first and paginator.page == 1 %}{% assign is_feature = true %}{% endif %}

      <li class="blog-entry atmo-reveal{% if is_feature %} is-feature{% endif %}{% if post.cover %} has-cover{% endif %}">
        <a class="blog-entry-link" href="{{ post_href }}"{% if post.redirect contains '://' %} target="_blank" rel="noopener"{% endif %}>
          {% if post.cover or is_feature %}
            <div class="blog-cover" data-seed="{{ post.title | escape }}">
              {% if post.cover %}
                {% include blog_covers/{{ post.cover }}.liquid %}
              {% else %}
                <span class="blog-cover-initial">{{ post.title | slice: 0 }}</span>
              {% endif %}
            </div>
          {% endif %}
          <div class="blog-entry-body">
            <div class="blog-entry-date">
              <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%b %d, %Y' }}</time>
              <span>{{ read_time }} min read</span>
            </div>
            <h2 class="blog-entry-title">{{ post.title }}</h2>
            {% if post.description %}
              <p class="blog-entry-description">{{ post.description }}</p>
            {% endif %}
            <span class="blog-entry-cta">Read the essay <span class="blog-entry-arrow" aria-hidden="true">&rarr;</span></span>
          </div>
        </a>
        {% if post.tags.size > 0 %}
          <p class="blog-entry-tags">
            {% for tag in post.tags %}
              <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">{{ tag }}</a>
            {% endfor %}
          </p>
        {% endif %}
      </li>
    {% endfor %}

  </ol>

{% if page.pagination.enabled %}
{% include pagination.liquid %}
{% endif %}

  <div class="ambient-rings" aria-hidden="true">
    <div class="ring"></div>
    <div class="ring"></div>
    <div class="ring"></div>
    <div class="ring"></div>
  </div>
</div>

<script defer src="{{ '/assets/js/blog-index.js' | relative_url }}"></script>
<script defer src="{{ '/assets/js/threads.js' | relative_url }}"></script>
