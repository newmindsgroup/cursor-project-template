#!/usr/bin/env node

/**
 * ZIP Generation Script
 * Creates downloadable ZIP archives for the Handoff Portal
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const handoffDir = path.join(rootDir, '_handoff');
const downloadsDir = path.join(distDir, 'pages', 'handoff', 'downloads');
const srcDataDir = path.join(rootDir, 'src', 'data');

/**
 * Create a ZIP file from a directory or specific files
 */
async function createZip(outputPath, sources, options = {}) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const size = (archive.pointer() / 1024).toFixed(2);
      console.log(`  ✓ Created: ${path.basename(outputPath)} (${size} KB)`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);

    for (const source of sources) {
      if (source.type === 'directory') {
        archive.directory(source.path, source.dest || false);
      } else if (source.type === 'file') {
        archive.file(source.path, { name: source.dest || path.basename(source.path) });
      } else if (source.type === 'content') {
        archive.append(source.content, { name: source.dest });
      }
    }

    archive.finalize();
  });
}

/**
 * Generate prototype-dist.zip - Full static build
 */
async function generatePrototypeZip() {
  console.log('\n📦 Generating prototype-dist.zip...');

  const outputPath = path.join(downloadsDir, 'prototype-dist.zip');
  
  // Exclude handoff directory from prototype zip
  const sources = [
    { type: 'directory', path: distDir, dest: 'prototype' }
  ];

  await createZip(outputPath, sources);
}

/**
 * Generate elementor-build-pack.zip - Specs and documentation
 */
async function generateBuildPackZip() {
  console.log('\n📦 Generating elementor-build-pack.zip...');

  const outputPath = path.join(downloadsDir, 'elementor-build-pack.zip');
  const sources = [];

  // Add elementor-map files from _handoff
  const elementorMapJson = path.join(handoffDir, 'elementor-map.json');
  const elementorMapMd = path.join(handoffDir, 'elementor-map.md');
  const pageIndexJson = path.join(handoffDir, 'page-index.json');

  try {
    await fs.access(elementorMapJson);
    sources.push({ type: 'file', path: elementorMapJson, dest: 'elementor-map.json' });
  } catch {}

  try {
    await fs.access(elementorMapMd);
    sources.push({ type: 'file', path: elementorMapMd, dest: 'elementor-map.md' });
  } catch {}

  try {
    await fs.access(pageIndexJson);
    sources.push({ type: 'file', path: pageIndexJson, dest: 'page-index.json' });
  } catch {}

  // Add mapping rules from src/data
  const mappingRulesPath = path.join(srcDataDir, 'elementor-mapping.rules.json');
  try {
    await fs.access(mappingRulesPath);
    sources.push({ type: 'file', path: mappingRulesPath, dest: 'elementor-mapping.rules.json' });
  } catch {}

  // Add tokens file
  const tokensPath = path.join(rootDir, 'src', 'styles', 'tokens.css');
  try {
    await fs.access(tokensPath);
    sources.push({ type: 'file', path: tokensPath, dest: 'design-tokens.css' });
  } catch {}

  // Add HANDOFF.md from _handoff
  const handoffMdPath = path.join(handoffDir, 'HANDOFF.md');
  try {
    await fs.access(handoffMdPath);
    sources.push({ type: 'file', path: handoffMdPath, dest: 'HANDOFF.md' });
  } catch {}

  // Add QA checklist JSON
  const qaChecklist = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    categories: [
      {
        name: 'Typography',
        items: [
          'Font families match (heading + body)',
          'Font sizes correct at all breakpoints',
          'Font weights match (bold, semibold, regular)',
          'Line heights match prototype',
          'Letter spacing correct (if specified)'
        ]
      },
      {
        name: 'Spacing',
        items: [
          'Section padding matches at all breakpoints',
          'Margins between elements correct',
          'Flex/grid gaps match prototype',
          'Container max-width correct (1280px)'
        ]
      },
      {
        name: 'Colors',
        items: [
          'Primary colors match tokens',
          'Secondary colors match tokens',
          'Neutral grays correct',
          'Background colors/gradients match',
          'Border colors correct'
        ]
      },
      {
        name: 'Responsive',
        items: [
          'Desktop layout matches (1440px+)',
          'Tablet layout matches (768px)',
          'Mobile layout matches (375px)',
          'Breakpoint transitions smooth'
        ]
      },
      {
        name: 'Interactions',
        items: [
          'Button hover states implemented',
          'Link hover states implemented',
          'Card hover effects (lift/shadow)',
          'Focus rings visible on all interactive elements'
        ]
      },
      {
        name: 'Animations',
        items: [
          'Scroll animations match prototype',
          'Transition durations correct (300ms default)',
          'Respects prefers-reduced-motion'
        ]
      },
      {
        name: 'Accessibility',
        items: [
          'Semantic HTML used (nav, main, section, etc.)',
          'Heading hierarchy correct (h1 → h2 → h3)',
          'Alt text on all images',
          'Keyboard navigation works',
          'Color contrast meets WCAG AA',
          'Form labels associated with inputs'
        ]
      },
      {
        name: 'Performance',
        items: [
          'Images optimized (WebP, correct sizes)',
          'Lazy loading enabled for images',
          'Fonts loaded efficiently',
          'No layout shift (CLS)'
        ]
      }
    ]
  };

  sources.push({
    type: 'content',
    content: JSON.stringify(qaChecklist, null, 2),
    dest: 'qa-checklist.json'
  });

  // Generate a quick-start README for the build pack
  const quickStartReadme = `# Elementor Build Pack

This package contains everything you need to implement the approved prototype in Elementor Pro.

## Contents

- \`elementor-map.md\` - Step-by-step implementation guide
- \`elementor-map.json\` - Structured section/style data
- \`elementor-mapping.rules.json\` - Widget mapping dictionary
- \`design-tokens.css\` - CSS custom properties for reference
- \`qa-checklist.json\` - Implementation QA checklist
- \`HANDOFF.md\` - Full handoff process documentation

## Quick Start

1. Open the prototype in your browser
2. Enable Overlay Mode (Cmd/Ctrl + Shift + H)
3. Set up Elementor Global Colors and Typography from tokens
4. Build sections top-to-bottom following elementor-map.md
5. Use the QA checklist to validate each section

## Need Help?

- Use \`?spec=1\` parameter on any prototype page to auto-enable overlay
- Click "Spec" buttons on sections to see detailed specs
- Refer to elementor-mapping.rules.json for widget recommendations

Generated: ${new Date().toISOString()}
`;

  sources.push({
    type: 'content',
    content: quickStartReadme,
    dest: 'README.md'
  });

  if (sources.length > 0) {
    await createZip(outputPath, sources);
  } else {
    console.log('  ⚠ No build pack files found');
  }
}

