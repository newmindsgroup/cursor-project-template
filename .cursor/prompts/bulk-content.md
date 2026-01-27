# Bulk Content Generation

Generate complete website content for all pages in one prompt using the StoryBrand framework.

## Prerequisites

Before generating content:
1. Have business context ready (brand, audience, voice)
2. Know which pages need content
3. Decide on target languages

## Input Template

Provide the following information:

```
## Business Context

**Company Name:** [Name]
**Industry:** [Industry/Niche]
**What You Do:** [One sentence description]
**Target Audience:** [Who you serve]
**Primary Pain Point:** [What problem you solve]
**Unique Value Proposition:** [Why choose you]
**Brand Voice:** [professional/friendly/bold/minimal]

## StoryBrand Foundation

**Character (Customer):**
- Identity: [Who they are]
- Want: [What they desire]

**Problem:**
- Villain: [Root cause of struggle]
- External: [Tangible problem]
- Internal: [How it makes them feel]
- Philosophical: [Why it's wrong]

**Guide (Your Brand):**
- Empathy: [Show understanding]
- Authority: [Demonstrate expertise]

**Plan (3 Steps):**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Call to Action:**
- Direct: [Primary CTA - "Get Started", "Schedule Call"]
- Transitional: [Secondary CTA - "Learn More", "Download Guide"]

**Stakes:**
- Failure: [What happens if they don't act]

**Success:**
- Transformation: [How life is better]
- Outcomes: [Specific benefits]

## Pages to Generate

- [ ] Homepage
- [ ] About
- [ ] Services
- [ ] Contact
- [ ] Pricing
- [ ] Other: ___

## Languages

- [x] English (en)
- [ ] Spanish (es)
- [ ] French (fr)
- [ ] German (de)
- [ ] Other: ___
```

## Output Instructions

Generate content in the following format for each page:

### For each language, create files:

```
src/content/{lang}/home.json
src/content/{lang}/about.json
src/content/{lang}/services.json
src/content/{lang}/contact.json
src/content/{lang}/pricing.json
```

### Content Structure Per Page

Follow the schema in `src/content/schema/page-content.schema.json`:

```json
{
  "meta": {
    "title": "[60 chars max]",
    "description": "[160 chars max]",
    "language": "en",
    "status": "draft"
  },
  "storybrand": { /* StoryBrand elements */ },
  "hero": { /* Hero content */ },
  "features": { /* Features content */ },
  "testimonials": { /* Testimonial content */ },
  "faq": { /* FAQ content */ },
  "cta": { /* CTA content */ }
}
```

## Content Guidelines

### Headlines
- Focus on transformation, not features
- Use "you" language
- Keep under 10 words
- Lead with the benefit

### Body Copy
- Short sentences (15-20 words)
- Active voice
- Benefit-focused
- No jargon

### CTAs
- Action verbs ("Get", "Start", "Schedule")
- Specific outcomes
- Create urgency without pressure

### Multilingual
- Adapt culturally, don't just translate
- Keep emotional impact
- Respect character limits
- Use native idioms for CTAs

## Quality Checklist

Before finalizing:

- [ ] All character limits respected
- [ ] StoryBrand framework complete for each page
- [ ] CTAs are clear and actionable
- [ ] Content flows logically (Problem → Solution → Success)
- [ ] Meta descriptions are SEO-optimized
- [ ] Testimonials feel authentic
- [ ] FAQ addresses real objections
- [ ] All languages have complete content

## Example Usage

```
Generate complete website content for a SaaS project management tool.

Business Context:
- Company: TaskFlow
- Industry: Project Management Software
- Audience: Small business owners and team leads
- Pain Point: Scattered tasks and missed deadlines
- UVP: The only PM tool that adapts to how your team actually works
- Voice: Professional but friendly

Generate content for:
- Homepage, About, Pricing, Contact

In languages:
- English, Spanish

Use the StoryBrand framework with:
- Empathy: "We've been overwhelmed by too many tools too"
- Authority: "Trusted by 10,000+ teams worldwide"
- 3-step plan: Try Free → Get Setup → Achieve More
```

## Related Files

- `/src/content/schema/page-content.schema.json` - Content structure
- `/src/content/storybrand/framework.md` - StoryBrand reference
- `/src/content/_template.json` - Blank template
- `/.cursor/prompts/storybrand-content.md` - Single page prompt
