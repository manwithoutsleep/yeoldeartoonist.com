# Security Documentation

This document outlines the security measures, best practices, and testing procedures implemented in yeoldeartoonist.com to protect against common web vulnerabilities and ensure safe production deployment.

## Security Overview

We follow OWASP Top 10 security guidelines and implement defense-in-depth strategies to protect user data, prevent unauthorized access, and maintain system integrity.

## Implemented Security Measures

### 1. Row-Level Security (RLS) Policies

**Implementation**: Database-level access control in Supabase PostgreSQL

**Location**: `src/lib/db/migrations/001_initial_schema.sql`

**Policies Implemented**:

1. **Public Read Access** (authenticated and anonymous users):
    - Artwork: Read only published artwork (`is_available = true`)
    - Categories: Read all categories
    - Pages: Read all pages
    - Projects: Read all projects
    - Events: Read all events

2. **Admin-Only Write Access**:
    - All tables: Only authenticated admin users can INSERT, UPDATE, DELETE
    - Enforced via `auth.uid()` matching `administrators.auth_id`

3. **Protected Tables**:
    - `administrators`: No public access, admin-only via service role
    - `orders` and `order_items`: Admin-only access (customers use Stripe Checkout)

**Testing**:

```sql
-- Test as unauthenticated user (should return only published artwork)
SELECT * FROM artwork WHERE is_available = false;  -- Should return empty

-- Test as non-admin authenticated user (should fail)
INSERT INTO artwork (...) VALUES (...);  -- Should fail with permission error

-- Test as admin (should succeed with service role key)
-- This is tested in middleware authentication flow
```

**Key Files**:

- Database schema: `src/lib/db/migrations/001_initial_schema.sql`
- Middleware authentication: `src/middleware.ts`

### 2. Admin Authentication & Authorization

**Multi-Layer Protection**:

1. **Supabase Auth**: Email/password authentication with secure session management
2. **Middleware Verification**: All `/admin` routes protected by middleware (src/middleware.ts)
3. **Database Verification**: Active admin status checked in `administrators` table
4. **Session Caching**: 15-minute session cache to reduce database queries while maintaining security

**Authentication Flow** (src/middleware.ts):

1. Check for cached admin session cookie (lines 80-99)
2. Verify user is authenticated via Supabase Auth (lines 119-130)
3. Verify user is active admin in database (lines 155-180)
4. Cache admin session for 15 minutes with httpOnly cookie (lines 182-197)

**Cookie Security**:

```typescript
{
    httpOnly: true,           // Prevent JavaScript access (XSS protection)
    secure: !isDevelopment,   // HTTPS only in production
    sameSite: 'lax',          // CSRF protection
    maxAge: 15 * 60           // 15 minutes
}
```

**Bypass Prevention**:

- Login page (`/admin/login`) excluded from auth check to prevent redirect loop
- Service role key required for admin table queries (bypasses RLS but requires server-side access)
- Session cache validates both user ID and expiration timestamp
- Cache invalidates after 15 minutes, forcing re-authentication check

**Testing**:

```bash
# Test 1: Access admin without authentication
curl http://localhost:3000/admin
# Expected: Redirect to /admin/login

# Test 2: Access admin with invalid cookie
curl -H "Cookie: admin_session=invalid" http://localhost:3000/admin
# Expected: Redirect to /admin/login

# Test 3: Access admin with inactive user
# (requires database setup with inactive admin user)
# Expected: Redirect to /admin/login
```

### 3. Webhook Signature Verification

**Implementation**: Stripe webhook signature validation

**Location**: `src/app/api/checkout/webhook/route.ts`

**Security Measures**:

1. **Signature Verification** (lines 74-85):

    ```typescript
    const signature = request.headers.get('stripe-signature');
    const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
    );
    ```

2. **Secret Storage**: Webhook secret stored in environment variable (server-only)
3. **Signature Rejection**: Invalid signatures return 400 error
4. **Raw Body**: Uses raw request body (not parsed JSON) for signature validation

**Why This Matters**:

- Prevents forged webhook events
- Ensures only Stripe can trigger order creation
- Protects against unauthorized order manipulation

**Testing**:

```bash
# Test with Stripe CLI
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Test with invalid signature (should fail)
curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid" \
  -d '{"type": "checkout.session.completed"}'
# Expected: 400 error
```

### 4. Input Validation with Zod

