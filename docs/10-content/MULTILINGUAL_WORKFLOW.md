# Multilingual Content Workflow

This document outlines the process for creating, managing, and handing off multilingual website content.

## Overview

The content system supports any number of languages through a structured JSON format with export tools for translation teams.

## Directory Structure

```
src/content/
├── schema/
│   └── page-content.schema.json  # Validation schema
├── storybrand/
│   └── framework.md              # StoryBrand reference
├── en/                           # Primary language
│   ├── home.json
│   ├── about.json
│   ├── services.json
│   └── contact.json
├── es/                           # Spanish
│   └── ...
├── fr/                           # French (add as needed)
│   └── ...
└── _template.json                # Blank template
```

## Workflow

### 1. Create Base Content (English)

Start with the primary language using the StoryBrand framework:

```bash
# Use the AI prompt to generate content
# See .cursor/prompts/storybrand-content.md
```

### 2. Export for Translation

Generate translation-ready files:

```bash
npm run content:bundle
```

This creates:
- `_handoff/content/home.csv` - Per-page CSV with all languages
- `_handoff/content/all-content.csv` - Combined CSV
- `_handoff/content/en/home.md` - Markdown per language

### 3. Send to Translators

The CSV format includes:
- Page and section context
- Character limits
- Notes for translators

| Column | Description |
|--------|-------------|
| page | Page name (home, about, etc.) |
| key | Content key path |
| en | English content |
| es | Spanish content |
| max_chars | Character limit |
| notes | Context for translators |

### 4. Receive Translations

Update the JSON files directly:
```
src/content/es/home.json
```

Or import from CSV back to JSON (manual process).

### 5. Review in Context

Use the Content Presentation page:

1. Open `/pages/content/`
2. Select language from dropdown
3. Compare languages side-by-side
4. Check character counts

### 6. Handoff

Final content is included in:
- `_handoff/content/` - Export files
- `dist/pages/content/` - Presentation page (after build)

## Adding a New Language

1. Create directory: `src/content/{lang}/`
2. Copy template: `cp src/content/_template.json src/content/fr/home.json`
3. Update language selector in content-presentation.ts
4. Generate translations

## Quality Checklist

- [ ] All pages have content in all languages
- [ ] Character limits respected
- [ ] CTAs adapted for culture (not just translated)
- [ ] StoryBrand framework maintained
- [ ] Brand voice consistent across languages
- [ ] Meta descriptions localized for SEO

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run content:export-csv` | Export all content to CSV |
| `npm run content:export-md` | Export to Markdown docs |
| `npm run content:bundle` | Run all content exports |

## Best Practices

### For Content Creators
- Complete StoryBrand framework before sections
- Use clear, simple language
- Stay within character limits
- Mark content status (draft/review/approved)

### For Translators
- Adapt culturally, don't just translate
- Respect character limits
- Maintain emotional impact
- Keep CTA action-oriented

### For Reviewers
- Use side-by-side comparison
- Check all pages and sections
- Verify character counts
- Test in context on prototype

## Related Documentation

- [STORYBRAND_GUIDE.md](STORYBRAND_GUIDE.md) - StoryBrand framework
- [Content Schema](../../src/content/schema/page-content.schema.json) - JSON structure
- [Framework Reference](../../src/content/storybrand/framework.md) - Full guide
