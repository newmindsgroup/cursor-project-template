# Elementor Mapping Conventions

This document defines how prototype designs map to Elementor Pro implementation.

## Container Layouts

### Flexbox Containers

**Prototype Pattern:**

```html
<section class="flex flex-col gap-8 py-24">...</section>
```

**Elementor Setup:**

- Widget: Container
- Layout: Flexbox
- Direction: Column
- Gap: 2rem (32px) → Use "Gap" setting
- Padding: 6rem (96px) top/bottom → Use "Padding" setting

### Grid Containers

**Prototype Pattern:**

```html
<div class="grid grid-cols-3 gap-8">...</div>
```

**Elementor Setup:**

- Widget: Container (or nested Flex containers)
- Layout: Grid (if available) OR 3 child Flex containers at 33.33% width
- Columns: 3 (desktop), 2 (tablet), 1 (mobile)
- Gap: 2rem (32px)

### Responsive Breakpoints

Map prototype breakpoints to Elementor:

- **Desktop:** 1024px+ → Elementor Desktop
- **Tablet:** 768px-1023px → Elementor Tablet
- **Mobile:** <768px → Elementor Mobile

Adjust spacing/typography at each breakpoint to match prototype values.

## Typography Mapping

### Setup Global Typography

Before building pages, create Elementor Global Typography styles matching these prototype tokens:

| Prototype Token | Elementor Global Style | Font Size Desktop | Font Size Tablet | Font Size Mobile | Weight | Line Height |
| --------------- | ---------------------- | ----------------- | ---------------- | ---------------- | ------ | ----------- |
| text-7xl        | Display XL             | 4.5rem (72px)     | 3.75rem (60px)   | 3rem (48px)      | 700    | 1.1         |
| text-6xl        | Display Large          | 3.75rem (60px)    | 3rem (48px)      | 2.25rem (36px)   | 700    | 1.2         |
| text-5xl        | Heading XL             | 3rem (48px)       | 2.25rem (36px)   | 2rem (32px)      | 700    | 1.2         |
| text-4xl        | Heading Large          | 2.25rem (36px)    | 2rem (32px)      | 1.5rem (24px)    | 700    | 1.25        |
| text-3xl        | Heading Medium         | 1.875rem (30px)   | 1.5rem (24px)    | 1.25rem (20px)   | 700    | 1.25        |
| text-2xl        | Heading Small          | 1.5rem (24px)     | 1.25rem (20px)   | 1.125rem (18px)  | 700    | 1.5         |
| text-xl         | Body Large             | 1.25rem (20px)    | 1.125rem (18px)  | 1rem (16px)      | 400    | 1.75        |
| text-lg         | Body Medium            | 1.125rem (18px)   | 1rem (16px)      | 1rem (16px)      | 400    | 1.75        |
| text-base       | Body                   | 1rem (16px)       | 1rem (16px)      | 1rem (16px)      | 400    | 1.5         |

### Using Global Typography

In Elementor Heading/Text widgets:

1. Typography tab → Style → Select matching Global Style
2. Verify font size, weight, line height match prototype
3. Adjust color using Global Colors

## Color Mapping

### Setup Global Colors

Create Elementor Global Colors matching these prototype tokens:

| Prototype Token | Elementor Color Name | Hex Value | Usage                      |
| --------------- | -------------------- | --------- | -------------------------- |
| primary-50      | Primary Light        | #eff6ff   | Backgrounds, hover states  |
| primary-100     | Primary Lighter      | #dbeafe   | Subtle backgrounds         |
| primary-500     | Primary              | #3b82f6   | Main brand color           |
| primary-600     | Primary Dark         | #2563eb   | Hover states, emphasis     |
| secondary-500   | Secondary            | #8b5cf6   | Accents                    |
| secondary-600   | Secondary Dark       | #7c3aed   | Hover states               |
| neutral-50      | Neutral Lightest     | #fafafa   | Light backgrounds, borders |
| neutral-900     | Neutral Darkest      | #171717   | Text, dark backgrounds     |

### Color Usage Guidelines

