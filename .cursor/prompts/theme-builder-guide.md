# Theme Builder Guide

The visual theme builder lets you customize colors, typography, and layout settings with live preview.

## Accessing the Theme Builder

```bash
npm run dev
```

Then navigate to: `http://localhost:5173/pages/wizard/theme/`

Or access from the wizard: **Wizard → Theme Builder**

## Color Palette

### Primary, Secondary, and Accent Colors

Each color has:
- **Color Picker**: Visual color selection
- **Hex Input**: Enter exact hex value (e.g., `#3B82F6`)
- **Auto-generated Shades**: Light to dark variants (50-950)

### Quick Color Presets

Pre-configured color schemes:
- **Modern Blue** - Professional, trustworthy
- **Forest Green** - Natural, sustainable
- **Warm Orange** - Energetic, friendly
- **Royal Purple** - Creative, luxurious
- **Slate Gray** - Minimal, sophisticated

Click any preset to instantly apply its colors.

### Color Palette Generation

The builder automatically generates:
- 11 shade variants (50, 100, 200... 900, 950)
- Accessible contrast ratios
- Complementary text colors

## Typography

### Heading Font

Select from curated Google Fonts:
- **Inter** - Clean, modern (default)
- **Poppins** - Geometric, friendly
- **Playfair Display** - Elegant, editorial
- **Montserrat** - Bold, contemporary
- **Roboto Slab** - Sturdy, readable

### Body Font

Optimized for readability:
- **Inter** - Neutral, highly legible
- **Open Sans** - Friendly, accessible
- **Lato** - Warm, professional
- **Source Sans Pro** - Clean, technical
- **Nunito** - Rounded, approachable

### Font Size Scale

Base font size options:
- **14px** - Compact
- **16px** - Standard (recommended)
- **18px** - Comfortable
- **20px** - Accessible

## Layout Settings

### Border Radius

Control corner roundness:
- **0px** - Sharp corners
- **4px** - Subtle rounding
- **8px** - Moderate (default)
- **12px** - Soft
- **16px** - Rounded
- **Full** - Pill-shaped buttons

### Spacing Scale

Adjust default spacing multiplier:
- **Compact** - Tighter spacing
- **Default** - Standard spacing
- **Comfortable** - More breathing room
- **Spacious** - Maximum whitespace

## Live Preview

The preview panel shows:
- Typography samples (headings, paragraphs)
- Button styles
- Card components
- Color swatches in context

Changes update in real-time as you adjust settings.

## Exporting Your Theme

### Copy CSS Variables

Click "Copy CSS" to copy generated CSS variables:

```css
:root {
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --radius-default: 8px;
  /* ... more variables */
}
```

### Export Theme File

Click "Export" to download a complete theme file:
- `theme.css` - All CSS variables
- `theme.json` - Structured theme data

### Apply to Project

1. Copy the CSS variables
2. Paste into `src/styles/design-tokens.css`
3. Run `npm run dev` to see changes

Or use the CLI:
```bash
npm run theme:apply --preset modern-blue
```

## Dark Mode

Toggle dark mode preview:
- Click the moon/sun icon
- Preview how colors adapt
- Dark mode uses inverted color scales

## Best Practices

### Color Selection
- Ensure sufficient contrast (4.5:1 minimum for text)
- Test colors in light and dark modes
- Consider color blindness accessibility

### Typography
- Pair a decorative heading font with a neutral body font
- Avoid using more than 2 font families
- Test readability at different sizes

### Consistency
- Apply the same theme across all pages
- Export theme early in the project
- Document any custom modifications

## Integration with Tailwind

Generated theme maps to Tailwind config:

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        50: 'var(--color-primary-50)',
        // ... through 950
      }
    }
  }
}
```

## Related Prompts

- `@wizard-usage.md` - Full wizard walkthrough
- `@animation-presets-guide.md` - Add animations
- `@development-workflow.md` - Development process
