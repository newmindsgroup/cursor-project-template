# Automation Workflows

This document catalogs all automation scripts available in the Cursor Prototype Starter Kit.

---

## Quick Reference

| Command | Description | Category |
|---------|-------------|----------|
| `npm start` | Interactive menu for all operations | Core |
| `npm run dev` | Start Vite development server | Development |
| `npm run build` | Production build | Development |
| `npm run wizard` | Launch setup wizard UI | Setup |
| `npm run generate:all` | Full AI generation pipeline | AI Generation |
| `npm run handoff:export` | Export handoff package | Export |
| `npm run validate:all` | Run all validation checks | QA |

---

## Workflow Categories

### 1. Core Development Workflows

#### Interactive Start Menu
```bash
npm start
# or
node scripts/start.mjs
```
- **Purpose**: Single entry point for all project operations
- **UI**: Interactive terminal menu with numbered options
- **Options**: Development, Generation, Export, Validation, Deployment

#### Development Server
```bash
npm run dev
```
- **Purpose**: Start Vite dev server with hot reload
- **Output**: Browser opens at http://localhost:5173
- **Features**: HMR for HTML/CSS/TypeScript

#### Production Build
```bash
npm run build
```
- **Purpose**: Create optimized production bundle
- **Output**: `/dist/` directory
- **Steps**: TypeScript compile → Vite build → Asset optimization

---

### 2. Project Setup Workflows

#### Initialize Project
```bash
node scripts/init-project.mjs
```
- **Purpose**: Set up a new project from template
- **Inputs**: Project name, client info
- **Outputs**: Updated `project-settings.json`, initialized directories

#### Setup Wizard Server
```bash
npm run wizard
# or
node scripts/wizard-server.mjs
```
- **Purpose**: Web-based setup wizard for non-technical users
- **URL**: http://localhost:3001
- **Features**: Upload business context, configure project settings

#### Demo Mode Setup/Reset
```bash
node scripts/setup-demo.mjs  # Initialize with demo content
node scripts/reset-demo.mjs  # Reset to clean state
```
- **Purpose**: Prepare project for demonstrations
- **Outputs**: Demo content, sample pages, placeholder assets

---

### 3. AI Content Generation Workflows

#### Full Generation Pipeline
```bash
npm run generate:all
# or
node scripts/generate-all.mjs [options]

# Options:
#   --pages=home,about     Specific pages only
#   --skip=images          Skip specific steps
#   --only=content         Run only one step
#   --json                 Output progress as JSON
```
- **Purpose**: Complete AI-powered content generation
- **Pipeline Steps**:
  1. Parse business context uploads
  2. Analyze business context
  3. Generate personas
  4. Generate brand colors
  5. Generate section content
  6. Generate placeholder images
  7. Apply theme
- **Dependencies**: OpenAI or Claude API key required

#### Individual Generation Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `analyze-business-context.mjs` | `npm run generate:analyze` | Extract insights from uploads |
| `generate-personas.mjs` | `npm run generate:personas` | Create user/buyer personas |
| `generate-brand-colors.mjs` | `npm run generate:colors` | Suggest brand color palette |
| `generate-section-content.mjs` | `npm run generate:content` | Generate page section copy |
| `generate-images.mjs` | `npm run generate:images` | Generate placeholder images |
| `generate-placeholders.mjs` | - | Create placeholder image files |
| `apply-theme.mjs` | `npm run generate:theme` | Apply brand to Tailwind config |

#### Content Operations

| Script | Purpose |
|--------|---------|
| `parse-uploads.mjs` | Extract text from PDF, DOCX, images |
| `import-content.mjs` | Import content from external sources |
| `translate-content.mjs` | Translate content to other languages |
| `optimize-headlines.mjs` | AI-optimize headlines for conversion |
| `optimize-seo.mjs` | Generate SEO metadata |

---

### 4. Export Workflows

#### Handoff Package Export
```bash
npm run handoff:export
# or
node scripts/export-handoff.mjs
```
- **Purpose**: Generate complete Elementor implementation package
- **Outputs**:
  - `_handoff/exports/implementation-guide.md`
  - `_handoff/exports/elementor-map.json`
  - `_handoff/page-index.json`
  - `_handoff/assets/` (screenshots)

#### Content Export Formats

| Script | Output Format | Purpose |
|--------|---------------|---------|
| `export-content-md.mjs` | Markdown | Human-readable content |
| `export-content-csv.mjs` | CSV | Spreadsheet import |
| `export-tokens.mjs` | JSON | Design token export |

#### Sitemap Export

