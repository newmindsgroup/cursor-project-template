# Trend Research Workflow

## Purpose

Systematic process for researching current design trends before beginning any project or major design phase. This ensures designs are contemporary, backed by real-world examples, and appropriate for the project's industry and audience.

## When to Use

- At project kickoff (discovery phase)
- Before designing new pages or sections
- During quarterly design system reviews
- When clients request "modern" or "current" designs
- When updating existing designs

## Current Context

**Current Year**: 2026
**Current Quarter**: Q1 2026

> Always verify the current date before conducting trend research. Searching for "2024 trends" in 2026 will return outdated information.

---

## Part 1: Pre-Research Setup

### 1.1 Define Research Parameters

Before searching, establish:

```markdown
## Research Brief

**Project**: [Project name]
**Industry**: [Industry/vertical]
**Target Audience**: [Demographics, tech-savviness, preferences]
**Brand Personality**: [Modern, traditional, playful, professional, etc.]
**Competitor URLs**: [List 3-5 competitors]
**Reference Sites Client Likes**: [Any sites they've mentioned]
**Constraints**: [Platform limitations, brand guidelines, etc.]
```

### 1.2 Research Scope Selection

| Scope Level | When to Use | Time Investment |
|-------------|-------------|-----------------|
| **Quick** | Small updates, single sections | 15-30 minutes |
| **Standard** | New pages, design refreshes | 1-2 hours |
| **Comprehensive** | New projects, full redesigns | Half day |

---

## Part 2: Research Process

### Step 1: Industry-Specific Trend Search

Search for current year + industry + design keywords:

```
Search queries to run:
- "[industry] website design trends 2026"
- "best [industry] websites 2026"
- "[industry] landing page examples 2026"
- "[industry] web design inspiration"
```

**Document findings**:
- Screenshots of relevant examples
- URLs for reference
- Specific elements that stand out
- Patterns across multiple sites

### Step 2: General Design Trend Review

Review current trends from authoritative sources:

**Award Sites** (check recent winners):
- awwwards.com/websites/sites-of-the-day/
- cssdesignawards.com/website-gallery
- thefwa.com/cases/page/1
- siteinspire.com (filter by recent)

**Trend Articles** (search for current year):
- "web design trends 2026 awwwards"
- "UI design trends 2026"
- "UX trends 2026 nngroup"

**Design Publications**:
- uxdesign.cc
- smashingmagazine.com
- designernews.co

### Step 3: Section-Specific Research

For each major section type needed, research best examples:

| Section Type | Search Query |
|--------------|--------------|
| Hero | "hero section design 2026", "above the fold examples" |
| Features | "feature section layouts", "bento grid examples" |
| Testimonials | "testimonial section design", "social proof layouts" |
| Pricing | "pricing page design 2026", "pricing table UX" |
| Contact | "contact page design", "contact form UX" |
| Footer | "footer design trends", "mega footer examples" |

### Step 4: Animation & Interaction Research

Identify current interaction patterns:

**Search queries**:
- "web animation trends 2026"
- "scroll animation examples"
- "micro-interaction examples"
- "hover effect trends"

**Demo sites to review**:
- codrops.com (experimental techniques)
- tympanus.net/codrops/demos/ (interaction demos)
- uimovement.com (UI animations)

### Step 5: Competitive Analysis

For each competitor identified:

```markdown
## Competitor: [Name]
**URL**: [URL]
**Screenshot**: [Attach or link]

### Visual Style
- Color palette: [Description]
- Typography: [Fonts, style]
- Imagery: [Photo style, illustrations]
- Overall feel: [Modern/traditional/playful/etc.]

### Layout Patterns
- Hero approach: [Description]
- Section structure: [Description]
- Navigation: [Description]
- Mobile experience: [Description]

### Interactions
- Animations: [What moves, scroll effects]
- Hover states: [Notable hovers]
- Forms: [Form UX approach]

### Strengths to Consider
- [What they do well]

### Weaknesses to Differentiate
- [What could be better]
```

---

## Part 3: Research Documentation

### 3.1 Research Log Entry

After completing research, log findings to `src/data/design-research-log.json`:

