# Design Decision Framework

## Purpose

Master validation checklist and decision-making process for all design work. This framework ensures every design decision is intentional, justified, and aligned with UX principles, StoryBrand methodology, and current best practices.

**Use this framework before finalizing any section or page design.**

---

## Framework Overview

Every design decision should pass through seven validation gates:

```
┌─────────────────────────────────────────────────────────────────┐
│                   DESIGN DECISION GATES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PURPOSE          → Why does this section exist?              │
│         ↓                                                        │
│  2. UX PRINCIPLES    → Which laws support this design?           │
│         ↓                                                        │
│  3. STORYBRAND       → How does this serve the customer?         │
│         ↓                                                        │
│  4. PERSUASION       → What psychological triggers apply?        │
│         ↓                                                        │
│  5. TREND ALIGNMENT  → Is this current or dated?                 │
│         ↓                                                        │
│  6. ACCESSIBILITY    → Does this work for everyone?              │
│         ↓                                                        │
│  7. IMPLEMENTATION   → Can this be built effectively?            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Gate 1: Purpose Validation

Before designing, answer these questions:

### Core Purpose Questions

| Question | Answer Required |
|----------|-----------------|
| What user problem does this section solve? | [Specific problem statement] |
| What action should users take after viewing? | [Specific action/next step] |
| Is this section necessary? | [Yes with justification / No - eliminate] |
| What happens if we remove this section? | [Impact assessment] |

### Purpose Checklist

- [ ] Section has a clear, single purpose
- [ ] Purpose aligns with page goal
- [ ] Purpose serves user needs (not just business wants)
- [ ] Section cannot be combined with another
- [ ] Removing section would harm user experience

### Red Flags

- "This section exists because competitors have it" → Evaluate actual need
- "This is just nice to have" → Consider eliminating
- "We need something here" → Define specific purpose first

---

## Gate 2: UX Principles Applied

Every significant design element should map to at least one UX principle.

### Primary Principles Checklist

#### Cognitive Load (Hick's Law + Miller's Law)
- [ ] Choices limited to 5-7 options maximum
- [ ] Information chunked into digestible groups
- [ ] Progressive disclosure for complex content
- [ ] Single primary message per section

#### Interaction (Fitts's Law)
- [ ] Touch targets minimum 44x44px
- [ ] Important actions within easy reach
- [ ] Related actions grouped together
- [ ] Full-width CTAs on mobile

#### Perception (Von Restorff + Gestalt)
- [ ] Primary CTA visually distinct
- [ ] Key information stands out
- [ ] Related elements grouped visually
- [ ] Clear figure-ground separation

#### Behavior (Jakob's Law + Conventions)
- [ ] Follows established patterns
- [ ] Navigation in expected location
- [ ] Icons are universally understood
- [ ] No surprising interactions

### Principle Documentation

For each major element, document:

```markdown
**Element**: [Element name]
**Principle Applied**: [UX law]
**Implementation**: [How principle is applied]
**Validation**: [How we verify compliance]
```

---

## Gate 3: StoryBrand Alignment

Map each section to the StoryBrand framework.

### StoryBrand 7-Part Framework

| # | Element | Section Types | Key Question |
|---|---------|---------------|--------------|
| 1 | **Character** | Hero, About | Who is the customer and what do they want? |
| 2 | **Problem** | Hero, Features | What stands in their way? (External, Internal, Philosophical) |
| 3 | **Guide** | About, Authority | How do we show empathy and authority? |
| 4 | **Plan** | Process, How It Works | What are the simple steps? |
| 5 | **Call to Action** | CTA, Hero, Pricing | What should they do? (Direct + Transitional) |
| 6 | **Failure** | Stakes, Why Now | What do they lose if they don't act? |
| 7 | **Success** | CTA, Testimonials | What transformation awaits? |

### StoryBrand Checklist

For each content section:

- [ ] Identified which of the 7 elements this serves
- [ ] Customer is positioned as hero (not the brand)
- [ ] Brand is positioned as guide (empathy + authority)
- [ ] Language focuses on transformation, not features
- [ ] Clear call to action present

### StoryBrand Validation Questions

| Question | Expected Answer |
|----------|-----------------|
| Who is the hero of this section? | The customer |
| What does the customer want? | [Specific desire] |
| What problem does this address? | [External/Internal/Philosophical] |
| How do we show empathy? | [Specific empathy statement] |
| How do we show authority? | [Credentials/results/social proof] |
| What's the simple plan? | [3-4 clear steps] |
| What's the call to action? | [Direct CTA + Transitional CTA] |

---

## Gate 4: Persuasion Principles

Apply ethical persuasion triggers appropriately.

### Six Principles Checklist

#### 1. Reciprocity
- [ ] Value provided before asking for action
- [ ] Free resources genuinely helpful
- [ ] No strings attached feeling

#### 2. Commitment & Consistency
- [ ] Small first steps available
- [ ] Progressive engagement path
- [ ] Identity alignment messaging

#### 3. Social Proof
- [ ] Testimonials with specific results
- [ ] Client logos visible
- [ ] Numbers and statistics shown
- [ ] Reviews from external platforms

#### 4. Authority
- [ ] Credentials demonstrated (not claimed)
- [ ] Case studies with outcomes
- [ ] Media mentions/awards shown
- [ ] Expert positioning clear

#### 5. Liking
- [ ] Relatable, authentic voice
- [ ] Team personalities visible
- [ ] Shared values highlighted
- [ ] Genuine warmth expressed

#### 6. Scarcity (Use Ethically)
- [ ] Any limitations are genuine
- [ ] Deadlines are real
- [ ] No manufactured urgency
- [ ] FOMO elements are honest

### Persuasion Scoring

Rate each principle 0-5 for the section:

| Principle | Present? | Score (0-5) | Notes |
|-----------|----------|-------------|-------|
| Reciprocity | | | |
| Commitment | | | |
| Social Proof | | | |
| Authority | | | |
| Liking | | | |
| Scarcity | | | |
| **Total** | | **/30** | |

**Interpretation**:
- 25-30: Excellent persuasion foundation
- 18-24: Good, with room for improvement
- Below 18: Review persuasion-checklist.md for gaps

---

## Gate 5: Trend Alignment

Validate design is current without being gimmicky.

### Trend Validation Questions

| Question | Response |
|----------|----------|
| Does this reflect [current year] design expectations? | Yes/No + Evidence |
| Is this pattern supported by reference examples? | [List examples] |
| Will this age well (not feel dated in 2 years)? | Yes/No + Rationale |
| Is this trend appropriate for the target audience? | Yes/No + Reasoning |
| Can this be implemented in Elementor effectively? | Yes/No + Approach |

### Trend Evaluation Matrix

For each trendy element:

| Element | Trend | Audience Fit | Brand Fit | Longevity | Decision |
|---------|-------|--------------|-----------|-----------|----------|
| | | High/Med/Low | High/Med/Low | High/Med/Low | Use/Skip |

### Trend Red Flags

- [ ] Trend only seen on experimental/award sites → Evaluate audience fit
- [ ] Trend requires cutting-edge browser support → Check browser stats
- [ ] Trend is purely decorative with no UX benefit → Consider skipping
- [ ] Trend conflicts with accessibility → Do not use
- [ ] Trend will require significant custom code → Assess ROI

---

## Gate 6: Accessibility & Performance

Ensure design works for everyone and performs well.

### Accessibility Checklist (WCAG AA)

#### Visual
- [ ] Color contrast meets 4.5:1 for text (3:1 for large text)
- [ ] Color is not the only means of conveying information
- [ ] Focus states visible for all interactive elements
- [ ] Text can be resized to 200% without loss of functionality

#### Interaction
- [ ] All functionality available via keyboard
- [ ] Touch targets minimum 44x44px
- [ ] No keyboard traps
- [ ] Skip links available for navigation

#### Content
- [ ] All images have appropriate alt text
- [ ] Headings follow logical hierarchy (H1 → H2 → H3)
- [ ] Form fields have associated labels
- [ ] Error messages are descriptive and helpful

#### Motion
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No content flashes more than 3 times per second
- [ ] Auto-playing media has controls

### Performance Checklist

- [ ] Images optimized (WebP format, appropriate sizes)
- [ ] Lazy loading for below-fold content
- [ ] No excessive DOM elements
- [ ] Animations use GPU-accelerated properties
- [ ] Fonts subset and preloaded
- [ ] Critical CSS above fold

---

## Gate 7: Implementation Feasibility

Validate the design can be built effectively.

### Elementor Implementation Checklist

- [ ] All layouts achievable with Flexbox containers
- [ ] Animations available via Motion Effects
- [ ] No custom code required (or custom code is documented)
- [ ] Responsive behavior is straightforward
- [ ] Global styles can be used consistently

### Implementation Questions

| Question | Answer |
|----------|--------|
| Which Elementor widgets are needed? | [List widgets] |
| Are any pro-only features required? | Yes/No - [Which ones] |
| Custom CSS needed? | Yes/No - [What for] |
| Custom JavaScript needed? | Yes/No - [What for] |
| Third-party plugins required? | Yes/No - [Which ones] |
| Estimated build complexity | Low/Medium/High |

### Implementation Red Flags

- Design requires features not in Elementor → Simplify or document workaround
- Animation requires custom JavaScript → Evaluate necessity
- Layout requires absolute positioning → Consider simpler approach
- Design will perform poorly → Optimize or simplify

---

## Complete Section Review Template

Use this template for each section before finalizing:

```markdown
## Section: [Section Name]

