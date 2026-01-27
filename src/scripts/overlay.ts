// Handoff Overlay System - Enhanced with Spec Cards and URL params

interface SectionData {
  name: string;
  id: string;
  notes: string;
  widgets: string;
  tokens: Record<string, string>;
  styles: ComputedStyleData;
  responsiveStyles?: Record<Breakpoint, ComputedStyleData>;
  element: HTMLElement;
}

type Breakpoint = 'desktop' | 'tablet' | 'mobile';

interface BreakpointConfig {
  width: number;
  label: string;
}

interface ComputedStyleData {
  display: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: string;
  boxShadow?: string;
}

class HandoffOverlay {
  private isActive: boolean = false;
  private overlayElements: HTMLElement[] = [];
  private toggleButton: HTMLElement | null = null;
  private breakpointToggle: HTMLElement | null = null;
  private activeSpecCard: HTMLElement | null = null;
  private sectionCounter: number = 0;
  private currentBreakpoint: Breakpoint = 'desktop';

  private readonly breakpoints: Record<Breakpoint, BreakpointConfig> = {
    desktop: { width: 1920, label: 'Desktop' },
    tablet: { width: 768, label: 'Tablet' },
    mobile: { width: 375, label: 'Mobile' }
  };

  constructor() {
    this.init();
  }

  private init() {
    // Check URL params first - ?spec=1 enables overlay automatically
    const urlParams = new URLSearchParams(window.location.search);
    const specMode = urlParams.get('spec') === '1';

    // Check localStorage for saved state (URL param overrides)
    let savedState: string | null = null;
    try {
      savedState = localStorage.getItem('handoff-overlay-active');
    } catch {
      // localStorage may be unavailable in private browsing mode
    }
    this.isActive = specMode || savedState === 'true';

    this.createToggleButton();
    this.createBreakpointToggle();
    this.setupKeyboardShortcut();
    this.injectStyles();

    if (this.isActive) {
      this.show();
    }

    // Re-initialize when sections load
    window.addEventListener('sections-loaded', () => {
      if (this.isActive) {
        this.show();
      }
      // Handle hash scroll after sections loaded
      this.handleHashScroll();
    });

    // Handle hash scroll on initial load
    this.handleHashScroll();

    // Close spec card when clicking outside
    document.addEventListener('click', (e) => {
      if (this.activeSpecCard && !this.activeSpecCard.contains(e.target as Node)) {
        const button = (e.target as HTMLElement).closest('[data-spec-button]');
        if (!button) {
          this.closeSpecCard();
        }
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeSpecCard) {
        this.closeSpecCard();
      }
    });
  }

