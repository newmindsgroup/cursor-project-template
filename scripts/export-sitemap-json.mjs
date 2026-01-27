#!/usr/bin/env node

/**
 * Export Sitemap to REST API JSON
 * Generates JSON payloads for WordPress REST API automation
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

// Flatten pages with hierarchy info
function flattenPagesForApi(pages, parentSlug = '', depth = 0) {
  const result = [];
  
  pages.forEach((page, index) => {
    const pageData = {
      sitemap_id: page.id,
      title: page.title,
      slug: page.slug.replace(/^\//, '') || page.id,
      parent_slug: parentSlug,
      depth: depth,
      order: page.navOrder || index + 1,
      status: 'draft',
      template: page.template,
      meta: {
        _sitemap_id: page.id,
        _sitemap_status: page.status,
        _sitemap_template: page.template,
        in_primary_nav: page.inPrimaryNav || false,
        in_secondary_nav: page.inSecondaryNav || false,
        in_footer_nav: page.inFooterNav || false
      }
    };
    
    // Add descriptions if available
    if (page.description) {
      pageData.excerpt = page.description;
    }
    
    // Add SEO title if available
    if (page.seoTitle) {
      pageData.meta._yoast_wpseo_title = page.seoTitle;
    }
    
    result.push(pageData);
    
    // Process children
    if (page.children?.length > 0) {
      const childPages = flattenPagesForApi(page.children, pageData.slug, depth + 1);
      result.push(...childPages);
    }
  });
  
  return result;
}

// Build menu structure for API
function buildMenuStructure(navigation, sitemap) {
  const flatPages = flattenPagesForApi(sitemap.pages);
  const menus = {};
  
  // Primary navigation
  if (navigation?.primary) {
    menus.primary = {
      name: navigation.primary.name,
      location: navigation.primary.location || 'primary',
      items: navigation.primary.items.map((item, index) => {
        const page = flatPages.find(p => p.sitemap_id === item.pageId);
        const menuItem = {
          title: item.label,
          page_slug: page?.slug || item.pageId,
          order: item.order || index + 1,
          type: 'page'
        };
        
        // Handle dropdown items
        if (item.dropdown && item.children) {
          menuItem.children = item.children.map((child, childIndex) => {
            const childPage = flatPages.find(p => p.sitemap_id === child.pageId);
            return {
              title: child.label,
              page_slug: childPage?.slug || child.pageId,
              order: childIndex + 1,
              type: 'page'
            };
          });
        }
        
        return menuItem;
      })
    };
    
    // Add CTA if present
    if (navigation.primary.cta) {
      menus.primary.cta = {
        label: navigation.primary.cta.label,
        href: navigation.primary.cta.href,
        style: navigation.primary.cta.style
      };
    }
  }
  
  // Secondary/Footer navigation
  if (navigation?.secondary) {
    menus.secondary = {
      name: navigation.secondary.name,
      location: navigation.secondary.location || 'footer',
      sections: navigation.secondary.sections.map(section => ({
        id: section.id,
        title: section.title,
        items: section.pageIds.map(pageId => {
          const page = flatPages.find(p => p.sitemap_id === pageId);
          return {
            page_slug: page?.slug || pageId,
            title: page?.title || { en: pageId }
          };
        })
      }))
    };
    
    // Add social links if present
    if (navigation.secondary.social) {
      menus.secondary.social = navigation.secondary.social;
    }
  }
  
  return menus;
}

// Generate REST API payload
function generateApiPayload(sitemap, navigation) {
  const pages = flattenPagesForApi(sitemap.pages);
  const menus = navigation ? buildMenuStructure(navigation, sitemap) : {};
  
  return {
    meta: {
      generated: new Date().toISOString(),
      version: sitemap.version,
      default_language: sitemap.defaultLanguage,
      languages: sitemap.languages,
      total_pages: pages.length
    },
    pages: pages,
    menus: menus,
    
    // API endpoint hints
    api_endpoints: {
      create_page: {
        method: 'POST',
        endpoint: '/wp-json/wp/v2/pages',
        note: 'Requires authentication. Use for each page in the pages array.'
      },
      create_menu: {
        method: 'POST',
        endpoint: '/wp-json/wp/v2/menus',
        note: 'Requires WordPress REST API Menus plugin or custom endpoint.'
      },
      create_menu_item: {
        method: 'POST',
        endpoint: '/wp-json/wp/v2/menu-items',
        note: 'Available in WordPress 5.9+ with navigation block.'
      }
    },
    
    // Sample requests
    examples: {
      create_page_request: {
        title: pages[0]?.title?.en || 'Sample Page',
        slug: pages[0]?.slug || 'sample-page',
        status: 'draft',
        meta: pages[0]?.meta || {}
      }
    }
  };
}

// Generate individual language exports
function generateLanguageExport(sitemap, navigation, language) {
  const pages = flattenPagesForApi(sitemap.pages);
  
  // Convert localized fields to single language
  const localizedPages = pages.map(page => ({
    ...page,
    title: page.title[language] || page.title.en || page.title,
    excerpt: page.excerpt?.[language] || page.excerpt?.en || page.excerpt,
    meta: {
      ...page.meta,
      _yoast_wpseo_title: page.meta?._yoast_wpseo_title?.[language] || page.meta?._yoast_wpseo_title?.en
    }
  }));
  
  return {
    meta: {
      generated: new Date().toISOString(),
      language: language,
      total_pages: localizedPages.length
    },
    pages: localizedPages
  };
}

// Main export function
function exportToJson() {
  const { sitemap, navigation } = loadData();
  
  // Ensure exports directory exists
  mkdirSync(join(rootDir, '_handoff/exports'), { recursive: true });
  
  // Full export with all data
  const fullPayload = generateApiPayload(sitemap, navigation);
  const fullOutputPath = join(rootDir, '_handoff/exports/sitemap-api.json');
  writeFileSync(fullOutputPath, JSON.stringify(fullPayload, null, 2));
  console.log(`✓ Full API JSON exported to: ${fullOutputPath}`);
  
  // Export per-language files for easier REST API usage
  sitemap.languages.forEach(lang => {
    const langPayload = generateLanguageExport(sitemap, navigation, lang);
    const langOutputPath = join(rootDir, `_handoff/exports/sitemap-api-${lang}.json`);
    writeFileSync(langOutputPath, JSON.stringify(langPayload, null, 2));
    console.log(`✓ API JSON (${lang.toUpperCase()}) exported to: ${langOutputPath}`);
  });
  
  // Generate a simple pages-only export for basic usage
  const simplePages = flattenPagesForApi(sitemap.pages).map(page => ({
    title: page.title.en || page.title,
    slug: page.slug,
    parent_slug: page.parent_slug,
    template: page.template,
    status: page.status
  }));
  
  const simpleOutputPath = join(rootDir, '_handoff/exports/pages-simple.json');
  writeFileSync(simpleOutputPath, JSON.stringify(simplePages, null, 2));
  console.log(`✓ Simple pages list exported to: ${simpleOutputPath}`);
  
  console.log('');
  console.log(`Total: ${fullPayload.pages.length} pages exported`);
  console.log('');
  console.log('Usage with WordPress REST API:');
  console.log('  // Create a page');
  console.log('  POST /wp-json/wp/v2/pages');
  console.log('  Authorization: Bearer <token>');
  console.log('  Content-Type: application/json');
  console.log('  Body: { "title": "...", "slug": "...", "status": "draft" }');
}

// Run
exportToJson();