- **Text:** Use Neutral 900 for body text, Neutral 600 for secondary text
- **Backgrounds:** Primary 600/Secondary 600 for hero sections, Neutral 50 for alternating sections
- **Buttons:** Primary 600 background, white text, Primary 700 on hover
- **Borders:** Neutral 200 (not in table above, use #e5e5e5)

## Spacing Mapping

### Spacing Scale

Prototype uses Tailwind spacing scale. Map to Elementor padding/margin:

| Tailwind Class | Pixel Value | Elementor Setting       |
| -------------- | ----------- | ----------------------- |
| p-4            | 1rem (16px) | Padding: 16px           |
| p-6            | 1.5rem      | Padding: 24px           |
| p-8            | 2rem        | Padding: 32px           |
| py-12          | 3rem        | Padding: 48px (top/bot) |
| py-16          | 4rem        | Padding: 64px (top/bot) |
| py-24          | 6rem        | Padding: 96px (top/bot) |
| py-32          | 8rem        | Padding: 128px          |
| gap-4          | 1rem        | Gap: 16px               |
| gap-6          | 1.5rem      | Gap: 24px               |
| gap-8          | 2rem        | Gap: 32px               |
| gap-12         | 3rem        | Gap: 48px               |

### Section Padding Standard

Common section patterns:

- **Hero:** `py-32` (128px) desktop, `py-24` (96px) tablet, `py-16` (64px) mobile
- **Standard Section:** `py-24` (96px) desktop, `py-16` (64px) tablet, `py-12` (48px) mobile
- **Compact Section:** `py-16` (64px) desktop, `py-12` (48px) tablet, `py-8` (32px) mobile

Always set responsive values separately in Elementor.

## Widget Mapping

### Common Prototype Patterns → Elementor Widgets

| Prototype Element            | Elementor Widget          | Notes                                    |
| ---------------------------- | ------------------------- | ---------------------------------------- |
| `<h1>`, `<h2>`, etc.         | Heading                   | Use Global Typography                    |
| `<p>`                        | Text Editor               | Use Global Typography for Body           |
| `<button>`, `<a class="btn"` | Button                    | Style: Flat/Gradient, use Global Colors  |
| Icon + text card             | Icon Box                  | Position: Top, adjust spacing            |
| Testimonial card             | Testimonial               | OR custom HTML if needed                 |
| Accordion/FAQ                | Accordion                 | Match open/close animations              |
| Form inputs                  | Form (Elementor Pro)      | Style to match prototype                 |
| Image                        | Image                     | Set size, lazy load, alt text            |
| Grid of cards                | Container + Loop Grid     | OR manual container with child items     |
| Stats/counters               | Counter                   | Animate on scroll, match number          |
| Navigation menu              | Nav Menu                  | Style to match prototype nav             |
| Footer columns               | Container (4 columns)     | Text Editor widgets in each column       |
| Social icons                 | Social Icons              | Custom styling to match                  |
| Background gradient          | Container Background      | Type: Gradient, match angle/color stops  |
| Background pattern           | Container Background      | Use image OR custom CSS                  |
| Sticky header                | Container (Advanced)      | Motion Effects: Sticky, Top position     |
| Scroll animation             | Motion Effects (Advanced) | Fade In, Rotate, Scale - match prototype |

## Effects & Animations

### Box Shadows

Prototype shadow tokens:

- `shadow-soft`: 0 2px 15px rgba(0,0,0,0.05) → Elementor: Box Shadow, Blur 15px, Spread 0, Color rgba(0,0,0,0.05)
- `shadow-medium`: 0 4px 20px rgba(0,0,0,0.08) → Elementor: Box Shadow, Blur 20px, Color rgba(0,0,0,0.08)
- `shadow-large`: 0 10px 40px rgba(0,0,0,0.12) → Elementor: Box Shadow, Blur 40px, Color rgba(0,0,0,0.12)

### Border Radius

- `rounded-lg`: 0.75rem (12px)
- `rounded-xl`: 1rem (16px)
- `rounded-2xl`: 1.5rem (24px)
- `rounded-full`: 9999px

### Transitions

All hover transitions should be:

- Duration: 300ms (0.3s)
- Easing: ease (or ease-out)

## Implementation Workflow

1. **Setup Phase:**
   - Create Global Colors (8-10 colors)
   - Create Global Typography (8-10 styles)
   - Enable Flexbox Containers in Elementor settings

2. **Per-Page Build:**
   - Create page, enable Elementor
   - Add sections top-to-bottom following `elementor-map.md`
   - Use Global Colors/Typography exclusively

3. **Per-Section Build:**
   - Create Container matching layout (Flex/Grid)
   - Set responsive padding/gaps
   - Add widgets from suggestion list
   - Apply Global Typography/Colors
   - Set backgrounds, shadows, radius
   - Test at all breakpoints

4. **Validation:**
   - Compare side-by-side with prototype
   - Toggle handoff overlay to verify specs
   - Check responsive behavior
   - Validate accessibility

## Tips for Pixel-Perfect Results

- **Use px units** for spacing (not em/rem) to match prototype exactly
- **Always set responsive values** separately (desktop/tablet/mobile)
- **Copy exact hex values** from Global Colors (don't eyeball)
- **Match line-height exactly** (Tailwind uses unitless values, Elementor uses px - convert)
- **Test in incognito** to avoid cached CSS interfering
- **Use browser DevTools** to inspect computed styles if unsure
- **Reference `elementor-map.json`** for precise computed values at each breakpoint

## Common Pitfalls

❌ **Don't:** Use theme default spacing/colors  
✅ **Do:** Override with Global values that match prototype

❌ **Don't:** Eyeball spacing values  
✅ **Do:** Use exact px values from handoff guide

❌ **Don't:** Skip responsive settings  
✅ **Do:** Set desktop/tablet/mobile values separately

❌ **Don't:** Ignore hover states  
✅ **Do:** Match all interactive state styles (hover, focus, active)

❌ **Don't:** Use generic widget defaults  
✅ **Do:** Customize every widget to match prototype styling

---

## Modern Animation Patterns (2026)

This section covers current animation trends and how to implement them in Elementor Pro.

### Scroll-Driven Animations

Modern websites use scroll position to trigger animations, creating engaging experiences.

#### Entrance Animations

| Animation Type | Elementor Implementation | When to Use |
|---------------|-------------------------|-------------|
| Fade In | Motion Effects → Entrance Animation → Fade In | Default for most content |
| Fade In Up | Motion Effects → Entrance Animation → Fade In Up | Section content, cards |
| Fade In Left/Right | Motion Effects → Entrance Animation → Fade In Left/Right | Alternating content |
| Zoom In | Motion Effects → Entrance Animation → Zoom In | Hero elements, images |
| Slide In | Motion Effects → Entrance Animation → Slide In | Sidebars, panels |

**Settings:**
- Animation Duration: 300-500ms (0.3s-0.5s recommended)
- Animation Delay: Stagger by 100-200ms for sequential elements
- Viewport Trigger: "Top of element hits bottom of viewport" (default)

#### Parallax Effects

| Effect Type | Elementor Setup | Performance Note |
|-------------|-----------------|------------------|
| Background Parallax | Container → Background → Scrolling Effects → Vertical Scroll | Use sparingly, impacts performance |
| Element Parallax | Widget → Advanced → Motion Effects → Scrolling Effects | GPU-accelerated, use transform properties |
| Opacity on Scroll | Motion Effects → Transparency → Fade In/Out based on scroll | Lightweight, good for text |

**Parallax Settings:**
- Speed: 1-3 for subtle effect, 4-6 for more dramatic
- Direction: Down for backgrounds, Up for foreground elements
- Viewport: 0-100% (element visible range)

#### Sticky Elements

| Element | Setup | Use Case |
|---------|-------|----------|
| Sticky Header | Container → Advanced → Motion Effects → Sticky → Top | Navigation |
| Sticky Sidebar | Container → Advanced → Motion Effects → Sticky → Top | Long-form content |
| Sticky CTA | Container → Advanced → Motion Effects → Sticky → Bottom | Mobile conversion |

**Sticky Settings:**
- Offset: Match header height (usually 60-80px)
- Effects on: Can change styles when sticky (shrink header, change background)
- Stay in Column: Enable for sidebar sticky elements

### Hover Interactions

Modern hover states provide feedback and delight.

#### Card Hover Effects

| Effect | CSS/Elementor Implementation |
|--------|------------------------------|
| Lift (translateY) | Container → Advanced → Custom CSS: `selector:hover { transform: translateY(-8px); }` |
| Shadow Increase | Widget → Advanced → Box Shadow → Set Normal and Hover states |
| Scale Up | Widget → Advanced → Transform → Scale (Normal: 1, Hover: 1.02-1.05) |
| Background Color | Widget → Style → Background → Set Normal and Hover colors |
| Border Color | Widget → Style → Border → Set Normal and Hover colors |

**Standard Card Hover:**
```css
/* Add to Elementor Custom CSS for card containers */
selector {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
selector:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
}
```

#### Button Hover Effects

| Effect | Implementation |
|--------|----------------|
| Color Shift | Button → Style → Hover → Background Color |
| Scale | Button → Style → Hover → Transform → Scale (1.05) |
| Shadow | Button → Style → Hover → Box Shadow |
| Icon Animation | Button → Style → Hover → Icon → Transform |

**Recommended Button Hover:**
- Background: Darken by 10% (e.g., Primary 600 → Primary 700)
- Transform: Scale 1.02-1.05
- Transition: 200-300ms ease

#### Image Hover Effects

| Effect | Implementation |
|--------|----------------|
| Zoom | Image → Style → Hover → CSS Filters → Scale OR Custom CSS |
| Overlay Reveal | Container with background overlay, opacity transition |
| Grayscale to Color | Image → Style → Normal → Grayscale 100%, Hover → Grayscale 0% |

### Loading & Transition States

#### Page Transitions

For smooth page transitions (requires additional setup):

1. Install a preloader plugin or use Elementor Pro's preloader
2. Set consistent animation timing across pages
3. Consider AJAX page loading for seamless transitions

#### Loading States

| State | Implementation |
|-------|----------------|
| Skeleton Loading | Placeholder containers with animated gradient background |
| Spinner | Custom HTML widget with CSS animation |
| Progress Bar | Progress Bar widget with animation |

### Micro-Interactions

Small animations that provide feedback and delight.

| Interaction | Element | Implementation |
|-------------|---------|----------------|
| Form Focus | Input fields | Custom CSS for focus state glow/border |
| Toggle Switch | Custom HTML | CSS transitions on state change |
| Accordion Icon Rotation | Accordion | Built-in icon animation setting |
| Tab Indicator | Tabs | Custom CSS for active state animation |
| Counter Animation | Counter | Enable animation, set duration |

### Animation Performance Guidelines

**Do:**
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Keep animation duration 200-500ms
- Use `ease-out` for entrance, `ease-in` for exit
- Limit simultaneous animations to 3-4 elements
- Test on mobile devices

**Don't:**
- Animate `width`, `height`, `margin`, `padding` (causes reflow)
- Use parallax on every section
- Auto-play videos on mobile
- Create animations that loop infinitely without purpose
- Ignore `prefers-reduced-motion` media query

### Accessibility: Reduced Motion

Always respect user preferences for reduced motion:

```css
/* Add to site-wide custom CSS */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In Elementor, users with reduced motion preference will see static content instead of animations.

---

## 2026 Feature Recommendations for Elementor

Current features and techniques for modern WordPress/Elementor sites.

### Layout Features

#### Bento Grid Layouts

Modern asymmetric grids for visual interest:

**Setup:**
1. Create Container with CSS Grid layout
2. Set grid-template-columns: `repeat(4, 1fr)` for 4-column grid
3. Use `grid-column: span 2` on individual items for spanning

**Elementor Pro Approach:**
- Use Container widget with custom grid
- Or nest Flex containers with percentage widths
- Set different spans per breakpoint

#### Full-Bleed Sections

Content that extends to viewport edges:

**Setup:**
- Container: Full Width
- Content Width: Boxed with max-width (1200-1440px)
- Or: Full Width container with nested Boxed container

#### Overlapping Elements

Create depth with overlapping sections:

**Setup:**
1. Use negative margins on containers
2. Or position elements with custom positioning
3. Manage z-index for proper layering

### Interactive Features

#### Dynamic Content

Use Elementor Pro's dynamic capabilities:

| Feature | Use Case | Setup |
|---------|----------|-------|
| Dynamic Tags | Personalized content | Insert → Dynamic → Choose field |
| Custom Fields | Reusable content | ACF/Pods + Dynamic Tags |
| Conditional Display | Show/hide based on rules | Advanced → Conditions |
| Loop Builder | Repeated content patterns | Create template, apply to Loop Grid |

#### Form Enhancements

Modern form UX patterns:

| Enhancement | Implementation |
|-------------|----------------|
| Multi-step Forms | Elementor Pro Form → Multi-Step |
| Inline Validation | Custom JavaScript + CSS |
| Floating Labels | Custom CSS for label animation |
| Progress Indicator | Form Steps widget |
| Conditional Fields | Form → Show Field Based On |

#### Navigation Patterns

| Pattern | Implementation |
|---------|----------------|
| Mega Menu | Nav Menu → Layout → Dropdown as Mega Menu |
| Sticky + Shrink Header | Motion Effects → Sticky + custom CSS for scroll class |
| Off-Canvas Menu | Menu Cart/Button → Opens Popup → Menu inside |
| Bottom Mobile Nav | Popup at bottom, triggered by menu button |

### Visual Features

#### Gradient Backgrounds

Modern gradient approaches:

| Type | Setup |
|------|-------|
| Linear Gradient | Container → Background → Gradient → Linear |
| Radial Gradient | Container → Background → Gradient → Radial |
| Mesh Gradient | Use background image (generated via tools like meshgradient.in) |
| Animated Gradient | Custom CSS with keyframe animation |

#### Glassmorphism (Frosted Glass)

```css
/* Add to container custom CSS */
selector {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

**Note:** `backdrop-filter` has good browser support in 2026 but test on target browsers.

#### Dark Mode Toggle

Implementing dark mode requires custom code:

1. **CSS Variables Setup:**
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #171717;
}
[data-theme="dark"] {
  --bg-primary: #171717;
  --text-primary: #ffffff;
}
```

2. **JavaScript Toggle:**
```javascript
document.querySelector('.dark-mode-toggle').addEventListener('click', () => {
  document.documentElement.toggleAttribute('data-theme', 'dark');
  localStorage.setItem('theme', document.documentElement.dataset.theme || 'light');
});
```

3. **Apply Variables:** Use CSS variables in Global Colors (requires custom CSS approach)

### Performance Features

#### Core Web Vitals Optimization

| Metric | Elementor Settings |
|--------|-------------------|
| LCP (Largest Contentful Paint) | Preload hero images, optimize above-fold content |
| FID (First Input Delay) | Minimize JavaScript, defer non-critical scripts |
| CLS (Cumulative Layout Shift) | Set explicit dimensions, reserve space for dynamic content |

#### Image Optimization

| Feature | Setup |
|---------|-------|
| Lazy Loading | Elementor → Settings → Performance → Lazy Load |
| WebP Format | Use plugin (ShortPixel, Imagify) or server-level conversion |
| Responsive Images | Elementor generates srcset automatically |
| Image Dimensions | Always set width/height to prevent CLS |

#### Code Optimization

| Feature | Setup |
|---------|-------|
| Improved Asset Loading | Elementor → Settings → Performance → Improved Asset Loading |
| Font Display Swap | Elementor → Settings → Performance → Font Display → Swap |
| Inline Critical CSS | Consider plugin like Autoptimize for critical CSS |

---

## Design Rationale Integration

When implementing designs, reference the design rationale system:

### Using Section Rationale

For each section, check `src/data/section-rationale.json` for:
- **Why** design decisions were made
- **UX principles** that support the design
- **StoryBrand alignment** for content sections
- **Accessibility notes** for implementation

### Handoff Overlay "Why This Design" Tab

The handoff overlay now includes a "Why This Design" tab that shows:
- Design decision documentation
- UX principle citations
- StoryBrand element mapping
- Evidence sources

Reference this when implementing to understand the reasoning behind design choices.

### Documenting Implementation Decisions

When implementing, if you make any deviations from the design:
1. Document the change and reason
2. Verify it doesn't violate UX principles
3. Update `section-rationale.json` if the change should persist

---

## Questions?

If implementation details are unclear:

1. Check `elementor-map.json` for computed style values
2. Use handoff overlay on prototype to verify specs
3. Check the "Why This Design" tab for rationale
4. Inspect prototype source in browser DevTools
5. Reference `src/data/section-rationale.json` for design decisions
6. Contact design team with specific section name and issue

---

## Related Documentation

- `.cursor/prompts/modern-design-standards.md` — UX principles and 2026 trends
- `.cursor/prompts/design-rationale-generator.md` — How rationale is generated
- `.cursor/prompts/trend-research-workflow.md` — Trend research process
- `docs/02-discovery/design-decision-framework.md` — Decision validation framework
- `src/data/section-rationale.json` — Stored design rationales
- `src/data/design-research-log.json` — Research findings
