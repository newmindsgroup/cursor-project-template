#!/usr/bin/env node

/**
 * Vercel Project Setup
 * Link project to Vercel for deployment
 * 
 * Usage:
 *   npm run setup:vercel
 *   node scripts/setup-vercel.mjs
 */

import { execSync } from 'child_process';
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
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function c(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

function log(message, type = 'info') {
  const icons = {
    info: c('ℹ', colors.blue),
    success: c('✓', colors.green),
    warning: c('⚠', colors.yellow),
    error: c('✗', colors.red),
    step: c('→', colors.cyan)
  };
  console.log(`  ${icons[type]} ${message}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
${c('Vercel Project Setup', colors.bold, colors.cyan)}

Link your project to Vercel for automatic deployments.

${c('Usage:', colors.bold)}
  npm run setup:vercel
  node scripts/setup-vercel.mjs

${c('Prerequisites:', colors.bold)}
  • Vercel CLI installed: npm i -g vercel
  • Authenticated with Vercel: vercel login
  • GitHub repository set up (recommended)

${c('What this does:', colors.bold)}
  1. Links project to Vercel
  2. Configures build settings
  3. Sets up automatic deployments from GitHub
  4. Saves project info to settings
`);
}

function execSilent(command) {
  try {
    return execSync(command, { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

async function loadSettings() {
  const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
  
  try {
    return JSON.parse(await fs.readFile(localSettingsPath, 'utf-8'));
  } catch {
    return { deployment: {} };
  }
}

async function saveLocalSettings(settings) {
  const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
  
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(localSettingsPath, 'utf-8'));
  } catch {}
  
  const merged = { ...existing, deployment: { ...existing.deployment, ...settings.deployment } };
  await fs.writeFile(localSettingsPath, JSON.stringify(merged, null, 2), 'utf-8');
}

async function main() {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log('\n' + c('═'.repeat(50), colors.cyan));
  console.log(c('  Vercel Project Setup', colors.bold, colors.cyan));
  console.log(c('═'.repeat(50), colors.cyan) + '\n');
  
  try {
    // Check Vercel CLI
    log('Checking Vercel CLI...', 'step');
    const vercelVersion = execSilent('vercel --version');
    if (!vercelVersion) {
      throw new Error('Vercel CLI is not installed. Install with: npm i -g vercel');
    }
    log(`Vercel CLI installed (${vercelVersion})`, 'success');
    
    // Check Vercel auth
    log('Checking Vercel authentication...', 'step');
    const vercelWhoami = execSilent('vercel whoami 2>&1');
    if (!vercelWhoami || vercelWhoami.includes('not logged in')) {
      throw new Error('Vercel CLI not authenticated. Run: vercel login');
    }
    log(`Logged in as: ${vercelWhoami}`, 'success');
    
    // Check if already linked
    const vercelJsonPath = path.join(rootDir, '.vercel/project.json');
    let vercelProject = null;
    
    try {
      vercelProject = JSON.parse(await fs.readFile(vercelJsonPath, 'utf-8'));
      log('Project already linked to Vercel', 'success');
    } catch {
      // Not linked yet
    }
    
    if (!vercelProject) {
      // Link to Vercel
      log('Linking project to Vercel...', 'step');
      console.log('');
      
      try {
        execSync('vercel link --yes', { 
          cwd: rootDir, 
          stdio: 'inherit'
        });
        
        // Read the created project.json
        try {
          vercelProject = JSON.parse(await fs.readFile(vercelJsonPath, 'utf-8'));
        } catch {}
        
        log('Project linked successfully', 'success');
      } catch (error) {
        throw new Error('Failed to link project to Vercel');
      }
    }
    
    // Check for GitHub integration
    const settings = await loadSettings();
    const githubRepo = settings.deployment?.github?.repo;
    
    if (githubRepo) {
      log(`GitHub repository: ${githubRepo}`, 'info');
      log('Vercel will auto-deploy on push to GitHub', 'info');
    } else {
      log('GitHub not configured - run npm run setup:github first', 'warning');
    }
    
    // Get project URL
    let projectUrl = '';
    const projectName = path.basename(rootDir).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Try to get the actual URL
    try {
      const inspectResult = execSilent('vercel inspect --json 2>/dev/null');
      if (inspectResult) {
        const inspectData = JSON.parse(inspectResult);
        projectUrl = inspectData.alias?.[0] || `https://${projectName}.vercel.app`;
      }
    } catch {
      projectUrl = `https://${projectName}.vercel.app`;
    }
    
    // Save settings
    await saveLocalSettings({
      deployment: {
        vercel: {
          projectId: vercelProject?.projectId,
          orgId: vercelProject?.orgId,
          url: projectUrl,
          linkedAt: new Date().toISOString()
        }
      }
    });
    
    console.log('');
    console.log(c('═'.repeat(50), colors.green));
    console.log(c('  Vercel Setup Complete!', colors.bold, colors.green));
    console.log(c('═'.repeat(50), colors.green));
    console.log('');
    console.log(`  ${c('Project URL:', colors.bold)} ${c(projectUrl, colors.cyan)}`);
    if (vercelProject?.projectId) {
      console.log(`  ${c('Project ID:', colors.bold)} ${vercelProject.projectId}`);
    }
    console.log('');
    console.log(c('  Next steps:', colors.dim));
    console.log(c('    • Run `npm run deploy` to deploy your project', colors.dim));
    console.log(c('    • Push to GitHub to trigger automatic deploys', colors.dim));
    console.log('');
    
  } catch (error) {
    console.log('');
    log(error.message, 'error');
    console.log('');
    process.exit(1);
  }
}

main();