**Implementation**: Schema validation for all user inputs

**Key Files**:

- Contact form: `src/app/contact/ContactClient.tsx` (lines 11-21)
- Admin forms: `src/components/admin/AdminForm.tsx`
- Artwork forms: `src/components/admin/artwork/ArtworkForm.tsx`
- Checkout API: `src/app/api/checkout/session/route.ts`

**Validation Examples**:

1. **Contact Form** (ContactClient.tsx):

    ```typescript
    const contactFormSchema = z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        message: z.string().min(10).max(5000),
    });
    ```

2. **Image Upload** (src/lib/upload.ts):

    ```typescript
    - File type validation: Only JPEG, PNG, WebP, GIF allowed
    - File size limit: 10MB maximum
    - Extension validation: Checks file extension matches MIME type
    ```

3. **Query Parameters**:
    - UUIDs validated against regex pattern
    - Slugs sanitized to prevent path traversal
    - Numeric IDs validated as integers

**SQL Injection Prevention**:

- Supabase client uses parameterized queries automatically
- All queries use `.eq()`, `.in()`, `.filter()` methods (never raw SQL strings)
- Database migrations use PostgreSQL prepared statements

**NoSQL Injection Prevention**:

- Zod validates object shapes before database operations
- Type checking ensures correct data types
- No dynamic query construction from user input

### 5. XSS (Cross-Site Scripting) Prevention

**React Default Protection**:

- React automatically escapes all output by default
- JSX prevents script injection in rendered content

**Safe HTML Rendering**:

- Limited use of `dangerouslySetInnerHTML` (only 1 occurrence)
- Only occurrence is for JSON-LD structured data using `JSON.stringify()`
- Location: `src/components/seo/StructuredData.tsx` (lines 35-37)

**User-Generated Content**:

- Artwork descriptions: Escaped by React (rendered as text)
- Order notes: Escaped by React
- Contact form messages: Validated with Zod, escaped by React
- Admin inputs: Validated and escaped

**Testing**:

```javascript
// Test XSS payloads in form inputs
const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
];

// Submit each payload to:
// - Contact form message field
// - Admin artwork description field
// - Admin project title field

// Expected: All payloads rendered as plain text, no script execution
```

### 6. CSRF (Cross-Site Request Forgery) Protection

**Built-in Protection**:

- Next.js Server Actions have built-in CSRF protection
- Same-origin policy enforced
- CSRF tokens handled automatically by Next.js

**API Route Protection**:

- Stripe webhook uses signature verification (serves as CSRF protection)
- Admin API routes require authentication (middleware check)
- State-changing operations use POST method (not GET)

**Cookie Security**:

- SameSite attribute set to 'lax' on admin session cookie
- Prevents cross-site cookie transmission
- httpOnly prevents JavaScript access

### 7. Environment Variable Security

**Configuration**: `.env.local` (gitignored)

