#!/usr/bin/env node

/**
 * Comprehensive Pre-Build Validation System
 * Validates JSON schemas, HTML references, assets, and content completeness
 * 
 * Usage:
 *   node scripts/validate-all.mjs                    # Full validation
 *   node scripts/validate-all.mjs --content         # Content JSON only
 *   node scripts/validate-all.mjs --assets          # Assets only
 *   node scripts/validate-all.mjs --html            # HTML references only
 *   node scripts/validate-all.mjs --fix             # Auto-fix where possible
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
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function color(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Schema mappings for data files
const SCHEMA_MAPPINGS = {
  'personas.json': 'schemas/personas.schema.json',
  'user-flows.json': 'schemas/user-flows.schema.json',
  'project-status.json': 'schemas/project-status.schema.json',
  'page-blueprints.json': 'schemas/page-blueprints.schema.json',
  'theme-config.json': 'schemas/theme-config.schema.json',
  'ai-config.json': 'schemas/ai-config.schema.json',
  'site-config.json': 'schemas/site-config.schema.json'
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    content: false,
    assets: false,
    html: false,
    schemas: false,
    fix: false,
    verbose: false,
    help: false,
    all: true
  };

  for (const arg of args) {
    if (arg === '--content' || arg === '-c') {
      options.content = true;
      options.all = false;
    } else if (arg === '--assets' || arg === '-a') {
      options.assets = true;
      options.all = false;
    } else if (arg === '--html' || arg === '-h') {
      options.html = true;
      options.all = false;
    } else if (arg === '--schemas' || arg === '-s') {
      options.schemas = true;
      options.all = false;
    } else if (arg === '--fix' || arg === '-f') {
      options.fix = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Pre-Build Validation System', colors.bold, colors.cyan)}

Validates JSON schemas, HTML references, assets, and content completeness.

${color('Usage:', colors.bold)}
  node scripts/validate-all.mjs [options]

${color('Options:', colors.bold)}
  --content, -c    Validate content JSON files only
  --assets, -a     Validate asset references only
  --html, -h       Validate HTML files only
  --schemas, -s    Validate JSON schemas only
  --fix, -f        Auto-fix issues where possible
  --verbose, -v    Show detailed output
  --help           Show this help message

${color('Examples:', colors.bold)}
  npm run validate                    # Full validation
  npm run validate:content            # Content only
  npm run validate:assets             # Assets only
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
 * Simple JSON Schema validator (basic implementation)
 */
function validateAgainstSchema(data, schema, path = '') {
  const errors = [];
  
  // Check type
  if (schema.type) {
    const actualType = Array.isArray(data) ? 'array' : typeof data;
    if (schema.type !== actualType && data !== null && data !== undefined) {
      errors.push({
        path: path || 'root',
        message: `Expected type "${schema.type}", got "${actualType}"`,
        severity: 'error'
      });
      return errors; // Type mismatch, skip further validation
    }
  }
  
  // Check required properties
  if (schema.required && schema.type === 'object' && data) {
    for (const prop of schema.required) {
      if (!(prop in data) || data[prop] === undefined || data[prop] === null || data[prop] === '') {
        errors.push({
          path: path ? `${path}.${prop}` : prop,
          message: `Required property "${prop}" is missing or empty`,
          severity: 'error'
        });
      }
    }
  }
  
  // Check string constraints
  if (schema.type === 'string' && typeof data === 'string') {
    if (schema.minLength && data.length < schema.minLength) {
      errors.push({
        path,
        message: `String length ${data.length} is less than minimum ${schema.minLength}`,
        severity: 'error'
      });
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push({
        path,
        message: `String does not match pattern "${schema.pattern}"`,
        severity: 'warning'
      });
    }
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push({
        path,
        message: `Value "${data}" is not one of: ${schema.enum.join(', ')}`,
        severity: 'error'
      });
    }
  }
  
  // Check number constraints
  if ((schema.type === 'integer' || schema.type === 'number') && typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({
        path,
        message: `Value ${data} is less than minimum ${schema.minimum}`,
        severity: 'error'
      });
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({
        path,
        message: `Value ${data} is greater than maximum ${schema.maximum}`,
        severity: 'error'
      });
    }
  }
  
  // Check array items
  if (schema.type === 'array' && Array.isArray(data)) {
    if (schema.minItems && data.length < schema.minItems) {
      errors.push({
        path,
        message: `Array has ${data.length} items, minimum is ${schema.minItems}`,
        severity: 'error'
      });
    }
    if (schema.items) {
      data.forEach((item, index) => {
        const itemErrors = validateAgainstSchema(item, schema.items, `${path}[${index}]`);
        errors.push(...itemErrors);
      });
    }
  }
  
  // Check object properties
  if (schema.type === 'object' && typeof data === 'object' && data !== null) {
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (prop in data && data[prop] !== undefined) {
          const propErrors = validateAgainstSchema(data[prop], propSchema, path ? `${path}.${prop}` : prop);
          errors.push(...propErrors);
        }
      }
    }
  }
  
  return errors;
}

