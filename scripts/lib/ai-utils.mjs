/**
 * AI Utilities Library
 * Shared utilities for all AI-powered scripts
 * Supports multiple providers: OpenAI, Anthropic, Google AI
 * Falls back to Cursor's native AI when no API keys are configured
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Cache configuration
const CACHE_DIR = path.join(rootDir, '.generation-cache');
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Provider configurations
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    envKey: 'OPENAI_API_KEY',
    settingsKey: 'openai',
    models: {
      fast: 'gpt-3.5-turbo',
      standard: 'gpt-4-turbo-preview',
      advanced: 'gpt-4o'
    }
  },
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    envKey: 'ANTHROPIC_API_KEY',
    settingsKey: 'anthropic',
    models: {
      fast: 'claude-3-haiku-20240307',
      standard: 'claude-3-sonnet-20240229',
      advanced: 'claude-3-opus-20240229'
    }
  },
  google: {
    name: 'Google AI',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    envKey: 'GOOGLE_AI_KEY',
    settingsKey: 'google',
    models: {
      fast: 'gemini-1.5-flash',
      standard: 'gemini-1.5-pro',
      advanced: 'gemini-1.5-pro'
    }
  }
};

// Default configuration
const DEFAULT_CONFIG = {
  defaultProvider: 'auto',
  defaultTier: 'standard',
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000,
  temperature: 0.7,
  maxTokens: 4096,
  useCursorFallback: true,
  useCache: true
};

// Project settings cache
let projectSettingsCache = null;

// Cache statistics
let cacheStats = {
  hits: 0,
  misses: 0,
  saved: 0
};

/**
 * Generate a hash key for caching
 */
function generateCacheKey(messages, options = {}) {
  const content = JSON.stringify({
    messages,
    tier: options.tier,
    temperature: options.temperature,
    json: options.json
  });
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Get cached response if available and not expired
 */
async function getCachedResponse(cacheKey) {
  try {
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    const content = await fs.readFile(cachePath, 'utf-8');
    const cached = JSON.parse(content);
    
    // Check if cache is expired
    if (cached.timestamp && (Date.now() - cached.timestamp) > CACHE_TTL) {
      // Expired - remove cache file
      await fs.unlink(cachePath).catch(() => {});
      return null;
    }
    
    cacheStats.hits++;
    return cached.response;
  } catch {
    return null;
  }
}

/**
 * Save response to cache
 */
async function setCachedResponse(cacheKey, response) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    const cacheData = {
      timestamp: Date.now(),
      response
    };
    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2), 'utf-8');
    cacheStats.saved++;
  } catch {
    // Cache write failed - not critical
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const hitRate = cacheStats.hits + cacheStats.misses > 0 
    ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)
    : 0;
  return {
    ...cacheStats,
    hitRate: `${hitRate}%`
  };
}

/**
 * Clear all cached responses
 */
export async function clearCache() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    let cleared = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(CACHE_DIR, file));
        cleared++;
      }
    }
    cacheStats = { hits: 0, misses: 0, saved: 0 };
    return { cleared };
  } catch {
    return { cleared: 0 };
  }
}

/**
 * Load project settings from project-settings.json
 */
export async function loadProjectSettings() {
  if (projectSettingsCache) return projectSettingsCache;
  
  const settingsPaths = [
    path.join(rootDir, 'project-settings.local.json'), // Local override (gitignored)
    path.join(rootDir, 'project-settings.json')        // Default settings
  ];
  
  for (const settingsPath of settingsPaths) {
    try {
      const content = await fs.readFile(settingsPath, 'utf-8');
      projectSettingsCache = JSON.parse(content);
      return projectSettingsCache;
    } catch {
      // Try next path
    }
  }
  
  return null;
}

/**
 * Load AI configuration from file or use defaults
 */
export async function loadAIConfig() {
  const configPath = path.join(rootDir, 'src/data/ai-config.json');
  const projectSettings = await loadProjectSettings();
  
  let config = { ...DEFAULT_CONFIG };
  
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    config = { ...config, ...JSON.parse(content).settings };
  } catch {
    // Use defaults
  }
  
  // Merge project settings if available
  if (projectSettings?.ai?.settings) {
    config = { ...config, ...projectSettings.ai.settings };
  }
  
  return config;
}

/**
 * Get API key from project settings or environment
 */