**Public Variables** (prefixed with `NEXT_PUBLIC_`):

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public anonymous key (safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY # Stripe publishable key (safe to expose)
NEXT_PUBLIC_SITE_URL              # Site URL for metadata
```

**Server-Only Variables** (NO `NEXT_PUBLIC_` prefix):

```
SUPABASE_SERVICE_ROLE_KEY         # CRITICAL: Server-side only, bypasses RLS
STRIPE_SECRET_KEY                 # CRITICAL: Server-side only
STRIPE_WEBHOOK_SECRET             # CRITICAL: Server-side only
RESEND_API_KEY                    # Server-side only
```

**Security Measures**:

1. `.env.local` in `.gitignore` (never committed)
2. `.env.example` documents required variables without values
3. Production variables set in Vercel dashboard (encrypted at rest)
4. Service role key only used in middleware and server actions
5. No hardcoded secrets in source code

**Verification**:

```bash
# Check that .env.local is gitignored
git check-ignore .env.local
# Expected: .env.local

# Check for hardcoded secrets in code
git grep -i "sk_live"   # Stripe live secret key
git grep -i "sk_test"   # Stripe test secret key
# Expected: No results
```

### 8. Content Security Policy (CSP)

**Implementation**: HTTP headers in `next.config.ts`

**Location**: `next.config.ts` (lines 96-149)

**CSP Directives**:

```
default-src 'self'                                # Only load resources from same origin by default
script-src 'self' https://js.stripe.com           # Allow scripts from self and Stripe only (no unsafe-inline/unsafe-eval for XSS protection)
style-src 'self' 'unsafe-inline'                  # Allow styles from self, Google Fonts, and inline (Tailwind requirement)
         https://fonts.googleapis.com
img-src 'self' blob: data:                        # Allow images from self, Supabase, and data URIs
       https://*.supabase.co https://127.0.0.1
font-src 'self' https://fonts.gstatic.com data:   # Allow fonts from self and Google Fonts
connect-src 'self' https://*.supabase.co          # Allow API connections to Supabase and Stripe
           https://127.0.0.1 http://127.0.0.1
           https://api.stripe.com
frame-src 'self' https://js.stripe.com            # Allow frames from Stripe (for Elements)
object-src 'none'                                 # Block plugins (Flash, Java, etc.)
base-uri 'self'                                   # Prevent base tag injection
form-action 'self'                                # Forms can only submit to same origin
frame-ancestors 'self'                            # Prevent clickjacking
upgrade-insecure-requests                         # Upgrade HTTP to HTTPS
```

**Security Rationale**:

- **No `unsafe-inline` or `unsafe-eval` for scripts**: Next.js 14+ App Router with server components does not require inline scripts or eval. Removing these directives significantly strengthens XSS protection by preventing execution of inline JavaScript and dynamic code evaluation.
- **Stripe integration**: Stripe loads from an external script URL (`https://js.stripe.com`), which does not require `unsafe-inline`.
- **Style inline allowed**: Tailwind CSS compilation may generate inline styles in production builds, so `unsafe-inline` remains only for `style-src`.
- **If inline scripts become necessary**: Use nonces or hashes instead of `unsafe-inline` to maintain security while allowing specific scripts.

**Additional Security Headers**:

- `Strict-Transport-Security`: Force HTTPS for 2 years
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: Enable browser XSS filter
- `Referrer-Policy`: Control referrer information
- `Permissions-Policy`: Disable camera, microphone, geolocation

**Testing**:

```bash
# Check security headers in production
curl -I https://yeoldeartoonist.com | grep -i "content-security-policy\|x-frame\|strict-transport"

# Test CSP violations in browser console
# Expected: CSP violations logged for unauthorized resource loads
```

### 9. Authentication & Session Management

**Supabase Auth Features**:

- Secure password hashing (bcrypt)
- JWT-based session tokens
- Automatic token refresh
- Session expiration and timeout
- Secure cookie storage

**Session Security**:

- HttpOnly cookies prevent JavaScript access
- Secure flag enforces HTTPS in production
- SameSite attribute prevents CSRF
- 15-minute middleware cache with re-validation

**Password Requirements** (enforced by Supabase):

- Minimum 6 characters
- No maximum length limit
- Can include special characters

**Best Practices Followed**:

- No session fixation vulnerabilities
- Session tokens rotated on authentication
- Logout clears all session data
- Inactive admin users cannot authenticate

### 10. Data Protection

**Database Security**:

- RLS policies restrict row-level access
- Service role key required for admin operations
- Connection strings use SSL/TLS encryption
- Database hosted on Supabase with automatic backups

**File Upload Security** (src/lib/upload.ts):

- File type validation (MIME type and extension)
- File size limits (10MB maximum)
- Secure storage in Supabase Storage
- Public URL generation for approved files only

**Customer Data**:

- Payment processing via Stripe (PCI DSS compliant)
- No credit card data stored in our database
- Order data encrypted at rest and in transit
- Customer emails handled securely

### 11. API Security

**Rate Limiting**:

- Handled by Vercel platform (automatic)
- DDoS protection included

**API Route Protection**:

- Admin API routes require authentication
- Public API routes have input validation
- Error messages don't leak sensitive information

**Checkout API** (src/app/api/checkout/session/route.ts):

- Validates cart items against database
- Prevents price manipulation
- Checks product availability
- Uses server-side Stripe client

## OWASP Top 10 (2021) Coverage

| Vulnerability                   | Protection                            | Implementation                           |
| ------------------------------- | ------------------------------------- | ---------------------------------------- |
| 1. Broken Access Control        | RLS policies, middleware auth         | `src/middleware.ts`, database migrations |
| 2. Cryptographic Failures       | HTTPS, secure cookies, Stripe         | `next.config.ts` (HSTS), Vercel platform |
| 3. Injection                    | Parameterized queries, Zod validation | All database queries, all forms          |
| 4. Insecure Design              | Secure architecture, defense-in-depth | Overall system design                    |
| 5. Security Misconfiguration    | CSP headers, secure defaults          | `next.config.ts`, environment variables  |
| 6. Vulnerable Components        | Regular dependency updates            | `npm audit`, Dependabot                  |
| 7. Authentication Failures      | Supabase Auth, session management     | `src/middleware.ts`                      |
| 8. Data Integrity Failures      | Webhook signatures, input validation  | Stripe webhook verification              |
| 9. Logging Failures             | Error logging (Phase 5.8)             | To be implemented                        |
| 10. Server-Side Request Forgery | URL validation in admin forms         | Admin form validation                    |

## Security Testing Procedures

### Automated Testing

1. **npm audit**

    ```bash
    npm audit
    # Expected: 0 high or critical vulnerabilities
    ```

2. **Dependency Updates**

    ```bash
    npm outdated
    npm update
    # Review and test major version updates
    ```

3. **TypeScript Type Checking**
    ```bash
    npx tsc --noEmit
    # Expected: 0 errors
    ```

### Manual Testing

#### 1. Authentication Bypass Testing

**Test Cases**:

1. Access admin routes without login

    ```
    Navigate to: http://localhost:3000/admin
    Expected: Redirect to /admin/login
    ```

2. Modify admin session cookie

    ```
    1. Login as admin
    2. Open browser DevTools → Application → Cookies
    3. Modify admin_session cookie value
    4. Refresh page
    Expected: Redirect to /admin/login
    ```

3. Use expired session

    ```
    1. Login as admin
    2. Wait 16 minutes
    3. Attempt admin action
    Expected: Redirect to /admin/login or session refresh
    ```

4. Inactive admin user
    ```
    1. Set is_active = false in administrators table
    2. Attempt to login
    Expected: Login fails or access denied
    ```

#### 2. XSS Testing

**Test Payloads**:

```html
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
<svg/onload=alert('XSS')>
javascript:alert('XSS')
"><script>alert(String.fromCharCode(88,83,83))</script>
```

**Test Locations**:

- Contact form (name, email, message)
- Admin artwork form (title, description)
- Admin project form (title, description)
- Admin event form (title, description)

**Expected Result**: All payloads rendered as plain text, no script execution

#### 3. SQL Injection Testing

**Test Payloads**:

```sql
' OR '1'='1
'; DROP TABLE artwork; --
' UNION SELECT * FROM administrators --
admin'--
' OR 1=1--
```

**Test Locations**:

- Contact form email field
- Admin search/filter fields
- Any text input that queries database

**Expected Result**: Payloads treated as literal strings, no SQL execution

#### 4. CSRF Testing

**Test Cases**:

1. Forged form submission from external site

    ```html
    <form action="https://yeoldeartoonist.com/api/admin/create" method="POST">
        <input type="hidden" name="title" value="Forged" />
        <input type="submit" />
    </form>
    ```

    Expected: Request blocked or CSRF token validation fails

2. Cross-origin API request
    ```javascript
    fetch('https://yeoldeartoonist.com/api/admin/delete', {
        method: 'POST',
        credentials: 'include',
    });
    ```
    Expected: CORS policy blocks request or SameSite cookie prevents auth

#### 5. File Upload Security Testing

**Test Cases**:

1. Upload executable file with image extension

    ```
    File: malware.exe renamed to malware.jpg
    Expected: Upload rejected (MIME type validation)
    ```

2. Upload oversized file

    ```
    File: 15MB image
    Expected: Upload rejected (exceeds 10MB limit)
    ```

3. Upload invalid image type

    ```
    File: test.pdf or test.exe
    Expected: Upload rejected (invalid file type)
    ```

4. Path traversal attempt
    ```
    Filename: ../../etc/passwd.jpg
    Expected: Filename sanitized or upload rejected
    ```

### Penetration Testing Checklist

Before production deployment:

- [ ] All environment variables configured in Vercel
- [ ] HTTPS enabled and enforced (HSTS header)
- [ ] CSP headers configured and tested
- [ ] RLS policies tested with multiple user types
- [ ] Admin authentication tested with bypass attempts
- [ ] Webhook signature verification tested with invalid signatures
- [ ] XSS payloads tested in all input fields
- [ ] SQL injection payloads tested in all queries
- [ ] CSRF protection tested with cross-origin requests
- [ ] File upload security tested with malicious files
- [ ] Session management tested (expiration, logout)
- [ ] Error messages don't leak sensitive information
- [ ] API endpoints have proper authentication
- [ ] npm audit shows 0 critical/high vulnerabilities

## Incident Response

### Security Issue Discovered

If a security vulnerability is discovered:

1. **Immediate Actions**:
    - Document the vulnerability (what, where, how, impact)
    - Assess severity (Critical/High/Medium/Low)
    - If critical, consider taking affected systems offline

2. **Notification**:
    - Notify development team immediately
    - Create private GitHub security advisory
    - Do NOT disclose publicly until patch is deployed

3. **Remediation**:
    - Develop and test fix
    - Deploy to production ASAP for critical issues
    - Verify fix resolves the vulnerability

4. **Post-Incident**:
    - Review logs for evidence of exploitation
    - Document lessons learned
    - Update security procedures if needed
    - Disclose vulnerability responsibly after fix is deployed

### Contact

**Security Issues**: security@yeoldeartoonist.com

**Response Time**: Critical issues within 24 hours, others within 1 week

## Security Best Practices for Development

### Code Review Checklist

Before merging any PR:

- [ ] No hardcoded secrets or API keys
- [ ] All user inputs validated with Zod
- [ ] Database queries use parameterized methods
- [ ] Sensitive operations require authentication
- [ ] Error messages don't leak sensitive information
- [ ] New environment variables documented in `.env.example`
- [ ] Security headers configured for new routes
- [ ] File uploads validated for type and size
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] CORS policy appropriate for endpoint

