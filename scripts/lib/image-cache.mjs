/**
 * Image Cache Manager
 * Handles caching of generated images to avoid unnecessary API calls
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Generate a cache key from image spec
 * @param {Object} imageSpec - The image specification
 * @returns {string} - SHA256 hash of the spec
 */
export function generateCacheKey(imageSpec) {
  const keyData = {
    prompt: imageSpec.prompt,
    style: imageSpec.style || 'feature',
    format: imageSpec.format || 'webp',
    resolution: imageSpec.resolution || '1k',
    aspectRatio: imageSpec.aspectRatio,
  };
  
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex');
  
  return hash.substring(0, 16); // Use first 16 chars for readability
}

/**
 * Image Cache class for managing cached images
 */
export class ImageCache {
  constructor(cacheDir) {
    this.cacheDir = cacheDir;
    this.indexFile = path.join(cacheDir, 'cache-index.json');
    this.index = null;
  }

  /**
   * Initialize the cache directory and load index
   */
  async init() {
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    try {
      const indexContent = await fs.readFile(this.indexFile, 'utf-8');
      this.index = JSON.parse(indexContent);
    } catch (e) {
      // Index doesn't exist, create empty one
      this.index = {
        version: '1.0.0',
        created: new Date().toISOString(),
        entries: {}
      };
    }
  }

  /**
   * Check if an image is cached and still valid
   * @param {string} imageId - The image ID
   * @param {string} cacheKey - The cache key (prompt hash)
   * @returns {Object|null} - Cache entry if valid, null otherwise
   */
  async get(imageId, cacheKey) {
    if (!this.index) await this.init();
    
    const entry = this.index.entries[imageId];
    
    if (!entry) return null;
    
    // Check if cache key matches (prompt hasn't changed)
    if (entry.cacheKey !== cacheKey) {
      return null;
    }
    
    // Check if cached file still exists
    try {
      await fs.access(entry.outputPath);
      return entry;
    } catch (e) {
      // File was deleted, invalidate cache
      delete this.index.entries[imageId];
      return null;
    }
  }

  /**
   * Store a cache entry
   * @param {string} imageId - The image ID
   * @param {Object} entry - Cache entry data
   */
  async set(imageId, entry) {
    if (!this.index) await this.init();
    
    this.index.entries[imageId] = {
      ...entry,
      cachedAt: new Date().toISOString()
    };
    
    await this.save();
  }

  /**
   * Remove a cache entry
   * @param {string} imageId - The image ID
   */
  async remove(imageId) {
    if (!this.index) await this.init();
    
    if (this.index.entries[imageId]) {
      delete this.index.entries[imageId];
      await this.save();
    }
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    if (!this.index) await this.init();
    
    this.index.entries = {};
    this.index.cleared = new Date().toISOString();
    await this.save();
  }

  /**
   * Save the cache index to disk
   */
  async save() {
    this.index.lastUpdated = new Date().toISOString();
    await fs.writeFile(
      this.indexFile,
      JSON.stringify(this.index, null, 2),
      'utf-8'
    );
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    if (!this.index) return { entries: 0, size: 0 };
    
    const entries = Object.keys(this.index.entries).length;
    
    return {
      entries,
      created: this.index.created,
      lastUpdated: this.index.lastUpdated
    };
  }

  /**
   * Get all cached entries
   * @returns {Object} - All cache entries
   */
  getAll() {
    return this.index?.entries || {};
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats if exists
 * @param {string} filePath - Path to check
 * @returns {Object|null} - File stats or null
 */
export async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      modified: stats.mtime.toISOString()
    };
  } catch {
    return null;
  }
}
