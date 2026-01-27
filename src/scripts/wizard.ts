/**
 * Project Setup Wizard
 * Multi-step form handling, file uploads, and generation pipeline
 * Includes: Progress persistence, Demo mode, Enhanced error handling
 */

// API base URL - in dev mode, use the wizard server
const API_BASE = 'http://localhost:3001/api';
const PROGRESS_KEY = 'wizard-progress';

// State
interface WizardState {
  currentStep: number;
  projectName: string;
  clientName: string;
  industry: string;
  contactEmail: string;
  projectDescription: string;
  targetLaunch: string;
  budgetRange: string;
  aiProvider: string;
  apiKey: string;
  imageProvider: string;
  imageApiKey: string;
  uploadedFiles: { name: string; path: string; size: number }[];
  selectedPages: string[];
  pageBlueprints: Record<string, string>;
  enableDeploy: boolean;
  isDemo: boolean;
  demoBusinessType: string;
}

const state: WizardState = {
  currentStep: 1,
  projectName: '',
  clientName: '',
  industry: '',
  contactEmail: '',
  projectDescription: '',
  targetLaunch: '',
  budgetRange: '',
  aiProvider: 'cursor',
  apiKey: '',
  imageProvider: 'google',
  imageApiKey: '',
  uploadedFiles: [],
  selectedPages: ['homepage', 'about', 'services', 'contact'],
  pageBlueprints: {},
  enableDeploy: true,
  isDemo: false,
  demoBusinessType: ''
};

// Demo business data
const demoBusinesses: Record<string, any> = {
  'wellness-center': {
    projectName: 'Serenity Wellness Center Website Redesign',
    clientName: 'Serenity Wellness Center',
    industry: 'healthcare',
    contactEmail: 'sarah@serenitywellness.com',
    projectDescription: 'Modern, calming website that communicates our spa services and makes booking easy. We need to showcase our massage therapy, skincare, body treatments, wellness programs, and yoga classes.',
    targetLaunch: '8 weeks',
    budgetRange: '25k-50k',
    selectedPages: ['homepage', 'about', 'services', 'contact', 'pricing'],
    files: ['serenity-brand-guide.pdf', 'serenity-services-menu.pdf', 'serenity-testimonials.docx']
  },
  'law-firm': {
    projectName: 'Barrett & Associates Website Redesign',
    clientName: 'Barrett & Associates, PLLC',
    industry: 'professional',
    contactEmail: 'jbarrett@barrettlaw.com',
    projectDescription: 'Professional law firm website that establishes trust and generates leads for our business law, estate planning, real estate, and employment law practices.',
    targetLaunch: '6 weeks',
    budgetRange: '25k-50k',
    selectedPages: ['homepage', 'about', 'services', 'contact', 'blog'],
    files: ['barrett-brand-guide.pdf', 'practice-areas.docx', 'attorney-bios.docx']
  },
  'consulting': {
    projectName: 'Summit Business Consulting Website',
    clientName: 'Summit Business Consulting',
    industry: 'professional',
    contactEmail: 'info@summitconsulting.com',
    projectDescription: 'High-converting website that showcases our strategic planning, operations optimization, financial advisory, and leadership development services to mid-market companies.',
    targetLaunch: '4 weeks',
    budgetRange: '10k-25k',
    selectedPages: ['homepage', 'about', 'services', 'contact', 'portfolio'],
    files: ['summit-capabilities.pdf', 'case-studies.docx', 'team-bios.docx']
  },
  'real-estate': {
    projectName: 'Keystone Property Group Website',
    clientName: 'Keystone Property Group',
    industry: 'real-estate',
    contactEmail: 'listings@keystonepg.com',
    projectDescription: 'Lead-generating real estate website with property listings, agent profiles, and easy contact forms for residential sales, commercial leasing, and property management.',
    targetLaunch: '5 weeks',
    budgetRange: '25k-50k',
    selectedPages: ['homepage', 'about', 'services', 'contact', 'portfolio'],
    files: ['keystone-brand-guide.pdf', 'agent-profiles.docx', 'service-areas.xlsx']
  },
  'dental': {
    projectName: 'Bright Smile Family Dentistry Website',
    clientName: 'Bright Smile Family Dentistry',
    industry: 'healthcare',
    contactEmail: 'office@brightsmile.com',
    projectDescription: 'Friendly, approachable website that highlights our general, cosmetic, restorative, and pediatric dentistry services and makes scheduling appointments easy.',
    targetLaunch: '4 weeks',
    budgetRange: '10k-25k',
    selectedPages: ['homepage', 'about', 'services', 'contact'],
    files: ['brightsmile-brand.pdf', 'services-list.docx', 'patient-reviews.docx']
  },
  'construction': {
    projectName: 'Cornerstone Construction Website',
    clientName: 'Cornerstone Commercial Construction',
    industry: 'manufacturing',
    contactEmail: 'projects@cornerstoneconstruction.com',
    projectDescription: 'Professional construction company website showcasing our ground-up construction, tenant improvements, renovation, and design-build services with project portfolio.',
    targetLaunch: '6 weeks',
    budgetRange: '25k-50k',
    selectedPages: ['homepage', 'about', 'services', 'contact', 'portfolio'],
    files: ['cornerstone-brand.pdf', 'project-portfolio.pdf', 'capabilities.docx']
  }
};

