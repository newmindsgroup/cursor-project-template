#!/usr/bin/env node

/**
 * Design Token Exporter
 * Exports design tokens from CSS to various formats
 * 
 * Usage:
 *   node scripts/export-tokens.mjs                    # Export all formats
 *   node scripts/export-tokens.mjs --format=json     # JSON only
 *   node scripts/export-tokens.mjs --format=figma    # Figma-compatible
 *   node scripts/export-tokens.mjs --format=scss     # SCSS variables
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// CLI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function color(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    format: 'all',
    output: null,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Design Token Exporter', colors.bold, colors.cyan)}

Export design tokens from CSS to various formats.

${color('Usage:', colors.bold)}
  node scripts/export-tokens.mjs [options]

${color('Options:', colors.bold)}
  --format=FORMAT   Output format: all (default), json, scss, css, figma, tailwind
  --output=DIR      Output directory (default: dist/tokens)
  --help, -h        Show this help message

${color('Formats:', colors.bold)}
  json      - JavaScript-friendly JSON object
  scss      - SCSS variables
  css       - CSS custom properties (standalone)
  figma     - Figma Tokens plugin format
  tailwind  - Tailwind CSS config extension

${color('Examples:', colors.bold)}
  npm run tokens:export                       # Export all formats
  npm run tokens:export -- --format=json      # JSON only
  npm run tokens:export -- --format=figma     # Figma format
`);
}

/**
 * Parse CSS custom properties from tokens.css
 */
async function parseTokensCSS() {
  const tokensPath = path.join(rootDir, 'src/styles/tokens.css');
  const content = await fs.readFile(tokensPath, 'utf-8');
  
  const tokens = {
    colors: {
      primary: {},
      secondary: {},
      neutral: {},
      semantic: {}
    },
    spacing: {},
    typography: {
      fontFamily: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
      letterSpacing: {}
    },
    borderRadius: {},
    shadows: {},
    breakpoints: {}
  };
  
  // Extract CSS custom properties
  const varRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  let match;
  
  while ((match = varRegex.exec(content)) !== null) {
    const [, name, value] = match;
    const trimmedValue = value.trim();
    
    // Categorize tokens
    if (name.startsWith('color-primary-')) {
      const shade = name.replace('color-primary-', '');
      tokens.colors.primary[shade] = trimmedValue;
    } else if (name.startsWith('color-secondary-')) {
      const shade = name.replace('color-secondary-', '');
      tokens.colors.secondary[shade] = trimmedValue;
    } else if (name.startsWith('color-neutral-')) {
      const shade = name.replace('color-neutral-', '');
      tokens.colors.neutral[shade] = trimmedValue;
    } else if (name.startsWith('color-')) {
      const semantic = name.replace('color-', '');
      tokens.colors.semantic[semantic] = trimmedValue;
    } else if (name.startsWith('spacing-')) {
      const size = name.replace('spacing-', '');
      tokens.spacing[size] = trimmedValue;
    } else if (name.startsWith('font-family-')) {
      const family = name.replace('font-family-', '');
      tokens.typography.fontFamily[family] = trimmedValue;
    } else if (name.startsWith('font-size-')) {
      const size = name.replace('font-size-', '');
      tokens.typography.fontSize[size] = trimmedValue;
    } else if (name.startsWith('font-weight-')) {
      const weight = name.replace('font-weight-', '');
      tokens.typography.fontWeight[weight] = trimmedValue;
    } else if (name.startsWith('line-height-')) {
      const height = name.replace('line-height-', '');
      tokens.typography.lineHeight[height] = trimmedValue;
    } else if (name.startsWith('letter-spacing-')) {
      const spacing = name.replace('letter-spacing-', '');
      tokens.typography.letterSpacing[spacing] = trimmedValue;
    } else if (name.startsWith('radius-')) {
      const radius = name.replace('radius-', '');
      tokens.borderRadius[radius] = trimmedValue;
    } else if (name.startsWith('shadow-')) {
      const shadow = name.replace('shadow-', '');
      tokens.shadows[shadow] = trimmedValue;
    } else if (name.startsWith('breakpoint-')) {
      const bp = name.replace('breakpoint-', '');
      tokens.breakpoints[bp] = trimmedValue;
    }
  }
  
  return tokens;
}

/**
 * Export to JSON format
 */
function exportJSON(tokens) {
  return JSON.stringify(tokens, null, 2);
}

/**
 * Export to SCSS variables
 */
