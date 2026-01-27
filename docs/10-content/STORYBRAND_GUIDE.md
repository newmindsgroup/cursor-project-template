# StoryBrand Content Guide

This guide explains how to use the StoryBrand framework for generating compelling website content.

## What is StoryBrand?

StoryBrand is a messaging framework by Donald Miller that positions your customer as the hero of the story, with your brand as the guide. This approach creates clearer, more compelling content that converts.

## The 7 Elements

### 1. Character (The Customer)
- Who is your ideal customer?
- What do they want?

### 2. Problem
- **External**: The tangible problem (need a website)
- **Internal**: How it makes them feel (frustrated, overwhelmed)
- **Philosophical**: Why it's wrong (every business deserves...)

### 3. Guide (Your Brand)
- **Empathy**: Show you understand their pain
- **Authority**: Demonstrate your expertise

### 4. Plan
- 3-4 simple steps to work with you
- Reduces perceived risk

### 5. Call to Action
- **Direct**: Primary conversion (Get Started)
- **Transitional**: Secondary nurture (Learn More)

### 6. Failure (Stakes)
- What happens if they don't act
- Creates urgency without fear-mongering

### 7. Success
- Paint the transformation
- Specific outcomes and benefits

## Using the Content System

### Content Location
All content is stored in `src/content/{language}/`:

```
src/content/
├── en/           # English content
│   ├── home.json
│   ├── about.json
│   └── ...
├── es/           # Spanish content
│   └── ...
└── schema/       # JSON schema
```

### Generating Content

1. **Use the AI Prompt**: Run `.cursor/prompts/storybrand-content.md`
2. **Provide context**: Business info, audience, brand voice
3. **Generate for all languages**: Request multiple languages at once

### Reviewing Content

1. **Content Presentation Page**: `/pages/content/`
   - Language switcher
   - Character count validation
   - Side-by-side comparison

2. **Export for Translation**:
   ```bash
   npm run content:bundle
   ```
   - CSV files in `_handoff/content/`
   - Markdown docs in `_handoff/content/{lang}/`

## Best Practices

### Headlines
- Focus on transformation, not features
- Use "you" language
- Keep under 10 words

### CTAs
- Action verbs
- Specific outcomes
- Create urgency

### Multilingual
- Adapt culturally, don't just translate
- Use native speakers for review
- Maintain brand voice across languages

## Related Files

- `/src/content/storybrand/framework.md` - Full framework reference
- `/src/content/schema/page-content.schema.json` - Content structure
- `/src/content/_template.json` - Blank template
- `/.cursor/prompts/storybrand-content.md` - AI generation prompt
