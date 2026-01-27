#!/usr/bin/env node

/**
 * AI Section Content Generator
 * Generates compelling copy for website sections using StoryBrand framework
 * 
 * Usage:
 *   node scripts/generate-section-content.mjs                    # Generate all sections
 *   node scripts/generate-section-content.mjs --section=hero     # Generate specific section
 *   node scripts/generate-section-content.mjs --page=homepage    # Generate for specific page
 *   node scripts/generate-section-content.mjs --variants=5       # Number of headline variants
 *   node scripts/generate-section-content.mjs --apply            # Apply to content files
 *   node scripts/generate-section-content.mjs --dry-run          # Preview without writing
 */

import path from 'path';
import { fileURLToPath } from 'url';
import {
  aiComplete,
  parseAIJson,
  readJson,
  writeJson,
  readFile,
  findFiles,
  rootDir,
  ProgressLogger
} from './lib/ai-utils.mjs';
import {
  applyGeneratedContent,
  formatDiff,
  generateDiff,
  createBackup
} from './lib/content-writer.mjs';
import {
  scoreContent,
  refineContent,
  QUALITY_THRESHOLD
} from './lib/content-refiner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Section templates with StoryBrand mapping
const SECTION_TEMPLATES = {
  hero: {
    storybrand: 'character_desire',
    elements: ['headline', 'subheadline', 'primaryCta', 'secondaryCta'],
    guidelines: 'The hero should immediately communicate the transformation the customer will experience. Lead with benefit, not feature.'
  },
  features: {
    storybrand: 'plan',
    elements: ['headline', 'subheadline', 'items[].title', 'items[].description'],
    guidelines: 'Features should show how the product/service solves the problem. Each feature = one step toward success.'
  },
  benefits: {
    storybrand: 'success',
    elements: ['headline', 'subheadline', 'items[].title', 'items[].description'],
    guidelines: 'Benefits paint the picture of life after using the product. Focus on emotional outcomes.'
  },
  testimonials: {
    storybrand: 'authority',
    elements: ['headline', 'subheadline'],
    guidelines: 'Social proof that demonstrates expertise and builds trust. Let customers tell the transformation story.'
  },
  faq: {
    storybrand: 'failure_stakes',
    elements: ['headline', 'subheadline', 'items[].question', 'items[].answer'],
    guidelines: 'Address objections and fears. Show what happens if they don\'t act (subtly).'
  },
  cta: {
    storybrand: 'call_to_action',
    elements: ['headline', 'subheadline', 'primaryCta', 'secondaryCta'],
    guidelines: 'Clear, direct call to action. One primary CTA, one transitional. Create urgency without manipulation.'
  },
  about: {
    storybrand: 'guide',
    elements: ['headline', 'subheadline', 'content'],
    guidelines: 'Position the brand as the guide with empathy and authority. Show understanding of customer pain.'
  },
  stats: {
    storybrand: 'authority',
    elements: ['headline', 'items[].value', 'items[].label'],
    guidelines: 'Credibility indicators. Use specific, impressive numbers that demonstrate expertise.'
  },
  pricing: {
    storybrand: 'plan',
    elements: ['headline', 'subheadline', 'plans[].name', 'plans[].description', 'plans[].cta'],
    guidelines: 'Clear pricing with value emphasis. Each tier should have a clear target persona.'
  },
  contact: {
    storybrand: 'call_to_action',
    elements: ['headline', 'subheadline', 'formTitle'],
    guidelines: 'Make it easy to take action. Reduce friction, set expectations for response.'
  }
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    section: null,
    page: null,
    variants: 3,
    apply: false,
    target: null,
    dryRun: false,
    verbose: false,
    language: 'en',
    parallel: false,
    concurrency: 4,
    refine: false,
    qualityThreshold: QUALITY_THRESHOLD,
    help: false
  };

  for (const arg of args) {
    if (arg === '--apply' || arg === '-a') {
      options.apply = true;
    } else if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1];
    } else if (arg.startsWith('--section=')) {
      options.section = arg.split('=')[1];
    } else if (arg.startsWith('--page=')) {
      options.page = arg.split('=')[1];
    } else if (arg.startsWith('--variants=')) {
      options.variants = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--lang=')) {
      options.language = arg.split('=')[1];
    } else if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--parallel' || arg === '-p') {
      options.parallel = true;
    } else if (arg.startsWith('--concurrency=')) {
      options.concurrency = parseInt(arg.split('=')[1], 10);
      options.parallel = true; // Imply parallel mode
    } else if (arg === '--refine' || arg === '-r') {
      options.refine = true;
    } else if (arg.startsWith('--quality=')) {
      options.qualityThreshold = parseInt(arg.split('=')[1], 10);
      options.refine = true; // Imply refine mode
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
AI Section Content Generator - Generate compelling website copy using StoryBrand

Usage:
  node scripts/generate-section-content.mjs [options]

Options:
  --section=NAME     Generate content for specific section (hero, features, cta, etc.)
  --page=NAME        Generate content for specific page (homepage, about, services, etc.)
  --variants=N       Number of headline variants to generate (default: 3)
  --apply, -a        Apply generated content directly to content JSON files
  --target=FILE      Target content file for --apply (default: src/content/{lang}/home.json)
  --lang=CODE        Language code (default: en)
  --parallel, -p     Generate sections in parallel (3-4x faster)
  --concurrency=N    Max concurrent generations (default: 4, implies --parallel)
  --refine, -r       Enable multi-pass refinement (generate → score → refine)
  --quality=N        Quality threshold for refinement (1-10, default: 7, implies --refine)
  --dry-run, -n      Preview generation without writing files
  --verbose, -v      Show detailed output
  --help, -h         Show this help message

Examples:
  npm run ai:generate-content                              # Generate all content
  npm run ai:generate-content -- --parallel                # Generate in parallel (faster)
  npm run ai:generate-content -- --refine                  # Generate with quality refinement
  npm run ai:generate-content -- --section=hero            # Generate hero section only
  npm run ai:generate-content -- --apply --parallel        # Generate and apply (parallel mode)
  npm run ai:generate-content -- --quality=8               # Higher quality threshold
`);
}

/**
 * Load business context for content generation
 */
async function loadBusinessContext() {
  const context = {
    project: null,
    brandScript: null,
    personas: null,
    siteConfig: null
  };

  try {
    context.project = await readJson('PROJECT.md');
  } catch {
    try {
      const projectContent = await readFile('PROJECT.md');
      context.project = { raw: projectContent };
    } catch {
      // No project file
    }
  }

  try {
    context.siteConfig = await readJson('src/data/site-config.json');
  } catch {
    // No site config
  }

  try {
    context.personas = await readJson('src/data/personas.json');
  } catch {
    // No personas
  }

  // Try to load existing brandscript
  try {
    const files = await findFiles('src/content', '.json');
    for (const file of files) {
      const data = await readJson(file);
      if (data.storybrand) {
        context.brandScript = data.storybrand;
        break;
      }
    }
  } catch {
    // No brandscript
  }

  return context;
}

/**
 * Generate content for a section
 */
async function generateSectionContent(sectionType, context, options) {
  const template = SECTION_TEMPLATES[sectionType];
  if (!template) {
    throw new Error(`Unknown section type: ${sectionType}`);
  }

  const systemPrompt = `You are an expert copywriter specializing in the StoryBrand framework by Donald Miller.
Your task is to generate compelling, conversion-focused website copy.

Key principles:
1. Position the customer as the hero, the brand as the guide
2. Lead with benefits and transformation, not features
3. Use clear, simple language (8th-grade reading level)
4. Create emotional resonance while being authentic
5. Every headline should pass the "grunt test" - immediately clear what's offered

StoryBrand element for this section: ${template.storybrand}
Guidelines: ${template.guidelines}

Always output valid JSON matching the requested structure.`;

  const userPrompt = `Generate content for a ${sectionType.toUpperCase()} section.

Business Context:
${context.project?.raw || JSON.stringify(context.project, null, 2) || 'General business website'}

${context.brandScript ? `BrandScript:
${JSON.stringify(context.brandScript, null, 2)}` : ''}

${context.personas?.personas ? `Target Personas:
${context.personas.personas.slice(0, 2).map(p => `- ${p.name}: ${p.jtbd}`).join('\n')}` : ''}

Requirements:
- Language: ${options.language}
- Generate ${options.variants} headline variants
- Include character counts for SEO compliance
- Each variant should test a different angle (benefit, curiosity, urgency, social proof, etc.)

Output JSON structure:
{
  "section": "${sectionType}",
  "language": "${options.language}",
  "headlines": [
    {
      "text": "Main headline text",
      "angle": "benefit|curiosity|urgency|social_proof|transformation",
      "charCount": 45
    }
  ],
  "subheadline": {
    "text": "Supporting copy that elaborates on the headline",
    "charCount": 120
  },
  ${sectionType === 'hero' || sectionType === 'cta' ? `"primaryCta": {
    "text": "Action-oriented CTA text",
    "charCount": 20
  },
  "secondaryCta": {
    "text": "Transitional CTA text",
    "charCount": 25
  },` : ''}
  ${sectionType === 'features' || sectionType === 'benefits' || sectionType === 'faq' ? `"items": [
    {
      "title": "Item title",
      "description": "Item description",
      ${sectionType === 'faq' ? '"question": "FAQ question",' : ''}
      "charCount": { "title": 30, "description": 100 }
    }
  ],` : ''}
  "metadata": {
    "storybrandElement": "${template.storybrand}",
    "generatedAt": "${new Date().toISOString()}",
    "recommendedHeadline": 0
  }
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.8,
    json: true
  });

  return parseAIJson(response);
}

