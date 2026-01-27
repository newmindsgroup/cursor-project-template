#!/usr/bin/env node
/**
 * Visual Breakpoint Test Script
 * 
 * Captures screenshots of sections at different viewport sizes to verify
 * responsive design implementation. Uses Playwright for browser automation.
 * 
 * Usage:
 *   node scripts/visual-breakpoint-test.mjs                    # Test all sections
 *   node scripts/visual-breakpoint-test.mjs src/sections/Hero.html  # Specific section
 *   node scripts/visual-breakpoint-test.mjs --open             # Open report after
 * 
 * Prerequisites:
 *   npm install @playwright/test
 *   npx playwright install chromium
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

// ANSI colors
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

// Viewport configurations for responsive testing
const VIEWPORTS = {
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 812,
    description: 'iPhone SE / small phones'
  },
  mobileLarge: {
    name: 'Mobile Large',
    width: 414,
    height: 896,
    description: 'iPhone Pro Max / large phones'
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    description: 'iPad / tablets'
  },
  tabletLandscape: {
    name: 'Tablet Landscape',
    width: 1024,
    height: 768,
    description: 'iPad landscape'
  },
  desktop: {
    name: 'Desktop',
    width: 1440,
    height: 900,
    description: 'Standard desktop'
  },
  desktopWide: {
    name: 'Desktop Wide',
    width: 1920,
    height: 1080,
    description: 'Full HD monitors'
  }
};

// Check if Playwright is available
async function checkPlaywright() {
  try {
    await import('@playwright/test');
    return true;
  } catch {
    return false;
  }
}

// Create test HTML wrapper for a section
function createTestPage(sectionHtml, sectionName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Test: ${sectionName}</title>
  <link rel="stylesheet" href="./src/styles/base.css">
  <style>
    body { margin: 0; padding: 0; }
    .test-info {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 8px 16px;
      background: #1e293b;
      color: #f1f5f9;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      z-index: 9999;
      display: flex;
      justify-content: space-between;
    }
    .test-info .viewport { color: #60a5fa; }
    .test-info .section { color: #34d399; }
  </style>
</head>
<body>
  <div class="test-info">
    <span class="section">${sectionName}</span>
    <span class="viewport" id="viewport-info"></span>
  </div>
  <div style="padding-top: 40px;">
    ${sectionHtml}
  </div>
  <script>
    document.getElementById('viewport-info').textContent = 
      window.innerWidth + 'px × ' + window.innerHeight + 'px';
    window.addEventListener('resize', () => {
      document.getElementById('viewport-info').textContent = 
        window.innerWidth + 'px × ' + window.innerHeight + 'px';
    });
  </script>
</body>
</html>`;
}

// Take screenshots at all viewports
async function captureScreenshots(sectionPath, outputDir) {
  const { chromium } = await import('@playwright/test');
  
  const sectionName = path.basename(sectionPath, '.html');
  const sectionHtml = await fs.readFile(sectionPath, 'utf-8');
  
  // Create output directory
  const sectionOutputDir = path.join(outputDir, sectionName);
  await fs.mkdir(sectionOutputDir, { recursive: true });
  
  // Create test page
  const testPageHtml = createTestPage(sectionHtml, sectionName);
  const testPagePath = path.join(sectionOutputDir, 'test-page.html');
  await fs.writeFile(testPagePath, testPageHtml);
  
  const results = [];
  const browser = await chromium.launch();
  
  try {
    for (const [key, viewport] of Object.entries(VIEWPORTS)) {
      console.log(`  ${c.dim}${viewport.name} (${viewport.width}×${viewport.height})...${c.reset}`);
      
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      const page = await context.newPage();
      
      // Load the test page
      await page.goto(`file://${path.resolve(ROOT_DIR, testPagePath)}`);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      const screenshotPath = path.join(sectionOutputDir, `${key}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      results.push({
        viewport: key,
        name: viewport.name,
        width: viewport.width,
        height: viewport.height,
        path: screenshotPath
      });
      
      await context.close();
    }
  } finally {
    await browser.close();
  }
  
  return {
    section: sectionName,
    results
  };
}

// Generate HTML report
async function generateReport(allResults, outputDir) {
  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Breakpoint Test Report</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: system-ui, sans-serif; 
      margin: 0; 
      padding: 24px;
      background: #0f172a;
      color: #e2e8f0;
    }
    h1 { 
      color: #f1f5f9; 
      margin-bottom: 8px;
    }
    .timestamp {
      color: #64748b;
      margin-bottom: 32px;
    }
    .section {
      margin-bottom: 48px;
      background: #1e293b;
      border-radius: 12px;
      padding: 24px;
    }
    .section h2 {
      color: #60a5fa;
      margin-top: 0;
    }
    .viewport-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .viewport-item {
      background: #0f172a;
      border-radius: 8px;
      overflow: hidden;
    }
    .viewport-item .info {
      padding: 12px 16px;
      background: #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .viewport-item .name {
      font-weight: 600;
      color: #f1f5f9;
    }
    .viewport-item .size {
      color: #94a3b8;
      font-size: 14px;
    }
    .viewport-item img {
      width: 100%;
      height: auto;
      display: block;
    }
    .summary {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
    }
    .stat {
      background: #1e293b;
      padding: 16px 24px;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #34d399;
    }
    .stat-label {
      color: #94a3b8;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>Visual Breakpoint Test Report</h1>
  <p class="timestamp">Generated: ${new Date().toISOString()}</p>
  
  <div class="summary">
    <div class="stat">
      <div class="stat-value">${allResults.length}</div>
      <div class="stat-label">Sections tested</div>
    </div>
    <div class="stat">
      <div class="stat-value">${Object.keys(VIEWPORTS).length}</div>
      <div class="stat-label">Viewports</div>
    </div>
    <div class="stat">
      <div class="stat-value">${allResults.length * Object.keys(VIEWPORTS).length}</div>
      <div class="stat-label">Screenshots</div>
    </div>
  </div>
  
  ${allResults.map(section => `
    <div class="section">
      <h2>${section.section}</h2>
      <div class="viewport-grid">
        ${section.results.map(result => `
          <div class="viewport-item">
            <div class="info">
              <span class="name">${result.name}</span>
              <span class="size">${result.width}×${result.height}</span>
            </div>
            <a href="${path.relative(outputDir, result.path)}" target="_blank">
              <img src="${path.relative(outputDir, result.path)}" alt="${result.name}">
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
</body>
</html>`;

  const reportPath = path.join(outputDir, 'report.html');
  await fs.writeFile(reportPath, reportHtml);
  return reportPath;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const options = {
    open: args.includes('--open'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  const fileArgs = args.filter(arg => !arg.startsWith('-'));
  
  if (options.help) {
    console.log(`
${c.cyan}${c.bold}Visual Breakpoint Test${c.reset}

Captures screenshots of sections at different viewport sizes.

${c.bold}Usage:${c.reset}
  node scripts/visual-breakpoint-test.mjs [options] [files...]

${c.bold}Options:${c.reset}
  --open    Open HTML report after generation
  --help    Show this help

${c.bold}Viewports tested:${c.reset}
${Object.entries(VIEWPORTS).map(([key, v]) => 
  `  ${c.cyan}${v.name.padEnd(16)}${c.reset} ${v.width}×${v.height} - ${v.description}`
).join('\n')}

${c.bold}Prerequisites:${c.reset}
  npm install @playwright/test
  npx playwright install chromium

${c.bold}Examples:${c.reset}
  node scripts/visual-breakpoint-test.mjs                     # All sections
  node scripts/visual-breakpoint-test.mjs src/sections/Hero.html  # Specific
`);
    process.exit(0);
  }
  
  // Check for Playwright
  const hasPlaywright = await checkPlaywright();
  if (!hasPlaywright) {
    console.log(`
${c.yellow}Playwright not installed.${c.reset}

To use visual breakpoint testing, install Playwright:

  ${c.cyan}npm install @playwright/test${c.reset}
  ${c.cyan}npx playwright install chromium${c.reset}

Alternatively, manually test at these viewports:
${Object.entries(VIEWPORTS).map(([key, v]) => 
  `  - ${v.name}: ${v.width}×${v.height}`
).join('\n')}
`);
    process.exit(1);
  }
  
  console.log(`\n${c.cyan}${c.bold}Visual Breakpoint Test${c.reset}\n`);
  
  // Determine files to test
  let files;
  if (fileArgs.length > 0) {
    files = fileArgs.map(f => path.resolve(f));
  } else {
    const sectionsDir = path.join(ROOT_DIR, 'src/sections');
    const entries = await fs.readdir(sectionsDir);
    files = entries
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(sectionsDir, f));
  }
  
  console.log(`Testing ${files.length} section(s) at ${Object.keys(VIEWPORTS).length} viewports...\n`);
  
  // Create output directory
  const outputDir = path.join(ROOT_DIR, '_handoff/visual-tests', new Date().toISOString().split('T')[0]);
  await fs.mkdir(outputDir, { recursive: true });
  
  // Capture screenshots
  const allResults = [];
  for (const file of files) {
    const sectionName = path.basename(file, '.html');
    console.log(`${c.cyan}${sectionName}${c.reset}`);
    
    try {
      const result = await captureScreenshots(file, outputDir);
      allResults.push(result);
      console.log(`  ${c.green}✓ ${result.results.length} screenshots captured${c.reset}\n`);
    } catch (error) {
      console.log(`  ${c.red}✗ Error: ${error.message}${c.reset}\n`);
    }
  }
  
  // Generate report
  const reportPath = await generateReport(allResults, outputDir);
  
  console.log(`${c.dim}${'─'.repeat(50)}${c.reset}`);
  console.log(`\n${c.green}${c.bold}✓ Visual test complete${c.reset}`);
  console.log(`  Screenshots: ${outputDir}`);
  console.log(`  Report: ${reportPath}\n`);
  
  // Open report if requested
  if (options.open) {
    const { default: open } = await import('open');
    await open(reportPath);
  }
}

main().catch(error => {
  console.error(`${c.red}Error:${c.reset}`, error.message);
  process.exit(1);
});
