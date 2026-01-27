#!/usr/bin/env node

/**
 * Project Initialization Wizard
 * One-command project setup with interactive configuration
 * 
 * Usage:
 *   node scripts/init-project.mjs                    # Interactive setup
 *   node scripts/init-project.mjs --name="Project"  # Quick setup with name
 *   node scripts/init-project.mjs --skip-ai         # Skip AI setup
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

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
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function color(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    name: null,
    client: null,
    industry: null,
    skipAi: false,
    skipGit: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--name=')) {
      options.name = arg.split('=')[1];
    } else if (arg.startsWith('--client=')) {
      options.client = arg.split('=')[1];
    } else if (arg.startsWith('--industry=')) {
      options.industry = arg.split('=')[1];
    } else if (arg === '--skip-ai') {
      options.skipAi = true;
    } else if (arg === '--skip-git') {
      options.skipGit = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Project Initialization Wizard', colors.bold, colors.cyan)}

Set up a new project with interactive configuration.

${color('Usage:', colors.bold)}
  node scripts/init-project.mjs [options]

${color('Options:', colors.bold)}
  --name=NAME       Project name
  --client=NAME     Client name
  --industry=NAME   Industry/sector
  --skip-ai         Skip AI provider setup
  --skip-git        Skip git initialization
  --help, -h        Show this help message

${color('What it does:', colors.bold)}
  1. Creates/updates PROJECT.md with project details
  2. Creates/updates SCOPE.md with initial scope
  3. Sets up API keys (optional)
  4. Creates starter content structure
  5. Initializes git with first commit (optional)

${color('Examples:', colors.bold)}
  npm run init                                # Full interactive setup
  npm run init -- --name="Acme Corp Website"  # Quick setup with name
`);
}

/**
 * Prompt for input
 */
