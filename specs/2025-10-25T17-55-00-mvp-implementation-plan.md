# MVP Implementation Plan - yeoldeartoonist.com

**Date:** 2025-10-25
**Duration:** 6 weeks
**Status:** Ready for implementation

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

---

## Phase 1: Foundation (Week 1-2)

### Goal

Set up the complete project infrastructure, database, and development environment. Get to a point where you can start building features.

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
- [ ] Install additional dependencies:
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

- [ ] Create folder structure as documented in architecture-plan.md:
  - `src/app/` - Next.js pages
  - `src/components/` - React components
  - `src/lib/` - Utilities
  - `src/types/` - TypeScript types
  - `src/hooks/` - Custom hooks
  - `src/context/` - React context
  - `src/styles/` - CSS

#### 1.4 Database Schema Creation

- [ ] In Supabase dashboard, go to SQL Editor
- [ ] Run SQL schema from architecture-plan.md section 1.2:
  - Create `administrators` table
  - Create `artwork` table
  - Create `pages` table
  - Create `page_artwork` table
  - Create `projects` table
  - Create `events` table
  - Create `orders` table
  - Create `order_items` table
- [ ] Create all indexes as specified
- [ ] Create database functions and triggers:
  - `update_updated_at_column()` trigger
  - `generate_order_number()` function
  - `set_order_number()` trigger
  - `decrement_artwork_inventory()` trigger

#### 1.5 Row-Level Security (RLS)

- [ ] Enable RLS on all tables (Enable policy enforcement)
- [ ] Create RLS policies for each table (see architecture-plan.md):
  - Public read policies for published content
  - Admin-only manage policies
  - Proper cascade rules for deletions

#### 1.6 Storage Buckets

- [ ] In Supabase Storage, create buckets:
  - `artwork` (public)
  - `events` (public)
  - `projects` (public)
  - `admin` (private) (I don't know that we'll need this, discuss with me before implementing)
  - `site` (public) (I don't know that we'll need this, discuss with me before implementing)
- [ ] Create storage policies as documented in architecture-plan.md section 5.2

#### 1.7 TypeScript Types

- [ ] Generate types from Supabase: `npx supabase gen types typescript --project-id=your-project-id > src/types/database.ts`
- [ ] Create type files:
  - `src/types/cart.ts` - Cart interfaces
  - `src/types/order.ts` - Order interfaces
  - `src/types/index.ts` - Shared types
- [ ] Set up TypeScript configuration in `tsconfig.json` with proper path aliases

#### 1.8 Supabase Client Setup

- [ ] Create `src/lib/supabase/client.ts` (browser client)
- [ ] Create `src/lib/supabase/server.ts` (server client)
- [ ] Create `src/middleware.ts` for admin authentication

#### 1.9 Git & Deployment Setup

- [x] Initialize git and make first commit
- [x] Create GitHub repository
- [x] Push to GitHub
- [x] Connect Vercel to GitHub repository
- [x] Configure Vercel environment variables (copy from `.env.local`)
- [x] Test that Vercel preview deployment works

#### 1.10 Documentation

- [ ] Document setup process in README
- [ ] Add notes about running locally: `npm run dev`
- [ ] Document how to seed database (for Phase 2)

### Deliverables

- ✅ Working Next.js development environment
- ✅ Complete database with all tables, indexes, and RLS
- ✅ Type-safe Supabase clients
- ✅ Admin auth middleware
- ✅ GitHub repo connected to Vercel
- ✅ Environment variables configured

### Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] Supabase dashboard shows all tables created
- [ ] RLS is enabled on all tables
- [ ] Environment variables are correct
- [ ] Can query database from Next.js (test with simple query)
- [ ] Vercel preview deployment shows working Next.js app

---

## Phase 2: Public Pages (Week 2-3)

### Goal

Build all customer-facing pages with responsive design and optimized images.

### Tasks

#### 2.1 Layout & Navigation

- [ ] Create `src/components/layout/Header.tsx` - Logo and top section
- [ ] Create `src/components/layout/Navigation.tsx` - Main nav with 4 links
- [ ] Create `src/components/layout/Footer.tsx` - Contact info, copyright, socials
- [ ] Create `src/app/layout.tsx` - Root layout with header/nav/footer
- [ ] Implement responsive design (mobile-first)
- [ ] Add Tailwind styling for black/white theme

#### 2.2 Database Queries

- [ ] Create `src/lib/db/artwork.ts` - Query functions for artwork
- [ ] Create `src/lib/db/pages.ts` - Query functions for page content
- [ ] Create `src/lib/db/projects.ts` - Query functions for projects
- [ ] Create `src/lib/db/events.ts` - Query functions for events
- [ ] Implement pagination for large galleries
- [ ] Add proper error handling

