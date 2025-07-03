# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Jekyll-based academic portfolio website using the al-folio template. The site is designed for hosting on GitHub Pages and serves as a personal academic portfolio, blog, and research documentation platform.

## Development Setup Commands

### Local Development with Docker (Recommended)
```bash
# Pull and start the development server
docker compose pull
docker compose up

# For slim version (under 100MB)
docker compose -f docker-compose-slim.yml up

# Build custom docker image
docker compose up --build

# Debug docker issues
docker compose up -d
docker compose logs
docker compose exec -it jekyll /bin/bash
```

### Local Development without Docker
```bash
# Install dependencies
bundle install
pip install jupyter

# Serve the site locally
bundle exec jekyll serve

# Build the site for production
bundle exec jekyll build

# Remove unused CSS (after building)
purgecss -c purgecss.config.js
```

### Code Quality and Formatting
```bash
# Format code using Prettier
npx prettier --write .

# Format Liquid templates
npx prettier --write --plugin=@shopify/prettier-plugin-liquid "_includes/**/*.liquid" "_layouts/**/*.liquid"
```

## Architecture and Structure

### Core Jekyll Structure
- `_config.yml`: Main Jekyll configuration file with site settings
- `_layouts/`: HTML templates for different page types (about, post, project, etc.)
- `_includes/`: Reusable components (header, footer, scripts, etc.)
- `_sass/`: SCSS stylesheets for theming and layout
- `_pages/`: Markdown files for static pages
- `_posts/`: Blog posts in Markdown format
- `_projects/`: Project showcase pages
- `_news/`: News/announcement items
- `_bibliography/`: BibTeX files for publications

### Data Files
- `_data/cv.yml`: CV information in YAML format (fallback)
- `_data/repositories.yml`: GitHub repository configuration
- `_data/socials.yml`: Social media links and contact information
- `assets/json/resume.json`: CV in JSON Resume format (primary)

### Asset Management
- `assets/img/`: Images with automatic WebP conversion and responsive sizing
- `assets/js/`: JavaScript files for interactive features
- `assets/css/`: SCSS entry point for styles
- `assets/pdf/`: PDF documents (papers, CV, etc.)

### Docker Configuration
- `Dockerfile`: Multi-stage build for Jekyll environment
- `docker-compose.yml`: Development environment setup
- `docker-compose-slim.yml`: Lightweight development option
- `bin/entry_point.sh`: Docker container startup script with live reload

### GitHub Actions Workflows
- `deploy.yml`: Automatic deployment to GitHub Pages
- `prettier.yml`: Code formatting checks
- `broken-links.yml`: Link validation
- `lighthouse-badger.yml`: Performance monitoring

## Liquid Template System (Customization Guide)

### Core Layout Templates (`_layouts/`)

#### **default.liquid**
- Master template for entire site structure
- Controls navigation sidebar positioning and responsive behavior
- **Customization**: Modify container classes, table of contents functionality, page redirect behavior

#### **about.liquid** 
- Homepage template with modular sections
- **Key sections**: Profile image, news, latest posts, selected publications, social contacts
- **Customization**: Show/hide sections, modify profile image styling (circular/rounded), adjust layout alignment

#### **post.liquid**
- Blog post template with rich metadata
- **Features**: Date/author display, tags/categories, table of contents, related posts, comments
- **Customization**: Modify metadata layout, customize tag styling, adjust TOC positioning

#### **cv.liquid**
- CV/Resume page supporting multiple data formats
- **Features**: PDF download, structured sections (list, map, timeline, nested)
- **Customization**: Add new section types, modify card styling, customize PDF link appearance

#### **bib.liquid**
- Publication entry template with academic features
- **Features**: Thumbnails, author highlighting, journal info, multiple link types, citation badges
- **Customization**: Modify publication cards, add new link types, customize badge appearance

#### **distill.liquid**
- Scientific article template in Distill.pub style
- **Features**: Academic formatting, author affiliations, enhanced TOC, citations
- **Customization**: Modify article structure, customize author display, adjust styling

### Core Structure Components (`_includes/`)

