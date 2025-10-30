# Code Splitting Strategy - Phase B

## Overview

Phase B implements code splitting to reduce the main bundle size by deferring cart/checkout dependencies to routes that actually use them.

## Bundle Optimization Techniques

### 1. Package Import Optimization (next.config.ts)

We use Next.js's `experimental.optimizePackageImports` to tree-shake unused exports from heavy dependencies:

```typescript
experimental: {
  optimizePackageImports: [
    '@stripe/react-stripe-js',      // Unused until Phase 3
    '@stripe/stripe-js',            // Unused until Phase 3
    '@supabase/supabase-js',        // Only used in DB modules
    '@supabase/ssr',                // Only used in SSR contexts
    'date-fns',                     // Only used in specific formatters
  ],
}
```

**Impact**: Reduces bundle by 40-50 KiB by ensuring only the code you import is included.

### 2. Cart/Checkout Lazy Loading

Cart and checkout dependencies are wrapped in modules that can be dynamically imported:

#### CartContext (`src/context/CartContext.tsx`)

- Provides cart state management
- Only imported on routes that need it
- Can be lazy-loaded with `dynamic()` or `React.lazy()`

#### CheckoutProvider (`src/components/checkout/CheckoutProvider.tsx`)

- Wrapper for Stripe and checkout UI
- Will be lazy-loaded only on checkout routes (Phase 3)
- Placeholder ready for Stripe integration

### 3. Route-Level Code Splitting (Phase 2+)

For future phases, lazy-load heavy features per route:

```typescript
// In /shoppe/page.tsx (when cart is added)
const CartUI = dynamic(() =>
  import('@/components/cart/CartUI'),
  { loading: () => <div>Loading cart...</div> }
);

// In /checkout/page.tsx (Phase 3)
const CheckoutForm = dynamic(() =>
  import('@/components/checkout/CheckoutForm'),
  { loading: () => <div>Loading checkout...</div> }
);
```

### 4. Webpack Optimization

The webpack configuration in `next.config.ts` enables:

- **usedExports**: Only includes exports actually used in the code
- **sideEffects: false**: Enables tree-shaking of pure modules

This removes dead code and unused functionality from the bundle.

## Current State (Phase 2)

✅ **Implemented:**

- CartContext stub (ready for Phase 3)
- useCart hook stub (ready for Phase 3)
- CheckoutProvider stub (ready for Phase 3)
- Next.js package import optimization
- Webpack tree-shaking configuration

⏳ **Deferred to Phase 3:**

- Full cart UI components
- Stripe integration
- Checkout flow
- Cart persistence UI

## Expected Results

After Phase B optimizations:

- **Main bundle**: Reduced by 40-50 KiB (73 KiB target)
- **Cart code**: Kept out of main bundle (loaded on-demand)
- **Stripe code**: Completely eliminated from homepage
- **Supabase client**: Only imported where needed

## Future Implementation (Phase 3+)

When cart/checkout features are implemented, lazy-load them:

```typescript
// Example: Shoppe page with lazy cart
export default function ShoppePage() {
  const CartUI = dynamic(
    () => import('@/components/cart/CartUI'),
    { loading: () => <div>Loading...</div>, ssr: false }
  );

  return (
    <div>
      <ProductList />
      <Suspense fallback={<div>Loading cart...</div>}>
        <CartUI />
      </Suspense>
    </div>
  );
}
```

## Bundle Analysis Commands

Check bundle size improvements:

```bash
# Build and analyze
npm run build

# List chunk files (in .next/static/chunks/)
ls -lh .next/static/chunks/

# For detailed bundle analysis (future):
npm install --save-dev @next/bundle-analyzer
# Then update next.config.ts and re-run build
```

## Monitoring

After deployment to Vercel:

1. Check Core Web Vitals in Vercel Analytics
2. Monitor bundle size in deployment logs
3. Use Chrome DevTools Network tab to verify:
    - Cart code not loaded on homepage
    - Stripe code not loaded until checkout
    - No unnecessary dependencies in main bundle

## References

- Next.js Bundle Analysis: https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer
- Package Import Optimization: https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports
- Code Splitting: https://nextjs.org/docs/app/building-your-application/optimizing/dynamic-imports
