# MVP Implementation Plan - yeoldeartoonist.com

**Date:** 2025-10-25
**Duration:** 6 weeks
**Status:** In Progress (Phases 1-2 Complete, Phase 3 Starting)

---

## Overview

This document outlines the detailed implementation phases for building yeoldeartoonist.com MVP. It integrates all architectural decisions made and provides clear, actionable steps for each phase.

**Tech Stack (Finalized):**

- Next.js 14 + TypeScript + Tailwind CSS
- Supabase (Database + Auth + Storage)
- Stripe (Payment processing with all standard methods)
- Resend (Transactional emails)
- Vercel (Hosting)
- Porkbun domain (DNS)

**Key Decisions:**

- ✅ Payments: Stripe (cards, Apple Pay, Google Pay, Link)
- ✅ Shipping: Flat rate ($5.00)
- ✅ Tax: Stripe Tax
- ✅ Email: Resend
- ✅ Hosting: Vercel + Porkbun DNS

**Additional References**

For additional details on this project refer to these documents:

- @specs\architecture-plan.md
- @specs\architecture-summary.md
- @specs\2025-10-25T11-09-00-initial-plan-discussion.md

---

## Phase 1: Foundation (Week 1-2) ✅ COMPLETE

### Goal

Set up the complete project infrastructure, database, and development environment. Get to a point where you can start building features.

