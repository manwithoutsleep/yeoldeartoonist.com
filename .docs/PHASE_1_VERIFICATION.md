# Phase 1 Verification Checklist

This checklist helps you verify that Phase 1 has been completed successfully.

## Pre-Manual Configuration Verification (Already Complete)

### Project Structure

- [x] Folder structure created in `src/`
- [x] All app files moved to `src/app/`
- [x] Components folder created: `src/components/`
- [x] Lib folder created: `src/lib/`
- [x] Types folder created: `src/types/`
- [x] Hooks folder created: `src/hooks/`
- [x] Context folder created: `src/context/`
- [x] Styles folder created: `src/styles/`
- [x] Database migrations folder created: `src/lib/db/migrations/`

### Dependencies

- [x] @supabase/supabase-js installed
- [x] @supabase/ssr installed
- [x] stripe installed
- [x] @stripe/stripe-js installed
- [x] @stripe/react-stripe-js installed
- [x] zod installed
- [x] sharp installed
- [x] resend installed
- [x] date-fns installed

### Code Files

- [x] `src/lib/supabase/client.ts` - Browser client exists
- [x] `src/lib/supabase/server.ts` - Server client exists
- [x] `src/middleware.ts` - Admin middleware exists
- [x] `src/types/database.ts` - Database types exist
- [x] `src/types/cart.ts` - Cart types exist
- [x] `src/types/order.ts` - Order types exist
- [x] `src/types/index.ts` - Type index exists
- [x] `src/lib/db/migrations/001_initial_schema.sql` - Migration SQL exists

### Configuration

- [x] `tsconfig.json` - Path aliases configured (@/\*)
- [x] `.env.local` - All environment variables present
- [x] `.gitignore` - Updated with supabase and IDE directories
- [x] Build succeeds: `npm run build`
- [x] No TypeScript errors

### Documentation

- [x] `SETUP.md` - Setup instructions created
- [x] `PHASE_1_SUMMARY.md` - Summary documentation created
- [x] This file - Verification checklist created

---

## Manual Configuration Steps (You Must Complete These)

### Step 1: Database Migration Application

Follow the instructions in `SETUP.md` - Step 1

- [ ] Opened Supabase dashboard
- [ ] Navigated to SQL Editor
- [ ] Copied entire migration file: `src/lib/db/migrations/001_initial_schema.sql`
- [ ] Pasted SQL into editor
- [ ] Ran the migration (clicked play button)
- [ ] Migration completed without errors
- [ ] Migration created all tables

**Verification**: In Supabase Dashboard → Table Editor, you should see:

- [ ] administrators
- [ ] artwork
- [ ] events
- [ ] order_items
- [ ] orders
- [ ] page_artwork
- [ ] pages
- [ ] projects

### Step 2: Enable RLS on All Tables

Follow the instructions in `SETUP.md` - Step 2

For each table (administrators, artwork, events, order_items, orders, page_artwork, pages, projects):

- [ ] Opened table in Supabase
- [ ] Clicked "Policies" tab
- [ ] Verified RLS is enabled
- [ ] Verified policies exist (created by migration)

**Count**: Should have 8 tables with RLS enabled ✓

### Step 3: Create Storage Buckets

Follow the instructions in `SETUP.md` - Step 3

**Bucket 1: artwork**

- [ ] Created bucket named "artwork"
- [ ] Set to public
- [ ] Created "Public read access" policy
- [ ] Can be accessed at: `https://oiqcholpmcuxxozgbwpo.supabase.co/storage/v1/object/public/artwork/`

**Bucket 2: events**

- [ ] Created bucket named "events"
- [ ] Set to public
- [ ] Created "Public read access" policy
- [ ] Can be accessed at: `https://oiqcholpmcuxxozgbwpo.supabase.co/storage/v1/object/public/events/`

**Bucket 3: projects**

- [ ] Created bucket named "projects"
- [ ] Set to public
- [ ] Created "Public read access" policy
- [ ] Can be accessed at: `https://oiqcholpmcuxxozgbwpo.supabase.co/storage/v1/object/public/projects/`

**Verification**: In Supabase Dashboard → Storage, you should see 3 buckets:

- [ ] artwork (public)
- [ ] events (public)
- [ ] projects (public)