  private injectStyles() {
    if (document.getElementById('handoff-overlay-styles')) return;

    const style = document.createElement('style');
    style.id = 'handoff-overlay-styles';
    style.textContent = `
      .handoff-overlay-wrapper {
        position: absolute;
        inset: 0;
        pointer-events: none;
        border: 2px solid #8b5cf6;
        border-radius: 0.5rem;
        z-index: 9998;
      }
      
      .handoff-section-label {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: #8b5cf6;
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 0.25rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        pointer-events: auto;
        z-index: 9999;
      }
      
      .handoff-spec-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.5rem 1rem;
        background: white;
        color: #8b5cf6;
        font-size: 0.75rem;
        font-weight: 600;
        border: 2px solid #8b5cf6;
        border-radius: 0.375rem;
        cursor: pointer;
        pointer-events: auto;
        z-index: 9999;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      
      .handoff-spec-button:hover {
        background: #8b5cf6;
        color: white;
      }
      
      .handoff-spec-card {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        z-index: 10001;
        overflow: hidden;
        pointer-events: auto;
      }
      
      .handoff-spec-card-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
      }
      
      .handoff-spec-card-header {
        padding: 1.5rem;
        background: #8b5cf6;
        color: white;
      }
      
      .handoff-spec-card-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
      }
      
      .handoff-spec-card-header p {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        opacity: 0.9;
      }
      
      .handoff-spec-card-body {
        padding: 1.5rem;
        overflow-y: auto;
        max-height: calc(80vh - 200px);
      }
      
      .handoff-spec-card-section {
        margin-bottom: 1.5rem;
      }
      
      .handoff-spec-card-section h4 {
        margin: 0 0 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .handoff-spec-card-section .spec-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e5e5;
        font-size: 0.875rem;
      }
      
      .handoff-spec-card-section .spec-item:last-child {
        border-bottom: none;
      }
      
      .handoff-spec-card-section .spec-label {
        color: #6b7280;
      }
      
      .handoff-spec-card-section .spec-value {
        color: #111827;
        font-weight: 500;
        font-family: monospace;
      }
      
      .handoff-spec-card-footer {
        padding: 1rem 1.5rem;
        background: #f9fafb;
        border-top: 1px solid #e5e5e5;
        display: flex;
        gap: 0.75rem;
      }
      
      .handoff-spec-card-footer button {
        flex: 1;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
      
      .handoff-spec-card-footer .btn-primary {
        background: #8b5cf6;
        color: white;
        border: none;
      }
      
      .handoff-spec-card-footer .btn-primary:hover {
        background: #7c3aed;
      }
      
      .handoff-spec-card-footer .btn-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      
      .handoff-spec-card-footer .btn-secondary:hover {
        background: #f3f4f6;
      }
      
      .handoff-close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 2rem;
        height: 2rem;
        border-radius: 0.375rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .handoff-close-button:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .handoff-widget-tag {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: #ddd6fe;
        color: #5b21b6;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 0.25rem;
        margin: 0.125rem;
      }

      /* Breakpoint Toggle Styles */
      #handoff-breakpoint-toggle {
        border: 2px solid #e5e7eb;
      }

      #handoff-breakpoint-toggle .breakpoint-btn {
        padding: 0.625rem 0.75rem;
        background: white;
        border: none;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #handoff-breakpoint-toggle .breakpoint-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }

      #handoff-breakpoint-toggle .breakpoint-btn.active {
        background: #8b5cf6;
        color: white;
      }

      #handoff-breakpoint-toggle .breakpoint-btn:not(:last-of-type) {
        border-right: 1px solid #e5e7eb;
      }

      #handoff-breakpoint-toggle .breakpoint-label {
        padding: 0.625rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: #374151;
        background: #f9fafb;
        font-family: monospace;
        min-width: 60px;
        text-align: center;
      }

      /* Responsive indicator in spec card */
      .handoff-responsive-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: #f3f4f6;
        border-radius: 0.375rem;
        margin-bottom: 0.75rem;
        font-size: 0.75rem;
        color: #6b7280;
      }

      .handoff-responsive-indicator .bp-active {
        font-weight: 600;
        color: #8b5cf6;
      }

      @media print {
        .handoff-overlay-wrapper,
        .handoff-spec-button,
        .handoff-section-label,
        #handoff-overlay-toggle,
        #handoff-breakpoint-toggle {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private handleHashScroll() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    // Try to find element by ID or data-section
    setTimeout(() => {
      let target = document.getElementById(hash);
      if (!target) {
        target = document.querySelector(`[data-section="${hash}"]`) as HTMLElement;
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  private createToggleButton() {
    const root = document.getElementById('handoff-overlay-root');
    if (!root) return;

    const button = document.createElement('button');
    button.id = 'handoff-overlay-toggle';
    button.className =
      'fixed bottom-6 right-6 z-50 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-large hover:bg-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2';
    button.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span class="handoff-toggle-text">${this.isActive ? 'Hide' : 'Show'} Overlay</span>
      </div>
    `;

    button.addEventListener('click', () => this.toggle());
    root.appendChild(button);
    this.toggleButton = button;
  }

