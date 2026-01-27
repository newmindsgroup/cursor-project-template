/**
 * Handoff Portal - Interactive functionality
 * Powers the page index, QA checklist, and screenshot gallery
 */

// QA Checklist data structure
const qaChecklistData = {
  typography: {
    title: 'Typography',
    icon: 'A',
    items: [
      { id: 'typo-family', label: 'Font families match (heading + body)' },
      { id: 'typo-sizes', label: 'Font sizes correct at all breakpoints' },
      { id: 'typo-weights', label: 'Font weights match (bold, semibold, regular)' },
      { id: 'typo-line-height', label: 'Line heights match prototype' },
      { id: 'typo-letter-spacing', label: 'Letter spacing correct (if specified)' },
    ],
  },
  spacing: {
    title: 'Spacing',
    icon: '↔',
    items: [
      { id: 'space-padding', label: 'Section padding matches at all breakpoints' },
      { id: 'space-margins', label: 'Margins between elements correct' },
      { id: 'space-gaps', label: 'Flex/grid gaps match prototype' },
      { id: 'space-container', label: 'Container max-width correct (1280px)' },
    ],
  },
  colors: {
    title: 'Colors',
    icon: '◐',
    items: [
      { id: 'color-primary', label: 'Primary colors match tokens' },
      { id: 'color-secondary', label: 'Secondary colors match tokens' },
      { id: 'color-neutrals', label: 'Neutral grays correct' },
      { id: 'color-backgrounds', label: 'Background colors/gradients match' },
      { id: 'color-borders', label: 'Border colors correct' },
    ],
  },
  responsive: {
    title: 'Responsive',
    icon: '📱',
    items: [
      { id: 'resp-desktop', label: 'Desktop layout matches (1440px+)' },
      { id: 'resp-tablet', label: 'Tablet layout matches (768px)' },
      { id: 'resp-mobile', label: 'Mobile layout matches (375px)' },
      { id: 'resp-breakpoints', label: 'Breakpoint transitions smooth' },
    ],
  },
  interactions: {
    title: 'Hover/Focus States',
    icon: '👆',
    items: [
      { id: 'int-btn-hover', label: 'Button hover states implemented' },
      { id: 'int-link-hover', label: 'Link hover states implemented' },
      { id: 'int-card-hover', label: 'Card hover effects (lift/shadow)' },
      { id: 'int-focus', label: 'Focus rings visible on all interactive elements' },
    ],
  },
  animations: {
    title: 'Animations',
    icon: '✨',
    items: [
      { id: 'anim-scroll', label: 'Scroll animations match prototype' },
      { id: 'anim-transitions', label: 'Transition durations correct (300ms default)' },
      { id: 'anim-reduced', label: 'Respects prefers-reduced-motion' },
    ],
  },
  accessibility: {
    title: 'Accessibility',
    icon: '♿',
    items: [
      { id: 'a11y-semantic', label: 'Semantic HTML used (nav, main, section, etc.)' },
      { id: 'a11y-headings', label: 'Heading hierarchy correct (h1 → h2 → h3)' },
      { id: 'a11y-alt', label: 'Alt text on all images' },
      { id: 'a11y-keyboard', label: 'Keyboard navigation works' },
      { id: 'a11y-contrast', label: 'Color contrast meets WCAG AA' },
      { id: 'a11y-labels', label: 'Form labels associated with inputs' },
    ],
  },
  performance: {
    title: 'Performance',
    icon: '⚡',
    items: [
      { id: 'perf-images', label: 'Images optimized (WebP, correct sizes)' },
      { id: 'perf-lazy', label: 'Lazy loading enabled for images' },
      { id: 'perf-fonts', label: 'Fonts loaded efficiently' },
      { id: 'perf-cls', label: 'No layout shift (CLS)' },
    ],
  },
};

// Storage keys
const STORAGE_KEY_QA = 'handoff-qa-checklist';

