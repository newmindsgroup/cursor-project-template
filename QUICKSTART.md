# Quick Start Guide

Get from zero to a live website preview in minutes.

## Template Overview

This template comes in a **clean state** ready for your new project:
- Content files are empty templates
- No demo branding or placeholder text
- Settings are reset to defaults

### Getting Started Options

| What you want | Command | Description |
|--------------|---------|-------------|
| **Start a new project** | `npm run wizard` | Guided setup with AI content generation |
| **See a demo** | `npm run demo` | Load demo content to explore features |
| **Reset to clean state** | `npm run reset:all` | Clear everything and start fresh |

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** (comes with Node.js)

For deployment (optional but recommended):
- **GitHub CLI**: `brew install gh` then `gh auth login`
- **Vercel CLI**: `npm i -g vercel` then `vercel login`

## 1. Start a New Project

```bash
# Duplicate the starter kit
cp -r website-project-starter-kit my-client-project

# Enter the project
cd my-client-project

# Install dependencies
npm install

# Run the interactive menu
npm start
```

## 2. Choose Your Path

When you run `npm start`, you'll see an interactive menu:

```
╔═══════════════════════════════════════════════════════════╗
║           Website Project Starter Kit                     ║
╠═══════════════════════════════════════════════════════════╣
║  [1] 🚀 Quick Start Wizard                                ║
║  [2] 📝 Update Existing Project                           ║
║  [3] 🌐 Deploy / Preview                                  ║
║  [4] 📚 Help & Documentation                              ║
║  [5] ⚡ Advanced Commands                                 ║
╚═══════════════════════════════════════════════════════════╝
```

### Option 1: Quick Start Wizard (New Projects)

The wizard guides you through:
1. **Project Basics** - Name, client, industry
2. **AI Provider** - Configure OpenAI, Anthropic, or Google AI
3. **Upload Context** - Brand docs, existing content, assets
4. **Select Pages** - Choose which pages to generate
5. **Generate & Deploy** - Create everything and deploy to Vercel

### Option 2: Update Existing Project

Return to change any settings:
- Edit project information
- Upload additional context files
- Regenerate specific content
- Update theme and colors

### Option 3: Deploy / Preview

One-click deployment:
1. Builds your project
2. Creates/updates GitHub repository
3. Deploys to Vercel
4. Returns a live preview URL to share

### Option 4: Help & Documentation

Shows all available commands with descriptions.

### Option 5: Advanced Commands

Access individual generation and validation tools.

## Direct Commands

Skip the menu with direct commands:

```bash
# Start the wizard directly
npm run wizard

# Deploy immediately
npm run deploy

# Show all available commands
npm run help

# Run the full AI pipeline
npm run ai:full-pipeline

# Validate everything
npm run validate
```

## Typical Workflow

### New Project

```bash
npm start        # Choose "Quick Start Wizard"
                 # → Fill out project details
                 # → Upload client documents
                 # → Select pages
                 # → Generate everything
                 # → Get live URL
```

### Making Changes

```bash
npm start        # Choose "Update Existing Project"
                 # → Edit what you need
                 # → Regenerate affected content
                 # → Re-deploy
```

### Quick Deploy

```bash
npm run deploy   # Build + push to GitHub + deploy to Vercel
```

## Development Workflow

### Watch Mode

Run watch mode for auto-validation during development:

```bash
npm run dev:watch           # Full watch mode with auto-validation
npm run dev:watch:content   # Watch content files only
```

Watch mode will:
- Monitor file changes in `src/`, `public/`, and `_handoff/`
- Run validation automatically on save
- Report errors immediately in the terminal

### Visual QA with Visual Diff

Capture and compare screenshots to catch visual regressions:

```bash
# Before making changes
npm run visual-diff:baseline

# After changes
npm run visual-diff:compare
```

This generates a visual diff report at all breakpoints (desktop, tablet, mobile).

## Advanced AI Features

### Faster Content Generation

Use parallel mode to generate content 3-4x faster:

```bash
npm run ai:content:parallel   # Process multiple sections simultaneously
```

### Higher Quality Content

Enable multi-pass refinement for better results:

```bash
npm run ai:content:quality    # Refines content until quality threshold met
```

### Theme Builder

Customize your visual design with the interactive theme builder:

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/pages/wizard/theme/`
3. Adjust colors, typography, and spacing
4. Export CSS variables to apply to your project

### Animation Presets

Add professional animations with data attributes:

```html
<div data-preset="reveal-up">Fades in from below</div>
<div data-preset="stagger-cards">Children animate in sequence</div>
<span data-preset="counter" data-value="500">0</span>
```

24 presets available. See `.cursor/prompts/animation-presets-guide.md` for full list.

## File Structure

```
my-client-project/
├── src/
│   ├── content/         # Generated page content (JSON)
│   ├── pages/           # Generated HTML pages
│   └── assets/          # Generated images
├── business-context/
│   ├── uploads/         # Your uploaded files (PDFs, docs, etc.)
│   └── README.md        # Context folder documentation
├── _handoff/            # Exported assets for implementation
├── project-settings.json       # Project configuration
└── project-settings.local.json # Local/sensitive settings (gitignored)
```

## Supported File Types

Upload these to provide business context:
- **Documents**: PDF, Word (.doc, .docx)
- **Spreadsheets**: Excel (.xls, .xlsx), CSV
- **Text**: Markdown (.md), Plain text (.txt)
- **Images**: PNG, JPG, GIF

## Deployment Prerequisites

For automatic deployment to work:

1. **GitHub CLI**
   ```bash
   brew install gh
   gh auth login
   ```

2. **Vercel CLI**
   ```bash
   npm i -g vercel
   vercel login
   ```

The wizard will guide you through setup if these aren't configured.

## Environment Variables

For manual configuration, create `project-settings.local.json`:

```json
{
  "ai": {
    "apiKeys": {
      "openai": "sk-...",
      "anthropic": "sk-ant-...",
      "google": "AIza..."
    }
  },
  "deployment": {
    "github": {
      "repo": "username/project-name"
    },
    "vercel": {
      "url": "https://project-name.vercel.app"
    }
  }
}
```

## Getting Help

```bash
# Show all commands
npm run help

# Check project status
npm run progress:scan

# Find content gaps
npm run wizard:check

# Run validation
npm run validate
```

## Next Steps

After initial setup:
1. Review generated content in the wizard status dashboard
2. Edit content directly in the Page Designer
3. Run validation to check for issues
4. Deploy to share with your team

## Exploring the Demo

Want to see what a completed project looks like?

```bash
# Load demo content
npm run demo

# Browse the prototype at http://localhost:5173
npm run dev

# Reset back to clean state when done
npm run reset:all
```

## Resetting the Template

If you need to start fresh or clear out test data:

```bash
# Full reset (confirmation prompt)
npm run reset:all

# Skip confirmation (for scripts)
npm run reset:confirm

# Reset only demo data
npm run demo:reset
```

The reset script will:
- Clear all content files to empty templates
- Remove business context uploads
- Clear handoff exports
- Reset project settings to defaults

---

For detailed documentation, see the `/docs` folder.
