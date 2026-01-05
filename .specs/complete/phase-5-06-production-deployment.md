# phase-5-06: Production Deployment & Launch

## Parent Specification

This is sub-task 06 of the parent specification: `2025-10-25T17-55-00-mvp-implementation-plan.md` (Phase 5). The coordinator spec `phase-5-00-coordinator.md` tracks completion of all Phase 5 tasks.

## Objective

Deploy the application to production, configure all production services (Supabase, Stripe, Resend, Vercel), set up the custom domain, and perform post-launch monitoring and handoff to the client.

## Dependencies

**Prerequisites** (must be completed before this task):

- phase-5-01-email-integration.md (email functionality must work)
- phase-5-02-performance-optimization.md (performance must be optimized)
- phase-5-03-seo-optimization.md (SEO must be complete)
- phase-5-04-accessibility-security-audit.md (audits must pass)
- phase-5-05-error-handling-documentation.md (documentation must be complete)

**Blocks** (tasks that depend on this one):

- None - This is the final task

**Parallel Opportunities**:

- None - All prerequisites must be completed first

## Scope

Complete production deployment including service configuration, domain setup, final testing, monitoring, and client handoff.

### In Scope

- Production Supabase project setup
- Production Stripe account configuration
- Production Resend configuration
- Vercel production environment configuration
- Custom domain DNS setup with Porkbun
- SSL certificate configuration
- Final production testing
- Monitoring setup (Vercel Analytics)
- Admin user creation for client
- Client handoff documentation
- Post-launch monitoring
- Bug fixing and optimization

### Out of Scope

- Ongoing maintenance and support (separate agreement)
- Feature enhancements beyond MVP
- Marketing and SEO campaigns
- Analytics implementation (Google Analytics, Google Tag Manager)
- A/B testing setup
- Multi-region deployment
- Advanced monitoring (Sentry, Datadog)

## Implementation Requirements

### 5.10 Pre-Launch Checklist

Verify all systems are ready for production:

**Functionality**:

- [x] All pages fully functional (Home, Gallery, Shoppe, In The Works, Contact)
- [x] Responsive design tested on mobile, tablet, desktop
- [x] Payment flow tested end-to-end with Stripe test cards
- [x] Images optimized and loading fast
- [x] Admin dashboard working with all features
- [x] Emails sending correctly (Resend test mode)
- [x] Cart and checkout flow complete
- [x] Order creation and management working

**Performance**:

- [x] Database queries performing well
- [x] Lighthouse score >90 on all pages
- [x] ISR configured on all public pages
- [x] CDN caching configured
- [x] Images optimized with Next.js Image component

**Quality**:

- [x] Error handling working (error boundaries, custom 404/500)
- [x] All tests passing
- [x] No console errors in production build
- [x] TypeScript compilation successful
- [x] ESLint warnings resolved

**Security**:

- [x] Security review passed
- [x] RLS policies tested
- [x] Admin authentication working
- [x] Environment variables secured

**Accessibility**:

- [x] Accessibility audit passed
- [x] Keyboard navigation working
- [x] Screen reader compatible
- [x] Color contrast meets WCAG AA

### 5.11 Production Deployment

#### 5.11.1 Set Up Production Supabase Project

1. **Create production Supabase project**:
    - Go to https://supabase.com/dashboard
    - Create new project: "yeoldeartoonist-prod"
    - Choose region closest to target audience (e.g., US East)
    - Note down project URL and keys

2. **Apply database migrations**:
    - Run migration script: `npm run db:push` (if configured)
    - Or manually apply migration from `.sql` file in Supabase SQL Editor
    - Verify all tables created correctly
    - Verify RLS policies enabled

3. **Create storage buckets**:
    - Create `artwork`, `events`, `projects` buckets (public)
    - Configure storage policies for public read access
    - Test image upload from admin panel

4. **Set up Supabase Auth**:
    - Configure auth settings in Supabase dashboard
    - Set site URL to production domain
    - Configure redirect URLs for auth flows
    - Disable email confirmations for admin users (optional)

#### 5.11.2 Set Up Production Stripe Account

1. **Activate Stripe account**:
    - Go to https://dashboard.stripe.com
    - Complete business information
    - Activate account (may require business verification)
    - Note: Can use test mode initially and activate later

2. **Configure Stripe settings**:
    - Set business name and support email
    - Configure payment methods (cards, Apple Pay, Google Pay, Link)
    - Enable Stripe Tax (for automatic tax calculation)
    - Set default currency (USD)