#### 2.3 Image Management

- [ ] Create `src/lib/utils/image.ts` - Image URL helpers
- [ ] Create `src/components/artwork/ArtworkImage.tsx` - Optimized image component
- [ ] Configure Next.js image optimization in `next.config.js`
- [ ] Add blur placeholders for lazy loading
- [ ] Test image loading performance

#### 2.4 Home Page

- [ ] Create `src/app/page.tsx` - Home page
- [ ] Build hero section with scroll image
- [ ] Add navigation preview cards for Gallery, Shoppe, In The Works, Contact
- [ ] Display featured artwork samples
- [ ] Implement ISR with `revalidate = 3600`
- [ ] Make fully responsive

#### 2.5 Gallery Page

- [ ] Create `src/app/gallery/page.tsx` - Gallery listing
- [ ] Create gallery grid with thumbnail images
- [ ] Add artwork title and description
- [ ] Create `src/app/gallery/[slug]/page.tsx` - Individual artwork detail
- [ ] Build detailed artwork view (large image, full description, metadata)
- [ ] Add back link to gallery
- [ ] Implement `generateStaticParams()` for dynamic routes
- [ ] Make fully responsive

#### 2.6 Shoppe Page (Without Cart)

- [ ] Create `src/app/shoppe/page.tsx` - Product listing
- [ ] Build product grid with:
  - Thumbnail image
  - Title and description
  - Price display
  - Quantity selector UI (non-functional for now)
  - "Add to Cart" button (non-functional for now)
- [ ] Implement ISR for product listing
- [ ] Make fully responsive
- [ ] Note: Cart functionality added in Phase 3

#### 2.7 In The Works Page

- [ ] Create `src/app/in-the-works/page.tsx`
- [ ] Display projects section with:
  - Project title, description, progress
  - Expected completion date
  - Status (planning, active, completed)
- [ ] Display events section with:
  - Event title, date range, location
  - Booth number, venue details
  - Links to convention website
- [ ] Sort upcoming events first
- [ ] Make fully responsive

#### 2.8 Contact Page (Meet The Artist)

- [ ] Create `src/app/contact/page.tsx`
- [ ] Display "Meet The Artist: [Name]" title
- [ ] Add artist image (left side)
- [ ] Add artist bio/description (right side)
- [ ] Display contact information:
  - Email
  - Social media links
  - Convention booth info
- [ ] Simple contact form (for Phase 4)
- [ ] Make fully responsive (stack on mobile)

#### 2.9 UI Components

- [ ] Create reusable UI components in `src/components/ui/`:
  - `Button.tsx` - Styled button component
  - `Card.tsx` - Content card component
  - `Input.tsx` - Form input component
  - `Grid.tsx` - Responsive grid component
- [ ] Use Tailwind for consistent styling
- [ ] Make all components mobile-responsive

#### 2.10 Testing & Performance

- [ ] Test all pages on mobile, tablet, desktop
- [ ] Test image loading speeds
- [ ] Verify ISR revalidation works
- [ ] Check Core Web Vitals
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Run Lighthouse audit on each page

### Deliverables

- ✅ All public pages fully functional
- ✅ Responsive design across devices
- ✅ Optimized images loading efficiently
- ✅ ISR implemented for fast page loads
- ✅ Accessibility standards met

### Verification Checklist

- [ ] Home page loads with featured artwork
- [ ] Gallery page displays all published artwork
- [ ] Clicking artwork opens detail page
- [ ] Shoppe page displays products with prices
- [ ] In The Works shows projects and upcoming events
- [ ] Contact page displays artist info and links
- [ ] All pages responsive on mobile/tablet/desktop
- [ ] Images load quickly without layout shift
- [ ] Lighthouse score >90

---

## Phase 3: Shopping Cart & Checkout (Week 3-4)

### Goal

Implement complete shopping cart with localStorage persistence, checkout form, and Stripe payment integration.

### Tasks

#### 3.1 Cart State Management

- [ ] Create `src/lib/cart/storage.ts` - localStorage cart management
- [ ] Create `src/hooks/useCart.ts` - Cart hook for components
- [ ] Create `src/context/CartContext.tsx` - React Context for global cart state
- [ ] Implement cart operations:
  - Add item to cart
  - Remove item from cart
  - Update quantity
  - Clear cart
  - Calculate subtotal

#### 3.2 Cart UI Components

