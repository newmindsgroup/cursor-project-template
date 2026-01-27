#!/usr/bin/env node
/**
 * Design Linting Script
 * 
 * Fast linting for design rule compliance. Designed to run in CI/CD
 * pipelines and pre-commit hooks.
 * 
 * Usage:
 *   node scripts/lint-design.mjs              # Lint all sections
 *   node scripts/lint-design.mjs --staged     # Lint only staged files (for pre-commit)
 *   node scripts/lint-design.mjs --fix        # Auto-fix simple issues (experimental)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'glob';
const { glob } = pkg;
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

// ANSI colors
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

// Lint rules
const RULES = {
  'no-edge-touching': {
    description: 'Content must have padding from viewport edges',
    severity: 'error',
    check: (html, file) => {
      const errors = [];
      
      // Check for containers without horizontal padding
      const containerRegex = /<div[^>]*class="[^"]*max-w-[^"]*"[^>]*>/gi;
      let match;
      while ((match = containerRegex.exec(html)) !== null) {
        const classes = match[0].match(/class="([^"]*)"/)?.[1] || '';
        const hasPadding = /px-[6-9]|px-1[0-6]|md:px-|lg:px-/.test(classes);
        const hasInsufficientPadding = /\bpx-[1-4]\b/.test(classes) && !/md:px-|lg:px-/.test(classes);
        
        if (hasInsufficientPadding) {
          const line = html.substring(0, match.index).split('\n').length;
          errors.push({
            line,
            message: 'Container has insufficient horizontal padding (< px-6). Use px-8 or larger.',
            rule: 'no-edge-touching'
          });
        }
      }
      
      return errors;
    }
  },
  
  'require-section-padding': {
    description: 'Sections must have vertical padding',
    severity: 'error',
    check: (html, file) => {
      const errors = [];
      const sectionRegex = /<(section|footer)[^>]*>/gi;
      let match;
      
      // Utility classes that provide padding
      const utilityPaddingClasses = ['section', 'section-sm', 'section-lg', 'gr-section', 'gr-section-sm', 'gr-section-lg'];
      
      while ((match = sectionRegex.exec(html)) !== null) {
        const element = match[0];
        const tagName = match[1].toLowerCase();
        const classes = element.match(/class="([^"]*)"/)?.[1] || '';
        
        // Skip headers (they're fixed)
        if (element.includes('data-section="Header"') || classes.includes('fixed')) {
          continue;
        }
        
        // Skip heroes with min-h-screen
        if (classes.includes('min-h-screen') || classes.includes('min-h-[')) {
          continue;
        }
        
        // Skip gradient-overlay sections (like CTA)
        if (classes.includes('gradient-overlay')) {
          continue;
        }
        
        // Check for vertical padding (direct classes)
        const hasPadding = /py-1[2-9]|py-[2-4][0-9]/.test(classes);
        
        // Check for utility classes that provide padding
        const hasUtilityPadding = utilityPaddingClasses.some(cls => {
          const regex = new RegExp(`\\b${cls}\\b`);
          return regex.test(classes);
        });
        
        if (!hasPadding && !hasUtilityPadding) {
          const line = html.substring(0, match.index).split('\n').length;
          errors.push({
            line,
            message: `<${tagName}> is missing vertical padding. Add py-16 or .section class.`,
            rule: 'require-section-padding'
          });
        }
      }
      
      return errors;
    }
  },
  
  'require-max-width': {
    description: 'Content containers should have max-width constraint',
    severity: 'warning',
    check: (html, file) => {
      const warnings = [];
      const sectionRegex = /<(section|footer)[^>]*>([\s\S]*?)(?=<\/\1>)/gi;
      let match;
      
      while ((match = sectionRegex.exec(html)) !== null) {
        const sectionContent = match[2].substring(0, 500);
        const hasMaxWidth = /max-w-/.test(sectionContent);
        
        if (!hasMaxWidth) {
          const line = html.substring(0, match.index).split('\n').length;
          warnings.push({
            line,
            message: 'Section may be missing a max-width container (max-w-7xl recommended).',
            rule: 'require-max-width'
          });
        }
      }
      
      return warnings;
    }
  },
  
  'consistent-gaps': {
    description: 'Grid gaps should be at least gap-8',
    severity: 'warning',
    check: (html, file) => {
      const warnings = [];
      const gapRegex = /\bgap-[1-6]\b/g;
      let match;
      
      while ((match = gapRegex.exec(html)) !== null) {
        // Check if it's followed by responsive larger gap
        const context = html.substring(match.index, match.index + 50);
        const hasResponsiveGap = /lg:gap-|md:gap-/.test(context);
        
        if (!hasResponsiveGap) {
          const line = html.substring(0, match.index).split('\n').length;
          warnings.push({
            line,
            message: `Small gap (${match[0]}) found. Consider using gap-8 or adding responsive gap.`,
            rule: 'consistent-gaps'
          });
        }
      }
      
      return warnings;
    }
  }
};

// Lint a single file
async function lintFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const result = {
    file: relativePath,
    errors: [],
    warnings: []
  };
  
  try {
    const html = await fs.readFile(filePath, 'utf-8');
    
    for (const [ruleName, rule] of Object.entries(RULES)) {
      const issues = rule.check(html, filePath);
      
      for (const issue of issues) {
        if (rule.severity === 'error') {
          result.errors.push(issue);
        } else {
          result.warnings.push(issue);
        }
      }
    }
  } catch (error) {
    result.errors.push({
      line: 0,
      message: `Failed to read file: ${error.message}`,
      rule: 'file-error'
    });
  }
  
  return result;
}

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      cwd: ROOT_DIR
    });
    
    return output
      .split('\n')
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(ROOT_DIR, f));
  } catch {
    return [];
  }
}

// Print results
function printResults(results) {
  let totalErrors = 0;
  let totalWarnings = 0;
  
  console.log('\n' + '─'.repeat(60));
  console.log(`${c.bold}${c.blue}Design Lint Results${c.reset}`);
  console.log('─'.repeat(60) + '\n');
  
  for (const result of results) {
    if (result.errors.length === 0 && result.warnings.length === 0) {
      continue; // Skip clean files
    }
    
    console.log(`${c.bold}${result.file}${c.reset}`);
    
    for (const error of result.errors) {
      totalErrors++;
      console.log(`  ${c.red}✗${c.reset} Line ${error.line}: ${error.message}`);
      console.log(`    ${c.dim}Rule: ${error.rule}${c.reset}`);
    }
    
    for (const warning of result.warnings) {
      totalWarnings++;
      console.log(`  ${c.yellow}⚠${c.reset} Line ${warning.line}: ${warning.message}`);
      console.log(`    ${c.dim}Rule: ${warning.rule}${c.reset}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('─'.repeat(60));
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`${c.green}✓ All files pass design lint${c.reset}`);
  } else {
    console.log(`${c.red}Errors: ${totalErrors}${c.reset}  ${c.yellow}Warnings: ${totalWarnings}${c.reset}`);
  }
  console.log('─'.repeat(60) + '\n');
  
  return totalErrors === 0;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const options = {
    staged: args.includes('--staged'),
    fix: args.includes('--fix'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    console.log(`
${c.bold}Design Lint${c.reset}

Usage:
  node scripts/lint-design.mjs [options] [files...]

Options:
  --staged    Lint only git staged HTML files (for pre-commit)
  --help      Show this help

Rules:
${Object.entries(RULES).map(([name, rule]) => 
  `  ${c.bold}${name}${c.reset} (${rule.severity})\n    ${rule.description}`
).join('\n\n')}
`);
    process.exit(0);
  }
  
  // Determine files to lint
  let files;
  const fileArgs = args.filter(arg => !arg.startsWith('-'));
  
  if (fileArgs.length > 0) {
    files = fileArgs.map(f => path.resolve(f));
  } else if (options.staged) {
    files = getStagedFiles();
    if (files.length === 0) {
      console.log(`${c.dim}No staged HTML files to lint${c.reset}`);
      process.exit(0);
    }
  } else {
    // Default: lint all sections and pages
    const sectionsDir = path.join(ROOT_DIR, 'src/sections');
    try {
      files = await glob(path.join(sectionsDir, '*.html'));
      if (!Array.isArray(files)) {
        const entries = await fs.readdir(sectionsDir);
        files = entries
          .filter(f => f.endsWith('.html'))
          .map(f => path.join(sectionsDir, f));
      }
    } catch (error) {
      const entries = await fs.readdir(sectionsDir);
      files = entries
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(sectionsDir, f));
    }
  }
  
  console.log(`${c.dim}Linting ${files.length} file(s)...${c.reset}`);
  
  // Lint files
  const results = await Promise.all(files.map(lintFile));
  
  // Print and exit
  const passed = printResults(results);
  process.exit(passed ? 0 : 1);
}

main().catch(error => {
  console.error(`${c.red}Fatal error:${c.reset}`, error);
  process.exit(1);
});
