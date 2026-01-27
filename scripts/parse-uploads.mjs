#!/usr/bin/env node

/**
 * Parse Uploaded Files
 * Extract text content from PDF, Word, Excel, CSV, and text files
 * 
 * Usage:
 *   node scripts/parse-uploads.mjs                    # Parse all files in business-context/uploads/
 *   node scripts/parse-uploads.mjs --file=path.pdf   # Parse specific file
 *   node scripts/parse-uploads.mjs --output=json     # Output as JSON
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
    file: null,
    output: 'console',
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Parse Uploaded Files', colors.bold, colors.cyan)}

Extract text from PDF, Word, Excel, CSV, and text files.

${color('Usage:', colors.bold)}
  node scripts/parse-uploads.mjs [options]

${color('Options:', colors.bold)}
  --file=PATH     Parse specific file
  --output=TYPE   Output format: console, json (default: console)
  --help, -h      Show this help message
`);
}

/**
 * Parse PDF file
 */
async function parsePDF(filePath) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return {
      type: 'pdf',
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.log(color(`  ⚠ Could not parse PDF (install pdf-parse): ${error.message}`, colors.yellow));
    return { type: 'pdf', text: '', error: error.message };
  }
}

/**
 * Parse Word document (.docx)
 */
async function parseWord(filePath) {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      type: 'word',
      text: result.value,
      messages: result.messages
    };
  } catch (error) {
    console.log(color(`  ⚠ Could not parse Word document (install mammoth): ${error.message}`, colors.yellow));
    return { type: 'word', text: '', error: error.message };
  }
}

/**
 * Parse Excel file (.xlsx, .xls)
 */
async function parseExcel(filePath) {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.readFile(filePath);
    
    const sheets = {};
    const textContent = [];
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      sheets[sheetName] = json;
      
      // Convert to text
      for (const row of json) {
        if (row.length > 0) {
          textContent.push(row.filter(cell => cell != null).join(' | '));
        }
      }
    }
    
    return {
      type: 'excel',
      text: textContent.join('\n'),
      sheets,
      sheetNames: workbook.SheetNames
    };
  } catch (error) {
    console.log(color(`  ⚠ Could not parse Excel file (install xlsx): ${error.message}`, colors.yellow));
    return { type: 'excel', text: '', error: error.message };
  }
}

/**
 * Parse CSV file
 */
async function parseCSV(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
    
    // Convert to text
    const textContent = rows.map(row => row.join(' | ')).join('\n');
    
    return {
      type: 'csv',
      text: textContent,
      rows,
      headers: rows[0] || []
    };
  } catch (error) {
    return { type: 'csv', text: '', error: error.message };
  }
}

/**
 * Parse text/markdown file
 */
async function parseText(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      type: 'text',
      text: content
    };
  } catch (error) {
    return { type: 'text', text: '', error: error.message };
  }
}

/**
 * Parse image file (extract filename and basic info)
 */
async function parseImage(filePath) {
  const stat = await fs.stat(filePath);
  return {
    type: 'image',
    text: `[Image: ${path.basename(filePath)}]`,
    size: stat.size,
    filename: path.basename(filePath)
  };
}

/**
 * Parse a single file based on extension
 */
async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  
  console.log(`  Processing: ${color(filename, colors.cyan)}`);
  
  switch (ext) {
    case '.pdf':
      return { filename, ...(await parsePDF(filePath)) };
    case '.doc':
    case '.docx':
      return { filename, ...(await parseWord(filePath)) };
    case '.xls':
    case '.xlsx':
      return { filename, ...(await parseExcel(filePath)) };
    case '.csv':
      return { filename, ...(await parseCSV(filePath)) };
    case '.txt':
    case '.md':
      return { filename, ...(await parseText(filePath)) };
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.webp':
      return { filename, ...(await parseImage(filePath)) };
    default:
      console.log(color(`    Skipping unsupported file type: ${ext}`, colors.yellow));
      return { filename, type: 'unknown', text: '' };
  }
}

/**
 * Consolidate extracted content into structured data
 */
