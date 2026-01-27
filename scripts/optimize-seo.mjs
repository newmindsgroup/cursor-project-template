#!/usr/bin/env node

/**
 * AI SEO Optimizer
 * AI-powered SEO analysis with keyword suggestions and schema generation
 * 
 * Usage:
 *   node scripts/optimize-seo.mjs                          # Full SEO analysis
 *   node scripts/optimize-seo.mjs --page=index             # Specific page
 *   node scripts/optimize-seo.mjs --keywords               # Generate keyword suggestions
 *   node scripts/optimize-seo.mjs --schema                 # Generate schema markup
 *   node scripts/optimize-seo.mjs --fix                    # Generate fix suggestions
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import {
  aiComplete,
  parseAIJson,
  readJson,
  writeJson,
  readFile,
  findFiles,
  rootDir,
  ProgressLogger
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    page: null,
    keywords: false,
    schema: false,
    fix: false,
    format: 'json',
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--page=')) {
      options.page = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg === '--keywords' || arg === '-k') {
      options.keywords = true;
    } else if (arg === '--schema' || arg === '-s') {
      options.schema = true;
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
AI SEO Optimizer - AI-powered SEO analysis and optimization

Usage:
  node scripts/optimize-seo.mjs [options]

Options:
  --page=NAME       Analyze specific page only
  --keywords, -k    Generate keyword suggestions
  --schema, -s      Generate schema.org markup
  --fix, -f         Generate fix suggestions with code
  --format=FORMAT   Output format: json (default), markdown
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Analysis Areas:
  - Meta tags (title, description, og tags)
  - Heading hierarchy
  - Image alt text
  - Internal/external links
  - Content quality
  - Keyword optimization
  - Schema markup
  - Mobile friendliness

Output:
  docs/07-qa/seo-report.json (or .md)

Examples:
  npm run ai:optimize-seo                             # Full analysis
  npm run ai:optimize-seo -- --page=index             # Homepage only
  npm run ai:optimize-seo -- --keywords               # Keyword suggestions
  npm run ai:optimize-seo -- --schema                 # Generate schema
`);
}

/**
 * Load business context for keyword context
 */
async function loadBusinessContext() {
  const context = {
    business: null,
    industry: null,
    keywords: []
  };

  try {
    const analysis = await readJson('src/data/business-analysis.json');
    context.business = analysis.summary?.businessName;
    context.industry = analysis.summary?.industry;
    context.keywords = [
      ...(analysis.valueProposition?.supporting || []),
      ...(analysis.differentiation?.supporting || [])
    ];
  } catch {
    // No business analysis
  }

  return context;
}

/**
 * Analyze page SEO using AI
 */
