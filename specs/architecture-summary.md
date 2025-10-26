# Architecture Plan Summary - Quick Reference

**Full Details:** See `architecture-plan.md`

## Key Architectural Decisions

### 1. Database Schema Improvements

**Major Changes from Original:**
- Changed `id` from `int` to `UUID` (better for distributed systems)
- Added `slug` fields for SEO-friendly URLs
- Added inventory management (`inventory_count`, `sku`)
- Added publication workflow (`is_published`, `display_order`)
- Added **NEW tables:** `orders` and `order_items` (essential for e-commerce)
- Added proper indexes for performance
- Implemented Row-Level Security (RLS) policies

**Critical Addition - Order Tables:**
The original schema was missing order/transaction tracking. Added:
- `orders` - Stores customer info, shipping, totals, payment status
- `order_items` - Stores individual items with price snapshots

### 2. Shopping Cart Security Architecture

**Recommended Approach: Hybrid Storage**

**Client-Side (Browsing):**
- Store cart in localStorage for persistence
- No sensitive data, just artwork IDs and quantities
- Fast, works offline

**Server-Side (Checkout):**
- Transfer to encrypted server session at checkout
- Validate against database (prices, inventory)
- Generate secure order record
- Use Stripe for payment (PCI compliant)

**Security Features:**
- Input validation with Zod
- Server-side cart validation before checkout
- CSRF protection via SameSite cookies
- Rate limiting on checkout endpoints
- Never store credit card data

### 3. Code Structure

**Folder Highlights:**
```
src/
├── app/                    # Next.js App Router
│   ├── (public pages)      # Home, Gallery, Shoppe, etc.
│   ├── admin/              # Protected admin dashboard
│   └── api/                # API routes
│
├── components/
│   ├── layout/             # Header, Footer, Navigation
│   ├── artwork/            # Art display components
│   ├── cart/               # Shopping cart UI
│   └── admin/              # Admin components
│
├── lib/
│   ├── supabase/           # Database clients
│   ├── db/                 # Query functions
│   ├── payments/           # Stripe integration
│   └── cart/               # Cart logic
│
└── types/                  # TypeScript definitions
```

### 4. Authentication & Admin

**Strategy:**
- Supabase Auth for admin users only
- Email/password authentication
- Role-based access control (admin vs super_admin)
- Middleware-protected admin routes
- No customer accounts (MVP decision)

**Key Files:**
- `src/middleware.ts` - Route protection
- `src/lib/auth/permissions.ts` - RBAC logic
- `src/app/admin/layout.tsx` - Admin wrapper

### 5. Image Management

**Storage Strategy:**
- Supabase Storage with organized buckets
- Generate 4 variants: original, large, preview, thumbnail
- Use WebP format for optimization
- Next.js Image component for responsive loading

**Optimization:**
- Auto-generate optimized variants on upload
- Serve via CDN (Supabase CDN)
- Lazy loading with blur placeholder
- Responsive srcset

### 6. Performance Strategy

**Three-Layer Approach:**

1. **ISR (Incremental Static Regeneration)**
   - Revalidate pages every hour
   - Pre-generate artwork detail pages
   - Instant page loads

2. **Caching**
   - CDN caching for static assets
   - Next.js data cache for queries
   - On-demand revalidation from admin

3. **Query Optimization**
   - Database indexes on frequently queried fields
   - Select only needed columns
   - Batch operations where possible

## Technology Stack

**Core:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database + Auth + Storage)

**E-commerce:**
- Stripe (Payments)
- Zod (Validation)
- localStorage (Cart)

**Image Processing:**
- Sharp (Server-side optimization)
- Next.js Image (Delivery)
- WebP (Format)

## Implementation Timeline

**6-Week MVP Schedule:**

1. **Week 1-2:** Foundation - Setup project, database schema, basic structure
2. **Week 2-3:** Public Pages - Build all customer-facing pages
3. **Week 3-4:** Shopping Cart - Implement cart and checkout with Stripe
4. **Week 4-5:** Admin System - Build content management dashboard
5. **Week 5-6:** Polish & Launch - Optimize, test, deploy

## Critical Success Factors

### Must-Have for MVP:
1. All database tables created with proper relationships
2. RLS policies configured for security
3. Stripe webhook configured for payment confirmation
4. Admin authentication working
5. Image optimization pipeline functional

### Common Pitfalls to Avoid:
1. Don't skip RLS policies - security risk
2. Don't store unvalidated cart data - validate on server before checkout
3. Don't forget to handle inventory (decrement on purchase)
4. Don't skip webhook signature verification
5. Don't store sensitive payment data - let Stripe handle it

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Admin routes protected by middleware
- [ ] Input validation on all API routes (use Zod)
- [ ] Stripe webhook signature verification
- [ ] Environment variables properly secured
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CSRF protection (SameSite cookies)
- [ ] Rate limiting on checkout endpoint

## Scalability Notes

**MVP Will Handle:**
- 1,000+ artworks
- 100+ orders/day
- 10,000+ monthly visitors

**When to Upgrade:**
- Database: Add read replicas at >10k orders/month
- Storage: Migrate to CloudFlare R2 at >100GB
- Search: Add Algolia at >5k artworks
- Queue: Add BullMQ at >1k orders/day

## Next Steps

1. Review this architecture plan
2. Set up Supabase project
3. Create database schema (use SQL from architecture-plan.md)
4. Initialize Next.js project
5. Follow Phase 1 implementation tasks

## Decisions Made

### Payment Methods - DECIDED ✓

**Selected: All standard Stripe payment methods**

