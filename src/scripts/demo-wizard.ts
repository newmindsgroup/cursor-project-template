/**
 * Demo Wizard Script
 * Handles guided tour, auto-population, and simulated generation for demo mode
 */

// ===== Demo Data =====
const demoData = {
  projectName: 'Serenity Wellness Center Website',
  clientName: 'Serenity Wellness Center',
  industry: 'healthcare',
  contactEmail: 'info@serenitywellness.com',
  projectDescription: 'A complete website redesign for Serenity Wellness Center, a premier spa and wellness facility offering massage therapy, facials, body treatments, and holistic wellness programs. The site should convey calm, professionalism, and luxury while driving online bookings.',
  targetLaunch: getFutureDate(60), // 60 days from now
  budgetRange: '10k-25k',
  aiProvider: 'cursor',
  imageProvider: 'google',
  uploadedFiles: [
    { name: 'company-brief.pdf', size: '245 KB', type: 'pdf' },
    { name: 'brand-guidelines.docx', size: '1.2 MB', type: 'doc' },
    { name: 'services-pricing.xlsx', size: '89 KB', type: 'xls' }
  ],
  extractedContent: {
    businessName: 'Serenity Wellness Center',
    industry: 'Health & Wellness, Spa Services',
    services: 'Massage Therapy, Facials, Body Treatments, Yoga Classes, Wellness Programs',
    targetAudience: 'Stressed professionals, self-care enthusiasts, athletes seeking recovery',
    brandVoice: 'Calming, professional, nurturing, aspirational'
  },
  selectedPages: ['homepage', 'about', 'services', 'contact', 'pricing']
};

// ===== Tour Steps =====
interface TourStep {
  id: string;
  title: string;
  text: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Project Wizard',
    text: 'This guided tour will walk you through the complete website project setup process. The wizard helps you configure AI providers, upload context, and generate a complete website automatically.',
    target: '.wizard-container',
    position: 'bottom'
  },
  {
    id: 'project-basics',
    title: 'Step 1: Project Basics',
    text: 'Start by entering your project and client information. This data helps the AI understand the context and generate relevant content. In demo mode, we\'ve pre-filled this with sample data.',
    target: '[data-panel="1"]',
    position: 'top',
    action: () => goToStep(1)
  },
  {
    id: 'project-fields',
    title: 'Pre-filled Demo Data',
    text: 'Notice the purple styling on form fields - this indicates demo data that\'s automatically populated. In a real project, you\'d enter your actual client information here.',
    target: '#project-name',
    position: 'bottom'
  },
  {
    id: 'ai-provider',
    title: 'Step 2: AI Provider',
    text: 'Choose which AI provider will generate your content. Options include OpenAI, Anthropic, Google AI, or the Cursor fallback which requires no API key.',
    target: '[data-panel="2"]',
    position: 'top',
    action: () => goToStep(2)
  },
  {
    id: 'ai-options',
    title: 'AI Provider Options',
    text: 'For the demo, we\'re using the Cursor Fallback which doesn\'t require an API key. In production, you can connect to any major AI provider for content generation.',
    target: '.wizard-radio-group',
    position: 'bottom'
  },
  {
    id: 'upload-context',
    title: 'Step 3: Upload Context Files',
    text: 'Upload business documents like brand guidelines, existing content, competitor research, and client questionnaires. The AI extracts insights from these files.',
    target: '[data-panel="3"]',
    position: 'top',
    action: () => goToStep(3)
  },
  {
    id: 'uploaded-files',
    title: 'Sample Uploaded Files',
    text: 'In demo mode, we\'ve simulated uploaded files including a company brief, brand guidelines, and pricing spreadsheet. The AI would analyze these in a real project.',
    target: '#uploaded-files',
    position: 'top'
  },
  {
    id: 'extracted-content',
    title: 'Extracted Insights',
    text: 'After parsing uploads, the wizard shows extracted business information. This data feeds into content generation, ensuring consistency with your brand.',
    target: '#extracted-preview',
    position: 'top'
  },
  {
    id: 'configure-pages',
    title: 'Step 4: Configure Pages',
    text: 'Select which pages to generate for your website. Each page can use different blueprints (templates) optimized for different purposes.',
    target: '[data-panel="4"]',
    position: 'top',
    action: () => goToStep(4)
  },
  {
    id: 'page-selection',
    title: 'Page Selection',
    text: 'Check the pages you want generated. Purple-highlighted cards show selected pages. You can also add custom pages for unique content needs.',
    target: '.wizard-page-grid',
    position: 'top'
  },
  {
    id: 'generate-step',
    title: 'Step 5: Review & Generate',
    text: 'Review your configuration and start the generation pipeline. The wizard creates personas, content, pages, and images automatically.',
    target: '[data-panel="5"]',
    position: 'top',
    action: () => goToStep(5)
  },
  {
    id: 'pipeline',
    title: 'Generation Pipeline',
    text: 'The pipeline runs 7 steps: setup, analysis, personas, content, pages, images, and deployment. Each step builds on the previous to create a complete website.',
    target: '.wizard-pipeline',
    position: 'top'
  },
  {
    id: 'generate-button',
    title: 'Ready to Generate!',
    text: 'Click "Simulate Generation" to see how the pipeline works. In demo mode, this shows a simulated process. In production, it actually generates your website!',
    target: '#generate-all-btn',
    position: 'top'
  }
];

