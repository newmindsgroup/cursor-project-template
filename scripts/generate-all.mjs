#!/usr/bin/env node

/**
 * Generate All - Full Pipeline Orchestrator
 * Runs the complete AI generation pipeline for a new project
 * 
 * Usage:
 *   node scripts/generate-all.mjs                           # Run full pipeline
 *   node scripts/generate-all.mjs --pages=home,about        # Specific pages only
 *   node scripts/generate-all.mjs --skip=images             # Skip specific steps
 *   node scripts/generate-all.mjs --only=content            # Only run specific step
 *   node scripts/generate-all.mjs --json                    # Output progress as JSON
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { setupGracefulShutdown, registerCleanup, runWithTimeout } from './lib/process-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Setup graceful shutdown handling
setupGracefulShutdown();

// Track pipeline state for potential rollback
let pipelineState = {
  startTime: null,
  completedSteps: [],
  currentStep: null,
  tempFiles: []
};

// Register cleanup handler
registerCleanup(async () => {
  if (pipelineState.currentStep) {
    console.log(`  Pipeline interrupted during: ${pipelineState.currentStep}`);
  }
  // Clean up any temp files if needed
  for (const tempFile of pipelineState.tempFiles) {
    try {
      await fs.unlink(tempFile);
    } catch {
      // File doesn't exist or already cleaned
    }
  }
});

// Default timeout for each step (5 minutes)
const DEFAULT_STEP_TIMEOUT = 5 * 60 * 1000;

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

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    pages: null,
    skip: [],
    only: null,
    json: false,
    force: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--pages=')) {
      options.pages = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--skip=')) {
      options.skip = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--only=')) {
      options.only = arg.split('=')[1];
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Generate All - Full Pipeline Orchestrator', colors.bold, colors.cyan)}

Run the complete AI generation pipeline for a new project.

${color('Usage:', colors.bold)}
  node scripts/generate-all.mjs [options]

${color('Options:', colors.bold)}
  --pages=LIST    Comma-separated list of pages to generate
  --skip=STEPS    Skip specific steps (setup,analyze,personas,content,pages,images)
  --only=STEP     Run only a specific step
  --force         Force regeneration even if cached
  --json          Output progress as JSON (for API consumption)
  --help, -h      Show this help message

${color('Steps:', colors.bold)}
  1. setup     - Create PROJECT.md and SCOPE.md
  2. analyze   - Analyze business context
  3. personas  - Generate user personas
  4. content   - Generate page content (StoryBrand)
  5. pages     - Create page HTML from blueprints
  6. images    - Generate AI images
  7. validate  - Validate design spacing compliance

${color('Examples:', colors.bold)}
  npm run generate:all                      # Full pipeline
  npm run generate:all -- --pages=home,about  # Specific pages
  npm run generate:all -- --skip=images       # Skip image generation
`);
}

// Pipeline steps
const STEPS = [
  {
    id: 'setup',
    name: 'Setup Project Files',
    description: 'Create PROJECT.md and SCOPE.md',
    script: null, // Custom handler
    required: true
  },
  {
    id: 'analyze',
    name: 'Analyze Business Context',
    description: 'Extract insights from uploaded files',
    script: 'analyze-business-context.mjs',
    args: ['--apply']
  },
  {
    id: 'personas',
    name: 'Generate User Personas',
    description: 'Create target audience profiles',
    script: 'generate-personas.mjs',
    args: ['--apply']
  },
  {
    id: 'content',
    name: 'Generate Page Content',
    description: 'Create StoryBrand content for each page (parallel)',
    script: 'generate-section-content.mjs',
    args: ['--apply', '--parallel']
  },
  {
    id: 'pages',
    name: 'Generate Page HTML',
    description: 'Create pages from blueprints',
    script: 'generate-page.mjs',
    args: []
  },
  {
    id: 'images',
    name: 'Generate Images',
    description: 'AI-generated images for content',
    script: 'generate-images.mjs',
    args: []
  },
  {
    id: 'validate',
    name: 'Validate Design',
    description: 'Check spacing and Golden Ratio compliance',
    script: 'validate-design.mjs',
    args: ['--verbose']
  }
];

// Progress reporter
class ProgressReporter {
  constructor(jsonMode = false) {
    this.jsonMode = jsonMode;
    this.startTime = Date.now();
    this.currentStep = null;
    this.steps = {};
  }

  startStep(step) {
    this.currentStep = step.id;
    this.steps[step.id] = { status: 'running', startTime: Date.now() };
    
    if (this.jsonMode) {
      this.emitJson({ type: 'step_start', step: step.id, name: step.name });
    } else {
      console.log(`\n${color(`▶ ${step.name}`, colors.bold, colors.cyan)}`);
      console.log(color(`  ${step.description}`, colors.dim));
    }
  }

  updateStep(message) {
    if (this.jsonMode) {
      this.emitJson({ type: 'step_progress', step: this.currentStep, message });
    } else {
      console.log(`  ${message}`);
    }
  }

  completeStep(step, success = true) {
    const elapsed = ((Date.now() - this.steps[step.id].startTime) / 1000).toFixed(1);
    this.steps[step.id].status = success ? 'completed' : 'failed';
    this.steps[step.id].elapsed = elapsed;
    
    if (this.jsonMode) {
      this.emitJson({ type: 'step_complete', step: step.id, success, elapsed });
    } else {
      const icon = success ? color('✓', colors.green) : color('✗', colors.red);
      console.log(`  ${icon} ${success ? 'Completed' : 'Failed'} in ${elapsed}s`);
    }
  }

  skipStep(step, reason) {
    this.steps[step.id] = { status: 'skipped', reason };
    
    if (this.jsonMode) {
      this.emitJson({ type: 'step_skip', step: step.id, reason });
    } else {
      console.log(`\n${color(`○ ${step.name}`, colors.dim)} (skipped: ${reason})`);
    }
  }

  finish(success = true) {
    const totalElapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    if (this.jsonMode) {
      this.emitJson({ type: 'pipeline_complete', success, totalElapsed, steps: this.steps });
    } else {
      console.log(`\n${color('═'.repeat(50), colors.dim)}`);
      console.log(`\n${color(success ? '✓ Pipeline Complete' : '✗ Pipeline Failed', success ? colors.green : colors.red, colors.bold)}`);
      console.log(`  Total time: ${totalElapsed}s\n`);
    }
  }

  emitJson(data) {
    console.log(JSON.stringify({ timestamp: Date.now(), ...data }));
  }
}

/**
 * Run a script with error handling and timeout
 */
