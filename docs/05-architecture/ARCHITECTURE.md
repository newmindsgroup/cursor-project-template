# Architecture (Canonical)

## System Context

### What is the System?

The **Cursor Prototype Starter Kit** is a static-site development system for creating high-fidelity website prototypes with automated handoff to WordPress/Elementor developers. It runs entirely client-side with Node.js tooling for development and export workflows.

### System Boundary Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Cursor Prototype Starter Kit                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Source    │    │    Build    │    │   Output    │                 │
│  │   Files     │───▶│   System    │───▶│   Dist      │                 │
│  │ (src/)      │    │   (Vite)    │    │ (dist/)     │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                                      │                        │
│         ▼                                      ▼                        │
│  ┌─────────────┐                      ┌─────────────┐                  │
│  │  Automation │                      │  Handoff    │                  │
│  │  Scripts    │─────────────────────▶│  Package    │                  │
│  │ (scripts/)  │                      │ (_handoff/) │                  │
│  └─────────────┘                      └─────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                    ┌─────────────────┐
│  External APIs  │                    │  Elementor Dev  │
│  (AI, optional) │                    │  (Consumer)     │
└─────────────────┘                    └─────────────────┘
```

### Who/What Integrates with It?

| Actor | Role | Integration Point |
|-------|------|-------------------|
| **Designer** | Primary user | IDE (Cursor), Browser (localhost:5173) |
| **Client** | Reviewer | Browser (preview URL or local build) |
| **Elementor Developer** | Consumer | Handoff package (markdown, JSON, assets) |
| **AI APIs** (optional) | Content generation | OpenAI/Claude via scripts |
| **Static Hosting** | Deployment | Vercel, Netlify (optional) |

---

## Technology Stack

### Frontend (Prototype)

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Build** | Vite | 5.x | Dev server, HMR, production bundling |
| **Language** | TypeScript | 5.x | Type-safe scripting, DOM manipulation |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS, design tokens |
| **Animations** | GSAP | 3.12.x | Scroll animations, transitions |
| **HTML** | Vanilla HTML | - | Semantic markup, no framework |

### Tooling (Development)

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ (20 recommended) | Runtime for scripts and dev server |
| **npm** | 9+ | Package management |
| **ESLint** | 8.x | Code linting |
| **Prettier** | 3.x | Code formatting |
| **PostCSS** | 8.x | CSS processing (Tailwind, Autoprefixer) |

### Automation (Scripts)

| Tool | Purpose |
|------|---------|
| **Node.js ES Modules** | All automation scripts (.mjs) |
| **Playwright** | Screenshots, visual QA |
| **Express** | Wizard server (local only) |
| **Archiver** | ZIP package generation |

### Infrastructure (Optional)

| Tool | Version | Purpose |
|------|---------|---------|
| **Docker** | 20+ | Containerized development |
| **Docker Compose** | v2 | Multi-service orchestration |

---

## Directory Structure

```
website-project-starter-kit/
├── src/                    # Source files (prototype)
│   ├── assets/            # Generated/processed assets
│   ├── components/        # Reusable HTML partials
│   ├── content/           # JSON content (multilingual)
│   ├── data/              # Configuration JSON files
│   ├── pages/             # HTML page entry points
│   ├── scripts/           # TypeScript (browser)
│   ├── sections/          # Page section HTML
│   └── styles/            # CSS (Tailwind imports)
├── scripts/               # Node.js automation (.mjs)
├── public/                # Static assets (copied to dist)
├── dist/                  # Build output
├── _handoff/              # Handoff package output
│   ├── content/           # Exported content files
│   ├── exports/           # Markdown, JSON, ZIP
│   └── assets/            # Screenshots, images
├── business-context/      # Client materials (gitignored)
├── docs/                  # Documentation phases
└── infra/                 # Docker configuration
```

---

## Data Model

### Core Entities

| Entity | Storage | Schema |
|--------|---------|--------|
| **Page** | `src/pages/*.html` | HTML with section includes |
| **Section** | `src/sections/*.html` | Standalone HTML partial |
| **Component** | `src/components/*.html` | Reusable UI element |
| **Content** | `src/content/{lang}/*.json` | Structured content by language |
| **Design Tokens** | `tailwind.config.ts` | Colors, typography, spacing |
| **Page Index** | `_handoff/page-index.json` | Page metadata and status |
| **Project Settings** | `project-settings.json` | Project configuration |

### Key Relationships

```
Page (1) ──contains── (N) Section
Section (1) ──uses── (N) Component
Section (1) ──displays── (1) Content[lang]
Page (1) ──exports-to── (1) HandoffGuide
DesignTokens ──applies-to── (N) Section
```

---

## Data Flow

### Development Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Source  │────▶│  Vite    │────▶│  Browser │────▶│  Review  │
│  Edit    │     │  HMR     │     │  Preview │     │  Approve │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### Handoff Export Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Source  │────▶│  Export  │────▶│  _handoff│────▶│ Elementor│
│  Files   │     │  Scripts │     │  Package │     │  Dev     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │
                      ▼
               ┌──────────┐
               │Screenshots│
               │   JSON    │
               │  Markdown │
               └──────────┘
```

### AI Content Generation Flow (Optional)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Business │────▶│  Parse   │────▶│  AI API  │────▶│  Content │
│ Context  │     │  Upload  │     │  Generate│     │  JSON    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## Integrations

### AI Content APIs (Optional)

- **Purpose**: Generate placeholder content, personas, headlines
- **Direction**: Out (request) → In (response)
- **Auth method**: API key in `project-settings.local.json` or env vars
- **APIs**: OpenAI (GPT-4), Anthropic (Claude)
- **Data shape**: JSON prompts → JSON/text responses

### Static Hosting (Optional)

- **Purpose**: Deploy preview for client review
- **Direction**: Out (deploy)
- **Platforms**: Vercel, Netlify, GitHub Pages
- **Auth method**: CLI token or OAuth

### WordPress/Elementor (Handoff Target)

- **Purpose**: Final implementation destination
- **Direction**: Out (export package consumed by developer)
- **Integration**: Manual (developer reads package, rebuilds in Elementor)
- **Data shape**: Markdown instructions, JSON specs, asset files

---

## Non-functional Requirements Mapping

### Performance

| Requirement | Implementation |
|-------------|----------------|
| Lighthouse 90+ | Optimized Vite build, image compression |
| 60fps animations | GSAP with hardware acceleration |
| Fast dev server | Vite HMR, ES module dev serving |

### Security

| Requirement | Implementation |
|-------------|----------------|
| No secrets in repo | `.gitignore` for `.local` files, env vars |
| Input validation | Sanitized paths in scripts |
| Dependency safety | `npm audit`, regular updates |

### Reliability

| Requirement | Implementation |
|-------------|----------------|
| Build reproducibility | Lock files, pinned dependencies |
| Graceful degradation | Fallbacks for missing sections/content |
| Error recovery | Script error messages, validation checks |

### Observability

| Requirement | Implementation |
|-------------|----------------|
| Build feedback | Console output with colors, progress |
| Export logging | Step-by-step progress in handoff scripts |
| Validation reports | `validate-all.mjs` comprehensive output |

---

## Risks and Trade-offs

### Risk: Handoff Export Accuracy

- **Trade-off**: Automated export vs. manual annotation
- **Mitigation**: Test with real projects, iterate on captured data, overlay validation
- **Status**: Mitigated via comprehensive style extraction at 3 breakpoints

### Risk: Learning Curve for Non-Technical Designers

- **Trade-off**: Code-first approach vs. visual builder
- **Mitigation**: Extensive documentation, examples, focus on HTML/Tailwind simplicity
- **Status**: Documentation complete, wizard UI available

### Risk: Elementor Version Compatibility

- **Trade-off**: Targeting specific Elementor features vs. broad compatibility
- **Mitigation**: Document Elementor Pro requirements, test against current version
- **Status**: Assumption A-003 validated per-project

### Risk: AI API Rate Limits and Costs

- **Trade-off**: Rich AI features vs. API expenses
- **Mitigation**: Caching, rate limiting, optional feature flag
- **Status**: Implemented with caching in `lib/ai-utils.mjs`

---

## Open Questions

See `QUESTIONS.md` for tracked open questions.

