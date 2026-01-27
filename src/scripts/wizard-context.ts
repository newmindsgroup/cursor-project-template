/**
 * Wizard Context Manager
 * Add context files, view extracted content, regenerate sections
 */

const API_BASE = 'http://localhost:3001/api';

// State
interface ContextState {
  files: { name: string; path: string; size: number; modified?: string }[];
  extracted: {
    summary?: string;
    audience?: string;
    services?: string;
    brand?: string;
    dataPoints?: any[];
    rawText?: string;
  };
  projectInfo: {
    projectName?: string;
    clientName?: string;
    industry?: string;
    contactEmail?: string;
    description?: string;
    goals?: string;
  };
}

const state: ContextState = {
  files: [],
  extracted: {},
  projectInfo: {}
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFileUpload();
  loadExistingFiles();
  loadExtractedContent();
  loadProjectInfo();
  initRegenerateButtons();
  initProjectForm();
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
 * Initialize file upload
 */
function initFileUpload() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;

  if (!uploadZone || !fileInput) return;

  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    
    const files = e.dataTransfer?.files;
    if (files) {
      await uploadFiles(files);
    }
  });

  fileInput.addEventListener('change', async () => {
    if (fileInput.files) {
      await uploadFiles(fileInput.files);
    }
  });

  // Process files button
  const processBtn = document.getElementById('process-files-btn');
  if (processBtn) {
    processBtn.addEventListener('click', async () => {
      processBtn.textContent = 'Processing...';
      processBtn.setAttribute('disabled', 'true');
      
      try {
        await fetch(`${API_BASE}/parse`, { method: 'POST' });
        await loadExtractedContent();
        alert('Files processed successfully!');
      } catch (error) {
        console.error('Processing failed:', error);
        alert('Processing failed. Check the console for details.');
      } finally {
        processBtn.textContent = 'Re-process All Files';
        processBtn.removeAttribute('disabled');
      }
    });
  }
}

/**
 * Upload files
 */
async function uploadFiles(files: FileList) {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      await loadExistingFiles();
    }
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed. Make sure the wizard server is running.');
  }
}

/**
 * Load existing files
 */
async function loadExistingFiles() {
  const container = document.getElementById('existing-files-content');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/files`);
    const result = await response.json();

    state.files = result.files || [];

    if (state.files.length === 0) {
      container.innerHTML = '<p class="text-sm text-neutral-500">No files uploaded yet</p>';
      return;
    }

    container.innerHTML = state.files.map((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const iconClass = getFileIconClass(ext);
      const size = formatFileSize(file.size);

      return `
        <div class="wizard-file-item">
          <div class="wizard-file-item-icon ${iconClass}">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="wizard-file-item-info">
            <div class="wizard-file-item-name">${file.name}</div>
            <div class="wizard-file-item-size">${size}</div>
          </div>
          <div class="wizard-file-item-actions">
            <button type="button" class="wizard-file-item-btn" data-delete="${file.name}">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add delete handlers
    container.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const filename = btn.getAttribute('data-delete');
        if (filename && confirm(`Delete ${filename}?`)) {
          await deleteFile(filename);
        }
      });
    });

  } catch (error) {
    container.innerHTML = '<p class="text-sm text-red-500">Could not load files. Is the wizard server running?</p>';
  }
}

/**
 * Delete a file
 */
