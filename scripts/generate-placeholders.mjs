#!/usr/bin/env node

/**
 * Placeholder Image Generator
 * Creates placeholder images for prototyping
 * 
 * Note: This generates SVG-based placeholders that work without external dependencies.
 * For raster images, use a service like placeholder.com or unsplash in production.
 * 
 * Usage:
 *   node scripts/generate-placeholders.mjs
 *   node scripts/generate-placeholders.mjs --type hero
 *   node scripts/generate-placeholders.mjs --all
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'src/assets/placeholders');

// Placeholder definitions
const placeholders = {
  hero: [
    { name: 'hero-desktop', width: 1920, height: 1080 },
    { name: 'hero-tablet', width: 1024, height: 768 },
    { name: 'hero-mobile', width: 640, height: 960 }
  ],
  feature: [
    { name: 'feature-icon', width: 80, height: 80 },
    { name: 'feature-image', width: 400, height: 300 }
  ],
  testimonial: [
    { name: 'avatar-sm', width: 48, height: 48 },
    { name: 'avatar-md', width: 64, height: 64 },
    { name: 'avatar-lg', width: 96, height: 96 }
  ],
  logo: [
    { name: 'logo-dark', width: 200, height: 60 },
    { name: 'logo-light', width: 200, height: 60 },
    { name: 'logo-icon', width: 60, height: 60 }
  ],
  portfolio: [
    { name: 'portfolio-thumb', width: 600, height: 450 },
    { name: 'portfolio-full', width: 1200, height: 800 }
  ],
  team: [
    { name: 'team-photo', width: 400, height: 400 }
  ],
  blog: [
    { name: 'blog-thumb', width: 800, height: 500 },
    { name: 'blog-featured', width: 1200, height: 630 }
  ]
};

// Generate SVG placeholder
function generateSVG(width, height, label, bgColor = '#e5e7eb', textColor = '#9ca3af') {
  const fontSize = Math.min(width, height) / 8;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text 
    x="50%" 
    y="50%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${fontSize}px" 
    fill="${textColor}"
  >${label}</text>
  <text 
    x="50%" 
    y="calc(50% + ${fontSize * 1.2}px)" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${fontSize * 0.5}px" 
    fill="${textColor}"
  >${width}x${height}</text>
</svg>`;
}

// Generate gradient placeholder for heroes
function generateGradientSVG(width, height, label) {
  const fontSize = Math.min(width, height) / 10;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#gradient)"/>
  <text 
    x="50%" 
    y="50%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${fontSize}px" 
    font-weight="bold"
    fill="rgba(255,255,255,0.3)"
  >${label}</text>
  <text 
    x="50%" 
    y="calc(50% + ${fontSize * 1.2}px)" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${fontSize * 0.4}px" 
    fill="rgba(255,255,255,0.5)"
  >${width}x${height}</text>
</svg>`;
}

// Generate avatar placeholder
function generateAvatarSVG(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#e5e7eb" rx="${size/2}"/>
  <circle cx="${size/2}" cy="${size * 0.38}" r="${size * 0.22}" fill="#9ca3af"/>
  <ellipse cx="${size/2}" cy="${size * 0.95}" rx="${size * 0.35}" ry="${size * 0.3}" fill="#9ca3af"/>
</svg>`;
}

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    type: args.find(a => !a.startsWith('-')),
    all: args.includes('--all') || args.includes('-a'),
    help: args.includes('--help') || args.includes('-h')
  };
}

// Show help
function showHelp() {
  console.log(`
Placeholder Generator - Create placeholder images for prototyping

Usage:
  node scripts/generate-placeholders.mjs [type]

Options:
  --all, -a     Generate all placeholder types
  --help, -h    Show this help message

Types:
  hero          Hero/banner images (desktop, tablet, mobile)
  feature       Feature icons and images
  testimonial   Avatar images (sm, md, lg)
  logo          Logo variations (dark, light, icon)
  portfolio     Portfolio thumbnails and full images
  team          Team member photos
  blog          Blog thumbnails and featured images

Examples:
  node scripts/generate-placeholders.mjs --all
  node scripts/generate-placeholders.mjs hero
  node scripts/generate-placeholders.mjs testimonial
`);
}

// Main function
async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  let typesToGenerate = [];

  if (args.all) {
    typesToGenerate = Object.keys(placeholders);
  } else if (args.type && placeholders[args.type]) {
    typesToGenerate = [args.type];
  } else {
    // Default to all
    typesToGenerate = Object.keys(placeholders);
  }

  console.log('\n🖼️  Generating placeholder images...\n');

  let totalGenerated = 0;

  for (const type of typesToGenerate) {
    const items = placeholders[type];
    console.log(`📁 ${type}/`);
    
    // Create type subdirectory
    const typeDir = path.join(outputDir, type);
    await fs.mkdir(typeDir, { recursive: true });

    for (const item of items) {
      let svg;
      const label = item.name.replace(/-/g, ' ').toUpperCase();

      // Choose generator based on type
      if (type === 'hero') {
        svg = generateGradientSVG(item.width, item.height, label);
      } else if (type === 'testimonial' || item.name.includes('avatar')) {
        svg = generateAvatarSVG(item.width);
      } else if (type === 'logo' && item.name.includes('light')) {
        svg = generateSVG(item.width, item.height, 'LOGO', '#1f2937', '#6b7280');
      } else {
        svg = generateSVG(item.width, item.height, label);
      }

      const filePath = path.join(typeDir, `${item.name}.svg`);
      await fs.writeFile(filePath, svg, 'utf-8');
      console.log(`   ✓ ${item.name}.svg (${item.width}x${item.height})`);
      totalGenerated++;
    }
    
    console.log('');
  }

  // Create index file
  const indexContent = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    placeholders: typesToGenerate.reduce((acc, type) => {
      acc[type] = placeholders[type].map(item => ({
        ...item,
        path: `placeholders/${type}/${item.name}.svg`
      }));
      return acc;
    }, {})
  };

  await fs.writeFile(
    path.join(outputDir, 'index.json'),
    JSON.stringify(indexContent, null, 2),
    'utf-8'
  );

  console.log(`✅ Generated ${totalGenerated} placeholder images`);
  console.log(`📁 Output: src/assets/placeholders/`);
  console.log(`📄 Index: src/assets/placeholders/index.json`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
