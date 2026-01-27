// Project Portal Dashboard
// Handles progress visualization, phase timeline, and deliverable tracking

interface Phase {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  description: string;
  docsFolder: string;
  deliverables: Deliverable[];
}

interface Deliverable {
  id: string;
  name: string;
  file: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  required: boolean;
  clientVisible: boolean;
  exists?: boolean;
  statusSource?: string;
}

interface ProjectStatus {
  version: string;
  projectName: string;
  lastUpdated: string;
  lastScanned: string;
  overallProgress: number;
  currentPhase: string;
  phases: Phase[];
  overrides: Record<string, { status?: string; progress?: number }>;
  notes: string;
  risks: string[];
  blockers: string[];
}

class ProjectPortal {
  private statusData: ProjectStatus | null = null;
  private isInternalView: boolean = false;

  constructor() {
    this.isInternalView = window.location.pathname.includes('/internal/');
    this.init();
  }

  private async init() {
    await this.loadStatusData();
    this.renderDashboard();
    this.setupEventListeners();
  }

  private async loadStatusData() {
    try {
      // Try multiple paths for flexibility in different environments
      const paths = [
        '/data/project-status.json',
        '../data/project-status.json',
        '../../data/project-status.json',
        '../../../data/project-status.json'
      ];
      
      let loaded = false;
      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            this.statusData = await response.json();
            loaded = true;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!loaded) {
        throw new Error('Failed to load status data from any path');
      }
    } catch (error) {
      console.error('Error loading project status:', error);
      // Use embedded data if fetch fails
      const embedded = document.getElementById('project-status-data');
      if (embedded && embedded.textContent && embedded.textContent.trim() !== '{}') {
        this.statusData = JSON.parse(embedded.textContent);
      } else {
        // Use default data structure
        this.statusData = this.getDefaultStatusData();
      }
    }
  }

  private getDefaultStatusData(): ProjectStatus {
    return {
      version: '1.0.0',
      projectName: 'New Project',
      lastUpdated: new Date().toISOString(),
      lastScanned: '',
      overallProgress: 0,
      currentPhase: 'brief',
      phases: [
        { id: 'brief', name: 'Brief', order: 1, status: 'pending', progress: 0, description: 'Project brief', docsFolder: 'docs/01-brief', deliverables: [] },
        { id: 'discovery', name: 'Discovery', order: 2, status: 'pending', progress: 0, description: 'Research', docsFolder: 'docs/02-discovery', deliverables: [] },
        { id: 'requirements', name: 'Requirements', order: 3, status: 'pending', progress: 0, description: 'Requirements', docsFolder: 'docs/03-requirements', deliverables: [] },
        { id: 'ux', name: 'UX', order: 4, status: 'pending', progress: 0, description: 'UX Design', docsFolder: 'docs/04-ux', deliverables: [] },
        { id: 'architecture', name: 'Architecture', order: 5, status: 'pending', progress: 0, description: 'Technical design', docsFolder: 'docs/05-architecture', deliverables: [] },
        { id: 'implementation', name: 'Build', order: 6, status: 'pending', progress: 0, description: 'Implementation', docsFolder: 'docs/06-implementation', deliverables: [] },
        { id: 'qa', name: 'QA', order: 7, status: 'pending', progress: 0, description: 'Testing', docsFolder: 'docs/07-qa', deliverables: [] },
        { id: 'launch', name: 'Launch', order: 8, status: 'pending', progress: 0, description: 'Go-live', docsFolder: 'docs/08-launch', deliverables: [] }
      ],
      overrides: {},
      notes: '',
      risks: [],
      blockers: []
    };
  }

  private renderDashboard() {
    if (!this.statusData) return;

    this.renderProgressOverview();
    this.renderProgressRing();
    this.renderPhaseTimeline();
    this.renderDeliverables();
    this.renderQuickLinks();

    if (this.isInternalView) {
      this.renderInternalExtras();
    }
  }

  private renderProgressOverview() {
    const container = document.getElementById('progress-overview');
    if (!container || !this.statusData) return;

    const completedPhases = this.statusData.phases.filter(p => p.status === 'completed').length;
    const totalPhases = this.statusData.phases.length;
    const totalDeliverables = this.statusData.phases.reduce((sum, p) => sum + p.deliverables.length, 0);
    const completedDeliverables = this.statusData.phases.reduce(
      (sum, p) => sum + p.deliverables.filter(d => d.status === 'completed').length,
      0
    );

    container.innerHTML = `
      <div class="progress-stat-card">
        <div class="progress-stat-value">${this.statusData.overallProgress}%</div>
        <div class="progress-stat-label">Overall Progress</div>
      </div>
      <div class="progress-stat-card">
        <div class="progress-stat-value">${completedPhases}/${totalPhases}</div>
        <div class="progress-stat-label">Phases Complete</div>
      </div>
      <div class="progress-stat-card">
        <div class="progress-stat-value">${completedDeliverables}/${totalDeliverables}</div>
        <div class="progress-stat-label">Deliverables Complete</div>
      </div>
    `;
  }

  private renderProgressRing() {
    const container = document.getElementById('progress-ring');
    if (!container || !this.statusData) return;

    const progress = this.statusData.overallProgress;
    const circumference = 2 * Math.PI * 60; // radius = 60
    const offset = circumference - (progress / 100) * circumference;

    container.innerHTML = `
      <div class="progress-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle class="progress-ring-bg" cx="80" cy="80" r="60" />
          <circle 
            class="progress-ring-fill" 
            cx="80" 
            cy="80" 
            r="60"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
          />
        </svg>
        <div class="progress-ring-text">
          <span class="progress-ring-percentage">${progress}%</span>
          <span class="progress-ring-label">Complete</span>
        </div>
      </div>
    `;
  }

  private renderPhaseTimeline() {
    const container = document.getElementById('phase-timeline');
    if (!container || !this.statusData) return;

    const phases = this.statusData.phases;
    const currentPhaseIndex = phases.findIndex(p => p.id === this.statusData?.currentPhase);
    const progressWidth = currentPhaseIndex >= 0 
      ? ((currentPhaseIndex + (phases[currentPhaseIndex].progress / 100)) / phases.length) * 100
      : 0;

    const phaseItems = phases.map((phase, index) => {
      const isCurrent = phase.id === this.statusData?.currentPhase;
      const isCompleted = phase.status === 'completed';
      const statusClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';
      const statusText = isCompleted ? 'Complete' : isCurrent ? 'In Progress' : 'Upcoming';

      return `
        <div class="phase-item ${statusClass}" data-phase="${phase.id}">
          <div class="phase-item-dot"></div>
          <div class="phase-item-label">${phase.name}</div>
          <div class="phase-item-status">${statusText}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="phase-timeline">
        <div class="phase-timeline-line"></div>
        <div class="phase-timeline-progress" style="width: ${progressWidth}%"></div>
        <div class="phase-timeline-items">
          ${phaseItems}
        </div>
      </div>
    `;
  }

  private renderDeliverables() {
    const container = document.getElementById('deliverables-grid');
    if (!container || !this.statusData) return;

    const deliverables = this.statusData.phases.flatMap(phase => 
      phase.deliverables
        .filter(d => this.isInternalView || d.clientVisible)
        .map(d => ({ ...d, phaseName: phase.name, phaseId: phase.id }))
    );

    const cards = deliverables.map(d => {
      const statusClass = d.status.replace('-', '-');
      const statusLabel = this.formatStatus(d.status);
      const statusIcon = this.getStatusIcon(d.status);

      return `
        <div class="deliverable-card" data-deliverable="${d.id}">
          <div class="deliverable-card-header">
            <div class="deliverable-card-title">${d.name}</div>
            <div class="deliverable-card-status">
              <span class="status-badge ${statusClass}">
                ${statusIcon}
                ${statusLabel}
              </span>
            </div>
          </div>
          <div class="deliverable-card-meta">
            <span>${d.phaseName}</span>
            ${d.required ? ' • Required' : ''}
          </div>
          ${this.isInternalView ? `
            <div class="file-path">${d.file}</div>
            ${d.statusSource ? `<div class="text-xs text-neutral-400 mt-1">Source: ${d.statusSource}</div>` : ''}
          ` : ''}
          ${d.file && d.file.endsWith('.html') ? `
            <a href="/${d.file}" class="deliverable-card-link">
              View
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = cards || '<div class="empty-state"><p>No deliverables found</p></div>';
  }

  private renderQuickLinks() {
    const container = document.getElementById('quick-links');
    if (!container) return;

    const links = [
      {
        title: 'UX Assets',
        desc: 'Personas & Flows',
        href: '/pages/project/ux/',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>`
      },
      {
        title: 'Wireframes',
        desc: 'Content Review',
        href: '/pages/project/wireframes/',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>`
      },
      {
        title: 'Prototype',
        desc: 'Live Preview',
        href: '/pages/index.html',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>`
      },
      {
        title: 'Handoff',
        desc: 'Dev Portal',
        href: '/pages/handoff/',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>`
      }
    ];

    container.innerHTML = links.map(link => `
      <a href="${link.href}" class="quick-link">
        <div class="quick-link-icon">${link.icon}</div>
        <div class="quick-link-title">${link.title}</div>
        <div class="quick-link-desc">${link.desc}</div>
      </a>
    `).join('');
  }

  private renderInternalExtras() {
    // Render risks and blockers
    const risksContainer = document.getElementById('risks-blockers');
    if (risksContainer && this.statusData) {
      const risks = this.statusData.risks || [];
      const blockers = this.statusData.blockers || [];

      if (risks.length > 0 || blockers.length > 0) {
        risksContainer.innerHTML = `
          ${blockers.length > 0 ? `
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-red-700 mb-2">Blockers</h4>
              ${blockers.map(b => `
                <div class="risk-indicator mb-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  ${b}
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${risks.length > 0 ? `
            <div>
              <h4 class="text-lg font-semibold text-orange-700 mb-2">Risks</h4>
              <ul class="space-y-2">
                ${risks.map(r => `<li class="text-sm text-orange-700">• ${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        `;
      }
    }

    // Render override controls
    this.renderOverrideControls();
  }

  private renderOverrideControls() {
    const container = document.getElementById('override-controls');
    if (!container || !this.statusData) return;

    const phases = this.statusData.phases;
    
    container.innerHTML = `
      <div class="space-y-4">
        ${phases.map(phase => `
          <div class="p-4 bg-white rounded-lg border border-neutral-200">
            <h4 class="font-semibold text-neutral-900 mb-3">${phase.name}</h4>
            <div class="space-y-2">
              ${phase.deliverables.map(d => `
                <div class="override-control">
                  <span class="flex-1 text-sm">${d.name}</span>
                  <select 
                    class="status-override-select" 
                    data-phase="${phase.id}" 
                    data-deliverable="${d.id}"
                  >
                    <option value="pending" ${d.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${d.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${d.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="blocked" ${d.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                  </select>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <button id="save-overrides" class="w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
          Save Overrides
        </button>
      </div>
    `;
  }

  private setupEventListeners() {
    // Phase item clicks
    document.querySelectorAll('.phase-item').forEach(item => {
      item.addEventListener('click', () => {
        const phaseId = item.getAttribute('data-phase');
        this.scrollToPhaseDeliverables(phaseId);
      });
    });

    // Override save button
    const saveBtn = document.getElementById('save-overrides');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveOverrides());
    }
  }

  private scrollToPhaseDeliverables(phaseId: string | null) {
    if (!phaseId) return;
    const firstDeliverable = document.querySelector(`[data-deliverable^="${phaseId}"]`);
    if (firstDeliverable) {
      firstDeliverable.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private async saveOverrides() {
    const selects = document.querySelectorAll('.status-override-select');
    const overrides: Record<string, { status: string }> = {};

    selects.forEach(select => {
      const selectEl = select as HTMLSelectElement;
      const phaseId = selectEl.getAttribute('data-phase');
      const deliverableId = selectEl.getAttribute('data-deliverable');
      const status = selectEl.value;

      if (phaseId && deliverableId) {
        overrides[`${phaseId}.${deliverableId}`] = { status };
      }
    });

    // Save to localStorage for now (in production, would save to server)
    try {
      localStorage.setItem('project-status-overrides', JSON.stringify(overrides));
      alert('Overrides saved! Run the progress scan to apply them.');
    } catch {
      alert('Failed to save overrides');
    }
  }

  private formatStatus(status: string): string {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>`;
      case 'in-progress':
        return `<svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>`;
      case 'blocked':
        return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`;
      default:
        return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="3" />
        </svg>`;
    }
  }
}

// Initialize portal
let portalInstance: ProjectPortal | null = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    portalInstance = new ProjectPortal();
  });
} else {
  portalInstance = new ProjectPortal();
}

export { ProjectPortal, portalInstance };
