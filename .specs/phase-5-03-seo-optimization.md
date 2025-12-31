# phase-5-03: SEO Optimization

## Parent Specification

This is sub-task 03 of the parent specification: `2025-10-25T17-55-00-mvp-implementation-plan.md` (Phase 5). The coordinator spec `phase-5-00-coordinator.md` tracks completion of all Phase 5 tasks.

## Objective

Implement comprehensive SEO optimization including metadata, Open Graph tags, sitemaps, robots.txt, and structured data to improve search engine visibility and social media sharing.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This can start immediately (Phases 1-4 are already complete)

**Blocks** (tasks that depend on this one):

- phase-5-06-production-deployment.md (SEO must be complete before launch)

**Parallel Opportunities**:

- phase-5-01-email-integration.md
- phase-5-02-performance-optimization.md
- phase-5-04-accessibility-security-audit.md
- phase-5-05-error-handling-documentation.md

## Scope

Implement SEO best practices across all public pages to ensure optimal search engine indexing and social media sharing.

### In Scope

- Meta titles and descriptions for all pages
- Open Graph images and metadata for social sharing
- Canonical URLs to prevent duplicate content issues
- `robots.txt` configuration
- `sitemap.xml` generation (dynamic or static)
- Structured data (Schema.org) for products and organization
- Image alt text optimization
- Meta tags in Next.js metadata API

### Out of Scope

- Paid search advertising (Google Ads, etc.)
- Link building campaigns
- Keyword research and content strategy
- Analytics integration (Google Analytics, Search Console)
- International SEO (hreflang tags)
- Advanced schema types (reviews, events, etc.)

## Implementation Requirements

### 5.5.1 Page Metadata

Add comprehensive metadata to all public pages using Next.js 14+ Metadata API:

**Home Page** (`src/app/page.tsx`):

- Title: "Ye Olde Artoonist - Original Art & Prints by [Artist Name]"
- Description: Concise description of the artist and offerings
- Keywords: Relevant art-related keywords
- Open Graph image: Featured artwork or hero image

**Gallery Page** (`src/app/gallery/page.tsx`):

- Title: "Gallery - Ye Olde Artoonist"
- Description: "Browse original artwork and illustrations by [Artist Name]"
- Open Graph: Gallery preview image

**Gallery Detail Pages** (`src/app/gallery/[slug]/page.tsx`):

- Dynamic title: "[Artwork Title] - Ye Olde Artoonist"
- Dynamic description: First 160 characters of artwork description
- Open Graph: Artwork image URL
- Use `generateMetadata()` for dynamic content

**Shoppe Page** (`src/app/shoppe/page.tsx`):

- Title: "Shop Art Prints - Ye Olde Artoonist"
- Description: "Purchase original art and prints"
- Open Graph: Featured shop image

**In The Works Page** (`src/app/in-the-works/page.tsx`):

- Title: "Projects & Events - Ye Olde Artoonist"
- Description: "Upcoming projects, commissions, and convention appearances"

**Contact Page** (`src/app/contact/page.tsx`):

- Title: "Contact [Artist Name] - Ye Olde Artoonist"
- Description: "Get in touch with [Artist Name] for commissions and inquiries"

### 5.5.2 Open Graph & Social Media

Implement Open Graph tags for all pages:

- `og:title`
- `og:description`
- `og:image` (1200x630px recommended)
- `og:url`
- `og:type` (website, article, product)
- `og:site_name`

Add Twitter Card metadata:

- `twitter:card` (summary_large_image)
- `twitter:title`
- `twitter:description`
- `twitter:image`
- `twitter:creator` (if Twitter handle available)

### 5.5.3 Canonical URLs

- Add canonical URL to all pages to prevent duplicate content issues
- Use production domain URL (e.g., `https://yeoldeartoonist.com/gallery`)
- Implement in Next.js metadata API

### 5.5.4 Robots.txt

Create `public/robots.txt`:

```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /shoppe/checkout/

Sitemap: https://yeoldeartoonist.com/sitemap.xml
```

### 5.5.5 Sitemap.xml

Generate dynamic sitemap using Next.js sitemap.ts:

Create `src/app/sitemap.ts` with:

- Home page
- Gallery page
- All published artwork (dynamic from database)
- Shoppe page
- In The Works page
- Contact page

Set appropriate `lastmod`, `changefreq`, and `priority` values:

- Homepage: priority 1.0, changefreq weekly
- Gallery/Shoppe: priority 0.9, changefreq daily
- Individual artwork: priority 0.8, changefreq monthly
- Static pages: priority 0.7, changefreq monthly

### 5.5.6 Structured Data (Schema.org)

Implement JSON-LD structured data:

**Organization Schema** (on all pages):

```json
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ye Olde Artoonist",
    "url": "https://yeoldeartoonist.com",
    "logo": "https://yeoldeartoonist.com/images/logo.jpg",
    "sameAs": ["https://instagram.com/...", "https://facebook.com/..."]
}
```

