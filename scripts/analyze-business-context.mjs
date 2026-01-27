#!/usr/bin/env node

/**
 * AI Business Context Analyzer
 * Deep analysis of business context to extract positioning, voice, and strategy
 * 
 * Usage:
 *   node scripts/analyze-business-context.mjs                    # Full analysis
 *   node scripts/analyze-business-context.mjs --focus=voice      # Focus on brand voice
 *   node scripts/analyze-business-context.mjs --competitors      # Include competitor analysis
 *   node scripts/analyze-business-context.mjs --output=summary   # Output format
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import {
  aiComplete,
  parseAIJson,
  readFile,
  writeJson,
  findFiles,
  rootDir
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analysis dimensions
const ANALYSIS_DIMENSIONS = [
  'positioning',
  'valueProposition',
  'targetAudience',
  'brandVoice',
  'competitiveDifferentiation',
  'painPoints',
  'opportunities',
  'messaging'
];

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    focus: null,
    competitors: false,
    output: 'full',
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--focus=')) {
      options.focus = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--competitors' || arg === '-c') {
      options.competitors = true;
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
AI Business Context Analyzer - Extract strategic insights from business context

Usage:
  node scripts/analyze-business-context.mjs [options]

Options:
  --focus=AREA      Focus on specific area (positioning, voice, audience, etc.)
  --competitors     Include competitor analysis
  --output=FORMAT   Output format: full (default), summary, brandscript
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Analysis Dimensions:
${ANALYSIS_DIMENSIONS.map(d => `  - ${d}`).join('\n')}

Input Sources:
  - business-context/ folder (all files)
  - PROJECT.md
  - SCOPE.md
  - docs/01-brief/brief.md

Output:
  src/data/business-analysis.json

Examples:
  npm run ai:analyze-business                         # Full analysis
  npm run ai:analyze-business -- --focus=voice        # Brand voice focus
  npm run ai:analyze-business -- --competitors        # Include competitors
  npm run ai:analyze-business -- --output=brandscript # Generate BrandScript
`);
}

/**
 * Load all business context sources
 */
async function loadBusinessContext() {
  const context = {
    sources: [],
    content: {},
    totalSize: 0
  };

  // Priority order of files to load
  const priorityFiles = [
    'PROJECT.md',
    'SCOPE.md',
    'docs/01-brief/brief.md',
    'docs/02-discovery/discovery-summary.md'
  ];

  for (const file of priorityFiles) {
    try {
      const content = await readFile(file);
      context.sources.push(file);
      context.content[file] = content;
      context.totalSize += content.length;
    } catch {
      // File doesn't exist
    }
  }

  // Load business-context folder
  try {
    const bcPath = path.join(rootDir, 'business-context');
    const entries = await fs.readdir(bcPath);
    
    for (const entry of entries) {
      if (entry === '.gitkeep' || entry === 'README.md') continue;
      
      const filePath = path.join(bcPath, entry);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile() && context.totalSize < 50000) { // Limit total context
        try {
          let content;
          if (entry.endsWith('.json')) {
            const jsonContent = await fs.readFile(filePath, 'utf-8');
            content = JSON.stringify(JSON.parse(jsonContent), null, 2);
          } else {
            content = await fs.readFile(filePath, 'utf-8');
          }
          
          context.sources.push(`business-context/${entry}`);
          context.content[`business-context/${entry}`] = content.substring(0, 10000);
          context.totalSize += Math.min(content.length, 10000);
        } catch {
          // Skip unreadable files
        }
      }
    }
  } catch {
    // No business-context folder
  }

  return context;
}

/**
 * Run full business analysis
 */
