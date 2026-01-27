#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Automated deployment to Vercel with GitHub integration
 * 
 * Usage:
 *   npm run deploy              Deploy to production
 *   npm run deploy:preview      Deploy preview branch
 *   node scripts/deploy-vercel.mjs --preview
 *   node scripts/deploy-vercel.mjs --setup
 */

import { spawn, execSync } from 'child_process';
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

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    preview: args.includes('--preview'),
    setup: args.includes('--setup'),
    force: args.includes('--force'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
${c('Vercel Deployment', colors.bold, colors.cyan)}

Deploy your project to Vercel with GitHub integration.

${c('Usage:', colors.bold)}
  npm run deploy              Deploy to production
  npm run deploy:preview      Deploy preview branch
  
${c('Options:', colors.bold)}
  --preview    Deploy as preview (not production)
  --setup      Run initial setup only
  --force      Force deployment even with uncommitted changes
  --help, -h   Show this help message

${c('Prerequisites:', colors.bold)}
  • GitHub CLI (gh) installed and authenticated
  • Vercel CLI installed and authenticated
  • Git repository initialized

${c('First-time setup:', colors.bold)}
  1. Run: gh auth login
  2. Run: npm i -g vercel && vercel login
  3. Run: npm run deploy
`);
}

async function exec(command, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, {
      cwd: rootDir,
      shell: true,
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      proc.stdout?.on('data', (data) => { stdout += data.toString(); });
      proc.stderr?.on('data', (data) => { stderr += data.toString(); });
    }

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new Error(stderr || `Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function execSilent(command) {
  try {
    return execSync(command, { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
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
  
  const merged = { ...existing, ...settings };
  await fs.writeFile(localSettingsPath, JSON.stringify(merged, null, 2), 'utf-8');
}

async function checkPrerequisites() {
  log('Checking prerequisites...', 'step');
  
  // Check Git
  const gitVersion = execSilent('git --version');
  if (!gitVersion) {
    throw new Error('Git is not installed. Please install Git first.');
  }
  log('Git installed', 'success');
  
  // Check if in git repo
  const isGitRepo = execSilent('git rev-parse --git-dir');
  if (!isGitRepo) {
    log('Initializing Git repository...', 'step');
    await exec('git init', { silent: true });
    log('Git repository initialized', 'success');
  } else {
    log('Git repository exists', 'success');
  }
  
  // Check GitHub CLI
  const ghVersion = execSilent('gh --version');
  if (!ghVersion) {
    throw new Error('GitHub CLI (gh) is not installed. Install with: brew install gh');
  }
  log('GitHub CLI installed', 'success');
  
  // Check GitHub auth
  const ghAuthStatus = execSilent('gh auth status');
  if (!ghAuthStatus) {
    throw new Error('GitHub CLI not authenticated. Run: gh auth login');
  }
  log('GitHub CLI authenticated', 'success');
  
  // Check Vercel CLI
  const vercelVersion = execSilent('vercel --version');
  if (!vercelVersion) {
    throw new Error('Vercel CLI is not installed. Install with: npm i -g vercel');
  }
  log('Vercel CLI installed', 'success');
  
  return true;
}

async function getProjectName() {
  const settings = await loadSettings();
  
  if (settings.project?.name) {
    return settings.project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  // Use folder name as fallback
  return path.basename(rootDir).toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

async function setupGitHub(projectName, settings) {
  log('Setting up GitHub repository...', 'step');
  
  // Check if remote already exists
  const remoteUrl = execSilent('git remote get-url origin');
  
  if (remoteUrl && settings.deployment?.github?.repo) {
    log(`GitHub repo already configured: ${settings.deployment.github.repo}`, 'success');
    return settings.deployment.github.repo;
  }
  
  // Get GitHub username
  const ghUser = execSilent('gh api user -q .login');
  if (!ghUser) {
    throw new Error('Could not get GitHub username');
  }
  
  const repoName = `${ghUser}/${projectName}`;
  
  // Check if repo exists
  const repoExists = execSilent(`gh repo view ${repoName} --json name`);
  
  if (!repoExists) {
    log(`Creating GitHub repository: ${repoName}`, 'step');
    await exec(`gh repo create ${projectName} --private --source=. --remote=origin`, { silent: true });
    log(`Repository created: ${repoName}`, 'success');
  } else {
    log(`Repository exists: ${repoName}`, 'success');
    
    // Add remote if not exists
    if (!remoteUrl) {
      await exec(`git remote add origin https://github.com/${repoName}.git`, { silent: true });
    }
  }
  
  // Save to settings
  await saveLocalSettings({
    deployment: {
      ...settings.deployment,
      github: {
        repo: repoName,
        branch: 'main'
      }
    }
  });
  
  return repoName;
}

async function commitAndPush(force = false) {
  log('Preparing to push to GitHub...', 'step');
  
  // Check for uncommitted changes
  const status = execSilent('git status --porcelain');
  
  if (status) {
    if (!force) {
      log('Uncommitted changes detected', 'warning');
    }
    
    // Stage all changes
    await exec('git add -A', { silent: true });
    
    // Commit
    const timestamp = new Date().toISOString().split('T')[0];
    const commitMessage = `Deploy: ${timestamp}`;
    
    try {
      await exec(`git commit -m "${commitMessage}"`, { silent: true });
      log('Changes committed', 'success');
    } catch {
      log('No changes to commit', 'info');
    }
  }
  
  // Push to GitHub
  log('Pushing to GitHub...', 'step');
  
  try {
    await exec('git push -u origin main', { silent: true });
  } catch {
    // Try setting upstream and pushing
    try {
      await exec('git push --set-upstream origin main', { silent: true });
    } catch (error) {
      // Force push if needed
      log('Trying force push...', 'warning');
      await exec('git push -u origin main --force', { silent: true });
    }
  }
  
  log('Pushed to GitHub', 'success');
}

async function deployToVercel(projectName, isPreview, settings) {
  log(`Deploying to Vercel${isPreview ? ' (preview)' : ' (production)'}...`, 'step');
  
  const prodFlag = isPreview ? '' : '--prod';
  const confirmFlag = '--yes';
  
  // Check if Vercel project is linked
  const vercelJsonPath = path.join(rootDir, '.vercel/project.json');
  let vercelProject = null;
  
  try {
    vercelProject = JSON.parse(await fs.readFile(vercelJsonPath, 'utf-8'));
  } catch {
    // Not linked yet
  }
  
  if (!vercelProject) {
    log('Linking to Vercel...', 'step');
    await exec(`vercel link --yes`, { silent: true });
    
    try {
      vercelProject = JSON.parse(await fs.readFile(vercelJsonPath, 'utf-8'));
    } catch {}
  }
  
  // Deploy
  log('Running Vercel deployment...', 'step');
  
  try {
    const result = await exec(`vercel ${prodFlag} ${confirmFlag}`, { silent: true });
    
    // Extract URL from output
    const urlMatch = result.stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
    const deployUrl = urlMatch ? urlMatch[0] : null;
    
    if (deployUrl) {
      // Save deployment URL
      await saveLocalSettings({
        deployment: {
          ...settings.deployment,
          vercel: {
            projectId: vercelProject?.projectId,
            orgId: vercelProject?.orgId,
            url: deployUrl,
            lastDeployed: new Date().toISOString()
          }
        }
      });
      
      return deployUrl;
    }
  } catch (error) {
    // Vercel might output URL to stderr or in error
    throw error;
  }
  
  // Try to get the production URL
  const productionUrl = `https://${projectName}.vercel.app`;
  return productionUrl;
}

async function runBuild() {
  log('Building project...', 'step');
  
  try {
    await exec('npm run build');
    log('Build completed', 'success');
  } catch (error) {
    throw new Error('Build failed. Please fix errors and try again.');
  }
}

async function main() {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log('\n' + c('═'.repeat(50), colors.cyan));
  console.log(c('  Vercel Deployment', colors.bold, colors.cyan));
  console.log(c('═'.repeat(50), colors.cyan) + '\n');
  
  try {
    // Check prerequisites
    await checkPrerequisites();
    console.log('');
    
    // Load settings
    const settings = await loadSettings();
    const projectName = await getProjectName();
    
    log(`Project: ${projectName}`, 'info');
    console.log('');
    
    // Setup GitHub
    const repoName = await setupGitHub(projectName, settings);
    console.log('');
    
    // Build
    await runBuild();
    console.log('');
    
    // Commit and push
    await commitAndPush(args.force);
    console.log('');
    
    // Deploy to Vercel
    const updatedSettings = await loadSettings();
    const deployUrl = await deployToVercel(projectName, args.preview, updatedSettings);
    
    console.log('');
    console.log(c('═'.repeat(50), colors.green));
    console.log(c('  Deployment Complete!', colors.bold, colors.green));
    console.log(c('═'.repeat(50), colors.green));
    console.log('');
    console.log(`  ${c('Preview URL:', colors.bold)} ${c(deployUrl, colors.cyan)}`);
    console.log(`  ${c('GitHub Repo:', colors.bold)} ${c(`https://github.com/${repoName}`, colors.cyan)}`);
    console.log('');
    console.log(c('  Share this URL with your client and implementation team!', colors.dim));
    console.log('');
    
    // Open in browser
    try {
      const open = (await import('open')).default;
      await open(deployUrl);
      log('Opened in browser', 'success');
    } catch {
      // Browser opening is optional
    }
    
  } catch (error) {
    console.log('');
    log(error.message, 'error');
    console.log('');
    console.log(c('  Run `npm run help` for setup instructions.', colors.dim));
    console.log('');
    process.exit(1);
  }
}

main();
