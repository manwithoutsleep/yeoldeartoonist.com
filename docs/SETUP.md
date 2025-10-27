# Phase 1 Setup Instructions

This document outlines the manual steps required to complete Phase 1 setup. The code infrastructure is ready, but you need to initialize the Supabase database, create storage buckets, and perform final verification.

## Prerequisites Checklist

Verify you have all of these before proceeding:

- [x] Node.js 18+ installed
- [x] GitHub account with git configured
- [x] Supabase account created and project initialized
- [x] Stripe account created (test mode)
- [x] Resend account created
- [x] Vercel account created and GitHub repo connected
- [x] Project running locally: `npm run dev`

## Step 1: Run Database Migrations Using CLI ✅ COMPLETE

Your database schema is defined in migration files under `supabase/migrations/`.

We'll use the Supabase CLI to apply migrations. This is the recommended approach because:

- ✅ Test migrations locally before applying to production
- ✅ Keep all database changes in version control
- ✅ Enable team collaboration with Git
- ✅ Easy to rollback if needed

### Step 1A: Test Locally (Recommended First) ✅ COMPLETE

```bash
# Start local Supabase with migrations applied
npm run db:start
```

This will:

1. Start a local PostgreSQL database
2. Apply all migrations from `supabase/migrations/`
3. Start Supabase API on http://127.0.0.1:54331
4. Start Supabase Studio on http://127.0.0.1:54333

**Verify it worked**:

- Navigate to http://127.0.0.1:54333 (Supabase Studio)
- Check that all 8 tables exist in the Table Editor
- Check that all RLS policies are listed

**Stop when done**:

```bash
npm run db:stop
```

### Step 1B: Push to Production ✅ COMPLETE

Once you've verified locally, push to your remote Supabase project:

```bash
# Link to your remote Supabase project (first time only)
npx supabase link

# Push all local migrations to production
npm run db:push
```

This will:

1. Connect to your remote Supabase project
2. Apply any migrations not yet applied
3. Sync remote schema with local

**Expected output**:

```
Migrations applied: 1
✓ All migrations applied successfully
```

You should now see all tables in your remote Supabase dashboard at https://app.supabase.com/

### Migration Files

All migrations are stored in `supabase/migrations/` and follow the naming convention:

- `20251026000000_initial_schema.sql` - Creates all 8 tables, indexes, functions, triggers, and RLS policies

For detailed information on managing migrations, see **[MIGRATIONS_GUIDE.md](./MIGRATIONS_GUIDE.md)**.

## Step 2: Verify RLS Policies ✅ COMPLETE

The migration automatically creates RLS policies and enables them on all tables.

**Nothing to do here!** The migration handles everything. But let's verify it worked:

1. Go to Supabase Dashboard (https://app.supabase.com/)
2. Navigate to **SQL Editor**
3. Run this query to verify RLS is enabled:
    ```sql
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
    ```

You should see `rowsecurity = true` for all 8 tables:

- administrators ✅
- artwork ✅
- events ✅
- order_items ✅
- orders ✅
- page_artwork ✅
- pages ✅
- projects ✅

All policies were created by the migration and are automatically active.

## Step 3: Create Storage Buckets

You need to create three public storage buckets for images. Unlike database tables, storage buckets are created manually through the dashboard (not via migrations).

### Creating Buckets ✅ COMPLETE

1. Go to Supabase Dashboard → **Storage**
2. Click **Create a new bucket**
3. Create three buckets:

### Bucket 1: artwork

- **Name**: `artwork`
- **Public access**: Yes (make it public)
- **Description**: "Store artwork/product images"

### Bucket 2: events

- **Name**: `events`
- **Public access**: Yes (make it public)
- **Description**: "Store event images"

### Bucket 3: projects

- **Name**: `projects`
- **Public access**: Yes (make it public)
- **Description**: "Store project images"

After creating each bucket: ✅ COMPLETE

1. Click on the bucket
2. Click **Policies** tab
3. Create a new policy:
    - **Name**: `Public read access`
    - **Allowed operations**: Select → true (to allow public reads)
    - **Target**: `(storage.role() = 'authenticated' OR storage.role() = 'anon')`
    - Click **Review** and **Create**

This allows:

- Anyone to read (GET) images from these buckets
- Only authenticated admins can upload (INSERT) or delete (DELETE)

## Step 4: Create First Admin User ✅ COMPLETE

You need to create an admin user to access the admin panel.

### In Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Click **Create a new user**
3. Enter an email address (e.g., your email)
4. Set a password (you'll use this to log in to `/admin`)
5. Click **Create user**
6. Note the user's **UUID** (you'll need this in the next step)

### In Supabase Dashboard SQL Editor:

1. Create a new query
2. Copy this SQL (replace `YOUR_USER_UUID` with the UUID from step 5 above):

```sql
INSERT INTO public.administrators (auth_id, name, email, role, is_active)
VALUES (
  'YOUR_USER_UUID',
  'Your Name',
  'your-email@example.com',
  'super_admin',
  true
);
```

3. Click **Run**

This creates an entry in the `administrators` table linking your Supabase Auth user to admin privileges.

## Step 5: Verify Setup

### Test Database Connectivity ✅ COMPLETE

Run these checks:

```bash
# Start the development server
npm run dev
```

Your app should start without errors. If there are TypeScript errors, they're likely import issues - make sure the `src/` folder structure is correct.

### Verify Tables Exist ✅ COMPLETE

In Supabase Dashboard → **Table Editor**, you should see these 8 tables:

1. administrators ✅
2. artwork ✅
3. events ✅
4. order_items ✅
5. orders ✅
6. page_artwork ✅
7. pages ✅
8. projects ✅

### Verify Storage Buckets Exist ✅ COMPLETE

In Supabase Dashboard → **Storage**, you should see these 3 buckets:

1. artwork ✅
2. events ✅
3. projects ✅

### Verify RLS is Enabled ✅ COMPLETE

For each table, go to **Storage** → click table → **Policies** tab. You should see RLS enabled with the policies listed.

## Troubleshooting

### Migration Failed

**Problem**: SQL migration didn't run or has errors

**Solution**:

1. Check if you copied the entire SQL file
2. Verify no text was cut off
3. Try running the migration again
4. Look for error messages at the bottom of the SQL Editor

### Can't find administrators table

**Problem**: The `administrators` table isn't showing up

**Solution**:

1. Refresh the Supabase dashboard
2. Re-run the migration
3. Check the SQL Editor logs for errors

### RLS policies aren't working

**Problem**: Can't access data even with proper auth

**Solution**:

1. Verify RLS is **enabled** on each table
2. Verify policies exist and are correct
3. Check that your admin user is in the `administrators` table with `is_active = true`

### Storage buckets not accessible

**Problem**: Images can't be uploaded or accessed

**Solution**:

1. Verify buckets are set to **Public** access
2. Verify storage policies are created
3. Check that bucket names match exactly: `artwork`, `events`, `projects`

## What's Been Set Up for You

✅ **Project Structure**:

- Moved files to `src/` directory
- Created folders for components, lib, types, hooks, context, styles
- Set up TypeScript path aliases (`@/` for src/\*)

✅ **Dependencies Installed**:

- @supabase/supabase-js & @supabase/ssr
- stripe & @stripe/react-stripe-js
- zod (validation)
- sharp (image processing)
- resend (email)
- date-fns (date utilities)

✅ **Code Files**:

- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/middleware.ts` - Admin route protection
- `src/types/database.ts` - Database types
- `src/types/cart.ts` - Cart types
- `src/types/order.ts` - Order types
- `src/lib/db/migrations/001_initial_schema.sql` - Complete database schema

⏳ **Still Needed** (next steps):

Phase 2 will focus on:

- Creating the public-facing pages (home, gallery, shop, contact, projects/events)
- Building components and styling with Tailwind
- Setting up image optimization
- Implementing page layouts with responsive design

## Environment Variables ✅ COMPLETE

Your `.env.local` already contains all necessary variables for:

- Supabase connection (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.)
- Stripe keys (test mode)
- Resend API key
- Cart session secret

**DO NOT commit `.env.local` to git** - it contains secrets. The `.env.example` shows which variables are needed for new deployments.

## Next Steps ✅ COMPLETE

After completing these manual steps:

1. Run `npm run dev` and verify the app starts
2. Confirm all tables exist in Supabase
3. Test admin login at `http://localhost:3000/admin/login`
4. Create your first admin user (see Step 4 above)
5. Proceed to Phase 2: Building public pages

## Questions?

If you encounter issues:

1. Check the Supabase dashboard for error messages
2. Verify all credentials in `.env.local` are correct
3. Ensure RLS policies were created properly
4. Review this setup document for troubleshooting tips

Good luck! 🚀