### Gate 1: Purpose
- Purpose: [Clear statement]
- User action: [What should they do next?]
- Necessity: [Why this section must exist]

### Gate 2: UX Principles
- Primary principle: [Which law applies]
- Supporting principles: [Additional laws]
- Validation: [How we verify]

### Gate 3: StoryBrand
- Element: [1-7 which element]
- Customer as hero: [How demonstrated]
- Brand as guide: [How demonstrated]

### Gate 4: Persuasion
- Primary trigger: [Which principle]
- Supporting triggers: [Additional principles]
- Score: [X/30]

### Gate 5: Trends
- Current patterns used: [List]
- Longevity assessment: [Will it age well?]
- References: [Example sites]

### Gate 6: Accessibility
- Contrast: [Pass/Fail]
- Keyboard: [Pass/Fail]
- Screen reader: [Pass/Fail]
- Reduced motion: [Supported?]

### Gate 7: Implementation
- Elementor widgets: [List]
- Custom code: [Yes/No - details]
- Complexity: [Low/Medium/High]

### Final Decision
- [ ] All gates pass
- [ ] Ready for implementation
- [ ] Rationale documented
```

---

## Quick Decision Flowchart

```
START: New design element
         │
         ▼
┌─────────────────────┐
│ Does it have a      │──No──▶ ELIMINATE
│ clear purpose?      │
└─────────┬───────────┘
          │Yes
          ▼
