#!/usr/bin/env node

/**
 * Deployment Pipeline
 * Deploy built site to various hosting platforms
 * 
 * Usage:
 *   node scripts/deploy.mjs                          # Interactive deploy
 *   node scripts/deploy.mjs --target=netlify         # Deploy to Netlify
 *   node scripts/deploy.mjs --env=staging            # Deploy to staging
 *   node scripts/deploy.mjs --env=production         # Deploy to production
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import { createInterface } from 'readline';
import { escapeShellArg, validateCliArg } from './lib/security-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// CLI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function color(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Deployment targets
const TARGETS = {
  netlify: {
    name: 'Netlify',
    command: 'netlify deploy',
    productionFlag: '--prod',
    requiresCLI: 'netlify',
    docs: 'https://docs.netlify.com/cli/get-started/'
  },
  vercel: {
    name: 'Vercel',
    command: 'vercel',
    productionFlag: '--prod',
    requiresCLI: 'vercel',
    docs: 'https://vercel.com/docs/cli'
  },
  gh_pages: {
    name: 'GitHub Pages',
    command: 'gh-pages',
    productionFlag: '',
    requiresCLI: null,
    docs: 'https://pages.github.com/'
  },
  surge: {
    name: 'Surge.sh',
    command: 'surge',
    productionFlag: '',
    requiresCLI: 'surge',
    docs: 'https://surge.sh/'
  },
  ftp: {
    name: 'FTP/SFTP',
    command: null,
    productionFlag: '',
    requiresCLI: null,
    docs: null
  }
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    target: null,
    env: 'staging',
    skipBuild: false,
    skipValidate: false,
    dryRun: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1];
    } else if (arg.startsWith('--env=')) {
      options.env = arg.split('=')[1];
    } else if (arg === '--skip-build') {
      options.skipBuild = true;
    } else if (arg === '--skip-validate') {
      options.skipValidate = true;
    } else if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Deployment Pipeline', colors.bold, colors.cyan)}

Deploy your built site to various hosting platforms.

${color('Usage:', colors.bold)}
  node scripts/deploy.mjs [options]

${color('Options:', colors.bold)}
  --target=TARGET     Deployment target: netlify, vercel, gh_pages, surge, ftp
  --env=ENV           Environment: staging (default), production
  --skip-build        Skip build step
  --skip-validate     Skip validation step
  --dry-run, -n       Show what would be done without deploying
  --help, -h          Show this help message

${color('Targets:', colors.bold)}
${Object.entries(TARGETS).map(([id, t]) => `  ${id.padEnd(12)} ${t.name}`).join('\n')}

${color('Examples:', colors.bold)}
  npm run deploy                               # Interactive deploy
  npm run deploy:staging                       # Deploy to staging
  npm run deploy:production                    # Deploy to production
  npm run deploy -- --target=netlify           # Deploy to Netlify
`);
}

/**
 * Prompt for input
 */
function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Check if a CLI tool is available
 */