// ============================================
// Progress Persistence
// ============================================

function saveProgress(): void {
  const progressData = {
    savedAt: new Date().toISOString(),
    currentStep: state.currentStep,
    formData: {
      projectName: state.projectName,
      clientName: state.clientName,
      industry: state.industry,
      contactEmail: state.contactEmail,
      projectDescription: state.projectDescription,
      targetLaunch: state.targetLaunch,
      budgetRange: state.budgetRange,
      aiProvider: state.aiProvider,
      imageProvider: state.imageProvider,
      selectedPages: state.selectedPages,
      pageBlueprints: state.pageBlueprints,
      enableDeploy: state.enableDeploy
    }
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
  showAutoSaveIndicator();
}

function loadProgress(): boolean {
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (!saved) return false;
  
  try {
    const data = JSON.parse(saved);
    return data && data.formData && data.currentStep > 1;
  } catch {
    return false;
  }
}

function restoreProgress(): void {
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (!saved) return;
  
  try {
    const data = JSON.parse(saved);
    if (data && data.formData) {
      // Restore state
      Object.assign(state, data.formData);
      state.currentStep = data.currentStep;
      
      // Populate form fields
      populateFormFromState();
      
      // Go to saved step
      goToStep(state.currentStep);
    }
  } catch (error) {
    console.error('Error restoring progress:', error);
  }
}

function clearProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}

