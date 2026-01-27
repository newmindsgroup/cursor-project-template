# Compose Page

Rapidly assemble new website pages from existing section templates.

## Prerequisites

- Review available sections in `src/sections/`
- Review page blueprints in `src/data/page-blueprints.json`
- Understand the project's design system in `src/styles/tokens.css`
- **MANDATORY**: Follow `design-enforcement.md` for spacing requirements
- **MANDATORY**: Reference `src/config/design-rules.json` for spacing values

## Instructions

### Step 1: Understand the Page Purpose

Before creating a page, clarify:
- What is the goal of this page? (conversion, information, lead generation)
- Who is the target audience?
- What action should visitors take?

### Step 2: Select Sections

Choose from available sections based on page goals:

**Navigation:**
- `Header` - Site navigation (include on all pages)
- `Footer` - Site footer (include on all pages)

**Heroes:**
- `Hero` - Full-height hero for homepages
- `HeroAbout` / `HeroServices` / `HeroContact` - Inner page heroes

**Social Proof:**
- `Testimonials` - Customer quotes
- `Stats` - Key metrics and numbers
- `LogoCloud` - Client/partner logos
- `Team` - Team members

**Content:**
- `Features` - Feature/benefit grid
- `Process` - Step-by-step process
- `Timeline` - Company history or process timeline
- `Story` - Two-column text + image
- `Values` - Core values grid

**Conversion:**
- `CTA` - Call-to-action section
- `Pricing` - Pricing tables
- `Comparison` - Feature comparison
- `Newsletter` - Email signup
- `Contact` - Contact form

**Media:**
- `Video` - Video section with play button
- `Blog` - Blog post previews
- `Portfolio` - Project showcase grid
- `FAQ` - Frequently asked questions

### Step 3: Use Page Blueprints or Custom

**Option A: Use a Blueprint**

```bash
node scripts/generate-page.mjs <page-name> --blueprint <blueprint>
```

Available blueprints:
- `homepage` - Hero, LogoCloud, Features, Stats, Testimonials, FAQ, CTA
- `about` - HeroAbout, Story, Timeline, Team, Values, CTA
- `services` - HeroServices, ServicesGrid, Process, Features, FAQ, CTA
- `contact` - HeroContact, Contact
- `pricing` - HeroPricing, Pricing, Comparison, FAQ, CTA
- `portfolio` - HeroPortfolio, Portfolio, Testimonials, CTA
- `blog` - HeroBlog, Blog, Newsletter
- `landing` - Hero, LogoCloud, Features, Video, Testimonials, Pricing, FAQ, CTA

**Option B: Custom Sections**

```bash
node scripts/generate-page.mjs <page-name> --sections Section1,Section2,Section3
```

### Step 4: Page Flow Best Practices

Follow this general flow for maximum conversion:

1. **Header** - Navigation and branding
2. **Hero** - Clear value proposition and CTA
3. **Social Proof** - Build trust immediately (LogoCloud, Stats)
4. **Features/Benefits** - Explain what you offer
5. **How It Works** - Reduce friction with clear process
6. **Testimonials** - More social proof
7. **FAQ** - Address objections
8. **CTA** - Final conversion push
9. **Footer** - Secondary navigation and legal

### Step 5: Customize Sections

After generating the page:

1. **Update Hero Content**
   - Headline focused on customer transformation
   - Subheadline with supporting value
   - Clear CTA button text

2. **Customize Feature Content**
   - Use benefit-focused headlines
   - Keep descriptions concise
   - Use relevant icons

3. **Add Real Testimonials**
   - Include customer name, role, company
   - Use specific results and outcomes
   - Add photos when possible

4. **Update CTAs**
   - Use action-oriented button text
   - Ensure consistent primary/secondary styling

### Step 6: Add Content JSON

Create corresponding content file:

```
src/content/en/<page-name>.json
```

Follow the StoryBrand schema for content structure.

## Example Prompt Usage

```
Create a new pricing page for the website.

Requirements:
- Clear pricing tiers (Starter, Pro, Enterprise)
- Feature comparison table
- FAQ section for pricing questions
- Strong CTA to sign up

Use the pricing blueprint and customize for:
- Software as a Service product
- Monthly and yearly billing options
- Free trial offer
```

## Quick Reference

| Page Type | Recommended Sections |
|-----------|---------------------|
| Homepage | Header, Hero, LogoCloud, Features, Stats, Testimonials, FAQ, CTA, Footer |
| Landing | Header, Hero, Features, Video, Testimonials, Pricing, CTA, Footer |
| Service | Header, HeroServices, Features, Process, FAQ, CTA, Footer |
| About | Header, HeroAbout, Story, Team, Timeline, CTA, Footer |
| Contact | Header, HeroContact, Contact, Footer |
| Pricing | Header, Hero, Pricing, Comparison, FAQ, CTA, Footer |

---

## Design Enforcement (MANDATORY)

### Spacing Requirements

Every section MUST follow these spacing rules. See `design-enforcement.md` for complete details.

**Section Padding:**
| Type | Classes | Min Padding |
|------|---------|-------------|
| Standard | `py-16 md:py-20 lg:py-24` | 64px/80px/96px |
| Compact | `py-12 md:py-16 lg:py-20` | 48px/64px/80px |
| Hero | `py-20 md:py-32 lg:py-40` | 80px/128px/160px |

**Container Padding:**
```html
<div class="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
```

### Golden Ratio Layouts (Recommended)

For visually harmonious layouts, use Golden Ratio splits:

```html
<!-- 61.8% / 38.2% split -->
<div class="grid lg:grid-cols-[61.8%_38.2%] gap-8 lg:gap-12">
  <div><!-- Major content --></div>
  <div><!-- Minor content --></div>
</div>
```

### Pre-Generation Checklist

Before generating any page, verify:

- [ ] All sections use proper vertical padding
- [ ] Container has `max-w-7xl mx-auto px-8 md:px-12 lg:px-16`
- [ ] Content does NOT touch viewport edges
- [ ] Grid gaps are consistent (`gap-8` minimum)

### Post-Generation Validation

Run validation after page creation:

```bash
node scripts/validate-design.mjs src/pages/<page-name>.html
```

---

## Related Files

- `src/sections/` - All available section templates
- `src/data/page-blueprints.json` - Blueprint definitions
- `scripts/generate-page.mjs` - Page generator script
- `src/content/` - Content JSON files
- `src/config/design-rules.json` - Spacing and design constants
- `.cursor/prompts/design-enforcement.md` - Mandatory spacing rules
