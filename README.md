# Ye Olde Artoonist - MVP Implementation

A Next.js e-commerce platform for artist Joe's artwork and merchandise, built with TypeScript, Supabase, Stripe, and Tailwind CSS.

## Project Status

**Phase 1: Foundation** ✅ In Progress

- Database schema designed and ready for deployment (with CLI migration workflow)
- Project structure created with proper TypeScript setup
- Supabase clients and middleware configured
- All dependencies installed
- Professional migration workflow configured

See [docs/PHASE_1_SUMMARY.md](./docs/PHASE_1_SUMMARY.md) for detailed completion status.

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account with project created
- Stripe test account
- Resend account

### Setup Instructions

1. **Start the development server:**

    ```bash
    npm run dev
    ```

    Navigate to [http://localhost:3000](http://localhost:3000)

2. **Test migrations locally:**

    ```bash
    npm run db:start
    # Visit http://127.0.0.1:54333 to verify
    npm run db:stop
    ```

3. **Deploy to production:**
   See [docs/SETUP.md](./docs/SETUP.md) for detailed instructions on pushing to remote

4. **Verify the setup:**
   Use [docs/PHASE_1_VERIFICATION.md](./docs/PHASE_1_VERIFICATION.md) to check all components

### Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utilities and helpers
│   ├── db/           # Database queries
│   │   └── migrations/  # SQL migrations
│   └── supabase/     # Supabase clients
├── types/            # TypeScript types
├── hooks/            # Custom React hooks
├── context/          # React Context providers
└── styles/           # CSS files
```

## Tech Stack

- **Frontend**: Next.js 14 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **Image Processing**: Sharp
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **Validation**: Zod

## Development Commands

### Application

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run linter
```

### Database (Migrations)

```bash
npm run db:start              # Start local Supabase with migrations
npm run db:stop               # Stop local Supabase
npm run db:push               # Push migrations to production
npm run db:pull               # Pull remote schema to local
npm run db:create-migration   # Create a new migration
npm run db:reset              # Reset local database from scratch
```

See [docs/MIGRATIONS_GUIDE.md](./docs/MIGRATIONS_GUIDE.md) for detailed migration workflow.

## Documentation

All documentation is in the [`docs/`](./docs/) folder. Start with:

- **[docs/INDEX.md](./docs/INDEX.md)** - Documentation index and navigation
- **[docs/QUICK_START.md](./docs/QUICK_START.md)** - Fast testing guide (5 min)
- **[docs/SETUP.md](./docs/SETUP.md)** - Complete setup instructions
- **[docs/MIGRATIONS_GUIDE.md](./docs/MIGRATIONS_GUIDE.md)** - Database migration workflow
- **[docs/PHASE_1_SUMMARY.md](./docs/PHASE_1_SUMMARY.md)** - Phase 1 completion details
- **[src/lib/db/migrations/001_initial_schema.sql](./src/lib/db/migrations/001_initial_schema.sql)** - Database schema

## Environment Variables

See `.env.example` for the complete list. Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key (test mode)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `RESEND_API_KEY` - Resend email API key

## License

Private project for yeoldeartoonist.com
