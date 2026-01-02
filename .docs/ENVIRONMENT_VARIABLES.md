# Environment Variables Reference

This document provides detailed information about all environment variables used in the Ye Olde Artoonist application.

## Table of Contents

- [Overview](#overview)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Development vs Production](#development-vs-production)
- [Security Considerations](#security-considerations)
- [Setting Variables in Vercel](#setting-variables-in-vercel)

## Overview

Environment variables are used to configure the application without hardcoding sensitive information or environment-specific settings in the source code.

### Storage Locations

- **Development**: `.env.local` (never commit to git)
- **Production**: Vercel environment variables (dashboard)
- **Example**: `.env.example` (committed to git, no secrets)

## Required Variables

### Application Configuration

#### `NEXT_PUBLIC_URL`

- **Description**: The public URL of your deployed application
- **Example**: `https://yeoldeartoonist.com`
- **Used For**:
    - Stripe redirect URLs
    - Email links
    - Social media metadata
- **Development**: `http://localhost:3000`
- **Production**: Your actual domain

#### `NEXT_PUBLIC_SITE_URL`

- **Description**: Same as NEXT_PUBLIC_URL, used for metadata
- **Example**: `https://yeoldeartoonist.com`
- **Used For**: Open Graph and SEO metadata
- **Note**: Can be the same as NEXT_PUBLIC_URL

### Supabase Configuration

All Supabase variables can be found in: **Supabase Dashboard → Project Settings → API**

#### `NEXT_PUBLIC_SUPABASE_URL`

- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijk.supabase.co`
- **Where to Find**: Supabase Dashboard → Settings → API → Project URL
- **Security**: Public (safe to expose in client-side code)
- **Used For**:
    - Database connections
    - Authentication
    - Storage access

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Description**: Supabase anonymous/public API key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to Find**: Supabase Dashboard → Settings → API → Project API keys → anon/public
- **Security**: Public (safe to expose, has RLS restrictions)
- **Used For**:
    - Client-side database queries
    - Authentication flows
    - Public data access

#### `SUPABASE_SERVICE_ROLE_KEY`

- **Description**: Supabase service role key (admin access)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (different from anon key)
- **Where to Find**: Supabase Dashboard → Settings → API → Project API keys → service_role
- **Security**: ⚠️ **SECRET** - Never expose to client, bypasses RLS
- **Used For**:
    - Server-side admin operations
    - Middleware authentication checks
    - Bypassing row-level security when needed

#### `SUPABASE_JWT_SECRET`

- **Description**: JWT secret for token verification
- **Example**: Long random string
- **Where to Find**: Supabase Dashboard → Settings → API → JWT Settings → JWT Secret
- **Security**: SECRET
- **Used For**: Verifying authentication tokens (optional, usually not needed)

#### `SUPABASE_URL`

- **Description**: Alternative Supabase URL variable
- **Example**: Same as `NEXT_PUBLIC_SUPABASE_URL`
- **Note**: Can be same as NEXT_PUBLIC_SUPABASE_URL or omitted

### Supabase Postgres (Optional)

These are provided by Vercel Postgres integration but not required for the application:

- `POSTGRES_DATABASE` - Database name
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_PRISMA_URL` - Prisma connection URL
- `POSTGRES_URL` - Direct connection URL
- `POSTGRES_URL_NON_POOLING` - Non-pooling connection URL
- `POSTGRES_USER` - Database user

**Note**: These are auto-populated if using Vercel Postgres, but Supabase handles the database connection via the Supabase client.

### Stripe Configuration

All Stripe variables can be found in: **Stripe Dashboard → Developers → API Keys**

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- **Description**: Stripe publishable key for client-side
- **Example**: `pk_test_51Abc123...` (test) or `pk_live_51Abc123...` (production)
- **Where to Find**: Stripe Dashboard → Developers → API Keys → Publishable key
- **Security**: Public (safe to expose)
- **Used For**:
    - Client-side Stripe.js initialization
    - Creating checkout sessions from browser
- **Test Mode**: `pk_test_...`
- **Live Mode**: `pk_live_...`

#### `STRIPE_SECRET_KEY`

- **Description**: Stripe secret key for server-side operations
- **Example**: `sk_test_51Abc123...` (test) or `sk_live_51Abc123...` (production)
- **Where to Find**: Stripe Dashboard → Developers → API Keys → Secret key
- **Security**: ⚠️ **SECRET** - Never expose to client
- **Used For**:
    - Creating payment intents
    - Processing refunds
    - Server-side Stripe API calls
- **Test Mode**: `sk_test_...`
- **Live Mode**: `sk_live_...`

#### `STRIPE_WEBHOOK_SECRET`

- **Description**: Webhook signing secret for verifying Stripe webhooks
- **Example**: `whsec_abc123...`
- **Where to Find**:
    1. Stripe Dashboard → Developers → Webhooks
    2. Create or select webhook endpoint
    3. Copy "Signing secret"
- **Security**: SECRET
- **Used For**: Verifying webhook requests are from Stripe
- **Note**: Different for test mode and live mode

### Resend (Email) Configuration

All Resend variables can be found in: **Resend Dashboard → API Keys**

#### `RESEND_API_KEY`

- **Description**: Resend API key for sending emails
- **Example**: `re_abc123...`
- **Where to Find**: Resend Dashboard → API Keys → Create API Key
- **Security**: ⚠️ **SECRET** - Never expose to client
- **Used For**:
    - Sending order confirmation emails
    - Sending shipping notifications
    - Admin order notifications

#### `EMAIL_FROM_ADDRESS`

- **Description**: Email address to send emails from
- **Example**: `orders@yeoldeartoonist.com`
- **Requirements**:
    - Must be from a verified domain in Resend
    - Should be a professional-looking address
- **Used For**: "From" field in customer emails

#### `EMAIL_FROM_NAME`

- **Description**: Display name for sent emails
- **Example**: `Ye Olde Artoonist`
- **Used For**: Human-readable sender name

#### `ADMIN_EMAIL`

- **Description**: Email address to receive admin notifications
- **Example**: `joe@yeoldeartoonist.com`
- **Used For**:
    - Receiving new order notifications
    - Admin alerts and reports

## Optional Variables

### Cart Configuration

#### `CART_SESSION_SECRET`

- **Description**: Secret key for encrypting cart session data
- **Example**: Random string (generate with: `openssl rand -base64 32`)
- **Security**: SECRET
- **Used For**: Encrypting cart data in cookies
- **Note**: Optional if cart is stored in localStorage only

## Development vs Production

### Development (`.env.local`)

```env
# Local development settings
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (use test project or local Supabase)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# Stripe (ALWAYS use test keys in development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe CLI or test webhook)

# Resend (test mode)
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=onboarding@resend.dev  # Use Resend test email
EMAIL_FROM_NAME=Ye Olde Artoonist (Test)
ADMIN_EMAIL=your-email@example.com
```

### Production (Vercel)

```env
# Production settings
NEXT_PUBLIC_URL=https://yeoldeartoonist.com
NEXT_PUBLIC_SITE_URL=https://yeoldeartoonist.com

# Supabase (production project)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb... (production anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (production service role key)

# Stripe (use live keys for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from live webhook endpoint)

# Resend (verified domain)
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=orders@yeoldeartoonist.com
EMAIL_FROM_NAME=Ye Olde Artoonist
ADMIN_EMAIL=joe@yeoldeartoonist.com
```

## Security Considerations

### Secret Variables

These variables must NEVER be exposed to the client or committed to git:

- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses all security rules
- `STRIPE_SECRET_KEY` - Can create charges and refunds
- `STRIPE_WEBHOOK_SECRET` - Can fake webhook events
- `RESEND_API_KEY` - Can send emails from your domain
- `CART_SESSION_SECRET` - Can decrypt user sessions

### Public Variables

Variables prefixed with `NEXT_PUBLIC_` are safe to expose:

- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (protected by RLS)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (designed to be public)

### Best Practices

1. **Never commit `.env.local`** to git (already in `.gitignore`)
2. **Use different values** for development and production
3. **Rotate secrets regularly** (every 6-12 months)
4. **Use strong random strings** for secrets (min 32 characters)
5. **Limit access** to production environment variables
6. **Use test keys** in development ALWAYS
7. **Document required variables** in `.env.example`

### Generating Secrets

For random secret values:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
-join((65..90)+(97..122)+48..57 | Get-Random -Count 32 | % {[char]$_})

# Or use online tools (ensure HTTPS)
# https://generate-secret.vercel.app/32
```

## Setting Variables in Vercel

### Via Vercel Dashboard

1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. For each variable:
    - Enter the **Key** (variable name)
    - Enter the **Value**
    - Select **Environments** (Production, Preview, Development)
    - Click **Save**

### Via Vercel CLI

```bash
# Set a single variable
vercel env add VARIABLE_NAME

# Pull environment variables to local
vercel env pull .env.local

# List all environment variables
vercel env ls
```

### Environment Scopes

- **Production** - Live site (main branch)
- **Preview** - Preview deployments (PRs, branches)
- **Development** - Local development (optional)

Recommendation: Set all variables for Production and Preview, omit Development (use `.env.local` instead).

### After Adding Variables

Variables are applied to new deployments automatically. To apply to current deployment:

1. Add/update variable in Vercel
2. Trigger redeployment:
    ```bash
    vercel --prod
    ```
    Or push a new commit to trigger auto-deployment

## Troubleshooting

### Variable Not Found

**Error**: `process.env.VARIABLE_NAME is undefined`

**Solutions**:

1. Check variable name spelling (case-sensitive)
2. Verify variable is set in Vercel dashboard (for production)
3. Check `.env.local` exists (for development)
4. Restart dev server after changing `.env.local`
5. For client-side access, ensure variable starts with `NEXT_PUBLIC_`

### Wrong Value in Production

**Problem**: Production uses wrong value

**Solutions**:

1. Check Vercel environment variables
2. Verify "Production" environment is selected
3. Redeploy after changing variables
4. Check for typos in variable names
5. Ensure no spaces around `=` in `.env` files

### Accidentally Exposed Secret

**If you exposed a secret variable**:

1. **Immediately revoke** the key:
    - Supabase: Regenerate service role key
    - Stripe: Roll API keys in dashboard
    - Resend: Delete and create new API key

2. **Update all instances**:
    - Update `.env.local`
    - Update Vercel environment variables
    - Update CI/CD secrets (if any)

3. **Redeploy** application

4. **Review logs** for unauthorized access

### Environment Not Loading

**Problem**: Variables not loading in application

**Solutions**:

1. Ensure `.env.local` is in project root
2. Restart Next.js dev server
3. Check for syntax errors in `.env.local`:
    - No spaces around `=`
    - No quotes needed for values (usually)
    - One variable per line
4. Verify variables are accessed via `process.env.VARIABLE_NAME`
5. Client-side variables must start with `NEXT_PUBLIC_`

## Reference Links

- **Next.js Environment Variables**: https://nextjs.org/docs/basic-features/environment-variables
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Supabase API Keys**: https://supabase.com/docs/guides/api#api-keys
- **Stripe API Keys**: https://stripe.com/docs/keys
- **Resend API Keys**: https://resend.com/docs/api-reference/api-keys
