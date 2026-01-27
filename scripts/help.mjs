#!/usr/bin/env node

/**
 * Help & Documentation Command
 * Shows all available commands with descriptions
 * 
 * Usage: npm run help
 */

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
  white: '\x1b[37m'
};

function c(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

function printSection(title, commands) {
  console.log('\n' + c(title, colors.bold, colors.cyan));
  console.log(c('─'.repeat(60), colors.dim));
  
  for (const [cmd, desc] of Object.entries(commands)) {
    const paddedCmd = cmd.padEnd(28);
    console.log(`  ${c(paddedCmd, colors.green)}${c(desc, colors.dim)}`);
  }
}

function showHelp() {
  console.log('\n');
  console.log(c('╔════════════════════════════════════════════════════════════╗', colors.cyan));
  console.log(c('║', colors.cyan) + c('     Website Project Starter Kit - Command Reference', colors.bold, colors.white).padStart(50) + c('     ║', colors.cyan));
  console.log(c('╚════════════════════════════════════════════════════════════╝', colors.cyan));

  printSection('🚀 GETTING STARTED', {
    'npm start': 'Interactive menu (recommended first step)',
    'npm run wizard': 'Full setup wizard in browser',
    'npm run wizard:server': 'Start wizard API server only',
    'npm run dev': 'Start development server',
    'npm run dev:watch': 'Watch mode with auto-validation',
    'npm run dev:watch:content': 'Watch content files only',
    'npm run preview': 'Preview production build locally'
  });

  printSection('📝 CONTENT GENERATION', {
    'npm run ai:full-pipeline': 'Run all AI generation (discovery → content → design)',
    'npm run ai:discovery': 'Analyze business context + generate personas',
    'npm run ai:content': 'Generate StoryBrand content for all pages',
    'npm run ai:content:parallel': 'Parallel content generation (3-4x faster)',
    'npm run ai:content:quality': 'Multi-pass refinement with quality scoring',
    'npm run ai:generate-content': 'Generate section content',
    'npm run ai:generate-colors': 'Generate brand colors from context',
    'npm run ai:optimize-headlines': 'Optimize headlines with AI',
    'npm run ai:translate': 'Translate content to other languages'
  });

  printSection('🖼️  IMAGE GENERATION', {
    'npm run assets:generate': 'Generate all AI images',
    'npm run assets:generate:force': 'Force regenerate all images',
    'npm run assets:generate:status': 'Show image generation status',
    'npm run assets:placeholders': 'Generate placeholder images'
  });

  printSection('📄 PAGE GENERATION', {
    'npm run page:generate': 'Generate page from blueprint',
    'npm run theme:apply': 'Apply theme preset',
    'npm run theme:list': 'List available themes'
  });

  printSection('🌐 DEPLOYMENT', {
    'npm run deploy': 'Deploy to Vercel (build + push + deploy)',
    'npm run deploy:preview': 'Deploy preview branch',
    'npm run setup:github': 'Set up GitHub repository',
    'npm run setup:vercel': 'Connect to Vercel',
    'npm run build': 'Build for production'
  });

  printSection('✅ VALIDATION & QA', {
    'npm run validate': 'Run all validation checks',
    'npm run validate:content': 'Validate content only',
    'npm run validate:assets': 'Validate assets only',
    'npm run validate:html': 'Validate HTML only',
    'npm run wizard:check': 'Find gaps in content',
    'npm run ai:qa': 'Run accessibility + SEO + visual QA',
    'npm run ai:check-accessibility': 'Check accessibility issues',
    'npm run ai:visual-qa': 'Visual QA with AI',
    'npm run visual-diff': 'Screenshot comparison tool',
    'npm run visual-diff:baseline': 'Create baseline screenshots',
    'npm run visual-diff:compare': 'Compare against baseline',
    'npm run audit:performance': 'Run performance audit'
  });

  printSection('📦 HANDOFF & EXPORT', {
    'npm run handoff:bundle': 'Generate complete handoff package',
    'npm run handoff:export': 'Export handoff files',
    'npm run handoff:zips': 'Generate asset ZIP files',
    'npm run handoff:screenshots': 'Take page screenshots',
    'npm run content:bundle': 'Export content CSV + Markdown',
    'npm run sitemap:export-all': 'Export all sitemap formats',
    'npm run tokens:export': 'Export design tokens',
    'npm run report': 'Generate project report'
  });

  printSection('⚙️  PROJECT MANAGEMENT', {
    'npm run settings': 'Manage project settings',
    'npm run settings:show': 'Show current settings',
    'npm run settings:test': 'Test API connections',
    'npm run init': 'Initialize project from scratch',
    'npm run progress:scan': 'Scan project progress'
  });

  console.log('\n' + c('─'.repeat(60), colors.dim));
  console.log(c('  QUICK START:', colors.bold, colors.yellow));
  console.log('');
  console.log(c('  1. Run ', colors.dim) + c('npm start', colors.green) + c(' to see the interactive menu', colors.dim));
  console.log(c('  2. Choose "Quick Start Wizard" for guided setup', colors.dim));
  console.log(c('  3. Or run ', colors.dim) + c('npm run wizard', colors.green) + c(' to go directly to the wizard', colors.dim));
  console.log('');
  
  console.log(c('─'.repeat(60), colors.dim));
  console.log(c('  TYPICAL WORKFLOW:', colors.bold, colors.yellow));
  console.log('');
  console.log(c('  New Project:', colors.white));
  console.log(c('    npm start → Quick Start Wizard → Configure → Generate → Deploy', colors.dim));
  console.log('');
  console.log(c('  Make Changes:', colors.white));
  console.log(c('    npm start → Update Project → Edit settings → Regenerate → Deploy', colors.dim));
  console.log('');
  console.log(c('  Quick Deploy:', colors.white));
  console.log(c('    npm run deploy', colors.dim));
  console.log('');
  
  console.log(c('─'.repeat(60), colors.dim));
  console.log(c('  PREREQUISITES:', colors.bold, colors.yellow));
  console.log('');
  console.log(c('  For AI generation:', colors.white));
  console.log(c('    • OpenAI, Anthropic, or Google AI API key', colors.dim));
  console.log(c('    • Configure in wizard or project-settings.local.json', colors.dim));
  console.log('');
  console.log(c('  For deployment:', colors.white));
  console.log(c('    • GitHub CLI (gh) - install: brew install gh', colors.dim));
  console.log(c('    • Vercel CLI - install: npm i -g vercel', colors.dim));
  console.log(c('    • Run: gh auth login && vercel login', colors.dim));
  console.log('');

  console.log(c('═'.repeat(60), colors.cyan));
  console.log('');
}

showHelp();
