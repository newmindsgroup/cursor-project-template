# Prompt: Autofill From Business Context (Folder-Level)

## Goal
Populate the template docs from read-only reference sources **without naming or relying on any specific filenames** in:
- `/business-context/`
- `/resource-library/`

## Inputs to review (in order)
1. `/docs/` (existing state)
2. `PROJECT.md`, `SCOPE.md`, `DECISIONS.md`, `ASSUMPTIONS.md`, `QUESTIONS.md`
3. `/business-context/` (read-only, folder-level scan)
4. `/resource-library/` (read-only, folder-level scan)

## Non-negotiables
- Do not mention any specific filenames from `/business-context/` or `/resource-library/`.
- Treat both folders as read-only reference sources.
- Do not guess. If info is missing/ambiguous, log it to `QUESTIONS.md` and/or `ASSUMPTIONS.md`.
- If guidance is derived from `/resource-library/`, label it as **informed by the reference library**.
- Do not write product code in `/src`.

## Task
1. Scan `/business-context/` and extract structured facts:
   - What we’re building (1 paragraph)
   - Primary users + jobs-to-be-done
   - Outcomes / success metrics
   - Scope (in/out) signals
   - Constraints (time/budget/tech/compliance)
   - Risks + unknowns
   - Stakeholders + roles
2. Scan `/resource-library/` for general best practices and patterns (no filenames). Mark recommendations as **informed by the reference library**.
3. Populate/update:
   - `PROJECT.md` (single source of truth)
   - `docs/01-brief/brief.md`
   - `docs/02-discovery/discovery-summary.md`
   - `docs/03-requirements/REQUIREMENTS.md` (draft an MVP outline with acceptance criteria)
   - `docs/04-ux/ux-flows.md` (draft primary flows + screens + states)
   - `docs/05-architecture/ARCHITECTURE.md` (placeholders + risks/trade-offs)
4. Update `QUESTIONS.md` with a **Questions for Daniel & Lorena** section/list derived from gaps discovered (do not invent).
5. Update `ASSUMPTIONS.md` with any assumptions made (include confidence + validation plan).

## Output format (concise)
- **Structured facts extracted** (bullet list)
- **Updates made** (file-by-file list)
- **Questions for Daniel & Lorena** (copy/paste-ready list)
- **Assumptions logged** (copy/paste-ready list)
