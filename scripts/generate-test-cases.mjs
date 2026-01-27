#!/usr/bin/env node

/**
 * AI Test Case Generator
 * Generates comprehensive test cases from user flows and requirements
 * 
 * Usage:
 *   node scripts/generate-test-cases.mjs                    # Generate all test cases
 *   node scripts/generate-test-cases.mjs --flow=homepage    # Generate for specific flow
 *   node scripts/generate-test-cases.mjs --format=markdown  # Output format
 *   node scripts/generate-test-cases.mjs --dry-run          # Preview without writing
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
    flow: null,
    format: 'json',
    includeAccessibility: true,
    includePerformance: true,
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--flow=')) {
      options.flow = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg === '--no-accessibility') {
      options.includeAccessibility = false;
    } else if (arg === '--no-performance') {
      options.includePerformance = false;
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
AI Test Case Generator - Generate comprehensive test cases from user flows

Usage:
  node scripts/generate-test-cases.mjs [options]

Options:
  --flow=NAME           Generate tests for specific flow only
  --format=FORMAT       Output format: json (default), markdown
  --no-accessibility    Skip accessibility test cases
  --no-performance      Skip performance test cases
  --dry-run, -n         Preview without writing files
  --verbose, -v         Show detailed output
  --help, -h            Show this help message

Output:
  - docs/07-qa/generated-test-cases.json (or .md)
  - Integrates with existing qa-plan.md

Examples:
  npm run ai:generate-tests                           # Generate all tests
  npm run ai:generate-tests -- --flow=homepage        # Tests for homepage flow
  npm run ai:generate-tests -- --format=markdown      # Output as markdown
`);
}

/**
 * Load user flows
 */
async function loadUserFlows() {
  try {
    const data = await readJson('src/data/user-flows.json');
    return data.flows?.filter(f => f.id !== 'flow-template') || [];
  } catch {
    return [];
  }
}

/**
 * Load requirements
 */
async function loadRequirements() {
  try {
    return await readFile('docs/03-requirements/REQUIREMENTS.md');
  } catch {
    return '';
  }
}

/**
 * Load personas for context
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
 * Generate test cases using AI
 */
async function generateTestCases(flows, requirements, personas, options) {
  const systemPrompt = `You are an expert QA engineer specializing in web application testing.
Your task is to generate comprehensive, actionable test cases from user flows and requirements.

Key principles:
1. Each test case must be specific and reproducible
2. Include both happy path and edge cases
3. Cover functional, usability, accessibility, and performance aspects
4. Use clear Given-When-Then format
5. Include expected results and acceptance criteria
6. Consider cross-browser and responsive testing

Test categories to cover:
- Functional: Core functionality works as specified
- Usability: User can complete tasks easily
- Accessibility: WCAG AA compliance
- Performance: Page loads and responds quickly
- Cross-browser: Works in major browsers
- Responsive: Works on mobile, tablet, desktop

Output valid JSON only.`;

  const userPrompt = `Generate comprehensive test cases based on the following inputs:

USER FLOWS:
${JSON.stringify(flows, null, 2)}

REQUIREMENTS:
${requirements.substring(0, 5000)}

PERSONAS:
${personas.map(p => `- ${p.name}: ${p.jtbd}`).join('\n')}

Generate test cases with this JSON structure:
{
  "testPlan": {
    "name": "Website Test Plan",
    "version": "1.0",
    "generatedAt": "${new Date().toISOString()}",
    "coverage": {
      "flows": ${flows.length},
      "categories": ["functional", "usability", "accessibility", "performance", "responsive"]
    }
  },
  "testSuites": [
    {
      "id": "suite-flow-name",
      "name": "Flow Name Test Suite",
      "flow": "flow-id",
      "priority": "high|medium|low",
      "testCases": [
        {
          "id": "tc-001",
          "name": "Test case name",
          "category": "functional|usability|accessibility|performance|responsive",
          "priority": "P1|P2|P3",
          "preconditions": ["List of preconditions"],
          "steps": [
            {
              "step": 1,
              "action": "What the tester does",
              "expectedResult": "What should happen"
            }
          ],
          "acceptanceCriteria": ["Criteria that must be met"],
          "testData": {
            "required": ["Data needed for test"]
          },
          "browsers": ["chrome", "firefox", "safari", "edge"],
          "devices": ["desktop", "tablet", "mobile"]
        }
      ]
    }
  ],
  "accessibilityTests": ${options.includeAccessibility ? `[
    {
      "id": "a11y-001",
      "name": "Keyboard Navigation",
      "wcagCriteria": "2.1.1",
      "level": "A",
      "steps": ["Steps to test"],
      "expectedResult": "Expected accessibility behavior"
    }
  ]` : '[]'},
  "performanceTests": ${options.includePerformance ? `[
    {
      "id": "perf-001",
      "name": "Page Load Time",
      "metric": "LCP|FID|CLS",
      "threshold": "target value",
      "steps": ["Steps to measure"],
      "tools": ["Lighthouse", "WebPageTest"]
    }
  ]` : '[]'},
  "summary": {
    "totalTestCases": 0,
    "byCategory": {},
    "byPriority": {},
    "estimatedDuration": "X hours"
  }
}

Requirements:
- Generate at least 3-5 test cases per user flow
- Include edge cases and error scenarios
- Cover the complete user journey
- Add accessibility tests for key interactions
- Include performance benchmarks`;

  const response = await aiComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    tier: 'standard',
    temperature: 0.5,
    maxTokens: 8000
  });

  return parseAIJson(response);
}

/**
 * Convert test cases to markdown format
 */
