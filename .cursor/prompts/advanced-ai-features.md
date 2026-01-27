# Advanced AI Features Guide

This guide covers the advanced AI content generation capabilities including parallel processing, multi-pass refinement, smart caching, and real-time progress streaming.

## Parallel Content Generation

Generate content for multiple sections simultaneously, achieving 3-4x speed improvement.

### Command Line Usage

```bash
# Standard parallel generation
npm run ai:content:parallel

# Custom concurrency (default is 3)
node scripts/generate-section-content.mjs --parallel --concurrency 5

# Parallel with specific page
node scripts/generate-section-content.mjs --page home --parallel
```

### How It Works

1. Sections are grouped into batches based on concurrency setting
2. Each batch is processed simultaneously
3. Results are collected and applied in order
4. Progress is reported for each completed section

### Best Practices

- **Concurrency 3**: Safe default, works with all API providers
- **Concurrency 5**: Faster, may hit rate limits on some providers
- **Concurrency 1**: Sequential mode, useful for debugging

## Multi-Pass Quality Refinement

Automatically refine content through multiple AI passes until quality threshold is met.

### Command Line Usage

```bash
# Enable refinement with default threshold (7/10)
npm run ai:content:quality

# Custom quality threshold (1-10 scale)
node scripts/generate-section-content.mjs --refine --quality 8

# Combine with parallel processing
node scripts/generate-section-content.mjs --parallel --refine --quality 8
```

### Quality Scoring

Content is scored on:
- **Clarity** (1-10): How clear and understandable
- **Persuasiveness** (1-10): StoryBrand alignment
- **Specificity** (1-10): Concrete vs. generic language
- **Tone** (1-10): Appropriate voice for brand

### Refinement Process

1. Initial content generated
2. AI scores content against rubric
3. If below threshold, AI identifies weaknesses
4. Targeted improvements are made
5. Process repeats (max 3 passes)
6. Best version is selected

### Configuration

In `scripts/lib/content-refiner.mjs`:

```javascript
export const QUALITY_THRESHOLD = 7;  // Default minimum score
export const MAX_REFINEMENTS = 3;    // Maximum passes
```

## Smart Caching

Automatically cache AI responses to avoid redundant API calls and reduce costs.

### How It Works

- Responses are cached based on prompt hash
- Cache is stored in `.cache/ai-responses/`
- Default TTL: 24 hours
- Cache key includes: prompt, model, temperature

### Cache Statistics

After generation, cache stats are displayed:

```
Cache Statistics:
  Hits: 12 (reused cached responses)
  Misses: 5 (new API calls)
  Estimated Savings: $0.24
```

### Cache Management

```bash
# Clear all cached responses
node -e "import('./scripts/lib/ai-utils.mjs').then(m => m.clearCache())"

# Disable caching for a run
node scripts/generate-section-content.mjs --no-cache
```

### When to Clear Cache

- After changing AI prompts significantly
- After updating business context
- When content feels stale or repetitive

## Real-Time Progress Streaming

Monitor content generation progress via Server-Sent Events (SSE).

### Viewing Progress

1. Start the wizard server: `npm run wizard:server`
2. Open wizard in browser
3. Start content generation
4. Progress panel shows:
   - Current step and status
   - Elapsed time
   - Token usage
   - Estimated cost
   - Live log of operations

### Progress States

| State | Icon | Meaning |
|-------|------|---------|
| Pending | ○ | Not yet started |
| Running | ◐ | Currently processing |
| Completed | ✓ | Successfully finished |
| Error | ✗ | Failed (check log) |

### Progress Data

Each update includes:
- `step`: Current step name
- `status`: pending/running/completed/error
- `message`: Descriptive status
- `elapsed`: Time since start (seconds)
- `tokens`: Total tokens used
- `cost`: Estimated API cost

## Content Suggestions

AI-powered suggestions for improving generated content.

### Quick Suggestions (Rule-Based)

Instant checks without API calls:

```javascript
import { getQuickSuggestions } from './scripts/lib/content-suggestions.mjs';

const suggestions = getQuickSuggestions(content);
// Returns issues like:
// - "Headline too long (>70 chars)"
// - "Consider adding power words"
// - "CTA could be stronger"
```

### AI Suggestions

Deep analysis using AI:

```javascript
import { getAISuggestions } from './scripts/lib/content-suggestions.mjs';

const suggestions = await getAISuggestions(content, {
  focusAreas: ['persuasion', 'clarity', 'seo']
});
```

### Suggestion Rules

Built-in rules check for:
- Headline length (optimal: 40-70 chars)
- Power word usage
- Vague number claims
- Weak CTA language
- Meta description length
- Paragraph length
- Problem/transformation statements

## Combining Features

For maximum efficiency and quality:

```bash
# Full optimization: parallel + refinement + caching
node scripts/generate-section-content.mjs \
  --parallel \
  --concurrency 4 \
  --refine \
  --quality 8 \
  --apply
```

This command:
1. Processes 4 sections simultaneously
2. Refines each until score ≥ 8
3. Uses cached responses where available
4. Applies results directly to files

## API Provider Recommendations

| Provider | Parallel | Refinement | Notes |
|----------|----------|------------|-------|
| OpenAI | ✓ (5) | ✓ | Best overall |
| Anthropic | ✓ (3) | ✓ | Great quality |
| Google | ✓ (5) | ✓ | Good balance |
| Cursor | ✓ (2) | Limited | Free option |

## Troubleshooting

### Rate Limiting

If you see rate limit errors:
1. Reduce concurrency: `--concurrency 2`
2. Add delays between batches
3. Check your API plan limits

### Low Quality Scores

If refinement isn't reaching threshold:
1. Check business context completeness
2. Lower threshold temporarily: `--quality 6`
3. Review and improve prompts

### Cache Issues

If content seems outdated:
1. Clear cache (see above)
2. Verify cache TTL settings
3. Check for prompt changes

## Related Prompts

- `@wizard-usage.md` - Setup wizard guide
- `@development-workflow.md` - Full workflow
- `@storybrand-content.md` - Content framework