function showResumeDialog(): void {
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (!saved) return;
  
  try {
    const data = JSON.parse(saved);
    const savedAt = new Date(data.savedAt).toLocaleString();
    const projectName = data.formData?.projectName || 'Unnamed Project';
    
    // Create resume dialog
    const dialog = document.createElement('div');
    dialog.className = 'wizard-modal';
    dialog.id = 'resume-dialog';
    dialog.innerHTML = `
      <div class="wizard-modal-backdrop"></div>
      <div class="wizard-modal-content">
        <div class="wizard-modal-icon" style="background: var(--color-primary-100);">
          <svg class="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="wizard-modal-title">Resume Previous Session?</h3>
        <p class="wizard-modal-desc">
          You have an unsaved session for <strong>${projectName}</strong><br>
          <span class="text-sm text-neutral-500">Saved: ${savedAt}</span>
        </p>
        <div class="wizard-modal-actions" style="gap: 1rem;">
          <button type="button" id="resume-btn" class="wizard-btn wizard-btn-primary">
            Resume Session
          </button>
          <button type="button" id="start-fresh-btn" class="wizard-btn wizard-btn-secondary">
            Start Fresh
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('resume-btn')?.addEventListener('click', () => {
      restoreProgress();
      dialog.remove();
    });
    
    document.getElementById('start-fresh-btn')?.addEventListener('click', () => {
      clearProgress();
      dialog.remove();
    });
  } catch {
    // Invalid saved data, ignore
  }
}

function showAutoSaveIndicator(): void {
  let indicator = document.getElementById('auto-save-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'auto-save-indicator';
    indicator.className = 'fixed bottom-4 right-4 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 opacity-0 transition-opacity';
    indicator.innerHTML = `
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Progress saved
    `;
    document.body.appendChild(indicator);
  }
  
  indicator.style.opacity = '1';
  setTimeout(() => {
    indicator.style.opacity = '0';
  }, 2000);
}

function populateFormFromState(): void {
  const fieldMap: Record<string, string> = {
    'project-name': 'projectName',
    'client-name': 'clientName',
    'industry': 'industry',
    'contact-email': 'contactEmail',
    'project-description': 'projectDescription',
    'target-launch': 'targetLaunch',
    'budget-range': 'budgetRange'
  };
  
  Object.entries(fieldMap).forEach(([elementId, stateKey]) => {
    const el = document.getElementById(elementId) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (el && state[stateKey as keyof WizardState]) {
      el.value = state[stateKey as keyof WizardState] as string;
    }
  });
  
  // Restore AI provider
  const aiRadio = document.querySelector(`input[name="aiProvider"][value="${state.aiProvider}"]`) as HTMLInputElement;
  if (aiRadio) aiRadio.checked = true;
  
  // Restore image provider
  const imageRadio = document.querySelector(`input[name="imageProvider"][value="${state.imageProvider}"]`) as HTMLInputElement;
  if (imageRadio) imageRadio.checked = true;
  
  // Restore page selection
  document.querySelectorAll('input[name="pages"]').forEach((cb) => {
    const checkbox = cb as HTMLInputElement;
    checkbox.checked = state.selectedPages.includes(checkbox.value);
  });
}

// ============================================
// Demo Mode
// ============================================

function checkDemoMode(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const isDemo = urlParams.get('demo') === 'true';
  const businessType = urlParams.get('business') || 'wellness-center';
  
  if (isDemo) {
    state.isDemo = true;
    state.demoBusinessType = businessType;
    showDemoBanner(businessType);
    loadDemoData(businessType);
  }
}

function showDemoBanner(businessType: string): void {
  const businessNames: Record<string, string> = {
    'wellness-center': 'Serenity Wellness Center',
    'law-firm': 'Barrett & Associates Law Firm',
    'consulting': 'Summit Business Consulting',
    'real-estate': 'Keystone Property Group',
    'dental': 'Bright Smile Dental',
    'construction': 'Cornerstone Construction'
  };
  
  const banner = document.createElement('div');
  banner.className = 'bg-amber-100 border-b border-amber-200 px-4 py-3';
  banner.innerHTML = `
    <div class="container-custom">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">🎬</span>
          <div>
            <span class="font-semibold text-amber-900">DEMO MODE</span>
            <span class="text-amber-700 ml-2">${businessNames[businessType] || 'Sample Business'}</span>
          </div>
        </div>
        <span class="text-sm text-amber-600">All fields show exemplary responses for reference</span>
      </div>
    </div>
  `;
  
  const header = document.querySelector('header');
  if (header) {
    header.parentNode?.insertBefore(banner, header);
  }
}

function loadDemoData(businessType: string): void {
  const demoData = demoBusinesses[businessType];
  if (!demoData) return;
  
  // Set state from demo data
  state.projectName = demoData.projectName;
  state.clientName = demoData.clientName;
  state.industry = demoData.industry;
  state.contactEmail = demoData.contactEmail;
  state.projectDescription = demoData.projectDescription;
  state.targetLaunch = demoData.targetLaunch;
  state.budgetRange = demoData.budgetRange;
  state.selectedPages = demoData.selectedPages;
  state.aiProvider = 'cursor'; // Demo uses Cursor (no API key needed)
  
  // Populate form after DOM is ready
  setTimeout(() => {
    populateFormFromState();
    
    // Simulate uploaded files in the UI
    const filesContainer = document.getElementById('uploaded-files');
    if (filesContainer && demoData.files) {
      filesContainer.innerHTML = demoData.files.map((filename: string) => `
        <div class="wizard-file-item">
          <div class="wizard-file-item-icon pdf">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="wizard-file-item-info">
            <div class="wizard-file-item-name">${filename}</div>
            <div class="wizard-file-item-size">Demo file</div>
          </div>
        </div>
      `).join('');
      filesContainer.classList.remove('hidden');
    }
  }, 100);
}

// ============================================
// Enhanced Error Handling
// ============================================

interface ErrorInfo {
  type: string;
  message: string;
  suggestion: string;
}

const errorSuggestions: Record<string, ErrorInfo> = {
  'rate_limit': {
    type: 'Rate Limit',
    message: 'API rate limit exceeded',
    suggestion: 'Wait 60 seconds and try again, or switch to a different AI provider in settings.'
  },
  'invalid_key': {
    type: 'Authentication',
    message: 'Invalid API key',
    suggestion: 'Check your API key in the settings and test the connection.'
  },
  'network': {
    type: 'Network',
    message: 'Could not connect to server',
    suggestion: 'Check your internet connection and try again.'
  },
  'timeout': {
    type: 'Timeout',
    message: 'Request took too long',
    suggestion: 'Try again with a smaller batch or check your connection.'
  },
  'parse': {
    type: 'File Error',
    message: 'Could not parse file',
    suggestion: 'Check the file format and try uploading a different file.'
  },
  'unknown': {
    type: 'Error',
    message: 'An unexpected error occurred',
    suggestion: 'Try again or check the console for more details.'
  }
};

function showErrorModal(error: Error | string, stepId: string, onRetry: () => void, onSkip: () => void): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorType = detectErrorType(errorMessage);
  const errorInfo = errorSuggestions[errorType] || errorSuggestions.unknown;
  
  // Remove existing error modal
  document.getElementById('error-modal')?.remove();
  
  const modal = document.createElement('div');
  modal.className = 'wizard-modal';
  modal.id = 'error-modal';
  modal.innerHTML = `
    <div class="wizard-modal-backdrop"></div>
    <div class="wizard-modal-content" style="max-width: 500px;">
      <div class="wizard-modal-icon" style="background: #FEF2F2;">
        <svg class="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="wizard-modal-title">${errorInfo.type} Error</h3>
      <p class="text-neutral-700 mb-4">${errorInfo.message}</p>
      <div class="bg-neutral-50 rounded-lg p-4 mb-6">
        <p class="text-sm text-neutral-600"><strong>Suggested fix:</strong><br>${errorInfo.suggestion}</p>
      </div>
      <div class="flex gap-3 justify-center flex-wrap">
        <button type="button" id="error-retry-btn" class="wizard-btn wizard-btn-primary">
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
        <button type="button" id="error-skip-btn" class="wizard-btn wizard-btn-secondary">
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          Skip This Step
        </button>
        <button type="button" id="error-copy-btn" class="wizard-btn wizard-btn-ghost text-sm">
          Copy Error
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('error-retry-btn')?.addEventListener('click', () => {
    modal.remove();
    onRetry();
  });
  
  document.getElementById('error-skip-btn')?.addEventListener('click', () => {
    modal.remove();
    onSkip();
  });
  
  document.getElementById('error-copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(`Error: ${errorMessage}\nStep: ${stepId}`);
    const btn = document.getElementById('error-copy-btn');
    if (btn) btn.textContent = 'Copied!';
  });
}

