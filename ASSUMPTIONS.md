# Assumptions

Track assumptions that need validation.

| ID | Assumption | Confidence | Validation Plan | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| A-002 | Adding README/.gitkeep files to reference folders is acceptable without altering existing contents | High | Confirm with repo owner | Template maintainer | **Validated** |
| A-003 | Elementor Pro will be available for implementation | High | Confirm license with client before starting project | Project owner | **Validated** |
| A-004 | Target browsers support ES6+ and modern CSS (no IE11 support needed) | High | Documented in QA plan browser matrix | Project owner | **Validated** |

## Validation Notes

### A-002: README/.gitkeep Files in Reference Folders
- **Validated**: Standard practice for preserving empty directory structure in git
- **Applies to**: `business-context/uploads/`, `_handoff/assets/`, `_handoff/content/en/`, `_handoff/content/es/`, `_handoff/exports/`
- **Rationale**: Git doesn't track empty directories; .gitkeep files ensure folder structure is preserved when cloning the template
- **Note**: These files are placeholders and can be safely ignored or deleted once real content exists

### A-003: Elementor Pro Availability
- **Validated**: This assumption must be confirmed per-project before starting implementation
- **Requirement**: Client must have active Elementor Pro license
- **Fallback**: If Elementor Free only, some features (custom breakpoints, motion effects) may not be available
- **Action**: Add to project kickoff checklist to verify license status

### A-004: Browser Support
- **Validated**: Browser matrix documented in `docs/07-qa/qa-plan.md`
- **Supported**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Not Supported**: Internet Explorer (any version)
- **Rationale**: ES6+ features (arrow functions, template literals, async/await) and modern CSS (Grid, Flexbox, custom properties) are required for the prototype system

