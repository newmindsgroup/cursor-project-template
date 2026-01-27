#!/usr/bin/env node

/**
 * AI Brand Color Generator
 * Generates brand-appropriate color palettes with full shade scales
 * 
 * Usage:
 *   node scripts/generate-brand-colors.mjs                          # Generate from context
 *   node scripts/generate-brand-colors.mjs --industry=tech          # Specify industry
 *   node scripts/generate-brand-colors.mjs --emotion=trust          # Target emotion
 *   node scripts/generate-brand-colors.mjs --base=#3B82F6           # Start from base color
 *   node scripts/generate-brand-colors.mjs --theme=corporate        # Generate as theme preset
 */

import path from 'path';
import { fileURLToPath } from 'url';
import {
  aiComplete,
  parseAIJson,
  readJson,
  writeJson,
  readFile,
  rootDir
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Industry color associations
const INDUSTRY_COLORS = {
  tech: { primary: 'blue', emotions: ['innovation', 'trust', 'professionalism'] },
  healthcare: { primary: 'blue/green', emotions: ['trust', 'calm', 'care'] },
  finance: { primary: 'blue/green', emotions: ['trust', 'stability', 'growth'] },
  creative: { primary: 'purple/pink', emotions: ['creativity', 'imagination', 'uniqueness'] },
  eco: { primary: 'green', emotions: ['nature', 'sustainability', 'growth'] },
  luxury: { primary: 'black/gold', emotions: ['elegance', 'exclusivity', 'premium'] },
  food: { primary: 'red/orange', emotions: ['appetite', 'energy', 'warmth'] },
  education: { primary: 'blue/purple', emotions: ['knowledge', 'growth', 'trust'] }
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    industry: null,
    emotion: null,
    base: null,
    theme: null,
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--industry=')) {
      options.industry = arg.split('=')[1];
    } else if (arg.startsWith('--emotion=')) {
      options.emotion = arg.split('=')[1];
    } else if (arg.startsWith('--base=')) {
      options.base = arg.split('=')[1];
    } else if (arg.startsWith('--theme=')) {
      options.theme = arg.split('=')[1];
    } else if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
AI Brand Color Generator - Create brand-appropriate color palettes

Usage:
  node scripts/generate-brand-colors.mjs [options]

Options:
  --industry=NAME   Industry type (tech, healthcare, finance, creative, eco, luxury, food, education)
  --emotion=NAME    Target emotion (trust, innovation, calm, energy, elegance, etc.)
  --base=#HEX       Generate palette from base color
  --theme=NAME      Save as theme preset (e.g., "custom-brand")
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Output:
  - Updates src/styles/tokens.css with new color variables
  - Creates theme preset in src/data/theme-presets/ if --theme specified

Examples:
  npm run ai:generate-colors                              # Generate from project context
  npm run ai:generate-colors -- --industry=tech           # Tech industry colors
  npm run ai:generate-colors -- --base=#6366F1            # Generate from indigo
  npm run ai:generate-colors -- --emotion=trust           # Colors that evoke trust
`);
}

/**
 * Load business context for color generation
 */
async function loadBusinessContext() {
  const context = {
    industry: null,
    brandVoice: null,
    targetEmotions: [],
    existingColors: null
  };

  // Load PROJECT.md for industry hints
  try {
    const projectContent = await readFile('PROJECT.md');
    context.projectContent = projectContent;
  } catch {
    // No project file
  }

  // Load existing tokens
  try {
    const tokensContent = await readFile('src/styles/tokens.css');
    const primaryMatch = tokensContent.match(/--color-primary-500:\s*(#[A-Fa-f0-9]{6})/);
    const secondaryMatch = tokensContent.match(/--color-secondary-500:\s*(#[A-Fa-f0-9]{6})/);
    if (primaryMatch) {
      context.existingColors = {
        primary: primaryMatch[1],
        secondary: secondaryMatch?.[1]
      };
    }
  } catch {
    // No tokens file
  }

  return context;
}

/**
 * Generate color palette using AI
 */
async function generateColorPalette(context, options) {
  const industryHint = options.industry 
    ? INDUSTRY_COLORS[options.industry] 
    : null;

  const systemPrompt = `You are an expert brand designer and color theorist.
Your task is to generate a comprehensive, accessible color palette for a brand.

Key principles:
1. Colors must work together harmoniously (consider color theory)
2. Ensure WCAG AA accessibility for text on backgrounds
3. Create a full shade scale (50-900) for each color
4. Primary color: main brand color for CTAs, links, key UI
5. Secondary color: complementary accent for variety
6. Neutral colors: for text, backgrounds, borders

Technical requirements:
- All colors in hex format
- 50 = lightest, 900 = darkest
- 500 = base/main shade
- Ensure sufficient contrast ratios

Output valid JSON only.`;

  const userPrompt = `Generate a brand color palette based on the following context:

${options.base ? `Base color to build from: ${options.base}` : ''}
${options.industry ? `Industry: ${options.industry} (typically uses ${industryHint?.primary} tones for ${industryHint?.emotions.join(', ')})` : ''}
${options.emotion ? `Target emotion: ${options.emotion}` : ''}
${context.projectContent ? `Project context:\n${context.projectContent.substring(0, 3000)}` : ''}
${context.existingColors ? `Current colors: Primary ${context.existingColors.primary}, Secondary ${context.existingColors.secondary}` : ''}

Generate a complete color palette with this JSON structure:
{
  "palette": {
    "primary": {
      "name": "Brand Primary",
      "description": "Main brand color - used for CTAs, links, key UI elements",
      "emotion": "The emotion this color evokes",
      "shades": {
        "50": "#hex",
        "100": "#hex",
        "200": "#hex",
        "300": "#hex",
        "400": "#hex",
        "500": "#hex",
        "600": "#hex",
        "700": "#hex",
        "800": "#hex",
        "900": "#hex"
      }
    },
    "secondary": {
      "name": "Brand Secondary",
      "description": "Accent color for variety and visual interest",
      "emotion": "The emotion this color evokes",
      "shades": {
        "50": "#hex",
        "100": "#hex",
        "200": "#hex",
        "300": "#hex",
        "400": "#hex",
        "500": "#hex",
        "600": "#hex",
        "700": "#hex",
        "800": "#hex",
        "900": "#hex"
      }
    },
    "neutral": {
      "name": "Neutral",
      "description": "For text, backgrounds, borders",
      "shades": {
        "50": "#hex",
        "100": "#hex",
        "200": "#hex",
        "300": "#hex",
        "400": "#hex",
        "500": "#hex",
        "600": "#hex",
        "700": "#hex",
        "800": "#hex",
        "900": "#hex"
      }
    }
  },
  "semantic": {
    "success": "#hex",
    "warning": "#hex",
    "error": "#hex",
    "info": "#hex"
  },
  "recommendations": {
    "textOnPrimary": "white|dark",
    "textOnSecondary": "white|dark",
    "primaryCTA": "Use primary-600 for buttons",
    "backgrounds": ["neutral-50", "neutral-100", "white"],
    "accessibilityNotes": "Notes about contrast ratios"
  },
  "metadata": {
    "generatedAt": "${new Date().toISOString()}",
    "industry": "${options.industry || 'general'}",
    "emotion": "${options.emotion || 'professional'}"
  }
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.7,
    maxTokens: 4000
  });

  return parseAIJson(response);
}

