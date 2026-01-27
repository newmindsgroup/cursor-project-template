# Modern Design Standards Reference

## Purpose

Comprehensive reference for UX design industry standards, best practices, and current trends. This document serves as the foundational knowledge layer for all design decisions in the system, ensuring every choice is grounded in research and aligned with proven principles.

## When to Use

- Before generating any page or section design
- When validating design decisions
- During design reviews and QA
- When explaining design rationale to clients
- When researching current trends for a project

## Current Context

**Current Year**: 2026
**Last Updated**: January 2026
**Update Frequency**: Review quarterly; major update annually

---

## Part 1: Evergreen UX Principles

These principles are foundational and do not change with trends. Every design decision should be traceable to one or more of these laws.

### 1.1 Cognitive Load Principles

#### Hick's Law
**Definition**: The time to make a decision increases with the number and complexity of choices.

**Application**:
- Limit primary navigation to 5-7 items
- Present one primary CTA per screen/section
- Use progressive disclosure for complex information
- Group related options visually

**Validation Question**: "Can the user make a decision without weighing more than 3-4 options?"

| Element | Maximum Options | Rationale |
|---------|-----------------|-----------|
| Primary navigation | 5-7 | Beyond this, users struggle to scan |
| CTA buttons per section | 1-2 | Primary + optional secondary |
| Feature cards per row | 3-4 | Cognitive chunking limit |
| Form fields visible | 5-7 | Break longer forms into steps |

#### Miller's Law
**Definition**: The average person can hold 7±2 items in working memory.

**Application**:
- Chunk content into groups of 3-5 items
- Use 3-step or 4-step processes (never 8+)
- Limit bullet points to 5-7 per list
- Group related information with visual containers

**Validation Question**: "Is information chunked into digestible groups of 7 or fewer?"

#### Cognitive Load Theory
**Definition**: Learning/comprehension is impaired when working memory is overloaded.

**Application**:
- Remove decorative elements that don't aid comprehension
- Use consistent patterns (reduces extraneous load)
- Provide scaffolding for complex tasks
- Eliminate redundant information

### 1.2 Golden Ratio Principles

#### The Golden Ratio (φ ≈ 1.618)
**Definition**: A mathematical ratio found throughout nature, art, and architecture that creates naturally harmonious proportions. When applied to design, elements sized or positioned according to this ratio feel inherently balanced and pleasing.

**Key Values**:
- φ (phi) = 1.618034
- 1/φ = 0.618034 (inverse)
- Major portion: 61.8%
- Minor portion: 38.2%

**Application**:
- Use 61.8%/38.2% splits for two-column layouts (content/sidebar)
- Apply golden typography scale (base × φ for each step up)
- Size images and cards with 1.618:1 aspect ratio
- Place focal points at golden intersection points
- Use φ-based spacing scale for harmonious rhythm

**Layout Pattern**:
```
┌────────────────────────────────────────┐
│   ┌──────────┐   ┌────────────────┐   │
│   │  38.2%   │   │     61.8%      │   │
│   │  Minor   │   │     Major      │   │
│   └──────────┘   └────────────────┘   │
└────────────────────────────────────────┘
```

**Golden Typography Scale** (base = 16px):
| Step | Multiplier | Size | Use |
|------|-----------|------|-----|
| -2 | 1/φ² | ~10px | Labels, captions |
| -1 | 1/φ | ~12px | Small text |
| 0 | 1 | 16px | Body |
| +1 | φ | ~26px | H2/Section headers |
| +2 | φ² | ~42px | H1/Page titles |
| +3 | φ³ | ~68px | Display/Hero |

**Validation Question**: "Does this layout use golden proportions where visual harmony is important?"

**Implementation**: See `golden-ratio-design.md` prompt and `src/styles/golden-ratio.css` for utilities prefixed with `gr-`.

### 1.3 Interaction Principles

#### Fitts's Law
**Definition**: The time to reach a target is a function of the distance to and size of the target.

