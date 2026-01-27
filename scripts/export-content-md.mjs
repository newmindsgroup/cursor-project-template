#!/usr/bin/env node

/**
 * Content Markdown Export Script
 * Exports multilingual content to human-readable Markdown documents
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'src', 'content');
const outputDir = path.join(rootDir, '_handoff', 'content');

/**
 * Get all content files for a language
 */
async function getContentFiles(language) {
  const langDir = path.join(contentDir, language);
  
  try {
    const files = await fs.readdir(langDir);
    return files.filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}

/**
 * Load content file
 */
async function loadContent(language, filename) {
  const filePath = path.join(contentDir, language, filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`  Error loading ${language}/${filename}:`, error.message);
    return null;
  }
}

/**
 * Generate Markdown for a page
 */
function generatePageMarkdown(pageName, content, language) {
  const lines = [];
  
  lines.push(`# ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page Content`);
  lines.push('');
  lines.push(`**Language:** ${language.toUpperCase()}`);
  lines.push(`**Status:** ${content.meta?.status || 'draft'}`);
  lines.push(`**Last Updated:** ${content.meta?.lastUpdated || 'N/A'}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Meta
  if (content.meta) {
    lines.push('## SEO / Meta');
    lines.push('');
    lines.push(`**Title:** ${content.meta.title || ''}`);
    lines.push('');
    lines.push(`**Description:** ${content.meta.description || ''}`);
    lines.push('');
  }
  
  // StoryBrand
  if (content.storybrand) {
    lines.push('## StoryBrand Framework');
    lines.push('');
    
    if (content.storybrand.character) {
      lines.push('### Character (Customer)');
      lines.push('');
      lines.push(`**Identity:** ${content.storybrand.character.identity || ''}`);
      lines.push('');
      lines.push(`**Want:** ${content.storybrand.character.want || ''}`);
      lines.push('');
    }
    
    if (content.storybrand.problem) {
      lines.push('### Problem');
      lines.push('');
      lines.push(`**Villain:** ${content.storybrand.problem.villain || ''}`);
      lines.push('');
      lines.push(`**External:** ${content.storybrand.problem.external || ''}`);
      lines.push('');
      lines.push(`**Internal:** ${content.storybrand.problem.internal || ''}`);
      lines.push('');
      lines.push(`**Philosophical:** ${content.storybrand.problem.philosophical || ''}`);
      lines.push('');
    }
    
    if (content.storybrand.guide) {
      lines.push('### Guide (Brand)');
      lines.push('');
      lines.push(`**Empathy:** ${content.storybrand.guide.empathy || ''}`);
      lines.push('');
      lines.push(`**Authority:** ${content.storybrand.guide.authority || ''}`);
      lines.push('');
    }
    
    if (content.storybrand.plan?.steps) {
      lines.push('### Plan');
      lines.push('');
      content.storybrand.plan.steps.forEach((step, i) => {
        lines.push(`${i + 1}. **${step.title}** - ${step.description || ''}`);
      });
      lines.push('');
    }
    
    if (content.storybrand.success) {
      lines.push('### Success');
      lines.push('');
      lines.push(`**Transformation:** ${content.storybrand.success.transformation || ''}`);
      lines.push('');
      if (content.storybrand.success.outcomes?.length) {
        lines.push('**Outcomes:**');
        content.storybrand.success.outcomes.forEach(outcome => {
          lines.push(`- ${outcome}`);
        });
        lines.push('');
      }
    }
    
    if (content.storybrand.failure?.stakes) {
      lines.push('### Stakes (Failure)');
      lines.push('');
      lines.push(content.storybrand.failure.stakes);
      lines.push('');
    }
  }
  
  lines.push('---');
  lines.push('');
  
  // Hero
  if (content.hero) {
    lines.push('## Hero Section');
    lines.push('');
    lines.push(`### Headline`);
    lines.push('');
    lines.push(`> ${content.hero.headline || ''}`);
    lines.push('');
    lines.push(`### Subheadline`);
    lines.push('');
    lines.push(content.hero.subheadline || '');
    lines.push('');
    lines.push(`### CTAs`);
    lines.push('');
    lines.push(`- **Primary:** ${content.hero.primaryCta?.text || ''}`);
    lines.push(`- **Secondary:** ${content.hero.secondaryCta?.text || ''}`);
    lines.push('');
  }
  
  // Features
  if (content.features?.items?.length) {
    lines.push('## Features Section');
    lines.push('');
    lines.push(`**Title:** ${content.features.sectionTitle || ''}`);
    lines.push('');
    lines.push(`**Subtitle:** ${content.features.sectionSubtitle || ''}`);
    lines.push('');
    lines.push('| Icon | Title | Description |');
    lines.push('|------|-------|-------------|');
    content.features.items.forEach(item => {
      lines.push(`| ${item.icon || ''} | ${item.title || ''} | ${item.description || ''} |`);
    });
    lines.push('');
  }
  
  // Stats
  if (content.stats?.items?.length) {
    lines.push('## Stats Section');
    lines.push('');
    lines.push('| Value | Label |');
    lines.push('|-------|-------|');
    content.stats.items.forEach(item => {
      lines.push(`| ${item.value}${item.suffix || ''} | ${item.label} |`);
    });
    lines.push('');
  }
  
  // Testimonials
  if (content.testimonials?.items?.length) {
    lines.push('## Testimonials');
    lines.push('');
    lines.push(`**Section Title:** ${content.testimonials.sectionTitle || ''}`);
    lines.push('');
    content.testimonials.items.forEach((item, i) => {
      lines.push(`### Testimonial ${i + 1}`);
      lines.push('');
      lines.push(`> "${item.quote}"`);
      lines.push('');
      lines.push(`— **${item.author}**, ${item.role}, ${item.company}`);
      lines.push('');
    });
  }
  
  // FAQ
  if (content.faq?.items?.length) {
    lines.push('## FAQ');
    lines.push('');
    lines.push(`**Section Title:** ${content.faq.sectionTitle || ''}`);
    lines.push('');
    content.faq.items.forEach((item, i) => {
      lines.push(`### Q${i + 1}: ${item.question}`);
      lines.push('');
      lines.push(item.answer);
      lines.push('');
    });
  }
  
  // CTA
  if (content.cta) {
    lines.push('## CTA Section');
    lines.push('');
    lines.push(`**Headline:** ${content.cta.headline || ''}`);
    lines.push('');
    lines.push(`**Subheadline:** ${content.cta.subheadline || ''}`);
    lines.push('');
    lines.push(`**Button:** ${content.cta.buttonText || ''}`);
    lines.push('');
  }
  
  // Contact
  if (content.contact) {
    lines.push('## Contact Section');
    lines.push('');
    lines.push(`**Title:** ${content.contact.sectionTitle || ''}`);
    lines.push('');
    lines.push(`**Subtitle:** ${content.contact.sectionSubtitle || ''}`);
    lines.push('');
    if (content.contact.formLabels) {
      lines.push('### Form Labels');
      lines.push('');
      Object.entries(content.contact.formLabels).forEach(([key, value]) => {
        lines.push(`- **${key}:** ${value}`);
      });
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Export content to Markdown
 */
async function exportMarkdown() {
  console.log('📝 Exporting content to Markdown...\n');
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get all available languages
  const entries = await fs.readdir(contentDir, { withFileTypes: true });
  const languages = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_') && e.name !== 'schema' && e.name !== 'storybrand')
    .map(e => e.name);
  
  if (languages.length === 0) {
    console.log('⚠ No language directories found in src/content/');
    return;
  }
  
  console.log(`📂 Found languages: ${languages.join(', ')}`);
  
  // Process each language
  for (const language of languages) {
    console.log(`\n📁 Processing: ${language.toUpperCase()}`);
    
    const langOutputDir = path.join(outputDir, language);
    await fs.mkdir(langOutputDir, { recursive: true });
    
    const files = await getContentFiles(language);
    
    for (const filename of files) {
      const pageName = filename.replace('.json', '');
      const content = await loadContent(language, filename);
      
      if (!content) continue;
      
      const markdown = generatePageMarkdown(pageName, content, language);
      const mdPath = path.join(langOutputDir, `${pageName}.md`);
      
      await fs.writeFile(mdPath, markdown, 'utf-8');
      console.log(`  ✓ Exported: ${language}/${pageName}.md`);
    }
  }
  
  // Create combined overview
  console.log('\n📄 Creating content overview...');
  
  const overviewLines = [];
  overviewLines.push('# Website Content Overview');
  overviewLines.push('');
  overviewLines.push(`Generated: ${new Date().toISOString()}`);
  overviewLines.push('');
  overviewLines.push('## Languages');
  overviewLines.push('');
  
  for (const language of languages) {
    const files = await getContentFiles(language);
    overviewLines.push(`### ${language.toUpperCase()}`);
    overviewLines.push('');
    for (const filename of files) {
      const pageName = filename.replace('.json', '');
      const content = await loadContent(language, filename);
      overviewLines.push(`- **${pageName}**: ${content?.meta?.title || 'Untitled'} (${content?.meta?.status || 'draft'})`);
    }
    overviewLines.push('');
  }
  
  const overviewPath = path.join(outputDir, 'CONTENT_OVERVIEW.md');
  await fs.writeFile(overviewPath, overviewLines.join('\n'), 'utf-8');
  console.log(`  ✓ Created: CONTENT_OVERVIEW.md`);
  
  console.log(`\n✅ Markdown export complete!`);
  console.log(`📦 Output directory: ${outputDir}`);
}

exportMarkdown().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
