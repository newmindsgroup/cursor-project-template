/**
 * Content Writer Utilities
 * Shared utilities for writing AI-generated content to JSON files
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Create a backup of a file before modifying
 */
export async function createBackup(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const backupDir = path.join(rootDir, '.content-backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);
    
    await fs.writeFile(backupPath, content, 'utf-8');
    return backupPath;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null; // File doesn't exist yet, no backup needed
    }
    throw e;
  }
}

/**
 * Deep merge two objects
 */
export function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Generate a diff between two objects for preview
 */
export function generateDiff(original, updated, path = '') {
  const changes = [];
  
  const allKeys = new Set([...Object.keys(original || {}), ...Object.keys(updated || {})]);
  
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    const origValue = original?.[key];
    const newValue = updated?.[key];
    
    if (origValue === undefined && newValue !== undefined) {
      changes.push({
        type: 'added',
        path: currentPath,
        value: typeof newValue === 'object' ? '[object]' : newValue
      });
    } else if (origValue !== undefined && newValue === undefined) {
      changes.push({
        type: 'removed',
        path: currentPath,
        value: typeof origValue === 'object' ? '[object]' : origValue
      });
    } else if (typeof origValue === 'object' && typeof newValue === 'object') {
      if (Array.isArray(origValue) && Array.isArray(newValue)) {
        if (JSON.stringify(origValue) !== JSON.stringify(newValue)) {
          changes.push({
            type: 'modified',
            path: currentPath,
            from: `[${origValue.length} items]`,
            to: `[${newValue.length} items]`
          });
        }
      } else {
        const nestedChanges = generateDiff(origValue, newValue, currentPath);
        changes.push(...nestedChanges);
      }
    } else if (origValue !== newValue) {
      changes.push({
        type: 'modified',
        path: currentPath,
        from: origValue,
        to: newValue
      });
    }
  }
  
  return changes;
}

/**
 * Format diff for console output
 */
export function formatDiff(changes) {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    dim: '\x1b[2m'
  };
  
  const lines = [];
  
  for (const change of changes.slice(0, 20)) {
    switch (change.type) {
      case 'added':
        lines.push(`${colors.green}+ ${change.path}${colors.reset}: ${colors.dim}${truncate(change.value)}${colors.reset}`);
        break;
      case 'removed':
        lines.push(`${colors.red}- ${change.path}${colors.reset}: ${colors.dim}${truncate(change.value)}${colors.reset}`);
        break;
      case 'modified':
        lines.push(`${colors.yellow}~ ${change.path}${colors.reset}:`);
        lines.push(`  ${colors.red}- ${truncate(change.from)}${colors.reset}`);
        lines.push(`  ${colors.green}+ ${truncate(change.to)}${colors.reset}`);
        break;
    }
  }
  
  if (changes.length > 20) {
    lines.push(`${colors.dim}... and ${changes.length - 20} more changes${colors.reset}`);
  }
  
  return lines.join('\n');
}

function truncate(value, maxLength = 60) {
  const str = String(value);
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

/**
 * Write content to a JSON file with backup and diff preview
 */
export async function writeContent(filePath, content, options = {}) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
  
  // Load existing content if file exists
  let existingContent = null;
  try {
    const existing = await fs.readFile(fullPath, 'utf-8');
    existingContent = JSON.parse(existing);
  } catch {
    // File doesn't exist
  }
  
  // Create backup if file exists and backup option is true
  let backupPath = null;
  if (options.backup !== false && existingContent) {
    backupPath = await createBackup(fullPath);
  }
  
  // Merge or replace content
  let finalContent;
  if (options.merge && existingContent) {
    finalContent = deepMerge(existingContent, content);
  } else {
    finalContent = content;
  }
  
  // Generate diff for preview
  const changes = existingContent ? generateDiff(existingContent, finalContent) : [];
  
  // Write the file
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(finalContent, null, 2), 'utf-8');
  
  return {
    path: fullPath,
    backupPath,
    changes,
    isNew: !existingContent
  };
}

/**
 * Update a specific section in a content file
 */
export async function updateSection(filePath, sectionName, sectionContent, options = {}) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
  
  // Load existing content
  let existingContent = {};
  try {
    const existing = await fs.readFile(fullPath, 'utf-8');
    existingContent = JSON.parse(existing);
  } catch {
    // File doesn't exist, create new
  }
  
  // Create backup
  let backupPath = null;
  if (options.backup !== false && Object.keys(existingContent).length > 0) {
    backupPath = await createBackup(fullPath);
  }
  
  // Get original section for diff
  const originalSection = existingContent[sectionName];
  
  // Update section
  existingContent[sectionName] = sectionContent;
  
  // Update metadata
  if (existingContent.meta) {
    existingContent.meta.lastUpdated = new Date().toISOString();
  }
  
  // Generate diff for just the section
  const changes = generateDiff(
    { [sectionName]: originalSection },
    { [sectionName]: sectionContent }
  );
  
  // Write the file
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(existingContent, null, 2), 'utf-8');
  
  return {
    path: fullPath,
    backupPath,
    changes,
    section: sectionName
  };
}

/**
 * Apply generated content to target file
 */
export async function applyGeneratedContent(generatedContent, targetPath, options = {}) {
  const result = {
    applied: [],
    skipped: [],
    errors: []
  };
  
  // Determine what type of content we're applying
  if (generatedContent.section && generatedContent.headlines) {
    // Section content with headlines
    const section = generatedContent.section;
    
    // Build section content
    const sectionContent = {
      headline: generatedContent.headlines[generatedContent.metadata?.recommendedHeadline || 0]?.text,
      headlineVariants: generatedContent.headlines,
      subheadline: generatedContent.subheadline?.text
    };
    
    if (generatedContent.primaryCta) {
      sectionContent.primaryCta = generatedContent.primaryCta.text;
    }
    if (generatedContent.secondaryCta) {
      sectionContent.secondaryCta = generatedContent.secondaryCta.text;
    }
    if (generatedContent.items) {
      sectionContent.items = generatedContent.items;
    }
    
    try {
      const writeResult = await updateSection(targetPath, section, sectionContent, options);
      result.applied.push({
        section,
        path: targetPath,
        changes: writeResult.changes.length
      });
    } catch (e) {
      result.errors.push({
        section,
        path: targetPath,
        error: e.message
      });
    }
  } else if (generatedContent.personas) {
    // Personas content
    try {
      const writeResult = await writeContent(targetPath, generatedContent, { merge: true, ...options });
      result.applied.push({
        type: 'personas',
        path: targetPath,
        changes: writeResult.changes.length
      });
    } catch (e) {
      result.errors.push({
        type: 'personas',
        path: targetPath,
        error: e.message
      });
    }
  } else {
    // Generic content
    try {
      const writeResult = await writeContent(targetPath, generatedContent, options);
      result.applied.push({
        type: 'content',
        path: targetPath,
        changes: writeResult.changes.length
      });
    } catch (e) {
      result.errors.push({
        type: 'content',
        path: targetPath,
        error: e.message
      });
    }
  }
  
  return result;
}

export { rootDir };
