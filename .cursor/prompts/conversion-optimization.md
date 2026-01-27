# Conversion Optimization Prompt

## Purpose
AI-powered analysis to improve conversion rates through UX, copy, and design optimizations.

## When to Use
- During landing page optimization
- When improving key conversion flows
- For A/B test hypothesis generation
- When conversion rates are below target
- For CRO audits before campaigns

## Conversion Principles

### LIFT Model Framework
1. **Value Proposition** - What's the perceived benefit?
2. **Relevance** - Does it match visitor expectations?
3. **Clarity** - Is the message clear?
4. **Urgency** - Is there a reason to act now?
5. **Anxiety** - What fears might prevent action?
6. **Distraction** - What might pull attention away?

## Inputs Required
1. **Page Content** - HTML/screenshots of the page
2. **Business Goal** - Primary conversion action
3. **Current Metrics** - Existing conversion data if available
4. **Traffic Source** - Where visitors come from
5. **Target Audience** - User personas

## Prompt Template

```
You are a conversion rate optimization (CRO) expert analyzing a webpage for improvement opportunities.

PAGE: [Page name]
PRIMARY CONVERSION GOAL: [e.g., Form submission, Purchase, Signup]
SECONDARY GOALS: [e.g., Newsletter signup, Content download]
CURRENT CONVERSION RATE: [X%] (if known)
TARGET CONVERSION RATE: [X%]
TRAFFIC SOURCE: [Organic, Paid, Social, Email]
TARGET AUDIENCE: [Persona description]

PAGE CONTENT:
[Paste HTML or describe page layout]

Analyze this page using the LIFT Model framework:

## 1. VALUE PROPOSITION ANALYSIS

Current State:
- What value is being promised?
- Is it compelling and unique?
- Is it clearly communicated above the fold?

Issues:
- [ ] Value proposition unclear
- [ ] Benefits not differentiated
- [ ] Features emphasized over outcomes
- [ ] No clear transformation promised

Recommendations:
| Current | Suggested | Rationale |
|---------|-----------|-----------|
| [headline] | [improved] | [why] |

## 2. RELEVANCE CHECK

Traffic Source Alignment:
- Does the page match what was promised in the ad/link?
- Is there message match between source and landing page?
- Does it speak to the visitor's intent?

Issues:
- [ ] Headline doesn't match ad copy
- [ ] Images don't represent target audience
- [ ] Offer doesn't match visitor expectations
- [ ] Disconnect between promised and delivered

Recommendations:
- [Specific alignment improvements]

## 3. CLARITY AUDIT

Content Clarity:
- Is the main message immediately clear?
- Can visitors understand the offer in 5 seconds?
- Is the CTA clear about what happens next?

Issues:
- [ ] Too much jargon
- [ ] Confusing layout
- [ ] Multiple competing messages
- [ ] CTA text unclear
- [ ] Process steps not explained

Recommendations:
- [Simplification suggestions]

## 4. URGENCY FACTORS

Current Urgency Elements:
- [ ] Time-limited offer
- [ ] Scarcity indicators
- [ ] Social proof (recent activity)
- [ ] Consequence of not acting

Issues:
- [ ] No reason to act today
- [ ] Fake urgency (damages trust)
- [ ] Missing deadline
- [ ] No FOMO elements

Recommendations:
- [Ethical urgency improvements]

## 5. ANXIETY REDUCERS

Trust Elements Present:
- [ ] Social proof (testimonials, reviews)
- [ ] Trust badges (security, guarantees)
- [ ] Risk reversals (refund policy, trial)
- [ ] Credibility indicators (logos, certifications)

Issues:
- [ ] Missing trust signals
- [ ] Form asks for too much
- [ ] No privacy reassurance
- [ ] No guarantee offered

Recommendations:
- [Trust-building additions]

## 6. DISTRACTION ANALYSIS

Attention Audit:
- Is there a clear visual hierarchy?
- Are there competing CTAs?
- Does navigation distract from conversion?

Issues:
- [ ] Too many links/options
- [ ] Competing calls-to-action
- [ ] Overwhelming content
- [ ] Sidebar distractions

Recommendations:
- [Distraction reduction suggestions]

---

## CTA OPTIMIZATION

Current CTA:
- Text: [current text]
- Placement: [above/below fold]
- Design: [description]

Recommendations:
| Element | Current | Suggested | Expected Impact |
|---------|---------|-----------|-----------------|
| Text | "Submit" | "Get My Free Quote" | +15-25% |
| Color | Gray | Brand color w/ contrast | +5-10% |
| Size | Small | 50% larger | +10-15% |
| Placement | Below fold | Sticky or above fold | +20-30% |

## FORM OPTIMIZATION (if applicable)

Current Fields: [list fields]

Recommendations:
- [ ] Remove optional fields
- [ ] Use smart defaults
- [ ] Add progress indicators
- [ ] Improve field labels
- [ ] Add inline validation

## A/B TEST HYPOTHESES

Based on analysis, test these hypotheses:

| Priority | Hypothesis | Test | Expected Lift |
|----------|------------|------|---------------|
| 1 | Clearer headline = more conversions | A/B headline test | +10-20% |
| 2 | Fewer form fields = higher completion | 7 vs 4 fields | +15-25% |
| 3 | Social proof = higher trust | With/without testimonials | +5-10% |

## QUICK WINS (Implement Immediately)

1. [Low effort, high impact change]
2. [Low effort, high impact change]
3. [Low effort, high impact change]

## OVERALL ASSESSMENT

Conversion Potential Score: [1-10]
Estimated Improvement Potential: [X%]
Priority Level: [High/Medium/Low]

Top 3 Actions:
1. [Most impactful change]
2. [Second priority]
3. [Third priority]
```

## Output Format
- LIFT Model analysis
- Specific recommendations with rationale
- A/B test hypotheses
- Quick wins list
- Prioritized action items

## Integration Points
- Informs `scripts/generate-section-content.mjs` copy
- Guides `scripts/optimize-headlines.mjs` variants
- Influences layout decisions
- Feeds into QA test scenarios

## CRO Checklist

### Above the Fold
- [ ] Clear headline with value proposition
- [ ] Supporting subheadline
- [ ] Relevant hero image/video
- [ ] Primary CTA visible
- [ ] Trust indicator present

### Social Proof
- [ ] Customer testimonials
- [ ] Logos of notable clients
- [ ] Review scores/ratings
- [ ] Case study snippets
- [ ] User counts/stats

### Form Optimization
- [ ] Minimal required fields
- [ ] Clear field labels
- [ ] Inline validation
- [ ] Privacy reassurance
- [ ] Clear submit button

### Trust & Security
- [ ] Security badges
- [ ] Money-back guarantee
- [ ] Clear privacy policy
- [ ] Contact information
- [ ] Professional design

## Best Practices
1. Test one element at a time for clear results
2. Run tests to statistical significance
3. Focus on high-traffic pages first
4. Document all tests and learnings
5. Consider mobile conversion separately
