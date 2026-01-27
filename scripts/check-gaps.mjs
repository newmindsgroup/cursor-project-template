#!/usr/bin/env node

/**
 * Check Gaps - Identify Missing Content and Assets
 * Scans content files and assets to find gaps in project completion
 * 
 * Usage:
 *   node scripts/check-gaps.mjs           # Check all gaps
 *   node scripts/check-gaps.mjs --json    # Output as JSON
 *   node scripts/check-gaps.mjs --fix     # Auto-fix gaps where possible
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
    json: false,
    fix: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--fix') {
      options.fix = true;
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
${color('Check Gaps - Identify Missing Content and Assets', colors.bold, colors.cyan)}

Scan content files and assets to find gaps in project completion.

${color('Usage:', colors.bold)}
  node scripts/check-gaps.mjs [options]

${color('Options:', colors.bold)}
  --json          Output as JSON
  --fix           Auto-fix gaps where possible
  --verbose, -v   Show detailed output
  --help, -h      Show this help message

${color('Checks:', colors.bold)}
  - Missing content files
  - Empty or placeholder headlines
  - Missing image references
  - Broken asset links
  - Incomplete meta information
`);
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
        if (typeof pattern === 'string') {
          if (entry.name.endsWith(pattern)) {
            files.push(fullPath);
          }
        } else if (pattern instanceof RegExp) {
          if (pattern.test(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return files;
}

/**
 * Check for placeholder or empty content
 */
function isPlaceholder(value) {
  if (!value) return true;
  if (typeof value !== 'string') return false;
  
  const placeholderPatterns = [
    /^\[.*\]$/,              // [PLACEHOLDER]
    /^placeholder$/i,
    /^lorem ipsum/i,
    /^todo/i,
    /^tbd$/i,
    /^coming soon$/i,
    /^xxx/i,
    /^___/,
    /^\.\.\.$/
  ];
  
  const trimmed = value.trim();
  return trimmed === '' || placeholderPatterns.some(p => p.test(trimmed));
}

/**
 * Check content files for gaps
 */
async function checkContentGaps(contentDir) {
  const gaps = {
    missingContent: [],
    placeholders: [],
    emptyFields: []
  };
  
  const contentFiles = await findFiles(contentDir, '.json');
  
  for (const file of contentFiles) {
    // Skip schema and template files
    if (file.includes('schema') || path.basename(file).startsWith('_')) {
      continue;
    }
    
    try {
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      const relativePath = path.relative(rootDir, file);
      const pageName = path.basename(file, '.json');
      
      // Check meta
      if (!data.meta?.title || isPlaceholder(data.meta.title)) {
        gaps.emptyFields.push({
          page: pageName,
          file: relativePath,
          field: 'meta.title',
          value: data.meta?.title || '(empty)'
        });
      }
      
      if (!data.meta?.description || isPlaceholder(data.meta.description)) {
        gaps.emptyFields.push({
          page: pageName,
          file: relativePath,
          field: 'meta.description',
          value: data.meta?.description || '(empty)'
        });
      }
      
      // Check hero
      if (data.hero) {
        if (isPlaceholder(data.hero.headline)) {
          gaps.placeholders.push({
            page: pageName,
            file: relativePath,
            field: 'hero.headline',
            value: data.hero.headline || '(empty)'
          });
        }
        
        if (isPlaceholder(data.hero.subheadline)) {
          gaps.placeholders.push({
            page: pageName,
            file: relativePath,
            field: 'hero.subheadline',
            value: data.hero.subheadline || '(empty)'
          });
        }
      }
      
      // Check features
      if (data.features?.items) {
        data.features.items.forEach((item, i) => {
          if (isPlaceholder(item.title)) {
            gaps.placeholders.push({
              page: pageName,
              file: relativePath,
              field: `features.items[${i}].title`,
              value: item.title || '(empty)'
            });
          }
        });
      }
      
      // Check CTA
      if (data.cta) {
        if (isPlaceholder(data.cta.headline)) {
          gaps.placeholders.push({
            page: pageName,
            file: relativePath,
            field: 'cta.headline',
            value: data.cta.headline || '(empty)'
          });
        }
      }
      
    } catch (error) {
      gaps.missingContent.push({
        file: path.relative(rootDir, file),
        error: error.message
      });
    }
  }
  
  return gaps;
}

/**
 * Check for missing images
 */