async function analyzeBusinessContext(context, options) {
  const systemPrompt = `You are a senior brand strategist and business analyst.
Your task is to analyze business context materials and extract strategic insights.

Analysis Framework:
1. POSITIONING: Where does this business sit in the market?
2. VALUE PROPOSITION: What unique value does it offer?
3. TARGET AUDIENCE: Who are the ideal customers?
4. BRAND VOICE: What personality should the brand convey?
5. DIFFERENTIATION: What makes this different from competitors?
6. PAIN POINTS: What problems does it solve?
7. OPPORTUNITIES: What growth opportunities exist?
8. MESSAGING: Key messages and themes to communicate

Output valid JSON only.`;

  const contextSummary = Object.entries(context.content)
    .map(([source, content]) => `### ${source}\n${content}`)
    .join('\n\n---\n\n')
    .substring(0, 30000);

  const userPrompt = `Analyze this business context and provide strategic insights.

SOURCES: ${context.sources.join(', ')}

---
${contextSummary}
---

${options.focus ? `FOCUS AREA: ${options.focus}` : 'Provide comprehensive analysis across all dimensions.'}

Output JSON structure:
{
  "analyzedAt": "${new Date().toISOString()}",
  "sources": ${JSON.stringify(context.sources)},
  "summary": {
    "businessName": "Extracted or inferred business name",
    "industry": "Primary industry/sector",
    "stage": "startup|growth|established",
    "confidence": 0-100
  },
  "positioning": {
    "statement": "Clear positioning statement",
    "marketCategory": "Market category",
    "targetSegment": "Primary target segment",
    "uniqueAngle": "What makes this unique",
    "competitiveFrame": "How it relates to alternatives"
  },
  "valueProposition": {
    "primary": "Main value proposition",
    "supporting": ["Supporting value props"],
    "proofPoints": ["Evidence/claims to support"]
  },
  "targetAudience": {
    "primary": {
      "description": "Primary audience description",
      "demographics": "Key demographics",
      "psychographics": "Key psychographics",
      "needs": ["Primary needs"],
      "behaviors": ["Key behaviors"]
    },
    "secondary": {
      "description": "Secondary audience",
      "needs": ["Secondary needs"]
    }
  },
  "brandVoice": {
    "personality": ["3-5 personality traits"],
    "tone": "Overall tone (professional, friendly, etc.)",
    "vocabulary": {
      "use": ["Words/phrases to use"],
      "avoid": ["Words/phrases to avoid"]
    },
    "examples": {
      "good": ["Example on-brand phrases"],
      "bad": ["Example off-brand phrases"]
    }
  },
  "differentiation": {
    "primary": "Main differentiator",
    "supporting": ["Supporting differentiators"],
    "competitors": ["Identified competitors"],
    "competitiveAdvantages": ["Key advantages"]
  },
  "painPoints": {
    "customer": ["Customer pain points addressed"],
    "market": ["Market/industry pain points"]
  },
  "opportunities": {
    "immediate": ["Short-term opportunities"],
    "longTerm": ["Long-term opportunities"],
    "risks": ["Potential risks/challenges"]
  },
  "messaging": {
    "tagline": "Suggested tagline",
    "headline": "Primary headline",
    "subheadline": "Supporting subheadline",
    "keyMessages": ["3-5 key messages"],
    "callsToAction": {
      "primary": "Primary CTA",
      "secondary": "Secondary/transitional CTA"
    }
  },
  "storybrand": {
    "character": "Who is the hero (customer)?",
    "problem": {
      "external": "External problem",
      "internal": "Internal problem",
      "philosophical": "Philosophical problem"
    },
    "guide": "How does the brand serve as guide?",
    "plan": ["3-step plan"],
    "callToAction": {
      "direct": "Direct CTA",
      "transitional": "Transitional CTA"
    },
    "successVision": "What success looks like",
    "failureConsequence": "What failure/inaction means"
  },
  "recommendations": {
    "immediate": ["Immediate actions to take"],
    "contentStrategy": ["Content recommendations"],
    "designDirection": ["Visual/design recommendations"]
  }
}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'advanced',
    temperature: 0.5,
    maxTokens: 8000
  });

  return parseAIJson(response);
}

/**
 * Generate summary output
 */
function generateSummary(analysis) {
  return {
    business: analysis.summary,
    positioning: analysis.positioning?.statement,
    valueProposition: analysis.valueProposition?.primary,
    targetAudience: analysis.targetAudience?.primary?.description,
    brandVoice: analysis.brandVoice?.personality,
    tagline: analysis.messaging?.tagline,
    keyMessages: analysis.messaging?.keyMessages,
    callToAction: analysis.messaging?.callsToAction?.primary
  };
}

/**
 * Generate StoryBrand output
 */
function generateBrandScript(analysis) {
  return {
    version: '1.0',
    generatedAt: analysis.analyzedAt,
    hero: {
      description: analysis.storybrand?.character,
      wants: analysis.valueProposition?.primary,
      needs: analysis.targetAudience?.primary?.needs
    },
    problem: analysis.storybrand?.problem,
    guide: {
      empathy: `We understand ${analysis.painPoints?.customer?.[0] || 'your challenges'}`,
      authority: analysis.valueProposition?.proofPoints
    },
    plan: {
      steps: analysis.storybrand?.plan,
      agreement: 'Our commitment to your success'
    },
    callToAction: analysis.storybrand?.callToAction,
    success: {
      vision: analysis.storybrand?.successVision,
      transformation: analysis.valueProposition?.supporting
    },
    failure: {
      consequence: analysis.storybrand?.failureConsequence,
      stakes: analysis.painPoints?.customer
    },
    messaging: {
      headline: analysis.messaging?.headline,
      subheadline: analysis.messaging?.subheadline,
      tagline: analysis.messaging?.tagline
    }
  };
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

  console.log('\n📊 AI Business Context Analyzer\n');

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

  if (context.sources.length === 0) {
    console.log('⚠️  No business context found.');
    console.log('   Add content to PROJECT.md or business-context/ folder.\n');
    process.exit(1);
  }

  console.log(`   Found ${context.sources.length} source(s)`);
  console.log(`   Total context: ${Math.round(context.totalSize / 1024)}KB`);
  
  if (options.verbose) {
    console.log('\n   Sources:');
    for (const source of context.sources) {
      console.log(`     - ${source}`);
    }
  }

  // Run analysis
  console.log('\n🔄 Analyzing business context...');
  
  try {
    const analysis = await analyzeBusinessContext(context, options);
    
    console.log('   ✅ Analysis complete');
    
    if (options.verbose) {
      console.log(`\n📋 Key Findings:\n`);
      console.log(`   Business: ${analysis.summary?.businessName || 'Unknown'}`);
      console.log(`   Industry: ${analysis.summary?.industry || 'Unknown'}`);
      console.log(`   Positioning: ${analysis.positioning?.statement?.substring(0, 80)}...`);
      console.log(`   Value Prop: ${analysis.valueProposition?.primary?.substring(0, 80)}...`);
      console.log(`   Brand Voice: ${analysis.brandVoice?.personality?.join(', ')}`);
    }

    if (!options.dryRun) {
      // Determine output based on format
      let output;
      let outputPath;

      switch (options.output) {
        case 'summary':
          output = generateSummary(analysis);
          outputPath = 'src/data/business-summary.json';
          break;
        case 'brandscript':
          output = generateBrandScript(analysis);
          outputPath = 'src/data/brandscript.json';
          break;
        default:
          output = analysis;
          outputPath = 'src/data/business-analysis.json';
      }

      await writeJson(outputPath, output);
      console.log(`\n📁 Output: ${outputPath}`);

      // Also save full analysis if not the default
      if (options.output !== 'full') {
        await writeJson('src/data/business-analysis.json', analysis);
        console.log(`   Full analysis: src/data/business-analysis.json`);
      }
    } else {
      console.log('\n📋 Dry run - no files written');
    }

    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('\n📊 Analysis Summary:\n');
    console.log(`   Business: ${analysis.summary?.businessName || 'Not identified'}`);
    console.log(`   Industry: ${analysis.summary?.industry || 'Not identified'}`);
    console.log(`   Confidence: ${analysis.summary?.confidence || 0}%`);
    console.log(`   Sources analyzed: ${context.sources.length}`);
    
    if (analysis.brandVoice?.personality) {
      console.log(`\n   Brand Voice: ${analysis.brandVoice.personality.join(', ')}`);
    }
    
    if (analysis.messaging?.tagline) {
      console.log(`   Suggested Tagline: "${analysis.messaging.tagline}"`);
    }
    
    if (analysis.recommendations?.immediate?.length > 0) {
      console.log('\n   🎯 Top Recommendations:');
      for (const rec of analysis.recommendations.immediate.slice(0, 3)) {
        console.log(`      - ${rec}`);
      }
    }
    
    console.log('');

  } catch (error) {
    console.log(`\n❌ Analysis failed: ${error.message}`);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
