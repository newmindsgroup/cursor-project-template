# AI Image Generation

This guide explains how to use the integrated AI image generation system to create assets for your website projects. Supports Google AI (Imagen 3) and NanoBanana providers.

---

## Overview

The image generation system is fully integrated into the content workflow. Images are defined inline within content JSON files and generated automatically during the build process. The implementation team receives all generated assets bundled in the standard handoff package.

### Key Benefits

- **No separate panel** - Image specs live in your content JSON
- **Automatic generation** - Images are created during `npm run handoff:bundle`
- **Smart caching** - Unchanged prompts don't regenerate (saves cost)
- **Prompt enhancement** - Automatic quality boosting for professional results
- **Retry logic** - Handles rate limits and temporary failures
- **Multi-provider support** - Google AI Imagen 3 or NanoBanana
- **Seamless handoff** - Generated images bundled with other assets

---

## Quick Start

### 1. Set Up API Key

Add your API key to `.env`. The system supports multiple providers:

```env
# Google AI (Imagen 3) - Recommended
GOOGLE_AI_KEY="your_google_ai_key_here"

# Or NanoBanana
NANOBANANA_API_KEY=nb_your_api_key_here
NANOBANANA_PROJECT_ID=your_project_id  # Optional, for usage tracking
```

### 2. Add Image Specs to Content

In your content JSON files, add `image` or `avatar` objects:

```json
{
  "hero": {
    "headline": "Welcome",
    "image": {
      "generate": true,
      "id": "hero-home-bg",
      "prompt": "Abstract gradient background with flowing shapes, blue to purple tones",
      "style": "background",
      "format": "webp"
    }
  }
}
```

### 3. Generate Images

```bash
# Generate new/changed images only
npm run assets:generate

# Force regenerate all images
npm run assets:generate:force

# Preview what would be generated (no API calls)
npm run assets:generate:dry-run

# Check status of all images
npm run assets:generate:status
```

### 4. Build with Images

The `handoff:bundle` command automatically generates images first:

```bash
npm run handoff:bundle
```

---

## Image Specification

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (used as filename) |
| `prompt` | string | Text description of desired image |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `generate` | boolean | `true` | Set to `false` to skip generation |
| `style` | string | `"feature"` | Preset for resolution/aspect ratio |
| `format` | string | `"webp"` | Output format: `webp`, `png`, `jpg` |
| `resolution` | string | varies | Override: `512`, `1k`, `2k`, `4k` |
| `aspectRatio` | string | varies | Override: `1:1`, `16:9`, `4:3`, etc. |
| `fallback` | string | - | Path to fallback if generation fails |
| `override` | string | - | Path to client-provided image |
| `alt` | string | - | Alt text for accessibility |
| `tags` | array | - | Tags for organization |

### Style Presets

| Style | Resolution | Aspect Ratio | Use Case |
|-------|------------|--------------|----------|
| `background` | 2K | 16:9 | Hero sections, CTAs, banners |
| `portrait` | 1K | 1:1 | Avatars, team photos, testimonials |
| `feature` | 1K | 4:3 | Feature illustrations, service images |
| `product` | 2K | 4:3 | Product shots, screenshots |
| `icon` | 512px | 1:1 | Small icons (prefer SVG when possible) |
| `thumbnail` | 1K | 3:2 | Blog cards, gallery items |

---

## Examples

### Hero Background

```json
{
  "hero": {
    "headline": "Build Something Amazing",
    "image": {
      "generate": true,
      "id": "hero-main-bg",
      "prompt": "Modern abstract gradient background with subtle geometric patterns, deep blue transitioning to purple, professional tech aesthetic, soft glowing particles",
      "style": "background",
      "format": "webp",
      "fallback": "placeholders/hero/hero-desktop.svg"
    }
  }
}
```

### Testimonial Avatar

```json
{
  "testimonials": {
    "items": [
      {
        "quote": "Great product!",
        "author": "Jane Smith",
        "avatar": {
          "generate": true,
          "id": "avatar-jane-smith",
          "prompt": "Professional headshot of a confident businesswoman in her 30s, warm smile, neutral office background, corporate photography style",
          "style": "portrait",
          "alt": "Jane Smith, CEO"
        }
      }
    ]
  }
}
```

### Feature Illustration

```json
{
  "features": {
    "items": [
      {
        "title": "Fast Performance",
        "image": {
          "generate": true,
          "id": "feature-speed",
          "prompt": "Minimalist illustration of a rocket launching with speed lines, flat design style, blue and white colors, clean modern aesthetic",
          "style": "feature"
        }
      }
    ]
  }
}
```

### Using Client-Provided Images

```json
{
  "hero": {
    "image": {
      "generate": false,
      "id": "hero-client-photo",
      "override": "client/hero-final.webp",
      "fallback": "placeholders/hero/hero-desktop.svg"
    }
  }
}
```

---

## Automatic Prompt Enhancement

The system automatically enhances your prompts for better results. You don't need to add quality keywords - they're added automatically based on the style type.

### What Gets Added

