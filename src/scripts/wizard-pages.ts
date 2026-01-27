/**
 * Wizard Page Designer
 * Page-by-page design workflow with content editing and preview
 */

const API_BASE = 'http://localhost:3001/api';

// State
interface PageState {
  pages: {
    name: string;
    path: string;
    exists: boolean;
    hasContent: boolean;
    hasImages: boolean;
    status: string;
  }[];
  currentPage: string | null;
  content: Record<string, any>;
  viewport: 'desktop' | 'tablet' | 'mobile';
  wireframeMode: boolean;
}

const state: PageState = {
  pages: [],
  currentPage: null,
  content: {},
  viewport: 'desktop',
  wireframeMode: false
};

// DOM elements
const pageListView = document.getElementById('page-list-view');
const pageDetailView = document.getElementById('page-detail-view');
const pageList = document.getElementById('page-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initViewportControls();
  initBackButton();
  loadPages();
});

/**
 * Initialize tab navigation
 */
function initTabs() {
  const tabs = document.querySelectorAll('.wizard-tab');
  const panels = document.querySelectorAll('.wizard-tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.getAttribute('data-tab');

      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      document.querySelector(`[data-panel="${targetPanel}"]`)?.classList.add('active');
    });
  });
}

/**
 * Initialize viewport controls
 */
function initViewportControls() {
  const viewportBtns = document.querySelectorAll('.wizard-preview-btn');
  const previewFrame = document.getElementById('preview-frame') as HTMLIFrameElement;
  const wireframeToggle = document.getElementById('wireframe-toggle') as HTMLInputElement;

  viewportBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const viewport = btn.getAttribute('data-viewport') as 'desktop' | 'tablet' | 'mobile';
      state.viewport = viewport;

      viewportBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (previewFrame) {
        previewFrame.classList.remove('desktop', 'tablet', 'mobile');
        previewFrame.classList.add(viewport);
      }
    });
  });

  if (wireframeToggle) {
    wireframeToggle.addEventListener('change', () => {
      state.wireframeMode = wireframeToggle.checked;
      updatePreview();
    });
  }
}

/**
 * Initialize back button
 */
function initBackButton() {
  const backBtn = document.getElementById('back-to-list');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showListView();
    });
  }
}

/**
 * Load pages
 */
async function loadPages() {
  if (!pageList) return;

  try {
    const response = await fetch(`${API_BASE}/pages`);
    const result = await response.json();

    state.pages = result.pages || [];

    // Update summary
    const completeCount = state.pages.filter((p) => p.status === 'complete').length;
    const progressSummary = document.getElementById('page-progress-summary');
    if (progressSummary) {
      progressSummary.textContent = `${completeCount} of ${state.pages.length} complete`;
    }

    // Render page list
    if (state.pages.length === 0) {
      pageList.innerHTML = `
        <div class="text-center py-12 text-neutral-500">
          <p>No pages configured yet.</p>
          <a href="../" class="text-primary-600 hover:text-primary-700 font-medium">Run the setup wizard</a>
        </div>
      `;
      return;
    }

    pageList.innerHTML = state.pages.map((page) => {
      const checks = [
        page.hasContent,
        page.exists,
        page.hasImages,
        page.status === 'complete'
      ];
      const completeChecks = checks.filter(Boolean).length;

      return `
        <div class="wizard-page-list-item" data-page="${page.name}">
          <div class="wizard-page-list-item-icon">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="wizard-page-list-item-info">
            <div class="wizard-page-list-item-title">${capitalize(page.name)}</div>
            <div class="wizard-page-list-item-path">${page.path}</div>
          </div>
          <div class="wizard-page-list-item-progress">
            <div class="wizard-page-list-item-checks">
              ${checks.map((c) => `<div class="wizard-page-list-item-check ${c ? 'complete' : 'incomplete'}"></div>`).join('')}
            </div>
          </div>
          <div class="wizard-page-status ${page.status.replace(' ', '-').toLowerCase()}">${page.status}</div>
        </div>
      `;
    }).join('');

    // Add click handlers
    pageList.querySelectorAll('.wizard-page-list-item').forEach((item) => {
      item.addEventListener('click', () => {
        const pageName = item.getAttribute('data-page');
        if (pageName) {
          showDetailView(pageName);
        }
      });
    });

  } catch (error) {
    console.error('Failed to load pages:', error);
    pageList.innerHTML = `
      <div class="text-center py-12 text-red-500">
        <p>Failed to load pages. Is the wizard server running?</p>
        <p class="text-sm mt-2">Run: npm run wizard:server</p>
      </div>
    `;
  }
}