```json
{
  "entries": [
    {
      "id": "research-2026-01-26-001",
      "project": "Client Project Name",
      "date": "2026-01-26",
      "researcher": "Designer Name",
      "scope": "standard",
      "industry": "Professional Services",
      "parameters": {
        "targetAudience": "Small business owners, 35-55",
        "brandPersonality": "Professional, trustworthy, approachable",
        "constraints": ["Elementor Pro", "Existing brand colors"]
      },
      "trendsIdentified": [
        {
          "trend": "Bento grid layouts",
          "relevance": "high",
          "application": "Features section, services overview",
          "examples": ["stripe.com", "linear.app"],
          "implementationNotes": "CSS Grid in Elementor, 3-column asymmetric"
        },
        {
          "trend": "Subtle scroll animations",
          "relevance": "medium",
          "application": "Section entrances, stat counters",
          "examples": ["apple.com product pages"],
          "implementationNotes": "Elementor Motion Effects, fade-in-up"
        },
        {
          "trend": "Glassmorphism cards",
          "relevance": "low",
          "application": "Not recommended for this audience",
          "examples": [],
          "implementationNotes": "Skip - may feel too trendy for professional services"
        }
      ],
      "competitorInsights": [
        {
          "competitor": "Competitor A",
          "url": "https://competitor-a.com",
          "strengths": ["Clean typography", "Clear value proposition"],
          "weaknesses": ["Outdated hero", "Poor mobile experience"],
          "differentiationOpportunity": "Modern hero with video background"
        }
      ],
      "referenceSites": [
        {
          "url": "https://example-inspiration.com",
          "relevance": "Hero layout inspiration",
          "screenshot": "_handoff/assets/research/ref-001.png"
        }
      ],
      "recommendedApproach": {
        "visualDirection": "Clean, modern professional with subtle animations",
        "keyPatterns": ["Bento grid features", "Scroll-triggered stats", "Video hero"],
        "avoidPatterns": ["Heavy glassmorphism", "Dark mode (audience preference)", "Experimental navigation"],
        "colorApproach": "Use existing brand colors with modern gradient accents",
        "typographyApproach": "Modern sans-serif, generous line height, clear hierarchy"
      },
      "decisionsInfluenced": [
        "Hero will use video background with overlay text",
        "Features section will use 3-column bento layout",
        "Testimonials will use card carousel pattern"
      ]
    }
  ]
}
```

### 3.2 Visual Moodboard

For comprehensive research, create a visual moodboard:

**Moodboard Contents**:
- 5-10 screenshot crops of relevant patterns
- Color palette samples from research
- Typography examples
- Interaction/animation references (GIFs or links)

**Storage Location**: `_handoff/assets/research/[project-name]/`

---

## Part 4: Applying Research to Design

### 4.1 Trend Evaluation Matrix

For each trend identified, evaluate fit:

| Trend | Audience Fit | Brand Fit | Technical Fit | Longevity | Decision |
|-------|--------------|-----------|---------------|-----------|----------|
| Bento grids | High | High | Medium | High | **Use** |
| Glassmorphism | Low | Medium | High | Medium | Skip |
| Scroll animations | High | High | High | High | **Use** |
| Custom cursors | Low | Low | High | Low | Skip |
| Variable fonts | Medium | High | Medium | High | Consider |

**Scoring Guide**:
- **Audience Fit**: Will the target audience appreciate/expect this?
- **Brand Fit**: Does it align with brand personality?
- **Technical Fit**: Can this be implemented in Elementor/WordPress?
- **Longevity**: Will this age well or feel dated in 1-2 years?

### 4.2 Pattern Selection

Based on evaluation, select patterns for each section:

```markdown
## Selected Design Patterns

### Hero Section
- **Pattern**: Full-width video background with gradient overlay
- **Source**: Research entry research-2026-01-26-001
- **Reference**: stripe.com hero approach
- **Rationale**: Creates immediate visual impact, differentiates from competitors using static images

### Features Section
- **Pattern**: Bento grid layout (3 columns, asymmetric)
- **Source**: Trend research - highly relevant for 2026
- **Reference**: linear.app features section
- **Rationale**: Modern layout that showcases multiple features without overwhelming

### Testimonials Section
- **Pattern**: Card carousel with auto-advance
- **Source**: Industry standard with modern styling
- **Reference**: Competitor A approach (improved)
- **Rationale**: Allows multiple testimonials without excessive scroll
```

### 4.3 Integration with Design System

Map selected patterns to project implementation:

| Pattern | Design Token Updates | Component Updates | Elementor Setup |
|---------|---------------------|-------------------|-----------------|
| Bento grid | `grid-gap: 24px` | New grid component | Container + nested Flex |
| Video hero | `overlay-opacity: 0.7` | Hero variant | Background video setting |
| Card carousel | `card-radius: 16px` | Testimonial card | Testimonial Carousel widget |

---

## Part 5: Research Prompt Templates

