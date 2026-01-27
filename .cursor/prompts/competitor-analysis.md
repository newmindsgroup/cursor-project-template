# Competitor Analysis Prompt

## Purpose
Analyze competitor websites to identify positioning opportunities, messaging gaps, and design differentiation strategies.

## When to Use
- During discovery phase to understand competitive landscape
- When defining unique value proposition
- When identifying design/UX best practices in the industry
- Before content strategy development

## Inputs Required
1. **Competitor URLs** - List of 3-5 competitor websites to analyze
2. **Business Context** - Our client's business summary (from PROJECT.md or business-context/)
3. **Focus Areas** - Specific aspects to prioritize (messaging, design, features, pricing)

## Prompt Template

```
You are a competitive intelligence analyst specializing in digital marketing and web design.

Analyze the following competitor websites for [CLIENT BUSINESS NAME]:

COMPETITORS:
1. [URL 1] - [Company Name]
2. [URL 2] - [Company Name]
3. [URL 3] - [Company Name]

OUR CLIENT:
[Brief description of client's business, target audience, and goals]

FOCUS AREAS:
- [ ] Messaging and positioning
- [ ] Visual design and branding
- [ ] Feature comparison
- [ ] User experience
- [ ] Content strategy
- [ ] Pricing presentation
- [ ] Trust signals and social proof
- [ ] Call-to-action strategy

For each competitor, analyze:

1. POSITIONING
   - How do they position themselves in the market?
   - What is their primary value proposition?
   - Who is their apparent target audience?

2. MESSAGING
   - What is their primary headline/tagline?
   - What key benefits do they emphasize?
   - What tone and voice do they use?
   - What pain points do they address?

3. DESIGN
   - What is their visual style? (modern, traditional, playful, professional)
   - What colors and typography do they use?
   - How do they use imagery and media?
   - What design patterns are effective?

4. UX PATTERNS
   - How is their navigation structured?
   - What conversion paths do they use?
   - What trust signals do they display?
   - How do they handle calls-to-action?

5. CONTENT
   - What content types do they use? (blog, case studies, videos)
   - How do they demonstrate expertise?
   - What social proof do they leverage?

After analysis, provide:

DIFFERENTIATION OPPORTUNITIES:
- Gaps in competitor messaging we can fill
- Design approaches that would stand out
- Unique positioning angles

BEST PRACTICES TO ADOPT:
- Effective patterns we should consider
- Trust signals that work well
- Content strategies worth emulating

RECOMMENDATIONS:
1. [Specific recommendation for positioning]
2. [Specific recommendation for messaging]
3. [Specific recommendation for design]
4. [Specific recommendation for UX]
5. [Specific recommendation for content]

Output as a structured markdown report suitable for client presentation.
```

## Output Format
- Markdown document with clear sections
- Comparison tables where applicable
- Specific, actionable recommendations
- Screenshots or visual references if using browser tools

## Integration Points
- Feed insights into `scripts/analyze-business-context.mjs`
- Use findings in `generate-personas.mjs` for audience refinement
- Inform color choices in `generate-brand-colors.mjs`
- Guide messaging in `generate-section-content.mjs`

## Best Practices
1. Analyze live websites when possible (use MCP browser tools)
2. Focus on differentiation, not imitation
3. Document specific examples with screenshots
4. Prioritize actionable insights over comprehensive analysis
5. Consider both strengths to match AND weaknesses to exploit
