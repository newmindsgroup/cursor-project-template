# Standards

## Naming conventions
- Folder names: kebab-case (e.g., `docs/09-ops/`).
- Prefer lowercase filenames for canonical docs going forward.

## Git workflow
### Branching
- `main` is always releasable.
- Feature branches: `feature/<short-name>` or `chore/<short-name>`.

### Commits
- Use Conventional Commits when possible: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Documentation rules (non-negotiable)
- Significant direction choices: log in `DECISIONS.md`.
- Unknowns / missing info: log in `QUESTIONS.md` (do not guess).
- Assumptions that need validation: log in `ASSUMPTIONS.md` with confidence + validation plan.
- Scope changes: update `SCOPE.md` and reference the decision.

## Definition of Done (template-level)
- [ ] `PROJECT.md` has a usable first draft
- [ ] `SCOPE.md` is minimally clear (in/out/constraints)
- [ ] `docs/01-brief/brief.md` is filled
- [ ] `docs/03-requirements/REQUIREMENTS.md` includes MVP with acceptance criteria
- [ ] `docs/04-ux/ux-flows.md` covers primary flows and screens
- [ ] Open questions captured in `QUESTIONS.md`
- [ ] Major assumptions captured in `ASSUMPTIONS.md`
- [ ] Key decisions captured in `DECISIONS.md`
