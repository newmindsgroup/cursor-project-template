# Cursor Starter Template Project

Stack-agnostic starter structure for any project (websites, apps, automations, internal tools).

## How to start
1. Open `project.code-workspace` (recommended) so the reference folders are always in context.
2. Read `/docs/01-brief/PROJECT_BRIEF.md` and update it for your project.
3. Keep `SCOPE.md`, `DECISIONS.md`, `ASSUMPTIONS.md`, and `QUESTIONS.md` current.

## How to use this repo as a GitHub Template
1. Create a new repository on GitHub using "Use this template".
2. Clone your new repository locally.
3. Update the brief, scope, and requirements to match the new project.

## How to start a new project from it
1. Click "Use this template" on GitHub.
2. Choose the owner and name for the new repo.
3. Initialize your project documentation and remove anything not needed.

## How to keep the template updated
1. Pull the latest changes in the template repo.
2. Make improvements in small, reviewable commits.
3. Tag releases when the template changes meaningfully.

## Where the truth lives
- `/docs/` holds the working source of truth.
- `SCOPE.md` defines boundaries and constraints.
- `DECISIONS.md` records key decisions and rationale.
- `ASSUMPTIONS.md` tracks unvalidated assumptions.
- `QUESTIONS.md` tracks open questions and owners.

## Reference folders (read-only)
- `business-context/` and `resource-library/` are read-only references used to inform decisions.
- Do not rename or restructure these folders.
- Add reference materials locally as needed, without changing structure.
- Do not commit client-sensitive files; use approved private storage for shared references.

## Suggested workflow
- Update the brief, requirements, UX, and architecture before implementation.
- Record decisions, assumptions, and open questions as they arise.
- Keep changes small and reviewable.

## Structure overview
- `/docs/` project documentation by phase
- `/src/` product code (when you choose a stack)
- `/scripts/` automation scripts
- `/infra/` deployment/infra assets
- `/tests/` tests (stack-specific later)
- `/assets/` design assets and exports
- `/_handoff/` snapshots and handoff notes

