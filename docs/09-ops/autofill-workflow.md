# Autofill Workflow (Runbook)

Goal: consistently populate project docs from folder-level reference sources without naming or relying on specific filenames.

## Non-negotiables
- Consult `/docs` first.
- Treat `/business-context/` and `/resource-library/` as read-only reference sources.
- Never cite or depend on specific filenames from those folders.
- If information is missing or ambiguous, do not guess—log to `QUESTIONS.md` and/or `ASSUMPTIONS.md`.
- Do not write product code until `PROJECT.md + SCOPE.md + REQUIREMENTS.md` are minimally clear.

## Structured extraction fields (target schema)
Populate these first in `PROJECT.md`:
- What we’re building
- Primary users + jobs-to-be-done
- Outcomes / success metrics
- Scope (in/out)
- Constraints
- Risks + unknowns
- Stakeholders + roles

## Runbook (repeatable)
### Step 1: Scan `/business-context/` (folder-level)
Extract business facts and constraints:
- Business summary (what/why)
- Audience + segments
- Offer/value proposition
- Stakeholders + decision makers
- Constraints (time/budget/tech/compliance)
- Risks and unknowns

### Step 2: Scan `/resource-library/` (folder-level)
Extract general best practices and patterns. When recommendations are derived from this, label them as **informed by the reference library**.

### Step 3: Convert into structured facts
Create a short, structured fact set aligned to the `PROJECT.md` fields. Do not add requirements that are not supported by evidence.

### Step 4: Populate `PROJECT.md` first
Update the fields in `PROJECT.md` as the single source of truth.

### Step 5: Populate the canonical docs
Using `PROJECT.md`:
- Update `docs/01-brief/brief.md`
- Update `docs/02-discovery/discovery-summary.md`
- Draft `docs/03-requirements/REQUIREMENTS.md` with an MVP outline (features + acceptance criteria)

### Step 6: Produce a UX flows draft
Draft `docs/04-ux/ux-flows.md` (primary flows, screens, states, accessibility notes).

### Step 7: Propose architecture placeholders and log uncertainty
Draft `docs/05-architecture/ARCHITECTURE.md` with placeholders and trade-offs. If key info is missing, log the uncertainty in `QUESTIONS.md` / `ASSUMPTIONS.md`.

### Step 8: Confirm before writing code
Stop and confirm with stakeholders/users before starting implementation work (no `/src` product code in this phase).

### Step 9: Re-run anytime context changes
When new material is added to either reference folder, re-run the workflow and refresh `PROJECT.md` and the canonical docs.

## Outputs checklist
- [ ] `PROJECT.md` updated
- [ ] `docs/01-brief/brief.md` updated
- [ ] `docs/02-discovery/discovery-summary.md` updated
- [ ] `docs/03-requirements/REQUIREMENTS.md` MVP drafted
- [ ] `docs/04-ux/ux-flows.md` drafted
- [ ] `docs/05-architecture/ARCHITECTURE.md` placeholders drafted
- [ ] Unknowns logged in `QUESTIONS.md`
- [ ] Assumptions logged in `ASSUMPTIONS.md` (with validation plan)