  private createBreakpointToggle() {
    const root = document.getElementById('handoff-overlay-root');
    if (!root) return;

    const toggle = document.createElement('div');
    toggle.id = 'handoff-breakpoint-toggle';
    toggle.className = 'fixed bottom-6 right-48 z-50 bg-white rounded-lg shadow-large overflow-hidden flex';
    toggle.style.display = this.isActive ? 'flex' : 'none';

    toggle.innerHTML = `
      <button class="breakpoint-btn active" data-breakpoint="desktop" title="Desktop (1920px)">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
      <button class="breakpoint-btn" data-breakpoint="tablet" title="Tablet (768px)">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
      <button class="breakpoint-btn" data-breakpoint="mobile" title="Mobile (375px)">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
      <span class="breakpoint-label">1920px</span>
    `;

    // Event listeners for breakpoint buttons
    toggle.querySelectorAll('.breakpoint-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const breakpoint = (e.currentTarget as HTMLElement).dataset.breakpoint as Breakpoint;
        this.setBreakpoint(breakpoint);
      });
    });

    root.appendChild(toggle);
    this.breakpointToggle = toggle;
  }

  private setBreakpoint(breakpoint: Breakpoint) {
    this.currentBreakpoint = breakpoint;
    const config = this.breakpoints[breakpoint];

    // Update active button
    this.breakpointToggle?.querySelectorAll('.breakpoint-btn').forEach(btn => {
      const bp = (btn as HTMLElement).dataset.breakpoint;
      btn.classList.toggle('active', bp === breakpoint);
    });

    // Update label
    const label = this.breakpointToggle?.querySelector('.breakpoint-label');
    if (label) label.textContent = `${config.width}px`;

    // Apply viewport resize to simulate breakpoint
    const body = document.body;
    const html = document.documentElement;
    
    if (breakpoint === 'desktop') {
      // Reset to full width
      body.style.maxWidth = '';
      body.style.margin = '';
      body.style.boxShadow = '';
      html.style.backgroundColor = '';
    } else {
      // Constrain viewport to breakpoint width
      body.style.maxWidth = `${config.width}px`;
      body.style.margin = '0 auto';
      body.style.boxShadow = '0 0 30px rgba(0,0,0,0.15)';
      html.style.backgroundColor = '#f3f4f6';
    }

    // Refresh overlay to show breakpoint-specific specs
    if (this.isActive) {
      this.show();
    }
  }

  private setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Shift + H
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private toggle() {
    this.isActive = !this.isActive;
    try {
      localStorage.setItem('handoff-overlay-active', String(this.isActive));
    } catch {
      // localStorage may be unavailable in private browsing mode
    }

    if (this.isActive) {
      this.show();
    } else {
      this.hide();
    }

    // Update button text
    const buttonText = this.toggleButton?.querySelector('.handoff-toggle-text');
    if (buttonText) {
      buttonText.textContent = this.isActive ? 'Hide Overlay' : 'Show Overlay';
    }

    // Show/hide breakpoint toggle
    if (this.breakpointToggle) {
      this.breakpointToggle.style.display = this.isActive ? 'flex' : 'none';
    }
  }

  private show() {
    this.hide(); // Clear existing overlays first
    this.sectionCounter = 0;

    const sections = document.querySelectorAll('[data-section]');

    sections.forEach((section) => {
      const sectionEl = section as HTMLElement;
      this.sectionCounter++;
      const sectionData = this.extractSectionData(sectionEl);

      // Create overlay wrapper
      const overlay = document.createElement('div');
      overlay.className = 'handoff-overlay-wrapper';
      overlay.id = `handoff-overlay-${sectionData.id}`;

      // Create label
      const label = document.createElement('div');
      label.className = 'handoff-section-label';
      label.textContent = sectionData.name;

      // Create spec button
      const specButton = document.createElement('button');
      specButton.className = 'handoff-spec-button';
      specButton.setAttribute('data-spec-button', sectionData.id);
      specButton.innerHTML = `
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Spec
      `;
      specButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showSpecCard(sectionData);
      });

      // Position overlay relative to section
      if (getComputedStyle(sectionEl).position === 'static') {
        sectionEl.style.position = 'relative';
      }

      // Set ID on section for linking
      if (!sectionEl.id) {
        sectionEl.id = sectionData.id;
      }

      overlay.appendChild(label);
      overlay.appendChild(specButton);
      sectionEl.appendChild(overlay);

      this.overlayElements.push(overlay);
    });
  }

  private hide() {
    this.overlayElements.forEach((el) => el.remove());
    this.overlayElements = [];
    this.closeSpecCard();
  }

  private extractSectionData(section: HTMLElement): SectionData {
    const computed = window.getComputedStyle(section);
    const name = section.dataset.section || 'Unknown';
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${String(this.sectionCounter).padStart(3, '0')}`;

    return {
      name,
      id,
      notes: section.dataset.notes || '',
      widgets: section.dataset.elementorWidgetSuggestion || '',
      tokens: this.parseTokens(section.dataset.tokens),
      element: section,
      styles: {
        display: computed.display,
        flexDirection: computed.flexDirection,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
        gap: computed.gap !== 'normal' ? computed.gap : undefined,
        padding: computed.padding,
        margin: computed.margin,
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily.split(',')[0].trim(),
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius !== '0px' ? computed.borderRadius : undefined,
        boxShadow: computed.boxShadow !== 'none' ? computed.boxShadow : undefined,
      },
    };
  }

  private parseTokens(tokensStr: string | undefined): Record<string, string> {
    if (!tokensStr) return {};
    try {
      return JSON.parse(tokensStr);
    } catch {
      return {};
    }
  }

  private showSpecCard(data: SectionData) {
    this.closeSpecCard();

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'handoff-spec-card-backdrop';
    backdrop.addEventListener('click', () => this.closeSpecCard());

    // Create card
    const card = document.createElement('div');
    card.className = 'handoff-spec-card';

    // Parse widgets
    const widgets = data.widgets
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    // Get current breakpoint info
    const currentBp = this.breakpoints[this.currentBreakpoint];
    const breakpointIndicator = `
      <div class="handoff-responsive-indicator">
        <span>Viewing specs for:</span>
        <span class="bp-active">${currentBp.label} (${currentBp.width}px)</span>
      </div>
    `;

    card.innerHTML = `
      <div class="handoff-spec-card-header">
        <button class="handoff-close-button" aria-label="Close">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3>${data.name}</h3>
        <p>Section ID: ${data.id}</p>
      </div>
      <div class="handoff-spec-card-body">
        ${
          data.notes
            ? `
          <div class="handoff-spec-card-section">
            <h4>Implementation Notes</h4>
            <p style="color: #374151; font-size: 0.875rem;">${data.notes}</p>
          </div>
        `
            : ''
        }
        
        ${
          widgets.length > 0
            ? `
          <div class="handoff-spec-card-section">
            <h4>Suggested Elementor Widgets</h4>
            <div>
              ${widgets.map((w) => `<span class="handoff-widget-tag">${w}</span>`).join('')}
            </div>
          </div>
        `
            : ''
        }
        
        ${breakpointIndicator}
        
        <div class="handoff-spec-card-section">
          <h4>Layout</h4>
          <div class="spec-item">
            <span class="spec-label">Display</span>
            <span class="spec-value">${data.styles.display}</span>
          </div>
          ${
            data.styles.flexDirection
              ? `
            <div class="spec-item">
              <span class="spec-label">Flex Direction</span>
              <span class="spec-value">${data.styles.flexDirection}</span>
            </div>
          `
              : ''
          }
          ${
            data.styles.justifyContent
              ? `
            <div class="spec-item">
              <span class="spec-label">Justify Content</span>
              <span class="spec-value">${data.styles.justifyContent}</span>
            </div>
          `
              : ''
          }
          ${
            data.styles.alignItems
              ? `
            <div class="spec-item">
              <span class="spec-label">Align Items</span>
              <span class="spec-value">${data.styles.alignItems}</span>
            </div>
          `
              : ''
          }
          ${
            data.styles.gap
              ? `
            <div class="spec-item">
              <span class="spec-label">Gap</span>
              <span class="spec-value">${data.styles.gap}</span>
            </div>
          `
              : ''
          }
        </div>
        
        <div class="handoff-spec-card-section">
          <h4>Spacing</h4>
          <div class="spec-item">
            <span class="spec-label">Padding</span>
            <span class="spec-value">${data.styles.padding || 'none'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Margin</span>
            <span class="spec-value">${data.styles.margin || 'none'}</span>
          </div>
        </div>
        
        <div class="handoff-spec-card-section">
          <h4>Typography</h4>
          <div class="spec-item">
            <span class="spec-label">Font Family</span>
            <span class="spec-value">${data.styles.fontFamily || 'inherit'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Font Size</span>
            <span class="spec-value">${data.styles.fontSize || 'inherit'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Font Weight</span>
            <span class="spec-value">${data.styles.fontWeight || 'normal'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Line Height</span>
            <span class="spec-value">${data.styles.lineHeight || 'normal'}</span>
          </div>
        </div>
        
        <div class="handoff-spec-card-section">
          <h4>Colors</h4>
          <div class="spec-item">
            <span class="spec-label">Text Color</span>
            <span class="spec-value">${data.styles.color || 'inherit'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Background</span>
            <span class="spec-value">${data.styles.backgroundColor || 'transparent'}</span>
          </div>
        </div>
        
        ${
          data.styles.borderRadius || data.styles.boxShadow
            ? `
          <div class="handoff-spec-card-section">
            <h4>Effects</h4>
            ${
              data.styles.borderRadius
                ? `
              <div class="spec-item">
                <span class="spec-label">Border Radius</span>
                <span class="spec-value">${data.styles.borderRadius}</span>
              </div>
            `
                : ''
            }
            ${
              data.styles.boxShadow
                ? `
              <div class="spec-item">
                <span class="spec-label">Box Shadow</span>
                <span class="spec-value" style="font-size: 0.75rem; word-break: break-all;">${data.styles.boxShadow}</span>
              </div>
            `
                : ''
            }
          </div>
        `
            : ''
        }
        
        ${
          Object.keys(data.tokens).length > 0
            ? `
          <div class="handoff-spec-card-section">
            <h4>Design Tokens</h4>
            ${Object.entries(data.tokens)
              .map(
                ([key, value]) => `
              <div class="spec-item">
                <span class="spec-label">${key}</span>
                <span class="spec-value">${value}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
      <div class="handoff-spec-card-footer">
        <button class="btn-secondary" data-action="copy">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Spec
        </button>
        <button class="btn-primary" data-action="download">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .md
        </button>
      </div>
    `;

    // Add event listeners
    const closeButton = card.querySelector('.handoff-close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeSpecCard());
    }

    const copyButton = card.querySelector('[data-action="copy"]');
    if (copyButton) {
      copyButton.addEventListener('click', () => this.copySectionSpec(data));
    }

    const downloadButton = card.querySelector('[data-action="download"]');
    if (downloadButton) {
      downloadButton.addEventListener('click', () => this.downloadSectionSpec(data));
    }

    document.body.appendChild(backdrop);
    document.body.appendChild(card);
    document.body.style.overflow = 'hidden';

    this.activeSpecCard = card;
  }

  private closeSpecCard() {
    if (this.activeSpecCard) {
      const backdrop = document.querySelector('.handoff-spec-card-backdrop');
      if (backdrop) backdrop.remove();
      this.activeSpecCard.remove();
      this.activeSpecCard = null;
      document.body.style.overflow = '';
    }
  }

  private generateSpecMarkdown(data: SectionData): string {
    const widgets = data.widgets
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    return `# Section: ${data.name}

**ID:** ${data.id}

## Implementation Notes

${data.notes || 'No specific notes provided.'}

## Suggested Elementor Widgets

${widgets.length > 0 ? widgets.map((w) => `- ${w}`).join('\n') : 'Not specified'}

## Layout

| Property | Value |
|----------|-------|
| Display | ${data.styles.display} |
| Flex Direction | ${data.styles.flexDirection || 'N/A'} |
| Justify Content | ${data.styles.justifyContent || 'N/A'} |
| Align Items | ${data.styles.alignItems || 'N/A'} |
| Gap | ${data.styles.gap || 'N/A'} |

## Spacing

| Property | Value |
|----------|-------|
| Padding | ${data.styles.padding || 'none'} |
| Margin | ${data.styles.margin || 'none'} |

## Typography

| Property | Value |
|----------|-------|
| Font Family | ${data.styles.fontFamily || 'inherit'} |
| Font Size | ${data.styles.fontSize || 'inherit'} |
| Font Weight | ${data.styles.fontWeight || 'normal'} |
| Line Height | ${data.styles.lineHeight || 'normal'} |

## Colors

| Property | Value |
|----------|-------|
| Text Color | ${data.styles.color || 'inherit'} |
| Background | ${data.styles.backgroundColor || 'transparent'} |

${
  data.styles.borderRadius || data.styles.boxShadow
    ? `## Effects

| Property | Value |
|----------|-------|
${data.styles.borderRadius ? `| Border Radius | ${data.styles.borderRadius} |` : ''}
${data.styles.boxShadow ? `| Box Shadow | ${data.styles.boxShadow} |` : ''}`
    : ''
}

${
  Object.keys(data.tokens).length > 0
    ? `## Design Tokens

${Object.entries(data.tokens)
  .map(([key, value]) => `- **${key}:** ${value}`)
  .join('\n')}`
    : ''
}

---
*Generated from Handoff Overlay*
`;
  }

  private copySectionSpec(data: SectionData) {
    const spec = this.generateSpecMarkdown(data);

    navigator.clipboard
      .writeText(spec)
      .then(() => {
        // Show brief success feedback
        const btn = document.querySelector('[data-action="copy"]');
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = `
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          `;
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        }
      })
      .catch(() => {
        // Show brief error feedback
        const btn = document.querySelector('[data-action="copy"]');
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = `
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failed
          `;
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        }
      });
  }

  private downloadSectionSpec(data: SectionData) {
    const spec = this.generateSpecMarkdown(data);
    const blob = new Blob([spec], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.id}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize overlay
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new HandoffOverlay());
} else {
  new HandoffOverlay();
}

export { HandoffOverlay };