Why this approach:
- Single integration supports cards, Apple Pay, Google Pay, Link
- No additional code complexity - Stripe handles UI/UX
- Higher conversion rates (10-30% improvement with digital wallets)
- Same processing fees for standard methods (2.9% + $0.30)
- Mobile experience improved (critical for art buyers on Instagram/social)
- Future-proof: new payment methods appear automatically in Stripe dashboard

Implementation: Use Stripe Payment Element component (supports all methods automatically)

**To enable LATER (when average order value justifies):**
- Afterpay/Klarna for BNPL (~6% fee, customer pays it, good for $200+ pieces)

### Shipping - DECIDED ✓

**Selected: Flat rate shipping**

Why this approach:
- Simplicity: Single database field, no complex logic
- Perfect for art (lightweight, predictable weight)
- Transparent to customers, no surprises at checkout
- Fast checkout (no calculation API calls)
- Easy to adjust rate later based on data
- Takes 5 minutes to implement

Implementation: Add `shipping_cost` column to `orders` table (default $5.00, configurable in admin)

**To upgrade LATER (if complexity justifies):**
- Integrate EasyPost or Shippo when shipping international or with varied weights
- Customer demand warrants real carrier rates
- MVP data shows need for it

### Tax Calculation - DECIDED ✓

**Selected: Stripe Tax**

Why this approach:
- Sales tax is genuinely complex (nexus rules, category exemptions, multi-state, international)
- Stripe Tax handles all compliance automatically
- Single API integration (already using Stripe for payments)
- Handles digital vs physical goods differently
- Automatically updates for regulation changes
- Removes tax compliance liability from Joe
- Worth the small additional fee (~0.5% of transaction value)

Implementation: Enable Stripe Tax in Stripe dashboard, pass product tax codes to Stripe API during checkout

Benefits:
- No custom tax logic to maintain
- Compliance handled by Stripe (they have legal team)
- Accurate tax collection by jurisdiction
- Scales internationally if Joe expands later

---

## Questions to Consider

Before starting implementation:

1. ~~What payment methods?~~ **DECIDED: All Stripe standard methods**
2. ~~Shipping calculation?~~ **DECIDED: Flat rate**
3. ~~Tax calculation?~~ **DECIDED: Stripe Tax**
4. ~~Order notification email service?~~ **DECIDED: Resend**
5. ~~Domain and hosting?~~ **DECIDED: Vercel + Porkbun DNS**

### Email Notifications - DECIDED ✓

**Selected: Resend**

Why:
- Built for transactional emails (order confirmations, receipts)
- Simple API, excellent Next.js integration
- ~$0.20 per email (very cost-effective)
- Easy template management
- No approval delays or delivery issues

Implementation: Resend SDK in checkout API route, email templates for order confirmations

### Hosting & Domain - DECIDED ✓

**Selected: Vercel hosting + Porkbun domain**

Setup:
- Deploy Next.js project to Vercel (automatic CI/CD from git)
- Domain already purchased at Porkbun
- Configure DNS at Porkbun to point to Vercel nameservers
- SSL/TLS handled automatically by Vercel

Benefits:
- Zero-config deployment for Next.js
- Automatic preview deployments for PRs
- Global CDN for static assets and images
- Environment variables managed in Vercel dashboard

## Cost Breakdown

### Monthly Recurring Costs

**Developer's Costs:**
| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20/month | Required for commercial site (auto-scaling, CDN) |
| Supabase Pro | $25/month | Only when free tier limits hit (likely 3-6 months in) |
| Resend | Free tier (3k emails/month) | Paid tier ~$20/month after scaling |
| **Total** | **$20-65/month** | Scales with site growth |

**Joe's Costs (Stripe fees - Joe pays these):**
- ~2.9% + $0.30 per transaction (payment processing)
- ~0.5% for tax calculation (Stripe Tax)
- Credit card processing is automatic from customer purchases

**Free/Already Purchased:**
- Porkbun domain (already purchased)
- Supabase free tier for dev/staging (no additional cost)
- Vercel preview deployments (included in Pro)
- SSL/TLS certificates (automatic with Vercel)

### Storage Costs (Likely Later)

**Supabase Storage Upgrade Path:**
- Free tier: 1GB storage
- Pro tier: Scales based on usage (~$0.15/GB beyond included storage)
- **Expected timeline:** MVP launch with <100 pieces = no upgrades needed for 3-6+ months

**Alternative if Storage Gets Expensive:**
- Migrate images to Cloudflare R2: $0.015/GB/month (significant savings at scale)
- Keep database on Supabase, move just image storage

### Cost Optimization Strategy

**MVP Launch (Month 1-2):**
- Vercel Pro: $20/month (required)
- Supabase Free: $0
- Resend Free: $0
- **Total: $20/month**

**After Initial Growth (Month 3-6):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month (when you hit free tier limits)
- Resend Free: $0 (still under 3k/month)
- **Total: $45/month**

**As Business Scales (Month 6+):**
- Revisit based on actual usage data
- Only upgrade services that are genuinely constrained
- Consider R2 migration if storage becomes expensive

### When to Upgrade What

- **Supabase:** When you hit storage limits or experience query slowdowns (visible in Supabase dashboard)
- **Resend:** Only when exceeding 3,000 emails/month (order confirmations + potential newsletters)
- **Vercel:** Pro plan is sufficient for years; only upgrade for custom domains/enterprise features
- **Storage:** Migrate to R2 when Supabase storage costs exceed $50/month

**Key Principle:** Start lean, upgrade only when data shows you need to. Most services provide clear usage dashboards so you'll know exactly when to make the jump.

---

## Reference Files

- `architecture-plan.md` - Complete detailed plan
- `2025-10-25T11-09-00-initial-plan-discussion.md` - Original requirements

---

**Ready to build?** Start with Phase 1: Foundation