**Completion Date:** 2025-10-27 (PR #6)

### Prerequisites

- Node.js 18+ installed
- GitHub account with git configured
- Supabase account created
- Stripe account created (test mode)
- Resend account created
- Vercel account created

### Tasks

#### 1.1 Project Initialization

- [x] Create Next.js 14 project: `npx create-next-app@latest yeoldeartoonist.com --typescript --tailwind`
- [x] Initialize git repository: `git init`
- [x] Create `.gitignore` with `.env.local`, `node_modules/`, `.next/`, etc.
- [x] Create `.env.example` file with all required variables
- [x] Install additional dependencies:
    ```bash
    npm install @supabase/supabase-js @supabase/ssr
    npm install stripe @stripe/stripe-js @stripe/react-stripe-js
    npm install zod
    npm install sharp
    npm install resend
    npm install date-fns
    npm install --save-dev @types/node @types/react
    ```

#### 1.2 Environment Setup

- [x] Create Supabase project at supabase.com
- [x] Copy Supabase URL and keys
- [x] Create Stripe test account
- [x] Get Stripe publishable and secret keys (test mode)
- [x] Get Stripe webhook secret
- [x] Get Resend API key
- [x] Create `.env.local` file with all credentials:

    ```
    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
    SUPABASE_SERVICE_ROLE_KEY=xxx

    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
    STRIPE_SECRET_KEY=sk_test_xxx
    STRIPE_WEBHOOK_SECRET=whsec_xxx

    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    NEXT_PUBLIC_SITE_NAME=Ye Olde Artoonist

    RESEND_API_KEY=xxx
    RESEND_FROM_EMAIL=orders@yeoldeartoonist.com

    CART_SESSION_SECRET=generate-a-random-32-char-string
    ```

#### 1.3 Folder Structure

- [x] Create folder structure as documented in architecture-plan.md:
    - `src/app/` - Next.js pages
    - `src/components/` - React components
    - `src/lib/` - Utilities
    - `src/types/` - TypeScript types
    - `src/hooks/` - Custom hooks
    - `src/context/` - React context
    - `src/styles/` - CSS

#### 1.4 Database Schema Creation

- [x] In Supabase dashboard, go to SQL Editor
- [x] Run SQL schema from architecture-plan.md section 1.2:
    - Create `administrators` table
    - Create `artwork` table
    - Create `pages` table
    - Create `page_artwork` table
    - Create `projects` table
    - Create `events` table
    - Create `orders` table
    - Create `order_items` table
- [x] Create all indexes as specified
- [x] Create database functions and triggers:
    - `update_updated_at_column()` trigger
    - `generate_order_number()` function
    - `set_order_number()` trigger
    - `decrement_artwork_inventory()` trigger
- [x] **MANUAL STEP**: Apply migration in Supabase SQL Editor (see SETUP.md)

#### 1.5 Row-Level Security (RLS)

- [x] Enable RLS on all tables (Enable policy enforcement) - Created in migration
- [x] Create RLS policies for each table (see architecture-plan.md):
    - Public read policies for published content
    - Admin-only manage policies
    - Proper cascade rules for deletions
- [x] **MANUAL STEP**: Verify RLS is enabled on all tables in Supabase dashboard

#### 1.6 Storage Buckets

- [x] **MANUAL STEP**: In Supabase Storage, create buckets:
    - `artwork` (public)
    - `events` (public)
    - `projects` (public)
    - ~~`admin` (private)~~ Skipped per clarification
    - ~~`site` (public)~~ Skipped per clarification
- [x] **MANUAL STEP**: Create storage policies as documented in architecture-plan.md section 5.2

#### 1.7 TypeScript Types

- [x] Generate types from Supabase: `npx supabase gen types typescript --project-id=your-project-id > src/types/database.ts`
- [x] Create type files:
    - `src/types/cart.ts` - Cart interfaces
    - `src/types/order.ts` - Order interfaces
    - `src/types/index.ts` - Shared types
- [x] Set up TypeScript configuration in `tsconfig.json` with proper path aliases

#### 1.8 Supabase Client Setup

- [x] Create `src/lib/supabase/client.ts` (browser client)
- [x] Create `src/lib/supabase/server.ts` (server client)
- [x] Create `src/middleware.ts` for admin authentication

#### 1.9 Git & Deployment Setup

- [x] Initialize git and make first commit
- [x] Create GitHub repository
- [x] Push to GitHub
- [x] Connect Vercel to GitHub repository
- [x] Configure Vercel environment variables (copy from `.env.local`)
- [x] Test that Vercel preview deployment works

#### 1.10 Documentation

- [x] Document setup process in SETUP.md
- [x] Add notes about running locally: `npm run dev`
- [x] Document how to seed database (for Phase 2)
- [x] Created PHASE_1_SUMMARY.md
- [x] Created PHASE_1_VERIFICATION.md
- [x] Created IMPLEMENTATION_COMPLETE.md
- [x] Updated README.md

### Deliverables

- ✅ Working Next.js development environment
- ✅ Complete database with all tables, indexes, and RLS
- ✅ Type-safe Supabase clients
- ✅ Admin auth middleware
- ✅ GitHub repo connected to Vercel
- ✅ Environment variables configured

### Verification Checklist

- [x] `npm run dev` starts without errors
- [x] Supabase dashboard shows all tables created
- [x] RLS is enabled on all tables
- [x] Environment variables are correct
- [x] Can query database from Next.js (test with simple query)
- [x] Vercel preview deployment shows working Next.js app

---

## Phase 2: Public Pages (Week 2-3) ✅ COMPLETE

### Goal

Build all customer-facing pages with responsive design and optimized images.

**Completion Date:** 2025-10-28 (PR #7)

### Key Decision: Static Branding Assets

Logo, navigation images, section header images, and scroll background are stored as static assets in `/public/images/` and served from Vercel CDN (not Supabase Storage). **Rationale**: These are structural/branding elements that rarely change; storing locally provides faster performance for above-the-fold content and simplifies deployment.

### Tasks

#### 2.1 Layout & Navigation

- [x] Create `src/components/layout/Header.tsx` - Logo and top section
    - See @specs\wireframes\01-Home-Page.jpg for header layout
    - See @specs\assets\logo.jpg for the site logo
    - Header background is white with black text
- [x] Create `src/components/layout/Navigation.tsx` - Main nav with 4 links
    - See @specs\wireframes\01-Home-Page.jpg for header layout
    - **Desktop**: Navigation links as image buttons (individual nav-\*.jpg files from @specs\assets\navigation\)
    - **Mobile**: Responsive text/icon navigation (switches from image to text for better mobile UX)
    - See @specs\assets\navigation\navigation.jpg for reference of all buttons
    - Navigation background is white with black text
- [x] Create `src/components/layout/Footer.tsx` - Contact info, copyright, socials
- [x] Create `src/app/layout.tsx` - Root layout with header/nav/footer
- [x] Implement responsive design (mobile-first)
- [x] Add Tailwind styling for black/white theme

#### 2.2 Database Queries

- [x] Create `src/lib/db/artwork.ts` - Query functions for artwork
- [x] Create `src/lib/db/pages.ts` - Query functions for page content
- [x] Create `src/lib/db/projects.ts` - Query functions for projects
- [x] Create `src/lib/db/events.ts` - Query functions for events
- [x] Implement pagination for large galleries
- [x] Add proper error handling

#### 2.3 Image Management

- [x] Copy static branding assets to `/public/images/`
    - These are static assets served from Vercel CDN (not Supabase Storage)
    - Assets: logo.jpg, scroll.jpg, nav-\*.jpg files, section-header images (gallery.jpg, shoppe.jpg, contact.jpg, in-the-works.jpg)
    - Rationale: Structural/branding elements that rarely change; faster performance for above-the-fold content
- [x] Create `src/lib/utils/image.ts` - Image URL helpers
- [x] Create `src/components/artwork/ArtworkImage.tsx` - Optimized image component
- [x] Configure Next.js image optimization in `next.config.js`
- [x] Add blur placeholders for lazy loading
- [x] Test image loading performance

#### 2.4 Home Page

- [x] Create `src/app/page.tsx` - Home page
    - See @specs\wireframes\01-Home-Page.jpg for page layout
    - Page background is black
    - Page text is on top of the scroll image from @specs\assets\scroll.jpg
- [x] Build hero section with scroll image
- [x] Add large, clickable navigation preview cards for Gallery, Shoppe, In The Works, Contact
    - Use section-header images from @specs\assets\section-headers\ for each card
    - Each card links to its respective section
    - Use placeholder text for page descriptions (content to be provided later)
- [x] Implement ISR with `revalidate = 3600`
- [x] Make fully responsive
- [x] Update site metadata in `src/app/layout.tsx`:
    - Change `title` from "Create Next App" to "Ye Olde Artoonist"
    - Change `description` to reflect actual site purpose
    - Update in both `metadata` export and dynamic meta tags

#### 2.5 Gallery Page

- [x] Create `src/app/gallery/page.tsx` - Gallery listing
    - See @specs\wireframes\02-Gallery.jpg for page layout
    - Page background is white with black text
- [x] Create gallery grid with thumbnail images
- [x] Add artwork title and optional description
- [x] Create `src/app/gallery/[slug]/page.tsx` - Individual artwork detail
- [x] Build detailed artwork view (large image, full description, metadata)
    - For MVP we will not use any of these fields on the Gallery page:
        - price
        - original_price
        - sku
        - inventory_count
        - is_limited_edition
        - medium
        - year_created
        - is_featured
        - tags
- [x] Add back link to gallery
- [x] Implement `generateStaticParams()` for dynamic routes
- [x] Make fully responsive

#### 2.6 Shoppe Page (Without Cart)

- [x] Create `src/app/shoppe/page.tsx` - Product listing
    - See @specs\wireframes\03-Shoppe.jpg for page layout
    - Page background is white with black text
- [x] Build product grid with:
    - Thumbnail image
    - Title and optional description
    - Price display
    - Quantity selector UI (non-functional for now)
    - "Add to Cart" button (non-functional for now)
    - For MVP we will not use any of these fields on the Shoppe page:
        - original_price
        - sku
        - is_limited_edition
        - medium
        - year_created
        - is_featured
        - tags
- [x] Implement ISR for product listing
- [x] Make fully responsive
- [x] Note: Cart functionality added in Phase 3

#### 2.7 In The Works Page

- [x] Create `src/app/in-the-works/page.tsx`
    - See @specs\wireframes\04-In-The-Works.jpg for page layout
    - Page background is white with black text
- [x] Display projects section with:
    - Project title, description, image
    - For MVP we will not use any of these fields on the Projects section:
        - status
        - progress_percentage
        - expected_competion_date
- [x] Display events section with:
    - Event title, description, image, date range, location
    - For MVP we will not use any of these fields on the Events section:
        - venue_name
        - booth_number
        - convention_url
- [x] Sort upcoming events first
- [x] Make fully responsive

#### 2.8 Contact Page (Meet The Artist)

- [x] Create `src/app/contact/page.tsx`
    - See @specs\wireframes\05-Contact.jpg for page layout
    - Page background is black with white text
- [x] Display "Meet The Artist: [Name]" title and page metadata
- [x] Add artist image (left side) from @specs\assets\projects\meet-the-artist.jpg
- [x] Add artist bio/description (right side)
- [x] Display contact information:
    - Email
    - USPS address "PO Box 123, Columbia, MO, 65201, US"
    - Social media links
- [x] Simple contact form (for Phase 4)
- [x] Make fully responsive (stack on mobile)

#### 2.9 UI Components

- [x] Create reusable UI components in `src/components/ui/`:
    - `Button.tsx` - Styled button component
    - `Card.tsx` - Content card component
    - `Input.tsx` - Form input component
    - `Grid.tsx` - Responsive grid component
- [x] Use Tailwind for consistent styling
- [x] Make all components mobile-responsive

#### 2.10 Testing & Performance

- [x] Test all pages on mobile, tablet, desktop
- [x] Test image loading speeds
- [x] Verify ISR revalidation works
- [x] Check Core Web Vitals
- [x] Test accessibility (keyboard navigation, screen readers)
- [x] Run Lighthouse audit on each page

### Deliverables

- ✅ All public pages fully functional
- ✅ Responsive design across devices
- ✅ Optimized images loading efficiently
- ✅ ISR implemented for fast page loads
- ✅ Accessibility standards met

### Verification Checklist

- [x] Home page loads with featured artwork
- [x] Gallery page displays all published artwork
- [x] Clicking artwork opens detail page
- [x] Shoppe page displays products with prices
- [x] In The Works shows projects and upcoming events
- [x] Contact page displays artist info and links
- [x] All pages responsive on mobile/tablet/desktop
- [x] Images load quickly without layout shift
- [ ] Lighthouse score >90

---

## Phase 2.5: Comprehensive Testing (Week 3)

### Goal

Add comprehensive test coverage for all features implemented in Phases 1-2 (foundation, database, and public pages). Establish testing patterns and best practices to be followed in subsequent phases.

### Key Testing Strategy

- **Test Organization**: All tests will be located in `__tests__/` folder for clear separation of concerns
- **Test-Driven Development (TDD)**: Starting with Phase 3, all new features should have tests written first
- **Coverage Target**: Aim for >80% code coverage for critical paths
- **Test Types**: Unit tests, integration tests, and E2E tests where appropriate

### Tasks

#### 2.5.0 Prep

- [ ] Create branch `phase-2.5-testing`

#### 2.5.1 Testing Setup & Infrastructure

- [ ] Install testing dependencies:
    ```bash
    npm install --save-dev jest @testing-library/react @testing-library/jest-dom
    npm install --save-dev @types/jest
    npm install --save-dev next-router-mock
    ```
- [ ] Create `jest.config.ts` with proper Next.js configuration
- [ ] Create `__tests__/setup.ts` for test environment setup
- [ ] Configure TypeScript for tests with `tsconfig.test.json`
- [ ] Add test scripts to `package.json`:
    ```json
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
    ```

#### 2.5.2 Unit Tests - Utilities & Helpers

- [ ] Create `__tests__/lib/` directory structure matching `src/lib/`
- [ ] Write tests for `src/lib/supabase/client.ts`
- [ ] Write tests for `src/lib/supabase/server.ts`
- [ ] Write tests for image utility functions in `src/lib/utils/image.ts`
- [ ] Write tests for any helper/utility functions
- [ ] Achieve >90% coverage for utility modules

#### 2.5.3 Unit Tests - Middleware & Auth

- [ ] Create `__tests__/middleware.test.ts`
- [ ] Test admin authentication checks
- [ ] Test session validation logic
- [ ] Test unauthorized access rejection
- [ ] Test proper redirects for unauthenticated users

#### 2.5.4 Component Tests - Layout & Navigation

- [ ] Create `__tests__/components/layout/` directory
- [ ] Write tests for `Header.tsx`:
    - Logo renders correctly
    - Navigation is present
- [ ] Write tests for `Navigation.tsx`:
    - All navigation links present
    - Links route to correct pages
    - Mobile/desktop variants render correctly
- [ ] Write tests for `Footer.tsx`:
    - Contact info displayed
    - Social links present
    - Copyright notice shown

#### 2.5.5 Component Tests - UI Components

- [ ] Create `__tests__/components/ui/` directory
- [ ] Write tests for `Button.tsx`:
    - Renders with correct styling
    - Click handlers work
    - Disabled state works
- [ ] Write tests for `Card.tsx`
- [ ] Write tests for `Input.tsx`
- [ ] Write tests for `Grid.tsx`

#### 2.5.6 Page Tests - Public Pages

- [ ] Create `__tests__/app/` directory structure matching `src/app/`
- [ ] Write tests for Home page (`page.tsx`):
    - Hero section renders
    - Navigation preview cards present
    - Responsive design works
- [ ] Write tests for Gallery page:
    - Artwork list displays
    - Pagination works (if implemented)
    - Individual artwork detail page loads
- [ ] Write tests for Shoppe page:
    - Product grid displays
    - Prices shown correctly
    - Responsive layout
- [ ] Write tests for In The Works page:
    - Projects display
    - Events display
    - Events sorted by date
- [ ] Write tests for Contact page:
    - Artist info displays
    - Contact information present
    - Form fields present

#### 2.5.7 Database Query Tests

- [ ] Create `__tests__/lib/db/` directory
- [ ] Write tests for artwork queries (`src/lib/db/artwork.ts`):
    - Query published artwork only
    - Pagination works
    - Handles empty results
- [ ] Write tests for page queries (`src/lib/db/pages.ts`)
- [ ] Write tests for project queries (`src/lib/db/projects.ts`)
- [ ] Write tests for event queries (`src/lib/db/events.ts`)
- [ ] Mock Supabase client for testing
- [ ] Test error handling and edge cases

#### 2.5.8 Integration Tests

- [ ] Create `__tests__/integration/` directory
- [ ] Test complete page load flows:
    - Home page with database queries
    - Gallery page loading artwork from database
    - Shoppe page loading products from database
- [ ] Test navigation between pages
- [ ] Test image loading and optimization
- [ ] Test ISR revalidation behavior (if testable)

#### 2.5.9 E2E Tests (Optional - Playwright/Cypress)

- [ ] Create `__tests__/e2e/` directory
- [ ] Set up Playwright or Cypress configuration
- [ ] Write E2E tests for critical user flows:
    - Homepage navigation
    - Gallery browsing
    - Product viewing
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Test accessibility (keyboard navigation, screen reader compat)

#### 2.5.10 Documentation & Best Practices

- [ ] Create `TESTING.md` documenting:
    - How to run tests
    - How to write new tests
    - Testing patterns and conventions
    - Mocking strategies
    - Coverage goals
- [ ] Add code comments explaining complex test setups
- [ ] Document how to add tests for Phase 3+ features
- [ ] Create template test files for copy-paste consistency

#### 2.5.11 Coverage Analysis & Reporting

- [ ] Run full test suite: `npm run test:coverage`
- [ ] Generate coverage report
- [ ] Identify untested code paths
- [ ] Set coverage thresholds in `jest.config.ts`
- [ ] Document coverage baseline (target >80%)
- [ ] Create GitHub Actions workflow for CI/CD testing

#### 2.5.12 Testing Validation

- [ ] All tests pass: `npm test`
- [ ] Coverage report generated successfully
- [ ] No console errors or warnings in tests
- [ ] Tests run in <30 seconds
- [ ] Mock data matches actual database schema
- [ ] Documentation complete and clear

### Deliverables

- ✅ Comprehensive test suite for Phases 1-2
- ✅ Testing infrastructure configured (Jest, testing-library)
- ✅ Unit tests for utilities and components
- ✅ Integration tests for critical flows
- ✅ Test documentation and best practices
- ✅ Coverage reporting configured

### Verification Checklist

- [ ] `npm test` runs without errors
- [ ] `npm run test:coverage` shows >80% coverage
- [ ] All public pages have tests
- [ ] All components have tests
- [ ] Database queries have tests with mocked Supabase
- [ ] Utilities and helpers are fully tested
- [ ] Documentation clearly explains testing approach
- [ ] GitHub Actions CI/CD runs tests on pull requests
- [ ] Test execution time is acceptable (<1 minute)

### TDD Approach for Future Phases

Starting with Phase 3, all new features will follow TDD:

1. Write failing tests first (Red)
2. Implement minimum code to pass tests (Green)
3. Refactor and optimize (Refactor)
4. All Phase 3+ PRs must include comprehensive tests for new features

---

## Phase 3: Admin System (Week 4)

### Goal

Build complete admin dashboard for content management, order management, and image uploads.

### Tasks

#### 3.1 Admin Authentication

- [ ] Set up Supabase Auth in dashboard
- [ ] Create first admin user in administrators table
- [ ] Create `src/app/admin/login/page.tsx` - Admin login page
    - [ ] Include session checking with unmount cleanup flag
    - [ ] Add visual loading state with spinner and descriptive text
    - [ ] Implement error sanitization to prevent account enumeration attacks
    - [ ] Use useCallback for form submission with proper dependencies
- [ ] Create login form with email/password
- [ ] Implement Supabase Auth signIn with normalized error handling
    - [ ] All errors should be normalized to consistent AuthError type
    - [ ] Error messages should be sanitized (generic messages for "invalid" errors)
- [ ] Redirect authenticated users to dashboard
    - [ ] Check admin_session cookie (set by middleware) on initial load
    - [ ] Prevent race condition with isMounted flag in useEffect
    - [ ] Redirect if valid cached session exists
- [ ] Add logout functionality
    - [ ] Clear admin_session cookie on logout
    - [ ] Clear application state
    - [ ] Redirect to login page

#### 3.2 Admin Middleware & Protection

- [ ] Implement middleware to protect `/admin` routes
    - [ ] Add environment-aware error logging (development vs production)
    - [ ] Only log sensitive errors in development environment
    - [ ] Fail gracefully with redirect to login in production
- [ ] Implement session caching for performance optimization
    - [ ] Check admin_session cookie for cached valid session
    - [ ] Verify session expiry (15-minute cache window)
    - [ ] Skip database queries if valid cache exists
    - [ ] Store userId, adminId, role, and expiresAt in secure cookie
- [ ] Check user authentication using Supabase service role key
    - [ ] Use service role key for admin operations (enforces RLS)
    - [ ] Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present
- [ ] Verify user is in administrators table with is_active = true
    - [ ] Query administrators table for user's admin record
    - [ ] Verify is_active = true before allowing access
- [ ] Redirect unauthenticated users to login
    - [ ] Set proper cookie for cache when authentication succeeds
- [ ] Add role-based access control (admin vs super_admin)
    - [ ] Store role in session cache for use in components
    - [ ] Use role to determine which features are available

#### 3.3 Admin Layout

- [ ] Create `src/app/admin/layout.tsx` - Admin page layout
- [ ] Create `src/components/admin/AdminSidebar.tsx` - Navigation sidebar
- [ ] Add navigation links:
    - Dashboard
    - Artwork
    - Orders
    - Projects
    - Events
    - Settings (super_admin only)
- [ ] Add logout button
- [ ] Display current admin name
- [ ] Responsive layout (mobile sidebar collapse)

#### 3.4 Admin Dashboard

- [ ] Create `src/app/admin/page.tsx` - Main dashboard
- [ ] Display key metrics:
    - Total orders (all time)
    - Orders this month
    - Total revenue
    - Pending orders
- [ ] Quick links to manage content
- [ ] Recent orders list (last 10)
- [ ] System status indicators

#### 3.5 Artwork Management

- [ ] Create `src/app/admin/artwork/page.tsx` - Artwork list
- [ ] Create `src/app/admin/artwork/new/page.tsx` - New artwork form
- [ ] Create `src/app/admin/artwork/[id]/edit/page.tsx` - Edit artwork form
- [ ] Create `src/components/admin/ArtworkForm.tsx` - Reusable form
- [ ] Form fields:
    - Title, description, slug
    - Price, original price, SKU
    - Inventory count, is_limited_edition
    - Medium, dimensions, year_created
    - Is published, is featured, display order
    - Alt text, SEO title, SEO description, tags
- [ ] Validation with Zod
- [ ] Success/error messages

#### 3.6 Image Upload

- [ ] Create `src/lib/utils/image.ts` - Image optimization functions
- [ ] Create `src/app/api/admin/upload/route.ts` - Upload endpoint
- [ ] Create `src/components/admin/ImageUploader.tsx` - File upload component
- [ ] Implement image upload flow:
    - Accept image file
    - Generate 3 variants (thumbnail, preview, large)
    - Convert to WebP
    - Upload to Supabase Storage
    - Return image URLs
- [ ] Add drag-and-drop upload
- [ ] Show upload progress
- [ ] Display image preview

#### 3.7 Order Management

- [ ] Create `src/app/admin/orders/page.tsx` - Orders list
- [ ] Create `src/app/admin/orders/[id]/page.tsx` - Order detail
- [ ] Create `src/components/admin/OrdersList.tsx` - Orders table
- [ ] Display in orders list:
    - Order number
    - Customer name/email
    - Order date
    - Total amount
    - Status
    - Payment status
- [ ] Sort/filter options (by date, status, amount)
- [ ] Order detail view shows:
    - All order info
    - Customer address
    - Order items (products ordered)
    - Order timeline
    - Admin notes field
    - Update order status dropdown
    - Add shipping tracking number

#### 3.8 Projects & Events Management

- [ ] Create `src/app/admin/projects/page.tsx` - Projects list
- [ ] Create project form with:
    - Title, slug, description
    - Status (planning, active, completed, archived)
    - Progress percentage
    - Expected completion date
    - Is published, display order
    - Image upload
- [ ] Create `src/app/admin/events/page.tsx` - Events list
- [ ] Create event form with:
    - Title, slug, description
    - Date range (start and end)
    - Location, venue name, booth number
    - Links to convention website
    - Is published
    - Image upload

#### 3.9 Settings & Admin Users (Super Admin Only)

- [ ] Create `src/app/admin/settings/page.tsx` - Settings page
- [ ] Implement admin user management:
    - List administrators
    - Add new admin user
    - Edit admin (name, role, active status)
    - Remove admin access
- [ ] Display role-based permissions
- [ ] Add configuration for:
    - Shipping cost
    - Site name/description
    - Social media links
    - Contact email

#### 3.10 API Routes for Admin

- [ ] Create `/api/admin/artwork/*` routes for CRUD
- [ ] Create `/api/admin/orders/*` routes for reading/updating
- [ ] Create `/api/admin/projects/*` routes for CRUD
- [ ] Create `/api/admin/events/*` routes for CRUD
- [ ] Create `/api/admin/settings/*` routes
- [ ] All routes protected by admin auth middleware
- [ ] Add proper error handling and validation

#### 3.11 Caching & Revalidation

- [ ] Create `src/app/api/admin/revalidate/route.ts` - On-demand revalidation
- [ ] Trigger revalidation when content changes:
    - After artwork created/updated
    - After projects/events updated
    - After pages updated
- [ ] Use Next.js `revalidatePath` and `revalidateTag`

#### 3.12 Testing

- [ ] Test admin login and logout
- [ ] Test creating new artwork with image upload
- [ ] Test editing artwork
- [ ] Test creating projects and events
- [ ] Test order management (view, update status)
- [ ] Test content changes trigger revalidation
- [ ] Test role-based access (super_admin only features)
- [ ] Test form validation

### Deliverables

- ✅ Complete admin dashboard
- ✅ Content management (artwork, projects, events)
- ✅ Image upload with optimization
- ✅ Order management system
- ✅ Role-based access control
- ✅ On-demand cache revalidation

### Verification Checklist

- [ ] Admin login works
- [ ] Dashboard loads and shows metrics
- [ ] Can create new artwork with image
- [ ] Can edit existing artwork
- [ ] Images upload and generate variants
- [ ] Can create projects and events
- [ ] Can view and update orders
- [ ] Order status changes trigger email (Phase 4.13)
- [ ] Content changes revalidate pages
- [ ] Super admin features hidden from regular admin

---

## Phase 4: Shopping Cart & Checkout (Week 5)

### Goal

Implement complete shopping cart with localStorage persistence, checkout form, and Stripe payment integration.

### Tasks

#### 4.1 Cart State Management

- [ ] Create `src/lib/cart/storage.ts` - localStorage cart management
- [ ] Create `src/hooks/useCart.ts` - Cart hook for components
- [ ] Create `src/context/CartContext.tsx` - React Context for global cart state
- [ ] Implement cart operations:
    - Add item to cart
    - Remove item from cart
    - Update quantity
    - Clear cart
    - Calculate subtotal

#### 4.2 Cart UI Components

- [ ] Create `src/components/cart/CartButton.tsx` - Header cart icon with count
- [ ] Create `src/components/cart/CartDrawer.tsx` - Slide-out cart panel
- [ ] Create `src/components/cart/CartItem.tsx` - Individual item in cart
- [ ] Create `src/components/cart/CartSummary.tsx` - Cart totals summary
- [ ] Add "Add to Cart" functionality on Shoppe page
- [ ] Add cart drawer to header (visible on all pages)
- [ ] Implement smooth animations for drawer open/close

#### 4.3 Cart Page

- [ ] Create `src/app/shoppe/cart/page.tsx` - Dedicated cart page
- [ ] Display all cart items with:
    - Item thumbnail
    - Title and price
    - Quantity editor
    - Remove button
    - Line subtotal
- [ ] Display cart summary (subtotal, shipping estimate, tax estimate)
- [ ] "Continue Shopping" and "Checkout" buttons
- [ ] Empty cart state message
- [ ] Responsive design

#### 4.4 Checkout Form

- [ ] Create `src/app/shoppe/checkout/page.tsx` - Checkout page
- [ ] Create `src/components/checkout/CheckoutForm.tsx` - Main form
- [ ] Create `src/components/checkout/AddressForm.tsx` - Address fields
- [ ] Create `src/components/checkout/PaymentForm.tsx` - Stripe payment element
- [ ] Form fields:
    - Customer name and email
    - Shipping address (address line 1, line 2, city, state, zip, country)
    - Billing address (with "Same as shipping" option)
    - Order notes (optional)
- [ ] Form validation with Zod schema
- [ ] Show order summary on right side

#### 4.5 Stripe Integration

- [ ] Create `src/lib/payments/stripe.ts` - Stripe client setup
- [ ] Create `src/app/api/checkout/route.ts` - POST endpoint to create payment intent
- [ ] Install Stripe Elements components
- [ ] Implement Stripe Payment Element in checkout form
- [ ] Handle payment submission and client secret
- [ ] Add error handling for payment failures
- [ ] Add loading states during payment processing

#### 4.6 Cart Validation

- [ ] Create `src/lib/cart/validation.ts` - Server-side cart validation
- [ ] Validate cart items against database before checkout:
    - Verify items exist and are published
    - Verify prices match (catch tampering)
    - Verify inventory available
    - Check quantities
- [ ] Calculate accurate totals:
    - Subtotal from item prices
    - Shipping ($5.00 flat rate)
    - Tax via Stripe Tax API
- [ ] Return validated cart or error

#### 4.7 Order Creation

- [ ] Create `src/lib/db/orders.ts` - Order database functions
- [ ] Create order in database on successful payment intent
- [ ] Store order with:
    - Order number (auto-generated)
    - Customer info
    - Shipping/billing addresses
    - Cart items as order_items
    - Totals (subtotal, shipping, tax)
    - Payment intent ID
    - Order status (pending)
- [ ] Decrement inventory on successful payment

#### 4.8 Stripe Webhook

- [ ] Create `src/app/api/checkout/webhook/route.ts` - Webhook handler
- [ ] Listen for `payment_intent.succeeded` event
- [ ] Verify webhook signature
- [ ] Update order status to "paid" when payment succeeds
- [ ] Handle `payment_intent.payment_failed` for failed payments
- [ ] Log all webhook events for debugging

#### 4.9 Order Confirmation

- [ ] Create `src/app/shoppe/checkout/success/page.tsx` - Success page
- [ ] Display:
    - Order confirmation message
    - Order number
    - Order total
    - Shipping address
    - Note: Email sent (when Resend integrated)
    - Link back to gallery
- [ ] Send confirmation email via Resend (integrate later)
- [ ] Clear cart after successful payment

#### 4.10 Error Handling

- [ ] Create `src/app/shoppe/checkout/cancelled/page.tsx` - Cancelled page
- [ ] Handle payment cancellation
- [ ] Handle validation errors
- [ ] Handle Stripe errors
- [ ] Add user-friendly error messages
- [ ] Log errors for admin review

#### 4.11 Testing

- [ ] Test complete checkout flow with Stripe test card
- [ ] Test add to cart functionality
- [ ] Test cart persistence across sessions
- [ ] Test inventory validation
- [ ] Test price tampering prevention
- [ ] Test payment success/failure flows
- [ ] Test order creation in database
- [ ] Test webhook signature verification

### Deliverables

- ✅ Complete shopping cart with persistence
- ✅ Checkout form with validation
- ✅ Stripe payment integration
- ✅ Order database storage
- ✅ Webhook handling for payment confirmation
- ✅ Order confirmation page

### Verification Checklist

- [ ] Add item to cart from Shoppe page
- [ ] Cart persists when refreshing page
- [ ] Cart drawer shows correct count
- [ ] Checkout form validates addresses
- [ ] Stripe payment element appears in checkout
- [ ] Test payment succeeds with Stripe test card
- [ ] Order created in database with correct totals
- [ ] Webhook confirms payment
- [ ] Success page shows order details
- [ ] Inventory decremented after payment

---

## Phase 5: Email & Polish (Week 6)

### Goal

Integrate Resend for transactional emails, optimize performance, and prepare for production launch.

### Tasks

#### 5.1 Resend Email Setup

- [ ] Create email templates in Resend dashboard or as React components
- [ ] Create `src/lib/email/templates.ts` - Email template functions
- [ ] Create email template for:
    - Order confirmation
    - Shipping notification
    - Delivery notification
- [ ] Use Resend React email templates for better HTML

#### 5.2 Order Confirmation Email

- [ ] Create email template for order confirmation
- [ ] Include:
    - Order number and date
    - Order items with prices
    - Shipping address
    - Order total
    - Link to track order (placeholder)
- [ ] Send email when order payment captured
- [ ] Integrate in checkout webhook handler
- [ ] Test email sending with Resend

#### 5.3 Admin Email Notifications

- [ ] Send email to admin when new order received
- [ ] Include order details and link to admin dashboard
- [ ] Implement in webhook handler

#### 5.4 Performance Optimization

- [ ] Implement image caching headers
- [ ] Add CDN caching strategy in Vercel config
- [ ] Optimize Supabase queries (already indexed in Phase 1)
- [ ] Add data caching with Next.js `unstable_cache`
- [ ] Implement ISR properly across all pages
- [ ] Run Lighthouse audit on all pages (target >90)

#### 5.5 SEO Optimization

- [ ] Add metadata to all pages:
    - Meta titles and descriptions
    - Open Graph images
    - Canonical URLs
- [ ] Create `robots.txt` and `sitemap.xml`
- [ ] Add structured data (Schema.org) for products
- [ ] Optimize images with proper alt text
- [ ] Add meta tags in layout.tsx

#### 5.6 Accessibility Audit

- [ ] Test keyboard navigation on all pages
- [ ] Test with screen reader (NVDA, JAWS)
- [ ] Ensure proper heading hierarchy
- [ ] Check color contrast ratios
- [ ] Test form accessibility
- [ ] Add ARIA labels where needed

#### 5.7 Security Audit

- [ ] Review RLS policies (already set in Phase 1)
- [ ] Verify webhook signature checking
- [ ] Test input validation (Zod schemas)
- [ ] Check for XSS vulnerabilities
- [ ] Verify CSRF protection
- [ ] Review environment variable security
- [ ] Test admin authentication bypass attempts

#### 5.8 Error Handling & Logging

- [ ] Implement error boundary components
- [ ] Add proper error pages (404, 500)
- [ ] Implement error logging (optional: Sentry)
- [ ] Add user-friendly error messages
- [ ] Log API errors to console (development)
- [ ] Monitor webhook failures

#### 5.9 Documentation

- [ ] Write README with setup instructions
- [ ] Document deployment process
- [ ] Create admin user guide
- [ ] Document environment variables
- [ ] Add code comments for complex logic
- [ ] Create troubleshooting guide

#### 5.10 Pre-Launch Checklist

- [ ] All pages fully functional
- [ ] Responsive design tested
- [ ] Payment flow tested end-to-end
- [ ] Images optimized and loading fast
- [ ] Admin dashboard working
- [ ] Emails sending correctly
- [ ] Database queries performing well
- [ ] Error handling working
- [ ] Security review passed
- [ ] Accessibility audit passed

#### 5.11 Production Deployment

- [ ] Set up production Supabase project
- [ ] Set up production Stripe account
- [ ] Set up production Resend configuration
- [ ] Configure Vercel environment for production
- [ ] Update DNS at Porkbun to point to Vercel
- [ ] Configure custom domain SSL
- [ ] Run final tests on production
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Create admin user accounts for Joe
- [ ] Write handoff documentation

#### 5.12 Post-Launch

- [ ] Monitor error rates and performance
- [ ] Collect feedback from Joe
- [ ] Fix any bugs found
- [ ] Optimize based on usage patterns
- [ ] Set up regular backups

### Deliverables

- ✅ Transactional email integration
- ✅ Optimized performance (Lighthouse >90)
- ✅ SEO-optimized pages
- ✅ Accessible design
- ✅ Production-ready security
- ✅ Complete documentation
- ✅ Live application

### Verification Checklist

- [ ] Order confirmation email sends correctly
- [ ] Admin notification email sends
- [ ] All pages load in <3 seconds
- [ ] Lighthouse score >90 on all pages
- [ ] Meta tags present on all pages
- [ ] Keyboard navigation works throughout
- [ ] No console errors on production
- [ ] RLS policies prevent unauthorized access
- [ ] Custom domain resolves correctly
- [ ] Admin can log in and manage content
- [ ] Customers can purchase and receive orders

---

## Post-Launch Roadmap

### Phase 6: Analytics & Monitoring (Week 7)

Optional but recommended features:

- [ ] Set up Vercel Analytics
- [ ] Create admin analytics dashboard
- [ ] Track conversion rates
- [ ] Monitor order trends
- [ ] Set up alerts for errors
- [ ] Create performance dashboard

### Phase 7: Advanced Features (Future)

Based on feedback from Phase 1-5:

- [ ] Customer accounts (optional)
- [ ] Order tracking
- [ ] Wishlist functionality
- [ ] Product reviews/ratings
- [ ] Email marketing integration
- [ ] Print-on-demand integration
- [ ] Advanced search and filtering
- [ ] Bulk upload for artwork
- [ ] Multi-language support

---

## Key Decisions Reference

**All decisions made and documented:**

| Decision | Choice               | Rationale                                         |
| -------- | -------------------- | ------------------------------------------------- |
| Payments | Stripe (all methods) | Single integration, high conversion, future-proof |
| Shipping | Flat rate $5.00      | Simple, transparent, adjustable later             |
| Tax      | Stripe Tax           | Complex compliance handled automatically          |
| Email    | Resend               | Built for transactional, simple API               |
| Hosting  | Vercel               | Optimized for Next.js, auto-scaling               |
| Domain   | Porkbun (existing)   | Already purchased, simple DNS config              |

**Cost Structure:**

- Month 1-2: $20/month (Vercel only)
- Month 3+: $45/month (Vercel + Supabase)
- Scale later: Add storage, email, analytics as needed

---

## Timeline Summary

| Phase     | Duration | Focus                       | Status              |
| --------- | -------- | --------------------------- | ------------------- |
| Phase 1   | Week 1-2 | Foundation & Database       | ✅ COMPLETE (PR #6) |
| Phase 2   | Week 2-3 | Public Pages                | ✅ COMPLETE (PR #7) |
| Phase 2.5 | Week 3   | Comprehensive Testing (TDD) | Ready to start      |
| Phase 3   | Week 4   | Admin System                |                     |
| Phase 4   | Week 5   | Cart & Checkout             |                     |
| Phase 5   | Week 6   | Email & Launch              |                     |

**Total MVP Time:** 6 weeks for one developer
**Realistic Timeline:** 7-8 weeks (with buffer for surprises)

---

## Assumptions & Dependencies

**Assumptions:**

- Joe will provide artwork images
- Joe will provide all page content (bios, descriptions, etc.)
- Joe has Porkbun domain with access to DNS settings
- Stripe and Resend accounts created
- Vercel account created

**External Dependencies:**

- Supabase availability
- Stripe API availability
- Resend API availability
- Vercel deployment availability

**People Needed:**

- 1 Full-stack developer (you)
- 1 Content provider (Joe - artwork, text)
- Optional: Designer if custom graphics needed (nav buttons, header image)

---

## How to Use This Document

1. **Start with Phase 1** - Complete all tasks before moving to Phase 2
2. **Follow the checklist** - Check off items as you complete them
3. **Do verification** - Test after each section before proceeding
4. **Document blockers** - Note any issues encountered
5. **Iterate on phases** - If needed, adjust timeline based on progress

---

## Getting Started (Next Steps)

1. **Review this plan** - Make sure everything makes sense
2. **Ask clarifying questions** - Any unclear sections?
3. **Adjust timeline** - Set realistic dates for each phase
4. **Begin Phase 1** - Initialize the project
5. **Track progress** - Use the verification checklists

You're ready to build! 🚀
