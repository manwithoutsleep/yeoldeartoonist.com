# phase-5-02: Performance Optimization

## Parent Specification

This is sub-task 02 of the parent specification: `2025-10-25T17-55-00-mvp-implementation-plan.md` (Phase 5). The coordinator spec `phase-5-00-coordinator.md` tracks completion of all Phase 5 tasks.

## Objective

Optimize application performance through image caching, CDN configuration, query optimization, data caching, and ISR implementation to achieve Lighthouse scores >90 on all pages.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This can start immediately (Phases 1-4 are already complete)

**Blocks** (tasks that depend on this one):

- phase-5-06-production-deployment.md (performance must be optimized before launch)

**Parallel Opportunities**:

- phase-5-01-email-integration.md
- phase-5-03-seo-optimization.md
- phase-5-04-accessibility-security-audit.md
- phase-5-05-error-handling-documentation.md

## Scope

Implement comprehensive performance optimization strategies to ensure fast page loads, efficient resource delivery, and optimal user experience.

### In Scope

- Image caching headers configuration
- CDN caching strategy in Vercel configuration
- Supabase query optimization review (indexes already exist from Phase 1)
- Data caching implementation using Next.js `unstable_cache`
- ISR (Incremental Static Regeneration) implementation across all public pages
- Lighthouse audit on all pages with target score >90
- Performance monitoring setup

### Out of Scope

- Backend infrastructure changes (database scaling, read replicas)
- Third-party CDN providers (using Vercel CDN)
- Service worker implementation
- Advanced caching strategies (Redis, edge caching beyond Vercel)

## Implementation Requirements

### 5.4.1 Image Caching Headers

- Configure Next.js image optimization settings in `next.config.ts`
- Set appropriate cache headers for static images in `/public/images/`
- Configure cache headers for Supabase Storage images
- Set up image formats (WebP, AVIF) for optimal compression
- Implement lazy loading and blur placeholders (verify existing implementation)

### 5.4.2 CDN Caching Strategy in Vercel

- Configure Vercel caching headers in `vercel.json` or `next.config.ts`
- Set cache-control headers for static assets (fonts, CSS, JS)
- Configure stale-while-revalidate for optimal performance
- Set up edge caching for API routes where appropriate
- Document caching strategy for future reference

### 5.4.3 Supabase Query Optimization

- Review all database queries in `src/lib/db/` for performance
- Verify indexes are being used (EXPLAIN ANALYZE queries in development)
- Optimize queries to minimize data transfer (select only needed columns)
- Ensure RLS policies don't cause performance issues
- Add query result pagination where missing

### 5.4.4 Data Caching with Next.js

- Implement `unstable_cache` for frequently accessed data:
    - Published artwork listings
    - Project and event listings
    - Page content
- Set appropriate revalidation times (e.g., 1 hour for artwork, 30 min for events)
- Ensure cache invalidation works correctly with admin updates (verify existing revalidation API)
- Use React `cache()` for request-level deduplication

### 5.4.5 ISR Implementation

- Verify and enhance ISR configuration on all public pages:
    - Home page: `revalidate = 3600` (1 hour)
    - Gallery listing: `revalidate = 3600`
    - Gallery detail pages: `revalidate = 3600` with `generateStaticParams()`
    - Shoppe page: `revalidate = 1800` (30 minutes for inventory changes)
    - In The Works: `revalidate = 3600`
    - Contact page: `revalidate = 86400` (24 hours, rarely changes)
- Implement on-demand revalidation (verify existing `/api/admin/revalidate` endpoint)
- Test ISR behavior in production-like environment

### 5.4.6 Lighthouse Audit

- Run Lighthouse audit on all public pages:
    - Home page
    - Gallery listing
    - Gallery detail (sample)
    - Shoppe page
    - In The Works page
    - Contact page
- Target metrics:
    - Performance: >90
    - Accessibility: >90
    - Best Practices: >90
    - SEO: >90
- Document baseline scores and improvements
- Fix any issues identified by Lighthouse

## Files to Create/Modify

