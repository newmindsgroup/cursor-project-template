#!/usr/bin/env node

/**
 * AI Persona Generator
 * Generates detailed user personas from business context using AI
 * 
 * Usage:
 *   node scripts/generate-personas.mjs              # Generate personas from business context
 *   node scripts/generate-personas.mjs --count=4   # Generate specific number of personas
 *   node scripts/generate-personas.mjs --enhance   # Enhance existing personas
 *   node scripts/generate-personas.mjs --dry-run   # Preview without writing
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    count: 3,
    enhance: false,
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--enhance' || arg === '-e') {
      options.enhance = true;
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
AI Persona Generator - Create detailed user personas from business context

Usage:
  node scripts/generate-personas.mjs [options]

Options:
  --count=N        Number of personas to generate (default: 3)
  --enhance, -e    Enhance existing personas instead of replacing
  --dry-run, -n    Preview generation without writing files
  --verbose, -v    Show detailed output
  --help, -h       Show this help message

Output:
  Updates src/data/personas.json with AI-generated personas

Examples:
  npm run ai:generate-personas                    # Generate 3 personas
  npm run ai:generate-personas -- --count=5      # Generate 5 personas
  npm run ai:generate-personas -- --enhance      # Enhance existing personas
`);
}

/**
 * Load all available business context
 */