**Application**:
- Make CTA buttons large (minimum 44x44px touch targets)
- Place important actions within easy reach
- Use full-width buttons on mobile
- Position related actions close together

**Minimum Touch Targets**:
| Context | Minimum Size | Recommended Size |
|---------|--------------|------------------|
| Mobile buttons | 44x44px | 48x48px |
| Desktop buttons | 32x32px | 40x40px |
| Icon buttons | 44x44px | 48x48px |
| Form inputs | 44px height | 48px height |

#### Fitts's Law Corollary: Edge Targeting
Edges and corners of screens are easiest to reach (infinite width).

**Application**:
- Sticky headers/footers leverage screen edges
- Mobile navigation at bottom of screen
- Full-width CTAs in mobile views

### 1.4 Perception Principles

#### Von Restorff Effect (Isolation Effect)
**Definition**: Items that stand out from their surroundings are more likely to be remembered.

**Application**:
- Make primary CTAs visually distinct (color, size, contrast)
- Use color strategically for emphasis
- Highlight key statistics or testimonials
- Differentiate "recommended" pricing tier

**Implementation Checklist**:
- [ ] Primary CTA has highest contrast on page
- [ ] Key messages use distinct typography
- [ ] Important elements break the visual pattern
- [ ] "Featured" or "popular" items are visually elevated

#### Aesthetic-Usability Effect
**Definition**: Users perceive aesthetically pleasing designs as more usable, even when they're not.

**Application**:
- Invest in visual polish—it affects perceived quality
- Maintain consistent visual language
- Use whitespace generously
- Ensure professional typography and spacing

**Implication**: Beautiful design isn't just nice-to-have; it directly impacts user trust and task completion.

#### Gestalt Principles
**Proximity**: Elements close together are perceived as related.
**Similarity**: Similar elements are perceived as grouped.
**Continuity**: Eyes follow lines and curves.
**Closure**: We complete incomplete shapes.
**Figure-Ground**: We separate foreground from background.

**Application**:
- Group related form fields with proximity
- Use consistent styling for similar functions
- Align elements to create visual flow
- Use whitespace to create figure-ground separation

### 1.5 Behavioral Principles

#### Jakob's Law
**Definition**: Users spend most of their time on other sites and expect yours to work the same way.

**Application**:
- Follow established conventions for common patterns
- Place logo top-left, linking to homepage
- Put navigation in expected locations
- Use familiar icons (hamburger menu, shopping cart, etc.)

**Common Convention Checklist**:
- [ ] Logo: top-left, links to home
- [ ] Navigation: top horizontal or hamburger on mobile
- [ ] Search: top-right area
- [ ] CTA buttons: visually distinct, action-oriented text
- [ ] Footer: legal, secondary nav, contact info
- [ ] Forms: label above field, submit button at bottom

#### Zeigarnik Effect
**Definition**: People remember incomplete tasks better than completed ones.

**Application**:
- Use progress indicators in multi-step processes
- Show "X of Y" completion status
- Tease upcoming content to maintain engagement
- Use "Continue where you left off" patterns

#### Peak-End Rule
**Definition**: People judge experiences by their peak and end, not the average.

**Application**:
- Create memorable moments (peak)
- End interactions on a positive note
- Confirmation pages should celebrate completion
- Error recovery should be smooth and supportive

### 1.6 Reading & Scanning Principles

#### F-Pattern
**Definition**: Users scan text-heavy pages in an F-shaped pattern: across the top, then down the left, with occasional scans right.

**Application**:
- Place most important information in first two paragraphs
- Use meaningful subheadings on left edge
- Front-load important words in headlines and bullets
- Put key CTAs in top-right or within the F-path

**Best For**: Text-heavy pages (blog posts, about pages, documentation)

#### Z-Pattern
**Definition**: For pages with less text, users scan in a Z-pattern: top-left to top-right, diagonally to bottom-left, then across to bottom-right.

