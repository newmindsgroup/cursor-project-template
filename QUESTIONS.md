# Open Questions

| ID | Question | Impact | Owner | Status |
| --- | --- | --- | --- | --- |
| Q-002 | Should existing reference materials be removed from version control to avoid accidental sharing? | High | Template maintainer | **Resolved** |
| Q-003 | Should the handoff overlay be enhanced to display design rationale from section-rationale.json? | Medium | Developer | Open |
| Q-004 | How frequently should trend research be updated for long-running projects? | Low | Design Lead | Open |

---

## Open Question Details

### Q-003: Handoff Overlay Enhancement for Design Rationale

**Question**: Should the handoff overlay UI be updated to include a "Why This Design" tab that displays rationale from `section-rationale.json`?

**Context**: The design rationale system (`section-rationale.json`) has been implemented to store per-section design justifications. The handoff overlay currently shows specs but not the reasoning behind design decisions.

**Options**:
1. **Full Integration**: Add new tab to overlay spec cards showing design rationale
2. **Export Only**: Include rationale in handoff package but not in overlay UI
3. **Deferred**: Document the capability but implement when client need arises

**Impact**: Medium - Improves handoff quality and designer-developer communication

**Recommendation**: Option 1 (Full Integration) aligns with the goal of justified, transparent design decisions

---

### Q-004: Trend Research Update Frequency

**Question**: For projects spanning multiple months, how frequently should trend research be refreshed?

**Context**: The `trend-research-workflow.md` establishes initial research but doesn't specify refresh cadence for long-running projects.

**Options**:
1. **Quarterly**: Refresh research every 3 months
2. **Phase-based**: Refresh at major project milestones
3. **Trigger-based**: Only refresh when team notices outdated patterns

**Impact**: Low - Affects design currency but most projects are shorter than trend cycles

**Recommendation**: Option 2 (Phase-based) balances effort with staying current

---

## Resolved Questions

### Q-002: Reference Materials in Version Control

**Question**: Should existing reference materials be removed from version control to avoid accidental sharing?

**Resolution**: **Yes - Reference materials should NOT be tracked in version control**

**Rationale**:
1. Client business context documents may contain confidential information
2. Reference library materials may have licensing restrictions
3. Template distribution should not include client-specific content
4. Large binary files (PDFs, images) bloat repository size

**Implementation**:
- `business-context/uploads/` is already gitignored
- `project-settings.local.json` (with API keys) is gitignored
- Any proprietary reference materials should be in gitignored directories

**Recommendation**:
- Keep `.gitignore` rules for sensitive directories
- Add README files in reference folders explaining what content belongs there
- Document the expected content in README without including actual files
- For template distribution, use `git archive` or release tags to exclude untracked files

**Decision Logged**: See `DECISIONS.md` for formal record