| Script | Output | Purpose |
|--------|--------|---------|
| `export-sitemap-json.mjs` | JSON | Structured sitemap |
| `export-sitemap-xml.mjs` | XML | SEO sitemap |
| `export-sitemap-guide.mjs` | Markdown | Page documentation |
| `export-sitemap-wp-cli.mjs` | Shell script | WordPress CLI commands |

#### Asset Export
```bash
node scripts/take-screenshots.mjs  # Capture page screenshots
node scripts/generate-zips.mjs     # Create downloadable ZIPs
```

---

### 5. Validation Workflows

#### Full Validation Suite
```bash
npm run validate:all
# or
node scripts/validate-all.mjs
```
- **Purpose**: Run all quality checks
- **Checks**: Build, Linting, Types, Links, Accessibility

#### Individual Validation Scripts

| Script | Command | Checks |
|--------|---------|--------|
| `validate-build.mjs` | `npm run validate:build` | Build success, output files |
| `check-accessibility.mjs` | `npm run check:accessibility` | WCAG compliance |
| `check-gaps.mjs` | - | Missing content/sections |
| `visual-qa.mjs` | `npm run visual-qa` | Screenshot comparison |
| `audit-performance.mjs` | - | Lighthouse scores |

---

### 6. Deployment Workflows

#### Deploy to Static Hosting
```bash
node scripts/deploy.mjs [platform]

# Platforms: vercel, netlify, github-pages
```
- **Purpose**: Deploy built site to hosting platform
- **Prerequisites**: Platform CLI installed, authenticated

#### Vercel-Specific
```bash
node scripts/setup-vercel.mjs   # Configure Vercel project
node scripts/deploy-vercel.mjs  # Deploy to Vercel
```

#### GitHub Pages
```bash
node scripts/setup-github.mjs  # Configure GitHub Pages
```

---

### 7. Utility Workflows

#### Project Status
```bash
node scripts/scan-progress.mjs  # Scan project completion status
node scripts/build-report.mjs   # Generate project report
```

#### Settings Management
```bash
node scripts/manage-settings.mjs
```
- **Purpose**: View/edit project settings
- **Interactive**: Menu-driven interface

#### Help
```bash
npm run help
# or
node scripts/help.mjs
```
- **Purpose**: Display all available commands

---

## Pipeline Flow Diagrams

### Content Generation Pipeline

```
┌─────────────────┐
│  Business       │
│  Context        │
│  Uploads        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  parse-uploads  │──▶ Extracted text
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  analyze-       │──▶ Business insights
│  business-      │
│  context        │
└────────┬────────┘
         │
    ┌────┴────┬─────────┐
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│Personas│ │Colors │ │Content│
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    └────┬────┴─────────┘
         │
         ▼
┌─────────────────┐
│  apply-theme    │──▶ Tailwind config updated
└─────────────────┘
```

### Handoff Export Pipeline

```
┌─────────────────┐
│  Source Files   │
│  (src/)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build          │──▶ dist/
│  (vite build)   │
└────────┬────────┘
         │
    ┌────┴────────────────┐
    ▼                     ▼
┌───────────────┐  ┌───────────────┐
│  Screenshots  │  │  Style        │
│  (Playwright) │  │  Extraction   │
└───────┬───────┘  └───────┬───────┘
        │                  │
        └────────┬─────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Package        │
        │  Generation     │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌───────┐   ┌───────┐   ┌───────┐
│  MD   │   │  JSON │   │  ZIP  │
│ Guide │   │  Data │   │Package│
└───────┘   └───────┘   └───────┘
```

---

## Error Handling

### Common Error Scenarios

| Error | Cause | Resolution |
|-------|-------|------------|
| `API key not found` | Missing API key | Add to `project-settings.local.json` or env |
| `Build failed` | TypeScript errors | Run `npm run lint`, fix errors |
| `Export failed` | Missing dist/ | Run `npm run build` first |
| `Playwright not installed` | Missing browser | Run `npx playwright install` |

### Script Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Missing dependencies |
| 3 | Configuration error |

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API access | For AI generation |
| `ANTHROPIC_API_KEY` | Claude API access | Alternative to OpenAI |
| `VERCEL_TOKEN` | Vercel deployment | For Vercel deploy |
| `GITHUB_TOKEN` | GitHub API access | For GitHub Pages |

---

## Monitoring and Logging

- **Console Output**: All scripts use colored output for status
- **Progress Indicators**: Long-running scripts show progress bars
- **JSON Output**: Use `--json` flag for machine-readable output
- **Log Files**: Validation results written to `_handoff/exports/`

---

## 8. Development Watch Mode

