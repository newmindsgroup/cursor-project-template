#!/usr/bin/env node

/**
 * Export Sitemap to Implementation Guide
 * Generates a comprehensive Markdown document for manual WordPress setup
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load data files
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

// Flatten pages for statistics
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

// Get max depth
function getMaxDepth(pages, depth = 1) {
  let maxDepth = depth;
  pages.forEach(page => {
    if (page.children?.length > 0) {
      const childDepth = getMaxDepth(page.children, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  });
  return maxDepth;
}

// Generate page hierarchy list
function generatePageList(pages, depth = 0, language = 'en') {
  let output = '';
  const indent = '  '.repeat(depth);
  
  pages.forEach(page => {
    const title = page.title[language] || page.title.en || page.id;
    const navIndicators = [];
    if (page.inPrimaryNav) navIndicators.push('Primary Nav');
    if (page.inSecondaryNav) navIndicators.push('Secondary Nav');
    if (page.inFooterNav) navIndicators.push('Footer');
    
    output += `${indent}- **${title}**\n`;
    output += `${indent}  - URL: \`${page.slug}\`\n`;
    output += `${indent}  - Template: ${page.template}\n`;
    output += `${indent}  - Status: ${page.status}\n`;
    
    if (navIndicators.length > 0) {
      output += `${indent}  - Navigation: ${navIndicators.join(', ')}\n`;
    }
    
    if (page.description?.[language] || page.description?.en) {
      output += `${indent}  - Description: ${page.description[language] || page.description.en}\n`;
    }
    
    output += '\n';
    
    if (page.children?.length > 0) {
      output += generatePageList(page.children, depth + 1, language);
    }
  });
  
  return output;
}

// Generate visual sitemap tree
function generateVisualTree(pages, prefix = '', isLast = true, language = 'en') {
  let output = '';
  
  pages.forEach((page, index) => {
    const isLastItem = index === pages.length - 1;
    const title = page.title[language] || page.title.en || page.id;
    const connector = isLastItem ? '└── ' : '├── ';
    const childPrefix = prefix + (isLastItem ? '    ' : '│   ');
    
    let indicators = '';
    if (page.inPrimaryNav) indicators += ' [P]';
    if (page.inSecondaryNav) indicators += ' [S]';
    
    output += `${prefix}${connector}${title}${indicators}\n`;
    
    if (page.children?.length > 0) {
      output += generateVisualTree(page.children, childPrefix, isLastItem, language);
    }
  });
  
  return output;
}

// Generate status summary table
function generateStatusTable(pages) {
  const allPages = flattenPages(pages);
  const statusCounts = {
    planned: 0,
    'in-progress': 0,
    complete: 0,
    'on-hold': 0
  };
  
  allPages.forEach(page => {
    if (statusCounts.hasOwnProperty(page.status)) {
      statusCounts[page.status]++;
    }
  });
  
  return `| Status | Count |
|--------|-------|
| Planned | ${statusCounts.planned} |
| In Progress | ${statusCounts['in-progress']} |
| Complete | ${statusCounts.complete} |
| On Hold | ${statusCounts['on-hold']} |
| **Total** | **${allPages.length}** |`;
}

// Generate navigation section
function generateNavigationSection(navigation, sitemap, language = 'en') {
  if (!navigation) return '';
  
  let output = '';
  const allPages = flattenPages(sitemap.pages);
  
  // Primary Navigation
  if (navigation.primary) {
    const navName = navigation.primary.name?.[language] || navigation.primary.name?.en || 'Primary Navigation';
    output += `### ${navName}\n\n`;
    output += `Location: Header\n\n`;
    output += `| Order | Label | Page | Dropdown |\n`;
    output += `|-------|-------|------|----------|\n`;
    
    navigation.primary.items.forEach((item, index) => {
      const page = allPages.find(p => p.id === item.pageId);
      const label = item.label?.[language] || item.label?.en || page?.title?.[language] || item.pageId;
      const slug = page?.slug || '#';
      const hasDropdown = item.dropdown ? 'Yes' : 'No';
      
      output += `| ${index + 1} | ${label} | \`${slug}\` | ${hasDropdown} |\n`;
      
      // Sub-items
      if (item.children) {
        item.children.forEach((child, childIndex) => {
          const childPage = allPages.find(p => p.id === child.pageId);
          const childLabel = child.label?.[language] || child.label?.en || childPage?.title?.[language] || child.pageId;
          const childSlug = childPage?.slug || '#';
          
          output += `|  └ ${childIndex + 1} | ${childLabel} | \`${childSlug}\` | - |\n`;
        });
      }
    });
    
    if (navigation.primary.cta) {
      output += `\n**CTA Button:** "${navigation.primary.cta.label?.[language] || navigation.primary.cta.label?.en}" → \`${navigation.primary.cta.href}\`\n`;
    }
    
    output += '\n';
  }
  
  // Secondary/Footer Navigation
  if (navigation.secondary) {
    const navName = navigation.secondary.name?.[language] || navigation.secondary.name?.en || 'Footer Navigation';
    output += `### ${navName}\n\n`;
    output += `Location: Footer\n\n`;
    
    navigation.secondary.sections.forEach(section => {
      const sectionTitle = section.title?.[language] || section.title?.en || section.id;
      output += `#### ${sectionTitle}\n\n`;
      
      section.pageIds.forEach(pageId => {
        const page = allPages.find(p => p.id === pageId);
        const title = page?.title?.[language] || page?.title?.en || pageId;
        const slug = page?.slug || '#';
        output += `- ${title} → \`${slug}\`\n`;
      });
      
      output += '\n';
    });
    
    // Social links
    if (navigation.secondary.social?.length > 0) {
      output += `#### Social Links\n\n`;
      navigation.secondary.social.forEach(social => {
        output += `- ${social.platform}: ${social.url}\n`;
      });
      output += '\n';
    }
  }
  
  return output;
}

// Generate WordPress setup instructions
function generateWordPressInstructions(sitemap) {
  const isMultilingual = sitemap.languages?.length > 1;
  
  let output = `## WordPress Setup Instructions

### 1. Page Creation

Create pages in the following order to maintain proper parent-child relationships:

1. **Create all top-level pages first**
   - Go to Pages > Add New
   - Enter the page title and slug as specified
   - Save as Draft

2. **Create child pages**
   - Set the parent page using the "Page Attributes" panel
   - Use the Page Template if your theme supports it

3. **Set page templates**
   - If using a page builder (Elementor, etc.), apply templates after creation
   - Match templates to the specified blueprint

### 2. Navigation Menu Setup

1. **Create Primary Menu**
   - Go to Appearance > Menus
   - Create new menu named "Primary Navigation"
   - Add pages in the specified order
   - Assign to "Primary Menu" location

2. **Create Footer Menu** (if theme supports)
   - Create separate menu for each footer section
   - Or use widget areas with navigation menus

3. **Menu Structure**
   - Use drag-and-drop to create dropdown items
   - Indent items to create sub-menus

### 3. Homepage Setup

1. Go to Settings > Reading
2. Set "Your homepage displays" to "A static page"
3. Select the Home page
4. Save changes

`;
  
  if (isMultilingual) {
    output += `### 4. Multilingual Setup

This site requires multilingual support for: **${sitemap.languages.map(l => l.toUpperCase()).join(', ')}**

#### Option A: WPML (Recommended for complex sites)

1. Install and activate WPML plugins:
   - WPML Multilingual CMS
   - WPML String Translation
   - WPML Media Translation

2. Configure languages:
   - Go to WPML > Languages
   - Add all required languages
   - Set default language to: ${sitemap.defaultLanguage.toUpperCase()}

3. Translate content:
   - Use the "+" button next to each page to create translations
   - Or use Translation Management for bulk translation

#### Option B: Polylang (Free alternative)

1. Install and activate Polylang
2. Add languages in Languages > Languages
3. Create translated versions of each page
4. Link translations together

`;
  }
  
  output += `### ${isMultilingual ? '5' : '4'}. Quality Checklist

- [ ] All pages created with correct slugs
- [ ] Parent-child relationships set correctly
- [ ] Primary navigation configured
- [ ] Footer navigation configured
- [ ] Homepage set as static front page
- [ ] All links tested and working
${isMultilingual ? '- [ ] All pages translated\n- [ ] Language switcher visible\n- [ ] Translated URLs working' : ''}

`;

  return output;
}

// Main export function
function generateGuide() {
  const { sitemap, navigation } = loadData();
  const allPages = flattenPages(sitemap.pages);
  const maxDepth = getMaxDepth(sitemap.pages);
  const now = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const guide = `# Website Implementation Guide

> Generated: ${now}

---

## Overview

| Metric | Value |
|--------|-------|
| Total Pages | ${allPages.length} |
| Max Depth | ${maxDepth} levels |
| Languages | ${sitemap.languages.join(', ').toUpperCase()} |
| Default Language | ${sitemap.defaultLanguage.toUpperCase()} |

### Page Status Summary

${generateStatusTable(sitemap.pages)}

---

## Visual Sitemap

\`\`\`
${sitemap.languages[0].toUpperCase()} Site Structure
${'─'.repeat(40)}
${generateVisualTree(sitemap.pages, '', true, sitemap.defaultLanguage)}
\`\`\`

**Legend:** [P] = Primary Nav, [S] = Secondary Nav

---

## Complete Page List

${generatePageList(sitemap.pages, 0, sitemap.defaultLanguage)}

---

## Navigation Structure

${generateNavigationSection(navigation, sitemap, sitemap.defaultLanguage)}

---

${generateWordPressInstructions(sitemap)}

---

## Additional Notes

### Template Mapping

Each page has an assigned template that should be matched in WordPress:

| Template ID | Recommended WordPress Approach |
|-------------|-------------------------------|
| homepage | Custom Elementor template or theme homepage |
| about | Elementor About page template |
| services | Services listing with sections |
| services-single | Individual service detail page |
| contact | Contact form with map/info |
| pricing | Pricing tables with comparison |
| portfolio | Portfolio grid with filtering |
| portfolio-single | Case study layout |
| blog | Blog archive template |
| landing | Landing page (minimal header/footer) |
| minimal | Simple content page |

### File Exports Available

This guide is part of a complete export package:

- \`wp-cli-commands.sh\` - WordPress CLI script for automated setup
- \`wordpress-import-*.xml\` - WordPress XML import files
- \`sitemap-api.json\` - REST API payloads for automation
- \`implementation-guide.md\` - This document

---

*Generated by Sitemap Portal*
`;
  
  return guide;
}

// Export
function exportGuide() {
  const { sitemap } = loadData();
  
  // Ensure exports directory exists
  mkdirSync(join(rootDir, '_handoff/exports'), { recursive: true });
  
  const guide = generateGuide();
  const outputPath = join(rootDir, '_handoff/exports/implementation-guide.md');
  
  writeFileSync(outputPath, guide);
  console.log(`✓ Implementation guide exported to: ${outputPath}`);
  
  const allPages = flattenPages(sitemap.pages);
  console.log(`  Contains documentation for ${allPages.length} pages`);
  console.log('');
  console.log('The guide includes:');
  console.log('  - Visual sitemap tree');
  console.log('  - Complete page list with details');
  console.log('  - Navigation structure');
  console.log('  - WordPress setup instructions');
  console.log('  - Quality checklist');
}

// Run
exportGuide();
