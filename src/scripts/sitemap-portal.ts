/**
 * Sitemap Portal - Interactive visualization and management of website structure
 * With deliverables tracking for wireframes, visual designs, content, and development
 */

// Types
interface LocalizedString {
  [lang: string]: string;
}

type DeliverableStatus = 'pending' | 'in-progress' | 'review' | 'complete' | 'skipped';

interface DeliverableItem {
  status: DeliverableStatus;
  file?: string;
  notes?: string;
}

interface VisualDesignDeliverable extends DeliverableItem {
  variants?: string[];
  selectedVariant?: string | null;
}

interface Deliverables {
  wireframe?: DeliverableItem;
  visualDesign?: VisualDesignDeliverable;
  content?: DeliverableItem;
  development?: DeliverableItem;
}

interface SitemapPage {
  id: string;
  slug: string;
  title: LocalizedString;
  description?: LocalizedString;
  template: string;
  inPrimaryNav?: boolean;
  inSecondaryNav?: boolean;
  inFooterNav?: boolean;
  footerSection?: string;
  navOrder?: number;
  status: 'planned' | 'in-progress' | 'complete' | 'on-hold' | 'review' | 'archived';
  seoTitle?: LocalizedString;
  deliverables?: Deliverables;
  children: SitemapPage[];
  _note?: string;
}

interface SitemapData {
  version: string;
  defaultLanguage: string;
  languages: string[];
  pages: SitemapPage[];
}

interface NavItem {
  pageId: string;
  label: LocalizedString;
  order?: number;
  dropdown?: boolean;
  children?: NavItem[];
}

interface NavSection {
  id: string;
  title: LocalizedString;
  pageIds: string[];
}

interface NavigationData {
  version: string;
  primary: {
    name: LocalizedString;
    location: string;
    items: NavItem[];
    cta?: {
      label: LocalizedString;
      href: string;
      style: string;
    };
  };
  secondary: {
    name: LocalizedString;
    location: string;
    sections: NavSection[];
    social: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
  };
}

// Deliverable filter type
type DeliverableFilter = 'all' | 'wireframe' | 'visualDesign' | 'content' | 'development';
type StatusFilter = 'all' | DeliverableStatus;

