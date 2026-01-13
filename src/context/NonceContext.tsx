'use client';

/**
 * NonceContext
 *
 * Provides the Content Security Policy (CSP) nonce from middleware to client components.
 *
 * ## Purpose
 * The nonce is a cryptographically random token generated per-request by middleware and
 * used to whitelist specific inline scripts and styles. This allows strict CSP policies
 * while still supporting inline content when necessary.
 *
 * ## Lifecycle
 * 1. Middleware generates a unique nonce for each request
 * 2. Nonce is included in the Content-Security-Policy header
 * 3. Nonce is passed via x-nonce header to the root layout
 * 4. Root layout provides nonce to PublicLayoutWrapper
 * 5. NonceProvider makes nonce available to all child components via context
 * 6. Components use useNonce() hook to access the nonce value
 *
 * ## Security Note
 * The nonce must be unique per request and cryptographically random to be effective.
 * Do not cache or reuse nonces across requests, as this defeats the security purpose.
 *
 * @example
 * // In a client component that needs to render inline scripts
 * function MyComponent() {
 *   const nonce = useNonce();
 *   return <Script nonce={nonce} src="https://example.com/script.js" />;
 * }
 */

import { createContext, useContext } from 'react';

interface NonceContextType {
    nonce?: string;
}

const NonceContext = createContext<NonceContextType>({
    nonce: undefined,
});

/**
 * Hook to access the CSP nonce in client components
 */
export function useNonce(): string | undefined {
    const context = useContext(NonceContext);
    return context.nonce;
}

interface NonceProviderProps {
    nonce?: string;
    children: React.ReactNode;
}

/**
 * Provider component that makes the CSP nonce available to child components.
 * This component bridges the server/client boundary, receiving the nonce from
 * a Server Component and making it available to Client Components via context.
 */
export function NonceProvider({ nonce, children }: NonceProviderProps) {
    return (
        <NonceContext.Provider value={{ nonce }}>
            {children}
        </NonceContext.Provider>
    );
}
