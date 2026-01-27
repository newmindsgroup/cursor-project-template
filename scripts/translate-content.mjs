#!/usr/bin/env node

/**
 * AI Content Translator
 * Translates website content with cultural adaptation and brand voice preservation
 * 
 * Usage:
 *   node scripts/translate-content.mjs --to=es                    # Translate to Spanish
 *   node scripts/translate-content.mjs --to=es,fr,de              # Multiple languages
 *   node scripts/translate-content.mjs --file=homepage.json       # Translate specific file
 *   node scripts/translate-content.mjs --validate                 # Validate existing translations
 */

import path from 'path';
import { fileURLToPath } from 'url';
import {
  aiComplete,
  parseAIJson,
  readJson,
  writeJson,
  findFiles,
  rootDir,
  ProgressLogger
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported languages with cultural context
const LANGUAGES = {
  en: { name: 'English', region: 'US/UK', direction: 'ltr' },
  es: { name: 'Spanish', region: 'Spain/Latin America', direction: 'ltr' },
  fr: { name: 'French', region: 'France/Canada', direction: 'ltr' },
  de: { name: 'German', region: 'Germany/Austria/Switzerland', direction: 'ltr' },
  pt: { name: 'Portuguese', region: 'Brazil/Portugal', direction: 'ltr' },
  it: { name: 'Italian', region: 'Italy', direction: 'ltr' },
  nl: { name: 'Dutch', region: 'Netherlands/Belgium', direction: 'ltr' },
  ja: { name: 'Japanese', region: 'Japan', direction: 'ltr' },
  zh: { name: 'Chinese', region: 'Simplified (China)', direction: 'ltr' },
  ko: { name: 'Korean', region: 'South Korea', direction: 'ltr' },
  ar: { name: 'Arabic', region: 'Middle East', direction: 'rtl' }
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    to: [],
    from: 'en',
    file: null,
    validate: false,
    preserveKeys: true,
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--to=')) {
      options.to = arg.split('=')[1].split(',').map(l => l.trim());
    } else if (arg.startsWith('--from=')) {
      options.from = arg.split('=')[1];
    } else if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg === '--validate' || arg === '-V') {
      options.validate = true;
    } else if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
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
AI Content Translator - Translate with cultural adaptation

Usage:
  node scripts/translate-content.mjs [options]

Options:
  --to=LANG[,LANG]  Target language(s) (required unless --validate)
  --from=LANG       Source language (default: en)
  --file=NAME       Translate specific file only
  --validate, -V    Validate existing translations
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Supported Languages:
  ${Object.entries(LANGUAGES).map(([code, info]) => `${code}: ${info.name} (${info.region})`).join('\n  ')}

Output:
  Creates translated files in src/content/{lang}/ directories

Examples:
  npm run ai:translate -- --to=es                     # Translate to Spanish
  npm run ai:translate -- --to=es,fr,de               # Multiple languages
  npm run ai:translate -- --to=es --file=homepage     # Specific file
  npm run ai:translate -- --validate                  # Check translations
`);
}

/**
 * Find content files to translate
 */
async function findContentFiles(options) {
  const sourceDir = path.join(rootDir, 'src/content', options.from);
  let files = await findFiles(sourceDir, '.json');
  
  // Filter out schema and template files
  files = files.filter(f => {
    const name = path.basename(f);
    return !name.startsWith('_') && !name.includes('schema');
  });
  
  // Filter to specific file if requested
  if (options.file) {
    files = files.filter(f => {
      const name = path.basename(f, '.json');
      return name === options.file || f.includes(options.file);
    });
  }
  
  return files;
}

/**
 * Translate content using AI
 */
async function translateContent(content, fromLang, toLang, options) {
  const targetLangInfo = LANGUAGES[toLang];
  const sourceLangInfo = LANGUAGES[fromLang];

  const systemPrompt = `You are an expert translator and localization specialist.
Your task is to translate website content while preserving brand voice and adapting culturally.

Key principles:
1. CULTURAL ADAPTATION: Don't just translate words - adapt meaning for the target culture
2. BRAND VOICE: Maintain the same tone, personality, and style
3. SEO AWARENESS: Keep translated text roughly similar length for layouts
4. NATURAL FLOW: The translation should read as if originally written in ${targetLangInfo.name}
5. PRESERVE STRUCTURE: Keep JSON keys and structure identical

Translation Guidelines for ${targetLangInfo.name} (${targetLangInfo.region}):
- Use appropriate formality level for the region
- Adapt idioms and expressions to local equivalents
- Consider cultural sensitivities
- Use proper date/number/currency formats

DO NOT translate:
- JSON keys
- URLs
- Email addresses
- Brand names (unless they have official translations)
- Technical terms that are commonly used in English

Output valid JSON only, maintaining exact same structure.`;

  const userPrompt = `Translate this content from ${sourceLangInfo.name} to ${targetLangInfo.name}.

SOURCE CONTENT:
${JSON.stringify(content, null, 2)}

Requirements:
1. Maintain exact JSON structure
2. Translate all user-facing text
3. Adapt culturally for ${targetLangInfo.region}
4. Keep brand voice consistent
5. Preserve any HTML tags within strings
6. Update "language" field to "${toLang}"
7. Update any "lang" attributes to "${toLang}"

