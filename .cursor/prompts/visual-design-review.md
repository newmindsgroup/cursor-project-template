# Visual Design Review Prompt

## Purpose
AI-powered review of visual design decisions to ensure consistency, accessibility, and brand alignment.

## When to Use
- After initial design implementation
- Before client review milestones
- When ensuring design token consistency
- During responsive design validation
- For design QA before launch

## Inputs Required
1. **Page/Component HTML** - The markup to review
2. **Design Tokens** - Current tokens.css or theme configuration
3. **Brand Guidelines** - If available, brand colors, typography, voice
4. **Target Audience** - User personas or demographic info

## Prompt Template

```
You are a senior UI/UX designer reviewing a website design for visual consistency, accessibility, and brand alignment.

DESIGN CONTEXT:
- Brand: [Brand name and industry]
- Target Audience: [Primary personas]
- Design Goals: [Modern, professional, playful, etc.]

DESIGN TOKENS:
[Paste relevant section of tokens.css]

HTML TO REVIEW:
[Paste the HTML markup]

Review the design against these criteria:

1. VISUAL HIERARCHY
   □ Is there a clear content hierarchy?
   □ Do headings follow a logical progression?
   □ Are CTAs prominent and distinguishable?
   □ Does whitespace guide the eye appropriately?

2. CONSISTENCY
   □ Are spacing values from the design token scale?
   □ Are colors consistent with the defined palette?
   □ Is typography consistent (weights, sizes, line heights)?
   □ Are interactive states consistent across elements?

3. ACCESSIBILITY
   □ Do color combinations meet WCAG AA contrast (4.5:1)?
   □ Are focus states visible and clear?
   □ Are touch targets at least 44x44px?
   □ Is text readable (min 16px body)?

4. BRAND ALIGNMENT
   □ Does the design convey the intended brand personality?
   □ Are imagery and icons consistent with brand voice?
   □ Does the color usage support brand recognition?

5. RESPONSIVE CONSIDERATIONS
   □ Will this layout work on mobile?
   □ Are there potential overflow issues?
   □ Are images and media responsive?

6. UX BEST PRACTICES
   □ Are interactive elements obviously clickable?
   □ Is feedback provided for user actions?
   □ Are loading states considered?
   □ Is error handling designed?

For each issue found, provide:

ISSUES:
| Priority | Category | Element | Issue | Recommendation |
|----------|----------|---------|-------|----------------|
| High/Med/Low | Hierarchy/Consistency/Accessibility/Brand/UX | Element selector | Description | How to fix |

STRENGTHS:
- [What works well and should be maintained]

OVERALL ASSESSMENT:
- Score: [0-100]
- Ready for client: [Yes/No/With changes]
- Top 3 priorities to address

DESIGN TOKEN RECOMMENDATIONS:
- [Any suggested updates to tokens.css]

IMPLEMENTATION NOTES:
- [Technical suggestions for developers]
```

## Output Format
- Structured review document
- Issue table with priorities
- Specific element references
- Actionable recommendations

## Integration Points
- Use with `scripts/visual-qa.mjs` for automated checking
- Feed into handoff documentation
- Inform design token updates
- Guide component refinements

## Review Checklist

### Colors
- [ ] Primary brand color used appropriately
- [ ] Secondary colors complement primary
- [ ] Sufficient contrast for text
- [ ] Semantic colors for feedback states
- [ ] Dark mode considerations (if applicable)

### Typography
- [ ] Heading hierarchy (H1 > H2 > H3)
- [ ] Body text readable (16px+)
- [ ] Line height appropriate (1.4-1.6)
- [ ] Font weights used consistently
- [ ] Max line length considered (45-75 chars)

### Spacing
- [ ] Consistent spacing scale used
- [ ] Adequate padding in containers
- [ ] Proper margins between sections
- [ ] Touch targets appropriately sized
- [ ] Whitespace creates visual breathing room

### Components
- [ ] Buttons have clear hierarchy
- [ ] Forms have proper labels
- [ ] Cards are consistent
- [ ] Navigation is clear
- [ ] Footer has expected elements

### Interactions
- [ ] Hover states defined
- [ ] Focus states visible
- [ ] Active states clear
- [ ] Disabled states obvious
- [ ] Loading states considered

### Golden Ratio & Spacing Enforcement (MANDATORY)

**Section Padding Validation:**
- [ ] All sections have vertical padding (`py-16 md:py-20 lg:py-24` minimum)
- [ ] Hero sections use larger padding (`py-20 md:py-32 lg:py-40`)
- [ ] Compact sections use appropriate padding (`py-12 md:py-16 lg:py-20`)

**Container Padding Validation:**
- [ ] Containers have horizontal padding (`px-8 md:px-12 lg:px-16`)
- [ ] Content NEVER touches viewport edges
- [ ] Minimum 32px horizontal padding on mobile
- [ ] Minimum 64px horizontal padding on desktop

**Max Width Validation:**
- [ ] All content containers have `max-w-7xl` or similar constraint
- [ ] Containers are centered with `mx-auto`

**Golden Ratio Compliance (Recommended):**
- [ ] Two-column layouts use 61.8%/38.2% split where appropriate
- [ ] Image aspect ratios consider 1.618:1 golden ratio
- [ ] Typography scale follows Golden Ratio progression

**Run Automated Validation:**
```bash
node scripts/validate-design.mjs --verbose
```

### Spacing Reference Table

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Section padding | 64px (py-16) | 80px (md:py-20) | 96px (lg:py-24) |
| Container padding | 32px (px-8) | 48px (md:px-12) | 64px (lg:px-16) |
| Grid gap | 32px (gap-8) | 32px (gap-8) | 48px (lg:gap-12) |
| Card padding | 32px (p-8) | 32px (p-8) | 32px (p-8) |

## Best Practices
1. Review on actual device sizes, not just browser resize
2. Test with actual content, not placeholder text
3. Check in multiple browsers
4. Validate color contrast with tools
5. Consider users with different abilities