/**
 * Show list view
 */
function showListView() {
  state.currentPage = null;
  if (pageListView) pageListView.classList.remove('hidden');
  if (pageDetailView) pageDetailView.classList.add('hidden');
}

/**
 * Show detail view for a page
 */
async function showDetailView(pageName: string) {
  state.currentPage = pageName;
  if (pageListView) pageListView.classList.add('hidden');
  if (pageDetailView) pageDetailView.classList.remove('hidden');

  const page = state.pages.find((p) => p.name === pageName);
  if (!page) return;

  // Update header
  const titleEl = document.getElementById('detail-page-title');
  const pathEl = document.getElementById('detail-page-path');
  const statusEl = document.getElementById('detail-page-status');
  const previewLink = document.getElementById('detail-preview-link') as HTMLAnchorElement;

  if (titleEl) titleEl.textContent = capitalize(pageName);
  if (pathEl) pathEl.textContent = page.path;
  if (statusEl) {
    statusEl.textContent = page.status;
    statusEl.className = `wizard-page-status ${page.status.replace(' ', '-').toLowerCase()}`;
  }
  if (previewLink) {
    previewLink.href = `/pages/${pageName === 'homepage' ? 'index' : pageName}.html`;
  }

  // Load content
  await loadPageContent(pageName);

  // Update preview
  updatePreview();

  // Setup action buttons
  initDetailActions(pageName);
}

/**
 * Load page content
 */