/**
 * Process a single section (for parallel execution)
 */
async function processSingleSection(sectionType, context, options, results) {
  try {
    const startTime = Date.now();
    let content = await generateSectionContent(sectionType, context, options);
    let qualityScore = null;
    let refinements = 0;
    
    // Apply multi-pass refinement if enabled
    if (options.refine) {
      let scores = await scoreContent(content, context);
      qualityScore = scores.overall;
      
      // Refine if below threshold (max 2 iterations)
      while (scores.overall < options.qualityThreshold && refinements < 2) {
        content = await refineContent(content, scores, context);
        scores = await scoreContent(content, context);
        qualityScore = scores.overall;
        refinements++;
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (!options.dryRun) {
      // Save to section file
      const outputPath = `src/content/${options.language}/sections/${sectionType}.json`;
      await writeJson(outputPath, content);
      
      // Apply to target content file if --apply flag is set
      if (options.apply) {
        const targetPath = options.target || `src/content/${options.language}/home.json`;
        
        try {
          const applyResult = await applyGeneratedContent(content, targetPath, { backup: true });
          
          if (applyResult.applied.length > 0) {
            results.applied = results.applied || [];
            results.applied.push({
              section: sectionType,
              target: targetPath,
              changes: applyResult.applied[0].changes
            });
          }
        } catch (applyError) {
          // Log but don't fail
        }
      }
    }

    results.generated.push({
      section: sectionType,
      headlines: content.headlines?.length || 0,
      elapsed,
      quality: qualityScore,
      refinements,
      content
    });

    return { success: true, section: sectionType, elapsed, quality: qualityScore, refinements };

  } catch (error) {
    results.failed.push({ section: sectionType, error: error.message });
    return { success: false, section: sectionType, error: error.message };
  }
}

/**
 * Chunk array into smaller arrays for controlled concurrency
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
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

  console.log('\n✍️  AI Section Content Generator\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Load business context
  console.log('📚 Loading business context...');
  const context = await loadBusinessContext();

  // Determine which sections to generate
  let sectionsToGenerate = Object.keys(SECTION_TEMPLATES);
  
  if (options.section) {
    if (!SECTION_TEMPLATES[options.section]) {
      console.log(`❌ Unknown section: ${options.section}`);
      console.log(`   Available: ${Object.keys(SECTION_TEMPLATES).join(', ')}\n`);
      process.exit(1);
    }
    sectionsToGenerate = [options.section];
  }

  const mode = options.parallel ? `parallel (${options.concurrency} concurrent)` : 'sequential';
  console.log(`\n🎯 Generating content for ${sectionsToGenerate.length} section(s) [${mode}]\n`);

  const results = {
    generated: [],
    failed: []
  };

  const startTime = Date.now();

  if (options.parallel && sectionsToGenerate.length > 1) {
    // PARALLEL MODE: Process sections concurrently
    console.log(`   ⚡ Starting parallel generation...\n`);
    
    const chunks = chunkArray(sectionsToGenerate, options.concurrency);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`   Batch ${i + 1}/${chunks.length}: ${chunk.join(', ')}`);
      
      const promises = chunk.map(sectionType => 
        processSingleSection(sectionType, context, options, results)
      );
      
      const batchResults = await Promise.all(promises);
      
      // Report batch results
      for (const result of batchResults) {
        if (result.success) {
          console.log(`   ✅ ${result.section} (${result.elapsed}s)`);
        } else {
          console.log(`   ❌ ${result.section} - ${result.error}`);
        }
      }
      
      if (i < chunks.length - 1) {
        console.log(''); // Blank line between batches
      }
    }
  } else {
    // SEQUENTIAL MODE: Process one at a time
    const progress = new ProgressLogger(sectionsToGenerate.length, 'Content generation');

    for (const sectionType of sectionsToGenerate) {
      try {
        console.log(`   🔄 Generating ${sectionType}...`);
        
        const content = await generateSectionContent(sectionType, context, options);
        
        if (!options.dryRun) {
          // Save to section file
          const outputPath = `src/content/${options.language}/sections/${sectionType}.json`;
          await writeJson(outputPath, content);
          console.log(`   ✅ ${sectionType} → ${outputPath}`);
          
          // Apply to target content file if --apply flag is set
          if (options.apply) {
            const targetPath = options.target || `src/content/${options.language}/home.json`;
            console.log(`   📝 Applying to ${targetPath}...`);
            
            try {
              const applyResult = await applyGeneratedContent(content, targetPath, { backup: true });
              
              if (applyResult.applied.length > 0) {
                console.log(`   ✅ Applied ${sectionType} to content file (${applyResult.applied[0].changes} changes)`);
                results.applied = results.applied || [];
                results.applied.push({
                  section: sectionType,
                  target: targetPath,
                  changes: applyResult.applied[0].changes
                });
              }
              
              if (applyResult.errors.length > 0) {
                console.log(`   ⚠️  Apply warning: ${applyResult.errors[0].error}`);
              }
            } catch (applyError) {
              console.log(`   ⚠️  Could not apply: ${applyError.message}`);
            }
          }
        } else {
          console.log(`   ✅ ${sectionType} (dry run)`);
          if (options.verbose) {
            console.log(`      Headlines: ${content.headlines?.length || 0}`);
            content.headlines?.forEach((h, i) => {
              console.log(`        ${i + 1}. [${h.angle}] ${h.text}`);
            });
          }
        }

        results.generated.push({
          section: sectionType,
          headlines: content.headlines?.length || 0,
          content
        });

      } catch (error) {
        console.log(`   ❌ ${sectionType} - Failed: ${error.message}`);
        results.failed.push({ section: sectionType, error: error.message });
      }

      progress.update(sectionType);
    }
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Generated: ${results.generated.length}`);
  console.log(`   Failed:    ${results.failed.length}`);
  console.log(`   Total time: ${totalElapsed}s ${options.parallel ? '(parallel)' : '(sequential)'}`);
  
  if (results.generated.length > 0) {
    const totalHeadlines = results.generated.reduce((sum, r) => sum + r.headlines, 0);
    console.log(`   Headlines: ${totalHeadlines} variants total`);
  }
  
  if (results.applied?.length > 0) {
    console.log(`   Applied:   ${results.applied.length} section(s) to content files`);
  }

  if (!options.dryRun && results.generated.length > 0) {
    console.log(`\n📁 Output: src/content/${options.language}/sections/`);
    if (options.apply) {
      console.log(`📁 Applied to: ${options.target || `src/content/${options.language}/home.json`}`);
    }
    console.log('');
  }

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
