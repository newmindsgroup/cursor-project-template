#!/usr/bin/env node

/**
 * AI Image Generator
 * Scans content JSON files for image specs and generates images via AI
 * Supports Google AI (Imagen 3) and NanoBanana providers
 * 
 * Usage:
 *   node scripts/generate-images.mjs           # Generate new/changed images
 *   node scripts/generate-images.mjs --force   # Regenerate all images
 *   node scripts/generate-images.mjs --status  # Show generation status
 *   node scripts/generate-images.mjs --dry-run # Preview without generating
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImageCache, generateCacheKey, fileExists } from './lib/image-cache.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load configuration
const configPath = path.join(rootDir, 'src/data/image-generation.config.json');
let config;

try {
  const configContent = await fs.readFile(configPath, 'utf-8');
  config = JSON.parse(configContent);
} catch (e) {
  console.error('❌ Could not load image generation config:', e.message);
  process.exit(1);
}

// Paths
const contentDir = path.join(rootDir, 'src/content');
const outputDir = path.join(rootDir, config.output.directory);
const cacheDir = path.join(rootDir, config.cache.directory);
const fallbackDir = path.join(rootDir, config.fallbacks.directory);

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force') || args.includes('-f'),
    status: args.includes('--status') || args.includes('-s'),
    dryRun: args.includes('--dry-run') || args.includes('-n'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
    provider: args.find(a => a.startsWith('--provider='))?.split('=')[1] || config.provider
  };
}

// Show help
function showHelp() {
  console.log(`
AI Image Generator - Generate images from content specs

Usage:
  node scripts/generate-images.mjs [options]

Options:
  --force, -f           Force regenerate all images (ignore cache)
  --status, -s          Show current generation status without generating
  --dry-run, -n         Preview what would be generated without calling API
  --verbose, -v         Show detailed output
  --provider=<name>     Use specific provider (google-ai, nanobanana)
  --help, -h            Show this help message

Environment Variables:
  GOOGLE_AI_KEY         Google AI API key (for Imagen 3)
  NANOBANANA_API_KEY    NanoBanana API key
  NANOBANANA_PROJECT_ID Project ID for usage tracking (optional)

Examples:
  npm run assets:generate              # Generate new/changed images
  npm run assets:generate:force        # Regenerate everything
  npm run assets:generate:status       # Check status
`);
}

/**
 * Get API key for the configured provider
 */
function getApiKey(providerName) {
  const provider = config.providers[providerName];
  if (!provider) return null;
  
  // Check multiple possible env vars
  const envVars = [
    provider.envKey,
    'GOOGLE_AI_KEY',
    'NANOBANANA_API_KEY',
    'OPENAI_API_KEY'
  ];
  
  for (const envVar of envVars) {
    const key = process.env[envVar];
    if (key && key.length > 0) {
      return { key, envVar };
    }
  }
  
  return null;
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Recursively find all JSON content files
 */
async function findContentFiles(dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && entry.name !== 'schema') {
        const subFiles = await findContentFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

/**
 * Extract image specs from content object recursively
 */
function extractImageSpecs(obj, source, parentKey = '') {
  const specs = [];
  
  if (!obj || typeof obj !== 'object') return specs;
  
  // Check if this object is an image spec
  if (obj.id && (obj.prompt || obj.override || obj.fallback)) {
    specs.push({
      ...obj,
      source,
      path: parentKey
    });
    return specs;
  }
  
  // Check for 'image' or 'avatar' properties
  if (obj.image && typeof obj.image === 'object') {
    const imageSpecs = extractImageSpecs(obj.image, source, `${parentKey}.image`);
    specs.push(...imageSpecs);
  }
  
  if (obj.avatar && typeof obj.avatar === 'object') {
    const avatarSpecs = extractImageSpecs(obj.avatar, source, `${parentKey}.avatar`);
    specs.push(...avatarSpecs);
  }
  
  // Recurse into arrays
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const itemSpecs = extractImageSpecs(item, source, `${parentKey}[${index}]`);
      specs.push(...itemSpecs);
    });
    return specs;
  }
  
  // Recurse into object properties
  for (const [key, value] of Object.entries(obj)) {
    if (key !== 'image' && key !== 'avatar' && typeof value === 'object') {
      const nestedSpecs = extractImageSpecs(value, source, parentKey ? `${parentKey}.${key}` : key);
      specs.push(...nestedSpecs);
    }
  }
  
  return specs;
}

/**
 * Get dimensions for a style preset
 */
