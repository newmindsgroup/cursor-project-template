#!/usr/bin/env node

/**
 * Demo Setup Script
 * Initialize demo environment with sample business data
 * 
 * Usage:
 *   npm run demo                          # Interactive selector
 *   npm run demo:wellness                 # Serenity Wellness Center
 *   npm run demo:law                      # Barrett & Associates Law Firm
 *   npm run demo:consulting               # Summit Business Consulting
 *   npm run demo:realestate               # Keystone Property Group
 *   npm run demo:dental                   # Bright Smile Dental
 *   npm run demo:construction             # Cornerstone Construction
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { createInterface } from 'readline';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const demoDataDir = path.join(__dirname, 'demo-data');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m'
};

function c(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

const demoBusinesses = {
  'wellness-center': {
    name: 'Serenity Wellness Center',
    icon: '🧘',
    description: 'Health & wellness spa with multiple services'
  },
  'law-firm': {
    name: 'Barrett & Associates Law Firm',
    icon: '⚖️',
    description: 'Full-service law firm specializing in business law'
  },
  'consulting': {
    name: 'Summit Business Consulting',
    icon: '📊',
    description: 'Management consulting for growing companies'
  },
  'real-estate': {
    name: 'Keystone Property Group',
    icon: '🏠',
    description: 'Residential & commercial real estate'
  },
  'dental': {
    name: 'Bright Smile Dental',
    icon: '🦷',
    description: 'Family & cosmetic dentistry practice'
  },
  'construction': {
    name: 'Cornerstone Construction',
    icon: '🏗️',
    description: 'Commercial construction & renovation'
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  let business = null;
  
  for (const arg of args) {
    if (arg.startsWith('--business=')) {
      business = arg.split('=')[1];
    }
  }
  
  return { business };
}

async function showBusinessSelector(rl) {
  console.clear();
  console.log('\n' + c('═'.repeat(60), colors.cyan));
  console.log(c('  🎬 DEMO MODE - Choose a Sample Business', colors.bold, colors.cyan));
  console.log(c('═'.repeat(60), colors.cyan));
  console.log('');
  console.log(c('  Select a business type to auto-fill the entire wizard:', colors.dim));
  console.log('');
  
  const entries = Object.entries(demoBusinesses);
  entries.forEach(([key, info], index) => {
    console.log(`  ${c(`[${index + 1}]`, colors.green, colors.bold)} ${info.icon} ${c(info.name, colors.white, colors.bold)}`);
    console.log(`      ${c(info.description, colors.dim)}`);
    console.log('');
  });
  
  console.log(c('─'.repeat(60), colors.dim));
  
  return new Promise((resolve) => {
    rl.question(c('\n  Enter choice [1-6]: ', colors.bold), (answer) => {
      const index = parseInt(answer, 10) - 1;
      const keys = Object.keys(demoBusinesses);
      if (index >= 0 && index < keys.length) {
        resolve(keys[index]);
      } else {
        resolve('wellness-center'); // Default
      }
    });
  });
}

async function backupCurrentSettings() {
  const settingsPath = path.join(rootDir, 'project-settings.json');
  const backupPath = path.join(rootDir, 'project-settings.backup.json');
  
  try {
    const exists = await fs.access(settingsPath).then(() => true).catch(() => false);
    if (exists) {
      await fs.copyFile(settingsPath, backupPath);
      console.log(c('  ✓ Backed up current project-settings.json', colors.green));
    }
  } catch (error) {
    // Ignore - no existing settings
  }
}

async function copyDemoData(businessType) {
  const sourceDir = path.join(demoDataDir, businessType);
  
  // Check if demo data exists
  try {
    await fs.access(sourceDir);
  } catch {
    console.log(c(`  ⚠ Demo data not found for ${businessType}, using defaults`, colors.yellow));
    return;
  }
  
  // Copy project settings
  const settingsSource = path.join(sourceDir, 'project-settings.demo.json');
  const settingsDest = path.join(rootDir, 'project-settings.json');
  
  try {
    await fs.copyFile(settingsSource, settingsDest);
    console.log(c('  ✓ Copied project settings', colors.green));
  } catch {
    // Settings file might not exist
  }
  
  // Copy business context
  const contextSource = path.join(sourceDir, 'business-context');
  const contextDest = path.join(rootDir, 'business-context/uploads');
  
  try {
    await fs.mkdir(contextDest, { recursive: true });
    const files = await fs.readdir(contextSource);
    for (const file of files) {
      await fs.copyFile(
        path.join(contextSource, file),
        path.join(contextDest, file)
      );
    }
    console.log(c(`  ✓ Copied ${files.length} business context file(s)`, colors.green));
  } catch {
    // No context files
  }
  
  // Copy content files
  const contentSource = path.join(sourceDir, 'content');
  const contentDest = path.join(rootDir, 'src/content/en');
  
  try {
    await fs.mkdir(contentDest, { recursive: true });
    const files = await fs.readdir(contentSource);
    for (const file of files) {
      await fs.copyFile(
        path.join(contentSource, file),
        path.join(contentDest, file)
      );
    }
    console.log(c(`  ✓ Copied ${files.length} content file(s)`, colors.green));
  } catch {
    // No content files
  }
  
  // Copy data files (personas, theme, etc.)
  const dataSource = path.join(sourceDir, 'data');
  const dataDest = path.join(rootDir, 'src/data');
  
  try {
    const files = await fs.readdir(dataSource);
    for (const file of files) {
      // Remove .demo suffix when copying
      const destName = file.replace('.demo.json', '.json');
      await fs.copyFile(
        path.join(dataSource, file),
        path.join(dataDest, destName)
      );
    }
    console.log(c(`  ✓ Copied ${files.length} data file(s)`, colors.green));
  } catch {
    // No data files
  }
}

async function openWizard(businessType) {
  const wizardUrl = `http://localhost:5173/pages/wizard/?demo=true&business=${businessType}`;
  
  console.log(c(`\n  Opening wizard at: ${wizardUrl}`, colors.cyan));
  console.log(c('  Press Ctrl+C to stop the server when done.\n', colors.dim));
  
  // Start the wizard server and open browser
  return new Promise((resolve) => {
    const proc = spawn('npm', ['run', 'wizard'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', resolve);
  });
}

async function main() {
  const args = parseArgs();
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  try {
    let businessType = args.business;
    
    // If no business specified, show selector
    if (!businessType || !demoBusinesses[businessType]) {
      businessType = await showBusinessSelector(rl);
    }
    
    const business = demoBusinesses[businessType];
    
    console.log('\n' + c('═'.repeat(60), colors.green));
    console.log(c(`  Setting up: ${business.icon} ${business.name}`, colors.bold, colors.green));
    console.log(c('═'.repeat(60), colors.green));
    console.log('');
    
    // Backup current settings
    await backupCurrentSettings();
    
    // Copy demo data
    await copyDemoData(businessType);
    
    console.log('');
    console.log(c('  Demo environment ready!', colors.green, colors.bold));
    
    rl.close();
    
    // Open wizard
    await openWizard(businessType);
    
  } catch (error) {
    console.error(c(`\n  Error: ${error.message}`, colors.red));
    rl.close();
    process.exit(1);
  }
}

main();
