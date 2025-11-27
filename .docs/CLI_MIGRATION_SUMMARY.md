# CLI Migration Workflow - Setup Complete ✅

## Summary

The Supabase CLI has been configured for your project, enabling a professional migration workflow:

1. **Test locally first** - Apply migrations to local database
2. **Verify everything works** - Run your app against local database
3. **Push to production** - Apply same migrations to remote Supabase
4. **Keep in version control** - All migrations are Git-tracked

## What Was Set Up

### 1. Supabase CLI Installed

```bash
npm install -D supabase  # Already done
```

### 2. Migration Structure Created

```
supabase/
├── config.toml                              # Configuration file
└── migrations/
    └── 20251026000000_initial_schema.sql    # Your first migration
```

### 3. npm Scripts Added to package.json

```json
"db:start": "supabase start",           // Start local Supabase
"db:stop": "supabase stop",             // Stop local Supabase
"db:push": "supabase db push",          // Push to remote
"db:pull": "supabase db pull",          // Pull from remote
"db:create-migration": "supabase migration new",  // Create new migration
"db:reset": "supabase db reset"         // Reset local database
```

### 4. Configuration Files Updated

- `supabase/config.toml` - Already configured for local development
- `SETUP.md` - Updated to use CLI workflow
- `MIGRATIONS_GUIDE.md` - Complete guide to migrations
- `SUPABASE_CLI_SETUP.md` - Quick reference

## Migration Files

### Current Migration: 20251026000000_initial_schema.sql

Location: `supabase/migrations/20251026000000_initial_schema.sql`

Contains:

- ✅ 8 table definitions (administrators, artwork, pages, etc.)
- ✅ All indexes for query performance
- ✅ Helper functions (update_updated_at_column, generate_order_number, etc.)
- ✅ Database triggers (auto timestamps, order numbers, inventory)
- ✅ RLS policies (security) for all tables

## How It Works

### Local Testing Workflow

```bash
# 1. Start local Supabase
npm run db:start

# Supabase starts:
# - Local PostgreSQL on port 54332
# - API on http://127.0.0.1:54331
# - Studio on http://127.0.0.1:54333
# - Automatically applies all migrations from supabase/migrations/

# 2. Verify tables in Studio
# Visit http://127.0.0.1:54333 and check Table Editor

# 3. Update .env.local (optional, for testing with local DB)
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331

# 4. Test your Next.js app
npm run dev

# 5. Stop when done testing
npm run db:stop
```

### Production Deployment Workflow

```bash
# 1. Link to remote Supabase (first time only)
npx supabase link --project-ref <your-project-ref>

# 2. Push migrations to production
npm run db:push

# Supabase CLI:
# - Connects to your remote project
# - Applies any new migrations not yet applied
# - Reports which migrations were applied

# 3. Verify in Supabase dashboard
# Visit https://app.supabase.com/ and check your tables
```

## Creating New Migrations

When you need to add more database changes:

```bash
# 1. Create a new migration file
npm run db:create-migration -- add_reviews_table

# Creates: supabase/migrations/[timestamp]_add_reviews_table.sql

# 2. Edit the file and add your SQL
# Example:
# CREATE TABLE reviews (
#   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#   artwork_id UUID NOT NULL REFERENCES artwork(id),
#   rating INTEGER CHECK (rating >= 1 AND rating <= 5),
#   created_at TIMESTAMP DEFAULT NOW()
# );

# 3. Test locally
npm run db:start
# Visit http://127.0.0.1:54333 to verify table created
npm run db:stop

# 4. Commit to Git
git add supabase/migrations/[timestamp]_add_reviews_table.sql
git commit -m "feat: add reviews table"

# 5. Push to production when ready
npm run db:push
```

## Benefits of This Workflow

✅ **Test Before Production**: Migrations are tested locally first
✅ **Version Control**: All schema changes are in Git
✅ **Collaboration**: Team members see all schema changes
✅ **Rollback Capability**: Can revert migrations if needed
✅ **CI/CD Ready**: Can automate `npm run db:push` in deployment pipeline
✅ **Deterministic**: Same migrations apply identically to local and remote
✅ **No Manual SQL**: No copying/pasting SQL into dashboards

## Environment Setup for Testing

When testing locally, you have two options:

### Option 1: Use Local Supabase (Recommended for Development)

```bash
npm run db:start
# Update .env.local:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
# Run your app
npm run dev
# Stop when done
npm run db:stop
```

### Option 2: Use Remote Supabase (After migrations applied)

```bash
# .env.local already has production URLs
npm run dev
# Your app connects to your remote Supabase project
```

## File Locations

```
Project Root
├── supabase/
│   ├── config.toml                              # Supabase configuration
│   ├── migrations/
│   │   └── 20251026000000_initial_schema.sql    # Migration files
│   ├── .branches/                               # (git ignored)
│   └── .temp/                                   # (git ignored)
├── MIGRATIONS_GUIDE.md                          # Complete migration docs
├── SUPABASE_CLI_SETUP.md                        # Quick reference
├── SETUP.md                                     # Updated with CLI workflow
└── package.json                                 # Contains db:* scripts
```

## Important Notes

### Database Versions

- Local: PostgreSQL 17 (configured in supabase/config.toml)
- Remote: Check with `SHOW server_version;` in your remote database
- If versions differ, update `supabase/config.toml` [db] major_version

### Port Conflicts

If you get "port already in use":

- Kill existing Docker containers: `docker ps && docker stop <id>`
- Or change ports in supabase/config.toml

### Git Ignore

**DO commit**:

- `supabase/migrations/*.sql`
- `supabase/config.toml`

**DO NOT commit**:

- `.supabase/config.json` (remote project link)
- `supabase/.branches/`
- `supabase/.temp/`

## Next Steps

### Immediate (Test Local Setup)

```bash
npm run db:start
# Visit http://127.0.0.1:54333
# Verify 8 tables exist
npm run db:stop
```

### Short Term (Deploy to Remote)

```bash
npx supabase link
npm run db:push
# Verify in https://app.supabase.com/
```

### Ongoing (Create Storage Buckets)

Done manually in Supabase dashboard (see SETUP.md Step 3)

### Future (Add More Migrations)

```bash
npm run db:create-migration -- new_feature
# Edit the file
npm run db:start  # Test
npm run db:stop
npm run db:push   # Deploy
```

## References

- **[MIGRATIONS_GUIDE.md](./MIGRATIONS_GUIDE.md)** - Complete migration documentation
- **[SETUP.md](./SETUP.md)** - Step-by-step setup instructions
- **[SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md)** - Quick reference
- [Supabase CLI Docs](https://supabase.com/docs/guides/local-development/cli/overview)
- [Database Migrations](https://supabase.com/docs/guides/local-development/db-migrations)

---

**Status**: ✅ Complete
**Ready For**: Local testing and production deployment
**Next**: Run `npm run db:start` to test locally!
