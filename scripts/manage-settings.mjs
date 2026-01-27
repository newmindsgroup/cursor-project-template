#!/usr/bin/env node

/**
 * Project Settings Manager
 * Manage API keys and project configuration
 * 
 * Usage:
 *   node scripts/manage-settings.mjs                    # Interactive setup
 *   node scripts/manage-settings.mjs --show             # Show current settings
 *   node scripts/manage-settings.mjs --set-key openai   # Set specific key
 *   node scripts/manage-settings.mjs --test             # Test API connections
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SETTINGS_PATH = path.join(rootDir, 'project-settings.json');
const LOCAL_SETTINGS_PATH = path.join(rootDir, 'project-settings.local.json');

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    keyPrefix: 'sk-',
    testEndpoint: 'https://api.openai.com/v1/models',
    docs: 'https://platform.openai.com/api-keys'
  },
  anthropic: {
    name: 'Anthropic',
    keyPrefix: 'sk-ant-',
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    docs: 'https://console.anthropic.com/'
  },
  google: {
    name: 'Google AI',
    keyPrefix: 'AI',
    testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    docs: 'https://makersuite.google.com/app/apikey'
  },
  nanobanana: {
    name: 'NanoBanana (Images)',
    keyPrefix: '',
    testEndpoint: null,
    docs: 'https://nanobanana.ai/api'
  }
};

// CLI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
    show: false,
    setKey: null,
    test: false,
    interactive: true,
    help: false
  };

  for (const arg of args) {
    if (arg === '--show' || arg === '-s') {
      options.show = true;
      options.interactive = false;
    } else if (arg.startsWith('--set-key=')) {
      options.setKey = arg.split('=')[1];
      options.interactive = false;
    } else if (arg === '--test' || arg === '-t') {
      options.test = true;
      options.interactive = false;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
      options.interactive = false;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Project Settings Manager', colors.bold, colors.cyan)}

Manage API keys and project configuration for AI-powered features.

${color('Usage:', colors.bold)}
  node scripts/manage-settings.mjs [options]

${color('Options:', colors.bold)}
  --show, -s           Show current settings (keys masked)
  --set-key=PROVIDER   Set API key for specific provider
  --test, -t           Test all configured API connections
  --help, -h           Show this help message

${color('Providers:', colors.bold)}
  openai       OpenAI (GPT-4, GPT-3.5)
  anthropic    Anthropic (Claude)
  google       Google AI (Gemini)
  nanobanana   NanoBanana (Image generation)

${color('Examples:', colors.bold)}
  npm run settings                    # Interactive setup
  npm run settings:show               # Show current config
  npm run settings:test               # Test API connections
  npm run settings -- --set-key=openai

${color('Files:', colors.bold)}
  project-settings.json        Default settings (can commit)
  project-settings.local.json  Local overrides (gitignored)

${color('Note:', colors.bold)}
  API keys in project-settings.local.json take priority.
  If no keys are configured, scripts will use Cursor's native AI.
`);
}

/**
 * Load current settings
 */
async function loadSettings() {
  // Try local settings first
  try {
    const content = await fs.readFile(LOCAL_SETTINGS_PATH, 'utf-8');
    return { settings: JSON.parse(content), source: 'local' };
  } catch {
    // Fall back to default settings
  }
  
  try {
    const content = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return { settings: JSON.parse(content), source: 'default' };
  } catch {
    return { settings: createDefaultSettings(), source: 'new' };
  }
}

/**
 * Save settings
 */
async function saveSettings(settings, useLocal = true) {
  const targetPath = useLocal ? LOCAL_SETTINGS_PATH : SETTINGS_PATH;
  await fs.writeFile(targetPath, JSON.stringify(settings, null, 2), 'utf-8');
  return targetPath;
}

/**
 * Create default settings
 */