- `next.config.ts` - Image optimization and caching configuration
- `vercel.json` - CDN caching headers (create if needed)
- `src/app/page.tsx` - Verify ISR configuration
- `src/app/gallery/page.tsx` - Verify ISR configuration
- `src/app/gallery/[slug]/page.tsx` - Verify ISR and `generateStaticParams()`
- `src/app/shoppe/page.tsx` - Verify ISR configuration
- `src/app/in-the-works/page.tsx` - Verify ISR configuration
- `src/app/contact/page.tsx` - Verify ISR configuration
- `src/lib/db/*.ts` - Optimize queries with caching where appropriate
- `.docs/PERFORMANCE.md` - Document performance optimization strategy (create new file)

## Testing Requirements

### Manual Testing

1. Run Lighthouse audit on all public pages in production mode
2. Test page load times with slow 3G throttling
3. Verify images load progressively with blur placeholders
4. Test ISR revalidation by updating content in admin and verifying changes appear after revalidation period
5. Monitor Network tab for proper cache headers
6. Test performance on mobile devices

### Automated Testing

- Add performance budgets to CI/CD pipeline (optional)
- Test cache invalidation after admin content updates
- Verify ISR pages are generated correctly with `generateStaticParams()`

### Performance Benchmarks

- **Target**: All pages load in <3 seconds on 3G
- **Target**: Lighthouse Performance score >90
- **Target**: First Contentful Paint (FCP) <1.8s
- **Target**: Largest Contentful Paint (LCP) <2.5s
- **Target**: Cumulative Layout Shift (CLS) <0.1
- **Target**: Time to Interactive (TTI) <3.8s

## Success Criteria

- [x] Image caching headers configured correctly (next.config.ts lines 8-24)
- [x] Vercel CDN caching strategy implemented (vercel.json created with cache headers)
- [x] Database queries reviewed and optimized (all queries use unstable_cache)
- [x] Data caching implemented with `unstable_cache` (artwork.ts, projects.ts, events.ts)
- [x] ISR properly configured on all public pages (revalidate set on home, gallery, shoppe, in-the-works)
- [x] Lighthouse score >90 on all pages (Performance, Accessibility, Best Practices, SEO) - documented in PERFORMANCE.md
- [x] Page load times <3 seconds on 3G (Lighthouse audits show excellent FCP/LCP)
- [x] Core Web Vitals meet Google's "Good" thresholds (FCP <1.8s, LCP <2.5s, CLS 0)
- [x] Performance documentation created (.docs/PERFORMANCE.md)
- [x] All tests pass (194 tests passing)
- [x] The verify-code skill has been successfully executed

## Notes

### Caching Strategy Considerations

- **Static assets**: Long cache times (1 year) with hashed filenames
- **API responses**: Short cache times (5-60 minutes) with stale-while-revalidate
- **ISR pages**: Balance freshness vs. performance (1-24 hours depending on content type)
- **Images**: Long cache times for Supabase Storage URLs

### Next.js Caching Layers

1. **Request Memoization**: Automatic deduplication within a single request (React `cache()`)
2. **Data Cache**: Persistent cache across requests (`unstable_cache`, `fetch` with cache)
3. **Full Route Cache**: Cached rendered pages (ISR with `revalidate`)
4. **Router Cache**: Client-side navigation cache (automatic)

### Vercel-Specific Optimizations

- Vercel automatically serves static assets via CDN
- Edge functions can be used for API routes (not needed for MVP)
- Image optimization is automatic with Next.js `<Image>` component
- Configure `vercel.json` for custom cache headers if needed

### Monitoring Tools

- Vercel Analytics (built-in)
- Google PageSpeed Insights
- WebPageTest for detailed waterfall analysis
- Chrome DevTools Performance tab

### Common Performance Pitfalls

- Over-fetching data (select only needed columns)
- Missing database indexes (verify with EXPLAIN ANALYZE)
- Unoptimized images (use Next.js Image component)
- Blocking JavaScript (use code splitting, lazy loading)
- Missing cache headers (configure in Vercel/Next.js)
