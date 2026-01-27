// Client Portal - Review and approval system

interface PageReview {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'changes';
  comments: string;
  reviewedAt?: string;
}

interface PortalState {
  authenticated: boolean;
  reviews: Record<string, PageReview>;
  generalFeedback: string;
}

type Breakpoint = 'desktop' | 'tablet' | 'mobile';

interface BreakpointConfig {
  width: number;
  height: number;
  label: string;
  icon: string;
}

class ClientPortal {
  private state: PortalState;
  private readonly accessCode = 'review2024'; // Simple code - change for each project
  private readonly storageKey = 'clientPortalState';
  private currentBreakpoint: Breakpoint = 'desktop';
  private currentPreviewPage: string | null = null;

  // Breakpoint configurations for responsive preview
  private readonly breakpoints: Record<Breakpoint, BreakpointConfig> = {
    desktop: {
      width: 1920,
      height: 1080,
      label: 'Desktop',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
    },
    tablet: {
      width: 768,
      height: 1024,
      label: 'Tablet',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>',
    },
    mobile: {
      width: 375,
      height: 812,
      label: 'Mobile',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>',
    },
  };

  // Default pages to review
  private readonly pages: Omit<PageReview, 'status' | 'comments'>[] = [
    { id: 'home', name: 'Homepage', url: '../index.html' },
    { id: 'about', name: 'About', url: '../about.html' },
    { id: 'services', name: 'Services', url: '../services.html' },
    { id: 'contact', name: 'Contact', url: '../contact.html' },
  ];

  constructor() {
    this.state = this.loadState();
    this.init();
  }

  private loadState(): PortalState {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }

    // Default state
    const reviews: Record<string, PageReview> = {};
    this.pages.forEach((page) => {
      reviews[page.id] = {
        ...page,
        status: 'pending',
        comments: '',
      };
    });

