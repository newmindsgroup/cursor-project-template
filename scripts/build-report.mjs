#!/usr/bin/env node

/**
 * Build Report & Metrics Dashboard
 * Generates comprehensive build reports with metrics, asset analysis, and cost tracking
 * 
 * Usage:
 *   node scripts/build-report.mjs                    # Generate report
 *   node scripts/build-report.mjs --open            # Generate and open in browser
 *   node scripts/build-report.mjs --json            # Output JSON only
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
  cyan: '\x1b[36m'
};

function color(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    open: args.includes('--open') || args.includes('-o'),
    json: args.includes('--json'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
${color('Build Report Generator', colors.bold, colors.cyan)}

Generate comprehensive build reports with metrics and analysis.

${color('Usage:', colors.bold)}
  node scripts/build-report.mjs [options]

${color('Options:', colors.bold)}
  --open, -o    Open report in browser after generating
  --json        Output JSON only (no HTML)
  --help, -h    Show this help message

${color('Output:', colors.bold)}
  - src/data/build-report.json
  - src/pages/project/report/index.html (if not --json)
`);
}

/**
 * Get file size in human-readable format
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Find files recursively
 */
async function findFiles(dir, pattern) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const subFiles = await findFiles(fullPath, pattern);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        if (!pattern || (typeof pattern === 'string' && entry.name.endsWith(pattern)) ||
            (pattern instanceof RegExp && pattern.test(entry.name))) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return files;
}

/**
 * Get file stats with size
 */
async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      size: stats.size,
      modified: stats.mtime.toISOString()
    };
  } catch {
    return null;
  }
}

/**
 * Analyze build output
 */
async function analyzeBuild() {
  const distDir = path.join(rootDir, 'dist');
  const report = {
    timestamp: new Date().toISOString(),
    build: {
      exists: false,
      totalSize: 0,
      fileCount: 0
    },
    pages: [],
    assets: {
      images: [],
      scripts: [],
      styles: [],
      fonts: [],
      other: []
    },
    summary: {}
  };
  
  try {
    await fs.access(distDir);
    report.build.exists = true;
  } catch {
    return report;
  }
  
  // Find all files in dist
  const allFiles = await findFiles(distDir, null);
  
  for (const file of allFiles) {
    const stats = await getFileStats(file);
    if (!stats) continue;
    
    const relativePath = path.relative(distDir, file);
    const ext = path.extname(file).toLowerCase();
    
    report.build.totalSize += stats.size;
    report.build.fileCount++;
    
    const fileInfo = {
      path: relativePath,
      size: stats.size,
      sizeFormatted: formatSize(stats.size)
    };
    
    // Categorize
    if (ext === '.html') {
      report.pages.push(fileInfo);
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].includes(ext)) {
      report.assets.images.push(fileInfo);
    } else if (['.js', '.mjs'].includes(ext)) {
      report.assets.scripts.push(fileInfo);
    } else if (ext === '.css') {
      report.assets.styles.push(fileInfo);
    } else if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
      report.assets.fonts.push(fileInfo);
    } else {
      report.assets.other.push(fileInfo);
    }
  }
  
  // Sort by size (largest first)
  report.assets.images.sort((a, b) => b.size - a.size);
  report.assets.scripts.sort((a, b) => b.size - a.size);
  report.assets.styles.sort((a, b) => b.size - a.size);
  
  // Calculate summaries
  report.summary = {
    totalSize: formatSize(report.build.totalSize),
    pageCount: report.pages.length,
    imageCount: report.assets.images.length,
    imageTotalSize: formatSize(report.assets.images.reduce((sum, f) => sum + f.size, 0)),
    scriptCount: report.assets.scripts.length,
    scriptTotalSize: formatSize(report.assets.scripts.reduce((sum, f) => sum + f.size, 0)),
    styleCount: report.assets.styles.length,
    styleTotalSize: formatSize(report.assets.styles.reduce((sum, f) => sum + f.size, 0))
  };
  
  return report;
}

/**
 * Analyze content files
 */
async function analyzeContent() {
  const contentDir = path.join(rootDir, 'src/content');
  const report = {
    languages: [],
    files: [],
    totalFiles: 0,
    completeness: {}
  };
  
  try {
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_') && entry.name !== 'schema') {
        report.languages.push(entry.name);
        
        const langDir = path.join(contentDir, entry.name);
        const langFiles = await findFiles(langDir, '.json');
        
        for (const file of langFiles) {
          try {
            const content = await fs.readFile(file, 'utf-8');
            const data = JSON.parse(content);
            
            report.files.push({
              language: entry.name,
              file: path.basename(file),
              status: data.meta?.status || 'unknown',
              lastUpdated: data.meta?.lastUpdated
            });
          } catch {
            // Skip unparseable files
          }
        }
      }
    }
    
    report.totalFiles = report.files.length;
    
    // Calculate completeness by status
    const byStatus = {};
    for (const file of report.files) {
      byStatus[file.status] = (byStatus[file.status] || 0) + 1;
    }
    report.completeness = byStatus;
    
  } catch {
    // Content directory doesn't exist
  }
  
  return report;
}