/**
 * Generate assets.zip - Images, icons, fonts
 */
async function generateAssetsZip() {
  console.log('\n📦 Generating assets.zip...');

  const outputPath = path.join(downloadsDir, 'assets.zip');
  const assetsDir = path.join(distDir, 'assets');
  const srcAssetsDir = path.join(rootDir, 'src', 'assets');

  const sources = [];

  // Add from dist/assets if exists
  try {
    await fs.access(assetsDir);
    sources.push({ type: 'directory', path: assetsDir, dest: 'dist-assets' });
  } catch {}

  // Add from src/assets if exists (original source files)
  try {
    await fs.access(srcAssetsDir);
    const entries = await fs.readdir(srcAssetsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(srcAssetsDir, entry.name);
        sources.push({ type: 'directory', path: subDir, dest: entry.name });
      }
    }
  } catch {}

  if (sources.length > 0) {
    await createZip(outputPath, sources);
  } else {
    console.log('  ⚠ No assets found, creating empty placeholder');
    // Create a placeholder README
    await createZip(outputPath, [{
      type: 'content',
      content: '# Assets\n\nNo assets were found in this build.',
      dest: 'README.md'
    }]);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting ZIP generation...');

  // Ensure downloads directory exists
  await fs.mkdir(downloadsDir, { recursive: true });

  try {
    await generatePrototypeZip();
    await generateBuildPackZip();
    await generateAssetsZip();

    console.log('\n✅ All ZIPs generated successfully!');
    console.log(`📦 Output directory: ${downloadsDir}`);
  } catch (error) {
    console.error('\n❌ ZIP generation failed:', error);
    process.exit(1);
  }
}

main();