### Secure Coding Guidelines

1. **Never Trust User Input**
    - Validate all inputs with Zod schemas
    - Sanitize data before rendering
    - Use parameterized queries for database access

2. **Principle of Least Privilege**
    - Use anon key for public operations
    - Use service role key only when necessary
    - Implement RLS policies for all tables

3. **Defense in Depth**
    - Multiple layers of security
    - Validate on client AND server
    - Don't rely on client-side validation alone

4. **Secure by Default**
    - Default to deny access
    - Explicit allow lists vs. deny lists
    - Fail securely (redirect to login, not error page)

5. **Keep Dependencies Updated**
    - Run `npm audit` regularly
    - Review Dependabot alerts
    - Test updates before deploying

## Compliance & Standards

- **OWASP Top 10 (2021)**: All vulnerabilities addressed
- **PCI DSS**: Stripe handles all payment processing (Level 1 PCI DSS compliant)
- **GDPR**: Customer data handled securely, deletion capabilities in place
- **WCAG 2.1 AA**: Accessibility standards met (see ACCESSIBILITY.md)

## Regular Security Audits

**Schedule**:

- Dependency audit: Weekly (automated via Dependabot)
- Manual security review: Before each major release
- Penetration testing: Annually or after major features
- Security policy review: Quarterly

