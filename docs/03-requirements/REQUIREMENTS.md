# Requirements (Canonical)

Source inputs: `PROJECT.md`, `SCOPE.md`, discovery findings, and logged decisions/assumptions/questions.

---

## MVP

### REQ-001: Vite Development Environment

- **Name**: Vite Development Environment
- **Description**: Multi-page development environment with hot module replacement, TypeScript support, and build optimization
- **User story**: As a designer, I want a fast local dev environment so that I can iterate on prototypes quickly without page refreshes.
- **Acceptance criteria**:
  - [x] `npm run dev` starts Vite dev server on port 5173
  - [x] Hot module replacement works for HTML, CSS, and TypeScript changes
  - [x] `npm run build` produces optimized static output in `/dist`
  - [x] `npm run preview` serves production build locally
  - [x] Multi-page input configuration supports 10+ page entry points
- **Dependencies**:
  - Vite 5.x
  - TypeScript 5.x
  - Node.js 18+
- **Notes / risks**:
  - ES module compatibility required for config files (resolved via __dirname polyfill)

### REQ-002: Tailwind Design Token System

- **Name**: Tailwind Design Token System
- **Description**: Centralized design tokens in Tailwind config as single source of truth for colors, typography, spacing
- **User story**: As a designer, I want consistent design tokens so that all prototype elements maintain visual coherence.
- **Acceptance criteria**:
  - [x] Custom color palette (primary, secondary, neutral) defined in tailwind.config.ts
  - [x] Typography scale with fluid sizing defined
  - [x] Spacing scale matches Elementor conventions where practical
  - [x] Design tokens exportable for handoff documentation
- **Dependencies**:
  - Tailwind CSS 3.x
  - PostCSS
  - Autoprefixer
- **Notes / risks**:
  - Token naming should map cleanly to Elementor Global Colors/Fonts

### REQ-003: Component/Section Architecture

- **Name**: Reusable Component Architecture
- **Description**: Standalone HTML partials for components and sections that can be composed into pages
- **User story**: As a designer, I want reusable sections so that I can build pages quickly without duplicating code.
- **Acceptance criteria**:
  - [x] `/src/components/` contains reusable UI elements (buttons, cards, navigation)
  - [x] `/src/sections/` contains page sections (hero, features, testimonials, CTA)
  - [x] Sections can be included in pages via build-time injection
  - [x] Each section has consistent structure (container, responsive padding, semantic HTML)
- **Dependencies**:
  - vite-plugin-html for template injection
- **Notes / risks**:
  - Section names must match between HTML files and loader function

### REQ-004: Handoff Overlay System

- **Name**: Handoff Overlay System
- **Description**: Toggleable UI overlay showing section boundaries, spacing values, and design tokens
- **User story**: As a developer, I want to see section boundaries and specs overlaid on the prototype so that I can understand implementation requirements without leaving the browser.
- **Acceptance criteria**:
  - [x] Toggle button activates/deactivates overlay mode
  - [x] Section boundaries highlighted with visual indicators
  - [x] Spacing values displayed on hover
  - [x] Token names (colors, fonts) shown in context
  - [x] Overlay works at all responsive breakpoints
- **Dependencies**:
  - Custom TypeScript overlay controller
- **Notes / risks**:
  - Performance impact should be minimal; overlay elements lazy-loaded

### REQ-005: Handoff Exporter

- **Name**: Handoff Exporter
- **Description**: Automated export of implementation guide, structured JSON, and assets for Elementor developers
- **User story**: As a designer, I want to export a complete handoff package so that developers have everything needed to rebuild in Elementor.
- **Acceptance criteria**:
  - [x] `npm run handoff:export` generates `/handoff/` output
  - [x] Markdown implementation guide with step-by-step instructions
  - [x] JSON data with computed styles at mobile/tablet/desktop breakpoints
  - [x] Page index with section hierarchy and status
  - [x] Asset export (images, icons) organized by page
- **Dependencies**:
  - Node.js scripts in `/scripts/`
  - Playwright for screenshot capture
- **Notes / risks**:
  - Export time scales with number of pages; may need optimization for large sites

### REQ-006: Handoff Portal

- **Name**: Handoff Portal
- **Description**: Self-contained `/handoff` page serving as implementation hub for developers
- **User story**: As a developer, I want a single destination to access all handoff materials so that I don't need to hunt for documentation.
- **Acceptance criteria**:
  - [x] Portal page accessible at `/handoff/` route
  - [x] Download links for exported artifacts (ZIP, markdown, JSON)
  - [x] QA checklist for implementation validation
  - [x] Screenshot gallery organized by page/section
  - [x] Links to overlay mode for each page
- **Dependencies**:
  - REQ-005 (Handoff Exporter)
- **Notes / risks**:
  - Portal must be updated after each export; consider automation

### REQ-007: GSAP Scroll Animations