| Style | Auto-Added Prefix |
|-------|------------------|
| `background` | "Seamless tileable pattern or gradient suitable as website background." |
| `portrait` | "Professional corporate headshot style, soft studio lighting, neutral background." |
| `feature` | "Clean minimalist illustration style, modern design aesthetic." |
| `product` | "Professional product photography, clean white or neutral background." |
| `icon` | "Flat design icon style, simple shapes, bold colors." |
| `thumbnail` | "Eye-catching composition, vibrant colors, clear focal point." |

All prompts also receive:
- **Prefix:** "Professional high-quality image for a modern website."
- **Suffix:** "High resolution, clean composition, suitable for commercial use, no text overlays."

### Example Transformation

Your prompt:
```
"Abstract gradient with flowing shapes, blue and purple tones"
```

Enhanced prompt sent to API:
```
"Professional high-quality image for a modern website. Seamless tileable pattern or gradient suitable as website background. Abstract gradient with flowing shapes, blue and purple tones. High resolution, clean composition, suitable for commercial use, no text overlays."
```

---

## Writing Effective Prompts

Since prompts are auto-enhanced, focus on the unique aspects of your image.

### Do's

- Be specific about style: "flat design", "photorealistic", "watercolor"
- Mention colors explicitly: "blue and purple gradient", "warm earth tones"
- Describe composition: "centered", "left-aligned", "with negative space"
- Include mood/feeling: "professional", "playful", "minimalist"
- Focus on what makes this image unique

### Don'ts

- Don't add generic quality terms (auto-added)
- Don't include text to render (use overlays instead)
- Don't request copyrighted characters/brands
- Keep prompts focused (100-300 characters ideal)

### Prompt Templates

**Background:**
```
[Style] with [elements], [color scheme], [mood] aesthetic
```

**Portrait:**
```
[Gender] in [age range], [expression], [attire], [setting]
```

**Illustration:**
```
[Subject], [design style], [colors]
```

---

## Caching & Cost Management

### How Caching Works

Images are cached based on a hash of:
- Prompt text
- Style preset
- Format
- Resolution
- Aspect ratio

If any of these change, the image will be regenerated.

### Cache Commands

```bash
# View cache status
npm run assets:generate:status

# Force regenerate (clears cache match)
npm run assets:generate:force

# Dry run to estimate costs
npm run assets:generate:dry-run
```

### Cost Tracking

The manifest file (`src/assets/generated/manifest.json`) tracks:
- Total cost for all generated images
- Per-image cost
- Project ID for billing attribution

---

## Output Structure

After running `npm run assets:generate`:

```
src/assets/generated/
├── hero-home-bg.webp
├── avatar-sarah-johnson.webp
├── avatar-michael-chen.webp
├── avatar-emily-rodriguez.webp
├── cta-transform-bg.webp
└── manifest.json

.image-cache/
└── cache-index.json
```

### Manifest Contents

```json
{
  "generated": "2026-01-26T10:00:00Z",
  "projectId": "proj-abc123",
  "provider": "nanobanana",
  "totalCost": 0.10,
  "summary": {
    "total": 5,
    "generated": 3,
    "cached": 2,
    "failed": 0,
    "skipped": 0
  },
  "images": [
    {
      "id": "hero-home-bg",
      "file": "hero-home-bg.webp",
      "prompt": "Abstract gradient background...",
      "style": "background",
      "resolution": "1920x1080",
      "cost": 0.02,
      "usedIn": ["en/home.json"],
      "status": "generated"
    }
  ]
}
```

---

## Integration with Handoff

Generated images are automatically included in the handoff package:

1. **Assets Package** contains `generated/` folder with all AI images
2. **Elementor Map** references images by path
3. **Manifest** provides metadata for the implementation team

The implementation team simply downloads the assets package and all images are ready to use.

---

## Troubleshooting

### "NANOBANANA_API_KEY not set"

Add your API key to `.env`:
```env
NANOBANANA_API_KEY=nb_your_key_here
```

### Image not regenerating after prompt change

The cache might have a stale entry. Use force mode:
```bash
npm run assets:generate:force
```

### Generation failed with API error

1. Check your API key is valid
2. Verify you have API credits remaining
3. Check the prompt isn't too long (max ~1000 chars)
4. The system will use the fallback image if configured

### Images not in handoff package

Ensure you run the full bundle command:
```bash
npm run handoff:bundle
```

This runs `assets:generate` before building.

---

## Best Practices

1. **Use meaningful IDs** - `hero-about-page` not `img1`
2. **Provide fallbacks** - Always have a fallback for critical images
3. **Use appropriate styles** - Match style preset to use case
4. **Track costs** - Review manifest.json for cost monitoring
5. **Version control prompts** - Prompts in JSON are versioned with your content
6. **Test with dry-run** - Preview before generating to estimate costs

---

## Configuration

The generation system is configured in `src/data/image-generation.config.json`:

- Default format and quality settings
- Style presets with dimensions
- Pricing information
- Cache and output directories

Modify this file to customize defaults for your workflow.
