# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

### Development
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build           # Full build with type check, lint, format check, and Next.js build
npm run lint            # Run ESLint check
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without changes
```

### Database
```bash
npm run db:start        # Start local Supabase instance
npm run db:stop         # Stop local Supabase
npm run db:push         # Push migrations to production
npm run db:pull         # Pull remote schema to local
npm run db:create-migration   # Create new migration file
npm run db:reset        # Reset local database from scratch
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router and TypeScript 5
- **Database**: Supabase PostgreSQL with RLS (Row-Level Security)
- **Authentication**: Supabase Auth with admin session caching in middleware
- **Payment**: Stripe (test mode)
- **Email**: Resend API
- **Styling**: Tailwind CSS 4 with PostCSS
- **Validation**: Zod for schema validation
- **Image Processing**: Sharp for image optimization

### Directory Structure
```
src/
├── app/              # Next.js 16 App Router pages + layouts
├── components/       # React components (to be populated in Phase 2)
├── lib/
│   ├── db/
│   │   ├── artwork.ts        # Artwork gallery/shop queries
│   │   ├── projects.ts       # Project/event queries
│   │   ├── pages.ts          # Page content queries
│   │   ├── events.ts         # Event queries
│   │   └── migrations/
│   │       └── 001_initial_schema.sql  # Database schema (8 tables)
│   └── supabase/
│       ├── client.ts         # Browser client (uses anon key)
│       └── server.ts         # Server client (uses service role)
├── types/
│   ├── database.ts   # Auto-generated from Supabase schema
│   ├── cart.ts       # Shopping cart types
│   ├── order.ts      # Order types
│   └── index.ts      # Central exports
├── hooks/
│   ├── useAuth.ts    # Authentication hook (Phase 2)
│   └── useCart.ts    # Cart hook (Phase 3)
├── context/
│   └── CartContext.tsx  # Cart state management (Phase 3)
├── config/
│   └── site.ts       # Centralized site configuration
├── styles/
│   └── globals.css   # Global styles
└── middleware.ts     # Admin route protection with session caching
```

### Key Architectural Decisions

#### 1. Supabase Client Strategy
- **Browser Client** (`src/lib/supabase/client.ts`): Uses public anon key for public data and auth flows
- **Server Client** (`src/lib/supabase/server.ts`): Uses service role key for admin operations and bypassing RLS when needed
- Database queries use the appropriate client based on context (client vs. server components)

#### 2. Admin Middleware Protection
- `/admin` routes are protected by middleware (`src/middleware.ts`)
- Admin session is cached in cookies for 15 minutes to reduce database queries
- Cache validation checks: user ID exists, session hasn't expired
- All non-admin routes are unprotected (public pages)

#### 3. Database Design
- 8 tables: `artwork`, `categories`, `orders`, `order_items`, `pages`, `projects`, `events`, `administrators`
- RLS policies restrict row-level access where needed
- All database queries include proper error handling with typed error responses

#### 4. Bundle Optimization
- `next.config.ts` uses experimental `optimizePackageImports` to lazy-load heavy dependencies:
  - Stripe packages (loaded only on checkout routes)
  - Supabase packages (loaded only where needed)
  - date-fns (partial imports to reduce size)
- Turbopack (default in Next.js 16) handles tree-shaking and dead code elimination

#### 5. Configuration Management
- Centralized in `src/config/site.ts` with site info, navigation, social media links
- Environment variables in `.env.local` (add to `.gitignore`)
- Required vars: Supabase URLs/keys, Stripe keys, Resend API key

## Database Schema Overview

The database (`src/lib/db/migrations/001_initial_schema.sql`) includes:

- **artwork**: Gallery items and shop products with images, pricing, display order
- **categories**: Product categories for filtering
- **orders**: Customer orders with status tracking
- **order_items**: Line items in each order
- **pages**: CMS-style content pages (about, policies, etc.)
- **projects**: Upcoming projects and commissions
- **events**: Calendar events and shows
- **administrators**: Admin users with auth_id linking to Supabase Auth

All tables have `created_at` and `updated_at` timestamps. IDs are UUIDs.

## Phases

**Phase 1** (Complete): Database schema, Supabase clients, middleware, types
**Phase 2** (Next): Public pages (gallery, shop, contact), components
**Phase 3**: Shopping cart, checkout integration, order management
**Phase 4**: Admin panel for content management
**Phase 5**: Email notifications, production deployment

## Environment Setup

1. Create `.env.local` with these variables (copy from `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=<project_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<public_key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
   STRIPE_SECRET_KEY=<test_key>
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<test_key>
   RESEND_API_KEY=<api_key>
   ```

2. For local development, run `npm run db:start` to start Supabase locally

## Code Patterns

### Query Functions
All database query functions in `src/lib/db/` follow this pattern:
```typescript
export async function queryName(): Promise<{ data: T | null; error: ErrorType | null }>
```
They return both data and error (never throw), handle errors gracefully, and support pagination where applicable.

### Type Generation
Run `supabase gen types typescript --local > src/types/database.ts` to regenerate types from the remote schema. Types are auto-generated, don't edit manually.

### Validation
Use Zod schemas for form validation and API request/response validation. Define schemas in the same module or in a dedicated `schemas.ts` file.

### Protected Routes
Any route under `/admin` is automatically protected by middleware. Components that need auth access should use the browser Supabase client's `auth.getUser()` method.

## Build & Deploy

- **Build Process**: `npm run build` runs type check → lint → format check → Next.js build
- **Production Start**: `npm run start` after building
- **Deployment**: Target is Vercel. Environment variables must be set in Vercel dashboard
- **Database**: Use `npm run db:push` to apply migrations to production after deploying code

## Testing & Debugging

- Local testing: `npm run dev` then visit `http://localhost:3000`
- Database testing: `npm run db:start` to run local Supabase at `http://127.0.0.1:54333`
- Build verification: `npm run build` (must complete without errors)
- Type checking: `npx tsc --noEmit` (included in build)
- Linting: `npm run lint` (ESLint with Prettier)

## Documentation
All project documentation is in the `docs/` folder. Start with:
- `docs/INDEX.md` - Full documentation index
- `docs/QUICK_START.md` - 5-minute setup test
- `docs/SETUP.md` - Detailed configuration guide
- `docs/MIGRATIONS_GUIDE.md` - Database migration workflow
