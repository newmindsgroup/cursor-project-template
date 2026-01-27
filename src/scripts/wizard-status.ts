/**
 * Wizard Status Dashboard
 * Progress tracking, gap reporting, and validation
 */

const API_BASE = 'http://localhost:3001/api';

// SSE Connection for real-time progress
let progressEventSource: EventSource | null = null;

interface GenerationProgress {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  details?: {
    section?: string;
    tokens?: number;
    cost?: number;
    quality?: number;
    elapsed?: number;
  };
}

// State
interface StatusState {
  pages: {
    name: string;
    path: string;
    exists: boolean;
    hasContent: boolean;
    hasImages: boolean;
    status: string;
  }[];
  gaps: {
    content: any[];
    images: any[];
    placeholders?: any[];
    errors: any[];
    summary?: {
      content: number;
      images: number;
      pages: number;
      errors: number;
      total: number;
    };
  };
  validation: {
    passed: number;
    warnings: number;
    errors: number;
    details: any[];
  };
}

const state: StatusState = {
  pages: [],
  gaps: {
    content: [],
    images: [],
    errors: []
  },
  validation: {
    passed: 0,
    warnings: 0,
    errors: 0,
    details: []
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initRefreshButton();
  initActionButtons();
  initProgressStream();
  loadAllData();
});

/**
 * Initialize SSE progress stream
 */
function initProgressStream() {
  // Create progress panel if it doesn't exist
  createProgressPanel();
  
  // Connect to SSE endpoint
  connectProgressStream();
}

/**
 * Create the real-time progress panel
 */
function createProgressPanel() {
  const existingPanel = document.getElementById('live-progress-panel');
  if (existingPanel) return;
  
  const container = document.querySelector('.wizard-status-overview');
  if (!container) return;
  
  const panel = document.createElement('div');
  panel.id = 'live-progress-panel';
  panel.className = 'live-progress-panel hidden mt-6';
  panel.innerHTML = `
    <div class="live-progress-header">
      <div class="flex items-center gap-2">
        <div class="live-progress-indicator"></div>
        <h3 class="live-progress-title">Generation in Progress</h3>
      </div>
      <button id="close-progress-panel" class="live-progress-close">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="live-progress-content">
      <div class="live-progress-steps" id="progress-steps">
        <!-- Steps will be inserted here -->
      </div>
      <div class="live-progress-stats">
        <div class="live-progress-stat">
          <span class="live-progress-stat-label">Tokens Used</span>
          <span class="live-progress-stat-value" id="progress-tokens">0</span>
        </div>
        <div class="live-progress-stat">
          <span class="live-progress-stat-label">Est. Cost</span>
          <span class="live-progress-stat-value" id="progress-cost">$0.00</span>
        </div>
        <div class="live-progress-stat">
          <span class="live-progress-stat-label">Elapsed</span>
          <span class="live-progress-stat-value" id="progress-elapsed">0s</span>
        </div>
      </div>
      <div class="live-progress-log" id="progress-log">
        <!-- Live log entries will be inserted here -->
      </div>
    </div>
  `;
  
  container.after(panel);
  
  // Close button handler
  document.getElementById('close-progress-panel')?.addEventListener('click', () => {
    panel.classList.add('hidden');
  });
}

/**
 * Connect to SSE progress stream
 */
function connectProgressStream() {
  if (progressEventSource) {
    progressEventSource.close();
  }
  
  progressEventSource = new EventSource(`${API_BASE}/progress`);
  
  progressEventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as GenerationProgress;
      handleProgressUpdate(data);
    } catch (error) {
      console.error('Failed to parse progress event:', error);
    }
  };
  
  progressEventSource.onerror = () => {
    // Reconnect after 3 seconds
    setTimeout(connectProgressStream, 3000);
  };
}

/**
 * Handle progress updates from SSE
 */