function checkCLI(name) {
  // Validate the CLI name to prevent command injection
  const validation = validateCliArg(name, { 
    allowedValues: ['netlify', 'vercel', 'surge', 'gh', 'git', 'npm', 'npx'] 
  });
  
  if (!validation.valid) {
    console.log(`${color('✗', colors.red)} Invalid CLI name: ${name}`);
    return false;
  }
  
  try {
    execSync(`which ${escapeShellArg(name)}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Run a command and stream output
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n${color('>', colors.cyan)} ${command} ${args.join(' ')}\n`);
    
    const proc = spawn(command, args, {
      cwd: options.cwd || rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    // Track for cleanup on interrupt
    activeProcesses.add(proc);
    
    proc.on('close', code => {
      activeProcesses.delete(proc);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      activeProcesses.delete(proc);
      reject(err);
    });
  });
}

/**
 * Load deployment config
 */
async function loadDeployConfig() {
  const configPath = path.join(rootDir, 'deploy.config.json');
  
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save deployment config
 */
async function saveDeployConfig(config) {
  const configPath = path.join(rootDir, 'deploy.config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Deploy to Netlify
 */
async function deployNetlify(options, config) {
  if (!checkCLI('netlify')) {
    console.log(`${color('✗', colors.red)} Netlify CLI not found`);
    console.log(`  Install: ${color('npm install -g netlify-cli', colors.cyan)}`);
    console.log(`  Docs: ${TARGETS.netlify.docs}`);
    return false;
  }
  
  const args = ['deploy', '--dir=dist'];
  
  if (options.env === 'production') {
    args.push('--prod');
  }
  
  if (config?.netlify?.siteId) {
    args.push(`--site=${config.netlify.siteId}`);
  }
  
  if (options.dryRun) {
    console.log(`Would run: netlify ${args.join(' ')}`);
    return true;
  }
  
  await runCommand('netlify', args);
  return true;
}

/**
 * Deploy to Vercel
 */
async function deployVercel(options, config) {
  if (!checkCLI('vercel')) {
    console.log(`${color('✗', colors.red)} Vercel CLI not found`);
    console.log(`  Install: ${color('npm install -g vercel', colors.cyan)}`);
    console.log(`  Docs: ${TARGETS.vercel.docs}`);
    return false;
  }
  
  const args = [];
  
  if (options.env === 'production') {
    args.push('--prod');
  }
  
  if (options.dryRun) {
    console.log(`Would run: vercel ${args.join(' ')}`);
    return true;
  }
  
  await runCommand('vercel', args);
  return true;
}

/**
 * Deploy to GitHub Pages
 */
async function deployGHPages(options, config) {
  // Check for gh-pages package
  const pkgPath = path.join(rootDir, 'node_modules/gh-pages');
  try {
    await fs.access(pkgPath);
  } catch {
    console.log(`${color('!', colors.yellow)} Installing gh-pages...`);
    await runCommand('npm', ['install', '--save-dev', 'gh-pages']);
  }
  
  if (options.dryRun) {
    console.log('Would run: npx gh-pages -d dist');
    return true;
  }
  
  await runCommand('npx', ['gh-pages', '-d', 'dist']);
  return true;
}

/**
 * Deploy to Surge
 */
async function deploySurge(options, config) {
  if (!checkCLI('surge')) {
    console.log(`${color('✗', colors.red)} Surge CLI not found`);
    console.log(`  Install: ${color('npm install -g surge', colors.cyan)}`);
    console.log(`  Docs: ${TARGETS.surge.docs}`);
    return false;
  }
  
  const domain = config?.surge?.domain || await prompt('Surge domain (e.g., mysite.surge.sh): ');
  
  if (!domain) {
    console.log(`${color('✗', colors.red)} Domain required for Surge deployment`);
    return false;
  }
  
  // Validate domain format (alphanumeric, hyphens, dots only)
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*\.surge\.sh$/;
  if (!domainPattern.test(domain)) {
    console.log(`${color('✗', colors.red)} Invalid domain format. Must be like: mysite.surge.sh`);
    return false;
  }
  
  if (options.dryRun) {
    console.log(`Would run: surge dist ${domain}`);
    return true;
  }
  
  await runCommand('surge', ['dist', domain]);
  
  // Save domain for future use
  if (!config) config = {};
  config.surge = { domain };
  await saveDeployConfig(config);
  
  return true;
}

// Track active child processes for cleanup
const activeProcesses = new Set();

/**
 * Graceful shutdown handler
 */
function setupShutdownHandler() {
  const shutdown = (signal) => {
    console.log(`\n${color('Received ' + signal + ', cleaning up...', colors.yellow)}`);
    
    // Kill any active child processes
    for (const proc of activeProcesses) {
      try {
        proc.kill('SIGTERM');
      } catch {
        // Process may have already exited
      }
    }
    
    console.log(`${color('Deployment cancelled', colors.yellow)}`);
    process.exit(130);
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Main deployment function
 */
async function main() {
  setupShutdownHandler();
  
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log(`
${color('═'.repeat(50), colors.cyan)}
${color('  Deployment Pipeline', colors.bold, colors.cyan)}
${color('═'.repeat(50), colors.cyan)}
`);

  // Load config
  const config = await loadDeployConfig();
  
  // Determine target
  let target = options.target;
  if (!target) {
    // Interactive selection
    console.log(`${color('Select deployment target:', colors.bold)}\n`);
    Object.entries(TARGETS).forEach(([id, t], i) => {
      console.log(`  ${color(`${i + 1}.`, colors.cyan)} ${t.name}`);
    });
    
    const choice = await prompt('\nSelect (1-5): ');
    const targets = Object.keys(TARGETS);
    const choiceNum = parseInt(choice, 10);
    
    // Validate choice is a valid number
    if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > targets.length) {
      console.log(`${color('✗', colors.red)} Invalid selection. Please enter a number 1-${targets.length}`);
      process.exit(1);
    }
    
    target = targets[choiceNum - 1];
  }
  
  // Validate target against allowed values
  const validTargets = Object.keys(TARGETS);
  const targetValidation = validateCliArg(target, { allowedValues: validTargets });
  
  if (!targetValidation.valid || !TARGETS[target]) {
    console.log(`${color('✗', colors.red)} Unknown target: ${target}`);
    console.log(`  Available: ${validTargets.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`\n${color('Target:', colors.bold)} ${TARGETS[target].name}`);
  console.log(`${color('Environment:', colors.bold)} ${options.env}`);
  
  // Step 1: Validate
  if (!options.skipValidate) {
    console.log(`\n${color('Step 1: Validation', colors.bold)}\n`);
    try {
      await runCommand('npm', ['run', 'validate']);
      console.log(`${color('✓', colors.green)} Validation passed`);
    } catch {
      console.log(`${color('✗', colors.red)} Validation failed`);
      const proceed = await prompt('Continue anyway? (y/N): ');
      if (!proceed.toLowerCase().startsWith('y')) {
        process.exit(1);
      }
    }
  }
  
  // Step 2: Build
  if (!options.skipBuild) {
    console.log(`\n${color('Step 2: Build', colors.bold)}\n`);
    try {
      await runCommand('npm', ['run', 'build']);
      console.log(`${color('✓', colors.green)} Build completed`);
    } catch (e) {
      console.log(`${color('✗', colors.red)} Build failed: ${e.message}`);
      process.exit(1);
    }
  }
  
  // Check dist exists
  try {
    await fs.access(path.join(rootDir, 'dist'));
  } catch {
    console.log(`${color('✗', colors.red)} dist/ directory not found. Run build first.`);
    process.exit(1);
  }
  
  // Step 3: Deploy
  console.log(`\n${color('Step 3: Deploy', colors.bold)}\n`);
  
  let success = false;
  
  switch (target) {
    case 'netlify':
      success = await deployNetlify(options, config);
      break;
    case 'vercel':
      success = await deployVercel(options, config);
      break;
    case 'gh_pages':
      success = await deployGHPages(options, config);
      break;
    case 'surge':
      success = await deploySurge(options, config);
      break;
    case 'ftp':
      console.log(`${color('FTP deployment:', colors.bold)}`);
      console.log('  Use an FTP client or rsync to upload the dist/ directory.');
      console.log('  Recommended: FileZilla, Cyberduck, or rsync');
      success = true;
      break;
  }
  
  // Summary
  console.log(`\n${color('─'.repeat(50), colors.dim)}\n`);
  
  if (success) {
    console.log(`${color('✓ Deployment complete!', colors.bold, colors.green)}\n`);
    
    if (options.env === 'staging') {
      console.log(`${color('Next:', colors.bold)} When ready, deploy to production:`);
      console.log(`  ${color(`npm run deploy:production -- --target=${target}`, colors.cyan)}\n`);
    }
  } else {
    console.log(`${color('✗ Deployment failed', colors.bold, colors.red)}\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