function createDefaultSettings() {
  return {
    "$schema": "./src/data/schemas/project-settings.schema.json",
    "_comment": "Project settings - API keys stored here. Use project-settings.local.json for sensitive keys.",
    "ai": {
      "apiKeys": {
        "openai": "",
        "anthropic": "",
        "google": "",
        "nanobanana": ""
      },
      "preferences": {
        "defaultProvider": "auto",
        "contentModel": "",
        "analysisModel": "",
        "quickModel": "",
        "imageModel": ""
      },
      "settings": {
        "temperature": 0.7,
        "maxTokens": 4096,
        "maxRetries": 3,
        "useCursorFallback": true
      }
    },
    "project": {
      "name": "",
      "client": "",
      "industry": "",
      "targetLanguages": ["en"]
    }
  };
}

/**
 * Mask API key for display
 */
function maskKey(key) {
  if (!key) return color('(not set)', colors.dim);
  if (key.length < 10) return color('(invalid)', colors.red);
  return color(key.substring(0, 7) + '...' + key.substring(key.length - 4), colors.green);
}

/**
 * Show current settings
 */
async function showSettings() {
  const { settings, source } = await loadSettings();
  
  console.log(`\n${color('Project Settings', colors.bold, colors.cyan)}\n`);
  console.log(`Source: ${color(source === 'local' ? 'project-settings.local.json' : 'project-settings.json', colors.blue)}\n`);
  
  console.log(color('AI API Keys:', colors.bold));
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    const key = settings.ai?.apiKeys?.[id] || process.env[`${id.toUpperCase()}_API_KEY`] || '';
    const status = key ? '✓' : '✗';
    const statusColor = key ? colors.green : colors.dim;
    console.log(`  ${color(status, statusColor)} ${provider.name.padEnd(20)} ${maskKey(key)}`);
  }
  
  console.log(`\n${color('AI Settings:', colors.bold)}`);
  console.log(`  Default Provider:   ${settings.ai?.preferences?.defaultProvider || 'auto'}`);
  console.log(`  Temperature:        ${settings.ai?.settings?.temperature || 0.7}`);
  console.log(`  Max Tokens:         ${settings.ai?.settings?.maxTokens || 4096}`);
  console.log(`  Cursor Fallback:    ${settings.ai?.settings?.useCursorFallback !== false ? 'enabled' : 'disabled'}`);
  
  if (settings.project?.name) {
    console.log(`\n${color('Project:', colors.bold)}`);
    console.log(`  Name:     ${settings.project.name}`);
    console.log(`  Client:   ${settings.project.client || '(not set)'}`);
    console.log(`  Industry: ${settings.project.industry || '(not set)'}`);
  }
  
  console.log('');
}

/**
 * Test API connection
 */