async function checkImageGaps(contentDir, assetsDir) {
  const gaps = {
    missingImages: [],
    unreferenced: []
  };
  
  const contentFiles = await findFiles(contentDir, '.json');
  const referencedImages = new Set();
  
  // Find all image references in content
  for (const file of contentFiles) {
    if (file.includes('schema') || path.basename(file).startsWith('_')) {
      continue;
    }
    
    try {
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      const pageName = path.basename(file, '.json');
      
      // Find all image objects
      const findImages = (obj, pathPrefix = '') => {
        if (!obj || typeof obj !== 'object') return;
        
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
          
          if (key === 'image' || key === 'avatar' || key === 'backgroundImage') {
            if (typeof value === 'object' && value.id) {
              referencedImages.add({
                page: pageName,
                field: currentPath,
                id: value.id,
                prompt: value.prompt,
                generate: value.generate
              });
            } else if (typeof value === 'string' && value && !value.startsWith('http')) {
              referencedImages.add({
                page: pageName,
                field: currentPath,
                path: value
              });
            }
          }
          
          if (Array.isArray(value)) {
            value.forEach((item, i) => findImages(item, `${currentPath}[${i}]`));
          } else if (typeof value === 'object') {
            findImages(value, currentPath);
          }
        }
      };
      
      findImages(data);
      
    } catch {
      // Skip files that can't be parsed
    }
  }
  
  // Check if referenced images exist
  const generatedDir = path.join(assetsDir, 'generated');
  let generatedFiles = [];
  
  try {
    generatedFiles = await fs.readdir(generatedDir);
  } catch {
    // No generated directory
  }
  
  for (const ref of referencedImages) {
    if (ref.id) {
      // Check for generated image
      const exists = generatedFiles.some(f => 
        f.startsWith(ref.id) || f.includes(ref.id)
      );
      
      if (!exists && ref.generate !== false) {
        gaps.missingImages.push({
          page: ref.page,
          field: ref.field,
          id: ref.id,
          prompt: ref.prompt
        });
      }
    } else if (ref.path) {
      // Check for static image
      const possiblePaths = [
        path.join(assetsDir, ref.path),
        path.join(assetsDir, 'images', ref.path),
        path.join(rootDir, 'public', ref.path)
      ];
      
      let exists = false;
      for (const p of possiblePaths) {
        try {
          await fs.access(p);
          exists = true;
          break;
        } catch {
          // Continue checking
        }
      }
      
      if (!exists) {
        gaps.missingImages.push({
          page: ref.page,
          field: ref.field,
          path: ref.path
        });
      }
    }
  }
  
  return gaps;
}

/**
 * Check for missing page files
 */
async function checkPageGaps(pagesDir, contentDir) {
  const gaps = {
    missingPages: [],
    missingContentForPages: []
  };
  
  // Expected pages based on content
  const contentFiles = await findFiles(path.join(contentDir, 'en'), '.json');
  const contentPages = contentFiles
    .filter(f => !f.includes('schema') && !path.basename(f).startsWith('_'))
    .map(f => path.basename(f, '.json'));
  
  // Check if page HTML exists for each content file
  for (const pageName of contentPages) {
    const htmlName = pageName === 'home' ? 'index.html' : `${pageName}.html`;
    const pagePath = path.join(pagesDir, htmlName);
    
    try {
      await fs.access(pagePath);
    } catch {
      gaps.missingPages.push({
        page: pageName,
        expectedPath: path.relative(rootDir, pagePath)
      });
    }
  }
  
  // Check if content exists for main pages
  const mainPages = ['index.html', 'about.html', 'services.html', 'contact.html'];
  
  for (const htmlFile of mainPages) {
    const pagePath = path.join(pagesDir, htmlFile);
    
    try {
      await fs.access(pagePath);
      
      // Page exists, check for content
      const contentName = htmlFile === 'index.html' ? 'home' : htmlFile.replace('.html', '');
      const contentPath = path.join(contentDir, 'en', `${contentName}.json`);
      
      try {
        await fs.access(contentPath);
      } catch {
        gaps.missingContentForPages.push({
          page: contentName,
          htmlPath: path.relative(rootDir, pagePath),
          expectedContent: path.relative(rootDir, contentPath)
        });
      }
    } catch {
      // Page doesn't exist, skip
    }
  }
  
  return gaps;
}

/**
 * Check for validation errors
 */
