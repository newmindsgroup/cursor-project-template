// Wireframe Mode Toggle System
// Converts the prototype to a content-focused view without colors or images
// Enable via ?wireframe=1 URL param or Cmd/Ctrl+Shift+W

class WireframeMode {
  private isActive: boolean = false;
  private toggleButton: HTMLElement | null = null;
  private contentIndicator: HTMLElement | null = null;
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Check URL params first - ?wireframe=1 enables wireframe mode automatically
    const urlParams = new URLSearchParams(window.location.search);
    const wireframeParam = urlParams.get('wireframe') === '1';

    // Check localStorage for saved state (URL param overrides)
    let savedState: string | null = null;
    try {
      savedState = localStorage.getItem('wireframe-mode-active');
    } catch {
      // localStorage may be unavailable in private browsing mode
    }

    this.isActive = wireframeParam || savedState === 'true';

    this.createToggleButton();
    this.createContentIndicator();
    this.setupKeyboardShortcut();
    this.addPlaceholderLabels();

    if (this.isActive) {
      this.enable();
    }

    // Re-initialize when sections load dynamically
    window.addEventListener('sections-loaded', () => {
      this.addPlaceholderLabels();
      if (this.isActive) {
        this.enable();
      }
    });
  }

  private createToggleButton() {
    // Check if button already exists
    if (document.getElementById('wireframe-toggle')) return;

    const button = document.createElement('button');
    button.id = 'wireframe-toggle';
    button.className = 'wireframe-toggle-button';
    button.setAttribute('aria-label', 'Toggle wireframe mode');
    button.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
      <span class="wireframe-toggle-text">${this.isActive ? 'Exit' : 'View'} Wireframe</span>
    `;

    button.addEventListener('click', () => this.toggle());
    document.body.appendChild(button);
    this.toggleButton = button;
  }

  private createContentIndicator() {
    // Check if indicator already exists
    if (document.getElementById('wireframe-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'wireframe-indicator';
    indicator.className = 'wireframe-content-indicator';
    indicator.innerHTML = `
      <span class="indicator-dot"></span>
      <span>Content Review Mode</span>
      <span style="font-weight: 400; opacity: 0.7;">Focus on content, layout visible without styling</span>
    `;

    document.body.appendChild(indicator);
    this.contentIndicator = indicator;
  }

  private setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Shift + W
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private addPlaceholderLabels() {
    // Add wireframe labels to images without one
    document.querySelectorAll('img:not([data-wireframe-label])').forEach((img, index) => {
      const imgEl = img as HTMLImageElement;
      const alt = imgEl.alt || `Image ${index + 1}`;
      imgEl.setAttribute('data-wireframe-label', alt);
      imgEl.setAttribute('data-wireframe-placeholder', 'image');
    });

    // Add wireframe labels to videos
    document.querySelectorAll('video:not([data-wireframe-label])').forEach((video, index) => {
      const videoEl = video as HTMLVideoElement;
      videoEl.setAttribute('data-wireframe-label', `Video ${index + 1}`);
      videoEl.setAttribute('data-wireframe-placeholder', 'video');
    });

    // Add wireframe labels to iframes (YouTube, Vimeo)
    document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"]').forEach((iframe, index) => {
      const iframeEl = iframe as HTMLIFrameElement;
      if (!iframeEl.getAttribute('data-wireframe-label')) {
        iframeEl.setAttribute('data-wireframe-label', `Video ${index + 1}`);
        iframeEl.setAttribute('data-wireframe-placeholder', 'video');
      }
    });

    // Add content section labels to sections with data-section attribute
    document.querySelectorAll('[data-section]:not([data-content-section])').forEach((section) => {
      const sectionEl = section as HTMLElement;
      const sectionName = sectionEl.getAttribute('data-section') || 'Section';
      sectionEl.setAttribute('data-content-section', sectionName);
    });
  }

  private toggle() {
    this.isActive = !this.isActive;

    try {
      localStorage.setItem('wireframe-mode-active', String(this.isActive));
    } catch {
      // localStorage may be unavailable in private browsing mode
    }

    if (this.isActive) {
      this.enable();
    } else {
      this.disable();
    }

    this.updateButtonText();
  }

  private enable() {
    document.body.classList.add('wireframe-mode');

    // Hide actual images and show placeholders
    this.replaceMediaWithPlaceholders();

    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('wireframe-mode-enabled'));
  }

  private disable() {
    document.body.classList.remove('wireframe-mode');

    // Restore media elements
    this.restoreMedia();

    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('wireframe-mode-disabled'));
  }

  private replaceMediaWithPlaceholders() {
    // For images, we'll create overlay placeholders
    document.querySelectorAll('img:not([data-wireframe-keep])').forEach((img) => {
      const imgEl = img as HTMLImageElement;
      const wrapper = imgEl.parentElement;

      // Store original styles
      if (!imgEl.getAttribute('data-original-src')) {
        imgEl.setAttribute('data-original-src', imgEl.src || '');
      }

      // Create placeholder overlay if not exists
      if (wrapper && !wrapper.querySelector('.wireframe-placeholder-overlay')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'wireframe-placeholder-overlay';
        placeholder.style.cssText = `
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: repeating-linear-gradient(
            45deg,
            #d4d4d4,
            #d4d4d4 10px,
            #e5e5e5 10px,
            #e5e5e5 20px
          );
          border: 2px dashed #a3a3a3;
          border-radius: 8px;
          z-index: 5;
        `;

        const label = document.createElement('span');
        label.style.cssText = `
          background: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid #a3a3a3;
        `;
        label.textContent = imgEl.getAttribute('data-wireframe-label') || 'IMAGE';

        placeholder.appendChild(label);

        // Make parent relative if static
        if (wrapper.style.position === '' || wrapper.style.position === 'static') {
          wrapper.style.position = 'relative';
          wrapper.setAttribute('data-wireframe-positioned', 'true');
        }

        wrapper.appendChild(placeholder);
      }

      // Fade out the image
      imgEl.style.opacity = '0.1';
    });

    // For videos, hide them
    document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').forEach((media) => {
      const mediaEl = media as HTMLElement;
      if (!mediaEl.getAttribute('data-original-display')) {
        mediaEl.setAttribute('data-original-display', mediaEl.style.display || '');
      }
      mediaEl.style.opacity = '0.1';
    });
  }

  private restoreMedia() {
    // Remove placeholder overlays
    document.querySelectorAll('.wireframe-placeholder-overlay').forEach((el) => {
      el.remove();
    });

    // Restore positioned parents
    document.querySelectorAll('[data-wireframe-positioned]').forEach((el) => {
      (el as HTMLElement).style.position = '';
      el.removeAttribute('data-wireframe-positioned');
    });

    // Restore images
    document.querySelectorAll('img[data-original-src]').forEach((img) => {
      const imgEl = img as HTMLImageElement;
      imgEl.style.opacity = '';
    });

    // Restore videos
    document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').forEach((media) => {
      const mediaEl = media as HTMLElement;
      mediaEl.style.opacity = '';
    });
  }

  private updateButtonText() {
    const buttonText = this.toggleButton?.querySelector('.wireframe-toggle-text');
    if (buttonText) {
      buttonText.textContent = this.isActive ? 'Exit Wireframe' : 'View Wireframe';
    }
  }

  // Public API
  public isEnabled(): boolean {
    return this.isActive;
  }

  public setEnabled(enabled: boolean) {
    if (enabled !== this.isActive) {
      this.toggle();
    }
  }
}

// Initialize wireframe mode
let wireframeModeInstance: WireframeMode | null = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    wireframeModeInstance = new WireframeMode();
  });
} else {
  wireframeModeInstance = new WireframeMode();
}

export { WireframeMode, wireframeModeInstance };
