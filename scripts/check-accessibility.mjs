#!/usr/bin/env node

/**
 * AI Accessibility Checker
 * Analyzes pages for accessibility issues and provides AI-powered recommendations
 * 
 * Usage:
 *   node scripts/check-accessibility.mjs                    # Check all pages
 *   node scripts/check-accessibility.mjs --page=index       # Check specific page
 *   node scripts/check-accessibility.mjs --level=AAA        # WCAG level (A, AA, AAA)
 *   node scripts/check-accessibility.mjs --fix              # Generate fix suggestions
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import {
  aiComplete,
  parseAIJson,
  readFile,
  writeJson,
  findFiles,
  rootDir,
  ProgressLogger
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WCAG criteria reference
const WCAG_CRITERIA = {
  A: [
    '1.1.1 Non-text Content',
    '1.3.1 Info and Relationships',
    '1.4.1 Use of Color',
    '2.1.1 Keyboard',
    '2.4.1 Bypass Blocks',
    '2.4.2 Page Titled',
    '4.1.1 Parsing',
    '4.1.2 Name, Role, Value'
  ],
  AA: [
    '1.4.3 Contrast (Minimum)',
    '1.4.4 Resize Text',
    '2.4.6 Headings and Labels',
    '2.4.7 Focus Visible',
    '3.1.2 Language of Parts',
    '3.2.3 Consistent Navigation',
    '3.2.4 Consistent Identification'
  ],
  AAA: [
    '1.4.6 Contrast (Enhanced)',
    '2.4.9 Link Purpose',
    '2.4.10 Section Headings',
    '3.1.5 Reading Level'
  ]
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    page: null,
    level: 'AA',
    fix: false,
    format: 'json',
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--page=')) {
      options.page = arg.split('=')[1];
    } else if (arg.startsWith('--level=')) {
      options.level = arg.split('=')[1].toUpperCase();
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg === '--fix' || arg === '-f') {
      options.fix = true;
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
AI Accessibility Checker - Analyze pages for WCAG compliance

Usage:
  node scripts/check-accessibility.mjs [options]

Options:
  --page=NAME       Check specific page only (e.g., index, about)
  --level=LEVEL     WCAG conformance level: A, AA (default), AAA
  --fix, -f         Generate AI-powered fix suggestions
  --format=FORMAT   Output format: json (default), markdown
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Output:
  docs/07-qa/accessibility-report.json (or .md)

Examples:
  npm run ai:check-accessibility                          # Check all pages
  npm run ai:check-accessibility -- --page=index          # Check homepage
  npm run ai:check-accessibility -- --level=AAA           # Strict compliance
  npm run ai:check-accessibility -- --fix                 # Include fix suggestions
`);
}

/**
 * Find HTML pages to check
 */
async function findPages(options) {
  const pagesDir = path.join(rootDir, 'src/pages');
  let files = await findFiles(pagesDir, '.html');
  
  // Filter to specific page if requested
  if (options.page) {
    files = files.filter(f => {
      const name = path.basename(f, '.html');
      return name === options.page || name === 'index' && options.page === 'homepage';
    });
  }
  
  return files;
}

/**
 * Analyze a single page for accessibility issues using AI
 */
