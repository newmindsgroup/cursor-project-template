// Content Presentation Page - Interactive content viewer with language switching

interface ContentData {
  meta?: {
    title?: string;
    description?: string;
    language?: string;
    status?: string;
    lastUpdated?: string;
  };
  storybrand?: {
    character?: { identity?: string; want?: string };
    problem?: { villain?: string; external?: string; internal?: string; philosophical?: string };
    guide?: { empathy?: string; authority?: string };
    plan?: { steps?: Array<{ number?: number; title?: string; description?: string }> };
    callToAction?: { direct?: { text?: string }; transitional?: { text?: string } };
    failure?: { stakes?: string };
    success?: { transformation?: string; outcomes?: string[] };
  };
  hero?: {
    headline?: string;
    subheadline?: string;
    primaryCta?: { text?: string };
    secondaryCta?: { text?: string };
  };
  features?: {
    sectionTitle?: string;
    sectionSubtitle?: string;
    items?: Array<{ icon?: string; title?: string; description?: string }>;
  };
  stats?: {
    items?: Array<{ value?: string; label?: string; suffix?: string }>;
  };
  testimonials?: {
    sectionTitle?: string;
    items?: Array<{ quote?: string; author?: string; role?: string; company?: string; rating?: number }>;
  };
  faq?: {
    sectionTitle?: string;
    items?: Array<{ question?: string; answer?: string }>;
  };
  cta?: {
    headline?: string;
    subheadline?: string;
    buttonText?: string;
  };
  contact?: {
    sectionTitle?: string;
    sectionSubtitle?: string;
    formLabels?: Record<string, string>;
    contactInfo?: Array<{ icon?: string; label?: string; value?: string }>;
  };
  footer?: {
    tagline?: string;
    copyright?: string;
  };
}

