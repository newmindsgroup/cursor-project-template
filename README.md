# Cursor Prototype Starter Kit

Modern frontend prototype system with automated Elementor handoff. Build award-winning, interactive website prototypes in Cursor and deliver pixel-perfect implementations to your team.

## Quick Start

### Starting a New Project

This template comes ready with a **clean slate** - no demo content or placeholder text. Just duplicate, install, and run the interactive menu:

```bash
# Duplicate the template
cp -r website-project-starter-kit my-new-project
cd my-new-project

# Install and start the interactive menu
npm install
npm start
```

The interactive menu (`npm start`) provides quick access to:
- **Quick Start Wizard** - Guided setup for new projects
- **Update Project** - Modify existing settings and regenerate content
- **Deploy/Preview** - One-click deployment to Vercel
- **Help & Documentation** - View available commands

Alternatively, run the web-based wizard directly:

```bash
npm run wizard
# Open http://localhost:3001
```

The wizard guides you through:
1. Project setup (name, client, industry)
2. AI provider configuration (OpenAI, Anthropic, or Google AI)
3. Upload business context documents
4. Select pages to generate
5. Generate StoryBrand content using AI
6. Deploy to Vercel (optional)

### Exploring with Demo Content

Want to see the system in action first?

```bash
npm install
npm run demo      # Load demo content
npm run dev       # Preview at http://localhost:5173
npm run reset:all # Return to clean state when done
```

### Local Development (Manual Setup)

```bash
npm install
npm run dev
# Open http://localhost:5173
```

### Docker Development

```bash
docker compose -f infra/docker-compose.yml up
# Open http://localhost:5173
```

## Commands

### Core Commands

- `npm start` - **Interactive menu** for all project operations
- `npm run wizard` - Web-based setup wizard at http://localhost:3001
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build production-ready static site
- `npm run preview` - Preview built site locally
- `npm run help` - Show all available commands

### Development

- `npm run lint` - Lint TypeScript/JavaScript files
- `npm run format` - Format code with Prettier
- `npm run validate` - Run all validation checks

### Handoff

- `npm run handoff:export` - Generate Elementor handoff specs
- `npm run handoff:zips` - Generate downloadable ZIP packages
- `npm run handoff:screenshots` - Capture screenshots at all breakpoints
- `npm run handoff:bundle` - **Full handoff build** (build + export + zips + screenshots)

### Content

- `npm run content:export-csv` - Export content to CSV for translation
- `npm run content:export-md` - Export content to Markdown documentation
- `npm run content:bundle` - Export all content formats

## Creating New Pages

1. Add a new HTML file in `src/pages/` (e.g., `pricing.html`)
2. Update `vite.config.ts` to include the new page in the `input` object
3. Compose sections from `src/sections/` using the dynamic loading pattern
4. Run `npm run dev` to preview

## Creating New Sections

1. Create a new HTML file in `src/sections/` (e.g., `Pricing.html`)
2. Add required data attributes:

```html
<section
  data-section="Pricing"
  data-elementor-widget-suggestion="Heading, Pricing Table, Button"
  data-notes="Elementor: Container > 3-column grid, gap-8, padding-y-24"
  data-tokens='{"padding": "24", "gap": "8"}'
>
  <!-- Section content -->
</section>
```

3. Import the section in your page template
4. Styles automatically apply via Tailwind classes

## Handoff Portal (New!)

The Handoff Portal is a self-contained implementation hub that lives at `/pages/handoff/` on your deployed prototype. It eliminates manual file sharing by providing everything implementers need in one place.

### Accessing the Portal

When deployed at `https://example.com/`:
```
https://example.com/pages/handoff/
```

### Portal Features

- **Downloads:** ZIP packages for build specs, assets, and full prototype
- **Page Index:** Auto-generated list of all pages and sections
- **Interactive QA Checklist:** Track progress with local persistence
- **Screenshot Gallery:** Visual reference at desktop, tablet, and mobile
- **Overlay Links:** Quick access to spec mode for any page

### Generating the Full Handoff

```bash
npm run handoff:bundle
```

This runs all steps: build → export → ZIP generation → screenshots.

**First-time setup for screenshots:**
```bash
npx playwright install chromium
```

## Design System

