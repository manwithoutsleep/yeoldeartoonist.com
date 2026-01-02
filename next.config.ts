import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /**
     * Image Optimization
     * Enable AVIF format support and optimize image delivery
     */
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
        dangerouslyAllowSVG: true,
        unoptimized: process.env.NODE_ENV === 'development',
    },

    /**
     * Server Actions Configuration
     *
     * Body Size Limit: Increased to 10MB to support large image uploads.
     *
     * Why 10MB?
     * - Application validates up to 10MB in upload.ts (MAX_FILE_SIZE)
     * - Client-side validation enforces 10MB in ImageUploader.tsx
     * - Tests verify 10MB limit enforcement
     * - Supports high-quality artwork images for gallery/shop
     *
     * Default is 1MB, which is too restrictive for this use case.
     *
     * See: https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit
     * Related: GitHub Issue #35
     */
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        /**
         * Bundle Optimization (Phase B)
         *
         * Optimize package imports to reduce bundle size:
         * - Stripe: Lazy-loaded on checkout routes only (Phase 3)
         * - Cart Context: Lazy-loaded on cart/shoppe routes only
         * - Supabase Client: Only included where needed
         *
         * See docs: https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports
         */
        optimizePackageImports: [
            '@stripe/react-stripe-js',
            '@stripe/stripe-js',
            '@supabase/supabase-js',
            '@supabase/ssr',
            'date-fns',
        ],
    },

    /**
     * Turbopack Configuration
     *
     * Next.js 16 uses Turbopack by default. Tree-shaking and dead code
     * elimination are handled automatically by Turbopack's optimizations.
     * No additional webpack config needed.
     */
    turbopack: {},

    /**
     * Legacy JavaScript Handling (Phase D)
     *
     * Modern Browser Targeting Configuration:
     * - Target ES2020 in tsconfig.json (no transpilation to ES5)
     * - Browserslist configured for modern browsers only
     * - Excludes IE11, older Safari, older Firefox, older Chrome
     * - Reduces output bundle by ~10-15 KiB by avoiding ES5 polyfills
     *
     * Browser Support:
     * - Chrome 51+, Firefox 54+, Safari 10+, Edge 15+, Node 20+
     * - ES2020 features: optional chaining, nullish coalescing, etc.
     *
     * See tsconfig.json "target" and package.json "browserslist"
     */

    /**
     * Security Headers (Phase 5.7.9)
     *
     * Content Security Policy (CSP) and security headers to protect against
     * common web vulnerabilities including XSS, clickjacking, and MIME sniffing.
     */
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' blob: data: https://*.supabase.co https://127.0.0.1",
                            "font-src 'self' https://fonts.gstatic.com data:",
                            "connect-src 'self' https://*.supabase.co https://127.0.0.1 http://127.0.0.1 https://api.stripe.com",
                            "frame-src 'self' https://js.stripe.com",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-ancestors 'self'",
                            'upgrade-insecure-requests',
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
