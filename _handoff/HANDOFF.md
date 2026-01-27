# Elementor Implementation Handoff Guide

This guide explains the complete handoff process for rebuilding prototype designs in Elementor Pro using the self-contained Handoff Portal.

---

## Handoff Portal (Primary Method)

The fastest way to get everything you need is through the **Handoff Portal**:

**URL:** `/pages/handoff/` (append to the deployed prototype URL)

The portal includes:
- Step-by-step implementation instructions
- Downloadable ZIP packages (build pack, assets, full prototype)
- Auto-generated page and section index
- Interactive QA checklist with local persistence
- Screenshot gallery at all breakpoints
- Direct links to enable Overlay Mode on any page

### Accessing the Portal

If the prototype is deployed at `https://example.com/`, the portal is at:
```
https://example.com/pages/handoff/
```

---

## What You'll Find in the Portal

### 1. Downloads Section

Three ZIP packages available for download:

| Package | Contents |
|---------|----------|
| **Elementor Build Pack** | Section specs, design tokens, widget mappings, QA checklist |
| **Assets Package** | All images, icons, fonts, and media files |
| **Full Prototype** | Complete static build for offline reference |

### 2. Page & Section Index

Auto-generated list of all pages with:
- Section names and IDs
- Suggested Elementor widgets per section
- Direct links to view each page with Overlay Mode enabled

### 3. Interactive QA Checklist

Track implementation progress across 8 categories:
- Typography, Spacing, Colors, Responsive
- Hover/Focus States, Animations
- Accessibility, Performance

Checklist state persists locally and can be exported as CSV.

### 4. Screenshot Gallery

Visual reference screenshots at three breakpoints:
- Desktop (1440px)
- Tablet (768px)
- Mobile (375px)

---

## Using Overlay Mode

The prototype includes an interactive overlay for viewing section specs.

### Enable Overlay Mode

Three ways to enable:

1. **Toggle Button:** Click "Show Overlay" (bottom-right corner of any page)
2. **Keyboard Shortcut:** `Cmd/Ctrl + Shift + H`
3. **URL Parameter:** Add `?spec=1` to any page URL

### What You'll See

- Purple outlines around each section
- Section name labels
- "Spec" button on each section to open detailed spec card

### Spec Cards

Click the "Spec" button on any section to see:
- Section name and ID
- Layout properties (display, flex direction, alignment, gap)
- Spacing (padding, margin)
- Typography (font family, size, weight, line height)
- Colors (text, background)
- Effects (border radius, shadows)
- Suggested Elementor widgets

**Actions:**
- **Copy Spec:** Copy full spec as markdown to clipboard
- **Download .md:** Download section spec as markdown file

### Linking to Specific Sections

Use hash URLs to auto-scroll to sections:
```
/pages/index.html?spec=1#hero-001
```

---

## Implementation Process

### Step 1: Setup

1. Open the Handoff Portal
2. Download the **Elementor Build Pack**
3. Review `elementor-map.md` for overview
4. Set up Elementor Global Colors from design tokens
5. Set up Elementor Global Typography from design tokens
6. Enable Flexbox Containers in Elementor settings

### Step 2: Build Each Page

1. Create new page in Elementor
2. Open the prototype page with Overlay Mode (`?spec=1`)
3. Work section-by-section from top to bottom
4. Use "Spec" buttons to get detailed specs
5. Match layout, spacing, typography, and colors

### Step 3: Per-Section Build

For each section:

1. Create Container matching layout type (Flexbox/Grid)
2. Set responsive padding/gaps from spec
3. Add suggested Elementor widgets
4. Apply typography (use Global Typography)
5. Set colors (use Global Colors)
6. Configure backgrounds, borders, shadows
7. Test at all three breakpoints

### Step 4: Validation

Use the QA checklist in the portal to validate:

- [ ] Typography matches exactly
- [ ] Spacing matches at all breakpoints
- [ ] Colors match token values
- [ ] Hover/focus states implemented
- [ ] Responsive behavior mirrors prototype
- [ ] Accessibility requirements met
- [ ] Performance optimized

---

## Elementor Widget Mapping

Reference the `elementor-mapping.rules.json` file (included in build pack) for deterministic mappings.

### Common Patterns

| Prototype Pattern | Elementor Equivalent |
|-------------------|---------------------|
| `display: flex` | Container > Flexbox |
| `display: grid` | Container > Grid |
| `flex-direction: column` | Flexbox > Direction: Column |
| `gap: 2rem` | Gap setting in Container |
| `.btn-primary` | Button widget (Primary style) |
| Accordion | Accordion widget |
| Feature card | Container + Icon Box |
| Sticky header | Motion Effects > Sticky |

### Global Setup

Before building, create these Elementor globals:

**Global Colors:**
- Primary 500: #3b82f6
- Primary 600: #2563eb
- Secondary 500: #8b5cf6
- Neutral 50: #fafafa
- Neutral 900: #171717

**Global Typography:**
- Display XL: 4.5rem, weight 700
- Heading Large: 2.25rem, weight 700
- Body: 1rem, weight 400

---

## Pixel-Perfect Checklist

Use this for final QA:

- [ ] Typography: size, weight, line-height, letter-spacing **exact match**
- [ ] Spacing: padding, margin, gap **exact match at all breakpoints**
- [ ] Colors: **exact hex values** using Global Colors
- [ ] Hover/focus states: **all implemented and functional**
- [ ] Responsive behavior: **mirrors prototype at 375px, 768px, 1440px+**
- [ ] Images: **optimized, properly sized, alt text added**
- [ ] Accessibility: **keyboard nav works, focus visible, ARIA labels**

---

## Common Issues & Solutions

### Spacing doesn't match

- Use px units (not em/rem) for exact values
- Check responsive settings separately at each breakpoint
- Reference the spec card padding/margin values

### Typography looks different

- Verify Global Typography is set up with exact values
- Check font-weight (400 = normal, 600 = semibold, 700 = bold)
- Match line-height exactly

### Colors are off

- Always use Global Colors (don't hardcode hex values)
- Some colors may use opacity - check spec card
- Background gradients need exact angle and color stops

### Responsive layout breaks

- Verify flex direction changes at breakpoints
- Check gap values at each breakpoint
- Use the screenshot gallery for visual reference

---

## Questions or Issues?

1. Use the Overlay Mode spec cards for detailed values
2. Reference `elementor-mapping.rules.json` for widget suggestions
3. Check the screenshot gallery for visual reference
4. Use browser DevTools to inspect prototype if needed
5. Contact the design team with specific section name and issue

---

*This guide is auto-generated with the prototype build. Always use the Handoff Portal for the latest information.*