The Design System page at `/pages/styleguide/` provides a complete visual reference:

- **Colors:** Full primary, secondary, and neutral palettes with hex values
- **Typography:** Type scale with all heading/body sizes and weights
- **Spacing:** Section spacing, gaps, and padding tokens
- **Effects:** Shadows, border radii, gradients, and animations
- **Components:** Buttons, cards, form inputs, icons
- **Sections:** Preview of all 9 section templates

Click any value to copy it to your clipboard. Access from the Handoff Portal navigation.

## Content System (StoryBrand)

The Content System helps generate compelling, conversion-focused content using the StoryBrand framework.

### Content Location

```
src/content/
├── en/           # English content
├── es/           # Spanish content
├── schema/       # JSON validation schema
└── storybrand/   # Framework documentation
```

### Features

- **StoryBrand Framework:** Structured content following Donald Miller's 7-element system
- **Multilingual Support:** JSON files per language with translation exports
- **Content Presentation:** Review page at `/pages/content/` with language switching
- **Export Tools:** CSV and Markdown exports for translation teams

### Generating Content

Use the AI prompt at `.cursor/prompts/storybrand-content.md` to generate content:

1. Provide business context, audience, and brand voice
2. Generate content for all pages in all languages
3. Review in the Content Presentation page
4. Export for translation with `npm run content:bundle`

See [docs/10-content/STORYBRAND_GUIDE.md](docs/10-content/STORYBRAND_GUIDE.md) for full documentation.

## Handoff Overlay

Toggle the overlay to see section boundaries, specs, and widget suggestions:

- **Click** "Show Overlay" button (bottom-right corner)
- **Keyboard shortcut:** `Cmd/Ctrl + Shift + H`
- **URL parameter:** Add `?spec=1` to any page URL

### Overlay Features

- Purple outlines around each section
- Section name labels
- **Spec button** on each section (click to view detailed specs)
- Copy spec to clipboard
- Download section spec as markdown

### Linking to Specific Sections

Use hash URLs to auto-scroll:
```
/pages/index.html?spec=1#hero-001
```

## Generating Handoff Package

After building your prototype and getting client approval:

```bash
npm run handoff:bundle
```

**Output:**

- `/dist/pages/handoff/` - Self-contained portal with all downloads
- `_handoff/elementor-map.md` - Implementation guide
- `_handoff/elementor-map.json` - Structured section data
- `_handoff/page-index.json` - Page/section index
- `_handoff/assets/` - Exported images, icons, fonts

**ZIP Downloads (in portal):**

- `elementor-build-pack.zip` - Specs, tokens, mapping rules, QA checklist
- `assets.zip` - All images, icons, and media
- `prototype-dist.zip` - Complete static build

Send the deployed URL or the entire `/dist` folder to your implementation team.

## Sharing Previews

### Client vs. Implementer Access

| Audience | URL | What They See |
|----------|-----|---------------|
| **Client** | `/pages/index.html` | Prototype only (no handoff UI) |
| **Implementer** | `/pages/handoff/` | Full handoff portal |

The handoff portal is separate from client-facing pages. Clients navigate the prototype normally; implementers access `/pages/handoff/` for specs and downloads.

### Deployment Options

Upload `/dist` folder to:

- Netlify (drag & drop)
- Vercel (`vercel --prod`)
- Cloudflare Pages
- GitHub Pages

Share the main prototype URL with clients, and the `/pages/handoff/` URL with your implementation team.

## Design Tokens

All design tokens are centralized in `tailwind.config.ts`:

- **Colors:** Primary, secondary, neutral palettes
- **Typography:** Font families, sizes, line heights
- **Spacing:** Section padding, gaps, margins
- **Effects:** Shadows, border radius, transitions

Update tokens once and they propagate throughout the prototype and export automatically.

## Project Structure