/**
 * Generate CSS custom properties from palette
 */
function generateCSS(palette) {
  let css = ':root {\n';
  
  // Primary colors
  css += '  /* Colors - Primary */\n';
  for (const [shade, hex] of Object.entries(palette.palette.primary.shades)) {
    css += `  --color-primary-${shade}: ${hex};\n`;
  }
  
  // Secondary colors
  css += '\n  /* Colors - Secondary */\n';
  for (const [shade, hex] of Object.entries(palette.palette.secondary.shades)) {
    css += `  --color-secondary-${shade}: ${hex};\n`;
  }
  
  // Neutral colors
  css += '\n  /* Colors - Neutral */\n';
  for (const [shade, hex] of Object.entries(palette.palette.neutral.shades)) {
    css += `  --color-neutral-${shade}: ${hex};\n`;
  }
  
  // Semantic colors
  css += '\n  /* Colors - Semantic */\n';
  css += `  --color-success: ${palette.semantic.success};\n`;
  css += `  --color-warning: ${palette.semantic.warning};\n`;
  css += `  --color-error: ${palette.semantic.error};\n`;
  css += `  --color-info: ${palette.semantic.info};\n`;
  
  css += '}\n';
  
  return css;
}

/**
 * Update tokens.css with new colors
 */
async function updateTokensCSS(palette) {
  const tokensPath = path.join(rootDir, 'src/styles/tokens.css');
  let content = await readFile(tokensPath);
  
  // Replace color sections
  const colorSection = generateCSS(palette);
  
  // Find and replace the color variables
  const primaryRegex = /\/\* Colors - Primary \*\/[\s\S]*?(?=\/\* Colors - Secondary \*\/)/;
  const secondaryRegex = /\/\* Colors - Secondary \*\/[\s\S]*?(?=\/\* Colors - Neutral \*\/)/;
  const neutralRegex = /\/\* Colors - Neutral \*\/[\s\S]*?(?=\/\* Spacing)/;
  
  // Update primary
  for (const [shade, hex] of Object.entries(palette.palette.primary.shades)) {
    const regex = new RegExp(`--color-primary-${shade}:\\s*#[A-Fa-f0-9]{6};`);
    content = content.replace(regex, `--color-primary-${shade}: ${hex};`);
  }
  
  // Update secondary
  for (const [shade, hex] of Object.entries(palette.palette.secondary.shades)) {
    const regex = new RegExp(`--color-secondary-${shade}:\\s*#[A-Fa-f0-9]{6};`);
    content = content.replace(regex, `--color-secondary-${shade}: ${hex};`);
  }
  
  // Update neutral
  for (const [shade, hex] of Object.entries(palette.palette.neutral.shades)) {
    const regex = new RegExp(`--color-neutral-${shade}:\\s*#[A-Fa-f0-9]{6};`);
    content = content.replace(regex, `--color-neutral-${shade}: ${hex};`);
  }
  
  await writeJson(tokensPath.replace('.css', '-backup.json'), { backup: content });
  
  const fs = await import('fs/promises');
  await fs.writeFile(tokensPath, content, 'utf-8');
}

