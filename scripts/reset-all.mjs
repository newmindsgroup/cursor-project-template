#!/usr/bin/env node

/**
 * Full Reset Script
 * Restores the template to a clean state ready for a new project
 * 
 * Usage:
 *   npm run reset:all
 *   npm run reset:all -- --confirm    # Skip confirmation prompt
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function c(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    confirm: args.includes('--confirm') || args.includes('-y'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
${c('Full Reset Script', colors.bold, colors.cyan)}

Restores the template to a clean state ready for a new project.

${c('Usage:', colors.bold)}
  npm run reset:all [options]

${c('Options:', colors.bold)}
  --confirm, -y    Skip confirmation prompt
  --help, -h       Show this help message

${c('What gets reset:', colors.bold)}
  - Content files (src/content/) → empty templates
  - Data files (site-config, personas, navigation) → clean state
  - Handoff exports (_handoff/content/, _handoff/exports/) → cleared
  - Business context uploads → cleared
  - Project settings → defaults
  - Page index → empty

${c('What stays intact:', colors.bold)}
  - Documentation (docs/)
  - Source components and sections (src/components/, src/sections/)
  - Scripts (scripts/)
  - Configuration files (package.json, tailwind.config.ts, etc.)
`);
}

async function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Clean content files
async function resetContentFiles() {
  const contentDir = path.join(rootDir, 'src/content');
  const languages = ['en', 'es'];
  const pages = ['home', 'about', 'services', 'contact'];
  
  let resetCount = 0;
  
  for (const lang of languages) {
    for (const page of pages) {
      const filePath = path.join(contentDir, lang, `${page}.json`);
      const template = createContentTemplate(page, lang);
      
      try {
        await fs.writeFile(filePath, JSON.stringify(template, null, 2));
        resetCount++;
      } catch (error) {
        console.log(c(`  ⚠ Could not reset ${lang}/${page}.json: ${error.message}`, colors.yellow));
      }
    }
  }
  
  console.log(c(`  ✓ Reset ${resetCount} content files to empty templates`, colors.green));
}

function createContentTemplate(page, lang) {
  const usage = lang === 'en' 
    ? `This file contains content for the ${page} page. Run 'npm run wizard' to generate content using AI with StoryBrand methodology.`
    : `Este archivo contiene contenido para la página de ${page}. Ejecute 'npm run wizard' para generar contenido usando IA con la metodología StoryBrand.`;
  
  return {
    "$schema": "../schema/page-content.schema.json",
    "_usage": usage,
    "meta": {
      "title": "",
      "description": "",
      "language": lang,
      "status": "draft",
      "lastUpdated": ""
    },
    "hero": {
      "headline": "",
      "subheadline": ""
    }
  };
}

// Clean data files
async function resetDataFiles() {
  const dataDir = path.join(rootDir, 'src/data');
  
  // Reset site-config.json
  const siteConfig = {
    "_usage": "This file contains site-wide configuration. Update these values when setting up your project, or use 'npm run wizard' to configure automatically.",
    "siteName": "",
    "tagline": "",
    "description": "",
    "navigation": [
      { "label": "Home", "href": "/", "active": true },
      { "label": "About", "href": "/about.html" },
      { "label": "Services", "href": "/services.html" },
      { "label": "Contact", "href": "/contact.html" }
    ],
    "footer": {
      "copyright": "",
      "sections": [],
      "social": []
    }
  };
  
  await fs.writeFile(path.join(dataDir, 'site-config.json'), JSON.stringify(siteConfig, null, 2));
  
  // Reset personas.json
  const personas = {
    "$schema": "./schemas/personas.schema.json",
    "_usage": "This file contains user personas. Run 'npm run wizard' to generate personas using AI based on your business context.",
    "version": "1.0.0",
    "lastUpdated": "",
    "personas": [],
    "template": {
      "_note": "Use this template structure when generating new personas",
      "id": "persona-template",
      "name": "[Role/Title]",
      "shortName": "[First Name]",
      "image": "",
      "demographics": {},
      "jtbd": "When [situation], I want to [action], so I can [outcome].",
      "goals": [],
      "frustrations": [],
      "behaviors": [],
      "quote": "",
      "scenarios": []
    }
  };
  
  await fs.writeFile(path.join(dataDir, 'personas.json'), JSON.stringify(personas, null, 2));
  
  console.log(c('  ✓ Reset data files to clean state', colors.green));
}

// Clean handoff exports
async function clearHandoffExports() {
  const contentDir = path.join(rootDir, '_handoff/content');
  const exportsDir = path.join(rootDir, '_handoff/exports');
  
  let clearedCount = 0;
  
  // Clear content directory (keep structure)
  for (const subdir of ['en', 'es', '']) {
    const dir = subdir ? path.join(contentDir, subdir) : contentDir;
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (file !== '.gitkeep' && !file.startsWith('.')) {
          const stat = await fs.stat(path.join(dir, file));
          if (stat.isFile()) {
            await fs.unlink(path.join(dir, file));
            clearedCount++;
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }
  
  // Clear exports directory
  try {
    const files = await fs.readdir(exportsDir);
    for (const file of files) {
      if (file !== '.gitkeep' && !file.startsWith('.')) {
        await fs.unlink(path.join(exportsDir, file));
        clearedCount++;
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  // Reset page-index.json
  const pageIndex = {
    "_usage": "This file is auto-generated when running 'npm run handoff:export'. It contains the page structure and section mapping for Elementor implementation.",
    "generated": "",
    "pages": []
  };
  
  await fs.writeFile(path.join(rootDir, '_handoff/page-index.json'), JSON.stringify(pageIndex, null, 2));
  
  // Create .gitkeep files
  for (const dir of [path.join(contentDir, 'en'), path.join(contentDir, 'es'), exportsDir]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, '.gitkeep'), '');
    } catch {
      // Ignore errors
    }
  }
  
  console.log(c(`  ✓ Cleared ${clearedCount} handoff export files`, colors.green));
}

// Clear business context
async function clearBusinessContext() {
  const uploadsDir = path.join(rootDir, 'business-context/uploads');
  const extractedPath = path.join(rootDir, 'business-context/extracted-context.json');
  
  let clearedCount = 0;
  
  // Clear uploads
  try {
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      if (file !== '.gitkeep') {
        await fs.unlink(path.join(uploadsDir, file));
        clearedCount++;
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  // Remove extracted context
  try {
    await fs.unlink(extractedPath);
    clearedCount++;
  } catch {
    // File doesn't exist
  }
  
  console.log(c(`  ✓ Cleared ${clearedCount} business context files`, colors.green));
}

// Reset project settings
async function resetProjectSettings() {
  const settingsPath = path.join(rootDir, 'project-settings.json');
  
  const emptySettings = {
    "_usage": "Configure your project settings here, or use 'npm run wizard' to set them interactively.",
    "project": {
      "name": "",
      "client": "",
      "description": "",
      "siteUrl": ""
    },
    "ai": {
      "apiKeys": {},
      "preferences": {
        "provider": "auto",
        "tier": "standard"
      }
    }
  };
  
  await fs.writeFile(settingsPath, JSON.stringify(emptySettings, null, 2));
  
  // Remove local settings if exists
  const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
  try {
    await fs.unlink(localSettingsPath);
  } catch {
    // File doesn't exist
  }
  
  // Remove backup if exists
  const backupPath = path.join(rootDir, 'project-settings.backup.json');
  try {
    await fs.unlink(backupPath);
  } catch {
    // File doesn't exist
  }
  
  console.log(c('  ✓ Reset project settings to defaults', colors.green));
}

// Clear generated assets
async function clearGeneratedAssets() {
  const assetsDir = path.join(rootDir, 'src/assets/generated');
  
  let clearedCount = 0;
  
  try {
    const files = await fs.readdir(assetsDir);
    for (const file of files) {
      if (file !== '.gitkeep') {
        await fs.unlink(path.join(assetsDir, file));
        clearedCount++;
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  console.log(c(`  ✓ Cleared ${clearedCount} generated asset files`, colors.green));
}

async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log('\n' + c('═'.repeat(50), colors.cyan));
  console.log(c('  Full Template Reset', colors.bold, colors.cyan));
  console.log(c('═'.repeat(50), colors.cyan));
  console.log('');
  
  if (!options.confirm) {
    console.log(c('  This will reset the template to a clean state.', colors.yellow));
    console.log(c('  All content, settings, and exports will be cleared.', colors.yellow));
    console.log('');
    
    const answer = await prompt('  Continue? (y/N): ');
    
    if (answer !== 'y' && answer !== 'yes') {
      console.log(c('\n  Reset cancelled.\n', colors.dim));
      process.exit(0);
    }
  }
  
  console.log('');
  console.log(c('  Resetting template...', colors.dim));
  console.log('');
  
  await resetContentFiles();
  await resetDataFiles();
  await clearHandoffExports();
  await clearBusinessContext();
  await resetProjectSettings();
  await clearGeneratedAssets();
  
  console.log('');
  console.log(c('═'.repeat(50), colors.green));
  console.log(c('  Template reset complete!', colors.bold, colors.green));
  console.log(c('═'.repeat(50), colors.green));
  console.log('');
  console.log(c('  The template is now ready for a new project.', colors.dim));
  console.log(c('  Run `npm run wizard` to start your project setup.', colors.dim));
  console.log('');
  console.log(c('  Note: Clear browser localStorage if you were using the wizard.', colors.dim));
  console.log('');
}

main().catch((error) => {
  console.error(c(`\nError: ${error.message}`, colors.red));
  process.exit(1);
});