function detectErrorType(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('rate') || lower.includes('limit') || lower.includes('429')) return 'rate_limit';
  if (lower.includes('key') || lower.includes('auth') || lower.includes('401') || lower.includes('403')) return 'invalid_key';
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connect')) return 'network';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'timeout';
  if (lower.includes('parse') || lower.includes('invalid')) return 'parse';
  return 'unknown';
}

// DOM Elements
const progressFill = document.getElementById('progress-fill') as HTMLDivElement;
const stepButtons = document.querySelectorAll('.wizard-step');
const panels = document.querySelectorAll('.wizard-panel');
const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
const generateBtn = document.getElementById('generate-all-btn') as HTMLButtonElement;
const completionModal = document.getElementById('completion-modal') as HTMLDivElement;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check for demo mode first
  checkDemoMode();
  
  // Check for saved progress (only if not in demo mode)
  if (!state.isDemo && loadProgress()) {
    showResumeDialog();
  }
  
  initSteps();
  initFormInputs();
  initAIProviderToggle();
  initFileUpload();
  initPageSelection();
  initCustomPages();
  initGenerateButton();
  initDeployOption();
  updateProgress();
});

/**
 * Initialize step navigation
 */
function initSteps() {
  stepButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step') || '1', 10);
      if (step <= state.currentStep) {
        goToStep(step);
      }
    });
  });

  prevBtn.addEventListener('click', () => {
    if (state.currentStep > 1) {
      goToStep(state.currentStep - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (validateCurrentStep()) {
      if (state.currentStep < 5) {
        goToStep(state.currentStep + 1);
      }
    }
  });
}

/**
 * Go to a specific step
 */
function goToStep(step: number) {
  state.currentStep = step;

  // Update step buttons
  stepButtons.forEach((btn) => {
    const btnStep = parseInt(btn.getAttribute('data-step') || '1', 10);
    btn.classList.remove('active', 'completed');
    if (btnStep === step) {
      btn.classList.add('active');
    } else if (btnStep < step) {
      btn.classList.add('completed');
    }
  });

  // Update panels
  panels.forEach((panel) => {
    const panelStep = parseInt(panel.getAttribute('data-panel') || '1', 10);
    panel.classList.toggle('active', panelStep === step);
  });

  // Update navigation buttons
  prevBtn.disabled = step === 1;
  nextBtn.textContent = step === 5 ? 'Finish' : 'Next';
  nextBtn.classList.toggle('hidden', step === 5);

  // Update progress bar
  updateProgress();

  // Update summary on step 5
  if (step === 5) {
    updateSummary();
  }
}

/**
 * Update progress bar
 */
function updateProgress() {
  const progress = ((state.currentStep - 1) / 4) * 100;
  progressFill.style.width = `${progress}%`;
}

/**
 * Validate current step
 */
function validateCurrentStep(): boolean {
  switch (state.currentStep) {
    case 1:
      const projectName = (document.getElementById('project-name') as HTMLInputElement).value;
      const clientName = (document.getElementById('client-name') as HTMLInputElement).value;
      if (!projectName || !clientName) {
        alert('Please fill in the required fields: Project Name and Client Name');
        return false;
      }
      collectFormData();
      return true;
    case 2:
      if (state.aiProvider !== 'cursor' && !state.apiKey) {
        alert('Please enter an API key or select Cursor Fallback');
        return false;
      }
      collectFormData();
      return true;
    default:
      collectFormData();
      return true;
  }
}

/**
 * Initialize form inputs
 */
function initFormInputs() {
  const inputs = [
    'project-name',
    'client-name',
    'industry',
    'contact-email',
    'project-description',
    'target-launch',
    'budget-range'
  ];

  inputs.forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (el) {
      el.addEventListener('change', collectFormData);
      el.addEventListener('input', collectFormData);
    }
  });
}

