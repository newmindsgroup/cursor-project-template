# Template Guide

## What this template is
This is a documentation-first project template that takes a product from kickoff through launch with clear checkpoints. It provides a consistent set of files, workflows, and prompts so teams can capture goals, requirements, UX, architecture, QA, and launch plans without guessing where information should live.

It is stack-agnostic and lightweight, designed to preserve decisions and assumptions over time while keeping handoffs and onboarding fast for new contributors.

## When to use it
Use this template for:
- Websites and marketing builds
- Web or mobile applications
- Automations and integrations
- Internal tools and ops dashboards

## Folder structure (what it’s for)
- `/docs/`: phased documentation (brief → discovery → requirements → UX → architecture → implementation → QA → launch → ops).
- `/src/`: product code (added once requirements and architecture are ready).
- `/scripts/`: automation helpers or repeatable tasks.
- `/infra/`: infrastructure and deployment assets.
- `/tests/`: test suites (stack-specific later).
- `/assets/`: design assets and exports.
- `/_handoff/`: snapshots and handoff notes.
- Root docs (`PROJECT.md`, `SCOPE.md`, `DECISIONS.md`, `ASSUMPTIONS.md`, `QUESTIONS.md`): the core truth set.

## How to start a new project (checklist)
- Create a new repo from the template (GitHub “Use this template”) or clone and rename.
- Open `project.code-workspace` so reference folders stay in context.
- Update `PROJECT.md` with the project name, goals, and stakeholders.
- Review and update `SCOPE.md` to define MVP boundaries and constraints.
- Run the discovery intake prompt to summarize existing context into `/docs/01-brief/brief.md`.
- Capture open questions in `QUESTIONS.md` and critical assumptions in `ASSUMPTIONS.md`.
- Align on requirements in `/docs/03-requirements/REQUIREMENTS.md`.
- Fill in UX, architecture, QA, and launch docs as the project progresses.

## How to use business-context + resource-library
- Treat both folders as read-only reference inputs.
- Use them to inform summaries in `/docs` and in the root decision logs.
- Do not link to or depend on specific filenames within those folders.
- Do not store client-sensitive outputs or decisions inside those folders.

## Truth hierarchy
When sources conflict, resolve in this order:
1) `PROJECT.md` (project goals and headline context)
2) `SCOPE.md` (MVP boundaries and constraints)
3) `/docs/03-requirements/REQUIREMENTS.md` (testable requirements)
4) `DECISIONS.md` (approved decisions and rationale)
5) `QUESTIONS.md` (open items that must be resolved)

## Standard workflows

### Kickoff workflow
- Review reference inputs in `business-context/` and `resource-library/`.
- Update `PROJECT.md` with project name, goals, and stakeholders.
- Draft or update `/docs/01-brief/brief.md`.
- Identify MVP boundaries and update `SCOPE.md`.
- Log assumptions in `ASSUMPTIONS.md` and open questions in `QUESTIONS.md`.
- Record immediate decisions in `DECISIONS.md`.
- Confirm success metrics and risks in the brief.

### Autofill docs from business context workflow
- Scan `business-context/` and `resource-library/` for high-signal inputs.
- Extract facts into the `PROJECT.md` fields first.
- Summarize goals, users, and constraints into `/docs/01-brief/brief.md`.
- Update `/docs/02-discovery/discovery-summary.md` to reflect key learnings.
- Draft MVP requirements in `/docs/03-requirements/REQUIREMENTS.md`.
- Draft primary flows in `/docs/04-ux/ux-flows.md`.
- Create architecture placeholders in `/docs/05-architecture/ARCHITECTURE.md`.
- Log unknowns in `QUESTIONS.md` and assumptions in `ASSUMPTIONS.md`.
- Re-run anytime new context appears in the reference folders.

### Requirements/spec workflow (MVP → Phase 2 → Future)
- Review the project brief and scope boundaries.
- Capture functional requirements in `/docs/03-requirements/REQUIREMENTS.md`.
- Add non-functional requirements and dependencies.
- Define acceptance criteria for MVP scope.
- Draft phased delivery (MVP, Phase 2, Future) using the feature spec prompt.
- Update `SCOPE.md` if phased scope shifts.
- Log decisions and open questions as they arise.
- Confirm with stakeholders before implementation.