async function loadBusinessContext() {
  const context = {
    sources: [],
    content: ''
  };

  // Load PROJECT.md
  try {
    const projectContent = await readFile('PROJECT.md');
    context.sources.push('PROJECT.md');
    context.content += `\n### PROJECT.md\n${projectContent}\n`;
  } catch {
    // No project file
  }

  // Load SCOPE.md
  try {
    const scopeContent = await readFile('SCOPE.md');
    context.sources.push('SCOPE.md');
    context.content += `\n### SCOPE.md\n${scopeContent}\n`;
  } catch {
    // No scope file
  }

  // Load discovery summary
  try {
    const discoveryContent = await readFile('docs/02-discovery/discovery-summary.md');
    context.sources.push('discovery-summary.md');
    context.content += `\n### Discovery Summary\n${discoveryContent}\n`;
  } catch {
    // No discovery
  }

  // Load requirements
  try {
    const reqContent = await readFile('docs/03-requirements/REQUIREMENTS.md');
    context.sources.push('REQUIREMENTS.md');
    context.content += `\n### Requirements\n${reqContent}\n`;
  } catch {
    // No requirements
  }

  // Scan business-context folder
  try {
    const bcFiles = await findFiles('business-context', /\.(md|txt|pdf)$/);
    for (const file of bcFiles.slice(0, 5)) { // Limit to 5 files
      try {
        const content = await readFile(file);
        const fileName = path.basename(file);
        context.sources.push(`business-context/${fileName}`);
        context.content += `\n### ${fileName}\n${content.substring(0, 5000)}\n`;
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // No business context folder
  }

  return context;
}

/**
 * Load existing personas if any
 */
async function loadExistingPersonas() {
  try {
    const data = await readJson('src/data/personas.json');
    return data.personas?.filter(p => p.id !== 'persona-template') || [];
  } catch {
    return [];
  }
}

/**
 * Generate personas using AI
 */
async function generatePersonas(context, existingPersonas, options) {
  const systemPrompt = `You are an expert UX researcher and strategist specializing in user persona development.
Your task is to create detailed, actionable user personas based on business context.

Key principles:
1. Each persona should be distinct with unique needs, goals, and pain points
2. Use Jobs-to-be-Done (JTBD) format: "When [situation], I want to [action], so I can [outcome]"
3. Include realistic, memorable details that help teams empathize
4. Focus on behaviors and motivations, not just demographics
5. Each persona should represent a significant segment of the target audience

Output valid JSON only, no markdown formatting.`;

  const enhancePrompt = existingPersonas.length > 0 && options.enhance ? `
Existing personas to enhance:
${JSON.stringify(existingPersonas, null, 2)}

Please enhance these personas with more detailed:
- Behaviors and habits
- Technology usage patterns
- Decision-making factors
- Emotional triggers
- Quote that captures their perspective
` : '';

  const userPrompt = `Generate ${options.count} detailed user personas based on the following business context.

${enhancePrompt}

Business Context Sources: ${context.sources.join(', ')}

---
${context.content.substring(0, 15000)}
---

Output JSON structure (array of personas):
[
  {
    "id": "persona-1",
    "name": "Role/Title",
    "shortName": "FirstName",
    "image": "placeholder",
    "demographics": {
      "age": "Age range",
      "role": "Job title",
      "company": "Company type/size",
      "techSavviness": "Basic|Intermediate|Advanced",
      "income": "Income range (optional)",
      "location": "Geographic info (optional)"
    },
    "jtbd": "When [situation], I want to [action], so I can [outcome].",
    "goals": [
      "Primary goal 1",
      "Primary goal 2",
      "Primary goal 3",
      "Primary goal 4"
    ],
    "frustrations": [
      "Pain point 1",
      "Pain point 2", 
      "Pain point 3",
      "Pain point 4"
    ],
    "behaviors": [
      "Typical behavior 1",
      "Typical behavior 2",
      "Typical behavior 3",
      "Typical behavior 4"
    ],
    "quote": "A memorable quote that captures their perspective",
    "scenarios": [
      {
        "name": "Scenario name",
        "description": "Brief description of a typical use case"
      }
    ],
    "influences": {
      "brands": ["Brands they trust"],
      "sources": ["Where they get information"],
      "decisionFactors": ["What drives their decisions"]
    }
  }
]

Requirements:
- Generate exactly ${options.count} personas
- Make each persona distinct and memorable
- Include specific, realistic details
- Ensure JTBD statements are complete and actionable
- Use professional but approachable language`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.8,
    maxTokens: 8000
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

  console.log('\n👥 AI Persona Generator\n');

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
    console.log('   Add content to PROJECT.md or business-context/ folder first.\n');
    process.exit(1);
  }
  
  console.log(`   Found ${context.sources.length} source(s): ${context.sources.join(', ')}`);

  // Load existing personas if enhancing
  const existingPersonas = options.enhance ? await loadExistingPersonas() : [];
  if (options.enhance && existingPersonas.length > 0) {
    console.log(`   Enhancing ${existingPersonas.length} existing persona(s)`);
  }

  // Generate personas
  console.log(`\n🔄 Generating ${options.count} persona(s)...`);
  
  try {
    const personas = await generatePersonas(context, existingPersonas, options);
    
    if (!Array.isArray(personas) || personas.length === 0) {
      throw new Error('AI returned invalid personas data');
    }

    console.log(`   ✅ Generated ${personas.length} persona(s)`);

    if (options.verbose) {
      console.log('\n📋 Generated Personas:\n');
      for (const persona of personas) {
        console.log(`   ${persona.id}: ${persona.name}`);
        console.log(`      JTBD: ${persona.jtbd}`);
        console.log(`      Goals: ${persona.goals?.length || 0} | Frustrations: ${persona.frustrations?.length || 0}`);
        console.log('');
      }
    }

    if (!options.dryRun) {
      // Load existing file structure
      let personasFile;
      try {
        personasFile = await readJson('src/data/personas.json');
      } catch {
        personasFile = {
          "$schema": "./schemas/personas.schema.json",
          "version": "1.0.0",
          "lastUpdated": "",
          "personas": [],
          "template": {}
        };
      }

      // Update personas
      personasFile.personas = personas;
      personasFile.lastUpdated = new Date().toISOString();
      personasFile.generatedBy = 'ai-persona-generator';
      personasFile.sources = context.sources;

      await writeJson('src/data/personas.json', personasFile);
      console.log('\n📁 Output: src/data/personas.json');
    } else {
      console.log('\n📋 Dry run - no files written');
    }

    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('\n📊 Summary:\n');
    console.log(`   Personas generated: ${personas.length}`);
    console.log(`   Context sources: ${context.sources.length}`);
    
    if (personas.length > 0) {
      const avgGoals = Math.round(personas.reduce((sum, p) => sum + (p.goals?.length || 0), 0) / personas.length);
      console.log(`   Avg goals per persona: ${avgGoals}`);
    }

    console.log('');

  } catch (error) {
    console.log(`\n❌ Generation failed: ${error.message}`);
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