/**
 * Collect form data into state
 */
function collectFormData() {
  state.projectName = (document.getElementById('project-name') as HTMLInputElement)?.value || '';
  state.clientName = (document.getElementById('client-name') as HTMLInputElement)?.value || '';
  state.industry = (document.getElementById('industry') as HTMLSelectElement)?.value || '';
  state.contactEmail = (document.getElementById('contact-email') as HTMLInputElement)?.value || '';
  state.projectDescription = (document.getElementById('project-description') as HTMLTextAreaElement)?.value || '';
  state.targetLaunch = (document.getElementById('target-launch') as HTMLInputElement)?.value || '';
  state.budgetRange = (document.getElementById('budget-range') as HTMLSelectElement)?.value || '';
  state.apiKey = (document.getElementById('api-key') as HTMLInputElement)?.value || '';
  state.imageApiKey = (document.getElementById('image-api-key') as HTMLInputElement)?.value || '';

  // AI Provider
  const aiProviderRadio = document.querySelector('input[name="aiProvider"]:checked') as HTMLInputElement;
  state.aiProvider = aiProviderRadio?.value || 'cursor';

  // Image Provider
  const imageProviderRadio = document.querySelector('input[name="imageProvider"]:checked') as HTMLInputElement;
  state.imageProvider = imageProviderRadio?.value || 'google';

  // Pages
  const pageCheckboxes = document.querySelectorAll('input[name="pages"]:checked') as NodeListOf<HTMLInputElement>;
  state.selectedPages = Array.from(pageCheckboxes).map((cb) => cb.value);

  // Blueprints
  const blueprintSelects = document.querySelectorAll('.wizard-page-blueprint') as NodeListOf<HTMLSelectElement>;
  blueprintSelects.forEach((select) => {
    const pageName = select.name.replace('-blueprint', '');
    state.pageBlueprints[pageName] = select.value;
  });
  
  // Auto-save progress (debounced, not in demo mode)
  if (!state.isDemo) {
    saveProgress();
  }
}