### UX workflow
- Review requirements and scope.
- Document primary flows in `/docs/04-ux/ux-flows.md`.
- List MVP screens and key edge cases.
- Capture accessibility notes and error states.
- Align flows with acceptance criteria.
- Record UX-related assumptions or questions.
- Log UX decisions in `DECISIONS.md`.

### Architecture workflow
- Review requirements and UX flows.
- Document system overview in `/docs/05-architecture/architecture.md`.
- Identify integration points and data flows.
- Note constraints, risks, and trade-offs.
- Capture architecture decisions in `DECISIONS.md`.
- Add unanswered technical questions to `QUESTIONS.md`.
- Flag any scope impacts in `SCOPE.md`.

### Implementation workflow
- Confirm requirements, UX, and architecture are complete enough to build.
- Identify epics or workstreams in `ROADMAP.md`.
- Use `/docs/06-implementation/AUTOMATION_WORKFLOWS.md` for automation specs.
- Create tasks or tickets in your delivery system.
- Implement iteratively, keeping decisions logged.
- Update `/docs/07-qa/qa-plan.md` with any new test scope.
- Keep documentation synchronized with scope changes.

### QA workflow
- Review requirements, UX flows, and architecture.
- Define test scope and critical paths in `/docs/07-qa/qa-plan.md`.
- Set environments, test data, and exit criteria.
- Run tests and capture issues.
- Update requirements or scope if critical gaps are found.
- Confirm exit criteria are met and document results.

### Launch workflow
- Review QA plan and outstanding issues.
- Fill in `/docs/08-launch/launch-checklist.md`.
- Define rollback steps and monitoring owners.
- Validate security and compliance requirements.
- Execute the launch checklist.
- Monitor and document outcomes and follow-ups.

### Ops/maintenance workflow
- Pull the latest template updates on `main`.
- Apply small, reviewable changes to docs and prompts.
- Refresh `TEMPLATE_GUIDE.md` when workflows or prompts change.
- Track updates in `CHANGELOG.md`.
- Optionally tag releases (e.g., `v1.0.0`, `v1.1.0`).
- Ensure sensitive material is never committed.
- Capture maintenance decisions in `DECISIONS.md`.

## Commands and repeatable steps
- Run `discovery-intake.md` to summarize new context at kickoff or after new references appear.
- Follow the autofill runbook to populate brief, requirements, UX, and architecture docs.
- Run `feature-spec.md` to define MVP and phased scope.
- Run `ux-flows-and-screens.md`, `architecture-planning.md`, and `qa-test-plan.md` as the project matures.
- Run `launch-checklist.md` before release.
- Use `help-template-docs.md` for quick orientation.
- Run `refresh-template-guide.md` after adding new prompts or workflows.
- Update `DECISIONS.md`, `ASSUMPTIONS.md`, and `QUESTIONS.md` continuously.

