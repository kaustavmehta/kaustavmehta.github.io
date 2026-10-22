---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
kicker: Blog
atmospheric: true
hero_title_strong: Longer walks
hero_title_rest: through the work.
description: Papers I've been part of, explained with more room than a journal gives them, with the context, the people's own words, and the numbers drawn out.
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
  <header class="blog-hero atmo-hero-entrance">
    <div class="blog-hero-kicker">{{ page.kicker }}</div>
    <h1 class="blog-hero-title"><strong>{{ page.hero_title_strong }}</strong> {{ page.hero_title_rest }}</h1>
    <p class="blog-hero-lede">{{ page.description }}</p>
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

      <li class="blog-entry atmo-reveal">
        <div class="blog-entry-date">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%b %d, %Y' }}</time>
        </div>
        <div class="blog-entry-body">
          <h2 class="blog-entry-title">
            <a href="{{ post_href }}"{% if post.redirect contains '://' %} target="_blank" rel="noopener"{% endif %}>{{ post.title }}</a>
          </h2>
          {% if post.description %}
            <p class="blog-entry-description">{{ post.description }}</p>
          {% endif %}
          <p class="blog-entry-meta">
            <span>{{ read_time }} min read</span>
            {% if post.external_source %}<span>{{ post.external_source }}</span>{% endif %}
            {% for tag in post.tags %}
              <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">{{ tag }}</a>
            {% endfor %}
          </p>
        </div>
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