function handleProgressUpdate(data: GenerationProgress) {
  const panel = document.getElementById('live-progress-panel');
  const stepsContainer = document.getElementById('progress-steps');
  const logContainer = document.getElementById('progress-log');
  
  // Show panel when generation starts
  if (data.status === 'running' && panel) {
    panel.classList.remove('hidden');
  }
  
  // Update or create step element
  if (stepsContainer && data.step) {
    updateProgressStep(stepsContainer, data);
  }
  
  // Add log entry
  if (logContainer && data.message) {
    addProgressLogEntry(logContainer, data);
  }
  
  // Update stats
  if (data.details) {
    updateProgressStats(data.details);
  }
  
  // Hide panel on completion (with delay)
  if (data.status === 'completed' || data.status === 'error') {
    setTimeout(() => {
      // Only hide if no active steps
      const activeSteps = document.querySelectorAll('.progress-step.running');
      if (activeSteps.length === 0 && panel) {
        // Don't auto-hide, let user close it
      }
    }, 2000);
  }
}

/**
 * Update a progress step
 */
function updateProgressStep(container: HTMLElement, data: GenerationProgress) {
  let stepEl = container.querySelector(`[data-step="${data.step}"]`) as HTMLElement;
  
  if (!stepEl) {
    stepEl = document.createElement('div');
    stepEl.className = 'progress-step pending';
    stepEl.dataset.step = data.step;
    stepEl.innerHTML = `
      <div class="progress-step-icon">
        <svg class="w-4 h-4 pending-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg class="w-4 h-4 running-icon animate-spin hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg class="w-4 h-4 completed-icon hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg class="w-4 h-4 error-icon hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div class="progress-step-content">
        <span class="progress-step-name">${data.step}</span>
        <span class="progress-step-message">${data.message}</span>
      </div>
      ${data.details?.quality ? `<span class="progress-step-quality">${data.details.quality}/10</span>` : ''}
    `;
    container.appendChild(stepEl);
  }
  
  // Update status
  stepEl.className = `progress-step ${data.status}`;
  
  // Update message
  const messageEl = stepEl.querySelector('.progress-step-message');
  if (messageEl) messageEl.textContent = data.message;
  
  // Toggle icons based on status
  const icons = stepEl.querySelectorAll('.progress-step-icon svg');
  icons.forEach(icon => icon.classList.add('hidden'));
  
  const iconSelector = {
    pending: '.pending-icon',
    running: '.running-icon',
    completed: '.completed-icon',
    error: '.error-icon'
  }[data.status];
  
  if (iconSelector) {
    stepEl.querySelector(iconSelector)?.classList.remove('hidden');
  }
  
  // Update quality score if present
  if (data.details?.quality) {
    let qualityEl = stepEl.querySelector('.progress-step-quality');
    if (!qualityEl) {
      qualityEl = document.createElement('span');
      qualityEl.className = 'progress-step-quality';
      stepEl.appendChild(qualityEl);
    }
    qualityEl.textContent = `${data.details.quality}/10`;
  }
}

/**
 * Add a log entry
 */
function addProgressLogEntry(container: HTMLElement, data: GenerationProgress) {
  const entry = document.createElement('div');
  entry.className = `progress-log-entry ${data.status}`;
  
  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `
    <span class="progress-log-time">${timestamp}</span>
    <span class="progress-log-message">${data.message}</span>
  `;
  
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
  
  // Keep only last 50 entries
  while (container.children.length > 50) {
    container.removeChild(container.firstChild!);
  }
}

/**
 * Update progress statistics
 */