/**
 * Load AI generation costs if available
 */
async function loadAICosts() {
  const costs = {
    totalCost: 0,
    generations: []
  };
  
  try {
    // Check for image generation manifest
    const manifestPath = path.join(rootDir, 'src/assets/generated/manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    
    costs.totalCost += manifest.totalCost || 0;
    costs.generations.push({
      type: 'images',
      count: manifest.summary?.generated || 0,
      cost: manifest.totalCost || 0
    });
  } catch {
    // No manifest
  }
  
  return costs;
}

/**
 * Load QA reports if available
 */
async function loadQAReports() {
  const qa = {
    accessibility: null,
    seo: null,
    visual: null
  };
  
  const qaDir = path.join(rootDir, 'docs/07-qa');
  
  try {
    const a11yReport = await fs.readFile(path.join(qaDir, 'accessibility-report.json'), 'utf-8');
    const a11y = JSON.parse(a11yReport);
    qa.accessibility = {
      score: a11y.summary?.averageScore,
      issues: a11y.summary?.totalCritical + a11y.summary?.totalMajor + a11y.summary?.totalMinor
    };
  } catch {}
  
  try {
    const seoReport = await fs.readFile(path.join(qaDir, 'seo-report.json'), 'utf-8');
    const seo = JSON.parse(seoReport);
    qa.seo = {
      score: seo.summary?.averageScore,
      issues: seo.summary?.totalCritical + seo.summary?.totalMajor + seo.summary?.totalMinor
    };
  } catch {}
  
  try {
    const visualReport = await fs.readFile(path.join(qaDir, 'visual-qa-report.json'), 'utf-8');
    const visual = JSON.parse(visualReport);
    qa.visual = {
      score: visual.summary?.averageScore,
      issues: visual.summary?.totalCritical + visual.summary?.totalMajor + visual.summary?.totalMinor
    };
  } catch {}
  
  return qa;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Report - ${new Date().toLocaleDateString()}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .score-ring { stroke-dasharray: 251.2; stroke-dashoffset: calc(251.2 - (251.2 * var(--score)) / 100); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Build Report</h1>
      <p class="text-gray-500">Generated: ${new Date(data.timestamp).toLocaleString()}</p>
    </header>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-2xl font-bold text-blue-600">${data.build.summary.pageCount}</div>
        <div class="text-sm text-gray-500">Pages</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-2xl font-bold text-green-600">${data.build.summary.totalSize}</div>
        <div class="text-sm text-gray-500">Total Size</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-2xl font-bold text-purple-600">${data.build.summary.imageCount}</div>
        <div class="text-sm text-gray-500">Images</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-2xl font-bold text-orange-600">${data.content.languages.length}</div>
        <div class="text-sm text-gray-500">Languages</div>
      </div>
    </div>

    <!-- QA Scores -->
    ${data.qa.accessibility || data.qa.seo || data.qa.visual ? `
    <div class="bg-white rounded-lg shadow mb-8 p-6">
      <h2 class="text-xl font-semibold mb-4">Quality Scores</h2>
      <div class="grid grid-cols-3 gap-8">
        ${data.qa.accessibility ? `
        <div class="text-center">
          <div class="text-3xl font-bold ${data.qa.accessibility.score >= 90 ? 'text-green-600' : data.qa.accessibility.score >= 70 ? 'text-yellow-600' : 'text-red-600'}">${data.qa.accessibility.score}/100</div>
          <div class="text-sm text-gray-500">Accessibility</div>
          <div class="text-xs text-gray-400">${data.qa.accessibility.issues} issues</div>
        </div>
        ` : '<div class="text-center text-gray-400">Accessibility: Not run</div>'}
        ${data.qa.seo ? `
        <div class="text-center">
          <div class="text-3xl font-bold ${data.qa.seo.score >= 90 ? 'text-green-600' : data.qa.seo.score >= 70 ? 'text-yellow-600' : 'text-red-600'}">${data.qa.seo.score}/100</div>
          <div class="text-sm text-gray-500">SEO</div>
          <div class="text-xs text-gray-400">${data.qa.seo.issues} issues</div>
        </div>
        ` : '<div class="text-center text-gray-400">SEO: Not run</div>'}
        ${data.qa.visual ? `
        <div class="text-center">
          <div class="text-3xl font-bold ${data.qa.visual.score >= 90 ? 'text-green-600' : data.qa.visual.score >= 70 ? 'text-yellow-600' : 'text-red-600'}">${data.qa.visual.score}/100</div>
          <div class="text-sm text-gray-500">Visual QA</div>
          <div class="text-xs text-gray-400">${data.qa.visual.issues} issues</div>
        </div>
        ` : '<div class="text-center text-gray-400">Visual QA: Not run</div>'}
      </div>
    </div>
    ` : ''}

    <!-- Asset Breakdown -->
    <div class="grid md:grid-cols-2 gap-8 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Largest Images</h2>
        <div class="space-y-2">
          ${data.build.assets.images.slice(0, 10).map(img => `
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 truncate flex-1">${img.path}</span>
            <span class="text-gray-500 ml-2">${img.sizeFormatted}</span>
          </div>
          `).join('')}
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Scripts & Styles</h2>
        <div class="space-y-2">
          ${[...data.build.assets.scripts, ...data.build.assets.styles].slice(0, 10).map(file => `
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 truncate flex-1">${file.path}</span>
            <span class="text-gray-500 ml-2">${file.sizeFormatted}</span>
          </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Content Status -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Content Status</h2>
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-green-600">${data.content.completeness.complete || 0}</div>
          <div class="text-sm text-gray-500">Complete</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-yellow-600">${data.content.completeness.review || 0}</div>
          <div class="text-sm text-gray-500">In Review</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-600">${data.content.completeness.draft || 0}</div>
          <div class="text-sm text-gray-500">Draft</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-400">${data.content.completeness.unknown || 0}</div>
          <div class="text-sm text-gray-500">Unknown</div>
        </div>
      </div>
    </div>

    ${data.costs.totalCost > 0 ? `
    <!-- AI Costs -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">AI Generation Costs</h2>
      <div class="text-3xl font-bold text-gray-900">$${data.costs.totalCost.toFixed(2)}</div>
      <div class="text-sm text-gray-500">Total estimated cost</div>
    </div>
    ` : ''}

    <footer class="mt-8 text-center text-sm text-gray-400">
      Generated by Build Report Script
    </footer>
  </div>
</body>
</html>`;
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
  
  console.log(`\n${color('Build Report Generator', colors.bold, colors.cyan)}\n`);
  
  // Gather all data
  console.log('Analyzing build output...');
  const buildData = await analyzeBuild();
  
  console.log('Analyzing content...');
  const contentData = await analyzeContent();
  
  console.log('Loading AI costs...');
  const costsData = await loadAICosts();
  
  console.log('Loading QA reports...');
  const qaData = await loadQAReports();
  
  // Compile report
  const report = {
    timestamp: new Date().toISOString(),
    build: buildData,
    content: contentData,
    costs: costsData,
    qa: qaData
  };
  
  // Save JSON report
  const jsonPath = path.join(rootDir, 'src/data/build-report.json');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n${color('✓', colors.green)} JSON report: src/data/build-report.json`);
  
  // Generate HTML report
  if (!options.json) {
    const htmlContent = generateHTMLReport(report);
    const htmlDir = path.join(rootDir, 'src/pages/project/report');
    await fs.mkdir(htmlDir, { recursive: true });
    
    const htmlPath = path.join(htmlDir, 'index.html');
    await fs.writeFile(htmlPath, htmlContent, 'utf-8');
    console.log(`${color('✓', colors.green)} HTML report: src/pages/project/report/index.html`);
    
    if (options.open) {
      const { exec } = await import('child_process');
      exec(`open ${htmlPath}`);
      console.log(`${color('✓', colors.green)} Opening in browser...`);
    }
  }
  
  // Print summary
  console.log(`\n${color('─'.repeat(40), colors.dim)}`);
  console.log(`\n${color('Summary', colors.bold)}\n`);
  
  if (buildData.build.exists) {
    console.log(`  Pages:      ${buildData.pages.length}`);
    console.log(`  Total Size: ${buildData.summary.totalSize}`);
    console.log(`  Images:     ${buildData.summary.imageCount} (${buildData.summary.imageTotalSize})`);
    console.log(`  Scripts:    ${buildData.summary.scriptCount} (${buildData.summary.scriptTotalSize})`);
  } else {
    console.log(`  ${color('Build not found. Run npm run build first.', colors.yellow)}`);
  }
  
  if (qaData.accessibility) {
    console.log(`\n  ${color('QA Scores:', colors.bold)}`);
    console.log(`    Accessibility: ${qaData.accessibility.score}/100`);
    if (qaData.seo) console.log(`    SEO:           ${qaData.seo.score}/100`);
    if (qaData.visual) console.log(`    Visual:        ${qaData.visual.score}/100`);
  }
  
  console.log('');
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
