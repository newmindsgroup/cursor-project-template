# Decisions

Use this log to capture significant decisions and their rationale.

| Date | Decision | Status | Context | Consequences | Links |
| --- | --- | --- | --- | --- | --- |
| 2026-01-22 | Use MIT license and baseline repo hygiene for the template | Accepted | Template bootstrap | Standardizes reuse and safety defaults | - |
| 2026-01-22 | Make lowercase `/docs/**` templates canonical; keep uppercase templates as legacy pointers | Accepted | Template hardening | Consistent autofill targets without breaking old links | See `/docs` headers |
| 2026-01-22 | Standardize an autofill runbook and prompt pack (folder-level, no filenames) | Accepted | Template hardening | Repeatable doc population without leaking sensitive filenames | `docs/09-ops/autofill-workflow.md` |
| 2026-01-22 | Add template guide and documentation prompts for onboarding | Accepted | Template documentation system | Clearer usage guidance and repeatable refresh workflow | `TEMPLATE_GUIDE.md` |
| 2026-01-23 | Implement self-contained Handoff Portal at /handoff | Accepted | Eliminate manual file sharing for handoff | Single URL for implementers with all downloads, specs, QA checklist | `docs/06-implementation/handoff-portal-guide.md` |
| 2026-01-26 | Add dynamic page discovery in screenshot script | Accepted | Production readiness audit | Screenshot automation works with any project pages | `scripts/take-screenshots.mjs` |
| 2026-01-26 | Exclude reference materials from version control | Accepted | Resolves Q-002 | Prevents accidental sharing of client/proprietary content; gitignore enforced | `QUESTIONS.md` |
| 2026-01-26 | Implement comprehensive Modern Design Standards system | Accepted | Ensure UX-grounded, trend-aware design decisions | All designs backed by UX principles, StoryBrand framework, and documented rationale | `.cursor/prompts/modern-design-standards.md` |
| 2026-01-26 | Add Design Rationale Generator for per-section justifications | Accepted | Enable "Why This Design" documentation | Every design decision traceable to UX principle, StoryBrand element, or research | `.cursor/prompts/design-rationale-generator.md` |
| 2026-01-26 | Create Trend Research Workflow for staying current | Accepted | Avoid outdated designs, maintain 2026 relevance | Systematic research process with documentation | `.cursor/prompts/trend-research-workflow.md` |
| 2026-01-26 | Establish Design Decision Framework with 7 validation gates | Accepted | Standardize design validation process | All sections validated against purpose, UX, StoryBrand, persuasion, trends, a11y, implementation | `docs/02-discovery/design-decision-framework.md` |
| 2026-01-26 | Add section-rationale.json for storing design rationales | Accepted | Enable handoff overlay "Why This Design" feature | Structured storage of per-section design decisions | `src/data/section-rationale.json` |
| 2026-01-26 | Add design-research-log.json for trend research documentation | Accepted | Track research findings per project | Historical record of trend research informing design decisions | `src/data/design-research-log.json` |
| 2026-01-26 | Enhance elementor-mapping.md with 2026 animations and features | Accepted | Modern Elementor implementation guidance | Covers scroll animations, hover effects, bento grids, glassmorphism, performance | `docs/06-implementation/elementor-mapping.md` |
| 2026-01-26 | Add Clarity Validation ("Don't Make Me Think") to StoryBrand prompt | Accepted | Ensure cognitive simplicity in all content | Every section validated for 5-second clarity, scannability, action clarity | `.cursor/prompts/storybrand-content.md` |
| 2026-01-26 | Implement Golden Ratio Design System | Accepted | Create mathematically harmonious visual designs | Additive design layer with `gr-` prefixed utilities for typography, spacing, layouts, and aspect ratios based on φ (1.618) | `src/styles/golden-ratio.css`, `.cursor/prompts/golden-ratio-design.md` |

