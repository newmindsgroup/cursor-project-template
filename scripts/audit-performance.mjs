#!/usr/bin/env node

/**
 * Performance Audit
 * Run Lighthouse performance audits on built pages
 * 
 * Usage:
 *   node scripts/audit-performance.mjs                    # Audit all pages
 *   node scripts/audit-performance.mjs --page=index       # Audit specific page
 *   node scripts/audit-performance.mjs --threshold=90     # Set minimum score
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

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
    page: null,
    threshold: 80,
    format: 'json',
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--page=')) {
      options.page = arg.split('=')[1];
    } else if (arg.startsWith('--threshold=')) {
      options.threshold = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Performance Audit', colors.bold, colors.cyan)}

Run Lighthouse performance audits on your built pages.

${color('Usage:', colors.bold)}
  node scripts/audit-performance.mjs [options]

${color('Options:', colors.bold)}
  --page=NAME         Audit specific page only
  --threshold=N       Minimum passing score (default: 80)
  --format=FORMAT     Output format: json (default), html
  --help, -h          Show this help message

${color('Requirements:', colors.bold)}
  - Build must exist (run npm run build first)
  - Chrome/Chromium must be installed
  - Lighthouse CLI or serve for local testing

${color('Metrics:', colors.bold)}
  - Performance Score
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Total Blocking Time (TBT)
  - Cumulative Layout Shift (CLS)
  - Speed Index

${color('Examples:', colors.bold)}
  npm run audit:performance                       # Audit all pages
  npm run audit:performance -- --page=index       # Audit homepage
  npm run audit:performance -- --threshold=90     # Strict threshold
`);
}

/**
 * Find HTML pages in dist
 */