class HandoffPortal {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadPageIndex();
    this.renderQAChecklist();
    await this.loadScreenshots();
    this.setupLightbox();
    this.setupQAExport();
  }

  // Load and render page index from generated JSON
  async loadPageIndex() {
    const container = document.getElementById('page-index-content');
    if (!container) return;

    try {
      const response = await fetch('page-index.json');
      if (!response.ok) {
        throw new Error('Page index not found');
      }
      const data = await response.json();
      this.renderPageIndex(container, data);
    } catch (error) {
      // Fallback: show static page list if JSON not available
      container.innerHTML = this.renderFallbackPageIndex();
    }
  }

  renderPageIndex(container: HTMLElement, data: { pages: Array<PageData> }) {
    if (!data.pages || data.pages.length === 0) {
      container.innerHTML = '<p class="text-neutral-500">No pages found.</p>';
      return;
    }

    const html = data.pages
      .map(
        (page) => `
      <div class="page-card">
        <div class="page-card-title">
          <span>${page.name}</span>
          <a href="${page.overlayUrl}" class="page-card-link" target="_blank">
            Open with Overlay →
          </a>
        </div>
        <div class="section-list">
          ${
            page.sections && page.sections.length > 0
              ? page.sections
                  .map(
                    (section) => `
                <div class="section-item">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="section-item-name">${section.name}</div>
                      ${section.widgets && section.widgets.length > 0 ? `<div class="section-item-widgets">Widgets: ${section.widgets.join(', ')}</div>` : ''}
                    </div>
                    <a href="${page.overlayUrl}#${section.id}" class="section-item-link" target="_blank">
                      View Section
                    </a>
                  </div>
                </div>
              `
                  )
                  .join('')
              : '<p class="text-neutral-500 text-sm">No sections detected</p>'
          }
        </div>
      </div>
    `
      )
      .join('');

    container.innerHTML = html;
  }

  renderFallbackPageIndex(): string {
    // Static fallback if JSON not generated yet
    const pages = [
      { name: 'Home', path: '../index.html' },
      { name: 'About', path: '../about.html' },
      { name: 'Services', path: '../services.html' },
      { name: 'Contact', path: '../contact.html' },
    ];

    return pages
      .map(
        (page) => `
      <div class="page-card">
        <div class="page-card-title">
          <span>${page.name}</span>
          <a href="${page.path}?spec=1" class="page-card-link" target="_blank">
            Open with Overlay →
          </a>
        </div>
        <p class="text-neutral-500 text-sm">Run <code>npm run handoff:bundle</code> to generate section index.</p>
      </div>
    `
      )
      .join('');
  }

  // Render QA checklist
  renderQAChecklist() {
    const container = document.getElementById('qa-checklist-content');
    if (!container) return;

    const saved = this.loadQAState();

    const html = Object.entries(qaChecklistData)
      .map(
        ([key, category]) => `
      <div class="qa-category" data-category="${key}">
        <h3 class="qa-category-title">
          <span class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
            ${category.icon}
          </span>
          ${category.title}
        </h3>
        <div class="space-y-1">
          ${category.items
            .map(
              (item) => `
            <div class="qa-item">
              <label>
                <input type="checkbox" id="${item.id}" ${saved[item.id] ? 'checked' : ''} />
                <span>${item.label}</span>
              </label>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('');

    container.innerHTML = html;

    // Add event listeners
    container.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => this.saveQAState());
    });

    this.updateQAProgress();
  }

  loadQAState(): Record<string, boolean> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QA);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveQAState() {
    const state: Record<string, boolean> = {};
    document.querySelectorAll('#qa-checklist-content input[type="checkbox"]').forEach((checkbox) => {
      const input = checkbox as HTMLInputElement;
      state[input.id] = input.checked;
    });
    try {
      localStorage.setItem(STORAGE_KEY_QA, JSON.stringify(state));
    } catch {
      // localStorage may be unavailable in private browsing mode
    }
    this.updateQAProgress();
  }

  updateQAProgress() {
    const checkboxes = document.querySelectorAll('#qa-checklist-content input[type="checkbox"]');
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter((cb) => (cb as HTMLInputElement).checked).length;

    const progressEl = document.getElementById('qa-progress');
    if (progressEl) {
      progressEl.textContent = `${checked}/${total} complete`;
    }
  }

  setupQAExport() {
    const exportBtn = document.getElementById('qa-export-btn');
    const resetBtn = document.getElementById('qa-reset-btn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportQA());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetQA());
    }
  }

  exportQA() {
    const state = this.loadQAState();
    const timestamp = new Date().toISOString();

    // Build CSV content
    let csv = 'Category,Item,Status\n';
    Object.entries(qaChecklistData).forEach(([, category]) => {
      category.items.forEach((item) => {
        csv += `"${category.title}","${item.label}","${state[item.id] ? 'Complete' : 'Pending'}"\n`;
      });
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-checklist-${timestamp.split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  resetQA() {
    if (confirm('Are you sure you want to reset the QA checklist? This cannot be undone.')) {
      try {
        localStorage.removeItem(STORAGE_KEY_QA);
      } catch {
        // localStorage may be unavailable in private browsing mode
      }
      this.renderQAChecklist();
    }
  }

  // Load screenshots gallery
  async loadScreenshots() {
    const container = document.getElementById('screenshots-gallery');
    if (!container) return;

    try {
      const response = await fetch('screenshots/manifest.json');
      if (!response.ok) {
        throw new Error('Screenshots manifest not found');
      }
      const data = await response.json();
      this.renderScreenshots(container, data.screenshots);
    } catch {
      // Show placeholder if screenshots not generated
      container.innerHTML = `
        <div class="col-span-full text-center py-8 text-neutral-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Screenshots will appear here after running <code>npm run handoff:bundle</code></p>
        </div>
      `;
    }
  }

  renderScreenshots(container: HTMLElement, screenshots: Array<ScreenshotData>) {
    if (!screenshots || screenshots.length === 0) {
      container.innerHTML = '<p class="text-neutral-500">No screenshots available.</p>';
      return;
    }

    const html = screenshots
      .map(
        (shot) => `
      <div class="screenshot-card" data-src="screenshots/${shot.file}">
        <img src="screenshots/${shot.file}" alt="${shot.page} - ${shot.viewport}" loading="lazy" />
        <div class="screenshot-card-label">${shot.page} (${shot.viewport})</div>
      </div>
    `
      )
      .join('');

    container.innerHTML = html;

    // Add click handlers for lightbox
    container.querySelectorAll('.screenshot-card').forEach((card) => {
      card.addEventListener('click', () => {
        const src = card.getAttribute('data-src');
        if (src) this.openLightbox(src);
      });
    });
  }

  // Lightbox functionality
  setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');

    if (lightbox && closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLightbox());
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) this.closeLightbox();
      });

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeLightbox();
      });
    }
  }

  openLightbox(src: string) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img') as HTMLImageElement;

    if (lightbox && img) {
      img.src = src;
      lightbox.classList.remove('hidden');
      lightbox.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');

    if (lightbox) {
      lightbox.classList.add('hidden');
      lightbox.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }
}

// Type definitions
interface PageData {
  name: string;
  file: string;
  path: string;
  overlayUrl: string;
  sections: Array<SectionData>;
}

interface SectionData {
  id: string;
  name: string;
  widgets: string[];
  anchorId?: string;
}

interface ScreenshotData {
  file: string;
  page: string;
  viewport: string;
}

// Initialize portal
new HandoffPortal();