3. **Get production API keys**:
    - Navigate to Developers > API Keys
    - Copy Publishable key (`pk_live_...`)
    - Copy Secret key (`sk_live_...`)
    - Store securely (will add to Vercel later)

4. **Set up webhook endpoint**:
    - Go to Developers > Webhooks
    - Add endpoint: `https://yeoldeartoonist.com/api/checkout/webhook`
    - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
    - Copy webhook signing secret (`whsec_...`)

5. **Configure Stripe Tax** (if enabled):
    - Verify Stripe Tax is enabled in settings
    - Configure tax settings for your jurisdiction
    - Test tax calculation with sample cart

#### 5.11.3 Set Up Production Resend Configuration

1. **Verify domain in Resend**:
    - Go to https://resend.com/domains
    - Add domain: `yeoldeartoonist.com`
    - Add DNS records to Porkbun:
        - SPF record
        - DKIM record
        - DMARC record (optional)
    - Verify domain (may take 24-48 hours)

2. **Get production API key**:
    - Navigate to API Keys in Resend dashboard
    - Create new API key for production
    - Copy key (starts with `re_`)

3. **Configure from address**:
    - Use verified domain: `orders@yeoldeartoonist.com`
    - Set reply-to address if different
    - Test email sending after domain verification

#### 5.11.4 Configure Vercel Environment for Production

1. **Set environment variables in Vercel**:
    - Go to Vercel dashboard > Project > Settings > Environment Variables
    - Add production environment variables:

    ```
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
    SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>

    # Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
    STRIPE_SECRET_KEY=sk_live_xxx
    STRIPE_WEBHOOK_SECRET=whsec_xxx

    # Resend
    RESEND_API_KEY=re_xxx
    EMAIL_FROM_ADDRESS=orders@yeoldeartoonist.com

    # Site
    NEXT_PUBLIC_SITE_URL=https://yeoldeartoonist.com
    NEXT_PUBLIC_SITE_NAME=Ye Olde Artoonist
    ```

2. **Set environment scope**:
    - Set all variables to "Production" environment
    - Optionally set to "Preview" for testing
    - Do NOT set production keys in "Development"

3. **Trigger deployment**:
    - Push to `main` branch to trigger production deployment
    - Or manually deploy from Vercel dashboard
    - Monitor build logs for errors

#### 5.11.5 Update DNS at Porkbun to Point to Vercel

1. **Add domain in Vercel**:
    - Go to Vercel dashboard > Project > Settings > Domains
    - Add domain: `yeoldeartoonist.com`
    - Add www subdomain: `www.yeoldeartoonist.com`
    - Note the DNS records provided by Vercel

2. **Configure DNS at Porkbun**:
    - Log in to Porkbun account
    - Go to DNS settings for `yeoldeartoonist.com`
    - Add Vercel DNS records:
        - A record: `@` → `76.76.21.21` (Vercel IP)
        - CNAME record: `www` → `cname.vercel-dns.com`
    - Add Resend DNS records (from step 5.11.3):
        - TXT record for SPF
        - TXT record for DKIM
        - TXT record for DMARC (optional)

3. **Wait for DNS propagation**:
    - DNS changes can take 24-48 hours to propagate
    - Check DNS propagation: https://www.whatsmydns.net/
    - Test domain resolution: `nslookup yeoldeartoonist.com`

#### 5.11.6 Configure Custom Domain SSL

1. **Verify SSL certificate**:
    - Vercel automatically provisions SSL certificate via Let's Encrypt
    - Verify certificate in Vercel dashboard (should show "Active")
    - Test HTTPS: https://yeoldeartoonist.com

2. **Force HTTPS redirect**:
    - Vercel automatically redirects HTTP to HTTPS
    - Verify redirect: http://yeoldeartoonist.com → https://yeoldeartoonist.com

3. **Test SSL configuration**:
    - Use SSL Labs: https://www.ssllabs.com/ssltest/
    - Target grade: A or A+

#### 5.11.7 Run Final Tests on Production

1. **Functionality testing**:
    - Navigate all pages
    - Test image loading
    - Test cart functionality
    - Complete test purchase with Stripe live mode (if activated) or test card
    - Verify order created in database
    - Verify email sent (if Resend domain verified)
    - Test admin login and dashboard

2. **Performance testing**:
    - Run Lighthouse audit on production domain
    - Verify all scores >90
    - Test page load times

