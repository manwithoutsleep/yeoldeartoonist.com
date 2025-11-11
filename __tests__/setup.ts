import { afterAll, beforeAll, vi } from 'vitest';
import React from 'react';
import { act as reactAct } from 'react';
// Extend vitest's expect with DOM matchers like toBeInTheDocument()
import '@testing-library/jest-dom';

// Polyfill for React 19 act() compatibility with testing-library
// See: https://github.com/testing-library/react-testing-library/issues/1214
if (typeof React.act === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).React = { ...React, act: reactAct };
}

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SITE_NAME = 'Ye Olde Artoonist';
process.env.CART_SESSION_SECRET = 'test-secret-32-character-minimum';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            pathname: '/',
            query: {},
            asPath: '/',
        };
    },
    usePathname() {
        return '/';
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
    __esModule: true,
    default: (
        props: React.ImgHTMLAttributes<HTMLImageElement> & {
            fill?: boolean;
            priority?: boolean;
            loading?: string;
            sizes?: string;
        }
    ) => {
        // Remove Next.js-specific props that aren't valid HTML attributes
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fill, priority, loading, sizes, ...imgProps } = props;
        return React.createElement('img', imgProps);
    },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
    __esModule: true,
    default: function DynamicLink(props: {
        children: React.ReactNode;
        href: string;
        [key: string]: unknown;
    }) {
        const { children, href, ...otherProps } = props;
        return React.createElement('a', { href, ...otherProps }, children);
    },
}));

// Suppress console errors in tests (optional, remove if you want to see them)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: Parameters<typeof console.error>) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render') ||
                args[0].includes(
                    'Not implemented: HTMLFormElement.prototype.submit'
                ))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