function getDimensions(spec) {
  const style = spec.style || 'feature';
  const styleConfig = config.styles[style] || config.styles.feature;
  
  // Override with resolution if specified
  const resolution = spec.resolution || styleConfig.resolution || config.defaults.resolution;
  
  let dimensions = { ...styleConfig.dimensions };
  
  // Scale based on resolution
  const scaleFactors = {
    '512': 0.5,
    '1k': 1,
    '2k': 2,
    '4k': 4
  };
  
  const scale = scaleFactors[resolution] || 1;
  dimensions.width = Math.round(dimensions.width * scale);
  dimensions.height = Math.round(dimensions.height * scale);
  
  return dimensions;
}

/**
 * Enhance prompt with quality modifiers
 */
function enhancePrompt(spec) {
  if (!config.promptEnhancement?.enabled) {
    return spec.prompt;
  }
  
  const style = spec.style || 'feature';
  const styleModifier = config.promptEnhancement.styleModifiers?.[style] || '';
  const prefix = config.promptEnhancement.prefix || '';
  const suffix = config.promptEnhancement.suffix || '';
  
  return `${prefix}${styleModifier}${spec.prompt}${suffix}`;
}

/**
 * Call Google AI Imagen API to generate an image
 */
async function generateWithGoogleAI(spec, apiKey, verbose) {
  const dimensions = getDimensions(spec);
  const enhancedPrompt = enhancePrompt(spec);
  
  // Google AI Imagen 3 API format
  const requestBody = {
    instances: [
      {
        prompt: enhancedPrompt
      }
    ],
    parameters: {
      sampleCount: config.defaults.numberOfImages || 1,
      aspectRatio: spec.aspectRatio || getAspectRatioString(dimensions),
      safetyFilterLevel: config.defaults.safetyFilterLevel || "block_only_high",
      personGeneration: "allow_adult"
    }
  };
  
  if (verbose) {
    console.log(`      Enhanced prompt: "${enhancedPrompt.substring(0, 80)}..."`);
  }
  
  const provider = config.providers['google-ai'];
  const url = `${provider.endpoint}?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    
    // Extract base64 image from response
    if (result.predictions && result.predictions.length > 0) {
      const imageData = result.predictions[0].bytesBase64Encoded;
      if (imageData) {
        return {
          success: true,
          data: Buffer.from(imageData, 'base64'),
          format: 'png',
          dimensions,
          cost: provider.costPerImage || 0.02
        };
      }
    }
    
    throw new Error('No image data in response');
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Call NanoBanana API to generate an image
 */
async function generateWithNanoBanana(spec, apiKey, projectId, verbose) {
  const dimensions = getDimensions(spec);
  const format = spec.format || config.defaults.format;
  const enhancedPrompt = enhancePrompt(spec);
  
  const requestBody = {
    prompt: enhancedPrompt,
    width: dimensions.width,
    height: dimensions.height,
    format: format,
    quality: config.defaults.quality
  };
  
  if (projectId) {
    requestBody.projectId = projectId;
  }
  
  if (verbose) {
    console.log(`      Enhanced prompt: "${enhancedPrompt.substring(0, 80)}..."`);
  }
  
  const provider = config.providers['nanobanana'];
  
  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Project-ID': projectId || ''
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    
    return {
      success: true,
      data: Buffer.from(imageBuffer),
      format,
      dimensions,
      cost: provider.costPerImage || 0.02
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get aspect ratio string from dimensions
 */
function getAspectRatioString(dimensions) {
  const ratio = dimensions.width / dimensions.height;
  
  if (Math.abs(ratio - 1) < 0.1) return '1:1';
  if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
  if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
  if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
  if (Math.abs(ratio - 3/4) < 0.1) return '3:4';
  if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
  if (Math.abs(ratio - 2/3) < 0.1) return '2:3';
  
  return '1:1'; // Default
}

/**
 * Generate image with retry logic
 */
async function generateImageWithRetry(spec, apiKey, providerName, projectId, verbose) {
  const maxAttempts = config.retry?.maxAttempts || 3;
  let delay = config.retry?.delayMs || 1000;
  const backoff = config.retry?.backoffMultiplier || 2;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let result;
    
    if (providerName === 'google-ai') {
      result = await generateWithGoogleAI(spec, apiKey, verbose);
    } else {
      result = await generateWithNanoBanana(spec, apiKey, projectId, verbose);
    }
    
    if (result.success) {
      return result;
    }
    
    // Check if error is retryable
    const retryableErrors = ['rate limit', 'timeout', '429', '500', '502', '503', '504'];
    const isRetryable = retryableErrors.some(e => 
      result.error.toLowerCase().includes(e.toLowerCase())
    );
    
    if (!isRetryable || attempt === maxAttempts) {
      return result;
    }
    
    if (verbose) {
      console.log(`      ⏳ Retry ${attempt}/${maxAttempts} in ${delay}ms...`);
    }
    
    await sleep(delay);
    delay *= backoff;
  }
}

/**
 * Copy fallback image if available
 */
async function copyFallback(spec, outputPath) {
  const fallbackPath = spec.fallback 
    ? path.join(rootDir, 'src/assets', spec.fallback)
    : null;
  
  if (fallbackPath && await fileExists(fallbackPath)) {
    await fs.copyFile(fallbackPath, outputPath);
    return true;
  }
  
  // Try generic fallback based on style
  const style = spec.style || 'feature';
  const genericFallback = path.join(fallbackDir, style, `${style}-image.svg`);
  
  if (await fileExists(genericFallback)) {
    await fs.copyFile(genericFallback, outputPath);
    return true;
  }
  
  return false;
}

/**
 * Main generation function
 */
async function main() {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  
  const providerName = args.provider;
  const provider = config.providers[providerName];
  
  console.log('\n🖼️  AI Image Generator\n');
  console.log(`   Provider: ${provider?.name || providerName}`);
  
  // Check if generation is enabled
  if (!config.enabled) {
    console.log('\n⚠️  Image generation is disabled in config');
    process.exit(0);
  }
  
  // Initialize cache
  const cache = new ImageCache(cacheDir);
  await cache.init();
  
  // Find all content files
  const contentFiles = await findContentFiles(contentDir);
  console.log(`   Content files: ${contentFiles.length}\n`);
  
  // Extract all image specs
  const allSpecs = [];
  
  for (const file of contentFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      const relativePath = path.relative(contentDir, file);
      const specs = extractImageSpecs(data, relativePath);
      allSpecs.push(...specs);
    } catch (e) {
      if (args.verbose) {
        console.log(`   ⚠️ Could not parse ${path.basename(file)}: ${e.message}`);
      }
    }
  }
  
  console.log(`🔍 Found ${allSpecs.length} image specifications\n`);
  
  if (allSpecs.length === 0) {
    console.log('ℹ️  No image specs found in content files.');
    console.log('   Add "image" or "avatar" objects with "id" and "prompt" to your content JSON.\n');
    process.exit(0);
  }
  
  // Status mode - just show what would be generated
  if (args.status) {
    console.log('📊 Image Generation Status:\n');
    
    const cacheStats = cache.getStats();
    console.log(`   Cache entries: ${cacheStats.entries}`);
    console.log(`   Last updated: ${cacheStats.lastUpdated || 'Never'}\n`);
    
    for (const spec of allSpecs) {
      const cacheKey = generateCacheKey(spec);
      const cached = await cache.get(spec.id, cacheKey);
      const status = cached ? '✅ Cached' : '⏳ Pending';
      console.log(`   ${status} ${spec.id} (${spec.style || 'feature'})`);
    }
    
    process.exit(0);
  }
  
  // Check for API key
  const apiKeyInfo = getApiKey(providerName);
  const projectId = process.env.NANOBANANA_PROJECT_ID;
  
  if (!apiKeyInfo && !args.dryRun) {
    console.log('⚠️  No API key found. Checked:');
    console.log(`   - ${provider?.envKey || 'GOOGLE_AI_KEY'}`);
    console.log('   - GOOGLE_AI_KEY');
    console.log('   - NANOBANANA_API_KEY');
    console.log('\n   Running in dry-run mode.\n');
    args.dryRun = true;
  } else if (apiKeyInfo && !args.dryRun) {
    console.log(`   Using: ${apiKeyInfo.envVar}\n`);
  }
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Process each spec
  const results = {
    generated: [],
    cached: [],
    failed: [],
    skipped: []
  };
  
  let totalCost = 0;
  const rateLimitDelay = config.rateLimit?.delayBetweenRequestsMs || 500;
  
  for (let i = 0; i < allSpecs.length; i++) {
    const spec = allSpecs[i];
    const cacheKey = generateCacheKey(spec);
    const format = providerName === 'google-ai' ? 'png' : (spec.format || config.defaults.format);
    const outputPath = path.join(outputDir, `${spec.id}.${format}`);
    
    // Check for override
    if (spec.override) {
      const overridePath = path.join(rootDir, 'src/assets', spec.override);
      if (await fileExists(overridePath)) {
        console.log(`   ⏭️  ${spec.id} - Using override`);
        await fs.copyFile(overridePath, outputPath);
        results.skipped.push({ id: spec.id, reason: 'override' });
        continue;
      }
    }
    
    // Check cache (unless force)
    if (!args.force) {
      const cached = await cache.get(spec.id, cacheKey);
      if (cached && await fileExists(outputPath)) {
        if (args.verbose) {
          console.log(`   ✅ ${spec.id} - Cached`);
        }
        results.cached.push({ id: spec.id });
        continue;
      }
    }
    
    // Generate or use fallback
    if (spec.generate === false) {
      const copied = await copyFallback(spec, outputPath);
      if (copied) {
        console.log(`   📋 ${spec.id} - Using fallback`);
        results.skipped.push({ id: spec.id, reason: 'fallback' });
      } else {
        console.log(`   ⚠️  ${spec.id} - No fallback available`);
        results.failed.push({ id: spec.id, error: 'No fallback' });
      }
      continue;
    }
    
    // Dry run mode
    if (args.dryRun) {
      const dimensions = getDimensions(spec);
      console.log(`   🔄 ${spec.id} - Would generate (${dimensions.width}x${dimensions.height})`);
      if (args.verbose) {
        console.log(`      Prompt: "${spec.prompt.substring(0, 60)}..."`);
        console.log(`      Enhanced: "${enhancePrompt(spec).substring(0, 60)}..."`);
      }
      results.generated.push({ id: spec.id, dryRun: true });
      totalCost += provider?.costPerImage || 0.02;
      continue;
    }
    
    // Generate image
    console.log(`   🔄 ${spec.id} - Generating...`);
    
    const result = await generateImageWithRetry(
      spec, 
      apiKeyInfo.key, 
      providerName, 
      projectId, 
      args.verbose
    );
    
    if (result.success) {
      // Save image
      await fs.writeFile(outputPath, result.data);
      
      // Update cache
      await cache.set(spec.id, {
        cacheKey,
        outputPath,
        format: result.format,
        dimensions: result.dimensions,
        cost: result.cost,
        source: spec.source,
        promptHash: cacheKey
      });
      
      console.log(`   ✅ ${spec.id} - Generated (${result.dimensions.width}x${result.dimensions.height})`);
      
      results.generated.push({
        id: spec.id,
        file: `${spec.id}.${result.format}`,
        dimensions: result.dimensions,
        cost: result.cost
      });
      
      totalCost += result.cost;
      
      // Rate limiting - wait between requests
      if (i < allSpecs.length - 1) {
        await sleep(rateLimitDelay);
      }
    } else {
      console.log(`   ❌ ${spec.id} - Failed: ${result.error}`);
      
      // Try fallback
      if (config.fallbacks.useOnError) {
        const copied = await copyFallback(spec, outputPath);
        if (copied) {
          console.log(`      📋 Using fallback`);
        }
      }
      
      results.failed.push({ id: spec.id, error: result.error });
    }
  }
  
  // Generate manifest
  const manifest = {
    generated: new Date().toISOString(),
    projectId: projectId || null,
    provider: providerName,
    providerName: provider?.name || providerName,
    totalCost,
    summary: {
      total: allSpecs.length,
      generated: results.generated.length,
      cached: results.cached.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    },
    images: allSpecs.map(spec => {
      const format = providerName === 'google-ai' ? 'png' : (spec.format || config.defaults.format);
      const dimensions = getDimensions(spec);
      const genResult = results.generated.find(r => r.id === spec.id);
      
      return {
        id: spec.id,
        file: `${spec.id}.${format}`,
        prompt: spec.prompt,
        enhancedPrompt: enhancePrompt(spec),
        promptHash: generateCacheKey(spec),
        style: spec.style || 'feature',
        resolution: `${dimensions.width}x${dimensions.height}`,
        format,
        cost: genResult?.cost || 0,
        usedIn: [spec.source],
        status: results.cached.find(r => r.id === spec.id) ? 'cached' :
                results.generated.find(r => r.id === spec.id) ? 'generated' :
                results.failed.find(r => r.id === spec.id) ? 'failed' : 'skipped'
      };
    })
  };
  
  const manifestPath = path.join(outputDir, config.output.manifestFile);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  
  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Generated: ${results.generated.length}`);
  console.log(`   Cached:    ${results.cached.length}`);
  console.log(`   Skipped:   ${results.skipped.length}`);
  console.log(`   Failed:    ${results.failed.length}`);
  
  if (totalCost > 0) {
    console.log(`\n   Estimated cost: $${totalCost.toFixed(2)}`);
  }
  
  console.log(`\n📁 Output: ${config.output.directory}/`);
  console.log(`📄 Manifest: ${config.output.directory}/${config.output.manifestFile}\n`);
  
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
