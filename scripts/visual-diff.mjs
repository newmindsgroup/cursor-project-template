#!/usr/bin/env node

/**
 * Visual Diff Tool
 * Screenshot comparison for QA between prototype and production
 * 
 * Usage:
 *   node scripts/visual-diff.mjs --source=http://localhost:5173 --target=https://staging.example.com
 *   node scripts/visual-diff.mjs --baseline  # Create baseline screenshots
 *   node scripts/visual-diff.mjs --compare   # Compare against baseline
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
  const options = {
    source: null,
    target: null,
    baseline: false,
    compare: false,
    pages: null,
    breakpoints: ['desktop', 'tablet', 'mobile'],
    threshold: 0.1, // 0.1% difference threshold
    outputDir: '_handoff/visual-diff',
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--source=')) options.source = arg.split('=')[1];
    if (arg.startsWith('--target=')) options.target = arg.split('=')[1];
    if (arg === '--baseline') options.baseline = true;
    if (arg === '--compare') options.compare = true;
    if (arg.startsWith('--pages=')) options.pages = arg.split('=')[1].split(',');
    if (arg.startsWith('--breakpoints=')) options.breakpoints = arg.split('=')[1].split(',');
    if (arg.startsWith('--threshold=')) options.threshold = parseFloat(arg.split('=')[1]);
    if (arg.startsWith('--output=')) options.outputDir = arg.split('=')[1];
    if (arg === '--help' || arg === '-h') options.help = true;
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Visual Diff Tool', colors.bold, colors.cyan)}

Screenshot comparison for QA between prototype and production builds.

${color('Usage:', colors.bold)}
  node scripts/visual-diff.mjs [options]

${color('Options:', colors.bold)}
  --source=URL        Source URL (prototype)
  --target=URL        Target URL (staging/production)
  --baseline          Create baseline screenshots from source
  --compare           Compare current screenshots against baseline
  --pages=LIST        Comma-separated page paths (default: home,about,services,contact)
  --breakpoints=LIST  Comma-separated breakpoints (default: desktop,tablet,mobile)
  --threshold=N       Pixel difference threshold % (default: 0.1)
  --output=DIR        Output directory (default: _handoff/visual-diff)
  --help, -h          Show this help message

${color('Examples:', colors.bold)}
  npm run visual-diff -- --baseline --source=http://localhost:5173
  npm run visual-diff -- --compare --source=http://localhost:5173 --target=https://staging.example.com
`);
}

// Breakpoint configurations
const BREAKPOINTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 }
};

// Default pages to capture
const DEFAULT_PAGES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about.html' },
  { name: 'services', path: '/services.html' },
  { name: 'contact', path: '/contact.html' }
];

/**
 * Check if Playwright is available
 */
async function checkPlaywright() {
  try {
    await import('@playwright/test');
    return true;
  } catch {
    console.log(color('\n⚠️  Playwright not installed.', colors.yellow));
    console.log('   Run: npm install playwright');
    console.log('   Then: npx playwright install chromium\n');
    return false;
  }
}

/**
 * Take screenshot of a page at specific breakpoint
 */
