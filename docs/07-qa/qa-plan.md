# QA Plan (Canonical)

This plan covers testing for the Cursor Prototype Starter Kit, ensuring all MVP features work correctly before use on client projects.

---

## Test Strategy

### Test Types Required

| Type | Coverage | Tools | Automation |
|------|----------|-------|------------|
| **Manual** | UI/UX flows, visual design, handoff accuracy | Browser DevTools, Overlay Mode | No |
| **Integration** | Build process, export pipeline, multi-page routing | npm scripts | Partial |
| **E2E** | Critical user paths, handoff portal, overlay system | Playwright | Yes |
| **Visual Regression** | Screenshot comparison across breakpoints | Playwright | Yes |
| **Accessibility** | WCAG compliance, keyboard nav, screen reader | axe-core, manual | Partial |
| **Performance** | Lighthouse scores, animation smoothness | Lighthouse CI | Yes |

### Acceptance Testing Approach

1. **Feature Verification**: Each MVP requirement (REQ-001 through REQ-008) tested against acceptance criteria
2. **Cross-Browser Testing**: Verify functionality in Chrome, Firefox, Safari, Edge (latest 2 versions)
3. **Responsive Testing**: Test at 3 breakpoints - Mobile (375px), Tablet (768px), Desktop (1280px+)
4. **Handoff Validation**: Export package tested by developer persona for completeness

---

## Acceptance Testing Checklist (MVP)

### Development Environment (REQ-001)
- [x] `npm install` completes without errors
- [x] `npm run dev` starts dev server on port 5173
- [x] Hot reload works for HTML changes
- [x] Hot reload works for CSS/Tailwind changes
- [x] Hot reload works for TypeScript changes
- [x] `npm run build` produces `/dist` folder
- [x] `npm run preview` serves build correctly

### Design Token System (REQ-002)
- [x] Custom colors render correctly (primary, secondary, neutral)
- [x] Typography scale applies across all pages
- [x] Tailwind classes compile without errors
- [x] Design tokens visible in overlay mode

### Component Architecture (REQ-003)
- [x] All sections load correctly on pages
- [x] Missing section shows fallback comment
- [x] Sections responsive at all breakpoints
- [x] Component HTML is semantic and accessible

### Handoff Overlay (REQ-004)
- [x] Overlay toggle button visible and functional
- [x] Section boundaries displayed correctly
- [x] Spacing values shown on hover
- [x] Overlay works at mobile breakpoint
- [x] Overlay works at tablet breakpoint
- [x] Overlay works at desktop breakpoint
- [x] Overlay can be dismissed cleanly

### Handoff Exporter (REQ-005)
- [x] `npm run handoff:export` completes without errors
- [x] Markdown guide generated with section details
- [x] JSON data includes computed styles
- [x] Page index JSON generated
- [x] Screenshots captured for all pages
- [x] Export ZIP downloadable

### Handoff Portal (REQ-006)
- [x] Portal page loads at `/handoff/`
- [x] Download links functional
- [x] QA checklist displayed
- [x] Screenshot gallery populated
- [x] Links to overlay mode work

### GSAP Animations (REQ-007)
- [x] Scroll animations trigger correctly
- [x] Animations smooth at 60fps
- [x] Reduced motion: animations disabled when preference set
- [x] No JavaScript errors in console

### Docker Environment (REQ-008)
- [x] `docker compose up` starts successfully
- [x] Dev server accessible at localhost:5173
- [x] File changes reflect in container (volume mounts)
- [x] Container stops cleanly

---

## Test Cases

### TC-001: New Project Setup
- **Scenario**: Developer clones template and starts new project
- **Steps**:
  1. Clone repository
  2. Run `npm install`
  3. Run `npm run dev`
  4. Open browser to localhost:5173
- **Expected result**: Homepage loads with demo content, no errors in console
- **Notes**: Test with Node 18, 20, and 22

### TC-002: Handoff Export Workflow
- **Scenario**: Designer exports handoff package after design approval
- **Steps**:
  1. Run `npm run handoff:export`
  2. Navigate to `/_handoff/exports/`
  3. Download ZIP package
  4. Extract and review contents
