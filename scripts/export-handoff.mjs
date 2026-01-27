#!/usr/bin/env node

/**
 * Handoff Exporter Script
 * Generates Elementor implementation guides from built HTML
 */

import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const handoffDir = path.join(rootDir, '_handoff');
const handoffAssetsDir = path.join(handoffDir, 'assets');
const distHandoffDir = path.join(distDir, 'pages', 'handoff');

// Design tokens from Tailwind config
const TOKENS = {
  colors: {
    'primary-50': '#eff6ff',
    'primary-100': '#dbeafe',
    'primary-500': '#3b82f6',
    'primary-600': '#2563eb',
    'secondary-500': '#8b5cf6',
    'secondary-600': '#7c3aed',
    'neutral-50': '#fafafa',
    'neutral-900': '#171717',
  },
  spacing: {
    '4': '1rem',
    '6': '1.5rem',
    '8': '2rem',
    '12': '3rem',
    '16': '4rem',
    '24': '6rem',
    '32': '8rem',
  },
  typography: {
    'font-heading': 'Inter, system-ui, sans-serif',
    'font-body': 'Inter, system-ui, sans-serif',
    'text-base': '1rem',
    'text-lg': '1.125rem',
    'text-xl': '1.25rem',
    'text-2xl': '1.5rem',
    'text-4xl': '2.25rem',
    'text-5xl': '3rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

class HandoffExporter {
  constructor() {
    this.pages = [];
    this.allSections = [];
  }

  async run() {
    console.log('🚀 Starting handoff export...\n');

    // Ensure handoff directories exist
    await fs.mkdir(handoffDir, { recursive: true });
    await fs.mkdir(handoffAssetsDir, { recursive: true });

    // Find all HTML files in dist/pages
    const pagesDir = path.join(distDir, 'pages');
    const htmlFiles = await this.findHTMLFiles(pagesDir);
    console.log(`📄 Found ${htmlFiles.length} pages to process\n`);

    // Process each page
    for (const htmlFile of htmlFiles) {
      await this.processPage(htmlFile);
    }

    // Generate outputs
    await this.generateJSON();
    await this.generateMarkdown();
    await this.generatePageIndex();
    await this.copyAssets();
    await this.copyToDistHandoff();

    console.log('\n✅ Handoff export complete!');
    console.log(`📦 Output directory: ${handoffDir}`);
    console.log('   - elementor-map.json');
    console.log('   - elementor-map.md');
    console.log('   - page-index.json');
    console.log('   - assets/\n');
  }

  async findHTMLFiles(dir) {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith('.html')).map((f) => path.join(dir, f));
  }

  async processPage(filePath) {
    const fileName = path.basename(filePath);
    const pageName = fileName === 'index.html' ? 'Home' : this.toTitleCase(fileName.replace('.html', ''));

    console.log(`Processing: ${pageName} (${fileName})`);

    const html = await fs.readFile(filePath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Find all sections with data-section attribute
    const sections = document.querySelectorAll('[data-section]');
    const pageSections = [];

    sections.forEach((section, index) => {
      const sectionData = this.extractSectionData(section, index);
      pageSections.push(sectionData);
      this.allSections.push(sectionData);
      console.log(`  ✓ ${sectionData.name}`);
    });

    this.pages.push({
      name: pageName,
      file: fileName,
      path: fileName === 'index.html' ? '/' : `/${fileName}`,
      sections: pageSections,
    });
  }

  extractSectionData(section, index) {
    const name = section.getAttribute('data-section') || `Section${index + 1}`;
    const notes = section.getAttribute('data-notes') || '';
    const widgets = section.getAttribute('data-elementor-widget-suggestion') || '';
    const tokensStr = section.getAttribute('data-tokens') || '{}';

    let tokens = {};
    try {
      tokens = JSON.parse(tokensStr);
    } catch (e) {
      // Invalid JSON, skip
    }

    // Extract computed styles (simulated - in real browser these would be computed)
    const styles = this.extractStyles(section);
    const elements = this.extractElements(section);

    return {
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
      name,
      notes,
      elementorWidgets: widgets.split(',').map((w) => w.trim()).filter(Boolean),
      tokens,
      layout: styles.layout,
      elements,
    };
  }

  extractStyles(section) {
    // Simplified style extraction from class names
    const classes = section.getAttribute('class') || '';

    const layout = {
      display: 'flex',
      flexDirection: classes.includes('flex-col') ? 'column' : 'row',
      gap: this.extractSpacing(classes, 'gap'),
      padding: this.extractPadding(classes),
      margin: '0',
    };

    return { layout };
  }

  extractSpacing(classes, prefix) {
    const match = classes.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      const value = match[1];
      return TOKENS.spacing[value] || `${value}px`;
    }
    return '0';
  }

  extractPadding(classes) {
    const py = this.extractSpacing(classes, 'py');
    const px = this.extractSpacing(classes, 'px');
    const p = this.extractSpacing(classes, 'p');

    if (py !== '0' || px !== '0') {
      return `${py} ${px}`;
    }
    return p;
  }

  extractElements(section) {
    const elements = [];

    // Extract headings
    const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      elements.push({
        type: 'heading',
        tag: heading.tagName.toLowerCase(),
        content: heading.textContent?.trim().substring(0, 100) || '',
        classes: heading.getAttribute('class') || '',
      });
    });

    // Extract paragraphs (limit to first 3)
    const paragraphs = Array.from(section.querySelectorAll('p')).slice(0, 3);
    paragraphs.forEach((p) => {
      elements.push({
        type: 'text',
        content: p.textContent?.trim().substring(0, 150) || '',
        classes: p.getAttribute('class') || '',
      });
    });

    // Extract buttons
    const buttons = section.querySelectorAll('button, a[class*="button"], a[class*="btn"]');
    buttons.forEach((btn) => {
      elements.push({
        type: 'button',
        content: btn.textContent?.trim() || '',
        href: btn.getAttribute('href') || undefined,
        classes: btn.getAttribute('class') || '',
      });
    });

    return elements;
  }

  async generateJSON() {
    const output = {
      meta: {
        generated: new Date().toISOString(),
        version: '1.0.0',
        pages: this.pages.length,
        totalSections: this.allSections.length,
      },
      tokens: TOKENS,
      pages: this.pages,
    };

    const jsonPath = path.join(handoffDir, 'elementor-map.json');
    await fs.writeFile(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n✓ Generated: elementor-map.json`);
  }

  async generateMarkdown() {
    let md = '# Elementor Implementation Guide\n\n';
    md += '> Generated automatically from prototype build\n\n';

    md += '## Overview\n\n';
    md += `- **Total Pages:** ${this.pages.length}\n`;
    md += `- **Total Sections:** ${this.allSections.length}\n`;
    md += `- **Generated:** ${new Date().toLocaleDateString()}\n\n`;

    md += '---\n\n';

    md += '## Design Tokens\n\n';
    md += 'Set up these tokens as Elementor Global Colors and Typography before building:\n\n';
    md += '### Colors\n\n';
    Object.entries(TOKENS.colors).forEach(([name, value]) => {
      md += `- **${name}:** \`${value}\`\n`;
    });

    md += '\n### Spacing Scale\n\n';
    Object.entries(TOKENS.spacing).forEach(([name, value]) => {
      md += `- **${name}:** ${value}\n`;
    });

    md += '\n---\n\n';

    // Process each page
    for (const page of this.pages) {
      md += `## Page: ${page.name}\n\n`;
      md += `**File:** \`${page.file}\`  \n`;
      md += `**Path:** ${page.path}\n\n`;

      if (page.sections.length === 0) {
        md += '*No sections found on this page*\n\n';
        continue;
      }

      // Process each section
      page.sections.forEach((section, idx) => {
        md += `### Section ${idx + 1}: ${section.name}\n\n`;

        md += '**Elementor Setup:**\n\n';
        md += `- Container Layout: ${section.layout.display === 'flex' ? 'Flexbox' : 'Block'}\n`;
        if (section.layout.flexDirection) {
          md += `- Flex Direction: ${section.layout.flexDirection}\n`;
        }
        if (section.layout.gap && section.layout.gap !== '0') {
          md += `- Gap: ${section.layout.gap}\n`;
        }
        if (section.layout.padding && section.layout.padding !== '0') {
          md += `- Padding: ${section.layout.padding}\n`;
        }

        if (section.notes) {
          md += `\n**Implementation Notes:**\n\n${section.notes}\n`;
        }

        if (section.elementorWidgets.length > 0) {
          md += `\n**Suggested Widgets:**\n\n`;
          section.elementorWidgets.forEach((widget) => {
            md += `- ${widget}\n`;
          });
        }

        if (section.elements.length > 0) {
          md += `\n**Content Elements:**\n\n`;
          section.elements.slice(0, 5).forEach((el) => {
            if (el.type === 'heading') {
              md += `- **${el.tag.toUpperCase()}**: "${el.content}"\n`;
            } else if (el.type === 'button') {
              md += `- **Button**: "${el.content}"${el.href ? ` (→ ${el.href})` : ''}\n`;
            }
          });
        }

        md += '\n---\n\n';
      });
    }

    md += '## Implementation Checklist\n\n';
    md += '- [ ] Set up Global Colors and Typography\n';
    md += '- [ ] Create pages in Elementor\n';
    md += '- [ ] Build sections top-to-bottom\n';
    md += '- [ ] Test responsive behavior at all breakpoints\n';
    md += '- [ ] Validate against prototype using overlay\n';
    md += '- [ ] Check accessibility (keyboard nav, focus states)\n';
    md += '- [ ] Optimize images and assets\n\n';

    const mdPath = path.join(handoffDir, 'elementor-map.md');
    await fs.writeFile(mdPath, md, 'utf-8');
    console.log(`✓ Generated: elementor-map.md`);
  }

  async copyAssets() {
    const assetsDir = path.join(distDir, 'assets');
    const generatedAssetsDir = path.join(rootDir, 'src/assets/generated');
    let copiedCount = 0;

    // Copy dist assets
    try {
      await fs.access(assetsDir);
      const files = await fs.readdir(assetsDir, { recursive: true });

      for (const file of files) {
        const srcPath = path.join(assetsDir, file);
        const destPath = path.join(handoffAssetsDir, file);

        const stats = await fs.stat(srcPath);
        if (stats.isFile()) {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(srcPath, destPath);
          copiedCount++;
        }
      }
    } catch (e) {
      console.log('⚠ No dist assets directory found');
    }

    // Copy AI-generated assets
    try {
      await fs.access(generatedAssetsDir);
      const generatedDir = path.join(handoffAssetsDir, 'generated');
      await fs.mkdir(generatedDir, { recursive: true });

      const files = await fs.readdir(generatedAssetsDir);
      
      for (const file of files) {
        const srcPath = path.join(generatedAssetsDir, file);
        const destPath = path.join(generatedDir, file);

        const stats = await fs.stat(srcPath);
        if (stats.isFile()) {
          await fs.copyFile(srcPath, destPath);
          copiedCount++;
        }
      }

      console.log(`✓ Copied AI-generated assets to handoff package`);
    } catch (e) {
      console.log('ℹ No AI-generated assets found (run npm run assets:generate first)');
    }

    if (copiedCount > 0) {
      console.log(`✓ Copied ${copiedCount} total assets`);
    }
  }

  toTitleCase(str) {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async generatePageIndex() {
    // Generate page-index.json for the handoff portal
    const pageIndex = {
      generated: new Date().toISOString(),
      pages: this.pages.map((page) => ({
        name: page.name,
        file: page.file,
        path: `/pages/${page.file}`,
        overlayUrl: `/pages/${page.file}?spec=1`,
        sections: page.sections.map((section) => ({
          id: section.id,
          name: section.name,
          widgets: section.elementorWidgets,
          notes: section.notes,
          anchorId: section.id,
        })),
      })),
    };

    const indexPath = path.join(handoffDir, 'page-index.json');
    await fs.writeFile(indexPath, JSON.stringify(pageIndex, null, 2), 'utf-8');
    console.log(`✓ Generated: page-index.json`);
  }

  async copyToDistHandoff() {
    // Copy handoff files to dist/pages/handoff for the portal to access
    try {
      await fs.mkdir(distHandoffDir, { recursive: true });

      // Copy page-index.json
      const pageIndexSrc = path.join(handoffDir, 'page-index.json');
      const pageIndexDest = path.join(distHandoffDir, 'page-index.json');
      await fs.copyFile(pageIndexSrc, pageIndexDest);

      // Create downloads directory
      const downloadsDir = path.join(distHandoffDir, 'downloads');
      await fs.mkdir(downloadsDir, { recursive: true });

      // Create screenshots directory
      const screenshotsDir = path.join(distHandoffDir, 'screenshots');
      await fs.mkdir(screenshotsDir, { recursive: true });

      // Create empty manifest for screenshots (will be populated by screenshot script)
      const manifestPath = path.join(screenshotsDir, 'manifest.json');
      const emptyManifest = { generated: new Date().toISOString(), screenshots: [] };
      await fs.writeFile(manifestPath, JSON.stringify(emptyManifest, null, 2), 'utf-8');

      console.log(`✓ Copied handoff files to dist`);
    } catch (e) {
      console.log('⚠ Could not copy to dist handoff directory:', e.message);
    }
  }
}

// Run the exporter
const exporter = new HandoffExporter();
exporter.run().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