class ContentPresentation {
  private currentLanguage = 'en';
  private compareMode = false;
  private contentCache: Record<string, Record<string, ContentData>> = {};
  private availableLanguages = ['en', 'es'];
  private availablePages = ['home', 'about', 'services', 'contact'];

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadContent();
    this.setupEventListeners();
    this.renderContent();
    this.renderPageNav();
  }

  private async loadContent() {
    for (const lang of this.availableLanguages) {
      this.contentCache[lang] = {};
      for (const page of this.availablePages) {
        try {
          const response = await fetch(`../../content/${lang}/${page}.json`);
          if (response.ok) {
            this.contentCache[lang][page] = await response.json();
          }
        } catch {
          // Content not available
        }
      }
    }
  }

  private setupEventListeners() {
    // Language selector
    const langSelector = document.getElementById('language-selector') as HTMLSelectElement;
    if (langSelector) {
      langSelector.value = this.currentLanguage;
      langSelector.addEventListener('change', (e) => {
        this.currentLanguage = (e.target as HTMLSelectElement).value;
        this.renderContent();
      });
    }

    // Compare toggle
    const compareBtn = document.getElementById('toggle-compare');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        this.compareMode = !this.compareMode;
        this.toggleCompareView();
      });
    }

    // Export buttons
    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => this.exportCSV());
    }

    const jsonBtn = document.getElementById('export-json-btn');
    if (jsonBtn) {
      jsonBtn.addEventListener('click', () => this.exportJSON());
    }
  }

  private renderPageNav() {
    const nav = document.getElementById('page-nav');
    if (!nav) return;

    nav.innerHTML = this.availablePages
      .map(
        (page, i) => `
      <button class="section-nav-btn ${i === 0 ? 'active' : ''}" data-page="${page}">
        ${page.charAt(0).toUpperCase() + page.slice(1)}
      </button>
    `
      )
      .join('');

    nav.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        nav.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.scrollToPage(btn.getAttribute('data-page') || '');
      });
    });
  }

  private scrollToPage(page: string) {
    const section = document.getElementById(`page-${page}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private renderContent() {
    const container = document.getElementById('content-container');
    if (!container) return;

    const content = this.contentCache[this.currentLanguage];
    if (!content || Object.keys(content).length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <p class="text-neutral-500">No content available for ${this.currentLanguage.toUpperCase()}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.availablePages
      .filter((page) => content[page])
      .map((page) => this.renderPageContent(page, content[page]))
      .join('');
  }

  private renderPageContent(pageName: string, data: ContentData): string {
    const status = data.meta?.status || 'draft';

    return `
      <section id="page-${pageName}" class="content-page-section scroll-mt-24">
        <div class="content-page-header">
          <div>
            <h2 class="text-xl font-bold text-neutral-900">${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page</h2>
            <p class="text-sm text-neutral-500">${data.meta?.title || 'Untitled'}</p>
          </div>
          <span class="status-badge ${status}">${status}</span>
        </div>
        <div class="content-page-body space-y-8">
          ${this.renderMetaSection(data)}
          ${this.renderStoryBrandSection(data)}
          ${this.renderHeroSection(data)}
          ${this.renderFeaturesSection(data)}
          ${this.renderStatsSection(data)}
          ${this.renderTestimonialsSection(data)}
          ${this.renderFaqSection(data)}
          ${this.renderCtaSection(data)}
          ${this.renderContactSection(data)}
        </div>
      </section>
    `;
  }

  private renderMetaSection(data: ContentData): string {
    if (!data.meta) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">SEO / Meta</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="content-item">
            <div class="content-item-label">Page Title</div>
            <div class="content-item-value">${data.meta.title || ''}</div>
            ${this.renderCharCount(data.meta.title || '', 60)}
          </div>
          <div class="content-item">
            <div class="content-item-label">Meta Description</div>
            <div class="content-item-value text-sm">${data.meta.description || ''}</div>
            ${this.renderCharCount(data.meta.description || '', 160)}
          </div>
        </div>
      </div>
    `;
  }

  private renderStoryBrandSection(data: ContentData): string {
    if (!data.storybrand) return '';

    const sb = data.storybrand;
    const elements: string[] = [];

    if (sb.character) {
      elements.push(`
        <div class="storybrand-element">
          <div class="storybrand-label">Character (Customer)</div>
          <div class="storybrand-value">
            <p><strong>Identity:</strong> ${sb.character.identity || 'Not defined'}</p>
            <p><strong>Want:</strong> ${sb.character.want || 'Not defined'}</p>
          </div>
        </div>
      `);
    }

    if (sb.problem) {
      elements.push(`
        <div class="storybrand-element">
          <div class="storybrand-label">Problem</div>
          <div class="storybrand-value space-y-1">
            <p><strong>Villain:</strong> ${sb.problem.villain || ''}</p>
            <p><strong>External:</strong> ${sb.problem.external || ''}</p>
            <p><strong>Internal:</strong> ${sb.problem.internal || ''}</p>
            <p><strong>Philosophical:</strong> ${sb.problem.philosophical || ''}</p>
          </div>
        </div>
      `);
    }

    if (sb.guide) {
      elements.push(`
        <div class="storybrand-element">
          <div class="storybrand-label">Guide (Brand)</div>
          <div class="storybrand-value">
            <p><strong>Empathy:</strong> ${sb.guide.empathy || ''}</p>
            <p><strong>Authority:</strong> ${sb.guide.authority || ''}</p>
          </div>
        </div>
      `);
    }

    if (sb.success) {
      elements.push(`
        <div class="storybrand-element">
          <div class="storybrand-label">Success</div>
          <div class="storybrand-value">
            <p><strong>Transformation:</strong> ${sb.success.transformation || ''}</p>
            ${sb.success.outcomes?.length ? `<p><strong>Outcomes:</strong> ${sb.success.outcomes.join(', ')}</p>` : ''}
          </div>
        </div>
      `);
    }

    if (elements.length === 0) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">StoryBrand Framework</h3>
        <div class="grid md:grid-cols-2 gap-4">
          ${elements.join('')}
        </div>
      </div>
    `;
  }

  private renderHeroSection(data: ContentData): string {
    if (!data.hero) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">Hero Section</h3>
        <div class="space-y-4">
          <div class="content-item">
            <div class="content-item-label">Headline</div>
            <div class="content-item-value headline">${data.hero.headline || ''}</div>
            ${this.renderCharCount(data.hero.headline || '', 80)}
          </div>
          <div class="content-item">
            <div class="content-item-label">Subheadline</div>
            <div class="content-item-value subheadline">${data.hero.subheadline || ''}</div>
            ${this.renderCharCount(data.hero.subheadline || '', 200)}
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="content-item">
              <div class="content-item-label">Primary CTA</div>
              <div class="content-item-value font-semibold text-primary-600">${data.hero.primaryCta?.text || ''}</div>
            </div>
            <div class="content-item">
              <div class="content-item-label">Secondary CTA</div>
              <div class="content-item-value">${data.hero.secondaryCta?.text || ''}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderFeaturesSection(data: ContentData): string {
    if (!data.features?.items?.length) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">Features Section</h3>
        <div class="mb-4">
          <div class="content-item-label">Section Title</div>
          <div class="content-item-value font-semibold">${data.features.sectionTitle || ''}</div>
        </div>
        <table class="content-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${data.features.items
              .map(
                (item) => `
              <tr>
                <td>${item.icon || ''}</td>
                <td class="font-medium">${item.title || ''}</td>
                <td class="text-neutral-600">${item.description || ''}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderStatsSection(data: ContentData): string {
    if (!data.stats?.items?.length) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">Stats Section</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${data.stats.items
            .map(
              (item) => `
            <div class="text-center p-4 bg-neutral-50 rounded-lg">
              <div class="text-2xl font-bold text-primary-600">${item.value}${item.suffix || ''}</div>
              <div class="text-sm text-neutral-600">${item.label}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private renderTestimonialsSection(data: ContentData): string {
    if (!data.testimonials?.items?.length) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">Testimonials</h3>
        <div class="grid md:grid-cols-2 gap-4">
          ${data.testimonials.items
            .map(
              (item) => `
            <div class="testimonial-card">
              <div class="testimonial-quote">"${item.quote}"</div>
              <div class="testimonial-author">${item.author}</div>
              <div class="testimonial-role">${item.role}, ${item.company}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private renderFaqSection(data: ContentData): string {
    if (!data.faq?.items?.length) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">FAQ</h3>
        <div class="space-y-3">
          ${data.faq.items
            .map(
              (item) => `
            <div class="faq-item">
              <div class="faq-question">${item.question}</div>
              <div class="faq-answer">${item.answer}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private renderCtaSection(data: ContentData): string {
    if (!data.cta) return '';

    return `
      <div class="border-b border-neutral-100 pb-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">CTA Section</h3>
        <div class="space-y-2">
          <div class="content-item">
            <div class="content-item-label">Headline</div>
            <div class="content-item-value font-semibold">${data.cta.headline || ''}</div>
          </div>
          <div class="content-item">
            <div class="content-item-label">Subheadline</div>
            <div class="content-item-value text-neutral-600">${data.cta.subheadline || ''}</div>
          </div>
          <div class="content-item">
            <div class="content-item-label">Button Text</div>
            <div class="content-item-value text-primary-600 font-semibold">${data.cta.buttonText || ''}</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderContactSection(data: ContentData): string {
    if (!data.contact) return '';

    return `
      <div>
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">Contact Section</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <div class="content-item-label">Section Title</div>
            <div class="content-item-value font-semibold">${data.contact.sectionTitle || ''}</div>
            <div class="content-item-value text-sm text-neutral-600 mt-1">${data.contact.sectionSubtitle || ''}</div>
          </div>
          ${
            data.contact.formLabels
              ? `
            <div>
              <div class="content-item-label">Form Labels</div>
              <div class="text-sm space-y-1">
                ${Object.entries(data.contact.formLabels)
                  .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  private renderCharCount(text: string, limit: number): string {
    const len = text.length;
    let statusClass = '';
    if (len > limit) statusClass = 'danger';
    else if (len > limit * 0.9) statusClass = 'warning';

    return `<div class="char-count ${statusClass}">${len}/${limit} characters</div>`;
  }

  private toggleCompareView() {
    const singleView = document.getElementById('content-container');
    const compareView = document.getElementById('compare-container');
    const btn = document.getElementById('toggle-compare');

    if (this.compareMode) {
      singleView?.classList.add('hidden');
      compareView?.classList.remove('hidden');
      if (btn) btn.textContent = 'Single View';
      this.renderCompareView();
    } else {
      singleView?.classList.remove('hidden');
      compareView?.classList.add('hidden');
      if (btn) btn.textContent = 'Compare Languages';
    }
  }

  private renderCompareView() {
    // Simple comparison - show both languages side by side
    const leftContainer = document.getElementById('compare-left');
    const rightContainer = document.getElementById('compare-right');
    const leftLabel = document.getElementById('compare-left-lang');
    const rightLabel = document.getElementById('compare-right-lang');

    if (!leftContainer || !rightContainer) return;

    const lang1 = 'en';
    const lang2 = 'es';

    if (leftLabel) leftLabel.textContent = 'English (EN)';
    if (rightLabel) rightLabel.textContent = 'Spanish (ES)';

    leftContainer.innerHTML = this.renderCompareContent(lang1);
    rightContainer.innerHTML = this.renderCompareContent(lang2);
  }

  private renderCompareContent(lang: string): string {
    const content = this.contentCache[lang];
    if (!content) return '<p class="text-neutral-500">No content</p>';

    return this.availablePages
      .filter((page) => content[page])
      .map((page) => {
        const data = content[page];
        return `
        <div class="compare-item">
          <div class="compare-item-label">${page} - Headline</div>
          <div class="compare-item-value font-semibold">${data.hero?.headline || ''}</div>
        </div>
        <div class="compare-item">
          <div class="compare-item-label">${page} - Subheadline</div>
          <div class="compare-item-value text-sm">${data.hero?.subheadline || ''}</div>
        </div>
      `;
      })
      .join('');
  }

  private exportCSV() {
    const content = this.contentCache[this.currentLanguage];
    if (!content) return;

    // Simple CSV export of current language
    const rows = ['section,key,value'];

    for (const page of this.availablePages) {
      const data = content[page];
      if (!data) continue;

      if (data.meta?.title) rows.push(`${page},meta.title,"${data.meta.title}"`);
      if (data.hero?.headline) rows.push(`${page},hero.headline,"${data.hero.headline}"`);
      if (data.hero?.subheadline) rows.push(`${page},hero.subheadline,"${data.hero.subheadline}"`);
      if (data.cta?.headline) rows.push(`${page},cta.headline,"${data.cta.headline}"`);
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${this.currentLanguage}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('CSV exported');
  }

  private exportJSON() {
    const content = this.contentCache[this.currentLanguage];
    if (!content) return;

    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${this.currentLanguage}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('JSON exported');
  }

  private showToast(message: string) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContentPresentation());
} else {
  new ContentPresentation();
}
