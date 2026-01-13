'use client';

/**
 * NonceContext
 *
 * Provides the CSP nonce from middleware to client components that need it.
 * The nonce is used for inline scripts and styles to comply with Content Security Policy.
 *
 * Usage:
 * ```tsx
 * const nonce = useNonce();
 * <Script nonce={nonce} ... />
 * ```
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
