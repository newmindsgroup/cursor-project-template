#!/usr/bin/env node
/**
 * Design Validation Script
 * 
 * Validates HTML sections and pages against the design rules defined in
 * src/config/design-rules.json. Ensures proper spacing, padding, and
 * Golden Ratio compliance.
 * 
 * Usage:
 *   node scripts/validate-design.mjs              # Validate all sections
 *   node scripts/validate-design.mjs --fix       # Auto-fix simple issues
 *   node scripts/validate-design.mjs --strict    # Include Golden Ratio checks
 *   node scripts/validate-design.mjs path/to/file.html  # Validate specific file
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'glob';
const { glob } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

// Load design rules
async function loadDesignRules() {
  const rulesPath = path.join(ROOT_DIR, 'src/config/design-rules.json');
  try {
    const content = await fs.readFile(rulesPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}Error loading design rules:${colors.reset}`, error.message);
    // Return default rules if file doesn't exist
    return {
      spacing: {
        section: { combined: 'py-16 md:py-20 lg:py-24' },
        container: { combined: 'px-8 md:px-12 lg:px-16' }
      },
      validation: {
        requiredSectionClasses: ['py-16', 'py-12', 'py-20'],
        requiredContainerClasses: ['px-8', 'px-6'],
        requiredMaxWidthClasses: ['max-w-7xl', 'max-w-6xl', 'max-w-5xl', 'max-w-4xl', 'max-w-3xl'],
        minimumPadding: { horizontal: 32, vertical: 48 }
      }
    };
  }
}

// Validation result structure
function createResult(file) {
  return {
    file,
    status: 'pass',
    checks: {},
    errors: [],
    warnings: []
  };
}

// Check if class list contains any of the required classes
function hasAnyClass(classString, requiredClasses) {
  if (!classString) return false;
  return requiredClasses.some(cls => {
    const regex = new RegExp(`\\b${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(classString);
  });
}

// Extract class attribute from an element tag
function extractClasses(elementHtml) {
  const classMatch = elementHtml.match(/class="([^"]*)"/);
  return classMatch ? classMatch[1] : '';
}

// Find all elements of a type in HTML
function findElements(html, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push({
      element: match[0],
      index: match.index,
      line: html.substring(0, match.index).split('\n').length
    });
  }
  return matches;
}

// Validate section padding
function validateSectionPadding(html, rules, result) {
  const sections = findElements(html, 'section');
  const footers = findElements(html, 'footer');
  const allSections = [...sections, ...footers];
  
  const paddingClasses = rules.validation?.requiredSectionClasses || ['py-16', 'py-12', 'py-20'];
  // Also recognize utility classes that apply padding
  const utilityPaddingClasses = ['section', 'section-sm', 'section-lg', 'gr-section', 'gr-section-sm', 'gr-section-lg'];
  
  for (const section of allSections) {
    const classes = extractClasses(section.element);
    const hasPadding = hasAnyClass(classes, paddingClasses);
    const hasUtilityPadding = utilityPaddingClasses.some(cls => {
      // Match exact class (with word boundaries)
      const regex = new RegExp(`\\b${cls}\\b`);
      return regex.test(classes);
    });
    
    // Special case: hero sections with min-h-screen are OK
    const isHero = classes.includes('min-h-screen') || classes.includes('min-h-[');
    // Special case: header is fixed/sticky
    const isHeader = section.element.includes('data-section="Header"') || classes.includes('fixed');
    // Special case: gradient-overlay sections (like CTA)
    const hasGradientOverlay = classes.includes('gradient-overlay');
    
    if (!hasPadding && !hasUtilityPadding && !isHero && !isHeader && !hasGradientOverlay) {
      result.status = 'fail';
      result.errors.push({
        type: 'missing-section-padding',
        line: section.line,
        message: `Section at line ${section.line} is missing vertical padding. Add one of: ${paddingClasses.join(', ')} or use .section class`,
        element: section.element.substring(0, 100)
      });
    }
  }
  
  result.checks.sectionPadding = {
    status: result.errors.filter(e => e.type === 'missing-section-padding').length === 0 ? 'pass' : 'fail',
    sectionsFound: allSections.length
  };
}

// Validate container padding
function validateContainerPadding(html, rules, result) {
  // Look for max-w-* containers
  const containerRegex = /<div[^>]*class="[^"]*max-w-[^"]*"[^>]*>/gi;
  const matches = [];
  let match;
  while ((match = containerRegex.exec(html)) !== null) {
    matches.push({
      element: match[0],
      index: match.index,
      line: html.substring(0, match.index).split('\n').length
    });
  }
  
  const paddingClasses = rules.validation?.requiredContainerClasses || ['px-8', 'px-6'];
  
  for (const container of matches) {
    const classes = extractClasses(container.element);
    const hasPadding = hasAnyClass(classes, paddingClasses);
    
    // Check for px-4 which is insufficient
    const hasInsufficientPadding = /\bpx-4\b/.test(classes) || /\bpx-2\b/.test(classes);
    
    if (!hasPadding && hasInsufficientPadding) {
      result.status = 'fail';
      result.errors.push({
        type: 'insufficient-container-padding',
        line: container.line,
        message: `Container at line ${container.line} has insufficient horizontal padding. Use px-8 or larger.`,
        element: container.element.substring(0, 100)
      });
    } else if (!hasPadding) {
      result.warnings.push({
        type: 'missing-container-padding',
        line: container.line,
        message: `Container at line ${container.line} may be missing horizontal padding.`,
        element: container.element.substring(0, 100)
      });
    }
  }
  
  result.checks.containerPadding = {
    status: result.errors.filter(e => e.type.includes('container-padding')).length === 0 ? 'pass' : 'fail',
    containersFound: matches.length
  };
}

// Validate max-width presence
function validateMaxWidth(html, rules, result) {
  const sections = findElements(html, 'section');
  const footers = findElements(html, 'footer');
  const allSections = [...sections, ...footers];
  
  const maxWidthClasses = rules.validation?.requiredMaxWidthClasses || ['max-w-7xl', 'max-w-6xl', 'max-w-5xl'];
  
  for (const section of allSections) {
    // Get the section's inner content (first 500 chars after the opening tag)
    const startIndex = section.index;
    const sectionContent = html.substring(startIndex, startIndex + 500);
    
    const hasMaxWidth = maxWidthClasses.some(cls => sectionContent.includes(cls));
    
    // Skip if it's a hero with full-width design
    const classes = extractClasses(section.element);
    const isFullWidth = classes.includes('min-h-screen');
    
    if (!hasMaxWidth && !isFullWidth) {
      result.warnings.push({
        type: 'missing-max-width',
        line: section.line,
        message: `Section at line ${section.line} may be missing a max-width container.`
      });
    }
  }
  
  result.checks.maxWidth = {
    status: 'pass', // Warnings don't fail
    sectionsChecked: allSections.length
  };
}

// Golden Ratio checks (strict mode)
function validateGoldenRatio(html, rules, result) {
  const goldenClasses = [
    'gr-', 'aspect-golden', 'grid-cols-golden',
    'w-gr-', 'gap-gr-', 'py-gr-', 'px-gr-'
  ];
  
  const usesGoldenRatio = goldenClasses.some(cls => html.includes(cls));
  
  result.checks.goldenRatio = {
    status: 'info',
    usesGoldenRatio,
    message: usesGoldenRatio 
      ? 'Section uses Golden Ratio utilities' 
      : 'Consider using Golden Ratio utilities for improved visual harmony'
  };
}

// =============================================================================
// RESPONSIVE VALIDATION
// Ensures proper responsive classes for all breakpoints
// =============================================================================

// Validate responsive section padding (mobile + tablet + desktop)
function validateResponsiveSectionPadding(html, rules, result) {
  const sections = findElements(html, 'section');
  const footers = findElements(html, 'footer');
  const allSections = [...sections, ...footers];
  
  // Utility classes that handle responsive padding internally
  const responsiveUtilityClasses = ['section', 'section-sm', 'section-lg', 'gr-section', 'gr-section-sm', 'gr-section-lg'];
  
  for (const section of allSections) {
    const classes = extractClasses(section.element);
    
    // Skip special cases
    const isHero = classes.includes('min-h-screen') || classes.includes('min-h-[');
    const isHeader = section.element.includes('data-section="Header"') || classes.includes('fixed');
    const hasGradientOverlay = classes.includes('gradient-overlay');
    
    if (isHero || isHeader || hasGradientOverlay) continue;
    
    // Check if using utility class (which handles responsive internally)
    const hasUtilityClass = responsiveUtilityClasses.some(cls => {
      const regex = new RegExp(`\\b${cls}\\b`);
      return regex.test(classes);
    });
    
    if (hasUtilityClass) continue;
    
    // Check for explicit responsive padding classes
    const hasMobilePadding = /\bpy-1[2-9]\b|\bpy-[2-4][0-9]\b/.test(classes);
    const hasTabletPadding = /\bmd:py-/.test(classes);
    const hasDesktopPadding = /\blg:py-/.test(classes);
    
    if (hasMobilePadding && !hasTabletPadding) {
      result.warnings.push({
        type: 'missing-tablet-section-padding',
        line: section.line,
        message: `Section at line ${section.line} has mobile padding but missing tablet variant (md:py-*).`
      });
    }
    
    if (hasMobilePadding && !hasDesktopPadding) {
      result.warnings.push({
        type: 'missing-desktop-section-padding',
        line: section.line,
        message: `Section at line ${section.line} has mobile padding but missing desktop variant (lg:py-*).`
      });
    }
  }
  
  result.checks.responsiveSectionPadding = {
    status: result.warnings.filter(w => w.type.includes('section-padding')).length === 0 ? 'pass' : 'warn',
    sectionsChecked: allSections.length
  };
}

// Validate responsive container padding (mobile + tablet + desktop)
function validateResponsiveContainerPadding(html, rules, result) {
  // Look for max-w-* containers
  const containerRegex = /<div[^>]*class="[^"]*max-w-[^"]*"[^>]*>/gi;
  const matches = [];
  let match;
  while ((match = containerRegex.exec(html)) !== null) {
    matches.push({
      element: match[0],
      index: match.index,
      line: html.substring(0, match.index).split('\n').length
    });
  }
  
  // Utility classes that handle responsive padding internally
  const responsiveUtilityClasses = ['container-custom', 'gr-container'];
  
  for (const container of matches) {
    const classes = extractClasses(container.element);
    
    // Check if using utility class
    const hasUtilityClass = responsiveUtilityClasses.some(cls => classes.includes(cls));
    if (hasUtilityClass) continue;
    
    // Check for explicit responsive padding classes
    const hasMobilePadding = /\bpx-[6-9]\b|\bpx-1[0-6]\b/.test(classes);
    const hasTabletPadding = /\bmd:px-/.test(classes);
    const hasDesktopPadding = /\blg:px-/.test(classes);
    
    if (hasMobilePadding && !hasTabletPadding) {
      result.warnings.push({
        type: 'missing-tablet-container-padding',
        line: container.line,
        message: `Container at line ${container.line} has mobile padding but missing tablet variant (md:px-*).`
      });
    }
    
    if (hasMobilePadding && !hasDesktopPadding) {
      result.warnings.push({
        type: 'missing-desktop-container-padding',
        line: container.line,
        message: `Container at line ${container.line} has mobile padding but missing desktop variant (lg:px-*).`
      });
    }
  }
  
  result.checks.responsiveContainerPadding = {
    status: result.warnings.filter(w => w.type.includes('container-padding')).length === 0 ? 'pass' : 'warn',
    containersChecked: matches.length
  };
}

// Validate responsive grid stacking (should be single column on mobile)
function validateResponsiveGridStacking(html, rules, result) {
  // Find grids with md: or lg: column definitions
  const gridRegex = /<div[^>]*class="[^"]*grid[^"]*(?:md:|lg:)grid-cols-[^"]*"[^>]*>/gi;
  const matches = [];
  let match;
  while ((match = gridRegex.exec(html)) !== null) {
    matches.push({
      element: match[0],
      index: match.index,
      line: html.substring(0, match.index).split('\n').length
    });
  }
  
  for (const grid of matches) {
    const classes = extractClasses(grid.element);
    
    // Check if base is single column (grid-cols-1) or no base (defaults to 1)
    const hasMultiColumnBase = /\bgrid-cols-[2-9]\b/.test(classes) && !/\bmd:grid-cols-|\blg:grid-cols-/.test(classes.split(/\bgrid-cols-[2-9]\b/)[0]);
    
    // More precise check: look for grid-cols-N without md: or lg: prefix at the start
    const classArray = classes.split(/\s+/);
    const hasNonResponsiveMultiColumn = classArray.some(cls => {
      return /^grid-cols-[2-9]$/.test(cls) || /^grid-cols-\d{2}$/.test(cls);
    });
    
    if (hasNonResponsiveMultiColumn) {
      result.warnings.push({
        type: 'non-responsive-grid',
        line: grid.line,
        message: `Grid at line ${grid.line} has multi-column base without mobile-first approach. Consider using grid-cols-1 as base with md:grid-cols-2 or lg:grid-cols-3.`
      });
    }
  }
  
  result.checks.responsiveGrids = {
    status: result.warnings.filter(w => w.type === 'non-responsive-grid').length === 0 ? 'pass' : 'warn',
    gridsChecked: matches.length
  };
}

// Validate responsive typography (headings should scale)
function validateResponsiveTypography(html, rules, result) {
  // Find h1, h2, h3 elements
  const headingRegex = /<(h[1-3])[^>]*class="[^"]*text-[^"]*"[^>]*>/gi;
  const matches = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    matches.push({
      element: match[0],
      tag: match[1],
      index: match.index,
      line: html.substring(0, match.index).split('\n').length
    });
  }
  
  for (const heading of matches) {
    const classes = extractClasses(heading.element);
    
    // Check for responsive text classes
    const hasMobileText = /\btext-[2-7]xl\b/.test(classes);
    const hasTabletText = /\bmd:text-/.test(classes);
    const hasDesktopText = /\blg:text-/.test(classes);
    
    // H1 and H2 should typically have responsive scaling
    if (heading.tag === 'h1' || heading.tag === 'h2') {
      if (hasMobileText && !hasTabletText && !hasDesktopText) {
        result.warnings.push({
          type: 'non-responsive-heading',
          line: heading.line,
          message: `${heading.tag.toUpperCase()} at line ${heading.line} has fixed text size. Consider adding responsive variants (md:text-*, lg:text-*).`
        });
      }
    }
  }
  
  result.checks.responsiveTypography = {
    status: result.warnings.filter(w => w.type === 'non-responsive-heading').length === 0 ? 'pass' : 'warn',
    headingsChecked: matches.length
  };
}

// Validate responsive gap scaling
function validateResponsiveGaps(html, rules, result) {
  // Find grids with gap classes
  const gapRegex = /<div[^>]*class="[^"]*gap-[^"]*"[^>]*>/gi;
  const matches = [];
  let match;
  while ((match = gapRegex.exec(html)) !== null) {
    matches.push({
      element: match[0],
      index: match.index,
      line: html.substring(0, match.index).split('\n').length
    });
  }
  
  for (const element of matches) {
    const classes = extractClasses(element.element);
    
    // Check for gap-8 or larger as base
    const hasLargeGap = /\bgap-[8-9]\b|\bgap-1[0-6]\b/.test(classes);
    const hasResponsiveGap = /\blg:gap-|\bmd:gap-/.test(classes);
    
    // If using gap-8+, suggest adding responsive variant for desktop
    if (hasLargeGap && !hasResponsiveGap) {
      // This is informational, not a warning - gap-8 is fine as-is
      // But lg:gap-12 would be better for desktop
    }
  }
  
  result.checks.responsiveGaps = {
    status: 'pass',
    gapsChecked: matches.length
  };
}

// Main validation function for a single file
async function validateFile(filePath, rules, options = {}) {
  const result = createResult(filePath);
  
  try {
    const html = await fs.readFile(filePath, 'utf-8');
    
    // Run basic validations (always)
    validateSectionPadding(html, rules, result);
    validateContainerPadding(html, rules, result);
    validateMaxWidth(html, rules, result);
    
    // Run responsive validations (with --responsive or --strict)
    if (options.responsive || options.strict) {
      validateResponsiveSectionPadding(html, rules, result);
      validateResponsiveContainerPadding(html, rules, result);
      validateResponsiveGridStacking(html, rules, result);
      validateResponsiveTypography(html, rules, result);
      validateResponsiveGaps(html, rules, result);
    }
    
    // Run Golden Ratio checks (with --strict only)
    if (options.strict) {
      validateGoldenRatio(html, rules, result);
    }
    
  } catch (error) {
    result.status = 'error';
    result.errors.push({
      type: 'file-error',
      message: error.message
    });
  }
  
  return result;
}

// Format and print results
function printResults(results, options = {}) {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}Design Validation Results${colors.reset}`);
  console.log('='.repeat(60) + '\n');
  
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;
  
  for (const result of results) {
    const relativePath = path.relative(ROOT_DIR, result.file);
    const statusIcon = result.status === 'pass' ? '✓' : '✗';
    const statusColor = result.status === 'pass' ? colors.green : colors.red;
    
    console.log(`${statusColor}${statusIcon}${colors.reset} ${relativePath}`);
    
    if (result.status === 'pass') {
      passCount++;
    } else {
      failCount++;
    }
    
    // Print errors
    for (const error of result.errors) {
      console.log(`  ${colors.red}ERROR${colors.reset} [Line ${error.line || '?'}]: ${error.message}`);
    }
    
    // Print warnings (if verbose)
    if (options.verbose) {
      for (const warning of result.warnings) {
        console.log(`  ${colors.yellow}WARN${colors.reset} [Line ${warning.line || '?'}]: ${warning.message}`);
        warningCount++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '-'.repeat(60));
  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`  ${colors.green}Passed:${colors.reset} ${passCount}`);
  console.log(`  ${colors.red}Failed:${colors.reset} ${failCount}`);
  if (options.verbose) {
    console.log(`  ${colors.yellow}Warnings:${colors.reset} ${warningCount}`);
  }
  console.log('-'.repeat(60) + '\n');
  
  return failCount === 0;
}

// Export results as JSON
async function exportResults(results, outputPath) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status !== 'pass').length
    },
    results
  };
  
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
  console.log(`${colors.dim}Report saved to: ${outputPath}${colors.reset}`);
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    strict: args.includes('--strict'),
    responsive: args.includes('--responsive') || args.includes('-r'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    json: args.includes('--json'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  // Filter out flags to get file paths
  const fileArgs = args.filter(arg => !arg.startsWith('-'));
  
  if (options.help) {
    console.log(`
${colors.cyan}Design Validation Script${colors.reset}

Usage:
  node scripts/validate-design.mjs [options] [files...]

Options:
  --responsive, -r  Check for responsive breakpoint classes (md:*, lg:*)
  --strict          Include Golden Ratio checks AND responsive validation
  --verbose, -v     Show warnings in addition to errors
  --json            Output results as JSON to validation-report.json
  --help, -h        Show this help message

Responsive Checks (with --responsive or --strict):
  - Section padding: py-* md:py-* lg:py-*
  - Container padding: px-* md:px-* lg:px-*
  - Grid stacking: grid-cols-1 as base (mobile-first)
  - Typography scaling: text-* md:text-* lg:text-*

Examples:
  node scripts/validate-design.mjs                     # Basic validation
  node scripts/validate-design.mjs --responsive        # With responsive checks
  node scripts/validate-design.mjs --strict --verbose  # Full validation with warnings
  node scripts/validate-design.mjs src/sections/Footer.html  # Specific file
`);
    process.exit(0);
  }
  
  console.log(`${colors.cyan}Loading design rules...${colors.reset}`);
  const rules = await loadDesignRules();
  
  // Determine files to validate
  let files;
  if (fileArgs.length > 0) {
    files = fileArgs.map(f => path.resolve(f));
  } else {
    // Default: validate all sections
    const sectionsDir = path.join(ROOT_DIR, 'src/sections');
    try {
      files = await glob(`${sectionsDir}/*.html`);
      if (!Array.isArray(files)) {
        // Fallback: read directory manually
        const entries = await fs.readdir(sectionsDir);
        files = entries
          .filter(f => f.endsWith('.html'))
          .map(f => path.join(sectionsDir, f));
      }
    } catch (error) {
      // Fallback: read directory manually
      const entries = await fs.readdir(sectionsDir);
      files = entries
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(sectionsDir, f));
    }
  }
  
  console.log(`${colors.cyan}Validating ${files.length} file(s)...${colors.reset}\n`);
  
  // Validate each file
  const results = [];
  for (const file of files) {
    const result = await validateFile(file, rules, options);
    results.push(result);
  }
  
  // Print results
  const allPassed = printResults(results, options);
  
  // Export JSON if requested
  if (options.json) {
    await exportResults(results, path.join(ROOT_DIR, 'validation-report.json'));
  }
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