async function findPages(options) {
  const distDir = path.join(rootDir, 'dist');
  const pages = [];
  
  async function scan(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          // Skip handoff and internal pages
          const relativePath = path.relative(distDir, fullPath);
          if (!relativePath.includes('handoff') && 
              !relativePath.includes('project') &&
              !relativePath.includes('styleguide')) {
            pages.push({
              path: fullPath,
              name: relativePath.replace('.html', '').replace(/\//g, '-') || 'index'
            });
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }
  
  await scan(distDir);
  
  // Filter if specific page requested
  if (options.page) {
    return pages.filter(p => p.name.includes(options.page));
  }
  
  return pages;
}

/**
 * Check if Lighthouse CLI is available
 */
function hasLighthouse() {
  try {
    execSync('npx lighthouse --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Start a local server
 */
async function startServer() {
  return new Promise((resolve, reject) => {
    // Try to use serve or vite preview
    const proc = spawn('npx', ['serve', 'dist', '-l', '5555'], {
      cwd: rootDir,
      stdio: 'pipe',
      detached: true
    });
    
    proc.unref();
    
    // Wait for server to start
    setTimeout(() => {
      resolve(proc);
    }, 2000);
    
    proc.on('error', reject);
  });
}

/**
 * Stop local server
 */
function stopServer(proc) {
  try {
    process.kill(-proc.pid);
  } catch {
    // Process already ended
  }
}

/**
 * Run Lighthouse audit
 */
async function runLighthouseAudit(url, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      'lighthouse',
      url,
      '--output=json',
      `--output-path=${outputPath}`,
      '--chrome-flags="--headless --no-sandbox"',
      '--only-categories=performance',
      '--quiet'
    ];
    
    const proc = spawn('npx', args, {
      cwd: rootDir,
      stdio: 'pipe'
    });
    
    let stderr = '';
    proc.stderr?.on('data', data => {
      stderr += data.toString();
    });
    
    proc.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Lighthouse failed: ${stderr}`));
      }
    });
    
    proc.on('error', reject);
  });
}

/**
 * Parse Lighthouse results
 */
async function parseLighthouseResults(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  return {
    score: Math.round(data.categories.performance.score * 100),
    metrics: {
      fcp: data.audits['first-contentful-paint']?.displayValue || 'N/A',
      lcp: data.audits['largest-contentful-paint']?.displayValue || 'N/A',
      tbt: data.audits['total-blocking-time']?.displayValue || 'N/A',
      cls: data.audits['cumulative-layout-shift']?.displayValue || 'N/A',
      si: data.audits['speed-index']?.displayValue || 'N/A'
    },
    opportunities: data.audits ? 
      Object.values(data.audits)
        .filter(a => a.details?.type === 'opportunity' && a.score < 1)
        .map(a => ({
          title: a.title,
          savings: a.details?.overallSavingsMs ? `${a.details.overallSavingsMs}ms` : 'N/A'
        }))
        .slice(0, 5) : []
  };
}

/**
 * Simulate audit results (when Lighthouse isn't available)
 */
async function simulateAudit(pagePath) {
  // Read the HTML file and do basic analysis
  const content = await fs.readFile(pagePath, 'utf-8');
  
  // Count potential performance issues
  let issues = 0;
  const opportunities = [];
  
  // Check for unoptimized images
  const imgCount = (content.match(/<img/g) || []).length;
  const lazyImgCount = (content.match(/loading=["']lazy["']/g) || []).length;
  if (imgCount > lazyImgCount) {
    issues += imgCount - lazyImgCount;
    opportunities.push({ title: 'Add lazy loading to images', savings: 'Varies' });
  }
  
  // Check for render-blocking resources
  const blockingScripts = (content.match(/<script(?![^>]*\b(async|defer)\b)/g) || []).length;
  if (blockingScripts > 2) {
    issues += blockingScripts - 2;
    opportunities.push({ title: 'Eliminate render-blocking resources', savings: 'Varies' });
  }
  
  // Check for inline styles (potential FOUC)
  const inlineStyles = (content.match(/<style/g) || []).length;
  if (inlineStyles > 1) {
    issues++;
    opportunities.push({ title: 'Reduce inline styles', savings: 'Minor' });
  }
  
  // Calculate estimated score (simplified)
  const baseScore = 85;
  const score = Math.max(50, baseScore - (issues * 5));
  
  return {
    score,
    simulated: true,
    metrics: {
      fcp: 'N/A (simulated)',
      lcp: 'N/A (simulated)',
      tbt: 'N/A (simulated)',
      cls: 'N/A (simulated)',
      si: 'N/A (simulated)'
    },
    opportunities,
    note: 'Results are simulated. Install Lighthouse for accurate metrics.'
  };
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
  
  console.log(`\n${color('Performance Audit', colors.bold, colors.cyan)}\n`);
  
  // Check dist exists
  try {
    await fs.access(path.join(rootDir, 'dist'));
  } catch {
    console.log(`${color('✗', colors.red)} dist/ directory not found.`);
    console.log(`  Run ${color('npm run build', colors.cyan)} first.\n`);
    process.exit(1);
  }
  
  // Find pages
  const pages = await findPages(options);
  
  if (pages.length === 0) {
    console.log(`${color('✗', colors.yellow)} No pages found to audit.\n`);
    process.exit(0);
  }
  
  console.log(`Found ${pages.length} page(s) to audit\n`);
  console.log(`Threshold: ${options.threshold}/100\n`);
  
  // Check for Lighthouse
  const lighthouseAvailable = hasLighthouse();
  
  if (!lighthouseAvailable) {
    console.log(`${color('⚠', colors.yellow)} Lighthouse not available, using simulated analysis`);
    console.log(`  Install: ${color('npm install -g lighthouse', colors.cyan)}\n`);
  }
  
  // Create output directory
  const outputDir = path.join(rootDir, 'docs/07-qa/performance');
  await fs.mkdir(outputDir, { recursive: true });
  
  // Start server if using Lighthouse
  let server = null;
  if (lighthouseAvailable) {
    console.log('Starting local server...');
    try {
      server = await startServer();
      console.log(`${color('✓', colors.green)} Server running on http://localhost:5555\n`);
    } catch (e) {
      console.log(`${color('⚠', colors.yellow)} Could not start server, using simulated analysis`);
    }
  }
  
  // Audit each page
  const results = [];
  
  for (const page of pages) {
    console.log(`Auditing ${page.name}...`);
    
    try {
      let result;
      
      if (lighthouseAvailable && server) {
        // Real Lighthouse audit
        const url = `http://localhost:5555/${page.path.replace(path.join(rootDir, 'dist') + '/', '')}`;
        const outputPath = path.join(outputDir, `${page.name}.json`);
        
        await runLighthouseAudit(url, outputPath);
        result = await parseLighthouseResults(outputPath);
      } else {
        // Simulated audit
        result = await simulateAudit(page.path);
      }
      
      result.page = page.name;
      results.push(result);
      
      // Display result
      const scoreColor = result.score >= 90 ? colors.green : 
                        result.score >= options.threshold ? colors.yellow : colors.red;
      const status = result.score >= options.threshold ? '✓' : '✗';
      
      console.log(`  ${color(status, scoreColor)} ${page.name}: ${color(result.score.toString(), scoreColor)}/100`);
      
      if (result.metrics.lcp !== 'N/A' && !result.simulated) {
        console.log(`    LCP: ${result.metrics.lcp} | CLS: ${result.metrics.cls}`);
      }
      
    } catch (e) {
      console.log(`  ${color('✗', colors.red)} ${page.name}: Error - ${e.message}`);
      results.push({
        page: page.name,
        score: 0,
        error: e.message
      });
    }
  }
  
  // Stop server
  if (server) {
    stopServer(server);
  }
  
  // Save combined results
  const report = {
    timestamp: new Date().toISOString(),
    threshold: options.threshold,
    simulated: !lighthouseAvailable || !server,
    summary: {
      total: results.length,
      passed: results.filter(r => r.score >= options.threshold).length,
      failed: results.filter(r => r.score < options.threshold).length,
      avgScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    },
    results
  };
  
  const reportPath = path.join(outputDir, 'performance-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  // Summary
  console.log(`\n${color('─'.repeat(50), colors.dim)}`);
  console.log(`\n${color('Summary', colors.bold)}\n`);
  console.log(`  Total:   ${report.summary.total}`);
  console.log(`  Passed:  ${color(report.summary.passed.toString(), colors.green)}`);
  console.log(`  Failed:  ${color(report.summary.failed.toString(), report.summary.failed > 0 ? colors.red : colors.green)}`);
  console.log(`  Average: ${report.summary.avgScore}/100`);
  
  if (report.simulated) {
    console.log(`\n${color('Note:', colors.yellow)} Results are simulated. Install Lighthouse for accurate metrics.`);
  }
  
  console.log(`\n${color('Output:', colors.bold)} docs/07-qa/performance/\n`);
  
  // Exit with error if any failed
  if (report.summary.failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
