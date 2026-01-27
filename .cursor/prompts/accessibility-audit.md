# Accessibility Audit Prompt

## Purpose
Comprehensive WCAG accessibility audit with AI-powered analysis and remediation suggestions.

## When to Use
- During development for proactive compliance
- Before launch for final verification
- When addressing accessibility feedback
- For ongoing accessibility maintenance

## WCAG Conformance Levels
- **Level A**: Minimum accessibility (must have)
- **Level AA**: Standard compliance (target for most sites)
- **Level AAA**: Enhanced accessibility (specific use cases)

## Inputs Required
1. **HTML Content** - Page markup to audit
2. **Target Level** - WCAG conformance level (A, AA, or AAA)
3. **User Context** - Expected users and their potential needs

## Prompt Template

```
You are a certified accessibility specialist conducting a WCAG [A/AA/AAA] audit.

PAGE: [Page name]
URL: [Page URL if applicable]
TARGET LEVEL: WCAG 2.1 [A/AA/AAA]

HTML CONTENT:
[Paste HTML markup]

Conduct a comprehensive accessibility audit covering all WCAG criteria.

## PERCEIVABLE (Principle 1)

### 1.1 Text Alternatives
- [ ] 1.1.1 Non-text Content (A)
  - All images have appropriate alt text
  - Decorative images have empty alt=""
  - Complex images have extended descriptions
  - Form inputs have associated labels

### 1.2 Time-based Media
- [ ] 1.2.1 Audio-only and Video-only (A)
- [ ] 1.2.2 Captions (A)
- [ ] 1.2.3 Audio Description or Media Alternative (A)
- [ ] 1.2.5 Audio Description (AA)

### 1.3 Adaptable
- [ ] 1.3.1 Info and Relationships (A)
  - Proper heading hierarchy
  - Lists use proper markup
  - Tables have headers
  - Forms use fieldsets and legends
- [ ] 1.3.2 Meaningful Sequence (A)
- [ ] 1.3.3 Sensory Characteristics (A)

### 1.4 Distinguishable
- [ ] 1.4.1 Use of Color (A)
- [ ] 1.4.3 Contrast (Minimum) (AA) - 4.5:1 for text
- [ ] 1.4.4 Resize Text (AA) - Up to 200%
- [ ] 1.4.5 Images of Text (AA)
- [ ] 1.4.10 Reflow (AA) - 320px width
- [ ] 1.4.11 Non-text Contrast (AA) - 3:1
- [ ] 1.4.12 Text Spacing (AA)
- [ ] 1.4.13 Content on Hover or Focus (AA)

## OPERABLE (Principle 2)

### 2.1 Keyboard Accessible
- [ ] 2.1.1 Keyboard (A)
  - All functionality available via keyboard
  - No keyboard traps
- [ ] 2.1.2 No Keyboard Trap (A)
- [ ] 2.1.4 Character Key Shortcuts (A)

### 2.2 Enough Time
- [ ] 2.2.1 Timing Adjustable (A)
- [ ] 2.2.2 Pause, Stop, Hide (A)

### 2.3 Seizures and Physical Reactions
- [ ] 2.3.1 Three Flashes or Below Threshold (A)

### 2.4 Navigable
- [ ] 2.4.1 Bypass Blocks (A) - Skip links
- [ ] 2.4.2 Page Titled (A)
- [ ] 2.4.3 Focus Order (A)
- [ ] 2.4.4 Link Purpose (In Context) (A)
- [ ] 2.4.5 Multiple Ways (AA)
- [ ] 2.4.6 Headings and Labels (AA)
- [ ] 2.4.7 Focus Visible (AA)

### 2.5 Input Modalities
- [ ] 2.5.1 Pointer Gestures (A)
- [ ] 2.5.2 Pointer Cancellation (A)
- [ ] 2.5.3 Label in Name (A)
- [ ] 2.5.4 Motion Actuation (A)

## UNDERSTANDABLE (Principle 3)

### 3.1 Readable
- [ ] 3.1.1 Language of Page (A)
- [ ] 3.1.2 Language of Parts (AA)

### 3.2 Predictable
- [ ] 3.2.1 On Focus (A)
- [ ] 3.2.2 On Input (A)
- [ ] 3.2.3 Consistent Navigation (AA)
- [ ] 3.2.4 Consistent Identification (AA)

### 3.3 Input Assistance
- [ ] 3.3.1 Error Identification (A)
- [ ] 3.3.2 Labels or Instructions (A)
- [ ] 3.3.3 Error Suggestion (AA)
- [ ] 3.3.4 Error Prevention (AA)

## ROBUST (Principle 4)

### 4.1 Compatible
- [ ] 4.1.1 Parsing (A)
- [ ] 4.1.2 Name, Role, Value (A)
- [ ] 4.1.3 Status Messages (AA)

---

For each issue found, provide:

## ISSUES FOUND

| ID | WCAG | Level | Element | Issue | Impact | Remediation |
|----|------|-------|---------|-------|--------|-------------|
| A11Y-001 | 1.4.3 | AA | .btn | Low contrast (3.2:1) | Users with low vision | Change to #2563EB |

## REMEDIATION CODE

For critical issues, provide corrected code:

### Issue A11Y-001: Low contrast button
**Before:**
```html
<button class="btn" style="color: #9CA3AF; background: #F3F4F6">
```

**After:**
```html
<button class="btn" style="color: #1F2937; background: #F3F4F6">
```

## SUMMARY

- Total issues: [X]
- Critical (A): [X]
- Major (AA): [X]
- Minor: [X]

COMPLIANCE STATUS: [PASS/FAIL] for WCAG [Level]

## RECOMMENDATIONS

Priority fixes:
1. [Most critical issue]
2. [Second critical issue]
3. [Third critical issue]

Testing recommendations:
- Screen reader: [NVDA/VoiceOver test suggestions]
- Keyboard: [Specific flows to test]
- Color: [Tools to validate contrast]
```

## Output Format
- Comprehensive audit document
- Issue table with WCAG references
- Code remediation examples
- Summary with pass/fail status

## Integration Points
- Feeds into `scripts/check-accessibility.mjs`
- Informs design token updates for contrast
- Guides component library improvements
- Updates qa-plan.md with test cases

## Testing Tools Reference
- **axe DevTools** - Automated scanning
- **WAVE** - Visual accessibility evaluation
- **Color Contrast Analyzer** - Manual contrast checks
- **NVDA/VoiceOver** - Screen reader testing
- **Keyboard testing** - Tab through all interactions

## Best Practices
1. Test with real assistive technology, not just automated tools
2. Include users with disabilities in testing when possible
3. Document all known issues with planned remediation dates
4. Prioritize by user impact, not just WCAG level
5. Consider accessibility in design phase, not just QA
