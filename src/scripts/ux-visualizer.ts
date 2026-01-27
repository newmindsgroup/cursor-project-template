// UX Visualizer
// Renders personas, user flows, and journey maps

interface Persona {
  id: string;
  name: string;
  shortName: string;
  image: string;
  demographics: {
    age: string;
    role: string;
    company: string;
    techSavviness: string;
  };
  jtbd: string;
  goals: string[];
  frustrations: string[];
  behaviors: string[];
  quote: string;
  scenarios: Array<{
    name: string;
    description: string;
  }>;
}

interface FlowStep {
  order: number;
  screen: string;
  action: string;
  element: string;
  outcome: string;
  notes?: string;
}

interface UserFlow {
  id: string;
  name: string;
  description: string;
  persona: string;
  entry: {
    screen: string;
    path: string;
    trigger: string;
  };
  steps: FlowStep[];
  successState: string;
  failureStates: Array<{
    description: string;
    cause: string;
    recovery: string;
  }>;
  metrics?: {
    target: string;
    tracking: string[];
  };
}

interface JourneyPhase {
  name: string;
  touchpoints: Array<{
    channel: string;
    action: string;
    emotion: 'positive' | 'neutral' | 'negative' | string;
    opportunity: string;
  }>;
}

interface JourneyMap {
  id: string;
  name: string;
  persona: string;
  phases: JourneyPhase[];
}

interface PersonasData {
  version: string;
  lastUpdated: string;
  personas: Persona[];
}

interface FlowsData {
  version: string;
  lastUpdated: string;
  flows: UserFlow[];
  journeyMaps: JourneyMap[];
}

