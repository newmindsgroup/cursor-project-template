# StoryBrand Content Generation

Generate compelling website content using the StoryBrand framework. This prompt creates conversion-focused copy that positions the customer as the hero and the brand as the guide.

## Prerequisites

Before generating content, ensure you have:
- Business context from `/business-context/` (if available)
- Target audience definition
- Brand voice guidelines
- Competitor analysis (optional)

## Instructions

### Step 1: Gather Business Context

Read available materials in the business context folder (without revealing filenames):
- Company overview and mission
- Target audience profiles
- Unique value proposition
- Brand voice/tone guidelines
- Competitor positioning

### Step 2: Build the StoryBrand BrandScript

Using the gathered context, complete the 7-part StoryBrand framework:

#### 1. The Character (Customer)
- Who is the target customer?
- What is their primary desire/goal?

#### 2. The Problem
- **Villain**: What's the root cause of their struggle?
- **External**: What tangible problem do they face?
- **Internal**: How does this problem make them feel?
- **Philosophical**: Why is this situation just wrong?

#### 3. The Guide (Brand)
- **Empathy**: How do we show we understand their pain?
- **Authority**: What credentials/results demonstrate expertise?

#### 4. The Plan
- Define 3-4 simple steps to work with the brand
- Make it clear and actionable

#### 5. Call to Action
- **Direct CTA**: Primary conversion action (bold, clear)
- **Transitional CTA**: Secondary nurture action

#### 6. Failure Stakes
- What happens if they don't act?
- Be honest but not fear-mongering

#### 7. Success Transformation
- Paint the picture of success
- Specific outcomes and transformations

### Step 3: Generate Page Content

For each page, generate content in the following JSON structure:

```json
{
  "meta": {
    "title": "[SEO title, max 60 chars]",
    "description": "[Meta description, max 160 chars]",
    "language": "[en/es/etc]",
    "status": "draft"
  },
  "storybrand": {
    // ... BrandScript elements
  },
  "hero": {
    "headline": "[Transform-focused H1, max 80 chars]",
    "subheadline": "[Supporting copy, max 200 chars]",
    "primaryCta": { "text": "[Action verb + outcome]", "url": "" },
    "secondaryCta": { "text": "[Learn/discover action]", "url": "" }
  },
  // ... other sections
}
```

### Step 4: Apply to Sections

Map StoryBrand elements to website sections:

| Section | Content Focus |
|---------|--------------|
| Hero | Character's desire + Direct CTA |
| Features | Solutions to problems |
| Stats | Guide authority |
| Testimonials | Social proof (authority) |
| FAQ | Overcome objections |
| CTA | Success vision + Call to action |

### Step 5: Translation Guidelines

When generating multilingual content:

1. **Adapt culturally** - Don't just translate, localize
2. **Maintain emotion** - Keep the empathy and urgency
3. **Respect character limits** - Adjust for language expansion
4. **Use native idioms** - Especially for CTAs
5. **Keep brand voice** - Consistent across languages

## Output Format

Generate content files in `src/content/{language}/`:
- `home.json` - Homepage content
- `about.json` - About page content
- `services.json` - Services page content
- `contact.json` - Contact page content

## Example Prompt Usage

```
Using the StoryBrand framework, generate website content for [BUSINESS NAME].

Context:
- Industry: [INDUSTRY]
- Target Audience: [AUDIENCE DESCRIPTION]
- Primary Service: [SERVICE]
- Unique Value: [UVP]
- Brand Voice: [TONE - professional, friendly, authoritative, etc.]

Generate complete content for all pages in:
1. English (en)
2. Spanish (es)

Follow the JSON schema in src/content/schema/page-content.schema.json
Store output files in src/content/{language}/
```

## Quality Checklist

Before finalizing content:

- [ ] Headlines focus on transformation, not features
- [ ] Customer is hero, brand is guide throughout
- [ ] Clear, visible CTAs on every page
- [ ] Problem → Solution → Success flow is clear
- [ ] Empathy statements feel genuine
- [ ] Authority is demonstrated, not claimed
- [ ] Plan steps are simple and actionable
- [ ] Success outcomes are specific and desirable
- [ ] Character limits respected for all fields
- [ ] Multilingual versions maintain emotional impact

---

## Clarity Validation ("Don't Make Me Think")

Every section must pass this clarity validation to ensure users can understand and act without cognitive strain. Based on Steve Krug's "Don't Make Me Think" principles.

### The 5-Second Test

For each page/section, ask:
1. **What is this?** (Can user identify the page purpose in 5 seconds?)
2. **What can I do here?** (Is the primary action obvious?)
3. **Why should I care?** (Is the value proposition clear?)
4. **What do I do next?** (Is the next step unmistakable?)

If any answer is unclear, revise the content.

### Section-by-Section Clarity Checklist

#### Hero Section
| Question | Pass | Fix If Fail |
|----------|------|-------------|
| Can user understand page purpose in <5 seconds? | □ | Simplify headline, remove jargon |
| Is the primary CTA immediately visible? | □ | Increase size/contrast, move above fold |
| Does headline speak to customer's desire? | □ | Rewrite with transformation focus |
| Is there ONE clear thing to do? | □ | Reduce CTAs, clarify primary action |
| Would a first-time visitor understand this? | □ | Remove insider language, add context |

#### Features/Benefits Section
| Question | Pass | Fix If Fail |
|----------|------|-------------|
| Are benefits front-loaded (not buried)? | □ | Lead with outcome, not feature name |
| Can user scan without reading everything? | □ | Add subheadings, use bullets, bold key phrases |
| Is each benefit in <20 words? | □ | Shorten, be more direct |
| Do icons/visuals aid understanding? | □ | Use meaningful icons, not decorative |
| Is it clear how these help the customer? | □ | Frame as customer benefits, not product features |

