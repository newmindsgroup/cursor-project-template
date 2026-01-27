#!/usr/bin/env node

/**
 * Content Import Script
 * Import translated content from CSV back to JSON
 * 
 * Usage:
 *   node scripts/import-content.mjs <csv-file>
 *   node scripts/import-content.mjs _handoff/content/all-content.csv
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'src', 'content');

// Parse CSV line (handles quoted values with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Parse CSV content
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return { headers, rows };
}

// Set nested value in object
function setNestedValue(obj, key, value) {
  const parts = key.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    let part = parts[i];
    
    // Handle array notation like "items[0]"
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      if (!current[arrayName]) current[arrayName] = [];
      if (!current[arrayName][parseInt(index)]) current[arrayName][parseInt(index)] = {};
      current = current[arrayName][parseInt(index)];
    } else {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  }
  
  const lastPart = parts[parts.length - 1];
  const lastArrayMatch = lastPart.match(/^(.+)\[(\d+)\]$/);
  
  if (lastArrayMatch) {
    const [, arrayName, index] = lastArrayMatch;
    if (!current[arrayName]) current[arrayName] = [];
    current[arrayName][parseInt(index)] = value;
  } else {
    current[lastPart] = value;
  }
}

// Load existing content or create new
async function loadOrCreateContent(language, page) {
  const filePath = path.join(contentDir, language, `${page}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Create new content with basic structure
    return {
      meta: {
        title: '',
        description: '',
        language: language,
        status: 'draft',
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

// Save content to file
async function saveContent(language, page, content) {
  const langDir = path.join(contentDir, language);
  const filePath = path.join(langDir, `${page}.json`);
  
  // Ensure directory exists
  await fs.mkdir(langDir, { recursive: true });
  
  // Update timestamp
  if (content.meta) {
    content.meta.lastUpdated = new Date().toISOString();
  }
  
  await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
}

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    csvFile: args.find(a => !a.startsWith('-')),
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help') || args.includes('-h')
  };
}

// Show help
function showHelp() {
  console.log(`
Content Import - Import translated content from CSV to JSON

Usage:
  node scripts/import-content.mjs <csv-file>

Options:
  --dry-run    Preview changes without writing files
  --help, -h   Show this help message

Expected CSV Format:
  page,key,en,es,max_chars,notes
  home,hero.headline,"Build Websites","Crea Sitios",80,Main H1

The CSV should have:
  - page: Page name (home, about, etc.)
  - key: Content key path (hero.headline, meta.title, etc.)
  - Language columns: en, es, fr, etc.
  - Optional: max_chars, notes

Examples:
  node scripts/import-content.mjs _handoff/content/all-content.csv
  node scripts/import-content.mjs translations.csv --dry-run
`);
}

// Main function
async function main() {
  const args = parseArgs();
  
  if (args.help || !args.csvFile) {
    showHelp();
    process.exit(args.help ? 0 : 1);
  }
  
  // Read CSV file
  const csvPath = path.isAbsolute(args.csvFile) 
    ? args.csvFile 
    : path.join(rootDir, args.csvFile);
  
  let csvContent;
  try {
    csvContent = await fs.readFile(csvPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Could not read file: ${csvPath}`);
    process.exit(1);
  }
  
  const { headers, rows } = parseCSV(csvContent);
  
  if (rows.length === 0) {
    console.log('⚠️  No data rows found in CSV.');
    process.exit(0);
  }
  
  // Determine language columns (exclude known non-language columns)
  const nonLangColumns = ['page', 'key', 'max_chars', 'notes', 'section'];
  const languages = headers.filter(h => !nonLangColumns.includes(h) && h.length === 2);
  
  console.log(`\n📥 Importing content from CSV...\n`);
  console.log(`   File: ${args.csvFile}`);
  console.log(`   Rows: ${rows.length}`);
  console.log(`   Languages: ${languages.join(', ')}`);
  
  if (args.dryRun) {
    console.log('\n   🔍 DRY RUN - No files will be modified\n');
  }
  
  // Group rows by page and language
  const contentByPageLang = {};
  
  for (const row of rows) {
    const page = row.page;
    const key = row.key;
    
    if (!page || !key) continue;
    
    for (const lang of languages) {
      const value = row[lang];
      if (value === undefined || value === '') continue;
      
      if (!contentByPageLang[lang]) contentByPageLang[lang] = {};
      if (!contentByPageLang[lang][page]) contentByPageLang[lang][page] = {};
      
      contentByPageLang[lang][page][key] = value;
    }
  }
  
  // Process and save
  let filesUpdated = 0;
  let keysUpdated = 0;
  
  for (const [lang, pages] of Object.entries(contentByPageLang)) {
    console.log(`\n🌐 ${lang.toUpperCase()}:`);
    
    for (const [page, updates] of Object.entries(pages)) {
      const keyCount = Object.keys(updates).length;
      console.log(`   📄 ${page}.json: ${keyCount} keys`);
      
      if (!args.dryRun) {
        // Load existing content
        const content = await loadOrCreateContent(lang, page);
        
        // Apply updates
        for (const [key, value] of Object.entries(updates)) {
          setNestedValue(content, key, value);
          keysUpdated++;
        }
        
        // Save
        await saveContent(lang, page, content);
      } else {
        keysUpdated += keyCount;
      }
      
      filesUpdated++;
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Files: ${filesUpdated}`);
  console.log(`   Keys: ${keysUpdated}`);
  
  if (args.dryRun) {
    console.log(`\n   Run without --dry-run to apply changes.\n`);
  } else {
    console.log(`\n   Content files updated in src/content/\n`);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