- **Expected result**: ZIP contains markdown guide, JSON data, screenshots, assets
- **Notes**: Verify all pages included in export

### TC-003: Overlay Mode Developer Usage
- **Scenario**: Developer uses overlay to understand section specs
- **Steps**:
  1. Navigate to any page
  2. Click overlay toggle button
  3. Hover over different sections
  4. Check spacing values and tokens
  5. Toggle off overlay
- **Expected result**: Clear visual specs, accurate spacing values, smooth toggle
- **Notes**: Test on mobile via responsive mode

### TC-004: Responsive Breakpoint Verification
- **Scenario**: Verify all pages render correctly at each breakpoint
- **Steps**:
  1. Open each page in sequence
  2. Set viewport to 375px (mobile)
  3. Verify layout and content
  4. Set viewport to 768px (tablet)
  5. Verify layout and content
  6. Set viewport to 1280px (desktop)
  7. Verify layout and content
- **Expected result**: No layout breaks, text readable, images sized appropriately
- **Notes**: Use browser DevTools device simulation

### TC-005: Accessibility Keyboard Navigation
- **Scenario**: User navigates site using keyboard only
- **Steps**:
  1. Start at homepage
  2. Tab through all interactive elements
  3. Verify focus indicators visible
  4. Activate links/buttons with Enter/Space
  5. Navigate through all pages
- **Expected result**: All interactive elements reachable, focus visible, actions work
- **Notes**: Test with screen reader (VoiceOver/NVDA) if available

### TC-006: Build and Deploy Simulation
- **Scenario**: Project built and deployed to static hosting
- **Steps**:
  1. Run `npm run build`
  2. Run `npm run preview`
  3. Navigate through all pages
  4. Test handoff portal
  5. Verify all assets load
- **Expected result**: Production build identical to dev, no broken links/assets
- **Notes**: Check network tab for 404s

---

## Browser Testing Matrix

| Browser | Version | OS | Status |
|---------|---------|-----|--------|
| Chrome | Latest, Latest-1 | macOS, Windows | Required |
| Firefox | Latest, Latest-1 | macOS, Windows | Required |
| Safari | Latest, Latest-1 | macOS | Required |
| Edge | Latest, Latest-1 | Windows | Required |
| Safari | Latest | iOS 16+ | Recommended |
| Chrome | Latest | Android 12+ | Recommended |

**Not Supported**: Internet Explorer (any version), Legacy Edge (non-Chromium)

---

## Environments

### Local Development
- **URL**: `http://localhost:5173`
- **Purpose**: Active development and testing
- **Data**: Demo content included
- **Access**: Developer machine only

### Preview/Staging
- **URL**: `http://localhost:4173` (via `npm run preview`)
- **Purpose**: Production build validation
- **Data**: Demo content, production-optimized
- **Access**: Developer machine only

### Client Review (Optional)
- **URL**: Deployed to Vercel/Netlify preview
- **Purpose**: Client design approval
- **Data**: Demo or client-specific content
- **Access**: Shareable URL

---

## Exit Criteria

### Release Blocker Resolution
- [ ] All critical bugs fixed (P0)
- [ ] No console errors on any page
- [ ] Build completes without warnings
- [ ] All MVP acceptance criteria marked complete

### Quality Gates
- [ ] Lighthouse Performance score: 90+
- [ ] Lighthouse Accessibility score: 90+
- [ ] No high/critical npm audit vulnerabilities
- [ ] All test cases pass

### Documentation Complete
- [ ] README updated with accurate instructions
- [ ] HANDOFF.md reflects current export format
- [ ] CHANGELOG updated with release notes

### Stakeholder Sign-off
- [ ] Design team confirms overlay accuracy
- [ ] Development team confirms handoff usability
- [ ] Template maintainer approves for distribution

---

## Known Issues and Workarounds

| Issue | Workaround | Status |
|-------|------------|--------|
| Safari scroll animation jank on older devices | Reduce animation complexity | Monitoring |
| Docker volume sync slow on Windows | Use WSL2 backend | Documented |

---

## Test Automation Commands

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run accessibility audit
npm run check:accessibility

# Run visual QA
npm run visual-qa

# Validate build
npm run validate:build

# Full validation suite
npm run validate:all
```