function toMarkdown(testData) {
  let md = `# Generated Test Cases\n\n`;
  md += `**Generated:** ${testData.testPlan.generatedAt}\n`;
  md += `**Flows Covered:** ${testData.testPlan.coverage.flows}\n\n`;

  md += `## Summary\n\n`;
  md += `- Total Test Cases: ${testData.summary.totalTestCases}\n`;
  md += `- Estimated Duration: ${testData.summary.estimatedDuration}\n\n`;

  for (const suite of testData.testSuites) {
    md += `## ${suite.name}\n\n`;
    md += `**Priority:** ${suite.priority} | **Flow:** ${suite.flow}\n\n`;

    for (const tc of suite.testCases) {
      md += `### ${tc.id}: ${tc.name}\n\n`;
      md += `**Category:** ${tc.category} | **Priority:** ${tc.priority}\n\n`;

      if (tc.preconditions?.length > 0) {
        md += `**Preconditions:**\n`;
        tc.preconditions.forEach(p => md += `- ${p}\n`);
        md += '\n';
      }

      md += `**Steps:**\n\n`;
      md += `| Step | Action | Expected Result |\n`;
      md += `|------|--------|----------------|\n`;
      tc.steps.forEach(s => {
        md += `| ${s.step} | ${s.action} | ${s.expectedResult} |\n`;
      });
      md += '\n';

      if (tc.acceptanceCriteria?.length > 0) {
        md += `**Acceptance Criteria:**\n`;
        tc.acceptanceCriteria.forEach(c => md += `- [ ] ${c}\n`);
        md += '\n';
      }

      md += `---\n\n`;
    }
  }

  if (testData.accessibilityTests?.length > 0) {
    md += `## Accessibility Tests\n\n`;
    for (const test of testData.accessibilityTests) {
      md += `### ${test.id}: ${test.name}\n`;
      md += `**WCAG:** ${test.wcagCriteria} (Level ${test.level})\n\n`;
      md += `**Steps:**\n`;
      test.steps.forEach((s, i) => md += `${i + 1}. ${s}\n`);
      md += `\n**Expected:** ${test.expectedResult}\n\n`;
    }
  }

  if (testData.performanceTests?.length > 0) {
    md += `## Performance Tests\n\n`;
    md += `| Test | Metric | Threshold | Tools |\n`;
    md += `|------|--------|-----------|-------|\n`;
    for (const test of testData.performanceTests) {
      md += `| ${test.name} | ${test.metric} | ${test.threshold} | ${test.tools.join(', ')} |\n`;
    }
  }

  return md;
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

  console.log('\n🧪 AI Test Case Generator\n');

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
  
  let flows = await loadUserFlows();
  if (options.flow) {
    flows = flows.filter(f => f.id.includes(options.flow) || f.name.toLowerCase().includes(options.flow.toLowerCase()));
  }
  
  const requirements = await loadRequirements();
  const personas = await loadPersonas();

  console.log(`   Flows: ${flows.length}`);
  console.log(`   Personas: ${personas.length}`);
  console.log(`   Requirements: ${requirements ? 'Loaded' : 'Not found'}`);

  if (flows.length === 0) {
    console.log('\n⚠️  No user flows found.');
    console.log('   Run npm run ai:generate-flows first or add flows to src/data/user-flows.json\n');
    process.exit(1);
  }

  // Generate test cases
  console.log('\n🔄 Generating test cases...');
  
  try {
    const testCases = await generateTestCases(flows, requirements, personas, options);
    
    // Calculate summary
    let totalTests = 0;
    const byCategory = {};
    const byPriority = {};

    for (const suite of testCases.testSuites || []) {
      for (const tc of suite.testCases || []) {
        totalTests++;
        byCategory[tc.category] = (byCategory[tc.category] || 0) + 1;
        byPriority[tc.priority] = (byPriority[tc.priority] || 0) + 1;
      }
    }

    testCases.summary = {
      totalTestCases: totalTests + (testCases.accessibilityTests?.length || 0) + (testCases.performanceTests?.length || 0),
      byCategory,
      byPriority,
      estimatedDuration: `${Math.ceil(totalTests * 5 / 60)} hours`
    };

    console.log(`   ✅ Generated ${testCases.summary.totalTestCases} test cases`);

    if (options.verbose) {
      console.log('\n📋 Test Case Summary:\n');
      console.log(`   By Category:`);
      for (const [cat, count] of Object.entries(byCategory)) {
        console.log(`     - ${cat}: ${count}`);
      }
      console.log(`   By Priority:`);
      for (const [pri, count] of Object.entries(byPriority)) {
        console.log(`     - ${pri}: ${count}`);
      }
    }

    if (!options.dryRun) {
      const outputPath = `docs/07-qa/generated-test-cases.${options.format === 'markdown' ? 'md' : 'json'}`;
      
      if (options.format === 'markdown') {
        const md = toMarkdown(testCases);
        const fs = await import('fs/promises');
        await fs.writeFile(path.join(rootDir, outputPath), md, 'utf-8');
      } else {
        await writeJson(outputPath, testCases);
      }
      
      console.log(`\n📁 Output: ${outputPath}`);
    } else {
      console.log('\n📋 Dry run - no files written');
    }

    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('\n📊 Summary:\n');
    console.log(`   Test Suites: ${testCases.testSuites?.length || 0}`);
    console.log(`   Total Tests: ${testCases.summary.totalTestCases}`);
    console.log(`   Accessibility: ${testCases.accessibilityTests?.length || 0}`);
    console.log(`   Performance: ${testCases.performanceTests?.length || 0}`);
    console.log(`   Est. Duration: ${testCases.summary.estimatedDuration}`);
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
