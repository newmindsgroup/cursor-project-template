# Golden Ratio Design System

## Purpose

This prompt guides the application of Golden Ratio (φ ≈ 1.618) principles to create visually harmonious, mathematically balanced designs. The Golden Ratio appears throughout nature, classical art, and architecture—and when applied to web design, creates layouts that feel inherently pleasing and balanced.

## When to Use

- When designing page layouts and content splits
- When establishing typography hierarchies
- When sizing images, cards, and containers
- When determining section heights and spacing
- When creating visual rhythm between elements
- During any design phase where proportion decisions are needed

## Quick Reference

### The Golden Ratio

```
φ (phi) = 1.618034...
1/φ = 0.618034...

Major portion: 61.8%
Minor portion: 38.2%
```

### Golden Powers (For Scales)

| Power | Value | Common Use |
|-------|-------|------------|
| 1/φ³ | 0.236 | Micro spacing, small radii |
| 1/φ² | 0.382 | Small spacing |
| 1/φ | 0.618 | Minor proportions |
| φ⁰ | 1.0 | Base unit |
| φ¹ | 1.618 | Primary golden unit |
| φ² | 2.618 | Large spacing |
| φ³ | 4.236 | Section spacing |
| φ⁴ | 6.854 | Hero sections |
| φ⁵ | 11.09 | Maximum spacing |

---

## Design Patterns

### 1. Two-Column Golden Split

The most iconic Golden Ratio layout—split content into 61.8% and 38.2%.

```
┌────────────────────────────────────────────────────┐
│                                                    │
│   ┌────────────┐   ┌─────────────────────────┐    │
│   │            │   │                         │    │
│   │   38.2%    │   │         61.8%           │    │
│   │   Minor    │   │         Major           │    │
│   │            │   │                         │    │
│   └────────────┘   └─────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Implementation:**

```html
<!-- CSS Custom Classes -->
<div class="gr-split">
  <aside>Sidebar (38.2%)</aside>
  <main>Content (61.8%)</main>
</div>

<!-- Or reverse -->
<div class="gr-split-reverse">
  <main>Content (61.8%)</main>
  <aside>Sidebar (38.2%)</aside>
</div>

<!-- Tailwind -->
<div class="grid grid-cols-golden gap-gr-lg">
  <aside>Minor</aside>
  <main>Major</main>
</div>
```

**Use Cases:**
- Hero with image + text
- Sidebar layouts
- Feature sections with illustration
- Testimonial with author photo

---

### 2. Typography Scale

Use Golden Ratio progression for harmonious type hierarchy.

| Level | CSS Variable | Size | Use Case |
|-------|--------------|------|----------|
| Display | `--gr-text-3xl` | 4.236rem (~68px) | Hero headlines |
| H1 | `--gr-text-2xl` | 2.618rem (~42px) | Page titles |
| H2 | `--gr-text-xl` | 1.618rem (~26px) | Section headers |
| H3 | `--gr-text-lg` | 1.236rem (~20px) | Subsections |
| Body | `--gr-text-base` | 1rem (16px) | Paragraphs |
| Small | `--gr-text-sm` | 0.764rem (~12px) | Captions |
| XS | `--gr-text-xs` | 0.618rem (~10px) | Labels |

**Implementation:**

```html
<!-- CSS classes -->
<h1 class="gr-text-2xl gr-leading-tight">Page Title</h1>
<h2 class="gr-text-xl gr-leading-snug">Section Header</h2>
<p class="gr-text-base gr-leading-relaxed">Body text...</p>

<!-- Tailwind -->
<h1 class="text-gr-2xl leading-gr-tight">Page Title</h1>
```

---

### 3. Spacing & Vertical Rhythm

Apply Golden Ratio to margins, padding, and gaps.

| Token | Value | Common Use |
|-------|-------|------------|
| `--gr-space-xs` | 0.618rem | Tight gaps, icon spacing |
| `--gr-space-sm` | 0.764rem | Inline elements |
| `--gr-space-base` | 1rem | Base padding |
| `--gr-space-md` | 1.236rem | Component padding |
| `--gr-space-lg` | 1.618rem | Card padding, gaps |
| `--gr-space-xl` | 2.618rem | Section inner padding |
| `--gr-space-2xl` | 4.236rem | Between sections |
| `--gr-space-3xl` | 6.854rem | Hero/major sections |

**Implementation:**

```html
<!-- Section with golden padding -->
<section class="gr-section">
  <div class="gr-container">
    <div class="gr-grid-3 gr-gap-lg">
      <div class="gr-card">...</div>
      <div class="gr-card">...</div>
      <div class="gr-card">...</div>
    </div>
  </div>
</section>

<!-- Tailwind -->
<section class="py-gr-3xl">
  <div class="max-w-gr-container mx-auto px-gr-lg">
    <div class="grid grid-cols-3 gap-gr-lg">...</div>
  </div>