/**
 * Validate data files against their schemas
 */
async function validateSchemas(options) {
  const results = {
    checked: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  console.log(`\n${color('Validating JSON Schemas', colors.bold, colors.cyan)}\n`);
  
  const dataDir = path.join(rootDir, 'src/data');
  
  for (const [dataFile, schemaFile] of Object.entries(SCHEMA_MAPPINGS)) {
    const dataPath = path.join(dataDir, dataFile);
    const schemaPath = path.join(dataDir, schemaFile);
    
    try {
      // Check if data file exists
      await fs.access(dataPath);
      
      // Load data
      const dataContent = await fs.readFile(dataPath, 'utf-8');
      const data = JSON.parse(dataContent);
      
      // Load schema
      let schema;
      try {
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        schema = JSON.parse(schemaContent);
      } catch {
        console.log(`  ${color('○', colors.yellow)} ${dataFile} - Schema not found: ${schemaFile}`);
        results.errors.push({
          file: dataFile,
          message: `Schema file not found: ${schemaFile}`,
          severity: 'warning'
        });
        continue;
      }
      
      // Validate
      const errors = validateAgainstSchema(data, schema);
      results.checked++;
      
      if (errors.length === 0) {
        console.log(`  ${color('✓', colors.green)} ${dataFile}`);
        results.passed++;
      } else {
        console.log(`  ${color('✗', colors.red)} ${dataFile} - ${errors.length} issue(s)`);
        results.failed++;
        
        if (options.verbose) {
          for (const error of errors.slice(0, 5)) {
            const icon = error.severity === 'error' ? color('●', colors.red) : color('●', colors.yellow);
            console.log(`      ${icon} ${error.path}: ${error.message}`);
          }
          if (errors.length > 5) {
            console.log(`      ${color('...and', colors.dim)} ${errors.length - 5} ${color('more', colors.dim)}`);
          }
        }
        
        results.errors.push(...errors.map(e => ({ ...e, file: dataFile })));
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(`  ${color('○', colors.dim)} ${dataFile} - File not found (optional)`);
      } else {
        console.log(`  ${color('✗', colors.red)} ${dataFile} - Parse error: ${e.message}`);
        results.failed++;
        results.errors.push({
          file: dataFile,
          message: `Parse error: ${e.message}`,
          severity: 'error'
        });
      }
    }
  }
  
  return results;
}

/**
 * Validate content JSON files
 */
async function validateContent(options) {
  const results = {
    checked: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
  };
  
  console.log(`\n${color('Validating Content Files', colors.bold, colors.cyan)}\n`);
  
  const contentDir = path.join(rootDir, 'src/content');
  const contentFiles = await findFiles(contentDir, '.json');
  
  // Filter out schema and template files
  const validFiles = contentFiles.filter(f => {
    const name = path.basename(f);
    return !name.startsWith('_') && !name.includes('schema');
  });
  
  for (const file of validFiles) {
    const relativePath = path.relative(rootDir, file);
    
    try {
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      const issues = [];
      
      // Check for required meta fields
      if (!data.meta?.title) {
        issues.push({ path: 'meta.title', message: 'Missing page title', severity: 'warning' });
      }
      if (!data.meta?.description) {
        issues.push({ path: 'meta.description', message: 'Missing meta description', severity: 'warning' });
      }
      if (!data.meta?.language) {
        issues.push({ path: 'meta.language', message: 'Missing language code', severity: 'warning' });
      }
      
      // Check for empty sections
      const sections = ['hero', 'features', 'stats', 'testimonials', 'faq', 'cta', 'contact'];
      for (const section of sections) {
        if (data[section]) {
          if (data[section].headline === '' || data[section].headline === '[PLACEHOLDER]') {
            issues.push({ path: `${section}.headline`, message: 'Empty or placeholder headline', severity: 'warning' });
          }
        }
      }
      
      results.checked++;
      
      if (issues.length === 0) {
        console.log(`  ${color('✓', colors.green)} ${relativePath}`);
        results.passed++;
      } else {
        const errorCount = issues.filter(i => i.severity === 'error').length;
        const warningCount = issues.filter(i => i.severity === 'warning').length;
        
        if (errorCount > 0) {
          console.log(`  ${color('✗', colors.red)} ${relativePath} - ${errorCount} error(s), ${warningCount} warning(s)`);
          results.failed++;
        } else {
          console.log(`  ${color('⚠', colors.yellow)} ${relativePath} - ${warningCount} warning(s)`);
          results.warnings++;
          results.passed++;
        }
        
        if (options.verbose) {
          for (const issue of issues.slice(0, 5)) {
            const icon = issue.severity === 'error' ? color('●', colors.red) : color('●', colors.yellow);
            console.log(`      ${icon} ${issue.path}: ${issue.message}`);
          }
        }
        
        results.errors.push(...issues.map(i => ({ ...i, file: relativePath })));
      }
    } catch (e) {
      console.log(`  ${color('✗', colors.red)} ${relativePath} - ${e.message}`);
      results.failed++;
      results.errors.push({
        file: relativePath,
        message: e.message,
        severity: 'error'
      });
    }
  }
  
  if (validFiles.length === 0) {
    console.log(`  ${color('○', colors.dim)} No content files found`);
  }
  
  return results;
}

/**
 * Validate HTML files for broken references
 */
async function validateHTML(options) {
  const results = {
    checked: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  console.log(`\n${color('Validating HTML Files', colors.bold, colors.cyan)}\n`);
  
  const pagesDir = path.join(rootDir, 'src/pages');
  const sectionsDir = path.join(rootDir, 'src/sections');
  const componentsDir = path.join(rootDir, 'src/components');
  
  const htmlFiles = await findFiles(pagesDir, '.html');
  
  // Get available sections and components
  const availableSections = new Set();
  const availableComponents = new Set();
  
  try {
    const sections = await fs.readdir(sectionsDir);
    sections.filter(f => f.endsWith('.html')).forEach(f => availableSections.add(f.replace('.html', '')));
  } catch {}
  
  try {
    const components = await fs.readdir(componentsDir);
    components.filter(f => f.endsWith('.html')).forEach(f => availableComponents.add(f.replace('.html', '')));
  } catch {}
  
  for (const file of htmlFiles) {
    const relativePath = path.relative(rootDir, file);
    const issues = [];
    
    try {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for section references (data-section attributes)
      const sectionRefs = content.match(/data-section=["']([^"']+)["']/g) || [];
      for (const ref of sectionRefs) {
        const sectionName = ref.match(/data-section=["']([^"']+)["']/)[1];
        if (!availableSections.has(sectionName) && sectionName !== 'custom') {
          issues.push({
            path: `data-section="${sectionName}"`,
            message: `Section "${sectionName}" not found in src/sections/`,
            severity: 'warning'
          });
        }
      }
      
      // Check for broken script references
      const scriptRefs = content.match(/src=["']([^"']+\.(?:ts|js))["']/g) || [];
      for (const ref of scriptRefs) {
        const scriptPath = ref.match(/src=["']([^"']+)["']/)[1];
        if (!scriptPath.startsWith('http') && !scriptPath.startsWith('//')) {
          const resolvedPath = path.resolve(path.dirname(file), scriptPath.replace('.ts', '.ts'));
          try {
            await fs.access(resolvedPath);
          } catch {
            // Try with .ts extension
            const tsPath = resolvedPath.replace('.js', '.ts');
            try {
              await fs.access(tsPath);
            } catch {
              issues.push({
                path: scriptPath,
                message: `Script file not found`,
                severity: 'error'
              });
            }
          }
        }
      }
      
      // Check for broken stylesheet references
      const styleRefs = content.match(/href=["']([^"']+\.css)["']/g) || [];
      for (const ref of styleRefs) {
        const stylePath = ref.match(/href=["']([^"']+)["']/)[1];
        if (!stylePath.startsWith('http') && !stylePath.startsWith('//')) {
          const resolvedPath = path.resolve(path.dirname(file), stylePath);
          try {
            await fs.access(resolvedPath);
          } catch {
            issues.push({
              path: stylePath,
              message: `Stylesheet not found`,
              severity: 'error'
            });
          }
        }
      }
      
      results.checked++;
      
      if (issues.length === 0) {
        console.log(`  ${color('✓', colors.green)} ${relativePath}`);
        results.passed++;
      } else {
        const errorCount = issues.filter(i => i.severity === 'error').length;
        console.log(`  ${color(errorCount > 0 ? '✗' : '⚠', errorCount > 0 ? colors.red : colors.yellow)} ${relativePath} - ${issues.length} issue(s)`);
        if (errorCount > 0) results.failed++;
        else results.passed++;
        
        if (options.verbose) {
          for (const issue of issues) {
            const icon = issue.severity === 'error' ? color('●', colors.red) : color('●', colors.yellow);
            console.log(`      ${icon} ${issue.path}: ${issue.message}`);
          }
        }
        
        results.errors.push(...issues.map(i => ({ ...i, file: relativePath })));
      }
    } catch (e) {
      console.log(`  ${color('✗', colors.red)} ${relativePath} - ${e.message}`);
      results.failed++;
    }
  }
  
  return results;
}

/**
 * Validate asset references
 */
async function validateAssets(options) {
  const results = {
    checked: 0,
    passed: 0,
    failed: 0,
    missing: [],
    errors: []
  };
  
  console.log(`\n${color('Validating Asset References', colors.bold, colors.cyan)}\n`);
  
  const contentDir = path.join(rootDir, 'src/content');
  const assetsDir = path.join(rootDir, 'src/assets');
  const publicDir = path.join(rootDir, 'public');
  
  const contentFiles = await findFiles(contentDir, '.json');
  const referencedAssets = new Set();
  
  // Extract image references from content files
  for (const file of contentFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      
      // Find all image.src, avatar.src, backgroundImage, etc.
      const jsonStr = JSON.stringify(data);
      const imgRefs = jsonStr.match(/"(?:src|image|backgroundImage|avatar|logo)":\s*"([^"]+)"/g) || [];
      
      for (const ref of imgRefs) {
        const match = ref.match(/":\s*"([^"]+)"/);
        if (match && match[1] && !match[1].startsWith('http') && match[1] !== 'placeholder') {
          referencedAssets.add(match[1]);
        }
      }
    } catch {
      // Skip unparseable files
    }
  }
  
  // Check if referenced assets exist
  for (const asset of referencedAssets) {
    results.checked++;
    
    const possiblePaths = [
      path.join(assetsDir, asset),
      path.join(publicDir, asset),
      path.join(rootDir, asset),
      path.join(assetsDir, 'generated', asset)
    ];
    
    let found = false;
    for (const assetPath of possiblePaths) {
      try {
        await fs.access(assetPath);
        found = true;
        break;
      } catch {
        // Try next path
      }
    }
    
    if (found) {
      results.passed++;
      if (options.verbose) {
        console.log(`  ${color('✓', colors.green)} ${asset}`);
      }
    } else {
      results.failed++;
      results.missing.push(asset);
      console.log(`  ${color('✗', colors.red)} ${asset} - Not found`);
    }
  }
  
  if (results.checked === 0) {
    console.log(`  ${color('○', colors.dim)} No asset references found in content`);
  } else if (results.failed === 0) {
    console.log(`  ${color('✓', colors.green)} All ${results.passed} referenced assets found`);
  }
  
  return results;
}

/**
 * Main validation function
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log(`\n${color('═'.repeat(50), colors.cyan)}`);
  console.log(color('  Pre-Build Validation', colors.bold, colors.cyan));
  console.log(`${color('═'.repeat(50), colors.cyan)}`);
  
  const startTime = Date.now();
  const allResults = {
    schemas: null,
    content: null,
    html: null,
    assets: null
  };
  
  // Run validations based on options
  if (options.all || options.schemas) {
    allResults.schemas = await validateSchemas(options);
  }
  
  if (options.all || options.content) {
    allResults.content = await validateContent(options);
  }
  
  if (options.all || options.html) {
    allResults.html = await validateHTML(options);
  }
  
  if (options.all || options.assets) {
    allResults.assets = await validateAssets(options);
  }
  
  // Calculate totals
  const totals = {
    checked: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  for (const result of Object.values(allResults)) {
    if (result) {
      totals.checked += result.checked || 0;
      totals.passed += result.passed || 0;
      totals.failed += result.failed || 0;
      totals.warnings += result.warnings || 0;
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log(`\n${color('─'.repeat(50), colors.dim)}`);
  console.log(`\n${color('Summary', colors.bold)}\n`);
  console.log(`  Checked:  ${totals.checked}`);
  console.log(`  Passed:   ${color(totals.passed.toString(), colors.green)}`);
  console.log(`  Failed:   ${color(totals.failed.toString(), totals.failed > 0 ? colors.red : colors.green)}`);
  console.log(`  Warnings: ${color(totals.warnings.toString(), totals.warnings > 0 ? colors.yellow : colors.green)}`);
  console.log(`  Duration: ${duration}s`);
  
  // Overall status
  console.log('');
  if (totals.failed > 0) {
    console.log(color('  ✗ Validation FAILED', colors.bold, colors.red));
    console.log(color(`    ${totals.failed} critical issue(s) must be fixed before build.`, colors.red));
    console.log('');
    process.exit(1);
  } else if (totals.warnings > 0) {
    console.log(color('  ⚠ Validation PASSED with warnings', colors.bold, colors.yellow));
    console.log(color(`    ${totals.warnings} warning(s) should be reviewed.`, colors.yellow));
    console.log('');
    process.exit(0);
  } else {
    console.log(color('  ✓ Validation PASSED', colors.bold, colors.green));
    console.log('');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
