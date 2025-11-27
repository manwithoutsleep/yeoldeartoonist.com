import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import React from 'react';
// Extend vitest's expect with DOM matchers like toBeInTheDocument()
import '@testing-library/jest-dom';

// Global cleanup after each test to prevent memory accumulation
afterEach(() => {
    // Clear all mocks to prevent call history accumulation across 1200+ tests
    vi.clearAllMocks();

    // Clean up any DOM elements not properly unmounted
    // Only run in browser-like environments (jsdom), not in node environment tests
    if (typeof document !== 'undefined') {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    }
});

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

// Mock global fetch to prevent real network requests that can cause test hangs
// Tests that don't explicitly mock fetch will fail fast with clear error instead of hanging
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Unmocked fetch call detected' }),
        text: () => Promise.resolve('Unmocked fetch call detected'),
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        clone: vi.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.reject(new Error('Unmocked fetch')),
        blob: () => Promise.reject(new Error('Unmocked fetch')),
        formData: () => Promise.reject(new Error('Unmocked fetch')),
        bytes: () => Promise.reject(new Error('Unmocked fetch')),
    } as Response)
) as unknown as typeof fetch;

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

// Suppress console errors in tests using vi.spyOn for safer cleanup
// This approach guarantees cleanup even if tests crash before afterAll runs
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
    consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation((...args) => {
            if (
                typeof args[0] === 'string' &&
                (args[0].includes('Warning: ReactDOM.render') ||
                    args[0].includes(
                        'Not implemented: HTMLFormElement.prototype.submit'
                    ))
            ) {
                return;
            }
            // Still log important errors to stderr for debugging
            process.stderr.write(args.join(' ') + '\n');
        });
});

afterAll(() => {
    consoleErrorSpy.mockRestore();
});