</section>
```

---

### 4. Aspect Ratios for Images & Cards

Use Golden Ratio proportions for visually pleasing containers.

| Ratio | CSS Value | Use Case |
|-------|-----------|----------|
| Golden Landscape | 1.618:1 | Feature images, cards |
| Golden Portrait | 1:1.618 | Profile cards, tall images |
| Golden Wide | 2.618:1 | Banners, hero backgrounds |
| Square | 1:1 | Avatars, icons |

**Implementation:**

```html
<!-- Golden aspect image container -->
<div class="gr-aspect overflow-hidden rounded-gr-md">
  <img src="..." alt="..." class="w-full h-full object-cover">
</div>

<!-- Portrait card -->
<div class="gr-aspect-portrait bg-neutral-100">
  <img src="..." alt="..." class="w-full h-full object-cover">
</div>

<!-- Tailwind -->
<div class="aspect-golden overflow-hidden">
  <img src="..." class="w-full h-full object-cover">
</div>
```

---

### 5. Hero Section Heights

Use viewport-based golden proportions for impactful sections.

| Height | Value | Use Case |
|--------|-------|----------|
| `--gr-hero-height` | 61.8vh | Standard hero |
| `--gr-hero-height-tall` | 76.4vh | Tall hero (100 - 23.6) |
| `--gr-section-height` | 38.2vh | Feature sections |

**Implementation:**

```html
<section class="gr-hero flex items-center">
  <div class="gr-container">
    <div class="gr-split-reverse">
      <div><!-- Content --></div>
      <div><!-- Image --></div>
    </div>
  </div>
</section>

<!-- Tailwind -->
<section class="min-h-gr-hero flex items-center">...</section>
```

---

### 6. Golden Grid System

Pre-built grid configurations using golden proportions.

```html
<!-- Standard grid with golden gaps -->
<div class="gr-grid gr-grid-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Asymmetric golden grid -->
<div class="gr-grid gr-grid-golden">
  <div>Minor column (38.2%)</div>
  <div>Major column (61.8%)</div>
</div>

<!-- Tailwind equivalent -->
<div class="grid grid-cols-golden gap-gr-lg">
  <div>Minor</div>
  <div>Major</div>
</div>
```

---

## Complete Example: Feature Section

```html
<section class="gr-section bg-neutral-50">
  <div class="gr-container">
    <!-- Section header with golden typography -->
    <header class="text-center gr-mb-xl">
      <h2 class="gr-text-2xl gr-leading-tight gr-mb-sm">
        Why Choose Us
      </h2>
      <p class="gr-text-lg gr-leading-relaxed text-neutral-600 max-w-gr-content mx-auto">
        We deliver exceptional results through proven methodologies.
      </p>
    </header>
    
    <!-- Golden split layout -->
    <div class="gr-split-reverse items-center">
      <!-- Main content (61.8%) -->
      <div class="gr-gap">
        <div class="gr-card">
          <h3 class="gr-text-xl gr-mb-sm">Feature One</h3>
          <p class="gr-text-base gr-leading-relaxed">
            Description text here...
          </p>
        </div>
        <div class="gr-card">
          <h3 class="gr-text-xl gr-mb-sm">Feature Two</h3>
          <p class="gr-text-base gr-leading-relaxed">
            Description text here...
          </p>
        </div>
      </div>
      
      <!-- Image (38.2%) -->
      <div class="gr-aspect gr-rounded-lg overflow-hidden gr-shadow-lg">
        <img src="feature.jpg" alt="Feature illustration" class="w-full h-full object-cover">
      </div>
    </div>
  </div>
