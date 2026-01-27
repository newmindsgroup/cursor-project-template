#!/usr/bin/env node

/**
 * Interactive Start Menu
 * Single entry point for all project operations
 * 
 * Usage: npm start
 */

import { createInterface } from 'readline';
import { spawn } from 'child_process';
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
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m'
};

function c(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Box drawing characters
const box = {
  tl: '╔', tr: '╗', bl: '╚', br: '╝',
  h: '═', v: '║', ml: '╠', mr: '╣'
};

function drawBox(lines, width = 60) {
  const output = [];
  output.push(c(box.tl + box.h.repeat(width - 2) + box.tr, colors.cyan));
  
  for (const line of lines) {
    if (line === '---') {
      output.push(c(box.ml + box.h.repeat(width - 2) + box.mr, colors.cyan));
    } else {
      const padding = width - 4 - stripAnsi(line).length;
      output.push(c(box.v, colors.cyan) + ' ' + line + ' '.repeat(Math.max(0, padding)) + ' ' + c(box.v, colors.cyan));
    }
  }
  
  output.push(c(box.bl + box.h.repeat(width - 2) + box.br, colors.cyan));
  return output.join('\n');
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

async function checkProjectStatus() {
  const status = {
    hasSettings: false,
    hasContent: false,
    hasGitHub: false,
    hasVercel: false,
    projectName: 'New Project'
  };

  try {
    const settingsPath = path.join(rootDir, 'project-settings.json');
    const settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));
    status.hasSettings = true;
    status.projectName = settings.project?.name || 'New Project';
  } catch {}

  try {
    const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
    const localSettings = JSON.parse(await fs.readFile(localSettingsPath, 'utf-8'));
    status.hasGitHub = !!localSettings.deployment?.github?.repo;
    status.hasVercel = !!localSettings.deployment?.vercel?.url;
  } catch {}

  try {
    const contentDir = path.join(rootDir, 'src/content/en');
    const files = await fs.readdir(contentDir);
    status.hasContent = files.filter(f => f.endsWith('.json')).length > 0;
  } catch {}

  return status;
}

function showMenu(status) {
  console.clear();
  
  const title = c('Website Project Starter Kit', colors.bold, colors.white);
  const subtitle = status.hasSettings 
    ? c(`Project: ${status.projectName}`, colors.dim)
    : c('No project configured yet', colors.dim);

  const menuItems = [
    '',
    c('  Choose your path:', colors.bold),
    '',
    `  ${c('[1]', colors.green, colors.bold)} ${c('🚀 Quick Start Wizard', colors.white, colors.bold)}`,
    `      ${c('Full guided setup → content → design → deploy', colors.dim)}`,
    `      ${c('Best for: New projects from scratch', colors.cyan)}`,
    '',
    `  ${c('[2]', colors.yellow, colors.bold)} ${c('📝 Update Existing Project', colors.white, colors.bold)}`,
    `      ${c('Change answers, regenerate content, update settings', colors.dim)}`,
    `      ${c('Best for: Making changes to current project', colors.cyan)}`,
    '',
    `  ${c('[3]', colors.blue, colors.bold)} ${c('🌐 Deploy / Preview', colors.white, colors.bold)}`,
    `      ${c('Push to GitHub and deploy to Vercel', colors.dim)}`,
    `      ${c('Best for: Sharing with client/team', colors.cyan)}`,
    '',
    `  ${c('[4]', colors.magenta, colors.bold)} ${c('📚 Help & Documentation', colors.white, colors.bold)}`,
    `      ${c('See all available commands and what they do', colors.dim)}`,
    '',
    `  ${c('[5]', colors.cyan, colors.bold)} ${c('⚡ Advanced Commands', colors.white, colors.bold)}`,
    `      ${c('Individual generation, validation, export tools', colors.dim)}`,
    '',
    `  ${c('[6]', colors.yellow, colors.bold)} ${c('🎬 Demo Mode (Client Presentation)', colors.white, colors.bold)}`,
    `      ${c('Realistic sample company with full deliverables', colors.dim)}`,
    `      ${c('Best for: Testing system & showing clients your process', colors.cyan)}`,
    '',
    `  ${c('[q]', colors.red, colors.bold)} ${c('Exit', colors.dim)}`,
    ''
  ];

  console.log('\n');
  console.log(drawBox([
    c(title, colors.bold),
    subtitle,
    '---',
    ...menuItems
  ], 65));

  // Show status indicators
  console.log('\n  ' + c('Status:', colors.bold));
  console.log('  ' + (status.hasSettings ? c('✓', colors.green) : c('○', colors.dim)) + ' Project configured');
  console.log('  ' + (status.hasContent ? c('✓', colors.green) : c('○', colors.dim)) + ' Content generated');
  console.log('  ' + (status.hasGitHub ? c('✓', colors.green) : c('○', colors.dim)) + ' GitHub connected');
  console.log('  ' + (status.hasVercel ? c('✓', colors.green) : c('○', colors.dim)) + ' Vercel deployed');
  console.log('');
}