async function checkValidationErrors() {
  const errors = [];
  
  // Check for common validation issues
  const settingsPath = path.join(rootDir, 'project-settings.json');
  
  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(content);
    
    if (!settings.project?.name) {
      errors.push({
        file: 'project-settings.json',
        error: 'Project name not configured'
      });
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      errors.push({
        file: 'project-settings.json',
        error: error.message
      });
    }
  }
  
  // Check PROJECT.md exists
  try {
    await fs.access(path.join(rootDir, 'PROJECT.md'));
  } catch {
    errors.push({
      file: 'PROJECT.md',
      error: 'File not found - run wizard setup'
    });
  }
  
  // Check SCOPE.md exists
  try {
    await fs.access(path.join(rootDir, 'SCOPE.md'));
  } catch {
    errors.push({
      file: 'SCOPE.md',
      error: 'File not found - run wizard setup'
    });
  }
  
  return errors;
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
  
  const contentDir = path.join(rootDir, 'src/content');
  const assetsDir = path.join(rootDir, 'src/assets');
  const pagesDir = path.join(rootDir, 'src/pages');
  
  if (!options.json) {
    console.log(`\n${color('Checking for Gaps', colors.bold, colors.cyan)}\n`);
  }
  
  // Run all checks
  const contentGaps = await checkContentGaps(contentDir);
  const imageGaps = await checkImageGaps(contentDir, assetsDir);
  const pageGaps = await checkPageGaps(pagesDir, contentDir);
  const validationErrors = await checkValidationErrors();
  
  // Compile results
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      content: contentGaps.placeholders.length + contentGaps.emptyFields.length,
      images: imageGaps.missingImages.length,
      pages: pageGaps.missingPages.length + pageGaps.missingContentForPages.length,
      errors: validationErrors.length
    },
    content: [
      ...contentGaps.placeholders.map(g => ({ ...g, type: 'placeholder' })),
      ...contentGaps.emptyFields.map(g => ({ ...g, type: 'empty' }))
    ],
    images: imageGaps.missingImages,
    pages: [
      ...pageGaps.missingPages,
      ...pageGaps.missingContentForPages
    ],
    errors: validationErrors
  };
  
  results.summary.total = 
    results.summary.content + 
    results.summary.images + 
    results.summary.pages + 
    results.summary.errors;
  
  // Output results
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    // Content gaps
    console.log(color('Content Gaps:', colors.bold));
    if (results.content.length === 0) {
      console.log(color('  ✓ No content gaps found', colors.green));
    } else {
      for (const gap of results.content.slice(0, 10)) {
        console.log(`  ${color('•', colors.yellow)} ${gap.page}: ${gap.field}`);
        if (options.verbose) {
          console.log(color(`      Value: ${gap.value}`, colors.dim));
        }
      }
      if (results.content.length > 10) {
        console.log(color(`    ... and ${results.content.length - 10} more`, colors.dim));
      }
    }
    
    // Image gaps
    console.log(`\n${color('Missing Images:', colors.bold)}`);
    if (results.images.length === 0) {
      console.log(color('  ✓ No missing images', colors.green));
    } else {
      for (const gap of results.images.slice(0, 10)) {
        console.log(`  ${color('•', colors.yellow)} ${gap.page}: ${gap.id || gap.path}`);
      }
      if (results.images.length > 10) {
        console.log(color(`    ... and ${results.images.length - 10} more`, colors.dim));
      }
    }
    
    // Page gaps
    console.log(`\n${color('Page Gaps:', colors.bold)}`);
    if (results.pages.length === 0) {
      console.log(color('  ✓ No page gaps found', colors.green));
    } else {
      for (const gap of results.pages) {
        console.log(`  ${color('•', colors.yellow)} ${gap.page}: ${gap.expectedPath || gap.expectedContent}`);
      }
    }
    
    // Errors
    console.log(`\n${color('Validation Errors:', colors.bold)}`);
    if (results.errors.length === 0) {
      console.log(color('  ✓ No errors found', colors.green));
    } else {
      for (const error of results.errors) {
        console.log(`  ${color('✗', colors.red)} ${error.file}: ${error.error}`);
      }
    }
    
    // Summary
    console.log(`\n${color('═'.repeat(50), colors.dim)}`);
    console.log(`\n${color('Summary:', colors.bold)}`);
    console.log(`  Content gaps:  ${color(results.summary.content.toString(), results.summary.content > 0 ? colors.yellow : colors.green)}`);
    console.log(`  Missing images: ${color(results.summary.images.toString(), results.summary.images > 0 ? colors.yellow : colors.green)}`);
    console.log(`  Page gaps:     ${color(results.summary.pages.toString(), results.summary.pages > 0 ? colors.yellow : colors.green)}`);
    console.log(`  Errors:        ${color(results.summary.errors.toString(), results.summary.errors > 0 ? colors.red : colors.green)}`);
    console.log(`  Total:         ${color(results.summary.total.toString(), results.summary.total > 0 ? colors.yellow : colors.green)}`);
    console.log('');
  }
  
  // Exit with error code if gaps found
  process.exit(results.summary.total > 0 ? 1 : 0);
}

main().catch(error => {
  console.error(color(`Error: ${error.message}`, colors.red));
  process.exit(1);
});