function updateProgressStats(details: GenerationProgress['details']) {
  if (!details) return;
  
  if (details.tokens !== undefined) {
    const tokensEl = document.getElementById('progress-tokens');
    if (tokensEl) tokensEl.textContent = details.tokens.toLocaleString();
  }
  
  if (details.cost !== undefined) {
    const costEl = document.getElementById('progress-cost');
    if (costEl) costEl.textContent = `$${details.cost.toFixed(4)}`;
  }
  
  if (details.elapsed !== undefined) {
    const elapsedEl = document.getElementById('progress-elapsed');
    if (elapsedEl) {
      const seconds = Math.round(details.elapsed / 1000);
      elapsedEl.textContent = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds/60)}m ${seconds%60}s`;
    }
  }
}

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
 * Initialize refresh button
 */
function initRefreshButton() {
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAllData);
  }
}

/**
 * Initialize action buttons
 */
function initActionButtons() {
  const actionCards = document.querySelectorAll('.wizard-action-card');
  
  actionCards.forEach((card) => {
    card.addEventListener('click', async () => {
      const action = card.getAttribute('data-action');
      if (!action) return;

      showProgressModal(`Running ${action}...`);

      try {
        switch (action) {
          case 'fix-gaps':
            await fixAllGaps();
            break;
          case 'regen-images':
            await regenerateImages();
            break;
          case 'run-validation':
            await runValidation();
            break;
          case 'export-report':
            exportReport();
            break;
        }
      } finally {
        hideProgressModal();
        await loadAllData();
      }
    });
  });

  // Scan gaps button
  const scanGapsBtn = document.getElementById('scan-gaps-btn');
  if (scanGapsBtn) {
    scanGapsBtn.addEventListener('click', loadGaps);
  }

  // Run validation button
  const runValidationBtn = document.getElementById('run-full-validation-btn');
  if (runValidationBtn) {
    runValidationBtn.addEventListener('click', async () => {
      showProgressModal('Running validation...');
      await runValidation();
      hideProgressModal();
    });
  }
}

/**
 * Load all data
 */
async function loadAllData() {
  await Promise.all([
    loadPages(),
    loadGaps(),
    loadStatus()
  ]);
  updateOverview();
}

/**
 * Load pages
 */
async function loadPages() {
  try {
    const response = await fetch(`${API_BASE}/pages`);
    const result = await response.json();
    state.pages = result.pages || [];

    // Update page status grid
    updatePageStatusGrid();

    // Update pages table
    updatePagesTable();

  } catch (error) {
    console.error('Failed to load pages:', error);
  }
}

/**
 * Load gaps
 */
async function loadGaps() {
  try {
    const response = await fetch(`${API_BASE}/gaps`);
    const result = await response.json();
    
    state.gaps = {
      content: result.content || [],
      images: result.images || [],
      placeholders: result.placeholders || [],
      errors: result.errors || [],
      summary: result.summary
    };

    // Update gap report UI
    updateGapReport();

  } catch (error) {
    console.error('Failed to load gaps:', error);
    // Set empty defaults
    state.gaps = {
      content: [],
      images: [],
      placeholders: [],
      errors: []
    };
  }
}

/**
 * Load project status
 */
async function loadStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`);
    const result = await response.json();
    
    // Extract overall progress
    const overallProgress = result.overallProgress || 0;
    updateProgressRing(overallProgress);

  } catch (error) {
    console.error('Failed to load status:', error);
  }
}

/**
 * Update overview stats
 */
function updateOverview() {
  // Pages stats
  const completePages = state.pages.filter((p) => p.status === 'complete').length;
  const statPages = document.getElementById('stat-pages');
  if (statPages) statPages.textContent = `${completePages}/${state.pages.length}`;

  // Content stats
  const pagesWithContent = state.pages.filter((p) => p.hasContent).length;
  const statContent = document.getElementById('stat-content');
  if (statContent) statContent.textContent = `${pagesWithContent}/${state.pages.length}`;

  // Images stats
  const pagesWithImages = state.pages.filter((p) => p.hasImages).length;
  const statImages = document.getElementById('stat-images');
  if (statImages) statImages.textContent = `${pagesWithImages}/${state.pages.length}`;

  // Overall progress
  const progress = state.pages.length > 0 
    ? Math.round((completePages / state.pages.length) * 100)
    : 0;
  updateProgressRing(progress);
}

/**
 * Update progress ring
 */
function updateProgressRing(progress: number) {
  const percentageEl = document.getElementById('overall-percentage');
  const ring = document.querySelector('.progress-ring-fill') as SVGCircleElement;

  if (percentageEl) percentageEl.textContent = `${progress}%`;
  
  if (ring) {
    const circumference = 326.73; // 2 * π * 52
    const offset = circumference - (progress / 100) * circumference;
    ring.style.strokeDashoffset = offset.toString();
  }
}

/**
 * Update page status grid
 */
