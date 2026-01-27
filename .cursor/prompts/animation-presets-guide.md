# Animation Presets Guide

This guide documents all 24 production-ready GSAP animation presets available in the project.

## Quick Start

Add animations using the `data-preset` attribute:

```html
<div data-preset="reveal-up">
  Content animates in from below
</div>
```

Animations trigger automatically when elements scroll into view.

## Available Presets by Category

### Reveal Animations (6 presets)

Basic entrance animations:

| Preset | Effect | Best For |
|--------|--------|----------|
| `reveal-up` | Fade in from below | Headlines, hero text |
| `reveal-down` | Fade in from above | Dropdown content |
| `reveal-left` | Slide in from left | Text blocks |
| `reveal-right` | Slide in from right | Images |
| `reveal-scale` | Scale up with fade | CTAs, buttons |
| `reveal-rotate` | Slight rotation entrance | Cards, icons |

**Example:**
```html
<h1 data-preset="reveal-up">Welcome to Our Site</h1>
<img data-preset="reveal-right" src="hero.jpg" alt="Hero">
```

### Text Animations (3 presets)

Special effects for text:

| Preset | Effect | Best For |
|--------|--------|----------|
| `text-split` | Characters animate separately | Headlines |
| `text-blur` | Blur-to-focus effect | Subheadings |
| `text-typewriter` | Typing effect | Hero headlines |

**Example:**
```html
<h1 data-preset="text-split">Animated Headline</h1>
<p data-preset="text-blur">Subheading with blur effect</p>
```

### Card Animations (3 presets)

For card components:

| Preset | Effect | Best For |
|--------|--------|----------|
| `card-flip` | 3D flip on hover | Feature cards |
| `card-lift` | Lift with shadow | Service cards |
| `card-slide` | Slide up content | Portfolio items |

**Example:**
```html
<div class="card" data-preset="card-lift">
  <h3>Service Title</h3>
  <p>Description...</p>
</div>
```

### Stagger Animations (4 presets)

Animate multiple items in sequence:

| Preset | Effect | Best For |
|--------|--------|----------|
| `stagger-cards` | Cards appear sequentially | Card grids |
| `stagger-list` | List items cascade | Feature lists |
| `stagger-grid` | Grid items animate | Image galleries |
| `stagger-wave` | Wave-like pattern | Icon rows |

**Example:**
```html
<div data-preset="stagger-cards">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### Counter Animations (2 presets)

Animated number counting:

| Preset | Effect | Best For |
|--------|--------|----------|
| `counter` | Count up to value | Statistics |
| `counter-fast` | Quick count animation | Metrics |

**Example:**
```html
<span data-preset="counter" data-value="500">0</span>+
<span data-preset="counter-fast" data-value="99">0</span>%
```

### Parallax Effects (3 presets)

Scroll-based movement:

| Preset | Effect | Best For |
|--------|--------|----------|
| `parallax-slow` | Slow background movement | Hero backgrounds |
| `parallax-fast` | Faster parallax | Decorative elements |
| `parallax-depth` | Multi-layer depth | Complex backgrounds |

**Example:**
```html
<div class="hero" data-preset="parallax-slow">
  <img src="background.jpg" alt="Background">
</div>
```

### Scroll Progress (2 presets)

Progress-based animations:

| Preset | Effect | Best For |
|--------|--------|----------|
| `scroll-progress` | Progress bar fills | Page progress |
| `scroll-reveal` | Progressive reveal | Long-form content |

**Example:**
```html
<div data-preset="scroll-progress" class="progress-bar"></div>
```

### Hover/Click Effects (3 presets)

Interactive animations:

| Preset | Effect | Best For |
|--------|--------|----------|
| `hover-lift` | Lift on hover | Buttons, cards |
| `hover-scale` | Scale on hover | Images, icons |
| `hover-glow` | Glow effect on hover | CTAs |
| `click-pulse` | Pulse on click | Buttons |

**Example:**
```html
<button data-preset="hover-lift">Learn More</button>
<img data-preset="hover-scale" src="icon.svg" alt="Icon">
```

## Customization Options

### Delay

Add delay before animation starts:

```html
<div data-preset="reveal-up" data-delay="0.2">
  Delayed by 200ms
</div>
```

### Stagger Timing

Control stagger interval:

```html
<div data-preset="stagger-cards" data-stagger="0.15">
  <!-- Children animate with 150ms between each -->
</div>
```

### Duration

Override default duration:

```html
<div data-preset="reveal-up" data-duration="1.5">
  Slower animation (1.5 seconds)
</div>
```

## Combining Presets

You can combine multiple effects:

```html
<section data-preset="reveal-up">
  <h2 data-preset="text-split">Our Services</h2>
  <div data-preset="stagger-cards">
    <div class="card" data-preset="card-lift">Service 1</div>
    <div class="card" data-preset="card-lift">Service 2</div>
  </div>
</section>
```

## Reduced Motion Support

All presets respect `prefers-reduced-motion`:

- Animations are simplified or disabled for users who prefer reduced motion
- Essential functionality remains accessible
- No additional configuration required

## Performance Tips

1. **Don't over-animate**: Use 2-3 presets per page section
2. **Avoid animating large images**: Use reveal on containers instead
3. **Test on mobile**: Some effects may be heavy on older devices
4. **Use stagger wisely**: Limit to 6-8 items per group

## Programmatic API

Apply presets via JavaScript:

```typescript
import { applyPreset, getPresetList } from './scripts/animation-presets';

// Get available presets
const presets = getPresetList();
console.log(presets); // ['reveal-up', 'reveal-down', ...]

// Apply preset to element
const element = document.querySelector('.my-element');
applyPreset(element, 'reveal-up', { delay: 0.3 });
```

## Initialization

Presets initialize automatically. For dynamic content:

```typescript
import { initPresets } from './scripts/animation-presets';

// Re-initialize after adding new elements
initPresets();
```

## Related Prompts

- `@theme-builder-guide.md` - Visual customization
- `@wizard-usage.md` - Project setup
- `@development-workflow.md` - Full workflow
