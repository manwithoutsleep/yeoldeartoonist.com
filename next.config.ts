import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /**
     * Image Optimization
     * Enable AVIF format support and optimize image delivery
     */
    images: {
        formats: ['image/avif', 'image/webp'],
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
    experimental: {
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
};

export default nextConfig;