function getApiKey(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) return null;
  
  // Check project settings first (synchronous since we cache)
  if (projectSettingsCache?.ai?.apiKeys?.[provider.settingsKey]) {
    return projectSettingsCache.ai.apiKeys[provider.settingsKey];
  }
  
  // Fall back to environment variable
  return process.env[provider.envKey] || null;
}

/**
 * Get available API key from project settings or environment
 */
export async function getAvailableProvider() {
  // Ensure settings are loaded
  await loadProjectSettings();
  
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    const apiKey = getApiKey(id);
    if (apiKey) {
      return { id, ...provider, apiKey };
    }
  }
  return null;
}

/**
 * Get specific provider configuration
 */
export async function getProvider(providerId) {
  // Ensure settings are loaded
  await loadProjectSettings();
  
  const provider = PROVIDERS[providerId];
  if (!provider) return null;
  
  const apiKey = getApiKey(providerId);
  if (!apiKey) return null;
  
  return { id: providerId, ...provider, apiKey };
}

/**
 * Check if any AI provider is available
 */
export async function hasAIProvider() {
  const provider = await getAvailableProvider();
  return provider !== null;
}

/**
 * Check if Cursor fallback is enabled
 */
export async function isCursorFallbackEnabled() {
  const config = await loadAIConfig();
  return config.useCursorFallback !== false;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(apiKey, model, messages, options = {}) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      response_format: options.json ? { type: 'json_object' } : undefined
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Anthropic API
 */
async function callAnthropic(apiKey, model, messages, options = {}) {
  // Convert messages format for Anthropic
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 4096,
      system: systemMessage?.content || '',
      messages: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Call Google AI API
 */
async function callGoogleAI(apiKey, model, messages, options = {}) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  // Handle system message by prepending to first user message
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage && contents.length > 0) {
    contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: contents.filter(c => c.role !== 'system'),
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 4096
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * Generate a prompt file for Cursor fallback mode
 */
async function generateCursorPrompt(messages, options = {}) {
  const promptDir = path.join(rootDir, '.cursor-prompts');
  await fs.mkdir(promptDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const promptId = options.promptId || `ai-request-${timestamp}`;
  const promptPath = path.join(promptDir, `${promptId}.md`);
  const responsePath = path.join(promptDir, `${promptId}.response.json`);
  
  // Build the prompt content
  let promptContent = `# AI Request: ${promptId}\n\n`;
  promptContent += `**Generated:** ${new Date().toISOString()}\n`;
  promptContent += `**Script:** ${options.scriptName || 'unknown'}\n\n`;
  promptContent += `---\n\n`;
  promptContent += `## Instructions\n\n`;
  promptContent += `No API key is configured. Please run this prompt through Cursor's AI:\n\n`;
  promptContent += `1. Select all the content below the "PROMPT" section\n`;
  promptContent += `2. Open Cursor's AI chat (Cmd+L or Ctrl+L)\n`;
  promptContent += `3. Paste and send the prompt\n`;
  promptContent += `4. Copy the AI's JSON response\n`;
  promptContent += `5. Save it to: \`${path.relative(rootDir, responsePath)}\`\n`;
  promptContent += `6. Re-run the original command\n\n`;
  promptContent += `---\n\n`;
  promptContent += `## PROMPT\n\n`;
  
  // Add system message
  const systemMsg = messages.find(m => m.role === 'system');
  if (systemMsg) {
    promptContent += `### System Context\n\n`;
    promptContent += `${systemMsg.content}\n\n`;
  }
  
  // Add user message
  const userMsg = messages.find(m => m.role === 'user');
  if (userMsg) {
    promptContent += `### Request\n\n`;
    promptContent += `${userMsg.content}\n\n`;
  }
  
  promptContent += `---\n\n`;
  promptContent += `## Expected Response Format\n\n`;
  promptContent += `Save the AI's response as valid JSON to:\n`;
  promptContent += `\`${path.relative(rootDir, responsePath)}\`\n`;
  
  await fs.writeFile(promptPath, promptContent, 'utf-8');
  
  return { promptPath, responsePath, promptId };
}

/**
 * Check for existing Cursor response
 */
async function checkCursorResponse(responsePath) {
  try {
    const content = await fs.readFile(responsePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Main AI completion function
 * Automatically selects available provider or uses specified one
 * Falls back to Cursor prompt generation when no API key is available
 * 
 * Options:
 *   - provider: Specific provider to use
 *   - tier: 'fast' | 'standard' | 'advanced'
 *   - temperature: 0-2
 *   - maxTokens: Max response tokens
 *   - json: Request JSON response
 *   - cache: true/false - Use caching (default: true)
 *   - forceRefresh: true/false - Skip cache and regenerate
 */
export async function aiComplete(messages, options = {}) {
  const config = await loadAIConfig();
  
  // Check cache first (unless disabled or force refresh)
  const useCache = options.cache !== false && config.useCache !== false && !options.forceRefresh;
  const cacheKey = useCache ? generateCacheKey(messages, options) : null;
  
  if (useCache && cacheKey) {
    const cachedResponse = await getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    cacheStats.misses++;
  }
  
  // Get provider
  let provider;
  if (options.provider) {
    provider = await getProvider(options.provider);
    if (!provider) {
      // Check if Cursor fallback is enabled
      if (config.useCursorFallback) {
        return await handleCursorFallback(messages, options, config);
      }
      throw new Error(`Provider '${options.provider}' not configured or API key missing`);
    }
  } else {
    provider = await getAvailableProvider();
    if (!provider) {
      // Check if Cursor fallback is enabled
      if (config.useCursorFallback) {
        return await handleCursorFallback(messages, options, config);
      }
      throw new Error('No AI provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY in project-settings.json or .env');
    }
  }

  // Get model
  const tier = options.tier || config.defaultTier;
  const model = options.model || provider.models[tier];

  // Call appropriate provider
  const callOptions = {
    temperature: options.temperature ?? config.temperature,
    maxTokens: options.maxTokens ?? config.maxTokens,
    json: options.json
  };

  let lastError;
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      let response;
      switch (provider.id) {
        case 'openai':
          response = await callOpenAI(provider.apiKey, model, messages, callOptions);
          break;
        case 'anthropic':
          response = await callAnthropic(provider.apiKey, model, messages, callOptions);
          break;
        case 'google':
          response = await callGoogleAI(provider.apiKey, model, messages, callOptions);
          break;
        default:
          throw new Error(`Unknown provider: ${provider.id}`);
      }
      
      // Cache successful response
      if (useCache && cacheKey && response) {
        await setCachedResponse(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < config.maxRetries - 1) {
        await sleep(config.retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError;
}

/**
 * Handle Cursor fallback mode
 */
async function handleCursorFallback(messages, options, config) {
  const { promptPath, responsePath, promptId } = await generateCursorPrompt(messages, options);
  
  // Check if response already exists
  const existingResponse = await checkCursorResponse(responsePath);
  if (existingResponse) {
    console.log(`   📋 Using cached Cursor response from ${path.basename(responsePath)}`);
    // Clean up after use
    try {
      await fs.unlink(promptPath);
      await fs.unlink(responsePath);
    } catch {
      // Ignore cleanup errors
    }
    return typeof existingResponse === 'string' ? existingResponse : JSON.stringify(existingResponse);
  }
  
  // No response yet - prompt user
  console.log('\n' + '═'.repeat(60));
  console.log('🤖 CURSOR AI FALLBACK MODE');
  console.log('═'.repeat(60));
  console.log('\nNo API key configured. Using Cursor\'s native AI instead.\n');
  console.log(`📄 Prompt saved to: ${path.relative(rootDir, promptPath)}`);
  console.log('\nTo complete this request:');
  console.log('  1. Open the prompt file in Cursor');
  console.log('  2. Copy the PROMPT section');
  console.log('  3. Paste into Cursor AI chat (Cmd+L / Ctrl+L)');
  console.log('  4. Save the JSON response to:');
  console.log(`     ${path.relative(rootDir, responsePath)}`);
  console.log('  5. Re-run this command\n');
  console.log('Or configure an API key in project-settings.json:');
  console.log('  "ai": { "apiKeys": { "openai": "sk-..." } }');
  console.log('═'.repeat(60) + '\n');
  
  throw new Error(`CURSOR_FALLBACK: Prompt saved to ${path.relative(rootDir, promptPath)}. Complete the prompt and re-run.`);
}

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
export function parseAIJson(response) {
  // Try direct parse first
  try {
    return JSON.parse(response);
  } catch {
    // Try extracting from code block
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    
    // Try finding JSON object/array
    const objectMatch = response.match(/\{[\s\S]*\}/);
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    
    throw new Error('Could not parse JSON from AI response');
  }
}

/**
 * Helper to read file content
 */
export async function readFile(filePath) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
  return fs.readFile(fullPath, 'utf-8');
}

/**
 * Helper to write file content
 */
export async function writeFile(filePath, content) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}

/**
 * Helper to read JSON file
 */
export async function readJson(filePath) {
  const content = await readFile(filePath);
  return JSON.parse(content);
}

/**
 * Helper to write JSON file
 */
export async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Sleep helper
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Recursively find files matching pattern
 */
export async function findFiles(dir, pattern) {
  const files = [];
  const fullDir = path.isAbsolute(dir) ? dir : path.join(rootDir, dir);
  
  try {
    const entries = await fs.readdir(fullDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(fullDir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await findFiles(fullPath, pattern);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        if (typeof pattern === 'string') {
          if (entry.name.endsWith(pattern)) {
            files.push(fullPath);
          }
        } else if (pattern instanceof RegExp) {
          if (pattern.test(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return files;
}

/**
 * Progress logger
 */
export class ProgressLogger {
  constructor(total, label = 'Processing') {
    this.total = total;
    this.current = 0;
    this.label = label;
    this.startTime = Date.now();
  }

  update(message = '') {
    this.current++;
    const percent = Math.round((this.current / this.total) * 100);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`   [${this.current}/${this.total}] ${percent}% (${elapsed}s) ${message}`);
  }

  complete() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`\n✅ ${this.label} complete (${elapsed}s)\n`);
  }
}

// ============================================
// Change Detection Utilities
// ============================================

// CACHE_DIR already defined at top of file

/**
 * Generate a hash for content
 */
export function generateHash(content) {
  // Simple hash function for change detection
  let hash = 0;
  const str = typeof content === 'string' ? content : JSON.stringify(content);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Initialize change detection cache
 */
export async function initCache() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Get cached entry
 */
export async function getCacheEntry(key) {
  try {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    const content = await fs.readFile(cachePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Set cache entry
 */
export async function setCacheEntry(key, data) {
  await initCache();
  const cachePath = path.join(CACHE_DIR, `${key}.json`);
  await fs.writeFile(cachePath, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...data
  }, null, 2), 'utf-8');
}

/**
 * Check if content has changed since last generation
 */
export async function hasContentChanged(key, content) {
  const cached = await getCacheEntry(key);
  if (!cached) return true;
  
  const currentHash = generateHash(content);
  return cached.contentHash !== currentHash;
}

/**
 * Mark content as generated
 */
export async function markGenerated(key, content, result) {
  await setCacheEntry(key, {
    contentHash: generateHash(content),
    resultHash: generateHash(result),
    generatedAt: new Date().toISOString()
  });
}

/**
 * Check if file has been modified since last check
 */
export async function hasFileChanged(filePath) {
  const key = `file-${generateHash(filePath)}`;
  
  try {
    const stats = await fs.stat(filePath);
    const cached = await getCacheEntry(key);
    
    if (!cached) return true;
    
    const lastMtime = new Date(cached.mtime);
    return stats.mtime > lastMtime;
  } catch {
    return true;
  }
}

/**
 * Mark file as processed
 */
export async function markFileProcessed(filePath) {
  const key = `file-${generateHash(filePath)}`;
  
  try {
    const stats = await fs.stat(filePath);
    await setCacheEntry(key, {
      path: filePath,
      mtime: stats.mtime.toISOString()
    });
  } catch {
    // File doesn't exist
  }
}

/**
 * Get list of changed files from a directory
 */
export async function getChangedFiles(dir, pattern) {
  const allFiles = await findFiles(dir, pattern);
  const changedFiles = [];
  
  for (const file of allFiles) {
    if (await hasFileChanged(file)) {
      changedFiles.push(file);
    }
  }
  
  return changedFiles;
}

/**
 * Clear generation cache
 */
export async function clearCache() {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
    await initCache();
  } catch {
    // Cache doesn't exist
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const stats = await fs.stat(path.join(CACHE_DIR, file));
      totalSize += stats.size;
    }
    
    return {
      entries: files.length,
      totalSize,
      cacheDir: CACHE_DIR
    };
  } catch {
    return {
      entries: 0,
      totalSize: 0,
      cacheDir: CACHE_DIR
    };
  }
}

export { rootDir, PROVIDERS };