- [ ] Create `src/components/cart/CartButton.tsx` - Header cart icon with count
- [ ] Create `src/components/cart/CartDrawer.tsx` - Slide-out cart panel
- [ ] Create `src/components/cart/CartItem.tsx` - Individual item in cart
- [ ] Create `src/components/cart/CartSummary.tsx` - Cart totals summary
- [ ] Add "Add to Cart" functionality on Shoppe page
- [ ] Add cart drawer to header (visible on all pages)
- [ ] Implement smooth animations for drawer open/close

#### 3.3 Cart Page

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

#### 3.4 Checkout Form

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

#### 3.5 Stripe Integration

- [ ] Create `src/lib/payments/stripe.ts` - Stripe client setup
- [ ] Create `src/app/api/checkout/route.ts` - POST endpoint to create payment intent
- [ ] Install Stripe Elements components
- [ ] Implement Stripe Payment Element in checkout form
- [ ] Handle payment submission and client secret
- [ ] Add error handling for payment failures
- [ ] Add loading states during payment processing

#### 3.6 Cart Validation

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

#### 3.7 Order Creation

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

#### 3.8 Stripe Webhook

- [ ] Create `src/app/api/checkout/webhook/route.ts` - Webhook handler
- [ ] Listen for `payment_intent.succeeded` event
- [ ] Verify webhook signature
- [ ] Update order status to "paid" when payment succeeds
- [ ] Handle `payment_intent.payment_failed` for failed payments
- [ ] Log all webhook events for debugging

#### 3.9 Order Confirmation

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

#### 3.10 Error Handling

- [ ] Create `src/app/shoppe/checkout/cancelled/page.tsx` - Cancelled page
- [ ] Handle payment cancellation
- [ ] Handle validation errors
- [ ] Handle Stripe errors
- [ ] Add user-friendly error messages
- [ ] Log errors for admin review

#### 3.11 Testing

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

## Phase 4: Admin System (Week 4-5)

### Goal

Build complete admin dashboard for content management, order management, and image uploads.

### Tasks

#### 4.1 Admin Authentication

- [ ] Set up Supabase Auth in dashboard
- [ ] Create first admin user in administrators table
- [ ] Create `src/app/admin/login/page.tsx` - Admin login page
- [ ] Create login form with email/password
- [ ] Implement Supabase Auth signIn
- [ ] Redirect authenticated users to dashboard
- [ ] Add logout functionality

#### 4.2 Admin Middleware & Protection

- [ ] Implement middleware to protect `/admin` routes
- [ ] Check user authentication
- [ ] Verify user is in administrators table with is_active = true
- [ ] Redirect unauthenticated users to login
- [ ] Add role-based access control (admin vs super_admin)

#### 4.3 Admin Layout

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

#### 4.4 Admin Dashboard

- [ ] Create `src/app/admin/page.tsx` - Main dashboard
- [ ] Display key metrics:
  - Total orders (all time)
  - Orders this month
  - Total revenue
  - Pending orders
- [ ] Quick links to manage content
- [ ] Recent orders list (last 10)
- [ ] System status indicators

#### 4.5 Artwork Management

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

#### 4.6 Image Upload

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

#### 4.7 Order Management

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

#### 4.8 Projects & Events Management

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

#### 4.9 Settings & Admin Users (Super Admin Only)

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

#### 4.10 API Routes for Admin

- [ ] Create `/api/admin/artwork/*` routes for CRUD
- [ ] Create `/api/admin/orders/*` routes for reading/updating
- [ ] Create `/api/admin/projects/*` routes for CRUD
- [ ] Create `/api/admin/events/*` routes for CRUD
- [ ] Create `/api/admin/settings/*` routes
- [ ] All routes protected by admin auth middleware
- [ ] Add proper error handling and validation

#### 4.11 Caching & Revalidation

- [ ] Create `src/app/api/admin/revalidate/route.ts` - On-demand revalidation
- [ ] Trigger revalidation when content changes:
  - After artwork created/updated
  - After projects/events updated
  - After pages updated
- [ ] Use Next.js `revalidatePath` and `revalidateTag`

#### 4.12 Testing

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

## Phase 5: Email & Polish (Week 5-6)

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

### Phase 6: Analytics & Monitoring (Week 7-8)

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

| Phase   | Duration | Focus                 | Status             |
| ------- | -------- | --------------------- | ------------------ |
| Phase 1 | Week 1-2 | Foundation & Database | Ready to start     |
| Phase 2 | Week 2-3 | Public Pages          | Depends on Phase 1 |
| Phase 3 | Week 3-4 | Cart & Checkout       | Depends on Phase 2 |
| Phase 4 | Week 4-5 | Admin System          | Depends on Phase 3 |
| Phase 5 | Week 5-6 | Email & Launch        | Depends on Phase 4 |

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