3. **Cross-browser testing**:
    - Test on Chrome, Firefox, Safari, Edge
    - Test on mobile browsers (iOS Safari, Chrome Android)

4. **Edge case testing**:
    - Test with empty cart
    - Test with large cart
    - Test payment failures
    - Test invalid form inputs
    - Test 404 pages

#### 5.11.8 Set Up Monitoring (Vercel Analytics)

1. **Enable Vercel Analytics**:
    - Go to Vercel dashboard > Project > Analytics
    - Enable Web Analytics (included in Pro plan, or paid add-on)

2. **Configure alerts** (optional):
    - Set up error rate alerts
    - Set up performance degradation alerts
    - Set up deployment failure notifications

3. **Monitor key metrics**:
    - Page views
    - Unique visitors
    - Core Web Vitals (LCP, FID, CLS)
    - Error rates

#### 5.11.9 Create Admin User Accounts for Client

1. **Create admin user in Supabase Auth**:
    - Go to Supabase dashboard > Authentication > Users
    - Add new user with client's email
    - Send magic link or set temporary password

2. **Add to administrators table**:
    - Go to Supabase dashboard > Table Editor > administrators
    - Insert row with:
        - `auth_id`: User ID from Supabase Auth
        - `email`: Client's email
        - `name`: Client's name (e.g., "Joe Artist")
        - `role`: `super_admin` (for full access)
        - `is_active`: `true`

3. **Test admin login**:
    - Have client log in to `/admin`
    - Verify access to all admin features
    - Walk through admin panel features

#### 5.11.10 Write Handoff Documentation

Create `.docs/HANDOFF.md`:

**Contents**:

- Project summary and goals
- Tech stack overview
- Production environment details (URLs, services)
- How to access admin panel
- How to manage content (artwork, projects, events)
- How to view and manage orders
- How to access service dashboards (Supabase, Stripe, Resend, Vercel)
- Important security notes
- Troubleshooting common issues
- Support and maintenance contact info

**Deliverables**:

- Admin credentials
- Service dashboard access
- Documentation files
- Source code repository access
- Domain registrar access (Porkbun)

### 5.12 Post-Launch

#### 5.12.1 Monitor Error Rates and Performance

First 24 hours:

- Monitor Vercel deployment logs
- Check error rates in Vercel dashboard
- Monitor Stripe webhook delivery
- Check email delivery rates in Resend
- Monitor database performance in Supabase

First week:

- Review Vercel Analytics for traffic patterns
- Check Core Web Vitals metrics
- Monitor conversion rates (cart → checkout → purchase)
- Review error logs for recurring issues

#### 5.12.2 Collect Feedback from Client

- Schedule post-launch review meeting
- Demonstrate admin features
- Gather feedback on usability
- Document feature requests
- Prioritize bug fixes vs. enhancements

#### 5.12.3 Fix Any Bugs Found

- Create GitHub issues for reported bugs
- Prioritize critical bugs (payment, security, data loss)
- Fix high-priority bugs immediately
- Schedule low-priority fixes for next release

#### 5.12.4 Optimize Based on Usage Patterns

- Review most visited pages
- Identify slow queries
- Optimize high-traffic pages
- Add caching where needed
- Improve images based on actual usage

#### 5.12.5 Set Up Regular Backups

**Supabase Backups**:

- Verify automatic backups are enabled (Supabase Pro plan)
- Configure backup retention period
- Document backup restore procedure

**Vercel Deployments**:

- Vercel maintains deployment history automatically
- Document rollback procedure

**Code Repository**:

- Ensure GitHub repository is backed up
- Tag production releases

## Files to Create/Modify

- `.docs/HANDOFF.md` - Client handoff documentation (create new file)
- `.docs/DEPLOYMENT.md` - Production deployment checklist (verify from task 05)
- `.docs/BACKUP_RESTORE.md` - Backup and restore procedures (create new file)
- `README.md` - Update with production deployment notes
- `.env.production.example` - Example production environment variables (create new file)

## Testing Requirements

### Pre-Production Testing

1. Run full test suite: `npm test`
2. Run production build: `npm run build:full`
3. Test production build locally: `npm run start`
4. Run Lighthouse audit on all pages
5. Test payment flow with Stripe test cards
6. Test admin panel functionality

### Production Testing

1. Test all pages on production domain
2. Complete end-to-end purchase with Stripe (live mode or test mode)
3. Verify email delivery
4. Test admin login and features
5. Cross-browser testing (Chrome, Firefox, Safari, Edge)
6. Mobile device testing (iOS, Android)

