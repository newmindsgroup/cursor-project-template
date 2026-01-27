# Design Variants Generator

Generate multiple distinct design options for client presentation, each with documented strategic rationale.

## Purpose

When clients need to see options before committing to a design direction, this workflow produces 2-4 distinct page variants that differ meaningfully in approach, not just superficially in color or font. Each variant is backed by strategic reasoning to facilitate informed client decisions.

## When to Use

- Homepage design (recommended: always present options)
- Key landing pages with high conversion stakes
- When the client explicitly requests to see alternatives
- When the design direction is unclear or debatable
- When multiple valid strategic approaches exist

## When NOT to Use

- Standard inner pages following established patterns
- Legal/utility pages (Privacy, Terms, 404)
- Pages with strictly defined requirements
- When client has already approved a design direction

---

## Variant Generation Process

### Step 1: Define the Page Context

Before generating variants, establish:

```markdown
## Page Context

**Page**: [Homepage / Landing Page / Service Page / etc.]
**Primary Goal**: [Lead generation / Sales / Information / Trust-building]
**Target Audience**: [Primary persona description]
**Key Message**: [Single most important takeaway]
**Desired Action**: [What should visitors do?]
**Brand Positioning**: [Premium / Accessible / Bold / Professional / etc.]
```

### Step 2: Identify Variant Dimensions

Each variant must differ in at least 2-3 of these dimensions:

| Dimension | Options |
|-----------|---------|
| **Visual Mood** | Bold/Dark, Light/Airy, Colorful/Vibrant, Minimal/Clean, Editorial/Magazine |
| **Hero Strategy** | Video-first, Image-focused, Text-dominant, Testimonial-led, Stats-driven |
| **Content Priority** | Benefits-first, Social-proof-first, Problem-agitation, Solution-focused |
| **Layout Approach** | Full-width immersive, Contained/Structured, Asymmetric/Dynamic, Grid-based, **Golden Ratio Split** |
| **Conversion Approach** | Soft (educate first), Direct (CTA prominent), Progressive (multiple touchpoints) |
| **Pacing** | Fast (short sections), Deliberate (long-form), Mixed rhythm |

### Step 2.1: Design Enforcement (MANDATORY)

**ALL variants must comply with spacing rules**. Regardless of visual approach:

- Section padding: `py-16 md:py-20 lg:py-24` minimum
- Container padding: `px-8 md:px-12 lg:px-16` 
- Max-width: `max-w-7xl mx-auto`
- No content touching viewport edges

**Golden Ratio Recommendation**: At least one variant should showcase Golden Ratio layouts:
- 61.8%/38.2% content splits
- Golden aspect ratio images (1.618:1)
- Golden Ratio typography scale

### Step 3: Generate Variants

Create 2-4 distinct variants. For each variant:

#### Variant Template

```markdown
## Variant [A/B/C/D]: [Variant Name]

### Strategic Approach
[2-3 sentences describing the overall philosophy of this variant]

### Key Differentiators
- **Visual Mood**: [Description]
- **Hero Strategy**: [Description]
- **Content Priority**: [Description]
- **Conversion Approach**: [Description]

### Section Composition
1. Header
2. [Hero type] - [Brief description]
3. [Section] - [Why this section here]
4. [Section] - [Why this section here]
5. ... 
6. CTA
7. Footer

### Why This Works
[3-4 bullet points on the strategic reasoning]
- UX Principle: [Which law/principle supports this]
- Psychology: [What psychological trigger this leverages]
- Audience Fit: [Why this resonates with the target audience]

### Design Compliance
- [ ] Section padding meets minimum (py-16+)
- [ ] Container padding meets minimum (px-8+)
- [ ] Content does not touch edges
- [ ] Golden Ratio applied: [Yes/No - describe where]

### Best For
[Describe the scenario/client type where this variant excels]

### Trade-offs
[Honest assessment of what this variant sacrifices]
```

### Step 4: Generate the Pages

For each variant, run:

```bash
node scripts/generate-page.mjs homepage-v1 --sections Hero,LogoCloud,Features,Stats,Testimonials,FAQ,CTA
node scripts/generate-page.mjs homepage-v2 --sections HeroVideo,Stats,Features,Process,Testimonials,CTA
node scripts/generate-page.mjs homepage-v3 --sections HeroTestimonial,LogoCloud,Features,FAQ,Stats,CTA
```