function exportSCSS(tokens) {
  let scss = '// Design Tokens - Auto-generated\n// Do not edit directly\n\n';
  
  scss += '// Colors - Primary\n';
  for (const [shade, value] of Object.entries(tokens.colors.primary)) {
    scss += `$color-primary-${shade}: ${value};\n`;
  }
  
  scss += '\n// Colors - Secondary\n';
  for (const [shade, value] of Object.entries(tokens.colors.secondary)) {
    scss += `$color-secondary-${shade}: ${value};\n`;
  }
  
  scss += '\n// Colors - Neutral\n';
  for (const [shade, value] of Object.entries(tokens.colors.neutral)) {
    scss += `$color-neutral-${shade}: ${value};\n`;
  }
  
  scss += '\n// Colors - Semantic\n';
  for (const [name, value] of Object.entries(tokens.colors.semantic)) {
    scss += `$color-${name}: ${value};\n`;
  }
  
  scss += '\n// Spacing\n';
  for (const [size, value] of Object.entries(tokens.spacing)) {
    scss += `$spacing-${size}: ${value};\n`;
  }
  
  scss += '\n// Typography\n';
  for (const [name, value] of Object.entries(tokens.typography.fontFamily)) {
    scss += `$font-family-${name}: ${value};\n`;
  }
  for (const [size, value] of Object.entries(tokens.typography.fontSize)) {
    scss += `$font-size-${size}: ${value};\n`;
  }
  
  scss += '\n// Border Radius\n';
  for (const [name, value] of Object.entries(tokens.borderRadius)) {
    scss += `$radius-${name}: ${value};\n`;
  }
  
  scss += '\n// Shadows\n';
  for (const [name, value] of Object.entries(tokens.shadows)) {
    scss += `$shadow-${name}: ${value};\n`;
  }
  
  return scss;
}

/**
 * Export to CSS custom properties (standalone file)
 */
function exportCSS(tokens) {
  let css = '/* Design Tokens - Auto-generated */\n/* Do not edit directly */\n\n:root {\n';
  
  css += '  /* Colors - Primary */\n';
  for (const [shade, value] of Object.entries(tokens.colors.primary)) {
    css += `  --color-primary-${shade}: ${value};\n`;
  }
  
  css += '\n  /* Colors - Secondary */\n';
  for (const [shade, value] of Object.entries(tokens.colors.secondary)) {
    css += `  --color-secondary-${shade}: ${value};\n`;
  }
  
  css += '\n  /* Colors - Neutral */\n';
  for (const [shade, value] of Object.entries(tokens.colors.neutral)) {
    css += `  --color-neutral-${shade}: ${value};\n`;
  }
  
  css += '\n  /* Colors - Semantic */\n';
  for (const [name, value] of Object.entries(tokens.colors.semantic)) {
    css += `  --color-${name}: ${value};\n`;
  }
  
  css += '\n  /* Spacing */\n';
  for (const [size, value] of Object.entries(tokens.spacing)) {
    css += `  --spacing-${size}: ${value};\n`;
  }
  
  css += '\n  /* Typography */\n';
  for (const [name, value] of Object.entries(tokens.typography.fontFamily)) {
    css += `  --font-family-${name}: ${value};\n`;
  }
  for (const [size, value] of Object.entries(tokens.typography.fontSize)) {
    css += `  --font-size-${size}: ${value};\n`;
  }
  
  css += '\n  /* Border Radius */\n';
  for (const [name, value] of Object.entries(tokens.borderRadius)) {
    css += `  --radius-${name}: ${value};\n`;
  }
  
  css += '\n  /* Shadows */\n';
  for (const [name, value] of Object.entries(tokens.shadows)) {
    css += `  --shadow-${name}: ${value};\n`;
  }
  
  css += '}\n';
  return css;
}

/**
 * Export to Figma Tokens format
 */