async function takeScreenshot(browser, url, breakpoint, outputPath) {
  const viewport = BREAKPOINTS[breakpoint];
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take full page screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: true
    });
    
    return { success: true, path: outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

/**
 * Compare two images and calculate difference
 */
async function compareImages(image1Path, image2Path) {
  try {
    const { PNG } = await import('pngjs');
    const pixelmatch = (await import('pixelmatch')).default;
    
    const img1Data = await fs.readFile(image1Path);
    const img2Data = await fs.readFile(image2Path);
    
    const img1 = PNG.sync.read(img1Data);
    const img2 = PNG.sync.read(img2Data);
    
    // Check for dimension mismatch - pixelmatch requires matching dimensions
    if (img1.width !== img2.width || img1.height !== img2.height) {
      const maxPixels = Math.max(img1.width * img1.height, img2.width * img2.height);
      return {
        success: true,
        dimensionMismatch: true,
        diffPixels: maxPixels,
        totalPixels: maxPixels,
        diffPercentage: '100.00',
        img1Size: `${img1.width}x${img1.height}`,
        img2Size: `${img2.width}x${img2.height}`,
        diffImage: null
      };
    }
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    
    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;
    
    return {
      success: true,
      dimensionMismatch: false,
      diffPixels: numDiffPixels,
      totalPixels,
      diffPercentage: diffPercentage.toFixed(2),
      diffImage: PNG.sync.write(diff)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create baseline screenshots
 */
async function createBaseline(options) {
  if (!await checkPlaywright()) {
    process.exit(1);
  }
  
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  
  const baselineDir = path.join(rootDir, options.outputDir, 'baseline');
  await fs.mkdir(baselineDir, { recursive: true });
  
  const pages = options.pages 
    ? DEFAULT_PAGES.filter(p => options.pages.includes(p.name))
    : DEFAULT_PAGES;
  
  console.log(color('\n📸 Creating baseline screenshots...\n', colors.cyan));
  
  const results = [];
  
  for (const page of pages) {
    for (const breakpoint of options.breakpoints) {
      const url = `${options.source}${page.path}`;
      const filename = `${page.name}-${breakpoint}.png`;
      const outputPath = path.join(baselineDir, filename);
      
      console.log(color(`   ${page.name} @ ${breakpoint}...`, colors.dim));
      
      const result = await takeScreenshot(browser, url, breakpoint, outputPath);
      
      if (result.success) {
        console.log(color(`   ✅ ${filename}`, colors.green));
      } else {
        console.log(color(`   ❌ Failed: ${result.error}`, colors.red));
      }
      
      results.push({
        page: page.name,
        breakpoint,
        ...result
      });
    }
  }
  
  await browser.close();
  
  // Save manifest
  const manifest = {
    created: new Date().toISOString(),
    source: options.source,
    breakpoints: options.breakpoints,
    results
  };
  
  await fs.writeFile(
    path.join(baselineDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log(color(`\n✅ Baseline saved to ${baselineDir}\n`, colors.green));
  
  return results;
}

/**
 * Compare current screenshots against baseline
 */
async function compareScreenshots(options) {
  if (!await checkPlaywright()) {
    process.exit(1);
  }
  
  const baselineDir = path.join(rootDir, options.outputDir, 'baseline');
  const currentDir = path.join(rootDir, options.outputDir, 'current');
  const diffDir = path.join(rootDir, options.outputDir, 'diff');
  
  // Check baseline exists
  try {
    await fs.access(baselineDir);
  } catch {
    console.log(color('\n❌ No baseline found. Run with --baseline first.\n', colors.red));
    process.exit(1);
  }
  
  await fs.mkdir(currentDir, { recursive: true });
  await fs.mkdir(diffDir, { recursive: true });
  
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  
  // Load baseline manifest
  const manifestPath = path.join(baselineDir, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  
  const pages = options.pages 
    ? DEFAULT_PAGES.filter(p => options.pages.includes(p.name))
    : DEFAULT_PAGES;
  
  console.log(color('\n🔍 Comparing screenshots...\n', colors.cyan));
  
  const comparisons = [];
  
  for (const page of pages) {
    for (const breakpoint of options.breakpoints) {
      const filename = `${page.name}-${breakpoint}.png`;
      const baselinePath = path.join(baselineDir, filename);
      const currentPath = path.join(currentDir, filename);
      const diffPath = path.join(diffDir, filename);
      
      // Take current screenshot from target (or source if target not specified)
      const url = `${options.target || options.source}${page.path}`;
      
      console.log(color(`   ${page.name} @ ${breakpoint}...`, colors.dim));
      
      const screenshotResult = await takeScreenshot(browser, url, breakpoint, currentPath);
      
      if (!screenshotResult.success) {
        console.log(color(`   ❌ Failed to capture: ${screenshotResult.error}`, colors.red));
        comparisons.push({
          page: page.name,
          breakpoint,
          success: false,
          error: screenshotResult.error
        });
        continue;
      }
      
      // Compare images
      const comparison = await compareImages(baselinePath, currentPath);
      
      if (comparison.success) {
        // Save diff image
        await fs.writeFile(diffPath, comparison.diffImage);
        
        const passed = parseFloat(comparison.diffPercentage) <= options.threshold;
        
        if (passed) {
          console.log(color(`   ✅ ${comparison.diffPercentage}% diff (threshold: ${options.threshold}%)`, colors.green));
        } else {
          console.log(color(`   ⚠️  ${comparison.diffPercentage}% diff exceeds threshold!`, colors.yellow));
        }
        
        comparisons.push({
          page: page.name,
          breakpoint,
          success: true,
          passed,
          diffPercentage: comparison.diffPercentage,
          diffPixels: comparison.diffPixels,
          files: {
            baseline: baselinePath,
            current: currentPath,
            diff: diffPath
          }
        });
      } else {
        console.log(color(`   ❌ Comparison failed: ${comparison.error}`, colors.red));
        comparisons.push({
          page: page.name,
          breakpoint,
          success: false,
          error: comparison.error
        });
      }
    }
  }
  
  await browser.close();
  
  // Generate report
  const report = generateReport(comparisons, options);
  const reportPath = path.join(rootDir, options.outputDir, 'report.html');
  await fs.writeFile(reportPath, report);
  
  // Summary
  const passed = comparisons.filter(c => c.passed).length;
  const failed = comparisons.filter(c => !c.passed && c.success).length;
  const errors = comparisons.filter(c => !c.success).length;
  
  console.log(color('\n📊 Summary:', colors.cyan));
  console.log(`   Passed: ${color(String(passed), colors.green)}`);
  console.log(`   Failed: ${color(String(failed), colors.yellow)}`);
  console.log(`   Errors: ${color(String(errors), colors.red)}`);
  console.log(color(`\n📄 Report: ${reportPath}\n`, colors.cyan));
  
  // Exit with error code if any failed
  if (failed > 0 || errors > 0) {
    process.exit(1);
  }
}

/**
 * Generate HTML report
 */
function generateReport(comparisons, options) {
  const timestamp = new Date().toISOString();
  
  const rows = comparisons.map(c => {
    const statusClass = c.passed ? 'passed' : c.success ? 'failed' : 'error';
    const statusText = c.passed ? 'Passed' : c.success ? 'Failed' : 'Error';
    
    return `
      <tr class="${statusClass}">
        <td>${c.page}</td>
        <td>${c.breakpoint}</td>
        <td class="status">${statusText}</td>
        <td>${c.diffPercentage || '-'}%</td>
        <td>
          ${c.files ? `
            <a href="${c.files.baseline}" target="_blank">Baseline</a> |
            <a href="${c.files.current}" target="_blank">Current</a> |
            <a href="${c.files.diff}" target="_blank">Diff</a>
          ` : c.error || '-'}
        </td>
      </tr>
    `;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Diff Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f5f5f5; }
    h1 { margin-bottom: 1rem; color: #333; }
    .meta { color: #666; margin-bottom: 2rem; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f8f8; font-weight: 600; }
    tr.passed td.status { color: #22c55e; }
    tr.failed td.status { color: #f59e0b; }
    tr.error td.status { color: #ef4444; }
    tr.failed { background: #fef3c7; }
    tr.error { background: #fee2e2; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <h1>Visual Diff Report</h1>
  <p class="meta">
    Generated: ${timestamp}<br>
    Threshold: ${options.threshold}%
  </p>
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>Breakpoint</th>
        <th>Status</th>
        <th>Diff %</th>
        <th>Files</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
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

  if (options.baseline) {
    if (!options.source) {
      console.log(color('\n❌ --source URL required for baseline\n', colors.red));
      process.exit(1);
    }
    await createBaseline(options);
  } else if (options.compare || options.source) {
    if (!options.source && !options.target) {
      console.log(color('\n❌ --source or --target URL required\n', colors.red));
      process.exit(1);
    }
    await compareScreenshots(options);
  } else {
    showHelp();
  }
}

main().catch(error => {
  console.error(color(`Fatal error: ${error.message}`, colors.red));
  process.exit(1);
});
