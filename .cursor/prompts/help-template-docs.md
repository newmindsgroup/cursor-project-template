# Prompt: Help - Template Docs

## Goal
Provide a fast, reliable orientation to this template.

## Inputs to review
- `TEMPLATE_GUIDE.md`

## Prompt
Read `TEMPLATE_GUIDE.md` and return a concise outline summary. Then recommend "What should I do next?" based on the user’s phase (kickoff vs building vs QA vs launch). Ask 3–7 clarifying questions only if absolutely necessary to determine the phase. Avoid referencing specific filenames inside the reference folders.

## Output format
- Outline summary (bulleted)
- What should I do next? (short, actionable)
- Optional clarifying questions (only if required)

## Non-hallucination reminder
Do not invent requirements. If unsure, ask or log questions.
