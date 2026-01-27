// Design System / Style Guide Interactive Features

class StyleGuide {
  private toast: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.toast = document.getElementById('copy-toast');
    this.setupCopyHandlers();
    this.setupAnimationDemos();
  }

  private setupCopyHandlers() {
    // Color swatches - copy hex value
    document.querySelectorAll('.color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const hex = swatch.getAttribute('data-color');
        if (hex) {
          this.copyToClipboard(hex);
        }
      });
    });

    // Token values - copy the data-value or text content
    document.querySelectorAll('.token-value').forEach((token) => {
      token.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = token.getAttribute('data-value') || token.textContent;
        if (value) {
          this.copyToClipboard(value.trim());
        }
      });
    });
  }

  private setupAnimationDemos() {
    // Trigger animations on load for demo boxes
    document.querySelectorAll('.animation-demo').forEach((demo) => {
      const animation = demo.getAttribute('data-animation');
      if (animation) {
        demo.classList.add(`animate-${animation}`);
      }
    });
  }

  private copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showToast();
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          this.showToast();
        } catch {
          // Silent fail
        }
        document.body.removeChild(textarea);
      });
  }

  private showToast() {
    if (!this.toast) return;

    this.toast.classList.add('show');

    setTimeout(() => {
      this.toast?.classList.remove('show');
    }, 2000);
  }

  private setupSearchAndFilter() {
    // Search input handler
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.filterSections();
      });
    }

    // Filter button handlers
    if (this.filterButtons) {
      this.filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const filter = button.getAttribute('data-filter') || 'all';
          this.activeFilter = filter;
          
          // Update active state
          this.filterButtons?.forEach((btn) => btn.classList.remove('active'));
          button.classList.add('active');
          
          this.filterSections();
        });
      });
    }
  }

  private filterSections() {
    const searchTerm = this.searchInput?.value.toLowerCase() || '';
    const sectionCards = document.querySelectorAll('.section-preview-card');

    sectionCards.forEach((card) => {
      const name = card.getAttribute('data-section-name')?.toLowerCase() || '';
      const category = card.getAttribute('data-category') || '';
      const widgets = card.getAttribute('data-widgets')?.toLowerCase() || '';

      const matchesSearch = 
        name.includes(searchTerm) || 
        widgets.includes(searchTerm) ||
        category.includes(searchTerm);
      
      const matchesFilter = 
        this.activeFilter === 'all' || 
        category === this.activeFilter;

      if (matchesSearch && matchesFilter) {
        (card as HTMLElement).style.display = '';
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });
  }

  private renderSectionBrowser() {
    const container = document.getElementById('section-browser-container');
    if (!container) return;

    const html = this.sections.map(section => `
      <div class="section-preview-card" data-section-name="${section.name}" data-category="${section.category}" data-widgets="${section.widgets.join(', ').toLowerCase()}">
        <div class="section-preview-header">
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getCategoryColor(section.category)}">${section.category}</span>
            <h3 class="font-semibold text-neutral-900">${section.name} Section</h3>
          </div>
          <a href="${section.link}" class="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
            View Live
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
        <div class="section-preview-body">
          <p class="text-sm text-neutral-600 mb-3">${section.description}</p>
          <div class="flex flex-wrap gap-2">
            ${section.widgets.map(w => `<span class="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">${w}</span>`).join('')}
          </div>
        </div>
        <div class="section-preview-footer">
          <button class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 copy-section-code" data-section="${section.name}">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Copy Code
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;

    // Setup copy handlers for new buttons
    container.querySelectorAll('.copy-section-code').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sectionName = btn.getAttribute('data-section');
        if (sectionName) {
          this.copyToClipboard(`data-section="${sectionName}"`);
        }
      });
    });
  }

  private getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'hero': 'bg-blue-100 text-blue-700',
      'content': 'bg-green-100 text-green-700',
      'social-proof': 'bg-yellow-100 text-yellow-700',
      'conversion': 'bg-purple-100 text-purple-700',
      'navigation': 'bg-neutral-100 text-neutral-700'
    };
    return colors[category] || 'bg-neutral-100 text-neutral-700';
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new StyleGuide());
} else {
  new StyleGuide();
}
