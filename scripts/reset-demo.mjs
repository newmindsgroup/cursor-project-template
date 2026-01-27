#!/usr/bin/env node

/**
 * Demo Reset Script
 * Clear demo data and restore clean state
 * 
 * Usage:
 *   npm run demo:reset
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

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

async function restoreBackup() {
  const settingsPath = path.join(rootDir, 'project-settings.json');
  const backupPath = path.join(rootDir, 'project-settings.backup.json');
  
  try {
    const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
    
    if (backupExists) {
      await fs.copyFile(backupPath, settingsPath);
      await fs.unlink(backupPath);
      console.log(c('  ✓ Restored project-settings.json from backup', colors.green));
    } else {
      // Create empty settings
      const emptySettings = {
        project: {},
        ai: {
          apiKeys: {},
          preferences: {},
          settings: {}
        }
      };
      await fs.writeFile(settingsPath, JSON.stringify(emptySettings, null, 2));
      console.log(c('  ✓ Reset project-settings.json to defaults', colors.green));
    }
  } catch (error) {
    console.log(c(`  ⚠ Could not restore settings: ${error.message}`, colors.yellow));
  }
}

async function clearUploads() {
  const uploadsDir = path.join(rootDir, 'business-context/uploads');
  
  try {
    const exists = await fs.access(uploadsDir).then(() => true).catch(() => false);
    
    if (exists) {
      const files = await fs.readdir(uploadsDir);
      for (const file of files) {
        if (file !== '.gitkeep') {
          await fs.unlink(path.join(uploadsDir, file));
        }
      }
      console.log(c(`  ✓ Cleared ${files.length - 1} uploaded file(s)`, colors.green));
    }
  } catch (error) {
    console.log(c(`  ⚠ Could not clear uploads: ${error.message}`, colors.yellow));
  }
}

async function clearExtractedContext() {
  const extractedPath = path.join(rootDir, 'business-context/extracted-context.json');
  
  try {
    await fs.unlink(extractedPath);
    console.log(c('  ✓ Cleared extracted-context.json', colors.green));
  } catch {
    // File doesn't exist, that's fine
  }
}

async function clearWizardProgress() {
  // Wizard progress is stored in localStorage, which we can't clear from Node
  // But we can notify the user
  console.log(c('  ℹ Note: Clear browser localStorage to reset wizard progress', colors.dim));
}

async function main() {
  console.log('\n' + c('═'.repeat(50), colors.cyan));
  console.log(c('  Demo Reset', colors.bold, colors.cyan));
  console.log(c('═'.repeat(50), colors.cyan));
  console.log('');
  
  console.log(c('  Resetting demo environment...', colors.dim));
  console.log('');
  
  await restoreBackup();
  await clearUploads();
  await clearExtractedContext();
  await clearWizardProgress();
  
  console.log('');
  console.log(c('═'.repeat(50), colors.green));
  console.log(c('  Demo reset complete!', colors.bold, colors.green));
  console.log(c('═'.repeat(50), colors.green));
  console.log('');
  console.log(c('  You can now start fresh with `npm start`', colors.dim));
  console.log('');
}

main().catch((error) => {
  console.error(c(`\nError: ${error.message}`, colors.red));
  process.exit(1);
});