## Prompt catalog
| Prompt | Purpose | When to run | Updates |
| --- | --- | --- | --- |
| `architecture-planning.md` | Propose stack-agnostic architecture and trade-offs | After requirements and UX flows are drafted | `/docs/05-architecture/ARCHITECTURE.md`, `DECISIONS.md`, `QUESTIONS.md` |
| `automation-workflow-design.md` | Define automation workflows and failure handling | When automation is in scope | `/docs/06-implementation/AUTOMATION_WORKFLOWS.md`, `QUESTIONS.md` |
| `brand-identity-audit.md` | Audit brand identity completeness and consistency | During discovery, before visual design | `/docs/02-discovery/discovery-summary.md`, `QUESTIONS.md` |
| `discovery-intake.md` | Gather comprehensive context including business systems | Project kickoff or new context drop | `/docs/02-discovery/discovery-summary.md`, `PROJECT.md`, `QUESTIONS.md` |
| `emyth-systems-audit.md` | Assess business systems maturity (E-Myth framework) | Project kickoff, before scoping | `/docs/02-discovery/discovery-summary.md`, `ASSUMPTIONS.md` |
| `feature-spec.md` | Create phased feature spec | After brief + requirements exist | `SCOPE.md`, `/docs/03-requirements/REQUIREMENTS.md`, `DECISIONS.md`, `QUESTIONS.md` |
| `launch-checklist.md` | Create launch checklist and rollback | After QA plan is defined | `/docs/08-launch/LAUNCH_PLAN.md`, `QUESTIONS.md` |
| `one-page-marketing-canvas.md` | Complete 9-square marketing strategy canvas | During discovery, marketing strategy | `/docs/02-discovery/`, `SCOPE.md` |
| `persuasion-checklist.md` | Audit website for Cialdini's 6 persuasion principles | Content strategy, CRO optimization | `/docs/03-requirements/REQUIREMENTS.md`, `/docs/07-qa/qa-plan.md` |
| `qa-test-plan.md` | Define QA test scope and exit criteria | After requirements and UX flows are drafted | `/docs/07-qa/qa-plan.md` |
| `small-business-flight-plan.md` | 6-pillar business assessment (Flight Plan framework) | Project kickoff, scoping | `/docs/02-discovery/discovery-summary.md`, `SCOPE.md` |
| `storybrand-content.md` | Generate StoryBrand-based website content | Content creation phase | `/src/content/`, `QUESTIONS.md` |
| `ux-flows-and-screens.md` | Capture user flows, screens, and edge cases | After requirements are drafted | `/docs/04-ux/ux-flows.md`, `QUESTIONS.md` |
| `help-template-docs.md` | Summarize the template guide and next steps | Any time you need orientation | None (read-only) |
| `refresh-template-guide.md` | Refresh the guide to match current repo | After new prompts/workflows are added | `TEMPLATE_GUIDE.md`, `CHANGELOG.md` |
| `autofill-from-business-context.md` | Populate `PROJECT.md` and canonical docs from folder-level reference sources | After adding/refreshing reference context | `PROJECT.md`, canonical `/docs/**`, `QUESTIONS.md`, `ASSUMPTIONS.md` |
| `autofill-refresh.md` | Refresh `PROJECT.md` and canonical docs after context changes | Any time reference context changes | `PROJECT.md`, canonical `/docs/**`, `QUESTIONS.md`, `ASSUMPTIONS.md` |

## Common tasks (quick recipes)
**I just added new business context files → what do I run?**
- Run `discovery-intake.md`.
- Follow the autofill workflow to refresh the brief, requirements, UX, and architecture.
- Update `PROJECT.md` if goals or stakeholders shift.
- Log new questions in `QUESTIONS.md`.

**I need a new MVP spec → what do I run?**
- Ensure `/docs/01-brief/brief.md` is current.
- Run `feature-spec.md`.
- Update `SCOPE.md` with MVP boundaries.
- Log decisions or open questions as needed.

**I’m about to start building → what must be completed first?**
- `PROJECT.md`, `SCOPE.md`, and `/docs/03-requirements/REQUIREMENTS.md`.
- `/docs/04-ux/ux-flows.md` and `/docs/05-architecture/ARCHITECTURE.md`.
- `DECISIONS.md`, `ASSUMPTIONS.md`, and `QUESTIONS.md` reviewed.

**I want a handoff package → what do I run/check?**
- Ensure all `/docs` sections are filled for the current phase.
- Run `qa-test-plan.md` and `launch-checklist.md` if relevant.
- Confirm `DECISIONS.md`, `ASSUMPTIONS.md`, and `QUESTIONS.md` are current.
- Use `_handoff/HANDOFF.md` as the summary artifact.

## Template maintenance
- Pull latest changes on `main`.
- Make updates in small, reviewable commits.
- Update `CHANGELOG.md` with notable changes.
- Push updates to GitHub and keep the template repo marked as a template.
- Optionally tag releases (e.g., `v1.0.0`, `v1.1.0`) for easy adoption.
- Never commit client-sensitive data, secrets, or credentials.