**Application**:
- Logo top-left, CTA top-right
- Hero content along the diagonal
- Secondary CTA or key info bottom-right
- Works well for landing pages and homepages

**Best For**: Visual pages, landing pages, homepages

---

## Part 2: Visual Design Standards

### 2.1 Typography Standards

#### Hierarchy Rules
| Level | Use Case | Size Range (Desktop) | Weight |
|-------|----------|---------------------|--------|
| Display | Hero headlines | 48-72px | 700-800 |
| H1 | Page titles | 36-48px | 700 |
| H2 | Section headers | 28-36px | 600-700 |
| H3 | Subsection headers | 22-28px | 600 |
| H4 | Card titles | 18-22px | 600 |
| Body Large | Lead paragraphs | 18-20px | 400 |
| Body | Regular text | 16-18px | 400 |
| Small | Captions, labels | 12-14px | 400 |

#### Readability Standards
| Property | Optimal Range | Rationale |
|----------|---------------|-----------|
| Line height | 1.4-1.6 | Improves readability for body text |
| Line length | 45-75 characters | 66 chars ideal; prevents eye fatigue |
| Paragraph spacing | 1-1.5em | Clear visual separation |
| Letter spacing | 0-0.02em for body | Slight tracking aids readability |

#### Responsive Typography
- Desktop to mobile: reduce by ~25-30%
- Maintain hierarchy ratios
- Never go below 16px for body text
- Increase line height slightly on mobile (1.5-1.7)

### 2.2 Color Standards

#### Contrast Requirements (WCAG 2.1)
| Text Size | Minimum Contrast (AA) | Enhanced Contrast (AAA) |
|-----------|----------------------|-------------------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (≥18px bold or ≥24px) | 3:1 | 4.5:1 |
| UI components | 3:1 | N/A |
| Graphical objects | 3:1 | N/A |

#### Color Psychology Reference
| Color | Associations | Common Use |
|-------|--------------|------------|
| Blue | Trust, stability, professionalism | Finance, tech, healthcare |
| Green | Growth, health, nature, money | Health, finance, eco |
| Orange | Energy, enthusiasm, affordability | Retail, food, CTAs |
| Red | Urgency, passion, importance | Sales, warnings, alerts |
| Purple | Luxury, creativity, wisdom | Beauty, luxury brands |
| Black | Elegance, power, sophistication | Luxury, fashion |
| White | Clean, simple, spacious | Tech, minimalist brands |

#### Color Usage Guidelines
- **Primary**: Brand identity, primary CTAs (15-20% of palette)
- **Secondary**: Accents, hover states (5-10%)
- **Neutral**: Text, backgrounds, borders (60-70%)
- **Semantic**: Success/error/warning/info (5%)

### 2.3 Spacing Standards

#### Spacing Scale (Based on 8px grid)
| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Icon padding, tight spacing |
| sm | 8px | Inline elements, small gaps |
| md | 16px | Standard padding, form gaps |
| lg | 24px | Section padding, card gaps |
| xl | 32px | Major section spacing |
| 2xl | 48px | Section vertical padding |
| 3xl | 64px | Large section separation |
| 4xl | 96px | Hero sections, major breaks |

#### Section Padding Standards
| Section Type | Desktop | Tablet | Mobile |
|--------------|---------|--------|--------|
| Hero | 128px top/bottom | 96px | 64px |
| Standard | 96px top/bottom | 64px | 48px |
| Compact | 64px top/bottom | 48px | 32px |
| Tight | 48px top/bottom | 32px | 24px |

### 2.4 Component Standards

#### Button Standards
| Variant | Use Case | Visual Treatment |
|---------|----------|------------------|
| Primary | Main action | Filled, brand color |
| Secondary | Supporting action | Outlined or ghost |
| Tertiary | Low-emphasis | Text only with hover |
| Destructive | Delete, cancel | Red/warning color |

**Button Text Guidelines**:
- Use action verbs: "Get Started", "Download Guide", "Schedule Call"
- Avoid generic: "Submit", "Click Here", "Learn More"
- Keep under 4 words
- Match button text to what happens next

