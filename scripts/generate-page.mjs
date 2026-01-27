#!/usr/bin/env node

/**
 * Page Generator Script
 * Quickly generate new pages from blueprints or custom section lists
 * 
 * Usage:
 *   node scripts/generate-page.mjs <page-name> [--blueprint <name>] [--sections Section1,Section2,...]
 * 
 * Examples:
 *   node scripts/generate-page.mjs pricing --blueprint pricing
 *   node scripts/generate-page.mjs landing --sections Header,Hero,Features,CTA,Footer
 *   node scripts/generate-page.mjs team --blueprint about
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
  const result = {
    pageName: null,
    blueprint: null,
    sections: null,
    title: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--blueprint' || arg === '-b') {
      result.blueprint = args[++i];
    } else if (arg === '--sections' || arg === '-s') {
      result.sections = args[++i]?.split(',').map(s => s.trim());
    } else if (arg === '--title' || arg === '-t') {
      result.title = args[++i];
    } else if (!arg.startsWith('-')) {
      result.pageName = arg;
    }
  }

  return result;
}

// Show help message
function showHelp() {
  console.log(`
Page Generator - Create new pages from blueprints or custom section lists

Usage:
  node scripts/generate-page.mjs <page-name> [options]

Options:
  --blueprint, -b <name>    Use a predefined blueprint (homepage, about, services, etc.)
  --sections, -s <list>     Comma-separated list of sections
  --title, -t <title>       Page title (defaults to formatted page name)
  --help, -h                Show this help message

Available Blueprints:
  homepage        Main landing page with hero, features, social proof
  about           Company story, team, values, timeline
  services        Service offerings with process and FAQ
  contact         Contact form with info
  pricing         Pricing plans with comparison
  portfolio       Work showcase with filtering
  blog            Blog listing page
  landing         High-conversion landing page
  minimal         Simple page structure
  coming-soon     Pre-launch with newsletter

Examples:
  node scripts/generate-page.mjs pricing --blueprint pricing
  node scripts/generate-page.mjs team --blueprint about --title "Our Team"
  node scripts/generate-page.mjs custom --sections Header,Hero,Features,CTA,Footer
`);
}

// Load blueprints
async function loadBlueprints() {
  const blueprintsPath = path.join(rootDir, 'src/data/page-blueprints.json');
  const content = await fs.readFile(blueprintsPath, 'utf-8');
  return JSON.parse(content);
}

// Check if section file exists
async function sectionExists(sectionName) {
  const sectionPath = path.join(rootDir, `src/sections/${sectionName}.html`);
  try {
    await fs.access(sectionPath);
    return true;
  } catch {
    return false;
  }
}

// Format page name to title
function formatTitle(pageName) {
  return pageName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate page HTML
function generatePageHTML(pageName, title, sections) {
  const sectionDivs = sections
    .map(section => `    <div id="${section.toLowerCase()}" class="section-container"></div>`)
    .join('\n');

  const sectionLoads = sections
    .map(section => `      loadSection('${section.toLowerCase()}', '${section}.html');`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | Prototype</title>
    <meta name="description" content="${title} page for the website prototype" />
    <link rel="stylesheet" href="../styles/tokens.css" />
    <link rel="stylesheet" href="../styles/base.css" />
    <link rel="stylesheet" href="../styles/wireframe.css" />
  </head>
  <body>
    <main>
${sectionDivs}
    </main>

    <script type="module" src="../scripts/main.ts"></script>
    <script type="module" src="../scripts/animations.ts"></script>
    <script type="module" src="../scripts/overlay.ts"></script>
    <script type="module" src="../scripts/wireframe.ts"></script>
    <script type="module">
      async function loadSection(sectionId, sectionFile) {
        try {
          const response = await fetch('../sections/' + sectionFile);
          if (response.ok) {
            const html = await response.text();
            document.getElementById(sectionId).innerHTML = html;
          }
        } catch (error) {
          console.error('Failed to load section:', sectionId, error);
        }
      }

      // Load all sections
${sectionLoads}
    </script>
  </body>
</html>
`;
}

// Update vite.config.ts to include new page
async function updateViteConfig(pageName) {
  const viteConfigPath = path.join(rootDir, 'vite.config.ts');
  let config = await fs.readFile(viteConfigPath, 'utf-8');
  
  // Check if page already exists
  if (config.includes(`${pageName}:`)) {
    console.log(`  Page "${pageName}" already in vite.config.ts`);
    return false;
  }
  
  // Find the input object and add new entry
  const inputMatch = config.match(/(input:\s*\{[\s\S]*?)(},\s*\n\s*},)/);
  if (inputMatch) {
    const newEntry = `        ${pageName}: resolve(__dirname, 'src/pages/${pageName}.html'),\n      `;
    config = config.replace(inputMatch[0], inputMatch[1] + newEntry + inputMatch[2]);
    await fs.writeFile(viteConfigPath, config, 'utf-8');
    return true;
  }
  
  return false;
}

// Main function
async function main() {
  const args = parseArgs();

  if (args.help || !args.pageName) {
    showHelp();
    process.exit(args.help ? 0 : 1);
  }

  const pageName = args.pageName.toLowerCase();
  let sections = args.sections;

  // Load blueprint if specified
  if (args.blueprint) {
    const blueprints = await loadBlueprints();
    const blueprint = blueprints.blueprints[args.blueprint];
    
    if (!blueprint) {
      console.error(`❌ Blueprint "${args.blueprint}" not found.`);
      console.log('Available blueprints:', Object.keys(blueprints.blueprints).join(', '));
      process.exit(1);
    }
    
    sections = blueprint.sections;
    console.log(`📋 Using blueprint: ${blueprint.name}`);
  }

  if (!sections || sections.length === 0) {
    console.error('❌ No sections specified. Use --blueprint or --sections.');
    process.exit(1);
  }

  // Validate sections exist
  console.log('\n🔍 Validating sections...');
  const missingSections = [];
  for (const section of sections) {
    const exists = await sectionExists(section);
    if (!exists) {
      missingSections.push(section);
    }
  }

  if (missingSections.length > 0) {
    console.warn(`⚠️  Missing sections (will use placeholder): ${missingSections.join(', ')}`);
  }

  // Generate page
  const title = args.title || formatTitle(pageName);
  const pageHTML = generatePageHTML(pageName, title, sections);

  // Write page file
  const pagePath = path.join(rootDir, `src/pages/${pageName}.html`);
  
  // Check if page exists
  try {
    await fs.access(pagePath);
    console.log(`⚠️  Page "${pageName}.html" already exists. Overwriting...`);
  } catch {
    // Page doesn't exist, which is fine
  }

  await fs.writeFile(pagePath, pageHTML, 'utf-8');
  console.log(`✅ Created: src/pages/${pageName}.html`);

  // Update vite.config.ts
  const viteUpdated = await updateViteConfig(pageName);
  if (viteUpdated) {
    console.log(`✅ Added to vite.config.ts`);
  }

  console.log(`
📄 Page generated successfully!

   Title:    ${title}
   Sections: ${sections.join(' → ')}
   File:     src/pages/${pageName}.html

Next steps:
   1. Run \`npm run dev\` to preview
   2. Customize content in each section
   3. Add content JSON in src/content/en/${pageName}.json
`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
