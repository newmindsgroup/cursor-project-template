# Design Enforcement Protocol

## Purpose

This is the **mandatory design enforcement protocol** that must be followed when generating, modifying, or reviewing ANY section, page, or component. It ensures perfect spacing, alignment, and Golden Ratio compliance across all designs.

## When to Use

- **ALWAYS** before generating any HTML section or page
- **ALWAYS** when modifying existing section templates
- **ALWAYS** during design reviews
- **ALWAYS** when creating new components

---

## Pre-Flight Checklist

Before generating ANY design code, verify these requirements will be met:

### 1. Section Padding (MANDATORY)

Every `<section>` or `<footer>` element MUST have vertical padding:

| Section Type | Required Classes | Min Padding |
|-------------|------------------|-------------|
| Standard | `py-16 md:py-20 lg:py-24` | 64px/80px/96px |
| Compact | `py-12 md:py-16 lg:py-20` | 48px/64px/80px |
| Hero/CTA | `py-20 md:py-32 lg:py-40` | 80px/128px/160px |
| Footer | `py-16 md:py-20 lg:py-24` | 64px/80px/96px |

```html
<!-- CORRECT -->
<section class="py-16 md:py-20 lg:py-24 bg-white">

<!-- WRONG - No padding -->
<section class="bg-white">
```

### 2. Container Padding (MANDATORY)

Every container MUST have horizontal padding to prevent edge-touching:

| Breakpoint | Required Class | Min Padding |
|------------|----------------|-------------|
| Mobile | `px-8` | 32px |
| Tablet | `md:px-12` | 48px |
| Desktop | `lg:px-16` | 64px |

```html
<!-- CORRECT -->
<div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">

<!-- WRONG - Insufficient padding -->
<div class="max-w-7xl mx-auto px-4">

<!-- WRONG - No padding -->
<div class="max-w-7xl mx-auto">
```

### 3. Max Width (MANDATORY)

All containers MUST have a max-width constraint:

| Type | Class | Use Case |
|------|-------|----------|
| Standard | `max-w-7xl` | Most sections |
| Narrow | `max-w-5xl` | Text-focused content |
| Content | `max-w-3xl` | Reading content |

```html
<!-- CORRECT -->
<div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">

<!-- WRONG - No max-width -->
<div class="mx-auto px-8">
```

### 4. Typography Hierarchy

Headings MUST follow the established hierarchy:

| Level | Classes |
|-------|---------|
| Display | `text-5xl md:text-6xl lg:text-7xl` |
| H1 | `text-5xl md:text-6xl lg:text-7xl` |
| H2 | `text-4xl md:text-5xl` |
| H3 | `text-3xl md:text-4xl` |
| H4 | `text-2xl md:text-3xl` |
| Body Large | `text-xl` |
| Body | `text-base` |

---

## Standard Section Template

Use this template as the base for ALL new sections:

```html
<section
  class="py-16 md:py-20 lg:py-24 bg-{background}"
  data-section="{SectionName}"
>
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
    <!-- Section header -->
    <div class="max-w-3xl mx-auto text-center mb-12 md:mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
        {Headline}
      </h2>
      <p class="text-xl text-neutral-600">
        {Subheadline}
      </p>
    </div>
    
    <!-- Section content -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      <!-- Content items -->
    </div>
  </div>
</section>
```

---

## Golden Ratio Application

When maximum visual harmony is required, apply Golden Ratio principles:

### Layout Splits

```html
<!-- Golden ratio two-column layout -->
<div class="grid grid-cols-1 lg:grid-cols-[38.2%_61.8%] gap-8 lg:gap-12">
  <div><!-- Minor content (38.2%) --></div>
  <div><!-- Major content (61.8%) --></div>
</div>

<!-- Reverse golden ratio -->
<div class="grid grid-cols-1 lg:grid-cols-[61.8%_38.2%] gap-8 lg:gap-12">
  <div><!-- Major content (61.8%) --></div>
  <div><!-- Minor content (38.2%) --></div>
</div>
```

### Aspect Ratios

```html
<!-- Golden ratio landscape image -->
<div class="aspect-[1.618/1] overflow-hidden rounded-2xl">
  <img src="..." class="w-full h-full object-cover">
</div>

<!-- Golden ratio portrait -->
<div class="aspect-[1/1.618] overflow-hidden rounded-2xl">
  <img src="..." class="w-full h-full object-cover">
</div>
```

### Typography Scale

| Step | Size | Calculation |
|------|------|-------------|
| -2 | 0.618rem (~10px) | base / φ |
| -1 | 0.764rem (~12px) | base / φ^0.5 |
| 0 | 1rem (16px) | base |
| +1 | 1.618rem (~26px) | base × φ |
| +2 | 2.618rem (~42px) | base × φ² |
| +3 | 4.236rem (~68px) | base × φ³ |

---

## Validation Checklist

Before finalizing ANY design, verify:

```
□ Section has vertical padding (py-16+ or equivalent)
□ Container has horizontal padding (px-8+ or equivalent)
□ Container has max-width constraint
□ Content does NOT touch viewport edges
□ Typography follows hierarchy
□ Grid gaps are consistent (gap-8 minimum)
□ Cards have proper padding (p-8 minimum)
□ Responsive classes are applied (mobile-first)
```

---

## Responsive Breakpoint Validation (MANDATORY)

**ALL designs MUST look perfect at every breakpoint.** This is non-negotiable.

### Breakpoint Definitions