#### Card Standards
| Property | Standard Value |
|----------|----------------|
| Border radius | 8-16px |
| Shadow | Soft shadow (0.05-0.1 opacity) |
| Padding | 24-32px |
| Gap between cards | 24-32px |

#### Form Standards
| Property | Standard Value | Rationale |
|----------|----------------|-----------|
| Input height | 44-48px | Touch-friendly |
| Label position | Above field | Clearest association |
| Error placement | Below field | Immediate feedback |
| Required indicator | Asterisk (*) | Standard convention |

---

## Part 3: Current Design Trends (2026)

> **Note**: Update this section annually. Last updated: January 2026.

### 3.1 Layout Trends

#### Bento Grid Layouts
- Asymmetric grid cards of varying sizes
- Creates visual interest while maintaining structure
- Works well for feature showcases, dashboards
- **Elementor implementation**: CSS Grid or nested Flex containers

#### Dense Information Design
- More content above the fold
- Efficient use of space without feeling cramped
- Influenced by mobile-first, data-rich applications
- Balance with whitespace for readability

#### Layered/Overlapping Elements
- Sections that overlap slightly
- Cards that break grid boundaries
- Creates depth and visual flow
- Use negative margins or absolute positioning

### 3.2 Visual Style Trends

#### Glassmorphism (Evolution)
- Frosted glass effects with subtle blur
- Works best on colorful/gradient backgrounds
- Use sparingly—affects performance
- **Elementor**: backdrop-filter CSS in custom CSS

#### Gradient Renaissance
- Multi-color gradients, often mesh gradients
- Applied to backgrounds, text, buttons
- More organic, less corporate
- Pairs well with dark mode

#### 3D Elements & Depth
- Subtle 3D objects and illustrations
- Layered shadows for depth
- Floating elements with shadows
- Parallax effects on scroll

#### Dark Mode as Default
- Many sites now launch dark-first
- Improves OLED battery life
- Reduces eye strain in low light
- Requires careful contrast consideration

### 3.3 Interaction Trends

#### Scroll-Driven Animations
- Content animates as user scrolls
- Progress indicators tied to scroll
- Horizontal scroll sections
- **Elementor**: Motion Effects + custom scroll triggers

#### Micro-Interactions
- Subtle feedback on hover/click
- Button state transitions
- Form field animations
- Loading state animations

#### Cursor Interactions
- Custom cursors
- Cursor-following elements
- Magnetic buttons
- Use sparingly—can be distracting

### 3.4 Typography Trends

#### Variable Fonts
- Single font file with adjustable weight/width
- Enables smooth transitions and unique effects
- Better performance than multiple font files
- Growing browser support

#### Oversized Typography
- Large, bold headlines
- Type as visual element
- Works with minimal layouts
- Requires careful responsive handling

#### Mixed Serif + Sans-Serif
- Serif for headlines, sans for body (or vice versa)
- Creates personality and contrast
- Choose complementary pairings

### 3.5 Content & UX Trends

#### AI-Personalized Content
- Dynamic content based on user behavior
- Personalized recommendations
- Adaptive interfaces
- **Elementor**: Dynamic Tags + Custom Fields

#### Conversational Interfaces
- Chat-like interactions
- Guided flows with personality
- Humanized microcopy
- Reduces cognitive load through dialogue

#### Accessibility as Feature
- Accessibility no longer afterthought
- High contrast modes as feature
- Reduced motion options
- Voice navigation support

---

## Part 4: Research & Validation Process

### 4.1 Pre-Design Research Checklist

Before beginning any design:

- [ ] Note current year and quarter (for trend relevance)
- [ ] Identify industry/vertical for the project
- [ ] Research 3-5 competitor/reference sites
- [ ] Identify applicable trends from Part 3
- [ ] Document findings in `design-research-log.json`

### 4.2 Trend Research Sources