### Quick Trend Check Prompt

```
Current date: [DATE - e.g., January 26, 2026]

I need a quick trend check for a [INDUSTRY] website project.

Search for:
1. "[INDUSTRY] website design trends [CURRENT YEAR]"
2. "best [INDUSTRY] websites [CURRENT YEAR]"

Provide:
- Top 3 relevant visual trends
- Top 3 relevant UX patterns
- 2-3 reference site URLs
- Quick recommendation for this project
```

### Comprehensive Research Prompt

```
Current date: [DATE]

Conduct comprehensive design research for:

PROJECT: [Project name]
INDUSTRY: [Industry]
TARGET AUDIENCE: [Audience description]
COMPETITORS: [List URLs]
BRAND PERSONALITY: [Description]
PLATFORM: Elementor Pro on WordPress

Research tasks:
1. Search "[INDUSTRY] website design trends [YEAR]" - identify 5+ trends
2. Review awwwards.com winners from past 3 months - note relevant patterns
3. Analyze each competitor - document strengths/weaknesses
4. Search for section-specific inspiration: hero, features, testimonials, CTA
5. Research current animation/interaction trends

Output:
- Structured research log (JSON format)
- Trend evaluation matrix
- Recommended patterns per section
- Risk assessment for trendy vs. timeless choices
- Elementor implementation feasibility notes
```

### Trend Validation Prompt

```
Current date: [DATE]

Validate if this design approach is current:

DESIGN DESCRIPTION:
[Describe the design or paste key visual elements]

INDUSTRY: [Industry]
TARGET AUDIENCE: [Audience]

Evaluate:
1. Is this visual style current for [YEAR]?
2. What elements feel dated?
3. What elements are on-trend?
4. Specific improvements to modernize
5. Trend longevity assessment (will it age well?)
```

---

## Part 6: Maintaining Currency

### Quarterly Trend Review

Every quarter, update the research baseline:

1. Review `modern-design-standards.md` Part 3 (Trends)
2. Check award sites for new patterns
3. Update trend evaluation criteria
4. Archive outdated trends with notes
5. Document changes in `DECISIONS.md`

### Annual Major Update

Each January:

1. Full review of all trend documentation
2. Update "Current Year" references across all prompts
3. Research major annual trend reports
4. Update `modern-design-standards.md` Part 3 completely
5. Review and update section blueprints for new patterns

### Trigger-Based Updates

Update research when:

- Client mentions a new competitor
- Awwwards announces Site of the Year
- Major platform (Apple, Google) launches new design
- Design publication releases trend report
- Team notices pattern becoming common

---

## Part 7: Research Quality Standards

### Credible Sources

**Prefer**:
- Award-winning sites (vetted for quality)
- Established design publications
- Research-backed articles (nngroup, baymard)
- Industry-specific best-in-class examples

**Avoid**:
- Template showcase sites (outdated patterns)
- "100 examples" listicles (low quality)
- Social media design posts (often gimmicks)
- Single-source trend claims

### Trend vs. Fad Assessment

| Indicator | Trend (Adopt) | Fad (Caution) |
|-----------|---------------|---------------|
| Multiple sources reporting | Yes | No - single source hype |
| Seen on major brand sites | Yes | No - only experimental sites |
| Serves user needs | Yes | No - purely decorative |
| Works across industries | Generally | Niche only |
| Progressive enhancement | Yes | Requires latest tech only |

### Documentation Standards

All research must include:
- [ ] Date research was conducted
- [ ] Sources consulted (URLs)
- [ ] Screenshots/evidence
- [ ] Relevance assessment for project
- [ ] Implementation feasibility
- [ ] Longevity/risk assessment

---

## Related Files

- `modern-design-standards.md` — Contains evergreen principles + current trends
- `design-rationale-generator.md` — Uses research to justify decisions
- `visual-design-review.md` — Validates designs against standards
- `src/data/design-research-log.json` — Stores research history
- `_handoff/assets/research/` — Visual research assets

---

## Quick Reference: Search Templates

```
# Industry trends
[industry] website design trends [current year]
best [industry] websites [current year]
[industry] landing page examples

# Section-specific
best hero section designs [current year]
feature section layouts [current year]
testimonial section design examples
pricing page UX best practices
contact form design trends

# Interaction/animation
scroll animation web design [current year]
micro-interaction examples
hover effect trends web design

# Platform-specific
elementor website examples [current year]
wordpress website design trends

# Competitive
[competitor name] website design analysis
[industry] competitor website comparison
```
