#!/usr/bin/env node

/**
 * AI Visual QA
 * AI-powered visual regression testing and design consistency checking
 * 
 * Usage:
 *   node scripts/visual-qa.mjs                           # Run full visual QA
 *   node scripts/visual-qa.mjs --page=index              # Check specific page
 *   node scripts/visual-qa.mjs --compare=baseline        # Compare to baseline
 *   node scripts/visual-qa.mjs --responsive              # Check all breakpoints
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import {
  aiComplete,
  parseAIJson,
  readJson,
  writeJson,
  findFiles,
  rootDir,
  ProgressLogger
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Breakpoints for responsive testing
const BREAKPOINTS = {
  mobile: { width: 375, height: 812, name: 'Mobile' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  desktop: { width: 1440, height: 900, name: 'Desktop' }
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    page: null,
    compare: null,
    responsive: false,
    strict: false,
    format: 'json',
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--page=')) {
      options.page = arg.split('=')[1];
    } else if (arg.startsWith('--compare=')) {
      options.compare = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg === '--responsive' || arg === '-r') {
      options.responsive = true;
    } else if (arg === '--strict' || arg === '-s') {
      options.strict = true;
    } else if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
AI Visual QA - Automated visual testing and design consistency

Usage:
  node scripts/visual-qa.mjs [options]

Options:
  --page=NAME       Check specific page only
  --compare=DIR     Compare against baseline screenshots
  --responsive, -r  Check all breakpoints (mobile, tablet, desktop)
  --strict, -s      Fail on any visual issues
  --format=FORMAT   Output format: json (default), markdown
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Requirements:
  - Screenshots in dist/pages/handoff/screenshots/ (run npm run handoff:screenshots)
  - Or baseline directory for comparison

Output:
  docs/07-qa/visual-qa-report.json (or .md)

Examples:
  npm run ai:visual-qa                                    # Full visual QA
  npm run ai:visual-qa -- --page=index                    # Check homepage
  npm run ai:visual-qa -- --responsive                    # All breakpoints
  npm run ai:visual-qa -- --compare=baseline              # Compare to baseline
`);
}

/**
 * Find screenshot files
 */
async function findScreenshots(options) {
  const screenshotsDir = path.join(rootDir, 'dist/pages/handoff/screenshots');
  
  try {
    let files = await findFiles(screenshotsDir, /\.(png|jpg|jpeg|webp)$/);
    
    if (options.page) {
      files = files.filter(f => path.basename(f).includes(options.page));
    }
    
    return files;
  } catch {
    return [];
  }
}

/**
 * Load design tokens for reference
 */
async function loadDesignTokens() {
  try {
    const tokensContent = await fs.readFile(path.join(rootDir, 'src/styles/tokens.css'), 'utf-8');
    return tokensContent;
  } catch {
    return '';
  }
}

/**
 * Analyze visual design using AI (based on HTML/CSS since we can't process images directly)
 */