async function testProvider(providerId, apiKey) {
  const provider = PROVIDERS[providerId];
  if (!provider.testEndpoint) {
    return { success: true, message: 'No test available' };
  }
  
  try {
    const headers = { 'Content-Type': 'application/json' };
    
    if (providerId === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (providerId === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (providerId === 'google') {
      // Google uses query param
    }
    
    const url = providerId === 'google' 
      ? `${provider.testEndpoint}?key=${apiKey}`
      : provider.testEndpoint;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      return { success: true, message: 'Connected' };
    } else {
      const error = await response.text();
      return { success: false, message: `Error ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Test all configured APIs
 */
async function testAllProviders() {
  const { settings } = await loadSettings();
  
  console.log(`\n${color('Testing API Connections', colors.bold, colors.cyan)}\n`);
  
  let anyConfigured = false;
  
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    const key = settings.ai?.apiKeys?.[id] || process.env[`${id.toUpperCase()}_API_KEY`] || '';
    
    if (!key) {
      console.log(`  ${color('○', colors.dim)} ${provider.name.padEnd(20)} ${color('(not configured)', colors.dim)}`);
      continue;
    }
    
    anyConfigured = true;
    process.stdout.write(`  ${color('◌', colors.yellow)} ${provider.name.padEnd(20)} Testing...`);
    
    const result = await testProvider(id, key);
    
    // Clear line and rewrite
    process.stdout.write('\r');
    if (result.success) {
      console.log(`  ${color('●', colors.green)} ${provider.name.padEnd(20)} ${color(result.message, colors.green)}`);
    } else {
      console.log(`  ${color('●', colors.red)} ${provider.name.padEnd(20)} ${color(result.message, colors.red)}`);
    }
  }
  
  if (!anyConfigured) {
    console.log(`\n${color('No API keys configured.', colors.yellow)}`);
    console.log(`Run ${color('npm run settings', colors.cyan)} to set up API keys.\n`);
  }
  
  console.log('');
}

/**
 * Prompt for input
 */
function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Set a specific API key
 */
async function setApiKey(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    console.log(`${color('Unknown provider:', colors.red)} ${providerId}`);
    console.log(`Available: ${Object.keys(PROVIDERS).join(', ')}`);
    process.exit(1);
  }
  
  console.log(`\n${color(`Set ${provider.name} API Key`, colors.bold, colors.cyan)}\n`);
  console.log(`Get your key from: ${color(provider.docs, colors.blue)}\n`);
  
  const key = await prompt(`Enter ${provider.name} API key: `);
  
  if (!key) {
    console.log(color('\nNo key entered. Cancelled.', colors.yellow));
    return;
  }
  
  // Load and update settings
  const { settings } = await loadSettings();
  if (!settings.ai) settings.ai = {};
  if (!settings.ai.apiKeys) settings.ai.apiKeys = {};
  settings.ai.apiKeys[providerId] = key;
  
  // Save to local settings (gitignored)
  const savedPath = await saveSettings(settings, true);
  console.log(`\n${color('✓', colors.green)} API key saved to ${color(path.basename(savedPath), colors.blue)}`);
  
  // Test the key
  console.log('\nTesting connection...');
  const result = await testProvider(providerId, key);
  if (result.success) {
    console.log(`${color('✓', colors.green)} ${result.message}\n`);
  } else {
    console.log(`${color('✗', colors.red)} ${result.message}`);
    console.log(`The key was saved but may not be valid.\n`);
  }
}

/**
 * Interactive setup
 */
async function interactiveSetup() {
  console.log(`
${color('═'.repeat(50), colors.cyan)}
${color('  Project Settings Setup', colors.bold, colors.cyan)}
${color('═'.repeat(50), colors.cyan)}

This wizard will help you configure AI API keys.
Keys are stored in ${color('project-settings.local.json', colors.blue)} (gitignored).

${color('Available Providers:', colors.bold)}
`);

  for (const [id, provider] of Object.entries(PROVIDERS)) {
    console.log(`  ${color(id.padEnd(12), colors.cyan)} ${provider.name}`);
    console.log(`              ${color(provider.docs, colors.dim)}`);
  }

  console.log(`
${color('Options:', colors.bold)}
  1. Set up OpenAI (recommended for content)
  2. Set up Anthropic (recommended for analysis)
  3. Set up Google AI (fast, cost-effective)
  4. Set up all providers
  5. Show current settings
  6. Test connections
  0. Exit
`);

  const choice = await prompt('Select option (1-6, 0 to exit): ');
  
  switch (choice) {
    case '1':
      await setApiKey('openai');
      break;
    case '2':
      await setApiKey('anthropic');
      break;
    case '3':
      await setApiKey('google');
      break;
    case '4':
      for (const id of ['openai', 'anthropic', 'google', 'nanobanana']) {
        const setup = await prompt(`\nSet up ${PROVIDERS[id].name}? (y/n): `);
        if (setup.toLowerCase() === 'y') {
          await setApiKey(id);
        }
      }
      break;
    case '5':
      await showSettings();
      break;
    case '6':
      await testAllProviders();
      break;
    case '0':
    case '':
      console.log('\nExiting setup.\n');
      break;
    default:
      console.log(color('\nInvalid option.', colors.yellow));
  }
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  if (options.show) {
    await showSettings();
    return;
  }
  
  if (options.test) {
    await testAllProviders();
    return;
  }
  
  if (options.setKey) {
    await setApiKey(options.setKey);
    return;
  }
  
  if (options.interactive) {
    await interactiveSetup();
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