Customize section content for each variant to reflect the distinct approach.

### Step 5: Document Rationale

For each variant, generate design rationale using `design-rationale-generator.md` to populate:
- `src/data/design-variants/[page]-v[N]-rationale.json`

---

## Example: Homepage Variants

### Variant A: "Trust-First Authority"

**Strategic Approach**: Lead with credibility to overcome skepticism. Ideal for markets where trust is the primary barrier to conversion.

**Key Differentiators**:
- **Visual Mood**: Professional, clean, lots of white space
- **Hero Strategy**: Testimonial-led with client logos
- **Content Priority**: Social proof before features
- **Conversion Approach**: Soft—build trust, then convert

**Section Composition**:
1. Header
2. Hero (minimal text + large client quote)
3. LogoCloud (major client logos)
4. Stats (impressive numbers)
5. Features (3-column grid)
6. Testimonials (carousel with photos)
7. FAQ
8. CTA (gentle "Let's Talk")
9. Footer

**Why This Works**:
- Social Proof principle: Others' actions validate the choice
- Reduces perceived risk before asking for commitment
- Appeals to risk-averse decision makers
- Works well for B2B and high-consideration purchases

**Best For**: Professional services, B2B, enterprise sales, industries with trust issues

**Trade-offs**: May feel less energetic; slower path to CTA

---

### Variant B: "Bold Transformation"

**Strategic Approach**: Create emotional impact with bold visuals and transformation-focused messaging. For clients who want to stand out.

**Key Differentiators**:
- **Visual Mood**: Dark/bold, high contrast, dynamic
- **Hero Strategy**: Full-bleed image/video with overlay text
- **Content Priority**: Benefits and transformation first
- **Conversion Approach**: Direct—prominent CTAs throughout

**Section Composition**:
1. Header (transparent over hero)
2. Hero (full-screen video/image, bold headline)
3. Features (benefit-focused, icons)
4. Process (how transformation happens)
5. Stats (contrasting numbers)
6. Testimonials (video testimonials)
7. CTA (bold, contrasting)
8. Footer

**Why This Works**:
- Von Restorff Effect: Distinctive design is memorable
- Emotional engagement drives action
- Appeals to aspirational buyers
- Creates brand differentiation

**Best For**: Creative agencies, disruptors, brands targeting younger audiences

**Trade-offs**: May alienate conservative audiences; less content density

---

### Variant C: "Methodical Educator"

**Strategic Approach**: Provide comprehensive information for analytical buyers who research thoroughly before deciding.

**Key Differentiators**:
- **Visual Mood**: Light, structured, editorial
- **Hero Strategy**: Problem-agitation headline with supporting context
- **Content Priority**: Education before conversion
- **Conversion Approach**: Progressive—multiple soft CTAs, one strong final CTA

**Section Composition**:
1. Header
2. Hero (problem-focused headline)
3. Story (the problem in detail)
4. Features (detailed feature grid)
5. Process (step-by-step methodology)
6. Comparison (vs. alternatives)
7. FAQ (comprehensive)
8. Testimonials
9. Pricing preview
10. CTA
11. Footer

**Why This Works**:
- Addresses the "I need more information" objection
- Builds authority through demonstrated expertise
- Satisfies analytical decision-makers
- Higher quality leads (more informed)

**Best For**: Technical products, considered purchases, B2B with long sales cycles

**Trade-offs**: Longer page; may lose impulsive buyers; more content to maintain

---

## Client Presentation Format

When presenting variants to clients, use this structure:

```markdown
# Design Options for [Page Name]

## Overview

We've prepared [N] distinct design directions for your [page type]. Each approach is strategically valid but optimized for different outcomes.

| | Variant A | Variant B | Variant C |
|---|-----------|-----------|-----------|
| **Name** | Trust-First | Bold Impact | Educator |
| **Best For** | Risk-averse buyers | Aspirational buyers | Analytical buyers |
| **Feel** | Professional | Energetic | Informative |
| **CTA Style** | Soft | Direct | Progressive |

## Variant Details

[Include variant descriptions from above]

## Our Recommendation

Based on [specific business context], we recommend **Variant [X]** because:
1. [Reason aligned with their goals]
2. [Reason aligned with their audience]
3. [Reason aligned with their brand]

However, Variant [Y] would also be strong if [alternative scenario].

## Next Steps

1. Review each variant in the prototype
2. Share feedback on what resonates
3. We can hybrid elements from multiple variants if desired
4. Final direction locks in for development
```