- **Name**: GSAP Scroll Animations
- **Description**: Scroll-triggered animations for page sections with reduced motion support
- **User story**: As a designer, I want engaging scroll animations so that prototypes feel polished and interactive.
- **Acceptance criteria**:
  - [x] GSAP ScrollTrigger initialized for animated sections
  - [x] Fade-in, slide-up, and stagger animations available
  - [x] Reduced motion media query respected (animations disabled)
  - [x] Animations performant (no jank at 60fps)
- **Dependencies**:
  - GSAP 3.x (Core + ScrollTrigger)
- **Notes / risks**:
  - GSAP Core is free; ensure no paid plugins are required

### REQ-008: Docker Development Environment

- **Name**: Docker Development Environment
- **Description**: Container configuration for consistent development across machines
- **User story**: As a developer, I want to run the project in Docker so that I avoid dependency conflicts and ensure consistency.
- **Acceptance criteria**:
  - [x] Dockerfile based on Node 20 Alpine
  - [x] docker-compose.yml for single-command startup
  - [x] Volume mounts preserve live editing capability
  - [x] Port 5173 exposed for dev server access
- **Dependencies**:
  - Docker 20+
  - Docker Compose v2
- **Notes / risks**:
  - Development-only config; production deployment out of scope

---

## Phase 2

### REQ-P2-001: Multi-language Content Support

- **Name**: Multi-language Content Support
- **Description**: JSON-based content system supporting multiple languages (EN, ES, etc.)
- **User story**: As a designer working on multilingual sites, I want to manage content in multiple languages so that I can prototype localized versions.
- **Acceptance criteria**:
  - [ ] Content JSON files organized by language (`/content/en/`, `/content/es/`)
  - [ ] Language switcher component available
  - [ ] Export includes all language variants
- **Dependencies**:
  - REQ-003 (Component Architecture)
- **Notes / risks**:
  - RTL languages (Arabic, Hebrew) may require additional styling work

### REQ-P2-002: Visual QA Automation

- **Name**: Visual QA Automation
- **Description**: Automated visual regression testing comparing prototype to Elementor build
- **User story**: As a QA tester, I want automated visual comparison so that I can quickly identify discrepancies between prototype and implementation.
- **Acceptance criteria**:
  - [ ] Playwright-based screenshot comparison
  - [ ] Diff highlighting for visual differences
  - [ ] Threshold configuration for acceptable variance
- **Dependencies**:
  - Playwright
  - REQ-005 (Handoff Exporter)
- **Notes / risks**:
  - Requires access to live Elementor build for comparison

---

## Future

### REQ-F-001: AI Content Generation

- **Name**: AI Content Generation
- **Description**: Integration with AI APIs (OpenAI, Claude) for generating placeholder content, personas, and copy
- **User story**: As a designer, I want AI-generated content so that I can prototype with realistic copy without waiting for client materials.
- **Acceptance criteria**:
  - [ ] API integration for content generation
  - [ ] StoryBrand framework-based copy suggestions
  - [ ] Rate limiting and error handling
- **Dependencies**:
  - OpenAI API or Claude API
  - API key management
- **Notes / risks**:
  - API costs scale with usage; implement caching and limits

### REQ-F-002: Figma Plugin Integration

- **Name**: Figma Plugin Integration
- **Description**: Two-way sync between Figma designs and prototype codebase
- **User story**: As a designer, I want to import Figma designs so that I can start prototypes from existing design files.
- **Acceptance criteria**:
  - [ ] Figma API integration for asset import
  - [ ] Style extraction (colors, fonts) from Figma
  - [ ] Component mapping suggestions
- **Dependencies**:
  - Figma API access
- **Notes / risks**:
  - Figma API rate limits; complex nested components may not translate cleanly

---

## Non-functional Requirements

### NFR-001: Performance

- Page load time (Lighthouse Performance score): 90+
- Time to Interactive: <3s on 4G connection
- Animation frame rate: 60fps (no jank)
- Build time: <30s for full production build

### NFR-002: Security

- No secrets in version control (API keys in `.env.local` or `project-settings.local.json`)
- Dependencies scanned for vulnerabilities (`npm audit`)
- File upload size limits enforced (50MB max)
- Input sanitization for user-provided paths

### NFR-003: Privacy/Compliance

- No analytics or tracking in prototype unless explicitly added
- Client business context files excluded from git (`.gitignore`)
- Reference materials not distributed with template

### NFR-004: Observability

- Build errors surface clearly in terminal
- Script failures log actionable error messages
- Export progress reported during handoff generation

### NFR-005: Accessibility

- Semantic HTML structure (landmarks, headings hierarchy)
- Sufficient color contrast (WCAG AA minimum)
- Reduced motion support (`prefers-reduced-motion`)
- Keyboard navigation functional for interactive elements
- Alt text for images (or clear placeholders)

### NFR-006: Browser Support

- Modern evergreen browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- ES6+ JavaScript features (no IE11 support)
- CSS Grid and Flexbox layouts
- No polyfills required for target browsers

---

## Open Questions and Assumptions

- Questions: see `QUESTIONS.md`
- Assumptions: see `ASSUMPTIONS.md`
- Decisions: see `DECISIONS.md`

