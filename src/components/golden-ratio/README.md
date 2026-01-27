# Golden Ratio Component Library

Pre-validated HTML component templates that ensure **perfect spacing and visual harmony at EVERY breakpoint** - mobile, tablet, and desktop.

## Responsive Design Philosophy

All components in this library follow the **mobile-first** approach:

1. **Base styles** apply to mobile (< 768px)
2. **`md:` prefix** applies to tablet (768px+)
3. **`lg:` prefix** applies to desktop (1024px+)

This ensures designs look flawless across all devices.

## Breakpoint Reference

| Breakpoint | Width | Tailwind | Section Padding | Container Padding |
|------------|-------|----------|-----------------|-------------------|
| Mobile | < 768px | (base) | 64px (py-16) | 32px (px-8) |
| Tablet | 768px+ | md: | 80px (md:py-20) | 48px (md:px-12) |
| Desktop | 1024px+ | lg: | 96px (lg:py-24) | 64px (lg:px-16) |

## Components

### GRSection.html

Base section template with correct responsive padding:

```html
<section class="py-16 md:py-20 lg:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
    <!-- Content -->
  </div>
</section>
```

**Variants:**
- **Standard**: `py-16 md:py-20 lg:py-24` (64px/80px/96px)
- **Compact**: `py-12 md:py-16 lg:py-20` (48px/64px/80px)
- **Large**: `py-20 md:py-32 lg:py-40` (80px/128px/160px)

### GRContainer.html

Container template with responsive horizontal padding:

```html
<div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
  <!-- Content never touches edges -->
</div>
```

### GRGrid.html

Responsive grid layouts including Golden Ratio splits:

```html
<!-- Golden Split - stacks on mobile, splits on desktop -->
<div class="grid grid-cols-1 lg:grid-cols-[61.8%_38.2%] gap-8 lg:gap-12">
  <div><!-- Major (61.8%) --></div>
  <div><!-- Minor (38.2%) --></div>
</div>

<!-- Standard 3-column - responsive stacking -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
  <!-- Cards stack on mobile, 2-col tablet, 3-col desktop -->
</div>
```

### GRCard.html

Card components with proper padding (`p-8` minimum):

```html
<div class="p-8 bg-white rounded-2xl border border-neutral-200 shadow-soft">
  <h3 class="text-xl font-bold mb-3">{Title}</h3>
  <p class="text-neutral-600">{Description}</p>
</div>
```

### GRSpacing.html

Visual reference for spacing values and patterns.

## Quick Start

### Creating a New Responsive Section

```html
<section class="py-16 md:py-20 lg:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
    
    <!-- Responsive header -->
    <div class="max-w-3xl mx-auto text-center mb-12 md:mb-16">
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
        {Headline}
      </h2>
      <p class="text-lg md:text-xl text-neutral-600">
        {Subheadline}
      </p>
    </div>
    
    <!-- Responsive grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      <!-- Content stacks on mobile, expands on larger screens -->
    </div>
    
  </div>
</section>
```

### Creating a Golden Ratio Layout

```html
<section class="py-16 md:py-20 lg:py-24 bg-neutral-50">
  <div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
    
    <!-- Golden split: stacks on mobile, 61.8%/38.2% on desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-[61.8%_38.2%] gap-8 lg:gap-12 items-center">
      <div>
        <!-- Major content (61.8%) - shows first on mobile -->
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
          {Headline}
        </h2>
        <p class="text-lg md:text-xl text-neutral-600 mb-6 md:mb-8">
          {Description}
        </p>
      </div>
      <div>
        <!-- Minor content (38.2%) -->
        <div class="aspect-[1.618/1] rounded-2xl overflow-hidden">
          <img src="..." class="w-full h-full object-cover">
        </div>
      </div>
    </div>
    
  </div>
</section>
```

## Responsive Checklist

Before finalizing any section, verify:

### Mobile (< 768px)
- [ ] Section has `py-16` or equivalent
- [ ] Container has `px-8`
- [ ] Grids use `grid-cols-1` as base
- [ ] Golden splits stack vertically
- [ ] Typography is readable (no tiny text)

### Tablet (768px+)
- [ ] Section has `md:py-20` or equivalent
- [ ] Container has `md:px-12`
- [ ] Grids expand to `md:grid-cols-2`
- [ ] Typography scales with `md:text-*`

### Desktop (1024px+)
- [ ] Section has `lg:py-24` or equivalent
- [ ] Container has `lg:px-16`
- [ ] Grids reach full columns `lg:grid-cols-3`
- [ ] Golden splits show `lg:grid-cols-[61.8%_38.2%]`
- [ ] Gaps increase with `lg:gap-12`

## Validation

Run the design validator to check compliance:

```bash
# Basic validation
npm run validate:design

# With responsive checks
npm run validate:design:responsive

# Full validation with Golden Ratio checks
npm run validate:design:strict
```

## Related Files

- `src/config/design-rules.json` - Centralized spacing constants with responsive definitions
- `src/styles/golden-ratio.css` - CSS custom properties with responsive media queries
- `.cursor/prompts/design-enforcement.md` - Mandatory requirements with breakpoint checklist
- `.cursor/prompts/golden-ratio-design.md` - Golden Ratio principles