### Watch Mode Server
```bash
npm run dev:watch
# or
node scripts/dev-watch.mjs [options]

# Options:
#   --content         Watch content files only
#   --no-validate     Skip validation on change
```
- **Purpose**: Auto-validate changes during development
- **Monitors**: `src/`, `public/`, `_handoff/`
- **Features**:
  - Debounced file change detection
  - Auto-runs validation on save
  - WebSocket notifications to browser
  - Graceful shutdown handling

### Watch Mode Output
```
[Watch] Starting development watch mode...
[Watch] Monitoring: src/, public/, _handoff/
[Watch] Server ready at http://localhost:5173

[12:34:56] File changed: src/pages/home/index.html
[12:34:56] Running validation...
[12:34:57] ✓ All checks passed
```

---

## 9. Advanced AI Content Generation

### Parallel Content Generation
```bash
npm run ai:content:parallel
# or
node scripts/generate-section-content.mjs --parallel [options]

# Options:
#   --concurrency N   Process N sections simultaneously (default: 3)
#   --page name       Generate for specific page only
```
- **Purpose**: 3-4x faster content generation
- **How it works**: Sections grouped into batches, processed simultaneously
- **Best practice**: Concurrency 3 for most API providers, 5 for higher limits

### Multi-Pass Quality Refinement
```bash
npm run ai:content:quality
# or
node scripts/generate-section-content.mjs --refine [options]

# Options:
#   --quality N       Quality threshold 1-10 (default: 7)
```
- **Purpose**: Automatically refine content until quality threshold met
- **Scoring**: Clarity, persuasiveness, specificity, tone
- **Max passes**: 3 refinement iterations

### Smart Caching
- **Location**: `.cache/ai-responses/`
- **TTL**: 24 hours by default
- **Cache key**: Hash of prompt + model + temperature
- **Stats displayed**: Hits, misses, estimated savings

### Real-Time Progress Streaming
- **Protocol**: Server-Sent Events (SSE)
- **URL**: `/api/progress` on wizard server
- **Data includes**: Step name, status, elapsed time, tokens, cost

---

## 10. Visual QA Tools

### Visual Diff Tool
```bash
npm run visual-diff
# or
node scripts/visual-diff.mjs [options]

# Options:
#   --baseline        Create baseline screenshots
#   --compare         Compare against baseline
#   --pages p1,p2     Specific pages only
#   --threshold N     Diff threshold percentage (default: 5)
```
- **Purpose**: Detect visual regressions across breakpoints
- **Breakpoints**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Output**: HTML report with side-by-side comparisons

### Visual Diff Workflow

```
┌─────────────────┐
│  Before Changes │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create         │──▶ .visual-diff/baseline/
│  Baseline       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Make Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Compare        │──▶ .visual-diff/current/
│  Screenshots    │──▶ .visual-diff/diff/
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Review Report  │──▶ visual-diff-report.html
└─────────────────┘
```

### Visual QA Commands

| Command | Purpose |
|---------|---------|
| `npm run visual-diff:baseline` | Capture baseline screenshots |
| `npm run visual-diff:compare` | Compare current state to baseline |
| `npm run visual-diff` | Interactive mode (prompts for action) |

---

## 11. Theme Builder Workflow

### Accessing Theme Builder
```bash
npm run dev
# Navigate to http://localhost:5173/pages/wizard/theme/
```

### Theme Builder Features
- **Color palette**: Primary, secondary, accent with auto-generated shades
- **Typography**: Heading and body font selection from Google Fonts
- **Layout**: Border radius and spacing scale controls
- **Live preview**: Changes reflected in real-time
- **Export**: CSS variables and theme JSON

### Applying Exported Theme
1. Export CSS variables from theme builder
2. Paste into `src/styles/design-tokens.css`
3. Run `npm run dev` to see changes

---

## 12. Animation Presets

### Available Presets (24 total)

| Category | Presets |
|----------|---------|
| Reveal | `reveal-up`, `reveal-down`, `reveal-left`, `reveal-right`, `reveal-scale`, `reveal-rotate` |
| Text | `text-split`, `text-blur`, `text-typewriter` |
| Card | `card-flip`, `card-lift`, `card-slide` |
| Stagger | `stagger-cards`, `stagger-list`, `stagger-grid`, `stagger-wave` |
| Counter | `counter`, `counter-fast` |
| Parallax | `parallax-slow`, `parallax-fast`, `parallax-depth` |
| Scroll | `scroll-progress`, `scroll-reveal` |
| Hover | `hover-lift`, `hover-scale`, `hover-glow`, `click-pulse` |

### Usage
```html
<div data-preset="reveal-up">Content fades in from below</div>
<div data-preset="stagger-cards" data-stagger="0.15">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
</div>
```

### Customization
- `data-delay="0.2"` - Delay before animation
- `data-duration="1.5"` - Animation duration
- `data-stagger="0.1"` - Interval between staggered items