function consolidateContent(results) {
  const consolidated = {
    summary: '',
    audience: '',
    services: '',
    brand: '',
    dataPoints: [],
    allText: '',
    files: results.map(r => ({
      filename: r.filename,
      type: r.type,
      textLength: r.text?.length || 0
    }))
  };
  
  // Combine all text
  const allText = results
    .filter(r => r.text)
    .map(r => `--- ${r.filename} ---\n${r.text}`)
    .join('\n\n');
  
  consolidated.allText = allText;
  
  // Extract structured data from Excel/CSV
  for (const result of results) {
    if (result.type === 'excel' && result.sheets) {
      for (const [sheetName, rows] of Object.entries(result.sheets)) {
        if (rows.length > 1) {
          consolidated.dataPoints.push({
            source: result.filename,
            sheet: sheetName,
            headers: rows[0],
            rowCount: rows.length - 1
          });
        }
      }
    } else if (result.type === 'csv' && result.rows) {
      consolidated.dataPoints.push({
        source: result.filename,
        headers: result.headers,
        rowCount: result.rows.length - 1
      });
    }
  }
  
  // Simple keyword extraction for categorization
  const textLower = allText.toLowerCase();
  
  // Try to identify business summary
  if (textLower.includes('about us') || textLower.includes('company') || textLower.includes('overview')) {
    const summaryMatch = allText.match(/(?:about us|company|overview)[:\s]*([^.]+\.)/i);
    if (summaryMatch) {
      consolidated.summary = summaryMatch[1].trim();
    }
  }
  
  // Try to identify audience
  if (textLower.includes('target') || textLower.includes('audience') || textLower.includes('customers')) {
    const audienceMatch = allText.match(/(?:target|audience|customers?)[:\s]*([^.]+\.)/i);
    if (audienceMatch) {
      consolidated.audience = audienceMatch[1].trim();
    }
  }
  
  // Try to identify services/products
  if (textLower.includes('services') || textLower.includes('products') || textLower.includes('solutions')) {
    const servicesMatch = allText.match(/(?:services|products|solutions)[:\s]*([^.]+\.)/i);
    if (servicesMatch) {
      consolidated.services = servicesMatch[1].trim();
    }
  }
  
  return consolidated;
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
  
  console.log(`\n${color('Parsing Uploaded Files', colors.bold, colors.cyan)}\n`);
  
  const uploadsDir = path.join(rootDir, 'business-context/uploads');
  const outputPath = path.join(rootDir, 'business-context/extracted-context.json');
  
  // Get files to parse
  let filesToParse = [];
  
  if (options.file) {
    // Parse specific file
    filesToParse = [options.file];
  } else {
    // Parse all files in uploads directory
    try {
      const files = await fs.readdir(uploadsDir);
      filesToParse = files
        .filter(f => !f.startsWith('.'))
        .map(f => path.join(uploadsDir, f));
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(color('  No uploads directory found. Creating...', colors.yellow));
        await fs.mkdir(uploadsDir, { recursive: true });
        filesToParse = [];
      } else {
        throw error;
      }
    }
  }
  
  if (filesToParse.length === 0) {
    console.log(color('  No files to parse', colors.dim));
    
    // Write empty context
    await fs.writeFile(outputPath, JSON.stringify({ files: [], consolidated: {} }, null, 2), 'utf-8');
    
    if (options.output === 'json') {
      console.log(JSON.stringify({ files: [], consolidated: {} }));
    }
    return;
  }
  
  console.log(`  Found ${color(filesToParse.length.toString(), colors.green)} file(s)\n`);
  
  // Parse each file
  const results = [];
  for (const filePath of filesToParse) {
    try {
      const result = await parseFile(filePath);
      results.push(result);
      
      if (result.text) {
        console.log(color(`    ✓ Extracted ${result.text.length} characters`, colors.green));
      }
    } catch (error) {
      console.log(color(`    ✗ Error: ${error.message}`, colors.red));
      results.push({
        filename: path.basename(filePath),
        type: 'error',
        text: '',
        error: error.message
      });
    }
  }
  
  // Consolidate content
  console.log(`\n  Consolidating content...`);
  const consolidated = consolidateContent(results);
  
  // Save extracted context
  const output = {
    extractedAt: new Date().toISOString(),
    fileCount: results.length,
    totalTextLength: consolidated.allText.length,
    files: results.map(r => ({
      filename: r.filename,
      type: r.type,
      textLength: r.text?.length || 0,
      error: r.error
    })),
    consolidated: {
      summary: consolidated.summary,
      audience: consolidated.audience,
      services: consolidated.services,
      brand: consolidated.brand,
      dataPoints: consolidated.dataPoints
    },
    rawText: consolidated.allText
  };
  
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  // Summary
  console.log(`
${color('═'.repeat(50), colors.dim)}

${color('Summary:', colors.bold)}
  Files processed: ${color(results.length.toString(), colors.green)}
  Total text extracted: ${color(consolidated.allText.length.toString(), colors.green)} characters
  Data sources: ${color(consolidated.dataPoints.length.toString(), colors.green)}
  Output saved to: ${color('business-context/extracted-context.json', colors.cyan)}
`);
  
  if (options.output === 'json') {
    console.log(JSON.stringify(output, null, 2));
  }
}

main().catch(error => {
  console.error(color(`Error: ${error.message}`, colors.red));
  process.exit(1);
});
