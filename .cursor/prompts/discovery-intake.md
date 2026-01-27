# Prompt: Discovery Intake

Gather comprehensive context at project kickoff, treating the website as one component of a larger business operating system.

## Goal

Conduct thorough discovery that:
- Understands the business holistically, not just the website need
- Assesses business systems maturity and readiness
- Identifies where the website fits in the overall business strategy
- Surfaces gaps, risks, and questions early
- Informs all downstream project documentation

## When to Run

- At project kickoff
- When new business context is provided
- After significant scope discussions
- When resuming a paused project

## Inputs to Review

Before starting discovery, gather and review:

### Required Inputs
- `/docs/` (existing brief, requirements, architecture)
- `business-context/` (read-only reference materials)
- `resource-library/` (read-only methodology references)
- `PROJECT.md` (if populated)
- `SCOPE.md` (if populated)

### Optional Inputs
- Client intake forms or questionnaires
- Existing website or marketing materials
- Competitor websites or analysis
- Previous project documentation

---

## Discovery Framework

### Part 1: Business Context

Understand the business before the website:

```markdown
## Business Overview

### Company Profile
- Company name: _______________
- Industry/Category: _______________
- Years in business: _______________
- Company size: _______________ (employees, revenue range)
- Geographic focus: _______________

### Business Model
- Primary revenue source: _______________
- Secondary revenue sources: _______________
- Customer type: B2B / B2C / Both
- Sales model: Self-serve / Sales-assisted / Enterprise

### Current State
- Website exists: Yes / No
- Current website platform: _______________
- Current website age: _______________
- Primary issues with current state: _______________
```

### Part 2: Business Systems Assessment

Evaluate business maturity using the 6-pillar framework (informed by the reference library):

```markdown
## Business Systems Quick Assessment

Rate each pillar 1-5 (1 = not present, 5 = fully developed):

### Leadership
- Clear mission/vision exists: ___/5
- Team aligned on direction: ___/5
- Decision-making process clear: ___/5
**Leadership Score: ___/15**

### Marketing
- Target audience defined: ___/5
- Message/positioning clear: ___/5
- Lead generation active: ___/5
**Marketing Score: ___/15**

### Sales
- Sales process documented: ___/5
- Conversion metrics tracked: ___/5
- Follow-up systems exist: ___/5
**Sales Score: ___/15**

### Products/Services
- Offerings clearly defined: ___/5
- Pricing strategy set: ___/5
- Delivery process documented: ___/5
**Products Score: ___/15**

### Operations
- Processes documented: ___/5
- Tools/systems in place: ___/5
- Can scale without owner: ___/5
**Operations Score: ___/15**

### Cash Flow
- Revenue predictable: ___/5
- Margins understood: ___/5
- Budget for marketing: ___/5
**Cash Flow Score: ___/15**

**TOTAL SYSTEMS SCORE: ___/90**

### Systems Assessment Interpretation
- 72-90: Strong foundation - website can accelerate growth
- 54-71: Moderate foundation - address gaps alongside website
- 36-53: Weak foundation - prioritize business development
- Below 36: Critical gaps - assess if website is premature
```

### Part 3: Website Context

Now focus on the website specifically:

```markdown
## Website Discovery

### Primary Purpose
What is the #1 thing the website must accomplish?
_______________________________________________

### Secondary Purposes
What else should the website support?
1. _______________
2. _______________
3. _______________

### Target Audience
Who will visit this website?

**Primary Audience:**
- Who: _______________
- What they want: _______________
- Current pain: _______________

**Secondary Audience:**
- Who: _______________
- What they want: _______________

### Key Actions
What should visitors DO on this website?
1. Primary action: _______________ (Direct CTA)
2. Secondary action: _______________ (Transitional CTA)
3. Tertiary action: _______________

### Success Metrics
How will we know if the website is successful?
| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| [Metric 1] | ___ | ___ | ___ |
| [Metric 2] | ___ | ___ | ___ |
| [Metric 3] | ___ | ___ | ___ |
```

### Part 4: Competitive Landscape

```markdown
## Competitive Analysis

### Direct Competitors
| Competitor | Website | What They Do Well | Opportunity |
|------------|---------|-------------------|-------------|
| [Name] | [URL] | _______________ | _______________ |
| [Name] | [URL] | _______________ | _______________ |
| [Name] | [URL] | _______________ | _______________ |

### Aspirational Brands
What brands (in or outside industry) represent the desired feel?
1. [Brand]: Why? _______________
2. [Brand]: Why? _______________

### Differentiation
What makes this business different from competitors?
_______________________________________________
```