#### Process/Plan Section
| Question | Pass | Fix If Fail |
|----------|------|-------------|
| Are steps numbered and limited (3-4 max)? | □ | Consolidate steps, number clearly |
| Does each step start with an action verb? | □ | Rewrite: "Schedule" not "Scheduling is done" |
| Is the outcome of following steps clear? | □ | Add outcome statement at end |
| Could a 12-year-old understand each step? | □ | Simplify language, remove jargon |

#### Testimonials Section
| Question | Pass | Fix If Fail |
|----------|------|-------------|
| Are results specific and measurable? | □ | Add numbers: "47% increase" not "great results" |
| Is attribution complete (name, role, photo)? | □ | Add missing attribution elements |
| Do testimonials address likely objections? | □ | Select testimonials that overcome hesitations |
| Are testimonials from relatable people? | □ | Match testimonials to target audience |

#### CTA Section
| Question | Pass | Fix If Fail |
|----------|------|-------------|
| Does headline paint success picture? | □ | Rewrite to show transformation achieved |
| Is CTA button text action-oriented? | □ | Use verb + outcome: "Get Free Quote" |
| Is there urgency without manipulation? | □ | Add genuine deadline or scarcity if applicable |
| Are objections addressed nearby? | □ | Add guarantee, FAQ, or reassurance |

### Cognitive Load Reduction

#### Information Hierarchy
Every page should have clear levels:

1. **Primary**: What you MUST notice (headline, CTA)
2. **Secondary**: What supports the primary (subheadline, key benefits)
3. **Tertiary**: Details for those who want them (full descriptions, fine print)

#### Scannability Checklist
- [ ] Meaningful headlines every 2-3 paragraphs
- [ ] Bullet points for lists of 3+ items
- [ ] Bold text for key phrases (sparingly)
- [ ] Short paragraphs (3-4 sentences max)
- [ ] Visual breaks between content blocks
- [ ] Numbers instead of written-out quantities

#### Reading Level
- Target: 8th grade reading level (Flesch-Kincaid)
- Avoid jargon unless audience expects it
- Define technical terms if necessary
- Use active voice: "We help you" not "You are helped by us"

### "What Do I Do Next?" Validation

Every section should answer: **"What's my next step?"**

| Section | Next Step Should Be |
|---------|---------------------|
| Hero | Primary CTA or scroll to learn more |
| Features | Continue reading OR take action |
| Process | Start step 1 OR contact us |
| Testimonials | Trust established → ready to act |
| FAQ | Objections resolved → ready to act |
| CTA | Take the primary action |

### Visual Clarity Validation

| Element | Clarity Check |
|---------|--------------|
| Headlines | Large, distinct from body text |
| CTAs | High contrast, obviously clickable |
| Links | Visually distinct (color, underline) |
| Forms | Labels clear, required fields marked |
| Navigation | Current page indicated |
| Whitespace | Adequate breathing room |

### Jargon & Clarity Audit

Replace unclear language:

| Instead of | Use |
|------------|-----|
| "Leverage our solutions" | "Use our tools" |
| "Optimize your workflow" | "Save time on [task]" |
| "Seamless integration" | "Works with [tool]" |
| "End-to-end platform" | "Everything you need to [outcome]" |
| "Innovative approach" | [Specific benefit] |
| "Best-in-class" | [Specific credential or result] |

### Validation Scoring

Score each page 0-5 on these dimensions:

| Dimension | Score (0-5) | Notes |
|-----------|-------------|-------|
| Purpose Clarity | | Is the page purpose obvious? |
| Action Clarity | | Is the next step unmistakable? |
| Value Clarity | | Is the benefit clear? |
| Scannability | | Can users find what they need quickly? |
| Language Simplicity | | Is it free of jargon? |
| **Total** | **/25** | |

**Interpretation:**
- 22-25: Excellent clarity
- 18-21: Good, minor improvements possible
- 14-17: Needs attention
- Below 14: Significant clarity issues

---

## StoryBrand + Clarity Integration

The StoryBrand framework and clarity principles work together:

| StoryBrand Element | Clarity Requirement |
|--------------------|---------------------|
| Character (Hero) | User sees themselves immediately |
| Problem | Problem is stated in user's words |
| Guide | Authority shown, not claimed |
| Plan | Steps are 3-4, simple, numbered |
| CTA | Button text = action + outcome |
| Failure | Stakes clear without fear-mongering |
| Success | Transformation is specific and desirable |

### Content Generation Workflow

1. **Build BrandScript** (StoryBrand framework)
2. **Draft content** (Apply to sections)
3. **Validate clarity** (Don't Make Me Think checklist)
4. **Generate rationale** (Design Rationale Generator)
5. **Final review** (Quality + Clarity checklists)

---

## Related Files

- `/src/content/schema/page-content.schema.json` - Content structure
- `/src/content/storybrand/framework.md` - StoryBrand reference
- `/src/content/_template.json` - Blank template
- `/business-context/` - Business reference materials
- `.cursor/prompts/modern-design-standards.md` - UX principles reference
- `.cursor/prompts/design-rationale-generator.md` - Rationale generation
- `.cursor/prompts/persuasion-checklist.md` - Psychological triggers
- `docs/02-discovery/design-decision-framework.md` - Decision validation
- `src/data/section-rationale.json` - Stored design rationales
