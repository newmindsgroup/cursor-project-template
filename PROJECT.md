# PROJECT (Single Source of Truth)

Purpose: a concise, structured "project identity" that all docs pull from.

## What we're building

**Cursor Prototype Starter Kit** - A modern frontend prototype system that enables rapid website prototyping in Cursor with automated Elementor handoff capabilities.

Designers and agencies can build high-fidelity, interactive prototypes using HTML, CSS (Tailwind), and TypeScript, get client approval, then hand off pixel-perfect specifications to WordPress/Elementor developers without manual annotation or guesswork.

## Primary users + jobs-to-be-done

**User Segment: Web Designers & Design Agencies**

- **JTBD:** Prototype website designs quickly and hand off to development teams with complete specifications
- **Current workaround:** Build in Figma, manually annotate spacing/typography/colors, hope developers interpret correctly
- **Biggest pain:** Endless back-and-forth between design and dev due to ambiguous specs, wasted time on pixel-pushing

**User Segment: WordPress/Elementor Developers**

- **JTBD:** Receive clear, actionable specifications to rebuild approved designs pixel-perfect in Elementor
- **Current workaround:** Inspect Figma designs, guess at spacing values, ping designer for clarification constantly
- **Biggest pain:** Incomplete handoff documentation, guessing at implementation details, rework after client review

## Prototype-to-Elementor Workflow

1. **Design in Cursor:** Build interactive prototype with HTML/CSS/JS + modern tooling (Vite, Tailwind, GSAP)
2. **Client Review:** Share preview link or static build for approval
3. **Approval:** Client signs off on design and interactions
4. **Handoff Generation:** Run `npm run handoff:export` to generate complete implementation guide
5. **Implementation:** Development team rebuilds in Elementor using:
   - Step-by-step markdown instructions
   - Structured JSON with computed styles at all breakpoints
   - Exported assets (images, icons, fonts)
6. **Validation:** Compare Elementor build to prototype using handoff overlay for pixel-perfect accuracy

## Primary outcomes / success metrics

**Outcome: Reduce design-to-development handoff time**

- **Metric:** Time from design approval to dev handoff complete
- **Target:** 80% reduction (from ~8 hours manual annotation to <2 hours automated export)
- **Measurement method:** Track handoff generation time per project

**Outcome: Increase first-pass implementation accuracy**

- **Metric:** Percentage of sections built correctly on first attempt (no spacing/typography corrections needed)
- **Target:** 90%+ accuracy rate
- **Measurement method:** QA review comparing Elementor build to prototype using overlay

**Outcome: Improve designer-developer collaboration**

- **Metric:** Number of clarification questions during implementation
- **Target:** 75% reduction in back-and-forth messages
- **Measurement method:** Survey implementation team, track communication volume

## Scope

### In scope

- ✅ Vite-powered multi-page development environment
- ✅ Tailwind CSS design token system
- ✅ Reusable component and section architecture
- ✅ GSAP scroll animations with reduced motion support
- ✅ Handoff overlay system (toggle section boundaries, tokens, specs)
- ✅ Automated handoff exporter (markdown guide + JSON data)
- ✅ Demo site with 4 pages, 9 sections, animations
- ✅ Docker development environment
- ✅ Comprehensive documentation
- ✅ Accessibility and performance best practices

### Out of scope

- ❌ Actual Elementor theme/plugin development
- ❌ WordPress integration or deployment
- ❌ Backend/API functionality
- ❌ CMS content management
- ❌ E-commerce features
- ❌ User authentication system
- ❌ Database design
- ❌ Visual page builder (designs are code-first)

## Constraints (time/budget/tech/compliance)

- **Tech:** Must use stable, widely-supported libraries (no experimental frameworks)
- **Tech:** Vite + TypeScript + Tailwind stack (modern but proven)
- **Tech:** GSAP Core (free license, no paid features)
- **Tech:** Elementor-compatible output (HTML/CSS that maps cleanly to Elementor widgets)

## Risks + unknowns

**Risk: Handoff export doesn't capture all necessary style information**

- **Impact:** Developers still need to inspect prototype manually
- **Mitigation:** Test exporter with real projects, iterate on captured data, validate against Elementor build process
- **Status:** Mitigated via comprehensive style extraction at 3 breakpoints

**Risk: Learning curve too steep for non-technical designers**

- **Impact:** Adoption limited to developers only
- **Mitigation:** Provide extensive documentation, video walkthroughs, example projects, focus on HTML/Tailwind simplicity
- **Status:** Ongoing - documentation complete, examples provided

## Stakeholders + roles

**Stakeholder: Design Team**

- **Role:** Primary users - build prototypes, generate handoffs
- **Decision rights:** Feature requirements, UX/workflow feedback
- **Availability:** Daily

**Stakeholder: Development Team**

- **Role:** Handoff recipients - implement in Elementor
- **Decision rights:** Technical feasibility, Elementor mapping conventions
- **Availability:** Weekly for feedback

## Links to key docs

- SCOPE: `SCOPE.md`
- ROADMAP: `ROADMAP.md`
- DECISIONS: `DECISIONS.md`
- ASSUMPTIONS: `ASSUMPTIONS.md`
- QUESTIONS: `QUESTIONS.md`
- README: `README.md` (quick start guide)
- HANDOFF PROCESS: `_handoff/HANDOFF.md`

## Autofill Map (PROJECT.md → docs)

Use this as the source mapping when autofilling templates:

- `/docs/01-brief/brief.md`
  - Pull from: What we're building, Primary users + JTBD, Outcomes, Constraints, Risks/unknowns, Stakeholders
- `/docs/02-discovery/discovery-summary.md`
  - Pull from: Constraints, Risks/unknowns, Stakeholders; add findings from reference folders
- `/docs/03-requirements/REQUIREMENTS.md`
  - Pull from: Scope, Outcomes/success metrics; translate into MVP acceptance criteria
- `/docs/04-ux/ux-flows.md`
  - Pull from: Primary users + JTBD; derive primary flows and key screens
- `/docs/05-architecture/ARCHITECTURE.md`
  - Pull from: Constraints, Risks; propose placeholders and log uncertainties
- `/docs/06-implementation/implementation-plan.md`
  - Pull from: Scope + requirements; produce milestones and sequencing
- `/docs/07-qa/qa-plan.md`
  - Pull from: MVP requirements + acceptance criteria; define test coverage
- `/docs/08-launch/launch-checklist.md`
  - Pull from: Constraints + stakeholders; define rollout and validation steps