#### **head.liquid**
- HTML head section managing all CSS/JS dependencies
- **Features**: Bootstrap/MDB integration, dark mode, fonts, third-party libraries, SEO
- **Customization**: Add custom CSS libraries, modify font choices, adjust meta tags

#### **header.liquid**
- Site navigation with responsive behavior
- **Features**: Dynamic navbar, social links, dark mode toggle, search, progress bar
- **Customization**: Modify navigation structure, customize brand display, adjust social media placement

#### **footer.liquid**
- Site footer with metadata
- **Features**: Copyright, newsletter integration, last updated timestamp, impressum link
- **Customization**: Modify copyright text, add footer links, customize newsletter placement

#### **scripts.liquid**
- JavaScript loading and feature initialization
- **Features**: Third-party library management, analytics integration, performance optimization
- **Customization**: Add custom JS libraries, modify loading order, integrate new analytics

### Content Display Components

#### **social.liquid**
- Social media links generator
- **Features**: 40+ platforms including academic (ORCID, Google Scholar), professional (LinkedIn, GitHub)
- **Customization**: Add new social platforms, modify icon styling, create custom link formats

#### **figure.liquid**
- Advanced responsive image display
- **Features**: WebP optimization, zoom functionality, captions, lazy loading, responsive breakpoints
- **Customization**: Modify breakpoints, add image filters, customize caption styling

#### **projects.liquid** / **projects_horizontal.liquid**
- Project showcase with different layouts
- **Features**: Thumbnails, GitHub integration with star counts, hover effects
- **Customization**: Modify card styling, add new project metadata, customize animations

#### **news.liquid**
- News/announcements display
- **Features**: Chronological listing, scrollable container, inline/external news support
- **Customization**: Modify table styling, adjust scrolling behavior, customize date formatting

#### **selected_papers.liquid**
- Curated publications display using Jekyll-Scholar
- **Customization**: Modify publication selection criteria, customize display format

#### **latest_posts.liquid**
- Recent blog posts with external link support
- **Features**: Configurable limits, external link icons, scrollable interface
- **Customization**: Adjust post limits, modify external link styling

### Media Components

#### **video.liquid**
- Video embedding with multiple format support
- **Features**: Local files (MP4, WebM, OGG), external embedding (YouTube, Vimeo), responsive controls
- **Customization**: Add new video formats, modify player controls, adjust responsive behavior

#### **audio.liquid**
- HTML5 audio player integration
- **Customization**: Modify player appearance and controls

### Resume/CV System (`_includes/resume/` and `_includes/cv/`)

#### Resume Components (JSON Resume format)
- **work.liquid**: Employment history with highlights
- **education.liquid**: Academic background
- **projects.liquid**: Project timeline
- **awards.liquid**: Recognition and honors
- **skills.liquid**: Technical and soft skills
- **languages.liquid**: Language proficiencies
- **interests.liquid**: Personal interests
- **certificates.liquid**: Professional certifications
- **publications.liquid**: Academic publications
- **volunteer.liquid**: Volunteer experience
- **references.liquid**: Professional references
- **basics.liquid**: Contact information and summary

#### CV Components (YAML format)
- **time_table.liquid**: Chronological timeline format
- **list.liquid**: Simple list format
- **nested_list.liquid**: Hierarchical structure
- **map.liquid**: Key-value pair display
- **list_groups.liquid**: Grouped items

### Specialized Components

#### **metadata.liquid**
- SEO and social media optimization
- **Features**: OpenGraph tags, Twitter Cards, Schema.org structured data, search engine verification
- **Customization**: Add custom meta tags, modify social previews, adjust SEO parameters

#### Repository Components
- **repo.liquid**: GitHub repository cards with statistics
- **repo_user.liquid**: User profile display
- **repo_trophies.liquid**: Achievement trophies

#### Interactive Components
- **giscus.liquid**: GitHub-based commenting system
- **disqus.liquid**: Disqus commenting integration
- **citation.liquid**: Academic citation formatting
- **newsletter.liquid**: Email subscription widget
- **pagination.liquid**: Blog post pagination
- **related_posts.liquid**: Related content suggestions
- **bib_search.liquid**: Bibliography search functionality