```
/
├── src/
│   ├── pages/              # HTML entry points (including /handoff/)
│   ├── sections/           # Reusable sections
│   ├── components/         # Atomic components
│   ├── styles/             # Global CSS + tokens
│   ├── scripts/            # TypeScript utilities
│   ├── assets/             # Images, icons, fonts
│   └── data/               # Site config JSON + mapping rules
├── public/                 # Static assets (favicon, robots.txt)
├── _handoff/
│   ├── HANDOFF.md          # Team process guide
│   ├── elementor-map.md    # Generated (gitignored)
│   ├── elementor-map.json  # Generated (gitignored)
│   ├── page-index.json     # Generated (gitignored)
│   └── assets/             # Generated exports
├── scripts/
│   ├── export-handoff.mjs  # Generates specs and page index
│   ├── generate-zips.mjs   # Creates downloadable ZIPs
│   └── take-screenshots.mjs # Captures page screenshots
├── infra/
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                   # Project documentation
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Workflow: Prototype → Handoff → Elementor

1. **Design in Cursor:** Build interactive prototype with HTML/CSS/JS
2. **Client Review:** Share preview link (main prototype URL)
3. **Approval:** Client signs off on design/interactions
4. **Handoff Generation:** Run `npm run handoff:bundle`
5. **Deploy:** Upload `/dist` to static host
6. **Share:** Send `/pages/handoff/` URL to implementation team
7. **Implementation:** Team uses portal downloads, overlay specs, and QA checklist
8. **Validation:** Compare Elementor build to prototype at all breakpoints

See [PROJECT.md](PROJECT.md) for detailed workflow and [_handoff/HANDOFF.md](_handoff/HANDOFF.md) for implementation team instructions.

## Documentation

- **[PROJECT.md](PROJECT.md)** - Kit philosophy and workflow
- **[_handoff/HANDOFF.md](_handoff/HANDOFF.md)** - Elementor implementation process
- **[docs/06-implementation/](docs/06-implementation/)** - Elementor mapping conventions
- **[docs/06-implementation/handoff-portal-guide.md](docs/06-implementation/handoff-portal-guide.md)** - Handoff Portal guide
- **[TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md)** - Original template documentation

## Stack

- **Build System:** Vite 5.x (multi-page architecture)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.x
- **Animations:** GSAP Core
- **Quality:** ESLint, Prettier, TypeScript strict mode
- **Screenshots:** Playwright (optional, for automated screenshots)
- **Archives:** archiver (ZIP generation)

## Advanced Features

### Parallel Content Generation

Generate content 3-4x faster by processing multiple sections simultaneously:

```bash
npm run ai:content:parallel              # Standard parallel mode
npm run ai:content:quality               # With multi-pass refinement
```

### Multi-Pass Quality Refinement

AI scores and refines content until it meets quality thresholds:

```bash
node scripts/generate-section-content.mjs --refine --quality 8
```

### Watch Mode Development

Auto-validate changes as you work with real-time feedback:

```bash
npm run dev:watch                        # Full watch mode
npm run dev:watch:content                # Content files only
```

### Visual Diff QA Tool

Compare screenshots across breakpoints to catch visual regressions:

```bash
npm run visual-diff:baseline             # Capture baseline screenshots
npm run visual-diff:compare              # Compare against baseline
```

### Theme Builder

Visual interface to customize colors, typography, and layout:

- Access at `/pages/wizard/theme/` during development
- Live preview as you adjust settings
- Export CSS variables to apply project-wide

### Animation Presets

24 production-ready GSAP animations using data attributes:

```html
<div data-preset="reveal-up">Fades in from below</div>
<div data-preset="stagger-cards">Children animate in sequence</div>
```

Categories: Reveal, Text, Card, Stagger, Counter, Parallax, Scroll, Hover.

### Smart AI Caching

Responses are cached to avoid redundant API calls:

- Cache stored in `.cache/ai-responses/`
- Automatic 24-hour TTL
- Cache stats displayed after generation

### Real-Time Progress Streaming

Monitor AI generation progress via Server-Sent Events in the wizard UI:

- Live step-by-step progress
- Token usage and cost estimates
- Error reporting with details

See `.cursor/prompts/` for detailed guides on each feature.

## Accessibility & Performance

Built with best practices:

- ✅ Semantic HTML (`nav`, `main`, `section`, `article`, `footer`)
- ✅ ARIA labels on interactive elements
- ✅ Focus visible states
- ✅ Keyboard navigation
- ✅ Reduced motion support
- ✅ WCAG AA color contrast
- ✅ Image optimization and lazy loading
- ✅ Lighthouse-minded defaults

## License

MIT License - See [LICENSE](LICENSE)

