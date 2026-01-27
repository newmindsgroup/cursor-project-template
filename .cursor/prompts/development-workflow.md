# Development Workflow Guide

This guide covers the end-to-end development workflow from project kickoff to launch, including watch mode, visual diff testing, and iterative development.

## Workflow Overview

```
Kickoff → Discovery → Design → Content → Build → QA → Handoff → Launch
```

## Phase 1: Project Kickoff

### 1.1 Initialize Project

```bash
# Start with the interactive menu
npm start

# Or go directly to wizard
npm run wizard
```

### 1.2 Configure AI Provider

Set up your preferred AI provider:
- OpenAI, Anthropic, or Google AI
- Configure in wizard or `project-settings.local.json`

### 1.3 Upload Business Context

Gather and upload client materials:
- Company profiles
- Target audience docs
- Brand guidelines
- Competitor analysis

## Phase 2: Content Generation

### 2.1 Generate StoryBrand Content

```bash
# Standard generation
npm run ai:content

# Faster parallel generation
npm run ai:content:parallel

# Higher quality with refinement
npm run ai:content:quality
```

### 2.2 Review and Refine

1. Preview generated content in browser
2. Use Cursor to request adjustments
3. Regenerate specific sections as needed

## Phase 3: Development with Watch Mode

### Starting Watch Mode

```bash
# Full watch mode - validates all changes
npm run dev:watch

# Content-focused watch mode
npm run dev:watch:content
```

### What Watch Mode Does

1. **File Monitoring**: Watches for changes in:
   - `src/` - Source files
   - `public/` - Static assets
   - `_handoff/` - Handoff content

2. **Auto-Validation**: On file change:
   - Runs content validation
   - Checks HTML structure
   - Validates assets
   - Reports errors immediately

3. **Hot Reload**: Changes reflect instantly in browser

### Watch Mode Output

```
[Watch] Starting development watch mode...
[Watch] Monitoring: src/, public/, _handoff/
[Watch] Server ready at http://localhost:5173

[12:34:56] File changed: src/pages/home/index.html
[12:34:56] Running validation...
[12:34:57] ✓ All checks passed

[12:35:12] File changed: _handoff/content/home.md
[12:35:12] Running content validation...
[12:35:13] ⚠ Warning: Missing alt text in hero section
```

### Stopping Watch Mode

Press `Ctrl+C` to stop gracefully.

## Phase 4: Visual QA with Visual Diff

### Creating Baseline Screenshots

Before making changes, capture baselines:

```bash
npm run visual-diff:baseline
```

This captures screenshots at multiple breakpoints:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### Comparing Changes

After making changes:

```bash
npm run visual-diff:compare
```

### Visual Diff Report

The tool generates:
- Side-by-side comparisons
- Pixel-by-pixel diff highlighting
- Percentage change scores
- HTML report at `visual-diff-report.html`

### Visual Diff Options

```bash
# Compare specific pages
node scripts/visual-diff.mjs --compare --pages home,about

# Custom threshold (0-100, default 5%)
node scripts/visual-diff.mjs --compare --threshold 10

# Update baseline after intentional changes
npm run visual-diff:baseline
```

## Phase 5: Iterative Development

### Recommended Loop

1. **Make Changes**: Edit HTML, CSS, or content
2. **Watch Mode Validates**: Auto-checks on save
3. **Visual Diff**: Compare before/after
4. **Commit**: When satisfied with changes

### Using Cursor for Changes

Ask Cursor to:
- "Update the hero headline to be more compelling"
- "Add a testimonials section to the about page"
- "Change the primary color to blue"
- "Fix the mobile navigation"

### Content Regeneration

If content needs significant changes:

```bash
# Regenerate specific section
node scripts/generate-section-content.mjs --section hero --apply

# Regenerate entire page
node scripts/generate-section-content.mjs --page about --apply
```

## Phase 6: Validation

### Run All Validations

```bash
npm run validate
```

Checks:
- HTML structure and semantics
- Content completeness
- Asset availability
- Accessibility basics
- Link integrity

### Specific Validations

```bash
npm run validate:content  # Content only
npm run validate:assets   # Assets only
npm run validate:html     # HTML only
```

### AI-Powered QA

```bash
npm run ai:qa  # Accessibility + SEO + Visual QA
```

## Phase 7: Handoff

### Generate Handoff Package

```bash
npm run handoff:bundle
```

Creates:
- Markdown content files
- JSON structured data
- Asset ZIP files
- Page screenshots
- Implementation notes

### Preview Handoff

```bash
npm run dev
# Navigate to /pages/client/
```

## Phase 8: Deployment

### Deploy to Vercel

```bash
# Production deployment
npm run deploy

# Preview deployment
npm run deploy:preview
```

### Pre-Deployment Checklist

1. ✓ All validations pass
2. ✓ Visual diff shows expected changes only
3. ✓ Content is client-approved
4. ✓ Assets are optimized
5. ✓ Meta tags are complete

## Integration Tips

### Combining Tools

```bash
# Development session workflow
npm run dev:watch &       # Start watch mode in background
npm run visual-diff:baseline  # Capture starting state
# ... make changes ...
npm run visual-diff:compare   # Check visual changes
npm run validate              # Final validation
```

### Script Chaining

```bash
# Full generation + validation
npm run ai:content:quality && npm run validate
```

## Best Practices

### Watch Mode
- Keep it running during active development
- Pay attention to validation warnings
- Fix issues immediately when detected

### Visual Diff
- Create baselines before major changes
- Review diffs carefully before committing
- Update baselines only for intentional changes

### Content Generation
- Start with parallel mode for speed
- Use quality mode for client-facing copy
- Iterate on specific sections, not entire pages

### Version Control
- Commit after each logical change
- Include validation status in commit messages
- Tag releases before major deploys

## Related Prompts

- `@wizard-usage.md` - Project setup
- `@advanced-ai-features.md` - AI generation details
- `@theme-builder-guide.md` - Visual customization
- `@animation-presets-guide.md` - Adding animations