function prompt(question, defaultValue = '') {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const displayQuestion = defaultValue 
    ? `${question} ${color(`[${defaultValue}]`, colors.dim)}: `
    : `${question}: `;
  
  return new Promise(resolve => {
    rl.question(displayQuestion, answer => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Prompt for yes/no
 */
async function confirm(question, defaultYes = true) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await prompt(`${question} ${color(hint, colors.dim)}`);
  
  if (answer === '') return defaultYes;
  return answer.toLowerCase().startsWith('y');
}

/**
 * Prompt for selection
 */
async function select(question, options) {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    console.log(`  ${color(`${i + 1}.`, colors.cyan)} ${opt}`);
  });
  
  const answer = await prompt('Select option');
  const index = parseInt(answer, 10) - 1;
  
  if (index >= 0 && index < options.length) {
    return options[index];
  }
  return options[0];
}

/**
 * Generate PROJECT.md content
 */
function generateProjectMd(config) {
  return `# ${config.name}

## Overview
${config.description || 'A modern website project built with the Cursor Website Starter Kit.'}

## Client
- **Name**: ${config.client || 'TBD'}
- **Industry**: ${config.industry || 'TBD'}
- **Contact**: ${config.contact || 'TBD'}

## Project Goals
${config.goals || '- Increase online presence\n- Generate leads\n- Showcase services/products'}

## Timeline
- **Start Date**: ${new Date().toISOString().split('T')[0]}
- **Target Launch**: ${config.targetLaunch || 'TBD'}

## Team
- **Project Lead**: ${config.projectLead || 'TBD'}
- **Designer**: ${config.designer || 'TBD'}
- **Developer**: ${config.developer || 'TBD'}

## Key Links
- Repository: [This repo]
- Staging: TBD
- Production: TBD

## Notes
${config.notes || 'No additional notes.'}

---
*Last updated: ${new Date().toISOString()}*
`;
}

/**
 * Generate SCOPE.md content
 */
function generateScopeMd(config) {
  return `# Project Scope: ${config.name}

## In Scope

### Pages
${config.pages?.map(p => `- [ ] ${p}`).join('\n') || `- [ ] Homepage
- [ ] About
- [ ] Services
- [ ] Contact`}

### Features
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] SEO optimization
- [ ] Contact form
- [ ] Analytics integration

### Design
- [ ] Custom branding/colors
- [ ] Typography selection
- [ ] Image assets
- [ ] Icon library

## Out of Scope
- E-commerce functionality
- User authentication
- Database backend
- Mobile app

## Constraints
- Timeline: ${config.timeline || 'TBD'}
- Budget: ${config.budget || 'TBD'}
- Technology: HTML/CSS/JS (Tailwind), Elementor handoff

## Success Criteria
- All pages live and functional
- Mobile-responsive
- Lighthouse score > 90
- Client approval on design

## Risks
- [ ] Content delays from client
- [ ] Design revision cycles
- [ ] Third-party integration issues

---
*Last updated: ${new Date().toISOString()}*
`;
}

/**
 * Generate starter content file
 */
function generateStarterContent(config, language = 'en') {
  return {
    "$schema": "../schema/page-content.schema.json",
    "meta": {
      "title": `${config.name} - Home`,
      "description": config.description || `Welcome to ${config.name}`,
      "language": language,
      "status": "draft",
      "lastUpdated": new Date().toISOString()
    },
    "storybrand": {
      "character": "Our ideal customer",
      "problem": {
        "external": "What they're trying to accomplish",
        "internal": "How it makes them feel",
        "philosophical": "Why it matters"
      },
      "guide": `${config.name} helps by...`,
      "plan": ["Step 1", "Step 2", "Step 3"],
      "callToAction": {
        "direct": "Get Started",
        "transitional": "Learn More"
      },
      "failure": "What happens if they don't act",
      "success": "What life looks like after"
    },
    "hero": {
      "headline": `Welcome to ${config.name}`,
      "subheadline": config.description || "Your trusted partner",
      "primaryCta": "Get Started",
      "secondaryCta": "Learn More"
    },
    "features": {
      "headline": "What We Offer",
      "items": []
    },
    "cta": {
      "headline": "Ready to Get Started?",
      "subheadline": "Let's work together",
      "primaryCta": "Contact Us"
    }
  };
}

/**
 * Update project-settings.json with project info
 */
async function updateProjectSettings(config) {
  const settingsPath = path.join(rootDir, 'project-settings.json');
  
  let settings;
  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    settings = JSON.parse(content);
  } catch {
    settings = {};
  }
  
  settings.project = {
    name: config.name,
    client: config.client,
    industry: config.industry,
    targetLanguages: ['en']
  };
  
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

/**
 * Main initialization function
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log(`
${color('═'.repeat(50), colors.cyan)}
${color('  Project Initialization Wizard', colors.bold, colors.cyan)}
${color('═'.repeat(50), colors.cyan)}
`);

  // Step 1: Gather project information
  console.log(color('\n📋 Step 1: Project Information\n', colors.bold));
  
  const config = {
    name: options.name || await prompt('Project name', 'My Website Project'),
    client: options.client || await prompt('Client name'),
    industry: options.industry || await select('Industry', [
      'Technology',
      'Healthcare',
      'Finance',
      'E-commerce',
      'Education',
      'Creative/Agency',
      'Professional Services',
      'Other'
    ]),
    description: await prompt('Short description (1-2 sentences)'),
    pages: []
  };
  
  // Ask about pages
  console.log(color('\n📄 Step 2: Pages\n', colors.bold));
  console.log('Which pages do you need? (comma-separated, or press Enter for default)');
  console.log(color('Default: Homepage, About, Services, Contact', colors.dim));
  
  const pagesInput = await prompt('Pages');
  if (pagesInput) {
    config.pages = pagesInput.split(',').map(p => p.trim());
  } else {
    config.pages = ['Homepage', 'About', 'Services', 'Contact'];
  }
  
  // Step 3: Generate files
  console.log(color('\n📝 Step 3: Generating Files\n', colors.bold));
  
  // Generate PROJECT.md
  const projectMdPath = path.join(rootDir, 'PROJECT.md');
  const projectMdContent = generateProjectMd(config);
  await fs.writeFile(projectMdPath, projectMdContent, 'utf-8');
  console.log(`  ${color('✓', colors.green)} PROJECT.md`);
  
  // Generate SCOPE.md
  const scopeMdPath = path.join(rootDir, 'SCOPE.md');
  const scopeMdContent = generateScopeMd(config);
  await fs.writeFile(scopeMdPath, scopeMdContent, 'utf-8');
  console.log(`  ${color('✓', colors.green)} SCOPE.md`);
  
  // Create content directory structure
  const contentDir = path.join(rootDir, 'src/content/en');
  await fs.mkdir(contentDir, { recursive: true });
  
  // Generate starter content
  const homeContentPath = path.join(contentDir, 'home.json');
  try {
    await fs.access(homeContentPath);
    console.log(`  ${color('○', colors.yellow)} src/content/en/home.json (already exists)`);
  } catch {
    const homeContent = generateStarterContent(config, 'en');
    await fs.writeFile(homeContentPath, JSON.stringify(homeContent, null, 2), 'utf-8');
    console.log(`  ${color('✓', colors.green)} src/content/en/home.json`);
  }
  
  // Update project settings
  await updateProjectSettings(config);
  console.log(`  ${color('✓', colors.green)} project-settings.json`);
  
  // Step 4: AI Provider Setup (optional)
  if (!options.skipAi) {
    console.log(color('\n🤖 Step 4: AI Provider Setup\n', colors.bold));
    
    const setupAi = await confirm('Would you like to set up AI providers now?', false);
    
    if (setupAi) {
      console.log('\nRunning settings wizard...\n');
      const { spawn } = await import('child_process');
      await new Promise((resolve) => {
        const proc = spawn('node', ['scripts/manage-settings.mjs'], {
          cwd: rootDir,
          stdio: 'inherit'
        });
        proc.on('close', resolve);
      });
    } else {
      console.log(`  ${color('○', colors.dim)} Skipped (run ${color('npm run settings', colors.cyan)} later)`);
    }
  }
  
  // Step 5: Git initialization (optional)
  if (!options.skipGit) {
    console.log(color('\n📦 Step 5: Git Setup\n', colors.bold));
    
    // Check if already a git repo
    try {
      await fs.access(path.join(rootDir, '.git'));
      console.log(`  ${color('○', colors.dim)} Git repository already initialized`);
      
      const commit = await confirm('Create initial commit with new files?', true);
      if (commit) {
        const { execSync } = await import('child_process');
        try {
          execSync('git add PROJECT.md SCOPE.md project-settings.json', { cwd: rootDir });
          execSync(`git commit -m "Initialize project: ${config.name}"`, { cwd: rootDir });
          console.log(`  ${color('✓', colors.green)} Created initial commit`);
        } catch (e) {
          console.log(`  ${color('⚠', colors.yellow)} Could not create commit: ${e.message}`);
        }
      }
    } catch {
      const initGit = await confirm('Initialize git repository?', true);
      if (initGit) {
        const { execSync } = await import('child_process');
        try {
          execSync('git init', { cwd: rootDir });
          execSync('git add .', { cwd: rootDir });
          execSync(`git commit -m "Initialize project: ${config.name}"`, { cwd: rootDir });
          console.log(`  ${color('✓', colors.green)} Initialized git and created first commit`);
        } catch (e) {
          console.log(`  ${color('⚠', colors.yellow)} Git error: ${e.message}`);
        }
      }
    }
  }
  
  // Summary
  console.log(`
${color('═'.repeat(50), colors.cyan)}
${color('  Setup Complete!', colors.bold, colors.green)}
${color('═'.repeat(50), colors.cyan)}

${color('Project:', colors.bold)} ${config.name}
${color('Client:', colors.bold)} ${config.client || 'TBD'}
${color('Industry:', colors.bold)} ${config.industry}
${color('Pages:', colors.bold)} ${config.pages.join(', ')}

${color('Next Steps:', colors.bold)}

  1. Add business context materials to ${color('business-context/', colors.cyan)}
  
  2. Run AI discovery:
     ${color('npm run ai:discovery', colors.cyan)}
  
  3. Generate content:
     ${color('npm run ai:generate-content -- --apply', colors.cyan)}
  
  4. Start development:
     ${color('npm run dev', colors.cyan)}
  
  5. When ready, create handoff:
     ${color('npm run handoff:bundle', colors.cyan)}

${color('Documentation:', colors.bold)}
  - See ${color('TEMPLATE_GUIDE.md', colors.cyan)} for full workflow
  - See ${color('docs/', colors.cyan)} for project documentation templates

`);
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