**Award Sites** (Visual inspiration):
- Awwwards (awwwards.com)
- CSS Design Awards (cssdesignawards.com)
- FWA (thefwa.com)
- Site Inspire (siteinspire.com)

**Research & Best Practices**:
- Nielsen Norman Group (nngroup.com)
- Baymard Institute (baymard.com)
- UX Collective (uxdesign.cc)
- Smashing Magazine (smashingmagazine.com)

**Trend Reports**:
- Awwwards Annual Report
- Figma Design Trends
- UX Design Institute Reports
- Web Almanac (almanac.httparchive.org)

### 4.3 Evidence-Based Decision Matrix

For each design decision, validate against:

| Criterion | Question | Source |
|-----------|----------|--------|
| UX Principle | Which law supports this? | Part 1 of this document |
| Industry Standard | Is this expected behavior? | Jakob's Law / conventions |
| Accessibility | Does this meet WCAG AA? | Part 2 contrast/size standards |
| Trend Alignment | Is this current or dated? | Part 3 / research |
| Conversion | Does this support the goal? | StoryBrand / Persuasion principles |

---

## Part 5: Quick Reference Checklists

### 5.1 "Don't Make Me Think" Validation

| Question | Pass | Fix If Fail |
|----------|------|-------------|
| Is the page purpose clear in <5 seconds? | □ | Simplify headline |
| Is the primary action obvious? | □ | Increase CTA prominence |
| Can users navigate without instructions? | □ | Use conventions |
| Is content scannable? | □ | Add subheads, bullets |
| Are error states helpful? | □ | Write actionable messages |

### 5.2 Visual Hierarchy Validation

| Question | Pass | Fix If Fail |
|----------|------|-------------|
| Is there a clear #1 element? | □ | Increase size/contrast |
| Do headings follow H1→H2→H3? | □ | Fix hierarchy |
| Are CTAs visually distinct? | □ | Apply Von Restorff |
| Does whitespace guide the eye? | □ | Adjust spacing |
| Is the reading pattern clear? | □ | Align to F or Z pattern |

### 5.3 Responsive Design Validation

| Breakpoint | Check | Standard |
|------------|-------|----------|
| Desktop (1440px+) | □ Full layout, max-width containers | 1200-1440px content width |
| Laptop (1024px) | □ Adjusted spacing, verify grid | 3-4 column grids |
| Tablet (768px) | □ Reduced columns, touch targets | 2 column grids, 44px targets |
| Mobile (375px) | □ Single column, full-width CTAs | Stack all content |

---

## Part 6: Integration with Project Workflow

### When to Reference This Document

| Project Phase | Sections to Consult |
|---------------|---------------------|
| Discovery | Part 4 (Research), Part 3 (Trends) |
| Wireframing | Part 1 (Principles), Part 5 (Checklists) |
| Visual Design | Part 2 (Standards), Part 3 (Trends) |
| Development | Part 2 (Standards), responsive tables |
| QA | Part 5 (All Checklists) |
| Handoff | All parts for documentation |

### Related Prompts

- `golden-ratio-design.md` — Golden Ratio proportions and utilities
- `design-rationale-generator.md` — Generate per-section justifications
- `trend-research-workflow.md` — Systematic trend discovery
- `visual-design-review.md` — Design QA checklist
- `conversion-optimization.md` — Conversion-focused review
- `persuasion-checklist.md` — Psychological principles
- `storybrand-content.md` — Content framework
- `accessibility-audit.md` — WCAG compliance

### Related Data Files

- `src/data/section-rationale.json` — Stored design rationales
- `src/data/design-research-log.json` — Trend research history

---

## Maintenance

**Quarterly Review**:
- Check trend sources for updates
- Validate Part 3 trends are still relevant
- Update any deprecated patterns

**Annual Update**:
- Full review of Part 3 (Trends)
- Update "Current Year" reference
- Research new emerging patterns
- Archive outdated trends with notes

**Update Process**:
1. Document changes in DECISIONS.md
2. Update version note at top of this file
3. Notify team of significant changes