┌─────────────────────┐
│ Does it follow UX   │──No──▶ REDESIGN
│ principles?         │        per principles
└─────────┬───────────┘
          │Yes
          ▼
┌─────────────────────┐
│ Does it serve the   │──No──▶ REVISE CONTENT
│ StoryBrand element? │        with SB framework
└─────────┬───────────┘
          │Yes
          ▼
┌─────────────────────┐
│ Is it accessible?   │──No──▶ FIX a11y issues
│                     │
└─────────┬───────────┘
          │Yes
          ▼
┌─────────────────────┐
│ Can Elementor       │──No──▶ SIMPLIFY design
│ implement this?     │        or document workaround
└─────────┬───────────┘
          │Yes
          ▼
      APPROVE + DOCUMENT
```

---

## Integration with Workflow

### When to Use This Framework

| Project Phase | Gates to Apply |
|---------------|----------------|
| Discovery | Gate 1 (Purpose) |
| Wireframing | Gates 1, 2, 3 |
| Visual Design | Gates 4, 5 |
| Development | Gates 6, 7 |
| QA | All gates |
| Handoff | Document all gate decisions |

### Related Documents

- `.cursor/prompts/modern-design-standards.md` — UX principles reference
- `.cursor/prompts/design-rationale-generator.md` — Generate justifications
- `.cursor/prompts/trend-research-workflow.md` — Research current trends
- `.cursor/prompts/storybrand-content.md` — Content framework
- `.cursor/prompts/persuasion-checklist.md` — Psychology principles
- `.cursor/prompts/accessibility-audit.md` — WCAG compliance
- `docs/06-implementation/elementor-mapping.md` — Implementation guide

### Output Documents

- `src/data/section-rationale.json` — Stored decisions
- `src/data/design-research-log.json` — Research findings
- `DECISIONS.md` — Major direction decisions

---

## Maintenance

This framework should be reviewed:
- **Quarterly**: Validate trend-related criteria
- **Annually**: Full review of all gates
- **Per-project**: Customize checklist weights for client needs

Update this document when:
- New UX research emerges
- Elementor capabilities change
- Team identifies recurring issues
- StoryBrand methodology updates