Output the complete translated JSON object.`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.3,
    maxTokens: 8000
  });

  return parseAIJson(response);
}

/**
 * Validate translation quality
 */
async function validateTranslation(original, translated, fromLang, toLang) {
  const systemPrompt = `You are a translation quality assurance expert.
Analyze translations for accuracy, cultural appropriateness, and brand voice consistency.

Output valid JSON only.`;

  const userPrompt = `Validate this translation from ${LANGUAGES[fromLang].name} to ${LANGUAGES[toLang].name}.

ORIGINAL:
${JSON.stringify(original, null, 2)}

TRANSLATION:
${JSON.stringify(translated, null, 2)}

Check for:
1. Accuracy of meaning
2. Cultural appropriateness
3. Brand voice consistency
4. Grammar and spelling
5. Missing translations
6. Over-translations (things that shouldn't be translated)

Output JSON:
{
  "score": 0-100,
  "status": "pass|warning|fail",
  "issues": [
    {
      "severity": "error|warning|info",
      "field": "path.to.field",
      "original": "original text",
      "translated": "translated text",
      "issue": "Description of problem",
      "suggestion": "Suggested fix"
    }
  ],
  "summary": {
    "accuracyScore": 0-100,
    "fluencyScore": 0-100,
    "culturalScore": 0-100,
    "completeness": "X/Y fields translated"
  }
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'fast',
    temperature: 0.2,
    maxTokens: 4000
  });

  return parseAIJson(response);
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

  console.log('\n🌍 AI Content Translator\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Validate options
  if (!options.validate && options.to.length === 0) {
    console.log('⚠️  Target language(s) required. Use --to=es,fr,de');
    console.log('   Run with --help for usage information.\n');
    process.exit(1);
  }

  // Validate language codes
  for (const lang of options.to) {
    if (!LANGUAGES[lang]) {
      console.log(`⚠️  Unknown language: ${lang}`);
      console.log(`   Supported: ${Object.keys(LANGUAGES).join(', ')}\n`);
      process.exit(1);
    }
  }

  // Find content files
  console.log('🔍 Finding content files...');
  const files = await findContentFiles(options);
  
  if (files.length === 0) {
    console.log('⚠️  No content files found.');
    console.log(`   Check that src/content/${options.from}/ contains JSON files.\n`);
    process.exit(1);
  }
  
  console.log(`   Found ${files.length} file(s) in ${options.from}/`);

  // Validation mode
  if (options.validate) {
    console.log('\n🔍 Validating existing translations...\n');
    
    const results = [];
    for (const lang of Object.keys(LANGUAGES).filter(l => l !== options.from)) {
      const langDir = path.join(rootDir, 'src/content', lang);
      try {
        const langFiles = await findFiles(langDir, '.json');
        if (langFiles.length === 0) continue;
        
        console.log(`   Validating ${lang}...`);
        
        for (const file of langFiles.slice(0, 3)) { // Limit for cost
          const name = path.basename(file);
          const originalPath = file.replace(`/${lang}/`, `/${options.from}/`);
          
          try {
            const original = await readJson(originalPath);
            const translated = await readJson(file);
            const validation = await validateTranslation(original, translated, options.from, lang);
            
            results.push({
              lang,
              file: name,
              ...validation
            });
            
            const icon = validation.status === 'pass' ? '✅' : validation.status === 'warning' ? '⚠️' : '❌';
            console.log(`     ${icon} ${name}: ${validation.score}/100`);
          } catch (e) {
            // Skip files that don't have originals
          }
        }
      } catch {
        // Language directory doesn't exist
      }
    }

    if (!options.dryRun && results.length > 0) {
      await writeJson('docs/07-qa/translation-validation.json', {
        validatedAt: new Date().toISOString(),
        results
      });
      console.log('\n📁 Output: docs/07-qa/translation-validation.json');
    }
    
    return;
  }

  // Translation mode
  const totalTasks = files.length * options.to.length;
  console.log(`\n🔄 Translating to ${options.to.join(', ')} (${totalTasks} tasks)...\n`);

  const results = {
    translated: [],
    failed: []
  };

  for (const lang of options.to) {
    console.log(`\n   📝 ${LANGUAGES[lang].name} (${lang}):`);
    
    for (const file of files) {
      const fileName = path.basename(file);
      const relativePath = path.relative(path.join(rootDir, 'src/content', options.from), file);
      
      try {
        const content = await readJson(file);
        console.log(`      Translating ${fileName}...`);
        
        const translated = await translateContent(content, options.from, lang, options);
        
        if (!options.dryRun) {
          const outputPath = `src/content/${lang}/${relativePath}`;
          await writeJson(outputPath, translated);
          console.log(`      ✅ ${fileName} → ${outputPath}`);
        } else {
          console.log(`      ✅ ${fileName} (dry run)`);
        }
        
        results.translated.push({
          file: fileName,
          from: options.from,
          to: lang,
          outputPath: `src/content/${lang}/${relativePath}`
        });
        
      } catch (error) {
        console.log(`      ❌ ${fileName}: ${error.message}`);
        results.failed.push({
          file: fileName,
          lang,
          error: error.message
        });
      }
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Translated: ${results.translated.length}/${totalTasks}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log(`   Languages: ${options.to.join(', ')}`);
  
  if (results.translated.length > 0 && !options.dryRun) {
    console.log(`\n📁 Output directories:`);
    for (const lang of options.to) {
      console.log(`   - src/content/${lang}/`);
    }
  }
  
  console.log('');

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