### Part 5: Brand Assessment

```markdown
## Brand Quick Assessment

### Brand Assets Available
- [ ] Logo (vector format): Yes / No
- [ ] Color palette defined: Yes / No
- [ ] Typography defined: Yes / No
- [ ] Brand guidelines exist: Yes / No
- [ ] Photography/imagery: Yes / No / Some
- [ ] Voice/tone defined: Yes / No

### Brand Development Needed
What brand work is needed before/during website?
- [ ] Logo design/refresh
- [ ] Color palette development
- [ ] Typography selection
- [ ] Photography/imagery
- [ ] Voice/tone guidelines
- [ ] Full brand guidelines

### Brand Personality
Three words that describe the brand:
1. _______________
2. _______________
3. _______________
```

### Part 6: Technical Context

```markdown
## Technical Discovery

### Current Technology
- Website platform: _______________
- Email marketing: _______________
- CRM: _______________
- Payment processing: _______________
- Other key tools: _______________

### Required Integrations
What must the website connect to?
1. _______________
2. _______________
3. _______________

### Technical Constraints
- Platform requirements: _______________
- Hosting requirements: _______________
- Security requirements: _______________
- Compliance requirements: _______________

### Content Management
- Who will update content? _______________
- Update frequency: _______________
- Technical skill level: _______________
```

### Part 7: Constraints and Risks

```markdown
## Constraints

### Timeline
- Ideal launch date: _______________
- Hard deadline (if any): _______________
- Dependencies: _______________

### Budget
- Budget range: _______________
- Budget flexibility: _______________
- Ongoing budget for maintenance: _______________

### Resources
- Internal resources available: _______________
- Content creation: Internal / External / Hybrid
- Photography: Existing / New / Stock
- Copywriting: Internal / External / AI-assisted

## Risks

### Identified Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk 1] | H/M/L | H/M/L | _______________ |
| [Risk 2] | H/M/L | H/M/L | _______________ |
| [Risk 3] | H/M/L | H/M/L | _______________ |
```

---

## Output Format

After completing discovery, generate:

### 1. Problem Statement
One paragraph summarizing the core problem and opportunity.

### 2. Target Users Summary
Primary and secondary users with their key needs.

### 3. Business Systems Assessment
Summary of 6-pillar scores with implications for website scope.

### 4. Website Requirements Summary
Key features and functionality needed.

### 5. Constraints Summary
Timeline, budget, technical, and resource constraints.

### 6. Success Metrics
How success will be measured.

### 7. Risks and Mitigations
Key risks identified and how they'll be addressed.

### 8. Open Questions
Questions that must be answered before proceeding (log to `QUESTIONS.md`).

### 9. Assumptions
Assumptions being made in absence of information (log to `ASSUMPTIONS.md`).

### 10. Recommended Next Steps
What should happen after discovery.

---

## Output Destinations

After completing discovery:

| Output | Destination |
|--------|-------------|
| Business overview | `PROJECT.md` |
| Full discovery notes | `/docs/02-discovery/discovery-summary.md` |
| Scope implications | `SCOPE.md` |
| Requirements preview | `/docs/03-requirements/REQUIREMENTS.md` |
| Open questions | `QUESTIONS.md` |
| Assumptions | `ASSUMPTIONS.md` |
| Key decisions | `DECISIONS.md` |

---

## Related Prompts

For deeper assessment in specific areas:

- `emyth-systems-audit.md` - Detailed business systems evaluation
- `small-business-flight-plan.md` - Full 6-pillar diagnostic
- `one-page-marketing-canvas.md` - Complete marketing strategy
- `brand-identity-audit.md` - Comprehensive brand assessment
- `storybrand-content.md` - Message development
- `competitor-analysis.md` - Detailed competitive analysis

---

## Non-Hallucination Reminder

- Do not invent requirements or assume information
- If something is unclear, log it as a question in `QUESTIONS.md`
- If making assumptions, document them in `ASSUMPTIONS.md`
- State when guidance is "informed by the reference library" without naming specific files
- Verify all facts and figures provided during discovery

---

## Discovery Checklist

Before concluding discovery:

- [ ] Business context understood
- [ ] Business systems assessed
- [ ] Website purpose and goals clear
- [ ] Target audience defined
- [ ] Success metrics established
- [ ] Competitors reviewed
- [ ] Brand assets inventoried
- [ ] Technical requirements gathered
- [ ] Constraints documented
- [ ] Risks identified
- [ ] Questions logged to `QUESTIONS.md`
- [ ] Assumptions logged to `ASSUMPTIONS.md`
- [ ] Next steps recommended