async function analyzePageSEO(htmlContent, pageName, businessContext, options) {
  const systemPrompt = `You are an expert SEO specialist with deep knowledge of search engine algorithms and best practices.

Analyze pages for:
1. META TAGS: Title (50-60 chars), description (150-160 chars), OG tags
2. HEADINGS: Proper H1-H6 hierarchy, keyword inclusion
3. CONTENT: Keyword density, readability, length
4. IMAGES: Alt text, file names, lazy loading
5. LINKS: Internal linking, anchor text, broken links
6. TECHNICAL: Canonical, robots, structured data
7. MOBILE: Viewport, tap targets, responsive
8. PERFORMANCE: Impact on Core Web Vitals

Scoring (0-100):
- 90-100: Excellent - well optimized
- 70-89: Good - minor improvements needed
- 50-69: Fair - significant improvements needed
- 0-49: Poor - major issues to address

Output valid JSON only.`;

  const userPrompt = `Analyze this page for SEO optimization opportunities.

PAGE: ${pageName}
${businessContext.business ? `BUSINESS: ${businessContext.business}` : ''}
${businessContext.industry ? `INDUSTRY: ${businessContext.industry}` : ''}
${businessContext.keywords?.length > 0 ? `TARGET KEYWORDS: ${businessContext.keywords.slice(0, 5).join(', ')}` : ''}

HTML CONTENT:
${htmlContent.substring(0, 15000)}

${options.fix ? 'Include specific fix suggestions with corrected HTML/content.' : ''}
${options.keywords ? 'Include detailed keyword recommendations.' : ''}
${options.schema ? 'Include recommended schema.org markup.' : ''}

Output JSON structure:
{
  "page": "${pageName}",
  "analyzedAt": "${new Date().toISOString()}",
  "summary": {
    "score": 0-100,
    "status": "excellent|good|fair|poor",
    "issueCount": {
      "critical": 0,
      "major": 0,
      "minor": 0
    }
  },
  "meta": {
    "title": {
      "current": "Current title",
      "length": 0,
      "score": 0-100,
      "issues": ["Issues found"],
      "suggestion": "Improved title"
    },
    "description": {
      "current": "Current description",
      "length": 0,
      "score": 0-100,
      "issues": ["Issues found"],
      "suggestion": "Improved description"
    },
    "ogTags": {
      "present": ["og:title", "og:description"],
      "missing": ["og:image"],
      "score": 0-100
    }
  },
  "headings": {
    "structure": {
      "h1Count": 0,
      "hierarchy": ["H1", "H2", "H2", "H3"],
      "issues": ["Issues with structure"]
    },
    "score": 0-100
  },
  "content": {
    "wordCount": 0,
    "readabilityScore": 0-100,
    "keywordDensity": {},
    "issues": ["Content issues"],
    "score": 0-100
  },
  "images": {
    "total": 0,
    "withAlt": 0,
    "withoutAlt": 0,
    "issues": ["Image issues"],
    "score": 0-100
  },
  "links": {
    "internal": 0,
    "external": 0,
    "issues": ["Link issues"],
    "score": 0-100
  },
  "technical": {
    "canonical": "present|missing",
    "robots": "present|missing",
    "viewport": "present|missing",
    "issues": ["Technical issues"],
    "score": 0-100
  },
  "issues": [
    {
      "id": "seo-001",
      "severity": "critical|major|minor",
      "category": "meta|headings|content|images|links|technical",
      "issue": "Description of issue",
      "impact": "How this affects SEO",
      "recommendation": "How to fix"${options.fix ? `,
      "fix": {
        "before": "<original>",
        "after": "<corrected>"
      }` : ''}
    }
  ]${options.keywords ? `,
  "keywords": {
    "primary": ["Top 3 target keywords"],
    "secondary": ["5-10 supporting keywords"],
    "longTail": ["Long-tail keyword opportunities"],
    "competitors": ["Keywords competitors rank for"],
    "content": ["Keywords to add to content"]
  }` : ''}${options.schema ? `,
  "schema": {
    "recommended": ["Organization", "WebPage", "BreadcrumbList"],
    "markup": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Page name",
      "description": "Page description"
    }
  }` : ''},
  "recommendations": {
    "immediate": ["Quick wins"],
    "shortTerm": ["Important improvements"],
    "longTerm": ["Strategic improvements"]
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
 * Generate schema markup for a page
 */
async function generateSchema(htmlContent, pageName, businessContext) {
  const systemPrompt = `You are an expert in structured data and schema.org markup.
Generate appropriate schema markup for web pages.

Output valid JSON only.`;

  const userPrompt = `Generate schema.org markup for this page.

PAGE: ${pageName}
BUSINESS: ${businessContext.business || 'Unknown'}
INDUSTRY: ${businessContext.industry || 'General'}

HTML CONTENT (excerpt):
${htmlContent.substring(0, 5000)}

Generate comprehensive schema including:
1. Organization schema (if homepage)
2. WebPage schema
3. BreadcrumbList schema
4. Any page-specific schemas (FAQ, Product, Service, etc.)