| Breakpoint | Width | Tailwind Prefix | Primary Use |
|------------|-------|-----------------|-------------|
| Mobile | < 768px | (none) | Base styles, stacked layouts |
| Tablet | 768px - 1023px | `md:` | 2-column grids, increased padding |
| Desktop | 1024px+ | `lg:` | Full layouts, maximum padding |
| Wide | 1280px+ | `xl:` | Extra-wide layouts (optional) |

### Mobile-First Approach (REQUIRED)

Always start with mobile styles, then progressively enhance:

```html
<!-- CORRECT: Mobile-first -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">

<!-- WRONG: Desktop-first (breaks on mobile) -->
<div class="grid grid-cols-3 gap-12">
```

---

### Per-Breakpoint Checklist

#### Mobile (< 768px)

```
□ Section padding: py-16 (64px minimum)
□ Container padding: px-8 (32px minimum)
□ Grids: Single column (grid-cols-1)
□ Golden ratio splits: Stacked vertically
□ Typography: H1 = text-4xl or text-5xl maximum
□ Images: Full width, maintain aspect ratio
□ Touch targets: Minimum 44px × 44px
□ Content: No horizontal scrolling
```

#### Tablet (768px - 1023px)

```
□ Section padding: md:py-20 (80px minimum)
□ Container padding: md:px-12 (48px minimum)
□ Grids: 2 columns (md:grid-cols-2)
□ Golden ratio splits: Can show 61.8%/38.2% OR remain stacked
□ Typography: H1 = md:text-5xl or md:text-6xl
□ Cards: May show 2 per row
□ Navigation: Can expand to horizontal
```

#### Desktop (1024px+)

```
□ Section padding: lg:py-24 (96px minimum)
□ Container padding: lg:px-16 (64px minimum)
□ Grids: Full columns (lg:grid-cols-3 or lg:grid-cols-4)
□ Golden ratio splits: lg:grid-cols-[61.8%_38.2%]
□ Typography: H1 = lg:text-6xl or lg:text-7xl
□ Grid gaps: lg:gap-12 (48px)
□ Two-column layouts: Show side-by-side
```

---

### Responsive Pattern Templates

#### Responsive Section

```html
<section class="py-16 md:py-20 lg:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
    <!-- Content -->
  </div>
</section>
```

#### Responsive Grid (3-column)

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
  <!-- Cards stack on mobile, 2-col on tablet, 3-col on desktop -->
</div>
```

#### Responsive Golden Ratio Split

```html
<div class="grid grid-cols-1 lg:grid-cols-[61.8%_38.2%] gap-8 lg:gap-12 items-center">
  <div><!-- Major content - stacks first on mobile --></div>
  <div><!-- Minor content --></div>
</div>
```

#### Responsive Typography

```html
<h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
  Headline That Scales
</h1>

<h2 class="text-3xl md:text-4xl lg:text-5xl font-bold">
  Section Title
</h2>

<p class="text-lg md:text-xl text-neutral-600">
  Body text that remains readable at all sizes.
</p>
```

---

### Responsive Validation Commands

Run these to verify responsive compliance:

```bash
# Check all sections for responsive patterns
npm run validate:design:responsive

# Full validation including Golden Ratio
npm run validate:design:strict
```

---

## Common Mistakes to Avoid

### 1. Insufficient Horizontal Padding

```html
<!-- WRONG -->
<div class="max-w-7xl mx-auto px-4">  <!-- Only 16px padding! -->

<!-- CORRECT -->
<div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
```

### 2. Missing Section Padding

```html
<!-- WRONG -->
<section class="bg-neutral-50">
  <div class="container">...</div>
</section>

<!-- CORRECT -->
<section class="py-16 md:py-20 lg:py-24 bg-neutral-50">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">...</div>
</section>
```

### 3. No Max-Width on Container

```html
<!-- WRONG -->
<div class="mx-auto px-8">...</div>

<!-- CORRECT -->
<div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">...</div>
```

### 4. Using Default Container Class Alone

```html
<!-- WRONG - May not have sufficient padding -->
<div class="container mx-auto">...</div>

<!-- CORRECT - Explicit padding -->
<div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">...</div>
```

---

## Quick Reference: Copy-Paste Patterns

### Standard Section Start

```html
<section class="py-16 md:py-20 lg:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
```

### Compact Section Start

```html
<section class="py-12 md:py-16 lg:py-20 bg-white">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
```

### Hero Section Start

```html
<section class="py-20 md:py-32 lg:py-40 bg-gradient-to-br from-primary-600 to-primary-800">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
```

### Footer Start

```html
<footer class="py-16 md:py-20 lg:py-24 bg-neutral-900 text-neutral-300">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
```

### Grid Layouts

```html
<!-- 2-column -->
<div class="grid md:grid-cols-2 gap-8 lg:gap-12">

<!-- 3-column -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">

<!-- 4-column -->
<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

<!-- Golden ratio split -->
<div class="grid lg:grid-cols-[61.8%_38.2%] gap-8 lg:gap-12">
```

---

## Reference Files

- Design Rules Config: `src/config/design-rules.json`
- Golden Ratio CSS: `src/styles/golden-ratio.css`
- Design Tokens: `src/styles/tokens.css`
- Base Styles: `src/styles/base.css`

## Related Prompts

- `golden-ratio-design.md` - Golden Ratio system details
- `modern-design-standards.md` - UX principles and standards
- `visual-design-review.md` - Design QA checklist
- `compose-page.md` - Page composition guidelines
