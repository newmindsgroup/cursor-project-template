#!/usr/bin/env node

/**
 * AI Headline Optimizer
 * Generates and scores headline variants for A/B testing
 * 
 * Usage:
 *   node scripts/optimize-headlines.mjs                          # Optimize all headlines
 *   node scripts/optimize-headlines.mjs --section=hero           # Specific section
 *   node scripts/optimize-headlines.mjs --variants=10            # Number of variants
 *   node scripts/optimize-headlines.mjs --score                  # Score existing headlines
 */

import path from 'path';
import { fileURLToPath } from 'url';
import {
  aiComplete,
  parseAIJson,
  readJson,
  writeJson,
  findFiles,
  rootDir
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Headline angles for variety
const HEADLINE_ANGLES = [
  { id: 'benefit', name: 'Benefit-Focused', description: 'Lead with the transformation/outcome' },
  { id: 'curiosity', name: 'Curiosity Gap', description: 'Create intrigue that demands resolution' },
  { id: 'urgency', name: 'Urgency/Scarcity', description: 'Create time-sensitivity without manipulation' },
  { id: 'social_proof', name: 'Social Proof', description: 'Lead with numbers or authority' },
  { id: 'question', name: 'Question', description: 'Engage with a provocative question' },
  { id: 'how_to', name: 'How-To', description: 'Promise a clear solution' },
  { id: 'negative', name: 'Negative/Problem', description: 'Address the pain point directly' },
  { id: 'direct', name: 'Direct', description: 'Clear, straightforward value proposition' }
];

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    section: null,
    variants: 5,
    score: false,
    format: 'json',
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--section=')) {
      options.section = arg.split('=')[1];
    } else if (arg.startsWith('--variants=')) {
      options.variants = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg === '--score' || arg === '-s') {
      options.score = true;
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
AI Headline Optimizer - Generate and score headline variants

Usage:
  node scripts/optimize-headlines.mjs [options]

Options:
  --section=NAME    Optimize headlines for specific section
  --variants=N      Number of variants per headline (default: 5)
  --score, -s       Score existing headlines only (no generation)
  --format=FORMAT   Output format: json (default), markdown
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Headline Angles:
${HEADLINE_ANGLES.map(a => `  - ${a.name}: ${a.description}`).join('\n')}

Output:
  src/data/headline-variants.json

Examples:
  npm run ai:optimize-headlines                           # Optimize all
  npm run ai:optimize-headlines -- --section=hero         # Hero only
  npm run ai:optimize-headlines -- --variants=10          # More variants
  npm run ai:optimize-headlines -- --score                # Score existing
`);
}

/**
 * Load existing content with headlines
 */
async function loadExistingContent() {
  const content = {
    sections: [],
    brandScript: null
  };

  // Find content files
  const contentDir = path.join(rootDir, 'src/content');
  try {
    const files = await findFiles(contentDir, '.json');
    
    for (const file of files) {
      try {
        const data = await readJson(file);
        const fileName = path.basename(file, '.json');
        
        // Extract headlines from various structures
        if (data.hero?.headline) {
          content.sections.push({
            section: 'hero',
            source: fileName,
            headline: data.hero.headline,
            subheadline: data.hero.subheadline
          });
        }
        
        if (data.features?.headline) {
          content.sections.push({
            section: 'features',
            source: fileName,
            headline: data.features.headline,
            subheadline: data.features.subheadline
          });
        }
        
        if (data.cta?.headline) {
          content.sections.push({
            section: 'cta',
            source: fileName,
            headline: data.cta.headline,
            subheadline: data.cta.subheadline
          });
        }
        
        if (data.storybrand) {
          content.brandScript = data.storybrand;
        }
      } catch {
        // Skip unparseable files
      }
    }
  } catch {
    // No content directory
  }

  // Also check for previously generated headlines
  try {
    const variants = await readJson('src/data/headline-variants.json');
    content.existingVariants = variants;
  } catch {
    // No existing variants
  }

  return content;
}

/**
 * Score a headline using AI
 */
async function scoreHeadline(headline, context = {}) {
  const systemPrompt = `You are a headline optimization expert with expertise in copywriting, conversion optimization, and consumer psychology.

Score headlines on these criteria (0-100 each):
1. CLARITY: Is the message immediately clear? (Grunt test)
2. BENEFIT: Does it communicate a clear benefit/transformation?
3. EMOTIONAL: Does it create emotional resonance?
4. URGENCY: Does it create a sense of importance/timeliness?
5. UNIQUE: Is it differentiated from generic competitors?
6. SPECIFICITY: Does it use specific, concrete language?
7. LENGTH: Is it appropriately concise? (ideal: 6-12 words)

Output valid JSON only.`;

  const userPrompt = `Score this headline:

"${headline}"

${context.subheadline ? `Subheadline: "${context.subheadline}"` : ''}
${context.section ? `Section: ${context.section}` : ''}
${context.brandScript ? `Brand context: ${JSON.stringify(context.brandScript).substring(0, 500)}` : ''}

Output JSON:
{
  "headline": "${headline}",
  "overallScore": 0-100,
  "scores": {
    "clarity": { "score": 0-100, "feedback": "Brief feedback" },
    "benefit": { "score": 0-100, "feedback": "Brief feedback" },
    "emotional": { "score": 0-100, "feedback": "Brief feedback" },
    "urgency": { "score": 0-100, "feedback": "Brief feedback" },
    "unique": { "score": 0-100, "feedback": "Brief feedback" },
    "specificity": { "score": 0-100, "feedback": "Brief feedback" },
    "length": { "score": 0-100, "feedback": "Brief feedback" }
  },
  "strengths": ["What works well"],
  "weaknesses": ["What could improve"],
  "recommendation": "Overall recommendation"
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'fast',
    temperature: 0.3,
    maxTokens: 2000
  });

  return parseAIJson(response);
}

