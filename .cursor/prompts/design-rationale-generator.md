# Design Rationale Generator

## Purpose

Generate documented justifications for every design decision in a section. This prompt produces structured rationale that explains the "why" behind each design choice, mapping decisions to UX principles, StoryBrand elements, persuasion psychology, and current best practices.

## When to Use

- After designing any new section or page
- When preparing client presentations
- During design reviews to validate decisions
- When populating the handoff "Why This Design" overlay
- For training team members on design thinking

## Prerequisites

Before generating rationale:
1. Review `modern-design-standards.md` for applicable principles
2. Review `storybrand-content.md` for content framework alignment
3. Review `persuasion-checklist.md` for psychological triggers
4. Have the section HTML/design ready for analysis

---

## Rationale Generation Process

### Step 1: Section Analysis

For each section, identify:
- **Purpose**: What user problem does this section solve?
- **Goal**: What action should users take after viewing?
- **Position**: Where does this appear in the page flow?
- **StoryBrand Role**: Which of the 7 elements does this map to?

### Step 2: Element-by-Element Rationale

For each significant design element, document:

```markdown
### [Element Name]

**Decision**: [What the design choice is]
**Rationale**: [Why this choice was made]
**UX Principle**: [Which law/principle supports this]
**StoryBrand Alignment**: [Which of the 7 elements this serves]
**Evidence Source**: [Research, best practice, or convention source]
**Accessibility Note**: [Any a11y considerations]
```

### Step 3: Output to JSON

Generate structured data for the handoff overlay:

```json
{
  "sectionId": "hero-001",
  "sectionName": "Hero",
  "sectionPurpose": "Capture attention and communicate primary value proposition",
  "storybrandElement": "Character (Problem) + Call to Action",
  "generatedDate": "2026-01-26",
  "designDecisions": [
    {
      "element": "Headline",
      "decision": "Transformation-focused headline, max 12 words, centered",
      "rationale": "Headlines should promise transformation, not describe features. Centered alignment works for short headlines and creates symmetry in hero sections.",
      "uxPrinciple": "Hick's Law - single clear message reduces decision time",
      "storybrandAlignment": "Opens by identifying what the Character (customer) wants",
      "evidenceSource": "Building a StoryBrand, Chapter 2; Nielsen Norman Group headline research",
      "accessibilityNote": "H1 tag, sufficient contrast, readable font size"
    },
    {
      "element": "Primary CTA Button",
      "decision": "High-contrast color, action verb, prominent size, right-aligned or centered",
      "rationale": "Primary CTAs must be immediately visible and communicate exactly what happens when clicked.",
      "uxPrinciple": "Von Restorff Effect - distinct elements are remembered; Fitts's Law - large targets are easier to click",
      "storybrandAlignment": "Direct CTA - clear call to action with specific outcome",
      "evidenceSource": "Conversion optimization research shows action verbs increase CTR 30-40%",
      "accessibilityNote": "Minimum 44x44px touch target, 4.5:1 contrast ratio, focus state visible"
    }
  ],
  "layoutRationale": {
    "decision": "Single-column centered layout with max-width container",
    "rationale": "Hero sections benefit from focused, distraction-free layouts that draw attention to the primary message and CTA.",
    "uxPrinciple": "Hick's Law - fewer options reduce cognitive load; Z-pattern eye movement supported",
    "source": "Landing page best practices"
  },
  "spacingRationale": {
    "decision": "128px vertical padding desktop, 96px tablet, 64px mobile",
    "rationale": "Generous vertical spacing creates visual breathing room and emphasizes importance of hero content.",
    "source": "modern-design-standards.md spacing standards"
  },
  "colorRationale": {
    "decision": "Dark/gradient background with light text, brand-color CTA",
    "rationale": "High contrast creates visual impact. Brand-color CTA ensures button stands out from surrounding content.",
    "accessibilityNote": "WCAG AA contrast verified: text 8.2:1, CTA 5.1:1"
  },
  "animationRationale": {
    "decision": "Fade-in on load with slight upward movement",
    "rationale": "Subtle entrance animation creates polish without distraction. 300ms duration feels natural.",
    "uxPrinciple": "Aesthetic-Usability Effect - polish increases perceived quality",
    "accessibilityNote": "Respects prefers-reduced-motion media query"
  },
  "mobileConsiderations": {
    "changes": "Full-width CTA, stacked layout, reduced padding",
    "rationale": "Mobile users benefit from edge-to-edge buttons (Fitts's Law - infinite target width at screen edge)"
  },
  "elementorImplementation": {
    "widgets": ["Container (Flexbox)", "Heading", "Text Editor", "Button"],
    "notes": "Use Elementor's Motion Effects for fade-in animation"
  }
}
```

---

## Prompt Template

Use this prompt to generate rationale for a specific section:

