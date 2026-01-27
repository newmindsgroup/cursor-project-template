# E-Myth Business Systems Audit

Assess business systems maturity before website projects. A website built for a business without systems is a facade—this audit ensures we build on solid foundations.

## Purpose

Evaluate a client's business through the E-Myth lens to:
- Identify whether the business is systems-dependent or owner-dependent
- Uncover operational gaps that the website must account for
- Recommend business development work alongside or before website development
- Position website work within the larger business operating system

## When to Use

- During project kickoff and discovery
- Before scoping website features
- When assessing client readiness for digital marketing
- When recommending automation or integration work

## Prerequisites

Before running this audit, gather:
- Business context from `/business-context/` (if available)
- Initial discovery notes
- Client intake information
- Any existing process documentation

## Audit Framework

### Part 1: The Three Personalities Assessment

Evaluate the balance of Technician, Manager, and Entrepreneur in the business:

```
Rate each from 1-5 (1 = weak, 5 = strong)

TECHNICIAN (Doing the Work)
- [ ] Quality of work delivered: ___/5
- [ ] Technical expertise: ___/5
- [ ] Client satisfaction with deliverables: ___/5
- [ ] Time spent doing vs. managing: ___% doing

MANAGER (Organizing and Planning)
- [ ] Documented processes exist: ___/5
- [ ] Team coordination systems: ___/5
- [ ] Project management tools in use: ___/5
- [ ] Operational efficiency: ___/5

ENTREPRENEUR (Vision and Growth)
- [ ] Clear vision articulated: ___/5
- [ ] Growth strategy defined: ___/5
- [ ] Innovation and new initiatives: ___/5
- [ ] Long-term planning: ___/5
```

**Interpretation:**
- **Heavy Technician** (>70% time doing): Business depends on owner's labor; website must drive efficiency
- **Heavy Manager**: May have bureaucracy without growth; website should enable scaling
- **Heavy Entrepreneur**: May have ideas without execution; website needs strong operations support

---

### Part 2: Franchise Prototype Test

The business should be able to operate as if it were going to be franchised:

```
For each question, rate current state (1-5):

SYSTEMS DOCUMENTATION
- [ ] Sales process documented: ___/5
- [ ] Onboarding process documented: ___/5
- [ ] Service/product delivery documented: ___/5
- [ ] Client communication templates exist: ___/5
- [ ] Quality standards defined: ___/5

OWNER INDEPENDENCE
- [ ] Business operates when owner is away: ___/5
- [ ] Decisions can be made without owner: ___/5
- [ ] Revenue continues without owner involvement: ___/5
- [ ] Team can handle client issues: ___/5

REPLICABILITY
- [ ] New team members can be trained from docs: ___/5
- [ ] Results are consistent across team members: ___/5
- [ ] Processes produce predictable outcomes: ___/5
```

**Scoring:**
- **40-60 points**: Strong systems foundation - ready for website that accelerates growth
- **25-39 points**: Moderate systems - website project should include process documentation
- **Below 25 points**: Weak systems - recommend business development before/alongside website

---

### Part 3: Business Development Process Evaluation

**Innovation:** Are they finding better ways to serve customers?

```
Current innovations or improvements in progress:
- [ ] ______________________________
- [ ] ______________________________
- [ ] ______________________________

Innovation assessment: ___/5
```

**Quantification:** Are they measuring what matters?

```
Metrics currently tracked:
- [ ] Lead sources and conversion rates: Yes / No / Partial
- [ ] Customer acquisition cost: Yes / No / Partial
- [ ] Customer lifetime value: Yes / No / Partial
- [ ] Client satisfaction scores: Yes / No / Partial
- [ ] Revenue per service/product: Yes / No / Partial
- [ ] Operational efficiency metrics: Yes / No / Partial

Quantification assessment: ___/5
```

**Orchestration:** Are they systematizing what works?

```
Documented and repeatable processes:
- [ ] Lead generation: Yes / No / Partial
- [ ] Sales conversion: Yes / No / Partial
- [ ] Client onboarding: Yes / No / Partial
- [ ] Service delivery: Yes / No / Partial
- [ ] Follow-up and retention: Yes / No / Partial
- [ ] Referral generation: Yes / No / Partial

Orchestration assessment: ___/5
```

---

### Part 4: Website Implications

Based on the audit, identify website requirements:

```
SYSTEMS GAPS → WEBSITE FEATURES

If weak in:                    Website should include:
─────────────────────────────────────────────────────────
Sales documentation         →  Clear sales funnel, automated follow-up
Client onboarding           →  Client portal, welcome sequence
Service delivery            →  Scheduling, project tracking integration
Communication               →  Automated emails, status updates
Lead tracking               →  CRM integration, form tracking
Quality standards           →  Testimonial collection, review system
```

---

## Output Template

Generate a summary for `/docs/02-discovery/discovery-summary.md`:

```markdown
## E-Myth Systems Assessment

### Business Maturity Score: ___/60

### Personality Balance
- Technician: ___% (Ideal: 30%)
- Manager: ___% (Ideal: 30%)
- Entrepreneur: ___% (Ideal: 40%)

### Key Findings

**Strengths:**
- [Area where systems are strong]
- [Area where systems are strong]

**Gaps:**
- [Area needing development]
- [Area needing development]

### Owner Dependency Risk: [Low / Medium / High]

[Description of how dependent the business is on the owner]

### Recommendations for Website Project

1. **Must Have:** [Feature/integration to address critical gap]
2. **Should Have:** [Feature to improve operations]
3. **Consider:** [Business development work needed alongside website]

### Systems Development Recommendations

Before or alongside the website project:
- [ ] [Process to document]
- [ ] [System to implement]
- [ ] [Training to develop]
```

---

## Integration with Project Workflow

After completing this audit:

1. Log key findings in `/docs/02-discovery/discovery-summary.md`
2. Add systems-related requirements to `/docs/03-requirements/REQUIREMENTS.md`
3. Note assumptions about business operations in `ASSUMPTIONS.md`
4. Log open questions about processes in `QUESTIONS.md`
5. Consider scope implications and update `SCOPE.md`

---

## Red Flags to Watch For

- **Owner does everything**: Website alone won't solve this
- **No documented processes**: Implementation will be difficult
- **Revenue depends on owner selling**: Website needs strong nurture systems
- **High employee turnover**: Training/documentation more important than features
- **No metrics tracked**: Can't optimize what isn't measured

---

## Related Prompts

- `small-business-flight-plan.md` - Complementary 6-pillar assessment
- `discovery-intake.md` - General discovery process
- `automation-workflow-design.md` - For automating documented processes
- `conversion-optimization.md` - For optimizing once systems are in place

---

## Further Reading

The principles in this audit are informed by the reference library. Key concepts include:
- Working ON the business vs. IN the business
- The franchise prototype model
- Innovation, quantification, and orchestration
- Systems-dependent vs. people-dependent businesses
