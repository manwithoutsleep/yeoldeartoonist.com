# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Ye Olde Artoonist application.

## Table of Contents

- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Image Issues](#image-issues)
- [Payment Issues](#payment-issues)
- [Email Issues](#email-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Debugging Tips](#debugging-tips)

## Database Issues

### "Database connection failed"

**Symptoms**: Application cannot connect to Supabase

**Solutions**:

1. **Check Supabase credentials**:
    - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
    - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
    - Check for typos or extra spaces

2. **Check Supabase project status**:
    - Log into Supabase dashboard
    - Ensure project is not paused (free tier projects pause after 1 week inactivity)
    - Restart project if needed

3. **Check network**:
    - Test internet connection
    - Try accessing Supabase dashboard
    - Check if firewall is blocking Supabase

4. **Environment variables**:

    ```bash
    # Development
    # Check .env.local exists and has correct values

    # Production
    # Check Vercel environment variables
    ```

### "Row Level Security policy violation"

**Symptoms**: Permission denied when querying database

**Solutions**:

1. **Check if using correct client**:
    - Use service role client for admin operations
    - Use anon client for public data

2. **Review RLS policies**:
    - Log into Supabase dashboard → Authentication → Policies
    - Ensure policies exist for the operation
    - Check policy conditions match your use case

3. **Verify user authentication**:
    - Ensure user is logged in for authenticated operations
    - Check auth token is being sent with requests

4. **Test query in SQL Editor**:
    ```sql
    -- Run in Supabase SQL Editor to test RLS
    SELECT * FROM artwork WHERE is_published = true;
    ```

### "Table does not exist"

**Symptoms**: Query fails with "relation does not exist"

**Solutions**:

1. **Run migrations**:

    ```bash
    # Development
    npm run db:reset

    # Production
    npm run db:push
    ```

2. **Check table name**:
    - Tables are lowercase: `artwork`, not `Artwork`
    - Check for typos in table name

3. **Verify schema**:
    - Check Supabase dashboard → Table Editor
    - Ensure all 8 tables exist

## Authentication Issues

### "Admin login not working"

**Symptoms**: Cannot access admin panel

**Solutions**:

1. **Check if user exists in administrators table**:

    ```sql
    SELECT * FROM administrators WHERE email = 'your@email.com';
    ```

2. **Verify auth_id matches**:

    ```sql
    -- Get auth_id from Supabase Auth
    SELECT id FROM auth.users WHERE email = 'your@email.com';

    -- Verify it matches in administrators table
    SELECT auth_id FROM administrators WHERE email = 'your@email.com';
    ```

3. **Check is_active status**:

    ```sql
    UPDATE administrators
    SET is_active = true
    WHERE email = 'your@email.com';
    ```

4. **Clear cookies and try again**:
    - Clear browser cookies for the site
    - Try in incognito mode
    - Request new magic link

### "Middleware redirect loop"

**Symptoms**: Page keeps redirecting, browser shows "too many redirects"

**Solutions**:

1. **Check cookie configuration** (in `src/middleware.ts`):
    - Ensure `secure` is `false` in development
    - Ensure `sameSite` is set correctly

2. **Clear admin session cookie**:
    - Open browser DevTools → Application → Cookies
    - Delete `admin_session` cookie
    - Try logging in again

3. **Check middleware matcher**:
    - Verify matcher pattern in `src/middleware.ts`
    - Ensure `/admin/login` is excluded

4. **Restart dev server**:
    ```bash
    # Stop server (Ctrl+C)
    # Delete .next cache
    rm -rf .next
    # Start server
    npm run dev
    ```

### "Magic link expired"

**Symptoms**: Email link doesn't log you in

**Solutions**:

- Magic links expire after 1 hour
- Request a new magic link
- Check email spam/junk folder
- Ensure you're using the latest link (not an old one)

## Image Issues

### "Images not loading"

**Symptoms**: Images show broken image icon or don't appear

**Solutions**:

1. **Check Supabase Storage permissions**:
    - Go to Supabase dashboard → Storage → Policies
    - Ensure public read access is enabled for `artwork-images` bucket:
        ```sql
        CREATE POLICY "Public read access"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'artwork-images');
        ```

2. **Verify image exists**:
    - Check Supabase dashboard → Storage → artwork-images
    - Confirm image file is there

3. **Check image URL**:
    - Right-click image → "Open in new tab"
    - Check for 404 or permission errors
    - Verify URL format is correct

4. **Check CORS settings** (if using custom domain):
    - Supabase dashboard → Storage → Configuration
    - Ensure CORS allows your domain

### "Image upload fails"

**Symptoms**: Cannot upload images in admin panel

**Solutions**:

1. **Check file size**:
    - Max size: 10MB
    - Compress large images before uploading

2. **Check file format**:
    - Allowed: JPG, PNG, WebP
    - Not allowed: GIF, TIFF, BMP, etc.

3. **Check storage permissions**:
    - Supabase dashboard → Storage → Policies
    - Ensure authenticated users can upload:
        ```sql
        CREATE POLICY "Authenticated users can upload"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'artwork-images');
        ```

4. **Check storage quota**:
    - Supabase dashboard → Settings → Billing
    - Verify you haven't exceeded storage limit

5. **Browser console errors**:
    - Open DevTools → Console
    - Look for error messages
    - Share with developer if unclear

## Payment Issues

### "Payment failed"

**Symptoms**: Customer payment doesn't go through

**Solutions**:

1. **Check Stripe keys**:
    - Development: Use test keys (`sk_test_...`, `pk_test_...`)
    - Production: Use live keys (`sk_live_...`, `pk_live_...`)
    - Verify keys match the mode (test/live)

2. **Test card numbers** (development only):

    ```
    Success: 4242 4242 4242 4242
    Declined: 4000 0000 0000 0002
    3D Secure: 4000 0025 0000 3155
    ```

3. **Check Stripe dashboard**:
    - Stripe Dashboard → Payments
    - Look for the payment attempt
    - Review error message

4. **Network issues**:
    - Ensure stable internet connection
    - Check if Stripe is experiencing outages: https://status.stripe.com

### "Emails not sending"

**Symptoms**: Customers don't receive order confirmation emails

**Solutions**:

1. **Check Resend API key**:
    - Verify `RESEND_API_KEY` is set
    - Test in Resend dashboard

2. **Check domain verification**:
    - Resend dashboard → Domains
    - Ensure `yeoldeartoonist.com` is verified
    - Check DNS records are correct

3. **Check FROM address**:
    - `EMAIL_FROM_ADDRESS` must be from verified domain
    - Development: use `onboarding@resend.dev`
    - Production: use `orders@yeoldeartoonist.com`

4. **Check email in spam**:
    - Customer email may be in spam folder
    - Verify domain authentication (SPF, DKIM) is set up

5. **Check Resend logs**:
    - Resend dashboard → Logs
    - Look for send attempts and errors

6. **Test email sending**:
    ```bash
    # Send test email via admin panel or API
    # Check logs for errors
    ```

### "Webhook not working"

**Symptoms**: Orders not created after successful payment

**Solutions**:

1. **Check webhook secret**:
    - Verify `STRIPE_WEBHOOK_SECRET` is set
    - Ensure it matches Stripe dashboard

2. **Check webhook URL**:
    - Should be: `https://yourdomain.com/api/checkout/webhook`
    - Must be HTTPS in production
    - Verify in Stripe dashboard → Developers → Webhooks

3. **Test webhook locally**:

    ```bash
    # Install Stripe CLI
    stripe login

    # Forward webhooks to local server
    stripe listen --forward-to localhost:3000/api/checkout/webhook

    # Trigger test webhook
    stripe trigger payment_intent.succeeded
    ```

4. **Check Stripe webhook logs**:
    - Stripe Dashboard → Developers → Webhooks → Your endpoint
    - Click on webhook attempts
    - Review error messages

5. **Check Vercel logs**:
    ```bash
    vercel logs --follow
    ```
    Look for webhook processing errors

## Deployment Issues

### "Build fails in Vercel"

**Symptoms**: Deployment fails during build

**Solutions**:

1. **Check build locally**:

    ```bash
    npm run build:full
    ```

    Fix any errors that appear

2. **TypeScript errors**:

    ```bash
    npx tsc --noEmit
    ```

    Fix all type errors

3. **Linting errors**:

    ```bash
    npm run lint
    ```

    Fix all ESLint warnings/errors

4. **Missing dependencies**:

    ```bash
    npm install
    ```

    Ensure package.json is committed

5. **Environment variables**:
    - Check all required variables are set in Vercel
    - Verify variable names are correct

6. **Node version**:
    - Ensure Node 18+ is specified in package.json:
        ```json
        "engines": {
          "node": ">=18.0.0"
        }
        ```

### "Environment variables not working in production"

**Symptoms**: App works locally but not in Vercel

**Solutions**:

1. **Set variables in Vercel**:
    - Vercel dashboard → Settings → Environment Variables
    - Set for "Production" environment
    - Redeploy after adding variables

2. **Check variable names**:
    - Must match exactly (case-sensitive)
    - Client variables must start with `NEXT_PUBLIC_`

3. **Trigger redeployment**:
    ```bash
    vercel --prod
    ```

### "Site is slow after deployment"

**Symptoms**: Production site loads slowly

**Solutions**:

1. **Check Vercel analytics**:
    - Vercel dashboard → Analytics
    - Review performance metrics

2. **Optimize images**:
    - Use Next.js Image component (already implemented)
    - Compress images before uploading
    - Use WebP format when possible

3. **Check database queries**:
    - Review Supabase logs
    - Optimize slow queries
    - Add indexes if needed

4. **Enable caching**:
    - Already configured in Next.js
    - Verify cache headers are set

5. **Check Supabase region**:
    - Ensure Supabase project is in same region as Vercel

## Performance Issues

### "Page loads slowly"

**Symptoms**: Pages take a long time to load

**Solutions**:

1. **Run Lighthouse audit**:
    - Open Chrome DevTools
    - Go to "Lighthouse" tab
    - Run audit
    - Review suggestions

2. **Check image sizes**:
    - Images should be optimized
    - Use Next.js Image component
    - Serve WebP format

3. **Database query optimization**:
    - Check query performance in Supabase
    - Add indexes for frequently queried columns:
        ```sql
        CREATE INDEX idx_artwork_published ON artwork(is_published);
        CREATE INDEX idx_artwork_display_order ON artwork(display_order);
        ```

4. **Enable Redis caching** (future enhancement)

### "High memory usage"

**Symptoms**: Application crashes or slows down

**Solutions**:

1. **Check Vercel logs** for memory errors

2. **Optimize large queries**:
    - Use pagination
    - Limit result sets
    - Select only needed columns

3. **Review bundle size**:
    ```bash
    ANALYZE=true npm run build
    ```
    Check for large dependencies

## Debugging Tips

### Check Vercel Logs

```bash
# Follow logs in real-time
vercel logs --follow

# Get recent logs
vercel logs
```

Or in dashboard: Vercel → Your Project → Logs

### Check Supabase Logs

1. Supabase dashboard → Logs
2. Select log type:
    - Database (SQL queries)
    - API (REST API calls)
    - Realtime (subscriptions)

### Check Browser Console

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for errors (red messages)
4. Check Network tab for failed requests

### Test API Endpoints

```bash
# Test checkout validation
curl -X POST https://yourdomain.com/api/checkout/validate \
  -H "Content-Type: application/json" \
  -d '{"items": [...]}'

# Check response and errors
```

### Test Database Connection

```bash
# In project directory
npm run db:start
npm run dev

# Visit http://localhost:3000
# Check if database queries work
```

### Clear Next.js Cache

```bash
# Stop dev server
# Delete cache directories
rm -rf .next
rm -rf node_modules/.cache

# Reinstall and restart
npm install
npm run dev
```

### Debugging Steps

When encountering an issue:

1. **Identify the error**:
    - Check console/logs for error messages
    - Note what action triggered it
    - Note when it started happening

2. **Isolate the problem**:
    - Does it happen in development?
    - Does it happen in production?
    - Can you reproduce it consistently?

3. **Check recent changes**:
    - What changed since it last worked?
    - Recent deployments?
    - Environment variable changes?

4. **Test in isolation**:
    - Test individual components
    - Test API endpoints directly
    - Check database queries in SQL editor

5. **Review documentation**:
    - Check this troubleshooting guide
    - Review relevant service docs (Stripe, Supabase, etc.)
    - Search for similar issues online

6. **Document and report**:
    - Write down steps to reproduce
    - Include error messages
    - Include screenshots if helpful
    - Share with developer

## Support Resources

### Documentation

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Resend**: https://resend.com/docs
- **Vercel**: https://vercel.com/docs

### Status Pages

- **Stripe**: https://status.stripe.com
- **Supabase**: https://status.supabase.com
- **Vercel**: https://www.vercel-status.com
- **Resend**: https://resend-status.com

### Community Resources

- **Stack Overflow**: Search for specific error messages
- **GitHub Issues**: Check relevant repository issues
- **Discord/Slack**: Join community channels for each service

## Getting Further Help

If you can't resolve the issue:

1. **Gather information**:
    - Error messages (full text)
    - Steps to reproduce
    - When it started
    - What you've tried
    - Screenshots

2. **Check existing documentation** in `.docs/` folder

3. **Contact developer** with:
    - Problem description
    - Error messages/logs
    - Steps to reproduce
    - Environment (dev/production)

4. **For service-specific issues**:
    - Stripe: Contact Stripe support
    - Supabase: Post in Supabase Discord
    - Vercel: Check Vercel community forum
    - Resend: Contact Resend support