### Step 4: Create First Admin User

Follow the instructions in `SETUP.md` - Step 4

**Part A: Create Auth User**

- [ ] Opened Supabase → Authentication → Users
- [ ] Created new user with:
    - [ ] Email address
    - [ ] Password
    - [ ] Noted the user UUID

**Part B: Create Administrator Record**

- [ ] Opened Supabase → SQL Editor
- [ ] Ran INSERT query with user UUID:
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
- [ ] Query ran successfully
- [ ] Verified record appears in Table Editor

**Verification**: In Supabase → Table Editor → administrators table:

- [ ] One record exists
- [ ] auth_id matches Supabase Auth user UUID
- [ ] role = 'super_admin'
- [ ] is_active = true

---

## Local Development Verification

### Build Verification

```bash
npm run build
```

- [ ] Command completes without errors
- [ ] "Compiled successfully" message appears
- [ ] No TypeScript errors
- [ ] Build artifacts in `.next/`

### Development Server Verification

```bash
npm run dev
```

- [ ] Server starts on `http://localhost:3000`
- [ ] No console errors
- [ ] Home page loads without errors

### Admin Login Verification

1. Navigate to `http://localhost:3000/admin/login`
2. Attempt to log in with:
    - Email: (the email you created in Step 4)
    - Password: (the password you set in Step 4)

- [ ] Login form displays correctly
- [ ] Can enter email and password
- [ ] Redirects to admin dashboard after successful login
- [ ] Dashboard is accessible at `/admin`
- [ ] Can log out

### Database Connectivity Verification

The app should connect to Supabase automatically. Verify by:

- [ ] No errors about missing Supabase keys in console
- [ ] Middleware doesn't throw errors

---

## Final Verification Checklist

Before proceeding to Phase 2, confirm ALL of these are complete:

### Infrastructure

- [ ] All 8 database tables created in Supabase
- [ ] RLS enabled on all tables
- [ ] 3 storage buckets created (artwork, events, projects)
- [ ] Storage bucket policies created
- [ ] First admin user created in Auth
- [ ] Administrator record created in database

### Code

- [ ] Project builds without errors: `npm run build`
- [ ] Project runs locally: `npm run dev`
- [ ] No TypeScript errors in IDE
- [ ] `.env.local` file present with credentials

### Access Control

- [ ] Admin middleware protects `/admin` routes
- [ ] Can log in to `/admin` with admin credentials
- [ ] Cannot access `/admin` without login
- [ ] Unauthenticated users redirected to `/admin/login`

### Documentation

- [ ] SETUP.md reviewed and understood
- [ ] PHASE_1_SUMMARY.md reviewed
- [ ] This checklist completed

---

## Common Issues & Troubleshooting

### Build Fails with TypeScript Errors

- Run: `npm install` to ensure all dependencies installed
- Delete `.next/` folder and rebuild
- Check `tsconfig.json` has path aliases correctly configured

### Can't Access Supabase Tables

- Verify credentials in `.env.local` are correct
- Check Supabase project is active and accessible
- Verify tables were created (appeared after running migration)

### Admin Login Not Working

- Verify admin user exists in Supabase Auth → Users
- Verify administrator record exists in administrators table
- Verify `is_active = true` in database
- Check that `auth_id` matches the Auth user UUID

### Storage Buckets Not Accessible

- Verify buckets are set to **public** (not private)
- Verify policies are created on each bucket
- Verify bucket names are exact: `artwork`, `events`, `projects`

### RLS Policies Blocking Access

- Verify RLS is **enabled** on tables
- Verify policies were created from migration
- Check that admin authentication is working

---

## Ready for Phase 2?

Once you've checked all items in the "Final Verification Checklist" section above, you're ready to proceed to **Phase 2: Public Pages**.

Phase 2 focuses on:

- Building public-facing pages (home, gallery, shop, contact)
- Creating reusable UI components
- Implementing responsive design
- Setting up image optimization

---

**Questions?** See `SETUP.md` for detailed setup instructions with troubleshooting.

**Next Steps?** See `PHASE_1_SUMMARY.md` for what's been completed and what comes next.

---

_Phase 1: Foundation (Week 1-2) - Verification Guide_