## Key Customization Opportunities

### High-Impact Visual Customizations
1. **Brand Identity**: Modify `header.liquid` for custom navigation, logo, and brand presentation
2. **Homepage Layout**: Customize `about.liquid` to reorder sections, modify profile presentation
3. **Publication Style**: Edit `bib.liquid` for custom publication cards, badges, and metadata display
4. **Project Showcase**: Enhance `projects.liquid` with custom layouts, filtering, and categorization
5. **Color Scheme**: Modify theme colors in `_sass/_themes.scss` and dark mode in `head.liquid`

### Content Organization Enhancements
1. **CV Sections**: Create new resume section types in `_includes/resume/`
2. **Social Media**: Add new platforms to `social.liquid` with custom icons and links
3. **News System**: Customize `news.liquid` for categorization and enhanced display
4. **Blog Structure**: Modify `post.liquid` for custom metadata, tags, and related content
5. **Media Integration**: Extend `figure.liquid` and `video.liquid` for galleries and advanced features

### Performance and SEO
1. **Image Optimization**: Customize responsive breakpoints in `figure.liquid`
2. **Script Loading**: Optimize JavaScript loading in `scripts.liquid`
3. **Metadata**: Enhance `metadata.liquid` for better search engine optimization
4. **CSS Optimization**: Streamline stylesheet loading in `head.liquid`

### Academic-Specific Features
1. **Publication Management**: Enhance `bib.liquid` with custom fields and formatting
2. **Citation System**: Customize `citation.liquid` for different citation styles
3. **Research Showcase**: Create specialized project templates for research presentations
4. **Academic Social**: Add academic platforms to `social.liquid` (ResearchGate, Academia.edu, etc.)

## CV Time Table System - Enhanced Features

### Advanced Skills and Domains Integration
The CV time table template (`_includes/cv/time_table.liquid`) now supports enhanced skills and domains functionality with full mobile responsiveness:

#### Skills Section
- **Desktop**: Vertical skill boxes in left column with wrench icon
- **Mobile**: Horizontal skill boxes with responsive wrapping
- **Features**: Interactive tooltips, custom icons, hover effects, tap support
- **Usage**: Add `skills` array to CV entries with name/description/icon support

