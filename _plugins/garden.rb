# frozen_string_literal: true

# Digital garden support for the `garden` collection (an Obsidian vault in _garden/).
#
# The idea of parsing wikilinks and computing backlinks at build time is adapted from
# maximevaillancourt/digital-garden-jekyll-template (MIT), whose
# bidirectional_links_generator.rb this file grew out of.
#
# What the generator does, in order:
#   1. titles        filename is the title unless the file's own front matter sets one
#   2. excerpts      plain-text summary per note
#   3. links         [[wikilinks]] are parsed from the raw markdown (code is skipped)
#   4. graph         nodes, undirected edges, wanted (missing) notes, deterministic force layout
#   5. per-note data last_tended, garden_excerpt, garden_backlinks, garden_map
#   6. site.data["garden"] and the generated /garden/graph.json
#   7. doc.content is rewritten with the wikilink / embed HTML
# A :post_convert hook then turns kramdown footnotes into <d-footnote> and Obsidian
# callouts into div.gd-callout.

require "cgi"
require "date"
require "json"
require "nokogiri"
require "open3"
require "time"
require "yaml"
require "zlib"

module Jekyll
  module Garden
    IMAGE_EXT = %w[png jpg jpeg gif webp svg avif].freeze
    VIDEO_EXT = %w[mp4 webm mov].freeze
    HTML_EXT  = %w[html htm].freeze

    EXCERPT_LENGTH = 220
    CONTEXT_LENGTH = 70
    LAYOUT_W       = 1000.0
    LAYOUT_H       = 600.0
    LAYOUT_PAD     = 40.0

    # [[Target]] and ![[file.ext|N]]; the pipe may be escaped as \| (Obsidian inside tables).
    WIKILINK    = /(!?)\[\[([^\[\]\n]+?)\]\]/.freeze
    INLINE_CODE = /(?<!`)(`+)(?!`)((?:[^\n]|\n(?!\s*\n))+?)(?<!`)\1(?!`)/.freeze

    # Private-use characters that mark a link inside plain text (for backlink context).
    MARK_OPEN  = ""
    MARK_MID   = ""
    MARK_CLOSE = ""
    BLOCK_SEP  = "" # paragraph/heading boundary, used for backlink context

    # ------------------------------------------------------------------ helpers
    module Util
      module_function

      def esc(str)
        CGI.escapeHTML(str.to_s)
      end

      # Heading id as kramdown's GFM parser makes it: drop non-word characters
      # (underscores stay), spaces and tabs to hyphens, lowercase.
      def heading_id(heading)
        heading.to_s.strip.downcase.gsub(/[^\p{Word}\- \t]/, "").tr(" \t", "-")
      end

      def round1(num)
        num.to_f.round(1)
      end

      # At most `max` chars, cut at a word boundary, ellipsis when cut.
      def truncate_words(text, max)
        return text if text.length <= max

        cut = text[0, max + 1].sub(/\s+\S*\z/, "")
        cut = text[0, max] if cut.empty?
        "#{cut.rstrip.sub(/[,;:\-–—]+\z/, '')}…"
      end

      # Yield every part of `text` that is outside fenced and inline code; code stays untouched.
      def outside_code(text, &block)
        out = []
        buffer = +""
        fence = nil
        text.each_line do |line|
          if fence
            out << line
            fence = nil if line =~ /\A\s{0,3}#{Regexp.escape(fence[0])}{#{fence.length},}\s*\z/
          elsif line =~ /\A\s{0,3}(`{3,}|~{3,})/
            out << outside_inline_code(buffer, &block)
            buffer = +""
            fence = Regexp.last_match(1)
            out << line
          else
            buffer << line
          end
        end
        out << outside_inline_code(buffer, &block)
        out.join
      end

      def outside_inline_code(chunk)
        return "" if chunk.empty?

        result = +""
        pos = 0
        chunk.scan(INLINE_CODE) do
          m = Regexp.last_match
          result << yield(chunk[pos...m.begin(0)]) << m[0]
          pos = m.end(0)
        end
        result << yield(chunk[pos..])
      end

      # Last ~CONTEXT_LENGTH chars of `text`, starting at a word boundary.
      def tail_context(text)
        return text if text.length <= CONTEXT_LENGTH

        "…#{text[-CONTEXT_LENGTH..].sub(/\A\S*\s+/, '')}"
      end

      # First ~CONTEXT_LENGTH chars of `text`, ending at a word boundary.
      def head_context(text)
        return text if text.length <= CONTEXT_LENGTH

        "#{text[0, CONTEXT_LENGTH].sub(/\s+\S*\z/, '')}…"
      end
    end

    # --------------------------------------------------------------- generator
    class Generator < Jekyll::Generator
      safe true
      priority :high

      def generate(site)
        @site = site
        collection = site.collections["garden"]
        return unless collection

        @baseurl = site.config["baseurl"].to_s.chomp("/")
        @statics = collection.files
        fix_static_urls(collection)

        @notes = {} # id => note hash
        collection.docs.sort_by(&:relative_path).each { |doc| register_note(doc) }
        build_lookup
        @notes.each_value { |note| prepare_note(note) }
        collect_links
        build_graph
        layout_graph
        assign_note_data
        publish_site_data
        add_graph_page
        rewrite_contents
      end

      private

      # ---- 1/2: titles, ids, excerpts ---------------------------------------

      def register_note(doc)
        id = doc.url.to_s.split("/").reject(&:empty?).last || Jekyll::Utils.slugify(doc.basename_without_ext)
        doc.data["title"] = File.basename(doc.path, ".*") unless own_front_matter(doc.path).key?("title")
        doc.data["garden_id"] = id
        if @notes.key?(id)
          Jekyll.logger.warn "Garden:", "#{doc.relative_path} has the same URL as #{@notes[id][:doc].relative_path}; " \
                                        "only one of them is kept"
        end
        @notes[id] = { id: id, doc: doc, title: doc.data["title"].to_s, url: "#{@baseurl}#{doc.url}",
                       filename: File.basename(doc.path, ".*"), links: [] }
      end

      # The YAML front matter exactly as written in the file (Jekyll's defaults not applied).
      def own_front_matter(path)
        raw = File.read(path, encoding: "utf-8")
        block = raw[/\A﻿?---[ \t]*\r?\n(.*?)^---[ \t]*\r?$/m, 1]
        return {} if block.nil? || block.strip.empty?

        data = YAML.safe_load(block, permitted_classes: [Date, Time], aliases: true)
        data.is_a?(Hash) ? data : {}
      rescue StandardError
        {}
      end

      # Targets are matched case-insensitively against titles, filenames and slugs.
      def build_lookup
        @lookup = {}
        @notes.each_value do |note|
          [note[:title], note[:filename], note[:id]].each { |key| @lookup[key.downcase] ||= note }
        end
      end

      def find_note(target)
        name = File.basename(target.to_s.strip).sub(/\.md\z/i, "")
        @lookup[name.downcase] || @lookup[Jekyll::Utils.slugify(name)]
      end

      def prepare_note(note)
        note[:content] = note[:doc].content.to_s
        description = note[:doc].data["description"].to_s.gsub(/\s+/, " ").strip
        note[:excerpt] = Util.truncate_words(
          description.empty? ? plain_text(note, headings: false) : description, EXCERPT_LENGTH
        )
      end

      # ---- 3: links ---------------------------------------------------------

      # Walk every wikilink/embed outside code. The block receives (kind, parts, match_context)
      # and returns the replacement. `parts[:index]` counts [[links]] (not embeds) in order.
      def transform(note, content = note[:content])
        index = -1
        Util.outside_code(content) do |chunk|
          chunk.gsub(WIKILINK) do
            match = Regexp.last_match
            embed = !match[1].empty?
            parts = parse_inner(match[2], embed, note)
            next match[0] unless parts

            parts[:index] = (index += 1) unless embed
            parts[:own_line] = match.pre_match =~ /(\A|\n)[ \t]*\z/ && match.post_match =~ /\A[ \t]*(\n|\z)/
            yield(embed ? :embed : :link, parts)
          end
        end
      end

      # Split "Target#Heading|Label" (pipe possibly escaped) into its parts.
      def parse_inner(inner, embed, note)
        target_part, alias_text = inner.split(/\\?\|/, 2)
        target, heading = target_part.to_s.split("#", 2)
        target = target.to_s.strip
        heading = heading&.split("#")&.last&.strip
        alias_text = alias_text&.strip
        if target.empty?
          return nil if embed || heading.to_s.empty?

          target = note[:title] # [[#Heading]] links inside the same note
        end
        label = if alias_text && !alias_text.empty? then alias_text
                elsif heading && !heading.empty? then (target_part.start_with?("#") ? heading : "#{target} > #{heading}")
                else target
                end
        { target: target, heading: heading, label: label, alias: alias_text }
      end

      def collect_links
        @notes.each_value do |note|
          transform(note) do |kind, parts|
            if kind == :link
              slug = Jekyll::Utils.slugify(parts[:target])
              found = find_note(parts[:target])
              if found
                note[:links] << { id: found[:id], index: parts[:index], label: parts[:label] }
              elsif !slug.empty?
                note[:links] << { id: slug, index: parts[:index], label: parts[:label], missing_title: parts[:target] }
              end
            end
            "" # nothing is kept, we only read
          end
        end
      end

      # ---- 4: graph ---------------------------------------------------------

      def build_graph
        @nodes = {}
        @notes.each_value do |note|
          @nodes[note[:id]] = { "id" => note[:id], "title" => note[:title], "url" => note[:url],
                                "missing" => false, "excerpt" => note[:excerpt] }
        end
        @wanted = {}
        @edge_keys = {}
        @adjacent = Hash.new { |h, k| h[k] = {} }
        @backlinks = Hash.new { |h, k| h[k] = {} } # target id => { source id => first link }

        @notes.keys.sort.each { |id| link_note(@notes[id]) }
        @nodes.each_value { |node| node["degree"] = @adjacent[node["id"]].size }
      end

      def link_note(note)
        note[:links].each do |link|
          target_id = link[:id]
          next if target_id == note[:id]

          unless @nodes.key?(target_id)
            @nodes[target_id] = { "id" => target_id, "title" => link[:missing_title], "url" => nil,
                                  "missing" => true, "excerpt" => nil }
            @wanted[target_id] = {}
          end
          @wanted[target_id][note[:id]] = true if @nodes[target_id]["missing"]
          @backlinks[target_id][note[:id]] ||= link
          pair = [note[:id], target_id]
          @edge_keys[pair.sort] ||= pair
          @adjacent[note[:id]][target_id] = true
          @adjacent[target_id][note[:id]] = true
        end
      end

      def layout_graph
        ids = @nodes.keys.sort
        edges = @edge_keys.values.map { |a, b| [a, b] }
        ForceLayout.new(ids, edges).positions.each do |id, (x, y)|
          @nodes[id]["x"] = Util.round1(x)
          @nodes[id]["y"] = Util.round1(y)
        end
      end

      # ---- 5: per-note data --------------------------------------------------

      def assign_note_data
        @notes.each_value do |note|
          doc = note[:doc]
          doc.data["last_tended"] = last_tended(doc)
          doc.data["garden_excerpt"] = note[:excerpt]
          doc.data["garden_backlinks"] = backlinks_for(note)
          doc.data["garden_map"] = note_map(note[:id])
        end
      end

      def last_tended(doc)
        out, _err, status = Open3.capture3("git", "log", "-1", "--format=%aI", "--", doc.path, chdir: @site.source)
        date = status.success? ? out.strip : ""
        date.empty? ? File.mtime(doc.path) : Time.parse(date)
      rescue StandardError
        File.mtime(doc.path)
      end

      def backlinks_for(note)
        @backlinks[note[:id]].map do |source_id, link|
          source = @notes[source_id]
          before, after = link_context(source, link[:index])
          { "title" => source[:title], "url" => source[:url], "before" => before,
            "label" => link[:label], "after" => after }
        end.sort_by { |b| [b["title"].downcase, b["url"]] }
      end

      # Plain text on either side of link number `index` in `source`.
      def link_context(source, index)
        source[:marked] ||= plain_text(source, marks: true)
        open = "#{MARK_OPEN}#{index}#{MARK_MID}"
        text = source[:marked].split(BLOCK_SEP).find { |block| block.include?(open) }
        return ["", ""] unless text

        start = text.index(open)

        stop = text.index(MARK_CLOSE, start) || text.length - 1
        unmark = ->(str) { str.gsub(/#{MARK_OPEN}\d+#{MARK_MID}|#{MARK_CLOSE}/o, "") }
        [Util.tail_context(unmark.call(text[0...start]).lstrip),
         Util.head_context(unmark.call(text[(stop + 1)..].to_s).rstrip)]
      end

      # ---- maps --------------------------------------------------------------

      def node_entry(node, role, label)
        { "id" => node["id"], "title" => node["title"], "url" => node["url"], "x" => node["x"], "y" => node["y"],
          "role" => role, "missing" => node["missing"], "label" => label }
      end

      def edge_entry(a, b, role)
        { "x1" => a["x"], "y1" => a["y"], "x2" => b["x"], "y2" => b["y"], "role" => role }
      end

      # The 5:1 "location band" centred on one note.
      def note_map(id)
        current = @nodes[id]
        neighbors = @adjacent[id].keys.map { |n| @nodes[n] }
        dx = neighbors.map { |n| (n["x"] - current["x"]).abs }.max || 0
        dy = neighbors.map { |n| (n["y"] - current["y"]).abs }.max || 0
        # Zoom out as far as needed to keep every neighbour in view (labels and
        # dots are scaled to the zoom in _includes/garden/map.liquid).
        # Horizontal padding clears the band's faded edges; vertical padding
        # leaves room for labels under the dots.
        w = [[2 * dx + 260, 5 * (2 * dy + 180), 320].max, 3000].min.to_f
        h = w / 5
        vx = current["x"] - w / 2
        vy = current["y"] - h / 2
        inside = lambda do |n|
          n["x"] >= vx - 0.15 * w && n["x"] <= vx + 1.15 * w && n["y"] >= vy - 0.15 * h && n["y"] <= vy + 1.15 * h
        end

        nodes = @nodes.values.select { |n| inside.call(n) }.map do |n|
          role = n["id"] == id ? "current" : (@adjacent[id].key?(n["id"]) ? "neighbor" : "far")
          node_entry(n, role, role != "far")
        end
        edges = @edge_keys.values.filter_map do |a, b|
          next unless inside.call(@nodes[a]) || inside.call(@nodes[b])

          edge_entry(@nodes[a], @nodes[b], [a, b].include?(id) ? "near" : "far")
        end
        { "viewbox" => [vx, vy, w, h].map { |v| Util.round1(v) }.join(" "), "nodes" => nodes, "edges" => edges }
      end

      def overview_map
        return { "viewbox" => "0 0 1000 200", "nodes" => [], "edges" => [] } if @nodes.empty?

        xs = @nodes.values.map { |n| n["x"] }
        ys = @nodes.values.map { |n| n["y"] }
        pad = 60
        box = [xs.min - pad, ys.min - pad, xs.max - xs.min + 2 * pad, ys.max - ys.min + 2 * pad]
        few = @nodes.size <= 40
        { "viewbox" => box.map { |v| Util.round1(v) }.join(" "),
          "nodes" => @nodes.values.map { |n| node_entry(n, "all", few || n["degree"] >= 2) },
          "edges" => @edge_keys.values.map { |a, b| edge_entry(@nodes[a], @nodes[b], "all") } }
      end

      # ---- 6: site data and graph.json ----------------------------------------

      def publish_site_data
        notes = @notes.values.map do |n|
          { "title" => n[:title], "url" => n[:url], "excerpt" => n[:excerpt],
            "last_tended" => n[:doc].data["last_tended"], "id" => n[:id] }
        end
        wanted = @wanted.map do |id, sources|
          from = sources.keys.map { |s| { "title" => @notes[s][:title], "url" => @notes[s][:url] } }
          { "title" => @nodes[id]["title"], "id" => id, "linked_from" => from.sort_by { |f| f["title"].downcase } }
        end
        @site.data["garden"] = {
          "notes" => notes.sort_by { |n| [-n["last_tended"].to_f, n["title"].downcase] },
          "wanted" => wanted.sort_by { |w| [-w["linked_from"].size, w["title"].downcase] },
          "overview_map" => overview_map,
          "count" => notes.size
        }
      end

      def add_graph_page
        nodes = @nodes.keys.sort_by { |id| [@nodes[id]["missing"] ? 1 : 0, id] }.map do |id|
          n = @nodes[id]
          { "id" => id, "title" => n["title"], "url" => n["url"], "x" => n["x"], "y" => n["y"],
            "degree" => n["degree"], "missing" => n["missing"], "excerpt" => n["excerpt"] }
        end
        edges = @edge_keys.values.sort.map { |a, b| { "source" => a, "target" => b } }

        page = Jekyll::PageWithoutAFile.new(@site, @site.source, "garden", "graph.json")
        page.content = JSON.generate("nodes" => nodes, "edges" => edges)
        page.data["layout"] = nil
        page.data["permalink"] = "/garden/graph.json"
        page.data["render_with_liquid"] = false
        @site.pages << page
      end

      # ---- 7: rewrite markdown ---------------------------------------------------

      def rewrite_contents
        @notes.each_value do |note|
          note[:doc].content = transform(note) do |kind, parts|
            kind == :link ? link_html(parts) : embed_html(parts)
          end
        end
      end

      def link_html(parts)
        found = find_note(parts[:target])
        label = Util.esc(parts[:label])
        if found
          href = found[:url]
          href += "##{Util.heading_id(parts[:heading])}" unless parts[:heading].to_s.empty?
          %(<a class="gd-link" href="#{Util.esc(href)}" data-garden-id="#{Util.esc(found[:id])}">#{label}</a>)
        else
          slug = Jekyll::Utils.slugify(parts[:target])
          return label if slug.empty?

          %(<span class="gd-missing" title="Not written yet" data-garden-id="#{Util.esc(slug)}">#{label}</span>)
        end
      end

      def embed_html(parts)
        name = File.basename(parts[:target])
        ext = File.extname(name).delete(".").downcase
        file = find_static(parts[:target])
        stem = File.basename(name, ".*")
        size = parts[:alias].to_s[/\A\d+/]

        if file && IMAGE_EXT.include?(ext)
          width = size ? %( width="#{size}") : ""
          %(<img class="gd-embed-img" src="#{Util.esc(static_url(file))}" alt="#{Util.esc(stem)}" loading="lazy"#{width}>)
        elsif file && VIDEO_EXT.include?(ext)
          %(<video class="gd-embed-video" src="#{Util.esc(static_url(file))}" autoplay loop muted playsinline></video>)
        elsif file && HTML_EXT.include?(ext)
          height = size || "420"
          %(<iframe class="gd-embed-frame" src="#{Util.esc(static_url(file))}" loading="lazy" ) +
            %(title="#{Util.esc(stem)}" style="height: #{height.to_i}px"></iframe>)
        elsif (note = !file && find_note(parts[:target]))
          %(<a class="gd-embed-note" href="#{Util.esc(note[:url])}"><b>#{Util.esc(note[:title])}</b>) +
            %(<span>#{Util.esc(note[:excerpt])}</span></a>)
        else
          %(<span class="gd-missing-embed">#{Util.esc(name)}</span>)
        end
      end

      # ---- static files (attachments) ---------------------------------------------

      def find_static(target)
        wanted = target.strip.downcase
        @static_index ||= @statics.sort_by(&:relative_path)
        @static_index.find do |f|
          rel = f.relative_path.downcase
          File.basename(rel) == File.basename(wanted) && (!wanted.include?("/") || rel.end_with?("/#{wanted}"))
        end
      end

      def static_url(file)
        "#{@baseurl}#{file.url}"
      end

      # A collection permalink like /garden/:slug/ has no meaning for attachments, so
      # pin each static file to /garden/<path inside _garden>.
      def fix_static_urls(collection)
        dir = collection.relative_directory
        @statics.each do |file|
          rel = file.relative_path.sub(%r{\A/?#{Regexp.escape(dir)}/}, "")
          file.instance_variable_set(:@url, "/#{collection.label}/#{rel}")
        end
      end

      # ---- plain text ----------------------------------------------------------------

      # Strip markdown down to readable text. With `marks`, wikilinks are wrapped in marker
      # characters so a link can be located afterwards.
      def plain_text(note, marks: false, headings: true)
        text = note[:content].gsub(/^[ \t]{0,3}(`{3,}|~{3,}).*?^[ \t]{0,3}\1[`~]*[ \t]*$/m, "")
        text = transform(note, text) do |kind, parts|
          next "" unless kind == :link

          marks ? "#{MARK_OPEN}#{parts[:index]}#{MARK_MID}#{parts[:label]}#{MARK_CLOSE}" : parts[:label]
        end
        clean_markdown(text, marks ? false : headings, blocks: marks)
      end

      # With `blocks`, blank lines and headings become BLOCK_SEP so text can be split into
      # paragraphs afterwards.
      def clean_markdown(text, headings, blocks: false)
        text = text.gsub(%r{<(script|style)\b.*?</\1\s*>}mi, "").gsub(/<!--.*?-->/m, "").gsub(/\$\$.*?\$\$/m, "")
        text = text.gsub(/^[ \t]*\{:.*\}[ \t]*$/, "")
        text = text.gsub(/^\[\^[^\]]+\]:.*(\n(?:[ \t]{2,}|\t).*)*$/, "").gsub(/\[\^[^\]]+\]/, "")
        text = headings ? text.gsub(/^\#{1,6}[ \t]+/, "") : text.gsub(/^\#{1,6}[ \t]+.*$/, "")
        text = text.gsub(/^[ \t]*>+[ \t]*\[![\w-]+\][+-]?[ \t]*/, "").gsub(/^[ \t]*(>[ \t]?)+/, "")
        text = text.gsub(/^[ \t]*\|?[ \t]*:?-{2,}[ \t|:\-]*$/, "").gsub(/^([ \t]*\|.*)$/) { Regexp.last_match(1).tr("|", " ") }
        text = text.gsub(/^[ \t]*([-*+]|\d+[.)])[ \t]+(\[[ xX]\][ \t]+)?/, "").gsub(/^[ \t]*([-*_][ \t]*){3,}$/, "")
        text = text.gsub(/!\[[^\]]*\]\([^)]*\)/, "").gsub(/\[([^\]]*)\]\([^)]*\)/, '\1')
        text = text.gsub(%r{</?[A-Za-z][^>]*>}, "")
        text = text.gsub(/\$([^$\n]+)\$/) { |m| Regexp.last_match(1) =~ /[\\^_{}]/ ? "" : Regexp.last_match(1) }
        text = text.gsub(/[*`]|~~/, "").gsub(/(?<![\p{L}\p{N}])_+|_+(?![\p{L}\p{N}])/, "")
        text = text.gsub(/\\([\\`*_{}\[\]()#+\-.!$|])/, '\1')
        text = text.gsub(/\n[ \t]*\n\s*/, BLOCK_SEP) if blocks
        CGI.unescapeHTML(text).gsub(/[ \t\r\n\f\v]+/, " ").gsub(/ ?#{BLOCK_SEP} ?/o, BLOCK_SEP).strip
      end
    end

    # -------------------------------------------------------------- force layout
    # Fruchterman-Reingold with a mild gravity, seeded from crc32 of the ids so the same
    # input always gives the same picture. Result is fitted into the 1000x600 box.
    class ForceLayout
      GRAVITY = 0.5
      GAP = 60.0

      def initialize(ids, edges)
        @ids = ids
        @adj = Hash.new { |h, k| h[k] = [] }
        edges.each do |a, b|
          @adj[a] << b
          @adj[b] << a
        end
        @k = Math.sqrt(LAYOUT_W * LAYOUT_H / [ids.size, 1].max)
      end

      # Each connected component is laid out on its own, the components are shelf-packed,
      # and the whole picture is fitted into the 1000x600 box.
      def positions
        return {} if @ids.empty?

        boxes = components.map { |comp| layout_component(comp) }
        boxes.sort_by! { |b| [-b[:ids].size, b[:ids].first] }
        multi, singles = boxes.partition { |b| b[:ids].size > 1 }
        fit(pack(multi, singles))
      end

      private

      # Connected components, each a sorted id list (deterministic order).
      def components
        seen = {}
        @ids.each_with_object([]) do |start, comps|
          next if seen[start]

          queue = [start]
          seen[start] = true
          comp = []
          until queue.empty?
            node = queue.shift
            comp << node
            @adj[node].sort.each do |nb|
              next if seen[nb]

              seen[nb] = true
              queue << nb
            end
          end
          comps << comp.sort
        end
      end

      # Layout of one component in local coordinates, shifted to start at 0,0.
      def layout_component(ids)
        n = ids.size
        return { ids: ids, pts: [[0.0, 0.0]], w: 0.0, h: 0.0 } if n == 1

        if n == 2
          pts = [[0.0, 0.0], [@k * 1.2, 0.0]]
        else
          w = @k * Math.sqrt(n) * 1.7
          h = @k * Math.sqrt(n)
          xs, ys = seed(ids, w, h)
          simulate(ids, xs, ys, w, h)
          pts = xs.zip(ys)
        end
        minx = pts.map(&:first).min
        miny = pts.map(&:last).min
        pts = pts.map { |x, y| [x - minx, y - miny] }
        { ids: ids, pts: pts, w: pts.map(&:first).max, h: pts.map(&:last).max }
      end

      def seed(ids, w, h)
        xs = []
        ys = []
        ids.each do |id|
          crc = Zlib.crc32(id)
          xs << (crc & 0xffff) / 65_535.0 * w
          ys << ((crc >> 16) & 0xffff) / 65_535.0 * h
        end
        [xs, ys]
      end

      def simulate(ids, xs, ys, fw, fh)
        n = ids.size
        index = ids.each_with_index.to_h
        edges = ids.flat_map { |a| @adj[a].map { |b| [index[a], index[b]] } }.select { |a, b| a < b }
        k = @k
        k2 = k * k
        iterations = n > 200 ? 200 : 300
        cx = fw / 2
        cy = fh / 2

        iterations.times do |step|
          temp = (fw / 10.0) * (1 - step.to_f / iterations) + 0.5
          dx = Array.new(n, 0.0)
          dy = Array.new(n, 0.0)

          (0...n).each do |i|
            xi = xs[i]
            yi = ys[i]
            (i + 1...n).each do |j|
              ddx = xi - xs[j]
              ddy = yi - ys[j]
              d2 = ddx * ddx + ddy * ddy
              if d2 < 0.01 # coincident: push apart in a fixed direction
                ddx = ((i - j) % 7 + 1) * 0.1
                ddy = ((i + j) % 5 + 1) * 0.1
                d2 = ddx * ddx + ddy * ddy
              end
              f = k2 / d2 # repulsion k^2/d along the unit vector
              dx[i] += ddx * f
              dy[i] += ddy * f
              dx[j] -= ddx * f
              dy[j] -= ddy * f
            end
          end

          edges.each do |a, b|
            ddx = xs[a] - xs[b]
            ddy = ys[a] - ys[b]
            f = Math.sqrt(ddx * ddx + ddy * ddy) / k # attraction d^2/k along the unit vector
            dx[a] -= ddx * f
            dy[a] -= ddy * f
            dx[b] += ddx * f
            dy[b] += ddy * f
          end

          n.times do |i|
            dx[i] -= (xs[i] - cx) * GRAVITY
            dy[i] -= (ys[i] - cy) * GRAVITY
            len = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i])
            next if len < 1e-9

            move = len < temp ? 1.0 : temp / len
            xs[i] += dx[i] * move
            ys[i] += dy[i] * move
          end
        end
      end

      # Shelf packing: largest first, left to right in rows; single nodes share the last rows.
      def pack(multi, singles)
        area = multi.sum { |b| (b[:w] + GAP) * (b[:h] + GAP) }
        row_width = [Math.sqrt(area * 5 / 3.0), multi.map { |b| b[:w] }.max || 0].max
        row_width = [row_width, Math.sqrt(singles.size) * GAP * 2].max if multi.empty?
        placed = {}
        x = 0.0
        y = 0.0
        row_h = 0.0
        place = lambda do |box|
          if x.positive? && x + box[:w] > row_width
            y += row_h + GAP
            x = 0.0
            row_h = 0.0
          end
          box[:ids].each_with_index { |id, i| placed[id] = [x + box[:pts][i][0], y + box[:pts][i][1]] }
          x += box[:w] + GAP
          row_h = [row_h, box[:h]].max
        end
        multi.each(&place)
        unless singles.empty? || multi.empty?
          y += row_h + GAP
          x = 0.0
          row_h = 0.0
        end
        singles.each(&place)
        placed
      end

      # Uniform scale into the padded box, centred.
      def fit(placed)
        xs = placed.values.map(&:first)
        ys = placed.values.map(&:last)
        minx, maxx = xs.minmax
        miny, maxy = ys.minmax
        w = maxx - minx
        h = maxy - miny
        avail_w = LAYOUT_W - 2 * LAYOUT_PAD
        avail_h = LAYOUT_H - 2 * LAYOUT_PAD
        scales = []
        scales << avail_w / w if w > 1e-6
        scales << avail_h / h if h > 1e-6
        scale = scales.min || 1.0
        # a lone pair or tiny graph should not be blown up to the whole box
        scale = [scale, 1.0].min if placed.size <= 2
        off_x = LAYOUT_PAD + (avail_w - w * scale) / 2
        off_y = LAYOUT_PAD + (avail_h - h * scale) / 2
        placed.transform_values { |x, y| [off_x + (x - minx) * scale, off_y + (y - miny) * scale] }
      end
    end

    # ------------------------------------------------------- HTML post-processing
    module Html
      module_function

      def process(html)
        return html unless html.include?("footnote") || html.include?("[!")

        frag = Nokogiri::HTML5.fragment(html)
        footnotes(frag)
        callouts(frag)
        frag.to_html
      end

      def fragment(frag, html)
        Nokogiri::HTML5::DocumentFragment.new(frag.document, html)
      end

      # <sup id="fnref:1"><a class="footnote" href="#fn:1"> -> <d-footnote>text</d-footnote>
      def footnotes(frag)
        defs = {}
        frag.css("div.footnotes li[id]").each { |li| defs[li["id"]] = li }
        frag.css("sup[id^='fnref']").each do |sup|
          link = sup.at_css("a.footnote")
          item = link && defs[link["href"].to_s.sub(/\A#/, "")]
          next unless item

          sup.replace(fragment(frag, "<d-footnote>#{footnote_body(item)}</d-footnote>"))
        end
        frag.css("div.footnotes").each(&:remove)
      end

      def footnote_body(item)
        item = item.dup
        item.css("a.reversefootnote, a[role='doc-backlink']").each(&:remove)
        paragraphs = item.element_children.select { |c| c.name == "p" }
        if paragraphs.size == item.element_children.size && !paragraphs.empty?
          paragraphs.map { |p| p.inner_html.gsub(/\A(?:[[:space:]]|&nbsp;|&#160;)+|(?:[[:space:]]|&nbsp;|&#160;)+\z/, "") }.reject(&:empty?).join("<br><br>")
        else
          item.inner_html.gsub(/\A(?:[[:space:]]|&nbsp;|&#160;)+|(?:[[:space:]]|&nbsp;|&#160;)+\z/, "")
        end
      end

      # > [!type]+ Title  ->  <div class="gd-callout" data-callout="type">
      def callouts(frag)
        frag.css("blockquote").reverse_each do |quote|
          first = quote.element_children.first
          next unless first && first.name == "p"

          m = first.inner_html.match(/\A\s*\[!([\w-]+)\][+-]?[ \t]*(.*?)(?:<br\s*\/?>\s*|\n|\z)(.*)\z/m)
          next unless m

          type = m[1].downcase
          title = m[2].strip
          title = type.capitalize if title.empty?
          rest = m[3].strip
          body = rest.empty? ? "" : "<p>#{rest}</p>"
          body += siblings_after(first)
          html = %(<div class="gd-callout" data-callout="#{CGI.escapeHTML(type)}">) +
                 %(<p class="gd-callout-title">#{title}</p>#{body}</div>)
          quote.replace(fragment(frag, html))
        end
      end

      def siblings_after(node)
        out = +""
        while (node = node.next_sibling)
          out << node.to_html
        end
        out
      end
    end
  end
end

Jekyll::Hooks.register :garden, :post_convert do |doc|
  doc.content = Jekyll::Garden::Html.process(doc.content)
end