### Post-Launch Monitoring

1. Monitor error rates in Vercel dashboard (first 24 hours)
2. Check Stripe webhook delivery
3. Verify email delivery rates
4. Monitor database performance
5. Review Core Web Vitals metrics

## Success Criteria

**Pre-Launch**:

- [ ] All pre-launch checklist items completed (depends on tasks 01-05)
- [ ] All tests passing
- [ ] Production build successful
- [ ] Security audit passed (task 04 incomplete)

**Production Setup**:

- [ ] Production Supabase project configured
- [ ] Production Stripe account activated (or test mode configured)
- [ ] Production Resend domain verified
- [ ] Vercel environment variables set
- [ ] Custom domain DNS configured
- [ ] SSL certificate active (HTTPS working)

**Testing**:

- [ ] Final tests on production passed
- [ ] Payment flow working end-to-end
- [ ] Emails sending correctly
- [ ] Admin panel accessible and functional
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness verified

**Launch**:

- [ ] Monitoring setup (Vercel Analytics)
- [ ] Admin user created for client
- [ ] Handoff documentation complete (no .docs/HANDOFF.md)
- [ ] Client trained on admin panel
- [ ] Production domain live and accessible

**Post-Launch**:

- [ ] Error rates monitored (first 24 hours)
- [ ] Client feedback collected
- [ ] Critical bugs fixed (if any)
- [ ] Performance optimized based on usage
- [ ] Backup procedures documented (no .docs/BACKUP_RESTORE.md)

**General**:

- [ ] All tests pass
- [ ] The verify-code skill has been successfully executed

## Notes

### Production Readiness Checklist

Before launching to production, verify:

- All environment variables set correctly
- Database migrations applied
- RLS policies enabled
- Admin users created
- Email domain verified
- Payment gateway tested
- SSL certificate active
- DNS configured correctly
- Monitoring enabled
- Documentation complete

### Common Deployment Issues

**DNS Not Resolving**:

- Check DNS records in Porkbun
- Wait for DNS propagation (24-48 hours)
- Use `nslookup` to test

**SSL Certificate Not Provisioning**:

- Verify DNS is pointing to Vercel
- Check domain configuration in Vercel
- Wait for automatic provisioning (can take up to 24 hours)

**Environment Variables Not Working**:

- Verify variables set in correct environment (Production)
- Check variable names match code
- Redeploy after adding variables

**Webhook Not Receiving Events**:

- Verify webhook URL is correct in Stripe dashboard
- Check webhook signing secret
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/checkout/webhook`

**Emails Not Sending**:

- Verify Resend domain is verified
- Check API key is correct
- Check from address matches verified domain
- Review Resend logs for failures

### Vercel Deployment Best Practices

- Use production branch (`main`) for production deployments
- Use preview deployments for testing
- Tag releases in Git for easy rollback
- Monitor deployment logs for errors
- Use deployment protection (optional) to require approval

### Stripe Live Mode Activation

Stripe live mode requires:

- Business information completed
- Identity verification (may require documents)
- Bank account connected for payouts
- Terms of service accepted

**Timeline**: Can take 1-7 days for verification

**Workaround for MVP**: Can launch with Stripe test mode initially, activate live mode later

### Post-Launch Support

Define support expectations:

- **Critical bugs**: Fixed within 24 hours
- **High-priority bugs**: Fixed within 1 week
- **Low-priority bugs**: Fixed in next release
- **Feature requests**: Scheduled for future phases

### Monitoring and Alerts

Set up alerts for:

- Deployment failures
- Error rate spikes (>5% error rate)
- Performance degradation (LCP >2.5s)
- Webhook failures (>10% failure rate)
- Email delivery failures

### Rollback Procedures

If critical issue found after deployment:

1. Identify problematic deployment
2. Redeploy previous working version in Vercel
3. Verify issue is resolved
4. Investigate and fix issue in development
5. Deploy fix after testing

### Success Metrics

Track these metrics post-launch:

- **Uptime**: Target 99.9%
- **Page load time**: <3 seconds
- **Conversion rate**: Visitors → Purchases
- **Error rate**: <1%
- **Email delivery rate**: >95%

### Ongoing Maintenance

Recommended maintenance schedule:

- **Daily**: Monitor error logs and alerts
- **Weekly**: Review analytics and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize based on usage patterns
- **Annually**: Major upgrades and feature enhancements
