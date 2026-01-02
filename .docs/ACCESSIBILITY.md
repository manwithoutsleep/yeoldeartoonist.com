# Accessibility Standards

This document outlines the accessibility standards and testing procedures for yeoldeartoonist.com. We are committed to meeting WCAG 2.1 Level AA standards to ensure our website is accessible to all users.

## WCAG 2.1 AA Compliance

### Standards Overview

We follow Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, which includes:

- **Perceivable**: Information and user interface components must be presentable to users in ways they can perceive
- **Operable**: User interface components and navigation must be operable by all users
- **Understandable**: Information and user interface operation must be understandable
- **Robust**: Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies

## Implemented Accessibility Features

### 1. Keyboard Navigation

All interactive elements are fully accessible via keyboard:

- **Tab Navigation**: Logical tab order following visual layout
- **Focus Indicators**: Visible focus rings on all interactive elements using Tailwind's `focus:ring-2` utilities
- **Skip Link**: "Skip to main content" link appears on first Tab press (src/app/layout.tsx:100-105)
- **No Keyboard Traps**: Users can navigate away from all elements using standard keyboard controls
- **Escape Key**: Modals and drawers can be closed with the Escape key

**Key Files**:

- `src/app/layout.tsx` - Skip link implementation
- `src/components/cart/CartDrawer.tsx` - Focus trap and keyboard navigation for cart drawer
- `src/components/layout/Navigation.tsx` - Keyboard-accessible navigation with proper focus management

### 2. Screen Reader Support

All content is properly announced to screen readers:

- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, and `<section>` elements
- **ARIA Landmarks**: Explicit `role` attributes on key sections:
    - Header: `role="banner"` (src/components/layout/Header.tsx:38)
    - Navigation: `role="navigation"` with `aria-label="Main navigation"` (src/components/layout/Navigation.tsx:33-34)
    - Footer: `role="contentinfo"` (src/components/layout/Footer.tsx:21)
    - Cart Drawer: `role="dialog"` with `aria-modal="true"` (src/components/cart/CartDrawer.tsx:151-153)
- **Image Alt Text**: All images have descriptive alt text
- **ARIA Labels**: Icon buttons and navigation links have descriptive `aria-label` attributes
- **Form Labels**: All form inputs have associated `<label>` elements
- **Dynamic Content**: Status messages use `role="status"` and `aria-live="polite"` where appropriate

**Key Files**:

- `src/components/layout/Header.tsx` - Header with banner role and ARIA labels
- `src/components/layout/Navigation.tsx` - Navigation with ARIA labels and expanded states
- `src/components/layout/Footer.tsx` - Footer with contentinfo role
- `src/app/contact/ContactClient.tsx` - Accessible contact form with proper labels

### 3. Heading Hierarchy

All pages follow proper heading structure:

- One `<h1>` per page identifying the main content
- Headings follow logical order (h1 → h2 → h3, no skipping levels)
- Headings are used to describe content sections, not for styling
- Semantic HTML elements supplement heading structure

**Testing**: Use browser extensions like HeadingsMap or axe DevTools to verify heading structure

### 4. Color Contrast

We meet WCAG AA color contrast requirements:

- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

**Primary Color Scheme**:

- Black text on white background: ∞:1 (infinite contrast)
- White text on black background: ∞:1 (infinite contrast)
- Blue links (#3b82f6) on white: 8.6:1
- Gray text (#6b7280) on white: 5.7:1

**Testing Tools**:

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Lighthouse
- axe DevTools browser extension

### 5. Form Accessibility

All forms meet accessibility standards:

- **Labels**: All inputs have associated `<label>` elements (no placeholder-only labels)
- **Error Handling**: Validation errors are linked to inputs via `aria-describedby`
- **Error Announcements**: Error messages are visible and announced to screen readers
- **Required Fields**: Marked with `required` attribute
- **Field Validation**: Real-time validation with clear error messages
- **Focus Management**: Focus moves to first error on submission failure

**Example Form**: Contact Form (src/app/contact/ContactClient.tsx)

- Lines 204-224: Name input with label, aria-invalid, and aria-describedby
- Lines 227-251: Email input with validation and error messaging
- Lines 254-280: Message textarea with proper accessibility attributes

### 6. Focus Management

Interactive elements have visible focus indicators:

- **Focus Rings**: All buttons, links, and inputs have visible focus rings using `focus:ring-2`
- **Custom Focus Styles**: Focus indicators use sufficient contrast (typically black on white or white on black)
- **Focus Trap**: Modal dialogs and drawers implement focus traps to keep keyboard focus within the active component
- **Focus Restoration**: Focus is returned to triggering element when modals/drawers close

**Key Implementation**: CartDrawer (src/components/cart/CartDrawer.tsx:52-82)

- Implements focus trap for keyboard navigation
- Focuses close button when drawer opens
- Manages Tab and Shift+Tab navigation within drawer

### 7. Mobile Accessibility

Touch targets and mobile navigation:

- **Touch Targets**: Minimum 44x44px touch targets for all interactive elements (following WCAG 2.1 Level AAA guideline)
- **Responsive Navigation**: Mobile menu accessible via clearly labeled toggle button
- **Mobile Forms**: Form inputs are properly sized and spaced for touch interaction
- **Zoom Support**: Page content reflows properly when zoomed to 200%

## Testing Procedures

### Automated Testing

1. **Lighthouse Accessibility Audit**

    ```bash
    # Run Lighthouse in Chrome DevTools
    # Target score: >90 on all pages
    ```

2. **axe DevTools Browser Extension**
    - Install: https://www.deque.com/axe/devtools/
    - Run on each page during development
    - Fix all violations before deployment

3. **WAVE Web Accessibility Evaluation Tool**
    - Install browser extension: https://wave.webaim.org/extension/
    - Review all errors and warnings
    - Verify proper heading structure and landmarks

### Manual Testing

#### 1. Keyboard Navigation Test

Navigate the entire site using only keyboard:

- **Tab**: Move forward through interactive elements
- **Shift + Tab**: Move backward through interactive elements
- **Enter**: Activate links and buttons
- **Space**: Activate buttons, check checkboxes
- **Escape**: Close modals and drawers
- **Arrow Keys**: Navigate within menus (where applicable)

**Pages to Test**:

- Home page
- Gallery listing and detail pages
- Shoppe page
- Cart drawer and cart page
- In The Works page
- Contact page
- Admin login and dashboard

**Success Criteria**:

- All interactive elements are reachable via Tab
- Focus order is logical and follows visual layout
- Focus is visible on all elements
- No keyboard traps (can navigate away from all elements)
- Skip link works and is visible when focused

#### 2. Screen Reader Testing

Test with at least one screen reader:

- **Windows**: NVDA (free) - https://www.nvaccess.org/download/
- **macOS**: VoiceOver (built-in) - Cmd+F5 to toggle
- **Linux**: Orca

**What to Verify**:

- Page landmarks are announced (header, nav, main, footer)
- Headings are announced with correct levels
- Images have descriptive alt text that is announced
- Form labels are announced with inputs
- Error messages are announced
- Dynamic content changes are announced (cart updates, form validation)
- Links have descriptive text (no "click here")
- Buttons have descriptive labels

**Test Script**:

1. Navigate by landmarks (NVDA: D key, VoiceOver: VO+Cmd+H)
2. Navigate by headings (NVDA: H key, VoiceOver: VO+Cmd+H)
3. Navigate by forms (NVDA: F key, VoiceOver: VO+Cmd+J)
4. Fill out and submit contact form
5. Add item to cart and verify announcement
6. Navigate through cart drawer

#### 3. Color Contrast Testing

Check color contrast on all pages:

1. Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
2. Test all text/background combinations
3. Verify UI components meet 3:1 minimum
4. Check link colors have sufficient contrast

**Required Ratios**:

- Normal text (under 18pt): 4.5:1
- Large text (18pt+ or 14pt+ bold): 3:1
- UI components: 3:1

#### 4. Heading Hierarchy Test

Verify logical heading structure:

1. Install HeadingsMap browser extension
2. Open extension on each page
3. Verify:
    - One `<h1>` per page
    - No skipped levels (h1 → h3 without h2)
    - Headings describe content sections

### Testing Checklist

Before each release, verify:

- [ ] All pages have Lighthouse Accessibility score >90
- [ ] Zero axe DevTools violations
- [ ] All pages navigable with keyboard only
- [ ] Skip link works on all pages
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG AA on all pages
- [ ] Heading hierarchy is logical on all pages
- [ ] All forms have proper labels and error handling
- [ ] Focus indicators visible on all interactive elements
- [ ] Mobile navigation is accessible
- [ ] Touch targets are at least 44x44px
- [ ] Page reflows properly when zoomed to 200%

## Common Accessibility Issues to Avoid

1. **Missing Alt Text**: All images must have descriptive alt text (or `alt=""` for decorative images)
2. **Poor Color Contrast**: Test all color combinations against WCAG AA standards
3. **Keyboard Traps**: Ensure users can navigate away from all elements
4. **Missing Form Labels**: Never use placeholder-only labels
5. **No Focus Indicators**: All interactive elements must have visible focus state
6. **Skipped Heading Levels**: Don't skip from h1 to h3
7. **Non-Descriptive Link Text**: Avoid "click here" or "read more" without context
8. **Missing ARIA Labels**: Icon buttons need `aria-label` attributes
9. **Unlabeled Landmarks**: Navigation should have `aria-label` when there are multiple nav elements
10. **Inaccessible Modals**: Modals must trap focus and be dismissible via Escape key

## Resources

### WCAG Guidelines

- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- WCAG 2.1 Understanding Docs: https://www.w3.org/WAI/WCAG21/Understanding/

### Tools

- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse: Built into Chrome DevTools
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- HeadingsMap: Browser extension for testing heading structure

### Screen Readers

- NVDA (Windows): https://www.nvaccess.org/
- JAWS (Windows): https://www.freedomscientific.com/products/software/jaws/
- VoiceOver (macOS/iOS): Built-in, toggle with Cmd+F5
- Orca (Linux): Pre-installed on most Linux distributions

### Learning Resources

- A11y Project: https://www.a11yproject.com/
- WebAIM: https://webaim.org/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- Inclusive Components: https://inclusive-components.design/

## Reporting Accessibility Issues

If you discover an accessibility issue:

1. Document the issue with:
    - Page URL
    - What happened
    - What should happen
    - Assistive technology used (if applicable)
    - Steps to reproduce

2. Create a GitHub issue with the "accessibility" label

3. For urgent issues affecting site usability, contact: support@yeoldeartoonist.com

## Continuous Improvement

Accessibility is an ongoing commitment. We:

- Run automated tests on every pull request
- Manually test with keyboard and screen readers during development
- Review Lighthouse scores before each release
- Stay updated on WCAG guidelines and best practices
- Listen to user feedback and address accessibility concerns promptly

## Compliance Statement

Last Updated: January 2, 2026

yeoldeartoonist.com is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

**Conformance Status**: WCAG 2.1 Level AA

We welcome feedback on the accessibility of yeoldeartoonist.com. If you encounter accessibility barriers, please contact us at support@yeoldeartoonist.com.
