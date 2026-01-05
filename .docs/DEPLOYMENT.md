# Deployment Guide

This guide covers deploying Ye Olde Artoonist to production using Vercel and Supabase.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment](#vercel-deployment)
- [Database Migration](#database-migration)
- [Environment Variables](#environment-variables)
- [Domain Setup](#domain-setup)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedures](#rollback-procedures)

## Pre-Deployment Checklist

Before deploying to production, ensure the following are complete:

- [ ] All tests pass (`npm test`)
- [ ] TypeScript builds without errors (`npx tsc --noEmit`)
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Code is formatted (`npm run format:check`)
- [ ] Environment variables are documented
- [ ] Database migrations are tested locally
- [ ] Stripe is configured in test mode (initially)
- [ ] Resend email domain is verified
- [ ] Admin users are created in database

## Vercel Deployment

### Initial Setup

1. **Install Vercel CLI** (optional but recommended):

    ```bash
    npm i -g vercel
    ```

2. **Link project to Vercel**:

    ```bash
    vercel link
    ```

    Select or create a new Vercel project.

3. **Configure environment variables** (see [Environment Variables](#environment-variables) section)

4. **Deploy to preview**:

    ```bash
    vercel
    ```

    This creates a preview deployment for testing.

5. **Deploy to production**:

    ```bash
    vercel --prod
    ```

### Automatic Deployments (GitHub Integration)

Vercel automatically deploys when you push to your repository:

- **main branch** → Production deployment
- **Other branches** → Preview deployments

To set this up:

1. Go to Vercel dashboard → Your project → Settings → Git
2. Connect your GitHub repository
3. Configure branch deployment settings

### Build Configuration

Vercel uses the following build settings (configured in `package.json`):

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Build Optimization

The `next.config.ts` includes optimizations:

- **Bundle Analyzer**: Disabled by default (enable with `ANALYZE=true npm run build`)
- **Lazy Loading**: Heavy packages (Stripe, Supabase) are lazy-loaded
- **Image Optimization**: Next.js automatic image optimization
- **Turbopack**: Enabled for faster development builds

## Database Migration

### Production Database Setup

1. **Push migrations to production Supabase**:

    ```bash
    npm run db:push
    ```

    This applies all migrations in `src/lib/db/migrations/` to your production database.

2. **Verify migrations**:
    - Log into Supabase dashboard
    - Navigate to SQL Editor
    - Run: `SELECT * FROM public.artwork LIMIT 1;` (should work without errors)
    - Check all 8 tables exist: `artwork`, `categories`, `orders`, `order_items`, `pages`, `projects`, `events`, `administrators`

3. **Create admin user**:

    After first deployment, create an admin user:

    ```sql
    -- First, sign up via Supabase Auth UI at /admin/login
    -- Then run this SQL in Supabase SQL Editor:

    INSERT INTO administrators (auth_id, name, email, role, is_active)
    VALUES (
      '<auth_user_id>',  -- Get from auth.users table
      'Admin Name',
      'admin@example.com',
      'super_admin',
      true
    );
    ```

### Migration Workflow for Updates

When you need to update the database schema:

1. **Create migration locally**:

    ```bash
    npm run db:create-migration "description_of_change"
    ```

2. **Test migration locally**:

    ```bash
    npm run db:reset  # Reset local database
    npm run db:start  # Migrations run automatically
    ```

3. **Commit migration file**:

    ```bash
    git add src/lib/db/migrations/
    git commit -m "Add migration: description"
    git push
    ```

4. **Push to production**:

    ```bash
    npm run db:push
    ```

## Environment Variables

### Required Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

#### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)

Get these from: Supabase Dashboard → Project Settings → API

#### Stripe

- `STRIPE_SECRET_KEY` - Stripe secret key (start with test key: `sk_test_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (`pk_test_...`)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (get after setting up webhook)

Get these from: Stripe Dashboard → Developers → API Keys

#### Resend (Email)

- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Email address to send from (e.g., `orders@yeoldeartoonist.com`)

Get these from: Resend Dashboard → API Keys

#### Application

- `NEXT_PUBLIC_URL` - Your production URL (e.g., `https://yeoldeartoonist.com`)
- `NEXT_PUBLIC_SITE_URL` - Same as above (used for metadata)

### Setting Environment Variables in Vercel

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add each variable with appropriate scope:
    - **Production** - Live site
    - **Preview** - Preview deployments
    - **Development** - Local development (optional)
3. Click "Save"
4. Redeploy your application for changes to take effect

## Domain Setup

### Porkbun Domain Configuration

1. **Add domain in Vercel**:
    - Go to Vercel dashboard → Your project → Settings → Domains
    - Click "Add Domain"
    - Enter your domain: `yeoldeartoonist.com`

2. **Configure DNS in Porkbun**:

    Vercel will provide DNS records to add:

    ```
    Type: A
    Name: @
    Value: 76.76.21.21

    Type: CNAME
    Name: www
    Value: cname.vercel-dns.com
    ```

3. **Wait for DNS propagation** (can take 24-48 hours, usually faster)

4. **Verify SSL certificate**:

    Vercel automatically provisions SSL certificates. Verify at:
    `https://yeoldeartoonist.com` (should show secure padlock)

### Email Domain Configuration (Resend)

1. **Verify domain in Resend**:
    - Go to Resend dashboard → Domains
    - Add `yeoldeartoonist.com`
    - Add the provided DNS records to Porkbun

2. **DNS Records for Email** (add in Porkbun):

    Resend will provide SPF, DKIM, and DMARC records. Example:

    ```
    Type: TXT
    Name: @
    Value: v=spf1 include:resend.com ~all

    Type: TXT
    Name: resend._domainkey
    Value: [DKIM key from Resend]
    ```

3. **Verify domain** in Resend dashboard

4. **Test email sending**:

    ```bash
    # Use the test order email in admin panel
    ```

## Post-Deployment Verification

After deploying, verify everything works:

### 1. Homepage

- [ ] Visit `https://yeoldeartoonist.com`
- [ ] Check all images load
- [ ] Verify navigation works
- [ ] Check mobile responsiveness

### 2. Gallery & Shop

- [ ] Browse gallery (`/gallery`)
- [ ] View individual artwork pages
- [ ] Check shop listing (`/shoppe`)
- [ ] Verify filtering works

### 3. Shopping Cart & Checkout

- [ ] Add item to cart
- [ ] View cart (`/shoppe/cart`)
- [ ] Proceed to checkout
- [ ] Test Stripe Checkout (use test card: `4242 4242 4242 4242`)
- [ ] Verify order confirmation email

### 4. Admin Panel

- [ ] Log in to admin (`/admin/login`)
- [ ] Create test artwork
- [ ] Upload image to Supabase Storage
- [ ] Publish artwork
- [ ] View orders
- [ ] Update order status

### 5. Error Handling

- [ ] Visit non-existent page (should show 404)
- [ ] Test form validation errors
- [ ] Check error logging in Vercel logs

### 6. Performance

- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Check page load times
- [ ] Verify images are optimized

### 7. SEO

- [ ] Check meta tags (view page source)
- [ ] Verify Open Graph images
- [ ] Test social media previews
- [ ] Submit sitemap to Google Search Console: `https://yeoldeartoonist.com/sitemap.xml`

## Stripe Webhook Setup

After deployment, set up the Stripe webhook:

1. **Get your webhook URL**:

    ```
    https://yeoldeartoonist.com/api/checkout/webhook
    ```

2. **Create webhook in Stripe**:
    - Go to Stripe Dashboard → Developers → Webhooks
    - Click "Add endpoint"
    - Enter webhook URL
    - Select events to listen to:
        - `payment_intent.succeeded`
        - `payment_intent.payment_failed`
        - `checkout.session.completed`

3. **Get webhook signing secret**:

    After creating webhook, Stripe shows the signing secret (`whsec_...`)

4. **Add to Vercel environment variables**:

    ```
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

5. **Redeploy** to apply the new environment variable

6. **Test webhook**:
    - Complete a test order
    - Check Stripe dashboard → Developers → Webhooks → Your endpoint
    - Verify events are being received successfully

## Going Live with Stripe

When ready to accept real payments:

1. **Activate Stripe account**:
    - Complete business information
    - Verify bank account for payouts

2. **Switch to production keys**:

    In Vercel, update environment variables:
    - `STRIPE_SECRET_KEY` → Use `sk_live_...` key
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Use `pk_live_...` key

3. **Update webhook**:

    Create new webhook endpoint in Stripe (for live mode) with same URL

4. **Update `STRIPE_WEBHOOK_SECRET`** with live webhook secret

5. **Redeploy** application

6. **Test with real card** (use your own card, refund immediately)

## Rollback Procedures

If something goes wrong after deployment:

### Rollback Application Code

1. **Via Vercel Dashboard**:
    - Go to Deployments
    - Find previous working deployment
    - Click "..." → "Promote to Production"

2. **Via Git**:

    ```bash
    git revert HEAD
    git push
    ```

    This will trigger automatic redeployment.

### Rollback Database

⚠️ **Database rollbacks are complex**. Prevention is better than cure.

**Before risky migrations**:

1. **Backup database**:

    ```bash
    # In Supabase dashboard
    Settings → Database → Database backups → Create backup
    ```

2. **Test migration locally first**

**If you must rollback**:

1. **Stop application** (set maintenance page or disable routes)
2. **Restore from backup** in Supabase dashboard
3. **Rollback application** to matching version
4. **Verify data integrity**

**Better approach**: Write reversible migrations:

```sql
-- In migration file, include both up and down migrations
-- Document how to reverse if needed
```

## Monitoring & Maintenance

### Vercel Logs

View logs in real-time:

```bash
vercel logs --follow
```

Or in dashboard: Vercel → Your Project → Logs

### Supabase Logs

- **Database logs**: Supabase Dashboard → Logs → Database
- **API logs**: Supabase Dashboard → Logs → API

### Error Tracking (Future)

For production error monitoring, consider integrating:

- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Session replay and error tracking

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## Deployment Checklist

Use this checklist for each deployment:

- [ ] All tests pass locally
- [ ] Environment variables configured in Vercel
- [ ] Database migrations tested locally
- [ ] Database migrations pushed to production
- [ ] Admin user created
- [ ] Domain DNS configured (if first deployment)
- [ ] SSL certificate verified
- [ ] Email domain verified
- [ ] Stripe webhook configured
- [ ] Test order completed successfully
- [ ] Error pages working (404, 500)
- [ ] Performance metrics acceptable
- [ ] SEO meta tags verified
- [ ] Sitemap accessible
- [ ] Admin panel accessible
- [ ] Email notifications working

## Support Resources

- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Resend**: https://resend.com/docs

For project-specific questions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