    return {
      authenticated: false,
      reviews,
      generalFeedback: '',
    };
  }

  private saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Ignore
    }
  }

  private init() {
    // Check authentication
    if (this.state.authenticated) {
      this.showPortal();
    }

    this.setupPasswordForm();
    this.setupLogout();
    this.setupFeedbackForm();
    this.setupPageFeedbackModal();
    this.setupPreviewModal();
  }

  private setupPasswordForm() {
    const form = document.getElementById('password-form') as HTMLFormElement;
    const input = document.getElementById('access-code') as HTMLInputElement;
    const error = document.getElementById('password-error');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      if (input.value === this.accessCode) {
        this.state.authenticated = true;
        this.saveState();
        this.showPortal();
        error?.classList.add('hidden');
      } else {
        error?.classList.remove('hidden');
        input.value = '';
        input.focus();
      }
    });
  }

  private setupLogout() {
    const btn = document.getElementById('logout-btn');
    btn?.addEventListener('click', () => {
      this.state.authenticated = false;
      this.saveState();
      this.hidePortal();
    });
  }

  private setupFeedbackForm() {
    const form = document.getElementById('feedback-form') as HTMLFormElement;
    const textarea = document.getElementById('feedback-text') as HTMLTextAreaElement;

    // Load saved feedback
    if (textarea && this.state.generalFeedback) {
      textarea.value = this.state.generalFeedback;
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      if (textarea) {
        this.state.generalFeedback = textarea.value;
        this.saveState();
        this.showToast('Feedback saved successfully!');
      }
    });
  }

  private setupPageFeedbackModal() {
    const modal = document.getElementById('page-feedback-modal');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('page-feedback-form') as HTMLFormElement;

    closeBtn?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const pageId = (document.getElementById('modal-page-id') as HTMLInputElement)?.value;
      const status = (form.querySelector('input[name="status"]:checked') as HTMLInputElement)?.value as
        | 'pending'
        | 'approved'
        | 'changes';
      const comments = (document.getElementById('modal-comments') as HTMLTextAreaElement)?.value;

      if (pageId && this.state.reviews[pageId]) {
        this.state.reviews[pageId].status = status;
        this.state.reviews[pageId].comments = comments || '';
        this.state.reviews[pageId].reviewedAt = new Date().toISOString();
        this.saveState();

        this.renderPages();
        this.updateCounts();

        modal?.classList.add('hidden');
        this.showToast(`${this.state.reviews[pageId].name} marked as ${status}`);
      }
    });
  }

  private showPortal() {
    document.getElementById('password-gate')?.classList.add('hidden');
    document.getElementById('portal-content')?.classList.remove('hidden');

    this.renderPages();
    this.updateCounts();
  }

  private hidePortal() {
    document.getElementById('password-gate')?.classList.remove('hidden');
    document.getElementById('portal-content')?.classList.add('hidden');
  }

  private renderPages() {
    const grid = document.getElementById('pages-grid');
    if (!grid) return;

    grid.innerHTML = Object.values(this.state.reviews)
      .map((page) => this.renderPageCard(page))
      .join('');

    // Setup review buttons
    grid.querySelectorAll('.review-page-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const pageId = (e.currentTarget as HTMLElement).dataset.pageId;
        if (pageId) {
          this.openFeedbackModal(pageId);
        }
      });
    });

    // Setup preview buttons (both in card overlay and button)
    grid.querySelectorAll('.preview-page-btn, .preview-expand-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const pageId = target.dataset.pageId;
        const pageName = target.dataset.pageName;
        const pageUrl = target.dataset.pageUrl;
        if (pageId && pageName && pageUrl) {
          this.openPreviewModal(pageId, pageName, pageUrl);
        }
      });
    });
  }

  private renderPageCard(page: PageReview): string {
    const statusClass =
      page.status === 'approved' ? 'approved' : page.status === 'changes' ? 'changes' : 'pending';
    const statusText =
      page.status === 'approved' ? 'Approved' : page.status === 'changes' ? 'Changes Requested' : 'Pending Review';

    return `
      <div class="page-card">
        <div class="page-card-preview">
          <div class="page-card-iframe-container" data-page-id="${page.id}">
            <iframe 
              src="${page.url}" 
              class="page-card-iframe"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
              title="Preview of ${page.name}"
            ></iframe>
            <div class="page-card-iframe-overlay">
              <button class="preview-expand-btn" data-page-id="${page.id}" data-page-name="${page.name}" data-page-url="${page.url}">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="page-card-body">
          <div class="flex items-center justify-between mb-1">
            <h3 class="page-card-title">${page.name}</h3>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
          <p class="page-card-meta">${page.comments ? 'Has feedback' : 'No feedback yet'}</p>
          <div class="page-card-actions">
            <button class="review-btn secondary preview-page-btn" data-page-id="${page.id}" data-page-name="${page.name}" data-page-url="${page.url}">
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            <button class="review-btn primary review-page-btn" data-page-id="${page.id}">
              Review
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private openFeedbackModal(pageId: string) {
    const page = this.state.reviews[pageId];
    if (!page) return;

    const modal = document.getElementById('page-feedback-modal');
    const titleEl = document.getElementById('modal-page-title');
    const pageIdInput = document.getElementById('modal-page-id') as HTMLInputElement;
    const commentsEl = document.getElementById('modal-comments') as HTMLTextAreaElement;
    const statusRadios = document.querySelectorAll('input[name="status"]') as NodeListOf<HTMLInputElement>;

    if (titleEl) titleEl.textContent = `Review: ${page.name}`;
    if (pageIdInput) pageIdInput.value = pageId;
    if (commentsEl) commentsEl.value = page.comments;

    statusRadios.forEach((radio) => {
      radio.checked = radio.value === page.status;
    });

    modal?.classList.remove('hidden');
  }

  private updateCounts() {
    const reviews = Object.values(this.state.reviews);

    const approved = reviews.filter((r) => r.status === 'approved').length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const changes = reviews.filter((r) => r.status === 'changes').length;

    const approvedEl = document.getElementById('approved-count');
    const pendingEl = document.getElementById('pending-count');
    const changesEl = document.getElementById('changes-count');

    if (approvedEl) approvedEl.textContent = String(approved);
    if (pendingEl) pendingEl.textContent = String(pending);
    if (changesEl) changesEl.textContent = String(changes);

    // Update overall status
    const statusEl = document.getElementById('review-status');
    if (statusEl) {
      if (approved === reviews.length) {
        statusEl.textContent = 'All Approved';
        statusEl.className = 'px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full';
      } else if (changes > 0) {
        statusEl.textContent = 'Changes Requested';
        statusEl.className = 'px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full';
      } else {
        statusEl.textContent = 'In Review';
        statusEl.className = 'px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full';
      }
    }
  }

  private setupPreviewModal() {
    const modal = document.getElementById('preview-modal');
    const closeBtn = document.getElementById('close-preview-modal');
    const iframeContainer = document.getElementById('preview-iframe-container');
    const breakpointBtns = document.querySelectorAll('.breakpoint-btn');

    // Close button
    closeBtn?.addEventListener('click', () => {
      this.closePreviewModal();
    });

    // Click outside to close
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closePreviewModal();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentPreviewPage) {
        this.closePreviewModal();
      }
    });

    // Breakpoint toggle buttons
    breakpointBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const breakpoint = (e.currentTarget as HTMLElement).dataset.breakpoint as Breakpoint;
        if (breakpoint) {
          this.setPreviewBreakpoint(breakpoint);
        }
      });
    });
  }

  private openPreviewModal(pageId: string, pageName: string, pageUrl: string) {
    this.currentPreviewPage = pageId;
    this.currentBreakpoint = 'desktop';

    const modal = document.getElementById('preview-modal');
    const title = document.getElementById('preview-modal-title');
    const iframeContainer = document.getElementById('preview-iframe-container');
    const sizeIndicator = document.getElementById('preview-size-indicator');

    if (title) title.textContent = pageName;
    if (iframeContainer) {
      const config = this.breakpoints[this.currentBreakpoint];
      iframeContainer.innerHTML = `
        <iframe 
          src="${pageUrl}" 
          class="preview-modal-iframe"
          style="width: ${config.width}px; height: ${config.height}px;"
          sandbox="allow-scripts allow-same-origin"
          title="Preview of ${pageName}"
        ></iframe>
      `;
    }
    if (sizeIndicator) {
      const config = this.breakpoints[this.currentBreakpoint];
      sizeIndicator.textContent = `${config.width} × ${config.height}`;
    }

    // Update active breakpoint button
    this.updateBreakpointButtons();

    modal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  private closePreviewModal() {
    const modal = document.getElementById('preview-modal');
    const iframeContainer = document.getElementById('preview-iframe-container');

    modal?.classList.add('hidden');
    document.body.style.overflow = '';
    this.currentPreviewPage = null;

    // Clean up iframe
    if (iframeContainer) {
      iframeContainer.innerHTML = '';
    }
  }

  private setPreviewBreakpoint(breakpoint: Breakpoint) {
    this.currentBreakpoint = breakpoint;
    const config = this.breakpoints[breakpoint];

    const iframe = document.querySelector('.preview-modal-iframe') as HTMLIFrameElement;
    const sizeIndicator = document.getElementById('preview-size-indicator');

    if (iframe) {
      iframe.style.width = `${config.width}px`;
      iframe.style.height = `${config.height}px`;
    }

    if (sizeIndicator) {
      sizeIndicator.textContent = `${config.width} × ${config.height}`;
    }

    this.updateBreakpointButtons();
  }

  private updateBreakpointButtons() {
    const btns = document.querySelectorAll('.breakpoint-btn');
    btns.forEach((btn) => {
      const breakpoint = (btn as HTMLElement).dataset.breakpoint;
      if (breakpoint === this.currentBreakpoint) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  private showToast(message: string) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ClientPortal());
} else {
  new ClientPortal();
}
