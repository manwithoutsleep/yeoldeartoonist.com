# phase-5-04: Accessibility & Security Audit

## Parent Specification

This is sub-task 04 of the parent specification: `2025-10-25T17-55-00-mvp-implementation-plan.md` (Phase 5). The coordinator spec `phase-5-00-coordinator.md` tracks completion of all Phase 5 tasks.

## Objective

Conduct comprehensive accessibility and security audits to ensure the application meets WCAG 2.1 AA standards and follows security best practices for production deployment.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This can start immediately (Phases 1-4 are already complete)

**Blocks** (tasks that depend on this one):

- phase-5-06-production-deployment.md (must pass audits before production launch)

**Parallel Opportunities**:

- phase-5-01-email-integration.md
- phase-5-02-performance-optimization.md
- phase-5-03-seo-optimization.md
- phase-5-05-error-handling-documentation.md

## Scope

Perform thorough accessibility and security audits, identify issues, and implement fixes to ensure the application is accessible to all users and secure against common vulnerabilities.

### In Scope

**Accessibility (5.6)**:

- Keyboard navigation testing across all pages
- Screen reader compatibility testing (NVDA, JAWS, or VoiceOver)
- Heading hierarchy verification
- Color contrast ratio checks (WCAG AA: 4.5:1 for text, 3:1 for large text)
- Form accessibility testing
- ARIA labels and roles where needed
- Focus management and visible focus indicators
- Skip links for main content

**Security (5.7)**:

- RLS (Row-Level Security) policy review
- Webhook signature verification
- Input validation with Zod schemas
- XSS vulnerability checks
- CSRF protection verification
- Environment variable security review
- Admin authentication bypass testing
- SQL injection prevention
- Content Security Policy (CSP) headers

### Out of Scope

- Penetration testing by third-party security firm
- WCAG 2.1 AAA compliance (targeting AA only)
- Advanced security features (rate limiting, DDoS protection) - handled by Vercel
- Compliance certifications (SOC 2, PCI-DSS beyond Stripe)
- Security monitoring services (Sentry, DataDog)

## Implementation Requirements

### 5.6 Accessibility Audit

#### 5.6.1 Keyboard Navigation

Test and verify keyboard-only navigation on all pages:

- Tab order is logical and follows visual layout
- All interactive elements are keyboard accessible
- No keyboard traps (user can navigate away from all elements)
- Focus is visible on all interactive elements
- Skip link to main content works
- Dropdowns, modals, and drawers are keyboard accessible
- Forms can be completed using keyboard only

Pages to test:

- Home page
- Gallery listing and detail pages
- Shoppe page
- Cart drawer and cart page
- Checkout form
- In The Works page
- Contact page
- Admin login and dashboard (admin users need accessibility too)

#### 5.6.2 Screen Reader Testing

Test with at least one screen reader:

- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

Verify:

- Page landmarks are properly announced (header, nav, main, footer)
- Headings are announced with correct levels
- Images have descriptive alt text
- Form labels are properly associated with inputs
- Error messages are announced
- Dynamic content changes are announced (cart updates, form errors)
- Links have descriptive text (avoid "click here")

#### 5.6.3 Heading Hierarchy

Verify proper heading structure on all pages:

