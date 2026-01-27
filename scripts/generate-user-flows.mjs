#!/usr/bin/env node

/**
 * AI User Flow Generator
 * Generates user flows and journey maps from personas and business goals
 * 
 * Usage:
 *   node scripts/generate-user-flows.mjs                    # Generate from personas
 *   node scripts/generate-user-flows.mjs --persona=1        # Generate for specific persona
 *   node scripts/generate-user-flows.mjs --journey          # Include journey maps
 *   node scripts/generate-user-flows.mjs --dry-run          # Preview without writing
 */

import path from 'path';
import { fileURLToPath } from 'url';
import {
  aiComplete,
  parseAIJson,
  readJson,
  writeJson,
  readFile,
  rootDir
} from './lib/ai-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    persona: null,
    journey: false,
    enhance: false,
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--persona=')) {
      options.persona = arg.split('=')[1];
    } else if (arg === '--journey' || arg === '-j') {
      options.journey = true;
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
AI User Flow Generator - Generate user flows from personas and goals

Usage:
  node scripts/generate-user-flows.mjs [options]

Options:
  --persona=ID      Generate flows for specific persona only
  --journey, -j     Include customer journey maps
  --enhance, -e     Enhance existing flows instead of replacing
  --dry-run, -n     Preview without writing files
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Output:
  Updates src/data/user-flows.json with AI-generated flows

Examples:
  npm run ai:generate-flows                           # Generate all flows
  npm run ai:generate-flows -- --persona=persona-1    # Flows for specific persona
  npm run ai:generate-flows -- --journey              # Include journey maps
`);
}

/**
 * Load personas
 */
async function loadPersonas() {
  try {
    const data = await readJson('src/data/personas.json');
    return data.personas?.filter(p => p.id !== 'persona-template') || [];
  } catch {
    return [];
  }
}

/**
 * Load site structure
 */
async function loadSiteStructure() {
  try {
    const config = await readJson('src/data/site-config.json');
    return config;
  } catch {
    return null;
  }
}

/**
 * Load page blueprints
 */
async function loadPageBlueprints() {
  try {
    return await readJson('src/data/page-blueprints.json');
  } catch {
    return null;
  }
}

/**
 * Load existing flows
 */
async function loadExistingFlows() {
  try {
    const data = await readJson('src/data/user-flows.json');
    return {
      flows: data.flows?.filter(f => f.id !== 'flow-template') || [],
      journeyMaps: data.journeyMaps || []
    };
  } catch {
    return { flows: [], journeyMaps: [] };
  }
}

/**
 * Generate user flows using AI
 */
async function generateUserFlows(personas, siteConfig, blueprints, existingFlows, options) {
  const systemPrompt = `You are an expert UX strategist specializing in user flow design and customer journey mapping.
Your task is to create detailed, conversion-optimized user flows based on personas and site structure.

Key principles:
1. Every flow should map to a specific user goal (JTBD)
2. Include decision points and alternative paths
3. Identify potential friction points and drop-off risks
4. Map success states clearly
5. Include failure recovery scenarios
6. Consider emotional state throughout the journey

For each flow, define:
- Entry points (where users start)
- Each step with action, screen, and expected outcome
- Success criteria
- Failure states and recovery options
- Metrics to track

Output valid JSON only.`;

  const pages = siteConfig?.navigation?.main?.map(n => n.label) || ['Home', 'About', 'Services', 'Contact'];

  const userPrompt = `Generate comprehensive user flows based on the following:

PERSONAS:
${JSON.stringify(personas, null, 2)}

SITE PAGES: ${pages.join(', ')}

${blueprints ? `PAGE BLUEPRINTS:
${JSON.stringify(Object.keys(blueprints.blueprints || {}), null, 2)}` : ''}

${options.enhance && existingFlows.flows.length > 0 ? `EXISTING FLOWS TO ENHANCE:
${JSON.stringify(existingFlows.flows, null, 2)}` : ''}

Generate user flows with this JSON structure:
{
  "flows": [
    {
      "id": "flow-descriptive-name",
      "name": "User Flow Name",
      "description": "Brief description of this user journey",
      "persona": "persona-id",
      "goal": "What the user wants to accomplish (from JTBD)",
      "entry": {
        "screen": "Entry page",
        "path": "/",
        "trigger": "How user arrives (search, direct, referral, ad)"
      },
      "steps": [
        {
          "order": 1,
          "screen": "Page/Screen name",
          "action": "What user does",
          "element": "UI element interacted with",
          "outcome": "Result of action",
          "emotionalState": "curious|confident|uncertain|frustrated|satisfied",
          "notes": "Implementation or design notes"
        }
      ],
      "successState": "Clear description of successful completion",
      "failureStates": [
        {
          "description": "What can go wrong",
          "cause": "Why it happens",
          "recovery": "How to recover",
          "prevention": "How to prevent"
        }
      ],
      "metrics": {
        "target": "Success metric (e.g., 5% conversion)",
        "tracking": ["Events to track"],
        "kpis": ["Key performance indicators"]
      },
      "optimizationOpportunities": [
        "Suggestions to improve this flow"
      ]
    }
  ]${options.journey ? `,
  "journeyMaps": [
    {
      "id": "journey-persona-name",
      "name": "Customer Journey Name",
      "persona": "persona-id",
      "phases": [
        {
          "name": "Phase name (Awareness/Consideration/Decision/Onboarding/Advocacy)",
          "duration": "Typical duration",
          "touchpoints": [
            {
              "channel": "Website|Email|Social|Search|Ad",
              "action": "What user does",
              "emotion": "positive|neutral|negative",
              "painPoints": ["Potential frustrations"],
              "opportunity": "How to improve"
            }
          ],
          "goals": ["User goals in this phase"],
          "questions": ["Questions user has"]
        }
      ],
      "moments": {
        "truth": ["Critical decision moments"],
        "delight": ["Opportunities to exceed expectations"],
        "pain": ["Major friction points to address"]
      }
    }
  ]` : ''}
}

Requirements:
- Generate at least 2-3 flows per persona
- Cover primary conversion paths (contact, purchase, signup)
- Include informational journeys (learn about services, compare options)
- Map failure states for each critical step
- Include metrics and tracking recommendations
${options.journey ? '- Generate a comprehensive journey map for each persona' : ''}`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.7,
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

  console.log('\n🔀 AI User Flow Generator\n');

  // Check for AI provider
  const hasProvider = process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY || 
                      process.env.GOOGLE_AI_KEY;

  if (!hasProvider) {
    console.log('⚠️  No AI provider configured.');
    console.log('   Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY\n');
    process.exit(1);
  }

  // Load inputs
  console.log('📚 Loading inputs...');
  
  let personas = await loadPersonas();
  if (options.persona) {
    personas = personas.filter(p => p.id === options.persona || p.id.includes(options.persona));
  }
  
  const siteConfig = await loadSiteStructure();
  const blueprints = await loadPageBlueprints();
  const existingFlows = await loadExistingFlows();

  console.log(`   Personas: ${personas.length}`);
  console.log(`   Site config: ${siteConfig ? 'Loaded' : 'Not found'}`);
  console.log(`   Existing flows: ${existingFlows.flows.length}`);

  if (personas.length === 0) {
    console.log('\n⚠️  No personas found.');
    console.log('   Run npm run ai:generate-personas first or add personas to src/data/personas.json\n');
    process.exit(1);
  }

  // Generate flows
  console.log('\n🔄 Generating user flows...');
  
  try {
    const result = await generateUserFlows(personas, siteConfig, blueprints, existingFlows, options);
    
    const flowCount = result.flows?.length || 0;
    const journeyCount = result.journeyMaps?.length || 0;

    console.log(`   ✅ Generated ${flowCount} flow(s)`);
    if (options.journey) {
      console.log(`   ✅ Generated ${journeyCount} journey map(s)`);
    }

    if (options.verbose) {
      console.log('\n📋 Generated Flows:\n');
      for (const flow of result.flows || []) {
        console.log(`   ${flow.id}: ${flow.name}`);
        console.log(`      Persona: ${flow.persona}`);
        console.log(`      Steps: ${flow.steps?.length || 0}`);
        console.log('');
      }
    }

    if (!options.dryRun) {
      // Load existing file structure or create new
      let flowsFile;
      try {
        flowsFile = await readJson('src/data/user-flows.json');
      } catch {
        flowsFile = {
          "$schema": "./schemas/user-flows.schema.json",
          "version": "1.0.0",
          "lastUpdated": "",
          "flows": [],
          "journeyMaps": [],
          "template": {}
        };
      }

      // Update flows
      if (options.enhance && existingFlows.flows.length > 0) {
        // Merge with existing
        const existingIds = new Set(existingFlows.flows.map(f => f.id));
        const newFlows = result.flows?.filter(f => !existingIds.has(f.id)) || [];
        flowsFile.flows = [...existingFlows.flows, ...newFlows];
      } else {
        flowsFile.flows = result.flows || [];
      }

      if (options.journey) {
        flowsFile.journeyMaps = result.journeyMaps || [];
      }

      flowsFile.lastUpdated = new Date().toISOString();
      flowsFile.generatedBy = 'ai-user-flow-generator';

      await writeJson('src/data/user-flows.json', flowsFile);
      console.log('\n📁 Output: src/data/user-flows.json');
    } else {
      console.log('\n📋 Dry run - no files written');
    }

    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('\n📊 Summary:\n');
    console.log(`   Flows generated: ${flowCount}`);
    if (options.journey) {
      console.log(`   Journey maps: ${journeyCount}`);
    }
    
    const totalSteps = (result.flows || []).reduce((sum, f) => sum + (f.steps?.length || 0), 0);
    console.log(`   Total steps: ${totalSteps}`);
    
    const avgSteps = flowCount > 0 ? Math.round(totalSteps / flowCount) : 0;
    console.log(`   Avg steps per flow: ${avgSteps}`);
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