async function runScript(scriptPath, args = [], reporter, options = {}) {
  const { timeout = DEFAULT_STEP_TIMEOUT } = options;
  
  try {
    const result = await runWithTimeout('node', [scriptPath, ...args], {
      timeout,
      cwd: rootDir,
      captureOutput: true,
      onData: (stream, text) => {
        if (stream === 'stdout') {
          // Report progress
          const lines = text.split('\n').filter(l => l.trim());
          for (const line of lines) {
            if (line.includes('✓') || line.includes('Generated') || line.includes('Created')) {
              reporter.updateStep(line.trim());
            }
          }
        }
      }
    });
    
    if (result.exitCode !== 0) {
      throw new Error(`Script exited with code ${result.exitCode}\n${result.stderr || result.stdout}`);
    }
    
    return result;
  } catch (error) {
    if (error.message.includes('timed out')) {
      throw new Error(`Script timed out after ${timeout / 1000}s: ${path.basename(scriptPath)}`);
    }
    throw error;
  }
}

/**
 * Setup step - create PROJECT.md and SCOPE.md
 */
async function runSetup(options, reporter) {
  reporter.updateStep('Reading project settings...');
  
  const settingsPath = path.join(rootDir, 'project-settings.json');
  let settings = {};
  
  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    settings = JSON.parse(content);
  } catch {
    // Default settings
  }
  
  const project = settings.project || {};
  
  // Generate PROJECT.md
  reporter.updateStep('Generating PROJECT.md...');
  
  const projectMd = `# ${project.name || 'Website Project'}

## Overview
${project.description || 'A modern website project built with the Cursor Website Starter Kit.'}

## Client
- **Name**: ${project.client || 'TBD'}
- **Industry**: ${project.industry || 'TBD'}
- **Contact**: ${project.contact || 'TBD'}

## Project Goals
${project.goals || '- Increase online presence\n- Generate leads\n- Showcase services/products'}

## Timeline
- **Start Date**: ${new Date().toISOString().split('T')[0]}
- **Target Launch**: ${project.targetLaunch || 'TBD'}

## Team
- **Project Lead**: ${project.projectLead || 'TBD'}

## Key Links
- Repository: [This repo]
- Staging: TBD
- Production: TBD

---
*Last updated: ${new Date().toISOString()}*
`;

  await fs.writeFile(path.join(rootDir, 'PROJECT.md'), projectMd, 'utf-8');
  reporter.updateStep('✓ PROJECT.md created');
  
  // Generate SCOPE.md
  reporter.updateStep('Generating SCOPE.md...');
  
  const pages = options.pages || ['Homepage', 'About', 'Services', 'Contact'];
  
  const scopeMd = `# Project Scope: ${project.name || 'Website Project'}

## In Scope

### Pages
${pages.map(p => `- [ ] ${p}`).join('\n')}

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
- Technology: HTML/CSS/JS (Tailwind), Elementor handoff

## Success Criteria
- All pages live and functional
- Mobile-responsive
- Lighthouse score > 90
- Client approval on design

---
*Last updated: ${new Date().toISOString()}*
`;

  await fs.writeFile(path.join(rootDir, 'SCOPE.md'), scopeMd, 'utf-8');
  reporter.updateStep('✓ SCOPE.md created');
}