Output JSON:
{
  "page": "${pageName}",
  "schemas": [
    {
      "type": "WebPage",
      "markup": {
        "@context": "https://schema.org",
        "@type": "WebPage",
        ...
      },
      "usage": "Place in <script type='application/ld+json'>"
    }
  ],
  "implementation": "HTML code to add to page"
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
  let md = `# SEO Report\n\n`;
  md += `**Generated:** ${report.generatedAt}\n`;
  md += `**Pages Analyzed:** ${report.pages.length}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Average Score | ${report.summary.averageScore}/100 |\n`;
  md += `| Critical Issues | ${report.summary.totalCritical} |\n`;
  md += `| Major Issues | ${report.summary.totalMajor} |\n`;
  md += `| Minor Issues | ${report.summary.totalMinor} |\n\n`;

  for (const page of report.pages) {
    md += `## ${page.page}\n\n`;
    md += `**Score:** ${page.summary?.score || 0}/100 | **Status:** ${page.summary?.status || 'unknown'}\n\n`;

    if (page.meta) {
      md += `### Meta Tags\n\n`;
      md += `| Tag | Score | Current |\n`;
      md += `|-----|-------|----------|\n`;
      md += `| Title | ${page.meta.title?.score || 0}/100 | ${page.meta.title?.current?.substring(0, 50) || 'Missing'}... |\n`;
      md += `| Description | ${page.meta.description?.score || 0}/100 | ${page.meta.description?.current?.substring(0, 50) || 'Missing'}... |\n\n`;
    }

    if (page.issues?.length > 0) {
      md += `### Issues (${page.issues.length})\n\n`;
      
      for (const issue of page.issues.slice(0, 10)) {
        const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'major' ? '🟠' : '🟡';
        md += `#### ${icon} ${issue.id}: ${issue.category}\n\n`;
        md += `**Issue:** ${issue.issue}\n\n`;
        md += `**Impact:** ${issue.impact}\n\n`;
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

  console.log('\n🔍 AI SEO Optimizer\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Load business context
  console.log('📚 Loading business context...');
  const businessContext = await loadBusinessContext();

  // Find HTML pages
  console.log('🔍 Finding pages to analyze...');
  const pagesDir = path.join(rootDir, 'src/pages');
  let pages = await findFiles(pagesDir, '.html');
  
  // Filter out utility pages
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
  console.log('\n🔄 Analyzing SEO...\n');

  const results = [];
  const progress = new ProgressLogger(pages.length, 'SEO analysis');

  for (const pagePath of pages) {
    const pageName = path.basename(pagePath, '.html');
    
    try {
      const htmlContent = await readFile(pagePath);
      console.log(`   Analyzing ${pageName}...`);
      
      const analysis = await analyzePageSEO(htmlContent, pageName, businessContext, options);
      
      // Generate schema if requested
      if (options.schema) {
        try {
          const schemaData = await generateSchema(htmlContent, pageName, businessContext);
          analysis.schema = schemaData;
        } catch (e) {
          // Schema generation failed
        }
      }
      
      results.push(analysis);
      
      const score = analysis.summary?.score || 0;
      const issues = (analysis.summary?.issueCount?.critical || 0) + 
                    (analysis.summary?.issueCount?.major || 0) + 
                    (analysis.summary?.issueCount?.minor || 0);
      console.log(`   ✅ ${pageName}: Score ${score}/100 (${issues} issues)`);
      
    } catch (error) {
      console.log(`   ❌ ${pageName}: ${error.message}`);
      results.push({
        page: pageName,
        error: error.message,
        summary: { score: 0, status: 'error', issueCount: { critical: 0, major: 0, minor: 0 } }
      });
    }
    
    progress.update(pageName);
  }

  // Generate report
  const report = {
    generatedAt: new Date().toISOString(),
    options: {
      keywords: options.keywords,
      schema: options.schema,
      fix: options.fix
    },
    businessContext: {
      business: businessContext.business,
      industry: businessContext.industry
    },
    summary: {
      pagesAnalyzed: results.length,
      averageScore: Math.round(results.reduce((sum, r) => sum + (r.summary?.score || 0), 0) / results.length),
      totalCritical: results.reduce((sum, r) => sum + (r.summary?.issueCount?.critical || 0), 0),
      totalMajor: results.reduce((sum, r) => sum + (r.summary?.issueCount?.major || 0), 0),
      totalMinor: results.reduce((sum, r) => sum + (r.summary?.issueCount?.minor || 0), 0)
    },
    pages: results
  };

  if (!options.dryRun) {
    const outputPath = `docs/07-qa/seo-report.${options.format === 'markdown' ? 'md' : 'json'}`;
    
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
  console.log('');

  if (report.summary.totalCritical > 0) {
    console.log('⚠️  Critical SEO issues found. See report for details.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