</section>
```

---

## Combining with Existing System

The Golden Ratio system is **additive**—it works alongside your existing design tokens:

| Existing | Golden Ratio | When to Use Golden |
|----------|--------------|-------------------|
| `py-16` | `py-gr-2xl` | For mathematically harmonious sections |
| `text-4xl` | `text-gr-2xl` | For scale-based typography |
| `gap-8` | `gap-gr-lg` | For proportionally balanced layouts |
| `aspect-video` | `aspect-golden` | For more organic proportions |

**General Rule:** Use Golden Ratio utilities when:
- Creating featured/hero sections where visual harmony is paramount
- Establishing primary layout splits (content/sidebar)
- Building marketing pages where aesthetic impact matters
- Any layout where you want "natural" feeling proportions

---

## Golden Ratio in Practice

### Focal Point Placement

Place key elements at golden intersection points:

```
┌─────────────────────────────────────┐
│                 │                   │
│     38.2%       │       61.8%       │
│                 │                   │
│─────────────────┼───────────────────│ ← 38.2% from top
│                 │                   │
│                 │    ★ FOCAL        │
│                 │      POINT        │
│                 │                   │
│                 │                   │
│─────────────────┼───────────────────│ ← 61.8% from top
│                 │                   │
└─────────────────────────────────────┘
```

### Button & CTA Sizing

```css
/* Button padding using golden proportions */
.btn-golden {
  padding: var(--gr-space-sm) var(--gr-space-lg); /* Height:Width ≈ 1:1.618 */
  border-radius: var(--gr-radius-sm);
}
```

---

## Available CSS Custom Properties

### Typography

- `--gr-text-xs` through `--gr-text-5xl`

### Spacing

- `--gr-space-4xs` through `--gr-space-5xl`

### Layout

- `--gr-major` (61.8%)
- `--gr-minor` (38.2%)
- `--gr-aspect-landscape` (1.618:1)
- `--gr-aspect-portrait` (1:1.618)
- `--gr-hero-height` (61.8vh)

### Visual

- `--gr-radius-xs` through `--gr-radius-xl`
- `--gr-shadow-sm` through `--gr-shadow-xl`
- `--gr-leading-tight` through `--gr-leading-loose`

### Transitions

- `--gr-duration-fast` (162ms)
- `--gr-duration-base` (262ms)
- `--gr-duration-slow` (424ms)

---

## Utility Classes Reference

### Layout
- `.gr-split` / `.gr-split-reverse` — Golden two-column grid
- `.gr-grid` / `.gr-grid-2/3/4` — Grid with golden gaps
- `.gr-grid-golden` / `.gr-grid-golden-reverse` — Asymmetric golden grid
- `.gr-container` — Centered container with golden padding

### Spacing
- `.gr-section` / `.gr-section-sm` / `.gr-section-lg` — Section padding
- `.gr-gap-xs/sm/lg/xl` — Grid/flex gaps
- `.gr-p-xs/sm/lg/xl` — Padding
- `.gr-m-xs/sm/lg/xl` — Margins
- `.gr-mb-xs/sm/lg/xl` — Bottom margins

### Typography
- `.gr-text-xs` through `.gr-text-4xl` — Font sizes
- `.gr-leading-tight/snug/normal/relaxed/loose` — Line heights

### Dimensions
- `.gr-aspect` / `.gr-aspect-portrait` / `.gr-aspect-wide` — Aspect ratios
- `.gr-hero` / `.gr-hero-tall` — Hero section heights
- `.gr-w-major` / `.gr-w-minor` — Width utilities

### Visual
- `.gr-rounded-sm/md/lg/xl` — Border radius
- `.gr-shadow-sm/md/lg/xl` — Box shadows
- `.gr-transition` / `.gr-transition-fast/slow` — Transitions
- `.gr-card` — Pre-styled card component

---

## Section Spacing Checklist

Use this checklist when creating or reviewing any section template to ensure proper spacing.

### Required Elements

Every section must have:

1. **Vertical Section Padding**
   - [ ] Section element has `.section`, `.section-sm`, or explicit padding class
   - [ ] For Golden Ratio: use `py-gr-2xl` (standard) or `py-gr-3xl` (large)
   - [ ] Footer specifically requires `py-gr-2xl` minimum

2. **Horizontal Container Padding**
   - [ ] Content wrapped in `.container-custom` (provides Golden Ratio padding)
   - [ ] Mobile: 1.618rem (~26px) from edges
   - [ ] Desktop: 2.618rem (~42px) from edges

3. **Internal Element Spacing**
   - [ ] Grid/flex gaps use Golden Ratio: `gap-gr-lg` or `gap-8 lg:gap-gr-lg`
   - [ ] Margin-bottom between content blocks: `mb-gr-lg` or similar

### Section Type Guidelines

| Section Type | Recommended Padding | Class |
|--------------|-------------------|-------|
| Standard content | 96-128px | `.section` |
| Compact (logos, stats) | 64-80px | `.section-sm` |
| Hero/CTA | 110-177px | `.section-lg` or `py-gr-3xl` |
| Footer | 68px top/bottom | `py-gr-2xl` |
| Header | Internal padding only | N/A (fixed) |

### Anti-Patterns to Avoid

- Content touching or too close to viewport edges
- Inconsistent padding between similar section types
- Missing bottom padding on footer elements
- Using raw pixel values instead of design tokens

### Quick Validation

```
Is content at least ~26px from edges on mobile?     ✓
Is content at least ~42px from edges on desktop?    ✓
Does section have consistent vertical padding?      ✓
Are internal elements properly spaced?              ✓
```

---

## Related Prompts

- `modern-design-standards.md` — Core design principles
- `visual-design-review.md` — Design QA checklist
- `compose-page.md` — Page composition guidelines

## Source Files

- `src/styles/golden-ratio.css` — CSS custom properties and utility classes
- `tailwind.config.ts` — Tailwind extensions for Golden Ratio
