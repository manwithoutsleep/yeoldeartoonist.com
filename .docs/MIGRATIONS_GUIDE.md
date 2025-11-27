# Supabase Migrations Guide

This guide explains how to use the Supabase CLI to manage database migrations for yeoldeartoonist.com.

## Overview

The migration workflow allows you to:

1. ✅ Test migrations **locally** first
2. ✅ Apply the same migrations **to production**
3. ✅ Keep all database changes in **version control**
4. ✅ Collaborate with others using **Git**

## File Structure

```
supabase/
├── config.toml                  # Supabase configuration
├── migrations/
│   └── 20251026000000_initial_schema.sql   # Our first migration
├── .branches/                   # Local branch state (git ignored)
├── .temp/                       # Temporary files (git ignored)
└── .gitignore
```

## Quick Commands

### Test Locally

```bash
# Start local Supabase instance with migrations applied
npm run db:start

# This will:
# 1. Start PostgreSQL locally
# 2. Run all migrations from supabase/migrations/
# 3. Start Supabase API on http://127.0.0.1:54331
# 4. Start Supabase Studio on http://127.0.0.1:54333
```

### Push to Remote

```bash
# Push all local migrations to production Supabase
npm run db:push

# This will:
# 1. Connect to your remote Supabase project
# 2. Apply any migrations not yet applied
# 3. Sync remote schema with local
```

### Stop Local Instance

```bash
npm run db:stop
```

### Create New Migration

```bash
npm run db:create-migration -- add_new_feature

# This creates: supabase/migrations/[timestamp]_add_new_feature.sql
# Edit the file to add your SQL changes
# Then run: npm run db:push (to apply locally first)
```

### Reset Local Database

```bash
npm run db:reset

# This will:
# 1. Drop all tables
# 2. Re-run all migrations from scratch
# 3. Useful for testing migrations work from empty database
```

## Workflow: Testing Locally First

### Step 1: Start Local Supabase

```bash
npm run db:start
```

Output should show:

```
✓ Local development server started
  API URL: http://127.0.0.1:54331
  Realtime: ws://127.0.0.1:54333
  Studio: http://127.0.0.1:54333
```

### Step 2: Verify Tables Created

Navigate to Supabase Studio at `http://127.0.0.1:54333` and verify:

- [ ] All 8 tables exist (administrators, artwork, pages, etc.)
- [ ] All indexes created
- [ ] All triggers active
- [ ] RLS policies enabled

### Step 3: Test Your Application

Update your `.env.local` to use the local Supabase:

```bash
# For local testing, use these values:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local_anon_key>  # Get from local Studio
```

Run your Next.js app:

```bash
npm run dev
```

### Step 4: Stop When Done

```bash
npm run db:stop
```

## Workflow: Deploying to Production

Once your migrations are tested locally:

### Step 1: Link to Remote Project

```bash
npx supabase link
```

This will prompt you to:

- Select or create a Supabase project
- Create a `.supabase/config.json` file (DO NOT commit this)

### Step 2: Push Migrations

```bash
npm run db:push
```

This applies all local migrations to the remote Supabase project.

### Step 3: Verify Remote

Go to https://app.supabase.com and verify your production database has:

- [ ] All tables created
- [ ] All indexes applied
- [ ] RLS policies enabled

## Creating New Migrations

### Example: Add a New Table

```bash
# 1. Create migration file
npm run db:create-migration -- add_reviews_table

# 2. Edit supabase/migrations/[timestamp]_add_reviews_table.sql
# Add your SQL:
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artwork(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

# 3. Test locally
npm run db:start

# Visit http://127.0.0.1:54333 and verify table created

npm run db:stop

# 4. Push to production when ready
npm run db:push
```

## Current Migrations

### 20251026000000_initial_schema.sql

- Creates 8 tables: administrators, artwork, pages, page_artwork, projects, events, orders, order_items
- Creates helper functions: update_updated_at_column, generate_order_number, set_order_number, decrement_artwork_inventory
- Creates RLS policies for all tables
- Creates indexes for optimal query performance
- Enables automatic timestamp management

## Important Notes

### Environment Variables

**Local Testing**:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
```

**Production**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

The `.env.local` file already has the production URLs. Update it for local testing, then revert.

### Version Control

**DO commit**:

- `supabase/migrations/*.sql` - All migration files
- `supabase/config.toml` - Configuration

**DO NOT commit**:

- `.supabase/config.json` - Remote project link
- `supabase/.branches/` - Local branch state
- `supabase/.temp/` - Temporary files

### Database Versions

The local Supabase uses PostgreSQL 17 (configured in `supabase/config.toml`).

Your remote Supabase project may use a different version. To check:

```sql
SHOW server_version;  -- Run in remote database
```

If versions differ, update `supabase/config.toml`:

```toml
[db]
major_version = 16  # Or your remote version
```

## Troubleshooting

### "Port already in use"

If port 54331 or 54333 is already in use:

```bash
# Stop all Docker containers
docker ps
docker stop <container_id>

# Or change the port in supabase/config.toml
[api]
port = 54331  # Change this number
```

### "Authentication failed when pushing"

```bash
# Re-link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Your project ref is visible in the Supabase dashboard URL:
# https://app.supabase.com/project/<PROJECT_REF>/...
```

### Migrations not applying

```bash
# Check migration status
npx supabase migration list

# Reset and try again
npm run db:reset
```

### Migration syntax errors

Migrations are SQL files executed against PostgreSQL. Common issues:

```sql
-- ❌ Wrong - Missing semicolon
CREATE TABLE test (id UUID)

-- ✅ Correct
CREATE TABLE test (id UUID);

-- ❌ Wrong - Transaction in file
BEGIN;
CREATE TABLE ...;
COMMIT;

-- ✅ Correct - No BEGIN/COMMIT in migration files
CREATE TABLE ...;
```

## Advanced: Multi-Developer Workflow

When working with a team:

### Developer A: Create New Feature

```bash
# Create and test migration locally
npm run db:start
npm run db:create-migration -- add_product_reviews
# Edit and test...
npm run db:stop

# Commit migration file to Git
git add supabase/migrations/[timestamp]_add_product_reviews.sql
git commit -m "feat: add product reviews table"
git push
```

### Developer B: Get Latest Changes

```bash
# Pull latest code
git pull

# Test migration locally
npm run db:start

# See if everything still works
npm run dev

npm run db:stop

# Ready to merge
```

### Both: Push to Production

```bash
npm run db:push
```

## Next Steps

1. **Test locally**: `npm run db:start`
2. **Verify in Studio**: Visit http://127.0.0.1:54333
3. **Check your app**: Make sure `npm run dev` connects to local database
4. **Push to production**: When ready, run `npm run db:push`

## References

- [Supabase CLI Docs](https://supabase.com/docs/guides/local-development/cli/overview)
- [Managing Migrations](https://supabase.com/docs/guides/local-development/db-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Key Takeaway**: Test everything locally first, then push to production. This ensures zero-downtime deployments and prevents production errors.