/**
 * Initialize AI provider toggle
 */
function initAIProviderToggle() {
  const aiProviderRadios = document.querySelectorAll('input[name="aiProvider"]');
  const apiKeySection = document.getElementById('api-key-section');
  const toggleBtn = document.getElementById('toggle-api-key');
  const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
  const testBtn = document.getElementById('test-api-key');
  const statusEl = document.getElementById('api-key-status');

  aiProviderRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const value = (radio as HTMLInputElement).value;
      state.aiProvider = value;

      if (apiKeySection) {
        apiKeySection.classList.toggle('hidden', value === 'cursor');
      }
    });
  });

  // Toggle password visibility
  if (toggleBtn && apiKeyInput) {
    toggleBtn.addEventListener('click', () => {
      apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Test API connection
  if (testBtn && statusEl) {
    testBtn.addEventListener('click', async () => {
      const apiKey = apiKeyInput?.value;
      if (!apiKey) {
        statusEl.textContent = 'Please enter an API key';
        statusEl.className = 'wizard-field-hint mt-2 text-red-600';
        return;
      }

      statusEl.textContent = 'Testing connection...';
      statusEl.className = 'wizard-field-hint mt-2 text-blue-600';

      try {
        const response = await fetch(`${API_BASE}/test-connection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: state.aiProvider, apiKey })
        });

        const result = await response.json();

        if (result.valid) {
          statusEl.textContent = result.message;
          statusEl.className = 'wizard-field-hint mt-2 text-green-600';
        } else {
          statusEl.textContent = result.message || 'Invalid API key';
          statusEl.className = 'wizard-field-hint mt-2 text-red-600';
        }
      } catch (error) {
        statusEl.textContent = 'Could not connect to wizard server. Make sure npm run wizard:server is running.';
        statusEl.className = 'wizard-field-hint mt-2 text-yellow-600';
      }
    });
  }
}

/**
 * Initialize file upload
 */
function initFileUpload() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const uploadedFilesSection = document.getElementById('uploaded-files');
  const fileListContent = document.getElementById('file-list-content');

  if (!uploadZone || !fileInput) return;

  // Click to browse
  uploadZone.addEventListener('click', () => fileInput.click());

  // Drag and drop
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

  // File input change
  fileInput.addEventListener('change', async () => {
    if (fileInput.files) {
      await uploadFiles(fileInput.files);
    }
  });

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

      if (result.success && result.files) {
        state.uploadedFiles.push(...result.files);
        updateFileList();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Make sure the wizard server is running (npm run wizard:server)');
    }
  }

  function updateFileList() {
    if (!uploadedFilesSection || !fileListContent) return;

    uploadedFilesSection.classList.toggle('hidden', state.uploadedFiles.length === 0);

    fileListContent.innerHTML = state.uploadedFiles.map((file, index) => {
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
            <button type="button" class="wizard-file-item-btn" data-remove="${index}">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add remove handlers
    fileListContent.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-remove') || '0', 10);
        state.uploadedFiles.splice(index, 1);
        updateFileList();
      });
    });
  }

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
}

/**
 * Initialize page selection
 */
function initPageSelection() {
  const pageCheckboxes = document.querySelectorAll('input[name="pages"]');

  pageCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', collectFormData);
  });
}

/**
 * Initialize custom pages
 */
function initCustomPages() {
  const addBtn = document.getElementById('add-custom-page');
  const container = document.getElementById('custom-pages-container');

  if (!addBtn || !container) return;

  addBtn.addEventListener('click', () => {
    const pageName = prompt('Enter page name (e.g., "team" or "faq"):');
    if (!pageName) return;

    const slug = pageName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const pageHtml = `
      <div class="wizard-custom-page-item" data-page="${slug}">
        <label class="wizard-page-card">
          <input type="checkbox" name="pages" value="${slug}" checked />
          <div class="wizard-page-card-content">
            <div class="wizard-page-card-header">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="wizard-page-card-title">${pageName}</span>
            </div>
            <p class="wizard-page-card-desc">Custom page</p>
            <select class="wizard-page-blueprint" name="${slug}-blueprint">
              <option value="minimal">Minimal</option>
              <option value="landing">Landing</option>
            </select>
          </div>
        </label>
        <button type="button" class="wizard-remove-custom" data-remove="${slug}">Remove</button>
      </div>
    `;

    container.classList.remove('hidden');
    container.insertAdjacentHTML('beforeend', pageHtml);

    // Add remove handler
    container.querySelector(`[data-remove="${slug}"]`)?.addEventListener('click', () => {
      container.querySelector(`[data-page="${slug}"]`)?.remove();
      if (!container.children.length) {
        container.classList.add('hidden');
      }
      collectFormData();
    });

    collectFormData();
  });
}

/**
 * Initialize deploy option
 */
function initDeployOption() {
  const deployCheckbox = document.getElementById('enable-deploy') as HTMLInputElement;
  const deployPrereqs = document.getElementById('deploy-prereqs');
  
  if (deployCheckbox) {
    deployCheckbox.addEventListener('change', () => {
      state.enableDeploy = deployCheckbox.checked;
      if (deployPrereqs) {
        deployPrereqs.classList.toggle('hidden', !deployCheckbox.checked);
      }
    });
  }
}

/**
 * Update summary on step 5
 */
function updateSummary() {
  const summaryProjectName = document.getElementById('summary-project-name');
  const summaryClientName = document.getElementById('summary-client-name');
  const summaryIndustry = document.getElementById('summary-industry');
  const summaryAiProvider = document.getElementById('summary-ai-provider');
  const summaryImageProvider = document.getElementById('summary-image-provider');
  const summaryFiles = document.getElementById('summary-files');
  const summaryPages = document.getElementById('summary-pages');

  if (summaryProjectName) summaryProjectName.textContent = state.projectName || '-';
  if (summaryClientName) summaryClientName.textContent = state.clientName || '-';
  if (summaryIndustry) summaryIndustry.textContent = state.industry || '-';
  if (summaryAiProvider) summaryAiProvider.textContent = state.aiProvider || '-';
  if (summaryImageProvider) summaryImageProvider.textContent = state.imageProvider || '-';
  
  if (summaryFiles) {
    summaryFiles.textContent = state.uploadedFiles.length > 0
      ? `${state.uploadedFiles.length} file(s) uploaded`
      : 'No files uploaded';
  }

  if (summaryPages) {
    summaryPages.innerHTML = state.selectedPages
      .map((page) => `<li>${page}</li>`)
      .join('');
  }
}

/**
 * Initialize generate button
 */
function initGenerateButton() {
  if (!generateBtn) return;

  generateBtn.addEventListener('click', async () => {
    await runGeneration();
  });
}

/**
 * Run the generation pipeline
 */
async function runGeneration() {
  const progressSection = document.getElementById('generation-progress');
  const progressFill = document.getElementById('generation-progress-fill');
  const progressStatus = document.getElementById('generation-status');
  const pipelineItems = document.querySelectorAll('.wizard-pipeline-item');

  if (progressSection) progressSection.classList.remove('hidden');
  if (generateBtn) generateBtn.disabled = true;

  const steps = ['setup', 'analyze', 'personas', 'content', 'pages', 'images'];
  if (state.enableDeploy) {
    steps.push('deploy');
  }
  
  let currentStepIndex = 0;
  let deployUrl = '';

  function updatePipelineItem(stepId: string, status: 'running' | 'completed' | 'error') {
    const item = document.querySelector(`[data-pipeline="${stepId}"]`);
    if (item) {
      item.classList.remove('running', 'completed', 'error');
      item.classList.add(status);
    }
  }

  function updateProgress(stepIndex: number, status: string) {
    const progress = ((stepIndex + 1) / steps.length) * 100;
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressStatus) progressStatus.textContent = status;
  }

  try {
    // Save settings first
    await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: {
          name: state.projectName,
          client: state.clientName,
          industry: state.industry,
          contact: state.contactEmail,
          description: state.projectDescription,
          targetLaunch: state.targetLaunch
        },
        ai: {
          apiKeys: {
            openai: state.aiProvider === 'openai' ? state.apiKey : '',
            anthropic: state.aiProvider === 'anthropic' ? state.apiKey : '',
            google: state.aiProvider === 'google' ? state.apiKey : '',
            nanobanana: state.imageProvider === 'nanobanana' ? state.imageApiKey : ''
          },
          preferences: {
            defaultProvider: state.aiProvider === 'cursor' ? 'auto' : state.aiProvider,
            imageProvider: state.imageProvider
          }
        }
      })
    });

    // Parse uploaded files
    if (state.uploadedFiles.length > 0) {
      updateProgress(0, 'Processing uploaded files...');
      await fetch(`${API_BASE}/parse`, { method: 'POST' });
    }

    // Run generation for each step with enhanced error handling
    async function runStep(stepIndex: number): Promise<void> {
      if (stepIndex >= steps.length) return;
      
      const step = steps[stepIndex];
      currentStepIndex = stepIndex;
      
      updatePipelineItem(step, 'running');
      updateProgress(stepIndex, `Running ${step}...`);

      try {
        if (step === 'deploy') {
          // Handle deployment separately
          const deployResponse = await fetch(`${API_BASE}/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          
          const deployResult = await deployResponse.json();
          if (deployResult.success && deployResult.url) {
            deployUrl = deployResult.url;
          } else if (!deployResult.success) {
            throw new Error(deployResult.message || 'Deployment failed');
          }
        } else {
          const response = await fetch(`${API_BASE}/generate/${step}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              options: {
                pages: state.selectedPages
              }
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Step ${step} failed`);
          }
        }
        
        updatePipelineItem(step, 'completed');
        // Continue to next step
        await runStep(stepIndex + 1);
        
      } catch (stepError) {
        console.error(`Step ${step} failed:`, stepError);
        updatePipelineItem(step, 'error');
        
        // Show error modal with retry/skip options
        await new Promise<void>((resolve) => {
          showErrorModal(
            stepError as Error,
            step,
            async () => {
              // Retry this step
              await runStep(stepIndex);
              resolve();
            },
            async () => {
              // Skip to next step
              await runStep(stepIndex + 1);
              resolve();
            }
          );
        });
      }
    }
    
    // Start running steps
    await runStep(0);

    // Show completion modal
    updateProgress(steps.length, 'Complete!');
    
    // Update deploy status in modal
    const deployStatus = document.getElementById('deploy-status');
    const deployUrlInput = document.getElementById('deploy-url') as HTMLInputElement;
    const copyUrlBtn = document.getElementById('copy-url-btn');
    
    if (deployUrl && deployStatus && deployUrlInput) {
      deployStatus.classList.remove('hidden');
      deployUrlInput.value = deployUrl;
      
      if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', () => {
          deployUrlInput.select();
          document.execCommand('copy');
          copyUrlBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyUrlBtn.textContent = 'Copy';
          }, 2000);
        });
      }
    }
    
    setTimeout(() => {
      if (completionModal) completionModal.classList.remove('hidden');
    }, 500);

  } catch (error) {
    console.error('Generation failed:', error);
    updateProgress(currentStepIndex, `Error: ${error}`);
    alert('Generation failed. Check the console for details.');
  } finally {
    if (generateBtn) generateBtn.disabled = false;
  }
}
