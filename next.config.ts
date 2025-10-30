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
};

export default nextConfig;