**Audit Tasks**:

1. Review and update dependencies
2. Check for new OWASP vulnerabilities
3. Review authentication and authorization logic
4. Test input validation on new features
5. Review CSP and security headers
6. Verify RLS policies are effective
7. Check error handling and logging
8. Review environment variable usage

## Future Security Enhancements

Planned for future phases:

1. **Advanced Rate Limiting** (Phase 6)
    - Custom rate limiting per endpoint
    - Bot detection and blocking
    - IP-based throttling

2. **Security Monitoring** (Phase 6)
    - Sentry for error tracking
    - Security event logging
    - Anomaly detection

3. **Two-Factor Authentication** (Phase 6)
    - TOTP for admin accounts
    - Backup codes
    - Device management

4. **API Key Management** (Phase 6)
    - Rotate keys automatically
    - Key expiration policies
    - Audit trail for key usage

## References

### OWASP Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/

### Next.js Security

- Next.js Security: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- Next.js Authentication: https://nextjs.org/docs/app/building-your-application/authentication

### Third-Party Security

- Stripe Security: https://stripe.com/docs/security
- Supabase Security: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Auth: https://supabase.com/docs/guides/auth

### Tools

- npm audit: Built into npm
- OWASP ZAP: https://www.zaproxy.org/
- Burp Suite: https://portswigger.net/burp/communitydownload

---

**Last Updated**: January 2, 2026

For questions or security concerns, contact: security@yeoldeartoonist.com
