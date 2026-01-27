# Roadmap

This roadmap outlines the development phases for the Cursor Prototype Starter Kit.

---

## MVP (Complete)

Core prototyping and handoff functionality:

- [x] **Vite Development Environment** - Multi-page dev server with HMR, TypeScript, production builds
- [x] **Tailwind Design Token System** - Centralized colors, typography, spacing as single source of truth
- [x] **Component/Section Architecture** - Reusable HTML partials in `/src/components/` and `/src/sections/`
- [x] **Handoff Overlay System** - Toggle section boundaries, spacing values, and design tokens
- [x] **Handoff Exporter** - Generate markdown guide, JSON specs, and asset exports
- [x] **Handoff Portal** - Self-contained `/handoff` page with downloads, QA checklist, screenshots
- [x] **GSAP Scroll Animations** - Scroll-triggered animations with reduced motion support
- [x] **Docker Development Environment** - Dockerfile and docker-compose for consistent dev setup
- [x] **Comprehensive Documentation** - Templates and guides for all project phases

---

## Phase 2 (Planned)

Enhanced content and QA capabilities:

- [ ] **Multi-language Content Support** - JSON content system supporting EN, ES, and additional languages
- [ ] **Visual QA Automation** - Playwright-based screenshot comparison with diff highlighting
- [ ] **Content Import/Export Pipeline** - CSV, Markdown, and WordPress-compatible exports
- [ ] **Enhanced Accessibility Auditing** - Automated WCAG compliance checking with detailed reports
- [ ] **Template Variants** - Industry-specific starter templates (agency, SaaS, e-commerce landing)

---

## Future (Exploration)

Advanced features under consideration:

- [ ] **AI Content Generation** - OpenAI/Claude integration for placeholder content and personas
- [ ] **Figma Plugin Integration** - Two-way sync for asset import and style extraction
- [ ] **Real-time Collaboration** - Multiplayer prototype editing (requires backend)
- [ ] **Component Library Sync** - Auto-sync with existing design system libraries
- [ ] **Advanced Animation Presets** - Expanded GSAP animation library with timeline editor UI

---

## Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Handoff export doesn't capture all style information | Developers need manual inspection | Comprehensive style extraction at 3 breakpoints, overlay validation | Mitigated |
| Learning curve too steep for non-technical designers | Limited adoption | Extensive docs, video tutorials, focus on HTML/Tailwind simplicity | Ongoing |
| Elementor version compatibility | Export may not map to newer/older versions | Document Elementor Pro requirements, test against current version | Monitoring |
| AI API rate limits and costs | Content generation unavailable or expensive | Caching, rate limiting, optional feature flag | Planned |

---

## Dependencies

### External Dependencies

| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| Vite | 5.x | Build system, dev server | MIT |
| TypeScript | 5.x | Type-safe development | Apache-2.0 |
| Tailwind CSS | 3.x | Utility-first styling | MIT |
| GSAP Core | 3.12.x | Scroll animations | Standard (free for non-commercial) |
| Playwright | latest | Screenshots, visual QA | Apache-2.0 |

### Runtime Requirements

- Node.js 18+ (20 recommended)
- npm 9+
- Docker 20+ (optional, for containerized dev)

### Per-Project Dependencies

- Elementor Pro license (for implementation team)
- Static hosting account (Vercel, Netlify, or similar)
- AI API key (optional, for content generation features)

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2026-01 | MVP complete: handoff overlay, exporter, portal, documentation |