// ===== State =====
let currentStep = 1;
let currentTourStep = 0;
let isTourActive = false;

// ===== Utility Functions =====
function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

function $$(selector: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll(selector);
}

// ===== Wizard Navigation =====
function goToStep(step: number): void {
  currentStep = step;
  
  // Update panels
  $$('.wizard-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const targetPanel = $(`[data-panel="${step}"]`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
  
  // Update step indicators
  $$('.wizard-step').forEach((stepEl, index) => {
    stepEl.classList.remove('active', 'completed');
    if (index + 1 < step) {
      stepEl.classList.add('completed');
    } else if (index + 1 === step) {
      stepEl.classList.add('active');
    }
  });
  
  // Update progress bar
  const progressFill = $('#progress-fill');
  if (progressFill) {
    const progress = ((step - 1) / 4) * 100;
    progressFill.style.width = `${progress}%`;
  }
  
  // Update navigation buttons
  const prevBtn = $('#prev-btn') as HTMLButtonElement;
  const nextBtn = $('#next-btn') as HTMLButtonElement;
  
  if (prevBtn) {
    prevBtn.disabled = step === 1;
  }
  
  if (nextBtn) {
    nextBtn.textContent = step === 5 ? 'Finish' : 'Next';
  }
}

function nextStep(): void {
  if (currentStep < 5) {
    goToStep(currentStep + 1);
  }
}

function prevStep(): void {
  if (currentStep > 1) {
    goToStep(currentStep - 1);
  }
}

// ===== Demo Data Population =====
function populateDemoData(): void {
  // Project basics
  const projectName = $('#project-name') as HTMLInputElement;
  const clientName = $('#client-name') as HTMLInputElement;
  const industry = $('#industry') as HTMLSelectElement;
  const contactEmail = $('#contact-email') as HTMLInputElement;
  const projectDescription = $('#project-description') as HTMLTextAreaElement;
  const targetLaunch = $('#target-launch') as HTMLInputElement;
  const budgetRange = $('#budget-range') as HTMLSelectElement;
  
  if (projectName) projectName.value = demoData.projectName;
  if (clientName) clientName.value = demoData.clientName;
  if (industry) industry.value = demoData.industry;
  if (contactEmail) contactEmail.value = demoData.contactEmail;
  if (projectDescription) projectDescription.value = demoData.projectDescription;
  if (targetLaunch) targetLaunch.value = demoData.targetLaunch;
  if (budgetRange) budgetRange.value = demoData.budgetRange;
  
  // AI provider
  const cursorRadio = $('input[name="aiProvider"][value="cursor"]') as HTMLInputElement;
  if (cursorRadio) cursorRadio.checked = true;
  
  // Image provider
  const googleRadio = $('input[name="imageProvider"][value="google"]') as HTMLInputElement;
  if (googleRadio) googleRadio.checked = true;
  
  // Update summary
  updateSummary();
}

function updateSummary(): void {
  const summaryProjectName = $('#summary-project-name');
  const summaryClientName = $('#summary-client-name');
  const summaryIndustry = $('#summary-industry');
  
  if (summaryProjectName) summaryProjectName.textContent = demoData.projectName;
  if (summaryClientName) summaryClientName.textContent = demoData.clientName;
  if (summaryIndustry) summaryIndustry.textContent = 'Healthcare';
}

// ===== Guided Tour =====
function startTour(): void {
  isTourActive = true;
  currentTourStep = 0;
  showTourStep(0);
  
  const overlay = $('#tour-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
  }
}

function endTour(): void {
  isTourActive = false;
  
  const overlay = $('#tour-overlay');
  const tooltip = $('#tour-tooltip');
  
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('active');
  }
  
  if (tooltip) {
    tooltip.classList.add('hidden');
  }
  
  // Remove spotlight from any elements
  $$('.demo-tour-spotlight').forEach(el => {
    el.classList.remove('demo-tour-spotlight');
  });
}

