# Project Setup Wizard Guide

This guide explains how to use the interactive project setup wizard to configure and generate your website prototype.

## Starting the Wizard

```bash
npm run wizard
```

This opens the wizard in your browser at `http://localhost:3001/pages/wizard/`.

## Wizard Steps

### Step 1: Project Basics

Configure fundamental project information:

- **Project Name**: Your client's business or project name
- **Project Slug**: URL-safe identifier (auto-generated from name)
- **Industry**: Select from predefined industries or enter custom
- **Project Type**: Website type (business, e-commerce, portfolio, etc.)

**Tips:**
- The project slug is used in URLs and file paths
- Industry selection helps AI generate more relevant content

### Step 2: AI Provider Configuration

Set up your AI provider for content generation:

**Available Providers:**
1. **OpenAI** - GPT-4 models (recommended for quality)
2. **Anthropic** - Claude models (excellent for nuanced content)
3. **Google AI** - Gemini models (good balance of speed/quality)
4. **Cursor** - Use Cursor's built-in AI (no API key needed)

**Configuration:**
- Enter your API key for the selected provider
- Test connection to verify the key works
- Keys are stored securely in `project-settings.local.json` (gitignored)

### Step 3: Business Context Upload

Upload documents that describe your client's business:

**Supported File Types:**
- `.txt`, `.md` - Text and Markdown files
- `.pdf` - PDF documents (text extracted)
- `.docx` - Word documents
- `.json` - Structured data

**Best Files to Upload:**
- Company profile or about page content
- Target audience descriptions
- Competitor analysis
- Brand guidelines
- Previous marketing materials
- Customer testimonials

**How Context is Used:**
- AI analyzes uploaded files to understand the business
- Content is generated using StoryBrand framework
- The more context, the better the generated content

### Step 4: Configure Pages

Select which pages to generate:

**Page Selection:**
- Home page (required)
- About page
- Services page
- Contact page
- Custom pages

**Blueprint Selection:**
Each page can use different section blueprints:
- Hero sections (various layouts)
- Feature sections
- Testimonial sections
- CTA sections
- FAQ sections

### Step 5: Generate Content

Start the AI content generation process:

**Generation Options:**
- **Standard**: Generate content sequentially
- **Parallel**: Generate multiple sections simultaneously (faster)
- **Quality Mode**: Multi-pass refinement for higher quality

**What Gets Generated:**
- StoryBrand-aligned headlines
- Persuasive body copy
- CTAs and button text
- Meta descriptions
- Alt text suggestions

## After Generation

Once generation completes:

1. **Preview**: Click "Preview" to see generated pages
2. **Edit**: Use the content editor to refine text
3. **Export**: Generate handoff package for developers

## Command Line Alternative

For advanced users, run wizard steps via CLI:

```bash
# Start just the wizard server
npm run wizard:server

# Generate content directly
npm run ai:content

# Parallel generation
npm run ai:content:parallel

# Quality mode with refinement
npm run ai:content:quality
```

## Troubleshooting

**Wizard won't start:**
- Check if port 3001 is in use: `lsof -i :3001`
- Try: `npm run wizard:server` then open manually

**API key not working:**
- Verify key in provider's dashboard
- Check for leading/trailing spaces
- Ensure sufficient API credits

**Content generation slow:**
- Use parallel mode: `npm run ai:content:parallel`
- Reduce number of pages initially
- Check network connection

## Related Prompts

- `@theme-builder-guide.md` - Customize visual theme
- `@advanced-ai-features.md` - AI generation options
- `@development-workflow.md` - Full development workflow