#### Domains Section  
- **Location**: Below descriptions in main content area
- **Styling**: Light blue accent theme (#87CEEB) with layer-group icon
- **Features**: Horizontal layout, tooltips, responsive design
- **Usage**: Add `domains` array to CV entries

### Mobile-Responsive Design Revolution
Complete mobile optimization for efficient space usage (75% vertical space reduction):

#### Mobile Header Structure
```
📅 Date Range 📍 Location
👥 With: Collaborators  
🔧 Skills: [Skill1] [Skill2] [Skill3]
```

#### Key Mobile Features
- **Space Efficient**: Horizontal date ranges instead of vertical stacking
- **Icon Integration**: Semantic icons (calendar, location, wrench, users) for better visual hierarchy  
- **Horizontal Layouts**: Skills and dates arrange horizontally with content-adaptive widths
- **Conditional Display**: Icons only appear when content exists
- **Touch Optimized**: Skill tooltips work via tap on mobile devices
- **Content Reordering**: Logical mobile flow (title → context → content)

### CSS Architecture Enhancements
- **Responsive Breakpoints**: Mobile (≤576px), Tablet (≤767px), Desktop (≥768px)
- **Visual Hierarchy**: Improved spacing and typography scales across all screen sizes
- **Interactive Elements**: Enhanced hover states, transitions, and mobile touch interactions
- **Accessibility**: Proper focus states and semantic markup

### Usage Examples

#### Basic CV Entry with Skills and Domains
```yaml
- title: "Senior Developer"
  institution: "TechCorp"
  department: "Engineering"
  start_date: "Jan 2020"
  end_date: "Present"
  location: "San Francisco, CA"
  key_people: "John Doe, Jane Smith"
  skills:
    - name: "Python"
      icon: "fab fa-python"
      description: "Advanced Python development with Django and FastAPI"
    - name: "JavaScript"
      icon: "fab fa-js"
      description: "Modern ES6+ and TypeScript development"
    - "Docker"
  domains:
    - name: "Healthcare"
      description: "Medical technology solutions and HIPAA compliance"
    - "Machine Learning"
    - name: "Fintech"
      description: "Financial technology and payment processing"
  maindescription: "Lead development of scalable applications..."
  description:
    - "Built microservices architecture serving 10M+ requests/day"
    - "Implemented CI/CD pipelines reducing deployment time by 80%"
```

#### Advanced Skills Configuration
```yaml
skills:
  - name: "Python"
    icon: "fab fa-python"
    description: "10+ years experience with Django, FastAPI, pandas, scikit-learn"
  - name: "Cloud Architecture"
    icon: "fas fa-cloud"
    description: "AWS, Docker, Kubernetes, serverless architectures"
  - name: "Machine Learning"
    icon: "fas fa-brain"
    description: "TensorFlow, PyTorch, computer vision, NLP"
```

#### Responsive Behavior
- **Desktop (≥768px)**: Two-column layout with left sidebar for date/location/skills
- **Mobile (≤767px)**: Single-column with integrated header and horizontal skill boxes
- **Tablet (577px-767px)**: Balanced layout optimizing for touch interaction

### Styling Customization

#### Skills Theme (Default)
- **Default State**: Gray borders with subtle shadows
- **Hover Effect**: Theme color background with smooth transitions
- **Mobile**: Compact horizontal boxes with proper touch targets

#### Domains Theme (Light Blue Accent)
- **Primary Color**: Light blue (#87CEEB) borders
- **Accent Color**: Steel blue (#4682B4) for icons and hover states
- **Dark Mode**: Automatic theme adaptation

#### Icon Integration
- **Skills**: Wrench icon (`fa-solid fa-wrench`)
- **Domains**: Layer group icon (`fa-solid fa-layer-group`)
- **Date**: Calendar icon (`fa-solid fa-calendar`)
- **Location**: Location dot icon (`fa-solid fa-location-dot`)
- **Collaborators**: Users icon (`fa-solid fa-users`)

### Performance Optimizations
- **CSS Grid/Flexbox**: Efficient layouts without JavaScript
- **Responsive Images**: Automatic WebP conversion and lazy loading
- **Minimal JavaScript**: Tooltip functionality only where needed
- **Mobile-First**: Progressive enhancement from mobile to desktop

### Accessibility Features
- **Semantic HTML**: Proper heading hierarchy and landmark roles
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Screen Readers**: Descriptive alt texts and ARIA labels
- **Color Contrast**: WCAG AA compliant color combinations
- **Touch Targets**: Minimum 44px touch targets on mobile

## Common Workflows

### Adding New Content
1. **New blog post**: Create `YYYY-MM-DD-title.md` in `_posts/`
2. **New project**: Add markdown file to `_projects/`
3. **New publication**: Add BibTeX entry to `_bibliography/papers.bib`
4. **Update CV**: Modify `assets/json/resume.json` or `_data/cv.yml`

### Theme Customization
1. **Colors**: Edit `_sass/_themes.scss` and `_sass/_variables.scss`
2. **Layout**: Modify files in `_layouts/` and `_includes/`
3. **Functionality**: Add JavaScript to `assets/js/`
4. **Styling**: Update SCSS files in `_sass/`

### Deployment
- Automatic via GitHub Actions on push to main branch
- Manual deployment: Go to Actions → Deploy → Run workflow
- Alternative hosting: Build with `bundle exec jekyll build` and serve `_site/`

## Dependencies and Plugins

### Core Jekyll Plugins
- `jekyll-scholar`: Academic publication management
- `jekyll-imagemagick`: Responsive image processing
- `jekyll-jupyter-notebook`: Notebook integration
- `jekyll-paginate-v2`: Advanced pagination
- `jekyll-archives-v2`: Content archiving

### Development Tools
- Prettier with Liquid plugin for code formatting
- Docker for consistent development environment
- GitHub Actions for CI/CD
- Various linting and quality checks

This template provides extensive customization opportunities while maintaining performance, accessibility, and academic presentation standards. The modular Liquid template system allows for incremental personalization without breaking core functionality.