---

## File Outputs

When generating variants, create these files:

```
src/pages/
├── homepage-v1.html
├── homepage-v2.html
├── homepage-v3.html

src/data/design-variants/
├── homepage-variants.json      # Summary of all variants
├── homepage-v1-rationale.json  # Detailed rationale for V1
├── homepage-v2-rationale.json
├── homepage-v3-rationale.json

_handoff/exports/
├── design-options-[page].md    # Client presentation document
```

### Variant Summary Schema

```json
{
  "page": "homepage",
  "generatedDate": "2026-01-26",
  "variants": [
    {
      "id": "v1",
      "name": "Trust-First Authority",
      "file": "homepage-v1.html",
      "approach": "Lead with credibility and social proof",
      "mood": "Professional, clean",
      "heroType": "Testimonial-led",
      "conversionStyle": "Soft",
      "bestFor": "B2B, professional services",
      "sections": ["Hero", "LogoCloud", "Stats", "Features", "Testimonials", "FAQ", "CTA"],
      "selected": false,
      "clientFeedback": ""
    }
  ],
  "recommendation": {
    "variantId": "v1",
    "reason": "Aligns with target audience's risk-averse decision making"
  },
  "decision": {
    "selectedVariantId": null,
    "decidedDate": null,
    "decidedBy": "",
    "notes": ""
  }
}
```

---

## Decision Tracking

After the client selects a variant:

1. Update `homepage-variants.json` with decision data
2. Rename selected variant to final page name:
   ```bash
   mv src/pages/homepage-v2.html src/pages/index.html
   ```
3. Archive other variants:
   ```bash
   mv src/pages/homepage-v1.html src/pages/_archive/
   mv src/pages/homepage-v3.html src/pages/_archive/
   ```
4. Log decision in `DECISIONS.md`:
   ```markdown
   ## Homepage Design Direction (2026-01-26)
   
   **Decision**: Selected Variant B "Bold Transformation"
   
   **Alternatives Considered**:
   - Variant A (Trust-First): Rejected—client wanted more energy
   - Variant C (Educator): Rejected—too content-heavy for launch
   
   **Rationale**: Client prioritizes brand differentiation and targets
   a younger demographic. Bold approach aligns with brand refresh goals.
   ```

---

## Integration with Sitemap

Variants are tracked in the sitemap via the `deliverables.visualDesign` field:

```json
{
  "id": "home",
  "slug": "/",
  "deliverables": {
    "wireframe": { "status": "complete" },
    "visualDesign": {
      "status": "review",
      "variants": ["v1", "v2", "v3"],
      "selectedVariant": null
    }
  }
}
```

The sitemap portal displays which pages have variants pending client decision.

---

## Prompt Template

Use this prompt to request variant generation:

```
Generate [2/3/4] design variants for the [page name] page.

Page Context:
- Goal: [Primary goal]
- Audience: [Target audience]
- Brand: [Brand personality]
- Key differentiator: [What makes this business unique]

Requirements:
- Each variant must differ in visual mood and content priority
- Include section composition for each
- Document strategic rationale
- Recommend one variant with justification

Output:
1. Variant descriptions (per template above)
2. Generate page files for each variant
3. Create variants summary JSON
4. Create client presentation markdown
```

---

## Related Files

- `compose-page.md` — Page generation workflow
- `design-rationale-generator.md` — Rationale documentation
- `design-enforcement.md` — **MANDATORY** spacing requirements
- `golden-ratio-design.md` — Golden Ratio principles
- `modern-design-standards.md` — Design principles reference
- `src/data/page-blueprints.json` — Section blueprints
- `src/data/design-variants/` — Variant data storage
- `src/config/design-rules.json` — Centralized spacing constants