// Main Portal Class
class SitemapPortal {
  private sitemapData: SitemapData | null = null;
  private navigationData: NavigationData | null = null;
  private currentLanguage: string = 'en';
  private selectedPageId: string | null = null;
  private expandedNodes: Set<string> = new Set();
  private editMode: boolean = false;
  private deliverableFilter: DeliverableFilter = 'all';
  private statusFilter: StatusFilter = 'all';

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadData();
    this.setupEventListeners();
    this.renderStats();
    this.renderTreeView();
    this.updateFooterStats();
  }

  private async loadData(): Promise<void> {
    // Try to load sitemap data
    const sitemapPaths = [
      '../../data/sitemap.json',
      '/src/data/sitemap.json',
      '../data/sitemap.json'
    ];

    for (const path of sitemapPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          this.sitemapData = await response.json();
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Try to load navigation data
    const navPaths = [
      '../../data/navigation.json',
      '/src/data/navigation.json',
      '../data/navigation.json'
    ];

    for (const path of navPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          this.navigationData = await response.json();
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Fallback to embedded data
    if (!this.sitemapData) {
      const embeddedSitemap = document.getElementById('sitemap-data');
      if (embeddedSitemap?.textContent) {
        try {
          this.sitemapData = JSON.parse(embeddedSitemap.textContent);
        } catch (e) {
          console.error('Failed to parse embedded sitemap data');
        }
      }
    }

    if (!this.navigationData) {
      const embeddedNav = document.getElementById('navigation-data');
      if (embeddedNav?.textContent) {
        try {
          this.navigationData = JSON.parse(embeddedNav.textContent);
        } catch (e) {
          console.error('Failed to parse embedded navigation data');
        }
      }
    }

    // Set default language
    if (this.sitemapData) {
      this.currentLanguage = this.sitemapData.defaultLanguage || 'en';
    }
  }

  private setupEventListeners(): void {
    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const lang = target.id.replace('lang-', '');
        this.switchLanguage(lang);
      });
    });

    // View tabs
    document.querySelectorAll('.sitemap-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const viewId = target.id.replace('tab-', '');
        this.switchView(viewId);
      });
    });

    // Deliverable filter
    document.getElementById('filter-deliverable')?.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value as DeliverableFilter;
      this.setDeliverableFilter(value);
    });

    // Status filter
    document.getElementById('filter-status')?.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value as StatusFilter;
      this.setStatusFilter(value);
    });

    // Expand/Collapse all
    document.getElementById('btn-expand-all')?.addEventListener('click', () => this.expandAll());
    document.getElementById('btn-collapse-all')?.addEventListener('click', () => this.collapseAll());

    // Export dropdown
    const exportBtn = document.getElementById('btn-export');
    const exportDropdown = document.getElementById('export-dropdown');
    
    exportBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      exportDropdown?.classList.add('hidden');
    });

    // Export options
    document.querySelectorAll('.export-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const format = target.dataset.export || target.closest('[data-export]')?.getAttribute('data-export');
        if (format) this.handleExport(format);
      });
    });

    // Modal handlers
    document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-cancel')?.addEventListener('click', () => this.closeModal());
    document.getElementById('page-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
    document.getElementById('btn-delete-page')?.addEventListener('click', () => this.handleDeletePage());

    // Primary nav checkbox - show/hide nav order
    document.getElementById('page-primary-nav')?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      const navOrderContainer = document.getElementById('nav-order-container');
      if (navOrderContainer) {
        navOrderContainer.classList.toggle('hidden', !checked);
      }
    });

    // Auto-generate slug from title
    document.getElementById('page-title-en')?.addEventListener('input', (e) => {
      const title = (e.target as HTMLInputElement).value;
      const slugInput = document.getElementById('page-slug') as HTMLInputElement;
      if (slugInput && !slugInput.dataset.manual) {
        slugInput.value = '/' + this.generateSlug(title);
      }
    });

    document.getElementById('page-slug')?.addEventListener('input', (e) => {
      (e.target as HTMLInputElement).dataset.manual = 'true';
    });

    // Click outside modal to close
    document.getElementById('page-modal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('page-modal')) {
        this.closeModal();
      }
    });
  }

  private switchLanguage(lang: string): void {
    this.currentLanguage = lang;
    
    // Update UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `lang-${lang}`);
    });

    // Re-render current view
    const activeTab = document.querySelector('.sitemap-tab.active');
    if (activeTab) {
      const viewId = activeTab.id.replace('tab-', '');
      this.renderView(viewId);
    }

    // Update details panel if a page is selected
    if (this.selectedPageId) {
      this.showPageDetails(this.selectedPageId);
    }
  }

  private switchView(viewId: string): void {
    // Update tabs
    document.querySelectorAll('.sitemap-tab').forEach(tab => {
      tab.classList.toggle('active', tab.id === `tab-${viewId}`);
    });

    // Update panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `view-${viewId}`);
    });

    this.editMode = viewId === 'edit';
    this.renderView(viewId);
  }

  private renderView(viewId: string): void {
    switch (viewId) {
      case 'tree':
        this.renderTreeView();
        break;
      case 'cards':
        this.renderCardsView();
        break;
      case 'nav':
        this.renderNavView();
        break;
      case 'edit':
        this.renderEditView();
        break;
    }
  }

  private renderStats(): void {
    if (!this.sitemapData) return;

    const allPages = this.flattenPages(this.sitemapData.pages);
    const primaryNavCount = allPages.filter(p => p.inPrimaryNav).length;
    const secondaryNavCount = allPages.filter(p => p.inSecondaryNav).length;
    const maxDepth = this.getMaxDepth(this.sitemapData.pages);

    // Calculate deliverables stats
    const deliverableStats = this.calculateDeliverableStats(allPages);

    this.setTextContent('stat-total-pages', allPages.length.toString());
    this.setTextContent('stat-primary-nav', primaryNavCount.toString());
    this.setTextContent('stat-secondary-nav', secondaryNavCount.toString());
    this.setTextContent('stat-max-depth', maxDepth.toString());
    this.setTextContent('stat-languages', this.sitemapData.languages.length.toString());

    // Render deliverables progress stats
    this.setTextContent('stat-wireframes', `${deliverableStats.wireframe.complete}/${deliverableStats.wireframe.total}`);
    this.setTextContent('stat-designs', `${deliverableStats.visualDesign.complete}/${deliverableStats.visualDesign.total}`);
    this.setTextContent('stat-content', `${deliverableStats.content.complete}/${deliverableStats.content.total}`);
    this.setTextContent('stat-development', `${deliverableStats.development.complete}/${deliverableStats.development.total}`);

    // Update progress bars if they exist
    this.updateProgressBar('progress-wireframes', deliverableStats.wireframe);
    this.updateProgressBar('progress-designs', deliverableStats.visualDesign);
    this.updateProgressBar('progress-content', deliverableStats.content);
    this.updateProgressBar('progress-development', deliverableStats.development);
  }

  private calculateDeliverableStats(pages: SitemapPage[]): Record<string, { total: number; complete: number; inProgress: number; pending: number; review: number }> {
    const stats = {
      wireframe: { total: 0, complete: 0, inProgress: 0, pending: 0, review: 0 },
      visualDesign: { total: 0, complete: 0, inProgress: 0, pending: 0, review: 0 },
      content: { total: 0, complete: 0, inProgress: 0, pending: 0, review: 0 },
      development: { total: 0, complete: 0, inProgress: 0, pending: 0, review: 0 }
    };

    pages.forEach(page => {
      // Count pages that have deliverables tracking
      if (page.deliverables) {
        // Wireframe
        if (page.deliverables.wireframe) {
          stats.wireframe.total++;
          const status = page.deliverables.wireframe.status;
          if (status === 'complete') stats.wireframe.complete++;
          else if (status === 'in-progress') stats.wireframe.inProgress++;
          else if (status === 'review') stats.wireframe.review++;
          else if (status === 'pending') stats.wireframe.pending++;
        }

        // Visual Design
        if (page.deliverables.visualDesign) {
          stats.visualDesign.total++;
          const status = page.deliverables.visualDesign.status;
          if (status === 'complete') stats.visualDesign.complete++;
          else if (status === 'in-progress') stats.visualDesign.inProgress++;
          else if (status === 'review') stats.visualDesign.review++;
          else if (status === 'pending') stats.visualDesign.pending++;
        }

        // Content
        if (page.deliverables.content) {
          stats.content.total++;
          const status = page.deliverables.content.status;
          if (status === 'complete') stats.content.complete++;
          else if (status === 'in-progress') stats.content.inProgress++;
          else if (status === 'review') stats.content.review++;
          else if (status === 'pending') stats.content.pending++;
        }

        // Development
        if (page.deliverables.development) {
          stats.development.total++;
          const status = page.deliverables.development.status;
          if (status === 'complete') stats.development.complete++;
          else if (status === 'in-progress') stats.development.inProgress++;
          else if (status === 'review') stats.development.review++;
          else if (status === 'pending') stats.development.pending++;
        }
      }
    });

    return stats;
  }

  private updateProgressBar(elementId: string, stats: { total: number; complete: number; inProgress: number; review: number }): void {
    const el = document.getElementById(elementId);
    if (!el || stats.total === 0) return;

    const completePercent = (stats.complete / stats.total) * 100;
    const reviewPercent = (stats.review / stats.total) * 100;
    const inProgressPercent = (stats.inProgress / stats.total) * 100;

    el.innerHTML = `
      <div class="h-2 bg-neutral-200 rounded-full overflow-hidden flex">
        <div class="bg-green-500 h-full" style="width: ${completePercent}%"></div>
        <div class="bg-yellow-500 h-full" style="width: ${reviewPercent}%"></div>
        <div class="bg-blue-500 h-full" style="width: ${inProgressPercent}%"></div>
      </div>
    `;
  }

  private renderTreeView(): void {
    const container = document.getElementById('tree-container');
    if (!container || !this.sitemapData) return;

    const treeHtml = this.buildTreeHtml(this.sitemapData.pages, 0);
    container.innerHTML = `<div class="sitemap-tree">${treeHtml}</div>`;

    // Add event listeners to tree nodes
    container.querySelectorAll('.tree-node').forEach(node => {
      const nodeEl = node as HTMLElement;
      const pageId = nodeEl.dataset.pageId;
      
      nodeEl.querySelector('.tree-node-content')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pageId) this.selectPage(pageId);
      });

      nodeEl.querySelector('.tree-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pageId) this.toggleNode(pageId);
      });
    });
  }

  private buildTreeHtml(pages: SitemapPage[], depth: number): string {
    // Apply filters
    const filteredPages = this.filterPages(pages);
    
    return filteredPages.map(page => {
      const hasChildren = page.children && page.children.length > 0;
      const isExpanded = this.expandedNodes.has(page.id);
      const isSelected = this.selectedPageId === page.id;
      const title = page.title[this.currentLanguage] || page.title['en'] || page.id;
      const navClass = this.getNavClass(page);
      const deliverableBadges = this.getDeliverableBadgesHtml(page);

      return `
        <div class="tree-node ${isSelected ? 'selected' : ''}" data-page-id="${page.id}" data-depth="${depth}">
          <div class="tree-node-content depth-${Math.min(depth, 3)}">
            ${hasChildren ? `
              <button class="tree-toggle ${isExpanded ? 'expanded' : ''}">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ` : '<span class="tree-toggle-placeholder"></span>'}
            <span class="tree-node-indicator ${navClass}"></span>
            <span class="tree-node-title">${this.escapeHtml(title)}</span>
            <span class="tree-node-slug text-neutral-400 text-xs ml-2">${page.slug}</span>
            <div class="deliverable-badges ml-2 flex items-center gap-1">
              ${deliverableBadges}
            </div>
            <span class="status-badge status-${page.status} ml-auto">${page.status}</span>
          </div>
          ${hasChildren && isExpanded ? `
            <div class="tree-children">
              ${this.buildTreeHtml(page.children, depth + 1)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  private filterPages(pages: SitemapPage[]): SitemapPage[] {
    if (this.deliverableFilter === 'all' && this.statusFilter === 'all') {
      return pages;
    }

    return pages.filter(page => {
      // Check deliverable filter
      if (this.deliverableFilter !== 'all' && page.deliverables) {
        const deliverable = page.deliverables[this.deliverableFilter as keyof Deliverables];
        if (!deliverable) return false;
        
        // If status filter is also set, check both
        if (this.statusFilter !== 'all') {
          return deliverable.status === this.statusFilter;
        }
      }

      // Check status filter only
      if (this.statusFilter !== 'all' && this.deliverableFilter === 'all') {
        // Filter by overall page status
        return page.status === this.statusFilter;
      }

      return true;
    });
  }

  private getDeliverableBadgesHtml(page: SitemapPage): string {
    if (!page.deliverables) return '';

    const badges: string[] = [];
    const deliverableTypes = [
      { key: 'wireframe', label: 'W', title: 'Wireframe' },
      { key: 'visualDesign', label: 'V', title: 'Visual Design' },
      { key: 'content', label: 'C', title: 'Content' },
      { key: 'development', label: 'D', title: 'Development' }
    ];

    deliverableTypes.forEach(({ key, label, title }) => {
      const deliverable = page.deliverables?.[key as keyof Deliverables];
      if (deliverable) {
        const statusColor = this.getDeliverableStatusColor(deliverable.status);
        const hasVariants = key === 'visualDesign' && (deliverable as VisualDesignDeliverable).variants?.length;
        const variantIndicator = hasVariants ? `<span class="variant-dot"></span>` : '';
        badges.push(`
          <span class="deliverable-badge ${statusColor}" title="${title}: ${deliverable.status}${hasVariants ? ' (has variants)' : ''}">
            ${label}${variantIndicator}
          </span>
        `);
      }
    });

    return badges.join('');
  }

  private getDeliverableStatusColor(status: DeliverableStatus): string {
    switch (status) {
      case 'complete': return 'deliverable-complete';
      case 'in-progress': return 'deliverable-in-progress';
      case 'review': return 'deliverable-review';
      case 'pending': return 'deliverable-pending';
      case 'skipped': return 'deliverable-skipped';
      default: return 'deliverable-pending';
    }
  }

  private renderCardsView(): void {
    const container = document.getElementById('cards-container');
    if (!container || !this.sitemapData) return;

    const allPages = this.flattenPages(this.sitemapData.pages);
    
    const cardsHtml = allPages.map(page => {
      const title = page.title[this.currentLanguage] || page.title['en'] || page.id;
      const description = page.description?.[this.currentLanguage] || page.description?.['en'] || '';
      const navClass = this.getNavClass(page);
      const isSelected = this.selectedPageId === page.id;

      return `
        <div class="page-card ${isSelected ? 'selected' : ''}" data-page-id="${page.id}">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${navClass.replace('nav-', 'bg-')}"></span>
              <h4 class="font-semibold text-neutral-900">${this.escapeHtml(title)}</h4>
            </div>
            <span class="status-badge status-${page.status}">${page.status}</span>
          </div>
          <p class="text-sm text-neutral-500 mb-3">${page.slug}</p>
          ${description ? `<p class="text-sm text-neutral-600 mb-3">${this.escapeHtml(description)}</p>` : ''}
          <div class="flex items-center gap-2 text-xs text-neutral-400">
            <span class="bg-neutral-100 px-2 py-1 rounded">${page.template}</span>
            ${page.children.length > 0 ? `<span>${page.children.length} children</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="page-cards-grid">${cardsHtml}</div>`;

    // Add click handlers
    container.querySelectorAll('.page-card').forEach(card => {
      card.addEventListener('click', () => {
        const pageId = (card as HTMLElement).dataset.pageId;
        if (pageId) this.selectPage(pageId);
      });
    });
  }

  private renderNavView(): void {
    const container = document.getElementById('nav-container');
    if (!container || !this.navigationData || !this.sitemapData) return;

    const primaryNav = this.navigationData.primary;
    const secondaryNav = this.navigationData.secondary;

    const html = `
      <!-- Primary Navigation -->
      <div class="nav-section mb-8">
        <h4 class="font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-teal-500"></span>
          ${primaryNav.name[this.currentLanguage] || primaryNav.name['en']}
        </h4>
        <div class="bg-neutral-50 rounded-xl p-4">
          <div class="flex flex-wrap items-center gap-2">
            ${primaryNav.items.map(item => {
              const page = this.findPageById(item.pageId);
              const label = item.label[this.currentLanguage] || item.label['en'];
              return `
                <div class="nav-item-preview ${item.dropdown ? 'has-dropdown' : ''}" data-page-id="${item.pageId}">
                  <span>${this.escapeHtml(label)}</span>
                  ${item.dropdown ? `
                    <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  ` : ''}
                </div>
              `;
            }).join('')}
            ${primaryNav.cta ? `
              <div class="nav-cta-preview">
                ${primaryNav.cta.label[this.currentLanguage] || primaryNav.cta.label['en']}
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Secondary/Footer Navigation -->
      <div class="nav-section">
        <h4 class="font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          ${secondaryNav.name[this.currentLanguage] || secondaryNav.name['en']}
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-neutral-50 rounded-xl p-6">
          ${secondaryNav.sections.map(section => `
            <div class="footer-section-preview">
              <h5 class="font-semibold text-neutral-900 mb-3">${section.title[this.currentLanguage] || section.title['en']}</h5>
              <ul class="space-y-2">
                ${section.pageIds.map(pageId => {
                  const page = this.findPageById(pageId);
                  const title = page?.title[this.currentLanguage] || page?.title['en'] || pageId;
                  return `<li class="text-sm text-neutral-600 hover:text-teal-600 cursor-pointer" data-page-id="${pageId}">${this.escapeHtml(title)}</li>`;
                }).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Social Links Preview -->
      ${secondaryNav.social.length > 0 ? `
        <div class="nav-section mt-6">
          <h4 class="font-medium text-neutral-700 mb-3">Social Links</h4>
          <div class="flex items-center gap-4">
            ${secondaryNav.social.map(social => `
              <span class="text-sm text-neutral-500">${social.platform}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    container.innerHTML = html;

    // Add click handlers for nav items
    container.querySelectorAll('[data-page-id]').forEach(item => {
      item.addEventListener('click', () => {
        const pageId = (item as HTMLElement).dataset.pageId;
        if (pageId) this.selectPage(pageId);
      });
    });
  }

  private renderEditView(): void {
    const container = document.getElementById('edit-container');
    if (!container || !this.sitemapData) return;

    const html = `
      <div class="edit-toolbar mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button id="btn-add-page" class="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Page
          </button>
        </div>
        <div class="text-sm text-neutral-500">
          Drag pages to reorder or change parent
        </div>
      </div>
      
      <div class="edit-tree">
        ${this.buildEditableTreeHtml(this.sitemapData.pages, 0)}
      </div>

      <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-semibold text-yellow-800">Note</p>
            <p class="text-yellow-700 text-sm">Changes made here are stored in your browser's local storage. Use the Export function to save your sitemap for use in WordPress.</p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Add event listeners
    document.getElementById('btn-add-page')?.addEventListener('click', () => this.openAddPageModal());

    container.querySelectorAll('.edit-node').forEach(node => {
      const nodeEl = node as HTMLElement;
      const pageId = nodeEl.dataset.pageId;

      nodeEl.querySelector('.btn-edit-page')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pageId) this.openEditPageModal(pageId);
      });
    });
  }

  private buildEditableTreeHtml(pages: SitemapPage[], depth: number): string {
    return pages.map(page => {
      const hasChildren = page.children && page.children.length > 0;
      const title = page.title[this.currentLanguage] || page.title['en'] || page.id;

      return `
        <div class="edit-node" data-page-id="${page.id}" data-depth="${depth}">
          <div class="edit-node-content depth-${Math.min(depth, 3)}">
            <span class="drag-handle cursor-move text-neutral-400 hover:text-neutral-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
              </svg>
            </span>
            <span class="edit-node-title flex-1">${this.escapeHtml(title)}</span>
            <span class="text-xs text-neutral-400">${page.slug}</span>
            <button class="btn-edit-page p-1 text-neutral-400 hover:text-teal-600 rounded transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          ${hasChildren ? `
            <div class="edit-children ml-6">
              ${this.buildEditableTreeHtml(page.children, depth + 1)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  private selectPage(pageId: string): void {
    this.selectedPageId = pageId;
    
    // Update UI
    document.querySelectorAll('.tree-node, .page-card').forEach(el => {
      el.classList.toggle('selected', (el as HTMLElement).dataset.pageId === pageId);
    });

    this.showPageDetails(pageId);
  }

  private showPageDetails(pageId: string): void {
    const container = document.getElementById('details-content');
    if (!container) return;

    const page = this.findPageById(pageId);
    if (!page) {
      container.innerHTML = '<p class="text-neutral-400">Page not found</p>';
      return;
    }

    const title = page.title[this.currentLanguage] || page.title['en'] || page.id;
    const description = page.description?.[this.currentLanguage] || page.description?.['en'] || '';
    const seoTitle = page.seoTitle?.[this.currentLanguage] || page.seoTitle?.['en'] || '';
    const navClass = this.getNavClass(page);
    const deliverablesHtml = this.renderDeliverablesSection(page);

    const html = `
      <div class="space-y-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="w-3 h-3 rounded-full ${navClass.replace('nav-', 'bg-')}"></span>
            <h4 class="text-xl font-bold text-neutral-900">${this.escapeHtml(title)}</h4>
          </div>
          <p class="text-sm text-neutral-500">${page.slug}</p>
        </div>

        ${description ? `
          <div>
            <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Description</h5>
            <p class="text-sm text-neutral-700">${this.escapeHtml(description)}</p>
          </div>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Template</h5>
            <p class="text-sm text-neutral-900">${page.template}</p>
          </div>
          <div>
            <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Status</h5>
            <span class="status-badge status-${page.status}">${page.status}</span>
          </div>
        </div>

        <!-- Deliverables Section -->
        ${deliverablesHtml}

        <div>
          <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-2">Navigation</h5>
          <div class="space-y-1 text-sm">
            <div class="flex items-center gap-2">
              ${page.inPrimaryNav ? 
                '<span class="w-2 h-2 rounded-full bg-teal-500"></span><span>Primary Nav</span>' + 
                (page.navOrder ? `<span class="text-neutral-400">(#${page.navOrder})</span>` : '') :
                '<span class="w-2 h-2 rounded-full bg-neutral-200"></span><span class="text-neutral-400">Not in Primary</span>'
              }
            </div>
            <div class="flex items-center gap-2">
              ${page.inSecondaryNav ?
                '<span class="w-2 h-2 rounded-full bg-blue-500"></span><span>Secondary Nav</span>' :
                '<span class="w-2 h-2 rounded-full bg-neutral-200"></span><span class="text-neutral-400">Not in Secondary</span>'
              }
            </div>
            <div class="flex items-center gap-2">
              ${page.inFooterNav ?
                '<span class="w-2 h-2 rounded-full bg-purple-500"></span><span>Footer Nav</span>' :
                '<span class="w-2 h-2 rounded-full bg-neutral-200"></span><span class="text-neutral-400">Not in Footer</span>'
              }
            </div>
          </div>
        </div>

        ${page.children.length > 0 ? `
          <div>
            <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-2">Children (${page.children.length})</h5>
            <ul class="space-y-1">
              ${page.children.map(child => {
                const childTitle = child.title[this.currentLanguage] || child.title['en'] || child.id;
                return `<li class="text-sm text-neutral-700 cursor-pointer hover:text-teal-600" data-page-id="${child.id}">${this.escapeHtml(childTitle)}</li>`;
              }).join('')}
            </ul>
          </div>
        ` : ''}

        ${seoTitle ? `
          <div>
            <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-1">SEO Title</h5>
            <p class="text-sm text-neutral-700">${this.escapeHtml(seoTitle)}</p>
          </div>
        ` : ''}

        <div class="pt-4 border-t border-neutral-200">
          <button class="btn-edit-selected w-full px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
            Edit Page
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Add click handlers for children
    container.querySelectorAll('[data-page-id]').forEach(el => {
      el.addEventListener('click', () => {
        const childId = (el as HTMLElement).dataset.pageId;
        if (childId) this.selectPage(childId);
      });
    });

    // Edit button
    container.querySelector('.btn-edit-selected')?.addEventListener('click', () => {
      this.openEditPageModal(pageId);
    });
  }

  private renderDeliverablesSection(page: SitemapPage): string {
    if (!page.deliverables) {
      return `
        <div>
          <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-2">Deliverables</h5>
          <p class="text-sm text-neutral-400 italic">No deliverables tracking for this page</p>
        </div>
      `;
    }

    const deliverables = page.deliverables;
    const items = [
      { key: 'wireframe', label: 'Wireframe', icon: '📐' },
      { key: 'visualDesign', label: 'Visual Design', icon: '🎨' },
      { key: 'content', label: 'Content', icon: '📝' },
      { key: 'development', label: 'Development', icon: '💻' }
    ];

    const rows = items.map(({ key, label, icon }) => {
      const deliverable = deliverables[key as keyof Deliverables];
      if (!deliverable) {
        return `
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-neutral-600">${icon} ${label}</span>
            <span class="text-xs text-neutral-400">—</span>
          </div>
        `;
      }

      const statusBadge = `<span class="deliverable-status-badge status-${deliverable.status}">${deliverable.status}</span>`;
      
      // Check for variants in visual design
      let variantInfo = '';
      if (key === 'visualDesign') {
        const vd = deliverable as VisualDesignDeliverable;
        if (vd.variants && vd.variants.length > 0) {
          variantInfo = `
            <div class="text-xs text-neutral-500 mt-1">
              Variants: ${vd.variants.join(', ')}
              ${vd.selectedVariant ? `<span class="text-green-600 ml-1">(Selected: ${vd.selectedVariant})</span>` : '<span class="text-yellow-600 ml-1">(Pending selection)</span>'}
            </div>
          `;
        }
      }

      return `
        <div class="py-2 border-b border-neutral-100 last:border-0">
          <div class="flex items-center justify-between">
            <span class="text-sm text-neutral-600">${icon} ${label}</span>
            ${statusBadge}
          </div>
          ${variantInfo}
        </div>
      `;
    }).join('');

    return `
      <div>
        <h5 class="text-xs font-semibold text-neutral-500 uppercase mb-2">Deliverables Progress</h5>
        <div class="bg-neutral-50 rounded-lg p-3">
          ${rows}
        </div>
      </div>
    `;
  }

  private toggleNode(pageId: string): void {
    if (this.expandedNodes.has(pageId)) {
      this.expandedNodes.delete(pageId);
    } else {
      this.expandedNodes.add(pageId);
    }
    this.renderTreeView();
  }

  private expandAll(): void {
    if (!this.sitemapData) return;
    const allPages = this.flattenPages(this.sitemapData.pages);
    allPages.forEach(page => {
      if (page.children.length > 0) {
        this.expandedNodes.add(page.id);
      }
    });
    this.renderTreeView();
  }

  private collapseAll(): void {
    this.expandedNodes.clear();
    this.renderTreeView();
  }

  private openAddPageModal(): void {
    const modal = document.getElementById('page-modal');
    const form = document.getElementById('page-form') as HTMLFormElement;
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('btn-delete-page');

    if (!modal || !form) return;

    // Reset form
    form.reset();
    (document.getElementById('page-id') as HTMLInputElement).value = '';
    (document.getElementById('page-slug') as HTMLInputElement).dataset.manual = '';
    
    // Set title
    if (title) title.textContent = 'Add New Page';
    
    // Hide delete button
    deleteBtn?.classList.add('hidden');

    // Populate parent dropdown
    this.populateParentDropdown();

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  private openEditPageModal(pageId: string): void {
    const page = this.findPageById(pageId);
    if (!page) return;

    const modal = document.getElementById('page-modal');
    const form = document.getElementById('page-form') as HTMLFormElement;
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('btn-delete-page');

    if (!modal || !form) return;

    // Set title
    if (title) title.textContent = 'Edit Page';

    // Show delete button
    deleteBtn?.classList.remove('hidden');

    // Populate parent dropdown
    this.populateParentDropdown(pageId);

    // Fill form with page data
    (document.getElementById('page-id') as HTMLInputElement).value = page.id;
    (document.getElementById('page-title-en') as HTMLInputElement).value = page.title['en'] || '';
    (document.getElementById('page-title-es') as HTMLInputElement).value = page.title['es'] || '';
    (document.getElementById('page-slug') as HTMLInputElement).value = page.slug;
    (document.getElementById('page-slug') as HTMLInputElement).dataset.manual = 'true';
    (document.getElementById('page-template') as HTMLSelectElement).value = page.template;
    (document.getElementById('page-status') as HTMLSelectElement).value = page.status;
    (document.getElementById('page-primary-nav') as HTMLInputElement).checked = page.inPrimaryNav || false;
    (document.getElementById('page-secondary-nav') as HTMLInputElement).checked = page.inSecondaryNav || false;
    (document.getElementById('page-footer-nav') as HTMLInputElement).checked = page.inFooterNav || false;
    (document.getElementById('page-nav-order') as HTMLInputElement).value = page.navOrder?.toString() || '';
    (document.getElementById('page-description-en') as HTMLTextAreaElement).value = page.description?.['en'] || '';

    // Show/hide nav order
    const navOrderContainer = document.getElementById('nav-order-container');
    navOrderContainer?.classList.toggle('hidden', !page.inPrimaryNav);

    // Find and set parent
    const parent = this.findParentOfPage(pageId);
    (document.getElementById('page-parent') as HTMLSelectElement).value = parent?.id || '';

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  private closeModal(): void {
    const modal = document.getElementById('page-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  private populateParentDropdown(excludeId?: string): void {
    const select = document.getElementById('page-parent') as HTMLSelectElement;
    if (!select || !this.sitemapData) return;

    const options = ['<option value="">None (Top Level)</option>'];
    
    const addOptions = (pages: SitemapPage[], depth: number = 0) => {
      pages.forEach(page => {
        if (page.id !== excludeId) {
          const indent = '—'.repeat(depth);
          const title = page.title[this.currentLanguage] || page.title['en'] || page.id;
          options.push(`<option value="${page.id}">${indent} ${this.escapeHtml(title)}</option>`);
          if (page.children.length > 0) {
            addOptions(page.children, depth + 1);
          }
        }
      });
    };

    addOptions(this.sitemapData.pages);
    select.innerHTML = options.join('');
  }

  private handleFormSubmit(e: Event): void {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const pageId = formData.get('id') as string;
    const isNew = !pageId;

    const pageData: SitemapPage = {
      id: pageId || this.generateSlug(formData.get('title_en') as string),
      slug: formData.get('slug') as string,
      title: {
        en: formData.get('title_en') as string,
        es: formData.get('title_es') as string || ''
      },
      description: {
        en: formData.get('description_en') as string || '',
        es: ''
      },
      template: formData.get('template') as string,
      status: formData.get('status') as SitemapPage['status'],
      inPrimaryNav: formData.has('inPrimaryNav'),
      inSecondaryNav: formData.has('inSecondaryNav'),
      inFooterNav: formData.has('inFooterNav'),
      navOrder: formData.get('navOrder') ? parseInt(formData.get('navOrder') as string) : undefined,
      children: []
    };

    const parentId = formData.get('parent') as string;

    if (isNew) {
      this.addPage(pageData, parentId);
    } else {
      this.updatePage(pageId, pageData, parentId);
    }

    this.closeModal();
    this.saveToLocalStorage();
    this.renderStats();
    this.renderView('edit');
    this.showToast(isNew ? 'Page added successfully' : 'Page updated successfully');
  }

  private handleDeletePage(): void {
    const pageId = (document.getElementById('page-id') as HTMLInputElement).value;
    if (!pageId) return;

    if (confirm('Are you sure you want to delete this page? This will also delete all child pages.')) {
      this.deletePage(pageId);
      this.closeModal();
      this.saveToLocalStorage();
      this.renderStats();
      this.renderView('edit');
      this.selectedPageId = null;
      this.showPageDetails('');
      this.showToast('Page deleted');
    }
  }

  private addPage(page: SitemapPage, parentId?: string): void {
    if (!this.sitemapData) return;

    if (parentId) {
      const parent = this.findPageById(parentId);
      if (parent) {
        parent.children.push(page);
      }
    } else {
      this.sitemapData.pages.push(page);
    }
  }

  private updatePage(pageId: string, pageData: SitemapPage, newParentId?: string): void {
    if (!this.sitemapData) return;

    const currentParent = this.findParentOfPage(pageId);
    const page = this.findPageById(pageId);
    
    if (!page) return;

    // Preserve children
    pageData.children = page.children;

    // Check if parent changed
    const currentParentId = currentParent?.id || '';
    
    if (currentParentId !== newParentId) {
      // Remove from current location
      this.deletePage(pageId, false);
      
      // Add to new location
      if (newParentId) {
        const newParent = this.findPageById(newParentId);
        if (newParent) {
          newParent.children.push(pageData);
        }
      } else {
        this.sitemapData.pages.push(pageData);
      }
    } else {
      // Update in place
      Object.assign(page, pageData);
    }
  }

  private deletePage(pageId: string, deleteChildren: boolean = true): void {
    if (!this.sitemapData) return;

    const deleteFromArray = (pages: SitemapPage[]): boolean => {
      const index = pages.findIndex(p => p.id === pageId);
      if (index !== -1) {
        pages.splice(index, 1);
        return true;
      }
      for (const page of pages) {
        if (deleteFromArray(page.children)) {
          return true;
        }
      }
      return false;
    };

    deleteFromArray(this.sitemapData.pages);
  }

  private handleExport(format: string): void {
    if (!this.sitemapData) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'wp-cli':
        content = this.generateWpCliExport();
        filename = 'wp-cli-commands.sh';
        mimeType = 'text/plain';
        break;
      case 'xml':
        content = this.generateXmlExport();
        filename = 'wordpress-import.xml';
        mimeType = 'application/xml';
        break;
      case 'json':
        content = this.generateJsonExport();
        filename = 'sitemap-api.json';
        mimeType = 'application/json';
        break;
      case 'guide':
        content = this.generateGuideExport();
        filename = 'implementation-guide.md';
        mimeType = 'text/markdown';
        break;
      default:
        return;
    }

    this.downloadFile(content, filename, mimeType);
    this.showToast(`Exported as ${filename}`);
  }

  private generateWpCliExport(): string {
    if (!this.sitemapData || !this.navigationData) return '';

    const lines: string[] = [
      '#!/bin/bash',
      '# WordPress CLI Commands - Generated from Sitemap Portal',
      `# Generated: ${new Date().toISOString()}`,
      '',
      '# ============================================',
      '# CREATE PAGES',
      '# ============================================',
      ''
    ];

    const processPages = (pages: SitemapPage[], parentVar: string = '') => {
      pages.forEach((page, index) => {
        const varName = page.id.replace(/-/g, '_').toUpperCase();
        const title = page.title['en'] || page.id;
        const parentFlag = parentVar ? ` --post_parent=$${parentVar}` : '';
        
        lines.push(`# Create: ${title}`);
        lines.push(`${varName}=$(wp post create --post_type=page --post_title="${title}" --post_name="${page.slug.replace(/^\//, '')}" --post_status=draft${parentFlag} --porcelain)`);
        lines.push(`echo "Created page: ${title} (ID: $${varName})"`);
        lines.push('');

        if (page.children.length > 0) {
          processPages(page.children, varName);
        }
      });
    };

    processPages(this.sitemapData.pages);

    // Add menu creation
    lines.push('# ============================================');
    lines.push('# CREATE NAVIGATION MENUS');
    lines.push('# ============================================');
    lines.push('');
    lines.push('# Create Primary Navigation');
    lines.push('wp menu create "Primary Navigation"');
    lines.push('');

    this.navigationData.primary.items.forEach((item, index) => {
      const page = this.findPageById(item.pageId);
      if (page) {
        const varName = page.id.replace(/-/g, '_').toUpperCase();
        const label = item.label['en'] || page.title['en'];
        lines.push(`wp menu item add-post "Primary Navigation" $${varName} --title="${label}" --position=${index + 1}`);
      }
    });

    lines.push('');
    lines.push('# Assign menu to theme location');
    lines.push('wp menu location assign "Primary Navigation" primary');
    lines.push('');
    lines.push('echo "Setup complete!"');

    return lines.join('\n');
  }

  private generateXmlExport(): string {
    if (!this.sitemapData) return '';

    const allPages = this.flattenPages(this.sitemapData.pages);
    const now = new Date().toISOString();

    let items = '';
    allPages.forEach((page, index) => {
      const title = page.title['en'] || page.id;
      const slug = page.slug.replace(/^\//, '') || page.id;
      
      items += `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>/${slug}</link>
      <pubDate>${now}</pubDate>
      <wp:post_id>${index + 1}</wp:post_id>
      <wp:post_date>${now}</wp:post_date>
      <wp:post_name>${slug}</wp:post_name>
      <wp:status>draft</wp:status>
      <wp:post_type>page</wp:post_type>
    </item>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:wp="http://wordpress.org/export/1.2/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Sitemap Export</title>
    <link>/</link>
    <description>WordPress pages export from Sitemap Portal</description>
    <pubDate>${now}</pubDate>
    <wp:wxr_version>1.2</wp:wxr_version>
    ${items}
  </channel>
</rss>`;
  }

  private generateJsonExport(): string {
    if (!this.sitemapData || !this.navigationData) return '';

    const allPages = this.flattenPages(this.sitemapData.pages);

    const exportData = {
      generated: new Date().toISOString(),
      pages: allPages.map(page => ({
        title: page.title['en'] || page.id,
        slug: page.slug.replace(/^\//, ''),
        status: 'draft',
        template: page.template,
        meta: {
          _sitemap_id: page.id,
          _sitemap_status: page.status
        }
      })),
      menus: {
        primary: {
          name: 'Primary Navigation',
          items: this.navigationData.primary.items.map((item, index) => ({
            title: item.label['en'],
            page_slug: this.findPageById(item.pageId)?.slug.replace(/^\//, '') || '',
            order: index + 1
          }))
        }
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  private generateGuideExport(): string {
    if (!this.sitemapData || !this.navigationData) return '';

    const allPages = this.flattenPages(this.sitemapData.pages);
    const now = new Date().toLocaleDateString();

    let pageList = '';
    const renderPageList = (pages: SitemapPage[], depth: number = 0) => {
      pages.forEach(page => {
        const indent = '  '.repeat(depth);
        const title = page.title['en'] || page.id;
        const navIndicators: string[] = [];
        if (page.inPrimaryNav) navIndicators.push('Primary Nav');
        if (page.inSecondaryNav) navIndicators.push('Secondary Nav');
        if (page.inFooterNav) navIndicators.push('Footer');
        
        pageList += `${indent}- **${title}** (${page.slug})\n`;
        pageList += `${indent}  - Template: ${page.template}\n`;
        pageList += `${indent}  - Status: ${page.status}\n`;
        if (navIndicators.length) {
          pageList += `${indent}  - Navigation: ${navIndicators.join(', ')}\n`;
        }
        pageList += '\n';

        if (page.children.length > 0) {
          renderPageList(page.children, depth + 1);
        }
      });
    };

    renderPageList(this.sitemapData.pages);

    return `# Website Implementation Guide

Generated: ${now}

## Overview

- **Total Pages:** ${allPages.length}
- **Languages:** ${this.sitemapData.languages.join(', ')}
- **Max Depth:** ${this.getMaxDepth(this.sitemapData.pages)} levels

## Page Structure

${pageList}

## Primary Navigation

${this.navigationData.primary.items.map((item, i) => {
  const page = this.findPageById(item.pageId);
  return `${i + 1}. ${item.label['en']} → ${page?.slug || '#'}`;
}).join('\n')}

## Footer Navigation

${this.navigationData.secondary.sections.map(section => {
  const links = section.pageIds.map(id => {
    const page = this.findPageById(id);
    return `  - ${page?.title['en'] || id}`;
  }).join('\n');
  return `### ${section.title['en']}\n${links}`;
}).join('\n\n')}

## WordPress Setup Instructions

1. **Create Pages**
   - Create each page listed above in WordPress
   - Set the page template as specified
   - Maintain parent-child relationships for nested pages

2. **Setup Navigation**
   - Create a new menu called "Primary Navigation"
   - Add the primary nav pages in the order specified
   - Assign to your theme's primary menu location

3. **Footer Menu**
   - Create footer widget areas for each section
   - Add navigation menus or text widgets with the specified links

4. **Multilingual Setup** (if applicable)
   - Install WPML or Polylang
   - Create translated versions of each page
   - Configure language switcher

---

*This guide was generated from the Sitemap Portal*
`;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private saveToLocalStorage(): void {
    if (this.sitemapData) {
      localStorage.setItem('sitemap-data', JSON.stringify(this.sitemapData));
    }
    if (this.navigationData) {
      localStorage.setItem('navigation-data', JSON.stringify(this.navigationData));
    }
  }

  private showToast(message: string): void {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.remove('hidden');
      
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }
  }

  private updateFooterStats(): void {
    if (!this.sitemapData) return;
    
    const allPages = this.flattenPages(this.sitemapData.pages);
    this.setTextContent('page-count', allPages.length.toString());
    this.setTextContent('lang-count', this.sitemapData.languages.length.toString());
  }

  // Utility methods
  private flattenPages(pages: SitemapPage[]): SitemapPage[] {
    const result: SitemapPage[] = [];
    const flatten = (items: SitemapPage[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(pages);
    return result;
  }

  private findPageById(id: string): SitemapPage | null {
    if (!this.sitemapData) return null;
    
    const find = (pages: SitemapPage[]): SitemapPage | null => {
      for (const page of pages) {
        if (page.id === id) return page;
        if (page.children.length > 0) {
          const found = find(page.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return find(this.sitemapData.pages);
  }

  private findParentOfPage(pageId: string): SitemapPage | null {
    if (!this.sitemapData) return null;

    const find = (pages: SitemapPage[], parent: SitemapPage | null): SitemapPage | null => {
      for (const page of pages) {
        if (page.id === pageId) return parent;
        if (page.children.length > 0) {
          const found = find(page.children, page);
          if (found !== undefined) return found;
        }
      }
      return undefined as unknown as SitemapPage | null;
    };

    return find(this.sitemapData.pages, null);
  }

  private getMaxDepth(pages: SitemapPage[], currentDepth: number = 1): number {
    let maxDepth = currentDepth;
    pages.forEach(page => {
      if (page.children.length > 0) {
        const childDepth = this.getMaxDepth(page.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    return maxDepth;
  }

  private getNavClass(page: SitemapPage): string {
    if (page.inPrimaryNav && page.inSecondaryNav) return 'nav-both';
    if (page.inPrimaryNav) return 'nav-primary';
    if (page.inSecondaryNav) return 'nav-secondary';
    return 'nav-none';
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private setTextContent(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  private setDeliverableFilter(filter: DeliverableFilter): void {
    this.deliverableFilter = filter;
    this.renderView('tree');
    this.updateFilterBadge();
  }

  private setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
    this.renderView('tree');
    this.updateFilterBadge();
  }

  private updateFilterBadge(): void {
    const badge = document.getElementById('filter-badge');
    if (!badge) return;

    const hasFilter = this.deliverableFilter !== 'all' || this.statusFilter !== 'all';
    badge.classList.toggle('hidden', !hasFilter);
    
    if (hasFilter) {
      const parts: string[] = [];
      if (this.deliverableFilter !== 'all') parts.push(this.deliverableFilter);
      if (this.statusFilter !== 'all') parts.push(this.statusFilter);
      badge.textContent = parts.join(', ');
    }
  }

  private clearFilters(): void {
    this.deliverableFilter = 'all';
    this.statusFilter = 'all';
    
    const deliverableSelect = document.getElementById('filter-deliverable') as HTMLSelectElement;
    const statusSelect = document.getElementById('filter-status') as HTMLSelectElement;
    
    if (deliverableSelect) deliverableSelect.value = 'all';
    if (statusSelect) statusSelect.value = 'all';
    
    this.updateFilterBadge();
    this.renderView('tree');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new SitemapPortal();
});
