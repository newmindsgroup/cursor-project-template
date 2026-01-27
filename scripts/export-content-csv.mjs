#!/usr/bin/env node

/**
 * Content CSV Export Script
 * Exports multilingual content to CSV format for translation and review
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'src', 'content');
const outputDir = path.join(rootDir, '_handoff', 'content');

/**
 * Flatten nested object to dot-notation keys
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      result[newKey] = '';
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          Object.assign(result, flattenObject(item, `${newKey}[${index}]`));
        } else {
          result[`${newKey}[${index}]`] = item;
        }
      });
    } else if (typeof value === 'object') {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  
  return result;
}

/**
 * Escape CSV value
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Get all content files for a language
 */
async function getContentFiles(language) {
  const langDir = path.join(contentDir, language);
  
  try {
    const files = await fs.readdir(langDir);
    return files.filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}

/**
 * Load and flatten content file
 */
async function loadContent(language, filename) {
  const filePath = path.join(contentDir, language, filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content);
    return flattenObject(json);
  } catch (error) {
    console.error(`  Error loading ${language}/${filename}:`, error.message);
    return {};
  }
}

/**
 * Get character limit hint for a key
 */
function getCharLimit(key) {
  // Define limits based on schema
  const limits = {
    'meta.title': 60,
    'meta.description': 160,
    'hero.headline': 80,
    'hero.subheadline': 200,
    'cta.headline': 80,
    'cta.subheadline': 200,
    'cta.buttonText': 30,
  };
  
  for (const [pattern, limit] of Object.entries(limits)) {
    if (key.includes(pattern)) return limit;
  }
  
  // Generic limits
  if (key.includes('title')) return 60;
  if (key.includes('description')) return 200;
  if (key.includes('headline')) return 80;
  if (key.includes('buttonText') || key.includes('.text')) return 30;
  if (key.includes('quote')) return 500;
  if (key.includes('answer')) return 500;
  
  return '';
}

/**
 * Get content type note for a key
 */
function getNote(key) {
  if (key.includes('meta.title')) return 'Page title / SEO';
  if (key.includes('meta.description')) return 'Meta description / SEO';
  if (key.includes('hero.headline')) return 'Main H1 headline';
  if (key.includes('primaryCta')) return 'Primary call-to-action button';
  if (key.includes('secondaryCta')) return 'Secondary call-to-action button';
  if (key.includes('testimonials')) return 'Customer testimonial';
  if (key.includes('faq')) return 'FAQ item';
  if (key.includes('features')) return 'Feature description';
  return '';
}

/**
 * Export content to CSV
 */
async function exportCSV() {
  console.log('📦 Exporting content to CSV...\n');
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get all available languages
  const entries = await fs.readdir(contentDir, { withFileTypes: true });
  const languages = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_') && e.name !== 'schema' && e.name !== 'storybrand')
    .map(e => e.name);
  
  if (languages.length === 0) {
    console.log('⚠ No language directories found in src/content/');
    return;
  }
  
  console.log(`📂 Found languages: ${languages.join(', ')}`);
  
  // Use first language as base
  const baseLanguage = languages[0];
  const baseFiles = await getContentFiles(baseLanguage);
  
  if (baseFiles.length === 0) {
    console.log(`⚠ No content files found in src/content/${baseLanguage}/`);
    return;
  }
  
  // Process each content file
  for (const filename of baseFiles) {
    const pageName = filename.replace('.json', '');
    console.log(`\n📄 Processing: ${pageName}`);
    
    // Load content for all languages
    const contentByLang = {};
    for (const lang of languages) {
      contentByLang[lang] = await loadContent(lang, filename);
    }
    
    // Get all unique keys from base language
    const allKeys = Object.keys(contentByLang[baseLanguage])
      .filter(key => {
        // Skip certain keys
        if (key.startsWith('$schema')) return false;
        if (key.includes('.url')) return false;
        if (key.includes('.icon')) return false;
        if (key.includes('.number')) return false;
        if (key.includes('.rating')) return false;
        if (key.includes('lastUpdated')) return false;
        if (key.includes('status')) return false;
        // Only include string values
        const value = contentByLang[baseLanguage][key];
        return typeof value === 'string' && value.length > 0;
      });
    
    // Build CSV
    const headers = ['page', 'key', ...languages, 'max_chars', 'notes'];
    const rows = [headers.map(h => escapeCSV(h)).join(',')];
    
    for (const key of allKeys) {
      const row = [
        escapeCSV(pageName),
        escapeCSV(key),
        ...languages.map(lang => escapeCSV(contentByLang[lang]?.[key] || '')),
        getCharLimit(key),
        escapeCSV(getNote(key)),
      ];
      rows.push(row.join(','));
    }
    
    // Write CSV
    const csvPath = path.join(outputDir, `${pageName}.csv`);
    await fs.writeFile(csvPath, rows.join('\n'), 'utf-8');
    console.log(`  ✓ Exported: ${pageName}.csv (${allKeys.length} strings)`);
  }
  
  // Create combined CSV with all pages
  console.log('\n📄 Creating combined export...');
  
  const allRows = [['page', 'key', ...languages, 'max_chars', 'notes'].map(h => escapeCSV(h)).join(',')];
  
  for (const filename of baseFiles) {
    const pageName = filename.replace('.json', '');
    const contentByLang = {};
    for (const lang of languages) {
      contentByLang[lang] = await loadContent(lang, filename);
    }
    
    const keys = Object.keys(contentByLang[baseLanguage])
      .filter(key => {
        if (key.startsWith('$schema')) return false;
        if (key.includes('.url')) return false;
        if (key.includes('.icon')) return false;
        if (key.includes('.number')) return false;
        if (key.includes('.rating')) return false;
        if (key.includes('lastUpdated')) return false;
        if (key.includes('status')) return false;
        const value = contentByLang[baseLanguage][key];
        return typeof value === 'string' && value.length > 0;
      });
    
    for (const key of keys) {
      const row = [
        escapeCSV(pageName),
        escapeCSV(key),
        ...languages.map(lang => escapeCSV(contentByLang[lang]?.[key] || '')),
        getCharLimit(key),
        escapeCSV(getNote(key)),
      ];
      allRows.push(row.join(','));
    }
  }
  
  const combinedPath = path.join(outputDir, 'all-content.csv');
  await fs.writeFile(combinedPath, allRows.join('\n'), 'utf-8');
  console.log(`  ✓ Exported: all-content.csv`);
  
  console.log(`\n✅ CSV export complete!`);
  console.log(`📦 Output directory: ${outputDir}`);
}

exportCSV().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
