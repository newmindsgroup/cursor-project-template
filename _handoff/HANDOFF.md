# Handoff Guide

## Open the workspace
- Open `project.code-workspace` at the project root.
- This ensures `business-context/` and `resource-library/` are always in context.

## Where the truth lives
- `/docs/` is the working source of truth.
- `SCOPE.md` defines boundaries.
- `DECISIONS.md`, `ASSUMPTIONS.md`, and `QUESTIONS.md` capture the project trail.

## How to run or extend the project
- This template is stack-agnostic.
- Add stack-specific instructions to `/docs/06-implementation/` or the root `README.md`.
- Keep any runtime or deployment steps documented in `/docs/09-ops/`.

## Adding reference materials
- Add new client context files into `business-context/`.
- Add new reference materials into `resource-library/`.
- Do not rename or restructure these folders.
- Do not reference specific filenames in docs; treat them as read-only sources.

