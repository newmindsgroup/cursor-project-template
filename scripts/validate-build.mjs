#!/usr/bin/env node

/**
 * Build Validation Script
 * Validates the built prototype for common issues
 * 
 * Usage:
 *   node scripts/validate-build.mjs
 *   npm run build && node scripts/validate-build.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Validation rules
const validations = {
  criticalFiles: [
    'pages/index.html',
    'assets',
  ],
  requiredAssets: [
    '.js',
    '.css',
  ],
  maxFileSize: {
    '.js': 500 * 1024,   // 500KB
    '.css': 200 * 1024,  // 200KB
    '.html': 100 * 1024, // 100KB
  },
  htmlChecks: {
    hasTitle: /<title>.*<\/title>/i,
    hasViewport: /name="viewport"/i,
    hasLang: /<html.*lang=/i,
    noEmptyLinks: /href=""/g,
    noJSErrors: /javascript:void/i,
  }
};

// Severity levels
const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Get all files recursively
async function getAllFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Check if dist directory exists
async function checkDistExists() {
  try {
    await fs.access(distDir);
    return true;
  } catch {
    return false;
  }
}

// Validate HTML file
async function validateHTML(filePath) {
  const issues = [];
  const content = await fs.readFile(filePath, 'utf-8');
  const relativePath = path.relative(distDir, filePath);
  
  if (!validations.htmlChecks.hasTitle.test(content)) {
    issues.push({
      severity: SEVERITY.ERROR,
      file: relativePath,
      message: 'Missing <title> tag'
    });
  }
  
  if (!validations.htmlChecks.hasViewport.test(content)) {
    issues.push({
      severity: SEVERITY.WARNING,
      file: relativePath,
      message: 'Missing viewport meta tag'
    });
  }
  
  if (!validations.htmlChecks.hasLang.test(content)) {
    issues.push({
      severity: SEVERITY.WARNING,
      file: relativePath,
      message: 'Missing lang attribute on <html>'
    });
  }
  
  const emptyLinks = content.match(validations.htmlChecks.noEmptyLinks);
  if (emptyLinks && emptyLinks.length > 0) {
    issues.push({
      severity: SEVERITY.WARNING,
      file: relativePath,
      message: `Found ${emptyLinks.length} empty href attributes`
    });
  }
  
  // Check for broken relative links
  const linkMatches = content.matchAll(/(?:href|src)="([^"#]+)"/g);
  for (const match of linkMatches) {
    const link = match[1];
    if (link.startsWith('http') || link.startsWith('//') || link.startsWith('data:')) continue;
    
    const linkedPath = path.resolve(path.dirname(filePath), link);
    try {
      await fs.access(linkedPath);
    } catch {
      // Only warn for non-external resources
      if (!link.includes('fonts.')) {
        issues.push({
          severity: SEVERITY.INFO,
          file: relativePath,
          message: `Potentially broken link: ${link}`
        });
      }
    }
  }
  
  return issues;
}

// Validate file sizes
function validateFileSize(filePath, size) {
  const issues = [];
  const ext = path.extname(filePath);
  const relativePath = path.relative(distDir, filePath);
  
  const maxSize = validations.maxFileSize[ext];
  if (maxSize && size > maxSize) {
    issues.push({
      severity: SEVERITY.WARNING,
      file: relativePath,
      message: `File size (${(size / 1024).toFixed(1)}KB) exceeds recommended ${(maxSize / 1024).toFixed(1)}KB`
    });
  }
  
  return issues;
}

// Main validation function
async function validate() {
  const issues = [];
  const stats = {
    htmlFiles: 0,
    jsFiles: 0,
    cssFiles: 0,
    totalSize: 0
  };
  
  // Check dist exists
  if (!await checkDistExists()) {
    console.error('\n❌ Build directory not found. Run `npm run build` first.\n');
    process.exit(1);
  }
  
  console.log('\n🔍 Validating build...\n');
  
  // Check critical files
  for (const criticalFile of validations.criticalFiles) {
    const filePath = path.join(distDir, criticalFile);
    try {
      await fs.access(filePath);
    } catch {
      issues.push({
        severity: SEVERITY.ERROR,
        file: criticalFile,
        message: 'Critical file/directory missing'
      });
    }
  }
  
  // Get all files
  const files = await getAllFiles(distDir);
  
  // Validate each file
  for (const filePath of files) {
    const stat = await fs.stat(filePath);
    const ext = path.extname(filePath);
    
    stats.totalSize += stat.size;
    
    if (ext === '.html') {
      stats.htmlFiles++;
      const htmlIssues = await validateHTML(filePath);
      issues.push(...htmlIssues);
    } else if (ext === '.js') {
      stats.jsFiles++;
    } else if (ext === '.css') {
      stats.cssFiles++;
    }
    
    // Check file sizes
    issues.push(...validateFileSize(filePath, stat.size));
  }
  
  // Check for required asset types
  for (const ext of validations.requiredAssets) {
    const hasAsset = files.some(f => f.endsWith(ext));
    if (!hasAsset) {
      issues.push({
        severity: SEVERITY.WARNING,
        file: 'assets',
        message: `No ${ext} files found in build`
      });
    }
  }
  
  return { issues, stats };
}

// Generate report
function generateReport({ issues, stats }) {
  const errors = issues.filter(i => i.severity === SEVERITY.ERROR);
  const warnings = issues.filter(i => i.severity === SEVERITY.WARNING);
  const infos = issues.filter(i => i.severity === SEVERITY.INFO);
  
  console.log('📊 Build Validation Report\n');
  console.log('='.repeat(50));
  
  console.log('\n📁 Build Statistics:');
  console.log(`   HTML files: ${stats.htmlFiles}`);
  console.log(`   JS files:   ${stats.jsFiles}`);
  console.log(`   CSS files:  ${stats.cssFiles}`);
  console.log(`   Total size: ${(stats.totalSize / 1024).toFixed(1)}KB`);
  
  if (issues.length === 0) {
    console.log('\n✅ All checks passed!\n');
    return { errors: 0, warnings: 0 };
  }
  
  console.log(`\n🔎 Issues Found: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info\n`);
  
  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.message}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.message}`);
    });
    console.log('');
  }
  
  if (infos.length > 0) {
    console.log('ℹ️  Info:');
    infos.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.message}`);
    });
    console.log('');
  }
  
  return { errors: errors.length, warnings: warnings.length };
}

// Main
async function main() {
  const result = await validate();
  const { errors } = generateReport(result);
  
  if (errors > 0) {
    console.log('🔧 Fix errors before deploying.\n');
    process.exit(1);
  } else {
    console.log('✨ Build is ready for deployment!\n');
  }
}

main().catch(error => {
  console.error('❌ Validation error:', error.message);
  process.exit(1);
});