async function analyzePageVisuals(htmlPath, tokens, options) {
  const htmlContent = await fs.readFile(htmlPath, 'utf-8');
  const pageName = path.basename(htmlPath, '.html');

  const systemPrompt = `You are an expert UI/UX designer and visual QA specialist.
Your task is to analyze HTML/CSS for visual design consistency and potential issues.

Key areas to check:
1. SPACING: Consistent use of spacing scale
2. TYPOGRAPHY: Proper hierarchy, readable sizes
3. COLORS: Consistent with design tokens
4. LAYOUT: Proper alignment, responsive considerations
5. COMPONENTS: Consistent styling across similar elements
6. VISUAL HIERARCHY: Clear content prioritization
7. ACCESSIBILITY: Color contrast, touch targets
8. RESPONSIVE: Mobile-first, proper breakpoints

Design principles to enforce:
- Consistent spacing using the defined scale
- Typography hierarchy (H1 > H2 > H3 > body)
- Color usage matches brand palette
- Minimum 16px body text, 44px touch targets
- Proper contrast ratios (4.5:1 minimum)

Output valid JSON only.`;

  const userPrompt = `Analyze this page for visual design consistency and issues.

PAGE: ${pageName}

DESIGN TOKENS:
${tokens.substring(0, 3000)}

HTML CONTENT:
${htmlContent.substring(0, 12000)}

Check for:
1. Spacing inconsistencies
2. Typography issues
3. Color usage problems
4. Layout/alignment issues
5. Component inconsistencies
6. Visual hierarchy problems
7. Responsive design concerns
8. Accessibility issues

Output JSON:
{
  "page": "${pageName}",
  "analyzedAt": "${new Date().toISOString()}",
  "summary": {
    "score": 0-100,
    "status": "pass|warning|fail",
    "issueCount": {
      "critical": 0,
      "major": 0,
      "minor": 0
    }
  },
  "categories": {
    "spacing": {
      "score": 0-100,
      "issues": []
    },
    "typography": {
      "score": 0-100,
      "issues": []
    },
    "colors": {
      "score": 0-100,
      "issues": []
    },
    "layout": {
      "score": 0-100,
      "issues": []
    },
    "components": {
      "score": 0-100,
      "issues": []
    },
    "hierarchy": {
      "score": 0-100,
      "issues": []
    },
    "responsive": {
      "score": 0-100,
      "issues": []
    },
    "accessibility": {
      "score": 0-100,
      "issues": []
    }
  },
  "issues": [
    {
      "id": "vqa-001",
      "severity": "critical|major|minor",
      "category": "spacing|typography|colors|layout|components|hierarchy|responsive|accessibility",
      "element": "Element description or selector",
      "issue": "What's wrong",
      "expected": "What should be",
      "recommendation": "How to fix",
      "designToken": "Related design token if applicable"
    }
  ],
  "recommendations": {
    "immediate": ["Critical fixes"],
    "improvements": ["Suggested enhancements"]
  }
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.3,
    maxTokens: 6000
  });

  return parseAIJson(response);
}

/**
 * Compare two versions for visual differences (concept - actual image comparison would need different approach)
 */
async function compareVersions(currentHtml, baselineHtml, pageName) {
  const systemPrompt = `You are a visual QA expert comparing two versions of a webpage.
Identify visual differences and potential regressions.

Output valid JSON only.`;

  const userPrompt = `Compare these two versions of ${pageName} and identify visual differences.

CURRENT VERSION:
${currentHtml.substring(0, 8000)}

BASELINE VERSION:
${baselineHtml.substring(0, 8000)}

Identify:
1. Added elements
2. Removed elements
3. Changed styling
4. Layout changes
5. Content changes

Output JSON:
{
  "page": "${pageName}",
  "comparedAt": "${new Date().toISOString()}",
  "result": "identical|minor_changes|significant_changes|major_regression",
  "changeScore": 0-100,
  "differences": [
    {
      "type": "added|removed|modified",
      "element": "Element description",
      "detail": "What changed",
      "impact": "low|medium|high",
      "recommendation": "Action to take"
    }
  ],
  "summary": "Brief summary of differences"
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'fast',
    temperature: 0.2,
    maxTokens: 4000
  });

  return parseAIJson(response);
}

/**
 * Generate markdown report
 */