```
You are a senior UX designer documenting design decisions for client handoff.

SECTION: [Section name]
SECTION HTML/DESCRIPTION:
[Paste HTML or describe the section design]

PAGE CONTEXT:
- Page: [Homepage/About/Services/etc.]
- Position in page: [1st section, middle, final CTA, etc.]
- Primary goal: [Conversion, information, trust-building, etc.]

BUSINESS CONTEXT:
- Industry: [Industry]
- Target audience: [Audience description]
- Brand voice: [Professional, friendly, bold, etc.]

Generate comprehensive design rationale following this structure:

1. SECTION OVERVIEW
   - Purpose of this section
   - StoryBrand element mapping
   - Key user outcome

2. ELEMENT-BY-ELEMENT RATIONALE
   For each significant element (headline, subheadline, CTA, images, icons, etc.):
   - What: The design decision
   - Why: The rationale
   - Principle: UX law that supports it
   - StoryBrand: How it fits the framework
   - Evidence: Research or best practice source

3. LAYOUT & SPACING RATIONALE
   - Why this layout structure
   - Why this spacing approach
   - Responsive considerations

4. COLOR & TYPOGRAPHY RATIONALE
   - Color choices and psychology
   - Typography hierarchy
   - Accessibility compliance

5. INTERACTION & ANIMATION RATIONALE
   - Any hover/scroll/click interactions
   - Animation choices
   - Performance considerations

6. MOBILE-SPECIFIC RATIONALE
   - What changes on mobile and why
   - Touch target considerations

7. ELEMENTOR IMPLEMENTATION NOTES
   - Suggested widgets
   - Settings to match design
   - Any custom CSS needed

Output the rationale in both:
- Markdown format (for documentation)
- JSON format (for overlay integration, following the schema above)
```

---

## Section-Specific Rationale Templates

### Hero Section Rationale Points

| Element | Key Questions to Answer |
|---------|------------------------|
| Headline | Does it promise transformation? Is it customer-focused? |
| Subheadline | Does it support the headline without repeating? |
| Primary CTA | Is the action clear? Is the outcome obvious? |
| Secondary CTA | Does it offer a lower-commitment alternative? |
| Background | Does it reinforce the message without distraction? |
| Social proof | Is there immediate credibility (logos, stats)? |

### Features Section Rationale Points

| Element | Key Questions to Answer |
|---------|------------------------|
| Section headline | Does it introduce benefits, not features? |
| Feature cards | Are benefits front-loaded? Are icons meaningful? |
| Card layout | Why this number of columns? |
| Order of features | Is the most important first? |

### Testimonials Section Rationale Points

| Element | Key Questions to Answer |
|---------|------------------------|
| Quote selection | Are results specific and measurable? |
| Attribution | Name, role, company, photo included? |
| Layout | Why this presentation style (cards, carousel, single)? |
| Placement | Why here in the page flow? |

### CTA Section Rationale Points

| Element | Key Questions to Answer |
|---------|------------------------|
| Headline | Does it paint the success picture (StoryBrand #7)? |
| Supporting text | Does it reduce anxiety about taking action? |
| Button text | Is it action-oriented with clear outcome? |
| Urgency elements | Are they genuine or manufactured? |

---

## Output Formats

### Markdown Output (for docs)

```markdown
## Section: Hero

### Purpose
Capture attention and communicate the primary value proposition in under 5 seconds.

### StoryBrand Alignment
- **Element**: Character (Problem) + Call to Action
- **Customer as Hero**: Headline speaks to what they want
- **Brand as Guide**: Subheadline positions us as the solution

### Design Decisions

#### 1. Headline: "Transform Your Business Without the Overwhelm"
- **Decision**: Transformation-focused, 7 words, customer-centric
- **Rationale**: StoryBrand research shows transformation headlines outperform feature headlines by 2-3x
- **UX Principle**: Hick's Law—single clear message
- **Source**: Building a StoryBrand, Ch. 2

#### 2. Primary CTA: "Get Your Free Strategy Session"
- **Decision**: Action verb + specific outcome + value indicator (free)
- **Rationale**: Specificity increases click-through; "free" reduces friction
- **UX Principle**: Von Restorff Effect—button is visually distinct
- **Source**: ConversionXL button copy research

[Continue for each element...]
```

### JSON Output (for overlay)

See the JSON schema in Step 3 above. Store in `src/data/section-rationale.json`.

---

## Integration with Handoff Overlay

The generated rationale integrates with the handoff overlay system:

1. **Store rationale**: Save to `src/data/section-rationale.json`
2. **Overlay reads rationale**: `src/scripts/overlay.ts` fetches section rationale
3. **Display in spec card**: New "Why This Design" tab in spec card UI
4. **Export with handoff**: Include in `_handoff/exports/` package

### Overlay UI Enhancement

```
┌─────────────────────────────────────────┐
│ Section: Hero                    [X]    │
├─────────────────────────────────────────┤
│ [Specs] [Why This Design] [Elementor]   │
├─────────────────────────────────────────┤
│                                         │
│ Headline: "Transform Your Business..."  │
│ ├─ Decision: Transformation-focused     │
│ ├─ Principle: Hick's Law                │
│ ├─ StoryBrand: Character's desire       │
│ └─ Source: Building a StoryBrand        │
│                                         │
│ Primary CTA: "Get Free Strategy"        │
│ ├─ Decision: Action verb + outcome      │
│ ├─ Principle: Von Restorff Effect       │
│ └─ StoryBrand: Direct CTA               │
│                                         │
└─────────────────────────────────────────┘
```

---

## Quality Checklist

Before finalizing rationale:

- [ ] Every significant element has documented rationale
- [ ] At least one UX principle cited per decision
- [ ] StoryBrand element identified for content sections
- [ ] Accessibility notes included where relevant
- [ ] Evidence sources are credible (research, not opinion)
- [ ] JSON output validates against schema
- [ ] Rationale is understandable by non-designers
- [ ] Mobile-specific considerations documented
- [ ] Elementor implementation path is clear

---

## Related Files

- `modern-design-standards.md` — UX principles reference
- `storybrand-content.md` — Content framework
- `persuasion-checklist.md` — Psychology principles
- `visual-design-review.md` — Design validation
- `src/data/section-rationale.json` — Stored rationales
- `src/scripts/overlay.ts` — Overlay implementation
- `src/scripts/handoff-portal.ts` — Portal implementation