function exportFigma(tokens) {
  const figmaTokens = {
    colors: {
      primary: {},
      secondary: {},
      neutral: {},
      semantic: {}
    },
    spacing: {},
    typography: {},
    borderRadius: {},
    boxShadow: {}
  };
  
  // Colors
  for (const [shade, value] of Object.entries(tokens.colors.primary)) {
    figmaTokens.colors.primary[shade] = { value, type: 'color' };
  }
  for (const [shade, value] of Object.entries(tokens.colors.secondary)) {
    figmaTokens.colors.secondary[shade] = { value, type: 'color' };
  }
  for (const [shade, value] of Object.entries(tokens.colors.neutral)) {
    figmaTokens.colors.neutral[shade] = { value, type: 'color' };
  }
  for (const [name, value] of Object.entries(tokens.colors.semantic)) {
    figmaTokens.colors.semantic[name] = { value, type: 'color' };
  }
  
  // Spacing
  for (const [size, value] of Object.entries(tokens.spacing)) {
    figmaTokens.spacing[size] = { value, type: 'spacing' };
  }
  
  // Typography
  figmaTokens.typography = {
    fontFamily: {},
    fontSize: {}
  };
  for (const [name, value] of Object.entries(tokens.typography.fontFamily)) {
    figmaTokens.typography.fontFamily[name] = { value, type: 'fontFamilies' };
  }
  for (const [size, value] of Object.entries(tokens.typography.fontSize)) {
    figmaTokens.typography.fontSize[size] = { value, type: 'fontSizes' };
  }
  
  // Border Radius
  for (const [name, value] of Object.entries(tokens.borderRadius)) {
    figmaTokens.borderRadius[name] = { value, type: 'borderRadius' };
  }
  
  // Shadows
  for (const [name, value] of Object.entries(tokens.shadows)) {
    figmaTokens.boxShadow[name] = { value, type: 'boxShadow' };
  }
  
  return JSON.stringify(figmaTokens, null, 2);
}

/**
 * Export to Tailwind config extension
 */
function exportTailwind(tokens) {
  const twConfig = {
    colors: {},
    spacing: {},
    fontFamily: {},
    fontSize: {},
    borderRadius: {},
    boxShadow: {}
  };
  
  // Colors
  twConfig.colors.primary = tokens.colors.primary;
  twConfig.colors.secondary = tokens.colors.secondary;
  twConfig.colors.neutral = tokens.colors.neutral;
  for (const [name, value] of Object.entries(tokens.colors.semantic)) {
    twConfig.colors[name] = value;
  }
  
  // Spacing
  twConfig.spacing = tokens.spacing;
  
  // Typography
  for (const [name, value] of Object.entries(tokens.typography.fontFamily)) {
    // Remove quotes for Tailwind
    twConfig.fontFamily[name] = value.replace(/['"]/g, '').split(',').map(f => f.trim());
  }
  twConfig.fontSize = tokens.typography.fontSize;
  
  // Border Radius
  twConfig.borderRadius = tokens.borderRadius;
  
  // Shadows
  twConfig.boxShadow = tokens.shadows;
  
  return `// Tailwind Config Extension - Auto-generated
// Merge this into your tailwind.config.ts

module.exports = {
  theme: {
    extend: ${JSON.stringify(twConfig, null, 6).replace(/"([^"]+)":/g, '$1:')}
  }
};
`;
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
  
  console.log(`\n${color('Design Token Exporter', colors.bold, colors.cyan)}\n`);
  
  // Parse tokens
  console.log('Parsing tokens.css...');
  const tokens = await parseTokensCSS();
  
  // Prepare output directory
  const outputDir = options.output 
    ? path.join(rootDir, options.output)
    : path.join(rootDir, 'dist/tokens');
  await fs.mkdir(outputDir, { recursive: true });
  
  const formats = options.format === 'all' 
    ? ['json', 'scss', 'css', 'figma', 'tailwind']
    : [options.format];
  
  // Export each format
  for (const format of formats) {
    let content, filename;
    
    switch (format) {
      case 'json':
        content = exportJSON(tokens);
        filename = 'tokens.json';
        break;
      case 'scss':
        content = exportSCSS(tokens);
        filename = '_tokens.scss';
        break;
      case 'css':
        content = exportCSS(tokens);
        filename = 'tokens.css';
        break;
      case 'figma':
        content = exportFigma(tokens);
        filename = 'figma-tokens.json';
        break;
      case 'tailwind':
        content = exportTailwind(tokens);
        filename = 'tailwind-tokens.js';
        break;
      default:
        console.log(`${color('⚠', colors.yellow)} Unknown format: ${format}`);
        continue;
    }
    
    const outputPath = path.join(outputDir, filename);
    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`${color('✓', colors.green)} ${filename}`);
  }
  
  console.log(`\n${color('Output:', colors.bold)} ${path.relative(rootDir, outputDir)}/\n`);
  
  // Summary
  console.log(`${color('Token Summary:', colors.bold)}`);
  console.log(`  Colors:     ${Object.keys(tokens.colors.primary).length + Object.keys(tokens.colors.secondary).length + Object.keys(tokens.colors.neutral).length} shades`);
  console.log(`  Spacing:    ${Object.keys(tokens.spacing).length} values`);
  console.log(`  Typography: ${Object.keys(tokens.typography.fontSize).length} sizes`);
  console.log(`  Radius:     ${Object.keys(tokens.borderRadius).length} values`);
  console.log(`  Shadows:    ${Object.keys(tokens.shadows).length} values`);
  console.log('');
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