async function loadPageContent(pageName: string) {
  const contentName = pageName === 'homepage' ? 'home' : pageName;

  try {
    const response = await fetch(`${API_BASE}/content/${contentName}`);
    
    if (response.ok) {
      state.content = await response.json();
      renderContentEditor();
    } else {
      state.content = {};
      const editor = document.getElementById('content-editor');
      if (editor) {
        editor.innerHTML = `
          <div class="text-center py-8 text-neutral-500">
            <p>No content file found for this page.</p>
            <button type="button" id="generate-content-btn" class="wizard-btn wizard-btn-primary mt-4">
              Generate Content
            </button>
          </div>
        `;
        
        document.getElementById('generate-content-btn')?.addEventListener('click', async () => {
          await regenerateContent(pageName);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load content:', error);
  }
}

/**
 * Render content editor
 */
function renderContentEditor() {
  const editor = document.getElementById('content-editor');
  if (!editor) return;

  // Update form fields
  const fields = editor.querySelectorAll('[data-content]');
  fields.forEach((field) => {
    const path = field.getAttribute('data-content');
    if (path) {
      const value = getNestedValue(state.content, path);
      if (value !== undefined) {
        (field as HTMLInputElement | HTMLTextAreaElement).value = value;
      }
    }
  });
}

/**
 * Get nested value from object
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, p) => o?.[p], obj);
}

/**
 * Set nested value in object
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((o, p) => {
    if (!o[p]) o[p] = {};
    return o[p];
  }, obj);
  if (last) target[last] = value;
}

/**
 * Update preview iframe
 */
function updatePreview() {
  const previewFrame = document.getElementById('preview-frame') as HTMLIFrameElement;
  if (!previewFrame || !state.currentPage) return;

  const pageName = state.currentPage === 'homepage' ? 'index' : state.currentPage;
  const wireframeParam = state.wireframeMode ? '?wireframe=1' : '';
  previewFrame.src = `/pages/${pageName}.html${wireframeParam}`;
}

/**
 * Initialize detail action buttons
 */
function initDetailActions(pageName: string) {
  // Regenerate content button
  const regenContentBtn = document.getElementById('regen-content-btn');
  if (regenContentBtn) {
    regenContentBtn.onclick = () => regenerateContent(pageName);
  }

  // Save content button
  const saveContentBtn = document.getElementById('save-content-btn');
  if (saveContentBtn) {
    saveContentBtn.onclick = () => saveContent(pageName);
  }

  // Regenerate images button
  const regenImagesBtn = document.getElementById('regen-images-btn');
  if (regenImagesBtn) {
    regenImagesBtn.onclick = () => regenerateImages(pageName);
  }

  // Mark complete button
  const markCompleteBtn = document.getElementById('mark-complete-btn');
  if (markCompleteBtn) {
    markCompleteBtn.onclick = () => markPageComplete(pageName);
  }

  // Run validation button
  const runValidationBtn = document.getElementById('run-validation-btn');
  if (runValidationBtn) {
    runValidationBtn.onclick = () => runValidation(pageName);
  }
}

/**
 * Regenerate content for a page
 */
async function regenerateContent(pageName: string) {
  const contentName = pageName === 'homepage' ? 'home' : pageName;

  try {
    await fetch(`${API_BASE}/generate/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options: { page: contentName } })
    });

    await loadPageContent(pageName);
    alert('Content regenerated!');
  } catch (error) {
    console.error('Failed to regenerate:', error);
    alert('Regeneration failed. Check the console for details.');
  }
}

/**
 * Save content
 */
async function saveContent(pageName: string) {
  const contentName = pageName === 'homepage' ? 'home' : pageName;
  const editor = document.getElementById('content-editor');
  if (!editor) return;

  // Collect form data
  const fields = editor.querySelectorAll('[data-content]');
  fields.forEach((field) => {
    const path = field.getAttribute('data-content');
    const value = (field as HTMLInputElement | HTMLTextAreaElement).value;
    if (path) {
      setNestedValue(state.content, path, value);
    }
  });

  try {
    await fetch(`${API_BASE}/content/${contentName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.content)
    });

    alert('Content saved!');
  } catch (error) {
    console.error('Failed to save:', error);
    alert('Save failed. Check the console for details.');
  }
}

/**
 * Regenerate images for a page
 */
async function regenerateImages(pageName: string) {
  try {
    await fetch(`${API_BASE}/generate/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options: { page: pageName, force: true } })
    });

    alert('Images regenerated!');
  } catch (error) {
    console.error('Failed to regenerate images:', error);
    alert('Image regeneration failed. Check the console for details.');
  }
}

/**
 * Mark page as complete
 */
async function markPageComplete(pageName: string) {
  // Update local state
  const page = state.pages.find((p) => p.name === pageName);
  if (page) {
    page.status = 'complete';
  }

  alert(`${capitalize(pageName)} marked as complete!`);
  showListView();
  loadPages();
}

/**
 * Run validation for a page
 */
async function runValidation(pageName: string) {
  try {
    const response = await fetch(`${API_BASE}/validate`, { method: 'POST' });
    const result = await response.json();

    const messages = [];
    if (result.passed > 0) messages.push(`${result.passed} checks passed`);
    if (result.warnings > 0) messages.push(`${result.warnings} warnings`);
    if (result.errors > 0) messages.push(`${result.errors} errors`);

    alert(`Validation results:\n${messages.join('\n')}`);
  } catch (error) {
    console.error('Validation failed:', error);
    alert('Validation failed. Check the console for details.');
  }
}

/**
 * Capitalize string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