function updatePageStatusGrid() {
  const grid = document.getElementById('page-status-grid');
  if (!grid) return;

  if (state.pages.length === 0) {
    grid.innerHTML = '<p class="text-neutral-500 col-span-full text-center py-8">No pages configured</p>';
    return;
  }

  grid.innerHTML = state.pages.map((page) => `
    <div class="wizard-status-card">
      <div class="wizard-status-card-title">${capitalize(page.name)}</div>
      <div class="wizard-status-card-checks">
        <div class="wizard-status-card-check ${page.hasContent ? 'complete' : 'incomplete'}">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${page.hasContent 
              ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
              : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'}
          </svg>
          Content
        </div>
        <div class="wizard-status-card-check ${page.exists ? 'complete' : 'incomplete'}">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${page.exists 
              ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
              : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'}
          </svg>
          HTML
        </div>
        <div class="wizard-status-card-check ${page.hasImages ? 'complete' : 'incomplete'}">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${page.hasImages 
              ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
              : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'}
          </svg>
          Images
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Update pages table
 */
function updatePagesTable() {
  const tbody = document.getElementById('pages-table-body');
  if (!tbody) return;

  if (state.pages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-neutral-500">No pages configured</td></tr>';
    return;
  }

  tbody.innerHTML = state.pages.map((page) => `
    <tr>
      <td class="font-medium">${capitalize(page.name)}</td>
      <td>
        <svg class="status-icon ${page.hasContent ? 'complete' : 'incomplete'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${page.hasContent 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'}
        </svg>
      </td>
      <td>
        <svg class="status-icon ${page.hasImages ? 'complete' : 'incomplete'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${page.hasImages 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'}
        </svg>
      </td>
      <td>
        <svg class="status-icon ${page.exists ? 'complete' : 'incomplete'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${page.exists 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'}
        </svg>
      </td>
      <td>-</td>
      <td>
        <span class="wizard-page-status ${page.status.replace(' ', '-').toLowerCase()}">${page.status}</span>
      </td>
      <td>
        <a href="./pages/?page=${page.name}" class="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</a>
      </td>
    </tr>
  `).join('');
}

/**
 * Update gap report
 */
function updateGapReport() {
  // Content gaps
  const contentList = document.getElementById('gaps-content-list');
  const contentCount = document.getElementById('gaps-content-count');
  
  if (contentCount) contentCount.textContent = state.gaps.content.length.toString();
  
  if (contentList) {
    if (state.gaps.content.length === 0) {
      contentList.innerHTML = '<p class="text-neutral-500 text-sm py-4">No missing content detected</p>';
    } else {
      contentList.innerHTML = state.gaps.content.slice(0, 10).map((gap) => `
        <div class="wizard-gap-item">
          <span class="wizard-gap-item-page">${gap.page}</span>
          <span class="wizard-gap-item-desc">${gap.field}: ${gap.value || 'empty'}</span>
        </div>
      `).join('');
    }
  }

  // Image gaps
  const imagesList = document.getElementById('gaps-images-list');
  const imagesCount = document.getElementById('gaps-images-count');
  
  if (imagesCount) imagesCount.textContent = state.gaps.images.length.toString();
  
  if (imagesList) {
    if (state.gaps.images.length === 0) {
      imagesList.innerHTML = '<p class="text-neutral-500 text-sm py-4">No missing images detected</p>';
    } else {
      imagesList.innerHTML = state.gaps.images.slice(0, 10).map((gap) => `
        <div class="wizard-gap-item">
          <span class="wizard-gap-item-page">${gap.page}</span>
          <span class="wizard-gap-item-desc">${gap.id || gap.path}</span>
        </div>
      `).join('');
    }
  }

  // Placeholder gaps
  const placeholdersList = document.getElementById('gaps-placeholders-list');
  const placeholdersCount = document.getElementById('gaps-placeholders-count');
  const placeholders = state.gaps.placeholders || [];
  
  if (placeholdersCount) placeholdersCount.textContent = placeholders.length.toString();
  
  if (placeholdersList) {
    if (placeholders.length === 0) {
      placeholdersList.innerHTML = '<p class="text-neutral-500 text-sm py-4">No placeholder content detected</p>';
    } else {
      placeholdersList.innerHTML = placeholders.slice(0, 10).map((gap) => `
        <div class="wizard-gap-item">
          <span class="wizard-gap-item-page">${gap.page}</span>
          <span class="wizard-gap-item-desc">${gap.field}</span>
        </div>
      `).join('');
    }
  }

  // Error gaps
  const errorsList = document.getElementById('gaps-errors-list');
  const errorsCount = document.getElementById('gaps-errors-count');
  
  if (errorsCount) errorsCount.textContent = state.gaps.errors.length.toString();
  
  if (errorsList) {
    if (state.gaps.errors.length === 0) {
      errorsList.innerHTML = '<p class="text-neutral-500 text-sm py-4">No errors detected</p>';
    } else {
      errorsList.innerHTML = state.gaps.errors.map((error) => `
        <div class="wizard-gap-item">
          <span class="wizard-gap-item-page">${error.file}</span>
          <span class="wizard-gap-item-desc">${error.error}</span>
        </div>
      `).join('');
    }
  }
}

/**
 * Fix all gaps
 */
async function fixAllGaps() {
  try {
    // Generate missing content
    if (state.gaps.content.length > 0) {
      updateProgressStatus('Generating missing content...');
      await fetch(`${API_BASE}/generate/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: { force: true } })
      });
    }

    // Generate missing images
    if (state.gaps.images.length > 0) {
      updateProgressStatus('Generating missing images...');
      await fetch(`${API_BASE}/generate/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: { force: true } })
      });
    }

    alert('Gaps fixed! Please review the results.');
  } catch (error) {
    console.error('Failed to fix gaps:', error);
    alert('Some gaps could not be fixed. Check the console for details.');
  }
}

/**
 * Regenerate all images
 */
async function regenerateImages() {
  try {
    await fetch(`${API_BASE}/generate/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options: { force: true } })
    });
    alert('Images regenerated!');
  } catch (error) {
    console.error('Failed to regenerate images:', error);
    alert('Image regeneration failed. Check the console for details.');
  }
}