async function analyzePage(htmlContent, pageName, options) {
  const wcagLevel = options.level;
  const criteriaToCheck = [
    ...WCAG_CRITERIA.A,
    ...(wcagLevel === 'AA' || wcagLevel === 'AAA' ? WCAG_CRITERIA.AA : []),
    ...(wcagLevel === 'AAA' ? WCAG_CRITERIA.AAA : [])
  ];

  const systemPrompt = `You are an expert accessibility auditor specializing in WCAG compliance.
Your task is to analyze HTML for accessibility issues and provide actionable recommendations.

Key areas to check:
1. Images: alt text, decorative vs informative
2. Headings: proper hierarchy, meaningful text
3. Links: descriptive text, keyboard accessible
4. Forms: labels, error handling, instructions
5. Color: contrast ratios, not sole indicator
6. Keyboard: all functionality accessible
7. Focus: visible focus indicators
8. ARIA: proper usage, not overused
9. Semantic HTML: proper element usage
10. Language: page and content language set

WCAG criteria to check: ${criteriaToCheck.join(', ')}

Output valid JSON only. Be specific about issue locations using element references.`;

  const userPrompt = `Analyze this HTML page for accessibility issues at WCAG ${wcagLevel} level.

PAGE: ${pageName}

HTML CONTENT:
${htmlContent.substring(0, 15000)}

${options.fix ? 'Include specific fix suggestions with corrected code snippets.' : ''}

Output JSON structure:
{
  "page": "${pageName}",
  "wcagLevel": "${wcagLevel}",
  "analyzedAt": "${new Date().toISOString()}",
  "summary": {
    "score": 0-100,
    "critical": 0,
    "major": 0,
    "minor": 0,
    "passed": 0
  },
  "issues": [
    {
      "id": "issue-001",
      "severity": "critical|major|minor",
      "wcagCriteria": "1.1.1",
      "category": "images|headings|links|forms|color|keyboard|focus|aria|semantics|language",
      "element": "Element selector or description",
      "issue": "Clear description of the problem",
      "impact": "How this affects users",
      "recommendation": "How to fix this"${options.fix ? `,
      "fix": {
        "before": "<original code>",
        "after": "<corrected code>"
      }` : ''}
    }
  ],
  "passed": [
    {
      "wcagCriteria": "2.4.2",
      "description": "What passed"
    }
  ],
  "recommendations": {
    "immediate": ["Critical fixes needed now"],
    "shortTerm": ["Important improvements"],
    "longTerm": ["Nice-to-have enhancements"]
  }
}

Be thorough but practical. Focus on issues that actually impact users.`;

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
 * Generate markdown report
 */
function toMarkdown(report) {
  let md = `# Accessibility Report\n\n`;
  md += `**Generated:** ${report.generatedAt}\n`;
  md += `**WCAG Level:** ${report.wcagLevel}\n`;
  md += `**Pages Analyzed:** ${report.pages.length}\n\n`;

  md += `## Overall Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Average Score | ${report.summary.averageScore}/100 |\n`;
  md += `| Critical Issues | ${report.summary.totalCritical} |\n`;
  md += `| Major Issues | ${report.summary.totalMajor} |\n`;
  md += `| Minor Issues | ${report.summary.totalMinor} |\n`;
  md += `| Passed Checks | ${report.summary.totalPassed} |\n\n`;

  for (const page of report.pages) {
    md += `## ${page.page}\n\n`;
    md += `**Score:** ${page.summary.score}/100\n\n`;

    if (page.issues.length > 0) {
      md += `### Issues (${page.issues.length})\n\n`;
      
      for (const issue of page.issues) {
        const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'major' ? '🟠' : '🟡';
        md += `#### ${icon} ${issue.id}: ${issue.wcagCriteria}\n\n`;
        md += `**Severity:** ${issue.severity} | **Category:** ${issue.category}\n\n`;
        md += `**Element:** \`${issue.element}\`\n\n`;
        md += `**Issue:** ${issue.issue}\n\n`;
        md += `**Impact:** ${issue.impact}\n\n`;
        md += `**Recommendation:** ${issue.recommendation}\n\n`;
        
        if (issue.fix) {
          md += `**Fix:**\n`;
          md += `\`\`\`html\n<!-- Before -->\n${issue.fix.before}\n\n<!-- After -->\n${issue.fix.after}\n\`\`\`\n\n`;
        }
        
        md += `---\n\n`;
      }
    }

    if (page.passed.length > 0) {
      md += `### Passed Checks (${page.passed.length})\n\n`;
      for (const pass of page.passed) {
        md += `- ✅ ${pass.wcagCriteria}: ${pass.description}\n`;
      }
      md += '\n';
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

  console.log('\n♿ AI Accessibility Checker\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Find pages to check
  console.log('🔍 Finding pages to analyze...');
  const pages = await findPages(options);
  
  if (pages.length === 0) {
    console.log('⚠️  No pages found to analyze.');
    process.exit(1);
  }
  
  console.log(`   Found ${pages.length} page(s)`);

  // Analyze each page
  console.log(`\n🔄 Analyzing accessibility (WCAG ${options.level})...\n`);
  
  const results = [];
  const progress = new ProgressLogger(pages.length, 'Accessibility analysis');

  for (const pagePath of pages) {
    const pageName = path.relative(path.join(rootDir, 'src/pages'), pagePath);
    
    try {
      const htmlContent = await readFile(pagePath);
      console.log(`   Analyzing ${pageName}...`);
      
      const analysis = await analyzePage(htmlContent, pageName, options);
      results.push(analysis);
      
      const issues = analysis.issues?.length || 0;
      const score = analysis.summary?.score || 0;
      console.log(`   ✅ ${pageName}: Score ${score}/100 (${issues} issues)`);
      
    } catch (error) {
      console.log(`   ❌ ${pageName}: ${error.message}`);
      results.push({
        page: pageName,
        error: error.message,
        summary: { score: 0, critical: 0, major: 0, minor: 0, passed: 0 },
        issues: [],
        passed: []
      });
    }
    
    progress.update(pageName);
  }

  // Generate report
  const report = {
    generatedAt: new Date().toISOString(),
    wcagLevel: options.level,
    includeFixes: options.fix,
    summary: {
      pagesAnalyzed: pages.length,
      averageScore: Math.round(results.reduce((sum, r) => sum + (r.summary?.score || 0), 0) / results.length),
      totalCritical: results.reduce((sum, r) => sum + (r.summary?.critical || 0), 0),
      totalMajor: results.reduce((sum, r) => sum + (r.summary?.major || 0), 0),
      totalMinor: results.reduce((sum, r) => sum + (r.summary?.minor || 0), 0),
      totalPassed: results.reduce((sum, r) => sum + (r.summary?.passed || 0), 0)
    },
    pages: results
  };

  if (!options.dryRun) {
    const outputPath = `docs/07-qa/accessibility-report.${options.format === 'markdown' ? 'md' : 'json'}`;
    
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
  console.log(`   Passed checks: ${report.summary.totalPassed}`);
  
  const passRate = report.summary.totalPassed / (report.summary.totalPassed + report.summary.totalCritical + report.summary.totalMajor + report.summary.totalMinor);
  console.log(`   Pass rate: ${(passRate * 100).toFixed(1)}%`);
  console.log('');

  // Exit with error if critical issues found
  if (report.summary.totalCritical > 0) {
    console.log('⚠️  Critical accessibility issues found. See report for details.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