/**
 * Generate headline variants using AI
 */
async function generateVariants(original, section, context, numVariants) {
  const angles = HEADLINE_ANGLES.slice(0, numVariants);

  const systemPrompt = `You are an expert copywriter specializing in headline optimization.
Your task is to create compelling headline variants that outperform the original.

Key principles:
1. Pass the "grunt test" - immediately clear what's offered
2. Lead with transformation, not features
3. Use power words that drive action
4. Keep it concise (6-12 words ideal)
5. Create emotional resonance
6. Be specific, not generic

Output valid JSON only.`;

  const userPrompt = `Create ${numVariants} headline variants for the ${section} section.

ORIGINAL HEADLINE:
"${original.headline}"

${original.subheadline ? `SUBHEADLINE: "${original.subheadline}"` : ''}

${context.brandScript ? `BRAND CONTEXT:
${JSON.stringify(context.brandScript, null, 2).substring(0, 1500)}` : ''}

Create variants using these angles:
${angles.map(a => `- ${a.name}: ${a.description}`).join('\n')}

Output JSON:
{
  "original": "${original.headline}",
  "section": "${section}",
  "variants": [
    {
      "text": "Headline text",
      "angle": "${angles[0].id}",
      "angleName": "${angles[0].name}",
      "wordCount": 0,
      "charCount": 0,
      "reasoning": "Why this works"
    }
  ],
  "recommendations": {
    "bestForConversion": 0,
    "bestForClarity": 0,
    "bestForBrandVoice": 0,
    "testPriority": [0, 1, 2]
  }
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.8,
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

  console.log('\n✍️  AI Headline Optimizer\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Load existing content
  console.log('📚 Loading content...');
  const content = await loadExistingContent();

  if (content.sections.length === 0) {
    console.log('⚠️  No headlines found in content files.');
    console.log('   Add content to src/content/ first.\n');
    process.exit(1);
  }

  // Filter sections if specified
  let sections = content.sections;
  if (options.section) {
    sections = sections.filter(s => s.section === options.section);
  }

  console.log(`   Found ${sections.length} headline(s) to process`);

  const results = {
    processedAt: new Date().toISOString(),
    mode: options.score ? 'score' : 'generate',
    variantsPerHeadline: options.variants,
    sections: []
  };

  // Score-only mode
  if (options.score) {
    console.log('\n🔄 Scoring headlines...\n');
    
    for (const section of sections) {
      console.log(`   Scoring ${section.section}...`);
      
      try {
        const score = await scoreHeadline(section.headline, {
          subheadline: section.subheadline,
          section: section.section,
          brandScript: content.brandScript
        });
        
        results.sections.push({
          ...section,
          score
        });
        
        console.log(`   ✅ ${section.section}: ${score.overallScore}/100`);
        
        if (options.verbose) {
          console.log(`      Clarity: ${score.scores.clarity.score}`);
          console.log(`      Benefit: ${score.scores.benefit.score}`);
          console.log(`      Emotional: ${score.scores.emotional.score}`);
        }
      } catch (error) {
        console.log(`   ❌ ${section.section}: ${error.message}`);
      }
    }
  } else {
    // Generate variants mode
    console.log(`\n🔄 Generating ${options.variants} variants per headline...\n`);
    
    for (const section of sections) {
      console.log(`   Generating for ${section.section}...`);
      
      try {
        const variants = await generateVariants(
          section,
          section.section,
          { brandScript: content.brandScript },
          options.variants
        );
        
        // Score all variants
        console.log(`   Scoring variants...`);
        const scoredVariants = [];
        
        for (const variant of variants.variants) {
          const score = await scoreHeadline(variant.text, {
            section: section.section,
            brandScript: content.brandScript
          });
          scoredVariants.push({
            ...variant,
            score: score.overallScore,
            fullScore: score
          });
        }
        
        // Sort by score
        scoredVariants.sort((a, b) => b.score - a.score);
        
        results.sections.push({
          ...section,
          originalScore: (await scoreHeadline(section.headline, { section: section.section })).overallScore,
          variants: scoredVariants,
          recommendations: variants.recommendations
        });
        
        console.log(`   ✅ ${section.section}: ${scoredVariants.length} variants`);
        console.log(`      Best: "${scoredVariants[0].text}" (${scoredVariants[0].score}/100)`);
        
      } catch (error) {
        console.log(`   ❌ ${section.section}: ${error.message}`);
      }
    }
  }

  if (!options.dryRun) {
    await writeJson('src/data/headline-variants.json', results);
    console.log('\n📁 Output: src/data/headline-variants.json');
  } else {
    console.log('\n📋 Dry run - no files written');
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Sections processed: ${results.sections.length}`);
  
  if (options.score) {
    const avgScore = Math.round(
      results.sections.reduce((sum, s) => sum + (s.score?.overallScore || 0), 0) / results.sections.length
    );
    console.log(`   Average score: ${avgScore}/100`);
  } else {
    const totalVariants = results.sections.reduce((sum, s) => sum + (s.variants?.length || 0), 0);
    console.log(`   Variants generated: ${totalVariants}`);
    
    // Find biggest improvements
    const improvements = results.sections
      .filter(s => s.variants?.length > 0)
      .map(s => ({
        section: s.section,
        original: s.originalScore,
        best: s.variants[0].score,
        improvement: s.variants[0].score - s.originalScore
      }))
      .sort((a, b) => b.improvement - a.improvement);
    
    if (improvements.length > 0) {
      console.log('\n   Top improvements:');
      for (const imp of improvements.slice(0, 3)) {
        const sign = imp.improvement > 0 ? '+' : '';
        console.log(`     ${imp.section}: ${imp.original} → ${imp.best} (${sign}${imp.improvement})`);
      }
    }
  }
  
  console.log('');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