**Product Schema** (on Shoppe items with `is_for_sale = true`):

```json
{
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Artwork Title",
    "image": "artwork-url",
    "description": "artwork description",
    "offers": {
        "@type": "Offer",
        "price": "29.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
    }
}
```

**WebPage Schema** (on all pages):

```json
{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Title",
    "description": "Page description",
    "url": "https://yeoldeartoonist.com/page-path"
}
```

### 5.5.7 Image Alt Text

- Review all images for proper alt text
- Alt text should be descriptive and concise
- Don't use "image of" or "picture of" - just describe the content
- Leave alt empty for decorative images (alt="")

## Files to Create/Modify

- `src/app/page.tsx` - Add metadata export
- `src/app/gallery/page.tsx` - Add metadata export
- `src/app/gallery/[slug]/page.tsx` - Add `generateMetadata()` function
- `src/app/shoppe/page.tsx` - Add metadata export
- `src/app/in-the-works/page.tsx` - Add metadata export
- `src/app/contact/page.tsx` - Add metadata export
- `src/app/layout.tsx` - Update root metadata with defaults
- `src/app/sitemap.ts` - Create dynamic sitemap
- `public/robots.txt` - Create robots.txt file
- `src/lib/seo/structured-data.ts` - Helper functions for JSON-LD (create new file)
- `src/components/seo/StructuredData.tsx` - Component for rendering JSON-LD (create new file)

## Testing Requirements

### Manual Testing

1. Verify all pages have proper meta titles and descriptions
2. Test Open Graph tags using Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
3. Test Twitter Cards using Twitter Card Validator: https://cards-dev.twitter.com/validator
4. Verify `robots.txt` is accessible at `/robots.txt`
5. Verify `sitemap.xml` is accessible at `/sitemap.xml` and contains all pages
6. Test structured data using Google Rich Results Test: https://search.google.com/test/rich-results
7. Check canonical URLs are correct on all pages
8. Run Lighthouse SEO audit (target >90)

### Automated Testing

- Add tests for metadata generation
- Test sitemap.ts generates correct URLs
- Verify structured data JSON-LD is valid
- Test that all images have alt attributes

## Success Criteria

- [ ] All pages have unique, descriptive meta titles and descriptions (only root layout has default metadata)
- [ ] Open Graph tags implemented on all pages (only root layout, need page-level exports)
- [ ] Twitter Card tags implemented (only root layout, need page-level exports)
- [ ] Canonical URLs configured correctly (metadataBase exists but needs verification per page)
- [ ] `robots.txt` created and accessible (no public/robots.txt found)
- [ ] `sitemap.xml` generated dynamically with all public pages (no src/app/sitemap.ts found)
- [ ] Structured data (Schema.org) implemented for Organization, Product, and WebPage (not found)
- [ ] All images have appropriate alt text (not verified)
- [ ] Lighthouse SEO score >90 on all pages (not tested/documented)
- [ ] Open Graph and Twitter Card validators pass (not tested)
- [ ] Google Rich Results Test passes for structured data (no structured data to test)
- [ ] All tests pass
- [ ] The verify-code skill has been successfully executed

## Notes

### SEO Best Practices

- **Title tags**: Keep under 60 characters to avoid truncation in search results
- **Meta descriptions**: Keep between 150-160 characters for optimal display
- **Open Graph images**: Use 1200x630px for best results across platforms
- **Structured data**: Validate with Google's Rich Results Test before deploying
- **Canonical URLs**: Always use absolute URLs (https://domain.com/path)

### Next.js Metadata API

Next.js 14+ uses the Metadata API for SEO:

```typescript
export const metadata: Metadata = {
    title: 'Page Title',
    description: 'Page description',
    openGraph: {
        title: 'OG Title',
        description: 'OG Description',
        images: ['/og-image.jpg'],
    },
};
```

For dynamic pages, use `generateMetadata()`:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
    const artwork = await getArtwork(params.slug);
    return {
        title: artwork.title,
        description: artwork.description,
    };
}
```

### Common SEO Mistakes to Avoid

- Duplicate meta descriptions across pages
- Missing or generic page titles
- No alt text on images
- Broken canonical URLs
- Missing or incorrect Open Graph images
- Invalid structured data markup
- Blocking important pages in robots.txt
- Missing sitemap or outdated sitemap

### Social Media Sharing

When someone shares a page on social media, the platform scrapes:

1. Open Graph tags (Facebook, LinkedIn)
2. Twitter Card tags (Twitter/X)
3. Fallback to meta description if OG tags missing

Test sharing on multiple platforms to ensure proper preview display.

### Schema.org Resources

- Schema.org documentation: https://schema.org/
- Google's Structured Data Guidelines: https://developers.google.com/search/docs/appearance/structured-data
- JSON-LD generator tools for testing
