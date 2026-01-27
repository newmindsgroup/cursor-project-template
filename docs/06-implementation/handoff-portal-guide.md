# Handoff Portal Guide

This guide explains how to use the self-contained Handoff Portal for Elementor implementation.

---

## What is the Handoff Portal?

The Handoff Portal is a dedicated page built into your prototype that provides everything Elementor developers need to rebuild the design accurately. It eliminates manual file sharing by hosting all documentation, downloads, and tools in one place.

**Key Benefits:**

- **One URL** - Share the portal link instead of emailing ZIP files
- **Self-contained** - Works on any static host (Netlify, Vercel, etc.)
- **Auto-generated** - Updates automatically with each `handoff:bundle` build
- **Interactive** - QA checklist persists locally, overlay provides live specs

---

## Accessing the Portal

### URL Structure

If your prototype is deployed at `https://example.com/`, the portal is at:

```
https://example.com/pages/handoff/
```

### Local Development

During development, access at:

```
http://localhost:5173/pages/handoff/
```

### Important

The portal is **not linked** from the main prototype navigation. This is intentional - it separates client-facing content from implementer tools.

---

## Portal Sections

### 1. Start Here

Overview of the implementation process:
- Three-step workflow diagram
- Quick links to all portal features
- Important notes about client vs. implementer access

### 2. Overlay Mode

Instructions for using the interactive overlay:
- Three methods to enable (button, keyboard, URL parameter)
- What you'll see when overlay is active
- Quick link to open any page with overlay enabled

### 3. Downloads

Three downloadable ZIP packages:

| Package | Contents | Use Case |
|---------|----------|----------|
| **Elementor Build Pack** | Specs, tokens, mapping rules, QA checklist | Primary implementation guide |
| **Assets Package** | Images, icons, fonts, media | Import into WordPress media library |
| **Full Prototype** | Complete static build | Offline reference |

### 4. Page & Section Index

Auto-generated list showing:
- All pages in the prototype
- All sections on each page
- Suggested Elementor widgets per section
- Direct links to view sections with overlay enabled

### 5. QA Checklist

Interactive checklist with 8 categories:
- Typography, Spacing, Colors, Responsive
- Hover/Focus States, Animations
- Accessibility, Performance

**Features:**
- Progress indicator (e.g., "12/24 complete")
- Persists to localStorage (refreshes don't reset)
- Export as CSV
- Reset button

### 6. Screenshot Gallery

Visual reference images at three breakpoints:
- Desktop (1440px)
- Tablet (768px)
- Mobile (375px)

Click any screenshot to enlarge in lightbox.

### 7. Implementation Notes

Quick reference for:
- Elementor setup requirements
- Responsive approach
- Common issues and solutions

---

## Using the Overlay

The overlay is your primary tool for getting section specs.

### Enable Overlay

Three methods:

1. **Button:** Click "Show Overlay" (bottom-right of any page)
2. **Keyboard:** `Cmd/Ctrl + Shift + H`
3. **URL:** Add `?spec=1` to any page URL

### What You See

When overlay is active:
- Purple border around each section
- Section name label (top-left)
- "Spec" button (top-right)

### Spec Cards

Click the "Spec" button on any section to see:

**Header:**
- Section name
- Section ID (for linking)

**Body:**
- Implementation notes
- Suggested Elementor widgets
- Layout (display, flex direction, alignment, gap)
- Spacing (padding, margin)
- Typography (font family, size, weight, line height)
- Colors (text, background)
- Effects (border radius, shadow)
- Design tokens

**Actions:**
- **Copy Spec** - Copy as markdown to clipboard
- **Download .md** - Download as markdown file

### Deep Linking

Link directly to a section with overlay enabled:

```
/pages/index.html?spec=1#hero-001
```

This opens the page, enables overlay, and scrolls to the section.

---

## Generating the Portal

### Full Build

Run the complete handoff build:

```bash
npm run handoff:bundle
```

This runs:
1. `npm run build` - Build prototype
2. `npm run handoff:export` - Generate specs and page index
3. `npm run handoff:zips` - Create ZIP downloads
4. `npm run handoff:screenshots` - Capture screenshots

### Prerequisites for Screenshots

Screenshots require Playwright browsers:

```bash
npx playwright install chromium
```

If not installed, the build continues without screenshots (with a notice).

### Individual Commands

Run steps separately if needed:

```bash
npm run build              # Build prototype
npm run handoff:export     # Generate specs only
npm run handoff:zips       # Generate ZIPs only
npm run handoff:screenshots # Screenshots only
```

---

## Output Files

### In `_handoff/`

| File | Description |
|------|-------------|
| `elementor-map.md` | Human-readable implementation guide |
| `elementor-map.json` | Structured spec data |
| `page-index.json` | Page/section index for portal |
| `assets/` | Exported images and media |

### In `dist/pages/handoff/`

| Path | Description |
|------|-------------|
| `index.html` | Portal page |
| `downloads/` | ZIP files |
| `screenshots/` | Page screenshots |
| `page-index.json` | Index for portal JavaScript |

---

## Deployment

### Static Hosts

Deploy the entire `/dist` folder to any static host:

- **Netlify:** Drag and drop `/dist` folder
- **Vercel:** `vercel --prod` (configure public directory)
- **Cloudflare Pages:** Connect repo, set build output to `dist`
- **GitHub Pages:** Push `/dist` contents to `gh-pages` branch

### Share URLs

After deployment:

| Purpose | URL to Share |
|---------|--------------|
| **Client review** | `https://yoursite.com/pages/index.html` |
| **Implementation team** | `https://yoursite.com/pages/handoff/` |

---

## Troubleshooting

### Portal shows "Loading..."

The page index might not be generated. Run:

```bash
npm run handoff:export
```

### Downloads 404

ZIP files not generated. Run:

```bash
npm run handoff:zips
```

### No screenshots

Playwright may not be installed. Run:

```bash
npx playwright install chromium
npm run handoff:screenshots
```

### QA checklist reset unexpectedly

LocalStorage may have been cleared. The checklist persists per-domain. Exporting as CSV before clearing browser data is recommended.

### Section not linking correctly

Ensure the section has either:
- An explicit `id` attribute, or
- A `data-section` attribute (overlay auto-generates IDs)

---

## FAQ

### Can clients accidentally see the portal?

The portal is not linked from the main navigation. Clients would need to manually navigate to `/pages/handoff/` to find it.

### Does the portal work offline?

Yes. Download the `prototype-dist.zip`, extract it, and open `/pages/handoff/index.html` in a browser. Most features work locally (except QA checklist export which needs clipboard API).

### Can I customize the portal?

Yes. Edit `src/pages/handoff/index.html` and `src/scripts/handoff-portal.ts`. Changes will be included in the next build.

### How do I update specs after design changes?

Re-run `npm run handoff:bundle`. All specs, ZIPs, and screenshots regenerate automatically.

---

*This guide is part of the Cursor Prototype Starter Kit documentation.*
