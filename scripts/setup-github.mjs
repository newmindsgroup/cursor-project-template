#!/usr/bin/env node

/**
 * GitHub Repository Setup
 * Initialize and configure GitHub repository for the project
 * 
 * Usage:
 *   npm run setup:github
 *   node scripts/setup-github.mjs
 *   node scripts/setup-github.mjs --private (default)
 *   node scripts/setup-github.mjs --public
 */

import { execSync } from 'child_process';
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

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    public: args.includes('--public'),
    private: !args.includes('--public'), // Default to private
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
${c('GitHub Repository Setup', colors.bold, colors.cyan)}

Initialize and configure GitHub repository for your project.

${c('Usage:', colors.bold)}
  npm run setup:github
  node scripts/setup-github.mjs [options]

${c('Options:', colors.bold)}
  --private    Create private repository (default)
  --public     Create public repository
  --help, -h   Show this help message

${c('Prerequisites:', colors.bold)}
  • GitHub CLI (gh) installed: brew install gh
  • Authenticated with GitHub: gh auth login

${c('What this does:', colors.bold)}
  1. Initializes Git if not already initialized
  2. Creates a GitHub repository
  3. Sets up remote origin
  4. Pushes initial commit
  5. Saves repository info to project settings
`);
}

function execSilent(command) {
  try {
    return execSync(command, { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

async function exec(command) {
  try {
    return execSync(command, { cwd: rootDir, encoding: 'utf-8', stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Command failed: ${command}`);
  }
}

async function loadSettings() {
  const settingsPath = path.join(rootDir, 'project-settings.json');
  const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
  
  let settings = { project: {}, deployment: {} };
  let localSettings = { deployment: {} };
  
  try {
    settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));
  } catch {}
  
  try {
    localSettings = JSON.parse(await fs.readFile(localSettingsPath, 'utf-8'));
  } catch {}
  
  return { ...settings, ...localSettings };
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

async function getProjectName() {
  const settings = await loadSettings();
  
  if (settings.project?.name) {
    return settings.project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  // Use folder name as fallback
  return path.basename(rootDir).toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log('\n' + c('═'.repeat(50), colors.cyan));
  console.log(c('  GitHub Repository Setup', colors.bold, colors.cyan));
  console.log(c('═'.repeat(50), colors.cyan) + '\n');
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  try {
    // Check GitHub CLI
    log('Checking GitHub CLI...', 'step');
    const ghVersion = execSilent('gh --version');
    if (!ghVersion) {
      throw new Error('GitHub CLI (gh) is not installed. Install with: brew install gh');
    }
    log('GitHub CLI installed', 'success');
    
    // Check GitHub auth
    log('Checking GitHub authentication...', 'step');
    const ghAuthStatus = execSilent('gh auth status 2>&1');
    if (!ghAuthStatus || ghAuthStatus.includes('not logged')) {
      throw new Error('GitHub CLI not authenticated. Run: gh auth login');
    }
    log('GitHub CLI authenticated', 'success');
    
    // Check/initialize Git
    log('Checking Git repository...', 'step');
    const isGitRepo = execSilent('git rev-parse --git-dir');
    if (!isGitRepo) {
      log('Initializing Git repository...', 'step');
      execSilent('git init');
      log('Git repository initialized', 'success');
    } else {
      log('Git repository exists', 'success');
    }
    
    // Check for existing remote
    const remoteUrl = execSilent('git remote get-url origin');
    if (remoteUrl) {
      log(`Remote already configured: ${remoteUrl}`, 'warning');
      const answer = await askQuestion(rl, c('\n  Continue anyway? (y/n): ', colors.yellow));
      if (answer.toLowerCase() !== 'y') {
        console.log(c('\n  Aborted.\n', colors.dim));
        rl.close();
        process.exit(0);
      }
    }
    
    // Get project name
    const defaultName = await getProjectName();
    console.log('');
    const repoName = await askQuestion(rl, c(`  Repository name [${defaultName}]: `, colors.bold)) || defaultName;
    
    // Get visibility
    const visibility = args.public ? 'public' : 'private';
    log(`Creating ${visibility} repository...`, 'step');
    
    // Get GitHub username
    const ghUser = execSilent('gh api user -q .login');
    if (!ghUser) {
      throw new Error('Could not get GitHub username');
    }
    
    const fullRepoName = `${ghUser}/${repoName}`;
    
    // Check if repo already exists
    const repoExists = execSilent(`gh repo view ${fullRepoName} --json name 2>/dev/null`);
    
    if (repoExists) {
      log(`Repository already exists: ${fullRepoName}`, 'warning');
      const answer = await askQuestion(rl, c('\n  Use existing repository? (y/n): ', colors.yellow));
      if (answer.toLowerCase() !== 'y') {
        rl.close();
        process.exit(0);
      }
      
      // Just set up remote
      if (!remoteUrl) {
        execSilent(`git remote add origin https://github.com/${fullRepoName}.git`);
      }
    } else {
      // Create repository
      const visibilityFlag = args.public ? '--public' : '--private';
      
      try {
        execSilent(`gh repo create ${repoName} ${visibilityFlag} --source=. --remote=origin`);
        log(`Repository created: ${fullRepoName}`, 'success');
      } catch (error) {
        throw new Error(`Failed to create repository: ${error.message}`);
      }
    }
    
    // Create initial commit if needed
    log('Checking for commits...', 'step');
    const hasCommits = execSilent('git rev-parse HEAD 2>/dev/null');
    
    if (!hasCommits) {
      log('Creating initial commit...', 'step');
      execSilent('git add -A');
      execSilent('git commit -m "Initial commit"');
      log('Initial commit created', 'success');
    }
    
    // Push to GitHub
    log('Pushing to GitHub...', 'step');
    try {
      execSilent('git push -u origin main 2>&1');
    } catch {
      // Try with master branch
      try {
        execSilent('git push -u origin master 2>&1');
      } catch {
        // Force push as last resort
        execSilent('git push -u origin main --force 2>&1');
      }
    }
    log('Pushed to GitHub', 'success');
    
    // Save to settings
    await saveLocalSettings({
      deployment: {
        github: {
          repo: fullRepoName,
          branch: 'main',
          url: `https://github.com/${fullRepoName}`
        }
      }
    });
    
    console.log('');
    console.log(c('═'.repeat(50), colors.green));
    console.log(c('  GitHub Setup Complete!', colors.bold, colors.green));
    console.log(c('═'.repeat(50), colors.green));
    console.log('');
    console.log(`  ${c('Repository:', colors.bold)} https://github.com/${fullRepoName}`);
    console.log(`  ${c('Visibility:', colors.bold)} ${visibility}`);
    console.log('');
    console.log(c('  Next steps:', colors.dim));
    console.log(c('    • Run `npm run setup:vercel` to connect Vercel', colors.dim));
    console.log(c('    • Or run `npm run deploy` to deploy immediately', colors.dim));
    console.log('');
    
    rl.close();
    
  } catch (error) {
    console.log('');
    log(error.message, 'error');
    console.log('');
    rl.close();
    process.exit(1);
  }
}

main();