function showTourStep(stepIndex: number): void {
  const step = tourSteps[stepIndex];
  if (!step) {
    endTour();
    return;
  }
  
  // Execute action if defined (like navigating to a panel)
  if (step.action) {
    step.action();
  }
  
  // Small delay to let panel transitions complete
  setTimeout(() => {
    // Update tooltip content
    const titleEl = $('#tour-title');
    const textEl = $('#tour-text');
    const indicatorEl = $('#tour-step-indicator');
    
    if (titleEl) titleEl.textContent = step.title;
    if (textEl) textEl.textContent = step.text;
    if (indicatorEl) indicatorEl.textContent = `Step ${stepIndex + 1} of ${tourSteps.length}`;
    
    // Position tooltip
    const targetEl = $(step.target);
    const tooltip = $('#tour-tooltip');
    const arrow = $('#tour-arrow');
    
    if (targetEl && tooltip) {
      // Remove old spotlight
      $$('.demo-tour-spotlight').forEach(el => {
        el.classList.remove('demo-tour-spotlight');
      });
      
      // Add spotlight to target
      targetEl.classList.add('demo-tour-spotlight');
      
      // Calculate position
      const targetRect = targetEl.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = tooltip.offsetHeight || 200;
      const margin = 16;
      
      let top = 0;
      let left = 0;
      let arrowPosition = 'top';
      
      switch (step.position) {
        case 'bottom':
          top = targetRect.bottom + margin;
          left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
          arrowPosition = 'bottom';
          break;
        case 'top':
          top = targetRect.top - tooltipHeight - margin;
          left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
          arrowPosition = 'top';
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
          left = targetRect.left - tooltipWidth - margin;
          arrowPosition = 'left';
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
          left = targetRect.right + margin;
          arrowPosition = 'right';
          break;
      }
      
      // Keep tooltip in viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.classList.remove('hidden');
      
      // Position arrow
      if (arrow) {
        arrow.className = 'demo-tour-tooltip-arrow ' + arrowPosition;
      }
      
      // Scroll target into view if needed
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Update prev button state
    const prevBtn = $('#tour-prev-btn') as HTMLButtonElement;
    if (prevBtn) {
      prevBtn.disabled = stepIndex === 0;
    }
    
    // Update next button text
    const nextBtn = $('#tour-next-btn');
    if (nextBtn) {
      nextBtn.textContent = stepIndex === tourSteps.length - 1 ? 'Finish Tour' : 'Next';
    }
  }, 100);
}

function nextTourStep(): void {
  if (currentTourStep < tourSteps.length - 1) {
    currentTourStep++;
    showTourStep(currentTourStep);
  } else {
    endTour();
  }
}

function prevTourStep(): void {
  if (currentTourStep > 0) {
    currentTourStep--;
    showTourStep(currentTourStep);
  }
}

// ===== Simulated Generation Pipeline =====
interface PipelineStep {
  id: string;
  name: string;
  duration: number; // milliseconds
  message: string;
}

const pipelineSteps: PipelineStep[] = [
  { id: 'setup', name: 'Setup Project Files', duration: 1500, message: 'Creating PROJECT.md and SCOPE.md...' },
  { id: 'analyze', name: 'Analyze Business Context', duration: 2500, message: 'Extracting insights from uploaded documents...' },
  { id: 'personas', name: 'Generate User Personas', duration: 2000, message: 'Creating target audience profiles...' },
  { id: 'content', name: 'Generate Page Content', duration: 3000, message: 'Writing StoryBrand content for each page...' },
  { id: 'pages', name: 'Generate Page HTML', duration: 2500, message: 'Building pages from blueprints...' },
  { id: 'images', name: 'Generate Images', duration: 3500, message: 'Creating AI-generated images...' },
  { id: 'deploy', name: 'Deploy to Vercel', duration: 2000, message: 'Pushing to GitHub and deploying...' }
];

async function simulateGeneration(): Promise<void> {
  const progressContainer = $('#generation-progress');
  const progressFill = $('#generation-progress-fill');
  const progressStatus = $('#generation-status');
  const generateBtn = $('#generate-all-btn') as HTMLButtonElement;
  
  if (!progressContainer || !progressFill || !progressStatus) return;
  
  // Disable button
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Generating...
    `;
  }
  
  // Show progress
  progressContainer.classList.remove('hidden');
  
  let totalDuration = pipelineSteps.reduce((acc, step) => acc + step.duration, 0);
  let elapsed = 0;
  
  for (let i = 0; i < pipelineSteps.length; i++) {
    const step = pipelineSteps[i];
    const pipelineItem = $(`[data-pipeline="${step.id}"]`);
    
    // Mark as running
    if (pipelineItem) {
      pipelineItem.classList.add('running');
      pipelineItem.classList.remove('completed');
    }
    
    // Update status
    progressStatus.textContent = step.message;
    
    // Animate progress
    const startProgress = (elapsed / totalDuration) * 100;
    const endProgress = ((elapsed + step.duration) / totalDuration) * 100;
    
    await animateProgress(progressFill, startProgress, endProgress, step.duration);
    
    elapsed += step.duration;
    
    // Mark as completed
    if (pipelineItem) {
      pipelineItem.classList.remove('running');
      pipelineItem.classList.add('completed');
    }
  }
  
  // Complete
  progressStatus.textContent = 'Generation complete!';
  progressFill.style.width = '100%';
  
  // Show completion modal
  setTimeout(() => {
    showCompletionModal();
  }, 500);
}

function animateProgress(element: HTMLElement, start: number, end: number, duration: number): Promise<void> {
  return new Promise(resolve => {
    const startTime = performance.now();
    
    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * progress;
      
      element.style.width = `${current}%`;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(update);
  });
}

function showCompletionModal(): void {
  const modal = $('#completion-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function hideCompletionModal(): void {
  const modal = $('#completion-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function resetDemo(): void {
  // Hide completion modal
  hideCompletionModal();
  
  // Reset pipeline items
  $$('.wizard-pipeline-item').forEach(item => {
    item.classList.remove('running', 'completed');
  });
  
  // Hide and reset progress
  const progressContainer = $('#generation-progress');
  const progressFill = $('#generation-progress-fill');
  const progressStatus = $('#generation-status');
  
  if (progressContainer) progressContainer.classList.add('hidden');
  if (progressFill) progressFill.style.width = '0%';
  if (progressStatus) progressStatus.textContent = 'Initializing...';
  
  // Reset generate button
  const generateBtn = $('#generate-all-btn') as HTMLButtonElement;
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Simulate Generation
    `;
  }
  
  // Go back to step 1
  goToStep(1);
  
  // Re-populate demo data
  populateDemoData();
}

