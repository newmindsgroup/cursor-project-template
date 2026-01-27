#!/usr/bin/env node

/**
 * Export Sitemap to WordPress XML (WXR format)
 * Generates a WordPress eXtended RSS file for import via Tools > Import
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load project settings
function loadProjectSettings() {
  const settingsPaths = [
    join(rootDir, 'project-settings.local.json'),
    join(rootDir, 'project-settings.json')
  ];
  
  for (const settingsPath of settingsPaths) {
    if (existsSync(settingsPath)) {
      try {
        return JSON.parse(readFileSync(settingsPath, 'utf-8'));
      } catch {
        // Try next file
      }
    }
  }
  return {};
}

// Load site config
function loadSiteConfig() {
  const configPath = join(rootDir, 'src/data/site-config.json');
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

// Get site URL from settings
function getSiteUrl() {
  const settings = loadProjectSettings();
  const siteConfig = loadSiteConfig();
  
  // Priority: settings.siteUrl > siteConfig.siteUrl > default placeholder
  return settings.project?.siteUrl || 
         settings.siteUrl || 
         siteConfig.siteUrl || 
         'https://your-site.com';
}

// Load sitemap data
function loadSitemap() {
  const sitemapPath = join(rootDir, 'src/data/sitemap.json');

  if (!existsSync(sitemapPath)) {
    console.error('Error: sitemap.json not found');
    process.exit(1);
  }

  return JSON.parse(readFileSync(sitemapPath, 'utf-8'));
}

// Escape XML special characters
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Format date for WordPress
function formatWpDate(date = new Date()) {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

// Flatten pages with parent tracking
function flattenPagesWithParent(pages, parentId = 0, result = [], idMap = { counter: 1 }) {
  pages.forEach(page => {
    const pageId = idMap.counter++;
    idMap[page.id] = pageId;
    
    result.push({
      ...page,
      wpId: pageId,
      wpParentId: parentId
    });
    
    if (page.children?.length > 0) {
      flattenPagesWithParent(page.children, pageId, result, idMap);
    }
  });
  
  return result;
}

// Generate page item XML
function generatePageItem(page, language = 'en') {
  const now = formatWpDate();
  const title = page.title[language] || page.title.en || page.id;
  const slug = page.slug.replace(/^\//, '') || page.id;
  const description = page.description?.[language] || page.description?.en || '';
  
  return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>/${slug}</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <dc:creator><![CDATA[admin]]></dc:creator>
      <guid isPermaLink="false">/${slug}</guid>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[<!-- Page content to be added -->]]></content:encoded>
      <excerpt:encoded><![CDATA[${description}]]></excerpt:encoded>
      <wp:post_id>${page.wpId}</wp:post_id>
      <wp:post_date>${now}</wp:post_date>
      <wp:post_date_gmt>${now}</wp:post_date_gmt>
      <wp:post_modified>${now}</wp:post_modified>
      <wp:post_modified_gmt>${now}</wp:post_modified_gmt>
      <wp:comment_status>closed</wp:comment_status>
      <wp:ping_status>closed</wp:ping_status>
      <wp:post_name>${escapeXml(slug)}</wp:post_name>
      <wp:status>draft</wp:status>
      <wp:post_parent>${page.wpParentId}</wp:post_parent>
      <wp:menu_order>${page.navOrder || 0}</wp:menu_order>
      <wp:post_type>page</wp:post_type>
      <wp:post_password></wp:post_password>
      <wp:is_sticky>0</wp:is_sticky>
      <wp:postmeta>
        <wp:meta_key>_sitemap_id</wp:meta_key>
        <wp:meta_value><![CDATA[${page.id}]]></wp:meta_value>
      </wp:postmeta>
      <wp:postmeta>
        <wp:meta_key>_sitemap_template</wp:meta_key>
        <wp:meta_value><![CDATA[${page.template}]]></wp:meta_value>
      </wp:postmeta>
      <wp:postmeta>
        <wp:meta_key>_sitemap_status</wp:meta_key>
        <wp:meta_value><![CDATA[${page.status}]]></wp:meta_value>
      </wp:postmeta>
    </item>`;
}

// Generate full WXR XML
function generateWxrXml(sitemap, language = 'en') {
  const now = formatWpDate();
  const pages = flattenPagesWithParent(sitemap.pages);
  const siteConfig = loadSiteConfig();
  const settings = loadProjectSettings();
  const siteTitle = siteConfig.siteName || settings.project?.name || 'Website Export';
  const siteUrl = getSiteUrl();
  
  const items = pages.map(page => generatePageItem(page, language)).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8" ?>
<!-- WordPress eXtended RSS (WXR) Export File -->
<!-- Generated by Sitemap Portal -->
<!-- https://wordpress.org/plugins/wordpress-importer/ -->

<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
>
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>WordPress pages export from Sitemap Portal</description>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <language>${language}</language>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>${siteUrl}</wp:base_site_url>
    <wp:base_blog_url>${siteUrl}</wp:base_blog_url>
    
    <!-- Authors -->
    <wp:author>
      <wp:author_id>1</wp:author_id>
      <wp:author_login><![CDATA[admin]]></wp:author_login>
      <wp:author_email><![CDATA[admin@${siteUrl.replace(/^https?:\/\//, '')}]]></wp:author_email>
      <wp:author_display_name><![CDATA[Admin]]></wp:author_display_name>
    </wp:author>
    
    <!-- Page Items -->
    ${items}
  </channel>
</rss>`;
}

// Main export function
function exportToXml() {
  const sitemap = loadSitemap();
  const pages = flattenPagesWithParent(sitemap.pages);
  
  // Ensure exports directory exists
  mkdirSync(join(rootDir, '_handoff/exports'), { recursive: true });
  
  // Export for default language
  const defaultLang = sitemap.defaultLanguage || 'en';
  const xml = generateWxrXml(sitemap, defaultLang);
  const outputPath = join(rootDir, `_handoff/exports/wordpress-import-${defaultLang}.xml`);
  
  writeFileSync(outputPath, xml);
  console.log(`✓ WordPress XML exported to: ${outputPath}`);
  console.log(`  Contains ${pages.length} pages`);
  
  // Export additional languages if available
  if (sitemap.languages?.length > 1) {
    sitemap.languages.forEach(lang => {
      if (lang !== defaultLang) {
        const langXml = generateWxrXml(sitemap, lang);
        const langOutputPath = join(rootDir, `_handoff/exports/wordpress-import-${lang}.xml`);
        writeFileSync(langOutputPath, langXml);
        console.log(`✓ WordPress XML (${lang.toUpperCase()}) exported to: ${langOutputPath}`);
      }
    });
  }
  
  console.log('');
  console.log('To import into WordPress:');
  console.log('  1. Go to Tools > Import');
  console.log('  2. Install the WordPress Importer if needed');
  console.log('  3. Upload the XML file');
  console.log('  4. Assign authors and import');
}

// Run
exportToXml();