- One `<h1>` per page
- Headings follow logical order (h1 → h2 → h3, no skipping levels)
- Headings describe content sections
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`)

#### 5.6.4 Color Contrast

Check color contrast ratios using tools:

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Lighthouse
- axe DevTools browser extension

Requirements:

- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- UI components and graphics: 3:1 minimum

Test:

- Text on white background
- Text on black background
- Text on scroll image background (contact page)
- Button text and backgrounds
- Link colors

#### 5.6.5 Form Accessibility

Verify all forms meet accessibility standards:

- All inputs have associated `<label>` elements
- Error messages are linked to inputs via `aria-describedby`
- Required fields are marked with `aria-required` or `required` attribute
- Form validation errors are announced to screen readers
- Placeholder text is not the only label (use actual labels)
- Fieldsets and legends for grouped inputs (e.g., address forms)

Forms to test:

- Login form (admin)
- Checkout form (customer)
- Contact form (if implemented)

#### 5.6.6 ARIA Labels

Add ARIA labels where semantic HTML is insufficient:

- Navigation landmarks: `<nav aria-label="Main navigation">`
- Buttons with icons only: `<button aria-label="Close cart">`
- Status messages: `<div role="status" aria-live="polite">`
- Modals: `role="dialog"`, `aria-labelledby`, `aria-describedby`
- Drawers/side panels: `role="complementary"` or `role="dialog"`

**Important**: Don't overuse ARIA - semantic HTML is preferred when available.

### 5.7 Security Audit

#### 5.7.1 RLS Policy Review

Verify Row-Level Security policies in Supabase:

- Policies were created in Phase 1 (see `src/lib/db/migrations/001_initial_schema.sql`)
- Test that unauthenticated users can only read published content
- Test that authenticated users cannot modify other users' data
- Test that admin operations require admin authentication
- Verify policies prevent data leakage

Test cases:

- Attempt to read unpublished artwork as public user
- Attempt to modify order as non-admin
- Attempt to access administrators table as public user
- Verify admin can access all data with service role key

#### 5.7.2 Webhook Signature Verification

Verify Stripe webhook signature checking in `src/app/api/checkout/webhook/route.ts`:

- Webhook signature is verified using `stripe.webhooks.constructEvent()`
- Invalid signatures are rejected with 400 error
- Webhook secret is stored in environment variable
- Test with invalid signature to ensure rejection

#### 5.7.3 Input Validation

Review all user inputs for validation:

- Checkout form validates with Zod schema
- Admin forms validate with Zod schemas
- API routes validate request bodies
- File uploads validate file types and sizes
- Query parameters are validated (slugs, IDs)

Check for:

- SQL injection prevention (using parameterized queries via Supabase)
- NoSQL injection prevention (validate object shapes)
- Path traversal prevention (validate file paths)

#### 5.7.4 XSS Prevention

Check for Cross-Site Scripting vulnerabilities:

- React automatically escapes output (default protection)
- Verify no use of `dangerouslySetInnerHTML` without sanitization
- Ensure user-generated content is escaped (artwork descriptions, order notes)
- Check for reflected XSS in URL parameters
- Verify Content Security Policy headers are set

Test XSS payloads in:

- Artwork descriptions
- Order notes
- Contact form inputs
- Admin form inputs

#### 5.7.5 CSRF Protection

Verify CSRF protection:

- Next.js Server Actions have built-in CSRF protection
- API routes use proper HTTP methods (POST for mutations)
- Verify Stripe webhook uses signature verification (serves as CSRF protection)
- Check that state-changing operations require authentication

#### 5.7.6 Environment Variable Security

Review environment variable handling:

- Sensitive keys are in `.env.local` (not committed to git)
- `.env.local` is in `.gitignore`
- Production environment variables are set in Vercel dashboard
- Public variables use `NEXT_PUBLIC_` prefix appropriately
- Server-only variables (service role key, webhook secret) are NOT prefixed with `NEXT_PUBLIC_`
- No hardcoded secrets in code

Check:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- `STRIPE_SECRET_KEY` is server-only
- `STRIPE_WEBHOOK_SECRET` is server-only
- `RESEND_API_KEY` is server-only

#### 5.7.7 Admin Authentication Testing

Attempt to bypass admin authentication:

- Try accessing `/admin` without logging in → should redirect to login
- Try accessing `/admin` with expired session → should redirect to login
- Try accessing admin API routes without auth → should return 401/403
- Try accessing admin with inactive admin user → should be rejected
- Verify middleware session cache expires after 15 minutes

Test in browser:

- Delete admin_session cookie and try to access `/admin`
- Modify admin_session cookie and try to access `/admin`
- Use browser devtools to inspect middleware behavior

## Files to Create/Modify

- `src/app/layout.tsx` - Add skip link for main content
- `src/components/layout/Header.tsx` - Verify proper ARIA labels and keyboard nav
- `src/components/layout/Navigation.tsx` - Verify keyboard accessibility
- `src/components/cart/CartDrawer.tsx` - Add focus management and ARIA attributes
- `src/components/checkout/CheckoutForm.tsx` - Verify form accessibility
- `src/components/admin/AdminSidebar.tsx` - Verify admin navigation accessibility
- `next.config.ts` - Add Content Security Policy headers (if needed)
- `.docs/ACCESSIBILITY.md` - Document accessibility standards and testing procedures (create new file)
- `.docs/SECURITY.md` - Document security measures and best practices (create new file)

## Testing Requirements

### Accessibility Testing Tools

- **Lighthouse**: Run accessibility audit in Chrome DevTools
- **axe DevTools**: Browser extension for automated accessibility testing
- **WAVE**: Web accessibility evaluation tool (browser extension)
- **Keyboard**: Manual keyboard-only navigation testing
- **Screen reader**: NVDA, JAWS, or VoiceOver testing

### Security Testing Tools

- **OWASP ZAP**: Automated security scanning (optional)
- **Browser DevTools**: Network tab for checking headers
- **Postman/curl**: Test API authentication and authorization
- **Stripe CLI**: Test webhook signature verification with invalid signatures

### Manual Test Cases

**Accessibility**:

1. Navigate entire site using Tab, Shift+Tab, Enter, Space, Escape
2. Use screen reader to navigate all pages
3. Verify color contrast on all pages
4. Test forms with screen reader
5. Check heading hierarchy with browser extension

**Security**:

1. Attempt to access `/admin` without authentication
2. Attempt to access admin API routes without authentication
3. Test webhook endpoint with invalid signature
4. Attempt SQL injection in form inputs
5. Attempt XSS payloads in text inputs
6. Verify RLS policies in Supabase dashboard

## Success Criteria

**Accessibility**:

- [ ] All pages navigable with keyboard only (not tested)
- [ ] Screen reader announces all content correctly (not tested)
- [ ] Heading hierarchy is logical on all pages (not verified)
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text) - not tested
- [ ] All forms are accessible with proper labels and error handling (not verified)
- [ ] ARIA labels added where needed (not found in layout/components)
- [ ] Focus indicators are visible on all interactive elements (not verified)
- [ ] Skip link to main content works (no skip link found in src/app/layout.tsx)
- [ ] Lighthouse Accessibility score >90 on all pages (not tested/documented)

**Security**:

- [x] RLS policies reviewed and tested (from Phase 1, in database migrations)
- [x] Webhook signature verification confirmed (src/app/api/checkout/webhook/route.ts:74-85)
- [x] All inputs validated with Zod (contact form validation exists)
- [ ] No XSS vulnerabilities found (not explicitly tested)
- [ ] CSRF protection verified (not documented, Next.js has built-in protection)
- [x] Environment variables properly secured (.env.example documents all vars)
- [x] Admin authentication cannot be bypassed (src/proxy.ts protection)
- [ ] No SQL injection vulnerabilities (using Supabase but not explicitly tested)
- [ ] Content Security Policy headers configured (if needed) - not found
- [ ] Security documentation created (no .docs/SECURITY.md)

**General**:

- [ ] All tests pass
- [ ] The verify-code skill has been successfully executed

## Notes

### WCAG 2.1 AA Compliance

WCAG (Web Content Accessibility Guidelines) Level AA includes:

- Keyboard accessibility
- Color contrast requirements
- Text alternatives for images
- Proper form labels
- Logical heading structure
- Descriptive link text
- Accessible forms with error handling

### Common Accessibility Issues

- Missing alt text on images
- Poor color contrast
- Keyboard traps in modals
- Missing form labels
- No focus indicators
- Skipped heading levels
- Non-descriptive link text ("click here")
- Missing ARIA labels on icon buttons

### Common Security Vulnerabilities (OWASP Top 10)

1. **Broken Access Control**: RLS policies, admin middleware
2. **Cryptographic Failures**: Use HTTPS, secure cookies
3. **Injection**: SQL injection, XSS (prevented by Supabase + React)
4. **Insecure Design**: Proper authentication flow
5. **Security Misconfiguration**: Environment variables, CSP headers
6. **Vulnerable Components**: Keep dependencies updated
7. **Authentication Failures**: Secure admin login, session management
8. **Data Integrity Failures**: Webhook signature verification
9. **Logging Failures**: Log security events (Phase 5.8)
10. **Server-Side Request Forgery**: Validate URLs in admin forms

### Resources

**Accessibility**:

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM: https://webaim.org/
- A11y Project: https://www.a11yproject.com/

**Security**:

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security Best Practices: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- Stripe Security: https://stripe.com/docs/security
- Supabase Security: https://supabase.com/docs/guides/auth/row-level-security
