#!/usr/bin/env node

/**
 * Apply Theme Script
 * Apply a theme preset to update design tokens
 * 
 * Usage:
 *   node scripts/apply-theme.mjs <theme-name>
 *   node scripts/apply-theme.mjs --list
 * 
 * Examples:
 *   node scripts/apply-theme.mjs corporate
 *   node scripts/apply-theme.mjs startup
 *   node scripts/apply-theme.mjs --list
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    themeName: args.find(arg => !arg.startsWith('-')),
    list: args.includes('--list') || args.includes('-l'),
    help: args.includes('--help') || args.includes('-h'),
    preview: args.includes('--preview') || args.includes('-p')
  };
}

// Show help
function showHelp() {
  console.log(`
Apply Theme - Update design tokens with a theme preset

Usage:
  node scripts/apply-theme.mjs <theme-name>

Options:
  --list, -l      List available themes
  --preview, -p   Preview theme without applying
  --help, -h      Show this help message

Available Themes:
  corporate   Professional blue/gray for business
  startup     Vibrant magenta/cyan for startups
  creative    Bold orange/red for creative agencies
  minimal     Clean black/white with subtle accents
  warm        Friendly orange/brown/pink
  cool        Calming teal/purple

Examples:
  node scripts/apply-theme.mjs startup
  node scripts/apply-theme.mjs --list
  node scripts/apply-theme.mjs creative --preview
`);
}

// Load theme config
async function loadThemeConfig() {
  const configPath = path.join(rootDir, 'src/data/theme-config.json');
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

// Load theme preset
async function loadThemePreset(presetFile) {
  const presetPath = path.join(rootDir, 'src/data', presetFile);
  const content = await fs.readFile(presetPath, 'utf-8');
  return JSON.parse(content);
}

// Generate tokens.css content
function generateTokensCSS(theme) {
  const { colors, typography, spacing, effects } = theme;

  return `:root {
  /* Colors - Primary */
  --color-primary-50: ${colors.primary['50']};
  --color-primary-100: ${colors.primary['100']};
  --color-primary-200: ${colors.primary['200']};
  --color-primary-300: ${colors.primary['300']};
  --color-primary-400: ${colors.primary['400']};
  --color-primary-500: ${colors.primary['500']};
  --color-primary-600: ${colors.primary['600']};
  --color-primary-700: ${colors.primary['700']};
  --color-primary-800: ${colors.primary['800']};
  --color-primary-900: ${colors.primary['900']};

  /* Colors - Secondary */
  --color-secondary-50: ${colors.secondary['50']};
  --color-secondary-100: ${colors.secondary['100']};
  --color-secondary-200: ${colors.secondary['200']};
  --color-secondary-300: ${colors.secondary['300']};
  --color-secondary-400: ${colors.secondary['400']};
  --color-secondary-500: ${colors.secondary['500']};
  --color-secondary-600: ${colors.secondary['600']};
  --color-secondary-700: ${colors.secondary['700']};
  --color-secondary-800: ${colors.secondary['800']};
  --color-secondary-900: ${colors.secondary['900']};

  /* Colors - Neutral */
  --color-neutral-50: ${colors.neutral['50']};
  --color-neutral-100: ${colors.neutral['100']};
  --color-neutral-200: ${colors.neutral['200']};
  --color-neutral-300: ${colors.neutral['300']};
  --color-neutral-400: ${colors.neutral['400']};
  --color-neutral-500: ${colors.neutral['500']};
  --color-neutral-600: ${colors.neutral['600']};
  --color-neutral-700: ${colors.neutral['700']};
  --color-neutral-800: ${colors.neutral['800']};
  --color-neutral-900: ${colors.neutral['900']};

  /* Spacing - Elementor-friendly names */
  --spacing-section-padding-y: ${spacing.sectionPaddingY}; /* ${parseFloat(spacing.sectionPaddingY) * 16}px */
  --spacing-section-gap: ${spacing.sectionGap}; /* ${parseFloat(spacing.sectionGap) * 16}px */
  --spacing-container-padding: ${spacing.containerPadding}; /* ${parseFloat(spacing.containerPadding) * 16}px */
  --spacing-element-gap: ${spacing.elementGap}; /* ${parseFloat(spacing.elementGap) * 16}px */
  --spacing-tight: 0.5rem; /* 8px */
  --spacing-normal: 1rem; /* 16px */
  --spacing-relaxed: 1.5rem; /* 24px */
  --spacing-loose: 2rem; /* 32px */

  /* Typography - Font Families */
  --font-heading: ${typography.fontHeading};
  --font-body: ${typography.fontBody};

  /* Typography - Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
  --text-7xl: 4.5rem;

  /* Typography - Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Border Radius */
  --radius-sm: ${effects.radiusSm};
  --radius-md: ${effects.radiusMd};
  --radius-lg: ${effects.radiusLg};
  --radius-xl: ${effects.radiusXl};
  --radius-2xl: ${effects.radius2xl};
  --radius-3xl: 2rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-soft: ${effects.shadowSoft};
  --shadow-medium: ${effects.shadowMedium};
  --shadow-large: ${effects.shadowLarge};

  /* Breakpoints (for JS access) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Container Max Width */
  --container-max-width: 1280px;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 300ms;
  --transition-slow: 500ms;
}
`;
}

// Generate Tailwind config colors
function generateTailwindColors(theme) {
  const { colors } = theme;
  
  return `    colors: {
      primary: {
        50: '${colors.primary['50']}',
        100: '${colors.primary['100']}',
        200: '${colors.primary['200']}',
        300: '${colors.primary['300']}',
        400: '${colors.primary['400']}',
        500: '${colors.primary['500']}',
        600: '${colors.primary['600']}',
        700: '${colors.primary['700']}',
        800: '${colors.primary['800']}',
        900: '${colors.primary['900']}',
      },
      secondary: {
        50: '${colors.secondary['50']}',
        100: '${colors.secondary['100']}',
        200: '${colors.secondary['200']}',
        300: '${colors.secondary['300']}',
        400: '${colors.secondary['400']}',
        500: '${colors.secondary['500']}',
        600: '${colors.secondary['600']}',
        700: '${colors.secondary['700']}',
        800: '${colors.secondary['800']}',
        900: '${colors.secondary['900']}',
      },
      neutral: {
        50: '${colors.neutral['50']}',
        100: '${colors.neutral['100']}',
        200: '${colors.neutral['200']}',
        300: '${colors.neutral['300']}',
        400: '${colors.neutral['400']}',
        500: '${colors.neutral['500']}',
        600: '${colors.neutral['600']}',
        700: '${colors.neutral['700']}',
        800: '${colors.neutral['800']}',
        900: '${colors.neutral['900']}',
      },
    },`;
}

// Update theme config active theme
async function updateThemeConfig(themeName) {
  const configPath = path.join(rootDir, 'src/data/theme-config.json');
  const config = await loadThemeConfig();
  config.activeTheme = themeName;
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// List available themes
async function listThemes() {
  const config = await loadThemeConfig();
  
  console.log('\n🎨 Available Themes:\n');
  
  for (const [key, theme] of Object.entries(config.themes)) {
    const active = config.activeTheme === key ? ' (active)' : '';
    console.log(`  ${key}${active}`);
    console.log(`    ${theme.description}\n`);
  }
}

// Preview theme
function previewTheme(theme) {
  console.log(`\n🎨 Theme: ${theme.name}\n`);
  console.log(`   ${theme.description}\n`);
  
  console.log('   Primary Colors:');
  console.log(`     500: ${theme.colors.primary['500']}`);
  console.log(`     600: ${theme.colors.primary['600']}`);
  
  console.log('\n   Secondary Colors:');
  console.log(`     500: ${theme.colors.secondary['500']}`);
  console.log(`     600: ${theme.colors.secondary['600']}`);
  
  console.log('\n   Typography:');
  console.log(`     Heading: ${theme.typography.fontHeading}`);
  console.log(`     Body: ${theme.typography.fontBody}`);
  
  console.log('\n   Border Radius:');
  console.log(`     MD: ${theme.effects.radiusMd}`);
  console.log(`     XL: ${theme.effects.radiusXl}`);
}

// Main function
async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (args.list) {
    await listThemes();
    process.exit(0);
  }

  if (!args.themeName) {
    console.error('❌ Please specify a theme name.');
    console.log('   Run with --list to see available themes.');
    process.exit(1);
  }

  // Load theme config and preset
  const config = await loadThemeConfig();
  const themeEntry = config.themes[args.themeName];

  if (!themeEntry) {
    console.error(`❌ Theme "${args.themeName}" not found.`);
    console.log('   Run with --list to see available themes.');
    process.exit(1);
  }

  const theme = await loadThemePreset(themeEntry.presetFile);

  if (args.preview) {
    previewTheme(theme);
    process.exit(0);
  }

  console.log(`\n🎨 Applying theme: ${theme.name}\n`);

  // Generate and write tokens.css
  const tokensCSS = generateTokensCSS(theme);
  const tokensPath = path.join(rootDir, 'src/styles/tokens.css');
  await fs.writeFile(tokensPath, tokensCSS, 'utf-8');
  console.log('   ✅ Updated src/styles/tokens.css');

  // Update tailwind.config.ts colors section
  const tailwindPath = path.join(rootDir, 'tailwind.config.ts');
  let tailwindConfig = await fs.readFile(tailwindPath, 'utf-8');
  
  // Find and replace colors section
  const colorsRegex = /colors:\s*\{[\s\S]*?\n\s{4}\},/;
  const newColors = generateTailwindColors(theme);
  
  if (colorsRegex.test(tailwindConfig)) {
    tailwindConfig = tailwindConfig.replace(colorsRegex, newColors);
    await fs.writeFile(tailwindPath, tailwindConfig, 'utf-8');
    console.log('   ✅ Updated tailwind.config.ts colors');
  } else {
    console.log('   ⚠️  Could not update tailwind.config.ts (colors section not found)');
  }

  // Update theme config
  await updateThemeConfig(args.themeName);
  console.log('   ✅ Updated theme-config.json');

  console.log(`
✨ Theme "${theme.name}" applied successfully!

   Primary:   ${theme.colors.primary['600']}
   Secondary: ${theme.colors.secondary['600']}
   Font:      ${theme.typography.fontHeading.split(',')[0]}

Next steps:
   1. Run \`npm run dev\` to see changes
   2. Check the styleguide at /pages/styleguide/
   3. Restart dev server if colors don't update
`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