// ===== Portal Navigation =====
function setDemoContext(): void {
  // Store demo context in localStorage so other portals can detect demo mode
  const demoContext = {
    isDemo: true,
    projectName: demoData.projectName,
    clientName: demoData.clientName,
    generatedAt: new Date().toISOString(),
    pages: demoData.selectedPages,
    industry: demoData.industry
  };
  localStorage.setItem('wizardDemoContext', JSON.stringify(demoContext));
}

function clearDemoContext(): void {
  localStorage.removeItem('wizardDemoContext');
}

function navigateToPortal(portalPath: string): void {
  setDemoContext();
  window.location.href = portalPath;
}

function initPortalNavigation(): void {
  // Add click handlers to portal navigation links
  const portalLinks = $$('.demo-portal-card, .demo-nav-link');
  
  portalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Store demo context before navigation
      setDemoContext();
    });
  });
}

// ===== Event Handlers =====
function initEventHandlers(): void {
  // Navigation buttons
  const prevBtn = $('#prev-btn');
  const nextBtn = $('#next-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', prevStep);
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', nextStep);
  }
  
  // Step buttons
  $$('.wizard-step').forEach(stepBtn => {
    stepBtn.addEventListener('click', (e) => {
      const step = parseInt((e.currentTarget as HTMLElement).dataset.step || '1');
      goToStep(step);
    });
  });
  
  // Tour buttons
  const startTourBtn = $('#start-tour-btn');
  const tourCloseBtn = $('#tour-close-btn');
  const tourPrevBtn = $('#tour-prev-btn');
  const tourNextBtn = $('#tour-next-btn');
  
  if (startTourBtn) {
    startTourBtn.addEventListener('click', startTour);
  }
  
  if (tourCloseBtn) {
    tourCloseBtn.addEventListener('click', endTour);
  }
  
  if (tourPrevBtn) {
    tourPrevBtn.addEventListener('click', prevTourStep);
  }
  
  if (tourNextBtn) {
    tourNextBtn.addEventListener('click', nextTourStep);
  }
  
  // Generate button
  const generateBtn = $('#generate-all-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', simulateGeneration);
  }
  
  // Reset buttons
  const resetDemoBtn = $('#reset-demo-btn');
  const restartDemoBtn = $('#restart-demo-btn');
  
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', resetDemo);
  }
  
  if (restartDemoBtn) {
    restartDemoBtn.addEventListener('click', () => {
      hideCompletionModal();
      resetDemo();
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (isTourActive) {
      if (e.key === 'Escape') {
        endTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextTourStep();
      } else if (e.key === 'ArrowLeft') {
        prevTourStep();
      }
    }
  });
  
  // Click overlay to close tour
  const overlay = $('#tour-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        endTour();
      }
    });
  }
}

// ===== Initialization =====
function init(): void {
  console.log('Demo Wizard initialized');
  
  // Populate demo data
  populateDemoData();
  
  // Initialize event handlers
  initEventHandlers();
  
  // Initialize portal navigation handlers
  initPortalNavigation();
  
  // Go to step 1
  goToStep(1);
  
  // Set demo context for any portal navigation
  setDemoContext();
  
  // Auto-start tour after a short delay (optional)
  // setTimeout(startTour, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential testing
export {
  startTour,
  endTour,
  simulateGeneration,
  resetDemo,
  demoData,
  setDemoContext,
  clearDemoContext,
  navigateToPortal
};