async function deleteFile(filename: string) {
  try {
    await fetch(`${API_BASE}/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
    await loadExistingFiles();
  } catch (error) {
    console.error('Delete failed:', error);
  }
}

/**
 * Load extracted content
 */
async function loadExtractedContent() {
  try {
    const response = await fetch(`${API_BASE}/extracted`);
    const data = await response.json();

    state.extracted = data.consolidated || {};

    // Update UI
    const summaryEl = document.getElementById('extract-summary');
    const audienceEl = document.getElementById('extract-audience');
    const servicesEl = document.getElementById('extract-services');
    const brandEl = document.getElementById('extract-brand');
    const dataEl = document.getElementById('extract-data');

    if (summaryEl) {
      summaryEl.innerHTML = state.extracted.summary 
        ? `<p>${state.extracted.summary}</p>`
        : '<p class="text-neutral-500 italic">No summary extracted yet.</p>';
    }

    if (audienceEl) {
      audienceEl.innerHTML = state.extracted.audience
        ? `<p>${state.extracted.audience}</p>`
        : '<p class="text-neutral-500 italic">No audience data extracted.</p>';
    }

    if (servicesEl) {
      servicesEl.innerHTML = state.extracted.services
        ? `<p>${state.extracted.services}</p>`
        : '<p class="text-neutral-500 italic">No services/products data extracted.</p>';
    }

    if (brandEl) {
      brandEl.innerHTML = state.extracted.brand
        ? `<p>${state.extracted.brand}</p>`
        : '<p class="text-neutral-500 italic">No brand information extracted.</p>';
    }

    if (dataEl && state.extracted.dataPoints) {
      if (state.extracted.dataPoints.length > 0) {
        dataEl.innerHTML = state.extracted.dataPoints.map((dp) => `
          <div class="p-3 bg-white rounded border border-neutral-200">
            <div class="font-medium text-neutral-900">${dp.source}</div>
            <div class="text-sm text-neutral-600">
              ${dp.sheet ? `Sheet: ${dp.sheet} | ` : ''}
              ${dp.rowCount} rows | Headers: ${dp.headers?.slice(0, 5).join(', ')}${dp.headers?.length > 5 ? '...' : ''}
            </div>
          </div>
        `).join('');
      } else {
        dataEl.innerHTML = '<p class="text-neutral-500 italic">No structured data extracted.</p>';
      }
    }

  } catch (error) {
    console.error('Failed to load extracted content:', error);
  }
}

/**
 * Load project info
 */
async function loadProjectInfo() {
  try {
    const response = await fetch(`${API_BASE}/settings`);
    const settings = await response.json();

    state.projectInfo = settings.project || {};

    // Populate form
    const fields = ['projectName', 'clientName', 'industry', 'contact', 'description', 'goals'];
    fields.forEach((field) => {
      const el = document.getElementById(`edit-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (el && state.projectInfo[field as keyof typeof state.projectInfo]) {
        el.value = state.projectInfo[field as keyof typeof state.projectInfo] as string;
      }
    });

  } catch (error) {
    console.error('Failed to load project info:', error);
  }
}

/**
 * Initialize project form
 */
function initProjectForm() {
  const form = document.getElementById('project-info-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form as HTMLFormElement);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: data })
      });

      alert('Project info saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Check the console for details.');
    }
  });
}

/**
 * Initialize regenerate buttons
 */
function initRegenerateButtons() {
  const regenBtns = document.querySelectorAll('[data-regen]');
  const progressEl = document.getElementById('regen-progress');
  const progressFill = document.getElementById('regen-progress-fill');
  const progressStatus = document.getElementById('regen-status');

  regenBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.getAttribute('data-regen');
      if (!action) return;

      btn.setAttribute('disabled', 'true');
      if (progressEl) progressEl.classList.remove('hidden');
      if (progressStatus) progressStatus.textContent = `Running ${action}...`;
      if (progressFill) progressFill.style.width = '50%';

      try {
        await fetch(`${API_BASE}/generate/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        if (progressFill) progressFill.style.width = '100%';
        if (progressStatus) progressStatus.textContent = 'Complete!';
        
        setTimeout(() => {
          if (progressEl) progressEl.classList.add('hidden');
        }, 2000);

      } catch (error) {
        console.error('Regeneration failed:', error);
        if (progressStatus) progressStatus.textContent = 'Failed. Check console for details.';
      } finally {
        btn.removeAttribute('disabled');
      }
    });
  });

  // Page-specific regeneration
  const pageSelect = document.getElementById('regen-page-select') as HTMLSelectElement;
  const pageBtn = document.getElementById('regen-page-btn');

  if (pageSelect && pageBtn) {
    pageBtn.addEventListener('click', async () => {
      const page = pageSelect.value;
      if (!page) {
        alert('Please select a page');
        return;
      }

      pageBtn.setAttribute('disabled', 'true');
      if (progressEl) progressEl.classList.remove('hidden');
      if (progressStatus) progressStatus.textContent = `Regenerating ${page}...`;

      try {
        await fetch(`${API_BASE}/generate/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options: { page } })
        });

        if (progressStatus) progressStatus.textContent = 'Complete!';
        
        setTimeout(() => {
          if (progressEl) progressEl.classList.add('hidden');
        }, 2000);

      } catch (error) {
        console.error('Regeneration failed:', error);
        if (progressStatus) progressStatus.textContent = 'Failed. Check console for details.';
      } finally {
        pageBtn.removeAttribute('disabled');
      }
    });
  }
}

// Helper functions
function getFileIconClass(ext: string): string {
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'xls';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  return 'default';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