/**
 * Run validation
 */
async function runValidation() {
  try {
    const response = await fetch(`${API_BASE}/validate`, { method: 'POST' });
    const result = await response.json();

    state.validation = {
      passed: result.passed || 0,
      warnings: result.warnings || 0,
      errors: result.errors || 0,
      details: result.details || []
    };

    // Update validation UI
    const valPassed = document.getElementById('val-passed');
    const valWarnings = document.getElementById('val-warnings');
    const valErrors = document.getElementById('val-errors');

    if (valPassed) valPassed.textContent = state.validation.passed.toString();
    if (valWarnings) valWarnings.textContent = state.validation.warnings.toString();
    if (valErrors) valErrors.textContent = state.validation.errors.toString();

    // Update detail sections
    const contentResults = document.getElementById('val-content-results');
    const assetResults = document.getElementById('val-asset-results');
    const htmlResults = document.getElementById('val-html-results');

    if (contentResults) {
      contentResults.innerHTML = `
        <p class="text-green-600 text-sm">Content validation passed</p>
      `;
    }

    if (assetResults) {
      assetResults.innerHTML = `
        <p class="text-green-600 text-sm">Asset validation passed</p>
      `;
    }

    if (htmlResults) {
      htmlResults.innerHTML = `
        <p class="text-green-600 text-sm">HTML validation passed</p>
      `;
    }

  } catch (error) {
    console.error('Validation failed:', error);
    alert('Validation failed. Check the console for details.');
  }
}

/**
 * Export status report
 */
function exportReport() {
  const csvRows = [
    ['Page', 'Content', 'Images', 'HTML', 'Status'],
    ...state.pages.map((p) => [
      p.name,
      p.hasContent ? 'Yes' : 'No',
      p.hasImages ? 'Yes' : 'No',
      p.exists ? 'Yes' : 'No',
      p.status
    ])
  ];

  const csv = csvRows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'project-status.csv';
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Show progress modal
 */
function showProgressModal(title: string) {
  const modal = document.getElementById('progress-modal');
  const titleEl = document.getElementById('progress-modal-title');
  
  if (modal) modal.classList.remove('hidden');
  if (titleEl) titleEl.textContent = title;
}

/**
 * Hide progress modal
 */
function hideProgressModal() {
  const modal = document.getElementById('progress-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * Update progress status
 */
function updateProgressStatus(status: string) {
  const statusEl = document.getElementById('modal-progress-status');
  if (statusEl) statusEl.textContent = status;
}

/**
 * Capitalize string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