/**
 * Save as theme preset
 */
async function saveThemePreset(palette, themeName) {
  const preset = {
    name: themeName,
    description: `AI-generated theme based on ${palette.metadata.emotion || 'brand'} emotion`,
    generatedAt: palette.metadata.generatedAt,
    colors: {
      primary: palette.palette.primary.shades,
      secondary: palette.palette.secondary.shades,
      neutral: palette.palette.neutral.shades
    },
    semantic: palette.semantic,
    recommendations: palette.recommendations
  };
  
  await writeJson(`src/data/theme-presets/${themeName}.json`, preset);
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log('\n🎨 AI Brand Color Generator\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Load context
  console.log('📚 Loading business context...');
  const context = await loadBusinessContext();

  // Generate palette
  console.log('🔄 Generating color palette...');
  
  try {
    const palette = await generateColorPalette(context, options);
    
    console.log('   ✅ Palette generated');

    if (options.verbose) {
      console.log('\n📋 Generated Palette:\n');
      console.log(`   Primary: ${palette.palette.primary.name}`);
      console.log(`      500: ${palette.palette.primary.shades['500']}`);
      console.log(`      Emotion: ${palette.palette.primary.emotion}`);
      console.log(`   Secondary: ${palette.palette.secondary.name}`);
      console.log(`      500: ${palette.palette.secondary.shades['500']}`);
      console.log(`      Emotion: ${palette.palette.secondary.emotion}`);
    }

    if (!options.dryRun) {
      // Update tokens.css
      console.log('\n📝 Updating src/styles/tokens.css...');
      await updateTokensCSS(palette);
      console.log('   ✅ tokens.css updated');

      // Save as theme preset if specified
      if (options.theme) {
        console.log(`\n📁 Saving theme preset: ${options.theme}...`);
        await saveThemePreset(palette, options.theme);
        console.log(`   ✅ Saved to src/data/theme-presets/${options.theme}.json`);
      }

      // Save full palette data
      await writeJson('src/data/generated-palette.json', palette);
      console.log('   ✅ Full palette saved to src/data/generated-palette.json');
    } else {
      console.log('\n📋 Dry run - no files written');
      console.log('\nGenerated palette preview:');
      console.log(JSON.stringify(palette.palette.primary.shades, null, 2));
    }

    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('\n📊 Summary:\n');
    console.log(`   Primary: ${palette.palette.primary.shades['500']}`);
    console.log(`   Secondary: ${palette.palette.secondary.shades['500']}`);
    console.log(`   Industry: ${palette.metadata.industry}`);
    console.log(`   Emotion: ${palette.metadata.emotion}`);
    
    if (palette.recommendations) {
      console.log(`\n💡 Recommendations:`);
      console.log(`   Text on primary: ${palette.recommendations.textOnPrimary}`);
      console.log(`   CTA: ${palette.recommendations.primaryCTA}`);
    }

    console.log('');

  } catch (error) {
    console.log(`\n❌ Generation failed: ${error.message}`);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
