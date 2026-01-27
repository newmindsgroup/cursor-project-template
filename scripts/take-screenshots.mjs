#!/usr/bin/env node

/**
 * Screenshot Automation Script
 * Captures screenshots of all pages at multiple viewports using Playwright
 */

import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const pagesDir = path.join(distDir, 'pages');
const screenshotsDir = path.join(distDir, 'pages', 'handoff', 'screenshots');

// Viewport configurations
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

/**
 * Dynamically discover all HTML pages in dist/pages/
 * Excludes the handoff directory
 */
async function discoverPages() {
  const pages = [];
  
  try {
    const entries = await fs.readdir(pagesDir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip handoff directory
      if (entry.name === 'handoff') continue;
      
      if (entry.isFile() && entry.name.endsWith('.html')) {
        // Convert filename to display name
        const name = entry.name === 'index.html' 
          ? 'Home' 
          : entry.name.replace('.html', '')
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
        
        pages.push({ name, file: entry.name });
      }
    }
  } catch (error) {
    console.error('❌ Could not discover pages:', error.message);
    console.log('💡 Make sure to run "npm run build" first.');
    return [];
  }
  
  // Sort pages with index.html first, then alphabetically
  pages.sort((a, b) => {
    if (a.file === 'index.html') return -1;
    if (b.file === 'index.html') return 1;
    return a.name.localeCompare(b.name);
  });
  
  return pages;
}

async function takeScreenshots() {
  console.log('📸 Starting screenshot capture...\n');

  // Ensure screenshots directory exists
  await fs.mkdir(screenshotsDir, { recursive: true });

  // Dynamically discover pages
  const pages = await discoverPages();
  
  if (pages.length === 0) {
    console.log('⚠ No pages found to capture.');
    console.log('💡 Make sure dist/pages/ contains HTML files.\n');
    
    // Create empty manifest
    const emptyManifest = {
      generated: new Date().toISOString(),
      viewports: viewports.map((v) => ({ name: v.name, width: v.width, height: v.height })),
      screenshots: [],
      note: 'No pages found in dist/pages/'
    };
    
    const manifestPath = path.join(screenshotsDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(emptyManifest, null, 2), 'utf-8');
    return;
  }

  console.log(`📄 Found ${pages.length} pages: ${pages.map(p => p.name).join(', ')}\n`);

  const manifest = {
    generated: new Date().toISOString(),
    viewports: viewports.map((v) => ({ name: v.name, width: v.width, height: v.height })),
    screenshots: [],
  };

  let browser;

  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });

    for (const page of pages) {
      console.log(`📄 Capturing: ${page.name}`);

      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });

        const browserPage = await context.newPage();

        // Load the page from file system
        const pagePath = path.join(pagesDir, page.file);
        
        try {
          await fs.access(pagePath);
        } catch {
          console.log(`  ⚠ Page not found: ${page.file}`);
          await context.close();
          continue;
        }

        const fileUrl = `file://${pagePath}`;
        
        try {
          await browserPage.goto(fileUrl, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });

          // Wait a bit for any animations to settle
          await browserPage.waitForTimeout(1000);

          // Take screenshot
          const screenshotName = `${page.file.replace('.html', '')}-${viewport.name}.png`;
          const screenshotPath = path.join(screenshotsDir, screenshotName);

          await browserPage.screenshot({
            path: screenshotPath,
            fullPage: true,
          });

          manifest.screenshots.push({
            page: page.name,
            file: screenshotName,
            viewport: viewport.name,
            width: viewport.width,
            height: viewport.height,
          });

          console.log(`  ✓ ${viewport.name} (${viewport.width}x${viewport.height})`);
        } catch (error) {
          console.log(`  ✗ Failed for ${viewport.name}: ${error.message}`);
        }

        await context.close();
      }
    }
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error.message);
    
    // If Playwright isn't installed, provide helpful message
    if (error.message.includes('Executable doesn\'t exist')) {
      console.log('\n💡 Playwright browsers not installed. Run:');
      console.log('   npx playwright install chromium\n');
    }
    
    // Create a fallback manifest with no screenshots
    const fallbackManifest = {
      generated: new Date().toISOString(),
      viewports: viewports.map((v) => ({ name: v.name, width: v.width, height: v.height })),
      screenshots: [],
      error: 'Screenshots could not be generated. Install Playwright browsers with: npx playwright install chromium'
    };
    
    const manifestPath = path.join(screenshotsDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(fallbackManifest, null, 2), 'utf-8');
    console.log('✓ Created fallback manifest.json');
    return;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Write manifest
  const manifestPath = path.join(screenshotsDir, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\n✅ Screenshot capture complete!`);
  console.log(`📦 Output directory: ${screenshotsDir}`);
  console.log(`   Total screenshots: ${manifest.screenshots.length}`);
}

takeScreenshots().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