/**
 * Run the content generation step with page filtering
 */
async function runContentGeneration(options, reporter) {
  const args = ['--apply'];
  
  if (options.pages && options.pages.length > 0) {
    // Generate content for each page
    for (const page of options.pages) {
      reporter.updateStep(`Generating content for ${page}...`);
      await runScript(
        path.join(__dirname, 'generate-section-content.mjs'),
        [...args, `--page=${page}`],
        reporter
      );
    }
  } else {
    // Generate content for all pages
    await runScript(path.join(__dirname, 'generate-section-content.mjs'), args, reporter);
  }
}

/**
 * Run the page generation step
 */
async function runPageGeneration(options, reporter) {
  const defaultPages = [
    { name: 'homepage', blueprint: 'homepage', output: 'index' },
    { name: 'about', blueprint: 'about', output: 'about' },
    { name: 'services', blueprint: 'services', output: 'services' },
    { name: 'contact', blueprint: 'contact', output: 'contact' }
  ];
  
  const pagesToGenerate = options.pages 
    ? defaultPages.filter(p => options.pages.includes(p.name) || options.pages.includes(p.output))
    : defaultPages;
  
  for (const page of pagesToGenerate) {
    reporter.updateStep(`Creating ${page.name} page...`);
    
    try {
      await runScript(
        path.join(__dirname, 'generate-page.mjs'),
        [page.output, `--blueprint=${page.blueprint}`],
        reporter
      );
    } catch (error) {
      // Page might already exist, which is fine
      if (!error.message.includes('already exists')) {
        reporter.updateStep(`  Note: ${error.message.split('\n')[0]}`);
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  // Initialize pipeline state
  pipelineState.startTime = Date.now();
  
  const reporter = new ProgressReporter(options.json);
  
  if (!options.json) {
    console.log(`\n${color('═'.repeat(50), colors.cyan)}`);
    console.log(color('  Full Generation Pipeline', colors.bold, colors.cyan));
    console.log(`${color('═'.repeat(50), colors.cyan)}`);
  }
  
  let success = true;
  
  for (const step of STEPS) {
    // Check if step should be skipped
    if (options.skip.includes(step.id)) {
      reporter.skipStep(step, 'user requested');
      continue;
    }
    
    // Check if only running specific step
    if (options.only && options.only !== step.id) {
      reporter.skipStep(step, `only running ${options.only}`);
      continue;
    }
    
    // Track current step for cleanup handling
    pipelineState.currentStep = step.id;
    reporter.startStep(step);
    
    try {
      if (step.id === 'setup') {
        await runSetup(options, reporter);
      } else if (step.id === 'content') {
        await runContentGeneration(options, reporter);
      } else if (step.id === 'pages') {
        await runPageGeneration(options, reporter);
      } else if (step.script) {
        const scriptPath = path.join(__dirname, step.script);
        const args = [...(step.args || [])];
        
        if (options.force && step.id === 'images') {
          args.push('--force');
        }
        
        // Different timeout for image generation (longer)
        const stepTimeout = step.id === 'images' ? 10 * 60 * 1000 : DEFAULT_STEP_TIMEOUT;
        
        try {
          await runScript(scriptPath, args, reporter, { timeout: stepTimeout });
        } catch (error) {
          // Some scripts might not exist yet, handle gracefully
          if (error.message.includes('ENOENT')) {
            reporter.updateStep(`  Script not found: ${step.script}`);
          } else {
            throw error;
          }
        }
      }
      
      // Mark step as completed
      pipelineState.completedSteps.push(step.id);
      pipelineState.currentStep = null;
      reporter.completeStep(step, true);
    } catch (error) {
      reporter.completeStep(step, false);
      pipelineState.currentStep = null;
      
      if (!options.json) {
        console.log(color(`    Error: ${error.message.split('\n')[0]}`, colors.red));
      }
      
      // Continue with other steps even if one fails
      success = false;
    }
  }
  
  reporter.finish(success);
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error(color(`Fatal error: ${error.message}`, colors.red));
  process.exit(1);
});
