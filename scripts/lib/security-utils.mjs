/**
 * Security Utilities
 * Common security functions for script safety
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Validate and sanitize a file path to prevent path traversal attacks
 * @param {string} inputPath - The path to validate
 * @param {string} allowedBase - The base directory paths must be within
 * @returns {{ valid: boolean, sanitized: string | null, error: string | null }}
 */
export function validatePath(inputPath, allowedBase = rootDir) {
  if (!inputPath || typeof inputPath !== 'string') {
    return { valid: false, sanitized: null, error: 'Invalid path input' };
  }

  // Remove null bytes and other dangerous characters
  const cleanPath = inputPath
    .replace(/\0/g, '')
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '');

  // Resolve to absolute path
  const absolutePath = path.isAbsolute(cleanPath)
    ? path.normalize(cleanPath)
    : path.resolve(allowedBase, cleanPath);

  // Ensure the resolved path is within the allowed base
  const normalizedBase = path.normalize(allowedBase);
  const normalizedPath = path.normalize(absolutePath);

  if (!normalizedPath.startsWith(normalizedBase)) {
    return {
      valid: false,
      sanitized: null,
      error: `Path traversal detected: ${inputPath} resolves outside allowed directory`
    };
  }

  return { valid: true, sanitized: normalizedPath, error: null };
}

/**
 * Sanitize a filename to remove dangerous characters
 * @param {string} filename - The filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  return filename
    // Remove path separators
    .replace(/[\/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Replace dangerous characters with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Remove leading dots (hidden files)
    .replace(/^\.+/, '')
    // Limit length
    .substring(0, 255);
}

/**
 * Escape shell argument to prevent command injection
 * @param {string} arg - The argument to escape
 * @returns {string} Escaped argument
 */
export function escapeShellArg(arg) {
  if (!arg || typeof arg !== 'string') {
    return "''";
  }

  // On Unix, wrap in single quotes and escape any single quotes within
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Validate that an input is a safe command-line argument
 * @param {string} arg - The argument to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowPaths - Allow file paths
 * @param {string[]} options.allowedValues - List of allowed values
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateCliArg(arg, options = {}) {
  const { allowPaths = false, allowedValues = null } = options;

  if (!arg || typeof arg !== 'string') {
    return { valid: false, error: 'Invalid argument' };
  }

  // Check against allowed values if provided
  if (allowedValues && !allowedValues.includes(arg)) {
    return { valid: false, error: `Value not in allowed list: ${arg}` };
  }

  // Check for shell injection characters (unless paths are allowed)
  if (!allowPaths) {
    const dangerousChars = /[;&|`$(){}[\]<>!#*?~]/;
    if (dangerousChars.test(arg)) {
      return { valid: false, error: `Dangerous characters in argument: ${arg}` };
    }
  }

  // Check for null bytes
  if (arg.includes('\0')) {
    return { valid: false, error: 'Null bytes not allowed' };
  }

  return { valid: true, error: null };
}

/**
 * Simple rate limiter for API calls
 */
export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if a request should be allowed
   * @returns {boolean} True if request is allowed
   */
  tryRequest() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  /**
   * Get time until next request is allowed
   * @returns {number} Milliseconds until next request allowed (0 if allowed now)
   */
  getWaitTime() {
    if (this.requests.length < this.maxRequests) {
      return 0;
    }
    
    const now = Date.now();
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.windowMs - (now - oldestRequest);
    
    return Math.max(0, waitTime);
  }
}

/**
 * Validate file MIME type against allowed types
 * @param {string} mimeType - The MIME type to check
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if type is allowed
 */
export function validateMimeType(mimeType, allowedTypes) {
  if (!mimeType || !allowedTypes || !Array.isArray(allowedTypes)) {
    return false;
  }

  return allowedTypes.some(allowed => {
    if (allowed.endsWith('/*')) {
      // Wildcard match (e.g., 'image/*')
      const prefix = allowed.slice(0, -1);
      return mimeType.startsWith(prefix);
    }
    return mimeType === allowed;
  });
}

/**
 * Generate a secure random token
 * @param {number} length - Length of token (default 32)
 * @returns {string} Hex token
 */
export async function generateToken(length = 32) {
  const { randomBytes } = await import('crypto');
  return randomBytes(length).toString('hex');
}

/**
 * Validate JSON payload against expected schema (basic)
 * @param {Object} payload - The payload to validate
 * @param {Object} schema - Schema with expected fields and types
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePayload(payload, schema) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload must be an object'] };
  }

  for (const [field, rules] of Object.entries(schema)) {
    const value = payload[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    // Skip optional fields that aren't present
    if (value === undefined || value === null) {
      continue;
    }

    // Check type
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push(`Field ${field} must be type ${rules.type}, got ${actualType}`);
      }
    }

    // Check max length for strings and arrays
    if (rules.maxLength && (typeof value === 'string' || Array.isArray(value))) {
      if (value.length > rules.maxLength) {
        errors.push(`Field ${field} exceeds max length ${rules.maxLength}`);
      }
    }

    // Check pattern for strings
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        errors.push(`Field ${field} does not match required pattern`);
      }
    }

    // Check enum values
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`Field ${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export default {
  validatePath,
  sanitizeFilename,
  escapeShellArg,
  validateCliArg,
  validateMimeType,
  validatePayload,
  generateToken,
  RateLimiter
};
