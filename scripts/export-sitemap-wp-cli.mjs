#!/usr/bin/env node

/**
 * Export Sitemap to WP-CLI Commands
 * Generates a shell script with WordPress CLI commands to create pages and menus
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load sitemap and navigation data
function loadData() {
  const sitemapPath = join(rootDir, 'src/data/sitemap.json');
  const navPath = join(rootDir, 'src/data/navigation.json');

  if (!existsSync(sitemapPath)) {
    console.error('Error: sitemap.json not found');
    process.exit(1);
  }

  const sitemap = JSON.parse(readFileSync(sitemapPath, 'utf-8'));
  const navigation = existsSync(navPath) ? JSON.parse(readFileSync(navPath, 'utf-8')) : null;

  return { sitemap, navigation };
}

// Generate variable name from page ID
function varName(id) {
  return id.replace(/-/g, '_').toUpperCase() + '_ID';
}

// Generate slug without leading slash
function cleanSlug(slug) {
  return slug.replace(/^\//, '') || 'home';
}

// Process pages recursively
function processPages(pages, lines, parentVar = '', depth = 0) {
  pages.forEach((page) => {
    const title = page.title.en || page.id;
    const slug = cleanSlug(page.slug);
    const vName = varName(page.id);
    const indent = '  '.repeat(depth);
    
    // Build the wp post create command
    let cmd = `wp post create --post_type=page --post_title="${title}" --post_name="${slug}" --post_status=draft`;
    
    if (parentVar) {
      cmd += ` --post_parent=$${parentVar}`;
    }
    
    cmd += ' --porcelain';
    
    lines.push(`${indent}# Create: ${title} (${page.slug})`);
    lines.push(`${indent}${vName}=$(${cmd})`);
    lines.push(`${indent}echo "Created page: ${title} (ID: $${vName})"`);
    lines.push('');
    
    // Process children
    if (page.children && page.children.length > 0) {
      processPages(page.children, lines, vName, depth);
    }
  });
}

// Generate menu items
function processMenuItems(items, lines, sitemap, menuSlug) {
  const flatPages = flattenPages(sitemap.pages);
  
  items.forEach((item, index) => {
    const page = flatPages.find(p => p.id === item.pageId);
    if (!page) return;
    
    const vName = varName(item.pageId);
    const label = item.label?.en || page.title.en || page.id;
    
    lines.push(`wp menu item add-post "${menuSlug}" $${vName} --title="${label}" --position=${index + 1}`);
    
    // Handle dropdown children
    if (item.dropdown && item.children) {
      item.children.forEach((child, childIndex) => {
        const childPage = flatPages.find(p => p.id === child.pageId);
        if (!childPage) return;
        
        const childVName = varName(child.pageId);
        const childLabel = child.label?.en || childPage.title.en || childPage.id;
        
        lines.push(`wp menu item add-post "${menuSlug}" $${childVName} --title="${childLabel}" --parent=${vName} --position=${childIndex + 1}`);
      });
    }
  });
}

// Flatten pages for lookup
function flattenPages(pages) {
  const result = [];
  const flatten = (items) => {
    items.forEach(item => {
      result.push(item);
      if (item.children?.length > 0) {
        flatten(item.children);
      }
    });
  };
  flatten(pages);
  return result;
}

// Main export function
function generateWpCliScript() {
  const { sitemap, navigation } = loadData();
  const timestamp = new Date().toISOString();
  
  const lines = [
    '#!/bin/bash',
    '',
    '# ============================================',
    '# WordPress CLI Commands - Sitemap Export',
    '# ============================================',
    `# Generated: ${timestamp}`,
    `# Total Pages: ${flattenPages(sitemap.pages).length}`,
    `# Languages: ${sitemap.languages.join(', ')}`,
    '',
    '# USAGE:',
    '# 1. Make this file executable: chmod +x wp-cli-commands.sh',
    '# 2. Run from your WordPress root: ./wp-cli-commands.sh',
    '# 3. Or run individual commands manually',
    '',
    '# NOTE: This script creates pages as drafts. Review and publish as needed.',
    '',
    'set -e  # Exit on error',
    '',
    '# ============================================',
    '# CREATE PAGES',
    '# ============================================',
    ''
  ];
  
  // Process all pages
  processPages(sitemap.pages, lines);
  
  // Add menu creation if navigation data exists
  if (navigation?.primary) {
    lines.push('# ============================================');
    lines.push('# CREATE NAVIGATION MENUS');
    lines.push('# ============================================');
    lines.push('');
    
    // Primary navigation
    const primaryMenuName = navigation.primary.name?.en || 'Primary Navigation';
    const primaryMenuSlug = primaryMenuName.toLowerCase().replace(/\s+/g, '-');
    
    lines.push(`# Create Primary Navigation Menu`);
    lines.push(`wp menu create "${primaryMenuName}" || echo "Menu may already exist"`);
    lines.push('');
    
    if (navigation.primary.items) {
      processMenuItems(navigation.primary.items, lines, sitemap, primaryMenuName);
    }
    
    lines.push('');
    lines.push('# Assign menu to theme location (adjust location name as needed)');
    lines.push(`wp menu location assign "${primaryMenuName}" primary || echo "Location 'primary' may not exist in theme"`);
    lines.push('');
  }
  
  // Footer navigation sections
  if (navigation?.secondary?.sections) {
    lines.push('# ============================================');
    lines.push('# FOOTER NAVIGATION SECTIONS');
    lines.push('# ============================================');
    lines.push('');
    lines.push('# Note: Footer sections may require custom implementation');
    lines.push('# depending on your theme. Below are the planned sections:');
    lines.push('');
    
    navigation.secondary.sections.forEach(section => {
      const title = section.title?.en || section.id;
      lines.push(`# ${title}:`);
      section.pageIds.forEach(pageId => {
        const page = flattenPages(sitemap.pages).find(p => p.id === pageId);
        if (page) {
          lines.push(`#   - ${page.title.en || pageId} (${page.slug})`);
        }
      });
      lines.push('');
    });
  }
  
  // Multilingual setup hints
  if (sitemap.languages.length > 1) {
    lines.push('# ============================================');
    lines.push('# MULTILINGUAL SETUP NOTES');
    lines.push('# ============================================');
    lines.push('');
    lines.push('# This site has multiple languages configured:');
    sitemap.languages.forEach(lang => {
      lines.push(`#   - ${lang.toUpperCase()}`);
    });
    lines.push('');
    lines.push('# For WPML:');
    lines.push('#   1. Install and configure WPML');
    lines.push('#   2. Set default language');
    lines.push('#   3. Translate each page using WPML interface');
    lines.push('');
    lines.push('# For Polylang:');
    lines.push('#   1. Install and configure Polylang');
    lines.push('#   2. Create translations for each page');
    lines.push('#   3. Link translations together');
    lines.push('');
  }
  
  lines.push('# ============================================');
  lines.push('# SETUP COMPLETE');
  lines.push('# ============================================');
  lines.push('');
  lines.push('echo ""');
  lines.push('echo "========================================"');
  lines.push('echo "Setup complete!"');
  lines.push(`echo "Created ${flattenPages(sitemap.pages).length} pages as drafts"`);
  lines.push('echo "Review pages in WordPress admin and publish when ready"');
  lines.push('echo "========================================"');
  
  return lines.join('\n');
}

// Output
const outputPath = join(rootDir, '_handoff/exports/wp-cli-commands.sh');

// Ensure exports directory exists
import { mkdirSync } from 'fs';
mkdirSync(join(rootDir, '_handoff/exports'), { recursive: true });

const script = generateWpCliScript();
writeFileSync(outputPath, script);
console.log(`✓ WP-CLI commands exported to: ${outputPath}`);
console.log(`  Make executable with: chmod +x ${outputPath}`);