function showAdvancedMenu() {
  console.clear();
  console.log('\n');
  console.log(drawBox([
    c('Advanced Commands', colors.bold, colors.white),
    '---',
    '',
    c('  Content Generation:', colors.bold),
    `  ${c('[a]', colors.green)} ai:full-pipeline   ${c('Run all AI generation', colors.dim)}`,
    `  ${c('[b]', colors.green)} ai:content         ${c('Generate page content', colors.dim)}`,
    `  ${c('[c]', colors.green)} ai:generate-colors ${c('Generate brand colors', colors.dim)}`,
    `  ${c('[d]', colors.green)} ai:discovery       ${c('Analyze business context', colors.dim)}`,
    '',
    c('  Validation & QA:', colors.bold),
    `  ${c('[e]', colors.yellow)} validate          ${c('Check all content/assets', colors.dim)}`,
    `  ${c('[f]', colors.yellow)} wizard:check      ${c('Find content gaps', colors.dim)}`,
    `  ${c('[g]', colors.yellow)} ai:qa             ${c('Run accessibility + SEO', colors.dim)}`,
    '',
    c('  Build & Export:', colors.bold),
    `  ${c('[h]', colors.blue)} build             ${c('Build for production', colors.dim)}`,
    `  ${c('[i]', colors.blue)} handoff:bundle    ${c('Generate full handoff', colors.dim)}`,
    `  ${c('[j]', colors.blue)} sitemap:export-all ${c('Export all sitemaps', colors.dim)}`,
    '',
    `  ${c('[0]', colors.dim)} Back to main menu`,
    ''
  ], 65));
}

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(c(`\n  Running: npm run ${command} ${args.join(' ')}`, colors.dim));
    console.log(c('  ' + '─'.repeat(50), colors.dim));
    console.log('');
    
    const proc = spawn('npm', ['run', command, ...args], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function openInBrowser(url) {
  const open = (await import('open')).default;
  await open(url);
}

async function handleChoice(choice, rl, status) {
  switch (choice.toLowerCase()) {
    case '1':
      // Quick Start Wizard
      console.log(c('\n  Starting Quick Start Wizard...', colors.green));
      console.log(c('  This will open the wizard in your browser.', colors.dim));
      console.log(c('  Press Ctrl+C to stop the server when done.\n', colors.dim));
      await runCommand('wizard');
      break;

    case '2':
      // Update Existing Project
      console.log(c('\n  Opening Context Manager...', colors.yellow));
      console.log(c('  You can update any project settings here.', colors.dim));
      console.log(c('  Press Ctrl+C to stop the server when done.\n', colors.dim));
      
      // Start wizard server and open context page
      spawn('npm', ['run', 'wizard:server'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true,
        detached: false
      });
      
      // Wait a moment for server to start, then open browser
      await new Promise(r => setTimeout(r, 2000));
      await openInBrowser('http://localhost:5173/pages/wizard/context/');
      
      console.log(c('\n  Server running. Press Ctrl+C to stop.', colors.dim));
      await new Promise(() => {}); // Wait indefinitely
      break;

    case '3':
      // Deploy / Preview
      console.log(c('\n  Starting deployment...', colors.blue));
      try {
        await runCommand('deploy');
      } catch (error) {
        console.log(c('\n  Deployment failed. Run `npm run help` for setup instructions.', colors.red));
      }
      await pressEnterToContinue(rl);
      return true; // Return to menu

    case '4':
      // Help & Documentation
      await runCommand('help');
      await pressEnterToContinue(rl);
      return true; // Return to menu

    case '5':
      // Advanced Commands
      return await handleAdvancedMenu(rl);

    case '6':
      // Demo Mode
      console.log(c('\n  Starting Demo Mode...', colors.yellow));
      console.log(c('  This will set up a sample project for demonstration.', colors.dim));
      console.log(c('  Press Ctrl+C to stop the server when done.\n', colors.dim));
      await runCommand('demo');
      break;

    case 'q':
    case 'exit':
      console.log(c('\n  Goodbye! 👋\n', colors.cyan));
      process.exit(0);

    default:
      console.log(c('\n  Invalid choice. Please try again.', colors.red));
      await pressEnterToContinue(rl);
      return true;
  }
  
  return false;
}

async function handleAdvancedMenu(rl) {
  showAdvancedMenu();
  
  const choice = await askQuestion(rl, c('  Enter choice: ', colors.bold));
  
  const commands = {
    'a': 'ai:full-pipeline',
    'b': 'ai:content',
    'c': 'ai:generate-colors',
    'd': 'ai:discovery',
    'e': 'validate',
    'f': 'wizard:check',
    'g': 'ai:qa',
    'h': 'build',
    'i': 'handoff:bundle',
    'j': 'sitemap:export-all',
    '0': null
  };

  if (choice === '0') {
    return true; // Go back to main menu
  }

  const command = commands[choice.toLowerCase()];
  if (command) {
    try {
      await runCommand(command);
    } catch (error) {
      console.log(c(`\n  Command failed: ${error.message}`, colors.red));
    }
    await pressEnterToContinue(rl);
    return await handleAdvancedMenu(rl); // Stay in advanced menu
  } else {
    console.log(c('\n  Invalid choice.', colors.red));
    await pressEnterToContinue(rl);
    return await handleAdvancedMenu(rl);
  }
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function pressEnterToContinue(rl) {
  await askQuestion(rl, c('\n  Press Enter to continue...', colors.dim));
}

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Handle Ctrl+C gracefully
  rl.on('close', () => {
    console.log(c('\n  Goodbye! 👋\n', colors.cyan));
    process.exit(0);
  });

  while (true) {
    const status = await checkProjectStatus();
    showMenu(status);
    
    const choice = await askQuestion(rl, c('  Enter choice [1-6, q]: ', colors.bold));
    const shouldContinue = await handleChoice(choice, rl, status);
    
    if (!shouldContinue) {
      break;
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error(c(`\nError: ${error.message}`, colors.red));
  process.exit(1);
});