class UXVisualizer {
  private personasData: PersonasData | null = null;
  private flowsData: FlowsData | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    await Promise.all([
      this.loadPersonasData(),
      this.loadFlowsData()
    ]);
    this.render();
  }

  private async loadPersonasData() {
    try {
      const paths = [
        '/data/personas.json',
        '../data/personas.json',
        '../../data/personas.json',
        '../../../data/personas.json'
      ];
      
      let loaded = false;
      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            this.personasData = await response.json();
            loaded = true;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!loaded) {
        throw new Error('Failed to load personas');
      }
    } catch (error) {
      console.error('Error loading personas:', error);
      // Try embedded data
      const embedded = document.getElementById('personas-data');
      if (embedded && embedded.textContent && embedded.textContent.trim() !== '{}') {
        this.personasData = JSON.parse(embedded.textContent);
      } else {
        this.personasData = { version: '1.0.0', lastUpdated: '', personas: [] };
      }
    }
  }

  private async loadFlowsData() {
    try {
      const paths = [
        '/data/user-flows.json',
        '../data/user-flows.json',
        '../../data/user-flows.json',
        '../../../data/user-flows.json'
      ];
      
      let loaded = false;
      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            this.flowsData = await response.json();
            loaded = true;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!loaded) {
        throw new Error('Failed to load flows');
      }
    } catch (error) {
      console.error('Error loading flows:', error);
      // Try embedded data
      const embedded = document.getElementById('flows-data');
      if (embedded && embedded.textContent && embedded.textContent.trim() !== '{}') {
        this.flowsData = JSON.parse(embedded.textContent);
      } else {
        this.flowsData = { version: '1.0.0', lastUpdated: '', flows: [], journeyMaps: [] };
      }
    }
  }

  private render() {
    this.renderPersonas();
    this.renderFlows();
    this.renderJourneyMaps();
  }

  private renderPersonas() {
    const container = document.getElementById('personas-grid');
    if (!container || !this.personasData) return;

    const personas = this.personasData.personas.filter(p => p.id !== 'persona-template');

    if (personas.length === 0) {
      container.innerHTML = `
        <div class="empty-state col-span-2">
          <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="empty-state-title">No personas defined yet</h3>
          <p class="empty-state-desc">Add personas to src/data/personas.json to see them here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = personas.map(persona => this.renderPersonaCard(persona)).join('');
  }

  private renderPersonaCard(persona: Persona): string {
    const initials = persona.shortName.split(' ').map(n => n[0]).join('').toUpperCase();

    return `
      <div class="persona-card" data-persona="${persona.id}">
        <div class="persona-card-header">
          <div class="persona-avatar">${initials}</div>
          <div class="persona-info">
            <h3>${persona.name}</h3>
            <p>${persona.demographics.role} • ${persona.demographics.company}</p>
          </div>
        </div>
        <div class="persona-card-body">
          <div class="persona-section">
            <div class="persona-section-title">Jobs to be Done</div>
            <div class="persona-jtbd">"${persona.jtbd}"</div>
          </div>

          <div class="persona-section">
            <div class="persona-section-title">Goals</div>
            <ul class="persona-list">
              ${persona.goals.slice(0, 4).map(goal => `
                <li class="persona-list-item">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  ${goal}
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="persona-section">
            <div class="persona-section-title">Frustrations</div>
            <ul class="persona-list">
              ${persona.frustrations.slice(0, 4).map(frustration => `
                <li class="persona-list-item">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-red-500">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  ${frustration}
                </li>
              `).join('')}
            </ul>
          </div>

          ${persona.quote ? `
            <div class="persona-section">
              <div class="persona-section-title">Quote</div>
              <p class="text-sm text-neutral-600 italic">"${persona.quote}"</p>
            </div>
          ` : ''}

          <div class="persona-section">
            <div class="persona-section-title">Demographics</div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div><span class="text-neutral-500">Age:</span> ${persona.demographics.age}</div>
              <div><span class="text-neutral-500">Tech:</span> ${persona.demographics.techSavviness}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderFlows() {
    const container = document.getElementById('flows-container');
    if (!container || !this.flowsData) return;

    const flows = this.flowsData.flows.filter(f => f.id !== 'flow-template');

    if (flows.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="empty-state-title">No user flows defined yet</h3>
          <p class="empty-state-desc">Add flows to src/data/user-flows.json to see them here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = flows.map(flow => this.renderFlowCard(flow)).join('');
  }

  private renderFlowCard(flow: UserFlow): string {
    const stepsHtml = flow.steps.map((step, index) => `
      <div class="flow-step">
        <div class="flow-step-box ${index === 0 ? 'entry' : ''} ${index === flow.steps.length - 1 ? 'success' : ''}">
          ${step.screen}
        </div>
        ${index < flow.steps.length - 1 ? `
          <div class="flow-step-arrow">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <div class="flow-card" data-flow="${flow.id}">
        <div class="flow-card-header">
          <h3 class="flow-card-title">${flow.name}</h3>
          <p class="text-sm text-neutral-600 mb-3">${flow.description}</p>
          <div class="flow-card-meta">
            <span>Entry: ${flow.entry.screen}</span>
            <span>•</span>
            <span>${flow.steps.length} steps</span>
          </div>
        </div>
        <div class="flow-diagram">
          <div class="flow-steps">
            ${stepsHtml}
          </div>
        </div>
        <div class="flow-outcomes">
          <div class="flow-outcomes-grid">
            <div class="flow-outcome success">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div class="font-medium">Success State</div>
                <div class="text-xs opacity-75">${flow.successState}</div>
              </div>
            </div>
            ${flow.failureStates.length > 0 ? `
              <div class="flow-outcome failure">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div class="font-medium">Failure States</div>
                  <div class="text-xs opacity-75">${flow.failureStates.length} identified</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Detailed Steps Accordion -->
        <details class="border-t border-neutral-100">
          <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-primary-600 hover:bg-neutral-50">
            View detailed steps
          </summary>
          <div class="px-6 pb-6 space-y-3">
            ${flow.steps.map((step, index) => `
              <div class="p-3 bg-neutral-50 rounded-lg text-sm">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">${index + 1}</span>
                  <span class="font-medium">${step.action}</span>
                </div>
                <div class="ml-8 text-neutral-600">
                  <div>Screen: ${step.screen} • Element: ${step.element}</div>
                  <div class="text-neutral-500">Outcome: ${step.outcome}</div>
                  ${step.notes ? `<div class="text-xs text-neutral-400 mt-1">Note: ${step.notes}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </details>
      </div>
    `;
  }

  private renderJourneyMaps() {
    const container = document.getElementById('journey-maps');
    if (!container || !this.flowsData) return;

    const journeyMaps = this.flowsData.journeyMaps || [];

    if (journeyMaps.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 class="empty-state-title">No journey maps defined yet</h3>
          <p class="empty-state-desc">Add journey maps to src/data/user-flows.json to see them here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = journeyMaps.map(journey => this.renderJourneyMap(journey)).join('');
  }

  private renderJourneyMap(journey: JourneyMap): string {
    const emotionIcon = (emotion: string) => {
      switch (emotion) {
        case 'positive':
        case 'hopeful':
        case 'engaged':
        case 'anticipating':
          return `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`;
        case 'negative':
        case 'frustrated':
          return `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`;
        default:
          return `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`;
      }
    };

    const emotionClass = (emotion: string) => {
      if (['positive', 'hopeful', 'engaged', 'anticipating'].includes(emotion)) return 'positive';
      if (['negative', 'frustrated'].includes(emotion)) return 'negative';
      return 'neutral';
    };

    return `
      <div class="journey-map" data-journey="${journey.id}">
        <div class="journey-header">
          <h3 class="text-xl font-bold text-neutral-900 mb-2">${journey.name}</h3>
          <p class="text-sm text-neutral-600">Persona: ${journey.persona}</p>
        </div>
        <div class="journey-timeline">
          <div class="journey-phases">
            ${journey.phases.map(phase => `
              <div class="journey-phase">
                <div class="journey-phase-header">${phase.name}</div>
                <div class="journey-phase-content">
                  ${phase.touchpoints.map(tp => `
                    <div class="journey-touchpoint">
                      <div class="journey-touchpoint-title">${tp.channel}</div>
                      <div class="journey-touchpoint-desc">${tp.action}</div>
                      <div class="journey-emotion ${emotionClass(tp.emotion)}">
                        ${emotionIcon(tp.emotion)}
                        <span class="capitalize">${tp.emotion}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize visualizer
let visualizerInstance: UXVisualizer | null = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    visualizerInstance = new UXVisualizer();
  });
} else {
  visualizerInstance = new UXVisualizer();
}

export { UXVisualizer, visualizerInstance };