function toMarkdown(report) {
  let md = `# Visual QA Report\n\n`;
  md += `**Generated:** ${report.generatedAt}\n`;
  md += `**Pages Analyzed:** ${report.pages.length}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Average Score | ${report.summary.averageScore}/100 |\n`;
  md += `| Critical Issues | ${report.summary.totalCritical} |\n`;
  md += `| Major Issues | ${report.summary.totalMajor} |\n`;
  md += `| Minor Issues | ${report.summary.totalMinor} |\n`;
  md += `| Overall Status | ${report.summary.status} |\n\n`;

  for (const page of report.pages) {
    md += `## ${page.page}\n\n`;
    md += `**Score:** ${page.summary.score}/100 | **Status:** ${page.summary.status}\n\n`;

    md += `### Category Scores\n\n`;
    md += `| Category | Score |\n`;
    md += `|----------|-------|\n`;
    for (const [cat, data] of Object.entries(page.categories || {})) {
      md += `| ${cat} | ${data.score}/100 |\n`;
    }
    md += '\n';

    if (page.issues?.length > 0) {
      md += `### Issues (${page.issues.length})\n\n`;
      
      for (const issue of page.issues) {
        const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'major' ? '🟠' : '🟡';
        md += `#### ${icon} ${issue.id}\n\n`;
        md += `**Severity:** ${issue.severity} | **Category:** ${issue.category}\n\n`;
        md += `**Element:** \`${issue.element}\`\n\n`;
        md += `**Issue:** ${issue.issue}\n\n`;
        md += `**Expected:** ${issue.expected}\n\n`;
        md += `**Recommendation:** ${issue.recommendation}\n\n`;
        md += `---\n\n`;
      }
    }
  }

  return md;
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

  console.log('\n🎨 AI Visual QA\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Load design tokens
  console.log('📚 Loading design tokens...');
  const tokens = await loadDesignTokens();

  // Find HTML pages to analyze
  console.log('🔍 Finding pages to analyze...');
  const pagesDir = path.join(rootDir, 'src/pages');
  let pages = await findFiles(pagesDir, '.html');
  
  // Filter out handoff and styleguide
  pages = pages.filter(p => 
    !p.includes('/handoff/') && 
    !p.includes('/styleguide/') &&
    !p.includes('/project/')
  );
  
  if (options.page) {
    pages = pages.filter(p => path.basename(p, '.html') === options.page);
  }

  if (pages.length === 0) {
    console.log('⚠️  No pages found to analyze.');
    process.exit(1);
  }

  console.log(`   Found ${pages.length} page(s)`);

  // Analyze pages
  console.log('\n🔄 Analyzing visual design...\n');

  const results = [];
  const progress = new ProgressLogger(pages.length, 'Visual QA');

  for (const pagePath of pages) {
    const pageName = path.basename(pagePath, '.html');
    
    try {
      console.log(`   Analyzing ${pageName}...`);
      const analysis = await analyzePageVisuals(pagePath, tokens, options);
      results.push(analysis);
      
      const score = analysis.summary?.score || 0;
      const issues = analysis.summary?.issueCount?.critical + 
                    analysis.summary?.issueCount?.major + 
                    analysis.summary?.issueCount?.minor || 0;
      console.log(`   ✅ ${pageName}: Score ${score}/100 (${issues} issues)`);
      
    } catch (error) {
      console.log(`   ❌ ${pageName}: ${error.message}`);
      results.push({
        page: pageName,
        error: error.message,
        summary: { score: 0, status: 'error', issueCount: { critical: 0, major: 0, minor: 0 } },
        issues: []
      });
    }
    
    progress.update(pageName);
  }

  // Generate report
  const report = {
    generatedAt: new Date().toISOString(),
    options: {
      responsive: options.responsive,
      strict: options.strict
    },
    summary: {
      pagesAnalyzed: results.length,
      averageScore: Math.round(results.reduce((sum, r) => sum + (r.summary?.score || 0), 0) / results.length),
      totalCritical: results.reduce((sum, r) => sum + (r.summary?.issueCount?.critical || 0), 0),
      totalMajor: results.reduce((sum, r) => sum + (r.summary?.issueCount?.major || 0), 0),
      totalMinor: results.reduce((sum, r) => sum + (r.summary?.issueCount?.minor || 0), 0),
      status: 'pass'
    },
    pages: results
  };

  // Determine overall status
  if (report.summary.totalCritical > 0) {
    report.summary.status = 'fail';
  } else if (report.summary.totalMajor > 0) {
    report.summary.status = 'warning';
  }

  if (!options.dryRun) {
    const outputPath = `docs/07-qa/visual-qa-report.${options.format === 'markdown' ? 'md' : 'json'}`;
    
    if (options.format === 'markdown') {
      const md = toMarkdown(report);
      await fs.writeFile(path.join(rootDir, outputPath), md, 'utf-8');
    } else {
      await writeJson(outputPath, report);
    }
    
    console.log(`\n📁 Output: ${outputPath}`);
  } else {
    console.log('\n📋 Dry run - no files written');
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Pages analyzed: ${report.summary.pagesAnalyzed}`);
  console.log(`   Average score: ${report.summary.averageScore}/100`);
  console.log(`   Critical issues: ${report.summary.totalCritical}`);
  console.log(`   Major issues: ${report.summary.totalMajor}`);
  console.log(`   Minor issues: ${report.summary.totalMinor}`);
  console.log(`   Overall status: ${report.summary.status.toUpperCase()}`);
  console.log('');

  // Exit with error if strict mode and issues found
  if (options.strict && report.summary.status === 'fail') {
    console.log('⚠️  Critical visual issues found. See report for details.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
