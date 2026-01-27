# Prompt: Autofill Refresh (Folder-Level)

## Goal
Re-run autofill after new context is added to `/business-context/` or `/resource-library/`, keeping outputs consistent and traceable.

## Inputs to review (in order)
1. `/docs/` (current state)
2. `PROJECT.md`, `SCOPE.md`, `DECISIONS.md`, `ASSUMPTIONS.md`, `QUESTIONS.md`
3. `/business-context/` (read-only, folder-level scan)
4. `/resource-library/` (read-only, folder-level scan)

## Non-negotiables
- Never cite or rely on specific filenames from the reference folders.
- Do not guess; log unknowns to `QUESTIONS.md`.
- If you change direction, log the decision in `DECISIONS.md`.
- Keep edits small and reviewable.
- Do not write product code in `/src`.

## Task
1. Identify what changed in the reference context at a **folder level** (no filenames).
2. Update `PROJECT.md` first to reflect any new facts, constraints, stakeholders, or scope signals.
3. Refresh canonical docs (only what needs changing):
   - `docs/01-brief/brief.md`
   - `docs/02-discovery/discovery-summary.md`
   - `docs/03-requirements/REQUIREMENTS.md`
   - `docs/04-ux/ux-flows.md`
   - `docs/05-architecture/ARCHITECTURE.md`
4. Log new uncertainties as:
   - Questions in `QUESTIONS.md` (include owner and impact)
   - Assumptions in `ASSUMPTIONS.md` (confidence + validation plan)
5. Produce an updated **Questions for Daniel & Lorena** list (derived from `QUESTIONS.md`).

## Output format (concise)
- **Delta summary** (what changed at a high level)
- **Files updated** (list)
- **Questions for Daniel & Lorena** (copy/paste-ready list)
- **Assumptions added/updated** (copy/paste-ready list)
